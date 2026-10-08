import asyncio, json
from playwright.async_api import async_playwright
URL='http://127.0.0.1:8765/index.html?turbo'
DRIVER=open(__import__('os').path.join(__import__('os').path.dirname(__import__('os').path.abspath(__file__)),'flowtest.py')).read().split('DRIVER=r"""')[1].split('"""')[0]
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
        ctx=await b.new_context(viewport={'width':844,'height':390},device_scale_factor=1,has_touch=True)
        pg=await ctx.new_page(); msgs=[]
        pg.on('console', lambda m: msgs.append(m.type+': '+m.text) if m.type in ('error','warning') and '404' not in m.text and 'portrait missing' not in m.text and 'ERR_TUNNEL' not in m.text else None)
        pg.on('pageerror', lambda e: msgs.append('PAGEERROR: '+str(e)))
        await pg.goto(URL); await pg.wait_for_timeout(6000)
        await pg.evaluate(DRIVER)
        st={'day':2,'weekday':4,'hour':15.2,'zone':'campus','pos':{'x':34,'z':-99,'yaw':0},'weather':'sunny','flags':{'introDone':True,'campusIntro':True,'classDone':True,'zheInvite':True,'classAnswer':'good'},'visited':{'dorm':True,'campus':True,'classroom':True}}
        js="(async()=>{ const s=GAME.defaults('祐廷'); Object.assign(s,"+json.dumps(st,ensure_ascii=False)+"); document.getElementById('titleScreen').classList.add('hide'); await GAME.applySave(s); })()"
        await pg.evaluate(js); await pg.wait_for_timeout(1500)
        await pg.evaluate("GAME.E.player.obj.position.set(34,0,-88)")
        for i in range(2):
            await pg.wait_for_timeout(700)
            print(await pg.evaluate("({metAn:GAME.G.flags.metAn, busy:GAME.E.player.busy, d:GAME.D.active, zone:GAME.G.zone, day:GAME.G.day, hour:GAME.G.hour, frame:GAME.E.frame, running:GAME.running, npcs:Object.keys(GAME.npc)})"))
        for i in range(40):
            await pg.wait_for_timeout(1000)
            if await pg.evaluate("!!GAME.G.flags.metAn"): break
        await pg.wait_for_timeout(6000); await pg.screenshot(path='shots/vrm_an_01.png')
        print(await pg.evaluate("(()=>{ const n=GAME.npc.an; return n?{driver:n.obj.userData.driver,pose:n.pose,pos:n.obj.position.toArray().map(x=>+x.toFixed(1))}:null; })()"))
        r=await pg.evaluate("__drive(120000,0)"); print(r['lines'][:8], r['flags'])
        await pg.screenshot(path='shots/vrm_an_02.png')
        print(msgs[:5])
        await b.close()
asyncio.run(main())
