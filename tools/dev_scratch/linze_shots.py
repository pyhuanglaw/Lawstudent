"""霖澤館外觀：固定鏡頭的遊戲內截圖（同一個位置、三個時段），給 VISUAL_REVIEW 做新舊比較。
用法：python3 tools/dev_scratch/linze_shots.py URL 輸出資料夾 標籤 [寬x高]
  URL 用開發版（8765）＝新版；線上版副本（8790）＝舊版。截圖檔名：<標籤>_<視角>_<時段>.png
鏡頭用 GAME.E.cinematic（遊戲自己的運鏡），玩家站在畫面外；HUD 照常顯示（手機橫向畫面）。"""
import asyncio, json, os, sys, time
from playwright.async_api import async_playwright

URL, OUT, TAG = sys.argv[1], sys.argv[2], sys.argv[3]
W, H = (int(v) for v in (sys.argv[4] if len(sys.argv) > 4 else '844x390').split('x'))
os.makedirs(OUT, exist_ok=True)
# 世界座標（霖澤館在 (34,-112)，正面朝 +z；穿堂 x 27–41）
VIEWS = [
    ('front', (24.0, 1.7, -66.0), (34.0, 15.0, -112.0), (24.0, -70.0)),      # 法學院廣場往霖澤館正面
    ('passage', (36.5, 2.0, -93.0), (34.0, 4.5, -125.0), (36.5, -95.0)),     # 穿堂正面（看得到中柱、天橋、後面的中庭）
    ('corner', (66.0, 2.4, -84.0), (34.0, 14.0, -110.0), (60.0, -86.0)),     # 東南角
    ('inside', (30.5, 2.5, -103.5), (37.0, 7.0, -117.0), (31.0, -101.0)),    # 穿堂裡面往上看（梁格天花板、天橋、玻璃牆）
]
HOURS = [11.0, 17.5, 20.5]


async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/opt/pw-browsers/chromium', args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
        ctx = await b.new_context(viewport={'width': W, 'height': H}, device_scale_factor=1, has_touch=True, is_mobile=True)
        pg = await ctx.new_page(); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto(URL); await pg.wait_for_timeout(6000)
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
            for name, pos, look, stand in VIEWS:
                await pg.evaluate("(([p,l,s])=>{ const E=GAME.E; GAME.G.hour=%s; E.placeAt?E.placeAt(E.player,s[0],s[1],0):E.player.obj.position.set(s[0],0,s[1]); E.cinematic(new THREE.Vector3(...p),new THREE.Vector3(...l)); E.camera.position.set(...p); E.camera.lookAt(...l); })(%s)" % (h, json.dumps([pos, look, stand])))
                await pg.wait_for_timeout(3500)
                f = os.path.join(OUT, f'{TAG}_{name}_{int(h*10):03d}.png'); await pg.screenshot(path=f); print('shot', f, 'formal' if formal else 'kit')
        info = await pg.evaluate("(()=>{ const r=GAME.E.renderer; return {calls:r.info.render.calls, tris:r.info.render.triangles, geoms:r.info.memory.geometries, tex:r.info.memory.textures}; })()")
        print('renderer', json.dumps(info), 'errors', errs[:5])
        await b.close()

asyncio.run(main())
