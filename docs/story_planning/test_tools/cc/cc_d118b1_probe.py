"""CC（帳號 A）11-02：D118-B1（卡死與考試例外修正）的 BB 瀏覽器驗收探針。規格：D118_PLAN.md D118-B1「BB 驗收」1、2；通過條件照 BB_222 的 CAR-09、SE-07 共同規則
（TR 逐字稿、【前置／捷徑】、直向橫向各一張、真實流程 walkFallbacks=0）。階段 0＝修改前基準 a3b1bd647（D34：要先 FAIL），LAWWW 交件後用同一支跑修改後。
不是 iPhone：Playwright 手機橫向模擬（SwiftShader，1～4 fps）。

★年份的判斷（讀碼，src/postgrad3d.js:33 的 Y 表）：2029 那一輪＝筆記 2029-08-03、一試 2029-08-04（六）；2030 那一輪＝筆記 2030-08-02（五）、一試 2030-08-03（六）、
  9/6 一試放榜、10/19～20 二試、12/13 放榜。重考生（PG.retaker：BAR_SIT_2029 true、BAR_STAGE_2029 'none'＝2029 一試不到 12 題）考的是 2030-08-03。
  規格寫「2029-08-02 的重考存檔、8/3 不去考」：2029-08-02 時還沒考過 2029 一試、不可能是重考生；「8/2 存檔、隔天 8/3 一試」只對得上 2030 那一輪。
  所以這支照遊戲資料用 2030：存檔在 2030-08-02（五），錯過的是 2030-08-03（六）08:00～8/4 06:00 的一試（PG.STEPS exam_2030 的 at／until）。

★「8/3 不去考」在遊戲裡沒有玩家選項（讀碼，修改前、目前開發分支 d4398a91 都一樣）：
  - exam_2030 時間到了、玩家空下來（PG.tick）、睡覺（PG.sleepJump → PG.advance 先演 S.due）就直接開始考，沒有「出發／不去」的問題（examDay 一開始就 toAtLeast 8:00、出題）。
  - 住臺北的家（HOME_AFTER 不是 gongguan）：家的選單裡 PG.tick 不跑，但「在家休息一下」到 02:30 就沒有了、只剩「睡覺」＝PG.sleepJump＝8/4 02:30 也照樣開考（until 是 8/4 06:00）。
  - 外面坐著（P.seat）PG 不演，但 02:30 強制回家／回套房睡＝一樣開考。
  所以「錯過一試」唯一的來源是 PG.pending：現在時間已經超過 until（8/4 06:00）而 exam_2030 還沒演＝標 missed（Node 的 CAR-09 就是跳時間做出來的）。
  這支的 retake_skip 用【前置／捷徑】把存檔放在 2030-08-04 07:00（一試的時間窗已經過去、沒考）：等於「8/3 整天一直不空閒、沒去考」，也等於「已經卡在這個狀態的舊存檔」（CAR-09 的救援）。
  另外 retake_skip_home（不在預設裡）照真的玩家「8/2 晚上起整天待在家」：只按「在家休息一下」，沒有了才按「睡覺」——記錄考試會不會自己開始（預期會：玩家沒辦法不去考）；開始了就照常考完、一路到尾聲。

★11-02 更新（ba7983b6f＝D118-B1、B2 整合；讀碼＋node tests/d118_b1_unit.js ALL PASS）：加 midterm_gone、jp_makeup；既有三個情境的期待值核對過：
  - retake_*：修好的是 PG.pendingExam（exam_2030＝missed 就不等）；「錯過的人一句旁白」ba7983b6f 還沒做（D118_PLAN 第 13 節，字等 AA）＝8/4、8/5 那一段只記、預期沒有；
    第一份工作照片：錯過的人 S.firstLate 仍是 true＝「📷（照片：家裡的書桌。檯燈下面壓著一張讀書計畫。）」（RETAKE_STYLE home），只記。
  - guowen_w8：期待值不變（exam null、「下課了。」、出席 +1）；D118-B2 起博思 101 沒有 3D 黑板＝上課時多一句字幕 GAME.caption('黑板', 三行用全形空白接起來)，只記（board_captions）。

CASES（逗號隔開；每個 case 開一個新的瀏覽器、從最小存檔開始；預設 retake_skip,retake_saveload,guowen_w8,midterm_gone,jp_makeup）：
  midterm_gone     「期中沒有了」：【前置】最小存檔 2025-10-23（四）12:30 宿舍（大一上第 8 週；民法總則 13:20 法律系館A 201，考五題的法律課）→ 手機「課表」看最下面的「考試」那一格
                   （玩家畫面，直向橫向各一張；只讀對照 CLS.examList、第 8～9 週每一堂 CLS.dayItems 的 exam）→ 手機「今天」民總那一列「直接去上課」→ 照玩家上完。不用 turbo。
                   修改前預期 FAIL：課表考試清單有「期中」三科、民總那一堂 exam＝mid、「考卷發下來。民法總則期中練習（不算成績）。五題。」＋5 題、字幕「考完了。」、出席不加。
                   修改後預期 PASS：只有「期末」三科（憲法（上）、刑法總則（一）、民法總則）、exam null、黑板寫第 8 週（＝第 7 週的主題「民法總則：物」）、「下課了。」、出席 +1。
                   MG_KEY／MG_H／MG_CID 可以換一堂。
  jp_makeup        日本補修考原課五題：【前置】最小存檔（EXCHANGE_ROUTE JP、EXCH_RULE 1）2029-05-28（一）08:00 宿舍（civpro_2_re 週一上午 法律系館A 201）、
                   2029-05-31（四）08:00（insurance_re 週四上午 萬才館多功能教室）——大四下第 15 週＝期末週（calendar.js）。先只讀對照（抽題池、在複製的存檔上抽題、CLS.examDay），
                   那天有考試那一堂就手機「今天」→「直接去上課」→ 每題選第一個 → 記題數、R.exam 的五題是不是都在原課（大三下 civpro_2／insurance）的題庫。JP_SPECS 可以換日期。
                   ★讀碼＋Node（ba7983b6f）：做不到——大四下 calendar.js weeks:15（第 15 週是期末週），但 CLS.EXAM_WEEKS.final＝[16] → CLS.examDay 回 null →
                     dayItems 期末週把「考五題但沒有考試日」的課拿掉（5/28 只剩 legal_research）。只讀那幾項（考五題、抽題池＝原課、抽 5 題都在原課）PASS，
                     「CLS.examDay 有日期」「那天有考試那一堂」FAIL，輸出原因。同一個原因：大四下海商法（maritime，所有路線）也沒有期末考日——reportFor 寫「缺考（不及格）」、
                     CLS.failedIn 算被當（faildelay3d.js 6/18 成績單讀它）；修改前也沒有期末考日（只有期中），這不是 B1 新造成的，但 B1 讓補修兩門也變成考五題的課＝一起掉進來。交 LAWWW 確認。
                   修改前預期：5/28 那一堂在、exam final，但不是考五題的課＝「考卷發下來。民事訴訟法甲下期末考。」＋照讀書次數一句（0 題）→ 題數 FAIL。
  retake_skip      【前置】最小存檔 2030-08-04 07:00 公館（重考生、HOME_AFTER gongguan，exam_2030 沒演）→ 玩家：站著不動（畢業後篇＝跳到下一件事）、點對話、選項婉拒那一類、手機收起來
                   → 2030-10-01 21:00 第一份工作（FIRST_DAY_SEEN）→ 2034-06-03 19:00 尾聲（EPILOGUE_DONE）→ 回標題。
                   修改前預期 FAIL：PG.pendingExam 一直是 true（sits 2030、沒有 BAR_YEAR、r2_2030 的條件要 BAR_SIT_2030＝永遠不會演也不會標 missed）→ epi 的 cond 永遠 false、
                   PG.pending 裡沒有 epi → 第一份工作以後 PG.nextStop 變 null＝站著不動也不跳＝卡住（STUCK_S 秒沒變化），記卡在哪一天、nextStop、due、epi cond。
  retake_saveload  同一份重考進度存讀檔三次（都用遊戲的存檔畫面：☰ → 存檔 → 欄位 n「存檔」；重新整理 → 標題「讀取／匯入存檔」→ 欄位 n「讀取」）：
                   ① 一試前：最小存檔 2030-08-02 20:00 公館一讀進來馬上存到欄位 1 →（重新整理）讀欄位 1 → 確認還在 8/2、還沒考 →【捷徑】跳到 8/4 07:00（同 retake_skip 的理由）；
                   ② 錯過以後：exam_2030 標 missed、畫面空下來 → 存欄位 2 →（重新整理）讀欄位 2；
                   ③ 第一份工作以後（FIRST_DAY_SEEN、空下來；修改前這就是「已經卡住的舊存檔」）→ 存欄位 3 →（重新整理）讀欄位 3 → 一路到尾聲。
                   PASS 要：每次讀檔 exam_2030 的紀錄、BAR 旗標不變；讀檔後沒有再演一次讀檔前已經演過的句子（「不重複問」：同一句、同一天出現兩次）、沒有新的選單在問已經答過的事；不卡、尾聲照常。
  guowen_w8        【前置】最小存檔 2025-10-21（二）08:00 宿舍（大一上第 8 週＝calendar.js 的期中考週 exam:'mid'；大一國文（上）chinese_y1 週二上午 09:10～12:10 博思教學館 101）
                   → 手機「今天」→ 國文那一列「直接去上課」→ 照玩家：坐位子選「老位子／坐中間的位子」、點對話、選項第一個不是婉拒…… → 上完。不用 turbo。
                   修改前預期 FAIL：CLS.dayItems 給國文 exam:'mid'（classes3d.js:108，非法律課也標考試）→ 手機那一列「（考試）」、黑板「大一國文（上）：期中考」、
                   「考卷發下來。大一國文（上）期中考。」＋prep 那一句、字幕「考完了。」、R.attend.chinese_y1 不加（attend 的 else if(exam) 分支）。
                   PASS：exam 是 null、手機沒有「（考試）」、黑板／台詞沒有期中考、字幕「下課了。」、R.attend.chinese_y1 +1、walkFallbacks 0。

注意：STATE 會讀 PG.due／PG.nextStop／PG.pending（遊戲每 0.5 秒 PG.tick 自己也在叫；時間窗過了的場景在這裡被標 missed，和遊戲自己標的是同一件事、同一個時刻附近）。
記錄（只記不改）：TR 逐字稿 GAME.say／choose（連 hint）／caption／titleCard／toast／ADV.begin、cg／GAME.enter／PG.runStep／EVENTS.run／CLS.attend、goClass → <輸出>/transcript_<case>.json
  （retake_saveload 每一段分開記，另外存新增的手機訊息）；SV：第一份工作後、尾聲後（GAME.snapshot()＋fatiao3d_auto）→ sv_<case>_{first,epi}.json，retake_saveload 另存三個欄位的內容 sv_<case>_slot{1,2,3}.json；
  截圖：第一份工作的手機群組、尾聲最後一句（EPI.last）、卡住時、國文那一堂第一句——橫向＋直向各一張（390×844，截完轉回 844×390）。
check 只客觀記錄（判定由 BB 做；CC 的結果標「CC 初判」）。
用法：LW_TESTS=<工作樹>/tests SHA=<sha> CASES=retake_skip,retake_saveload,guowen_w8,midterm_gone,jp_makeup python3 cc_d118b1_probe.py '<URL>/index.html' <輸出資料夾>
  URL 可以帶或不帶 ?turbo：retake_* 一律自動加 ?turbo（長時間跳日期；TURBO_RETAKE=0 關掉）、guowen_w8、midterm_gone、jp_makeup 一律拿掉 turbo（真實上課流程）。
環境變數：LEAN（職涯傾向 A／B／C，預設 A＝法服週六去 10 次；同 cc_car_probe）、MISS_AT（retake 錯過以後的讀檔時間，預設 2030-08-04 07:00＝'2030-08-04@7'）、
  CASE_MAX（一個 case 的秒數上限，預設 4200）、STUCK_S（空著、時間和畫面都沒變多久算卡住，預設 240）、TRIP_MAX（上課那一趟，預設 1200）、
  MG_KEY／MG_H／MG_CID（midterm_gone 那一堂，預設 2025-10-23／12.5／civ_general）、JP_SPECS（jp_makeup，預設 '2029-05-28@8:civpro_2_re,2029-05-31@8:insurance_re'）。"""
import os, sys, json, asyncio, re, time, copy, traceback
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__)))); import bbplay as P   # bbplay 在上一層（BB 的 test_tools）
from playwright.async_api import async_playwright

URL0, OUT = sys.argv[1], sys.argv[2]
J = lambda o: json.dumps(o, ensure_ascii=False)
ENVI = lambda k, d: int(os.environ.get(k, str(d)))
CASES = [c.strip() for c in os.environ.get('CASES', 'retake_skip,retake_saveload,guowen_w8,midterm_gone,jp_makeup').split(',') if c.strip()]
LEAN = os.environ.get('LEAN', 'A')
_ma = os.environ.get('MISS_AT', '2030-08-04@7').split('@')
MISS_KEY, MISS_H = _ma[0], float(_ma[1] if len(_ma) > 1 else 7)
PRE_KEY, PRE_H = '2030-08-02', 20.0
LAND = {'width': 844, 'height': 390}; PORT = {'width': 390, 'height': 844}


def url_for(case):
    base, _, q = URL0.partition('?')
    ps = [x for x in q.split('&') if x and x != 'turbo']
    if case.startswith('retake') and os.environ.get('TURBO_RETAKE', '1') != '0': ps.append('turbo')
    return base + ('?' + '&'.join(ps) if ps else '')


def hm(h):
    if h is None: return '--:--'
    m = int(round(float(h) * 60)); return '%02d:%02d' % (m // 60, m % 60)


# ---------------------------------------------------------------- 存檔（cc_car_probe.py／cc_dl04b_probe.py 的 state_at，複製）
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
    'A': "F.LAWCLUB_SAT_VISITS=10;",
    'B': "F.Y4_PATH='grad'; delete F.GRAD_ADMIT; delete F.Y4_PUSH; G.stats=G.stats||{}; G.stats.study=Math.max(+G.stats.study||0,100); F.STUDY_AT_LAW=0;",
    'C': "G.vac=G.vac||{}; G.vac.reg=Object.assign(G.vac.reg||{},{'C08@2027':'done'});",
}
PREP_JS = """(()=>{ const G=GAME.G, F=G.flags;
  F.dating_kexin=false; if(F.romance) delete F.romance.kexin; F.ROMANCE_HISTORY=(F.ROMANCE_HISTORY||[]).filter(r=>r&&r.id!=='kexin'); delete F.DATED_1_kexin; delete F.KX_TOUR_YES;
  const R=CLS.rec(G); R.grades=R.grades||{}; R.grades.Y4S2=R.grades.Y4S2||{};
  PHONE.join(G,'noodle_team','麵店團');
  __LEAN__
  return {lean:STORY.careerLean(G),pgOn:PG.on(G),delayed:PG.delayed(G),retaker:PG.retaker(G),sits2029:PG.sits(G,2029),sits2030:PG.sits(G,2030),stage2029:PG.stage(G,2029),
          zone:G.zone,day:CALENDAR.dateOf(G.day).key,h:G.hour,home:!!(G.home&&G.home.at)}; })()"""


async def retake_state(pg, key, h, home='gongguan'):
    """重考生（2029 一試答對 5 題＝BAR_STAGE_2029 none；aa472_pg_unit.js 的 grad(...) 同一組旗標）＋已畢業、退宿（cc_car_probe 的畢業後最小存檔）"""
    gd = await pg.evaluate("PG.gradDay()"); mo = await pg.evaluate("PG.DK('2029-06-28')")
    flags = {'BAR_REG': True, 'BAR_SIT_2029': True, 'BAR_SCORE_2029': 5, 'BAR_STAGE_2029': 'none', 'RETAKE_STYLE': 'home',
             'GRADUATED': gd, 'GRAD_DONE': True, 'GRAD_EVENING': 'none', 'PACKED_Y4': gd - 1, 'MOVED_OUT': mo, 'HOME_AFTER': home,
             'FAIL_DELAY_COURSES': [], 'PG': {'done': {'grad': 1, 'exam_2029': 1, 'r1_2029': 1}}}
    st, d = await state_at(pg, key, h, 'gongguan', flags, done={e: 1 for e in Y4_EVENTS})
    if home != 'gongguan': st['home'] = {'at': True, 'day': d['d']}
    return st, d


async def load_retake(pg, cdp, run, st, label):
    """[前置] 讀檔（GAME.applySave）→ 【捷徑】用遊戲 API 補傾向、成績單、群組 → GAME.snapshot() 再讀一次（同 cc_car_probe 的 load）"""
    await L.load_state(pg, st, quiet_events=False, quiet_phone=False); await pg.evaluate(CLEARP)
    await pg.wait_for_timeout(2500)
    r = await pg.evaluate(PREP_JS.replace('__LEAN__', LEAN_JS[LEAN]))
    s2 = await pg.evaluate("()=>GAME.snapshot()")
    await L.load_state(pg, s2, quiet_events=False, quiet_phone=False); await pg.evaluate(CLEARP); await pg.wait_for_timeout(2000)
    run.setup('[前置] %s；【捷徑】讀檔後用遊戲 API 補：拿掉可昕交往、大四下成績單已發、加入麵店團、傾向 %s（%s）→ %s' % (label, LEAN, LEAN_JS[LEAN], J(r)))
    return r


# ---------------------------------------------------------------- 記錄（只記不改；cc_car_probe 的 HOOK＋cc_dl04b_probe 的 CLS.attend／goClass）
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
  if(typeof CLS!=='undefined'){
    if(CLS.attend){ const a0=CLS.attend; CLS.attend=async function(GM,it,o){ let m={}; try{ const G=GAME.G, R=CLS.rec(G); m={key:it.key,exam:it.exam||null,t0:it.t0,lateMin:+(+CLS.lateMin(G,it)).toFixed(2),att0:(R.attend[it.c.id]|0),door:!!(o&&o.door),status:CLS.status(G,it)}; }catch(e){ m={err:String(e.message)}; }
      push({k:'attend',n:(it&&it.key)||'',t:JSON.stringify(m)}); const r=await a0.apply(this,arguments);
      try{ const R=CLS.rec(GAME.G); push({k:'attended',n:it.key,t:JSON.stringify({ret:r,done:!!R.done[it.key],att:(R.attend[it.c.id]|0),prep:(R.prep[it.c.id]|0),late:!!(R.late&&R.late[it.key]),abs:!!(R.abs&&R.abs[it.key])})}); }catch(e){} return r; }; }
    if(CLS.goClass){ const g0=CLS.goClass; CLS.goClass=async function(GM,it,o){ push({k:'go',n:(it&&it.key)||'',t:JSON.stringify(Object.assign({exam:(it&&it.exam)||null},o||{}))}); return g0.apply(this,arguments); }; }
  }
  if(typeof W3!=='undefined'&&W3.canvasTex){ const k0=W3.canvasTex; W3.canvasTex=function(key){ if(typeof key==='string'&&key.indexOf('chalk_')===0) push({k:'board',n:'',t:key.slice(6)}); return k0.apply(this,arguments); }; }   /* 黑板（zones3d.js setBoard 的貼圖 key＝chalk_標題＋兩行）*/
  const te=document.getElementById('toast'); if(te){ let lt=''; new MutationObserver(()=>{ const h=(te.textContent||'').trim(); if(h&&h!==lt){ lt=h; push({k:'toast',n:'dom',t:h}); } }).observe(te,{childList:true,subtree:true,characterData:true}); }
  return 'ok'; })()"""


async def pl_len(pg):
    return await pg.evaluate("(window.__PL||[]).length")


async def rows(pg, n0=0, k=None):
    R = await pg.evaluate("n=>(window.__PL||[]).slice(n)", n0)
    return [r for r in R if k is None or r['k'] == k]


# ---------------------------------------------------------------- 頁面裡讀（只讀）
TARGETS = """(()=>{ const L=POSTGRAD_LINES; return {last:L.EPI.last, firstMe:L.FIRST.me, firstRetake:L.FIRST_RETAKE||null, end:L.EPI.end, title:L.EPI.title}; })()"""
STATE = """(()=>{ const G=GAME.G, F=G.flags||{}, r=(F.PG&&F.PG.done)||{}; let path=null, lean=null, epiCond=null, pend=null, due=null, ns=null, inPend=null;
  try{ path=PG.path(G); lean=STORY.careerLean(G); }catch(e){}
  try{ const ep=PG.byId('epi'); epiCond=!!ep.cond(G); }catch(e){ epiCond='ERR '+e.message; }
  try{ pend=PG.pendingExam?!!PG.pendingExam(G):null; }catch(e){}
  try{ due=(PG.due(G)||{}).id||null; ns=PG.nextStop(G); inPend=PG.pending(G).map(x=>x.s.id).slice(0,8); }catch(e){}
  const pick={}; for(const k of Object.keys(F)) if(/^(BAR_REG|BAR_REG_2030|BAR_SIT_\\d+|BAR_SCORE_\\d+|BAR_STAGE_\\d+|BAR_YEAR|RETAKE_STYLE|GRADUATED|FIRST_DAY_SEEN|EPILOGUE_DONE|HOME_AFTER|MOVED_OUT|FAIL_DELAY_COURSES)$/.test(k)) pick[k]=F[k];
  return {flags:pick, done:r, exam2030:r.exam_2030||null, path, lean, pgOn:PG.on(G), retaker:PG.retaker(G), sits2030:PG.sits(G,2030), pendingExam:pend, epiCond, due,
    nextStop:ns, nextStopKey:ns==null?null:CALENDAR.dateOf(Math.floor(ns/24)).key+' '+(ns%24).toFixed(2), pending:inPend,
    title:!document.getElementById('titleScreen').classList.contains('hide'), home:!!(G.home&&G.home.at),
    clock:{key:CALENDAR.dateOf(G.day).key, h:+(+G.hour).toFixed(3), zone:G.zone}, nmsg:(G.msgs||[]).length, wf:(GAME.walkFallbacks|0)}; })()"""
MSGS = "(n=>(GAME.G.msgs||[]).slice(n).map(m=>({th:m.th||null,from:m.from||null,who:m.who||null,name:m.name||null,tag:m.tag||null,day:m.day,h:m.h,text:String(m.text==null?'':m.text)})))"
PHONE_TXT = "(()=>(document.getElementById('phoneBody')||{}).innerText||'')()"
MUST = "(()=>{ try{ return !!(PHONE.mustOpen&&PHONE.mustOpen(GAME.G)); }catch(e){ return false; } })()"
SNAP_SAVE = "(()=>{ let snap=null, auto=null; try{ snap=GAME.snapshot(); }catch(e){ snap={err:String(e.message)}; } try{ auto=JSON.parse(localStorage.getItem('fatiao3d_auto')||'null'); }catch(e){ auto={err:String(e.message)}; } return {snap,auto}; })()"
SLOT_SUM = """(i=>{ try{ const s=JSON.parse(localStorage.getItem('fatiao3d_slot_'+i)||'null'); if(!s) return null; const F=s.flags||{}, r=(F.PG&&F.PG.done)||{};
  return {day:CALENDAR.dateOf(s.day).key, h:s.hour, zone:s.zone, home:!!(s.home&&s.home.at), exam2030:r.exam_2030||null, r1_2030:r.r1_2030||null, first:r.first||null, epi:r.epi||null,
          BAR_SIT_2029:F.BAR_SIT_2029, BAR_STAGE_2029:F.BAR_STAGE_2029, BAR_SIT_2030:F.BAR_SIT_2030, BAR_YEAR:F.BAR_YEAR, FIRST_DAY_SEEN:F.FIRST_DAY_SEEN||null, EPILOGUE_DONE:F.EPILOGUE_DONE||null, savedAt:s.savedAt}; }catch(e){ return {err:String(e.message)}; } })"""
SLOT_RAW = "(i=>{ try{ return JSON.parse(localStorage.getItem('fatiao3d_slot_'+i)||'null'); }catch(e){ return {err:String(e.message)}; } })"

DEBUG_RE = re.compile(r'undefined|NaN|📷\s*$|📷undefined|\bnull\b|\{name\}|\{item\}|\{課名\}|\b(?:heroine_0\d|classmate_[a-z]+|npc_[a-z]+|econ_[a-z]+|pg_[a-z0-9_]+|ev_[a-z0-9_]+|A_bar|A_none|B_grad|B_quit|C_zq|BAR_[A-Z0-9_]+)\b')
DECL = ('不去了', '先不', '不用了', '算了', '就這樣', '先這樣', '沒事', '先不睡')
HOME_PICKS = ('在家休息一下', '睡覺')   # retake_skip_home：整天待在家
Q_RE = re.compile(r'^(\d+)／(\d+)　')


def pick_menu(T, home=False):
    """家的選單（retake_skip_home）：「在家休息一下」→「睡覺」（不出門）。出遊提醒：「不去了」。其他：婉拒那一類 → 第一個不是「出發：」「存檔」的"""
    if home:
        for p in HOME_PICKS:
            k = next((i for i, t in enumerate(T) if t.startswith(p)), None)
            if k is not None: return k, 'home-' + p
    k = next((i for i, t in enumerate(T) if t.startswith('不去了')), None)
    if k is not None and any(t.startswith(('出發：', '直接過去：')) for t in T): return k, 'outing-no'
    for w in DECL:
        for i, t in enumerate(T):
            if t.startswith(w): return i, 'decline'
    for i, t in enumerate(T):
        if not t.startswith(('出發：', '接起來：', '出門')) and '存檔' not in t: return i, 'first'
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


# ---------------------------------------------------------------- 畢業後篇照玩家過（cc_car_probe 的 one_case 迴圈，拆成可以停在某個條件）
async def play(pg, cdp, run, tag, until, T, ctx, home=False, max_s=None):
    """照玩家：站著不動（畢業後篇 2 秒＝跳到下一件事）、點對話、選項 pick_menu、手機收起來。until(g, free)→True 就停（畫面空下來那一刻）。
    ctx：整個 case 共用（sv、shots、exam_q、first_phone、days、stuck）。回傳 'until'｜'title'｜'stuck'｜'timeout'"""
    t0 = time.time(); last = None; since = time.time(); lastday = None
    while time.time() - t0 < (max_s or ENVI('CASE_MAX', 4200)):
        s = await P.ts(pg); g = await pg.evaluate(STATE)
        if g['clock']['key'] != lastday: ctx['days'].append([g['clock']['key'], hm(g['clock']['h'])]); lastday = g['clock']['key']
        free = not s['dlg'] and not s['ch'] and not s['busy'] and s['depth'] == 0 and not s['phone']
        F = g['flags']
        if 'first' not in ctx['sv'] and F.get('FIRST_DAY_SEEN') and free:
            ctx['sv']['first'] = await pg.evaluate(SNAP_SAVE); run.note('%s：SV 第一份工作後 %s %s' % (tag, g['clock']['key'], hm(g['clock']['h'])))
        if 'epi' not in ctx['sv'] and F.get('EPILOGUE_DONE'):
            ctx['sv']['epi'] = await pg.evaluate(SNAP_SAVE); run.note('%s：SV 尾聲後 %s %s' % (tag, g['clock']['key'], hm(g['clock']['h'])))
        if F.get('EPILOGUE_DONE') and g['title'] and free:
            await pg.wait_for_timeout(1500); ctx['shots']['title'] = await run.shot(pg, tag + '_title_after_epi'); return 'title'
        if free and until(g, free): return 'until'
        sig = (g['clock']['key'], g['clock']['h'], s['zone'], s['txt'][:40], tuple(o['t'] for o in s['ch']), s['busy'], s['depth'] > 0, s['phone'], g['nmsg'], g['home'])
        if sig != last: last = sig; since = time.time()
        elif time.time() - since > ENVI('STUCK_S', 240):
            ctx['stuck'] = {'clock': g['clock'], 'ts': {k: s[k] for k in ('dlg', 'txt', 'busy', 'depth', 'phone', 'zone')}, 'ch': s['ch'], 'nextStop': g['nextStopKey'],
                            'due': g['due'], 'epiCond': g['epiCond'], 'pendingExam': g['pendingExam'], 'exam2030': g['exam2030'], 'pending': g['pending']}
            ctx['shots']['stuck'] = await shoot_both(pg, run, tag + '_stuck'); return 'stuck'
        if s['ch']:
            Tt = [o['t'] for o in s['ch']]
            R = await rows(pg, max(0, (await pl_len(pg)) - 6))
            lastsay = next((x for x in reversed(R) if x['k'] == 'say'), None)
            m = Q_RE.match(lastsay['t']) if lastsay else None
            if m:   # 國考考卷（retake_skip_home：考試自己開始了）：記下來、按第一個選項
                i = int(m.group(1))
                if ctx['exam_q'].get(lastsay['d'] + '#' + str(i)): await pg.wait_for_timeout(600); continue
                ctx['exam_q'][lastsay['d'] + '#' + str(i)] = 1
                if len(ctx['exam_q']) == 1: ctx['shots']['exam_q1'] = await shoot_both(pg, run, tag + '_exam_q1')
                await P.tap_choice(pg, cdp, 0); await pg.wait_for_timeout(900); continue
            k, why = pick_menu(Tt, home)
            run.note('%s %s %s %s 選項 %s → %s（%s）' % (tag, g['clock']['key'], hm(g['clock']['h']), s['zone'], J([t[:28] for t in Tt]), Tt[k][:30], why))
            await P.tap_choice(pg, cdp, k); await pg.wait_for_timeout(1000); continue
        if s['phone'] and not s['dlg']:
            if F.get('FIRST_DAY_SEEN') and ctx['first_phone'] is None:
                await pg.wait_for_timeout(1200)
                ctx['first_phone'] = {'text': await pg.evaluate(PHONE_TXT), 'shot': await shoot_both(pg, run, tag + '_first_day_phone')}
                run.note('%s：第一份工作（手機群組）畫面文字：%s' % (tag, ctx['first_phone']['text'][:900]))
            await L.phone_away(pg, cdp, tries=2); await pg.wait_for_timeout(500)
            if await pg.evaluate("!!(GAME.phoneIsOpen&&GAME.phoneIsOpen())"): await phone_unblock(pg, cdp, run, tag)
            continue
        if s['dlg']:
            R = await rows(pg, max(0, (await pl_len(pg)) - 10))
            full = next((x['t'] for x in reversed(R) if x['k'] == 'say'), '')
            if 'last' not in ctx['shots'] and full in list(T['last'].values()):
                ctx['shots']['last'] = await shoot_both(pg, run, tag + '_epi_last', full)
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(550); continue
        await pg.wait_for_timeout(900)
    return 'timeout'


def new_ctx():
    return {'sv': {}, 'shots': {}, 'exam_q': {}, 'first_phone': None, 'days': [], 'stuck': None}


def debug_bad(R, msgs):
    bad = []
    for x in R:
        if x['k'] in ('say', 'choose', 'cap', 'card', 'toast') and DEBUG_RE.search((x.get('n') or '') + ' ' + x['t']): bad.append([x['k'], x.get('d'), x['t'][:80]])
    for m in msgs:
        if DEBUG_RE.search(m['text']) or m['text'].strip() in ('📷', ''): bad.append(['msg', m.get('tag'), m['text'][:80]])
    return bad


def dump(name, obj):
    with open(os.path.join(OUT, name), 'w', encoding='utf-8') as f: json.dump(obj, f, ensure_ascii=False, indent=1)


def retake_checks(run, tag, g, R, msgs, ctx, T, n_loads=1):
    F = g['flags']; said = [x for x in R if x['k'] == 'say']
    steps = [x['t'] for x in R if x['k'] == 'step' and x['n'] == 'end']
    run.note('%s：場景順序 %s' % (tag, J(steps)))
    run.note('%s：日期卡 %s' % (tag, J([[x['d'], x['n'], x['t']] for x in R if x['k'] == 'card'])[:2500]))
    miss_l = [[x['d'], hm(x['h']), x['t']] for x in said if x.get('d', '') in ('2030-08-04', '2030-08-05')]
    run.note('%s：錯過一試那兩天（8/4、8/5）的旁白／台詞（D118-B1 第 1 點「錯過的人給一句旁白」；ba7983b6f 還沒做——D118_PLAN 第 13 節「B1 還沒做的兩件」①，字等 AA；預期空的）：%s' % (tag, J(miss_l)))
    fd = [m for m in msgs if m.get('tag') == 'pg_first_day']
    run.note('%s：第一份工作（pg_first_day）原文：%s；FIRST_RETAKE 對照 %s' % (tag, J([[m['from'], m['text']] for m in fd]), J(T.get('firstRetake'))))
    want = '📷' + ((T.get('firstRetake') or {}).get(F.get('RETAKE_STYLE') or 'home') or '')
    run.note('%s：CC 初判（只記不判）：讀碼 postgrad3d.js firstDay：S.firstLate＝報了 2030、沒有 BAR_YEAR＝錯過一試的人也算「還在準備」→ 第一張照片照 RETAKE_STYLE＝%s；'
             '畫面第一句 %s（一樣＝%s）。錯過的人用「還在準備二試」那一版合不合理交 BB／AA（D118_PLAN 第 13 節②同一類）'
             % (tag, J(want), J(fd[0]['text'] if fd else None), bool(fd) and fd[0]['text'] == want))
    r16 = [[m.get('tag'), m['text'][:60]] for m in msgs if re.search(r'pg_(r1|r2|e2)[a-z]*_2030|pg_r1g_2030|pg_r2g_2030', m.get('tag') or '')]
    run.note('%s：錯過一試以後還收到的 2030 放榜相關訊息（只記，BB 判斷合不合理）：%s' % (tag, J(r16)))
    run.check('%s：exam_2030＝missed（沒考、錯過）、沒有 BAR_SIT_2030' % tag, g['exam2030'] == 'missed' and not F.get('BAR_SIT_2030'), J({'exam2030': g['exam2030'], 'flags': F}))
    run.check('%s：第一份工作那一段演了（FIRST_DAY_SEEN）' % tag, bool(F.get('FIRST_DAY_SEEN')), J(F))
    lastl = [x for x in said if x['t'] in T['last'].values()]
    run.note('%s：尾聲最後一句 %s；PG.path＝%s' % (tag, J([[x['d'], x['n'], x['t']] for x in lastl]), g['path']))
    run.check('%s：尾聲演完（EPILOGUE_DONE）、回到標題' % tag, bool(F.get('EPILOGUE_DONE')) and g['title'], J({'clock': g['clock'], 'title': g['title']}))
    run.check('%s：沒有卡住（修改前預期卡住：epi cond false、nextStop null）' % tag, ctx['stuck'] is None, J(ctx['stuck']))
    bad = debug_bad(R, msgs)
    run.check('%s：逐字稿、新訊息沒有 debug 字（undefined、NaN、null、{name}、內部 id）' % tag, not bad, J(bad[:12]))
    run.check('%s：GAME.walkFallbacks＝0' % tag, g.get('wf', 0) == 0, J(g.get('wf')))


# ================================================================ a. retake_skip
async def case_retake_skip(pg, cdp, run, case):
    tag = case; T = await pg.evaluate(TARGETS); ctx = new_ctx()
    home = 'home' if case == 'retake_skip_home' else 'gongguan'
    if home == 'home':
        st, d = await retake_state(pg, PRE_KEY, PRE_H, 'home')
        r = await load_retake(pg, cdp, run, st, '%s：最小存檔 %s %s 臺北的家（重考生、HOME_AFTER home、G.home.at；exam_2030 還沒演）——之後照玩家整天待在家' % (tag, d['key'], hm(PRE_H)))
    else:
        st, d = await retake_state(pg, MISS_KEY, MISS_H, 'gongguan')
        r = await load_retake(pg, cdp, run, st, '%s：最小存檔 %s %s 公館（重考生、HOME_AFTER gongguan；exam_2030 沒演＝一試時間窗 8/3 08:00～8/4 06:00 已過、沒去考。'
                                                '【捷徑】理由：遊戲沒有「不去考」的選項，見檔頭）' % (tag, d['key'], hm(MISS_H)))
    s0 = await pg.evaluate(STATE)
    run.check('%s：前置成立：畢業後篇（PG.on）、重考生（PG.retaker）、2030 會考（PG.sits 2030）、沒有延畢' % tag,
              bool(r.get('pgOn')) and bool(r.get('retaker')) and bool(r.get('sits2030')) and not r.get('delayed'), J(s0))
    run.note('%s：讀檔後 exam_2030＝%s、pendingExam＝%s、epi cond＝%s、nextStop＝%s、pending＝%s' % (tag, s0['exam2030'], s0['pendingExam'], s0['epiCond'], s0['nextStopKey'], J(s0['pending'])))
    nmsg0 = s0['nmsg']; n0 = await pl_len(pg)
    res = await play(pg, cdp, run, tag, lambda g, f: False, T, ctx, home=(home == 'home'))
    g = await pg.evaluate(STATE); R = await rows(pg, n0); msgs = await pg.evaluate(MSGS, nmsg0)
    dump('transcript_%s.json' % tag, {'case': case, 'sha': os.environ.get('SHA', '?'), 'url': url_for(case), 'result': res, 'rows': R, 'msgs': msgs, 'days': ctx['days'],
                                       'end': g, 'first_phone': ctx['first_phone'], 'stuck': ctx['stuck'], 'shots': ctx['shots'], 'exam_q': len(ctx['exam_q'])})
    for k, v in ctx['sv'].items(): dump('sv_%s_%s.json' % (tag, k), v)
    if home == 'home':
        ex = [x for x in R if x['k'] == 'step' and x['t'].startswith('exam_2030')]
        run.check('%s：8/3 整天待在家（只按「在家休息一下」「睡覺」）考試沒有自己開始（＝玩家可以不去考）' % tag, not ex and not ctx['exam_q'],
                  J({'exam_step': [[x['n'], x['d'], hm(x['h'])] for x in ex], 'exam_questions_seen': len(ctx['exam_q'])}))
        run.note('%s：這個 case 若考試自己開始，之後是照常考完的路線（不是錯過的路線），下面的 exam_2030＝missed 那一項本來就不會過' % tag)
    retake_checks(run, tag, g, R, msgs, ctx, T)
    run.note('%s：結束 %s（%s）；截圖 %s' % (tag, J(g['clock']), res, J(ctx['shots'])))


# ================================================================ b. retake_saveload
SAVE_BTN = """(([i,label])=>{ const box=document.getElementById('saveSlots'); if(!box) return null; const it=[...box.querySelectorAll('.item')].find(x=>{ const b=x.querySelector('b'); return b&&(b.textContent||'').trim()==='欄位 '+i; });
  if(!it) return null; const btn=[...it.querySelectorAll('button')].find(b=>(b.textContent||'').trim()===label); if(!btn) return null; document.querySelectorAll('#__d118btn').forEach(e=>e.removeAttribute('id')); btn.id='__d118btn'; return (it.innerText||'').replace(/\\s+/g,' ').slice(0,160); })"""


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
    run.note('%s：存到欄位 %d（畫面那一格原本：%s）→ 欄位內容 %s；截圖 %s' % (tag, i, row, J(sm), p))
    dump('sv_%s_slot%d.json' % (tag, i), await pg.evaluate(SLOT_RAW, i))
    return sm


async def ui_reload_load(pg, cdp, run, tag, i, url):
    """重新整理 → 標題「讀取／匯入存檔」→ 欄位 i「讀取」；回傳讀進來以後（已經在遊戲裡）的 STATE。HOOK 重新掛（逐字稿分段）"""
    await pg.goto(url); ok = await L.wait_loaded(pg); run.check('%s：重新整理後遊戲載入' % tag, ok)
    await P.init(pg); await pg.evaluate(HOOK)
    sm = await pg.evaluate(SLOT_SUM, i)
    await L.tap(pg, cdp, '#btnLoadMenu'); await pg.wait_for_timeout(1200)
    row = await pg.evaluate(SAVE_BTN, [i, '讀取'])
    if row is None or not sm: run.check('%s：標題「讀取」頁有欄位 %d 的「讀取」' % (tag, i), False, J(sm)); return None
    await L.tap(pg, cdp, '#__d118btn')
    W = "(([k,h])=>{ try{ return document.getElementById('titleScreen').classList.contains('hide')&&!!GAME.G&&CALENDAR.dateOf(GAME.G.day).key===k&&Math.abs(GAME.G.hour-h)<0.6; }catch(e){ return false; } })"
    got = False
    for _ in range(900):   # 讀進來那一刻就往下（① 要趕在畢業後篇空下來 2 秒就跳之前）
        if await pg.evaluate(W, [sm['day'], sm['h']]): got = True; break
        await pg.wait_for_timeout(100)
    if not got: run.check('%s：讀欄位 %d 讀進來（日期 %s）' % (tag, i, sm['day']), False); return None
    g = await pg.evaluate(STATE)
    run.setup('%s：重新整理 → 標題「讀取／匯入存檔」→ 欄位 %d「讀取」（%s）→ 讀進來 %s' % (tag, i, row, J({k: g[k] for k in ('clock', 'exam2030', 'flags', 'pendingExam', 'epiCond')})))
    return g


def dup_lines(A, B):
    """B 段（讀檔以後）出現了 A 段（讀檔以前）已經演過的同一句、同一天（不算系統字的考卷、日期卡）"""
    seen = {(x.get('d'), x['t']) for x in A if x['k'] in ('say', 'choose')}
    return [[x['k'], x.get('d'), x['t'][:80]] for x in B if x['k'] in ('say', 'choose') and (x.get('d'), x['t']) in seen]


async def case_retake_saveload(pg, cdp, run, case):
    tag = case; T = await pg.evaluate(TARGETS); ctx = new_ctx(); url = url_for(case); segs = []; nmsg0 = None
    # ① 一試前存檔、讀檔
    st, d = await retake_state(pg, PRE_KEY, PRE_H, 'gongguan')
    await L.load_state(pg, st, quiet_events=False, quiet_phone=False); await pg.evaluate(CLEARP)
    r = await pg.evaluate(PREP_JS.replace('__LEAN__', LEAN_JS[LEAN]))
    run.setup('[前置] %s ①：最小存檔 %s %s 公館（重考生、還沒考 2030）；【捷徑】讀檔後用遊戲 API 補傾向 %s 等（同 retake_skip）→ %s；讀進來馬上存（畢業後篇空下來 2 秒就會跳）'
              % (tag, d['key'], hm(PRE_H), LEAN, J(r)))
    s1 = await ui_save(pg, cdp, run, tag, 1)
    g1 = await ui_reload_load(pg, cdp, run, tag, 1, url)
    if g1 is None: return
    run.check('%s ①：讀欄位 1 以後還在 %s、exam_2030 沒演、BAR 旗標和存檔前一樣（重考生）' % (tag, PRE_KEY),
              g1['clock']['key'] == PRE_KEY and not g1['exam2030'] and g1['flags'].get('BAR_STAGE_2029') == 'none' and g1['retaker'], J({'slot': s1, 'loaded': g1}))
    # 【捷徑】跳到一試時間窗以後
    dd = await P.day_of(pg, MISS_KEY)
    js = "(([day,wd,h])=>{ const s=GAME.snapshot(); s.day=day; s.weekday=wd; s.hour=h; return s; })"
    s2 = await pg.evaluate(js, [dd['d'], dd['wd'], MISS_H])
    await L.load_state(pg, s2, quiet_events=False, quiet_phone=False); await pg.evaluate(CLEARP); await pg.wait_for_timeout(1500)
    run.setup('%s ①→②：【捷徑】讀欄位 1 的進度只把時間改到 %s %s（一試時間窗已過、沒考；遊戲沒有「不去考」的選項，見檔頭）再讀一次' % (tag, MISS_KEY, hm(MISS_H)))
    g = await pg.evaluate(STATE); nmsg0 = g['nmsg']; n0 = await pl_len(pg)
    run.note('%s ②：讀檔後 exam_2030＝%s、pendingExam＝%s、epi cond＝%s、nextStop＝%s' % (tag, g['exam2030'], g['pendingExam'], g['epiCond'], g['nextStopKey']))
    # ② 錯過以後（標 missed、畫面空下來、8/4 的旁白演完）存、讀
    t_free = [None]

    def after_miss(gg, free):
        if gg['exam2030'] != 'missed': return False
        if t_free[0] is None: t_free[0] = time.time()
        return time.time() - t_free[0] > 6
    res = await play(pg, cdp, run, tag + '_seg2', after_miss, T, ctx, max_s=900)
    segA = await rows(pg, n0); segs.append({'seg': '②前（錯過、存欄位 2 以前）', 'result': res, 'rows': segA, 'msgs': await pg.evaluate(MSGS, nmsg0)})
    if res != 'until': run.check('%s ②：錯過一試以後畫面空下來（才能存檔）' % tag, False, J({'res': res, 'stuck': ctx['stuck']})); return finish_saveload(run, tag, segs, ctx, T, None)
    s2s = await ui_save(pg, cdp, run, tag, 2)
    g2 = await ui_reload_load(pg, cdp, run, tag, 2, url)
    if g2 is None: return finish_saveload(run, tag, segs, ctx, T, None)
    run.check('%s ②：讀欄位 2 以後 exam_2030 仍是 missed、沒有 BAR_SIT_2030、日期和存檔時一樣' % tag,
              g2['exam2030'] == 'missed' and not g2['flags'].get('BAR_SIT_2030') and s2s is not None and g2['clock']['key'] == s2s.get('day'), J({'slot': s2s, 'loaded': g2}))
    nm = g2['nmsg']; n0 = await pl_len(pg)
    # ③ 第一份工作以後存、讀
    t_free2 = [None]

    def after_first(gg, free):
        if not gg['flags'].get('FIRST_DAY_SEEN'): return False
        if t_free2[0] is None: t_free2[0] = time.time()
        return time.time() - t_free2[0] > 6
    res = await play(pg, cdp, run, tag + '_seg3', after_first, T, ctx)
    segB = await rows(pg, n0); segs.append({'seg': '②後～③前（讀欄位 2 → 第一份工作、存欄位 3 以前）', 'result': res, 'rows': segB, 'msgs': await pg.evaluate(MSGS, nm)})
    run.check('%s ②：讀檔後沒有重演讀檔前演過的句子／選單（同一句、同一天）' % tag, not dup_lines(segA, segB), J(dup_lines(segA, segB)[:10]))
    if res != 'until': run.check('%s ③：第一份工作以後畫面空下來（才能存檔）' % tag, False, J({'res': res, 'stuck': ctx['stuck']})); return finish_saveload(run, tag, segs, ctx, T, None)
    s3s = await ui_save(pg, cdp, run, tag, 3)
    g3 = await ui_reload_load(pg, cdp, run, tag, 3, url)
    if g3 is None: return finish_saveload(run, tag, segs, ctx, T, None)
    run.check('%s ③：讀欄位 3 以後 exam_2030 仍是 missed、FIRST_DAY_SEEN 還在' % tag, g3['exam2030'] == 'missed' and bool(g3['flags'].get('FIRST_DAY_SEEN')), J({'slot': s3s, 'loaded': g3}))
    run.note('%s ③：讀檔後 pendingExam＝%s、epi cond＝%s、nextStop＝%s、pending＝%s（修改前預期 epi cond false、nextStop null 或只剩訊息）' % (tag, g3['pendingExam'], g3['epiCond'], g3['nextStopKey'], J(g3['pending'])))
    nm = g3['nmsg']; n0 = await pl_len(pg)
    res = await play(pg, cdp, run, tag + '_seg4', lambda gg, f: False, T, ctx)
    segC = await rows(pg, n0); segs.append({'seg': '③後（讀欄位 3 → 尾聲）', 'result': res, 'rows': segC, 'msgs': await pg.evaluate(MSGS, nm)})
    run.check('%s ③：讀檔後沒有重演讀檔前演過的句子／選單（同一句、同一天）' % tag, not dup_lines(segB, segC), J(dup_lines(segB, segC)[:10]))
    finish_saveload(run, tag, segs, ctx, T, await pg.evaluate(STATE))


def finish_saveload(run, tag, segs, ctx, T, g):
    dump('transcript_%s.json' % tag, {'case': tag, 'sha': os.environ.get('SHA', '?'), 'segments': segs, 'days': ctx['days'], 'end': g, 'first_phone': ctx['first_phone'],
                                       'stuck': ctx['stuck'], 'shots': ctx['shots']})
    for k, v in ctx['sv'].items(): dump('sv_%s_%s.json' % (tag, k), v)
    if g is None:
        run.check('%s：三次存讀檔都做完、走到尾聲' % tag, False, J({'stuck': ctx['stuck'], 'segs': [s['seg'] + ':' + s['result'] for s in segs]}))
        return
    R = [x for s in segs for x in s['rows']]; msgs = [m for s in segs for m in s['msgs']]
    retake_checks(run, tag, g, R, msgs, ctx, T)


# ================================================================ c. guowen_w8
GW_KEY, GW_H, GW_CID = '2025-10-21', 8.0, 'chinese_y1'
ITEM = r"""(cid=>{ try{ const G=GAME.G; const it=CLS.dayItems(G).find(q=>q.c&&q.c.id===cid); if(!it) return null; const rm=it.room||{}, t=CALENDAR.termOf(G.day);
  return {key:it.key,cid:it.c.id,name:it.c.name,kind:it.c.kind||null,t0:it.t0,t1:it.t1,room:rm.name||null,zone:rm.zone||null,exam:it.exam||null,week:it.week,term:it.term,termExam:t&&t.exam||null,
          isExamCourse:!!CLS.isExamCourse(it.c),status:CLS.status(G,it),att:(CLS.rec(G).attend[cid]|0),prep:(CLS.rec(G).prep[cid]|0),dayLabel:CLS.dayLabel(G),todayLine:CLS.todayLine(G)}; }catch(e){ return 'ERR '+e.message; } })"""
KEYST = """(key=>{ try{ const G=GAME.G, it=CLS.dayItems(G).find(q=>q.key===key), R=CLS.rec(G), c=it&&it.c;
  return {status:it?CLS.status(G,it):null,done:!!R.done[key],late:!!(R.late&&R.late[key]),abs:!!(R.abs&&R.abs[key]),att:c?((R.attend&&R.attend[c.id])|0):null}; }catch(e){ return {err:String(e.message)}; } })"""
BTN_TXT = "(s=>{ const e=document.querySelector(s); return e?(e.textContent||'').trim():null; })"
PHROW = """(name=>{ const b=document.getElementById('phoneBody'); if(!b) return null; const e=[...b.querySelectorAll('.item.phrow')].find(x=>(x.innerText||'').indexOf(name)>=0);
  if(!e) return null; e.scrollIntoView({block:'center'}); return (e.innerText||'').replace(/\\s+/g,' ').trim(); })"""
GO_PICKS = ('繼續去上課', '照樣跳過', '老位子', '坐中間的位子', '還是進去聽', '先自由活動')
CDECL = ('晚一點', '不去了', '先不', '不用了', '算了', '就這樣', '先這樣', '沒事', '「我晚上要念書。」', '「那天我有事。」', '「我也要念書。」', '「我週六有事。」')
EXAM_WORDS = ('考卷發下來', '期中考。', '：期中考', '考完了。', '認得題目裡的每一個字', '題目你都見過——', '有幾題你有印象', '不可以翻書', '鈴響請停筆')   # classes3d.js attend 的考試分支、examBoard 的原文（不用單獨的「期末考」：一般上課黑板第三行會寫「第 16 週期末考」）


def cpick(ch):
    T = [o['t'] for o in ch]; live = [i for i, o in enumerate(ch) if not o['dim']] or list(range(len(ch)))
    for p in GO_PICKS:
        for i in live:
            if T[i].startswith(p): return i, 'pick'
    for w in CDECL:
        for i in live:
            if T[i].startswith(w): return i, 'decline'
    for i in live:
        if not T[i].startswith(('出發：', '直接過去：', '接起來：', '上線：')) and '存檔' not in T[i]: return i, 'first'
    return live[0], 'first'


WK_TXT = """(()=>{ const b=document.getElementById('phoneBody'); if(!b) return null; const ex=[...b.querySelectorAll('.item')].find(e=>{ const h=e.querySelector('b'); return h&&(h.textContent||'').trim()==='考試'; });
  if(ex) ex.scrollIntoView({block:'center'}); return {exam:ex?[...ex.querySelectorAll('div')].map(d=>(d.innerText||'').replace(/\\s+/g,' ').trim()).filter(Boolean):null, all:(b.innerText||'').slice(0,1500)}; })()"""
EXAMRO = r"""(([d8,n])=>{ try{ const G=GAME.G, t=CALENDAR.termOf(G.day), out={list:CLS.examList(G,t.id).map(e=>({cid:e.c.id,kind:e.kind,day:CALENDAR.dateOf(e.day).key,block:e.block})), wk:[]};
  for(let d=d8;d<d8+n;d++){ for(const it of CLS.dayItems(G,d)) out.wk.push({d:CALENDAR.dateOf(d).key,cid:it.c.id,exam:it.exam||null,law:!!CLS.isExamCourse(it.c),week:it.week}); } return out; }catch(e){ return 'ERR '+e.message; } })"""


async def class_trip(pg, cdp, run, tag, it, n0, pick=None):
    """手機「今天」那一列「直接去上課」已經按了以後：照玩家走完那一堂（選項 cpick；pick(s, R) 回傳 index 可以先決定）。回傳 {ok, stuck, shot_cls}"""
    t0 = time.time(); last = None; since = time.time(); shot_cls = None; stuck = None; ok = False
    while time.time() - t0 < ENVI('TRIP_MAX', 1200):
        s = await P.ts(pg)
        R = await rows(pg, n0)
        att_started = any(r['k'] == 'attend' and r['n'] == it['key'] for r in R)
        attended = any(r['k'] == 'attended' and r['n'] == it['key'] for r in R)
        free = not s['dlg'] and not s['ch'] and not s['busy'] and s['depth'] == 0 and not s['phone']
        if attended and free: ok = True; break
        sig = (s['day'], s['zone'], s['txt'][:40], tuple(o['t'] for o in s['ch']), s['busy'], s['depth'] > 0, round(s['h'], 2))
        if sig != last: last = sig; since = time.time()
        elif time.time() - since > ENVI('STUCK_S', 240):
            stuck = {'clock': await P.clock(pg), 'ts': {k: s[k] for k in ('dlg', 'txt', 'busy', 'depth', 'phone', 'zone')}}
            await shoot_both(pg, run, tag + '_stuck'); break
        if s['phone'] and not s['ch'] and not s['dlg']: await L.phone_away(pg, cdp, tries=1); await pg.wait_for_timeout(500); continue
        if s['ch']:
            k = pick(s, R) if pick else None; why = 'pick-fn'
            if k is None: k, why = cpick(s['ch'])
            Tt = [o['t'] for o in s['ch']]
            run.note('%s %s %s 選項 %s → %s（%s）' % (tag, hm(s['h']), s['zone'], J([t[:24] for t in Tt]), Tt[k][:30], why))
            await P.tap_choice(pg, cdp, k); await pg.wait_for_timeout(1000); continue
        if s['dlg']:
            if att_started and shot_cls is None:
                full = next((x['t'] for x in reversed(R) if x['k'] == 'say'), '')
                shot_cls = {'line': full, 'shots': await shoot_both(pg, run, tag + '_class_first_line', full)}
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(600); continue
        await pg.wait_for_timeout(900)
    return {'ok': ok, 'stuck': stuck, 'shot_cls': shot_cls}


async def case_guowen(pg, cdp, run, case):
    if case == 'midterm_gone': return await class_case(pg, cdp, run, case, MG_KEY, MG_H, MG_CID, law=True)
    return await class_case(pg, cdp, run, case, GW_KEY, GW_H, GW_CID, law=False)


async def class_case(pg, cdp, run, tag, KEY, HH, CID, law=False):
    """guowen_w8（國文，非法律課）／midterm_gone（第 8 週法律課）共用：【前置】讀到那天上課前 → 手機「今天」→「直接去上課」→ 照玩家上完"""
    st, d = await state_at(pg, KEY, HH, 'dorm')
    await L.load_state(pg, st, quiet_events=False, quiet_phone=False); await pg.evaluate(CLEARP); await pg.wait_for_timeout(3500)
    await L.phone_away(pg, cdp, tries=2)
    run.setup('[前置] %s：最小存檔 %s（%s）%s 宿舍（大一上第 %s 週；不用 turbo）' % (tag, d['key'], ['日', '一', '二', '三', '四', '五', '六'][d['wd']], hm(HH), d.get('week')))
    it = await pg.evaluate(ITEM, CID)
    run.check('%s：%s 有 %s 那一堂（CLS.dayItems，只讀）' % (tag, d['key'], CID), isinstance(it, dict), J(it))
    if not isinstance(it, dict): return
    run.note('%s：那一堂 %s（修改前預期 exam＝mid；修改後預期 null）' % (tag, J(it)))
    run.check('%s：前置成立：大一上第 8 週、日曆是期中考週（calendar exam:mid）' % tag, it['term'] == 'Y1S1' and it['week'] == 8 and it['termExam'] == 'mid', J(it))
    extra = {}
    if law:
        run.check('%s：前置成立：%s 是考五題的法律課（CLS.isExamCourse）' % (tag, it['name']), bool(it.get('isExamCourse')), J(it))
        # 玩家看：手機「課表」最下面的「考試」那一格（classes3d.js weekHTML，CLS.examList）
        await P.phone_tab(pg, cdp, 'week'); await pg.wait_for_timeout(800)
        wk = await pg.evaluate(WK_TXT); p_wk = await shoot_both(pg, run, tag + '_phone_week_exams')
        await L.close_panels(pg, cdp)
        exl = (wk or {}).get('exam') or []
        d8 = (await P.day_of(pg, ['Y1S1', 8, 1]))['d']
        ro = await pg.evaluate(EXAMRO, [d8, 14])
        extra = {'week_tab': wk, 'week_shots': p_wk, 'readonly': ro}
        run.note('%s：手機「課表」的「考試」那一格 %s；只讀 CLS.examList %s' % (tag, J(exl), J(ro.get('list') if isinstance(ro, dict) else ro)))
        run.check('%s：手機「課表」的考試清單沒有「期中」、只有「期末」（玩家畫面）' % tag,
                  bool(exl) and not any(x.startswith('期中') for x in exl) and any(x.startswith('期末') for x in exl), J(exl))
        run.check('%s：只讀對照 CLS.examList 只有 final' % tag, isinstance(ro, dict) and bool(ro['list']) and all(e['kind'] == 'final' for e in ro['list']), J(ro.get('list') if isinstance(ro, dict) else ro))
        wkx = [x for x in (ro.get('wk') if isinstance(ro, dict) else [])]
        run.check('%s：只讀對照 第 8～9 週每一堂（%d 堂，法律課 %d 堂）CLS.dayItems 的 exam 都是 null' % (tag, len(wkx), sum(1 for x in wkx if x['law'])),
                  bool(wkx) and any(x['law'] for x in wkx) and all(x['exam'] is None for x in wkx), J([x for x in wkx if x['exam']][:12]))
    wf0 = await pg.evaluate("GAME.walkFallbacks|0"); n0 = await pl_len(pg)
    txt = await P.phone_tab(pg, cdp, 'today')
    row0 = await pg.evaluate(PHROW, it['name'])
    sel = '#phoneBody [data-go="%s"]' % it['key']
    btn = await pg.evaluate(BTN_TXT, sel)
    p_today = await shoot_both(pg, run, tag + '_phone_today')
    run.note('%s：手機「今天」那一列：%s；按鈕「%s」；全文 %s' % (tag, row0, btn, txt[:500]))
    run.check('%s：手機「今天」%s那一列沒有「（考試）」' % (tag, it['name']), bool(row0) and '（考試）' not in row0, J(row0))
    run.check('%s：手機「今天」有「直接去上課」' % tag, (btn or '').startswith('直接去上課'), J(btn))
    if not btn: await L.close_panels(pg, cdp); return
    await L.tap(pg, cdp, sel); await pg.wait_for_timeout(1200)
    tr = await class_trip(pg, cdp, run, tag, it, n0); ok, stuck, shot_cls = tr['ok'], tr['stuck'], tr['shot_cls']
    R = await rows(pg, n0); end = await pg.evaluate(KEYST, it['key']); boards = [r['t'] for r in R if r['k'] == 'board']; wf = (await pg.evaluate("GAME.walkFallbacks|0")) - wf0
    att = next((json.loads(r['t']) for r in R if r['k'] == 'attend' and r['n'] == it['key']), None)
    fin = next((json.loads(r['t']) for r in R if r['k'] == 'attended' and r['n'] == it['key']), None)
    caps = [r['t'] for r in R if r['k'] == 'cap']
    capb = [r['t'] for r in R if r['k'] == 'cap' and r.get('n') == '黑板']   # D118-B2：沒有 3D 黑板的教室（博思 101 等）黑板三行用字幕 GAME.caption('黑板', …)
    said = [[r['n'], r['t'], r.get('z'), hm(r.get('h'))] for r in R if r['k'] == 'say']
    qs = [r['t'][:60] for r in R if r['k'] == 'say' and Q_RE.match(r['t'])]
    exam_hits = [[r['k'], r['t'][:80]] for r in R if r['k'] in ('say', 'cap', 'toast', 'choose', 'card') and any(w in r['t'] for w in EXAM_WORDS)]
    exam_hits += [['board', b] for b in boards if any(w in b for w in EXAM_WORDS)]
    p_after = None
    if ok:
        await pg.wait_for_timeout(600)
        await P.phone_tab(pg, cdp, 'today'); row1 = await pg.evaluate(PHROW, it['name']); p_after = await run.shot(pg, tag + '_phone_after'); await L.close_panels(pg, cdp)
    else: row1 = None
    dump('transcript_%s.json' % tag, {'case': tag, 'sha': os.environ.get('SHA', '?'), 'url': url_for(tag), 'item': it, 'phone_row_before': row0, 'phone_row_after': row1, 'btn': btn,
                                       'rows': R, 'boards': boards, 'board_captions': capb, 'exam_questions': qs, 'attend': att, 'attended': fin, 'end': end, 'stuck': stuck, 'walkFallbacks': wf,
                                       'extra': extra, 'shots': {'today': p_today, 'class': shot_cls, 'after': p_after}})
    run.note('%s：3D 黑板 %s；黑板字幕 %s；字幕 %s；上課 %s → %s；台詞 %s' % (tag, J(boards), J(capb), J(caps), J(att), J(fin), J(said)[:1500]))
    run.check('%s：進教室上完那一堂（CLS.attend 跑完、done）、沒有卡住' % tag, ok and bool(fin) and fin.get('done') and stuck is None, J({'end': end, 'stuck': stuck}))
    run.check('%s：一般上課、不是考試畫面（CLS.attend 收到的 exam 是 null）' % tag, bool(att) and att.get('exam') is None, J(att))
    run.check('%s：沒有考卷題目（「n／5　」那種台詞 %d 句）' % (tag, len(qs)), not qs, J(qs))
    run.check('%s：逐字稿、字幕、黑板沒有考試的字（%s）' % (tag, '、'.join(EXAM_WORDS)), not exam_hits, J(exam_hits[:10]))
    run.check('%s：字幕是「下課了。…」不是「考完了。」' % tag, any(c.startswith('下課了。') for c in caps) and '考完了。' not in caps, J(caps))
    run.check('%s：出席次數 +1（R.attend.%s：%s → %s）' % (tag, CID, (att or {}).get('att0'), (fin or {}).get('att')),
              bool(att) and bool(fin) and fin.get('att') == (att.get('att0') or 0) + 1, J({'att': att, 'fin': fin}))
    run.check('%s：上完以後手機「今天」那一列是「上過了」' % tag, bool(row1) and '上過了' in row1 and '（考試）' not in row1, J(row1))
    run.check('%s：GAME.walkFallbacks＝0（這一趟 +%d）' % (tag, wf), wf == 0, J(wf))


# ================================================================ d. midterm_gone（參數；共用 class_case）
MG_KEY, MG_H, MG_CID = os.environ.get('MG_KEY', '2025-10-23'), float(os.environ.get('MG_H', '12.5')), os.environ.get('MG_CID', 'civ_general')   # 大一上第 8 週週四 13:20 民法總則（法律系館A 201）


# ================================================================ e. jp_makeup
JP_SPECS = [x.strip() for x in os.environ.get('JP_SPECS', '2029-05-28@8:civpro_2_re,2029-05-31@8:insurance_re').split(',') if x.strip()]
JP_RO = r"""(cid=>{ try{ const G=GAME.G, c=COURSES.list.find(x=>x.id===cid), t=CALENDAR.termOf(G.day), rd=CLS.redoOf?CLS.redoOf(cid):null;
  const n=p=>p.cls.length+p.bank.length+p.ai.length, ids=p=>p.cls.concat(p.bank,p.ai).map(q=>q.id);
  const p=CLS.examPool(cid,'Y4S2','final'), p0=rd?CLS.examPool(rd.id,rd.term,'final'):null;
  let draw=null; try{ const G2=JSON.parse(JSON.stringify(G)); const r=CLS.drawExam(G2,cid,'Y4S2','final'); draw=r.ok?r.qs.map(q=>({id:q.id,course:q.course,term:q.term,inOrig:!!p0&&ids(p0).includes(q.id)})):{ok:false,n:r.n}; }catch(e){ draw='ERR '+e.message; }   /* 抽題在複製的 G 上（不寫進這份存檔）*/
  const ed=CLS.examDay(G,c,'Y4S2','final');
  return {route:STORY.route(G),abroad:!!(STORY.abroad&&STORY.abroad(G)),term:t,redo:rd,isExam:!!CLS.isExamCourse(c),EXAM_WEEKS:CLS.EXAM_WEEKS||null,
    examDay:ed?{day:CALENDAR.dateOf(ed.day).key,block:ed.block,makeup:!!ed.makeup}:null, examList:CLS.examList(G,'Y4S2').map(e=>({cid:e.c.id,kind:e.kind,day:CALENDAR.dateOf(e.day).key})),
    pool:n(p), pool0:p0?n(p0):null, samePool:!!p0&&JSON.stringify(ids(p).sort())===JSON.stringify(ids(p0).sort()), draw,
    today:CLS.dayItems(G).map(i=>({key:i.key,cid:i.c.id,exam:i.exam||null,block:i.slot.block,room:(i.room||{}).name||null})), report:CLS.reportFor?CLS.reportFor(G,'Y4S2')[cid]:null}; }catch(e){ return 'ERR '+e.message; } })"""
JP_REC = r"""(k=>{ try{ return (CLS.rec(GAME.G).exam||{})[k]||null; }catch(e){ return 'ERR '+e.message; } })"""
JP_QSRC = r"""(([cid,qs])=>{ try{ const rd=CLS.redoOf(cid); const p0=CLS.examPool(rd.id,rd.term,'final'); const all=p0.cls.concat(p0.bank,p0.ai);
  return qs.map(id=>{ const q=all.find(x=>x.id===id); return {id,inOrig:!!q,course:q?q.course:null,term:q?q.term:null}; }); }catch(e){ return 'ERR '+e.message; } })"""


async def case_jp(pg, cdp, run, case):
    """日本路線大四下補修 civpro_2_re（週一上午 法律系館A 201）、insurance_re（週四上午 萬才館多功能教室）的期末考：【前置】最小存檔（EXCHANGE_ROUTE JP、EXCH_RULE）
    到考試那天 08:00 宿舍 → 手機「今天」→ 那一堂「直接去上課」→ 照玩家作答（每題選第一個）→ 記題數、題目來源（原課大三下 civpro_2／insurance 的題庫）。
    那天沒有那一堂（或不是考試）就只做只讀對照，輸出原因。"""
    for spec in JP_SPECS:
        kh, _, cid = spec.partition(':'); key, _, hh = kh.partition('@'); HH = float(hh or 8); tag = '%s_%s' % (case, cid)
        dap = await P.day_of(pg, '2027-11-20')
        st, d = await state_at(pg, key, HH, 'dorm', {'EXCHANGE_ROUTE': 'JP', 'EXCH_RULE': 1, 'EXCH_APPLIED_DAY': dap['d']})
        await L.load_state(pg, st, quiet_events=False, quiet_phone=False); await pg.evaluate(CLEARP); await pg.wait_for_timeout(3500)
        await L.phone_away(pg, cdp, tries=2)
        run.setup('[前置] %s：最小存檔 %s（%s）%s 宿舍，日本路線（EXCHANGE_ROUTE JP、EXCH_RULE 1；沒有真的走過大三下日本那一段）' % (tag, d['key'], ['日', '一', '二', '三', '四', '五', '六'][d['wd']], hm(HH)))
        ro = await pg.evaluate(JP_RO, cid)
        run.note('%s：只讀對照 %s' % (tag, J(ro)))
        if not isinstance(ro, dict): run.check('%s：只讀對照讀得到' % tag, False, J(ro)); continue
        run.check('%s：前置成立：日本路線、人在台灣、%s 是 %s 的課、redo＝%s' % (tag, key, (ro.get('term') or {}).get('id'), J(ro.get('redo'))), ro['route'] == 'JP' and not ro['abroad'] and (ro.get('term') or {}).get('id') == 'Y4S2' and bool(ro.get('redo')), J(ro))
        run.check('%s：只讀：%s 是考五題的課、抽題池＝原課（%s）的期末範圍（%s 題 vs 原課 %s 題）' % (tag, cid, (ro.get('redo') or {}).get('id'), ro.get('pool'), ro.get('pool0')),
                  ro['isExam'] and ro['samePool'] and (ro.get('pool') or 0) >= 5, J({k: ro.get(k) for k in ('isExam', 'pool', 'pool0', 'samePool')}))
        dr = ro.get('draw')
        run.check('%s：只讀：在複製的存檔上抽題＝5 題、都在原課題庫' % tag, isinstance(dr, list) and len(dr) == 5 and all(q['inOrig'] for q in dr), J(dr))
        run.check('%s：只讀：CLS.examDay（大四下期末那一堂）有日期＝%s' % (tag, J(ro.get('examDay'))), bool(ro.get('examDay')),
                  J({'examDay': ro.get('examDay'), 'EXAM_WEEKS': ro.get('EXAM_WEEKS'), 'term': ro.get('term'), 'examList': ro.get('examList'),
                     '讀碼': '大四下 calendar.js weeks:15（第 15 週＝期末週），S.EXAM_WEEKS.final＝[16]——找不到第 16 週就沒有考試日（dayItems 把那一堂拿掉）'}))
        it = await pg.evaluate(ITEM, cid)
        run.note('%s：那天的那一堂（CLS.dayItems）%s；今天全部 %s；成績單現在會寫 %s' % (tag, J(it), J(ro.get('today')), J(ro.get('report'))))
        if not isinstance(it, dict):
            run.check('%s：%s 有 %s 的考試那一堂（玩家才能進考場）' % (tag, key, cid), False,
                      J({'today': ro.get('today'), '原因（讀碼）': 'CLS.examDay 回 null → dayItems 的期末週處理把沒有考試日的考五題課拿掉；修改前那一堂還在、但是是照讀書次數的假考試（不是考五題的課）'}))
            dump('transcript_%s.json' % tag, {'case': tag, 'sha': os.environ.get('SHA', '?'), 'readonly': ro, 'item': None})
            continue
        run.check('%s：那一堂是期末考（exam＝final）' % tag, it.get('exam') == 'final', J(it))
        n0 = await pl_len(pg); wf0 = await pg.evaluate("GAME.walkFallbacks|0")
        await P.phone_tab(pg, cdp, 'today'); row0 = await pg.evaluate(PHROW, it['name']); sel = '#phoneBody [data-go="%s"]' % it['key']; btn = await pg.evaluate(BTN_TXT, sel)
        p_today = await shoot_both(pg, run, tag + '_phone_today')
        run.note('%s：手機「今天」那一列 %s；按鈕「%s」' % (tag, row0, btn))
        if not btn: run.check('%s：手機「今天」有「直接去上課」' % tag, False, J(row0)); await L.close_panels(pg, cdp); continue
        await L.tap(pg, cdp, sel); await pg.wait_for_timeout(1200)
        tr = await class_trip(pg, cdp, run, tag, it, n0)
        R = await rows(pg, n0); wf = (await pg.evaluate("GAME.walkFallbacks|0")) - wf0
        qs = [r['t'] for r in R if r['k'] == 'say' and Q_RE.match(r['t'])]
        said = [r['t'] for r in R if r['k'] == 'say']
        rec = await pg.evaluate(JP_REC, 'Y4S2:%s:final' % cid)
        src = await pg.evaluate(JP_QSRC, [cid, (rec or {}).get('qs') or []]) if isinstance(rec, dict) else None
        dump('transcript_%s.json' % tag, {'case': tag, 'sha': os.environ.get('SHA', '?'), 'readonly': ro, 'item': it, 'rows': R, 'questions': qs, 'exam_rec': rec, 'q_source': src,
                                           'trip': {'ok': tr['ok'], 'stuck': tr['stuck']}, 'shots': {'today': p_today, 'class': tr['shot_cls']}, 'walkFallbacks': wf})
        run.note('%s：考卷台詞 %s；R.exam %s；題目來源 %s；全部台詞 %s' % (tag, J(qs), J(rec), J(src), J(said)[:1500]))
        run.check('%s：進考場考完、沒有卡住' % tag, tr['ok'] and tr['stuck'] is None, J(tr['stuck']))
        run.check('%s：考卷 5 題（「n／5　」台詞 %d 句；R.exam.qs %s 題）' % (tag, len(qs), len((rec or {}).get('qs') or []) if isinstance(rec, dict) else None),
                  len(qs) == 5 and isinstance(rec, dict) and len(rec.get('qs') or []) == 5 and rec.get('status') == 'done', J(rec))
        run.check('%s：5 題都是原課（%s）的題庫' % (tag, (ro.get('redo') or {}).get('id')), isinstance(src, list) and len(src) == 5 and all(q['inOrig'] for q in src), J(src))
        run.check('%s：不是照讀書次數的假考試（沒有「你認得題目裡的每一個字」那一類）' % tag, not any(w in t for t in said for w in ('認得題目裡的每一個字', '題目你都見過——', '有幾題你有印象')), J(said[:12]))
        run.check('%s：GAME.walkFallbacks＝0（這一趟 +%d）' % (tag, wf), wf == 0, J(wf))


# ---------------------------------------------------------------- main
RUNNERS = {'retake_skip': case_retake_skip, 'retake_skip_home': case_retake_skip, 'retake_saveload': case_retake_saveload, 'guowen_w8': case_guowen, 'midterm_gone': case_guowen, 'jp_makeup': case_jp}


async def main():
    run = L.Run('d118b1_' + '+'.join(CASES), OUT); os.makedirs(OUT, exist_ok=True)
    async with async_playwright() as p:
        for c in CASES:
            u = url_for(c)
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
