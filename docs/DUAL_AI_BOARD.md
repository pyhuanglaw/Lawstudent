# 雙 AI 工作看板

- 分工與規則：[`docs/SECOND_AI_HANDOFF.md`](SECOND_AI_HANDOFF.md)。
- 每個 AI 只改自己那一節。狀態用 D38 的驗收狀態，加上「進行中」「排隊」「被擋」。
- 「已整合」＝已經 merge 進開發分支 `claude/confident-ritchie-8rwh7t`。

| 工作階段 | ID | 分支 | 角色 |
|---|---|---|---|
| AI-1「LAWWW」 | `session_01Eds6msqpsuzNEw98sdw8JX` | `claude/confident-ritchie-8rwh7t`（開發主線） | 人物、核心系統、霖澤館、萬才館、整合、發布、分派工作 |
| AI-2「LAWWW2」（標題「遊戲協作專案」） | `session_01AC1WVgJSmoJK1uRsPK2Zn1` | `claude/second-ai-env-art` | 環境美術（Café、溫州街、街道道具、公館、獨立室內） |

AA、BB 兩個工作階段只和使用者討論劇情，不參與開發。訊息規則（顯示、ACK、P0／P1／P2）：`docs/SECOND_AI_HANDOFF.md` 第 10 節。

## AI-1（第一個 AI）

| # | 工作 | 狀態 | 主要檔案 | 最新 commit | 測試 | 已整合 | 等美術驗收 |
|---|---|---|---|---|---|---|---|
| 1 | 沈以安 Blender 正式模型（臉、頭髮、服裝 → 遊戲用 VRM → 遊戲內驗收 → 三方比較） | **第二版完成**（`READY_FOR_ART_REVIEW`）：肩膀不再翹成帽沿、寬鬆量收、髮色灰棕 | `tools/blender/char/`、`assets/models/char/bl_heroine_01.vrm`、`assets/blender/heroine_01_work_v{1,2}.blend` | `e051461` | 遊戲內六視角、坐下、上下樓梯、表情、`stairs_feet_unit`、`sim_hair` 通過（Playwright 模擬） | 本分支（網址 `?blchar`） | 是 |
| 2 | 六位角色共用的 Blender 人物生產線 → 祐廷 → 林芷若 → 陳語彤 → 高子晴 → 溫書瑀 | 祐廷**第一版完成**（`READY_FOR_ART_REVIEW`，`?blchar`）；林芷若第七版製作中（中分八字瀏海、腮紅修正；第六版近看像齊瀏海，沒有採用） | `tools/blender/char/`（`player.py`、`p00_*.py`、`heroine_02.py`、`p02_*.py`）、`assets/models/char/bl_yuting.vrm` | `3e55a8f`、`4522f1c` | 六視角、坐下、樓梯、表情、`stairs_feet_unit` PASS（Playwright 模擬） | 本分支（`?blchar`） | 是 |
| 3 | v9.4 發布 | **已發布**：`6b9c0dc`，GitHub Pages 2026-10-10 14:47:16 UTC 部署成功（遊戲檔案＝測試過的候選 `f10b387`）；下一次發布最早 17:47 UTC | `tests/release_suite.sh`、`docs/RELEASES.md` | `6b9c0dc` | 發布前 24/24 PASS（2 項是修好測試後重跑）；發布後本機同一 commit `deploy_check` ALL PASS（Playwright 模擬） | main | — |
| 4 | 霖澤館剩餘美術（夜間玻璃、反射、201 窗外與設備、電梯）＋ `b3lib.py` 法線／粗糙度貼圖沒縮小（AI-2 回報） | 排隊（WIP patch 在暫存區） | `tools/blender/linze_*.py`、`b3lib.py` | — | — | — | 是 |
| 5 | 萬才館第二階段（Blender＋可以走的弧形大樓梯） | 排隊 | 校園區塊、`campuskit3d.js`、`building3d.js` | — | — | — | — |
| 6 | 整合 AI-2 的成果、跑回歸測試 | 兩點半 Café：16:13Z 收到通知 → 16:16Z merge（`384c612`，沒有衝突）→ 回歸測試全部通過（16:24Z） | — | `384c612` | merge 後在本分支：`cafe_glb_integration` 62/62、`reachability_all` 全遊戲（11 區、139 個互動點）、`zone_transitions` 37、`p0_movement` 34、`touch_flow_wenzhou` 都 ALL PASS（Playwright 手機模擬，不是實機） | 本分支 | 是（Café） |

## AI-2（第二個 AI）

| # | 工作 | 狀態 | 主要檔案 | 最新 commit | 測試 | 已整合 | 等美術驗收 |
|---|---|---|---|---|---|---|---|
| 1 | 兩點半 Café（外觀＋室內） | **`READY_FOR_ART_REVIEW`**（功能 `FUNCTIONAL_VERIFIED`；等 AI-1 merge、等使用者看美術） | `tools/blender/env_second/`（`cafe_layout.py` 外觀與室內共用配置）、`assets/models/env/second_ai/cafe_*.glb`、`zones3d.js` 的 `cafe`／`wenzhou` 區塊（含 `buildWenzhou`、模組層級的 Café 小函式）、`assets3d.js` 標記區、`tests/cafe_glb_integration.py` | 交付 commit 見下方訊息紀錄 | `cafe_glb_integration` 62 項、`reachability_all`（wenzhou,cafe）、`zone_transitions`、`p0_movement`、`touch_flow_wenzhou` 都 ALL PASS（Playwright 手機模擬，不是實機）；16 組前後截圖 | 否（等 AI-1） | 是 |
| 2 | 溫州街近景（主巷 14 棟公寓、日式宿舍＋院牆、電線桿／反光鏡／路名牌／Café 門前紅磚道、小公園） | 進行中：四個 Blender GLB 已建好、在本機接進 `wenzhou` 區塊（`INTEGRATED`，還沒 push）；整合測試 `tests/wz_street_integration.py` 寫好；接下來跑回歸測試＋三時段新舊截圖 | `tools/blender/env_second/wz_*.py`、`assets/models/env/second_ai/{wenzhou_street,wz_jphouse,wz_props,wz_park}.glb`、`wenzhou` 區塊 | — | 執行中 | 否 | 是（完成後） |
| 3 | 街道道具（機車、腳踏車、行道樹、盆栽、路燈、長椅） | 排隊 | `townkit3d.js`、`world3d.js` 的四個函式（先通知 AI-1） | — | — | — | — |
| 4 | 公館近景（騎樓店面、捷運出口） | 排隊（開工前認領 `gongguan` 區塊） | `gongguan` 區塊 | — | — | — | — |
| 5 | 獨立室內（便利商店、麵店、書店、宿舍） | 排隊（開工前認領各區塊） | 各室內區塊 | — | — | — | — |
| 6 | 校園地標（傅鐘、校門、總圖、行政大樓）的 Blender 模型 | 排隊（開工前跟 AI-1 協調接法） | `tools/blender/env_second/` | — | — | — | — |

## 訊息紀錄（重要的才記；送不到對方時寫在這裡）

- 2026-10-10 12:46Z、12:53Z：AI-2 → AI-1，招呼＋通道確認（已送達）。
- 2026-10-10 13:0xZ：AI-1 → AI-2，通道確認＋正式分工摘要（已送達）。
- 2026-10-10 13:15Z：AI-2 → AI-1，正式開工（兩點半 Café，外觀 GLB 第一版）。
- 2026-10-10 13:42Z：AI-2 → AI-1，`tools/blender/b3lib.py` 的貼圖縮小對法線／粗糙度貼圖沒生效（設成 Non-Color 時 Blender 改回讀原始 1k 檔），霖澤館三個 GLB 各可少 0.5–1 MB；畫面不受影響。AI-1 記入霖澤館效能待辦（看板 AI-1 #4），參考 AI-2 的 `tools/blender/env_second/lib2.py` 的 `_img_from_file()`。
- 2026-10-10 14:47Z：AI-1 發布 v9.4（`6b9c0dc`）到 GitHub Pages，通知 AI-2。
- 2026-10-10 15:4xZ：AI-1 → AI-2（P1）：正式分工與九小時工作佇列、不能碰的檔案、新的通訊規則（D40）。DELIVERED。
- 2026-10-10 15:37Z：AI-2 → AI-1：ACKNOWLEDGED 九小時佇列；Café 測試全部通過，預計 16:20Z 左右通知可整合；溫州街 5 個 GLB 進行中。
- 2026-10-10 15:45Z：AI-2 → AI-1：認領後備 B 的第一項便利商店（`cvs`）。AI-1 同意（沒有衝突：AI-1 不碰 cvs）。
- 2026-10-10 16:13Z：AI-2 → AI-1（P1）：兩點半 Café 可整合（`2ffd7d5`；測試全部 PASS；建議示範鏡頭 `cafe_demo_proposal.json`）。AI-1 16:15Z 回 ACK（DELIVERED），16:16Z merge `384c612`，回歸測試全部通過，16:25Z 回 merge SHA（ACTIONED）。
- 2026-10-10 13:59–14:03Z：另外兩個工作階段（AA `session_019Y3emYqxxC4Ch1GGf4fMzw`、BB `session_01XVHYLaK9Vcnae3U1aAJoZv`）傳來分工請求，隨即自行撤回：使用者更正它們是劇情企劃組，不做實作、不分配開發工作。AI-1 不需要處理，看板分工不變。
- 2026-10-10 15:39Z：AI-2（LAWWW2）→ AI-1（P1，ACK）：已讀 2eacc4a（D40、九小時佇列）；Café 驗收收尾、預計 17:00Z 前通知可整合；溫州街近景進行中。DELIVERED。
- 2026-10-10 15:44Z：AI-2 → AI-1（P1）：認領 `cvs` 區塊（便利商店室內）。DELIVERED。
