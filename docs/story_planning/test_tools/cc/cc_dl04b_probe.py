"""CC（帳號 A）11-02：從 BB-B 的 test_tools/dl04b_probe.py 複製，加 MODE door（BUG-DOOR-CLASS-GO-1101，9aa82ecda）與 MODE late（遲到修正 444dd616e）。
原說明：BB-B 11-01：DL-04B（開發分支 da210a96a 合併；測 369d9d03d）——一鍵上課「直接去上課」路上經過的區域有到達時就會演的【固】【必】事件＝停在那一區演、
演完「繼續去上課」（AA_160 R2、1-3 第 3 點，CLS.routeStop）；翹課確認多一行「你會錯過：○○」（1-5，CLS.classMissList）。照玩家在畫面上看、按、截圖。
程式：src/classes3d.js S.goClass（停的地方：GM.caption「走路往<那棟>去。」→ GM.enter(停的區域) → 這一區的 enter／auto 照常演 → S.oneTick 出「繼續去上課：<課名>」）；
  單元測試 tests/dl04b_class_stops_unit.js（假事件）、tests/dl01_oneclick_unit.js。
不是 iPhone：Playwright 手機橫向模擬（SwiftShader，2～4 fps）。URL 用 '<URL>/index.html?turbo'：一鍵上課本身是黑幕＋換區域（GM.enter 直接放到那一區），
  不是走路；turbo 只縮短淡入淡出的等待、坐到位子上瞬間到。要注意：低幀率時「繼續去上課」「下課選單」「起床選單」都要等 STORY.tick 三次（每 30 格一次），
  這段空著的時間遊戲時鐘照走（turbo 每格最多 0.3 秒），所以到教室的時間會比真機晚幾分鐘——遲到的檢查一律照「實際進教室那一刻」的時間和 CLS 的規則比
  （CLS.lateMin：1～15 分鐘＝遲到、記 late；超過 15 分鐘＝缺席、記 abs；服務學習不記），不寫死幾點。
存檔：「最小存檔」（GAME.defaults＋過了開場的旗標，同 fb1101_probe 的 state_at；給第三個參數或環境變數 SAVE＝使用者存檔.json 改用那份改日期）。
  每一次讀檔印 [前置]（讀檔＝重新整理：順手清掉上一段留下、還沒出的選單 CLS.clearPending，和重新整理一樣）；讀檔後用遊戲 API 補的（關係）寫【捷徑】；
  在頁面裡改事件的時段、星期、加一件探針事件也寫【捷徑】（每一段做完放回去）。
之後照玩家：手機「今天」→「直接去上課」、點對話、選選項（路上停下來時「繼續去上課：」；坐位子「老位子／坐中間的位子」；遲到超過 15 分鐘「還是進去聽」）、
  床「睡到明天早上」、起床選單「翹這堂課」、下課選單「下一堂不去」、確認「翹」。手機自己打開（D103）就按「收起來」。
  台詞全部照 GAME.say 的原文記（HOOK 記 [名字, 句子, 日期, 時間, 區域]）；選單 GAME.choose（連 hint 一起記：「選項〔hint〕」）；字幕 GAME.caption；
  另外只記不改：GAME.enter（換到哪一區、站哪裡）、CLS.routeStop（路上停不停、停哪裡）、CLS.attend（開始上課那一刻幾分鐘遲到）、CLS.goClass、CLS.skipClass、EVENTS.run。
「只讀」的預測（PREDICT）：按下去之前在頁面裡算一次 CLS.goPlan、CLS.routeStop（暫時把時間放到出門時間，算完放回去），印出來和實際對照。

MODE（逗號隔開可以一次跑好幾個，每個 MODE 開一個新的瀏覽器）：
  plain     PLAIN＝thu,cafe（預設）。路上沒有事件的平常上課日：直接到，不停、不出「繼續去上課」、不遲到。
            thu  [前置] 大一上第 6 週週四（2025-10-09）12:30 宿舍 → 手機「今天」→「直接去上課」（13:20 民法總則，法律系館A 201）。
            cafe [前置] 大一上第 6 週週二（2025-10-07）12:30 兩點半 Café → 「直接去上課」（13:20 通識，普通教學館 101；路線 Café→溫州街→公館→校園）。
            PASS：預測 routeStop＝null；路上 routeStop 全部 null、沒有「走路往…去。」、有「走路到<那棟>。」、只換一次區域（教室那一區）；沒有「繼續去上課」；
                  上完（CLS.rec done）；進教室那一刻 lateMin＜1、沒有記遲到／缺席；路上的區域沒有演任何事件。
  stops     STOPS＝ps,psneg,l1,grad,info,late（預設；另有 l1neg）。
            ps    大二上 12:00～13:00 沛珊「我要重考」ev_peishan_decision（真實時段、真實條件，不改事件）：[前置] 大二上第 5 週週一 2026-10-05 12:20 人在 201（上完早上的行政法），
                  dating_classmate_peishan、ev_peishan_doubt 演過；【捷徑】沛珊有點熟（LV）→「直接去上課」13:20 日文（一）共同教學館 102 →
                  只讀預測：從 201 出門 12:52 經過法律系館A（12:52）＝停。PASS：「走路往共同教學館去。」→ 停在法律系館A（linze）→ 她「我決定了。我要重考。去念教育。」（選「「妳想去就去。」」）
                  → 演完才出「繼續去上課：日文（一）」（在 linze、第二個選項「先不去了」）→ 選 →「走路到共同教學館。」→ 坐下上課；遲到照 CLS 規則和實際進教室的時間一致、提示的「HH:MM 到教室／會遲到 N 分鐘」和實際一致；事件只演一次。
            psneg 同一天、同一個地方，沒有 dating／沒演過 doubt（條件不成立）＝不停，直接到共同教學館、不遲到；ev_peishan_decision 沒演。
            l1    法律系館A 12:10～12:30 的電梯 ev_l1_elevator（src/campus_l123_3d.js）。真實時段一鍵上課碰不到（只讀：宿舍出門 12:52、到法律系館A 13:07），
                  所以【捷徑】只把時段改成 12:10～13:15（其他條件照舊）：[前置] 大一上第 6 週週四 2025-10-09 12:30 宿舍 →「直接去上課」民法總則 →
                  「走路往法律系館A去。」→ 停在 linze →「（中午下課，電梯門口擠滿人。）」→ 選「（等電梯）」→「繼續去上課：民法總則」→ 201 上課。
            l1neg 同上不改時段（真實資料）＝不停（電梯只在 12:10～12:30），直接到 201。
            grad  大一下學長姊畢業那天的校園 ev_grad_seniors_y1（第 15 週週六 10:00～15:00；週六沒有課，一鍵上課碰不到）：【捷徑】只把星期改成週四：
                  [前置] 大一下第 15 週週四 2026-06-04 12:30 宿舍 → 13:20 債總（201）→ 停在校園（站在法律系館A前 (34,−98)）→「（椰影大道。學士帽丟上天。）」…「謝啦！三年後換你。」→ 繼續去上課。
            info  研究所說明會 ev_grad_info_session（法律系館B 大廳、週五 14:48～16:12、大一、met_sis；大一沒有週五下午經過法律系館B 的課）：
                  【捷徑】星期改週三、時段 12:54～13:24；[前置] 大一上第 6 週週三 2025-10-08 12:30 宿舍、met_sis → 13:20 服務學習（一）（法律學院圖書館櫃台；路線經過法律系館B）
                  → 停在 wancai → 說明會 → 選 INFO_PICK（預設「聽十分鐘就走」，＋12 分鐘；「留下來聽完」＋1 小時）→ 繼續去上課 → 櫃台報到。服務學習不記遲到／缺席（CLS.attend 的 service），
                  提示寫的遲到另外印出來對照。
            late  探針事件（同 tests/dl04b_class_stops_unit.js 1b）：【捷徑】加一件 keep:'must' 的校園 enter 事件，第二句 advance 20 分鐘：[前置] 2025-10-09 12:30 宿舍 → 民法總則 →
                  停在校園演完（花 20 分鐘）→「繼續去上課」的提示寫「會遲到 N 分鐘」→ 201：教授「後面有位子。」、記遲到（CLS.rec late）。
  skipwarn  SKIPW＝wake,next（預設）。翹課確認（1-5）。規格例子：大一上第 4 週週四翹民總＝「你會錯過：同學的報告分組、同學約吃晚餐。」（SKIP_TEXT 可以改）。
            wake  [前置] 大一上第 4 週週三 2025-09-24 23:20 宿舍 → 走到床「睡到明天早上」→ 9/25 起床選單「早安。今天的課：09:10　大一英文…／13:20　民法總則…」→「翹這堂課」（英文）
                  →「翹掉大一英文（上）？記「沒去」，不扣分。」（＋這一堂有【固】【必】才有的「你會錯過」，和頁面裡 CLS.classMissList 對照）→「翹」→「再睡一下（睡到 10:30）」
                  → 起床選單（民總）→「翹這堂課」→「翹掉民法總則？記「沒去」，不扣分。」「你會錯過：同學的報告分組、同學約吃晚餐。」→「翹」。
                  PASS：句子一字不差、選項只有「翹／還是去」、兩堂都記 plan_skip、確認本身不演事件、不改事件紀錄。
            next  [前置] 2025-09-25（四）08:30 宿舍 →「直接去上課」大一英文 → 上完 → 下課選單「下一堂不去」→ 同一行「你會錯過：同學的報告分組、同學約吃晚餐。」→「翹」→ 民總記 plan_skip。
  econ      經濟系那年（stage econ，事件模式 ECONFF：空下來 1.5 秒就跳到下一件事，中間的課自動算出席）。ECON＝2024-10-07,2024-10-08,2024-10-09（連續三個上課日，預設）、
            ECON_PM＝2024-10-08（同一份進度那天 12:30 再去 13:20 通識：路上經過校園 13:02，經濟系的 T1「全系的秘密」12:06～13:15 在 AA_300／AA_303 拿掉了＝不能停；空字串＝不跑）。
            每一天：[前置] 第一天經濟系最小存檔（同 fb1101 econ_state）08:40 宿舍，之後同一份進度（上完前一天的課那一刻存的）跳到隔天 08:40 宿舍；
            讀檔後馬上打開手機「今天」（玩家要趕在事件模式跳走之前）→ 那天第一堂「直接去上課」→ 上完。
            PASS：手機有「直接去上課」；路上 routeStop 全部 null、沒有「繼續去上課」（事件模式不出這個選單：S.oneTick 一開始就 return，停了會卡住）、路上沒有演事件；
                  由一鍵上課坐下上完（CLS.attend，不是事件模式跳過去自動算的 skip_ 紀錄）；不遲到；沒有卡住。上完以後事件模式做了什麼（跳到哪一天）只印出來。
用法：LW_TESTS=<工作樹>/tests SHA=<sha> MODE=<mode>[,<mode>...] python3 dl04b_probe.py '<URL>/index.html?turbo' <輸出資料夾> [使用者存檔.json]
等待上限（秒）：TRIP_MAX（一趟上課，預設 600）、STUCK_S（空著沒有任何變化多久算卡住，預設 180；低幀率時「繼續去上課」要等 STORY.tick 三次＝最多 45 秒）、
  WAKE_MAX（等起床選單，預設 900）、MENU_MAX（等下課選單、確認，預設 300）、ECON_AFTER（上完以後看事件模式做什麼，預設 10）；LATE_TOL（提示的遲到分鐘和實際差幾分鐘以內算一致，預設 3）。"""
import os, sys, json, asyncio, re, time, copy, traceback
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__)))); import bbplay as P   # bbplay 在上一層（BB 的 test_tools）
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
SAVEF = sys.argv[3] if len(sys.argv) > 3 else os.environ.get('SAVE')
SAVE = None
if SAVEF:
    SAVE = json.load(open(SAVEF, encoding='utf-8')); SAVE = SAVE.get('G', SAVE)
MODES = [m.strip() for m in os.environ.get('MODE', 'plain').split(',') if m.strip()]
J = lambda o: json.dumps(o, ensure_ascii=False)
ENV = lambda k, d: [x.strip() for x in os.environ.get(k, d).split(',') if x.strip()]
ENVI = lambda k, d: int(os.environ.get(k, str(d)))
TOL = float(os.environ.get('LATE_TOL', '3'))
SKIP_TEXT = os.environ.get('SKIP_TEXT', '你會錯過：同學的報告分組、同學約吃晚餐。')   # 規格的例子（BB-B 給的字）
CONT = '繼續去上課'


def hm(h):
    if h is None: return '--:--'
    m = int(round(float(h) * 60)); return '%02d:%02d' % (m // 60, m % 60)


# ---------------------------------------------------------------- 存檔（fb1101_probe.py 的做法）
BASEF = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True, 'metAn': True, 'met_an': True, 'MET_ZHE': True,
         'zheNoodleDone': True, 'KX_FIRST_MSG': True, 'KX_EVE_MSG': True, 'FAM_GROUP_SENT': True, 'CEREMONY_Y1': True, 'KAI_MOVEIN': True, 'LAW_RECAP_SEEN': True,
         'fundsV2': 1, 'KX_DEC3_MIGRATED': True, 'dating_kexin': False}   # 法律系、過了開場；GAME.defaults 的 dating_kexin:true 拿掉
ROOMS = (('ROOM_Y2', '2026-09-06'), ('ROOM_Y3', '2027-09-05'), ('ROOM_Y4', '2028-09-03'))
VISITED = ('noodle', 'cafe', 'library_hall', 'library', 'lawlib', 'wancai', 'linze', 'gongguan', 'wenzhou', 'soclib', 'cvs', 'bookstore')
ECON0 = {'ECON_CAMP_OPEN': True, 'E15_BUS': 'nosleep', 'E15_WENT': True, 'ECON_CAMP_DONE': True, 'E01_DONE': True, 'E01_MORNING': True, 'KX_FIRST_MSG': True,
         'fundsV2': 1, 'Y0_STICKY': True, 'KX_DEC3_MIGRATED': True, 'dating_kexin': False}   # 經濟系那一年的最小存檔（fb1101_probe／post91015_probe 的 econ_state）
ECON_FRIENDS = ('kexin', 'econ_zhengxun', 'econ_weilun', 'econ_tangrui', 'econ_jiahao', 'econ_pinyu')

JSENV = """(()=>{ const G=GAME.G, F=G.flags;
  const LV=(id,f,t,c,o)=>{ const r=SOCIAL.rel(id); r.fam=f; r.trust=t||0; r.comf=c||0; if(o) Object.assign(r,o); SOCIAL.remember(id,'FIRST_MET',''); G.contacts=G.contacts||{}; if(G.contacts[id]==null) G.contacts[id]=G.day-30;
    return {id,fam:r.fam,trust:r.trust,comf:r.comf,stage:SOCIAL.stage(id),level:SOCIAL.friendLevel?SOCIAL.friendLevel(id):null}; };
  const NOKX=()=>{ F.dating_kexin=false; if(F.romance) delete F.romance.kexin; F.ROMANCE_HISTORY=(F.ROMANCE_HISTORY||[]).filter(r=>r&&r.id!=='kexin'); delete F.DATED_1_kexin; delete F.KX_TOUR_YES; };
  __BODY__ })()"""
CLEARP = "(()=>{ if(typeof CLS!=='undefined'&&CLS.clearPending){ CLS.clearPending(); return true; } return false; })()"


async def state_at(pg, key, h, zone, flags=None, pos=None, weather='clear', money=30000, done=None):
    """法律系的存檔：最小存檔（或使用者存檔）改到那一天、那個時間、那一區；key 可以是 'YYYY-MM-DD' 或 [學期, 週, 星期]；done＝事件演過（events.done）"""
    d = await P.day_of(pg, key)
    if SAVE is not None:
        st = copy.deepcopy(SAVE); st.pop('_stuck', None); st.pop('_busy', None)
        st['invites'] = [v for v in st.get('invites', []) if v.get('state') != 'going']
        F = st.setdefault('flags', {})
    else:
        st = {'name': '祐廷', 'energy': 100, 'events': {'done': {}, 'last': {}, 'count': 0}, 'contacts': {}}
        F = st['flags'] = dict(BASEF)
    for k, kk in ROOMS:
        dd = (await P.day_of(pg, kk))['d']
        if dd <= d['d']: F[k] = dd
    F.update(flags or {})
    st.update(day=d['d'], weekday=d['wd'], hour=h, zone=zone, pos=pos, weather=weather, stage='law')
    st['money'] = max(st.get('money') or 0, money)
    v = st.get('visited') if isinstance(st.get('visited'), dict) else {}
    for z in VISITED: v.setdefault(z, True)
    st['visited'] = v
    if done: st.setdefault('events', {'done': {}, 'last': {}, 'count': 0}).setdefault('done', {}).update(done)
    return st, d


async def econ_state(pg, key, h, zone, flags=None):
    """經濟系那一年的最小存檔（事件模式；post91015_probe.py 的 econ_state，沒有退宿）"""
    d = await P.day_of(pg, key)
    F = dict(ECON0); F.update(flags or {})
    st = {'stage': 'econ', 'name': '祐廷', 'day': d['d'], 'weekday': d['wd'], 'hour': h, 'zone': zone, 'pos': None, 'weather': 'clear', 'energy': 100, 'money': 20000,
          'flags': F, 'contacts': {k: d['d'] - 40 for k in ECON_FRIENDS}, 'events': {'done': {'ev_y0_e02': 1}, 'last': {}, 'count': 0}}
    return st, d


async def load(pg, cdp, run, st, label, js=None):
    """[前置] 讀檔（遊戲自己的 GAME.applySave）＋清掉還沒出的選單（同重新整理）；js＝讀檔後用遊戲 API 補的【捷徑】，補完 GAME.snapshot() 再讀一次。手機自己打開（D103）照玩家收起來"""
    await L.load_state(pg, st, quiet_events=False, quiet_phone=False); await pg.evaluate(CLEARP)
    await pg.wait_for_timeout(3500); r = None
    if js:
        r = await pg.evaluate(JSENV.replace('__BODY__', js))
        s2 = await pg.evaluate("()=>GAME.snapshot()")
        await L.load_state(pg, s2, quiet_events=False, quiet_phone=False); await pg.evaluate(CLEARP); await pg.wait_for_timeout(3500)
    await L.phone_away(pg, cdp, tries=2)
    run.setup('[前置] %s%s' % (label, ('；【捷徑】讀檔後用遊戲 API 補：%s → %s' % (js.strip()[:240], J(r)[:300])) if js else ''))
    return r


async def econ_load(pg, cdp, run, st, label):
    """[前置] 經濟系：讀檔後馬上打開手機「今天」（事件模式空下來 1.5 秒就跳到下一件事；手機開著＝遊戲暫停，不會跳）。回傳讀完那一刻的時間"""
    await L.load_state(pg, st, quiet_events=False, quiet_phone=False); await pg.evaluate(CLEARP)
    await P.phone_tab(pg, cdp, 'today')
    c = await P.clock(pg)
    run.setup('[前置] %s；讀檔後馬上打開手機「今天」（玩家要趕在事件模式跳走之前）→ 現在 %s' % (label, J(c)))
    return c


# ---------------------------------------------------------------- 記錄（只記不改）
HOOK = r"""(()=>{ if(window.__PLH) return 'again'; window.__PLH=1; window.__PL=[];
  const at=()=>{ try{ return {d:CALENDAR.dateOf(GAME.G.day).key, h:+(+GAME.G.hour).toFixed(3), z:GAME.G.zone}; }catch(e){ return {}; } };
  const push=o=>{ try{ Object.assign(o,at()); window.__PL.push(o); if(window.__PL.length>8000) window.__PL.splice(0,2000); }catch(e){} return o; };
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
    if(CLS.routeStop){ const r0=CLS.routeStop; CLS.routeStop=function(GM,it,pl,o){ const r=r0.apply(this,arguments); push({k:'route',n:(it&&it.key)||'',t:JSON.stringify(r||null)}); return r; }; }
    if(CLS.attend){ const a0=CLS.attend; CLS.attend=async function(GM,it,o){ let m={}; try{ const G=GAME.G; m={key:it.key,t0:it.t0,lateMin:+(+CLS.lateMin(G,it)).toFixed(2),isLate:!!CLS.isLate(G,it),isLateAbs:!!CLS.isLateAbsent(G,it),kind:(it.c&&it.c.kind)||null,door:!!(o&&o.door),status:CLS.status(G,it)}; }catch(e){ m={err:String(e.message)}; }
      push({k:'attend',n:(it&&it.key)||'',t:JSON.stringify(m)}); const r=await a0.apply(this,arguments);
      try{ const R=CLS.rec(GAME.G); push({k:'attended',n:it.key,t:JSON.stringify({ret:r,done:!!R.done[it.key],late:!!(R.late&&R.late[it.key]),abs:!!(R.abs&&R.abs[it.key])})}); }catch(e){} return r; }; }
    if(CLS.goClass){ const g0=CLS.goClass; CLS.goClass=async function(GM,it,o){ push({k:'go',n:(it&&it.key)||'',t:JSON.stringify(o||{})}); return g0.apply(this,arguments); }; }
    if(CLS.skipClass){ const k0=CLS.skipClass; CLS.skipClass=async function(GM,it){ let m=null; try{ m=CLS.classMissList?CLS.classMissList(GAME.G,it):null; }catch(e){} push({k:'skip',n:(it&&it.key)||'',t:JSON.stringify(m)}); return k0.apply(this,arguments); }; }
  }
  if(typeof EVENTS!=='undefined'&&EVENTS.run){ const v0=EVENTS.run; EVENTS.run=function(ev){ push({k:'ev',n:'',t:String((ev&&ev.id)||'')}); return v0.apply(this,arguments); }; }
  const te=document.getElementById('toast'); if(te){ let lt=''; new MutationObserver(()=>{ const h=(te.textContent||'').trim(); if(h&&h!==lt){ lt=h; push({k:'toast',n:'dom',t:h}); } }).observe(te,{childList:true,subtree:true,characterData:true}); }
  return 'ok'; })()"""


async def pl_len(pg):
    return await pg.evaluate("(window.__PL||[]).length")


async def rows(pg, n0=0, k=None):
    R = (await pg.evaluate("n=>(window.__PL||[]).slice(n)", n0))
    return [r for r in R if k is None or r['k'] == k]


def texts(R):
    return [r['t'] for r in R if r['k'] == 'say']


# ---------------------------------------------------------------- 頁面裡讀（只讀）
ITEM = r"""(cid=>{ try{ const G=GAME.G; const it=CLS.dayItems(G).find(q=>q.c&&q.c.id===cid&&!q.exam); if(!it) return null; const rm=it.room||{};
  return {key:it.key,cid:it.c.id,name:it.c.name,kind:it.c.kind||null,t0:it.t0,t1:it.t1,room:rm.name||null,bld:String((rm.label||rm.name)||'教室').replace(/ \S+$/,''),
          status:CLS.status(G,it),miss:CLS.classMissList?CLS.classMissList(G,it):null}; }catch(e){ return 'ERR '+e.message; } })"""
FIRSTGO = r"""(()=>{ try{ const G=GAME.G; const it=CLS.goList(G).filter(q=>!CLS.planSkip(G,q)&&!q.exam)[0]; if(!it) return null; const rm=it.room||{};
  return {key:it.key,cid:it.c.id,name:it.c.name,kind:it.c.kind||null,t0:it.t0,t1:it.t1,room:rm.name||null,bld:String((rm.label||rm.name)||'教室').replace(/ \S+$/,''),status:CLS.status(G,it)}; }catch(e){ return 'ERR '+e.message; } })()"""
KEYST = """(key=>{ try{ const G=GAME.G, it=CLS.dayItems(G).find(q=>q.key===key), R=CLS.rec(G), c=it&&it.c;
  return {status:it?CLS.status(G,it):null,done:!!R.done[key],late:!!(R.late&&R.late[key]),abs:!!(R.abs&&R.abs[key]),att:c?((R.attend&&R.attend[c.id])|0):null,
          skipNote:!!(R.note&&R.note['skip_'+key]),planSkip:!!(R.note&&R.note['plan_skip_'+key])}; }catch(e){ return {err:String(e.message)}; } })"""
# 只讀預測：按下去之前，照 S.goClass 的順序（還沒到出門時間＝先跳到出門時間）算 routeStop；暫時改 G.hour，算完放回去
PREDICT = """(key=>{ const G=GAME.G, it=CLS.dayItems(G).find(q=>q.key===key); if(!it) return null; const h0=G.hour, z0=G.zone; let r=null;
  try{ const pl=CLS.goPlan(GAME,it); if(!pl) return {err:'goPlan null'}; G.hour=Math.max(h0,pl.depart); const p2=CLS.goPlan(GAME,it); const st=CLS.routeStop(GAME,it,p2);
    r={now:+(+h0).toFixed(3),mins:pl.mins,depart:+pl.depart.toFixed(3),dest:pl.d.zone,via:CLS.routeVia(z0,pl.d.zone),stop:st||null,arrive:st?+(G.hour+st.leg/60).toFixed(3):null,
       arriveClass:+p2.arrive.toFixed(3),hint:CLS.planHint(GAME,it,p2),econff:(typeof ECONFF!=='undefined'&&ECONFF.on)?!!ECONFF.on(G):null,short:(typeof ECONFF!=='undefined'&&ECONFF.short)?!!ECONFF.short(G):null}; }
  catch(e){ r={err:String(e.message)}; } finally { G.hour=h0; G.zone=z0; } return r; })"""
EVINFO = """(([id,z])=>{ const e=STORY_EVENTS.find(x=>x.id===id); if(!e) return null; const G=GAME.G;
  return {id,keep:CLS.evKeep?CLS.evKeep(e):null,guard:CLS.evGuard?CLS.evGuard(e):null,arrive:CLS.arriveEv?CLS.arriveEv(e,z):null,trigger:e.trigger,location:e.location,time:e.time||null,weekday:e.weekday||null,
          term:e.term||null,weeks:e.weeks||null,done:!!((G.events||{}).done||{})[id]}; })"""
EVDONE_ALL = "(()=>Object.keys(((GAME.G.events||{}).done)||{}))()"
EVDONE = "(id=>!!(((GAME.G.events||{}).done||{})[id]))"
BTN_TXT = "(s=>{ const e=document.querySelector(s); return e?(e.textContent||'').trim():null; })"
POS = "(()=>{ const p=GAME.E.player.obj.position; return [Math.round(p.x*2)/2, Math.round(p.z*2)/2, GAME.E.player.lv|0, !!GAME.E.player.seat]; })()"
# 【捷徑】改事件（只在這一頁、這一段；做完 EVRESTORE 放回去，探針事件拿掉）
EVMOD = """(([id,patch])=>{ const e=STORY_EVENTS.find(x=>x.id===id); if(!e) return null; const M=window.__EVMOD=window.__EVMOD||{};
  if(!M[id]){ M[id]={}; for(const k of Object.keys(patch)) M[id][k]=e[k]; } Object.assign(e,patch); const now={}; for(const k of Object.keys(patch)) now[k]=e[k]; return {id,orig:M[id],now}; })"""
EVRESTORE = """(()=>{ const M=window.__EVMOD||{}, out=[]; for(const id in M){ const e=STORY_EVENTS.find(x=>x.id===id); if(e){ for(const k in M[id]){ if(M[id][k]===undefined) delete e[k]; else e[k]=M[id][k]; } out.push(id); } }
  window.__EVMOD={}; for(let i=STORY_EVENTS.length-1;i>=0;i--) if(/^ev_probe_dl04b/.test(STORY_EVENTS[i].id)){ out.push('拿掉 '+STORY_EVENTS[i].id); STORY_EVENTS.splice(i,1); } return out; })()"""
SYNTH = """(([term,wd])=>{ const e={id:'ev_probe_dl04b_campus',title:'（探針）路上的事',participants:[],location:'campus',trigger:'enter',term:[term],weekday:[wd],once:true,keep:'must',background:'blur',
    dialogue:[{speaker:null,text:'（探針）路上遇到一件事。'},{speaker:null,text:'（探針）這件事花了二十分鐘。',advance:20/60}]};
  if(!STORY_EVENTS.some(x=>x.id===e.id)) STORY_EVENTS.unshift(e); return {id:e.id,keep:CLS.evKeep(e),guard:CLS.evGuard(e),arrive:CLS.arriveEv(e,'campus')}; })"""


# ---------------------------------------------------------------- 照玩家操作
DECL = ('晚一點', '不去了', '自己走過去', '先不', '不用了', '算了', '就這樣', '先這樣', '沒事', '「我晚上要念書。」', '「那天我有事。」', '「我也要念書。」', '「我週六有事。」')
GO_PREFIX = ('出發：', '直接過去：', '接起來：', '上線：')
GO_PICKS = (CONT, '照樣跳過', '老位子', '坐中間的位子', '還是進去聽', '先自由活動')   # 一鍵上課途中玩家會選的


def pick_opt(ch, picks=()):
    """選哪一個：picks（開頭符合、或包含；照順序）→ 起床選單「先起床」→ 婉拒那一類 → 第一個不是「出發：」那一類的"""
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


async def until_choice(pg, cdp, run, pred, max_s, picks=(), tag=''):
    """像玩家一樣過：對話點過去、手機收起來、別的選單照 pick_opt；直到出現 pred(選項文字) 成立的選單（不點）。回傳那個選單的選項（[{t,dim}]）或 None"""
    t0 = time.time()
    while time.time() - t0 < max_s:
        s = await P.ts(pg)
        if s['ch']:
            T = [o['t'] for o in s['ch']]
            if pred(T): return s['ch']
            k, why = pick_opt(s['ch'], picks)
            run.note('%s %s %.2f %s 選項 %s → %s' % (tag, (await P.clock(pg))['key'], s['h'], s['zone'], J([t[:24] for t in T]), T[k][:30]))
            await P.tap_choice(pg, cdp, k); await pg.wait_for_timeout(1000); continue
        if s['phone'] and not s['dlg']: await L.phone_away(pg, cdp, tries=1); await pg.wait_for_timeout(500); continue
        if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(600); continue
        await pg.wait_for_timeout(1000)
    return None


async def tap_text(pg, cdp, ch, prefix):
    k = next((i for i, o in enumerate(ch or []) if o['t'].startswith(prefix) and not o['dim']), None)
    if k is None: return None
    t = ch[k]['t']; await P.tap_choice(pg, cdp, k); await pg.wait_for_timeout(1100); return t


async def trip(pg, cdp, run, tag, it, picks=(), stop_zone=None, snap_done=False, max_s=None):
    """手機「今天」→ 那一堂的「直接去上課」→ 照玩家：對話點過去、路上停下來就選「繼續去上課：」、坐位子、上完那一堂（CLS.attend 跑完）。
    stop_zone：在那一區第一次出現對話就截圖。snap_done：CLS.rec done 一成立就 GAME.snapshot()（經濟系：之後事件模式會跳走）。回傳整理好的紀錄"""
    max_s = max_s or ENVI('TRIP_MAX', 600)
    out = {'ok': False, 'btn': None, 'cont': [], 'stuck': False, 'snap': None, 'jumped': False, 'shots': []}
    day0 = (await P.clock(pg))['day']
    txt = await P.phone_tab(pg, cdp, 'today')
    sel = '#phoneBody [data-go="%s"]' % it['key']
    out['btn'] = await pg.evaluate(BTN_TXT, sel); out['today'] = txt[:700]
    out['shots'].append(await run.shot(pg, tag + '_today'))
    if not out['btn']:
        await L.close_panels(pg, cdp); return out
    n0 = await pl_len(pg); out['n0'] = n0
    await L.tap(pg, cdp, sel); await pg.wait_for_timeout(1200)
    t0 = time.time(); last = None; since = time.time(); dshot = False
    while time.time() - t0 < max_s:
        st = await pg.evaluate(KEYST, it['key'])
        if snap_done and out['snap'] is None and st.get('done'):
            out['snap'] = await pg.evaluate("()=>GAME.snapshot()")
        attended = any(r['n'] == it['key'] for r in await rows(pg, n0, 'attended'))
        s = await P.ts(pg); pos = await pg.evaluate(POS)
        free = not s['dlg'] and not s['ch'] and not s['busy'] and s['depth'] == 0 and not s['phone']
        if attended and free:
            out['ok'] = True; break
        if s['day'] != day0 and not attended:
            out['jumped'] = True; out['jumped_to'] = await P.clock(pg); out['shots'].append(await run.shot(pg, tag + '_jumped')); break
        sig = (s['day'], s['zone'], s['txt'][:40], tuple(o['t'] for o in s['ch']), s['busy'], s['depth'] > 0, bool(st.get('done')), tuple(pos))
        if sig != last: last = sig; since = time.time()
        elif free and time.time() - since > ENVI('STUCK_S', 180):
            out['stuck'] = True; out['stuck_at'] = {'clock': await P.clock(pg), 'pos': pos}; out['shots'].append(await run.shot(pg, tag + '_stuck')); break
        if s['phone'] and not s['ch'] and not s['dlg']:
            await L.phone_away(pg, cdp, tries=1); await pg.wait_for_timeout(500); continue
        if s['ch']:
            T = [o['t'] for o in s['ch']]
            k = next((i for i, t in enumerate(T) if t.startswith(CONT)), None)
            if k is not None:
                c = await P.clock(pg); await pg.wait_for_timeout(700)
                p = await run.shot(pg, '%s_cont%d' % (tag, len(out['cont']) + 1)); out['shots'].append(p)
                out['cont'].append({'clock': c, 'opts': T, 'shot': p})
                run.note('%s：%s %s 在 %s 出現「%s」（選項 %s）→ 選' % (tag, c['key'], hm(c['h']), c['zone'], T[k][:40], J(T)))
                await P.tap_choice(pg, cdp, k); await pg.wait_for_timeout(1200); continue
            k, why = pick_opt(s['ch'], tuple(picks) + GO_PICKS)
            run.note('%s %.2f %s 選項 %s → %s' % (tag, s['h'], s['zone'], J([t[:24] for t in T]), T[k][:30]))
            await P.tap_choice(pg, cdp, k); await pg.wait_for_timeout(1000); continue
        if s['dlg']:
            if stop_zone and not dshot and s['zone'] == stop_zone:
                await pg.wait_for_timeout(900); out['shots'].append(await run.shot(pg, tag + '_stopdlg')); dshot = True
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(600); continue
        await pg.wait_for_timeout(900)
    out['end'] = await P.clock(pg); out['st'] = await pg.evaluate(KEYST, it['key'])
    if out['ok']:
        await pg.wait_for_timeout(600); out['shots'].append(await run.shot(pg, tag + '_class'))
    R = await rows(pg, n0); out['R'] = R
    out['caps'] = [[r['t'], r.get('z'), r.get('h')] for r in R if r['k'] == 'cap' and not r['n']]
    out['enters'] = [[r['t'], r['n'], r.get('h')] for r in R if r['k'] == 'enter']
    out['routes'] = [[json.loads(r['t']), r.get('z'), r.get('h')] for r in R if r['k'] == 'route']
    out['evs'] = [[r['t'], r.get('z'), r.get('h'), i] for i, r in enumerate(R) if r['k'] == 'ev']
    out['att'] = next((dict(json.loads(r['t']), h=r.get('h'), z=r.get('z')) for r in R if r['k'] == 'attend' and r['n'] == it['key']), None)
    out['fin'] = next((json.loads(r['t']) for r in R if r['k'] == 'attended' and r['n'] == it['key']), None)
    out['chooses'] = [[r['t'], r.get('z'), r.get('h'), i] for i, r in enumerate(R) if r['k'] == 'choose']
    out['said'] = [[r['n'], r['t'], r.get('z'), r.get('h'), i] for i, r in enumerate(R) if r['k'] == 'say']
    run.note('%s：結束 %s；換區域 %s；routeStop %s；字幕 %s；事件 %s；上課 %s → %s' % (tag, J(out['end']), J(out['enters']), J(out['routes']), J([c[0] for c in out['caps']]),
                                                                       J([[e[0], e[1], hm(e[2])] for e in out['evs']]), J(out['att']), J(out['fin'])))
    return out


# ---------------------------------------------------------------- 檢查（照 CLS 的規則）
def late_expect(att):
    """CLS.attend 的規則：服務學習不記；lateMin＞15＝缺席（abs）；1～15＝遲到（late）；其他＝準時"""
    if not att: return None
    if att.get('kind') == 'service': return {'late': False, 'abs': False}
    lm = att.get('lateMin') or 0
    if lm > 15: return {'late': False, 'abs': True}
    if lm >= 1: return {'late': True, 'abs': False}
    return {'late': False, 'abs': False}


def hint_of(choose_t):
    m = re.search(r'^' + CONT + r'：[^〔｜]*〔([^〕]*)〕', choose_t or '')
    return m.group(1) if m else ''


def hint_vs(hint, att):
    """「繼續去上課」的提示（CLS.planHint）和實際進教室那一刻的 lateMin 一致嗎（容許 LATE_TOL 分鐘：選完到坐下之間遊戲時間還會走一點）"""
    if not att: return False, '沒有上課紀錄'
    lm = att.get('lateMin') or 0
    if '記缺席' in hint: return lm > 15 - TOL, '提示「%s」、實際晚 %.1f 分鐘' % (hint, lm)
    m = re.search(r'會遲到 (\d+) 分鐘', hint)
    if m: return abs(lm - int(m.group(1))) <= TOL, '提示「%s」、實際晚 %.1f 分鐘' % (hint, lm)
    m = re.search(r'(\d\d):(\d\d) 到教室', hint)
    if m: return lm < 1 + TOL, '提示「%s」、實際晚 %.1f 分鐘' % (hint, lm)
    return True, '提示「%s」（沒有寫時間）、實際晚 %.1f 分鐘' % (hint, lm)


def check_late(run, tag, tr, said_rows):
    att, fin = tr.get('att'), tr.get('fin')
    exp = late_expect(att)
    ok = bool(att) and bool(fin) and fin.get('done') and exp is not None and fin.get('late') == exp['late'] and fin.get('abs') == exp['abs']
    if att and att.get('kind') != 'service':
        ok = ok and att.get('isLate') == (1 <= (att.get('lateMin') or 0) <= 15) and att.get('isLateAbs') == ((att.get('lateMin') or 0) > 15)
    run.check('%s：遲到照 CLS 的規則算：進教室 %s（開始 %s，晚 %s 分鐘）→ 應該 %s；實際記 %s' % (
        tag, hm(att and att.get('h')), hm(att and att.get('t0')), att and att.get('lateMin'), J(exp), J(fin)), ok, J(att))
    if att and exp and exp['late']:
        ai = next((i for i, r in enumerate(tr.get('R', [])) if r['k'] == 'attend'), -1)
        line = next((s for s in said_rows if s[1].endswith('後面有位子。') and s[4] > ai), None)
        run.check('%s：遲到 1～15 分鐘＝教授「後面有位子。」' % tag, bool(line), J(line))
    return ok


PHROW = """(([tm,name])=>{ const b=document.getElementById('phoneBody'); if(!b) return null; const e=[...b.querySelectorAll('.item.phrow')].find(x=>{ const t=x.innerText||''; return t.indexOf(tm)>=0&&t.indexOf(name)>=0; });
  if(!e) return null; e.scrollIntoView({block:'center'}); return (e.innerText||'').replace(/\\s+/g,' ').trim(); })"""


async def phone_row(pg, cdp, run, tag, it, want, bad=(), label=''):
    """手機「今天」那一堂的那一列（玩家看得到的狀態：上過了／上過了（遲到）／進去聽了（記缺席）／翹課＋「反悔：直接去上課」）。want＝那一列要有的字（全部），bad＝不能有的字"""
    await P.phone_tab(pg, cdp, 'today'); await pg.wait_for_timeout(600)
    row = await pg.evaluate(PHROW, ['%s–%s' % (hm(it['t0']), hm(it['t1'])), it['name']])
    p = await run.shot(pg, tag + '_phone_row')
    await L.close_panels(pg, cdp)
    ok = bool(row) and all(w in row for w in want) and not any(b_ in row for b_ in bad)
    run.check('%s：手機「今天」%s 那一列有 %s%s' % (tag, it['name'], J(list(want)), ('、沒有 ' + J(list(bad))) if bad else '') + (('（' + label + '）') if label else ''), ok, J({'row': row, 'shot': p}))
    return row


async def phone_row_late(pg, cdp, run, tag, it, tr):
    """上完以後：手機「今天」那一列的狀態要照 CLS 的規則（實際進教室那一刻的 lateMin）——準時「上過了」、1～15 分鐘「上過了（遲到）」、超過 15 分鐘「進去聽了（記缺席）」"""
    exp = late_expect(tr.get('att'))
    if exp is None: return None
    if exp['abs']: return await phone_row(pg, cdp, run, tag, it, ['進去聽了（記缺席）'], (), '進教室晚 %s 分鐘' % tr['att'].get('lateMin'))
    if exp['late']: return await phone_row(pg, cdp, run, tag, it, ['上過了（遲到）'], (), '進教室晚 %s 分鐘' % tr['att'].get('lateMin'))
    return await phone_row(pg, cdp, run, tag, it, ['上過了'], ('（遲到）', '記缺席'), '進教室晚 %s 分鐘' % tr['att'].get('lateMin'))


async def predict(pg, run, tag, it):
    p = await pg.evaluate(PREDICT, it['key'])
    run.note('%s：只讀預測（暫時把時間放到出門時間算 CLS.goPlan／routeStop，算完放回去）：%s' % (tag, J(p)))
    return p


# ================================================================ 1. plain：路上沒有事件
PLAINC = {'thu': dict(key=['Y1S1', 6, 4], h=12.5, zone='dorm', cid='civ_general', who='大一上第 6 週週四 12:30 宿舍 → 13:20 民法總則（法律系館A 201）'),
          'cafe': dict(key=['Y1S1', 6, 2], h=12.5, zone='cafe', cid='ge_film_y1s1', who='大一上第 6 週週二 12:30 兩點半 Café → 13:20 通識（普通教學館 101）')}


def check_straight(run, tag, it, pr, tr):
    """不停的一趟：沒有停在路上、只換一次區域、沒有「繼續去上課」、上完、不遲到、路上沒有演事件"""
    dest = pr and pr.get('dest')
    routes = [r[0] for r in tr.get('routes', [])]
    caps = [c[0] for c in tr.get('caps', [])]
    go_to = '走路到%s。' % it['bld']
    run.check('%s：路上 CLS.routeStop 全部是 null（%d 次）、沒有「走路往%s去。」、有「%s」' % (tag, len(routes), it['bld'], go_to),
              bool(routes) and all(r is None for r in routes) and not any(c.startswith('走路往') for c in caps) and go_to in caps, J({'routes': routes, 'caps': caps}))
    ents = [e[0] for e in tr.get('enters', [])]
    run.check('%s：只換一次區域：%s' % (tag, dest), ents == [dest], J(tr.get('enters')))
    run.check('%s：沒有出現「繼續去上課」' % tag, not tr.get('cont'), J(tr.get('cont')))
    via = set((pr or {}).get('via') or [])
    ai = next((i for i, r in enumerate(tr.get('R', [])) if r['k'] == 'attend'), 10 ** 9)
    en_route = [e for e in tr.get('evs', []) if e[3] < ai and e[1] in via]
    run.check('%s：路上的區域（%s）沒有演任何事件' % (tag, '、'.join(sorted(via)) or '—'), not en_route, J({'en_route': en_route, 'all': tr.get('evs')}))
    run.check('%s：一鍵上課坐下、上完（CLS.attend → done），沒有卡住' % tag, tr.get('ok') and not tr.get('stuck') and bool(tr.get('fin')) and tr['fin'].get('done'),
              J({'end': tr.get('end'), 'stuck': tr.get('stuck_at'), 'st': tr.get('st')}))
    check_late(run, tag, tr, tr.get('said', []))
    if tr.get('att'):
        run.check('%s：沒有路上的事＝準時（進教室時晚 %s 分鐘＜1）' % (tag, tr['att'].get('lateMin')), (tr['att'].get('lateMin') or 0) < 1, J(tr['att']))


async def plain_case(pg, cdp, run, c):
    if c not in PLAINC: run.check('PLAIN＝%s 認得' % c, False, ','.join(PLAINC)); return
    X = PLAINC[c]; tag = 'plain_' + c
    st, d = await state_at(pg, X['key'], X['h'], X['zone'])
    await load(pg, cdp, run, st, '%s：最小存檔 %s %s %s（%s）' % (tag, d['key'], hm(X['h']), X['zone'], X['who']), js="NOKX(); return null;")
    it = await pg.evaluate(ITEM, X['cid'])
    run.check('%s：%s 有 %s（CLS.dayItems，只讀）' % (tag, d['key'], X['cid']), isinstance(it, dict), J(it))
    if not isinstance(it, dict): return
    pr = await predict(pg, run, tag, it)
    run.check('%s：只讀預測：路線 %s、routeStop＝null' % (tag, J(pr and pr.get('via'))), isinstance(pr, dict) and not pr.get('err') and pr.get('stop') is None, J(pr))
    tr = await trip(pg, cdp, run, tag, it)
    run.check('%s：手機「今天」有「直接去上課」（%s）' % (tag, tr.get('btn')), (tr.get('btn') or '').startswith('直接去上課'), (tr.get('today') or '')[:300])
    if not tr.get('btn'): return
    check_straight(run, tag, it, pr, tr)
    if tr.get('ok'): await phone_row_late(pg, cdp, run, tag, it, tr)


async def m_plain(pg, cdp, run):
    for c in ENV('PLAIN', 'thu,cafe'):
        run.note('==== plain：%s ====' % c)
        try: await plain_case(pg, cdp, run, c)
        except Exception as ex: run.check('plain %s：跑完（沒有探針例外）' % c, False, repr(ex)[:400]); traceback.print_exc()


# ================================================================ 2. stops：路上停下來演
INFO_PICK = os.environ.get('INFO_PICK', '聽十分鐘就走')
STOPC = {
    'ps': dict(key='2026-10-05', h=12 + 20 / 60, zone='classroom', cid='japanese_1', flags={'dating_classmate_peishan': True}, done={'ev_peishan_doubt': 1},
               js="NOKX(); return LV('classmate_peishan',25,10,5);", ev='ev_peishan_decision', at='linze', line='我決定了。我要重考。去念教育。', picks=['「妳想去就去。」'],
               who='大二上第 5 週週一，上完早上的行政法人還在 201；13:20 日文（一）共同教學館 102；dating_classmate_peishan、ev_peishan_doubt 演過（真實時段 12:00～13:00、真實條件）'),
    'psneg': dict(key='2026-10-05', h=12 + 20 / 60, zone='classroom', cid='japanese_1', neg='ev_peishan_decision', js="NOKX(); return LV('classmate_peishan',25,10,5);",
                  who='同 ps，但沒有 dating、沒演過 doubt（條件不成立）'),
    'l1': dict(key=['Y1S1', 6, 4], h=12.5, zone='dorm', cid='civ_general', ev='ev_l1_elevator', at='linze', line='（中午下課，電梯門口擠滿人。）', picks=['（等電梯）'],
               mod=('ev_l1_elevator', {'time': [12 + 10 / 60, 13.25]}), who='大一上第 6 週週四 12:30 宿舍 → 13:20 民法總則；電梯真實時段 12:10～12:30，一鍵上課 13:07 才到法律系館A'),
    'l1neg': dict(key=['Y1S1', 6, 4], h=12.5, zone='dorm', cid='civ_general', neg='ev_l1_elevator', who='同 l1，不改時段（真實資料）'),
    'grad': dict(key=['Y1S2', 15, 4], h=12.5, zone='dorm', cid='oblig_gen1', ev='ev_grad_seniors_y1', at='campus', line='（椰影大道。學士帽丟上天。）', spawn=(34, -98),
                 mod=('ev_grad_seniors_y1', {'weekday': [4]}), who='大一下第 15 週週四 12:30 宿舍 → 13:20 債總（201）；畢業那天真實是週六（沒有課）'),
    'info': dict(key=['Y1S1', 6, 3], h=12.5, zone='dorm', cid='service_1', flags={'met_sis': True}, ev='ev_grad_info_session', at='wancai', line='法律系館B大廳擺了二十張椅子', picks=[INFO_PICK],
                 mod=('ev_grad_info_session', {'weekday': [3], 'time': [12.9, 13.4]}), who='大一上第 6 週週三 12:30 宿舍、met_sis → 13:20 服務學習（一）法律學院圖書館櫃台（路線經過法律系館B）；說明會真實是週五 14:48～16:12'),
    'late': dict(key=['Y1S1', 6, 4], h=12.5, zone='dorm', cid='civ_general', ev='ev_probe_dl04b_campus', at='campus', line='（探針）路上遇到一件事。', synth=True, spawn=(34, -98),
                 who='大一上第 6 週週四 12:30 宿舍 → 13:20 民法總則；探針事件在校園花 20 分鐘'),
}


async def stop_case(pg, cdp, run, c):
    if c not in STOPC: run.check('STOPS＝%s 認得' % c, False, ','.join(STOPC)); return
    X = STOPC[c]; tag = 'stop_' + c
    st, d = await state_at(pg, X['key'], X['h'], X['zone'], flags=X.get('flags'), done=X.get('done'))
    await load(pg, cdp, run, st, '%s：最小存檔 %s %s %s（%s）%s%s' % (tag, d['key'], hm(X['h']), X['zone'], X['who'], ('；旗標 ' + J(X['flags'])) if X.get('flags') else '',
                                                               ('；演過 ' + J(X['done'])) if X.get('done') else ''), js=X.get('js', "NOKX(); return null;"))
    try:
        if X.get('mod'):
            it0 = await pg.evaluate(ITEM, X['cid'])
            if isinstance(it0, dict):
                pr0 = await pg.evaluate(PREDICT, it0['key'])
                run.note('%s：（對照）改事件之前、真實資料的只讀預測：routeStop %s（到 %s 的時間 %s；事件 %s）' % (
                    tag, J((pr0 or {}).get('stop')), X['at'], hm((pr0 or {}).get('depart')) + ' 出門', J(await pg.evaluate(EVINFO, [X['ev'], X['at']]))))
            r = await pg.evaluate(EVMOD, list(X['mod']))
            run.setup('【捷徑】%s：在頁面裡改事件（只改這些欄位，這一段做完放回去）：%s' % (tag, J(r)))
        if X.get('synth'):
            t = await P.day_of(pg, X['key'])
            r = await pg.evaluate(SYNTH, [t['term'], t['wd']])
            run.setup('【捷徑】%s：加一件探針事件（同 tests/dl04b_class_stops_unit.js 1b：keep must、校園 enter、第二句 advance 20 分鐘）：%s' % (tag, J(r)))
        it = await pg.evaluate(ITEM, X['cid'])
        run.check('%s：%s 有 %s（只讀）' % (tag, d['key'], X['cid']), isinstance(it, dict), J(it))
        if not isinstance(it, dict): return
        evid = X.get('ev') or X.get('neg')
        info = await pg.evaluate(EVINFO, [evid, X.get('at') or 'linze'])
        run.note('%s：事件 %s 的分類（只讀）：%s' % (tag, evid, J(info)))
        pr = await predict(pg, run, tag, it)
        if X.get('neg'):
            run.check('%s：只讀預測：條件不成立＝routeStop null（路線 %s）' % (tag, J(pr and pr.get('via'))), isinstance(pr, dict) and pr.get('stop') is None, J(pr))
        else:
            ps = (pr or {}).get('stop') or {}
            run.check('%s：只讀預測：停在 %s 演 %s（到那裡 %s；全程 %s 分鐘、出門 %s）' % (tag, X['at'], X['ev'], hm((pr or {}).get('arrive')), (pr or {}).get('mins'), hm((pr or {}).get('depart'))),
                      ps.get('zone') == X['at'] and ps.get('ev') == X['ev'], J(pr))
        tr = await trip(pg, cdp, run, tag, it, picks=X.get('picks', ()), stop_zone=X.get('at'))
        run.check('%s：手機「今天」有「直接去上課」（%s）' % (tag, tr.get('btn')), (tr.get('btn') or '').startswith('直接去上課'), (tr.get('today') or '')[:300])
        if not tr.get('btn'): return
        if X.get('neg'):
            check_straight(run, tag, it, pr, tr)
            if tr.get('ok'): await phone_row_late(pg, cdp, run, tag, it, tr)
            run.check('%s：%s 沒有演' % (tag, X['neg']), not await pg.evaluate(EVDONE, X['neg']), J(tr.get('evs')))
            return
        R = tr['R']; routes = tr.get('routes', []); caps = tr.get('caps', []); ents = tr.get('enters', [])
        r0 = routes[0][0] if routes else None
        run.check('%s：路上第一次 routeStop 停在 %s、事件 %s' % (tag, X['at'], X['ev']), isinstance(r0, dict) and r0.get('zone') == X['at'] and r0.get('ev') == X['ev'], J(routes))
        go_via = '走路往%s去。' % it['bld']; go_to = '走路到%s。' % it['bld']
        iv = next((i for i, r in enumerate(R) if r['k'] == 'cap' and r['t'] == go_via), None)
        ie = next((i for i, r in enumerate(R) if r['k'] == 'enter'), None)
        run.check('%s：旁白「%s」，接著換到 %s（第一次換區域）' % (tag, go_via, X['at']), iv is not None and ie is not None and iv < ie and ents and ents[0][0] == X['at'], J({'caps': [c_[0] for c_ in caps], 'enters': ents}))
        if X.get('spawn'):
            sp = json.loads(ents[0][1]) if ents and ents[0][1] else {}
            run.check('%s：停在校園站在要走進去的那一棟門口 %s' % (tag, J(X['spawn'])), abs((sp.get('x') or 0) - X['spawn'][0]) < 0.1 and abs((sp.get('z') or 0) - X['spawn'][1]) < 0.1, J(sp))
        evr = [e for e in tr.get('evs', []) if e[0] == X['ev']]
        lr = next((s for s in tr.get('said', []) if (s[1] == X['line'] or s[1].startswith(X['line']))), None)
        run.check('%s：%s 在 %s 演（第一句「%s」）、只演一次' % (tag, X['ev'], X['at'], X['line'][:30]),
                  len(evr) == 1 and evr[0][1] == X['at'] and bool(lr) and lr[2] == X['at'] and await pg.evaluate(EVDONE, X['ev']), J({'evs': tr.get('evs'), 'line': lr}))
        crow = [ch for ch in tr.get('chooses', []) if ch[0].startswith(CONT)]
        c1 = crow[0] if crow else None
        lastline = max([s[4] for s in tr.get('said', []) if s[2] == X['at']] or [-1])
        run.check('%s：演完才出「繼續去上課：%s」（在 %s；第二個選項「先不去了」）' % (tag, it['name'], X['at']),
                  bool(c1) and c1[0].startswith(CONT + '：' + it['name']) and '｜先不去了' in c1[0] and c1[1] == X['at'] and bool(evr) and c1[3] > evr[0][3] and c1[3] > lastline,
                  J({'cont': crow, 'ev_at': evr and evr[0][3], 'last_line_at': lastline}))
        hint = hint_of(c1[0]) if c1 else ''
        dest = (pr or {}).get('dest')
        ia = next((i for i, r in enumerate(R) if r['k'] == 'enter' and r['t'] == dest), None)
        run.check('%s：選了以後「%s」→ 到 %s；後面的 routeStop 都是 null（同一件不再停）' % (tag, go_to, dest),
                  go_to in [c_[0] for c_ in caps] and ia is not None and bool(c1) and ia > c1[3] and all(r[0] is None for r in routes[1:]), J({'caps': [c_[0] for c_ in caps], 'enters': ents, 'routes': routes}))
        run.check('%s：上完（CLS.attend → done），沒有卡住' % tag, tr.get('ok') and not tr.get('stuck') and bool(tr.get('fin')) and tr['fin'].get('done'),
                  J({'end': tr.get('end'), 'stuck': tr.get('stuck_at'), 'st': tr.get('st')}))
        check_late(run, tag, tr, tr.get('said', []))
        if tr.get('ok'): await phone_row_late(pg, cdp, run, tag, it, tr)
        hv = hint_vs(hint, tr.get('att'))
        if (tr.get('att') or {}).get('kind') == 'service':
            run.note('%s：服務學習（CLS.attend service 不記遲到、缺席）：「繼續去上課」的提示 %s；服務學習照樣報到 %s' % (tag, hv[1], J(tr.get('fin'))))
        else:
            run.check('%s：「繼續去上課」的提示和實際一致（%s）' % (tag, hv[1]), hv[0], J(c1))
        ends = [s[3] for s in tr.get('said', []) if s[2] == X['at']]
        if c1 and ends:
            run.note('%s：事件演完（%s）到「繼續去上課」出現（%s）之間空著的遊戲時間 %.1f 分鐘（低幀率時 S.oneTick 要等 STORY.tick 三次；真機約 1～2 秒）' % (
                tag, hm(max(ends)), hm(c1[2]), (c1[2] - max(ends)) * 60))
        if c == 'late':
            fin = tr.get('fin') or {}
            run.check('%s：探針事件花了 20 分鐘＝提示寫「會遲到 N 分鐘」（或等選單太久超過 15 分鐘＝「進去會記缺席」）、進教室記遲到（或缺席），和提示一致' % tag,
                      ('會遲到' in hint and fin.get('late')) or ('記缺席' in hint and fin.get('abs')), J({'hint': hint, 'fin': fin, 'att': tr.get('att')}))
    finally:
        r = await pg.evaluate(EVRESTORE)
        if r: run.setup('【捷徑】%s：事件放回去：%s' % (tag, J(r)))


async def m_stops(pg, cdp, run):
    for c in ENV('STOPS', 'ps,psneg,l1,grad,info,late'):
        run.note('==== stops：%s ====' % c)
        try: await stop_case(pg, cdp, run, c)
        except Exception as ex: run.check('stops %s：跑完（沒有探針例外）' % c, False, repr(ex)[:400]); traceback.print_exc()


# ================================================================ 3. skipwarn：翹課確認「你會錯過：○○」
ASK = lambda name: '翹掉%s？記「沒去」，不扣分。' % name


async def confirm_lines(pg, cdp, run, tag, n0, it):
    """點了「翹這堂課／下一堂不去」以後：等確認的選單（翹／還是去），讀那之前的句子（GAME.say 原文）"""
    ch = await until_choice(pg, cdp, run, lambda T: any(t.startswith('翹') and len(t) <= 2 for t in T) and any(t.startswith('還是去') for t in T), ENVI('MENU_MAX', 300), tag=tag)
    R = await rows(pg, n0)
    i_ask = next((i for i, r in enumerate(R) if r['k'] == 'say' and r['t'] == ASK(it['name'])), None)
    lines = [r['t'] for r in R[i_ask:] if r['k'] == 'say'] if i_ask is not None else texts(R)[-3:]
    skip = next((json.loads(r['t']) for r in R if r['k'] == 'skip' and r['n'] == it['key']), None)
    return ch, lines, skip


async def skip_case(pg, cdp, run, c):
    tag = 'skip_' + c
    if c == 'wake':
        st, d = await state_at(pg, ['Y1S1', 4, 3], 23 + 20 / 60, 'dorm')
        await load(pg, cdp, run, st, '%s：最小存檔 %s（三，大一上第 4 週）23:20 宿舍房間' % (tag, d['key']), js="NOKX(); return null;")
        thu = await P.day_of(pg, ['Y1S1', 4, 4])
        ok = await press_bed(pg, cdp, run)
        ch = await until_choice(pg, cdp, run, lambda T: any(t.startswith('睡到明天') for t in T), 60, tag=tag + '_bed') if ok else None
        run.check('%s：走到床、按下去＝有「睡到明天早上（…）」' % tag, bool(ch), J(ch))
        if not ch: return
        t = await tap_text(pg, cdp, ch, '睡到明天早上') or await tap_text(pg, cdp, ch, '睡到明天')
        run.note('%s：床的選單 %s → 選 %s' % (tag, J([o['t'] for o in ch]), t))
        n0 = await pl_len(pg)
        ch = await until_choice(pg, cdp, run, lambda T: any(x.startswith('翹這堂課') for x in T), ENVI('WAKE_MAX', 900), tag=tag + '_night')
        R = await rows(pg, n0); morn = next((x for x in reversed(texts(R)) if x.startswith('早安。今天的課：')), None)
        await run.shot(pg, tag + '_wake1')
        run.check('%s：%s 起床選單「早安。今天的課：09:10　大一英文…／13:20　民法總則…」、三個選項（直接去上課／翹這堂課／先起床再說）' % (tag, thu['key']),
                  bool(ch) and bool(morn) and morn.startswith('早安。今天的課：09:10　大一英文') and '13:20　民法總則' in morn and len(ch) == 3 and ch[0]['t'].startswith('直接去上課：大一英文')
                  and ch[2]['t'].startswith('先起床再說'), J({'said': morn, 'opts': [o['t'] for o in (ch or [])]}))
        if not ch: return
        en = await pg.evaluate(ITEM, 'english_y1')
        run.note('%s：大一英文（只讀）%s' % (tag, J(en)))
        n1 = await pl_len(pg); await tap_text(pg, cdp, ch, '翹這堂課')
        cf, lines, skip = await confirm_lines(pg, cdp, run, tag + '_en', n1, en)
        want = [ASK(en['name'])] + (['你會錯過：' + '、'.join(en['miss']) + '。'] if en.get('miss') else [])
        run.check('%s：翹英文的確認＝%s（「你會錯過」照 CLS.classMissList：%s）、選項只有「翹／還是去」' % (tag, J(want), J(en.get('miss'))),
                  bool(cf) and lines == want and [o['t'] for o in cf] == ['翹', '還是去'], J({'lines': lines, 'opts': [o['t'] for o in (cf or [])], 'skipHook': skip}))
        if not cf: return
        await tap_text(pg, cdp, cf, '翹')
        nap = await until_choice(pg, cdp, run, lambda T: any(x.startswith('再睡一下') for x in T), ENVI('MENU_MAX', 300), tag=tag + '_nap')
        run.check('%s：翹了以後問「再睡一下（睡到 10:30）／起床」' % tag, bool(nap) and nap[0]['t'].startswith('再睡一下（睡到 10:30）'), J([o['t'] for o in (nap or [])]))
        if not nap: return
        await tap_text(pg, cdp, nap, '再睡一下')
        n2 = await pl_len(pg)
        ch2 = await until_choice(pg, cdp, run, lambda T: any(x.startswith('翹這堂課') for x in T), ENVI('WAKE_MAX', 900), tag=tag + '_nap2')
        R = await rows(pg, n2); morn2 = next((x for x in reversed(texts(R)) if x.startswith('早安。今天的課：')), None)
        await run.shot(pg, tag + '_wake2')
        run.check('%s：小睡醒來的起床選單從民法總則開始（英文翹了）：「%s」' % (tag, (morn2 or '')[:40]), bool(ch2) and bool(morn2) and morn2.startswith('早安。今天的課：13:20　民法總則')
                  and ch2[0]['t'].startswith('直接去上課：民法總則'), J({'said': morn2, 'opts': [o['t'] for o in (ch2 or [])]}))
        if not ch2: return
        it = await pg.evaluate(ITEM, 'civ_general')
        run.note('%s：民法總則（只讀）%s' % (tag, J(it)))
        done0 = sorted(await pg.evaluate(EVDONE_ALL)); h0 = (await P.clock(pg))['h']
        n3 = await pl_len(pg); await tap_text(pg, cdp, ch2, '翹這堂課')
        cf, lines, skip = await confirm_lines(pg, cdp, run, tag + '_civ', n3, it)
        await run.shot(pg, tag + '_confirm')
        run.check('%s：翹民總的確認＝「%s」「%s」、選項只有「翹／還是去」' % (tag, ASK(it['name']), SKIP_TEXT),
                  bool(cf) and lines == [ASK(it['name']), SKIP_TEXT] and [o['t'] for o in cf] == ['翹', '還是去'], J({'lines': lines, 'opts': [o['t'] for o in (cf or [])], 'classMissList': skip}))
        run.check('%s：確認那一行和頁面裡 CLS.classMissList 一致（%s）' % (tag, J(skip)), bool(skip) and SKIP_TEXT == '你會錯過：' + '、'.join(skip) + '。', J(skip))
        if not cf: return
        await tap_text(pg, cdp, cf, '翹'); await pg.wait_for_timeout(1500)
        done1 = sorted(await pg.evaluate(EVDONE_ALL)); s_en = await pg.evaluate(KEYST, en['key']); s_civ = await pg.evaluate(KEYST, it['key'])
        run.check('%s：兩堂都記「翹課」（plan_skip）；確認本身沒有演事件、事件紀錄不變' % tag, s_en.get('planSkip') and s_civ.get('planSkip') and done0 == done1,
                  J({'en': s_en, 'civ': s_civ, 'done+': sorted(set(done1) - set(done0)), 'h': [h0, (await P.clock(pg))['h']]}))
        await phone_row(pg, cdp, run, tag, it, ['翹課', '反悔：直接去上課'], (), '民總翹了')
    elif c == 'next':
        st, d = await state_at(pg, ['Y1S1', 4, 4], 8.5, 'dorm')
        await load(pg, cdp, run, st, '%s：最小存檔 %s（四，大一上第 4 週）08:30 宿舍' % (tag, d['key']), js="NOKX(); return null;")
        en = await pg.evaluate(ITEM, 'english_y1')
        run.check('%s：%s 有大一英文（只讀）' % (tag, d['key']), isinstance(en, dict), J(en))
        if not isinstance(en, dict): return
        tr = await trip(pg, cdp, run, tag + '_en', en)
        run.check('%s：手機「今天」→「直接去上課」大一英文 → 上完' % tag, tr.get('ok') and bool(tr.get('fin')) and tr['fin'].get('done'), J({'end': tr.get('end'), 'fin': tr.get('fin'), 'stuck': tr.get('stuck_at')}))
        if not tr.get('ok'): return
        ch = await until_choice(pg, cdp, run, lambda T: any(x.startswith('下一堂不去') for x in T), ENVI('MENU_MAX', 300), tag=tag + '_after')
        await run.shot(pg, tag + '_after')
        run.check('%s：下課選單有「下一堂不去」' % tag, bool(ch), J([o['t'] for o in (ch or [])]))
        if not ch: return
        it = await pg.evaluate(ITEM, 'civ_general')
        run.note('%s：民法總則（只讀）%s' % (tag, J(it)))
        done0 = sorted(await pg.evaluate(EVDONE_ALL))
        n1 = await pl_len(pg); await tap_text(pg, cdp, ch, '下一堂不去')
        cf, lines, skip = await confirm_lines(pg, cdp, run, tag + '_civ', n1, it)
        await run.shot(pg, tag + '_confirm')
        run.check('%s：「下一堂不去」（民總）的確認＝「%s」「%s」、選項只有「翹／還是去」' % (tag, ASK(it['name']), SKIP_TEXT),
                  bool(cf) and lines == [ASK(it['name']), SKIP_TEXT] and [o['t'] for o in cf] == ['翹', '還是去'], J({'lines': lines, 'opts': [o['t'] for o in (cf or [])], 'classMissList': skip}))
        if not cf: return
        await tap_text(pg, cdp, cf, '翹'); await pg.wait_for_timeout(1500)
        done1 = sorted(await pg.evaluate(EVDONE_ALL)); s_civ = await pg.evaluate(KEYST, it['key'])
        run.check('%s：民總記「翹課」（plan_skip）；確認本身沒有演事件' % tag, s_civ.get('planSkip') and done0 == done1, J({'civ': s_civ, 'done+': sorted(set(done1) - set(done0))}))
        await phone_row(pg, cdp, run, tag, it, ['翹課', '反悔：直接去上課'], (), '民總翹了')
    else:
        run.check('SKIPW＝%s 認得' % c, False, 'wake,next')


async def m_skipwarn(pg, cdp, run):
    for c in ENV('SKIPW', 'wake,next'):
        run.note('==== skipwarn：%s ====' % c)
        try: await skip_case(pg, cdp, run, c)
        except Exception as ex: run.check('skipwarn %s：跑完（沒有探針例外）' % c, False, repr(ex)[:400]); traceback.print_exc()


# ================================================================ 4. econ：經濟系那年連續三個上課日
async def econ_day(pg, cdp, run, tag, cid=None):
    it = await pg.evaluate(ITEM, cid) if cid else await pg.evaluate(FIRSTGO)
    c0 = await P.clock(pg)
    run.check('%s：%s 有要上的課（%s，只讀）' % (tag, c0['key'], cid or '那天第一堂'), isinstance(it, dict), J(it))
    if not isinstance(it, dict): return None
    pr = await predict(pg, run, tag, it)
    run.check('%s：事件模式（ECONFF.on %s、short %s）；只讀預測 routeStop＝null（路線 %s）' % (tag, (pr or {}).get('econff'), (pr or {}).get('short'), J((pr or {}).get('via'))),
              isinstance(pr, dict) and pr.get('stop') is None, J(pr))
    tr = await trip(pg, cdp, run, tag, it, snap_done=True)
    run.check('%s：手機「今天」有「直接去上課」（%s）' % (tag, tr.get('btn')), (tr.get('btn') or '').startswith('直接去上課'), (tr.get('today') or '')[:300])
    if not tr.get('btn'): return tr
    run.check('%s：讀檔到按下去之間事件模式沒有跳走、按下去以後也沒有在上課前跳走' % tag, not tr.get('jumped'), J({'jumped_to': tr.get('jumped_to')}))
    check_straight(run, tag, it, pr, tr)
    st = tr.get('st') or {}
    run.check('%s：是一鍵上課坐下上完（CLS.attend），不是事件模式跳過去自動算的（skip_ 紀錄）' % tag, bool(tr.get('fin')) and not st.get('skipNote'), J(st))
    if tr.get('ok'): await phone_row_late(pg, cdp, run, tag, it, tr)
    await pg.wait_for_timeout(ENVI('ECON_AFTER', 10) * 1000)
    run.note('%s：上完以後 %d 秒，事件模式做了什麼（只印）：%s' % (tag, ENVI('ECON_AFTER', 10), J(await P.clock(pg))))
    if tr.get('snap') is None: tr['snap'] = await pg.evaluate("()=>GAME.snapshot()")
    return tr


async def m_econ(pg, cdp, run):
    days = ENV('ECON', '2024-10-07,2024-10-08,2024-10-09'); pm = os.environ.get('ECON_PM', '2024-10-08').strip()
    snap = None; snaps = {}
    for i, k in enumerate(days):
        tag = 'econ_%d_%s' % (i + 1, k)
        run.note('==== econ：%s ====' % k)
        try:
            if snap is None:
                st, d = await econ_state(pg, k, 8 + 40 / 60, 'dorm')
                c = await econ_load(pg, cdp, run, st, '%s：經濟系最小存檔 %s 08:40 宿舍（E01_MORNING：事件模式）' % (tag, d['key']))
            else:
                s = copy.deepcopy(snap); d = await P.day_of(pg, k)
                s.update(day=d['d'], weekday=d['wd'], hour=8 + 40 / 60, zone='dorm', pos=None)
                c = await econ_load(pg, cdp, run, s, '%s：同一份進度（上完前一天的課那一刻存的）跳到 %s 08:40 宿舍' % (tag, d['key']))
            if not run.check('%s：讀檔後打開手機時事件模式還沒跳走（還是 %s 08:40 左右、宿舍）' % (tag, d['key']), c['day'] == d['d'] and c['h'] < 9.0 and c['zone'] == 'dorm', J(c)):
                continue
            tr = await econ_day(pg, cdp, run, tag)
            if tr and tr.get('snap'): snap = tr['snap']; snaps[k] = tr['snap']
        except Exception as ex:
            run.check('econ %s：跑完（沒有探針例外）' % k, False, repr(ex)[:400]); traceback.print_exc()
    if pm:
        tag = 'econ_pm_' + pm; run.note('==== econ：%s 下午 ====' % pm)
        try:
            base = snaps.get(pm) or snap
            if base is None:
                st, d = await econ_state(pg, pm, 12.5, 'dorm'); c = await econ_load(pg, cdp, run, st, '%s：經濟系最小存檔 %s 12:30 宿舍' % (tag, d['key']))
            else:
                s = copy.deepcopy(base); d = await P.day_of(pg, pm)
                s.update(day=d['d'], weekday=d['wd'], hour=12.5, zone='dorm', pos=None)
                c = await econ_load(pg, cdp, run, s, '%s：同一份進度跳到 %s 12:30 宿舍（13:20 通識；路上經過校園 13:02）' % (tag, d['key']))
            if not run.check('%s：讀檔後打開手機時事件模式還沒跳走（還是 %s 12:30 左右、宿舍）' % (tag, d['key']), c['day'] == d['d'] and c['h'] < 12.9 and c['zone'] == 'dorm', J(c)):
                return
            t1 = await pg.evaluate(EVINFO, ['ev_y0_t1', 'campus'])
            run.note('%s：經濟系 T1「全系的秘密」（AA_300／AA_303 拿掉）分類（只讀）：%s' % (tag, J(t1)))
            await econ_day(pg, cdp, run, tag, cid='ge_y0s1')
            run.check('%s：T1「全系的秘密」沒有在路上演' % tag, not await pg.evaluate(EVDONE, 'ev_y0_t1'), '')
        except Exception as ex:
            run.check('econ %s 下午：跑完（沒有探針例外）' % pm, False, repr(ex)[:400]); traceback.print_exc()


# ================================================================ 5. door：門口上課的課「直接去上課」到了會報到（BUG-DOOR-CLASS-GO-1101，CC 11-02）
DOORC = {
    'svc': dict(key=['Y1S1', 4, 3], h=12.5, zone='dorm', cid='service_1', dzone='lawlib',
                who='大一上第 4 週週三 12:30 宿舍 → 13:20 服務學習（一）（法律學院圖書館 櫃台，LAWLIB_DESK＝zone lawlib＋door lawlib_desk、沒有 room）'),
    'eth': dict(key=['Y4S1', 3, 2], h=12.5, zone='dorm', cid='legal_ethics', dzone='wancai',
                who='大四上第 3 週週二 12:30 宿舍 → 13:20 法律倫理（法律系館B 研討室 A，WSEM＝zone wancai＋door wancai_seminar、沒有 room）'),
}


async def door_case(pg, cdp, run, c):
    if c not in DOORC: run.check('DOOR＝%s 認得' % c, False, ','.join(DOORC)); return
    X = DOORC[c]; tag = 'door_' + c
    st, d = await state_at(pg, X['key'], X['h'], X['zone'])
    await load(pg, cdp, run, st, '%s：最小存檔 %s %s %s（%s）' % (tag, d['key'], hm(X['h']), X['zone'], X['who']), js="NOKX(); return null;")
    it = await pg.evaluate(ITEM, X['cid'])
    run.check('%s：%s 有 %s（CLS.dayItems，只讀）' % (tag, d['key'], X['cid']), isinstance(it, dict), J(it))
    if not isinstance(it, dict): return
    plan = await pg.evaluate("""(key=>{ const it=CLS.dayItems(GAME.G).find(q=>q.key===key); const pl=it&&CLS.goPlan(GAME,it); return pl?{d:pl.d,mins:pl.mins,depart:pl.depart,arrive:pl.arrive}:null; })""", it['key'])
    run.note('%s：只讀 CLS.goPlan 的目的地 %s（修正後應該帶 door）' % (tag, J(plan)))
    att0 = await pg.evaluate("(cid=>(CLS.rec(GAME.G).attend||{})[cid]|0)", X['cid'])
    tr = await trip(pg, cdp, run, tag, it, max_s=ENVI('TRIP_MAX', 600))
    run.check('%s：手機「今天」有「直接去上課」（%s）' % (tag, tr.get('btn')), (tr.get('btn') or '').startswith('直接去上課'), (tr.get('today') or '')[:300])
    if not tr.get('btn'): return
    ents = [e[0] for e in tr.get('enters', [])]
    run.check('%s：走到 %s（換區域 %s）' % (tag, X['dzone'], J(ents)), X['dzone'] in ents, J(tr.get('enters')))
    att = tr.get('att') or {}
    run.check('%s：到門口就報到（CLS.attend 被呼叫、o.door＝true）' % tag, bool(tr.get('att')) and att.get('door') is True, J(att))
    fin = tr.get('fin') or {}
    att1 = await pg.evaluate("(cid=>(CLS.rec(GAME.G).attend||{})[cid]|0)", X['cid'])
    run.check('%s：上完（CLS.rec done）、出席次數 +1（%d → %d）、沒有卡住' % (tag, att0, att1),
              tr.get('ok') and not tr.get('stuck') and fin.get('done') and att1 == att0 + 1, J({'end': tr.get('end'), 'stuck': tr.get('stuck_at'), 'fin': fin, 'st': tr.get('st')}))
    said = [s_[1] for s_ in tr.get('said', [])]
    run.note('%s：一鍵上課之後的台詞（前 12 句）%s' % (tag, J(said[:12])))
    if c == 'svc':
        run.check('%s：櫃台「第一次報到」那一句有出現' % tag, any('第一次報到' in t for t in said), J(said[:12]))
    if tr.get('ok'): await phone_row_late(pg, cdp, run, tag, it, tr)


async def m_door(pg, cdp, run):
    for c in ENV('DOOR', 'svc,eth'):
        run.note('==== door：%s ====' % c)
        try: await door_case(pg, cdp, run, c)
        except Exception as ex: run.check('door %s：跑完（沒有探針例外）' % c, False, repr(ex)[:400]); traceback.print_exc()


# ================================================================ 6. latefix：上課遲到會記下來、手機顯示正確（444dd616e，CC 11-02）
LATEC = {
    'l5': dict(key=['Y1S1', 6, 4], h=13 + 22 / 60, zone='linze', cid='civ_general',
               who='大一上第 6 週週四 13:22 法律系館A 大廳（課 13:20 已開始；到 201 約 3 分鐘＝晚幾分鐘）→ 13:20 民法總則（201）'),
    'abs': dict(key=['Y1S1', 6, 4], h=13 + 40 / 60, zone='linze', cid='civ_general',
                who='大一上第 6 週週四 13:40 法律系館A 大廳（已開始 20 分鐘以上）→ 民法總則：「現在進去會記缺席」→「還是進去聽」'),
}


async def late_case(pg, cdp, run, c):
    if c not in LATEC: run.check('LATE＝%s 認得' % c, False, ','.join(LATEC)); return
    X = LATEC[c]; tag = 'latefix_' + c
    st, d = await state_at(pg, X['key'], X['h'], X['zone'])
    await load(pg, cdp, run, st, '%s：最小存檔 %s %s %s（%s）' % (tag, d['key'], hm(X['h']), X['zone'], X['who']), js="NOKX(); return null;")
    it = await pg.evaluate(ITEM, X['cid'])
    run.check('%s：%s 有 %s（只讀）' % (tag, d['key'], X['cid']), isinstance(it, dict), J(it))
    if not isinstance(it, dict): return
    tr = await trip(pg, cdp, run, tag, it)
    run.check('%s：手機「今天」有「直接去上課」（%s）' % (tag, tr.get('btn')), (tr.get('btn') or '').startswith('直接去上課'), (tr.get('today') or '')[:300])
    if not tr.get('btn'): return
    att = tr.get('att') or {}
    run.check('%s：上完、沒有卡住' % tag, tr.get('ok') and not tr.get('stuck') and (tr.get('fin') or {}).get('done'), J({'end': tr.get('end'), 'stuck': tr.get('stuck_at'), 'fin': tr.get('fin')}))
    lm = att.get('lateMin') or 0
    if c == 'l5':
        run.check('%s：前置成立＝進教室那一刻晚 1～15 分鐘（實際 %s）' % (tag, lm), 1 <= lm <= 15, J(att))
    else:
        run.check('%s：前置成立＝進教室那一刻晚超過 15 分鐘（實際 %s）' % (tag, lm), lm > 15, J(att))
    check_late(run, tag, tr, tr.get('said', []))
    if tr.get('ok'): await phone_row_late(pg, cdp, run, tag, it, tr)


async def m_latefix(pg, cdp, run):
    for c in ENV('LATE', 'l5,abs'):
        run.note('==== latefix：%s ====' % c)
        try: await late_case(pg, cdp, run, c)
        except Exception as ex: run.check('latefix %s：跑完（沒有探針例外）' % c, False, repr(ex)[:400]); traceback.print_exc()


# ================================================================ main
MODEFN = {'plain': m_plain, 'stops': m_stops, 'skipwarn': m_skipwarn, 'econ': m_econ, 'door': m_door, 'latefix': m_latefix}


async def main():
    run = L.Run('dl04b_' + '+'.join(MODES), OUT); os.makedirs(OUT, exist_ok=True)
    async with async_playwright() as p:
        for m in MODES:
            fn = MODEFN.get(m)
            if not fn: run.check('MODE %s 認得' % m, False, '可以用：' + ','.join(MODEFN)); continue
            print('==== MODE %s（SHA %s）====' % (m, os.environ.get('SHA', '?')), flush=True)
            b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
            pg.on('dialog', lambda dd: asyncio.ensure_future(dd.accept()))
            try:
                await pg.goto(URL); ok = await L.wait_loaded(pg); run.check('%s：遊戲載入' % m, ok)
                await pg.evaluate("localStorage.clear()"); await P.init(pg); await pg.evaluate(HOOK)
                await fn(pg, cdp, run)
            except Exception as e:
                run.check('%s：跑完（沒有探針例外）' % m, False, repr(e)[:500]); traceback.print_exc()
                try: await run.shot(pg, m + '_exception')
                except Exception: pass
            run.check('%s：沒有 JS 例外' % m, not errs, J(errs[:3]))
            try: await asyncio.wait_for(b.close(), 30)
            except Exception: pass
    print('SHA', os.environ.get('SHA', '?'), 'MODE', ','.join(MODES), flush=True)
    sys.exit(run.finish())

if __name__ == '__main__':
    asyncio.run(main())
