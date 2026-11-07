"""BB-B 2026-11-07：她有自己的想法（BB_305 第 10-4～10-6 節；LAWWW-B 309bfa4fd DECIDE 引擎、8f4185616 AA_719 決定拍）瀏覽器驗收。
使用者 11-07 06:2x～06:4x 對 BB-B：「我想要的是我的選項會改變故事」「如果真的影響能不能交往的選項 應該要有 小心選擇的提示」「也不能我建議他做什麼他就都聽我的啊」。
[前置／捷徑] 讀使用者存檔 day46，【捷徑】DAYSHIFT 天（預設 -14＝10/18，非考試週）、清掉原本的邀約、清掉 DECIDE／DECIDE_SAY、
  【捷徑】WHO 的故事線直接從第 K 拍開始（BEATS[WHO].k＝K）；TRUST／NPCROM 有給就改存檔裡她的關係數字（【捷徑】）。
之後全部觸控：手機「朋友」→ WHO「約」→ 念書 → 總圖 → 今天的時間；【捷徑】時間撥到約好的前 10 分鐘 → 手機「今天」「現在過去」→ 跟她走、坐下 → 對話照實點。
  第 K 拍的選項：選 PICK（第幾個，從 0 算）。RETHINK=1：第一次在「確定嗎？」按「再想想」，看是不是回到同一組、還沒記；第二次按「確定」。
看：
  ① 關鍵的那一組（key_true）：選單上方有那一行字（AA_719 keyNote）；選完有「確定嗎？」「確定」「再想想」。一般選項（KEYTRUE=0）：沒有那一行字、沒有確認。
  ② 「再想想」回到同一組三個選項、DECIDE 還沒記；「確定」以後才記。
  ③ DECIDE[WHO][KEY].v＝EXPECT（照 AA_719 的規則算，不是照你選的）；rule、stance 有記。
  ④ delay＞0：DECIDE_SAY 有一筆、due＝那天＋delay。
     FOLLOW=meet：【捷徑】day 撥到 due → 再約一次 → 坐下以後她先說那幾句（say 第一句有出現）。
     FOLLOW=msg：【捷徑】day 撥到 due＋3（三天沒見）→ 手機收到她的訊息（只有她說的話，沒有旁白）、DECIDE_SAY 記 byMsg。
  ⑤ 沒有 JS 例外。
用法：LW_TESTS=<測試樹>/tests WHO=heroine_01 K=6 KEY=jp_tell PICK=0 RETHINK=1 EXPECT=first FOLLOW=meet python3 pt1107f_decide_probe.py URL 存檔資料夾 輸出資料夾（PC 用 URL 不加 ?turbo）"""
import asyncio, json, os, sys
from playwright.async_api import async_playwright
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.dirname(__file__))
import playlib as L

URL, SAVES, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
WHO = os.environ.get('WHO', 'heroine_01')
K = int(os.environ.get('K', '6'))
KEY = os.environ.get('KEY', 'jp_tell')
PICK = int(os.environ.get('PICK', '0'))
RETHINK = os.environ.get('RETHINK', '1') == '1'
EXPECT = os.environ.get('EXPECT', '')
KEYTRUE = os.environ.get('KEYTRUE', '1') == '1'
FOLLOW = os.environ.get('FOLLOW', 'meet')
SHIFT = int(os.environ.get('DAYSHIFT', '-14'))
TRUST = os.environ.get('TRUST')
NPCROM = os.environ.get('NPCROM')
CONF = ('確定', '再想想')


async def phone(pg, cdp, tab):
    if await pg.evaluate("document.getElementById('phone').classList.contains('hide')"):
        await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(900)
    await L.tap(pg, cdp, '#phoneTabs button[data-ptab="%s"]' % tab); await pg.wait_for_timeout(800)
    return await pg.evaluate("(document.getElementById('phoneBody')||{}).textContent||''")


async def close_phone(pg, cdp):
    """收起手機（手機開著 E.paused＝時間不走）：按手機裡的「收起來」；找不到才按 #btnPhone"""
    for _ in range(3):
        if await pg.evaluate("document.getElementById('phone').classList.contains('hide')"): return True
        c = await pg.evaluate("(()=>{ const b=[...document.querySelectorAll('#phone button')].find(x=>x.textContent.trim()==='收起來'); if(!b) return null; const r=b.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })()")
        if c: await L.touch_tap(cdp, c[0], c[1])
        else: await L.tap(pg, cdp, '#btnPhone')
        await pg.wait_for_timeout(700)
    return await pg.evaluate("document.getElementById('phone').classList.contains('hide')")


async def tap_sel(pg, cdp, sel):
    ok = await pg.evaluate("(s=>{ const e=document.querySelector(s); if(!e) return false; e.scrollIntoView({block:'center'}); return true; })(%s)" % json.dumps(sel))
    if not ok: return False
    await pg.wait_for_timeout(500)
    return await L.tap(pg, cdp, sel)


async def choose(pg, cdp, word, exact_start=False):
    c = await pg.evaluate("((w,s)=>{ const b=[...document.querySelectorAll('#choices button')].find(x=>s?x.textContent.trim().startsWith(w):x.textContent.includes(w)); if(!b) return null; b.scrollIntoView({block:'center'}); const r=b.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2,b.textContent.trim(),b.disabled||b.classList.contains('dim')]; })(%s,%s)" % (json.dumps(word), 'true' if exact_start else 'false'))
    if not c: return None
    await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(1500); return c


async def opts(pg):
    return await pg.evaluate("[...document.querySelectorAll('#choices button')].map(b=>({t:b.textContent.trim(),dim:!!(b.disabled||b.classList.contains('dim'))}))")


async def note(pg):
    return await pg.evaluate("(()=>{ const n=document.querySelector('#choices .chNote'); return n?n.textContent.trim():null; })()")


async def settle(pg, cdp, log, secs=40):
    for _ in range(secs * 2):
        q = await L.state(pg)
        if q['dtext'] and (not log or log[-1] != q['dtext']): log.append(q['dtext'])
        if not q['busy'] and not q['dlg'] and not q['choices']: return True
        if q['choices']:
            o = await opts(pg); log.append('選項：' + '｜'.join(x['t'] for x in o))
            pick = next((x['t'] for x in o if not x['dim'] and not any(w in x['t'] for w in ('算了', '返回', '下次再說'))), None)
            if pick is None: pick = o[0]['t']
            await choose(pg, cdp, pick, True); continue
        if q['dlg']: await L.tap(pg, cdp, '#dlg')
        await pg.wait_for_timeout(500)
    return False


async def dec(pg):
    return await pg.evaluate("((w,k)=>{ const f=GAME.G.flags||{}; const D=(f.DECIDE||{})[w]||{}; return {d:D[k]||null, says:(f.DECIDE_SAY||[]).filter(x=>x.who===w), beats:(f.BEATS||{})[w]||null, day:GAME.G.day, hour:GAME.G.hour, trustHi:DECIDE.trustHi(GAME.G,w), rel:SOCIAL.rel(w), stageNum:DATE.stageNum(w)}; })(%s,%s)" % (json.dumps(WHO), json.dumps(KEY)))


async def meet_once(pg, cdp, run, tag, beat_opts, rec):
    """約一次念書、去、演完。第 K 拍那一組照 PICK／RETHINK 點；rec 記 note、確認、再想想的結果。回傳 said。"""
    await phone(pg, cdp, 'friends')
    if not await tap_sel(pg, cdp, '#phoneBody [data-inv="%s"]' % WHO): run.check('[%s] 手機朋友頁有「約」' % tag, False); return None
    await pg.wait_for_timeout(1500)
    if not await choose(pg, cdp, '念書') or not await choose(pg, cdp, '總圖'): run.check('[%s] 念書 → 總圖' % tag, False); return None
    o = await opts(pg)
    t = next((x for x in o if x['t'].startswith('今天') and not x['dim']), None)
    if not t: run.check('[%s] 今天有能選的時間' % tag, False, json.dumps(o, ensure_ascii=False)); return None
    await choose(pg, cdp, t['t'], True)
    log = []; await settle(pg, cdp, log, 30)
    iv = await pg.evaluate("(w=>(GAME.G.invites||[]).filter(v=>v.who===w&&v.day===GAME.G.day&&v.state!=='done').map(v=>({id:v.id,h:v.h,place:v.place})))(%s)" % json.dumps(WHO))
    if not iv: run.check('[%s] 約成了（%s）' % (tag, t['t']), False, json.dumps(log[-5:], ensure_ascii=False)); return None
    v = iv[-1]
    run.setup('[%s]【捷徑】時間撥到約好的 %.2f 前 10 分鐘' % (tag, v['h']))
    await pg.evaluate("(h=>{ GAME.G.hour=h; })(%f)" % (v['h'] - 0.17)); await pg.wait_for_timeout(1200)
    await phone(pg, cdp, 'today')
    if not await tap_sel(pg, cdp, '#phoneBody [data-invgo="%s"]' % v['id']):
        here = await pg.evaluate("(p=>{ const P=INV.place(p)||{}; return GAME.G.zone===P.zone; })(%s)" % json.dumps(v['place']))
        if not here: run.check('[%s] 手機「今天」有「現在過去」' % tag, False); return None
        run.setup('[%s] 人已經在約好的地方，手機不給「前往」＝照設計，直接走去找她' % tag)
        body = await pg.evaluate("(document.getElementById('phoneBody')||{}).textContent||''")
        run.check('[%s] 手機那一列說「你已經在這裡了。收起手機，等她就好。」（2af585673）' % tag, '你已經在這裡了' in body, body[:160])
        run.check('[%s] 收起手機（時間才會走）' % tag, await close_phone(pg, cdp))
    said = []; asked = 0
    for _ in range(900):
        q = await L.state(pg)
        if q['dtext'] and (not said or said[-1] != q['dtext']): said.append(q['dtext'])
        st = await pg.evaluate("(id=>{ const v=(GAME.G.invites||[]).find(x=>String(x.id)===String(id)); return v?{st:v.state, ph:v.lead&&v.lead.ph}:null; })(%s)" % json.dumps(v['id']))
        if st and st['st'] in ('done', 'met', 'over') and not q['dlg'] and not q['busy'] and not q['choices']: break
        if q['choices']:
            o = await opts(pg); ts = [x['t'] for x in o]; nt = await note(pg)
            if beat_opts is not None and ts == beat_opts and rec is not None:
                asked += 1
                rec.setdefault('rounds', []).append({'note': nt, 'opts': ts})
                if asked == 1: await run.shot(pg, 'decide_%s_opts' % tag)
                pick = ts[PICK]; said.append('選項：%s｜上方：%s → %s' % ('｜'.join(ts), nt, pick))
                await choose(pg, cdp, pick, True); continue
            if rec is not None and rec.get('rounds') and set(ts) == set(CONF):
                nt2 = await note(pg); d0 = await dec(pg)
                ans = '再想想' if (RETHINK and not rec.get('rethought')) else '確定'
                rec.setdefault('confirms', []).append({'note': nt2, 'opts': ts, 'ans': ans, 'decBefore': d0['d']})
                if ans == '再想想': rec['rethought'] = True
                if len(rec['confirms']) == 1: await run.shot(pg, 'decide_%s_confirm' % tag)
                said.append('確認：%s｜%s → %s' % (nt2, '｜'.join(ts), ans))
                await choose(pg, cdp, ans, True); continue
            pick = ts[0]; said.append('選項：' + '｜'.join(ts) + ' → ' + pick)
            await choose(pg, cdp, pick, True); continue
        if os.environ.get('DBG') and _ % 10 == 0:
            dbg = await pg.evaluate("(id=>{ const v=(GAME.G.invites||[]).find(x=>String(x.id)===String(id)); let sf=null; try{ sf=INV.sceneFree(GAME); }catch(e){ sf='ERR'; } return {zone:GAME.G.zone, hour:+GAME.G.hour.toFixed(3), day:GAME.G.day, ivZone:v&&v.zone, ivH:v&&v.h, ivSt:v&&v.state, lead:!!(v&&v.lead), sceneFree:sf, plv:GAME.E.player.lv|0, paused:!!GAME.E.paused, hidden:document.hidden, phoneOpen:!document.getElementById('phone').classList.contains('hide'), pBusy:!!(GAME.E.player&&GAME.E.player.busy), D:(GAME.D?{active:GAME.D.active,busyDepth:GAME.D.busyDepth,busyWho:GAME.D.busyWho}:null), evRunning:(typeof EVENTS!=='undefined'?EVENTS.running:null), outDue:(typeof OUT!=='undefined'&&OUT.due?String(OUT.due).slice(0,40):null), npcHere:!!GAME.E.npcs.find(q=>q.id==='heroine_01'||q.charId==='heroine_01')}; })(%s)" % json.dumps(v['id']))
            print('   [DBG %d]' % _, json.dumps(dbg, ensure_ascii=False), flush=True)
        if st and not q['dlg'] and not q['busy'] and (st['ph'] == 'wait' or (st['st'] == 'accepted' and not st['ph'])):   # 2026-11-07 BB-B：對話框開著先點對話（第 2 次已經在館裡、沒有帶路時，原本一直「走到她旁邊」不點門口那句＝TEST_BUG）
            n = await pg.evaluate("(w=>{ const n=GAME.E.npcs.find(q=>q.id===w||q.charId===w); return n?{x:n.obj.position.x,z:n.obj.position.z,lv:n.lv|0}:null; })(%s)" % json.dumps(WHO))
            if n: await L.go_to(pg, cdp, run, n['x'], n['z'], 1.8, '走到她旁邊', lv=n['lv']); await pg.wait_for_timeout(1000); continue
        if q['dlg']: await L.tap(pg, cdp, '#dlg')
        await pg.wait_for_timeout(500)
    return said


async def main():
    run = L.Run('pt1107f', OUT)
    s = json.load(open(os.path.join(SAVES, 'fatiao3d_save_day46.json'), encoding='utf-8'))
    s = dict(s); s['day'] = s['day'] + SHIFT; s['invites'] = []
    f = dict(s.get('flags') or {})
    for x in ('DECIDE', 'DECIDE_SAY', 'ARC_INVITE'): f.pop(x, None)
    B = dict(f.get('BEATS') or {}); B[WHO] = {'k': K, 'last': None, 'ans': {}, 'missed': []}; f['BEATS'] = B; s['flags'] = f
    soc = dict(s.get('social') or {}); rel = dict(soc.get('rel') or {}); r = dict(rel.get(WHO) or {})   # 關係在 social.rel（不是頂層 rel）
    if TRUST is not None: r['trust'] = int(TRUST)
    if NPCROM is not None: r['npcRom'] = int(NPCROM)
    rel[WHO] = r; soc['rel'] = rel; s['social'] = soc
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=os.environ.get('PORTRAIT') != '1')   # PORTRAIT=1：390×844 直向
        await pg.goto(URL)
        run.check('遊戲載入', await L.wait_loaded(pg))
        run.setup('讀使用者存檔 day46；【捷徑】day %+d、清掉原本的邀約、清掉 DECIDE／DECIDE_SAY；【捷徑】%s 的故事線從第 %d 拍開始%s' % (SHIFT, WHO, K, ('；【捷徑】關係改 trust=%s npcRom=%s' % (TRUST, NPCROM)) if (TRUST or NPCROM) else ''))
        await L.load_state(pg, s, quiet_phone=True); await pg.wait_for_timeout(3500); await settle(pg, cdp, [], 60)
        info = await pg.evaluate("((w,k,n)=>{ const T=((HEROINE_ARCS||{}).people||{})[w]; const b=T&&T.beats.find(x=>x.n===n); const e=typeof DECIDE!=='undefined'&&DECIDE.byKey?DECIDE.byKey(w,k):null; const r=b&&typeof ARCS!=='undefined'?ARCS.resolve(GAME.G,w,b):null; return {has:!!(typeof DECIDE!=='undefined'&&DECIDE.decideBeat), beat:b?{need:b.need, ask:(b.ask||[]).join('')}:null, opts:r?r.opts.map(o=>ARCS.text(GAME.G,o.t)):null, rule:e?{beat:e.beat,keyTrue:!!e.key_true||!!e.keyTrue,keyNote:e.keyNote||null,def:e.default,revealDay:(e.revealAt&&typeof ARCS!=='undefined'&&ARCS.dayOf)?ARCS.dayOf(e.revealAt.day):null,revealAt:e.revealAt||null,opts:e.opts,rules:e.rules.map(x=>({stance:x.stance,trust:x.trust,opt:x.opt,result:x.result,delay:x.delay,say:x.say||null}))}:null}; })(%s,%s,%d)" % (json.dumps(WHO), json.dumps(KEY), K))
        run.check('這一版有 DECIDE.decideBeat、%s 的 %s（第 %d 拍）' % (WHO, KEY, K), bool(info['has'] and info['rule'] and info['beat'] and info['rule']['beat'] == K), json.dumps(info, ensure_ascii=False)[:600])
        if not (info['has'] and info['rule'] and info['opts']): await b.close(); return run.finish()
        d0 = await dec(pg)
        print('   關係', d0['rel'], 'stageNum', d0['stageNum'], 'trustHi', d0['trustHi'], '｜need', info['beat']['need'], flush=True)
        rule = info['rule']; beat_opts = info['opts']
        so = next((o for o in rule['opts'] if o['i'] == PICK), None); stance = so and so['stance']
        exp_rule = next((x for x in rule['rules'] if x['stance'] == stance and (x['trust'] == 'any' or (x['trust'] == 'hi') == d0['trustHi']) and (x['opt'] is None or x['opt'] == PICK)), None)
        exp = EXPECT or (exp_rule['result'] if exp_rule else rule['def'])
        print('   選第 %d 個（%s）stance=%s → 照規則應該是 %s（%s）' % (PICK, beat_opts[PICK], stance, exp, exp_rule), flush=True)
        rec = {}
        said = await meet_once(pg, cdp, run, '第1天', beat_opts, rec)
        d1 = await dec(pg)
        rounds, confs = rec.get('rounds', []), rec.get('confirms', [])
        run.check('[第1天] 第 %d 拍演了、那一組選項出現（k %d→%s）' % (K, K, (d1['beats'] or {}).get('k')), said is not None and len(rounds) >= 1 and (d1['beats'] or {}).get('k') == K + 1, json.dumps({'rounds': rounds, 'said': (said or [])[-16:]}, ensure_ascii=False))
        if KEYTRUE:
            run.check('① 上方那一行字＝AA_719 keyNote', bool(rounds) and rounds[0]['note'] == rule['keyNote'], json.dumps({'seen': rounds[0]['note'] if rounds else None, 'want': rule['keyNote']}, ensure_ascii=False))
            run.check('① 選完有「確定嗎？」「確定」「再想想」', bool(confs) and confs[0]['note'] == '確定嗎？' and set(confs[0]['opts']) == set(CONF), json.dumps(confs, ensure_ascii=False))
            if RETHINK:
                run.check('② 按「再想想」回到同一組（那一組出現 2 次，上方那一行字還在）', len(rounds) >= 2 and rounds[1]['opts'] == beat_opts and rounds[1]['note'] == rule['keyNote'], json.dumps(rounds, ensure_ascii=False))
                run.check('② 「再想想」那時還沒記 DECIDE；第二次「確定」才記', len(confs) >= 2 and confs[0]['decBefore'] is None and confs[1]['decBefore'] is None and d1['d'] is not None, json.dumps({'confirms': confs, 'after': d1['d']}, ensure_ascii=False))
        else:
            run.check('① 一般選項：沒有上方那一行字、沒有「確定嗎？」', bool(rounds) and rounds[0]['note'] is None and not confs, json.dumps({'rounds': rounds, 'confirms': confs}, ensure_ascii=False))
        v = (d1['d'] or {}).get('v')
        run.check('③ DECIDE.%s.%s＝%s（照 AA_719：stance %s × 信任 %s）' % (WHO, KEY, exp, stance, 'hi' if d0['trustHi'] else 'lo'), v == exp, json.dumps(d1['d'], ensure_ascii=False))
        run.check('③ 有記 stance、rule', bool(d1['d']) and d1['d'].get('stance') == stance and d1['d'].get('rule') is not None, json.dumps(d1['d'], ensure_ascii=False))
        await run.shot(pg, 'decide_after_day1')
        delay = (exp_rule or {}).get('delay') or 0; say = (exp_rule or {}).get('say') or []
        if say:
            x = next((q for q in d1['says'] if q['key'] == KEY), None)
            due_want = max(d1['day'], rule['revealDay']) if (rule.get('revealDay') is not None and delay > 0) else d1['day'] + delay
            run.check('④ DECIDE_SAY 有一筆、due＝第 %d 天（%s）' % (due_want, ('revealAt %s' % rule['revealAt']) if rule.get('revealDay') is not None else '那天＋%d' % delay), bool(x) and x['due'] == due_want and not x['played'], json.dumps(d1['says'], ensure_ascii=False))
            if x and rule.get('revealDay') is not None:
                pre = x['due'] - 1
                run.setup('【捷徑】day 撥到 revealAt 前一天（%d）09:00，見面前她不能先說' % pre)
                await pg.evaluate("(d=>{ GAME.G.day=d; GAME.G.hour=9; })(%d)" % pre); await pg.wait_for_timeout(1500); await settle(pg, cdp, [], 30)
                dpre = await dec(pg); xp = next((q for q in dpre['says'] if q['key'] == KEY), {})
                run.check('④ revealAt 前一天：還沒說（played 還是 false）', not xp.get('played'), json.dumps(xp, ensure_ascii=False))
            if x and delay > 0 and FOLLOW == 'meet':
                run.setup('【捷徑】day 撥到 due（%d）09:00' % x['due'])
                await pg.evaluate("(d=>{ GAME.G.day=d; GAME.G.hour=9; })(%d)" % x['due']); await pg.wait_for_timeout(1500); await settle(pg, cdp, [], 30)
                said2 = await meet_once(pg, cdp, run, '第%d天' % x['due'], None, None)
                d2 = await dec(pg); x2 = next((q for q in d2['says'] if q['key'] == KEY), {})
                first = say[0]; head = first.strip('（）')[:10]
                hist = await pg.evaluate("(typeof ADV!=='undefined'&&Array.isArray(ADV.history))?ADV.history.map(x=>(x.name||'')+'｜'+x.text):[]")
                hit = [i for i, t in enumerate((said2 or []) + hist) if head in t]
                run.check('④ 那天見面，她先說「%s」（say 第一句在畫面或 ADV 紀錄裡）' % first[:24], bool(hit), json.dumps({'said': (said2 or [])[:12], 'hist': hist[-14:]}, ensure_ascii=False))
                okAll = all(any(t.strip('（）')[:8] in h for h in ((said2 or []) + hist)) for t in say)
                run.check('④ say 四句都演了（畫面或 ADV 紀錄）', okAll, json.dumps(say, ensure_ascii=False))
                run.check('④ 說完記 played', bool(x2.get('played')), json.dumps(x2, ensure_ascii=False))
            elif x and FOLLOW == 'msg':
                run.setup('【捷徑】day 撥到 due＋3（%d，三天沒見）09:00' % (x['due'] + 3))
                await pg.evaluate("(d=>{ GAME.G.day=d; GAME.G.hour=9; })(%d)" % (x['due'] + 3)); await pg.wait_for_timeout(4000); await settle(pg, cdp, [], 30)
                d2 = await dec(pg); x2 = next((q for q in d2['says'] if q['key'] == KEY), {})
                tag = 'decide_say_%s_%s' % (WHO, KEY)
                sent = await pg.evaluate("(t=>typeof PHONE!=='undefined'&&PHONE.sent?PHONE.sent(GAME.G,t):null)(%s)" % json.dumps(tag))
                lines = [t for t in say if not t.startswith('（')]
                blob = await pg.evaluate("JSON.stringify(GAME.G.phone||{})+JSON.stringify(GAME.G.msgs||[])+JSON.stringify(GAME.G.msgChat||{})")
                run.check('④ 三天沒見：手機傳她說的話（%d 句）、DECIDE_SAY 記 byMsg' % len(lines), bool(sent) and x2.get('byMsg') and all(t in blob for t in lines), json.dumps({'sent': sent, 'x': x2}, ensure_ascii=False))
                run.check('④ 旁白沒有傳成訊息', not any(t in blob for t in say if t.startswith('（')), '')
        else:
            run.check('④ 這條規則沒有 say：DECIDE_SAY 沒有這一筆', not any(q['key'] == KEY for q in d1['says']), json.dumps(d1['says'], ensure_ascii=False))
        run.check('⑤ 沒有 JS 例外', not errs, json.dumps(errs[:5], ensure_ascii=False))
        await b.close()
    return run.finish()


if __name__ == '__main__':
    sys.exit(asyncio.run(main()))
