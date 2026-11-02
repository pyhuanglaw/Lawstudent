"""CC（帳號 A）11-02：BB_222 B-1 的 SE-06（一-9：玩家考一場期末，成績照答對題數）——階段 0「修改前基準」用（開發分支舊版 a3b1bd647）。
不是 iPhone：Playwright 手機橫向模擬（SwiftShader 1～4 fps）；關鍵畫面另外把視窗改成直向 390×844 再截一張（同一個畫面、同一刻）。
**不用 ?turbo**。作答用【捷徑】（BB_222 第 248 列：不列為完整玩家流程）：考卷每一題出來時，從頁面「只讀」這一場考試已經抽好的題目
  （CLS.rec(G).exam['Y1S1:<課>:final'].qs[第幾題] → EXAM_BANK 那一題的 answer），再像玩家一樣點那個選項。不呼叫 CLS.drawExam（它會寫 examSeed、R.exam）。

讀程式看到的（a3b1bd647）：
  - src/classes3d.js S.runExam：「考卷發下來。<課名>期末考。五題。」→ 每題 GM.say('i／5　題幹') → GM.choose（選項「（A）…」或「對／錯」）→
    「交卷。答對 k／5，<分> 分。」→ 答錯的題「第 n 題的答案：…」。分數 S.scoreOf：0～5 題＝0、60、70、80、90、100（4／5＝90）。
    分數只看答對題數；R.prep（讀書次數）只影響「沒有五題考試的課」的考試旁白（classes3d.js:309-310，例「你認得題目裡的每一個字……」）。
    有那一科的課本（F.books／F.textbook）期末多一次想起答案（D102）——這裡前置是沒有課本。
  - 大一上考五題的法律課有三門：憲法（上）12/15 09:10、刑法總則（一）12/17 09:10、民法總則 12/18 13:20（都在法律系館A 201）。
    12/15 另外有體育 15:30 的期末（看出席的課，走 classes3d.js:309 那一支，prep<4 會說「認得每一個字」）——SE-06 不去上，只考憲法。
  - 成績單：CLS.morning（起床、或快轉跨日）在公布日（放假後第 3 個週一＝2026-01-05）早上發：GM.say('大一上的成績出來了。')＋一句「課名：分數　…」。
    書卷獎（src/honor3d.js）：法律科期末答對題數平均 ≥ 4（缺考算 0）；下學期第 2 週週一 09:00（2026-03-02）手機系統訊息「系上公告：…書卷獎名單。名單上有你。」，
    成績單也多一行「書卷獎」。**只考憲法一科時，另外兩科缺考算 0，平均 ≤ 5/3，一定沒有書卷獎**（BB_222 SE-05 說的假象）——
    所以預設 ALL3=1：每一輪三科都考（同一個答題方式），書卷獎那一步才有意義；ALL3=0 只考憲法（照字面），書卷獎那一步只記錄。

流程（每一輪各自從同一份前置存檔開始；ROUNDS 預設 all,four）：
  [前置] 最小存檔（法律系、過了開場；同 cc_dl04b_probe 的 state_at）改到 2025-12-15 07:40 宿舍；prep、study、notes 空、沒有課本；
         examSeed 固定（EXAM_SEED，預設 20251215；兩輪抽到同一份題目才好比；EXAM_SEED=none＝不設，遊戲自己亂數）。
  ① 手機「今天」→ 憲法（上）期末那一列的「直接去上課」→ 照玩家點對話 → 考卷每一題【捷徑】讀答案再點：all＝5 題全對；four＝第 WRONG_AT 題（預設 5）故意選錯、其他對。
     ALL3=1：[前置] 同一份進度跳到 12/17 07:40 宿舍 → 刑總期末；跳到 12/18 12:20 宿舍 → 民總期末（同一個答題方式）。
  ② 快轉到成績公布日：[前置] 同一份進度放回宿舍同一天 20:00（考完人在教室，床在宿舍）→ 照玩家：走到床 → 「快轉」→「到下一個有事的時候／日子」，
     床沒有快轉（學期最後一晚）就「睡到明天早上」；途中的對話點過去、選單照婉拒那一類、手機收起來，直到成績單發出來（GRADE_FF_S 秒內，預設 1800）。
     時間內沒等到：【前置／捷徑】同一份進度跳到 2026-01-04 22:30 宿舍 → 床「睡到明天早上」→ 起床發成績單。
  ③ 下學期第 2 週看書卷獎公告：預設【前置】同一份進度跳到 2026-03-02（週一）08:40 宿舍（寒假到開學這段太長，快轉途中有除夕強制回家等），
     站著等到 09:05（像玩家：對話點過去、手機收起來）→ 手機「訊息」→ 系統那一串 → 截圖。HONOR_FF=1＝改成照玩家一路快轉過去（時間內沒到才跳）。
檢查（只客觀記錄，BB 判定）：交卷那一句的答對題數、分數＝S.scoreOf；all＝5／5、100 分，four＝4／5、90 分；成績單那一科的字和交卷一致（也對照 R.grades、R.exam，只讀）；
  書卷獎公告有沒有、和 HONOR.avg（只讀）≥4 一致不一致；逐字稿黑名單（沒讀、沒唸、不讀書、下次先讀、認得每一個字）——考試＋成績單那幾段算 check，
  其他時段（快轉途中的邀約台詞常有「今天不讀書」）列 INFO 給 BB 看上下文。GAME.walkFallbacks 記下來（這支用了捷徑，本來就不算完整玩家流程）。
截圖：考卷第一題、交卷、成績單、書卷獎公告（系統訊息）各直向＋橫向一張；逐字稿 <輸出>/transcript_SE-06.json（GAME.say／caption／toast／choose／titleCard 全文）。
用法：LW_TESTS=<工作樹>/tests SHA=<sha> python3 cc_se06_probe.py '<URL>/index.html' <輸出資料夾>
環境變數：ROUNDS=all,four　ALL3=1　WRONG_AT=5　EXAM_SEED=20251215　GRADE_FF=1　GRADE_FF_S=1800　HONOR_FF=0　HONOR_FF_S=2400　TRIP_MAX=900　STUCK_S=240
"""
import os, sys, json, asyncio, re, time, copy, traceback
sys.path.insert(0, os.environ.get('LW_TESTS', '')); import playlib as L
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__)))); import bbplay as P   # bbplay 在上一層（BB 的 test_tools）

J = lambda o: json.dumps(o, ensure_ascii=False)
ENVI = lambda k, d: int(os.environ.get(k, str(d)))
ENVS = lambda k, d: os.environ.get(k, d)
BLACK = ('沒讀', '沒唸', '不讀書', '下次先讀', '認得每一個字')
SCORE = [0, 60, 70, 80, 90, 100]   # classes3d.js S.scoreOf
LAND = {'width': 844, 'height': 390}
PORT = {'width': 390, 'height': 844}


def hm(h):
    if h is None: return '--:--'
    m = int(round(float(h) * 60)); return '%02d:%02d' % (m // 60, m % 60)


# ---------------------------------------------------------------- 存檔（cc_dl04b_probe.py 的 state_at、load；argv 不在這裡讀，cc_se11_probe 可以 import）
BASEF = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True, 'metAn': True, 'met_an': True, 'MET_ZHE': True,
         'zheNoodleDone': True, 'KX_FIRST_MSG': True, 'KX_EVE_MSG': True, 'FAM_GROUP_SENT': True, 'CEREMONY_Y1': True, 'KAI_MOVEIN': True, 'LAW_RECAP_SEEN': True,
         'fundsV2': 1, 'KX_DEC3_MIGRATED': True, 'dating_kexin': False}   # 法律系、過了開場；GAME.defaults 的 dating_kexin:true 拿掉（交往中的可昕會把成績單留到晚上一起看：story3d.js S.holdGrades）
ROOMS = (('ROOM_Y2', '2026-09-06'), ('ROOM_Y3', '2027-09-05'), ('ROOM_Y4', '2028-09-03'))
VISITED = ('noodle', 'cafe', 'library_hall', 'library', 'lawlib', 'wancai', 'linze', 'gongguan', 'wenzhou', 'soclib', 'cvs', 'bookstore')
CLEARP = "(()=>{ if(typeof CLS!=='undefined'&&CLS.clearPending){ CLS.clearPending(); return true; } return false; })()"


async def state_at(pg, key, h, zone, flags=None, pos=None, weather='clear', money=30000):
    """法律系的最小存檔改到那一天、那個時間、那一區；key 可以是 'YYYY-MM-DD' 或 [學期, 週, 星期]"""
    d = await P.day_of(pg, key)
    st = {'name': '祐廷', 'energy': 100, 'events': {'done': {}, 'last': {}, 'count': 0}, 'contacts': {}}
    F = st['flags'] = dict(BASEF)
    for k, kk in ROOMS:
        dd = (await P.day_of(pg, kk))['d']
        if dd <= d['d']: F[k] = dd
    F.update(flags or {})
    st.update(day=d['d'], weekday=d['wd'], hour=h, zone=zone, pos=pos, weather=weather, stage='law', money=money)
    st['visited'] = {z: True for z in VISITED}
    return st, d


async def load(pg, cdp, run, st, label):
    """[前置] 讀檔（遊戲自己的 GAME.applySave，條件事件照開）＋清掉還沒出的選單（同重新整理）；手機自己打開（D103）照玩家收起來"""
    await L.load_state(pg, st, quiet_events=False, quiet_phone=False); await pg.evaluate(CLEARP)
    await pg.wait_for_timeout(3500)
    await L.phone_away(pg, cdp, tries=2)
    run.setup('[前置] ' + label)


async def jump(pg, cdp, run, key, h, zone='dorm', snap=None, label=''):
    """[前置] 同一份進度（GAME.snapshot()，或給 snap）改日期、時間、地點（pos=None＝那一區的出生點）再讀；條件事件照開（不用 bbplay.jump：它關事件）"""
    s = copy.deepcopy(snap) if snap is not None else await pg.evaluate("()=>GAME.snapshot()")
    d = await P.day_of(pg, key)
    s.update(day=d['d'], weekday=d['wd'], hour=h, zone=zone, pos=None)
    s.pop('_stuck', None); s.pop('_busy', None)
    await load(pg, cdp, run, s, '同一份進度跳到 %s（%s 第 %s 週）%s %s%s' % (d['key'], d['term'], d['week'], hm(h), zone, ('；' + label) if label else ''))
    return d


# ---------------------------------------------------------------- 記錄（只記不改）：每一筆有流水號 i，不會因為太長被切掉前面
HOOK = r"""(()=>{ if(window.__PLH) return 'again'; window.__PLH=1; window.__PL=[]; window.__PLN=0;
  const at=()=>{ try{ return {d:CALENDAR.dateOf(GAME.G.day).key, h:+(+GAME.G.hour).toFixed(3), z:GAME.G.zone}; }catch(e){ return {}; } };
  const push=o=>{ try{ Object.assign(o,at()); o.i=++window.__PLN; window.__PL.push(o); if(window.__PL.length>60000) window.__PL.splice(0,10000); }catch(e){} return o; };
  const s0=GAME.say; GAME.say=function(w,t){ push({k:'say',n:(w&&w.name)||(typeof w==='string'?w:''),t:String(t==null?'':t)}); return s0.apply(this,arguments); };
  const c0=GAME.choose; GAME.choose=function(o){ push({k:'choose',n:'',t:(o||[]).filter(x=>x&&!x.hidden).map(x=>((x.t||x.text)||'')+(x.hint?'〔'+x.hint+'〕':'')).join('｜'),opts:(o||[]).filter(x=>x&&!x.hidden).map(x=>String((x.t||x.text)||''))}); return c0.apply(this,arguments); };
  if(GAME.caption){ const p0=GAME.caption; GAME.caption=function(n,t){ push({k:'cap',n:String(n||''),t:String(t==null?'':t)}); return p0.apply(this,arguments); }; }
  if(GAME.titleCard){ const t0=GAME.titleCard; GAME.titleCard=function(a,b){ push({k:'card',n:String(a||''),t:String(b||'')}); return t0.apply(this,arguments); }; }
  if(GAME.toast){ const o0=GAME.toast; GAME.toast=function(t){ push({k:'toast',n:'',t:String(t||'')}); return o0.apply(this,arguments); }; }
  if(GAME.enter){ const e0=GAME.enter; GAME.enter=function(z,sp){ push({k:'enter',n:sp?JSON.stringify(sp):'',t:String(z)}); return e0.apply(this,arguments); }; }
  if(typeof CLS!=='undefined'){
    if(CLS.attend){ const a0=CLS.attend; CLS.attend=async function(GM,it,o){ push({k:'attend',n:(it&&it.key)||'',t:JSON.stringify({exam:(it&&it.exam)||null})}); const r=await a0.apply(this,arguments);
      try{ const R=CLS.rec(GAME.G); push({k:'attended',n:it.key,t:JSON.stringify({ret:r,done:!!R.done[it.key]})}); }catch(e){} return r; }; }
    if(CLS.runExam){ const x0=CLS.runExam; CLS.runExam=async function(GM,it){ const r=await x0.apply(this,arguments); push({k:'exam',n:(it&&it.key)||'',t:JSON.stringify(r||null)}); return r; }; }
    if(CLS.showGrades){ const g0=CLS.showGrades; CLS.showGrades=async function(GM,termId,o){ push({k:'grades',n:String(termId),t:''}); return g0.apply(this,arguments); }; }
  }
  if(typeof EVENTS!=='undefined'&&EVENTS.run){ const v0=EVENTS.run; EVENTS.run=function(ev){ push({k:'ev',n:'',t:String((ev&&ev.id)||'')}); return v0.apply(this,arguments); }; }
  if(typeof PHONE!=='undefined'&&PHONE.post){ const m0=PHONE.post; PHONE.post=function(G,it){ try{ push({k:'msg',n:String((it&&(it.th||it.who))||''),t:String((it&&it.text)||'')}); }catch(e){} return m0.apply(this,arguments); }; }
  const te=document.getElementById('toast'); if(te){ let lt=''; new MutationObserver(()=>{ const h=(te.textContent||'').trim(); if(h&&h!==lt){ lt=h; push({k:'toast',n:'dom',t:h}); } }).observe(te,{childList:true,subtree:true,characterData:true}); }
  return 'ok'; })()"""


async def pl_n(pg):
    return await pg.evaluate("window.__PLN||0")


async def rows(pg, n0=0, k=None):
    R = await pg.evaluate("n=>(window.__PL||[]).filter(r=>r.i>n)", n0)
    return [r for r in R if k is None or r['k'] == k]


class TR:
    """逐字稿：每一段（case、輪、段落）收進來，最後存成 transcript_<case>.json"""
    def __init__(self, case): self.case = case; self.items = []

    async def take(self, pg, n0, rnd, phase):
        R = await rows(pg, n0)
        for r in R:
            if r['k'] in ('say', 'choose', 'cap', 'toast', 'card', 'msg', 'ev', 'enter', 'exam', 'grades'):
                self.items.append(dict(r, case=self.case, round=rnd, phase=phase))
        return R

    def save(self, out):
        p = os.path.join(out, 'transcript_%s.json' % self.case)
        json.dump(self.items, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=1); return p

    def hits(self, phases=None, rnd=None):
        out = []
        for r in self.items:
            if r['k'] not in ('say', 'choose', 'cap', 'toast', 'card', 'msg'): continue
            if phases and r['phase'] not in phases: continue
            if rnd and r['round'] != rnd: continue
            for w in BLACK:
                if w in r['t']: out.append({'w': w, 'round': r['round'], 'phase': r['phase'], 'k': r['k'], 'n': r.get('n'), 't': r['t'][:160], 'd': r.get('d'), 'h': r.get('h'), 'z': r.get('z')})
        return out


# ---------------------------------------------------------------- 截圖：同一刻橫向＋直向
async def shot2(pg, run, label):
    a = await run.shot(pg, label + '_land')
    try:
        await pg.set_viewport_size(PORT); await pg.wait_for_timeout(ENVI('ROT_MS', 2500))
        b = await run.shot(pg, label + '_port')
    finally:
        await pg.set_viewport_size(LAND); await pg.wait_for_timeout(1500)
    return [a, b]


# ---------------------------------------------------------------- 頁面裡讀（只讀）
EXITEM = r"""(([cid,kind])=>{ try{ const G=GAME.G; const it=CLS.dayItems(G).find(q=>q.c&&q.c.id===cid&&(kind?q.exam===kind:!q.exam)); if(!it) return null; const rm=it.room||{};
  return {key:it.key,cid:it.c.id,name:it.c.name,exam:it.exam||null,term:it.term,week:it.week,t0:it.t0,t1:it.t1,room:rm.name||null,status:CLS.status(G,it)}; }catch(e){ return 'ERR '+e.message; } })"""
KEYST = """(key=>{ try{ const G=GAME.G, it=CLS.dayItems(G).find(q=>q.key===key), R=CLS.rec(G); return {status:it?CLS.status(G,it):null,done:!!R.done[key]}; }catch(e){ return {err:String(e.message)}; } })"""
BTN_TXT = "(s=>{ const e=document.querySelector(s); return e?(e.textContent||'').trim():null; })"
POS = "(()=>{ const p=GAME.E.player.obj.position; return [Math.round(p.x*2)/2, Math.round(p.z*2)/2, GAME.E.player.lv|0, !!GAME.E.player.seat]; })()"
# 【捷徑：只讀】這一場考試已經抽好的第 i 題（0 起算）的答案；不呼叫 drawExam
EXQ = r"""(([key,i])=>{ try{ const R=CLS.rec(GAME.G), e=(R.exam||{})[key]; const id=e&&e.qs&&e.qs[i]; if(!id) return {miss:'R.exam 沒有這一題',key,i,have:Object.keys(R.exam||{})};
  const q=(typeof EXAM_BANK!=='undefined'?EXAM_BANK.questions:[]).find(x=>x.id===id); if(!q) return {id,miss:'EXAM_BANK 找不到'};
  const opt=(q.type==='tf'||!q.options)?String(q.answer):'（'+q.answer+'）'+q.options[q.answer]; return {id,q:q.q,answer:q.answer,opt,type:q.type||null}; }catch(e){ return {err:String(e.message)}; } })"""
EXREC = r"""(key=>{ try{ const R=CLS.rec(GAME.G); return (R.exam||{})[key]||null; }catch(e){ return {err:String(e.message)}; } })"""
PRE = r"""(()=>{ const G=GAME.G, R=CLS.rec(GAME.G), F=G.flags||{}; const law=CLS.termCourses(G,'Y1S1').filter(CLS.isExamCourse);
  return {prep:R.prep||{},prepSum:Object.values(R.prep||{}).reduce((a,b)=>a+(+b||0),0),study:(G.stats||{}).study||0,notes:(G.notes||[]).length,books:F.books||null,textbook:!!F.textbook,
          hasBook:law.map(c=>[c.id,CLS.hasBook(G,c)]),examSeed:F.examSeed==null?null:F.examSeed,examRec:Object.keys(R.exam||{}),recKeys:Object.keys(R)}; })()"""
GRADES = r"""(t=>{ try{ const R=CLS.rec(GAME.G); return {grades:(R.grades||{})[t]||null,avg:typeof HONOR!=='undefined'?HONOR.avg(GAME.G,t):null,won:typeof HONOR!=='undefined'?HONOR.won(GAME.G,t):null,
  flag:GAME.G.flags['HONOR_'+t]==null?null:GAME.G.flags['HONOR_'+t]}; }catch(e){ return {err:String(e.message)}; } })"""


# ---------------------------------------------------------------- 照玩家操作
DECL = ('晚一點', '不去了', '自己走過去', '先不', '不用了', '算了', '就這樣', '先這樣', '沒事', '「我晚上要念書。」', '「那天我有事。」', '「我也要念書。」', '「我週六有事。」')
GO_PREFIX = ('出發：', '直接過去：', '接起來：', '上線：')
GO_PICKS = ('繼續去上課', '老位子', '坐中間的位子', '還是進去聽')   # 一鍵上課途中玩家會選的


def pick_opt(ch, picks=()):
    """選哪一個：picks（開頭符合、或包含）→ 起床選單「先起床」→ 婉拒那一類 → 第一個不是「出發：」那一類的（cc_dl04b_probe 的 pick_opt）"""
    T = [o['t'] for o in ch]; live = [i for i, o in enumerate(ch) if not o['dim']] or list(range(len(ch)))
    for p in picks or ():
        for i in live:
            if T[i].startswith(p) or (len(p) >= 4 and p in T[i]): return i, 'pick'
    for i in live:
        if T[i].startswith('先起床'): return i, 'wake'
    for w in DECL:
        for i in live:
            if T[i].startswith(w): return i, 'decline'
    for i in live:
        if not T[i].startswith(GO_PREFIX) and '存檔' not in T[i]: return i, 'first'
    return live[0], 'first'


async def press_bed(pg, cdp, run):
    """走到床（宿舍房間）→ 按互動鍵；回傳有沒有出現選單或對話"""
    bed = await pg.evaluate("(()=>{ const it=(GAME.E.interactables||[]).find(i=>i.sleep&&!i.hidden); return it?[it.x,it.z]:null; })()")
    if not bed: return False
    await L.phone_away(pg, cdp, tries=1)
    await L.go_to(pg, cdp, run, bed[0], bed[1], 0.8, '床', max_s=180, stop=lambda s: s['dlg'] or s['choices'])
    for _ in range(4):
        await L.phone_away(pg, cdp, tries=1)
        s = await P.ts(pg)
        if s['ch'] or s['dlg']: return True
        await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1800)
        s = await P.ts(pg)
        if s['ch'] or s['dlg'] or s['busy']: return True
    return False


EXQ_RE = re.compile(r'^([1-5])／5　(.*)$', re.S)


def last_say(R):
    for r in reversed(R):
        if r['k'] == 'say': return r
    return None


async def play_trip(pg, cdp, run, tag, it, answer=None, shoot_txt=(), shoot_ch=(), picks=(), max_s=None):
    """手機「今天」→ 那一列的「直接去上課」→ 照玩家：對話點過去、路上停下來選「繼續去上課」、坐位子；考卷的題目交給 answer(i, 題幹, 選項)（回傳要點第幾個；None＝照 pick_opt）。
    shoot_txt：[(fn(對話文字), 標籤)]，第一次成立時截直向＋橫向；shoot_ch：[(fn(選項文字, 上一句), 標籤)]。上完那一堂（CLS.attend 跑完）、畫面空下來就結束"""
    max_s = max_s or ENVI('TRIP_MAX', 900)
    out = {'ok': False, 'btn': None, 'stuck': False, 'jumped': False, 'shots': [], 'answers': []}
    day0 = (await P.clock(pg))['day']
    txt = await P.phone_tab(pg, cdp, 'today')
    sel = '#phoneBody [data-go="%s"]' % it['key']
    out['btn'] = await pg.evaluate(BTN_TXT, sel); out['today'] = txt[:700]
    out['shots'].append(await run.shot(pg, tag + '_today'))
    if not out['btn']:
        await L.close_panels(pg, cdp); return out
    n0 = await pl_n(pg); out['n0'] = n0; done_shots = set(); answered = set()
    await L.tap(pg, cdp, sel); await pg.wait_for_timeout(1200)
    t0 = time.time(); last = None; since = time.time()
    while time.time() - t0 < max_s:
        R = await rows(pg, n0)
        attended = any(r['k'] == 'attended' and r['n'] == it['key'] for r in R)
        s = await P.ts(pg); pos = await pg.evaluate(POS)
        free = not s['dlg'] and not s['ch'] and not s['busy'] and s['depth'] == 0 and not s['phone']
        if attended and free:
            out['ok'] = True; break
        if s['day'] != day0 and not attended:
            out['jumped'] = True; out['jumped_to'] = await P.clock(pg); out['shots'].append(await run.shot(pg, tag + '_jumped')); break
        sig = (s['day'], s['zone'], s['txt'][:40], tuple(o['t'] for o in s['ch']), s['busy'], s['depth'] > 0, tuple(pos))
        if sig != last: last = sig; since = time.time()
        elif free and time.time() - since > ENVI('STUCK_S', 240):
            out['stuck'] = True; out['stuck_at'] = {'clock': await P.clock(pg), 'pos': pos}; out['shots'].append(await run.shot(pg, tag + '_stuck')); break
        if s['phone'] and not s['ch'] and not s['dlg']:
            await L.phone_away(pg, cdp, tries=1); await pg.wait_for_timeout(500); continue
        if s['ch']:
            T = [o['t'] for o in s['ch']]; ls = last_say(R); lt = ls['t'] if ls else ''
            for fn, lab in shoot_ch:
                if lab not in done_shots and fn(T, lt):
                    done_shots.add(lab); await pg.wait_for_timeout(1500); out['shots'] += await shot2(pg, run, tag + '_' + lab)
            m = EXQ_RE.match(lt) if ls else None
            if m and answer and ls['i'] not in answered:
                answered.add(ls['i']); qi = int(m.group(1)); k = await answer(qi, m.group(2), T)
                if k is None: k, _ = pick_opt(s['ch'])
                out['answers'].append({'i': qi, 'stem': m.group(2), 'opts': T, 'pick': k, 'picked': T[k]})
                run.note('%s：第 %d 題 → 點「%s」' % (tag, qi, T[k][:40]))
                await P.tap_choice(pg, cdp, k); await pg.wait_for_timeout(1200); continue
            k, why = pick_opt(s['ch'], tuple(picks) + GO_PICKS)
            run.note('%s %s %s 選項 %s → %s' % (tag, hm(s['h']), s['zone'], J([t[:24] for t in T]), T[k][:30]))
            await P.tap_choice(pg, cdp, k); await pg.wait_for_timeout(1100); continue
        if s['dlg']:
            for fn, lab in shoot_txt:
                if lab not in done_shots and fn(s['txt']):
                    done_shots.add(lab); await pg.wait_for_timeout(2500); out['shots'] += await shot2(pg, run, tag + '_' + lab)
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(650); continue
        await pg.wait_for_timeout(900)
    out['end'] = await P.clock(pg); out['st'] = await pg.evaluate(KEYST, it['key'])
    if out['ok']: out['shots'].append(await run.shot(pg, tag + '_after'))
    out['R'] = await rows(pg, n0)
    run.note('%s：結束 %s；%s' % (tag, J(out['end']), J({k: out[k] for k in ('ok', 'stuck', 'jumped', 'st')})))
    return out


async def ff_until(pg, cdp, run, done_js, max_s, tag, prefer=('快轉', '到下一個有事', '睡到明天'), shoot_txt=()):
    """像玩家一樣快轉：床（宿舍）→ prefer 的第一個（快轉 → 到下一個有事的時候／日子；沒有快轉就睡到明天早上）；途中對話點過去、別的選單照 pick_opt、手機收起來。
    在家（寒暑假的 2D 選單）也是選單，照 prefer。done_js 成立（而且畫面沒有對話、選單）就停。回傳 (是否達成, 紀錄)"""
    t0 = time.time(); log = []; done_shots = set(); free_since = None; bed_fail = 0
    while time.time() - t0 < max_s:
        s = await P.ts(pg)
        if not s['dlg'] and not s['ch'] and await pg.evaluate(done_js): return True, log
        if s['ch']:
            T = [o['t'] for o in s['ch']]; k = None
            for p in prefer:
                k = next((i for i, o in enumerate(s['ch']) if o['t'].startswith(p) and not o['dim']), None)
                if k is not None: break
            if k is None: k, _ = pick_opt(s['ch'])
            c = await P.clock(pg); log.append([c['key'], hm(c['h']), c['zone'], T, T[k]])
            run.note('%s %s %s %s 選項 %s → %s' % (tag, c['key'], hm(c['h']), c['zone'], J([t[:22] for t in T]), T[k][:30]))
            await P.tap_choice(pg, cdp, k); await pg.wait_for_timeout(1300); free_since = None; continue
        if s['phone'] and not s['dlg']:
            await L.phone_away(pg, cdp, tries=1); await pg.wait_for_timeout(600); free_since = None; continue
        if s['dlg']:
            for fn, lab in shoot_txt:
                if lab not in done_shots and fn(s['txt']):
                    done_shots.add(lab); await pg.wait_for_timeout(2500); await shot2(pg, run, tag + '_' + lab)
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(650); free_since = None; continue
        if s['busy'] or s['depth'] > 0:
            await pg.wait_for_timeout(1000); continue
        if free_since is None: free_since = time.time(); await pg.wait_for_timeout(1500); continue   # 空下來先等一下（快轉停下來的字卡、自動存檔）
        if s['zone'] == 'dorm':
            ok = await press_bed(pg, cdp, run)
            if not ok:
                bed_fail += 1; run.note('%s：按床沒有出選單（第 %d 次）' % (tag, bed_fail))
                if bed_fail >= 4: return False, log + [['bed_fail']]
            free_since = None; continue
        if time.time() - free_since > ENVI('AWAY_S', 90):
            c = await P.clock(pg); run.note('%s：人在 %s（不是宿舍房間）空著 %d 秒，快轉不下去' % (tag, c['zone'], time.time() - free_since))
            return False, log + [['away', c]]
        await pg.wait_for_timeout(1500)
    return False, log + [['timeout']]


# ---------------------------------------------------------------- SE-06
COURSES = [('const_1', '憲法（上）', '2025-12-15', 7 + 40 / 60), ('crim_gen1', '刑法總則（一）', '2025-12-17', 7 + 40 / 60), ('civ_general', '民法總則', '2025-12-18', 12 + 20 / 60)]
JIAO = re.compile(r'交卷。答對 (\d)／5(?:，(\d+) 分。)?')


async def se06_round(pg, cdp, run, tr, base, rnd, summary):
    wrong_at = ENVI('WRONG_AT', 5) if rnd == 'four' else None
    S = summary.setdefault(rnd, {'courses': {}})
    n0 = await pl_n(pg)
    await load(pg, cdp, run, base, '2025-12-15 07:40 宿舍（最小存檔，法律系大一上；%s）' % ('examSeed=%s' % base['flags'].get('examSeed') if 'examSeed' in base['flags'] else 'examSeed 不設'))
    pre = await pg.evaluate(PRE); S['pre'] = pre
    run.check('SE-06 %s：前置 prep、study、notes 空、沒有課本（記錄）' % rnd,
              pre['prepSum'] == 0 and pre['study'] == 0 and pre['notes'] == 0 and not pre['textbook'] and not pre['books'] and not any(h for _, h in pre['hasBook']), J(pre))
    await tr.take(pg, n0, rnd, 'setup')
    todo = COURSES if ENVI('ALL3', 1) else COURSES[:1]
    for ci, (cid, cname, dkey, hh) in enumerate(todo):
        if ci > 0: await jump(pg, cdp, run, dkey, hh, 'dorm', label='下一科期末（%s）' % cname)
        it = await pg.evaluate(EXITEM, [cid, 'final'])
        run.note('SE-06 %s：%s 期末那一列 %s' % (rnd, cname, J(it)))
        if not isinstance(it, dict):
            run.check('SE-06 %s：%s 今天有期末那一列' % (rnd, cname), False, J(it)); continue
        ekey = 'Y1S1:%s:final' % cid

        async def answer(qi, stem, T, ekey=ekey):
            q = await pg.evaluate(EXQ, [ekey, qi - 1])
            if not isinstance(q, dict) or 'opt' not in q:
                run.note('【捷徑】讀不到第 %d 題的答案：%s → 照第一個' % (qi, J(q))); return 0
            if q.get('q') != stem: run.note('【捷徑】注意：讀到的題幹和畫面不同：%s ／ %s' % (q.get('q', '')[:40], stem[:40]))
            ok = next((i for i, t in enumerate(T) if t == q['opt']), None)
            if ok is None: run.note('【捷徑】第 %d 題的選項裡找不到正解文字 %s；選項 %s' % (qi, q['opt'], J(T))); return 0
            if wrong_at == qi: k = next(i for i in range(len(T)) if i != ok); why = '故意選錯'
            else: k = ok; why = '正解'
            run.setup('【捷徑：只讀】第 %d 題 %s 答案 %s → 點%s「%s」' % (qi, q['id'], q['answer'], why, T[k][:30]))
            return k

        n1 = await pl_n(pg)
        tag = 'se06_%s_%s' % (rnd, cid)
        r = await play_trip(pg, cdp, run, tag, it, answer=answer,
                            shoot_txt=[(lambda t: t.startswith('交卷。'), 'submit')],
                            shoot_ch=[(lambda T, lt: lt.startswith('1／5'), 'q1')] if ci == 0 else [])
        R = await tr.take(pg, n1, rnd, 'exam')
        says = [x['t'] for x in R if x['k'] == 'say']
        j = next((JIAO.search(t) for t in says if JIAO.search(t)), None)
        exrec = await pg.evaluate(EXREC, ekey)
        k = int(j.group(1)) if j else None; sc = int(j.group(2)) if j and j.group(2) else None
        want_k = 5 if rnd == 'all' else 4
        S['courses'][cid] = {'name': cname, 'shown_k': k, 'shown_score': sc, 'rec': exrec, 'answers': r['answers'], 'trip_ok': r['ok'], 'stuck': r['stuck'], 'jumped': r['jumped'],
                             'wrong_lines': [t for t in says if t.startswith('第 ') and '題的答案：' in t], 'shots': r['shots']}
        run.check('SE-06 %s：%s 一鍵去考試、考完（CLS.attend 跑完）' % (rnd, cname), r['ok'], J({x: r[x] for x in ('btn', 'stuck', 'jumped', 'end')}))
        run.check('SE-06 %s：%s 交卷畫面 答對 %d／5、%d 分' % (rnd, cname, want_k, SCORE[want_k]), k == want_k and sc == SCORE[want_k],
                  '畫面：%s；R.exam：%s' % (j.group(0) if j else '（沒有交卷那一句）', J({x: (exrec or {}).get(x) for x in ('correct', 'score', 'status')})))
        run.check('SE-06 %s：%s 交卷的分數＝S.scoreOf(答對題數)、和 R.exam 一致' % (rnd, cname), j is not None and sc == SCORE[k] and (exrec or {}).get('score') == sc and (exrec or {}).get('correct') == k,
                  J({'k': k, 'score': sc, 'rec': exrec}))
    # ② 成績公布日
    summary['walk_before_grades'] = await pg.evaluate("GAME.walkFallbacks||0")
    last_day = todo[-1][2]
    await jump(pg, cdp, run, last_day, 20.0, 'dorm', label='考完人在教室；床在宿舍，放回宿舍同一天 20:00')
    n2 = await pl_n(pg)
    gl = lambda t: '憲法（上）：' in t or '刑法總則（一）：' in t
    got = False; how = None
    if ENVI('GRADE_FF', 1):
        got, log = await ff_until(pg, cdp, run, "(()=>{ const R=CLS.rec(GAME.G); return !!(R.grades&&R.grades.Y1S1); })()", ENVI('GRADE_FF_S', 1800), 'se06_%s_ff' % rnd,
                                  shoot_txt=[(gl, 'grades')])
        S['grade_ff_log'] = log; how = '照玩家快轉（床「快轉」→「到下一個有事的…」／「睡到明天早上」）' if got else None
        run.note('SE-06 %s：快轉到成績公布日 %s；停了 %d 次選單' % (rnd, '到了' if got else '沒到（%s）' % J(log[-1:]), len(log)))
    if not got:
        await jump(pg, cdp, run, '2026-01-04', 22.5, 'dorm', label='【捷徑】快轉沒等到成績單，改成跳到公布日前一晚，照玩家去床睡到明天早上')
        got, log2 = await ff_until(pg, cdp, run, "(()=>{ const R=CLS.rec(GAME.G); return !!(R.grades&&R.grades.Y1S1); })()", 600, 'se06_%s_sleep' % rnd, prefer=('睡到明天',), shoot_txt=[(gl, 'grades')])
        S['grade_sleep_log'] = log2; how = '【前置／捷徑】跳到 2026-01-04 22:30 → 床「睡到明天早上」' if got else '沒等到'
    R = await tr.take(pg, n2, rnd, 'grades')
    says = [x['t'] for x in R if x['k'] == 'say']
    gi = next((i for i, t in enumerate(says) if t.endswith('的成績出來了。') and '大一上' in t), None)
    line = says[gi + 1] if gi is not None and gi + 1 < len(says) else None
    gr = await pg.evaluate(GRADES, 'Y1S1')
    S['grades'] = {'how': how, 'clock': await P.clock(pg), 'line': line, 'rec': gr}
    run.check('SE-06 %s：成績單發出來（%s）' % (rnd, how), line is not None, J({'line': line, 'clock': S['grades']['clock']}))
    for cid, cname, _, _ in todo:
        c = S['courses'].get(cid) or {}
        m = re.search(re.escape(cname) + r'：([^　]+)', line or '')
        want = ('%d 分' % c['shown_score']) if c.get('shown_score') is not None else None
        run.check('SE-06 %s：成績單「%s」和交卷畫面一致（%s）' % (rnd, cname, want), m is not None and want is not None and m.group(1) == want and ((gr or {}).get('grades') or {}).get(cid) == want,
                  J({'成績單': m.group(1) if m else None, '交卷': c.get('shown_score'), 'R.grades': ((gr or {}).get('grades') or {}).get(cid)}))
    if len(todo) < 3:
        run.note('INFO SE-06 %s：ALL3=0 只考憲法，刑總、民總缺考（成績單寫什麼照記：%s）；HONOR.avg=%s（缺考算 0）' % (rnd, line, (gr or {}).get('avg')))
    # ③ 下學期第 2 週週一 09:00 書卷獎公告
    n3 = await pl_n(pg)
    snap = await pg.evaluate("()=>GAME.snapshot()")
    got_h = False
    if ENVI('HONOR_FF', 0):
        got_h, logh = await ff_until(pg, cdp, run, "(()=>GAME.G.flags.HONOR_Y1S1!=null)()", ENVI('HONOR_FF_S', 2400), 'se06_%s_ffh' % rnd)
        S['honor_ff_log'] = logh
    if not got_h:
        d = await jump(pg, cdp, run, '2026-03-02', 8 + 40 / 60, 'dorm', snap=snap, label='【前置】寒假到下學期第 2 週這段不照玩家快轉（太長），直接跳；之後站著等到 09:05')
        avg = await pg.evaluate(GRADES, 'Y1S1'); S['honor_before'] = avg
        ok = await P.wait_play(pg, cdp, 9 + 5 / 60, max_s=900, day=d['d'], run=run, tag='se06_%s_wait' % rnd)
        run.note('SE-06 %s：等到 09:05 %s' % (rnd, ok))
    await pg.wait_for_timeout(2500)
    gr2 = await pg.evaluate(GRADES, 'Y1S1')
    th = await P.phone_thread(pg, cdp, 'sys')
    txt = th.get('text') or ''
    S['honor'] = {'rec': gr2, 'sys_thread_found': th.get('ok'), 'sys_text': txt[-1500:], 'clock': await P.clock(pg)}
    if th.get('ok'): S['honor']['shots'] = await shot2(pg, run, 'se06_%s_honor' % rnd)
    else: S['honor']['shots'] = [await run.shot(pg, 'se06_%s_msglist' % rnd)]
    await L.close_panels(pg, cdp)
    await tr.take(pg, n3, rnd, 'honor')
    has = '書卷獎名單' in txt
    exp = (gr2 or {}).get('won')
    run.check('SE-06 %s：手機系統訊息的書卷獎公告 %s；和 HONOR.avg=%s（≥4 才有）一致' % (rnd, '有' if has else '沒有', (gr2 or {}).get('avg')), th.get('ok') and has == bool(exp),
              J({'公告': has, 'won': exp, 'flag': (gr2 or {}).get('flag'), 'thread': th.get('ok')}))
    summary['walk_end_%s' % rnd] = await pg.evaluate("GAME.walkFallbacks||0")


async def main():
    from playwright.async_api import async_playwright
    URL, OUT = sys.argv[1], sys.argv[2]
    rounds = [x.strip() for x in ENVS('ROUNDS', 'all,four').split(',') if x.strip()]
    run = L.Run('se06_' + '+'.join(rounds), OUT); os.makedirs(OUT, exist_ok=True)
    tr = TR('SE-06'); summary = {'sha': os.environ.get('SHA', '?'), 'url': URL, 'rounds': rounds, 'env': {k: os.environ.get(k) for k in ('ALL3', 'WRONG_AT', 'EXAM_SEED', 'GRADE_FF', 'HONOR_FF')}}
    print('==== SE-06（SHA %s）不用 turbo；作答用【捷徑：只讀】；不是 iPhone ====' % summary['sha'], flush=True)
    if '?turbo' in URL or '&turbo' in URL: run.note('注意：URL 有 turbo，SE-06 規定不用 turbo')
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        pg.on('dialog', lambda dd: asyncio.ensure_future(dd.accept()))
        try:
            await pg.goto(URL); ok = await L.wait_loaded(pg); run.check('SE-06：遊戲載入', ok)
            await pg.evaluate("localStorage.clear()"); await P.init(pg); await pg.evaluate(HOOK)
            seed = ENVS('EXAM_SEED', '20251215')
            base, d = await state_at(pg, '2025-12-15', 7 + 40 / 60, 'dorm', flags=({} if seed == 'none' else {'examSeed': int(seed)}))
            summary['base_day'] = d
            for rnd in rounds:
                if rnd not in ('all', 'four'): run.check('ROUNDS %s 認得（all／four）' % rnd, False); continue
                try: await se06_round(pg, cdp, run, tr, base, rnd, summary)
                except Exception as e:
                    run.check('SE-06 %s：跑完（沒有探針例外）' % rnd, False, repr(e)[:500]); traceback.print_exc()
                    try: await run.shot(pg, 'se06_%s_exception' % rnd)
                    except Exception: pass
            if 'all' in summary and 'four' in summary:
                qa = [a['stem'] for a in summary['all']['courses'].get('const_1', {}).get('answers', [])]
                qb = [a['stem'] for a in summary['four']['courses'].get('const_1', {}).get('answers', [])]
                run.note('INFO 兩輪憲法抽到的題目%s（examSeed %s）' % ('相同' if qa == qb else '不同', seed))
        except Exception as e:
            run.check('SE-06：跑完（沒有探針例外）', False, repr(e)[:500]); traceback.print_exc()
        run.check('SE-06：沒有 JS 例外', not errs, J(errs[:3]))
        hx = tr.hits(phases=('exam', 'grades'))
        run.check('SE-06：考試＋成績單那幾段的逐字稿沒有黑名單字（%s）' % '、'.join(BLACK), not hx, J(hx[:10]))
        ho = [h for h in tr.hits() if h['phase'] not in ('exam', 'grades')]
        run.note('INFO 其他時段（快轉途中、前置、書卷獎）黑名單字 %d 筆（給 BB 看上下文）：%s' % (len(ho), J(ho[:20])))
        summary['blacklist'] = {'exam_grades': hx, 'other': ho}
        summary['walkFallbacks'] = await pg.evaluate("GAME.walkFallbacks||0") if pg else None
        run.note('INFO GAME.walkFallbacks=%s（這支用了作答捷徑與跳日期前置，本來就不算完整玩家流程；只記錄）' % summary['walkFallbacks'])
        p1 = tr.save(OUT)
        for k in list(summary.keys()):
            if isinstance(summary[k], dict):
                for c in (summary[k].get('courses') or {}).values(): c.pop('R', None)
        json.dump(summary, open(os.path.join(OUT, 'se06_summary.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1, default=str)
        run.note('逐字稿 %s（%d 筆）；摘要 se06_summary.json；截圖 %d 張（請接 screencheck、看縮圖總表）' % (p1, len(tr.items), run.n))
        try: await asyncio.wait_for(b.close(), 30)
        except Exception: pass
    print('SHA', summary['sha'], flush=True)
    sys.exit(run.finish())


if __name__ == '__main__':
    asyncio.run(main())
