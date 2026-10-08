import asyncio, json
from playwright.async_api import async_playwright
URL='http://127.0.0.1:8765/index.html'
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
        ctx=await b.new_context(viewport={'width':844,'height':390},device_scale_factor=1,has_touch=True)
        pg=await ctx.new_page()
        await pg.goto(URL); await pg.wait_for_timeout(7000)
        st={'day':14,'weekday':1,'hour':13.0,'zone':'campus','pos':{'x':-40,'z':-5,'yaw':0},'weather':'sunny','flags':{'introDone':True,'classDone':True,'metAn':True,'met_an':True,'afternoonDone':True,'lawclub':True},'visited':{'dorm':True,'campus':True}}
        js="(async()=>{ const s=GAME.defaults('祐廷'); Object.assign(s,"+json.dumps(st,ensure_ascii=False)+"); document.getElementById('titleScreen').classList.add('hide'); await GAME.applySave(s); EVENTS.onEnter=()=>false; EVENTS.tick=()=>false; })()"
        await pg.evaluate(js); await pg.wait_for_timeout(1500)
        # 鏡頭轉到正面
        await pg.evaluate("GAME.E.cam.yaw=GAME.E.player.obj.rotation.y; GAME.E.cam.manualT=99; GAME.E.cam.distTarget=3.2; GAME.E.cam.pitch=0.12;")
        for i in range(3):
            await pg.wait_for_timeout(900)
            await pg.screenshot(path=f'shots/hero_idle_{i}.png',clip={'x':300,'y':60,'width':250,'height':330})
        await pg.keyboard.down('s')
        for i in range(3):
            await pg.wait_for_timeout(450)
            await pg.screenshot(path=f'shots/hero_walk_{i}.png',clip={'x':300,'y':60,'width':250,'height':330})
        await pg.keyboard.up('s')
        await pg.keyboard.down('Shift'); await pg.keyboard.down('s')
        for i in range(2):
            await pg.wait_for_timeout(350)
            await pg.screenshot(path=f'shots/hero_run_{i}.png',clip={'x':300,'y':60,'width':250,'height':330})
        await pg.keyboard.up('s'); await pg.keyboard.up('Shift')
        print(await pg.evaluate("(()=>{ const u=GAME.E.player.obj.userData; return {driver:u.driver,cur:u.anim&&u.anim.cur,actions:u.anim&&Object.keys(u.anim.actions)}; })()"))
        await b.close()
asyncio.run(main())
