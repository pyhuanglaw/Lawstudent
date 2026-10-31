# HISTORY-AUDIT-1031｜LAWWW2-B 美術複核摘要

LAWWW2-B，2026-10-31 19:47～20:1x UTC。唯讀：`git fetch --unshallow`、`git show`、`git log`、`git ls-tree`、`git grep`；沒有 commit、push、checkout，沒有跑瀏覽器或 Blender。
基準：開發分支 `origin/claude/modest-rubin-2lyp7g` c97f25fd0、`origin/main` 271cd2305（v9.10.14）、BB 紀錄 `BB_218_瀏覽器實測紀錄.md`（elegant-brown-fcos7n@d12d567be，以及 BB-C 盤點引用的 wonderful-mayer-7fm9g6@3e23808e7 版本；兩版行號不同，judgments 裡都寫明是哪一版）。

證據檔 `judgments_LAWWW2.jsonl`：196 行、194 個 ID（ART-US-ROUTE-1024、WIP-L2-YUTING-FACE 各有一行更正，以 `at` 最新的為準）。

## 各類數量（以最新一行為準）

| tier | 名稱 | 數量 |
|---|---|---|
| 1 | 正式版已完成且實際驗收 | 5 |
| 2 | 已實作但尚未實際驗收 | 63 |
| 3 | 已驗收但尚未發布 | 0 |
| 4 | 部分完成 | 13 |
| 5 | 完全未開工／做好沒接 | 14 |
| 6 | 等待素材或使用者決定 | 87 |
| 7 | 經確認取消或被取代 | 12 |

- 範圍：8 條 `second-ai-env-art-wip-*`、`second-ai-env-art`、`focused-cray-c9uwvw`、`funny-albattani-iawshm` 的逐檔比對；指定的 B07、B08、H08、I07、I08、C24、X14、X69、X79；`audit_1021` 裡 owner＝LAWWW2 的 17 項（另加 A16）；`tasks.json` 裡 owner＝LAWWW2、狀態不是已驗收／取消的 147 項（全部都寫了一行）。
- tier 6 多（87）是因為場景、建築美術的 ART_APPROVED 只有使用者能標（D59／D110）：這些大多已接進遊戲、BB 功能面看過，清單已在 `docs/handoff/USER_ART_REVIEW_1027.md`，**不用再向使用者要一次**。
- tier 2 的 63 項：程式在開發分支（多數也在 main），沒有 BB 實玩紀錄；其中 11 項只在開發分支、還沒到 main（10-30、10-31 的室內光照、改名美術字等，見下面第 4 點）。
- 8 條 WIP 分支：fetch --unshallow 後 7 條是 main 的祖先（內容都在 main、都有程式載入）；`wip-trees` 的 7 個 commit 不在 main，但開發分支已有同一段 treeSeed 程式（src/townkit3d.js:319-352），seated_figures 是更新版——**沒有只存在 WIP 的美術**（和 10-16 D88 報告結論一致）。

## 第 5 類（最重要的是「做好沒接」）

**做好了、沒進遊戲：**
- `I08`（LAWWW）：做好沒接：約會人物去背 v1（LAWWW2-B 20adecf4）、v1.1 anchors（d93b47e2）、v1.2（50152b12）＝ assets/date/<id>/<pose>.webp＋anchors.json 共 53 檔，只在 LAWWW2 三條分支；開發分支、main 都沒有 assets/date/；deliveries.json DLV-1016-88／DLV-1016-128「未整合」（BB-B 8 張 ART_APPROVE… → DATE-S6 開工時把 LAWWW2 分支的 assets/date/ 整組（含 anchors.json）搬進開發分支；扶欄杆、坐姿照 D97 由 BB 跟使用者要（使用者 X94「再緩緩」，不催）
- `ART-BG-AA185（video_far_jp／video_far_us／old_school_playground）`（BB）：三張 2D 背景只在 LAWWW2 分支（23456747、9442e59b）；開發分支、main 沒有；DL-LAWWW2-23456747「不整合：video_far_jp 沒有戲用到、老國小沒排到戲（64a9e2af 改市場）」；任務 ART-BG-AA185 待開工、負責人已改 BB… → 登記（做好沒接，因為沒有戲要用）；有戲要用時 BB 先看這三張能不能用，不重做
- `DL-LAWWW2-236edded／01fee6a1（BG-19、BG-14 第五版）`（LAWWW2）：gongguan_cinema.webp（236edded0）、yongkang_curry.webp（01fee6a14）第五版只在 LAWWW2 分支；開發分支、main 還是 74a655e88 的第四版（blob 不同，開發分支歷史沒出現過第五版）；deliveries 兩筆「不整合：D99 夠用素材凍結，第四版能用」… → 登記，暫停中（D99 凍結；BB 驗第四版有退件再換第五版）

**從來沒做（多數是暫停或排在後面，照指示只登記、不建議恢復）：**
- `I16`：登記，暫停中（D70；下次檢查 11-03，不主動恢復）
- `X39`：登記，暫停中（下次檢查 11-03；D111 起 LAWWW 可自己決定）
- `ART-JIAHAO-JOY`：登記，暫停中（人物凍結 D99）
- `ART-PHOTO-CMP-1021`：登記；LAWWW2 有空時先列共同教學館、女舍和參考照片的差異清單（共同室內 10-31 已換正式模型 753df5a8c，可一起比）
- `LAWWW2-REEXPORT-US-1027`：擴大範圍：所有被烘焙的支援 GLB（soy、wz7、park2、park3、tutor、us_*）連同產生腳本一次搬進開發分支（D88「不要只存在一條分支」）
- `ART-LAMPSHADE-FLIP-1027`：登記；LAWWW2 自己排（D111），不擋
- `CROWD-DEPTS-LOOK-1028`：登記；排在 X125 室內之後（LAWWW-C 10-28 02:3x）
- `ZQ-ARCADE-SEAT-1028`：登記；排在 X125 室內後面
- `CAM-BELL-1031`：登記；排在 INTERIOR-AAA-REVIEW-1028 之後
- `CHAR-TEMPLATE`：登記，暫停中
- `ART-PLAYER-SEASON-OUTFIT-1024`：登記，暫停中

## 可疑、要更正的地方

1. **USER_WANTS B07、總表 ART-SOY1、10-21 稽核 C／D 說「豆漿店道具、寶特瓶袋 v2、故事小物沒進遊戲」不對**：
   - 豆漿店道具 `soy_props.glb` 是 BG-20 `assets/bg/soymilk_shop.webp` 的道具（tools/blender/env_second/bg_soymilk.py:3、:191；LAWWW2-B aca65794d → 開發 0b41a1e85，main 有）。
   - 路邊小物三件（保溫箱、安全帽、回收紙箱＋寶特瓶袋 WZ7_RECYCLE）由 wz_street.py:840-856 烘進 `wenzhou_street.glb`；解析開發分支與 main 的 GLB 都有 `wz7_props` 節點。
   - 故事小物 ART-WZ6 由 `dorm_wz_items.glb` 取代（src/zones3d.js:1890-1898）；開發分支的 `aa_support/wz6_items.glb` 是沒人載入的舊檔。
   - 剩下的只是使用者看畫面（ART_APPROVED）。建議 LAWWW 改 USER_WANTS B07 與 ART-SOY1 狀態。
2. **被「烘進」其他模型或 2D 背景的支援 GLB，原檔不在開發分支**（soy_props、wz7_street_props、park2_props、park3_props、tutor_props、us_living／kitchen／bath_props、us_bedroom_props，以及產生它們的 aa_support／bb_support 腳本）。
   - 遊戲現在不受影響（成品 GLB／webp 都在）。
   - 但在開發分支重新匯出會出事：`wz_street.py:844` 是「檔案存在才擺」，溫州街會**默默少掉**那三件；`bg_soymilk.py:191`、`bg_tutor.py:143`、`us_apartment.py:281/:358` 讀不到檔。
   - LAWWW2-C 10-21 的 `SOURCE_FILES_1021.md`（只在 LAWWW2 分支）只列了這些的 .json／.py（E 節「可以不拿」），**.glb 原檔沒列**。A 節 54 個建議檔已查：39 個開發分支同一版、15 個開發分支更新、0 個還缺。
   - 建議：LAWWW2 交一份「只加檔案」的小交件（支援 GLB＋腳本＋LICENSES 補行），擴大 LAWWW2-REEXPORT-US-1027 的範圍。
3. **約會去背圖（I08）做好、BB-B 已 ART_APPROVED，但整組 `assets/date/`（53 檔）只在 LAWWW2 分支**：DATE-S6 開工時要記得從 LAWWW2 分支搬，不要重做。
4. **只在開發分支、還沒到 main 的 LAWWW2 交件**（下一次發布才會給玩家）：LIB-HALL-LM-1028、RT-NIGHT-1028（開發 bbe0c9469 的訊息寫「v9.10.14 發布後漏套」）、LAWLIB-LM-1030、MULTI-ROOM-V2-1030、CAFE-LM-1030、CAFE-WINDOW-LIVE-1030、DORM203-LM-1030、DORM-SLEEP-VISUAL-1030、RENAME-ART-1030、LIB-LAWN-PLAN-1030、BUG-CAM-LIBHALL-CORE-1031，以及 10-31 的共同／普通／總圖 3F／便利商店／體育館光照。
5. **H08「正式美術地圖」不是使用者要的**：使用者原話只問「可以用地圖方式顯示?」（UA-LAWWW-1023-05），已做完、BB 第 36 項 PASS（BB_218 elegant-brown L1850）、main 有 src/placemap3d.js。「美術地圖之後要」是 LAWWW-B 自己寫的（tasks.json:30589）。從來沒開任務——要做就開 P3，不做就改 USER_WANTS。
6. **LICENSES.md:275 仍寫 gym_arena.glb「還沒接進遊戲」**：已過時（a3837c1c0、src/gymcer3d.js），A16 已在遊戲裡。
7. **總表狀態過時**：
   - BACKLOG-SWEEP-LAWWW2-1021（P0）從 10-21 08:43「開工」後沒更新；清查文件只在 LAWWW2 分支。
   - ART-13 寫「待開工」，其實小語已接（55b67ccf9），明軒凍結。
   - WZ-PARK-POCKET-1028 有 BB 實測證據（elegant-brown L4337、L4342，v9.10.12 GO），可以改已驗收。
   - wip.json 的 WIP-L2-SHOP-BG、deliveries 的 DL-LAWWW2-60322c02 可以改「不整合／被取代」。
8. **C24 學姊兩個臉的線索**：解析開發分支 `vroid_heroine_05.vrm`（3 個網格）、`bl_heroine_05.vrm`（7 個網格），臉的網格都只有一個——不是模型裡重複的臉，比較像兩個實體重疊或兩種模型同時掛上。BB R20（elegant-brown L2858-2861）沒拍到，要照它自己寫的改法重拍。
9. **BB_218 兩個分支版本行號不同**：tasks.json、BB-C 盤點引用的 L 行號是 wonderful-mayer 版；elegant-brown 版開頭多了改名說明，同一段落行號不一樣。history_audit.py 引用行號時要寫是哪一版。
10. **`branch_audit` 把 `second-ai-env-art-wip-trees` 列「保留｜main 沒有的內容」**：只是 commit 不同，內容已在開發分支／main；下次整理可以照 D88 內容比對改列清理候選（刪不刪由 LAWWW 決定，雲端刪不了照舊只標記）。

## 沒做完的

- 第 2 類 63 項沒有逐項找 BB 的 test_shots/*.log（只查了兩版 BB_218 和 BB-C 盤點 tsv），可能有幾項其實有 BB 紀錄、可以升第 1 類。
- tasks.json 的「整合 commit」是從開發分支 commit 訊息和 deliveries.json 對出來的；有幾項只找到登記 commit。main 欄依整合 commit 是不是 main 的祖先判斷；少數用檔案在不在 main 判斷，像 2D 背景。
- 沒有查 owner 不是 LAWWW2 的美術項（例如 ART-14 是 BB 的、DATE-S6 是 LAWWW 的）；只在 I07、I08、A16 順帶判。
