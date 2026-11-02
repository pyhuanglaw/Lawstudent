"""CC（帳號 A）11-02：D118-B2 的 BB 瀏覽器驗收探針（觀念卡資料層、「法律」頁每科「讀過 x／y、答對過 z」、沒有 setBoard 的教室用字幕顯示黑板）。
規格：D118_PLAN.md 第 4 節 D118-B2（BB 驗收：新遊戲大一上上兩週課，其中一堂在萬才館多功能教室，再自習一次 → 「法律」頁憲法、民總的進度數字正確；
  在萬才館看得到黑板內容的字幕；手機直向、橫向各截圖一張）；BB_222 SE-07（三種來源都讓進度增加；數字和筆記一致）；共同規則 1～9（基準先 FAIL、TR 逐字稿、CC 初判）。
不是 iPhone：Playwright 手機模擬（SwiftShader，1～4 fps）。真實玩家流程照 docs/TESTING.md 第 15 行：URL 不加 ?turbo（加了會印【捷徑】turbo）。

讀碼事實（a3b1bd647 與 d4398a91 相同）：
  * 大一上（Y1S1）沒有任何一門課在萬才館多功能教室（courses.js 的 WMULTI 只有：大二上民法物權 週二下午一、大二下民法身分法、大三上公司法、大三下保險法、
    大四上強制執行法、大四下保險法（日本補修））。所以「大一上其中一堂在萬才館多功能教室」照真實課表做不到——萬才館那一段改成【前置】讀檔到
    大二上第 2 週週二 12:30 宿舍（2026-09-15）→ 手機「直接去上課：民法物權」（法律系館B 多功能教室，zone wancai_multi，GLB 教室、沒有 setBoard）。
  * 大一上本身也有「沒有 setBoard 的教室」：週二大一國文（博思 101）、週二通識（普通 101）、週四大一英文（共同 102）；有 setBoard 的只有 201（zones3d.js:1404）。
    兩週真實流程裡每一堂都記下「上課那一刻那一區有沒有 setBoard、黑板三行（CLS.content(it).board）、上課期間的字幕」。
  * 「法律」頁在選單（#btnMenu →「法律」分頁 #legalList，game3d.js renderLegal），不在手機；探針先找手機有沒有 data-ptab="legal"，沒有就開選單。
  * 修改前（a3b1bd647）renderLegal 每科只有「大一上・上過 N 週」＋週次清單，沒有 STUDY 模組 ⇒ 預期 FAIL：沒有「讀過 x／y、答對過 z」、頁面只讀算的值 N/A、
    萬才館（以及國文、英文、通識）的字幕沒有黑板內容（classes3d.js:307 只有 E.zone.setBoard 存在才寫黑板，else 什麼都不做）。

MODE（一次一個）：
  pre（預設）【前置】最小存檔（GAME.defaults＋過了開場的旗標，同 cc_dl04b_probe.py 的 state_at）放在 START（預設 Y1S1 第 1 週週一 07:00 宿舍），
       新開局的旗標（LAW_START_DAY＝8/29、MAIN_D1＝−13、CAMP_Y1、LAW_MOVEIN_DAY）一起補上——不補的話 9/17 以前不排課（classes3d.js dayItems 的 lawStart）。
       LEGACY=1：不補新開局旗標（舊的 9/17 開局；START 要在第 3 週週三以後，例 START=Y1S1,4,1，同 dl04b 用過的存檔）。
  full  從標題「從法律系開始」（#btnNewLaw，8/22 宿營 → 8/29 搬宿舍）一路照玩家玩到第 2 週結束（沒有任何讀檔；很長，預估 2～4 小時）。
之後兩種一樣，全部照玩家：起床選單「直接去上課：」、下課選單「直接去下一堂：」、路上「繼續去上課：」、座位「老位子／坐中間的位子」；
  今天沒有下一堂（或還沒出選單）就手機「今天」→「直接去上課」；今天的課上完 → 手機「地點」回宿舍 → 床「睡到明天早上」（17:30 前只有小睡＝「睡到傍晚」，醒來再上床）；
  其他事件、邀約照玩家點過、選婉拒那一類（DECL）。手機自己打開（D103）就收起來。SPLIT=1：第 1 週最後一個上課日上完以後，【前置】同一份進度跳到下週一 07:00 宿舍（略過週末）。
  第 2 週最後一個上課日上完（或那天沒有課）→ 回宿舍 → 打開「法律」頁（自習前，只記）→ 宿舍書桌「讀書」→ 讀多久選第一個 → 選科「民法總則」（STUDY_CID）→
  打開「法律」頁（橫向截圖、讀 DOM）→【前置】同一份進度在直向畫面重新讀檔（新的瀏覽器）→「法律」頁直向截圖。
  WANCAI=1（預設）：另開瀏覽器【前置】大二上第 2 週週二 12:30 宿舍 →「直接去上課：民法物權」（萬才館多功能教室）→ 記上課期間的字幕＋截圖。WANCAI_ONLY=1 只跑這一段。

★11-02 更新（ba7983b6f＝D118-B1、B2 整合；讀碼＋node tests/d118_b2_unit.js ALL PASS）：改成 CASES（逗號隔開，各開一個瀏覽器；預設 wancai,y1_rooms,ask_note,legal_page；
  原本的兩週真實流程是 flow，預設不跑；WANCAI_ONLY=1＝CASES=wancai）。NO_STUDY=1（預設）：flow 不做自習那一段（BB 自己測 SE-07），「法律」頁照兩週上完課的狀態判定。
  實作（讀碼 classes3d.js:307–308）：有 3D 黑板（只有 201 classroom 的 setBoard）照舊寫黑板；沒有的教室（含門口上課）＝GAME.caption('黑板', 三行.filter(Boolean).join('　'), 6000)
  ——不是 say、不是 toast。探針記 HOOK 的 cap（n＝'黑板'），判定「黑板字幕＝三行用全形空白接起來」（capExact）。
  wancai      【前置】大二上第 2 週週二 2026-09-15 12:30 宿舍 → 民法物權（萬才館多功能教室 wancai_multi）照玩家上完；黑板字幕＝「物權法定（§757）　物權的種類和內容……　你不能自己發明一種物權」；
              這一堂也有課堂提問 CIVS_30（只記筆記）。修改前 FAIL（沒有字幕），修改後預期 PASS。
  y1_rooms    【前置】大一上第 2 週：2025-09-09（二）08:30 → 大一國文（博思 101）；同一天 12:36 → 通識：電影與敘事（普通 101）；2025-09-11（四）08:30 → 大一英文（共同 102）；
              每一堂各讀一次檔（不真實過兩週），手機「直接去上課」照玩家上完，逐堂記黑板三行、黑板字幕。黑板：國文「大一國文（上）：現代散文　本週：現代散文」、
              通識「鏡頭的距離　特寫、中景、遠景　靠得越近，觀眾越相信嗎？」、英文「大一英文（上）：閱讀　本週：閱讀」。修改前 FAIL，修改後預期 PASS。Y1R_SPECS 可以換。
  ask_note    【前置】大一上第 5 週週四 2025-10-02 12:36 宿舍 → 民法總則（201）照玩家上完；課堂提問 CIVS_01 選正確答案（B）（ASK_PICK=right；first＝第一個）→ ☰「筆記」
              找「民法總則・第 5 週課堂提問」：題目、「答案：（B）滿十八歲之成年人」、「考點：行為能力」（直向橫向各一張）＋只讀 G.notes、STUDY.status（civ_general_w5＝got）。
              修改前 FAIL（classAsk 不記筆記），修改後預期 PASS。
  legal_page  同一個瀏覽器接著 ask_note：☰「法律」頁 憲法（上）、民法總則「期末範圍：讀過 x／y・答對過 z」＝只讀 STUDY.progress(G,c,'final',term)（renderLegal 用的同一個）；
              點開兩科的「觀念卡（n 張）」，每一列「· 第 n 週　標題　上過課／讀過／答對過／還沒讀」＝只讀 STUDY.status；橫向、直向各截圖。
              預期（只上了第 5 週民總、選對）：民總 讀過 1／10・答對過 1（答對過也算讀過），憲法 讀過 0／9・答對過 0。修改前 FAIL（沒有數字、沒有 STUDY）。
  flow        原本的兩週真實流程（MODE pre／full、SPLIT、LEGACY 照舊）。

check（客觀記錄；判定一律 BB，這裡是 CC 初判）：
  ① 「法律」頁有憲法（上）、民法總則兩列，各有「讀過 x／y、答對過 z」（修改前 FAIL）；② 數字＝頁面裡只讀算的 STUDY.progress(G,課,kind)（kind 試 final／mid／不給；
  修改前 STUDY 不存在 ⇒ 印 N/A、FAIL）；③ 自習民總後，民總的「讀過」比自習前多（SE-07 ① 的自習來源；修改前沒有數字 ⇒ FAIL）；
  ④ 萬才館多功能教室那一堂：那一區沒有 setBoard、上課期間有一句字幕含黑板第一行（修改前 FAIL）；⑤ 兩週裡沒有 setBoard 的每一堂（國文、英文、通識）同上（修改前 FAIL）；
  ⑥ 沒有 JS 例外；⑦ GAME.walkFallbacks＝0；⑧ 兩週真的上到課（出席次數＞0、沒有卡住）。
逐字稿：<輸出>/transcript.json（GAME.say／caption／toast／choose／enter／CLS.attend／EVENTS.run 全文＋#caption DOM 變化＋各段的「法律」頁文字與只讀算的值）。
用法：LW_TESTS=<工作樹>/tests SHA=<sha> [CASES=wancai,y1_rooms,ask_note,legal_page|flow] [MODE=pre|full] python3 cc_d118b2_probe.py '<URL>/index.html' <輸出資料夾>
環境變數：START（'Y1S1,1,1'）、WEEKS（2）、SPLIT（0）、LEGACY（0）、STUDY_CID（civ_general）、WANCAI（1）、WANCAI_ONLY（0）、WC_KEY（'Y2S1,2,2'）、WC_CID（property）、
  NO_STUDY（1）、Y1R_SPECS、ASK_SPEC（'2025-10-02@12.6:civ_general'）、ASK_PICK（right）、
  PORTRAIT（1）、DAY_MAX（一個遊戲日的上限秒數，900）、TRIP_MAX（600）、STUCK_S（240）、FULL_MAX（full 模式整段上限秒數，14400）。"""
import os, sys, json, asyncio, re, time, copy, traceback
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__)))); import bbplay as P   # bbplay 在上一層（BB 的 test_tools）
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
MODE = os.environ.get('MODE', 'pre').strip()
J = lambda o: json.dumps(o, ensure_ascii=False)
ENVI = lambda k, d: int(os.environ.get(k, str(d)))
ENVK = lambda k, d: [int(x) if x.strip().isdigit() else x.strip() for x in os.environ.get(k, d).split(',')]
START = ENVK('START', 'Y1S1,1,1')
WEEKS = ENVI('WEEKS', 2)
SPLIT = ENVI('SPLIT', 0)
LEGACY = ENVI('LEGACY', 0)
STUDY_CID = os.environ.get('STUDY_CID', 'civ_general')
WC_KEY = ENVK('WC_KEY', 'Y2S1,2,2')
WC_CID = os.environ.get('WC_CID', 'property')
COURSES_CHK = (('const_1', '憲法（上）'), ('civ_general', '民法總則'))
NO_STUDY = ENVI('NO_STUDY', 1)
_cdef = 'wancai' if ENVI('WANCAI_ONLY', 0) else os.environ.get('CASES', 'wancai,y1_rooms,ask_note,legal_page')
CASES = [c.strip() for c in _cdef.split(',') if c.strip()]
Y1R_SPECS = [x.strip() for x in os.environ.get('Y1R_SPECS', '2025-09-09@8.5:chinese_y1,2025-09-09@12.6:ge_film_y1s1,2025-09-11@8.5:english_y1').split(',') if x.strip()]
ASK_SPEC = os.environ.get('ASK_SPEC', '2025-10-02@12.6:civ_general')   # 大一上第 5 週週四 13:20 民法總則（201），那一週 syllabus ask＝CIVS_01
ASK_PICK = os.environ.get('ASK_PICK', 'right')   # right＝選正確答案（玩家選得到）；first＝第一個
LAND = {'width': 844, 'height': 390}; PORT = {'width': 390, 'height': 844}


class _Done(Exception):
    pass
CONT = '繼續去上課'
TR = {'sha': os.environ.get('SHA', '?'), 'url': URL, 'mode': MODE, 'checks': [], 'segments': {}}
RX = re.compile(r'讀過\s*(\d+)\s*[／/]\s*(\d+)[^0-9]{0,10}?答對過\s*(\d+)')


def hm(h):
    if h is None: return '--:--'
    m = int(round(float(h) * 60)); return '%02d:%02d' % (m // 60, m % 60)


def chk(run, name, ok, info=''):
    TR['checks'].append({'name': name, 'ok': bool(ok), 'info': info if isinstance(info, str) else J(info)})
    return run.check(name, ok, info if isinstance(info, str) else J(info))


def save_tr():
    try:
        with open(os.path.join(OUT, 'transcript.json'), 'w', encoding='utf-8') as f: json.dump(TR, f, ensure_ascii=False, indent=1)
    except Exception as e: print('transcript 存不了', e)


# ---------------------------------------------------------------- 存檔（cc_dl04b_probe.py 的 state_at，加新開局旗標）
BASEF = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True, 'metAn': True, 'met_an': True, 'MET_ZHE': True,
         'zheNoodleDone': True, 'KX_FIRST_MSG': True, 'KX_EVE_MSG': True, 'FAM_GROUP_SENT': True, 'CEREMONY_Y1': True, 'KAI_MOVEIN': True, 'LAW_RECAP_SEEN': True,
         'fundsV2': 1, 'KX_DEC3_MIGRATED': True, 'dating_kexin': False}
ROOMS = (('ROOM_Y2', '2026-09-06'), ('ROOM_Y3', '2027-09-05'), ('ROOM_Y4', '2028-09-03'))
VISITED = ('noodle', 'cafe', 'library_hall', 'library', 'lawlib', 'wancai', 'linze', 'gongguan', 'wenzhou', 'soclib', 'cvs', 'bookstore')
CLEARP = "(()=>{ if(typeof CLS!=='undefined'&&CLS.clearPending){ CLS.clearPending(); return true; } return false; })()"


async def state_at(pg, key, h, zone, flags=None, newstart=True):
    d = await P.day_of(pg, key)
    st = {'name': '祐廷', 'energy': 100, 'events': {'done': {}, 'last': {}, 'count': 0}, 'contacts': {}}
    F = st['flags'] = dict(BASEF)
    if newstart:   # story3d.js startLawWeek1：新開局＝8/29 搬宿舍、主線第一天 9/3（S.LAW_D0、S.MAIN_D1_NEW）；不補的話 9/17 以前不排課
        d0 = (await P.day_of(pg, '2025-08-29'))['d']
        F.update({'LAW_START_DAY': d0, 'MAIN_D1': -13, 'CAMP_Y1': True, 'LAW_MOVEIN_DAY': d0, 'allowanceMonth': 8})
    for k, kk in ROOMS:
        dd = (await P.day_of(pg, kk))['d']
        if dd <= d['d']: F[k] = dd
    F.update(flags or {})
    st.update(day=d['d'], weekday=d['wd'], hour=h, zone=zone, pos=None, weather='clear', stage='law', money=30000)
    st['visited'] = {z: True for z in VISITED}
    return st, d


async def load(pg, cdp, run, st, label):
    """[前置] 讀檔（遊戲自己的 GAME.applySave）＋清掉還沒出的選單（同重新整理）；條件事件、手機自動打開照舊"""
    await L.load_state(pg, st, quiet_events=False, quiet_phone=False); await pg.evaluate(CLEARP)
    await pg.wait_for_timeout(3500); await L.phone_away(pg, cdp, tries=2)
    run.setup('[前置] ' + label)


# ---------------------------------------------------------------- 記錄（只記不改；cc_dl04b_probe.py 的 HOOK，attend 多記 setBoard 與黑板三行）
HOOK = r"""(()=>{ if(window.__PLH) return 'again'; window.__PLH=1; window.__PL=[];
  const at=()=>{ try{ return {d:CALENDAR.dateOf(GAME.G.day).key, h:+(+GAME.G.hour).toFixed(3), z:GAME.G.zone}; }catch(e){ return {}; } };
  const push=o=>{ try{ Object.assign(o,at()); window.__PL.push(o); if(window.__PL.length>20000) window.__PL.splice(0,4000); }catch(e){} return o; };
  const s0=GAME.say; GAME.say=function(w,t){ push({k:'say',n:(w&&w.name)||(typeof w==='string'?w:''),t:String(t==null?'':t)}); return s0.apply(this,arguments); };
  const c0=GAME.choose; GAME.choose=function(o){ push({k:'choose',n:'',t:(o||[]).filter(x=>x&&!x.hidden).map(x=>((x.t||x.text)||'')+(x.hint?'〔'+x.hint+'〕':'')).join('｜')}); return c0.apply(this,arguments); };
  if(GAME.caption){ const p0=GAME.caption; GAME.caption=function(n,t){ push({k:'cap',n:String(n||''),t:String(t==null?'':t)}); return p0.apply(this,arguments); }; }
  if(GAME.titleCard){ const t0=GAME.titleCard; GAME.titleCard=function(a,b){ push({k:'card',n:String(a||''),t:String(b||'')}); return t0.apply(this,arguments); }; }
  if(GAME.toast){ const o0=GAME.toast; GAME.toast=function(t){ push({k:'toast',n:'',t:String(t||'')}); return o0.apply(this,arguments); }; }
  if(GAME.enter){ const e0=GAME.enter; GAME.enter=function(z,sp){ push({k:'enter',n:sp?JSON.stringify(sp):'',t:String(z)}); return e0.apply(this,arguments); }; }
  if(typeof CLS!=='undefined'){
    if(CLS.attend){ const a0=CLS.attend; CLS.attend=async function(GM,it,o){ let m={}; try{ const G=GAME.G, Z=GAME.E.zone; m={key:it.key,cid:it.c&&it.c.id,name:it.c&&it.c.name,week:it.week,t0:it.t0,kind:(it.c&&it.c.kind)||null,door:!!(o&&o.door),exam:it.exam||null,
        zone:G.zone,room:(it.room&&it.room.name)||null,hasBoard:!!(Z&&Z.setBoard),board:(CLS.content?(CLS.content(it)||{}).board:null)||null}; }catch(e){ m={err:String(e.message)}; }
      push({k:'attend',n:(it&&it.key)||'',t:JSON.stringify(m)}); const r=await a0.apply(this,arguments);
      try{ const R=CLS.rec(GAME.G); push({k:'attended',n:it.key,t:JSON.stringify({ret:r,done:!!R.done[it.key],late:!!(R.late&&R.late[it.key]),abs:!!(R.abs&&R.abs[it.key])})}); }catch(e){} return r; }; }
    if(CLS.goClass){ const g0=CLS.goClass; CLS.goClass=async function(GM,it,o){ push({k:'go',n:(it&&it.key)||'',t:JSON.stringify(o||{})}); return g0.apply(this,arguments); }; }
    if(CLS.skipClass){ const k0=CLS.skipClass; CLS.skipClass=async function(GM,it){ push({k:'skip',n:(it&&it.key)||'',t:''}); return k0.apply(this,arguments); }; }
  }
  if(typeof EVENTS!=='undefined'&&EVENTS.run){ const v0=EVENTS.run; EVENTS.run=function(ev){ push({k:'ev',n:'',t:String((ev&&ev.id)||'')}); return v0.apply(this,arguments); }; }
  const te=document.getElementById('toast'); if(te){ let lt=''; new MutationObserver(()=>{ const h=(te.textContent||'').trim(); if(h&&h!==lt){ lt=h; push({k:'toast',n:'dom',t:h}); } }).observe(te,{childList:true,subtree:true,characterData:true}); }
  return 'ok'; })()"""


async def pl_len(pg):
    return await pg.evaluate("(window.__PL||[]).length")


async def rows(pg, n0=0, k=None):
    R = await pg.evaluate("n=>(window.__PL||[]).slice(n)", n0)
    return [r for r in R if k is None or r['k'] == k]


# ---------------------------------------------------------------- 頁面裡讀（只讀）
REMAIN = r"""(()=>{ try{ const G=GAME.G, R=CLS.rec(G); return CLS.goList(G).filter(it=>!R.done[it.key]&&!CLS.planSkip(G,it)).map(it=>({key:it.key,cid:it.c.id,name:it.c.name,t0:it.t0,st:CLS.status(G,it),room:(it.room||{}).name||null})); }catch(e){ return 'ERR '+e.message; } })()"""
DAYITEMS = r"""(d=>{ try{ return CLS.dayItems(GAME.G,d).map(it=>({key:it.key,cid:it.c.id,name:it.c.name,t0:it.t0,room:(it.room||{}).name||null,zone:(it.room||{}).zone||null,exam:it.exam||null})); }catch(e){ return 'ERR '+e.message; } })"""
REC = r"""(()=>{ try{ const R=CLS.rec(GAME.G); return {attend:R.attend||{},prep:R.prep||{},nDone:Object.keys(R.done||{}).length,late:Object.keys(R.late||{}).length,abs:Object.keys(R.abs||{}).length,
  notes:(GAME.G.notes||[]).map(n=>n.id+'｜'+n.title),study:(GAME.G.stats||{}).study,wf:GAME.walkFallbacks||0}; }catch(e){ return {err:String(e.message)}; } })()"""
# 「應該是多少」：只讀 STUDY（D118_PLAN 第 2 節二：STUDY.progress(G,course,kind)→{total,read,got}、STUDY.units、G.study.u）；修改前沒有 STUDY＝null
EXPECT = r"""(cids=>{ const G=GAME.G; if(typeof STUDY==='undefined'||!STUDY.progress) return null; const out={};
  const t=CALENDAR.termOf(G.day), term=t&&t.id; const rank={heard:1,read:2,got:3};
  for(const cid of cids){ const r={progress:{},units:null,raw:null};
    for(const k of ['final','mid',null]){ try{ r.progress[String(k)]=k===null?STUDY.progress(G,cid):STUDY.progress(G,cid,k); }catch(e){ r.progress[String(k)]='ERR '+e.message; } }
    try{ const c=CLS.byId?CLS.byId(cid):null, e=STUDY.courses?STUDY.courses(G).find(x=>x.c.id===cid):null; r.progress['final@'+(e?e.term:term)]=STUDY.progress(G,c||cid,'final',e?e.term:term); }catch(e){ r.progress['final@term']='ERR '+e.message; }   /* game3d.js renderLegal 用的就是這個（ST.progress(G,e.c,'final',e.term)）*/
    try{ if(STUDY.units){ const us=STUDY.units(G,cid,term,'final')||[]; const rec=STUDY.rec?STUDY.rec(G):G.study; const U=(rec&&rec.u)||{};
      const st=us.map(u=>{ const id=typeof u==='string'?u:u.id; const s=U[id]; return typeof s==='object'&&s?(s.s||s.state||null):s||null; });
      r.units={n:us.length,ids:us.slice(0,40).map(u=>typeof u==='string'?u:u.id),states:st.slice(0,40)};
      r.raw={total:us.length,heardUp:st.filter(s=>(rank[s]||0)>=1).length,readUp:st.filter(s=>(rank[s]||0)>=2).length,got:st.filter(s=>s==='got').length}; } }catch(e){ r.units='ERR '+e.message; }
    out[cid]=r; }
  out._miss=(G.study&&G.study.miss)||null; return out; })"""
LEGAL_DOM = r"""(()=>{ const b=document.getElementById('legalList')||document.querySelector('#phoneBody'); if(!b) return null; return [...b.querySelectorAll('.item')].map(e=>(e.innerText||'').replace(/\s+\n/g,'\n').trim()); })()"""


async def open_legal(pg, cdp, run, tag, shot=True):
    """玩家打開「法律」頁：手機有「法律」分頁就用手機，沒有就右上選單 →「法律」分頁；回傳 {via, items:[每一列的文字], text, shot}"""
    await L.close_panels(pg, cdp); await L.phone_away(pg, cdp, tries=1)
    via = None
    if await pg.evaluate("!!document.querySelector('#phoneTabs button[data-ptab=\"legal\"]')"):
        await P.phone_tab(pg, cdp, 'legal'); via = 'phone'
        items = await pg.evaluate("[...document.querySelectorAll('#phoneBody .item')].map(e=>(e.innerText||'').trim())")
        text = await pg.evaluate("(document.getElementById('phoneBody')||{}).innerText||''")
    else:
        await L.tap(pg, cdp, '#btnMenu'); await pg.wait_for_timeout(900)
        await L.tap(pg, cdp, '#menu .tabs button[data-tab="legal"]'); await pg.wait_for_timeout(900); via = 'menu'
        items = await pg.evaluate(LEGAL_DOM) or []
        text = await pg.evaluate("(document.getElementById('legalList')||{}).innerText||''")
    p = await run.shot(pg, tag + '_legal') if shot else None
    # 每一科的那一列捲到看得到再各截一張（列很多時第一張可能看不到民總）
    for cid, nm in COURSES_CHK:
        ok = await pg.evaluate("(nm=>{ const box=document.getElementById('legalList')||document.getElementById('phoneBody'); if(!box) return false; const e=[...box.querySelectorAll('.item')].find(x=>(x.innerText||'').indexOf(nm)>=0); if(!e) return false; e.scrollIntoView({block:'center'}); return true; })", nm)
        if ok and shot: await pg.wait_for_timeout(400); await run.shot(pg, '%s_legal_%s' % (tag, cid))
    await L.close_panels(pg, cdp)
    run.note('%s：「法律」頁（%s）%s' % (tag, via, J(items)[:1500]))
    return {'via': via, 'items': items, 'text': text, 'shot': p}


def parse_row(items, name):
    row = next((t for t in items if name in t), None)
    if row is None: return None, None
    m = RX.search(row)
    return row, ([int(m.group(1)), int(m.group(2)), int(m.group(3))] if m else None)


def match_expect(nums, ex):
    """畫面 [x,y,z] 和 STUDY.progress 的 {total,read,got} 一致的 kind（沒有＝None）"""
    if not nums or not isinstance(ex, dict): return None
    for k, v in (ex.get('progress') or {}).items():
        if isinstance(v, dict) and [v.get('read'), v.get('total'), v.get('got')] == nums: return k
    return None


# ---------------------------------------------------------------- 照玩家操作
DECL = ('晚一點', '不去了', '自己走過去', '先不', '不用了', '算了', '就這樣', '先這樣', '沒事', '「我晚上要念書。」', '「那天我有事。」', '「我也要念書。」', '「我週六有事。」')
GO_PREFIX = ('出發：', '直接過去：', '接起來：', '上線：')
PRIO = ('直接去上課：', '直接去下一堂：', CONT, '老位子', '坐中間的位子', '還是進去聽', '照樣跳過', '先自由活動')   # 先自由活動：下一堂還早（下課選單沒有「直接去下一堂」）＝之後用手機「今天」
BED = ('睡到明天早上', '睡到明天', '睡到傍晚', '睡覺')


def pick_opt(ch, picks=()):
    T = [o['t'] for o in ch]; live = [i for i, o in enumerate(ch) if not o['dim']] or list(range(len(ch)))
    for p in picks or ():
        for i in live:
            if T[i].startswith(p): return i, 'pick'
    if any(t.startswith('再撐一下') for t in T):   # 床的選單
        for p in BED:
            for i in live:
                if T[i].startswith(p): return i, 'bed'
    for i in live:
        if T[i].startswith('先起床'): return i, 'wake'
    for w in DECL:
        for i in live:
            if T[i].startswith(w): return i, 'decline'
    for i in live:
        if not T[i].startswith(GO_PREFIX) and '存檔' not in T[i]: return i, 'first'
    return live[0], 'first'


async def tap_sel_js(pg, cdp, js):
    c = await pg.evaluate("(()=>{ const e=(%s); if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2,(e.textContent||'').trim()]; })()" % js)
    if not c: return None
    await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(1000); return c[2]


async def quick_go(pg, cdp, zone):
    """手機「地點」→ 前往（aa375_probe.py 的 quick_go）"""
    await P.phone_tab(pg, cdp, 'places')
    got = await tap_sel_js(pg, cdp, "[...document.querySelectorAll('#phoneBody [data-place]')].find(b=>b.dataset.place.startsWith(%s))" % json.dumps(zone + '|'))
    if not got: await L.close_panels(pg, cdp); return False
    for _ in range(60):
        await pg.wait_for_timeout(1000)
        if (await pg.evaluate("GAME.G.zone")) == zone and not (await L.state(pg)).get('busy'): break
    await pg.wait_for_timeout(2000); return (await pg.evaluate("GAME.G.zone")) == zone


async def press_it(pg, cdp, run, js, label):
    """走到那個互動點（js 回傳 [x,z,lv]）、按互動鍵，直到出現選單或對話"""
    it = await pg.evaluate(js)
    if not it: return False
    await L.phone_away(pg, cdp, tries=1)
    await L.go_to(pg, cdp, run, it[0], it[1], 0.8, label, max_s=150, lv=it[2], stop=lambda s: s['dlg'] or s['choices'])
    for _ in range(4):
        await L.phone_away(pg, cdp, tries=1)
        s = await P.ts(pg)
        if s['ch'] or s['dlg']: return True
        await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1600)
        s = await P.ts(pg)
        if s['ch'] or s['dlg'] or s['busy']: return True
    return False


BED_JS = "(()=>{ const it=(GAME.E.interactables||[]).find(i=>i.sleep&&!i.hidden); return it?[it.x,it.z,it.lv|0]:null; })()"
DESK_JS = "(()=>{ const it=(GAME.E.interactables||[]).find(i=>i.deskStudy&&!i.hidden); return it?[it.x,it.z,it.lv|0]:null; })()"


async def play_days(pg, cdp, run, tag, end_day, split_day=None, max_s=None):
    """照玩家一天天過，直到 end_day 的課上完（或那天沒有課）而且空下來（不上床）。split_day：那天上完以後【前置】跳到下週一 07:00 宿舍。回傳 {ok, stuck, log}"""
    max_s = max_s or ENVI('DAY_MAX', 900) * max(1, end_day - (await P.clock(pg))['day'] + 1)
    t0 = time.time(); last = None; since = time.time(); out = {'ok': False, 'stuck': None, 'days': []}; split_done = split_day is None; day_seen = None
    while time.time() - t0 < max_s:
        c = await P.clock(pg); s = await P.ts(pg)
        if c['day'] != day_seen:
            day_seen = c['day']; items = await pg.evaluate(DAYITEMS, c['day'])
            out['days'].append({'clock': c, 'items': items}); run.note('%s：%s %s 今天的課 %s' % (tag, c['key'], hm(c['h']), J(items)))
        free = not s['dlg'] and not s['ch'] and not s['busy'] and s['depth'] == 0 and not s['phone'] and not s['running']
        sig = (c['day'], round(c['h'], 2), s['zone'], s['txt'][:30], tuple(o['t'] for o in s['ch']), s['busy'])
        if sig != last: last = sig; since = time.time()
        elif time.time() - since > ENVI('STUCK_S', 240):
            out['stuck'] = {'clock': c, 'ts': s}; await run.shot(pg, tag + '_stuck'); run.note('%s：%d 秒沒有變化 %s' % (tag, ENVI('STUCK_S', 240), J(s))); break
        if s['ch']:
            k, why = pick_opt(s['ch'], PRIO); T = [o['t'] for o in s['ch']]
            run.note('%s %s %s %s 選項 %s → %s（%s）' % (tag, c['key'], hm(s['h']), s['zone'], J([t[:28] for t in T]), T[k][:34], why))
            await P.tap_choice(pg, cdp, k); await pg.wait_for_timeout(1100); continue
        if s['phone'] and not s['dlg']: await L.phone_away(pg, cdp, tries=1); await pg.wait_for_timeout(500); continue
        if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(600); continue
        if not free: await pg.wait_for_timeout(900); continue
        rem = await pg.evaluate(REMAIN)
        if isinstance(rem, str): run.note('%s：goList 讀不到 %s' % (tag, rem)); rem = []
        if rem:
            await pg.wait_for_timeout(2500)   # 下課選單、起床選單要等 STORY.tick（低幀率時最多 45 秒）：先等一下，還沒出再用手機
            s2 = await P.ts(pg)
            if s2['ch'] or s2['dlg'] or s2['busy']: continue
            await P.phone_tab(pg, cdp, 'today'); sel = '#phoneBody [data-go="%s"]' % rem[0]['key']
            btn = await pg.evaluate("(s=>{ const e=document.querySelector(s); return e?(e.textContent||'').trim():null; })", sel)
            if btn:
                run.note('%s：%s %s 手機「今天」→「%s」%s %s' % (tag, c['key'], hm(c['h']), btn, rem[0]['name'], hm(rem[0]['t0'])))
                await L.tap(pg, cdp, sel); await pg.wait_for_timeout(1500); continue
            await L.close_panels(pg, cdp)
        # 今天沒有下一堂了
        if c['day'] >= end_day: out['ok'] = True; break
        if not split_done and c['day'] >= split_day:
            split_done = True; snap = await pg.evaluate("()=>GAME.snapshot()")
            wd = (await P.day_of(pg, c['key']))['wd']   # 0＝週日 … 6＝週六
            nd = c['day'] + ((8 - wd) % 7 or 7)
            snap.update(day=nd, weekday=1, hour=7.0, zone='dorm', pos=None)
            await load(pg, cdp, run, snap, '%s：SPLIT＝同一份進度（第 1 週最後一個上課日上完那一刻）跳到下週一 07:00 宿舍（略過週末）' % tag); continue
        if s['zone'] != 'dorm':
            ok = await quick_go(pg, cdp, 'dorm'); run.note('%s：%s %s 回宿舍（手機「地點」）%s' % (tag, c['key'], hm(c['h']), ok)); continue
        ok = await press_it(pg, cdp, run, BED_JS, '床')
        if not ok: run.note('%s：%s %s 床按不到' % (tag, c['key'], hm(c['h']))); await pg.wait_for_timeout(3000)
    out['end'] = await P.clock(pg)
    return out


async def study_once(pg, cdp, run, tag, cid):
    """宿舍書桌「讀書」→ 讀多久選第一個（沒變暗的）→ 選科 cid 那一門 → 點完。回傳 {ok, opts, rows}"""
    r = {'ok': False, 'opts': []}; n0 = await pl_len(pg)
    nm = await pg.evaluate("(id=>{ const c=(COURSES.list||[]).find(x=>x.id===id); return c?c.name:null; })", cid)
    if (await pg.evaluate("GAME.G.zone")) != 'dorm': await quick_go(pg, cdp, 'dorm')
    if not await press_it(pg, cdp, run, DESK_JS, '書桌'): run.note('%s：書桌按不到' % tag); return r
    t0 = time.time(); stage = 0
    while time.time() - t0 < 300:
        s = await P.ts(pg)
        if s['ch']:
            T = [o['t'] for o in s['ch']]; r['opts'].append(T); k = None
            if stage == 0 and any(t.startswith('讀書') for t in T): k = next(i for i, t in enumerate(T) if t.startswith('讀書')); stage = 1
            elif nm and any(t.startswith(nm) for t in T): k = next(i for i, t in enumerate(T) if t.startswith(nm)); stage = 3
            elif stage == 1: k = next((i for i, o in enumerate(s['ch']) if not o['dim'] and not o['t'].startswith('算了')), 0); stage = 2
            else: k, _ = pick_opt(s['ch'])
            run.note('%s 選項 %s → %s' % (tag, J(T), T[k])); await P.tap_choice(pg, cdp, k); await pg.wait_for_timeout(1200); continue
        if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(600); continue
        if s['busy'] or s['depth'] > 0 or s['phone']:
            if s['phone']: await L.phone_away(pg, cdp, tries=1)
            await pg.wait_for_timeout(800); continue
        if stage >= 3: r['ok'] = True; break
        await pg.wait_for_timeout(800)
        if time.time() - t0 > 30 and stage == 0: break
    R = await rows(pg, n0); r['rows'] = R
    r['caps'] = [x['t'] for x in R if x['k'] == 'cap']; r['said'] = [x['t'] for x in R if x['k'] == 'say']; r['toasts'] = [x['t'] for x in R if x['k'] == 'toast']
    run.note('%s：自習 %s（%s）ok=%s 台詞 %s 字幕 %s toast %s' % (tag, cid, nm, r['ok'], J(r['said'])[:600], J(r['caps']), J(r['toasts'])))
    return r


def class_boards(R):
    """從 HOOK 紀錄整理每一堂：attend meta、上課期間（attend 到 attended）的字幕／台詞／toast，黑板第一行有沒有出現在字幕"""
    out = []
    for i, r in enumerate(R):
        if r['k'] != 'attend': continue
        try: m = json.loads(r['t'])
        except Exception: m = {'raw': r['t']}
        j = next((x for x in range(i + 1, len(R)) if R[x]['k'] == 'attended' and R[x]['n'] == r['n']), len(R))
        seg = R[i + 1:j]
        caps = [x['t'] for x in seg if x['k'] == 'cap']; said = [x['t'] for x in seg if x['k'] == 'say']; toasts = [x['t'] for x in seg if x['k'] == 'toast']
        b0 = ((m.get('board') or [''])[0] or '').strip()
        capb = [x['t'] for x in seg if x['k'] == 'cap' and x.get('n') == '黑板']   # D118-B2（ba7983b6f classes3d.js:308）：GAME.caption('黑板', 三行.filter(Boolean).join('　'), 6000)
        want = '　'.join([t for t in (m.get('board') or []) if t])
        out.append({'key': r['n'], 'cid': m.get('cid'), 'name': m.get('name'), 'd': r.get('d'), 'zone': m.get('zone'), 'room': m.get('room'), 'hasBoard': m.get('hasBoard'),
                    'boardCaps': capb, 'boardWant': want, 'capExact': bool(want) and want in capb, 'capsN': [[x.get('n'), x['t']] for x in seg if x['k'] == 'cap'],
                    'door': m.get('door'), 'kind': m.get('kind'), 'board': m.get('board'), 'capBoard': bool(b0) and any(b0 in c for c in caps),
                    'sayBoard': bool(b0) and any(b0 in t for t in said), 'toastBoard': bool(b0) and any(b0 in t for t in toasts), 'caps': caps,
                    'done': j < len(R) and json.loads(R[j]['t']).get('done')})
    return out


async def legal_checks(run, tag, lg, ex, label):
    """①② 兩科的那一列有「讀過 x／y、答對過 z」、數字＝STUDY.progress"""
    res = {}
    for cid, nm in COURSES_CHK:
        row, nums = parse_row(lg['items'], nm)
        e = (ex or {}).get(cid) if isinstance(ex, dict) else None
        kind = match_expect(nums, e)
        res[cid] = {'row': row, 'nums': nums, 'expect': e, 'kind': kind}
        chk(run, '%s：「法律」頁（%s）%s 那一列有「讀過 x／y、答對過 z」%s' % (tag, lg['via'], nm, label), bool(nums), J({'row': row, 'nums': nums, 'shot': lg.get('shot')}))
        chk(run, '%s：%s 的數字＝頁面只讀算的 STUDY.progress（畫面 %s；應該 %s）' % (tag, nm, nums, 'N/A（沒有 STUDY）' if ex is None else J((e or {}).get('progress'))),
            kind is not None, J({'kind': kind, 'raw_from_G.study': (e or {}).get('raw'), 'units': (e or {}).get('units')}))
    return res


# ================================================================ 段落
async def seg_flow(p, run):
    seg = TR['segments'].setdefault('flow', {})
    b, ctx, pg, cdp, errs = await L.launch(p, landscape=True); pg.on('dialog', lambda dd: asyncio.ensure_future(dd.accept()))
    snap = None
    try:
        await pg.goto(URL); chk(run, 'flow：遊戲載入', await L.wait_loaded(pg))
        await pg.evaluate("localStorage.clear()"); await P.init(pg); await pg.evaluate(HOOK)
        term, w0, wd0 = START[0], int(START[1]), int(START[2])
        last_w = w0 + WEEKS - 1
        if MODE == 'full':
            run.note('flow：標題「從法律系開始」（#btnNewLaw）——沒有讀檔')
            await L.tap(pg, cdp, '#btnNewLaw'); await pg.wait_for_timeout(4000)
            end_day = (await P.day_of(pg, [term, last_w, 5]))['d']
            split_day = (await P.day_of(pg, [term, w0, 5]))['d'] if SPLIT else None
            fl = await play_days(pg, cdp, run, 'flow', end_day, split_day, max_s=ENVI('FULL_MAX', 14400))
        else:
            st, d = await state_at(pg, [term, w0, wd0], 7.0, 'dorm', newstart=not LEGACY)
            await load(pg, cdp, run, st, 'flow：最小存檔 %s（%s 第 %s 週）07:00 宿舍%s' % (d['key'], d['term'], d['week'], '（舊 9/17 開局旗標）' if LEGACY else '（補新開局旗標 LAW_START_DAY、MAIN_D1、CAMP_Y1）'))
            end_day = (await P.day_of(pg, [term, last_w, 5]))['d']
            split_day = (await P.day_of(pg, [term, w0, 5]))['d'] if SPLIT else None
            fl = await play_days(pg, cdp, run, 'flow', end_day, split_day)
        seg['days'] = fl.get('days'); seg['stuck'] = fl.get('stuck'); seg['end'] = fl.get('end')
        rc = await pg.evaluate(REC); seg['rec_after_classes'] = rc
        R = await rows(pg, 0); boards = class_boards(R); seg['classes'] = boards
        att = sum(v for v in (rc.get('attend') or {}).values()) if isinstance(rc.get('attend'), dict) else 0
        chk(run, 'flow：兩週照玩家上完課（出席 %d 堂、沒有卡住、到第 %d 週結束）' % (att, last_w), fl.get('ok') and not fl.get('stuck') and att > 0, J({'end': fl.get('end'), 'stuck': fl.get('stuck'), 'attend': rc.get('attend')}))
        run.note('flow：每一堂 %s' % J([[x['d'], x['name'], x['zone'], 'setBoard' if x['hasBoard'] else '沒有setBoard', x['capBoard'], (x['board'] or [''])[0]] for x in boards]))
        nob = [x for x in boards if (x['hasBoard'] is False or x['door']) and x['kind'] != 'service' and x['board']]   # ba7983b6f：門口上課也用字幕
        chk(run, 'flow：沒有 setBoard 的教室（%s）每一堂上課期間都有字幕含黑板第一行（%d／%d 堂）' % ('、'.join(sorted({x['room'] or '' for x in nob})), sum(1 for x in nob if x['capBoard']), len(nob)),
            bool(nob) and all(x['capBoard'] for x in nob), J([[x['d'], x['name'], (x['board'] or [''])[0], x['caps'], 'say有' if x['sayBoard'] else '', 'toast有' if x['toastBoard'] else ''] for x in nob]))
        # 自習前的「法律」頁（只記）
        lg0 = await open_legal(pg, cdp, run, 'flow_before_study', shot=True); ex0 = await pg.evaluate(EXPECT, [c for c, _ in COURSES_CHK])
        seg['legal_before'] = {'legal': lg0, 'expect': ex0}
        row0, nums0 = parse_row(lg0['items'], '民法總則')
        if NO_STUDY:   # 自習（SE-07）BB 自己測：預設不做；「法律」頁照兩週上完課的狀態判定
            run.note('flow：NO_STUDY=1（預設）——不做自習那一段（BB 自己測 SE-07）')
            lg = lg0; ex = ex0; seg['legal_after'] = {'legal': lg, 'expect': ex}
            await legal_checks(run, 'flow 橫向（兩週上完、沒有自習）', lg, ex, '')
            seg['wf'] = await pg.evaluate("GAME.walkFallbacks||0")
            chk(run, 'flow：GAME.walkFallbacks＝0（%s）' % seg['wf'], seg['wf'] == 0)
            snap = await pg.evaluate("()=>GAME.snapshot()")
            seg['pl'] = R + (await rows(pg, len(R))); seg['capdom'] = await P.captions(pg, 0)
            raise _Done()
        # 自習一次（宿舍書桌）
        sr = await study_once(pg, cdp, run, 'flow_study', STUDY_CID); seg['study'] = {k: v for k, v in sr.items() if k != 'rows'}
        rc2 = await pg.evaluate(REC); seg['rec_after_study'] = rc2
        chk(run, 'flow：自習一次（宿舍書桌「讀書」→ 選 %s；R.prep %s → %s）' % (STUDY_CID, (rc.get('prep') or {}).get(STUDY_CID), (rc2.get('prep') or {}).get(STUDY_CID)),
            sr.get('ok') and ((rc2.get('prep') or {}).get(STUDY_CID) or 0) > ((rc.get('prep') or {}).get(STUDY_CID) or 0), J({'opts': sr.get('opts'), 'said': sr.get('said')}))
        # 自習後的「法律」頁（主要判定，橫向）
        lg = await open_legal(pg, cdp, run, 'flow_landscape', shot=True); ex = await pg.evaluate(EXPECT, [c for c, _ in COURSES_CHK])
        seg['legal_after'] = {'legal': lg, 'expect': ex}
        res = await legal_checks(run, 'flow 橫向（自習後）', lg, ex, '')
        n1 = (res.get('civ_general') or {}).get('nums')
        chk(run, 'flow：自習民總後「讀過」增加（自習前 %s → 自習後 %s）' % (nums0, n1), bool(nums0) and bool(n1) and n1[0] > nums0[0], J({'before': row0, 'after': (res.get('civ_general') or {}).get('row')}))
        seg['wf'] = await pg.evaluate("GAME.walkFallbacks||0")
        chk(run, 'flow：GAME.walkFallbacks＝0（%s）' % seg['wf'], seg['wf'] == 0)
        snap = await pg.evaluate("()=>GAME.snapshot()")
        seg['pl'] = R + (await rows(pg, len(R))); seg['capdom'] = await P.captions(pg, 0)
    except _Done:
        pass
    except Exception as e:
        chk(run, 'flow：跑完（沒有探針例外）', False, repr(e)[:500]); traceback.print_exc()
        try: await run.shot(pg, 'flow_exception'); seg['pl'] = await rows(pg, 0)
        except Exception: pass
    chk(run, 'flow：沒有 JS 例外', not errs, J(errs[:5])); seg['errs'] = errs[:20]
    try: await asyncio.wait_for(b.close(), 30)
    except Exception: pass
    save_tr()
    if snap and ENVI('PORTRAIT', 1): await seg_portrait(p, run, snap)


async def seg_portrait(p, run, snap):
    seg = TR['segments'].setdefault('portrait', {})
    b, ctx, pg, cdp, errs = await L.launch(p, landscape=False); pg.on('dialog', lambda dd: asyncio.ensure_future(dd.accept()))
    try:
        await pg.goto(URL); chk(run, 'portrait：遊戲載入', await L.wait_loaded(pg))
        await pg.evaluate("localStorage.clear()"); await P.init(pg)
        await load(pg, cdp, run, snap, 'portrait：同一份進度（自習完那一刻的 GAME.snapshot()）在直向畫面（390×844）重新讀檔')
        lg = await open_legal(pg, cdp, run, 'portrait', shot=True); ex = await pg.evaluate(EXPECT, [c for c, _ in COURSES_CHK])
        seg['legal'] = lg; seg['expect'] = ex
        await legal_checks(run, 'portrait 直向', lg, ex, '')
    except Exception as e:
        chk(run, 'portrait：跑完（沒有探針例外）', False, repr(e)[:500]); traceback.print_exc()
    chk(run, 'portrait：沒有 JS 例外', not errs, J(errs[:5])); seg['errs'] = errs[:20]
    try: await asyncio.wait_for(b.close(), 30)
    except Exception: pass
    save_tr()


async def seg_wancai(p, run):
    """【前置】大二上第 2 週週二 12:30 宿舍 → 手機「直接去上課：民法物權」（萬才館多功能教室）→ 照玩家上完；記上課期間的字幕"""
    seg = TR['segments'].setdefault('wancai', {})
    b, ctx, pg, cdp, errs = await L.launch(p, landscape=True); pg.on('dialog', lambda dd: asyncio.ensure_future(dd.accept()))
    try:
        await pg.goto(URL); chk(run, 'wancai：遊戲載入', await L.wait_loaded(pg))
        await pg.evaluate("localStorage.clear()"); await P.init(pg); await pg.evaluate(HOOK)
        st, d = await state_at(pg, WC_KEY, 12.5, 'dorm', newstart=False)
        await load(pg, cdp, run, st, 'wancai：最小存檔 %s（%s 第 %s 週，週二）12:30 宿舍——大一上沒有萬才館多功能教室的課，改到大二上第一門 WMULTI 課（%s）' % (d['key'], d['term'], d['week'], WC_CID))
        items = await pg.evaluate(DAYITEMS, d['d']); it = next((x for x in items if isinstance(items, list) and x['cid'] == WC_CID), None)
        chk(run, 'wancai：%s 有 %s、教室是萬才館多功能教室（只讀 CLS.dayItems）' % (d['key'], WC_CID), bool(it) and it.get('zone') == 'wancai_multi', J(items))
        if it:
            n0 = await pl_len(pg); t0 = time.time(); shot_done = False
            await P.phone_tab(pg, cdp, 'today'); sel = '#phoneBody [data-go="%s"]' % it['key']
            btn = await pg.evaluate("(s=>{ const e=document.querySelector(s); return e?(e.textContent||'').trim():null; })", sel)
            await run.shot(pg, 'wancai_today')
            chk(run, 'wancai：手機「今天」有「直接去上課」（%s）' % btn, (btn or '').startswith('直接去上課'))
            if btn:
                await L.tap(pg, cdp, sel); await pg.wait_for_timeout(1200)
                while time.time() - t0 < ENVI('TRIP_MAX', 600):
                    R = await rows(pg, n0); fin = any(r['k'] == 'attended' and r['n'] == it['key'] for r in R)
                    s = await P.ts(pg)
                    free = not s['dlg'] and not s['ch'] and not s['busy'] and s['depth'] == 0 and not s['phone']
                    if fin and free: break
                    started = any(r['k'] == 'attend' and r['n'] == it['key'] for r in R)
                    if started and not shot_done:
                        await pg.wait_for_timeout(1500); await run.shot(pg, 'wancai_class_caption'); shot_done = True
                    if s['ch']:
                        k, why = pick_opt(s['ch'], PRIO); run.note('wancai 選項 %s → %s' % (J([o['t'][:28] for o in s['ch']]), s['ch'][k]['t'][:30]))
                        await P.tap_choice(pg, cdp, k); await pg.wait_for_timeout(1000); continue
                    if s['phone'] and not s['dlg']: await L.phone_away(pg, cdp, tries=1); continue
                    if s['dlg']:
                        if started: await run.shot(pg, 'wancai_dlg');
                        await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(700); continue
                    await pg.wait_for_timeout(900)
                R = await rows(pg, n0); boards = [x for x in class_boards(R) if x['key'] == it['key']]
                x = boards[0] if boards else {}
                seg['class'] = x; seg['pl'] = R; seg['capdom'] = await P.captions(pg, 0)
                chk(run, 'wancai：上完 %s（CLS.rec done）' % it['name'], bool(x.get('done')), J({k: x.get(k) for k in ('zone', 'room', 'hasBoard', 'board')}))
                chk(run, 'wancai：萬才館多功能教室這一區沒有 setBoard（前置成立；hasBoard=%s，zone=%s）' % (x.get('hasBoard'), x.get('zone')), x.get('hasBoard') is False and x.get('zone') == 'wancai_multi')
                chk(run, 'wancai：上課期間有一句字幕含黑板第一行「%s」' % ((x.get('board') or [''])[0]), bool(x.get('capBoard')),
                    J({'caps': x.get('caps'), 'say裡有': x.get('sayBoard'), 'toast裡有': x.get('toastBoard'), 'board': x.get('board')}))
                chk(run, 'wancai：黑板字幕（GAME.caption 標「黑板」）＝黑板三行「%s」' % x.get('boardWant'), bool(x.get('capExact')), J({'boardCaps': x.get('boardCaps'), 'capsN': x.get('capsN')}))
                nt = await pg.evaluate(NOTES_RO, 'ask_')
                run.note('wancai：這一堂的課堂提問筆記（只讀 G.notes，ask_ 開頭）%s' % J(nt))
        seg['wf'] = await pg.evaluate("GAME.walkFallbacks||0")
        chk(run, 'wancai：GAME.walkFallbacks＝0（%s）' % seg['wf'], seg['wf'] == 0)
    except Exception as e:
        chk(run, 'wancai：跑完（沒有探針例外）', False, repr(e)[:500]); traceback.print_exc()
        try: await run.shot(pg, 'wancai_exception')
        except Exception: pass
    chk(run, 'wancai：沒有 JS 例外', not errs, J(errs[:5])); seg['errs'] = errs[:20]
    try: await asyncio.wait_for(b.close(), 30)
    except Exception: pass
    save_tr()


NOTES_RO = r"""(pre=>{ try{ return (GAME.G.notes||[]).filter(n=>String(n.id).startsWith(pre)).map(n=>({id:n.id,title:n.title,body:n.body,day:n.day})); }catch(e){ return 'ERR '+e.message; } })"""
ASKQ = r"""(key=>{ try{ const G=GAME.G, it=CLS.dayItems(G).find(i=>i.key===key); if(!it) return null; const q=CLS.askOf?CLS.askOf(it):null; if(!q) return {none:true};
  const a=q.type==='tf'||!q.options?String(q.answer):'（'+q.answer+'）'+q.options[q.answer];
  return {qid:q.id,q:q.q,answer:q.answer,ansText:a,core:q.core||null,explanation:q.explanation||null,units:typeof STUDY!=='undefined'&&STUDY.unitsOfQ?STUDY.unitsOfQ(q.id).map(u=>u.id):null}; }catch(e){ return 'ERR '+e.message; } })"""
UNIT_ST = r"""(ids=>{ try{ if(typeof STUDY==='undefined') return null; const o={}; for(const id of ids||[]) o[id]=STUDY.status(GAME.G,id); o._miss=(GAME.G.study&&GAME.G.study.miss)||null; return o; }catch(e){ return 'ERR '+e.message; } })"""
CARDS_RO = r"""(cid=>{ try{ if(typeof STUDY==='undefined') return null; const G=GAME.G, e=STUDY.courses(G).find(x=>x.c.id===cid); if(!e) return {listed:false};
  return {listed:true,term:e.term,rows:STUDY.units(G,e.c,e.term,'final').map(u=>{ const label=STUDY.LABEL[STUDY.status(G,u)]||'還沒讀'; return {id:u.id,week:u.week,title:u.title,label,line:('· '+(u.week!=null?'第 '+u.week+' 週　':'')+u.title+'　'+label).replace(/\s+/g,' ').trim()}; }),progress:STUDY.progress(G,e.c,'final',e.term)}; }catch(e){ return 'ERR '+e.message; } })"""
CARDS_DOM = r"""(nm=>{ const box=document.getElementById('legalList'); if(!box) return null; const it=[...box.querySelectorAll('.item')].find(x=>{ const b=x.querySelector('b'); return b&&(b.textContent||'').trim()===nm; });
  if(!it) return null; const dt=it.querySelector('details'); if(!dt) return {head:(it.innerText||'').trim(),details:false};
  return {head:(it.innerText||'').split('\n').slice(0,2).join(' ').trim(),details:true,open:dt.open,summary:(dt.querySelector('summary')||{}).textContent||'',
    rows:[...dt.children].filter(e=>e.tagName==='DIV').map(e=>(e.innerText||'').replace(/\s+/g,' ').trim()).filter(t=>t.startsWith('·'))}; })"""


async def trip(pg, cdp, run, tag, it, n0, pick=None, shot_tag=None):
    """手機「今天」→「直接去上課」已經按了：照玩家上完那一堂（seg_wancai 的迴圈；pick(s) 回傳 index＝先決定）。回傳 {ok, stuck}"""
    t0 = time.time(); shot_done = False; last = None; since = time.time(); out = {'ok': False, 'stuck': None}
    while time.time() - t0 < ENVI('TRIP_MAX', 600):
        R = await rows(pg, n0); fin = any(r['k'] == 'attended' and r['n'] == it['key'] for r in R)
        s = await P.ts(pg)
        free = not s['dlg'] and not s['ch'] and not s['busy'] and s['depth'] == 0 and not s['phone']
        if fin and free: out['ok'] = True; break
        sig = (s['zone'], s['txt'][:40], tuple(o['t'] for o in s['ch']), s['busy'], round(s['h'], 2))
        if sig != last: last = sig; since = time.time()
        elif time.time() - since > ENVI('STUCK_S', 240): out['stuck'] = {'ts': s}; await run.shot(pg, tag + '_stuck'); break
        started = any(r['k'] == 'attend' and r['n'] == it['key'] for r in R)
        if started and not shot_done and shot_tag:
            await pg.wait_for_timeout(1500); await run.shot(pg, shot_tag); shot_done = True
        if s['ch']:
            k = pick(s) if pick else None; why = 'pick-fn'
            if k is None: k, why = pick_opt(s['ch'], PRIO)
            run.note('%s 選項 %s → %s（%s）' % (tag, J([o['t'][:28] for o in s['ch']]), s['ch'][k]['t'][:30], why))
            await P.tap_choice(pg, cdp, k); await pg.wait_for_timeout(1000); continue
        if s['phone'] and not s['dlg']: await L.phone_away(pg, cdp, tries=1); continue
        if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(700); continue
        await pg.wait_for_timeout(900)
    return out


async def go_class(pg, cdp, run, tag, key, hh, cid, newstart=True):
    """【前置】最小存檔 key hh 宿舍 → 手機「今天」那一堂「直接去上課」。回傳 (it, n0, d) 或 (None, …)"""
    st, d = await state_at(pg, key, hh, 'dorm', newstart=newstart)
    await load(pg, cdp, run, st, '%s：最小存檔 %s（%s 第 %s 週，%s）%s 宿舍%s' % (tag, d['key'], d['term'], d['week'], '日一二三四五六'[d['wd']], hm(hh), '（補新開局旗標）' if newstart else ''))
    items = await pg.evaluate(DAYITEMS, d['d']); it = next((x for x in items if isinstance(items, list) and x['cid'] == cid), None)
    chk(run, '%s：%s 有 %s（只讀 CLS.dayItems）' % (tag, d['key'], cid), bool(it), J(items))
    if not it: return None, 0, d
    n0 = await pl_len(pg)
    await P.phone_tab(pg, cdp, 'today'); sel = '#phoneBody [data-go="%s"]' % it['key']
    btn = await pg.evaluate("(s=>{ const e=document.querySelector(s); return e?(e.textContent||'').trim():null; })", sel)
    chk(run, '%s：手機「今天」%s 有「直接去上課」（%s）' % (tag, it['name'], btn), (btn or '').startswith('直接去上課'))
    if not btn: await L.close_panels(pg, cdp); return None, 0, d
    await L.tap(pg, cdp, sel); await pg.wait_for_timeout(1200)
    return it, n0, d


async def both_shots(pg, run, tag):
    a = await run.shot(pg, tag + '_land')
    await pg.set_viewport_size(PORT); await pg.wait_for_timeout(2000); b = await run.shot(pg, tag + '_port')
    await pg.set_viewport_size(LAND); await pg.wait_for_timeout(2000)
    return [a, b]


async def seg_y1_rooms(p, run):
    """大一上博思 101（國文）、普通 101（通識）、共同 102（英文）各一堂：【前置】讀到那天上課前 → 手機「直接去上課」→ 照玩家上完，逐堂記黑板字幕"""
    seg = TR['segments'].setdefault('y1_rooms', {'classes': []})
    b, ctx, pg, cdp, errs = await L.launch(p, landscape=True); pg.on('dialog', lambda dd: asyncio.ensure_future(dd.accept()))
    try:
        await pg.goto(URL); chk(run, 'y1_rooms：遊戲載入', await L.wait_loaded(pg))
        await pg.evaluate("localStorage.clear()"); await P.init(pg); await pg.evaluate(HOOK)
        for spec in Y1R_SPECS:
            kh, _, cid = spec.partition(':'); key, _, hh = kh.partition('@'); tag = 'y1_rooms_' + cid
            it, n0, d = await go_class(pg, cdp, run, tag, key, float(hh or 8.5), cid)
            if not it: continue
            tr = await trip(pg, cdp, run, tag, it, n0, shot_tag=tag + '_class')
            R = await rows(pg, n0); x = next((y for y in class_boards(R) if y['key'] == it['key']), {})
            x['trip'] = tr; seg['classes'].append(x)
            run.note('%s：%s %s 那一區 %s、door=%s；黑板三行 %s；黑板字幕 %s；全部字幕 %s' % (tag, x.get('d'), x.get('room'), 'setBoard' if x.get('hasBoard') else '沒有setBoard', x.get('door'), J(x.get('board')), J(x.get('boardCaps')), J(x.get('capsN'))))
            chk(run, '%s：上完 %s（%s）' % (tag, it['name'], it['room']), tr['ok'] and bool(x.get('done')), J(tr.get('stuck')))
            chk(run, '%s：那一區沒有 3D 黑板（前置成立；hasBoard=%s）' % (tag, x.get('hasBoard')), x.get('hasBoard') is False)
            chk(run, '%s：上課期間有黑板字幕（GAME.caption「黑板」）＝「%s」' % (tag, x.get('boardWant')), bool(x.get('capExact')), J({'boardCaps': x.get('boardCaps'), 'capsN': x.get('capsN')}))
        seg['wf'] = await pg.evaluate("GAME.walkFallbacks||0")
        chk(run, 'y1_rooms：GAME.walkFallbacks＝0（%s）' % seg['wf'], seg['wf'] == 0)
        seg['pl'] = await rows(pg, 0); seg['capdom'] = await P.captions(pg, 0)
    except Exception as e:
        chk(run, 'y1_rooms：跑完（沒有探針例外）', False, repr(e)[:500]); traceback.print_exc()
        try: await run.shot(pg, 'y1_rooms_exception')
        except Exception: pass
    chk(run, 'y1_rooms：沒有 JS 例外', not errs, J(errs[:5])); seg['errs'] = errs[:20]
    try: await asyncio.wait_for(b.close(), 30)
    except Exception: pass
    save_tr()


async def seg_ask_legal(p, run):
    """ask_note：【前置】大一上第 5 週週四 12:36 宿舍 → 民法總則（201，課堂提問 CIVS_01）照玩家上完、提問選答案 → ☰「筆記」看那一則（答案、考點）。
    legal_page（同一個瀏覽器接著做）：☰「法律」頁：每一科「期末範圍：讀過 x／y・答對過 z」＝只讀 STUDY.progress；點開民總、憲法的「觀念卡」清單＝只讀 STUDY.status；橫向、直向各截一張"""
    seg = TR['segments'].setdefault('ask_legal', {})
    b, ctx, pg, cdp, errs = await L.launch(p, landscape=True); pg.on('dialog', lambda dd: asyncio.ensure_future(dd.accept()))
    try:
        await pg.goto(URL); chk(run, 'ask：遊戲載入', await L.wait_loaded(pg))
        await pg.evaluate("localStorage.clear()"); await P.init(pg); await pg.evaluate(HOOK)
        kh, _, cid = ASK_SPEC.partition(':'); key, _, hh = kh.partition('@')
        st, d = await state_at(pg, key, float(hh or 12.6), 'dorm')
        await load(pg, cdp, run, st, 'ask：最小存檔 %s（%s 第 %s 週）%s 宿舍（補新開局旗標）' % (d['key'], d['term'], d['week'], hm(float(hh or 12.6))))
        items = await pg.evaluate(DAYITEMS, d['d']); it0 = next((x for x in items if isinstance(items, list) and x['cid'] == cid), None)
        aq = await pg.evaluate(ASKQ, it0['key']) if it0 else None
        seg['askq'] = aq; run.note('ask：那一堂的課堂提問（只讀 CLS.askOf）%s' % J(aq))
        chk(run, 'ask：前置成立：%s 那一堂有課堂提問' % cid, isinstance(aq, dict) and bool(aq.get('qid')), J(aq))
        st0 = await pg.evaluate(UNIT_ST, (aq or {}).get('units') or []) if isinstance(aq, dict) else None
        n0 = await pl_len(pg)
        await P.phone_tab(pg, cdp, 'today'); sel = '#phoneBody [data-go="%s"]' % (it0 or {}).get('key')
        btn = await pg.evaluate("(s=>{ const e=document.querySelector(s); return e?(e.textContent||'').trim():null; })", sel)
        chk(run, 'ask：手機「今天」有「直接去上課」（%s）' % btn, (btn or '').startswith('直接去上課'))
        tr = {'ok': False}
        if btn and it0:
            await L.tap(pg, cdp, sel); await pg.wait_for_timeout(1200)
            want = (aq or {}).get('ansText') if ASK_PICK == 'right' and isinstance(aq, dict) else None

            def pick(s):
                if not want: return None
                T = [o['t'] for o in s['ch']]
                return T.index(want) if want in T else None
            tr = await trip(pg, cdp, run, 'ask', it0, n0, pick=pick, shot_tag='ask_class')
        R = await rows(pg, n0); said = [x['t'] for x in R if x['k'] == 'say']; seg['said'] = said
        chk(run, 'ask：上完那一堂（課堂提問演了：「（下課前，教授在黑板角落寫了一題。）」）', tr.get('ok') and any('黑板角落寫了一題' in t for t in said), J(said[-8:]))
        st1 = await pg.evaluate(UNIT_ST, (aq or {}).get('units') or []) if isinstance(aq, dict) else None
        nro = await pg.evaluate(NOTES_RO, 'ask_'); seg['notes_ro'] = nro
        # 玩家看筆記：☰ →「筆記」
        await L.close_panels(pg, cdp); await L.tap(pg, cdp, '#btnMenu'); await pg.wait_for_timeout(900)
        await L.tap(pg, cdp, '#menu .tabs button[data-tab="notes"]'); await pg.wait_for_timeout(900)
        title = None; ndom = None
        if isinstance(aq, dict) and aq.get('qid'):
            title = await pg.evaluate("(cid=>{ const c=COURSES.list.find(x=>x.id===cid); return c?c.name:null; })", cid)
            title = '%s・第 %s 週課堂提問' % (title, d['week'])
            ndom = await pg.evaluate("(t=>{ const box=document.getElementById('notesList'); if(!box) return null; const e=[...box.querySelectorAll('.item')].find(x=>{ const b=x.querySelector('b'); return b&&(b.textContent||'').trim()===t; }); if(!e) return null; e.scrollIntoView({block:'center'}); return (e.innerText||'').replace(/\\s+\\n/g,'\\n').trim(); })", title)
        seg['notes_dom'] = ndom; seg['notes_shots'] = await both_shots(pg, run, 'ask_notes')
        await L.close_panels(pg, cdp)
        run.note('ask：☰「筆記」那一則 %s；只讀 G.notes %s；觀念卡 上課前 %s → 上完 %s' % (J(ndom), J(nro), J(st0), J(st1)))
        core = (aq or {}).get('core') if isinstance(aq, dict) else None
        chk(run, 'ask：☰「筆記」有「%s」、內容有題目、答案「%s」、考點「%s」（玩家畫面）' % (title, (aq or {}).get('ansText') if isinstance(aq, dict) else None, core),
            bool(ndom) and isinstance(aq, dict) and aq['q'] in ndom and ('答案：' + aq['ansText']) in ndom and (not core or ('考點：' + core) in ndom), J(ndom))
        if isinstance(aq, dict) and aq.get('units') is not None:
            exp_st = 'got' if ASK_PICK == 'right' else None
            chk(run, 'ask：只讀 STUDY：那一題的觀念卡 %s 上完以後＝%s（ASK_PICK=%s）' % (aq['units'], exp_st or '上過課以上', ASK_PICK),
                isinstance(st1, dict) and all((st1.get(u) == exp_st) if exp_st else st1.get(u) in ('heard', 'read', 'got') for u in aq['units']), J({'before': st0, 'after': st1}))
        if 'legal_page' in CASES:
            lg = await open_legal(pg, cdp, run, 'legal_land', shot=True); ex = await pg.evaluate(EXPECT, [c for c, _ in COURSES_CHK])
            seg['legal_land'] = {'legal': lg, 'expect': ex}
            await legal_checks(run, 'legal_page 橫向', lg, ex, '')
            seg['cards'] = {}
            for c2, nm in COURSES_CHK:
                await L.close_panels(pg, cdp); await L.tap(pg, cdp, '#btnMenu'); await pg.wait_for_timeout(900)
                await L.tap(pg, cdp, '#menu .tabs button[data-tab="legal"]'); await pg.wait_for_timeout(900)
                opened = await tap_sel_js(pg, cdp, "(()=>{ const box=document.getElementById('legalList'); const it=box&&[...box.querySelectorAll('.item')].find(x=>{ const b=x.querySelector('b'); return b&&(b.textContent||'').trim()===%s; }); return it?it.querySelector('details summary'):null; })()" % json.dumps(nm))
                await pg.wait_for_timeout(800)
                dom = await pg.evaluate(CARDS_DOM, nm); ro = await pg.evaluate(CARDS_RO, c2)
                shots = await both_shots(pg, run, 'legal_cards_' + c2)
                seg['cards'][c2] = {'tapped': opened, 'dom': dom, 'ro': ro, 'shots': shots}
                run.note('legal_page：%s 點「%s」→ 觀念卡 %s；只讀 %s' % (nm, opened, J(dom)[:900], J(ro)[:900]))
                rws = (dom or {}).get('rows') or []
                exp_rows = [r['line'] for r in ((ro or {}).get('rows') or [])] if isinstance(ro, dict) else []
                same = bool(rws) and rws == exp_rows
                chk(run, 'legal_page：%s 點開「觀念卡」看得到清單（%d 張；只讀 %d 張）、每張的狀態＝只讀 STUDY.status' % (nm, len(rws), len(exp_rows)), bool(dom and dom.get('details')) and same,
                    J({'dom': rws[:20], 'expect': exp_rows[:20]}))
            await L.close_panels(pg, cdp)
            await pg.set_viewport_size(PORT); await pg.wait_for_timeout(2000)
            lgp = await open_legal(pg, cdp, run, 'legal_port', shot=True); exp_ = await pg.evaluate(EXPECT, [c for c, _ in COURSES_CHK])
            seg['legal_port'] = {'legal': lgp, 'expect': exp_}
            await legal_checks(run, 'legal_page 直向', lgp, exp_, '')
            await pg.set_viewport_size(LAND); await pg.wait_for_timeout(1500)
        seg['wf'] = await pg.evaluate("GAME.walkFallbacks||0")
        chk(run, 'ask：GAME.walkFallbacks＝0（%s）' % seg['wf'], seg['wf'] == 0)
        seg['pl'] = await rows(pg, 0)
    except Exception as e:
        chk(run, 'ask：跑完（沒有探針例外）', False, repr(e)[:500]); traceback.print_exc()
        try: await run.shot(pg, 'ask_exception')
        except Exception: pass
    chk(run, 'ask：沒有 JS 例外', not errs, J(errs[:5])); seg['errs'] = errs[:20]
    try: await asyncio.wait_for(b.close(), 30)
    except Exception: pass
    save_tr()


async def _ask_legal_once(p, run):
    if TR.get('_ask_done'): return
    TR['_ask_done'] = 1; await seg_ask_legal(p, run)


RUNNERS = {'flow': seg_flow, 'wancai': seg_wancai, 'y1_rooms': seg_y1_rooms, 'ask_note': _ask_legal_once, 'legal_page': _ask_legal_once}


async def main():
    run = L.Run('d118b2_' + '+'.join(CASES), OUT); os.makedirs(OUT, exist_ok=True)
    if 'turbo' in URL: run.setup('【捷徑】URL 有 ?turbo（TESTING.md：真實玩家流程不用 turbo；這次結果不能叫真實流程）')
    print('==== D118-B2 探針 MODE %s（SHA %s）START %s WEEKS %d SPLIT %d LEGACY %d ====' % (MODE, TR['sha'], START, WEEKS, SPLIT, LEGACY), flush=True)
    print('CASES', ','.join(CASES), 'NO_STUDY', NO_STUDY, flush=True)
    async with async_playwright() as p:
        for c in CASES:
            if c not in RUNNERS: chk(run, 'CASE %s 認得' % c, False, ','.join(RUNNERS)); continue
            print('==== CASE %s ====' % c, flush=True)
            await RUNNERS[c](p, run)
    TR['fails'] = run.fails; save_tr()
    print('SHA', TR['sha'], 'CASES', ','.join(CASES), flush=True)
    sys.exit(run.finish())

if __name__ == '__main__':
    asyncio.run(main())
