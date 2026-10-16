"""出遊 2D 背景驗收截圖（政大校門、山下的小吃街；LAWWW2-B 825c038）：手機直向、橫向的實際 ADV 畫面。
[前置／捷徑] 讀檔到宿舍；直接演 ev_kexin_tour_nccu（OUT 的出遊流程會先轉場，這裡跳過轉場），每到一個 {scene,bg} 換景就截圖。Playwright 手機模擬＋SwiftShader，不是 iPhone 實機。
檢查：畫面上的背景圖片網址是 assets/bg/nccu_gate.webp、nccu_food.webp。
用法：python3 tools/shots/outing_bg_check.py URL 輸出資料夾"""
import asyncio, json, sys, os
from playwright.async_api import async_playwright
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'tests'))
import playlib as L
URL, OUT = sys.argv[1], sys.argv[2]
os.makedirs(OUT, exist_ok=True)
FLAGS = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True}
START = "(()=>{ const ev=STORY_EVENTS.find(e=>e.id==='ev_kexin_tour_nccu'); ADV.begin({background:'dark'}); void EVENTS.run(ev); return true; })()"
BGS = "(()=>{ const out=[]; for(const el of document.querySelectorAll('*')){ const b=getComputedStyle(el).backgroundImage; if(b&&/assets\\/bg\\//.test(b)) out.push(b); } for(const i of document.querySelectorAll('img')){ const u=i.currentSrc||i.src; if(/assets\\/bg\\//.test(u)) out.push(u); } return out; })()"
async def main():
    seen = {}
    async with async_playwright() as p:
        for mode in ('port', 'land'):
            b, ctx, pg, cdp, errs = await L.launch(p, landscape=(mode == 'land'))
            await pg.goto(URL); await L.wait_loaded(pg)
            await L.load_state(pg, {'zone': 'dorm', 'hour': 15.0, 'day': 20, 'weekday': 6, 'weather': 'clear', 'flags': dict(FLAGS)}, quiet_events=True)
            await pg.wait_for_timeout(4000)
            await pg.evaluate(START); await pg.wait_for_timeout(2500)
            shots = 0
            for i in range(40):
                s = await L.state(pg)
                bgs = await pg.evaluate(BGS)
                key = ','.join(sorted(set(x.split('assets/bg/')[1].split('.')[0] for x in bgs)))
                if key and key not in seen.get(mode, set()):
                    seen.setdefault(mode, set()).add(key)
                    await pg.screenshot(path=os.path.join(OUT, f'{key}_{mode}.png')); shots += 1
                if s['choices']:
                    c = await pg.evaluate("(()=>{ const e=document.querySelector('#choices button'); e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })()")
                    await L.touch_tap(cdp, c[0], c[1])
                elif s['dlg']:
                    await L.tap(pg, cdp, '#dlg')
                else:
                    break
                await pg.wait_for_timeout(700)
            print(mode, 'shots', shots, 'seen', sorted(seen.get(mode, [])), 'errors', errs[:3], flush=True)
            await b.close()
    ok = all({'nccu_gate', 'nccu_food'} <= seen.get(m, set()) for m in ('port', 'land'))
    print('ALL PASS' if ok else 'FAILED')
asyncio.run(main())
