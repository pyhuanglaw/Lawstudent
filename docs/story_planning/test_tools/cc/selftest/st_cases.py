# -*- coding: utf-8 -*-
"""自測 9（BB 補充 2）：有 CASES 的探針，只有 B 會 FAIL → 重跑時 runner 應該只帶 CASES=B。每一段前面印「== X」。"""
import os, sys, asyncio
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import st_common as C
from playwright.async_api import async_playwright

CASES = [c.strip() for c in (os.environ.get('CASES') or 'A,B').split(',') if c.strip()]


async def main():
    print('  這一次的 CASES=%s' % ','.join(CASES), flush=True)
    async with async_playwright() as p:
        b, ctx, pg = await C.open_page(p)
        print('  [前置／捷徑] 自測頁（每個 CASE 都做同樣的前置：填名字、按按鈕）', flush=True)
        if 'A' in CASES:
            print('== A 一定會過', flush=True)
            await C.act(pg)
            C.check('A 文字有變', (await pg.inner_text('#msg')).startswith('按過了'))
        if 'B' in CASES:
            print('== B 一定會 FAIL', flush=True)
            await C.act(pg)
            C.check('B 文字是「錯的預期」', (await pg.inner_text('#msg')) == '錯的預期', '實際 %s' % await pg.inner_text('#msg'))
        await b.close()
    C.finish()

asyncio.run(main())
