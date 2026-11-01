"""BB-B 11-01：開發分支 fb0d24c98（LAWWW-B 11-01 合進來的那一批）——照玩家在畫面上看、按、截圖。一支用 MODE 分（逗號隔開可以一次跑好幾個，每個 MODE 開一個新的瀏覽器）。
  6c2d98041 BUG-04 學姊兩個臉（C24，使用者 10-15 第 25 項；story3d.js populateSchedule 的 standBusy／lingerSpot／clubSpot）
  c78848d47／220f617ba AA_187 以安、語彤交往中缺的五段（src/aa187_3d.js）
  8891f6f99 CG-20 斜對面的位子（r2y4b_events.js ev_bar_group_night）、成發芷若那句（events.js ev_ziqing_show）；cbd1de273 AA_13 G3 成發觀眾席、沒去隔天 12:30 阿凱
  bfafd1a62／d93aeee66／91a98556c 芯慈交往中尾聲兩句＋桌上的筆記、五個節日（fest3d.js、data/fest_events.js）；朋友的案子手機筆記 C2、C3（game3d.js noteHint、r3_3d.js、y2r2_3d.js）
  674ad7e5b／20a2c3f5b AA_258 ②③ 學姊交往中初一 09:00 私訊（sis_b10_3d.js S.cny1）、美國路線 11/08 沛珊、11/10 子晴（r2y4a3d.js）
不是 iPhone：Playwright 手機橫向模擬（SwiftShader，2～4 fps）。URL 用 '<URL>/index.html?turbo'（同 cbe0429_probe）。
存檔：「最小存檔」（GAME.defaults＋過了開場的旗標，同 cbe0429_probe 的 state_at；日子過了就補 ROOM_Y2／Y3／Y4；去過的地方 visited 補齊，手機「地點」才按得到）；
  給第三個參數（或環境變數 SAVE＝使用者存檔.json）＝改用使用者存檔改日期。
每一個讀檔、同一份進度跳日子都印 [前置]；讀檔後用遊戲 API 補的（關係、交往、記憶、群組）另外寫【捷徑】；頁面裡包一層函式（STORY.COMPANY 替身）也寫【捷徑】。
之後照玩家：點對話、選選項、按床「快轉」、手機「地點」「朋友」（直接過去、約）「訊息」、在對話裡點回覆鍵、「出發：」「直接過去：」、走到門口／集合點／座位按下去、走到人旁邊。
  手機自己打開（D103）而且沒有要點的選項＝按「收起來／跳過」（L.phone_away）。台詞全部用 GAME.say 的原文（HOOK 記 [名字, 句子, 日期, 時間]；旁白的名字＝''）；
  選單 GAME.choose；2D 背景 ADV.begin／ADV.setBg；CG ADV.cg；地點字幕、同行聊天 GAME.caption；日期卡 GAME.titleCard；提示 GAME.toast＋#toast。

MODE：
  sisface   BUG-04 學姊兩個臉（C24）。SF_DATES＝週三的日子（預設 2025-10-08，大一上第 6 週＝LAWWW2 v9.7 重現、npc_overlap_unit ① 用的那一天）；SF_ZONES＝lawlib,wancai。
            每一區：[前置] 最小存檔那天 18:50 宿舍（【捷徑】學姊有點熟）→ 手機「地點」→ 法律學院圖書館（lawlib）／法律系館B（大廳）（wancai）→ 站著等到 19:05、19:40、20:30
              （等不到就照同一份進度跳過去，[前置] 照記：會重生人物）→ 每個時間走到她旁邊（萬才館：走到 CLUB_SPOTS[0] (−3,3.6) 前面）、手指滑鏡頭轉向她、截圖（跟隨鏡頭），讀 E.npcs。
            PASS 法圖：學姊（charId heroine_05／legacy id sis）的 NPC＝剛好一個、看得見、底下的人物模型一個（有 SkinnedMesh 的子節點＝1）；0.4 m 內沒有別的人（站著、坐著都算）；
                       整區站著、看得見的兩個人距離 < 0.4 m 的＝0 組。
                 萬才館：學姊不是兩個（≤1、有的話沒有人疊在她身上）、整區站著的兩個人 < 0.4 m＝0 組；照作息週三晚上她在法圖＝萬才館 0 個（另一項）。
  anyt      AA_187 以安／語彤交往中（src/aa187_3d.js）。ANYT＝counted,walk,umb,umbneg,fd,fdmiss,seat（預設；fdepi 另外加：尾聲語彤前面那句旁白）
            counted 大三上 2027-10-21 起第一個公法讀書會週四（頁面裡讀 ACTIVITIES.on；那晚排了以安的裂縫談話就換下一個）：[前置] 19:40 宿舍、PUBLIC_LAW_GROUP、【捷徑】以安第 5 階（熟 45／信任 30／她的戀愛 35）
                    → 手機「地點」→ 法律系館B → 走上二樓到「研討室 A」門口按 →「參加：公法讀書會」→ 散會後「反駁的次數」。PASS：九句照稿照順序、記 AN_COUNTED；同一份進度下一個讀書會週四再去＝不再演（COUNTED_ONCE＝0 關掉）。
            walk    大三上 10/21 以前的讀書會週四（9 月兩個＝d1、d2，10 月一個＝d3；10/07 有 ev_y3_plg_topic 跳過）：[前置] d1 19:40、PUBLIC_LAW_GROUP、【捷徑】和以安交往中（第 6 階）
                    → 讀書會 → 散會後選項「（送她回去）」「（各自回去）」→ 點「（送她回去）」。PASS：那一組照 AA187.WALK 的順序（晴天＝第一組；下雨的晚上先用雨那一組）、
                      AA187.WALK_BG 有圖＝換那張（大一女舍門口 girls_dorm_gate）、記 AN_WALK_M＝那個月；d2（同一個月）＝沒有那個選項（每個月最多一次）；
                      d3（下個月）＋【捷徑】STORY.COMPANY 放一個替身（她旁邊有朋友；PRIVTALK.crowd＝true，玩家碰得到但要她的圈子剛好在旁邊、這裡不好排）＝沒有那個選項；拿掉替身以後 AA187.walkOk＝true（對照）。
            umb     大三上第一個麵店有開的週二（頁面裡讀 AA187.ndlOpen）：[前置] 17:50 宿舍、下雨（weather rain）、【捷徑】語彤朋友＋記憶 HELPED（大一把傘給她）→ 手機「地點」→ 阿鳳麵店。
                    PASS：旁白「（那把傘，掛在只有她拿得到的地方。）」一次、ev_yt_umbrella_hook done。umbneg：同一天沒有 HELPED＝待 90 秒都沒有。
            fd      [前置] 2029-04-26（四）16:50 宿舍、【捷徑】和語彤交往中 → 17:00 語彤私訊「今天打烊後留下來」「阿姨說的 不是我說的」→ [前置] 同一份進度跳到 20:15 宿舍 → 手機「地點」→ 阿鳳麵店
                    → 20:30 以後「打烊後的那一桌」九句照稿、記 YT_FAMILY_DINNER；21:05 沒有「阿姨說下次」。fdmiss：[前置] 20:50 宿舍不去＝21:00「阿姨說下次」「她多煮了一碗 我吃掉了」（17:00 那兩則先補進來）。
            seat    大三上 12/16 以後的週四（12/23＝d1、12/30＝d2，同一個月）：[前置] d1 17:30 宿舍、【捷徑】和語彤交往中 → 手機「朋友」→ 語彤「直接過去」（總圖三樓）→ 走到她 2.4 m 內的空位「坐下讀書」按
                    → 坐下就演「週四的斜對面」那一組（照 AA187.SEAT 順序，晴天第一組）→ 座位選單「起身」。PASS：那一組照稿、記 YT_SEAT4_M；d2 同一個月再坐她旁邊＝不演。
  cg20      CG-20 斜對面的位子：律師讀書小組只有語彤、第一次在總圖（週六）。CG20＝dating,st5,st4（預設）。
            [前置] 2029-02-23（五）20:50 宿舍、Y4_PATH bar（考律師）、【捷徑】語彤 dating＝交往中／st5＝第 5 階朋友／st4＝第 4 階朋友 → 21:30「出發：律師讀書小組（阿鳳麵店）」→ 成立那一晚（ev_bar_group_start）
            → st5：[前置] 跳到 3/2（五）20:40 宿舍 → 麵店那一晚（第一次＝yt_first，在麵店：沒有 CG）→ 都：[前置] 跳到 3/3（六）09:55 宿舍 → 手機「地點」→ 總圖書館（大廳）→ 讀書小組那一場。
            PASS（dating、st5）：旁白「（從下午讀到天黑。你去買晚餐回來，她已經把斜對面的位子占好，放了一杯熱茶。）」→ ADV.cg('cg_saved_seat_heroine03')、畫面真的換成那張 CG（截圖）、記 YT_CG20、圖鑑解鎖；
                  dating 再跳到 3/10（六）＝不再放（只一次）。st4：沒有那句、沒有 CG。
  y1show    大一下第 14 週週三吉他社成發（activities.js guitar_show_y1s2，萬才館大廳 19:00–21:00）。Y1SHOW＝all,nozr,absent（預設）。
            all／nozr：[前置] 那天 18:45 宿舍、【捷徑】子晴、阿凱、Alison 有點熟；芷若有點熟（all）／只是認識（nozr）→ 手機「地點」→ 法律系館B → 走到「吉他社成發」按 →「去看：吉他社成發」。
                    PASS：開頭阿凱旁白＋「我是來錄證據的。她說彈錯要請宵夜。」、Alison「我等一下第三首。我好緊張，我要吐了。」、（all）「（芷若坐在後排。）」芷若「我是被她押來的。」、接著「（後台。）」；nozr 沒有芷若那兩句。
            absent：[前置] 那天 20:50 宿舍、【捷徑】在吉他社群組（JOIN guitar）、子晴、阿凱有點熟 → 不去、站著等到 21:20（ZQ_SHOW absent）→ [前置] 同一份進度跳到隔天 12:20 → 12:30 阿凱「你沒來。她彈錯了，然後大笑。你錯過了。」（子晴 10:00「你沒來」）。
  xclove    芯慈交往中（XCROM.ON：2026-10-31 起程式裡就是 true，沒有網址參數；這裡讀出來照記）。XC＝epi,bday,xmas,vday,nye（預設）。
            epi   [前置] 畢業以後的最小存檔 2030-12-20 12:00 校園（同 aa382_probe：GRADUATED、PG done grad/first、FIRST_DAY_SEEN；不考律師）、【捷徑】和芯慈交往中 → 站著（畢業後篇站 2 秒＝跳到下一件事）→ 2034-06-03 尾聲。
                  PASS：芯慈「我們每週三還是去巷口家常菜。」「我又點回番茄炒蛋了。……今天想吃的就是它。」、桌上的東西多「（一本她的筆記，最後一頁空白，上面貼著一張便利貼：「這一頁你寫。」）」（截圖）。
            bday  [前置] 2029-03-27 10:00 宿舍 → 手機「朋友」→ 芯慈「約」→「這個時候才有」→「約她過節：生日」→「中午場」→ 第一個地點 → 3/28 床快轉、「直接過去：」→ 見面：旁白「（她收到禮物……）」＋「我會留著。包裝紙也是。」、沒有禮物選單。
            xmas  [前置] 2028-12-23 10:00 → 同上「約她過節：聖誕節」→「晚上場」→ 12/24 見面「今年是十三部。最後一部，我想跟你一起看。」
            vday  [前置] XC_VDAY_YEAR（預設 2028）-02-13 20:50 → 21:00 她私訊「我不太會過這種節。……可是我提前一天約你了。」＋回覆「好。」「那天不行。」→ 點「好。」→ 2/14 18:00「出發：…巷口家常菜」→ 只有地點字幕、記 HOL_VDAY_<年>。
            nye   [前置] 2028-12-31 23:50 宿舍（選單選「再撐一下／先不睡」）→ 23:58「我在家。我媽在看晚會。」、00:01「新年快樂。這是今年第一則。」（第二則在 1/1）。
  sisnewyear 學姊交往中初一 09:00 私訊。SNY＝2027,2028,2029（初一從遊戲的 CALENDAR.holiday 找：除夕的隔天「春節」；和 SISB10.CNY1 的日子對）。
            [前置] 初一 08:50 宿舍、met_sis、【捷徑】和學姊交往中 → 09:00 私訊照稿（2027 三則、2028 三則、2029 兩則）＋兩個回覆 → 點第一個 → 她回的那一句。SNY_NEG＝1（預設）：2027 只是朋友＝09:20 還沒有。
  usmsg     美國路線（玩家手機上的時間＝當地時間：STORY.tzOffset，2028-11-05 以後 −13）。USM＝pos,neg（預設）。
            pos [前置] 2028-11-08 09:55（當地）us_apartment、美國路線旗標（同 us_life_probe）、PS_RECONNECT、【捷徑】沛珊、子晴朋友＋聯絡方式 → 站著等 → 當地 10:10（臺灣 23:10）沛珊三則＋回覆「恭喜！」「他問了什麼？」
                → [前置] 同一份進度跳到 11/10 10:30 → 當地 10:40（臺灣 23:40）子晴四則＋回覆。截圖手機對話（訊息旁邊的時間字）＋HUD 時鐘。
            neg 沒有 PS_RECONNECT（沒有重新聯絡上沛珊）＝11/08 當地 10:30 還沒有沛珊那則。
  casenotes 朋友的案子手機筆記。CN＝c2,c3（預設）。
            c2  [前置] 2026-11-11 21:55 宿舍、【捷徑】芷若有點熟＋聯絡方式 → 芷若（R3.zrHour，沒交往＝22:07）兩則＋回覆 → 手機打開那個對話（截圖）：回覆鍵上面「手機筆記」四格
                「誰：芷若」「向誰：出版社」「依據什麼：」「請求什麼：照用的部分付稿費，或不要用」（讀 DOM，筆記在回覆鍵上面）→ 點「妳先把你們的對話拍給我看。」→ 她回的幾則。
            c3  [前置] 2027-03-23（二）17:35 宿舍、【捷徑】阿哲朋友 → 手機「地點」→ 阿鳳麵店 → 學長的押金：「手機筆記」說「誰：阿哲的學長」「向誰：房東」「依據什麼：」→ 依據的選項（截圖）→「請求什麼：」→ 請求的選項（截圖）。
（3/12 家族聚餐、大二下最後一頓在 cbe0429_probe y2end，這裡不跑。）
用法：LW_TESTS=<工作樹>/tests SHA=<sha> MODE=<mode>[,<mode>...] python3 fb1101_probe.py '<URL>/index.html?turbo' <輸出資料夾> [使用者存檔.json]
等待上限（秒）都可以用環境變數改：SF_WAIT、PLG_MAX、UMB_MAX、FD_MAX、SEAT_MAX、CG_MAX、SHOW_MAX、XC_MAX、EPI_MAX、VF_WAIT（等一則訊息）、US_WAIT、CN_MAX、WALK_MAX（走路）。"""
import os, sys, json, asyncio, re, math, time, copy, traceback
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__))); import bbplay as P
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
SAVEF = sys.argv[3] if len(sys.argv) > 3 else os.environ.get('SAVE')
SAVE = None
if SAVEF:
    SAVE = json.load(open(SAVEF, encoding='utf-8')); SAVE = SAVE.get('G', SAVE)
MODES = [m.strip() for m in os.environ.get('MODE', 'sisface').split(',') if m.strip()]
J = lambda o: json.dumps(o, ensure_ascii=False)
ENV = lambda k, d: [x.strip() for x in os.environ.get(k, d).split(',') if x.strip()]
ENVI = lambda k, d: int(os.environ.get(k, str(d)))
AN, ZR, YT, ZQ, SIS, XC, PS = 'heroine_01', 'heroine_02', 'heroine_03', 'heroine_04', 'heroine_05', 'classmate_xinci', 'classmate_peishan'

# ---------------------------------------------------------------- 存檔（cbe0429_probe.py 的做法）
BASEF = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True, 'metAn': True, 'met_an': True, 'MET_ZHE': True,
         'zheNoodleDone': True, 'KX_FIRST_MSG': True, 'KX_EVE_MSG': True, 'FAM_GROUP_SENT': True, 'CEREMONY_Y1': True, 'KAI_MOVEIN': True, 'LAW_RECAP_SEEN': True,
         'fundsV2': 1, 'KX_DEC3_MIGRATED': True, 'dating_kexin': False}   # 法律系、過了開場；GAME.defaults 的 dating_kexin:true 拿掉
ROOMS = (('ROOM_Y2', '2026-09-06'), ('ROOM_Y3', '2027-09-05'), ('ROOM_Y4', '2028-09-03'))
VISITED = ('noodle', 'cafe', 'library_hall', 'library', 'lawlib', 'wancai', 'linze', 'gongguan', 'wenzhou', 'soclib', 'cvs', 'bookstore')

JSENV = """(()=>{ const G=GAME.G, F=G.flags, D=k=>STORY.dayOfKey(k);
  const STG=id=>(typeof DATE!=='undefined'&&DATE.stageNum)?DATE.stageNum(id):null;
  const LV=(id,f,t,c,o)=>{ const r=SOCIAL.rel(id); r.fam=f; r.trust=t||0; r.comf=c||0; if(o) Object.assign(r,o); SOCIAL.remember(id,'FIRST_MET',''); G.contacts=G.contacts||{}; if(G.contacts[id]==null) G.contacts[id]=G.day-30;
    return {id,fam:r.fam,trust:r.trust,comf:r.comf,npcRom:r.npcRom|0,rom:r.rom|0,stage:SOCIAL.stage(id),level:SOCIAL.friendLevel?SOCIAL.friendLevel(id):null,stg:STG(id)}; };
  const HI=id=>LV(id,65,50,45,{npcRom:60,rom:40});
  const NOKX=()=>{ F.dating_kexin=false; if(F.romance) delete F.romance.kexin; F.ROMANCE_HISTORY=(F.ROMANCE_HISTORY||[]).filter(r=>r&&r.id!=='kexin'); delete F.DATED_1_kexin; delete F.KX_TOUR_YES; };
  const JOIN=(g,n)=>{ PHONE.join(G,g,n); return PHONE.inGroup(G,g); };
  const DT=id=>{ F['dating_'+id]=true; try{ if(typeof ROM!=='undefined'&&ROM.get){ const r=ROM.get(G,id); if(r&&typeof r==='object') r.status='dating'; } }catch(e){} return !!F['dating_'+id]; };
  const REM=(id,tag,note)=>{ SOCIAL.remember(id,tag,note||''); return !!SOCIAL.has(id,tag); };
  __BODY__ })()"""


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


async def load(pg, cdp, run, st, label, js=None, quiet=False):
    """[前置] 讀檔（遊戲自己的 GAME.applySave）；js＝讀檔後用遊戲 API 補的【捷徑】，補完 GAME.snapshot() 再讀一次（區域照新狀態重建）。手機自己打開（D103）照玩家收起來"""
    await L.load_state(pg, st, quiet_events=quiet, quiet_phone=False)
    await pg.wait_for_timeout(3500); r = None
    if js:
        r = await pg.evaluate(JSENV.replace('__BODY__', js))
        s2 = await pg.evaluate("()=>GAME.snapshot()")
        await L.load_state(pg, s2, quiet_events=quiet, quiet_phone=False); await pg.wait_for_timeout(3500)
    await L.phone_away(pg, cdp, tries=2)
    run.setup('[前置] %s%s%s' % (label, '（quiet_events）' if quiet else '', ('；【捷徑】讀檔後用遊戲 API 補：%s → %s' % (js.strip()[:300], J(r)[:400])) if js else ''))
    return r


async def pre_load(pg, cdp, run, key, tag):
    """[前置] 先讀一份最小存檔，只為了在頁面裡讀日子（行事曆、活動、作息）"""
    st, d = await state_at(pg, key, 10.0, 'dorm')
    await load(pg, cdp, run, st, '%s：先讀一份最小存檔 %s 10:00 宿舍（只為了在頁面裡挑日子，只讀）' % (tag, key))
    return d


async def snap(pg):
    return await pg.evaluate("()=>GAME.snapshot()")


async def jump(pg, cdp, run, s0, key, h, zone=None, pos='keep', quiet=False, note=''):
    """[前置] 同一份進度（s0＝GAME.snapshot()）跳到另一天、另一個時間再讀"""
    s = copy.deepcopy(s0); d = await P.day_of(pg, key)
    s.update(day=d['d'], weekday=d['wd'], hour=h)
    if zone: s['zone'] = zone
    if pos != 'keep': s['pos'] = pos
    await L.load_state(pg, s, quiet_events=quiet, quiet_phone=False); await pg.wait_for_timeout(3500); await L.phone_away(pg, cdp, tries=2)
    run.setup('[前置] 同一份進度跳到 %s %.2f %s%s' % (d['key'], h, s['zone'], ('；' + note) if note else ''))
    return d


# ---------------------------------------------------------------- 記錄（GAME.say、選項、ADV 背景、CG、字幕、日期卡、提示）
HOOK = r"""(()=>{ if(window.__PLH) return 'again'; window.__PLH=1; window.__PL=[];
  const at=()=>{ try{ return {d:CALENDAR.dateOf(GAME.G.day).key, h:+(+GAME.G.hour).toFixed(3), z:GAME.G.zone}; }catch(e){ return {}; } };
  const push=o=>{ try{ Object.assign(o,at()); window.__PL.push(o); if(window.__PL.length>8000) window.__PL.splice(0,2000); }catch(e){} return o; };
  const bgs=b=>typeof b==='string'?b:JSON.stringify(b||null);
  const s0=GAME.say; GAME.say=function(w,t){ push({k:'say',n:(w&&w.name)||(typeof w==='string'?w:''),c:(w&&w.charId)||null,t:String(t==null?'':t)}); return s0.apply(this,arguments); };
  const c0=GAME.choose; GAME.choose=function(o){ push({k:'choose',n:'',t:(o||[]).map(x=>x&&(x.t||x.text)||'').join('｜')}); return c0.apply(this,arguments); };
  if(typeof ADV!=='undefined'&&ADV.begin){ const b0=ADV.begin; ADV.begin=function(o){ push({k:'bg',n:'begin',t:bgs(o&&o.background)}); return b0.apply(this,arguments); }; }
  if(typeof ADV!=='undefined'&&ADV.setBg){ const g0=ADV.setBg; ADV.setBg=function(b){ push({k:'bg',n:'setBg',t:bgs(b)}); return g0.apply(this,arguments); }; }
  if(typeof ADV!=='undefined'&&ADV.cg){ const q0=ADV.cg; ADV.cg=function(id){ push({k:'cg',n:'',t:String(id||'')}); return q0.apply(this,arguments); }; }
  if(GAME.caption){ const p0=GAME.caption; GAME.caption=function(n,t){ push({k:'cap',n:String(n||''),t:String(t==null?'':t)}); return p0.apply(this,arguments); }; }
  if(GAME.titleCard){ const t0=GAME.titleCard; GAME.titleCard=function(a,b){ push({k:'card',n:String(a||''),t:String(b||'')}); return t0.apply(this,arguments); }; }
  if(GAME.toast){ const o0=GAME.toast; GAME.toast=function(t){ push({k:'toast',n:'',t:String(t||'')}); return o0.apply(this,arguments); }; }
  const te=document.getElementById('toast'); if(te){ let lt=''; new MutationObserver(()=>{ const h=(te.textContent||'').trim(); if(h&&h!==lt){ lt=h; push({k:'toast',n:'dom',t:h}); } }).observe(te,{childList:true,subtree:true,characterData:true}); }
  return 'ok'; })()"""
NAMES = """(id=>{ const s=new Set(); try{ s.add(SOCIAL.displayName(id)); }catch(e){} try{ s.add(SOCIAL.npcName(id)); }catch(e){} const c=(typeof CHARACTERS!=='undefined'&&CHARACTERS[id])||{}; if(c.name) s.add(c.name); if(c.nickname) s.add(c.nickname); return [...s].filter(Boolean); })"""


async def pl_len(pg):
    return await pg.evaluate("(window.__PL||[]).length")


async def rows(pg, n0=0, k=None):
    R = (await pg.evaluate("n=>(window.__PL||[]).slice(n)", n0))
    return [r for r in R if k is None or r['k'] == k]


def said(R):
    return [[r['n'], r['t']] for r in R if r['k'] == 'say']


async def names_of(pg, cid, extra=()):
    return set(await pg.evaluate(NAMES, cid)) | set(extra)


def name_ok(want, n):
    if want is None: return True
    if isinstance(want, (set, frozenset, list, tuple)): return n in want
    return n == want


def after(lines, first, nxt):
    """lines 裡第一個 first（(名字, 句子)）後面「緊接著」是不是 nxt 那幾句；回傳 (ok, 實際那幾句, first 在第幾句)"""
    for i, (n, t) in enumerate(lines):
        if t == first[1] and name_ok(first[0], n):
            got = lines[i + 1:i + 1 + len(nxt)]
            ok = len(got) == len(nxt) and all(g[1] == w[1] and name_ok(w[0], g[0]) for g, w in zip(got, nxt))
            return ok, got, i
    return False, None, None


def subm(want, M):
    """台詞表裡的 '@…' 換成那個人的名字集合（M＝{'@': 名字集合, '@me': 祐廷…}）"""
    return [(M.get(n, n) if isinstance(n, str) and n.startswith('@') else n, t) for n, t in want]


def wshow(want):
    return [['/'.join(sorted(n)) if isinstance(n, (set, frozenset)) else n, t] for n, t in want]


def row_of(R, text, k='say'):
    return next((r for r in R if r['k'] == k and r['t'] == text), None)


def bg_before(R, row):
    if not row: return None
    i = R.index(row); b = None
    for r in R[:i]:
        if r['k'] == 'bg': b = r['t']
    return b


def cap_near(R, row, span=6):
    if not row: return []
    i = R.index(row)
    return [r['t'] for r in R[max(0, i - span):i + 2] if r['k'] == 'cap' and not r['n']]


# ---------------------------------------------------------------- 照玩家操作（cbe0429_probe.py）
DECL = ('晚一點', '不去了', '自己走過去', '先不', '不用了', '算了', '就這樣', '先這樣', '沒事', '「我晚上要念書。」', '「那天我有事。」', '「我也要念書。」', '「我週六有事。」')
FF_OPTS = ('到下一個有事的日子', '到下一個有事的時候')
GO_PREFIX = ('出發：', '直接過去：', '接起來：', '上線：')


def pick_opt(ch, picks=(), ff=True):
    """選哪一個：picks（開頭符合、或包含；照順序）→ 快轉 → 床的選單（快轉，不快轉就睡）→ 起床選單「先起床」→ 婉拒那一類 → 第一個不是「出發：」那一類的"""
    T = [o['t'] for o in ch]; live = [i for i, o in enumerate(ch) if not o['dim']] or list(range(len(ch)))
    for p in picks or ():
        for i in live:
            if T[i].startswith(p) or (len(p) >= 4 and p in T[i]): return i, 'pick'
    if ff:
        for i in live:
            if T[i].startswith(FF_OPTS): return i, 'ff'
    if any(t.startswith(('再撐一下', '先不睡')) for t in T) or (any(t.startswith('睡覺') for t in T) and any(t.startswith('快轉') for t in T)):
        if ff:
            for i in live:
                if T[i].startswith('快轉'): return i, 'ff'
        for w in ('睡到明天', '睡覺', '睡一下', '睡到傍晚', '小睡 2 小時', '小睡'):
            for i in live:
                if T[i].startswith(w): return i, 'sleep'
    for i in live:
        if T[i].startswith('先起床'): return i, 'wake'
    for w in DECL:
        for i in live:
            if T[i].startswith(w): return i, 'decline'
    for i in live:
        if not T[i].startswith(GO_PREFIX) and '存檔' not in T[i]: return i, 'first'
    return live[0], 'first'


DUE_SOON = """(()=>{ const G=GAME.G, now=G.day*24+G.hour; let best=null; const c=(t,lab)=>{ if(best==null||t<best.t) best={t,lab}; };
  for(const iv of (G.invites||[])) if(iv.state==='accepted'&&now<iv.day*24+iv.h+0.6) c(iv.day*24+iv.h-0.5,'約：'+iv.who+' '+iv.h);
  try{ for(const q of OUT.rec(G)) if(q.state==='planned'&&now<q.day*24+q.h+0.75){ const tr=OUT.trip?OUT.trip(G,q,true):{}; c(q.day*24+q.h-((tr&&tr.travelH)||q.travelH||0)-0.25,'出遊：'+(q.title||q.id)); } }catch(e){}
  return best?{gap:+(best.t-now).toFixed(2),lab:best.lab}:null; })()"""
DLGFULL = "((GAME.D&&GAME.D.full)||(document.getElementById('dlgText')||{}).textContent||'')"
CARD_ON = "(s=>{ const e=document.getElementById('title3'); return !!e&&+getComputedStyle(e).opacity>0.5&&(e.innerHTML||'').indexOf(s)>=0; })"
CG_ON = "(f=>{ try{ const r=ADV.root, b=ADV.bg; return !!r&&(' '+(r.className||'')+' ').indexOf(' cg ')>=0&&String((b&&b.style.backgroundImage)||'').indexOf(f)>=0; }catch(e){ return false; } })"


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


async def go_place(pg, cdp, run, zone, max_s=120):
    """手機「地點」→ 那一區的「前往」（出生點）；途中的對話點過去、選單選「前往／直接」那一類。回傳 {ok, why}"""
    await P.phone_tab(pg, cdp, 'places')
    sel = '#phoneBody [data-place^="%s|"]' % zone
    if not await pg.evaluate("s=>!!document.querySelector(s)", sel):
        txt = await pg.evaluate("(document.getElementById('phoneBody')||{}).innerText||''")
        await L.phone_away(pg, cdp, tries=2); await L.close_panels(pg, cdp); return {'ok': False, 'why': txt[:300]}
    await L.tap(pg, cdp, sel); t0 = time.time()
    while time.time() - t0 < max_s:
        await pg.wait_for_timeout(1000); s = await P.ts(pg)
        if s['ch']:
            k, _ = pick_opt(s['ch'], ('前往', '直接'), False); await P.tap_choice(pg, cdp, k); continue
        if s['dlg']: await L.tap(pg, cdp, '#dlg'); continue
        if s['phone']: await L.phone_away(pg, cdp, tries=1); continue
        if s['zone'] == zone and not s['busy']: return {'ok': True, 'at': await P.clock(pg)}
    return {'ok': (await P.ts(pg))['zone'] == zone, 'why': 'timeout'}


async def to_dorm(pg, cdp, run):
    r = await go_place(pg, cdp, run, 'dorm', 90)
    return r['ok']


async def board(pg, cdp, run, tag):
    it = await L.find_it(pg, '登機')
    if not it: return None
    await L.go_to(pg, cdp, run, it['x'], it['z'], 1.1, it['label'], max_s=150, lv=it['lv'], stop=lambda s: s['interact'].startswith('登機'))
    await run.shot(pg, tag + '_airport')
    await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(2500)
    return it['label']


async def play(pg, cdp, run, until_js=None, max_s=1800, picks=(), tag='', ff=True, on_phone=None, shots_at=(), shots_first=0, card_watch=None, on_idle=None,
               watch=(), shot_choice=(), until_any=None):
    """照玩家過日子（cbe0429_probe 的 play）：對話點過去、選項照 pick_opt、手機自己打開就收起來（on_phone 先看要不要回）、出境大廳走到「登機」、空下來先問 on_idle、再去床「快轉」（ff）；
    約好的事、該出發的出遊 1.5 小時內就站著等。shots_at＝對話框出現這幾句（包含）就截圖；watch＝[(js, 截圖名)]：js 成立時截一次（CG）；shot_choice＝選單有包含這幾個字的選項就先截圖；
    until_any＝不管空不空下來都看（尾聲回標題畫面）。回傳 until_js／until_any 是否成立"""
    t0 = time.time(); idle = 0; last = None; same = 0; waited = None; pend = list(shots_at); nfirst = 0; card_done = False; air = 0
    wpend = list(watch); cpend = list(shot_choice)
    while time.time() - t0 < max_s:
        if card_watch and not card_done and await pg.evaluate(CARD_ON, card_watch[0]):
            await run.shot(pg, card_watch[1]); card_done = True
        for w in list(wpend):
            if await pg.evaluate(w[0]):
                await pg.wait_for_timeout(1200); await run.shot(pg, w[1]); wpend.remove(w)
        if until_any and await pg.evaluate(until_any): return True
        s = await P.ts(pg)
        free = not s['dlg'] and not s['ch'] and not s['busy'] and s['depth'] == 0
        if until_js and free and await pg.evaluate(until_js):
            await pg.wait_for_timeout(1500); s2 = await P.ts(pg)
            if not s2['dlg'] and not s2['ch'] and not s2['busy'] and await pg.evaluate(until_js): return True
            continue
        if s['phone'] and not s['ch'] and not s['dlg']:
            if on_phone and await on_phone(): idle = 0; continue
            await L.phone_away(pg, cdp, tries=1); await pg.wait_for_timeout(500); idle = 0; continue
        if s['ch']:
            sig = (s['day'], s['h'], tuple(o['t'] for o in s['ch'])); same = same + 1 if sig == last else 0; last = sig
            if same > 25:
                run.note('%s：同一個選單點了 25 次沒有反應：%s' % (tag, J(s['ch'])[:400])); await run.shot(pg, tag + '_stuck'); return False
            hitc = next((c for c in cpend if any(c in o['t'] for o in s['ch'])), None)
            if hitc:
                await pg.wait_for_timeout(800); await run.shot(pg, '%s_choice_%d' % (tag, len(shot_choice) - len(cpend) + 1)); cpend.remove(hitc)
            k, why = pick_opt(s['ch'], picks, ff)
            if why not in ('ff', 'sleep'): run.note('%s %s %.2f 選項 %s → %s' % (tag, (await P.clock(pg))['key'], s['h'], J([o['t'][:22] for o in s['ch']]), s['ch'][k]['t'][:30]))
            await P.tap_choice(pg, cdp, k); await pg.wait_for_timeout(1000); idle = 0; continue
        if s['dlg']:
            if pend or nfirst < shots_first:
                full = await pg.evaluate(DLGFULL)
                hit = next((x for x in pend if x and x in full), None)
                if hit or nfirst < shots_first:
                    await pg.wait_for_timeout(1000); nfirst += 1
                    await run.shot(pg, '%s_line%02d' % (tag, nfirst))
                    if hit: pend.remove(hit)
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(600); idle = 0; continue
        if s['busy'] or s['depth'] > 0: await pg.wait_for_timeout(700); continue
        if s['zone'] == 'airport_dep':
            if air < 3:
                air += 1; b = await board(pg, cdp, run, '%s_board%d' % (tag, air)); run.note('%s：出境大廳，走到「登機」按下去（第 %d 次）：%s' % (tag, air, b))
                await pg.wait_for_timeout(2500); idle = 0; continue
            await pg.wait_for_timeout(2000); continue
        idle += 1
        if on_idle and await on_idle(): idle = 0; continue
        if idle < 3 or not ff: await pg.wait_for_timeout(1500); continue
        if await pg.evaluate("!!(typeof HOME!=='undefined'&&HOME.at&&HOME.at(GAME.G))"): await pg.wait_for_timeout(1500); continue
        due = await pg.evaluate(DUE_SOON)
        if due and due['gap'] <= 1.5:
            if waited is None or waited[0] != due['lab']: waited = (due['lab'], time.time())
            if time.time() - waited[1] < 420: await pg.wait_for_timeout(2000); continue
            run.note('%s：等「%s」超過 7 分鐘沒有出發提示，照樣快轉' % (tag, due['lab']))
        if s['zone'] != 'dorm' and not await to_dorm(pg, cdp, run):
            run.note('%s：回不了宿舍（%s）' % (tag, s['zone'])); await pg.wait_for_timeout(3000); continue
        if not await press_bed(pg, cdp, run):
            run.note('%s：按不到床（%s）' % (tag, J(await P.clock(pg)))); await run.shot(pg, tag + '_nobed'); return False
        idle = 0
    return False


async def wait_h(pg, cdp, run, key, h, max_s, tag, picks=()):
    """站著等到那一天的 h 點（過了半夜 G.hour 會超過 24：h 可以寫 24.1）；途中的對話點過去、手機收起來。回傳是否等到"""
    d = (await P.day_of(pg, key))['d']
    js = "(GAME.G.day>%d)||(GAME.G.day===%d&&GAME.G.hour>=%.4f)" % (d, d, h)
    return await play(pg, cdp, run, js, max_s=max_s, ff=False, picks=picks, tag=tag)


async def wait_menu(pg, cdp, pred, max_s=90):
    t0 = time.time(); ch = None
    while time.time() - t0 < max_s:
        s = await P.ts(pg)
        if s['ch']:
            T = [o['t'] for o in s['ch']]
            if pred(T): return s['ch']
            if any(t.startswith(('先起床', '不用了', '晚一點', '算了')) for t in T):
                k, _ = pick_opt(s['ch'], (), False); await P.tap_choice(pg, cdp, k); await pg.wait_for_timeout(900); continue
            ch = s['ch']; await pg.wait_for_timeout(800)
            if time.time() - t0 > 20: return ch
            continue
        if s['phone'] and not s['dlg']: await L.phone_away(pg, cdp, tries=1); continue
        if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(600); continue
        await pg.wait_for_timeout(800)
    return ch


async def tap_prefix(pg, cdp, ch, prefix):
    k = next((i for i, o in enumerate(ch or []) if o['t'].startswith(prefix) and not o['dim']), None)
    if k is None: return False
    await P.tap_choice(pg, cdp, k); await pg.wait_for_timeout(1100); return True


FIND_ASK = """(([how,s])=>{ const m=(GAME.G.msgs||[]).slice().reverse().find(x=>x&&x.ask&&(how==='eq'?x.ask.id===s:(how==='suffix'?String(x.ask.id).endsWith(s):String(x.ask.id).startsWith(s))));
  return m?{id:m.ask.id, th:(PHONE.th?PHONE.th(m):m.th), opts:(m.ask.opts||[]).map(o=>o.t), ans:m.ans!=null?m.ans:null}:null; })"""
# 手機筆記（game3d.js noteHint）：回覆鍵上面那一塊「<b>手機筆記</b><br>誰：…<br>…」的每一行、在不在回覆鍵上面、那一則的回覆鍵
NOTE_JS = """(id=>{ const out=[]; for(const it of document.querySelectorAll('#phoneBody .item')){ const bs=[...it.querySelectorAll('[data-ask]')].filter(x=>!id||(x.dataset.ask||'').startsWith(id+'|')); if(id&&!bs.length) continue;
    const b=[...it.querySelectorAll('div.muted b')].find(x=>(x.textContent||'').trim()==='手機筆記'); if(!b) continue; const box=b.parentElement; box.scrollIntoView({block:'center'});
    const lines=(box.innerText||'').split('\\n').map(s=>s.trim()).filter(Boolean); const r=box.getBoundingClientRect(), q=bs[0]?bs[0].getBoundingClientRect():null;
    out.push({lines, above:!!q&&r.bottom<=q.top+1, btns:bs.map(x=>(x.textContent||'').trim()), box:[Math.round(r.top),Math.round(r.bottom)], btnTop:q?Math.round(q.top):null}); } return out; })"""


async def answer(pg, cdp, run, how, label, tag, note=False):
    """手機：那一則有選項的訊息（how＝('eq'|'suffix'|'prefix', 字)）→ 打開那個對話 → （note：先讀手機筆記那一塊、截圖）→ 點開頭是 label 的回覆鍵"""
    m = await pg.evaluate(FIND_ASK, list(how))
    if not m: return None
    t = await P.phone_thread(pg, cdp, m['th'], open_folds=False); nb = None
    if note:
        nb = await pg.evaluate(NOTE_JS, m['id']); await pg.wait_for_timeout(600)
    await run.shot(pg, tag + '_ask')
    opts = await pg.evaluate("id=>[...document.querySelectorAll('#phoneBody [data-ask]')].filter(x=>(x.dataset.ask||'').startsWith(id+'|')).map(x=>(x.textContent||'').trim())", m['id'])
    b = await pg.evaluate("([id,lab])=>{ const e=[...document.querySelectorAll('#phoneBody [data-ask]')].find(x=>(x.dataset.ask||'').startsWith(id+'|')&&(x.textContent||'').trim().startsWith(lab)); if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2,(e.textContent||'').trim()]; }", [m['id'], label])
    if b:
        await L.touch_tap(cdp, b[0], b[1]); await pg.wait_for_timeout(1800); await run.shot(pg, tag + '_answered')
    txt = await pg.evaluate("(document.getElementById('phoneBody')||{}).innerText||''")
    await L.close_panels(pg, cdp)
    return {'id': m['id'], 'th': m['th'], 'opts': opts, 'data_opts': m['opts'], 'tapped': b[2] if b else None, 'note': nb, 'text': txt[-600:]}


MSG_HAS = "(tag=>(GAME.G.msgs||[]).some(m=>m&&m.tag===tag))(%s)"
MSG_OF = """(tag=>(GAME.G.msgs||[]).filter(m=>m&&m.tag===tag).map(m=>({text:String(m.text||''),from:m.from||null,name:m.name||null,th:(PHONE.th?PHONE.th(m):m.th),
  day:CALENDAR.dateOf(m.day).key,h:m.h!=null?+(+m.h).toFixed(3):null,opts:m.ask?(m.ask.opts||[]).map(o=>o.t):null})))"""
THREAD = """(th=>(GAME.G.msgs||[]).filter(m=>m&&(PHONE.th?PHONE.th(m):m.th)===th).map(m=>[m.from||'',String(m.text||''),CALENDAR.dateOf(m.day).key,m.h!=null?+(+m.h).toFixed(2):null,m.tag||null]))"""
OUTQ = """(id=>{ const q=OUT.get(GAME.G,id); return q?{id:q.id,day:CALENDAR.dateOf(q.day).key,h:+(+q.h).toFixed(3),state:q.state,ev:q.ev||null,title:q.title||null,call:!!q.call,verb:q.verb||null,place:q.place||null,travelH:q.travelH||0}:null; })"""
EVDONE = "(id=>!!((GAME.G.events||{}).done||{})[id])(%s)"
FLAG = "(k=>{ const v=GAME.G.flags[k]; return v===undefined?null:v; })"
HUD = "(()=>({clock:(document.getElementById('clockT')||{}).textContent||'', date:(document.getElementById('dateT')||{}).textContent||''}))()"


async def wait_msg(pg, cdp, run, tag, max_s, label, picks=()):
    ok = await play(pg, cdp, run, MSG_HAS % J(tag), max_s=max_s, ff=False, tag=label, picks=picks)
    return ok, await pg.evaluate(MSG_OF, tag)


async def thread_shot(pg, cdp, run, th, tag):
    """手機「訊息」→ 那個對話（截圖）；回傳畫面上的字（訊息旁邊的時間照畫面記）"""
    t = await P.phone_thread(pg, cdp, th, open_folds=False); await pg.wait_for_timeout(600)
    await pg.evaluate("(()=>{ const b=document.getElementById('phoneBody'); if(b) b.scrollTop=b.scrollHeight; })()"); await pg.wait_for_timeout(500)
    await run.shot(pg, tag)
    txt = await pg.evaluate("(document.getElementById('phoneBody')||{}).innerText||''")
    await L.close_panels(pg, cdp)
    return {'ok': t['ok'], 'text': txt[-900:]}


# ---------------------------------------------------------------- 走到人旁邊、門口、集合點、座位（玩家操作）
WHERE = """(id=>{ try{ const w=STORY.whereIs(GAME,id); return w?{zone:w.zone||null,label:w.label||w.text||null,away:w.away||null,act:w.act||null}:null; }catch(e){ return {err:String(e.message)}; } })"""
SCHED_AT = """(([id,k,h])=>{ try{ const d=STORY.dayOfKey(k), c=CHARACTERS[id]; const g=Object.assign({},GAME.G,{day:d,hour:h,weekday:CALENDAR.dateOf(d).wd%7}); const e=STORY.schedEnt(c,g);
  return e?{zone:e.zone||null,act:e.act||null,label:e.label||null,room:e.room||null,at:e.at||null}:null; }catch(e){ return 'ERR '+e.message; } })"""


async def walk_near(pg, cdp, run, cid, tag, max_s=150):
    """走到他旁邊 1 m 站得住的地方（按鈕變成「和〈他〉說話」就停，不按）"""
    g = await pg.evaluate("id=>__BBF.target(id)", cid)
    if not g: return None
    if not g['ok']:
        await L.go_to(pg, cdp, run, g['tx'], g['tz'], 0.6, '%s：%s 旁邊' % (tag, cid), max_s=max_s, stop=lambda s, w=g['want']: s['interact'].startswith(w))
        await pg.wait_for_timeout(800)
        g = await pg.evaluate("id=>__BBF.target(id)", cid)
    if g: await L.turn_camera_to(pg, cdp, g['hx'], g['hz'])   # 手指在畫面空白處滑：鏡頭轉向她（鏡頭在玩家背後）
    await pg.wait_for_timeout(900)
    return g


async def room_door(pg, cdp, run, labels, pick, tag, max_s=220):
    """走到那一間的門口（labels 照順序找互動點）按下去 → 選單點開頭是 pick 的那一個"""
    it = None
    for lb in labels:
        it = await L.find_it(pg, lb)
        if it: break
    if not it:
        its = await pg.evaluate("(()=>(GAME.E.interactables||[]).filter(i=>!i.hidden).map(i=>[i.label,i.lv|0,+(+i.x).toFixed(1),+(+i.z).toFixed(1)]).slice(0,60))()")
        return {'ok': False, 'why': '找不到 %s' % J(labels), 'its': its}
    await L.go_to(pg, cdp, run, it['x'], it['z'], 1.0, it['label'], max_s=max_s, lv=it['lv'], stop=lambda s, lb=it['label']: s['interact'].startswith(lb))
    lab = (await P.ts(pg))['lab']
    await run.shot(pg, tag + '_door')
    await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1500)
    ch = await wait_menu(pg, cdp, lambda T: any(t.startswith(pick) for t in T), 30)
    T = [o['t'] for o in (ch or [])]
    if not ch or not await tap_prefix(pg, cdp, ch, pick): return {'ok': False, 'why': '沒有「%s」' % pick, 'menu': T, 'lab': lab, 'it': it, 'at': await P.clock(pg)}
    return {'ok': True, 'menu': T, 'lab': lab, 'it': it, 'at': await P.clock(pg)}


async def friend_go(pg, cdp, run, cid, tag, max_s=150):
    """手機「朋友」→ 他那一列「直接過去」→ 到他那一區（途中的選單選「前往／直接」那一類）"""
    w = await pg.evaluate(WHERE, cid)
    await P.phone_tab(pg, cdp, 'friends')
    if await pg.evaluate("!!document.querySelector('#phoneBody [data-personback]')"):
        await L.tap(pg, cdp, '#phoneBody [data-personback]'); await pg.wait_for_timeout(700)
    sel = '#phoneBody [data-fgo="%s"]' % cid
    if not await pg.evaluate("s=>!!document.querySelector(s)", sel):
        txt = await pg.evaluate("(document.getElementById('phoneBody')||{}).innerText||''")
        await L.close_panels(pg, cdp); return {'ok': False, 'why': '朋友那一列沒有「直接過去」', 'where': w, 'text': txt[:400]}
    await run.shot(pg, tag + '_friends')
    await L.tap(pg, cdp, sel); t0 = time.time()
    while time.time() - t0 < max_s:
        await pg.wait_for_timeout(1000); s = await P.ts(pg)
        if s['ch']: k, _ = pick_opt(s['ch'], ('前往', '直接'), False); await P.tap_choice(pg, cdp, k); continue
        if s['dlg']: await L.tap(pg, cdp, '#dlg'); continue
        if s['phone']: await L.phone_away(pg, cdp, tries=1); continue
        if isinstance(w, dict) and w.get('zone') and s['zone'] == w['zone'] and not s['busy']: return {'ok': True, 'where': w, 'at': await P.clock(pg)}
    s = await P.ts(pg)
    return {'ok': isinstance(w, dict) and s['zone'] == w.get('zone'), 'why': 'timeout', 'where': w, 'zone': s['zone']}


SEATS_NEAR = """(([id,R])=>{ const E=GAME.E, n=__BBF.npc(id); if(!n||!n.obj) return {err:'no npc'}; const h=n.obj.position, lv=n.lv|0;
  const occ=q=>E.npcs.some(m=>m.seat&&(m.seat.lv|0)===(q.lv|0)&&Math.hypot(m.seat.x-q.x,m.seat.z-q.z)<0.4)||E.npcs.some(m=>m.seatTarget&&Math.hypot(m.seatTarget.x-q.x,m.seatTarget.z-q.z)<0.4);
  const C=(E.interactables||[]).filter(it=>it.seat&&!it.hidden&&(it.lv==null||(it.lv|0)===lv)&&(it.seat.lv==null||(it.seat.lv|0)===lv)&&String(it.label||'').indexOf('坐')===0)
    .map(it=>({it,d:Math.hypot(it.seat.x-h.x,it.seat.z-h.z)})).filter(o=>o.d>0.3&&o.d<R&&!occ(o.it.seat)).sort((a,b)=>a.d-b.d);
  return {her:[+h.x.toFixed(2),+h.z.toFixed(2),lv,!!n.seat], cand:C.slice(0,6).map(o=>({x:+o.it.x.toFixed(2),z:+o.it.z.toFixed(2),lv:o.it.lv|0,label:o.it.label,sx:o.it.seat.x,sz:o.it.seat.z,d:+o.d.toFixed(2)}))}; })"""
PSEAT = "(()=>{ const P=GAME.E.player; return P.seat?{x:+P.seat.x.toFixed(2),z:+P.seat.z.toFixed(2)}:null; })()"


async def sit_and_rise(pg, cdp, run, tag, max_s=200):
    """按「坐下…」→ 坐下就演的事件點過去 → 座位選單選「起身」。回傳 {seated, menus, before_rise}"""
    await L.tap(pg, cdp, '#interact'); t0 = time.time(); menus = []; seated = None; started = False; idle = None; nd = 0
    while time.time() - t0 < max_s:
        if seated is None: seated = await pg.evaluate(PSEAT)
        s = await P.ts(pg)
        if s['ch']:
            T = [o['t'] for o in s['ch']]; menus.append(T); started = True; idle = None
            k = next((i for i, t in enumerate(T) if t.startswith('起身')), None)
            if k is not None:
                await run.shot(pg, tag + '_seatmenu'); await P.tap_choice(pg, cdp, k); await pg.wait_for_timeout(1200); break
            k, _ = pick_opt(s['ch'], (), False); await P.tap_choice(pg, cdp, k); await pg.wait_for_timeout(1000); continue
        if s['dlg']:
            started = True; idle = None; nd += 1
            if nd <= 2: await pg.wait_for_timeout(900); await run.shot(pg, '%s_dlg%d' % (tag, nd))
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(650); continue
        if s['phone']: await L.phone_away(pg, cdp, tries=1); continue
        if s['busy'] or s['depth'] > 0: started = True; idle = None; await pg.wait_for_timeout(600); continue
        if started:
            idle = idle or time.time()
            if time.time() - idle > 6: break
        elif time.time() - t0 > 15: break
        await pg.wait_for_timeout(500)
    return {'seated': seated, 'menus': menus}


async def sit_near(pg, cdp, run, cid, tag, R=2.4):
    """走到她 R m 內、沒有人坐的「坐下…」那一格，按下去"""
    sn = await pg.evaluate(SEATS_NEAR, [cid, R])
    run.note('%s：她旁邊的空位（只讀）：%s' % (tag, J(sn)))
    if not isinstance(sn, dict) or not sn.get('cand'): return {'ok': False, 'why': '她 %.1f m 內沒有空位' % R, 'sn': sn}
    for c in sn['cand'][:3]:
        await L.go_to(pg, cdp, run, c['x'], c['z'], 0.45, '%s：%s' % (tag, c['label']), max_s=ENVI('WALK_MAX', 150), lv=c['lv'], stop=lambda s: s['interact'].startswith('坐'))
        if not (await P.ts(pg))['lab'].startswith('坐'):
            await L.go_to(pg, cdp, run, c['x'], c['z'], 0.3, c['label'], max_s=40, lv=c['lv']); await pg.wait_for_timeout(800)
        if (await P.ts(pg))['lab'].startswith('坐'):
            await run.shot(pg, tag + '_before_sit')
            r = await sit_and_rise(pg, cdp, run, tag)
            r.update(ok=bool(r['seated']), seat=c, her=sn['her']); return r
    return {'ok': False, 'why': '走到了但按鈕不是「坐…」', 'sn': sn}


async def spot_join(pg, cdp, run, label, pick, tag, max_s=150):
    """走到集合點（互動點 label）按下去 → 選單點開頭是 pick 的那一個"""
    it = await L.find_it(pg, label)
    if not it: return {'ok': False, 'why': '這一區沒有「%s」' % label}
    await L.go_to(pg, cdp, run, it['x'], it['z'], 0.9, label, max_s=max_s, lv=it['lv'], stop=lambda s: s['interact'].startswith(label))
    await run.shot(pg, tag + '_spot')
    await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1500)
    ch = await wait_menu(pg, cdp, lambda T: any(t.startswith(pick) for t in T), 30)
    T = [o['t'] for o in (ch or [])]
    if not ch or not await tap_prefix(pg, cdp, ch, pick): return {'ok': False, 'why': '沒有「%s」' % pick, 'menu': T, 'at': await P.clock(pg)}
    return {'ok': True, 'menu': T, 'at': await P.clock(pg)}


AVOID = ('算了', '換一天', '先不要', '（離開）', '不用了', '其他日子…')


async def menu_drive(pg, cdp, run, prefs, tag, max_s=150):
    """約人的選單一路點下去：每一層照 prefs（開頭符合，照順序）選；都沒有就第一個沒變暗、不是「算了／換一天」那一類的。回傳每一層的選項、選了什麼"""
    t0 = time.time(); menus = []; picked = []; started = False; idle = None
    while time.time() - t0 < max_s and len(menus) < 14:
        s = await P.ts(pg)
        if s['ch']:
            started = True; idle = None; T = [o['t'] for o in s['ch']]; menus.append(T)
            live = [i for i, o in enumerate(s['ch']) if not o['dim']] or list(range(len(T)))
            k = None
            for p in prefs:
                k = next((i for i in live if T[i].startswith(p)), None)
                if k is not None: break
            if k is None: k = next((i for i in live if not T[i].startswith(AVOID)), live[0])
            picked.append(T[k]); await run.shot(pg, '%s_menu%d' % (tag, len(menus)))
            await P.tap_choice(pg, cdp, k); await pg.wait_for_timeout(1100); continue
        if s['dlg']: started = True; idle = None; await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(650); continue
        if s['phone']: await L.phone_away(pg, cdp, tries=1); continue
        if s['busy'] or s['depth'] > 0: started = True; idle = None; await pg.wait_for_timeout(600); continue
        if started:
            idle = idle or time.time()
            if time.time() - idle > 5: break
        elif time.time() - t0 > 12: break
        await pg.wait_for_timeout(500)
    return {'menus': menus, 'picked': picked}


async def phone_inv(pg, cdp, run, cid, tag):
    """手機「朋友」→ 他那一列「約」"""
    await P.phone_tab(pg, cdp, 'friends')
    if await pg.evaluate("!!document.querySelector('#phoneBody [data-personback]')"):
        await L.tap(pg, cdp, '#phoneBody [data-personback]'); await pg.wait_for_timeout(700)
    sel = '#phoneBody [data-inv="%s"]' % cid
    if not await pg.evaluate("s=>!!document.querySelector(s)", sel):
        txt = await pg.evaluate("(document.getElementById('phoneBody')||{}).innerText||''"); await L.close_panels(pg, cdp)
        return {'ok': False, 'why': '朋友那一列沒有「約」', 'text': txt[:400]}
    await run.shot(pg, tag + '_friends'); await L.tap(pg, cdp, sel); await pg.wait_for_timeout(1500)
    return {'ok': True}


# ================================================================ 1. sisface：學姊兩個臉（BUG-04）
CENSUS = r"""(()=>{ const E=GAME.E, IDS=['heroine_05','sis']; const isHer=n=>!!n&&(IDS.includes(n.charId)||IDS.includes(n.id));
  const vis=n=>!!n&&!!n.obj&&!n.hidden&&n.obj.visible!==false;
  const mdl=n=>{ let roots=0, sk=0, faces=0; for(const c of n.obj.children){ let s=false; c.traverse(o=>{ if(o.isSkinnedMesh) s=true; }); if(s) roots++; } n.obj.traverse(o=>{ if(o.isSkinnedMesh) sk++; if(o.isMesh&&/face/i.test(o.name||'')) faces++; }); return {roots,skinned:sk,faceMeshes:faces}; };
  const P=E.player.obj.position, pos=n=>n.obj.position;
  const her=E.npcs.filter(isHer).map(n=>Object.assign({id:n.id||null,charId:n.charId||null,name:n.name||null,x:+pos(n).x.toFixed(2),z:+pos(n).z.toFixed(2),lv:n.lv|0,hidden:!!n.hidden,visible:n.obj.visible!==false,
    seat:!!n.seat,pose:n.pose||null,beh:n.beh||null,label:n.talkLabel||null,dMe:+Math.hypot(pos(n).x-P.x,pos(n).z-P.z).toFixed(2)},mdl(n)));
  const vh=E.npcs.filter(n=>isHer(n)&&vis(n)), near=[];
  for(const h of vh) for(const m of E.npcs){ if(m===h||!vis(m)||(m.lv|0)!==(h.lv|0)) continue; const d=Math.hypot(pos(m).x-pos(h).x,pos(m).z-pos(h).z); if(d<0.4) near.push({id:m.id||null,charId:m.charId||null,name:m.name||null,d:+d.toFixed(3),seat:!!m.seat}); }
  const S=E.npcs.filter(n=>vis(n)&&!n.seat), pairs=[];
  for(let i=0;i<S.length;i++) for(let j=i+1;j<S.length;j++){ if((S[i].lv|0)!==(S[j].lv|0)) continue; const d=Math.hypot(pos(S[i]).x-pos(S[j]).x,pos(S[i]).z-pos(S[j]).z);
    if(d<0.4) pairs.push({a:S[i].charId||S[i].id||S[i].name||'路人',b:S[j].charId||S[j].id||S[j].name||'路人',d:+d.toFixed(3),at:[+pos(S[i]).x.toFixed(2),+pos(S[i]).z.toFixed(2)],lv:S[i].lv|0}); }
  const gm=Object.keys(GAME.npc||{}).filter(k=>IDS.includes(k)||((GAME.npc[k]||{}).charId&&IDS.includes(GAME.npc[k].charId)));
  const others=E.npcs.filter(n=>vis(n)&&!isHer(n)).map(n=>({id:n.charId||n.id||n.name||'路人',x:+pos(n).x.toFixed(1),z:+pos(n).z.toFixed(1),lv:n.lv|0,seat:!!n.seat})).slice(0,24);
  return {zone:GAME.G.zone,key:CALENDAR.dateOf(GAME.G.day).key,h:+(+GAME.G.hour).toFixed(3),her,visibleHer:vh.length,near,pairs,gmKeys:gm,nNpcs:E.npcs.length,others,me:[+P.x.toFixed(2),+P.z.toFixed(2),E.player.lv|0]}; })()"""
SF_TIMES = ((19 + 5 / 60, '1905'), (19 + 40 / 60, '1940'), (20.5, '2030'))


async def sf_zone(pg, cdp, run, key, zone):
    tag = 'sf_%s_%s' % (zone, key.replace('-', ''))
    st, d = await state_at(pg, key, 18.83, 'dorm', flags={'met_sis': True, 'SIS_W1': True})
    if d['wd'] != 3: run.check('%s：%s 是週三' % (tag, key), False, J(d)); return
    await load(pg, cdp, run, st, '%s：最小存檔 %s（三，%s 第 %s 週）18:50 宿舍；認識學姊（met_sis）' % (tag, key, d['term'], d['week']), js="NOKX(); return LV('heroine_05',25,10,5);")
    sch = await pg.evaluate(SCHED_AT, [SIS, key, 19.08])
    run.note('%s：學姊 %s 19:05 的作息（STORY.schedEnt，只讀）：%s' % (tag, key, J(sch)))
    gp = await go_place(pg, cdp, run, zone)
    run.check('%s：手機「地點」→ %s' % (tag, '法律學院圖書館' if zone == 'lawlib' else '法律系館B（大廳）'), gp['ok'], J(gp))
    if not gp['ok']: return
    for hh, lab in SF_TIMES:
        ok = await wait_h(pg, cdp, run, key, hh, ENVI('SF_WAIT', 480), '%s_wait%s' % (tag, lab))
        cur = await P.clock(pg)
        if not ok and cur['key'] == key and cur['h'] < hh:
            s1 = await snap(pg)
            await jump(pg, cdp, run, s1, key, hh, zone=zone, pos='keep', note='站著等 %d 秒沒有等到 %s（SwiftShader 太慢）：同一份進度跳過去——區域重建、人物重新生（和站著等不同，照記）' % (ENVI('SF_WAIT', 480), lab))
        c0 = await census(pg)
        if zone == 'lawlib':
            g = await walk_near(pg, cdp, run, SIS, '%s_%s' % (tag, lab)) if c0['visibleHer'] else None
        else:
            await L.go_to(pg, cdp, run, -3.0, 5.4, 0.9, '萬才館大廳 CLUB_SPOTS[0] (−3,3.6) 前面', max_s=ENVI('WALK_MAX', 150))
            await L.turn_camera_to(pg, cdp, -3.0, 3.6); g = None
        await pg.wait_for_timeout(1500)
        c = await census(pg); p = await run.shot(pg, '%s_%s' % (tag, lab))
        run.note('%s %s：E.npcs（她 %s；0.4 m 內 %s；站著疊在一起 %s；旁邊的人 %s；截圖 %s）' % (tag, c['h'], J(c['her']), J(c['near']), J(c['pairs']), J(c['others'])[:900], p))
        her1 = [x for x in c['her'] if x['visible'] and not x['hidden']]
        if zone == 'lawlib':
            run.check('%s %s %s：學姊剛好一個 NPC（E.npcs 裡她的 %d 筆、看得見 %d）、底下一個人物模型、0.4 m 內沒有別人、整區沒有站著疊在一起的兩個人' % (tag, key, lab, len(c['her']), c['visibleHer']),
                      len(c['her']) == 1 and c['visibleHer'] == 1 and her1[0]['roots'] == 1 and not c['near'] and not c['pairs'],
                      J({'her': c['her'], 'near': c['near'], 'pairs': c['pairs'], 'gm': c['gmKeys'], 'target': g}))
        else:
            run.check('%s %s %s：沒有「兩個臉」——學姊 ≤ 1 個、有的話 0.4 m 內沒有別人；大廳站著的兩個人 < 0.4 m＝0 組' % (tag, key, lab),
                      c['visibleHer'] <= 1 and not c['near'] and not c['pairs'] and all(x['roots'] <= 1 for x in her1), J({'her': c['her'], 'near': c['near'], 'pairs': c['pairs']}))
            run.check('%s %s %s：照作息（週三晚上法圖，AA_236 A8）萬才館沒有學姊' % (tag, key, lab), c['visibleHer'] == 0, J({'her': c['her'], 'sched': sch}))


async def census(pg):
    return await pg.evaluate(CENSUS)


async def m_sisface(pg, cdp, run):
    for key in ENV('SF_DATES', '2025-10-08'):
        for z in ENV('SF_ZONES', 'lawlib,wancai'):
            run.note('==== sisface：%s %s ====' % (key, z))
            try: await sf_zone(pg, cdp, run, key, z)
            except Exception as ex: run.check('sisface %s %s：跑完（沒有探針例外）' % (key, z), False, repr(ex)[:400]); traceback.print_exc()


# ================================================================ 2. anyt：AA_187 以安／語彤交往中
PLG_DAYS = """(([a,b,term])=>{ const PLG=ACTIVITIES.list.find(x=>x.id==='public_law_group'), out=[]; for(let d=STORY.dayOfKey(a); d<=STORY.dayOfKey(b); d++){ const c=CALENDAR.dateOf(d), t=CALENDAR.termOf(d);
    if(c.wd%7!==4||!t||(term&&t.id!==term)) continue; if(PLG&&!ACTIVITIES.on(PLG,d,GAME.G)) continue; out.push({d,key:c.key,week:t.week,m:c.key.slice(0,7)}); } return out; })"""
WD_DAYS = """(([a,b,term,wd])=>{ const out=[]; for(let d=STORY.dayOfKey(a); d<=STORY.dayOfKey(b)&&out.length<16; d++){ const c=CALENDAR.dateOf(d), t=CALENDAR.termOf(d); if(c.wd%7!==wd||!t||(term&&t.id!==term)) continue;
    let ndl=null; try{ ndl=(typeof AA187!=='undefined'&&AA187.ndlOpen)?AA187.ndlOpen(GAME.G,d):null; }catch(e){ ndl='ERR '+e.message; }
    out.push({d,key:c.key,week:t.week,m:c.key.slice(0,7),hol:!!(CALENDAR.holiday&&CALENDAR.holiday(d)),ty:!!(CALENDAR.typhoon&&CALENDAR.typhoon(d)),ndl}); } return out; })"""
COUNTED = [('', '（其他人都走了。她的手帳攤在桌上，你看到一頁寫著「反駁」兩個字，下面一排正字。）'), ('@me', '這是什麼？'), ('@', '（把手帳闔上）統計。'), ('@', '……讀書會上，有人反駁我的次數。'),
           ('@me', '幾次？'), ('@', '十七。'), ('@', '其他人加起來是三。'), ('', '（她把手帳收進包包。拉鍊拉到一半，停住。）'), ('@', '……樣本還不夠。')]
ROT_OF = """(([tbl,i])=>{ const T=(typeof AA187!=='undefined'&&AA187[tbl])||[], x=T[i]; return x?{rain:!!x.rain,lines:x.lines.map(l=>[l.speaker===null||l.speaker===undefined?'':l.speaker,l.text])}:null; })"""
STUB_ON = """(id=>{ if(!Array.isArray(STORY.COMPANY)) return 'no STORY.COMPANY'; if(window.__bbCrowd) return 'again'; const f=(G,who)=>who===id?['__bb_stub_friend']:[]; window.__bbCrowd=f; STORY.COMPANY.push(f);
  return {n:STORY.COMPANY.length, crowd:!!(STORY.crowdNow&&STORY.crowdNow(GAME.G,id,null,GAME)), privCrowd:!!(typeof PRIVTALK!=='undefined'&&PRIVTALK.crowd&&PRIVTALK.crowd(GAME.G,id,null,GAME))}; })"""
STUB_OFF = """(()=>{ const f=window.__bbCrowd; if(!f) return 'none'; const i=STORY.COMPANY.indexOf(f); if(i>=0) STORY.COMPANY.splice(i,1); delete window.__bbCrowd; return {n:STORY.COMPANY.length}; })()"""
UMB = '（那把傘，掛在只有她拿得到的地方。）'
FD = [('', '（鐵門拉下一半。桌上擺了三副碗筷。）'), ('阿姨', '坐。今天你不是客人。'), ('', '（語彤把自己那碗推過來一點，又推回去。）'), ('阿姨', '她以前不讓同學進廚房的。'),
      ('@', '……阿姨。'), ('阿姨', '日本的寺廟，我幫你們兩個都拜了。'), ('@', '（低頭吃麵）……我們沒有要你拜。'), ('阿姨', '我拜我的。'), ('', '（回去的路上，她說今天的麵比較鹹。你說沒有。她說有。）')]
FD_MSG = ['今天打烊後留下來', '阿姨說的 不是我說的']
FD_MISS = ['阿姨說下次', '她多煮了一碗 我吃掉了']
FD_EPI = '（語彤的手機桌布，是麵店那張照片：三個人，一張桌子。）'


def rot_want(rot, who, me):
    return [(who if s == YT or s == AN else (me if s == 'player' else ('' if s == '' else s)), t) for s, t in rot['lines']]


async def plg_night(pg, cdp, run, tag, picks=(), shots_at=()):
    """手機「地點」→ 法律系館B → 走上二樓到研討室 A 門口按 →「參加：公法讀書會」→ 散會、散會後那一段演完"""
    gp = await go_place(pg, cdp, run, 'wancai')
    if not gp['ok']: return {'ok': False, 'why': '到不了法律系館B', 'gp': gp}
    rd = await room_door(pg, cdp, run, ('進入 研討室 A', '研討室 A'), '參加：公法讀書會', tag)
    run.note('%s：研討室 A 門口：%s' % (tag, J(rd)[:600]))
    if not rd['ok']: return {'ok': False, 'rd': rd}
    until = "(()=>{ const G=GAME.G; return ACTIVITIES.attendedAny(G,'public_law_group',G.day)&&G.hour>=21.45; })()"
    ok = await play(pg, cdp, run, until, max_s=ENVI('PLG_MAX', 900), picks=picks, ff=False, tag=tag, shots_at=shots_at)
    return {'ok': ok, 'rd': rd}


async def any_counted(pg, cdp, run):
    await pre_load(pg, cdp, run, '2027-10-20', 'counted')
    days = await pg.evaluate(PLG_DAYS, ['2027-10-21', '2028-01-20', 'Y3S1'])
    run.note('counted：大三上 10/21 起的讀書會週四（ACTIVITIES.on，只讀）：%s' % J(days))
    if not days: run.check('counted：10/21 起有讀書會週四', False); return
    r = None; c = None
    for c in days[:3]:
        st, d = await state_at(pg, c['key'], 19.67, 'dorm', flags={'PUBLIC_LAW_GROUP': True})
        r = await load(pg, cdp, run, st, 'counted：最小存檔 %s（四，大三上第 %s 週）19:40 宿舍；加入公法讀書會（PUBLIC_LAW_GROUP）' % (c['key'], c['week']),
                       js="NOKX(); const r=LV('heroine_01',45,30,10,{npcRom:35}); return {r, talk:(typeof AA187!=='undefined'&&AA187.talkToday)?AA187.talkToday(G,'heroine_01'):null, here:STORY.present?STORY.present('heroine_01',G):null};")
        if r and r.get('talk'): run.note('counted：%s 排了以安的裂縫談話（AA187.talkToday）：那晚不演，換下一個週四' % c['key']); continue
        break
    run.check('counted：【捷徑】以安第 5 階（DATE.stageNum ≥ 5）、她在臺灣、那晚沒有裂縫談話', bool(r) and (r['r']['stg'] or 0) >= 5 and r.get('here') is not False and not r.get('talk'), J(r))
    an = await names_of(pg, AN); me = await pg.evaluate("GAME.G.name||'祐廷'")
    n0 = await pl_len(pg)
    res = await plg_night(pg, cdp, run, 'counted', shots_at=['反駁', '樣本還不夠'])
    R = await rows(pg, n0); Ls = said(R); want = subm(COUNTED, {'@': an, '@me': {me}})
    okq, got, i0 = after(Ls, want[0], want[1:])
    fl = await pg.evaluate(FLAG, 'AN_COUNTED'); dn = await pg.evaluate(EVDONE % J('ev_an_counted'))
    run.note('counted：讀書會那一晚說的 %s' % J(Ls[:30])[:2000])
    run.check('counted %s：研討室 A 門口「參加：公法讀書會」→ 散會後「反駁的次數」九句照稿照順序、記 AN_COUNTED' % c['key'], res['ok'] and okq and bool(fl) and dn, J({'got': got, 'want': wshow(want), 'flag': fl, 'res': res}))
    await run.shot(pg, 'counted_end')
    if os.environ.get('COUNTED_ONCE', '1') == '1':
        nx = next((x for x in days if x['d'] > c['d']), None)
        if not nx: run.note('counted：之後沒有讀書會週四，不測只一次'); return
        s1 = await snap(pg)
        await jump(pg, cdp, run, s1, nx['key'], 19.67, zone='dorm', pos=None, note='演過「反駁的次數」的進度；下一個讀書會週四 19:40 宿舍')
        n1 = await pl_len(pg)
        r2 = await plg_night(pg, cdp, run, 'counted_again')
        L2 = said(await rows(pg, n1))
        run.check('counted：下一個讀書會週四（%s）再去＝不再演（只一次）' % nx['key'], r2['ok'] and not any(t == COUNTED[0][1] for _, t in L2), J({'said': L2[:12], 'r': r2}))


async def any_walk(pg, cdp, run):
    await pre_load(pg, cdp, run, '2027-09-06', 'walk')
    days = [x for x in await pg.evaluate(PLG_DAYS, ['2027-09-01', '2027-10-20', 'Y3S1']) if x['key'] != '2027-10-07']
    by = {}
    for x in days: by.setdefault(x['m'], []).append(x)
    m1 = next((m for m in sorted(by) if len(by[m]) >= 2), None)
    m3 = next((m for m in sorted(by) if m1 and m > m1), None)
    run.note('walk：大三上 10/21 以前的讀書會週四（10/07 有 ev_y3_plg_topic，跳過；只讀）：%s' % J(by))
    if not m1: run.check('walk：同一個月有兩個讀書會週四', False, J(by)); return
    d1, d2 = by[m1][0], by[m1][1]; d3 = by[m3][0] if m3 else None
    st, d = await state_at(pg, d1['key'], 19.67, 'dorm', flags={'PUBLIC_LAW_GROUP': True})
    r = await load(pg, cdp, run, st, 'walk：最小存檔 %s（四，大三上第 %s 週）19:40 宿舍、晴天；加入公法讀書會' % (d1['key'], d1['week']),
                   js="NOKX(); DT('heroine_01'); const r=HI('heroine_01'); return {r, talk:(typeof AA187!=='undefined'&&AA187.talkToday)?AA187.talkToday(G,'heroine_01'):null, bg:(typeof AA187!=='undefined')?AA187.WALK_BG:null, weather:G.weather};")
    run.check('walk：【捷徑】和以安交往中（dating_heroine_01）、那晚沒有裂縫談話', bool(r) and not r.get('talk'), J(r))
    an = await names_of(pg, AN); me = await pg.evaluate("GAME.G.name||'祐廷'"); wbg = r.get('bg') if r else None
    n0 = await pl_len(pg)
    res = await plg_night(pg, cdp, run, 'walk1', picks=['（送她回去）'], shots_at=['路燈下', '經過總圖', '走到門口', '下雨。她撐傘', '邊走邊背法條'])
    R = await rows(pg, n0); Ls = said(R)
    ch = [x['t'] for x in R if x['k'] == 'choose' and '（送她回去）' in x['t']]
    cur = await pg.evaluate(FLAG, 'AN_WALK_CUR'); mon = await pg.evaluate(FLAG, 'AN_WALK_M'); wx = await pg.evaluate("GAME.G.weather")
    rot = await pg.evaluate(ROT_OF, ['WALK', cur if cur is not None else 0])
    want = rot_want(rot, an, me) if rot else []
    okq, got, i0 = after(Ls, want[0], want[1:]) if want else (False, None, None)
    r0 = row_of(R, want[0][1]) if want else None; bgw = bg_before(R, r0)
    run.note('walk1：散會後說的 %s；背景 %s；地點字幕 %s；天氣 %s' % (J(Ls[-12:]), bgw, J(cap_near(R, r0)), wx))
    run.check('walk1 %s：散會後選項「（送她回去）」「（各自回去）」→ 送她 → 第 %s 組照稿（%s）、記 AN_WALK_M＝%s' % (d1['key'], cur, '下雨那一組' if rot and rot['rain'] else '晴天照順序＝第一組', d1['m']),
              res['ok'] and bool(ch) and ch[0].startswith('（送她回去）｜（各自回去）') and okq and mon == d1['m'] and (cur == 0 or (wx in ('rain', 'typhoon') and cur == 3)),
              J({'choice': ch[:2], 'cur': cur, 'month': mon, 'got': got, 'want': wshow(want)}))
    run.check('walk1：大一女舍門口的圖（AA187.WALK_BG＝%s）：有圖就換那張（ADV.setBg），沒有就照 blur' % wbg, (not wbg and True) or (bool(bgw) and wbg in bgw), J({'WALK_BG': wbg, 'bg': bgw}))
    await run.shot(pg, 'walk1_end')
    s1 = await snap(pg)
    await jump(pg, cdp, run, s1, d2['key'], 19.67, zone='dorm', pos=None, note='送過她的進度；同一個月下一個讀書會週四 %s 19:40 宿舍' % d2['key'])
    n1 = await pl_len(pg)
    r2 = await plg_night(pg, cdp, run, 'walk2')
    R2 = await rows(pg, n1); ch2 = [x['t'] for x in R2 if x['k'] == 'choose' and '（送她回去）' in x['t']]
    run.check('walk2 %s（同一個月）：散會後沒有「（送她回去）」（每個月最多一次）' % d2['key'], r2['ok'] and not ch2, J({'choices': [x['t'] for x in R2 if x['k'] == 'choose'][-4:], 'said': said(R2)[-6:]}))
    if not d3: run.note('walk：下個月沒有讀書會週四（10/21 以前），不測她身邊有朋友'); return
    s2 = await snap(pg)
    await jump(pg, cdp, run, s2, d3['key'], 19.67, zone='dorm', pos=None, note='下個月第一個讀書會週四 %s 19:40 宿舍' % d3['key'])
    stub = await pg.evaluate(STUB_ON, AN)
    run.setup('【捷徑】頁面裡 STORY.COMPANY 放一個替身：以安旁邊有她的朋友（PRIVTALK.crowd＝true；AA-B 11-01 第 6 題「她身邊有朋友時 1-6 不出」）→ %s' % J(stub))
    try:
        n2 = await pl_len(pg)
        r3 = await plg_night(pg, cdp, run, 'walk3_crowd')
        R3 = await rows(pg, n2); ch3 = [x['t'] for x in R3 if x['k'] == 'choose' and '（送她回去）' in x['t']]
        okc = await pg.evaluate("(typeof AA187!=='undefined'&&AA187.walkOk)?AA187.walkOk(GAME.G):null")
    finally:
        off = await pg.evaluate(STUB_OFF)
    ctl = await pg.evaluate("(typeof AA187!=='undefined'&&AA187.walkOk)?AA187.walkOk(GAME.G):null")
    run.check('walk3 %s（下個月、她身邊有朋友）：散會後沒有「（送她回去）」；拿掉替身以後 AA187.walkOk＝true（對照：只差旁邊有人）' % d3['key'], r3['ok'] and not ch3 and okc is False and ctl is True,
              J({'choices': [x['t'] for x in R3 if x['k'] == 'choose'][-4:], 'walkOk_stub': okc, 'walkOk_after': ctl, 'stub_off': off}))


async def any_umb(pg, cdp, run, helped=True):
    tag = 'umb' if helped else 'umbneg'
    await pre_load(pg, cdp, run, '2027-09-06', tag)
    days = await pg.evaluate(WD_DAYS, ['2027-09-07', '2027-12-31', 'Y3S1', 2])
    c = next((x for x in days if x['ndl'] is True and not x['ty'] and not x['hol']), None)
    run.note('%s：大三上的週二（麵店有沒有開 AA187.ndlOpen，只讀）：%s' % (tag, J(days[:8])))
    if not c: run.check('%s：大三上有麵店有開的週二' % tag, False, J(days)); return
    st, d = await state_at(pg, c['key'], 17.83, 'dorm', weather='rain')
    js = "NOKX(); const r=LV('heroine_03',45,30,10); %s return {r, helped:SOCIAL.has('heroine_03','HELPED'), weather:G.weather};" % ("REM('heroine_03','HELPED','把傘給她');" if helped else '')
    r = await load(pg, cdp, run, st, '%s：最小存檔 %s（二，大三上第 %s 週）17:50 宿舍、下雨' % (tag, c['key'], c['week']), js=js)
    wx = await pg.evaluate("GAME.G.weather")
    if wx not in ('rain', 'typhoon'):
        r2 = await pg.evaluate("(()=>{ GAME.G.weather='rain'; try{ if(GAME.E&&GAME.E.setWeather) GAME.E.setWeather('rain'); }catch(e){} return GAME.G.weather; })()")
        run.setup('【捷徑】讀檔以後天氣是 %s（遊戲重抽天氣）：頁面裡改回下雨 → %s' % (wx, r2))
    run.check('%s：【捷徑】語彤朋友、%s' % (tag, '有 HELPED（大一把傘給她）' if helped else '沒有 HELPED'), bool(r) and r['helped'] == helped, J(r))
    n0 = await pl_len(pg)
    gp = await go_place(pg, cdp, run, 'noodle')
    if helped:
        ok = await play(pg, cdp, run, EVDONE % J('ev_yt_umbrella_hook'), max_s=ENVI('UMB_MAX', 240), ff=False, tag=tag, shots_at=['那把傘'])
    else:
        ok = await play(pg, cdp, run, None, max_s=90, ff=False, tag=tag)
    R = await rows(pg, n0); Ls = said(R); n = sum(1 for nm, t in Ls if t == UMB)
    run.note('%s：走進麵店以後說的 %s' % (tag, J(Ls[:12])))
    await run.shot(pg, tag + '_end')
    if helped:
        run.check('umb %s：下雨的週二、手機「地點」→ 阿鳳麵店 → 旁白「%s」一次、ev_yt_umbrella_hook done' % (c['key'], UMB), gp['ok'] and ok and n == 1 and any(nm == '' for nm, t in Ls if t == UMB), J({'go': gp, 'n': n}))
    else:
        run.check('umbneg %s：沒有 HELPED＝在麵店待 90 秒都沒有那句旁白' % c['key'], gp['ok'] and n == 0 and not await pg.evaluate(EVDONE % J('ev_yt_umbrella_hook')), J({'go': gp, 'said': Ls[:8]}))


async def any_fd(pg, cdp, run):
    st, d = await state_at(pg, '2029-04-26', 16.83, 'dorm')
    await load(pg, cdp, run, st, 'fd：最小存檔 2029-04-26（四，大四下）16:50 宿舍', js="NOKX(); DT('heroine_03'); return HI('heroine_03');")
    yt = await names_of(pg, YT)
    got, M = await wait_msg(pg, cdp, run, 'aa187_fd', ENVI('VF_WAIT', 600), 'fd_wait')
    run.check('fd：17:00 語彤私訊 %s' % J(FD_MSG), got and [m['text'] for m in M] == FD_MSG and all(m['from'] == YT for m in M) and M[0]['day'] == '2029-04-26' and abs(M[0]['h'] - 17) < 0.1, J(M))
    if M: await thread_shot(pg, cdp, run, 'p:' + YT, 'fd_dm')
    s1 = await snap(pg)
    await jump(pg, cdp, run, s1, '2029-04-26', 20.25, zone='dorm', pos=None, note='收到 17:00 那兩則的進度；20:15 宿舍（站著等三個多小時太久）')
    n0 = await pl_len(pg)
    gp = await go_place(pg, cdp, run, 'noodle')
    ok = await play(pg, cdp, run, EVDONE % J('ev_yt_family_dinner'), max_s=ENVI('FD_MAX', 600), ff=False, tag='fd', shots_at=['鐵門拉下一半', '我拜我的'])
    R = await rows(pg, n0); Ls = said(R); want = subm(FD, {'@': yt})
    okq, gl, _ = after(Ls, want[0], want[1:]); r0 = row_of(R, want[0][1])
    run.note('fd：到麵店以後說的 %s；背景 %s' % (J(Ls[:14]), bg_before(R, r0)))
    run.check('fd：手機「地點」→ 阿鳳麵店 → 20:30 以後「打烊後的那一桌」九句照稿、記 YT_FAMILY_DINNER', gp['ok'] and ok and okq and bool(r0) and 20.5 <= r0['h'] < 21 and bool(await pg.evaluate(FLAG, 'YT_FAMILY_DINNER')),
              J({'go': gp, 'got': gl, 'at': r0 and [r0['d'], r0['h'], r0['z']]}))
    await run.shot(pg, 'fd_end')
    await wait_h(pg, cdp, run, '2029-04-26', 21.1, ENVI('VF_WAIT', 600), 'fd_after21')
    miss = await pg.evaluate(MSG_OF, 'aa187_fd_miss')
    run.check('fd：演過了＝21:05 沒有「阿姨說下次」', not miss, J(miss))


async def any_fdmiss(pg, cdp, run):
    st, d = await state_at(pg, '2029-04-26', 20.83, 'dorm')
    await load(pg, cdp, run, st, 'fdmiss：最小存檔 2029-04-26 20:50 宿舍（不去麵店）', js="NOKX(); DT('heroine_03'); return HI('heroine_03');")
    got, M = await wait_msg(pg, cdp, run, 'aa187_fd_miss', ENVI('VF_WAIT', 600), 'fdmiss_wait')
    M0 = await pg.evaluate(MSG_OF, 'aa187_fd')
    run.check('fdmiss：17:00 那兩則先補進來、21:00 語彤 %s' % J(FD_MISS), got and [m['text'] for m in M] == FD_MISS and abs(M[0]['h'] - 21) < 0.1 and [m['text'] for m in M0] == FD_MSG and abs(M0[0]['h'] - 17) < 0.1, J({'miss': M, 'fd': M0}))
    if M: await thread_shot(pg, cdp, run, 'p:' + YT, 'fdmiss_dm')


async def any_seat(pg, cdp, run):
    await pre_load(pg, cdp, run, '2027-12-17', 'seat')
    days = await pg.evaluate(WD_DAYS, ['2027-12-17', '2028-01-15', 'Y3S1', 4])
    by = {}
    for x in days: by.setdefault(x['m'], []).append(x)
    m1 = next((m for m in sorted(by) if len(by[m]) >= 2), None)
    run.note('seat：12/16（事件 13）以後大三上的週四（只讀）：%s' % J(by))
    if not m1: run.check('seat：同一個月有兩個週四', False, J(by)); return
    d1, d2 = by[m1][0], by[m1][1]
    st, d = await state_at(pg, d1['key'], 17.5, 'dorm')
    r = await load(pg, cdp, run, st, 'seat：最小存檔 %s（四）17:30 宿舍' % d1['key'],
                   js="NOKX(); DT('heroine_03'); const r=HI('heroine_03'); return {r, free:STORY.ytThuFree?STORY.ytThuFree(G):null, talk:(typeof AA187!=='undefined'&&AA187.talkToday)?AA187.talkToday(G,'heroine_03'):null};")
    sch = await pg.evaluate(SCHED_AT, [YT, d1['key'], 17.8])
    run.check('seat：【捷徑】和語彤交往中；STORY.ytThuFree（事件 13 以後）；那天不是她的裂縫談話；作息 17:00～20:00 總圖三樓', bool(r) and r.get('free') and not r.get('talk') and isinstance(sch, dict) and sch.get('zone') == 'library', J({'r': r, 'sched': sch}))
    yt = await names_of(pg, YT); me = await pg.evaluate("GAME.G.name||'祐廷'")
    for k, dd in ((1, d1), (2, d2)):
        if k == 2:
            s1 = await snap(pg)
            await jump(pg, cdp, run, s1, dd['key'], 17.5, zone='dorm', pos=None, note='坐過她旁邊的進度；同一個月下一個週四 %s 17:30 宿舍' % dd['key'])
        tag = 'seat%d' % k
        fg = await friend_go(pg, cdp, run, YT, tag)
        run.check('%s %s：手機「朋友」→ 語彤「直接過去」＝總圖三樓（library）' % (tag, dd['key']), fg['ok'] and (await P.clock(pg))['zone'] == 'library', J(fg))
        if not fg['ok']: return
        w = await P.wait_present(pg, YT, 90)
        if not w or w['hidden']: run.check('%s：三樓看得到語彤' % tag, False, J(w)); return
        await wait_h(pg, cdp, run, dd['key'], 17.55, 120, tag + '_to1730')
        n0 = await pl_len(pg)
        sr = await sit_near(pg, cdp, run, YT, tag)
        R = await rows(pg, n0); Ls = said(R)
        cur = await pg.evaluate(FLAG, 'YT_SEAT4_CUR'); mon = await pg.evaluate(FLAG, 'YT_SEAT4_M')
        seat_txt = set()
        for i in range(4):
            ro = await pg.evaluate(ROT_OF, ['SEAT', i])
            if ro: seat_txt |= {t for _, t in ro['lines']}
        run.note('%s：坐下以後說的 %s；座位 %s；YT_SEAT4_CUR %s、YT_SEAT4_M %s' % (tag, J(Ls[:10]), J({k_: sr.get(k_) for k_ in ('ok', 'seat', 'her', 'why')}), cur, mon))
        if k == 1:
            ro = await pg.evaluate(ROT_OF, ['SEAT', cur if cur is not None else 0]); want = rot_want(ro, yt, me) if ro else []
            okq, gl, _ = after(Ls, want[0], want[1:]) if want else (False, None, None)
            if len(want) == 1: okq = any(t == want[0][1] and name_ok(want[0][0], n) for n, t in Ls)
            run.check('seat1 %s：走到她 2.4 m 內的空位「坐下」→ 週四的斜對面第 %s 組照稿（晴天照順序＝第一組）、記 YT_SEAT4_M＝%s' % (dd['key'], cur, dd['m']),
                      sr.get('ok') and okq and mon == dd['m'] and cur in (0, 1), J({'got': gl, 'want': wshow(want), 'sit': sr.get('seat'), 'menus': sr.get('menus')}))
        else:
            run.check('seat2 %s（同一個月）：再坐她旁邊＝不演（每個月最多一次）' % dd['key'], sr.get('ok') and not any(t in seat_txt for _, t in Ls), J({'said': Ls[:8], 'sit': sr.get('seat')}))


async def epi_run(pg, cdp, run, tag, extra_flags, js, shots_at=(), label=''):
    """畢業以後的最小存檔 2030-12-20 12:00 校園（aa382_probe 的 pg_mode）→ 站著（畢業後篇站 2 秒＝跳到下一件事）→ 2034-06-03 尾聲演完。回傳 (rows, ok)"""
    keys = ['2029-06-01', '2029-06-02', '2029-06-28']
    dk = {k: (await P.day_of(pg, k))['d'] for k in keys}
    F = {'Y4_PATH': 'other', 'BAR_REG': False, 'PACKED_Y4': dk['2029-06-01'], 'GRADUATED': dk['2029-06-02'], 'GRAD_DONE': True, 'MOVED_OUT': dk['2029-06-28'], 'HOME_AFTER': 'home',
         'EXCHANGE_ROUTE': 'TW', 'EXCH_RULE': 1, 'FIRST_DAY_SEEN': True, 'PG': {'done': {'grad': 1, 'first': 1}}}
    F.update(extra_flags or {})
    st, d = await state_at(pg, '2030-12-20', 12.0, 'campus', flags=F, pos={'x': -34, 'z': 12.5, 'yaw': 3.14159, 'lv': 0}, money=22000,
                           done={'ev_grad_family': 1, 'ev_grad_lunch': 1, 'ev_grad_envelope': 1, 'ev_move_out_y4': 1, 'ev_sis_w1': 1})
    st['v'] = 2
    r = await load(pg, cdp, run, st, '%s：畢業以後的最小存檔 2030-12-20 12:00 校園（GRADUATED、PG done grad/first、FIRST_DAY_SEEN、不考律師；同 aa382_probe）%s' % (tag, label), js=js)
    n0 = await pl_len(pg)
    end = await pg.evaluate("(()=>{ try{ return POSTGRAD_LINES.EPI.end; }catch(e){ return null; } })()")
    ua = "!!GAME.G.flags.EPILOGUE_DONE||(window.__PL||[]).some(r=>r.k==='say'&&r.t===%s)" % J(end or '__none__')
    ok = await play(pg, cdp, run, None, max_s=ENVI('EPI_MAX', 900), ff=False, tag=tag, shots_at=shots_at, until_any=ua)
    await pg.wait_for_timeout(2500)
    R = await rows(pg, n0)
    return R, ok, r


async def any_fdepi(pg, cdp, run):
    R, ok, r = await epi_run(pg, cdp, run, 'fdepi', {'dating_heroine_03': True, 'YT_FAMILY_DINNER': True}, "NOKX(); DT('heroine_03'); return HI('heroine_03');", shots_at=['手機桌布'])
    Ls = said(R); yt = await names_of(pg, YT)
    i = next((k for k, (n, t) in enumerate(Ls) if t == FD_EPI), None)
    run.note('fdepi：尾聲說的 %s' % J(Ls[:40])[:2500])
    run.check('fdepi：尾聲語彤的句子前面「%s」（交往中＋YT_FAMILY_DINNER）' % FD_EPI, ok and i is not None and i + 1 < len(Ls) and Ls[i + 1][0] in yt, J(Ls[i:i + 3] if i is not None else Ls[-8:]))


async def m_anyt(pg, cdp, run):
    fns = {'counted': any_counted, 'walk': any_walk, 'umb': lambda a, b, c: any_umb(a, b, c, True), 'umbneg': lambda a, b, c: any_umb(a, b, c, False),
           'fd': any_fd, 'fdmiss': any_fdmiss, 'seat': any_seat, 'fdepi': any_fdepi}
    for s in ENV('ANYT', 'counted,walk,umb,umbneg,fd,fdmiss,seat'):
        fn = fns.get(s)
        if not fn: run.check('ANYT＝%s 認得' % s, False, ','.join(fns)); continue
        run.note('==== anyt：%s ====' % s)
        try: await fn(pg, cdp, run)
        except Exception as ex:
            run.check('anyt %s：跑完（沒有探針例外）' % s, False, repr(ex)[:400]); traceback.print_exc()
            try: await run.shot(pg, 'anyt_%s_exception' % s)
            except Exception: pass


# ================================================================ 3. cg20：CG-20 斜對面的位子
CG20_N = '（從下午讀到天黑。你去買晚餐回來，她已經把斜對面的位子占好，放了一杯熱茶。）'
CG20_ID = 'cg_saved_seat_heroine03'
CG20_REL = {'dating': "DT('heroine_03'); const r=HI('heroine_03');", 'st5': "const r=LV('heroine_03',45,30,10,{npcRom:35});", 'st4': "const r=LV('heroine_03',45,30,10,{npcRom:10});"}
CG20_INFO = """(()=>{ const G=GAME.G, R=typeof R2Y4B!=='undefined'?R2Y4B:null; let s=null; try{ s=R&&R.session?R.session(G,G.day):null; }catch(e){ s='ERR '+e.message; }
  return {kind:G.flags.BAR_GROUP_KIND||null, grp:G.flags.BAR_STUDY_GROUP||null, first:G.flags.BAR_GROUP_YT_FIRST||null, cg20:G.flags.YT_CG20||null, session:s, stg:(typeof DATE!=='undefined'&&DATE.stageNum)?DATE.stageNum('heroine_03'):null,
    unlocked:((G.cg||{}).unlocked||[]).slice(-6)}; })()"""


async def cg_session(pg, cdp, run, tag, key, zone, h0):
    """[前置] 同一份進度跳到那一天、讀書小組開始前 → 手機「地點」→ 麵店／總圖書館（大廳）→ 讀書小組那一場（ev_bar_group_night）演完"""
    s1 = await snap(pg)
    await jump(pg, cdp, run, s1, key, h0, zone='dorm', pos=None, note='讀書小組那一場以前（中間的日子不演）')
    n0 = await pl_len(pg)
    gp = await go_place(pg, cdp, run, zone)
    until = "(()=>GAME.G.flags.BAR_GROUP_LAST===GAME.G.day)()"
    ok = await play(pg, cdp, run, until, max_s=ENVI('CG_MAX', 600), ff=False, tag=tag, shots_at=['從下午讀到天黑', '我今年不考', '十點，麵店'],
                    watch=[(CG_ON + "(%s)" % J('cg_saved_seat.webp'), tag + '_CG20')])
    R = await rows(pg, n0)
    return gp, ok, R


async def cg_case(pg, cdp, run, case):
    if case not in CG20_REL: run.check('CG20＝%s 認得' % case, False, ','.join(CG20_REL)); return
    tag = 'cg20_' + case
    dyd = (await P.day_of(pg, '2028-06-08'))['d']
    st, d = await state_at(pg, '2029-02-23', 20.83, 'dorm', flags={'Y4_PATH': 'bar', 'Y4_PATH_DAY': dyd})
    r = await load(pg, cdp, run, st, '%s：最小存檔 2029-02-23（五）20:50 宿舍；大四選考律師（Y4_PATH bar）' % tag,
                   js="NOKX(); %s return {r, kind:(typeof R2Y4B!=='undefined'&&R2Y4B.groupKind)?R2Y4B.groupKind(G):null, member:(typeof R2Y4B!=='undefined'&&R2Y4B.ytMember)?R2Y4B.ytMember(G):null};" % CG20_REL[case])
    run.check('%s：【捷徑】語彤 %s（DATE.stageNum %s）；讀書小組會是「只有語彤」（R2Y4B.groupKind yutong）' % (tag, {'dating': '交往中', 'st5': '第 5 階朋友', 'st4': '第 4 階朋友'}[case], r and r['r']['stg']),
              bool(r) and r.get('kind') == 'yutong', J(r))
    ok = await play(pg, cdp, run, EVDONE % J('ev_bar_group_start'), max_s=ENVI('CG_MAX', 600), picks=['出發：'], ff=False, tag=tag + '_start')
    info = await pg.evaluate(CG20_INFO)
    run.check('%s：2/23 21:30「出發：律師讀書小組（阿鳳麵店）」→ 成立那一晚演完、BAR_GROUP_KIND yutong' % tag, ok and info['kind'] == 'yutong', J(info))
    if not ok: return
    if case == 'st5':
        gp, ok5, R5 = await cg_session(pg, cdp, run, tag + '_fri', '2029-03-02', 'noodle', 20.67)
        run.check('%s：3/2（五）麵店那一晚（第一次＝yt_first）沒有 CG-20（CG-20 只在週六總圖）' % tag, gp['ok'] and ok5 and not any(x['k'] == 'cg' and x['t'] == CG20_ID for x in R5) and not any(x['t'] == CG20_N for x in R5),
                  J({'go': gp, 'said': said(R5)[:6], 'info': await pg.evaluate(CG20_INFO)}))
    gp, okS, R = await cg_session(pg, cdp, run, tag + '_sat', '2029-03-03', 'library_hall', 9.92)
    Ls = said(R); info = await pg.evaluate(CG20_INFO)
    yt = await names_of(pg, YT)
    i = next((k for k, x in enumerate(R) if x['k'] == 'say' and x['t'] == CG20_N), None)
    cg = next((k for k, x in enumerate(R) if x['k'] == 'cg' and x['t'] == CG20_ID), None)
    run.note('%s：3/3（六）總圖那一場說的 %s；CG %s；%s' % (tag, J(Ls[:12]), J([x for x in R if x['k'] == 'cg']), J(info)))
    await run.shot(pg, tag + '_sat_end')
    if case == 'st4':
        run.check('%s：第 4 階（她的戀愛 < 30、沒交往）：3/3 週六總圖那一場沒有「從下午讀到天黑」那句、沒有 CG-20' % tag, gp['ok'] and okS and i is None and cg is None and not info['cg20'], J({'said': Ls[:8], 'info': info}))
        return
    nxt = [x for x in R[i + 1:] if x['k'] in ('say', 'cg')][:2] if i is not None else []
    run.check('%s：3/3（六）手機「地點」→ 總圖書館（大廳）→ 讀書小組：旁白「%s」→ ADV.cg(%s) → 語彤「我今年不考。……可是我可以考你。」；記 YT_CG20、圖鑑解鎖' % (tag, CG20_N[:14] + '…', CG20_ID),
              gp['ok'] and okS and i is not None and cg is not None and cg > i and bool(nxt) and nxt[0]['k'] == 'cg' and any(t == '我今年不考。……可是我可以考你。' and n in yt for n, t in Ls) and bool(info['cg20']) and CG20_ID in (info['unlocked'] or []),
              J({'after': nxt, 'said': Ls[:8], 'info': info}))
    if case == 'dating':
        gp2, ok2, R2 = await cg_session(pg, cdp, run, tag + '_sat2', '2029-03-10', 'library_hall', 9.92)
        run.check('%s：下一個週六（3/10）總圖：不再放 CG-20（只一次）' % tag, gp2['ok'] and ok2 and not any(x['k'] == 'cg' and x['t'] == CG20_ID for x in R2) and not any(x['t'] == CG20_N for x in R2), J({'said': said(R2)[:6]}))


async def m_cg20(pg, cdp, run):
    for c in ENV('CG20', 'dating,st5,st4'):
        run.note('==== cg20：%s ====' % c)
        try: await cg_case(pg, cdp, run, c)
        except Exception as ex: run.check('cg20 %s：跑完（沒有探針例外）' % c, False, repr(ex)[:400]); traceback.print_exc()


# ================================================================ 4. y1show：大一下成發的觀眾席
AUD_KAI = [('', '（阿凱坐第一排，手上拿著手機錄影。）'), ('@kai', '我是來錄證據的。她說彈錯要請宵夜。')]
AUD_YU = [('@yu', '我等一下第三首。我好緊張，我要吐了。')]
AUD_ZR = [('', '（芷若坐在後排。）'), ('@zr', '我是被她押來的。')]
AUD_BACK = [('', '（後台。）'), ('@zq', '欸不是，我手在抖。')]
KAI_ABSENT = '你沒來。她彈錯了，然後大笑。你錯過了。'


async def show_case(pg, cdp, run, case, dshow):
    tag = 'y1show_' + case
    if case in ('all', 'nozr'):
        st, d = await state_at(pg, dshow['key'], 18.75, 'dorm')
        zr = "LV('heroine_02',25,10,5)" if case == 'all' else "LV('heroine_02',10,0,0)"
        r = await load(pg, cdp, run, st, '%s：最小存檔 %s（三，大一下第 14 週）18:45 宿舍' % (tag, dshow['key']),
                       js="NOKX(); const a=[LV('heroine_04',25,10,5),LV('kai',25,10,5),LV('yu',25,10,5),%s]; return a.map(x=>x.id+':'+x.level);" % zr)
        run.check('%s：【捷徑】子晴、阿凱、Alison 有點熟；芷若 %s' % (tag, '有點熟（FAMILIAR）' if case == 'all' else '只是認識'), bool(r) and (('heroine_02:FAMILIAR' in r) == (case == 'all')), J(r))
        M = {'@kai': await names_of(pg, 'kai'), '@yu': await names_of(pg, 'yu'), '@zr': await names_of(pg, ZR), '@zq': await names_of(pg, ZQ)}
        gp = await go_place(pg, cdp, run, 'wancai')
        await wait_h(pg, cdp, run, dshow['key'], 18.8, 60, tag + '_to1848')
        n0 = await pl_len(pg)
        sj = await spot_join(pg, cdp, run, '吉他社成發', '去看：', tag)
        run.check('%s：手機「地點」→ 法律系館B → 走到「吉他社成發」按 →「去看：吉他社成發」' % tag, gp['ok'] and sj['ok'], J({'go': gp, 'spot': sj}))
        if not sj['ok']: return
        ok = await play(pg, cdp, run, EVDONE % J('ev_ziqing_show'), max_s=ENVI('SHOW_MAX', 600), ff=False, tag=tag, shots_at=['阿凱坐第一排', '我等一下第三首', '芷若坐在後排', '我是被她押來的', '後台'])
        R = await rows(pg, n0); Ls = said(R)
        want = subm(AUD_KAI + AUD_YU + (AUD_ZR if case == 'all' else []) + AUD_BACK, M)
        okq, gl, _ = after(Ls, want[0], want[1:])
        run.note('%s：成發說的 %s' % (tag, J(Ls[:16])))
        run.check('%s：觀眾席 %s，接著「（後台。）」子晴「欸不是，我手在抖。」' % (tag, '阿凱旁白＋一句、Alison 一句、芷若旁白＋「我是被她押來的。」' if case == 'all' else '阿凱旁白＋一句、Alison 一句（沒有芷若）'),
                  ok and okq and (case == 'all' or not any(t == AUD_ZR[1][1] for _, t in Ls)), J({'got': gl, 'want': wshow(want)}))
        await run.shot(pg, tag + '_end')
        return
    # absent：不去
    st, d = await state_at(pg, dshow['key'], 20.83, 'dorm')
    r = await load(pg, cdp, run, st, 'y1show_absent：最小存檔 %s（三，大一下第 14 週）20:50 宿舍（不去成發）' % dshow['key'],
                   js="NOKX(); const a=[LV('heroine_04',25,10,5),LV('kai',25,10,5)]; return {rel:a.map(x=>x.id+':'+x.level), guitar:JOIN('guitar','吉他社')};")
    run.check('y1show_absent：【捷徑】在吉他社群組、子晴阿凱有點熟', bool(r) and r.get('guitar'), J(r))
    await wait_h(pg, cdp, run, dshow['key'], 21.3, ENVI('VF_WAIT', 600), 'y1show_absent_2120')
    zs = await pg.evaluate(FLAG, 'ZQ_SHOW'); inv = await pg.evaluate(MSG_OF, 'zq_show_inv')
    run.check('y1show_absent：收到「期末成發你要來。這不是問句。」、21:12 以後沒去＝ZQ_SHOW absent', zs == 'absent' and bool(inv), J({'ZQ_SHOW': zs, 'inv': inv}))
    s1 = await snap(pg); nd = await pg.evaluate("d=>CALENDAR.dateOf(d+1).key", dshow['d'])
    await jump(pg, cdp, run, s1, nd, 12.33, zone='dorm', pos=None, note='沒去成發的進度；隔天 12:20 宿舍')
    got, M = await wait_msg(pg, cdp, run, 'g3_kai_absent', ENVI('VF_WAIT', 600), 'y1show_absent_kai')
    Z = await pg.evaluate(MSG_OF, 'zq_show_absent')
    run.check('y1show_absent：隔天 12:30 阿凱「%s」（子晴 10:00「你沒來」）' % KAI_ABSENT,
              got and len(M) == 1 and M[0]['text'] == KAI_ABSENT and M[0]['from'] == 'kai' and M[0]['day'] == nd and abs(M[0]['h'] - 12.5) < 0.05 and [m['text'] for m in Z] == ['你沒來'] and abs(Z[0]['h'] - 10) < 0.05, J({'kai': M, 'zq': Z}))
    if M: await thread_shot(pg, cdp, run, 'p:kai', 'y1show_absent_kai_thread')


async def m_y1show(pg, cdp, run):
    await pre_load(pg, cdp, run, '2026-05-01', 'y1show')
    dshow = await P.day_of(pg, ['Y1S2', 14, 3])
    run.note('y1show：大一下第 14 週週三（STORY.termDay，只讀）＝%s' % J(dshow))
    for c in ENV('Y1SHOW', 'all,nozr,absent'):
        run.note('==== y1show：%s ====' % c)
        try: await show_case(pg, cdp, run, c, dshow)
        except Exception as ex: run.check('y1show %s：跑完（沒有探針例外）' % c, False, repr(ex)[:400]); traceback.print_exc()


# ================================================================ 5. xclove：芯慈交往中
XC_EPI = ['我們每週三還是去巷口家常菜。', '我又點回番茄炒蛋了。……今天想吃的就是它。']
XC_GIFT = '（一本她的筆記，最後一頁空白，上面貼著一張便利貼：「這一頁你寫。」）'
XC_BD = [('', '（她收到禮物，拆得很慢，包裝紙摺好才放進包包。）'), ('@', '我會留著。包裝紙也是。')]
XC_XMAS = [('@', '今年是十三部。最後一部，我想跟你一起看。')]
XC_VDAY = '我不太會過這種節。……可是我提前一天約你了。'
XC_NYE = [('我在家。我媽在看晚會。', '2028-12-31', 23 + 58 / 60), ('新年快樂。這是今年第一則。', '2029-01-01', 1 / 60)]
XC_JS = "NOKX(); DT('classmate_xinci'); const r=HI('classmate_xinci'); return {r, on:(typeof XCROM!=='undefined')?XCROM.ON:null%s};"
FEST_DONE = "(k=>{ try{ return !!FEST.rec(GAME.G).done[k]; }catch(e){ return false; } })(%s)"


async def xc_epi(pg, cdp, run):
    R, ok, r = await epi_run(pg, cdp, run, 'xc_epi', {'dating_classmate_xinci': True}, XC_JS % '', shots_at=['巷口家常菜', '番茄炒蛋', '這一頁你寫'], label='；和芯慈交往中')
    Ls = said(R); xc = await names_of(pg, XC)
    run.note('xc_epi：XCROM.ON＝%s；尾聲說的 %s' % (r and r.get('on'), J(Ls[:50])[:3000]))
    okq, gl, _ = after(Ls, (xc, XC_EPI[0]), [(xc, XC_EPI[1])])
    run.check('xc_epi：跳到 2034-06-03 尾聲；芯慈「%s」「%s」' % tuple(XC_EPI), ok and okq, J({'got': gl, 'xc': [x for x in Ls if x[0] in xc]}))
    g = row_of(R, XC_GIFT)
    run.check('xc_epi：桌上的東西多「%s」（旁白；截圖）' % XC_GIFT, bool(g) and g['n'] == '', J([x for x in Ls if x[0] == ''][-6:]))
    await run.shot(pg, 'xc_epi_end')


async def xc_fest(pg, cdp, run, k):
    X = {'bday': ('2029-03-27', '生日', '中午場', 'classmate_xinci:bday:2029', XC_BD, '收到禮物'), 'xmas': ('2028-12-23', '聖誕節', '晚上場', 'classmate_xinci:xmas:2028', XC_XMAS, '十三部')}[k]
    tag = 'xc_' + k
    st, d = await state_at(pg, X[0], 10.0, 'dorm')
    r = await load(pg, cdp, run, st, '%s：最小存檔 %s 10:00 宿舍（%s 前一天）' % (tag, X[0], X[1]),
                   js=XC_JS % ", fo:(typeof FEST!=='undefined'&&FEST.flowOpt)?FEST.flowOpt(G,'classmate_xinci',null,false):null, when:(typeof INV!=='undefined')?INV.WHEN_LABEL:null")
    run.check('%s：【捷徑】和芯慈交往中；XCROM.ON＝true（程式裡就開著）；邀約選單會有「約她過節：%s」' % (tag, X[1]), bool(r) and r.get('on') is True and bool(r.get('fo')) and r['fo']['t'] == '約她過節：' + X[1], J(r))
    xc = await names_of(pg, XC); m0 = await pg.evaluate("GAME.G.money")
    pi = await phone_inv(pg, cdp, run, XC, tag)
    if not pi['ok']: run.check('%s：手機「朋友」→ 芯慈「約」' % tag, False, J(pi)); return
    md = await menu_drive(pg, cdp, run, ['約她過節', (r or {}).get('when') or '這個時候才有', X[2]], tag)
    iv = await pg.evaluate("id=>(GAME.G.invites||[]).filter(v=>v.who===id&&v.fest).map(v=>({day:CALENDAR.dateOf(v.day).key,h:v.h,place:v.place,state:v.state,fest:v.fest}))", XC)
    run.check('%s：手機「朋友」→ 芯慈「約」→「這個時候才有」→「約她過節：%s」→「%s」→ 地點 → 約好（iv.fest %s）' % (tag, X[1], X[2], k), bool(iv) and iv[-1]['fest']['k'] == k, J({'menus': md['menus'], 'picked': md['picked'], 'iv': iv}))
    if not iv: return
    n0 = await pl_len(pg)
    ok = await play(pg, cdp, run, FEST_DONE % J(X[3]), max_s=ENVI('XC_MAX', 1800), picks=['直接過去：', '出發：'], ff=True, tag=tag, shots_at=[X[5]])
    R = await rows(pg, n0); Ls = said(R); want = subm(X[4], {'@': xc})
    okq, gl, _ = after(Ls, want[0], want[1:]) if len(want) > 1 else (any(t == want[0][1] and n in xc for n, t in Ls), None, None)
    gift = [x['t'] for x in R if x['k'] == 'choose' and '禮物' in x['t']]
    m1 = await pg.evaluate("GAME.G.money")
    run.note('%s：見面那天說的 %s；錢 %s → %s' % (tag, J(Ls[:14]), m0, m1))
    run.check('%s：到了（床快轉、「直接過去：」）先演那一格 %s；沒有禮物選單' % (tag, J([t for _, t in X[4]])), ok and okq and not gift, J({'got': gl, 'gift': gift}))
    await run.shot(pg, tag + '_end')


async def xc_vday(pg, cdp, run):
    y = ENVI('XC_VDAY_YEAR', 2028); key = '%d-02-13' % y; tg = 'fest_ask_classmate_xinci_vday_%d' % y; oid = 'fest_classmate_xinci_vday_%d' % y
    st, d = await state_at(pg, key, 20.83, 'dorm')
    r = await load(pg, cdp, run, st, 'xc_vday：最小存檔 %s 20:50 宿舍' % key, js=XC_JS % ", fo:(typeof FEST!=='undefined'&&FEST.flowOpt)?FEST.flowOpt(G,'classmate_xinci',null,false):null")
    got, M = await wait_msg(pg, cdp, run, tg, ENVI('VF_WAIT', 600), 'xc_vday_wait')
    run.check('xc_vday：%s 21:00 她先私訊「%s」＋回覆「好。」「那天不行。」；邀約選單沒有「約她過節：情人節」' % (key, XC_VDAY),
              got and [m['text'] for m in M] == [XC_VDAY] and M[0]['from'] == XC and abs(M[0]['h'] - 21) < 0.1 and M[-1]['opts'] == ['好。', '那天不行。'] and not (r or {}).get('fo'), J({'M': M, 'fo': (r or {}).get('fo')}))
    if not got: return
    a = await answer(pg, cdp, run, ('eq', tg), '好。', 'xc_vday')
    await play(pg, cdp, run, "(id=>!!OUT.get(GAME.G,id))(%s)" % J(oid), max_s=40, ff=False, tag='xc_vday_plan')
    q = await pg.evaluate(OUTQ, oid)
    run.check('xc_vday：點「好。」＝出遊 2/14 18:00 巷口家常菜', bool(a) and a['tapped'] == '好。' and bool(q) and q['day'] == '%d-02-14' % y and abs(q['h'] - 18) < 0.01 and q['place'] == '巷口家常菜', J({'a': a, 'q': q}))
    if not q: return
    n0 = await pl_len(pg); xc = await names_of(pg, XC)
    ok = await play(pg, cdp, run, FEST_DONE % J('classmate_xinci:vday:%d' % y), max_s=ENVI('XC_MAX', 1800), picks=['出發：'], ff=True, tag='xc_vday', card_watch=('巷口家常菜', 'xc_vday_card'))
    R = await rows(pg, n0); her = [x for x in said(R) if x[0] in xc]
    caps = [x['t'] for x in R if x['k'] in ('cap', 'card') and '巷口家常菜' in (x['t'] + x['n'])]
    mem = await pg.evaluate("t=>!!SOCIAL.has('classmate_xinci',t)", 'HOL_VDAY_%d' % y)
    run.note('xc_vday：2/14 說的 %s；地點字幕 %s' % (J(said(R)[:10]), J(caps)))
    run.check('xc_vday：「出發：」→ 只有地點字幕「巷口家常菜」（見面那一場稿沒有台詞：她沒有說話）、記 HOL_VDAY_%d' % y, ok and bool(caps) and not her and mem, J({'caps': caps, 'her': her, 'mem': mem}))
    await run.shot(pg, 'xc_vday_end')


async def xc_nye(pg, cdp, run):
    st, d = await state_at(pg, '2028-12-31', 23.83, 'dorm')
    await load(pg, cdp, run, st, 'xc_nye：最小存檔 2028-12-31 23:50 宿舍', js=XC_JS % '')
    ok = await wait_h(pg, cdp, run, '2028-12-31', 24.1, ENVI('VF_WAIT', 600), 'xc_nye_wait', picks=['再撐一下', '先不睡'])
    M = await pg.evaluate("(()=>(GAME.G.msgs||[]).filter(m=>m&&m.from==='classmate_xinci'&&/^fest_dm_classmate_xinci_nye_2028_/.test(m.tag||'')).map(m=>({text:String(m.text||''),day:CALENDAR.dateOf(m.day).key,h:+(+m.h).toFixed(3),tag:m.tag})))()")
    run.check('xc_nye：站著過半夜（不睡）：12/31 23:58「%s」、1/1 00:01「%s」' % (XC_NYE[0][0], XC_NYE[1][0]),
              ok and [m['text'] for m in M] == [x[0] for x in XC_NYE] and all(m['day'] == x[1] and abs(m['h'] - x[2]) < 0.02 for m, x in zip(M, XC_NYE)), J({'M': M, 'now': await P.clock(pg)}))
    await thread_shot(pg, cdp, run, 'p:' + XC, 'xc_nye_thread')


async def m_xclove(pg, cdp, run):
    fns = {'epi': xc_epi, 'bday': lambda a, b, c: xc_fest(a, b, c, 'bday'), 'xmas': lambda a, b, c: xc_fest(a, b, c, 'xmas'), 'vday': xc_vday, 'nye': xc_nye}
    for s in ENV('XC', 'epi,bday,xmas,vday,nye'):
        fn = fns.get(s)
        if not fn: run.check('XC＝%s 認得' % s, False, ','.join(fns)); continue
        run.note('==== xclove：%s ====' % s)
        try: await fn(pg, cdp, run)
        except Exception as ex: run.check('xclove %s：跑完（沒有探針例外）' % s, False, repr(ex)[:400]); traceback.print_exc()


# ================================================================ 6. sisnewyear：學姊交往中初一 09:00
CNY1 = {2027: {'d': '2027-02-06', 'ms': ['新年快樂。……今年想第一個跟你說，所以先傳了。', '新家的廚房還找不到碗放哪裡。我媽說初三以後再找。', '初三有空的話，出來走走。'], 'opts': [['好。初三見。', '好。不用排行程。'], ['初三要陪家人。', '好。那開學見。']]},
        2028: {'d': '2028-01-26', 'ms': ['新年快樂。', '今年的計畫本，第一頁寫的是：等。', '……你的也是嗎。'], 'opts': [['我也在等。', '那我們一起等。'], ['我的寫了妳。', '……不要在初一講這種話。我媽在旁邊。']]},
        2029: {'d': '2029-02-13', 'ms': ['新年快樂。論文我今天放一天假。', '今天只想吃東西。'], 'opts': [['吃什麼？', '我媽煮的全部。'], ['放假就好好放。', '好。明天再寫。']]}}
CNY_OF = """(y=>{ for(let d=STORY.dayOfKey(y+'-01-10'); d<=STORY.dayOfKey(y+'-02-28'); d++){ if(CALENDAR.holiday(d)==='除夕'&&CALENDAR.holiday(d+1)==='春節') return CALENDAR.dateOf(d+1).key; } return null; })"""


async def sny_case(pg, cdp, run, y, dating=True):
    tag = 'sny_%d%s' % (y, '' if dating else '_friend')
    C = CNY1[y]
    cny = await pg.evaluate(CNY_OF, y)
    run.check('%s：遊戲的行事曆 %d 年初一（除夕的隔天「春節」）＝%s，和 SISB10.CNY1 的日子 %s 一樣' % (tag, y, cny, C['d']), cny == C['d'], J(cny))
    st, d = await state_at(pg, C['d'], 8.83, 'dorm', flags={'met_sis': True, 'SIS_W1': True})
    js = "NOKX(); DT('heroine_05'); return HI('heroine_05');" if dating else "NOKX(); return LV('heroine_05',45,30,10);"
    await load(pg, cdp, run, st, '%s：最小存檔 %s（初一）08:50 宿舍；認識學姊（met_sis）' % (tag, C['d']), js=js)
    tg = 'sisb10_cny1_%d' % y
    if not dating:
        await wait_h(pg, cdp, run, C['d'], 9.33, ENVI('VF_WAIT', 600), tag + '_wait')
        M = await pg.evaluate(MSG_OF, tg)
        run.check('%s：沒交往（朋友）＝初一 09:20 還是沒有她那幾則' % tag, not M, J(M)); return
    got, M = await wait_msg(pg, cdp, run, tg, ENVI('VF_WAIT', 600), tag + '_wait')
    run.check('%s：初一 09:00 學姊私訊 %s＋回覆 %s' % (tag, J(C['ms']), J([o[0] for o in C['opts']])),
              got and [m['text'] for m in M] == C['ms'] and all(m['from'] == SIS for m in M) and M[0]['day'] == C['d'] and abs(M[0]['h'] - 9) < 0.05 and M[-1]['opts'] == [o[0] for o in C['opts']], J(M))
    if not got: return
    a = await answer(pg, cdp, run, ('eq', tg + '_ask'), C['opts'][0][0], tag)
    await play(pg, cdp, run, "(t=>(GAME.G.msgs||[]).some(m=>m&&(PHONE.th?PHONE.th(m):m.th)==='p:heroine_05'&&m.text===t))(%s)" % J(C['opts'][0][1]), max_s=60, ff=False, tag=tag + '_reply')
    th = await pg.evaluate(THREAD, 'p:' + SIS)
    run.check('%s：點「%s」→ 學姊「%s」' % (tag, C['opts'][0][0], C['opts'][0][1]), bool(a) and a['tapped'] == C['opts'][0][0] and any(x[0] == SIS and x[1] == C['opts'][0][1] for x in th), J({'a': a, 'thread': th[-5:]}))


async def m_sisnewyear(pg, cdp, run):
    await pre_load(pg, cdp, run, '2027-01-20', 'sisnewyear')
    for ys in ENV('SNY', '2027,2028,2029'):
        y = int(ys)
        if y not in CNY1: run.check('SNY＝%s 認得' % ys, False, '2027,2028,2029'); continue
        run.note('==== sisnewyear：%d ====' % y)
        try: await sny_case(pg, cdp, run, y)
        except Exception as ex: run.check('sisnewyear %d：跑完（沒有探針例外）' % y, False, repr(ex)[:400]); traceback.print_exc()
    if os.environ.get('SNY_NEG', '1') == '1':
        try: await sny_case(pg, cdp, run, 2027, dating=False)
        except Exception as ex: run.check('sisnewyear 2027 friend：跑完（沒有探針例外）', False, repr(ex)[:400]); traceback.print_exc()


# ================================================================ 7. usmsg：美國路線 11/08 沛珊、11/10 子晴
USF = {'EXCHANGE_ROUTE': 'US', 'EXCH_RULE': 1, 'US_DEPARTED': True, 'US_ARRIVED': True, 'Y4_PATH': 'bar', 'USL_JETLAG': True}
US_JS = "G.flags.US_ARRIVED_DAY=D('2028-08-02'); G.flags.Y4_PATH_DAY=D('2028-06-08'); NOKX(); const a=[LV('classmate_peishan',45,30,10),LV('heroine_04',45,30,10)]; try{ for(const id of ['classmate_peishan','heroine_04']) if(INV.addContact) INV.addContact(G,id); }catch(e){}"
US_INFO = "(()=>({tz:STORY.tzOffset?STORY.tzOffset(GAME.G,GAME.G.day):null, abroad:STORY.abroad?!!STORY.abroad(GAME.G):null, route:STORY.route?STORY.route(GAME.G):null, zone:GAME.G.zone}))()"
PS_LESSON = ['今天第一次試教。', '📷（教室的黑板，右下角一個畫歪的笑臉）', '有一個小朋友舉了六次手。……這次我有看到他。']
PS_OPTS = [['恭喜！', '謝謝。……你那邊是早上吧。你先去上課。'], ['他問了什麼？', '他問太陽會不會用完。我說會，可是要很久很久。他說：那就好。']]
ZQ_LEVEL = ['新關卡做好了', '📷（一隻像素的貓，站在一個發亮的存檔點旁邊）', '你不在 沒人玩第三遍', '回來再玩']
ZQ_OPTS = [['我回去玩。', '十二月二十三號'], ['存檔點旁邊那是什麼？', '不要問']]


async def us_case(pg, cdp, run, case):
    tag = 'us_' + case
    fl = dict(USF)
    if case == 'pos': fl['PS_RECONNECT'] = True
    st, d = await state_at(pg, '2028-11-08', 9.92, 'us_apartment', flags=fl)
    r = await load(pg, cdp, run, st, '%s：最小存檔 2028-11-08 09:55（當地）us_apartment；美國路線（EXCHANGE_ROUTE US、US_DEPARTED／US_ARRIVED、Y4_PATH bar）%s' % (tag, '、重新聯絡上沛珊（PS_RECONNECT）' if case == 'pos' else '、沒有重新聯絡上沛珊'),
                   js=US_JS + " return {rel:a.map(x=>x.id+':'+x.level), contact:['classmate_peishan','heroine_04'].map(id=>INV.hasContact?INV.hasContact(G,id):null)};")
    info = await pg.evaluate(US_INFO)
    run.check('%s：讀檔以後在美國（STORY.abroad）、手機時間＝當地（tzOffset −13）' % tag, info['abroad'] is True and info['tz'] == -13, J({'info': info, 'r': r}))
    loc = lambda tw: tw - 13
    if case == 'neg':
        await wait_h(pg, cdp, run, '2028-11-08', 10.5, ENVI('US_WAIT', 600), tag + '_wait')
        M = await pg.evaluate(MSG_OF, 'y4_us_ps_lesson')
        run.check('us_neg：沒有重新聯絡上沛珊＝當地 10:30（臺灣 23:30）還是沒有「今天第一次試教。」', not M, J(M)); return
    for who, tg, key, tw, want, opts, th in ((PS, 'y4_us_ps_lesson', '2028-11-08', 23 + 10 / 60, PS_LESSON, PS_OPTS, 'p:' + PS), (ZQ, 'y4_us_zq_level', '2028-11-10', 23 + 40 / 60, ZQ_LEVEL, ZQ_OPTS, 'p:' + ZQ)):
        if who == ZQ:
            s1 = await snap(pg)
            await jump(pg, cdp, run, s1, key, 10.5, zone='us_apartment', pos='keep', note='收到沛珊那幾則的進度；11/10 當地 10:30')
        got, M = await wait_msg(pg, cdp, run, tg, ENVI('US_WAIT', 600), '%s_%s' % (tag, who))
        hud = await pg.evaluate(HUD)
        run.check('%s：%s 臺灣 %02d:%02d＝當地 %02d:%02d，%s %s＋回覆 %s' % (tag, key, int(tw), round(tw % 1 * 60), int(loc(tw)), round(loc(tw) % 1 * 60), who, J(want), J([o[0] for o in opts])),
                  got and [m['text'] for m in M] == want and all(m['from'] == who for m in M) and M[0]['day'] == key and abs(M[0]['h'] - loc(tw)) < 0.05 and M[-1]['opts'] == [o[0] for o in opts], J({'M': M, 'hud': hud}))
        if not got: continue
        a = await answer(pg, cdp, run, ('eq', tg + '_ask'), opts[0][0], '%s_%s' % (tag, who))
        await play(pg, cdp, run, "(([th,t])=>(GAME.G.msgs||[]).some(m=>m&&(PHONE.th?PHONE.th(m):m.th)===th&&m.text===t))(%s)" % J([th, opts[0][1]]), max_s=60, ff=False, tag='%s_%s_reply' % (tag, who))
        ts = await thread_shot(pg, cdp, run, th, '%s_%s_thread' % (tag, who))
        hm = '%02d:%02d' % (int(loc(tw)), round(loc(tw) % 1 * 60))
        run.check('%s：點「%s」→ %s「%s」；手機對話裡那幾則的時間寫當地的 %s（HUD %s）' % (tag, opts[0][0], who, opts[0][1], hm, hud.get('clock')),
                  bool(a) and a['tapped'] == opts[0][0] and opts[0][1] in ts['text'] and hm in ts['text'], J({'a': a, 'thread': ts['text'][-400:]}))


async def m_usmsg(pg, cdp, run):
    for c in ENV('USM', 'pos,neg'):
        if c not in ('pos', 'neg'): run.check('USM＝%s 認得' % c, False, 'pos,neg'); continue
        run.note('==== usmsg：%s ====' % c)
        try: await us_case(pg, cdp, run, c)
        except Exception as ex: run.check('usmsg %s：跑完（沒有探針例外）' % c, False, repr(ex)[:400]); traceback.print_exc()


# ================================================================ 8. casenotes：朋友的案子手機筆記
C2_MSG = ['我幫一個出版社翻了一篇短文，對方說「先試譯，不付錢」。', '可是他們拿去用了。……這樣正常嗎。']
C2_NOTE = ['誰：芷若', '向誰：出版社', '依據什麼：', '請求什麼：照用的部分付稿費，或不要用']
C2_PICK = '妳先把你們的對話拍給我看。'
C2_REPLY = ['📷（對話的截圖）', '📷（對話的截圖，往上滑的那一段）', '……好。我整理一下。']
C3_NOTE = [('手機筆記', '誰：阿哲的學長'), ('手機筆記', '向誰：房東'), ('手機筆記', '依據什麼：')]
C3_B = '「先把租約和搬進來的照片給我看。」'
C3_A = '「退押金，牆要補就扣合理的錢。」'


async def cn_c2(pg, cdp, run):
    st, d = await state_at(pg, '2026-11-11', 21.92, 'dorm')
    r = await load(pg, cdp, run, st, 'c2：最小存檔 2026-11-11（三，大二上）21:55 宿舍', js="NOKX(); const r=LV('heroine_02',25,10,5); return {r, h:(typeof R3!=='undefined'&&R3.zrHour)?R3.zrHour(G):null};")
    got, M = await wait_msg(pg, cdp, run, 'r3_zr_fee', ENVI('VF_WAIT', 600), 'c2_wait')
    run.check('c2：芷若（R3.zrHour＝%s）兩則 %s＋回覆鍵' % (r and r.get('h'), J(C2_MSG)), got and [m['text'] for m in M] == C2_MSG and M[0]['from'] == ZR and M[-1]['opts'] and M[-1]['opts'][0] == C2_PICK, J(M))
    if not got: return
    a = await answer(pg, cdp, run, ('eq', 'r3_zr_fee'), C2_PICK, 'c2', note=True)
    nb = (a or {}).get('note') or []
    cells = nb[0]['lines'][1:] if nb and nb[0]['lines'][:1] == ['手機筆記'] else (nb[0]['lines'] if nb else [])
    run.note('c2：手機筆記（DOM）%s' % J(nb))
    run.check('c2：手機打開芷若的對話：回覆鍵上面「手機筆記」四格 %s（讀畫面上的字；在回覆鍵上面）' % J(C2_NOTE), len(nb) == 1 and nb[0]['lines'][:1] == ['手機筆記'] and cells == C2_NOTE and nb[0]['above'], J(nb))
    await play(pg, cdp, run, "(t=>(GAME.G.msgs||[]).some(m=>m&&(PHONE.th?PHONE.th(m):m.th)==='p:heroine_02'&&m.text===t))(%s)" % J(C2_REPLY[-1]), max_s=60, ff=False, tag='c2_reply')
    th = await pg.evaluate(THREAD, 'p:' + ZR)
    run.check('c2：點「%s」→ 芷若 %s' % (C2_PICK, J(C2_REPLY)), bool(a) and a['tapped'] == C2_PICK and all(any(x[1] == t for x in th) for t in C2_REPLY), J({'a': {k: a.get(k) for k in ('tapped', 'opts')} if a else None, 'thread': th[-6:]}))
    await thread_shot(pg, cdp, run, 'p:' + ZR, 'c2_thread_after')


async def cn_c3(pg, cdp, run):
    st, d = await state_at(pg, '2027-03-23', 17.58, 'dorm')
    r = await load(pg, cdp, run, st, 'c3：最小存檔 2027-03-23（二，大二下第 5 週）17:35 宿舍', js="NOKX(); const r=LV('zhe',45,30,10); return {r, dep:(typeof Y2R2!=='undefined'&&Y2R2.depDay)?Y2R2.depDay(G):null};")
    run.check('c3：那天是押金那一天（Y2R2.depDay）、阿哲朋友', bool(r) and r.get('dep') is True, J(r))
    n0 = await pl_len(pg)
    gp = await go_place(pg, cdp, run, 'noodle')
    ok = await play(pg, cdp, run, EVDONE % J('ev_zhe_deposit'), max_s=ENVI('CN_MAX', 600), picks=[C3_B, C3_A], ff=False, tag='c3', shot_choice=['先把租約', '全部退'], shots_at=['誰：阿哲的學長', '依據什麼：', '請求什麼：'])
    R = await rows(pg, n0); Ls = said(R)
    okq, gl, i0 = after(Ls, ('', '（你打開手機的筆記，先寫了兩行：誰——阿哲的學長；向誰——房東。）'), C3_NOTE)
    ib = next((k for k, x in enumerate(R) if x['k'] == 'say' and x['n'] == '手機筆記' and x['t'] == '依據什麼：'), None)
    ia = next((k for k, x in enumerate(R) if x['k'] == 'say' and x['n'] == '手機筆記' and x['t'] == '請求什麼：'), None)
    cb = next((x for x in R[ib + 1:] if x['k'] in ('say', 'choose')), None) if ib is not None else None
    ca = next((x for x in R[ia + 1:] if x['k'] in ('say', 'choose')), None) if ia is not None else None
    run.note('c3：麵店說的 %s；選單 %s' % (J(Ls[:30])[:2200], J([x['t'] for x in R if x['k'] == 'choose'])))
    run.check('c3：手機「地點」→ 阿鳳麵店 → 學長的押金：旁白以後「手機筆記」說「誰：阿哲的學長」「向誰：房東」「依據什麼：」→ 緊接著依據的選項（截圖）', gp['ok'] and ok and okq and bool(cb) and cb['k'] == 'choose' and C3_B in cb['t'],
              J({'got': gl, 'next': cb}))
    run.check('c3：「請求什麼：」（說話人手機筆記）→ 緊接著請求的選項「「全部退。」」「%s」（截圖）' % C3_A, ia is not None and bool(ca) and ca['k'] == 'choose' and C3_A in ca['t'], J({'next': ca}))
    await run.shot(pg, 'c3_end')


async def m_casenotes(pg, cdp, run):
    for c in ENV('CN', 'c2,c3'):
        fn = {'c2': cn_c2, 'c3': cn_c3}.get(c)
        if not fn: run.check('CN＝%s 認得' % c, False, 'c2,c3'); continue
        run.note('==== casenotes：%s ====' % c)
        try: await fn(pg, cdp, run)
        except Exception as ex: run.check('casenotes %s：跑完（沒有探針例外）' % c, False, repr(ex)[:400]); traceback.print_exc()


# ================================================================ main
MODEFN = {'sisface': m_sisface, 'anyt': m_anyt, 'cg20': m_cg20, 'y1show': m_y1show, 'xclove': m_xclove, 'sisnewyear': m_sisnewyear, 'usmsg': m_usmsg, 'casenotes': m_casenotes}


async def main():
    run = L.Run('fb1101_' + '+'.join(MODES), OUT); os.makedirs(OUT, exist_ok=True)
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
