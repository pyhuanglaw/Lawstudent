import asyncio, json, sys
sys.path.insert(0, 'tests')
from playwright.async_api import async_playwright
import playlib as L
OUT=(sys.argv[2] if len(sys.argv)>2 else '/tmp/')
async def main():
    async with async_playwright() as p:
        b,ctx,pg,cdp,errs=await L.launch(p, landscape=False)
        await pg.goto(sys.argv[1]+'?turbo'); await L.wait_loaded(pg)
        await L.load_state(pg,{'stage':'econ','zone':'dorm','day':-361,'hour':17,'pos':{'x':0,'z':2.4,'yaw':3.14,'lv':0},'flags':{'E01_DONE':True,'E01_MORNING':True,'E01_NIGHT':'talk','E01_BOXES':True,'E412_MOVEIN':True}},quiet_events=True)
        await pg.wait_for_timeout(3000)
        await pg.evaluate("void EVENTS.run(STORY_EVENTS.find(e=>e.id==='ev_y0_e08'))")
        shots=0
        for i in range(60):
            await pg.wait_for_timeout(700)
            st=await pg.evaluate("""(()=>({t:(document.getElementById('dlgText')||{}).textContent||'',n:(document.getElementById('dlgName')||{}).textContent||'',
              L:document.getElementById('advL').className,R:document.getElementById('advR').className,root:document.getElementById('adv').className,
              ch:!document.getElementById('choices').classList.contains('hide')}))()""")
            print(json.dumps(st,ensure_ascii=False))
            if '再一張' in st['t'] and shots==0: await pg.screenshot(path=OUT+'pinyu.png'); shots=1
            elif shots==1 and '唐睿把剩下' in st['t']: await pg.screenshot(path=OUT+'narr.png'); shots=2
            elif shots==2 and '你的。' in st['t']: await pg.screenshot(path=OUT+'tangrui.png'); break
            if st['ch']: await pg.evaluate("document.querySelector('#choices button').click()")
            else: await pg.evaluate("GAME.dlgAdvance&&GAME.dlgAdvance()")
        print('errs',errs[:5]); await b.close()
asyncio.run(main())
