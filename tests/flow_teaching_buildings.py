"""真實玩家流程：台大總校區的公共教學館（使用者 2026-10-13；docs/campus/TEACHING_BUILDINGS_PLAN.md）。不用 ?turbo。
第一階段：共同教學館（普通、博雅等使用者決定位置後加進來）。
玩家操作一律走真的介面（觸控點地面、互動按鈕、手機按鈕、小地圖）；前置條件（讀檔到某天某時某地）用 [前置／捷徑] 標示。
A. 從椰林大道（傅鐘東邊）點地面走到共同教學館正門：不瞬移；到門口出現「共同教學館」按鈕；按下去說明今天有沒有課、館內之後開放。
B. 大地圖：地名「共同教學館」在建築的位置（地名資料＋點小地圖打開大地圖的截圖）。
C. 手機「地點」快速前往：從宿舍 → 共同教學館：到校園、站在門口前（站得住、不在建築裡）、時間有過（照距離約 5 分鐘）、出現「共同教學館」按鈕；
   再自己走回椰林大道（不會卡在門口）。
D. 手機「地點」→ 總圖書館：到總圖大廳、站得住。
E. 舊存檔站在共同教學館的位置（建築裡）：讀檔後移到站得住的地方。
用法：python3 tests/flow_teaching_buildings.py URL [輸出資料夾]"""
import asyncio, json, sys, math
from playwright.async_api import async_playwright
sys.path.insert(0, __import__('os').path.dirname(__file__))
import playlib as L

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8765/index.html'
OUT = sys.argv[2] if len(sys.argv) > 2 else '/tmp/flow_teaching_buildings'
DAY_FRI = 3   # 9/19 週五：13:20 法律與社會（霖澤館 201），共同教學館今天沒有課
BASE_FLAGS = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True, 'metAn': True, 'zheNoodleDone': True}
FOOT = (2, 33, 24, 14)   # 共同教學館：中心 (2,33)、24×14


def inside_foot(x, z):
    cx, cz, w, d = FOOT
    return abs(x - cx) < w / 2 and abs(z - cz) < d / 2


async def main():
    run = L.Run('flow_teaching_buildings', OUT)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        run.check('遊戲載入', await L.wait_loaded(pg))
        # ---------- A：走到共同教學館正門 ----------
        run.setup('讀檔：第 3 天（9/19 週五）10:00，椰林大道上、傅鐘東邊 (-30,3)')
        await L.load_state(pg, {'zone': 'campus', 'hour': 10.0, 'day': DAY_FRI, 'weekday': 5, 'weather': 'sunny', 'pos': {'x': -30, 'z': 3, 'yaw': 1.57}, 'flags': BASE_FLAGS})
        await pg.wait_for_timeout(3500)
        d = await L.find_it(pg, '共同教學館')
        run.check('校園有共同教學館的門口（行政大樓東邊、正門朝椰林大道）', bool(d) and abs(d['x'] - 2) < 1 and abs(d['z'] - 22.8) < 1, json.dumps(d, ensure_ascii=False))
        await run.shot(pg, 'A_start_avenue')
        ok = await L.go_to(pg, cdp, run, d['x'], d['z'], 1.2, '共同教學館正門')
        s = await L.state(pg)
        run.check('自己走到正門（點地面，沒有瞬移）、出現「共同教學館」按鈕', ok and s['interact'].startswith('共同教學館'), json.dumps(s, ensure_ascii=False))
        run.check('站在建築外面（不在牆裡）', s['stand'] and not inside_foot(s['x'], s['z']), json.dumps(s, ensure_ascii=False))
        await run.shot(pg, 'A_at_door')
        await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1500)
        cap = await pg.evaluate("(document.getElementById('caption')||{}).textContent||''")
        run.check('按「共同教學館」：寫在這裡上的課、今天沒有課、館內之後開放', '共同教學館' in cap and '今天沒有你在這裡的課' in cap and '館內之後開放' in cap, cap)
        await run.shot(pg, 'A_door_caption')
        # ---------- B：大地圖 ----------
        lm = await pg.evaluate("(PLACES.landmarks.campus||[]).find(q=>q[0]==='共同教學館')||null")
        run.check('大地圖的地名「共同教學館」在建築的位置 (2,33)', bool(lm) and lm[1] == 2 and lm[2] == 33, json.dumps(lm, ensure_ascii=False))
        await pg.wait_for_timeout(3500)
        await L.tap(pg, cdp, '#minimap'); await pg.wait_for_timeout(1000)
        op = await pg.evaluate("!document.getElementById('bigmap').classList.contains('hide')")
        run.check('點小地圖打開大地圖', op)
        await run.shot(pg, 'B_bigmap')
        await L.tap(pg, cdp, '#bmClose'); await pg.wait_for_timeout(500)
        # ---------- C：手機「地點」快速前往（宿舍 → 共同教學館）----------
        run.setup('讀檔：第 3 天 10:00，宿舍房間')
        await L.load_state(pg, {'zone': 'dorm', 'hour': 10.0, 'day': DAY_FRI, 'weekday': 5, 'weather': 'sunny', 'pos': {'x': 0, 'z': 2.4, 'yaw': 3.14}, 'flags': BASE_FLAGS})
        await pg.wait_for_timeout(3500)
        h0 = (await L.state(pg))['hour']
        await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(1000)
        await L.tap(pg, cdp, '#phoneTabs button[data-ptab="places"]'); await pg.wait_for_timeout(800)
        txt = await pg.evaluate("(document.getElementById('phoneBody')||{}).textContent||''")
        run.check('手機「地點」：有共同教學館、寫大約幾分鐘', '共同教學館' in txt and '分鐘' in txt, txt[:200])
        await run.shot(pg, 'C_phone_places')
        ok = await L.tap(pg, cdp, '#phoneBody [data-place="campus|共同教學館"]')
        run.check('點「前往」', ok)
        await pg.wait_for_timeout(6000)
        s = await L.state(pg)
        dmin = (s['hour'] - h0) * 60
        run.check('到校園、站在共同教學館門口前（站得住、不在建築裡）', s['zone'] == 'campus' and s['stand'] and not inside_foot(s['x'], s['z']) and math.hypot(s['x'] - 2, s['z'] - 21.4) < 1.5, json.dumps(s, ensure_ascii=False))
        run.check('時間有過（照距離約 5 分鐘，不是瞬間）', 4.5 <= dmin < 20, f'{dmin:.1f} 分鐘')
        run.check('門口出現「共同教學館」按鈕', s['interact'].startswith('共同教學館'), s['interact'])
        await run.shot(pg, 'C_arrived')
        ok = await L.go_to(pg, cdp, run, 2, 4, 1.2, '椰林大道（從門口走回去）')
        s = await L.state(pg)
        run.check('從門口自己走回椰林大道（不會卡在門口）', ok and s['stand'], json.dumps(s, ensure_ascii=False))
        # ---------- D：手機「地點」→ 總圖書館 ----------
        await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(1000)
        await L.tap(pg, cdp, '#phoneTabs button[data-ptab="places"]'); await pg.wait_for_timeout(800)
        ok = await L.tap(pg, cdp, '#phoneBody [data-place="library_hall|總圖書館（大廳）"]')
        run.check('點「總圖書館（大廳）」的「前往」', ok)
        await pg.wait_for_timeout(7000)
        s = await L.state(pg)
        run.check('到總圖大廳、站得住', s['zone'] == 'library_hall' and s['stand'], json.dumps(s, ensure_ascii=False))
        # ---------- E：舊存檔站在共同教學館的位置 ----------
        run.setup('讀檔：舊存檔的位置在共同教學館裡 (2,33)（這裡在 2026-10-13 之前就是一棟無名系館）')
        await L.load_state(pg, {'zone': 'campus', 'hour': 10.0, 'day': DAY_FRI, 'weekday': 5, 'weather': 'sunny', 'pos': {'x': 2, 'z': 33, 'yaw': 0}, 'flags': BASE_FLAGS})
        await pg.wait_for_timeout(3500)
        s = await L.state(pg)
        run.check('讀檔後移到建築外面站得住的地方', s['zone'] == 'campus' and s['stand'] and not inside_foot(s['x'], s['z']), json.dumps(s, ensure_ascii=False))
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:3], ensure_ascii=False))
        await b.close()
    return run.finish()


sys.exit(asyncio.run(main()))
