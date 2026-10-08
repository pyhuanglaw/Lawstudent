import asyncio, json
from playwright.async_api import async_playwright
URL='http://127.0.0.1:8765/build/index.html?turbo'
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
        drive="""void 0; window.__go=async function(fn){ let done=false; const p=fn().then(()=>{done=true;},e=>{done=true; console.error('ERR',e);}); let guard=0; while(guard++<600&&!done){ await new Promise(r=>setTimeout(r,40)); if(GAME.D.active){ GAME.dlgAdvance(); await new Promise(r=>setTimeout(r,15)); GAME.dlgAdvance(); continue; } const ch=document.getElementById('choices'); if(!ch.classList.contains('hide')){ const b=ch.querySelectorAll('button'); if(b.length){ window.__lastChoice=b[0].innerText; b[0].click(); continue; } } } await p; return {interest:GAME.G.social.grad.interest,prep:GAME.G.social.grad.prep,done:GAME.G.flags.grad_read_done,choice:window.__lastChoice}; }; 1;"""
        await pg.evaluate(drive)
        for i in range(3):
            r=await pg.evaluate("() => __go(() => GAME.studySession(false))"); print('study',i+1,r)
        await pg.screenshot(path='shots/grad_01_prep.png')
        await pg.evaluate("EVENTS.run(STORY_EVENTS.find(e=>e.id==='ev_grad_debate'))"); await pg.wait_for_timeout(4500); await pg.evaluate("GAME.dlgAdvance(); GAME.dlgAdvance();"); await pg.wait_for_timeout(2500); await pg.screenshot(path='screenshots/12_grad_debate_adv.png')
        r=await pg.evaluate("() => __go(() => new Promise(res=>{ const t=setInterval(()=>{ if(!EVENTS.running){ clearInterval(t); res(); } },200); }))"); print('debate',r)
        print(await pg.evaluate("SOCIAL.describe('heroine_05')"))
        print(await pg.evaluate("JSON.stringify(GAME.G.social.prof)"))
        await pg.evaluate("GAME.openMenu('notes')"); await pg.wait_for_timeout(400); await pg.screenshot(path='screenshots/12b_grad_notes.png')
        for m in msgs[:5]: print(m)
        await b.close()
asyncio.run(main())
