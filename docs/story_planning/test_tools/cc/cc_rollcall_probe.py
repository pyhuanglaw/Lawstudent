"""CC（帳號 A）11-02：ATTEND-ROLLCALL-1102（4734c3d9e；BB_224 第二節表格 #3）——隨機點名日。照玩家在畫面上看、按、截圖。
程式（讀碼）：src/classes3d.js
  S.rollWeeks(G,c,termId)：看出席的課（S.attCourse）每學期 4 個點名週，從 ROLL_WEEKS＝第 2～7、10～15 週裡、這門課這學期真的有上的週抽；
    種子＝flags.examSeed＋'|roll|'＋學期＋'|'＋課程 id（FNV-1a hash＋Fisher-Yates）；抽好存進 G.courses.roll[學期:課程]。
  S.attend（一鍵上課坐下那一刻）：不是遲到超過 15 分鐘、而且這一週是點名週、這一堂沒講過（R.rollSaid）→ 旁白「（老師今天點名。）」
  S.rollStat(G,c,term,upToDay)：點名週裡「已經過了」的＝週次 ≤ 今天的週次（注意：不看今天、這一堂上完沒）；到＝R.done 有那一堂、R.abs 沒有。
  S.weekHTML（手機「課表」）：看出席的課寫「<課名> 點過 n 次名（缺 m 次）」（m＝0 不寫括號）。
  S.attPass：點名缺 3 次以上不及格；R.rollSince（S.rec 第一次看到存檔那天；新遊戲＝開局那天、舊存檔＝第一次讀到 4734c 以後那天）以前就開始的學期，出席 ≥3（舊規則）照樣及格。
  src/honor3d.js S.phone（每次 STORY.tick 都跑）：第 12 週、週一 08:00 以後（週日不跑）、點名已經缺 ≥2 次的課一門一則系統訊息
    「【出席】<課名>：這學期點過 n 次名，你缺了 m 次。」（PHONE.at，tag att_warn_<學期>，一學期一次；沒有任何一門 ≥2 就不記 tag、之後每次 tick 再算）。
  單元測試 tests/attend_rollcall_unit.js（修改前 82f8d28c5＝4734c3d9e^：a、b、c、e FAIL）。
不是 iPhone：Playwright 手機橫向模擬 844×390（SwiftShader 1～4 fps）；直向截圖＝同一頁把畫面改成 390×844（玩家把手機轉直，#rotate 出現就點掉），截完轉回橫向。
URL 建議不加 ?turbo（docs/TESTING.md 真實流程）；一鍵上課本身是黑幕＋換區域，加 turbo 只縮短淡入淡出與坐下的走路，探針兩種都能跑。
存檔：「最小存檔」（GAME.defaults＋過了開場的法律系旗標，同 cc_dl04b_probe 的 state_at）＋flags.examSeed＝ROLL_SEED（預設 777）——印 [前置]。
  讀檔後在頁面裡用遊戲 API 組 G.courses（R.done／R.attend：那幾週「有去／沒去」，同 tests/attend_rollcall_unit.js 的 go()）＝【前置】組 R 紀錄，組完 GAME.snapshot() 再讀一次。
  點名週的預測＝【捷徑：只讀】：在頁面裡對 GAME.G 的深拷貝算（探針自己帶一份和 S.rollWeeks 一樣的算法 ROLLW，4734c 以前的版本也能算；4734c 以後另外和 CLS.rollWeeks（也是對拷貝算）對照）。
  選哪一門（頁面裡、照預測自動挑，印出來）：clean＝點名週沒有第 12 週、第 12 週以前至少 2 個點名週的課（seed 777：大一英文（上）[4,6,10,11]）；
    edge＝點名週有第 12 週、而且那堂課不是週一的課（seed 777：大一國文（上）[4,10,12,13]，週二早上）。
CASES（逗號隔開；預設 a,a0,b,c1,c2,d_old,d_new；另有邊界 bedge、cw）：
  a      點名當天：[前置] clean 那門第一個 ≥ 第 5 週的點名週那一堂的當天、開始前 36 分鐘、宿舍；之前的課全部有去（R 組好、第一堂的老師規定 attRule 記過）→
         手機「今天」→「直接去上課」→ 照玩家點對話、坐位子 → 上完。PASS：「（老師今天點名。）」出現剛好一次、在開始上課（CLS.attend）以後；旁白那一刻截圖；
         上完以後手機「課表」那一門寫「點過 k 次名」（k＝第 ≤ 這週的點名週數，沒有「缺」）。修改前（4734c^）：沒有旁白、課表是舊的「出席 n／3 堂」→ FAIL。
  a0     對照：同一門、下一個「不是點名週」的那一堂 → 沒有「（老師今天點名。）」。修改前後都 PASS。
  b      課表：[前置] 第 B_WEEK（預設 11）週週六 10:00 宿舍；clean 缺它第一個點名週、另一門（有 ≥2 個 ≤B_WEEK 點名週的）缺它第二個點名週，其他全到 →
         手機「課表」→ 每一門看出席的課那一段＝「<課名> 點過 n 次名（缺 m 次）」和只讀預測一致（n＝≤B_WEEK 的點名週數、m＝缺的）；橫向、直向各一張。修改前 FAIL（舊格式）。
  bedge  邊界（讀碼預測 4734c 以後 FAIL）：[前置] edge 那門的第 12 週點名那一週的週一 08:30（那一堂還沒上）、之前全到、缺它第一個點名週 →
         規格「還沒到的點名日看不到」＝那一門應該是「點過 (第 12 週以前的點名數) 次名（缺 1 次）」；S.rollStat 用「週次 ≤ 這週」＝把還沒上的那一堂算成「點過、缺」→ 多一次。
  c1／c2 第 12 週提醒：[前置] 第 12 週週一 07:56 宿舍；之前全到，只有 clean 缺 1 次（c1）／缺 2 次（c2）→ 站著等到 08:05 以後 → 手機「訊息」→ 系統。
         PASS：c1 沒有任何「【出席】」；c2 剛好一則「【出席】<clean>：這學期點過 n 次名，你缺了 2 次。」（n＝第 ≤12 週的點名數）。截圖直向橫向。
         修改前（4734c^）：舊規則是出席 <3 才提醒，兩份都出席很多次＝c2 沒有提醒 → c2 FAIL、c1 PASS。
  cw     邊界（讀碼預測 4734c 以後 FAIL）：同 c1，但缺 1 次的是 edge 那門（第 12 週那一堂在週二）→ 規格：缺 1 次＝不提醒；
         S.phone 在週一 08:00 用 rollStat(…,今天)＝第 12 週那一堂還沒上就算缺＝「點過 3 次名，你缺了 2 次。」會出現。
  d_old  舊存檔：[前置] 存檔沒有 rollSince（改版前存的）、clean 那門這學期只去了 3 堂不是點名的課（點名 4 次全缺）、其他全到；成績公布日（CALENDAR.gradeDay）前一晚 23:20 宿舍 →
         走到床「睡到明天早上」→ 起床發成績單（CLS.morning → showGrades）。PASS：rollSince＝讀檔那天（＞學期開始）、成績單那一行「<clean>：及格」、只讀 CLS.failedIn 不含它。修改前後都 PASS。
  d_new  對照：同上，但 rollSince 在學期開始以前（新規則的存檔）→「<clean>：不及格（下學期重修）」。修改前（沒有點名規則）是「及格」→ FAIL。
用法：LW_TESTS=<工作樹>/tests SHA=<sha> [CASES=a,b,...] [ROLL_SEED=777] [ROLL_TERM=Y1S1] [B_WEEK=11] python3 cc_rollcall_probe.py '<URL>/index.html' <輸出資料夾>
等待上限（秒）：TRIP_MAX（一趟上課，預設 900）、STUCK_S（空著沒變化多久算卡住，預設 180）、WAIT8（等到 08:05，預設 900）、NIGHT_MAX（睡覺到發成績單，預設 900）。"""
import os, sys, json, asyncio, re, time, copy, traceback
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__)))); import bbplay as P   # bbplay 在上一層（BB 的 test_tools）
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
J = lambda o: json.dumps(o, ensure_ascii=False)
ENVI = lambda k, d: int(os.environ.get(k, str(d)))
CASES = [c.strip() for c in os.environ.get('CASES', 'a,a0,b,c1,c2,d_old,d_new').split(',') if c.strip()]
SEED = ENVI('ROLL_SEED', 777)
TERM = os.environ.get('ROLL_TERM', 'Y1S1')
B_WEEK = ENVI('B_WEEK', 11)
NARR = '（老師今天點名。）'
CONT = '繼續去上課'


def hm(h):
    if h is None: return '--:--'
    m = int(round(float(h) * 60)); return '%02d:%02d' % (m // 60, m % 60)


# ---------------------------------------------------------------- 存檔（cc_dl04b_probe.py 的 state_at／load）
BASEF = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True, 'metAn': True, 'met_an': True, 'MET_ZHE': True,
         'zheNoodleDone': True, 'KX_FIRST_MSG': True, 'KX_EVE_MSG': True, 'FAM_GROUP_SENT': True, 'CEREMONY_Y1': True, 'KAI_MOVEIN': True, 'LAW_RECAP_SEEN': True,
         'fundsV2': 1, 'KX_DEC3_MIGRATED': True, 'dating_kexin': False}
ROOMS = (('ROOM_Y2', '2026-09-06'), ('ROOM_Y3', '2027-09-05'), ('ROOM_Y4', '2028-09-03'))
VISITED = ('noodle', 'cafe', 'library_hall', 'library', 'lawlib', 'wancai', 'linze', 'gongguan', 'wenzhou', 'soclib', 'cvs', 'bookstore')
JSENV = """(()=>{ const G=GAME.G, F=G.flags;
  const NOKX=()=>{ F.dating_kexin=false; if(F.romance) delete F.romance.kexin; F.ROMANCE_HISTORY=(F.ROMANCE_HISTORY||[]).filter(r=>r&&r.id!=='kexin'); delete F.DATED_1_kexin; delete F.KX_TOUR_YES; };
  __BODY__ })()"""
CLEARP = "(()=>{ if(typeof CLS!=='undefined'&&CLS.clearPending){ CLS.clearPending(); return true; } return false; })()"


async def state_at(pg, key, h, zone, flags=None, courses=None):
    d = await P.day_of(pg, key)
    st = {'name': '祐廷', 'energy': 100, 'events': {'done': {}, 'last': {}, 'count': 0}, 'contacts': {}}
    F = st['flags'] = dict(BASEF); F['examSeed'] = SEED
    for k, kk in ROOMS:
        dd = (await P.day_of(pg, kk))['d']
        if dd <= d['d']: F[k] = dd
    F.update(flags or {})
    st.update(day=d['d'], weekday=d['wd'], hour=h, zone=zone, pos=None, weather='clear', stage='law', money=30000)
    st['visited'] = {z: True for z in VISITED}
    if courses is not None: st['courses'] = courses
    return st, d


async def load(pg, cdp, run, st, label, js=None, arg=None):
    """[前置] 讀檔（GAME.applySave）＋清掉還沒出的選單；js＝讀檔後在頁面裡組的前置（R 紀錄），組完 GAME.snapshot() 再讀一次"""
    await L.load_state(pg, st, quiet_events=False, quiet_phone=False); await pg.evaluate(CLEARP)
    await pg.wait_for_timeout(3500); r = None
    if js:
        body = JSENV.replace('__BODY__', js)
        r = await pg.evaluate('(ARG=>' + body + ')', arg)
        s2 = await pg.evaluate("()=>GAME.snapshot()")
        await L.load_state(pg, s2, quiet_events=False, quiet_phone=False); await pg.evaluate(CLEARP); await pg.wait_for_timeout(3500)
    await L.phone_away(pg, cdp, tries=2)
    run.setup('[前置] %s%s' % (label, ('；【前置】讀檔後在頁面裡組 R 紀錄 → %s' % J(r)[:600]) if js else ''))
    return r


# ---------------------------------------------------------------- 記錄（只記不改）
HOOK = r"""(()=>{ if(window.__PLH) return 'again'; window.__PLH=1; window.__PL=[];
  const at=()=>{ try{ return {d:CALENDAR.dateOf(GAME.G.day).key, h:+(+GAME.G.hour).toFixed(3), z:GAME.G.zone}; }catch(e){ return {}; } };
  const push=o=>{ try{ Object.assign(o,at()); window.__PL.push(o); if(window.__PL.length>8000) window.__PL.splice(0,2000); }catch(e){} return o; };
  const s0=GAME.say; GAME.say=function(w,t){ push({k:'say',n:(w&&w.name)||(typeof w==='string'?w:''),t:String(t==null?'':t)}); return s0.apply(this,arguments); };
  const c0=GAME.choose; GAME.choose=function(o){ push({k:'choose',n:'',t:(o||[]).filter(x=>x&&!x.hidden).map(x=>((x.t||x.text)||'')+(x.hint?'〔'+x.hint+'〕':'')).join('｜')}); return c0.apply(this,arguments); };
  if(GAME.caption){ const p0=GAME.caption; GAME.caption=function(n,t){ push({k:'cap',n:String(n||''),t:String(t==null?'':t)}); return p0.apply(this,arguments); }; }
  if(GAME.enter){ const e0=GAME.enter; GAME.enter=function(z,sp){ push({k:'enter',n:sp?JSON.stringify(sp):'',t:String(z)}); return e0.apply(this,arguments); }; }
  if(typeof CLS!=='undefined'&&CLS.attend){ const a0=CLS.attend; CLS.attend=async function(GM,it,o){ let m={}; try{ const G=GAME.G; m={key:it.key,week:it.week,t0:it.t0,lateMin:+(+CLS.lateMin(G,it)).toFixed(2),isLateAbs:!!CLS.isLateAbsent(G,it),kind:(it.c&&it.c.kind)||null}; }catch(e){ m={err:String(e.message)}; }
      push({k:'attend',n:(it&&it.key)||'',t:JSON.stringify(m)}); const r=await a0.apply(this,arguments);
      try{ const R=CLS.rec(GAME.G); push({k:'attended',n:it.key,t:JSON.stringify({ret:r,done:!!R.done[it.key],late:!!(R.late&&R.late[it.key]),abs:!!(R.abs&&R.abs[it.key])})}); }catch(e){} return r; }; }
  if(typeof EVENTS!=='undefined'&&EVENTS.run){ const v0=EVENTS.run; EVENTS.run=function(ev){ push({k:'ev',n:'',t:String((ev&&ev.id)||'')}); return v0.apply(this,arguments); }; }
  return 'ok'; })()"""


async def pl_len(pg):
    return await pg.evaluate("(window.__PL||[]).length")


async def rows(pg, n0=0, k=None):
    R = await pg.evaluate("n=>(window.__PL||[]).slice(n)", n0)
    return [r for r in R if k is None or r['k'] == k]


# ---------------------------------------------------------------- 頁面裡讀（只讀：GAME.G 的深拷貝）
# ROLLW：和 4734c 的 S.rollWeeks 同一個算法（FNV-1a、Math.imul 洗牌、ROLL_WEEKS、c.weeks、這學期真的有上的週），舊版也能算；有 CLS.rollWeeks 就也對拷貝算一次對照
COURSES_JS = r"""(term=>{ const G0=GAME.G, cp=()=>JSON.parse(JSON.stringify(G0)); const TD=CALENDAR.termDays(term);
  const hashS=str=>{ let h=2166136261>>>0; for(let i=0;i<str.length;i++){ h^=str.charCodeAt(i); h=Math.imul(h,16777619)>>>0; } return h>>>0; };
  const RW=[2,3,4,5,6,7,10,11,12,13,14,15];
  const rollw=(G,c)=>{ const key=term+':'+c.id; const R=G.courses||{}; if(R.roll&&Array.isArray(R.roll[key])) return {src:'saved',w:R.roll[key].slice()};
    const F=G.flags||{}; const seed=(F.examSeed!=null?F.examSeed:0)+'|roll|'+term+'|'+c.id; const met=new Set();
    for(let d=TD.from; d<=TD.to; d++){ const t=CALENDAR.termOf(d); if(!t||t.id!==term) continue; if(CLS.dayItems(Object.assign({},G,{day:d}),d).some(it=>it.c.id===c.id)) met.add(t.week); }
    const cand=RW.filter(w=>(!c.weeks||c.weeks.includes(w))&&(!met.size||met.has(w))); const a=cand.slice(); let h=hashS(seed);
    for(let i=a.length-1;i>0;i--){ h=Math.imul(h^(h>>>13),0x5bd1e995)>>>0; const j=h%(i+1); const x=a[i]; a[i]=a[j]; a[j]=x; }
    return {src:'calc',w:a.slice(0,4).sort((x,y)=>x-y)}; };
  const G=cp(); const out=[];
  for(const c of CLS.termCourses(G,term)){ if(!CLS.attCourse(c)) continue; const items=[];
    for(let d=TD.from; d<=TD.to; d++){ const t=CALENDAR.termOf(d); if(!t||t.id!==term) continue; for(const it of CLS.dayItems(G,d)) if(it.c.id===c.id) items.push({day:d,key:it.key,week:t.week,wd:CALENDAR.dateOf(d).wd,date:CALENDAR.dateOf(d).key,t0:it.t0,t1:it.t1}); }
    const mine=rollw(cp(),c); let real=null; try{ real=CLS.rollWeeks?CLS.rollWeeks(cp(),c,term):null; }catch(e){ real='ERR '+e.message; }
    out.push({id:c.id,name:c.name,kind:c.kind,slots:c.slots,roll:mine.w,src:mine.src,real,items}); }
  return {term,from:TD.from,to:TD.to,hasRoll:!!CLS.rollWeeks,hasStat:!!CLS.rollStat,courses:out,gradeDay:CALENDAR.gradeDay?CALENDAR.gradeDay(term):null,
          termStart:CLS.termStartDay?CLS.termStartDay(term):TD.from,rollSince:(G0.courses||{}).rollSince}; })"""
# 【前置】組 R 紀錄：學期裡 ≤ upto（日、時）的看出席的課，miss 那幾週沒去、cap＝那一門最多去幾堂（只去不是點名週的）、其他去了（R.done、R.attend，同單元測試的 go()）
BUILDR = r"""const [term,upto,uptoH,miss,cap,roll,rs,attRule]=ARG; const R=CLS.rec(G); const TD=CALENDAR.termDays(term); const out={};
  for(let d=TD.from; d<=upto; d++){ const t=CALENDAR.termOf(d); if(!t||t.id!==term) continue;
    for(const it of CLS.dayItems(G,d)){ if(!CLS.attCourse(it.c)) continue; if(d===upto&&it.t1>uptoH) continue; const o=out[it.c.id]=out[it.c.id]||{went:[],miss:[]};
      const isRoll=(roll[it.c.id]||[]).includes(t.week);
      if((miss[it.c.id]||[]).includes(t.week)||(cap[it.c.id]!=null&&(isRoll||o.went.length>=cap[it.c.id]))){ o.miss.push(t.week); continue; }
      R.done[it.key]=1; R.attend[it.c.id]=(R.attend[it.c.id]||0)+1; o.went.push(t.week); } }
  if(attRule){ R.attRule=R.attRule&&typeof R.attRule==='object'?R.attRule:{}; for(const id in out) if(out[id].went.length) R.attRule[term+':'+id]=TD.from; }
  if(rs==='del') delete R.rollSince; else if(rs!=null) R.rollSince=rs;
  NOKX(); return {out,attend:Object.assign({},R.attend),rollSince:R.rollSince}; """
STATNOW = r"""(([term,cid])=>{ const G=JSON.parse(JSON.stringify(GAME.G)); const c=COURSES.list.find(x=>x.id===cid); if(!CLS.rollStat) return null; try{ return CLS.rollStat(G,c,term,G.day); }catch(e){ return 'ERR '+e.message; } })"""
KEYST = """(key=>{ try{ const G=GAME.G, it=CLS.dayItems(G).find(q=>q.key===key), R=CLS.rec(G), c=it&&it.c;
  return {status:it?CLS.status(G,it):null,done:!!R.done[key],late:!!(R.late&&R.late[key]),abs:!!(R.abs&&R.abs[key]),att:c?((R.attend&&R.attend[c.id])|0):null}; }catch(e){ return {err:String(e.message)}; } })"""
ITEMK = r"""(key=>{ try{ const G=GAME.G; const it=CLS.dayItems(G).find(q=>q.key===key); if(!it) return null; const rm=it.room||{};
  return {key:it.key,cid:it.c.id,name:it.c.name,week:it.week,t0:it.t0,t1:it.t1,room:rm.name||null,status:CLS.status(G,it)}; }catch(e){ return 'ERR '+e.message; } })"""
BTN_TXT = "(s=>{ const e=document.querySelector(s); return e?(e.textContent||'').trim():null; })"
POS = "(()=>{ const p=GAME.E.player.obj.position; return [Math.round(p.x*2)/2, Math.round(p.z*2)/2, GAME.E.player.lv|0, !!GAME.E.player.seat]; })()"
SYSMSG = r"""(()=>(GAME.G.msgs||[]).filter(m=>m&&m.th==='sys').map(m=>({t:m.text,tag:m.tag||null,d:CALENDAR.dateOf(m.day).key,h:+(+m.h).toFixed(2)})))()"""
SCROLL_TO = r"""(txt=>{ const b=document.getElementById('phoneBody'); if(!b) return false; const e=[...b.querySelectorAll('.item,div')].reverse().find(x=>(x.innerText||'').indexOf(txt)>=0&&(x.innerText||'').length<1200); if(!e) return false; e.scrollIntoView({block:'center'}); return true; })"""


# ---------------------------------------------------------------- 照玩家操作
DECL = ('晚一點', '不去了', '自己走過去', '先不', '不用了', '算了', '就這樣', '先這樣', '沒事', '「我晚上要念書。」', '「那天我有事。」', '「我也要念書。」', '「我週六有事。」')
GO_PREFIX = ('出發：', '直接過去：', '接起來：', '上線：')
GO_PICKS = (CONT, '照樣跳過', '老位子', '坐中間的位子', '還是進去聽', '先自由活動')


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
        if not T[i].startswith(GO_PREFIX) and '存檔' not in T[i]: return i, 'first'
    return live[0], 'first'


async def portrait_shot(pg, cdp, run, tag, scroll=None):
    """玩家把手機轉直（390×844）：#rotate 出現就點掉；scroll＝手機裡捲到那一段（玩家用手指捲）；截一張再轉回橫向"""
    await pg.set_viewport_size({'width': 390, 'height': 844}); await pg.wait_for_timeout(1800)
    if await pg.evaluate("(()=>{ const r=document.getElementById('rotate'); return !!r&&getComputedStyle(r).display!=='none'; })()"):
        await L.tap(pg, cdp, '#rotate'); await pg.wait_for_timeout(600)
    if scroll: await pg.evaluate(SCROLL_TO, scroll); await pg.wait_for_timeout(500)
    p = await run.shot(pg, tag + '_portrait')
    await pg.set_viewport_size({'width': 844, 'height': 390}); await pg.wait_for_timeout(1500)
    if scroll: await pg.evaluate(SCROLL_TO, scroll)
    return p


async def press_bed(pg, cdp, run):
    bed = await pg.evaluate("(()=>{ const it=(GAME.E.interactables||[]).find(i=>i.sleep&&!i.hidden); return it?[it.x,it.z]:null; })()")
    if not bed: return False
    await L.phone_away(pg, cdp, tries=1)
    await L.go_to(pg, cdp, run, bed[0], bed[1], 0.8, '床', max_s=150, stop=lambda s: s['dlg'] or s['choices'])
    for _ in range(4):
        await L.phone_away(pg, cdp, tries=1)
        s = await P.ts(pg)
        if s['ch'] or s['dlg']: return True
        await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1600)
        s = await P.ts(pg)
        if s['ch'] or s['dlg'] or s['busy']: return True
    return False


async def trip(pg, cdp, run, tag, it, shot_text=None, max_s=None):
    """手機「今天」→ 那一堂的「直接去上課」→ 照玩家：對話點過去、「繼續去上課」、坐位子、上完（CLS.attend 跑完）。shot_text：對話框出現那一句就截圖（橫向＋直向）"""
    max_s = max_s or ENVI('TRIP_MAX', 900)
    out = {'ok': False, 'btn': None, 'stuck': False, 'shots': []}
    day0 = (await P.clock(pg))['day']
    txt = await P.phone_tab(pg, cdp, 'today')
    sel = '#phoneBody [data-go="%s"]' % it['key']
    out['btn'] = await pg.evaluate(BTN_TXT, sel); out['today'] = txt[:700]
    out['shots'].append(await run.shot(pg, tag + '_today'))
    if not out['btn']:
        await L.close_panels(pg, cdp); return out
    n0 = await pl_len(pg); out['n0'] = n0
    await L.tap(pg, cdp, sel); await pg.wait_for_timeout(1200)
    t0 = time.time(); last = None; since = time.time(); shot_done = False
    while time.time() - t0 < max_s:
        st = await pg.evaluate(KEYST, it['key'])
        attended = any(r['n'] == it['key'] for r in await rows(pg, n0, 'attended'))
        s = await P.ts(pg); pos = await pg.evaluate(POS)
        free = not s['dlg'] and not s['ch'] and not s['busy'] and s['depth'] == 0 and not s['phone']
        if attended and free: out['ok'] = True; break
        if s['day'] != day0 and not attended:
            out['jumped'] = await P.clock(pg); out['shots'].append(await run.shot(pg, tag + '_jumped')); break
        sig = (s['day'], s['zone'], s['txt'][:40], tuple(o['t'] for o in s['ch']), s['busy'], s['depth'] > 0, bool(st.get('done')), tuple(pos))
        if sig != last: last = sig; since = time.time()
        elif free and time.time() - since > ENVI('STUCK_S', 180):
            out['stuck'] = True; out['stuck_at'] = {'clock': await P.clock(pg), 'pos': pos}; out['shots'].append(await run.shot(pg, tag + '_stuck')); break
        if s['phone'] and not s['ch'] and not s['dlg']:
            await L.phone_away(pg, cdp, tries=1); await pg.wait_for_timeout(500); continue
        if s['ch']:
            T = [o['t'] for o in s['ch']]
            k, why = pick_opt(s['ch'], GO_PICKS)
            run.note('%s %.2f %s 選項 %s → %s' % (tag, s['h'], s['zone'], J([t[:24] for t in T]), T[k][:30]))
            await P.tap_choice(pg, cdp, k); await pg.wait_for_timeout(1000); continue
        if s['dlg']:
            if shot_text and not shot_done and shot_text in s['txt']:
                await pg.wait_for_timeout(1200)
                out['shots'].append(await run.shot(pg, tag + '_line')); out['shots'].append(await portrait_shot(pg, cdp, run, tag + '_line')); shot_done = True
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(600); continue
        await pg.wait_for_timeout(900)
    out['end'] = await P.clock(pg); out['st'] = await pg.evaluate(KEYST, it['key'])
    if out['ok']: await pg.wait_for_timeout(600); out['shots'].append(await run.shot(pg, tag + '_class'))
    R = await rows(pg, n0); out['R'] = R
    out['said'] = [[r['n'], r['t'], r.get('z'), r.get('h'), i] for i, r in enumerate(R) if r['k'] == 'say']
    out['att'] = next((dict(json.loads(r['t']), i=i, h=r.get('h'), z=r.get('z')) for i, r in enumerate(R) if r['k'] == 'attend' and r['n'] == it['key']), None)
    out['fin'] = next((json.loads(r['t']) for r in R if r['k'] == 'attended' and r['n'] == it['key']), None)
    out['enters'] = [[r['t'], r.get('h')] for r in R if r['k'] == 'enter']
    out['evs'] = [[r['t'], r.get('z'), r.get('h')] for r in R if r['k'] == 'ev']
    run.note('%s：結束 %s；換區域 %s；事件 %s；上課 %s → %s' % (tag, J(out['end']), J(out['enters']), J(out['evs']), J(out['att']), J(out['fin'])))
    run.note('%s：上課的台詞（CLS.attend 以後前 14 句）%s' % (tag, J([s_[:2] for s_ in out['said'] if out['att'] and s_[4] > out['att']['i']][:14])))
    return out


async def week_text(pg, cdp):
    t = await P.phone_tab(pg, cdp, 'week'); await pg.wait_for_timeout(500)
    m = re.search(r'出席：([^\n]*)', t)
    return t, (m.group(1).strip() if m else None)


def expect_line(c, past_weeks, missed_weeks):
    return '%s 點過 %d 次名' % (c['name'], len(past_weeks)) + (('（缺 %d 次）' % len(missed_weeks)) if missed_weeks else '')


# ---------------------------------------------------------------- 挑課（照只讀預測）
INFO = {}


async def course_info(pg, cdp, run):
    if INFO: return INFO
    st, d = await state_at(pg, [TERM, 6, 1], 10.0, 'dorm', courses={'rollSince': -9999})   # 標題畫面還沒有 GAME.G：先讀一份同種子的存檔再算
    await load(pg, cdp, run, st, '只讀預測用：最小存檔 %s 10:00 宿舍（examSeed %s；只用來算點名週，不操作）' % (d['key'], SEED))
    r = await pg.evaluate(COURSES_JS, TERM)
    INFO.update(r)
    run.note('【捷徑：只讀】%s 看出席的課＋點名週預測（種子 %s；ROLLW＝探針算的、real＝CLS.rollWeeks 對拷貝算的；頁面有 rollWeeks：%s）：%s' % (
        TERM, SEED, r['hasRoll'], J([[c['id'], c['name'], c['roll'], c['real'], c['src'], [(s['wd'], s['block']) for s in c['slots']]] for c in r['courses']])))
    if r['hasRoll']:
        bad = [c['id'] for c in r['courses'] if c['real'] != c['roll']]
        run.check('只讀預測：探針的 ROLLW 和遊戲的 CLS.rollWeeks 一樣（每一門）', not bad, J(bad))
    return INFO


def pick_clean(info):
    for c in info['courses']:
        w = c['roll']
        if len(w) == 4 and 12 not in w and len([x for x in w if x < 12]) >= 2 and c['items']: return c
    return None


def pick_edge(info):
    for c in info['courses']:
        if 12 in c['roll'] and any(x < 12 for x in c['roll']):
            it12 = [i for i in c['items'] if i['week'] == 12]
            if it12 and it12[0]['wd'] > 1: return c
    return None


async def day_of_week(pg, week, wd):
    return await P.day_of(pg, [TERM, week, wd])


# ================================================================ a／a0：點名當天
async def case_a(pg, cdp, run, ctrl=False):
    tag = 'a0' if ctrl else 'a'
    info = await course_info(pg, cdp, run); c = pick_clean(info)
    run.check('%s：前置成立＝有 clean 那種課' % tag, bool(c), J([[x['id'], x['roll']] for x in info['courses']]))
    if not c: return
    rw = [w for w in c['roll'] if w >= 5]
    target = next((i for i in c['items'] if i['week'] == rw[0]), None) if rw else None
    if ctrl and target:
        target = next((i for i in c['items'] if i['week'] > target['week'] and i['week'] not in c['roll'] and i['week'] not in (8, 9, 16)), None)
    run.check('%s：前置成立＝%s 有一堂%s（只讀預測）' % (tag, c['name'], '「不是點名週」的課' if ctrl else '點名週的課'), bool(target), J(target))
    if not target: return
    st, d = await state_at(pg, target['date'], target['t0'] - 0.6, 'dorm', courses={'rollSince': -9999})
    await load(pg, cdp, run, st, '%s：最小存檔 %s %s 宿舍（%s 第 %d 週那一堂 %s 開始前 36 分鐘；examSeed %s；rollSince＝-9999＝新規則的存檔）' % (
        tag, d['key'], hm(target['t0'] - 0.6), c['name'], target['week'], hm(target['t0']), SEED),
        js=BUILDR, arg=[TERM, target['day'] - 1, 24, {}, {}, {}, None, True])
    it = await pg.evaluate(ITEMK, target['key'])
    run.check('%s：%s 有那一堂（只讀）' % (tag, d['key']), isinstance(it, dict), J(it))
    if not isinstance(it, dict): return
    tr = await trip(pg, cdp, run, tag, it, shot_text=NARR)
    run.check('%s：手機「今天」有「直接去上課」（%s）' % (tag, tr.get('btn')), (tr.get('btn') or '').startswith('直接去上課'), (tr.get('today') or '')[:300])
    if not tr.get('btn'): return
    run.check('%s：一鍵上課坐下、上完（沒有卡住、沒有遲到超過 15 分鐘）' % tag, tr['ok'] and not tr['stuck'] and bool(tr.get('fin')) and tr['fin'].get('done') and not tr['fin'].get('abs'),
              J({'end': tr.get('end'), 'stuck': tr.get('stuck_at'), 'fin': tr.get('fin'), 'att': tr.get('att')}))
    hits = [s_ for s_ in tr['said'] if s_[1] == NARR]
    ai = tr['att']['i'] if tr.get('att') else 10 ** 9
    if ctrl:
        run.check('%s：不是點名週（第 %d 週，點名週 %s）＝沒有「%s」' % (tag, target['week'], c['roll'], NARR), not hits, J(hits))
    else:
        run.check('%s：點名週（第 %d 週，點名週 %s）＝「%s」剛好一次、在開始上課（CLS.attend）以後、旁白（沒有名字）' % (tag, target['week'], c['roll'], NARR),
                  len(hits) == 1 and hits[0][4] > ai and not hits[0][0], J({'hits': hits, 'attend_i': ai}))
    if tr['ok']:
        t, line = await week_text(pg, cdp)
        past = [w for w in c['roll'] if w <= target['week']]
        want = expect_line(c, past, [])
        p1 = await run.shot(pg, tag + '_week')
        run.check('%s：上完以後手機「課表」寫「%s」（點過＝≤ 第 %d 週的點名週 %s，都到了）' % (tag, want, target['week'], past), bool(line) and want in line.split('、'), J({'line': line, 'shot': p1}))
        await L.close_panels(pg, cdp)


# ================================================================ b／bedge：課表
async def case_b(pg, cdp, run, edge=False):
    tag = 'bedge' if edge else 'b'
    info = await course_info(pg, cdp, run); c = pick_clean(info)
    if edge:
        e = pick_edge(info)
        run.check('%s：前置成立＝有 edge 那種課（點名週有第 12 週、那一堂不是週一）' % tag, bool(e), J([[x['id'], x['roll']] for x in info['courses']]))
        if not e: return
        mon = await day_of_week(pg, 12, 1); upto, uh, h0, key = mon['d'] - 1, 24, 8.5, mon['key']
        miss = {e['id']: [min(e['roll'])]}
        who = '第 12 週週一 %s 08:30 宿舍（%s 第 12 週那一堂在週%d、還沒上）；%s 缺第 %d 週，其他全到' % (key, e['name'], [i for i in e['items'] if i['week'] == 12][0]['wd'], e['name'], min(e['roll']))
    else:
        run.check('%s：前置成立＝有 clean 那種課' % tag, bool(c))
        if not c: return
        sat = await day_of_week(pg, B_WEEK, 6); upto, uh, h0, key = sat['d'], 24, 10.0, sat['key']
        miss = {c['id']: [c['roll'][0]]}
        other = next((x for x in info['courses'] if x['id'] != c['id'] and len([w for w in x['roll'] if w <= B_WEEK]) >= 2), None)
        if other: miss[other['id']] = [[w for w in other['roll'] if w <= B_WEEK][1]]
        who = '第 %d 週週六 %s 10:00 宿舍；缺 %s' % (B_WEEK, key, J(miss))
    st, d = await state_at(pg, key, h0, 'dorm', courses={'rollSince': -9999})
    r = await load(pg, cdp, run, st, '%s：最小存檔 %s（examSeed %s）' % (tag, who, SEED), js=BUILDR, arg=[TERM, upto, uh, miss, {}, {}, None, True])
    cur = (await P.day_of(pg, key))['week']
    t, line = await week_text(pg, cdp)
    p1 = await run.shot(pg, tag + '_week')
    p2 = await portrait_shot(pg, cdp, run, tag + '_week', scroll='出席：')
    parts = (line or '').split('、')
    for x in info['courses']:
        went_days = {i['week'] for i in x['items'] if i['day'] <= upto and i['week'] not in miss.get(x['id'], [])}
        if edge:   # 規格：只算已經上過（點過）的點名日
            past = [w for w in x['roll'] if any(i['week'] == w and i['day'] <= upto for i in x['items'])]
        else:
            past = [w for w in x['roll'] if w <= cur]
        missed = [w for w in past if w not in went_days]
        want = expect_line(x, past, missed)
        got = next((p for p in parts if p.startswith(x['name'] + ' ')), None)
        stat = await pg.evaluate(STATNOW, [TERM, x['id']])
        lab = '（邊界：讀碼預測 4734c 以後 FAIL——S.rollStat 用「週次 ≤ 這週」，還沒上的那一堂算成點過、缺）' if (edge and x['id'] == pick_edge(info)['id']) else ''
        run.check('%s：手機「課表」%s＝「%s」（點名週 %s；到 %s；缺 %s）%s' % (tag, x['name'], want, x['roll'], sorted(went_days & set(x['roll'])), missed, lab), got == want,
                  J({'got': got, 'rollStat(只讀)': stat}))
    run.note('%s：課表「出席：」整行 %s；截圖 %s、%s' % (tag, J(line), p1, p2))
    await L.close_panels(pg, cdp)


# ================================================================ c1／c2／cw：第 12 週提醒
async def case_c(pg, cdp, run, k):
    tag = k
    info = await course_info(pg, cdp, run); c = pick_clean(info); e = pick_edge(info)
    tgt = e if k == 'cw' else c
    run.check('%s：前置成立＝有 %s 那種課' % (tag, 'edge' if k == 'cw' else 'clean'), bool(tgt), J([[x['id'], x['roll']] for x in info['courses']]))
    if not tgt: return
    pre12 = [w for w in tgt['roll'] if w < 12]
    mw = pre12[:2] if k == 'c2' else pre12[:1]
    mon = await day_of_week(pg, 12, 1)
    st, d = await state_at(pg, mon['key'], 7 + 56 / 60, 'dorm', courses={'rollSince': -9999})
    await load(pg, cdp, run, st, '%s：最小存檔 第 12 週週一 %s 07:56 宿舍；第 11 週以前全到，只有 %s 缺第 %s 週（真的缺 %d 次）' % (tag, mon['key'], tgt['name'], mw, len(mw)),
               js=BUILDR, arg=[TERM, mon['d'] - 1, 24, {tgt['id']: mw}, {}, {}, None, True])
    ok = await P.wait_hour(pg, cdp, 8 + 5 / 60, max_s=ENVI('WAIT8', 900), day=mon['d'])
    await pg.wait_for_timeout(3000)
    run.check('%s：站著等到 08:05 以後（%s）' % (tag, J(await P.clock(pg))), ok)
    msgs = await pg.evaluate(SYSMSG); att = [m for m in msgs if m['t'].startswith('【出席】')]
    stats = {x['id']: await pg.evaluate(STATNOW, [TERM, x['id']]) for x in info['courses']}
    run.note('%s：系統訊息（全部）%s；只讀 rollStat（今天）%s' % (tag, J(msgs[-8:]), J(stats)))
    th = await P.phone_thread(pg, cdp, 'sys')
    p1 = await run.shot(pg, tag + '_sys')
    p2 = await portrait_shot(pg, cdp, run, tag + '_sys', scroll='【出席】' if att else None)
    if k == 'c2':
        n = len([w for w in tgt['roll'] if w <= 12])
        want = '【出席】%s：這學期點過 %d 次名，你缺了 2 次。' % (tgt['name'], n)
        run.check('%s：剛好一則「%s」（第 12 週週一 08:00；手機「訊息」→ 系統看得到）' % (tag, want), [m['t'] for m in att] == [want] and want in (th.get('text') or ''),
                  J({'att': att, 'thread': (th.get('text') or '')[-400:], 'shots': [p1, p2]}))
    else:
        lab = '（邊界：讀碼預測 4734c 以後 FAIL——週一 08:00 的 rollStat 把第 12 週週%d 還沒上的點名算成缺）' % [i for i in tgt['items'] if i['week'] == 12][0]['wd'] if k == 'cw' else ''
        run.check('%s：%s 真的只缺 1 次＝沒有任何「【出席】」提醒%s' % (tag, tgt['name'], lab), not att and '【出席】' not in (th.get('text') or ''), J({'att': att, 'shots': [p1, p2]}))
    await L.close_panels(pg, cdp)


# ================================================================ d_old／d_new：舊存檔
async def case_d(pg, cdp, run, k):
    tag = k
    info = await course_info(pg, cdp, run); c = pick_clean(info)
    run.check('%s：前置成立＝有 clean 那種課、有成績公布日' % tag, bool(c) and info.get('gradeDay') is not None, J(info.get('gradeDay')))
    if not c or info.get('gradeDay') is None: return
    gd = info['gradeDay']
    gk = await pg.evaluate("d=>CALENDAR.dateOf(d).key", gd - 1)
    roll = {c['id']: c['roll']}
    st, d = await state_at(pg, gk, 23 + 20 / 60, 'dorm', courses=(None if k == 'd_old' else {'rollSince': -9999}))
    rs = 'del' if k == 'd_old' else -9999
    r = await load(pg, cdp, run, st, '%s：最小存檔 成績公布日前一晚 %s 23:20 宿舍；%s 這學期只去 3 堂不是點名的課（點名 %s 全缺）、其他全到；%s' % (
        tag, gk, c['name'], c['roll'], '存檔沒有 rollSince（改版前存的；讀進來那一刻 S.rec 會記成讀檔那天）' if k == 'd_old' else 'rollSince＝-9999（學期開始以前＝新規則的存檔）'),
        js=BUILDR, arg=[TERM, info['to'], 24, {}, {c['id']: 3}, roll, rs, True])
    since = await pg.evaluate("(()=>(GAME.G.courses||{}).rollSince)()")
    t0 = info.get('termStart')
    failed = await pg.evaluate("(t=>CLS.failedIn(JSON.parse(JSON.stringify(GAME.G)),t).map(c=>c.id))", TERM)
    run.note('%s：讀檔以後 rollSince＝%s（學期開始 %s）；只讀 CLS.failedIn %s；R 組好的 %s' % (tag, since, t0, J(failed), J((r or {}).get('out', {}).get(c['id']))))
    if k == 'd_old' and info['hasRoll']:
        run.check('%s：舊存檔第一次讀進來＝rollSince 記成讀檔那天（%s ＞ 學期開始 %s）' % (tag, since, t0), since is not None and t0 is not None and since > t0, J(since))
    ok = await press_bed(pg, cdp, run)
    ch = None
    if ok:
        t1 = time.time()
        while time.time() - t1 < 60:
            s = await P.ts(pg)
            if s['ch'] and any(o['t'].startswith('睡') for o in s['ch']): ch = s['ch']; break
            if s['dlg']: await L.tap(pg, cdp, '#dlg')
            await pg.wait_for_timeout(1000)
    run.check('%s：走到床、按下去＝有「睡到明天早上」（或「睡…」）' % tag, bool(ch), J(ch))
    if not ch: return
    n0 = await pl_len(pg)
    kk = next((i for i, o in enumerate(ch) if o['t'].startswith('睡到明天')), None)
    if kk is None: kk = next(i for i, o in enumerate(ch) if o['t'].startswith('睡'))
    run.note('%s：床的選單 %s → 選 %s' % (tag, J([o['t'] for o in ch]), ch[kk]['t']))
    await P.tap_choice(pg, cdp, kk); await pg.wait_for_timeout(1500)
    head = await pg.evaluate("t=>CLS.termName(t)+'的成績出來了。'", TERM)
    t1 = time.time(); shot = None; gline = None
    while time.time() - t1 < ENVI('NIGHT_MAX', 900):
        R = await rows(pg, n0, 'say'); T = [x['t'] for x in R]
        if head in T:
            i = T.index(head)
            if i + 1 < len(T): gline = T[i + 1]
        s = await P.ts(pg)
        if s['dlg'] and gline and (c['name'] + '：') in s['txt'] and not shot:
            await pg.wait_for_timeout(2500); shot = [await run.shot(pg, tag + '_grades'), await portrait_shot(pg, cdp, run, tag + '_grades')]
        if gline and shot: break
        if s['phone'] and not s['ch'] and not s['dlg']: await L.phone_away(pg, cdp, tries=1); continue
        if s['ch']:
            k2, why = pick_opt(s['ch'], ('先起床',)); run.note('%s %s 選項 %s → %s' % (tag, J(await P.clock(pg)), J([o['t'][:20] for o in s['ch']]), s['ch'][k2]['t'][:24]))
            await P.tap_choice(pg, cdp, k2); await pg.wait_for_timeout(1000); continue
        if s['dlg'] and not (gline and (c['name'] + '：') in s['txt']): await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(700); continue
        await pg.wait_for_timeout(1000)
    m = re.search(re.escape(c['name']) + r'：([^　]*)', gline or '')
    g = m.group(1) if m else None
    run.note('%s：成績單 %s；截圖 %s' % (tag, J(gline), J(shot)))
    if k == 'd_old':
        run.check('%s：舊存檔（rollSince 以前開始的學期）出席 3 次照舊用舊規則＝成績單「%s：及格」、CLS.failedIn 不含它' % (tag, c['name']), g == '及格' and c['id'] not in failed, J({'grade': g, 'failed': failed}))
    else:
        run.check('%s：新規則（學期在 rollSince 以後開始）點名 4 次全缺＝成績單「%s：不及格（下學期重修）」（修改前沒有點名規則＝「及格」）' % (tag, c['name']),
                  bool(g) and g.startswith('不及格') and c['id'] in failed, J({'grade': g, 'failed': failed}))
    for _ in range(80):   # 成績單之後的對話照玩家點完（最多 80 次）
        s = await P.ts(pg)
        if not (s['dlg'] or s['ch']): break
        if s['ch']: await P.tap_choice(pg, cdp, pick_opt(s['ch'], ('先起床',))[0])
        else: await L.tap(pg, cdp, '#dlg')
        await pg.wait_for_timeout(900)


# ================================================================ main
CASEFN = {'a': lambda pg, cdp, run: case_a(pg, cdp, run, False), 'a0': lambda pg, cdp, run: case_a(pg, cdp, run, True),
          'b': lambda pg, cdp, run: case_b(pg, cdp, run, False), 'bedge': lambda pg, cdp, run: case_b(pg, cdp, run, True),
          'c1': lambda pg, cdp, run: case_c(pg, cdp, run, 'c1'), 'c2': lambda pg, cdp, run: case_c(pg, cdp, run, 'c2'), 'cw': lambda pg, cdp, run: case_c(pg, cdp, run, 'cw'),
          'd_old': lambda pg, cdp, run: case_d(pg, cdp, run, 'd_old'), 'd_new': lambda pg, cdp, run: case_d(pg, cdp, run, 'd_new')}


async def main():
    run = L.Run('rollcall_' + '+'.join(CASES), OUT); os.makedirs(OUT, exist_ok=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        pg.on('dialog', lambda dd: asyncio.ensure_future(dd.accept()))
        try:
            await pg.goto(URL); ok = await L.wait_loaded(pg); run.check('遊戲載入', ok)
            await pg.evaluate("localStorage.clear()"); await P.init(pg); await pg.evaluate(HOOK)
            for c in CASES:
                fn = CASEFN.get(c)
                if not fn: run.check('CASE %s 認得' % c, False, '可以用：' + ','.join(CASEFN)); continue
                print('==== CASE %s（SHA %s）====' % (c, os.environ.get('SHA', '?')), flush=True)
                try: await fn(pg, cdp, run)
                except Exception as e:
                    run.check('%s：跑完（沒有探針例外）' % c, False, repr(e)[:500]); traceback.print_exc()
                    try: await run.shot(pg, c + '_exception'); await L.close_panels(pg, cdp)
                    except Exception: pass
        except Exception as e:
            run.check('跑完（沒有探針例外）', False, repr(e)[:500]); traceback.print_exc()
        run.check('沒有 JS 例外', not errs, J(errs[:3]))
        try: await asyncio.wait_for(b.close(), 30)
        except Exception: pass
    print('SHA', os.environ.get('SHA', '?'), 'CASES', ','.join(CASES), flush=True)
    sys.exit(run.finish())

if __name__ == '__main__':
    asyncio.run(main())
