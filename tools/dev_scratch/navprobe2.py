import asyncio, json, sys
from playwright.async_api import async_playwright
zone=sys.argv[1]; step=float(sys.argv[2]) if len(sys.argv)>2 else 0.4
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
        pg=await b.new_page(viewport={'width':844,'height':390})
        await pg.goto('http://127.0.0.1:8765/index.html?turbo&lowres'); await pg.wait_for_timeout(8000)
        st={'day':8,'weekday':1,'hour':10.5,'zone':zone,'pos':{'x':0,'z':0,'yaw':0},'flags':{'introDone':True,'classDone':True,'metAn':True,'met_an':True,'afternoonDone':True,'lawclub':True},'visited':{'dorm':True,'campus':True}}
        js="(async()=>{ const s=GAME.defaults('祐廷'); Object.assign(s,"+json.dumps(st,ensure_ascii=False)+"); document.getElementById('titleScreen').classList.add('hide'); await GAME.applySave(s); EVENTS.onEnter=()=>false; EVENTS.tick=()=>false; })()"
        await pg.evaluate(js); await pg.wait_for_timeout(1000)
        rows=await pg.evaluate("((step)=>{ const nav=GAME.E.nav; const r=0.3; const can=(x,z)=>nav.free(x,z)&&nav.free(x+r,z)&&nav.free(x-r,z)&&nav.free(x,z+r)&&nav.free(x,z-r); const out=[]; const x0=nav.ox, z0=nav.oz; for(let z=z0+step/2; z<z0+nav.h; z+=step){ let s=''; for(let x=x0+step/2; x<x0+nav.w; x+=step){ s+= !nav.free(x,z)?'#':(can(x,z)?'.':'o'); } out.push(z.toFixed(1).padStart(6)+' '+s); } return out; })(%s)" % step)
        print('\n'.join(rows)); print('# blocked  o center free but radius 0.3 fails  . standable')
        await b.close()
asyncio.run(main())
