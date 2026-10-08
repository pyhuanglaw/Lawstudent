import asyncio, json
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
        pg=await b.new_page(viewport={'width':600,'height':500}); msgs=[]
        pg.on('console', lambda m: msgs.append(m.type+': '+m.text) if m.type in ('error','warning') else None)
        pg.on('pageerror', lambda e: msgs.append('PAGEERROR: '+str(e)))
        import sys
        await pg.goto('http://127.0.0.1:8765/test_vrm.html'+(sys.argv[1] if len(sys.argv)>1 else ''))
        for i in range(30):
            await pg.wait_for_timeout(1000)
            r=await pg.evaluate("window.__vrmResult||null")
            if r: break
        print(r)
        await pg.wait_for_timeout(1500); await pg.screenshot(path='shots/'+(sys.argv[2] if len(sys.argv)>2 else 'vrm')+'_01_idle.png')
        await pg.evaluate("__vrm.set('walk')"); await pg.wait_for_timeout(1200); await pg.screenshot(path='shots/'+(sys.argv[2] if len(sys.argv)>2 else 'vrm')+'_02_walk.png')
        await pg.evaluate("__vrm.set('run')"); await pg.wait_for_timeout(900); await pg.screenshot(path='shots/'+(sys.argv[2] if len(sys.argv)>2 else 'vrm')+'_03_run.png')
        await pg.evaluate("__vrm.set('idle'); __vrm.expr('happy',1.0)"); await pg.wait_for_timeout(900); await pg.screenshot(path='shots/'+(sys.argv[2] if len(sys.argv)>2 else 'vrm')+'_04_expr.png')
        for m in msgs[:8]: print(m[:200])
        await b.close()
asyncio.run(main())
