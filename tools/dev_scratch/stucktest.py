import asyncio, json
from playwright.async_api import async_playwright
URL='http://127.0.0.1:8765/build/index.html?turbo&lowres'
DRIVER=open(__import__('os').path.join(__import__('os').path.dirname(__import__('os').path.abspath(__file__)),'flowtest.py')).read().split('DRIVER=r"""')[1].split('"""')[0]
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
        ctx=await b.new_context(viewport={'width':390,'height':844},device_scale_factor=1,has_touch=True,is_mobile=True,user_agent='Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1')
        pg=await ctx.new_page(); msgs=[]
        pg.on('console', lambda m: msgs.append(m.type+': '+m.text) if m.type in ('error','warning') and '404' not in m.text and 'portrait missing' not in m.text and 'ERR_TUNNEL' not in m.text else None)
        pg.on('pageerror', lambda e: msgs.append('PAGEERROR: '+str(e)))
        await pg.goto(URL); await pg.wait_for_timeout(9000)
        await pg.evaluate(DRIVER)
        await pg.evaluate("document.getElementById('rotate').classList.remove('want')")
        await pg.fill('#nameInput','祐廷'); await pg.click('#btnNew'); await pg.wait_for_timeout(1500)
        r=await pg.evaluate("__drive(40000)"); print('intro done', r['zone'], r['hour'])
        print(await pg.evaluate("__use('坐在書桌前')")); r=await pg.evaluate("__drive(20000)")
        print(await pg.evaluate("__use('睡覺')")); r=await pg.evaluate("__drive(30000)"); print('after sleep', r['zone'], r['hour'])
        print(await pg.evaluate("__use('離開宿舍')")); r=await pg.evaluate("__drive(40000)"); print('campus morning done', r['zone'], r['hour'], r['flags'])
        st=await pg.evaluate("(()=>{ const P=GAME.E.player; const o=P.obj.position; return {pos:[o.x,o.z], busy:P.busy, frozen:P.frozen, path:P.path, d:GAME.D.active, adv:ADV.active, free:GAME.E.nav.free(o.x,o.z), zhe:GAME.npc.zhe&&GAME.npc.zhe.beh, cam:GAME.E.cam.mode, menu:document.body.className, el:(()=>{ const e=document.elementFromPoint(195,300); return e?e.id+'.'+e.className:null; })()}; })()")
        print('state', st)
        await pg.screenshot(path='shots/stuck_01.png')
        # 真的用觸控點地面（畫面中上方）
        await pg.touchscreen.tap(195,320); await pg.wait_for_timeout(2500)
        st2=await pg.evaluate("(()=>{ const P=GAME.E.player; const o=P.obj.position; return {pos:[+o.x.toFixed(2),+o.z.toFixed(2)], path:!!P.path, pose:P.pose}; })()")
        print('after tap', st2)
        # 搖桿拖曳
        await pg.evaluate("(()=>{ const j=document.getElementById('joy'); const r=j.getBoundingClientRect(); window.__joy=[r.left+r.width/2, r.top+r.height/2]; })()")
        jx,jy=await pg.evaluate("window.__joy")
        cdp=await ctx.new_cdp_session(pg)
        await cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':jx,'y':jy}]})
        for i in range(12):
            await cdp.send('Input.dispatchTouchEvent',{'type':'touchMove','touchPoints':[{'x':jx,'y':jy-40-i*2}]}); await pg.wait_for_timeout(120)
        st3=await pg.evaluate("(()=>{ const P=GAME.E.player; const o=P.obj.position; return {pos:[+o.x.toFixed(2),+o.z.toFixed(2)], pose:P.pose, joy:GAME.E.input.joy}; })()")
        await cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]})
        print('after joystick', st3)
        await pg.screenshot(path='shots/stuck_02.png')
        for m in msgs[:8]: print(m[:300])
        await b.close()
asyncio.run(main())
