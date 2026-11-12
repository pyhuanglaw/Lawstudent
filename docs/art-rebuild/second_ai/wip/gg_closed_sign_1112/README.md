# GG-CLOSED-SIGN-1112（SHOP-STANDARD-BACKFILL-1112；店面標準 §12 第 1 點「打烊看得出來關了」）

- 問題：公館十三間店的櫥窗改成真的店內以後沒有窗卡；招牌、店內、門口的光暈原本靠窗卡的範圍認是哪一間 → 只剩還有窗卡的五間分得到，其他店打烊了招牌還亮。
- 改法（`src/zones3d.js`）：`ggShopLit(root,zone,real)` 多收真的店內清單（`GG_SHOP_REAL`）：那幾間各佔一格（窗卡已經有那個地點的共用同一格），光暈照那一棟的寬分；`upd` 照 `PLACES.isOpen`＋颱風。不傳清單＝照舊。共 13 格（著色器上限 16）。
- patch：`gg_closed_sign_v1.patch`（對開發分支 `apply --check` 過；和 `nav_notch_traps_v1.patch` 改 zones3d.js 不同段）。
- 測試（Node，模擬）：新 `tests/gg_closed_sign_1112_unit.js` ALL PASS（讀真的 `gongguan_shops.glb` 的光暈位置：13 間每間 2～7 個、62 盞騎樓燈不分）；`gg_glow_shoplit`、`gg_lit12_1112`、`gg_real_inside_1112`、`gg_shoplit_reentry`、`gg_shops2_1104`、`place_gate` ALL PASS。
- 沒做：瀏覽器。請 CC 拍公館 23:30 一張（招牌應該暗、騎樓燈亮）。
- 先將就的：
  - 溫州街、新生南路、汀州路沒有這套「照店熄光暈」，打烊了招牌一樣還亮——下一包把這段改成各街共用（照 shopInsideReal 的清單）。
  - 鐵捲門還是一片平的（下一包加捲箱、底條）。
