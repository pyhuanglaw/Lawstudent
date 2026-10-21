# 日本宿舍 3D（WIP；2026-10-21 13:0x 起**保留、修完交件**）

> **使用者 2026-10-21 13:0x（UA-LAWWW2-1021-03）**：「你之前日本如果有3D的部分就保留 還沒做的才2D」。
> - 已經做的 3D（下表：你的房間 jp_room）保留，修完可達性的 FAIL 以後交 LAWWW-C 整合；
> - 還沒做的（共用廚房、大廳、宿舍門口）照舊 2D，不做 3D。
> - 下面「為什麼暫停」是 10-21 上午的紀錄，留著。

LAWWW2-C，2026-10-21。

## 交件（JP-ROOM-3D-KEEP-1021，2026-10-21 13:2x）
| 項目 | 狀態 |
|---|---|
| `jp_room.glb` | **MODEL_READY**（6,152 三角形、0.48 MB；這次沒有重匯：幾何和 25c6c76d 相同） |
| 接進遊戲 | **INTEGRATED（只在我的測試工作樹）**：開發分支 `382236a5`＋patch [`../patches/jp_room_1021.diff`](../patches/jp_room_1021.diff)（`index.html` 兩行 script、新檔 `src/jp_dorm3d.js`、`src/data/jp_dorm_layouts.js`）＋GLB＋窗景 `assets/models/env/views/jp_room_{day,night}.webp` |
| 測試（Playwright 手機模擬，不是 iPhone） | `reachability_all.py --zones jp_room` **ALL PASS**（6 個互動點、坐下的走近點；改之前「窗外」FAIL，同一支測試）；沒有 JS 例外 |
| 美術 | **READY_FOR_ART_REVIEW**；BB-C 畫面驗收待做 |

- 「窗外」修法：
  - 書桌（離牆 0.61）和床（寬 1.0）中間的走道 1.19 m。導航格照房間邊界排的話，走道中間沒有一欄格子，兩側的格子都貼著家具，站得住的一格都沒有。
  - 改法：`jp_dorm3d.js` 的導航格往西偏 0.2 m（多一欄），走道中間 x −0.2 那一欄站得住；
  - 「窗外」的點移到走道中間、離窗 0.7 m (−0.05, −1.6)（`jp_dorm.py` → layout.json → `jp_dorm_layouts.js`）。
- **要 LAWWW-C 決定**：
  - `jp3d.js` 現在是 2D 的據點選單，從哪裡進這間 3D 房間。我的建議是「在房間休息一下」「睡覺」走進來，「走出房間」回選單。
  - 「窗外」「小冰箱」「行李箱」看的字要 AA 寫，現在顯示的是標籤。
- 試玩：網址加 `?jpdemo`，左上角「日本宿舍（測試）」按鈕。

## 為什麼暫停
- LAWWW-C 10-20 21:00 把「日本學期場景優先 1（AA_341 第 5 節）」排進 LAWWW2 的佇列，我 10-21 開工。
- 清查歷史遺留時（BACKLOG-SWEEP-LAWWW2-1021）查到：**使用者 10-18 14:0x 選擇題選了「日本場景：全 2D（建議）」**。
  - 證據：開發分支 `docs/handoff/user_asks_LAWWW.json` UA-LAWWW-1018-06；`tasks.json` JP-3D-ASK「取消／被取代」，原文「LAWWW2 不做日本 3D」。
  - 兩邊衝突，使用者的決定優先，所以停下來。
- 等 LAWWW-C 確認：
  - 照舊不做 → 這個資料夾留著不整合；
  - 使用者另外改過決定 → 寫出來源，我接著做。

## 已經做的（10-21 上午的紀錄；現在照上面的「交件」）
| 檔案 | 內容 | 狀態 |
|---|---|---|
| `tools/blender/env_second/jp_dorm.py` | 你的房間 `jp_room`（照 2D 背景 jp_room.webp：書桌靠窗、書櫃、床頭靠窗的單人床、掛勾上的外套、玄關、拉門衣櫃、小冰箱、行李箱、窗外陽台欄杆） | MODEL_READY（WIP） |
| `assets/models/env/second_ai/jp_room.glb`（＋`.json`、`.layout.json`） | 6,152 三角形、約 0.6 MB；座位 1（書桌）、看 4（窗外、床、小冰箱、行李箱）、出口 1 | WIP |
| `tools/blender/env_second/jp_view.py`＋本資料夾 `jp_room_{day,night}.webp` | 窗景：電線桿和電線、瓦屋頂的住宅、菜園、溫室、一塊一塊的田、村子、遠一點的一座山；Cycles 24 取樣（草稿） | WIP |
| 本資料夾 `jp_dorm3d.js`、`src/data/jp_dorm_layouts.js` | 遊戲端的區域（照 rooms_glb3d.js 的做法）、`?jpdemo` 試玩按鈕 | 只在測試工作樹跑過 |
| `tools/blender/env_second/gen_jp_layouts.py` | layout.json → `src/data/jp_dorm_layouts.js` | — |
| `game_shots_wip.webp` | 遊戲內截圖（10:00、20:30） | — |

## 測試（只在測試工作樹，Playwright 手機模擬，不是實機）
- 正式模型載入、沒有 JS 例外：PASS。
- `reachability_all.py --zones jp_room`：**FAIL 1 項**。
  - 「窗外」(0.05,−1.85) 互動範圍內沒有站得住的位置；
  - 「走出房間」修好了。
- 沒做：共用廚房＋大廳、宿舍門口（竹子）。
