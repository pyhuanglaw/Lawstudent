"""CC（帳號 A）11-02：BB_222 驗收計畫第 2 節 B-3 CAR-01、CAR-04（國考 → 第一份工作 → 尾聲）的瀏覽器探針。階段 0＝修改前基準（a3b1bd647）。
CC_02 清單 2026-11-14：1✓（每個 case 讀檔日期照 PG 的時間表） 2✓（A 傾向改照 story3d.js careerLean 的 A 來源：法服＋C16＋C09，舊的 LAWCLUB_SAT_VISITS 在有 FAFU_STORY_SEEN 以後不算，BB-C 22:24） 3n/a（case 由 CASES 指定） 4n/a（只按對話與選單） 5n/a（不走路，讀檔到地點） 6✓（每段等對話打完） 7✓（lint） 8✓（careerLean 印出來；前置 top 不對＝前置 FAIL） 9✓（截圖、原文存 JSON） 10✓（讀檔時關條件事件） 11✓（SHA 40 碼） 12✓（前置成立檢查：PG.on、sits2029、沒有延畢、top＝傾向） 13n/a（不走路）
【CC_02 清單：未過】CC-C 11-12 只把群組舊名改字成「桌遊團」（使用者 P0 NOODLE-NAME-PURGE-1112；PHONE.join 群組名、說明文字），邏輯沒改。這支還沒照 CC_02 丁逐條過 13 點：排電腦前要先過清單、寫清單行、雲端重跑。
不是 iPhone：Playwright 手機橫向模擬（SwiftShader，1～4 fps），URL 用 '<URL>/index.html?turbo'。

程式（只讀）：src/postgrad3d.js（PG）。畢業後篇（PG.on：GRADUATED＋PG.done.grad、還沒 EPILOGUE_DONE）＝站著不動 2 秒就「跳到下一件事」（PG.tick → PG.advance → PG.jumpTo），
  場景時間到了、玩家空下來就演（PG.STEPS：exam_2029 8/4 08:00 → r1_2029 9/7 15:05 → e2a 10/20、e2b 10/21 → r2_2029 12/14 15:05 → first 2030-10-01 21:00 → epi 2034-06-03 19:00），
  跳的途中收到訊息＝停下、手機打開（「跳過」）。考卷：examDay 每一題 GAME.say('i／20　題目') → GAME.choose(PG.opts(q))，答對題數記 BAR_SCORE_2029、9/7 才說。
  職涯：PG.path(G)＝STORY.careerLean 的 top（A 幫人／B 研究／C 跨領域）＋BAR_YEAR、研究所旗標 → A_bar／A_none／B_grad／B_quit／C／C_zq；
  第一份工作＝桌遊團群組的照片 POSTGRAD_LINES.FIRST.me[path]，尾聲最後一句 EPI.last[path]。

CASES（逗號隔開；每個 case 開一個新的瀏覽器、從最小存檔開始）：
  car01_A、car01_B、car01_C：CAR-01。一試答對 14 題（律師一試過、司法官一試沒過＝BAR_STAGE lawyer）→ 9/7 → 10/20、21 二試 → 12/14 → 2030-10-01 → 2034 尾聲。
  car04_16、car04_17、car04_20：CAR-04。一試答對 16／17／20 題（both）→ 二試 → 12/14（截圖、原文）→ 尾聲。職涯傾向用 LEAN04（預設 A）。
  另外可以寫 car01_A@15 這樣自己指定題數（＠後面的數字＝答對題數），傾向照前面那個字母。

【前置】（全部寫在報告裡）：
  最小存檔（cc_dl04b_probe 的 state_at：GAME.defaults＋過了開場的旗標，dating_kexin 拿掉）改到 2029-08-03（五）20:00、公館（zone gongguan，出生點）；
  已畢業：GRADUATED＝PG.gradDay()、PG.done.grad＝1、GRAD_DONE、GRAD_EVENING none；大四下的收尾演過（PACKED_Y4、MOVED_OUT＝6/28、events ev_pack_y4／ev_grad_family／
  ev_grad_lunch／ev_grad_envelope／ev_move_out_y4）；HOME_AFTER＝gongguan（公館的套房：不在「家」的選單裡，畢業後篇站著不動就會跳；三個傾向都一樣，只為了讓跳時間的方式一致）；
  BAR_REG＝true；沒有延畢：FAIL_DELAY_COURSES＝[]＋大四下成績單已發（CLS.rec grades.Y4S2＝{}，同 baseline_1102/routes3.js 的 noFail）；沒有交換。
  加入桌遊團群組（PHONE.join noodle_team，大部分玩家都在；routes.js 同）。
  傾向（【捷徑】讀檔後用遊戲 API 補，再 GAME.snapshot() 讀一次；讀完用 STORY.careerLean 檢查 top 對不對＝前置成立）：
    A：LAWCLUB_SAT_VISITS＝10（法服週六去 10 次；routes.js 的 A）
    B：Y4_PATH＝grad（報考研究所）、沒有 GRAD_ADMIT（沒錄取）、自習 100 小時（stats.study 100、STUDY_AT_LAW 0）→ B 10（routes.js R7 的 B）
    C：寒暑假 C08 語言課 done（vac.reg 'C08@2027'）→ C 3（routes.js R6 的 C）

之後照玩家：站著不動（畢業後篇＝跳到下一件事）、點對話、選選項、手機自己打開就按「收起來／跳過」（要回覆才關得掉的＝點第一個回覆鍵，印出來）。
  出遊的提醒（12/14 18:00 麵店等）：OUTING＝go（預設，選「出發：」）／no（選「不去了」）。其他選單：婉拒的那一類，沒有就第一個（印出來）。
  考卷：【捷徑】題目出來時讀 PG.rec(G).exam[2029].qs（examDay 已經抽好的那 20 題，只讀）＋題庫正解（PG.pool、PG.opts，只讀），前 N 題按正解、其餘按一個錯的選項
  （正解是第一個就按第二個，否則按第一個；同 routes.js 的 answerK）；按的是畫面上的選項按鈕，按之前核對按鈕文字和 PG.opts 一樣。遊戲狀態不改。
記錄（只記不改）：
  TR 逐字稿：GAME.say／choose（連 hint）／caption／titleCard／toast／ADV.begin 背景／ADV.cg／GAME.enter → <輸出>/transcript_<case>.json；另外存這段期間新增的手機訊息（G.msgs）。
  SV 存檔：放榜後（r2_2029 演完、畫面空下來）、第一份工作後（FIRST_DAY_SEEN、空下來）、尾聲後（EPILOGUE_DONE：GAME.snapshot()＋localStorage fatiao3d_auto）→ sv_<case>_{r2,first,epi}.json。
  截圖：9/7 放榜那一句（橫向）；12/14 放榜「律師二試：錄取。」、司法官那一句（有的話）、尾聲最後一句（EPI.last）各一張橫向＋一張直向（set_viewport_size 390×844，截完轉回 844×390）；
    第一份工作的群組（手機打開那一刻，橫向）；卡住時一張。
  check（客觀記錄，不判定企劃對不對；判定由 BB 做）：遊戲載入、前置成立（PG.on、傾向 top）、BAR_SCORE_2029＝N、BAR_STAGE_2029＝tier、BAR_YEAR＝2029、
    12/14 的句子有出現、第一份工作那一段演了（FIRST_DAY_SEEN）、尾聲演完（EPILOGUE_DONE）、沒有卡住、逐字稿和新訊息沒有 debug 字（undefined、NaN、📷undefined、null、{name}、內部 id）、沒有 JS 例外。
  note：第一份工作的照片原文、尾聲最後一句原文、PG.path、careerLean、12/14 的每一句原文、跳過的日期卡。
用法：LW_TESTS=<工作樹>/tests SHA=<sha> CASES=car01_A,car01_B,car01_C,car04_16,car04_17,car04_20 python3 cc_car_probe.py '<URL>/index.html?turbo' <輸出資料夾>
等待上限（秒）：CASE_MAX（一個 case，預設 3600）、STUCK_S（空著、時間和畫面都沒變多久算卡住，預設 240）。"""
import os, sys, json, asyncio, re, time, copy, traceback
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__)))); import bbplay as P   # bbplay 在上一層（BB 的 test_tools）
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
J = lambda o: json.dumps(o, ensure_ascii=False)
ENVI = lambda k, d: int(os.environ.get(k, str(d)))
CASES = [c.strip() for c in os.environ.get('CASES', 'car01_A,car01_B,car01_C,car04_16,car04_17,car04_20').split(',') if c.strip()]
LEAN04 = os.environ.get('LEAN04', 'A')
OUTING = os.environ.get('OUTING', 'go')
LAND = {'width': 844, 'height': 390}; PORT = {'width': 390, 'height': 844}
YEAR = 2029


def hm(h):
    if h is None: return '--:--'
    m = int(round(float(h) * 60)); return '%02d:%02d' % (m // 60, m % 60)


def parse_case(c):
    """car01_A → (14, 'A')；car04_17 → (17, LEAN04)；car01_B@15 → (15, 'B')"""
    m = re.match(r'^(car01|car04)_([ABC]|\d+)(?:@(\d+))?$', c)
    if not m: return None
    kind, x, n = m.group(1), m.group(2), m.group(3)
    if kind == 'car01':
        if x.isdigit(): return None
        return (int(n) if n else 14), x
    if not x.isdigit(): return None
    return int(x), LEAN04


def tier(n):   # PG.tier(2029, k)（只當作記錄用的對照）
    return 'both' if n >= 16 else ('lawyer' if n >= 12 else 'none')


# ---------------------------------------------------------------- 存檔（cc_dl04b_probe.py 的 state_at，複製）
BASEF = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True, 'metAn': True, 'met_an': True, 'MET_ZHE': True,
         'zheNoodleDone': True, 'KX_FIRST_MSG': True, 'KX_EVE_MSG': True, 'FAM_GROUP_SENT': True, 'CEREMONY_Y1': True, 'KAI_MOVEIN': True, 'LAW_RECAP_SEEN': True,
         'fundsV2': 1, 'KX_DEC3_MIGRATED': True, 'dating_kexin': False}
ROOMS = (('ROOM_Y2', '2026-09-06'), ('ROOM_Y3', '2027-09-05'), ('ROOM_Y4', '2028-09-03'))
VISITED = ('noodle', 'cafe', 'library_hall', 'library', 'lawlib', 'wancai', 'linze', 'gongguan', 'wenzhou', 'soclib', 'cvs', 'bookstore')
Y4_EVENTS = ('ev_pack_y4', 'ev_grad_family', 'ev_grad_lunch', 'ev_grad_envelope', 'ev_move_out_y4')


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

LEAN_JS = {
    # BB-C 22:24 REL76_car：舊寫法 LAWCLUB_SAT_VISITS=10 在有 FAFU_STORY_SEEN（D118-B5b 起新存檔都有）以後不算了＝A 0、top B。
    #   改照 story3d.js careerLean 的 A 來源：法服（CLUB_lawclub_study）2＋寒暑假 C16、C09 各 5（vac.reg 'C16@年'＝done）
    'A': "F.CLUB_lawclub_study=true; G.vac=G.vac||{}; G.vac.reg=Object.assign(G.vac.reg||{},{'C16@2027':'done','C09@2027':'done'});",
    'B': "F.Y4_PATH='grad'; delete F.GRAD_ADMIT; delete F.Y4_PUSH; G.stats=G.stats||{}; G.stats.study=Math.max(+G.stats.study||0,100); F.STUDY_AT_LAW=0;",
    'C': "G.vac=G.vac||{}; G.vac.reg=Object.assign(G.vac.reg||{},{'C08@2027':'done'});",
}
PREP_JS = """(()=>{ const G=GAME.G, F=G.flags;
  F.dating_kexin=false; if(F.romance) delete F.romance.kexin; F.ROMANCE_HISTORY=(F.ROMANCE_HISTORY||[]).filter(r=>r&&r.id!=='kexin'); delete F.DATED_1_kexin; delete F.KX_TOUR_YES;
  const R=CLS.rec(G); R.grades=R.grades||{}; R.grades.Y4S2=R.grades.Y4S2||{};
  PHONE.join(G,'noodle_team','桌遊團');
  __LEAN__
  return {lean:STORY.careerLean(G),pgOn:PG.on(G),delayed:PG.delayed(G),sits2029:PG.sits(G,2029),zone:G.zone,day:CALENDAR.dateOf(G.day).key,h:G.hour}; })()"""


async def load(pg, cdp, run, st, label, lean):
    """[前置] 讀檔（GAME.applySave）→ 【捷徑】用遊戲 API 補傾向、成績單、群組 → GAME.snapshot() 再讀一次"""
    await L.load_state(pg, st, quiet_events=False, quiet_phone=False); await pg.evaluate(CLEARP)
    await pg.wait_for_timeout(3500)
    js = PREP_JS.replace('__LEAN__', LEAN_JS[lean])
    r = await pg.evaluate(js)
    s2 = await pg.evaluate("()=>GAME.snapshot()")
    await L.load_state(pg, s2, quiet_events=False, quiet_phone=False); await pg.evaluate(CLEARP); await pg.wait_for_timeout(2500)
    run.setup('[前置] %s；【捷徑】讀檔後用遊戲 API 補：拿掉可昕交往、大四下成績單已發（grades.Y4S2）、加入桌遊團、傾向 %s（%s）→ %s' % (label, lean, LEAN_JS[lean], J(r)))
    return r


# ---------------------------------------------------------------- 記錄（只記不改；cc_dl04b_probe 的 HOOK，拿掉上課的部分、不截斷）
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
  if(typeof PG!=='undefined'&&PG.runStep){ const r0=PG.runStep; PG.runStep=async function(GM,s){ push({k:'step',n:'start',t:String(s&&s.id)}); const r=await r0.apply(this,arguments); push({k:'step',n:'end',t:String(s&&s.id)+(r?'':'（沒演）')}); return r; }; }
  if(typeof EVENTS!=='undefined'&&EVENTS.run){ const v0=EVENTS.run; EVENTS.run=function(ev){ push({k:'ev',n:'',t:String((ev&&ev.id)||'')}); return v0.apply(this,arguments); }; }
  const te=document.getElementById('toast'); if(te){ let lt=''; new MutationObserver(()=>{ const h=(te.textContent||'').trim(); if(h&&h!==lt){ lt=h; push({k:'toast',n:'dom',t:h}); } }).observe(te,{childList:true,subtree:true,characterData:true}); }
  return 'ok'; })()"""


async def pl_len(pg):
    return await pg.evaluate("(window.__PL||[]).length")


async def rows(pg, n0=0):
    return await pg.evaluate("n=>(window.__PL||[]).slice(n)", n0)


# ---------------------------------------------------------------- 頁面裡讀（只讀）
TARGETS = """(()=>{ const L=POSTGRAD_LINES; return {r1:Object.values(L.R1.sys), r2:L.R2.sys, judgeNo:L.R2.judgeNo, judgeNarr:L.R2.judgeNarr, last:L.EPI.last, firstMe:L.FIRST.me,
  firstNarr:L.FIRST.narr, end:L.EPI.end, title:L.EPI.title}; })()"""
# 【捷徑】題目的正解（examDay 已經抽好的那 20 題：PG.rec(G).exam[y].qs，只讀；不呼叫 PG.draw）
ANSWER = """(([i,y,N])=>{ try{ const G=GAME.G, X=(PG.rec(G).exam||{})[y]; if(!X||!Array.isArray(X.qs)) return {err:'exam 還沒抽'}; const id=X.qs[i-1];
  const q=PG.pool().find(x=>x.id===id); if(!q) return {err:'題庫找不到 '+id}; const o=PG.opts(q); const right=o.findIndex(x=>String(x.v)===String(q.answer));
  return {id, q:String(q.q).slice(0,60), answer:q.answer, right, want:i<=N?right:(right===0?1:0), opts:o.map(x=>x.t)}; }catch(e){ return {err:String(e.message)}; } })"""
STATE = """(()=>{ const G=GAME.G, F=G.flags||{}, r=(F.PG&&F.PG.done)||{}; let path=null, lean=null; try{ path=PG.path(G); lean=STORY.careerLean(G); }catch(e){}
  const pick={}; for(const k of Object.keys(F)) if(/^(BAR_REG|BAR_REG_2030|BAR_SIT_\\d+|BAR_SCORE_\\d+|BAR_STAGE_\\d+|BAR_YEAR|Y4_PATH|GRAD_ADMIT|FAIL_DELAY|FAIL_DELAY_COURSES|GRADUATED|FIRST_DAY_SEEN|EPILOGUE_DONE|HOME_AFTER|RETAKE_STYLE)$/.test(k)) pick[k]=F[k];
  return {flags:pick, done:r, path, lean, pgOn:PG.on(G), nextStop:PG.nextStop(G), due:(PG.due(G)||{}).id||null, title:!document.getElementById('titleScreen').classList.contains('hide'),
    clock:{key:CALENDAR.dateOf(G.day).key, h:+(+G.hour).toFixed(3), zone:G.zone}, nmsg:(G.msgs||[]).length}; })()"""
MSGS = "(n=>(GAME.G.msgs||[]).slice(n).map(m=>({th:m.th||null,from:m.from||null,who:m.who||null,name:m.name||null,tag:m.tag||null,day:m.day,h:m.h,text:String(m.text==null?'':m.text)})))"
PHONE_TXT = "(()=>(document.getElementById('phoneBody')||{}).innerText||'')()"
MUST = "(()=>{ try{ return !!(PHONE.mustOpen&&PHONE.mustOpen(GAME.G)); }catch(e){ return false; } })()"
EPI_SAVE = "(()=>{ let snap=null, auto=null; try{ snap=GAME.snapshot(); }catch(e){ snap={err:String(e.message)}; } try{ auto=(GAME.readSave?GAME.readSave('fatiao3d_auto'):(GAME.readSave?GAME.readSave('fatiao3d_auto'):JSON.parse(localStorage.getItem('fatiao3d_auto')||'null'))); }catch(e){ auto={err:String(e.message)}; } return {snap,auto}; })()"

DEBUG_RE = re.compile(r'undefined|NaN|📷\s*$|📷undefined|\bnull\b|\{name\}|\{item\}|\{課名\}|\b(?:heroine_0\d|classmate_[a-z]+|npc_[a-z]+|econ_[a-z]+|pg_[a-z0-9_]+|ev_[a-z0-9_]+|A_bar|A_none|B_grad|B_quit|C_zq|BAR_[A-Z0-9_]+)\b')
DECL = ('不去了', '先不', '不用了', '算了', '就這樣', '先這樣', '沒事', '先不睡')
Q_RE = re.compile(r'^(\d+)／(\d+)　')


def pick_menu(T):
    """出遊提醒（「出發：」開頭）照 OUTING；其他選單：婉拒那一類 → 第一個不是「出發：」的 → 第一個"""
    go = next((i for i, t in enumerate(T) if t.startswith(('出發：', '直接過去：'))), None)
    if go is not None:
        if OUTING == 'go': return go, 'outing-go'
        k = next((i for i, t in enumerate(T) if t.startswith('不去了')), None)
        if k is not None: return k, 'outing-no'
    for w in DECL:
        for i, t in enumerate(T):
            if t.startswith(w): return i, 'decline'
    for i, t in enumerate(T):
        if not t.startswith(('出發：', '接起來：')) and '存檔' not in t: return i, 'first'
    return 0, 'first'


async def shoot_both(pg, run, tag, want_txt=None):
    """對話停在那一句（等它打完字）→ 橫向一張 → 轉直向一張 → 轉回橫向"""
    if want_txt:
        for _ in range(12):
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
    """手機關不掉（要回覆的訊息 ask.must）：點第一個回覆鍵（沒有的話先點第一個對話）。印出來"""
    if not await pg.evaluate(MUST): return None
    if not await pg.evaluate("!!document.querySelector('#phoneBody [data-ask]')"):
        if await pg.evaluate("!!document.querySelector('#phoneBody [data-th]')"):
            await L.tap(pg, cdp, '#phoneBody [data-th]'); await pg.wait_for_timeout(800)
    asks = await pg.evaluate("[...document.querySelectorAll('#phoneBody [data-ask]')].map(b=>(b.textContent||'').trim())")
    if asks:
        await L.tap(pg, cdp, '#phoneBody [data-ask]'); await pg.wait_for_timeout(1200)
        run.note('%s：手機要回覆才關得掉 → 點第一個回覆鍵「%s」（全部 %s）' % (tag, asks[0], J(asks)))
    return asks


# ---------------------------------------------------------------- 一個 case
async def one_case(pg, cdp, run, case):
    pc = parse_case(case)
    if not pc: run.check('CASE %s 認得' % case, False, 'car01_A|B|C、car04_<題數>、可加 @<題數>'); return
    N, lean = pc
    if lean not in LEAN_JS: run.check('%s：傾向 %s 認得' % (case, lean), False); return
    tag = case.replace('@', '_')
    T = await pg.evaluate(TARGETS)
    gd = await pg.evaluate("PG.gradDay()"); mo = await pg.evaluate("PG.DK('2029-06-28')")
    flags = {'BAR_REG': True, 'GRADUATED': gd, 'GRAD_DONE': True, 'GRAD_EVENING': 'none', 'PACKED_Y4': gd - 1, 'MOVED_OUT': mo, 'HOME_AFTER': 'gongguan',
             'FAIL_DELAY_COURSES': [], 'PG': {'done': {'grad': 1}}}
    st, d = await state_at(pg, '2029-08-03', 20.0, 'gongguan', flags, done={e: 1 for e in Y4_EVENTS})
    r = await load(pg, cdp, run, st, '%s：最小存檔 %s 20:00 公館（已畢業、BAR_REG、沒有延畢、HOME_AFTER gongguan；一試答對 %d 題、傾向 %s）' % (tag, d['key'], N, lean), lean)
    s0 = await pg.evaluate(STATE)
    run.check('%s：前置成立：畢業後篇（PG.on）、2029 會考（PG.sits）、沒有延畢、傾向 top＝%s（careerLean %s）' % (tag, lean, J(r.get('lean'))),
              bool(r.get('pgOn')) and bool(r.get('sits2029')) and not r.get('delayed') and (r.get('lean') or {}).get('top') == lean, J(s0))
    nmsg0 = s0['nmsg']; n0 = await pl_len(pg)
    sv = {}; answered = {}; shots = {}; firstPhone = None; stuck = None; days = []
    t0 = time.time(); last = None; since = time.time(); lastday = s0['clock']['key']
    while time.time() - t0 < ENVI('CASE_MAX', 3600):
        s = await P.ts(pg); g = await pg.evaluate(STATE)
        if g['clock']['key'] != lastday: days.append([g['clock']['key'], hm(g['clock']['h'])]); lastday = g['clock']['key']
        free = not s['dlg'] and not s['ch'] and not s['busy'] and s['depth'] == 0 and not s['phone']
        F = g['flags']; done = g['done']
        # SV：放榜後、第一份工作後、尾聲後
        if 'r2' not in sv and done.get('r2_%d' % YEAR) and free:
            sv['r2'] = await pg.evaluate("()=>GAME.snapshot()"); run.note('%s：SV 放榜後 %s %s' % (tag, g['clock']['key'], hm(g['clock']['h'])))
        if 'first' not in sv and F.get('FIRST_DAY_SEEN') and free:
            sv['first'] = await pg.evaluate("()=>GAME.snapshot()"); run.note('%s：SV 第一份工作後 %s %s' % (tag, g['clock']['key'], hm(g['clock']['h'])))
        if 'epi' not in sv and F.get('EPILOGUE_DONE'):
            sv['epi'] = await pg.evaluate(EPI_SAVE); run.note('%s：SV 尾聲後 %s %s' % (tag, g['clock']['key'], hm(g['clock']['h'])))
        if F.get('EPILOGUE_DONE') and g['title'] and free:
            await pg.wait_for_timeout(1500); shots['title'] = await run.shot(pg, tag + '_title_after_epi'); break
        sig = (g['clock']['key'], g['clock']['h'], s['zone'], s['txt'][:40], tuple(o['t'] for o in s['ch']), s['busy'], s['depth'] > 0, s['phone'], g['nmsg'])
        if sig != last: last = sig; since = time.time()
        elif time.time() - since > ENVI('STUCK_S', 240):
            stuck = {'clock': g['clock'], 'ts': {k: s[k] for k in ('dlg', 'txt', 'busy', 'depth', 'phone', 'zone')}, 'ch': s['ch'], 'nextStop': g['nextStop'], 'due': g['due']}
            shots['stuck'] = await run.shot(pg, tag + '_stuck'); break
        if s['ch']:
            Tt = [o['t'] for o in s['ch']]
            R = await rows(pg, n0)
            lastsay = next((x for x in reversed(R) if x['k'] == 'say'), None)
            m = Q_RE.match(lastsay['t']) if lastsay else None
            if m and lastsay.get('d') == '%d-08-04' % YEAR:
                i = int(m.group(1))
                if i in answered: await pg.wait_for_timeout(600); continue
                a = await pg.evaluate(ANSWER, [i, YEAR, N])
                if a.get('err') or a['want'] < 0 or a['want'] >= len(Tt):
                    run.check('%s：第 %d 題讀得到正解（【捷徑】只讀）' % (tag, i), False, J(a)); answered[i] = None
                    await P.tap_choice(pg, cdp, 0); await pg.wait_for_timeout(900); continue
                same = [t.strip() for t in Tt] == [t.strip() for t in a['opts']]
                if not same: run.check('%s：第 %d 題畫面的選項和 PG.opts 一樣' % (tag, i), False, J({'screen': Tt, 'opts': a['opts']}))
                answered[i] = {'id': a['id'], 'right': a['right'], 'picked': a['want'], 'correct': a['want'] == a['right']}
                if i == 1: shots['q1'] = await run.shot(pg, tag + '_exam_q1')
                await P.tap_choice(pg, cdp, a['want']); await pg.wait_for_timeout(900); continue
            k, why = pick_menu(Tt)
            run.note('%s %s %s %s 選項 %s → %s（%s）' % (tag, g['clock']['key'], hm(g['clock']['h']), s['zone'], J([t[:28] for t in Tt]), Tt[k][:30], why))
            await P.tap_choice(pg, cdp, k); await pg.wait_for_timeout(1000); continue
        if s['phone'] and not s['dlg']:
            if F.get('FIRST_DAY_SEEN') and firstPhone is None:
                await pg.wait_for_timeout(1200); firstPhone = {'text': await pg.evaluate(PHONE_TXT), 'shot': await run.shot(pg, tag + '_first_day_phone')}
                run.note('%s：第一份工作（手機群組）畫面文字：%s' % (tag, firstPhone['text'][:900]))
            await L.phone_away(pg, cdp, tries=2); await pg.wait_for_timeout(500)
            if await pg.evaluate("!!(GAME.phoneIsOpen&&GAME.phoneIsOpen())"): await phone_unblock(pg, cdp, run, tag)
            continue
        if s['dlg']:
            txt = s['txt']
            R = await rows(pg, max(n0, (await pl_len(pg)) - 10))
            full = next((x['t'] for x in reversed(R) if x['k'] == 'say'), '')
            for key, want in (('r1', T['r1']), ('r2', [T['r2'][0]]), ('judge', [T['judgeNo']]), ('last', list(T['last'].values())), ('end', [T['end']])):
                if key in shots or full not in want: continue
                if key in ('r1', 'end'):
                    for _ in range(12):
                        if (await P.ts(pg))['txt'] == full: break
                        await pg.wait_for_timeout(500)
                    await pg.wait_for_timeout(600); shots[key] = [await run.shot(pg, tag + '_' + key + '_land')]
                else:
                    shots[key] = await shoot_both(pg, run, tag + '_' + key, full)
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(550); continue
        await pg.wait_for_timeout(900)   # 空著：站著不動（畢業後篇 2 秒＝跳到下一件事）
    # ---------------- 收尾、記錄
    g = await pg.evaluate(STATE); F = g['flags']
    R = await rows(pg, n0)
    msgs = await pg.evaluate(MSGS, nmsg0)
    with open(os.path.join(OUT, 'transcript_%s.json' % tag), 'w', encoding='utf-8') as f:
        json.dump({'case': case, 'N': N, 'lean': lean, 'sha': os.environ.get('SHA', '?'), 'rows': R, 'msgs': msgs, 'answered': answered, 'days': days, 'end': g,
                   'first_phone': firstPhone, 'stuck': stuck, 'shots': shots}, f, ensure_ascii=False, indent=1)
    for k, v in sv.items():
        with open(os.path.join(OUT, 'sv_%s_%s.json' % (tag, k)), 'w', encoding='utf-8') as f: json.dump(v, f, ensure_ascii=False)
    said = [x for x in R if x['k'] == 'say']
    ncor = sum(1 for v in answered.values() if v and v['correct'])
    run.check('%s：考卷 20 題都按了（%d 題），按對 %d 題（要 %d）' % (tag, len(answered), ncor, N), len(answered) == 20 and ncor == N, J(answered)[:600])
    run.check('%s：BAR_SIT_2029 true、BAR_SCORE_2029＝%d' % (tag, N), F.get('BAR_SIT_2029') is True and F.get('BAR_SCORE_2029') == N, J(F))
    run.check('%s：BAR_STAGE_2029＝%s（PG.tier）' % (tag, tier(N)), F.get('BAR_STAGE_2029') == tier(N), J(F.get('BAR_STAGE_2029')))
    r1 = [x for x in said if x['t'] in T['r1']]
    run.note('%s：9/7 放榜原文 %s' % (tag, J([[x['d'], hm(x['h']), x['t']] for x in r1])))
    i_r2 = next((i for i, x in enumerate(said) if x['t'] == T['r2'][0]), None)
    r2l = said[i_r2:i_r2 + 4] if i_r2 is not None else []
    r2l = [x for x in r2l if x['d'] == '%d-12-14' % YEAR and x['t'] in (T['r2'] + [T['judgeNo'], T['judgeNarr']])]
    run.note('%s：12/14 放榜原文（%d 行）%s' % (tag, len(r2l), J([[x['d'], hm(x['h']), x['t']] for x in r2l])))
    run.check('%s：12/14 放榜演了（「%s」有出現）' % (tag, T['r2'][0]), bool(r2l), J(done_keys(g)))
    run.check('%s：BAR_YEAR＝2029' % tag, F.get('BAR_YEAR') == 2029, J(F.get('BAR_YEAR')))
    fd = [m for m in msgs if m.get('tag') == 'pg_first_day']
    run.note('%s：第一份工作（桌遊團 pg_first_day，%s）原文：%s' % (tag, fd[0]['day'] if fd else '-', J([[m['from'], m['text']] for m in fd])))
    run.check('%s：第一份工作那一段演了（FIRST_DAY_SEEN）' % tag, bool(F.get('FIRST_DAY_SEEN')), J(F))
    lastl = [x for x in said if x['t'] in T['last'].values()]
    run.note('%s：尾聲最後一句（EPI.last）%s；PG.path＝%s；careerLean＝%s' % (tag, J([[x['d'], x['n'], x['t']] for x in lastl]), g['path'], J(g['lean'])))
    run.note('%s：第一份工作照片對應 path：%s；尾聲最後一句對應 path：%s' % (tag, J([k for k, v in T['firstMe'].items() if any(v in m['text'] for m in fd)]),
                                                         J([k for k, v in T['last'].items() if any(v == x['t'] for x in lastl)])))
    run.check('%s：尾聲演完（EPILOGUE_DONE）、回到標題' % tag, bool(F.get('EPILOGUE_DONE')) and g['title'], J({'clock': g['clock'], 'title': g['title']}))
    run.check('%s：沒有卡住' % tag, stuck is None, J(stuck))
    cards = [[x['d'], x['n'], x['t']] for x in R if x['k'] == 'card']
    run.note('%s：日期卡 %s' % (tag, J(cards)[:2500]))
    run.note('%s：場景順序 %s' % (tag, J([x['t'] for x in R if x['k'] == 'step' and x['n'] == 'end'])))
    bad = []
    for x in R:
        if x['k'] in ('say', 'choose', 'cap', 'card', 'toast') and DEBUG_RE.search((x.get('n') or '') + ' ' + x['t']): bad.append([x['k'], x.get('d'), x['t'][:80]])
    for m in msgs:
        if DEBUG_RE.search(m['text']) or m['text'].strip() in ('📷', ''): bad.append(['msg', m.get('tag'), m['text'][:80]])
    run.check('%s：逐字稿、新訊息沒有 debug 字（undefined、NaN、📷undefined、null、{name}、內部 id）' % tag, not bad, J(bad[:12]))
    run.note('%s：截圖 %s' % (tag, J(shots)))


def done_keys(g):
    return {k: v for k, v in (g.get('done') or {}).items() if re.search(r'(exam|r1|e2|r2)_20|first|epi', k)}


# ---------------------------------------------------------------- main
async def main():
    run = L.Run('car_' + '+'.join(CASES), OUT); os.makedirs(OUT, exist_ok=True)
    async with async_playwright() as p:
        for c in CASES:
            print('==== CASE %s（SHA %s）====' % (c, os.environ.get('SHA', '?')), flush=True)
            b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
            pg.on('dialog', lambda dd: asyncio.ensure_future(dd.accept()))
            try:
                await pg.goto(URL); ok = await L.wait_loaded(pg); run.check('%s：遊戲載入' % c, ok)
                await pg.evaluate("localStorage.clear()"); await P.init(pg); await pg.evaluate(HOOK)
                await one_case(pg, cdp, run, c)
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
