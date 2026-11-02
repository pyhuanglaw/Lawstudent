"""CC（帳號 A）11-02：法律服務社週六值班——瀏覽器版（BB 10:34 第 5 項）。同一個週六只能算一次；下一個值班週六可以再算。
受測：開發分支 d75871437。方法：瀏覽器實玩，不用 turbo（URL '<URL>/index.html'；有 turbo 會記一筆注意）。
不是 iPhone：Playwright 手機模擬（橫向 844×390 開瀏覽器；重要畫面 shoot_both 另外切直向 390×844 截一張再切回來）。

讀碼（d75871437）：
  src/story3d.js:668 STORY.fafuDuty(G)＝法律系、星期六、學期第 3 週起的單週、不是考試週、不是假日（FAFU_WEEKS 3,5,7,11,13,15）。
  :683 fafuMember＝flags.lawclub（或 CLUB_lawclub_study）且 Y2S1～Y4S2。:692 fafuShiftable＝fafuDuty && fafuMember && !fafuSpecial && hour<12 && LAWCLUB_SAT_LAST!==今天。
  :373–376 進萬才館（wancai）populate：值班時段 9～12 放圓桌的人；社員多一個互動「坐到圓桌（做初談紀錄）」(-1.6,3.4)，hidden＝!fafuShiftable（同一天第二次＝按鈕不見）。
  :738 fafuShift：LAWCLUB_SAT_LAST＝今天、LAWCLUB_SAT_VISITS +1、FAFU_SHIFT_N +1 → 開場、民眾、「你先問什麼？」三選一 → 簽名旁白 → GM.advance(1)（時間 +1 小時）
       →「再待到十二點。／先走。」→ autosave。pool_more3d.js:514 包一層（旁白，先判 fafuShiftable）；y2b3d.js:237 包一層（2027-05-22 阿姨諮詢那天換成另一場，也 +1）。
  :2455 STORY.tick：社員、值班週六、09:30 以前、今天還沒算＝OUT.plan 出發提醒「法服值班（法律系館B一樓 9:00）」（outings3d.js：08:30 起問「出發：…」／晚一點／這週請假；
       出發＝goto 萬才館一樓 (0,5)）。
  :3949 STORY.careerLean(G).A＝LAWCLUB_SAT_VISITS＋5×C16＋5×C09＋3×C02＋YT_LEASE_HELP?3（每次重算，不存）。
  其他也會加的路（這支不走、只記旗標）：wzlines3d.js:93 溫州街線一／線三的值班事件（LAWCLUB_SAT_LAST 擋 VISITS；FAFU_SHIFT_N 沒有擋同一天）；
       fafuWatch（「在旁邊看法服值班」：大一、或大二起沒加入法服的，VISITS 同一天一次、不加 FAFU_SHIFT_N；社員看不到這個按鈕）。

存檔【前置】：最小存檔（cc_makeup_probe 的 state_at：GAME.defaults＋過了開場的旗標 BASEF＋ROOM_Y2）＋flags.lawclub＝true（法服社員），大二上（Y2S1）。
  值班日 DAY1：Y2S1 第 W1 週（預設 11）星期六起找第一個 fafuDuty、不是 2027-05-22（阿姨諮詢）的週六；DAY2＝STORY.fafuSat(DAY1)（下一個值班週六）。環境變數 DAY1＝'YYYY-MM-DD' 可以指定。
  起點 08:15 宿舍（START=out，預設）；START=wancai＝【前置】直接 09:05 萬才館一樓出生點（不經過出發選單）。QUIET=0（預設）＝條件事件照常、只關手機自動打開（quiet_phone）。

BB 10:55 已核准的修法（LAWWW 下一版）：story3d.js:757 前提畫面的條件從「FAFU_SHIFT_N===1 且大二」改成「大二（Y2S1／Y2S2）、還沒有 FAFU_FIRST_SHIFT_Y2」，台詞不動。
  ＝溫州街線先把 FAFU_SHIFT_N 算成 1 的人、舊存檔大二已經值過班（N≥2）但沒有旗標的人，下一次坐圓桌都會補演那一句。
  wzline_first 的「隔週」check、old_y2_noflag：head d75871437 預期 FAIL，修好後 PASS。

CASES（逗號隔開，每個 case 開一個新的瀏覽器；預設 same_sat,next_sat,wzline_same,wzline_first,old_y2_noflag）：
  same_sat  DAY1 08:15 宿舍 → 站著等出發提醒（途中的對話照玩家點）→「出發：法服值班…」→ 萬才館一樓 → 走到圓桌、按「坐到圓桌（做初談紀錄）」→ 照玩家點完
            （「你先問什麼？」選 PICK_Q（預設「「先請他從頭講一次。」」）、最後選「先走。」——留在 12:00 以前，第二次才有意義）。
            記第一次前後：LAWCLUB_SAT_VISITS、LAWCLUB_SAT_LAST、FAFU_SHIFT_N、FAFU_ROT、careerLean A（全部 B、C）、遊戲時間（advance 1 小時）、fafuShiftable。
            第二次（同一個週六）：①在萬才館裡再走到圓桌旁：互動鍵是什麼字、圓桌那個互動是不是 hidden ②走出萬才館到校園、再走進來（populate 重跑）→ 同樣走到圓桌旁看
            （萬一按鈕還在＝照玩家按下去、點完，計數有沒有再加就看得出來）③ WAIT_NOON=1（預設）站在圓桌旁等到 11:55（途中的對話照點），再看一次計數。
            check：第一次 VISITS +1、FAFU_SHIFT_N +1、careerLean A +1、時間 ≥ +1 小時；第二次（三個時間點）VISITS、FAFU_SHIFT_N、careerLean A 都沒有再增加、圓桌按鈕不見。
  next_sat  DAY2（下一個值班週六）08:15 宿舍：有 same_sat 跑完的進度就用那一份（GAME.snapshot()）跳日期【前置】；單獨跑＝【前置】最小存檔＋旗標
            LAWCLUB_SAT_VISITS 1、LAWCLUB_SAT_LAST＝DAY1、FAFU_SHIFT_N 1、FAFU_ROT {open:1,cs:1,…}。之後同 same_sat 的第一次。
            check：VISITS、FAFU_SHIFT_N、careerLean A 都 +1、LAWCLUB_SAT_LAST＝DAY2。
  wzline_same（BB 10:49，BUG-FAFU-DOUBLE）DAY1：先照 same_sat 第一次的流程坐圓桌值班（選「先走。」，留在 12:00 以前）→【前置】同一份進度（GAME.snapshot()）寫進溫州街線的旗標
            （WZ_K 預設 lease3：WZ_COPY_LEASE 2、WZ_C_L1／WZ_C_L2 是前幾週、WZ_LINE_L＝{k:'lease3',day:DAY1,tries:0}；ins2＝WZ_BRUNCH_INS 1＋WZ_LINE_I）、讀檔回萬才館一樓出生點
            （WZ_INJECT=live＝不讀檔、直接改 GAME.G.flags）→ 站著等 WZL.tick 的 lineAt（萬才館、9～12 點、今天的線還沒演）演溫州街線的值班事件（S.LINE[k].ev）→ 照玩家點完
            → 再走到圓桌旁看一次。量從坐圓桌之前到演完：LAWCLUB_SAT_VISITS、FAFU_SHIFT_N、careerLean A 的增加量。
            check：VISITS 只 +1、FAFU_SHIFT_N 只 +1（wzlines3d.js:93 只用 LAWCLUB_SAT_LAST 擋 VISITS，FAFU_SHIFT_N 沒擋：head d75871437 預期 FAIL＝+2；
            Node 已重現 n20_fafu_double.js）、careerLean A 只 +1；溫州街線那一段真的演了（HOOK 的 WZL.run）。
            另外：story3d.js:757「大二第一次值班的前提畫面」＝fafuShift 裡 FAFU_SHIFT_N===1 且大二（Y2S1／Y2S2）時設 FAFU_FIRST_SHIFT_Y2＝今天、
            旁白「（隔壁桌，一個阿伯講了十分鐘，一直在講他兒子。大家都在翻六法。）」（AA_325 2-Y2-01；語彤事件 7 的麵店閒聊讀這個旗標，y2r2_3d.js）。
            記：FAFU_FIRST_SHIFT_Y2、逐字稿裡有沒有那句（check：圓桌先＝有演）。
  wzline_first 反過來：【前置】讀檔的存檔一開始就有溫州街線的旗標（同上）→ DAY1 08:15 宿舍 → 出發提醒（標題變成「法服值班（今天陪阿德）」）→ 萬才館 →
            lineAt 自動演溫州街線的值班事件、照玩家點完 → 走到圓桌旁（LAST 已是今天＝「坐到圓桌」應該不見；萬一還在就照玩家按下去點完）。
            記三個數值（VISITS、FAFU_SHIFT_N、careerLean A）在：一開始、溫州街線演完、圓桌之後。check：溫州街線演完 VISITS +1、FAFU_SHIFT_N +1（社員）；
            圓桌被擋、三個數值沒有再加。同一天的前提畫面（757）：這個順序當天 fafuShift 不會跑＝FAFU_FIRST_SHIFT_Y2 不會設、那句旁白不會出現——只記錄（不算 check）。
            隔週（BB 10:55；WZF_NEXT=1 預設）：【前置】同一份進度（GAME.snapshot()）跳到 DAY2＝fafuSat(DAY1)（下一個值班週六）08:15 宿舍（START=wancai＝09:05 萬才館）
            → 出發 → 萬才館 → 第一次照玩家坐圓桌、點完（同 same_sat 第一次，選「先走。」）。check：VISITS、FAFU_SHIFT_N、careerLean A 都 +1（check_plus1）、
            坐圓桌那一段演了阿伯那一句旁白、FAFU_FIRST_SHIFT_Y2＝DAY2（head d75871437 預期 FAIL：N 已經是 1，坐圓桌變 2，757 不成立；修好後 PASS）。
            DAY2 如果也有溫州街線（照碼 lease3 演完 WZ_LINE_L 應該不會再排）會記下來。
  old_y2_noflag（BB 10:55）【前置】舊存檔：最小存檔＋lawclub、DAY1（Y2S1 值班週六）08:15 宿舍、FAFU_SHIFT_N 2、LAWCLUB_SAT_VISITS 2、LAWCLUB_SAT_LAST＝DAY1−14（更早的日子）、
            FAFU_ROT {open:2,cs:2,…}、沒有 FAFU_FIRST_SHIFT_Y2（環境變數 OLD_N／OLD_VIS 可改）→ 出發 → 萬才館 → 照玩家坐圓桌、點完（選「先走。」）。
            check：check_plus1（VISITS +1、N +1、A +1、LAST＝今天、時間 ≥ +1 小時）、補演阿伯那一句旁白、FAFU_FIRST_SHIFT_Y2＝那一天（head 預期 FAIL：N 不是 1）。
截圖（直向＋橫向）：出發選單、萬才館圓桌（第一次按之前）、「你先問什麼？」、「再待到十二點／先走」、第二次走到圓桌旁（萬才館裡、重新進來以後）、等到 11:55；
  wzline_*：溫州街線事件的第一句對話、演完、之後圓桌旁。
逐字稿：HOOK（GAME.say／choose／caption／toast／enter／EVENTS.run／STORY.fafuShift 進出／WZL.lineAt 開演／WZL.run 進出＋當下計數）→ transcript_<case>.json。
不確定處：
  - 出發提醒要等 STORY.tick 排進 OUT（09:30 以前）再到 08:30 才問；最小存檔在大二上會不會先跳一連串補演的事件（events 照常）、把出發拖過 09:45（lateEnd）——
    09:40 還沒到萬才館＝記「前置沒成立」，改【捷徑】同一份進度跳到 09:05 萬才館一樓繼續（標示出來）。
  - 「被擋」的形式：照碼是圓桌按鈕 hidden（沒有旁白、沒有選單）；按鈕旁邊的其他互動（「看門口的告示」等）會記下來。fafuWatch 對社員不出現。
  - 等到 11:55 期間可能有萬才館的其他劇情（pool_more3d 的 meetB、zjwDuty、y2 的人）；照玩家點，計數變化會記哪一段造成的（HOOK 的 fafuShift 進出）。
  - wzline_same 不能一開始就把溫州街線的旗標寫進存檔：lineAt 是 WZL.tick 自己叫的，一進萬才館（9 點以後）就會先演，順序就變成 wzline_first。
    所以先坐圓桌、再用同一份進度寫旗標讀檔（【前置】）。WZ_COPY_LEASE 一定要跟著寫：WZL.linePlan（每格的 PHONE_RULES）看 leaseStep，對不上會把 WZ_LINE_L 清掉。
  - wzline_*：WZL.run 的 end 在 lineAt 的加分回呼之前（計數在 end 那一筆還沒加），量計數用演完、WZL.playing 放開以後的 FL_JS。
  - wzline_first 隔週／old_y2_noflag：第 11 週已過第 6 週＝伯翰「這學期起我排班」那一句（FAFU_BH_HELLO，認識伯翰才有）、學姊的句子可能一起出現；
    只看阿伯那一句有沒有在這次坐圓桌那一段（one_shift 記的 HOOK say）。DAY2 如果不在大二（跨學期）＝記一筆，check 會 FAIL（本來就不該演）。
  - old_y2_noflag 的 FAFU_ROT 設 open/cs＝OLD_N（開場、第幾件和「值過 N 次」對得上）；LAST＝DAY1−14 只是「更早的日子」，不保證那天是值班日。
  - DAY1 預設第 11 週；如果那天剛好是溫州街線一／線三的目標週六（WZ_LINE_L／WZ_LINE_I；最小存檔沒有那幾條的前置，應該不會），劇情會不一樣——會記 wzline 狀態。
環境變數：CASES、W1（11）、DAY1、START（out／wancai）、QUIET（0）、PICK_Q、WAIT_NOON（1）、STAY（0：最後選「先走。」；1：選「再待到十二點。」——wzline_same 一律選「先走。」）、
  WZ_K（lease3／lease2／ins2）、WZ_INJECT（reload／live）、WZF_NEXT（1：wzline_first 加跑隔週；0：只跑同一天）、OLD_N（2）、OLD_VIS（2）。
用法：LW_TESTS=<工作樹>/tests SHA=<sha> [CASES=same_sat,next_sat,wzline_same,wzline_first,old_y2_noflag] python3 cc_fasat_probe.py '<URL>/index.html' <輸出資料夾>"""
import os, sys, json, asyncio, copy, math, time, traceback
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__)))); import bbplay as P   # bbplay 在上一層（BB 的 test_tools）
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
J = lambda o: json.dumps(o, ensure_ascii=False)
CASES = [c.strip() for c in os.environ.get('CASES', 'same_sat,next_sat,wzline_same,wzline_first,old_y2_noflag').split(',') if c.strip()]
W1 = int(os.environ.get('W1', '11'))
DAY1 = os.environ.get('DAY1', '')
START = os.environ.get('START', 'out')
QUIET = os.environ.get('QUIET', '0') == '1'
PICK_Q = os.environ.get('PICK_Q', '「先請他從頭講一次。」')
WAIT_NOON = os.environ.get('WAIT_NOON', '1') == '1'
STAY = os.environ.get('STAY', '0') == '1'
LAND = {'width': 844, 'height': 390}; PORT = {'width': 390, 'height': 844}
SHIFT_LABEL = '坐到圓桌'
GO_PICK = '出發：法服值班'
AUNT_DAY = '2027-05-22'
WZ_K = os.environ.get('WZ_K', 'lease3')
WZ_INJECT = os.environ.get('WZ_INJECT', 'reload')
LINE_EV = {'lease2': 'ev_wz_c_lease2', 'lease3': 'ev_wz_c_lease3', 'ins2': 'ev_wz_b_ins2'}[WZ_K]
FIRST_Y2_LINE = '隔壁桌，一個阿伯'
WZF_NEXT = os.environ.get('WZF_NEXT', '1') == '1'
OLD_N = int(os.environ.get('OLD_N', '2'))
OLD_VIS = int(os.environ.get('OLD_VIS', '2'))


def hm(h):
    if h is None: return '--:--'
    m = int(round(float(h) * 60)); return '%02d:%02d' % (m // 60, m % 60)


# ---------------------------------------------------------------- 存檔（cc_makeup_probe 的 state_at，複製）
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
    F.update(flags or {})
    st.update(day=d['d'], weekday=d['wd'], hour=h, zone=zone, pos=pos, weather='clear', stage='law', money=30000)
    st['visited'] = {z: True for z in VISITED}
    return st, d


# 值班日：Y2S1 第 W1 週星期六起找第一個 fafuDuty、不是阿姨那天的週六；DAY2＝fafuSat(DAY1)
DUTY_DAYS = r"""(([w1,key,aunt])=>{ const ad=STORY.dayOfKey(aunt); let d=key?STORY.dayOfKey(key):STORY.termDay('Y2S1',w1,6); if(d==null) return {err:'找不到起點'};
  const ok=x=>STORY.fafuDuty({day:x,flags:{},stage:'law'})&&x!==ad; let n=0; if(!key) while(!ok(d)&&n++<120) d++;
  const s2=STORY.fafuSat(d); const info=x=>{ if(x==null) return null; const c=CALENDAR.dateOf(x), t=CALENDAR.termOf(x); return {d:x,key:c.key,wd:c.wd===7?0:c.wd,term:t&&t.id,week:t&&t.week,duty:STORY.fafuDuty({day:x,flags:{},stage:'law'}),hol:!!CALENDAR.holiday(x)}; };
  return {d1:info(d),d2:info(s2&&s2.day)}; })"""

# 計數（只讀）
FL_JS = r"""(()=>{ const G=GAME.G, F=G.flags||{}; let cl=null; try{ cl=STORY.careerLean(G); }catch(e){ cl={err:String(e.message)}; }
  let outs=null; try{ outs=(typeof OUT!=='undefined'&&OUT.rec?OUT.rec(G):(G.outings||[])).filter(q=>/^fafu_/.test(q.id)).map(q=>({id:q.id,state:q.state,day:q.day,h:q.h,title:q.title})); }catch(e){}
  let it=null; const x=(GAME.E.interactables||[]).find(i=>i.fafuShift); if(x) it={x:x.x,z:x.z,label:x.label,hidden:!!x.hidden};
  return {VIS:F.LAWCLUB_SAT_VISITS|0,LAST:F.LAWCLUB_SAT_LAST==null?null:F.LAWCLUB_SAT_LAST,N:F.FAFU_SHIFT_N|0,ROT:F.FAFU_ROT||null,TRK:F.FAFU_TRK||null,
    A:cl&&cl.A,lean:cl,day:G.day,key:CALENDAR.dateOf(G.day).key,h:+(+G.hour).toFixed(3),zone:G.zone,
    duty:!!STORY.fafuDuty(G),member:!!STORY.fafuMember(G),shiftable:!!STORY.fafuShiftable(G),watchable:!!(STORY.fafuWatchable&&STORY.fafuWatchable(G)),
    notice:STORY.fafuNotice?STORY.fafuNotice(G):null,outs,table:it,wz:{L:F.WZ_LINE_L||null,I:F.WZ_LINE_I||null},
    FIRST_Y2:F.FAFU_FIRST_SHIFT_Y2==null?null:F.FAFU_FIRST_SHIFT_Y2,COPY_LEASE:F.WZ_COPY_LEASE==null?null:F.WZ_COPY_LEASE,
    line:(typeof WZL!=='undefined')?{today:WZL.lineToday?WZL.lineToday(G):null,playing:!!WZL.playing,done:Object.fromEntries(Object.values(WZL.LINE||{}).map(x=>[x.ev,((G.events||{}).done||{})[x.ev]|0]))}:null}; })()"""
NEAR_IT = "(()=>{ const P=GAME.E.player.obj.position; return (GAME.E.interactables||[]).filter(i=>!(i.lv|0)&&Math.hypot(i.x-P.x,i.z-P.z)<3.5).map(i=>({label:i.label||'',hidden:!!i.hidden,fafuShift:!!i.fafuShift,fafuWatch:!!i.fafuWatch,d:+Math.hypot(i.x-P.x,i.z-P.z).toFixed(2)})); })()"
EXIT_JS = "(to=>{ const it=(GAME.E.interactables||[]).find(i=>i.exit&&i.exit.to===to&&!i.hidden&&!(i.lv|0)); return it?{x:it.x,z:it.z,r:it.radius||1.5,label:it.label||'',lv:it.lv|0}:null; })"
LIVEN = "(()=>({frame:GAME.E.frame|0,day:GAME.G.day,h:+(+GAME.G.hour).toFixed(3),busy:!!GAME.E.player.busy,zone:GAME.G.zone,x:+GAME.E.player.obj.position.x.toFixed(2),z:+GAME.E.player.obj.position.z.toFixed(2)}))()"

HOOK = r"""(()=>{ if(window.__PLH) return 'again'; window.__PLH=1; window.__PL=[];
  const at=()=>{ try{ const F=GAME.G.flags||{}; return {d:CALENDAR.dateOf(GAME.G.day).key, h:+(+GAME.G.hour).toFixed(3), z:GAME.G.zone, vis:F.LAWCLUB_SAT_VISITS|0, n:F.FAFU_SHIFT_N|0}; }catch(e){ return {}; } };
  const push=o=>{ try{ Object.assign(o,at()); window.__PL.push(o); if(window.__PL.length>8000) window.__PL.splice(0,2000); }catch(e){} return o; };
  const s0=GAME.say; GAME.say=function(w,t){ push({k:'say',n:(w&&w.name)||(typeof w==='string'?w:''),t:String(t==null?'':t)}); return s0.apply(this,arguments); };
  const c0=GAME.choose; GAME.choose=function(o){ push({k:'choose',n:'',t:(o||[]).filter(x=>x&&!x.hidden).map(x=>((x.t||x.text)||'')+(x.hint?'〔'+x.hint+'〕':'')).join('｜')}); return c0.apply(this,arguments); };
  if(GAME.caption){ const p0=GAME.caption; GAME.caption=function(n,t){ push({k:'cap',n:String(n||''),t:String(t==null?'':t)}); return p0.apply(this,arguments); }; }
  if(GAME.toast){ const o0=GAME.toast; GAME.toast=function(t){ push({k:'toast',n:'',t:String(t||'')}); return o0.apply(this,arguments); }; }
  if(GAME.enter){ const e0=GAME.enter; GAME.enter=function(z,sp){ push({k:'enter',n:'',t:String(z)}); return e0.apply(this,arguments); }; }
  if(typeof EVENTS!=='undefined'&&EVENTS.run){ const v0=EVENTS.run; EVENTS.run=function(ev){ push({k:'ev',n:'',t:String((ev&&ev.id)||'')}); return v0.apply(this,arguments); }; }
  if(STORY.fafuShift){ const f0=STORY.fafuShift; STORY.fafuShift=async function(GM){ push({k:'shift',n:'start',t:String(STORY.fafuShiftable(GM.G))}); const r=await f0.apply(this,arguments); push({k:'shift',n:'end',t:String(r)}); return r; }; }
  if(typeof WZL!=='undefined'){
    if(WZL.lineAt){ const l0=WZL.lineAt; WZL.lineAt=function(GM){ let R=null; try{ R=WZL.lineToday(GM.G); }catch(e){} const r=l0.apply(this,arguments); if(r) push({k:'line',n:'fire',t:JSON.stringify(R)}); return r; }; }
    if(WZL.run){ const r0=WZL.run; WZL.run=async function(GM,id){ push({k:'wzrun',n:'start',t:String(id)}); const r=await r0.apply(this,arguments); push({k:'wzrun',n:'end',t:String(id)+':'+String(r)}); return r; }; } }
  return 'ok'; })()"""


async def rows(pg, n0=0):
    return await pg.evaluate("n=>(window.__PL||[]).slice(n)", n0)


async def pl_len(pg):
    return await pg.evaluate("(window.__PL||[]).length")


async def shoot_both(pg, run, tag):
    await pg.wait_for_timeout(700)
    a = await run.shot(pg, tag + '_land')
    await pg.set_viewport_size(PORT); await pg.wait_for_timeout(2000)
    b = await run.shot(pg, tag + '_port')
    await pg.set_viewport_size(LAND); await pg.wait_for_timeout(2000)
    return [a, b]


async def fl(pg):
    return await pg.evaluate(FL_JS)


def slimfl(f):
    return {k: f.get(k) for k in ('VIS', 'LAST', 'N', 'A', 'key', 'h', 'zone', 'duty', 'member', 'shiftable', 'table', 'FIRST_Y2', 'COPY_LEASE', 'wz')} if f else f


async def load(pg, cdp, st):
    await L.load_state(pg, st, quiet_events=QUIET, quiet_phone=True); await pg.wait_for_timeout(5000)
    await L.phone_away(pg, cdp, tries=2); await L.close_panels(pg, cdp)
    await pg.evaluate(HOOK)


async def play_until(pg, cdp, run, cond, max_s, tag, picks=(), shots=None, shot_on=None, live_js=LIVEN):
    """照玩家點對話、選選項（picks 開頭優先，沒有就婉拒那一類、再沒有就第一個）、收手機，直到 cond(live) 成立。
    shot_on(選項文字清單)為真的選單第一次出現時 shoot_both（存進 shots）"""
    t0 = time.time(); seen = []; menus = []
    while time.time() - t0 < max_s:
        lv = await pg.evaluate(live_js)
        if cond(lv): break
        s = await P.ts(pg)
        if s['txt'] and (not seen or seen[-1] != [s['name'], s['txt']]): seen.append([s['name'], s['txt']])
        if s['ch']:
            opts = [o['t'] for o in s['ch']]; menus.append(opts)
            if shot_on and shots is not None and shot_on(opts) and 'menu:' + opts[0] not in shots:
                shots['menu:' + opts[0]] = await shoot_both(pg, run, '%s_menu%d' % (tag, len(menus)))
            k, _ = P.pick_of(s['ch'], picks); run.note('%s：選單 %s → 選「%s」' % (tag, J(opts), opts[k]))
            await P.tap_choice(pg, cdp, k); await pg.wait_for_timeout(1000); continue
        if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(650); continue
        if s['phone']: await L.phone_away(pg, cdp); continue
        await pg.wait_for_timeout(800)
    ok = cond(await pg.evaluate(live_js))
    if seen: run.note('%s 途中點過的對話：%s' % (tag, J(P.clean(seen))[:2000]))
    return ok, P.clean(seen), menus


async def go_exit(pg, cdp, run, to, tag):
    it = await pg.evaluate(EXIT_JS, to)
    if not it: run.note('%s：沒有通往 %s 的出入口' % (tag, to)); return False
    z0 = await pg.evaluate("GAME.G.zone"); key = it['label'][:6]
    await L.go_to(pg, cdp, run, it['x'], it['z'], max(0.5, min(1.2, it['r'] * 0.6)), '%s：%s' % (tag, it['label']), max_s=360, lv=it['lv'], stop=lambda s, k=key: k in s['interact'])
    for _ in range(4):
        s = await L.state(pg)
        if key in s['interact']: await L.tap(pg, cdp, '#interact'); break
        await pg.wait_for_timeout(1000)
    ok, _, _ = await play_until(pg, cdp, run, lambda lv: lv['zone'] != z0 and not lv['busy'], 120, tag)
    await pg.wait_for_timeout(2500)
    z1 = await pg.evaluate("GAME.G.zone"); run.note('%s：%s → %s' % (tag, z0, z1))
    return z1 != z0


async def to_table(pg, cdp, run, tag):
    """走到圓桌互動點旁（照碼 (-1.6,3.4)；頁面裡有就用頁面的座標）；回傳 (互動鍵的字, 附近的互動)"""
    t = await pg.evaluate("(()=>{ const x=(GAME.E.interactables||[]).find(i=>i.fafuShift); return x?[x.x,x.z]:null; })()") or [-1.6, 3.4]
    await L.go_to(pg, cdp, run, t[0], t[1], 0.7, '%s：圓桌 (%.1f,%.1f)' % (tag, t[0], t[1]), max_s=300, stop=lambda s: SHIFT_LABEL in s['interact'] or s['dlg'] or s['choices'] > 0)
    await pg.wait_for_timeout(1500)
    s = await L.state(pg); near = await pg.evaluate(NEAR_IT)
    run.note('%s：站在 (%.2f,%.2f)，互動鍵「%s」；附近的互動 %s' % (tag, s['x'], s['z'], s['interact'], J(near)))
    return s['interact'], near


async def arrive_wancai(pg, cdp, run, res, tag, snap_for_fallback):
    """START=out：08:15 宿舍站著等出發提醒 → 出發；09:40 還沒到萬才館＝【捷徑】同一份進度跳到 09:05 萬才館。回傳是否照玩家到的"""
    shots = res['shots']
    if START == 'out':
        ok, seen, menus = await play_until(pg, cdp, run, lambda lv: lv['zone'] == 'wancai' and not lv['busy'] or lv['h'] >= 9.67, 1500, tag + '_出發',
                                           picks=(GO_PICK,), shots=shots, shot_on=lambda o: any(x.startswith(GO_PICK) for x in o))
        res['depart_menus'] = menus
        lv = await pg.evaluate(LIVEN)
        if lv['zone'] == 'wancai':
            run.check('%s：照玩家從出發選單到萬才館（%s）' % (tag, hm(lv['h'])), True, J({'menus': menus[:4]}))
            await pg.wait_for_timeout(2000); return True
        run.check('%s：照玩家從出發選單到萬才館（09:40 以前）' % tag, False, J({'menus': menus[:6], 'live': lv}))
        run.note('%s：前置沒成立（沒到萬才館），改【捷徑】跳到 09:05 萬才館一樓' % tag)
    else:
        run.setup('%s：【前置】START=wancai：存檔直接在 09:05 萬才館一樓出生點（不經過出發選單）' % tag)
        return False
    s = await P.snapshot(pg) if snap_for_fallback is None else copy.deepcopy(snap_for_fallback)
    s.update(hour=9.08, zone='wancai', pos=None)
    await load(pg, cdp, s)
    run.setup('%s：【捷徑】同一份進度（08:15 讀檔時的快照）跳到 09:05 萬才館一樓出生點' % tag)
    return False


async def one_shift(pg, cdp, run, res, tag, final=None):
    """走到圓桌 → 按「坐到圓桌」→ 照玩家點完。回傳 (前, 後, 有沒有按到)"""
    shots = res['shots']
    b4 = await fl(pg); res[tag + '_before'] = b4
    run.note('%s 之前：%s' % (tag, J(slimfl(b4))))
    lab, near = await to_table(pg, cdp, run, tag)
    res[tag + '_label'] = lab; res[tag + '_near'] = near
    shots[tag + '_table'] = await shoot_both(pg, run, tag + '_table')
    if SHIFT_LABEL not in lab:
        run.check('%s：圓桌旁的互動鍵是「坐到圓桌（做初談紀錄）」' % tag, False, J({'label': lab, 'near': near, 'fl': slimfl(await fl(pg))}))
        return b4, await fl(pg), False
    n0 = await pl_len(pg)
    await L.tap(pg, cdp, '#interact')
    final = final or ('再待到十二點。' if STAY else '先走。')
    t0 = time.time(); started = False; seen = []; menus = []
    while time.time() - t0 < 600:
        s = await P.ts(pg)
        if s['txt'] and (not seen or seen[-1] != [s['name'], s['txt']]): seen.append([s['name'], s['txt']])
        if s['ch']:
            started = True; opts = [o['t'] for o in s['ch']]; menus.append(opts)
            if 'q:' + opts[0] not in shots: shots['q:' + opts[0]] = await shoot_both(pg, run, '%s_choice%d' % (tag, len(menus)))
            k, _ = P.pick_of(s['ch'], (PICK_Q, final)); run.note('%s：選單 %s → 選「%s」' % (tag, J(opts), opts[k]))
            await P.tap_choice(pg, cdp, k); await pg.wait_for_timeout(1000); continue
        if s['dlg']: started = True; await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(650); continue
        if s['busy'] or s['depth'] > 0: started = True; await pg.wait_for_timeout(500); continue
        if s['phone']: await L.phone_away(pg, cdp); continue
        if started or time.time() - t0 > 15: break
        await pg.wait_for_timeout(500)
    await pg.wait_for_timeout(2000)
    af = await fl(pg); res[tag + '_after'] = af
    res[tag + '_dialog'] = {'lines': P.clean(seen), 'menus': menus, 'rows': await rows(pg, n0)}
    run.note('%s 之後：%s；對話 %s' % (tag, J(slimfl(af)), J(P.clean(seen))[:1500]))
    return b4, af, True


async def check_plus1(run, tag, b4, af, tapped):
    run.check('%s：按到圓桌、值班那一段演了' % tag, tapped, '')
    run.check('%s：LAWCLUB_SAT_VISITS +1（%s → %s）' % (tag, b4['VIS'], af['VIS']), af['VIS'] == b4['VIS'] + 1, '')
    run.check('%s：FAFU_SHIFT_N +1（%s → %s）' % (tag, b4['N'], af['N']), af['N'] == b4['N'] + 1, '')
    run.check('%s：careerLean A +1（%s → %s）' % (tag, b4['A'], af['A']), (af['A'] or 0) == (b4['A'] or 0) + 1, J({'before': b4['lean'], 'after': af['lean']}))
    run.check('%s：LAWCLUB_SAT_LAST＝今天（%s）' % (tag, af['LAST']), af['LAST'] == af['day'], '')
    run.check('%s：時間推進 ≥ 1 小時（%s → %s）' % (tag, hm(b4['h']), hm(af['h'])), af['h'] - b4['h'] >= 0.98 or af['day'] > b4['day'], '')
    run.check('%s：之後 fafuShiftable＝false' % tag, not af['shiftable'], '')


async def check_blocked(run, tag, base, cur, lab):
    run.check('%s：圓桌旁沒有「坐到圓桌」（互動鍵「%s」）' % (tag, lab), SHIFT_LABEL not in (lab or ''), J({'table': cur.get('table')}))
    run.check('%s：LAWCLUB_SAT_VISITS 沒有再增加（%s → %s）' % (tag, base['VIS'], cur['VIS']), cur['VIS'] == base['VIS'], '')
    run.check('%s：FAFU_SHIFT_N 沒有再增加（%s → %s）' % (tag, base['N'], cur['N']), cur['N'] == base['N'], '')
    run.check('%s：careerLean A 沒有再增加（%s → %s）' % (tag, base['A'], cur['A']), cur['A'] == base['A'], '')


async def second_try(pg, cdp, run, res, tag, base):
    """同一天第二次：按鈕還在（不該在）＝照玩家按下去點完，計數會記到"""
    lab, near = await to_table(pg, cdp, run, tag)
    res[tag + '_near'] = near
    res['shots'][tag] = await shoot_both(pg, run, tag)
    if SHIFT_LABEL in lab:
        run.note('%s：按鈕還在，照玩家按下去' % tag)
        n0 = await pl_len(pg); await L.tap(pg, cdp, '#interact')
        await play_until(pg, cdp, run, lambda lv: False, 120, tag, picks=(PICK_Q, '先走。'))
        res[tag + '_rows'] = await rows(pg, n0)
    cur = await fl(pg); res[tag + '_fl'] = cur
    await check_blocked(run, tag, base, cur, lab)
    return cur


async def case_same(p, run, ctx_out):
    res = {'case': 'same_sat', 'shots': {}}
    b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
    pg.on('dialog', lambda dd: asyncio.ensure_future(dd.accept()))
    try:
        await pg.goto(URL); ok = await L.wait_loaded(pg); run.check('same_sat：遊戲載入', ok)
        await pg.evaluate("localStorage.clear()"); await P.init(pg)
        dd = await pg.evaluate(DUTY_DAYS, [W1, DAY1, AUNT_DAY]); res['days'] = dd
        run.note('值班日：%s' % J(dd))
        ctx_out['days'] = dd
        d1 = dd['d1']
        st, d = await state_at(pg, d1['key'], 8.25 if START == 'out' else 9.08, 'dorm' if START == 'out' else 'wancai', {'lawclub': True})
        await load(pg, cdp, st)
        run.setup('【前置】最小存檔（BASEF＋ROOM_Y2＋lawclub）→ %s（%s 第 %s 週，六）%s %s；%s' % (d1['key'], d1['term'], d1['week'], '08:15' if START == 'out' else '09:05',
                  '宿舍' if START == 'out' else '萬才館一樓', 'quiet_events' if QUIET else '條件事件照常（quiet_phone）'))
        f0 = await fl(pg); res['start'] = f0
        run.check('same_sat：前置成立（今天值班、是社員、還沒算過）', f0['duty'] and f0['member'] and f0['VIS'] == 0 and f0['N'] == 0, J(slimfl(f0)))
        res['shots']['start'] = await shoot_both(pg, run, 'same_start')
        snap0 = await P.snapshot(pg)
        res['by_player'] = await arrive_wancai(pg, cdp, run, res, 'same_sat', snap0)
        b4, af, tapped = await one_shift(pg, cdp, run, res, 'same_first')
        await check_plus1(run, 'same_sat 第一次', b4, af, tapped)
        res['shots']['after_first'] = await shoot_both(pg, run, 'same_after_first')
        if af['h'] >= 12: run.note('第一次做完已經 %s（12:00 以後按鈕本來就不出現）：第二次的檢查只剩「計數沒有再加」有意義' % hm(af['h']))
        # 第二次 ①同一個區域裡
        c1 = await second_try(pg, cdp, run, res, 'same_second_inside', af)
        # ②走出去再走進來
        out_ok = await go_exit(pg, cdp, run, 'campus', 'same_second：走出萬才館')
        in_ok = out_ok and await go_exit(pg, cdp, run, 'wancai', 'same_second：走回萬才館')
        run.check('same_sat：走出去再走進萬才館（populate 重跑）', bool(in_ok), J(await pg.evaluate(LIVEN)))
        c2 = await second_try(pg, cdp, run, res, 'same_second_reenter', af)
        # ③等到 11:55
        if WAIT_NOON:
            cur_h = (await pg.evaluate(LIVEN))['h']
            if cur_h < 11.9:
                await play_until(pg, cdp, run, lambda lv: lv['h'] >= 11.92 or lv['day'] > af['day'], 1500, 'same_wait_noon', picks=('先走。',))
            lab, near = await to_table(pg, cdp, run, 'same_noon')
            res['shots']['noon'] = await shoot_both(pg, run, 'same_noon')
            c3 = await fl(pg); res['noon_fl'] = c3
            await check_blocked(run, 'same_sat 等到 %s' % hm(c3['h']), af, c3, lab)
        ctx_out['snap'] = await P.snapshot(pg)
        res['rows'] = await rows(pg)
        res['shift_rows'] = [r for r in res['rows'] if r['k'] == 'shift']
        run.check('same_sat：STORY.fafuShift 只真的跑了一次（HOOK：start 時 fafuShiftable＝true 的次數）', sum(1 for r in res['shift_rows'] if r['n'] == 'start' and r['t'] == 'true') == 1, J(res['shift_rows']))
        run.check('same_sat：沒有 JS 例外', not errs, J(errs[:3]))
    except Exception as e:
        run.check('same_sat：跑完（沒有探針例外）', False, repr(e)[:500]); traceback.print_exc()
        try: await run.shot(pg, 'same_exception')
        except Exception: pass
    finally:
        with open(os.path.join(OUT, 'transcript_same_sat.json'), 'w', encoding='utf-8') as f:
            json.dump(res, f, ensure_ascii=False, indent=1)
        try: await asyncio.wait_for(b.close(), 30)
        except Exception: pass
    return res


async def case_next(p, run, ctx_out):
    res = {'case': 'next_sat', 'shots': {}}
    b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
    pg.on('dialog', lambda dd: asyncio.ensure_future(dd.accept()))
    try:
        await pg.goto(URL); ok = await L.wait_loaded(pg); run.check('next_sat：遊戲載入', ok)
        await pg.evaluate("localStorage.clear()"); await P.init(pg)
        dd = ctx_out.get('days') or await pg.evaluate(DUTY_DAYS, [W1, DAY1, AUNT_DAY]); res['days'] = dd
        d1, d2 = dd['d1'], dd['d2']
        run.note('值班日：DAY1 %s、DAY2 %s' % (J(d1), J(d2)))
        if not d2: run.check('next_sat：找得到下一個值班週六', False, J(dd)); return res
        h0 = 8.25 if START == 'out' else 9.08; z0 = 'dorm' if START == 'out' else 'wancai'
        if ctx_out.get('snap'):
            s = copy.deepcopy(ctx_out['snap']); dx = await P.day_of(pg, d2['key'])
            s.update(day=dx['d'], weekday=dx['wd'], hour=h0, zone=z0, pos=None); s.pop('_stuck', None); s.pop('_busy', None)
            await load(pg, cdp, s)
            run.setup('【前置】same_sat 跑完的進度（GAME.snapshot()）跳到 DAY2 %s（%s 第 %s 週，六）%s %s' % (d2['key'], d2['term'], d2['week'], hm(h0), z0))
        else:
            st, _ = await state_at(pg, d2['key'], h0, z0, {'lawclub': True, 'LAWCLUB_SAT_VISITS': 1, 'LAWCLUB_SAT_LAST': d1['d'], 'FAFU_SHIFT_N': 1,
                                                           'FAFU_ROT': {'open': 1, 'cs': 1, 'stay': 0, 'yt': 0, 'bh': 0, 'bk': 0, 'lg': 0}})
            await load(pg, cdp, st)
            run.setup('【前置】最小存檔＋lawclub＋上一次值班（VISITS 1、LAST＝DAY1 %s、FAFU_SHIFT_N 1、FAFU_ROT open 1 cs 1）→ DAY2 %s %s %s' % (d1['key'], d2['key'], hm(h0), z0))
        f0 = await fl(pg); res['start'] = f0
        run.check('next_sat：前置成立（DAY2 值班、是社員、LAST＝DAY1、shiftable）', f0['duty'] and f0['member'] and f0['LAST'] == d1['d'] and f0['VIS'] >= 1, J(slimfl(f0)))
        res['shots']['start'] = await shoot_both(pg, run, 'next_start')
        res['by_player'] = await arrive_wancai(pg, cdp, run, res, 'next_sat', await P.snapshot(pg))
        b4, af, tapped = await one_shift(pg, cdp, run, res, 'next_first')
        await check_plus1(run, 'next_sat（下一個值班週六）', b4, af, tapped)
        run.check('next_sat：LAWCLUB_SAT_LAST 從 DAY1 換成 DAY2', b4['LAST'] == d1['d'] and af['LAST'] == d2['d'], J([b4['LAST'], af['LAST'], d1['d'], d2['d']]))
        res['shots']['after'] = await shoot_both(pg, run, 'next_after')
        res['rows'] = await rows(pg)
        run.check('next_sat：沒有 JS 例外', not errs, J(errs[:3]))
    except Exception as e:
        run.check('next_sat：跑完（沒有探針例外）', False, repr(e)[:500]); traceback.print_exc()
        try: await run.shot(pg, 'next_exception')
        except Exception: pass
    finally:
        with open(os.path.join(OUT, 'transcript_next_sat.json'), 'w', encoding='utf-8') as f:
            json.dump(res, f, ensure_ascii=False, indent=1)
        try: await asyncio.wait_for(b.close(), 30)
        except Exception: pass
    return res


# ---------------------------------------------------------------- 溫州街線的值班事件（wzline_same／wzline_first）
LINE_LIVE = ("(()=>({frame:GAME.E.frame|0,day:GAME.G.day,h:+(+GAME.G.hour).toFixed(3),busy:!!GAME.E.player.busy,zone:GAME.G.zone,"
             "x:+GAME.E.player.obj.position.x.toFixed(2),z:+GAME.E.player.obj.position.z.toFixed(2),"
             "lineDone:!!((GAME.G.events||{}).done||{})['%s'],playing:!!(typeof WZL!=='undefined'&&WZL.playing),"
             "evr:!!(typeof EVENTS!=='undefined'&&EVENTS.running),dlg:!!(document.getElementById('dlg')&&getComputedStyle(document.getElementById('dlg')).display!=='none')}))()") % LINE_EV


def wz_flags(d):
    """【前置】溫州街線走到「法服值班的週六」那一步、目標週六＝d（day 數字）"""
    if WZ_K == 'ins2':
        return {'WZ_BRUNCH_INS': 1, 'WZ_B_INS_DAY': d - 14, 'WZ_LINE_I': {'k': 'ins2', 'day': d, 'tries': 0}}
    f = {'WZ_COPY_LEASE': 2 if WZ_K == 'lease3' else 1, 'WZ_C_L1': d - 28, 'WZ_LINE_L': {'k': WZ_K, 'day': d, 'tries': 0}}
    if WZ_K == 'lease3': f['WZ_C_L2'] = d - 14
    return f


def tri(f):
    return {'VIS': f['VIS'], 'N': f['N'], 'A': f['A'], 'LAST': f['LAST'], 'FIRST_Y2': f.get('FIRST_Y2'), 'h': hm(f['h'])}


async def play_line(pg, cdp, run, res, tag):
    """站著等 lineAt 演溫州街線的值班事件 → 照玩家點完。回傳 (有沒有演, 演完的 FL_JS)"""
    n0 = await pl_len(pg); shots = res['shots']
    ok, _, _ = await play_until(pg, cdp, run, lambda lv: lv['lineDone'] or lv['playing'], 120, tag + '_等開演', live_js=LINE_LIVE)
    lv = await pg.evaluate(LINE_LIVE)
    if not ok:
        f = await fl(pg)
        run.check('%s：溫州街線的值班事件（%s）有開演' % (tag, LINE_EV), False, J({'live': lv, 'wz': f.get('wz'), 'today': (f.get('line') or {}).get('today'), 'fl': slimfl(f)}))
        res[tag + '_line_rows'] = await rows(pg, n0)
        return False, f
    if lv['playing'] and not lv['lineDone']:
        shots[tag + '_line_dialog'] = await shoot_both(pg, run, tag + '_line_dialog')
    ok2, seen, menus = await play_until(pg, cdp, run, lambda lv: lv['lineDone'] and not lv['playing'] and not lv['busy'] and not lv['evr'], 600, tag + '_溫州街線',
                                        live_js=LINE_LIVE)
    await pg.wait_for_timeout(2500)
    f = await fl(pg)
    rr = await rows(pg, n0)
    res[tag + '_line'] = {'lines': seen, 'menus': menus, 'rows': rr, 'after': f}
    run.check('%s：溫州街線的值班事件（%s）演完（HOOK：lineAt 開演 %d 次、WZL.run %s）' % (tag, LINE_EV, sum(1 for r in rr if r['k'] == 'line'),
              J([r['t'] for r in rr if r['k'] == 'wzrun' and r['n'] == 'start'])), ok2, J({'live': await pg.evaluate(LINE_LIVE)}))
    shots[tag + '_line_after'] = await shoot_both(pg, run, tag + '_line_after')
    run.note('%s 溫州街線之後：%s' % (tag, J(slimfl(f))))
    return ok2, f


def said(rows_, needle):
    return any(r['k'] == 'say' and needle in (r.get('t') or '') for r in rows_)


async def boot_case(p, run, res, tag, shared):
    b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
    pg.on('dialog', lambda dd: asyncio.ensure_future(dd.accept()))
    await pg.goto(URL); ok = await L.wait_loaded(pg); run.check('%s：遊戲載入' % tag, ok)
    await pg.evaluate("localStorage.clear()"); await P.init(pg)
    dd = shared.get('days') or await pg.evaluate(DUTY_DAYS, [W1, DAY1, AUNT_DAY]); res['days'] = dd; shared['days'] = dd
    run.note('%s 值班日：%s' % (tag, J(dd)))
    return b, pg, cdp, errs, dd['d1']


async def case_wz_same(p, run, shared):
    res = {'case': 'wzline_same', 'shots': {}, 'wz_k': WZ_K, 'inject': WZ_INJECT}; b = None
    try:
        b, pg, cdp, errs, d1 = await boot_case(p, run, res, 'wzline_same', shared)
        st, d = await state_at(pg, d1['key'], 8.25 if START == 'out' else 9.08, 'dorm' if START == 'out' else 'wancai', {'lawclub': True})
        await load(pg, cdp, st)
        run.setup('wzline_same：【前置】最小存檔（BASEF＋ROOM_Y2＋lawclub，沒有溫州街線的旗標）→ %s（%s 第 %s 週，六）%s' % (d1['key'], d1['term'], d1['week'], '08:15 宿舍' if START == 'out' else '09:05 萬才館一樓'))
        f0 = await fl(pg); res['start'] = f0
        run.check('wzline_same：前置成立（今天值班、是社員、還沒算過、今天沒有溫州街線）', f0['duty'] and f0['member'] and f0['VIS'] == 0 and f0['N'] == 0 and not (f0.get('line') or {}).get('today'), J(slimfl(f0)))
        res['by_player'] = await arrive_wancai(pg, cdp, run, res, 'wzline_same', await P.snapshot(pg))
        b4, af, tapped = await one_shift(pg, cdp, run, res, 'wzs_shift', final='先走。')
        await check_plus1(run, 'wzline_same 坐圓桌', b4, af, tapped)
        shift_rows = res['wzs_shift_dialog']['rows']
        res['first_y2'] = {'flag': af.get('FIRST_Y2'), 'line_said': said(shift_rows, FIRST_Y2_LINE)}
        run.check('wzline_same：坐圓桌那一段演了「大二第一次值班」的前提畫面（story3d.js:757；FAFU_FIRST_SHIFT_Y2＝%s、旁白「%s…」%s）'
                  % (af.get('FIRST_Y2'), FIRST_Y2_LINE, '有' if res['first_y2']['line_said'] else '沒有'), af.get('FIRST_Y2') == af['day'] and res['first_y2']['line_said'], '')
        if af['h'] >= 12:
            run.check('wzline_same：坐圓桌以後還在 12:00 以前（lineAt 只在 9～12 點）', False, hm(af['h'])); return res
        wz = wz_flags(af['day'])
        if WZ_INJECT == 'live':
            await pg.evaluate("f=>Object.assign(GAME.G.flags,f)", wz)
            run.setup('wzline_same：【前置】不讀檔、直接把溫州街線的旗標寫進目前進度 %s（%s）' % (J(wz), hm(af['h'])))
        else:
            s = await P.snapshot(pg); s['flags'].update(wz); s.update(zone='wancai', pos=None); s.pop('_stuck', None); s.pop('_busy', None)
            await load(pg, cdp, s)
            run.setup('wzline_same：【前置】坐圓桌以後的同一份進度（GAME.snapshot()）寫進溫州街線的旗標 %s、讀檔回萬才館一樓出生點（%s）' % (J(wz), hm(s.get('hour'))))
        f1 = await fl(pg); res['after_inject'] = f1
        run.check('wzline_same：寫旗標以後計數沒變、今天有溫州街線（WZL.lineToday）', f1['VIS'] == af['VIS'] and f1['N'] == af['N'] and bool((f1.get('line') or {}).get('today')), J(slimfl(f1)))
        ok, f2 = await play_line(pg, cdp, run, res, 'wzline_same')
        res['tri'] = {'before_shift': tri(b4), 'after_shift': tri(af), 'after_line': tri(f2)}
        run.note('wzline_same 三個數值：%s' % J(res['tri']))
        run.check('wzline_same：同一個週六（圓桌＋溫州街線）LAWCLUB_SAT_VISITS 只 +1（%s → %s → %s）' % (b4['VIS'], af['VIS'], f2['VIS']), f2['VIS'] == b4['VIS'] + 1, '')
        run.check('wzline_same：同一個週六 FAFU_SHIFT_N 只 +1（%s → %s → %s；BUG-FAFU-DOUBLE：head d75871437 預期 FAIL＝+2）' % (b4['N'], af['N'], f2['N']), f2['N'] == b4['N'] + 1, '')
        run.check('wzline_same：同一個週六 careerLean A 只 +1（%s → %s → %s）' % (b4['A'], af['A'], f2['A']), (f2['A'] or 0) == (b4['A'] or 0) + 1, J({'after_shift': af['lean'], 'after_line': f2['lean']}))
        # 之後圓桌
        lab, near = await to_table(pg, cdp, run, 'wzline_same_table_after')
        res['shots']['table_after'] = await shoot_both(pg, run, 'wzline_same_table_after')
        f3 = await fl(pg); res['table_after'] = {'label': lab, 'near': near, 'fl': f3}
        run.check('wzline_same：溫州街線之後圓桌旁沒有「坐到圓桌」（互動鍵「%s」）' % lab, SHIFT_LABEL not in (lab or ''), J({'table': f3.get('table')}))
        res['rows'] = await rows(pg)
        run.check('wzline_same：STORY.fafuShift 只真的跑了一次', sum(1 for r in res['rows'] if r['k'] == 'shift' and r['n'] == 'start' and r['t'] == 'true') == 1, J([r for r in res['rows'] if r['k'] == 'shift']))
        run.check('wzline_same：沒有 JS 例外', not errs, J(errs[:3]))
    except Exception as e:
        run.check('wzline_same：跑完（沒有探針例外）', False, repr(e)[:500]); traceback.print_exc()
        try: await run.shot(pg, 'wzline_same_exception')
        except Exception: pass
    finally:
        with open(os.path.join(OUT, 'transcript_wzline_same.json'), 'w', encoding='utf-8') as f:
            json.dump(res, f, ensure_ascii=False, indent=1)
        if b:
            try: await asyncio.wait_for(b.close(), 30)
            except Exception: pass
    return res


async def check_first_y2(run, tag, af, dialog_rows):
    '''前提畫面（757）有沒有在這次坐圓桌演出：阿伯那一句在 one_shift 記的那一段、FAFU_FIRST_SHIFT_Y2＝今天'''
    ls = said(dialog_rows, FIRST_Y2_LINE)
    run.check('%s：坐圓桌那一段演了「大二第一次值班」的前提畫面——旁白「%s…」%s（story3d.js:757；BB 10:55 修法，head d75871437 預期 FAIL）'
              % (tag, FIRST_Y2_LINE, '有' if ls else '沒有'), ls, J([r.get('t') for r in dialog_rows if r.get('k') == 'say'][:40]))
    run.check('%s：FAFU_FIRST_SHIFT_Y2＝今天（%s，今天 %s）' % (tag, af.get('FIRST_Y2'), af['day']), af.get('FIRST_Y2') == af['day'], '')
    return {'flag': af.get('FIRST_Y2'), 'line_said': ls}


async def wzf_next_week(pg, cdp, run, res, shared, prev):
    '''wzline_first 隔週：同一份進度跳到下一個值班週六 → 第一次照玩家坐圓桌'''
    tag = 'wzline_first 隔週'
    d2 = (shared.get('days') or {}).get('d2')
    if not d2:
        run.check('%s：找得到下一個值班週六（DAY2）' % tag, False, J(shared.get('days'))); return
    if not str(d2.get('term') or '').startswith('Y2'):
        run.note('%s：DAY2 %s 不在大二（%s）——前提畫面本來就不該演' % (tag, d2['key'], d2.get('term')))
    h0 = 8.25 if START == 'out' else 9.08; z0 = 'dorm' if START == 'out' else 'wancai'
    s = await P.snapshot(pg); dx = await P.day_of(pg, d2['key'])
    s.update(day=dx['d'], weekday=dx['wd'], hour=h0, zone=z0, pos=None); s.pop('_stuck', None); s.pop('_busy', None)
    await load(pg, cdp, s)
    run.setup('%s：【前置】同一天跑完的進度（GAME.snapshot()）跳到 DAY2 %s（%s 第 %s 週，六）%s %s' % (tag, d2['key'], d2.get('term'), d2.get('week'), hm(h0), z0))
    g0 = await fl(pg); res['next_start'] = g0
    run.check('%s：前置成立（DAY2 值班、是社員、shiftable、還沒有 FAFU_FIRST_SHIFT_Y2、N 和同一天結束時一樣＝%s）' % (tag, prev['N']),
              g0['duty'] and g0['member'] and g0['shiftable'] and g0.get('FIRST_Y2') is None and g0['N'] == prev['N'], J(slimfl(g0)))
    if (g0.get('line') or {}).get('today'): run.note('%s：DAY2 也有溫州街線（%s）——可能先演、把圓桌擋掉' % (tag, J(g0['line']['today'])))
    n0 = await pl_len(pg)
    res['next_by_player'] = await arrive_wancai(pg, cdp, run, res, 'wzline_first_next', await P.snapshot(pg))
    b4, af, tapped = await one_shift(pg, cdp, run, res, 'wzf_next_shift', final='先走。')
    await check_plus1(run, tag, b4, af, tapped)
    lr = [r for r in await rows(pg, n0) if r['k'] in ('line', 'wzrun')]
    if lr: run.note('%s：DAY2 溫州街線也演了 %s' % (tag, J(lr)))
    res['next_first_y2'] = await check_first_y2(run, tag, af, (res.get('wzf_next_shift_dialog') or {}).get('rows') or [])
    res['shots']['next_after'] = await shoot_both(pg, run, 'wzf_next_after')
    res.setdefault('tri', {})['next_after_table'] = tri(af)


async def case_old_y2(p, run, shared):
    res = {'case': 'old_y2_noflag', 'shots': {}}; b = None
    try:
        b, pg, cdp, errs, d1 = await boot_case(p, run, res, 'old_y2_noflag', shared)
        last = d1['d'] - 14
        old = {'lawclub': True, 'FAFU_SHIFT_N': OLD_N, 'LAWCLUB_SAT_VISITS': OLD_VIS, 'LAWCLUB_SAT_LAST': last,
               'FAFU_ROT': {'open': OLD_N, 'cs': OLD_N, 'stay': 0, 'yt': 0, 'bh': 0, 'bk': 0, 'lg': 0}}
        st, d = await state_at(pg, d1['key'], 8.25 if START == 'out' else 9.08, 'dorm' if START == 'out' else 'wancai', old)
        st['flags'].pop('FAFU_FIRST_SHIFT_Y2', None)
        await load(pg, cdp, st)
        run.setup('old_y2_noflag：【前置】舊存檔（最小存檔＋lawclub＋大二已值班 %d 次、VISITS %d、LAST＝DAY1−14、FAFU_ROT open/cs %d、沒有 FAFU_FIRST_SHIFT_Y2）→ %s（%s 第 %s 週，六）%s'
                  % (OLD_N, OLD_VIS, OLD_N, d1['key'], d1['term'], d1['week'], '08:15 宿舍' if START == 'out' else '09:05 萬才館一樓'))
        f0 = await fl(pg); res['start'] = f0
        run.check('old_y2_noflag：前置成立（大二、值班、社員、shiftable、N＝%d、VISITS＝%d、LAST 是更早的日子、沒有 FAFU_FIRST_SHIFT_Y2）' % (OLD_N, OLD_VIS),
                  str(d1.get('term') or '').startswith('Y2') and f0['duty'] and f0['member'] and f0['shiftable'] and f0['N'] == OLD_N and f0['VIS'] == OLD_VIS
                  and f0['LAST'] == last and f0.get('FIRST_Y2') is None, J(slimfl(f0)))
        res['shots']['start'] = await shoot_both(pg, run, 'old_start')
        res['by_player'] = await arrive_wancai(pg, cdp, run, res, 'old_y2_noflag', await P.snapshot(pg))
        b4, af, tapped = await one_shift(pg, cdp, run, res, 'old_shift', final='先走。')
        await check_plus1(run, 'old_y2_noflag', b4, af, tapped)
        res['first_y2'] = await check_first_y2(run, 'old_y2_noflag', af, (res.get('old_shift_dialog') or {}).get('rows') or [])
        res['shots']['after'] = await shoot_both(pg, run, 'old_after')
        res['rows'] = await rows(pg)
        run.check('old_y2_noflag：STORY.fafuShift 只真的跑了一次', sum(1 for r in res['rows'] if r['k'] == 'shift' and r['n'] == 'start' and r['t'] == 'true') == 1,
                  J([r for r in res['rows'] if r['k'] == 'shift']))
        run.check('old_y2_noflag：沒有 JS 例外', not errs, J(errs[:3]))
    except Exception as e:
        run.check('old_y2_noflag：跑完（沒有探針例外）', False, repr(e)[:500]); traceback.print_exc()
        try: await run.shot(pg, 'old_y2_exception')
        except Exception: pass
    finally:
        with open(os.path.join(OUT, 'transcript_old_y2_noflag.json'), 'w', encoding='utf-8') as f:
            json.dump(res, f, ensure_ascii=False, indent=1)
        if b:
            try: await asyncio.wait_for(b.close(), 30)
            except Exception: pass
    return res


async def case_wz_first(p, run, shared):
    res = {'case': 'wzline_first', 'shots': {}, 'wz_k': WZ_K}; b = None
    try:
        b, pg, cdp, errs, d1 = await boot_case(p, run, res, 'wzline_first', shared)
        wz = wz_flags(d1['d'])
        st, d = await state_at(pg, d1['key'], 8.25 if START == 'out' else 9.08, 'dorm' if START == 'out' else 'wancai', dict({'lawclub': True}, **wz))
        await load(pg, cdp, st)
        run.setup('wzline_first：【前置】最小存檔（BASEF＋ROOM_Y2＋lawclub）＋溫州街線的旗標 %s → %s（%s 第 %s 週，六）%s' % (J(wz), d1['key'], d1['term'], d1['week'], '08:15 宿舍' if START == 'out' else '09:05 萬才館一樓'))
        f0 = await fl(pg); res['start'] = f0
        run.check('wzline_first：前置成立（今天值班、是社員、還沒算過、今天有溫州街線）', f0['duty'] and f0['member'] and f0['VIS'] == 0 and f0['N'] == 0 and bool((f0.get('line') or {}).get('today')), J(slimfl(f0)))
        res['shots']['start'] = await shoot_both(pg, run, 'wzf_start')
        res['by_player'] = await arrive_wancai(pg, cdp, run, res, 'wzline_first', await P.snapshot(pg))
        ok, f1 = await play_line(pg, cdp, run, res, 'wzline_first')
        run.check('wzline_first：溫州街線演完 LAWCLUB_SAT_VISITS +1（%s → %s）' % (f0['VIS'], f1['VIS']), f1['VIS'] == f0['VIS'] + 1, '')
        run.check('wzline_first：溫州街線演完 FAFU_SHIFT_N +1（社員，%s → %s）' % (f0['N'], f1['N']), f1['N'] == f0['N'] + 1, '')
        run.check('wzline_first：溫州街線演完 LAWCLUB_SAT_LAST＝今天（%s）' % f1['LAST'], f1['LAST'] == f1['day'], '')
        run.check('wzline_first：溫州街線演完 fafuShiftable＝false', not f1['shiftable'], J(slimfl(f1)))
        # 再去坐圓桌（應該被擋）
        c = await second_try(pg, cdp, run, res, 'wzline_first_table', f1)
        res['tri'] = {'start': tri(f0), 'after_line': tri(f1), 'after_table': tri(c)}
        run.note('wzline_first 三個數值：%s' % J(res['tri']))
        res['rows'] = await rows(pg)
        res['first_y2'] = {'flag': c.get('FIRST_Y2'), 'line_said': said(res['rows'], FIRST_Y2_LINE),
                           'shift_ran': sum(1 for r in res['rows'] if r['k'] == 'shift' and r['n'] == 'start' and r['t'] == 'true')}
        run.note('wzline_first：「大二第一次值班」的前提畫面（story3d.js:757）FAFU_FIRST_SHIFT_Y2＝%s、旁白「%s…」%s、fafuShift 真的跑了 %d 次'
                 '（只記錄：這個順序 FAFU_SHIFT_N 被溫州街線算成 1，之後 fafuShift 再跑 N 也不會是 1）' % (res['first_y2']['flag'], FIRST_Y2_LINE,
                 '有出現' if res['first_y2']['line_said'] else '沒有出現', res['first_y2']['shift_ran']))
        if WZF_NEXT:
            await wzf_next_week(pg, cdp, run, res, shared, c)
        run.check('wzline_first：沒有 JS 例外', not errs, J(errs[:3]))
    except Exception as e:
        run.check('wzline_first：跑完（沒有探針例外）', False, repr(e)[:500]); traceback.print_exc()
        try: await run.shot(pg, 'wzline_first_exception')
        except Exception: pass
    finally:
        with open(os.path.join(OUT, 'transcript_wzline_first.json'), 'w', encoding='utf-8') as f:
            json.dump(res, f, ensure_ascii=False, indent=1)
        if b:
            try: await asyncio.wait_for(b.close(), 30)
            except Exception: pass
    return res


async def main():
    run = L.Run('fasat_' + '+'.join(CASES), OUT); os.makedirs(OUT, exist_ok=True)
    print('==== 法服週六值班（SHA %s）URL %s START %s ====' % (os.environ.get('SHA', '?'), URL, START), flush=True)
    if 'turbo' in URL: run.note('注意：URL 有 turbo（這一項要實玩、不用 turbo）')
    shared = {}
    async with async_playwright() as p:
        for c in CASES:
            print('---- %s ----' % c, flush=True)
            if c == 'same_sat': await case_same(p, run, shared)
            elif c == 'next_sat': await case_next(p, run, shared)
            elif c == 'wzline_same': await case_wz_same(p, run, shared)
            elif c == 'wzline_first': await case_wz_first(p, run, shared)
            elif c == 'old_y2_noflag': await case_old_y2(p, run, shared)
            else: run.note('不認得的 case：%s' % c)
    print('SHA', os.environ.get('SHA', '?'), flush=True)
    sys.exit(run.finish())

if __name__ == '__main__':
    asyncio.run(main())
