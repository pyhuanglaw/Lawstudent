import asyncio, json, sys, time
sys.path.insert(0, 'tests')
from playwright.async_api import async_playwright
import playlib as L
URL=sys.argv[1]; SAVE=sys.argv[2]
async def main():
    async with async_playwright() as p:
        b,ctx,pg,cdp,errs=await L.launch(p)
        await pg.goto(URL+'?turbo'); await L.wait_loaded(pg)
        raw=json.load(open(SAVE)); st=raw.get('G',raw) if isinstance(raw,dict) else raw
        if 'state' in st: st=st['state']
        await L.load_state(pg, st)
        t0=time.time(); last=None
        while time.time()-t0<90:
            info=await pg.evaluate("""(()=>{ const G=GAME.G,E=GAME.E; return {d:G.day,h:+G.hour.toFixed(2),z:G.zone,busy:!!(E.player&&E.player.busy),paused:!!E.paused,ff:!!(typeof ECONFF!=='undefined'&&ECONFF.busy),Dact:!!(GAME.D&&GAME.D.active),evr:!!EVENTS.running,phone:!document.getElementById('phone').classList.contains('hide'),fade:(document.getElementById('fade')||{}).className,steps:Object.keys(((G.flags.ECONFF||{}).done)||{}).join(','),next:(ECONFF.next(G)||{}).n}; })()""")
            k=json.dumps(info,ensure_ascii=False)
            if k!=last: last=k; print(f"[{time.time()-t0:4.0f}s] {k}",flush=True)
            await pg.wait_for_timeout(1500)
        print('errs',errs[:5]); await b.close()
asyncio.run(main())
