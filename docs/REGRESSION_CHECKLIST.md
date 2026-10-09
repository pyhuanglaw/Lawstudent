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
| `python3 tests/gongguan_layout_nav.py http://127.0.0.1:8765/index.html` | 公館（v9.3 第十一批：連續騎樓的台北街屋）：主要地點與「從店裡／溫州街／校園回來」的出生點站得住、走得到；騎樓整排連續可走；騎樓柱子、店裡面、捷運入口、圓環花台不能走；麵店、茶行、書店、便利商店的互動點位置、站在店門口出現該店互動；舊存檔站在新柱子或舊版店門口時讀檔後移到可走的地方；實際按互動進麵店再出來、往溫州街再回來 | 約 3 分鐘 |
| `node tools/dev_scratch/spring_sim/sim_hair.js` | 六位核心角色的頭髮彈簧骨：站著、瞬移後、走路（人物移動，30 fps 與 0.3 秒一幀）的髮尾高度；走路／瞬移時髮尾比站著高超過 2 cm 就 FAIL（v9.3 #25：頭髮被甩到耳朵高度）。Node 直接載入遊戲的 `lib/`、`src/`，不需要瀏覽器 | 約 1 分鐘 |
| `python3 tools/dev_scratch/nav_islands.py http://127.0.0.1:8765/index.html [區域 id …]` | 每個區域用 0.1 m 間距取樣「站得住」，找出和主要區域不相連的小孤島（面積 < 0.5 m²、離主要區域 1.5 m 內 → SUSPECT）。孤島四周都站不住，滑進去就出不來（v9.3 #31） | 全部區域約 10 分鐘 |
| `python3 tests/see_through.py http://127.0.0.1:8765/index.html` | 鏡頭和玩家之間有大王椰子樹幹時看得到玩家（v9.3 #35）：同一幀畫正常畫面、拿掉樹幹的畫面、玩家剪影，比較玩家範圍內看得到的比例。關掉透視時要 < 40%（確認樹幹真的擋住）、打開時 ≥ 60%；演出鏡頭、室內不開 | 約 3 分鐘 |
| `python3 tools/dev_scratch/render_stats.py http://127.0.0.1:8765/index.html` | （參考用，不判定）六個常用鏡頭（校園三個、溫州街 Café 前、公館兩個）畫一幀的三角形數、draw call、幾何數、貼圖數；改建築、加大量物件之後和上一版比較（量第十一批以前的版本時加 `GG_Z=44`，公館店面街的鏡頭位置才相同） | 約 2 分鐘 |
| `python3 tools/dev_scratch/evtest.py`（需先 build） | 52 個事件的觸發條件與鎖定解鎖 | 約 10 分鐘 |
| `python3 tools/dev_scratch/view_audit.py URL spec.json 輸出資料夾 [方向數=8]` | （畫面盤點，人工看圖）把玩家放到 spec 裡的每個位置，用一般跟隨鏡頭轉一圈各拍一張，拼成一張對照表：找「轉鏡頭看到大片空地、地面盡頭、孤立建築」的角度（v9.3 第十八～二十批用 33 個位置，spec 範例見 ART_REBUILD_PROGRESS） | 約 40 分鐘（33 個位置） |
| `python3 tools/dev_scratch/cine_multi.py URL spec.json [寬] [高]` | （截圖用，不判定）一次載入、連拍多個固定鏡頭（演出鏡頭）；同一個區域＋時間只載入一次，比 `tools/shots/scene_shot.py` 快很多。改前改後比較圖用同一份 spec 對兩個版本各跑一次 | 每張約 30 秒 |

## 修改影響對照

| 系統 | 什麼修改會影響 | 至少要跑 |
|---|---|---|
| 移動與鏡頭 | `engine3d.js`（stepEntity、updateCamera、input、樹幹透視）、`game3d.js`（搖桿、sitAt/standUp） | p0、movement_regression、touch_flow；改 updateCamera 或樹幹透視時加跑 see_through |
| 地形與碰撞 | `zones3d.js` 任何幾何或 NavGrid（`blockRect/blockOutside/open`）、出生點、出入口座標 | 改校園時加跑 campus_layout_nav；改公館時加跑 gongguan_layout_nav（出入口座標要和 p0 的「公館店門口」出生點一起改）；p0（含溫州街）、movement_regression E、touch_flow；加家具、改 `blockRect` 之後跑 `nav_islands.py` |
| NPC 導航 | `story3d.js` 的 walkRoutes／bikeRoutes、`engine3d.js` updateNPC | 截圖確認 NPC 不在牆裡、touch_flow |
| 人物朝向與動畫 | `character3d.js`（buildVRM、animateVRM、setBonesV）、`assets3d.js`（cloneVRM）、`tools/vroid_build.py` 重建的模型 | 角色展示截圖（正側背、走跑坐交談）、教室座位朝向、touch_flow 坐下；改到彈簧骨、`updateVRM` 或重建有頭髮的模型時跑 `sim_hair.js` |
| 場景切換 | `game3d.js` enter／applySave、各區域 exits | touch_flow（溫州街 ↔ Café）、movement_regression E |
| 日夜與天氣 | `engine3d.js` applyTime／KEY、區域的 `applyTimeOutdoor`、`townkit3d.js` setNight | 同位置 11:00／17:30／20:30 截圖 |
| 視距、霧、遠景 | 區域的 `viewFar`／`fogNear`、`engine3d.js` applyViewFar／applyTime 裡的霧、天空與遠景剪影（makeSky、makeSkyline 的 renderOrder）、邊界外的背景（`TK.bgCity`、`zones3d.js` 的 campusBackdrop） | view_audit（邊界附近的位置轉一圈）、render_stats（draw call、三角形數和改前比）；**確認霧的距離真的生效**：applyTime 每幀會設霧，曾經把區域的 viewFar 蓋掉（v9.3 第二十批） |
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
- `movement_regression` A5（往宿舍前牆推 3.2 秒）停的位置會隨幀率不同（v9.3 #38：正面推牆會沿牆橫移一點）；A6 會往前牆上空間比較大的那一側斜推，判定仍是「沿牆滑動 0.3 m 以上」。如果 A6 失敗，先看 A5 停的位置再判斷。
- `tools/dev_scratch/render_stats.py` 量算圖負擔（draw call、三角形）；`VIEWSET=interior` 量七個室內。
