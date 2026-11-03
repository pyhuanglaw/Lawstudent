# BB_245 的回覆（LAWWW，2026-11-02 20:2x）

BB 19:50 要求：D 類 45 項「怎麼驗」、119 項「可能已被取代」確認、C 類照 D128 重分。LAWWW 派唯讀子代理逐項核對；以 int/m590（3a68aa5fb）的 src、tests 為準；BB_245 用企劃線 ec9652497。

**已經改進 tasks.json 的**：確定被取代的 92 項＋D14-T1（→ DL-02）＋LAD-K0LX2-CUT-1018（K0-Lx2 已不在 ladder.js）改「取消／被取代」（reason、replacedBy）；ART-CG-ECONCAMP 改已驗收（BB-B d073885f ART_APPROVED）；FIT-3D-BODY-1027 的 next 照 D128 改（主角身形由 LAWWW 定案）。

判定代號：(a) 已有測試；(b) 要新的 Node 探針（寫明驗什麼）；(c) 要瀏覽器流程；(d) 已被取代或取消。

## 一、D 類 45 項＋ZQLINE、AA298、AA306＋DONE-B02～B16

| ID | 判定 | 怎麼驗 |
|---|---|---|
| AA298-RETAKE-FIX-1018 | (a) | econ_ff2 ③⑦⑧、v0_home_ff 第 8 段、v0_retake_r 第 6、9 項、v0_e34、home_unit 第 4、11 項、v0_e36 第 3 項、lifeline_g6 6-4／6-6；「考場是高中教室」沒有專門檢查（要補一項）；瀏覽器 flow_v0_home.py |
| AA306-KX-LADDER-1018 | (b) | 探針比對 LADDER.byTerm.Y0S1／Y0S2 每人層數和 AA_306 定稿（現在 Y0S1 可昕 12、品妤 6、唐睿 4、阿勳 6、韋綸 7；Y0S2 可昕 4、品妤 4、唐睿 2、阿勳 1、韋綸 1）；韋綸大一下總表寫 5 層、現在 1 層→問 AA |
| ZQLINE-PATHTOP-1102 | (a) | zqline_path_unit 第 1～4 項；acceptance 另有 CC n4 瀏覽器重跑 |
| AA358-KNOW-FIX-1021 | (a) | aa358_unit 2-1、2-2；lifeline_g1「AA_358 2-3」；v1_batch6「2-4」；v3_batch1 第 4 項；ab65_3_y2s1 第 2 項（階梯 4 句沒逐句測） |
| AUTO-RESUME-HOURLY-1102 | 不是遊戲功能 | list_triggers 看五個工作階段各一個每小時排程；建議移出「已整合待測試」 |
| BUG-05 | (b)＋角色 | 探針：ASSETS.manifest['char.classmate_peishan']＝bl_classmate_peishan.vrm；撞不撞路人紅衣由 LAWWW 看截圖（D128） |
| BUG-NYE-ORIGIN-1018 | (a)＋(c) | home_backdrop 第 7、8 項；瀏覽器看跨年回家、高雄回來接陪可昕辦休學兩段不露醉月湖 |
| BUG-SWING-SEAT | (b)＋(c) | 探針：GLB 座板節點和 wz_park_layout 座位差 <0.1 m；瀏覽器 20:00 後盪鞦韆截圖 |
| D14-T2 | (a) | exam_every_term、examday、exam_slots；flow_exam_terms.py；「強制進考場」沒有測試；D118 可能改，等定案 |
| DONE-B02 | (a)＋(c) | classmate_class、invite_whynot、bike；flow_playtest_fixes.py（「26 項」逐項清單總表沒列） |
| DONE-B03 | (a) | classes_unit「AA_137 遲到」＋indoor_crowd；「陸續進來」以 CROWD-CLASS-ARRIVE-1027 為準 |
| DONE-B04 | (a) | v1_batch2、v1_batch4；法服後來大改（讀書會 retired），F1、F2 還有效嗎要 AA 看 |
| DONE-B06 | (a) | class_ask 第 6 項；D118 讀書系統可能換掉，等定案 |
| DONE-B07 | (b) | 探針：選單沒有「人物」「地圖」；手機「朋友」每人有「資料」；「地點」最上面有「打開整張地圖」 |
| DONE-B08 | (c) | flow_lib_tour.py |
| DONE-B10 | (a) | ladder_unit |
| DONE-B11 | (a) | v2_c9＋bg_images（nccu_gate、nccu_food） |
| DONE-B12 | (c) | flow_skybridge.py；門以 SKYBRIDGE-DOOR-1020 為準 |
| DONE-B13 | (a) | bike_seat 第 2、3 項＋bike_unit passenger |
| DONE-B14 | (a) | kai_dorm_unit（K-D1～6） |
| DONE-B16 | (a)＋(c) | home_unit；AA_172 第 3 節旁白數值和瀏覽器實玩 |
| EVPKG-R2Y4-1020 | (a) | r2y4a_events、r2y4b_events；瀏覽器 BB_R2Y4_1021 |
| FIX-STAIRS-ARM | (c)／(b) | 瀏覽器：和沛珊上樓梯鏡頭切過去那一格沒有 T 字手臂；探針：鏡頭外 16 m 內的人骨架每格更新 |
| NOT-QUESTION-DEL-1102 | (a)＋(b) | aa296_phone_live ②、r2y3b Q15-Q2、v1_batch3 Q2、v2_bb96_q5；建議加全文掃描探針（src 字串裡三種句型 0 筆） |
| Q-E36-CALL-1018 | (a) | v0_e36 第 3 項、lifeline_g6 6-6、lifeline_g1 1-6 |
| V2-G07 | (a) | v2_c15（B4_ATTENDED）；BB-B n19 瀏覽器已 PASS；可以結案 |
| V2-L2 | (a) | ladder_y1s2_y2s1；run13 已跑過 |
| Y2Y4-STORY-1020 | (d) | 已改取消／被取代（EVPKG） |
| AA479-US-FIX-1027 | (a) | aa388_sis_qixi、us_life、aa370_us、aa453_us |
| BUG-BENCH-OCC-1018 | (b) | 探針：校園長椅讀書的路人帶 seat、玩家不會被分到那個位子（修正在 story3d.js seat:st） |
| D14-T13 | (d) | ＝V6-S1b＋V6-X2；aa422_multirel、knows_gf |
| LAD-K0LX2-CUT-1018 | (d) | 已改取消／被取代 |
| RUN-SPEED-1020 | (b)＋(c) | 探針鎖 E.SPD.run＝6.2；p0_movement、movement_regression 看滑步 |
| SIS-B12-1025 | (a) | aa470_sis_b12、aa490、aa492 |
| V1-MEM | (b) | 9 條記憶名稱（dfeb14a4e）沒有逐字測；之後多個任務改過 MEMORY_LABEL，先確認現行字 |
| V3-L1 | (a) | ladder_y1s2_y2s1（A3-L、A4-L） |
| V5-B06、B14、B15、B16、F08、F12、F19、F24、K22、K25、K26、K27 | (d) | 已改取消／被取代（EVPKG）；測試：graduation、aa331_postgrad、aa366_kx_postgrad、epilogue、r2y4a、r2y4b、y34b_events |
| BUG-WIND-1018 | (b) | 探針：室內和其他區域「坐一下」多次都不出椰影大道那一句 |
| D14-T1 | (d) | 已改取消／被取代（DL-02） |
| TERM-READ-Y3S2-1025 | (a) | aa463_y3s2 |

## 二、「可能已被取代」119 項（確定 92 已改總表、其實沒有 26、無法判斷 1）

## 確定被取代
ROM-1017-L｜確定被取代 → BB203-CONFESS-1017｜AA_215 的「第 6 階＋4 次約會」條件已被 BB_203 的條件（戀愛≥30＋4 次含心願＋願意）取代，實作在 src/termend3d.js:5、56-70；拿掉 storyGate 已做（V6-X3 也標取消／被取代）
Y2Y4-STORY-1020｜確定被取代 → EVPKG-1A01～1A20、1B01～25、1C01～06、R2Y2、R2Y3、R2Y4、R3（都在總表、已整合待測試）｜總項；LAWWW-B 11-01 22:4x 子代理核對 AA_314 第 1 輪 52 件都找得到實作；第 2、3 輪範圍沒逐件核
AA313-S4-1020｜確定被取代 → AA313-S4S5-REST-1023｜做了的部分在 4d2d3d40e（aa313_s4s5_unit），跳過的項目明文移到 AA313-S4S5-REST-1023（已整合待測試）
AA313-S5-1020｜確定被取代 → AA313-S4S5-REST-1023｜做了的部分在 f3133da44、a4ab0421a，跳過的移到 AA313-S4S5-REST-1023；5-1 第 15 點移 AA389-REST-L-1023
DATE-C6｜確定被取代 → BB203-CONFESS-1017｜告白條件 DATE.canConfess（src/date3d.js）＋只在學期末心意邀約（src/termend3d.js）；termend_unit、confess_unit
DATE-S7｜確定被取代 → V6-X2｜partnerBlock＝她有伴侶或她知道祐廷有伴侶才擋（src/date3d.js ROM.knows／partner）；knows_gf_unit；懷疑值依 BB_191 §1 取消
V0-SK｜確定被取代 → V2-SK06、V2-SK07、V3-SK08（已驗收）、V3-SK09、V3-SK10、V5-SK14｜明文拆出；SK01～SK05 事件在 src/data/events.js（ev_sk01_soc／_wave、ev_sk02_jacket、ev_sk03_lunch、ev_sk04_note1～3、ev_sk05_vending_y1）
V3-B09｜確定被取代 → SIS-GRADSCHOOL-1017｜ev_sis_graduation 在 src/sis_grad3d.js（學姊畢業移到大一下）；重訪日 2 取消（AA_249）
V3-B11｜確定被取代 → EVPKG-1B01-07-1020｜1B-05 ev_ziqing_dad_visit src/data/y2b_events.js:84（BCG-02 已登錄）；沒碰到的訊息 src/y2b3d.js:46（事件定義在 wt_m590 src、沒有 retired／off）
V3-B12｜確定被取代 → EVPKG-R2Y2-1020｜2-Y2-19 ev_ziqing_show2 src/y2r2_3d.js:424（事件定義在 wt_m590 src、沒有 retired／off）
V3-B19｜確定被取代 → EVPKG-R2Y2-1020｜2-Y2-17 ev_zhiruo_concert src/y2r2_3d.js:349、ev_zhiruo_admitted :363（＋ev_zhiruo_admit_call）（事件定義在 wt_m590 src、沒有 retired／off）
V3-B20｜確定被取代 → EVPKG-1B01-07-1020｜1B-06 ev_zhiruo_last_shift src/data/y2b_events.js:114（TICKET_STUB；BCG-15 已登錄）（事件定義在 wt_m590 src、沒有 retired／off）
V3-B21｜確定被取代 → EVPKG-R2Y3-1020｜2-Y3-02 ev_fangyt_mountain src/data/r2y3a_events.js:95（7/24；拒絕或不回 8/21 再約）（事件定義在 wt_m590 src、沒有 retired／off）
V3-B23｜確定被取代 → EVPKG-R2Y2-1020、1B01-07｜BB_97 第 9 節各場都在：K9 ev_kexin_good_class src/y2r2_3d.js:57、K10 互相出題 :87、K10c ev_kexin_bad_exam src/data/y2b_events.js:26、生日 ev_kexin_birthday_y2 y2r2_3d（事件定義在 wt_m590 src、沒有 retired／off）
V3-D15｜確定被取代 → EVPKG-R2Y2-1020（已整合待測試｜2-Y2-13 F-哲3 押金 ev_zhe_deposit src/y2r2_3d.js:316；翰 3 分數表 ev_bohan_scores src/data/events.js:3230（事件定義在 wt_m590 src、沒有 retired／off）
V3-D17｜確定被取代 → EVPKG-1B01-07-1020｜1B-02：ev_yt_lease_text src/data/y2b_events.js:44＋債各第 6 週課堂段 src/y2b3d.js:88（CLS.IN_CLASS）（事件定義在 wt_m590 src、沒有 retired／off）
V3-D18｜確定被取代 → EVPKG-1C01-06-1020｜1C-01 春假大二版三選一 src/group3d.js:39（SPRING_Y2）、ev_spring_y2_noodle src/data/group_events.js:23、和可昕 ev_kexin_trip_spring_y2 :44（事件定義在 wt_m590 src、沒有 retired／off）
V3-D19｜確定被取代 → EVPKG-R2Y2-1020、EVPKG-1B01-07-1020｜G1 大二下 ev_midterm_walkout_y2s2 src/y2r2_3d.js:338（2-Y2-14）；以安新 12 ev_an_mother_map src/data/y2b_events.js:68（1B-04，AN_MAP）（事件定義在 wt_m590 src、沒有 retired／off）
V3-D20｜確定被取代 → EVPKG-1B01-07-1020｜1B-03：5/22 法服值班包住 STORY.fafuShift src/y2b3d.js:96；不在場轉述 ev_yt_aunt_retell src/data/y2b_events.js:58；記 RENT_CONSULTATION（事件定義在 wt_m590 src、沒有 retired／off）
V3-D21｜確定被取代 → EVPKG-R2Y2-1020｜系籃大二下 5/29 src/y2r2_3d.js:279（ev_zhe_game_y2s2 :280，2-Y2-20）；語彤事件 11 ev_yt_help_dishes src/y2r2_3d.js:453（2-Y2-22，YT_HELP_OFFERED）（事件定義在 wt_m590 src、沒有 retired／off）
V3-D22｜確定被取代 → EVPKG-R2Y2-1020｜以安新 13＝2-Y2-24 群組版 src/y2r2_3d.js:589（AN_TUTOR_FAMILY=2）；G4 學姊畢業典禮在大二下作廢（交接包_v3 文件狀態：她大一下就畢業；AA_314 §4-13 列 D22），改在大一下 ev_sis_graduation src/sis_grad3（事件定義在 wt_m590 src、沒有 retired／off）；G4 那一半作廢（學姊大一下就畢業）
V3-G12｜確定被取代 → EVPKG-R2Y2-1020（2-Y2-18）｜src/y2r2_3d.js MX_HEARD → 一次性選項，記 AN_MX_ASKED（兩個旗標都在 src）
V4-B01｜確定被取代 → EVPKG-1B08-11、1B12-17、R2Y3、1C01-06｜Z10 明信片 src/y2b3d.js:134（1B-10）；Z11 ev_zhiruo_no_sugar src/y34b3d.js:680；Z11b ev_zhiruo_third_row src/data/r2y3b_events.js:261；Z12 ev_zhiruo_graduatio（事件定義在 wt_m590 src、沒有 retired／off）
V4-B02｜確定被取代 → EVPKG-1B18-25、R2Y4｜志願表學姊反應（1A-05 src/story3d.js:3340 起）；感冒週學姊那一份（coldWeekCast :3200）；W15c 送機 ev_sis_airport src/y34b3d.js:689＋US0（1B-18，y34b3d.js:208）；M6 S.m6 y34b3d.js:（事件定義在 wt_m590 src、沒有 retired／off）；只差 BCG-31 夏天版的圖（BB 要圖）
V4-B03｜確定被取代 → EVPKG-R2Y3-1020（Q8b）、EVPKG-1B01-07-1020（Q10）、y34b3d.js 的 1B 事件包（Q12）、EVPKG-1C01-06-1020（Q13）、r2y3b3d.js（Q15）｜Q8b ev_ziqing_dad_stuck src/data/r2y3a_events.js:228；Q10 ev_ziqing_capstone src/data/y2b_events.js:228；Q12 ev_ziqing_q12 src/y34b3d.js:682；Q13 ev_zq_z（事件定義在 wt_m590 src、沒有 retired／off）；Q11 作廢
V4-B04｜確定被取代 → EVPKG-1C01-06、1B12-17、R2Y3｜明軒 M3 在冠軍賽 src/data/group_events.js:136-143、src/group3d.js:109；阿凱 K4 src/y34b3d.js:488-511（1B-15）；方奕廷 F3 ev_fangyt_tickets src/data/r2y3b_events.js:35（事件定義在 wt_m590 src、沒有 retired／off）；沛珊 P5b 作廢（AA_314 §4-5）
V4-B05｜確定被取代 → EVPKG-R2Y3、1B12-17、R3｜可昕大三（BB_98 第 9 節）：K15 ev_kexin_30min src/data/r2y3a_events.js:186、K11 :206、主線 4 電話 :286、K17 :468、聖誕 :515、除夕 :531、情人節 :538、K18 src/data/r2y3b_events.js（事件定義在 wt_m590 src、沒有 retired／off）
V4-E1｜確定被取代 → EVPKG-1A03-1020｜1A-03 STORY.unboxY3 src/story3d.js:2636（ROOM_Y3_DISCARD）（事件定義在 wt_m590 src、沒有 retired／off）
V4-E10｜確定被取代 → EVPKG-1A05-1020、1A02｜1A-05 志願表 STORY.an15Cafe src/story3d.js:3348（AN15_SEEN）；路線照交往狀態定 STORY.routeDecide :3114（1A-02，取代三選一）（事件定義在 wt_m590 src、沒有 retired／off）
V4-E11｜確定被取代 → EVPKG-R2Y3-1020｜2-Y3-17 語彤 14 續約 ev_yt_lease_renew src/data/r2y3a_events.js:416（事件定義在 wt_m590 src、沒有 retired／off）
V4-E12｜確定被取代 → EVPKG-R2Y3-1020｜2-Y3-18 慈 5 ev_xinci_an_answers src/data/r2y3a_events.js:448（事件定義在 wt_m590 src、沒有 retired／off）；AA_547 把慈 5 改寫（事件 id 照舊）
V4-E13｜確定被取代 → EVPKG-1C01-06、R2Y3｜聖誕大三＝1C-03 寄到英國的那一箱 ev_xmas_y3_box src/data/group_events.js:89；語彤 13 ev_yt_thursday_free src/data/r2y3a_events.js:497（2-Y3-20）；跨年 ev_y3_newyear src/da（事件定義在 wt_m590 src、沒有 retired／off）
V4-E14｜確定被取代 → EVPKG-1B12-17-1020｜1B-12 以安新 16：ev_an_farewell_dinner src/y34b3d.js:673、ev_an_sendoff :674、日本路線 ev_an_depart_jp :676（CG-22 cg_depart_together_heroine01）（事件定義在 wt_m590 src、沒有 retired／off）
V4-E15｜確定被取代 → EVPKG-1A06-08-1020｜1A-06 ev_sister_hotpot src/data/events.js:4322、1A-07 ev_family_land_y3 :4324；所有路線都在大三寒假 1/26 演（AA_314 §0-3；交換版 2-Y4-30 作廢）（事件定義在 wt_m590 src、沒有 retired／off）
V4-E16｜確定被取代 → EVPKG-R2Y3、1C01-06｜語 4 ev_yu_alone_breakfast src/data/r2y3b_events.js:139、語 5 ev_yu_alone_movie :250、慈 6 ev_xinci_first_place :299；哲 4＋冠軍賽 ev_zhe_said_it src/data/group_（事件定義在 wt_m590 src、沒有 retired／off）；慈 6 ev_xinci_first_place 已被 AA_547 改寫成「暑期實習」（id 照舊）
V4-E17｜確定被取代 → EVPKG-1C01-06-1020｜1C-05 ev_zq_zr_graduation src/data/group_events.js:165、芷若 Z12 ev_zhiruo_graduation_cafe :177（GRAD_ZQ_ZR）（事件定義在 wt_m590 src、沒有 retired／off）
V4-E18｜確定被取代 → EVPKG-1A06-08-1020｜1A-08 ev_y4_path src/data/events.js:4328（Y4_PATH）（事件定義在 wt_m590 src、沒有 retired／off）
V4-E19｜確定被取代 → EVPKG-1B12-17-1020｜1B-13 ev_yt_thursday_first src/y34b3d.js:677、每週四 ev_yt_thursday、田野的發現 ev_field_finding :679（YT_T1、FIELD_FINDING）（事件定義在 wt_m590 src、沒有 retired／off）
V4-E20｜確定被取代 → EVPKG-R2Y3-1020｜228 ev_y3s2_228 src/data/r2y3b_events.js:44；杜鵑花第三張 ev_an_azalea_y3 :60；清明頂樓烤吐司 ev_y3s2_roof_toast :192（事件定義在 wt_m590 src、沒有 retired／off）
V4-E21｜確定被取代 → EVPKG-R2Y3-1020｜2-Y3-43 ev_an_town_notice src/data/r2y3b_events.js:306（日本路線 CG-17 cg_japan_notice_heroine01；台灣路線群組照片）（事件定義在 wt_m590 src、沒有 retired／off）
V4-E23｜確定被取代 → EVPKG-R2Y3-1020｜2-Y3-34 ev_an_konbini src/data/r2y3b_events.js:156（CG-13 cg_japan_konbini_heroine01）；日本學期 src/jp3d.js（事件定義在 wt_m590 src、沒有 retired／off）
V4-E3｜確定被取代 → EVPKG-1B08-11-1020、EVPKG-R2Y3-1020｜1B-08 語彤 13b ev_yt_ta_news src/data/y2b_events.js:181；2-Y3-05 哲 3 隊長 ev_zhe_captain src/data/r2y3a_events.js:170（事件定義在 wt_m590 src、沒有 retired／off）
V4-E4｜確定被取代 → EVPKG-1B08-11-1020｜1B-08 那把傘 ev_yt_umbrella_y3 src/data/y2b_events.js:191（CG-6 cg_umbrella_heroine03 已登錄、選 none 不放）（事件定義在 wt_m590 src、沒有 retired／off）
V4-E5｜確定被取代 → EVPKG-1C01-06-1020、R2Y3｜中秋（大三＝以安生日，1C-02）ev_midautumn_y3 src/data/group_events.js:72；迎新（2-Y3-03，9/4）ev_y3_welcome src/data/r2y3a_events.js:123（事件定義在 wt_m590 src、沒有 retired／off）
V4-E6｜確定被取代 → EVPKG-R2Y3-1020｜旁聽改成第 7～11 週自己去的作業（AA_252 5-1）ev_crimpro_court_visit src/data/r2y3a_events.js:310；以安新 14 ev_an_admin_court :344；慈 4 ev_xinci_bad_line :329；CG-16 依 AA_（事件定義在 wt_m590 src、沒有 retired／off）；但慈 4 ev_xinci_bad_line 已被 AA_547（46e36f86b，芯慈新個性）拿掉——src 只剩註解，這一子項是取消不是取代
V4-E7｜確定被取代 → EVPKG-1A04-1020｜1A-04 STORY.coldWeekCast src/story3d.js:3200（CG cg_cold_week_friends、BEING_HEARD、可昕 K16、學姊那一份）（事件定義在 wt_m590 src、沒有 retired／off）
V4-E8｜確定被取代 → EVPKG-R2Y3-1020｜翰 4 ev_bohan_third_floor src/data/r2y3a_events.js:364（2-Y3-14）；校慶大三 ev_fair_booth_y3 :385（2-Y3-15）（事件定義在 wt_m590 src、沒有 retired／off）
V4-E9｜確定被取代 → EVPKG-R2Y3-1020｜2-Y3-16 C4 阿哲的機車 ev_zhe_scooter src/data/r2y3a_events.js:409（事件定義在 wt_m590 src、沒有 retired／off）
V5-B01｜確定被取代 → EVPKG-R2Y4-1020｜2-Y4-23 學姊 M7 接機 ev_sis_pickup src/data/r2y4a_events.js:564（cg_airport_pickup_heroine05）（事件定義在 wt_m590 src、沒有 retired／off）
V5-B04｜確定被取代 → EVPKG-R3、R2Y4｜3-11 學姊的讀書計畫和便條：ev_sis_plan_lab src/data/r3_events.js:102、美國路線 ev_sis_plan_us :94、考場便條 ev_sis_exam_note :111；10/25 便條在 2-Y4-06（事件定義在 wt_m590 src、沒有 retired／off）
V5-B06｜確定被取代 → EVPKG-1A13-20-1020｜1A-13 ④ W15 保溫瓶 S.thermos src/postgrad3d.js:182、227（SIS_THERMOS）（事件定義在 wt_m590 src、沒有 retired／off）；注意：D127 第④點「空的保溫瓶整條拿掉」——這裡是畢業那天的新保溫瓶（S.thermos、SIS_THERMOS、尾聲 epiThermos），不是 ev_sis_empty_flask；請 AA 確認 D127 的「整條」包不包括它
V5-B07｜確定被取代 → EVPKG-R3-1020｜3-14 學姊交往中的大四：ev_sis_y4_desks src/data/r3_events.js:145、ev_sis_y4_father :173、ev_sis_y4_dayoff_river :189（SIS_DAY_OFF）（事件定義在 wt_m590 src、沒有 retired／off）
V5-B10｜確定被取代 → EVPKG-R3-1020｜3-10 阿凱 K5（手機版）src/r3_3d.js:149（ev_kai_can_they_sue 記演過、KAI_STAYED_UP）（事件定義在 wt_m590 src、沒有 retired／off）
V5-B11｜確定被取代 → EVPKG-R3-1020｜3-13 方奕廷 F4 ev_fangyt_chiayi src/data/r3_events.js:121（CHIAYI_TREE）（事件定義在 wt_m590 src、沒有 retired／off）
V5-B12｜確定被取代 → EVPKG-R2Y4-1020｜2-Y4-32 明軒 M4「存夠了」ev_mingxuan_saved src/data/r2y4b_events.js:45（事件定義在 wt_m590 src、沒有 retired／off）
V5-B13｜確定被取代 → EVPKG-R2Y4-1020｜2-Y4-36 沛珊 P6（台南）ev_peishan_open_class src/data/r2y4b_events.js:158（事件定義在 wt_m590 src、沒有 retired／off）
V5-B14｜確定被取代 → EVPKG-1A13-20-1020｜1A-13 畢業典禮的人 src/postgrad3d.js:223-232（子晴、明軒、阿凱；伴侶一定先出現；沛珊 pg_ps_card :133；可昕 6/9 ev_pg_kx_grad :485）（事件定義在 wt_m590 src、沒有 retired／off）
V5-B15｜確定被取代 → EVPKG-1A13-20、R2Y4｜尾聲 src/postgrad3d.js:367-385＋src/data/postgrad_lines.js:199-210（每人一句、前任經過一句、桌上的東西）；2-Y4-53 條件細分 src/r2y4b3d.js（PG.epi*）（事件定義在 wt_m590 src、沒有 retired／off）
V5-B16｜確定被取代 → EVPKG-R2Y4、1B18-25｜可昕的大四（BB_99 第 9 節）：K21 src/data/r2y4a_events.js:468、K22 :481、實習 :418、聖誕 :499、KH :518、除夕 :540、情人節 :550、K23 src/y34b3d.js:701、生日 src/data/r2y4b_events.j（事件定義在 wt_m590 src、沒有 retired／off）
V5-F01｜確定被取代 → EVPKG-1A09-15-1020｜1A-09 STORY.unboxY4 src/story3d.js:3508（BOX_KEPT_Y4）（事件定義在 wt_m590 src、沒有 retired／off）
V5-F03｜確定被取代 → EVPKG-1A09-15-1020｜1A-10 R1 時差 ev_r1_jetlag src/data/events.js:4330（事件定義在 wt_m590 src、沒有 retired／off）
V5-F05｜確定被取代 → EVPKG-R2Y4-1020｜2-Y4-01 迎新 ev_y4_welcome src/data/r2y4a_events.js:271、2-Y4-03 中秋 :301、2-Y4-07 校慶 :320、2-Y4-10 聖誕 :352；跨年 ev_y4_newyear src/data/events.js:3462（HOL-NYE（事件定義在 wt_m590 src、沒有 retired／off）
V5-F06｜確定被取代 → EVPKG-R2Y4-1020｜2-Y4-05 語彤 15b〈公館的時間〉ev_yt_essay src/data/r2y4a_events.js:373（事件定義在 wt_m590 src、沒有 retired／off）
V5-F08｜確定被取代 → EVPKG-R2Y4-1020｜2-Y4-04 ev_y4_path_again src/data/events.js:4329（事件定義在 wt_m590 src、沒有 retired／off）
V5-F09｜確定被取代 → EVPKG-R2Y4-1020｜2-Y4-06 推甄 ev_push_interview src/data/r2y4a_events.js:387；翰 5 柏翰的晚餐 ev_bh_dinner :395（事件定義在 wt_m590 src、沒有 retired／off）
V5-F10｜確定被取代 → EVPKG-R2Y4-1020｜2-Y4-08 讀書會交棒 ev_plg_handover src/data/r2y4a_events.js:337（PLG_LAST_RULE）（事件定義在 wt_m590 src、沒有 retired／off）
V5-F11｜確定被取代 → EVPKG-1B18-25-1020｜1B-20 二十三週年 ev_noodle_23rd src/y34b3d.js:696（CG-8 cg_anniversary_23、ANNIVERSARY_23；群組倒數 y34b3d.js:263）（事件定義在 wt_m590 src、沒有 retired／off）
V5-F12｜確定被取代 → EVPKG-1B18-25-1020｜哲 5、語 6 在二十三週年同一場：src/y34b3d.js:585 起 A23（小語「四年了。這兩個位子，本來就是我們的。」、阿哲「阿姨，四年前我說……」）（事件定義在 wt_m590 src、沒有 retired／off）
V5-F13｜確定被取代 → EVPKG-R2Y4-1020｜2-Y4-09 ev_yt_share_time src/data/r2y4a_events.js:435；告白版搬到學期末 CG-12 src/data/termend_lines.js:48-52（事件定義在 wt_m590 src、沒有 retired／off）
V5-F15｜確定被取代 → EVPKG-R2Y4-1020｜2-Y4-31 杜鵑花第四張 ev_azalea_y4 src/data/r2y4b_events.js:24（CG-18）（事件定義在 wt_m590 src、沒有 retired／off）
V5-F16｜確定被取代 → EVPKG-R2Y4-1020｜2-Y4-27 以安考前一晚＋筆試 ev_grad_exam src/data/r2y4a_events.js:586、ev_grad_exam_after :592；寒假停點 src/holff3d.js:54（以安不延畢，2029-02-03）（事件定義在 wt_m590 src、沒有 retired／off）
V5-F17｜確定被取代 → EVPKG-R2Y4-1020｜2-Y4-34 研究所放榜 ev_grad_result src/data/r2y4b_events.js:108、以安商法組 ev_an_grad_pass :88（事件定義在 wt_m590 src、沒有 retired／off）
V5-F18｜確定被取代 → EVPKG-R2Y4-1020｜2-Y4-35 春假 ev_spring_y4 src/data/r2y4b_events.js:113、可昕 ev_kexin_trip_spring_y4 :135（事件定義在 wt_m590 src、沒有 retired／off）
V5-F19｜確定被取代 → EVPKG-R2Y4-1020｜2-Y4-37 語彤 16b 阿姨的照片 src/r2y4b3d.js:155（4/19 18:00＋麵店公休）（事件定義在 wt_m590 src、沒有 retired／off）
V5-F20｜確定被取代 → EVPKG-1B18-25-1020｜1B-24 以安新 20 ev_an_your_turn src/y34b3d.js:703（交往版 CG-19；和別人交往中改麵店長桌）（事件定義在 wt_m590 src、沒有 retired／off）
V5-F21｜確定被取代 → EVPKG-R2Y4-1020｜2-Y4-39 系籃最後一場 ev_last_game_y4 src/data/r2y4b_events.js:189、吉他社成發 ev_concert_y4 :202（事件定義在 wt_m590 src、沒有 retired／off）
V5-F22｜確定被取代 → EVPKG-1A09-15-1020｜1A-11 STORY.packY4 src/story3d.js:3535（BOX_KEPT_Y4、冬天的衣服）（事件定義在 wt_m590 src、沒有 retired／off）
V5-F23｜確定被取代 → EVPKG-1A09-15、1A13-20｜1A-12 STORY.gradFamily src/story3d.js:3554（ev_grad_family）＋1A-13 src/postgrad3d.js:223-230（大合照、伴侶先出現、新 21 S.mother :187＋CG-9、W15 S.thermos :182、語彤事件 1（事件定義在 wt_m590 src、沒有 retired／off）
V5-F24｜確定被取代 → EVPKG-1A13-20-1020｜1A-14 畢業那天傍晚 src/postgrad3d.js:136、172（GRAD_EVENING；一對一的飯照 termend）；重訪日 5 取消（事件定義在 wt_m590 src、沒有 retired／off）
V5-F25｜確定被取代 → EVPKG-R2Y4、1A09-15｜2-Y4-43 期末最後一頓 ev_last_meal_y4 src/data/r2y4b_events.js:228；6/28 搬走 STORY.moveOutY4 src/story3d.js:3585（1A-15，麵店工讀二選一 JOB_NOODLE_SUMMER）（事件定義在 wt_m590 src、沒有 retired／off）；其中「麵店工讀二選一（JOB_NOODLE_SUMMER）」已被 AA_519 1-5 刪掉（story3d.js:4319 註解），src 沒有這個旗標
V5-F26｜確定被取代 → EVPKG-1A13-20-1020｜畢業後篇 src/postgrad3d.js（國考報名 → 8/4 一試 20 題 → 9/7 → 10/20～21 二試 → 12/14 律師錄取 → 2030-10-01 第一份工作；照 AA_286，取代 F26 的一次考完）（事件定義在 wt_m590 src、沒有 retired／off）；D118／STUDY-EXAM-SYS-1102（進行中）可能再改國考段
V5-F27｜確定被取代 → EVPKG-1A13-20-1020｜1A-20 尾聲 src/postgrad3d.js:367-385（2034-06-03、CG-10 八張圖層、每人一句、桌上的東西、EPILOGUE_DONE）（事件定義在 wt_m590 src、沒有 retired／off）
V5-K21｜確定被取代 → EVPKG-R2Y4-1020｜2-Y4-13 ev_kexin_study_really src/data/r2y4a_events.js:468（＋lib、us 兩版）（事件定義在 wt_m590 src、沒有 retired／off）
V5-K22｜確定被取代 → EVPKG-R2Y4-1020｜2-Y4-14 ev_kexin_two_directions src/data/r2y4a_events.js:481（事件定義在 wt_m590 src、沒有 retired／off）
V5-K23｜確定被取代 → EVPKG-1B18-25-1020｜1B-21 ev_kexin_own_paths src/y34b3d.js:701（KX_PATHS；美國路線視訊）（事件定義在 wt_m590 src、沒有 retired／off）
V5-K24｜確定被取代 → EVPKG-1A13-20-1020｜6/9 她的畢業典禮 ev_pg_kx_grad src/postgrad3d.js:485（BCG-07 cg_two_graduations_kexin；KX_GRAD）（事件定義在 wt_m590 src、沒有 retired／off）
V5-K25｜確定被取代 → EVPKG-R2Y4-1020｜2-Y4-40 讀書會的最後一晚 ev_kexin_last_study_night src/data/r2y4b_events.js:212（事件定義在 wt_m590 src、沒有 retired／off）
V5-K26｜確定被取代 → EVPKG-R2Y4-1020｜2-Y4-44 ev_kexin_after_grad src/data/r2y4b_events.js:244（事件定義在 wt_m590 src、沒有 retired／off）
V5-K27｜確定被取代 → EVPKG-R2Y4-1020｜2-Y4-59 書架最右邊那一格 src/r2y4b3d.js:529（2030-10-01 第一份工作那一串之後）（事件定義在 wt_m590 src、沒有 retired／off）
V6-A8｜確定被取代 → EVPKG-R2Y4-1020／1B18-25＋AA121-CG20-SEAT-1031｜CG-18、19、21 已放；CG-20 由 AA121-CG20-SEAT-1031 放到律師讀書小組第一晚（src/data/r2y4b_events.js:38 CG20_LINES）
V6-B3｜確定被取代 → EVPKG-1C01-06-1020（1C-05）｜BCG-26 cg_crooked_cap_heroine04 在 src/data/group_events.js（ev_zq_zr_graduation）
Y3S1-XMAS｜確定被取代 → EVPKG-1C01-06-1020（1C-03）｜ev_xmas_y3_box 在 src/group3d.js:80-82、XMAS_Y3_BOX
## 其實沒被取代
BB203-CONFESS-1017｜其實沒被取代｜本身就是告白／期末飯的實作（src/termend3d.js＋termend_lines.js；termend_unit.js、confess_unit.js）；「取代」字樣是它取代別人（重訪日、學期中告白）
CAMP-L1｜其實沒被取代｜本身就是宿營開局的實作（src/data/camp_y1.js、STORY.campY1；camp_y1_unit、camp_econ_unit）；沒有別的任務涵蓋
AA255-Y2S2｜其實沒被取代｜自己的實作 8190b88ed（feat-aa255-1101）；稽核說缺的 KAI_KEYBOARD 現在 src/bbpack3d.js:89-91 有記；只有個別子項被 AA_546／AA_428 等新稿取代
AA345-ANSWERS-1021｜其實沒被取代｜自己的實作 a0772635（28 題）；只有子項 G9-54 併入 EVPKG-AA346-APART、G9-47 等使用者（PROPOSAL）
AA349-KL-1021｜其實沒被取代｜自己的實作 9e14bed7（jp_semester、peishan_tainan 等測試）；沒有涵蓋它的任務
AA372-Y1S1-FIX-1021｜其實沒被取代｜自己的實作 75eeef60＋4326d91c；沒有涵蓋它的任務
AA532-VAC-FIX-1030｜其實沒被取代｜自己的實作（postrel-1030 b576263b6；aa532_vac_unit）；只有 AA_532 第 5 節被 AA_525 作廢
BB204-EXROUTE｜其實沒被取代｜自己的實作（STORY.routeDecide、EXCHANGE_ROUTE；route_decide_unit、two_hearts_unit）；「取代」是它取代舊的三選一
CLOSED-SPACES-1023｜其實沒被取代｜自己的實作（lab5f3d、b1story3d、lupstory3d、gymcer3d、closed2_3d、closed3d 都在 src）
EVPKG-1B18-25-1020｜其實沒被取代｜它本身就是事件包（取代別人的那一方）；BB 表「LAWWW-C」是解析錯；實作在 src/y34b3d.js
EVPKG-R2Y4-1020｜其實沒被取代｜它本身就是事件包（r2y4a／r2y4b，347 項測試）；只有「美國的三門課、秋假以外的美國學期」移到 US-LIFE-AA340-1020
NPC-STORY2-1028｜其實沒被取代｜自己的實作（AA_519～522 都已做，sup519_3d.js 等）；只剩 psy_lab、linze_201 兩張 2D 背景（BB 要圖）
SIDEQ-AA397-1023｜其實沒被取代｜自己的實作（src/sideq3d.js SQ01～SQ20；aa397_sideq_unit）
STORY-AUDIT-1017｜其實沒被取代｜總項；AA_360 部分自己合併 2bce84da（aa360_unit 35 項）；瀏覽器驗收另開 BB-TEST-AA360-1021（待開工）；沛珊 5-1 移到 PLAN-1016-ROM（待開工）——不是被取代，是拆出
AA-Q-1021-SR｜其實沒被取代｜自己的實作 552fb56e1（aa350_t_unit）；只有子項 T6a 被 AA_369 取代
AA555-L123-SCENES-1101｜其實沒被取代｜自己的實作（src/campus_l123_3d.js，ev_l1_elevator、ev_l2_hist_door、ev_l3_photo_N；campus_l123_unit 60 項）
BB119-Y4-1017｜其實沒被取代｜實作分在三處都在：沛珊／子晴不在學期中告白＝termend3d；芷若 8/26「我等妳回來／我先收著」＝src/zr_last3d.js（AA_387）；當天那一場＝src/v6b_3d.js（52bfa7b5d）；沒有單一取代者，要自己驗
D14-T9｜其實沒被取代｜自己的實作（src/data/invite_replies.js＋invites3d.js replyPick；aa415_invite_replies_unit 190 項）；節日、外出列還關著（INV.REPLY_ON）
V1-BB171｜其實沒被取代｜自己的實作（Kevin 跨年照、AA_432 五則私訊；aa432_nye_y1_unit）；只有 T1 被 AA_369 M5（跨年在高雄）取代
V3-B22｜其實沒被取代｜本體自己做在 src/story3d.js 大二手機小事（v3_phone_small_unit）；當時沒做的幾則才由別的任務補
V6-B4｜其實沒被取代｜自己的實作（src/cracktalk3d.js＋cracktalk_lines.js；v6_crack_unit 78 項）；但五條裂縫只有語彤、芷若兩條玩得到（SOURCES_MISSING）
V6-B5｜其實沒被取代｜自己的實作（src/v6b_3d.js 紅筆短版視訊、PS_RED_PEN；52bfa7b5d）；芷若 8/26 在 zr_last3d.js；沛珊 ev_peishan_wait 作廢（AA_281）
V6-B7｜其實沒被取代｜自己的實作（BCG-20 接在 Q15、BCG-25 ev_zhiruo_uk_visit 在 src/v6b_3d.js）；BCG-19、24 作廢
V6-S6｜其實沒被取代｜自己的實作（adv3d.js G.cg.unlocked、game3d.js 手機相簿）；沒有涵蓋它的任務
V5-L2｜其實沒被取代｜自己的階梯匯入（ladder.js byTerm.Y4S1 P7、K7）；只有 S6 移到 Y3S2
V6-P456｜其實沒被取代｜自己的實作（P5 postgrad3d.js、P6 r2y4b3d.js 2-Y4-54）；P4 標作廢，但 I10-CG-DOORBELL-1027 後來照使用者 10-30 選 A 做了門鈴抓包 CG（cg_doorbell）——P4 其實由 I10 實現
## 無法判斷
D14-T7｜無法判斷｜實作在（src/postgrad3d.js 國考時程、bar_exam_unit），沒有別的任務取代它；但 D118（11-02）要改國考與職涯連動（司法官落榜可重考、沒考上司法官也能當律師），STUDY-EXAM-SYS-1102 還在進行中——要等那邊定案才知道這項是保留還是被取代
## 三、C 類 129 項照 D128 重分（真的要使用者看的劇情方向：0 項）

### 美術→BB（建築／場景，D120／D128）
LIB-FRONT-1102｜美術→BB｜總圖外觀與前草坪
CLUBFAIR-REAL-1027｜美術→BB｜帳篷、招牌、顧攤的人＝場景；社團內容 AA 已定
BUG-LIGHTBAND｜美術→BB｜場景渲染的半透明直條
VAC-A2｜美術→BB｜3D 機場場景
BUG-COPLANAR-DEV｜美術→BB｜場景 GLB 疊面
CAFE-LM-1030｜美術→BB｜Café 室內光照
CAFE-WINDOW-LIVE-1030｜美術→BB｜Café 窗景
DORM-SLEEP-VISUAL-1030｜美術→BB｜宿舍床、書桌、睡覺鏡頭與光照
LIB-LAWN-PLAN-1030｜美術→BB｜總圖前草皮
RENAME-ART-1030｜美術→BB｜場景上的改名文字貼圖
SKYBRIDGE-DOOR-1020｜美術→BB｜空橋的門與導航
US-APT-CLOSET-1027｜美術→BB｜美國公寓格局（使用者給的是規格，驗收照 D128 歸 BB）
WZ-CAT-LIFE-1023｜美術→BB｜溫州街的貓 3D 與互動；收養劇情 AA 已寫
BUG-NIGHT-REREG-1018｜美術→BB｜場景窗燈夜間切換
BUG-US-KITCHEN-1018｜美術→BB｜美國公寓互動點與鏡頭
DORM-Y2-312｜美術→BB｜宿舍門牌與窗景
ART-DORM-Y34｜美術→BB｜宿舍房間
BUG-GYM-STAIRS-1020｜美術→BB｜體育館樓梯方向
DORM-HALL-LM-1028｜美術→BB｜門廳擺設與光照
INTERIOR-202-1028｜美術→BB｜202 室內
JP-ROOM-3D-1021｜美術→BB｜日本宿舍房間
LAWLIB-LM-1030｜美術→BB｜法圖光照
LIB-HALL-LM-1028｜美術→BB｜總圖大廳光照
LIGHTBAKE-UV-FIX-1028｜美術→BB｜光照貼圖 UV
LINZE-WANCAI-FLOORS-1020｜美術→BB｜霖澤、萬才樓上開放
LM-SEAM-1028｜美術→BB｜光照貼圖黑縫
LOBBY-VC-1028｜美術→BB｜大廳材質合併（效能）
MULTI-ROOM-V2-1030｜美術→BB｜多功能教室
SCN-V3-01｜美術→BB｜第二個房間
SCN-V4-01｜美術→BB｜第三個房間
SCN-V5-01｜美術→BB｜第四個房間
SQ-TRACES-1023｜美術→BB｜支線痕跡道具
WANCAI-LM-1028｜美術→BB｜萬才館光照
ART-04｜美術→BB｜道具（盆栽）
ART-LAMPSHADE-FLIP-1027｜美術→BB｜燈罩反面
BACKLOG-A7-WZPARK-COPLANAR｜美術→BB｜小公園疊面
RT-NIGHT-1028｜美術→BB｜夜間沒烘焙零件太亮
### 美術→BB（CG／2D 圖；跟使用者要圖是素材，不是驗收）
ART-BB-READY-1017｜美術→BB｜BB 已通過的 CG／背景接線
CG-BATCH2-1020｜美術→BB｜45 張 CG 登錄與插入位置
V2-CGX｜美術→BB｜BCG-04、BCG-11 接線
ART-15｜美術→BB｜v3～v6 CG
ART-CG-ECONCAMP｜美術→BB｜而且 next 寫使用者 01:2x 已 ART_APPROVED（BB-B d073885f），可直接結
BCG-46｜美術→BB｜班級合照 CG；acceptance 原寫「使用者看過」，照 D128 改 BB
SCN-JP-CG｜美術→BB｜日本線 CG
SCN-US-CG｜美術→BB｜美國篇 CG
SCN-V5-03｜美術→BB｜尾聲 CG-10
CG-APPROVED-MISSING-1021｜美術→BB｜已通過的 CG 沒接上
### 美術→LAWWW（角色／人物外觀，D100a／D128；BB 給意見）
ART-NPC-40｜美術→LAWWW｜路人底模的人物外觀
BUG-03｜美術→LAWWW｜路人頭髮外觀
BUG-LATTE-CLERK-1018｜美術→LAWWW｜店員該是芷若卻用了路人模型＝角色選用
PT106-REMATTE-1102｜美術→LAWWW｜立繪去背
ART-HAIR-MATCAP｜美術→LAWWW｜VRM 頭髮材質
ART-SEATFIG-1018｜美術→LAWWW｜坐著的替身人物外觀
ART-05｜美術→LAWWW｜角色 VRM
ART-09｜美術→LAWWW｜六張新立繪
ART-NPC-HAIR-STREAK｜美術→LAWWW｜路人頭髮
ART-PS-SKIRT-HAND｜美術→LAWWW｜沛珊裙子與手
ART-PT-SIS-FORMAL｜美術→LAWWW｜學姊 formal 立繪；舊制下 BB-B 已 ART_APPROVED
ART-YT1｜美術→LAWWW｜祐廷 VRM 精修
ART-YU-3D-1018｜美術→LAWWW｜小語 3D 人物
BADMINTON-CLIP-1027｜美術→LAWWW｜人物動作短片（場地部分 BB 可一起看）
HEROINE-LIFE-NPC3D-1028｜美術→LAWWW｜同伴 3D（路人底模＋道具）
NPC-POOL-ART-1028｜美術→LAWWW｜二十位同學的外觀與道具（三個互動物件屬場景，BB 一起看）
ANIM-DOOR-OPEN-1027｜美術→LAWWW｜人物開門動作
FIT-3D-BODY-1027｜美術→LAWWW｜主角體態；next 還寫「改主角身形＝使用者決定（D111）」——D128 起人物外觀大改歸 LAWWW，要改 next
### 非美術→BB（效能／UI）；只有 iPhone 實機那一步要用使用者的手機，不是審美
PERF-BOOT｜非美術→BB｜開遊戲速度
PERF-CAMPUS-DAY-1027｜非美術→BB｜校園白天卡頓
PERF-TEX-DEDUP-1027｜非美術→BB｜貼圖去重（和 iPhone 記憶體不足相關）
BUG-ADV-CHOICES-SAFEAREA-1102｜非美術→BB｜瀏海機 safe-area 版面
PERF-SINGLESIDE-GLB-1025｜非美術→BB｜單面 GLB 效能
### 非美術→BB 流程測試（BB_245 歸成 C 是因為字面有「畫面」；不需要使用者）
D118-MIDTERM-STORY-1102｜非美術→BB 流程測試｜台詞與事件掛點；66 句等 AA 自己定（D109），BB／CC 驗 11 處新掛點
AA249-TERMEND｜非美術→BB 流程測試｜期末飯邀約流程（termend_unit）
BB203-CONFESS-1017｜非美術→BB 流程測試｜「告白只在學期末」使用者 11:40 已定；剩流程驗證
BUG-ADV-SPEAKER-DIM-1018｜非美術→BB 流程測試｜對話時哪張立繪亮的 UI 邏輯
BUG-BOWL-STUCK-1018｜非美術→BB 流程測試｜劇情鎖卡住
BUG-HOME-CAMPUS-BG-1018｜非美術→BB 流程測試｜在家時 3D 藏起來的切換邏輯（home_backdrop_unit）
BUG-MOVEOUT-STUCK-1018｜非美術→BB 流程測試｜劇情鎖卡住
BUG-OUTING-STUCK｜非美術→BB 流程測試｜劇情鎖卡住、旁白重疊
AA241-SUMMER｜非美術→BB 流程測試｜暑假事件與訊息
AA343-ANSWERS-1021｜非美術→BB 流程測試｜台詞與面板名稱改字；E1／E2／E4 是 CG 插的位置，不是畫 CG
AA347-Y1-COVER-1021｜非美術→BB 流程測試｜補稿的群組、摘要日
AA349-KL-1021｜非美術→BB 流程測試｜沛珊台南、日本學期的訊息與條件
AA350-ANSWERS-1021｜非美術→BB 流程測試｜改字與 CG 位置
AA377-Y3S2-FIX-1021｜非美術→BB 流程測試｜大三下路線條件與台詞
BUG-04｜非美術→BB 流程測試｜同一人重疊出現兩個（npc_overlap_unit），是生成邏輯不是美術
BUG-ADV-LINGER-1018｜非美術→BB 流程測試｜換場景立繪沒清掉的 UI 邏輯
BUG-FOLLOWSIT｜非美術→BB 流程測試｜跟隨的人姿勢狀態錯誤（可量的 bug）
BUG-TEA-SEIZA｜非美術→BB 流程測試｜坐墊上浮 0.4 m、小腿入地（sit_floor_unit 可量）
BUG-WALKDIR-1018｜非美術→BB 流程測試｜走路方向與動作不符（walkdir_unit 可量）
COMPANY-PRIV-1028｜非美術→BB 流程測試｜私密選項在有人旁邊時不出的條件
CROWD-CLASS-ARRIVE-1027｜非美術→BB 流程測試｜教室 NPC 進場行為
EVPKG-1A04-1020｜非美術→BB 流程測試｜感冒週流程＋CG 插入
EVPKG-1B08-11-1020｜非美術→BB 流程測試｜事件流程；next 裡「沛珊交往時間等使用者確認」使用者 10-21 16:1x 已選（UA-AA-1020-33 confirmed）
FEED-DATES-1028｜非美術→BB 流程測試｜動態頁貼文時間與條件
LIFE-HS-1017｜非美術→BB 流程測試｜高中校慶緣分的流程；使用者已定方向；BCG-49 是要圖（素材）
SIS-B14-1028｜非美術→BB 流程測試｜學姊美國五個月的事件
UX-MRT-FAR-1018｜非美術→BB 流程測試｜捷運選單文字
V1-G49｜非美術→BB 流程測試｜小項流程
VAC-FILL-AA440-1024｜非美術→BB 流程測試｜寒暑假空白日
VAC-GAP-1031｜非美術→BB 流程測試｜寒暑假缺口
AA117-CASE-NOTES-1031｜非美術→BB 流程測試｜手機筆記畫面內容
AA121-CG20-SEAT-1031｜非美術→BB 流程測試｜CG-20 插在哪一場的流程
AA143-Y2S2-LASTMEAL-1031｜非美術→BB 流程測試｜事件流程
AA185-V6｜非美術→BB 流程測試｜多段感情規則 AA_185 第 0 節使用者已授權 AA 定案；剩流程
AA185-Y3｜非美術→BB 流程測試｜大三事件
AA187-PAIR-GAPS-1031｜非美術→BB 流程測試｜交往中事件
AA313-S4S5-REST-1023｜非美術→BB 流程測試｜事件流程
AA407-LOANS-1031｜非美術→BB 流程測試｜借書流程
AA489-LINES-1027｜非美術→BB 流程測試｜台詞
AA555-L123-SCENES-1101｜非美術→BB 流程測試｜三段場景的事件流程
AA555-WALK-TALK-1031｜非美術→BB 流程測試｜閒聊與手機小事
BUG-ADV-OVERLAP-1018｜非美術→BB 流程測試｜立繪疊在一起的 UI 邏輯
BUG-CAM-ELEV｜非美術→BB 流程測試｜鏡頭碰撞
BUG-CAMSNAP-1018｜非美術→BB 流程測試｜鏡頭轉回速度（手感可以最後請使用者順手看，不擋驗收）
I10-CG-DOORBELL-1027｜非美術→BB 流程測試｜使用者 10-30 已選 A（門鈴版），已實作（i10_doorbell_unit）；「取消要使用者原話」已不適用
LOAD-GEN-ABORT-1028｜非美術→BB 流程測試｜讀檔收掉舊劇情
SIS-B14-AAFIX-1028｜非美術→BB 流程測試｜事件旁白
UX-PHONE-AUTO-WALK-1021｜非美術→BB 流程測試｜手機自動打開的時機
V1-BB171｜非美術→BB 流程測試｜跨年訊息
V3-G11｜非美術→BB 流程測試｜大二群戲與交付清單修正
V4-E4｜非美術→BB 流程測試｜事件流程＋CG-6 插入
V4-E7｜非美術→BB 流程測試｜事件流程＋CG-5 插入
V4-G02｜非美術→BB 流程測試｜大三中秋事件
V6-S6｜非美術→BB 流程測試｜相簿與戀愛 CG 開關的邏輯
JP-READ-1025｜非美術→BB 流程測試｜日本路線訊息順序
TERM-READ-Y4S1-1025｜非美術→BB 流程測試｜大四上訊息規則
TERM-READ-Y4S2-1025｜非美術→BB 流程測試｜大四下訊息規則
V6-P456｜非美術→BB 流程測試｜多重交往的典禮與尾聲流程
BUG-CAM-203-R2-1021｜非美術→BB 流程測試｜鏡頭被擋
## 四、要注意的事

1. V5-B06：D127「空的保溫瓶整條拿掉」包不包括畢業那天學姊遞的新保溫瓶（postgrad3d S.thermos、SIS_THERMOS、尾聲 epiThermos）→ LAWWW 問 AA。
2. AA306：韋綸大一下階梯 1 層、總表寫 5 層 → 問 AA。
3. 總表記載落後：V4-E6 的慈 4、V5-F25 的 JOB_NOODLE_SUMMER 已被刪；V6-P456 的 P4 抓包 CG 已由 I10 做。
4. 可能被 D118 改掉、建議等定案再驗：D14-T7、V5-F26、D14-T2、DONE-B06。
5. V6-B4 裂縫談話五位只有語彤、芷若兩條玩得到（CRACKTALK.SOURCES_MISSING）。
6. STORY-AUDIT-1017 拆出的 BB-TEST-AA360-1021 從 10-21 一直待開工。
