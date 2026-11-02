"""CC（帳號 A）11-02：#12「大四下 6 月底補考」（D118 補考，src/faildelay3d.js FD.mkPlan／FD.makeup／FD.mkMissed／FD.homeMakeupOpt）的瀏覽器探針。
修改後＝開發分支 4174ffe89 以後（補考本體）；在家那一條＝0c3d9e7a5 以後（BUG-MAKEUP-HOME-1102：家裡的選單「出發：補考（法律系館A）」）。
修改前基準：主線 f3a2ba4a1（沒有補考：6/18 直接延畢）；在家那一條 4174ffe89（有補考、家裡選單沒有那一項）。Node 證據：tests/y4s2_makeup_unit.js。
讀碼看到的規則（0c3d9e7a5）：
  6/18 09:00 成績單（PG 步驟 fd_grades_y4s2 → CLS.showGrades 'Y4S2' → FD.check）：大四下被當的課（CLS.failedIn；考五題的課＝期末 status done 且答對 0 題）
  全部都是考五題的課、沒有交換、成績單在補考日以前發（FD.mkOpen）→ FD.mkPlan：不延畢，FAIL_DELAY_COURSES＝[]、FAIL_DELAY_V＝2、
  FD_MAKEUP＝{v:1,courses,status:'pending',res:{}}；旁白「（{課名}，不及格。）」＋MK_LINES.notice；手機 sys「【教務處】大四下補考通知…」（tag fd_mk_sys）；
  6/25 20:00 提醒（PHONE.at，tag fd_mk_remind；畢業後篇跳日期會停在那裡）。
  被當的課裡有一門看出席的課（點名制）＝照舊 6/18 直接延畢（全部記進 FAIL_DELAY_COURSES）、不排補考。
  補考：PG 步驟 fd_makeup，at 6/26 09:30（MK_STEP_H），until 11:00（MK_UNTIL_H），cond FD.mkPending；演 FD.makeup：時間帶到 10:00、MK_LINES.open、
  每科 CLS.runExam kind 'makeup'（「考卷發下來。{課}補考。五題。」）；及格＝答對 1 題以上（CLS.makeupPassed）；過＝成績「及格（補考）」、照常畢業、BAR_REG 不動；
  沒過＝FD.applyDelay（FAIL_DELAY、BAR_REG false＋FAIL_DELAY_BARCANCEL）＋FD.LINES.cert／bar；考完時間到 11:00。
  沒去（11:00 以前沒開始：一直坐著、在別的場景裡、讀檔時已經過了、在家）＝onMiss → FD.mkMissed（當下延畢、成績「不及格（補考缺考）」），
  旁白在下一個停點（PG 步驟 fd_mk_missed，at 11:00～6/28 24:00）。
  題目：CLS.drawExam(G,課,'Y4S2','makeup')——同一份期末範圍（examPool 第 15 週以前），先抽期末沒考過的題；海商法題庫 13 題（≥10）＝和期末一題都不重複。
  總複習：6/18 成績單以後到 6/26 10:00 以前，宿舍書桌／家裡選單有「考前總複習」，提示「補考的 1 科、N 張觀念卡…」；讀到一半會過 10:00＝不給（MK_LINES.reviewBlock）。
  在家（HOME.at）：PG.tick 不跑（postgrad3d.js free 條件）。0c3d9e7a5：6/26 當天、11:00 以前、還 pending＝家裡選單多「出發：補考（法律系館A）」（HOME.MENU_OPTS），
  按了演 FD.makeup、演完回家裡的選單；在家睡覺＝HOME.sleep → PG.sleepJump（4174ffe89 就有）跳到下一件事。6/26 是週二：一般日子回不了家（HOME.canGo 只有週五晚～週日、
  放假、退宿以後；6/23（六）、6/24（日）可以回家，畢業後篇週日晚上不強制回宿舍）＝home 這一組用【前置】直接把人放在家裡。
不是 iPhone：Playwright 手機橫向模擬（SwiftShader，1～4 fps），URL 用 '<URL>/index.html?turbo'。

CASES（逗號隔開，每個 case 開一個新的瀏覽器；預設全跑 main_pass,main_fail,noshow,home,rollcall_fail；nodup 併在 main_pass）：
  main_pass  【前置】最小存檔（cc_y4s2final_probe 的 state_at）2029-05-27（日）21:00 宿舍，Y4_PATH bar、BAR_REG true；照玩家一天天過（同 cc_y4s2final_probe main）；
             5/30 海商法期末【捷徑】讀正解故意全部答錯（FINAL_RIGHT，預設 0：被當門檻＝答對 0 題）→ 6/18 成績單（旁白、補考通知直向＋橫向、手機「訊息」教務處直向＋橫向）
             → 宿舍書桌「考前總複習」（選單提示直向＋橫向截圖，做一次）→ 站著不動（畢業後篇跳到下一件事；劇情照玩家點過）→ 6/25 20:00 提醒（記時間、截圖）
             → 6/26 09:30 補考那一場（記開始時間、10:00 開場那一句）→ 補考【捷徑】讀正解（MK_RIGHT，預設 5）→ 旁白、FD_MAKEUP pass、成績「及格（補考）」、
             沒有延畢、BAR_REG true。nodup：期末 5 題 id（R.exam Y4S2:maritime:final.qs）和補考 5 題 id（…:makeup.qs、考卷畫面讀到的 id）交集要空。
             MAIN_FROM=0618 改用【前置】6/18 08:30 存檔（同 main_fail）省時間。
  main_fail  【前置】6/18 08:30 宿舍存檔（畢業典禮演過、海商法期末紀錄 status done、答對 0 題、qs＝照存檔種子 examSeed 抽的那 5 題；PG.done grad）
             → 6/18 09:00 成績單照玩家看 → 站著不動到 6/26 09:30 → 補考【捷徑】讀正解故意全部答錯（MK_RIGHT＝0）→ 當場延畢（FAIL_DELAY、FAIL_DELAY_COURSES、
             FAIL_DELAY_DAY＝6/26、BAR_REG false、FAIL_DELAY_BARCANCEL、cert／bar 原句）。MAIN_FROM=0527 改從 5/27 照玩家過。
  noshow     【前置】6/26 11:15 宿舍存檔（補考已排好、pending；照碼「讀檔時已經過了」那一種沒去）→ 讀檔後 FD_MAKEUP missed、延畢、成績「不及格（補考缺考）」、
             下一個停點演「（補考的時間過了。…）」＋cert（＋bar）。宿舍裡純照玩家沒有辦法「不去」（站 2 秒就跳到 09:30 那一場、坐著要坐一個半小時），
             照玩家拖過 11:00 的版本在 home 的 rest 那一組。
  home       【前置】直接把人放在臺北的家（G.home.at＝true、補考 pending），HOME_SUBS（預設 go,sleep,late,rest）：
             go    6/26 08:30：家裡選單有「出發：補考（法律系館A）」（直向＋橫向截圖）→ 按 → 演補考（MK_RIGHT 預設 5）→ 回到家裡的選單、那一項不見了（已經考完）
             sleep 6/25 21:00：選單沒有那一項（6/26 以外，截圖）→「睡覺」→ 直接跳到 6/26 09:30 那一場（fd_makeup 開始時間）→ 考完回家裡的選單
             late  6/26 11:15：選單沒有那一項（11:00 以後，截圖）
             rest  6/26 08:30：一直選「在家休息一下」拖過 11:00（每一輪選單都記）→ 那一項消失 → 記 FD_MAKEUP 狀態 →「回宿舍」→ 沒去的旁白、延畢
             修改前 4174ffe89 預期 go、rest 的「有那一項」FAIL（停點不跑、11:00 直接算沒去）。
  rollcall_fail 【前置】6/18 08:30 宿舍存檔（同 main_fail）＋大四下排了一門看出席的重修（日文二 japanese_2，週三下午，出席 0；大四下本身沒有點名制的課，
             照 tests/y4s2_makeup_unit.js d 節組）；ROLL_ONLY=1＝海商法沒被當、只有日文二 → 6/18 照舊直接延畢（兩門都記）、沒有 FD_MAKEUP、
             之後站著不動 ROLL_PLAY 秒（預設 300）：沒有補考通知、提醒、fd_makeup 步驟。
BB 08:59 加（補考時間窗 bug，CC_audit_4174.md 疑點 1～3、5；修改前＝0c3d9e7a5 預期 1～3 FAIL，修改後等 LAWWW 交件）：
  study3h    【前置】6/26 08:30 總圖閱覽室、補考 pending；讀完馬上照玩家走到自習座位（站 2 秒會被跳到 09:30 那一場：先跑起來就記「前置沒成立」）
             → 座位選單、讀書長度選單（每一項的 hint、有沒有變灰、有沒有「讀到…補考…前」）直向＋橫向 →「讀 3 小時」→ 結果（修改前預期 11:30 缺考延畢）。
  skipnoon   SKIP_VIA（預設 phone,seat）：phone＝6/26 08:30 宿舍，讀完馬上開手機「今天」→「跳過時間：等到中午（12:00）」（CLS.skipTo 的玩家入口；畢業後篇床只有「睡覺」
             ＝到下一件事，沒有小睡；小睡只在起床選單翹課以後）；seat＝總圖座位「待到中午」【前置】今天上午時段次數已用（G.slots.used.am＝1）。
             記有沒有「會錯過」確認、停在哪裡、結果（直向＋橫向截按鈕／選單、確認畫面）。
  homerest   【前置】6/26 10:30 在家、選單有「出發：補考」→「在家休息一下」→ R1「會錯過：…」有沒有列補考 → 結果 →「回宿舍」看缺考旁白。
  old_delayed【前置】照修改前 f3a2ba4a1 6/18 FD.check 的旗標（FAIL_DELAY_COURSES [maritime]、FAIL_DELAY_V 2、FAIL_DELAY、FAIL_DELAY_DAY 6/18、BAR_REG false、
             BARCANCEL、成績 0 分（不及格）、阿哲兩則），日期 OLD_DAY（預設 2029-06-20）10:00 宿舍 → 讀進來：FD_MAKEUP pending、補考通知（旁白或手機）；BAR_REG 只記。
             之後站著不動 OLD_PLAY 秒（預設 240）。
記錄（只記不改）：HOOK＝GAME.say／choose（連 hint）／caption／titleCard／toast／ADV.begin／GAME.enter／CLS.attend／goClass／EVENTS.run／PG.runStep
  → <輸出>/transcript_<case>.json（另外存新增的手機訊息、考卷作答（題號、id、正解、按了哪個）、狀態快照）。
check 只客觀記錄（不判定企劃）。
用法：LW_TESTS=<工作樹>/tests SHA=<sha> [CASES=main_pass,...] python3 cc_makeup_probe.py '<URL>/index.html?turbo' <輸出資料夾>
等待上限（秒）：CASE_MAX（預設 6000）、TRIP_MAX（一趟上課 600）、STUCK_S（240）、POST_S（補考演完再等，20）、MK_WAIT（6/18 以後等補考，2400）。"""
import os, sys, json, asyncio, re, time, traceback
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__)))); import bbplay as P   # bbplay 在上一層（BB 的 test_tools）
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
J = lambda o: json.dumps(o, ensure_ascii=False)
ENVI = lambda k, d: int(os.environ.get(k, str(d)))
CASES = [c.strip() for c in os.environ.get('CASES', 'main_pass,main_fail,noshow,home,rollcall_fail,study3h,skipnoon,homerest,old_delayed').split(',') if c.strip()]
SKIP_VIA = [c.strip() for c in os.environ.get('SKIP_VIA', 'phone,seat').split(',') if c.strip()]
HOME_SUBS = [c.strip() for c in os.environ.get('HOME_SUBS', 'go,sleep,late,rest').split(',') if c.strip()]
LAND = {'width': 844, 'height': 390}; PORT = {'width': 390, 'height': 844}
CONT = '繼續去上課'
EXAM_DAY = '2029-05-30'; GRADE_DAY = '2029-06-18'; MK_DAY = '2029-06-26'; REMIND_DAY = '2029-06-25'
SEED = 424242   # 【前置】存檔的 examSeed（期末 5 題照這個種子抽）
# 補考的字（0c3d9e7a5 的 FD.MK_LINES；頁面裡有就用頁面的，修改前沒有＝用這裡的比對）
MKL0 = {'notice': '（補考在 6/26（二）上午十點，法律系館A。考過了，就照常畢業。）', 'open': '（法律系館A，一間小教室。來補考的只有幾個人。）', 'examName': '補考',
        'pass': '（{課名}，補考過了。）', 'passAll': '（這樣，就真的畢業了。）', 'passBar': '（今年的國考，照常考。）', 'fail': '（{課名}的補考，沒有過。）',
        'missed': '（補考的時間過了。{課名}，你沒有去考。）', 'gradePass': '及格（補考）', 'gradeFail': '不及格（補考未過）', 'gradeMissed': '不及格（補考缺考）',
        'reviewWhat': '補考的', 'homeOpt': '出發：補考（法律系館A）'}
FDL0 = {'fail': '（{課名}，不及格。）', 'cert': '（證書要等下學期。九月，你要回學校重修。）', 'bar': '（今年的國考，考不成了。明年再報。）'}
REVIEW = '考前總複習'


def hm(h):
    if h is None: return '--:--'
    m = int(round(float(h) * 60)); return '%02d:%02d' % (m // 60, m % 60)


# ---------------------------------------------------------------- 存檔（cc_y4s2final_probe 的 state_at，複製）
BASEF = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True, 'metAn': True, 'met_an': True, 'MET_ZHE': True,
         'zheNoodleDone': True, 'KX_FIRST_MSG': True, 'KX_EVE_MSG': True, 'FAM_GROUP_SENT': True, 'CEREMONY_Y1': True, 'KAI_MOVEIN': True, 'LAW_RECAP_SEEN': True,
         'fundsV2': 1, 'KX_DEC3_MIGRATED': True, 'dating_kexin': False}
ROOMS = (('ROOM_Y2', '2026-09-06'), ('ROOM_Y3', '2027-09-05'), ('ROOM_Y4', '2028-09-03'))
VISITED = ('noodle', 'cafe', 'library_hall', 'library', 'lawlib', 'wancai', 'linze', 'gongguan', 'wenzhou', 'soclib', 'cvs', 'bookstore')
Y4_DONE = ('ev_pack_y4', 'ev_grad_family', 'ev_grad_lunch', 'ev_grad_envelope')


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
# 【前置】期末的 5 題：照 classes3d.js drawExam，用一份只有 examSeed 的假存檔抽（只讀，不碰 GAME.G）
DRAWFIN = "(([seed,day])=>{ try{ const g={flags:{examSeed:seed},day,stage:'law'}; const d=CLS.drawExam(g,'maritime','Y4S2','final'); return d.ok?d.qs.map(q=>q.id):null; }catch(e){ return 'ERR '+e.message; } })"


async def grad_state(pg, run, key, h, planned, extra=None, home=False, retake=False, fail_maritime=True):
    """【前置】畢業典禮演過的存檔：海商法期末 status done、答對 0 題（fail_maritime），planned＝6/18 已經排好補考（FD_MAKEUP pending、PG.done fd_grades_y4s2、手機教務處通知）"""
    gd = await pg.evaluate("PG.gradDay()"); dpack = (await P.day_of(pg, '2029-06-01'))['d']; d0 = (await P.day_of(pg, key))['d']
    qs = await pg.evaluate(DRAWFIN, [SEED, d0])
    flags = {'Y4_PATH': 'bar', 'BAR_REG': True, 'GRADUATED': gd, 'GRAD_DONE': True, 'GRAD_EVENING': 'none', 'GRAD_ENVELOPE': 'later', 'PACKED_Y4': dpack,
             'examSeed': SEED, 'PG': {'done': {'grad': 1}}}
    if planned:
        flags['PG']['done']['fd_grades_y4s2'] = 1
        flags.update(FAIL_DELAY_COURSES=[], FAIL_DELAY_V=2, FD_MAKEUP={'v': 1, 'courses': ['maritime'], 'status': 'pending', 'res': {}})
    flags.update(extra or {})
    st, d = await state_at(pg, key, h, 'dorm', flags, done={e: 1 for e in Y4_DONE})
    C = st['courses'] = {'done': {}, 'attend': {}, 'prep': {}, 'electives': {}, 'note': {}, 'disc': {}, 'ask': {}, 'late': {}, 'abs': {}, 'exam': {}, 'grades': {}}
    C['exam']['Y4S2:maritime:final'] = {'qs': qs if isinstance(qs, list) else [], 'ans': [], 'status': 'done', 'correct': 0 if fail_maritime else 3, 'score': 0 if fail_maritime else 80}
    if retake:
        C['retake'] = [{'id': 'japanese_2', 'from': 'Y3S2', 'base': 'Y2S2', 'term': 'Y4S2', 'slots': [{'wd': 3, 'block': 'pm1'}], 'alt': False}]
        C['attend']['japanese_2'] = 0
    if planned:
        C['grades']['Y4S2'] = {'legal_research': '通過', 'legal_practice': '通過', 'maritime': '0 分（不及格）'}
        d618 = (await P.day_of(pg, GRADE_DAY))['d']
        st['msgs'] = [{'day': d618, 'h': 9.1, 'th': 'sys', 'text': '【教務處】大四下補考通知：海商法與海洋法。6/26（二）10:00，法律系館A。', 'tag': 'fd_mk_sys'}]
    if home: st['home'] = {'at': True, 'day': d['d']}
    return st, d, qs


# ---------------------------------------------------------------- 記錄（只記不改；cc_y4s2final_probe 的 HOOK）
HOOK = r"""(()=>{ if(window.__PLH) return 'again'; window.__PLH=1; window.__PL=[];
  const at=()=>{ try{ return {d:CALENDAR.dateOf(GAME.G.day).key, h:+(+GAME.G.hour).toFixed(3), z:GAME.G.zone}; }catch(e){ return {}; } };
  const push=o=>{ try{ Object.assign(o,at()); window.__PL.push(o); }catch(e){} return o; };
  const bgs=b=>typeof b==='string'?b:JSON.stringify(b||null);
  const s0=GAME.say; GAME.say=function(w,t){ push({k:'say',n:(w&&w.name)||(typeof w==='string'?w:''),c:(w&&w.charId)||null,t:String(t==null?'':t)}); return s0.apply(this,arguments); };
  const c0=GAME.choose; GAME.choose=function(o){ push({k:'choose',n:'',t:(o||[]).filter(x=>x&&!x.hidden).map(x=>((x.t||x.text)||'')+(x.hint?'〔'+x.hint+'〕':'')).join('｜')}); return c0.apply(this,arguments); };
  if(typeof ADV!=='undefined'&&ADV.begin){ const b0=ADV.begin; ADV.begin=function(o){ push({k:'bg',n:'begin',t:bgs(o&&o.background)}); return b0.apply(this,arguments); }; }
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
  for(const k of Object.keys(F)) if(/^(FAIL_DELAY|FAIL_DELAY_COURSES|FAIL_DELAY_DAY|FAIL_DELAY_BARCANCEL|FAIL_DELAY_V|FD_MAKEUP|FD_RESCUE_NOFINAL|BAR_REG|Y4_PATH|GRADUATED|MOVED_OUT)$/.test(k)) pick[k]=F[k];
  const ex={}; for(const k in (R.exam||{})) if(/^Y4S2:/.test(k)) ex[k]=R.exam[k];
  let failed=null; try{ failed=CLS.failedIn(G,'Y4S2').map(c=>c.id); }catch(e){ failed='ERR '+e.message; }
  const t=CALENDAR.termOf(G.day); let pgOn=null, delayed=null, pgDone=null, pend=null, mk=null, homeOpt=null, review=null;
  try{ pgOn=PG.on(G); delayed=PG.delayed(G); pgDone=PG.rec(G).done||{}; pend=PG.pending(G).slice(0,6).map(x=>[x.s.id,CALENDAR.dateOf(Math.floor(x.t/24)).key,+(x.t%24).toFixed(2)]); }catch(e){}
  try{ mk=typeof FD!=='undefined'&&FD.mk?FD.mk(G):'(沒有 FD.mk)'; }catch(e){ mk='ERR '+e.message; }
  try{ const o=typeof FD!=='undefined'&&FD.homeMakeupOpt?FD.homeMakeupOpt(G):undefined; homeOpt=o===undefined?'(沒有 FD.homeMakeupOpt)':(o&&{t:o.t,hint:o.hint}); }catch(e){ homeOpt='ERR '+e.message; }
  try{ const o=typeof STUDY!=='undefined'&&STUDY.reviewOpt?STUDY.reviewOpt(G,{}):null; review=o&&{t:o.t,hint:o.hint,dim:!!o.dim}; }catch(e){ review='ERR '+e.message; }
  return {clock:{key:CALENDAR.dateOf(G.day).key,day:G.day,h:+(+G.hour).toFixed(3),zone:G.zone,term:t&&t.id,week:t&&t.week},flags:pick,failed,exam:ex,
    grades:(R.grades||{}).Y4S2||null,pgOn,delayed,pgDone,pend,mk,homeOpt,review,homeAt:!!(typeof HOME!=='undefined'&&HOME.at&&HOME.at(G)),
    retake:R.retake||null,nmsg:(G.msgs||[]).length,title:!document.getElementById('titleScreen').classList.contains('hide')}; })()"""
LINES = "(()=>({mk:(typeof FD!=='undefined'&&FD.MK_LINES)||null, fd:(typeof FD!=='undefined'&&FD.LINES)||null, cname:(()=>{ try{ return FD.cname('maritime'); }catch(e){ return '海商法與海洋法'; } })()}))()"
GOLIST = r"""(()=>{ try{ const G=GAME.G, R=CLS.rec(G); return CLS.goList(G).filter(it=>!R.done[it.key]&&!(R.note&&R.note['plan_skip_'+it.key])).map(it=>({key:it.key,cid:it.c.id,name:it.c.name,t0:it.t0,exam:it.exam||null,examMain:!!it.examMain,status:CLS.status(G,it)})); }catch(e){ return []; } })()"""
# 【捷徑】考卷的正解（只讀）：畫面上那一題的原文在這門課的題庫（CLS.examPool kind）找題，照 classes3d.js 的 optList 算正解是第幾個選項
ANSWER = r"""(([qtext,cid,term,kind])=>{ try{ let all=[]; for(const k of [kind,'final']){ const p=CLS.examPool(cid,term,k); all=p.cls.concat(p.bank,p.ai); if(all.some(x=>String(x.q)===qtext)) break; }
  const q=all.find(x=>String(x.q)===qtext); if(!q) return {err:'題庫找不到這一題',n:all.length};
  const opts=q.type==='tf'||!q.options?['對','錯'].map(t=>({t,v:t})):Object.keys(q.options).map(k=>({t:'（'+k+'）'+q.options[k],v:k}));
  return {id:q.id,answer:q.answer,right:opts.findIndex(o=>String(o.v)===String(q.answer)),opts:opts.map(o=>o.t)}; }catch(e){ return {err:String(e.message)}; } })"""
CNAME2ID = "(nm=>{ try{ const c=CLS.termCourses(GAME.G,'Y4S2').find(c=>String(c.name)===nm||String(c.name).replace(/（重修）/g,'')===nm); return c?c.id:null; }catch(e){ return null; } })"
MSGS = "(n=>(GAME.G.msgs||[]).slice(n).map(m=>({th:m.th||null,from:m.from||null,tag:m.tag||null,day:m.day,h:m.h,text:String(m.text==null?'':m.text)})))"
MUST = "(()=>{ try{ return !!(PHONE.mustOpen&&PHONE.mustOpen(GAME.G)); }catch(e){ return false; } })()"
BTN_TXT = "(s=>{ const e=document.querySelector(s); return e?(e.textContent||'').trim():null; })"
KEYDONE = "(k=>{ try{ return !!CLS.rec(GAME.G).done[k]; }catch(e){ return false; } })"
SEATDESK = "(()=>{ const it=(GAME.E.interactables||[]).find(i=>i.deskStudy&&!i.hidden)||(GAME.E.interactables||[]).find(i=>i.seat&&i.study&&!i.hidden); return it?[it.x,it.z,it.lv|0,it.label||'']:null; })()"

# ---------------------------------------------------------------- 照玩家操作（cc_y4s2final_probe，複製後改：考卷照「考卷發下來。」那一句認課與考試種類；答對題數分期末／補考）
DECL = ('不去了', '晚一點', '自己走過去', '先不', '不用了', '算了', '就這樣', '先這樣', '沒事', '「我晚上要念書。」', '「那天我有事。」', '「我也要念書。」', '「我週六有事。」')
GO_PREFIX = ('出發：', '直接過去：', '接起來：', '上線：')
GO_PICKS = (CONT, '老位子', '坐中間的位子', '還是進去聽', '先自由活動')
Q_RE = re.compile(r'^([1-5])／5　(.*)$', re.S)
PAPER_RE = re.compile(r'^考卷發下來。(.+?)(期末考|補考|期中練習|期中考)')


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
        if not T[i].startswith(GO_PREFIX) and '存檔' not in T[i] and not T[i].startswith('直接去上課') and not T[i].startswith(REVIEW): return i, 'first'
    return live[0], 'first'


async def shoot_both(pg, run, tag, want_txt=None):
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
    await P.phone_tab(pg, cdp, 'places')
    got = await tap_sel_js(pg, cdp, "[...document.querySelectorAll('#phoneBody [data-place]')].find(b=>b.dataset.place.startsWith(%s))" % json.dumps(zone + '|'))
    if not got: await L.phone_away(pg, cdp); run.note('手機「地點」沒有 %s' % zone); return False
    for _ in range(90):
        await pg.wait_for_timeout(1000)
        if (await pg.evaluate("GAME.G.zone")) == zone: break
    await pg.wait_for_timeout(2500); ok = (await pg.evaluate("GAME.G.zone")) == zone
    run.note('手機「地點」→ %s：%s' % (zone, ok)); return ok


async def bed(pg, cdp, run, prefixes, tag):
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
    """對話點過去、選單照規則、考卷【捷徑】讀正解（right＝{'final':n,'makeup':n} 每一場答對幾題）、手機收起來；記作答與截圖"""
    def __init__(self, pg, cdp, run, tag, n0, right, mkl, fdl):
        self.pg, self.cdp, self.run, self.tag, self.n0, self.right, self.mkl, self.fdl = pg, cdp, run, tag, n0, right, mkl, fdl
        self.answered = {}; self.shots = {}; self.picks_log = []; self.paper = None; self.nright = {}
        cn = mkl.get('cname', '海商法與海洋法')
        self.watch = {'notice': mkl['notice'], 'fail618': fdl['fail'].replace('{課名}', cn), 'open': mkl['open'], 'pass': mkl['pass'].replace('{課名}', cn),
                      'passAll': mkl['passAll'], 'mkfail': mkl['fail'].replace('{課名}', cn), 'missed': mkl['missed'].replace('{課名}', cn), 'cert': fdl['cert'], 'bar': fdl['bar']}

    async def handle(self, s, picks=()):
        pg, cdp, run = self.pg, self.cdp, self.run
        R = await rows(pg, max(self.n0, (await pl_len(pg)) - 14))
        for x in R:
            if x['k'] == 'say':
                m = PAPER_RE.match(x['t'])
                if m: self.paper = {'name': m.group(1), 'kind': {'補考': 'makeup', '期末考': 'final'}.get(m.group(2), 'mid'), 'd': x.get('d')}
        if s['ch']:
            T = [o['t'] for o in s['ch']]
            lastsay = next((x for x in reversed(R) if x['k'] == 'say'), None)
            m = Q_RE.match(lastsay['t']) if lastsay else None
            if m and not any(t.startswith(CONT) for t in T):
                pp = self.paper or {}
                cid = await pg.evaluate(CNAME2ID, pp.get('name', ''))
                kind = pp.get('kind', 'final'); i = int(m.group(1)); ek = '%s|%s|%s' % (lastsay.get('d'), cid, kind)
                key = '%s|%d|%s' % (ek, i, m.group(2)[:30])
                a = await pg.evaluate(ANSWER, [m.group(2), cid, 'Y4S2', kind]) if cid else {'err': '認不出考卷的課（%s）' % J(pp)}
                if a.get('err') or a['right'] < 0:
                    run.check('%s：%s 第 %d 題讀得到正解（【捷徑】只讀）' % (self.tag, kind, i), False, J(a))
                    await P.tap_choice(pg, cdp, 0); await pg.wait_for_timeout(900); return True
                rt = a['opts'][a['right']]; scr = [t.strip() for t in T]
                ri = scr.index(rt.strip()) if rt.strip() in scr else -1
                if key in self.answered:   # 同一題又出來（有教科書：第一次選錯、拿掉一個選項再選一次）——照同一個策略再按
                    want_ok = self.answered[key]['correct']
                    k = ri if want_ok and ri >= 0 else next((j for j in range(len(T)) if j != ri), 0)
                    run.note('%s：%s 第 %d 題又出來一次（選項 %s）→ 按第 %d 個' % (self.tag, kind, i, J(scr), k + 1)); self.answered[key].setdefault('again', []).append(k)
                    await P.tap_choice(pg, cdp, k); await pg.wait_for_timeout(900); return True
                if [t.strip() for t in a['opts']] != scr: run.note('%s：%s 第 %d 題畫面選項和題庫不同 %s' % (self.tag, kind, i, J({'screen': T, 'opts': a['opts']})))
                n = self.nright.get(ek, 0); want_ok = n < self.right.get(kind, 5) and ri >= 0
                k = ri if want_ok else next((j for j in range(len(T)) if j != ri), 0)
                if want_ok: self.nright[ek] = n + 1
                self.answered[key] = {'course': cid, 'kind': kind, 'i': i, 'id': a['id'], 'right': ri, 'picked': k, 'correct': k == ri, 'd': lastsay.get('d'), 'h': lastsay.get('h')}
                if i == 1: self.shots['exam_q1_' + kind] = await run.shot(pg, '%s_%s_q1' % (self.tag, kind))
                run.note('%s：%s 考卷第 %d 題（%s %s）【捷徑】讀正解第 %d 個 → 按第 %d 個' % (self.tag, kind, i, cid, a['id'], ri + 1, k + 1))
                await P.tap_choice(pg, cdp, k); await pg.wait_for_timeout(900); return True
            if any(t.startswith(REVIEW) for t in T) and 'review_menu' not in self.shots:
                self.shots['review_menu'] = await shoot_both(pg, run, self.tag + '_review_menu')
            if any(t.startswith(self.mkl['homeOpt']) for t in T) and 'home_opt_menu' not in self.shots:
                self.shots['home_opt_menu'] = await shoot_both(pg, run, self.tag + '_home_opt_menu')
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
            full = next((x['t'] for x in reversed(R) if x['k'] == 'say'), '')
            if full and full.find('海商法與海洋法：') >= 0 and 'grades' not in self.shots:
                self.shots['grades'] = await shoot_both(pg, run, self.tag + '_grades', full)
            else:
                for nm, line in self.watch.items():
                    if full == line and ('w:' + nm) not in self.shots:
                        self.shots['w:' + nm] = await shoot_both(pg, run, '%s_line_%s' % (self.tag, nm), full); break
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(550); return True
        return False


async def trip(pg, cdp, run, drv, tag, key):
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
    run.note('%s：%s 結束 %s；上完 %s' % (tag, key, J(out['end']), out['done']))
    return out


async def sit_desk_review(pg, cdp, run, drv, tag):
    """宿舍書桌坐下（走過去、按互動）→ 書桌選單有「考前總複習」就截圖（Driver 自動）並選它；沒有就選「起身」。回傳選單"""
    it = await pg.evaluate(SEATDESK)
    if not it: run.note('%s：宿舍找不到書桌' % tag); return None
    await L.go_to(pg, cdp, run, it[0], it[1], 0.8, it[3] or '書桌', max_s=150, lv=it[2], stop=lambda s: s['dlg'] or s['choices'])
    for _ in range(4):
        s = await P.ts(pg)
        if s['ch'] or s['dlg']: break
        await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1500)
    menu = None; t0 = time.time()
    while time.time() - t0 < 400:
        s = await P.ts(pg)
        if not (s['ch'] or s['dlg'] or s['busy']): break
        if s['ch'] and menu is None: menu = [o['t'] for o in s['ch']]
        has = s['ch'] and any(o['t'].startswith(REVIEW) for o in s['ch'])
        await drv.handle(s, (REVIEW,) if has else ('起身',))
    run.note('%s：書桌選單 %s' % (tag, J(menu))); return menu


async def phone_sys(pg, cdp, run, drv, tag):
    """手機「訊息」→ 教務處（sys）那一段：文字、直向＋橫向截圖"""
    t = await P.phone_thread(pg, cdp, 'sys')
    a = await run.shot(pg, tag + '_phone_sys_land')
    await pg.set_viewport_size(PORT); await pg.wait_for_timeout(2000)
    b = await run.shot(pg, tag + '_phone_sys_port')
    await pg.set_viewport_size(LAND); await pg.wait_for_timeout(1500); await L.close_panels(pg, cdp)
    run.note('%s：手機教務處 %s' % (tag, J((t.get('text') or '')[-400:])))
    drv.shots['phone_sys'] = [a, b]; return t


# ---------------------------------------------------------------- 主迴圈：一天天過（畢業前照 cc_y4s2final_probe run_days）＋畢業後站著不動；stop(g, rows) 成立＋畫面空下來 POST_S 秒就停
async def play(pg, cdp, run, tag, drv, stop, max_s, review=True):
    t0 = time.time(); last = None; since = time.time(); stuck = None; trips = []; stop_at = None
    gd = await pg.evaluate("STORY.dayOfKey('2029-06-02')"); pack = await pg.evaluate("STORY.dayOfKey('2029-06-01')"); d618 = await pg.evaluate("STORY.dayOfKey('2029-06-18')")
    nmsg0 = (await pg.evaluate(STATE))['nmsg']; lastday = None; wake_wait = 0; rv_try = 0; sys_done = False; remind = None
    while time.time() - t0 < max_s:
        s = await P.ts(pg); g = await pg.evaluate(STATE); F = g['flags']; c = g['clock']
        if c['day'] != lastday:
            if lastday is not None: wake_wait = time.time() + 15
            lastday = c['day']; run.note('%s：換日 %s %s' % (tag, c['key'], hm(c['h'])))
        free = not s['dlg'] and not s['ch'] and not s['busy'] and s['depth'] == 0 and not s['phone']
        if remind is None and g['nmsg'] > nmsg0:
            for m in await pg.evaluate(MSGS, nmsg0):
                if m['tag'] == 'fd_mk_remind' or '明天上午 10:00 補考' in m['text']:
                    remind = {'msg': m, 'seen_at': c, 'free': free}; run.note('%s：補考提醒進來 %s（當時 %s）' % (tag, J(m), J(c)))
                    drv.shots['remind'] = await shoot_both(pg, run, tag + '_remind'); break
        R = await rows(pg, drv.n0)
        if stop(g, R):
            if stop_at is None: stop_at = time.time()
            if free and time.time() - stop_at > ENVI('POST_S', 20): break
        sig = (c['key'], c['h'], s['zone'], s['txt'][:40], tuple(o['t'] for o in s['ch']), s['busy'], s['depth'] > 0, s['phone'], g['nmsg'])
        if sig != last: last = sig; since = time.time()
        elif time.time() - since > ENVI('STUCK_S', 240):
            stuck = {'clock': c, 'ts': {k: s[k] for k in ('dlg', 'txt', 'busy', 'depth', 'phone', 'zone')}, 'ch': s['ch']}
            drv.shots['stuck'] = await run.shot(pg, tag + '_stuck'); break
        if await drv.handle(s): continue
        if not free: await pg.wait_for_timeout(900); continue
        mk = g['mk'] if isinstance(g['mk'], dict) else None
        # 6/18 成績單演完：手機教務處那一段（一次）
        if not sys_done and c['day'] >= d618 and g['grades'] is not None and mk and mk.get('status') == 'pending':
            sys_done = True; await phone_sys(pg, cdp, run, drv, tag); continue
        # 補考排好、還沒總複習：宿舍書桌「考前總複習」（最多試 3 次）
        if review and mk and mk.get('status') == 'pending' and rv_try < 3 and 'review_menu' not in drv.shots and c['zone'] == 'dorm' and not g['homeAt'] \
                and (c['key'] < MK_DAY or c['h'] < 6.9):
            rv_try += 1; await sit_desk_review(pg, cdp, run, drv, '%s_desk%d' % (tag, rv_try)); continue
        if g['pgOn'] or c['day'] >= gd:   # 畢業典禮那天、畢業後篇：站著不動（劇情照時間演、站 2 秒＝跳到下一件事）
            await pg.wait_for_timeout(1500); continue
        if time.time() < wake_wait: await pg.wait_for_timeout(1000); continue
        gl = await pg.evaluate(GOLIST); gl = [x for x in gl if x['key'] not in [t['key'] for t in trips]]
        if gl:
            trips.append(await trip(pg, cdp, run, drv, '%s_%s_%s' % (tag, c['key'].replace('-', ''), gl[0]['cid']), gl[0]['key'])); continue
        if c['zone'] != 'dorm':
            if not await quick_go(pg, cdp, run, 'dorm'): await pg.wait_for_timeout(3000)
            continue
        if c['day'] == pack and not F.get('PACKED_Y4') and c['h'] < 20.5:
            if c['h'] < 17.5: await bed(pg, cdp, run, ('睡到傍晚',), '%s %s %s（6/1 先睡到傍晚再等收拾房間）' % (tag, c['key'], hm(c['h']))); continue
            await pg.wait_for_timeout(2000); continue
        if c['h'] < 17.5: await bed(pg, cdp, run, ('睡到傍晚',), '%s %s %s' % (tag, c['key'], hm(c['h']))); continue
        await bed(pg, cdp, run, ('睡到明天', '睡一下（'), '%s %s %s' % (tag, c['key'], hm(c['h'])))
    g = await pg.evaluate(STATE)
    return {'g': g, 'stuck': stuck, 'trips': trips, 'remind': remind, 'nmsg0': nmsg0, 'timeout': stop_at is None}


def step_rows(R, sid, n='start'):
    return [r for r in R if r['k'] == 'step' and r['t'] == sid and r['n'] == n]


def said_rows(R):
    return [x for x in R if x['k'] == 'say']


async def mk_lines(pg):
    x = await pg.evaluate(LINES); mk = dict(MKL0); mk.update(x.get('mk') or {}); fd = dict(FDL0); fd.update({k: v for k, v in (x.get('fd') or {}).items() if k in FDL0})
    mk['cname'] = x.get('cname') or '海商法與海洋法'; return mk, fd, bool(x.get('mk'))


def dump(tag, **kw):
    kw.setdefault('sha', os.environ.get('SHA', '?')); kw['case'] = tag
    with open(os.path.join(OUT, 'transcript_%s.json' % tag), 'w', encoding='utf-8') as f: json.dump(kw, f, ensure_ascii=False, indent=1)


# ---------------------------------------------------------------- main_pass／main_fail
async def case_main(pg, cdp, run, tag, mk_right, frm):
    mkl, fdl, has = await mk_lines(pg); cn = mkl['cname']
    run.note('%s：頁面有 FD.MK_LINES：%s' % (tag, has))
    if frm == '0527':
        st, d = await state_at(pg, '2029-05-27', 21.0, 'dorm', {'Y4_PATH': 'bar', 'BAR_REG': True})
        await L.load_state(pg, st, quiet_events=False, quiet_phone=False); await pg.evaluate(CLEARP); await pg.wait_for_timeout(3500)
        run.setup('[前置] %s：最小存檔改到 %s 21:00 宿舍（法律系、台灣路線、Y4_PATH bar、BAR_REG true）；之後照玩家一天天過；考卷【捷徑】讀正解，期末故意答對 %d 題、補考答對 %d 題'
                  % (tag, d['key'], ENVI('FINAL_RIGHT', 0), mk_right))
    else:
        st, d, qs = await grad_state(pg, run, GRADE_DAY, 8.5, planned=False)
        await L.load_state(pg, st, quiet_events=False, quiet_phone=False); await pg.evaluate(CLEARP)
        run.setup('[前置] %s：6/18 08:30 宿舍存檔（畢業典禮演過、海商法期末 status done 答對 0 題、qs＝examSeed %d 抽的 %s、Y4_PATH bar、BAR_REG true、PG.done grad）；'
                  '考卷【捷徑】讀正解，補考答對 %d 題' % (tag, SEED, J(qs), mk_right))
    s0 = await pg.evaluate(STATE); await L.phone_away(pg, cdp, tries=2)
    run.note('%s：讀檔後 %s' % (tag, J(s0)))
    n0 = await pl_len(pg); drv = Driver(pg, cdp, run, tag, n0, {'final': ENVI('FINAL_RIGHT', 0), 'makeup': mk_right}, mkl, fdl)

    def stop(g, R):
        mk = g['mk'] if isinstance(g['mk'], dict) else None
        if mk and mk.get('status') in ('pass', 'fail', 'missed'): return True
        if g['grades'] is not None and g['flags'].get('FAIL_DELAY') and not mk: return True   # 修改前：6/18 直接延畢
        return False
    o = await play(pg, cdp, run, tag, drv, stop, ENVI('CASE_MAX', 6000))
    g = o['g']; F = g['flags']; R = await rows(pg, n0); said = said_rows(R); msgs = await pg.evaluate(MSGS, o['nmsg0'])
    mk = g['mk'] if isinstance(g['mk'], dict) else None
    fin = (g['exam'] or {}).get('Y4S2:maritime:final') or {}; mke = (g['exam'] or {}).get('Y4S2:maritime:makeup') or {}
    ans_mk = [v['id'] for v in drv.answered.values() if v['kind'] == 'makeup']; ans_fin = [v['id'] for v in drv.answered.values() if v['kind'] == 'final']
    st_mk = step_rows(R, 'fd_makeup'); st_gr = step_rows(R, 'fd_grades_y4s2')
    g618 = [[x.get('d'), hm(x.get('h')), x['t']] for x in said if x.get('d') == GRADE_DAY][:14]
    dump(tag, rows=R, msgs=msgs, answered=drv.answered, picks=drv.picks_log, start=s0, end=g, trips=o['trips'], remind=o['remind'], stuck=o['stuck'], shots=drv.shots)
    run.note('%s：6/18 旁白 %s' % (tag, J(g618)))
    run.note('%s：補考那一場的台詞 %s' % (tag, J([[x.get('d'), hm(x.get('h')), x['t']] for x in said if x.get('d') == MK_DAY][:24])))
    run.note('%s：結束 %s' % (tag, J({k: g[k] for k in ('clock', 'flags', 'grades', 'failed', 'delayed', 'pend')})))
    run.check('%s：沒有卡住' % tag, o['stuck'] is None, J(o['stuck']))
    run.check('%s：跑到補考結果（沒有逾時）' % tag, not o['timeout'], J(g['clock']))
    if frm == '0527':
        run.check('%s：期末海商法照玩家考完、答對 0 題（status done、correct 0）' % tag, fin.get('status') == 'done' and (fin.get('correct') or 0) == 0, J(fin))
    run.check('%s：6/18 成績單有出現（PG 步驟 fd_grades_y4s2、「海商法與海洋法：」那一句）' % tag, bool(st_gr) and any('海商法與海洋法：' in x[2] for x in g618), J(g618[:4]))
    run.check('%s：6/18 不延畢、排補考（FD_MAKEUP pending→之後；6/18 沒有 cert 那一句）' % tag,
              bool(mk) and not any(x[2] == fdl['cert'] for x in g618), J({'mk': mk, 'g618': g618}))
    run.check('%s：6/18 旁白「%s」＋補考通知' % (tag, fdl['fail'].replace('{課名}', cn)), any(x[2] == fdl['fail'].replace('{課名}', cn) for x in g618) and any(x[2] == mkl['notice'] for x in g618), J(g618))
    sysm = [m for m in msgs if m['tag'] == 'fd_mk_sys' or m['text'].startswith('【教務處】大四下補考通知')]
    run.check('%s：手機收到教務處補考通知（6/18）' % tag, bool(sysm), J(sysm))
    run.check('%s：總複習選單提示「%s 1 科」' % (tag, mkl['reviewWhat']), any(REVIEW in x['t'] and (mkl['reviewWhat'] + ' 1 科') in x['t'] for x in R if x['k'] == 'choose'),
              J([x['t'] for x in R if x['k'] == 'choose' and REVIEW in x['t']][:3]))
    rm = o['remind']
    run.check('%s：6/25 20:00 補考提醒（手機）' % tag, bool(rm) and rm['msg'].get('h') is not None and abs(float(rm['msg']['h']) - 20) < 0.02
              and (await P.day_of(pg, REMIND_DAY))['d'] == rm['msg'].get('day'), J(rm))
    run.check('%s：6/26 09:30 停下來演補考（fd_makeup 開始在 6/26 09:30～10:00）' % tag, bool(st_mk) and st_mk[0].get('d') == MK_DAY and 9.49 <= float(st_mk[0].get('h') or 0) < 10.0, J(st_mk))
    op = [x for x in said if x['t'] == mkl['open']]
    run.check('%s：10:00 開場「%s」' % (tag, mkl['open']), bool(op) and op[0].get('d') == MK_DAY and abs(float(op[0].get('h') or 0) - 10) < 0.05, J(op[:1]))
    run.check('%s：補考五題（考卷「海商法與海洋法補考」）' % tag, len(ans_mk) == 5 and mke.get('status') == 'done', J({'answered': ans_mk, 'rec': mke}))
    if mk_right > 0:
        run.check('%s：補考過：FD_MAKEUP pass、成績「%s」、沒有延畢、BAR_REG true、PG.delayed false' % (tag, mkl['gradePass']),
                  bool(mk) and mk.get('status') == 'pass' and (g['grades'] or {}).get('maritime') == mkl['gradePass'] and not F.get('FAIL_DELAY') and F.get('BAR_REG') is True and g['delayed'] is False,
                  J({'mk': mk, 'grades': g['grades'], 'flags': F, 'delayed': g['delayed']}))
        run.check('%s：旁白「%s」「%s」「%s」' % (tag, mkl['pass'].replace('{課名}', cn), mkl['passAll'], mkl['passBar']),
                  all(any(x['t'] == t for x in said) for t in (mkl['pass'].replace('{課名}', cn), mkl['passAll'], mkl['passBar'])), J([x['t'] for x in said if x.get('d') == MK_DAY][-6:]))
        # nodup
        fq = fin.get('qs') or ans_fin; mq = mke.get('qs') or ans_mk; inter = sorted(set(fq) & set(mq))
        run.note('%s：nodup 期末 %s；補考 %s（畫面讀到 %s）；交集 %s' % (tag, J(fq), J(mke.get('qs')), J(ans_mk), J(inter)))
        run.check('%s（nodup）：補考 5 題和期末 5 題沒有重複（海商法題庫 13 題）' % tag, len(fq) == 5 and len(mq) == 5 and not inter, J({'final': fq, 'makeup': mq, 'inter': inter}))
        run.check('%s（nodup）：畫面讀到的補考題號＝存檔的補考題號' % tag, sorted(ans_mk) == sorted(mke.get('qs') or []), J({'screen': ans_mk, 'rec': mke.get('qs')}))
    else:
        run.check('%s：補考沒過：當場延畢（FAIL_DELAY、FAIL_DELAY_COURSES＝[maritime]、FAIL_DELAY_DAY＝6/26、BAR_REG false、BARCANCEL、PG.delayed）' % tag,
                  bool(mk) and mk.get('status') == 'fail' and F.get('FAIL_DELAY') is True and F.get('FAIL_DELAY_COURSES') == ['maritime']
                  and F.get('FAIL_DELAY_DAY') == (await P.day_of(pg, MK_DAY))['d'] and F.get('BAR_REG') is False and F.get('FAIL_DELAY_BARCANCEL') is True and g['delayed'] is True,
                  J({'mk': mk, 'flags': F, 'delayed': g['delayed']}))
        run.check('%s：成績「%s」；旁白「%s」＋cert＋bar' % (tag, mkl['gradeFail'], mkl['fail'].replace('{課名}', cn)),
                  (g['grades'] or {}).get('maritime') == mkl['gradeFail'] and all(any(x['t'] == t for x in said) for t in (mkl['fail'].replace('{課名}', cn), fdl['cert'], fdl['bar'])),
                  J({'grades': g['grades'], 'lines': [x['t'] for x in said if x.get('d') == MK_DAY][-6:]}))
    run.note('%s：截圖 %s' % (tag, J(drv.shots)))


# ---------------------------------------------------------------- noshow
async def case_noshow(pg, cdp, run):
    tag = 'noshow'; mkl, fdl, has = await mk_lines(pg); cn = mkl['cname']
    st, d, qs = await grad_state(pg, run, MK_DAY, 11.25, planned=True)
    await L.load_state(pg, st, quiet_events=False, quiet_phone=False); await pg.evaluate(CLEARP)
    g1 = await pg.evaluate(STATE)
    run.setup('[前置] %s：6/26 11:15 宿舍存檔（補考已排好 FD_MAKEUP pending、PG.done fd_grades_y4s2、成績 0 分（不及格）、手機教務處通知；照碼「讀檔時已經過了」＝沒去）' % tag)
    run.note('%s：讀檔那一刻 %s' % (tag, J(g1)))
    n0 = await pl_len(pg); drv = Driver(pg, cdp, run, tag, n0, {'final': 0, 'makeup': 5}, mkl, fdl)
    o = await play(pg, cdp, run, tag, drv, lambda g, R: bool(step_rows(R, 'fd_mk_missed', 'end')), ENVI('NOSHOW_MAX', 600), review=False)
    g = o['g']; F = g['flags']; R = await rows(pg, n0); said = said_rows(R); mk = g['mk'] if isinstance(g['mk'], dict) else None
    drv.shots['end'] = await shoot_both(pg, run, tag + '_end')
    dump(tag, rows=R, start=g1, end=g, stuck=o['stuck'], shots=drv.shots)
    ln = [[x.get('d'), hm(x.get('h')), x['t']] for x in said][:12]
    run.note('%s：之後的台詞 %s；步驟 %s' % (tag, J(ln), J([[x['t'], x['n'], x.get('d'), hm(x.get('h'))] for x in R if x['k'] == 'step'])))
    run.check('%s：沒有演補考（沒有 fd_makeup 開始、沒有考卷）' % tag, not step_rows(R, 'fd_makeup') and not drv.answered, J(step_rows(R, 'fd_makeup')))
    run.check('%s：沒去＝延畢（FD_MAKEUP missed、FAIL_DELAY、FAIL_DELAY_COURSES＝[maritime]、BAR_REG false、PG.delayed）' % tag,
              bool(mk) and mk.get('status') == 'missed' and F.get('FAIL_DELAY') is True and F.get('FAIL_DELAY_COURSES') == ['maritime'] and F.get('BAR_REG') is False and g['delayed'] is True,
              J({'mk': mk, 'flags': F, 'delayed': g['delayed']}))
    run.check('%s：成績「%s」' % (tag, mkl['gradeMissed']), (g['grades'] or {}).get('maritime') == mkl['gradeMissed'], J(g['grades']))
    sm = step_rows(R, 'fd_mk_missed')
    run.check('%s：下一個停點演「%s」＋cert（fd_mk_missed）' % (tag, mkl['missed'].replace('{課名}', cn)),
              bool(sm) and any(x['t'] == mkl['missed'].replace('{課名}', cn) for x in said) and any(x['t'] == fdl['cert'] for x in said), J({'step': sm, 'lines': ln}))
    run.check('%s：沒有卡住' % tag, o['stuck'] is None, J(o['stuck']))


# ---------------------------------------------------------------- home
async def home_menu(pg, cdp, run, drv, tag, max_s=90):
    """等到家裡的選單（有「睡覺」「存檔」那一個）出來；中間的對話點過去。回傳選項（不選）"""
    t0 = time.time()
    while time.time() - t0 < max_s:
        s = await P.ts(pg)
        if s['ch'] and any(o['t'] == '睡覺' for o in s['ch']) and any(o['t'] == '存檔' for o in s['ch']): return [o['t'] for o in s['ch']], s
        if s['ch']:   # 不是家裡的選單（起床、confirmMiss…）：照規則選
            await drv.handle(s, ('照樣', '先起床')); continue
        if s['dlg'] or s['phone']: await drv.handle(s); continue
        await pg.wait_for_timeout(800)
    return None, None


async def home_pick(pg, cdp, run, drv, tag, opts, prefix):
    k = next((i for i, t in enumerate(opts) if t.startswith(prefix)), None)
    c = await P.clock(pg); run.note('%s %s %s 家裡選單 %s → %s' % (tag, c['key'], hm(c['h']), J(opts), opts[k] if k is not None else '（沒有）'))
    if k is None: return False
    await P.tap_choice(pg, cdp, k); await pg.wait_for_timeout(1200); return True


async def home_run_until_menu(pg, cdp, run, drv, tag, max_s=900):
    """選了一項以後：對話、考卷照 Driver 處理，直到家裡的選單再出來（或離開家）"""
    t0 = time.time()
    while time.time() - t0 < max_s:
        s = await P.ts(pg)
        if s['ch'] and any(o['t'] == '睡覺' for o in s['ch']) and any(o['t'] == '存檔' for o in s['ch']): return [o['t'] for o in s['ch']]
        if not await pg.evaluate("!!(typeof HOME!=='undefined'&&HOME.at(GAME.G))") and not (s['dlg'] or s['ch'] or s['busy']): return None
        if await drv.handle(s, ('照樣',)): continue
        await pg.wait_for_timeout(800)
    return 'timeout'


async def case_home(pg, cdp, run, sub):
    tag = 'home_' + sub; mkl, fdl, has = await mk_lines(pg); cn = mkl['cname']; opt = mkl['homeOpt']
    when = {'go': (MK_DAY, 8.5), 'sleep': (REMIND_DAY, 21.0), 'late': (MK_DAY, 11.25), 'rest': (MK_DAY, 8.5)}[sub]
    st, d, qs = await grad_state(pg, run, when[0], when[1], planned=True, home=True)
    await L.load_state(pg, st, quiet_events=False, quiet_phone=False); await pg.evaluate(CLEARP)
    g1 = await pg.evaluate(STATE)
    run.setup('[前置] %s：%s %s 人在臺北的家（G.home.at＝true；6/26 是週二，一般回不了家）、補考已排好 pending、PG.done fd_grades_y4s2、海商法期末答對 0 題（qs %s）'
              % (tag, when[0], hm(when[1]), J(qs)))
    n0 = await pl_len(pg); drv = Driver(pg, cdp, run, tag, n0, {'final': 0, 'makeup': ENVI('MK_RIGHT', 5)}, mkl, fdl)
    ops, s = await home_menu(pg, cdp, run, drv, tag)
    g2 = await pg.evaluate(STATE)
    run.note('%s：讀檔那一刻 %s；第一個家裡選單 %s；FD.homeMakeupOpt＝%s' % (tag, J(g1['clock']), J(ops), J(g2['homeOpt'])))
    run.check('%s：家裡的選單出來了' % tag, bool(ops), J(await P.ts(pg)))
    if not ops: dump(tag, rows=await rows(pg, n0), start=g1, shots=drv.shots); return
    drv.shots['menu0'] = await shoot_both(pg, run, tag + '_menu0')
    has_opt = any(t.startswith(opt) for t in ops)
    out = {'menu0': ops, 'menus': []}
    if sub == 'go':
        run.check('%s：6/26 08:30 家裡選單有「%s」（修改前 4174ffe89 預期 FAIL）' % (tag, opt), has_opt, J(ops))
        if has_opt:
            await home_pick(pg, cdp, run, drv, tag, ops, opt)
            m2 = await home_run_until_menu(pg, cdp, run, drv, tag); out['menu_after'] = m2
            g = await pg.evaluate(STATE); mk = g['mk'] if isinstance(g['mk'], dict) else None; R = await rows(pg, n0)
            drv.shots['menu_after'] = await shoot_both(pg, run, tag + '_menu_after')
            run.check('%s：按了＝演補考（開場那一句、五題）' % tag, any(x['t'] == mkl['open'] for x in said_rows(R)) and len([v for v in drv.answered.values() if v['kind'] == 'makeup']) == 5, J(drv.answered))
            run.check('%s：考完回到家裡的選單、人還在家' % tag, isinstance(m2, list) and g['homeAt'], J({'menu': m2, 'homeAt': g['homeAt'], 'clock': g['clock']}))
            run.check('%s：已經考完：選單沒有「%s」' % (tag, opt), isinstance(m2, list) and not any(t.startswith(opt) for t in m2), J(m2))
            run.check('%s：補考結果照答題（MK_RIGHT %d）：FD_MAKEUP %s、時間 11:00' % (tag, ENVI('MK_RIGHT', 5), 'pass' if ENVI('MK_RIGHT', 5) else 'fail'),
                      bool(mk) and mk.get('status') == ('pass' if ENVI('MK_RIGHT', 5) else 'fail') and abs(g['clock']['h'] - 11) < 0.3, J({'mk': mk, 'clock': g['clock'], 'flags': g['flags']}))
    elif sub == 'sleep':
        run.check('%s：6/25 21:00 家裡選單沒有「%s」（6/26 以外）' % (tag, opt), not has_opt, J(ops))
        await home_pick(pg, cdp, run, drv, tag, ops, '睡覺')
        m2 = await home_run_until_menu(pg, cdp, run, drv, tag); out['menu_after'] = m2
        g = await pg.evaluate(STATE); mk = g['mk'] if isinstance(g['mk'], dict) else None; R = await rows(pg, n0); sm = step_rows(R, 'fd_makeup')
        drv.shots['menu_after'] = await shoot_both(pg, run, tag + '_menu_after')
        run.note('%s：睡覺以後 步驟 %s；日期卡 %s' % (tag, J([[x['t'], x['n'], x.get('d'), hm(x.get('h'))] for x in R if x['k'] == 'step']), J([[x.get('d'), x['n'], x['t']] for x in R if x['k'] == 'card'])))
        run.check('%s：在家睡覺 → 直接跳到 6/26 09:30 那一場（fd_makeup 開始 6/26 09:30～10:00）' % tag, bool(sm) and sm[0].get('d') == MK_DAY and 9.49 <= float(sm[0].get('h') or 0) < 10.0, J(sm))
        run.check('%s：考完 FD_MAKEUP 不是 pending／missed、回到家裡的選單' % tag, bool(mk) and mk.get('status') in ('pass', 'fail') and isinstance(m2, list), J({'mk': mk, 'menu': m2, 'clock': g['clock']}))
    elif sub == 'late':
        run.check('%s：6/26 11:15 家裡選單沒有「%s」（11:00 以後）' % (tag, opt), not has_opt, J(ops))
        run.note('%s：FD_MAKEUP（在家、11:15）＝%s' % (tag, J(g2['mk'])))
    elif sub == 'rest':
        run.check('%s：6/26 08:30 家裡選單有「%s」（修改前 4174ffe89 預期 FAIL）' % (tag, opt), has_opt, J(ops))
        cur = ops
        for i in range(6):
            c = await P.clock(pg)
            out['menus'].append([c['key'], hm(c['h']), cur])
            if c['key'] > MK_DAY or c['h'] >= 11.0: break
            if not await home_pick(pg, cdp, run, drv, tag, cur, '在家休息一下'): break
            cur = await home_run_until_menu(pg, cdp, run, drv, tag)
            if not isinstance(cur, list): break
        g = await pg.evaluate(STATE)
        drv.shots['menu_late'] = await shoot_both(pg, run, tag + '_menu_after11')
        run.note('%s：每一輪選單 %s' % (tag, J(out['menus'])))
        run.check('%s：拖到 11:00 以後選單沒有「%s」' % (tag, opt), isinstance(cur, list) and g['clock']['h'] >= 11 and not any(t.startswith(opt) for t in cur), J({'menu': cur, 'clock': g['clock']}))
        run.note('%s：11:00 以後還在家時 FD_MAKEUP＝%s、FAIL_DELAY＝%s' % (tag, J(g['mk']), g['flags'].get('FAIL_DELAY')))
        if isinstance(cur, list) and await home_pick(pg, cdp, run, drv, tag, cur, '回宿舍'):
            o = await play(pg, cdp, run, tag, drv, lambda g, R: bool(step_rows(R, 'fd_mk_missed', 'end')), 600, review=False)
            g = o['g']; R = await rows(pg, n0); said = said_rows(R); mk = g['mk'] if isinstance(g['mk'], dict) else None
            run.check('%s：一直在家休息＝沒去：延畢（FD_MAKEUP missed、FAIL_DELAY、BAR_REG false）' % tag,
                      bool(mk) and mk.get('status') == 'missed' and g['flags'].get('FAIL_DELAY') is True and g['flags'].get('BAR_REG') is False, J({'mk': mk, 'flags': g['flags']}))
            run.check('%s：回宿舍以後演「%s」' % (tag, mkl['missed'].replace('{課名}', cn)), any(x['t'] == mkl['missed'].replace('{課名}', cn) for x in said), J([x['t'] for x in said][-8:]))
            run.check('%s：沒有演補考' % tag, not step_rows(R, 'fd_makeup') and not drv.answered, J(step_rows(R, 'fd_makeup')))
    R = await rows(pg, n0)
    dump(tag, rows=R, start=g1, menu=out, end=await pg.evaluate(STATE), answered=drv.answered, shots=drv.shots)
    run.note('%s：截圖 %s' % (tag, J(drv.shots)))


# ---------------------------------------------------------------- rollcall_fail
async def case_rollcall(pg, cdp, run):
    tag = 'rollcall_fail'; mkl, fdl, has = await mk_lines(pg); only = ENVI('ROLL_ONLY', 0) == 1
    st, d, qs = await grad_state(pg, run, GRADE_DAY, 8.5, planned=False, retake=True, fail_maritime=not only)
    await L.load_state(pg, st, quiet_events=False, quiet_phone=False); await pg.evaluate(CLEARP)
    g1 = await pg.evaluate(STATE)
    want = ['japanese_2'] if only else ['japanese_2', 'maritime']
    run.setup('[前置] %s：6/18 08:30 宿舍存檔（同 main_fail）＋大四下排了看出席的重修日文二（courses.retake term Y4S2 週三 pm1、出席 0）；海商法%s'
              % (tag, '沒被當（答對 3 題）' if only else '期末答對 0 題'))
    run.check('%s：前置成立（failedIn(Y4S2)＝%s）' % (tag, J(want)), isinstance(g1['failed'], list) and sorted(g1['failed']) == want, J(g1['failed']))
    n0 = await pl_len(pg); drv = Driver(pg, cdp, run, tag, n0, {'final': 0, 'makeup': 5}, mkl, fdl)
    t_end = {'t': None}

    def stop(g, R):
        if g['grades'] is None: return False
        if t_end['t'] is None: t_end['t'] = time.time()
        return time.time() - t_end['t'] > ENVI('ROLL_PLAY', 300)
    o = await play(pg, cdp, run, tag, drv, stop, ENVI('ROLL_PLAY', 300) + 900, review=False)
    g = o['g']; F = g['flags']; R = await rows(pg, n0); said = said_rows(R); msgs = await pg.evaluate(MSGS, o['nmsg0'])
    drv.shots['end'] = await shoot_both(pg, run, tag + '_end')
    dump(tag, rows=R, msgs=msgs, start=g1, end=g, stuck=o['stuck'], shots=drv.shots)
    g618 = [[x.get('d'), hm(x.get('h')), x['t']] for x in said if x.get('d') == GRADE_DAY][:12]
    run.note('%s：6/18 旁白 %s；結束 %s' % (tag, J(g618), J({k: g[k] for k in ('clock', 'flags', 'grades', 'pend')})))
    run.check('%s：6/18 照舊直接延畢（FAIL_DELAY、FAIL_DELAY_COURSES＝%s、BAR_REG false、cert 那一句）' % (tag, J(want)),
              F.get('FAIL_DELAY') is True and sorted(F.get('FAIL_DELAY_COURSES') or []) == want and F.get('BAR_REG') is False and any(x[2] == fdl['cert'] for x in g618), J({'flags': F, 'g618': g618}))
    run.check('%s：沒有補考（沒有 FD_MAKEUP、沒有補考通知、提醒、fd_makeup 步驟）' % tag,
              not F.get('FD_MAKEUP') and not any(x[2] == mkl['notice'] for x in g618) and not any(m['tag'] in ('fd_mk_sys', 'fd_mk_remind') for m in msgs)
              and not step_rows(R, 'fd_makeup') and not any(p[0] == 'fd_makeup' for p in (g['pend'] or [])), J({'mk': F.get('FD_MAKEUP'), 'msgs': [m for m in msgs if 'fd_mk' in str(m['tag'])], 'pend': g['pend']}))
    run.check('%s：沒有卡住' % tag, o['stuck'] is None, J(o['stuck']))
    run.note('%s：跑到 %s；截圖 %s' % (tag, J(g['clock']), J(drv.shots)))


CASEFN = {'main_pass': lambda pg, cdp, run: case_main(pg, cdp, run, 'main_pass', ENVI('MK_RIGHT', 5), os.environ.get('MAIN_FROM', '0527')),
          'main_fail': lambda pg, cdp, run: case_main(pg, cdp, run, 'main_fail', 0, os.environ.get('MAIN_FAIL_FROM', '0618')),
          'noshow': case_noshow, 'rollcall_fail': case_rollcall}
for _s in ('go', 'sleep', 'late', 'rest'): CASEFN['home_' + _s] = (lambda v: (lambda pg, cdp, run: case_home(pg, cdp, run, v)))(_s)


# ---------------------------------------------------------------- BB 08:59 加的四個（補考時間窗：CC_audit_4174.md 疑點 1～3、5；Node 重現 audit_makeup_timeskip.js）
SEATSTUDY = "(()=>{ const P=GAME.E.player.obj.position; const L=(GAME.E.interactables||[]).filter(i=>i.seat&&i.study&&!i.hidden).map(i=>[i.x,i.z,i.lv|0,i.label||'',Math.hypot(i.x-P.x,i.z-P.z)]); L.sort((a,b)=>a[4]-b[4]); return L[0]||null; })()"
PGSTARTED = "(()=>(window.__PL||[]).filter(r=>r.k==='step'&&r.t==='fd_makeup').length)()"


async def load_fast(pg, st):
    """讀檔以後畢業後篇站 2 秒就會跳到下一件事（6/26 08:30 → 09:30 補考那一場）：讀完馬上開始動作（走路／開手機），讀檔與第一個動作之間不等"""
    await L.load_state(pg, st, quiet_events=False, quiet_phone=False); await pg.evaluate(CLEARP)


async def seat_open(pg, cdp, run, drv, tag):
    """照玩家走到最近的自習座位、按互動，等座位選單（不選）。回傳選項；補考那一場先跑起來＝None（記下來）"""
    it = await pg.evaluate(SEATSTUDY)
    if not it: run.note('%s：這一區找不到自習座位' % tag); return None
    await L.go_to(pg, cdp, run, it[0], it[1], 0.8, it[3] or '自習座位', max_s=150, lv=it[2], stop=lambda s: s['dlg'] or s['choices'])
    for _ in range(4):
        s = await P.ts(pg)
        if s['ch'] or s['dlg']: break
        await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1500)
    for _ in range(12):
        if await pg.evaluate(PGSTARTED): run.note('%s：座位選單出來以前補考那一場就開始了（站著不動被跳時間；前置沒成立）' % tag); return None
        s = await P.ts(pg)
        if s['ch']: return [o['t'] for o in s['ch']]
        if s['dlg']: await L.tap(pg, cdp, '#dlg')
        await pg.wait_for_timeout(700)
    return None


async def pick_txt(pg, cdp, run, tag, prefix):
    s = await P.ts(pg); T = [o['t'] for o in s['ch']] if s['ch'] else []
    k = next((i for i, t in enumerate(T) if t.startswith(prefix)), None)
    run.note('%s：選單 %s → %s' % (tag, J(T), T[k] if k is not None else '（沒有 %s）' % prefix))
    if k is None: return False
    await P.tap_choice(pg, cdp, k); await pg.wait_for_timeout(1300); return True


def choose_rows(R):
    return [[x.get('d'), hm(x.get('h')), x['t']] for x in R if x['k'] == 'choose']


async def after_skip(pg, cdp, run, tag, drv, n0, max_s=600):
    """跳時間以後：照玩家點過（「會錯過」的確認選「照樣」）、站著不動，直到補考有結果（pass／fail／missed）且缺考旁白演完、或時間過了 12:30"""
    def stop(g, R):
        mk = g['mk'] if isinstance(g['mk'], dict) else None; c = g['clock']
        if mk and mk.get('status') == 'missed': return bool(step_rows(R, 'fd_mk_missed', 'end'))
        if mk and mk.get('status') in ('pass', 'fail'): return True
        return c['key'] > MK_DAY or c['h'] >= 12.5
    return await play(pg, cdp, run, tag, drv, stop, max_s, review=False)


def result_note(run, tag, g, R):
    mk = g['mk'] if isinstance(g['mk'], dict) else None; said = said_rows(R)
    warn = [[x.get('d'), hm(x.get('h')), x['t']] for x in said if x['t'].startswith('會錯過') or '會錯過' in x['t'] or '補考' in x['t']]
    run.note('%s：結果 %s；提到補考／會錯過的台詞 %s；步驟 %s' % (tag, J({'clock': g['clock'], 'mk': mk, 'FAIL_DELAY': g['flags'].get('FAIL_DELAY'), 'BAR_REG': g['flags'].get('BAR_REG'), 'grades': g['grades']}),
             J(warn[:10]), J([[x['t'], x['n'], x.get('d'), hm(x.get('h'))] for x in R if x['k'] == 'step'])))
    return mk, warn


async def case_study3h(pg, cdp, run):
    tag = 'study3h'; mkl, fdl, has = await mk_lines(pg)
    st, d, qs = await grad_state(pg, run, MK_DAY, 8.5, planned=True)
    st['zone'] = 'library'
    run.setup('[前置] %s：6/26 08:30 總圖閱覽室（library）存檔，補考 pending（同 noshow 的旗標）；讀完馬上照玩家走到最近的自習座位' % tag)
    await load_fast(pg, st)
    n0 = await pl_len(pg); drv = Driver(pg, cdp, run, tag, n0, {'final': 0, 'makeup': ENVI('MK_RIGHT', 5)}, mkl, fdl)
    ops = await seat_open(pg, cdp, run, drv, tag)
    run.check('%s：前置成立（座位選單出來、補考那一場還沒開始、FD_MAKEUP pending）' % tag, bool(ops), J(await pg.evaluate(STATE)))
    if not ops: dump(tag, rows=await rows(pg, n0), shots=drv.shots); return
    drv.shots['seat_menu'] = await shoot_both(pg, run, tag + '_seat_menu')
    await pick_txt(pg, cdp, run, tag, '讀書')
    s = await P.ts(pg); lens = [{'t': o['t'], 'dim': o['dim']} for o in (s['ch'] or [])]
    R = await rows(pg, n0); lens_h = (choose_rows(R) or [[None, None, '']])[-1][2]
    drv.shots['study_menu'] = await shoot_both(pg, run, tag + '_study_menu')
    run.note('%s：讀書長度選單（含 hint）%s；變灰 %s' % (tag, J(lens_h), J(lens)))
    o3 = [x for x in lens_h.split('｜') if x.startswith('讀 3 小時')]
    run.check('%s：「讀 3 小時」變灰或提示寫會錯過補考（修改前預期 FAIL）' % tag, any(x['t'].startswith('讀 3 小時') and x['dim'] for x in lens) or any('補考' in x for x in o3), J({'opt3': o3, 'dim': lens}))
    run.check('%s：有一項停在補考前（「讀到…補考…前」）（修改前預期 FAIL）' % tag, any('補考' in x for x in lens_h.split('｜') if not x.startswith('讀 3 小時')), J(lens_h))
    if not await pick_txt(pg, cdp, run, tag, '讀 3 小時'): dump(tag, rows=R, shots=drv.shots); return
    o = await after_skip(pg, cdp, run, tag, drv, n0)
    g = o['g']; R = await rows(pg, n0); mk, warn = result_note(run, tag, g, R)
    drv.shots['end'] = await shoot_both(pg, run, tag + '_end')
    run.check('%s：讀書沒有在玩家不知情下跳過補考（沒有「缺考＋事前沒有任何提到補考的提示」）' % tag,
              not (mk and mk.get('status') == 'missed' and not any('補考' in x for x in lens_h.split('｜'))), J({'mk': mk, 'hints': lens_h}))
    dump(tag, rows=R, start=None, end=g, study_menu=lens_h, dim=lens, shots=drv.shots, stuck=o['stuck'])


async def case_skipnoon(pg, cdp, run, via):
    tag = 'skipnoon_' + via; mkl, fdl, has = await mk_lines(pg)
    zone = 'dorm' if via == 'phone' else 'library'
    st, d, qs = await grad_state(pg, run, MK_DAY, 8.5, planned=True)
    st['zone'] = zone
    if via == 'seat': st['slots'] = {'day': d['d'], 'used': {'am': 1, 'pm': 0, 'ev': 0}}
    run.setup('[前置] %s：6/26 08:30 %s 存檔，補考 pending%s；讀完馬上%s' % (tag, zone, '、今天上午的時段次數已用掉（G.slots.used.am＝1：座位才會出「待到中午」）' if via == 'seat' else '',
              '打開手機「今天」→「跳過時間」' if via == 'phone' else '照玩家走到自習座位'))
    await load_fast(pg, st)
    n0 = await pl_len(pg); drv = Driver(pg, cdp, run, tag, n0, {'final': 0, 'makeup': ENVI('MK_RIGHT', 5)}, mkl, fdl)
    if via == 'phone':
        txt = await P.phone_tab(pg, cdp, 'today')
        btns = await pg.evaluate("[...document.querySelectorAll('#phoneBody [data-skip]')].map(b=>[b.dataset.skip,(b.textContent||'').trim()])")
        started = await pg.evaluate(PGSTARTED)
        run.check('%s：前置成立（手機「今天」有「跳過時間」、補考那一場還沒開始）' % tag, bool(btns) and not started, J({'btns': btns, 'started': started}))
        await pg.evaluate("(()=>{ const b=[...document.querySelectorAll('#phoneBody [data-skip]')].find(b=>/中午/.test(b.textContent)); if(b) b.scrollIntoView({block:'center'}); })()")
        drv.shots['skip_menu'] = await shoot_both(pg, run, tag + '_phone_skip')
        run.note('%s：手機「今天」%s；跳過按鈕 %s' % (tag, J(txt[-500:]), J(btns)))
        got = await tap_sel_js(pg, cdp, "[...document.querySelectorAll('#phoneBody [data-skip]')].find(b=>/中午/.test(b.textContent))")
        run.note('%s：按「%s」' % (tag, got))
        if not got: dump(tag, rows=await rows(pg, n0), shots=drv.shots); return
    else:
        ops = await seat_open(pg, cdp, run, drv, tag)
        has_n = bool(ops) and any(t.startswith('待到中午') for t in ops)
        run.check('%s：前置成立（座位選單有「待到中午」、補考那一場還沒開始）' % tag, has_n, J(ops))
        if not ops: dump(tag, rows=await rows(pg, n0), shots=drv.shots); return
        drv.shots['seat_menu'] = await shoot_both(pg, run, tag + '_seat_menu')
        if not await pick_txt(pg, cdp, run, tag, '待到中午'): dump(tag, rows=await rows(pg, n0), shots=drv.shots); return
    # 跳的那一下：有沒有「會錯過」確認、停在哪裡
    await pg.wait_for_timeout(1500); s = await P.ts(pg)
    if s['ch'] or s['dlg']: drv.shots['after_tap'] = await shoot_both(pg, run, tag + '_after_tap')
    o = await after_skip(pg, cdp, run, tag, drv, n0)
    g = o['g']; R = await rows(pg, n0); mk, warn = result_note(run, tag, g, R)
    drv.shots['end'] = await shoot_both(pg, run, tag + '_end')
    st_mk = step_rows(R, 'fd_makeup')
    run.check('%s：跳時間停在補考（09:30 那一場有演，或跳之前有提到補考的確認）（修改前預期 FAIL）' % tag, bool(st_mk) or bool(warn), J({'step': st_mk, 'warn': warn, 'mk': mk}))
    run.note('%s：跳時間時的選單 %s' % (tag, J(choose_rows(R)[:6])))
    dump(tag, rows=R, end=g, shots=drv.shots, stuck=o['stuck'])


async def case_homerest(pg, cdp, run):
    tag = 'homerest'; mkl, fdl, has = await mk_lines(pg); cn = mkl['cname']; opt = mkl['homeOpt']
    st, d, qs = await grad_state(pg, run, MK_DAY, 10.5, planned=True, home=True)
    await load_fast(pg, st)
    run.setup('[前置] %s：6/26 10:30 人在臺北的家（G.home.at）、補考 pending' % tag)
    n0 = await pl_len(pg); drv = Driver(pg, cdp, run, tag, n0, {'final': 0, 'makeup': ENVI('MK_RIGHT', 5)}, mkl, fdl)
    ops, s = await home_menu(pg, cdp, run, drv, tag)
    run.check('%s：前置成立（家裡選單有「%s」）' % (tag, opt), bool(ops) and any(t.startswith(opt) for t in ops), J(ops))
    if not ops: dump(tag, rows=await rows(pg, n0), shots=drv.shots); return
    drv.shots['menu0'] = await shoot_both(pg, run, tag + '_menu0')
    await home_pick(pg, cdp, run, drv, tag, ops, '在家休息一下')
    await pg.wait_for_timeout(1500); s = await P.ts(pg)
    if s['dlg'] or s['ch']: drv.shots['confirm'] = await shoot_both(pg, run, tag + '_confirm')
    m2 = await home_run_until_menu(pg, cdp, run, drv, tag)
    R = await rows(pg, n0); said = said_rows(R)
    warn = [x['t'] for x in said if x['t'].startswith('會錯過')]
    g = await pg.evaluate(STATE)
    drv.shots['menu_after'] = await shoot_both(pg, run, tag + '_menu_after')
    run.note('%s：休息後 %s；R1 預告 %s；選單 %s' % (tag, J({'clock': g['clock'], 'mk': g['mk']}), J(warn), J(m2)))
    run.check('%s：選「在家休息一下」前的 R1 預告列了補考（修改前預期 FAIL）' % tag, any('補考' in w for w in warn), J(warn))
    if isinstance(m2, list) and await home_pick(pg, cdp, run, drv, tag, m2, '回宿舍'):
        o = await play(pg, cdp, run, tag, drv, lambda g, R: bool(step_rows(R, 'fd_mk_missed', 'end')) or (isinstance(g['mk'], dict) and g['mk'].get('status') in ('pass', 'fail')), 600, review=False)
        g = o['g']; R = await rows(pg, n0)
    mk, w2 = result_note(run, tag, g, R)
    dump(tag, rows=R, end=g, warn=warn, shots=drv.shots)


async def case_old_delayed(pg, cdp, run):
    tag = 'old_delayed'; mkl, fdl, has = await mk_lines(pg); cn = mkl['cname']
    d618 = (await P.day_of(pg, GRADE_DAY))['d']
    extra = {'FAIL_DELAY_COURSES': ['maritime'], 'FAIL_DELAY_V': 2, 'FAIL_DELAY': True, 'FAIL_DELAY_DAY': d618, 'BAR_REG': False, 'FAIL_DELAY_BARCANCEL': True,
             'PG': {'done': {'grad': 1, 'fd_grades_y4s2': 1}}}
    key = os.environ.get('OLD_DAY', '2029-06-20')
    st, d, qs = await grad_state(pg, run, key, 10.0, planned=False, extra=extra)
    st['courses']['grades']['Y4S2'] = {'legal_research': '通過', 'legal_practice': '通過', 'maritime': '0 分（不及格）'}
    st['msgs'] = [{'day': d618, 'h': 22.0 + i * 0.01, 'who': 'zhe', 'text': t, 'th': 'p:zhe', 'from': 'zhe', 'tag': 'fd_zhe'} for i, t in enumerate(['聽說了', '九月我還在總圖 B1 你來，我幫你占位子'])]
    before = {k: st['flags'].get(k) for k in ('FAIL_DELAY_COURSES', 'FAIL_DELAY_V', 'FAIL_DELAY', 'FAIL_DELAY_DAY', 'BAR_REG', 'FAIL_DELAY_BARCANCEL', 'Y4_PATH')}
    run.setup('[前置] %s：照修改前 f3a2ba4a1 6/18 FD.check 會產生的狀態組 %s 10:00 宿舍的存檔（%s；海商法期末答對 0 題 qs %s、成績 0 分（不及格）、阿哲 6/18 22:00 兩則）一次讀進去'
              % (tag, key, J(before), J(qs)))
    await L.load_state(pg, st, quiet_events=False, quiet_phone=False); await pg.evaluate(CLEARP)
    g1 = await pg.evaluate(STATE)
    n0 = await pl_len(pg); drv = Driver(pg, cdp, run, tag, n0, {'final': 0, 'makeup': ENVI('MK_RIGHT', 5)}, mkl, fdl)
    run.note('%s：讀檔那一刻 %s' % (tag, J(g1)))
    mk1 = g1['mk'] if isinstance(g1['mk'], dict) else None
    run.check('%s：讀進來＝補排補考（FD_MAKEUP pending、FAIL_DELAY 沒了）（修改前預期 FAIL）' % tag, bool(mk1) and mk1.get('status') == 'pending' and not g1['flags'].get('FAIL_DELAY'), J(g1['flags']))
    run.note('%s：讀檔後報名 BAR_REG＝%s、BARCANCEL＝%s（恢復與否由 BB 定，只記）' % (tag, g1['flags'].get('BAR_REG'), g1['flags'].get('FAIL_DELAY_BARCANCEL')))
    await L.phone_away(pg, cdp, tries=2)
    drv.shots['after_load'] = await shoot_both(pg, run, tag + '_after_load')
    await phone_sys(pg, cdp, run, drv, tag)
    o = await play(pg, cdp, run, tag, drv, lambda g, R: False, ENVI('OLD_PLAY', 240), review=False)
    g = o['g']; R = await rows(pg, n0); said = said_rows(R); msgs = await pg.evaluate(MSGS, 0)
    note_l = [x for x in said if x['t'] == mkl['notice']]; sysm = [m for m in msgs if m['tag'] == 'fd_mk_sys' or m['text'].startswith('【教務處】大四下補考通知')]
    run.check('%s：有補考通知（旁白或手機教務處）（修改前預期 FAIL）' % tag, bool(note_l) or bool(sysm), J({'say': note_l[:1], 'msgs': sysm}))
    run.note('%s：之後 %s；台詞 %s' % (tag, J({'clock': g['clock'], 'mk': g['mk'], 'flags': g['flags'], 'pend': g['pend']}), J([[x.get('d'), hm(x.get('h')), x['t']] for x in said][:20])))
    run.check('%s：沒有卡住' % tag, o['stuck'] is None, J(o['stuck']))
    dump(tag, rows=R, before=before, after_load=g1, end=g, msgs=msgs, shots=drv.shots)


CASEFN.update({'study3h': case_study3h, 'homerest': case_homerest, 'old_delayed': case_old_delayed,
               'skipnoon_phone': lambda pg, cdp, run: case_skipnoon(pg, cdp, run, 'phone'), 'skipnoon_seat': lambda pg, cdp, run: case_skipnoon(pg, cdp, run, 'seat')})


async def main():
    run = L.Run('makeup_' + '+'.join(CASES), OUT); os.makedirs(OUT, exist_ok=True)
    todo = []
    for cs in CASES: todo += ['home_' + s for s in HOME_SUBS] if cs == 'home' else (['skipnoon_' + v for v in SKIP_VIA] if cs == 'skipnoon' else [cs])
    async with async_playwright() as p:
        for cs in todo:
            fn = CASEFN.get(cs)
            if not fn: run.check('CASE %s 認得' % cs, False, '可以用：main_pass,main_fail,noshow,home,rollcall_fail,study3h,skipnoon,homerest,old_delayed,' + ','.join(k for k in CASEFN if k.startswith('home_'))); continue
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
    print('SHA', os.environ.get('SHA', '?'), 'CASES', ','.join(todo), flush=True)
    sys.exit(run.finish())

if __name__ == '__main__':
    asyncio.run(main())
