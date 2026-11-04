# -*- coding: utf-8 -*-
"""自測 4：等一個不存在的選擇器 → playwright TimeoutError（探針沒接住，Python traceback）＝TEST_BUG"""
import os, sys, asyncio
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import st_common as C
from playwright.async_api import async_playwright


async def main():
    async with async_playwright() as p:
        b, ctx, pg = await C.open_page(p)
        await C.act(pg)
        await pg.wait_for_selector('#no-such-button', timeout=3000)
        C.check('找到按鈕', True)
        await b.close()
    C.finish()

asyncio.run(main())
