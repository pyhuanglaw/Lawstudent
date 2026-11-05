import asyncio, sys, json
from playwright.async_api import async_playwright
URL=sys.argv[1]
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--no-sandbox']); pg=await b.new_page(viewport={'width':844,'height':390})
        reqs=[]; pg.on('request', lambda r: reqs.append(r.url))
        await pg.goto(URL); await pg.wait_for_timeout(25000)
        ver=await pg.evaluate("(document.body.innerText.match(/v9\\.[0-9.]+（[0-9-]+）/)||[''])[0]")
        lz=[u for u in reqs if 'lz-string' in u.lower()]; hasLZ=await pg.evaluate("typeof LZString!=='undefined'")
        print(json.dumps({'requests':len(reqs),'lz_requests':lz,'LZString_global':hasLZ,'version_text':ver,'scripts':[u.split('/')[-1] for u in reqs if u.endswith('.js') or '.js?' in u][:80]},ensure_ascii=False))
        print('PASS 沒有載到 lz-string.js' if not lz and not hasLZ else 'FAIL 載到 lz-string.js')
        await b.close()
asyncio.run(main())
