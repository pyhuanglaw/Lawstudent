# SHOP-CC0-HELP-1113（D161）：美國兩間超市店內 CC0 化——草原超市 us_market、竹葉亞洲超市 us_asian_market（v2：照 LAWWW2-C 退件重做）

交件人：幫手子代理（LAWWW-C 派工），等 LAWWW2 驗收。做法照 `docs/art-rebuild/second_ai/research/SHOP_CC0_HOWTO.md`（含 6b～6e）。

- **patch**：`us_market_cc0_1113.patch`（底＝開發分支 `claude/adoring-meitner-mqzst8` 的 `5b7c5ce124`；用暫存 index `read-tree` 開發分支以後 `git apply --cached --check` 乾淨套得上）。
  同樣的檔案也 commit 在分支 `usmkt-wt` 上（已經合併過開發分支 `5b7c5ce124`，可以直接合併）。
  patch 裡：兩個 GLB＋json、亞洲超市的光照貼圖兩張、`us_market.py`、`us_asian_market.py`、新的 `us_asian_market_packs.py`、`cc0_kit.py`、`lightbake/bake_us.sh`、`lightbake/us_asian_market_lm.json`、`LICENSES.md`、`tests/shop_cc0_baseline.json`、`assets/models/env/views/us_market_out.webp`（v1 補的窗景原圖）。
  **沒放** `docs/handoff/SHOP_STANDARD_STATUS.md`（照 HOWTO，LAWWW 整合時 `node tests/place_gate_unit.js --write`；重產只會改這兩間那兩列的「質感」數字和產生版本）。
- **並排圖**：`us_market_cmp.jpg`、`us_asian_market_cmp.jpg`。**左＝上一版（11-13 退件的 v1，同一份鏡頭當時拍的遊戲截圖）、右＝v2**（cmp_sheet.py 的標籤固定寫「改之前／新版」）。
  鏡頭和上一版一樣（`shots/fast_shots.py`，雲端 SwiftShader）：門口 13:00、從裡面朝門口、近看貨架、近看結帳台／櫃台、（草原超市）近看蔬果檯、門口 20:00。repo 裡沒有這兩間的室內參考圖，最上面一列放 v2 門口全景。

## v2 逐點回覆 LAWWW2 的退件

### 草原超市 us_market（PARTIAL 1 點）
1. **門口自助結帳機是 5～6 個純黑大方塊 → 重做（已改）**
   - 機身：深灰塑膠（新材質 `usm_kiosk`＝ambientCG `Plastic006`，vary 0.03、只用顏色貼圖；調成 #8e939a——遊戲的 us_market 沒有光照貼圖，#5d6167 在遊戲裡看起來還是黑的）、倒角，不鏽鋼踢腳往內縮；檯面另一塊倒角。
   - 檯面嵌**掃描玻璃**（深色亮面玻璃 `usm_scan_glass`＋不鏽鋼框），後面一座直立掃描窗（也是玻璃面）。
   - **有外框的螢幕**（外框、發光畫面、不鏽鋼頸）；**刷卡機**（不鏽鋼短柱、倒角機身、小螢幕、按鍵區）；出單口、找零口。
   - **不鏽鋼裝袋架**：秤台、四支腳、後面的掛袋桿（第一次截圖掛著的袋子像紙箱柱，拿掉了）。背面：散熱孔、兩個角的不鏽鋼護角。
   - **結帳台的黑色輸送帶**：輸送帶 Rubber004 調亮（#4a4c50）、紋路變細看得到；兩側不鏽鋼護條（比帶面高 2 cm）、尾端不鏽鋼滾筒；掃描台換成掃描玻璃＋不鏽鋼框；結帳台身、收銀站改同一個深灰塑膠＋不鏽鋼踢腳；收銀站螢幕加外框、頸、底座；刷卡機同上。
   - 照舊保留：蔬果檯的真水果、紙箱、推車、濕地板告示牌。
   - 面數：自助結帳機多了約 2,500 面 → 花架盆栽 decimate 0.012→0.007、天花板桁架斜撐 1.0→1.3 m 補回來。

### 竹葉亞洲超市 us_asian_market（FAIL 3 點）
1. **從裡面朝門口，貨架北端是一大片灰板 → 已改**：四排貨架的北端都加一個淺端架（深 0.24 m，在配置的擋牆＋玩家半徑以內，導航、擋牆都沒動）：
   最下面兩層**整箱泡麵紙箱**（牛皮紙＋印刷正面、頂面封箱膠帶）、中間一層包裝商品、上面一層**糕餅禮盒**（一疊一疊），頂上一塊**印刷的特價看板**（爆炸星＋假價錢色塊＋商品圖，沒有字）。南端（朝門口）的端架頂上也加了印刷看板。
2. **商品是一樣大的格子、頂面深色 → 已改（東南大聯 v2 的做法）**：
   - 新的 `tools/blender/env_second/us_asian_market_packs.py` 畫包裝貼圖集 `us_am_packs.png`（八種包裝×八款：袋裝泡麵、杯麵、醬料瓶、零食袋、盒裝餅乾／茶包、乾貨〔看得到米粉、香菇、豆子〕、冷凍水餃包子、飲料一手罐／瓶裝茶）；本作自己畫，名字的地方是色塊（假字），沒有字、不像任何品牌。
   - 一包一個盒子、正面貼一款；**一段一款**，每段的寬（6～27 cm 看種類）、高不一樣；同一段每包高低差一點、有的整段往後推（前面被拿走）、偶爾賣空一格；杯麵疊兩個。
   - **頂面、側面不再是深色**：用同一款包裝的顏色調亮的一條（貼圖集每格最下面 16 px）；醬料瓶的側面是瓶子的顏色。
   - 冷凍櫃、飲料櫃、櫃台旁的零食架、南端端架都換成同一套。
3. **櫃台上一排白色小方塊 → 已改**：那是塑膠袋架和一疊疊袋子；換成印刷的**糕餅禮盒**（金邊、透明窗看得到一排圓餅；四款），一疊 1～3 盒、大小高低不一。
- 光照：`lightbake/bake_us.sh market` 重烘（256 取樣、1024）；NOLM 加 `usam_promo`（印刷的看板、紙箱、禮盒照舊即時光）。

### 窗景（店面標準：有玻璃要有窗景）——**沒有做完，KNOWN_FAIL `view` 兩列留著**
- 實際狀況：兩間的模型裡**本來就有一張窗外的景**（草原超市 `usm_outside_view`＝`views/us_market_out.webp`；亞洲超市 `usam_view`＝`us_asian_market_tex.py` 畫的對面草原超市），遊戲 `src/us3d.js` 用一張圖照時段調色（viewTint）。
  `tests/place_gate_unit.js` 只認 `views/<區域>_day／_night.webp`、`Z3.GG_VIEW`、`Z3.WZ_VIEW`，認不到這一套，所以判 FAIL。
- 店面標準要「白天、晚上各一張」：要從美國街道模型在 Blender 拍白天、晚上兩張，再改 `src/us3d.js` 照時段換圖（還要顧 `tests/us_night_view_unit.js` 的「20:00 變暗」）。這一輪沒有做；**不另外放兩張檔案假裝過關**。請 LAWWW 決定：照標準補日夜兩張，或把 US 的模型內窗景卡加進 place_gate 的認法。

## 機器檢查（v2）

| 項目 | 草原超市 us_market | 竹葉亞洲超市 us_asian_market |
|---|---|---|
| ① LICENSES「Poly Haven 模型」有一列寫到 | 有 | 有 |
| ② LICENSES ambientCG／Poly Haven 貼圖有一列寫到 | 有 | 有 |
| ③ 沒貼圖的純色零件（牆不算；`shop_cc0_unit.js` 的 cc0Of） | **16%**（68 個） | **19%**（54 個） |
| 面數（畫出來的） | **79,405**（≤ 8 萬；v1 78,912） | **51,503**（≤ 6 萬；v1 43,057） |
| GLB 大小 | 5.91 MB（v1 5.86 MB） | 4.13 MB（烘焙後；v1 3.59 MB） |

- `node tests/shop_cc0_unit.js`：ALL PASS；基準表沒有這兩間（只減不加）。
- `node tests/place_gate_unit.js`：結束碼 1，**只有**「狀態表 SHOP_STANDARD_STATUS.md 過期」一項（新的問題 0、已經過了要拿掉的 0）；已知未過的照舊含這兩間的 `view`。
- 相關單元測試（`tests/*_unit.js` 裡提到 us_market／us_asian／us_markets3d／shop_cc0／exch／place_gate 的，113 支，六支並行）：**112 PASS、1 FAIL（place_gate，原因同上）**。含 `us_asian_market_lm_unit.js` ALL PASS、`us_night_view_unit.js`、`singleside_us_market_unit.js`、`us_markets_buy_unit.js`、`nav_us_unit.js`。
- `python3 tools/handoff/canon_scan.py --paths`（這次改的檔）：乾淨（0 檔、0 處）。
- 重建核對：`us_market.py` 直接建到 assets（5,913,924 bytes、79,405 面）；亞洲超市白模 3,233,044 bytes、51,503 面＝json。

## v2 用到的 CC0 素材
- 沒有新下載的素材。v2 新用途：ambientCG `Plastic006`（自助結帳機、結帳台、收銀站機身）、`Metal009`（裝袋架、踢腳、護角、掃描玻璃框、護條、滾筒）、`Rubber004`（輸送帶，調亮）——LICENSES.md 這三列同一個 commit 更新用途。
- 亞洲超市的包裝、看板、紙箱、禮盒圖是本作程式畫的（`us_asian_market_packs.py`），LICENSES.md 美國超市那一列補上。
- 其餘 Poly Haven 模型、ambientCG 材質組同 v1（下面）。

## 還沒做到／要注意的（v2）
- 窗景：見上面，沒有做。
- 草原超市沒有光照貼圖（遊戲那一區不接 lightmap），深灰塑膠的實際明暗要看遊戲燈；截圖是雲端 SwiftShader，**沒有 iPhone 實機確認**。
- 亞洲超市收銀機旁那台 POS 螢幕和底座照舊是黑色塑膠小方塊（不在退件清單）。
- 建模需要、不進 repo 的：`textures/gen/us_mk_*`、`us_am_*`（`us_market_tex.py`、`us_asian_market_tex.py`、`us_asian_market_packs.py` 產生；`us_asian_market.py` 每次會重畫 packs）、`textures/asphalt_02/`（`lib2.fetch`）；CC0 素材在 `~/.cache/lawstudent_cc0`。

---

# 以下是 v1（11-13 第一次交件）的紀錄

## 改了什麼

### 兩間共同
- 新工具 `tools/blender/env_second/cc0_kit.py`：把 `tz_shops_interior.py` 的 `acg()`、`printed()`、`ph_obj()`、`ph_put()`（Poly Haven 模型）抄成不綁一間店的 `Kit`；另外兩個修正：
  ① 同名材質讓位（腳本前面 `M` 字典先建的純色那一份改名 `_replaced`，新材質拿得到原本的名字——不然 Blender 叫 `xxx.001`，遊戲、光照烘焙、測試都是照名字認的，第一次建出來 4 支測試因此 FAIL）；
  ② `drop_protos()`：匯出前拿掉藏起來的原型 `PHPROTO_*`（藏起來的物件匯出器照樣匯出，會在原點多一份；`tz_shops_interior.py` 有同樣的寫法，**汀州路那幾間可能也有這個問題，請 LAWWW2 查**）。
- 材質**名字照舊**、內容從純色換成 ambientCG 材質組（顏色＋法線，target 校成原本的顏色；白色、淺色塑膠 `vary=0.05`、灰泥 `vary=0.04`）；牆、牆上的色帶照舊平塗；玻璃、發光面照舊。
- 貨架上的商品塊（D159「不准一樣大小的方塊排格子」）：高度 0.7～1.0、深淺 0.6～1.0、往前拉的程度不一，6～7% 機率一段賣空（露出層板）；底面、背面（最上層以外的頂面也是）看不到所以不做，`single_side` 的 nodup 加上商品塊和 Poly Haven 模型（只從外面看，不補反面）。
- 互動點、座位、導航、店員位置、`*.layout.json` **都沒動**；遊戲程式（`src/`）沒改；**沒有新增玩家看得到的字**。

### 草原超市 us_market（大店，沒有光照貼圖：遊戲的 us_market 區域不接 lightmap，照舊）
- Poly Haven：濕地板告示牌（取代兩片黃色多邊形）、補貨紙箱＋手推車（取代 4 個頂點色方塊）、貨架頂上的備貨紙箱、門口兩張蔬果檯水果堆上的香蕉／蘋果／檸檬／洋蔥、麵包架上的可頌、花架上層三盆盆栽。
- ambientCG：天花板鋼承板（CorrugatedSteel005）、桁架、風管、貨架、洞洞板、踢腳板、冷藏櫃框、推車鍍鉻（Metal009）、柱子（Plaster001）、價格條、冷藏櫃背板、結帳台身、推車把手、紅色購物籃、瓶裝水、托盤、袋裝吐司（Plastic006）、輸送帶（Rubber004）、地墊（Carpet016）、門外人行道（Concrete034）、紙箱（Cardboard001）、棧板（Wood049）。
- 不再是一樣的方塊排格子：瓶裝水那一棧板（原本 42 個一樣的方塊）每一箱大小位置差一點、最上層拿走幾箱；肉品托盤寬窄、間距不一、有賣掉的空位；熟食盤裡的菜高低不一。
- 面數 11.5 萬 → **78,912**（大店上限 8 萬）：桁架每 2.4 m 一支、斜撐每 1.0 m、3 邊；風管 14 邊；推車輪子 6 邊、管子 4 邊；水果堆網格 0.085 m；價格標籤自己一個頂點色材質（不補反面）、密度降一點；花桶上的花束少一點；商品塊不做看不到的面。
- 窗景原圖 `assets/models/env/views/us_market_out.webp` 這個分支上沒有（腳本找不到就不做窗景，`tests/us_night_view_unit.js` FAIL）：**從部署中的 us_market.glb 取出原圖補進 repo**（160,166 bytes，和最早交件那一份一樣大）。

### 竹葉亞洲超市 us_asian_market（有光照貼圖：重烘）
- Poly Haven：舊式收銀機（櫃台）、冷藏櫃最下層一排塑膠蔬果箱（裡面放青菜、大白菜、亞洲梨、洋蔥、地瓜）、米牆上層板的琺瑯鍋、冷凍櫃／飲料櫃頂上的備貨紙箱。
- ambientCG：礦纖板天花板（Plaster001）、輕鋼架、層架、洞洞板、踢腳板、冷藏櫃框、燈籠金屬蓋（Metal009）、價格條、冷藏櫃背板、黑色小零件、電鍋、塑膠袋架、油桶、購物籃（Plastic006）、米袋、紅燈籠布紋（Fabric036）、棧板（Wood049）、門口地墊（Carpet016）、店外標線（Concrete034）、紙箱（Cardboard001）、收銀台後的禮盒（本作畫的紅底金紋、沒有字 × Paper001）。
- 米袋（原本頂點色、整齊排）：每袋大小、位置差一點，最上層拿走幾袋；收銀台後面矮櫃（原本 10 個一樣大的色塊）改成大小、高低、間距不一的禮盒和紙箱，有的疊起來。
- **順手修的**：第 4 條走道的吊牌原本掛在 x−1.4，和第 3 條的吊牌疊在一起（改之前的門口截圖看得到「4」「3」兩塊重疊）；改掛在貨架東邊的走道（x＋1.3）。
- 光照：`lightbake/bake_us.sh market` 重烘（256 取樣、1024）。`bake_us.sh` 改兩處：NOLM 加上新的小東西和 Poly Haven 模型（`S_ph_`、`_inst`，照舊即時光）；`REFPLAIN=1`（材質單面／雙面照這次的白模還原，部署中那一份材質換了一批對不上）。
- 面數 25,852 → **43,057**（上限 6 萬）。

## 機器檢查

| 項目 | 草原超市 us_market | 竹葉亞洲超市 us_asian_market |
|---|---|---|
| ① LICENSES「Poly Haven 模型」有一列寫到 | 有 | 有 |
| ② LICENSES ambientCG／Poly Haven 貼圖有一列寫到 | 有 | 有 |
| ③ 沒貼圖的純色零件（牆不算） | **15%**（66 個裡 10 個：玻璃 3、發光 4、頂點色 1＋價格標籤 1、深綠色帶 1） | **19%**（53 個裡 10 個：玻璃 3、發光 3、頂點色 1、紅色帶 3） |
| 面數（畫出來的） | 78,912（≤ 8 萬） | 43,057（≤ 6 萬） |
| GLB 大小 | 7.73 MB → 5.86 MB | 2.59 MB → 3.59 MB（烘焙後） |

- `node tests/shop_cc0_unit.js`：ALL PASS；`--write` 以後基準表拿掉這兩間（46 → 44）。
- `node tests/place_gate_unit.js`：只剩「狀態表 SHOP_STANDARD_STATUS.md 過期」一項（照 HOWTO，狀態表不放進 patch，LAWWW 整合時 `--write`）；新的問題 0。
- 店自己的單元測試（`grep -l us_market／us_asian tests/*.js`，20 支）全部 ALL PASS：aa370_us、aa424_us_blank、aa450_us、close_unify、door_open、nav_us、r2y4a_events、room_ceiling、shop_hours_aa831_1112、shop_life_audit_1112、singleside_us_market、singleside_us、us_asian_market_lm、us_life、us_market_cam、us_market_shoppers_1113、us_market_street、us_markets_buy、us_night_view、shop_cc0。
- `python3 tools/handoff/canon_scan.py --paths src tools`：16 檔、64 處（這次改的檔 0 處，沒有增加）。
- 用 patch 的原始碼重建：us_market.glb 5,860,504 bytes、78,912 面，和交出去的一樣；亞洲超市白模 43,057 面、2,758,992 bytes，和 json 一樣。

## 用到的 CC0 素材（LICENSES.md 同一個 commit 登記）

- **Poly Haven 模型**：草原超市 `WetFloorSign_01`、`cardboard_box_01`、`hand_truck`、`bananas`、`food_apple_01`、`lemon`、`yellow_onion`、`croissant`、`potted_plant_02`；亞洲超市 `CashRegister_01`、`plastic_crate_02`、`food_pears_asian_01`、`yellow_onion`、`sweet_potato`、`pot_enamel_01`、`cardboard_box_01`。
- **ambientCG 材質組**：`Metal009`、`Plastic006`、`Plaster001`、`Cardboard001`、`Wood049`、`Carpet016`、`Concrete034`（兩間）；`CorrugatedSteel005`、`Rubber004`（草原超市）；`Fabric036`、`Paper001`（亞洲超市）。
- 原有的 Poly Haven 貼圖照舊（`large_floor_tiles_02`、`white_plaster_02`、`granite_tile_03`、`walnut_veneer`、`asphalt_02`、`concrete_wall_006`）。

## 還沒做到／要注意的

- `CashRegister_01` 是舊式機械收銀機，機身上有很小的掃描字樣（Poly Haven 原檔；LAWWW2 在溫特寶邸也用了同一件），只放在亞洲超市（小店用舊收銀機說得通）；草原超市的五條結帳道沒放。
- 商品塊的頂面、側面照舊指到商品圖集左上角的深色（原本的做法），最上層商品從高處看頂面是一片深色；結帳台裝袋轉盤上的袋子、亞洲超市的塑膠袋架仍是方塊（改成白色塑膠材質組）。
- 草原超市沒有光照貼圖（遊戲那一區不接 lightmap，和原本一樣），質感主要靠材質組。
- 沒有 iPhone 實機確認；截圖是雲端 SwiftShader（Playwright），不是實機。
- 建模時需要、但沒有進 repo 的：`tools/blender/env_second/textures/asphalt_02/`（Poly Haven，`lib2.fetch('asphalt_02')` 自動下載）、`textures/gen/us_mk_*`、`us_am_*`（`us_market_tex.py`、`us_asian_market_tex.py` 產生）；ambientCG、Poly Haven 模型在 `~/.cache/lawstudent_cc0`。
- 這個容器沒有跑完整的 `setup_env.sh`（硬碟只剩約 1.5 GB）：只裝了 bpy 5.2.2＋EGL＋pillow、numpy，沒有裝 VRM 外掛、沒有抓 VRoid 樣本（這次用不到）。
