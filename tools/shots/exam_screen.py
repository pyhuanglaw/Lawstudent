"""期末考的畫面（AA_130 第 6 節：手機模擬直向、橫向各一次）——[前置／捷徑] 讀檔到大三上刑訴期末考那天的霖澤館 201，直接呼叫 CLS.runExam 開考；
只拍考試畫面（題目、四個選項在手機上排得下嗎、交卷後的答案說明），不測走進教室的流程。Playwright 手機模擬＋SwiftShader，不是 iPhone 實機。
用法：python3 tools/shots/exam_screen.py URL [輸出資料夾]"""
import asyncio, json, sys, os
from playwright.async_api import async_playwright
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'tests'))
import playlib as L
URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8765/index.html'
OUT = sys.argv[2] if len(sys.argv) > 2 else '/tmp/exam_screen'
os.makedirs(OUT, exist_ok=True)
FLAGS = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True}

async def main():
    async with async_playwright() as p:
        for landscape in (True, False):
            tag = 'land' if landscape else 'port'
            b, ctx, pg, cdp, errs = await L.launch(p, landscape=landscape)
            await pg.goto(URL); await L.wait_loaded(pg)
            d = await pg.evaluate("(()=>{ const c=CLS.byId('crimpro'); const x=CLS.examDay({courses:{},flags:{}},c,'Y3S1','final'); return x&&x.day; })()")
            wd = await pg.evaluate("(d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; })(%d)" % d)
            await L.load_state(pg, {'zone': 'classroom', 'day': d, 'weekday': wd, 'hour': 9.2, 'weather': 'clear', 'flags': dict(FLAGS)}, quiet_events=True)
            await pg.wait_for_timeout(8000)
            await pg.evaluate("void CLS.runExam(GAME,{c:CLS.byId('crimpro'),exam:'final',term:'Y3S1'})")
            info = []
            for step in range(6):
                for _ in range(60):
                    n = await pg.evaluate("document.querySelectorAll('#choices button').length")
                    if n: break
                    s = await L.state(pg)
                    if s['dlg']: await L.tap(pg, cdp, '#dlg')
                    await pg.wait_for_timeout(700)
                txt = await pg.evaluate("[...document.querySelectorAll('#choices button')].map(b=>b.textContent)")
                info.append(txt)
                if step in (0, 1): await pg.screenshot(path=os.path.join(OUT, f'exam_q{step+1}_{tag}.png'))
                if not txt: break
                await L.tap(pg, cdp, '#choices button:nth-child(1)')
                await pg.wait_for_timeout(1500)
            for _ in range(20):   # 交卷後的說明
                s = await L.state(pg)
                if s['dlg'] and ('交卷' in (s['dtext'] or '') or '的答案' in (s['dtext'] or '')): break
                if s['dlg']: await L.tap(pg, cdp, '#dlg')
                await pg.wait_for_timeout(700)
            await pg.screenshot(path=os.path.join(OUT, f'exam_after_{tag}.png'))
            res = await pg.evaluate("JSON.stringify((CLS.rec(GAME.G).exam||{})['Y3S1:crimpro:final']||null)")
            print(tag, 'day', d, 'choices', json.dumps(info[:2], ensure_ascii=False)[:300], 'result', res, 'errors', errs[:3])
            await b.close()

asyncio.run(main())
