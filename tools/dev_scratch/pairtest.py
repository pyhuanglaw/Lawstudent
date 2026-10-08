import asyncio, json
from playwright.async_api import async_playwright
URL='http://127.0.0.1:8765/index.html?turbo&lowres'
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
        ctx=await b.new_context(viewport={'width':844,'height':390},device_scale_factor=1,has_touch=True)
        pg=await ctx.new_page(); msgs=[]
        pg.on('console', lambda m: msgs.append(m.type+': '+m.text) if m.type in ('error','warning') else None)
        pg.on('pageerror', lambda e: msgs.append('PAGEERROR: '+str(e)))
        await pg.goto(URL); await pg.wait_for_timeout(6000)
        st={'day':14,'weekday':1,'hour':10.5,'zone':'campus','pos':{'x':-40,'z':-5,'yaw':-1.5708},'weather':'sunny','flags':{'introDone':True,'classDone':True,'metAn':True,'met_an':True,'afternoonDone':True,'lawclub':True},'visited':{'dorm':True,'campus':True}}
        js="(async()=>{ const s=GAME.defaults('祐廷'); Object.assign(s,"+json.dumps(st,ensure_ascii=False)+"); document.getElementById('titleScreen').classList.add('hide'); await GAME.applySave(s); EVENTS.onEnter=()=>false; EVENTS.tick=()=>false; })()"
        await pg.evaluate(js); await pg.wait_for_timeout(1000)
        tot={}
        for wd in range(0,7):
            for hr in (9,10.5,12.5,14,16,17.5,18.5,19,21,22.5):
                for z in ('campus','gongguan','wenzhou','library','wancai','cafe'):
                    r=await pg.evaluate(f"(async()=>{{ GAME.G.weekday={wd}; GAME.G.hour={hr}; GAME.E.hour={hr}; await GAME.enter({json.dumps(z)},undefined,{{noFade:true}}); return Object.keys(GAME.npc).filter(k=>GAME.npc[k].beh==='chat'||GAME.npc[k].beh==='buddy').map(k=>k+':'+GAME.npc[k].beh); }})()")
                    if r: tot[(wd,hr,z)]=r
        for k,v in list(tot.items())[:40]: print(k,v)
        print('pair situations',len(tot))
        # 視覺檢查：campus 週一 10:30 有配對時截圖
        await pg.evaluate("(async()=>{ GAME.G.weekday=1; GAME.G.hour=10.5; GAME.E.hour=10.5; Math.random=(()=>{let s=7;return()=>{s=(s*16807)%2147483647;return (s-1)/2147483646;}})(); await GAME.enter('campus',undefined,{noFade:true}); })()")
        r=await pg.evaluate("Object.keys(GAME.npc).filter(k=>GAME.npc[k].beh==='chat'||GAME.npc[k].beh==='buddy').map(k=>[k,GAME.npc[k].beh,GAME.npc[k].obj.position.x.toFixed(1),GAME.npc[k].obj.position.z.toFixed(1)])")
        print('campus pairs',r)
        if r:
            x=float(r[0][2]); z=float(r[0][3])
            await pg.evaluate(f"GAME.E.player.obj.position.set({x}+2.5,0,{z}+2.5); GAME.E.player.obj.rotation.y=Math.atan2({x}-({x}+2.5),{z}-({z}+2.5)); GAME.E.cam.yaw=GAME.E.player.obj.rotation.y+Math.PI;")
            await pg.wait_for_timeout(2500)
            await pg.screenshot(path='shots/pair_01.png')
            await pg.wait_for_timeout(3000)
            await pg.screenshot(path='shots/pair_02.png')
        for m in msgs[:10]: print(m)
        await b.close()
asyncio.run(main())
