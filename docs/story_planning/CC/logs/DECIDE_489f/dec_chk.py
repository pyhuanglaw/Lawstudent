import asyncio, json, sys
sys.path.insert(0, sys.argv[1] + '/tests')
import playlib as L
from playwright.async_api import async_playwright
async def m():
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(sys.argv[2]); await L.wait_loaded(pg)
        sv = json.load(open(sys.argv[3], encoding='utf-8')); sv['zone']='dorm'; sv['pos']=None; sv['hour']=13.0
        await L.load_state(pg, sv, quiet_phone=True); await pg.wait_for_timeout(5000)
        r = await pg.evaluate("""(()=>{ const G=GAME.G; const d=STORY.dayOfKey('2026-01-28'); G.weekday=((G.weekday+(d-G.day))%7+7)%7; G.day=d; G.hour=20; G.flags.DECIDE_SAY=[{who:'heroine_05',key:'exam',due:G.day-3,say:['謝謝你的綠茶。','最後一晚，我想一個人。……考完請你吃飯。'],played:false}];
          const P=PHONE.rec(G); const tag='decide_say_heroine_05_exam'; const sent0=PHONE.sent(G,tag); const q0=P.q.length;
          const cut=typeof ECONFF!=='undefined'&&ECONFF.cutMsg?ECONFF.cutMsg(G,tag):null;
          const did=DECIDE.tick(G); const q1=P.q.length; const qi=P.q.filter(q=>q.tag===tag).map(q=>({day:q.day,h:q.h,n:q.items.length,th:q.items[0].th}));
          const n=PHONE.tick(G); const rules=STORY.PHONE_RULES.indexOf(DECIDE.tick); const P2=PHONE.rec(G); const after=P2.q.filter(q=>q.tag===tag).length; const got=(G.msgs||[]).filter(m=>m.tag===tag).map(m=>({th:m.th,from:m.from,text:m.text}));
          return {rules,after,day:G.day,hour:G.hour,sent0,cut,did,q0,q1,qi,flushed:n,got,ds:G.flags.DECIDE_SAY[0], th:PHONE.th?String(PHONE.th).slice(0,80):null}; })()""")
        print(json.dumps(r, ensure_ascii=False)); print('errs', errs[:3])
        await b.close()
asyncio.run(m())
