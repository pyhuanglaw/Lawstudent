"""開發用：在實際遊戲裡量某個位置、某個鏡頭的算圖負擔（draw call、三角形數、幾何數、材質數）。
用法：python3 tools/dev_scratch/render_stats.py [URL]   （預設 http://127.0.0.1:8765/index.html）
固定量幾個常用鏡頭（校園椰林大道往總圖、傅鐘、霖澤館前、溫州街 Café 前），印出 renderer.info。SwiftShader 的 FPS 沒有參考價值，所以只看數量。"""
import asyncio, json, sys
from playwright.async_api import async_playwright
URL = (sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8765/index.html') + '?turbo'
FLAGS = {'introDone': True, 'campusIntro': True, 'classDone': True, 'metAn': True, 'met_an': True, 'afternoonDone': True, 'lawclub': True, 'wenzhouLine': True}
VIEWS = [('校園：椰林大道往總圖', 'campus', 40, -3, 1.5708, 4.712), ('校園：傅鐘往行政大樓', 'campus', -38, 6, 3.1416, 0.0), ('校園：霖澤館前', 'campus', 34, -95, 3.1416, 0.0), ('溫州街：Café 前', 'wenzhou', 50.5, 0.5, 3.1416, 0.0)]
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/opt/pw-browsers/chromium', args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
        pg = await b.new_page(viewport={'width': 390, 'height': 844}); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto(URL)
        for i in range(240):
            if await pg.evaluate("!!(window.GAME&&document.getElementById('loading')&&document.getElementById('loading').classList.contains('hide'))"): break
            await pg.wait_for_timeout(500)
        for name, zone, x, z, yaw, cy in VIEWS:
            st = {'zone': zone, 'hour': 10.5, 'day': 8, 'weekday': 6, 'weather': 'sunny', 'pos': {'x': x, 'z': z, 'yaw': yaw}, 'flags': FLAGS}
            await pg.evaluate("(async(st)=>{ const s=GAME.defaults('祐廷'); Object.assign(s,st); document.getElementById('titleScreen').classList.add('hide'); EVENTS.onEnter=()=>false; EVENTS.tick=()=>false; await GAME.applySave(s); })(%s)" % json.dumps(st))
            await pg.evaluate("(c=>{ const C=GAME.E.cam; C.mode='follow'; C.yaw=c; C.manualT=999; })(%s)" % cy)
            await pg.wait_for_timeout(3000)
            r = await pg.evaluate("(()=>{ const E=GAME.E, R=E.renderer; R.info.autoReset=false; R.info.reset(); E.render(); const i=R.info; const out={calls:i.render.calls, tris:i.render.triangles, geoms:i.memory.geometries, textures:i.memory.textures, programs:(i.programs||[]).length}; R.info.autoReset=true; return out; })()")
            print(name, json.dumps(r, ensure_ascii=False))
        print('errors:', errs[:3])
        await b.close()
asyncio.run(main())
