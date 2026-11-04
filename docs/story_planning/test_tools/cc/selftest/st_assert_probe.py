# -*- coding: utf-8 -*-
"""自測 2b（BB-C 11-04 TEST-TRACE V2）：斷言比對探針自己的兩個常數（和遊戲無關）→ runner 要判 TEST_BUG（assert-probe）。
頁面照 st_common（預設小頁；ST_PAGE=game 也行），只是讓 trace 有時間軸。"""
import os, sys, asyncio
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import st_common as C
from playwright.async_api import async_playwright

EXPECT_N = 3   # 探針自己的常數
ACTUAL_N = 4   # 故意寫錯：探針自己算錯


async def main():
    async with async_playwright() as p:
        b, ctx, pg = await C.open_page(p)
        await C.act(pg)
        await pg.screenshot(path=os.path.join(C.OUT, 'assert_probe.png'))
        C.check('探針的兩個常數相等（故意寫錯）', EXPECT_N == ACTUAL_N, '探針常數 EXPECT_N＝%d、ACTUAL_N＝%d' % (EXPECT_N, ACTUAL_N), src='probe')
        await b.close()
    C.finish()

asyncio.run(main())
