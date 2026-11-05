"""CC-C（帳號 C）11-04：AA684_walk 第 4、5 項用瀏覽器照玩家操作走一次（BB-C 19:15；Node 版 cc_aa684_walk.js 已 ALL PASS）。期望值照 AA_684／AA_685（CC_50 第 41 條），判定歸 BB。
  CASES=bgn：大一下第 14 週的桌遊夜（Alison 23:00 從戲院趕到那一晚，BGN.yuLate）。
      【前置／捷徑】讀檔到那個週五 12:00 宿舍；明軒、阿哲、Alison、柏翰、芯慈設成認識（FIRST_MET、FAMILIAR）、玩家在桌遊團群組（PHONE.join noodle_team）。
      玩家：手機 → 群組「桌遊團」→ 明軒 12:00 那一則回「好。」→ 一鍵「到下一個約會地點」→ 確定（照跳過時間的規則等到 20:00 出發）→ 桌遊夜照演（點對話、選項選第一個）。
      要對：結束旁白 →「（十一點多，門口的風鈴響了一聲。Alison 還穿著戲院的外套，手上抱著一袋爆米花。）」→「Alison 每次都坐阿哲旁邊。」（AA_684 第 5 項、AA_675 1-3）。
  CASES=conf：大二下語彤的告白（AA_684 第 6 項、AA_685 B3）。
      【前置／捷徑】讀檔到最後一科考完那天（2027-06-11 五）20:00 宿舍；語彤的關係、她的戀愛（npcRom 40）、4 次正式約會含心願設好；這學期的期末邀約重算（刪 G.termend.Y2S2.plan）。
      玩家：等到 20:30 手機收到「禮拜六我上班到五點。下班以後，我泡茶。只有我們。」→ 私訊 → 回「好。」→ 出遊排 6/12（六）17:30 一盞茶屋；
      【捷徑】同一份存檔跳到 6/12 16:30 宿舍（跳過睡覺）→ 一鍵「到下一個約會地點」→ 確定 → 晚餐照演（點對話；選項記下來，「說出來」那一個先選）。
  台詞讀 GAME.say 的原文（包住 GAME.say 只記錄）。Windows＋GPU／SwiftShader ≠ iPhone。
用法：LW_TESTS=<wt>/tests [CASES=bgn,conf] python3 cc_aa684_play.py <url> <out>"""
import os, sys, json, asyncio, time
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(HERE, '..', '..', '..', '..', 'tests'))
sys.path.insert(0, HERE)
import playlib as L
import cc_det
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
J = lambda o: json.dumps(o, ensure_ascii=False)
CASES = [c.strip() for c in (os.environ.get('CASES') or 'bgn,conf').split(',') if c.strip()]
R = L.Run('aa684_play', OUT)
X = {'yuIn': '（十一點多，門口的風鈴響了一聲。Alison 還穿著戲院的外套，手上抱著一袋爆米花。）', 'yuSeat': 'Alison 每次都坐阿哲旁邊。',
     'invite': '禮拜六我上班到五點。下班以後，我泡茶。只有我們。'}   # AA_684 第 5 項、AA_675 1-3、AA_685 B3
SAYHOOK = r"""(()=>{ if(window.__ccSayOn) return true; window.__ccSay=[]; const s0=GAME.say; GAME.say=function(who,t){ try{ window.__ccSay.push({who:who&&(who.name||who.charId)||(typeof who==='string'?who:null), t:String(t), h:+(+GAME.G.hour).toFixed(3), zone:GAME.G.zone}); }catch(e){} return s0.apply(this,arguments); }; window.__ccSayOn=true; return true; })()"""
UI = r"""(()=>{ const t=(document.getElementById('dlgText')||{}).textContent||'', ch=document.getElementById('choices'); const open=!!ch&&!ch.classList.contains('hide');
  const opts=open?[...ch.querySelectorAll('button,.choice,[data-k]')].map(b=>(b.innerText||b.textContent||'').trim().split('\n')[0].trim()).filter(Boolean):[];
  const D=GAME.D||{}; return {dlg:!!D.active, text:t, opts, hour:+(+GAME.G.hour).toFixed(3), day:GAME.G.day, zone:GAME.G.zone, busy:!!GAME.E.player.busy||!!(GAME.D&&GAME.D.busyDepth>0), fade:!!(document.getElementById('fade')||{classList:{contains:()=>false}}).classList.contains('on'), ev:(typeof EVENTS!=='undefined'&&EVENTS.running)?String(EVENTS.running.id||EVENTS.running):null}; })()"""
SETUP = r"""(c=>{ const G=GAME.G, F=G.flags||(G.flags={}); G.contacts=G.contacts||{}; const out={};
  for(const id of c.ids){ SOCIAL.meet&&SOCIAL.meet(id,G.zone); if(!SOCIAL.has(id,'FIRST_MET')) SOCIAL.remember(id,'FIRST_MET',''); F['met_'+id]=true; const r=SOCIAL.rel(id); for(const k in c.rel) r[k]=Math.max(r[k]||0,c.rel[k]); G.contacts[id]=G.day-30; out[id]=SOCIAL.stage?SOCIAL.stage(id):null; }
  return out; })"""


async def pick(pg, cdp, text):
    ok = await pg.evaluate("(t=>{ const ch=document.getElementById('choices'); if(!ch) return false; const b=[...ch.querySelectorAll('button,.choice,[data-k]')].find(x=>(x.innerText||x.textContent||'').trim().split('\\n')[0].trim()===t); if(!b) return false; b.setAttribute('data-ccpick','1'); return true; })", text)
    if not ok: return False
    await L.tap(pg, cdp, '[data-ccpick="1"]'); await pg.wait_for_timeout(900)
    await pg.evaluate("(()=>{ const b=document.querySelector('[data-ccpick]'); if(b) b.removeAttribute('data-ccpick'); })()")
    return True


async def drive(pg, cdp, tag, done, max_s=300, prefer=()):
    """點對話、選項（prefer 裡的先選，沒有就第一個），直到 done(UI) 成立或時間到；回傳選過的選單"""
    t0 = time.time(); menus = []; act = time.time(); seen = False
    while time.time() - t0 < max_s:
        u = await pg.evaluate(UI)
        if done(u): return menus, u, True
        if u['dlg'] or u['opts'] or u['busy'] or u['fade']: act = time.time(); seen = seen or u['dlg']
        elif seen and time.time() - act > 12: return menus, u, True   # 演完了：12 秒沒有對話、選項、劇情鎖、黑幕
        if u['opts']:
            op = next((o for o in u['opts'] if any(o.startswith(p) for p in prefer)), u['opts'][0]); menus.append({'opts': u['opts'], 'pick': op, 'h': u['hour']})
            await pick(pg, cdp, op); continue
        if u['dlg'] and u['text']:
            t1 = time.time()
            while time.time() - t1 < 8:
                await pg.wait_for_timeout(350); u2 = await pg.evaluate(UI)
                if not u2['dlg'] or u2['text'] == u['text']: break
                u = u2
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(500); continue
        await pg.wait_for_timeout(400)
    return menus, await pg.evaluate(UI), False


async def says(pg, n=0):
    return [x['t'] for x in await pg.evaluate("(n=>(window.__ccSay||[]).slice(n))", n)]


async def answer(pg, cdp, th, ask_id, k=0):
    await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(1200)
    await L.tap(pg, cdp, '#phoneTabs [data-ptab="msg"]'); await pg.wait_for_timeout(1200)
    ok1 = await L.tap(pg, cdp, '#phoneBody [data-th="%s"]' % th); await pg.wait_for_timeout(1200)
    ok2 = await L.tap(pg, cdp, '#phoneBody [data-ask="%s|%d"]' % (ask_id, k)); await pg.wait_for_timeout(1500)
    body = (await pg.evaluate("(document.getElementById('phoneBody')||{}).innerText||''"))[-240:]
    await L.tap(pg, cdp, '#btnPhoneClose'); await pg.wait_for_timeout(800); await L.close_panels(pg, cdp)
    return ok1, ok2, body


async def onetap_date(pg, cdp, tag):
    """一鍵 →「到下一個約會地點」→ 確認框「確定」"""
    await L.close_panels(pg, cdp)
    if not await L.tap(pg, cdp, '#btnGo'): return False, '沒有 #btnGo'
    await pg.wait_for_timeout(1000)
    sub = await pg.evaluate("(()=>{ const b=document.querySelector('#goPop [data-gok=\"date\"]'); return b?{t:(b.innerText||'').trim(), dim:b.classList.contains('dim')}:null; })()")
    R.note('%s 一鍵「到下一個約會地點」：%s' % (tag, J(sub)))
    if not sub or sub['dim']: return False, J(sub)
    await L.tap(pg, cdp, '#goPop [data-gok="date"]'); await pg.wait_for_timeout(1500)
    cf = await pg.evaluate("(()=>{ const b=document.getElementById('goConfirm'); return b&&!b.classList.contains('hide')?{title:(document.getElementById('goCfTitle')||{}).textContent, body:(document.getElementById('goCfBody')||{}).innerText}:null; })()")
    R.note('%s 確認框：%s' % (tag, J(cf)))
    if not cf: return False, '沒有確認框'
    await pg.wait_for_timeout(700); await L.tap(pg, cdp, '#goCfYes'); await pg.wait_for_timeout(1500)
    return True, cf


async def case_bgn(pg, cdp):
    d = await pg.evaluate("(()=>{ for(const w of [14,13,15]){ const d=STORY.termDayIn('Y1S2',w,5); if(d!=null&&BGN.isNight(d)&&BGN.yuLate(d)) return {d, key:CALENDAR.dateOf(d).key, w}; } return null; })()")
    if not R.check('[bgn] 大一下第 14 週有桌遊夜、是 Alison 趕到那一晚（BGN.yuLate）', bool(d) and d['w'] == 14, J(d)): return
    R.setup('[bgn] 讀檔：宿舍、%s（五）11:58；明軒、阿哲、Alison、柏翰、芯慈認識（FAMILIAR）、在桌遊團群組' % d['key'])
    await L.load_state(pg, {'zone': 'dorm', 'hour': 11.97, 'day': d['d'], 'weather': 'clear'}, quiet_phone=True)
    await pg.wait_for_timeout(2500); await L.close_panels(pg, cdp)
    st = await pg.evaluate(SETUP, {'ids': ['classmate_mingxuan', 'zhe', 'yu', 'classmate_bohan', 'classmate_xinci'], 'rel': {'fam': 25}})
    await pg.evaluate("(()=>{ const G=GAME.G; PHONE.join(G,'noodle_team','桌遊團'); G.flags.met_yu=true; if(G.flags.noodleTableDay==null) G.flags.noodleTableDay=G.day-70; G.flags.BGN_N=G.flags.BGN_N||2; G.flags.BGN_INV_N=G.flags.BGN_INV_N||2; })()")
    R.note('[bgn] 設定：%s' % J(st))
    m = None
    for i in range(40):
        m = await pg.evaluate("(d=>{ const L=(GAME.G.msgs||[]).filter(m=>m.tag==='bgn_inv_'+d); const a=L.find(m=>m.ask); return L.length?{n:L.length, from:L.map(m=>m.from), texts:L.map(m=>m.text), ask:a?{id:a.ask.id, opts:a.ask.opts.map(o=>o.t)}:null, th:L[0].th}:null; })", d['d'])
        if m and m['ask']: break
        if i == 15: await pg.evaluate("(async()=>{ await GAME.advance(0.1); })()")
        await pg.wait_for_timeout(1000)
    R.note('[bgn] 12:00 群組：%s' % J(m))
    if not R.check('[bgn] 12:00 明軒在群組約、可以回「好。」', bool(m and m['ask']) and '好。' in m['ask']['opts'], J(m)): return
    ok1, ok2, body = await answer(pg, cdp, m['th'], m['ask']['id'], 0)
    if not ok2:
        R.note('[bgn] 手機點不到「好。」（%s %s；%s）→【捷徑】PHONE.answer' % (ok1, ok2, body)); await pg.evaluate("(t=>PHONE.answer(GAME.G,t,0))", m['ask']['id'])
    q = await pg.evaluate("(d=>{ for(let i=0;i<3;i++) STORY.phoneRules(GAME); const q=OUT.get(GAME.G,'bgn_'+d); return q?{day:q.day,h:q.h,place:q.place,state:q.state}:null; })", d['d'])
    R.check('[bgn] 回「好。」以後排了桌遊夜（20:00，日常失速）', bool(q) and q['h'] == 20, J(q))
    if not q: return
    await pg.evaluate(SAYHOOK); n0 = len(await says(pg))
    ok, cf = await onetap_date(pg, cdp, '[bgn]')
    if not R.check('[bgn] 一鍵「到下一個約會地點」→ 確定（出發去桌遊夜）', ok, J(cf)): return
    menus, u, fin = await drive(pg, cdp, '[bgn]', lambda u: False, max_s=480)
    L1 = await says(pg, n0)
    R.note('[bgn] 桌遊夜的台詞（%d 句）：%s' % (len(L1), J(L1)))
    R.note('[bgn] 選單：%s' % J(menus))
    iy, iseat = (L1.index(X['yuIn']) if X['yuIn'] in L1 else -1), (L1.index(X['yuSeat']) if X['yuSeat'] in L1 else -1)
    R.check('[bgn] Alison 趕到的旁白逐字 AA_684 第 5 項', iy >= 0, J(L1[-8:]))
    R.check('[bgn] 接著「%s」' % X['yuSeat'], iseat > iy >= 0, J({'yuIn': iy, 'yuSeat': iseat}))
    q2 = await pg.evaluate("(d=>{ const q=OUT.get(GAME.G,'bgn_'+d); return q?{state:q.state}:null; })", d['d'])
    R.note('[bgn] 演完以後：%s；出遊 %s' % (J(u), J(q2)))
    await R.shot(pg, 'bgn_after')


async def case_conf(pg, cdp):
    d = await pg.evaluate("(()=>({d:STORY.dayOfKey('2027-06-11'), d2:STORY.dayOfKey('2027-06-12'), w:TERMEND.windowOf('Y2S2')}))()")
    R.setup('[conf] 讀檔：宿舍、2027-06-11（五，大二下最後一科考完那天）20:00；語彤的關係 70／50／45、npcRom 40、4 次正式約會含心願；刪 G.termend.Y2S2.plan 讓這學期的邀約重算')
    await L.load_state(pg, {'zone': 'dorm', 'hour': 20.0, 'day': d['d'], 'weather': 'clear'}, quiet_phone=True)
    await pg.wait_for_timeout(2500); await L.close_panels(pg, cdp)
    st = await pg.evaluate(SETUP, {'ids': ['heroine_03'], 'rel': {'fam': 70, 'trust': 50, 'comf': 45}})
    pl = await pg.evaluate("""(()=>{ const G=GAME.G; SOCIAL.rel('heroine_03').npcRom=40; const lg=DATE.log(G,'heroine_03'); lg.count=Math.max(lg.count|0,4); lg.wish=true; G.flags.YT_MET_JOB=true;
      if(G.termend&&G.termend.Y2S2) delete G.termend.Y2S2.plan; const w=TERMEND.windowOf('Y2S2'); const P=TERMEND.plan(G,w); return {heart:P.heart, friend:P.friend, nope:P.nope}; })()""")
    R.note('[conf] 設定 %s；這學期的邀約 %s' % (J(st), J(pl)))
    if not R.check('[conf] 這學期語彤有心意的邀約（TERMEND.plan heart）', 'heroine_03' in (pl.get('heart') or []), J(pl)): return
    m = None
    for i in range(60):
        m = await pg.evaluate("(()=>{ const L=(GAME.G.msgs||[]).filter(m=>m.tag==='te_Y2S2_heroine_03'); const a=L.find(m=>m.ask); return L.length?{day:L[0].day, h:L[0].h, texts:L.map(m=>m.text), ask:a?{id:a.ask.id, opts:a.ask.opts.map(o=>o.t)}:null}:null; })()")
        if m and m['ask']: break
        h = (await pg.evaluate(UI))['hour']
        if h < 20.5: await pg.evaluate("(async()=>{ await GAME.advance(0.25); })()")
        await pg.wait_for_timeout(1000)
    R.note('[conf] 收到的邀約：%s' % J(m))
    R.check('[conf] 6/11（考完那天）20:30 語彤「%s」（AA_685 B3）' % X['invite'], bool(m) and m['day'] == d['d'] and abs(m['h'] - 20.5) < 0.01 and m['texts'][-1] == X['invite'], J(m))
    if not (m and m['ask']): return
    ok1, ok2, body = await answer(pg, cdp, 'p:heroine_03', m['ask']['id'], 0)
    if not ok2:
        R.note('[conf] 手機點不到「好。」（%s %s；%s）→【捷徑】PHONE.answer' % (ok1, ok2, body)); await pg.evaluate("(t=>PHONE.answer(GAME.G,t,0))", m['ask']['id'])
    q = await pg.evaluate("(()=>{ for(let i=0;i<3;i++) STORY.phoneRules(GAME); const q=OUT.rec(GAME.G).find(q=>q&&q.te&&q.te.who==='heroine_03'&&q.te.term==='Y2S2'); return q?{id:q.id, day:q.day, key:CALENDAR.dateOf(q.day).key, h:q.h, place:q.place, state:q.state}:null; })()")
    R.check('[conf] 回「好。」以後晚餐排 2027-06-12（六）17:30 一盞茶屋', bool(q) and q['key'] == '2027-06-12' and q['h'] == 17.5 and q['place'] == '一盞茶屋', J(q))
    if not q: return
    snap = await pg.evaluate("JSON.stringify(GAME.snapshot())")
    R.setup('[conf] 讀檔（同一份存檔）跳到 6/12 16:30 宿舍——跳過睡覺')
    await pg.evaluate("(s=>{ const G=JSON.parse(s); G.day=G.day+1; G.hour=16.5; G.zone='dorm'; delete G.pos; window.__ccSnap=G; })", snap)
    await pg.evaluate("(async()=>{ await GAME.applySave(window.__ccSnap); })()"); await pg.wait_for_timeout(6000); await L.close_panels(pg, cdp)
    await pg.evaluate(SAYHOOK); n0 = len(await says(pg))
    ok, cf = await onetap_date(pg, cdp, '[conf]')
    if not R.check('[conf] 一鍵「到下一個約會地點」→ 確定（出發去一盞茶屋）', ok, J(cf)): return
    menus, u, fin = await drive(pg, cdp, '[conf]', lambda u: False, max_s=480, prefer=('說出來', '「說', '說'))
    L1 = await says(pg, n0)
    q2 = await pg.evaluate("(()=>{ const q=OUT.rec(GAME.G).find(q=>q&&q.te&&q.te.who==='heroine_03'&&q.te.term==='Y2S2'); const F=GAME.G.flags||{}; return {out:q?{state:q.state}:null, dating:!!F.dating_heroine_03, hour:+(+GAME.G.hour).toFixed(2), zone:GAME.G.zone}; })()")
    R.note('[conf] 晚餐的台詞（%d 句）：%s' % (len(L1), J(L1)))
    R.note('[conf] 選單：%s' % J(menus))
    R.note('[conf] 演完以後：%s' % J(q2))
    R.check('[conf] 晚餐演了（出遊 done、有台詞）', bool(q2['out']) and q2['out']['state'] == 'done' and len(L1) > 3, J(q2))
    await R.shot(pg, 'conf_after')


async def main():
    print('CC AA684_play（瀏覽器、玩家操作）：CASES=%s；SHA=%s；Windows＋GPU／SwiftShader ≠ iPhone' % (CASES, os.environ.get('SHA', '?')), flush=True)
    for c in CASES:
        async with async_playwright() as p:
            b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
            await cc_det.install(pg, int(os.environ.get('CC_SEED') or 20261104))
            t0 = time.time(); await pg.goto(URL); ok = await L.wait_loaded(pg); R.check('[%s] 遊戲載入' % c, ok, '%.1f 秒' % (time.time() - t0))
            if ok:
                await pg.evaluate("localStorage.clear(); if(typeof STORY!=='undefined') STORY.phoneAuto=()=>{}")
                try:
                    if c == 'bgn': await case_bgn(pg, cdp)
                    elif c == 'conf': await case_conf(pg, cdp)
                except Exception as e:
                    R.check('[%s] 探針沒有例外' % c, False, repr(e)[:300])
                R.check('[%s] 沒有 JS 例外' % c, not errs, J(errs[:3]))
            await b.close()
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
    sys.exit(1 if R.fails else 0)

asyncio.run(main())
