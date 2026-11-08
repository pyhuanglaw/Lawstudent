import asyncio, json, sys
sys.path.insert(0, sys.argv[1] + '/tests')
import playlib as L
from playwright.async_api import async_playwright
INJ = """(a=>{ const G=GAME.G; if(a[0]){ const d=STORY.dayOfKey(a[0]); G.weekday=((G.weekday+(d-G.day))%7+7)%7; G.day=d; } G.hour=a[1]; if(a[2]) G.flags.DECIDE_SAY=[{who:'heroine_05',key:'exam',due:STORY.dayOfKey('2026-01-25'),say:['謝謝你的綠茶。','最後一晚，我想一個人。……考完請你吃飯。'],played:false}]; return [G.day, CALENDAR.dateOf(G.day).key]; })"""
SMP = """(()=>{ const G=GAME.G, P=PHONE.rec(G), tag='decide_say_heroine_05_exam', ds=(G.flags.DECIDE_SAY||[])[0]; return {h:+(+G.hour).toFixed(3), day:G.day, busy:!!GAME.E.player.busy, D:!!(GAME.D&&GAME.D.active), sleeping:(typeof STORY!=='undefined'&&'_sleeping' in STORY)?STORY._sleeping:'n/a', paused:!!GAME.E.paused, q:P.q.length, qTag:P.q.filter(q=>q.tag===tag).map(q=>[q.day,+q.h.toFixed(2)]), played:ds?ds.played:null, got:(G.msgs||[]).filter(m=>m.tag===tag).length, dlg:!document.getElementById('dlg').classList.contains('hide'), ch:document.querySelectorAll('#choices button').length, fade:+getComputedStyle(document.getElementById('fade')).opacity}; })()"""
async def one(p, label, date, inject):
    b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
    await pg.goto(sys.argv[2]); await L.wait_loaded(pg)
    sv = json.load(open(sys.argv[3], encoding='utf-8')); sv['zone']='dorm'; sv['pos']=None
    await L.load_state(pg, sv, quiet_phone=True); await pg.wait_for_timeout(5000); await L.close_panels(pg, cdp)
    print(label, 'set', await pg.evaluate(INJ, [date, 22.0, inject]))
    d0 = await pg.evaluate("GAME.G.day")
    print(label, 'plan', await pg.evaluate("(()=>{ const p=ONETAP.sleepPlan(GAME); return {ok:!!p.ok,why:p.why||null}; })()"))
    await L.tap(pg, cdp, '#btnGo'); await pg.wait_for_timeout(1000); await L.tap(pg, cdp, '#goPop [data-gok="sleep"]'); await pg.wait_for_timeout(1500)
    if await pg.evaluate("(()=>{ const b=document.getElementById('goConfirm'); return !!b&&!b.classList.contains('hide'); })()"): await L.tap(pg, cdp, '#goCfYes')
    for k in range(200):
        smp = await pg.evaluate(SMP)
        if k % 10 == 0: print(label, 'sleeping-phase', json.dumps(smp, ensure_ascii=False))
        if smp['day'] > d0 and smp['h'] > 7: break
        await pg.wait_for_timeout(1000)
    print(label, 'WOKE (不點任何東西)')
    for k in range(12):
        print(label, '+%ds' % (k * 5), json.dumps(await pg.evaluate(SMP), ensure_ascii=False)); await pg.wait_for_timeout(5000)
    print(label, 'errs', errs[:3]); await b.close()
async def m():
    async with async_playwright() as p:
        await one(p, 'CONTROL', None, False)
        await one(p, 'DECIDE', '2026-01-27', True)
asyncio.run(m())
