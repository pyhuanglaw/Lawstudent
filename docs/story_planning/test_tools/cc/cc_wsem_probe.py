"""CC（帳號 A）11-02：WSEM-BG-1102「研討室 A 門口上課、期末考用法律系館B 研討室背景」的瀏覽器探針（BB 10:31 驗收條件）。
受測：開發分支 77c42c50b（classes3d.js S.attend：門口上課 door＝true 時 dBg＝OUT.bg(S.DOOR_BG[it.room.door])，
      GM.sceneBegin({adv:true,background:dBg})；S.DOOR_BG＝{wancai_seminar:'wancai_seminar'}；考試那一堂開頭 S.DOOR_EXAM_LINE[door]（AA 的旁白，現在是空字串＝不說））。
修改前基準：dea6b1944（GM.sceneBegin({adv:true}) → game3d.js sceneBegin → ADV.begin({background:'blur'})＝模糊底）。Node 證據：tests/wsem_bg_unit.js。
不是 iPhone：Playwright 手機模擬（is_mobile、觸控；使用者 Windows 電腦用 GPU，tools/cc_local/gpu_wrap.py，無視窗），URL 用 '<URL>/index.html?turbo'。

讀碼看到的規則（77c42c50b）：
  courses.js：大四上（Y4S1）在 WSEM（法律系館B 研討室，zone wancai、door wancai_seminar、lv 1）上的三門課：
    legal_ethics（法律倫理，必修，週二 pm1 13:20）、crim_judgment_sem（刑事判決研討，選修，週五 am 09:10）、public_judgment_sem（公法判決研討，選修，週五 am）；
    後兩門同一個選修群組 Y4S1_sem（預設 crim_judgment_sem）＝【前置】存檔的 courses.electives.Y4S1_sem 設成那一門。
  門：wancai3d.js 二樓（lv 1）研討室 A（x −3、z −D/2+0.75、半徑 1.5）互動點 door:'wancai_seminar' → CLS.roomDoor(GAME,'wancai','seminarA',{door}) →
    課正在上（S.liveDoor：開始前 30 分鐘～下課）→ CLS.doorInteract → 選單「進去上課：<課名>」→ CLS.attend(GM,it,{door:true})。
  手機「今天」→「直接去上課」→ CLS.goClass → GM.enter('wancai') → d.door → CLS.attend(GM,it,{door:true,lateOk})（同一個 attend）。
  adv3d.js：ADV.begin(opts) → A.bgMode＝opts.background、#adv（A.root）class 'on image'／'on blur'；image＝A.bg（#advBg）style.backgroundImage＝url(圖)；
    ADV.setBg 圖載不到＝改 class 'dark'（深色底）。OUT.bg('wancai_seminar')＝{image:'assets/bg/wancai_seminar.webp'}（白天；night 版＝{image,night:true}）。
  期末考（S.isExamCourse＝EXAM_BANK courseMap mc5）：S.runExam：「考卷發下來。<課名>期末考。五題。」→ 5 ×（'i／5　題幹' → 選項）→ 交卷 → 答錯的題的答案；
    不是考五題的課：「考卷發下來。<課名>期末考。」＋一句。都在 attend 的同一個 ADV 裡。

CASES（逗號隔開；每一趟開一個新的瀏覽器；預設全部）：
  class_legal_ethics,class_crim_judgment_sem,class_public_judgment_sem,exam_legal_ethics,exam_crim_judgment_sem,exam_public_judgment_sem
  簡寫：class（三門上課）、exam（三門期末考）、all（全部）。課程 id 可以用 WSEM_COURSES 換。
  每個 case 照 ROUTES 各跑一趟（tag＝<case>_<route>）：
    class 的路線 CLASS_ROUTES（預設 door,go）、exam 的路線 EXAM_ROUTES（預設 door,go）：
      door   【前置】最小存檔：那一天、課開始前 DOOR_EARLY 分鐘（預設 6；開始前 30 分鐘以內＝S.live）、人在萬才館（wancai）；
             【前置】把人放到二樓研討室 A 門口 3 m 外（__BBF.placeNear，lv 1；DOOR_FROM=lobby＝不放、照玩家從一樓入口走上去）
             → 照玩家走到門口（L.go_to lv 1）→ 按互動 → 選單「進去上課：<課名>」→ 選 → 上課／考試 → 下課。
      go     【前置】最小存檔：那一天、開始前 GO_EARLY 分鐘（預設 45）在宿舍 → 手機「今天」那一堂的出發鈕（data-go）→ 照玩家（跳時間確認選「照樣」、
             路上停下來選「繼續去上課」）→ 萬才館 → 門口上課。按鈕不在＝【捷徑】CLS.goClass(GAME,it,{forced:true})（考試帶進考場的同一條路）。
      direct 【捷徑】（不在預設）：讀檔到萬才館，直接 void CLS.attend(GAME,it,{door:true})（修改點就在 attend 裡；沒有走門、沒有選單）。
    上課日：TERM（Y4S1）第 CLASS_WEEK 週（預設 5；遇到放假往後找）那門課的星期。期末考日：CLS.examDay(G,c,'Y4S1','final')（照存檔的選修算）。
    存檔：GAME.defaults＋過了開場的旗標（cc_layout16_probe 的 state_at）、Y4_PATH＝環境變數 Y4_PATH（預設 bar）、examSeed 777；條件事件關掉（QUIET=1 預設；
          CLS 自己的課前事件 beforeClassEvent 照常）。
    作答：考五題的課每一題按 EXAM_PICK（預設 0＝第一個選項；背景不看對錯）。其他選單：「進去上課：」「繼續去上課」「照樣」「老位子」「還是進去聽」，再沒有就第一個。

記錄（只記不改；WSHOOK）：GAME.say／GAME.choose／ADV.begin／setBg／end／CLS.attend（開始、結束）／CLS.runExam（開始、結束）每一次都抓：
  ADV.active、ADV.bgMode、#advBg 的 style.backgroundImage 與 computed background-image、#adv 的 class、OUT.bg('wancai_seminar')、EVENTS.running
  → <輸出>/transcript_<tag>.json（ws＝每一列、shots、前置）。
  isSem＝ADV 開著 且 bgMode.image＝OUT.bg('wancai_seminar').image 且 #advBg 的 backgroundImage 含那張圖 且 #adv 有 image、沒有 blur／dark／cg。
截圖（直向＋橫向各一張；先橫向、再把 viewport 換成直向 390×844、再換回來）：
  class：attend 開的 ADV 裡第一句打完字時（<tag>_class_land／_port）；exam：第 1 題（'1／5　'）打完字時（<tag>_q1_land／_port）；
  不是考五題的課＝「考卷發下來」那一句。截圖那一刻也抓一次背景（shot_snap），一起 check。

check（客觀記錄，不判定企劃）：
  0 前置：那一天有那一堂（CLS.dayItems，只讀）、考試那一堂（exam final）；door 路線出現「進去上課：<課名>」；CLS.attend 被呼叫且 door＝true。
  1 attend 裡 ADV 打開那一刻（ADV.begin）的背景＝wancai_seminar（修改前 'blur' 預期 FAIL）。
  2 attend 裡（開始～結束）每一句 GAME.say（ADV 開著以後；EVENTS.running 的事件台詞另外列、不算）背景都是 wancai_seminar（N 句）（修改前預期 FAIL）。
  3 exam：每一題（'i／5　'那一句＋那一題的選單）背景都是 wancai_seminar、題數＝5（考五題的課）；作答中沒有 setBg 換成別的（修改前預期 FAIL）。
  4 截圖那一刻（直向、橫向）背景＝wancai_seminar（修改前預期 FAIL）。
  5 那張圖載得到（new Image() naturalWidth>0；載不到＝ADV 會變深色底）。
  6 上完／考完（CLS.rec done）、沒有卡住、沒有 JS 例外。
  NARR=1（之後才驗；預設 0＝只記第一句）：考試 attend 的第一句（ADV 裡、「考卷發下來」以前）＝NARR_TEXT（預設「（法律系館B 的研討室。{課名}只有十幾個人」開頭，
    {課名} 換成實際課名；NARR_EXACT=1＝整句完全相等）。LAWWW 還沒填 AA 那句（S.DOOR_EXAM_LINE.wancai_seminar＝''）＝現在 NARR=1 會 FAIL。
修改前 dea6b1944 預期：1、2、3、4 FAIL（背景＝blur；bgMode 'blur'、#adv class 'on blur'）；0、5、6 PASS。修改後 77c42c50b 預期全部 PASS（NARR 不算）。

不確定處：
  ・晚上：OUT.bg 有 night 版（{image,night:true}）時 bgMode 會多 night，比對只看 image；這三門課都是白天（09:10、13:20），go 路線早到也在白天。
  ・door 路線用 placeNear 把人直接放到二樓（【前置】）；DOOR_FROM=lobby 照玩家從一樓走樓梯上去，turbo＋低幀率時萬才館樓梯可能走很久（DOOR_WALK_MAX，預設 300 秒）。
  ・研討室 A 若是「走得進去的房間」（rooms_glb3d.js 的 d.to）：同一個位置有「進入 研討室 A」和門牌兩個互動點，有課時兩個都走 CLS.roomDoor（讀碼）；按鈕文字照實記。
  ・go 路線會先 S.skipTo 到出門時間（可能有「會錯過」確認）；路上 routeStop 停下來會演別的事件（不算在 attend 裡）。
  ・課前事件（beforeClassEvent）若是 ADV 事件，它的台詞在 attend 裡、ADV 打開以前；用 EVENTS.running 分開，事件自己的背景只記。
  ・期末考日照 CLS.examDay；刑事判決研討與公法判決研討同一時段，examDay 照存檔的選修算（只修一門）。考試時間若在 am 以外照 examDay 的 block。
  ・題庫不夠 5 題＝「題庫還沒準備好」一句（S.runExam），題數那一項照實記 FAIL，背景照樣檢查。
用法：LW_TESTS=<工作樹>/tests SHA=<sha> [CASES=class,exam|class_legal_ethics,...] python3 cc_wsem_probe.py '<URL>/index.html?turbo' <輸出資料夾>
等待上限（秒）：CASE_MAX（一趟從出發到下課，預設 900）、DOOR_WALK_MAX（走到門口，300）、FREE_S（attend 結束以後畫面空下來幾秒算結束，2）。"""
import os, sys, json, asyncio, re, time, traceback
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__)))); import bbplay as P   # bbplay 在上一層（BB 的 test_tools）
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
J = lambda o: json.dumps(o, ensure_ascii=False)
ENVI = lambda k, d: int(os.environ.get(k, str(d)))
LST = lambda k, d: [c.strip() for c in os.environ.get(k, d).split(',') if c.strip()]
TERM = os.environ.get('TERM_ID', 'Y4S1')
COURSE_IDS = LST('WSEM_COURSES', 'legal_ethics,crim_judgment_sem,public_judgment_sem')
ALL = ['class_' + c for c in COURSE_IDS] + ['exam_' + c for c in COURSE_IDS]
_cs = LST('CASES', 'all'); CASES = []
for _c in _cs:
    CASES += ALL if _c == 'all' else (['class_' + c for c in COURSE_IDS] if _c == 'class' else (['exam_' + c for c in COURSE_IDS] if _c == 'exam' else [_c]))
CLASS_ROUTES = LST('CLASS_ROUTES', 'door,go')
EXAM_ROUTES = LST('EXAM_ROUTES', 'door,go')
BG_ID = os.environ.get('BG_ID', 'wancai_seminar')
DOOR_ID = 'wancai_seminar'
NARR = ENVI('NARR', 0)
NARR_TEXT = os.environ.get('NARR_TEXT', '（法律系館B 的研討室。{課名}只有十幾個人')
NARR_EXACT = ENVI('NARR_EXACT', 0)
LAND = {'width': 844, 'height': 390}; PORT = {'width': 390, 'height': 844}
QN_RE = re.compile(r'^([1-5])／5　')
GO_PICKS = ('進去上課：', '繼續去上課', '照樣', '老位子', '坐中間的位子', '還是進去聽')
AVOID = ('不上了', '算了', '先不', '進館裡逛逛', '翹')


def hm(h):
    if h is None: return '--:--'
    m = int(round(float(h) * 60)); return '%02d:%02d' % (m // 60, m % 60)


# ---------------------------------------------------------------- 存檔（cc_layout16_probe 的 state_at，複製）
BASEF = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True, 'metAn': True, 'met_an': True, 'MET_ZHE': True,
         'zheNoodleDone': True, 'KX_FIRST_MSG': True, 'KX_EVE_MSG': True, 'FAM_GROUP_SENT': True, 'CEREMONY_Y1': True, 'KAI_MOVEIN': True, 'LAW_RECAP_SEEN': True,
         'fundsV2': 1, 'KX_DEC3_MIGRATED': True, 'dating_kexin': False}
ROOMS = (('ROOM_Y2', '2026-09-06'), ('ROOM_Y3', '2027-09-05'), ('ROOM_Y4', '2028-09-03'))
VISITED = ('noodle', 'cafe', 'library_hall', 'library', 'lawlib', 'wancai', 'linze', 'gongguan', 'wenzhou', 'soclib', 'cvs', 'bookstore')


async def state_at(pg, key, h, zone, flags=None, pos=None):
    d = await P.day_of(pg, key)
    st = {'name': '祐廷', 'energy': 100, 'events': {'done': {}, 'last': {}, 'count': 0}, 'contacts': {}}
    F = st['flags'] = dict(BASEF)
    for k, kk in ROOMS:
        dd = (await P.day_of(pg, kk))['d']
        if dd <= d['d']: F[k] = dd
    F.update({'Y4_PATH': os.environ.get('Y4_PATH', 'bar'), 'examSeed': 777})
    F.update(flags or {})
    st.update(day=d['d'], weekday=d['wd'], hour=h, zone=zone, pos=pos, weather='clear', stage='law', money=30000)
    st['visited'] = {z: True for z in VISITED}
    st['courses'] = {'done': {}, 'attend': {}, 'prep': {}, 'electives': {}, 'note': {}, 'disc': {}, 'ask': {}, 'late': {}, 'abs': {}, 'exam': {}, 'grades': {}}
    return st, d


async def load(pg, cdp, st):
    q = bool(ENVI('QUIET', 1))
    try: await L.load_state(pg, st, quiet_events=q, quiet_phone=True)
    except TypeError: await L.load_state(pg, st, quiet_events=q)   # 舊版 playlib 沒有 quiet_phone
    await pg.wait_for_timeout(3000)
    try: await L.phone_away(pg, cdp, tries=2)
    except Exception: pass


# ---------------------------------------------------------------- 頁面裡讀（只讀）
CINFO = r"""(([cid,term])=>{ try{ const c=CLS.byId(cid); if(!c) return {err:'COURSES 沒有 '+cid}; const rm=(COURSES.rooms||{})[c.room]||{};
  let pool=null; try{ const p=CLS.examPool(cid,term,'final'); pool=p.cls.length+p.bank.length+p.ai.length; }catch(e){ pool='ERR '+e.message; }
  return {id:cid,name:c.name,term:c.term,kind:c.kind,room:c.room,roomInfo:{name:rm.name||null,door:rm.door||null,zone:rm.zone||null,lv:rm.lv},slots:c.slots,choice:c.choice||null,
    examCourse:!!CLS.isExamCourse(c),pool,DOOR_BG:CLS.DOOR_BG||null,DOOR_EXAM_LINE:CLS.DOOR_EXAM_LINE||null}; }catch(e){ return {err:String(e.message)}; } })"""
EXAMDAY = r"""(([cid,term])=>{ try{ const c=CLS.byId(cid); const d=CLS.examDay(GAME.G,c,term,'final'); if(!d) return null; const b=COURSES.blocks[d.block]||{};
  return {day:d.day,key:CALENDAR.dateOf(d.day).key,block:d.block,t0:b.t0,t1:b.t1,makeup:!!d.makeup}; }catch(e){ return {err:String(e.message)}; } })"""
ITEM = r"""(([cid,exam])=>{ try{ const G=GAME.G; const it=CLS.dayItems(G).find(q=>q.c&&q.c.id===cid&&(exam?q.exam==='final':!q.exam)); window.__WIT=it||null; if(!it) return null; const rm=it.room||{};
  return {key:it.key,name:it.c.name,t0:it.t0,t1:it.t1,exam:it.exam||null,week:it.week,room:{name:rm.name||null,door:rm.door||null,zone:rm.zone||null},status:CLS.status(G,it),live:CLS.live?!!CLS.live(G,it):null}; }catch(e){ return {err:String(e.message)}; } })"""
DOORIT = r"""(door=>{ try{ return (GAME.E.interactables||[]).filter(i=>i.door===door||/研討室 A/.test(String(i.label||''))).map(i=>({x:i.x,z:i.z,lv:i.lv|0,label:String(i.label||''),door:i.door||null,hidden:!!i.hidden,exit:!!i.exit})); }catch(e){ return 'ERR '+e.message; } })"""
KEYST = r"""(key=>{ try{ const R=CLS.rec(GAME.G); return {done:!!R.done[key]}; }catch(e){ return {err:String(e.message)}; } })"""
IMGOK = r"""(id=>new Promise(res=>{ try{ const b=OUT.bg(id); const u=b&&typeof b==='object'?b.image:null; if(!u) return res({bg:b,ok:false}); const i=new Image(); const t=setTimeout(()=>res({u,ok:false,why:'timeout'}),15000);
  i.onload=()=>{ clearTimeout(t); res({u,ok:i.naturalWidth>0,w:i.naturalWidth,h:i.naturalHeight}); }; i.onerror=()=>{ clearTimeout(t); res({u,ok:false,why:'error'}); }; i.src=u; }catch(e){ res({ok:false,why:String(e.message)}); } }))"""
GOFORCED = "(()=>{ if(!window.__WIT) return false; void CLS.goClass(GAME,window.__WIT,{forced:true}); return true; })()"
DIRECT = "(()=>{ if(!window.__WIT) return false; void CLS.attend(GAME,window.__WIT,{door:true}); return true; })()"
NEXTVIS = "(()=>{ const e=document.getElementById('dlgNext'); return e?(e.style.visibility||getComputedStyle(e).visibility):''; })()"

# 記錄（只記不改）
WSHOOK = r"""(()=>{ if(window.__WSH) return 'again'; window.__WSH=1; window.__WS=[]; const BGID=%s;
  const at=()=>{ try{ return {d:CALENDAR.dateOf(GAME.G.day).key,h:+(+GAME.G.hour).toFixed(3),z:GAME.G.zone}; }catch(e){ return {}; } };
  const want=()=>{ try{ return typeof OUT!=='undefined'&&OUT.bg?OUT.bg(BGID):null; }catch(e){ return 'ERR '+e.message; } };
  const snap=window.__wsSnap=function(){ const A=typeof ADV!=='undefined'?ADV:null; const w=want(), wi=w&&typeof w==='object'?(w.image||null):null;
    const mode=A?A.bgMode:null, mi=mode&&typeof mode==='object'?(mode.image||null):null;
    const dom=A&&A.bg&&A.bg.style?String(A.bg.style.backgroundImage||''):''; let comp=''; try{ comp=A&&A.bg?String(getComputedStyle(A.bg).backgroundImage||''):''; }catch(e){}
    const cls=A&&A.root?String(A.root.className||''):'', C=cls.split(/\s+/), act=!!(A&&A.active);
    const isSem=act&&!!wi&&mi===wi&&dom.indexOf(wi)>=0&&C.includes('image')&&!C.includes('dark')&&!C.includes('blur')&&!C.includes('cg');
    let ev=null; try{ const r=typeof EVENTS!=='undefined'?EVENTS.running:null; ev=r?(typeof r==='object'?String(r.id||'?'):String(r)):null; }catch(e){}
    return {active:act,mode:(mode&&typeof mode==='object')?JSON.stringify(mode):mode,img:mi,dom,comp:comp.slice(0,200),cls,want:wi||(w==null?null:String(w)),isSem,ev}; };
  const push=(k,t,x)=>{ try{ window.__WS.push(Object.assign({k,t:String(t==null?'':t).slice(0,160)},x||{},at(),snap())); }catch(e){} };
  const s0=GAME.say; GAME.say=function(w,t){ push('say',t,{n:(w&&w.name)||(typeof w==='string'?w:'')}); return s0.apply(this,arguments); };
  const c0=GAME.choose; GAME.choose=function(o){ push('choose',(o||[]).filter(x=>x&&!x.hidden).map(x=>(x.t||x.text)||'').join('｜')); return c0.apply(this,arguments); };
  if(typeof ADV!=='undefined'){ for(const nm of ['begin','setBg','end']){ const f=ADV[nm]; if(typeof f!=='function') continue;
    ADV[nm]=function(o){ const r=f.apply(this,arguments); push('adv_'+nm,nm==='begin'?JSON.stringify((o&&o.background)||null):(nm==='setBg'?JSON.stringify(o==null?null:o):'')); return r; }; } }
  if(typeof CLS!=='undefined'){
    if(CLS.attend){ const a0=CLS.attend; CLS.attend=async function(GM,it,o){ push('attend',(it&&it.key)||'',{key:it&&it.key,exam:(it&&it.exam)||null,door:!!(o&&o.door),o:JSON.stringify(o||{})});
      let r; try{ r=await a0.apply(this,arguments); } finally { let done=null; try{ done=!!CLS.rec(GAME.G).done[it.key]; }catch(e){} push('attended',(it&&it.key)||'',{key:it&&it.key,ret:String(r),done}); } return r; }; }
    if(CLS.runExam){ const x0=CLS.runExam; CLS.runExam=async function(GM,it){ push('exam_start',(it&&it.key)||''); let r; try{ r=await x0.apply(this,arguments); } finally { push('exam_end',JSON.stringify(r||null)); } return r; }; }
    if(CLS.goClass){ const g0=CLS.goClass; CLS.goClass=async function(GM,it,o){ push('go',(it&&it.key)||'',{o:JSON.stringify(o||{})}); return g0.apply(this,arguments); }; }
  }
  if(GAME.enter){ const e0=GAME.enter; GAME.enter=function(z,sp){ push('enter',String(z)); return e0.apply(this,arguments); }; }
  if(GAME.caption){ const p0=GAME.caption; GAME.caption=function(n,t){ push('cap',String(n||'')+'｜'+String(t==null?'':t)); return p0.apply(this,arguments); }; }
  return 'ok'; })()""" % json.dumps(BG_ID)
WS = "(n=>(window.__WS||[]).slice(n))"
WSN = "(window.__WS||[]).length"
SNAP = "(()=>{ try{ return window.__wsSnap?window.__wsSnap():null; }catch(e){ return 'ERR '+e.message; } })()"
BRIEF = ('k', 't', 'd', 'h', 'z', 'active', 'isSem', 'img', 'mode', 'cls', 'dom', 'want', 'ev')
brief = lambda r: None if not isinstance(r, dict) else {k: r.get(k) for k in BRIEF}


async def shoot_both(pg, run, tag):
    """橫向截一張 → viewport 換直向截一張 → 換回橫向；每一張截圖那一刻也抓背景"""
    await pg.wait_for_timeout(700)
    s1 = await pg.evaluate(SNAP); a = await run.shot(pg, tag + '_land')
    await pg.set_viewport_size(PORT); await pg.wait_for_timeout(2000)
    s2 = await pg.evaluate(SNAP); b = await run.shot(pg, tag + '_port')
    await pg.set_viewport_size(LAND); await pg.wait_for_timeout(2000)
    return {'land': a, 'port': b, 'snap_land': s1, 'snap_port': s2}


def pick(T, in_q, route):
    """選哪一個：考試題目＝EXAM_PICK；其他照 GO_PICKS（開頭符合）→ 第一個不是 AVOID 的 → 第一個"""
    if in_q: return min(ENVI('EXAM_PICK', 0), len(T) - 1), 'exam'
    for p_ in GO_PICKS:
        for i, t in enumerate(T):
            if t.startswith(p_): return i, 'pick'
    for i, t in enumerate(T):
        if not t.startswith(AVOID): return i, 'first'
    return 0, 'first'


async def drive(pg, cdp, run, tag, key, exam, route, rec, n0):
    """從出發（或門口）到下課：對話點過去、選單照 pick、手機收起來；attend 的 ADV 第一句（class）／第 1 題（exam）打完字截直向＋橫向。
    結束＝attend 回來（attended 那一列）以後畫面空下來 FREE_S 秒。回傳 'done'／'timeout'"""
    t0 = time.time(); shot_done = False; free_since = None; in_q = False
    while time.time() - t0 < ENVI('CASE_MAX', 900):
        R = await pg.evaluate(WS, n0)
        ia = next((i for i, r in enumerate(R) if r['k'] == 'attend' and r['t'] == key), None)
        attended = any(r['k'] == 'attended' and r['t'] == key for r in R)
        s = await P.ts(pg)
        free = not s['dlg'] and not s['ch'] and not s['busy'] and s['depth'] == 0 and not s['phone']
        if attended and free:
            if free_since is None: free_since = time.time()
            if time.time() - free_since > ENVI('FREE_S', 2): return 'done'
            await pg.wait_for_timeout(500); continue
        free_since = None
        if s['phone'] and not s['dlg'] and not s['ch']:
            await L.phone_away(pg, cdp, tries=1); await pg.wait_for_timeout(500); continue
        if s['ch']:
            T = [o['t'] for o in s['ch']]
            says = [r for r in (R[ia:] if ia is not None else []) if r['k'] == 'say']
            in_q = bool(exam and says and QN_RE.match(says[-1]['t']))
            k, why = pick(T, in_q, route)
            run.note('%s %s %s 選單 %s → %s（%s）' % (tag, hm(s['h']), s['zone'], J([t[:28] for t in T]), T[k][:30], why))
            rec.setdefault('picks', []).append({'h': s['h'], 'opts': T, 'pick': T[k], 'why': why})
            await P.tap_choice(pg, cdp, k); await pg.wait_for_timeout(1100); continue
        if s['dlg']:
            if not shot_done and ia is not None and not attended:
                sn = await pg.evaluate(SNAP)
                want = (exam and (s['txt'].startswith('1／5　') or (not rec.get('examCourse') and s['txt'].startswith('考卷發下來')))) or (not exam and sn and sn.get('active'))
                if want:
                    for _ in range(8):
                        if await pg.evaluate(NEXTVIS) == 'visible': break
                        await pg.wait_for_timeout(500)
                    rec['shots'] = await shoot_both(pg, run, tag + ('_q1' if exam else '_class')); rec['shot_txt'] = s['txt'][:120]; shot_done = True
                    run.note('%s：截圖（%s）「%s」背景 橫 %s／直 %s' % (tag, '第 1 題' if exam else '上課第一句', s['txt'][:40],
                                                             (rec['shots']['snap_land'] or {}).get('isSem'), (rec['shots']['snap_port'] or {}).get('isSem')))
                    continue
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(600); continue
        await pg.wait_for_timeout(700)
    return 'timeout'


async def door_enter(pg, cdp, run, tag, rec):
    """【前置】放到研討室 A 門口附近（DOOR_FROM=lobby＝不放）→ 照玩家走到門口 → 按互動，直到出現選單（不選）。回傳選項"""
    its = await pg.evaluate(DOORIT, DOOR_ID); rec['door_its'] = its
    if not isinstance(its, list) or not its: run.check('%s：萬才館有研討室 A 的門（互動點）' % tag, False, J(its)); return None
    d = next((i for i in its if i['door'] == DOOR_ID and not i['hidden']), None) or next((i for i in its if not i['hidden']), its[0])
    run.note('%s：研討室 A 互動點 %s（全部 %s）' % (tag, J(d), J(its)))
    if os.environ.get('DOOR_FROM', 'near') != 'lobby':
        p = await P.place_near(pg, run, d['x'], d['z'], R=3.0, lv=d['lv'], what='研討室 A 門口（lv %d）' % d['lv'])
        rec['placed'] = p
    else: run.note('%s：DOOR_FROM=lobby：照玩家從萬才館一樓走上二樓' % tag)
    ok = await L.go_to(pg, cdp, run, d['x'], d['z'], 1.0, '研討室 A 門口', max_s=ENVI('DOOR_WALK_MAX', 300), lv=d['lv'])
    rec['reached'] = ok
    for _ in range(5):
        s = await P.ts(pg)
        if s['ch']: break
        rec.setdefault('labels', []).append(s.get('lab'))
        await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1600)
    s = await P.ts(pg); T = [o['t'] for o in (s['ch'] or [])]; rec['door_menu'] = T
    if not T:
        rec['door_shot'] = await run.shot(pg, tag + '_door_nomenu')
        run.note('%s：按了互動沒有選單（按鈕 %s；字幕／對話 %s）' % (tag, J(rec.get('labels')), J(s['txt'][:80])))
    return T


async def one(p, run, case, route):
    exam = case.startswith('exam_'); cid = case.split('_', 1)[1]; tag = '%s_%s' % (case, route)
    b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
    pg.on('dialog', lambda dd: asyncio.ensure_future(dd.accept()))
    rec = {'case': case, 'route': route, 'cid': cid}
    try:
        await pg.goto(URL); ok = await L.wait_loaded(pg); run.check('%s：遊戲載入' % tag, ok)
        await pg.evaluate("localStorage.clear()"); await P.init(pg)
        ci = await pg.evaluate(CINFO, [cid, TERM]); rec['course'] = ci
        if ci.get('err'): run.check('%s：讀得到課 %s' % (tag, cid), False, J(ci)); return
        rec['examCourse'] = ci['examCourse']
        run.note('%s：課 %s（%s、%s、%s，WSEM＝%s；考五題 %s、題庫 %s 題；CLS.DOOR_BG %s；DOOR_EXAM_LINE %s）' % (tag, ci['name'], ci['kind'], ci['term'], J(ci['slots']), J(ci['roomInfo']),
                 ci['examCourse'], ci['pool'], J(ci['DOOR_BG']), J(ci['DOOR_EXAM_LINE'])))
        run.check('%s：前置（課在 %s、教室 WSEM／door %s）' % (tag, TERM, DOOR_ID), ci['term'] == TERM and ci['roomInfo']['door'] == DOOR_ID, J(ci))
        el = {ci['choice']['group']: cid} if ci.get('choice') else {}
        wd = (ci['slots'] or [{}])[0].get('wd')
        # ---- 日期
        if exam:
            st, d = await state_at(pg, [TERM, 10, wd or 2], 10.0, 'dorm'); st['courses']['electives'].update(el); await load(pg, cdp, st)
            ed = await pg.evaluate(EXAMDAY, [cid, TERM]); rec['examDay'] = ed
            if not ed or ed.get('err'): run.check('%s：CLS.examDay 有期末考日' % tag, False, J(ed)); return
            key, t0 = ed['key'], ed['t0']
        else:
            wk = ENVI('CLASS_WEEK', 5); key = None
            for w in range(wk, wk + 4):
                dd = await P.day_of(pg, [TERM, w, wd])
                if dd and not dd['hol']: key = dd['key']; break
            if not key: run.check('%s：找得到上課日' % tag, False); return
            blk = (ci['slots'][0] or {}).get('block'); t0 = await pg.evaluate("b=>(COURSES.blocks[b]||{}).t0", blk)
        rec['day'] = key
        # ---- 讀檔
        if route == 'go': h, zone = t0 - ENVI('GO_EARLY', 45) / 60, 'dorm'
        else: h, zone = t0 - ENVI('DOOR_EARLY', 6) / 60, 'wancai'
        st, d = await state_at(pg, key, h, zone); st['courses']['electives'].update(el)
        await load(pg, cdp, st)
        await pg.evaluate(WSHOOK)
        it = await pg.evaluate(ITEM, [cid, exam]); rec['item'] = it
        run.setup('[前置] %s：最小存檔 %s %s %s（%s %s%s；選修 %s；Y4_PATH %s；條件事件%s）' % (tag, key, hm(h), await pg.evaluate("GAME.G.zone"), ci['name'],
                  '期末考' if exam else '上課', ('，examDay ' + J(rec.get('examDay'))) if exam else '', J(el), os.environ.get('Y4_PATH', 'bar'), '關掉' if ENVI('QUIET', 1) else '照常'))
        run.check('%s：前置成立（%s 有 %s 那一堂%s，CLS.dayItems 只讀）' % (tag, key, ci['name'], '（期末考）' if exam else ''), isinstance(it, dict) and not it.get('err'), J(it))
        if not isinstance(it, dict) or it.get('err'): return
        img = await pg.evaluate(IMGOK, BG_ID); rec['img'] = img
        run.check('%s：%s 那張圖載得到（OUT.bg 的 image，new Image() naturalWidth>0）' % (tag, BG_ID), bool(img) and img.get('ok') and BG_ID in str(img.get('u', '')), J(img))
        n0 = await pg.evaluate(WSN)
        # ---- 出發
        if route == 'door':
            T = await door_enter(pg, cdp, run, tag, rec)
            want = '進去上課：' + ci['name']
            run.check('%s：門口按互動出現「%s」' % (tag, want), bool(T) and any(t.startswith(want) for t in T), J({'menu': T, 'labels': rec.get('labels'), 'reached': rec.get('reached')}))
            if not T: return
        elif route == 'go':
            await P.phone_tab(pg, cdp, 'today'); sel = '#phoneBody [data-go="%s"]' % it['key']
            btn = await pg.evaluate("s=>{ const e=document.querySelector(s); return e?(e.textContent||'').trim():null; }", sel); rec['go_btn'] = btn
            if btn:
                rec['today_shot'] = await run.shot(pg, tag + '_today')
                await L.tap(pg, cdp, sel); run.note('%s：手機「今天」按 %s 的「%s」' % (tag, it['key'], btn))
            else:
                try: await L.close_panels(pg, cdp)
                except Exception: pass
                await pg.evaluate(GOFORCED); run.setup('【捷徑】%s：手機「今天」沒有那一堂的出發鈕 → 直接呼叫 CLS.goClass(GAME,it,{forced:true})' % tag)
        elif route == 'direct':
            await pg.evaluate(DIRECT); run.setup('【捷徑】%s：在 %s 直接 void CLS.attend(GAME,it,{door:true})（沒有走門、沒有「進去上課」選單）' % (tag, await pg.evaluate("GAME.G.zone")))
        else:
            run.check('%s：路線認得' % tag, False, 'door,go,direct'); return
        end = await drive(pg, cdp, run, tag, it['key'], exam, route, rec, n0); rec['end'] = end
        await pg.wait_for_timeout(800)
        rec['last_shot'] = await run.shot(pg, tag + '_end')
        R = await pg.evaluate(WS, n0); rec['ws'] = R
        ia = next((i for i, r in enumerate(R) if r['k'] == 'attend' and r['t'] == it['key']), None)
        iz = next((i for i, r in enumerate(R) if r['k'] == 'attended' and r['t'] == it['key']), None)
        att = R[ia] if ia is not None else None
        run.check('%s：CLS.attend 被呼叫、door＝true（%s）' % (tag, it['key']), bool(att) and att.get('door') is True, J(att and {k: att.get(k) for k in ('key', 'exam', 'door', 'o', 'h', 'z')}))
        st_ = await pg.evaluate(KEYST, it['key'])
        run.check('%s：上完／考完（CLS.rec done）、沒有卡住（%s）' % (tag, end), end == 'done' and st_.get('done') is True and iz is not None, J({'end': end, 'st': st_, 'attended': R[iz] if iz is not None else None}))
        if ia is None: return
        win = R[ia:(iz + 1 if iz is not None else len(R))]
        ib = next((i for i, r in enumerate(win) if r['k'] == 'adv_begin'), None)
        beg = win[ib] if ib is not None else None
        run.check('%s：attend 打開 ADV（ADV.begin）的背景＝%s（修改前 blur 預期 FAIL）' % (tag, BG_ID), bool(beg) and beg['isSem'], J(brief(beg)))
        says = [r for r in win if r['k'] == 'say' and r.get('active')]
        main = [r for r in says if not r.get('ev')]; evs = [r for r in says if r.get('ev')]
        pre = [r for r in win if r['k'] == 'say' and not r.get('active')]
        if pre: run.note('%s：attend 裡 ADV 沒開時說的話（不算背景）%s' % (tag, J([[r['t'][:40], r.get('ev')] for r in pre])))
        if evs: run.note('%s：attend 裡事件（EVENTS.running）的台詞與背景（只記）%s' % (tag, J([[r['ev'], r['t'][:30], r['img'] or r['mode']] for r in evs])))
        bad = [[r['t'][:30], r['mode'], r['cls']] for r in main if not r['isSem']]
        run.check('%s：attend 裡每一句（ADV 開著、不是事件，%d 句）背景都是 %s（修改前預期 FAIL）' % (tag, len(main), BG_ID), bool(main) and not bad,
                  J({'bad': bad[:8], 'first': brief(main[0]) if main else None, 'last': brief(main[-1]) if main else None}))
        chg = [brief(r) for r in win if r['k'] == 'adv_setBg']
        if chg: run.note('%s：attend 裡的 ADV.setBg %s' % (tag, J(chg)))
        if exam:
            qs = [r for r in win if r['k'] == 'say' and QN_RE.match(r['t'])]
            qch = []
            for i, r in enumerate(win):
                if r['k'] == 'choose':
                    prev = next((x for x in reversed(win[:i]) if x['k'] == 'say'), None)
                    if prev and QN_RE.match(prev['t']): qch.append(r)
            nq = len(set(QN_RE.match(r['t']).group(1) for r in qs))
            if rec['examCourse']:
                run.check('%s：考五題：題目 %d 題（要 5）' % (tag, nq), nq == 5, J([r['t'][:20] for r in qs]))
                run.check('%s：每一題題目那一句＋那一題的選單背景都是 %s（題目 %d 句、選單 %d 次；修改前預期 FAIL）' % (tag, BG_ID, len(qs), len(qch)),
                          bool(qs) and bool(qch) and all(r['isSem'] for r in qs + qch), J([[r['k'], r['t'][:10], r['isSem'], r['img'] or r['mode']] for r in qs + qch]))
                ie0 = next((i for i, r in enumerate(win) if r['k'] == 'exam_start'), None); ie1 = next((i for i, r in enumerate(win) if r['k'] == 'exam_end'), None)
                ex_chg = [brief(r) for r in win[(ie0 or 0):(ie1 + 1 if ie1 is not None else len(win))] if r['k'] in ('adv_setBg', 'adv_end', 'adv_begin')] if ie0 is not None else []
                run.check('%s：作答期間（runExam 開始～結束）背景沒有被換掉（沒有 ADV.setBg／end／begin）' % tag, ie0 is not None and not ex_chg, J({'runExam': [ie0, ie1], 'changes': ex_chg}))
            else:
                run.note('%s：這門課不是考五題的課（S.isExamCourse false）：考試＝「考卷發下來」＋一句，背景看上面「每一句」' % tag)
            first = main[0]['t'] if main else None; rec['exam_first'] = first
            want_n = NARR_TEXT.replace('{課名}', ci['name'])
            run.note('%s：考試 attend 的第一句（ADV 裡）＝%s；頁面 CLS.DOOR_EXAM_LINE＝%s' % (tag, J(first), J(ci['DOOR_EXAM_LINE'])))
            if NARR:
                okn = bool(first) and (first == want_n if NARR_EXACT else first.startswith(want_n))
                ik = next((i for i, r in enumerate(main) if r['t'].startswith('考卷發下來')), None)
                run.check('%s：（NARR）考試開頭第一句＝「%s」%s，在「考卷發下來」以前' % (tag, want_n, '（完全相等）' if NARR_EXACT else '（開頭）'), okn and (ik is None or ik > 0), J({'first': first, 'idx_paper': ik}))
        sh = rec.get('shots') or {}
        for o in ('land', 'port'):
            sn = sh.get('snap_' + o)
            run.check('%s：截圖（%s）那一刻背景＝%s' % (tag, '橫向' if o == 'land' else '直向', BG_ID), bool(sn) and sn.get('isSem'), J({'shot': sh.get(o), 'txt': rec.get('shot_txt'), 'snap': brief(sn)}))
    except Exception as e:
        run.check('%s：跑完（沒有探針例外）' % tag, False, repr(e)[:500]); traceback.print_exc()
        try: await run.shot(pg, tag + '_exception')
        except Exception: pass
    finally:
        run.check('%s：沒有 JS 例外' % tag, not errs, J(errs[:3]))
        rec['errs'] = errs[:5]; rec['sha'] = os.environ.get('SHA', '?')
        if 'ws' not in rec:
            try: rec['ws'] = await pg.evaluate("(window.__WS||[]).slice(-200)")
            except Exception: pass
        with open(os.path.join(OUT, 'transcript_%s.json' % tag), 'w', encoding='utf-8') as f: json.dump(rec, f, ensure_ascii=False, indent=1)
        try: await asyncio.wait_for(b.close(), 30)
        except Exception: pass


async def main():
    os.makedirs(OUT, exist_ok=True); run = L.Run('wsem_' + '+'.join(LST('CASES', 'all')), OUT)
    async with async_playwright() as p:
        for cs in CASES:
            if not re.match(r'^(class|exam)_.+', cs): run.check('CASE %s 認得' % cs, False, 'class,exam,all,' + ','.join(ALL)); continue
            for rt in (EXAM_ROUTES if cs.startswith('exam_') else CLASS_ROUTES):
                print('==== CASE %s 路線 %s（SHA %s）====' % (cs, rt, os.environ.get('SHA', '?')), flush=True)
                await one(p, run, cs, rt)
    print('SHA', os.environ.get('SHA', '?'), 'CASES', ','.join(CASES), flush=True)
    sys.exit(run.finish())

if __name__ == '__main__':
    asyncio.run(main())
