import asyncio, json, sys
from playwright.async_api import async_playwright
tabs=json.loads(sys.argv[1]); names=sys.argv[2].split(',')
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
        pg=await b.new_page(viewport={'width':500,'height':500}); msgs=[]
        pg.on('pageerror', lambda e: msgs.append('PAGEERROR: '+str(e)))
        await pg.goto('http://127.0.0.1:8765/test_vrm.html')
        for i in range(30):
            await pg.wait_for_timeout(1000)
            if await pg.evaluate("window.__vrmResult||null"): break
        # 側面 45 度看
        await pg.evaluate("(()=>{ const c=__vrm; })()")
        for i,(t,n) in enumerate(zip(tabs,names)):
            await pg.evaluate(f"__pose({json.dumps(t)},0.47); __vrm.vrm.scene.rotation.y=1.3;")
            await pg.wait_for_timeout(600); await pg.screenshot(path=f'shots/vrmpose_{n}.png')
        print(msgs[:3])
        await b.close()
asyncio.run(main())
