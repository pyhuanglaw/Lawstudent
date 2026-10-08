import asyncio, json
from playwright.async_api import async_playwright
URL='http://127.0.0.1:8765/index.html?turbo&lowres'
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
        ctx=await b.new_context(viewport={'width':844,'height':390},device_scale_factor=1,has_touch=True)
        pg=await ctx.new_page(); msgs=[]
        pg.on('console', lambda m: msgs.append(m.type+': '+m.text) if m.type in ('error',) and '404' not in m.text else None)
        pg.on('pageerror', lambda e: msgs.append('PAGEERROR: '+str(e)))
        await pg.goto(URL); await pg.wait_for_timeout(6000)
        st={'day':14,'weekday':1,'hour':14.0,'zone':'library','pos':{'x':0,'z':6.5,'yaw':3.1416},'weather':'sunny','flags':{'introDone':True,'classDone':True,'metAn':True,'met_an':True,'afternoonDone':True,'lawclub':True,'grad_reading':True},'visited':{'dorm':True,'campus':True,'library':True},'social':{'rel':{},'mem':{},'reveal':{},'prof':{},'grad':{'interest':'CONSIDERING','field':'公法','prep':0}}}
        js="(async()=>{ const s=GAME.defaults('祐廷'); Object.assign(s,"+json.dumps(st,ensure_ascii=False)+"); document.getElementById('titleScreen').classList.add('hide'); await GAME.applySave(s); EVENTS.onEnter=()=>false; EVENTS.tick=()=>false; })()"
        await pg.evaluate(js); await pg.wait_for_timeout(1200)
        await pg.evaluate("window.__p=GAME.studySession(false); 1;")
        for i in range(12):
            await pg.wait_for_timeout(500)
            print(await pg.evaluate("({d:GAME.D.active, full:GAME.D.full, ch:document.getElementById('choices').className, nb:document.querySelectorAll('#choices button').length, busy:GAME.E.player.busy, fade:document.getElementById('fade').className})"))
            r=await pg.evaluate("(()=>{ if(GAME.D.active){ GAME.dlgAdvance(); GAME.dlgAdvance(); return 'adv'; } const b=document.querySelectorAll('#choices button'); if(b.length&&!document.getElementById('choices').classList.contains('hide')){ b[0].click(); return 'click'; } return 'none'; })()")
            print(' ',r)
        for m in msgs[:5]: print(m)
        await b.close()
asyncio.run(main())
