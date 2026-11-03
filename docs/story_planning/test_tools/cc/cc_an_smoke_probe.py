"""CC（帳號 A）11-03：以安改稿（7224af47a：AA_587§14、589、592、594、601、CG-119、AA_600）冒煙探針（BB 01:56）。
不是 iPhone：Playwright 手機模擬（橫向 844×390、is_mobile、CDP 觸控；SwiftShader 1～4 fps）。每個 case 開一個新的瀏覽器。

讀碼看到的規則（7224af47a）：
(1) 七夕短冊＝ev_jp_tanabata_repair（src/data/jp_events.js:88-97 TANABATA_R、144 登錄；排程 src/jp3d.js:121 JP.SCH g7_tanabata 2028-07-07 19:00，
    w:'jp'，dat(G)＝和以安交往中 → ev_jp_tanabata，否則（挽回中）→ ev_jp_tanabata_repair；after 在 src/jp3d.js:472：AN_JP_RECONCILED → JP.resume＝回到交往）。
    AA_600 3-2（企劃線 031414cad，使用者 11-02 選「祐廷先開口」）：祐廷寫「再一次。」、她寫「好。」——**不是玩家可以選的兩個選項**，這一場沒有選項；
    分岔是 REPAIR（G.flags.REPAIR.heroine_01，jp_events.js:16 repairOk＝≥3）：
      tana_ok （REPAIR=3）：旁白兩句 →（她在自己那張上面寫了一個字…「好。」）→ 以安「……不准賴。」→ AN_TANABATA_JP_REPAIR 'again'、AN_JP_RECONCILED、dating_heroine_01。
      tana_low（REPAIR=2）：旁白兩句 →（她看了很久，把短冊還給你。）→ 以安「掛上去吧。」→ 'hung'，沒有 RECONCILED、不交往。
    這一場沒有記憶（SOCIAL.remember）；c89a5f9be 的舊稿是「以安拿著一張，寫了很久。」「你要看嗎？」「（短冊上只有一行：「再一次。理由：我想。」）」。
    觸發照玩家：【前置】讀檔到 2028-07-07 18:45 日本據點（jp_hub，JPF 旗標同 cc_bg5_probe.py）→ 據點選單點「快轉」→「到下一個有事的日子」→ 19:00 據點迴圈（JP.loop 的 dueStop）自己演。
(2) 行政法院 CG-29＝ev_an_admin_court_together（src/data/r2y3a_events.js:362-381；CG 在 370 行 cg_admin_court_heroine01＝CG_REGISTRY src/adv3d.js:118
    assets/cg/heroine_01/cg_admin_court.webp）。觸發 src/r2y3a3d.js:245-253 S.anAdminPhone：AN_ADMIN_NEXT（ev_an_admin_court 選「下次我也想去。」）、FRIEND 以上、
    不是前任 → 2027-10-27 21:00 她私訊三則＋回覆「好。」／「那天我有課。」；「好。」＝AN_ADMIN_GO → OUT.plan y3_an_admin 2027-11-03 13:50（late 0.25、捷運 30 分鐘）。
    台詞照 AA_601 第 2 節（企劃線，逐字一致）。結尾 AN_ADMIN_TOGETHER 'there'、記憶 AN_ADMIN_TOGETHER、熟悉 +2 信任 +1。c89a5f9be 沒有這一場（e2c255495 才加）。
    流程：【前置】讀檔 2027-10-27 21:00 宿舍（AN_ADMIN_NEXT、ev_an_admin_court 記成演過）＋【捷徑】SOCIAL 熟悉 45 信任 30（FRIEND）→ 等她的私訊 →
    手機照玩家點「好。」（CDP 觸控）→ 出遊排進去 → 【前置】同一份進度跳到 11/3 13:06 宿舍 → 等遊戲跳「出發：…行政法院…」→ 點 → 點對話、選「法官一直讓他講完。」。
判斷讀遊戲狀態：GAME.say 原文（startswith）、ADV.cg 呼叫的順序、G.cg.unlocked、旗標、SOCIAL 記憶、G.events.done；另外 pageerror、結束後不卡。
用法：LW_TESTS=<wt>/tests SHA=<sha> [CASES=tana_ok,tana_low,admin] python3 cc_an_smoke_probe.py '<URL>/index.html?turbo' <輸出資料夾>
環境變數：PROMPT_S（等自己開演，預設 240）、PLAY_S（一場最多幾秒，預設 600）。每項一行 PASS／FAIL，最後 ALL PASS 或 FAILED n；exit 0／1。"""
import os, sys, json, asyncio, time, traceback
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__)))); import bbplay as P   # bbplay 在上一層（BB 的 test_tools）
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
SHA = os.environ.get('SHA', '?')
J = lambda o: json.dumps(o, ensure_ascii=False)
CASES = [x.strip() for x in os.environ.get('CASES', 'tana_ok,tana_low,admin').split(',') if x.strip()]
PROMPT_S = int(os.environ.get('PROMPT_S', '240'))
PLAY_S = int(os.environ.get('PLAY_S', '600'))
BASEF = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True, 'metAn': True, 'met_an': True, 'MET_ZHE': True,
         'zheNoodleDone': True, 'KX_FIRST_MSG': True, 'KX_EVE_MSG': True, 'FAM_GROUP_SENT': True, 'CEREMONY_Y1': True, 'KAI_MOVEIN': True, 'LAW_RECAP_SEEN': True,
         'fundsV2': 1, 'KX_DEC3_MIGRATED': True, 'dating_kexin': False}
ROOMS = (('ROOM_Y2', '2026-09-06'), ('ROOM_Y3', '2027-09-05'), ('ROOM_Y4', '2028-09-03'))
VISITED = ('noodle', 'cafe', 'library_hall', 'library', 'lawlib', 'wancai', 'linze', 'gongguan', 'wenzhou', 'soclib', 'cvs', 'bookstore')
JPF = {'EXCHANGE_ROUTE': 'JP', 'EXCH_RULE': 1, 'X1_JP': ('DAY', '2028-02-20'), 'JP_DEPARTED': ('DAY', '2028-03-25'), 'AN_SENDOFF': 'together'}   # tests/jp_semester_unit.js inJapan()

T_HEAD = ['（宿舍門口的竹子上掛滿了短冊。以安站在旁邊，手上那一張還沒寫。）', '（你寫了一張，拿給她看。上面只有一行：「再一次。」）']
T_OK = ['（她在自己那張上面寫了一個字，掛在你那張旁邊。上面寫著：「好。」）', '……不准賴。']
T_LOW = ['（她看了很久，把短冊還給你。）', '掛上去吧。']
T_OLD = ['你要看嗎？', '（短冊上只有一行：「再一次。理由：我想。」）']   # c89 的舊稿（AA_600 刪）
A_MSG = ['下禮拜三下午兩點半，行政法院。', '📷（一張開庭表，第二行用螢光筆畫了一條線。）', '旁聽席很小。我一點五十到。']
A_PRE = ['（行政法院的旁聽席只有三排。你們坐在最後一排。）', '（左邊是一個人和他的律師，右邊是機關的兩個代理人。法官進來，大家站起來，再坐下。）']
A_POST = ['（一個小時。以安的筆一直停在筆記本上，一個字都沒寫。）', '（退庭以後，你們走出法院。外面的太陽很大。）', '……他講完了。']
A_PICK = '「法官一直讓他講完。」'
A_REPLY = '嗯。這次我自己看到了。'
CGID = 'cg_admin_court_heroine01'
EV_T, EV_A = 'ev_jp_tanabata_repair', 'ev_an_admin_court_together'

HOOK = r"""(()=>{ if(window.__ANS) return 'again'; const Lg=window.__ANS=[];
  const push=o=>{ try{ o.h=+(+GAME.G.hour).toFixed(3); o.day=GAME.G.day; o.run=(typeof EVENTS!=='undefined'&&EVENTS.running)||null; Lg.push(o); }catch(e){ Lg.push(o); } };
  const y0=GAME.say; GAME.say=function(w,t){ push({k:'say',n:(w&&w.name)||(typeof w==='string'?w:''),t:String(t==null?'':t)}); return y0.apply(this,arguments); };
  const c0=GAME.choose; GAME.choose=function(o){ push({k:'choose',t:(o||[]).filter(x=>x&&!x.hidden).map(x=>((x.t||x.text)||''))}); return c0.apply(this,arguments); };
  if(typeof ADV!=='undefined'&&ADV.cg){ const g0=ADV.cg; ADV.cg=function(id){ push({k:'cg',t:String(id)}); return g0.apply(this,arguments); }; }
  if(typeof EVENTS!=='undefined'&&EVENTS.run){ const r0=EVENTS.run; EVENTS.run=function(ev){ const id=String((ev&&ev.id)||''); push({k:'ev',t:id}); const p=r0.apply(this,arguments);
    if(p&&p.then) p.then(()=>push({k:'evend',t:id}),e=>push({k:'everr',t:id,e:String(e&&e.message||e)})); return p; }; }
  if(typeof OUT!=='undefined'&&OUT.go){ const o0=OUT.go; OUT.go=function(GM,q){ push({k:'out',t:String((q&&q.id)||'')}); return o0.apply(this,arguments); }; }
  if(typeof JP!=='undefined'&&JP.playStop){ const p0=JP.playStop; JP.playStop=function(GM,s,w){ push({k:'stop',t:String((s&&s.k)||'')}); return p0.apply(this,arguments); }; }
  return 'ok'; })()"""
LOG_JS = "(n=>(window.__ANS||[]).slice(n))"
STATE_JS = r"""(()=>{ const G=GAME.G, F=G.flags||{}, so=typeof SOCIAL!=='undefined'?SOCIAL:null, r=so?so.rel('heroine_01'):{};
  const R=F.REPAIR&&typeof F.REPAIR==='object'?F.REPAIR.heroine_01:null; let q=null; try{ q=OUT.get(G,'y3_an_admin'); }catch(e){}
  const msg=(G.msgs||[]).filter(m=>m&&(m.th==='p:heroine_01'||m.who==='heroine_01')).slice(-6).map(m=>({t:m.text||m.t||'',ask:m.ask?m.ask.id:null,ans:m.ans==null?null:m.ans}));
  return {key:CALENDAR.dateOf(G.day).key,h:+(+G.hour).toFixed(3),zone:G.zone,repair:R,dating:F.dating_heroine_01===true,romance:((F.romance||{}).heroine_01||{}).status||null,
    tana:F.AN_TANABATA_JP_REPAIR==null?null:F.AN_TANABATA_JP_REPAIR,recon:!!F.AN_JP_RECONCILED,adminNext:!!F.AN_ADMIN_NEXT,adminGo:!!F.AN_ADMIN_GO,
    adminTog:F.AN_ADMIN_TOGETHER==null?null:F.AN_ADMIN_TOGETHER,stage:so?so.stage('heroine_01'):null,fam:r.fam|0,trust:r.trust|0,
    mems:so?so.memories('heroine_01').map(m=>m.tag||m.k||m.type||''):[],failed:Object.keys((G.events&&G.events.failed)||{}),done:Object.assign({},(G.events&&G.events.done)||{}),
    cg:((G.cg||{}).unlocked||[]).slice(),reg:(typeof CG_REGISTRY!=='undefined'&&CG_REGISTRY[%s])?CG_REGISTRY[%s].file:null,
    outing:q?{state:q.state,day:CALENDAR.dateOf(q.day).key,h:q.h,ev:q.ev}:null,msgs:msg,
    hasEvT:!!STORY_EVENTS.find(e=>e.id==='%s'),hasEvA:!!STORY_EVENTS.find(e=>e.id==='%s'),
    busy:!!GAME.E.player.busy,depth:(GAME.D&&GAME.D.busyDepth)|0,running:(typeof EVENTS!=='undefined'&&EVENTS.running)||null,adv:!!(typeof ADV!=='undefined'&&ADV.active),
    inJapan:typeof JP!=='undefined'&&JP.inJapan?!!JP.inJapan(G):null}; })()""" % (J(CGID), J(CGID), EV_T, EV_A)
FRIEND_JS = """(()=>{ const id='heroine_01'; if(!SOCIAL.has(id,'FIRST_MET')) SOCIAL.meet(id,'campus'); const r=SOCIAL.rel(id); r.fam=Math.max(r.fam|0,45); r.trust=Math.max(r.trust|0,30);
  return {stage:SOCIAL.stage(id),fam:r.fam,trust:r.trust}; })()"""


async def st(pg): return await pg.evaluate(STATE_JS)


async def log(pg, n=0): return await pg.evaluate(LOG_JS, n)


async def build(pg, when, hour, zone, flags, done=()):
    d = await P.day_of(pg, when)
    s = {'name': '祐廷', 'energy': 100, 'events': {'done': {}, 'last': {}, 'count': 0}, 'contacts': {}, 'outings': []}
    F = s['flags'] = dict(BASEF)
    for k, kk in ROOMS:
        dd = (await P.day_of(pg, kk))['d']
        if dd <= d['d']: F[k] = dd
    for k, v in (flags or {}).items():
        F[k] = (await P.day_of(pg, v[1]))['d'] if isinstance(v, tuple) and v and v[0] == 'DAY' else v
    for e in done: s['events']['done'][e] = 1; s['events']['last'][e] = d['d'] - 7
    s.update(day=d['d'], weekday=d['wd'], hour=hour, zone=zone, pos=None, weather='clear', stage='law', money=30000, visited={z: True for z in VISITED})
    return s, d


def says(lg, ev=None):
    """事件裡（EVENTS.running＝ev）的 GAME.say 原文 [名字, 句子]"""
    return [[e['n'], e['t']] for e in lg if e['k'] == 'say' and (ev is None or e.get('run') == ev)]


def seq_ok(lines, exp):
    """exp 照順序、連續出現在 lines 裡（startswith）；回傳開始的位置或 -1"""
    ts = [t for _, t in lines]
    for i in range(len(ts) - len(exp) + 1):
        if all(ts[i + j].strip().startswith(x) for j, x in enumerate(exp)): return i
    return -1


def has(lines, x): return any(t.strip().startswith(x) for _, t in lines)


async def play(pg, cdp, run, ev, picks=(), max_s=PLAY_S, hub=False):
    """照玩家點：事件裡的對話點 #dlg、事件的選項照 picks 點；事件結束（evend）以後，據點選單（JP）不點。回傳 (結束了沒, 點過的選項)"""
    t0 = time.time(); picked = []; ended = False
    while time.time() - t0 < max_s:
        lg = await log(pg)
        if any(e['k'] in ('evend', 'everr') and e['t'] == ev for e in lg): ended = True; break
        s = await P.ts(pg)
        if s['phone'] and not s['ch'] and not s['dlg']: await L.phone_away(pg, cdp); continue
        if s['ch'] and s['running'] == ev:
            k, _ = P.pick_of(s['ch'], picks, decline=False); picked.append(s['ch'][k]['t'])
            await P.tap_choice(pg, cdp, k); await pg.wait_for_timeout(900); continue
        if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(650); continue
        await pg.wait_for_timeout(500)
    return ended, picked


async def after_ok(pg, cdp, hub):
    """結束後不卡：3D＝player.busy 回到 false、對話框收起、ADV 關；JP 據點＝EVENTS.running 清掉、據點選單回來（據點本身 sceneBegin，busy 一直是 true＝不是卡住）"""
    t0 = time.time(); s = None
    while time.time() - t0 < 90:
        s = await P.ts(pg); x = await st(pg)
        if s['phone'] and not s['ch'] and not s['dlg']: await L.phone_away(pg, cdp); continue
        if hub:
            if not x['running'] and len(s['ch']) >= 2: return True, dict(s, adv=x['adv'])
        elif not s['busy'] and not s['dlg'] and not x['running'] and not x['adv'] and s['depth'] == 0: return True, dict(s, adv=x['adv'])
        if s['dlg'] and not x['running']: await L.tap(pg, cdp, '#dlg')
        await pg.wait_for_timeout(1000)
    return False, s


async def case_tana(pg, cdp, run, errs, k):
    ok_branch = k == 'tana_ok'
    rep = 3 if ok_branch else 2
    s0, d = await build(pg, '2028-07-07', 18.75, 'jp_hub', dict(JPF, REPAIR={'heroine_01': rep}))
    run.setup('[前置] %s 讀檔 %s 18:45 日本據點 jp_hub（日本路線 JPF、挽回中＝沒有 dating_heroine_01、REPAIR.heroine_01=%d）' % (k, d['key'], rep))
    await P.load(pg, cdp, s0, quiet=True)
    await pg.evaluate(HOOK)
    x0 = await st(pg)
    run.check('%s 前置：人在日本、挽回中、REPAIR=%d、這一版有 %s' % (k, rep, EV_T), x0['inJapan'] and not x0['dating'] and x0['repair'] == rep and x0['hasEvT'], J({k2: x0[k2] for k2 in ('key', 'h', 'zone', 'inJapan', 'dating', 'repair', 'hasEvT')}))
    # 照玩家：18:45 在據點，選單點「快轉」→「到下一個有事的日子」（CDP 觸控）→ 19:00 據點自己演（JP.loop 的 dueStop）。
    # 不直接讀 19:00：11-03 c89 那一次讀 19:00，據點選單已經出來、dueStop 沒有開演，等 240 秒都沒動（選單上時間不走；7224 那一次有開演＝讀檔和據點迴圈的先後不一定）
    t0 = time.time(); started = False; menus = []; ffs = []
    while time.time() - t0 < PROMPT_S:
        lg = await log(pg)
        if any(e['k'] == 'ev' and e['t'] == EV_T for e in lg): started = True; break
        s = await P.ts(pg)
        if s['phone'] and not s['ch'] and not s['dlg']: await L.phone_away(pg, cdp); continue
        if s['dlg'] and not s['ch']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(650); continue
        if s['ch']:
            opts = [o['t'] for o in s['ch']]
            if opts not in menus: menus.append(opts); run.note('%s：畫面上的選單 %s' % (k, J(opts)))
            kk = next((i for i, t in enumerate(opts) if t.startswith('到下一個有事的日子')), None)
            if kk is None and len(ffs) < 6: kk = next((i for i, t in enumerate(opts) if t.startswith('快轉')), None)
            if kk is not None:
                ffs.append(opts[kk][:12]); run.note('%s：點「%s」（像玩家；遊戲時間 %s）' % (k, opts[kk], J(await P.clock(pg))))
                await P.tap_choice(pg, cdp, kk); await pg.wait_for_timeout(1500); continue
        await pg.wait_for_timeout(1000)
    lg = await log(pg)
    run.check('%s：18:45 據點選單照玩家點「快轉→到下一個有事的日子」→ 7/7 19:00 據點自己演 %s（JP.playStop g7_tanabata，沒有用捷徑）' % (k, EV_T), started,
              J({'taps': ffs, 'stops': [e['t'] for e in lg if e['k'] == 'stop'], 'evs': [e['t'] for e in lg if e['k'] == 'ev'], 'clock': await P.clock(pg)}))
    if not started:
        await run.shot(pg, k + '_not_started'); return
    await pg.wait_for_timeout(1500); await run.shot(pg, k + '_first')
    ended, picked = await play(pg, cdp, run, EV_T, hub=True)
    await run.shot(pg, k + '_end')
    lg = await log(pg); L_ = says(lg, EV_T); x = await st(pg)
    run.note('%s：GAME.say %s；選項 %s' % (k, J(L_), J(picked)))
    run.check('%s：事件演完（%d 秒內）' % (k, PLAY_S), ended and x['done'].get(EV_T, 0) >= 1, J({'ended': ended, 'done': x['done'].get(EV_T)}))
    run.check('%s：沒有選項（AA_600 3-2：「再一次。」祐廷寫、「好。」她寫，不是玩家選）' % k, not picked and not any(e['k'] == 'choose' and e.get('run') == EV_T for e in lg), J(picked))
    exp = T_HEAD + (T_OK if ok_branch else T_LOW)
    i = seq_ok(L_, exp)
    run.check('%s：台詞照 7224（AA_600 3-2）%s' % (k, J(exp)), i == 0 and len(L_) == len(exp), J({'got': L_}))
    other = T_LOW if ok_branch else T_OK
    run.check('%s：沒有另一支（%s）也沒有舊稿（%s）' % (k, other[0][:12], T_OLD[0]), not any(has(L_, y) for y in other + T_OLD), J({'got': L_}))
    spk = [n for n, t in L_]
    run.check('%s：最後一句是以安說的、前面都是旁白' % k, len(spk) == len(exp) and all(not n for n in spk[:-1]) and bool(spk[-1]), J(spk))
    if ok_branch:
        run.check('tana_ok：旗標 AN_TANABATA_JP_REPAIR=again、AN_JP_RECONCILED、after＝回到交往（dating_heroine_01）',
                  x['tana'] == 'again' and x['recon'] and x['dating'], J({k2: x[k2] for k2 in ('tana', 'recon', 'dating', 'romance', 'repair')}))
    else:
        run.check('tana_low：旗標 AN_TANABATA_JP_REPAIR=hung、沒有 RECONCILED、沒有交往',
                  x['tana'] == 'hung' and not x['recon'] and not x['dating'], J({k2: x[k2] for k2 in ('tana', 'recon', 'dating', 'romance', 'repair')}))
    run.check('%s：這一場不記記憶（7224 的 TANABATA_R 沒有 mem）——以安的記憶沒有新增七夕' % k, not any('TANABATA' in m for m in x['mems']), J(x['mems']))
    ok, s = await after_ok(pg, cdp, hub=True)
    await run.shot(pg, k + '_after')
    run.check('%s：結束後不卡（EVENTS.running 清掉、據點選單回來；據點 sceneBegin 時 busy 本來就是 true）' % k, ok, J(s))


async def case_admin(pg, cdp, run, errs, k='admin'):
    s0, d = await build(pg, '2027-10-27', 21.0, 'dorm', {'AN_ADMIN_NEXT': True, 'AN14': 'there'}, done=('ev_an_admin_court',))
    run.setup('[前置] admin 讀檔 %s 21:00 宿舍；AN_ADMIN_NEXT（10/21 麵店選「下次我也想去。」）、ev_an_admin_court 記成演過' % d['key'])
    await P.load(pg, cdp, s0, quiet=True)
    await P.prep(pg, cdp, run, FRIEND_JS, label='SOCIAL.meet 以安＋熟悉 45、信任 30（FRIEND）')
    await pg.evaluate(HOOK)
    x0 = await st(pg)
    run.check('admin 前置：FRIEND、AN_ADMIN_NEXT、這一版有 %s' % EV_A, x0['stage'] in ('FRIEND', 'CLOSE_FRIEND') and x0['adminNext'] and x0['hasEvA'], J({k2: x0[k2] for k2 in ('key', 'h', 'zone', 'stage', 'adminNext', 'hasEvA', 'reg')}))
    # 等她的私訊（r2y3a3d.js anAdminPhone 21:00）
    t0 = time.time(); got = None
    while time.time() - t0 < PROMPT_S:
        x = await st(pg)
        if any(m['ask'] == 'y3_an_admin' for m in x['msgs']): got = x; break
        s = await P.ts(pg)
        if s['dlg'] and not s['ch']: await L.tap(pg, cdp, '#dlg')
        await pg.wait_for_timeout(1500)
    x = got or await st(pg)
    texts = [m['t'] for m in x['msgs']]
    run.check('admin：10/27 21:00 以安私訊三則（AA_601 §1-2）', bool(got) and seq_ok([['', t] for t in texts], A_MSG) >= 0, J(x['msgs']))
    if not got:
        await run.shot(pg, 'admin_no_msg'); return
    txt = await P.phone_answer(pg, cdp, 'p:heroine_01', '好。')
    await run.shot(pg, 'admin_phone_answered')
    x = await st(pg)
    run.check('admin：手機照玩家點「好。」→ AN_ADMIN_GO', txt is not None and x['adminGo'], J({'answered': txt is not None, 'adminGo': x['adminGo'], 'msgs': x['msgs'][-2:]}))
    await L.close_panels(pg, cdp)
    t0 = time.time()
    while time.time() - t0 < 120 and not (await st(pg))['outing']: await pg.wait_for_timeout(1500)
    x = await st(pg)
    run.check('admin：出遊 y3_an_admin 排進去（2027-11-03 13:50 %s）' % EV_A, bool(x['outing']) and x['outing']['day'] == '2027-11-03' and abs(x['outing']['h'] - (13 + 50 / 60)) < 0.01 and x['outing']['ev'] == EV_A, J(x['outing']))
    if not x['outing']: return
    await P.jump(pg, cdp, run, '2027-11-03', 13.1, 'dorm', pos=None, note='同一份進度（出遊已經約好）跳到出遊那天 13:06 宿舍，不是遊戲裡的睡覺')
    await pg.evaluate(HOOK)
    n0 = len(await log(pg))
    # 照玩家：等「出發：…行政法院…」→ 點
    t0 = time.time(); tapped = False; menus = []
    while time.time() - t0 < PROMPT_S:
        lg = await log(pg, n0)
        if any(e['k'] == 'ev' and e['t'] == EV_A for e in lg): break
        s = await P.ts(pg)
        if s['phone'] and not s['ch'] and not s['dlg']: await L.phone_away(pg, cdp); continue
        if s['ch']:
            kk = next((i for i, o in enumerate(s['ch']) if not o['dim'] and o['t'].startswith('出發') and '行政法院' in o['t']), None)
            if kk is not None and not tapped:
                run.note('admin：遊戲跳出 %s → 點「%s」（像玩家）' % (J([o['t'] for o in s['ch']]), s['ch'][kk]['t']))
                await run.shot(pg, 'admin_prompt'); await P.tap_choice(pg, cdp, kk); tapped = True; await pg.wait_for_timeout(1500); continue
            if [o['t'] for o in s['ch']] not in menus: menus.append([o['t'] for o in s['ch']]); run.note('admin：別的選單（不點）：%s' % J(menus[-1]))
        elif s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(650); continue
        await pg.wait_for_timeout(1000)
    lg = await log(pg, n0)
    started = any(e['k'] == 'ev' and e['t'] == EV_A for e in lg)
    run.check('admin：11/3 遊戲跳出「出發：…行政法院…」照玩家點、%s 開演（沒有用捷徑）' % EV_A, tapped and started, J({'tapped': tapped, 'started': started, 'menus': menus, 'clock': await P.clock(pg)}))
    if not started:
        await run.shot(pg, 'admin_not_started'); return
    cgshot = False; t0 = time.time(); picked = []; ended = False
    while time.time() - t0 < PLAY_S:   # play() 的寫法，多拍一張 CG
        lg = await log(pg, n0)
        if any(e['k'] in ('evend', 'everr') and e['t'] == EV_A for e in lg): ended = True; break
        if not cgshot and any(e['k'] == 'cg' for e in lg): await pg.wait_for_timeout(2500); await run.shot(pg, 'admin_cg29'); cgshot = True
        s = await P.ts(pg)
        if s['phone'] and not s['ch'] and not s['dlg']: await L.phone_away(pg, cdp); continue
        if s['ch'] and s['running'] == EV_A:
            kk, _ = P.pick_of(s['ch'], (A_PICK,), decline=False); picked.append(s['ch'][kk]['t'])
            await run.shot(pg, 'admin_choice'); await P.tap_choice(pg, cdp, kk); await pg.wait_for_timeout(900); continue
        if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(650); continue
        await pg.wait_for_timeout(500)
    await run.shot(pg, 'admin_end')
    lg = await log(pg, n0); L_ = says(lg, EV_A)
    t1 = time.time()
    while time.time() - t1 < 30 and CGID not in (await st(pg))['cg']: await pg.wait_for_timeout(1000)   # G.cg.unlocked 在圖載完才記（adv3d.js ADV.cg 的 loadImage）
    x = await st(pg)
    run.note('admin：GAME.say %s；選項 %s' % (J(L_), J(picked)))
    run.check('admin：事件演完', ended and x['done'].get(EV_A, 0) >= 1, J({'ended': ended, 'done': x['done'].get(EV_A)}))
    exp = A_PRE + A_POST + [A_REPLY]
    run.check('admin：台詞照 AA_601 §2（a 支）', seq_ok(L_, exp) == 0 and len(L_) == len(exp), J({'got': L_}))
    seqk = [('cg', e['t']) if e['k'] == 'cg' else ('say', e['t'][:10]) for e in lg if e.get('run') == EV_A and e['k'] in ('cg', 'say')]
    ci = next((i for i, e in enumerate(seqk) if e == ('cg', CGID)), -1)
    run.check('admin：CG-29（%s）在第二句旁白之後、「一個小時」那一句之前放出來' % CGID, ci == 2 and len(seqk) > 3 and seqk[3][1].startswith('（一個小時'), J(seqk[:6]))
    run.check('admin：CG_REGISTRY 有 CG-29、G.cg.unlocked 記到', bool(x['reg']) and CGID in x['cg'], J({'reg': x['reg'], 'unlocked': x['cg']}))
    run.check('admin：選項三個、點「法官一直讓他講完。」', picked == [A_PICK] and any(e['k'] == 'choose' and len(e['t']) == 3 for e in lg), J({'picked': picked, 'menus': [e['t'] for e in lg if e['k'] == 'choose']}))
    run.check('admin：AN_ADMIN_TOGETHER=there、記憶 AN_ADMIN_TOGETHER、熟悉 +2 信任 +1',
              x['adminTog'] == 'there' and 'AN_ADMIN_TOGETHER' in x['mems'] and x['fam'] - x0['fam'] == 2 and x['trust'] - x0['trust'] == 1,
              J({'adminTog': x['adminTog'], 'mems': x['mems'][-4:], 'fam': [x0['fam'], x['fam']], 'trust': [x0['trust'], x['trust']]}))
    ok, s = await after_ok(pg, cdp, hub=False)
    await run.shot(pg, 'admin_after')
    run.check('admin：結束後不卡（player.busy 回到 false、對話框收起、ADV 關、EVENTS.running 清掉）', ok, J(s))


async def main():
    os.makedirs(OUT, exist_ok=True)
    run = L.Run('cc_an_smoke', OUT)
    print('cc_an_smoke_probe  SHA=%s  URL=%s  CASES=%s' % (SHA, URL, ','.join(CASES)), flush=True)
    t0 = time.time()
    async with async_playwright() as p:
        for k in CASES:
            print('== case %s ==' % k, flush=True)
            for att in range(3):   # SwiftShader 偶爾一開頁就 Page crashed（11-03 第一次跑兩邊都是）：換一個瀏覽器再開，最多三次，次數印出來
                b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
                pg.set_default_timeout(180000)
                cerrs = []
                pg.on('console', lambda m, c=cerrs: c.append(m.text[:200]) if m.type == 'error' else None)
                try:
                    await pg.goto(URL); loaded = await L.wait_loaded(pg, 300); break
                except Exception as e:
                    print('  [開頁失敗 第 %d 次] %s' % (att + 1, str(e).splitlines()[0][:200]), flush=True); loaded = False
                    await b.close()
            try:
                if run.check('%s：遊戲載入' % k, loaded):
                    await P.init(pg)
                    try:
                        if k.startswith('tana'): await case_tana(pg, cdp, run, errs, k)
                        elif k == 'admin': await case_admin(pg, cdp, run, errs)
                        else: run.check('不認得的 case %s' % k, False)
                    except Exception:
                        run.check('%s：探針流程沒有例外' % k, False, traceback.format_exc()[-1500:])
                    lg = await log(pg); fx = (await st(pg))['failed']
                    if cerrs: run.note('%s：console.error（只記，不算 FAIL）%s' % (k, J(cerrs[:6])))
                    run.check('%s：沒有 JS 例外（pageerror、事件 reject、G.events.failed）' % k, not errs and not any(e['k'] == 'everr' for e in lg) and not fx,
                              '; '.join(errs[:5]) + J([e for e in lg if e['k'] == 'everr'][:3]) + J(fx))
            finally:
                await b.close()
    n = len(run.fails)
    print('用時 %d 秒' % (time.time() - t0))
    print('ALL PASS' if n == 0 else 'FAILED %d' % n, flush=True)
    sys.exit(0 if n == 0 else 1)


asyncio.run(main())
