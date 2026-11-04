# -*- coding: utf-8 -*-
"""自測 6：瀏覽器程序異常結束（CDP Browser.crash），之後的操作丟 TargetClosedError＝ENVIRONMENT"""
import os, sys, asyncio
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import st_common as C
from playwright.async_api import async_playwright


async def main():
    async with async_playwright() as p:
        b, ctx, pg = await C.open_page(p)
        await C.act(pg)
        cdp = await b.new_browser_cdp_session()
        print('  讓瀏覽器當掉（Browser.crash）', flush=True)
        try:
            await asyncio.wait_for(cdp.send('Browser.crash'), 5)   # 瀏覽器死了就不會回應：最多等 5 秒
        except Exception as e:
            print('  Browser.crash 回傳：%r' % (e,), flush=True)
        await asyncio.sleep(2)
        v = await pg.evaluate('1+1')        # 瀏覽器已經沒了：這裡丟例外
        C.check('瀏覽器還活著', v == 2)
    C.finish()

asyncio.run(main())
