"""CC（帳號 A）11-02：D118-B4「考試裡的 cue 和考後訂正」的瀏覽器驗收探針（BB 的五點；SE 共同規則：TR 逐字稿、【前置／捷徑】標示、直向橫向各一張）。
規格：D118_PLAN.md D118-B4（第 251–265 行）。不是 iPhone：Playwright 手機模擬（SwiftShader 1～4 fps）。**不用 ?turbo**（總複習、期末作答照玩家點）。

版本：
  修改後＝開發分支含 a2e466ee7（D118-B4：classes3d.js runExam 出題前 STUDY.cueFor、交卷後 STUDY.fixNote；study3d.js cueFor／fixNote／CUE_PREFIX／FIX_TITLE）。
    寫這支時工作樹 head＝8b4d55e0e4f24624a55442b803c6239a7fd694e2。
  修改前基準＝a2e466ee7 的上一個 commit f57e3ac7594152c75edb9e60a0b3392c59cd4f69（B2、B3 已在；STUDY.cueFor／fixNote 不存在）：
    ① 讀過的題沒有提示行 → 「讀過的題有提示行」FAIL；沒讀過的題沒有提示行照樣 PASS
    ③ 答錯不寫訂正筆記 → 「答錯的科目有一則訂正」FAIL；全對的科目沒有 → PASS
    ④ 分數＝答對題數、有沒有總複習分數一樣 → 兩版都 PASS（B4 不碰計分）
    ⑤ 找不到有提示行的題目 → 「有提示行的題目畫面」FAIL（沒有提示行的題目畫面仍量一次，INFO）

讀碼（a2e466ee7）看到的：
  - 提示行＝獨立一句 GM.say（不是和題目同一個框）：「（你想起筆記上寫的：<cue>）」，接著才是「i／5　題目」和選項。
    來源 STUDY.cueFor(G,qid)：那一題對到的觀念卡（STUDY.unitsOfQ）只要有一張是 read 或 got，取第一張的 u.cue；空的時候用卡片標題（STUDY.view(u).title＝黑板第一行）。
    AA 的 cue 欄位目前還沒有 → 全部用卡片標題（暫定）。不看選項文字；node 掃大一上三科期末池 39 題：只有 CRIM45_34 卡片標題「因果關係」出現在正確選項裡、錯誤選項沒有（SUSPECT 候選，畫面抽到才會記）。
  - 計分：照舊 String(v)===String(q.answer) 數答對題數，score＝CLS.scoreOf(k)；cue 只是 say，不碰 ans、k。
  - 考後訂正：交卷、逐題公布答錯的答案以後，STUDY.fixNote → GM.addNote('examfix_'+r.key, <課名>+'・期末考訂正', 每題「第 n 題　題目\\n答案：…\\n考點：…\\n解說」)；
    一科一次考試一則（同 id 第二次不寫）；全對不寫。addNote 會跳 toast「📓 筆記：<標題>」。卡片進 miss 是 STUDY.answer 早就做的（B2）。
    注意：筆記頁 renderNotes 用 innerHTML 塞 body、沒有 white-space:pre-line → 「\\n」不會換行（整則擠成一段）；這支記 DOM innerText 和截圖給 BB 看，不判。
  - 有教科書的期末會多「（你想起課本那一段…）」（recall）；最小存檔沒有課本，不會出現。

CASES（逗號隔開；預設全跑；每個 case 開一個新的瀏覽器、從最小存檔開始）：
  S1       【前置】最小存檔（法律系大一上、prep／study／notes 空、沒上過課、沒有課本、examSeed 固定）2025-12-13（六）14:00 宿舍
           → 照玩家走到書桌「坐在書桌前」→「考前總複習」（S1_READ=end：第一張就結束；卡片一開始就全部設成讀過）
           →【前置／捷徑：跳日期】同一份進度跳到各科期末那天 → 手機「今天」「直接去上課」→ 照玩家點對話 → 考卷【捷徑：只讀】讀正解再點：
             憲法（上）第 WRONG_CONST（預設 2,5）題故意選錯、刑法總則（一）全對（WRONG_CRIM 預設空）、民法總則第 WRONG_CIV（預設 3）題選錯
           → 第一個有提示行的題目：橫向量選項位置＋截圖 → 改直向 390×844 量＋截圖 → 改回橫向（⑤）；提示行那一句本身也截一張
           → 三科考完：☰「筆記」讀 DOM＋G.notes（只讀）→ 直向＋橫向截圖（③）
  noreview 同一份最小存檔、同樣的 examSeed、同樣的作答規則，**不做總複習** → 三科照樣考 → ①「沒讀過＝沒有提示行」、④ 和 S1 比 R.exam 題號、答對題數、分數（兩個 case 都跑才比）
  mix      【前置】最小存檔 12/15 07:40 →【前置／捷徑：寫卡片狀態】在頁面裡用複製的存檔抽憲法期末的 5 題（CLS.drawExam on clone，不寫回），
           把第 MIX_READ（預設 1,3）題對到的觀念卡設成 read（STUDY.mark(G,id,'read','cc_probe')）→ 照玩家考憲法（第 MIX_WRONG 預設 3 題選錯）
           → 同一場考試裡「讀過」「沒讀過」兩種題都有；逐題比 預期（考前卡片狀態）／畫面
  S1b      【前置／捷徑】S1b 那種部分上課（大一上第 1～14 週三科都上過、課堂提問每 4 題錯一題，刪 G.study 讓讀檔 backfill 推回 heard／got／miss），不做總複習
           → 只考憲法（S1B_COURSES 可加）→ got 的卡出提示行、heard 的不出（照考前卡片狀態預測；混合程度看抽到什麼，INFO）

每題記：題號、題目 id、對到的卡＋考前狀態、預期有無提示行、畫面有無提示行、提示全文、正確選項文字、可疑標記（②：cue⊇正解、正解⊇cue、錯誤選項也含 cue、含「答案」「選 (X)」字樣；只標 INFO／SUSPECT）。
check 只客觀記錄；判定由 BB 做（CC 初判）。逐字稿：<輸出>/transcript_<case>.json；摘要：d118b4_summary.json（每題的表在 <case>.questions）。
用法：LW_TESTS=<工作樹>/tests SHA=<sha> [CASES=S1,noreview,mix,S1b] python3 cc_d118b4_probe.py '<URL>/index.html' <輸出資料夾>
環境變數：CASES　EXAM_SEED=20251215　WRONG_CONST=2,5　WRONG_CRIM=　WRONG_CIV=3　S1_READ=end　MIX_READ=1,3　MIX_WRONG=3　S1B_COURSES=const_1　S1B_ASK_WRONG=4
          CUE_PREFIX=（你想起筆記上寫的：　FIX_SUFFIX=・期末考訂正　RECALL_PREFIX=（你想起課本　REVIEW_LABEL=考前總複習　TRIP_MAX=900　STUCK_S=240　REVIEW_MAX=1500　ROT_MS=2500
暫定字（提示行前綴、訂正標題）用環境變數；字不判，只用來找那一行。提示行的認定另外有退路：題目前一句是「（」開頭、不是課本 recall 的那一句也算（記成 prefix_mismatch）。
預估（SwiftShader）：S1 40～50 分、noreview 30～35、mix 12～15、S1b 15；全跑約 1.6～2 小時。
"""
import os, sys, json, asyncio, re, time, copy, traceback
sys.path.insert(0, os.environ.get('LW_TESTS', '')); import playlib as L
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__)))); import bbplay as P   # bbplay 在上一層（BB 的 test_tools）

J = lambda o: json.dumps(o, ensure_ascii=False)
ENVI = lambda k, d: int(os.environ.get(k, str(d)))
ENVS = lambda k, d: os.environ.get(k, d)
ENVL = lambda k, d: [int(x) for x in os.environ.get(k, d).split(',') if x.strip()]
ALL_CASES = ['S1', 'noreview', 'mix', 'S1b']
CASES = [c.strip() for c in ENVS('CASES', ','.join(ALL_CASES)).split(',') if c.strip()]
LABEL = ENVS('REVIEW_LABEL', '考前總複習')
CUE_PREFIX = ENVS('CUE_PREFIX', '（你想起筆記上寫的：')
FIX_SUFFIX = ENVS('FIX_SUFFIX', '・期末考訂正')
RECALL_PREFIX = ENVS('RECALL_PREFIX', '（你想起課本')
SCORE = [0, 60, 70, 80, 90, 100]   # classes3d.js S.scoreOf
LAND = {'width': 844, 'height': 390}
PORT = {'width': 390, 'height': 844}
LAW3 = [('const_1', '憲法（上）', '2025-12-15', 7 + 40 / 60), ('crim_gen1', '刑法總則（一）', '2025-12-17', 7 + 40 / 60), ('civ_general', '民法總則', '2025-12-18', 12 + 20 / 60)]
WRONG = {'const_1': ENVL('WRONG_CONST', '2,5'), 'crim_gen1': ENVL('WRONG_CRIM', ''), 'civ_general': ENVL('WRONG_CIV', '3')}
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




# ---------------------------------------------------------------- 記錄（只記不改；cc_d118b3_probe 的 HOOK）
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




# ---------------------------------------------------------------- 頁面裡讀（cc_d118b3_probe）
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
            if '下一張' in T:
                out['menus'].append(T)
                want = {'all': '下一張', 'end': '結束總複習', 'skip': '跳到下一科'}.get(mode, '結束總複習')
                k = next((i for i, t in enumerate(T) if t.startswith(want)), None)
                if k is None: k = T.index('下一張')
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




S1B_PREP = r"""(wrongEvery=>{ try{ const G=GAME.G, R=CLS.rec(G), cids=['const_1','crim_gen1','civ_general']; let done=0, ask=0, askWrong=0; const att={}, weeks={};
  for(let d=G.day-140; d<G.day; d++){ const t=CALENDAR.termOf(d); if(!t||t.id!=='Y1S1'||!t.week||t.week>14) continue;
    for(const it of CLS.dayItems(G,d)){ if(!cids.includes(it.c.id)||it.exam) continue; if(!R.done[it.key]){ R.done[it.key]=1; done++; att[it.c.id]=(att[it.c.id]||0)+1; (weeks[it.c.id]||(weeks[it.c.id]=[])).push(t.week); } } }
  for(const cid of cids) R.attend[cid]=(R.attend[cid]||0)+(att[cid]||0);
  let n=0; for(const u of STUDY_UNITS.units){ if(u.term!=='Y1S1'||!cids.includes(u.course)||!u.askQid||u.week==null||u.week>14) continue; const q=EXAM_BANK.questions.find(x=>x.id===u.askQid); if(!q) continue; n++;
    let v=q.answer; if(wrongEvery&&n%wrongEvery===0){ const alt=(q.type==='tf'||!q.options)?(String(q.answer)==='O'?'X':'O'):Object.keys(q.options).find(k=>k!==String(q.answer)); if(alt!=null){ v=alt; askWrong++; } }
    R.ask['Y1S1:'+q.id]=v; ask++; }
  delete G.study; G.notes=[];
  return {done,attend:att,ask,askWrong,weeks:Object.fromEntries(Object.entries(weeks).map(([k,v])=>[k,[...new Set(v)]]))}; }catch(e){ return {err:String(e.message)}; } })"""


# ---------------------------------------------------------------- D118-B4 只讀
# 考前：用複製的存檔抽那一科期末的 5 題（不寫回），每題對到的卡、考前狀態、預期提示行（修改前沒有 cueFor＝只看 read／got）
PRE_Q = r"""(cid=>{ try{ const G2=JSON.parse(JSON.stringify(GAME.G)); const has=typeof STUDY!=='undefined'&&!!STUDY.unitsOfQ;
  const qs=(CLS.drawExam(G2,cid,'Y1S1','final').qs||[]);
  return qs.map((q,i)=>{ const us=has?STUDY.unitsOfQ(q.id):[]; const st=us.map(u=>[u.id,STUDY.stateOf?STUDY.stateOf(G2,u.id):null,(u.cue||'')||null,((STUDY.view&&STUDY.view(u))||{}).title||u.title||null]);
    let cue=null; try{ if(has&&STUDY.cueFor) cue=STUDY.cueFor(G2,q.id); }catch(e){ cue='ERR '+e.message; }
    const tf=q.type==='tf'||!q.options; const opt=tf?String(q.answer):'（'+q.answer+'）'+q.options[q.answer];
    return {n:i+1,id:q.id,q:q.q,answer:String(q.answer),type:q.type||null,opt,optText:tf?String(q.answer):String(q.options[q.answer]),
      others:tf?[]:Object.entries(q.options).filter(([k])=>k!==String(q.answer)).map(([k,v])=>String(v)),core:q.core||null,explanation:q.explanation||null,
      units:st,readAny:st.some(s=>s[1]==='read'||s[1]==='got'),cueExpect:cue}; }); }catch(e){ return {err:String(e.message)}; } })"""
# 【前置／捷徑：寫卡片狀態】mix：第 ns 題對到的卡設成 read
MIX_MARK = r"""(([cid,ns])=>{ try{ const G=GAME.G, G2=JSON.parse(JSON.stringify(G)); const qs=CLS.drawExam(G2,cid,'Y1S1','final').qs||[]; const out=[];
  for(const n of ns){ const q=qs[n-1]; if(!q) continue; for(const u of STUDY.unitsOfQ(q.id)){ out.push([n,q.id,u.id,STUDY.mark(G,u.id,'read','cc_probe')]); } } return out; }catch(e){ return {err:String(e.message)}; } })"""
# 選項框、題目框的位置（⑤）
CHBOX = r"""(()=>{ const vw=innerWidth, vh=innerHeight; const box=document.getElementById('choices'), dlg=document.getElementById('dlg');
  const R=e=>{ const r=e.getBoundingClientRect(); return {x:+r.left.toFixed(1),y:+r.top.toFixed(1),w:+r.width.toFixed(1),h:+r.height.toFixed(1),b:+r.bottom.toFixed(1),r:+r.right.toFixed(1)}; };
  const cb=box?R(box):null; const btns=box?[...box.querySelectorAll('button')].map(b=>{ const r=R(b); return {t:(b.textContent||'').trim().slice(0,50),...r,
    inView:r.x>=-0.5&&r.y>=-0.5&&r.r<=vw+0.5&&r.b<=vh+0.5, inBox:!cb||(r.y>=cb.y-0.5&&r.b<=cb.b+0.5)}; }):[];
  const dr=dlg&&!dlg.classList.contains('hide')?R(dlg):null; const ov=dr&&cb?Math.max(0,Math.min(dr.b,cb.b)-Math.max(dr.y,cb.y)):null;
  return {vw,vh,choices:cb,scroll:box?{sh:box.scrollHeight,ch:box.clientHeight,top:box.scrollTop}:null,btns,dlg:dr,dlgText:(document.getElementById('dlgText')||{}).textContent||'',overlapDlgChoices:ov}; })()"""
NOTES_DOM = r"""(()=>{ const b=document.getElementById('notesList'); if(!b) return null; return [...b.querySelectorAll('.item')].map(d=>{ const t=d.querySelector('b'); return {title:t?(t.textContent||'').trim():'',txt:(d.innerText||'').slice(0,1500)}; }); })()"""
GNOTES = r"""(()=>(GAME.G.notes||[]).map(n=>({id:n.id,title:n.title,body:n.body,day:n.day})))()"""
MISS = r"""(()=>{ try{ const s=GAME.G.study; return s&&s.miss?s.miss.slice():null; }catch(e){ return null; } })()"""


def is_cue(t, prefix_only=False):
    if t.startswith(CUE_PREFIX): return True
    return (not prefix_only) and t.startswith('（') and not t.startswith(RECALL_PREFIX)


def leak_flags(cue, q):
    """②：提示文字和正確選項的比對（只標 SUSPECT／INFO，不判）"""
    if not cue: return []
    body = cue[len(CUE_PREFIX):] if cue.startswith(CUE_PREFIX) else cue
    body = body.rstrip('）')
    opt = (q.get('optText') or '').strip(); f = []
    if opt and len(opt) >= 2 and opt in body: f.append('cue⊇正解')
    if body and opt and body in opt: f.append('正解⊇cue')
    if body and any(body in o for o in q.get('others') or []): f.append('錯誤選項也含cue')
    if re.search(r'答案|選\s*[（(]?[A-DＡ-ＤOX○×]', body): f.append('含答案字樣')
    if q.get('type') == 'tf' and re.search(r'[OX○×]|對的|錯的|正確|錯誤', body): f.append('是非題：含對錯字樣')
    return f


async def play_trip(pg, cdp, run, tag, it, answer=None, on_q=None, shoot_txt=(), picks=(), max_s=None):
    """（cc_d118b3_probe 的 play_trip，加 on_q）手機「今天」→ 那一列的「直接去上課」→ 照玩家：對話點過去、路上選「繼續去上課」、坐位子；
    考卷題目：先 on_q(i, R)（量位置、截圖），再 answer(i, 題幹, 選項)；上完那一堂、畫面空下來就結束"""
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
            T = [o['t'] for o in s['ch']]; ls = last_say(R)
            m = EXQ_RE.match(ls['t']) if ls else None
            if m and answer and ls['i'] not in answered:
                answered.add(ls['i']); qi = int(m.group(1))
                if on_q:
                    try: out['shots'] += (await on_q(qi, R) or [])
                    except Exception as e: run.note('%s：on_q 例外 %r' % (tag, e))
                k = await answer(qi, m.group(2), T)
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
    run.note('%s：結束 %s；%s' % (tag, J(out['end']), J({k: out[k] for k in ('ok', 'stuck', 'jumped', 'st')})))
    return out


JIAO = re.compile(r'交卷。答對 (\d)／5(?:，(\d+) 分。)?')

def answerer(pg, run, ekey, pre, wrong):
    async def answer(qi, stem, T):
        q = pre[qi - 1] if isinstance(pre, list) and qi - 1 < len(pre) else None
        if not q or q.get('q') != stem:
            q2 = await pg.evaluate(EXQ, [ekey, qi - 1])   # 考前抽的和畫面不同：改讀 R.exam（交卷前通常還沒有）
            run.note('【捷徑】注意：第 %d 題考前預測的題幹和畫面不同（預測 %s ／畫面 %s）；改讀 %s' % (qi, (q or {}).get('q', '')[:30], stem[:30], J(q2)[:200]))
            if isinstance(q2, dict) and 'opt' in q2: q = q2
            else: return 0
        ok = next((i for i, t in enumerate(T) if t == q['opt']), None)
        if ok is None: run.note('【捷徑】第 %d 題的選項裡找不到正解 %s；選項 %s' % (qi, q['opt'], J(T))); return 0
        if qi in wrong: k = next(i for i in range(len(T)) if i != ok); why = '故意選錯'
        else: k = ok; why = '正解'
        run.setup('【捷徑：只讀】%s 第 %d 題 %s 答案 %s → 點%s「%s」' % (ekey, qi, q.get('id'), q.get('answer'), why, T[k][:30]))
        return k
    return answer


async def measure(pg, run, tag, label):
    """⑤：橫向量＋截圖 → 直向量＋截圖 → 改回橫向"""
    res = {}; shots = []
    res['land'] = await pg.evaluate(CHBOX); shots.append(await run.shot(pg, '%s_%s_land' % (tag, label)))
    try:
        await pg.set_viewport_size(PORT); await pg.wait_for_timeout(ENVI('ROT_MS', 2500))
        res['port'] = await pg.evaluate(CHBOX); shots.append(await run.shot(pg, '%s_%s_port' % (tag, label)))
    finally:
        await pg.set_viewport_size(LAND); await pg.wait_for_timeout(1500)
    res['shots'] = shots
    return res


def chk_measure(run, tag, what, m):
    for vp in ('land', 'port'):
        b = (m or {}).get(vp) or {}
        btns = b.get('btns') or []
        bad = [x for x in btns if not x['inView']]
        run.check('%s：%s（%s %sx%s）選項 %d 個都在畫面裡' % (tag, what, '橫向' if vp == 'land' else '直向', b.get('vw'), b.get('vh'), len(btns)), bool(btns) and not bad,
                  J({'bad': bad, 'scroll': b.get('scroll'), 'choices': b.get('choices')}))
        hid = [x['t'] for x in btns if not x['inBox']]
        run.note('INFO %s：%s %s：選項框要捲才看得到的 %s；題目框 %s；題目框和選項框重疊 %s px；題目框文字「%s」' % (tag, what, vp, J(hid), J(b.get('dlg')), b.get('overlapDlgChoices'), (b.get('dlgText') or '')[:60]))


async def take_exam(pg, cdp, run, tr, S, cid, cname, tag, wrong, shoot5=False):
    """手機「今天」那一科期末 → 照玩家考完；逐題記提示行"""
    it = await pg.evaluate(EXITEM, [cid, 'final'])
    run.note('%s：%s 期末那一列 %s' % (tag, cname, J(it)))
    if not isinstance(it, dict):
        run.check('%s：%s 今天有期末那一列' % (tag, cname), False, J(it)); return None
    ekey = 'Y1S1:%s:final' % cid
    pre = await pg.evaluate(PRE_Q, cid)
    if not isinstance(pre, list): run.note('%s：考前預測讀不到 %s' % (tag, J(pre))); pre = []
    run.note('%s：考前預測（複製的存檔抽 5 題，不寫回）%s' % (tag, J([[q['n'], q['id'], [u[:2] for u in q['units']], q['readAny'], q['cueExpect']] for q in pre])))
    notes0 = await pg.evaluate(GNOTES); miss0 = await pg.evaluate(MISS)
    n1 = await pl_n(pg)
    shot = {'cue': False, 'nocue': False}; meas = {}

    async def on_q(qi, R):
        if not shoot5: return []
        rs = [r for r in R if r['k'] == 'say']
        idx = max((j for j, r in enumerate(rs) if EXQ_RE.match(r['t']) and r['t'].startswith('%d／5' % qi)), default=None)
        prev = rs[idx - 1]['t'] if idx else ''
        kind = 'cue' if is_cue(prev) else 'nocue'
        if shot[kind]: return []
        shot[kind] = True; await pg.wait_for_timeout(1500)
        m = await measure(pg, run, tag, 'q%d_%s' % (qi, kind)); m['qi'] = qi; m['prev'] = prev; meas[kind] = m
        return m['shots']

    r = await play_trip(pg, cdp, run, tag, it, answer=answerer(pg, run, ekey, pre, wrong), on_q=on_q,
                        shoot_txt=[(lambda t: shoot5 and t.startswith(CUE_PREFIX), 'cueline')] if shoot5 else ())
    R = await tr.take(pg, n1, 'exam_' + cid)
    says = [x['t'] for x in R if x['k'] == 'say']
    j = next((JIAO.search(t) for t in says if JIAO.search(t)), None)
    rec = await pg.evaluate(EXREC, ekey)
    k = int(j.group(1)) if j else None; sc = int(j.group(2)) if j and j.group(2) else None
    run.check('%s：%s 一鍵去考試、考完' % (tag, cname), r['ok'], J({x: r.get(x) for x in ('btn', 'stuck', 'jumped', 'end')}))
    # 逐題：題目前一句
    qrows = []
    for jx, t in enumerate(says):
        m = EXQ_RE.match(t)
        if not m: continue
        qi = int(m.group(1)); prev = says[jx - 1] if jx else ''
        cue = prev if is_cue(prev) else None
        q = pre[qi - 1] if qi - 1 < len(pre) else {}
        qrows.append({'case_tag': tag, 'course': cid, 'n': qi, 'id': q.get('id'), 'stem_match': q.get('q') == m.group(2), 'units': q.get('units'), 'readAny': q.get('readAny'),
                      'cueExpect': q.get('cueExpect'), 'cue': cue, 'prefix_ok': bool(cue and cue.startswith(CUE_PREFIX)), 'optText': q.get('optText'), 'type': q.get('type'),
                      'leak': leak_flags(cue, q), 'wrong_on_purpose': qi in wrong})
    # 記實際作答是否答對（給 ④）
    byi = {a['i']: a for a in r['answers']}
    ans_ok = [bool(byi.get(q['n']) and byi[q['n']]['picked'] == q.get('opt')) for q in pre]
    notes1 = await pg.evaluate(GNOTES); miss1 = await pg.evaluate(MISS)
    newn = [n for n in notes1 if n['id'] not in {x['id'] for x in notes0}]
    toasts = [x['t'] for x in R if x['k'] == 'toast']
    e = {'key': ekey, 'k': k, 'score': sc, 'rec': rec, 'qs': (rec or {}).get('qs'), 'pre_ids': [q['id'] for q in pre], 'trip_ok': r['ok'], 'answers': r['answers'], 'ans_ok': ans_ok,
         'shots': r['shots'], 'qrows': qrows, 'new_notes': newn, 'miss_new': [m for m in (miss1 or []) if m not in (miss0 or [])], 'toasts': toasts, 'measure': meas, 'pre': pre}
    S.setdefault('exams', {})[cid] = e
    S.setdefault('questions', []).extend(qrows)
    exam_checks(run, tag, cname, e, wrong)
    if shoot5:
        if not meas.get('cue'): run.check('%s：⑤這一場有提示行的題目畫面（修改前預期 FAIL）' % tag, False, J([[x['n'], x['readAny'], x['cue']] for x in qrows]))
        if meas.get('cue'): chk_measure(run, tag, '有提示行的第 %d 題' % meas['cue']['qi'], meas['cue'])
        if meas.get('nocue'): chk_measure(run, tag, '（INFO 對照）沒有提示行的第 %d 題' % meas['nocue']['qi'], meas['nocue'])
    return e


def exam_checks(run, tag, cname, e, wrong):
    # ① 逐題
    rows_ = e['qrows']
    run.check('%s：%s 畫面出現 5 題、題幹和考前預測相同（預測可用）' % (tag, cname), len(rows_) == 5 and all(x['stem_match'] for x in rows_), J([[x['n'], x['id'], x['stem_match']] for x in rows_]))
    rd = [x for x in rows_ if x['readAny']]; un = [x for x in rows_ if not x['readAny']]
    if rd:
        run.check('%s：%s ①讀過（卡片 read／got）的 %d 題，題目前面都有提示行（修改前預期 FAIL）' % (tag, cname, len(rd)), all(x['cue'] for x in rd), J([[x['n'], x['id'], x['cue']] for x in rd]))
        pm = [x['n'] for x in rd if x['cue'] and not x['prefix_ok']]
        if pm: run.note('INFO %s：%s 第 %s 題的提示行不是 CUE_PREFIX 開頭（prefix_mismatch：字可能已換，或抓錯那一句）' % (tag, cname, pm))
        ce = [[x['n'], x['cue'], x['cueExpect']] for x in rd if x['cueExpect'] is not None and x['cue'] != x['cueExpect']]
        run.note('INFO %s：%s 提示全文和 STUDY.cueFor（考前複製存檔算）不同的 %s' % (tag, cname, J(ce)))
    if un:
        run.check('%s：%s ①沒讀過的 %d 題沒有提示行' % (tag, cname, len(un)), not any(x['cue'] for x in un), J([[x['n'], x['id'], x['cue'], [u[:2] for u in (x['units'] or [])]] for x in un]))
    for x in rows_:
        run.note('Q %s：%s 第 %d 題 %s 卡 %s 讀過=%s 提示行=%s 正解「%s」%s' % (tag, cname, x['n'], x['id'], J([u[:2] for u in (x['units'] or [])]), x['readAny'], J(x['cue']), (x['optText'] or '')[:40], (' SUSPECT ' + '+'.join(x['leak'])) if x['leak'] else ''))
    # ② 只標
    sus = [[x['n'], x['id'], x['cue'], x['optText'], x['leak']] for x in rows_ if x['leak']]
    run.note('%s ②：%s 提示和正確選項比對：%s' % ('SUSPECT' if sus else 'INFO', cname, J(sus) if sus else '沒有可疑'))
    # ④
    want_k = sum(1 for ok in e['ans_ok'] if ok)
    run.check('%s：%s ④交卷答對 %s／5＝實際點對的題數 %d、分數＝CLS.scoreOf（%s）、R.exam 相同' % (tag, cname, e['k'], want_k, SCORE[want_k] if want_k <= 5 else '?'),
              e['k'] == want_k and e['score'] == SCORE[want_k] and (e['rec'] or {}).get('correct') == want_k and (e['rec'] or {}).get('score') == SCORE[want_k],
              J({'shown': [e['k'], e['score']], 'rec': {x: (e['rec'] or {}).get(x) for x in ('correct', 'score', 'status')}, 'ans_ok': e['ans_ok']}))
    run.check('%s：%s 考前抽的題號＝R.exam 的題號' % (tag, cname), e['pre_ids'] == e['qs'], J([e['pre_ids'], e['qs']]))
    # ③ G.notes（只讀）
    fx = [n for n in e['new_notes'] if n['id'].startswith('examfix_')]
    nwrong = 5 - (e['k'] or 0) if e['k'] is not None else None
    if nwrong:
        n = fx[0] if fx else None
        body = (n or {}).get('body') or ''
        miss_items = []
        for x in [q for q in e['pre'] if not (e['ans_ok'][q['n'] - 1] if q['n'] - 1 < len(e['ans_ok']) else True)]:
            miss_items.append({'n': x['n'], 'q_in': x['q'] in body, 'ans_in': ('答案' in body and (x['optText'] in body)), 'core_in': (x['core'] in body) if x['core'] else None})
        run.check('%s：%s ③答錯 %d 題 → 這次考試新增「考後訂正」筆記剛好一則（G.notes id examfix_…；修改前預期 FAIL）' % (tag, cname, nwrong), len(fx) == 1, J([[x['id'], x['title']] for x in e['new_notes']]))
        if n:
            run.check('%s：%s ③訂正筆記有每一題答錯的題目、答案（正確選項文字）、考點（有 core 的題）' % (tag, cname), all(m['q_in'] and m['ans_in'] and m['core_in'] is not False for m in miss_items), J(miss_items))
            run.note('INFO %s：%s 訂正筆記標題「%s」（暫定字，FIX_SUFFIX＝%s：%s）id %s' % (tag, cname, n['title'], FIX_SUFFIX, n['title'].endswith(FIX_SUFFIX), n['id']))
            run.note('INFO %s：%s 訂正筆記全文：%s' % (tag, cname, J(body)))
        run.note('INFO %s：%s 這場新進 miss 的卡 %s；toast %s' % (tag, cname, J(e['miss_new']), J(e['toasts'])))
    elif nwrong == 0:
        run.check('%s：%s ③全對 → 沒有新增訂正筆記' % (tag, cname), not fx, J([[x['id'], x['title']] for x in e['new_notes']]))


async def notes_page(pg, cdp, run, S, tag):
    """③ 玩家：☰（預設筆記頁）→「筆記」→ 讀 DOM（只讀）→ 直向＋橫向截圖 → 返回遊戲"""
    await L.close_panels(pg, cdp)
    await L.tap(pg, cdp, '#btnMenu'); await pg.wait_for_timeout(900)
    await L.tap(pg, cdp, '#menu [data-tab="notes"]'); await pg.wait_for_timeout(1200)
    dom = await pg.evaluate(NOTES_DOM) or []
    gn = await pg.evaluate(GNOTES)
    shots = await shot2(pg, run, tag + '_notes')
    await L.close_panels(pg, cdp)
    fixd = [d for d in dom if d['title'].endswith(FIX_SUFFIX) or '訂正' in d['title']]
    fixg = [n for n in gn if n['id'].startswith('examfix_')]
    S['notes_page'] = {'dom_fix': fixd, 'g_fix': fixg, 'shots': shots, 'n_dom': len(dom)}
    ex = S.get('exams') or {}
    for cid, cname, _, _ in LAW3:
        e = ex.get(cid)
        if not e or e.get('k') is None: continue
        mine = [d for d in fixd if d['title'].startswith(cname)]
        if e['k'] < 5:
            run.check('%s：③筆記頁（☰「筆記」DOM）有一則「%s…訂正」（暫定字 %s），截圖 %s' % (tag, cname, FIX_SUFFIX, J(shots)), len(mine) == 1, J([d['title'] for d in fixd]))
            if mine:
                body = mine[0]['txt']; miss = [q for q in e['pre'] if not e['ans_ok'][q['n'] - 1]]
                run.check('%s：③筆記頁那一則看得到答錯每一題的題目開頭、「答案」、「考點」（有 core 的題）' % tag,
                          all(q['q'][:20] in body and '答案' in body and (not q['core'] or '考點' in body) for q in miss), J({'txt': body[:600]}))
                run.note('INFO %s：%s 筆記頁那一則的換行：body 有 %d 個 \\n，畫面 innerText 有 %d 行（renderNotes 沒有 pre-line，\\n 可能不換行）' % (tag, cname, ((next((n['body'] for n in fixg if n['title'].startswith(cname)), '') or '').count('\n')), body.count('\n') + 1))
        else:
            run.check('%s：③全對的「%s」筆記頁沒有訂正那一則' % (tag, cname), not mine, J([d['title'] for d in fixd]))
    run.check('%s：③G.notes 的 examfix_ 一科一則（沒有重複 id、沒有重複課名）' % tag, len({n['id'] for n in fixg}) == len(fixg) and len({n['title'] for n in fixg}) == len(fixg), J([[n['id'], n['title']] for n in fixg]))


# ================================================================ 情境
async def three_exams(pg, cdp, run, tr, S, tagp, snap, shoot5_first=True):
    for ci, (cid, cname, dkey, hh) in enumerate(LAW3):
        await jump(pg, cdp, run, dkey, hh, 'dorm', snap=snap if ci == 0 else None, label='%s期末那天（週末＋考試週中間的日子不是這一項要驗的）' % cname)
        e = await take_exam(pg, cdp, run, tr, S, cid, cname, '%s_exam_%s' % (tagp, cid), WRONG[cid], shoot5=shoot5_first and not S.get('shot5_done'))
        if e and (e.get('measure') or {}).get('cue'): S['shot5_done'] = True
    if shoot5_first and not S.get('shot5_done'): run.check('%s：⑤找到有提示行的題目畫面量選項位置（修改前預期 FAIL）' % tagp, False)
    await wait_free(pg, cdp, 60)
    await notes_page(pg, cdp, run, S, tagp)


async def case_S1(pg, cdp, run, tr, S):
    st, d = await state_at(pg, '2025-12-13', 14.0, 'dorm')
    n0 = await pl_n(pg)
    await load(pg, cdp, run, st, '最小存檔 2025-12-13（六，%s 第 %s 週）14:00 宿舍；整學期沒自習、沒上過課、沒有課本；examSeed=%s' % (d['term'], d['week'], st['flags'].get('examSeed')))
    await tr.take(pg, n0, 'setup')
    menu = await open_menu(pg, cdp, run, 'desk', 's1_desk'); S['menu'] = {k: menu.get(k) for k in ('ok', 'menu_txt', 'idx')}
    run.check('S1：宿舍書桌的選單有「%s」（B3；前置用）' % LABEL, menu.get('idx') is not None, J(S['menu']))
    if menu.get('idx') is None: await leave_menu(pg, cdp, run, 's1'); return
    rv = await run_review(pg, cdp, run, 's1_review', menu, mode=ENVS('S1_READ', 'end'))
    await tr.take(pg, rv['n0'], 'review')
    S['review'] = {k: rv.get(k) for k in ('ok', 'start', 'end', 'ret', 'caps')}
    pr = (rv.get('after') or {}).get('prog') or {}
    run.check('S1：總複習跑完、三科「讀過」＝範圍全部（前置）', rv['ok'] and all(isinstance(pr.get(c), dict) and pr[c].get('total', 0) > 0 and pr[c]['read'] == pr[c]['total'] for c, _, _, _ in LAW3), J(pr))
    snap = await pg.evaluate("()=>GAME.snapshot()")
    await three_exams(pg, cdp, run, tr, S, 's1', snap)


async def case_noreview(pg, cdp, run, tr, S):
    st, d = await state_at(pg, '2025-12-13', 14.0, 'dorm')
    n0 = await pl_n(pg)
    await load(pg, cdp, run, st, '最小存檔 2025-12-13（六）14:00 宿舍；和 S1 同一份、同 examSeed=%s；不做總複習' % st['flags'].get('examSeed'))
    await tr.take(pg, n0, 'setup')
    snap = await pg.evaluate("()=>GAME.snapshot()")
    await three_exams(pg, cdp, run, tr, S, 'nr', snap, shoot5_first=False)
    allq = S.get('questions') or []
    run.check('noreview：①卡片全空 → 15 題一行提示都沒有', len(allq) == 15 and not any(x['cue'] for x in allq), J([[x['course'], x['n'], x['cue']] for x in allq if x['cue']]))


async def case_mix(pg, cdp, run, tr, S):
    cid, cname, dkey, hh = LAW3[0]
    st, d = await state_at(pg, dkey, hh, 'dorm')
    n0 = await pl_n(pg)
    await load(pg, cdp, run, st, '最小存檔 %s %s 宿舍（憲法期末那天）；examSeed=%s' % (dkey, hm(hh), st['flags'].get('examSeed')))
    ns = ENVL('MIX_READ', '1,3')
    mk = await pg.evaluate(MIX_MARK, [cid, ns])
    S['mix_mark'] = mk
    run.setup('【前置／捷徑：寫卡片狀態】用複製的存檔抽憲法期末 5 題（不寫回），第 %s 題對到的觀念卡 STUDY.mark(...,"read")：%s' % (ns, J(mk)))
    await tr.take(pg, n0, 'setup')
    await take_exam(pg, cdp, run, tr, S, cid, cname, 'mix_exam_%s' % cid, ENVL('MIX_WRONG', '3'), shoot5=True)
    e = (S.get('exams') or {}).get(cid) or {}
    rows_ = e.get('qrows') or []
    run.check('mix：同一場考試裡「讀過」「沒讀過」兩種題都有（前置成立）', any(x['readAny'] for x in rows_) and any(not x['readAny'] for x in rows_), J([[x['n'], x['readAny']] for x in rows_]))
    run.check('mix：①每一題 有沒有提示行＝考前卡片有沒有 read／got', len(rows_) == 5 and all(bool(x['cue']) == bool(x['readAny']) for x in rows_), J([[x['n'], x['readAny'], x['cue']] for x in rows_]))
    await wait_free(pg, cdp, 60)
    await notes_page(pg, cdp, run, S, 'mix')


async def case_S1b(pg, cdp, run, tr, S):
    st, d = await state_at(pg, '2025-12-13', 14.0, 'dorm')
    n0 = await pl_n(pg)
    await load(pg, cdp, run, st, '最小存檔 2025-12-13（六）14:00 宿舍；examSeed=%s' % st['flags'].get('examSeed'))
    r = await pg.evaluate(S1B_PREP, ENVI('S1B_ASK_WRONG', 4))
    S['prep_shortcut'] = r
    snap = await pg.evaluate("()=>GAME.snapshot()")
    await load(pg, cdp, run, snap, 'S1b：大一上第 1～14 週三科法律課都上過（R.done、attend 照 CLS.dayItems 的實際排課；R.ask 課堂提問每 %s 題答錯一題）；刪掉 G.study 讓讀檔時 STUDY.backfill 推回卡片狀態 → 再讀：%s'
               % (ENVI('S1B_ASK_WRONG', 4) or '∞', J(r)[:400]), tagp='【前置／捷徑】')
    await tr.take(pg, n0, 'setup')
    snap = await pg.evaluate("()=>GAME.snapshot()")
    want = [c.strip() for c in ENVS('S1B_COURSES', 'const_1').split(',') if c.strip()]
    first = True
    for cid, cname, dkey, hh in LAW3:
        if cid not in want: continue
        await jump(pg, cdp, run, dkey, hh, 'dorm', snap=snap if first else None, label='%s期末那天' % cname); first = False
        await take_exam(pg, cdp, run, tr, S, cid, cname, 's1b_exam_%s' % cid, WRONG[cid], shoot5=False)
    allq = S.get('questions') or []
    run.check('S1b：①每一題 有沒有提示行＝考前卡片有沒有 read／got（got 來自課堂提問答對；heard 不算）', bool(allq) and all(bool(x['cue']) == bool(x['readAny']) for x in allq), J([[x['course'], x['n'], [u[1] for u in (x['units'] or [])], x['cue']] for x in allq]))
    run.note('INFO S1b：混合程度（讀過 %d 題／沒讀過 %d 題；看抽到哪幾題）' % (sum(1 for x in allq if x['readAny']), sum(1 for x in allq if not x['readAny'])))
    await wait_free(pg, cdp, 60)
    await notes_page(pg, cdp, run, S, 's1b')


RUNNERS = {'S1': case_S1, 'noreview': case_noreview, 'mix': case_mix, 'S1b': case_S1b}


def cross_checks(run):
    a, b = SUMMARY.get('S1') or {}, SUMMARY.get('noreview') or {}
    if not a.get('exams') or not b.get('exams'): return
    for cid, cname, _, _ in LAW3:
        x, y = a['exams'].get(cid), b['exams'].get(cid)
        if not x or not y: continue
        run.check('④ S1（總複習、有提示行）vs noreview（沒總複習、沒提示行）：%s 同樣的題號、同樣的點法 → 答對題數、分數相同' % cname,
                  x['qs'] == y['qs'] and x['ans_ok'] == y['ans_ok'] and x['k'] == y['k'] and x['score'] == y['score'],
                  J({'S1': [x['qs'], x['ans_ok'], x['k'], x['score']], 'noreview': [y['qs'], y['ans_ok'], y['k'], y['score']]}))


async def main():
    global URL, OUT
    from playwright.async_api import async_playwright
    URL, OUT = sys.argv[1], sys.argv[2]
    os.makedirs(OUT, exist_ok=True)
    run = L.Run('d118b4_' + '+'.join(CASES), OUT)
    SUMMARY.update(sha=os.environ.get('SHA', '?'), url=URL, cases=CASES, seed=SEED, cue_prefix=CUE_PREFIX, fix_suffix=FIX_SUFFIX, wrong=WRONG)
    print('==== D118-B4 考試裡的 cue 和考後訂正（SHA %s）不用 turbo；作答用【捷徑：只讀】；不是 iPhone ====' % SUMMARY['sha'], flush=True)
    if 'turbo' in URL: run.note('注意：URL 有 turbo，這支規定不用 turbo')
    async with async_playwright() as p:
        for c in CASES:
            print('==== CASE %s ====' % c, flush=True)
            if c not in RUNNERS: run.check('CASE %s 認得（%s）' % (c, ','.join(RUNNERS)), False); continue
            tr = TR(c); S = SUMMARY.setdefault(c, {})
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
    cross_checks(run)
    for c in CASES:
        for e in ((SUMMARY.get(c) or {}).get('exams') or {}).values():
            e.pop('pre', None)
    dump('d118b4_summary.json', SUMMARY)
    print('SHA', SUMMARY['sha'], 'CASES', ','.join(CASES), flush=True)
    sys.exit(run.finish())


if __name__ == '__main__':
    asyncio.run(main())
