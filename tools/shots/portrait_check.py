"""對話立繪驗收截圖（BB_131 第 4 節：標準圖 → 遊戲 ADV 實際畫面；手機直向、橫向、先橫再轉直）。
[前置／捷徑] 讀檔到兩點半 Café；直接呼叫 ADV.begin（右邊放那個人）＋一句對話，不演劇情。Playwright 手機模擬＋SwiftShader，不是 iPhone 實機。
另外檢查：ADV 實際載入的圖片網址都是 assets/portraits/<id>/campus/neutral.webp（沒有舊的 .png）。
用法：python3 tools/shots/portrait_check.py URL 輸出資料夾 [id ...]"""
import asyncio, json, sys, os
from playwright.async_api import async_playwright
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'tests'))
import playlib as L
URL, OUT = sys.argv[1], sys.argv[2]
IDS = sys.argv[3:] or ['heroine_01','heroine_02','heroine_03','heroine_04','heroine_05','kexin','classmate_peishan','zhe','yu','classmate_bohan','classmate_xinci','classmate_mingxuan','classmate_youchen','kai','npc_fangyt','npc_huangxh','prof_zhou','prof_lin','prof_huang']
os.makedirs(OUT, exist_ok=True)
FLAGS = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True}
SHOW = "(async id=>{ ADV.begin({background:'blur',right:id}); void GAME.say({name:(CHARACTERS[id]||{}).name||id,charId:id},'（立繪驗收）'); await new Promise(r=>setTimeout(r,2500)); const im=[...document.querySelectorAll('img')].map(i=>i.currentSrc||i.src).filter(u=>/portraits\\//.test(u)); return im; })(%s)"
END = "(()=>{ try{ ADV.end(); }catch(e){} const d=GAME.D; if(d&&d.active&&GAME.dlgNext) GAME.dlgNext(); return true; })()"
async def main():
    rows = []
    async with async_playwright() as p:
        for mode in ('port', 'land', 'rot'):
            b, ctx, pg, cdp, errs = await L.launch(p, landscape=(mode != 'port'))
            await pg.goto(URL); await L.wait_loaded(pg)
            await L.load_state(pg, {'zone': 'cafe', 'hour': 15.0, 'day': 6, 'weekday': 1, 'weather': 'clear', 'flags': dict(FLAGS)}, quiet_events=True)
            await pg.wait_for_timeout(5000)
            if mode == 'rot':
                await pg.set_viewport_size({'width': 390, 'height': 844}); await pg.wait_for_timeout(2500)
            for cid in IDS:
                urls = await pg.evaluate(SHOW % json.dumps(cid))
                await pg.screenshot(path=os.path.join(OUT, f'{cid}_{mode}.png'))
                rows.append({'id': cid, 'mode': mode, 'urls': urls})
                await pg.evaluate(END); await pg.wait_for_timeout(600)
                for _ in range(6):
                    s = await L.state(pg)
                    if not s['dlg']: break
                    await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(500)
            print(mode, 'errors', errs[:3], flush=True)
            await b.close()
    bad = [r for r in rows if not any(u.endswith('/'+r['id']+'/campus/neutral.webp') for u in r['urls']) or any(u.endswith('.png') for u in r['urls'])]   # 要載入那個人的新立繪、而且沒有任何舊的 .png
    print(json.dumps(rows[:3], ensure_ascii=False)); print('BAD', json.dumps(bad, ensure_ascii=False)[:1500]); print('ALL PASS' if not bad else 'FAILED')
asyncio.run(main())
