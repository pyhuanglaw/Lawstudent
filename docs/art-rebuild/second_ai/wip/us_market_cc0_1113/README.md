# SHOP-CC0-HELP-1113（D161）：美國兩間超市店內 CC0 化——草原超市 us_market、竹葉亞洲超市 us_asian_market

做法照 `docs/art-rebuild/second_ai/research/SHOP_CC0_HOWTO.md`（先拍改之前 → 改建模腳本 → 量面數 → 先放進遊戲看形狀 → 亞洲超市重烘光照 → 拍新版、做並排圖、跑測試 → 用暫存 index 做 patch → 用 patch 的原始碼重建一次核對大小）。
交件人：幫手子代理（LAWWW2-C 派工），等 LAWWW2 驗收。

- **patch**：`us_market_cc0_1113.patch`（底＝開發分支 `claude/adoring-meitner-mqzst8` 的 `9327a8536b`；`git apply --cached --check` 在底上乾淨套得上）。
  同樣的檔案也直接 commit 在分支 `usmkt-wt` 上，可以直接合併。
- **並排圖**：`us_market_cmp.jpg`、`us_asian_market_cmp.jpg`（`shots/fast_shots.py` 同一份鏡頭拍兩次、`shots/cmp_sheet.py` 拼）。
  **沒有參考圖**：repo 裡沒有這兩間的室內參考圖或 2D 概念圖（`docs/art-rebuild/second_ai/ref/` 在這個分支不存在；`assets/bg/` 沒有美國超市的背景），所以最上面一列放的是新版門口全景。新道具照「美國郊區大型超市／小型亞洲雜貨店」常見的東西做：貨架頂上的備貨紙箱、補貨的手推車、濕地板告示牌、門口蔬果檯上的真水果、花架上的盆栽、塑膠蔬果箱、舊式收銀機、禮盒。
  鏡頭：門口 13:00、從裡面朝門口、近看貨架、近看結帳台／櫃台、（草原超市）近看蔬果檯、門口 20:00。「從裡面朝門口」「近看蔬果檯」第一次拍的鏡頭擺在貨架、冷凍櫃裡面，改了位置，改之前那幾張用部署中的舊 GLB 重拍（同一個鏡頭）。

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
