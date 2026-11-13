# WINVIEW-AUDIT-1105：公館第三批三間在原位重拍窗景（LAWWW2-C，2026-11-13）

安泰藥局（G04）、汀州鮮果（G08）、榮恩典文具社（G13）的窗外，現在借的是別間的照片：`tz_shops_layout.js` 的 view 分別是 cvs、noodle、bookstore（207d70f5f README「沒做」第 3 點）。那些照片是在別的位置拍的，差幾十公尺，對街的東西位置不對。

1. **這一包**（`gg3_views.patch`，底開發分支 19399e5d39）：`tools/shots/shop_views_layers.py` 加三組鏡頭：`gg_antai`、`gg_xianguo`、`gg_rongendian`。
   - 鏡頭 x＝店中心（zones3d.js 的 mk：−18.6、19.6、64.1）。
   - 高度＝窗中心（1.46、1.5、1.48 m）。
   - z 21.7＝店面玻璃內側，和 noodle、yejian 同一套。
2. **CC 拍**（D131，瀏覽器排使用者電腦）：`python3 tools/shots/shop_views_layers.py <網址> gg_antai gg_xianguo gg_rongendian`。會產生：
   - `assets/models/env/views/gg_{antai,xianguo,rongendian}_{day,night}.webp`；
   - `_near_` 兩張；
   - `tools/shots/shop_views_layers.json` 的景深。
3. **LAWWW2 接**（照片回來以後）：
   - `src/data/tz_shops_layout.js` 三間的 view 換成新名字；
   - `world3d.js` 的 VIEW_LAYERS 照 json 補三列；
   - 跑 `tests/tz_shop_views_1112_unit.js`；
   - 前後並排交 LAWWW、BB 判。
