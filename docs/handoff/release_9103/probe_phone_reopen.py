"""確認 BUG-PHONE-REOPEN-1021：新遊戲（舊開局 ?start0）宿舍開場演完以後，手機自己打開幾次；收起來以後搖桿走不走得動。
用法：python3 probe_phone_reopen.py URL 標籤"""
import asyncio, json, sys, os
sys.path.insert(0, '/home/user/Lawstudent/tests')
import playlib as L
from playwright.async_api import async_playwright
URL, TAG = sys.argv[1], sys.argv[2]
async def main():
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(L.legacy_url(URL))
        await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
        await L.tap(pg, cdp, '#btnNew')
        for _ in range(400):
            ok = await pg.evaluate("!!(GAME.G&&GAME.G.flags&&GAME.G.flags.introDone)&&!GAME.E.player.busy&&!GAME.D.active")
            if ok: break
            s = await L.state(pg)
            if s['choices']:
                await pg.evaluate("document.querySelector('#choices button')&&document.querySelector('#choices button').click()")
            elif s['dlg']: await L.tap(pg, cdp, '#dlg')
            await pg.wait_for_timeout(500)
        pend = await pg.evaluate("PHONE.pending(GAME.G).map(x=>x.id||x.key||x.text)")
        opens = 0
        for i in range(24):   # 12 秒內：手機開了就收起來，數幾次
            if await pg.evaluate("!!(GAME.phoneIsOpen&&GAME.phoneIsOpen())"):
                opens += 1; await L.phone_away(pg, cdp)
            await pg.wait_for_timeout(500)
        moved, pushes, s2 = await L.push_until(pg, cdp, 0, -40, 0.5)
        print(json.dumps({'tag': TAG, 'pending_at_intro_end': pend, 'auto_opens_in_12s': opens, 'moved': round(moved, 2), 'pushes': pushes, 'paused': await pg.evaluate("!!GAME.E.paused")}, ensure_ascii=False))
        await b.close()
asyncio.run(main())
