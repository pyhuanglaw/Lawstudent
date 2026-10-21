"""BB（帳號 A）2026-10-21：BACKLOG-A7-WZPARK-COPLANAR 溫州街小公園「疊在一起的面會不會閃」（LAWWW2 1effaa35 → 開發分支 a3837c1c 換了 wz_park.glb）。
閃爍要畫面在動才看得到：照 LAWWW2 的三個鏡頭（涼亭＋神龕、公布欄、環狀步道；shots.json），劇情鏡頭每一步橫移 3 mm、拍 10 張，
算相鄰兩張「突然變很多」的像素（任一色差 > 48）——鏡頭只動 3 mm，正常的面幾乎不變；z-fighting 的面會整塊換顏色。
同一支跑兩次：修改後（開發分支現在的 wz_park.glb）、修改前（[捷徑] 攔下 wz_park.glb 的請求，換成 a9da472a 的那一份），比數字＋差異圖。
[前置] 讀使用者 9/25 存檔改到溫州街 15:00；[捷徑] 劇情鏡頭、藏玩家與路人、風停（W3.updateWind 不更新）、藏介面。Playwright（SwiftShader）手機橫向模擬，不是 iPhone。
用法：LW_TESTS=<開發分支>/tests python3 wzpark_probe.py '<URL>/index.html?turbo' <輸出資料夾> <存檔.json> <修改前的 wz_park.glb> <shots.json>"""
import os, sys, json, asyncio, math
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
from playwright.async_api import async_playwright
import numpy as np
from PIL import Image
URL, OUT, SAVE, OLD_GLB, SHOTS = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4], sys.argv[5]
STEPS = int(os.environ.get('STEPS', '10')); STEP_M = float(os.environ.get('STEP_M', '0.003')); THR = 48


def score(a, b):
    """相鄰兩張：中間 70% 範圍內，任一色差 > THR 的像素數；回傳 (數量, 差異遮罩)"""
    A = np.asarray(Image.open(a).convert('RGB'), dtype=np.int16); B = np.asarray(Image.open(b).convert('RGB'), dtype=np.int16)
    h, w, _ = A.shape; y0, y1, x0, x1 = int(h * .15), int(h * .85), int(w * .15), int(w * .85)
    m = (np.abs(A - B).max(axis=2) > THR); m[:y0, :] = False; m[y1:, :] = False; m[:, :x0] = False; m[:, x1:] = False
    return int(m.sum()), m


async def one(p, run, variant, views, base):
    b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
    if variant == 'before':
        await ctx.route('**/wz_park.glb*', lambda route: route.fulfill(path=OLD_GLB, content_type='model/gltf-binary'))
    await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
    G = json.loads(json.dumps(base)); G = G.get('G', G); v0 = views[0]['state']
    G.update({'zone': 'wenzhou', 'hour': 15.0, 'pos': {'x': v0['pos']['x'], 'z': v0['pos']['z'], 'yaw': v0['pos']['yaw']}})
    await L.load_state(pg, G); await pg.wait_for_timeout(20000)
    run.setup('[前置] %s：使用者 9/25 存檔改到溫州街 15:00%s' % (variant, '；[捷徑] wz_park.glb 換成修改前（a9da472a）' if variant == 'before' else ''))
    await L.close_panels(pg, cdp)
    loaded = await pg.evaluate("(()=>{ let n=0; GAME.E.scene.traverse(o=>{ if(o.isMesh&&/park|pav|shrine|notice|ring/i.test(o.name||'')) n++; }); return n; })()")
    await pg.evaluate("""(()=>{ const E=GAME.E; E.player.obj.visible=false; for(const n of E.npcs) if(n&&n.obj) n.obj.visible=false; if(typeof W3!=='undefined'){ W3.updateWind(0); W3.updateWind=function(){}; }
      const ui=document.getElementById('ui'); if(ui) ui.style.visibility='hidden'; for(const id of ['joy','minimap','hud','clock','btnPhone','interact','goal']){ const e=document.getElementById(id); if(e) e.style.visibility='hidden'; } })()""")
    res = {}
    for v in views:
        nm = os.path.basename(v['out']).replace('.png', ''); cp, lk = v['cam']['pos'], v['cam']['look']
        dx, dz = lk[0] - cp[0], lk[2] - cp[2]; L2 = math.hypot(dx, dz) or 1; px, pz = -dz / L2, dx / L2
        files = []
        for k in range(STEPS):
            o = k * STEP_M; pos = [cp[0] + px * o, cp[1], cp[2] + pz * o]; look = [lk[0] + px * o, lk[1], lk[2] + pz * o]
            await pg.evaluate("(([p,l])=>{ GAME.E.cinematic(new THREE.Vector3(...p), new THREE.Vector3(...l)); GAME.E.snapCinematic(); })(%s)" % json.dumps([pos, look]))
            await pg.wait_for_timeout(1500 if k == 0 else 700)
            f = os.path.join(OUT, '%s_%s_%02d.png' % (variant, nm, k)); await pg.screenshot(path=f); files.append(f)
        sc = []; worst = (0, None)
        for a, c in zip(files, files[1:]):
            n, m = score(a, c); sc.append(n)
            if n >= worst[0]: worst = (n, m)
        if worst[1] is not None:   # 差異最大那一步：紅色標出突變的像素，疊在第一張上
            img = np.asarray(Image.open(files[0]).convert('RGB')).copy(); img[worst[1]] = [255, 0, 0]
            Image.fromarray(img).save(os.path.join(OUT, 'diff_%s_%s.png' % (variant, nm)))
        for f in files[2:]: os.remove(f)   # 留前兩張就好
        res[nm] = {'steps': sc, 'median': int(np.median(sc)) if sc else None, 'max': max(sc) if sc else None}
        print('%s %s：每一步突變像素 %s（中位數 %s）' % (variant, nm, sc, res[nm]['median']), flush=True)
    await pg.evaluate("GAME.E.endCinematic()")
    try: await asyncio.wait_for(b.close(), 30)
    except Exception: pass
    return res, errs, loaded


async def main():
    os.makedirs(OUT, exist_ok=True); run = L.Run('wzpark', OUT); base = json.load(open(SAVE, encoding='utf-8')); views = json.load(open(SHOTS, encoding='utf-8'))
    allres = {}; allerrs = []
    async with async_playwright() as p:
        for variant in ('after', 'before'):
            r, errs, loaded = await one(p, run, variant, views, base); allres[variant] = r; allerrs += errs
            print('%s：公園相關網格 %d 個' % (variant, loaded), flush=True)
    json.dump(allres, open(os.path.join(OUT, 'wzpark.json'), 'w'), ensure_ascii=False, indent=1)
    for nm in allres['after']:
        a, bf = allres['after'][nm]['median'], allres['before'].get(nm, {}).get('median')
        run.check('%s：修改後鏡頭每移 3 mm 的突變像素中位數 %s（修改前 %s）——不比修改前多' % (nm, a, bf), bf is None or a <= bf, '')
    run.check('沒有 JS 例外', not allerrs, json.dumps(allerrs[:3], ensure_ascii=False))
    run.finish()
asyncio.run(main())
