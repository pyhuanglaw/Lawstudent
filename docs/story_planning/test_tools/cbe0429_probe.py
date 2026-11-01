"""BB-B 11-01：開發分支 cbe655915（LAWWW-B 合進來的 merge-1101 那一批：AA_556 寒暑假第二批、AA_553 成績出來以後、學姊第二次傳書、AA_555 同行聊天與手機小事、
AA_407 R1 總圖服務台、AA_143 2-7 大二下期末最後一頓、AA_258 6-1 大二下家族聚餐）——照玩家在畫面上看、按、截圖。一支用 MODE 分（逗號隔開可以一次跑好幾個，每個 MODE 開一個新的瀏覽器）。
不是 iPhone：Playwright 手機橫向模擬（SwiftShader，2～4 fps）。URL 用 '<URL>/index.html?turbo'（同 post91015_probe、vac_probe）。
存檔：預設「最小存檔」（GAME.defaults＋過了開場的旗標，同 post91015_probe 的 state_at；日子過了就補 ROOM_Y2／Y3／Y4；去過的地方 visited 補麵店、Café、總圖、公館…手機「地點」才按得到）；
  給第三個參數（或環境變數 SAVE＝使用者存檔.json）＝改用使用者存檔改日期。
每一個讀檔、同一份進度跳日子都印 [前置]；讀檔後用遊戲 API 補的（關係、群組、成績、作息的替身）另外寫【捷徑】。之後照玩家：點對話、選選項、按床「快轉」→「到下一個有事的日子／時候」、
  手機「活動」「地點」「朋友」「訊息」「今天」、在對話裡點回覆鍵、「出發：」「上線：」「接起來：」、出境大廳走到「登機」、走到人旁邊「和〈他〉說話」、走到「服務台」按下去；
  手機自己打開（D103）而且沒有要點的選項＝按「收起來／跳過」（L.phone_away(..., tries=1)）。
台詞全部用 GAME.say 的原文（HOOK 記 [名字, 句子, 日期, 時間]）；選單用 GAME.choose；2D 背景用 ADV.begin、ADV.setBg；地點字幕、同行聊天用 GAME.caption；日期卡 GAME.titleCard；提示 GAME.toast＋#toast。
旁白的名字＝''（GAME.say(null,…)）。

MODE：
  vac2      AA_556 寒暑假第二批（src/vacfill3d.js、src/data/vacfill_events.js VACFILL_LINES2、src/vac3d.js trip13、src/data/vac_activities.js）。VAC2＝c13,c10,c11,kai624,kai711,yt813,xc212,xcneg（預設全部）
            c13     自己排的出國（C13）中間那天。C13＝jp,eu,kai@kr,yu@th（預設：自己去日本、歐洲；和阿凱去韓國、和 Alison 去泰國）；all＝七個目的地自己去＋五位朋友各一次（目的地 C13_FRIEND_DEST，預設 kr）。
                    [前置] 先讀一份最小存檔，只為了在頁面裡讀 HOME.breakOf／VAC.friendNo 挑出發日 d（寒暑假裡、d−3 也在同一個假期、朋友那幾天都在臺北、沒有活動卡）；
                    再讀最小存檔 d−3 10:00 宿舍（【捷徑】朋友熟 25＝有點熟）→ 手機「活動」→ 出國旅遊「安排」→ 目的地 →「3 天」（歐洲、美國「7 天」）→ 第一個出發日 →「自己去」／「和〈朋友〉」
                    → 床「快轉」到出發 →「出發：出國旅遊：…」→ 出境大廳走到「登機」→ 整趟照演。
                    PASS：中間那天（行程的中間日 14:00）目的地第二句後面「緊接著」當地的一段（旁白、當地的人一句〈站務員／大學生／司機／老闆娘／阿姐／老太太／服務生〉、旁白）／朋友的一段
                          （朋友兩句；Alison 第二句是旁白）；第一天 15:00 第一句、最後一晚 20:00 第三句（和朋友去＝後面接朋友那一句照舊）；自己去沒有朋友的一段、和朋友去沒有當地的一段。背景：深色底（S.key bg null）＋日期卡地點（照記）。
            c10     加州暑期課（C10）三場：[前置] 最小存檔大二下第 10 週週一 10:00 → 手機「活動」「報名」C10@Y2 →（排好 2027-06-21 07:00 出發）→ [前置] 同一份進度跳到 6/21 出發提示前 →「出發：」→ 登機 → 整趟。
                    PASS：07-04 21:00 煙火（bg intl_ca_beach；選項「「Taiwan has New Year fireworks.」」「（安靜看煙火）」）、07-15 16:00 讀書小組（bg intl_ca_classroom；同學、祐廷「Then the bar.」）、
                          07-24 20:00 晚餐（bg intl_ca_classroom；選項「「Come to Taiwan.」」「「Maybe.」」）照稿、照順序（第一次報告 → 煙火 → 週末 → 讀書小組 → 晚餐 → 期末考）。C10_ALT＝1 選第二個選項。
            c11     東京短期課程（C11）兩場：[前置] 最小存檔大二上第 5 週週一 10:00 → 手機「報名」C11@Y2 → [前置] 跳到隔天 19:25 →「出發：…寫申請書」（VAC_C11_APP）→ [前置] 跳到 2027-01-17 出發提示前（第 8 週的甄審通知照時間補收）→ 出發 → 登機 → 整趟。
                    PASS：01-20 07:40 便利商店（bg intl_tokyo_classroom；不認識以安＝同團的學生＋選項「「要啊。書在行李箱裡。」」「「這就是在念書。」」；C11_AN＝1 認識以安＝她兩句、沒有那題選項）、
                          01-26 15:00 自由活動（bg intl_tokyo_shotengai；「舊書店街」「錢湯」）照稿、照順序。C11_ALT＝1 選第二個選項。
            kai624  大一暑假 6/24：[前置] 最小存檔 2026-06-24 20:50 宿舍（【捷徑】阿凱熟 25）→ 21:00 阿凱私訊兩則＋「我也來打。」→ 在對話點「我也來打。」→ 阿凱「所以今晚 線上」→ 22:00 前「上線：和阿凱打遊戲（線上）」
                    PASS：線上語音六句照稿（背景 dorm_desk、字幕「線上」）、對話串裡沒有舊旁白「打到兩點」、演完約 02:00（hours 4）。
            kai711  大二暑假：[前置] 2027-07-10 19:50 宿舍（阿凱熟 45／信任 30＝朋友）→ 20:00 私訊三則（不加句號）＋「好。」→ 點「好。」→ 排 7/11 15:00 → 床快轉 →「出發：溫州街的冰店」
                    PASS：旁白、阿凱一句、選項「「開一張新的表。」」「「好吃就寫進去。」」、阿凱回那一句（KAI711_PICK＝b 選第二個）；背景還沒有溫州街的 2D 圖＝'dark'＋字幕「溫州街的冰店」（照記）。
            yt813   大二暑假：[前置] 2027-08-12 20:50（語彤熟 25）→ 21:00 私訊兩則＋「好。」→ 排 8/13 16:00 →「出發：公館的修鞋店」→ 旁白、老闆、旁白兩句、語彤兩句（bg gongguan）；記憶 FIELD_WITH_YT。
            xc212   大二寒假：[前置] 2027-02-11 20:50（芯慈熟 25）→ 21:00 私訊兩則＋「好。」→ 排 2/12 10:00 →「出發：永和的豆漿店」→ 旁白、芯慈、選項「「事務所開工忙嗎？」」「「妳寒假都在幫忙？」」、芯慈回（bg soymilk_shop）。
            xcneg   芯慈那一則不傳的情形。XCNEG＝presence,trip,level（預設 presence,trip）：
                    presence  characters.js 芯慈的 presence 是 {from:'Y1S1'}（永遠在臺北），玩家碰不到「她那天不在臺北」——【捷徑】頁面裡把 STORY.presence 包一層（只有芯慈、只有 2/12＝不在臺北），2/11 20:50 等到 21:15：沒有那一則；等完還原。
                    trip      [前置] 2027-02-09 10:00（芯慈熟 25）→ 手機排出國：日本 3 天、2/12 出發、自己去（玩家操作）→ [前置] 同一份進度跳到 2/11 20:50 → 等到 21:15：沒有那一則（祐廷 2/12 不在臺灣）。
                    level     [前置] 2/11 20:50、芯慈只是認識（熟 10）→ 沒有那一則。
  grades    AA_553 成績出來以後（src/grades3d.js、events.js ev_kexin_grades_open）。GR_CASES＝high,fail（預設；也可以 mid、low），每一個級別一份讀檔：
            [前置] 最小存檔 2026-01-04 22:00 宿舍、和可昕交往、KX_GRADES_PACT_SET（說好一起看）；【捷徑】大一上每一科法律課期末答對 5 題（fail＝第一科 0 題）、看出席的課 3 堂；子晴、阿凱朋友（熟 45／信任 30）、
            GR_FACE 那幾位有點熟（熟 25）。→ 床「快轉」→ 1/5 早上「大一上的成績出來了。」→「等五號一起看。」→ 21:00「接起來：可昕的視訊：一起打開成績」→ 那一段 → 成績單；21:00 子晴、阿凱的私訊（手機打開截圖）。
            PASS：可昕照級別（high「……你偷念。」「好，這次才是真的放假。」「你請。」；fail「……有一科沒過。」「好。下學期那一科，我陪你念。」且沒有任何一句含「都過了」）；子晴、阿凱 21:00 照級別的句子。
            當面（GR_FACE＝heroine_05,heroine_02,classmate_peishan,classmate_mingxuan,npc_fangyt，只跑第一個不是 fail 的級別；GR_FACE_FAIL 給 fail 那一份）：頁面裡讀 STORY.schedEnt／presence 挑 1/6～3/15 他在哪一區（芷若一定要 Café），
            [前置] 同一份進度跳到那個時間那一區 → 走到旁邊「和〈他〉說話」→ 第一次說話先演成績那一段（學姊、明軒選「很好。」；沛珊選「全部。」）。芷若在吧檯上班時說話＝點餐（照記：成績那句沒出來就 FAIL 並寫原因）。
  sisbooks2 學姊第二次傳書（src/sisbooks2_3d.js）。SB2＝friend（預設；也可以 fam、dating）：[前置] 2026-09-05 16:55 宿舍、SIS_OLD_BOOKS、met_sis、【捷徑】學姊 friend 熟 45／信任 30（fam 25；dating 交往中）
            → 17:05 私訊（手機收到、在對話點第一個回覆）→ 床快轉 → 9/6 搬房間（拿出紙箱的東西）→ 管理室的一箱書（ev_sis_books_y2s1）→ 9/7 第一堂行政法（起床選單「直接去上課：行政法」或手機「今天」的「直接去上課」）。
            PASS：私訊照稿、17:05；回覆照稿；拆完箱子以後才演書箱那幾句（friend 多兩句舊法典；dating 是書瑀在管理室前面）、記 SIS_OLD_BOOKS_2（SIS_OLD_CODE）；行政法課裡兩句旁白、只一次。
  walkchat  AA_555：同行聊天（INVITE_DATA.people[id].walk 的 w118_*）＋手機小事（src/aa555_3d.js）。WC_WHO＝yu,classmate_bohan,classmate_xinci（預設；第一次有同行聊天的三位）：
            [前置] 頁面裡讀作息挑大一上第 6～8 週他在哪一區（不是上課；總圖、Café、麵店優先）→ 最小存檔那個時間那一區（【捷徑】朋友：熟 45／信任 30）→ 走到旁邊「和〈他〉說話」→「約他去…」→ 地點（頁面裡先讀 INV.walkPick 挑一個說得出話的、不是他現在那一區的）→「現在一起過去」
            → 他跟著走、6 秒以後字幕一句。PASS：字幕照 walkPick 那一句、名字對、記 walkSaid 的 w118_ 鍵。
            WC_PHONE＝1（預設）：讀 AA555.DP／AT 的數量（只讀；約 85 則）＋[前置] 大一上第 5 週週一 21:30（六位都有聯絡方式、加入法一吃飯）床快轉 WC_DAYS（預設 7）天，收到的 a118 手機小事逐則對稿（DP.items／AT 的訊息）。
  libdesk   AA_407 R1（dfe02e51d）：[前置] 大二上第 12 週週五 10:00 總圖大廳（【捷徑】方奕廷有點熟）→ 走到「服務台」：沒有「借《臺灣原生植物圖鑑》」（控制組）
            → [前置] 同一份進度跳到第 12 週週日 20:50 宿舍 → 21:00「這週的訊息」→ 方奕廷那一則點「總圖五樓最裡面。」→ [前置] 跳到隔天 10:00 總圖大廳 → 服務台多「借《臺灣原生植物圖鑑》」→ 館員「那本只能在館內看。」→ 再到服務台：那一項沒了。
  y2end     Y2END＝lastmeal,famdinner（預設全部）
            lastmeal  AA_143 2-7：[前置] 最小存檔 2027-06-01（【捷徑】麵店團成立 noodleTableDay、加入法一吃飯、頁面裡讀 CLS.lastExamEnd）→ [前置] 跳到最後一科考完那天 16:50 宿舍 → 17:00 阿哲「考完了 七點，麵店」→ 手機「地點」→ 阿鳳麵店
                      → 旁白「（大二下最後一科考完。）」、阿姨「明年你們大三了。……我記得你們大一的樣子。」
            famdinner AA_258 6-1：[前置] 2027-03-09 20:50 宿舍（【捷徑】加入家族群組、學姊有點熟）→ 21:00 家族群組 Kevin 兩則＋學姊「好。」→ [前置] 同一份進度跳到 3/12 18:10 宿舍（學期中快轉不會為了別區的事件停：見報告）
                      → 提示「今天 19:00 家族聚餐（公館）」→ 手機「地點」→ 公館 → 18:30 以後旁白、Kevin 學長、學姊「……坐。我坐下來你們再坐。」、旁白。
用法：LW_TESTS=<工作樹>/tests SHA=<sha> MODE=<mode>[,<mode>...] python3 cbe0429_probe.py '<URL>/index.html?turbo' <輸出資料夾> [使用者存檔.json]
等待上限都可以用環境變數改：C13_MAX、C10_MAX、C11_MAX、VF_WAIT、VF_MAX、GR_MAX、SB2_MAX、WALK_WAIT、WC_MAX、LIB_WAIT、Y2_MAX（秒）。"""
import os, sys, json, asyncio, re, math, time, copy, traceback
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__))); import bbplay as P
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
SAVEF = sys.argv[3] if len(sys.argv) > 3 else os.environ.get('SAVE')
SAVE = None
if SAVEF:
    SAVE = json.load(open(SAVEF, encoding='utf-8')); SAVE = SAVE.get('G', SAVE)
MODES = [m.strip() for m in os.environ.get('MODE', 'vac2').split(',') if m.strip()]
J = lambda o: json.dumps(o, ensure_ascii=False)
ENV = lambda k, d: [x.strip() for x in os.environ.get(k, d).split(',') if x.strip()]
ENVI = lambda k, d: int(os.environ.get(k, str(d)))

# ---------------------------------------------------------------- 存檔（post91015_probe.py 的做法）
BASEF = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True, 'metAn': True, 'met_an': True, 'MET_ZHE': True,
         'zheNoodleDone': True, 'KX_FIRST_MSG': True, 'KX_EVE_MSG': True, 'FAM_GROUP_SENT': True, 'CEREMONY_Y1': True, 'KAI_MOVEIN': True, 'LAW_RECAP_SEEN': True,
         'fundsV2': 1, 'KX_DEC3_MIGRATED': True, 'dating_kexin': False}   # 法律系、過了開場（flow_vac_hometown BASE＋zrlast y1min）；GAME.defaults 的 dating_kexin:true 拿掉
ROOMS = (('ROOM_Y2', '2026-09-06'), ('ROOM_Y3', '2027-09-05'), ('ROOM_Y4', '2028-09-03'))
VISITED = ('noodle', 'cafe', 'library_hall', 'library', 'lawlib', 'wancai', 'linze', 'gongguan', 'wenzhou', 'soclib', 'cvs', 'bookstore')   # 去過＝手機「地點」有「前往」（game3d.js placeState）

JSENV = """(()=>{ const G=GAME.G, F=G.flags, D=k=>STORY.dayOfKey(k);
  const LV=(id,f,t,c,o)=>{ const r=SOCIAL.rel(id); r.fam=f; r.trust=t||0; r.comf=c||0; if(o) Object.assign(r,o); SOCIAL.remember(id,'FIRST_MET',''); G.contacts=G.contacts||{}; if(G.contacts[id]==null) G.contacts[id]=G.day-30;
    return {id,fam:r.fam,trust:r.trust,comf:r.comf,npcRom:r.npcRom|0,rom:r.rom|0,stage:SOCIAL.stage(id),level:SOCIAL.friendLevel?SOCIAL.friendLevel(id):null}; };
  const NOKX=()=>{ F.dating_kexin=false; if(F.romance) delete F.romance.kexin; F.ROMANCE_HISTORY=(F.ROMANCE_HISTORY||[]).filter(r=>r&&r.id!=='kexin'); delete F.DATED_1_kexin; delete F.KX_TOUR_YES; };
  const JOIN=(g,n)=>{ PHONE.join(G,g,n); return PHONE.inGroup(G,g); };
  __BODY__ })()"""


async def state_at(pg, key, h, zone, flags=None, pos=None, weather='clear', money=30000):
    """法律系的存檔：最小存檔（或使用者存檔）改到那一天、那個時間、那一區；key 可以是 'YYYY-MM-DD' 或 [學期, 週, 星期]"""
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


# ---------------------------------------------------------------- 記錄（GAME.say、選項、ADV 背景、換背景、字幕、日期卡、提示）
HOOK = r"""(()=>{ if(window.__PLH) return 'again'; window.__PLH=1; window.__PL=[];
  const at=()=>{ try{ return {d:CALENDAR.dateOf(GAME.G.day).key, h:+(+GAME.G.hour).toFixed(3), z:GAME.G.zone}; }catch(e){ return {}; } };
  const push=o=>{ try{ Object.assign(o,at()); window.__PL.push(o); if(window.__PL.length>8000) window.__PL.splice(0,2000); }catch(e){} return o; };
  const bgs=b=>typeof b==='string'?b:JSON.stringify(b||null);
  const s0=GAME.say; GAME.say=function(w,t){ push({k:'say',n:(w&&w.name)||(typeof w==='string'?w:''),c:(w&&w.charId)||null,t:String(t==null?'':t)}); return s0.apply(this,arguments); };
  const c0=GAME.choose; GAME.choose=function(o){ push({k:'choose',n:'',t:(o||[]).map(x=>x&&(x.t||x.text)||'').join('｜')}); return c0.apply(this,arguments); };
  if(typeof ADV!=='undefined'&&ADV.begin){ const b0=ADV.begin; ADV.begin=function(o){ push({k:'bg',n:'begin',t:bgs(o&&o.background)}); return b0.apply(this,arguments); }; }
  if(typeof ADV!=='undefined'&&ADV.setBg){ const g0=ADV.setBg; ADV.setBg=function(b){ push({k:'bg',n:'setBg',t:bgs(b)}); return g0.apply(this,arguments); }; }
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


def seq_in(lines, want):
    """want（[(名字或 None／名字的集合, 句子)]）照順序出現在 lines（[[名字, 句子]]）；回傳對到幾句"""
    i = 0
    for n, t in lines:
        if i < len(want) and t == want[i][1] and name_ok(want[i][0], n): i += 1
    return i


def after(lines, first, nxt):
    """lines 裡第一個 first（(名字, 句子)）後面「緊接著」是不是 nxt 那幾句；回傳 (ok, 實際那幾句, first 在第幾句)"""
    for i, (n, t) in enumerate(lines):
        if t == first[1] and name_ok(first[0], n):
            got = lines[i + 1:i + 1 + len(nxt)]
            ok = len(got) == len(nxt) and all(g[1] == w[1] and name_ok(w[0], g[0]) for g, w in zip(got, nxt))
            return ok, got, i
    return False, None, None


def sub(want, who_names):
    """台詞表裡的 '@' 換成那個人的名字集合"""
    return [(who_names if n == '@' else n, t) for n, t in want]


def row_of(R, text, k='say'):
    return next((r for r in R if r['k'] == k and r['t'] == text), None)


def bg_before(R, row):
    """這一句以前最後一次的 2D 背景（ADV.begin／ADV.setBg）"""
    if not row: return None
    i = R.index(row); b = None
    for r in R[:i]:
        if r['k'] == 'bg': b = r['t']
    return b


def cap_near(R, row, span=6):
    """這一句前後的地點字幕（GAME.caption 名字空白的那幾個）"""
    if not row: return []
    i = R.index(row)
    return [r['t'] for r in R[max(0, i - span):i + 2] if r['k'] == 'cap' and not r['n']]


# ---------------------------------------------------------------- 照玩家操作
DECL = ('晚一點', '不去了', '自己走過去', '先不', '不用了', '算了', '就這樣', '先這樣', '沒事', '「我晚上要念書。」', '「那天我有事。」', '「我也要念書。」', '「我週六有事。」')
FF_OPTS = ('到下一個有事的日子', '到下一個有事的時候')
GO_PREFIX = ('出發：', '直接過去：', '接起來：', '上線：')


def pick_opt(ch, picks=(), ff=True):
    """選哪一個：picks（開頭符合、或包含；照順序）→ 快轉（到下一個有事的日子／時候）→ 床的選單（快轉，不快轉就睡）→ 起床選單「先起床」→ 婉拒那一類 → 第一個不是「出發：」那一類的"""
    T = [o['t'] for o in ch]; live = [i for i, o in enumerate(ch) if not o['dim']] or list(range(len(ch)))
    for p in picks or ():
        for i in live:
            if T[i].startswith(p) or (len(p) >= 4 and p in T[i]): return i, 'pick'
    if ff:
        for i in live:
            if T[i].startswith(FF_OPTS): return i, 'ff'
    if any(t.startswith(('再撐一下', '先不睡')) for t in T) or (any(t.startswith('睡覺') for t in T) and any(t.startswith('快轉') for t in T)):   # 床、家裡的選單
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
        if s['zone'] == zone and not s['busy']: return {'ok': True}
    return {'ok': (await P.ts(pg))['zone'] == zone, 'why': 'timeout'}


async def to_dorm(pg, cdp, run):
    r = await go_place(pg, cdp, run, 'dorm', 90)
    return r['ok']


async def board(pg, cdp, run, tag):
    """出境大廳（E08）：走到安檢入口「登機」、按下去"""
    it = await L.find_it(pg, '登機')
    if not it: return None
    await L.go_to(pg, cdp, run, it['x'], it['z'], 1.1, it['label'], max_s=150, lv=it['lv'], stop=lambda s: s['interact'].startswith('登機'))
    await run.shot(pg, tag + '_airport')
    await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(2500)
    return it['label']


async def play(pg, cdp, run, until_js=None, max_s=1800, picks=(), tag='', ff=True, on_phone=None, shots_at=(), shots_first=0, card_watch=None, on_idle=None):
    """照玩家過日子：對話點過去、選項照 pick_opt、手機自己打開（D103）就收起來（on_phone 先看要不要回）、出境大廳走到「登機」、空下來先問 on_idle、再去床「快轉」（ff）；
    約好的事、該出發的出遊 1.5 小時內就站著等（不快轉跳過）。shots_at＝對話框出現這幾句（包含）就截圖；shots_first＝最先出現的幾句截圖。回傳 until_js 是否成立"""
    t0 = time.time(); idle = 0; last = None; same = 0; waited = None; pend = list(shots_at); nfirst = 0; card_done = False; air = 0
    while time.time() - t0 < max_s:
        if card_watch and not card_done and await pg.evaluate(CARD_ON, card_watch[0]):
            await run.shot(pg, card_watch[1]); card_done = True
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
        if s['zone'] == 'airport_dep':   # 出境大廳：走到「登機」按（三次都沒登機就站著等：進大廳一小時以後自動登機）
            if air < 3:
                air += 1; b = await board(pg, cdp, run, '%s_board%d' % (tag, air)); run.note('%s：出境大廳，走到「登機」按下去（第 %d 次）：%s' % (tag, air, b))
                await pg.wait_for_timeout(2500); idle = 0; continue
            await pg.wait_for_timeout(2000); continue
        idle += 1
        if on_idle and await on_idle(): idle = 0; continue
        if idle < 3 or not ff: await pg.wait_for_timeout(1500); continue
        if await pg.evaluate("!!(typeof HOME!=='undefined'&&HOME.at&&HOME.at(GAME.G))"): await pg.wait_for_timeout(1500); continue   # 在家：選單會自己出來
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


async def wait_menu(pg, cdp, pred, max_s=90):
    """等選單：對話點過去、手機收起來；pred(選項文字) 成立就回傳選單。別的選單（起床、確認）照婉拒那一類選"""
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


async def answer(pg, cdp, run, how, label, tag):
    """手機：那一則有選項的訊息（how＝('eq'|'suffix'|'prefix', 字)）→ 打開那個對話 → 點開頭是 label 的回覆鍵"""
    m = await pg.evaluate(FIND_ASK, list(how))
    if not m: return None
    await P.phone_thread(pg, cdp, m['th'], open_folds=False); await run.shot(pg, tag + '_ask')
    opts = await pg.evaluate("id=>[...document.querySelectorAll('#phoneBody [data-ask]')].filter(x=>(x.dataset.ask||'').startsWith(id+'|')).map(x=>(x.textContent||'').trim())", m['id'])
    b = await pg.evaluate("([id,lab])=>{ const e=[...document.querySelectorAll('#phoneBody [data-ask]')].find(x=>(x.dataset.ask||'').startsWith(id+'|')&&(x.textContent||'').trim().startsWith(lab)); if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2,(e.textContent||'').trim()]; }", [m['id'], label])
    if b:
        await L.touch_tap(cdp, b[0], b[1]); await pg.wait_for_timeout(1800); await run.shot(pg, tag + '_answered')
    await L.close_panels(pg, cdp)
    return {'id': m['id'], 'th': m['th'], 'opts': opts, 'data_opts': m['opts'], 'tapped': b[2] if b else None}


MSG_HAS = "(tag=>(GAME.G.msgs||[]).some(m=>m&&m.tag===tag))(%s)"
MSG_OF = """(tag=>(GAME.G.msgs||[]).filter(m=>m&&m.tag===tag).map(m=>({text:String(m.text||''),from:m.from||null,name:m.name||null,th:(PHONE.th?PHONE.th(m):m.th),
  day:CALENDAR.dateOf(m.day).key,h:m.h!=null?+(+m.h).toFixed(3):null,opts:m.ask?(m.ask.opts||[]).map(o=>o.t):null})))"""
THREAD = """(th=>(GAME.G.msgs||[]).filter(m=>m&&(PHONE.th?PHONE.th(m):m.th)===th).map(m=>[m.from||'',String(m.text||''),CALENDAR.dateOf(m.day).key,m.h!=null?+(+m.h).toFixed(2):null,m.tag||null]))"""
OUTQ = """(id=>{ const q=OUT.get(GAME.G,id); return q?{id:q.id,day:CALENDAR.dateOf(q.day).key,h:+(+q.h).toFixed(3),state:q.state,ev:q.ev||null,title:q.title||null,call:!!q.call,verb:q.verb||null,place:q.place||null,travelH:q.travelH||0}:null; })"""
EVDONE = "(id=>!!((GAME.G.events||{}).done||{})[id])(%s)"
VACROWS = "(()=>[...document.querySelectorAll('#phoneBody .item.phrow')].map(e=>({t:(e.innerText||'').replace(/\\s+/g,' ').trim().slice(0,160), vac:(e.querySelector('[data-vac]')||{dataset:{}}).dataset.vac||null})))()"
PRES_AT = """(([id,k])=>{ const d=STORY.dayOfKey(k); const g=Object.assign({},GAME.G,{day:d,hour:12,weekday:CALENDAR.dateOf(d).wd%7}); try{ return STORY.presence(id,g); }catch(e){ return 'ERR '+e.message; } })"""


async def wait_msg(pg, cdp, run, tag, max_s, label):
    ok = await play(pg, cdp, run, MSG_HAS % J(tag), max_s=max_s, ff=False, tag=label)
    return ok, await pg.evaluate(MSG_OF, tag)


# ================================================================ 1. vac2：寒暑假第二批
LOCAL13 = {
    'jp': [('', '（你問站務員怎麼轉車。他拿出一張紙，畫了一張很醜的地圖。）'), ('站務員', 'まっすぐ。……まっすぐ。'), ('', '（他比了三次直走。你照著走，真的到了。）')],
    'kr': [('', '（租腳踏車的櫃台，大學生看了你的護照。）'), ('大學生', '謝謝。'), ('', '（他笑了一下，說他只會這一句中文。）')],
    'th': [('', '（嘟嘟車停紅燈。司機回頭。）'), ('司機', 'First time?'), ('', '（你點頭。他把音樂開大聲：「Welcome!」）')],
    'vn': [('', '（咖啡店的老闆娘端來一杯上面有一層蛋的咖啡。你看了很久。）'), ('老闆娘', 'Stir. Stir.'), ('', '（她比了一個攪拌的手勢。很甜。）')],
    'hk': [('', '（茶餐廳客滿。阿姐把你帶到一張已經坐了兩個人的桌子。）'), ('阿姐', '搭枱啊，坐。'), ('', '（對面的大叔把報紙收起來一半，讓出位子。）')],
    'eu': [('', '（火車上，對面的老太太問你從哪裡來。）'), ('老太太', 'Taiwan? ……Far.'), ('', '（她從包包拿出一顆蘋果，切了一半給你。）')],
    'us': [('', '（公路旁的餐廳。服務生第三次走過來。）'), ('服務生', 'Refill?'), ('', '（你的咖啡還是滿的。她還是幫你加了一點。）')]}
FRIEND13 = {'kai': [('@', '所以我們今天走了兩萬步。我的腳在抗議。'), ('@', '可是那家拉麵要排一個小時。……我還是要排。')],
            'zhe': [('@', '我們中午吃了三餐。早餐、早午餐、午餐。'), ('@', '……晚餐吃什麼？')],
            'yu': [('@', '你幫我拍一張。不對，蹲下來拍，這樣我比較高。'), ('', '（你蹲下來。她看了照片：「……好，你以後都這樣拍。」）')],
            'classmate_bohan': [('@', '今天的行程延誤了四十分鐘。'), ('@', '……可是你走錯路才找到那家店。很好吃。我寫進明天的行程了。')],
            'classmate_xinci': [('@', '每天花多少我都記在手機裡。今天超支一百二十塊。'), ('@', '……是那杯咖啡。值得。')]}
FRIEND_LAST = {'kai': '下次換你排行程。', 'zhe': '伴手禮要買到哪個時候。', 'yu': '我們拍一張合照啦。', 'classmate_bohan': '明天幾點的飛機？我算一下要幾點出門。', 'classmate_xinci': '我把明天的行程再看一次。'}
FALIAS = {'kai': 'kai', 'zhe': 'zhe', 'yu': 'yu', 'alison': 'yu', 'bohan': 'classmate_bohan', 'xinci': 'classmate_xinci', 'classmate_bohan': 'classmate_bohan', 'classmate_xinci': 'classmate_xinci'}
FIND13 = """(([dest,who,len,ka,kb])=>{ const DK=STORY.dayOfKey, a=DK(ka), b=DK(kb), De=VAC_DATA.TRAVEL.dest[dest]; if(!De) return {err:'no dest'}; const far=!!De.far, why=[];
  for(let d=a; d<=b; d++){ const B=HOME.breakOf(d), B0=HOME.breakOf(d-3); if(!B||!B0||B.key!==B0.key) continue; if(far&&B.kind!=='summer') continue; if(d+len-1>B.to||B.from>d-3) continue;
    if(who){ const g=Object.assign({},GAME.G,{day:d-3}); let no=null; try{ no=VAC.friendNo(g,who,d,d+len-1); }catch(e){ no='ERR '+e.message; } if(no){ if(why.length<4) why.push(CALENDAR.dateOf(d).key+'：'+no); continue; } }
    return {d, key:CALENDAR.dateOf(d).key, load:CALENDAR.dateOf(d-3).key, brk:B.key, skipped:why}; }
  return {err:'none', skipped:why}; })"""
REC13 = """(()=>{ const V=VAC.rec(GAME.G), T=V.t13||[], r=T[T.length-1]; if(!r) return null; const K=d=>CALENDAR.dateOf(d).key, mid=Math.floor((r.from+r.to)/2); const q=OUT.get(GAME.G,'vac_t13_'+r.n);
  return {n:r.n,dest:r.dest,with:r.with||null,gf:!!r.gf,from:K(r.from),to:K(r.to),mid:K(mid),last:K(r.to-1),fromD:r.from,midD:mid,lastD:r.to-1,done:!!r.done,q:q?{day:K(q.day),h:q.h,state:q.state,title:q.title}:null}; })()"""
EXP13 = """(([dest,f,m,l])=>{ const TV=VAC_DATA.TRAVEL, De=TV.dest[dest]; const ev=(x,d)=>{ const g=Object.assign({},GAME.G,{day:d}); return typeof x==='function'?x(g):x; };
  return {k0:ev(De.keys[0],f),k1:ev(De.keys[1],m),k2:ev(De.keys[2],l),name:De.name,local:(TV.local||{})[dest]||null,friendMid:TV.friendMid||null}; })"""


async def plan_trip(pg, cdp, run, dest, ln, who, tag, want_from=None):
    """手機「活動」→ 出國旅遊「安排」→ 目的地 →「N 天」→ 出發日（want_from＝'M/D'；沒給＝第一個）→「自己去」／「和〈朋友〉」。回傳每一層的選項、選了什麼、排出來的那一筆"""
    dname = await pg.evaluate("k=>VAC_DATA.TRAVEL.dest[k].name", dest)
    nm = await names_of(pg, who) if who else set()
    await P.phone_tab(pg, cdp, 'events'); await run.shot(pg, tag + '_events')
    if not await pg.evaluate("!!document.querySelector('#phoneBody [data-vac13]')"):
        rr = await pg.evaluate(VACROWS); await L.close_panels(pg, cdp); return {'ok': False, 'why': '手機「活動」沒有「安排」', 'rows': rr}
    await L.tap(pg, cdp, '#phoneBody [data-vac13]'); await pg.wait_for_timeout(1500)
    steps, picked = [], []
    ch = await wait_menu(pg, cdp, lambda T: dname in T, 40); steps.append([o['t'] for o in (ch or [])])
    if not ch or not await tap_prefix(pg, cdp, ch, dname): return {'ok': False, 'steps': steps}
    picked.append(dname); lab = '%d 天' % ln
    ch = await wait_menu(pg, cdp, lambda T: lab in T, 30); steps.append([o['t'] for o in (ch or [])])
    if not ch or not await tap_prefix(pg, cdp, ch, lab): return {'ok': False, 'steps': steps}
    picked.append(lab)
    ch = await wait_menu(pg, cdp, lambda T: any(' 出發（' in t for t in T), 30); steps.append([o['t'] for o in (ch or [])])
    cand = [i for i, o in enumerate(ch or []) if ' 出發（' in o['t']]
    k = cand[0] if cand else None
    if want_from: k = next((i for i in cand if ch[i]['t'].startswith(want_from + ' 出發（')), None)
    if k is None: await L.close_panels(pg, cdp); return {'ok': False, 'steps': steps, 'why': '沒有出發日 %s' % want_from}
    picked.append(ch[k]['t']); await P.tap_choice(pg, cdp, k); await pg.wait_for_timeout(1100)
    ch = await wait_menu(pg, cdp, lambda T: '自己去' in T, 30); steps.append([o['t'] for o in (ch or [])])
    W = [o['t'] for o in (ch or [])]
    w = next((t for t in W if t.startswith('和') and t[1:] in nm), None) if who else ('自己去' if '自己去' in W else None)
    if not w or not await tap_prefix(pg, cdp, ch, w): return {'ok': False, 'steps': steps, 'why': '和誰：沒有 %s' % (who or '自己去')}
    picked.append(w)
    await play(pg, cdp, run, None, max_s=15, ff=False, tag=tag + '_after_plan')
    rec = await pg.evaluate(REC13)
    return {'ok': True, 'steps': steps, 'picked': picked, 'rec': rec}


async def c13_case(pg, cdp, run, ent):
    who, dest = None, ent
    if '@' in ent:
        w, dest = ent.split('@', 1); who = FALIAS.get(w.lower(), w)
    if dest not in LOCAL13 or (who and who not in FRIEND13):
        run.check('C13＝%s 認得' % ent, False, '目的地 jp,kr,th,vn,hk,eu,us；朋友 kai,zhe,yu,bohan,xinci（寫法 kai@kr）'); return
    tag = 'c13_%s_%s' % (dest, who or 'solo'); far = dest in ('eu', 'us'); ln = 7 if far else 3
    ka, kb = os.environ.get('C13_FROM', '2026-06-22'), os.environ.get('C13_TO', '2027-09-01')
    st0, _ = await state_at(pg, ka, 10.0, 'dorm')
    await load(pg, cdp, run, st0, '%s：先讀一份最小存檔 %s（只為了在頁面裡挑出發日；不用 quiet_events：quiet 會把 EVENTS.onEnter/tick 換掉，之後的讀檔也收不回來）' % (tag, ka))
    f = await pg.evaluate(FIND13, [dest, who, ln, ka, kb])
    run.note('%s：挑出發日（頁面裡讀 HOME.breakOf、VAC.friendNo，只讀）：%s' % (tag, J(f)))
    if not f or f.get('d') is None: run.check('%s：%s～%s 找得到能出發的日子' % (tag, ka, kb), False, J(f)); return
    js = "NOKX(); return %s;" % ("LV(%s,25,10,5)" % J(who) if who else 'null')
    st, d = await state_at(pg, f['load'], 10.0, 'dorm')
    await load(pg, cdp, run, st, '%s：最小存檔 %s 10:00 宿舍（%s，%s）%s' % (tag, f['load'], d['term'] or '寒暑假', f['brk'], '；朋友 %s 有點熟' % who if who else ''), js=js)
    await play(pg, cdp, run, None, max_s=15, ff=False, tag=tag + '_settle')
    n0 = await pl_len(pg)
    pt = await plan_trip(pg, cdp, run, dest, ln, who, tag)
    rec = pt.get('rec')
    run.check('%s：手機「活動」→「安排」→ 目的地 →「%d 天」→ 第一個出發日（%s）→「%s」＝排好 vac_t13（出發日、和誰對）' % (tag, ln, f['key'], '和' + who if who else '自己去'),
              pt['ok'] and bool(rec) and rec['from'] == f['key'] and rec['with'] == who and bool(rec['q']) and rec['q']['state'] == 'planned', J(pt)[:1500])
    if not rec: return
    until = "(n=>{ const r=(VAC.rec(GAME.G).t13||[]).find(x=>x.n===n); return !!r&&!!r.done; })(%d)" % rec['n']
    ok = await play(pg, cdp, run, until, max_s=ENVI('C13_MAX', 2400), picks=['出發：'], ff=True, tag=tag, shots_at=[LOCAL13[dest][0][1][:12]] + ([FRIEND13[who][0][1][:10]] if who else []))
    R = await rows(pg, n0); Ls = said(R); await run.shot(pg, tag + '_end')
    exp = await pg.evaluate(EXP13, [dest, rec['fromD'], rec['midD'], rec['lastD']])
    nm = await names_of(pg, who) if who else set()
    gos = [r['t'] for r in R if r['k'] == 'choose' and '出發：' in r['t']]
    run.note('%s：出發提示 %s；整趟說的（%d 句）%s；日期卡 %s' % (tag, J(gos[:2]), len(Ls), J(Ls[:30])[:2500], J([[r['n'], r['t']] for r in R if r['k'] == 'card'][:12])))
    run.check('%s：照玩家快轉到出發、按「出發：」、登機、整趟演完（rec.done）' % tag, ok and bool(gos), J({'出發': gos[:2], 'now': await P.clock(pg)}))
    want = LOCAL13[dest] if not who else sub(FRIEND13[who], nm)
    ok_mid, got, _ = after(Ls, ('', exp['k1']), want)
    r1 = row_of(R, exp['k1'])
    run.check('%s 中間那天（%s 14:00）：目的地第二句「%s」後面緊接著%s' % (tag, rec['mid'], exp['k1'][:16] + '…', '當地的一段（' + LOCAL13[dest][1][0] + '）' if not who else '朋友的一段（' + who + '）'),
              ok_mid and bool(r1) and r1['d'] == rec['mid'], J({'got': got, 'row': r1 and {k: r1[k] for k in ('d', 'h', 'z')}, 'want': [list(x) if not isinstance(x[0], set) else ['/'.join(sorted(x[0])), x[1]] for x in want]}))
    ok0 = any(t == exp['k0'] and n == '' for n, t in Ls)
    if who:
        ok_last, gl, _ = after(Ls, ('', exp['k2']), [(nm, FRIEND_LAST[who])])
    else:
        ok_last, gl = any(t == exp['k2'] and n == '' for n, t in Ls), None
    run.check('%s：第一天第一句、最後一晚第三句照舊%s' % (tag, '（後面接朋友那一句「%s」）' % FRIEND_LAST[who] if who else ''), ok0 and ok_last, J({'k0': exp['k0'], 'k2': exp['k2'], 'got': gl}))
    alltxt = {t for _, t in Ls}
    bad = [t for _, t in LOCAL13[dest] if t in alltxt] if who else [t for L_ in FRIEND13.values() for _, t in L_ if t in alltxt]
    run.check('%s：%s' % (tag, '和朋友去沒有當地的一段' if who else '自己去沒有朋友的一段'), not bad, J(bad))
    run.note('%s：中間那天的 2D 背景（ADV）＝%s（S.key bg null＝深色底＋日期卡地點；照記）' % (tag, bg_before(R, r1)))


async def vac_c13(pg, cdp, run):
    ents = ENV('C13', 'jp,eu,kai@kr,yu@th')
    if ents == ['all']:
        fd = os.environ.get('C13_FRIEND_DEST', 'kr')
        ents = list(LOCAL13) + ['%s@%s' % (w, fd) for w in FRIEND13]
    for e in ents:
        run.note('---- vac2 c13：%s ----' % e)
        try: await c13_case(pg, cdp, run, e)
        except Exception as ex: run.check('c13 %s：跑完（沒有探針例外）' % e, False, repr(ex)[:400]); traceback.print_exc()


async def signup(pg, cdp, run, key, tag):
    """手機「活動」假期行事曆那一列「報名」"""
    await P.phone_tab(pg, cdp, 'events'); R0 = await pg.evaluate(VACROWS); await run.shot(pg, tag + '_events')
    row = next((r for r in R0 if r['vac'] == key), None)
    if not row: await L.close_panels(pg, cdp); return {'ok': False, 'rows': R0}
    n0 = await pl_len(pg)
    await L.tap(pg, cdp, '#phoneBody [data-vac="%s"]' % key); await pg.wait_for_timeout(1800); await run.shot(pg, tag + '_signed')
    await L.close_panels(pg, cdp)
    reg = await pg.evaluate("k=>VAC.rec(GAME.G).reg[k]||null", key)
    return {'ok': reg == 'yes', 'row': row, 'reg': reg, 'toast': [r['t'] for r in await rows(pg, n0, 'toast')]}


C10_FW = [('', '（七月四號。宿舍頂樓，大家等煙火。）'), ('Priya', 'In Mumbai we have Diwali. Louder than this.')]
C10_FW_T = [[('Priya', 'Show me.'), ('', '（你找了一段跨年煙火的影片給她看。她看完說：「OK. That\'s louder.」）')], [('', '（煙火放完，有人開始唱歌。你只聽得懂最後一句。）')]]
C10_SG = [('', '（期中前，Priya 找了兩個美國同學一起讀。休息的時候，其中一個問你。）'), ('同學', 'Law in Taiwan is four years? And then the bar?'), ('@me', 'Then the bar.'), ('同學', '……Respect. I\'m still deciding my major.')]
C10_DN = [('', '（每個人帶一道家鄉的菜。你帶的是一包從臺灣帶來的泡麵，煮好放在中間，最後只剩湯。）'), ('Priya', 'Next summer, Taiwan?')]
C10_DN_T = [[('Priya', 'I\'ll come for the food. Not for you.'), ('', '（她笑了。）')], [('Priya', 'Maybe is a yes in economics.')]]
C10_OPT_FW, C10_OPT_DN = ['「Taiwan has New Year fireworks.」', '（安靜看煙火）'], ['「Come to Taiwan.」', '「Maybe.」']


async def vac_c10(pg, cdp, run):
    alt = 1 if os.environ.get('C10_ALT') == '1' else 0
    w10 = await P.day_of(pg, ['Y2S2', 10, 1])
    st, d = await state_at(pg, w10['key'], 10.0, 'dorm')
    await load(pg, cdp, run, st, 'c10：最小存檔 %s（大二下第 10 週週一）10:00 宿舍' % w10['key'], js="NOKX(); return null;")
    await play(pg, cdp, run, None, max_s=15, ff=False, tag='c10_settle')
    sg = await signup(pg, cdp, run, 'C10@Y2', 'c10')
    q = await pg.evaluate(OUTQ, 'vac_C10@Y2')
    run.check('c10：手機「活動」有「海外大學暑期課（加州）」、按「報名」＝報名了、排好 2027-06-21 07:00 出發', sg['ok'] and bool(q) and q['day'] == '2027-06-21' and q['state'] == 'planned', J({'signup': sg, 'q': q}))
    if not q: return
    me = await pg.evaluate("GAME.G.name||'祐廷'")
    s1 = await snap(pg)
    await jump(pg, cdp, run, s1, q['day'], round(q['h'] - (q['travelH'] or 1) - 0.25 - 0.12, 2), zone='dorm', pos=None, note='報名以後的進度；出發提示前約 7 分鐘（中間的學期、系辦那一場不演）')
    n0 = await pl_len(pg)
    picks = ['出發：', '「Yes. Too much.」', C10_OPT_FW[alt], '海邊', C10_OPT_DN[alt]]
    until = "(()=>{ const V=VAC.rec(GAME.G); return V.reg['C10@Y2']==='done'||CALENDAR.dateOf(GAME.G.day).key>'2027-08-02'; })()"
    ok = await play(pg, cdp, run, until, max_s=ENVI('C10_MAX', 3000), picks=picks, ff=True, tag='c10', shots_at=['七月四號', '期中前，Priya', '每個人帶一道家鄉的菜'])
    R = await rows(pg, n0); Ls = said(R); await run.shot(pg, 'c10_end')
    run.note('c10：整趟說的（%d 句）%s' % (len(Ls), J(Ls)[:3000]))
    run.check('c10：照玩家出發、登機、整趟演完（C10@Y2 done）', ok, J(await P.clock(pg)))
    CH = [r['t'] for r in R if r['k'] == 'choose']
    for title, key, h, bgk, want, opts in (('07-04 國慶日的煙火', '2027-07-04', 21, 'intl_ca_beach', C10_FW + C10_FW_T[alt], C10_OPT_FW),
                                           ('07-15 圖書館的讀書小組', '2027-07-15', 16, 'intl_ca_classroom', [(me if n == '@me' else n, t) for n, t in C10_SG], None),
                                           ('07-24 最後一週的晚餐', '2027-07-24', 20, 'intl_ca_classroom', C10_DN + C10_DN_T[alt], C10_OPT_DN)):
        okq, got, _ = after(Ls, want[0], want[1:]); r0 = row_of(R, want[0][1]); bg = bg_before(R, r0)
        okopt = opts is None or any(c.startswith('｜'.join(opts)) for c in CH)
        run.check('c10 %s：%s%s；背景 %s；%s %02d:00' % (title, '→'.join((w[0] + '：' if w[0] else '') + w[1][:14] for w in want), ('；選項「' + '」「'.join(opts) + '」') if opts else '', bgk, key, h),
                  okq and okopt and bool(bg) and bgk in bg and r0['d'] == key and abs(r0['h'] - h) < 0.2,
                  J({'got': got, 'bg': bg, 'at': r0 and [r0['d'], r0['h']], 'choices': [c for c in CH if 'Taiwan' in c or '煙火' in c or 'Maybe' in c]}))
    mk = ['（輪到你報告。講到第二張投影片，你忘了一個字。教授等了三秒，幫你接下去。）', C10_FW[0][1], '（風很大。Priya 說她第一次看到太平洋的另一邊。）', C10_SG[0][1], C10_DN[0][1], '（考卷四題，三小時。你寫完第三題的時候，旁邊的 Priya 已經在檢查了。）']
    idx = [next((i for i, (_, t) in enumerate(Ls) if t == m), None) for m in mk]
    run.check('c10：照日期的順序：第一次報告 → 煙火 → 週末（海邊）→ 讀書小組 → 晚餐 → 期末考', all(i is not None for i in idx) and idx == sorted(idx), J(idx))


C11_CV = '（早上七點多。你和同團的學生各拿了一個熱的飯糰，站在店門口吃。）'
C11_ST = [('同團的學生', '你們法律系寒假不用念書嗎？')]
C11_ST_T = [[('同團的學生', '我的也是。還沒打開過。')], [('同團的學生', '……好，我回去跟我媽這樣說。')]]
C11_OPT = ['「要啊。書在行李箱裡。」', '「這就是在念書。」']
C11_AN = [('@', '書我帶了兩本。……打開了一本。'), ('@', '另一本是用來壓行李的。')]
C11_BK = '（一整條街的舊書店。你在一間店裡看到一本很舊的日文六法，封面是綠色的。你翻了一下，又放回去。）'
C11_SN = '（錢湯的牆上畫著一座很大的山。旁邊的伯伯泡到臉紅，對你點了一下頭。你也點頭。）'


async def vac_c11(pg, cdp, run):
    alt = 1 if os.environ.get('C11_ALT') == '1' else 0; withan = os.environ.get('C11_AN') == '1'
    w5 = await P.day_of(pg, ['Y2S1', 5, 1])
    st, d = await state_at(pg, w5['key'], 10.0, 'dorm')
    await load(pg, cdp, run, st, 'c11：最小存檔 %s（大二上第 5 週週一）10:00 宿舍%s' % (w5['key'], '；以安有點熟（認識＝她也在東京）' if withan else '；沒認識以安'),
               js="NOKX(); return %s;" % ("LV('heroine_01',25,10,5)" if withan else "{knowsAn:STORY.knows('heroine_01',G)}"))
    await play(pg, cdp, run, None, max_s=15, ff=False, tag='c11_settle')
    sg = await signup(pg, cdp, run, 'C11@Y2', 'c11')
    q0 = await pg.evaluate(OUTQ, 'vac_C11@Y2_pre0'); q = await pg.evaluate(OUTQ, 'vac_C11@Y2')
    run.check('c11：手機「報名」C11@Y2＝報名了；排好隔天 20:00「寫申請書」、2027-01-17 出發', sg['ok'] and bool(q0) and bool(q) and q['day'] == '2027-01-17', J({'signup': sg, 'pre0': q0, 'q': q}))
    if not q0 or not q: return
    s1 = await snap(pg)
    await jump(pg, cdp, run, s1, q0['day'], 19.42, zone='dorm', pos=None, note='報名隔天 19:25（寫申請書的出發提示前）')
    await play(pg, cdp, run, "(()=>{ const q=OUT.get(GAME.G,'vac_C11@Y2_pre0'); return !q||q.state!=='planned'; })()", max_s=ENVI('VF_WAIT', 600), picks=['出發：'], ff=False, tag='c11_app')
    app = await pg.evaluate("!!GAME.G.flags.VAC_C11_APP")
    run.check('c11：「出發：…寫申請書」按了＝VAC_C11_APP（甄審才會上）', app, J(await pg.evaluate(OUTQ, 'vac_C11@Y2_pre0')))
    s2 = await snap(pg)
    await jump(pg, cdp, run, s2, q['day'], round(q['h'] - (q['travelH'] or 1) - 0.25 - 0.12, 2), zone='dorm', pos=None, note='寫完申請書的進度；2027-01-17 出發提示前約 7 分鐘（第 8 週的甄審通知照時間補收）')
    sel = await pg.evaluate("(()=>(GAME.G.msgs||[]).filter(m=>m&&/^vac_sel_C11/.test(m.tag||'')).map(m=>String(m.text||'')))()")
    run.check('c11：收到甄審錄取通知（「【通知】恭喜錄取姊妹校冬季短期課程（東京）。」）、還是報名的狀態', any('恭喜錄取' in t for t in sel) and await pg.evaluate("VAC.rec(GAME.G).reg['C11@Y2']==='yes'"), J(sel))
    an = await names_of(pg, 'heroine_01')
    n0 = await pl_len(pg)
    picks = ['出發：', C11_OPT[alt], '錢湯' if alt else '舊書店街', '「看情況。」']
    until = "(()=>{ const V=VAC.rec(GAME.G); return V.reg['C11@Y2']==='done'||CALENDAR.dateOf(GAME.G.day).key>'2027-01-31'; })()"
    ok = await play(pg, cdp, run, until, max_s=ENVI('C11_MAX', 2400), picks=picks, ff=True, tag='c11', shots_at=['早上七點多', '一整條街的舊書店', '錢湯的牆上'])
    R = await rows(pg, n0); Ls = said(R); await run.shot(pg, 'c11_end')
    run.note('c11：整趟說的（%d 句）%s' % (len(Ls), J(Ls)[:2500]))
    run.check('c11：照玩家出發、登機、整趟演完（C11@Y2 done）', ok, J(await P.clock(pg)))
    CH = [r['t'] for r in R if r['k'] == 'choose']
    r0 = row_of(R, C11_CV); bg = bg_before(R, r0)
    if withan:
        okq, got, _ = after(Ls, ('', C11_CV), sub(C11_AN, an)); okopt = not any(c.startswith('｜'.join(C11_OPT)) for c in CH)
        lab = '以安也在東京：旁白→以安「書我帶了兩本。……打開了一本。」「另一本是用來壓行李的。」、沒有同團學生那題選項'
    else:
        okq, got, _ = after(Ls, ('', C11_CV), C11_ST + C11_ST_T[alt]); okopt = any(c.startswith('｜'.join(C11_OPT)) for c in CH)
        lab = '不認識以安：旁白→同團的學生「你們法律系寒假不用念書嗎？」→ 選項「%s」→「%s」' % ('」「'.join(C11_OPT), C11_ST_T[alt][0][1])
    run.check('c11 01-20 07:40 宿舍樓下的便利商店（bg intl_tokyo_classroom）：%s' % lab,
              okq and okopt and bool(bg) and 'intl_tokyo_classroom' in bg and bool(r0) and r0['d'] == '2027-01-20' and abs(r0['h'] - (7 + 40 / 60)) < 0.08,
              J({'got': got, 'bg': bg, 'at': r0 and [r0['d'], r0['h']], 'choices': CH[:12]}))
    fr = next((r for r in R if r['k'] == 'choose' and r['t'].startswith('舊書店街｜錢湯')), None); bgf = bg_before(R, fr)
    want26 = C11_SN if alt else C11_BK
    run.check('c11 01-26 15:00 自由活動（bg intl_tokyo_shotengai）：選項「舊書店街」「錢湯」→ %s' % want26[:16],
              bool(fr) and fr['d'] == '2027-01-26' and abs(fr['h'] - 15) < 0.2 and bool(bgf) and 'intl_tokyo_shotengai' in bgf and any(t == want26 for _, t in Ls) and not any(t == (C11_BK if alt else C11_SN) for _, t in Ls),
              J({'choice': fr and [fr['d'], fr['h'], fr['t']], 'bg': bgf}))
    mk = [next((i for i, (_, t) in enumerate(Ls) if '好像通識課' in t), None), next((i for i, (_, t) in enumerate(Ls) if t == C11_CV), None),
          next((i for i, (_, t) in enumerate(Ls) if '五十年前的照片' in t), None), next((i for i, (_, t) in enumerate(Ls) if t == want26), None),
          next((i for i, (_, t) in enumerate(Ls) if '交誼廳煮泡麵' in t), None)]
    run.check('c11：照日期的順序：第一堂 → 便利商店 → 參訪 → 自由活動 → 最後一晚', all(i is not None for i in mk) and mk == sorted(mk), J(mk))


VF = {
    'kai624': dict(key='2026-06-24', h=21.0, who='kai', lv=(25, 10, 5), tag='vf_y1s_0624', th='p:kai', ms=['所以你暑假在幹嘛', '我在打一款很難的遊戲 打不過'], ans='我也來打。', reply=['所以今晚 線上'],
                   oid='vf_y1s_0624', okey='2026-06-24', oh=22.0, ev='ev_vf_y1s_0624', go='上線：', scene='線上', bg='dorm_desk',
                   lines=[('', '（耳機裡，阿凱那邊有泡麵的聲音。）'), ('@', '所以第三關的王，要先打牠的尾巴。'), ('@', '……我也是剛剛才知道。我已經死了四十次。'),
                          ('', '（凌晨一點半，你們第一次打到牠剩一半的血。）'), ('@', '所以我們差一半。……明天再打。'), ('', '（那天晚上你們打到兩點。還是打不過。）')], opts=None),
    'kai711': dict(key='2027-07-10', h=20.0, who='kai', lv=(45, 30, 10), tag='vf_y2s_0710', th='p:kai', ms=['所以溫州街那家冰店開了', '明天下午三點', '我請 我的泡麵評鑑表滿一百家了 慶祝'], ans='好。', reply=[],
                   oid='vf_y2s_0711', okey='2027-07-11', oh=15.0, ev='ev_vf_y2s_0711', go='出發：', scene='溫州街的冰店', bg='dark',
                   lines=[('', '（冰店的電風扇轉得很慢。阿凱點了兩碗，說一碗是評鑑用的。）'), ('@', '所以這家要寫進表裡嗎。它不是泡麵。')],
                   opts=['「開一張新的表。」', '「好吃就寫進去。」'], tail=[[('@', '……所以我暑假有事做了。')], [('@', '好。那它是第一百零一家。雖然它是冰。')]], pickenv='KAI711_PICK'),
    'yt813': dict(key='2027-08-12', h=21.0, who='heroine_03', lv=(25, 10, 5), tag='vf_y2s_0812', th='p:heroine_03', ms=['明天下午我要去訪問修鞋店的老闆。', '……你要不要一起。你負責拿錄音筆就好。'], ans='好。', reply=[],
                  oid='vf_y2s_0813', okey='2027-08-13', oh=16.0, ev='ev_vf_y2s_0813', go='出發：', scene='公館的修鞋店', bg='gongguan', mem='FIELD_WITH_YT',
                  lines=[('', '（修鞋店很小，只放得下一張板凳。語彤坐板凳，你站在門口拿錄音筆。）'), ('老闆', '這雙鞋，我修過三次了。客人每次都說是最後一次。'), ('', '（他把鞋底翻過來給你們看，上面有三種顏色的線。）'),
                         ('', '（回程的路上。）'), ('@', '我問了十個問題，他回答了一個。'), ('@', '……可是那一個很好。')], opts=None),
    'xc212': dict(key='2027-02-11', h=21.0, who='classmate_xinci', lv=(25, 10, 5), tag='vf_y2w_0211', th='p:classmate_xinci', ms=['我爸媽的事務所今天開工。我去幫忙。', '明天早上十點，永和的豆漿店。我請。'], ans='好。', reply=[],
                  oid='vf_y2w_0212', okey='2027-02-12', oh=10.0, ev='ev_vf_y2w_0212', go='出發：', scene='永和的豆漿店', bg='soymilk_shop',
                  lines=[('', '（永和的豆漿店，早上十點還是滿的。芯慈已經點好了，桌上兩碗鹹豆漿。）'), ('@', '我爸說開工第一天要吃熱的。我覺得他只是想吃。')],
                  opts=['「事務所開工忙嗎？」', '「妳寒假都在幫忙？」'], tail=[[('@', '忙。我負責發紅包。……我發錯一包，給了我媽。')], [('@', '一個禮拜。剩下的時間在追劇。……第八集很好看。')]], pickenv='XC212_PICK')}


async def vf_case(pg, cdp, run, name):
    X = VF[name]; who = X['who']; f, t, c = X['lv']
    alt = 1 if X.get('pickenv') and os.environ.get(X['pickenv']) == 'b' else 0
    st, d = await state_at(pg, X['key'], round(X['h'] - 0.17, 2), 'dorm')
    await load(pg, cdp, run, st, '%s：最小存檔 %s %s 宿舍（%s）；%s 熟 %d／信任 %d' % (name, X['key'], '%05.2f' % (X['h'] - 0.17), d['term'] or '寒暑假', who, f, t), js="NOKX(); return LV(%s,%d,%d,%d);" % (J(who), f, t, c))
    nm = await names_of(pg, who)
    pres = await pg.evaluate(PRES_AT, [who, X['okey']])
    run.note('%s：%s 那天 %s 在不在臺北（讀 STORY.presence，只讀）：%s' % (name, X['okey'], who, J(pres)))
    n0 = await pl_len(pg)
    got, M = await wait_msg(pg, cdp, run, X['tag'], ENVI('VF_WAIT', 600), name + '_wait')
    run.check('%s：%s %02d:00 手機收到 %s 的私訊 %s＋回覆鍵「%s」' % (name, X['key'], X['h'], who, J(X['ms']), X['ans']),
              got and [m['text'] for m in M] == X['ms'] and all(m['from'] == who and m['th'] == X['th'] for m in M) and M[0]['day'] == X['key'] and abs(M[0]['h'] - X['h']) < 0.02 and M[-1]['opts'] == [X['ans']], J(M))
    if not got: return
    a = await answer(pg, cdp, run, ('eq', X['tag']), X['ans'], name)
    if X['reply']:   # 對方回的那一句可能晚一點才送到：站著等（最多 60 秒）
        await play(pg, cdp, run, "((th,t)=>(GAME.G.msgs||[]).some(m=>m&&(PHONE.th?PHONE.th(m):m.th)===th&&m.text===t))(%s,%s)" % (J(X['th']), J(X['reply'][-1])), max_s=60, ff=False, tag=name + '_reply')
    th = await pg.evaluate(THREAD, X['th'])
    rep_ok = all(any(x[0] == who and x[1] == r for x in th) for r in X['reply'])
    run.check('%s：在對話點「%s」%s' % (name, X['ans'], ('→ ' + '、'.join('「%s」' % r for r in X['reply'])) if X['reply'] else ''), bool(a) and a['tapped'] == X['ans'] and rep_ok, J({'answer': a, 'thread': th[-6:]}))
    if name == 'kai624':
        run.check('kai624：對話串裡沒有舊的旁白（「那天晚上你們打到兩點」那一句）', not any('打到兩點' in x[1] for x in th), J(th[-6:]))
    await play(pg, cdp, run, "(id=>!!OUT.get(GAME.G,id))(%s)" % J(X['oid']), max_s=40, ff=False, tag=name + '_plan')   # 回覆以後下一次手機規則才排（VACFILL.plans）
    q = await pg.evaluate(OUTQ, X['oid'])
    run.check('%s：回了＝排進行事曆 %s %02d:00（%s%s）' % (name, X['okey'], X['oh'], X['ev'], '，電話式：不用出門' if name == 'kai624' else ''),
              bool(q) and q['day'] == X['okey'] and abs(q['h'] - X['oh']) < 0.01 and q['ev'] == X['ev'] and q['state'] == 'planned' and (name != 'kai624' or (q['call'] and q['verb'] == '上線')), J(q))
    if not q: return
    picks = [X['go']] + ([X['opts'][alt]] if X['opts'] else [])
    ok = await play(pg, cdp, run, EVDONE % J(X['ev']), max_s=ENVI('VF_MAX', 1800), picks=picks, ff=True, tag=name, shots_at=[X['lines'][0][1][:10]])
    R = await rows(pg, n0); Ls = said(R); await run.shot(pg, name + '_end')
    gos = [r['t'] for r in R if r['k'] == 'choose' and r['t'].startswith(X['go'])]
    want = sub(X['lines'], nm) + (sub(X['tail'][alt], nm) if X['opts'] else [])
    okq, gotl, _ = after(Ls, want[0], want[1:]); r0 = row_of(R, want[0][1]); bg = bg_before(R, r0); caps = cap_near(R, r0)
    run.note('%s：說的 %s；出發提示 %s；背景 %s；地點字幕 %s' % (name, J(Ls[:16]), J(gos[:2]), bg, J(caps)))
    run.check('%s：%s 前跳「%s…」、按了、演 %s' % (name, X['okey'], X['go'], X['ev']), ok and bool(gos), J({'出發': gos[:2], 'now': await P.clock(pg)}))
    run.check('%s：台詞照稿、照順序（%d 句%s）' % (name, len(want), '；選項「%s」' % '」「'.join(X['opts']) if X['opts'] else ''),
              okq and (not X['opts'] or any(r['k'] == 'choose' and r['t'] == '｜'.join(X['opts']) for r in R)), J({'got': gotl, 'choices': [r['t'] for r in R if r['k'] == 'choose'][-4:]}))
    bg_ok = bool(bg) and ((X['bg'] == 'dark' and bg == 'dark') or (X['bg'] != 'dark' and X['bg'] in bg)) and X['scene'] in caps
    run.check('%s：背景 %s%s、地點字幕「%s」（實際 %s）' % (name, X['bg'], '（還沒有 2D 圖＝深色底）' if X['bg'] == 'dark' else '', X['scene'], bg), bg_ok, J({'bg': bg, 'caps': caps}))
    if name == 'kai624':
        c2 = await P.clock(pg)
        run.check('kai624：演完約 6/25 02:00（hours 4）', c2['key'] == '2026-06-25' and 1.5 <= c2['h'] <= 3.0, J(c2))
    if X.get('mem'):
        mem = await pg.evaluate("([id,m])=>!!SOCIAL.has(id,m)", [who, X['mem']])
        run.check('%s：演完記 %s（記在 %s 身上）' % (name, X['mem'], who), mem)


async def xcneg_case(pg, cdp, run, case):
    nmsg = "(()=>(GAME.G.msgs||[]).filter(m=>m&&m.tag==='vf_y2w_0211').length)()"
    if case in ('presence', 'level'):
        f = 10 if case == 'level' else 25
        st, d = await state_at(pg, '2027-02-11', 20.83, 'dorm')
        await load(pg, cdp, run, st, 'xcneg %s：最小存檔 2027-02-11 20:50 宿舍；芯慈熟 %d（%s）' % (case, f, '只是認識' if f < 20 else '有點熟'), js="NOKX(); return LV('classmate_xinci',%d,0,0);" % f)
        if case == 'presence':
            r = await pg.evaluate("""(()=>{ if(window.__presStub) return 'again'; const p0=STORY.presence; window.__presStub=p0; const d=STORY.dayOfKey('2027-02-12');
              STORY.presence=function(id,G){ if(id==='classmate_xinci'&&G&&G.day===d) return {here:false,away:'不在臺北',kind:'home'}; return p0.apply(this,arguments); }; return STORY.presence('classmate_xinci',Object.assign({},GAME.G,{day:d})); })()""")
            run.setup('【捷徑】頁面裡把 STORY.presence 包一層：芯慈 2027-02-12＝不在臺北（characters.js 她的 presence 是 {from:\'Y1S1\'}，玩家碰不到這個情形）→ %s' % J(r))
        try:
            await play(pg, cdp, run, "GAME.G.hour>=21.25||CALENDAR.dateOf(GAME.G.day).key>'2027-02-11'", max_s=ENVI('VF_WAIT', 600), ff=False, tag='xcneg_' + case)
            n = await pg.evaluate(nmsg)
        finally:
            if case == 'presence': await pg.evaluate("(()=>{ if(window.__presStub){ STORY.presence=window.__presStub; delete window.__presStub; } return true; })()")
        run.check('xcneg %s：2/11 21:15 還是沒有芯慈「我爸媽的事務所今天開工。」那一則（%s）' % (case, '她 2/12 不在臺北' if case == 'presence' else '只是認識，不到有點熟'), n == 0, J({'n': n, 'now': await P.clock(pg)}))
        return
    if case == 'trip':
        st, d = await state_at(pg, '2027-02-09', 10.0, 'dorm')
        await load(pg, cdp, run, st, 'xcneg trip：最小存檔 2027-02-09 10:00 宿舍（大二寒假）；芯慈有點熟', js="NOKX(); return LV('classmate_xinci',25,10,5);")
        await play(pg, cdp, run, None, max_s=15, ff=False, tag='xcneg_trip_settle')
        pt = await plan_trip(pg, cdp, run, 'jp', 3, None, 'xcneg_trip', want_from='2/12')
        rec = pt.get('rec')
        run.check('xcneg trip：手機排「日本（東京）」3 天、2/12 出發、自己去（玩家操作）', pt['ok'] and bool(rec) and rec['from'] == '2027-02-12', J(pt)[:1200])
        if not rec: return
        s1 = await snap(pg)
        await jump(pg, cdp, run, s1, '2027-02-11', 20.83, zone='dorm', pos=None, note='排好出國以後的進度；2/11 20:50（出發前一天晚上）')
        await play(pg, cdp, run, "GAME.G.hour>=21.25||CALENDAR.dateOf(GAME.G.day).key>'2027-02-11'", max_s=ENVI('VF_WAIT', 600), ff=False, tag='xcneg_trip')
        n = await pg.evaluate(nmsg); q = await pg.evaluate(OUTQ, 'vac_t13_%d' % rec['n'])
        run.check('xcneg trip：2/11 21:15 沒有芯慈那一則（祐廷 2/12 出國，行事曆的出國還是 planned）', n == 0 and bool(q) and q['state'] == 'planned', J({'n': n, 'q': q}))
        return
    run.check('XCNEG＝%s 認得' % case, False, 'presence、trip、level')


async def m_vac2(pg, cdp, run):
    for s in ENV('VAC2', 'c13,c10,c11,kai624,kai711,yt813,xc212,xcneg'):
        run.note('==== vac2：%s ====' % s)
        try:
            if s == 'c13': await vac_c13(pg, cdp, run)
            elif s == 'c10': await vac_c10(pg, cdp, run)
            elif s == 'c11': await vac_c11(pg, cdp, run)
            elif s in VF: await vf_case(pg, cdp, run, s)
            elif s == 'xcneg':
                for c in ENV('XCNEG', 'presence,trip'):
                    try: await xcneg_case(pg, cdp, run, c)
                    except Exception as ex: run.check('xcneg %s：跑完（沒有探針例外）' % c, False, repr(ex)[:400]); traceback.print_exc()
            else: run.check('VAC2＝%s 認得' % s, False, 'c13,c10,c11,kai624,kai711,yt813,xc212,xcneg')
        except Exception as ex:
            run.check('vac2 %s：跑完（沒有探針例外）' % s, False, repr(ex)[:400]); traceback.print_exc()
            try: await run.shot(pg, 'vac2_%s_exception' % s)
            except Exception: pass


# ================================================================ 2. grades：成績出來以後
GR_SET = """const t='Y1S1', mode=%s; const R=CLS.rec(G); R.exam=R.exam||{}; R.attend=R.attend||{}; let first=true; const cs=CLS.termCourses(G,t);
  for(const c of cs){ if(CLS.isExamCourse(c)){ let n={high:5,mid:3,low:2,fail:5}[mode]; if(mode==='fail'&&first){ n=0; first=false; } R.exam[t+':'+c.id+':final']={status:'done',correct:n}; } if(CLS.attCourse&&CLS.attCourse(c)) R.attend[c.id]=3; }
  const rel=[LV('kexin',65,50,45,{npcRom:60,rom:40}),LV('heroine_04',45,30,10),LV('kai',45,30,10)].concat(%s.map(id=>LV(id,25,10,5)));
  return {lv:GRADES.lv(G,t), courses:cs.map(c=>c.id+(CLS.isExamCourse(c)?'*':'')), rel:rel.map(r=>r.id+':'+r.level)};"""
GR_LV = {'high': 'high', 'mid': 'mid', 'low': 'low', 'fail': 'fail_law'}
KX_LINES = {'high': ['……你偷念。', '好，這次才是真的放假。', '你請。'], 'mid': ['……都過了。好，這次才是真的放假。'], 'low': ['……都過了。', '下學期我們一起念。我排時間。'], 'fail': ['……有一科沒過。', '好。下學期那一科，我陪你念。']}
ZQ_LINES = {'fail': ['欸不是 被當？', '我大一也被當過一科 隔年重修就過了'], None: ['欸不是', '成績出來了', '你的不用說', '我的必修很好 其他過了']}
KAI_BASE = ['所以我的成績出來了', '程設 很好', '微積分 過了', '其他 不要問']
KAI_FAIL = ['所以你也被當了', '歡迎加入重修']
FACE_PREF = ['cafe', 'library', 'library_hall', 'lawlib', 'noodle', 'wenzhou', 'gongguan', 'soclib', 'wancai', 'linze', 'campus']
FACE_FIND = """(([id,ka,kb,need,pref])=>{ const c=CHARACTERS[id]; if(!c) return {err:'no char'}; const a=STORY.dayOfKey(ka), b=STORY.dayOfKey(kb), out=[];
  const at=(d,h)=>{ const g=Object.assign({},GAME.G,{day:d,hour:h,weekday:CALENDAR.dateOf(d).wd%7}); let p=null; try{ p=STORY.presence(id,g); }catch(e){ return null; } if(p&&p.here===false) return null;
    let e=null; try{ e=STORY.schedEnt(c,g); }catch(err){ return null; } if(!e||!e.zone||['out','class','club'].includes(e.act)) return null; return e; };
  for(let d=a; d<=b; d++){ for(let h=9; h<=20; h+=0.5){ const e=at(d,h+0.25), e2=at(d,h+0.75); if(!e||!e2||e2.zone!==e.zone) continue; if(need&&e.zone!==need) continue;
      const r=pref.indexOf(e.zone); out.push({d,key:CALENDAR.dateOf(d).key,h:h+0.25,zone:e.zone,act:e.act||null,rank:r<0?50:r}); } if(out.length>=80) break; }
  out.sort((x,y)=>x.rank-y.rank||x.d-y.d||x.h-y.h); return out.slice(0,4); })"""


def face_exp(cid, lv, nm):
    """(picks, 選項, 台詞)；台詞 '@'＝他"""
    W = {'high': '很好。', 'mid': '還可以。', 'low': '不太好。'}; fail = lv in ('fail_law', 'fail_att')
    if cid == 'heroine_05':
        w = '不太好。' if fail else W[lv]
        tail = {'high': ['好。', '下學期，我出難一點的題目給你。'], 'mid': ['好。重點是你有翻開。']}.get(lv, ['好。……下學期的進度，我幫你排。'])
        return [w], [w, '不說。'], [(nm, '成績出來了。三個字以內。')] + [(nm, x) for x in tail]
    if cid == 'heroine_02':
        if fail: return [], None, [(nm, '……今天這杯我請。不是安慰，是剛好。')]
        return [], None, [(nm, '成績出來了吧。……今天這杯我請。'), (nm, '不是因為你考得好，是因為你看起來很需要。')]
    if cid == 'classmate_peishan':
        if lv == 'fail_law': return [], None, [(nm, '哪一題你最想再寫一次？……下學期重修的時候寫。')]
        if lv == 'fail_att': return [], None, [(nm, '三堂。……明年那門課，我每週傳一次提醒。不是管你，是提醒。')]
        return ['全部。'], ['第二題。', '都寫完了。', '全部。'], [(nm, '哪一題，你最想再寫一次？'), ('', '（她笑了。）'), (nm, '好。那下學期一起念。')]
    if cid == 'classmate_mingxuan':
        if lv == 'fail_law': return [], None, [(nm, '哈哈……筆記借你。這次不是隨便寫的。')]
        if lv == 'fail_att': return [], None, [(nm, '哈哈……明年一起修？我也還欠一門。')]
        tail = {'high': [(nm, '哇。……我請你一顆滷蛋。一顆。')], 'mid': [(nm, '不錯啊。哈哈，下學期繼續。')], 'low': [(nm, '筆記借你。我隨便寫的。'), ('', '（筆記的字很整齊，一點都不隨便。）')]}[lv]
        return [W[lv]], [W[lv], '不說。'], [(nm, '考得怎樣？哈哈，我隨便念念。')] + tail
    if cid == 'npc_fangyt':
        if lv == 'fail_law': return [], None, [(nm, '我們系被當的人，要再上一次山。'), (nm, '……下學期，再上一次就好。')]
        if lv == 'fail_att': return [], None, [(nm, '出席不夠喔。……明年換一門要出去走的。')]
        return [], None, [(nm, '我們系的期末在山上考。認樹。')] + ([(nm, '你這學期都在室內。……週末去走走。不用帶書。')] if lv == 'high' else [])
    return [], None, []


async def gr_face(pg, cdp, run, s0, cid, lv, mode):
    tag = 'gr_%s_%s' % (mode, cid)
    need = 'cafe' if cid == 'heroine_02' else None
    cand = await pg.evaluate(FACE_FIND, [cid, '2026-01-06', '2026-03-15', need, FACE_PREF])
    run.note('%s：成績出來以後（1/6～3/15）他在哪（讀 STORY.schedEnt／presence，只讀）：%s' % (tag, J(cand)))
    if not isinstance(cand, list) or not cand: run.check('%s：1/6～3/15 找得到他%s的時間' % (tag, '在 Café' if need else ''), False, J(cand)); return
    c = cand[0]
    await jump(pg, cdp, run, s0, c['key'], c['h'], zone=c['zone'], pos=None, note='%s 照作息在 %s（%s）' % (cid, c['zone'], c['act']))
    await play(pg, cdp, run, None, max_s=12, ff=False, tag=tag + '_settle')   # 進區域的事件先演完（點過去）
    w = await P.wait_present(pg, cid, 90)
    nm = await names_of(pg, cid); picks, opts, want = face_exp(cid, lv, nm)
    if not w or w['hidden']: run.check('%s：%s %.2f 在 %s 看得到他' % (tag, c['key'], c['h'], c['zone']), False, J(w)); return
    if w['dMe'] > 25: await P.place_near(pg, run, w['x'], w['z'], 7.0, w['lv'], cid)   # [前置] 大區域（校園、公館）：從他 7 m 外開始走
    n0 = await pl_len(pg)
    r = await P.talk_to(pg, cdp, run, cid, tag, picks=picks + ['不用了', '就這樣'], max_s=420)
    R = await rows(pg, n0); Ls = said(R); CH = [x['t'] for x in R if x['k'] == 'choose']; await run.shot(pg, tag + '_end')
    okq, got, _ = after(Ls, want[0], want[1:]) if want else (False, None, None)
    okopt = opts is None or any(x.startswith('｜'.join(opts)) for x in CH)
    staff = await pg.evaluate("id=>{ const n=GAME.npc&&GAME.npc[id]; return n?(n.staff||null):null; }", cid)
    why = ''
    if cid == 'heroine_02' and not okq and any('元' in x for x in CH):
        why = '芷若在吧檯上班（staff %s）：和她說話＝點餐（story3d.js talkCharacter 吧檯那一段在 PRE_TALK 之前就 return，GRADES.preTalk 沒有跑）' % staff
    run.check('%s：第一次說話先演成績那一段（%s）：%s%s' % (tag, lv, '→'.join((w_[0] if isinstance(w_[0], str) else '他') + '：' + w_[1][:14] for w_ in want), ('；選項「' + '」「'.join(opts) + '」') if opts else ''),
              bool(r) and okq and okopt, J({'got': got, 'said': Ls[:10], 'choices': CH[:4], 'label': r and r.get('label'), 'staff': staff, 'why': why}))
    if cid == 'classmate_peishan' and '全部。' in picks:
        run.check('%s：選「全部。」＝記 PS_STUDY＝Y1S1' % tag, await pg.evaluate("GAME.G.flags.PS_STUDY==='Y1S1'"))


async def gr_case(pg, cdp, run, mode, faces):
    if mode not in GR_LV: run.check('GR_CASES＝%s 認得' % mode, False, 'high、mid、low、fail'); return
    lv = GR_LV[mode]
    st, d = await state_at(pg, '2026-01-04', 22.0, 'dorm', flags={'dating_kexin': True, 'KX_GRADES_PACT_SET': True, 'KX_DATING_SINCE': '2024-10-17', 'met_sis': True, 'SIS_W1': True})
    r = await load(pg, cdp, run, st, 'grades %s：最小存檔 2026-01-04（日）22:00 宿舍；和可昕交往、KX_GRADES_PACT_SET（說好成績一起看）' % mode, js=GR_SET % (J(mode), J(faces)))
    run.check('grades %s：【捷徑】補的大一上成績＝GRADES.lv %s' % (mode, lv), bool(r) and r.get('lv') == lv, J(r))
    kx = await names_of(pg, 'kexin')
    n0 = await pl_len(pg)
    until = "(()=>{ const D=((GAME.G.events||{}).done||{}); return (!!D.ev_kexin_grades_open&&GAME.G.hour>=21.15)||CALENDAR.dateOf(GAME.G.day).key>'2026-01-05'; })()"
    ok = await play(pg, cdp, run, until, max_s=ENVI('GR_MAX', 1800), picks=['等五號一起看。', '接起來：'], ff=True, tag='gr_' + mode, shots_at=['三、二、一', '大一上的成績出來了。'])
    await play(pg, cdp, run, "(()=>{ const M=GAME.G.msgs||[]; return M.some(m=>m&&m.tag==='gr_kai_Y1S1')&&M.some(m=>m&&m.tag==='gr_zq_Y1S1'); })()", max_s=180, ff=False, tag='gr_%s_msgs' % mode)
    R = await rows(pg, n0); Ls = said(R)
    pact = await pg.evaluate("GAME.G.flags.KX_GRADES_PACT||null")
    run.note('grades %s：1/4～1/5 說的 %s' % (mode, J([x for x in Ls if x[0] in kx or '成績' in x[1]][:20])))
    hold = [x['t'] for x in R if x['k'] == 'choose' and '等五號一起看。' in x['t']]
    run.check('grades %s：床快轉 → 1/5 早上「大一上的成績出來了。」→「先看。」「等五號一起看。」→ 選等＝KX_GRADES_PACT kept' % mode, bool(hold) and pact == 'kept', J({'choices': hold, 'pact': pact}))
    i3 = next((i for i, (n, t) in enumerate(Ls) if t == '三、二、一——'), None)
    ig = next((i for i, (n, t) in enumerate(Ls) if i3 is not None and i > i3 and t == '大一上的成績出來了。'), None)
    got = [t for n, t in (Ls[i3 + 1:ig] if i3 is not None else []) if n in kx]   # 「三、二、一——」到成績單那一句之間，她說的
    vid = [x['t'] for x in R if x['k'] == 'choose' and x['t'].startswith('接起來：')]
    run.check('grades %s：21:00「接起來：可昕的視訊：一起打開成績」→「三、二、一——」→ 她照級別說 %s' % (mode, J(KX_LINES[mode])), ok and bool(vid) and got == KX_LINES[mode], J({'她說': got[:8], '提示': vid[:2], 'i3': i3}))
    if mode == 'fail':
        run.check('grades fail：被當＝視訊裡可昕沒有任何一句含「都過了」', i3 is not None and not any('都過了' in t for t in got), J(got[:8]))
    run.check('grades %s：視訊以後成績單（「大一上的成績出來了。」那一句旁白）' % mode, any(t == '大一上的成績出來了。' for _, t in Ls), J(Ls[-6:]))
    zq = [m['text'] for m in await pg.evaluate(MSG_OF, 'gr_zq_Y1S1')]; ka = [m['text'] for m in await pg.evaluate(MSG_OF, 'gr_kai_Y1S1')]
    zm = await pg.evaluate(MSG_OF, 'gr_zq_Y1S1'); km = await pg.evaluate(MSG_OF, 'gr_kai_Y1S1')
    wz = ZQ_LINES['fail'] if mode == 'fail' else ZQ_LINES[None]; wk = KAI_BASE + (KAI_FAIL if mode == 'fail' else [])
    run.check('grades %s：1/5 21:00 子晴私訊（不加句號）%s' % (mode, J(wz)), zq == wz and all(m['day'] == '2026-01-05' and abs(m['h'] - 21) < 0.05 for m in zm[:1]), J(zm))
    run.check('grades %s：1/5 21:00 阿凱私訊（大一）%s' % (mode, J(wk)), ka == wk and all(m['day'] == '2026-01-05' and abs(m['h'] - 21) < 0.05 for m in km[:1]), J(km))
    for th, lab in (('p:heroine_04', 'zq'), ('p:kai', 'kai')):
        await P.phone_thread(pg, cdp, th, open_folds=False); await run.shot(pg, 'gr_%s_%s_thread' % (mode, lab)); await L.close_panels(pg, cdp)
    if faces:
        s0 = await snap(pg)
        for cid in faces:
            try: await gr_face(pg, cdp, run, s0, cid, lv, mode)
            except Exception as ex: run.check('grades %s %s：跑完（沒有探針例外）' % (mode, cid), False, repr(ex)[:400]); traceback.print_exc()


async def m_grades(pg, cdp, run):
    cases = ENV('GR_CASES', 'high,fail'); faces = ENV('GR_FACE', 'heroine_05,heroine_02,classmate_peishan,classmate_mingxuan,npc_fangyt'); ffail = ENV('GR_FACE_FAIL', '')
    first_pass = next((c for c in cases if c != 'fail'), None)
    for c in cases:
        run.note('==== grades：%s ====' % c)
        try: await gr_case(pg, cdp, run, c, faces if c == first_pass else (ffail if c == 'fail' else []))
        except Exception as ex: run.check('grades %s：跑完（沒有探針例外）' % c, False, repr(ex)[:400]); traceback.print_exc()


# ================================================================ 3. sisbooks2：學姊第二次傳書
SB2_MSG = {'n': ['我今天搬研究室。清出三本大二上的書。', '明天放男宿管理室。'], 'd': ['我今天搬研究室。清出三本大二上的書。', '明天你搬宿舍，我拿過去。']}
SB2_OPTS = {'n': ['謝謝學姊。', '研究室在哪？', '上次那三本我還在用。'], 'd': ['我下去接妳。', '很重的話我去拿。']}
SB2_REPLY = {'謝謝學姊。': '這次比較重。', '研究室在哪？': '五樓。窗戶對著一棵樹。', '上次那三本我還在用。': '那就好。這三本也一樣。', '我下去接妳。': '好。四點。', '很重的話我去拿。': '不重。……有一點。'}
SB2_BOX = [('', '（管理室有你的一箱書。上面貼著一張便利貼，跟上次一樣。）'), ('', '（便利貼：「行政法、刑分、物權。後半本我擦掉了，換你寫。」）'), ('', '（下面還有一行，比較小：「以後的書，問 Kevin。」）')]
SB2_CODE = [('', '（箱子最下面還有一本舊法典，側邊貼滿了索引貼。）'), ('', '（另一張便利貼：「條文是舊的，不要用。貼法可以照抄。」）')]
SB2_DATE = [('', '（管理室前面，書瑀坐在一個紙箱上。）'), ('@', '行政法、刑分、物權。後半本我擦掉了。'), ('@', '……換你寫。'), ('', '（箱子最下面是她的舊法典，側邊貼滿了索引貼。）'), ('@', '條文是舊的，不要用。貼法可以照抄。')]
SB2_ECHO = {'n': ['（你翻開學姊的行政法。她的字停在一半。）', '（老師講到第一個重點。你在空白的地方，寫了第一行自己的字。）'], 'd': ['（你翻開書瑀的行政法。她的字停在一半。）', '（老師講到第一個重點。你在空白的地方，寫了第一行自己的字。）']}
SB2_REL = {'fam': "LV('heroine_05',25,10,5)", 'friend': "LV('heroine_05',45,30,10)", 'dating': "(F.dating_heroine_05=true, LV('heroine_05',65,50,45,{npcRom:60,rom:40}))"}
ADMIN_ITEM = """(()=>{ try{ const it=CLS.dayItems(GAME.G).find(q=>q.c&&q.c.id==='admin_law'&&!q.exam); if(!it) return null; return {key:it.key,t0:it.t0,t1:it.t1,status:CLS.status(GAME.G,it),done:!!CLS.rec(GAME.G).done[it.key]}; }catch(e){ return 'ERR '+e.message; } })()"""


async def sb2_case(pg, cdp, run, case):
    if case not in SB2_REL: run.check('SB2＝%s 認得' % case, False, 'fam、friend、dating'); return
    v = 'd' if case == 'dating' else 'n'
    st, d = await state_at(pg, '2026-09-05', 16.92, 'dorm', flags={'SIS_OLD_BOOKS': True, 'met_sis': True, 'SIS_W1': True})
    await load(pg, cdp, run, st, 'sisbooks2 %s：最小存檔 2026-09-05（六）16:55 宿舍；第一次傳書拿過（SIS_OLD_BOOKS）、認識學姊（met_sis）、還沒搬房間' % case, js="NOKX(); return %s;" % SB2_REL[case])
    sis = await names_of(pg, 'heroine_05')
    n0 = await pl_len(pg)
    got, M = await wait_msg(pg, cdp, run, 'sis_books2', ENVI('VF_WAIT', 600), 'sb2_%s_wait' % case)
    run.check('sisbooks2 %s：9/5 17:05 學姊私訊 %s＋回覆鍵 %s' % (case, J(SB2_MSG[v]), J(SB2_OPTS[v])),
              got and [m['text'] for m in M] == SB2_MSG[v] and M[0]['day'] == '2026-09-05' and abs(M[0]['h'] - (17 + 5 / 60)) < 0.02 and M[-1]['opts'] == SB2_OPTS[v], J(M))
    if not got: return
    lab = SB2_OPTS[v][0]
    a = await answer(pg, cdp, run, ('eq', 'sis_books2_ask'), lab, 'sb2_' + case)
    await play(pg, cdp, run, "(t=>(GAME.G.msgs||[]).some(m=>m&&(PHONE.th?PHONE.th(m):m.th)==='p:heroine_05'&&m.text===t))(%s)" % J(SB2_REPLY[lab]), max_s=60, ff=False, tag='sb2_%s_reply' % case)
    th = await pg.evaluate(THREAD, 'p:heroine_05')
    run.check('sisbooks2 %s：點「%s」→ 學姊「%s」' % (case, lab, SB2_REPLY[lab]), bool(a) and a['tapped'] == lab and any(x[0] == 'heroine_05' and x[1] == SB2_REPLY[lab] for x in th), J({'a': a, 'thread': th[-5:]}))
    ok = await play(pg, cdp, run, EVDONE % J('ev_sis_books_y2s1'), max_s=ENVI('SB2_MAX', 1500), picks=['（拿出'], ff=True, tag='sb2_' + case, shots_at=['管理室'])
    R = await rows(pg, n0); Ls = said(R)
    want = sub(SB2_DATE, sis) if v == 'd' else SB2_BOX + (SB2_CODE if case == 'friend' else [])
    okq, gotl, ib = after(Ls, want[0], want[1:])
    iu = next((i for i, (_, t) in enumerate(Ls) if t == '一年。房間比去年滿一點。'), None)
    r0 = row_of(R, want[0][1]); bg = bg_before(R, r0)
    run.note('sisbooks2 %s：9/6 說的 %s；書箱那一段的背景 %s' % (case, J([x for x in Ls if '房間' in x[1] or '管理室' in x[1] or '便利貼' in x[1] or x[0] in sis][:14]), bg))
    run.check('sisbooks2 %s：床快轉 → 9/6 搬房間拆完（「一年。房間比去年滿一點。」）以後，管理室那一箱：%s' % (case, '→'.join(w[1][:12] for w in want)),
              ok and okq and iu is not None and ib is not None and iu < ib and bool(r0) and r0['d'] == '2026-09-06', J({'got': gotl, 'unbox': iu, 'box': ib, 'at': r0 and [r0['d'], r0['h'], r0['z']]}))
    if v == 'n':
        run.check('sisbooks2 %s：%s' % (case, '朋友以上＝多舊法典兩句' if case == 'friend' else '只是有點熟＝沒有舊法典那兩句'), (case == 'friend') == any(t == SB2_CODE[0][1] for _, t in Ls))
    fl = await pg.evaluate("(()=>({b2:!!GAME.G.flags.SIS_OLD_BOOKS_2,code:!!GAME.G.flags.SIS_OLD_CODE}))()")
    run.check('sisbooks2 %s：記 SIS_OLD_BOOKS_2%s' % (case, '、SIS_OLD_CODE' if case != 'fam' else '（沒有 SIS_OLD_CODE）'), fl['b2'] and fl['code'] == (case != 'fam'), J(fl))
    await run.shot(pg, 'sb2_%s_box' % case)

    async def to_class():
        it = await pg.evaluate(ADMIN_ITEM)
        if not isinstance(it, dict) or it['done'] or it['status'] not in ('open', 'upcoming'): return False
        h = (await P.clock(pg))['h']
        if h < it['t0'] - 0.6: return False
        await P.phone_tab(pg, cdp, 'today')
        sel = '#phoneBody [data-go="%s"]' % it['key']
        if not await pg.evaluate("s=>!!document.querySelector(s)", sel): await L.close_panels(pg, cdp); return False
        await run.shot(pg, 'sb2_%s_today' % case); await L.tap(pg, cdp, sel); await pg.wait_for_timeout(2500)
        run.note('sisbooks2 %s：手機「今天」→「直接去上課」行政法（%s）' % (case, J(it))); return True
    n1 = await pl_len(pg)
    until = "(()=>!!GAME.G.flags.SIS_BOOKS2_ECHO||CALENDAR.dateOf(GAME.G.day).key>'2026-09-07'||(CALENDAR.dateOf(GAME.G.day).key==='2026-09-07'&&GAME.G.hour>=13))()"
    await play(pg, cdp, run, until, max_s=ENVI('SB2_MAX', 1500), picks=['直接去上課：行政法', '繼續去上課：行政法'], ff=True, tag='sb2_%s_class' % case, on_idle=to_class, shots_at=['她的字停在一半'])
    R1 = await rows(pg, n1); L1 = said(R1); echo = await pg.evaluate("GAME.G.flags.SIS_BOOKS2_ECHO||null")
    okc, gc, ic = after(L1, ('', SB2_ECHO[v][0]), [('', SB2_ECHO[v][1])])
    r1 = row_of(R1, SB2_ECHO[v][0])
    run.note('sisbooks2 %s：9/7 行政法前後說的 %s' % (case, J(L1[max(0, (ic or 0) - 4):(ic or 0) + 4])))
    run.check('sisbooks2 %s：9/7 第一堂行政法（老師那一句之後）兩句旁白「%s」「%s」、記 SIS_BOOKS2_ECHO' % (case, SB2_ECHO[v][0][:14], SB2_ECHO[v][1][:14]),
              okc and bool(echo) and bool(r1) and r1['d'] == '2026-09-07' and sum(1 for _, t in L1 if t == SB2_ECHO[v][0]) == 1, J({'got': gc, 'echo': echo, 'at': r1 and [r1['d'], r1['h'], r1['z']], 'before': L1[max(0, (ic or 0) - 2):(ic or 0)]}))


async def m_sisbooks2(pg, cdp, run):
    for c in ENV('SB2', 'friend'):
        run.note('==== sisbooks2：%s ====' % c)
        try: await sb2_case(pg, cdp, run, c)
        except Exception as ex: run.check('sisbooks2 %s：跑完（沒有探針例外）' % c, False, repr(ex)[:400]); traceback.print_exc()


# ================================================================ 4. walkchat：同行聊天、手機小事
WC_PREFIX = {'yu': 'w118_yu_', 'classmate_bohan': 'w118_bh_', 'classmate_xinci': 'w118_xc_', 'zhe': 'w118_zhe_', 'heroine_01': 'w118_an_', 'heroine_03': 'w118_yt_'}
WC_CAT = {'library': '念書', 'cafe': '喝咖啡、喝茶', 'noodle': '吃飯'}
WC_VERB = {'library': '去總圖一起念書', 'cafe': '去兩點半 Café 坐坐', 'noodle': '去阿鳳麵店吃飯'}
WC_PLACES = """(([id,cur])=>{ const out=[]; for(const pid of ['library','cafe','noodle']){ const P=INV.place?INV.place(pid):null; if(!P){ out.push({pid,err:'no place'}); continue; }
    const same=P.zone===cur||(P.zone==='library_hall'&&cur==='library')||(P.zone==='library'&&cur==='library_hall'); let why=null, pk=null; try{ why=INV.placeWhy?INV.placeWhy(GAME.G,id,P):null; }catch(e){ why='ERR '+e.message; }
    try{ pk=INV.walkPick(GAME.G,id,pid); }catch(e){} out.push({pid,zone:P.zone,same,why:why||null,lines:pk?pk.lines:null,ask:pk?(pk.ask||null):null}); }
  return {places:out, said:Object.keys(GAME.G.flags.walkSaid||{}), n:((GAME.G.flags.walkChatN||{})[id])|0, pool:(()=>{ const w=((INVITE_DATA.people||{})[id]||{}).walk||{}; const L=[]; for(const k in w) for(const e of [].concat(w[k])) if(e&&e.one) L.push(e.one); return L; })()}; })"""
WC_STATE = """(id=>({said:Object.assign({},GAME.G.flags.walkSaid||{}), iv:(GAME.G.invites||[]).filter(v=>v.who===id).map(v=>({state:v.state,place:v.place,zone:v.zone,chat:!!v.chat}))}))"""


async def wc_walk(pg, cdp, run, cid):
    tag = 'wc_' + cid
    st0, _ = await state_at(pg, '2025-10-06', 10.0, 'dorm')
    await load(pg, cdp, run, st0, '%s：先讀一份最小存檔（只為了在頁面裡讀作息）' % tag)
    cand = await pg.evaluate(FACE_FIND, [cid, '2025-10-07', '2025-10-24', None, ['library', 'library_hall', 'cafe', 'noodle', 'wenzhou', 'lawlib', 'gongguan', 'campus', 'wancai', 'linze']])
    run.note('%s：大一上第 6～8 週他在哪（讀 STORY.schedEnt／presence，只讀）：%s' % (tag, J(cand)))
    if not isinstance(cand, list) or not cand: run.check('%s：找得到他（不是上課）的時間' % tag, False, J(cand)); return
    c = cand[0]
    st, d = await state_at(pg, c['key'], c['h'], c['zone'])
    await load(pg, cdp, run, st, '%s：最小存檔 %s %.2f %s（他照作息在這裡：%s）；朋友（熟 45／信任 30：柏翰大一的「一句」有一句要朋友以上）' % (tag, c['key'], c['h'], c['zone'], c['act']), js="NOKX(); return LV(%s,45,30,10);" % J(cid))
    await play(pg, cdp, run, None, max_s=12, ff=False, tag=tag + '_settle')   # 進區域的事件先演完（點過去）
    w = await P.wait_present(pg, cid, 90)
    if not w or w['hidden']: run.check('%s：看得到他' % tag, False, J(w)); return
    if w['dMe'] > 25: await P.place_near(pg, run, w['x'], w['z'], 7.0, w['lv'], cid)   # [前置] 大區域：從他 7 m 外開始走
    nm = await names_of(pg, cid)
    pl = await pg.evaluate(WC_PLACES, [cid, c['zone']])
    pick = next((p for p in pl['places'] if not p.get('err') and not p['same'] and not p['why'] and p['lines'] and not p['ask']), None)
    run.note('%s：可以約的地點、路上會說的那一句（INV.walkPick，只讀）：%s' % (tag, J(pl)[:1500]))
    run.check('%s：他有同行聊天的句子（walk 裡 w118_ 鍵 %d 個；AA_555 以前沒有）' % (tag, sum(1 for k in pl['pool'] if k.startswith(WC_PREFIX.get(cid, 'w118_')))), any(k.startswith(WC_PREFIX.get(cid, 'w118_')) for k in pl['pool']), J(pl['pool'])[:600])
    if not pick: run.check('%s：有一個地點（不是他現在那一區）路上說得出話' % tag, False, J(pl)); return
    n0 = await pl_len(pg); said0 = set(pl['said'])
    r = await P.talk_to(pg, cdp, run, cid, tag, picks=['約', WC_CAT[pick['pid']], WC_VERB[pick['pid']], '現在一起過去'], max_s=420)
    s1 = await pg.evaluate(WC_STATE, cid)
    going = any(v['state'] == 'going' and v['place'] == pick['pid'] for v in s1['iv'])
    run.check('%s：走到旁邊「和他說話」→「約…」→「%s」→「現在一起過去」＝一起走（invite going）' % (tag, WC_VERB[pick['pid']]), bool(r) and (going or any(v['place'] == pick['pid'] for v in s1['iv'])), J({'opts': r and r.get('opts'), 'picked': r and r.get('picked'), 'iv': s1['iv']}))
    t0 = time.time(); caps = []
    while time.time() - t0 < ENVI('WALK_WAIT', 120):
        caps = [x for x in await rows(pg, n0, 'cap') if x['n'] in nm]
        if len(caps) >= len(pick['lines']): break
        s = await P.ts(pg)
        if s['dlg']: await L.tap(pg, cdp, '#dlg')
        elif s['phone'] and not s['ch']: await L.phone_away(pg, cdp, tries=1)
        await pg.wait_for_timeout(1500)
    await run.shot(pg, tag + '_caption')
    s2 = await pg.evaluate(WC_STATE, cid); new = [k for k in s2['said'] if k not in said0]
    run.check('%s：一起走 6 秒以後字幕（名字 %s）＝%s；記 walkSaid 的 %s 鍵' % (tag, '/'.join(sorted(nm)), J(pick['lines']), WC_PREFIX.get(cid, 'w118_')),
              [x['t'] for x in caps][:len(pick['lines'])] == pick['lines'] and any(k.startswith(WC_PREFIX.get(cid, 'w118_')) for k in new), J({'caps': [[x['n'], x['t'], x['d'], x['h']] for x in caps], 'new': new, 'iv': s2['iv']}))


DP_COUNT = """(()=>{ if(typeof AA555==='undefined') return null; const D=(STORY.DAILY_PHONE||[]).filter(d=>/^a118_/.test(d.id)); const by={}; for(const d of AA555.DP) by[d.who]=(by[d.who]||0)+1; for(const a of AA555.AT) by[a[1]]=(by[a[1]]||0)+1;
  return {dp:AA555.DP.length, at:AA555.AT.length, inDaily:D.length, dailyAll:(STORY.DAILY_PHONE||[]).length, then:AA555.DP.filter(d=>d.then).length, by}; })()"""
A118_GOT = """(()=>{ const G=GAME.G, out=[]; for(const m of (G.msgs||[])){ const tg=String((m&&m.tag)||''); let mm=/^dp_(a118_.+)_(\\d+)_(\\d+)$/.exec(tg), exp=null, who=null;
    if(mm){ const d=AA555.DP.find(x=>x.id===mm[1]); try{ const it=d?d.items(G):null; exp=it&&it[+mm[3]]?it[+mm[3]].text:null; }catch(e){ exp='ERR '+e.message; } who=d?d.who:null; }
    else if((mm=/^a118_(?!then_)(.+)_(\\d+)$/.exec(tg))){ const a=AA555.AT.find(x=>x[0]===mm[1]); try{ const it=a?a[5](G):null; exp=it&&it[+mm[2]]?it[+mm[2]].text:null; }catch(e){ exp='ERR '+e.message; } who=a?a[1]:null; }
    else if(/^a118_then_/.test(tg)){ who=m.from; exp=null; }
    else continue;
    out.push({tag:tg,from:m.from||null,who,text:String(m.text||''),exp,th:(PHONE.th?PHONE.th(m):m.th),day:CALENDAR.dateOf(m.day).key,h:m.h!=null?+(+m.h).toFixed(2):null}); }
  return out; })()"""


async def wc_phone(pg, cdp, run):
    cnt = await pg.evaluate(DP_COUNT)
    run.note('AA555 手機小事池（只讀）：%s' % J(cnt))
    run.check('walkchat：AA555 手機小事 DP＋AT 約 85 則（實際 %s）、DP 全部加進 STORY.DAILY_PHONE' % (cnt and cnt['dp'] + cnt['at']), bool(cnt) and 80 <= cnt['dp'] + cnt['at'] <= 95 and cnt['inDaily'] == cnt['dp'], J(cnt))
    w5 = await P.day_of(pg, ['Y1S1', 5, 1])
    st, d = await state_at(pg, w5['key'], 21.5, 'dorm')
    js = ("NOKX(); const r=['heroine_03','zhe','yu','classmate_bohan','classmate_xinci','heroine_01'].map(id=>LV(id,25,10,5)); JOIN('noodle_team','法一吃飯'); JOIN('public_law','公法讀書會');"
          " return {rel:r.map(x=>x.id+':'+x.level), grp:['noodle_team','public_law'].filter(g=>PHONE.inGroup(G,g))};")
    await load(pg, cdp, run, st, 'walkchat 手機：最小存檔 %s（大一上第 5 週週一）21:30 宿舍；六位有點熟、有聯絡方式（一個月前）' % w5['key'], js=js)
    days = ENVI('WC_DAYS', 7); k_end = (await P.day_of(pg, ['Y1S1', 5, 1]))['d'] + days
    await play(pg, cdp, run, "GAME.G.day>=%d" % k_end, max_s=ENVI('WC_MAX', 2400), ff=True, tag='wc_phone')
    got = await pg.evaluate(A118_GOT)
    run.note('walkchat 手機：%d 天內收到的 a118（AA_555／AA_118）手機小事：%s' % (days, J(got)[:3000]))
    bad = [x for x in got if x['exp'] is not None and (x['text'] != x['exp'] or x['from'] != x['who'])]
    run.check('walkchat 手機：床快轉 %d 天，收到 AA_555 的手機小事（至少 1 則）、每一則照稿（DP.items／AT 的那一則）、寄件人對' % days, len(got) >= 1 and not bad, J({'n': len(got), 'bad': bad[:5]}))
    cnt21 = [x for x in got if x['tag'].startswith('a118_y1s1_bh_count_')]
    if cnt21:
        run.check('walkchat 手機：柏翰「期中前二十一天。」起每天一則（國字）', cnt21[0]['text'] == '期中前二十一天。' and all(x['from'] == 'classmate_bohan' for x in cnt21), J(cnt21[:4]))
    if got:
        th = got[0]['th']; await P.phone_thread(pg, cdp, th, open_folds=False); await run.shot(pg, 'wc_phone_thread'); await L.close_panels(pg, cdp)


async def m_walkchat(pg, cdp, run):
    for cid in ENV('WC_WHO', 'yu,classmate_bohan,classmate_xinci'):
        run.note('==== walkchat：%s ====' % cid)
        try: await wc_walk(pg, cdp, run, FALIAS.get(cid, cid))
        except Exception as ex: run.check('walkchat %s：跑完（沒有探針例外）' % cid, False, repr(ex)[:400]); traceback.print_exc()
    if os.environ.get('WC_PHONE', '1') == '1':
        run.note('==== walkchat：手機小事 ====')
        try: await wc_phone(pg, cdp, run)
        except Exception as ex: run.check('walkchat 手機：跑完（沒有探針例外）', False, repr(ex)[:400]); traceback.print_exc()


# ================================================================ 5. libdesk：總圖服務台
R1_OPT, R1_LINE = '借《臺灣原生植物圖鑑》', '那本只能在館內看。'


async def desk(pg, cdp, run, tag, pick=None):
    """走到「服務台」按下去；選單有 pick 就選、沒有就「（離開）」。回傳選單、說的話"""
    it = await L.find_it(pg, '服務台')
    if not it: return {'ok': False, 'why': '這一區沒有「服務台」', 'zone': (await P.clock(pg))['zone']}
    n0 = await pl_len(pg)
    await L.go_to(pg, cdp, run, it['x'], it['z'], 0.9, '服務台', max_s=180, lv=it['lv'], stop=lambda s: s['interact'].startswith('服務台'))
    await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1500)
    menus, t0, hit = [], time.time(), False
    while time.time() - t0 < ENVI('LIB_WAIT', 60):
        s = await P.ts(pg)
        if s['ch']:
            menus.append([o['t'] for o in s['ch']]); await run.shot(pg, '%s_menu%d' % (tag, len(menus)))
            k = next((i for i, o in enumerate(s['ch']) if pick and o['t'].startswith(pick)), None)
            if k is not None: hit = True
            else: k = next((i for i, o in enumerate(s['ch']) if o['t'].startswith('（離開）')), len(s['ch']) - 1)
            await P.tap_choice(pg, cdp, k); await pg.wait_for_timeout(1200); continue
        if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(700); continue
        if s['phone']: await L.phone_away(pg, cdp, tries=1); continue
        if not s['busy'] and time.time() - t0 > 6: break
        await pg.wait_for_timeout(700)
    return {'ok': True, 'menus': menus, 'picked': hit, 'said': said(await rows(pg, n0))}


async def m_libdesk(pg, cdp, run):
    fri = await P.day_of(pg, ['Y2S1', 12, 5])
    st, d = await state_at(pg, fri['key'], 10.0, 'library_hall')
    await load(pg, cdp, run, st, 'libdesk：最小存檔 %s（大二上第 12 週週五）10:00 總圖大廳；方奕廷有點熟（還沒回過「總圖五樓最裡面。」）' % fri['key'], js="NOKX(); return LV('npc_fangyt',25,10,5);")
    await play(pg, cdp, run, None, max_s=12, ff=False, tag='lib_settle')
    r0 = await desk(pg, cdp, run, 'lib_ctrl')
    flat = [t for m in r0.get('menus', []) for t in m]
    run.check('libdesk 控制組（還沒回方奕廷）：服務台沒有「%s」、館員沒有說「%s」' % (R1_OPT, R1_LINE), r0['ok'] and not any('臺灣原生植物圖鑑' in t for t in flat) and not any(t == R1_LINE for _, t in r0['said']), J(r0))
    s1 = await snap(pg)
    sun = await pg.evaluate("(()=>{ const d=STORY.termDay('Y2S1',12,1)+6; const t=CALENDAR.termOf(d); return {key:CALENDAR.dateOf(d).key, wd:CALENDAR.dateOf(d).wd%7, week:t&&t.week, term:t&&t.id}; })()")
    await jump(pg, cdp, run, s1, sun['key'], 20.83, zone='dorm', pos=None, note='同一份進度；大二上第 %s 週週日（%s）20:50 宿舍' % (sun['week'], sun['wd']))
    ok = await play(pg, cdp, run, "(GAME.G.msgs||[]).some(m=>m&&m.ask&&/_fy_quiet$/.test(m.ask.id||''))", max_s=ENVI('VF_WAIT', 600), ff=False, tag='lib_wait')
    fy = await pg.evaluate("(()=>(GAME.G.msgs||[]).filter(m=>m&&(PHONE.th?PHONE.th(m):m.th)==='p:npc_fangyt').map(m=>[String(m.text||''),CALENDAR.dateOf(m.day).key,m.h,m.ask?m.ask.id:null]))()")
    run.check('libdesk：%s 21:00「這週的訊息」有方奕廷「期末想找一個安靜的地方讀書。你知道哪裡沒有人嗎？」' % sun['key'], ok and any(x[0] == '期末想找一個安靜的地方讀書。你知道哪裡沒有人嗎？' for x in fy), J(fy))
    if not ok: return
    a = await answer(pg, cdp, run, ('suffix', '_fy_quiet'), '總圖五樓最裡面。', 'lib_fy')
    await play(pg, cdp, run, "(GAME.G.msgs||[]).some(m=>m&&(PHONE.th?PHONE.th(m):m.th)==='p:npc_fangyt'&&m.text==='你也在那喔')", max_s=60, ff=False, tag='lib_reply')
    th = await pg.evaluate(THREAD, 'p:npc_fangyt'); fl = await pg.evaluate("GAME.G.flags.NEED_ANS_fy_quiet")
    run.check('libdesk：在方奕廷的對話點「總圖五樓最裡面。」→「你也在那喔」「好啊 那我去」、記 NEED_ANS_fy_quiet',
              bool(a) and a['tapped'] == '總圖五樓最裡面。' and fl is not None and any(x[1] == '你也在那喔' for x in th), J({'a': a, 'flag': fl, 'thread': th[-4:]}))
    s2 = await snap(pg)
    mon = await pg.evaluate("k=>CALENDAR.dateOf(STORY.dayOfKey(k)+1).key", sun['key'])
    await jump(pg, cdp, run, s2, mon, 10.0, zone='library_hall', pos=None, note='回過方奕廷以後的進度；隔天 10:00 總圖大廳')
    await play(pg, cdp, run, None, max_s=12, ff=False, tag='lib_settle2')
    r1 = await desk(pg, cdp, run, 'lib_r1', pick=R1_OPT)
    flat1 = [t for m in r1.get('menus', []) for t in m]; asked = await pg.evaluate("GAME.G.flags.LOAN_R1_ASKED||null")
    run.check('libdesk：回過以後服務台有「%s」→ 館員「%s」、記 LOAN_R1_ASKED' % (R1_OPT, R1_LINE),
              r1['ok'] and any(t.startswith(R1_OPT) for t in flat1) and any(n == '館員' and t == R1_LINE for n, t in r1['said']) and asked is not None, J({'r1': r1, 'asked': asked}))
    r2 = await desk(pg, cdp, run, 'lib_again')
    flat2 = [t for m in r2.get('menus', []) for t in m]
    run.check('libdesk：問過一次以後服務台不再有「%s」' % R1_OPT, r2['ok'] and not any('臺灣原生植物圖鑑' in t for t in flat2), J(r2))


# ================================================================ 6. y2end：大二下期末最後一頓、家族聚餐
LAST_MEAL = [('', '（大二下最後一科考完。）'), ('阿姨', '明年你們大三了。……我記得你們大一的樣子。')]
FAM_MSG = [('kevin', '這學期的家聚！！禮拜五七點 公館那間'), ('kevin', '學弟妹第一次來 大家要到喔'), ('heroine_05', '好。')]
FAM_EV = [('', '（長桌的一頭坐著四個大一的學弟妹。學姊進門的時候，他們同時站了起來。）'), ('Kevin 學長', '坐啦坐啦，她又不是教授。'), ('@', '……坐。我坐下來你們再坐。'), ('', '（她坐下來。學弟妹又站了一次，才坐好。）')]


async def y2_lastmeal(pg, cdp, run):
    nd = (await P.day_of(pg, '2025-10-02'))['d']
    st, d = await state_at(pg, '2027-06-01', 10.0, 'dorm', flags={'noodleTableDay': nd})
    r = await load(pg, cdp, run, st, 'lastmeal：最小存檔 2027-06-01 10:00 宿舍（大二下）；麵店團成立（noodleTableDay＝2025-10-02）',
                   js="NOKX(); LV('zhe',45,30,10); const g=JOIN('noodle_team','法一吃飯'); const e=CLS.lastExamEnd(G,'Y2S2','final'); return {grp:g, e:e?{day:e.day,key:CALENDAR.dateOf(e.day).key,h:e.h}:null};")
    e = r and r.get('e')
    run.check('lastmeal：大二下有最後一科期末考（CLS.lastExamEnd，讀）', bool(e), J(r))
    if not e: return
    s1 = await snap(pg)
    await jump(pg, cdp, run, s1, e['key'], 16.83, zone='dorm', pos=None, note='最後一科（%.2f 考完）那天 16:50 宿舍' % e['h'])
    got, M = await wait_msg(pg, cdp, run, 'y2s2_final_ask', ENVI('VF_WAIT', 600), 'lastmeal_wait')
    run.check('lastmeal：那天 17:00 阿哲「考完了 七點，麵店」（法一吃飯群組）', got and len(M) == 1 and M[0]['text'] == '考完了 七點，麵店' and M[0]['from'] == 'zhe' and M[0]['day'] == e['key'] and abs(M[0]['h'] - 17) < 0.05, J(M))
    if M: await P.phone_thread(pg, cdp, M[0]['th'], open_folds=False); await run.shot(pg, 'lastmeal_group'); await L.close_panels(pg, cdp)
    n0 = await pl_len(pg)
    gp = await go_place(pg, cdp, run, 'noodle')
    ok = await play(pg, cdp, run, EVDONE % J('ev_term_last_meal_y2s2'), max_s=ENVI('Y2_MAX', 600), ff=False, tag='lastmeal', shots_at=['明年你們大三了'])
    R = await rows(pg, n0); Ls = said(R); r0 = row_of(R, LAST_MEAL[0][1])
    okq, gl, _ = after(Ls, LAST_MEAL[0], LAST_MEAL[1:])
    run.note('lastmeal：走進麵店以後說的 %s；背景 %s' % (J(Ls[:10]), bg_before(R, r0)))
    run.check('lastmeal：手機「地點」→ 阿鳳麵店 → 旁白「（大二下最後一科考完。）」→ 阿姨「明年你們大三了。……我記得你們大一的樣子。」', gp['ok'] and ok and okq, J({'go': gp, 'got': gl, 'said': Ls[:6]}))
    await run.shot(pg, 'lastmeal_end')


async def y2_famdinner(pg, cdp, run):
    st, d = await state_at(pg, '2027-03-09', 20.83, 'dorm')
    await load(pg, cdp, run, st, 'famdinner：最小存檔 2027-03-09（二）20:50 宿舍（大二下第 3 週）', js="NOKX(); LV('heroine_05',25,10,5); return {grp:JOIN('family_law','法律系直屬家族')};")
    sis = await names_of(pg, 'heroine_05')
    got, M = await wait_msg(pg, cdp, run, 'fam_dinner_y2s2_invite', ENVI('VF_WAIT', 600), 'fam_wait')
    run.check('famdinner：3/9 21:00 家族群組 Kevin「這學期的家聚！！禮拜五七點 公館那間」「學弟妹第一次來 大家要到喔」、學姊「好。」',
              got and [(m['from'], m['text']) for m in M] == FAM_MSG and all(m['th'] == 'g:family_law' and m['day'] == '2027-03-09' and abs(m['h'] - 21) < 0.05 for m in M), J(M))
    if M: await P.phone_thread(pg, cdp, 'g:family_law', open_folds=False); await run.shot(pg, 'fam_group'); await L.close_panels(pg, cdp)
    s1 = await snap(pg)
    await jump(pg, cdp, run, s1, '2027-03-12', 18.17, zone='dorm', pos=None, note='同一份進度；3/12（五）18:10 宿舍（學期中快轉只停自己房間的 auto 事件，別區的家聚不停，所以直接跳）')
    n0 = await pl_len(pg)
    await play(pg, cdp, run, None, max_s=12, ff=False, tag='fam_settle')
    toasts = [x['t'] for x in await rows(pg, n0, 'toast')]
    run.check('famdinner：3/12 18:00～19:00 提示「今天 19:00 家族聚餐（公館）」', any('今天 19:00 家族聚餐（公館）' in t for t in toasts), J(toasts))
    gp = await go_place(pg, cdp, run, 'gongguan')
    ok = await play(pg, cdp, run, EVDONE % J('ev_family_dinner_y2s2'), max_s=ENVI('Y2_MAX', 600), ff=False, tag='famdinner', shots_at=['坐啦坐啦', '我坐下來你們再坐'])
    R = await rows(pg, n0); Ls = said(R); want = sub(FAM_EV, sis)
    okq, gl, _ = after(Ls, want[0], want[1:]); r0 = row_of(R, want[0][1])
    run.note('famdinner：到公館以後說的 %s；背景 %s；%s' % (J(Ls[:10]), bg_before(R, r0), r0 and [r0['d'], r0['h'], r0['z']]))
    run.check('famdinner：手機「地點」→ 公館 → 18:30 以後旁白 → Kevin 學長「坐啦坐啦，她又不是教授。」→ 學姊「……坐。我坐下來你們再坐。」→ 旁白',
              gp['ok'] and ok and okq and bool(r0) and r0['d'] == '2027-03-12' and 18.5 <= r0['h'] < 20.5, J({'go': gp, 'got': gl, 'said': Ls[:6]}))
    await run.shot(pg, 'fam_end')


async def m_y2end(pg, cdp, run):
    for s in ENV('Y2END', 'lastmeal,famdinner'):
        fn = {'lastmeal': y2_lastmeal, 'famdinner': y2_famdinner}.get(s)
        if not fn: run.check('Y2END＝%s 認得' % s, False, 'lastmeal、famdinner'); continue
        run.note('==== y2end：%s ====' % s)
        try: await fn(pg, cdp, run)
        except Exception as ex: run.check('y2end %s：跑完（沒有探針例外）' % s, False, repr(ex)[:400]); traceback.print_exc()


# ================================================================ main
MODEFN = {'vac2': m_vac2, 'grades': m_grades, 'sisbooks2': m_sisbooks2, 'walkchat': m_walkchat, 'libdesk': m_libdesk, 'y2end': m_y2end}


async def main():
    run = L.Run('cbe0429_' + '+'.join(MODES), OUT); os.makedirs(OUT, exist_ok=True)
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
