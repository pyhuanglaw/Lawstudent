import asyncio, json, sys
sys.path.insert(0, sys.argv[1] + '/tests')
import playlib as L
from playwright.async_api import async_playwright
INJ = """(a=>{ const G=GAME.G; const d=STORY.dayOfKey(a[0]); G.weekday=((G.weekday+(d-G.day))%7+7)%7; G.day=d; G.hour=a[1]; G.flags.DECIDE_SAY=[{who:'heroine_05',key:'exam',due:STORY.dayOfKey('2026-01-25'),say:['謝謝你的綠茶。','最後一晚，我想一個人。……考完請你吃飯。'],played:false}]; return G.day; })"""
ST = """(()=>{ const G=GAME.G, tag='decide_say_heroine_05_exam', P=PHONE.rec(G); return {day:G.day,h:+(+G.hour).toFixed(2),ds:G.flags.DECIDE_SAY[0],q:P.q.filter(q=>q.tag===tag).length,got:(G.msgs||[]).filter(m=>m.tag===tag).map(m=>m.text),sent:PHONE.sent(G,tag),rules:STORY.PHONE_RULES.indexOf(DECIDE.tick)}; })()"""
async def one(p, label, date, hour, act):
    b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
    await pg.goto(sys.argv[2]); await L.wait_loaded(pg)
    sv = json.load(open(sys.argv[3], encoding='utf-8')); sv['zone']='dorm'; sv['pos']=None
    await L.load_state(pg, sv, quiet_phone=True); await pg.wait_for_timeout(5000); await L.close_panels(pg, cdp)
    await pg.evaluate(INJ, [date, hour]); print(label, 'inject', json.dumps(await pg.evaluate(ST), ensure_ascii=False))
    await act(pg, cdp)
    print(label, 'after', json.dumps(await pg.evaluate(ST), ensure_ascii=False)); print(label, 'errs', errs[:3])
    await b.close()
async def natural(pg, cdp): await pg.wait_for_timeout(15000)
async def sleep(pg, cdp):
    d0 = await pg.evaluate("GAME.G.day")
    print(' plan', await pg.evaluate("(()=>{ const p=ONETAP.sleepPlan(GAME); return {ok:!!p.ok,why:p.why||null}; })()"))
    await L.tap(pg, cdp, '#btnGo'); await pg.wait_for_timeout(1000); await L.tap(pg, cdp, '#goPop [data-gok="sleep"]'); await pg.wait_for_timeout(1500)
    if await pg.evaluate("(()=>{ const b=document.getElementById('goConfirm'); return !!b&&!b.classList.contains('hide'); })()"): await L.tap(pg, cdp, '#goCfYes')
    for _ in range(200):
        if await pg.evaluate("(d=>GAME.G.day>d&&GAME.G.hour>7)", d0): break
        s = await L.state(pg)
        if s['choices']: await L.tap(pg, cdp, '#choices button')
        elif s['dlg']: await L.tap(pg, cdp, '#dlg')
        await pg.wait_for_timeout(1000)
    await pg.wait_for_timeout(8000)
    print(' woke', json.dumps(await pg.evaluate(ST), ensure_ascii=False), 'paused', await pg.evaluate("GAME.E.paused"), 'phoneOpen', await pg.evaluate("!document.getElementById('phone').classList.contains('hide')"))
    await L.close_panels(pg, cdp); await pg.wait_for_timeout(15000)
    print(' +15s', json.dumps(await pg.evaluate(ST), ensure_ascii=False), 'paused', await pg.evaluate("GAME.E.paused"))
    await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(900)
    await pg.evaluate("(()=>{ const b=document.querySelector('#phoneTabs button[data-ptab=\"today\"]'); if(b) b.click(); })()"); await pg.wait_for_timeout(700)
    await pg.evaluate("(()=>{ const bs=[...document.querySelectorAll('#phoneBody [data-skip]')]; if(bs.length) bs[bs.length-1].click(); })()"); await pg.wait_for_timeout(6000)
    print(' skip', json.dumps(await pg.evaluate(ST), ensure_ascii=False), 'paused', await pg.evaluate("GAME.E.paused"))
    await L.close_panels(pg, cdp); await pg.wait_for_timeout(10000)
async def m():
    async with async_playwright() as p:
        await one(p, 'SLEEP', '2026-01-27', 22.0, sleep)
asyncio.run(m())
