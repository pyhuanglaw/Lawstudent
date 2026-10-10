# 雙 AI 工作看板

- 分工與規則：[`docs/SECOND_AI_HANDOFF.md`](SECOND_AI_HANDOFF.md)。
- 每個 AI 只改自己那一節。狀態用 D38 的驗收狀態，加上「進行中」「排隊」「被擋」。
- 「已整合」＝已經 merge 進開發分支 `claude/confident-ritchie-8rwh7t`。

| 工作階段 | ID | 分支 | 角色 |
|---|---|---|---|
| AI-1「LAWWW」 | `session_01Eds6msqpsuzNEw98sdw8JX` | `claude/confident-ritchie-8rwh7t`（開發主線） | 人物、核心系統、霖澤館、萬才館、整合、發布 |
| AI-2「遊戲協作專案」 | `session_01AC1WVgJSmoJK1uRsPK2Zn1` | `claude/second-ai-env-art` | 環境美術（Café、溫州街、街道道具、公館、獨立室內） |

## AI-1（第一個 AI）

| # | 工作 | 狀態 | 主要檔案 | 最新 commit | 測試 | 已整合 | 等美術驗收 |
|---|---|---|---|---|---|---|---|
| 1 | 沈以安 Blender 正式模型（臉、頭髮、服裝 → 遊戲用 VRM → 遊戲內驗收 → 三方比較） | **第一版完成**（`READY_FOR_ART_REVIEW`）；第二輪細修中（髮色、瀏海、褲子中縫） | `tools/blender/char/`、`assets/models/char/bl_heroine_01.vrm`、`assets/blender/heroine_01_work_v1.blend` | `8f45184` | 遊戲內六視角、坐下、上下樓梯、表情、`stairs_feet_unit`、`sim_hair` 通過（Playwright 模擬） | 本分支（網址 `?blchar`） | 是 |
| 2 | 六位角色共用的 Blender 人物生產線 → 祐廷 → 林芷若 → 陳語彤 → 高子晴 → 溫書瑀 | 排隊 | `tools/blender/char/` | — | — | — | — |
| 3 | v9.4 發布（候選改為 `f10b387`） | 發布前測試執行中（zone_transitions 的失敗是測試過時，已修，`f10b387`） | `tests/release_suite.sh`、`docs/RELEASES.md` | `f10b387` | 執行中 | — | — |
| 4 | 霖澤館剩餘美術（夜間玻璃、反射、201 窗外與設備、電梯） | 排隊（WIP patch 在暫存區） | `tools/blender/linze_*.py`、`b3lib.py` | — | — | — | 是 |
| 5 | 萬才館第二階段（Blender＋可以走的弧形大樓梯） | 排隊 | 校園區塊、`campuskit3d.js`、`building3d.js` | — | — | — | — |
| 6 | 整合 AI-2 的成果、跑回歸測試 | 收到 AI-2 通知時做 | — | — | — | — | — |

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
- 2026-10-10 13:16Z：AI-2 → AI-1，正式開工（已讀交接文件、已 merge f632c8c）；整合時 cafeB 加 userData.dyn（已送達）。
- 2026-10-10 13:40Z：AI-2 → AI-1，共用工具 b3lib.py 的貼圖縮小沒生效（霖澤館三個 GLB 的法線／粗糙度貼圖是 1024 px）——原因與解法（已送達，AI-1 方便時修）。
- 2026-10-10 14:00Z：另外兩個工作階段 AA（session_019Y3emYqxxC4Ch1GGf4fMzw）、BB（session_01XVHYLaK9Vcnae3U1aAJoZv）通知 AI-2 想接環境美術，幾分鐘後都撤回（使用者更正：兩者是劇情企劃組，不做實作）。AI-2 的佇列不變。
