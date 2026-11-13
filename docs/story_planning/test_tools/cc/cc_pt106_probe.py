"""CC（帳號 A）11-02：第 106 組立繪接進遊戲（BB_224 第二批 #5）——十個人在遊戲裡說話時，ADV 有沒有用正式立繪（不是 compact）。
開發分支：f09d1c98＝前五張（npc_kevin、pool_1、pool_7、pool_11、pool_15）、6de9d75f＝後五張（pool_16、jp_caizhen、pool_20、pool_5、pool_4）；
  每人只有 assets/portraits/<id>/campus/neutral.webp（600×1000）；Kevin 不是 CHARACTERS 的人物，登記在 characters.js 的 PORTRAIT_ONLY（另外 camp_y1.js 開頭自己登 PORTRAITS.npc_kevin）。
探針只「客觀記錄＋截圖」：立繪好不好看、頭的位置對不對、去背乾不乾淨，由 BB 看截圖和數字判斷（不寫死「全部通過」）。

立繪 vs compact（src/adv3d.js）：GAME.say(who) 有 who.charId＝ADV.speaker(charId) → render → A.resolve：PORTRAIT_FILES（portrait_manifest.js）有檔＝<img>（.advSlot.show），
  沒有檔＝compact（#adv 加 class compact、框清空）。events3d.js 的台詞 speaker 用 X.speakerId（CHARACTERS／PORTRAIT_ONLY 的 alias，例：「采蓁」→ jp_caizhen）。
  只寫名字的說話者（開發分支 e46dd568／8faa0306c 以後，game3d.js showLine）：who 沒有 charId、不是 3D 人物（沒有 who.obj）時，GAME.portraitIdByName(名字)
    對到「唯一一個有立繪檔」的人物（CHARACTERS＋PORTRAIT_ONLY 的 name／alias）才用那個人的立繪；同名兩個以上、沒有立繪檔的照舊（ADV.speaker('player')／compact）。
    茶會的 Kevin 改帶 charId npc_kevin（story3d.js KV）。探針的 GAME.say 掛勾記 cid（who.charId）和 rcid（portraitIdByName 對到的）。
  版本：不寫死 SHA——用跑的時候的開發分支 head（要包含 8faa0306c；五張去背 LAWWW 會重做），SHA 只從環境變數印出來。

每個人一場（Kevin 兩場：宿營、茶會），每一場：點對話直到「那個人」說的那一句打完字（GAME.say 的 who.charId＝那個人，或名字對得上），
  ① 截圖：橫向 844×390、直向 390×844（同一頁同一句，切 viewport；同 cc_bg5_probe.py）
  ② DOM：#adv 有沒有 compact、ADV.slots、#advL／#advR 的 <img> src、框（getBoundingClientRect）、原圖尺寸、object-fit／object-position；
     用 PIL 讀原檔的 alpha 外框算「畫面上頭頂的 y、人的高度」（img 是 object-fit:contain、object-position:top）
  ③ 裁圖：截圖裡立繪實際畫出來的範圍另存 *_crop.png
  ④ 參考：最後同一個框暫時換成沈以安（heroine_01 campus/neutral）再量一次、拍 *_ref.png【捷徑：只為比較，不是玩家看得到的畫面】——兩個人頭頂 y、高度的數字給 BB 比
  另外一開始用 PIL 讀十張原檔：尺寸、模式、四邊（最外 1 px、4 px 帶）不透明比例、不透明邊緣裡灰色像素比例、半透明像素裡灰色比例、alpha 外框（客觀數字，不判斷）。
check 只客觀記錄：事件演出（那個人說了話）、那個人說話時不是 compact（他的 img 在框裡、框是 show）、src 是正式檔（assets/portraits/<id>/.../*.webp 且在 PORTRAIT_FILES）、
  截圖存在、沒有頁面 JS 例外。

十七場（觸發方式；【前置】＝最小存檔讀到條件成立的時間地點，遊戲自己演；【捷徑】＝寫理由）：
  kevin_camp  ev_camp_d1_ice（camp_y1.js:43；S.campY1 依 CAMP_SEQ 跑，第二段 8/22 10:30 破冰）。【前置】最小存檔 2025-08-22 10:24、CAMP_Y1_ON、campStep=1（遊覽車那段記成演過）
              → 讀檔時 game3d.js applySave 自己叫 STORY.campY1 resume，從破冰接著演；Kevin 第一句「（搶在她前面）第七小隊，有到！」（名字「凱文」）。
              沒開演＝【捷徑】void STORY.campY1(GAME,{resume:true,next:false})。
  kevin_tea   9/2 新生茶會（story3d.js:1440～1471）。【前置】最小存檔 2025-09-02 18:28 萬才館、KAI_MOVEIN、CAMP_Y1、MAIN_D1＝STORY.MAIN_D1_NEW、LAW_START_DAY＝8/29（tests/camp_y1_unit.js K 節的 setup）
              → 18:30 STORY.teaTick 自己演簽到桌（Kevin「{name}。這次是真的學長了。」）→ 像玩家走到窗邊家族那一桌 (3,3.6)、按「家族那一桌（新生茶會）」
              → Kevin「名牌終於發完了。」。兩句都拍（8faa0306c 以後兩句都應該有立繪）。簽到沒開演＝【捷徑】void STORY.teaSignIn；走不到那一桌＝【捷徑】void STORY.teaTable。
  pool_1      林采潔 認識（meetBook，pool3d.js meetVersion：舊路書房）。【前置】大一上第 3 週週二 14:00 bookstore → 像玩家走到她旁邊按「和…說話」。
  pool_7      曾靖雯 陪去旁聽 ev_pool_zjw_court（出遊；同 cc_bg5 court_hall）。【前置】大一下第 4 週週三 13:27 宿舍＋已經約好的出遊 → 等遊戲跳「出發」→ 點。
  pool_11     葉晨希 認識（pool_more3d.js MEETV：campus 那一筆＝週一、三 19～21 法律系館B旁邊 (97.5,-95)，吉他社沒社課的週）。【前置】大一上第 3 週週一 19:18 校園、站到她 4 m 外 → 走過去說話。
  pool_15     廖芸萱 哲學咖啡館 ev_pool_lyx_cafe（出遊；同 cc_bg5 phil_cafe）。大一下第 13 週週四 18:33。
  pool_16     詹立群 試教 ev_pool_lq_teach（出遊；同 cc_bg5 putong_empty）。大一下第 12 週週四 18:33。
  jp_caizhen  葛采蓁 日文上第一堂 ev_jp_g1（bbpack_events.js:30；bbpack3d.js g1：第一次去上日文上的那一堂 CLS.IN_CLASS 裡演）。
              【捷徑】DIRECT：要修日文上＋走進共同教學館上課的流程（選課、課表、教室），最小存檔做不到 → 存檔讀到大二上第 1 週週一 13:24 校園、void EVENTS.run(ev_jp_g1)
              （不是第 1 週那一堂的旗標 BBPACK._g1w1 沒設＝老師開頭那一句會出；之後「采蓁」說話）。
  pool_20     馬佳蓉 認識 meetB（萬才館法服值班：STORY.fafuDuty＝第 3 週起奇數週的週六 9～12）。【前置】大一上第 3 週週六 09:30 萬才館 → 走過去說話。
  pool_5      劉晏如 認識 meetCafe（兩點半 Café 11～17）。【前置】大一上第 3 週週二 14:00 cafe → 走過去說話。
  pool_4      黃郁婷 迎新報到桌 ev_pool_yt_desk（出遊；pool3d.js:243 acceptYt2，大二上第 1 週週三 08:30 法律系館A一樓）。【前置】08:03 宿舍＋已經約好的出遊；
              她只在第三個選項「「問旁邊那個班代。」」之後說話（picks）；立繪一開始就在（participants）。
  kevin_grad  Kevin 的畢業照 ev_sis15_kv_grad（data/sis_b15_events.js:174，speaker 'Kevin'→X.speakerId 對到 PORTRAIT_ONLY 的 npc_kevin；sis_b15_3d.js:91 GRAD_OUT）
              真實：2028-06-01 21:00 Kevin 在家族群組揪、回「去。」→ 6/3（六）10:30 法律系館A門口（學士服、學姊站在他旁邊）。
              【前置】2028-06-03 10:06 宿舍＋已經約好的出遊 sisb15_kv_grad、SIS15_KV_GRAD_GO、met_sis → 等「出發」→ 點。台上一開始是學姊（participants），Kevin 說話時進另一個框。
  yule_name   舊序章的人 偶遇（encounter3d.js ENC.meet；data/encounters.js:47 淡水 D13 可昕交往中，datingAfter {who:'舊序章的人',text:'我們什麼都沒看到。邵鈞，走。'}＝資料裡只寫名字的那一句，
              ENC.sayer → {name:'舊序章的人',charId:'yule'}；沒有 charId 時 portraitIdByName('舊序章的人') 也對到 yule）。
              【捷徑】真實要出遊到淡水（G.trip、D13 散步點）、和可昕交往中、日期＋地點＋時段的種子擲到她（S.decide）——最小存檔做不到；
              改成存檔 dating_kexin、ADV.begin({background:'dark'})＋void ENC.meet(GAME, D13 可昕那一列, {t:'dating'})（同 tests/yule_portrait_unit.js 第 5 項），選「打招呼」。
  neg_noportrait 反例：沒有立繪的人——宿營破冰的「小隊輔」（camp_y1.js:47「我是你們的小隊輔。名牌拿一下，名字上面都有。」；events3d 的 speaker 不是人物 id，ADV.speaker('小隊輔')
              → 沒有 PORTRAITS／PORTRAIT_FILES＝compact）。觸發同 kevin_camp（【前置】CAMP_Y1_ON、campStep=1，讀檔接著演）。
  neg_samename 反例：同名、多於一人——「學長」（台詞裡不同的人都叫「學長」：events.js:405、1939、3302…；不是人物、沒有立繪檔）。讀碼查過：CHARACTERS＋PORTRAIT_ONLY 裡
              沒有「兩個不同的人同名或同別名、而且都有立繪檔」的情況（只有同一人 name＝alias：Kevin、舊序章的人、舊序章的人）——探針執行時也在頁面重算一次（dupNames，記在 note）。
              事件 ev_grad_seniors_y1（events.js:1936「學弟，幫我們拍一張！」；campus、auto、大一下第 15 週週六 10～15 點）：【前置】那天 10:10 校園、**不關條件事件**（quiet 0）讓 EVENTS.tick 自己演；
              90 秒沒演＝【捷徑】void EVENTS.run(ev_grad_seniors_y1)。
  jp_liheng   立衡（id jp_liheng；a4abf3172 立繪）日本篇二手店 ev_jpb_r_shop（JP.SCH jpb_2_2a，2028-05-13（六）14:00 日本據點，挽回中＝沒有和以安交往）。
              【前置】最小存檔 2028-05-13 14:00 jp_hub、日本路線旗標（同 cc_bg5 的 JPF）、dating_heroine_01 false、ev_liheng_japan 記成演過（metLH，不然沒有立衡那兩句）→ 據點自己演；
              沒演＝【捷徑】void JP.playStop(GAME,jpb_2_2a,'jp')。立衡「這台比較安靜。……晚上寫論文，吵的會睡著。」
  jp_yuheng   宇恆（id jp_yuheng）日文上第 12 週小考後 ev_jp_g4b1（bbpack_events.js:105）。【捷徑】DIRECT：下課觸發（trigger class）要修課＋上完那一堂，最小存檔做不到 →
              大二上第 12 週週一 15:12 校園、JP_MET、void EVENTS.run(ev_jp_g4b1)；第一句就是宇恆「小考考完了。我要吃東西，腦袋沒電。」
  反例兩場的 check 反過來：說話時「是 compact」（框裡沒有任何立繪 img、#adv 有 compact）。
  3D 說話的四位（pool_1／11／20／5）：wait_present 90 秒沒出現、或三輪走不到／按了沒開始說話＝【捷徑】void EVENTS.run（暫時事件 {participants:[id],background:'blur',dialogue:POOL.LINES[id][那一場]}，
  同 POOL.run＝EVENTS.runLines 的做法；寫理由）。出遊的：PROMPT_S 秒內沒有自己開演＝【捷徑】void OUT.go(GAME,q)（同 cc_bg5）。

不是 iPhone：Playwright 手機模擬（is_mobile、觸控、SwiftShader 1～4 fps）。
用法：LW_TESTS=<工作樹>/tests SHA=<sha> [IDS=npc_kevin,pool_1,...] python3 cc_pt106_probe.py '<URL>/index.html?turbo' <輸出資料夾>
  IDS：人物 id（npc_kevin＝kevin_camp＋kevin_tea＋kevin_grad 三場、yule＝yule_name）或場次 key（kevin_camp、kevin_tea、kevin_grad、yule_name、neg_noportrait、neg_samename；neg_compact＝兩個反例）；預設全部十七場（含 jp_liheng、jp_yuheng）。
環境變數：ORIENT=both|land|port、REF=1（0＝不拍沈以安參考）、PROMPT_S（等開演，預設 90）、SPEAK_S（開演後等那個人說話，預設 240）、CASE_MAX（一場最多幾秒，預設 900）、
  RELAYOUT_MS（切方向後等多久，預設 1800）、STATS_ONLY=1（只用 PIL 印十張原檔的數字，不開瀏覽器）。
不要和別的瀏覽器測試同時跑（SwiftShader 搶 CPU）。"""
import os, sys, json, asyncio, time, copy, re, traceback

STATS_ONLY = os.environ.get('STATS_ONLY', '0') == '1'
ROOT = os.path.dirname(os.path.abspath(os.environ['LW_TESTS']))   # 工作樹根目錄（讀立繪原檔）
if not STATS_ONLY:
    sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
    sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__)))); import bbplay as P   # bbplay 在上一層（BB 的 test_tools）
    from playwright.async_api import async_playwright
from PIL import Image

URL = sys.argv[1] if len(sys.argv) > 1 else ''
OUT = sys.argv[2] if len(sys.argv) > 2 else os.path.join(os.getcwd(), 'cc_pt106_out')
J = lambda o: json.dumps(o, ensure_ascii=False)
IDS = [x.strip() for x in os.environ.get('IDS', '').replace('，', ',').split(',') if x.strip()]
ORIENT = os.environ.get('ORIENT', 'both').strip()
REF = os.environ.get('REF', '1') != '0'
PROMPT_S = int(os.environ.get('PROMPT_S', '90'))
SPEAK_S = int(os.environ.get('SPEAK_S', '240'))
CASE_MAX = int(os.environ.get('CASE_MAX', '900'))
RELAYOUT_MS = int(os.environ.get('RELAYOUT_MS', '1800'))
VP = {'land': {'width': 844, 'height': 390}, 'port': {'width': 390, 'height': 844}}
ONAME = {'land': '橫向 844×390', 'port': '直向 390×844'}
PEOPLE = ['npc_kevin', 'pool_1', 'pool_7', 'pool_11', 'pool_15', 'pool_16', 'jp_caizhen', 'pool_20', 'pool_5', 'pool_4', 'jp_liheng', 'jp_yuheng']
REF_ID = 'heroine_01'

# ---------------------------------------------------------------- 最小存檔（cc_dl04b_probe.py 的 state_at，同 cc_bg5_probe.py）
BASEF = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True, 'metAn': True, 'met_an': True, 'MET_ZHE': True,
         'zheNoodleDone': True, 'KX_FIRST_MSG': True, 'KX_EVE_MSG': True, 'FAM_GROUP_SENT': True, 'CEREMONY_Y1': True, 'KAI_MOVEIN': True, 'LAW_RECAP_SEEN': True,
         'fundsV2': 1, 'KX_DEC3_MIGRATED': True, 'dating_kexin': False}
ROOMS = (('ROOM_Y2', '2026-09-06'), ('ROOM_Y3', '2027-09-05'), ('ROOM_Y4', '2028-09-03'))
JPF = {'EXCHANGE_ROUTE': 'JP', 'EXCH_RULE': 1, 'X1_JP': ('DAY', '2028-02-20'), 'JP_DEPARTED': ('DAY', '2028-03-25'), 'AN_SENDOFF': 'together'}   # 人在日本（tests/jp_semester_unit.js inJapan()，同 cc_bg5_probe.py）
VISITED = ('noodle', 'cafe', 'library_hall', 'library', 'lawlib', 'wancai', 'linze', 'gongguan', 'wenzhou', 'soclib', 'cvs', 'bookstore')

# ---------------------------------------------------------------- 十七場（後兩場在 CASES += 那一段）
CASES = [
    dict(k='kevin_camp', who='npc_kevin', names=['凱文', 'Kevin'], kind='camp', ev='ev_camp_d1_ice', when='2025-08-22', load_h=10.4, zone='dorm',
         flags={'CAMP_Y1_ON': True, 'campStep': 1, 'CAMP_BUS': 'win'}, drop=['CEREMONY_Y1', 'KAI_MOVEIN', 'FAM_GROUP_SENT'],
         src='src/data/camp_y1.js:43 ev_camp_d1_ice（S.CAMP_SEQ 第 2 段；story3d.js:134 S.campY1；game3d.js applySave 的 CAMP_Y1_ON resume）'),
    dict(k='kevin_tea', who='npc_kevin', names=['Kevin'], kind='tea', when='2025-09-02', load_h=18.47, zone='wancai',
         flags={'KAI_MOVEIN': True, 'CAMP_Y1': True, 'FAM_GROUP_SENT': True, 'MAIN_D1': ('JS', 'STORY.MAIN_D1_NEW'), 'LAW_START_DAY': ('DAY', '2025-08-29')},
         table=(3.0, 3.6), tea_label='家族那一桌', picks=('「要，謝謝學長。」',),
         src='src/story3d.js:1448 teaSignIn（18:30 teaTick）、1457 teaTable（窗邊家族那一桌的互動點）；teaLines 的 Kevin 沒有 charId'),
    dict(k='pool_1', who='pool_1', names=['林采潔', '采潔'], kind='talk', when=['Y1S1', 3, 2], load_h=14.0, zone='bookstore', key='meetBook',
         src='src/pool3d.js meetVersion（C＝pool_1，bookstore→meetBook）；作息 src/data/pool_story.js:41 平日 13～17 舊路書房；台詞 pool_story.js:203 meetBook'),
    dict(k='pool_7', who='pool_7', names=['曾靖雯', '靖雯'], kind='outing', ev='ev_pool_zjw_court', when=['Y1S2', 4, 3], load_h=13.45, zone='dorm', match='旁聽',
         q=dict(id='pool_court_{d}', ev='ev_pool_zjw_court', h=14, late=0.5, place='臺北地方法院', title='陪靖雯去旁聽（臺北地方法院 14:00）', travel='捷運 約 20 分鐘', travelH=1 / 3),
         src='src/pool3d.js:228 POOL.acceptZjw 的 plan；台詞 pool_story.js:127 court'),
    dict(k='pool_11', who='pool_11', names=['葉晨希', '晨希'], kind='talk', when=['Y1S1', 3, 1], load_h=19.3, zone='campus', near=(97.5, -95.0), key='meet',
         src='src/pool_more3d.js MEETV[CX]（campus、沒有 terms＝meet）；作息 pool_story.js:79 週一三 19～21 (97.5,-95)、NO_GUITAR（吉他社 Y1S1 第 5～7、10～15 週才有課）；台詞 pool_story_b3.js:100 meet'),
    dict(k='pool_15', who='pool_15', names=['廖芸萱', '芸萱'], kind='outing', ev='ev_pool_lyx_cafe', when=['Y1S2', 13, 4], load_h=18.55, zone='dorm', match='哲學咖啡館',
         q=dict(id='pool_lyx_cafe_{d}', ev='ev_pool_lyx_cafe', h=19, late=0.5, place='文學院', title='廖芸萱：哲學咖啡館（文學院的教室 19:00）', travel='走過去約 10 分鐘', travelH=0.25),
         src='src/pool_more3d.js:379 planCafe；台詞 pool_story_b4.js:90 cafe'),
    dict(k='pool_16', who='pool_16', names=['詹立群', '立群'], kind='outing', ev='ev_pool_lq_teach', when=['Y1S2', 12, 4], load_h=18.55, zone='dorm', match='試教',
         q=dict(id='pool_lq_teach_{d}', ev='ev_pool_lq_teach', h=19, late=0.5, place='普通教學館', title='詹立群：試教（普通教學館的空教室 19:00）', travel='走過去約 10 分鐘', travelH=0.25),
         src='src/pool_more3d.js:256 acceptLq 的 planOut；台詞 pool_story_b2.js:107 teach'),
    dict(k='jp_caizhen', who='jp_caizhen', names=['采蓁', '葛采蓁'], kind='direct', ev='ev_jp_g1', when=['Y2S1', 1, 1], load_h=13.4, zone='campus',
         why='ev_jp_g1 只在第一次去上日文上那一堂（CLS.IN_CLASS，bbpack3d.js:171 g1）裡演：要修日文上＋走進共同教學館 102 上課（選課、課表、教室流程），最小存檔做不到',
         src='src/data/bbpack_events.js:30 ev_jp_g1；src/bbpack3d.js:171 g1'),
    dict(k='pool_20', who='pool_20', names=['馬佳蓉', '佳蓉'], kind='talk', when=['Y1S1', 3, 6], load_h=9.5, zone='wancai', key='meetB',
         src='src/pool_more3d.js MEETV[M]（wancai＋fafuDuty→meetB）；作息 pool_story.js:106 隔週六 9～12 萬才館 (1.9,1.6)（STORY.fafuDuty：第 3 週起奇數週）；台詞 pool_story_b2.js:163 meetB'),
    dict(k='pool_5', who='pool_5', names=['劉晏如', '晏如'], kind='talk', when=['Y1S1', 3, 2], load_h=14.0, zone='cafe', key='meetCafe',
         src='src/pool_more3d.js MEETV[LY]（cafe→meetCafe）；作息 pool_story.js:56 每天 11～17 兩點半 Café；台詞 pool_story_b3.js:47 meetCafe'),
    dict(k='pool_4', who='pool_4', names=['黃郁婷', '郁婷'], kind='outing', ev='ev_pool_yt_desk', when=['Y2S1', 1, 3], load_h=8.05, zone='dorm', match='報到',
         q=dict(id='pool_yt_desk', ev='ev_pool_yt_desk', h=8.5, late=0.5, place='法律系館A一樓', title='黃郁婷：迎新報到桌（法律系館A一樓 8:30）', travel='走過去約 10 分鐘', travelH=0.25),
         picks=('「問旁邊那個班代。」',), src='src/pool3d.js:243 acceptYt2 的 plan；台詞 pool_story.js:184 desk（她只在選③之後說話）'),
    dict(k='kevin_grad', who='npc_kevin', names=['Kevin'], kind='outing', ev='ev_sis15_kv_grad', when='2028-06-03', load_h=10.1, zone='dorm', match='Kevin',
         q=dict(id='sisb15_kv_grad', ev='ev_sis15_kv_grad', h=10.5, late=0.25, place='法律系館A門口', title='法律系館A門口（Kevin 的畢業照）', travel='走路 約 10 分鐘', travelH=1 / 6, hours=0.5, back='回到住的地方。'),
         flags={'SIS15_KV_GRAD_GO': True, 'met_sis': True}, src='src/sis_b15_3d.js:91 GRAD_OUT／S.grad；台詞 src/data/sis_b15_events.js:174 ev_sis15_kv_grad（KEV＝speaker Kevin）'),
    dict(k='yule_name', who='yule', names=['舊序章的人'], kind='enc', spot='D13', row_who='kexin', tier='dating', when='2026-10-03', load_h=15.0, zone='dorm',
         flags={'dating_kexin': True}, picks=('打招呼',),
         why='偶遇要出遊到淡水（G.trip、D13）、和可昕交往中、S.decide 的種子擲到她，最小存檔做不到；照 tests/yule_portrait_unit.js 第 5 項直接 ENC.meet',
         src='src/encounter3d.js ENC.meet／S.sayer；src/data/encounters.js:47 D13 datingAfter {who:舊序章的人}'),
    dict(k='neg_noportrait', who='小隊輔', names=['小隊輔'], kind='camp', ev='ev_camp_d1_ice', expect='compact', when='2025-08-22', load_h=10.4, zone='dorm',
         flags={'CAMP_Y1_ON': True, 'campStep': 1, 'CAMP_BUS': 'win'}, drop=['CEREMONY_Y1', 'KAI_MOVEIN', 'FAM_GROUP_SENT'],
         src='src/data/camp_y1.js:47 小隊輔（沒有立繪檔、不是人物）'),
    dict(k='neg_samename', who='學長', names=['學長'], kind='auto', ev='ev_grad_seniors_y1', expect='compact', when=['Y1S2', 15, 6], load_h=10.17, zone='campus', quiet=False,
         src='src/data/events.js:1936 ev_grad_seniors_y1 的「學長」（多個不同的人都叫學長、沒有立繪檔）'),
]
CASES += [
    dict(k='jp_liheng', who='jp_liheng', names=['立衡'], kind='jpstop', stop='jpb_2_2a', ev='ev_jpb_r_shop', when='2028-05-13', load_h=14.0, zone='jp_hub',
         flags=dict(JPF, dating_heroine_01=False), done=['ev_liheng_japan'],
         src='src/jp_blank3d.js:45 JP.SCH jpb_2_2a（2028-05-13 14:00 日本據點，if:rep＝沒有和以安交往）；台詞 src/data/jp_blank_lines.js:141 ev_jpb_r_shop（metLH＝演過 ev_liheng_japan 才有立衡那兩句，speaker 「立衡」→ 別名 jp_liheng）'),
    dict(k='jp_yuheng', who='jp_yuheng', names=['宇恆'], kind='direct', ev='ev_jp_g4b1', when=['Y2S1', 12, 1], load_h=15.2, zone='campus',
         flags={'JP_MET': True},
         why='ev_jp_g4b1 是日文上第 12 週那一堂的下課（trigger class、afterClass japanese_1）：要修日文上＋走進共同教學館上完那一堂（選課、課表、教室流程），最小存檔做不到；第一句就是宇恆「小考考完了。我要吃東西，腦袋沒電。」',
         src='src/data/bbpack_events.js:105 g4b（ev_jp_g4b1）；speaker 「宇恆」→ 別名 jp_yuheng'),
]
GROUPS = {'npc_kevin': ['kevin_camp', 'kevin_tea', 'kevin_grad'], 'yule': ['yule_name'], 'neg_compact': ['neg_noportrait', 'neg_samename']}

# ---------------------------------------------------------------- 頁面裡的小工具
CLEARP = "(()=>{ if(typeof CLS!=='undefined'&&CLS.clearPending){ CLS.clearPending(); return true; } return false; })()"
HOOK = r"""(()=>{ if(window.__PTH) return 'again'; window.__PTH=1; const Lg=window.__PT=[]; window.__PTS=null; let n=0;
  const at=()=>{ try{ return {d:CALENDAR.dateOf(GAME.G.day).key,h:+(+GAME.G.hour).toFixed(3),z:GAME.G.zone}; }catch(e){ return {}; } };
  const push=o=>{ try{ Object.assign(o,at(),{ms:Math.round(performance.now())}); Lg.push(o); if(Lg.length>3000) Lg.splice(0,1000); }catch(e){} };
  if(typeof OUT!=='undefined'&&OUT.go){ const g0=OUT.go; OUT.go=function(GM,q){ push({k:'out',t:String((q&&q.id)||'')}); return g0.apply(this,arguments); }; }
  if(typeof EVENTS!=='undefined'&&EVENTS.run){ const r0=EVENTS.run; EVENTS.run=function(ev){ push({k:'ev',t:String((ev&&ev.id)||'')}); return r0.apply(this,arguments); }; }
  if(typeof JP!=='undefined'&&JP.playStop){ const p0=JP.playStop; JP.playStop=function(GM,s,w){ push({k:'stop',t:String((s&&s.k)||'')}); return p0.apply(this,arguments); }; }
  if(typeof STORY!=='undefined'){ for(const f of ['teaSignIn','teaTable','campY1']) if(STORY[f]){ const f0=STORY[f]; STORY[f]=function(){ push({k:'story',t:f}); return f0.apply(this,arguments); }; } }
  const y0=GAME.say; GAME.say=function(w,t){ n++; let rc=null; try{ rc=(w&&!w.charId&&!w.obj&&w.name&&GAME.portraitIdByName)?GAME.portraitIdByName(w.name):null; }catch(e){} const o={k:'say',n,rcid:rc,cid:(w&&w.charId)||null,name:(w&&w.name)||(typeof w==='string'?w:''),t:String(t==null?'':t).slice(0,80)}; window.__PTS=o; push(Object.assign({},o)); return y0.apply(this,arguments); };
  const c0=GAME.choose; GAME.choose=function(o){ push({k:'choose',t:(o||[]).filter(x=>x&&!x.hidden).map(x=>((x.t||x.text)||'')).join('｜')}); return c0.apply(this,arguments); };
  return 'ok'; })()"""
STARTED_JS = r"""(c=>{ const Lg=window.__PT||[]; const hit=e=>(!!c.qid&&e.k==='out'&&e.t===c.qid)||(!!c.ev&&e.k==='ev'&&e.t===c.ev)||(!!c.story&&e.k==='story'&&e.t===c.story)||(!!c.stop&&e.k==='stop'&&e.t===c.stop)||(!!c.who&&e.k==='say'&&(e.cid===c.who||e.rcid===c.who));
  const f=Lg.filter(hit); return f.length?f.slice(0,4).map(e=>({k:e.k,t:e.t||e.cid,d:e.d,h:e.h})):null; })"""
LASTSAY_JS = "(()=>window.__PTS)()"
TYPED_JS = "(()=>{ const n=document.getElementById('dlgNext'); return !!n&&n.style.visibility==='visible'; })()"
MEASURE_JS = r"""(who=>{ const adv=document.getElementById('adv'); const VW=innerWidth, VH=innerHeight, r1=v=>+(+v).toFixed(1);
  const out={vw:VW,vh:VH,orient:VW>VH?'land':'port',advActive:!!(typeof ADV!=='undefined'&&ADV.active),advCls:adv?adv.className:'',compact:!!adv&&adv.classList.contains('compact'),
    dlgName:((document.getElementById('dlgName')||{}).textContent||'').trim(),dlgText:((document.getElementById('dlgText')||{}).textContent||'').trim().slice(0,80),slots:{},imgs:[],target:null,
    manifest:(typeof PORTRAIT_FILES!=='undefined'&&PORTRAIT_FILES[who])?PORTRAIT_FILES[who]:null,
    portraitReg:(typeof PORTRAITS!=='undefined'&&PORTRAITS[who])?{def:PORTRAITS[who].defaultPortrait,outfits:Object.keys(PORTRAITS[who].outfits||{})}:null};
  try{ for(const s of ['left','right']){ const v=ADV.slots&&ADV.slots[s]; out.slots[s]=v?{charId:v.charId,expression:v.expression||null,outfit:v.outfit||null,compact:!!v.compact}:null; } }catch(e){}
  for(const [slot,id] of [['left','advL'],['right','advR']]){ const box=document.getElementById(id); if(!box) continue; const img=box.querySelector('img'); const bc=getComputedStyle(box), br=box.getBoundingClientRect();
    const o={slot,show:box.classList.contains('show'),dim:box.classList.contains('dim'),off:box.classList.contains('off'),boxOpacity:bc.opacity,boxVis:bc.visibility,box:[br.left,br.top,br.width,br.height].map(r1),src:null};
    if(img){ const r=img.getBoundingClientRect(), ic=getComputedStyle(img); const raw=img.getAttribute('src')||img.src||''; o.src=raw; o.file=decodeURI(String(img.src||'').replace(/^.*?\/assets\//,'assets/'));
      o.rect=[r.left,r.top,r.width,r.height].map(r1); o.nat=[img.naturalWidth,img.naturalHeight]; o.fit=ic.objectFit; o.pos=ic.objectPosition; o.imgOpacity=ic.opacity; o.complete=!!img.complete; }
    out.imgs.push(o);
    if(o.file&&o.file.indexOf('assets/portraits/'+who+'/')===0) out.target=o; }
  const t=out.target; out.srcOk=!!t&&new RegExp('^assets/portraits/'+who+'/[^/]+/[^/]+\\.webp$').test(t.file)&&!!out.manifest&&(()=>{ const m=/^assets\/portraits\/[^/]+\/([^/]+)\/([^/]+)\.webp$/.exec(t.file); return !!m&&!!out.manifest[m[1]]&&out.manifest[m[1]].includes(m[2]); })();
  out.portraitShown=!!t&&t.show&&!out.compact&&t.boxVis!=='hidden'&&+t.boxOpacity>0.05;
  out.anyImgShown=out.imgs.filter(i=>i.show&&i.src&&i.boxVis!=='hidden'&&+i.boxOpacity>0.05&&!i.dim).map(i=>i.slot+':'+i.file);   /* 亮著（沒變暗）的立繪：反例那句不該有 */
  return out; })"""
DUP_JS = r"""(()=>{ const F=typeof PORTRAIT_FILES!=='undefined'?PORTRAIT_FILES:{}, m={}; const add=c=>{ if(!c||!c.id) return; for(const n of [c.name].concat(c.alias||[])) if(n){ (m[n]=m[n]||new Set()).add(c.id); } };
  if(typeof CHARACTERS!=='undefined') for(const k in CHARACTERS) add(CHARACTERS[k]); if(typeof PORTRAIT_ONLY!=='undefined') for(const k in PORTRAIT_ONLY) add(PORTRAIT_ONLY[k]);
  const all=[], withP=[]; for(const n in m){ if(m[n].size>1){ const ids=[...m[n]]; all.push([n,ids]); if(ids.filter(i=>F[i]).length>1) withP.push([n,ids]); } }
  return {multi:all.slice(0,30),multiWithPortrait:withP,byName:typeof GAME!=='undefined'&&GAME.portraitIdByName?{學長:GAME.portraitIdByName('學長'),小隊輔:GAME.portraitIdByName('小隊輔'),Kevin:GAME.portraitIdByName('Kevin'),舊序章的人:GAME.portraitIdByName('舊序章的人')}:null}; })()"""
JPSTOP_JS = r"""(k=>{ try{ const s=typeof JP!=='undefined'&&JP.SCH?JP.SCH.find(x=>x.k===k):null; if(!s) return '找不到 JP.SCH '+k; void JP.playStop(GAME,s,'jp'); return 'void JP.playStop(GAME,'+k+',jp)'; }catch(e){ return '例外 '+e.message; } })"""
ENC_JS = r"""(a=>{ try{ if(typeof ENC==='undefined'||typeof ENCOUNTERS==='undefined') return '沒有 ENC／ENCOUNTERS'; const row=(ENCOUNTERS.rows||[]).find(r=>r.who===a.who&&r.spot===a.spot); if(!row) return '找不到 '+a.who+'@'+a.spot;
  if(typeof ADV!=='undefined'&&!ADV.active) ADV.begin({background:'dark'}); void ENC.meet(GAME,row,{t:a.tier}); return 'ADV.begin(dark)＋void ENC.meet(GAME,ENCOUNTERS 的 '+a.who+'@'+a.spot+',{t:'+a.tier+'})；datingAfter='+JSON.stringify(row.lines&&row.lines.datingAfter); }catch(e){ return '例外 '+e.message; } })"""
LINES_JS = r"""(a=>{ const notes=[]; if(typeof EVENTS!=='undefined'&&EVENTS.running) notes.push('（注意：別的事件正在演 EVENTS.running='+EVENTS.running+'，EVENTS.run 會直接 return）');
  let lines=null; try{ lines=POOL.LINES[a.who][a.key]; }catch(e){ lines=null; }
  if(!Array.isArray(lines)||!lines.length) return notes.concat(['找不到 POOL.LINES.'+a.who+'.'+a.key]).join('');
  const ev={id:a.ev,title:'',participants:[a.who],location:'any',trigger:'manual',background:'blur',dialogue:lines};
  try{ void EVENTS.run(ev); notes.push('void EVENTS.run({id:'+a.ev+',participants:['+a.who+'],background:blur,dialogue:POOL.LINES.'+a.who+'.'+a.key+'（'+lines.length+' 行）})'); }catch(e){ notes.push('例外 '+e.message); }
  return notes.join(''); })"""
DIRECT_JS = r"""(a=>{ const notes=[]; if(typeof EVENTS!=='undefined'&&EVENTS.running) notes.push('（注意：別的事件正在演 EVENTS.running='+EVENTS.running+'）');
  const ev=typeof STORY_EVENTS!=='undefined'?STORY_EVENTS.find(e=>e.id===a.ev):null; if(!ev) return notes.concat(['找不到 '+a.ev]).join('；');
  try{ void EVENTS.run(ev); notes.push('void EVENTS.run('+a.ev+')'); }catch(e){ notes.push('例外 '+e.message); } return notes.join('；'); })"""
OUTGO_JS = r"""(qid=>{ const G=GAME.G; const q=typeof OUT!=='undefined'&&OUT.get?OUT.get(G,qid):null; if(!q) return '存檔裡找不到出遊 '+qid;
  const s0=q.state; q.state='planned'; q.ask=null; try{ void OUT.go(GAME,q); }catch(e){ return '例外 '+e.message; } return '出遊原本 state='+s0+'；void OUT.go(GAME,q)'; })"""
STORYCALL_JS = r"""(a=>{ try{ if(a.flags) Object.assign(GAME.G.flags,a.flags); const f=STORY[a.fn]; if(!f) return '沒有 STORY.'+a.fn; void f.call(STORY,GAME,a.arg||undefined); return 'void STORY.'+a.fn+'(GAME'+(a.arg?','+JSON.stringify(a.arg):'')+')'+(a.flags?'；旗標 '+JSON.stringify(a.flags):''); }catch(e){ return '例外 '+e.message; } })"""
REFSHOW_JS = r"""(a=>{ try{ if(typeof ADV==='undefined'||!ADV.active) return 'ADV 沒開'; ADV.show(a.slot,a.ref,'neutral','campus'); return 'ADV.show('+a.slot+','+a.ref+',neutral,campus)'; }catch(e){ return '例外 '+e.message; } })"""
EXITS = ('不用了', '算了', '就這樣', '先不要', '先這樣', '沒事', '離開', '取消')
SUMMARY = {'files': {}, 'cases': {}}


# ---------------------------------------------------------------- PIL：原檔的客觀數字
def _gray(px):
    r, g, b = px[:3]
    return max(r, g, b) - min(r, g, b) <= 14 and 90 <= (r + g + b) / 3 <= 225


_ALPHA = {}


def alpha_box(path):
    """原檔 alpha>16 的外框（像素）與原圖尺寸；結果快取"""
    if path in _ALPHA: return _ALPHA[path]
    im = Image.open(path); w, h = im.size
    a = im.convert('RGBA').split()[3].point(lambda v: 255 if v > 16 else 0)
    bb = a.getbbox()
    _ALPHA[path] = {'size': [w, h], 'bbox': list(bb) if bb else None}
    return _ALPHA[path]


def file_stats(path):
    im = Image.open(path); w, h = im.size; mode = im.mode
    rgba = im.convert('RGBA'); px = rgba.load()
    st = {'path': os.path.relpath(path, ROOT), 'bytes': os.path.getsize(path), 'size': [w, h], 'mode': mode, 'has_alpha': 'A' in mode or 'transparency' in im.info}
    def band(side, k):
        if side == 'top': return [(x, y) for y in range(k) for x in range(w)]
        if side == 'bottom': return [(x, y) for y in range(h - k, h) for x in range(w)]
        if side == 'left': return [(x, y) for x in range(k) for y in range(h)]
        return [(x, y) for x in range(w - k, w) for y in range(h)]
    edges = {}
    for side in ('top', 'bottom', 'left', 'right'):
        e = {}
        for k in (1, 4):
            pts = band(side, k); op = [px[p] for p in pts if px[p][3] > 16]
            e['opaque_%dpx' % k] = round(len(op) / len(pts), 4)
            e['gray_in_opaque_%dpx' % k] = round(sum(1 for c in op if _gray(c)) / len(op), 4) if op else None
        edges[side] = e
    st['edges'] = edges
    semi = 0; semi_gray = 0; rim = 0; rim_gray = 0; opaque = 0
    for y in range(h):
        for x in range(w):
            c = px[x, y]; a = c[3]
            if 0 < a < 255:
                semi += 1; semi_gray += _gray(c)
            if a > 16:
                opaque += 1
                if any(0 <= x + dx < w and 0 <= y + dy < h and px[x + dx, y + dy][3] <= 16 for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))):
                    rim += 1; rim_gray += _gray(c)
    st['opaque_ratio'] = round(opaque / (w * h), 4)
    st['semi_px'] = semi; st['semi_gray_ratio'] = round(semi_gray / semi, 4) if semi else None
    st['rim_px'] = rim; st['rim_gray_ratio'] = round(rim_gray / rim, 4) if rim else None
    ab = alpha_box(path); st['alpha_bbox'] = ab['bbox']
    if ab['bbox']: st['head_top_frac'] = round(ab['bbox'][1] / h, 4); st['figure_h_frac'] = round((ab['bbox'][3] - ab['bbox'][1]) / h, 4)
    return st


def portrait_files(pid):
    d = os.path.join(ROOT, 'assets', 'portraits', pid)
    out = []
    for dp, _, fs in os.walk(d):
        for f in sorted(fs):
            if f.endswith('.webp'): out.append(os.path.join(dp, f))
    return sorted(out)


def print_stats(ids):
    print('==== 立繪原檔（PIL，客觀數字；gray＝RGB 差 ≤14 且平均 90～225；rim＝不透明且旁邊有透明的像素）====', flush=True)
    for pid in ids + [REF_ID]:
        fs = portrait_files(pid)
        if not fs: print('  %s：沒有檔案（assets/portraits/%s/）' % (pid, pid), flush=True); SUMMARY['files'][pid] = None; continue
        for f in fs:
            if pid == REF_ID and not f.endswith('campus/neutral.webp'): continue
            try: s = file_stats(f)
            except Exception as e: s = {'path': f, 'err': repr(e)}
            SUMMARY['files'].setdefault(pid, []).append(s)
            print('  %s %s' % (pid, J(s)), flush=True)


# ---------------------------------------------------------------- 量測整理（python 端：用原檔 alpha 外框算畫面上的頭頂）
def drawn(t):
    """img 是 object-fit:contain、object-position 預設 top（adv3d.js .advSlot img）：算原圖實際畫在畫面上的範圍"""
    if not t or not t.get('rect') or not t.get('nat') or not t['nat'][0]: return None
    x, y, w, h = t['rect']; nw, nh = t['nat']
    s = min(w / nw, h / nh) if (t.get('fit') or 'contain') == 'contain' else max(w / nw, h / nh)
    dw, dh = nw * s, nh * s
    tok = (t.get('pos') or '50% 0%').split()
    def pp(v, free):
        if v.endswith('%'): return free * float(v[:-1]) / 100
        if v.endswith('px'): return float(v[:-2])
        return {'left': 0, 'top': 0, 'right': free, 'bottom': free}.get(v, free / 2)
    ox = x + pp(tok[0], w - dw); oy = y + pp(tok[1] if len(tok) > 1 else '50%', h - dh)
    return {'x': round(ox, 1), 'y': round(oy, 1), 'w': round(dw, 1), 'h': round(dh, 1), 'scale': round(s, 4)}


def head_info(m):
    t = (m or {}).get('target')
    d = drawn(t)
    if not d: return None
    f = os.path.join(ROOT, t['file']) if t.get('file') else None
    info = {'drawn': d, 'file': t.get('file')}
    if f and os.path.exists(f):
        ab = alpha_box(f); bb = ab['bbox']; nh = ab['size'][1]; nw = ab['size'][0]
        if bb:
            info['head_top_y'] = round(d['y'] + bb[1] / nh * d['h'], 1)
            info['feet_y'] = round(d['y'] + bb[3] / nh * d['h'], 1)
            info['figure_h'] = round((bb[3] - bb[1]) / nh * d['h'], 1)
            info['figure_x'] = [round(d['x'] + bb[0] / nw * d['w'], 1), round(d['x'] + bb[2] / nw * d['w'], 1)]
            info['head_top_pct_vh'] = round(info['head_top_y'] / m['vh'] * 100, 2)
            info['figure_h_pct_vh'] = round(info['figure_h'] / m['vh'] * 100, 2)
            info['cut_by_bottom_px'] = round(max(0, info['feet_y'] - m['vh']), 1)
    return info


def crop_shot(shot, d, vw, vh, path):
    try:
        im = Image.open(shot)
        sx = im.size[0] / vw; sy = im.size[1] / vh
        x0 = max(0, int(d['x'] * sx)); y0 = max(0, int(d['y'] * sy)); x1 = min(im.size[0], int((d['x'] + d['w']) * sx)); y1 = min(im.size[1], int((d['y'] + d['h']) * sy))
        if x1 - x0 < 2 or y1 - y0 < 2: return None
        im.crop((x0, y0, x1, y1)).save(path); return path
    except Exception as e:
        print('  crop 失敗', e, flush=True); return None


def exists(p):
    return bool(p) and os.path.exists(p) and os.path.getsize(p) > 0


# ---------------------------------------------------------------- 瀏覽器端流程
def hm(h):
    m = int(round(float(h) * 60)); return '%02d:%02d' % (m // 60, m % 60)


async def resolve(pg, v, d):
    if isinstance(v, tuple) and v and v[0] == 'DAY': return (await P.day_of(pg, v[1]))['d']
    if isinstance(v, tuple) and v and v[0] == 'REL': return d + v[1]
    if isinstance(v, tuple) and v and v[0] == 'JS': return await pg.evaluate('(()=>(%s))()' % v[1])
    return v


async def build_state(pg, c):
    d = await P.day_of(pg, c['when'])
    st = {'name': '祐廷', 'energy': 100, 'events': {'done': {}, 'last': {}, 'count': 0}, 'contacts': {}, 'outings': []}
    F = st['flags'] = dict(BASEF)
    for k in c.get('drop') or (): F.pop(k, None)
    for k, kk in ROOMS:
        dd = (await P.day_of(pg, kk))['d']
        if dd <= d['d']: F[k] = dd
    for fk, fv in (c.get('flags') or {}).items(): F[fk] = await resolve(pg, fv, d['d'])
    for eid in c.get('done') or ():   # 【前置】前面的事件記成演過（G.events.done）
        st['events']['done'][eid] = 1; st['events']['last'][eid] = d['d']
    st.update(day=d['d'], weekday=d['wd'], hour=c['load_h'], zone=c['zone'], pos=None, weather='clear', stage='law')
    st['money'] = 30000
    st['visited'] = {z: True for z in VISITED}
    q = None
    if c.get('q'):
        q = copy.deepcopy(c['q']); q['id'] = q['id'].format(d=d['d']); q['day'] = d['d']; q.setdefault('state', 'planned'); q.setdefault('ask', None)
        st['outings'] = [q]
    return st, d, q


async def ts(pg):
    s = await P.ts(pg)
    try: s['typed'] = bool(await pg.evaluate(TYPED_JS))
    except Exception: s['typed'] = False
    return s


def is_target(c, ls):
    return bool(ls) and (ls.get('cid') == c['who'] or ls.get('rcid') == c['who'] or (not ls.get('cid') and not ls.get('rcid') and ls.get('name') in c['names']))


async def wait_speak(pg, cdp, run, c, max_s, picks=(), since_n=0):
    """點對話直到「那個人」說的那一句打完字（#dlgNext 出來＋同一句，或同一句連續 4 次）。別人的句子照玩家點過去；選項照 picks，沒有就第一個沒變暗的。
    回傳 (說了沒, ts, 那一句的 say 紀錄, 之前點過的句子)"""
    t0 = time.time(); last = None; same = 0; pre = []; s = None; ls = None
    while time.time() - t0 < max_s:
        s = await ts(pg); ls = await pg.evaluate(LASTSAY_JS)
        if s['ch']:
            k, _ = P.pick_of(s['ch'], picks, decline=False)
            pre.append(['［選項］', J([o['t'] for o in s['ch']]) + ' → ' + s['ch'][k]['t']]); await P.tap_choice(pg, cdp, k); await pg.wait_for_timeout(1000); last = None; continue
        if s['dlg'] and s['txt']:
            same = same + 1 if s['txt'] == last else 1
            done = s['txt'] == last and (s.get('typed') or same >= 4)
            last = s['txt']
            if is_target(c, ls) and (ls or {}).get('n', 0) > since_n:
                if done: return True, s, ls, pre
                await pg.wait_for_timeout(600); continue
            if done:
                if not pre or pre[-1] != [s['name'], s['txt']]: pre.append([s['name'], s['txt']])
                await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(700); last = None; same = 0
            else: await pg.wait_for_timeout(600)
            continue
        if s['phone']: await L.phone_away(pg, cdp); continue
        await pg.wait_for_timeout(700)
    return False, s, ls, pre


async def set_orient(pg, run, o):
    if pg.viewport_size != VP[o]:
        await pg.set_viewport_size(VP[o]); await pg.wait_for_timeout(RELAYOUT_MS)
    if await pg.evaluate("(()=>{ const r=document.getElementById('rotate'); if(r&&r.classList.contains('want')){ r.classList.remove('want'); return true; } return false; })()"):
        run.setup('[前置] 直向的「請把手機轉成橫向」（#rotate.want）還在 → 拿掉（同 playlib.load_state；玩家點一下就關）')
    await pg.evaluate("new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(()=>r(1))))")
    await pg.wait_for_timeout(400)   # 立繪換圖有 120 ms 淡入（adv3d.js render）


async def shoot(pg, run, c, rec, tag, orients, errs):
    """這一句：每個方向量 DOM → 截圖 → 裁立繪 → 記數字；check 不是 compact、src 正式檔、截圖存在"""
    who = c['who']; res = rec.setdefault('scenes', {}).setdefault(tag, {})
    for o in orients:
        await set_orient(pg, run, o)
        m = await pg.evaluate(MEASURE_JS, who)
        shot = await run.shot(pg, '%s_%s_%s' % (c['k'], tag, o))
        hi = head_info(m); crop = None
        if hi: crop = crop_shot(shot, hi['drawn'], m['vw'], m['vh'], os.path.join(OUT, '%s_%s_%s_crop.png' % (c['k'], tag, o)))
        res[o] = {'measure': m, 'head': hi, 'shot': shot, 'crop': crop}
        t = m.get('target') or {}
        run.note('%s［%s・%s］compact=%s 說話的名字=%s 句子=%s｜slots=%s｜立繪 src=%s nat=%s 框=%s fit=%s pos=%s show=%s dim=%s off=%s｜頭頂 y=%s（%s%%vh）人高=%s（%s%%vh）下緣超出=%s px｜所有框：%s' % (
            c['k'], ONAME[o], tag, m.get('compact'), m.get('dlgName'), m.get('dlgText'), J(m.get('slots')), t.get('file'), t.get('nat'), t.get('rect'), t.get('fit'), t.get('pos'),
            t.get('show'), t.get('dim'), t.get('off'), (hi or {}).get('head_top_y'), (hi or {}).get('head_top_pct_vh'), (hi or {}).get('figure_h'), (hi or {}).get('figure_h_pct_vh'),
            (hi or {}).get('cut_by_bottom_px'), J([{k: i.get(k) for k in ('slot', 'file', 'show', 'dim', 'off', 'rect')} for i in m.get('imgs') or []])[:600]))
        if c.get('expect') == 'compact':   # 反例：照舊 compact、沒有亮著的立繪
            run.check('%s［%s・%s］：反例「%s」說話時照舊 compact（#adv 有 compact、沒有亮著的立繪）' % (c['k'], ONAME[o], tag, who), bool(m.get('compact')) and not m.get('anyImgShown'),
                      J({'compact': m.get('compact'), 'advCls': m.get('advCls'), 'slots': m.get('slots'), 'anyImgShown': m.get('anyImgShown'), 'manifest': m.get('manifest')}))
        else:
            run.check('%s［%s・%s］：%s 說話時不是 compact（他的立繪在框裡、框是 show）' % (c['k'], ONAME[o], tag, who), bool(m.get('portraitShown')),
                      J({'compact': m.get('compact'), 'advCls': m.get('advCls'), 'slots': m.get('slots'), 'target': bool(m.get('target'))}))
            run.check('%s［%s・%s］：立繪 src 是正式檔 assets/portraits/%s/…（且在 PORTRAIT_FILES）' % (c['k'], ONAME[o], tag, who), bool(m.get('srcOk')),
                      J({'file': t.get('file'), 'manifest': m.get('manifest'), 'portraitReg': m.get('portraitReg')}))
        run.check('%s［%s・%s］：截圖存在' % (c['k'], ONAME[o], tag), exists(shot), J([shot, crop]))
    return res


async def reference(pg, run, c, rec, tag, orients):
    """【捷徑：只為比較】同一個框暫時換成沈以安 campus/neutral，量頭頂、人高（case 最後才做，不還原）"""
    sc = (rec.get('scenes') or {}).get(tag) or {}
    slot = None
    for o in orients:
        t = ((sc.get(o) or {}).get('measure') or {}).get('target')
        if t: slot = t['slot']; break
    if not slot: run.note('%s：%s 沒有量到他的立繪框——不拍沈以安參考' % (c['k'], tag)); return
    r = await pg.evaluate(REFSHOW_JS, {'slot': slot, 'ref': REF_ID})
    run.setup('【捷徑：只為比較】%s：同一個框（%s）暫時換成沈以安 %s campus/neutral 量頭頂與高度（→ %s）；不是玩家看得到的畫面，拍完這一場就結束' % (c['k'], slot, REF_ID, r))
    await pg.wait_for_timeout(1500)
    out = rec.setdefault('ref', {})
    for o in orients:
        await set_orient(pg, run, o)
        m = await pg.evaluate(MEASURE_JS, REF_ID); shot = await run.shot(pg, '%s_ref_%s' % (c['k'], o)); hi = head_info(m)
        crop = crop_shot(shot, hi['drawn'], m['vw'], m['vh'], os.path.join(OUT, '%s_ref_%s_crop.png' % (c['k'], o))) if hi else None
        me = (sc.get(o) or {}).get('head') or {}
        out[o] = {'measure': m, 'head': hi, 'shot': shot, 'crop': crop}
        run.note('%s［%s］參考 沈以安：頭頂 y=%s（%s%%vh）人高=%s（%s%%vh）｜%s：頭頂 y=%s（%s%%vh）人高=%s（%s%%vh）｜差（他－以安）：頭頂 %s px、人高 %s px' % (
            c['k'], ONAME[o], (hi or {}).get('head_top_y'), (hi or {}).get('head_top_pct_vh'), (hi or {}).get('figure_h'), (hi or {}).get('figure_h_pct_vh'),
            c['who'], me.get('head_top_y'), me.get('head_top_pct_vh'), me.get('figure_h'), me.get('figure_h_pct_vh'),
            round(me['head_top_y'] - hi['head_top_y'], 1) if hi and me.get('head_top_y') is not None and hi.get('head_top_y') is not None else None,
            round(me['figure_h'] - hi['figure_h'], 1) if hi and me.get('figure_h') is not None and hi.get('figure_h') is not None else None))


async def wait_started(pg, cdp, run, c, cinfo, q=None):
    """等開演：出遊＝遊戲跳出「出發：……」→ 點；其他＝等遊戲自己演（別的對話照玩家點過去，別的選單不點）。回傳 (怎麼開演, 紀錄)"""
    t0 = time.time(); tapped = False; menus = []
    while time.time() - t0 < PROMPT_S:
        st = await pg.evaluate(STARTED_JS, cinfo)
        if st: return ('prompt' if tapped else 'self'), st
        s = await ts(pg)
        if s['phone'] and not s['ch'] and not s['dlg']: await L.phone_away(pg, cdp); continue
        if s['ch']:
            opts = [o['t'] for o in s['ch']]
            kk = next((i for i, o in enumerate(s['ch']) if not o['dim'] and o['t'].startswith('出發') and c.get('match') and c['match'] in o['t']), None) if c['kind'] == 'outing' else None
            if kk is not None and not tapped:
                run.note('%s：遊戲自己跳出選單 %s → 點「%s」（像玩家）' % (c['k'], J(opts), opts[kk]))
                await P.tap_choice(pg, cdp, kk); tapped = True; await pg.wait_for_timeout(1500); continue
            if opts not in menus: menus.append(opts); run.note('%s：畫面上有別的選單（不點，等）：%s' % (c['k'], J(opts)))
        elif s['dlg'] and s['txt']:
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(650); continue
        await pg.wait_for_timeout(1000)
    s = await ts(pg)
    if s['ch']:
        kk = next((i for i, o in enumerate(s['ch']) if not o['dim'] and o['t'].startswith(EXITS)), None)
        if kk is not None:
            run.setup('【捷徑】的前一步：畫面上的選單 %s 先點「%s」關掉' % (J([o['t'] for o in s['ch']]), s['ch'][kk]['t']))
            await P.tap_choice(pg, cdp, kk); await pg.wait_for_timeout(1500)
    return None, None


async def talk(pg, cdp, run, c):
    """3D：像玩家走到他旁邊、按「和…說話」。回傳 True＝按了而且他開始說話（STARTED 的 say）"""
    w = await P.wait_present(pg, c['who'], 90)
    if not w or w.get('hidden'):
        run.note('%s：90 秒內 %s 不在這一區（或藏著）：%s' % (c['k'], c['who'], J(w))); return False
    run.note('%s：%s 在 %s' % (c['k'], c['who'], J(w)))
    for n in range(3):
        g = await pg.evaluate("id=>__BBF.target(id)", c['who'])
        if not g: run.note('%s：找不到 %s' % (c['k'], c['who'])); return False
        if not g['ok']:
            await L.go_to(pg, cdp, run, g['tx'], g['tz'], 0.55, '%s：走到 %s 旁邊（第 %d 輪）' % (c['k'], c['who'], n + 1), max_s=150,
                          stop=lambda s, want=g['want']: s['interact'].startswith(want))
            await pg.wait_for_timeout(500)
            g = await pg.evaluate("id=>__BBF.target(id)", c['who'])
            if not g or not g['ok']: run.note('%s：按鈕不是「%s」（現在：%s）' % (c['k'], (g or {}).get('want'), (g or {}).get('lab'))); continue
        run.note('%s：按「%s」（像玩家）' % (c['k'], g['want']))
        await L.tap(pg, cdp, '#interact')
        for _ in range(20):   # 只等對話開始（不點：他的那一句交給 wait_speak 拍，免得在這裡被點掉）
            await pg.wait_for_timeout(1000)
            s = await ts(pg)
            if s['dlg'] or s['ch'] or await pg.evaluate(STARTED_JS, {'who': c['who']}): return True
        run.note('%s：按了沒有開始說話（第 %d 次）' % (c['k'], n + 1))
    return False


async def case_run(p, run, c, orients):
    k = c['k']; rec = SUMMARY['cases'].setdefault(k, {'who': c['who'], 'kind': c['kind'], 'src': c['src']})
    b, ctx, pg, cdp, errs = await L.launch(p, landscape=(orients[0] == 'land'))
    pg.on('dialog', lambda dd: asyncio.ensure_future(dd.accept()))
    try:
        await pg.goto(URL); loaded = await L.wait_loaded(pg)
        if not loaded: run.note('%s：遊戲沒有在時間內載入完（照樣往下）' % k)
        await pg.evaluate("localStorage.clear()"); await P.init(pg); await pg.evaluate(HOOK)
        st, d, q = await build_state(pg, c)
        rec.update(day=d, q=q, load_h=c['load_h'], zone=c['zone'])
        quiet = c.get('quiet', True)
        await L.load_state(pg, st, quiet_events=quiet, quiet_phone=True); await pg.evaluate(CLEARP)
        if c.get('expect') == 'compact':
            dup = await pg.evaluate(DUP_JS); rec['dupNames'] = dup
            run.note('%s：頁面裡同名（name／alias）對到兩個以上人物 id：%s；其中兩個以上有立繪檔：%s；portraitIdByName：%s' % (k, J(dup.get('multi')), J(dup.get('multiWithPortrait')), J(dup.get('byName'))))
        run.setup('[前置] %s：最小存檔讀到 %s（%s 第 %s 週，星期%s%s）%s %s；旗標 %s%s；手機自動打開先關（quiet_phone）、條件事件預設先關（quiet_events）；%s' % (
            k, d['key'], d.get('term'), d.get('week'), '日一二三四五六'[d['wd'] % 7], '，假日' if d.get('hol') else '', hm(c['load_h']), c['zone'],
            J({fk: st['flags'].get(fk) for fk in (c.get('flags') or {})}), (('；拿掉 %s' % J(c['drop'])) if c.get('drop') else '') + ('' if quiet else '；★條件事件照常（不關）'),
            ('存檔裡已經約好的出遊 %s（%s %s，%s）；' % (q['id'], d['key'], hm(q['h']), q['place']) if q else '') + c['src']))
        await pg.wait_for_timeout(2500)
        if c['kind'] != 'camp': await L.phone_away(pg, cdp); await L.close_panels(pg, cdp)
        how = None; started = None; scenes = []   # scenes：[(tag, since_n)]
        if c['kind'] == 'outing':
            how, started = await wait_started(pg, cdp, run, c, {'qid': q['id'], 'ev': c['ev']}, q)
            if not how:
                r = await pg.evaluate(OUTGO_JS, q['id']); how = 'fallback'
                run.setup('【捷徑】%s：%d 秒內沒有自己開演（遊戲時間 %s）→ %s' % (k, PROMPT_S, J(await P.clock(pg)), r)); await pg.wait_for_timeout(2500)
                started = await pg.evaluate(STARTED_JS, {'qid': q['id'], 'ev': c['ev']})
        elif c['kind'] == 'camp':
            how, started = await wait_started(pg, cdp, run, c, {'ev': c['ev']})
            if not how:
                r = await pg.evaluate(STORYCALL_JS, {'fn': 'campY1', 'arg': {'resume': True, 'next': False}}); how = 'fallback'
                run.setup('【捷徑】%s：%d 秒內讀檔沒有自己接著演宿營（applySave 的 CAMP_Y1_ON resume）→ %s' % (k, PROMPT_S, r)); await pg.wait_for_timeout(2500)
                started = await pg.evaluate(STARTED_JS, {'ev': c['ev']})
        elif c['kind'] == 'tea':
            how, started = await wait_started(pg, cdp, run, c, {'story': 'teaSignIn'})
            if not how:
                r = await pg.evaluate(STORYCALL_JS, {'fn': 'teaSignIn'}); how = 'fallback'
                run.setup('【捷徑】%s：%d 秒內 18:30 的簽到桌沒有自己演（STORY.teaTick）→ %s' % (k, PROMPT_S, r)); await pg.wait_for_timeout(2500)
                started = await pg.evaluate(STARTED_JS, {'story': 'teaSignIn'})
        elif c['kind'] == 'auto':   # 條件事件（trigger auto），讀檔不關條件事件、等 EVENTS.tick 自己演
            how, started = await wait_started(pg, cdp, run, c, {'ev': c['ev']})
            if not how:
                r = await pg.evaluate(DIRECT_JS, {'ev': c['ev']}); how = 'fallback'
                run.setup('【捷徑】%s：%d 秒內條件事件沒有自己演（遊戲時間 %s；可能別的事件先演、或條件不成立）→ %s' % (k, PROMPT_S, J(await P.clock(pg)), r)); await pg.wait_for_timeout(2500)
                started = await pg.evaluate(STARTED_JS, {'ev': c['ev']})
        elif c['kind'] == 'jpstop':   # 日本據點：JP.SCH 那一列到了時間，據點自己演（jp3d.js dueStop → playStop）
            how, started = await wait_started(pg, cdp, run, c, {'stop': c['stop'], 'ev': c['ev']})
            if not how:
                r = await pg.evaluate(JPSTOP_JS, c['stop']); how = 'fallback'
                run.setup('【捷徑】%s：%d 秒內據點沒有自己演（遊戲時間 %s）→ %s' % (k, PROMPT_S, J(await P.clock(pg)), r)); await pg.wait_for_timeout(2500)
                started = await pg.evaluate(STARTED_JS, {'stop': c['stop'], 'ev': c['ev']})
        elif c['kind'] == 'enc':
            r = await pg.evaluate(ENC_JS, {'who': c['row_who'], 'spot': c['spot'], 'tier': c['tier']}); how = 'enc'
            run.setup('【捷徑】%s：（理由：%s）→ %s' % (k, c['why'], r)); await pg.wait_for_timeout(2500)
            started = [{'k': 'enc', 't': r[:80]}] if r.startswith('ADV.begin') else None
        elif c['kind'] == 'direct':
            r = await pg.evaluate(DIRECT_JS, {'ev': c['ev']}); how = 'direct'
            run.setup('【捷徑】%s：DIRECT（理由：%s）→ %s' % (k, c['why'], r)); await pg.wait_for_timeout(2500)
            started = await pg.evaluate(STARTED_JS, {'ev': c['ev']})
        elif c['kind'] == 'talk':
            if c.get('near'): await P.place_near(pg, run, c['near'][0], c['near'][1], R=4.0, what='%s 的站位 %s' % (c['who'], J(c['near'])))
            ok = await talk(pg, cdp, run, c)
            if ok: how = 'talk'; started = await pg.evaluate(STARTED_JS, {'who': c['who']}) or [{'k': 'dlg', 't': '按了以後對話開始'}]
            else:
                r = await pg.evaluate(LINES_JS, {'ev': 'cc_pt106_' + k, 'who': c['who'], 'key': c['key']}); how = 'fallback_lines'
                run.setup('【捷徑】%s：3D 走過去說話沒成功（人不在／走不到／按了沒開始）→ 同 POOL.run 的做法包一個暫時事件演同一段台詞 → %s（開頭樣子不一定和 3D 對話裡接的一樣）' % (k, r))
                await pg.wait_for_timeout(2500); started = await pg.evaluate(STARTED_JS, {'ev': 'cc_pt106_' + k})
        rec.update(how=how, started=started)
        how_t = {'prompt': '遊戲自己跳出「出發」→ 點', 'self': '讀檔／到了時間自己演', 'fallback': '【捷徑】直接開演', 'direct': '【捷徑】DIRECT：void EVENTS.run',
                 'talk': '3D 走過去按「和…說話」', 'fallback_lines': '【捷徑】暫時事件演 POOL.LINES', 'enc': '【捷徑】void ENC.meet'}.get(how, how)
        # 那個人說話的那一句
        spoke, s, ls, pre = await wait_speak(pg, cdp, run, c, SPEAK_S, picks=c.get('picks') or ())
        rec.update(spoke=spoke, said=ls, lines_before=pre)
        if pre: run.note('%s：他說話以前點過的：%s' % (k, J(pre)[:1200]))
        run.check('%s：事件演出、%s 說了話（%s）' % (k, c['who'], how_t), bool(started) and spoke,
                  J({'started': started, 'said': ls, 'line': s and [s.get('name'), s.get('txt')]})[:600])
        last_tag = None
        if spoke:
            tag = 'signin' if c['kind'] == 'tea' else 'speak'
            await shoot(pg, run, c, rec, tag, orients, errs); last_tag = tag
        else:
            await run.shot(pg, '%s_nospeak' % k)
            run.note('%s：沒等到他說話。最後的紀錄：%s' % (k, J(await pg.evaluate("(window.__PT||[]).slice(-30)"))[:1500]))
        if c['kind'] == 'tea':   # 第二句：走到窗邊家族那一桌
            if pg.viewport_size != VP[orients[0]]: await set_orient(pg, run, orients[0])
            n0 = (ls or {}).get('n', 0)
            for _ in range(40):   # 簽到那段點完
                s = await ts(pg)
                if not s['dlg'] and not s['ch'] and not s['busy']: break
                if s['ch']: k2, _ = P.pick_of(s['ch'], (), decline=False); await P.tap_choice(pg, cdp, k2)
                elif s['dlg']: await L.tap(pg, cdp, '#dlg')
                await pg.wait_for_timeout(800)
            tx, tz = c['table']
            got = await L.go_to(pg, cdp, run, tx, tz, 1.3, '%s：窗邊家族那一桌' % k, max_s=240, stop=lambda s: s['interact'].startswith(c['tea_label']))
            stt = await L.state(pg)
            if stt['interact'].startswith(c['tea_label']):
                run.note('%s：按「%s」（像玩家）' % (k, stt['interact'])); await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(2000)
            if not await pg.evaluate(STARTED_JS, {'story': 'teaTable'}):
                r = await pg.evaluate(STORYCALL_JS, {'fn': 'teaTable', 'flags': {'TEA_STEP': 1}})
                run.setup('【捷徑】%s：走到那一桌按互動沒有開演（go_to=%s、按鈕「%s」）→ %s' % (k, got, stt.get('interact'), r)); await pg.wait_for_timeout(2500)
                rec['table_how'] = 'fallback'
            else: rec['table_how'] = 'interact'
            # 「名牌終於發完了。」：跳過旁白那兩句，等 Kevin
            sp2, s2, ls2, pre2 = await wait_speak(pg, cdp, run, c, SPEAK_S, picks=c.get('picks') or (), since_n=n0)
            rec.update(table_spoke=sp2, table_said=ls2, table_before=pre2)
            run.check('%s：家族那一桌 Kevin 說了話（%s）' % (k, '按互動' if rec['table_how'] == 'interact' else '【捷徑】void STORY.teaTable'), sp2,
                      J({'said': ls2, 'line': s2 and [s2.get('name'), s2.get('txt')]})[:400])
            if sp2: await shoot(pg, run, c, rec, 'table', orients, errs); last_tag = 'table'
        if REF and last_tag and c.get('expect') != 'compact': await reference(pg, run, c, rec, last_tag, orients)
    finally:
        rec['pageerrors'] = errs[:5]
        run.check('%s：沒有頁面 JS 例外' % k, not errs, J(errs[:3])[:600])
        try: await asyncio.wait_for(b.close(), 30)
        except Exception: pass


def pick_cases():
    if not IDS: return list(CASES)
    want = set()
    for x in IDS: want.update(GROUPS.get(x, [x]))
    return [c for c in CASES if c['k'] in want or c['who'] in want]


async def main():
    os.makedirs(OUT, exist_ok=True)
    run = L.Run('pt106', OUT)
    known = {c['k'] for c in CASES} | {c['who'] for c in CASES} | set(GROUPS)
    for x in [x for x in IDS if x not in known]: run.check('IDS 認得 %s' % x, False, '認得的：%s' % ','.join(PEOPLE + [c['k'] for c in CASES if c['k'] not in PEOPLE] + list(GROUPS)))
    if ORIENT not in ('both', 'land', 'port'): run.check('ORIENT 認得', False, ORIENT); sys.exit(run.finish())
    cases = pick_cases()
    if not cases: run.check('IDS 選到至少一場', False, J(IDS)); sys.exit(run.finish())
    orients = ['land', 'port'] if ORIENT == 'both' else [ORIENT]
    print('==== cc_pt106_probe（SHA %s；%d 場［%s］；ORIENT=%s；REF=%s）====' % (os.environ.get('SHA', '?'), len(cases), ','.join(c['k'] for c in cases), ORIENT, REF), flush=True)
    print_stats([x for x in PEOPLE + ['yule'] if x in {c['who'] for c in cases}])
    async with async_playwright() as p:
        for c in cases:
            print('---- %s（%s，%s）----' % (c['k'], c['who'], c['kind']), flush=True)
            try:
                await asyncio.wait_for(case_run(p, run, c, orients), CASE_MAX)
            except asyncio.TimeoutError:
                run.check('%s：跑完（沒有超過 CASE_MAX %d 秒）' % (c['k'], CASE_MAX), False, '')
            except Exception as e:
                run.check('%s：跑完（沒有探針例外）' % c['k'], False, repr(e)[:500]); traceback.print_exc()
            try:
                with open(os.path.join(OUT, 'cc_pt106_measure.json'), 'w', encoding='utf-8') as f: json.dump({'sha': os.environ.get('SHA', '?'), 'url': URL, 'orient': ORIENT, **SUMMARY}, f, ensure_ascii=False, indent=1)
            except Exception as e: print('measure.json 寫不出來', e, flush=True)
    print('SHA', os.environ.get('SHA', '?'), '量測：', os.path.join(OUT, 'cc_pt106_measure.json'), flush=True)
    print('（check 只看：事件演出／那個人說了話、說話時不是 compact、src 是正式檔、截圖存在、沒有 JS 例外。頭的位置、去背、好不好看＝BB 看截圖、*_crop.png 和數字判斷；ALL PASS 不代表立繪合格。'
          '退回【捷徑】的那幾場要看［前置／捷徑］紀錄；*_ref.png 是暫時換成沈以安的比較圖，不是玩家畫面）', flush=True)
    sys.exit(run.finish())


if __name__ == '__main__':
    if STATS_ONLY:
        ids = [x for x in IDS if x in PEOPLE] or PEOPLE
        print_stats(ids)
        os.makedirs(OUT, exist_ok=True)
        with open(os.path.join(OUT, 'cc_pt106_files.json'), 'w', encoding='utf-8') as f: json.dump(SUMMARY['files'], f, ensure_ascii=False, indent=1)
        sys.exit(0)
    asyncio.run(main())
