"""CC-C（帳號 C）11-04：WZ_SLICE_SHOTS（BB-C 14:14，v9.10.20 擋發布最後一批）——lane_east 減面是照面朝的方向把整段裁掉，確認轉鏡頭的時候不會有東西突然不見。
  溫州街東段 4 個站點 × 8 個方向（每 45° 一張），白天 14:00；【前置／捷徑】讀檔到溫州街（條件事件關閉）→ 等正式模型掛上 → 路人、騎車的路人、玩家藏起來（位置每次不同＝雜訊）、HUD 藏起來 →
  固定鏡頭（E.cinematic，眼睛高度 1.6 m、看 10 m 外）一張一張拍 slice_<站>_<方向>.png，記 renderer.info（calls、tris）。
  同一支在 0e2ca42d4（減面前）和 322cd967（減面後）各跑一輪；兩輪同一個鏡頭的逐像素差在雲端算（PC 沒有 PIL），列出差最大的 5 張，看是不是牆、店面整片不見（FAIL）。
  只截圖＋記數字，不判 PASS／FAIL（判定 BB）；Windows＋GPU（Playwright 有視窗）≠ iPhone。
用法：LW_TESTS=<wt>/tests [STATIONS=24,34,44,52] [HOUR=14] python3 cc_wz_slice_probe.py <url> <out>"""
import os, sys, json, asyncio, time, math
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(HERE, '..', '..', '..', '..', 'tests'))
import playlib as L
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
J = lambda o: json.dumps(o, ensure_ascii=False)
STATIONS = [float(x) for x in (os.environ.get('STATIONS') or '24,34,44,52').split(',') if x.strip()]   # 溫州街東段（x 往東；2:30 AM 在 x 54）、街心 z 0
HOUR = float(os.environ.get('HOUR') or 14)
FAILS = []


def check(name, ok, info=''):
    print(('PASS ' if ok else 'FAIL ') + name + (('  ' + info) if info else ''), flush=True)
    if not ok: FAILS.append(name)
    return ok


HUD = """(on=>{ for(const id of ['hud','hudR','minimap','ctlR','joy','interact','toast']){ const e=document.getElementById(id); if(e) e.style.visibility=on?'':'hidden'; } })"""
HIDE = """(()=>{ const E=GAME.E; let n=0; if(E.player&&E.player.obj) E.player.obj.visible=false; for(const q of (E.npcs||[])) if(q&&q.obj){ q.hidden=true; q.obj.visible=false; n++; } for(const x of (E.extras||[])) if(x&&x.obj){ x.hidden=true; x.obj.visible=false; n++; } return n; })()"""
AIM = """(async(e,l)=>{ const E=GAME.E; E.cinematic(new THREE.Vector3(...e),new THREE.Vector3(...l)); E.camera.position.set(...e); E.cam.look=new THREE.Vector3(...l); E.camera.lookAt(E.cam.look);
  const f0=E.frame; for(let i=0;i<240&&E.frame<f0+5;i++) await new Promise(r=>setTimeout(r,200)); const ri=E.renderer.info.render; return {calls:ri.calls, tris:ri.triangles}; })"""
MESHN = "(()=>{ let n=0; const z=GAME.E.zone; if(z&&z.group) z.group.traverse(o=>{ if(o.isMesh) n++; }); return n; })()"


async def main():
    os.makedirs(OUT, exist_ok=True)
    print('CC WZ_SLICE_SHOTS 溫州街東段 %s × 8 方向；%02d:00；SHA=%s；Windows＋GPU ≠ iPhone' % (STATIONS, int(HOUR), os.environ.get('SHA', '?')), flush=True)
    res = {}
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        t0 = time.time(); await pg.goto(URL); ok = await L.wait_loaded(pg); check('遊戲載入', ok, '%.1f 秒' % (time.time() - t0))
        if not ok:
            await b.close(); print('FAILED 1: 遊戲載入', flush=True); sys.exit(1)
        await pg.evaluate("localStorage.clear(); if(typeof STORY!=='undefined') STORY.phoneAuto=()=>{}")
        print('  [前置／捷徑] 讀檔：溫州街 (%s, 0)、2025-09-23（二）%02d:00、晴、條件事件關閉' % (STATIONS[0], int(HOUR)), flush=True)
        await L.load_state(pg, {'zone': 'wenzhou', 'hour': HOUR, 'day': 7, 'weekday': 2, 'weather': 'clear', 'pos': {'x': STATIONS[0], 'z': 0, 'yaw': 0, 'lv': 0}}, quiet_events=True)
        last = -1; st = 0; t1 = time.time()
        while time.time() - t1 < 120:
            await pg.wait_for_timeout(1000); n = await pg.evaluate(MESHN)
            if n == last: st += 1
            else: st = 0; last = n
            if st >= 5: break
        check('讀檔進到溫州街（場景 mesh %s、%.0f 秒穩定）' % (last, time.time() - t1), await pg.evaluate("GAME.G.zone==='wenzhou'"), '')
        await L.close_panels(pg, cdp)
        hid = await pg.evaluate(HIDE); await pg.evaluate(HUD + '(false)')
        print('  藏起來的路人／騎車的路人：%d' % hid, flush=True)
        for sx in STATIONS:
            for k in range(8):
                a = k * math.pi / 4; e = [sx, 1.6, 0.0]; l = [sx + math.sin(a) * 10, 1.6, math.cos(a) * 10]
                await pg.evaluate(HIDE)   # 換站時有新出生的路人
                ri = await pg.evaluate(AIM + '(%s,%s)' % (J(e), J([round(v, 3) for v in l])))
                await pg.wait_for_timeout(300)
                name = 'slice_x%s_d%03d' % (int(sx), k * 45)
                await pg.screenshot(path=os.path.join(OUT, name + '.png'))
                res[name] = dict(ri, cam=e, look=[round(v, 3) for v in l])
                print('  %s：calls %s、tris %s' % (name, ri['calls'], ri['tris']), flush=True)
        check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    json.dump(res, open(os.path.join(OUT, 'slice.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('ALL PASS' if not FAILS else 'FAILED %d: %s' % (len(FAILS), '；'.join(FAILS)), flush=True)
    sys.exit(1 if FAILS else 0)

asyncio.run(main())
