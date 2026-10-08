"""日程煙霧測試：所有區域 × 星期 × 時段 進入，檢查 populate 錯誤與 NPC 數。"""
import asyncio, sys, json
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
        st={'day':14,'weekday':2,'hour':10.0,'zone':'campus','pos':{'x':-40,'z':-5,'yaw':-1.5708},'weather':'sunny','flags':{'introDone':True,'classDone':True,'metAn':True,'met_an':True,'afternoonDone':True,'lawclub':True},'visited':{'dorm':True,'campus':True}}
        js="(async()=>{ const s=GAME.defaults('祐廷'); Object.assign(s,"+json.dumps(st,ensure_ascii=False)+"); document.getElementById('titleScreen').classList.add('hide'); await GAME.applySave(s); EVENTS.onEnter=()=>false; EVENTS.tick=()=>false; })()"
        await pg.evaluate(js); await pg.wait_for_timeout(1000)
        zones=await pg.evaluate("Object.keys(Z3.ZONES)")
        print('zones',zones)
        worst=[]
        for wd in range(0,7):
            for hr in (8.5,10.5,13,15.5,17.5,19.5,21.5,23.5):
                for z in zones:
                    before=len(msgs)
                    r=await pg.evaluate(f"(async()=>{{ GAME.G.weekday={wd}; GAME.G.hour={hr}; GAME.E.hour={hr}; await GAME.enter({json.dumps(z)},undefined,{{noFade:true}}); return {{npcs:GAME.E.npcs.length, named:Object.keys(GAME.npc).length, tris:GAME.E.renderer.info.render.triangles, calls:GAME.E.renderer.info.render.calls}}; }})()")
                    new=[m for m in msgs[before:] if '404' not in m and 'ERR_TUNNEL' not in m and 'portrait missing' not in m]
                    if new: print('ERR',wd,hr,z,new[:2])
                    worst.append((r['calls'],r['tris'],wd,hr,z,r['npcs']))
        worst.sort(reverse=True)
        print('top draw calls:'); [print(' ',w) for w in worst[:8]]
        print('done; total console issues',sum(1 for m in msgs if '404' not in m and 'ERR_TUNNEL' not in m and 'portrait missing' not in m))
        await b.close()
asyncio.run(main())
