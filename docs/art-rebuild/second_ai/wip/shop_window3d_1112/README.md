# SHOP-WINDOW-3D-1112：照參考圖貼的櫥窗改成立體店內（LAWWW2-C，2026-11-12）

使用者 11-12（LAWWW-C 轉）：「我非常滿意118巷的店家，從外面看進去店裡面是有3D的感覺；反而是新生南路那一批還有公館上一次新增的店家，都直接拿我2D的參考圖去貼在外面…我希望改成像118巷的店家一樣」「汀州路店家 從外面看也是 2D」。

順序（LAWWW-C）：新生南路 → 汀州路 → 公館。**第 1 包＝大步球鞋（樣板）**；狀態 `READY_FOR_REVIEW`（美術沒有人判過）。

## 第 1 包：大步球鞋 `xs_dabu_v1.patch`
底：開發分支 `ba6cbce8b`（`git apply --cached --check` 乾淨）。

**玩家看到的**：走在新生南路騎樓，大步球鞋的玻璃後面原本是一張 0.8 m 深的參考圖（走動時整張圖一起動、看得出是貼的）→ 現在是 3 m 深、真的有東西的店：左邊櫥窗鋼柱木層板四層球鞋、一階階的水泥台、籃球、兩盆植物；右邊門後看得到兩側鞋牆、木展示桌、試穿長凳、櫃台、海報、天花板軌道燈。人走過去，前後的東西會錯開。**打烊（22:00 以後）店裡關燈變暗**，晚上營業中照樣亮。

**做法（和 118 巷、溫州街同一套）**
- `tools/blender/env_second/wz_shopkit.py`：`xs_inside3d()`＋`XS_IN3D` 表（一間店一個函式；這一包只有 `dabu`）、`_xs_shoe`（球鞋，櫥窗 5 塊、牆上 3 塊）、`_xs_plant`／`_xs_leaves`（葉片，不用球）。`xs_front()` 有立體店內就不放景深卡。網格 `sk_in_dabu`、材質 `wz_in_shop`（unlit 頂點色，越裡面越暗；不投影）。
- `wz_street.py`：`XS_FRONTS['dabu']` 加 `back=3.1`（牆往裡挖 3.1 m）。
- `src/zones3d.js`：新 `Z3.shopInsideLit(root, zone, {店: 地點})`——每間 `sk_in_<店>` 各複製一份材質，照 `PLACES.isOpen`（含颱風停業）把亮度設 1／0.07，每 30 幀看一次。**這是「打烊看得出來關了」的共用做法**：汀州路、公館、118 巷的立體店內（都是 `sk_in_*`）接同一個函式、給對照表就行。
- `src/xinsheng3d.js`：`S.SHOP_IN_PLACE`（六間先列好，模型裡有 `sk_in_<店>` 的才會接）＋接上街景模型後呼叫。
- 店內不放 `GLOW_shopin` 光暈（整條街的光暈合成一個網格，打烊關不掉；unlit 的店晚上本來就亮）。
- `textures/gen/xs_fronts_atlas.jpg`：從線上的 `xinsheng_street.glb` 取出來的那一張（SIGN-RECTIFY-1110 拉正招牌是直接換 GLB 裡的圖，原始貼圖集沒有進版本庫；不放回去的話重建會退回斜的招牌）。**內容是 WebP、副檔名 .jpg**（Blender 照內容讀；位元組和線上 GLB 裡的一樣）。

**數字**
- `xinsheng_street.glb`：2,055,508 → 2692200 bytes；不重複三角形 18,155 → 26,099（+7,944；`sk_in_dabu` 8,082）；物件 181 → 182；材質數不變（共用 `wz_in_shop`）。draw call +1。
- 其他六間店、樓上、招牌：重建前後同鏡頭渲染**逐像素相同**（山嵐、大口、新生運動、南洋、好拍；同弦那一張只差右邊露出來的大步）；GLB 內 19 張圖 md5 全部相同。
- 疊面（`tools/glb_coplanar.py`）：整顆 226.49 → 226.43 m²（原本就有的是樓上外牆）；`sk_in_dabu` 自己 0.13 m²＝球鞋鞋身各塊埋在鞋底裡面的底面，看不到。

**測試**
- 新：`node tests/shop_window3d_1112_unit.js`——15 項 ALL PASS（模型有 `sk_in_dabu`、深度 ≥ 2.8 m、三角形 1500～9000、unlit、沒有 `GLOW_shopin`；`shopInsideLit` 只接表上的店、各自一份材質、14:00 亮／23:00 暗／隔天開門調回）。打 patch 前：`sk_in_dabu` 不存在、`shopInsideLit` 不存在 → FAIL。
- 改：`tests/xs_tongxian_sign_1111_unit.js` 第 4 項（物件 ≤ 181）扣掉立體店內的個數再比（原本的意思是鐵窗、冷氣各少一個）。
- 回歸 30 支（xs*、xinsheng*、zone_pre*、gg_shoplit*、gg_glow*、singleside_streets、place_gate、dakou、tongxian、shanlan、close_unify）ALL PASS。

**遊戲內截圖（雲端 SwiftShader，開發版 index.html）**
- `dabu_ingame_day_obl_night_closed.jpg`：左上 14:00 正面、右上 14:00 斜角（前後錯開）、左下 20:30 營業中、右下 23:30 打烊。
- `dabu_ingame_follow.jpg`：手機橫向、跟隨鏡頭走在騎樓。
- `dabu_blender_before_after.jpg`：Blender 同鏡頭，左＝線上版（貼圖）、右＝這一版。

**先將就的**
1. 球鞋是幾塊方塊疊的（櫥窗的有倒角），近看是「看得出是球鞋的積木」，不是真的鞋型。
2. 沒有店員、客人站在櫥窗裡（街上看進去是空店；店員在走得進去的 `xs_dabu` 區域裡）。
3. 街上看到的擺設和走進去的 `xs_dabu` 室內不是同一份配置（櫥窗、鞋牆、櫃台的位置大致同方向，沒有逐件對）。
4. 打烊只有店裡變暗，沒有鐵捲門、「休息中」牌子；招牌晚上的亮度沒有跟著關。
5. 小的垂葉盆栽近看是幾片綠色三角片。
6. 真機、PC 瀏覽器沒有看過（只有雲端截圖）；會不會閃要 CC 連拍。

## 接下來（同一份 patch 往上疊，或一間一包）
好拍運動 → 山嵐書店（一樓）→ 同弦樂器 → 新生運動廣場 → 大口漢堡 → 南洋戲院（門廳，現在是一張圖貼在正面）→ 汀州路 → 公館；`views/tz_*`、公館三張窗景重拍。
