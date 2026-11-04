# -*- coding: utf-8 -*-
"""自測 2：斷言每次都 FAIL（預期文字故意寫錯）"""
import os, sys, asyncio
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import st_common as C
from playwright.async_api import async_playwright


async def main():
    async with async_playwright() as p:
        b, ctx, pg = await C.open_page(p)
        await C.act(pg)
        got = await pg.inner_text('#msg') if not C.GAME else await pg.evaluate("GAME.G?GAME.G.zone:null")
        await pg.screenshot(path=os.path.join(C.OUT, 'assert.png'))
        C.check('文字是「這不可能」（故意寫錯的預期）', got == '這不可能', '預期 這不可能，實際 %s' % got)
        await b.close()
    C.finish()

asyncio.run(main())
