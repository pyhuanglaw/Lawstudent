# -*- coding: utf-8 -*-
"""自測 7：睡得比佇列逾時久（預設 200 秒；ST_SLEEP 可改），runner 要中止它"""
import os, sys, asyncio
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import st_common as C
from playwright.async_api import async_playwright


async def main():
    async with async_playwright() as p:
        b, ctx, pg = await C.open_page(p)
        await C.act(pg)
        n = int(os.environ.get('ST_SLEEP') or 200)
        for i in range(n // 10):
            print('  睡覺中 %d/%d 秒' % (i * 10, n), flush=True)
            await asyncio.sleep(10)
        C.check('睡完了', True)
        await b.close()
    C.finish()

asyncio.run(main())
