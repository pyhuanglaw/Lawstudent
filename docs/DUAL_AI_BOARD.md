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
| 1 | 沈以安 Blender 正式模型（臉、頭髮、服裝 → 遊戲用 VRM → 遊戲內驗收 → 三方比較） | 進行中：臉第二版、髮第二版完成，服裝製作中 | `tools/blender/char/` | `08d0841` | 臉、髮在遊戲 look-dev 截圖確認；完整模型還沒測 | 本分支 | 是（完成後） |
| 2 | 六位角色共用的 Blender 人物生產線 → 祐廷 → 林芷若 → 陳語彤 → 高子晴 → 溫書瑀 | 排隊 | `tools/blender/char/` | — | — | — | — |
| 3 | v9.4 發布（候選 `47b2043`） | 暫停（zone_transitions 的 classroom 失敗待查） | `tests/release_suite.sh`、`docs/RELEASES.md` | `47b2043` | 部分通過 | — | — |
| 4 | 霖澤館剩餘美術（夜間玻璃、反射、201 窗外與設備、電梯） | 排隊（WIP patch 在暫存區） | `tools/blender/linze_*.py`、`b3lib.py` | — | — | — | 是 |
| 5 | 萬才館第二階段（Blender＋可以走的弧形大樓梯） | 排隊 | 校園區塊、`campuskit3d.js`、`building3d.js` | — | — | — | — |
| 6 | 整合 AI-2 的成果、跑回歸測試 | 收到 AI-2 通知時做 | — | — | — | — | — |

## AI-2（第二個 AI）

| # | 工作 | 狀態 | 主要檔案 | 最新 commit | 測試 | 已整合 | 等美術驗收 |
|---|---|---|---|---|---|---|---|
| 1 | 兩點半 Café（外觀＋室內） | 進行中（2026-10-10 12:55Z 開工：參考圖、PBR 材質、修改前截圖） | `tools/blender/env_second/`、`assets/models/env/second_ai/`、`zones3d.js` 的 `cafe`／`wenzhou` 區塊 | — | — | 否 | — |
| 2 | 溫州街近景（日式老屋、小公園、公寓立面模組） | 排隊 | `wenzhou` 區塊、`townkit3d.js` | — | — | — | — |
| 3 | 街道道具（機車、腳踏車、行道樹、盆栽、路燈、長椅） | 排隊 | `townkit3d.js`、`world3d.js` 的四個函式（先通知 AI-1） | — | — | — | — |
| 4 | 公館近景（騎樓店面、捷運出口） | 排隊（開工前認領 `gongguan` 區塊） | `gongguan` 區塊 | — | — | — | — |
| 5 | 獨立室內（便利商店、麵店、書店、宿舍） | 排隊（開工前認領各區塊） | 各室內區塊 | — | — | — | — |
| 6 | 校園地標（傅鐘、校門、總圖、行政大樓）的 Blender 模型 | 排隊（開工前跟 AI-1 協調接法） | `tools/blender/env_second/` | — | — | — | — |

## 訊息紀錄（重要的才記；送不到對方時寫在這裡）

- 2026-10-10 12:46Z、12:53Z：AI-2 → AI-1，招呼＋通道確認（已送達）。
- 2026-10-10 13:0xZ：AI-1 → AI-2，通道確認＋正式分工摘要（已送達）。
