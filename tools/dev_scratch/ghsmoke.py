import asyncio, sys, json
from playwright.async_api import async_playwright
URL=sys.argv[1]
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--use-gl=swiftshader','--enable-unsafe-swiftshader'])
        ctx=await b.new_context(viewport={'width':390,'height':844},device_scale_factor=2,is_mobile=True,has_touch=True,
            user_agent='Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1')
        pg=await ctx.new_page()
        bad=[]; errs=[]
        pg.on('response',lambda r: bad.append((r.status,r.url)) if r.status>=400 else None)
        pg.on('requestfailed',lambda r: bad.append(('FAIL',r.url)))
        pg.on('pageerror',lambda e: errs.append(str(e)))
        pg.on('console',lambda m: errs.append('console.'+m.type+': '+m.text) if m.type=='error' else None)
        await pg.goto(URL); 
        for i in range(60):
            await pg.wait_for_timeout(2000)
            st=await pg.evaluate("()=>({boot:!!(window.GAME&&window.E3&&E3.player), drv: window.GM&&GM.heroDriver, title: !!document.querySelector('#title, .title, #titleScreen')})")
            if st['boot'] and st['drv']: break
        print('state',st,'after',(i+1)*2,'s')
        info=await pg.evaluate("()=>({portraits: Object.keys(window.PORTRAIT_FILES||{}), timedOut: (window.ASSETS&&ASSETS.timedOut)||null})")
        print('info',info)
        await pg.screenshot(path='screenshots/gh_title.png')
        print('bad responses',bad[:20]); print('errors',errs[:20])
        await b.close()
asyncio.run(main())
