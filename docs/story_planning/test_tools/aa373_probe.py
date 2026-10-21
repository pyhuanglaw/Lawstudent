"""BB（帳號 A）2026-10-21：AA373-Y1S2-FIX-1021（LAWWW 21:45 派；開發分支 172696ca 起）瀏覽器驗收，照 AA_373 第 5 節＋LAWWW 的「順便看」。條件、日期、字照子代理對過的程式（825e8a2b）。
  S1  可昕交往（約在中間）：6/13（六）的「我們的日子」演完，6/15 以後沒有再排（OUT 沒有 day≥6/15 的 kx_od_、沒有「排進行程：6/20…」）；家教（週二）6/9 那堂演完，6/16 沒有排。
  S2  沛珊第 3 週（3/11）約她：選單沒有「兩個人單獨去…不太好」、「去校外…」不是「她現在有交往的對象」；4/6 對照（應該有）。
  S3  小語：4/4 12:00、17:30 手機朋友頁不寫烏來；4/18 12:00 寫「和社團在烏來」。
  S4  可昕 4/8 21:00 三則（「考完去吃山下那攤，我請。下週六下午可以嗎？」、沒有「輸的請」）→ 回「好。」→ 4/16 改期 → 4/19 14:00 互考：選「中等的」＝「……一半。回去我再讀一次。」「走，山下那攤。」；
      S4c 選「冷門的」＝「犯規。冷門學說是犯規。」「（她把那一題劃掉。）」「……下一題。」；兩條都沒有「你贏」「你請」「她判你輸」「我會比」。
  S5  語彤、芷若大一下期末邀約：語彤「考完了。禮拜五，要吃飯嗎。」→ 6/19（五）19:00；芷若「我下班以後，吃個東西？」→ 飯 6/12 22:00；沒有「禮拜四」。
  S6  沛珊第 5～15 週週二、四 16:30 從公館走進溫州街：「她帶著一群國小生從課輔班走出來…」「喔，是你。我在這裡當志工。一週兩天。」；朋友頁「溫州街（走走，到 18:00）」；沒有「一週三天」。
  S7  通識第 6 週（3/30 13:20 普通教學館 101）：「（天文館的圓頂關了燈。）」「圓頂裡很暗」；沒有「晚上的課，我最清醒。」「操場很暗」（宥辰那一句瀏覽器看不到：一堂只播一句同學反應，見子代理報告）。
【前置】使用者 9/25 存檔改日期、旗標、關係、聯絡人、outings／termend（標示在每個情境）；[捷徑] S4 同一個頁面跳 4/16、4/19。之後照玩家（手機介面、出發、選項）。
Playwright 手機橫向模擬、?turbo，不是 iPhone。
用法：LW_TESTS=<開發分支>/tests python3 aa373_probe.py '<URL>/index.html?turbo' <輸出資料夾> <存檔.json>（SCEN=S1,S2,...）"""
import os, sys, json, asyncio, time
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
from playwright.async_api import async_playwright
URL, OUT, SAVE = sys.argv[1], sys.argv[2], sys.argv[3]
SCEN = os.environ.get('SCEN', 'S1,S2,S3,S4,S4c,S5,S6,S7').split(',')
bad = []; out = {}
def say(*a): print(' '.join(str(x) for x in a), flush=True)
SNAP = """(()=>{ const G=GAME.G, d=CALENDAR.dateOf(G.day); return {key:d.key, h:+G.hour.toFixed(2), zone:G.zone}; })()"""
HOOK = """(()=>{ if(window.__LOGH) return; window.__LOGH=1; window.__LOG=[]; window.__TOASTS=[]; const at=()=>{ try{ return CALENDAR.dateOf(GAME.G.day).key+' '+GAME.G.hour.toFixed(2); }catch(e){ return ''; } };
  const o=ADV.log; ADV.log=function(n,t){ try{ window.__LOG.push({n:n||'', t:String(t||''), at:at()}); }catch(e){} return o.apply(this,arguments); };
  const s0=GAME.say; GAME.say=function(w,t){ try{ window.__LOG.push({n:(w&&w.name)||'', t:String(t||''), at:at()}); }catch(e){} return s0.apply(this,arguments); };
  const ot=GAME.toast; GAME.toast=function(t){ try{ window.__TOASTS.push({t:String(t), at:at()}); }catch(e){} return ot.apply(this,arguments); }; })()"""
LV = "const LV=(id,f,t,c,r,nr)=>{ const R=SOCIAL.rel(id); R.fam=f; R.trust=t; R.comf=c; if(r!=null) R.rom=r; if(nr!=null) R.npcRom=nr; SOCIAL.remember(id,'FIRST_MET',''); };"


async def drain(pg, cdp, pref, secs=240):
    t0 = time.time()
    while time.time() - t0 < secs:
        s = await L.state(pg)
        if s['choices']:
            c = await pg.evaluate("(w=>{ const bs=[...document.querySelectorAll('#choices button')]; let e=null; for(const t of w){ e=bs.find(x=>!x.disabled&&x.textContent.trim().includes(t)); if(e) break; } e=e||bs.find(x=>/晚一點|不去|算了|之後/.test(x.textContent))||bs[bs.length-1]; const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2,e.textContent.trim().slice(0,40),bs.map(b=>b.textContent.trim().slice(0,30))]; })(%s)" % json.dumps(pref))
            await L.touch_tap(cdp, c[0], c[1]); say('   ▶ %s （%s）' % (c[2], ' / '.join(c[3]))); await pg.wait_for_timeout(900); continue
        if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(450); continue
        if s['busy']: await pg.wait_for_timeout(600); continue
        if await pg.evaluate("!!(GAME.phoneIsOpen&&GAME.phoneIsOpen())"): await L.phone_away(pg, cdp); continue
        await pg.wait_for_timeout(900); s = await L.state(pg)
        if not (s['dlg'] or s['choices'] or s['busy']): return True
    return False


async def load(p, base, key, h, zone, flags=None, gset=None, js=''):
    b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
    await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
    st = json.loads(json.dumps(base)); G = st.get('G', st)
    d = await pg.evaluate("STORY.dayOfKey(%s)" % json.dumps(key)); D = lambda k: d if k == '$DAY' else k
    G['flags'].update(flags or {})
    for k, v in (gset or {}).items(): G[k] = v
    G.update({'day': d, 'hour': h, 'zone': zone, 'pos': None, 'weekday': await pg.evaluate("CALENDAR.dateOf(%d).wd%%7" % d)})
    await L.load_state(pg, G); await pg.wait_for_timeout(5000); await pg.evaluate(HOOK)
    if js: await pg.evaluate("(()=>{ const G=GAME.G, D=k=>STORY.dayOfKey(k); %s %s })()" % (LV, js))
    await L.phone_away(pg, cdp)
    return b, pg, cdp, errs


async def until(pg, cdp, h, pref, secs=900, key=None):
    """遊戲時間照走到 h（或 key 那一天的 h）；中間的對話、選項照 pref（出發）"""
    t0 = time.time()
    while time.time() - t0 < secs:
        sn = await pg.evaluate(SNAP)
        if (key is None and sn['h'] >= h) or (key is not None and (sn['key'], sn['h']) >= (key, h)): return True
        s = await L.state(pg)
        if s['dlg'] or s['choices'] or s['busy']: await drain(pg, cdp, pref, secs=300); continue
        if await pg.evaluate("!!(GAME.phoneIsOpen&&GAME.phoneIsOpen())"): await L.phone_away(pg, cdp); continue
        await pg.wait_for_timeout(2000)
    say('   ⚠ 等不到 %s %.2f（%s）' % (key or '', h, json.dumps(await pg.evaluate(SNAP), ensure_ascii=False))); return False


async def jump(pg, key, h):
    await pg.evaluate("(([k,h])=>{ const G=GAME.G; G.day=STORY.dayOfKey(k); G.hour=h; G.weekday=CALENDAR.dateOf(G.day).wd%%7; GAME.E.hour=h; if(GAME.updateHUD) GAME.updateHUD(); })(%s)" % json.dumps([key, h]))
    say('   [捷徑] 跳到 %s %.2f（同一個頁面）' % (key, h)); await pg.wait_for_timeout(2500)


async def tap_js(pg, cdp, js):
    c = await pg.evaluate("(()=>{ const e=(%s); if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2,(e.textContent||'').trim()]; })()" % js)
    if not c: return None
    await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(1000); return c[2]


async def answer(pg, cdp, th, want):
    """手機 → 訊息 → 那個對話串 → 按開頭是 want 的選項（照玩家）"""
    pend = await pg.evaluate("(()=>PHONE.pending(GAME.G).map(m=>({id:m.ask.id, th:PHONE.th(m), text:m.text, opts:m.ask.opts.map(o=>o.t)})))()")
    m = next((x for x in pend if x['th'] == th), None)
    if not m: return 'no pending on %s（%s）' % (th, json.dumps([x['th'] for x in pend], ensure_ascii=False))
    k = next((i for i, t in enumerate(m['opts']) if t.startswith(want)), None)
    if k is None: return 'no option %s（%s）' % (want, m['opts'])
    if not await pg.evaluate("!!(GAME.phoneIsOpen&&GAME.phoneIsOpen())"): await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(1000)
    await tap_js(pg, cdp, "document.querySelector('#phoneTabs button[data-ptab=\"msg\"]')")
    await tap_js(pg, cdp, "[...document.querySelectorAll('#phoneBody [data-th]')].find(b=>b.dataset.th===%s)" % json.dumps(th))
    t = await tap_js(pg, cdp, "[...document.querySelectorAll('#phoneBody [data-ask]')].find(b=>b.dataset.ask===%s)" % json.dumps('%s|%d' % (m['id'], k)))
    await pg.wait_for_timeout(800); await L.close_panels(pg, cdp); return t


async def friends_row(pg, cdp, pid):
    await L.phone_away(pg, cdp)
    if not await pg.evaluate("!!(GAME.phoneIsOpen&&GAME.phoneIsOpen())"): await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(1000)
    await tap_js(pg, cdp, "document.querySelector('#phoneTabs button[data-ptab=\"friends\"]')")
    row = await pg.evaluate("(pid=>{ const b=document.querySelector('#phoneBody [data-person=\"'+pid+'\"]')||document.querySelector('#phoneBody [data-msg=\"'+pid+'\"]')||document.querySelector('#phoneBody [data-inv=\"'+pid+'\"]'); if(!b) return null; const it=b.closest('.item')||b.parentElement; return (it.innerText||'').replace(/\\n/g,'｜'); })(%s)" % json.dumps(pid))
    return row


def logs(lines): return [x['t'] for x in lines]


async def finish(pg, run, sid, b, errs, extra=None):
    await run.shot(pg, sid + '_end')
    T = await pg.evaluate("window.__TOASTS||[]"); Lg = await pg.evaluate("window.__LOG||[]")
    out[sid] = {'toasts': T[-30:], 'lines': Lg[-80:], 'errs': errs[:3], **(extra or {})}
    if errs: bad.append('%s：JS 例外 %s' % (sid, json.dumps(errs[:2], ensure_ascii=False)[:160]))
    json.dump({'out': out, 'bad': bad}, open(os.path.join(OUT, 'aa373.json'), 'w'), ensure_ascii=False, indent=1)
    try: await asyncio.wait_for(b.close(), 30)
    except Exception: pass
    return T, Lg


def chk(run, sid, name, ok, info=''):
    run.check('%s：%s' % (sid, name), ok, info)
    if not ok: bad.append('%s：%s（%s）' % (sid, name, info[:200]))


# ---------------- S1 可昕「我們的日子」＋家教 ----------------
async def s1(p, base, run):
    od1 = {'id': 'kx_our_day1', 'ev': 'ev_kexin_our_day', 'day': None, 'h': 14, 'place': '公館', 'title': '我們的日子', 'state': 'done'}
    b, pg, cdp, errs = await load(p, base, '2026-06-13', 12.5, 'dorm',
        flags={'dating_kexin': True, 'KX_OUR_DAY': {'day': 'sat', 'mode': 'mid'}, 'JOB_TUTOR': True, 'TUTOR_WD': 2},
        js="LV('kexin',70,60,60,60,60); G.flags.tutorFromDay=D('2026-03-02'); const o=OUT.rec(G); if(!o.some(q=>q.id==='kx_our_day1')) o.push(%s);" % json.dumps(dict(od1, day=0)).replace('"day": 0', '"day": D("2026-03-07")'))
    run.setup('[前置] S1：2026-06-13（六）12:30；dating_kexin、KX_OUR_DAY 週六／約在中間、第一次我們的日子 3/7 演過；家教 週二、從 3/2')
    plan = await pg.evaluate("(()=>OUT.rec(GAME.G).filter(q=>/^(kx_od_|tutor_)/.test(q.id)).map(q=>({id:q.id,d:CALENDAR.dateOf(q.day).key,h:q.h,st:q.state,t:q.title})))()")
    say('   S1 讀檔時排好的（kx_od_、tutor_）：%s' % json.dumps([x for x in plan if x['st'] == 'planned'], ensure_ascii=False))
    await until(pg, cdp, 16.0, ['出發：我們的日子', '出發', '接起來'], secs=1200)
    plan2 = await pg.evaluate("(()=>OUT.rec(GAME.G).filter(q=>/^(kx_od_|tutor_)/.test(q.id)).map(q=>({id:q.id,d:CALENDAR.dateOf(q.day).key,h:q.h,st:q.state,t:q.title})))()")
    after = [x for x in plan2 if x['st'] == 'planned' and x['d'] >= '2026-06-15']
    od_done = [x for x in plan2 if x['id'].startswith('kx_od_') and x['d'] == '2026-06-13']
    say('   6/13 16:00 以後：6/13 那一格 %s；6/15 以後還排著的 %s' % (json.dumps(od_done, ensure_ascii=False), json.dumps(after, ensure_ascii=False)))
    T, Lg = await finish(pg, run, 'S1', b, errs, {'plan': plan2})
    late = [x['t'] for x in T if '排進行程' in x['t'] and any(('6/%d' % d) in x['t'] for d in range(15, 30))]
    chk(run, 'S1', '6/13 我們的日子演了（出發）', bool(od_done) and od_done[0]['st'] == 'done', json.dumps(od_done, ensure_ascii=False))
    chk(run, 'S1', '6/15 以後沒有「我們的日子」、家教（OUT 沒有 day≥6/15 的 planned；沒有「排進行程：6/15～6/29」）', not after and not late, json.dumps({'after': after, 'toast': late}, ensure_ascii=False))


# ---------------- S2 沛珊約吃飯 ----------------
async def s2(p, base, run):
    res = {}
    for key in ('2026-03-11', '2026-04-06'):
        b, pg, cdp, errs = await load(p, base, key, 15.0, 'campus', js="for(const k in G.flags) if(k.indexOf('dating_')===0) G.flags[k]=false; LV('classmate_peishan',45,30,30,0,35); INV.addContact(G,'classmate_peishan');")
        run.setup('[前置] S2 %s 15:00：沒有交往、沛珊 fam45/trust30/comf30/npcRom35、通訊錄' % key)
        await L.phone_away(pg, cdp); await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(1000)
        await tap_js(pg, cdp, "document.querySelector('#phoneTabs button[data-ptab=\"friends\"]')")
        ok = await tap_js(pg, cdp, "document.querySelector('#phoneBody [data-inv=\"classmate_peishan\"]')")
        await pg.wait_for_timeout(1200)
        opts = await pg.evaluate("[...document.querySelectorAll('#choices button')].map(b=>({t:(b.childNodes[0]&&b.childNodes[0].textContent||b.textContent).trim(), hint:((b.querySelector('.hint')||{}).textContent||'').trim(), dis:!!b.disabled}))")
        say('   S2 %s 約她（%s）：%s' % (key, ok, json.dumps(opts, ensure_ascii=False)))
        await run.shot(pg, 'S2_%s' % key); res[key] = opts
        txt = json.dumps(opts, ensure_ascii=False)
        if key == '2026-03-11':
            chk(run, 'S2', '3/11（第 3 週）約沛珊：沒有「兩個人單獨去…不太好」、「去校外…」不是「她現在有交往的對象」', bool(opts) and '不太好' not in txt and '有交往的對象' not in txt, txt[:300])
        else:
            chk(run, 'S2', '4/6（第 7 週，對照）約沛珊：有「不太好」或「她現在有交往的對象」', '不太好' in txt or '有交往的對象' in txt, txt[:300])
        await finish(pg, run, 'S2_' + key, b, errs, {'opts': opts})


# ---------------- S3 小語 ----------------
async def s3(p, base, run):
    for key, h, want, nope in (('2026-04-04', 12.0, None, '烏來'), ('2026-04-04', 17.5, None, '烏來'), ('2026-04-18', 12.0, '烏來', None)):
        b, pg, cdp, errs = await load(p, base, key, h, 'campus', js="LV('yu',45,30,30); INV.addContact(G,'yu');")
        run.setup('[前置] S3 %s %.2f：認識小語、通訊錄' % (key, h))
        row = await friends_row(pg, cdp, 'yu'); wt = await pg.evaluate("(()=>{ try{ return GAME.whereText('yu'); }catch(e){ return 'ERR '+e; } })()")
        say('   S3 %s %.2f 朋友頁小語：%s｜whereText：%s' % (key, h, row, wt)); await run.shot(pg, 'S3_%s_%02d' % (key, int(h)))
        txt = (row or '') + '｜' + str(wt)
        if nope: chk(run, 'S3', '%s %.2f 朋友頁不寫「%s」' % (key, h, nope), bool(row) and nope not in txt, txt[:200])
        if want: chk(run, 'S3', '%s %.2f 朋友頁寫「%s」' % (key, h, want), want in txt, txt[:200])
        await finish(pg, run, 'S3_%s_%02d' % (key, int(h)), b, errs, {'row': row, 'where': wt})


# ---------------- S4 可昕 4/8、4/16、4/19 ----------------
NOPE4 = ['輸的請', '你贏', '你請', '她判你輸', '我會比']
async def s4(p, base, run, pick):
    sid = 'S4' if pick == '中等' else 'S4c'
    start = '2026-04-08' if sid == 'S4' else '2026-04-16'
    b, pg, cdp, errs = await load(p, base, start, 20.5, 'dorm', flags={'dating_kexin': True}, js="LV('kexin',70,60,60,60,60);")
    run.setup('[前置] %s：%s 20:30 dating_kexin' % (sid, start))
    if sid == 'S4':
        await until(pg, cdp, 21.1, ['不', '晚一點'], secs=300)
        m48 = await pg.evaluate("(()=>(GAME.G.msgs||[]).filter(m=>PHONE.th(m)==='p:kexin'&&CALENDAR.dateOf(m.day).key==='2026-04-08').map(m=>m.h+' '+m.text))()")
        say('   4/8 可昕：%s' % json.dumps(m48, ensure_ascii=False))
        chk(run, sid, '4/8 21:00「考完去吃山下那攤，我請。下週六下午可以嗎？」、沒有「輸的請」', any('下週六下午可以嗎' in m for m in m48) and not any('輸的請' in m for m in m48), json.dumps(m48, ensure_ascii=False))
        say('   回：%s' % await answer(pg, cdp, 'p:kexin', '好'))
        await jump(pg, '2026-04-16', 20.5)
    await until(pg, cdp, 21.1, ['不', '晚一點'], secs=300)
    m416 = await pg.evaluate("(()=>(GAME.G.msgs||[]).filter(m=>PHONE.th(m)==='p:kexin'&&CALENDAR.dateOf(m.day).key==='2026-04-16').map(m=>m.h+' '+m.text+(m.ask?'［'+m.ask.opts.map(o=>o.t).join('／')+'］':'')))()")
    say('   4/16 可昕：%s' % json.dumps(m416, ensure_ascii=False))
    pend = await pg.evaluate("(()=>PHONE.pending(GAME.G).filter(m=>PHONE.th(m)==='p:kexin').map(m=>m.ask.opts.map(o=>o.t)))()")
    if pend and pend[0]: say('   回：%s' % await answer(pg, cdp, 'p:kexin', pend[0][0][:2]))
    await pg.wait_for_timeout(3000)
    q = await pg.evaluate("(()=>{ const q=OUT.get(GAME.G,'kx_quiz1'); return q?{d:CALENDAR.dateOf(q.day).key,h:q.h,t:q.title,p:q.place,st:q.state}:null; })()")
    say('   互考的行程：%s' % json.dumps(q, ensure_ascii=False))
    await jump(pg, '2026-04-19', 13.0)
    await until(pg, cdp, 16.0, ['出發：兩校互考', '出發', '接起來', pick], secs=900)
    T, Lg = await finish(pg, run, sid, b, errs, {'quiz': q})
    lines = logs(Lg); toasts = [x['t'] for x in T]
    ev = [l for l in lines if any(k in l for k in ('三題對三題', '一半', '山下那攤', '犯規', '劃掉', '下一題', '平手'))]
    say('   4/19 互考的句子：%s' % json.dumps(ev, ensure_ascii=False))
    chk(run, sid, '排進行程「4/19（日） 14:00　兩校互考」', any('4/19' in t and '兩校互考' in t for t in toasts) or (q and q['d'] == '2026-04-19'), json.dumps([t for t in toasts if '排進行程' in t], ensure_ascii=False))
    if pick == '中等':
        chk(run, sid, '選中等：「……一半。回去我再讀一次。」「走，山下那攤。」', any('……一半。回去我再讀一次。' in l for l in lines) and any('走，山下那攤。' in l for l in lines), json.dumps(ev, ensure_ascii=False))
    else:
        chk(run, sid, '選冷門：「犯規。冷門學說是犯規。」「（她把那一題劃掉。）」「……下一題。」', all(any(w in l for l in lines) for w in ('犯規。冷門學說是犯規。', '（她把那一題劃掉。）', '……下一題。')), json.dumps(ev, ensure_ascii=False))
    hit = [l for l in lines if any(n in l for n in NOPE4)]
    chk(run, sid, '沒有「輸的請」「你贏」「你請」「她判你輸」「我會比」', not hit, json.dumps(hit, ensure_ascii=False))


# ---------------- S5 語彤、芷若期末邀約 ----------------
async def s5(p, base, run):
    b, pg, cdp, errs = await load(p, base, '2026-06-11', 20.1, 'dorm',
        js="for(const k in G.flags) if(k.indexOf('dating_')===0) G.flags[k]=false; LV('heroine_03',40,25,25); LV('heroine_02',40,25,25); INV.addContact(G,'heroine_03'); INV.addContact(G,'heroine_02'); G.termend=G.termend||{}; G.termend.contact=G.termend.contact||{}; G.termend.contact.Y1S2={heroine_03:{pts:9,k:{}},heroine_02:{pts:8,k:{}}}; try{ delete TERMEND.rec(G,'Y1S2').plan; }catch(e){}")
    run.setup('[前置] S5：2026-06-11 20:06；沒有交往、語彤／芷若 fam40/trust25（朋友）、通訊錄、期末接觸分 語彤 9／芷若 8、清掉已算好的 plan')
    await until(pg, cdp, 20.75, ['不', '晚一點'], secs=400)
    ms = await pg.evaluate("(()=>(GAME.G.msgs||[]).filter(m=>['p:heroine_03','p:heroine_02'].includes(PHONE.th(m))&&CALENDAR.dateOf(m.day).key==='2026-06-11').map(m=>PHONE.th(m)+' '+m.h+' '+m.text))()")
    say('   6/11 邀約：%s' % json.dumps(ms, ensure_ascii=False))
    a3 = await answer(pg, cdp, 'p:heroine_03', '好'); a2 = await answer(pg, cdp, 'p:heroine_02', '好'); say('   回語彤：%s；回芷若：%s' % (a3, a2))
    await pg.wait_for_timeout(4000)
    plans = await pg.evaluate("(()=>OUT.rec(GAME.G).filter(q=>/^te_/.test(q.id)).map(q=>({id:q.id,d:CALENDAR.dateOf(q.day).key,h:q.h,t:q.title})))()")
    T, Lg = await finish(pg, run, 'S5', b, errs, {'msgs': ms, 'plans': plans})
    toasts = [x['t'] for x in T if '排進行程' in x['t']]
    say('   排進行程：%s｜行程：%s' % (json.dumps(toasts, ensure_ascii=False), json.dumps(plans, ensure_ascii=False)))
    chk(run, 'S5', '語彤：「考完了。禮拜五，要吃飯嗎。」、沒有「禮拜四」', any('考完了。禮拜五，要吃飯嗎。' in m for m in ms) and not any('禮拜四' in m for m in ms), json.dumps(ms, ensure_ascii=False))
    chk(run, 'S5', '語彤的飯 6/19（五）19:00', any(x['d'] == '2026-06-19' and abs(x['h'] - 19) < 0.01 and '陳語彤' in (x['t'] or '') for x in plans), json.dumps(plans, ensure_ascii=False))
    chk(run, 'S5', '芷若：「考完了嗎？我下班以後，吃個東西？」→ 飯 6/12 22:00', any('我下班以後，吃個東西？' in m for m in ms) and any(x['d'] == '2026-06-12' and abs(x['h'] - 22) < 0.01 and '林芷若' in (x['t'] or '') for x in plans), json.dumps({'ms': ms, 'plans': plans}, ensure_ascii=False))


# ---------------- S6 沛珊課輔班 ----------------
async def s6(p, base, run):
    b, pg, cdp, errs = await load(p, base, '2026-03-24', 16.3, 'gongguan', gset=None,
        js="LV('classmate_peishan',45,30,30); INV.addContact(G,'classmate_peishan'); G.events=G.events||{}; G.events.done=G.events.done||{}; G.events.done.ev_peishan_doubt=1;")
    run.setup('[前置] S6：2026-03-24（二）16:18 公館；沛珊 fam45/trust30、通訊錄、ev_peishan_doubt 演過')
    row = await friends_row(pg, cdp, 'classmate_peishan'); say('   朋友頁沛珊：%s' % row); await L.close_panels(pg, cdp)
    await until(pg, cdp, 16.55, ['不', '晚一點'], secs=300)
    ex = await pg.evaluate("(()=>{ const it=(GAME.E.interactables||[]).find(i=>!i.hidden&&i.exit&&i.exit.to==='wenzhou'); return it?[it.x,it.z,it.label]:null; })()")
    say('   往溫州街：%s' % ex)
    if ex:
        await L.go_to(pg, cdp, run, ex[0], ex[1], 1.6, ex[2], max_s=300); await L.tap(pg, cdp, '#interact')
        for k in range(20):
            if await pg.evaluate("GAME.G.zone==='wenzhou'"): break
            await pg.wait_for_timeout(1000)
    await drain(pg, cdp, ['不', '晚一點'], secs=180)
    T, Lg = await finish(pg, run, 'S6', b, errs, {'row': row})
    lines = logs(Lg); ev = [l for l in lines if any(k in l for k in ('課輔班', '一週', '國小生', '志工'))]
    say('   進溫州街：%s' % json.dumps(ev, ensure_ascii=False))
    chk(run, 'S6', '朋友頁沛珊在溫州街（到 18:00）', bool(row) and '溫州街' in row, row or '')
    chk(run, 'S6', '進溫州街：「她帶著一群國小生從課輔班走出來…」「喔，是你。我在這裡當志工。一週兩天。」、沒有「一週三天」', any('一週兩天' in l for l in lines) and any('課輔班' in l for l in lines) and not any('一週三天' in l for l in lines), json.dumps(ev, ensure_ascii=False))


# ---------------- S7 通識第 6 週 ----------------
async def s7(p, base, run):
    b, pg, cdp, errs = await load(p, base, '2026-03-30', 12.66, 'dorm')
    run.setup('[前置] S7：2026-03-30（一）12:40 宿舍')
    items = await pg.evaluate("(()=>CLS.dayItems(GAME.G).map(x=>({c:x.c&&x.c.name, key:x.key, t0:+x.t0.toFixed(2), zone:x.room&&x.room.zone})))()")
    say('   3/30 的課：%s' % json.dumps(items, ensure_ascii=False))
    await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(1000)
    await tap_js(pg, cdp, "document.querySelector('#phoneTabs button[data-ptab=\"today\"]')")
    go = await tap_js(pg, cdp, "[...document.querySelectorAll('#phoneBody [data-go]')].find(b=>/ge_y1s2/.test(b.dataset.go))")
    say('   手機「今天」直接去上課：%s' % go)
    await until(pg, cdp, 15.3, ['坐中間的位子', '老位子', '坐', '直接去上課', '還是去'], secs=1200)
    T, Lg = await finish(pg, run, 'S7', b, errs, {'items': items})
    lines = logs(Lg); ge = [l for l in lines if any(k in l for k in ('天文館', '圓頂', '眼睛習慣黑暗', '星星', '操場', '最清醒'))]
    say('   通識的句子：%s' % json.dumps(ge, ensure_ascii=False))
    chk(run, 'S7', '「（天文館的圓頂關了燈。）」、「圓頂裡很暗」', any('（天文館的圓頂關了燈。）' in l for l in lines) and any('圓頂裡很暗' in l for l in lines), json.dumps(ge, ensure_ascii=False))
    chk(run, 'S7', '沒有「晚上的課，我最清醒。」「操場很暗」', not any(('晚上的課，我最清醒' in l) or ('操場很暗' in l) for l in lines), json.dumps(ge, ensure_ascii=False))


async def main():
    run = L.Run('aa373', OUT); base = json.load(open(SAVE, encoding='utf-8'))
    async with async_playwright() as p:
        for sid, f in (('S1', s1), ('S2', s2), ('S3', s3), ('S4', lambda p, b, r: s4(p, b, r, '中等')), ('S4c', lambda p, b, r: s4(p, b, r, '冷門')), ('S5', s5), ('S6', s6), ('S7', s7)):
            if sid not in SCEN: continue
            say('== %s' % sid); t0 = time.time()
            try: await f(p, base, run)
            except Exception as e: say('   ! 例外 %r' % e); bad.append('%s 例外 %r' % (sid, e)); run.check('%s 跑完' % sid, False, repr(e)[:200])
            say('   （%.0f 秒）' % (time.time() - t0))
        json.dump({'out': out, 'bad': bad}, open(os.path.join(OUT, 'aa373.json'), 'w'), ensure_ascii=False, indent=1)
        print('問題：'); [print('   -', x) for x in bad]
    run.finish()
asyncio.run(main())
