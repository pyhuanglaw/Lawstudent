"""自動遊玩測試：python3 play.py URL prefix W H '[actions]'
actions: ["wait",ms] ["tap",x,y] ["click","#sel"] ["key","w",ms] ["shot","name"] ["eval","js"] ["dlg"] (點對話直到沒有對話) ["choose",i] ["log","js"] ["until","js",timeout]
"""
import asyncio, sys, json, time
from playwright.async_api import async_playwright
async def main(url, prefix, w, h, actions, mobile):
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
        ctx_args={'viewport':{'width':w,'height':h},'device_scale_factor':1,'has_touch':True}
        if mobile: ctx_args['is_mobile']=True; ctx_args['user_agent']='Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
        ctx=await b.new_context(**ctx_args)
        pg=await ctx.new_page()
        msgs=[]
        pg.on('console', lambda m: msgs.append(m.type+': '+m.text) if m.type in ('error','warning','log') else None)
        pg.on('pageerror', lambda e: msgs.append('PAGEERROR: '+str(e)))
        await pg.goto(url)
        await pg.wait_for_timeout(1500)
        n=0
        try:
         for a in actions:
             t=a[0]
             if t=='eval': await pg.evaluate(a[1])
             elif t=='log': print('LOG', json.dumps(await pg.evaluate(a[1]),ensure_ascii=False))
             elif t=='wait': await pg.wait_for_timeout(a[1])
             elif t=='tap': await pg.touchscreen.tap(a[1],a[2])
             elif t=='click': await pg.click(a[1])
             elif t=='key': await pg.keyboard.down(a[1]); await pg.wait_for_timeout(a[2]); await pg.keyboard.up(a[1])
             elif t=='shot': n+=1; await pg.screenshot(path=f'shots/{prefix}_{n:02d}_{a[1]}.png')
             elif t=='dlg':
                 # 連續點對話直到對話框消失或出現選項
                 seen=False; idle=0
                 for i in range(200):
                     active=await pg.evaluate("GAME.D.active")
                     choices=await pg.evaluate("!document.getElementById('choices').classList.contains('hide')")
                     if choices: break
                     if active:
                         seen=True; idle=0
                         txt=await pg.evaluate("document.getElementById('dlgName').textContent+'：'+GAME.D.full")
                         print('  >', txt[:70])
                         await pg.evaluate("GAME.dlgAdvance()"); await pg.wait_for_timeout(120)
                         await pg.evaluate("GAME.dlgAdvance()"); await pg.wait_for_timeout(300)
                     else:
                         await pg.wait_for_timeout(250); idle+=250
                         if seen and idle>1800: break
                         if not seen and idle>9000: break
             elif t=='choose':
                 await pg.wait_for_timeout(200)
                 btns=await pg.query_selector_all('#choices button')
                 if not btns: print('NO CHOICES'); continue
                 i=min(a[1],len(btns)-1); txt=await btns[i].inner_text(); print('CHOOSE', i, txt.replace('\n',' | ')[:60]); await btns[i].click()
             elif t=='until':
                 t0=time.time(); ok=False
                 while time.time()-t0<a[2]/1000:
                     if await pg.evaluate(a[1]): ok=True; break
                     await pg.wait_for_timeout(200)
                 print('UNTIL', a[1][:50], 'ok' if ok else 'TIMEOUT')
        finally:
         for m in msgs[:40]: print(m)
        await b.close()
url=sys.argv[1]; prefix=sys.argv[2]; w=int(sys.argv[3]); h=int(sys.argv[4]); actions=json.loads(sys.argv[5]) if len(sys.argv)>5 else []
mobile=len(sys.argv)>6 and sys.argv[6]=='mobile'
asyncio.run(main(url,prefix,w,h,actions,mobile))
