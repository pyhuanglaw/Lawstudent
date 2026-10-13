"""真實玩家流程：社科院圖書館（辜振甫先生紀念圖書館一樓；D56 社科院第①步，2026-10-13）。不用 ?turbo。
玩家操作一律走真的介面（觸控點地面、互動按鈕、手機按鈕）；前置條件（讀檔到某天某時某地）用 [前置／捷徑] 標示。
A. 從霖澤館前點地面走到社科院正面：不瞬移；到門口出現「進入社科院圖書館」；按下去進館（站在入口、正式模型載入）。
B. 自己走過閘門、走到閱覽長桌的座位旁：出現「坐下讀書」→ 坐下（姿勢 sit）→「坐一下」→ 起身後站得住。
C. 走進一個林間書房（弧形書架圍著樹狀柱）：「看書架（林間書房）」有說明。
D. 走到北面玻璃帷幕前的窗邊座位坐下、起身。
E. 自己走到出口：「離開圖書館（回社科院前）」→ 回到校園社科院正門前、面向西、不會一出來又跳出「進入社科院圖書館」；再自己走回霖澤館前（不會卡在門口）。
F. 手機「地點」→ 社科院圖書館：到圖書館入口、站得住、時間有過。
G. [前置] 晚上 20:30 在館裡：天窗變暗（自發光比白天低）、窗外換夜景。
用法：python3 tests/flow_soclib.py URL [輸出資料夾]"""
import asyncio, json, sys, math
from playwright.async_api import async_playwright
sys.path.insert(0, __import__('os').path.dirname(__file__))
import playlib as L

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8765/index.html'
OUT = sys.argv[2] if len(sys.argv) > 2 else '/tmp/flow_soclib'
DAY_FRI = 3   # 9/19 週五
BASE_FLAGS = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True, 'metAn': True, 'zheNoodleDone': True}
SKY = "(()=>{ const ms=[]; GAME.E.zone.group.traverse(o=>{ if(o.isMesh&&o.material&&/^soclib_skylight/.test(o.material.name||'')&&!ms.includes(o.material)) ms.push(o.material); }); return ms.length?ms[0].emissiveIntensity:null; })()"


async def wait_formal(pg, sec=90):
    for _ in range(sec):
        if await pg.evaluate("!!(GAME.E.zone&&GAME.E.zone.formal)"): return True
        await pg.wait_for_timeout(1000)
    return False


async def sit_and_stand(pg, cdp, run, label):
    await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(2500)
    opts = await pg.evaluate("[...document.querySelectorAll('#choices button')].map(b=>b.textContent)")
    pose = await pg.evaluate("GAME.E.player.pose")
    run.check(label + '：坐下（姿勢 sit）、有「坐一下」可以選', pose == 'sit' and any('坐一下' in o for o in opts), f'pose={pose} ' + json.dumps(opts, ensure_ascii=False))
    await run.shot(pg, label + '_seated')
    idx = next((i for i, o in enumerate(opts) if '坐一下' in o), 0)
    s = await L.advance_dialogs(pg, cdp, run, until=lambda q: not q['busy'] and not q['dlg'] and not q['choices'], pick=idx)
    pose = await pg.evaluate("GAME.E.player.pose")
    run.check(label + '：起身後站得住（不在桌子、書架裡）', pose != 'sit' and s['stand'], f'pose={pose} ' + json.dumps(s, ensure_ascii=False))


async def main():
    run = L.Run('flow_soclib', OUT)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        run.check('遊戲載入', await L.wait_loaded(pg))
        # ---------- A：從霖澤館前走到社科院正面、進館 ----------
        run.setup('讀檔：第 3 天（9/19 週五）10:00，霖澤館前 (34,-98)')
        await L.load_state(pg, {'zone': 'campus', 'hour': 10.0, 'day': DAY_FRI, 'weekday': 5, 'weather': 'sunny', 'pos': {'x': 34, 'z': -98, 'yaw': 1.57}, 'flags': BASE_FLAGS})
        await pg.wait_for_timeout(3500)
        d = await L.find_it(pg, '進入社科院圖書館')
        run.check('校園有「進入社科院圖書館」（社科院正面中間、一樓）', bool(d) and abs(d['x'] - 97.9) < 0.6 and abs(d['z'] + 70) < 0.6, json.dumps(d, ensure_ascii=False))
        ok = await L.go_to(pg, cdp, run, d['x'], d['z'], 1.2, '社科院正門')
        s = await L.state(pg)
        run.check('自己走到社科院正門（點地面，沒有瞬移）、出現「進入社科院圖書館」', ok and s['interact'].startswith('進入社科院圖書館'), json.dumps(s, ensure_ascii=False))
        await run.shot(pg, 'A_at_door')
        await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(5000)
        s = await L.state(pg)
        run.check('按下去：進到社科院圖書館、站在入口（閘門外）、站得住', s['zone'] == 'soclib' and s['stand'] and abs(s['x'] + 9) < 1.0 and s['z'] > 8.5, json.dumps(s, ensure_ascii=False))
        run.check('正式模型載入（LAWWW2 ⑬；沒有就是程序化備用模型）', await wait_formal(pg))
        await pg.wait_for_timeout(2500)
        await run.shot(pg, 'A_entrance')
        # ---------- B：走過閘門、坐在閱覽長桌 ----------
        seat = await pg.evaluate("(()=>{ const s=GAME.E.zone.seats.filter(q=>q.kind==='table')[3]; return s?{x:s.x,z:s.z,yaw:s.yaw}:null; })()")
        ax, az = seat['x'] - math.sin(seat['yaw']) * 0.6, seat['z'] - math.cos(seat['yaw']) * 0.6   # 椅子後面
        ok = await L.go_to(pg, cdp, run, ax, az, 0.35, '閱覽長桌的座位後面')
        s = await L.state(pg)
        run.check('自己走過閘門、走到閱覽長桌的座位旁、出現「坐下讀書」', ok and s['interact'].startswith('坐下讀書') and s['z'] < 7.5, json.dumps(s, ensure_ascii=False))
        await sit_and_stand(pg, cdp, run, 'B_table')
        # ---------- C：林間書房 ----------
        gv = await pg.evaluate("(()=>{ const g=SL3.groves(SOCLIB_LAYOUT)[0]; return {x:g.x,z:g.z}; })()")
        ok = await L.go_to(pg, cdp, run, gv['x'], gv['z'], 0.6, '林間書房（弧形書架裡面）')
        s = await L.state(pg)
        run.check('走進林間書房、出現「看書架（林間書房）」', ok and s['interact'].startswith('看書架（林間書房）'), json.dumps(s, ensure_ascii=False))
        await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1500)
        cap = await pg.evaluate("(document.getElementById('caption')||{}).textContent||''")
        run.check('按下去：有說明（弧形的竹書架、樹狀柱、天窗）', '樹狀柱' in cap, cap)
        await run.shot(pg, 'C_grove')
        await pg.wait_for_timeout(4000)
        # ---------- D：窗邊座位 ----------
        seat = await pg.evaluate("(()=>{ const s=GAME.E.zone.seats.filter(q=>q.kind==='window')[8]; return s?{x:s.x,z:s.z,yaw:s.yaw}:null; })()")
        ax, az = seat['x'] - math.sin(seat['yaw']) * 0.6, seat['z'] - math.cos(seat['yaw']) * 0.6
        ok = await L.go_to(pg, cdp, run, ax, az, 0.35, '北面窗邊的座位後面')
        s = await L.state(pg)
        run.check('走到北面玻璃帷幕前的窗邊座位、出現「坐下讀書（窗邊）」', ok and s['interact'].startswith('坐下讀書（窗邊）'), json.dumps(s, ensure_ascii=False))
        await sit_and_stand(pg, cdp, run, 'D_window')
        # ---------- E：走出去 ----------
        ex = await L.find_it(pg, '離開圖書館')
        ok = await L.go_to(pg, cdp, run, ex['x'], ex['z'] - 0.3, 0.8, '出口')
        s = await L.state(pg)
        run.check('自己走回閘門外、走到出口、出現「離開圖書館（回社科院前）」', ok and s['interact'].startswith('離開圖書館'), json.dumps(s, ensure_ascii=False))
        await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(5000)
        s = await L.state(pg)
        run.check('回到校園社科院正門前、站得住、不會一出來又跳出「進入社科院圖書館」', s['zone'] == 'campus' and s['stand'] and math.hypot(s['x'] - 95.6, s['z'] + 70) < 1.0 and not s['interact'].startswith('進入社科院圖書館'), json.dumps(s, ensure_ascii=False))
        await run.shot(pg, 'E_back_campus')
        ok = await L.go_to(pg, cdp, run, 60, -92, 1.2, '法學院廣場（往霖澤館走）')
        s = await L.state(pg)
        run.check('從門口自己走回法學院廣場（不會卡在門口）', ok and s['stand'], json.dumps(s, ensure_ascii=False))
        # ---------- F：手機「地點」→ 社科院圖書館 ----------
        h0 = s['hour']
        await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(1000)
        await L.tap(pg, cdp, '#phoneTabs button[data-ptab="places"]'); await pg.wait_for_timeout(800)
        txt = await pg.evaluate("(document.getElementById('phoneBody')||{}).textContent||''")
        run.check('手機「地點」有社科院圖書館', '社科院圖書館' in txt, txt[:200])
        ok = await L.tap(pg, cdp, '#phoneBody [data-place="soclib|社科院圖書館"]')
        run.check('點「前往」', ok)
        await pg.wait_for_timeout(7000)
        s = await L.state(pg)
        run.check('到社科院圖書館入口、站得住、時間有過', s['zone'] == 'soclib' and s['stand'] and s['hour'] > h0, json.dumps(s, ensure_ascii=False))
        # ---------- G：晚上 ----------
        day_sky = await pg.evaluate(SKY) if await wait_formal(pg, 60) else None
        run.setup('讀檔：第 3 天 20:30，社科院圖書館入口')
        await L.load_state(pg, {'zone': 'soclib', 'hour': 20.5, 'day': DAY_FRI, 'weekday': 5, 'weather': 'sunny', 'pos': {'x': -9, 'z': 9.3, 'yaw': 3.14}, 'flags': BASE_FLAGS})
        await pg.wait_for_timeout(3500)
        await wait_formal(pg, 60); await pg.wait_for_timeout(2500)
        night_sky = await pg.evaluate(SKY)
        run.check('晚上天窗變暗（自發光比白天低）', day_sky is not None and night_sky is not None and night_sky < day_sky * 0.5, f'白天 {day_sky}、晚上 {night_sky}')
        await run.shot(pg, 'G_night')
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:3], ensure_ascii=False))
        await b.close()
    return run.finish()


sys.exit(asyncio.run(main()))
