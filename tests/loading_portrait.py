"""直向開遊戲：載入中看得到進度條，「請把手機轉成橫向」載入完才出（使用者 2026-10-16 iPhone 直向截圖：提示蓋在載入畫面上，進度條幾乎看不見、像當機）。
直向 390×844、限速 2 MB/s（載入久一點才看得到中間）：
  1. 載入中（#loading 還在）：#rotate 沒有顯示、進度條和文字是畫面最上層；
  2. 載入完：#rotate 出現（點一下關掉，照舊可以直向玩）。
舊版（#rotate 一開始就有 want）第 1 項失敗。用法：python3 tests/loading_portrait.py URL [輸出資料夾]"""
import asyncio, json, sys, time
from playwright.async_api import async_playwright
sys.path.insert(0, __import__('os').path.dirname(__file__))
import playlib as L

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8765/index.html'
OUT = sys.argv[2] if len(sys.argv) > 2 else '/tmp/loading_portrait'
TOP = """(()=>{ const r=document.getElementById('loadMsg').getBoundingClientRect(), b=document.getElementById('bar').getBoundingClientRect();
  const t1=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2), t2=document.elementFromPoint(b.left+b.width/2,b.top+b.height/2);
  const rot=getComputedStyle(document.getElementById('rotate')).display;
  return {loading:!document.getElementById('loading').classList.contains('hide'), rot, msg:t1?(t1.id||t1.tagName):null, bar:t2?(t2.id||t2.closest('#bar')?'bar':t2.tagName):null, text:document.getElementById('loadMsg').textContent}; })()"""


async def main():
    run = L.Run('loading_portrait', OUT)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=False)
        await cdp.send('Network.enable'); await cdp.send('Network.setCacheDisabled', {'cacheDisabled': True})
        await cdp.send('Network.emulateNetworkConditions', {'offline': False, 'latency': 40, 'downloadThroughput': 2 * 1048576, 'uploadThroughput': 1048576})
        await pg.goto(URL)
        mid = None; t0 = time.time()
        while time.time() - t0 < 120:
            try:
                q = await pg.evaluate(TOP)
            except Exception:
                await pg.wait_for_timeout(300); continue
            if q['loading'] and ('MB' in q['text'] or '載入' in q['text']): mid = q; await run.shot(pg, 'loading'); break
            await pg.wait_for_timeout(300)
        run.check('直向載入中：沒有「請把手機轉成橫向」蓋住', bool(mid) and mid['rot'] == 'none', json.dumps(mid, ensure_ascii=False))
        run.check('直向載入中：進度文字、進度條在最上層', bool(mid) and mid['msg'] == 'loadMsg' and mid['bar'] in ('bar', 'I'), json.dumps(mid, ensure_ascii=False))
        ok = await L.wait_loaded(pg, 240)
        await pg.wait_for_timeout(500)
        rot = await pg.evaluate("getComputedStyle(document.getElementById('rotate')).display")
        await run.shot(pg, 'loaded')
        run.check('載入完：直向提示出現', ok and rot == 'flex', f'loaded={ok} rotate={rot}')
        await L.tap(pg, cdp, '#rotate'); await pg.wait_for_timeout(500)
        rot2 = await pg.evaluate("getComputedStyle(document.getElementById('rotate')).display")
        run.check('點一下提示就關掉、可以直向玩', rot2 == 'none', rot2)
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:3], ensure_ascii=False))
        await b.close()
    sys.exit(run.finish())

asyncio.run(main())
