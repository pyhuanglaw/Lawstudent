"""CC（帳號 A）11-02：D118-B3「一鍵總複習」的瀏覽器驗收探針（BB_222 一-3／SE 共同規則：TR 逐字稿、【前置／捷徑】標示、直向橫向各一張）。
規格：D118_PLAN.md D118-B3（第 233–250 行）；BB_222 的 3-5「一-3 期中、期末考前可以用一鍵總複習」。
不是 iPhone：Playwright 手機橫向模擬（SwiftShader 1～4 fps）。**不用 ?turbo**（S1 的總複習、期末作答照玩家）。

版本：
  修改後＝開發分支含 cea266e81（Merge D118-B3-1102：ce9534b5 實作、2a4e7f08 單元測試）。
  修改前基準＝cea266e81 的上一個 commit 299e2334556fd4c50d5e56d2007ea479b244e2ec（B2 已在、STUDY.review 不存在）：
    入口（書桌、Café 桌的選單）沒有「考前總複習」→ 每個情境的「入口有考前總複習」FAIL，之後依賴總複習的檢查 FAIL／略過（照實記）。

讀碼（cea266e81）看到的：
  - 只有期末（使用者 05:0x「沒有期中考」：STUDY.reviewInfo(G,'mid') 一律 null）。所以「期中」這裡不測、只記。
  - 開放：這學期期末週第一天（大一上＝2025-12-15 一）往前 7 天起（2025-12-08，第 15 週週一）～這學期的期末考考完／時間過了。
    大一上三科：憲法（上）12/15 09:10、刑法總則（一）12/17 09:10、民法總則 12/18 13:20。範圍 9＋8＋10＝27 張觀念卡（node 算的）。
  - 入口（選單那一項，暫定字「考前總複習」＝STUDY.REVIEW_LABEL）：
      宿舍書桌（「坐在書桌前」→ story3d.js deskScene：讀書／整理今天的筆記／考前總複習／起身）
      讀書座位、Café 桌（「坐在這一桌」cafeTable → game3d.js seatMenu：…點杯咖啡慢慢讀／考前總複習／起身）
      週末回家的 2D 選單（HOME.MENU_OPTS）。semff 考前停點：讀碼沒看到入口（D118_PLAN 寫要有）→ 這支不測、只記。
  - 按一次：先 GM.advance(3)、G.stats.study +3、STORY.onStudy；範圍內全部卡設「讀過」（先設好，跳過、提早結束也算）；不呼叫 slotUse（時段次數不扣）；
    翻頁「【課名　k／N】標題」→ 內容幾句 → 選單「下一張／跳到下一科／結束總複習」；結束字幕每科一行「<課名>　期末範圍：學過 a／b・答對過 c」（GAME.caption，2400+1200×科數 ms）。
  - 不給（變灰、按了 toast、不耗時間）：開始時間 +3 小時 > 24（＝21:00 起就不給，21:00 本身也不給）；閉館前讀不完（總圖 22:00）；會錯過今天還沒考的期末考。
  - 考試週前一週的週日（2025-12-14）20:00 手機系統提醒（tag review_Y1S1）；這支只記有沒有收到。
  - Café 用總複習：不點咖啡、不扣錢（seatMenu 的 review 分支沒有 money）。

CASES（逗號隔開；預設全跑；每個 case 開一個新的瀏覽器、從最小存檔開始）：
  S1           【前置】最小存檔（法律系大一上、prep／study／notes 空、沒上過課、沒有課本、examSeed 固定）2025-12-13（六，第 15 週）14:00 宿舍
               → 照玩家走到書桌「坐在書桌前」→「考前總複習」→ 每張卡按「下一張」讀到最後（S1_READ=all；end＝第一張就結束）→ 記時間、進度、字幕
               →【前置】同一份進度跳到 12/15 07:40 宿舍 → 手機「今天」憲法期末「直接去上課」→ 照玩家點對話 → 考卷【捷徑：只讀】讀正解再點，
                 第 WRONG_AT 題（預設 5）故意選錯＝每科 4／5、90 分；12/17、12/18 同樣（各自【前置】跳到那天）
               →【前置】跳到 2026-01-04 22:30 宿舍 → 照玩家走到床「睡到明天早上」→ 成績單（照答對題數＝CLS.scoreOf）；成績單後幾句對話記成「人物反應」INFO
               → ☰「存檔」欄位 SLOT（預設 1）→ 重新整理 → 標題「讀取」欄位 → 讀進來：總複習的效果（每科「讀過」數、G.study）、R.exam、R.grades 和存檔前相同。
  night        【前置】2025-12-12（五）宿舍 21:30、21:00、20:45 各讀一次 → 書桌選單：21:30／21:00 那一項要變灰（或沒有），按了有提示、時間不動；20:45 可以選（只看不按）。
  repeat       【前置】2025-12-13（六）09:00 宿舍 → 書桌總複習（第一張就「結束總複習」）→ 再按一次 → 記兩次的開始、結束時間（每次都是 3 小時、同一天）、時段次數 G.slots 不變。
  seed         【前置】同一份存檔（examSeed 固定）2025-12-14（日）14:00 宿舍讀兩次：A 做總複習、B 不做；各自【前置】跳到 12/15 07:40 → 照玩家考憲法期末（作答照第一個選項，分數不比）
               → 比 R.exam 的 5 題題號（相同才 PASS）；另外 INFO：兩邊在頁面裡用複製的存檔各抽三科（CLS.drawExam on clone，不寫回）。
  S2a／S2b     （5d3fbd32e 以後；S2 的修改前基準＝5d3fbd32e^ 6ba2a22ad08cb70c07bbf198736f55a7c045d75b：快轉不會停在這個提醒）
               【前置】最小存檔 2025-12-04（四，第 14 週）22:00 宿舍（S2_START 可換）→ 照玩家：床「快轉」→「過一週」（FF_PICK）；停下來就再按床，
               途中停在「有劇情的課快開始了」就照玩家去上那一堂；跳出「考前總複習／繼續快轉／先停在這裡」（12/14 20:00）時截直向＋橫向，
               S2a 選「考前總複習」（翻頁第一張就結束，S2_READ）→ 停在 12/14 23:00、等 20 秒時間不跳；S2b 選「繼續快轉」→ 停在 12/15 憲法期末前。
               兩個都記整段快轉每一次 SEMFF.jump 的回傳（why／stop／待回訊息）和系統訊息出現時間（s2_<case>_stops.json），檢查 why=remind 只有一次、沒有因其他 sys 訊息多停。
  only_untaken 已考完一科，總複習只算還沒考的：
               inject：【前置／捷徑】2025-12-12（五）19:00 宿舍，存檔的 R.exam 寫入憲法期末 status done（4／5、90 分；不經過考試）→ 書桌選單提示「2 科」→ 總複習：
                       開始那句「2 科」、卡的標題沒有【憲法（上）…】、結束字幕沒有「憲法（上）」——考試時間還沒到，只有 status 讓它排除（隔離「已考」這一條）。
               real：  【前置】12/15 07:40 宿舍 → 照玩家考憲法（【捷徑】作答 4／5）→【前置】同一份進度跳到 12/15 14:00 宿舍 → 同樣檢查（這裡「時間已過」也會排除，兩個原因混在一起）。
               OU_MODES=inject,real（預設兩個都跑）。
  multi_caption【前置】2025-12-13（六）09:00 宿舍 → 書桌總複習第一張就結束 → 結束字幕（三科三行）出來那一刻截橫向；
               再把視窗改成直向 390×844、按第二次總複習 → 結束字幕出來那一刻截直向（字幕只顯示約 6 秒，旋轉來不及＝用第二次總複習拍直向）。
  cafe_free    【前置】2025-12-13（六）13:00 兩點半 Café（money 30000）→ 照玩家走到桌子「坐在這一桌」→ 選單（記有沒有「點杯咖啡慢慢讀」「考前總複習」）→ 總複習（第一張就結束）
               → 金額前後相同、時間 +3。

每個 case 都 check：入口有「考前總複習」（修改前 FAIL）。check 只客觀記錄；判定由 BB 做（CC 初判）。
逐字稿：<輸出>/transcript_<case>.json（GAME.say／caption／toast／choose／titleCard／手機訊息／STUDY.review 開始結束）。摘要：d118b3_summary.json。
用法：LW_TESTS=<工作樹>/tests SHA=<sha> [CASES=S1,night,...] python3 cc_d118b3_probe.py '<URL>/index.html' <輸出資料夾>
環境變數：CASES　EXAM_SEED=20251215　WRONG_AT=5　S1_READ=all　SLOT=1　OU_MODES=inject,real　TRIP_MAX=900　STUCK_S=240　REVIEW_MAX=1500　REVIEW_LABEL=考前總複習
預估（SwiftShader）：S1 45～60 分、night 8、repeat 10、seed 25～30、only_untaken 20（inject 6＋real 14）、multi_caption 10、cafe_free 8；全跑約 2～2.5 小時。
"""
import os, sys, json, asyncio, re, time, copy, traceback
sys.path.insert(0, os.environ.get('LW_TESTS', '')); import playlib as L
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__)))); import bbplay as P   # bbplay 在上一層（BB 的 test_tools）

J = lambda o: json.dumps(o, ensure_ascii=False)
ENVI = lambda k, d: int(os.environ.get(k, str(d)))
ENVS = lambda k, d: os.environ.get(k, d)
ALL_CASES = ['S1', 'S1b', 'S2a', 'S2b', 'night', 'repeat', 'seed', 'only_untaken', 'multi_caption', 'cafe_free']
CASES = [c.strip() for c in ENVS('CASES', ','.join(ALL_CASES)).split(',') if c.strip()]
LABEL = ENVS('REVIEW_LABEL', '考前總複習')
SCORE = [0, 60, 70, 80, 90, 100]   # classes3d.js S.scoreOf
LAND = {'width': 844, 'height': 390}
PORT = {'width': 390, 'height': 844}
LAW3 = [('const_1', '憲法（上）', '2025-12-15', 7 + 40 / 60), ('crim_gen1', '刑法總則（一）', '2025-12-17', 7 + 40 / 60), ('civ_general', '民法總則', '2025-12-18', 12 + 20 / 60)]
SEED = ENVS('EXAM_SEED', '20251215')
URL = OUT = None
SUMMARY = {}


def hm(h):
    if h is None: return '--:--'
    m = int(round(float(h) * 60)); return '%02d:%02d' % (m // 60, m % 60)


def dump(name, obj):
    p = os.path.join(OUT, name)
    json.dump(obj, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=1, default=str); return p


# ---------------------------------------------------------------- 存檔（cc_dl04b_probe／cc_se06_probe 的 state_at、load、jump）
BASEF = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True, 'metAn': True, 'met_an': True, 'MET_ZHE': True,
         'zheNoodleDone': True, 'KX_FIRST_MSG': True, 'KX_EVE_MSG': True, 'FAM_GROUP_SENT': True, 'CEREMONY_Y1': True, 'KAI_MOVEIN': True, 'LAW_RECAP_SEEN': True,
         'fundsV2': 1, 'KX_DEC3_MIGRATED': True, 'dating_kexin': False}   # 法律系、過了開場；dating_kexin 拿掉（交往中的可昕會把成績單留到晚上：story3d.js S.holdGrades）
ROOMS = (('ROOM_Y2', '2026-09-06'), ('ROOM_Y3', '2027-09-05'), ('ROOM_Y4', '2028-09-03'))
VISITED = ('noodle', 'cafe', 'library_hall', 'library', 'lawlib', 'wancai', 'linze', 'gongguan', 'wenzhou', 'soclib', 'cvs', 'bookstore')
CLEARP = "(()=>{ if(typeof CLS!=='undefined'&&CLS.clearPending){ CLS.clearPending(); return true; } return false; })()"


async def state_at(pg, key, h, zone, flags=None, pos=None, weather='clear', money=30000):
    """法律系的最小存檔改到那一天、那個時間、那一區；key 'YYYY-MM-DD'"""
    d = await P.day_of(pg, key)
    st = {'name': '祐廷', 'energy': 100, 'events': {'done': {}, 'last': {}, 'count': 0}, 'contacts': {}}
    F = st['flags'] = dict(BASEF)
    for k, kk in ROOMS:
        dd = (await P.day_of(pg, kk))['d']
        if dd <= d['d']: F[k] = dd
    if SEED != 'none': F['examSeed'] = int(SEED)
    F.update(flags or {})
    st.update(day=d['d'], weekday=d['wd'], hour=h, zone=zone, pos=pos, weather=weather, stage='law', money=money)
    st['visited'] = {z: True for z in VISITED}
    return st, d


async def load(pg, cdp, run, st, label, tagp='[前置] '):
    """[前置] 讀檔（遊戲自己的 GAME.applySave，條件事件照開）＋清掉還沒出的選單（同重新整理）；手機自己打開（D103）照玩家收起來"""
    await L.load_state(pg, st, quiet_events=False, quiet_phone=False); await pg.evaluate(CLEARP)
    await pg.wait_for_timeout(3500)
    await L.phone_away(pg, cdp, tries=2)
    run.setup(tagp + label)


async def jump(pg, cdp, run, key, h, zone='dorm', snap=None, label=''):
    """[前置] 同一份進度（GAME.snapshot()，或給 snap）改日期、時間、地點（pos=None＝那一區的出生點）再讀；條件事件照開"""
    s = copy.deepcopy(snap) if snap is not None else await pg.evaluate("()=>GAME.snapshot()")
    d = await P.day_of(pg, key)
    s.update(day=d['d'], weekday=d['wd'], hour=h, zone=zone, pos=None)
    s.pop('_stuck', None); s.pop('_busy', None)
    await load(pg, cdp, run, s, '同一份進度跳到 %s（%s 第 %s 週）%s %s%s' % (d['key'], d['term'], d['week'], hm(h), zone, ('；' + label) if label else ''), tagp='【前置／捷徑：跳日期】')
    return d


# ---------------------------------------------------------------- 記錄（只記不改）
HOOK = r"""(()=>{ if(window.__PLH) return 'again'; window.__PLH=1; window.__PL=[]; window.__PLN=0;
  const at=()=>{ try{ return {d:CALENDAR.dateOf(GAME.G.day).key, h:+(+GAME.G.hour).toFixed(3), z:GAME.G.zone}; }catch(e){ return {}; } };
  const push=o=>{ try{ Object.assign(o,at()); o.i=++window.__PLN; window.__PL.push(o); if(window.__PL.length>60000) window.__PL.splice(0,10000); }catch(e){} return o; };
  const s0=GAME.say; GAME.say=function(w,t){ push({k:'say',n:(w&&w.name)||(typeof w==='string'?w:''),t:String(t==null?'':t)}); return s0.apply(this,arguments); };
  const c0=GAME.choose; GAME.choose=function(o){ push({k:'choose',n:'',t:(o||[]).filter(x=>x&&!x.hidden).map(x=>((x.t||x.text)||'')+(x.hint?'〔'+x.hint+'〕':'')+(x.dim?'〔dim〕':'')).join('｜'),opts:(o||[]).filter(x=>x&&!x.hidden).map(x=>String((x.t||x.text)||''))}); return c0.apply(this,arguments); };
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
  /* D118-B3：STUDY.review 開始、結束（修改前沒有這個函式＝不掛）*/
  if(typeof STUDY!=='undefined'&&typeof STUDY.review==='function'){ const r0=STUDY.review; STUDY.review=async function(GM,kind,o){ push({k:'review0',n:String(kind||''),t:JSON.stringify(o||{})}); let r; try{ r=await r0.apply(this,arguments); } finally { push({k:'review1',n:String(kind||''),t:JSON.stringify(r===undefined?null:r)}); } return r; }; }
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
    """逐字稿：每一段收進來，最後存成 transcript_<case>.json"""
    def __init__(self, case): self.case = case; self.items = []

    async def take(self, pg, n0, phase):
        R = await rows(pg, n0)
        for r in R:
            if r['k'] in ('say', 'choose', 'cap', 'toast', 'card', 'msg', 'ev', 'enter', 'exam', 'grades', 'review0', 'review1'):
                self.items.append(dict(r, case=self.case, phase=phase))
        return R

    def save(self):
        p = os.path.join(OUT, 'transcript_%s.json' % self.case)
        json.dump(self.items, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=1); return p


async def shot2(pg, run, label):
    """同一刻橫向＋直向"""
    a = await run.shot(pg, label + '_land')
    try:
        await pg.set_viewport_size(PORT); await pg.wait_for_timeout(ENVI('ROT_MS', 2500))
        b = await run.shot(pg, label + '_port')
    finally:
        await pg.set_viewport_size(LAND); await pg.wait_for_timeout(1500)
    return [a, b]


# ---------------------------------------------------------------- 頁面裡讀（只讀；STUDY.rec 第一次讀到會補 G.study 預設——遊戲「法律」頁也會，記在報告）
EXITEM = r"""(([cid,kind])=>{ try{ const G=GAME.G; const it=CLS.dayItems(G).find(q=>q.c&&q.c.id===cid&&(kind?q.exam===kind:!q.exam)); if(!it) return null; const rm=it.room||{};
  return {key:it.key,cid:it.c.id,name:it.c.name,exam:it.exam||null,term:it.term,week:it.week,t0:it.t0,t1:it.t1,room:rm.name||null,status:CLS.status(G,it)}; }catch(e){ return 'ERR '+e.message; } })"""
KEYST = """(key=>{ try{ const G=GAME.G, it=CLS.dayItems(G).find(q=>q.key===key), R=CLS.rec(G); return {status:it?CLS.status(G,it):null,done:!!R.done[key]}; }catch(e){ return {err:String(e.message)}; } })"""
BTN_TXT = "(s=>{ const e=document.querySelector(s); return e?(e.textContent||'').trim():null; })"
POS = "(()=>{ const p=GAME.E.player.obj.position; return [Math.round(p.x*2)/2, Math.round(p.z*2)/2, GAME.E.player.lv|0, !!GAME.E.player.seat]; })()"
EXQ = r"""(([key,i])=>{ try{ const R=CLS.rec(GAME.G), e=(R.exam||{})[key]; const id=e&&e.qs&&e.qs[i]; if(!id) return {miss:'R.exam 沒有這一題',key,i,have:Object.keys(R.exam||{})};
  const q=(typeof EXAM_BANK!=='undefined'?EXAM_BANK.questions:[]).find(x=>x.id===id); if(!q) return {id,miss:'EXAM_BANK 找不到'};
  const opt=(q.type==='tf'||!q.options)?String(q.answer):'（'+q.answer+'）'+q.options[q.answer]; return {id,q:q.q,answer:q.answer,opt,type:q.type||null}; }catch(e){ return {err:String(e.message)}; } })"""
EXREC = r"""(key=>{ try{ const R=CLS.rec(GAME.G); return (R.exam||{})[key]||null; }catch(e){ return {err:String(e.message)}; } })"""
GRADES = r"""(t=>{ try{ const R=CLS.rec(GAME.G); return {grades:(R.grades||{})[t]||null}; }catch(e){ return {err:String(e.message)}; } })"""
# 學習狀態：三科的進度、G.study（卡片狀態數量）、stats.study、時段、錢、時間；reviewInfo／reviewOpt（修改前沒有＝null）
ST = r"""(()=>{ const G=GAME.G, R=CLS.rec(G), F=G.flags||{}; const has=typeof STUDY!=='undefined';
  const prog={}; if(has&&STUDY.progress) for(const cid of ['const_1','crim_gen1','civ_general']){ const c=CLS.byId?CLS.byId(cid):null; try{ prog[cid]=STUDY.progress(G,c||cid,'final','Y1S1'); }catch(e){ prog[cid]={err:String(e.message)}; } }
  const s=G.study||null, cnt={}; if(s&&s.u) for(const v of Object.values(s.u)) cnt[v]=(cnt[v]||0)+1;
  let info=null, opt=null; try{ if(has&&STUDY.reviewInfo){ const i=STUDY.reviewInfo(G,'final'); info=i?{term:i.term,courses:i.courses.map(x=>[x.c.id,x.units.length])}:null; } }catch(e){ info={err:String(e.message)}; }
  try{ if(has&&STUDY.reviewOpt) opt=STUDY.reviewOpt(G); }catch(e){ opt={err:String(e.message)}; }
  return {day:CALENDAR.dateOf(G.day).key,h:+(+G.hour).toFixed(3),zone:G.zone,money:G.money,studyStat:(G.stats||{}).study||0,slots:G.slots||null,
    prep:R.prep||{},notes:(G.notes||[]).length,done:Object.keys(R.done||{}).length,examSeed:F.examSeed==null?null:F.examSeed,examRec:Object.keys(R.exam||{}),
    hasReview:has&&typeof STUDY.review==='function',label:has&&STUDY.REVIEW_LABEL||null,prog,studyU:cnt,miss:s&&s.miss?s.miss.length:null,info,opt}; })()"""
DRAWS = r"""(()=>{ try{ const G2=JSON.parse(JSON.stringify(GAME.G)); return ['const_1','crim_gen1','civ_general'].map(cid=>[cid,(CLS.drawExam(G2,cid,'Y1S1','final').qs||[]).map(q=>q.id)]); }catch(e){ return {err:String(e.message)}; } })()"""
QRANK = r"""(qs=>{ try{ if(typeof STUDY==='undefined'||!STUDY.unitsOfQ) return null; return qs.map(q=>[q,STUDY.unitsOfQ(q).map(u=>[u.id,STUDY.status(GAME.G,u)])]); }catch(e){ return {err:String(e.message)}; } })"""
IT_LIST = r"""(kind=>{ const E=GAME.E, P=E.player.obj.position; const L=(E.interactables||[]).filter(i=>!i.hidden&&(kind==='desk'?i.deskStudy:kind==='cafe'?i.cafeTable:kind==='bed'?i.sleep:false));
  L.sort((a,b)=>Math.hypot(a.x-P.x,a.z-P.z)-Math.hypot(b.x-P.x,b.z-P.z)); return L.map(it=>({x:it.x,z:it.z,lv:it.lv||0,label:it.label||'',r:it.radius||1})); })"""


# ---------------------------------------------------------------- 照玩家操作（cc_se06_probe 的 pick_opt、press_bed、play_trip、ff_until）
DECL = ('晚一點', '不去了', '自己走過去', '先不', '不用了', '算了', '就這樣', '先這樣', '沒事', '「我晚上要念書。」', '「那天我有事。」', '「我也要念書。」', '「我週六有事。」')
GO_PREFIX = ('出發：', '直接過去：', '接起來：', '上線：')
GO_PICKS = ('繼續去上課', '老位子', '坐中間的位子', '還是進去聽')


def pick_opt(ch, picks=()):
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
        if not T[i].startswith(GO_PREFIX) and '存檔' not in T[i] and not T[i].startswith(LABEL): return i, 'first'
    return live[0], 'first'


async def press_bed(pg, cdp, run):
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
    """手機「今天」→ 那一列的「直接去上課」→ 照玩家：對話點過去、路上選「繼續去上課」、坐位子；考卷題目交給 answer(i, 題幹, 選項)；上完那一堂、畫面空下來就結束"""
    max_s = max_s or ENVI('TRIP_MAX', 900)
    out = {'ok': False, 'btn': None, 'stuck': False, 'jumped': False, 'shots': [], 'answers': []}
    day0 = (await P.clock(pg))['day']
    txt = await P.phone_tab(pg, cdp, 'today')
    sel = '#phoneBody [data-go="%s"]' % it['key']
    out['btn'] = await pg.evaluate(BTN_TXT, sel); out['today'] = txt[:700]
    out['shots'].append(await run.shot(pg, tag + '_today'))
    if not out['btn']:
        await L.close_panels(pg, cdp); return out
    n0 = await pl_n(pg); done_shots = set(); answered = set()
    await L.tap(pg, cdp, sel); await pg.wait_for_timeout(1200)
    t0 = time.time(); last = None; since = time.time(); retaps = 0
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
        elif free and not attended and retaps < 3 and time.time() - since > 20 and s['h'] < it.get('t0', 99):
            # 劇情（例：期末日早上的室友）進行中按一鍵上課＝遊戲回「現在不能移動」、沒有開始；玩家會在劇情結束後再按一次（cloud b4_S1 12/17，BB 14:27）
            retaps += 1; run.note('%s：畫面空下來 20 秒還沒出門，像玩家一樣再按一次手機「今天」的一鍵（第 %d 次）' % (tag, retaps))
            await P.phone_tab(pg, cdp, 'today')
            if await pg.evaluate(BTN_TXT, sel): await L.tap(pg, cdp, sel)
            else: await L.close_panels(pg, cdp)
            await pg.wait_for_timeout(1200); last = None; since = time.time(); continue
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
    out['R'] = await rows(pg, n0)
    run.note('%s：結束 %s；%s' % (tag, J(out['end']), J({k: out[k] for k in ('ok', 'stuck', 'jumped', 'st')})))
    return out


async def ff_until(pg, cdp, run, done_js, max_s, tag, prefer=('睡到明天',), shoot_txt=()):
    """像玩家一樣：床（宿舍）→ prefer 的第一個；途中對話點過去、別的選單照 pick_opt、手機收起來。done_js 成立（畫面沒有對話、選單）就停"""
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
        if free_since is None: free_since = time.time(); await pg.wait_for_timeout(1500); continue
        if s['zone'] == 'dorm':
            ok = await press_bed(pg, cdp, run)
            if not ok:
                bed_fail += 1; run.note('%s：按床沒有出選單（第 %d 次）' % (tag, bed_fail))
                if bed_fail >= 4: return False, log + [['bed_fail']]
            free_since = None; continue
        if time.time() - free_since > ENVI('AWAY_S', 90):
            c = await P.clock(pg); run.note('%s：人在 %s 空著，快轉不下去' % (tag, c['zone'])); return False, log + [['away', c]]
        await pg.wait_for_timeout(1500)
    return False, log + [['timeout']]


# ---------------------------------------------------------------- 總複習的入口與翻頁
MENU_END = ('起身',)   # 書桌、座位選單的最後一項


async def open_menu(pg, cdp, run, kind, tag):
    """照玩家：走到 kind（desk＝宿舍書桌「坐在書桌前」、cafe＝Café 桌「坐在這一桌」）→ 按互動鍵 → 途中的對話點過去 → 停在有「起身」的選單。
    Café 桌有人坐（toast「有人坐了」）就換下一張桌子。回傳 {ok, ch:[{t,dim}], idx:總複習那一項的位置或 None, hint, item}"""
    out = {'ok': False, 'ch': None, 'idx': None, 'item': None}
    items = await pg.evaluate(IT_LIST, kind)
    run.note('%s：%s 的互動點 %d 個 %s' % (tag, kind, len(items), J(items[:4])))
    for it in items[:4]:
        await L.phone_away(pg, cdp, tries=1); await L.close_panels(pg, cdp)
        await L.go_to(pg, cdp, run, it['x'], it['z'], min(0.9, it['r']), it['label'], max_s=240, lv=it['lv'], stop=lambda s: s['dlg'] or s['choices'])
        n0 = await pl_n(pg)
        s = await P.ts(pg)
        run.note('%s：走到「%s」(%.1f,%.1f)；互動鍵「%s」' % (tag, it['label'], it['x'], it['z'], s['lab']))
        if not s['ch'] and not s['dlg']:
            await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1500)
        t0 = time.time(); taken = False
        while time.time() - t0 < 180:
            s = await P.ts(pg)
            if s['ch']:
                T = [o['t'] for o in s['ch']]
                if T and T[-1].startswith(MENU_END):
                    out.update(ok=True, ch=s['ch'], item=it)
                    out['idx'] = next((i for i, o in enumerate(s['ch']) if o['t'].startswith(LABEL)), None)
                    out['menu_txt'] = (await rows(pg, n0, 'choose') or [{}])[-1].get('t')
                    run.note('%s：選單 %s' % (tag, out['menu_txt'] or J(T)))
                    return out
                k, _ = pick_opt(s['ch']); run.note('%s：途中選項 %s → %s' % (tag, J(T), T[k]))
                await P.tap_choice(pg, cdp, k); await pg.wait_for_timeout(1100); continue
            if s['phone']: await L.phone_away(pg, cdp, tries=1); continue
            if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(650); continue
            R = await rows(pg, n0, 'toast')
            if any('有人坐了' in r['t'] or '坐滿了' in r['t'] for r in R): run.note('%s：這張有人坐了，換下一張' % tag); break
            if not s['busy'] and s['depth'] == 0 and time.time() - t0 > 12:
                if not taken: taken = True; await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1500); continue
                break
            await pg.wait_for_timeout(800)
    out['last'] = await P.ts(pg)
    return out


async def run_review(pg, cdp, run, tag, menu, mode='end', shoot_cap=None, max_s=None):
    """在選單上按「考前總複習」→ 翻頁：mode='all' 一直「下一張」、'end' 第一張就「結束總複習」、'skip' 每科第一張就「跳到下一科」。
    shoot_cap：結束字幕（含「期末範圍」）一出來就截圖（'land'／'port'＝現在的視窗）。回傳紀錄：開始／結束時間、卡片標題、選單、字幕、return 值"""
    max_s = max_s or ENVI('REVIEW_MAX', 1500)
    out = {'ok': False, 'tapped': False, 'cards': [], 'menus': [], 'caps': [], 'toasts': [], 'shots': [], 'ret': None}
    if menu.get('idx') is None: return out
    n0 = await pl_n(pg); out['n0'] = n0
    out['before'] = await pg.evaluate(ST)
    await P.tap_choice(pg, cdp, menu['idx']); out['tapped'] = True; await pg.wait_for_timeout(1500)
    t0 = time.time(); shot_done = False
    while time.time() - t0 < max_s:
        R = await rows(pg, n0)
        if not shot_done and shoot_cap and any(r['k'] == 'cap' and '期末範圍' in r['t'] for r in R):
            shot_done = True; await pg.wait_for_timeout(400); out['shots'].append(await run.shot(pg, '%s_endcap_%s' % (tag, shoot_cap)))
        r1 = [r for r in R if r['k'] == 'review1']
        s = await P.ts(pg)
        free = not s['dlg'] and not s['ch'] and not s['busy'] and s['depth'] == 0
        if r1 and free: out['ok'] = True; break
        if not r1 and not [r for r in R if r['k'] == 'review0'] and free and time.time() - t0 > 20:
            out['no_start'] = True; break   # 按了沒開始（變灰＝toast；或修改前沒有）
        if s['phone'] and not s['ch'] and not s['dlg']: await L.phone_away(pg, cdp, tries=1); continue
        if s['ch']:
            T = [o['t'] for o in s['ch']]
            if any(t.startswith('下一張') for t in T):
                out['menus'].append(T)
                want = {'all': '下一張', 'end': '結束總複習', 'skip': '跳到下一科'}.get(mode, '結束總複習')
                k = next((i for i, t in enumerate(T) if t.startswith(want)), None)
                if k is None: k = next(i for i, t in enumerate(T) if t.startswith('下一張'))
                await P.tap_choice(pg, cdp, k); await pg.wait_for_timeout(900); continue
            k, _ = pick_opt(s['ch']); run.note('%s：總複習途中別的選項 %s → %s' % (tag, J(T), T[k]))
            await P.tap_choice(pg, cdp, k); await pg.wait_for_timeout(1100); continue
        if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(550); continue
        await pg.wait_for_timeout(700)
    R = await rows(pg, n0)
    r0 = next((r for r in R if r['k'] == 'review0'), None); r1 = next((r for r in R if r['k'] == 'review1'), None)
    out['start'] = {'d': r0['d'], 'h': r0['h']} if r0 else None
    out['end'] = {'d': r1['d'], 'h': r1['h']} if r1 else None
    try: out['ret'] = json.loads(r1['t']) if r1 else None
    except Exception: out['ret'] = r1['t'] if r1 else None
    if r0 and r1:
        out['says'] = [r['t'] for r in R if r['k'] == 'say' and r0['i'] < r['i'] < r1['i']]
    else:
        out['says'] = [r['t'] for r in R if r['k'] == 'say']
    out['cards'] = [t for t in out['says'] if t.startswith('【')]
    out['caps'] = [r['t'] for r in R if r['k'] == 'cap']
    out['toasts'] = [r['t'] for r in R if r['k'] == 'toast']
    out['after'] = await pg.evaluate(ST)
    out['R'] = R
    run.note('%s：總複習 %s；開始 %s 結束 %s；卡 %d 張；字幕 %s；toast %s' % (tag, 'OK' if out['ok'] else '沒跑完', J(out['start']), J(out['end']), len(out['cards']), J(out['caps'][-2:]), J(out['toasts'][-3:])))
    return out


def dur(rv):
    """總複習用了幾小時（同一天才算）"""
    if not rv.get('start') or not rv.get('end') or rv['start']['d'] != rv['end']['d']: return None
    return round(rv['end']['h'] - rv['start']['h'], 3)


async def leave_menu(pg, cdp, run, tag):
    """選單還開著（只看不按）：照玩家選「起身」"""
    for _ in range(6):
        s = await P.ts(pg)
        if s['ch']:
            k = next((i for i, o in enumerate(s['ch']) if o['t'].startswith('起身')), None)
            if k is None: k, _ = pick_opt(s['ch'])
            await P.tap_choice(pg, cdp, k); await pg.wait_for_timeout(1200); continue
        if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(600); continue
        if not s['busy'] and s['depth'] == 0: return True
        await pg.wait_for_timeout(800)
    return False


def entry_check(run, tag, menu, where):
    o = menu.get('ch') or []
    ok = menu.get('idx') is not None
    run.check('%s：%s的選單有「%s」（修改前預期 FAIL）' % (tag, where, LABEL), ok, J({'menu': menu.get('menu_txt'), 'opened': menu.get('ok')}))
    return ok


async def wait_free(pg, cdp, max_s=60):
    t0 = time.time()
    while time.time() - t0 < max_s:
        s = await P.ts(pg)
        if s['phone'] and not s['dlg'] and not s['ch']: await L.phone_away(pg, cdp, tries=1); continue
        if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(600); continue
        if s['ch']: return s
        if not s['busy'] and s['depth'] == 0: return s
        await pg.wait_for_timeout(800)
    return await P.ts(pg)


# ---------------------------------------------------------------- 存檔畫面（cc_d118b1_probe 的 ui_save、ui_reload_load）
SAVE_BTN = """(([i,label])=>{ const box=document.getElementById('saveSlots'); if(!box) return null; const it=[...box.querySelectorAll('.item')].find(x=>{ const b=x.querySelector('b'); return b&&(b.textContent||'').trim()==='欄位 '+i; });
  if(!it) return null; const btn=[...it.querySelectorAll('button')].find(b=>(b.textContent||'').trim()===label); if(!btn) return null; document.querySelectorAll('#__d118btn').forEach(e=>e.removeAttribute('id')); btn.id='__d118btn'; return (it.innerText||'').replace(/\\s+/g,' ').slice(0,160); })"""
SLOT_SUM = """(i=>{ try{ const s=(GAME.readSave?GAME.readSave('fatiao3d_slot_'+i):(GAME.readSave?GAME.readSave('fatiao3d_slot_'+i):JSON.parse(localStorage.getItem('fatiao3d_slot_'+i)||'null'))); if(!s) return null; const g=s.G||s; return {day:CALENDAR.dateOf(g.day).key,h:g.hour,zone:g.zone,hasStudy:!!g.study}; }catch(e){ return {err:String(e.message)}; } })"""


async def ui_save(pg, cdp, run, tag, i):
    """玩家存檔：☰ → 「存檔」頁 → 欄位 i 的「存檔」→「返回遊戲」"""
    await L.close_panels(pg, cdp)
    await L.tap(pg, cdp, '#btnMenu'); await pg.wait_for_timeout(900)
    await L.tap(pg, cdp, '#menu [data-tab="save"]'); await pg.wait_for_timeout(900)
    row = await pg.evaluate(SAVE_BTN, [i, '存檔'])
    if row is None: run.check('%s：存檔頁有欄位 %d 的「存檔」' % (tag, i), False); await L.close_panels(pg, cdp); return None
    await L.tap(pg, cdp, '#__d118btn'); await pg.wait_for_timeout(1500)
    p = await run.shot(pg, '%s_save_slot%d' % (tag, i))
    await L.close_panels(pg, cdp)
    sm = await pg.evaluate(SLOT_SUM, i)
    run.note('%s：存到欄位 %d（原本：%s）→ %s；截圖 %s' % (tag, i, row, J(sm), p))
    return sm


async def ui_reload_load(pg, cdp, run, tag, i):
    """重新整理 → 標題「讀取／匯入存檔」→ 欄位 i「讀取」；HOOK 重新掛"""
    await pg.goto(URL); ok = await L.wait_loaded(pg); run.check('%s：重新整理後遊戲載入' % tag, ok)
    await P.init(pg); await pg.evaluate(HOOK)
    sm = await pg.evaluate(SLOT_SUM, i)
    await L.tap(pg, cdp, '#btnLoadMenu'); await pg.wait_for_timeout(1200)
    row = await pg.evaluate(SAVE_BTN, [i, '讀取'])
    if row is None or not sm: run.check('%s：標題「讀取」頁有欄位 %d 的「讀取」' % (tag, i), False, J(sm)); return False
    await L.tap(pg, cdp, '#__d118btn')
    W = "(([k,h])=>{ try{ return document.getElementById('titleScreen').classList.contains('hide')&&!!GAME.G&&CALENDAR.dateOf(GAME.G.day).key===k&&Math.abs(GAME.G.hour-h)<0.6; }catch(e){ return false; } })"
    got = False
    for _ in range(600):
        if await pg.evaluate(W, [sm['day'], sm['h']]): got = True; break
        await pg.wait_for_timeout(100)
    run.check('%s：讀欄位 %d 讀進來（%s %s）' % (tag, i, sm['day'], hm(sm['h'])), got)
    await pg.wait_for_timeout(3000); await L.phone_away(pg, cdp, tries=2)
    run.setup('%s：重新整理 → 標題「讀取／匯入存檔」→ 欄位 %d「讀取」（%s）' % (tag, i, row))
    return got


# ================================================================ 情境
def answerer(pg, run, ekey, wrong_at):
    async def answer(qi, stem, T):
        q = await pg.evaluate(EXQ, [ekey, qi - 1])
        if not isinstance(q, dict) or 'opt' not in q:
            run.note('【捷徑】讀不到第 %d 題的答案：%s → 照第一個' % (qi, J(q))); return 0
        if q.get('q') != stem: run.note('【捷徑】注意：讀到的題幹和畫面不同：%s ／ %s' % (q.get('q', '')[:40], stem[:40]))
        ok = next((i for i, t in enumerate(T) if t == q['opt']), None)
        if ok is None: run.note('【捷徑】第 %d 題的選項裡找不到正解 %s；選項 %s' % (qi, q['opt'], J(T))); return 0
        if wrong_at == qi: k = next(i for i in range(len(T)) if i != ok); why = '故意選錯'
        else: k = ok; why = '正解'
        run.setup('【捷徑：只讀】%s 第 %d 題 %s 答案 %s → 點%s「%s」' % (ekey, qi, q['id'], q['answer'], why, T[k][:30]))
        return k
    return answer


JIAO = re.compile(r'交卷。答對 (\d)／5(?:，(\d+) 分。)?')


async def take_exam(pg, cdp, run, tr, cid, cname, tag, wrong_at, shortcut=True):
    """手機「今天」那一科期末 → 照玩家考完；回傳 {k, score, rec, qs, trip}"""
    it = await pg.evaluate(EXITEM, [cid, 'final'])
    run.note('%s：%s 期末那一列 %s' % (tag, cname, J(it)))
    if not isinstance(it, dict):
        run.check('%s：%s 今天有期末那一列' % (tag, cname), False, J(it)); return None
    ekey = 'Y1S1:%s:final' % cid
    n1 = await pl_n(pg)
    r = await play_trip(pg, cdp, run, tag, it, answer=answerer(pg, run, ekey, wrong_at) if shortcut else None,
                        shoot_txt=[(lambda t: t.startswith('交卷。'), 'submit')])
    R = await tr.take(pg, n1, 'exam_' + cid)
    says = [x['t'] for x in R if x['k'] == 'say']
    j = next((JIAO.search(t) for t in says if JIAO.search(t)), None)
    rec = await pg.evaluate(EXREC, ekey)
    k = int(j.group(1)) if j else None; sc = int(j.group(2)) if j and j.group(2) else None
    run.check('%s：%s 一鍵去考試、考完' % (tag, cname), r['ok'], J({x: r.get(x) for x in ('btn', 'stuck', 'jumped', 'end')}))
    return {'k': k, 'score': sc, 'rec': rec, 'qs': (rec or {}).get('qs'), 'trip_ok': r['ok'], 'answers': r['answers'], 'shots': r['shots'], 'cue_lines': [t for t in says if '想起' in t]}


async def case_S1(pg, cdp, run, tr, S, variant='S1'):
    wrong_at = ENVI('WRONG_AT', 5)
    V = variant; v = V.lower()
    st, d = await state_at(pg, '2025-12-13', 14.0, 'dorm')
    n0 = await pl_n(pg)
    await load(pg, cdp, run, st, '最小存檔 2025-12-13（六，%s 第 %s 週）14:00 宿舍；整學期沒自習、%s、沒有課本；examSeed=%s' % (d['term'], d['week'], '沒上過課（R.done 空）' if V == 'S1' else '上課紀錄下一步用捷徑補', st['flags'].get('examSeed')))
    if V == 'S1b':
        r = await pg.evaluate(S1B_PREP, ENVI('S1B_ASK_WRONG', 4))
        S['prep_shortcut'] = r
        snap = await pg.evaluate("()=>GAME.snapshot()")
        await load(pg, cdp, run, snap, 'S1b：大一上第 1～14 週三科法律課都上過（G.courses.done[日:課:節]＝1、attend[課]＝堂數，照 CLS.dayItems 的實際排課；R.ask[Y1S1:題號]＝課堂提問，'
                   '每 %s 題答錯一題）；刪掉 G.study 讓讀檔時 STUDY.backfill 照這些紀錄推回卡片狀態（heard／got／miss）→ GAME.snapshot() 再讀：%s' % (ENVI('S1B_ASK_WRONG', 4) or '∞', J({k: r.get(k) for k in ('done', 'attend', 'ask', 'askWrong', 'weeks', 'err')}) if isinstance(r, dict) else J(r)), tagp='【前置／捷徑】')
    pre = await pg.evaluate(ST); S['pre'] = pre
    run.check('%s：前置 prep、stats.study、notes 空（記錄）' % V, sum((pre['prep'] or {}).values()) == 0 and pre['studyStat'] == 0 and pre['notes'] == 0, J({k: pre[k] for k in ('prep', 'studyStat', 'notes', 'done', 'prog')}))
    if V == 'S1b':
        pr0 = pre['prog'] or {}
        run.check('S1b：前置後每科 STUDY.progress：heard>0、read≤total、got≤read（backfill 認得上課與提問紀錄）', all(isinstance(pr0.get(c), dict) and pr0[c].get('heard', 0) > 0 and pr0[c]['read'] <= pr0[c]['total'] and pr0[c]['got'] <= pr0[c]['read'] for c, _, _, _ in LAW3), J(pr0))
        lp = await law_page(pg, cdp, run, 's1b_lawpage_before')
        S['lawpage_before'] = lp
        law_check(run, 'S1b 總複習前', lp, pr0)
    await tr.take(pg, n0, 'setup')
    menu = await open_menu(pg, cdp, run, 'desk', v + '_desk'); S['menu'] = {k: menu.get(k) for k in ('ok', 'menu_txt', 'idx')}
    await run.shot(pg, v + '_desk_menu')
    if not entry_check(run, V, menu, '宿舍書桌'):
        await leave_menu(pg, cdp, run, v); return
    rv = await run_review(pg, cdp, run, v + '_review', menu, mode=ENVS('S1_READ', 'all'), shoot_cap='land')
    await tr.take(pg, rv['n0'], 'review')
    S['review'] = {k: rv.get(k) for k in ('ok', 'start', 'end', 'ret', 'cards', 'menus', 'caps', 'toasts', 'before', 'after', 'shots')}
    b, a = rv['before'], rv['after']
    run.check(V + '：總複習跑完（STUDY.review 回傳 ok）', rv['ok'] and isinstance(rv['ret'], dict) and rv['ret'].get('ok'), J(rv['ret']))
    run.check(V + '：耗 3 小時、同一天（14:00 → 17:00）', dur(rv) == 3.0, J({'start': rv['start'], 'end': rv['end']}))
    run.check(V + '：時段次數 G.slots 不變、stats.study +3', J(b['slots']) == J(a['slots']) and a['studyStat'] == b['studyStat'] + 3, J({'slots': [b['slots'], a['slots']], 'study': [b['studyStat'], a['studyStat']]}))
    pr = a['prog'] or {}
    if V == 'S1':
        run.check(V + '：三科每一科「讀過」＝範圍全部（之前 0）', all(isinstance(pr.get(c), dict) and pr[c].get('total', 0) > 0 and pr[c]['read'] == pr[c]['total'] and (b['prog'] or {}).get(c, {}).get('read') == 0 for c, _, _, _ in LAW3), J({'before': b['prog'], 'after': pr}))
    else:
        bp = b['prog'] or {}
        run.check('S1b：總複習後每科 read＝total、heard＝total（不重複算：不超過 total、不超過 100%）、total 不變、got 不變', all(isinstance(pr.get(c), dict) and pr[c]['read'] == pr[c]['total'] and pr[c]['heard'] == pr[c]['total'] and pr[c]['total'] == bp.get(c, {}).get('total') and pr[c]['got'] == bp.get(c, {}).get('got') and pr[c]['got'] <= pr[c]['total'] for c, _, _, _ in LAW3), J({'before': bp, 'after': pr}))
        run.check('S1b：G.study 裡 read＋got 的張數＝三科 total 的和（沒有重複或多出來的卡）', sum((a['studyU'] or {}).get(k, 0) for k in ('read', 'got')) == sum(pr.get(c, {}).get('total', 0) for c, _, _, _ in LAW3), J({'studyU': a['studyU'], 'totals': {c: pr.get(c, {}).get('total') for c, _, _, _ in LAW3}}))
        lines = await pg.evaluate(LINES)
        cap0 = next((c for c in reversed(rv['caps']) if '期末範圍' in c), '')
        run.check('S1b：結束字幕每科一行＝STUDY.line（只讀算）', bool(lines) and all(l in cap0 for l in lines), J({'cap': cap0[:300], 'lines': lines}))
        lp = await law_page(pg, cdp, run, 's1b_lawpage_after')
        S['lawpage_after'] = lp
        law_check(run, 'S1b 總複習後', lp, pr)
    tot = sum(pr.get(c, {}).get('total', 0) for c, _, _, _ in LAW3)
    if ENVS('S1_READ', 'all') == 'all':
        run.check(V + '：一直按「下一張」：每一張卡都出現（%d 張），最後一張以後自己結束' % tot, len(rv['cards']) == tot and tot > 0, J({'cards': len(rv['cards']), 'first': rv['cards'][:3]}))
    cap = next((c for c in reversed(rv['caps']) if '期末範圍' in c), '')
    run.check(V + '：結束字幕三科各一行（「學過 n／n」）', all(nm in cap for _, nm, _, _ in LAW3) and cap.count('期末範圍') == 3, cap[:300])
    S['remind_before_exam'] = None
    snap = await pg.evaluate("()=>GAME.snapshot()")
    exams = S['exams'] = {}
    for ci, (cid, cname, dkey, hh) in enumerate(LAW3):
        await jump(pg, cdp, run, dkey, hh, 'dorm', snap=snap if ci == 0 else None, label='%s期末那天（不照玩家過夜：週末＋考試週中間的日子不是這一項要驗的）' % cname)
        if ci == 0:
            msgs = await pg.evaluate("(()=>(GAME.G.msgs||[]).filter(m=>m.tag==='review_Y1S1').map(m=>({day:CALENDAR.dateOf(m.day).key,h:m.h,text:m.text})))()")
            S['remind_before_exam'] = msgs
            run.note('INFO S1：跳到 12/15 時手機有沒有「考前總複習」提醒（tag review_Y1S1；跳日期跨過 12/14 20:00，提醒規則是否補發照實記）：%s' % J(msgs))
        e = await take_exam(pg, cdp, run, tr, cid, cname, v + '_exam_%s' % cid, wrong_at)
        if not e: continue
        exams[cid] = e
        want = 4 if wrong_at else 5
        run.check(V + '：%s 交卷 答對 %d／5、%d 分（＝CLS.scoreOf）' % (cname, want, SCORE[want]), e['k'] == want and e['score'] == SCORE[want] and (e['rec'] or {}).get('score') == SCORE[want],
                  J({'shown': [e['k'], e['score']], 'rec': {x: (e['rec'] or {}).get(x) for x in ('correct', 'score', 'status')}}))
        if e.get('qs'):
            qr = await pg.evaluate(QRANK, e['qs']); e['qrank'] = qr
            run.note('INFO S1：%s 抽到的 5 題對到的卡狀態（考完以後；答對的會升成 got）：%s' % (cname, J(qr)))
    # 成績單
    await jump(pg, cdp, run, '2026-01-04', 22.5, 'dorm', label='【前置】寒假前的日子不照玩家快轉；公布日前一晚，照玩家去床睡到明天早上')
    n2 = await pl_n(pg)
    got, log = await ff_until(pg, cdp, run, "(()=>{ const R=CLS.rec(GAME.G); return !!(R.grades&&R.grades.Y1S1); })()", 900, v + '_sleep',
                              shoot_txt=[(lambda t: '憲法（上）：' in t, 'grades')])
    R = await tr.take(pg, n2, 'grades')
    says = [x for x in R if x['k'] == 'say']
    gi = next((i for i, x in enumerate(says) if x['t'].endswith('的成績出來了。') and '大一上' in x['t']), None)
    line = says[gi + 1]['t'] if gi is not None and gi + 1 < len(says) else None
    gr = await pg.evaluate(GRADES, 'Y1S1')
    S['grades'] = {'got': got, 'line': line, 'rec': gr, 'after_lines': [[x.get('n'), x['t']] for x in says[(gi or 0) + 2:(gi or 0) + 14]] if gi is not None else []}
    run.check(V + '：成績單發出來', line is not None, J({'line': line}))
    for cid, cname, _, _ in LAW3:
        e = exams.get(cid) or {}
        m = re.search(re.escape(cname) + r'：([^　]+)', line or '')
        want = ('%d 分' % e['score']) if e.get('score') is not None else None
        run.check(V + '：成績單「%s」＝交卷分數（%s）' % (cname, want), m is not None and want is not None and m.group(1) == want, J({'成績單': m.group(1) if m else None, 'R.grades': ((gr or {}).get('grades') or {}).get(cid)}))
    run.note('INFO S1：成績公布後的對話（人物反應，給 BB 看）：%s' % J(S['grades']['after_lines']))
    await wait_free(pg, cdp, 90)
    # 存檔 → 重新整理 → 讀檔
    keep = await pg.evaluate(ST); ex0 = await pg.evaluate("(()=>CLS.rec(GAME.G).exam||{})()"); g0 = await pg.evaluate(GRADES, 'Y1S1')
    slot = ENVI('SLOT', 1)
    sm = await ui_save(pg, cdp, run, v, slot)
    run.check(V + '：遊戲存檔畫面存到欄位 %d' % slot, bool(sm) and sm.get('hasStudy'), J(sm))
    if sm and await ui_reload_load(pg, cdp, run, v, slot):
        back = await pg.evaluate(ST); ex1 = await pg.evaluate("(()=>CLS.rec(GAME.G).exam||{})()"); g1 = await pg.evaluate(GRADES, 'Y1S1')
        S['reload'] = {'before': keep, 'after': back}
        run.check(V + '：讀檔後總複習的效果還在（三科進度、G.study 狀態數量相同）', J(keep['prog']) == J(back['prog']) and J(keep['studyU']) == J(back['studyU']) and all((back['prog'] or {}).get(c, {}).get('read', 0) == (back['prog'] or {}).get(c, {}).get('total', -1) for c, _, _, _ in LAW3),
                  J({'before': [keep['prog'], keep['studyU']], 'after': [back['prog'], back['studyU']]}))
        run.check(V + '：讀檔後 R.exam、R.grades、stats.study 相同', J(ex0) == J(ex1) and J(g0) == J(g1) and keep['studyStat'] == back['studyStat'], J({'grades': [g0, g1], 'study': [keep['studyStat'], back['studyStat']]}))
        await shot2(pg, run, v + '_after_reload')


# ---------------------------------------------------------------- S1b：整學期有上課（【前置／捷徑】）、法律頁
S1B_PREP = r"""(wrongEvery=>{ try{ const G=GAME.G, R=CLS.rec(G), cids=['const_1','crim_gen1','civ_general']; let done=0, ask=0, askWrong=0; const att={}, weeks={};
  for(let d=G.day-140; d<G.day; d++){ const t=CALENDAR.termOf(d); if(!t||t.id!=='Y1S1'||!t.week||t.week>14) continue;
    for(const it of CLS.dayItems(G,d)){ if(!cids.includes(it.c.id)||it.exam) continue; if(!R.done[it.key]){ R.done[it.key]=1; done++; att[it.c.id]=(att[it.c.id]||0)+1; (weeks[it.c.id]||(weeks[it.c.id]=[])).push(t.week); } } }
  for(const cid of cids) R.attend[cid]=(R.attend[cid]||0)+(att[cid]||0);
  let n=0; for(const u of STUDY_UNITS.units){ if(u.term!=='Y1S1'||!cids.includes(u.course)||!u.askQid||u.week==null||u.week>14) continue; const q=EXAM_BANK.questions.find(x=>x.id===u.askQid); if(!q) continue; n++;
    let v=q.answer; if(wrongEvery&&n%wrongEvery===0){ const alt=(q.type==='tf'||!q.options)?(String(q.answer)==='O'?'X':'O'):Object.keys(q.options).find(k=>k!==String(q.answer)); if(alt!=null){ v=alt; askWrong++; } }
    R.ask['Y1S1:'+q.id]=v; ask++; }
  delete G.study; G.notes=[];
  return {done,attend:att,ask,askWrong,weeks:Object.fromEntries(Object.entries(weeks).map(([k,v])=>[k,[...new Set(v)]]))}; }catch(e){ return {err:String(e.message)}; } })"""
LINES = r"""(()=>{ try{ const G=GAME.G; return ['const_1','crim_gen1','civ_general'].map(cid=>STUDY.line(G,CLS.byId(cid),'Y1S1')); }catch(e){ return null; } })()"""
LAWPAGE_TXT = "(()=>{ const b=document.getElementById('legalList'); return b?(b.innerText||''):null; })()"
LAW_RE = re.compile(r'(憲法（上）|刑法總則（一）|民法總則)\s*期末範圍：學過 (\d+)／(\d+)・答對過 (\d+)')


async def law_page(pg, cdp, run, tag):
    """玩家：☰ →「法律」頁 → 讀每科那一行（直向＋橫向截圖）→ 返回遊戲"""
    await L.close_panels(pg, cdp)
    await L.tap(pg, cdp, '#btnMenu'); await pg.wait_for_timeout(900)
    await L.tap(pg, cdp, '#menu [data-tab="legal"]'); await pg.wait_for_timeout(1200)
    txt = await pg.evaluate(LAWPAGE_TXT) or ''
    shots = await shot2(pg, run, tag)
    await L.close_panels(pg, cdp)
    got = {m.group(1): {'heard': int(m.group(2)), 'total': int(m.group(3)), 'got': int(m.group(4))} for m in LAW_RE.finditer(txt)}
    run.note('%s：法律頁 %s' % (tag, J(got)))
    return {'rows': got, 'txt': txt[:1500], 'shots': shots}


def law_check(run, tag, lp, prog):
    bad = []
    for c, n, _, _ in LAW3:
        r = (lp.get('rows') or {}).get(n); p = prog.get(c) or {}
        if not r or r['heard'] != p.get('heard') or r['total'] != p.get('total') or r['got'] != p.get('got') or r['heard'] > r['total']: bad.append([n, r, {k: p.get(k) for k in ('heard', 'total', 'got', 'read')}])
    run.check('%s：法律頁三科「學過 x／y・答對過 z」＝STUDY.progress（heard／total／got，只讀算），而且 x≤y' % tag, not bad, J(bad or lp.get('rows')))


async def case_S1b(pg, cdp, run, tr, S):
    await case_S1(pg, cdp, run, tr, S, variant='S1b')


# ---------------------------------------------------------------- S2：學期快轉（SEMFF）停在考前一週週日 20:00 的提醒（5d3fbd32e）
# 修改前基準（S2 專用）：5d3fbd32e^＝6ba2a22ad08cb70c07bbf198736f55a7c045d75b——快轉停在提醒時沒有「考前總複習／繼續快轉／先停在這裡」選單（semff_review_unit 的 a、c FAIL）。
SEMFF_HOOK = r"""(()=>{ if(window.__SFH||typeof SEMFF==='undefined') return 'skip'; window.__SFH=1; const push=o=>{ try{ o.d=CALENDAR.dateOf(GAME.G.day).key; o.h=+(+GAME.G.hour).toFixed(3); o.z=GAME.G.zone; o.i=++window.__PLN; window.__PL.push(o); }catch(e){} };
  const j0=SEMFF.jump; SEMFF.jump=async function(GM,to){ const t0={d:CALENDAR.dateOf(GAME.G.day).key,h:+(+GAME.G.hour).toFixed(3)}; const r=await j0.apply(this,arguments);
    push({k:'sfjump',n:'',t:JSON.stringify({from:t0,to:+(+to).toFixed(3),why:r&&r.why,stop:r&&r.stop?r.stop.why:null,auto:r&&r.auto,msgs:r&&r.msgs,pending:typeof PHONE!=='undefined'&&PHONE.pending?PHONE.pending(GAME.G).map(m=>(PHONE.th?PHONE.th(m):(m.th||m.who||m.from))+':'+String(m.text||'').slice(0,30)):null})}); return r; };
  const m0=SEMFF.menu; SEMFF.menu=async function(GM){ push({k:'sfmenu0',n:'',t:''}); const r=await m0.apply(this,arguments); push({k:'sfmenu1',n:'',t:JSON.stringify(r?{why:r.why,stop:r.stop?r.stop.why:null}:r)}); return r; };
  return 'ok'; })()"""
S2_REMIND_MENU = lambda T: any(t.startswith(LABEL) for t in T) and any(t.startswith('繼續快轉') for t in T)   # 按鈕＝標題＋提示（「繼續快轉考試那天一定會停」）：== 永遠不成立（R10_rr PC S2a／S2b）


async def semff_run(pg, cdp, run, tag, on_remind, done_js, max_s):
    """照玩家：宿舍床 →「快轉」→ FF_PICK（預設「過一週」）；途中對話點過去、手機收起來、別的選單照 pick_opt；
    停在「有劇情的課快開始了」（why now）就照玩家用手機「今天」去上那一堂再回來（記錄）。
    出現提醒選單（考前總複習／繼續快轉／先停在這裡）交給 on_remind(choices)→ 回傳要點第幾個（None＝不處理、結束）。done_js 成立就停"""
    pick = ENVS('FF_PICK', '過一週')
    t0 = time.time(); log = []; free_since = None; bed_fail = 0; n0 = await pl_n(pg); handled = 0
    while time.time() - t0 < max_s:
        s = await P.ts(pg)
        if not s['dlg'] and not s['ch'] and not s['busy'] and await pg.evaluate(done_js): return {'ok': True, 'log': log, 'n0': n0, 'remind_handled': handled}
        if s['ch']:
            T = [o['t'] for o in s['ch']]
            if S2_REMIND_MENU(T):
                k = await on_remind(s['ch']); handled += 1
                c = await P.clock(pg); log.append([c['key'], hm(c['h']), 'REMIND_MENU', T, None if k is None else T[k]])
                if k is None: return {'ok': False, 'log': log, 'n0': n0, 'remind_handled': handled, 'left_menu': True}
                await P.tap_choice(pg, cdp, k); await pg.wait_for_timeout(1300); free_since = None; continue
            if any(t.startswith('下一張') for t in T):   # 提醒選單選了總複習以後的翻頁
                k = next((i for i, t in enumerate(T) if t.startswith('結束總複習' if ENVS('S2_READ', 'end') == 'end' else '下一張')), 0)
                await P.tap_choice(pg, cdp, k); await pg.wait_for_timeout(900); continue
            k = next((i for i, o in enumerate(s['ch']) if o['t'].startswith('快轉') and not o['dim']), None)
            if k is None: k = next((i for i, o in enumerate(s['ch']) if o['t'].startswith(pick) and not o['dim']), None)
            if k is None: k, _ = pick_opt(s['ch'])
            c = await P.clock(pg); log.append([c['key'], hm(c['h']), c['zone'], T, T[k]])
            run.note('%s %s %s %s 選項 %s → %s' % (tag, c['key'], hm(c['h']), c['zone'], J([t[:20] for t in T]), T[k][:24]))
            await P.tap_choice(pg, cdp, k); await pg.wait_for_timeout(1300); free_since = None; continue
        if s['phone'] and not s['dlg']:
            await L.phone_away(pg, cdp, tries=1); await pg.wait_for_timeout(600); free_since = None; continue
        if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(650); free_since = None; continue
        if s['busy'] or s['depth'] > 0: await pg.wait_for_timeout(1000); continue
        if free_since is None: free_since = time.time(); await pg.wait_for_timeout(1500); continue
        last = [r for r in await rows(pg, n0, 'sfmenu1')]
        lr = json.loads(last[-1]['t']) if last and last[-1]['t'] not in ('null', '') else None
        if lr and lr.get('why') == 'now' and (not log or log[-1][2] != 'CLASS'):
            nm = (lr.get('stop') or '').replace('考試：', '')
            it = await pg.evaluate("(nm=>{ const G=GAME.G; const it=CLS.dayItems(G).find(q=>q.c&&q.c.name===nm&&!CLS.rec(G).done[q.key]); return it?{key:it.key,name:it.c.name,exam:it.exam||null}:null; })", nm)
            c = await P.clock(pg); log.append([c['key'], hm(c['h']), 'CLASS', lr, it])
            if it and it.get('exam'): return {'ok': False, 'log': log, 'n0': n0, 'remind_handled': handled, 'exam_now': it}
            if it:
                run.note('%s：快轉停在「%s快開始了」→ 照玩家手機「今天」去上（記錄）' % (tag, nm))
                await play_trip(pg, cdp, run, tag + '_class', it); free_since = None; continue
        if s['zone'] == 'dorm':
            ok = await press_bed(pg, cdp, run)
            if not ok:
                bed_fail += 1
                if bed_fail >= 4: return {'ok': False, 'log': log + [['bed_fail']], 'n0': n0, 'remind_handled': handled}
            free_since = None; continue
        if time.time() - free_since > ENVI('AWAY_S', 90):
            c = await P.clock(pg)
            await jump(pg, cdp, run, c['key'], c['h'], 'dorm', label='%s：人在 %s（快轉要在宿舍床上按），放回宿舍同一時間' % (tag, c['zone']))
            log.append([c['key'], hm(c['h']), 'BACK_TO_DORM', c['zone']]); free_since = None; continue
        await pg.wait_for_timeout(1500)
    return {'ok': False, 'log': log + [['timeout']], 'n0': n0, 'remind_handled': handled}


def s2_stops(R):
    """整段快轉的所有停點：每一次 SEMFF.jump 回傳（why、stop）＋系統訊息（th sys）出現的時間"""
    J2 = [dict(json.loads(r['t']), at={'d': r['d'], 'h': r['h']}) for r in R if r['k'] == 'sfjump']
    sysm = [{'d': r['d'], 'h': r['h'], 't': r['t'][:80]} for r in R if r['k'] == 'msg' and r.get('n') == 'sys']
    return J2, sysm


async def case_S2(pg, cdp, run, tr, S, choice='review'):
    """choice：review（S2a 選考前總複習）／cont（S2b 選繼續快轉）"""
    V = 'S2a' if choice == 'review' else 'S2b'
    key, h = ENVS('S2_START', '2025-12-04@22').split('@')
    st, d = await state_at(pg, key, float(h), 'dorm')
    n0 = await pl_n(pg)
    await load(pg, cdp, run, st, '%s：最小存檔 %s（%s 第 %s 週）%s 宿舍（照玩家「過一週」兩次會跨過 12/14 20:00；第一次到 12/11 07:30 以前會先停在中間的事）' % (V, d['key'], d['term'], d['week'], hm(float(h))))
    hk = await pg.evaluate(SEMFF_HOOK); run.note('%s：SEMFF 掛勾 %s' % (V, hk))
    S['shots'] = []

    async def on_remind(ch):
        T = [o['t'] for o in ch]
        if not S.get('menu_seen'):
            S['menu_seen'] = {'opts': T, 'clock': await P.clock(pg)}
            await pg.wait_for_timeout(1200); S['shots'] += await shot2(pg, run, V.lower() + '_remind_menu')
        want = LABEL if choice == 'review' else '繼續快轉'
        return next((i for i, t in enumerate(T) if t.startswith(want)), None)

    done = ("(()=>{ const G=GAME.G, k=CALENDAR.dateOf(G.day).key; return k>='2025-12-15'; })()" if choice == 'cont' else
            "(()=>{ const R=(window.__PL||[]).filter(r=>r.k==='sfmenu1'); const L=R[R.length-1]; if(!L) return false; try{ const o=JSON.parse(L.t); return !!o&&(o.why==='review'||o.why==='review_stop'); }catch(e){ return false; } })()")
    res = await semff_run(pg, cdp, run, V.lower(), on_remind, done, ENVI('S2_MAX', 2400))
    R = await tr.take(pg, n0, 'semff')
    R = await rows(pg, n0)
    jumps, sysm = s2_stops(R)
    S.update(res={k: res.get(k) for k in ('ok', 'remind_handled', 'exam_now', 'left_menu')}, log=res['log'], jumps=jumps, sys_msgs=sysm, end=await P.clock(pg))
    dump('s2_%s_stops.json' % V, {'jumps': jumps, 'sys_msgs': sysm, 'log': res['log']})
    run.note('%s：整段快轉的停點（SEMFF.jump 回傳）%s' % (V, J([[j['at']['d'], hm(j['at']['h']), j.get('why'), j.get('stop')] for j in jumps])))
    run.note('%s：快轉期間的系統訊息 %s' % (V, J(sysm)))
    ms = S.get('menu_seen')
    run.check('%s (a)：快轉停在 12/14 20:00 的提醒時跳出「%s／繼續快轉／先停在這裡」（修改前 6ba2a22ad 預期 FAIL）' % (V, LABEL), bool(ms) and ms['clock']['key'] == '2025-12-14' and abs(ms['clock']['h'] - 20) < 0.6 and '先停在這裡' in ms['opts'], J(ms))
    nrem = sum(1 for j in jumps if j.get('why') == 'remind')
    run.check('%s (d)：整段快轉 why=remind 的停點只有 1 次（這個提醒）' % V, nrem == 1, J([[j['at']['d'], hm(j['at']['h']), j.get('why'), j.get('stop')] for j in jumps if j.get('why') == 'remind']))
    other = [[j['at']['d'], hm(j['at']['h']), j.get('why'), j.get('stop'), j.get('pending')] for j in jumps if j.get('why') not in ('remind', 'end')]
    run.note('INFO %s (d)：其他停點（why stop／msg／event／out／now；msg 附 PHONE.pending，看是不是系統訊息造成的）：%s' % (V, J(other)))
    sys_stop = [j for j in jumps if j.get('why') == 'msg' and any(isinstance(p, str) and p.startswith('sys:') for p in (j.get('pending') or []))]
    run.check('%s (d)：沒有因為其他系統訊息（sys）多停下來（why msg 而且待回訊息是 sys）' % V, not sys_stop, J(sys_stop[:5]))
    if choice == 'review':
        m1 = [r for r in R if r['k'] == 'sfmenu1']; last = json.loads(m1[-1]['t']) if m1 and m1[-1]['t'] not in ('null', '') else None
        rv = [r for r in R if r['k'] in ('review0', 'review1')]
        c0 = await P.clock(pg)
        await pg.wait_for_timeout(ENVI('S2_IDLE_MS', 20000)); await wait_free(pg, cdp, 30)
        c1 = await P.clock(pg)
        pr = await pg.evaluate(ST)
        S.update(after_menu=last, review_rows=rv, clock_after=[c0, c1], prog=pr['prog'])
        run.check('S2a (b)：選「%s」→ 當場複習（STUDY.review 有跑）、SEMFF.menu 回傳 why review' % LABEL, any(r['k'] == 'review1' for r in rv) and (last or {}).get('why') == 'review', J({'menu': last, 'rows': rv}))
        run.check('S2a (b)：停在 12/14 23:00、沒有再接著快轉（等 %d 秒時間不跳）' % (ENVI('S2_IDLE_MS', 20000) // 1000), c0['key'] == '2025-12-14' and abs(c0['h'] - 23) < 0.3 and c1['key'] == c0['key'] and c1['h'] - c0['h'] < 0.5, J([c0, c1]))
        run.check('S2a：三科讀過＝範圍全部', all((pr['prog'] or {}).get(c, {}).get('read') == (pr['prog'] or {}).get(c, {}).get('total', -1) for c, _, _, _ in LAW3), J(pr['prog']))
        S['shots'].append(await run.shot(pg, 's2a_after'))
    else:
        c = await P.clock(pg)
        ex = [j for j in jumps if j['at']['d'] == '2025-12-15']
        stop_exam = any(j.get('why') == 'stop' and '憲法（上）' in (j.get('stop') or '') for j in jumps) or ('憲法（上）' in J(res.get('exam_now') or {}))
        run.check('S2b (c)：選「繼續快轉」→ 期末考那天停下來（12/15 憲法（上）考試，09:10 以前）', stop_exam and c['key'] == '2025-12-15' and c['h'] < 9 + 10 / 60, J({'clock': c, 'jumps_1215': ex, 'exam_now': res.get('exam_now')}))
        S['shots'] += await shot2(pg, run, 's2b_exam_day')


async def case_S2a(pg, cdp, run, tr, S):
    await case_S2(pg, cdp, run, tr, S, 'review')


async def case_S2b(pg, cdp, run, tr, S):
    await case_S2(pg, cdp, run, tr, S, 'cont')


async def case_night(pg, cdp, run, tr, S):
    for h, expect_dim in ((21.5, True), (21.0, True), (20.75, False)):
        tag = 'night_%s' % hm(h).replace(':', '')
        st, d = await state_at(pg, '2025-12-12', h, 'dorm')
        n0 = await pl_n(pg)
        await load(pg, cdp, run, st, '最小存檔 2025-12-12（五，第 %s 週）%s 宿舍' % (d['week'], hm(h)))
        menu = await open_menu(pg, cdp, run, 'desk', tag)
        sh = await shot2(pg, run, tag + '_menu') if menu.get('ok') else [await run.shot(pg, tag + '_nomenu')]
        rec = S.setdefault(tag, {'menu': menu.get('menu_txt'), 'shots': sh})
        idx = menu.get('idx'); dim = bool(menu['ch'][idx]['dim']) if idx is not None else None
        rec['dim'] = dim
        if expect_dim:
            # 修改前：沒有這一項（看不到）＝「入口不開」也成立，但同時「入口有」那一項會在 20:45 FAIL
            if idx is None:
                run.check('%s：%s 書桌選單看不到「%s」（入口不開）' % (tag, hm(h), LABEL), True, J(menu.get('menu_txt')))
                await leave_menu(pg, cdp, run, tag)
            else:
                t_before = (await P.clock(pg))
                rv = await run_review(pg, cdp, run, tag, menu, mode='end', max_s=120)
                t_after = await P.clock(pg)
                rec.update(toasts=rv['toasts'], started=rv['start'] is not None, before=t_before, after=t_after)
                hint_ok = dim and any('21:00' in t or '午夜' in t for t in rv['toasts'] + [menu.get('menu_txt') or ''])
                run.check('%s：%s「%s」變灰、按了有提示、沒有開始、沒有跳時間（前後差 < 0.5 小時；不用 turbo 時遊戲時間本來就會走）' % (tag, hm(h), LABEL), hint_ok and rv['start'] is None and t_before['key'] == t_after['key'] and abs(t_before['h'] - t_after['h']) < 0.5,
                          J({'dim': dim, 'toasts': rv['toasts'][-2:], 'start': rv['start'], 'h': [t_before['h'], t_after['h']]}))
                await leave_menu(pg, cdp, run, tag)
        else:
            entry_check(run, tag, menu, '20:45 宿舍書桌')
            run.check('%s：20:45「%s」可以選（不變灰）' % (tag, LABEL), idx is not None and dim is False, J(menu.get('menu_txt')))
            await leave_menu(pg, cdp, run, tag)
        await tr.take(pg, n0, tag)


async def case_repeat(pg, cdp, run, tr, S):
    st, d = await state_at(pg, '2025-12-13', 9.0, 'dorm')
    n0 = await pl_n(pg)
    await load(pg, cdp, run, st, '最小存檔 2025-12-13（六，第 %s 週）09:00 宿舍' % d['week'])
    await tr.take(pg, n0, 'setup')
    S['runs'] = []
    for k in (1, 2):
        await wait_free(pg, cdp, 60)
        menu = await open_menu(pg, cdp, run, 'desk', 'repeat%d' % k)
        if not entry_check(run, 'repeat 第 %d 次' % k, menu, '宿舍書桌'):
            await leave_menu(pg, cdp, run, 'repeat'); break
        rv = await run_review(pg, cdp, run, 'repeat%d' % k, menu, mode='end')
        await tr.take(pg, rv['n0'], 'review%d' % k)
        S['runs'].append({x: rv.get(x) for x in ('ok', 'start', 'end', 'ret', 'toasts')} | {'slots': [rv['before']['slots'], rv['after']['slots']], 'study': [rv['before']['studyStat'], rv['after']['studyStat']]})
        run.check('repeat 第 %d 次：開始 %s → 結束 %s，耗 3 小時、同一天' % (k, hm((rv['start'] or {}).get('h')), hm((rv['end'] or {}).get('h'))), rv['ok'] and dur(rv) == 3.0, J({'start': rv['start'], 'end': rv['end']}))
        run.check('repeat 第 %d 次：時段次數 G.slots 不變' % k, J(rv['before']['slots']) == J(rv['after']['slots']), J([rv['before']['slots'], rv['after']['slots']]))
    if len(S['runs']) == 2:
        a, b = S['runs']
        run.check('repeat：第二次接在第一次後面（09:00→12:00、12:00 以後→+3）', bool(a['end'] and b['start'] and b['start']['h'] >= a['end']['h'] - 1e-6), J([a['start'], a['end'], b['start'], b['end']]))


async def case_seed(pg, cdp, run, tr, S):
    st, d = await state_at(pg, '2025-12-14', 14.0, 'dorm')
    run.setup('seed：同一份前置存檔讀兩次（A 做總複習、B 不做）；examSeed=%s' % st['flags'].get('examSeed'))
    for side in ('A', 'B'):
        n0 = await pl_n(pg)
        await load(pg, cdp, run, st, 'seed %s：最小存檔 2025-12-14（日）14:00 宿舍' % side)
        R = S.setdefault(side, {})
        if side == 'A':
            menu = await open_menu(pg, cdp, run, 'desk', 'seedA')
            if entry_check(run, 'seed A', menu, '宿舍書桌'):
                rv = await run_review(pg, cdp, run, 'seedA', menu, mode='end')
                R['review'] = {x: rv.get(x) for x in ('ok', 'start', 'end', 'ret')}
            else:
                await leave_menu(pg, cdp, run, 'seedA'); R['review'] = None
        R['draws_clone'] = await pg.evaluate(DRAWS)
        R['st'] = await pg.evaluate(ST)
        await tr.take(pg, n0, 'pre_' + side)
        await jump(pg, cdp, run, '2025-12-15', 7 + 40 / 60, 'dorm', label='seed %s：憲法期末那天' % side)
        e = await take_exam(pg, cdp, run, tr, 'const_1', '憲法（上）', 'seed%s_exam' % side, 0, shortcut=False)
        R['qs'] = (e or {}).get('qs'); R['rec'] = (e or {}).get('rec')
    a, b = S['A'].get('qs'), S['B'].get('qs')
    run.check('seed：A 真的做了總複習（才有比較意義）', bool(S['A'].get('review') and S['A']['review'].get('ok')), J(S['A'].get('review')))
    run.check('seed：同一個 examSeed，總複習（A）與沒總複習（B）憲法期末抽到的 5 題相同', bool(a) and a == b, J({'A': a, 'B': b}))
    run.note('INFO seed：頁面裡複製存檔各抽三科（CLS.drawExam on clone）A=%s B=%s 相同=%s' % (J(S['A']['draws_clone']), J(S['B']['draws_clone']), S['A']['draws_clone'] == S['B']['draws_clone']))


async def ou_check(run, tag, rv, menu):
    T = rv['says']; cards = rv['cards']; cap = next((c for c in reversed(rv['caps']) if '期末範圍' in c), '')
    start = next((t for t in T if t.startswith('（') and '科' in t), '')
    run.check('%s：選單提示「2 科」' % tag, '2 科' in (menu.get('menu_txt') or ''), menu.get('menu_txt') or '')
    run.check('%s：開始那句寫 2 科' % tag, '2 科' in start, start)
    run.check('%s：卡的標題沒有【憲法（上）…】（看到的卡 %d 張）' % (tag, len(cards)), bool(cards) and not any(c.startswith('【憲法（上）') for c in cards), J(cards[:4]))
    run.check('%s：結束字幕沒有「憲法（上）」、有刑總和民總' % tag, bool(cap) and '憲法（上）' not in cap and '刑法總則（一）' in cap and '民法總則' in cap, cap[:300])
    ri = (rv['before'] or {}).get('info')
    run.note('INFO %s：reviewInfo 範圍 %s' % (tag, J(ri)))


async def case_only_untaken(pg, cdp, run, tr, S):
    modes = [m.strip() for m in ENVS('OU_MODES', 'inject,real').split(',') if m.strip()]
    if 'inject' in modes:
        tag = 'ou_inject'
        st, d = await state_at(pg, '2025-12-12', 19.0, 'dorm')
        n0 = await pl_n(pg)
        await load(pg, cdp, run, st, '%s：最小存檔 2025-12-12（五）19:00 宿舍' % tag)
        r = await pg.evaluate("(()=>{ const R=CLS.rec(GAME.G); R.exam=R.exam||{}; R.exam['Y1S1:const_1:final']={qs:[],ans:[],correct:4,score:90,status:'done'}; return Object.keys(R.exam); })()")
        snap = await pg.evaluate("()=>GAME.snapshot()")
        await load(pg, cdp, run, snap, '%s：【捷徑】R.exam 寫入憲法（上）期末 status done（4／5、90 分；沒經過考試）→ GAME.snapshot() 再讀一次：%s' % (tag, J(r)))
        menu = await open_menu(pg, cdp, run, 'desk', tag)
        S[tag] = {'menu': menu.get('menu_txt')}
        if entry_check(run, tag, menu, '宿舍書桌'):
            rv = await run_review(pg, cdp, run, tag, menu, mode=ENVS('OU_READ', 'skip'), shoot_cap='land')
            S[tag].update({x: rv.get(x) for x in ('ok', 'start', 'end', 'cards', 'caps', 'ret')})
            await ou_check(run, tag, rv, menu)
        else:
            await leave_menu(pg, cdp, run, tag)
        await tr.take(pg, n0, tag)
    if 'real' in modes:
        tag = 'ou_real'
        st, d = await state_at(pg, '2025-12-15', 7 + 40 / 60, 'dorm')
        n0 = await pl_n(pg)
        await load(pg, cdp, run, st, '%s：最小存檔 2025-12-15（一）07:40 宿舍' % tag)
        e = await take_exam(pg, cdp, run, tr, 'const_1', '憲法（上）', tag + '_exam', ENVI('WRONG_AT', 5))
        S[tag] = {'exam': {x: (e or {}).get(x) for x in ('k', 'score', 'rec')}}
        await jump(pg, cdp, run, '2025-12-15', 14.0, 'dorm', label='%s：考完憲法以後回宿舍（考完人在教室；這一段不照玩家走回去）' % tag)
        menu = await open_menu(pg, cdp, run, 'desk', tag)
        S[tag]['menu'] = menu.get('menu_txt')
        if entry_check(run, tag, menu, '宿舍書桌'):
            rv = await run_review(pg, cdp, run, tag, menu, mode=ENVS('OU_READ', 'skip'))
            S[tag].update({x: rv.get(x) for x in ('ok', 'start', 'end', 'cards', 'caps', 'ret')})
            await ou_check(run, tag, rv, menu)
            run.note('INFO %s：這裡憲法「考過」和「考試時間已過」兩個原因都成立（reviewInfo 兩條都會排除），隔離要看 ou_inject' % tag)
        else:
            await leave_menu(pg, cdp, run, tag)
        await tr.take(pg, n0, tag)


async def case_multi_caption(pg, cdp, run, tr, S):
    st, d = await state_at(pg, '2025-12-13', 9.0, 'dorm')
    n0 = await pl_n(pg)
    await load(pg, cdp, run, st, '最小存檔 2025-12-13（六）09:00 宿舍')
    S['shots'] = []
    for k, vp in ((1, 'land'), (2, 'port')):
        if vp == 'port':
            await pg.set_viewport_size(PORT); await pg.wait_for_timeout(ENVI('ROT_MS', 2500))
            run.setup('multi_caption：視窗改成直向 390×844（第二次總複習在直向拍結束字幕）')
        await wait_free(pg, cdp, 60)
        menu = await open_menu(pg, cdp, run, 'desk', 'mcap%d' % k)
        if not entry_check(run, 'multi_caption 第 %d 次（%s）' % (k, '橫向' if vp == 'land' else '直向'), menu, '宿舍書桌'):
            await leave_menu(pg, cdp, run, 'mcap'); break
        rv = await run_review(pg, cdp, run, 'mcap%d' % k, menu, mode='end', shoot_cap=vp)
        cap = next((c for c in reversed(rv['caps']) if '期末範圍' in c), '')
        S['shots'] += rv['shots']; S['cap_%s' % vp] = cap
        run.check('multi_caption（%s）：結束字幕三科三行，截圖 %s' % ('橫向' if vp == 'land' else '直向', J(rv['shots'])), bool(rv['shots']) and cap.count('期末範圍') == 3 and cap.count('<br>') == 2, cap[:300])
        dom = await pg.evaluate("(()=>{ const e=document.getElementById('caption'); if(!e) return null; const r=e.getBoundingClientRect(); return {txt:(e.innerText||'').slice(0,300),x:r.left,y:r.top,w:r.width,h:r.height,vw:innerWidth,vh:innerHeight,hide:e.classList.contains('hide')}; })()")
        S['dom_%s' % vp] = dom
        run.note('INFO multi_caption（%s）：字幕框（截圖後讀，可能已淡出）%s' % (vp, J(dom)))
    await pg.set_viewport_size(LAND)
    await tr.take(pg, n0, 'multi_caption')


async def case_cafe_free(pg, cdp, run, tr, S):
    st, d = await state_at(pg, '2025-12-13', 13.0, 'cafe', money=30000)
    n0 = await pl_n(pg)
    await load(pg, cdp, run, st, '最小存檔 2025-12-13（六）13:00 兩點半 Café；money 30000')
    menu = await open_menu(pg, cdp, run, 'cafe', 'cafe')
    S['menu'] = menu.get('menu_txt')
    if menu.get('ok'): S['menu_shots'] = await shot2(pg, run, 'cafe_menu')
    run.note('INFO cafe：選單有「點杯咖啡慢慢讀」=%s' % ('點杯咖啡慢慢讀' in (menu.get('menu_txt') or '')))
    if not entry_check(run, 'cafe_free', menu, 'Café 桌'):
        await leave_menu(pg, cdp, run, 'cafe'); await tr.take(pg, n0, 'cafe'); return
    rv = await run_review(pg, cdp, run, 'cafe_review', menu, mode='end')
    m0, m1 = rv['before']['money'], rv['after']['money']
    S['review'] = {x: rv.get(x) for x in ('ok', 'start', 'end', 'ret', 'toasts')} | {'money': [m0, m1]}
    run.check('cafe_free：總複習跑完、耗 3 小時', rv['ok'] and dur(rv) == 3.0, J({'start': rv['start'], 'end': rv['end']}))
    run.check('cafe_free：金額前後相同（%s → %s）' % (m0, m1), m0 == m1 and m0 is not None, J([m0, m1]))
    await wait_free(pg, cdp, 30)
    m2 = await pg.evaluate("GAME.G.money"); S['money_after_menu'] = m2
    run.check('cafe_free：離開選單以後金額也沒變（%s）' % m2, m2 == m0, J([m0, m2]))
    await tr.take(pg, n0, 'cafe')


RUNNERS = {'S1': case_S1, 'S1b': case_S1b, 'S2a': case_S2a, 'S2b': case_S2b, 'S2': case_S2a, 'night': case_night, 'repeat': case_repeat, 'seed': case_seed, 'only_untaken': case_only_untaken, 'multi_caption': case_multi_caption, 'cafe_free': case_cafe_free}


async def main():
    global URL, OUT
    from playwright.async_api import async_playwright
    URL, OUT = sys.argv[1], sys.argv[2]
    os.makedirs(OUT, exist_ok=True)
    run = L.Run('d118b3_' + '+'.join(CASES), OUT)
    SUMMARY.update(sha=os.environ.get('SHA', '?'), url=URL, cases=CASES, seed=SEED, label=LABEL)
    print('==== D118-B3 一鍵總複習（SHA %s）不用 turbo；作答用【捷徑：只讀】；不是 iPhone ====' % SUMMARY['sha'], flush=True)
    if 'turbo' in URL: run.note('注意：URL 有 turbo，這支規定不用 turbo')
    run.note('期中考已拿掉（D118-B1），期中不測（STUDY.reviewInfo(G,"mid") 一律 null）')
    async with async_playwright() as p:
        for c in CASES:
            print('==== CASE %s ====' % c, flush=True)
            if c not in RUNNERS: run.check('CASE %s 認得（%s）' % (c, ','.join(RUNNERS)), False); continue
            tr = TR(c); S = SUMMARY.setdefault('case_' + c, {})   # case 叫 seed 時和 SUMMARY['seed']（種子值）撞名（R10 PC：'str' 沒有 setdefault）
            b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
            pg.on('dialog', lambda dd: asyncio.ensure_future(dd.accept()))
            try:
                await pg.goto(URL); ok = await L.wait_loaded(pg); run.check('%s：遊戲載入' % c, ok)
                await pg.evaluate("localStorage.clear()"); await P.init(pg); await pg.evaluate(HOOK)
                await RUNNERS[c](pg, cdp, run, tr, S)
            except Exception as e:
                run.check('%s：跑完（沒有探針例外）' % c, False, repr(e)[:500]); traceback.print_exc()
                try: await run.shot(pg, c + '_exception')
                except Exception: pass
            run.check('%s：沒有 JS 例外' % c, not errs, J(errs[:3]))
            try: S['walkFallbacks'] = await pg.evaluate("GAME.walkFallbacks||0")
            except Exception: pass
            run.note('%s：逐字稿 %s（%d 筆）' % (c, tr.save(), len(tr.items)))
            try: await asyncio.wait_for(b.close(), 30)
            except Exception: pass
    for c in CASES:
        for v in (SUMMARY.get('case_' + c) or {}).values():
            if isinstance(v, dict): v.pop('R', None)
    dump('d118b3_summary.json', SUMMARY)
    print('SHA', SUMMARY['sha'], 'CASES', ','.join(CASES), flush=True)
    sys.exit(run.finish())


if __name__ == '__main__':
    asyncio.run(main())
