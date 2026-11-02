"""CC（帳號 A）11-02：#11 背景接上以後的對話截圖（開發分支 dad4935cf＝第 107 組＋深色底；f3a2ba4a1＝第 108 組；dad4935cf＝合併 d0f89590（第九批 10 張，BB_132 第 107 組）＋bec6fe0b（深色底場景補現成背景，BB 11-02 掃描）以後）。
目的：每一場對話時 ADV 背景確實顯示（是那張圖，不是 dark 深色底），人物立繪和對話框有沒有擋住重點——手機直向（390×844）、橫向（844×390）各一張。
探針只「客觀記錄＋截圖」：好不好看、重點有沒有被擋，由人看截圖判斷（不寫死「全部通過」）。
check 只有幾種：事件真的演出來（EVENTS.run 收到那一件，畫面到了那一張底圖、對話框開著或地點字幕在）、背景是那張圖（#advBg 實際算出來的
  background-image＝assets/bg/<bg>.webp、#adv 是 image 不是 dark）、截圖檔存在；沒有台詞的那一場另外查「真實演出時 ADV.setBg 拿到那張圖」。

做法（每一場開一個新的瀏覽器）：
  【前置】最小存檔（GAME.defaults＋過了開場的旗標，同 cc_bg5_probe.py 的 build_state）讀到那件事真實會發生的日期、時間、地點，需要的旗標照下面 CASES 那一行。
    日本篇：zone jp_hub＋JPF（tests/jp_semester_unit.js inJapan()），時鐘是日本時間；交往版（w_）加 dating_heroine_01，挽回中版（r_、notice_repair、hanami）不加。
    讀檔時條件事件、手機自動打開先關（QUIET=1）。
  讀檔後 PRE_S 秒內遊戲自己演了那一件（例：日本據點 jpb_4_4 8/2 10:00 自己演 ev_jpb_lastschool）＝記「自己演」；
    別的事件先演＝照玩家點過去（選項照 bbplay.pick_of 第一個沒變暗的），記下來。
  【捷徑】沒有自己演＝void EVENTS.run(STORY_EVENTS 裡的那一件)（void＝不等 Promise）。這些事件真實多半是出遊（OUT.go → EVENTS.run）或據點排程，
    EVENTS.run 本身不看 retired／條件，背景照事件第一句 {scene,bg} → OUT.bg(bg) → ADV.setBg（src/events3d.js:111），和出遊演出時同一條路。
  到了那一張底圖、第一句打完字（#dlgNext 出來＋同一句）就拍：先橫向，再 set_viewport_size 切直向（等 RELAYOUT_MS＋兩個 animation frame）。
  之後往下點到第一句「有人說話」（說話框有名字＝立繪可能出來）再拍一組（spk）；整場只有旁白的（police、r_laundry、lastschool、r_sea）記 INFO「這一場沒有人說話＝沒有立繪」。
  ev_sq_cat_visit 整場只有 {scene:'子晴的家',bg:'zq_home'}＋關係加分，沒有一句台詞（AA_397 3-3：不另外寫台詞）：場景只停 700 毫秒（events3d.js 的 l.hold||700）就結束，
    1～4 fps 拍不到。先照原樣演一次，只查 ADV.setBg／begin 的紀錄有沒有拿到 zq_home（check）；再【捷徑：只為拍照】演一個暫時事件（同一句 scene＋bg，加 hold 60000、id 改
    cc_bg107_hold_<id>）讓底圖停著拍——不是玩家看得到的長度（真實只閃 0.7 秒＋地點字幕 2.4 秒）。

場景（bg：事件；探針的日期時間地點；src）：
  第 107 組（d0f89590）：
    police_station      ev_sq04_police（sideq3d.js:401 S.POLICE_EV；SQ04 大二下起慢讀咖啡「交給派出所」→ 當下＋15 分鐘）只有旁白。探針 Y2S2 第 5 週週三 15:00 溫州街。
    brunch_back         ev_sq20_s1（sideq3d.js:574；SQ20 大三上起，週末）。探針 Y3S1 第 5 週週六 10:00 溫州街。ev_sq20_s2 同一張圖＝只讀確認（also）。
    zq_home             ev_sq_cat_visit（sideq3d.js:465；SQ_CAT_VISIT → 隔天 14:00）沒有台詞，見上。探針 Y2S2 第 6 週週六 14:00 宿舍。
    gg_basement_gig     ev_yc_gig（sup497_3d.js:174；2026-11-14 20:00 公館地下室，YC_GIG_INV）。探針 2026-11-14 20:00 公館；選項照第一個（前排）。
    jp_laundry_w        ev_jpb_w_laundry（jp_blank_lines.js:90，交往中 2028-04-22 14:00）。探針 jp_hub、dating_heroine_01。
    jp_laundry_r        ev_jpb_r_laundry（jp_blank_lines.js:144；jp_blank3d.js:46 2028-06-17 13:00，挽回中）只有旁白。
    jp_temple_hydrangea ev_jpb_w_temple（jp_blank_lines.js:118，交往中 2028-06-24 10:00）。
    jp_dorm_lobby_notice ev_an_town_notice_repair（r2y3b_events.js:358；r2y3b3d.js:228 挽回中 2028-05-06 22:00 宿舍大廳）。
    prof_door_zhou      ev_prof_zhou_office（events.js:4648 整場 background getter BGD()＝OUT.bg('prof_door')；萬才館 interact，週一／四 15:12～16:30）。探針 Y1S1 第 6 週週一 15:30 wancai。
                        ev_prof_lin_office（同一個 getter）＝只讀確認（also）。
    prof_door_hyx       ev_pool_hyx_office（pool_more3d.js:164、226；何宇軒 答應後下一個週三 15:00 法律系館A）。探針 Y1S2 第 5 週週三 15:00 linze。
  原本深色底、現在接上（bec6fe0b）：
    gym_court           ev_mx_3on3（y2r2_3d.js:299、608；2027-06-12 09:00 新體育館 1F 球場）。探針 2027-06-12 09:00 宿舍。
    jp_riverbank        ev_jpb_hanami（jp_blank_lines.js:74；2028-04-08 13:00 河堤，挽回中、JPB_HANAMI go）。
    jp_dorm_lobby_farewell ev_jpb_farewell（jp_blank_lines.js:162；2028-07-29 18:00 宿舍大廳）。
    jp_intl_office      ev_jpb_lastschool（jp_blank_lines.js:193；jp_blank3d.js:54 2028-08-02 10:00 據點自己演）只有旁白。
    jp_beach            ev_jpb_r_sea（jp_blank_lines.js:198；jp_blank3d.js:56 2028-07-17 09:00，挽回中、JPB_SEA go）只有旁白。
    wancai_seminar      ev_sq06_club（sideq3d.js:412；SQ06 大二上起吉他社社課）。探針 Y2S1 第 6 週週四 19:00 wancai。
  停用（retired）＝不演，只在頁面讀 STORY_EVENTS 確認 retired 有值、背景有接（INFO）：
    gg_scooter_shop＝ev_moot_2（bike 分支）、noodle_table＝ev_moot_6、gongguan＝ev_y0_e19、ntu_linze＝ev_y0_e24b2。
  第 108 組（f3a2ba4a1＝合併 54ad77f2c，第十批 10 張，BB_132 第 108 組；tests/bg108_unit.js）：
    l118_home_diner     ev_xc_sameday（xcrom3d.js:120-121；芯慈 G7 大三上第 14 週起的週三 15:00 當天約 → 18:00 巷口家常菜）。探針 Y3S1 第 14 週週三 18:00 溫州街。
    pasta118_night      ev_sq12_pasta（sideq3d.js:258、487；SQ12 大三上，下一個週一 19:00）。探針 Y3S1 第 5 週週一 19:00 溫州街。
    wenzhou_teahouse    ev_sq14_vet 第二段（sideq3d.js:504 S.cage14；第一段 vet_clinic 的旁白照玩家點過去，到 {scene:溫州街・一盞茶屋,bg:wenzhou_teahouse} 那一句才拍）。探針 Y2S1 第 10 週週三 16:15 宿舍。
    jp_100yen           ev_jpb_100yen（交往中出遊 3/29 11:00）、ev_jpb_100yen_alone（挽回中 jp_blank3d.js:34 jpb_1_1r 3/29 11:00 據點自己演，只有旁白）。
    jp_bike_shop        ev_jpb_bike（交往中 jp_blank3d.js:36 3/31 15:00）、ev_jpb_bike_repair（挽回中 :37 4/8 15:00；沒遇過立衡＝只有旁白那一版）。
    jp_supermarket      ev_jpb_market（交往中出遊；探針 2028-04-01 16:00，同 bg108_unit）。
    jp_morning_market   ev_jpb_w_market（交往中；jp_blank_lines.js:212 4/15 09:00 私訊「明天早上有早市」→ 探針 2028-04-16 08:00）。
    jp_old_bookstore    ev_jpb_w_books（交往中；:215 5/27 15:00 私訊 → 探針 2028-05-28 14:00）。
    jp_post_office      ev_jpb_post（jp_blank3d.js:53 jpb_4_3 2028-07-31 11:00 據點自己演；挽回中版只有旁白）。
    jp_secondhand_shop  ev_jpb_r_shop（挽回中 jp_blank3d.js:45 jpb_2_2a 2028-05-13 14:00 據點自己演；沒遇過立衡＝只有旁白）。
  第 109 組（7ee28d48d，BB 07:50 PASS）：
    jp_riverbank_fireworks ev_jpb_w_fire（交往中，jp_blank_lines.js:219 7/22 19:30 當天約）、ev_jpb_r_fire（挽回中，jp_blank3d.js:120 JPB_FIRE go → 7/22 19:30；只有旁白）。
    jp_dorm_gate_morning   ev_jpb_w_chain（交往中，:214 2028-05-13 10:00 宿舍門口）。
    jp_an_room_door        ev_jpb_w_light（交往中，:216 2028-06-11 16:00 她的房間門口）。
    jp_an_room_packed      ev_jpb_clean（交往中，:209 7/29 22:30 私訊 → 7/30 14:00；jp_blank3d.js:113 JPB_CLEAN go）。
    camp_trail_night       ev_camp_d1_walk（src/data/camp_y1.js:137；真實是 2025-08-22 21:30 迎新宿營，story3d.js:122 S.CAMP_SEQ 的序章串，trigger camp）。
                           序章串（經濟系那一年 S.campY1）最小存檔接不上：【前置】法律系 Y1S1 第 2 週週五 21:30 宿舍＋【捷徑】EVENTS.run（背景只看 OUT.bg，和日期無關）。
                           另外查：OUT.BG.camp_trail_night 不再有 night:true（7ee28d48d 以前借白天圖 camp_trail＋night）＝#adv 沒有 night class、#advBg 的 filter 是 none
                           （adv3d.js:17 的 #adv.night #advBg{filter:brightness(.42) saturate(.6)}＋::after 藍色蓋層）——記錄 class 與 computed filter（check）。
  GROUP=lib（d8dbcd7d5，第 110b 組，BB 08:54 PASS：總圖兩張新背景）：
    ntu_library_rain    ev_sis_y3s2_rain（src/data/sis_b9_events.js:23，trigger manual；src/sis_b9_3d.js:44 S.rainDue＋80：大三下第 10～11 週、下雨的平日 16:50～17:20、
                        在 3D 總圖門口附近、met_sis、okY3）。探針【前置】Y3S2 第 10 週週二 16:55 校園、weather rain、met_sis（沒有站到總圖門口＝多半不會自己演）→【捷徑】EVENTS.run。
    ntu_library_night   以安的白色情人節（FEST：src/data/fest_events.js:37 white 2026／2027／2029；ask 的 bg 'library_gate_night'，d8dbcd7d5 起 OUT.BG.library_gate_night 指到
                        assets/bg/ntu_library_night.webp）。不是 STORY_EVENTS 裡有 {scene,bg} 的事件：出遊 ev_fest_heroine_01（fest_events.js:229，dialogue 是 call → FEST.playOut
                        → fest3d.js:177 head {scene:總圖門口,bg:library_gate_night}）。真實：3/13 21:00 她私訊、回「好。」→ fest3d.js S.plan2D 排 fest_heroine_01_white_<年> 3/14 18:30。
                        探針【前置】2027-03-14 18:06 宿舍＋存檔裡已經約好的那一趟（照 S.plan2D 抄：late 0.25、走路約 15 分鐘、fest{id,k:white,y:2027,mode:meet,scene,bg,after:2,slot:eve}）、
                        dating_heroine_01 → 等遊戲自己跳「出發：……」點；PRE_S 秒內沒有＝【捷徑】void OUT.go(GAME,q)。只讀確認改成查 OUT.bg('library_gate_night').image（和 ev_sis_nye_y3 的 ntu_library_night 同一張）。
  沒有地方讀的資料（INFO，不演）：tainan_school＝y2b3d.js 的 Y2B.PS_TAINAN（第一次去台南；hometown3d.js 用的是 PS_TAINAN_VISITS 的結構，PS_TAINAN 本身沒有人讀）。
  （最小存檔：關係、記憶都是空的，if:custom 的句子照當下的存檔走哪一版就是哪一版；只看畫面，不驗台詞。）

輸出：<輸出資料夾>/NN_<case>_<land|port>_<first|spk|cap>_<dlg|bgonly|bgbox>.png、<case>_<方向>_<tag>_cropmap.png（示意圖，不是遊戲截圖）、cc_bg107_measure.json。
不是 iPhone：Playwright 手機模擬（is_mobile、觸控、SwiftShader 1～4 fps）。
用法：LW_TESTS=<工作樹>/tests SHA=<sha> [IDS=police_station,gym_court] python3 cc_bg107_probe.py '<URL>/index.html?turbo' <輸出資料夾>
環境變數：GROUP=107,dark,108,109,lib（只跑這幾組；預設全部；停用／INFO 那一段屬於 107＋dark）、IDS（只跑這幾場；用 case 名稱、事件 id 或底圖名；和 GROUP 取交集）、ORIENT=both|land|port、QUIET=1、SPK=1（0＝不拍有人說話那一句）、BGONLY=1（0＝不拍只有底圖的兩張，省時間）、
  PRE_S（讀檔後等遊戲自己演，預設 25）、SCENE_S（開演後等到那一張底圖，預設 120）、CASE_MAX（一場最多幾秒，預設 600）、RELAYOUT_MS（預設 1800）。
不要和別的瀏覽器測試同時跑（SwiftShader 搶 CPU）。"""
import os, sys, json, asyncio, time, copy, traceback
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__)))); import bbplay as P   # bbplay 在上一層（BB 的 test_tools）
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
ROOT = os.path.dirname(os.path.abspath(os.environ['LW_TESTS']))   # 工作樹根目錄（畫 cropmap 用原圖）
J = lambda o: json.dumps(o, ensure_ascii=False)
GROUPS = [x.strip() for x in os.environ.get('GROUP', '107,dark,108,109,lib').replace('，', ',').split(',') if x.strip()]
ONLY = [x.strip() for x in os.environ.get('IDS', '').replace('，', ',').split(',') if x.strip()]
ORIENT = os.environ.get('ORIENT', 'both').strip()
QUIET = os.environ.get('QUIET', '1') != '0'
SPK = os.environ.get('SPK', '1') != '0'
BGONLY = os.environ.get('BGONLY', '1') != '0'
PRE_S = int(os.environ.get('PRE_S', '25'))
SCENE_S = int(os.environ.get('SCENE_S', '120'))
CASE_MAX = int(os.environ.get('CASE_MAX', '600'))
RELAYOUT_MS = int(os.environ.get('RELAYOUT_MS', '1800'))
SPK_TAPS = 8
VP = {'land': {'width': 844, 'height': 390}, 'port': {'width': 390, 'height': 844}}
ONAME = {'land': '橫向 844×390', 'port': '直向 390×844'}

# ---------------------------------------------------------------- 最小存檔（同 cc_bg5_probe.py）
BASEF = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True, 'metAn': True, 'met_an': True, 'MET_ZHE': True,
         'zheNoodleDone': True, 'KX_FIRST_MSG': True, 'KX_EVE_MSG': True, 'FAM_GROUP_SENT': True, 'CEREMONY_Y1': True, 'KAI_MOVEIN': True, 'LAW_RECAP_SEEN': True,
         'fundsV2': 1, 'KX_DEC3_MIGRATED': True, 'dating_kexin': False}
ROOMS = (('ROOM_Y2', '2026-09-06'), ('ROOM_Y3', '2027-09-05'), ('ROOM_Y4', '2028-09-03'))
VISITED = ('noodle', 'cafe', 'library_hall', 'library', 'lawlib', 'wancai', 'linze', 'gongguan', 'wenzhou', 'soclib', 'cvs', 'bookstore')
JPF = {'EXCHANGE_ROUTE': 'JP', 'EXCH_RULE': 1, 'X1_JP': ('DAY', '2028-02-20'), 'JP_DEPARTED': ('DAY', '2028-03-25'), 'AN_SENDOFF': 'together'}   # tests/jp_semester_unit.js inJapan()
JPD = dict(JPF, dating_heroine_01=True)

# ---------------------------------------------------------------- 場景（k＝case 名稱；bg＝應該出現的底圖；also＝同一張圖、只讀確認的事件）
CASES = [
    dict(k='police_station', bg='police_station', ev='ev_sq04_police', grp=107, when=['Y2S2', 5, 3], h=15.0, zone='wenzhou', flags={}, narr_only=True,
         src='src/sideq3d.js:400 S.police04 的 OUT.plan → 401 S.POLICE_EV（{scene:派出所,bg:police_station}＋一句旁白）'),
    dict(k='brunch_back', bg='brunch_back', ev='ev_sq20_s1', grp=107, when=['Y3S1', 5, 6], h=10.0, zone='wenzhou', flags={}, also=['ev_sq20_s2'],
         src='src/sideq3d.js:574 S.BRUNCH1_EV（SQ20 大三上起；bohanOn 不成立＝自己計時那一版：旁白、小蕙、小米姐）'),
    dict(k='zq_home', bg='zq_home', ev='ev_sq_cat_visit', grp=107, when=['Y2S2', 6, 6], h=14.0, zone='dorm', flags={}, hold=True,
         src='src/sideq3d.js:465 S.VISIT_EV（只有 {scene:子晴的家,bg:zq_home}＋consequences，沒有台詞）'),
    dict(k='gg_basement_gig', bg='gg_basement_gig', ev='ev_yc_gig', grp=107, when='2026-11-14', h=20.0, zone='gongguan', flags={'YC_GIG_INV': True},
         src='src/sup497_3d.js:173 gigPhone 的 plan yc_gig（2026-11-14 20:00）→ 174 S.GIG_EV'),
    dict(k='jp_laundry_w', bg='jp_laundry', ev='ev_jpb_w_laundry', grp=107, when='2028-04-22', h=14.0, zone='jp_hub', flags=JPD,
         src='src/data/jp_blank_lines.js:90（交往中，213 的出遊 2028-04-22 14:00）'),
    dict(k='jp_laundry_r', bg='jp_laundry', ev='ev_jpb_r_laundry', grp=107, when='2028-06-17', h=13.0, zone='jp_hub', flags=JPF, narr_only=True,
         src='src/data/jp_blank_lines.js:144；src/jp_blank3d.js:46 jpb_2_2b（挽回中 2028-06-17 13:00 據點）'),
    dict(k='jp_temple_hydrangea', bg='jp_temple_hydrangea', ev='ev_jpb_w_temple', grp=107, when='2028-06-24', h=10.0, zone='jp_hub', flags=JPD,
         src='src/data/jp_blank_lines.js:118（交往中，217 的出遊 2028-06-24 10:00）'),
    dict(k='jp_dorm_lobby_notice', bg='jp_dorm_lobby', ev='ev_an_town_notice_repair', grp=107, when='2028-05-06', h=22.0, zone='jp_hub', flags=JPF,
         src='src/data/r2y3b_events.js:358 J2_REPAIR；src/r2y3b3d.js:228 plan y3_an_notice_repair（挽回中 2028-05-06 22:00 宿舍大廳）'),
    dict(k='prof_door_zhou', bg='prof_door', ev='ev_prof_zhou_office', grp=107, when=['Y1S1', 6, 1], h=15.5, zone='wancai', flags={}, also=['ev_prof_lin_office'],
         src='src/data/events.js:4646 BGD()＝OUT.bg(prof_door)、4648 ev_prof_zhou_office（整場 background getter；萬才館 interact 週一／四 15:12～16:30）'),
    dict(k='prof_door_hyx', bg='prof_door', ev='ev_pool_hyx_office', grp=107, when=['Y1S2', 5, 3], h=15.0, zone='linze', flags={},
         src='src/pool_more3d.js:226 acceptHyx1 的 planOut（下一個週三 15:00）→ 164 S.OFFICE_EV（{scene:周教授研究室門口,bg:prof_door}）'),
    dict(k='gym_court', bg='gym_court', ev='ev_mx_3on3', grp='dark', when='2027-06-12', h=9.0, zone='dorm', flags={},
         src='src/y2r2_3d.js:608 plan y2r2_3on3（2027-06-12 09:00）→ 299 ev_mx_3on3（bec6fe0b 接 gym_court）'),
    dict(k='jp_riverbank', bg='jp_riverbank', ev='ev_jpb_hanami', grp='dark', when='2028-04-08', h=13.0, zone='jp_hub', flags=dict(JPF, JPB_HANAMI='go'),
         src='src/jp_blank3d.js:119 plan jpb_hanami（2028-04-08 13:00 河堤）→ jp_blank_lines.js:74（bec6fe0b 接 jp_riverbank）'),
    dict(k='jp_dorm_lobby_farewell', bg='jp_dorm_lobby', ev='ev_jpb_farewell', grp='dark', when='2028-07-29', h=18.0, zone='jp_hub', flags=dict(JPF, JPB_PARTY='go'),
         src='src/jp_blank3d.js:121 plan jpb_party（2028-07-29 18:00 宿舍大廳）→ jp_blank_lines.js:162（bec6fe0b 接 jp_dorm_lobby）'),
    dict(k='jp_intl_office', bg='jp_intl_office', ev='ev_jpb_lastschool', grp='dark', when='2028-08-02', h=10.0, zone='jp_hub', flags=JPF, narr_only=True,
         src='src/jp_blank3d.js:54 jpb_4_4（2028-08-02 10:00 據點自己演）→ jp_blank_lines.js:193（bec6fe0b 接 jp_intl_office）'),
    dict(k='jp_beach', bg='jp_beach', ev='ev_jpb_r_sea', grp='dark', when='2028-07-17', h=9.0, zone='jp_hub', flags=dict(JPF, JPB_SEA='go'), narr_only=True,
         src='src/jp_blank3d.js:56 jpb_5_2（挽回中＋JPB_SEA go，2028-07-17 09:00 據點自己演）→ jp_blank_lines.js:198（bec6fe0b 接 jp_beach）'),
    dict(k='wancai_seminar', bg='wancai_seminar', ev='ev_sq06_club', grp='dark', when=['Y2S1', 6, 4], h=19.0, zone='wancai', flags={},
         src='src/sideq3d.js:227 SQ06 的 OUT.plan sq06_club → 412 S.CLUB_EV（bec6fe0b 接 wancai_seminar）'),
    # ---- 第 108 組（f3a2ba4a1）
    dict(k='l118_home_diner', bg='l118_home_diner', ev='ev_xc_sameday', grp=108, when=['Y3S1', 14, 3], h=18.0, zone='wenzhou', flags={},
         src='src/xcrom3d.js:120 S.g7 的 OUT.plan xc_g7_<k>（當天 18:00 巷口家常菜）→ 121 S.EV_SAMEDAY（f3a2ba4a1 接 l118_home_diner；原本深色底）'),
    dict(k='pasta118_night', bg='pasta118_night', ev='ev_sq12_pasta', grp=108, when=['Y3S1', 5, 1], h=19.0, zone='wenzhou', flags={},
         src='src/sideq3d.js:258 SQ12 的 OUT.plan sq12_pasta_<d>（下一個週一 19:00）→ 487 S.PASTA_EV'),
    dict(k='wenzhou_teahouse', bg='wenzhou_teahouse', ev='ev_sq14_vet', grp=108, when=['Y2S1', 10, 3], h=16.25, zone='dorm', flags={},
         src='src/sideq3d.js:504 S.cage14 → S.VET_EV：先 {scene:羅斯福路・動物醫院,bg:vet_clinic} 兩句旁白（照玩家點過去），再 {scene:溫州街・一盞茶屋,bg:wenzhou_teahouse}＝這一張'),
    dict(k='jp_100yen_w', bg='jp_100yen', ev='ev_jpb_100yen', grp=108, when='2028-03-29', h=11.0, zone='jp_hub', flags=JPD,
         src='src/data/jp_blank_lines.js:26（交往中出遊 3/29 11:00）'),
    dict(k='jp_100yen_r', bg='jp_100yen', ev='ev_jpb_100yen_alone', grp=108, when='2028-03-29', h=11.0, zone='jp_hub', flags=JPF, narr_only=True,
         src='src/jp_blank3d.js:34 jpb_1_1r（挽回中 3/29 11:00 據點自己演）'),
    dict(k='jp_bike_shop_w', bg='jp_bike_shop', ev='ev_jpb_bike', grp=108, when='2028-03-31', h=15.0, zone='jp_hub', flags=JPD,
         src='src/jp_blank3d.js:36 jpb_1_2（交往中 3/31 15:00 據點自己演）'),
    dict(k='jp_bike_shop_r', bg='jp_bike_shop', ev='ev_jpb_bike_repair', grp=108, when='2028-04-08', h=15.0, zone='jp_hub', flags=JPF, narr_only=True,
         src='src/jp_blank3d.js:37 jpb_1_2r（挽回中 4/8 15:00 據點自己演；沒遇過立衡＝旁白那一版）'),
    dict(k='jp_supermarket', bg='jp_supermarket', ev='ev_jpb_market', grp=108, when='2028-04-01', h=16.0, zone='jp_hub', flags=JPD,
         src='src/data/jp_blank_lines.js:51（交往中出遊；日期時間同 tests/bg108_unit.js）'),
    dict(k='jp_morning_market', bg='jp_morning_market', ev='ev_jpb_w_market', grp=108, when='2028-04-16', h=8.0, zone='jp_hub', flags=JPD,
         src='src/data/jp_blank_lines.js:83；212 的私訊 4/15 09:00「明天早上有早市」'),
    dict(k='jp_old_bookstore', bg='jp_old_bookstore', ev='ev_jpb_w_books', grp=108, when='2028-05-28', h=14.0, zone='jp_hub', flags=JPD,
         src='src/data/jp_blank_lines.js:104；215 的私訊 5/27 15:00'),
    dict(k='jp_post_office', bg='jp_post_office', ev='ev_jpb_post', grp=108, when='2028-07-31', h=11.0, zone='jp_hub', flags=JPF, narr_only=True,
         src='src/jp_blank3d.js:53 jpb_4_3（2028-07-31 11:00 據點自己演；挽回中＝只有旁白）'),
    dict(k='jp_secondhand_shop', bg='jp_secondhand_shop', ev='ev_jpb_r_shop', grp=108, when='2028-05-13', h=14.0, zone='jp_hub', flags=JPF, narr_only=True,
         src='src/jp_blank3d.js:45 jpb_2_2a（挽回中 5/13 14:00 據點自己演；沒遇過立衡＝只有旁白）'),
    # ---- 第 109 組（7ee28d48d）
    dict(k='jp_riverbank_fireworks_w', bg='jp_riverbank_fireworks', ev='ev_jpb_w_fire', grp=109, when='2028-07-22', h=19.5, zone='jp_hub', flags=JPD,
         src='src/data/jp_blank_lines.js:219 fire（交往中 7/22 當天私訊 → 19:30 河堤）'),
    dict(k='jp_riverbank_fireworks_r', bg='jp_riverbank_fireworks', ev='ev_jpb_r_fire', grp=109, when='2028-07-22', h=19.5, zone='jp_hub', flags=dict(JPF, JPB_FIRE='go'), narr_only=True,
         src='src/jp_blank3d.js:120 plan jpb_r_fire（挽回中、JPB_FIRE go，7/22 19:30）'),
    dict(k='jp_dorm_gate_morning', bg='jp_dorm_gate_morning', ev='ev_jpb_w_chain', grp=109, when='2028-05-13', h=10.0, zone='jp_hub', flags=JPD,
         src='src/data/jp_blank_lines.js:214 chain（交往中 2028-05-13 10:00 宿舍門口）'),
    dict(k='jp_an_room_door', bg='jp_an_room_door', ev='ev_jpb_w_light', grp=109, when='2028-06-11', h=16.0, zone='jp_hub', flags=JPD,
         src='src/data/jp_blank_lines.js:216 light（交往中 2028-06-11 16:00 當天約）'),
    dict(k='jp_an_room_packed', bg='jp_an_room_packed', ev='ev_jpb_clean', grp=109, when='2028-07-30', h=14.0, zone='jp_hub', flags=dict(JPD, JPB_CLEAN='go'),
         src='src/data/jp_blank_lines.js:209 clean（7/29 22:30 私訊）→ src/jp_blank3d.js:113 plan jpb_clean（7/30 14:00）'),
    dict(k='camp_trail_night', bg='camp_trail_night', ev='ev_camp_d1_walk', grp=109, when=['Y1S1', 2, 5], h=21.5, zone='dorm', flags={}, nonight=True,
         src='src/data/camp_y1.js:137 ev_camp_d1_walk（真實：2025-08-22 21:30 迎新宿營序章 story3d.js:122 S.CAMP_SEQ；探針日期不是真實日期，背景只看 OUT.bg）'),
    # ---- GROUP=lib（d8dbcd7d5，總圖兩張新背景）
    dict(k='ntu_library_rain', bg='ntu_library_rain', ev='ev_sis_y3s2_rain', grp='lib', when=['Y3S2', 10, 2], h=16 + 55 / 60, zone='campus', weather='rain', flags={'met_sis': True},
         src='src/sis_b9_3d.js:44 S.rainDue／80 S.tick → EVENTS.run(ev_sis_y3s2_rain)（src/data/sis_b9_events.js:23 {scene:總圖・門口,bg:ntu_library_rain}）'),
    dict(k='ntu_library_night_white', bg='ntu_library_night', alias='library_gate_night', ev='ev_fest_heroine_01', grp='lib', when='2027-03-14', h=18.1, zone='dorm', match='白色情人節',
         q=dict(id='fest_heroine_01_white_2027', ev='ev_fest_heroine_01', h=18.5, late=0.25, place='總圖門口', title='白色情人節（總圖門口）', travel='走路約 15 分鐘', travelH=0.25, alarm=True,
                fest={'id': 'heroine_01', 'k': 'white', 'y': 2027, 'mode': 'meet', 'scene': '總圖門口', 'bg': 'library_gate_night', 'after': 2, 'slot': 'eve'}),
         flags={'dating_heroine_01': True},
         src='src/fest3d.js:151 S.plan2D（以安 ask：3/14 18:30 總圖門口，bg library_gate_night）→ OUT.go → ev_fest_heroine_01 → FEST.playOut（fest3d.js:170、177）'),
]
RETIRED = [('gg_scooter_shop', 'ev_moot_2'), ('noodle_table', 'ev_moot_6'), ('gongguan', 'ev_y0_e19'), ('ntu_linze', 'ev_y0_e24b2')]
SUMMARY = {}

# ---------------------------------------------------------------- 頁面裡的小工具（照抄 cc_bg5_probe.py）
CLEARP = "(()=>{ if(typeof CLS!=='undefined'&&CLS.clearPending){ CLS.clearPending(); return true; } return false; })()"
HOOK = r"""(()=>{ if(window.__BG5H) return 'again'; window.__BG5H=1; const Lg=window.__BG5=[];
  const at=()=>{ try{ return {d:CALENDAR.dateOf(GAME.G.day).key,h:+(+GAME.G.hour).toFixed(3),z:GAME.G.zone}; }catch(e){ return {}; } };
  const push=o=>{ try{ Object.assign(o,at(),{ms:Math.round(performance.now())}); Lg.push(o); if(Lg.length>4000) Lg.splice(0,1500); }catch(e){} };
  const bgs=b=>typeof b==='string'?b:JSON.stringify(b||null);
  if(typeof OUT!=='undefined'&&OUT.go){ const g0=OUT.go; OUT.go=function(GM,q){ push({k:'out',t:String((q&&q.id)||''),ev:String((q&&q.ev)||'')}); return g0.apply(this,arguments); }; }   /* S.prompt 叫的是 S.go＝同一個物件的屬性：包得到 */
  if(typeof EVENTS!=='undefined'&&EVENTS.run){ const r0=EVENTS.run; EVENTS.run=function(ev){ push({k:'ev',t:String((ev&&ev.id)||'')}); return r0.apply(this,arguments); }; }
  if(typeof JP!=='undefined'&&JP.playStop){ const p0=JP.playStop; JP.playStop=function(GM,s,w){ push({k:'stop',t:String((s&&s.k)||''),w:String(w||'')}); return p0.apply(this,arguments); }; }
  if(typeof HV!=='undefined'&&HV.play){ const h0=HV.play; HV.play=function(GM,q){ push({k:'hv',t:String((q&&q.id)||'')}); return h0.apply(this,arguments); }; }
  if(typeof ADV!=='undefined'){
    if(ADV.begin){ const b0=ADV.begin; ADV.begin=function(o){ push({k:'begin',t:bgs(o&&o.background)}); return b0.apply(this,arguments); }; }
    if(ADV.setBg){ const s0=ADV.setBg; ADV.setBg=function(m){ push({k:'setbg',t:bgs(m)}); return s0.apply(this,arguments); }; } }
  const y0=GAME.say; GAME.say=function(w,t){ push({k:'say',n:(w&&w.name)||(typeof w==='string'?w:''),t:String(t==null?'':t)}); return y0.apply(this,arguments); };
  const c0=GAME.choose; GAME.choose=function(o){ push({k:'choose',t:(o||[]).filter(x=>x&&!x.hidden).map(x=>((x.t||x.text)||'')).join('｜')}); return c0.apply(this,arguments); };
  if(GAME.caption){ const p0=GAME.caption; GAME.caption=function(n,t){ push({k:'cap',t:String(t==null?'':t)}); return p0.apply(this,arguments); }; }
  return 'ok'; })()"""
STARTED_JS = r"""(c=>{ const Lg=window.__BG5||[]; const hit=e=>(!!c.qid&&(e.k==='out'||e.k==='hv')&&e.t===c.qid)||(!!c.ev&&e.k==='ev'&&e.t===c.ev)||(!!c.stop&&e.k==='stop'&&e.t===c.stop);
  const f=Lg.filter(hit); return f.length?f.map(e=>({k:e.k,t:e.t,d:e.d,h:e.h})):null; })"""
BGNOW_JS = r"""(k=>{ const a=document.getElementById('adv'), b=document.getElementById('advBg'); if(!a||!b) return {active:false,cls:'',bg:'',target:false};
  const bi=getComputedStyle(b).backgroundImage||'', cls=a.className||'';
  return {active:!!(typeof ADV!=='undefined'&&ADV.active), cls, bg:bi.slice(0,160), target:bi.indexOf('/assets/bg/'+k+'.webp')>=0&&/\bimage\b/.test(cls)&&!/\bdark\b/.test(cls)}; })"""
CAP_JS = r"""(()=>{ const e=document.getElementById('caption'); return (!!e&&!e.classList.contains('hide')&&e.style.opacity!=='0')?(e.textContent||'').trim():''; })()"""
MEASURE_JS = r"""async (k)=>{
  const vis=el=>{ if(!el) return false; if(el.classList&&el.classList.contains('hide')) return false; const c=getComputedStyle(el); if(c.display==='none'||c.visibility==='hidden'||+c.opacity<0.02) return false; const r=el.getBoundingClientRect(); return r.width>1&&r.height>1; };
  const adv=document.getElementById('adv'), bgEl=document.getElementById('advBg'); if(!adv||!bgEl) return {err:'沒有 #adv／#advBg',boxes:[]};
  const VW=innerWidth, VH=innerHeight, cs=getComputedStyle(bgEl), R=bgEl.getBoundingClientRect();
  const m=/url\(["']?([^"')]+)["']?\)/.exec(cs.backgroundImage||''), url=m?m[1]:null, file=url?decodeURI(url.replace(/^.*?\/assets\//,'assets/')):null;
  let nat=null; if(url) nat=await new Promise(res=>{ const i=new Image(); i.onload=()=>res([i.naturalWidth,i.naturalHeight]); i.onerror=()=>res(null); i.src=url; });
  const rot=document.getElementById('rotate');
  const out={vw:VW,vh:VH,orient:VW>VH?'land':'port',advCls:adv.className,file,target:!!file&&file==='assets/bg/'+k+'.webp'&&/\bimage\b/.test(adv.className)&&!/\bdark\b/.test(adv.className),
    cg:/\bcg\b/.test(adv.className),night:/\bnight\b/.test(adv.className),bgSize:cs.backgroundSize,bgPos:cs.backgroundPosition,bgFilter:cs.filter,
    advBg:[R.left,R.top,R.width,R.height].map(v=>+v.toFixed(1)),nat,boxes:[],rotate:!!rot&&getComputedStyle(rot).display!=='none',
    dlgName:((document.getElementById('dlgName')||{}).textContent||'').trim(),dlgText:((document.getElementById('dlgText')||{}).textContent||'').trim().slice(0,80)};
  if(!nat||!R.width||!R.height) return out;
  const iw=nat[0], ih=nat[1], W=R.width, H=R.height, size=String(cs.backgroundSize||'').trim();
  const s=size==='contain'?Math.min(W/iw,H/ih):Math.max(W/iw,H/ih); out.sizeNote=(size==='cover'||size==='contain')?size:'不是 cover／contain（'+size+'），照 cover 算';
  const dw=iw*s, dh=ih*s;
  const pp=(t,free)=>{ if(t==null||t==='center') return free/2; if(/%$/.test(t)) return free*parseFloat(t)/100; if(/px$/.test(t)) return parseFloat(t); if(t==='left'||t==='top') return 0; if(t==='right'||t==='bottom') return free; return free/2; };
  const tk=String(cs.backgroundPosition||'50% 50%').split(',')[0].trim().split(/\s+/);
  const ox=R.left+pp(tk[0],W-dw), oy=R.top+pp(tk.length>1?tk[1]:'center',H-dh);
  const cl=(v,a)=>Math.max(0,Math.min(a,v)), r1=v=>+(+v).toFixed(1);
  const toImg=(x0,y0,x1,y1)=>{ const p=[cl((x0-ox)/s,iw),cl((y0-oy)/s,ih),cl((x1-ox)/s,iw),cl((y1-oy)/s,ih)]; return {px:p.map(v=>Math.round(v)),pct:[p[0]/iw*100,p[1]/ih*100,p[2]/iw*100,p[3]/ih*100].map(r1)}; };
  const V=toImg(0,0,VW,VH);
  out.cover={s:+s.toFixed(4),dw:r1(dw),dh:r1(dh),ox:r1(ox),oy:r1(oy),vis:V,visArea:r1((V.px[2]-V.px[0])*(V.px[3]-V.px[1])/(iw*ih)*100),cut:{left:V.pct[0],right:r1(100-V.pct[2]),top:V.pct[1],bottom:r1(100-V.pct[3])}};
  const add=(label,el)=>{ if(!vis(el)) return; const r=el.getBoundingClientRect(); const x0=cl(r.left,VW), y0=cl(r.top,VH), x1=cl(r.right,VW), y1=cl(r.bottom,VH); if(x1-x0<1||y1-y0<1) return;
    out.boxes.push({label,rect:[r.left,r.top,r.width,r.height].map(r1),view:[x0,y0,x1,y1].map(r1),img:toImg(x0,y0,x1,y1),coverPct:r1((x1-x0)*(y1-y0)/(VW*VH)*100)}); };
  add('dlg',document.getElementById('dlg')); add('choices',document.getElementById('choices')); add('caption',document.getElementById('caption')); add('advTop',document.getElementById('advTop'));
  for(const [lab,sel] of [['spriteL','#advL.show img'],['spriteR','#advR.show img'],['spriteL','#advL.show .ph'],['spriteR','#advR.show .ph']]) for(const el of document.querySelectorAll(sel)) add(lab,el);   /* 立繪：img 元素的框（object-fit:contain，實際畫的人比框窄）*/
  if(out.cg) add('cg',document.getElementById('advCg'));
  for(const id of ['title3','letterT','letterB']) add(id,document.getElementById(id));
  const N=48, bx=out.boxes.filter(b=>b.label!=='advTop'); let hit=0, hitD=0;   /* 合計（取樣，重疊不重複算）：對話框＋選項＋字幕＋立繪…（紀錄／略過鍵不算）*/
  for(let i=0;i<N;i++) for(let j=0;j<N;j++){ const x=(i+0.5)*VW/N, y=(j+0.5)*VH/N; if(bx.some(b=>x>=b.view[0]&&x<b.view[2]&&y>=b.view[1]&&y<b.view[3])) hit++; }
  out.coverAllPct=r1(hit/(N*N)*100);
  return out; }"""
HIDE_JS = r"""(on=>{ const adv=document.getElementById('adv'); if(!adv) return false;
  if(on){ const h=el=>{ if(!el||!el.style||el.dataset.bg5o!==undefined) return; el.dataset.bg5o=el.style.opacity||'-'; el.style.opacity='0'; };
    for(const el of document.body.children){ if(el!==adv&&el.tagName!=='SCRIPT'&&el.tagName!=='STYLE'&&el.id!=='bg5ol') h(el); } for(const el of adv.children){ if(el.id!=='advBg') h(el); } }
  else for(const el of document.querySelectorAll('[data-bg5o]')){ el.style.opacity=el.dataset.bg5o==='-'?'':el.dataset.bg5o; delete el.dataset.bg5o; }
  return true; })"""
OUTLINE_JS = r"""(boxes=>{ let o=document.getElementById('bg5ol'); if(o) o.remove(); if(!boxes||!boxes.length) return 0;
  o=document.createElement('div'); o.id='bg5ol'; o.style.cssText='position:fixed;inset:0;z-index:2147483000;pointer-events:none';
  const C={dlg:'#ff3030',choices:'#3c78ff',caption:'#00d8d8',spriteL:'#ffd000',spriteR:'#ffd000',advTop:'#cccccc',cg:'#ff00ff',title3:'#ff8800',letterT:'#888888',letterB:'#888888'};
  for(const b of boxes){ const d=document.createElement('div'), c=C[b.label]||'#ffffff';
    d.style.cssText='position:absolute;box-sizing:border-box;left:'+b.view[0]+'px;top:'+b.view[1]+'px;width:'+(b.view[2]-b.view[0])+'px;height:'+(b.view[3]-b.view[1])+'px;border:2px dashed '+c+';background:'+c+'22';
    const t=document.createElement('span'); t.textContent=b.label+' '+b.coverPct+'%'; t.style.cssText='position:absolute;left:2px;top:2px;font:11px/1.2 monospace;color:#fff;background:'+c+'cc;padding:1px 4px'; d.appendChild(t); o.appendChild(d); }
  document.body.appendChild(o); return boxes.length; })"""


TYPED_JS = "(()=>{ const n=document.getElementById('dlgNext'); return !!n&&n.style.visibility==='visible'; })()"


async def ts(pg):
    """bbplay 的 ts＋typed（這一句打完字＝#dlgNext 看得到；game3d.js 的 dlgTick 每一格才多打幾個字，SwiftShader 1～4 fps 時
    隔 0.6 秒讀兩次可能剛好沒有新的一格＝讀到同一個「打到一半」的句子，所以不能只靠「連續兩次同一句」）"""
    s = await P.ts(pg)
    try: s['typed'] = bool(await pg.evaluate(TYPED_JS))
    except Exception: s['typed'] = False
    return s


def line_done(s, last, same_n):
    """這一句打完了：#dlgNext 出來＋讀到同一句；或同一句連續 4 次（約 2.4 秒沒有變＝不是在打字）"""
    return bool(s['txt']) and s['txt'] == last and (s.get('typed') or same_n >= 4)


async def wait_line(pg, max_s=20):
    """等這一句打完字（連續兩次讀到同一句）或出選項"""
    t0 = time.time(); last = None; same = 0
    while time.time() - t0 < max_s:
        s = await ts(pg)
        if s['ch']: return s
        if s['dlg'] and s['txt']:
            same = same + 1 if s['txt'] == last else 1
            if line_done(s, last, same): return s
            last = s['txt']
        await pg.wait_for_timeout(600)
    return await ts(pg)




async def set_orient(pg, run, o):
    if pg.viewport_size != VP[o]:
        await pg.set_viewport_size(VP[o]); await pg.wait_for_timeout(RELAYOUT_MS)
    if await pg.evaluate("(()=>{ const r=document.getElementById('rotate'); if(r&&r.classList.contains('want')){ r.classList.remove('want'); return true; } return false; })()"):
        run.setup('[前置] 直向的「請把手機轉成橫向」（#rotate.want）還在 → 拿掉（同 playlib.load_state；玩家點一下就關）')
    await pg.evaluate("new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(()=>r(1))))")


def describe(m):
    """量到的數字 → 一行中文"""
    if not m or m.get('err'): return '量不到：%s' % (m and m.get('err'))
    cv = m.get('cover')
    if not cv: return '底圖 %s 沒有原始尺寸（圖沒載入？）class=%s' % (m.get('file'), m.get('advCls'))
    v = cv['vis']['pct']; ct = cv['cut']
    s = '%s：#advBg %s／%s，原圖 %s，縮放 %.3f；看得到原圖 x %.1f%%～%.1f%%、y %.1f%%～%.1f%%（原圖面積的 %.1f%%；裁掉 左 %.1f%%、右 %.1f%%、上 %.1f%%、下 %.1f%%）' % (
        ONAME.get(m['orient'], m['orient']), m.get('bgSize'), m.get('bgPos'), 'x'.join(map(str, m.get('nat') or [])), cv['s'], v[0], v[2], v[1], v[3], cv['visArea'], ct['left'], ct['right'], ct['top'], ct['bottom'])
    for b in m.get('boxes') or []:
        ip = b['img']['pct']
        s += '；%s 蓋住畫面 %.1f%%（原圖 x %.1f%%～%.1f%%、y %.1f%%～%.1f%%）' % (b['label'], b['coverPct'], ip[0], ip[2], ip[1], ip[3])
    s += '；合計（不含紀錄／略過鍵、重疊不重複算）%.1f%%' % m.get('coverAllPct', 0)
    if m.get('night'): s += '；#adv.night（白天的圖調暗當晚上）'
    if m.get('cg'): s += '；CG 模式（#advCg 蓋在底圖上）'
    if m.get('rotate'): s += '；（#rotate 提示蓋著）'
    s += '；那一句［%s］%s' % (m.get('dlgName') or '旁白', m.get('dlgText') or '')
    return s


def crop_map(k, m, path):
    """示意圖：用量到的數字畫在原圖上（不是遊戲截圖）。暗＝被裁掉看不到；綠框＝看得到的範圍；紅＝對話框、黃＝立繪、藍＝選項、青＝字幕"""
    try:
        from PIL import Image, ImageDraw
    except Exception as e:
        return 'PIL 不能用：%r' % e
    try:
        src = os.path.join(ROOT, 'assets', 'bg', k + '.webp')
        im = Image.open(src).convert('RGBA'); iw, ih = im.size
        nat = m.get('nat') or [iw, ih]; fx, fy = iw / float(nat[0]), ih / float(nat[1])
        sc = lambda p: [int(round(p[0] * fx)), int(round(p[1] * fy)), int(round(p[2] * fx)), int(round(p[3] * fy))]
        ov = Image.new('RGBA', im.size, (0, 0, 0, 0)); dr = ImageDraw.Draw(ov)
        v = sc(m['cover']['vis']['px'])
        for r in ((0, 0, iw, v[1]), (0, v[3], iw, ih), (0, v[1], v[0], v[3]), (v[2], v[1], iw, v[3])):
            if r[2] - r[0] > 0 and r[3] - r[1] > 0: dr.rectangle(r, fill=(0, 0, 0, 165))
        dr.rectangle(v, outline=(0, 255, 0, 255), width=5); dr.text((v[0] + 8, v[1] + 6), 'VISIBLE %s' % m.get('orient'), fill=(0, 255, 0, 255))
        col = {'dlg': (255, 48, 48), 'choices': (60, 120, 255), 'caption': (0, 216, 216), 'spriteL': (255, 208, 0), 'spriteR': (255, 208, 0), 'cg': (255, 0, 255), 'title3': (255, 136, 0)}
        for b in m.get('boxes') or []:
            if b['label'] not in col: continue
            p = sc(b['img']['px']); c = col[b['label']]
            if p[2] - p[0] < 2 or p[3] - p[1] < 2: continue
            dr.rectangle(p, fill=c + (70,), outline=c + (255,), width=4); dr.text((p[0] + 6, p[1] + 4), '%s %.1f%%' % (b['label'].upper(), b['coverPct']), fill=c + (255,))
        Image.alpha_composite(im, ov).convert('RGB').save(path)
        return path
    except Exception as e:
        return '畫不出來：%r' % e



READ_JS = r"""(a=>{ const out={}; for(const [k,id] of a){ const e=typeof STORY_EVENTS!=='undefined'?STORY_EVENTS.find(x=>x&&x.id===id):null; if(!e){ out[id]={found:false}; continue; }
    const bgs=[]; let b0=null; try{ b0=e.background; }catch(err){ b0='（background 讀取例外）'; } if(b0!=null) bgs.push('background:'+(typeof b0==='string'?b0:JSON.stringify(b0)));
    for(const l of (Array.isArray(e.dialogue)?e.dialogue:[])) if(l&&l.bg) bgs.push('bg:'+(typeof l.bg==='string'?l.bg:JSON.stringify(l.bg)));
    out[id]={found:true,retired:e.retired?String(e.retired).slice(0,80):'',off:!!e.off,hit:bgs.some(s=>s==='background:'+k||s==='bg:'+k||s.indexOf('assets/bg/'+k+'.webp')>=0),bgs:bgs.slice(0,8)}; }
  out.__tainan=(()=>{ try{ const P=typeof Y2B!=='undefined'?Y2B.PS_TAINAN:null, sc=P&&P.first&&P.first.find(x=>x&&typeof x==='object'&&x.bg); return sc?{scene:sc.scene,bg:sc.bg}:null; }catch(e){ return 'err '+e.message; } })();
  return out; })"""
RUN_JS = r"""(a=>{ const notes=[]; if(typeof EVENTS!=='undefined'&&EVENTS.running) notes.push('（注意：別的事件正在演 EVENTS.running='+EVENTS.running+'，EVENTS.run 會直接 return）');
  { const ch=document.getElementById('choices'); if(ch&&!ch.classList.contains('hide')) notes.push('（注意：畫面上的選單還開著［'+[...ch.querySelectorAll('button')].map(b=>(b.textContent||'').trim().slice(0,24)).join('｜')+'］，之後的截圖可能帶著它）'); }
  const e=typeof STORY_EVENTS!=='undefined'?STORY_EVENTS.find(x=>x&&x.id===a.ev):null; if(!e) return notes.concat(['找不到 '+a.ev]).join('');
  let ev=e;
  if(a.hold){ const sc=(e.dialogue||[]).find(l=>l&&l.scene!==undefined); if(!sc) return notes.concat([a.ev+' 沒有 scene 那一句']).join('');
    ev={id:'cc_bg107_hold_'+a.ev,title:'',participants:[],location:'any',trigger:'manual',background:'dark',dialogue:[Object.assign({},sc,{hold:60000})]};
    notes.push('【捷徑：只為拍照】暫時事件 '+ev.id+'：dialogue＝['+JSON.stringify(sc)+' 加 hold 60000]（不是玩家看得到的長度）'); }
  try{ void EVENTS.run(ev); notes.push('void EVENTS.run('+ev.id+')'); }catch(x){ notes.push('例外 '+x.message); }
  return notes.join(''); })"""
SEEN_JS = r"""(a=>{ const Lg=window.__BG5||[]; return Lg.filter(e=>(e.k==='begin'||e.k==='setbg')&&e.ms>=a.since).map(e=>({k:e.k,t:String(e.t).slice(0,120),hit:String(e.t)===a.bg||String(e.t).indexOf('assets/bg/'+a.bg+'.webp')>=0})); })"""
OUTBG_JS = r"""(a=>{ let b=null; try{ b=typeof OUT!=='undefined'&&OUT.bg?OUT.bg(a.alias):null; }catch(e){ b='err '+e.message; }
  const e=typeof STORY_EVENTS!=='undefined'?STORY_EVENTS.find(x=>x&&x.id===a.ev):null;
  return {found:!!e,retired:e&&e.retired?String(e.retired).slice(0,80):'',off:!!(e&&e.off),image:b&&typeof b==='object'?b.image:b,night:!!(b&&b.night)}; })"""
OUTGO_JS = r"""(qid=>{ const G=GAME.G, notes=[]; if(typeof EVENTS!=='undefined'&&EVENTS.running) notes.push('（注意：別的事件正在演 EVENTS.running='+EVENTS.running+'）');
  { const ch=document.getElementById('choices'); if(ch&&!ch.classList.contains('hide')) notes.push('（注意：畫面上的選單還開著［'+[...ch.querySelectorAll('button')].map(b=>(b.textContent||'').trim().slice(0,24)).join('｜')+'］）'); }
  const q=typeof OUT!=='undefined'&&OUT.get?OUT.get(G,qid):null; if(!q) return notes.concat(['存檔裡找不到出遊 '+qid]).join('');
  notes.push('出遊原本 state='+q.state); q.state='planned'; q.ask=null;
  try{ void OUT.go(GAME,q); notes.push('；void OUT.go(GAME,q)'); }catch(e){ notes.push('例外 '+e.message); } return notes.join(''); })"""
RUNNING_JS = "(()=>typeof EVENTS!=='undefined'?(EVENTS.running||null):null)()"


def hm(h):
    if h is None: return '--:--'
    m = int(round(float(h) * 60)); return '%02d:%02d' % (m // 60, m % 60)


async def resolve(pg, v, d):
    if isinstance(v, tuple) and v and v[0] == 'DAY': return (await P.day_of(pg, v[1]))['d']
    if isinstance(v, tuple) and v and v[0] == 'REL': return d + v[1]
    return v


async def build_state(pg, c):
    d = await P.day_of(pg, c['when'])
    st = {'name': '祐廷', 'energy': 100, 'events': {'done': {}, 'last': {}, 'count': 0}, 'contacts': {}, 'outings': []}
    F = st['flags'] = dict(BASEF)
    for k, kk in ROOMS:
        dd = (await P.day_of(pg, kk))['d']
        if dd <= d['d']: F[k] = dd
    for fk, fv in (c.get('flags') or {}).items(): F[fk] = await resolve(pg, fv, d['d'])
    st.update(day=d['d'], weekday=d['wd'], hour=c['h'], zone=c['zone'], pos=None, weather=c.get('weather', 'clear'), stage='law', money=30000)
    st['visited'] = {z: True for z in VISITED}
    if c.get('q'):   # 存檔裡已經約好的那一趟出遊（玩家之前回了「好」）
        q = copy.deepcopy(c['q']); q['day'] = d['d']; q.setdefault('state', 'planned'); q.setdefault('ask', None); st['outings'] = [q]
    return st, d


async def wait_scene(pg, cdp, run, c, hold=False):
    """等到底圖換成那一張＋第一句打完字（或出選項；hold＝地點字幕在就算）。之前別的對話照玩家點過去"""
    t0 = time.time(); last = None; same = 0; pre = []; s = None; g = None
    while time.time() - t0 < SCENE_S:
        g = await pg.evaluate(BGNOW_JS, c['bg']); s = await ts(pg)
        if g['target']:
            if s['ch']: return True, s, g, pre
            if s['dlg'] and s['txt']:
                same = same + 1 if s['txt'] == last else 1
                if line_done(s, last, same): return True, s, g, pre
                last = s['txt']
            elif hold and await pg.evaluate(CAP_JS): return True, s, g, pre
            await pg.wait_for_timeout(600); continue
        if s['ch']:
            k2, _ = P.pick_of(s['ch'], (), decline=False)
            pre.append(['［選項］', J([o['t'] for o in s['ch']]) + ' → ' + s['ch'][k2]['t']]); await P.tap_choice(pg, cdp, k2); await pg.wait_for_timeout(1000); continue
        if s['dlg'] and s['txt']:
            if not pre or pre[-1] != [s['name'], s['txt']]: pre.append([s['name'], s['txt']])
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(700); continue
        if s['phone']: await L.phone_away(pg, cdp); continue
        await pg.wait_for_timeout(700)
    return False, s, g, pre


async def pre_wait(pg, cdp, run, c):
    """讀檔後 PRE_S 秒：遊戲自己演了那一件＝'self'；別的事件／選單照玩家點過去（記下來）"""
    cinfo = {'qid': (c.get('q') or {}).get('id'), 'ev': c['ev'], 'stop': None}
    t0 = time.time(); other = []
    while time.time() - t0 < PRE_S:
        st = await pg.evaluate(STARTED_JS, cinfo)
        if st: return 'self', st, other
        s = await ts(pg)
        if s['phone'] and not s['ch'] and not s['dlg']: await L.phone_away(pg, cdp); continue
        if s['ch']:
            k2 = next((i for i, o in enumerate(s['ch']) if c.get('match') and not o['dim'] and o['t'].startswith('出發') and c['match'] in o['t']), None)
            if k2 is not None:
                run.note('%s：遊戲自己跳出選單 %s → 點「%s」（像玩家）' % (c['k'], J([o['t'] for o in s['ch']]), s['ch'][k2]['t']))
                await P.tap_choice(pg, cdp, k2); await pg.wait_for_timeout(1500); continue
            k2, _ = P.pick_of(s['ch'], (), decline=False)
            other.append(['［選項］', J([o['t'] for o in s['ch']]) + ' → ' + s['ch'][k2]['t'], s.get('running')])
            run.note('%s：讀檔後畫面上有選單 %s（running=%s）→ 點「%s」（照玩家）' % (c['k'], J([o['t'] for o in s['ch']]), s.get('running'), s['ch'][k2]['t']))
            await P.tap_choice(pg, cdp, k2); await pg.wait_for_timeout(1200); continue
        if s['dlg'] and s['txt']:
            if not other or other[-1][:2] != [s['name'], s['txt']]: other.append([s['name'], s['txt'], s.get('running')])
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(650); continue
        if not s.get('running') and time.time() - t0 > 6: break   # 沒有別的事件在演、也沒有自己開演：不再等
        await pg.wait_for_timeout(1000)
    st = await pg.evaluate(STARTED_JS, cinfo)
    return ('self' if st else None), st, other


async def shoot_set(pg, run, c, o, tag, rec, bgonly=True):
    """這一個方向：量 → 截圖（對話框開著）→（bgonly）暫時只留底圖拍一張、加虛線框再拍一張 → 還原 → 畫 cropmap"""
    k, bg = c['k'], c['bg']
    await set_orient(pg, run, o)
    m = await pg.evaluate(MEASURE_JS, bg)
    await pg.wait_for_timeout(300)
    out = {'measure': m, 'dlg': await run.shot(pg, '%s_%s_%s_dlg' % (k, o, tag))}
    if bgonly and BGONLY:
        run.setup('【捷徑：只為比較】%s［%s］只有底圖的兩張：暫時把對話框、選項、字幕、立繪、HUD、紀錄／略過鍵設成透明，拍完馬上還原；不是玩家看得到的畫面' % (k, ONAME[o]))
        try:
            await pg.evaluate(HIDE_JS + '(true)'); await pg.wait_for_timeout(400)
            out['bgonly'] = await run.shot(pg, '%s_%s_%s_bgonly' % (k, o, tag))
            await pg.evaluate(OUTLINE_JS, (m or {}).get('boxes') or []); await pg.wait_for_timeout(250)
            out['bgbox'] = await run.shot(pg, '%s_%s_%s_bgbox' % (k, o, tag))
        finally:
            await pg.evaluate(OUTLINE_JS, None); await pg.evaluate(HIDE_JS + '(false)'); await pg.wait_for_timeout(250)
    if m and m.get('cover'): out['cropmap'] = crop_map(bg, m, os.path.join(OUT, '%s_%s_%s_cropmap.png' % (k, o, tag)))
    sp = [b for b in (m or {}).get('boxes') or [] if b['label'].startswith('sprite')]
    dl = [b for b in (m or {}).get('boxes') or [] if b['label'] == 'dlg']
    run.note('%s［%s・%s］#adv class=「%s」、#advBg filter=%s' % (k, ONAME[o], tag, (m or {}).get('advCls'), (m or {}).get('bgFilter')))
    run.note('%s［%s・%s］對話框 %s、立繪 %s；%s' % (k, ONAME[o], tag, ('%.1f%%' % dl[0]['coverPct']) if dl else '（沒有）',
                                            '＋'.join('%s %.1f%%' % (b['label'], b['coverPct']) for b in sp) or '（沒有）', describe(m)))
    rec.setdefault('shots', {}).setdefault(tag, {})[o] = out
    return out


def exists(p):
    return bool(p) and os.path.exists(p) and os.path.getsize(p) > 0


async def case_run(p, run, c):
    k, bg = c['k'], c['bg']
    rec = SUMMARY.setdefault(k, {'bg': bg, 'ev': c['ev'], 'grp': c['grp'], 'src': c['src']})
    orients = ['land', 'port'] if ORIENT == 'both' else [ORIENT]
    b, ctx, pg, cdp, errs = await L.launch(p, landscape=(orients[0] == 'land'))
    pg.on('dialog', lambda dd: asyncio.ensure_future(dd.accept()))
    try:
        await pg.goto(URL); loaded = await L.wait_loaded(pg)
        if not loaded: run.note('%s：遊戲沒有在時間內載入完（照樣往下）' % k)
        await pg.evaluate("localStorage.clear()"); await P.init(pg); await pg.evaluate(HOOK)
        if c.get('alias'):   # 背景不在事件裡（FEST 的 call）：只讀確認 OUT.bg(代號) 指到那張圖
            me = await pg.evaluate(OUTBG_JS, {'alias': c['alias'], 'ev': c['ev']}); rd = {c['ev']: me}; rec['read'] = rd
            run.check('%s：只讀確認 OUT.bg(%s).image＝assets/bg/%s.webp、事件 %s 在 STORY_EVENTS' % (k, c['alias'], bg, c['ev']),
                      bool(me.get('found')) and me.get('image') == 'assets/bg/%s.webp' % bg, J(me))
        else:
            rd = await pg.evaluate(READ_JS, [[bg, c['ev']]] + [[bg, x] for x in c.get('also') or []])
            me = (rd or {}).get(c['ev']) or {}; rec['read'] = rd
            run.check('%s：只讀確認 %s 有接 %s（背景或 {scene,bg}）' % (k, c['ev'], bg), bool(me.get('hit')), J(me))
        if me.get('retired') or me.get('off'):
            rec['info'] = '停用'; run.note('%s：INFO %s 已停用（%s）→ 不演' % (k, c['ev'], me.get('retired') or 'off')); return
        for x in c.get('also') or []:
            a = (rd or {}).get(x) or {}
            run.check('%s：只讀確認 %s 也接 %s（不演）' % (k, x, bg), bool(a.get('hit')), J(a))
        st, d = await build_state(pg, c)
        rec.update(day=d, h=c['h'], zone=c['zone'])
        await L.load_state(pg, st, quiet_events=QUIET, quiet_phone=True); await pg.evaluate(CLEARP)
        run.setup('[前置] %s：最小存檔讀到 %s（%s 第 %s 週，星期%s%s）%s %s%s；%s；%s' % (
            k, d['key'], d.get('term'), d.get('week'), '日一二三四五六'[d['wd'] % 7], '，假日' if d.get('hol') else '', hm(c['h']), c['zone'],
            ('；旗標 %s' % J({fk: st['flags'].get(fk) for fk in (c.get('flags') or {})})) if c.get('flags') else '', c['src'],
            '條件事件、手機自動打開先關（QUIET）' if QUIET else '條件事件照常'))
        await pg.wait_for_timeout(2500); await L.phone_away(pg, cdp); await L.close_panels(pg, cdp)
        how, started, other = await pre_wait(pg, cdp, run, c)
        if other: run.note('%s：讀檔後先點過的（不是這一件）：%s' % (k, J(other)[:1200]))
        cinfo = {'qid': None, 'ev': c['ev'], 'stop': None}
        if c.get('hold'):   # 沒有台詞的一場：先照原樣演一次，只查 setBg 紀錄
            t_ms = await pg.evaluate("performance.now()")
            if not how:
                r = await pg.evaluate(RUN_JS, {'ev': c['ev'], 'hold': False})
                run.setup('【捷徑】%s：%d 秒內沒有自己演 → %s' % (k, PRE_S, r)); how = 'shortcut'
            for _ in range(60):
                if not await pg.evaluate(RUNNING_JS): break
                await pg.wait_for_timeout(500)
            seen = await pg.evaluate(SEEN_JS, {'since': t_ms - 60000, 'bg': bg}); rec['real_seen'] = seen
            started = await pg.evaluate(STARTED_JS, cinfo)
            run.check('%s：照原樣演 %s 時 ADV.begin／setBg 拿到 %s（這一場沒有台詞，只停 0.7 秒）' % (k, c['ev'], bg), bool(started) and any(x['hit'] for x in seen or []), J({'started': started, 'seen': seen})[:600])
            r = await pg.evaluate(RUN_JS, {'ev': c['ev'], 'hold': True})
            run.setup('%s：%s' % (k, r)); await pg.wait_for_timeout(1500)
            ok, s, g, pre = await wait_scene(pg, cdp, run, c, hold=True)
            how_t = '照原樣演（%s）＋【捷徑：只為拍照】hold 暫時事件' % ('自己演' if how == 'self' else '【捷徑】EVENTS.run')
        else:
            if not how and c.get('q'):   # 出遊：【捷徑】直接出發（同 cc_bg5_probe 的 FALLBACK_JS）
                cinfo = {'qid': c['q']['id'], 'ev': c['ev'], 'stop': None}
                r = await pg.evaluate(OUTGO_JS, c['q']['id'])
                run.setup('【捷徑】%s：讀檔後 %d 秒內沒有自己開演（遊戲時間 %s）→ %s' % (k, PRE_S, J(await P.clock(pg)), r)); how = 'shortcut_out'
                await pg.wait_for_timeout(2500)
                started = await pg.evaluate(STARTED_JS, cinfo)
            elif not how:
                r = await pg.evaluate(RUN_JS, {'ev': c['ev'], 'hold': False})
                run.setup('【捷徑】%s：讀檔後 %d 秒內沒有自己演（遊戲時間 %s）→ %s' % (k, PRE_S, J(await P.clock(pg)), r)); how = 'shortcut'
                await pg.wait_for_timeout(2000)
                started = await pg.evaluate(STARTED_JS, cinfo)
            ok, s, g, pre = await wait_scene(pg, cdp, run, c)
            if how == 'self' and c.get('q'): cinfo = {'qid': c['q']['id'], 'ev': c['ev'], 'stop': None}
            if c.get('q') and not started: started = await pg.evaluate(STARTED_JS, {'qid': c['q']['id'], 'ev': c['ev'], 'stop': None})
            how_t = {'self': '遊戲自己演（出遊＝跳出「出發」→ 點）' if c.get('q') else '遊戲自己演', 'shortcut': '【捷徑】void EVENTS.run', 'shortcut_out': '【捷徑】void OUT.go(GAME,q)'}.get(how, how)
            run.check('%s：事件演出（%s；%s）' % (k, c['ev'], how_t), bool(started) and ok,
                      J({'started': started, 'bg': g and g.get('bg'), 'adv': g and g.get('cls'), 'line': s and [s.get('name'), s.get('txt')], 'choices': s and s.get('ch')})[:700])
        rec.update(how=how_t, started=started, scene_ok=ok, lines_before_bg=pre, bg_now=g)
        if pre: run.note('%s：到那一張底圖以前點過的：%s' % (k, J(pre)[:1200]))
        if not ok:
            await run.shot(pg, '%s_noscene' % k)
            log = await pg.evaluate("(window.__BG5||[]).slice(-40)"); rec['log_tail'] = log
            run.note('%s：沒到那一張底圖（最後 %s）。最後的紀錄：%s' % (k, J(g)[:300], J(log)[:1500]))
            for o in orients: run.check('%s［%s］：背景是 assets/bg/%s.webp（不是 dark）' % (k, ONAME[o], bg), False, '沒到那一張底圖')
            return
        first_named = bool(s.get('name'))
        cap = await pg.evaluate(CAP_JS)
        if cap and not c.get('hold'):   # 地點字幕還在（場景開頭 2.4 秒）：先拍一張，再等它收掉
            await shoot_set(pg, run, c, orients[0], 'cap', rec, bgonly=False)
            for _ in range(10):
                if not await pg.evaluate(CAP_JS): break
                await pg.wait_for_timeout(500)
        for o in orients:
            sh = await shoot_set(pg, run, c, o, 'first', rec)
            m = sh['measure'] or {}
            run.check('%s［%s］：背景是 assets/bg/%s.webp（#adv image、不是 dark）' % (k, ONAME[o], bg), bool(m.get('target')),
                      J({'file': m.get('file'), 'adv': m.get('advCls'), 'nat': m.get('nat'), 'bgSize': m.get('bgSize'), 'bgPos': m.get('bgPos')}))
            if c.get('nonight'):
                run.check('%s［%s］：夜景圖本身、沒有再被調暗（#adv 沒有 night class、#advBg filter 是 none）' % (k, ONAME[o], ), (not m.get('night')) and str(m.get('bgFilter') or 'none') == 'none',
                          J({'advCls': m.get('advCls'), 'bgFilter': m.get('bgFilter'), 'file': m.get('file')}))
            run.check('%s［%s］：截圖存在' % (k, ONAME[o]), exists(sh.get('dlg')) and (not BGONLY or exists(sh.get('bgonly'))), J([sh.get('dlg'), sh.get('bgonly'), sh.get('bgbox')]))
        if c.get('hold'):
            run.note('%s：INFO 這一場沒有台詞（AA_397 3-3），沒有對話框、沒有立繪；截圖是 hold 暫時事件的地點字幕＋底圖' % k)
        elif SPK and not first_named and not s.get('ch'):   # 往下點到第一句有人說話（立繪出來）
            if pg.viewport_size != VP[orients[0]]: await set_orient(pg, run, orients[0])
            got = None; why = ''
            for i in range(SPK_TAPS):
                await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(700)
                s2 = await wait_line(pg); g2 = await pg.evaluate(BGNOW_JS, bg)
                if not g2['target']: why = '往下點第 %d 句，底圖換掉了（%s）' % (i + 1, g2.get('bg')); break
                if not s2['ch'] and not s2['dlg']: why = '往下點第 %d 句，事件已經演完（沒有對話框、沒有選項）' % (i + 1); break
                if s2['dlg'] and s2['name']: got = s2; break
                if s2['ch']:
                    k2, _ = P.pick_of(s2['ch'], c.get('picks', ()), decline=False)
                    run.note('%s：往下點遇到選項 %s → 點「%s」' % (k, J([o['t'] for o in s2['ch']]), s2['ch'][k2]['t'])); await P.tap_choice(pg, cdp, k2); await pg.wait_for_timeout(1000)
            if got:
                run.note('%s：往下點到［%s］%s' % (k, got.get('name'), (got.get('txt') or '')[:80]))
                for o in orients: await shoot_set(pg, run, c, o, 'spk', rec, bgonly=False)
            else:
                rec['no_speaker'] = why or '%d 句內沒有人說話' % SPK_TAPS
                run.note('%s：INFO 沒拍到有人說話的那一句（%s）%s' % (k, rec['no_speaker'], '——這一場本來就只有旁白＝沒有立繪' if c.get('narr_only') else ''))
        elif first_named:
            run.note('%s：第一句就有人說話［%s］＝first 那一組就是有人說話的畫面' % (k, s.get('name')))
    finally:
        rec['pageerrors'] = errs[:5]
        if errs: run.note('%s：頁面 JS 例外（只記）%s' % (k, J(errs[:3])))
        try: await asyncio.wait_for(b.close(), 30)
        except Exception: pass


async def info_only(p, run):
    """停用的事件、沒有地方讀的資料：只在頁面讀（INFO，不演）"""
    b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
    try:
        await pg.goto(URL); await L.wait_loaded(pg)
        rd = await pg.evaluate(READ_JS, [[bg, ev] for bg, ev in RETIRED]); SUMMARY['__retired'] = rd
        for bg, ev in RETIRED:
            a = (rd or {}).get(ev) or {}
            run.note('INFO %s＝%s：%s；背景有接 %s：%s（%s）→ 停用的事件不演、不拍' % (bg, ev, ('停用 retired「%s」' % a.get('retired')) if a.get('retired') else ('off' if a.get('off') else '★沒有標停用'), bg, a.get('hit'), J(a.get('bgs'))))
        run.note('INFO tainan_school：Y2B.PS_TAINAN 的場景 %s——這份資料目前沒有地方讀（hometown3d.js 用 PS_TAINAN_VISITS），不演、不拍' % J((rd or {}).get('__tainan')))
    finally:
        try: await asyncio.wait_for(b.close(), 30)
        except Exception: pass


async def main():
    run = L.Run('bg107', OUT); os.makedirs(OUT, exist_ok=True)
    cases = [c for c in CASES if str(c['grp']) in GROUPS and (not ONLY or c['k'] in ONLY or c['ev'] in ONLY or c['bg'] in ONLY)]
    if ORIENT not in ('both', 'land', 'port'): run.check('ORIENT 認得', False, ORIENT); sys.exit(run.finish())
    for x in [x for x in GROUPS if x not in ('107', 'dark', '108', '109', 'lib')]: run.check('GROUP 認得 %s' % x, False, '認得的：107,dark,108,109,lib')
    known = {c['k'] for c in CASES} | {c['ev'] for c in CASES} | {c['bg'] for c in CASES} | {'info'}
    for x in [x for x in ONLY if x not in known]: run.check('IDS 認得 %s' % x, False, '認得的：%s' % ','.join(c['k'] for c in CASES))
    print('==== cc_bg107_probe（SHA %s；GROUP=%s；%d 場［%s］；ORIENT=%s；QUIET=%s；BGONLY=%s）====' % (
        os.environ.get('SHA', '?'), ','.join(GROUPS), len(cases), ','.join(c['k'] for c in cases), ORIENT, QUIET, BGONLY), flush=True)
    async with async_playwright() as p:
        if ('107' in GROUPS or 'dark' in GROUPS) and (not ONLY or 'info' in ONLY):
            print('---- 停用／沒有地方讀（只讀）----', flush=True)
            try: await asyncio.wait_for(info_only(p, run), 300)
            except Exception as e: run.note('INFO 只讀那一段沒跑完：%r' % e)
        for c in cases:
            print('---- %s %s（%s → %s）----' % (c['grp'], c['k'], c['ev'], c['bg']), flush=True)
            try:
                await asyncio.wait_for(case_run(p, run, c), CASE_MAX)
            except asyncio.TimeoutError:
                run.check('%s：事件演出（%s）' % (c['k'], c['ev']), False, '超過 CASE_MAX %d 秒' % CASE_MAX)
            except Exception as e:
                run.check('%s：跑完（沒有探針例外）' % c['k'], False, repr(e)[:500]); traceback.print_exc()
            try:
                with open(os.path.join(OUT, 'cc_bg107_measure.json'), 'w', encoding='utf-8') as f: json.dump({'sha': os.environ.get('SHA', '?'), 'url': URL, 'orient': ORIENT, 'cases': SUMMARY}, f, ensure_ascii=False, indent=1)
            except Exception as e: print('measure.json 寫不出來', e, flush=True)
    print('SHA', os.environ.get('SHA', '?'), '量測：', os.path.join(OUT, 'cc_bg107_measure.json'), flush=True)
    print('（check 只看：事件演出、背景是那張圖、截圖存在。重點有沒有被對話框／立繪擋住＝人看截圖判斷；ALL PASS 不代表畫面合格。【捷徑】的紀錄在上面［前置／捷徑］）', flush=True)
    sys.exit(run.finish())

if __name__ == '__main__':
    asyncio.run(main())
