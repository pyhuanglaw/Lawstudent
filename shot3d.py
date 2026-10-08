import asyncio, sys, json
from playwright.async_api import async_playwright
async def main(url, out, w, h, actions):
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
        pg=await b.new_page(viewport={'width':w,'height':h}, device_scale_factor=1, has_touch=True)
        msgs=[]
        pg.on('console', lambda m: msgs.append(m.type+': '+m.text))
        pg.on('pageerror', lambda e: msgs.append('PAGEERROR: '+str(e)))
        await pg.goto(url)
        await pg.wait_for_timeout(1500)
        for a in actions:
            if a[0]=='eval': await pg.evaluate(a[1])
            elif a[0]=='wait': await pg.wait_for_timeout(a[1])
            elif a[0]=='tap': await pg.touchscreen.tap(a[1],a[2])
            elif a[0]=='key': await pg.keyboard.down(a[1]); await pg.wait_for_timeout(a[2]); await pg.keyboard.up(a[1])
            elif a[0]=='shot': await pg.screenshot(path=a[1])
        await pg.screenshot(path=out)
        for m in msgs[:15]: print(m)
        await b.close()
url=sys.argv[1]; out=sys.argv[2]; w=int(sys.argv[3]); h=int(sys.argv[4]); actions=json.loads(sys.argv[5]) if len(sys.argv)>5 else []
asyncio.run(main(url,out,w,h,actions))
