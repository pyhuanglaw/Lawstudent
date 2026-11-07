# PERF-WZ-SHADERS：溫州街少編幾個 shader（LAWWW2-B 2026-11-07）

**派工**：LAWWW-B 11:42、11:48，在 PERF-WZ-DAY-1103 底下。

**起因**：CC-B 量 PERF_COLD_PERSIST 時發現，溫州街第一次進去的黑畫面主要花在 shader 編譯（d3d11）：
- base 在黑畫面裡編 54 個、淡入以後還有 28 個；
- near 在黑畫面裡編 82 個。

**狀態**：
- 模型端（這一包）已做。畫面應該不變，要 CC 拍改前改後確認。
- 引擎端的點光源固定（`?fixlights=3`）是下一包。

## CC 的清單（雲端 8fdb294aa，`wz_shaders_cloud_8fdb.json`）

- 白天：104 個 program，有人用的 75 個；晚上：101 個，有人用的 72 個。
- 分析工具在這個資料夾：
  - `progs.py`：拆 cacheKey，列出只差一個欄位的配對；
  - `cand.py`：只有我的模型在用、而且只差一個欄位就能併進現有 program 的；
  - `sig.py`：直接看 GLB 的材質組合，不用開遊戲。

**最大的一項在引擎**：
- 有 15 組只差 numPointLights（0／3）：人物的 MToon、MeshToon、陰影 depth。
- 溫州街白天、晚上都是 3 盞點光源。0 盞的那一份是上一個區域編的。
- 所以在有點光源和沒有點光源的區域之間移動，人物和共用材質全部重編。
- LAWWW-B 決定先做 `?fixlights=3` 的實驗（下一包）。

## 模型端改了什麼（預估每個時段少 4 個 program）

| 材質 | 改法 | 併進（白天的編號） | 畫面 |
|---|---|---|---|
| `wz_sf_vend_panel`、`wz_sf_lamp_cool` | 頂點色 VEC4 改 VEC3（alpha 全是 1） | #63（腳踏車、Café 頂點色那一組） | 一樣 |
| `cafe_leaf_fern`（沒有 instancing 的那一份）、`wz_fruitprice` | 同上 | #61 | 一樣 |
| `offbeat_storefront` | 只有自發光貼圖、底色黑色：底色貼圖接同一張，乘 0 還是 0 | #103（招牌：底色＋自發光） | 一樣 |
| `wz_in_price_u`、`wz_in_board_u` | 雙面改單面 | #112（`wz_in_goods`） | 正面朝店面玻璃（街），見下面 |

- 黑板 `wz_in_board_u` 在 CC 那一刻沒編 program，因為鏡頭沒看到 B7。鏡頭轉過去才會編，所以一起改。
- `cafe_glass`、`wz_in_tiles_wenzhou` 的頂點色也是 VEC4、alpha 全 1，順便改 VEC3。不會多出 program，也不一定會少。

**哪裡做的**：
- `tools/blender/env_second/glb_slim.py` 的兩條通用規則：
  - alpha 全是 1 的 VEC4 頂點色改 VEC3；
  - 只有自發光貼圖、底色黑的材質，底色貼圖接同一張。
- 單面：`wz_street.py` 的單面清單加 `wz_in_price_u`、`wz_in_board_u`，重新產生時就是單面。
- 這次直接改現有的 `wenzhou_street.glb`（`glb_slim.py --single wz_in_price_u,wz_in_board_u`）和 `lane118_street.glb`（只改兩個材質的 doubleSided）。

**價目牌、黑板朝哪邊**：
- 兩條街每一面都檢查了：法線朝向 6 m 內的店面玻璃（街那一側）。
- 一開始我用「和附近平行的店內外殼同方向」來判斷，118 巷是相反的。外殼的方法只是比附近平行的面，挑到的應該是側牆；改用玻璃判斷比較直接。
- 還是要 CC 在遊戲裡從街上看一下，確認看得到。

**沒做的（記錄理由）**：
- `cafe_win_glass` 補底色貼圖：透明雙面在 three.js 會分背面、正面兩輪畫。補了只併掉正面那一輪，背面那一輪變成新的，淨省 0。
- 單面、雙面、alphaTest、instancing 的其他差異：牽涉效能（PERF-SINGLESIDE 改成單面的牆）或畫面（葉子要透明），不為了少一個 program 改回去。
- `dof_leaf_pothos` 的自發光貼圖：拿掉會改變晚上的樣子。

## 驗證（Node，開發 `126bdf93e`）

**縮檔工具**：從原檔照流程跑一次（`glb_slim.py`），統計是 `color_a1 9、emi_as_map 1、single 2`。

**比對**：
- `glb_vc_compare.py`：其他網格完全相同，draw call（主畫面 94、影子 62）不變；
- GLTFLoader 在 Node 解開：102 個網格名字一樣、位置一樣、法線最大 0.37°、顏色最大 1.1/255。

**測試**：

| 測試 | 開發原樣 | 加這一包 |
|---|---|---|
| `singleside_streets_unit`（`wz_shaders_1107.patch` 更新名單：溫州街 10→12、118 巷 7→9） | FAILED 2 | ALL PASS |
| `wz_slim_unit`（上一包的 patch） | FAILED 5 | ALL PASS |
| 讀這個檔的 7 支：cafe230_nobldg_nav、lampshade_flip、offbeat_storefront、street_props_nav、wz_copy_shop、wz_vc_pack、zone_prewarm | — | ALL PASS |

## 要 CC 量的

- 同一支探針、同一段程式，印 `E.renderer.info.programs`：program 數應該少約 4 個。
- PERF_COLD_PERSIST（base／near）：淡入前的編譯數、黑畫面秒數。
- 溫州街白天、晚上，改前改後同角度截圖，要看到：
  - 價目牌（A1 店）、黑板（B7 店）從街上看得到；
  - 販賣機面板、冷光燈、蕨葉、水果價目牌、日常失速店面的顏色不變。
