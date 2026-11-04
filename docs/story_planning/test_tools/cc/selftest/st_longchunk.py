# -*- coding: utf-8 -*-
"""自測 11（分段 trace，BB 11-04 07:19）：開遊戲頁，三個 CASE（== A、== B、== C）各動 40 秒（每秒點一下畫面中間、截一次圖），只有 C 最後斷言 FAIL。
第一次 FAIL → runner 開 CC_TRACE=1 重跑：預期 attempt2/trace/ 只剩 C 那一段＋最後 2 段（CC_TRACE_KEEP_LAST），A 那段被刪掉；每段都比整份小。
CC_TRACE_CHUNK_S 建議設 30，這樣每個 CASE 裡也會依時間換段。"""
import os, sys, asyncio
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import st_common as C
from playwright.async_api import async_playwright

SECS = int(os.environ.get('ST_SECS') or 40)


async def main():
    async with async_playwright() as p:
        b, ctx, pg = await C.open_page(p)
        for name in 'ABC':
            print('== %s' % name, flush=True)
            for i in range(SECS):
                await pg.mouse.click(320, 200); await pg.wait_for_timeout(1000)
            await pg.screenshot(path=os.path.join(C.OUT, 'long_%s.png' % name))
            C.check('CASE %s 結束' % name, name != 'C', '自測：C 故意 FAIL')
        await b.close()
    C.finish()

asyncio.run(main())
