"""CC（帳號 A）11-04：X210 公館校門口斑馬線＋遠景（LAWWW2 GG-ZEBRA-FOG-1104 305ef2d2a → 開發分支 9ac863212；BB 04:35）。
  9ac863212 改的（src/zones3d.js）：
    :778  公館區域 zebraMesh(34.2,12)、rotation.z=π/2、位置 (0, 0.034, −13.5)＝x −6～6、z −30.6～3.6（北側人行道 z −31 到南側人行道 z 4）；名字 'zebra'
    :449  校園遠景（campusBackdrop）同一條：zebraMesh(34.2,12) 在 (−156.5, 0.03, 0)＝校園 x −173.6～−139.4、z −6～6（公館 (gx,gz) → 校園 (−170−gz, gx)）
    :771  公館 viewFar 240、fogNear 90（之前沒設：照畫質預設，霧 near 40）
    :1384 zebraMesh()（PlaneGeometry、TK.tex('zebra')、mesh.name='zebra'）
  公館座標：+x＝南、−z＝東（sunYaw π/2）；校門 placeGate(…,0,−46)（:781），兩側通道 lanes ±5.27（campuskit3d.js:196），校門外人行道 z −45～−31、
    羅斯福路車道線 z −25～−2、南側人行道 z 4～20、店面立面／騎樓 z 19～22；區域 x −80～80。校園那一側的校門在校園 (−124, 0)，出生點 (−119, 0)。
CASES=shot（預設）：15:00、20:00 各三張（【捷徑：拍照】E.cinematic、眼睛 1.7 m、藏 HUD、藏玩家）
    gate_east：公館南側人行道 (0, 1.7, 8) 往東（−z）看校門，斑馬線在腳前；
    gate_west：公館校門外人行道 (0, 1.7, −36) 往西（+z）看過斑馬線到對面店面與更遠處；
    gate_out ：校園那一側、校門南通道裡 (−118.5, 1.7, 5.27) 往外（−x）看校園遠景的羅斯福路與斑馬線。
  判定（INFO，寫進 shots.json）：斑馬線網格的世界 bbox（公館要在 x −6～6）；每張截圖天空以下那一段（畫面高 35%～50%）的平均亮度、標準差（標準差 < 10 且平均 > 170 記「像一片霧白」）；
    fog near/far、E.fogFar、區域 viewFar／fogNear、camera.far、畫質。23eaaa7ae（之前）沒有斑馬線：記 INFO，不算 FAIL。
CASES=walk：【前置】讀檔到公館校門外人行道 (0, −34) 15:00（條件事件、手機自動打開關閉）。之後全部用搖桿（#joy，CDP 觸控）：
    A 過斑馬線 (0,−34) → (0,8)；B 沿南側人行道往西每 12 m 一點到 x −72；C 再往東走到 x +72（點的 z 從 10 附近找人物站得住的格子，nav.clear 0.45 m）。
    每一段走不到、連續 6 次推搖桿總共前進不到 0.3 m（卡住）、walkFallbacks 增加、第一次推不動、JS 例外：FAIL。每段結束截一張 walk_<段>.png。
只有載入失敗、JS 例外、（walk）走不到／卡住算 FAIL；shot 的數字只記錄（判定 BB）。
用法：LW_TESTS=<wt>/tests CASES=shot|walk|shot,walk python3 cc_gate_probe.py <url> <out>"""
import os, sys, json, asyncio, time, math
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..', 'tests'))
import playlib as L
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
J = lambda o: json.dumps(o, ensure_ascii=False)
CASES = [c for c in (os.environ.get('CASES') or 'shot').split(',') if c in ('shot', 'walk')]
VIEWS = {   # name: (zone, 讀檔位置, eye, look)
    'east': ('gongguan', {'x': 0, 'z': 8, 'yaw': 0}, [0, 1.7, 8], [0, 1.6, -46]),
    'west': ('gongguan', {'x': 0, 'z': -36, 'yaw': 3.1416}, [0, 1.7, -36], [0, 4.0, 40]),
    'out': ('campus', {'x': -119, 'z': 0, 'yaw': -1.5708}, [-118.5, 1.7, 5.27], [-175, 2.5, 5.27]),
}
FAILS = []


def check(name, ok, info=''):
    print(('PASS ' if ok else 'FAIL ') + name + (('  ' + info) if info else ''), flush=True)
    if not ok: FAILS.append(name)


def info(name, txt):
    print('INFO ' + name + '  ' + txt, flush=True)


AIM = """(async(e,l)=>{ const E=GAME.E; if(E.player&&E.player.obj) E.player.obj.visible=false;
  E.cinematic(new THREE.Vector3(...e),new THREE.Vector3(...l)); E.camera.position.set(...e); E.cam.look=new THREE.Vector3(...l); E.camera.lookAt(E.cam.look);
  const f0=E.frame; for(let i=0;i<240&&E.frame<f0+6;i++) await new Promise(r=>setTimeout(r,250)); return true; })"""
HUD = """(on=>{ const c=GAME.E.renderer.domElement; const keep=new Set(); for(let n=c;n;n=n.parentElement) keep.add(n);
  document.querySelectorAll('body *').forEach(el=>{ if(keep.has(el)||c.contains(el)) return; if(el.parentElement&&keep.has(el.parentElement)){ if(on){ if(el.dataset.ccVis!==undefined){ el.style.visibility=el.dataset.ccVis; delete el.dataset.ccVis; } } else { el.dataset.ccVis=el.style.visibility||''; el.style.visibility='hidden'; } } }); })"""
SCENEINFO = """(()=>{ const E=GAME.E, z=E.zone, g=z&&z.group, zd=z&&z.def, f=E.scene.fog;
  const zb=[]; if(g) g.traverse(o=>{ if(o.isMesh&&o.name==='zebra'){ const b=new THREE.Box3().setFromObject(o); let v=true; for(let n=o;n;n=n.parent) if(!n.visible) v=false;
    zb.push({min:b.min.toArray().map(x=>+x.toFixed(2)), max:b.max.toArray().map(x=>+x.toFixed(2)), visible:v}); } });
  return {zone:GAME.G.zone, zebra:zb, fog:f?{near:f.near, far:f.far}:null, fogFar:E.fogFar, zone_viewFar:zd&&zd.viewFar||null, zone_fogNear:zd&&zd.fogNear||null,
    camera_far:E.camera.far, quality:E.q&&E.q.level, weather:E.weather, hour:+GAME.G.hour.toFixed(2)}; })()"""
WAYPT = """(([x,zp,z0,z1])=>{ const n=GAME.E.nav; const cand=[]; for(let z=z0;z<=z1+1e-6;z+=0.25) cand.push(z); cand.sort((a,b)=>Math.abs(a-zp)-Math.abs(b-zp));
  for(const z of cand) if(n.clear(x,z,0.45)) return [x,+z.toFixed(2)]; return null; })"""


def band_stats(png):
    from PIL import Image, ImageStat
    im = Image.open(png).convert('L'); W, H = im.size
    far = ImageStat.Stat(im.crop((0, int(H * 0.35), W, int(H * 0.50))))
    sky = ImageStat.Stat(im.crop((0, 0, W, int(H * 0.25))))
    m, s = far.mean[0], far.stddev[0]
    return {'far_band_mean': round(m, 1), 'far_band_std': round(s, 1), 'sky_mean': round(sky.mean[0], 1), 'sky_std': round(sky.stddev[0], 1),
            'washed_out': bool(s < 10 and m > 170)}


async def load(pg, zone, pos, hour, tag):
    print('  [前置／捷徑] 讀檔到 %s (%s, %s) %s，條件事件關閉' % (zone, pos['x'], pos['z'], tag), flush=True)
    await L.load_state(pg, {'zone': zone, 'hour': hour, 'pos': pos, 'weather': 'clear'}, quiet_events=True)
    for _ in range(120):
        if await pg.evaluate("!!(GAME.E.zone&&GAME.E.zone.group&&GAME.G.zone===%s)" % J(zone)): break
        await pg.wait_for_timeout(250)
    await pg.wait_for_timeout(4000)   # 正式模型（公館店面 GLB 等）載入


async def case_shot(pg):
    res = {}
    for hour, when in ((15.0, 'day'), (20.0, 'night')):
        for v, (zone, pos, eye, look) in VIEWS.items():
            await load(pg, zone, pos, hour, '%s %.0f:00' % (when, hour))
            if zone == 'gongguan':
                for _ in range(240):
                    if await pg.evaluate("!!GAME.E.zone.group.children.find(o=>o.name==='gongguan_shops_glb')"): break
                    await pg.wait_for_timeout(250)
            await pg.evaluate(AIM + '(%s,%s)' % (J(eye), J(look)))
            await pg.evaluate(HUD + '(false)'); await pg.wait_for_timeout(600)
            fn = os.path.join(OUT, 'gate_%s_%s.png' % (v, when))
            await pg.screenshot(path=fn)
            await pg.evaluate(HUD + '(true)')
            si = await pg.evaluate(SCENEINFO)
            try:
                si['image'] = band_stats(fn)
            except Exception as e:
                si['image'] = {'err': str(e)[:120]}
            if zone == 'gongguan':
                zb = si['zebra']
                si['zebra_ok_x_-6_6'] = bool(zb) and all(z['min'][0] >= -6.05 and z['max'][0] <= 6.05 for z in zb)
                info('%s %s：斑馬線' % (when, v), ('沒有 name=zebra 的網格（這一版還沒有斑馬線）' if not zb else J(zb)) + '；在 x −6～6：%s' % si['zebra_ok_x_-6_6'])
            else:
                info('%s %s：校園遠景的斑馬線' % (when, v), J(si['zebra']) if si['zebra'] else '沒有（這一版還沒有）')
            info('%s %s：霧／視距' % (when, v), J({k: si[k] for k in ('fog', 'fogFar', 'zone_viewFar', 'zone_fogNear', 'camera_far', 'quality', 'weather')}))
            info('%s %s：遠景亮度' % (when, v), J(si['image']) + ('  ← 像一片霧白' if si['image'].get('washed_out') else ''))
            res['%s_%s' % (v, when)] = si
            await pg.evaluate("(()=>{ const E=GAME.E; if(E.player&&E.player.obj) E.player.obj.visible=true; E.endCinematic&&E.endCinematic(); })()")
    return res


async def joy_to(pg, cdp, tx, tz, near, label, max_s=150):
    s = await L.state(pg); fb0 = s['fallbacks']; t0 = time.time(); hist = []; pushes = 0; first = None
    while time.time() - t0 < max_s:
        d = math.hypot(tx - s['x'], tz - s['z'])
        if d <= near: break
        if s.get('dlg') or s.get('paused'):
            info(label, '途中有對話或遊戲暫停：%s' % J({k: s.get(k) for k in ('dlg', 'dtext', 'paused')}))
            await L.close_panels(pg, cdp); await pg.wait_for_timeout(500)
        yaw = s['camYaw']; fx, fz = -math.sin(yaw), -math.cos(yaw); rx, rz = -fz, fx
        ux, uz = (tx - s['x']) / max(d, 0.01), (tz - s['z']) / max(d, 0.01)
        p0 = (s['x'], s['z'])
        await L.joystick(pg, cdp, int(32 * (ux * rx + uz * rz)), int(-32 * (ux * fx + uz * fz)), 700); pushes += 1
        s = await L.state(pg); mv = math.hypot(s['x'] - p0[0], s['z'] - p0[1])
        if first is None: first = mv
        hist.append(mv)
        if len(hist) >= 6 and sum(hist[-6:]) < 0.3:
            break
    d = math.hypot(tx - s['x'], tz - s['z'])
    out = {'label': label, 'target': [tx, tz], 'end': [s['x'], s['z']], 'dist_left': round(d, 2), 'pushes': pushes, 'secs': round(time.time() - t0, 1),
           'first_push_m': first and round(first, 2), 'stuck': len(hist) >= 6 and sum(hist[-6:]) < 0.3 and d > near, 'fallbacks_delta': s['fallbacks'] - fb0, 'stand': s.get('stand')}
    check('%s：走得到（離目標 %.2f m ≤ %.1f）' % (label, d, near), d <= near, J(out))
    check('%s：沒有卡住、walkFallbacks 沒增加' % label, not out['stuck'] and out['fallbacks_delta'] == 0, J({k: out[k] for k in ('stuck', 'fallbacks_delta', 'pushes', 'secs')}))
    return out


async def case_walk(pg, cdp):
    res = {'segments': []}
    print('  [前置] 讀檔到公館校門外人行道 (0, −34) 15:00（條件事件、手機自動打開關閉）；之後只用搖桿', flush=True)
    await L.load_state(pg, {'zone': 'gongguan', 'hour': 15.0, 'pos': {'x': 0, 'z': -34, 'yaw': 0}, 'weather': 'clear'}, quiet_events=True)
    await pg.wait_for_timeout(5000)
    s = await L.state(pg); res['start'] = s
    check('起點在公館', s['zone'] == 'gongguan', J({k: s[k] for k in ('zone', 'x', 'z', 'stand', 'fallbacks')}))
    if s['zone'] != 'gongguan': return res
    moved, k, s2 = await L.push_until(pg, cdp, 0, -32, 0.3, max_pushes=3, ms=900)
    check('搖桿推得動（第一次推）', moved >= 0.3, '%.2f m／%d 次' % (moved, k))
    seg = await joy_to(pg, cdp, 0, 8, 1.0, 'A 過斑馬線 (0,−34)→(0,8)')
    res['segments'].append(seg); await pg.screenshot(path=os.path.join(OUT, 'walk_A_crossed.png'))
    xs_w = list(range(-12, -73, -12)) + [-72]
    xs_e = list(range(-60, 73, 12)) + [72]
    for name, xs in (('B 往西', xs_w), ('C 往東', xs_e)):
        for x in xs:
            wp = await pg.evaluate(WAYPT + '(%s)' % J([x, 10.0, 5.0, 17.5]))
            if not wp:
                info('%s x=%s' % (name, x), 'z 5～17.5 找不到站得住的點，跳過'); continue
            seg = await joy_to(pg, cdp, wp[0], wp[1], 1.2, '%s → (%s, %s)' % (name, wp[0], wp[1]))
            res['segments'].append(seg)
            if seg['dist_left'] > 1.2: break
        await pg.screenshot(path=os.path.join(OUT, 'walk_%s_end.png' % name.split()[0]))
    s = await L.state(pg); res['end'] = s
    check('全程 walkFallbacks 沒增加', s['fallbacks'] == res['start']['fallbacks'], '%s → %s' % (res['start']['fallbacks'], s['fallbacks']))
    return res


async def main():
    os.makedirs(OUT, exist_ok=True)
    print('CC GATE 公館校門斑馬線＋遠景；SHA=%s；CASES=%s；Playwright（PC 有 GPU、有視窗），不是手機實機' % (os.environ.get('SHA', '?'), ','.join(CASES)), flush=True)
    out = {'sha': os.environ.get('SHA'), 'cases': CASES}
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        t0 = time.time(); await pg.goto(URL); ok = await L.wait_loaded(pg); boot = time.time() - t0
        check('遊戲載入', ok, '%.1f 秒' % boot); out['boot_s'] = round(boot, 1)
        if not ok:
            await b.close(); print('FAILED 1: 遊戲載入', flush=True); sys.exit(1)
        await pg.evaluate("localStorage.clear(); if(typeof STORY!=='undefined') STORY.phoneAuto=()=>{}")
        if 'shot' in CASES:
            out['shot'] = await case_shot(pg)
            json.dump(out, open(os.path.join(OUT, 'shots.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
        if 'walk' in CASES:
            out['walk'] = await case_walk(pg, cdp)
            json.dump(out, open(os.path.join(OUT, 'walk.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
        check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    print('ALL PASS' if not FAILS else 'FAILED %d: %s' % (len(FAILS), '；'.join(FAILS)), flush=True)
    sys.exit(1 if FAILS else 0)

asyncio.run(main())
