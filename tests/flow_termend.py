"""學期末的飯（BB_203、AA_250、AA_254；BB203-CONFESS-1017）的瀏覽器流程（第 2 級，局部瀏覽器；手機模擬 844×390 觸控，不是實機）：
大一上期末週（2025-12-18 週四）晚上在宿舍 → 20:30 以安「考完了。……這次只有我們兩個，可以嗎？」（心意的邀約）、芯慈（朋友的邀約）→
打開手機「訊息」、在「待回覆」按以安的「好。」→ 排成 12/20 19:00 的出遊、芯慈自動婉拒 →
[前置] 時間撥到 12/20 18:57 → 「現在要出發嗎？」→ 出發 → 飯（一對一的開場、話題、收尾）→ 回家的路上第一個選項（說出來）→ 交往（dating_heroine_01）。
全程沒有 JS 例外、黑幕不擋對話。
[前置／捷徑]：讀檔到 12/18 20:10 宿舍房間；以安的關係數值、4 次正式約會含心願地點、芯慈這學期的接觸用遊戲自己的 API 設（等同玩了一學期）；
時間撥到 12/20 18:57（等出發提示，同 flow_trip_date）。之後都用觸控。用 ?turbo。
用法：python3 tests/flow_termend.py URL [輸出資料夾]"""
import asyncio, json, sys
from playwright.async_api import async_playwright
sys.path.insert(0, __import__('os').path.dirname(__file__))
import playlib as L

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8765/index.html'
OUT = sys.argv[2] if len(sys.argv) > 2 else '/tmp/flow_termend'
TURBO = URL + ('&' if '?' in URL else '?') + 'turbo'


async def pick(pg, cdp, prefer):
    c = await pg.evaluate("(w=>{ const bs=[...document.querySelectorAll('#choices button')]; if(!bs.length) return null; let e=bs.find(x=>w.some(s=>x.textContent.includes(s)))||bs[0]; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2,e.textContent.trim().slice(0,30)]; })(%s)" % json.dumps(prefer))
    if c: await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(700)
    return c and c[2]


async def drive(pg, cdp, until_js, prefer, max_s=240):
    """點對話、照 prefer 點選項，直到 until_js 成立；回傳 (成功, 看過的選項)"""
    seen = []
    for _ in range(int(max_s * 2)):
        if await pg.evaluate(until_js): return True, seen
        s = await L.state(pg)
        fade = await pg.evaluate("(()=>{ const f=document.getElementById('fade'); return !!f&&getComputedStyle(f).opacity>0.5&&getComputedStyle(f).pointerEvents!=='none'; })()")
        if s['choices']:
            opts = await pg.evaluate("[...document.querySelectorAll('#choices button')].map(b=>b.textContent.trim().slice(0,24))")
            seen.append(opts); print('   選項', opts, flush=True)
            await pick(pg, cdp, prefer)
        elif s['dlg']:
            if fade: seen.append(['<黑幕下有對話>'])
            await L.tap(pg, cdp, '#dlg')
        await pg.wait_for_timeout(500)
    return False, seen


async def main():
    run = L.Run('flow_termend', OUT)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(TURBO); run.check('遊戲載入', await L.wait_loaded(pg))
        d18 = await pg.evaluate("STORY.dayOfKey('2025-12-18')")
        st = {'stage': 'law', 'zone': 'dorm', 'day': d18, 'weekday': 4, 'hour': 20.15, 'pos': {'x': -0.6, 'z': -0.4, 'yaw': 3.14},
              'flags': {'KX_FIRST_MSG': True, 'fundsV2': 1, 'allowanceMonth': 1, 'introDone': True, 'classDone': True, 'afternoonDone': True, 'metAn': True},
              'events': {'done': {}, 'last': {}, 'count': 0}}
        run.setup('讀檔到大一上期末週 2025-12-18（四）20:10 宿舍房間')
        await L.load_state(pg, st)
        run.setup('以安：認識、FRIEND 的數值、她的戀愛 30、4 次正式約會含心願地點、有聯絡方式；芯慈：這學期常接觸（等同玩了一學期）')
        await pg.evaluate("""(()=>{ const G=GAME.G; for(const id of ['heroine_01','classmate_xinci']){ SOCIAL.remember(id,'FIRST_MET',''); INV.rec(G); G.contacts[id]=G.day-60; }
          Object.assign(SOCIAL.rel('heroine_01'),{fam:45,trust:30,comf:20,npcRom:30,rom:10}); const Lg=DATE.log(G,'heroine_01'); Lg.count=4; Lg.wish=true;
          Object.assign(SOCIAL.rel('classmate_xinci'),{fam:30,trust:20,comf:15});
          const R=TERMEND.rec(G), C=R.contact||(R.contact={}); (C.Y1S1||(C.Y1S1={})).classmate_xinci={pts:7,k:{},last:G.day-2}; })()""")
        await pg.evaluate("(()=>{ if(window.__said) return; window.__said=[]; const o=GAME.say; GAME.say=function(w,t){ window.__said.push(String(t||'')); return o.apply(this,arguments); }; })()")
        ok = False
        for _ in range(900):   # 遊戲時間 20:10 → 20:39（turbo 下約 2～3 分鐘）；先答應一個就不會再收到別的邀約，所以要等兩則都到
            ok = await pg.evaluate("['te_Y1S1_heroine_01','te_Y1S1_classmate_xinci'].every(t=>(GAME.G.msgs||[]).some(m=>m.tag===t&&(m.day<GAME.G.day||m.h<=GAME.G.hour)))")   # 以安 20:30、芯慈 20:39（一則一則隔 9 分鐘）
            if ok: break
            s = await L.state(pg)
            if s['dlg']: await L.tap(pg, cdp, '#dlg')
            await pg.wait_for_timeout(500)
        msgs = await pg.evaluate("(GAME.G.msgs||[]).filter(m=>/^te_Y1S1_/.test(m.tag||'')).map(m=>[m.from,m.text])")
        run.check('20:30 以安的心意邀約「考完了。……這次只有我們兩個，可以嗎？我訂了位子，七點。」＋芯慈的朋友邀約', ok and ['heroine_01', '考完了。……這次只有我們兩個，可以嗎？我訂了位子，七點。'] in msgs and any(m[0] == 'classmate_xinci' for m in msgs), json.dumps(msgs, ensure_ascii=False))
        await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(900)
        await L.tap(pg, cdp, '#phoneTabs button[data-ptab="msg"]'); await pg.wait_for_timeout(900)
        # 訊息頁像 LINE（PHONE-LINE-UI-1018，使用者 22:4x 選 B）：列表上以安那一列標「待回覆」，點進去才回
        row = await pg.evaluate("(()=>{ const e=document.querySelector('#phoneBody .chatRow[data-th=\"p:heroine_01\"]'); return e?e.innerText:null; })()")
        run.check('手機「訊息」列表有以安那一列（看得到她最新的一句、標「待回覆」）', bool(row) and '待回覆' in row, str(row))
        if row:
            await pg.evaluate("document.querySelector('#phoneBody .chatRow[data-th=\"p:heroine_01\"]').scrollIntoView({block:'center'})"); await pg.wait_for_timeout(300)
            await L.tap(pg, cdp, '#phoneBody .chatRow[data-th="p:heroine_01"]'); await pg.wait_for_timeout(1200)
        sel = '#phoneBody [data-ask="te_Y1S1_heroine_01|0"]'
        has = await pg.evaluate("!!document.querySelector(%s)" % json.dumps(sel))
        run.check('點進以安的對話：有那則和「好。」', has)
        await run.shot(pg, 'phone_invites')
        if has:
            await pg.evaluate("document.querySelector(%s).scrollIntoView({block:'center'})" % json.dumps(sel)); await pg.wait_for_timeout(300)
            await L.tap(pg, cdp, sel); await pg.wait_for_timeout(1200)
        await L.tap(pg, cdp, '#btnPhoneClose'); await pg.wait_for_timeout(1200)
        q = None
        for _ in range(40):   # 回覆以後，下一次手機規則（S.phone → pickCheck）才排出遊
            q = await pg.evaluate("(()=>{ const q=OUT.get(GAME.G,'te_Y1S1'); return q?{who:q.te&&q.te.who,kind:q.te&&q.te.kind,day:q.day,h:q.h}:null; })()")
            if q and await pg.evaluate("(GAME.G.msgs||[]).some(m=>m.from==='classmate_xinci'&&m.text==='好。那開學見。')"): break
            await pg.wait_for_timeout(500)
        dbg = await pg.evaluate("(()=>{ const R=TERMEND.rec(GAME.G,'Y1S1'); return {picked:R.picked||null, flags:{p:GAME.G.flags.TE_PICK||null,n:GAME.G.flags.TE_NO||null}, asks:R.asks||null, ans:((GAME.G.msgs||[]).find(m=>m.ask&&m.ask.id==='te_Y1S1_heroine_01')||{}).ans, h:GAME.G.hour}; })()")
        print('   回覆以後', json.dumps(dbg, ensure_ascii=False), flush=True)
        d20 = await pg.evaluate("STORY.dayOfKey('2025-12-20')")
        xc = await pg.evaluate("(GAME.G.msgs||[]).some(m=>m.from==='classmate_xinci'&&m.text==='好。那開學見。')")
        run.check('按「好。」＝排成 12/20 19:00 學期末的飯（心意）；芯慈自動婉拒「好。那開學見。」', bool(q) and q['who'] == 'heroine_01' and q['kind'] == 'heart' and q['day'] == d20 and q['h'] == 19 and xc, json.dumps([q, xc], ensure_ascii=False))
        run.setup('時間撥到 12/20（六）18:57（等出發提示）')
        await pg.evaluate("(d=>{ const G=GAME.G; G.day=d; G.weekday=6; G.hour=18.95; GAME.E.hour=G.hour; })(%d)" % d20)
        got = None
        for _ in range(120):
            opts = await pg.evaluate("[...document.querySelectorAll('#choices button')].map(b=>b.textContent.trim())")
            if any(o.startswith('出發') for o in opts):
                got = await pick(pg, cdp, ['出發']); break
            s = await L.state(pg)
            if s['dlg']: await L.tap(pg, cdp, '#dlg')
            await pg.wait_for_timeout(500)
        run.check('19:00 前後跳出「現在要出發嗎？」、點「出發」', bool(got) and got.startswith('出發'), str(got))
        ok, seen = await drive(pg, cdp, "!!GAME.G.flags.dating_heroine_01&&!document.querySelector('#choices button')&&!(document.getElementById('dlg')&&document.getElementById('dlg').offsetParent)", [], 300)
        said = await pg.evaluate("window.__said||[]")
        run.check('飯：一對一的開場（簡餐，靠窗的兩人座）、收尾', any('靠窗的兩人座' in t for t in said) and any('外面的路燈已經亮了' in t for t in said), json.dumps(said[-12:], ensure_ascii=False))
        last = [o for o in seen if len(o) >= 4]
        run.check('回家的路上：以安的三句＋（先不說）', bool(last) and last[-1][3].startswith('（先不說）'), json.dumps(seen[-3:], ensure_ascii=False))
        run.check('說出來＝交往（dating_heroine_01）', ok and await pg.evaluate("GAME.G.flags.dating_heroine_01===true"), json.dumps(said[-4:], ensure_ascii=False))
        await run.shot(pg, 'after_dinner')
        run.check('黑幕沒有擋住對話', not any(x == ['<黑幕下有對話>'] for x in seen))
        run.check('全程沒有 JS 例外', not errs, json.dumps(errs[:5], ensure_ascii=False))
        await b.close()
    return run.finish()

if __name__ == '__main__':
    sys.exit(asyncio.run(main()))
