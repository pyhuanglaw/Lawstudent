import asyncio, json, sys
from playwright.async_api import async_playwright
URL='http://127.0.0.1:8765/index.html?turbo'
runs=[('cafe',13.0,1,'int_cafe_day',{'x':0,'z':4.6,'yaw':3.1416}),('cafe',20.5,1,'int_cafe_night',{'x':0,'z':4.6,'yaw':3.1416}),('classroom',10.3,2,'int_class_tue',{'x':0,'z':4.6,'yaw':3.1416}),('classroom',17.2,4,'int_class_dusk',{'x':0,'z':4.6,'yaw':3.1416}),('library',20.0,1,'int_lib_night',{'x':0,'z':6.5,'yaw':3.1416}),('noodle',19.0,2,'int_noodle_night',{'x':0,'z':3.5,'yaw':3.1416})]
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
        ctx=await b.new_context(viewport={'width':844,'height':390},device_scale_factor=1,has_touch=True)
        pg=await ctx.new_page(); msgs=[]
        pg.on('console', lambda m: msgs.append(m.type+': '+m.text) if m.type in ('error',) and '404' not in m.text else None)
        pg.on('pageerror', lambda e: msgs.append('PAGEERROR: '+str(e)))
        await pg.goto(URL); await pg.wait_for_timeout(7000)
        for zone,hr,wd,name,pos in runs:
            st={'day':14,'weekday':wd,'hour':hr,'zone':zone,'pos':pos,'weather':'sunny','flags':{'introDone':True,'classDone':True,'metAn':True,'met_an':True,'afternoonDone':True,'lawclub':True},'visited':{'dorm':True,'campus':True}}
            js="(async()=>{ const s=GAME.defaults('祐廷'); Object.assign(s,"+json.dumps(st,ensure_ascii=False)+"); document.getElementById('titleScreen').classList.add('hide'); await GAME.applySave(s); EVENTS.onEnter=()=>false; EVENTS.tick=()=>false; })()"
            await pg.evaluate(js); await pg.wait_for_timeout(2500)
            await pg.screenshot(path=f'shots/{name}.png')
        for m in msgs[:5]: print(m)
        await b.close()
asyncio.run(main())
