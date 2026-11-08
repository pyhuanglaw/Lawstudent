import asyncio, json, sys, re
sys.path.insert(0, sys.argv[1] + '/tests')
src = open(sys.argv[1] + '/tests/movement_regression.py', encoding='utf-8').read()
pre = src[:src.index('results=[]')]          # FLAGS、state()、Rig 以前的定義
cls = src[src.index('class Rig:'):src.index('    async def drive')]
ns = {}; exec(pre, ns); exec(cls, ns)
import playlib as L
from playwright.async_api import async_playwright
PH = """(()=>{ const ph=document.getElementById('phone'); return {paused:!!GAME.E.paused, phoneHidden:ph?ph.classList.contains('hide'):null, pending:(PHONE.pending(GAME.G)||[]).map(m=>({tag:m.tag||null,th:m.th||null,from:m.from||null,text:String(m.text||'').slice(0,30),day:m.day,h:m.h})), busy:!!GAME.E.player.busy, D:!!GAME.D.active}; })()"""
async def m():
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p)
        await pg.goto(sys.argv[2]); await L.wait_loaded(pg)
        rig = ns['Rig'](pg, cdp)
        for nm, st in (('dorm', ns['state']('dorm', {'x':0,'z':2.8,'yaw':3.1416})), ('campus_rain', ns['state']('campus', {'x':74,'z':-2.5,'yaw':1.5708}, weather='rain')), ('campus_avenue', ns['state']('campus', {'x':-40,'z':-5,'yaw':-1.5708}))):
            await rig.load(st)
            a = await pg.evaluate(PH); p0 = await rig.pos()
            await rig.joy(0, -60, 1500); p1 = await rig.pos()
            print(nm, 'after load', json.dumps(a, ensure_ascii=False)); print(nm, 'joy moved', round(((p1['x']-p0['x'])**2+(p1['z']-p0['z'])**2)**0.5, 2), json.dumps(await pg.evaluate(PH), ensure_ascii=False)[:200])
        print('errs', errs[:3]); await b.close()
asyncio.run(m())
