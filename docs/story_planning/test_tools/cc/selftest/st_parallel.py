# -*- coding: utf-8 -*-
"""自測 8：兩項同時跑（佇列放兩行、--parallel 2）。每項 FAIL（會重跑、留 trace），out 裡寫一個帶 CC_ITEM 的檔，證據要各在各的目錄"""
import os, sys, asyncio, time
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import st_common as C
from playwright.async_api import async_playwright

ITEM = os.environ.get('CC_ITEM') or 'x'


async def main():
    async with async_playwright() as p:
        b, ctx, pg = await C.open_page(p)
        if not C.GAME:
            await pg.fill('#name', ITEM); await pg.click('#go')
        open(os.path.join(C.OUT, 'who.txt'), 'w', encoding='utf-8').write('%s %d\n' % (ITEM, os.getpid()))
        for _ in range(8):
            await pg.wait_for_timeout(1000)
        await pg.screenshot(path=os.path.join(C.OUT, 'par_%s.png' % ITEM))
        C.check('%s 故意 FAIL' % ITEM, False, '看證據有沒有混在一起')
        await b.close()
    C.finish()

asyncio.run(main())
