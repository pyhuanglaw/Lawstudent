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
        st={'day':8,'weekday':4,'hour':13.3,'zone':'campus','pos':{'x':34,'z':-99,'yaw':0},'weather':'sunny','flags':{'introDone':True,'campusIntro':True,'classDone':True,'metAn':True,'met_an':True,'afternoonDone':True,'lawclub':True},'visited':{'dorm':True,'campus':True},'social':{'rel':{},'mem':{},'reveal':{},'prof':{},'grad':{'interest':'NONE','field':None,'prep':0}}}
        js="(async()=>{ const s=GAME.defaults('祐廷'); Object.assign(s,"+json.dumps(st,ensure_ascii=False)+"); document.getElementById('titleScreen').classList.add('hide'); await GAME.applySave(s); })()"
        await pg.evaluate(js); await pg.wait_for_timeout(1500)
        jx,jy=await pg.evaluate("(()=>{ const r=document.getElementById('joy').getBoundingClientRect(); return [r.left+r.width/2, r.top+r.height/2]; })()")
        await cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':jx,'y':jy}]})
        for i in range(15):
            await cdp.send('Input.dispatchTouchEvent',{'type':'touchMove','touchPoints':[{'x':jx,'y':jy-60}]}); await pg.wait_for_timeout(80)
        await cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]}); await pg.wait_for_timeout(1500)
        for i in range(4):
            print(await pg.evaluate("(()=>{ const c=GAME.E.cam; const h=GAME.E.screenToGround(230,400); const P=GAME.E.player.obj.position; return {cam:[+c.yaw.toFixed(2),+c.pitch.toFixed(2),+c.dist.toFixed(2)], hit:h?[+h.x.toFixed(1),+h.z.toFixed(1)]:null, pos:[+P.x.toFixed(1),+P.z.toFixed(1)]}; })()"))
            await pg.wait_for_timeout(500)
        await pg.evaluate("(()=>{ window.__log=[]; const c=document.getElementById('c'); for(const t of ['pointerdown','pointerup','pointercancel','pointermove']) c.addEventListener(t,e=>__log.push(t+'@'+Math.round(e.clientX)+','+Math.round(e.clientY)+' id='+e.pointerId+' type='+e.pointerType)); const orig=GAME.E.moveTo; GAME.E.moveTo=function(ent,x,z,cb){ const r=orig.call(this,ent,x,z,cb); __log.push('moveTo('+x.toFixed(1)+','+z.toFixed(1)+')='+r); return r; }; })()")
        await cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':230,'y':400}]}); await pg.wait_for_timeout(60); await cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]})
        print('tap right after:', await pg.evaluate("({tap:GAME.E.input.tap, info:GAME.E.lastTapInfo})"))
        await pg.wait_for_timeout(1200)
        print('log:', await pg.evaluate("__log"))
        print(await pg.evaluate("({path:GAME.E.player.path, pos:[GAME.E.player.obj.position.x,GAME.E.player.obj.position.z]})"))
        print(await pg.evaluate("(()=>{ const n=GAME.E.nav; const p=n.path(34,-91.6,33.4,-85.7); return {pathLen:p?p.length:null, freeA:n.free(34,-91.6), freeB:n.free(33.4,-85.7), onTap:GAME.E.onTap?GAME.E.onTap({x:230,y:400}):'none', busy:GAME.E.player.busy, cam:GAME.E.cam.mode, paused:GAME.E.paused}; })()"))
        print(await pg.evaluate("(()=>{ const ok=GAME.E.moveTo(GAME.E.player,33.4,-85.7); return {ok, path:GAME.E.player.path&&GAME.E.player.path.length}; })()"))
        await b.close()
asyncio.run(main())
