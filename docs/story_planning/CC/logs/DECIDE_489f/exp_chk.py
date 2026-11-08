import asyncio, json, sys
sys.path.insert(0, sys.argv[1] + '/tests')
import playlib as L
from playwright.async_api import async_playwright
async def m():
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(sys.argv[2]); await L.wait_loaded(pg)
        sv = json.load(open(sys.argv[3], encoding='utf-8')); sv['zone']='dorm'; sv['pos']=None; sv['hour']=13.0
        await L.load_state(pg, sv, quiet_phone=True); await pg.wait_for_timeout(5000); await L.close_panels(pg, cdp)
        for label, key in (('due+11', 11), ('due+5', 5)):
            r = await pg.evaluate("""(k=>{ const G=GAME.G; const due=STORY.dayOfKey('2026-01-25'); const d=due+k; G.weekday=((G.weekday+(d-G.day))%7+7)%7; G.day=d; G.hour=10;
              G.flags.DECIDE_SAY=[{who:'heroine_05',key:'exam',due,say:['謝謝你的綠茶。','最後一晚，我想一個人。……考完請你吃飯。'],played:false}];
              window.__pr=0; window.__dt=0; if(!window.__wr){ window.__wr=1; const o=STORY.phoneRules; STORY.phoneRules=function(){ window.__pr++; return o.apply(this,arguments); }; const i=STORY.PHONE_RULES.indexOf(DECIDE.tick); const t=STORY.PHONE_RULES[i]; STORY.PHONE_RULES[i]=function(){ window.__dt++; return t.apply(this,arguments); }; }
              return {day:G.day, key:CALENDAR.dateOf(G.day).key}; })""", key)
            await pg.wait_for_timeout(12000)
            s = await pg.evaluate("({pr:window.__pr, dt:window.__dt, h:+(+GAME.G.hour).toFixed(3), ds:GAME.G.flags.DECIDE_SAY[0], paused:!!GAME.E.paused, busy:!!GAME.E.player.busy, D:!!GAME.D.active, sleeping:STORY._sleeping, phone:!document.getElementById('phone').classList.contains('hide'), dlg:!document.getElementById('dlg').classList.contains('hide')})")
            print(label, json.dumps(r, ensure_ascii=False), json.dumps(s, ensure_ascii=False))
        print('errs', errs[:3]); await b.close()
asyncio.run(m())
