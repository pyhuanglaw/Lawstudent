import asyncio, json, sys
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
        for q in ['?turbo&lowres','?lowres','']:
            ctx=await b.new_context(viewport={'width':844,'height':390},device_scale_factor=1,has_touch=True)
            pg=await ctx.new_page()
            await pg.goto('http://127.0.0.1:8765/index.html'+q); await pg.wait_for_timeout(6000)
            st={'day':14,'weekday':1,'hour':15.2,'zone':'campus','pos':{'x':34,'z':-99,'yaw':0},'weather':'sunny','flags':{'introDone':True,'campusIntro':True,'classDone':True,'zheInvite':True,'afternoonDone':True},'visited':{'dorm':True,'campus':True,'classroom':True}}
            js="(async()=>{ const s=GAME.defaults('祐廷'); Object.assign(s,"+json.dumps(st,ensure_ascii=False)+"); document.getElementById('titleScreen').classList.add('hide'); await GAME.applySave(s); })()"
            await pg.evaluate(js); await pg.wait_for_timeout(1500)
            f0=await pg.evaluate("GAME.E.frame"); await pg.wait_for_timeout(3000); f1=await pg.evaluate("GAME.E.frame")
            print(q, 'fps', (f1-f0)/3, await pg.evaluate("({vis:document.visibilityState, turbo:GAME.turbo})"))
            # 宿舍
            await pg.evaluate("GAME.enter('dorm',undefined,{noFade:true})"); await pg.wait_for_timeout(1000)
            f0=await pg.evaluate("GAME.E.frame"); await pg.wait_for_timeout(3000); f1=await pg.evaluate("GAME.E.frame")
            print(q, 'dorm fps', (f1-f0)/3)
            await ctx.close()
        await b.close()
asyncio.run(main())
