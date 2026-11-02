"""CC（帳號 A）11-02：BUG-Y4S2-NOFINAL-1102（P0）的瀏覽器探針。Node 證據：cc_y4s2final_unit.js。
問題：大四下只有 15 週（src/data/calendar.js Y4S2 weeks:15；第 15 週＝期末週 5/28～6/1，6/2 畢業典禮），修改前 classes3d.js EXAM_WEEKS.final=[16]
  → 大四下考五題的課 examDay(final)=null → 第 15 週那一天 dayItems 把那一堂整個拿掉（考試週只留 examMain）＝手機「今天」看不到海商法；
  → CLS.failedIn 對考五題的課（海商法與海洋法 maritime，題庫 13 題）沒有期末紀錄＝缺考不及格 → 6/18 成績單（PG 步驟 fd_grades_y4s2 → CLS.showGrades 'Y4S2'）
    後 FD.check 記 FAIL_DELAY_COURSES、FAIL_DELAY（延畢）、已報名國考的 BAR_REG 改 false。
修改前＝4734c3d9e（BB_224）；修改後＝571dfdf80（2c8d47e7 期末週照日曆＋FD.migrate；571dfdf8 報名痕跡）：examDay 的期末週＝日曆的 exam==='final'（這學期最後一週）；
  FD.check 取消報名時記 FAIL_DELAY_BARCANCEL；讀檔時 FD.migrate（game3d.js migrate）把 FAIL_DELAY_COURSES 裡「考五題、沒有 Y4S2 期末紀錄（status 不是 done）」的拿掉
  （記 FD_RESCUE_NOFINAL），拿光＝刪 FAIL_DELAY、FAIL_DELAY_DAY；BARCANCEL 或「BAR_REG false＋報名痕跡 FD.regTrace」＝BAR_REG 改回 true、記 FD_RESCUE_BAR＝'restored'；
  痕跡＝①Y4_PATH bar ②5/10 以後去過國考讀書會（acts.att 的 act_bar_study@<天>，天≥2029-05-10）；沒痕跡且 BAR_REG===false＝記 FD_RESCUE_BAR_UNKNOWN、不動、不給重新報名。
不是 iPhone：Playwright 手機橫向模擬（SwiftShader，1～4 fps），URL 用 '<URL>/index.html?turbo'（一鍵上課是黑幕＋換區域；turbo 只縮短等待）。

CASES（逗號隔開，每個 case 開一個新的瀏覽器；預設 main,rescue_bar,rescue_nobar）。同一個 CASE 在修改前（4734c3d9e）跑＝「讀檔前」的畫面，在修改後（571dfdf80）跑＝讀檔後：
  main  【前置】最小存檔（cc_dl04b_probe 的 state_at：GAME.defaults＋過了開場的旗標、dating_kexin 拿掉）改到 2029-05-27（日）21:00 宿舍（第 15 週的前一晚）；
        法律系、台灣路線（沒有交換）；Y4_PATH＝bar、BAR_REG＝true（已報名 2029 國考；修改前延畢會把它改 false）；課表照預設（大四下：法律專題研究、法律實習、海商法與海洋法）。
        出席不用補：讀碼 failedIn 只對看出席的課（attCourse：general／elective 且不是考五題的課）看 ATT_PASS，大四下三門都不是（cc_y4s2final_unit.js：空存檔 failedIn 只有 maritime）。
        讀檔後手機「課表」（考試那一欄：第 15 週期末考日）直向＋橫向截圖；5/30 再截一次。
        之後照玩家一天天過（全程不改劇情狀態）：床「睡到明天早上」→ 起床選單「先起床」→ 手機「今天」（每天橫向截圖；5/30 週三＝海商法的那一天，直向＋橫向）
        → 有「直接去上課」就按（路上「繼續去上課」、位子「老位子」、遲到「還是進去聽」、下課選單「先自由活動」）；考試（「i／5　題目」）【捷徑】只讀那一題的正解再按
        （頁面裡用題目原文在 CLS.examPool 找到那一題，算 optList 的正解位置，按畫面上的那個按鈕；EXAM_RIGHT＝答對幾題，預設 5）
        → 沒課了：手機「地點」回宿舍 → 17:30 前床「睡到傍晚」→ 6/1 收拾房間（20:00）以前站著等 → 床「睡到明天」（或「睡一下（…叫醒你）」）
        → 6/2 典禮、拍照、午餐等劇情照玩家點過（選項：婉拒那一類／「不去了」，沒有就第一個不是「出發：」的）→ 畢業後篇站著不動＝跳到下一件事 → 6/18 09:00 成績單。
        成績單那一句（含「海商法與海洋法：」）、延畢旁白（有的話）直向＋橫向截圖。看到成績單、畫面空下來再等 POST_S 秒（預設 20）收尾。
  rescue_bar／rescue_nobar／rescue_study／rescue_bc【前置】照修改前 6/18 會產生的狀態組一份 2029-06-19（二）10:00 宿舍的存檔（一次讀進去，FD.migrate 就是在這次讀檔跑）：
        GRADUATED／GRAD_DONE／GRAD_EVENING none／PACKED_Y4、events ev_pack_y4・ev_grad_family・ev_grad_lunch・ev_grad_envelope、PG.done grad＋fd_grades_y4s2；
        報名狀態四種：rescue_bar＝Y4_PATH bar（5/10 自動報名）→ 6/18 被延畢取消（BAR_REG false，修改前沒有 BARCANCEL）；
          rescue_nobar＝沒有 Y4_PATH、5/10 報名問題答「不報名」（BAR_REG false、PG.done reg）、沒有去過國考讀書會；
          rescue_study（不在預設）＝沒有 Y4_PATH、BAR_REG false、acts.att act_bar_study@2029-05-19＝true（痕跡②）；
          rescue_bc（不在預設）＝同 rescue_bar 再加 FAIL_DELAY_BARCANCEL（修改後的 FD.check 才會寫）。
        FD.check 寫的：FAIL_DELAY_COURSES＝['maritime']、FAIL_DELAY＝true、FAIL_DELAY_DAY＝6/18、BAR_REG＝false（修改前沒有 FAIL_DELAY_BARCANCEL）；
        成績單已發 courses.grades.Y4S2＝修改前 reportFor 的字（法律專題研究：過了、法律實習或法律扶助實務：過了、海商法與海洋法：缺考（不及格））；
        沒有海商法期末紀錄（courses.exam 空）；6/18 22:00 阿哲兩則私訊（tag fd_zhe，FD.LINES.zhe 原文）。
        讀進來之後站著不動（畢業後篇）RESCUE_PLAY 秒（預設 240），劇情照玩家點過；截圖：讀檔後畫面、手機「今天」各直向＋橫向、最後一張。
記錄（只記不改）：HOOK＝GAME.say／choose（連 hint）／caption／titleCard／toast／ADV.begin／ADV.cg／GAME.enter／CLS.attend／CLS.goClass／EVENTS.run／PG.runStep
  → <輸出>/transcript_<case>.json（另外存新增的手機訊息、每天手機「今天」的文字、狀態快照）；
  狀態：F.FAIL_DELAY_COURSES、FAIL_DELAY、FAIL_DELAY_DAY、FAIL_DELAY_BARCANCEL、FD_RESCUE_*、BAR_REG、CLS.failedIn(G,'Y4S2')、R.exam 裡 Y4S2 final 的紀錄、
  CLS.examDay(maritime,'Y4S2','final')、CLS.examList、R.grades.Y4S2、PG.on／PG.delayed、FD.on。
check（客觀記錄，不判定企劃）：
  main：遊戲載入；前置成立（2029-05-27、Y4S2 第 14 週、termCourses 有 maritime、BAR_REG true、failedIn 只有考五題的課）；
        期末週 5/30 手機「今天」有「海商法與海洋法（考試）」（修改前預期 FAIL）；海商法有 Y4S2 期末紀錄 status done；
        6/18 成績單有出現、海商法那一行不是「缺考（不及格）」；沒有被判延畢（FAIL_DELAY_COURSES 空、沒有 FAIL_DELAY、沒有延畢旁白「（證書要等下學期。……）」）；
        BAR_REG 保留 true；沒有卡住；沒有 JS 例外。修改前 4734c3d9e 預期 FAIL。
  rescue_*：讀檔後 FAIL_DELAY_COURSES 空、FAIL_DELAY 沒了、FD_RESCUE_NOFINAL＝['maritime']、PG.delayed false、FD.on false；
        報名：bar／study／bc＝BAR_REG true、FD_RESCUE_BAR restored；nobar＝BAR_REG 仍 false、FD_RESCUE_BAR_UNKNOWN true、之後沒有「報名／不報名」的選單、手機沒有報名的回覆鍵；
        之後沒有延畢劇情（FD.LINES 的句子、late_2029 那一段、日期卡「延畢」）；沒有卡住；沒有 JS 例外。修改前（沒有 FD.migrate）預期 FAIL。
用法：LW_TESTS=<工作樹>/tests SHA=<sha> [CASES=main,rescue_bar,rescue_nobar] python3 cc_y4s2final_probe.py '<URL>/index.html?turbo' <輸出資料夾>
等待上限（秒）：CASE_MAX（main，預設 5400）、TRIP_MAX（一趟上課，預設 600）、STUCK_S（空著、畫面時間都沒變，預設 240）。"""
import os, sys, json, asyncio, re, time, copy, traceback
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__)))); import bbplay as P   # bbplay 在上一層（BB 的 test_tools）
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
J = lambda o: json.dumps(o, ensure_ascii=False)
ENVI = lambda k, d: int(os.environ.get(k, str(d)))
CASES = [c.strip() for c in os.environ.get('CASES', 'main,rescue_bar,rescue_nobar').split(',') if c.strip()]
EXAM_RIGHT = ENVI('EXAM_RIGHT', 5)
LAND = {'width': 844, 'height': 390}; PORT = {'width': 390, 'height': 844}
CONT = '繼續去上課'
EXAM_DAY = '2029-05-30'; GRADE_DAY = '2029-06-18'


def hm(h):
    if h is None: return '--:--'
    m = int(round(float(h) * 60)); return '%02d:%02d' % (m // 60, m % 60)


# ---------------------------------------------------------------- 存檔（cc_dl04b_probe／cc_car_probe 的 state_at，複製）
BASEF = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True, 'metAn': True, 'met_an': True, 'MET_ZHE': True,
         'zheNoodleDone': True, 'KX_FIRST_MSG': True, 'KX_EVE_MSG': True, 'FAM_GROUP_SENT': True, 'CEREMONY_Y1': True, 'KAI_MOVEIN': True, 'LAW_RECAP_SEEN': True,
         'fundsV2': 1, 'KX_DEC3_MIGRATED': True, 'dating_kexin': False}
ROOMS = (('ROOM_Y2', '2026-09-06'), ('ROOM_Y3', '2027-09-05'), ('ROOM_Y4', '2028-09-03'))
VISITED = ('noodle', 'cafe', 'library_hall', 'library', 'lawlib', 'wancai', 'linze', 'gongguan', 'wenzhou', 'soclib', 'cvs', 'bookstore')
Y4_DONE = ('ev_pack_y4', 'ev_grad_family', 'ev_grad_lunch', 'ev_grad_envelope')
ZHE = ['聽說了', '九月我還在總圖 B1 你來，我幫你占位子']   # FD.LINES.zhe（修改前後同）
FD_SAY = ('（證書要等下學期。九月，你要回學校重修。）', '（今年的國考，考不成了。明年再報。）', '延畢的同學，期末交一份報告就好。……課要來。')
FD_SAY_RE = re.compile(r'^（[^（）]+，不及格。）$|^（這學期，(只要重修|要重修兩門課)|的重修，出席不到三堂。）$|^（證書，要等到六月。）$')


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

# ---------------------------------------------------------------- 記錄（只記不改）
HOOK = r"""(()=>{ if(window.__PLH) return 'again'; window.__PLH=1; window.__PL=[];
  const at=()=>{ try{ return {d:CALENDAR.dateOf(GAME.G.day).key, h:+(+GAME.G.hour).toFixed(3), z:GAME.G.zone}; }catch(e){ return {}; } };
  const push=o=>{ try{ Object.assign(o,at()); window.__PL.push(o); }catch(e){} return o; };
  const bgs=b=>typeof b==='string'?b:JSON.stringify(b||null);
  const s0=GAME.say; GAME.say=function(w,t){ push({k:'say',n:(w&&w.name)||(typeof w==='string'?w:''),c:(w&&w.charId)||null,t:String(t==null?'':t)}); return s0.apply(this,arguments); };
  const c0=GAME.choose; GAME.choose=function(o){ push({k:'choose',n:'',t:(o||[]).filter(x=>x&&!x.hidden).map(x=>((x.t||x.text)||'')+(x.hint?'〔'+x.hint+'〕':'')).join('｜')}); return c0.apply(this,arguments); };
  if(typeof ADV!=='undefined'&&ADV.begin){ const b0=ADV.begin; ADV.begin=function(o){ push({k:'bg',n:'begin',t:bgs(o&&o.background)}); return b0.apply(this,arguments); }; }
  if(typeof ADV!=='undefined'&&ADV.cg){ const q0=ADV.cg; ADV.cg=function(id){ push({k:'cg',n:'',t:String(id||'')}); return q0.apply(this,arguments); }; }
  if(GAME.caption){ const p0=GAME.caption; GAME.caption=function(n,t){ push({k:'cap',n:String(n||''),t:String(t==null?'':t)}); return p0.apply(this,arguments); }; }
  if(GAME.titleCard){ const t0=GAME.titleCard; GAME.titleCard=function(a,b){ push({k:'card',n:String(a||''),t:String(b||'')}); return t0.apply(this,arguments); }; }
  if(GAME.toast){ const o0=GAME.toast; GAME.toast=function(t){ push({k:'toast',n:'',t:String(t||'')}); return o0.apply(this,arguments); }; }
  if(GAME.enter){ const e0=GAME.enter; GAME.enter=function(z,sp){ push({k:'enter',n:sp?JSON.stringify(sp):'',t:String(z)}); return e0.apply(this,arguments); }; }
  if(typeof CLS!=='undefined'){
    if(CLS.attend){ const a0=CLS.attend; CLS.attend=async function(GM,it,o){ push({k:'attend',n:(it&&it.key)||'',t:JSON.stringify({key:it&&it.key,exam:(it&&it.exam)||null,c:it&&it.c&&it.c.id})}); const r=await a0.apply(this,arguments);
      try{ const R=CLS.rec(GAME.G); push({k:'attended',n:it.key,t:JSON.stringify({ret:r,done:!!R.done[it.key]})}); }catch(e){} return r; }; }
    if(CLS.goClass){ const g0=CLS.goClass; CLS.goClass=async function(GM,it,o){ push({k:'go',n:(it&&it.key)||'',t:JSON.stringify(o||{})}); return g0.apply(this,arguments); }; }
  }
  if(typeof PG!=='undefined'&&PG.runStep){ const r0=PG.runStep; PG.runStep=async function(GM,s){ push({k:'step',n:'start',t:String(s&&s.id)}); const r=await r0.apply(this,arguments); push({k:'step',n:'end',t:String(s&&s.id)}); return r; }; }
  if(typeof EVENTS!=='undefined'&&EVENTS.run){ const v0=EVENTS.run; EVENTS.run=function(ev){ push({k:'ev',n:'',t:String((ev&&ev.id)||'')}); return v0.apply(this,arguments); }; }
  const te=document.getElementById('toast'); if(te){ let lt=''; new MutationObserver(()=>{ const h=(te.textContent||'').trim(); if(h&&h!==lt){ lt=h; push({k:'toast',n:'dom',t:h}); } }).observe(te,{childList:true,subtree:true,characterData:true}); }
  return 'ok'; })()"""


async def pl_len(pg):
    return await pg.evaluate("(window.__PL||[]).length")


async def rows(pg, n0=0, k=None):
    R = await pg.evaluate("n=>(window.__PL||[]).slice(n)", n0)
    return [r for r in R if k is None or r['k'] == k]


# ---------------------------------------------------------------- 頁面裡讀（只讀）
STATE = r"""(()=>{ const G=GAME.G, F=G.flags||{}, R=CLS.rec(G); const pick={};
  for(const k of Object.keys(F)) if(/^(FAIL_DELAY|FAIL_DELAY_COURSES|FAIL_DELAY_DAY|FAIL_DELAY_BARCANCEL|FAIL_DELAY_CERT|FD_RESCUE_NOFINAL|FD_RESCUE_BAR_UNKNOWN|FD_RESCUE_BAR|BAR_REG|BAR_REG_2030|Y4_PATH|GRADUATED|GRAD_DONE|GRAD_EVENING|PACKED_Y4|MOVED_OUT)$/.test(k)) pick[k]=F[k];
  const ex={}; for(const k in (R.exam||{})) if(/^Y4S2:.*:final$/.test(k)) ex[k]=R.exam[k];
  let failed=null, eday=null, elist=null, tc=null; try{ failed=CLS.failedIn(G,'Y4S2').map(c=>c.id); }catch(e){ failed='ERR '+e.message; }
  try{ const c=CLS.byId('maritime'); const d=c?CLS.examDay(G,c,'Y4S2','final'):null; eday=d?{key:CALENDAR.dateOf(d.day).key,block:d.block,makeup:!!d.makeup}:null; }catch(e){ eday='ERR '+e.message; }
  try{ elist=CLS.examList(G,'Y4S2').map(e=>[e.c.id,e.kind,CALENDAR.dateOf(e.day).key,e.block]); }catch(e){ elist='ERR '+e.message; }
  try{ tc=CLS.termCourses(G,'Y4S2').map(c=>c.id); }catch(e){}
  const t=CALENDAR.termOf(G.day); let pgOn=null, delayed=null, fdOn=null, pgDone=null; try{ pgOn=PG.on(G); delayed=PG.delayed(G); pgDone=Object.keys(PG.rec(G).done||{}); }catch(e){} let fd=null; try{ fdOn=FD.on(G); fd={courses:FD.courses(G),on:FD.on(G),certLate:FD.certLate?FD.certLate(G):null,lateLikely:FD.lateLikely?FD.lateLikely(G):null,hasMigrate:!!FD.migrate,hasRegTrace:!!FD.regTrace}; }catch(e){}
  return {clock:{key:CALENDAR.dateOf(G.day).key,day:G.day,h:+(+G.hour).toFixed(3),zone:G.zone,term:t&&t.id,week:t&&t.week,exam:t&&t.exam},flags:pick,failed,examFinal:ex,
    examDay:eday,examList:elist,termCourses:tc,grades:(R.grades||{}).Y4S2||null,pgOn,delayed,fdOn,fd,pgDone,acts:Object.keys((G.acts&&G.acts.att)||{}).filter(k=>/^act_bar_study@/.test(k)),nmsg:(G.msgs||[]).length,
    title:!document.getElementById('titleScreen').classList.contains('hide')}; })()"""
# 今天還能去的課（手機「今天」的「直接去上課」那一排；只讀）
GOLIST = r"""(()=>{ try{ const G=GAME.G, R=CLS.rec(G); return CLS.goList(G).filter(it=>!R.done[it.key]&&!(R.note&&R.note['plan_skip_'+it.key])).map(it=>({key:it.key,cid:it.c.id,name:it.c.name,t0:it.t0,exam:it.exam||null,examMain:!!it.examMain,status:CLS.status(G,it)})); }catch(e){ return []; } })()"""
DAYITEMS = r"""(()=>{ try{ const G=GAME.G; return CLS.dayItems(G).map(it=>({key:it.key,cid:it.c.id,t0:it.t0,exam:it.exam||null,examMain:!!it.examMain,status:CLS.status(G,it)})); }catch(e){ return 'ERR '+e.message; } })()"""
# 【捷徑】考卷的正解（只讀）：用畫面上那一題的原文在這門課的期末題庫（CLS.examPool）找到題目，照 classes3d.js 的 optList 算正解是第幾個選項
ANSWER = r"""(([qtext,cid,term,kind])=>{ try{ const p=CLS.examPool(cid,term,kind), all=p.cls.concat(p.bank,p.ai); const q=all.find(x=>String(x.q)===qtext); if(!q) return {err:'題庫找不到這一題',n:all.length};
  const opts=q.type==='tf'||!q.options?['對','錯'].map(t=>({t,v:t})):Object.keys(q.options).map(k=>({t:'（'+k+'）'+q.options[k],v:k}));
  return {id:q.id,answer:q.answer,right:opts.findIndex(o=>String(o.v)===String(q.answer)),opts:opts.map(o=>o.t)}; }catch(e){ return {err:String(e.message)}; } })"""
MSGS = "(n=>(GAME.G.msgs||[]).slice(n).map(m=>({th:m.th||null,from:m.from||null,tag:m.tag||null,day:m.day,h:m.h,text:String(m.text==null?'':m.text)})))"
ALLMSG = "(()=>(GAME.G.msgs||[]).map(m=>({th:m.th||null,from:m.from||null,tag:m.tag||null,day:m.day,h:m.h,text:String(m.text==null?'':m.text)})))()"
MUST = "(()=>{ try{ return !!(PHONE.mustOpen&&PHONE.mustOpen(GAME.G)); }catch(e){ return false; } })()"
BTN_TXT = "(s=>{ const e=document.querySelector(s); return e?(e.textContent||'').trim():null; })"
KEYDONE = "(k=>{ try{ return !!CLS.rec(GAME.G).done[k]; }catch(e){ return false; } })"

# ---------------------------------------------------------------- 照玩家操作
DECL = ('不去了', '晚一點', '自己走過去', '先不', '不用了', '算了', '就這樣', '先這樣', '沒事', '「我晚上要念書。」', '「那天我有事。」', '「我也要念書。」', '「我週六有事。」')
GO_PREFIX = ('出發：', '直接過去：', '接起來：', '上線：')
GO_PICKS = (CONT, '老位子', '坐中間的位子', '還是進去聽', '先自由活動')
Q_RE = re.compile(r'^([1-5])／5　(.*)$', re.S)


def pick_opt(ch, picks=()):
    """picks（開頭符合、或包含；照順序）→ 起床選單「先起床」→ 婉拒那一類 → 第一個不是「出發：」那一類的"""
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
        if not T[i].startswith(GO_PREFIX) and '存檔' not in T[i] and not T[i].startswith('直接去上課'): return i, 'first'
    return live[0], 'first'


async def shoot_both(pg, run, tag, want_txt=None):
    """對話停在那一句（等它打完字）→ 橫向一張 → 轉直向一張 → 轉回橫向"""
    if want_txt:
        for _ in range(14):
            s = await P.ts(pg)
            if s['txt'] == want_txt: break
            await pg.wait_for_timeout(500)
    await pg.wait_for_timeout(700)
    a = await run.shot(pg, tag + '_land')
    await pg.set_viewport_size(PORT); await pg.wait_for_timeout(2000)
    b = await run.shot(pg, tag + '_port')
    await pg.set_viewport_size(LAND); await pg.wait_for_timeout(2000)
    return [a, b]


async def phone_unblock(pg, cdp, run, tag):
    """手機關不掉（要回覆的訊息）：點第一個回覆鍵（沒有的話先點第一個對話）。印出來"""
    if not await pg.evaluate(MUST): return None
    if not await pg.evaluate("!!document.querySelector('#phoneBody [data-ask]')"):
        if await pg.evaluate("!!document.querySelector('#phoneBody [data-th]')"):
            await L.tap(pg, cdp, '#phoneBody [data-th]'); await pg.wait_for_timeout(800)
    asks = await pg.evaluate("[...document.querySelectorAll('#phoneBody [data-ask]')].map(b=>(b.textContent||'').trim())")
    if asks:
        await L.tap(pg, cdp, '#phoneBody [data-ask]'); await pg.wait_for_timeout(1200)
        run.note('%s：手機要回覆才關得掉 → 點第一個回覆鍵「%s」（全部 %s）' % (tag, asks[0], J(asks)))
    return asks


async def tap_sel_js(pg, cdp, js):
    c = await pg.evaluate("(()=>{ const e=(%s); if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2,(e.textContent||'').trim()]; })()" % js)
    if not c: return None
    await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(1000); return c[2]


async def quick_go(pg, cdp, run, zone):
    """手機「地點」→ 那一個地方（aa296_probe 的 quick_go）"""
    await P.phone_tab(pg, cdp, 'places')
    got = await tap_sel_js(pg, cdp, "[...document.querySelectorAll('#phoneBody [data-place]')].find(b=>b.dataset.place.startsWith(%s))" % json.dumps(zone + '|'))
    if not got: await L.phone_away(pg, cdp); run.note('手機「地點」沒有 %s' % zone); return False
    for _ in range(90):
        await pg.wait_for_timeout(1000)
        if (await pg.evaluate("GAME.G.zone")) == zone: break
    await pg.wait_for_timeout(2500); ok = (await pg.evaluate("GAME.G.zone")) == zone
    run.note('手機「地點」→ %s：%s' % (zone, ok)); return ok


async def bed(pg, cdp, run, prefixes, tag):
    """走到床邊按互動 → 床的選單照 prefixes 選（第一個符合的）。回傳 (選項, 選了哪個)"""
    it = await pg.evaluate("(()=>{ const it=(GAME.E.interactables||[]).find(i=>i.sleep&&!i.hidden); return it?[it.x,it.z,it.lv|0]:null; })()")
    if not it: run.note('%s：這一區找不到床' % tag); return [], None
    await L.phone_away(pg, cdp, tries=1)
    await L.go_to(pg, cdp, run, it[0], it[1], 0.8, '床', max_s=150, lv=it[2], stop=lambda s: s['dlg'] or s['choices'])
    ops = []
    for _ in range(4):
        s = await P.ts(pg)
        if s['ch']: break
        await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1600)
    for _ in range(10):
        s = await P.ts(pg)
        if s['ch']: ops = [o['t'] for o in s['ch']]; break
        await pg.wait_for_timeout(600)
    k = next((i for p in prefixes for i, o in enumerate(ops) if o.startswith(p)), None)
    run.note('%s：床的選單 %s → %s' % (tag, J(ops), ops[k] if k is not None else '（沒有符合的，不選）'))
    if k is not None: await P.tap_choice(pg, cdp, k); await pg.wait_for_timeout(2000)
    return ops, (ops[k] if k is not None else None)


class Driver:
    """一個 case 裡共用的「玩家」：對話點過去、選單照規則、考卷【捷徑】讀正解、手機收起來；記錄考試作答與截圖"""
    def __init__(self, pg, cdp, run, tag, n0):
        self.pg, self.cdp, self.run, self.tag, self.n0 = pg, cdp, run, tag, n0
        self.answered = {}; self.shots = {}; self.picks_log = []

    async def handle(self, s, picks=()):
        """處理畫面上的對話／選單／手機一步；回傳 True＝做了事"""
        pg, cdp, run = self.pg, self.cdp, self.run
        if s['ch']:
            T = [o['t'] for o in s['ch']]
            R = await rows(pg, max(self.n0, (await pl_len(pg)) - 12))
            lastsay = next((x for x in reversed(R) if x['k'] == 'say'), None)
            m = Q_RE.match(lastsay['t']) if lastsay else None
            if m and not any(t.startswith(CONT) for t in T):
                key = '%s|%s|%s' % (lastsay.get('d'), m.group(1), m.group(2)[:30])
                if key in self.answered: await pg.wait_for_timeout(600); return True
                cid = await pg.evaluate("(()=>{ const G=GAME.G; const it=CLS.dayItems(G).find(x=>x.exam&&x.examMain&&!CLS.rec(G).done[x.key]&&GAME.G.hour<x.t1+1); return it?[it.c.id,it.term,it.exam]:null; })()")
                a = await pg.evaluate(ANSWER, [m.group(2), cid[0], cid[1], cid[2]]) if cid else {'err': '找不到今天的考試'}
                i = int(m.group(1))
                if a.get('err') or a['right'] < 0 or a['right'] >= len(T):
                    run.check('%s：第 %d 題讀得到正解（【捷徑】只讀）' % (self.tag, i), False, J(a)); self.answered[key] = None
                    await P.tap_choice(pg, cdp, 0); await pg.wait_for_timeout(900); return True
                same = [t.strip() for t in T] == [t.strip() for t in a['opts']]
                if not same: run.check('%s：第 %d 題畫面的選項和題庫的選項一樣' % (self.tag, i), False, J({'screen': T, 'opts': a['opts']}))
                want = a['right'] if len([v for v in self.answered.values() if v]) < EXAM_RIGHT else (1 if a['right'] == 0 else 0)
                self.answered[key] = {'course': cid[0], 'i': i, 'id': a['id'], 'right': a['right'], 'picked': want, 'correct': want == a['right'], 'd': lastsay.get('d')}
                if i == 1: self.shots['exam_q1'] = await run.shot(pg, self.tag + '_exam_q1')
                run.note('%s：考卷第 %d 題（%s %s）【捷徑】讀正解第 %d 個 → 按第 %d 個' % (self.tag, i, cid[0], a['id'], a['right'] + 1, want + 1))
                await P.tap_choice(pg, cdp, want); await pg.wait_for_timeout(900); return True
            k, why = pick_opt(s['ch'], tuple(picks) + GO_PICKS)
            c = await P.clock(pg)
            run.note('%s %s %s %s 選項 %s → %s（%s）' % (self.tag, c['key'], hm(c['h']), c['zone'], J([t[:28] for t in T]), T[k][:30], why))
            self.picks_log.append([c['key'], hm(c['h']), T, T[k]])
            await P.tap_choice(pg, cdp, k); await pg.wait_for_timeout(1000); return True
        if s['phone'] and not s['dlg']:
            await L.phone_away(pg, cdp, tries=2); await pg.wait_for_timeout(500)
            if await pg.evaluate("!!(GAME.phoneIsOpen&&GAME.phoneIsOpen())"): await phone_unblock(pg, cdp, run, self.tag)
            return True
        if s['dlg']:
            R = await rows(pg, max(self.n0, (await pl_len(pg)) - 8))
            full = next((x['t'] for x in reversed(R) if x['k'] == 'say'), '')
            if full and full.find('海商法與海洋法：') >= 0 and 'grades' not in self.shots:
                self.shots['grades'] = await shoot_both(pg, run, self.tag + '_grades', full)
            elif full and (full in FD_SAY or FD_SAY_RE.match(full)) and ('fd:' + full) not in self.shots:
                self.shots['fd:' + full] = await shoot_both(pg, run, self.tag + '_fdline%d' % len([k for k in self.shots if k.startswith('fd:')]), full)
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(550); return True
        return False


async def today(pg, cdp, run, drv, tag, both=False):
    """手機「今天」：文字、截圖（both＝直向＋橫向）、同時讀 dayItems（只讀）"""
    txt = await P.phone_tab(pg, cdp, 'today'); await pg.wait_for_timeout(600)
    items = await pg.evaluate(DAYITEMS); gos = await pg.evaluate("[...document.querySelectorAll('#phoneBody [data-go]')].map(b=>[b.dataset.go,(b.textContent||'').trim()])")
    if both:
        a = await run.shot(pg, tag + '_today_land')
        await pg.set_viewport_size(PORT); await pg.wait_for_timeout(2000)
        txt_p = await pg.evaluate("(document.getElementById('phoneBody')||{}).innerText||''")
        b = await run.shot(pg, tag + '_today_port')
        await pg.set_viewport_size(LAND); await pg.wait_for_timeout(2000); shots = [a, b]
    else:
        shots = [await run.shot(pg, tag + '_today')]; txt_p = None
    await L.close_panels(pg, cdp)
    run.note('%s：手機「今天」%s；dayItems %s；按鈕 %s' % (tag, J(txt[:500]), J(items), J(gos)))
    return {'text': txt, 'text_port': txt_p, 'items': items, 'go': gos, 'shots': shots}


async def week(pg, cdp, run, tag):
    """手機「課表」（考試那一欄：這學期考五題的課的期中、期末考日）直向＋橫向截圖、文字"""
    txt = await P.phone_tab(pg, cdp, 'week'); await pg.wait_for_timeout(600)
    exam = await pg.evaluate("(()=>{ const b=[...document.querySelectorAll('#phoneBody .item')].find(e=>/^考試/.test((e.innerText||'').trim())); if(b) b.scrollIntoView({block:'center'}); return b?b.innerText:null; })()")
    await pg.wait_for_timeout(500); a = await run.shot(pg, tag + '_week_land')
    await pg.set_viewport_size(PORT); await pg.wait_for_timeout(2000)
    await pg.evaluate("(()=>{ const b=[...document.querySelectorAll('#phoneBody .item')].find(e=>/^考試/.test((e.innerText||'').trim())); if(b) b.scrollIntoView({block:'center'}); })()")
    await pg.wait_for_timeout(500); b = await run.shot(pg, tag + '_week_port')
    await pg.set_viewport_size(LAND); await pg.wait_for_timeout(2000); await L.close_panels(pg, cdp)
    run.note('%s：手機「課表」考試欄 %s' % (tag, J(exam)))
    return {'text': txt, 'exam': exam, 'shots': [a, b]}


async def trip(pg, cdp, run, drv, tag, key):
    """手機「今天」→ 那一堂的「直接去上課」→ 照玩家點到那一堂上完（CLS.attend 跑完、畫面空下來）"""
    out = {'key': key, 'ok': False, 'stuck': False}
    await P.phone_tab(pg, cdp, 'today'); sel = '#phoneBody [data-go="%s"]' % key
    out['btn'] = await pg.evaluate(BTN_TXT, sel)
    if not out['btn']: await L.close_panels(pg, cdp); run.note('%s：手機「今天」沒有 %s 的按鈕' % (tag, key)); return out
    n0 = await pl_len(pg); await L.tap(pg, cdp, sel); await pg.wait_for_timeout(1200)
    t0 = time.time(); last = None; since = time.time(); day0 = (await P.clock(pg))['day']
    while time.time() - t0 < ENVI('TRIP_MAX', 600):
        attended = any(r['n'] == key for r in await rows(pg, n0, 'attended'))
        s = await P.ts(pg)
        free = not s['dlg'] and not s['ch'] and not s['busy'] and s['depth'] == 0 and not s['phone']
        if attended and free: out['ok'] = True; break
        if s['day'] != day0 and not attended: out['jumped'] = await P.clock(pg); break
        sig = (s['day'], s['zone'], s['txt'][:40], tuple(o['t'] for o in s['ch']), s['busy'], s['depth'] > 0, s['h'])
        if sig != last: last = sig; since = time.time()
        elif free and time.time() - since > ENVI('STUCK_S', 240):
            out['stuck'] = await P.clock(pg); drv.shots['stuck_' + tag] = await run.shot(pg, tag + '_stuck'); break
        if await drv.handle(s): continue
        await pg.wait_for_timeout(900)
    out['done'] = await pg.evaluate(KEYDONE, key); out['end'] = await P.clock(pg)
    R = await rows(pg, n0); out['enters'] = [[r['t'], r.get('h')] for r in R if r['k'] == 'enter']
    run.note('%s：%s 結束 %s；上完 %s；換區域 %s' % (tag, key, J(out['end']), out['done'], J(out['enters'])))
    return out


# ---------------------------------------------------------------- main
async def case_main(pg, cdp, run):
    tag = 'main'
    flags = {'Y4_PATH': 'bar', 'BAR_REG': True}
    st, d = await state_at(pg, '2029-05-27', 21.0, 'dorm', flags)
    await L.load_state(pg, st, quiet_events=False, quiet_phone=False); await pg.evaluate(CLEARP); await pg.wait_for_timeout(3500)
    await L.phone_away(pg, cdp, tries=2)
    run.setup('[前置] %s：最小存檔改到 %s 21:00 宿舍（法律系、台灣路線、Y4_PATH bar、BAR_REG true；出席不用補：大四下沒有看出席的課）' % (tag, d['key']))
    s0 = await pg.evaluate(STATE)
    run.check('%s：前置成立（%s Y4S2 第 %s 週、termCourses 有 maritime、BAR_REG true、failedIn 只有考五題的課）' % (tag, s0['clock']['key'], s0['clock']['week']),
              s0['clock']['term'] == 'Y4S2' and s0['clock']['week'] == 14 and 'maritime' in (s0['termCourses'] or []) and s0['flags'].get('BAR_REG') is True
              and isinstance(s0['failed'], list) and set(s0['failed']) <= {'maritime'}, J(s0))
    run.note('%s：讀檔後 examDay(maritime, Y4S2, final)＝%s；examList %s' % (tag, J(s0['examDay']), J(s0['examList'])))
    wk = {'load': await week(pg, cdp, run, tag + '_0527')}
    n0 = await pl_len(pg); nmsg0 = s0['nmsg']; drv = Driver(pg, cdp, run, tag, n0)
    days = {}; trips = []; snaps = {}; stuck = None; woke = {}
    gd = await pg.evaluate("STORY.dayOfKey('2029-06-02')"); pack = await pg.evaluate("STORY.dayOfKey('2029-06-01')")
    grades_seen_at = None
    t0 = time.time(); last = None; since = time.time(); lastday = s0['clock']['day']; wake_wait = 0
    while time.time() - t0 < ENVI('CASE_MAX', 5400):
        s = await P.ts(pg); g = await pg.evaluate(STATE); F = g['flags']; c = g['clock']
        if c['day'] != lastday: lastday = c['day']; wake_wait = time.time() + 15; run.note('%s：換日 %s %s' % (tag, c['key'], hm(c['h'])))
        free = not s['dlg'] and not s['ch'] and not s['busy'] and s['depth'] == 0 and not s['phone']
        if g['grades'] is not None and grades_seen_at is None: grades_seen_at = time.time(); snaps['grades'] = g
        if grades_seen_at and free and time.time() - grades_seen_at > ENVI('POST_S', 20): break
        sig = (c['key'], c['h'], s['zone'], s['txt'][:40], tuple(o['t'] for o in s['ch']), s['busy'], s['depth'] > 0, s['phone'], g['nmsg'])
        if sig != last: last = sig; since = time.time()
        elif time.time() - since > ENVI('STUCK_S', 240):
            stuck = {'clock': c, 'ts': {k: s[k] for k in ('dlg', 'txt', 'busy', 'depth', 'phone', 'zone')}, 'ch': s['ch']}
            drv.shots['stuck'] = await run.shot(pg, tag + '_stuck'); break
        if await drv.handle(s): continue
        if not free: await pg.wait_for_timeout(900); continue
        # ---- 畫面空著：照玩家決定做什麼
        if g['pgOn'] or c['day'] >= gd:   # 畢業典禮那天、畢業後篇：站著不動（劇情照時間演、畢業後篇站 2 秒＝跳到下一件事）
            await pg.wait_for_timeout(1500); continue
        if time.time() < wake_wait: await pg.wait_for_timeout(1000); continue   # 剛醒：等起床選單（空下來約 4 秒才出）
        if c['key'] not in days:
            days[c['key']] = await today(pg, cdp, run, drv, '%s_%s' % (tag, c['key'].replace('-', '')), both=(c['key'] == EXAM_DAY))
            if c['key'] == EXAM_DAY: wk['exam_day'] = await week(pg, cdp, run, '%s_%s' % (tag, c['key'].replace('-', '')))
            continue
        gl = await pg.evaluate(GOLIST)
        gl = [x for x in gl if x['key'] not in [t['key'] for t in trips]]
        if gl:
            trips.append(await trip(pg, cdp, run, drv, '%s_%s_%s' % (tag, c['key'].replace('-', ''), gl[0]['cid']), gl[0]['key']))
            if c['key'] == EXAM_DAY: days[c['key'] + '_after'] = await today(pg, cdp, run, drv, '%s_%s_after' % (tag, c['key'].replace('-', '')))
            continue
        if c['zone'] != 'dorm':
            if not await quick_go(pg, cdp, run, 'dorm'): await pg.wait_for_timeout(3000)
            continue
        if c['day'] == pack and not F.get('PACKED_Y4') and c['h'] < 20.5:   # 6/1：20:00 收拾房間以前站著等
            await pg.wait_for_timeout(2000); continue
        if c['h'] < 17.5:
            await bed(pg, cdp, run, ('睡到傍晚',), '%s %s %s' % (tag, c['key'], hm(c['h']))); continue
        await bed(pg, cdp, run, ('睡到明天', '睡一下（'), '%s %s %s' % (tag, c['key'], hm(c['h'])))
        continue
    # ---------------- 收尾、記錄
    g = await pg.evaluate(STATE); F = g['flags']
    R = await rows(pg, n0); msgs = await pg.evaluate(MSGS, nmsg0)
    said = [x for x in R if x['k'] == 'say']
    gl = [x for x in said if x.get('d') == GRADE_DAY and '海商法與海洋法：' in x['t']]
    mline = None
    if gl:
        seg = [p for p in gl[0]['t'].split('　') if p.startswith('海商法與海洋法：')]; mline = seg[0] if seg else gl[0]['t']
    fdl = [[x.get('d'), hm(x.get('h')), x['t']] for x in said if x['t'] in FD_SAY or FD_SAY_RE.match(x['t'])]
    with open(os.path.join(OUT, 'transcript_%s.json' % tag), 'w', encoding='utf-8') as f:
        json.dump({'case': tag, 'sha': os.environ.get('SHA', '?'), 'rows': R, 'msgs': msgs, 'today': days, 'trips': trips, 'answered': drv.answered, 'picks': drv.picks_log, 'week': wk,
                   'start': s0, 'end': g, 'snaps': snaps, 'stuck': stuck, 'shots': drv.shots}, f, ensure_ascii=False, indent=1)
    td = days.get(EXAM_DAY) or {}
    run.check('%s：期末週 %s 手機「今天」有「海商法與海洋法（考試）」' % (tag, EXAM_DAY), '海商法與海洋法（考試）' in (td.get('text') or ''), J((td.get('text') or '（那天沒看到手機）')[:400]))
    ex = (g['examFinal'] or {}).get('Y4S2:maritime:final')
    run.check('%s：手機「課表」考試欄有海商法與海洋法的期末考（5/30）' % tag, '海商法與海洋法' in (wk['load'].get('exam') or ''), J(wk['load'].get('exam')))
    run.note('%s：FD 狀態（結束時）%s' % (tag, J(g['fd'])))
    run.check('%s：海商法有大四下期末紀錄（status done）' % tag, bool(ex) and ex.get('status') == 'done', J(g['examFinal']))
    run.note('%s：考卷作答 %s' % (tag, J(drv.answered)))
    run.check('%s：6/18 成績單有出現（「大四下的成績出來了。」＋課名那一行）' % tag, bool(gl), J([[x.get('d'), x['t']] for x in said if '成績' in x['t']][-4:]))
    run.note('%s：成績單原文 %s' % (tag, J([[x.get('d'), hm(x.get('h')), x['t']] for x in said if x.get('d') == GRADE_DAY][:12])))
    run.check('%s：成績單海商法那一行不是「缺考（不及格）」' % tag, bool(mline) and '缺考' not in mline and '不及格' not in mline, J({'line': mline, 'grades': g['grades']}))
    run.check('%s：沒有被判延畢（FAIL_DELAY_COURSES 空、沒有 FAIL_DELAY、沒有延畢旁白）' % tag,
              F.get('FAIL_DELAY_COURSES') == [] and not F.get('FAIL_DELAY') and not fdl, J({'flags': F, 'failedIn': g['failed'], 'fdLines': fdl}))
    run.check('%s：BAR_REG 保留 true（延畢沒有取消國考報名）' % tag, F.get('BAR_REG') is True, J(F))
    run.note('%s：結束時 failedIn(Y4S2)＝%s；examDay＝%s；PG.on %s、PG.delayed %s、FD.on %s；新訊息 %s' % (tag, J(g['failed']), J(g['examDay']), g['pgOn'], g['delayed'], g['fdOn'],
                                                                                       J([[m['tag'], m['from'], m['text']] for m in msgs if m['tag'] in ('fd_zhe',) or m['from'] == 'zhe'][:6])))
    run.check('%s：沒有卡住' % tag, stuck is None, J(stuck))
    run.check('%s：跑到 6/18 成績單（沒有逾時）' % tag, g['grades'] is not None, J(g['clock']))
    for t in trips:
        if not t['ok']: run.note('%s：上課沒有跑完 %s' % (tag, J(t)))
    run.note('%s：截圖 %s' % (tag, J(drv.shots)))


async def case_rescue(pg, cdp, run, variant):
    tag = 'rescue_' + variant; bc = variant == 'bc'; want_bar = variant in ('bar', 'study', 'bc')
    gd = await pg.evaluate("PG.gradDay()"); d618 = (await P.day_of(pg, GRADE_DAY))['d']; dpack = (await P.day_of(pg, '2029-06-01'))['d']
    flags = {'BAR_REG': False, 'GRADUATED': gd, 'GRAD_DONE': True, 'GRAD_EVENING': 'none', 'GRAD_ENVELOPE': 'later', 'PACKED_Y4': dpack,
             'FAIL_DELAY_COURSES': ['maritime'], 'FAIL_DELAY': True, 'FAIL_DELAY_DAY': d618, 'PG': {'done': {'grad': 1, 'fd_grades_y4s2': 1}}}
    if variant in ('bar', 'bc'): flags['Y4_PATH'] = 'bar'
    else: flags['PG']['done']['reg'] = 1   # 5/10 的報名問題演過、答「不報名」（BAR_REG false）
    if bc: flags['FAIL_DELAY_BARCANCEL'] = True
    st, d = await state_at(pg, '2029-06-19', 10.0, 'dorm', flags, done={e: 1 for e in Y4_DONE})
    st['courses'] = {'done': {}, 'attend': {}, 'prep': {}, 'electives': {}, 'note': {}, 'disc': {}, 'ask': {}, 'late': {}, 'abs': {}, 'exam': {},
                     'grades': {'Y4S2': {'legal_research': '過了', 'legal_practice': '過了', 'maritime': '缺考（不及格）'}}}
    st['msgs'] = [{'day': d618, 'h': 22.0 + i * 0.01, 'who': 'zhe', 'text': t, 'iv': None, 'th': 'p:zhe', 'from': 'zhe', 'tag': 'fd_zhe'} for i, t in enumerate(ZHE)]
    if variant == 'study':
        ds = (await P.day_of(pg, '2029-05-19'))['d']; st['acts'] = {'att': {'act_bar_study@%d' % ds: True}}   # 5/10 以後去過國考讀書會（FD.regTrace 讀 acts.att）
    before = {k: st['flags'].get(k) for k in ('FAIL_DELAY_COURSES', 'FAIL_DELAY', 'FAIL_DELAY_DAY', 'FAIL_DELAY_BARCANCEL', 'BAR_REG', 'Y4_PATH')}
    if variant == 'study': before['acts'] = st['acts']
    await L.load_state(pg, st, quiet_events=False, quiet_phone=False); await pg.evaluate(CLEARP)
    g1 = await pg.evaluate(STATE)   # 讀檔那一刻（FD.migrate 是讀檔時跑的；之後畫面還沒動）
    run.setup('[前置] %s：照修改前 6/18 會產生的狀態組 %s 10:00 宿舍的存檔（%s；成績單已發、海商法缺考（不及格）、沒有期末紀錄、阿哲 6/18 22:00 兩則）一次讀進去' % (tag, d['key'], J(before)))
    await pg.wait_for_timeout(3000)
    n0 = await pl_len(pg); drv = Driver(pg, cdp, run, tag, n0); nmsg0 = g1['nmsg']
    F = g1['flags']
    run.note('%s：讀檔後 %s' % (tag, J(g1)))
    run.check('%s：讀檔後延畢取消（FAIL_DELAY_COURSES 空、沒有 FAIL_DELAY、FD_RESCUE_NOFINAL＝[maritime]）' % tag,
              F.get('FAIL_DELAY_COURSES') == [] and not F.get('FAIL_DELAY') and F.get('FD_RESCUE_NOFINAL') == ['maritime'], J(F))
    run.check('%s：PG.delayed false、FD.on false' % tag, g1['delayed'] is False and g1['fdOn'] is False, J({'delayed': g1['delayed'], 'fdOn': g1['fdOn']}))
    bars = J({k: F.get(k) for k in ('BAR_REG', 'FAIL_DELAY_BARCANCEL', 'FD_RESCUE_BAR', 'FD_RESCUE_BAR_UNKNOWN', 'Y4_PATH')}) + '；FD %s' % J(g1['fd'])
    if want_bar: run.check('%s：有報名痕跡＝恢復報名（BAR_REG true、FD_RESCUE_BAR restored）' % tag, F.get('BAR_REG') is True and F.get('FD_RESCUE_BAR') == 'restored', bars)
    else: run.check('%s：沒有痕跡＝照舊不報（BAR_REG false、FD_RESCUE_BAR_UNKNOWN true）' % tag, F.get('BAR_REG') is False and F.get('FD_RESCUE_BAR_UNKNOWN') is True, bars)
    run.note('%s：成績單紀錄（讀檔後 R.grades.Y4S2，migrate 不改）＝%s；failedIn＝%s' % (tag, J(g1['grades']), J(g1['failed'])))
    await L.phone_away(pg, cdp, tries=2)
    drv.shots['after_load'] = await shoot_both(pg, run, tag + '_after_load')
    td = await today(pg, cdp, run, drv, tag + '_0619', both=True)
    # 站著不動（畢業後篇＝跳到下一件事），劇情照玩家點過
    t0 = time.time(); last = None; since = time.time(); stuck = None
    while time.time() - t0 < ENVI('RESCUE_PLAY', 240):
        s = await P.ts(pg); g = await pg.evaluate(STATE); c = g['clock']
        sig = (c['key'], c['h'], s['zone'], s['txt'][:40], tuple(o['t'] for o in s['ch']), s['busy'], s['depth'] > 0, s['phone'])
        if sig != last: last = sig; since = time.time()
        elif time.time() - since > ENVI('STUCK_S', 240):
            stuck = {'clock': c, 'ts': {k: s[k] for k in ('dlg', 'txt', 'busy', 'depth', 'phone', 'zone')}}; drv.shots['stuck'] = await run.shot(pg, tag + '_stuck'); break
        if await drv.handle(s): continue
        await pg.wait_for_timeout(1500)
    g = await pg.evaluate(STATE); F2 = g['flags']
    drv.shots['end'] = await run.shot(pg, tag + '_end')
    R = await rows(pg, n0); msgs = await pg.evaluate(MSGS, nmsg0)
    said = [x for x in R if x['k'] == 'say']
    fdl = [[x.get('d'), hm(x.get('h')), x['t']] for x in said if x['t'] in FD_SAY or FD_SAY_RE.match(x['t'])]
    late = [x for x in R if x['k'] == 'step' and x['t'] in ('late_2029', 'fd_late_note', 'fd_late_cert')]
    cards = [[x.get('d'), x['n'], x['t']] for x in R if x['k'] == 'card']
    with open(os.path.join(OUT, 'transcript_%s.json' % tag), 'w', encoding='utf-8') as f:
        json.dump({'case': tag, 'sha': os.environ.get('SHA', '?'), 'save_flags_before': before, 'after_load': g1, 'end': g, 'rows': R, 'msgs': msgs, 'allmsgs': await pg.evaluate(ALLMSG),
                   'today': td, 'stuck': stuck, 'shots': drv.shots}, f, ensure_ascii=False, indent=1)
    run.check('%s：之後沒有延畢劇情（FD 的句子、late_2029／fd_late_* 步驟、日期卡寫延畢）' % tag,
              not fdl and not late and not any('延畢' in (a or '') + (b or '') for _, a, b in cards), J({'fd': fdl, 'steps': [x['t'] for x in late], 'cards': cards[-6:]}))
    regopts = [x['t'] for x in R if x['k'] == 'choose' and ('報名' in x['t'])]
    asks = await pg.evaluate("[...document.querySelectorAll('#phoneBody [data-ask]')].map(b=>(b.textContent||'').trim()).filter(t=>t.indexOf('報名')>=0)")
    regmsg = [[m['tag'], m['text']] for m in msgs if '報名' in m['text']]
    if not want_bar: run.check('%s：畫面上沒有重新報名的選項（選單、手機回覆鍵）' % tag, not regopts and not asks, J({'choose': regopts, 'asks': asks, 'msgs': regmsg}))
    run.note('%s：結束時報名狀態 %s；新訊息裡提到報名的 %s' % (tag, J({k: F2.get(k) for k in ('BAR_REG', 'FD_RESCUE_BAR', 'FD_RESCUE_BAR_UNKNOWN')}), J(regmsg)))
    run.check('%s：結束時仍沒有延畢（FAIL_DELAY_COURSES 空、沒有 FAIL_DELAY）' % tag, F2.get('FAIL_DELAY_COURSES') == [] and not F2.get('FAIL_DELAY'), J(F2))
    run.note('%s：跑到 %s；場景 %s；日期卡 %s' % (tag, J(g['clock']), J([x['t'] for x in R if x['k'] == 'step' and x['n'] == 'end']), J(cards)[:1200]))
    run.check('%s：沒有卡住' % tag, stuck is None, J(stuck))
    run.note('%s：截圖 %s' % (tag, J(drv.shots)))


CASEFN = {'main': case_main}
for _v in ('bar', 'nobar', 'study', 'bc'): CASEFN['rescue_' + _v] = (lambda v: (lambda pg, cdp, run: case_rescue(pg, cdp, run, v)))(_v)


async def main():
    run = L.Run('y4s2final_' + '+'.join(CASES), OUT); os.makedirs(OUT, exist_ok=True)
    async with async_playwright() as p:
        for cs in CASES:
            fn = CASEFN.get(cs)
            if not fn: run.check('CASE %s 認得' % cs, False, '可以用：' + ','.join(CASEFN)); continue
            print('==== CASE %s（SHA %s）====' % (cs, os.environ.get('SHA', '?')), flush=True)
            b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
            pg.on('dialog', lambda dd: asyncio.ensure_future(dd.accept()))
            try:
                await pg.goto(URL); ok = await L.wait_loaded(pg); run.check('%s：遊戲載入' % cs, ok)
                await pg.evaluate("localStorage.clear()"); await P.init(pg); await pg.evaluate(HOOK)
                await fn(pg, cdp, run)
            except Exception as e:
                run.check('%s：跑完（沒有探針例外）' % cs, False, repr(e)[:500]); traceback.print_exc()
                try: await run.shot(pg, cs + '_exception')
                except Exception: pass
            run.check('%s：沒有 JS 例外' % cs, not errs, J(errs[:3]))
            try: await asyncio.wait_for(b.close(), 30)
            except Exception: pass
    print('SHA', os.environ.get('SHA', '?'), 'CASES', ','.join(CASES), flush=True)
    sys.exit(run.finish())

if __name__ == '__main__':
    asyncio.run(main())
