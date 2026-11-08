import asyncio, json, sys, os
T=sys.argv[1]; sys.path.insert(0,T)
src=open(os.path.join(T,'movement_regression_03c7.py'),encoding='utf-8').read(); ns={}
exec(src[:src.index('results=[]')],ns); exec(src[src.index('class Rig:'):src.index('async def test_A')],ns)
import playlib as L
from playwright.async_api import async_playwright
async def m():
    async with async_playwright() as p:
        b,ctx,pg,cdp,errs=await L.launch(p,landscape=True)
        await pg.goto(sys.argv[2]); await L.wait_loaded(pg)
        rig=ns['Rig'](pg,cdp)
        for x0 in (0.31, 0.1, -0.1, -0.3):
            for sx in (-45, 45):
                await rig.load(ns['state']('dorm',{'x':x0,'z':-2.75,'yaw':3.1416})); await pg.wait_for_timeout(1500)
                a=await rig.pos(); cam=await pg.evaluate("+GAME.E.cam.yaw.toFixed(2)")
                await rig.joy(sx,-45,1500); bb=await rig.pos()
                print('x0=%.2f push=%s cam=%s  %s -> x %.2f z %.2f yaw %.2f blocked %s  dx=%.2f' % (x0, '左前' if sx<0 else '右前', cam, (a['x'],a['z']), bb['x'], bb['z'], bb['yaw'], bb['blocked'], bb['x']-a['x']), flush=True)
        await b.close()
asyncio.run(m())
