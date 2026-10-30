"""D115 改名美術字（RENAME-ART-1030）：同角度改前改後（LAWWW2-B 2026-10-30）。
在測試樹根目錄跑（server 開著）：python3 <這個檔> URL 輸出資料夾 標籤 [只拍這幾個，逗號分開]
  [前置／捷徑] 讀檔把人放到指定位置、指定朝向；不走路。iPhone 橫向模擬，不是實機。
  ①公館往校門（石牌朝外）②晨思鐘的石碑（朝北）③博思教學館的入口雨遮名牌 ④法律系館A 一樓東牆的公布欄 ⑤201 後牆的公告欄 ⑥博思 203 門邊的海報"""
import asyncio, os, sys
from playwright.async_api import async_playwright
sys.path.insert(0, os.path.join(os.getcwd(), 'tests'))
import playlib as L
URL, OUT, TAG = sys.argv[1], sys.argv[2], sys.argv[3]
ONLY = set(sys.argv[4].split(',')) if len(sys.argv) > 4 else None
FLAGS = {'introDone': True, 'campusIntro': True, 'classDone': True, 'metAn': True, 'met_an': True, 'afternoonDone': True}
PI = 3.14159265
VIEWS = [('gate', 'gongguan', 0, -37.5, PI, 0), ('bell', 'campus', -38, 10.5, 0, 0), ('boya', 'campus', -38, -63.5, PI, 0),
         ('linze_notice', 'linze', 5.6, 1.2, PI / 2, 0), ('cls201', 'classroom', -3.6, 6.2, 0, 0), ('boya203', 'boya_203', 1.0, 0.6, PI, 0)]
async def main():
    os.makedirs(OUT, exist_ok=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); await L.wait_loaded(pg)
        for name, zone, x, z, yaw, lv in VIEWS:
            if ONLY and name not in ONLY: continue
            await L.load_state(pg, {'zone': zone, 'hour': 14.0, 'day': 8, 'weekday': 6, 'weather': 'sunny', 'pos': {'x': x, 'z': z, 'yaw': yaw, 'lv': lv}, 'flags': FLAGS}, quiet_events=True)
            await pg.wait_for_timeout(9000)
            await pg.evaluate("(()=>{ for(const id of ['phoneToast','toast']){ const e=document.getElementById(id); if(e) e.style.visibility='hidden'; } })()")
            s = await L.state(pg); print(TAG, name, s.get('zone'), s['x'], s['z'], flush=True)
            await pg.screenshot(path=os.path.join(OUT, f'{TAG}_{name}.png'))
        print('errors', len(errs), errs[:3])
        await b.close()
asyncio.run(main())
