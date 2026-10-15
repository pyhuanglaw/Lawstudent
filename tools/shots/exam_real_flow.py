"""期末考的畫面——真實流程（交班清單第 2 項；AA_130 第 6 節：手機直向、橫向）。
[前置／捷徑] 讀檔到 2025-12-24（週三，大一上第 17 週）08:55 霖澤館二樓 201 門口＝刑法總則（一）期末考那一堂；第一、二天主線已過、關掉條件事件。
之後全部是玩家操作：點「進入 201」→ 自己走到座位 → 坐下 → 第一個選項「上課：刑法總則（一）」→ 考卷發下來 → 五題每題點第一個選項 → 交卷 → 答錯的題目說明 → 下課。
每題、交卷、說明各截一張（直向、橫向各跑一次）。Playwright 手機模擬＋SwiftShader，不是 iPhone 實機。
用法：python3 tools/shots/exam_real_flow.py URL [輸出資料夾]"""
import asyncio, json, sys, os
from playwright.async_api import async_playwright
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'tests'))
import playlib as L
URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8765/index.html'
OUT = sys.argv[2] if len(sys.argv) > 2 else '/tmp/exam_real_flow'
os.makedirs(OUT, exist_ok=True)
FLAGS = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True, 'metAn': True, 'zheNoodleDone': True}
DAY = 99   # 2025-12-24 週三

async def main():
    fails = 0
    async with async_playwright() as p:
        for landscape in (True, False):
            tag = 'land' if landscape else 'port'
            b, ctx, pg, cdp, errs = await L.launch(p, landscape=landscape)
            run = L.Run('exam_real_flow_' + tag, OUT)
            await pg.goto(URL); await L.wait_loaded(pg)
            run.setup('讀檔：2025-12-24（週三）08:55 霖澤館二樓 201 門口；關掉條件事件')
            await L.load_state(pg, {'zone': 'linze', 'hour': 8.92, 'day': DAY, 'weekday': 3, 'weather': 'clear', 'pos': {'x': -2.0, 'z': -6.0, 'lv': 1, 'yaw': 3.14}, 'flags': FLAGS}, quiet_events=True)
            await pg.wait_for_timeout(5000)
            s = await L.state(pg)
            for _ in range(20):
                if s['interact'].startswith('進入 201'): break
                await pg.wait_for_timeout(1500); s = await L.state(pg)
            run.check('門口出現「進入 201」', s['interact'].startswith('進入 201'), s['interact'])
            await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(5000)
            seat = await pg.evaluate("(()=>{ const s=GAME.E.zone.seats.find(q=>q.row===2&&q.col===3); return s?{x:s.x,z:s.z}:null; })()")
            ok = bool(seat) and await L.go_to(pg, cdp, run, seat['x'], seat['z'] + 0.35, 0.45, '座位')
            s = await L.state(pg)
            run.check('自己走到座位、出現「坐下」', ok and s['interact'].startswith('坐下'), s['interact'])
            await L.tap(pg, cdp, '#interact')
            first = ''
            for _ in range(20):
                await pg.wait_for_timeout(700)
                first = await pg.evaluate("(()=>{ const b=document.querySelector('#choices button'); return b?b.textContent:''; })()")
                if first: break
            run.check('第一個選項「上課：刑法總則（一）」', first.startswith('上課：刑法總則（一）'), first)
            await L.tap(pg, cdp, '#choices button:nth-child(1)'); await pg.wait_for_timeout(1500)
            q_n, seen, shot_after, shot_expl = 0, [], False, False
            for _ in range(160):
                st = await L.state(pg)
                full = await pg.evaluate("(()=>{ const D=GAME.D; return D&&D.active?String(D.full||''):''; })()")
                t = full or st['dtext']
                if t and (not seen or seen[-1] != t): seen.append(t)
                if st['choices']:
                    q_n += 1
                    await pg.wait_for_timeout(1500); await pg.screenshot(path=os.path.join(OUT, f'exam_q{q_n}_{tag}.png'))
                    await L.tap(pg, cdp, '#choices button:nth-child(1)'); await pg.wait_for_timeout(1500); continue
                if st['dlg']:
                    if t.startswith('交卷') and not shot_after: await pg.wait_for_timeout(2500); await pg.screenshot(path=os.path.join(OUT, f'exam_after_{tag}.png')); shot_after = True
                    if '的答案' in t and not shot_expl: await pg.wait_for_timeout(2500); await pg.screenshot(path=os.path.join(OUT, f'exam_explain_{tag}.png')); shot_expl = True
                    await L.tap(pg, cdp, '#dlg')
                elif not st['busy'] and q_n: break
                await pg.wait_for_timeout(800)
            res = await pg.evaluate("JSON.stringify((CLS.rec(GAME.G).exam||{})['Y1S1:crim_gen1:final']||null)")
            run.check('考了五題、有交卷（答對題數、分數記在存檔）', q_n == 5 and '"status":"done"' in res, f'題數 {q_n} {res}')
            run.check('交卷那一頁截到了', shot_after)
            print(tag, json.dumps(seen, ensure_ascii=False)[:1200], flush=True)
            run.check('沒有 JS 例外', not errs, json.dumps(errs[:3], ensure_ascii=False))
            fails += 0 if run.finish() == 0 else 1
            await b.close()
    return fails

sys.exit(asyncio.run(main()))
