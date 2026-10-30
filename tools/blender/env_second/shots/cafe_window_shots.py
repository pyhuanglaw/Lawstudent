"""X132 CAFE-WINDOW-LIVE-1030：兩點半 Café 往店門口（溫州街）看的窗景，同角度改前改後（LAWWW2-B 2026-10-30）。
在測試樹根目錄跑（server 開著）：python3 <這個檔> URL 輸出資料夾 標籤
  [前置／捷徑] 讀檔把人放在 Café 裡、指定時刻；不走路。iPhone 橫向模擬（playlib），不是實機。
  每個時刻三個鏡頭：①店中間往門口 ②窗邊雙人桌旁往外 ③門口內側往外（鏡頭最靠近玻璃）。
  另外記錄：3D 街景有沒有接上（z.cafeStreet）、draw call、三角形數、路人數。"""
import asyncio, json, os, sys
from playwright.async_api import async_playwright
sys.path.insert(0, os.path.join(os.getcwd(), 'tests'))
import playlib as L

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8881/index.html'
OUT = sys.argv[2] if len(sys.argv) > 2 else '/tmp/cafe_window'
TAG = sys.argv[3] if len(sys.argv) > 3 else 'x'
HOURS = [float(h) for h in (sys.argv[4].split(',') if len(sys.argv) > 4 else ['14', '17.8', '21'])]
FLAGS = {'introDone': True, 'campusIntro': True, 'classDone': True, 'metAn': True, 'met_an': True, 'afternoonDone': True}
VIEWS = [('mid', 0.0, -2.6, 0.0), ('seat', 3.4, 0.4, 0.35), ('door', -1.2, 3.6, 0.25)]
INFO = """(()=>{ const E=GAME.E, z=E.zone, r=E.renderer; r.info.autoReset=false; r.info.reset(); r.render(E.scene,E.camera); const i={calls:r.info.render.calls,tris:r.info.render.triangles}; r.info.autoReset=true;
  return {zone:GAME.G.zone, live:!!(z&&z.cafeStreet), liveVis:!!(z&&z.cafeStreet&&z.cafeStreet.visible), walkers:E.extras.filter(x=>x.obj&&x.obj.name==='cafe_walker').length, calls:i.calls, tris:i.tris}; })()"""


async def main():
    os.makedirs(OUT, exist_ok=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        await L.wait_loaded(pg)
        for h in HOURS:
            for name, x, z, yaw in VIEWS:
                await L.load_state(pg, {'zone': 'cafe', 'hour': h, 'day': 8, 'weekday': 6, 'weather': 'sunny', 'pos': {'x': x, 'z': z, 'yaw': yaw}, 'flags': FLAGS}, quiet_events=True)
                await pg.wait_for_timeout(9000 if name == 'mid' else 4000)
                await pg.evaluate("(()=>{ for(const id of ['phoneToast','toast']){ const e=document.getElementById(id); if(e) e.style.visibility='hidden'; } })()")
                info = await pg.evaluate(INFO)
                print(TAG, h, name, json.dumps(info), flush=True)
                await pg.screenshot(path=os.path.join(OUT, f'{TAG}_{h:05.2f}_{name}.png'))
        print('errors', len(errs), '; '.join(map(str, errs[:5])))
        await b.close()

asyncio.run(main())
