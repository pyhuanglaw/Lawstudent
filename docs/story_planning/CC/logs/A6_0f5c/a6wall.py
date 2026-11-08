import asyncio, json, sys, os
T=sys.argv[1]; sys.path.insert(0,T)
src=open(os.path.join(T,'movement_regression.py'),encoding='utf-8').read(); ns={}
exec(src[:src.index('results=[]')],ns); exec(src[src.index('class Rig:'):src.index('async def test_A')],ns)
import playlib as L
from playwright.async_api import async_playwright
async def m():
    async with async_playwright() as p:
        b,ctx,pg,cdp,errs=await L.launch(p,landscape=True)
        await pg.goto(sys.argv[2]); await L.wait_loaded(pg)
        rig=ns['Rig'](pg,cdp); await rig.load(ns['state']('dorm',{'x':0,'z':2.8,'yaw':3.1416}))
        r=await pg.evaluate("""(()=>{ const E=GAME.E, out={}; for(const z of [-2.78,-2.7,-2.6,-2.5]){ const row=[]; for(let x=-1.6;x<=1.21;x+=0.1){ row.push(E.canStand(x,z,0.3)?'#':'.'); } out[z]=row.join(''); }
          const near=[]; for(const it of E.interactables) if(Math.abs(it.z+2.7)<1.2&&Math.abs(it.x)<2) near.push([it.label,+it.x.toFixed(2),+it.z.toFixed(2)]);
          return {rows:out, near}; })()""")
        print('x from -1.6 to 1.2 step 0.1 (# = canStand r0.3)'); [print(k, v) for k, v in r['rows'].items()]; print('interactables', json.dumps(r['near'], ensure_ascii=False))
        await b.close()
asyncio.run(m())
