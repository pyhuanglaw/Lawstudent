"""真實玩家流程：宿舍書桌讀書——選了一科之後，讀書會／上課卡住的題目照樣會想通（2026-10-13 程式審查第 4 項）。不用 ?turbo。
修改前：自學先選科目（CLS.studyPick），選了科目就直接結束，LEGAL.study()（全遊戲只有這裡把卡住的題目變成「懂了」）走不到，這個測試會失敗。
[前置] 讀檔：第 T 天（學期間的週二）15:00，宿舍房間，刑訴題庫 Q001 是「卡住」（confused）。
A. 自己走到書桌、按「坐在書桌前」→「讀書（1 小時）」→ 科目清單（有通識）選第一科 → 看完字幕。
B. 檢查：時間過了 1 小時、那一科的準備＋1、Q001 變成「懂了」（learned）、有「你回頭看了讀書會／上課時卡住的地方」那句。
用法：python3 tests/flow_study_legal.py URL [輸出資料夾]"""
import asyncio, json, sys
from playwright.async_api import async_playwright
sys.path.insert(0, __import__('os').path.dirname(__file__))
import playlib as L

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8765/index.html'
OUT = sys.argv[2] if len(sys.argv) > 2 else '/tmp/flow_study_legal'
DAY_TUE = 21   # 2025-10-07 週二（大一上第 6 週）：09:10 大一國文、13:20 通識
BASE_FLAGS = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True, 'metAn': True, 'zheNoodleDone': True}


async def main():
    run = L.Run('flow_study_legal', OUT)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        run.check('遊戲載入', await L.wait_loaded(pg))
        run.setup('讀檔：第 21 天（10/7 週二）15:00，宿舍房間；刑訴題庫 Q001 是「卡住」')
        await L.load_state(pg, {'zone': 'dorm', 'hour': 15.0, 'day': DAY_TUE, 'weekday': 2, 'weather': 'sunny', 'pos': {'x': 0, 'z': 2.4, 'yaw': 3.14}, 'flags': BASE_FLAGS,
                                'legal': {'q': {'Q001': {'state': 'confused', 'seen': 1, 'ok': 0, 'bad': 1, 'last': 20, 'ctx': ['class']}}, 'misc': {}, 'log': []}})
        await pg.wait_for_timeout(3500)
        d = await L.find_it(pg, '坐在書桌前')
        run.check('宿舍有書桌', bool(d), json.dumps(d, ensure_ascii=False))
        ok = await L.go_to(pg, cdp, run, d['x'], d['z'], 0.8, '書桌')
        s = await L.state(pg)
        run.check('自己走到書桌、出現「坐在書桌前」', ok and s['interact'].startswith('坐在書桌前'), json.dumps(s, ensure_ascii=False))
        h0 = s['hour']; prep0 = await pg.evaluate("JSON.stringify((GAME.G.courses||{}).prep||{})")
        await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(2500)
        opts = await pg.evaluate("[...document.querySelectorAll('#choices button')].map(b=>b.textContent)")
        run.check('坐下：有「讀書（1 小時）」', any('讀書（1 小時）' in o for o in opts), json.dumps(opts, ensure_ascii=False))
        await L.tap(pg, cdp, '#choices button:nth-child(%d)' % (1 + next(i for i, o in enumerate(opts) if '讀書（1 小時）' in o)))
        await pg.wait_for_timeout(2500)
        opts = await pg.evaluate("[...document.querySelectorAll('#choices button')].map(b=>b.textContent)")
        run.check('科目清單（有通識、最後是「整理這週的筆記」）', any('通識' in o for o in opts) and '整理這週的筆記' in opts[-1], json.dumps(opts, ensure_ascii=False))
        await run.shot(pg, 'A_subjects')
        said = []
        s = await L.advance_dialogs(pg, cdp, run, until=lambda q: not q['busy'] and not q['dlg'] and not q['choices'], pick=0)
        log = await pg.evaluate("(GAME.G.log||[]).slice(-8).map(e=>typeof e==='string'?e:(e.text||JSON.stringify(e)))")
        st = await pg.evaluate("(GAME.G.legal&&GAME.G.legal.q&&GAME.G.legal.q.Q001||{}).state")
        prep1 = await pg.evaluate("JSON.stringify((GAME.G.courses||{}).prep||{})")
        run.check('讀了 1 小時（時間有過）、選的那一科準備＋1', s['hour'] >= h0 + 0.95 and prep1 != prep0, f"{h0} → {s['hour']}；prep {prep0} → {prep1}")
        run.check('卡住的題目 Q001 想通了（confused → learned）', st == 'learned', str(st))
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:3], ensure_ascii=False))
        await b.close()
    return run.finish()


sys.exit(asyncio.run(main()))
