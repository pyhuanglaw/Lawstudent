import asyncio, json
from playwright.async_api import async_playwright
URL='http://127.0.0.1:8765/build/index.html?turbo'
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
        ctx=await b.new_context(viewport={'width':844,'height':390},device_scale_factor=1,has_touch=True)
        pg=await ctx.new_page(); msgs=[]
        pg.on('pageerror', lambda e: msgs.append('PAGEERROR: '+str(e)))
        await pg.goto(URL); await pg.wait_for_timeout(9000)
        st={'day':14,'weekday':1,'hour':15.0,'zone':'library','pos':{'x':0,'z':6.5,'yaw':3.1416},'weather':'sunny','flags':{'introDone':True,'classDone':True,'metAn':True,'met_an':True,'afternoonDone':True,'lawclub':True,'grad_reading':True,'grad_read_done':True},'visited':{'dorm':True,'campus':True,'library':True},'social':{'rel':{'heroine_05':{'fam':40,'trust':20,'aff':0,'resp':10,'comf':10,'rom':0,'npcRom':0,'seen':6,'talked':5}},'mem':{'heroine_05':[{'tag':'FIRST_MET','day':2,'note':'library'},{'tag':'GRAD_SCHOOL_DISCUSSION','day':6,'note':'給你一篇文章'}]},'reveal':{'heroine_05':'ACQUAINTANCE'},'prof':{},'grad':{'interest':'PREPARING','field':'公法','prep':3,'log':[{'day':5,'reason':'聽了法研所說明會'},{'day':6,'reason':'問學姊為什麼念研究所'}]}}}
        js="(async()=>{ const s=GAME.defaults('祐廷'); Object.assign(s,"+json.dumps(st,ensure_ascii=False)+"); document.getElementById('titleScreen').classList.add('hide'); await GAME.applySave(s); })()"
        await pg.evaluate(js); await pg.wait_for_timeout(2500)
        await pg.evaluate("void EVENTS.run(STORY_EVENTS.find(e=>e.id==='ev_grad_debate'))"); await pg.wait_for_timeout(5000)
        await pg.evaluate("GAME.dlgAdvance(); GAME.dlgAdvance();"); await pg.wait_for_timeout(3000)
        await pg.screenshot(path='screenshots/12_grad_debate_adv.png')
        print(await pg.evaluate("({d:GAME.D.active, full:(GAME.D.full||'').slice(0,50), ch:document.getElementById('choices').className})"))
        # 選項後結束事件
        for i in range(30):
            await pg.wait_for_timeout(600)
            r=await pg.evaluate("(()=>{ if(GAME.D.active){ GAME.dlgAdvance(); GAME.dlgAdvance(); return 'adv'; } const b=document.querySelectorAll('#choices button'); if(b.length&&!document.getElementById('choices').classList.contains('hide')){ b[0].click(); return 'click'; } return EVENTS.running?'wait':'done'; })()")
            if r=='done': break
        await pg.evaluate("GAME.openMenu('notes')"); await pg.wait_for_timeout(600); await pg.screenshot(path='screenshots/12b_grad_notes.png')
        print(msgs[:3])
        await b.close()
asyncio.run(main())
