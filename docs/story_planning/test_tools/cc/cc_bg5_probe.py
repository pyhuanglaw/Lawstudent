"""CC（帳號 A）11-02：第五批 10 張 ADV 2D 底圖（開發分支 63f00030＝第 1～5 張、78ebf658＝第 6～10 張）
  ＋第六批 10 張（c3036bc9，BB_132 第 103 組；清單在檔案下面的 CASES6）
  ＋第七批 10 張（8c00f06d＝前 5 張、6767db8f＝後 5 張，BB_132 第 104 組；清單在 CASES7）
  ＋第八批 10 張（296ed2d0a，BB_132 第 105 組；清單在 CASES8）在遊戲裡的畫面——
  ① 對話框（字幕框）有沒有擋到底圖的重點；② 直向（390×844）、橫向（844×390）手機模擬的裁切。
探針只「客觀記錄＋截圖」：好不好看、重點有沒有被擋，由人看截圖判斷（不寫死「全部通過」）。
check 只有三種：事件真的演出來（遊戲的 OUT.go／EVENTS.run／JP.playStop 收到那一件，而且畫面到了那一張底圖、對話框開著）、
  背景是那張圖（#advBg 實際算出來的 background-image＝assets/bg/<id>.webp、#adv 是 image 不是 dark）、截圖檔存在。

底圖怎麼顯示（src/adv3d.js）：#adv（position:fixed; inset:0）裡的 #advBg，background-size:cover、background-position:center——
  原圖 1672×941（16:9）。橫向 844×390 寬度貼滿、上下各裁一點；直向 390×844 高度貼滿、左右裁掉很多（只看得到中間大約四分之一寬）。
  探針照 #advBg 實際的 computed style 和圖的原始尺寸算：看得到原圖的哪一塊（百分比）、對話框（#dlg）／選項（#choices）／地點字幕（#caption）／
  立繪（#advL／#advR）蓋住畫面幾 %、蓋在原圖的哪個範圍（百分比）。印成 note，也寫進 <輸出資料夾>/cc_bg5_measure.json。

每一張底圖、每一個方向的截圖：
  NN_<id>_<land|port>_first_dlg.png    到了那一張底圖、第一句對話開著（真的在事件裡）
  NN_<id>_<land|port>_first_bgonly.png 同一刻，暫時把網頁上其他元素（對話框、選項、字幕、立繪、HUD、紀錄／略過鍵）設成透明＝只有底圖【捷徑：只為比較】
  NN_<id>_<land|port>_first_bgbox.png  只有底圖＋虛線框標出剛才對話框／選項／立繪／字幕的位置（框上寫蓋住畫面幾 %）
  <id>_<land|port>_first_cropmap.png   示意圖（不是遊戲截圖）：用量到的數字畫在原圖上——暗掉的是被裁掉看不到的部分，紅框＝對話框、黃＝立繪、藍＝選項、青＝字幕
  另外（有的話）：NN_<id>_<方向>_cap_dlg.png＝地點字幕還在的那一刻；NN_<id>_<方向>_spk_dlg.png＋cropmap＝往下點到第一句有人說話（立繪出來）的那一刻
  遊戲本身沒有「關掉對話框」的按鈕（#advTop 只有「紀錄」「略過對話」），所以只有底圖的那一張是暫時改 DOM 透明度拍的，拍完馬上還原。

直向、橫向：預設 ORIENT=both＝同一頁、同一句對話，先拍橫向，再 page.set_viewport_size 切到直向（等 1.8 秒＋兩個 animation frame 讓版面重排；
  #rotate.want 還在就拿掉，同 playlib.load_state）；之後要拍「有人說話」那一句時先切回第一個方向。ORIENT=land／port＝整個瀏覽器 context 一開始就是那個方向、只拍那個方向
  （要「直向、橫向各開一個 context」就跑兩次：ORIENT=land 一次、ORIENT=port 一次，輸出資料夾分開）。

怎麼讓事件演出來（每一張開一個新的瀏覽器）：
  【前置】最小存檔（GAME.defaults＋過了開場的旗標，同 cc_dl04b_probe.py 的 state_at；給第三個參數或 SAVE＝使用者存檔.json 就改用那份改日期）
    讀到那件事真實會發生的日期、時間、地點；出遊型的事件（9 張）把「已經約好的那一趟出遊」直接放進存檔的 G.outings
    （＝玩家之前已經回了「好」／答應了；id、時間、地點、車程照程式裡排出遊那一行原樣抄）。讀檔時條件事件、手機自動打開先關（QUIET=1，
    playlib quiet_events：避免別的事件搶先演；目標事件走 OUT.go／JP 據點，不經過 EVENTS.tick）。
  之後照玩家：等遊戲自己跳出「出發：……」→ 點（OUT.tick 的 S.prompt；日本據點是選單裡的「出發：……」）；別的對話點過去；別的選單不點。
    日本報到（jp_intl_office）不用點：JP.SCH g1_office 3/27 10:00 到了，據點自己演。
  【捷徑】PROMPT_S 秒內沒有自己開演（例：那天別的強制劇情、選單擋住 OUT.tick）→ void OUT.go(GAME,q)（日本：JP.goOut／JP.playStop）直接出發，
    印出原因與當時畫面上的選單。用 void＝不等 Promise（page.evaluate 會等 Promise）。
  到了以後：底圖換成那一張之前的對話（例：沛珊那趟先在台中車站接人）照玩家點過去；到了那一張、第一句打完字（#dlgNext「▼ 點一下繼續」出來＋連續兩次讀到同一句；低幀率只看「同一句」會拍到打到一半的句子）就拍。

10 張（id：事件／程式；真實條件；探針的日期時間）：
  gym_pool       ev_sis16_swim（src/data/sis_b16_events.js:104；排程 src/sis_b16_3d.js:85-91 SISB16.SWIM_OUT）
                 真實：法律系、和學姊交往中，2029-05-11 21:00 學姊私訊、回「好。」→ 5/12（六）07:00 新體育館。探針：2029-05-12 06:36 宿舍＋那一趟出遊。
  ziqing_studio  ev_ziqing_studio_night（src/v6b_3d.js:221；V6B.zqPhone 205-216）
                 真實：2028-11-10（五）18:00 子晴私訊（法律系、在臺灣、ZQ_CONTRACT 有值、ZQ_Q15 沒值、沒交往、不是前任、朋友以上、有聯絡方式、她單身在臺北）
                 → 回「好」→ 21:00 工作室（late 0.25）。探針：2028-11-10 20:18 宿舍＋出遊；ZQ_STUDIO_GO:'yes'。
  tc_schoolroad  hometown_lines.js schoolroad（HV.play，src/hometown3d.js:63、74；出遊 ev_hv_ps，src/data/events.js:1405）
                 真實：寒暑假沛珊在台中（STORY.presence kind 'home'）→ 手機「我去台中找妳？」→ 排 10:30 那一趟；那天第二次以後（HV_N≥1）、
                 PS_SCHOOLROAD 有值且不是 'walked'（之前送行時她說過「下次來，我帶你去我國中走路上學那條路。」）→ 台中車站接人以後先走這條路。
                 探針：2026-07-21（大一暑假）09:18 宿舍＋出遊；HV_N.classmate_peishan=1、PS_SCHOOLROAD＝30 天前。先經過 tc_station 的接人兩句（照玩家點過去）。
  court_hall     ev_pool_zjw_court（src/pool3d.js:228-229；台詞 src/data/pool_story.js:127 court）
                 真實：大一下第 3～10 週平日早上在傅鐘，和曾靖雯（pool_7）有點熟、答應「我跟妳去。」→ POOL.courtDay：下一個 13:30～16:30 沒課的平日 14:00。
                 探針：大一下第 4 週週三（Y1S2 週三下午沒課）13:27 宿舍＋出遊。
  radio_room     ev_pool_jy_radio（src/pool_more3d.js:169、240 planRadio；台詞 src/data/pool_story_b2.js:77 radio）
                 真實：徐靜儀（pool_13）2-5，大二上第 10 週邀（椰林大道當面或手機 pool_jy_invite）→ 那週週四 20:00 廣播社的錄音間。探針：Y2S1 第 10 週週四 19:33。
  welfare_room   ev_pool_sce_tutor（src/pool_more3d.js:171、264-265 acceptSce；台詞 src/data/pool_story_b2.js:135 tutor）
                 真實：蘇維倫（pool_19；AA_527 1-7 由「蘇承恩」改名）4-3，大一下第 3～12 週在社科院圖書館答應 → 下一個週六 10:00 社福中心。探針：Y1S2 第 5 週週六 09:27。
  phil_cafe      ev_pool_lyx_cafe（src/pool_more3d.js:176、379 planCafe；台詞 src/data/pool_story_b4.js:90 cafe）
                 真實：廖芸萱（pool_15）3-3，大一下第 12～15 週文學院當面或手機邀 → 週四 19:00 文學院的教室。探針：Y1S2 第 13 週週四 18:33。
  psy_lab        ev_hxh_subject（src/sup519_3d.js:206；SUP519.hxhPhone 197-204）
                 真實：大二上第 8～12 週，和黃筱涵（npc_huangxh）有點熟＋有聯絡方式，週一 21:00 她私訊、回「好。」→ 週四 15:00 心理系實驗室。探針：Y2S1 第 9 週週四 14:36。
  jp_eatery      ev_jp_dinner（src/data/jp_events.js:63、137；JP.dinnerPhone src/jp3d.js:224-231）
                 真實：日本路線、人在日本，2028-06-09 21:00 以安私訊（交往中，或 FRIEND 以上且不是冷靜中）、回「好。」→ 6/10（六）18:30。
                 探針：2028-06-10 18:06 jp_hub（日本據點）＋出遊；EXCHANGE_ROUTE JP、JP_DEPARTED 3/25、AN_JP_DINNER_ASK yes。據點選單的「出發：……」照玩家點。
  jp_intl_office ev_jp_office（src/data/jp_events.js:26、133；JP.SCH g1_office src/jp3d.js:112）
                 真實：日本路線、人在日本，2028-03-27 10:00 到了據點自己演（JP.loop 的 dueStop）。探針：2028-03-27 10:00 jp_hub，等它自己演。
  （沒有交往的最小存檔：學姊游泳、日本兩件的「交往中」那幾句不會出；日本照「挽回中」那一版（jp3d.js rep＝!dat）。只看畫面，不驗台詞。）

第六批 10 張（c3036bc9；做法同上：最小存檔＋已經約好的出遊、等遊戲自己跳「出發」；每一張的條件寫在 CASES6 那一行的 src／註解）：
  cafe_door_night ev_sis_xmas_y2（sis_b4_3d.js:89）2026-12-24 22:00；探針 21:36 宿舍＋出遊、SIS_XMAS_Y2_GO。
  gym_court       ev_zhe_game_y2（story3d.js:2472 y2_ball）2026-12-19（六）14:00；探針 13:36。同一張圖也接在 ev_zhe_game_y2s2、ev_final_game_y3、ev_last_game_y4、
                  ev_b106_42_game——不演，只在頁面裡讀 STORY_EVENTS 確認 background／dialogue 的 bg 有 gym_court（check「只讀確認」）。
  gym_gate        ev_sis16_swim 後半（同 gym_pool 那一趟）：先經過 gym_pool 的五句（照玩家點過去），到「新體育館門口」換 gym_gate 才拍。
  wancai_lobby    ev_concert_y4（r2y4b3d.js:203 y4_concert）2029-05-12 19:00；探針 18:36。
  us_c_door       ev_sis14_day40（sis_b14_3d.js:110 DAY40_OUT；第四十天私訊回「我過去。」）2028-09-11 22:30 美國；探針 22:16 us_apartment＋美國路線旗標（tests/aa370_us_unit.js 的 US）。
  noodle_door     ev_yt_vday_y2（an_yt_hol3d.js:73）2027-02-14 12:00；門口那兩句就是第一張底圖（旁白＋語彤一句，SPK 拍語彤那句），之後換 noodle_table。
  jp_beach        ev_jp_sea（jp3d.js:122 JP.SCH g8_sea，if:dat）2028-07-17 09:00 據點自己演；探針 dating_heroine_01:true（JP 的 dat 只看這個旗標）。
  kh_hotel_front  ev_kexin_qixi_y2（r2y3a_events.js:62，trigger manual；只有 KH_A ev_kexin_trip_summer_y2 演完 → after khNight（8/8 16:00）→ next_event 才演）
                  探針：2027-08-07 07:16 宿舍＋已經約好的 y3_kh（r2y3a3d.js:101）、KX_KH_GO，整段 KH_A（左營、旗津、選項照 pick_of 第一個）點過去，接到 KH_B。
                  SCENE_S 這一張 600 秒；沒接到＝【捷徑】在頁面改到 2027-08-08 16:00、KX_KH_DAY1 → void EVENTS.run(ev_kexin_qixi_y2)。DIRECT=kh_hotel_front＝一開始就走捷徑。
  hwaxin_street   ev_sq10_hwaxin（sideq3d.js:475 S.plan10，週六 14:00）；探針大二上第 6 週週六 13:06＋出遊（支線 SQ10 的紀錄 G.sideq 沒放：演完的 after 不會推進支線，只看畫面）。
  vet_clinic      ev_sq14_vet（sideq3d.js:504 S.cage14，公園放進外出籠的那一刻＋15 分鐘）；探針大二上第 10 週週三 15:46 宿舍＋出遊（真實是在溫州街公園排的；這裡從宿舍出發）。

第七批 10 張（8c00f06d 前 5 張、6767db8f 後 5 張；做法同上；kind 'self'＝遊戲自己的劇情串叫 EVENTS.run，等它自己演，FALLBACK【捷徑】＝void EVENTS.run）：
  kh_hill_harbor_night ev_kexin_qixi_y2 晚上那段（r2y3a_events.js:67，原本借 kh_river_night）：同 kh_hotel_front 那一趟（y3_kh → KH_A → KH_B），
                  旅館門口兩句＋advance 19:30 點過去，換「高雄・港邊的山上」才拍；沒接到＝【捷徑】同 kh_hotel_front（DIRECT=kh_hill_harbor_night 一開始就走）。
  jp_konbini_summer ev_jp_lastnight（jp_events.js:101 LAST；JP.SCH g8_konbini 2028-08-04 22:00 據點自己演，dat＝dating_heroine_01 → 交往版；
                  挽回中版 ev_jp_lastnight_alone 同一張圖，不另拍）。探針 22:00 jp_hub。
  gg_luggage_shop ev_jp_suitcase（jp_events.js:18 SUITCASE；jp3d.js:211 JP.phone 的 OUT.plan jp_g0_bag 2028-03-11（六）14:00 公館）
                  真實：日本路線、出發前（2/20 退宿～3/25）、交往中，3/10 21:00 以安私訊（不用回）→ 排出遊。住臺北的家那段（HOME 的 2D 選單）太深：
                  探針【前置】人在公館（3D，G.home.at 沒設）13:18＋出遊；EXCHANGE_ROUTE JP、X1_JP 2/20、dating_heroine_01（不給 JP_DEPARTED）。
  us_lake_summer  ev_usl_lake1（us_life_events.js:35 bg 'us_lake' → OUT.bg 照日期換季節版 usLakeVariant：6～8 月＝夏天）；
                  us_life3d.js:392 8/5 17:30 學姊私訊＝排 usl_lake1 18:30 湖邊。探針 2028-08-05 18:03 us_apartment＋出遊；美國路線旗標＋dating_heroine_05。
  us_lake_bare    ev_us3_lake（r2y4a_events.js:133 bg 'us_lake' → 11/15 以後＝樹掉光）；r2y4a3d.js:173 us3_lake 2028-11-23 09:00 會所門口。探針 08:48。
  sf_photo_cablecar／sf_photo_chowder／sf_photo_postbox  ev_sf_photo17／19／21（r2y4a_events.js:254 PHOTO：{scene:'舊金山',bg:<那張>}＋「📷（…）」＋學姊一句）
                  真實：美國路線交往中，12/16 07:00 以後 R2Y4A.tick → S.leave（r2y4a3d.js:124）一口氣演 ev_us_leave、ev_sf1、照片 17、ev_sf2、照片 19、ev_sf3、照片 21。
                  手機照片＝遊戲裡就是這一段 ADV 全畫面底圖（S.leave 先 ADV.begin dark、標題卡「12/17 舊金山」）；手機相簿（G.album／G.places.photos）沒有這三張＝不能另外在手機裡拍（INFO）。
                  探針【前置】2028-12-16 07:06 us_apartment、US_TRIP_MODE 'sf'、dating_heroine_05、前面幾件記成演過（G.events.done：17＝ev_us_leave、ev_sf1；19＝再加 photo17、ev_sf2；21＝再加 photo19、ev_sf3）
                  → 等 S.leave 自己跳到那一天演那一張。
  us_farmers_market ev_sis_qixi 2028 美國版（sis_qixi_events.js:57 label y28；sis_qixi3d.js:93 usAsked 排 sisqx_2028 8/26（六）09:00）。探針 2028-08-26 08:36 us_apartment＋出遊。
  us_chapel_steps_snow ev_us_first_snow（r2y4a3d.js:178 us_snow 2028-12-02 20:00 小教堂前的台階）。
                  ★6767db8f 只「先登記」（12/2 兩場照舊 us_chapel_snow）；之後 366ac3e2 才接到 ev_us_first_snow、ev_us_snow_repair（BB 987cdace）。
                  探針先在頁面只讀 STORY_EVENTS 確認這一版事件有沒有接這張圖（hookcheck）：沒接＝記 INFO「先登記、還沒接到事件」，不演、不算 FAIL。探針 19:48。
  （美國四張、舊金山三張用 USF 美國路線旗標＋met_sis＋dating_heroine_05；最小存檔沒有其他美國篇進度，只看畫面，不驗台詞。）

第八批 10 張（296ed2d0a；做法同上；kind 'lines'＝不是出遊也不是 STORY_EVENTS 的台詞，一開始就【捷徑】；每一張的條件寫在 CASES8 那一行的 src）：
  sis_new_home    ev_sis16_box（sis_b16_3d.js:65 BOX_OUT，2029-01-20（六）14:00）；探針 13:16 宿舍＋出遊。同一張圖的 ev_sis14_curry_home（12/31，要 h5 的承諾＋12/30 私訊，條件比較深）、
                  ev_sis13_curry 只讀確認（also，不演）。
  wenzhou         ev_kexin_our_day_wk 的 _kxODP wenzhou（story3d.js:2172 大一下「我們的日子」固定格，約在中間輪到溫州街；beforeOuting 記 _kxODP）；探針大一下第 5 週週六 13:36＋出遊（odPlace wenzhou）。
  wenzhou_park    ev_sq18_park（sideq3d.js:288 SQ18，大二下起，下個週日 08:30）；探針大二下第 5 週週日 08:06＋出遊。
  ntu_library_2f  ev_zq_testbuild（zq_testbuild3d.js:37，2028-03-08 12:10）；探針 11:46＋出遊、ZQ_TB_GO。
  putong_empty    ev_pool_lq_teach（pool_more3d.js:256 acceptLq，週四 19:00）；探針大一下第 12 週週四 18:33＋出遊。
  law_courtyard   馬佳蓉 5-3 搬影印機（pool_story_b2.js:173 copier）：只在萬才館 3D 跟她說話（法服值班的週六）→ P.offer 答應 → P.run＝EVENTS.runLines——探針做不到，
                  【捷徑】void EVENTS.run（暫時事件包同一段台詞，participants pool_20、background dark）；探針大一下第 13 週週六 12:06 宿舍。
  boya_201        ev_pool_ysh_debate（pool_more3d.js:309 acceptYsh，週六 14:00）；探針大一下第 10 週週六 13:33＋出遊。
  linze_201       ev_yule_lecture ①（yule3d.js:83 OUTS.listen，2027-10-20 18:50；YL_LEC listen）；探針 18:27＋出遊。第一句就是這張（第二段換 noodle_table）。
  boya_lecture_hall ev_kexin_lecture_ntu（r2y3a3d.js:157 y3_k11，2027-09-29 19:00；KX_K11_GO）；探針 18:39＋出遊。
  ra_lab          ev_pg_sis_bday（postgrad3d.js:182 planBday，畢業典禮那天 2029-06-02 20:30；beforeOuting → bdayScene 的 ADV.begin(ra_lab)）；探針 20:06＋出遊，
                  【前置】畢業典禮那一段記成演過（ev_grad_family、F.PG.done.grad、GRADUATED），不然讀檔就先演整段畢業典禮。
  （linze_201 也是 3D 教室的 view、ra_lab 也在 lab5f3d 的 OUT.bg 包裝裡＝3D 的參數，不是 ADV 底圖：只記 INFO。）

不是 iPhone：Playwright 手機模擬（is_mobile、觸控、SwiftShader 1～4 fps），不用 ?turbo 也可以（要更快可以加）。
用法：LW_TESTS=<工作樹>/tests SHA=<sha> python3 cc_bg5_probe.py '<URL>/index.html' <輸出資料夾> [使用者存檔.json]
環境變數：BATCH=5,6,7,8（只跑這幾批；預設 5,6,7,8 四批 40 張全跑）、IDS=gym_court,jp_beach（只跑這幾張；舊的 ONLY 同義，可以和 BATCH 一起用＝交集）、
  DIRECT=kh_hotel_front,kh_hill_harbor_night（有寫 direct 的那幾張一開始就走【捷徑】EVENTS.run）、ORIENT=both|land|port、QUIET=1（0＝讀檔不關條件事件）、SPK=1（0＝不拍有人說話那一句）、
  PROMPT_S（等遊戲自己開演，預設 90）、SCENE_S（開演後等到那一張底圖＋對話框，預設 150；CASES 裡有 scene_s 的那一張取比較大的）、CASE_MAX（一張最多幾秒，預設 900；有 case_max 的取比較大的）、RELAYOUT_MS（切方向後等多久，預設 1800）。
不要和別的瀏覽器測試同時跑（SwiftShader 搶 CPU）。"""
import os, sys, json, asyncio, time, copy, traceback
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__)))); import bbplay as P   # bbplay 在上一層（BB 的 test_tools）
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
ROOT = os.path.dirname(os.path.abspath(os.environ['LW_TESTS']))   # 工作樹根目錄（畫 cropmap 用原圖）
SAVEF = sys.argv[3] if len(sys.argv) > 3 else os.environ.get('SAVE')
SAVE = None
if SAVEF:
    SAVE = json.load(open(SAVEF, encoding='utf-8')); SAVE = SAVE.get('G', SAVE)
J = lambda o: json.dumps(o, ensure_ascii=False)
ONLY = [x.strip() for x in (os.environ.get('IDS', '') + ',' + os.environ.get('ONLY', '')).split(',') if x.strip()]
BATCH = [int(x) for x in os.environ.get('BATCH', '5,6,7,8').replace('，', ',').split(',') if x.strip().isdigit()]
DIRECT = [x.strip() for x in os.environ.get('DIRECT', '').split(',') if x.strip()]
ORIENT = os.environ.get('ORIENT', 'both').strip()
QUIET = os.environ.get('QUIET', '1') != '0'
SPK = os.environ.get('SPK', '1') != '0'
PROMPT_S = int(os.environ.get('PROMPT_S', '90'))
SCENE_S = int(os.environ.get('SCENE_S', '150'))
CASE_MAX = int(os.environ.get('CASE_MAX', '900'))
RELAYOUT_MS = int(os.environ.get('RELAYOUT_MS', '1800'))
SPK_TAPS = 6
VP = {'land': {'width': 844, 'height': 390}, 'port': {'width': 390, 'height': 844}}
ONAME = {'land': '橫向 844×390', 'port': '直向 390×844'}

# ---------------------------------------------------------------- 最小存檔（cc_dl04b_probe.py 的 state_at）
BASEF = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True, 'metAn': True, 'met_an': True, 'MET_ZHE': True,
         'zheNoodleDone': True, 'KX_FIRST_MSG': True, 'KX_EVE_MSG': True, 'FAM_GROUP_SENT': True, 'CEREMONY_Y1': True, 'KAI_MOVEIN': True, 'LAW_RECAP_SEEN': True,
         'fundsV2': 1, 'KX_DEC3_MIGRATED': True, 'dating_kexin': False}   # 法律系、過了開場；GAME.defaults 的 dating_kexin:true 拿掉
ROOMS = (('ROOM_Y2', '2026-09-06'), ('ROOM_Y3', '2027-09-05'), ('ROOM_Y4', '2028-09-03'))
VISITED = ('noodle', 'cafe', 'library_hall', 'library', 'lawlib', 'wancai', 'linze', 'gongguan', 'wenzhou', 'soclib', 'cvs', 'bookstore')
JPF = {'EXCHANGE_ROUTE': 'JP', 'EXCH_RULE': 1, 'X1_JP': ('DAY', '2028-02-20'), 'JP_DEPARTED': ('DAY', '2028-03-25'), 'AN_SENDOFF': 'together'}   # tests/jp_semester_unit.js inJapan()

# ---------------------------------------------------------------- 10 張（q＝存檔裡已經約好的出遊，照程式排出遊那一行原樣抄；{d}＝那一天的 day）
CASES = [
    dict(k='gym_pool', kind='outing', ev='ev_sis16_swim', when='2029-05-12', load_h=6.6, zone='dorm', match='游泳',
         q=dict(id='sisb16_swim', ev='ev_sis16_swim', h=7, late=0.5, place='新體育館', title='新體育館（學姊游泳）', travel='走路 約 10 分鐘', travelH=1 / 6, hours=1.5, alarm=True),
         flags={}, src='src/sis_b16_3d.js:86 SISB16.SWIM_OUT'),
    dict(k='ziqing_studio', kind='outing', ev='ev_ziqing_studio_night', when='2028-11-10', load_h=20.3, zone='dorm', match='工作室',
         q=dict(id='v6b_zq_studio', ev='ev_ziqing_studio_night', h=21, late=0.25, place='子晴的工作室', title='子晴的工作室：試玩新關卡', travel='捷運＋公車 約 30 分鐘', travelH=0.5, alarm=True),
         flags={'ZQ_STUDIO_GO': 'yes'}, src='src/v6b_3d.js:215 V6B.zqPhone 的 OUT.plan'),
    dict(k='tc_schoolroad', kind='outing', ev='ev_hv_ps', hv=True, when='2026-07-21', load_h=9.3, zone='dorm', match='台中',
         q=dict(id='hv_classmate_peishan_{d}', ev='ev_hv_ps', h=10.5, late=1, place='台中', title='去台中找沛珊', travel='高鐵約一小時', travelH=1, back='回到臺北。', hv={'id': 'classmate_peishan', 'keep': False}),
         flags={'HV_N': {'classmate_peishan': 1}, 'PS_SCHOOLROAD': ('REL', -30)}, src='src/hometown3d.js:46 HV.ask 的 OUT.plan（travel／travelH 照 hometown_lines.js classmate_peishan）'),
    dict(k='court_hall', kind='outing', ev='ev_pool_zjw_court', when=['Y1S2', 4, 3], load_h=13.45, zone='dorm', match='旁聽',
         q=dict(id='pool_court_{d}', ev='ev_pool_zjw_court', h=14, late=0.5, place='臺北地方法院', title='陪靖雯去旁聽（臺北地方法院 14:00）', travel='捷運 約 20 分鐘', travelH=1 / 3),
         flags={}, src='src/pool3d.js:228 POOL.acceptZjw'),
    dict(k='radio_room', kind='outing', ev='ev_pool_jy_radio', when=['Y2S1', 10, 4], load_h=19.55, zone='dorm', match='廣播社',
         q=dict(id='pool_jy_radio', ev='ev_pool_jy_radio', h=20, late=0.5, place='廣播社的錄音間', title='徐靜儀：廣播社錄音（地下室的錄音間 20:00）', travel='走過去約 10 分鐘', travelH=0.25),
         flags={}, src='src/pool_more3d.js:240 POOL_MORE.planRadio（planOut 預設 late 0.5、走過去約 10 分鐘）'),
    dict(k='welfare_room', kind='outing', ev='ev_pool_sce_tutor', when=['Y1S2', 5, 6], load_h=9.45, zone='dorm', match='課輔',
         q=dict(id='pool_sce_tutor_{d}', ev='ev_pool_sce_tutor', h=10, late=0.5, place='社福中心', title='蘇維倫：週六的課輔（社福中心 10:00）', travel='公車 約 20 分鐘', travelH=1 / 3),
         flags={}, src='src/pool_more3d.js:265 POOL_MORE.acceptSce'),
    dict(k='phil_cafe', kind='outing', ev='ev_pool_lyx_cafe', when=['Y1S2', 13, 4], load_h=18.55, zone='dorm', match='哲學咖啡館',
         q=dict(id='pool_lyx_cafe_{d}', ev='ev_pool_lyx_cafe', h=19, late=0.5, place='文學院', title='廖芸萱：哲學咖啡館（文學院的教室 19:00）', travel='走過去約 10 分鐘', travelH=0.25),
         flags={}, src='src/pool_more3d.js:379 POOL_MORE.planCafe'),
    dict(k='psy_lab', kind='outing', ev='ev_hxh_subject', when=['Y2S1', 9, 4], load_h=14.6, zone='dorm', match='受試者',
         q=dict(id='aa519_hxh', ev='ev_hxh_subject', h=15, late=0.5, place='心理系實驗室', title='當受試者（筱涵）', travel='走過去約 10 分鐘', travelH=1 / 6),
         flags={}, src='src/sup519_3d.js:199 SUP519.hxhPhone 的 OUT.plan'),
    dict(k='jp_eatery', kind='outing', ev='ev_jp_dinner', when='2028-06-10', load_h=18.1, zone='jp_hub', match='小餐館',
         q=dict(id='jp_g7_dinner', ev='ev_jp_dinner', h=18.5, late=0.5, place='日本・學校後面的小餐館', title='和以安：學校後面的小餐館（日本 18:30）', travel='走路約 10 分鐘', travelH=1 / 6),
         flags=dict(JPF, AN_JP_DINNER_ASK='yes'), src='src/jp3d.js:231 JP.dinnerPhone 的 OUT.plan'),
    dict(k='jp_intl_office', kind='jpstop', ev='ev_jp_office', stop='g1_office', when='2028-03-27', load_h=10.0, zone='jp_hub', match='',
         q=None, flags=dict(JPF), src='src/jp3d.js:112 JP.SCH g1_office（2028-03-27 10:00，據點自己演）'),
]
for _c in CASES: _c.setdefault('batch', 5)

# ---------------------------------------------------------------- 第六批 10 張（c3036bc9）；load_h＝約好的時間－車程－15 分鐘（OUT.due 開始問的時間）再加一點
USF = {'EXCHANGE_ROUTE': 'US', 'EXCH_RULE': 1, 'X1_US': ('DAY', '2028-07-25'), 'US_DEPARTED': True, 'US_ARRIVED': True, 'US_ARRIVED_DAY': ('DAY', '2028-08-02'), 'US1': 'together',
       'Y4_PATH': 'bar', 'Y4_PATH_DAY': ('DAY', '2028-06-08')}   # tests/aa370_us_unit.js 的 US（人在美國：us_life3d.js USL.here＝US_ARRIVED、出發日～返台日之間）
GYM_COURT_ALSO = ['ev_zhe_game_y2s2', 'ev_final_game_y3', 'ev_last_game_y4', 'ev_b106_42_game']
CASES6 = [
    dict(k='cafe_door_night', kind='outing', ev='ev_sis_xmas_y2', when='2026-12-24', load_h=21.6, zone='dorm', match='聖誕夜',
         q=dict(id='sisb4_xmas_y2', ev='ev_sis_xmas_y2', h=22, late=0.25, place='兩點半 Café 門口', title='聖誕夜（兩點半 Café 門口）', travel='走路 約 10 分鐘', travelH=1 / 6, alarm=True),
         flags={'met_sis': True, 'SIS_XMAS_Y2_GO': True}, src='src/sis_b4_3d.js:89 SISB4.HOL xmas_y2 的 out（plan 加 alarm）；真實：交往中 12/23 21:00 她私訊、回好'),
    dict(k='gym_court', kind='outing', ev='ev_zhe_game_y2', when='2026-12-19', load_h=13.6, zone='dorm', match='系籃', also=GYM_COURT_ALSO,
         q=dict(id='y2_ball', ev='ev_zhe_game_y2', h=14, late=0.25, place='新體育館', title='系籃比賽（大二）', travel='走過去約 10 分鐘', travelH=1 / 6),
         flags={}, src='src/story3d.js:2472 y2_ball（12/18 21:00 阿哲揪＝排出遊，不用回）'),
    dict(k='gym_gate', kind='outing', ev='ev_sis16_swim', when='2029-05-12', load_h=6.6, zone='dorm', match='游泳', scene_s=300,
         q=dict(id='sisb16_swim', ev='ev_sis16_swim', h=7, late=0.5, place='新體育館', title='新體育館（學姊游泳）', travel='走路 約 10 分鐘', travelH=1 / 6, hours=1.5, alarm=True),
         flags={}, src='src/sis_b16_3d.js:86 SISB16.SWIM_OUT（同 gym_pool 那一趟；gym_pool 的五句點過去，到「新體育館門口」換 gym_gate）'),
    dict(k='wancai_lobby', kind='outing', ev='ev_concert_y4', when='2029-05-12', load_h=18.6, zone='dorm', match='成發',
         q=dict(id='y4_concert', ev='ev_concert_y4', h=19, late=0.5, place='吉他社成發', title='吉他社成發', travel='走過去約 10 分鐘', travelH=1 / 6),
         flags={}, src='src/r2y4b3d.js:203 ballPhone 的 y4_concert（5/11 21:00 群組）'),
    dict(k='us_c_door', kind='outing', ev='ev_sis14_day40', when='2028-09-11', load_h=22.27, zone='us_apartment', match='C 棟',
         q=dict(id='sisb14_day40', ev='ev_sis14_day40', h=22.5, late=0.5, place='C 棟門口', title='C 棟門口（書瑀）', travel='', travelH=0, hours=0.5, back='回到公寓。'),
         flags=dict(USF, met_sis=True, SIS14_DAY40_GO=('REL', 0)), src='src/sis_b14_3d.js:110 DAY40_OUT＋S.onAnswer（第四十天私訊 sisb13_day40 回「我過去。」）'),
    dict(k='noodle_door', kind='outing', ev='ev_yt_vday_y2', when='2027-02-14', load_h=11.6, zone='dorm', match='阿鳳',
         q=dict(id='anyt_yt_vday_y2', ev='ev_yt_vday_y2', h=12, late=0.5, place='阿鳳麵店', title='情人節（阿鳳麵店）', travel='走路', travelH=1 / 6, alarm=True),
         flags={'YT_VDAY_Y2_GO': True}, src='src/an_yt_hol3d.js:73 HOL yt_y2 的 out（plan 加 alarm）；門口兩句＝事件 background getter BG(noodle_door)'),
    dict(k='jp_beach', kind='jpstop', ev='ev_jp_sea', stop='g8_sea', when='2028-07-17', load_h=9.0, zone='jp_hub', match='',
         q=None, flags=dict(JPF, dating_heroine_01=True), src='src/jp3d.js:122 JP.SCH g8_sea（2028-07-17 09:00，if:dat＝dating_heroine_01，據點自己演）'),
    dict(k='kh_hotel_front', kind='outing', ev='ev_kexin_qixi_y2', when='2027-08-07', load_h=7.27, zone='dorm', match='高雄', scene_s=600, case_max=1500,
         q=dict(id='y3_kh', ev='ev_kexin_trip_summer_y2', h=9, late=0.5, place='左營站', title='去高雄找可昕（兩天一夜）', travel='高鐵約一個半小時', travelH=1.5, back='回到臺北。', alarm=True),
         flags={'KX_KH_GO': True},
         direct=dict(when='2027-08-08', load_h=16.0, flags={'KX_KH_GO': True, 'KX_KH_DAY1': True},
                     why='KH_B 是 trigger manual，只有 KH_A 整段演完（after khNight → next_event）才接；條件深、KH_A 很長（SwiftShader 可能超過 SCENE_S）'),
         src='src/r2y3a3d.js:101 khPhone 的 y3_kh（7/20 她問、回去）→ ev_kexin_trip_summer_y2 → next_event ev_kexin_qixi_y2（prereq KX_KH_DAY1＋8/8）'),
    dict(k='hwaxin_street', kind='outing', ev='ev_sq10_hwaxin', when=['Y2S1', 6, 6], load_h=13.1, zone='dorm', match='華新街',
         q=dict(id='sq10_hwaxin_{d}', ev='ev_sq10_hwaxin', h=14, late=1, place='中和・華新街', title='中和・華新街：滇香小館的乳扇', travel='捷運 約 40 分鐘（南勢角站）', travelH=2 / 3),
         flags={}, src='src/sideq3d.js:475 SIDEQ.plan10（planWeekend：下一個週六；id 後面接 day）'),
    dict(k='vet_clinic', kind='outing', ev='ev_sq14_vet', when=['Y2S1', 10, 3], load_h=15.77, zone='dorm', match='動物醫院',
         q=dict(id='sq14_vet_{d}', ev='ev_sq14_vet', h=16.25, late=1, place='羅斯福路・動物醫院', title='回診：帶牠去動物醫院', travel='走路 約 15 分鐘', travelH=0.25),
         flags={}, src='src/sideq3d.js:504 SIDEQ.cage14（公園「看」貓→放進外出籠：h＝那一刻＋0.25）'),
]
for _c in CASES6: _c['batch'] = 6

# ---------------------------------------------------------------- 第七批 10 張（8c00f06d 前 5 張、6767db8f 後 5 張；BB_132 第 104 組）
USS = dict(USF, met_sis=True, dating_heroine_05=True)   # 美國路線＋和學姊交往中（湖邊、市集、初雪、舊金山都是交往版）
SF_PRE = ['ev_us_leave', 'ev_sf1']
CASES7 = [
    dict(k='kh_hill_harbor_night', kind='outing', ev='ev_kexin_qixi_y2', when='2027-08-07', load_h=7.27, zone='dorm', match='高雄', scene_s=700, case_max=1900,
         q=dict(id='y3_kh', ev='ev_kexin_trip_summer_y2', h=9, late=0.5, place='左營站', title='去高雄找可昕（兩天一夜）', travel='高鐵約一個半小時', travelH=1.5, back='回到臺北。', alarm=True),
         flags={'KX_KH_GO': True},
         direct=dict(when='2027-08-08', load_h=16.0, flags={'KX_KH_GO': True, 'KX_KH_DAY1': True},
                     why='同 kh_hotel_front：KH_B 是 trigger manual，只有 KH_A 整段演完才接；這一張還要再點過旅館門口兩句＋advance 19:30'),
         src='src/data/r2y3a_events.js:67 ev_kexin_qixi_y2 的 {scene:高雄・港邊的山上,bg:kh_hill_harbor_night}（8c00f06d；原本借 kh_river_night）；同 kh_hotel_front 那一趟'),
    dict(k='jp_konbini_summer', kind='jpstop', ev='ev_jp_lastnight', stop='g8_konbini', when='2028-08-04', load_h=22.0, zone='jp_hub', match='',
         q=None, flags=dict(JPF, dating_heroine_01=True),
         src='src/jp3d.js:127 JP.SCH g8_konbini（2028-08-04 22:00 據點自己演；dat→ev_jp_lastnight，挽回中 ev_jp_lastnight_alone 同一張）；jp_events.js:101 LAST（8c00f06d）'),
    dict(k='gg_luggage_shop', kind='outing', ev='ev_jp_suitcase', when='2028-03-11', load_h=13.3, zone='gongguan', match='行李箱',
         q=dict(id='jp_g0_bag', ev='ev_jp_suitcase', h=14, late=0.75, place='公館', title='行李箱的店', travelH=0.5),
         flags={'EXCHANGE_ROUTE': 'JP', 'EXCH_RULE': 1, 'X1_JP': ('DAY', '2028-02-20'), 'dating_heroine_01': True},
         src='src/jp3d.js:211 JP.phone 的 OUT.plan jp_g0_bag（3/10 21:00 以安私訊）；jp_events.js:18 SUITCASE（8c00f06d；原本借 gongguan）。【前置】人在公館 3D（不是住家裡的 2D 選單）'),
    dict(k='us_lake_summer', kind='outing', ev='ev_usl_lake1', when='2028-08-05', load_h=18.05, zone='us_apartment', match='湖邊',
         q=dict(id='usl_lake1', ev='ev_usl_lake1', h=18.5, late=0.5, place='湖邊', title='湖邊', travel='走路 約 15 分鐘', travelH=0.25),
         flags=dict(USS), src='src/us_life3d.js:392 8/5 17:30 學姊私訊的 plan usl_lake1；bg us_lake → outings3d.js usLakeVariant 6～8 月（8c00f06d）'),
    dict(k='us_lake_bare', kind='outing', ev='ev_us3_lake', when='2028-11-23', load_h=8.8, zone='us_apartment', match='湖邊',
         q=dict(id='us3_lake', ev='ev_us3_lake', h=9, late=0.25, place='會所門口', title='感恩節的湖邊', travel='', travelH=0, back='回到社區。'),
         flags=dict(USS), src='src/r2y4a3d.js:173 OUT.plan us3_lake；bg us_lake → usLakeVariant 11/15 以後（8c00f06d）'),
    dict(k='sf_photo_cablecar', kind='self', ev='ev_sf_photo17', when='2028-12-16', load_h=7.1, zone='us_apartment', match='', done=SF_PRE, scene_s=300,
         q=None, flags=dict(USS, US_TRIP_MODE='sf'), phone_photo=True,
         src='src/r2y4a3d.js:129 S.leave 的 steps（12/17 10:00 照片）；r2y4a_events.js:255 PHOTO(ev_sf_photo17,…,sf_photo_cablecar)（6767db8f）'),
    dict(k='sf_photo_chowder', kind='self', ev='ev_sf_photo19', when='2028-12-16', load_h=7.1, zone='us_apartment', match='', done=SF_PRE + ['ev_sf_photo17', 'ev_sf2'], scene_s=300,
         q=None, flags=dict(USS, US_TRIP_MODE='sf'), phone_photo=True,
         src='src/r2y4a3d.js:129 S.leave 的 steps（12/19 13:00 照片）；r2y4a_events.js:256 PHOTO(ev_sf_photo19,…,sf_photo_chowder)（6767db8f）'),
    dict(k='sf_photo_postbox', kind='self', ev='ev_sf_photo21', when='2028-12-16', load_h=7.1, zone='us_apartment', match='', done=SF_PRE + ['ev_sf_photo17', 'ev_sf2', 'ev_sf_photo19', 'ev_sf3'], scene_s=300,
         q=None, flags=dict(USS, US_TRIP_MODE='sf'), phone_photo=True,
         src='src/r2y4a3d.js:129 S.leave 的 steps（12/21 12:00 照片）；r2y4a_events.js:257 PHOTO(ev_sf_photo21,…,sf_photo_postbox)（6767db8f）'),
    dict(k='us_farmers_market', kind='outing', ev='ev_sis_qixi', when='2028-08-26', load_h=8.6, zone='us_apartment', match='七夕',
         q=dict(id='sisqx_2028', ev='ev_sis_qixi', h=9, late=0.25, place='她宿舍門口', title='七夕（週六市集）', travel='走路 約 5 分鐘', travelH=1 / 12, alarm=True),
         flags=dict(USS), src='src/sis_qixi3d.js:93 usAsked 的 plan sisqx_2028（8/25 晚上當面那一句）；sis_qixi_events.js:57 label y28（6767db8f 換成自己的圖；原本借 us_chapel_steps）'),
    dict(k='us_chapel_steps_snow', kind='outing', ev='ev_us_first_snow', when='2028-12-02', load_h=19.8, zone='us_apartment', match='初雪', hookcheck=True,
         q=dict(id='us_snow', ev='ev_us_first_snow', h=20, late=0.25, place='小教堂前的台階', title='初雪', travel='', travelH=0, back='回到公寓。'),
         flags=dict(USS), src='src/r2y4a3d.js:178 OUT.plan us_snow；6767db8f 只先登記（12/2 照舊 us_chapel_snow）、366ac3e2 才接到 ev_us_first_snow／ev_us_snow_repair'),
]
for _c in CASES7: _c['batch'] = 7

# ---------------------------------------------------------------- 第八批 10 張（296ed2d0a；BB_132 第 105 組）；load_h＝約好的時間－車程－15 分鐘再加一點（同上）
CASES8 = [
    dict(k='sis_new_home', kind='outing', ev='ev_sis16_box', when='2029-01-20', load_h=13.27, zone='dorm', match='箱子', also=['ev_sis14_curry_home', 'ev_sis13_curry'],
         q=dict(id='sisb16_box', ev='ev_sis16_box', h=14, late=0.5, place='學姊的新家', title='學姊家（美國寄回來的箱子）', travel='捷運 約 30 分鐘', travelH=0.5, hours=2, alarm=True),
         flags={'met_sis': True},
         src='src/sis_b16_3d.js:65 SISB16.BOX_OUT（1/19 21:00 私訊回「好。」→ 1/20（六）14:00；plan 加 alarm）；同一張圖也接在 ev_sis14_curry_home（12/31 12:00，要 h5「好吃嗎？」＋12/30 私訊）、'
             'ev_sis13_curry——只讀確認（也是 also）。沒有交往的最小存檔（同 gym_pool）：S.boxOk 不成立＝不傳 1/19 那則、不動存檔裡的出遊'),
    dict(k='wenzhou', kind='outing', ev='ev_kexin_our_day_wk', when=['Y1S2', 5, 6], load_h=13.6, zone='dorm', match='溫州街',
         q=dict(id='kx_od_{d}', ev='ev_kexin_our_day_wk', h=14, place='溫州街', title='我們的日子：溫州街', travel='走過去約 10 分鐘', travelH=1 / 6, odPlace='wenzhou'),
         flags={},
         src='src/story3d.js:2172 大一下「我們的日子」固定格的 OUT.plan（約在中間＝公館、溫州街、河濱輪流，P[0]＝odPlace wenzhou；週六 14:00）→ events.js:2117 beforeOuting 記 _kxODP → 2123 {scene:溫州街,bg:wenzhou}'
             '（大二以後 src/kxod3d.js:80 同一行）。最小存檔沒有 KX_OUR_DAY、dating_kexin false：story3d／kxod3d 的固定格規則不跑、不會把這一格改 skipped；台詞不驗'),
    dict(k='wenzhou_park', kind='outing', ev='ev_sq18_park', when=['Y2S2', 5, 7], load_h=8.1, zone='dorm', match='小公園',
         q=dict(id='sq18_park_{d}', ev='ev_sq18_park', h=8.5, late=0.5, place='溫州街・小公園', title='週日早上：二十杯飲料送到小公園', travel='走路 約 10 分鐘', travelH=1 / 6),
         flags={}, src='src/sideq3d.js:288 SQ18 accept 的 OUT.plan（大二下起清葉茶行接單 → 下個週日 08:30）；sideq3d.js:550 {scene:溫州街・小公園,bg:wenzhou_park}（296ed2d0a 由 wenzhou 換成 wenzhou_park）。'
             '支線紀錄 G.sideq 沒放：after 不推進 SQ18，只看畫面'),
    dict(k='ntu_library_2f', kind='outing', ev='ev_zq_testbuild', when='2028-03-08', load_h=11.77, zone='dorm', match='測試版',
         q=dict(id='zqtb_lib', ev='ev_zq_testbuild', h=12 + 10 / 60, late=0.5, place='總圖二樓', title='總圖二樓：子晴的測試版', travel='走路 約 10 分鐘', travelH=1 / 6, alarm=True, back='回到總圖一樓。'),
         flags={'ZQ_TB_GO': True},
         src='src/zq_testbuild3d.js:37 ZQTB.phone 的 OUT.plan（3/7 21:00 子晴私訊、兩個回覆都排 3/8 12:10）；最小存檔沒有 zqtb_ask 那則＝ZQTB.phone 在「!sent(zqtb_ask)」就 return，不動出遊'),
    dict(k='putong_empty', kind='outing', ev='ev_pool_lq_teach', when=['Y1S2', 12, 4], load_h=18.55, zone='dorm', match='試教',
         q=dict(id='pool_lq_teach_{d}', ev='ev_pool_lq_teach', h=19, late=0.5, place='普通教學館', title='詹立群：試教（普通教學館的空教室 19:00）', travel='走過去約 10 分鐘', travelH=0.25),
         flags={}, src='src/pool_more3d.js:256 POOL_MORE.acceptLq（大一下第 11～13 週答應 → 那週週四 19:00；planOut 預設 late 0.5、走過去約 10 分鐘）；台詞 pool_story_b2.js:107 teach'),
    dict(k='law_courtyard', kind='lines', ev='cc_bg8_copier', who='pool_20', key='copier', when=['Y1S2', 13, 6], load_h=12.1, zone='dorm', match='',
         q=None, flags={},
         why='5-3 馬佳蓉搬影印機不是出遊、也不是 STORY_EVENTS 裡的事件：大一下第 12～15 週、法服值班的週六 12:00 以後在萬才館 3D 跟她說話（有點熟、STORY.fafuDuty、P.canOpen）→ P.offer 答應 → '
             'P.run＝EVENTS.runLines(POOL.LINES.pool_20.copier)。要走到 3D 的 NPC 面前說話＋法服社員＋值班日＋熟悉度，探針的存檔做不到；改成 void EVENTS.run(暫時事件 {participants:[pool_20],background:dark,dialogue:同一段台詞})'
             '（暫時事件沒有標題＝不出標題字幕、不寫日誌；G.events.done 多一筆 cc_bg8_copier，只在這個新瀏覽器裡）。真實流程是在 3D 對話裡接（ADV 可能已經開著、立繪照當時），所以開頭的樣子不一定和真的一樣',
         src='src/pool_more3d.js:286 FLOW[pool_20] 第三步（5-3）accept → P.run(GM2,M,L[M].copier)；台詞 pool_story_b2.js:173 copier 的 {scene:法學院前庭,bg:law_courtyard}'),
    dict(k='boya_201', kind='outing', ev='ev_pool_ysh_debate', when=['Y1S2', 10, 6], load_h=13.55, zone='dorm', match='社內賽',
         q=dict(id='pool_ysh_debate_{d}', ev='ev_pool_ysh_debate', h=14, late=0.5, place='博思 201', title='楊書豪：社內賽（博思 201 14:00）', travel='走過去約 10 分鐘', travelH=0.25),
         flags={}, src='src/pool_more3d.js:309 POOL_MORE.acceptYsh（大一下第 8～12 週椰林大道答應 → 下個週六 14:00）；台詞 pool_story_b3.js:82 debate'),
    dict(k='linze_201', kind='outing', ev='ev_yule_lecture', when='2027-10-20', load_h=18.45, zone='dorm', match='演講',
         q=dict(id='yl_lecture', ev='ev_yule_lecture', h=18 + 50 / 60, late=0.5, place='法律系館A 201', title='家事調查官的演講（法律系館A 201）', travel='走過去約 10 分鐘', travelH=1 / 6, alarm=True),
         flags={'YL_LEC': 'listen'},
         info='linze_201 另外是 3D 教室 classroom 的 view（src/zones3d.js:1398 room 的 view:linze_201）——那是 3D 區域的參數，不是 ADV 底圖，這裡不拍',
         src='src/yule3d.js:83 S.OUTS.listen（10/14 22:00 舊序章的人私訊回①「去聽」→ 10/20 18:50）；yule_lines.js:62 {scene:法律系館A 201,bg:linze_201}（第二段換 noodle_table，第一句就拍）。'
             '最小存檔沒有 yl_lec_ask 那則：S.lecture 在 10/20 讀到＝記 x:late 就 return，不動存檔裡的出遊'),
    dict(k='boya_lecture_hall', kind='outing', ev='ev_kexin_lecture_ntu', when='2027-09-29', load_h=18.65, zone='dorm', match='講座',
         q=dict(id='y3_k11', ev='ev_kexin_lecture_ntu', h=19, late=0.25, place='博思教學館', title='講座（博思）19:00', travel='走過去約 8 分鐘', travelH=8 / 60, alarm=True),
         flags={'KX_K11_GO': True},
         src='src/r2y3a3d.js:157 k11Phone 的 y3_k11（交往中，9/27 21:00 可昕私訊回「一起去。」→ 9/29（三）19:00）；r2y3a_events.js:213 {scene:博思教學館,bg:boya_lecture_hall}（296ed2d0a 由 linze_auditorium 換）。'
             '最小存檔 dating_kexin false（同 kh_hotel_front）：k11Phone 一開頭就 return，不動出遊；交往版的句子不驗'),
    dict(k='ra_lab', kind='outing', ev='ev_pg_sis_bday', when='2029-06-02', load_h=20.1, zone='dorm', match='生日', done=['ev_grad_family'],
         q=dict(id='pg_sis_bday', ev='ev_pg_sis_bday', h=20.5, late=0.5, place='法律系館A・研究室', title='學姊的生日：研究室，八點半', travel='走過去約 10 分鐘', travelH=1 / 6),
         flags={'met_sis': True, 'GRADUATED': ('REL', 0), 'GRAD_DONE': True, 'PG': {'done': {'grad': True}}},
         info='ra_lab 另外：src/lab5f3d.js:84 法學院五樓研究室走進去（S.staged）時 OUT.bg(ra_lab) 改成 blur——3D 畫面，不是 ADV 底圖，這裡不拍；畢業傍晚「和學姊吃飯→走回研究室」（STEPS bday_walk）是同一個 bdayScene，不另拍',
         src='src/postgrad3d.js:182 S.planBday（畢業典禮那天 2029-06-02 20:30）→ ev_pg_sis_bday 的 beforeOuting → S.bdayScene(GM,outing)：ADV.begin({background:OUT.bg(ra_lab)})（postgrad3d.js:293；296ed2d0a 以前借 linze_prof_hall）。'
             '【前置】畢業典禮那一段記成演過（ev_grad_family、F.PG.done.grad、GRADUATED）＝不先演一整段畢業典禮；不是交往＝朋友版'),
]
for _c in CASES8: _c['batch'] = 8
CASES = CASES + CASES6 + CASES7 + CASES8

# ---------------------------------------------------------------- 頁面裡的小工具
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
FALLBACK_JS = r"""(c=>{ const G=GAME.G, notes=[]; if(typeof EVENTS!=='undefined'&&EVENTS.running) notes.push('（注意：別的事件正在演 EVENTS.running='+EVENTS.running+'，EVENTS.run 會直接 return）');
  { const ch=document.getElementById('choices'); if(ch&&!ch.classList.contains('hide')) notes.push('（注意：畫面上的選單還開著［'+[...ch.querySelectorAll('button')].map(b=>(b.textContent||'').trim().slice(0,24)).join('｜')+'］，直接出發會和它疊在一起：之後的截圖可能帶著這個選單，要看圖確認）'); }
  try{
    if(c.kind==='outing'){ const q=typeof OUT!=='undefined'&&OUT.get?OUT.get(G,c.qid):null; if(!q) return notes.concat(['存檔裡找不到出遊 '+c.qid]).join('');
      notes.push('出遊原本 state='+q.state); q.state='planned'; q.ask=null;
      if(typeof JP!=='undefined'&&JP.inJapan&&JP.inJapan(G)&&JP.goOut){ void JP.goOut(GAME,q,false); notes.push('；void JP.goOut(GAME,q,false)'); } else { void OUT.go(GAME,q); notes.push('；void OUT.go(GAME,q)'); } }
    else if(c.kind==='self'){ const ev=STORY_EVENTS.find(e=>e.id===c.ev); if(ev){ void EVENTS.run(ev); notes.push('void EVENTS.run('+c.ev+')（背景照事件自己的 background／第一句 bg）'); } else notes.push('找不到 '+c.ev); }
    else if(c.kind==='jpstop'){ const s=typeof JP!=='undefined'&&JP.SCH?JP.SCH.find(x=>x.k===c.stop):null;
      if(s){ void JP.playStop(GAME,s,'jp'); notes.push('void JP.playStop(GAME,'+c.stop+',jp)'); } else { const ev=STORY_EVENTS.find(e=>e.id===c.ev); if(ev){ void EVENTS.run(ev); notes.push('void EVENTS.run('+c.ev+')'); } else notes.push('找不到 '+c.ev); } }
  }catch(e){ notes.push('例外 '+e.message); }
  return notes.join(''); })"""
DIRECT_JS = r"""(a=>{ const G=GAME.G, notes=[]; if(typeof EVENTS!=='undefined'&&EVENTS.running) notes.push('（注意：別的事件正在演 EVENTS.running='+EVENTS.running+'，EVENTS.run 會直接 return）');
  { const ch=document.getElementById('choices'); if(ch&&!ch.classList.contains('hide')) notes.push('（注意：畫面上的選單還開著，之後的截圖可能帶著它）'); }
  if(a.day!=null){ G.day=a.day; G.hour=a.h; if(GAME.syncWeekday) GAME.syncWeekday(); if(GAME.updateHUD) GAME.updateHUD(); notes.push('日期時間改成 '+a.key+' '+a.h); }
  if(a.flags){ G.flags=G.flags||{}; Object.assign(G.flags,a.flags); notes.push('旗標 '+JSON.stringify(a.flags)); }
  const ev=typeof STORY_EVENTS!=='undefined'?STORY_EVENTS.find(e=>e.id===a.ev):null; if(!ev) return notes.concat(['找不到 '+a.ev]).join('；');
  try{ void EVENTS.run(ev); notes.push('void EVENTS.run('+a.ev+')'); }catch(e){ notes.push('例外 '+e.message); } return notes.join('；'); })"""
ALSO_JS = r"""(a=>{ const out={}; for(const id of a.ids){ const e=typeof STORY_EVENTS!=='undefined'?STORY_EVENTS.find(x=>x.id===id):null; if(!e){ out[id]={hit:false,bgs:['找不到事件']}; continue; }
    const bgs=[]; let b0=null; try{ b0=e.background; }catch(err){ b0='（background 讀取例外）'; } if(b0!=null) bgs.push('background:'+(typeof b0==='string'?b0:JSON.stringify(b0)));
    for(const l of (Array.isArray(e.dialogue)?e.dialogue:[])) if(l&&l.bg) bgs.push('bg:'+(typeof l.bg==='string'?l.bg:JSON.stringify(l.bg)));
    out[id]={hit:bgs.some(s=>s==='background:'+a.k||s==='bg:'+a.k||s.indexOf('/assets/bg/'+a.k+'.webp')>=0),bgs:bgs.slice(0,10)}; }
  return out; })"""
LINES_JS = r"""(a=>{ const notes=[]; if(typeof EVENTS!=='undefined'&&EVENTS.running) notes.push('（注意：別的事件正在演 EVENTS.running='+EVENTS.running+'，EVENTS.run 會直接 return）');
  { const ch=document.getElementById('choices'); if(ch&&!ch.classList.contains('hide')) notes.push('（注意：畫面上的選單還開著，之後的截圖可能帶著它）'); }
  let lines=null; try{ lines=POOL.LINES[a.who][a.key]; }catch(e){ lines=null; }
  if(!Array.isArray(lines)||!lines.length) return notes.concat(['找不到 POOL.LINES.'+a.who+'.'+a.key]).join('');
  const ev={id:a.ev,title:'',participants:[a.who],location:'any',trigger:'manual',background:'dark',dialogue:lines};   /* 同 POOL.run：EVENTS.runLines(lines,{participants:[id]})；沒有標題＝不出標題字幕、不寫日誌 */
  try{ void EVENTS.run(ev); notes.push('void EVENTS.run({id:'+a.ev+',participants:['+a.who+'],background:dark,dialogue:POOL.LINES.'+a.who+'.'+a.key+'（'+lines.length+' 行）})'); }catch(e){ notes.push('例外 '+e.message); }
  return notes.join(''); })"""
EXITS = ('不用了', '算了', '就這樣', '先不要', '先這樣', '沒事', '離開', '取消')
SUMMARY = {}


def hm(h):
    if h is None: return '--:--'
    m = int(round(float(h) * 60)); return '%02d:%02d' % (m // 60, m % 60)


async def resolve(pg, v, d):
    if isinstance(v, tuple) and v and v[0] == 'DAY': return (await P.day_of(pg, v[1]))['d']
    if isinstance(v, tuple) and v and v[0] == 'REL': return d + v[1]
    return v


async def build_state(pg, c):
    """最小存檔（或使用者存檔）改到那一天、那個時間、那一區；出遊型的把約好的那一趟放進 G.outings。回傳 (存檔, 日期資訊, 出遊)"""
    d = await P.day_of(pg, c['when'])
    if SAVE is not None:
        st = copy.deepcopy(SAVE); st.pop('_stuck', None); st.pop('_busy', None)
        st['invites'] = [v for v in st.get('invites', []) if v.get('state') != 'going']
        st['outings'] = [v for v in (st.get('outings') or []) if isinstance(v, dict) and v.get('state') != 'planned']   # 別的約好的出遊拿掉（不然可能先跳別的「出發」）
        F = st.setdefault('flags', {})
    else:
        st = {'name': '祐廷', 'energy': 100, 'events': {'done': {}, 'last': {}, 'count': 0}, 'contacts': {}, 'outings': []}
        F = st['flags'] = dict(BASEF)
    for k, kk in ROOMS:
        dd = (await P.day_of(pg, kk))['d']
        if dd <= d['d']: F[k] = dd
    for fk, fv in (c.get('flags') or {}).items(): F[fk] = await resolve(pg, fv, d['d'])
    if c.get('done'):   # 【前置】劇情串前面的幾件記成演過（G.events.done＝次數）
        E = st.setdefault('events', {'done': {}, 'last': {}, 'count': 0}); E.setdefault('done', {}); E.setdefault('last', {})
        for eid in c['done']: E['done'][eid] = 1; E['last'][eid] = d['d']
    st.update(day=d['d'], weekday=d['wd'], hour=c['load_h'], zone=c['zone'], pos=None, weather='clear', stage='law')
    st['money'] = max(st.get('money') or 0, 30000)
    v = st.get('visited') if isinstance(st.get('visited'), dict) else {}
    for z in VISITED: v.setdefault(z, True)
    st['visited'] = v
    q = None
    if c.get('q'):
        q = copy.deepcopy(c['q']); q['id'] = q['id'].format(d=d['d']); q['day'] = d['d']; q.setdefault('state', 'planned'); q.setdefault('ask', None)
        st['outings'] = [x for x in st.get('outings', []) if x.get('id') != q['id']] + [q]
    return st, d, q


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


async def trigger(pg, cdp, run, c, q):
    """等事件自己開演：出遊＝遊戲跳出「出發：……」→ 點；日本停點＝據點自己演。PROMPT_S 秒內沒有＝【捷徑】直接出發。回傳 (怎麼開演的, STARTED 紀錄)"""
    cinfo = {'qid': q and q['id'], 'ev': c['ev'], 'stop': c.get('stop'), 'kind': c['kind']}
    t0 = time.time(); menus = []; tapped = False; lines = []
    while time.time() - t0 < PROMPT_S:
        st = await pg.evaluate(STARTED_JS, cinfo)
        if st: return ('prompt' if tapped else 'self'), st, menus, lines
        s = await ts(pg)
        if s['phone'] and not s['ch'] and not s['dlg']: await L.phone_away(pg, cdp); continue
        if s['ch']:
            opts = [o['t'] for o in s['ch']]
            kk = next((i for i, o in enumerate(s['ch']) if not o['dim'] and o['t'].startswith('出發') and c['match'] and c['match'] in o['t']), None) if c['kind'] == 'outing' else None   # jpstop（日本報到）等它自己演，不點別的「出發」
            if kk is not None and not tapped:
                run.note('%s：遊戲自己跳出選單 %s → 點「%s」（像玩家）' % (c['k'], J(opts), opts[kk]))
                await P.tap_choice(pg, cdp, kk); tapped = True; await pg.wait_for_timeout(1500); continue
            if opts not in menus: menus.append(opts); run.note('%s：畫面上有別的選單（不點，等）：%s' % (c['k'], J(opts)))
        elif s['dlg'] and s['txt']:
            if not lines or lines[-1] != [s['name'], s['txt']]: lines.append([s['name'], s['txt']])
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(650); continue   # 別的對話：照玩家點過去
        await pg.wait_for_timeout(1000)
    s = await ts(pg)
    if s['ch']:
        kk = next((i for i, o in enumerate(s['ch']) if not o['dim'] and o['t'].startswith(EXITS)), None)
        if kk is not None:
            run.setup('【捷徑】的前一步：畫面上的選單 %s 先點「%s」關掉' % (J([o['t'] for o in s['ch']]), s['ch'][kk]['t']))
            await P.tap_choice(pg, cdp, kk); await pg.wait_for_timeout(1500)
    r = await pg.evaluate(FALLBACK_JS, cinfo)
    run.setup('【捷徑】%s：%d 秒內沒有自己開演（%s；遊戲時間 %s）→ %s' % (c['k'], PROMPT_S, '點過「出發」' if tapped else '沒看到「出發」', J(await P.clock(pg)), r))
    await pg.wait_for_timeout(2500)
    return 'fallback', await pg.evaluate(STARTED_JS, cinfo), menus, lines


async def wait_scene(pg, cdp, run, c):
    """開演以後等到底圖換成那一張、第一句打完字（或出選項）。之前的對話（例：台中車站接人）照玩家點過去。回傳 (到了沒, ts, bgnow, 之前點過的句子)"""
    t0 = time.time(); last = None; same = 0; pre = []; s = None; g = None
    while time.time() - t0 < max(SCENE_S, c.get('scene_s') or 0):
        g = await pg.evaluate(BGNOW_JS, c['k']); s = await ts(pg)
        if g['target']:
            if s['ch']: return True, s, g, pre
            if s['dlg'] and s['txt']:
                same = same + 1 if s['txt'] == last else 1
                if line_done(s, last, same): return True, s, g, pre   # 打完字才拍（打到一半的話，對話框高度、截圖都不是那一句真正的樣子）
                last = s['txt']
            await pg.wait_for_timeout(600); continue
        if s['ch']:
            k2, _ = P.pick_of(s['ch'], c.get('picks', ()), decline=False)
            pre.append(['［選項］', J([o['t'] for o in s['ch']]) + ' → ' + s['ch'][k2]['t']]); await P.tap_choice(pg, cdp, k2); await pg.wait_for_timeout(1000); continue
        if s['dlg'] and s['txt']:
            if not pre or pre[-1] != [s['name'], s['txt']]: pre.append([s['name'], s['txt']])
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(700); continue
        if s['phone']: await L.phone_away(pg, cdp); continue
        await pg.wait_for_timeout(700)
    return False, s, g, pre


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


async def shoot_set(pg, run, c, o, tag, rec, bgonly=True):
    """這一個方向：量 → 截圖（對話框開著）→（bgonly）暫時只留底圖拍一張、加虛線框再拍一張 → 還原 → 畫 cropmap"""
    k = c['k']
    await set_orient(pg, run, o)
    m = await pg.evaluate(MEASURE_JS, k)
    await pg.wait_for_timeout(300)
    out = {'measure': m, 'dlg': await run.shot(pg, '%s_%s_%s_dlg' % (k, o, tag))}
    if bgonly:
        run.setup('【捷徑：只為比較】%s［%s］只有底圖的兩張：暫時把對話框、選項、字幕、立繪、HUD、紀錄／略過鍵設成透明（遊戲沒有關掉對話框的按鈕），拍完馬上還原；不是玩家看得到的畫面' % (k, ONAME[o]))
        try:
            await pg.evaluate(HIDE_JS + '(true)'); await pg.wait_for_timeout(400)
            out['bgonly'] = await run.shot(pg, '%s_%s_%s_bgonly' % (k, o, tag))
            await pg.evaluate(OUTLINE_JS, (m or {}).get('boxes') or []); await pg.wait_for_timeout(250)
            out['bgbox'] = await run.shot(pg, '%s_%s_%s_bgbox' % (k, o, tag))
        finally:
            await pg.evaluate(OUTLINE_JS, None); await pg.evaluate(HIDE_JS + '(false)'); await pg.wait_for_timeout(250)
    if m and m.get('cover'): out['cropmap'] = crop_map(k, m, os.path.join(OUT, '%s_%s_%s_cropmap.png' % (k, o, tag)))
    run.note('%s［%s・%s］%s' % (k, ONAME[o], tag, describe(m)))
    rec.setdefault('shots', {}).setdefault(tag, {})[o] = out
    return out


def exists(p):
    return bool(p) and os.path.exists(p) and os.path.getsize(p) > 0


async def case_run(p, run, c):
    k = c['k']; rec = SUMMARY.setdefault(k, {'ev': c['ev'], 'kind': c['kind'], 'src': c['src'], 'batch': c.get('batch')})
    orients = ['land', 'port'] if ORIENT == 'both' else [ORIENT]
    dr = c.get('direct'); direct_mode = bool(dr) and k in DIRECT
    cs = dict(c, when=dr['when'], load_h=dr['load_h'], flags=dict(c.get('flags') or {}, **(dr.get('flags') or {})), q=None) if direct_mode else c   # 存檔照哪一份
    b, ctx, pg, cdp, errs = await L.launch(p, landscape=(orients[0] == 'land'))
    pg.on('dialog', lambda dd: asyncio.ensure_future(dd.accept()))
    try:
        await pg.goto(URL); loaded = await L.wait_loaded(pg)
        if not loaded: run.note('%s：遊戲沒有在時間內載入完（照樣往下）' % k)
        await pg.evaluate("localStorage.clear()"); await P.init(pg); await pg.evaluate(HOOK)
        if c.get('also'):   # 同一張圖也接在別的事件：只讀 STORY_EVENTS 確認（不演）
            al = await pg.evaluate(ALSO_JS, {'ids': c['also'], 'k': k}); rec['also'] = al
            for eid in c['also']:
                a = (al or {}).get(eid) or {}
                run.check('%s：只讀確認 %s 的背景有設 %s（不演）' % (k, eid, k), bool(a.get('hit')), J(a.get('bgs')))
        if c.get('hookcheck'):   # 先登記的圖：這一版事件有沒有接到（只讀 STORY_EVENTS）；沒接＝INFO，不演、不算 FAIL
            hk = await pg.evaluate(ALSO_JS, {'ids': [c['ev']], 'k': k}); a = (hk or {}).get(c['ev']) or {}; rec['hook'] = a
            if not a.get('hit'):
                rec['info'] = '先登記、還沒接到事件'
                run.note('%s：INFO 這一版 %s 的背景沒有 %s（%s）＝先登記、還沒接到事件（6767db8f 的狀態；366ac3e2 以後才接）→ 不演、不拍' % (k, c['ev'], k, J(a.get('bgs'))))
                return
            run.note('%s：只讀確認 %s 已經接這張圖（%s）→ 照常演' % (k, c['ev'], J(a.get('bgs'))))
        if c.get('info'):   # 同一張圖另外接的地方（3D 區域參數等，不是 ADV 底圖）：只記
            run.note('%s：INFO %s' % (k, c['info']))
        if c.get('phone_photo'):
            run.note('%s：手機照片＝遊戲在 S.leave 裡用 ADV 全畫面底圖＋「📷（…）」顯示（不是手機 App 畫面）；手機相簿沒有這張，不另拍（INFO）' % k)
        st, d, q = await build_state(pg, cs)
        rec.update(day=d, q=q, load_h=cs['load_h'], zone=cs['zone'], direct_mode=direct_mode)
        await L.load_state(pg, st, quiet_events=QUIET, quiet_phone=True); await pg.evaluate(CLEARP)
        run.setup('[前置] %s：%s存檔讀到 %s（%s 第 %s 週，星期%s%s）%s %s%s%s；%s' % (
            k, '使用者' if SAVE is not None else '最小', d['key'], d.get('term'), d.get('week'), '日一二三四五六'[d['wd'] % 7], '，假日' if d.get('hol') else '', hm(cs['load_h']), cs['zone'],
            ('；存檔裡已經約好的出遊 %s（%s %s，%s；照 %s）' % (q['id'], d['key'], hm(q['h']), q['place'], c['src'])) if q else '；' + c['src'],
            ('；旗標 %s' % J(st['flags'] and {fk: st['flags'].get(fk) for fk in (cs.get('flags') or {})})) if cs.get('flags') else '',
            '條件事件、手機自動打開先關（QUIET）' if QUIET else '條件事件照常'))
        if c.get('done'): run.setup('[前置] %s：%s 在存檔裡記成演過（G.events.done）%s' % (k, J(c['done']), '，讓遊戲自己的串（%s）從這一張開始' % c['src'] if c['kind'] == 'self' else '（照 src 的說明）'))
        await pg.wait_for_timeout(2500); await L.phone_away(pg, cdp); await L.close_panels(pg, cdp)
        cinfo = {'qid': None, 'ev': c['ev'], 'stop': None, 'kind': 'direct'}
        if c['kind'] == 'lines':   # 在 3D 對話裡接的台詞（不是出遊、不是 STORY_EVENTS）：一開始就【捷徑】
            r = await pg.evaluate(LINES_JS, {'ev': c['ev'], 'who': c['who'], 'key': c['key']})
            run.setup('【捷徑】%s：%s → %s' % (k, c.get('why', ''), r))
            await pg.wait_for_timeout(2500)
            how, started, menus, lines = 'lines', await pg.evaluate(STARTED_JS, cinfo), [], []
        elif direct_mode:
            r = await pg.evaluate(DIRECT_JS, {'ev': c['ev'], 'day': None, 'h': None, 'key': None, 'flags': None})
            run.setup('【捷徑】%s：DIRECT 指定一開始就直接演（理由：%s）→ %s' % (k, dr.get('why', ''), r))
            await pg.wait_for_timeout(2500)
            how, started, menus, lines = 'direct', await pg.evaluate(STARTED_JS, cinfo), [], []
        else:
            how, started, menus, lines = await trigger(pg, cdp, run, c, q)
        rec.update(how=how, started=started, menus_seen=menus, lines_before=lines)
        ok, s, g, pre = await wait_scene(pg, cdp, run, c)
        if not ok and dr and not direct_mode:   # 真實的一串沒接到那一張：【捷徑】在頁面改日期／旗標，直接演那一件
            dd = await P.day_of(pg, dr['when'])
            r = await pg.evaluate(DIRECT_JS, {'ev': c['ev'], 'day': dd['d'], 'h': dr['load_h'], 'key': dd['key'], 'flags': dr.get('flags')})
            run.setup('【捷徑】%s：真實的一串（%s）%d 秒內沒到那一張底圖（理由：%s；最後的畫面 %s）→ %s' % (
                k, how, max(SCENE_S, c.get('scene_s') or 0), dr.get('why', ''), J({'bg': g and g.get('bg'), 'line': s and [s.get('name'), s.get('txt')]})[:300], r))
            await pg.wait_for_timeout(2500)
            rec['pre_first_try'] = pre; how = 'fallback_direct'
            started = (started or []) + (await pg.evaluate(STARTED_JS, cinfo) or [])
            ok, s, g, pre = await wait_scene(pg, cdp, run, c)
            rec.update(how=how, started=started)
        rec.update(scene_ok=ok, lines_in_event_before_bg=pre, bg_now=g)
        if pre: run.note('%s：到那一張底圖以前點過的：%s' % (k, J(pre)[:1200]))
        how_t = {'prompt': '遊戲自己跳出「出發」→ 點', 'self': '到了時間自己演', 'fallback': '【捷徑】直接出發',
                 'direct': '【捷徑】DIRECT：直接 EVENTS.run', 'fallback_direct': '【捷徑】真實的一串沒接到 → 直接 EVENTS.run',
                 'lines': '【捷徑】3D 對話裡接的台詞 → EVENTS.run 包一個暫時事件演同一段'}.get(how, how)
        run.check('%s：事件演出（%s；%s）' % (k, c['ev'], how_t), bool(started) and ok,
                  J({'started': started, 'bg': g and g.get('bg'), 'adv': g and g.get('cls'), 'line': s and [s.get('name'), s.get('txt')], 'choices': s and s.get('ch')})[:700])
        if not ok:
            await run.shot(pg, '%s_noscene' % k)
            log = await pg.evaluate("(window.__BG5||[]).slice(-40)"); rec['log_tail'] = log
            run.note('%s：沒到那一張底圖。最後的紀錄：%s' % (k, J(log)[:1500]))
            for o in orients: run.check('%s［%s］：背景是 assets/bg/%s.webp' % (k, ONAME[o], k), False, '沒到那一張底圖')
            for o in orients: run.check('%s［%s］：截圖存在（對話框開著／只有底圖）' % (k, ONAME[o]), False, '沒拍')
            return
        first_named = bool(s.get('name'))
        cap = await pg.evaluate(CAP_JS)
        if cap:   # 地點字幕還在（場景開頭 2.4 秒）：先拍一張，再等它收掉
            await shoot_set(pg, run, c, orients[0], 'cap', rec, bgonly=False)
            for _ in range(10):
                if not await pg.evaluate(CAP_JS): break
                await pg.wait_for_timeout(500)
        for o in orients:
            sh = await shoot_set(pg, run, c, o, 'first', rec)
            m = sh['measure'] or {}
            run.check('%s［%s］：背景是 assets/bg/%s.webp' % (k, ONAME[o], k), bool(m.get('target')), J({'file': m.get('file'), 'adv': m.get('advCls'), 'nat': m.get('nat'), 'bgSize': m.get('bgSize'), 'bgPos': m.get('bgPos')}))
            run.check('%s［%s］：截圖存在（對話框開著／只有底圖）' % (k, ONAME[o]), exists(sh.get('dlg')) and exists(sh.get('bgonly')), J([sh.get('dlg'), sh.get('bgonly'), sh.get('bgbox')]))
        if SPK and not first_named and not s.get('ch'):   # 往下點到第一句有人說話（立繪出來）
            if pg.viewport_size != VP[orients[0]]: await set_orient(pg, run, orients[0])
            got = None
            for i in range(SPK_TAPS):
                await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(700)
                s2 = await wait_line(pg); g2 = await pg.evaluate(BGNOW_JS, k)
                if not g2['target']: run.note('%s：往下點第 %d 句，底圖換掉了（%s）——不拍說話那一句' % (k, i + 1, g2.get('bg'))); break
                if not s2['ch'] and not s2['dlg']: run.note('%s：往下點第 %d 句，事件已經演完（沒有對話框、沒有選項）——不拍說話那一句' % (k, i + 1)); break
                if s2['ch'] or (s2['dlg'] and s2['name']): got = s2; break
            if got:
                run.note('%s：往下點到 %s' % (k, J(got.get('ch') or [got.get('name'), got.get('txt')])[:300]))
                for o in orients: await shoot_set(pg, run, c, o, 'spk', rec, bgonly=False)
            else: run.note('%s：%d 句內沒有人說話（或底圖換掉）——沒拍說話那一句' % (k, SPK_TAPS))
    finally:
        rec['pageerrors'] = errs[:5]
        if errs: run.note('%s：頁面 JS 例外（只記）%s' % (k, J(errs[:3])))
        try: await asyncio.wait_for(b.close(), 30)
        except Exception: pass


async def main():
    run = L.Run('bg5', OUT); os.makedirs(OUT, exist_ok=True)
    cases = [c for c in CASES if (not BATCH or c['batch'] in BATCH) and (not ONLY or c['k'] in ONLY)]
    if ORIENT not in ('both', 'land', 'port'): run.check('ORIENT 認得', False, ORIENT); sys.exit(run.finish())
    known = {c['k'] for c in CASES}
    for x in [x for x in ONLY + DIRECT if x not in known]: run.check('IDS／ONLY／DIRECT 認得 %s' % x, False, '沒有這一張；認得的：%s' % ','.join(c['k'] for c in CASES))
    if not cases: run.check('BATCH／IDS 選到至少一張', False, J({'BATCH': BATCH, 'IDS': ONLY})); sys.exit(run.finish())
    print('==== cc_bg5_probe（SHA %s；%d 張［%s］；BATCH=%s；ORIENT=%s；QUIET=%s；DIRECT=%s）====' % (
        os.environ.get('SHA', '?'), len(cases), ','.join(c['k'] for c in cases), BATCH or '全部', ORIENT, QUIET, DIRECT or '無'), flush=True)
    async with async_playwright() as p:
        for c in cases:
            print('---- 第%s批 %s（%s）----' % (c['batch'], c['k'], c['ev']), flush=True)
            cmax = max(CASE_MAX, c.get('case_max') or 0)
            try:
                await asyncio.wait_for(case_run(p, run, c), cmax)
            except asyncio.TimeoutError:
                run.check('%s：事件演出（%s）' % (c['k'], c['ev']), False, '超過 CASE_MAX %d 秒' % cmax)
            except Exception as e:
                run.check('%s：跑完（沒有探針例外）' % c['k'], False, repr(e)[:500]); traceback.print_exc()
            try:
                with open(os.path.join(OUT, 'cc_bg5_measure.json'), 'w', encoding='utf-8') as f: json.dump({'sha': os.environ.get('SHA', '?'), 'url': URL, 'orient': ORIENT, 'cases': SUMMARY}, f, ensure_ascii=False, indent=1)
            except Exception as e: print('measure.json 寫不出來', e, flush=True)
    print('SHA', os.environ.get('SHA', '?'), '量測：', os.path.join(OUT, 'cc_bg5_measure.json'), flush=True)
    print('（check 只看：事件演出、背景是那張圖、截圖存在。裁切、遮擋好不好看＝人看截圖判斷；ALL PASS 不代表畫面合格。退回【捷徑】的那幾張也要看上面的［前置／捷徑］紀錄）', flush=True)
    sys.exit(run.finish())

if __name__ == '__main__':
    asyncio.run(main())
