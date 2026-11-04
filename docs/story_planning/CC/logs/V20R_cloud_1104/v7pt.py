import sys, json, asyncio
sys.path.insert(0, sys.argv[1] + '/tests')
import playlib as L
from playwright.async_api import async_playwright
URL = sys.argv[2]
PTS = [(7.25, 36.75), (0.25, 47.75), (54.25, 40.25)]
JS = r"""(()=>{ const E=GAME.E, o=E.player.obj.position; const near=E.interactables.filter(i=>Math.hypot(i.x-o.x,i.z-o.z)<2.5).map(i=>(i.label||'').slice(0,16)+'@'+(+i.x).toFixed(1)+','+(+i.z).toFixed(1));
  return {zone:GAME.G.zone, x:+o.x.toFixed(2), z:+o.z.toFixed(2), stand:E.canStand?E.canStand(o.x,o.z,0.3):null, free:E.nav?E.nav.free(o.x,o.z):null, near}; })()"""
async def main():
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); await L.wait_loaded(pg)
        for x, z in PTS:
            await L.load_state(pg, {'zone': 'gongguan', 'hour': 21.2, 'day': 1, 'pos': {'x': x, 'z': z, 'yaw': 0, 'lv': 0}}, quiet_events=True)
            await pg.wait_for_timeout(4000)
            print(json.dumps({'v7': [x, z], 'now': await pg.evaluate(JS)}, ensure_ascii=False), flush=True)
        await b.close()
asyncio.run(main())
