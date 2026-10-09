import asyncio, json, sys
from playwright.async_api import async_playwright
URL='http://127.0.0.1:8765/build/index.html?turbo'
DRIVER=open(__import__('os').path.join(__import__('os').path.dirname(__import__('os').path.abspath(__file__)),'flowtest.py')).read().split('DRIVER=r"""')[1].split('"""')[0]
async def run(pg,cdp,state,evid,name,lines=2,pick=None):
    js="(async()=>{ const s=GAME.defaults('祐廷'); Object.assign(s,"+json.dumps(state,ensure_ascii=False)+"); document.getElementById('titleScreen').classList.add('hide'); await GAME.applySave(s); EVENTS.onEnter=()=>false; EVENTS.tick=()=>false; })()"
    await pg.evaluate(js); await pg.wait_for_timeout(1500)
    await pg.evaluate(f"void EVENTS.run(STORY_EVENTS.find(e=>e.id==='{evid}'))"); await pg.wait_for_timeout(3500)
    for i in range(lines):
        await pg.evaluate("GAME.dlgAdvance(); GAME.dlgAdvance();"); await pg.wait_for_timeout(1800)
    await pg.screenshot(path=f'screenshots/{name}.png')
    # finish
    for i in range(60):
        r=await pg.evaluate("(()=>{ if(GAME.D.active){ GAME.dlgAdvance(); GAME.dlgAdvance(); return 'adv'; } const b=document.querySelectorAll('#choices button'); if(b.length&&!document.getElementById('choices').classList.contains('hide')){ b[0].click(); return 'click'; } return EVENTS.running?'wait':'done'; })()")
        await pg.wait_for_timeout(250)
        if r=='done': break
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
        for (w,h,tag) in [(390,844,'portrait'),(844,390,'land')]:
            ctx=await b.new_context(viewport={'width':w,'height':h},device_scale_factor=1,has_touch=True,is_mobile=True)
            pg=await ctx.new_page(); msgs=[]
            pg.on('console', lambda m: msgs.append(m.type+': '+m.text) if m.type in ('error',) and '404' not in m.text and 'ERR_TUNNEL' not in m.text else None)
            pg.on('pageerror', lambda e: msgs.append('PAGEERROR: '+str(e)))
            await pg.goto(URL); await pg.wait_for_timeout(9000)
            cdp=await ctx.new_cdp_session(pg)
            await pg.evaluate("document.getElementById('rotate').classList.remove('want')")
            base={'day':8,'weekday':1,'hour':15.0,'zone':'campus','pos':{'x':74,'z':-2.5,'yaw':1.5708},'weather':'rain','flags':{'introDone':True,'campusIntro':True,'classDone':True,'metAn':True,'met_an':True,'afternoonDone':True,'lawclub':True},'visited':{'dorm':True,'campus':True,'library':True,'cafe':True},'social':{'rel':{},'mem':{},'reveal':{},'prof':{},'grad':{'interest':'NONE','field':None,'prep':0}}}
            await run(pg,cdp,base,'ev_rain_library_door',f'F_heroine_adv_{tag}',lines=3)
            st=dict(base); st.update({'zone':'dorm','pos':{'x':0,'z':2.0,'yaw':3.1416},'hour':23.5,'weather':'sunny'})
            await run(pg,cdp,st,'ev_dorm_late_kai',f'D_kai_dialog_{tag}',lines=0)
            st=dict(base); st.update({'zone':'campus','pos':{'x':-40,'z':-5,'yaw':0},'hour':17.5,'weather':'sunny'})
            await run(pg,cdp,st,'ev_zhe_dinner',f'E_zhe_dialog_{tag}',lines=0)
            st=dict(base); st.update({'zone':'library','pos':{'x':0,'z':6.5,'yaw':3.1416},'hour':15.0,'weather':'sunny'})
            await run(pg,cdp,st,'ev_an_report_followup',f'F_heroine01_adv_{tag}',lines=1)
            st=dict(base); st.update({'zone':'wancai','pos':{'x':0,'z':5,'yaw':3.1416},'hour':19.0,'weekday':3,'weather':'sunny'})
            await run(pg,cdp,st,'ev_studygroup_wed',f'F_studygroup_{tag}',lines=2)
            print(tag,'console:',msgs[:4])
            await ctx.close()
        await b.close()
asyncio.run(main())
