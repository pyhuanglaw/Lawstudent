import asyncio, json, sys
from playwright.async_api import async_playwright
URL='http://127.0.0.1:8765/index.html?turbo'
wd=int(sys.argv[1]); hr=float(sys.argv[2]); zone=sys.argv[3]; name=sys.argv[4]
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
        ctx=await b.new_context(viewport={'width':844,'height':390},device_scale_factor=1,has_touch=True)
        pg=await ctx.new_page(); msgs=[]
        pg.on('console', lambda m: msgs.append(m.type+': '+m.text) if m.type in ('error',) else None)
        pg.on('pageerror', lambda e: msgs.append('PAGEERROR: '+str(e)))
        await pg.goto(URL); await pg.wait_for_timeout(7000)
        st={'day':14,'weekday':wd,'hour':hr,'zone':zone,'pos':{'x':-40,'z':-5,'yaw':-1.5708},'weather':'sunny','flags':{'introDone':True,'classDone':True,'metAn':True,'met_an':True,'afternoonDone':True,'lawclub':True},'visited':{'dorm':True,'campus':True}}
        js="(async()=>{ const s=GAME.defaults('祐廷'); Object.assign(s,"+json.dumps(st,ensure_ascii=False)+"); document.getElementById('titleScreen').classList.add('hide'); await GAME.applySave(s); EVENTS.onEnter=()=>false; EVENTS.tick=()=>false; })()"
        await pg.evaluate(js); await pg.wait_for_timeout(1500)
        for i in range(6):
            r=await pg.evaluate("Object.keys(GAME.npc).filter(k=>GAME.npc[k].beh==='chat'||GAME.npc[k].beh==='buddy').map(k=>[k,GAME.npc[k].beh,GAME.npc[k].obj.position.x,GAME.npc[k].obj.position.z])")
            named=[x for x in r if not x[0].startswith('pool_')]
            if named: break
            await pg.evaluate(f"(async()=>{{ await GAME.enter({json.dumps(zone)},undefined,{{noFade:true}}); }})()"); await pg.wait_for_timeout(500)
        print('pairs',r)
        if r:
            t=named[0] if named else r[0]
            x=t[2]; z=t[3]
            await pg.evaluate(f"(()=>{{ const P=GAME.E.player.obj; const ang=Math.random()*6.28; P.position.set({x}+Math.sin(ang)*3.2,0,{z}+Math.cos(ang)*3.2); P.rotation.y=Math.atan2({x}-P.position.x,{z}-P.position.z); GAME.E.cam.yaw=P.rotation.y+Math.PI; GAME.E.cam.pitch=0.18; }})()")
            await pg.wait_for_timeout(2500)
            await pg.screenshot(path=f'shots/{name}_a.png')
            await pg.wait_for_timeout(3500)
            await pg.screenshot(path=f'shots/{name}_b.png')
        for m in msgs[:5]: print(m)
        await b.close()
asyncio.run(main())
