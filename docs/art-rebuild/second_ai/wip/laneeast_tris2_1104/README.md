# LANEEAST-TRIS2-1104：溫州街 lane_east 三角形第二次減量（LAWWW2-C，2026-11-04）

狀態：交給 LAWWW-C 整合。瀏覽器的實際數字還沒量，要請 CC 在 PC 上跑 `tests/wz_street_integration.py`（D131）。

## 先釐清數字
- BB_255 表上的「lane_east 45.6 萬」，是 CC 在 **75a095355** 量的（`local_out/CAFE230v2_wzstreet`）。那個版本比第一次減面 1d64f3511／d2a692410 還早。
- d2a692410 在 PC 上量到 lane_east **419,713（PASS，≤ 42 萬）**（`local_out/WZ4_wzstreet`）。
- 之後 060a1a093（小路木立面 v1）讓整條街的 `wz_in_tiles_wenzhou` 多了 1,442 個三角形。這個網格在每個鏡頭裡都會畫，所以現在大概在 42.1 萬上下，可能剛好超過。

## 這次改了什麼（只改 `tools/blender/env_second/wz_street.py`，重新匯出 `wenzhou_street.glb`）
1. **整條街共用的四種大材質照 x 切四段**：`cafe_vc_wz_matte`、`cafe_vc_wz_metal`、`wz_wall_tile`、`wz_in_tiles_wenzhou`。
   - 原本這四種各自整條街一個網格，合計 4.9 萬個三角形，不管鏡頭看哪裡都整條畫。
   - 現在合併以後照每個面的中心 x 切（x < 5／5～18／18～31／≥ 31，切在棟和棟中間），名字是 `wzx<段>_<材質>`，材質不變。
   - 第一版照零件中心切，切不開：很多零件本身就跨半條街。
2. **店裡隔著玻璃的東西，背對街道的面刪掉**（−5,104 個三角形）：`sk_*` 物件上 `wz_in_*` 材質的面（貨架商品、書、水果、桌椅）。
   - 刪的是法線朝店裡後牆的面：A 側朝 +z、B 側朝 −z。這些面從街上永遠看不到。
   - 單面材質雖然顯示卡會剔除，但 `renderer.info` 照樣算三角形、照樣送進去，刪掉才真的少。
   - 店內是另一個區域、另一個 GLB，不受影響。

## 結果
- 整顆 GLB：128,837 → **123,737** 三角形；網格 71 → 83；材質 46 個不變；`props.json`（導航用的雜物腳印）一模一樣。
- 鏡頭裡看得到的三角形（Python 照 three.js 的包圍球視錐裁切估的，只算這顆 GLB 的這一輪、不含陰影；直向 390×844、垂直 46°）：

| 鏡頭 | 修改前 | 修改後 |
|---|---|---|
| lane_east | 85,190 | **71,289**（−13,901） |
| lane_west | 77,466 | 75,976（−1,490） |
| arcade | 83,218 | 73,839（−9,379） |

- 估計 lane_east 從約 42.1 萬降到約 40.7 萬。
- 陰影那一輪大概省不到：測試是 17:30，太陽在西邊，陰影相機順著整條街，四段都在裡面。
- draw call 估計多 10～13 次：鏡頭裡每種材質多 1 段，陰影那一輪三種投影材質各多 3 段。d2a692410 是 287，估計到 300 左右，上限 310。
- 畫面沒有變：同一個 Blender 鏡頭拍修改前／修改後（`lane_east_arcade_before_after.jpg`），差大於 24 的像素是 0。

## 測試（Node，開發分支 fd989b03c＋新 GLB）
- `singleside_streets_unit`：第 3 項的三角形數本來就是固定比對（128,837），照這次改成 123,737，見 `singleside_streets_unit_fd989b03c.patch`。改完 8/8 PASS。
- `street_props_nav_unit` 7/7、`wz_copy_shop_unit` 16/16、`cafe230_nobldg_nav_unit` 12/12、`zone_prewarm_unit` 25/25：PASS，和修改前一樣。
- `lampshade_flip_unit`：「溫州街 店內吊燈（3 盞）0 個三角形」FAIL，**修改前在 fd989b03c 上就 FAIL**，和這次無關，另外再查。

## 注意
- `wz_street.py` 每次匯出的三角形會差幾個（刪底面那一步差 8 個左右）：建模流程本來就不是每次都一模一樣。交件的是測過的那一顆（123,737）。
- 瀏覽器：請 CC 跑 `tests/wz_street_integration.py`，看三個鏡頭的 draw call ≤ 310、三角形 ≤ 42 萬。
