# -*- coding: utf-8 -*-
"""CC（帳號 A）11-03：AA_605 三項（企劃線 claude/story-planning 2df4b7654「AA_605_使用者1103實玩回報_老師不認人_通識_便利貼.md」；開發分支 a62eadfa9，f8d129d51 有）的瀏覽器探針。
修改前對照：0f66c4215（三項預期都 FAIL）。
實作位置（f8d129d51）：
  ① src/data/jp_events.js:133  REDO_INS（ev_jp_redo_insurance，jp_events.js:150：trigger 'class'、beforeClass 'insurance_re'、term Y4S2、once）第一句改「（保險法的補修班。你坐在最後一排……）」
     上課前事件由 src/classes3d.js:303 S.attend → S.beforeClassEvent（classes3d.js:393-397）演。insurance_re＝courses.js:124（週四上午 萬才館多功能教室，日本路線）。
  ② src/data/events.js:4746  ev_course_selection 加 retired:true（events3d.js:50 X.check 遇到 retired 一律 false）；
     src/classes3d.js:706-707  S.selectTerm 大一下拿掉「城市與散步——備取三」「選上的是「天文與我們」」兩句（selectTerm 由 classes3d.js:732 S.morning 在第 1 週前一晚睡醒時叫）。
     注意：courses.js:74 通識「天文與我們」（ge_y1s2）這門課本身沒有拿掉，手機課表會列出來——AA_605 沒有要改它，這裡只記 INFO。
  ③ src/data/events.js:1116-1130  ev_sk04_note1／note2／note3／reveal（beforeClass 'english_y1'，大一上週四上午 共同教學館）各加開頭旁白、note1 便利貼多半句。

不是 iPhone：Playwright 手機橫向模擬（SwiftShader）。前置用讀檔（GAME.applySave，標【前置】）；觸發那一步照玩家：手機「今天」→「直接去上課」、點地面走到門口按互動鈕、
按「睡覺」選睡到早上、點對話、點選項。台詞讀 GAME.say 的原文（包住 GAME.say／choose 只記錄），和 AA_605 原稿逐字比（完全相等；舊句子用 includes 找）。
CASES（逗號隔開，每個 case 開一個新的瀏覽器）：
  ins        【前置】最小存檔：日本路線（EXCHANGE_ROUTE JP、EXCH_RULE 1）大四下第 INS_WEEK 週（預設 1，那天沒有那一堂就往後找到第 4 週）週四 08:00 宿舍、條件事件關掉
             → 手機「今天」保險法那一列「直接去上課」→ 照玩家上完。驗：ev_jp_redo_insurance 的第一句＝新句、沒有舊句「交換回來的？」。
  sel_enter  【前置】大一上 2025-09-27（六）08:30，宿舍大樓（dorm_hall）二樓 203 門外約 2 m（條件事件照開）→ 走到門口按「回房間（203）」→ 進房間（trigger enter）。
             驗：ev_course_selection 沒有演、這一段台詞沒有「城市與散步」「天文與我們」、存檔（GAME.snapshot）裡沒有「城市與散步」。
  sel_y1s2   【前置】大一下開學前一晚 2026-02-22（日）22:30 宿舍房間 → 走到「睡覺」按 → 選「睡到明天早上…」→ 醒來（成績單、選課結果照玩家點完；起床選單選「先起床」）。
             驗：有「選課結果出來了：大一下。」、這一段台詞和選項沒有「城市與散步」「天文與我們」；手機「今天」「課表」：「城市與散步」不能出現（FAIL）、「天文與我們」只記 INFO。
  notes      【前置】大一上第 4 週週四 08:00 宿舍（條件事件關掉）→ 手機「今天」大一英文「直接去上課」→ note1 選「椅子也是。」；
             【前置】同一份進度跳到第 5 週週四 → note2 選「英文也是。」；第 6 週 → note3；第 15 週 → reveal。每張驗開頭旁白逐字、note1 的便利貼逐字。
原稿：AA605_MD＝AA_605 原稿的檔案路徑（有給就先確認探針裡的期望句子逐字在原稿裡；沒給只用探針裡抄的句子）。
用法：LW_TESTS=<工作樹>/tests SHA=<sha> [CASES=ins,sel_enter,sel_y1s2,notes] [AA605_MD=<md>] python3 cc_aa605_probe.py <URL index.html> <輸出資料夾>
  URL 不要帶 ?turbo（真實上課流程）；有帶會拿掉（TURBO=1 才保留）。
等待上限（秒）：TRIP_MAX（一趟上課 1500）、STUCK_S（240）、WAKE_MAX（睡覺到醒來選課 900）。
輸出：<輸出>/transcript_<case>.json（逐字稿：say／choose／ev／attend…）、截圖。每項一行 PASS／FAIL，最後 ALL PASS 或 FAILED n，exit 0／1。"""
import os, sys, json, asyncio, time, traceback
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L  # noqa: E402
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__)))); import bbplay as P  # noqa: E402  bbplay 在上一層（BB 的 test_tools）
from playwright.async_api import async_playwright  # noqa: E402

URL0, OUT = sys.argv[1], sys.argv[2]
J = lambda o: json.dumps(o, ensure_ascii=False)
ENVI = lambda k, d: int(os.environ.get(k, str(d)))
CASES = [c.strip() for c in os.environ.get('CASES', 'ins,sel_enter,sel_y1s2,notes').split(',') if c.strip()]
LAND = {'width': 844, 'height': 390}; PORT = {'width': 390, 'height': 844}
WD = ['日', '一', '二', '三', '四', '五', '六']

# ---------------------------------------------------------------- AA_605 原稿（逐字抄；AA605_MD 有給就核對）
INS_NEW = '（保險法的補修班。你坐在最後一排，抄下這學期剩下的上課日期。）'
INS_OLD = '交換回來的？'
GE_WORDS = ('城市與散步', '天文與我們')
SEL_LINE = '選課結果出來了：大一下。'
NOTES = {   # 事件 id: (第一句旁白, 之後要逐字相等的句子（可省略）, 選項)
    'ev_sk04_note1': ('（這間教室下午是舊序章系所的課。你坐的位子，桌角貼著一張便利貼——是下午坐這裡的人留的。）', '這個位子的插座是壞的。不要白帶充電器。', '「椅子也是。」'),
    'ev_sk04_note2': ('（同一個位子，又多了一張。字跡跟上次一樣。）', '統計好難。', '「英文也是。」'),
    'ev_sk04_note3': ('（第三張。下午那個人好像很期待你回。）', '你們法律系也要考英文？', '「我們什麼都要考。」'),
    'ev_sk04_reveal': ('（英文提早十分鐘下課。你收東西的時候，下午那堂的人已經在門口等。有一個人直接走到你的位子，手上拿著一張便利貼。）', '……是你？', None),
}
NOTE_WEEKS = [('ev_sk04_note1', 4), ('ev_sk04_note2', 5), ('ev_sk04_note3', 6), ('ev_sk04_reveal', 15)]


def url_for():
    if os.environ.get('TURBO') == '1': return URL0
    base, _, q = URL0.partition('?'); ps = [x for x in q.split('&') if x and x != 'turbo']
    return base + ('?' + '&'.join(ps) if ps else '')


def hm(h):
    if h is None: return '--:--'
    m = int(round(float(h) * 60)); return '%02d:%02d' % (m // 60, m % 60)


# ---------------------------------------------------------------- 存檔（cc_d118b1_probe.py 的 state_at，複製）
BASEF = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True, 'metAn': True, 'met_an': True, 'MET_ZHE': True,
         'zheNoodleDone': True, 'KX_FIRST_MSG': True, 'KX_EVE_MSG': True, 'FAM_GROUP_SENT': True, 'CEREMONY_Y1': True, 'KAI_MOVEIN': True, 'LAW_RECAP_SEEN': True,
         'fundsV2': 1, 'KX_DEC3_MIGRATED': True, 'dating_kexin': False}
ROOMS = (('ROOM_Y2', '2026-09-06'), ('ROOM_Y3', '2027-09-05'), ('ROOM_Y4', '2028-09-03'))
VISITED = ('noodle', 'cafe', 'library_hall', 'library', 'lawlib', 'wancai', 'linze', 'gongguan', 'wenzhou', 'soclib', 'cvs', 'bookstore', 'gongtong', 'dorm', 'dorm_hall')


async def state_at(pg, key, h, zone, flags=None, pos=None, done=None):
    d = await P.day_of(pg, key)
    st = {'name': '祐廷', 'energy': 100, 'events': {'done': {}, 'last': {}, 'count': 0}, 'contacts': {}}
    F = st['flags'] = dict(BASEF)
    for k, kk in ROOMS:
        dd = (await P.day_of(pg, kk))['d']
        if dd <= d['d']: F[k] = dd
    F.update(flags or {})
    st.update(day=d['d'], weekday=d['wd'], hour=h, zone=zone, pos=pos, weather='clear', stage='law', money=30000)
    st['visited'] = {z: True for z in VISITED}
    if done: st['events']['done'].update(done)
    return st, d


CLEARP = "(()=>{ if(typeof CLS!=='undefined'&&CLS.clearPending){ CLS.clearPending(); return true; } return false; })()"

# ---------------------------------------------------------------- 記錄（只記不改；cc_d118b1_probe 的 HOOK 精簡）
HOOK = r"""(()=>{ if(window.__PLH) return 'again'; window.__PLH=1; window.__PL=[];
  const at=()=>{ try{ return {d:CALENDAR.dateOf(GAME.G.day).key, h:+(+GAME.G.hour).toFixed(3), z:GAME.G.zone}; }catch(e){ return {}; } };
  const push=o=>{ try{ Object.assign(o,at()); window.__PL.push(o); }catch(e){} return o; };
  const s0=GAME.say; GAME.say=function(w,t){ push({k:'say',n:(w&&w.name)||(typeof w==='string'?w:''),c:(w&&w.charId)||null,t:String(t==null?'':t)}); return s0.apply(this,arguments); };
  const c0=GAME.choose; GAME.choose=function(o){ push({k:'choose',n:'',t:(o||[]).filter(x=>x&&!x.hidden).map(x=>((x.t||x.text)||'')+(x.hint?'〔'+x.hint+'〕':'')).join('｜')}); return c0.apply(this,arguments); };
  if(GAME.caption){ const p0=GAME.caption; GAME.caption=function(n,t){ push({k:'cap',n:String(n||''),t:String(t==null?'':t)}); return p0.apply(this,arguments); }; }
  if(GAME.toast){ const o0=GAME.toast; GAME.toast=function(t){ push({k:'toast',n:'',t:String(t||'')}); return o0.apply(this,arguments); }; }
  if(GAME.enter){ const e0=GAME.enter; GAME.enter=function(z,sp){ push({k:'enter',n:sp?JSON.stringify(sp):'',t:String(z)}); return e0.apply(this,arguments); }; }
  if(typeof EVENTS!=='undefined'&&EVENTS.run){ const v0=EVENTS.run; EVENTS.run=function(ev){ push({k:'ev',n:'',t:String((ev&&ev.id)||'')}); return v0.apply(this,arguments); }; }
  if(typeof CLS!=='undefined'){
    if(CLS.attend){ const a0=CLS.attend; CLS.attend=async function(GM,it,o){ push({k:'attend',n:(it&&it.key)||'',t:String(it&&it.c&&it.c.id)}); const r=await a0.apply(this,arguments);
      try{ const R=CLS.rec(GAME.G); push({k:'attended',n:it.key,t:JSON.stringify({ret:r,done:!!R.done[it.key]})}); }catch(e){} return r; }; }
    if(CLS.selectTerm){ const q0=CLS.selectTerm; CLS.selectTerm=async function(GM,t){ push({k:'select',n:'start',t:String(t)}); const r=await q0.apply(this,arguments); push({k:'select',n:'end',t:String(t)}); return r; }; }
  }
  return 'ok'; })()"""
ITEM = r"""(cid=>{ try{ const G=GAME.G; const it=CLS.dayItems(G).find(q=>q.c&&q.c.id===cid); if(!it) return null; const rm=it.room||{}, t=CALENDAR.termOf(G.day);
  return {key:it.key,cid:it.c.id,name:it.c.name,t0:it.t0,room:rm.name||null,zone:rm.zone||null,exam:it.exam||null,week:it.week,term:it.term,status:CLS.status(G,it)}; }catch(e){ return 'ERR '+e.message; } })"""
BTN_TXT = "(s=>{ const e=document.querySelector(s); return e?(e.textContent||'').trim():null; })"
EVRO = r"""(id=>{ try{ const e=STORY_EVENTS.find(x=>x.id===id); if(!e) return {exists:false}; let chk=null; try{ chk=!!EVENTS.check(e); }catch(x){ chk='ERR '+x.message; }
  return {exists:true,retired:!!e.retired,check:chk,done:!!((GAME.G.events||{}).done||{})[id],first:(e.dialogue||[]).filter(l=>l&&l.text!==undefined).slice(0,2).map(l=>l.text)}; }catch(e){ return 'ERR '+e.message; } })"""
GE_IN_SAVE = r"""(ws=>{ try{ const s=JSON.stringify(GAME.snapshot()); return ws.filter(w=>s.indexOf(w)>=0); }catch(e){ return 'ERR '+e.message; } })"""
GO_PICKS = ('繼續去上課', '照樣跳過', '老位子', '坐中間的位子', '還是進去聽', '先自由活動', '先起床')
CDECL = ('晚一點', '不去了', '先不', '不用了', '算了', '就這樣', '先這樣', '沒事', '「我晚上要念書。」', '「那天我有事。」', '「我也要念書。」', '「我週六有事。」')


async def pl_len(pg):
    return await pg.evaluate("(window.__PL||[]).length")


async def rows(pg, n0=0, k=None):
    R = await pg.evaluate("n=>(window.__PL||[]).slice(n)", n0)
    return [r for r in R if k is None or r['k'] == k]


def cpick(ch, picks=()):
    T = [o['t'] for o in ch]; live = [i for i, o in enumerate(ch) if not o['dim']] or list(range(len(ch)))
    for p in tuple(picks) + GO_PICKS:
        for i in live:
            if T[i].startswith(p): return i, 'pick'
    for w in CDECL:
        for i in live:
            if T[i].startswith(w): return i, 'decline'
    for i in live:
        if not T[i].startswith(('出發：', '直接過去：', '接起來：', '上線：')) and '存檔' not in T[i]: return i, 'first'
    return live[0], 'first'


async def shoot_both(pg, run, tag):
    await pg.wait_for_timeout(700)
    a = await run.shot(pg, tag + '_land')
    await pg.set_viewport_size(PORT); await pg.wait_for_timeout(2000)
    b = await run.shot(pg, tag + '_port')
    await pg.set_viewport_size(LAND); await pg.wait_for_timeout(2000)
    return [a, b]


async def drive(pg, cdp, run, tag, done, n0, picks=(), max_s=1500, shot_on=None):
    """照玩家：點對話、選選項（picks 開頭優先 → GO_PICKS → 婉拒 → 第一個）、手機收起來，直到 done(s, R) 為真且畫面空下來。
    shot_on(R)：回傳要截圖的標籤（只截一次）。回傳 {'ok','stuck','shots'}"""
    t0 = time.time(); last = None; since = time.time(); shots = {}
    while time.time() - t0 < max_s:
        s = await P.ts(pg); R = await rows(pg, n0)
        free = not s['dlg'] and not s['ch'] and not s['busy'] and s['depth'] == 0 and not s['phone']
        if free and done(s, R): return {'ok': True, 'stuck': None, 'shots': shots}
        sig = (s['day'], s['zone'], s['txt'][:40], tuple(o['t'] for o in s['ch']), s['busy'], s['depth'] > 0, round(s['h'], 2), len(R))
        if sig != last: last = sig; since = time.time()
        elif time.time() - since > ENVI('STUCK_S', 240):
            st = {'clock': await P.clock(pg), 'ts': {k: s[k] for k in ('dlg', 'txt', 'busy', 'depth', 'phone', 'zone')}}
            shots['stuck'] = await shoot_both(pg, run, tag + '_stuck'); return {'ok': False, 'stuck': st, 'shots': shots}
        if shot_on and (s['dlg'] or s['ch']):
            lab = shot_on(R)
            if lab and lab not in shots: shots[lab] = await shoot_both(pg, run, tag + '_' + lab); continue
        if s['phone'] and not s['ch'] and not s['dlg']: await L.phone_away(pg, cdp, tries=1); await pg.wait_for_timeout(500); continue
        if s['ch']:
            k, why = cpick(s['ch'], picks); Tt = [o['t'] for o in s['ch']]
            run.note('%s %s %s 選項 %s → %s（%s）' % (tag, hm(s['h']), s['zone'], J([t[:24] for t in Tt]), Tt[k][:30], why))
            await P.tap_choice(pg, cdp, k); await pg.wait_for_timeout(1000); continue
        if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(600); continue
        await pg.wait_for_timeout(900)
    return {'ok': False, 'stuck': 'timeout', 'shots': shots}


def dump(name, obj):
    with open(os.path.join(OUT, name), 'w', encoding='utf-8') as f: json.dump(obj, f, ensure_ascii=False, indent=1)


def ev_lines(R, evid):
    """事件 evid 開始（EVENTS.run）以後、下一個事件或上課結束以前的台詞"""
    i = next((j for j, r in enumerate(R) if r['k'] == 'ev' and r['t'] == evid), None)
    if i is None: return None
    out = []
    for r in R[i + 1:]:
        if r['k'] in ('ev', 'attended'): break
        if r['k'] in ('say', 'choose'): out.append([r['k'], r.get('n') or '', r['t']])
    return out


async def load(pg, cdp, st, quiet):
    await L.load_state(pg, st, quiet_events=quiet, quiet_phone=True); await pg.evaluate(CLEARP); await pg.wait_for_timeout(3500)
    await L.phone_away(pg, cdp, tries=2); await L.close_panels(pg, cdp)


async def go_class(pg, cdp, run, tag, cid, picks=(), shot_ev=None):
    """手機「今天」→ 那一堂「直接去上課」→ 照玩家上完。回傳 (item, R, trip)"""
    it = await pg.evaluate(ITEM, cid)
    if not isinstance(it, dict): return it, [], None
    n0 = await pl_len(pg)
    await P.phone_tab(pg, cdp, 'today'); sel = '#phoneBody [data-go="%s"]' % it['key']; btn = await pg.evaluate(BTN_TXT, sel)
    run.note('%s：手機「今天」%s 按鈕「%s」' % (tag, it['name'], btn))
    if not btn: await L.close_panels(pg, cdp); return it, [], {'ok': False, 'stuck': 'no-button', 'shots': {}}
    await L.tap(pg, cdp, sel); await pg.wait_for_timeout(1200)

    def done(s, R): return any(r['k'] == 'attended' and r['n'] == it['key'] for r in R)

    def shot_on(R):
        evs = [r['t'] for r in R if r['k'] == 'ev']
        return ('ev_' + evs[-1]) if (shot_ev and evs and evs[-1] in shot_ev) else None
    tr = await drive(pg, cdp, run, tag, done, n0, picks, ENVI('TRIP_MAX', 1500), shot_on)
    return it, await rows(pg, n0), tr


# ================================================================ ① ins
async def case_ins(pg, cdp, run, tag):
    dap = await P.day_of(pg, '2027-11-20'); it = None; d = None
    for w in range(ENVI('INS_WEEK', 1), 5):
        st, d = await state_at(pg, ['Y4S2', w, 4], 8.0, 'dorm', {'EXCHANGE_ROUTE': 'JP', 'EXCH_RULE': 1, 'EXCH_APPLIED_DAY': dap['d']})
        await load(pg, cdp, st, True)
        it = await pg.evaluate(ITEM, 'insurance_re')
        run.setup('[前置] %s：最小存檔 %s（%s，大四下第 %s 週）08:00 宿舍，日本路線（EXCHANGE_ROUTE JP、EXCH_RULE 1）、條件事件關掉；那天的保險法 %s' % (tag, d['key'], WD[d['wd']], d['week'], J(it)))
        if isinstance(it, dict): break
    ro = await pg.evaluate(EVRO, 'ev_jp_redo_insurance'); run.note('%s：只讀 ev_jp_redo_insurance %s' % (tag, J(ro)))
    if not run.check('%s：前置成立：那天有保險法（insurance_re）那一堂' % tag, isinstance(it, dict), J(it)): return
    it, R, tr = await go_class(pg, cdp, run, tag, 'insurance_re', shot_ev=('ev_jp_redo_insurance',))
    lines = ev_lines(R, 'ev_jp_redo_insurance'); says = [r['t'] for r in R if r['k'] == 'say']
    dump('transcript_%s.json' % tag, {'case': tag, 'sha': os.environ.get('SHA', '?'), 'item': it, 'readonly': ro, 'rows': R, 'ev_lines': lines, 'trip': tr})
    run.note('%s：ev_jp_redo_insurance 的台詞 %s' % (tag, J(lines)))
    run.check('%s：照玩家上完那一堂、沒有卡住' % tag, bool(tr and tr['ok']), J(tr and tr['stuck']))
    run.check('%s：上課前演了 ev_jp_redo_insurance（補修第一堂）' % tag, lines is not None, J([r['t'] for r in R if r['k'] == 'ev']))
    first = next((x[2] for x in (lines or []) if x[0] == 'say'), None)
    run.check('%s：① 第一句逐字＝AA_605「%s」' % (tag, INS_NEW), first == INS_NEW, '實際：%s' % J(first))
    run.check('%s：① 整堂沒有舊句「%s」' % (tag, INS_OLD), not any(INS_OLD in t for t in says), J([t for t in says if INS_OLD in t]))


# ================================================================ ② sel_enter
async def case_sel_enter(pg, cdp, run, tag):
    st, d = await state_at(pg, '2025-09-27', 8.5, 'dorm_hall', pos={'x': 5.5, 'z': 0.4, 'lv': 1, 'yaw': 0})
    await load(pg, cdp, st, False)
    it = await L.find_it(pg, '回房間')
    ro0 = await pg.evaluate(EVRO, 'ev_course_selection')
    run.setup('[前置] %s：最小存檔 %s（%s）08:30 宿舍大樓（dorm_hall）二樓、條件事件照開；回房間的互動點 %s' % (tag, d['key'], WD[d['wd']], J(it)))
    run.note('%s：只讀 ev_course_selection %s（修改後預期 retired、check false）' % (tag, J(ro0)))
    if not run.check('%s：找到「回房間」互動點' % tag, bool(it), J(it)): return
    s0 = await P.ts(pg)
    if s0['lab'].startswith('回房間'):   # 一讀檔就站在門口：先退開兩步再走回去（像玩家走過去）
        await L.go_to(pg, cdp, run, it['x'], it['z'] + 2.2, 0.6, '門口外', max_s=120, lv=it['lv'])
    await L.go_to(pg, cdp, run, it['x'], it['z'], 0.5, '回房間', max_s=240, lv=it['lv'])
    lab = None
    for _ in range(30):
        lab = (await P.ts(pg))['lab']
        if lab.startswith('回房間'): break
        await pg.wait_for_timeout(500)
    if not run.check('%s：走到門口、互動鈕是「回房間…」' % tag, lab.startswith('回房間'), J(lab)): return
    n0 = await pl_len(pg); await L.tap(pg, cdp, '#interact')

    def done(s, R): return s['zone'] == 'dorm' and any(r['k'] == 'enter' for r in R) and (time.time() - t_in > 25)
    t_in = time.time()
    tr = await drive(pg, cdp, run, tag, done, n0, max_s=600, shot_on=lambda R: 'course_selection' if any(r['k'] == 'ev' and r['t'] == 'ev_course_selection' for r in R) else None)
    R = await rows(pg, n0); ro1 = await pg.evaluate(EVRO, 'ev_course_selection'); sv = await pg.evaluate(GE_IN_SAVE, list(GE_WORDS))
    hit = [[r['k'], r['t']] for r in R if r['k'] in ('say', 'choose', 'toast', 'cap') and any(w in r['t'] for w in GE_WORDS)]
    p_room = await shoot_both(pg, run, tag + '_room')
    dump('transcript_%s.json' % tag, {'case': tag, 'sha': os.environ.get('SHA', '?'), 'rows': R, 'readonly_before': ro0, 'readonly_after': ro1, 'save_hits': sv, 'trip': tr, 'shots': p_room})
    run.note('%s：進房間以後的事件 %s；台詞 %s' % (tag, J([r['t'] for r in R if r['k'] == 'ev']), J([r['t'] for r in R if r['k'] == 'say'])[:800]))
    run.check('%s：照玩家進了房間（G.zone dorm）' % tag, any(r['k'] == 'enter' and r['t'] == 'dorm' for r in R) and bool(tr['ok']), J(tr['stuck']))
    run.check('%s：② ev_course_selection 沒有演（EVENTS.run 沒有它、done 沒記）' % tag, not any(r['k'] == 'ev' and r['t'] == 'ev_course_selection' for r in R) and not (isinstance(ro1, dict) and ro1.get('done')), J(ro1))
    run.check('%s：② 台詞、選項、字幕沒有「城市與散步」「天文與我們」' % tag, not hit, J(hit))
    run.check('%s：② 存檔（GAME.snapshot）裡沒有「城市與散步」「天文與我們」' % tag, sv == [], J(sv))


# ================================================================ ② sel_y1s2
async def case_sel_y1s2(pg, cdp, run, tag):
    st, d = await state_at(pg, '2026-02-22', 22.5, 'dorm')
    await load(pg, cdp, st, False)
    it = await L.find_it(pg, '睡覺')
    run.setup('[前置] %s：最小存檔 %s（%s）22:30 宿舍房間（大一下 2026-02-23 開學前一晚；條件事件照開）；睡覺的互動點 %s' % (tag, d['key'], WD[d['wd']], J(it)))
    if not run.check('%s：找到「睡覺」互動點' % tag, bool(it), J(it)): return
    await L.go_to(pg, cdp, run, it['x'], it['z'], 0.5, '睡覺', max_s=240, lv=it['lv'])
    lab = None
    for _ in range(30):
        lab = (await P.ts(pg))['lab']
        if lab.startswith('睡覺'): break
        await pg.wait_for_timeout(500)
    if not run.check('%s：走到床前、互動鈕是「睡覺」' % tag, lab.startswith('睡覺'), J(lab)): return
    n0 = await pl_len(pg); await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1200)

    def done(s, R): return any(r['k'] == 'select' and r['n'] == 'end' and r['t'] == 'Y1S2' for r in R) or (s['day'] > d['d'] and s['h'] >= 11)
    tr = await drive(pg, cdp, run, tag, done, n0, picks=('睡到明天早上', '睡覺'), max_s=ENVI('WAKE_MAX', 900),
                     shot_on=lambda R: 'select' if any(r['k'] == 'select' and r['n'] == 'start' for r in R) else None)
    R = await rows(pg, n0)
    i = next((j for j, r in enumerate(R) if r['k'] == 'select' and r['n'] == 'start' and r['t'] == 'Y1S2'), None)
    j = next((j for j, r in enumerate(R) if r['k'] == 'select' and r['n'] == 'end' and r['t'] == 'Y1S2'), None)
    seg = R[i:(j + 1 if j is not None else None)] if i is not None else []
    seg_lines = [[r['k'], r['t']] for r in seg if r['k'] in ('say', 'choose')]
    hit = [[r['k'], r['t']] for r in R if r['k'] in ('say', 'choose', 'toast', 'cap') and any(w in r['t'] for w in GE_WORDS)]
    await pg.wait_for_timeout(1500); await L.close_panels(pg, cdp)
    ph = {}
    for tab in ('today', 'week'):
        ph[tab] = await P.phone_tab(pg, cdp, tab); ph[tab + '_shots'] = await shoot_both(pg, run, '%s_phone_%s' % (tag, tab))
    await L.close_panels(pg, cdp)
    sv = await pg.evaluate(GE_IN_SAVE, list(GE_WORDS))
    dump('transcript_%s.json' % tag, {'case': tag, 'sha': os.environ.get('SHA', '?'), 'rows': R, 'select_lines': seg_lines, 'phone': ph, 'save_hits': sv, 'trip': tr})
    run.note('%s：選課結果那一段 %s' % (tag, J(seg_lines)))
    run.note('%s：手機「今天」%s' % (tag, J(ph['today'][:400]))); run.note('%s：手機「課表」%s' % (tag, J(ph['week'][:600])))
    run.check('%s：照玩家睡到早上、醒來演了選課結果（CLS.selectTerm Y1S2）' % tag, i is not None and j is not None, J({'trip': tr['stuck'], 'select': [r for r in R if r['k'] == 'select']}))
    run.check('%s：② 選課結果有「%s」' % (tag, SEL_LINE), any(x[0] == 'say' and x[1] == SEL_LINE for x in seg_lines), J(seg_lines[:4]))
    run.check('%s：② 睡覺到醒來這一段的台詞、選項、字幕沒有「城市與散步」「天文與我們」' % tag, not hit, J(hit))
    run.check('%s：② 手機「今天」「課表」沒有「城市與散步」' % tag, not any('城市與散步' in ph[t] for t in ('today', 'week')), J([t for t in ('today', 'week') if '城市與散步' in ph[t]]))
    ast = [t for t in ('today', 'week') if '天文與我們' in ph[t]]
    run.note('%s：② INFO 手機出現「天文與我們」的頁籤：%s（courses.js:74 ge_y1s2 這門課還在大一下課表；AA_605 沒有要改，給 BB 判斷）' % (tag, J(ast)))
    run.note('%s：INFO 存檔裡找到的字 %s（城市與散步只有舊的 ge_walk_waitlist 會留；天文與我們可能是課表的課名）' % (tag, J(sv)))


# ================================================================ ③ notes
async def case_notes(pg, cdp, run, tag):
    first = True; res = {}
    for evid, wk in NOTE_WEEKS:
        sub = '%s_%s' % (tag, evid.replace('ev_sk04_', ''))
        if first:
            st, d = await state_at(pg, ['Y1S1', wk, 4], 8.0, 'dorm'); await load(pg, cdp, st, True)
            run.setup('[前置] %s：最小存檔 %s（%s，大一上第 %s 週）08:00 宿舍、條件事件關掉' % (sub, d['key'], WD[d['wd']], d['week']))
            first = False
        else:
            await P.jump(pg, cdp, run, ['Y1S1', wk, 4], 8.0, zone='dorm', pos=None, quiet=True, note='%s（便利貼旗標照上一張留著）' % sub)
            await pg.evaluate(CLEARP); await L.phone_away(pg, cdp, tries=2); await L.close_panels(pg, cdp)
        fl = await pg.evaluate("(()=>{ const F=GAME.G.flags; return {SK04_REPLY:F.SK04_REPLY||null,SK04_N:F.SK04_N||null,SK04_WK:F.SK04_WK||null,SK04_QUIET:!!F.SK04_QUIET,STICKY_NOTES:!!F.STICKY_NOTES}; })()")
        ro = await pg.evaluate(EVRO, evid); run.note('%s：旗標 %s；只讀 %s' % (sub, J(fl), J(ro)))
        nar, nxt, pick = NOTES[evid]
        it, R, tr = await go_class(pg, cdp, run, sub, 'english_y1', picks=(pick,) if pick else (), shot_ev=(evid,))
        if not isinstance(it, dict):
            run.check('%s：前置成立：那天有大一英文（english_y1）' % sub, False, J(it)); res[evid] = None; continue
        lines = ev_lines(R, evid); res[evid] = {'item': it, 'lines': lines, 'trip': tr, 'flags_before': fl, 'readonly': ro, 'evs': [r['t'] for r in R if r['k'] == 'ev']}
        says = [x for x in (lines or []) if x[0] == 'say']
        run.note('%s：%s 的台詞 %s' % (sub, evid, J(lines)))
        run.check('%s：照玩家上完那一堂、沒有卡住' % sub, bool(tr and tr['ok']), J(tr and tr['stuck']))
        run.check('%s：上課前演了 %s' % (sub, evid), lines is not None, J(res[evid]['evs']))
        run.check('%s：③ 第一句旁白逐字＝AA_605「%s」' % (sub, nar), bool(says) and says[0][2] == nar, '實際：%s' % J(says[0][2] if says else None))
        if nxt:
            run.check('%s：③ 第二句逐字＝「%s」' % (sub, nxt), len(says) >= 2 and says[1][2] == nxt, '實際：%s' % J(says[1][2] if len(says) >= 2 else None))
    dump('transcript_%s.json' % tag, {'case': tag, 'sha': os.environ.get('SHA', '?'), 'notes': res})
    run.check('%s：③ 四張都有（note1、note2、note3、reveal 都演了）' % tag, all(res.get(e) and res[e]['lines'] is not None for e, _ in NOTE_WEEKS), J({e: bool(res.get(e) and res[e]['lines'] is not None) for e, _ in NOTE_WEEKS}))


# ---------------------------------------------------------------- main
RUNNERS = {'ins': case_ins, 'sel_enter': case_sel_enter, 'sel_y1s2': case_sel_y1s2, 'notes': case_notes}


class Run(L.Run):
    def finish(self):
        print('ALL PASS' if not self.fails else 'FAILED %d' % len(self.fails), flush=True)
        return 1 if self.fails else 0


def md_check(run):
    p = os.environ.get('AA605_MD')
    if not p: run.note('原稿：沒有給 AA605_MD，只用探針裡逐字抄的句子'); return
    try: md = open(p, encoding='utf-8').read()
    except Exception as e: run.check('原稿 AA605_MD 讀得到', False, repr(e)); return
    want = [INS_NEW, SEL_LINE.replace('大一下。', '')] + [v[0] for v in NOTES.values()] + [NOTES['ev_sk04_note1'][1]]
    miss = [w for w in want if w not in md]
    run.check('原稿：探針的期望句子都逐字在 AA_605 原稿裡（%d 句）' % len(want), not miss, J(miss))


async def main():
    run = Run('aa605_' + '+'.join(CASES), OUT); os.makedirs(OUT, exist_ok=True)
    md_check(run); u = url_for()
    async with async_playwright() as p:
        for c in CASES:
            print('==== CASE %s（SHA %s，%s）====' % (c, os.environ.get('SHA', '?'), u), flush=True)
            if c not in RUNNERS: run.check('CASE %s 認得' % c, False, ','.join(RUNNERS)); continue
            b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
            pg.on('dialog', lambda dd: asyncio.ensure_future(dd.accept()))
            try:
                await pg.goto(u); ok = await L.wait_loaded(pg); run.check('%s：遊戲載入' % c, ok)
                await pg.evaluate("localStorage.clear()"); await P.init(pg); await pg.evaluate(HOOK)
                await RUNNERS[c](pg, cdp, run, c)
            except Exception as e:
                run.check('%s：跑完（沒有探針例外）' % c, False, repr(e)[:500]); traceback.print_exc()
                try: await run.shot(pg, c + '_exception')
                except Exception: pass
            run.check('%s：沒有 JS 例外' % c, not errs, J(errs[:3]))
            try: await asyncio.wait_for(b.close(), 30)
            except Exception: pass
    print('SHA', os.environ.get('SHA', '?'), 'CASES', ','.join(CASES), flush=True)
    sys.exit(run.finish())

if __name__ == '__main__':
    asyncio.run(main())
