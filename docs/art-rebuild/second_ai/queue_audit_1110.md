# LAWWW2 佇列盤點（QUEUE-STALE-LAWWW2-1110；LAWWW 11-10 10:1x 派；LAWWW2 帳號 A）

只列、不改 tasks.json（LAWWW 照表改）。
- 依據：開發分支 `claude/confident-ritchie-8rwh7t` 的 tasks.json＋git log（11-10 10:3x，加深到全部歷史 7,600 筆 commit）、程式碼搜尋。
- 範圍：owner LAWWW2、狀態不是「已驗收／取消」的 195 項（可以做的 119＋等待 75，再加這一項）。
- **第一節是逐項看過的**（待開工、進行中、已實作待整合，共 38 項）；第二、三節（157 項）是程式照 next 欄最新一段＋git log 分類的，只標出要核對的。

## 結論
- 待開工、進行中裡**已經做完、只是狀態沒改**的：ART-WZ6（025ab4f30）、SPORT-SHOPS-1103、FASTFOOD-24H-1103、GG-SHOPS-REDO-1104、WZ-SECOND-1104、WZ-FIVE-1104、XS-GATE-MOVE-1105、ART-XINSHENG-GATE-1103、PERF-XS-NPC-1108 → 改「已整合待測試」。
- 可以結案／被取代的：ART-POLISH、ART-DIRECTOR-LAWWW2、ART-ECON-3D-GAP-1021、ART-PHOTO-CMP-1021、PERF-CAMPUS-SHADOW-1020、MODEL-HELP-1103、OPEN-SRC-2D3D-1104。
- 改成等別人的：ART-13（明軒，D99 凍結）、ART-SOY1（等豆漿店場景）、PERF-ZONE-ENTER-1018（等使用者數字）。
- **（10:4x 再更正：DORM1-WALL-SEAM 早已整合、ART-OLDROAD-SHELF 被頁間取代、FAIR-TENT-CAM 已交付；搜尋時要用沒有日期的短 ID）** 真的還沒做、留在 LAWWW2 佇列的原 15 項（10:2x 更正：ART-WZ6 其實 025ab4f30 已整合）：ART-SOP、LAWWW2-REEXPORT-US-1027、CROWD-DEPTS-LOOK-1028、INTERIOR-AAA-REVIEW-1028、FAIR-TENT-CAM-1102、DORM1-WALL-SEAM-1102、PUTONG101-WINDOW-1102、BAKE-PC-1102-S2、ART-OLDROAD-SHELF-1103、ART-GYM-POOL-SWIMMERS-1103、GYM-FIT-PROPS-1103、PERF-CAMPUS-GLB-1102、LM-SEAM-GEO、WZ-SEAT-CAMS-1104、GG-DOOR-CAMS-1104。
  - 加上進行中的 WINVIEW-AUDIT-1105。
  - DORM1-WALL-SEAM-1102 和 LM-SEAM-GEO 是同一件。
- 「已整合待測試」82 項、「等待」68 項：絕大多數是**等 CC 拍、BB 判**（場景美術 D120 由 BB 標），不是 LAWWW2 的待做。BB 已經寫 PASS、可能可以改已驗收的 4 項列在第二節，請核對。
- 「可以做的 119 項」會這麼多，是因為 queue 把「已整合待測試」也算成可以做。建議 queue 的「可以做的」不要算「已整合待測試」（它在等 BB，不在等 owner）。

## 一、待開工／進行中／已實作待整合（逐項看過）

| 任務 ID | 現在寫的狀態 | 實際狀態 | 證據 SHA | 還缺什麼／建議 |
|---|---|---|---|---|
| ART-13 | 進行中 | 部分完成、剩下的凍結：小語模型已接（55b67ccf9），明軒照 D99 凍結不排 | 55b67ccf9、145952ccd | 改「暫停」（明軒等 D99 解凍） |
| ART-POLISH | 進行中 | 長期總目標，沒有單一交付；實際工作已拆到 INTERIOR-AAA-REVIEW-1028、各場景任務 | a453cb7e9 | 改「被取代」或標成長期原則，不算佇列 |
| ART-WZ6 | 已實作待整合 | **已整合**（10:2x 更正）：內容在 025ab4f30（10-24）用別的檔名接進遊戲——宿舍房間六件 `dorm_wz_items.glb`（計時器、卡片、筆記本、茶罐、白板影印、海報）、阿德影印兩種外觀（wenzhou_street 的 COPY_*）、一盞前院貓碗（WZ_CATBOWL）；tests/dorm_wz_items、wz_copy_shop、wz_work_spots。`aa_support/wz6_items.glb` 是 AA-B 的單件樣品，被這些取代、本來就不載入（BB-C 11-04 是照這個檔名 grep 的） | 025ab4f30 | 改「已整合待測試」（等 CC 拍、BB 判）；wz6_items.glb 可以標「被取代」 |
| ART-SOY1 | 待開工 | 沒有做：src 沒有 soy_props；豆漿店場景（DL-11）也還沒有 | 381f38d23（登記） | 改「等待其他AI／素材」（等豆漿店場景） |
| ART-SOP | 待開工 | ART_SOP.md、SCENE_RULES.md 還不在開發分支（只在 focused-cray／funny 分支） | bbb4301b6 | **留**：LAWWW 把文件合進開發分支（或 LAWWW2 出 patch），然後結案 |
| PERF-ZONE-ENTER-1018 | 進行中 | 量測工具 ?perf 已驗收（BB-B n26_perfpanel_e ALL PASS）；剩使用者在自己電腦／手機回報數字 | 1df75303c | 改「等待使用者」 |
| PERF-CAMPUS-SHADOW-1020 | 進行中 | 腳踏車那一半已整合（51740da74）；「卡」那一半被 PERF-CAMPUS-DAY-1027（497253c6 已整合）接走 | 51740da74 | 改「被取代」（併進 PERF-CAMPUS-DAY-1027） |
| ART-ECON-3D-GAP-1021 | 進行中 | A～D 已整合；E 四季服裝＝ART-PLAYER-SEASON（暫停）、F 劇情已 retired、G＝PERF-ZONE-ENTER、H 等 ART 判 | 1e910aa6c | 結案（剩下的都在別的任務） |
| ART-PHOTO-CMP-1021 | 進行中 | 已併進 NTU-REF-AUDIT-1104（LAWWW，進行中） | 0e2ca42d4 | 改「被取代」 |
| ART-DIRECTOR-LAWWW2 | 進行中 | 長期工作方式（D111），不是一件工作 | 8861aed81 | 標成長期原則，不算佇列 |
| LAWWW2-REEXPORT-US-1027 | 待開工 | 沒有做（只影響以後重匯） | 5f563a875（登記） | **留**（P3，下次動美國公寓、C 棟 208 前做） |
| CROWD-DEPTS-LOOK-1028 | 待開工 | 沒有做 | 7ced0bee1（登記） | **留**（P3） |
| INTERIOR-AAA-REVIEW-1028 | 進行中 | #204 第一～三批已整合（faf1b75a4）；大步、總圖書庫兩間 P3 沒做 | 89430fb0a | **留**進行中（剩 P3 兩間，BB／使用者看到再補） |
| FAIR-TENT-CAM-1102 | 待開工 | 11-10 已交付 4a61b27e9（社博帳篷接樹幹透視；fair_tent_cam_unit 開發 FAIL → ALL PASS） | 4a61b27e9 | 等 LAWWW 整合 |
| DORM1-WALL-SEAM-1102 | 待開工 | **已整合**（10:4x 更正）：LAWWW2-C 4eada314b（T 形接頭 176→3、重烘光照）→ 開發 4b5a0ebd8（11-05）；tests/dorm_hall_tjunc_unit.js。commit 訊息寫的是沒有日期的「DORM1-WALL-SEAM」，第一次盤點用完整 ID 搜沒搜到 | 4b5a0ebd8 | 改「已整合待測試」（等 CC 同角度重拍） |
| PUTONG101-WINDOW-1102 | 待開工 | 沒有做（git log 沒有） | — | **留**（P3） |
| BAKE-PC-1102-S2 | 待開工 | 沒有做 | 96c6dd091（登記） | **留**（P2；要 PC 烘焙的結果才能比） |
| ART-OLDROAD-SHELF-1103 | 待開工 | **被取代**（10:4x 更正）：舊路書房的模型（bookstore_interior.glb）已經不用了——bookstore 區域 11-04 起是頁間書屋 v2（yejian，GG-SHOPS-REDO-1104）；WIP fc50cc3ba 改的是舊模型 | fc50cc3ba（WIP） | 改「取消／被取代」 |
| ART-GYM-POOL-SWIMMERS-1103 | 待開工 | 沒有做（src 沒有游泳動作、泳裝模型） | a7fd88082（登記） | **留**（P2） |
| GYM-FIT-PROPS-1103 | 待開工 | 部分：B1 健身中心的人在用器材（gymIK，8bc5b1207）；手上的啞鈴、槓、划船把手等道具、飛輪踏板會動還沒有 | 8bc5b1207 | **留**（只剩手持道具與器材會動） |
| ART-XINSHENG-GATE-1103 | 進行中 | 新生南路側門、店面、xinsheng 區域都在遊戲裡；北牆版側門已整合（XS-GATE-NORTH） | 74557a245、cf6a29f7e | 改「已整合待測試」 |
| SPORT-SHOPS-1103 | 待開工 | 已在遊戲裡：大步球鞋、好拍運動（dabu_layout、互動與購物 a77023704） | a77023704 | 改「已整合待測試」 |
| FASTFOOD-24H-1103 | 待開工 | 已在遊戲裡：大口漢堡一、二樓（src/dakou3d.js） | 70cd58a2d（大口夜景卡）等 | 改「已整合待測試」 |
| MODEL-HELP-1103 | 待開工 | 臨時分工，各店都已經有自己的任務 | — | 結案（被各店任務取代） |
| GG-SHOPS-REDO-1104 | 進行中 | 青木（aoki）、頁間 v2、日和便利店、慢輪單車室內都在遊戲裡 | eacaa8257、fb5d7f367 | 改「已整合待測試」（日和窗景另在 WINVIEW） |
| WZ-SECOND-1104 | 進行中 | 五間外觀 v3b 已整合（47909c659） | 47909c659 | 改「已整合待測試」 |
| WZ-FIVE-1104 | 進行中 | 五間外觀已整合；2:30 AM 第三版接進 cc0af7f14；側面窗等 AA 改室內 | 6f61ca095、cc0af7f14 | 改「已整合待測試」（側面窗另開或等 AA） |
| PERF-CAMPUS-GLB-1102 | 待開工 | 沒有做；範圍和量法還沒定 | ebd44c2e3（登記） | **留**（先量 census，再定範圍） |
| LM-SEAM-GEO | 待開工 | 一半已整合：男一舍牆接頭＝DORM1-WALL-SEAM（4b5a0ebd8）；剩萬才館柱子很細的倒角（D141：使用者沒提、不擋玩） | 4b5a0ebd8 | 留 P3（只剩萬才館倒角） |
| WZ-SEAT-CAMS-1104 | 待開工 | F13 已處理（AA 12ae10d3e）；F12（sns_ceiling 擋）和小路座位鏡頭沒做 | — | **留**（只剩 F12、小路） |
| GG-DOOR-CAMS-1104 | 待開工 | 沒有做（青木、頁間門口鏡頭被樹冠擋） | — | **留**（P2） |
| OPEN-SRC-2D3D-1104 | 進行中 | 研究已收尾（25349f5f9）；TRELLIS.2 使用者取消（UA-LAWWW2-1105-04） | 1614f8c17 | 結案 |
| XS-GATE-MOVE-1105 | 進行中 | 北牆版已整合（XS-GATE-NORTH-1105，cf6a29f7e 的 patch）；體育館一起搬了 | 7aa703cf9、cf6a29f7e | 改「已整合待測試」 |
| WINVIEW-AUDIT-1105 | 待開工 | 進行中：日和便利店交付 c16014ada（工具位置＋測試，等 CC 重拍）；其他間等 BB 判 | c16014ada | 改「進行中」 |
| SHORTCUTS-TODO-1105 | 進行中 | 長期清單，每包加 | 1c335f751 | 留進行中（長期） |
| GYM-FIT-1107 | 進行中 | ③ 運動服、體態 ART_APPROVED（D100a）；「換區域那一刻就換好」等 CC 量秒數；① 玻璃門、② 器材能用見各子任務 | b987cb1cf | 請 LAWWW 核對 ①②；③ 可以結 |
| PERF-XS-NPC-1108 | 進行中 | (A) 節流、(C) 牆一次畫完已整合（6bbfca043），畫面 PASS；等 CC／BB 正式幀率數字 | 6bbfca043 | 改「已整合待測試」 |
| QUEUE-STALE-LAWWW2-1110 | 待開工 | 這一份 | — | 交出後結案 |

## 二、已整合待測試（82 項，程式分類）

「BB 已判 PASS」那幾列，請 LAWWW 對 BB 的判定紀錄確認以後改「已驗收」；其他列都是等 CC／BB，LAWWW2 這邊沒有待做。

| 任務 ID | 現在寫的狀態 | 開發分支最後一筆提到它的 commit | 分類 | next 欄最新一段（節錄） |
|---|---|---|---|---|
| ART-NANYANG-CINEMA-1103 | 已整合待測試 | a3b18addc（2026-11-05） | BB 已判 PASS／ART_APPROVED → 可改「已驗收」（請核對） | 【11-08 12:2x LAWWW-B】BB-B 12:15：南洋 1 廳看電影 PASS（95566d0b5；19:08 關燈、23:08 開燈）。P3（BB 記著、九間一起判）：開演後柱子、天花板還是偏亮。 |
| SEATFIG-LOD1-HAIR-1104 | 已整合待測試 | 11c19219e（2026-11-04） | BB 已判 PASS／ART_APPROVED → 可改「已驗收」（請核對） | 【LAWWW-C 11-04 18:4x】LAWWW2 30c0ae20 換檔進 1eb7182b7；BB Blender 階段 PASS（BB_255 ae24b083a）；下一步 CC 用 ⑧ 同一個鏡頭重拍 |
| SKIRT-BENCH-CLIP-1105 | 已整合待測試 | a64deefda（2026-11-07） | BB 已判 PASS／ART_APPROVED → 可改「已驗收」（請核對） | 【11-07 05:4x LAWWW-B】第二批（LAWWW2-B 33bc9fe48、測試 patch 655729e66）：沛珊、芯慈、外校室友、秀琴、秀琴圍裙五個 VRM 坐下不穿模（248～645 → 0），skirt_sit_morp |
| XS-NORTH-ROAD-1107 | 已整合待測試 | e70d19503（2026-11-07） | BB 已判 PASS／ART_APPROVED → 可改「已驗收」（請核對） | 【11-07 09:1x LAWWW-B】LAWWW2 b501e871e 接進 fa79dd7bc；BB 功能 PASS、兩點 P3 交 LAWWW2；CC 遊戲內白天晚上。 |
| ADE-POLE16-1104 | 已整合待測試 | 9039f2b20（2026-11-04） | 已整合；等 CC 拍、BB 判 | 【LAWWW-C 11-04 21:5x】BB-C 21:53 同意：不擠進 v9.10.20（79da20245 是 d3828 之後的正式模型 GLB，會多帶沒在候選版測過的東西；D99 外觀不擋流程；重做候選樹至少晚 1 小時）——v |
| ADE-SEAT-CLIP-1105 | 已整合待測試 | ee7afe9c2（2026-11-05） | 已整合；等 CC 拍、BB 判 | BB 瀏覽器；v9.10.21 候選 |
| ADE-SEATS-NAV-1104 | 已整合待測試 | 6581ce7f6（2026-11-05） | 已整合；等 CC 拍、BB 判 | 【LAWWW-C 11-05 02:4x】LAWWW2-C b61050c52 接進 bea8fbbed：辦公椅 ap、S.station（阿德影印打工三段站位）；56 支 ALL PASS；CC 瀏覽器（探針三處 LAWWW2 另告 CC |
| ADE-V2-1104 | 已整合待測試 | 39c9d8b5c（2026-11-04） | 已整合；等 CC 拍、BB 判 | 【LAWWW-C 11-04 21:4x】ADE-PROPS 補件 8200806e2 接進開發分支 79da20245：正式模型 wz_props.glb 的電線桿、路燈臂也挪到 x −12.7（原本 c73d37367 只挪了套件，正式 |
| AFAR-VIEW-1105 | 已整合待測試 | f65f20f4a（2026-11-05） | 已整合；等 CC 拍、BB 判 | v9.10.21 候選；CC 拍 afar 窗外白天／晚上 |
| ANIM-DOOR-OPEN-1027 | 已整合待測試 | 4978b283a（2026-10-27） | 已整合；等 CC 拍、BB 判 | 【LAWWW-C 2026-10-28 01:1x UTC】第二階段（LAWWW2 ccc329672：門板真的轉開、門上零件跟著轉、推門 0.45 秒 busy、連按只推一次；BB-C 開門三點：118 巷「進〇〇」算門、林家乾麵開放式、 |
| ART-05 | 已整合待測試 | 635fee236（2026-10-16） | 已整合；等 CC 拍、BB 判 | BB-B 已核對（BB_131 第 9 節 b6270efc，比原預設接近標準圖）；不標 ART_APPROVED；遊戲內截圖給使用者看 |
| ART-09 | 已整合待測試 | 792946fdc（2026-10-16） | 已整合；等 CC 拍、BB 判 | 外校室友立繪 3 張已接（5ad7a862，BB-B 驗收 e8e49415）；其他 5 位（jiahao、pinyu、tangrui、weilun、xun 的表情）照 BB_131 |
| ART-ARENA-HOOPS-1105 | 已整合待測試 | 41bfc5cbe（2026-11-07） | 已整合；等 CC 拍、BB 判 | 【11-07 06:3x LAWWW-B】LAWWW2-B e92e8c517（模型 101ab2728）接進開發：3F 籃架放下來（籃框 3.05 m、籃板、主桿到屋頂）、典禮那天收起、ARENA_HOOPS 預設 true、gym_cr |
| ART-GYM1 | 已整合待測試 | d1ae8332e（2026-10-16） | 已整合；等 CC 拍、BB 判 | 1F、B1 已接；B1 v5（5a5a52af）、v6 隔間牆 WALL_ partition（a16bc93b，LAWWW2-B 53c57931；淡出照「鏡頭和玩家在不同邊」）；天花板 BackSide 拿掉（e0747682，遊戲內射 |
| ART-HAIR-MATCAP | 已整合待測試 | ad06d8756（2026-10-17） | 已整合；等 CC 拍、BB 判 | 58d0ea90 已整合在 32df2882；剩遊戲內人物近拍前後比對（阿哲、柏翰、可昕、路人）。 |
| ART-LIB-FRONT-PAVING-1103 | 已整合待測試 | 4dc6568e8（2026-11-03） | 已整合；等 CC 拍、BB 判 | BB 驗收（D128） |
| ART-NPC-40 | 已整合待測試 | cd2453bb3（2026-10-18） | 已整合；等 CC 拍、BB 判 | 【11:3x LAWWW2-C 回報：40 個 bl_npc_nf1–20／nm1–20 和開發分支逐檔 blob 相同、manifest 都在；第三批剩下的 nm10／12／14／15／20 在第四批 1b924dd4、第五批 45fa5 |
| ART-NPC-HAIR-STREAK | 已整合待測試 | 0f4d8e039（2026-10-17） | 已整合；等 CC 拍、BB 判 | 【LAWWW-C 18:2x 整合 LAWWW2-C 24923842：seated_figures.glb 第二版（12 位路人底模、外殼烤色、3.26 MB、KHR_mesh_quantization）＋classes3d.js 聽講桌 |
| ART-PS-SKIRT-HAND | 已整合待測試 | 1a76beab2（2026-10-21） | 已整合；等 CC 拍、BB 判 | 【LAWWW-C 2026-10-21 13:5x UTC】cfd0e566 手臂擺幅 patch 已套（開發分支）；膝蓋、小腿從裙子前面穿出來是另一個問題：LAWWW2 接著改 peishan_clothes.py long_skirt_ |
| ART-PT-SIS-FORMAL | 已整合待測試 | — | 已整合（git log 沒有 ID，證據看 next 欄）；等 BB | 從 art_reference/heroine05_interview.webp（ART-16，BB 已通過）切正面全身去背 → assets/portraits/heroine_05/formal/neutral.webp；頭像換出 se |
| ART-SEATFIG-1018 | 已整合待測試 | 61b22c000（2026-10-18） | 已整合；等 CC 拍、BB 判 | LAWWW2 e315997b 已整合（LOD1 頭頂重烤、vroid_npc_f1 臉暗部 0.838）；替身大小量過不是比例沒改。tools/vroid_build.py 重新產生 npc_f1 時臉的暗部要 0.838。待 BB-C  |
| ART-SHANLAN-BOOKSTORE-1103 | 已整合待測試 | 9c124e41c（2026-11-05） | 已整合；等 CC 拍、BB 判 | 【LAWWW-C 11-05 04:3x】v1 已接 9c124e41c（LAWWW2-C af845b3a5）；盆栽 L2_ 交 AA；BB／CC PC 瀏覽器 |
| ART-WZ-CAFES-1103 | 已整合待測試 | — | 已整合（git log 沒有 ID，證據看 next 欄）；等 BB | 【LAWWW-C 11-05 04:3x】LAWWW2-C 查證：木曜日（wz_mokuyobi，v3c，24 席）、日常失速（wz_offbeat，AA v3）其實早已接在開發分支（07dfffe15 上 Node 七支 ALL PASS |
| ART-YT1 | 已整合待測試 | fa9a5e3ce（2026-10-16） | 已整合；等 CC 拍、BB 判 | BB_131 第 8 節（BB-B 5c4670d2）：祐廷精修第 1 批五項通過、可以整合；三項小修是下一批 |
| ART-YU-3D-1018 | 已整合待測試 | — | 已整合（git log 沒有 ID，證據看 next 欄）；等 BB | 已整合（v9.10.1，使用者 10-18「這些也要包含」）：bl_yu.vrm＋bag_yu.glb、char_yu.diff。角色美術驗收（D100a，LAWWW）：遊戲內截圖看過（長捲髮、開襟外套、紅裙、斜背包）；BB 測遊戲內 |
| BADMINTON-CLIP-1027 | 已整合待測試 | 8197dbdb9（2026-10-27） | 已整合；等 CC 拍、BB 判 | 【LAWWW-C 2026-10-27 22:2x UTC】第二版 310543676 合進 9ac53ef1d（引拍） |
| BIKE-PARK-1104 | 已整合待測試 | ebd44c2e3（2026-11-04） | 已整合；等 CC 拍、BB 判 | 【LAWWW-C 11-04 12:4x 補進總表】LAWWW2 77a599c60 patch 已接 555b9e0cb（tests/bike_park_1104_unit.js）；BB 在使用者電腦看各出口停車架 |
| CAM-BELL-1031 | 已整合待測試 | f1b2e75c0（2026-11-01） | 已整合；等 CC 拍、BB 判 | 【LAWWW-C 11-04 13:1x】LAWWW2-C 979d5a1a8：已經在 main（a45c719e1 ⊂ b0c3032af）；BB 排使用者電腦看畫面 |
| CAM-GONGGUAN-GATE-1107 | 已整合待測試 | cc696b2d6（2026-11-07） | 已整合；等 CC 拍、BB 判 | 【11-07 19:0x LAWWW-B】改回已整合待測試：機車那一修（14f43e529）是新的、BB 直向重拍以後再驗收；原本的鏡頭方向 BB 已驗（evidence 照留）。 |
| CAM-TEAYARD-1109 | 已整合待測試 | edaedb267（2026-11-09） | 已整合；等 CC 拍、BB 判 | 【11-09 23:5x LAWWW-B】第二輪（BB-B 23:23 180° PARTIAL）：LAWWW2-B 60e5add72 → 整合 4f888cf3c：室內預設俯角 0.38＋距離 4 鏡頭在緣側屋簷裡（畫面 67% 屋簷） |
| CAM-VIEWPANE-SIDE-1109 | 已整合待測試 | 4f888cf3c（2026-11-09） | 已整合；等 CC 拍、BB 判 | 【11-09 23:3x LAWWW-B】LAWWW2-B 80abb49e1 → 整合 b8cffd669：鏡頭在店面左右範圍外藏窗景卡（阿德影印、林家乾麵、慢輪單車；其他店用模型自己的窗景卡、沒放大）；viewpane_side_uni |
| DAYBREAK-SEAT-AP-1105 | 已整合待測試 | 0acc58497（2026-11-07） | 已整合；等 CC 拍、BB 判 | 交班稽核（LAWWW-C 11-05）補登：LAWWW2 outbox 有、總表沒有；已接進開發線，待 BB 驗 |
| DORM-CEIL-1103 | 已整合待測試 | b1ae1c390（2026-11-03） | 已整合；等 CC 拍、BB 判 | BB 測 |
| DORM-DESK-ITEMS-3D-1103 | 已整合待測試 | e2c470355（2026-11-03） | 已整合；等 CC 拍、BB 判 | BB 驗收（D128） |
| DORM-LADDER-HEAD-GRIP-1102 | 已整合待測試 | dba7a4e77（2026-11-05） | 已整合；等 CC 拍、BB 判 | 【LAWWW-C 11-05 01:1x】②LAWWW2-C 42cbba73b（README adc164344）接進 e118734a3：靠床那側扶手、sleep_scene.grips／rails、光照重烘；宿舍、梯子相關 331 支 |
| DORM-LOFT-SCALE-1102 | 已整合待測試 | df1905883（2026-11-02） | 已整合；等 CC 拍、BB 判 | BB 驗 |
| DORM1-WALL-SEAM | 已整合待測試 | 4b5a0ebd8（2026-11-05） | 已整合；等 CC 拍、BB 判 | 交班稽核（LAWWW-C 11-05）補登：LAWWW2 outbox 有、總表沒有；已接進開發線，待 BB 驗 |
| FIT-3D-BODY-1027 | 已整合待測試 | e6da67e38（2026-10-27） | 已整合；等 CC 拍、BB 判 | 【LAWWW 2026-11-02】D128：主角身形這類人物外觀大改由 LAWWW 定案（不再等使用者，原寫 D111） |
| GG-FLOWER-STALL-1110 | 已整合待測試 | de1f25768（2026-11-10） | 已整合；等 CC 拍、BB 判 | 【LAWWW 11-10 10:1x】LAWWW2 9356eeb39「晨露花舖」（公館 (−47,11.6)，23k 三角形）patch 接進開發分支；LAWWW 接買花：gifthol3d.js 09:00～21:00 按「看看花攤」＝ |
| GG-SHOPS2-1104 | 已整合待測試 | 816597841（2026-11-04） | 已整合；等 CC 拍、BB 判 | 【11-07 14:3x LAWWW-B】AA-B 交洋洋店內台詞 AA_724（4bab808dd）；YANGYANG-IN-1107 子代理接區域（G05 門口、17:00～01:00、點餐＋調味兩題、look 五個、約去 19:00～ |
| GG-ZEBRA-FOG-1104 | 已整合待測試 | 9ac863212（2026-11-04） | 已整合；等 CC 拍、BB 判 | LAWWW2 305ef2d2a 已接進開發分支；BB 排 PC：校門口 15:00／20:00 前後截圖、viewFar 240 之後 gongguan_glb_integration 效能 |
| GLB-WALLDIR-1105 | 已整合待測試 | 01b3e5ac7（2026-11-05） | 已整合；等 CC 拍、BB 判 | 交班稽核（LAWWW-C 11-05）補登：LAWWW2 outbox 有、總表沒有；已接進開發線，待 BB 驗 |
| GUITAR-SHOP-ZONE-1105 | 已整合待測試 | 1344de13d（2026-11-05） | 已整合；等 CC 拍、BB 判 | 【LAWWW-C 11-05 02:1x】v2（LAWWW2-C baaef5e54）接進 2a6633a01：淺色木地板、磨石子、腰牆西牆看得到、疊面閃爍修正；482 支 ALL PASS；CC 拍 |
| GYM-ARENA-TAP-1105 | 已整合待測試 | — | 已整合（git log 沒有 ID，證據看 next 欄）；等 BB | 交班稽核（LAWWW-C 11-05）補登：LAWWW2 outbox 有、總表沒有；已接進開發線，待 BB 驗 |
| GYM-B1-PLATES-1101 | 已整合待測試 | 695dbc2b6（2026-11-01） | 已整合；等 CC 拍、BB 判 | 【LAWWW-C 11-04 13:1x】LAWWW2-C 979d5a1a8：已經在 main（82107f8b5 ⊂ b0c3032af）；BB 排使用者電腦看畫面 |
| GYM-MOVE-1105 | 已整合待測試 | 1c767edf8（2026-11-10） | 已整合；等 CC 拍、BB 判 | 【LAWWW 11-10 08:5x】LAWWW2 查證：已隨 XS-GATE-NORTH-1105 patch cf6a29f7e 進開發分支——門口座標（classes3d gym (−75,−125)、gym3d CAMPUS／gym |
| HEROINE-LIFE-NPC3D-1028 | 已整合待測試 | 8630ac32a（2026-10-28） | 已整合；等 CC 拍、BB 判 | 【LAWWW-C 2026-10-28 06:2x UTC】555186796 起 17 位已用固定路人底模在遊戲裡（不和二十位同學撞、彼此不重複）；D99 照舊：不做新的人物模型，照驗收標準走「底模＋道具」（圍裙、名牌、阿姨的繃帶…＝配件 |
| KOMICHI-VIEW-POLISH-1104 | 已整合待測試 | 6f2522a64（2026-11-04） | 已整合；等 CC 拍、BB 判 | 【LAWWW-C 11-04 22:4x】BB-C 選好了（BB_255，4b2bd7831）：①晚上路燈光圈選 A＝照現在（不加壁燈、不動遊戲世界）②斜影子照 14:00＝照現在；Blender PASS——開發分支那兩張不用再換，等 C |
| LAMPSHADE-FLIP-1104 | 已整合待測試 | 71986a5ff（2026-11-04） | 已整合；等 CC 拍、BB 判 | 【LAWWW-C 11-04 14:4x】LAWWW2 8aceeeaf4 接進 de0baeec0（wenzhou_street.glb 123,737→123,731、兩個測試 patch）；lampshade_flip、singles |
| LIB-3F-1102 | 已整合待測試 | 0f16f98a3（2026-11-03） | 已整合；等 CC 拍、BB 判 | BB 測（開發分支 0f16f98a3） |
| LIB-B1-COURT-ART-1110 | 已整合待測試 | 10df264ed（2026-11-10） | 已整合；等 CC 拍、BB 判 | 【LAWWW 11-10 09:5x】LAWWW2 第三輪 da1c77472（真正原因是門上玻璃雨遮，改單面朝下）接進開發分支；b1court_glass_cam（含畫面下半霧 1540 鏡頭 0 個）、lib_b1_court、lib_ |
| LIB-BOARD-FLOAT-1110 | 已整合待測試 | 81a2e719d（2026-11-10） | 已整合；等 CC 拍、BB 判 | 【LAWWW 11-10 08:5x】LAWWW2 查到 LAWWW-B 已修（7a019726d「總圖大廳的樓層簡介只留一塊」，library_board_float_unit），最新開發分支 ALL PASS；只差 CC 截圖 |
| LIB-INTERIOR-1102 | 已整合待測試 | 0e11c43a3（2026-11-02） | 已整合；等 CC 拍、BB 判 | 開發分支 ef63b1877 已合併（int/next1102）；BB 照 BB_246 驗收 |
| NANYANG-BENCH-SIT-1105 | 已整合待測試 | 2258988a5（2026-11-05） | 已整合；等 CC 拍、BB 判 | 交班稽核（LAWWW-C 11-05）補登：LAWWW2 outbox 有、總表沒有；已接進開發線，待 BB 驗 |
| NANYANG-HALL-WALKMESH-1105 | 已整合待測試 | — | 已整合（git log 沒有 ID，證據看 next 欄）；等 BB | 交班稽核（LAWWW-C 11-05）補登：LAWWW2 outbox 有、總表沒有；已接進開發線，待 BB 驗 |
| NPC-ANIM-LOOPS-1104 | 已整合待測試 | f5c38f2ba（2026-11-05） | 已整合；等 CC 拍、BB 判 | 【LAWWW-C 11-05 00:3x】CAFE-EDGE-1105（LAWWW2-C 58d238bdd）接進 135a1f247：桌緣 0.20 的片段 _E20、先試接近的參考桌；座位相關 45 支 ALL PASS；CC 瀏覽器看 |
| NPC-POOL-ART-1028 | 已整合待測試 | 61eed6669（2026-10-28） | 已整合；等 CC 拍、BB 判 | 【LAWWW-C 2026-10-28 04:5x UTC】已傳 LAWWW2-C；排在 X125 室內檢討之後或並行由 LAWWW2 決定 |
| OFFBEAT-CAT-BOARD-1105 | 已整合待測試 | 0aff0aa6d（2026-11-05） | 已整合；等 CC 拍、BB 判 | CC 拍日常失速的貓、佈告欄；v9.10.21 候選 |
| OFFBEAT-SEAT-AP-1105 | 已整合待測試 | — | 已整合（git log 沒有 ID，證據看 next 欄）；等 BB | CC 點 Daybreak 那 4 張各坐一次；長桌西側兩張坐下擦桌角約 0.1 m（先將就） |
| PERF-CAMPUS-DAY-1027 | 已整合待測試 | 7c1d961bd（2026-10-27） | 已整合；等 CC 拍、BB 判 | 【LAWWW-C 2026-10-27 19:1x UTC】交件 497253c6 合進開發分支（DL-LW2-X79-WARMUP）；待 BB 瀏覽器（第一次走校園卡不卡、剛進場那幾秒） |
| PERF-GG-DC-1104 | 已整合待測試 | ebd44c2e3（2026-11-04） | 已整合；等 CC 拍、BB 判 | 【LAWWW-C 11-04 12:4x 補進總表】LAWWW2 5a38bdad、742c78c50 已接（8f936f018）；公館 draw call 1.43 等 GG_glb_measure2（0f8b320ff）的 PC 結果， |
| PERF-SINGLESIDE-GLB-1025 | 已整合待測試 | e6da67e38（2026-10-27） | 已整合；等 CC 拍、BB 判 | 【LAWWW-C 2026-10-27 23:0x UTC】第七份（美國校園 us_campus，02ad9eb3d）合進開發分支 e6da67e38；七份全部交完、都在開發分支；BB 測美國校園畫面、fps |
| PERF-TEX-DEDUP-1027 | 已整合待測試 | 0b8a8f0da（2026-10-27） | 已整合；等 CC 拍、BB 判 | 【LAWWW-C 2026-10-27 21:4x UTC】0b8a8f0da 整合（合併 213d6dd7a）；BB 來回換區域看貼圖；iPhone 實機要使用者 |
| PERF-WZ-DAY-1103 | 已整合待測試 | 86e2a44c1（2026-11-07） | 已整合；等 CC 拍、BB 判 | 【11-07 13:3x LAWWW-B】溫州街主模型 10.3 MB 75bbb5186、少編 shader f6afc3ec6、FIXLIGHTS／PINPROG 實驗開關 6da721819 推了；CC 量 PERF_COLD_PER |
| PERF-ZONE-POPIN-1103 | 已整合待測試 | 8206aa67a（2026-11-03） | 已整合；等 CC 拍、BB 判 | LAWWW 先做了 GAME.enter 等正式模型（a7a97d111，zone_popin_wait_unit）→ BB 在 PC 看；LAWWW2 回來再看要不要載入遮罩 |
| SHAOLA-WIRE-1105 | 已整合待測試 | 2258988a5（2026-11-05） | 已整合；等 CC 拍、BB 判 | BB 瀏覽器；v9.10.21 候選 |
| SHOP-WINDOW-2D-1105 | 已整合待測試 | 737db65d5（2026-11-07） | 已整合；等 CC 拍、BB 判 | 【11-07 07:2x LAWWW-B】第二版（LAWWW2 e9b8fe9ba：店內顏色回來、NOSHADOW_、三角形 158,124→155,087）接進 737db65d5，第一版的驗收（BB 判換新版）改成第二版要再判：BB 判 |
| SIT-HEIGHT-1104 | 已整合待測試 | f5c38f2ba（2026-11-05） | 已整合；等 CC 拍、BB 判 | 【LAWWW-C 11-05 00:3x】全部 Node 在 71ba5870e：1007 支 ALL PASS（bookstore_exit 印 ALL PASS、最後一行是非同步警告，照舊） |
| SOCLIB-2F-1104 | 已整合待測試 | effb5d9b3（2026-11-04） | 已整合；等 CC 拍、BB 判 | 【LAWWW-C 11-04 18:2x】合併 f8d17bfb7（子代理 soclib2f-1104 e21e87610）：LAWWW2 d393b6f3c 的檔案逐檔帶進＋接線 patch（直接套得上）；新檔 src/soclib2f_ |
| STAIR-TAP-TILT-1105 | 已整合待測試 | — | 已整合（git log 沒有 ID，證據看 next 欄）；等 BB | 交班稽核（LAWWW-C 11-05）補登：LAWWW2 outbox 有、總表沒有；已接進開發線，待 BB 驗 |
| TEA-SUNKEN-TAP-1105 | 已整合待測試 | — | 已整合（git log 沒有 ID，證據看 next 欄）；等 BB | 交班稽核（LAWWW-C 11-05）補登：LAWWW2 outbox 有、總表沒有；已接進開發線，待 BB 驗 |
| TEACH-EAST-DRAWCALL-1104 | 已整合待測試 | 1f9a92ec1（2026-11-04） | 已整合；等 CC 拍、BB 判 | 【LAWWW-C 11-04 21:2x】接進開發分支（GLB×2、JSON×2、tests/teach_east_drawcall_unit.js、README＋比較圖（只有 Blender 渲染）、campus_teach.py、lib |
| TEACH-PTBOYA-REF-1104 | 已整合待測試 | df1ffaa40（2026-11-04） | 已整合；等 CC 拍、BB 判 | 【LAWWW-C 11-04 16:3x】v2b（LAWWW2 9be98513b）接進開發分支：博雅雨遮的天窗洞改成一排五個小方形天窗（D136，BB-C 16:3x）；只換 campus_boya.glb／.json＋README、pt |
| TONGXIAN-REF-1105 | 已整合待測試 | 650fb8c1b（2026-11-05） | 已整合；等 CC 拍、BB 判 | 【LAWWW-C 11-05 03:3x】v4f（308b5c025，BB-C 03:21 MODEL_READY）接進 cc0af7f14 |
| XINSHENG-SIDE-1103 | 已整合待測試 | — | 已整合（git log 沒有 ID，證據看 next 欄）；等 BB | 已整合 aa8cb5beb（側門 (−124,−84)、溫州街西側橫巷北口 (−33.4,−28.4)）；街景仍 BLOCKOUT，立面 bldg.xinsheng_street 等 LAWWW2；瀏覽器測試派 BB（D131 PC） |
| XS-ARCADE-NAV-1105 | 已整合待測試 | a3b18addc（2026-11-05） | 已整合；等 CC 拍、BB 判 | 交班稽核（LAWWW-C 11-05）補登：LAWWW2 outbox 有、總表沒有；已接進開發線，待 BB 驗 |
| XS-FARVIEW-1105 | 已整合待測試 | c8b09bcf0（2026-11-07） | 已整合；等 CC 拍、BB 判 | 【11-07 09:1x LAWWW-B】LAWWW2 07deb7085／567b76230 接進 c8b09bcf0（xinsheng_far.glb、xinsheng3d.js 延伸到 ±178、engine3d noSkylineC |
| XS-GATE-NORTH-1105 | 已整合待測試 | b92a2791e（2026-11-05） | 已整合；等 CC 拍、BB 判 | 交班稽核（LAWWW-C 11-05）補登：LAWWW2 outbox 有、總表沒有；已接進開發線，待 BB 驗 |
| XS-NORTH-EXT-1105 | 已整合待測試 | fa05ed8c5（2026-11-07） | 已整合；等 CC 拍、BB 判 | 使用者 11-05 10:0x「你去台大官網找新月台照片 新體育館照片!!!!」（UA-LAWWW2-1105-08）；LAWWW2 c6837632e 接進開發線 abf4dbbd5（MODEL_READY）；BB 排 CC 拍、D120 |
| XS-SHOPS-REST-1105 | 已整合待測試 | c5d762fcc（2026-11-05） | 已整合；等 CC 拍、BB 判 | 交班稽核（LAWWW-C 11-05）補登：LAWWW2 outbox 有、總表沒有；已接進開發線，待 BB 驗 |
| XS-SPORTS-V1-1105 | 已整合待測試 | — | 已整合（git log 沒有 ID，證據看 next 欄）；等 BB | 交班稽核（LAWWW-C 11-05）補登：LAWWW2 outbox 有、總表沒有；已接進開發線，待 BB 驗 |
| XS-WINCARD-1105 | 已整合待測試 | abf4dbbd5（2026-11-05） | 已整合；等 CC 拍、BB 判 | 交班稽核（LAWWW-C 11-05）補登：LAWWW2 outbox 有、總表沒有；已接進開發線，待 BB 驗 |

## 三、等待其他AI／素材、暫停（75 項，程式分類）

| 任務 ID | 現在寫的狀態 | 開發分支最後一筆提到它的 commit | 分類 | next 欄最新一段（節錄） |
|---|---|---|---|---|
| ART-JIAHAO-JOY | 暫停 | 7145e5cd8（2026-11-01） | 暫停照舊 | LAWWW2 有空時（BB-C：遊戲距離看不出來） |
| ART-PLAYER-SEASON-OUTFIT-1024 | 暫停 | 0d3125c88（2026-10-24） | 暫停照舊 | 暫停到 D99 三項驗收完；之後由 LAWWW2 提做法（換衣服的時機、存檔欄位） |
| BADMINTON-CLIP-V4-1102 | 暫停 | — | 暫停照舊 | 【LAWWW（帳號 A）04:4x 登記】5～10h |
| CHAR-TEMPLATE | 暫停 | d6c74f628（2026-11-04） | 暫停照舊 | 【LAWWW-C 11-04 13:48】ASK-USER-LIST 清查：不等使用者；LAWWW 決定等 HAIR-NOODLE-1104 查出頭髮原因以後，一起評估人物模板（D99 凍結照舊，使用者點名的問題不受凍結限制） |
| HDRI-ENV-1104 | 暫停 | 1614f8c17（2026-11-04） | 暫停照舊 | 【LAWWW-C 11-04 21:3x】暫停（五欄見 pausedReason／resumeWhen／nextCheck；負責人 LAWWW2 做對照、LAWWW 接引擎） |
| NPC-POOL-ART-REST-1102 | 暫停 | — | 暫停照舊 | 【LAWWW（帳號 A）04:4x 登記】2～5h |
| TEST-OFFLOAD-1102 | 暫停 | ffa88fcf0（2026-11-02） | 暫停照舊 | 【LAWWW-C 11-04 13:48】ASK-USER-LIST 清查：不等使用者；請 BB／CC 確認 runner 已支援 LAWWW2 分支、可以結案 |
| ART-02 | 等待其他AI／素材 | b72960bfc（2026-10-21） | 已整合；等 BB 判場景美術（D120），不是 LAWWW2 待做 | 【LAWWW-C 2026-10-27 19:0x UTC】BB-C 10-27 盤點（BB_INTEGRATED_TRIAGE_1027，BB 分支 claude/wonderful-mayer-7fm9g6 8f1315a7c） D 類 |
| ART-10 | 等待其他AI／素材 | 0e2ca42d4（2026-11-04） | 已整合；等 BB 判場景美術（D120），不是 LAWWW2 待做 | 【LAWWW-C 11-04 14:08】併進 BB 的 ART 驗收（BB-C 13:54） |
| ART-11 | 等待其他AI／素材 | 10df264ed（2026-11-10） | 已整合；等 BB 判場景美術（D120），不是 LAWWW2 待做 | 【LAWWW-C 2026-10-27 19:0x UTC】BB-C 10-27 盤點（BB_INTEGRATED_TRIAGE_1027，BB 分支 claude/wonderful-mayer-7fm9g6 8f1315a7c） D 類 |
| ART-12 | 等待其他AI／素材 | 030c51b0b（2026-10-16） | 已整合；等 BB 判場景美術（D120），不是 LAWWW2 待做 | 【LAWWW-C 2026-10-27 19:0x UTC】BB-C 10-27 盤點（BB_INTEGRATED_TRIAGE_1027，BB 分支 claude/wonderful-mayer-7fm9g6 8f1315a7c） D 類 |
| ART-BG-COURT | 等待其他AI／素材 | adbcb8c4c（2026-10-16） | 已整合；等 BB 判場景美術（D120），不是 LAWWW2 待做 | 【LAWWW-C 2026-10-27 19:0x UTC】BB-C 10-27 盤點（BB_INTEGRATED_TRIAGE_1027，BB 分支 claude/wonderful-mayer-7fm9g6 8f1315a7c） D 類 |
| ART-BG02 | 等待其他AI／素材 | 920948958（2026-10-16） | 已整合；等 BB 判場景美術（D120），不是 LAWWW2 待做 | 【LAWWW-C 2026-10-27 19:0x UTC】BB-C 10-27 盤點（BB_INTEGRATED_TRIAGE_1027，BB 分支 claude/wonderful-mayer-7fm9g6 8f1315a7c） D 類 |
| ART-BG05 | 等待其他AI／素材 | 030c51b0b（2026-10-16） | 已整合；等 BB 判場景美術（D120），不是 LAWWW2 待做 | 【LAWWW-C 2026-10-27 19:0x UTC】BB-C 10-27 盤點（BB_INTEGRATED_TRIAGE_1027，BB 分支 claude/wonderful-mayer-7fm9g6 8f1315a7c） D 類 |
| ART-BG08 | 等待其他AI／素材 | 89e254a1d（2026-10-17） | 已整合；等 BB 判場景美術（D120），不是 LAWWW2 待做 | 【LAWWW-C 11-04 13:48】ASK-USER-LIST 清查：不是等使用者——D120／D128 起場景美術 ART_APPROVED 由 BB 標；請 BB 照 D120（參考、修改前後遊戲截圖、手機模擬、缺點）驗收，標了  |
| ART-BG11 | 等待其他AI／素材 | — | 已整合；等 BB 判場景美術（D120），不是 LAWWW2 待做 | 【LAWWW-C 2026-10-27 19:0x UTC】BB-C 10-27 盤點（BB_INTEGRATED_TRIAGE_1027，BB 分支 claude/wonderful-mayer-7fm9g6 8f1315a7c） D 類 |
| ART-BG13 | 等待其他AI／素材 | 635fee236（2026-10-16） | 已整合；等 BB 判場景美術（D120），不是 LAWWW2 待做 | 【LAWWW-C 2026-10-27 19:0x UTC】BB-C 10-27 盤點（BB_INTEGRATED_TRIAGE_1027，BB 分支 claude/wonderful-mayer-7fm9g6 8f1315a7c） D 類 |
| ART-BG14 | 等待其他AI／素材 | c545075d2（2026-10-21） | 已整合；等 BB 判場景美術（D120），不是 LAWWW2 待做 | 【LAWWW-C 2026-10-27 19:0x UTC】BB-C 10-27 盤點（BB_INTEGRATED_TRIAGE_1027，BB 分支 claude/wonderful-mayer-7fm9g6 8f1315a7c） D 類 |
| ART-BG15 | 等待其他AI／素材 | — | 已整合；等 BB 判場景美術（D120），不是 LAWWW2 待做 | 【LAWWW-C 2026-10-27 19:0x UTC】BB-C 10-27 盤點（BB_INTEGRATED_TRIAGE_1027，BB 分支 claude/wonderful-mayer-7fm9g6 8f1315a7c） D 類 |
| ART-BG16 | 等待其他AI／素材 | 0402040bb（2026-10-17） | 已整合；等 BB 判場景美術（D120），不是 LAWWW2 待做 | 【LAWWW-C 11-04 13:48】ASK-USER-LIST 清查：不是等使用者——D120／D128 起場景美術 ART_APPROVED 由 BB 標；請 BB 照 D120（參考、修改前後遊戲截圖、手機模擬、缺點）驗收，標了  |
| ART-BG17 | 等待其他AI／素材 | — | 已整合；等 BB 判場景美術（D120），不是 LAWWW2 待做 | 【LAWWW-C 11-04 13:48】ASK-USER-LIST 清查：不是等使用者——D120／D128 起場景美術 ART_APPROVED 由 BB 標；請 BB 照 D120（參考、修改前後遊戲截圖、手機模擬、缺點）驗收，標了  |
| ART-BG18 | 等待其他AI／素材 | 5ec6a388f（2026-10-16） | 已整合；等 BB 判場景美術（D120），不是 LAWWW2 待做 | 【LAWWW-C 2026-10-27 19:0x UTC】BB-C 10-27 盤點（BB_INTEGRATED_TRIAGE_1027，BB 分支 claude/wonderful-mayer-7fm9g6 8f1315a7c） D 類 |
| ART-BG19 | 等待其他AI／素材 | c545075d2（2026-10-21） | 已整合；等 BB 判場景美術（D120），不是 LAWWW2 待做 | 【LAWWW-C 2026-10-27 19:0x UTC】BB-C 10-27 盤點（BB_INTEGRATED_TRIAGE_1027，BB 分支 claude/wonderful-mayer-7fm9g6 8f1315a7c） D 類 |
| ART-BG20 | 等待其他AI／素材 | — | 已整合；等 BB 判場景美術（D120），不是 LAWWW2 待做 | 【LAWWW-C 2026-10-27 19:0x UTC】BB-C 10-27 盤點（BB_INTEGRATED_TRIAGE_1027，BB 分支 claude/wonderful-mayer-7fm9g6 8f1315a7c） D 類 |
| ART-BIKES2-F | 等待其他AI／素材 | — | 已整合；等 BB 判場景美術（D120），不是 LAWWW2 待做 | 【LAWWW-C 2026-10-27 19:0x UTC】BB-C 10-27 盤點（BB_INTEGRATED_TRIAGE_1027，BB 分支 claude/wonderful-mayer-7fm9g6 8f1315a7c） D 類 |
| ART-CAFE-FLOOR | 等待其他AI／素材 | 2d1e264ca（2026-10-16） | 已整合；等 BB 判場景美術（D120），不是 LAWWW2 待做 | 【LAWWW-C 2026-10-27 19:0x UTC】BB-C 10-27 盤點（BB_INTEGRATED_TRIAGE_1027，BB 分支 claude/wonderful-mayer-7fm9g6 8f1315a7c） D 類 |
| ART-DORM-LOFT | 等待其他AI／素材 | 69e744608（2026-10-17） | 已整合；等 BB 判場景美術（D120），不是 LAWWW2 待做 | 【LAWWW-C 11-04 13:48】ASK-USER-LIST 清查：不是等使用者——D120／D128 起場景美術 ART_APPROVED 由 BB 標；請 BB 照 D120（參考、修改前後遊戲截圖、手機模擬、缺點）驗收，標了  |
| ART-DORM-LOUNGE-1021 | 等待其他AI／素材 | f23362955（2026-10-22） | 已整合；等 BB 判場景美術（D120），不是 LAWWW2 待做 | 【LAWWW-C 2026-10-27 19:0x UTC】BB-C 10-27 盤點（BB_INTEGRATED_TRIAGE_1027，BB 分支 claude/wonderful-mayer-7fm9g6 8f1315a7c） D 類 |
| ART-EXT-GATE | 等待其他AI／素材 | 20b1631a4（2026-10-18） | 已整合；等 BB 判場景美術（D120），不是 LAWWW2 待做 | 【LAWWW-C 2026-10-27 19:0x UTC】BB-C 10-27 盤點（BB_INTEGRATED_TRIAGE_1027，BB 分支 claude/wonderful-mayer-7fm9g6 8f1315a7c） D 類 |
| ART-EXT-M1 | 等待其他AI／素材 | 4146a2edb（2026-10-18） | 已整合；等 BB 判場景美術（D120），不是 LAWWW2 待做 | 【LAWWW-C 2026-10-27 19:0x UTC】BB-C 10-27 盤點（BB_INTEGRATED_TRIAGE_1027，BB 分支 claude/wonderful-mayer-7fm9g6 8f1315a7c） D 類 |
| ART-EXT-MRT | 等待其他AI／素材 | 3500146c4（2026-10-18） | 已整合；等 BB 判場景美術（D120），不是 LAWWW2 待做 | 【LAWWW-C 2026-10-27 19:0x UTC】BB-C 10-27 盤點（BB_INTEGRATED_TRIAGE_1027，BB 分支 claude/wonderful-mayer-7fm9g6 8f1315a7c） D 類 |
| ART-EXT-TEACH | 等待其他AI／素材 | 2cd8825fc（2026-10-18） | 已整合；等 BB 判場景美術（D120），不是 LAWWW2 待做 | 【LAWWW-C 2026-10-27 19:0x UTC】BB-C 10-27 盤點（BB_INTEGRATED_TRIAGE_1027，BB 分支 claude/wonderful-mayer-7fm9g6 8f1315a7c） D 類 |
| ART-GG-FACADE-3D-1023 | 等待其他AI／素材 | 6b2827942（2026-10-23） | 已整合；等 BB 判場景美術（D120），不是 LAWWW2 待做 | 【LAWWW-C 2026-10-27 19:0x UTC】BB-C 10-27 盤點（BB_INTEGRATED_TRIAGE_1027，BB 分支 claude/wonderful-mayer-7fm9g6 8f1315a7c） D 類 |
| ART-GG-SHOPS-1018 | 等待其他AI／素材 | — | 已整合；等 BB 判場景美術（D120），不是 LAWWW2 待做 | 【LAWWW-C 2026-10-27 19:0x UTC】BB-C 10-27 盤點（BB_INTEGRATED_TRIAGE_1027，BB 分支 claude/wonderful-mayer-7fm9g6 8f1315a7c） D 類 |
| ART-GG-SIGNS | 等待其他AI／素材 | de14b32b4（2026-10-17） | 已整合；等 BB 判場景美術（D120），不是 LAWWW2 待做 | 【LAWWW-C 2026-10-27 19:0x UTC】BB-C 10-27 盤點（BB_INTEGRATED_TRIAGE_1027，BB 分支 claude/wonderful-mayer-7fm9g6 8f1315a7c） D 類 |
| ART-GG-STREETLIFE-1023 | 等待其他AI／素材 | 85ddeeef4（2026-10-23） | 已整合；等 BB 判場景美術（D120），不是 LAWWW2 待做 | 【LAWWW-C 2026-10-27 19:0x UTC】BB-C 10-27 盤點（BB_INTEGRATED_TRIAGE_1027，BB 分支 claude/wonderful-mayer-7fm9g6 8f1315a7c） D 類 |
| ART-GYM-BG1 | 等待其他AI／素材 | 0c5a9acce（2026-10-17） | 已整合；等 BB 判場景美術（D120），不是 LAWWW2 待做 | 【LAWWW-C 11-04 13:48】ASK-USER-LIST 清查：不是等使用者——D120／D128 起場景美術 ART_APPROVED 由 BB 標；請 BB 照 D120（參考、修改前後遊戲截圖、手機模擬、缺點）驗收，標了  |
| ART-GYM2-INT | 等待其他AI／素材 | 108f601e4（2026-10-21） | 已整合；等 BB 判場景美術（D120），不是 LAWWW2 待做 | 【LAWWW-C 2026-10-27 19:0x UTC】BB-C 10-27 盤點（BB_INTEGRATED_TRIAGE_1027，BB 分支 claude/wonderful-mayer-7fm9g6 8f1315a7c） D 類 |
| ART-HALL-WINDOW-DUSK-1025 | 等待其他AI／素材 | 1dacc06af（2026-10-25） | 已整合；等 BB 判場景美術（D120），不是 LAWWW2 待做 | 【LAWWW-C 2026-10-27 19:0x UTC】BB-C 10-27 盤點（BB_INTEGRATED_TRIAGE_1027，BB 分支 claude/wonderful-mayer-7fm9g6 8f1315a7c） D 類 |
| ART-L118-FACADE-3D-1023 | 等待其他AI／素材 | 6b2827942（2026-10-23） | 已整合；等 BB 判場景美術（D120），不是 LAWWW2 待做 | 【LAWWW-C 2026-10-27 19:0x UTC】BB-C 10-27 盤點（BB_INTEGRATED_TRIAGE_1027，BB 分支 claude/wonderful-mayer-7fm9g6 8f1315a7c） D 類 |
| ART-L118-LANE-1020 | 等待其他AI／素材 | a53089fe8（2026-10-20） | 已整合；等 BB 判場景美術（D120），不是 LAWWW2 待做 | 【LAWWW-C 2026-10-27 19:0x UTC】BB-C 10-27 盤點（BB_INTEGRATED_TRIAGE_1027，BB 分支 claude/wonderful-mayer-7fm9g6 8f1315a7c） D 類 |
| ART-LIB-VIEW-1018 | 等待其他AI／素材 | a18022958（2026-10-18） | 已整合；等 BB 判場景美術（D120），不是 LAWWW2 待做 | 【LAWWW-C 2026-10-27 19:0x UTC】BB-C 10-27 盤點（BB_INTEGRATED_TRIAGE_1027，BB 分支 claude/wonderful-mayer-7fm9g6 8f1315a7c） D 類 |
| ART-ROOM-LIFE-1020 | 等待其他AI／素材 | 76cf1bd85（2026-10-21） | 已整合；等 BB 判場景美術（D120），不是 LAWWW2 待做 | 【LAWWW-C 2026-10-27 19:0x UTC】BB-C 10-27 盤點（BB_INTEGRATED_TRIAGE_1027，BB 分支 claude/wonderful-mayer-7fm9g6 8f1315a7c） D 類 |
| ART-ROOM-MULTI-1020 | 等待其他AI／素材 | 76cf1bd85（2026-10-21） | 已整合；等 BB 判場景美術（D120），不是 LAWWW2 待做 | 【LAWWW-C 2026-10-27 19:0x UTC】BB-C 10-27 盤點（BB_INTEGRATED_TRIAGE_1027，BB 分支 claude/wonderful-mayer-7fm9g6 8f1315a7c） D 類 |
| ART-SHOP-VIEWS-1023 | 等待其他AI／素材 | b57a2a79c（2026-10-23） | 已整合；等 BB 判場景美術（D120），不是 LAWWW2 待做 | 【LAWWW-C 2026-10-27 19:0x UTC】BB-C 10-27 盤點（BB_INTEGRATED_TRIAGE_1027，BB 分支 claude/wonderful-mayer-7fm9g6 8f1315a7c） D 類 |
| ART-TONE-NEUTRAL-1022 | 等待其他AI／素材 | — | 已整合；等 BB 判場景美術（D120），不是 LAWWW2 待做 | 【LAWWW-C 2026-10-27 19:0x UTC】BB-C 10-27 盤點（BB_INTEGRATED_TRIAGE_1027，BB 分支 claude/wonderful-mayer-7fm9g6 8f1315a7c） D 類 |
| ART-TUTOR1 | 等待其他AI／素材 | cc36d3999（2026-10-16） | 已整合；等 BB 判場景美術（D120），不是 LAWWW2 待做 | 【LAWWW-C 2026-10-27 19:0x UTC】BB-C 10-27 盤點（BB_INTEGRATED_TRIAGE_1027，BB 分支 claude/wonderful-mayer-7fm9g6 8f1315a7c） D 類 |
| ART-US-ROUTE-1024 | 等待其他AI／素材 | 7770155b4（2026-10-24） | 已整合；等 BB 判場景美術（D120），不是 LAWWW2 待做 | 【LAWWW-C 2026-10-27 19:0x UTC】BB-C 10-27 盤點（BB_INTEGRATED_TRIAGE_1027，BB 分支 claude/wonderful-mayer-7fm9g6 8f1315a7c） D 類 |
| ART-US-SEASON | 等待其他AI／素材 | 974ab8a00（2026-10-18） | 已整合；等 BB 判場景美術（D120），不是 LAWWW2 待做 | 【LAWWW-C 2026-10-27 19:0x UTC】BB-C 10-27 盤點（BB_INTEGRATED_TRIAGE_1027，BB 分支 claude/wonderful-mayer-7fm9g6 8f1315a7c） D 類 |
| ART-US1 | 等待其他AI／素材 | cc36d3999（2026-10-16） | 已整合；等 BB 判場景美術（D120），不是 LAWWW2 待做 | 【LAWWW-C 2026-10-27 19:0x UTC】BB-C 10-27 盤點（BB_INTEGRATED_TRIAGE_1027，BB 分支 claude/wonderful-mayer-7fm9g6 8f1315a7c） D 類 |
| ART-US2 | 等待其他AI／素材 | 656254551（2026-10-21） | 已整合；等 BB 判場景美術（D120），不是 LAWWW2 待做 | 【LAWWW-C 2026-10-27 19:0x UTC】BB-C 10-27 盤點（BB_INTEGRATED_TRIAGE_1027，BB 分支 claude/wonderful-mayer-7fm9g6 8f1315a7c） D 類 |
| ART-US3 | 等待其他AI／素材 | 147c573ef（2026-10-16） | 已整合；等 BB 判場景美術（D120），不是 LAWWW2 待做 | 【LAWWW-C 2026-10-27 19:0x UTC】BB-C 10-27 盤點（BB_INTEGRATED_TRIAGE_1027，BB 分支 claude/wonderful-mayer-7fm9g6 8f1315a7c） D 類 |
| ART-V0-DORM | 等待其他AI／素材 | 907a92927（2026-10-17） | 已整合；等 BB 判場景美術（D120），不是 LAWWW2 待做 | 【LAWWW-C 2026-10-27 19:0x UTC】BB-C 10-27 盤點（BB_INTEGRATED_TRIAGE_1027，BB 分支 claude/wonderful-mayer-7fm9g6 8f1315a7c） D 類 |
| ART-VAC-AIRPORT-1021 | 等待其他AI／素材 | 7da537dc4（2026-10-22） | 已整合；等 BB 判場景美術（D120），不是 LAWWW2 待做 | 【LAWWW-C 2026-10-27 19:0x UTC】BB-C 10-27 盤點（BB_INTEGRATED_TRIAGE_1027，BB 分支 claude/wonderful-mayer-7fm9g6 8f1315a7c） D 類 |
| ART-WZ-MARKET-1023 | 等待其他AI／素材 | 257e403a6（2026-10-24） | 已整合；等 BB 判場景美術（D120），不是 LAWWW2 待做 | 【LAWWW-C 2026-10-27 19:0x UTC】BB-C 10-27 盤點（BB_INTEGRATED_TRIAGE_1027，BB 分支 claude/wonderful-mayer-7fm9g6 8f1315a7c） D 類 |
| ART-WZ0 | 等待其他AI／素材 | 2a56436b2（2026-11-04） | 已整合；等 BB 判場景美術（D120），不是 LAWWW2 待做 | 【LAWWW-C 2026-10-27 19:0x UTC】BB-C 10-27 盤點（BB_INTEGRATED_TRIAGE_1027，BB 分支 claude/wonderful-mayer-7fm9g6 8f1315a7c） D 類 |
| ART-WZ1 | 等待其他AI／素材 | 0ecf57db4（2026-10-16） | 已整合；等 BB 判場景美術（D120），不是 LAWWW2 待做 | 【LAWWW-C 2026-10-27 19:0x UTC】BB-C 10-27 盤點（BB_INTEGRATED_TRIAGE_1027，BB 分支 claude/wonderful-mayer-7fm9g6 8f1315a7c） D 類 |
| ART-WZ3 | 等待其他AI／素材 | e2918edcc（2026-10-16） | 已整合；等 BB 判場景美術（D120），不是 LAWWW2 待做 | 【LAWWW-C 2026-10-27 19:0x UTC】BB-C 10-27 盤點（BB_INTEGRATED_TRIAGE_1027，BB 分支 claude/wonderful-mayer-7fm9g6 8f1315a7c） D 類 |
| ART-WZ4 | 等待其他AI／素材 | b3c5828bd（2026-10-16） | 已整合；等 BB 判場景美術（D120），不是 LAWWW2 待做 | 【LAWWW-C 2026-10-27 19:0x UTC】BB-C 10-27 盤點（BB_INTEGRATED_TRIAGE_1027，BB 分支 claude/wonderful-mayer-7fm9g6 8f1315a7c） D 類 |
| ART-WZ5 | 等待其他AI／素材 | 0050847b1（2026-10-16） | 已整合；等 BB 判場景美術（D120），不是 LAWWW2 待做 | 【LAWWW-C 2026-10-27 19:0x UTC】BB-C 10-27 盤點（BB_INTEGRATED_TRIAGE_1027，BB 分支 claude/wonderful-mayer-7fm9g6 8f1315a7c） D 類 |
| ART-WZ7 | 等待其他AI／素材 | f23362955（2026-10-22） | 已整合；等 BB 判場景美術（D120），不是 LAWWW2 待做 | 【LAWWW-C 2026-10-27 19:0x UTC】BB-C 10-27 盤點（BB_INTEGRATED_TRIAGE_1027，BB 分支 claude/wonderful-mayer-7fm9g6 8f1315a7c） D 類 |
| BUG-CAFE-FLOOR-MIRROR-1021 | 等待其他AI／素材 | 80b51065b（2026-10-21） | 已整合；等 BB 判場景美術（D120），不是 LAWWW2 待做 | 【LAWWW-C 2026-10-27 19:0x UTC】BB-C 10-27 盤點（BB_INTEGRATED_TRIAGE_1027，BB 分支 claude/wonderful-mayer-7fm9g6 8f1315a7c） D 類 |
| BUG-WZFLICKER-2 | 等待其他AI／素材 | 0f430885d（2026-10-20） | 已整合；等 BB 判場景美術（D120），不是 LAWWW2 待做 | 【LAWWW-C 2026-10-27 19:0x UTC】BB-C 10-27 盤點（BB_INTEGRATED_TRIAGE_1027，BB 分支 claude/wonderful-mayer-7fm9g6 8f1315a7c） D 類 |
| GG-STREETVIEW-1020 | 等待其他AI／素材 | 0582af9fc（2026-10-20） | 已整合；等 BB 判場景美術（D120），不是 LAWWW2 待做 | 【LAWWW-C 2026-10-27 19:0x UTC】BB-C 10-27 盤點（BB_INTEGRATED_TRIAGE_1027，BB 分支 claude/wonderful-mayer-7fm9g6 8f1315a7c） D 類 |
| GG-VIEWS-1104 | 等待其他AI／素材 | 530a72ff4（2026-11-04） | 等待照舊 | 【LAWWW-C 11-04 22:5x】A_shots_script.patch 進開發分支 530a72ff4（只改拍照腳本）；send_message BB-C 排 PC 拍（cc-local）；照片回來以後 LAWWW 填 VIEW |
| GRADE-GOLDEN-DEFAULT | 等待其他AI／素材 | 6d49e79cd（2026-10-21） | 已整合；等 BB 判場景美術（D120），不是 LAWWW2 待做 | 【LAWWW-C 2026-10-27 19:0x UTC】BB-C 10-27 盤點（BB_INTEGRATED_TRIAGE_1027，BB 分支 claude/wonderful-mayer-7fm9g6 8f1315a7c） D 類 |
| SCN-US-01 | 等待其他AI／素材 | 5d9a2b4d2（2026-10-17） | 已整合；等 BB 判場景美術（D120），不是 LAWWW2 待做 | 【LAWWW-C 2026-10-27 19:0x UTC】BB-C 10-27 盤點（BB_INTEGRATED_TRIAGE_1027，BB 分支 claude/wonderful-mayer-7fm9g6 8f1315a7c） D 類 |
| SCN-US-02 | 等待其他AI／素材 | 6447f72fd（2026-10-18） | 已整合；等 BB 判場景美術（D120），不是 LAWWW2 待做 | 【LAWWW-C 2026-10-27 19:0x UTC】BB-C 10-27 盤點（BB_INTEGRATED_TRIAGE_1027，BB 分支 claude/wonderful-mayer-7fm9g6 8f1315a7c） D 類 |
| SCN-US-03 | 等待其他AI／素材 | 725c684a7（2026-10-17） | 已整合；等 BB 判場景美術（D120），不是 LAWWW2 待做 | 【LAWWW-C 2026-10-27 19:0x UTC】BB-C 10-27 盤點（BB_INTEGRATED_TRIAGE_1027，BB 分支 claude/wonderful-mayer-7fm9g6 8f1315a7c） D 類 |
| SCN-US-IU-1018 | 等待其他AI／素材 | bc836883e（2026-10-18） | 已整合；等 BB 判場景美術（D120），不是 LAWWW2 待做 | 【LAWWW-C 2026-10-27 19:0x UTC】BB-C 10-27 盤點（BB_INTEGRATED_TRIAGE_1027，BB 分支 claude/wonderful-mayer-7fm9g6 8f1315a7c） D 類 |
| SCN-US-LIB | 等待其他AI／素材 | bf99b3b3f（2026-10-18） | 已整合；等 BB 判場景美術（D120），不是 LAWWW2 待做 | 【LAWWW-C 2026-10-27 19:0x UTC】BB-C 10-27 盤點（BB_INTEGRATED_TRIAGE_1027，BB 分支 claude/wonderful-mayer-7fm9g6 8f1315a7c） D 類 |
| US-MS-NIGHT-1021 | 等待其他AI／素材 | 7da537dc4（2026-10-22） | 已整合；等 BB 判場景美術（D120），不是 LAWWW2 待做 | 【LAWWW-C 2026-10-27 19:0x UTC】BB-C 10-27 盤點（BB_INTEGRATED_TRIAGE_1027，BB 分支 claude/wonderful-mayer-7fm9g6 8f1315a7c） D 類 |
| V0-ART-DORM | 等待其他AI／素材 | d0e02c7f1（2026-10-16） | 已整合；等 BB 判場景美術（D120），不是 LAWWW2 待做 | 【LAWWW-C 2026-10-27 19:0x UTC】BB-C 10-27 盤點（BB_INTEGRATED_TRIAGE_1027，BB 分支 claude/wonderful-mayer-7fm9g6 8f1315a7c） D 類 |
| WZ-SHOP-AA364-ART | 等待其他AI／素材 | f23362955（2026-10-22） | 已整合；等 BB 判場景美術（D120），不是 LAWWW2 待做 | 【LAWWW-C 2026-10-27 19:0x UTC】BB-C 10-27 盤點（BB_INTEGRATED_TRIAGE_1027，BB 分支 claude/wonderful-mayer-7fm9g6 8f1315a7c） D 類 |
| ZQ-C504-LAPTOP-1101 | 等待其他AI／素材 | — | 等待照舊 | 【11-01 21:3x LAWWW-B】判斷：現在不做（沒有座位）；程式已支援（prop＋沒座位退回站著），只差咖啡店座位 |

## 沒有核對的
- 第二、三節沒有逐項打開 BB 的判定檔（BB 分支的 BB_* 紀錄）。「等 BB」是照 next 欄判斷的。
- 「git log 沒有 ID」的 10 項：證據寫在 next 欄（整合時沒有把 ID 寫進 commit 訊息），不代表沒整合。
