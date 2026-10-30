"""X133 LIB-LAWN-PLAN-1030：總圖前（椰林大道東端）同角度截圖（LAWWW2-B 2026-10-30）。
在測試樹根目錄跑（server 開著）：python3 <這個檔> URL 輸出資料夾 標籤 [時刻，預設 15]
  [前置／捷徑] 讀檔把人放到指定位置、指定朝向；不走路。iPhone 橫向模擬，不是實機。
  鏡頭：①大道上往總圖走（x=58）②草皮西緣往總圖（x=70）③總圖台階往大道回看（x=84）④北側斜看（x=72,z=-14）⑤南側斜看（x=72,z=14）"""
import asyncio, json, os, sys
from playwright.async_api import async_playwright
sys.path.insert(0, os.path.join(os.getcwd(), 'tests'))
import playlib as L
URL, OUT, TAG = sys.argv[1], sys.argv[2], sys.argv[3]
HOUR = float(sys.argv[4]) if len(sys.argv) > 4 else 15.0
FLAGS = {'introDone': True, 'campusIntro': True, 'classDone': True, 'metAn': True, 'met_an': True, 'afternoonDone': True}
VIEWS = [('avenue', 58, 0, 1.5708), ('lawn_w', 70, 3, 1.5708), ('steps', 84.5, 0, -1.5708), ('north', 72, -14, 2.3), ('south', 72, 14, 0.85)]
async def main():
    os.makedirs(OUT, exist_ok=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); await L.wait_loaded(pg)
        for name, x, z, yaw in VIEWS:
            await L.load_state(pg, {'zone': 'campus', 'hour': HOUR, 'day': 8, 'weekday': 6, 'weather': 'sunny', 'pos': {'x': x, 'z': z, 'yaw': yaw}, 'flags': FLAGS}, quiet_events=True)
            await pg.wait_for_timeout(7000)
            await pg.evaluate("(()=>{ for(const id of ['phoneToast','toast']){ const e=document.getElementById(id); if(e) e.style.visibility='hidden'; } })()")
            s = await L.state(pg); print(TAG, name, s['x'], s['z'], flush=True)
            await pg.screenshot(path=os.path.join(OUT, f'{TAG}_{name}.png'))
        print('errors', len(errs))
        await b.close()
asyncio.run(main())
