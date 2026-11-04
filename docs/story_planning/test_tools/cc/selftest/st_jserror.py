# -*- coding: utf-8 -*-
"""自測 5：頁面丟 JS 例外＋console.error，接著斷言 FAIL；留下例外前後截圖。
自測頁：寫一個 html 到 out/ 用 file:// 開（順便驗路徑清理）；ST_PAGE=game：開遊戲頁，用頁面自己的 <script> 呼叫不存在的 GAME 函式。"""
import os, sys, asyncio, pathlib
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import st_common as C
from playwright.async_api import async_playwright

PAGE = C.HTML + """<script>function boom(){ console.error('自測：要丟例外了'); null.notAFunction(); }
document.getElementById('go').addEventListener('click', ()=>setTimeout(boom, 50));</script>"""
INJECT = """() => { const s = document.createElement('script');
  s.textContent = "setTimeout(function ccSelftestBoom(){ console.error('自測：呼叫不存在的 GAME 函式'); GAME.ccSelftestMissingFn(); }, 50);";
  document.head.appendChild(s); }"""


async def main():
    async with async_playwright() as p:
        if C.GAME:
            b, ctx, pg = await C.open_page(p)
        else:
            b = await p.chromium.launch(); ctx = await b.new_context(viewport={'width': 640, 'height': 400}); pg = await ctx.new_page()
            f = pathlib.Path(C.OUT) / 'st_jserror_page.html'; f.write_text(PAGE, encoding='utf-8')
            await pg.goto(f.as_uri())
        errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.screenshot(path=os.path.join(C.OUT, 'jserror_before.png'))
        if C.GAME:
            await pg.evaluate(INJECT)
        else:
            await pg.fill('#name', '祐廷'); await pg.click('#go')
        await pg.wait_for_timeout(1000)
        await pg.screenshot(path=os.path.join(C.OUT, 'jserror_after.png'))
        C.check('頁面沒有 JS 例外', not errs, '實際：%s' % errs[:2])
        await b.close()
    C.finish()

asyncio.run(main())
