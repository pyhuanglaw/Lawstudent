import asyncio, json
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
        ctx=await b.new_context(viewport={'width':390,'height':844},device_scale_factor=1,has_touch=True,is_mobile=True)
        pg=await ctx.new_page()
        await pg.goto('http://127.0.0.1:8765/build/index.html?turbo'); await pg.wait_for_timeout(9000)
        cdp=await ctx.new_cdp_session(pg)
        await pg.evaluate("document.getElementById('rotate').classList.remove('want')")
        st={'day':8,'weekday':4,'hour':13.3,'zone':'campus','pos':{'x':34,'z':-83,'yaw':0},'weather':'sunny','flags':{'introDone':True,'campusIntro':True,'classDone':True,'metAn':True,'met_an':True,'afternoonDone':True,'lawclub':True},'visited':{'dorm':True,'campus':True},'social':{'rel':{},'mem':{},'reveal':{},'prof':{},'grad':{'interest':'NONE','field':None,'prep':0}}}
        js="(async()=>{ const s=GAME.defaults('祐廷'); Object.assign(s,"+json.dumps(st,ensure_ascii=False)+"); document.getElementById('titleScreen').classList.add('hide'); await GAME.applySave(s); })()"
        await pg.evaluate(js); await pg.wait_for_timeout(1500)
        await pg.evaluate("""(()=>{ window.__ev=[]; const c=document.getElementById('c'); for(const t of ['pointerdown','pointerup','pointercancel','pointermove','touchstart','touchend','click']) c.addEventListener(t,e=>__ev.push(t+'@'+Math.round(e.clientX||0)+','+Math.round(e.clientY||0))); })()""")
        await cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':230,'y':400}]}); await pg.wait_for_timeout(60); await cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]})
        await pg.wait_for_timeout(600)
        print(await pg.evaluate("[380,420,460,500,540].map(y=>{ const h=GAME.E.screenToGround(230,y); return [y,h?[+h.x.toFixed(1),+h.z.toFixed(1)]:null]; })")); print(await pg.evaluate("({ev:__ev, tap:GAME.E.input.tap, el:(()=>{ const e=document.elementFromPoint(230,600); return e?(e.id||e.tagName)+'.'+e.className:null; })(), hit:(()=>{ const h=GAME.E.screenToGround(230,600); return h?[+h.x.toFixed(1),+h.z.toFixed(1)]:null; })(), path:GAME.E.player.path})"))
        await pg.wait_for_timeout(1500)
        print(await pg.evaluate("({pos:[GAME.E.player.obj.position.x,GAME.E.player.obj.position.z], path:GAME.E.player.path})"))
        await b.close()
asyncio.run(main())
