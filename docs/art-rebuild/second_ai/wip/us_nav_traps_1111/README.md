# 美國交換場景「擋玩」巡檢（US-NAV-TRAPS-1111；LAWWW 11-11 19:37 派給 LAWWW2，D141 只看擋玩）

狀態：**READY_FOR_REVIEW**。找到兩個「走得進去、出不來」的小縫，各補一塊導航阻擋，模型不動。其他都過。

- patch：`us_nav_traps_v1.patch`（3 個檔：`src/us3d.js`、`src/us_clubhouse3d.js`、新 `tests/us_nav_traps_1111_unit.js`；基底開發分支 `fe347b5e8c`；在最新開發分支 `8c5b281ccf` 上 `git apply --3way` 乾淨）。

## 巡了什麼

範圍：美國每一區，共 14 區——`us_outside`、`us_apartment`、`us_shared`、`us_bed_c`、`us_clubhouse_in`、`us_campus`、`us_lawlib`、`us_lawlib_2f`、`us_classroom`、`us_market_street`、`us_market`、`us_asian_market`、`airport_dep`、`airport_arr`。

r2y4a 的事件（`src/r2y4a3d.js`）都在 `us_outside`、`us_shared`、`us_apartment` 演，沒有自己的區域。AA_814 那兩個點：

- **3-1** 修理事件改成美國任何一區都觸發：先帶到 C 棟 208 廚房（`US3.SPAWN.us_shared_kitchen` (−3,1.8)）。
- **3-2** 12/16 07:00 社區門口送大家上機場巴士：`us_outside` 的 `US_LINK` (−35,0)。
- 兩個事件都是 ADV 對話（模糊的 3D 背景），沒有另外擺人物的座標。

### Node（引擎真的 NavGrid＋stepEntity）

| 檢查 | 結果 |
|---|---|
| 出生點（zone.spawn＋US3.SPAWN 裡屬於這一區的，含 3-1 廚房、3-2 社區門口）站得住 | 全過 |
| 349 個互動點（座位看旁邊站的地方）從出生點用 stepEntity 走得到（E.simWalk） | 全過 |
| 小孤島（nav_islands.py 的掃法） | 15 個；從旁邊推進去、推不出來的有 **2 個**（下面①②） |

1. **超市街 `us_market_street`**：停車場東邊那支燈桿 (27,−3.5) 的底座，和兩台車（SUV (29.16,−6.28)、轎車 (29.07,−0.75)）的車頭中間，剩一條 0.2 m 寬、人站得住的小縫 (27.8～27.9, −4.0～−3.6)。從北邊斜著走得進去：走、跑 30 fps 推 5 次，4 次進去出不來。
2. **會所 `us_clubhouse_in`**：門廳和自習室中間那道牆只有一格厚（0.2 m）。「站得住」只看人的前後左右四點，在櫃台東頭 (3.1, 0.2～0.5) 四點剛好跨過牆，變成一條站得住的小縫。跑步斜著進去，5 次有 2 次出不來。
- 其他 13 個小孤島：推不進去，或推進去走得出來（公寓、C 棟同一格局 (−4.05,−2.7)：進去 1 次、出得來）。不動。

### 雲端瀏覽器（SwiftShader，`tour_browser.js`）

每一區照出生點進去、等正式模型、拍一張：`us_tour_contact.jpg`。

- 14 區都載入正式模型，沒有黑畫面，JS 例外 0。
- 截圖畫面最暗的是 `us_market` 18% 暗像素（入口的黑色地墊），`us_outside` 晚上平均亮度 39。
- AA_814 兩個點照真的日期重拍：`aa814_points_dated.jpg`，12/16 07:16 社區門口（冬天、停車場、「出門（去超市）」）、9/13 18:45 C 棟 208 廚房（「看爐子」）。
- 截圖裡看得到但不擋玩的，記錄不動：
  - 超市入口的黑色地墊佔畫面一角；
  - 廚房出生點面向冰箱，貼得很近。

## 改法（只有導航，模型不動）

- `src/us3d.js`：戶外區域（outdoorZone）加 `navFix` 掛勾，車的阻擋擋完以後呼叫。超市街的 `navFix` 擋燈桿和車中間那一格（0.5 m）；條件是配置裡那支燈桿還在 (27,−3.5)。
- `src/us_clubhouse3d.js` buildNav：家具擋完以後補 `band(3.0,3.2,0.15,0.55)`（櫃台東頭牆裡那一條）。

## 測試（`tests/us_nav_traps_1111_unit.js`，Node，約 3 秒；美國每一區）

0. 載入沒有錯。
1. 出生點都站得住（含 3-1 廚房、3-2 社區門口）。
2. 每一個互動點從出生點走得到。
3. 小孤島：從旁邊（0.4～1.0 m）往孤島推 2 秒（走 30、跑 30、跑 10 fps）；推進去的，16 個方向各推 3 秒都要出得來。
4. ①② 那兩個點站不進去。

- 修改前（fe347b5e8c）：3、4 FAIL；修改後 ALL PASS。
- 美國相關的 45 支 Node 測試全過。
- **全部 Node 測試 1307 支**（`regression_full.log`）：1301 支過；`bookstore_exit_unit` 老警告（結束碼 0）；`gym_wear_unit` 全部一起跑時 FAIL、單獨跑 ALL PASS（CPU 被搶，基底也一樣單獨跑會過）；`date_lines_aa373`、`date_she_pays_812_1111`、`kx_dates_1111`、`yt_dates_1111` 四支 FAIL——**基底 fe347b5e8c 不套這包也一樣 FAIL（FAIL 那幾行逐字相同）**，不是這包造成的（看起來是 AA_812 約會付錢那一段在改）。

## 沒做的

- 手機實機、CC 的 PC 上沒有走過（D131）。
- 「穿模」只看了每一區出生點那一張截圖，沒有每個角落走一遍。
- 一格厚的牆被「四點檢查」跨過去，是引擎的通則（MOKU-PLANT-CORNER 也是同一類）。這次只補巡到的兩個地方；要不要改引擎（例如多檢查斜角四點），請 LAWWW 決定，改的話要跑全部移動、找路的測試。
