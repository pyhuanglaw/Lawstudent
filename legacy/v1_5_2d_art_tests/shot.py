import asyncio, sys
from playwright.async_api import async_playwright
async def main(url, out, w, h, scale):
    async with async_playwright() as p:
        b=await p.chromium.launch()
        pg=await b.new_page(viewport={'width':w,'height':h}, device_scale_factor=scale)
        msgs=[]
        pg.on('console', lambda m: msgs.append(m.type+': '+m.text))
        pg.on('pageerror', lambda e: msgs.append('PAGEERROR: '+str(e)))
        await pg.goto(url)
        await pg.wait_for_timeout(600)
        await pg.screenshot(path=out)
        for m in msgs[:20]: print(m)
        await b.close()
url=sys.argv[1]; out=sys.argv[2]; w=int(sys.argv[3]) if len(sys.argv)>3 else 1200; h=int(sys.argv[4]) if len(sys.argv)>4 else 760; sc=float(sys.argv[5]) if len(sys.argv)>5 else 1
asyncio.run(main(url,out,w,h,sc))
