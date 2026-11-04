# -*- coding: utf-8 -*-
"""自測 2a（BB-C 11-04 TEST-TRACE V2）：斷言比對「從遊戲狀態讀出來的值」——讀 GAME.G.money，故意說它應該是別的數 → runner 要判 GAME_BUG（assert-game），basis 寫出遊戲回報的值和預期。
要開遊戲頁（ST_PAGE=game）；[前置／捷徑] 只開頁、讀 GAME.G，不玩。"""
import os, sys, asyncio
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import st_common as C
from playwright.async_api import async_playwright


async def main():
    async with async_playwright() as p:
        b, ctx, pg = await C.open_page(p)
        await C.act(pg)
        for _ in range(120):
            if await pg.evaluate("typeof GAME!=='undefined'&&!!GAME.G"): break
            await pg.wait_for_timeout(500)
        money = await pg.evaluate("(typeof GAME!=='undefined'&&GAME.G)?GAME.G.money:null")
        want = (money if isinstance(money, (int, float)) else 0) + 123457   # 故意寫錯的預期：一定和遊戲的值不同
        await pg.screenshot(path=os.path.join(C.OUT, 'assert_game.png'))
        C.check('GAME.G.money 是 %s（故意寫錯的預期）' % want, money == want, '遊戲回報 GAME.G.money＝%s，預期 %s' % (money, want), src='game')
        await b.close()
    C.finish()

asyncio.run(main())
