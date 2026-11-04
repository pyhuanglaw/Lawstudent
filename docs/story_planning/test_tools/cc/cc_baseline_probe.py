"""CC-C（帳號 C）11-04：截圖基準試點（使用者 14:2x「你自己判斷決定」；CC_50 第 37～38 條；試點，不判 PASS／FAIL，判定 BB）。
  目的：同一個 SHA、同一個鏡頭，跑兩次的截圖要一模一樣；這樣換 SHA 以後的差才是真的改動，不是雜訊。
  DET=1（預設）＝固定住會變的東西：
    1. 遊戲載入前就把 Math.random 換成固定種子（mulberry32，SEED 預設 20261104），每張截圖前重設種子；
    2. 路人、騎車的路人、玩家、HUD 藏起來（同 cc_wz_slice_probe）；
    3. 每張截圖前停掉主迴圈（E.paused），遊戲時刻 G.hour／E.hour 設回 HOUR、E.applyTime，E.time（天空、風吹樹的 shader 時間）設成 100，
       晚上的影子強制重算（E._shT=0），手動 E.update(1/60) 三次、鏡頭擺好、E.render() 一次，再截圖。
  DET=0＝照 cc_wz_slice_probe 的做法（主迴圈照跑、等 5 幀），用來量「沒有固定住」時兩次的雜訊有多大。
  【捷徑】讀檔指定地點時間（條件事件關閉）、固定鏡頭（E.cinematic）、停主迴圈手動畫一幀——這不是玩家看到的流程，只用來比畫面。
  SwiftShader（雲端）／Windows＋GPU（電腦）≠ iPhone。兩次結果的逐像素差用 cc_baseline_diff.py 算（雲端，有 PIL）。
用法：LW_TESTS=<wt>/tests [SET=wz,gg] [STATIONS=24,44] [DIRS=4] [HOUR=14] [DET=1] [SEED=...] python3 cc_baseline_probe.py <url> <out>"""
import os, sys, json, asyncio, time, math, hashlib, datetime
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(HERE, '..', '..', '..', '..', 'tests'))
import playlib as L
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
J = lambda o: json.dumps(o, ensure_ascii=False)
SETS = [s.strip() for s in (os.environ.get('SET') or 'wz,gg').split(',') if s.strip()]
STATIONS = [float(x) for x in (os.environ.get('STATIONS') or '24,44').split(',') if x.strip()]   # 溫州街東段（x 往東、街心 z 0；同 cc_wz_slice_probe）
DIRS = int(os.environ.get('DIRS') or 4)
HOUR = float(os.environ.get('HOUR') or 14)
DET = os.environ.get('DET', '1') == '1'
SEED = int(os.environ.get('SEED') or 20261104)
CLOCK = os.environ.get('CLOCK', '1') == '1' and DET   # Playwright page.clock：載入時照常走，每張截圖前停在固定時刻（區域動畫有的照 performance.now 動）
T_BASE = datetime.datetime(2026, 1, 1, 0, 0, 0)
FAILS = []
# 公館：南側店面街（玩家出生點 (-30,14) 一帶；cc_gg_reentry_probe 的 SPAWN）
GG_STATIONS = [(-30.0, 14.0), (0.0, 14.0)]
ZONES = {'wz': ('wenzhou', [(x, 0.0) for x in STATIONS]), 'gg': ('gongguan', GG_STATIONS)}


def check(name, ok, info=''):
    print(('PASS ' if ok else 'FAIL ') + name + (('  ' + info) if info else ''), flush=True)
    if not ok: FAILS.append(name)
    return ok


SEED_INIT = """(()=>{ let s=%d>>>0; const f=function(){ s=(s+0x6D2B79F5)>>>0; let t=s; t=Math.imul(t^(t>>>15),t|1); t^=t+Math.imul(t^(t>>>7),t|61); return ((t^(t>>>14))>>>0)/4294967296; };
  Math.random=f; window.__ccSeed=n=>{ s=n>>>0; return true; }; window.__ccSeeded=true; })();""" % SEED
HUD = """(on=>{ for(const id of ['hud','hudR','minimap','ctlR','joy','interact','toast']){ const e=document.getElementById(id); if(e) e.style.visibility=on?'':'hidden'; } })"""
HIDE = """(()=>{ const E=GAME.E; let n=0; if(E.player&&E.player.obj) E.player.obj.visible=false; for(const q of (E.npcs||[])) if(q&&q.obj){ q.hidden=true; q.obj.visible=false; n++; } for(const x of (E.extras||[])) if(x&&x.obj&&!x.trees&&x.name!=='treeFieldExtra'){ x.hidden=true; x.obj.visible=false; if(x.update&&!x.update.__ccHide){ const u=x.update; x.update=function(dt){ const r=u.apply(this,arguments); if(this.hidden&&this.obj) this.obj.visible=false; return r; }; x.update.__ccHide=true; } n++; } return n; })()"""
MESHN = "(()=>{ let n=0; const z=GAME.E.zone; if(z&&z.group) z.group.traverse(o=>{ if(o.isMesh) n++; }); return n; })()"
# DET=1：停主迴圈、時刻和 shader 時間設回固定值、重設種子、手動走三格、畫一幀
AIM_DET = """(([e,l,h,seed])=>{ const E=GAME.E, G=GAME.G; E.paused=true; window.__ccSeed(seed); G.hour=h; E.hour=h; if(E.applyTime) E.applyTime(h); E.time=100; E._shT=0;
  E.cinematic(new THREE.Vector3(...e),new THREE.Vector3(...l));
  for(let i=0;i<3;i++){ E.update(1/60); E.camera.position.set(...e); E.cam.look=new THREE.Vector3(...l); E.camera.lookAt(E.cam.look); E.camera.updateMatrixWorld(); }
  E._shT=0; E.render(); const ri=E.renderer.info.render; return {calls:ri.calls, tris:ri.triangles, time:E.time, hour:G.hour, frame:E.frame}; })"""
# DET=0：同 cc_wz_slice_probe（主迴圈照跑、等 5 幀）
AIM_LIVE = """(async([e,l])=>{ const E=GAME.E; E.paused=false; E.cinematic(new THREE.Vector3(...e),new THREE.Vector3(...l)); E.camera.position.set(...e); E.cam.look=new THREE.Vector3(...l); E.camera.lookAt(E.cam.look);
  const f0=E.frame; for(let i=0;i<240&&E.frame<f0+5;i++) await new Promise(r=>setTimeout(r,200)); const ri=E.renderer.info.render; return {calls:ri.calls, tris:ri.triangles, time:E.time, hour:GAME.G.hour, frame:E.frame}; })"""


async def stable(pg, cap=150):
    last = -1; st = 0; t1 = time.time()
    while time.time() - t1 < cap:
        await pg.wait_for_timeout(1000); n = await pg.evaluate(MESHN)
        if n == last: st += 1
        else: st = 0; last = n
        if st >= 5: break
    return last, time.time() - t1


async def main():
    os.makedirs(OUT, exist_ok=True)
    print('CC 截圖基準試點：SET=%s、%02d:00、DET=%s、SEED=%d；SHA=%s；SwiftShader／Windows＋GPU ≠ iPhone' % (SETS, int(HOUR), int(DET), SEED, os.environ.get('SHA', '?')), flush=True)
    res = {}
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        if DET: await pg.add_init_script(SEED_INIT)
        clock_on = False
        if CLOCK:
            try:
                await pg.clock.install(time=T_BASE); clock_on = True
            except Exception as e:   # 舊版 Playwright 沒有 page.clock（1.45 起才有）：照樣跑，報告寫明
                print('INFO 這台的 Playwright 沒有 page.clock（%s）：這一輪沒有固定時鐘' % (repr(e)[:80],), flush=True)
        print('  [前置／捷徑] 固定時鐘（page.clock）：%s' % ('開' if clock_on else '關'), flush=True)
        nshot = 0
        t0 = time.time(); await pg.goto(URL); ok = await L.wait_loaded(pg); check('遊戲載入', ok, '%.1f 秒' % (time.time() - t0))
        if not ok:
            await b.close(); print('FAILED 1: 遊戲載入', flush=True); sys.exit(1)
        if DET: check('固定種子的 Math.random 在遊戲載入前就換上', await pg.evaluate("window.__ccSeeded===true"), '')
        await pg.evaluate("localStorage.clear(); if(typeof STORY!=='undefined') STORY.phoneAuto=()=>{}")
        for key in SETS:
            zone, sts = ZONES[key]
            if DET: await pg.evaluate("window.__ccSeed(%d)" % SEED)   # 讀檔前也重設：讀檔時放的路人、機車、停車用同一串亂數
            print('  [前置／捷徑] 讀檔：%s (%s, %s)、2025-09-23（二）%02d:00、晴、條件事件關閉' % (zone, sts[0][0], sts[0][1], int(HOUR)), flush=True)
            await pg.evaluate("GAME.E.paused=false")
            await L.load_state(pg, {'zone': zone, 'hour': HOUR, 'day': 7, 'weekday': 2, 'weather': 'clear', 'pos': {'x': sts[0][0], 'z': sts[0][1], 'yaw': 0, 'lv': 0}}, quiet_events=True)
            n, sec = await stable(pg)
            check('讀檔進到 %s（場景 mesh %s、%.0f 秒穩定）' % (zone, n, sec), await pg.evaluate("GAME.G.zone===%s" % J(zone)), '')
            await L.close_panels(pg, cdp)
            hid = await pg.evaluate(HIDE); await pg.evaluate(HUD + '(false)')
            print('  藏起來的路人／騎車的路人：%d' % hid, flush=True)
            for sx, sz in sts:
                for k in range(DIRS):
                    a = k * 2 * math.pi / DIRS; e = [sx, 1.6, sz]; l = [round(sx + math.sin(a) * 10, 3), 1.6, round(sz + math.cos(a) * 10, 3)]
                    await pg.evaluate(HIDE)
                    if DET:
                        nshot += 1
                        if clock_on: await pg.clock.pause_at(T_BASE + datetime.timedelta(hours=nshot))
                        ri = await pg.evaluate(AIM_DET + '(%s)' % J([e, l, HOUR, SEED + k]))
                    else:
                        ri = await pg.evaluate(AIM_LIVE + '(%s)' % J([e, l])); await pg.wait_for_timeout(300)
                    name = 'base_%s_x%d_z%d_d%03d' % (key, int(sx), int(sz), round(k * 360 / DIRS))
                    png = await pg.screenshot(path=os.path.join(OUT, name + '.png'))
                    res[name] = dict(ri, cam=e, look=l, png_sha1=hashlib.sha1(png).hexdigest()[:12], pnow=await pg.evaluate('performance.now()'))
                    print('  %s：calls %s、tris %s、E.time %.2f、時刻 %.3f、sha1 %s' % (name, ri['calls'], ri['tris'], ri['time'], ri['hour'], res[name]['png_sha1']), flush=True)
            if clock_on: await pg.clock.resume()
            await pg.evaluate("GAME.E.paused=false"); await pg.evaluate(HUD + '(true)')
        check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    json.dump({'det': DET, 'seed': SEED, 'hour': HOUR, 'clock': clock_on, 'shots': res}, open(os.path.join(OUT, 'baseline.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('ALL PASS' if not FAILS else 'FAILED %d: %s' % (len(FAILS), '；'.join(FAILS)), flush=True)
    sys.exit(1 if FAILS else 0)

asyncio.run(main())
