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
        await pg.goto(URL); await pg.wait_for_timeout(7000)
        await pg.evaluate(DRIVER)
        st={'day':2,'weekday':4,'hour':16.9,'zone':'wenzhou','pos':{'x':-30,'z':-2,'yaw':0},'weather':'sunny','flags':{'introDone':True,'campusIntro':True,'classDone':True,'zheInvite':True,'classAnswer':'good','metAn':True,'met_an':True,'companion':'an','plan':'cafe'},'visited':{'dorm':True,'campus':True,'classroom':True}}
        js="(async()=>{ const s=GAME.defaults('祐廷'); Object.assign(s,"+json.dumps(st,ensure_ascii=False)+"); document.getElementById('titleScreen').classList.add('hide'); await GAME.applySave(s); })()"
        await pg.evaluate(js); await pg.wait_for_timeout(2500)
        await pg.screenshot(path='shots/vrm_cafe_00.png')
        await pg.evaluate("GAME.enter('cafe',undefined,{noFade:true})")
        for i in range(5):
            await pg.wait_for_timeout(2500); await pg.screenshot(path=f'shots/vrm_cafe_{i+1:02d}.png')
            st=await pg.evaluate("({d:GAME.D.active, full:(GAME.D.full||'').slice(0,40), an:(()=>{ const n=GAME.npc.an; return n?[n.pose,n.obj.userData.driver]:null; })(), adv:ADV.active})")
            print(st)
            if st['d']: await pg.evaluate("GAME.dlgAdvance(); GAME.dlgAdvance();")
        r=await pg.evaluate("__drive(120000,1)"); print(len(r['lines']),'lines', r['flags'][-3:])
        await pg.wait_for_timeout(1500); await pg.screenshot(path='shots/vrm_cafe_end.png')
        for m in msgs[:6]: print(m[:300])
        await b.close()
asyncio.run(main())
