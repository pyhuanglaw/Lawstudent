"""CC-C（帳號 C）11-04：BUG-WZFLICKER 疊面閃爍錄影（LAWWW-C 13:50；原本等使用者 iPhone，改在使用者電腦 GPU 看——**Windows＋GPU（Playwright 有視窗）≠ iPhone**，判定照舊 BB）。
  三處：①溫州街新增店面的牆（通往 wz_* 店家的每個門口＋BUG-WZFLICKER-2 記的 x 10.35、41.4、−4.3）
        ②書店的書架——舊路書房 11-04 已被頁間書屋取代（src/data/yejian_layout.js 第 1 行），bookstore 區域現在是頁間書屋：拍北牆整面書牆
        ③總圖大廳電梯地板（library_hall；遊戲裡找電梯的呼叫點和車廂地板）
  每一處 12 秒：鏡頭慢慢左右轉（±12°）、同時往前推近（6 m → 3 m），E.cinematic 一格一格放（不是玩家操作，只為了看會不會閃）；
  整段錄影（Playwright record_video，webm，video/ 底下）＋每秒一張連拍（<處>_<段>_NN.jpg）。印每一段開始的秒數，對影片用。
  [前置／捷徑] 讀檔到各區域（條件事件關閉）、路人與玩家藏起來、HUD 藏起來。只錄、不判（BB 判有沒有面在閃）。
用法：LW_TESTS=<wt>/tests [PARTS=wz,book,lift] [HOUR=14] python3 cc_flicker_rec_probe.py <url> <out>"""
import os, sys, json, asyncio, time, math
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(HERE, '..', '..', '..', '..', 'tests'))
import playlib as L
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
J = lambda o: json.dumps(o, ensure_ascii=False)
PARTS = [p.strip() for p in (os.environ.get('PARTS') or 'wz,book,lift').split(',') if p.strip()]
HOUR = float(os.environ.get('HOUR') or 14)
EXTRA_WZ_X = [10.35, 41.4, -4.3]   # BUG-WZFLICKER-2：x 10.35 二樓招牌×亮燈窗、x 41.4 店面玻璃×窗框、x −4.3 金屬條
STEPS, DT = 48, 250                # 48 格 × 0.25 秒＝12 秒
FAILS = []
T0 = time.time()


def check(name, ok, info=''):
    print(('PASS ' if ok else 'FAIL ') + name + (('  ' + info) if info else ''), flush=True)
    if not ok: FAILS.append(name)
    return ok


HUD = """(on=>{ for(const id of ['hud','hudR','minimap','ctlR','joy','interact','toast']){ const e=document.getElementById(id); if(e) e.style.visibility=on?'':'hidden'; } })"""
HIDE_PEOPLE = """(()=>{ const E=GAME.E; if(E.player&&E.player.obj) E.player.obj.visible=false; for(const n of (E.npcs||[])) if(n&&n.obj) n.obj.visible=false; for(const x of (E.extras||[])) if(x&&x.obj) x.obj.visible=false; return true; })()"""
SET_CAM = """(([e,l])=>{ const E=GAME.E; E.cinematic(new THREE.Vector3(...e),new THREE.Vector3(...l)); E.camera.position.set(...e); E.cam.look=new THREE.Vector3(...l); E.camera.lookAt(E.cam.look); return true; })"""
WZ_DOORS = """(()=>GAME.E.interactables.filter(i=>!i.hidden&&i.exit&&/^wz_/.test(i.exit.to||'')).map(i=>({x:+(+i.x).toFixed(2),z:+(+i.z).toFixed(2),label:i.label,to:i.exit.to})))()"""
LIFT_JS = r"""(()=>{ const E=GAME.E, V=THREE.Vector3; const it=E.interactables.find(i=>!i.hidden&&/電梯/.test(i.label||''));
  let best=null; E.zone.group.traverse(o=>{ if(!o.isMesh) return; const nm=(o.name||'')+' '+((o.material&&o.material.name)||''); if(!/elev|lift|電梯|car_floor|cab/i.test(nm)) return; const b=new THREE.Box3().setFromObject(o); if(b.isEmpty()) return; const s=b.getSize(new V()); if(s.x>4||s.z>4) return;
    const c=b.getCenter(new V()); if(!best||b.min.y<best.minY) best={name:o.name||'(無名)', mat:(o.material&&o.material.name)||null, c:[+c.x.toFixed(2),+c.y.toFixed(2),+c.z.toFixed(2)], minY:+b.min.y.toFixed(2), size:[+s.x.toFixed(2),+s.y.toFixed(2),+s.z.toFixed(2)]}; });
  return {call:it?{x:+(+it.x).toFixed(2),z:+(+it.z).toFixed(2),label:it.label}:null, floor:best}; })()"""


async def load_zone(pg, cdp, zone, x, z, yaw=math.pi):
    print('  [前置／捷徑] 讀檔：%s (%s, %s)、%02d:00、條件事件關閉' % (zone, x, z, int(HOUR)), flush=True)
    await L.load_state(pg, {'zone': zone, 'hour': HOUR, 'day': 7, 'weekday': 2, 'weather': 'clear', 'pos': {'x': x, 'z': z, 'yaw': yaw, 'lv': 0}}, quiet_events=True)
    js = "(()=>{ let n=0; const z=GAME.E.zone; if(z&&z.group) z.group.traverse(o=>{ if(o.isMesh) n++; }); return n; })()"
    last = -1; st = 0; t1 = time.time()
    while time.time() - t1 < 90:
        await pg.wait_for_timeout(1000); n = await pg.evaluate(js)
        if n == last: st += 1
        else: st = 0; last = n
        if st >= 4: break
    ok = await pg.evaluate("GAME.G.zone===%s" % J(zone))
    check('[%s] 讀檔進到區域（場景 mesh %s）' % (zone, last), ok, '')
    await pg.evaluate(HIDE_PEOPLE); await pg.evaluate(HUD + '(false)')
    return ok


async def sweep(pg, tag, target, start_d, end_d, yaw0, height=1.6, look_h=None, look_dy=0.0):
    """鏡頭從 target 的 yaw0 方向 start_d 公尺推近到 end_d，同時左右轉 ±12°；每秒一張連拍"""
    tx, ty, tz = target
    print('  [%s] 開始（第 %.1f 秒）：看 %s、從 %.1f m 推到 %.1f m' % (tag, time.time() - T0, J(target), start_d, end_d), flush=True)
    for i in range(STEPS):
        f = i / (STEPS - 1); d = start_d + (end_d - start_d) * f; a = yaw0 + math.radians(12) * math.sin(f * 2 * math.pi)
        e = [tx + math.sin(a) * d, height, tz + math.cos(a) * d]; l = [tx, look_h if look_h is not None else ty, tz + look_dy]
        await pg.evaluate(SET_CAM + '(%s)' % J([[round(v, 3) for v in e], [round(v, 3) for v in l]]))
        await pg.wait_for_timeout(DT)
        if i % 4 == 0: await pg.screenshot(path=os.path.join(OUT, '%s_%02d.jpg' % (tag, i // 4)), type='jpeg', quality=70)   # 每秒一張（JPEG：runner 的 PNG 額度 25 MB）


async def part_wz(pg, cdp):
    print('== ① 溫州街新增店面的牆', flush=True)
    if not await load_zone(pg, cdp, 'wenzhou', 0.0, 0.0, 0.0): return
    doors = await pg.evaluate(WZ_DOORS)
    print('  通往店家的門口：%s' % J(doors), flush=True)
    spots = [(d['to'] + '_door', d['x'], d['z']) for d in doors]
    for x in EXTRA_WZ_X:   # 沒有門口的那三處：店面在北側（z −6 左右）
        near = min(doors, key=lambda d: abs(d['x'] - x)) if doors else None
        spots.append(('x%s' % str(x).replace('.', '_').replace('-', 'm'), x, near['z'] if near and abs(near['x'] - x) < 8 else -5.0))
    for name, x, z in spots:
        side = 1.0 if z < 0 else -1.0   # 店面在北（z<0）就從南邊（街上）看
        await sweep(pg, 'wz_%s' % name, (x, 2.2, z), 6.5, 3.0, 0.0 if side > 0 else math.pi, height=1.7)


async def part_book(pg, cdp):
    print('== ② 書店的書架（頁間書屋，取代舊路書房）', flush=True)
    if not await load_zone(pg, cdp, 'bookstore', -4.6, 4.1): return
    for name, x in (('west', -3.0), ('mid', 0.5), ('east', 3.5)):
        await sweep(pg, 'book_%s' % name, (x, 1.7, -4.6), 4.2, 1.8, 0.0, height=1.55)


async def part_lift(pg, cdp):
    print('== ③ 總圖大廳電梯地板', flush=True)
    if not await load_zone(pg, cdp, 'library_hall', 0.0, 6.6): return
    lf = await pg.evaluate(LIFT_JS)
    print('  電梯：%s' % J(lf), flush=True)
    if not check('[lift] 找得到電梯（呼叫點或車廂網格）', bool(lf.get('call') or lf.get('floor')), J(lf)): return
    if lf.get('floor'): fx, fy, fz = lf['floor']['c'][0], lf['floor']['minY'], lf['floor']['c'][2]
    else: fx, fy, fz = lf['call']['x'], 0.0, lf['call']['z']
    yaw0 = math.atan2(lf['call']['x'] - fx, lf['call']['z'] - fz) if lf.get('call') and lf.get('floor') else 0.0
    await sweep(pg, 'lift_floor', (fx, fy, fz), 3.2, 1.4, yaw0, height=1.7, look_h=fy + 0.02)
    await sweep(pg, 'lift_floor_low', (fx, fy, fz), 2.2, 1.0, yaw0 + 0.4, height=1.0, look_h=fy + 0.02)


async def main():
    os.makedirs(OUT, exist_ok=True); vdir = os.path.join(OUT, 'video'); os.makedirs(vdir, exist_ok=True)
    print('CC BUG-WZFLICKER 錄影 %s；SHA=%s；%02d:00；Windows＋GPU（Playwright 有視窗）≠ iPhone' % (','.join(PARTS), os.environ.get('SHA', '?'), int(HOUR)), flush=True)
    async with async_playwright() as p:
        b, ctx0, pg0, cdp0, errs0 = await L.launch(p, landscape=True)   # 用同一支瀏覽器（PC 上 gpu_wrap 給的 GPU 設定），另外開一個會錄影的 context
        await ctx0.close()
        ctx = await b.new_context(viewport={'width': 844, 'height': 390}, device_scale_factor=1, record_video_dir=vdir, record_video_size={'width': 844, 'height': 390})
        pg = await ctx.new_page(); cdp = await ctx.new_cdp_session(pg); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        t0 = time.time(); await pg.goto(URL); ok = await L.wait_loaded(pg); check('遊戲載入', ok, '%.1f 秒' % (time.time() - t0))
        if ok:
            await pg.evaluate("localStorage.clear(); if(typeof STORY!=='undefined') STORY.phoneAuto=()=>{}")
            for part, fn in (('wz', part_wz), ('book', part_book), ('lift', part_lift)):
                if part not in PARTS: continue
                try: await fn(pg, cdp)
                except Exception as e: check('[%s] 探針沒有例外' % part, False, repr(e)[:300])
        check('沒有 JS 例外', not errs, J(errs[:3]))
        vpath = None
        try: vpath = await pg.video.path() if pg.video else None
        except Exception: pass
        await ctx.close(); await b.close()
    print('INFO 影片：%s' % (os.path.relpath(vpath, OUT) if vpath else '（沒有）'), flush=True)
    print('ALL PASS' if not FAILS else 'FAILED %d: %s' % (len(FAILS), '；'.join(FAILS)), flush=True)
    sys.exit(1 if FAILS else 0)

asyncio.run(main())
