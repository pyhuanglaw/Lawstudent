# BB_466　v9.10.26 發布後第一批 CC 派工清單（照順序；全部用發布後的開發分支最新版）

- BB-C 2026-11-13 21:2x（UTC）。把 BB_00 全部待辦裡散在 22:3x、05:3x、05:5x、06:2x 四條的 HOLD 收成一張，發布一確定就整批交 CC。
- 規則：瀏覽器測試排使用者電腦（D131、D156）；店面四鏡頭照 ROLE_BB 2.6、D161。

## 第 0 組：發布當下（LAWWW 推 main 以後）
1. deploy_check：線上網址版本字樣＝v9.10.26、開新遊戲、讀檔、p0。

## 第 1 組：使用者要的、會卡玩家的（P1）
2. BUG-SIS-LIB-LOAD-1022：直接讀檔到總圖 3F，學姊在不在（重現不到＝LAWWW 結案）。
3. INV-MEET-YIELD-1113（LAWWW 修好後）：總圖和可昕有約、走到她旁邊，互動鍵是她或座位，不是別人的初見事件。
4. HEROINE_LIFE463（BB_463）：圈子五場、動態三則、私訊抽看。
5. ROUTE_E4／E6／E8_r2（QA-REPRO-1020 結案用）。
6. ANNIV 第二年 case。

## 第 2 組：店面四鏡頭（D154 地點關卡第二層；BB 看圖判）
7. LAWWW2 第九批（整合後）：afar（咖啡機）、2:30 AM（單人沙發）、一盞前院（P2 三項順便看）。
8. 大步球鞋（884f09a7c3 已整合）。
9. 一盞（紙燈）、鮮果（葡萄）。
10. 118 巷：self、dian、korea、tea（tea 要 19:00 那一張確認有客人）；118 四間 AA CC0（義大麵屋、奈良咖哩、迪倫窯烤、包水餃）NODEBUG 近看。
11. 美國兩間（us_market、us_asian_market）窗景。
12. 第六批：榮恩典、禮貌生財、安泰（SHOP_B5）。
13. L118-SEAT-FIX-1112 r4（整合後）：L118_CAM36_a／b，探針改點椅面露出部分；大學食堂 #5／#6／#8 多拍停下那一刻。

## 第 3 組：美術待驗收（BB_464 B、D 節）
14. ART_SWEEP_A：BB_464 B 節第一批 13 個鏡頭。
15. ART-GYM-BG1（體育館典禮背景）、ART-DORM-LOFT（宿舍四人房）。
16. BUG-WZFLICKER：使用者電腦錄影溫州街三處，看還閃不閃。

## 不在這批
- 等使用者的圖：沛珊／芯慈立繪表情、語彤情人節三張、社科院門口（D136）、法律系館A前（ART-BG16）。
- AA 台詞總表（AA_959，372 列）：等 LAWWW 選進遊戲的方式，進了以後跑寫死原句的測試（GHA node-unit-auto）。

## 補（22:5x）
17. ROM-PRIVATE-DATE-1110（開發分支 bc53f04880，使用者 11-13 選擇題「照活動分輕重」）：ROMTIER_a（以安晚餐 vs 咖啡：npcRom／rom +2 vs +1、trust +1，選項另算）、ROMTIER_b（同一天第二次不再加、阿哲不加、晚上約會結束直接睡）。已派 CC，排在 INV_MEET_YIELD 後面。
18. T1_76f8／T1_rc2（BB_257，隨機玩家一整年 8 種子，比對兩版）。

## 補（23:3x）
19. CAMP-GATE-BG（LAWWW 修好後）：新遊戲開頭 ev_camp_d1_bus 前 2 句、ev_camp_d3_end 回校門 5 句不是黑底（先用 ntu_avenue）；black_bg_audit 讀到 camp_y1.js 以後重跑，數字應該從 6／33 變成 6／33（camp 兩處已有圖）或列出新的。BB_460 23:3x。
20. BG3D_GATE 三張（CC queue 2380、2381）：看校門有沒有在畫面裡，挑一張附進 BB_132 第 128 組 6 號。
21. D05 約會圖層（若 r2 證實是 ctx.all 多了 D05.movie＝P2）：LAWWW 補 date_hotspots D05.movie 位置或把 movie 從 all 拿掉以後，DATE_LAYER D05 重跑，要出圖層。
22. AA_1013 可昕圈子 16 列（LAWWW 整合後）：kxKnown 以前一個人、以後帶同學；抽 大一上#1、大二上#5（模擬法庭總圖）、大四下#15（總圖門口或裡面）三列拍＋聽到的那句逐字。
23. FN-LOOK-REACH-1114（開發分支 fa9fb3634f）：「看門口的花」原本是溫州街也被放了一顆在房子位置（plainLook 區域沒 id 就放行）；LAWWW 改成只放在已知區。下一版 CC 重跑 reachability_all --zones wenzhou＋gongguan：溫州街 0 FAIL、公館那顆站得到。
24. REL76_social_r2：cc_social_smoke_probe 遇到約會圖層（#dateLayer）要會點互動點（或跑 ?nodatelayer 版），七位女主角拆成每人一支（避免 120 分逾時），在發布版跑。
25. DATE-LAYER-D05（P2，LAWWW）：光典臺北看完電影後的選點沒經過 DATE.pickChoose（canCalls 空），D05 圖層永遠不出——改走 pickChoose 後 DATE_LAYER D05 重跑要出 #dateLayer；或 LAWWW 決定 D05 照 D33 走文字選單，探針改期望。另：DATE_LAYER 探針 ⑤ 要改成「讀回來重新出發後，點一個點能接著演」（現在把等玩家點的圖層誤判成卡住）。
26. WINVIEW-EDGE-STRIPE（開發分支 fc1813e4f2，視差窗照片外鏡像取樣）：CC 藏玩家重拍安泰、鮮果、榮恩典、Daybreak、afar、青木、頁間 14:00＋20:00，看窗邊不再有拉長條紋。
27. OFFBEAT-VIEW-P3（64b0301754）：日常失速前窗 14:00＋21:00（對面牆有窗、鐵窗、夜亮；最下面沒有天空色帶）。一盞 v1.1 一起四鏡頭。
28. T1 種子 4 卡住（邀約「自己走過去」→ dorm_hall busy 沒放開，P1，LAWWW 修後）：random_play_sim --seed 4 重跑要 PASS。

### rc2e 1404d5f2d4 先跑的結果（不用線上版的那幾支，2026-11-14 09:5x 判）
- SIS_LIB_LOAD_rel_rc2e：PASS（9/05、9/24 讀檔到閱覽室，學姊都在、坐著讀書；0 例外）
- ART_GYM_BG1_rel_rc2e：PASS（ntu_gym_ceremony 背景圖讀得到）
- ANNIV_Y2_rel_rc2e：PASS（前一週私訊、週年出遊排上、演完、D158 字表 0 處）
- REL76_ladder_r2_rc2e：PASS（橫向、直向的選項都在畫面裡、≥44px，階梯往前一層、玩家能動）
- 這四支發布以後不用重跑線上版（發布樹＝rc2e）；只剩線上 deploy_check＋p0 確認部署。其餘 25 支照 CC 佇列跑，回來再判。
- （10:0x 再判，同樣在 rc2e 上跑）ART_DORM_LOFT_rel_reach／shots／seats_rc2e：PASS（宿舍 5 個互動點、坐下的點都走得到；梯子 1400、2150 兩組上下各 3 張都演完；座位 27 個 0 問題；截圖看過，門口、窗、床下、梯子都正常）。ART_SWEEP_A_cafe_l／p_rc2e：PASS（0 例外；截圖看過，入口、桌邊、低角度都正常）。desk_game_L2 坐在書桌時鏡頭偏高、往下看，和發布版一樣，不擋，只記錄。
- （10:1x，rc2e）ART_SWEEP_A_putong_l／p_rc2e：PASS（普通教室 101 後排、講台兩個鏡頭：淺色地板、天花板、黑板、窗都正常）。ART_SWEEP_A_gongguan_l／p_rc2e：PASS（公館街三段、捷運出口、校門斜看、招牌都正常；招牌只寫種類，照 D147）。記兩件 P3、不擋：①gg_row_east 直向那張鏡頭放在攤位棚子底下，前景是一大片網點半透明的棚頂（遮擋物淡出），這是鏡頭位置的問題，不是場景問題，CC 下次改鏡頭位置；②sign_G05 近拍時招牌字有點糊（貼圖解析度），正常距離看得清楚。
- （10:5x，rc2e）ART_SWEEP_A_lane118_l／p_rc2e、ART_SWEEP_A_wenzhou_l／p_rc2e：PASS。118 巷南北兩頭街景、11 間店門面都是立體店內、招牌清楚；溫州街公園步道、遊樂場、機車格正常。**P3 一件**：118 巷「喝不喝咖啡」招牌字重複，寫成「喝不喝咖啡喝不喝咖啡」，後半截被切掉（l118_noodle2 那張），像是招牌字排了兩次，交 LAWWW2。
- **11:3x 更正（BB-C）**：上面那個「喝不喝咖啡招牌字重複」P3 **撤回**。看原圖（l118_noodle2.png 1280×720）那塊招牌只有一組「喝不喝咖啡」，右半截是被畫面邊緣切掉的。我把兩張縮圖並排拼在一起看，旁邊那張的招牌剛好接在後面，才看成重複。LAWWW2 也查過貼圖，只有一組。以後判字和招牌，一律看原圖，不看拼圖。
