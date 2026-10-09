# 回歸測試清單（REGRESSION CHECKLIST）

每次修改前先看「這次會影響哪幾列」，修改後跑對應的測試，並在 `docs/ART_REBUILD_PROGRESS.md` 寫下結果（通過／失敗／未測）。
**測試沒過不能改測試標準來假裝成功。Playwright 模擬（Chromium SwiftShader、iPhone 390×844、CDP 觸控）不等於手機實機。**

## 自動測試

開發伺服器：`python3 -m http.server 8765`（repo 根目錄）。SwiftShader 只有 1–4 fps，**一次只跑一個測試**（同時跑會搶 CPU 逾時）。

| 指令 | 涵蓋 | 時間（沙盒） |
|---|---|---|
| `python3 tests/touch_flow_wenzhou.py http://127.0.0.1:8765/index.html` | 只用觸控：標題「繼續」→ 溫州街搖桿 → NPC 都是正式模型 → 走到 Café → 互動按鈕不蓋搖桿 → 進 Café → 和沈以安說話 → 坐下／起身 → 離開 → 選單存檔 → 重新整理 → 標題「讀取」欄位 → 讀檔後可走 → 沒有 JS 例外 | 約 15–25 分鐘 |
| `python3 tests/p0_movement.py http://127.0.0.1:8765/index.html` | 霖澤館前、校園、宿舍門口、公館店門口、校門外、溫州街出生點：搖桿上／左／右、推到底跑、點地移動、事件中鎖定、對話後解鎖、存讀檔後可走 | 約 15–30 分鐘 |
| `python3 tests/movement_regression.py http://127.0.0.1:8765/index.html` | A 宿舍走跑撞牆滑牆／B 坐下起身／C ADV 後移動／D 存讀檔後移動／E 各區域出生走跑轉身互動 | 約 20–40 分鐘 |
| `python3 tests/campus_layout_nav.py http://127.0.0.1:8765/index.html` | 校園配置（依台大平面圖）：17 個地點站得住、從霖澤館前走得到（含醉月湖木棧道、湖心亭）；湖面與建築內不能走；舊存檔站在新建築／湖裡時讀檔後移到可走的地方 | 約 2 分鐘 |
| `node tools/dev_scratch/spring_sim/sim_hair.js` | 六位核心角色的頭髮彈簧骨：站著、瞬移後、走路（人物移動，30 fps 與 0.3 秒一幀）的髮尾高度；走路／瞬移時髮尾比站著高超過 2 cm 就 FAIL（v9.3 #25：頭髮被甩到耳朵高度）。Node 直接載入遊戲的 `lib/`、`src/`，不需要瀏覽器 | 約 1 分鐘 |
| `python3 tools/dev_scratch/nav_islands.py http://127.0.0.1:8765/index.html [區域 id …]` | 每個區域用 0.1 m 間距取樣「站得住」，找出和主要區域不相連的小孤島（面積 < 0.5 m²、離主要區域 1.5 m 內 → SUSPECT）。孤島四周都站不住，滑進去就出不來（v9.3 #31） | 全部區域約 10 分鐘 |
| `python3 tools/dev_scratch/evtest.py`（需先 build） | 52 個事件的觸發條件與鎖定解鎖 | 約 10 分鐘 |

## 修改影響對照

| 系統 | 什麼修改會影響 | 至少要跑 |
|---|---|---|
| 移動與鏡頭 | `engine3d.js`（stepEntity、updateCamera、input）、`game3d.js`（搖桿、sitAt/standUp） | p0、movement_regression、touch_flow |
| 地形與碰撞 | `zones3d.js` 任何幾何或 NavGrid（`blockRect/blockOutside/open`）、出生點、出入口座標 | 改校園時加跑 campus_layout_nav；p0（含溫州街）、movement_regression E、touch_flow；加家具、改 `blockRect` 之後跑 `nav_islands.py` |
| NPC 導航 | `story3d.js` 的 walkRoutes／bikeRoutes、`engine3d.js` updateNPC | 截圖確認 NPC 不在牆裡、touch_flow |
| 人物朝向與動畫 | `character3d.js`（buildVRM、animateVRM、setBonesV）、`assets3d.js`（cloneVRM）、`tools/vroid_build.py` 重建的模型 | 角色展示截圖（正側背、走跑坐交談）、教室座位朝向、touch_flow 坐下；改到彈簧骨、`updateVRM` 或重建有頭髮的模型時跑 `sim_hair.js` |
| 場景切換 | `game3d.js` enter／applySave、各區域 exits | touch_flow（溫州街 ↔ Café）、movement_regression E |
| 日夜與天氣 | `engine3d.js` applyTime／KEY、區域的 `applyTimeOutdoor`、`townkit3d.js` setNight | 同位置 11:00／17:30／20:30 截圖 |
| 劇情事件與對話 | `events3d.js`、`data/events.js`、`story3d.js` | evtest、第一二天流程（`tools/dev_scratch/flowtest.py`） |
| 人物關係 | `social3d.js` | evtest |
| 存檔與讀檔、舊存檔相容 | `game3d.js` snapshot／validate／migrate／autosave、`G` 的欄位 | touch_flow（存到欄位、重新整理、讀取）、p0 存讀檔、用舊版存檔 JSON 讀取 |
| 手機觸控 | `index.html` 的 CSS（z-index、按鈕位置大小）、`setupJoystick`、`E.onTap` | touch_flow（含「互動按鈕不蓋搖桿」）、直向與橫向截圖 |
| 直向／橫向 UI | `index.html` 的 media query | 390×844 與 844×390 截圖 |
| 法律題庫與正確答案 | `data/legal_qbank.js`、`legal3d.js` | **不准改答案**；改到時逐題比對原始題庫 |

## 已知的測試限制

- 沒有任何手機實機測試；真機效能、觸控手感、Safari 特有行為都未驗證。
- SwiftShader 下的 FPS 數字沒有參考價值。
- `evtest.py` 與 `flowtest.py` 預設測 `build/` 單檔版，改程式後要先 `python3 build.py`。
