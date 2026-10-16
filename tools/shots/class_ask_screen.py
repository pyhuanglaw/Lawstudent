"""課堂提問的畫面（AA_130 第 3 節第 3 點；手機模擬直向、橫向）——[前置／捷徑] 讀檔到大一上民法總則第 5 週那一堂的教室，直接呼叫 CLS.classAsk；
只拍提問畫面（題幹＋四個選項排得下嗎、答案＋考點、教授那句），不測坐下上課的流程。Playwright 手機模擬＋SwiftShader，不是 iPhone 實機。
用法：python3 tools/shots/class_ask_screen.py URL [輸出資料夾]"""
import asyncio, json, sys, os
from playwright.async_api import async_playwright
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'tests'))
import playlib as L
URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8765/index.html'
OUT = sys.argv[2] if len(sys.argv) > 2 else '/tmp/class_ask_screen'
os.makedirs(OUT, exist_ok=True)
FLAGS = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True}
FIND = """(()=>{ for(let d=1;d<400;d++){ const t=CALENDAR.termOf(d); if(!t||t.id!=='Y1S1'||t.week!==5) continue; const it=CLS.dayItems({day:d,hour:8,flags:{},courses:{}},d).find(x=>x.c.id==='civ_general'&&!x.exam); if(it) return {day:d,t0:it.t0,zone:it.room.zone||'classroom'}; } return null; })()"""

async def main():
    async with async_playwright() as p:
        for landscape in (False, True):
            tag = 'land' if landscape else 'port'
            b, ctx, pg, cdp, errs = await L.launch(p, landscape=landscape)
            await pg.goto(URL); await L.wait_loaded(pg)
            f = await pg.evaluate(FIND)
            wd = await pg.evaluate("(d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; })(%d)" % f['day'])
            await L.load_state(pg, {'zone': f['zone'], 'day': f['day'], 'weekday': wd, 'hour': f['t0'] + 0.2, 'weather': 'clear', 'flags': dict(FLAGS)}, quiet_events=True)
            await pg.wait_for_timeout(8000)
            await pg.evaluate("void (async()=>{ const it=CLS.dayItems(GAME.G).find(x=>x.c.id==='civ_general'&&!x.exam); GAME.sceneBegin(); try{ await CLS.classAsk(GAME,it,null,null); } finally { GAME.sceneEnd(); } })()")
            seen = []; shot = 0
            for _ in range(80):
                n = await pg.evaluate("document.querySelectorAll('#choices button').length")
                s = await L.state(pg)
                if n:
                    await pg.screenshot(path=os.path.join(OUT, f'ask_1_question_{tag}.png'))
                    seen.append('choices:' + json.dumps(await pg.evaluate("[...document.querySelectorAll('#choices button')].map(b=>b.textContent)"), ensure_ascii=False))
                    await L.tap(pg, cdp, '#choices button:nth-child(2)'); await pg.wait_for_timeout(1500); continue
                if s['dlg']:
                    t = s['dtext'] or ''
                    if not seen or seen[-1] != t: seen.append(t)
                    if t.startswith('答案是') and shot == 0: await pg.wait_for_timeout(2500); await pg.screenshot(path=os.path.join(OUT, f'ask_2_answer_{tag}.png')); shot = 1
                    if '期末考，會考' in t and shot == 1: await pg.wait_for_timeout(2500); await pg.screenshot(path=os.path.join(OUT, f'ask_3_prof_{tag}.png')); shot = 2
                    await L.tap(pg, cdp, '#dlg')
                elif shot == 2: break
                await pg.wait_for_timeout(700)
            rec = await pg.evaluate("JSON.stringify(CLS.rec(GAME.G).ask)")
            print(tag, 'day', f['day'], json.dumps(seen, ensure_ascii=False)[:900], 'rec', rec, 'errors', errs[:3])
            await b.close()

asyncio.run(main())
