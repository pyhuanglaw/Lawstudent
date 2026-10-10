"""霖澤館外觀：固定鏡頭的遊戲內截圖（同一個位置、三個時段），給 VISUAL_REVIEW 做新舊比較。
用法：python3 tools/dev_scratch/linze_shots.py URL 輸出資料夾 標籤 [寬x高] [--hours=11,17.5]
  URL 用開發版（8765）＝新版；線上版副本（8790）＝舊版。截圖檔名：<標籤>_<視角>_<時段>.png
鏡頭用 GAME.E.cinematic（遊戲自己的運鏡），玩家站在畫面外；HUD 照常顯示（手機橫向畫面）。"""
import asyncio, json, os, sys, time
from playwright.async_api import async_playwright

URL, OUT, TAG = sys.argv[1], sys.argv[2], sys.argv[3]
args = [a for a in sys.argv[4:] if not a.startswith('--')]
W, H = (int(v) for v in (args[0] if args else '844x390').split('x'))
os.makedirs(OUT, exist_ok=True)
# 世界座標（霖澤館在 (34,-112)，正面朝 +z；穿堂 x 27–41）
VIEWS = [
    ('front', (24.0, 1.7, -66.0), (34.0, 15.0, -112.0), (24.0, -70.0)),      # 法學院廣場往霖澤館正面
    ('passage', (36.5, 2.0, -93.0), (34.0, 4.5, -125.0), (36.5, -95.0)),     # 穿堂正面（看得到中柱、天橋、後面的中庭）
    ('corner', (66.0, 2.4, -84.0), (34.0, 14.0, -110.0), (60.0, -86.0)),     # 東南角
    ('inside', (30.5, 2.5, -103.5), (37.0, 7.0, -117.0), (31.0, -101.0)),    # 穿堂裡面往上看（梁格天花板、天橋、玻璃牆）
]
HOURS = [11.0, 17.5, 20.5]
for a in sys.argv[4:]:
    if a.startswith('--hours='): HOURS = [float(v) for v in a[8:].split(',')]


async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/opt/pw-browsers/chromium', args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
        ctx = await b.new_context(viewport={'width': W, 'height': H}, device_scale_factor=1, has_touch=True, is_mobile=True)
        pg = await ctx.new_page(); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto(URL)
        for _ in range(360):   # 等開機載入完成（人物模型分批下載，2026-10-10 起可能超過 6 秒；太早讀檔，開機結束時會把 HUD 藏起來）
            if await pg.evaluate("typeof GAME!=='undefined'&&!!document.getElementById('loading')&&document.getElementById('loading').classList.contains('hide')"): break
            await pg.wait_for_timeout(500)
        await pg.wait_for_timeout(1500)
        for h in HOURS:
            st = {'day': 14, 'weekday': 1, 'hour': h, 'zone': 'campus', 'pos': {'x': 24, 'z': -70, 'yaw': 0}, 'weather': 'sunny',
                  'flags': {'introDone': True, 'classDone': True, 'metAn': True, 'met_an': True, 'afternoonDone': True}, 'visited': {'dorm': True, 'campus': True}}
            js = "(async()=>{ const s=GAME.defaults('祐廷'); Object.assign(s," + json.dumps(st, ensure_ascii=False) + "); document.getElementById('titleScreen').classList.add('hide'); await GAME.applySave(s); EVENTS.onEnter=()=>false; EVENTS.tick=()=>false; })()"
            await pg.evaluate(js); await pg.wait_for_timeout(2500)
            # 正式外觀（有的話）載入完成
            t0 = time.time(); formal = False
            while time.time() - t0 < 90:
                formal = await pg.evaluate("(()=>{ const z=GAME.E.zone; return !!(z&&z.buildings&&z.buildings.some(b=>b.userData.formal)); })()")
                has = await pg.evaluate("!!(window.ASSETS&&ASSETS.manifest['bldg.linze_exterior'])")
                if formal or not has: break
                await pg.wait_for_timeout(1000)
            # 第一個視角先空拍一次：剛讀檔的前幾秒 HUD 還沒出來、鏡頭還沒切到 cinematic（11:00 的第一張曾經拍到別的方向）
            for name, pos, look, stand in VIEWS[:1] + VIEWS:
                await pg.evaluate("(([p,l,s])=>{ const E=GAME.E; GAME.G.hour=%s; E.placeAt?E.placeAt(E.player,s[0],s[1],0):E.player.obj.position.set(s[0],0,s[1]); E.cinematic(new THREE.Vector3(...p),new THREE.Vector3(...l)); E.camera.position.set(...p); E.camera.lookAt(...l); })(%s)" % (h, json.dumps([pos, look, stand])))
                await pg.wait_for_timeout(3500)
                f = os.path.join(OUT, f'{TAG}_{name}_{int(h*10):03d}.png'); await pg.screenshot(path=f); print('shot', f, 'formal' if formal else 'kit')   # 第一張空拍會被同名的第二張蓋掉
        info = await pg.evaluate("(()=>{ const r=GAME.E.renderer; return {calls:r.info.render.calls, tris:r.info.render.triangles, geoms:r.info.memory.geometries, tex:r.info.memory.textures}; })()")
        print('renderer', json.dumps(info), 'errors', errs[:5])
        await b.close()

asyncio.run(main())
