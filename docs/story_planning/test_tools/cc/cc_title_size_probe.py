"""CC-B（帳號 B）11-09：TITLE-SIZE（BB-B 18:16）。Playwright 內建裝置（不自己設 deviceScaleFactor）：iPhone SE、iPhone 14、iPhone 14 Pro Max，各直向、橫向；
開標題畫面（不捲動）截一張，記「版本」那一行的位置在不在畫面裡、「請轉橫向」遮罩有沒有出現。判定＝BB。
用法：python cc_title_size_probe.py <url> <out>"""
import os, sys, json, asyncio
from playwright.async_api import async_playwright
URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
DEVS = ['iPhone SE', 'iPhone 14', 'iPhone 14 Pro Max']
JS = """(()=>{ const t=document.getElementById('titleScreen'); const el=[...(t?t.querySelectorAll('*'):[])].reverse().find(e=>/版本/.test(e.textContent||'')&&e.children.length===0);
  const r=el?el.getBoundingClientRect():null; const rot=document.getElementById('rotate'); const rs=rot?getComputedStyle(rot):null;
  return {text:el?el.textContent.trim():null, rect:r?[Math.round(r.left),Math.round(r.top),Math.round(r.right),Math.round(r.bottom)]:null, vw:innerWidth, vh:innerHeight, dpr:devicePixelRatio,
    visible:!!r&&r.top>=0&&r.bottom<=innerHeight&&r.left>=0&&r.right<=innerWidth, partly:!!r&&r.top<innerHeight&&r.bottom>0, rotate:!!rs&&rs.display!=='none'&&rs.visibility!=='hidden'&&+rs.opacity>0.05, scrollY:scrollY}; })()"""
async def main():
    res = []
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
        for d in DEVS:
            for orient in ('portrait', 'landscape'):
                dev = dict(p.devices[d if orient == 'portrait' else d + ' landscape'])
                ctx = await b.new_context(**dev); pg = await ctx.new_page()
                await pg.goto(URL)
                for _ in range(90):
                    if await pg.evaluate("(()=>{ const t=document.getElementById('titleScreen'); return !!t&&!t.classList.contains('hide')&&getComputedStyle(t).display!=='none'; })()"): break
                    await pg.wait_for_timeout(1000)
                await pg.wait_for_timeout(2500)
                r = await pg.evaluate(JS); r.update({'device': d, 'orient': orient})
                f = os.path.join(OUT, 'title_%s_%s.png' % (d.replace(' ', ''), orient)); await pg.screenshot(path=f); r['shot'] = os.path.basename(f)
                print('TITLE %s' % json.dumps(r, ensure_ascii=False), flush=True); res.append(r)
                await ctx.close()
        await b.close()
    json.dump(res, open(os.path.join(OUT, 'title_size.json'), 'w'), ensure_ascii=False, indent=1)
    print('ALL PASS', flush=True)
asyncio.run(main())
