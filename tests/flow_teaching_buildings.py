"""真實玩家流程：首都帝大總校區的公共教學館（使用者 2026-10-13；docs/campus/TEACHING_BUILDINGS_PLAN.md）。不用 ?turbo。
第一階段：共同教學館（普通、博思等使用者決定位置後加進來）。
玩家操作一律走真的介面（觸控點地面、互動按鈕、手機按鈕、小地圖）；前置條件（讀檔到某天某時某地）用 [前置／捷徑] 標示。
A. 從椰影大道（晨思鐘東邊）點地面走到共同教學館正門：不瞬移；到門口出現「共同教學館」按鈕；今天沒有課——按下去就進館；
   自己走進共 101 階梯教室（側邊台階上到第 2 排）坐下、起身；走上樓梯到二樓走廊、自習區；走下樓、走出去回到正門前（D55 第二階段的室內）。
B. 大地圖：地名「共同教學館」在建築的位置（地名資料＋點小地圖打開大地圖的截圖）。
C. 手機「活動」分頁（這幾天的活動都列出來；沒有活動時寫「目前沒有」）；手機「地點」快速前往：從宿舍 → 共同教學館：到校園、站在門口前（站得住、不在建築裡）、時間有過（照距離約 5 分鐘）、出現「共同教學館」按鈕；
   再自己走回椰影大道（不會卡在門口）。
D. 手機「地點」→ 總圖書館：到總圖大廳、站得住。
E. 舊存檔站在共同教學館的位置（建築裡）：讀檔後移到站得住的地方。
F. 大一女舍：從校門點地面走到 A 棟門口（傳達室）→「男賓止步」；走過 A、B 之間的天橋下；坐門口的長椅「坐一下」（等人）；手機「地點」→ 大一女舍（門口）站得住。
用法：python3 tests/flow_teaching_buildings.py URL [輸出資料夾]"""
import asyncio, json, sys, math
from playwright.async_api import async_playwright
sys.path.insert(0, __import__('os').path.dirname(__file__))
import playlib as L

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8765/index.html'
OUT = sys.argv[2] if len(sys.argv) > 2 else '/tmp/flow_teaching_buildings'
DAY_FRI = 3   # 9/19 週五：13:20 法律與社會（霖澤館 201），共同教學館今天沒有課
BASE_FLAGS = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True, 'metAn': True, 'zheNoodleDone': True}
FOOT = (2, 33, 24, 14)   # 共同教學館：中心 (2,33)、24×14（含正面二樓下的拱廊）
# 圍起來的本體（牆裡面）：24×11.4、z 28.6–40（src/zones3d.js 的 gongtong cols 第一筆 [0,-1.3,24,11.4]，轉 180°）。
# 正面的拱廊（z 26.0–28.6，二樓在上面）是走得進去的騎樓（v9.3 第七批起建築的一樓拱廊都可以走），不算「在建築裡」。
BODY = (2, 34.3, 24, 11.4)


def inside_foot(x, z, box=None):
    cx, cz, w, d = box or FOOT
    return abs(x - cx) < w / 2 and abs(z - cz) < d / 2


async def main():
    run = L.Run('flow_teaching_buildings', OUT)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        run.check('遊戲載入', await L.wait_loaded(pg))
        # ---------- A：走到共同教學館正門 ----------
        run.setup('讀檔：第 3 天（9/19 週五）10:00，椰影大道上、晨思鐘東邊 (-30,3)')
        await L.load_state(pg, {'zone': 'campus', 'hour': 10.0, 'day': DAY_FRI, 'weekday': 5, 'weather': 'sunny', 'pos': {'x': -30, 'z': 3, 'yaw': 1.57}, 'flags': BASE_FLAGS})
        await pg.wait_for_timeout(3500)
        d = await L.find_it(pg, '共同教學館')
        run.check('校園有共同教學館的門口（行政大樓東邊、正門朝椰影大道）', bool(d) and abs(d['x'] - 2) < 1 and abs(d['z'] - 22.8) < 1, json.dumps(d, ensure_ascii=False))
        await run.shot(pg, 'A_start_avenue')
        ok = await L.go_to(pg, cdp, run, d['x'], d['z'], 1.2, '共同教學館正門')
        s = await L.state(pg)
        run.check('自己走到正門（點地面，沒有瞬移）、出現「共同教學館」按鈕', ok and s['interact'].startswith('共同教學館'), json.dumps(s, ensure_ascii=False))
        run.check('站在建築外面（不在牆裡）', s['stand'] and not inside_foot(s['x'], s['z']), json.dumps(s, ensure_ascii=False))
        await run.shot(pg, 'A_at_door')
        # A2：沒有課——按門就進館（D55 第二階段：公共空間照常可以進，不觸發故事）
        await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(5000)
        s = await L.state(pg)
        run.check('按「共同教學館」（今天這裡沒有課）：直接走進館裡（大廳、站得住）', s['zone'] == 'gongtong' and s['stand'] and s['lv'] == 0, json.dumps(s, ensure_ascii=False))
        await run.shot(pg, 'A_lobby')
        seat = await pg.evaluate("(()=>{ const s=GAME.E.zone.seats.find(q=>q.room==='101'&&q.row===1&&q.col===1); return s?{x:s.x,z:s.z,yaw:s.yaw,y:s.y,kind:s.kind}:null; })()")
        run.check('共 101 是階梯教室：座位資料（第 2 排、高 0.6 m）', bool(seat) and seat['kind'] == 'lecture' and abs(seat['y'] - 0.6) < 0.01, json.dumps(seat))
        await run.shot(pg, 'A_lecture_door')
        ax, az = seat['x'] - math.sin(seat['yaw']) * 0.6, seat['z'] - math.cos(seat['yaw']) * 0.6   # 椅子後面的走道
        ok = await L.go_to(pg, cdp, run, ax, az, 0.3, '共 101 第 2 排的座位後面', lv=0)
        s = await L.state(pg)
        run.check('自己走進共 101（講台那一端的門、側邊台階）、站在第 2 排的平台上、出現「坐下」', ok and s['interact'].startswith('坐下') and abs(s['y'] - seat['y']) < 0.08, json.dumps(s, ensure_ascii=False))
        await run.shot(pg, 'A_lecture_row2')
        await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(2500)
        opts = await pg.evaluate("[...document.querySelectorAll('#choices button')].map(b=>b.textContent)")
        pose = await pg.evaluate("GAME.E.player.pose")
        run.check('坐在 101 的座位上（沒有課：坐一下、讀書可以選）', pose == 'sit' and any('坐一下' in o for o in opts), f'pose={pose} ' + json.dumps(opts, ensure_ascii=False))
        await run.shot(pg, 'A_seated_101')
        idx = next((i for i, o in enumerate(opts) if '坐一下' in o), 0)
        s = await L.advance_dialogs(pg, cdp, run, until=lambda q: not q['busy'] and not q['dlg'] and not q['choices'], pick=idx)
        pose = await pg.evaluate("GAME.E.player.pose")
        run.check('起身後站在教室裡（站得住，不在桌子裡）', pose != 'sit' and s['stand'], f'pose={pose} ' + json.dumps(s, ensure_ascii=False))
        ok = await L.go_to(pg, cdp, run, 0, 1.0, 0.8, '二樓走廊', lv=1)
        s = await L.state(pg)
        run.check('自己走上樓梯到二樓走廊（第 1 層、4.2 m）', ok and s['lv'] == 1 and abs(s['y'] - 4.2) < 0.1, json.dumps(s, ensure_ascii=False))
        ok = await L.go_to(pg, cdp, run, -8.0, 4.35, 0.4, '二樓自習區（兩排桌子中間的走道）', lv=1)
        s = await L.state(pg)
        run.check('走到二樓自習區、出現「坐下讀書（自習區）」', ok and '自習區' in s['interact'], json.dumps(s, ensure_ascii=False))
        await run.shot(pg, 'A_study_2f')
        ex = await L.find_it(pg, '走出共同教學館')
        ok = await L.go_to(pg, cdp, run, ex['x'], ex['z'], 0.9, '一樓出口', lv=0)
        s = await L.state(pg)
        run.check('自己走下樓、走到出口（出現「走出共同教學館」）', ok and s['interact'].startswith('走出共同教學館'), json.dumps(s, ensure_ascii=False))
        await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(5000)
        s = await L.state(pg)
        run.check('走出去：回到校園共同教學館的正門前、面向椰影大道、不會一出來就跳出「共同教學館」', s['zone'] == 'campus' and s['stand'] and math.hypot(s['x'] - 2, s['z'] - 20.6) < 1.0 and not s['interact'].startswith('共同教學館'), json.dumps(s, ensure_ascii=False))
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
        await L.tap(pg, cdp, '#phoneTabs button[data-ptab="events"]'); await pg.wait_for_timeout(800)
        txt = await pg.evaluate("(document.getElementById('phoneBody')||{}).textContent||''")
        up = await pg.evaluate("(typeof ACTIVITIES!=='undefined'?ACTIVITIES.upcoming(GAME.G,7):[]).map(o=>o.a.title)")   # 2026-10-13 起有活動（AA_110 6-3 第一批）
        run.check('手機「活動」分頁：這幾天的演講與活動都列出來（沒有的話寫「目前沒有公告的演講或活動」）', (all(t in txt for t in up) and '目前沒有' not in txt) if up else '目前沒有公告的演講或活動' in txt, json.dumps(up, ensure_ascii=False) + ' ／ ' + txt[:160])
        await run.shot(pg, 'C_phone_events')
        await L.tap(pg, cdp, '#phoneTabs button[data-ptab="places"]'); await pg.wait_for_timeout(800)
        ok = await L.tap(pg, cdp, '#phoneBody [data-place="campus|共同教學館"]')
        run.check('點「前往」', ok)
        await pg.wait_for_timeout(6000)
        s = await L.state(pg)
        dmin = (s['hour'] - h0) * 60
        run.check('到校園、站在共同教學館門口前（站得住、不在建築裡）', s['zone'] == 'campus' and s['stand'] and not inside_foot(s['x'], s['z']) and math.hypot(s['x'] - 2, s['z'] - 21.4) < 1.5, json.dumps(s, ensure_ascii=False))
        run.check('時間有過（照距離約 5 分鐘，不是瞬間）', 4.5 <= dmin < 20, f'{dmin:.1f} 分鐘')
        run.check('門口出現「共同教學館」按鈕', s['interact'].startswith('共同教學館'), s['interact'])
        await run.shot(pg, 'C_arrived')
        ok = await L.go_to(pg, cdp, run, 2, 4, 1.2, '椰影大道（從門口走回去）')
        s = await L.state(pg)
        run.check('從門口自己走回椰影大道（不會卡在門口）', ok and s['stand'], json.dumps(s, ensure_ascii=False))
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
        # 2026-10-14 v9.6 回歸：原本用整個 24×14（含拱廊）判斷，遊戲把人移到正面的拱廊下 (-3.25,27.75)：站得住、在牆外 0.85 m——是騎樓，不是建築裡面。改用牆圍起來的本體判斷
        run.check('讀檔後移到建築外面站得住的地方（牆圍起來的本體外面；正面的拱廊下可以）', s['zone'] == 'campus' and s['stand'] and not inside_foot(s['x'], s['z'], BODY), json.dumps(s, ensure_ascii=False))
        # ---------- F：大一女舍 ----------
        run.setup('讀檔：第 3 天 17:30，校門口 (-112,0)')
        await L.load_state(pg, {'zone': 'campus', 'hour': 17.5, 'day': DAY_FRI, 'weekday': 5, 'weather': 'sunny', 'pos': {'x': -112, 'z': 0, 'yaw': 3.14}, 'flags': BASE_FLAGS})
        await pg.wait_for_timeout(3500)
        a = await L.find_it(pg, '大一女舍 A 棟')
        run.check('校園有大一女舍 A 棟（傳達室）的門口', bool(a), json.dumps(a, ensure_ascii=False))
        ok = await L.go_to(pg, cdp, run, a['x'], a['z'], 1.2, '大一女舍 A 棟門口')
        s = await L.state(pg)
        run.check('從校門自己走到大一女舍 A 棟門口、出現按鈕', ok and s['interact'].startswith('大一女舍 A 棟'), json.dumps(s, ensure_ascii=False))
        await run.shot(pg, 'F_dorm_door')
        await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1500)
        cap = await pg.evaluate("(document.getElementById('caption')||{}).textContent||''")
        run.check('按門口：寫「男賓止步」、傳達室在 A 棟、可以在門口的長椅等', '男賓止步' in cap and '傳達室' in cap, cap)
        ok = await L.go_to(pg, cdp, run, -93, 74, 1.0, '天橋下（A、B 之間）')
        s = await L.state(pg)
        run.check('走過 A、B 兩棟之間（2 樓天橋下面）', ok and s['stand'] and -96 < s['x'] < -90, json.dumps(s, ensure_ascii=False))
        await run.shot(pg, 'F_under_bridge')
        ok = await L.go_to(pg, cdp, run, -93, 55.0, 0.6, '門口的長椅前')
        s = await L.state(pg)
        run.check('走到門口的長椅、出現「坐在大一女舍門口的長椅（等人）」', ok and '大一女舍門口的長椅' in s['interact'], s['interact'])
        h0 = s['hour']
        await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(2500)
        opts = await pg.evaluate("[...document.querySelectorAll('#choices button')].map(b=>b.textContent)")
        run.check('坐下後有「坐一下」可以等', any('坐一下' in o for o in opts), json.dumps(opts, ensure_ascii=False))
        idx = next((i for i, o in enumerate(opts) if '坐一下' in o), 0)
        s = await L.advance_dialogs(pg, cdp, run, until=lambda q: not q['busy'] and not q['dlg'] and not q['choices'], pick=idx)
        run.check('等了一段時間（時間有過）、起身後站得住', s['hour'] > h0 + 0.1 and s['stand'], f"{h0} → {s['hour']}")
        await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(1000)
        await L.tap(pg, cdp, '#phoneTabs button[data-ptab="places"]'); await pg.wait_for_timeout(800)
        ok = await L.tap(pg, cdp, '#phoneBody [data-place="campus|共同教學館"]')
        await pg.wait_for_timeout(6000)
        await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(1000)
        await L.tap(pg, cdp, '#phoneTabs button[data-ptab="places"]'); await pg.wait_for_timeout(800)
        ok = await L.tap(pg, cdp, '#phoneBody [data-place="campus|大一女舍（門口）"]')
        run.check('手機「地點」→ 大一女舍（門口）', ok)
        await pg.wait_for_timeout(6000)
        s = await L.state(pg)
        run.check('到大一女舍門口前、站得住、不在建築裡', s['zone'] == 'campus' and s['stand'] and math.hypot(s['x'] + 93, s['z'] - 56) < 1.5, json.dumps(s, ensure_ascii=False))
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:3], ensure_ascii=False))
        await b.close()
    return run.finish()


sys.exit(asyncio.run(main()))
