import sys, json, asyncio
sys.path.insert(0, sys.argv[1] + '/tests')
import playlib as L
from playwright.async_api import async_playwright
URL = sys.argv[2]
JS = r"""(()=>{ const n=GAME.E.nav, rows=[]; for(let z=19;z<=23.01;z+=0.25){ let r=z.toFixed(2).padStart(6)+' '; for(let x=-12;x<=-5.01;x+=0.25) r+=(Math.abs(x+8.75)<0.01&&Math.abs(z-20.75)<0.01)?'@':(n.free(x+0.01,z+0.01)?'.':'#'); rows.push(r); } return rows.join('\n'); })()"""
async def main():
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); await L.wait_loaded(pg)
        await L.load_state(pg, {'zone': 'gongguan', 'hour': 14, 'day': 3, 'pos': {'x': -8.75, 'z': 18.0, 'yaw': 0, 'lv': 0}}, quiet_events=True)
        await pg.wait_for_timeout(6000)
        print(await pg.evaluate(JS), flush=True)
        await b.close()
asyncio.run(main())
