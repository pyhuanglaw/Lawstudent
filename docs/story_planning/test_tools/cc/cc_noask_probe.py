"""CC-B 11-10：使用者 11-10 試玩回報兩項（BB-B 00:44 派，P1）。真的點選操作；Playwright 手機模擬（橫向 844×390、CDP 觸控）≠ iPhone。
SEAT-NO-ASK-1110（1afc519eb）：去上課不再問坐哪裡，直接坐老位子、沒有就中間的位子。四條路：
  phone   手機「今天」→ 那一堂的「去上課」（data-go）
  wake    起床選單「直接去上課」（【捷徑】CLS.queueWake＝睡醒那一刻排起床選單；選單本身照玩家點）
  after   第一堂下課選單「直接去下一堂」（第一堂【捷徑】CLS.goClass＝手機「今天」同一個函式，之後照玩家點）
  onetap  右上「一鍵」→「到下一堂課的教室」→ 確認框「確定」
  每條 _fresh（沒有老位子）、_old（【捷徑】G.courses.seat 記一個離中心最遠的位子當老位子）。
  記：每個跳出來的選單原文（GAME.choose 包一層，只記不改）、GAME.seatMenu 拿到的座位、老位子、中心距離、坐下後姿勢、課有沒有開始／上完、JS 例外。
LUNCH-NO-ASK-1110（42fff6105）：下課「先去吃飯」直接帶去一家。
  lunch_rot   三天（課表上第一堂下課後到下一堂有 60 分鐘以上的日子），每天：第一堂【捷徑】CLS.goClass → 照玩家上完 → 下課選單點「先去吃飯」；
              G.flags.LUNCH_LAST 照遊戲自己記的帶到下一天（換日用讀檔【捷徑】，只帶這個旗標和錢）
  lunch_poor  錢設 50（【捷徑】）→ 同上點「先去吃飯」：不能問、不能吃，畫面要寫原因（記 toast）
  lunch_sk03  大一下第 13 週週五 12:18（AA_350 R2，tests/aa350_r_unit.js 同一組旗標）、沒去經原下：【捷徑】直接叫 CLS.lunchBreak(GAME)（＝下課選單「先去吃飯」那一條的函式）
r2（CC 帳號 A 11-10，BB 08:1x 第 3 項；NOASK_faf1 在電腦上 exit 1、跑滿 240 分鐘逾時）：
  ①電腦跑的是第一版（d9c4227a8，09:06 開跑，比 01:13 UTC 的兩個修正早）——「一天兩堂有座位的課」0 天、「空檔 ≥60 分」0 天；
  ②現在的找法（空檔 ≥1.7 小時）在預設課表只有週一「憲法（上）→體育」（3.3 小時；其他天 12:10→13:20 只有 1.17 小時，下課選單 gap<60 不出「先去吃飯」）：
    舊的只掃 2025-10-06 起 21 天＝只找到 10-20 一天，lunch_rot 要三天＝還是找不到。改成掃 N_DAYS（預設 49）天＝10-20、10-27、11-03 三個週一
    （node 載 faf1 的 src 算 CLS.dayItems 確認過）；LUNCH_DAYS＝'YYYY-MM-DD,...' 可以直接指定日子。
  ③lunch_sk03 卡了好幾個小時沒有結束：加逾時保護——每一項 CASE_S（seat 150、lunch_rot 420、lunch_poor 180、lunch_sk03 150 秒，CASE_S＝數字可以統一改），
    整支 TOTAL_S（預設 1200 秒＝20 分鐘），超過的那一項記 FAIL「逾時保護」，後面沒跑到的記 FAIL「沒跑到」（不是 PASS）；關瀏覽器也有 20 秒上限。
    順序改成 seat_phone_fresh、seat_phone_old、lunch_sk03、lunch_poor、lunch_rot，再來其他 seat（時間不夠時至少每一類都有跑到）。
用法：LW_TESTS=<wt>/tests [CASES=...] [N_DAYS=49] [LUNCH_DAYS=...] [CASE_S=...] [TOTAL_S=1200] python3 cc_noask_probe.py <url> <out>"""
import os, sys, json, asyncio, time, math
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__)))); import bbplay as P
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
ALL = ['seat_phone_fresh', 'seat_phone_old', 'lunch_sk03', 'lunch_poor', 'lunch_rot', 'seat_wake_fresh', 'seat_wake_old', 'seat_after_fresh', 'seat_after_old', 'seat_onetap_fresh', 'seat_onetap_old']
CASE_CAP = {'lunch_rot': 420, 'lunch_poor': 180, 'lunch_sk03': 150}
TOTAL_S = float(os.environ.get('TOTAL_S') or 1200); T_START = time.time()
def case_cap(c): return float(os.environ.get('CASE_S') or CASE_CAP.get(c, 150))
async def safe_close(b):
    try: await asyncio.wait_for(b.close(), 20)
    except BaseException as e: print('  （關瀏覽器 20 秒沒關掉／出錯：%r，不管它）' % e, flush=True)
CASES = [c for c in (os.environ.get('CASES') or ','.join(ALL)).split(',') if c]
J = lambda o: json.dumps(o, ensure_ascii=False, default=str)
FAILS = []
def check(n, ok, info=''):
    print(('PASS ' if ok else 'FAIL ') + n + (('  ' + info) if info else ''), flush=True)
    if not ok: FAILS.append(n)
    return ok
def setup(s): print('  [前置／捷徑] ' + s, flush=True)
def note(s): print('  ' + s, flush=True)

BASEF = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True, 'metAn': True, 'met_an': True, 'MET_ZHE': True,
         'zheNoodleDone': True, 'KX_FIRST_MSG': True, 'KX_EVE_MSG': True, 'FAM_GROUP_SENT': True, 'CEREMONY_Y1': True, 'KAI_MOVEIN': True, 'LAW_RECAP_SEEN': True,
         'fundsV2': 1, 'KX_DEC3_MIGRATED': True, 'dating_kexin': False}
VISITED = ('noodle', 'cafe', 'library_hall', 'library', 'lawlib', 'wancai', 'linze', 'gongguan', 'wenzhou', 'soclib', 'cvs', 'bookstore', 'classroom', 'dorm', 'dorm_hall')
SEATWORDS = ('老位子', '坐中間', '坐在', '自己找位子')

def mkstate(d, h, zone, money=30000, flags=None, courses=None, stage='law'):
    st = {'name': '祐廷', 'energy': 100, 'events': {'done': {}, 'last': {}, 'count': 0}, 'contacts': {}, 'flags': dict(BASEF, **(flags or {}))}
    st.update(day=d['d'], weekday=d['wd'], hour=h, zone=zone, pos=None, weather='clear', stage=stage, money=money)
    st['visited'] = {z: True for z in VISITED}
    st['courses'] = courses or {'done': {}, 'attend': {}, 'prep': {}, 'electives': {}, 'note': {}, 'disc': {}, 'ask': {}, 'late': {}, 'abs': {}, 'exam': {}, 'grades': {}}
    return st

HOOK = r"""(()=>{ if(window.__NA) return 'again'; const W=window.__NA={choose:[],seat:[],toast:[],caption:[],say:[],lunch:[]};
  const t=()=>{ const G=GAME.G; return {h:+(+G.hour).toFixed(3),d:G.day,z:G.zone,m:G.money}; };
  const wrap=(o,fn,f)=>{ const f0=o&&o[fn]; if(typeof f0!=='function') return false; o[fn]=function(){ try{ f.apply(null,arguments); }catch(e){} return f0.apply(this,arguments); }; return true; };
  const r={choose:wrap(GAME,'choose',o=>W.choose.push(Object.assign({t:(o||[]).filter(x=>x&&!x.hidden).map(x=>x.t||x.text||'')},t()))),
    seatMenu:wrap(GAME,'seatMenu',(it,so)=>{ const s=it&&it.seat; W.seat.push(Object.assign({x:s&&+(+s.x).toFixed(2),z:s&&+(+s.z).toFixed(2),lv:s&&s.lv|0,room:s&&s.room||null,so:so||null},t())); }),
    toast:wrap(GAME,'toast',(s)=>W.toast.push(Object.assign({s:String(s)},t()))),
    caption:wrap(GAME,'caption',(w,s)=>W.caption.push(Object.assign({s:String(s==null?'':s)},t()))),
    say:wrap(GAME,'say',(w,s)=>W.say.push(Object.assign({n:(w&&w.name)||(typeof w==='string'?w:''),s:String(s==null?'':s)},t()))),
    lunch:wrap(CLS,'lunchBreak',(GM,want)=>W.lunch.push(Object.assign({want:want||null,last:(GAME.G.flags||{}).LUNCH_LAST||null},t())))};
  return r; })()"""
ITEMS = """(d=>{ const G=GAME.G; return CLS.dayItems(G,d).filter(i=>!i.exam).map(i=>({key:i.key,c:i.c.name,id:i.c.id,t0:i.t0,t1:i.t1,zone:i.room&&i.room.zone||null,room:i.room&&i.room.name||null,door:!!(i.room&&i.room.door),off:!!(i.room&&i.room.offsite),pe:!!(CLS.peGoClass&&CLS.peGoClass(G,i))})); })"""
SEATS = """(()=>{ const E=GAME.E, G=GAME.G; const its=E.interactables.filter(q=>q.seat); if(!its.length) return null; const cx=its.reduce((a,q)=>a+q.seat.x,0)/its.length, cz=its.reduce((a,q)=>a+q.seat.z,0)/its.length;
  return {zone:G.zone,n:its.length,cx:+cx.toFixed(2),cz:+cz.toFixed(2),seats:its.map(q=>({x:+q.seat.x.toFixed(2),z:+q.seat.z.toFixed(2),lv:q.seat.lv|0,room:q.seat.room||null}))}; })()"""
PST = """(k=>{ const G=GAME.G, E=GAME.E, P=E.player, R=CLS.rec(G); const s=P.seat; return {zone:G.zone,h:+(+G.hour).toFixed(3),seat:s?{x:+(+s.x).toFixed(2),z:+(+s.z).toFixed(2),lv:s.lv|0}:null,pose:P.pose||null,
  y:+P.obj.position.y.toFixed(2),classNow:!!(G.flags&&G.flags.classNow),done:!!R.done[k],attend:R.attend?R.attend[k]||null:null,mem:R.seat||null}; })"""

def good_class(i): return bool(i['zone']) and not i['door'] and not i['off'] and not i['pe']

async def find_days(pg, start_key, n_days=int(os.environ.get('N_DAYS') or 49)):
    d0 = await P.day_of(pg, start_key); out = []
    for k in range(n_days):
        dd = d0['d'] + k; its = await pg.evaluate(ITEMS, dd)
        cl = [i for i in its if good_class(i)]
        k = await pg.evaluate("d=>{ const c=CALENDAR.dateOf(d), w=c.wd; return {key:c.key, wd:w===7?0:w}; }", dd)
        out.append({'d': dd, 'items': its, 'cls': cl, 'date': k['key'], 'wd': k['wd']})
    return d0, out

async def drive(pg, cdp, done_js, maxs, prefs, log, stop_on=None):
    """點對話、選單照 prefs（字首）點；stop_on(選單文字列) 回 True 就停下來交給呼叫的人"""
    t0 = time.time()
    while time.time() - t0 < maxs:
        if await pg.evaluate(done_js): return 'done'
        s = await P.ts(pg)
        if s.get('phone') and not s['dlg'] and not s['ch']:
            await L.phone_away(pg, cdp, tries=2); continue
        if s['ch']:
            await pg.wait_for_timeout(400); s = await P.ts(pg)
            if not s['ch']: continue
            txt = [o['t'] for o in s['ch']]
            if stop_on and stop_on(txt): return s
            k = 0
            for pf in prefs:
                m = [j for j, o in enumerate(s['ch']) if o['t'].startswith(pf) and not o['dim']]
                if m: k = m[0]; break
            log.append([txt, txt[k]]); note('選單 %s → %s' % (J(txt), txt[k]))
            await P.tap_choice(pg, cdp, k); await pg.wait_for_timeout(1200); continue
        if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(600); continue
        await pg.wait_for_timeout(700)
    return 'timeout'

async def seat_case(p, case, plan):
    path, var = case.split('_')[1], case.split('_')[2]
    b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
    pg.on('dialog', lambda dd: asyncio.ensure_future(dd.accept()))
    try:
        await pg.goto(URL); check('%s：遊戲載入' % case, await L.wait_loaded(pg)); await pg.evaluate("localStorage.clear()"); await P.init(pg)
        day, first, tgt = plan['day'], plan['first'], plan['second'] if path == 'after' else plan['first']
        dk = {'d': day['d'], 'wd': day['wd']}
        courses = None
        if var == 'old':
            setup('%s：先讀到 %s 的教室（%s）讀座位表，挑離中心最遠的一個當「%s」的老位子（G.courses.seat，和遊戲 rememberSeat 同格式）' % (case, tgt['zone'], tgt['room'], tgt['c']))
            await L.load_state(pg, mkstate(dk, tgt['t0'] - 0.05, tgt['zone']), quiet_phone=True); await pg.wait_for_timeout(5000)
            sl = await pg.evaluate(SEATS)
            if not check('%s：教室有座位' % case, bool(sl), J(sl)[:200]): return
            far = max(sl['seats'], key=lambda s: math.hypot(s['x'] - sl['cx'], s['z'] - sl['cz']))
            courses = {'done': {}, 'attend': {}, 'prep': {}, 'electives': {}, 'note': {}, 'disc': {}, 'ask': {}, 'late': {}, 'abs': {}, 'exam': {}, 'grades': {},
                       'seat': {tgt['id']: {'zone': sl['zone'], 'room': far['room'], 'x': far['x'], 'z': far['z'], 'lv': far['lv']}}}
            note('%s：老位子設成 %s（中心 %s,%s，%d 個位子）' % (case, J(far), sl['cx'], sl['cz'], sl['n']))
        if path == 'wake': h0, zone = 7.2, 'dorm'
        elif path == 'after': h0, zone = first['t0'] - 0.05, first['zone']
        else: h0, zone = tgt['t0'] - 0.6, 'campus'
        setup('%s：最小存檔 %s %.2f %s（條件事件照常，只關要回覆訊息自動打開手機）' % (case, plan['key'], h0, zone))
        await L.load_state(pg, mkstate(dk, h0, zone, courses=courses), quiet_phone=True); await pg.wait_for_timeout(5000)
        try: await L.phone_away(pg, cdp, tries=2)
        except Exception: pass
        hk = await pg.evaluate(HOOK); check('%s：記錄鉤子都掛上' % case, isinstance(hk, dict) and hk.get('choose') and hk.get('seatMenu'), J(hk))
        log = []
        if path == 'phone':
            await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(1000)
            await L.tap(pg, cdp, '#phoneTabs [data-ptab="today"]'); await pg.wait_for_timeout(1200)
            btn = await pg.evaluate("(k=>{ const e=document.querySelector('#phoneBody [data-go=\"'+k+'\"]'); return e?e.textContent.trim():null; })", tgt['key'])
            check('%s：手機「今天」有那一堂的按鈕（%s）' % (case, btn), bool(btn))
            if btn: await L.tap(pg, cdp, '#phoneBody [data-go="%s"]' % tgt['key']); note('%s：點手機「%s」' % (case, btn))
        elif path == 'wake':
            await pg.evaluate("void CLS.queueWake(GAME)"); setup('%s：CLS.queueWake（睡醒那一刻）' % case)
        elif path == 'after':
            setup('%s：第一堂 %s：CLS.goClass（手機「今天」同一個函式），之後照玩家點' % (case, first['c']))
            await pg.evaluate("(k=>{ const it=CLS.dayItems(GAME.G,GAME.G.day).find(q=>q.key===k); if(it) void CLS.goClass(GAME,it,{}); })", first['key'])
        elif path == 'onetap':
            await L.tap(pg, cdp, '#btnGo'); await pg.wait_for_timeout(900)
            sub = await pg.evaluate("(()=>{ const e=document.querySelector('#goPop [data-gok=\"cls\"]'); return e?e.textContent.trim():null; })()")
            note('%s：一鍵選單「到下一堂課的教室」：%s' % (case, sub))
            await L.tap(pg, cdp, '#goPop [data-gok="cls"]'); await pg.wait_for_timeout(1200)
            cf = await pg.evaluate("(()=>{ const b=document.getElementById('goConfirm'); return b&&!b.classList.contains('hide')?b.textContent.trim().slice(0,160):null; })()")
            note('%s：確認框：%s' % (case, cf)); check('%s：跳出確認框' % case, bool(cf))
            await pg.wait_for_timeout(600); await L.tap(pg, cdp, '#goCfYes')
        prefs = ('直接去上課', '直接去下一堂', '繼續去上課') + SEATWORDS
        seated_js = "(k=>{ const P=GAME.E.player; return !!P.seat&&GAME.G.zone!=='campus'&&!!CLS.dayItems(GAME.G,GAME.G.day).find(q=>q.key===k); })(%s)" % J(tgt['key'])
        if path == 'after':
            r = await drive(pg, cdp, "false", 1500, ('坐中間', '老位子'), log, stop_on=lambda t: any(x.startswith('直接去下一堂') for x in t))
            if not check('%s：第一堂下課選單有「直接去下一堂」' % case, isinstance(r, dict), J(r)[:200]): return
            k = next(j for j, o in enumerate(r['ch']) if o['t'].startswith('直接去下一堂')); note('%s：下課選單 %s → %s' % (case, J([o['t'] for o in r['ch']]), r['ch'][k]['t']))
            n0 = len(await pg.evaluate("window.__NA.seat")); await P.tap_choice(pg, cdp, k); await pg.wait_for_timeout(1500)
        else: n0 = 0
        # 等到 seatMenu 被叫（＝坐下）
        t0 = time.time(); seatrec = None
        while time.time() - t0 < 900:
            sr = await pg.evaluate("window.__NA.seat")
            if len(sr) > n0: seatrec = sr[n0]; break
            s = await P.ts(pg)
            if s['ch']:
                await pg.wait_for_timeout(400); s = await P.ts(pg)
                if s['ch']:
                    txt = [o['t'] for o in s['ch']]; k = 0
                    for pf in prefs:
                        m = [j for j, o in enumerate(s['ch']) if o['t'].startswith(pf)]
                        if m: k = m[0]; break
                    log.append([txt, txt[k]]); note('%s：選單 %s → %s' % (case, J(txt), txt[k])); await P.tap_choice(pg, cdp, k); await pg.wait_for_timeout(1200); continue
            elif s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(600); continue
            await pg.wait_for_timeout(700)
        ch = await pg.evaluate("window.__NA.choose")
        seatmenus = [c for c in ch if any(any(x.startswith(w) for w in SEATWORDS) for x in c['t'])]
        check('%s：沒有跳出「坐哪裡」的選單（所有選單原文 %s）' % (case, J([c['t'] for c in ch])), not seatmenus, J(seatmenus))
        if not check('%s：有直接坐下（GAME.seatMenu 被叫）' % case, bool(seatrec), ''): return
        await pg.wait_for_timeout(4000); ps = await pg.evaluate(PST, tgt['key'])
        await pg.screenshot(path=os.path.join(OUT, 'noask_%s_seated.png' % case))
        sl = await pg.evaluate(SEATS)
        if var == 'old':
            mem = courses['seat'][tgt['id']]
            check('%s：坐老位子（%s,%s）' % (case, mem['x'], mem['z']), abs(seatrec['x'] - mem['x']) < 0.3 and abs(seatrec['z'] - mem['z']) < 0.3, J(seatrec))
        elif sl:
            ds = sorted(math.hypot(s['x'] - sl['cx'], s['z'] - sl['cz']) for s in sl['seats']); dme = math.hypot(seatrec['x'] - sl['cx'], seatrec['z'] - sl['cz'])
            rank = sum(1 for v in ds if v < dme - 1e-6)
            check('%s：沒有老位子＝坐中間（離中心 %.2f m，%d 個位子裡第 %d 近；有人坐的跳過）' % (case, dme, len(ds), rank + 1), rank <= 6, J(seatrec))
        check('%s：坐姿（player.seat 有、姿勢 %s、y %s）' % (case, ps['pose'], ps['y']), bool(ps['seat']) and ps['pose'] in (None, 'sit'), J(ps))
        r = await drive(pg, cdp, "(k=>!!CLS.rec(GAME.G).done[k])(%s)" % J(tgt['key']), 1500, ('坐中間', '老位子'), log, stop_on=lambda t: any(x.startswith(('直接去下一堂', '先去吃飯', '回去', '在附近')) for x in t))
        ps2 = await pg.evaluate(PST, tgt['key'])
        check('%s：課有開始、上完（%s done）' % (case, tgt['c']), ps2['done'] or isinstance(r, dict), J(ps2)[:200])
        check('%s：沒有 JS 例外' % case, not errs, J(errs[:3]))
    finally:
        await safe_close(b)

async def lunch_once(pg, cdp, case, tag, plan, money, flags):
    day, first = plan['day'], plan['first']; dk = {'d': day['d'], 'wd': day['wd']}
    setup('%s：最小存檔 %s %.2f %s，錢 %d，旗標 %s' % (tag, plan['key'], first['t0'] - 0.05, first['zone'], money, J(flags)))
    await L.load_state(pg, mkstate(dk, first['t0'] - 0.05, first['zone'], money=money, flags=flags), quiet_phone=True); await pg.wait_for_timeout(5000)
    try: await L.phone_away(pg, cdp, tries=2)
    except Exception: pass
    await pg.evaluate(HOOK)
    setup('%s：第一堂 %s：CLS.goClass（手機「今天」同一個函式），之後照玩家點' % (tag, first['c']))
    await pg.evaluate("(k=>{ const it=CLS.dayItems(GAME.G,GAME.G.day).find(q=>q.key===k); if(it) void CLS.goClass(GAME,it,{}); })", first['key'])
    log = []
    r = await drive(pg, cdp, "false", 1500, ('坐中間', '老位子'), log, stop_on=lambda t: any(x.startswith(('先去吃飯', '直接去下一堂')) for x in t))
    if not check('%s：下課選單有「先去吃飯」（%s）' % (tag, J(r['ch'] and [o['t'][:16] for o in r['ch']]) if isinstance(r, dict) else r), isinstance(r, dict) and any(o['t'].startswith('先去吃飯') for o in r['ch']), ''): return None
    txt = [o['t'] for o in r['ch']]; k = next(j for j, o in enumerate(r['ch']) if o['t'].startswith('先去吃飯'))
    note('%s：下課選單原文 %s → 點「%s」' % (tag, J(txt), txt[k]))
    m0 = await pg.evaluate("GAME.G.money"); nc = len(await pg.evaluate("window.__NA.choose")); nt = len(await pg.evaluate("window.__NA.toast")); ncap = len(await pg.evaluate("window.__NA.caption")); nsay = len(await pg.evaluate("window.__NA.say"))
    await P.tap_choice(pg, cdp, k)
    t0 = time.time()
    while time.time() - t0 < 60:
        await pg.wait_for_timeout(800); s = await P.ts(pg)
        if s['dlg']: await pg.wait_for_timeout(1200); await pg.screenshot(path=os.path.join(OUT, 'noask_%s_meal.png' % tag)); await L.tap(pg, cdp, '#dlg'); break
        if s['ch']: break
    await pg.wait_for_timeout(2500)
    W = await pg.evaluate("window.__NA")
    newch = W['choose'][nc:]; toasts = [x['s'] for x in W['toast'][nt:]]; caps = [x['s'] for x in W['caption'][ncap:] if x['s']]; says = [x['s'] for x in W['say'][nsay:]]
    m1 = await pg.evaluate("GAME.G.money"); last = await pg.evaluate("(GAME.G.flags||{}).LUNCH_LAST||null")
    res = {'menusAfterEat': [c['t'] for c in newch], 'toasts': toasts, 'captions': caps[:4], 'says': says[:3], 'money': [m0, m1], 'LUNCH_LAST': last, 'lunch': W['lunch'][-1:] }
    note('%s：點了以後 %s' % (tag, J(res)))
    check('%s：點「先去吃飯」以後沒有問吃哪家（之後的選單 %s）' % (tag, J(res['menusAfterEat'])), not any(any(n in ' '.join(c) for n in ('小松', '學活', '公館燒臘', '便利商店')) for c in res['menusAfterEat']), '')
    return res

async def lunch_case(p, case, plans):
    b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
    pg.on('dialog', lambda dd: asyncio.ensure_future(dd.accept()))
    try:
        await pg.goto(URL); check('%s：遊戲載入' % case, await L.wait_loaded(pg)); await pg.evaluate("localStorage.clear()"); await P.init(pg)
        if case == 'lunch_rot':
            got = []; last = None; money = 30000
            for i, pl in enumerate(plans[:3]):
                fl = {'LUNCH_LAST': last} if last else {}
                if i: setup('%s：換到下一天（讀檔），只帶遊戲自己記的 LUNCH_LAST＝%s 和錢' % (case, last))
                r = await lunch_once(pg, cdp, case, '%s 第%d天 %s' % (case, i + 1, pl['key']), pl, money, fl)
                if not r: return
                meal = r['LUNCH_LAST']; got.append(meal); last = meal; money = r['money'][1]
                check('%s 第%d天：直接去吃了一家（%s，扣 %d 元、字幕 %s）' % (case, i + 1, meal, r['money'][0] - r['money'][1], J(r['captions'][:2])), bool(meal) and r['money'][1] < r['money'][0], '')
            check('%s：三天不連著同一家（%s）' % (case, ' → '.join(map(str, got))), all(got[j] != got[j + 1] for j in range(len(got) - 1)), '')
        elif case == 'lunch_poor':
            r = await lunch_once(pg, cdp, case, case, plans[0], 50, {})
            if r:
                check('%s：錢 50 不吃（錢沒變 %s）' % (case, r['money']), r['money'][0] == r['money'][1], '')
                check('%s：畫面寫了沒吃的原因（toast %s）' % (case, J(r['toasts'])), any('錢不夠' in t for t in r['toasts']), '')
        check('%s：沒有 JS 例外' % case, not errs, J(errs[:3]))
    finally:
        await safe_close(b)

async def sk03_case(p):
    case = 'lunch_sk03'
    b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
    try:
        await pg.goto(URL); check('%s：遊戲載入' % case, await L.wait_loaded(pg)); await pg.evaluate("localStorage.clear()"); await P.init(pg)
        info = await pg.evaluate("(()=>{ const F2=STORY.termDay('Y1S2',2,5), F13=STORY.termDay('Y1S2',13,5); const w=CALENDAR.dateOf(F13).wd; return {F2,F13,wd:w===7?0:w}; })()")
        fl = {'P4D_ANSWER': 'retake', 'ECON_HALLWAY_DAY': info['F2'], 'MET_XUN': True, 'MET_PINYU': True, 'SK03_FIRST': True, 'SK03_N': 0}
        setup('%s：最小存檔 大一下第 13 週週五（day %d）12:18 在 classroom，旗標照 tests/aa350_r_unit.js 的 base（%s），沒去經原下' % (case, info['F13'], J(fl)))
        await L.load_state(pg, mkstate({'d': info['F13'], 'wd': info['wd']}, 12.3, 'classroom', flags=fl), quiet_phone=True); await pg.wait_for_timeout(5000)
        await pg.evaluate(HOOK)
        pre = await pg.evaluate("(()=>{ const G=GAME.G; const it=CLS.dayItems(G).find(q=>q.c&&q.c.id==='econ_principles_2'&&!q.exam); const ev=CLS.sk03Huoda(G); return {econ:it?{key:it.key,done:!!CLS.rec(G).done[it.key]}:null, sk03:ev?ev.id:null}; })()")
        note('%s：叫之前 %s' % (case, J(pre)))
        setup('%s：CLS.lunchBreak(GAME)（下課選單「先去吃飯」那一條的同一個函式；不指定吃哪家）' % case)
        await pg.evaluate("window.__LB=null; CLS.lunchBreak(GAME).then(r=>window.__LB=r, e=>window.__LB='err '+e)")
        log = []
        await drive(pg, cdp, "window.__LB!==null&&!GAME.D.active", 300, (), log)
        W = await pg.evaluate("window.__NA"); r = await pg.evaluate("({r:window.__LB, last:(GAME.G.flags||{}).LUNCH_LAST, huoda:(GAME.G.flags||{}).SK03_HUODA, done:!!(GAME.G.events&&GAME.G.events.done&&GAME.G.events.done.ev_sk03_lunch), money:GAME.G.money})")
        note('%s：結果 %s；台詞前三句 %s；選單 %s' % (case, J(r), J([x['n'] + '：' + x['s'] for x in W['say'][:3]]), J([c['t'] for c in W['choose']])))
        check('%s：SK03 還沒演＝直接去學活（LUNCH_LAST %s）' % (case, r['last']), r['last'] == '學活', '')
        check('%s：在學活演了 ev_sk03_lunch（SK03_HUODA %s、done %s）' % (case, r['huoda'], r['done']), bool(r['huoda']) and r['done'], '')
        check('%s：沒有問吃哪家' % case, not any(any(n in ' '.join(c['t']) for n in ('小松', '公館燒臘', '便利商店')) for c in W['choose']), J([c['t'] for c in W['choose']]))
        check('%s：沒有 JS 例外' % case, not errs, J(errs[:3]))
    finally:
        await safe_close(b)

async def main():
    real = os.popen('git -C "%s" rev-parse --short HEAD 2>/dev/null' % os.path.join(os.environ['LW_TESTS'], '..')).read().strip()
    print('CC-B 不問座位／不問吃哪家：worktree %s；Playwright ≠ iPhone' % (real or '?'), flush=True)
    async def scan_days(p):
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        try:
            await pg.goto(URL); await L.wait_loaded(pg); await P.init(pg)
            await L.load_state(pg, mkstate(await P.day_of(pg, os.environ.get('DAY0') or '2025-10-06'), 9, 'campus'), quiet_phone=True); await pg.wait_for_timeout(3000)
            return await find_days(pg, os.environ.get('DAY0') or '2025-10-06')
        finally:
            await safe_close(b)
    async with async_playwright() as p:
        try: d0, days = await asyncio.wait_for(scan_days(p), 240)
        except asyncio.TimeoutError:
            check('找日子 240 秒內做完（逾時保護）', False); print('FAILED %d: %s' % (len(FAILS), '；'.join(FAILS)), flush=True); sys.exit(1)
    pairs = []; seatplan = None; afterplan = None
    for dd in days:
        its = [i for i in dd['items'] if not i['off']]
        mk = lambda a, c: {'day': {'d': dd['d'], 'wd': dd['wd']}, 'key': 'day %d %s（週%d）' % (dd['d'], dd['date'], dd['wd']), 'date': dd['date'], 'first': a, 'second': c, 'gap': (c['t0'] - a['t1']) if c else None}
        if seatplan is None and its and good_class(its[0]): seatplan = mk(its[0], its[1] if len(its) > 1 else None)
        if afterplan is None:
            for i in range(len(its) - 1):
                if good_class(its[i + 1]): afterplan = mk(its[i], its[i + 1]); break
        for i in range(len(its) - 1):
            if its[i + 1]['t0'] - its[i]['t1'] >= float(os.environ.get('LUNCH_GAP') or 1.7): pairs.append(mk(its[i], its[i + 1])); break
    if os.environ.get('LUNCH_DAYS'):
        want = set(x.strip() for x in os.environ['LUNCH_DAYS'].split(',') if x.strip())
        pairs = [pl for pl in pairs if pl['date'] in want]
        setup('LUNCH_DAYS 指定吃飯的日子：%s' % J(sorted(want)))
    note('吃飯的日子（第一堂下課到下一堂 ≥%s 小時）：%s' % (os.environ.get('LUNCH_GAP') or 1.7, J([[pl['date'], pl['first']['c'], pl['second']['c'], round(pl['gap'], 2)] for pl in pairs])))
    note('找到的日子：第一堂就是有座位的課 %s；下一堂是有座位的課 %s；空檔 ≥60 分 %d 天' % (J(seatplan and [seatplan['key'], seatplan['first']['c']]), J(afterplan and [afterplan['key'], afterplan['first']['c'], afterplan['second']['c']]), len(pairs)))
    async with async_playwright() as p:
        for c in CASES:
            print('===== %s =====' % c, flush=True)
            left = TOTAL_S - (time.time() - T_START)
            if left < 30:
                check('%s：沒跑到（總時間保護 TOTAL_S=%d 秒已用完；不是 PASS，可以用 CASES=%s 單獨重跑）' % (c, TOTAL_S, c), False); continue
            cap = min(case_cap(c), left); t1 = time.time()
            try:
                if c.startswith('seat_'):
                    sp = afterplan if '_after_' in c else seatplan
                    if check('%s：找得到要的日子' % c, bool(sp)): await asyncio.wait_for(seat_case(p, c, sp), cap)
                elif c == 'lunch_sk03': await asyncio.wait_for(sk03_case(p), cap)
                else:
                    if check('%s：找得到空檔 ≥60 分的日子（%d 天）' % (c, len(pairs)), len(pairs) >= (3 if c == 'lunch_rot' else 1)): await asyncio.wait_for(lunch_case(p, c, pairs), cap)
            except asyncio.TimeoutError:
                check('%s：%d 秒內跑完（逾時保護：停在半路，上面最後一行是停下來的地方；這一項沒測完）' % (c, cap), False)
            except Exception as e:
                import traceback; traceback.print_exc(); check('%s：沒有例外' % c, False, repr(e)[:200])
            note('%s 用了 %.0f 秒（總共 %.0f 秒）' % (c, time.time() - t1, time.time() - T_START))
    print('ALL PASS' if not FAILS else 'FAILED %d: %s' % (len(FAILS), '；'.join(FAILS)), flush=True)
    sys.exit(1 if FAILS else 0)

asyncio.run(main())
