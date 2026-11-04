# -*- coding: utf-8 -*-
"""自測 3：第一次 FAIL、第二次 PASS。記號檔放在暫存資料夾（不在 od 裡），以 CC_ITEM 命名；PASS 時刪掉，所以整項重跑可以重現。"""
import os, sys, asyncio, tempfile
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import st_common as C
from playwright.async_api import async_playwright

MARK = os.path.join(tempfile.gettempdir(), 'cc_selftest_flaky_%s.mark' % (os.environ.get('CC_ITEM') or 'x'))


async def main():
    first = not os.path.exists(MARK)
    async with async_playwright() as p:
        b, ctx, pg = await C.open_page(p)
        await C.act(pg)
        await pg.screenshot(path=os.path.join(C.OUT, 'flaky.png'))
        if first:
            open(MARK, 'w').write('1')
            C.check('第一次（故意 FAIL）', False, '記號檔不存在＝第一次')
        else:
            os.remove(MARK)
            C.check('第二次（記號檔在＝重跑）', True)
        await b.close()
    C.finish()

asyncio.run(main())
