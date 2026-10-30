"""X133 總圖前草皮：同一個玩家鏡頭量 draw call、三角形（LAWWW2-B 2026-10-30）。
在測試樹根目錄跑（server 開著）：python3 <這個檔> URL 標籤 → 一行一個鏡頭（SwiftShader 量的，手機實機沒量）
  [前置／捷徑] 讀檔把人放到指定位置、指定朝向；不走路。鏡頭同 lib_lawn_shots.py。"""
import asyncio, json, os, sys
from playwright.async_api import async_playwright
sys.path.insert(0, os.path.join(os.getcwd(), 'tests'))
import playlib as L
URL, TAG = sys.argv[1], sys.argv[2]
FLAGS = {'introDone': True, 'campusIntro': True, 'classDone': True, 'metAn': True, 'met_an': True, 'afternoonDone': True}
VIEWS = [('avenue', 58, 0, 1.5708), ('lawn_w', 70, 3, 1.5708), ('north', 72, -14, 2.3)]
INFO = "(async()=>{ const E=GAME.E, f0=E.frame; for(let i=0;i<240&&E.frame<f0+4;i++) await new Promise(r=>setTimeout(r,250)); const r=E.renderer.info.render; return {calls:r.calls,tris:r.triangles}; })()"
async def main():
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); await L.wait_loaded(pg)
        for name, x, z, yaw in VIEWS:
            await L.load_state(pg, {'zone': 'campus', 'hour': 15, 'day': 8, 'weekday': 6, 'weather': 'sunny', 'pos': {'x': x, 'z': z, 'yaw': yaw}, 'flags': FLAGS}, quiet_events=True)
            await pg.wait_for_timeout(9000)
            print(TAG, name, json.dumps(await pg.evaluate(INFO)), flush=True)
        print('errors', len(errs))
        await b.close()
asyncio.run(main())
