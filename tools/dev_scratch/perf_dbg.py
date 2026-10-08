import asyncio, json, sys
from playwright.async_api import async_playwright
URL='http://127.0.0.1:8765/index.html?turbo&lowres'
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
        ctx=await b.new_context(viewport={'width':844,'height':390},device_scale_factor=1,has_touch=True)
        pg=await ctx.new_page()
        await pg.goto(URL); await pg.wait_for_timeout(6000)
        for day,wd,hr in [(2,4,15.2),(14,1,15.2),(14,1,10.5)]:
            st={'day':day,'weekday':wd,'hour':hr,'zone':'campus','pos':{'x':34,'z':-99,'yaw':0},'weather':'sunny','flags':{'introDone':True,'campusIntro':True,'classDone':True,'zheInvite':True,'afternoonDone':day>2},'visited':{'dorm':True,'campus':True,'classroom':True}}
            js="(async()=>{ const s=GAME.defaults('祐廷'); Object.assign(s,"+json.dumps(st,ensure_ascii=False)+"); document.getElementById('titleScreen').classList.add('hide'); await GAME.applySave(s); })()"
            await pg.evaluate(js); await pg.wait_for_timeout(1500)
            r=await pg.evaluate("""(()=>{ const E=GAME.E; const t=[]; for(let i=0;i<5;i++){ const a=performance.now(); E.update(0.016); const b=performance.now(); E.render(); const c=performance.now(); t.push([Math.round(b-a),Math.round(c-b)]); } return {t, calls:E.renderer.info.render.calls, tris:E.renderer.info.render.triangles, npcs:E.npcs.length, named:Object.keys(GAME.npc), pr:E.renderer.getPixelRatio(), size:[E.renderer.domElement.width,E.renderer.domElement.height], q:E.q}; })()""")
            print(day,wd,hr,r)
        await b.close()
asyncio.run(main())
