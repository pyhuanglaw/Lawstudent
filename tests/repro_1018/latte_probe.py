import asyncio, json, sys
sys.path.insert(0, 'tests')
from playwright.async_api import async_playwright
import playlib as L
OUT=(sys.argv[2] if len(sys.argv)>2 else '/tmp/')
async def main():
    async with async_playwright() as p:
        b,ctx,pg,cdp,errs=await L.launch(p)
        await pg.goto(sys.argv[1]); await L.wait_loaded(pg)
        d=await pg.evaluate("(()=>{ for(let d=-600;d<0;d++){ const t=CALENDAR.dateOf(d); if(t&&t.key==='2024-10-12') return d; } return null; })()")
        await L.load_state(pg,{'stage':'econ','zone':'cafe','day':d,'hour':13.9,'weekday':6,'pos':{'x':0,'z':2,'yaw':3.14,'lv':0},'flags':{'E01_DONE':True,'E01_MORNING':True,'E01_NIGHT':'talk','E01_BOXES':True,'E412_MOVEIN':True}})
        await pg.wait_for_timeout(6000)
        info=await pg.evaluate("""(()=>(GAME.E.npcs||[]).map(n=>({name:n.name,id:n.id||(n.obj&&n.obj.userData&&n.obj.userData.buildSpec&&n.obj.userData.buildSpec.id),clerk:!!n.clerk,x:+n.obj.position.x.toFixed(2),z:+n.obj.position.z.toFixed(2),key:n.obj.userData&&n.obj.userData.key})))()""")
        print('before', json.dumps(info,ensure_ascii=False))
        await pg.evaluate("void EVENTS.run(STORY_EVENTS.find(e=>e.id==='ev_y0_l5a'))")
        await pg.wait_for_timeout(5000)
        info=await pg.evaluate("""(()=>(GAME.E.npcs||[]).map(n=>({name:n.name,id:n.id||(n.obj&&n.obj.userData&&n.obj.userData.buildSpec&&n.obj.userData.buildSpec.id),clerk:!!n.clerk,x:+n.obj.position.x.toFixed(2),z:+n.obj.position.z.toFixed(2),key:n.obj.userData&&n.obj.userData.key})))()""")
        print('during', json.dumps(info,ensure_ascii=False)); print('visible', await pg.evaluate("(GAME.E.npcs||[]).filter(n=>n.clerk).map(n=>n.obj.visible)"))
        await pg.screenshot(path=OUT+'latte_1.png')
        await pg.evaluate("document.getElementById('advRoot')&&(document.getElementById('advRoot').style.opacity='0.05')")
        await pg.evaluate("(()=>{ const E=GAME.E; const n=(E.npcs||[]).find(n=>n.clerk); E.cinematic&&E.cinematic(new THREE.Vector3(-1.5,1.7,-1.0),new THREE.Vector3(-1.5,1.2,-5.2)); })()")
        await pg.wait_for_timeout(2500)
        await pg.screenshot(path=OUT+'latte_counter.png')
        print('errs',errs[:5]); await b.close()
asyncio.run(main())
