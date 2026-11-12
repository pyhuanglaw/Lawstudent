# SHOP-CLOSED-SIGN-1112（SHOP-STANDARD-BACKFILL-1112；店面標準 §12 第 1 點「打烊看得出來關了」）

- 問題：打烊的店，招牌、店內、門口的光暈還亮。
  - 公館：十三間店櫥窗改成真的店內以後沒有窗卡，光暈認不出是哪一間，只剩五間會熄。
  - 溫州街、汀州路、新生南路：本來就沒有「照店熄光暈」。
- 改法：
  - `src/zones3d.js` `ggShopLit(root,zone,real)`：多收 `GG_SHOP_REAL`，那幾間各佔一格、光暈照那一棟的寬分（13 格，上限 16）。
  - `src/zones3d.js` 新 `Z3.shopRealGlow(g,模型名,zone,清單)`：各街共用——光暈照位置分給那一間（室內範圍＋店門前後 4 m），沒開就不畫；只收店自己的燈，騎樓燈、住家門燈、壁燈、路燈不動；最多 32 間。溫州街（`Z3.wzShopReal` 匯出）、`src/tingzhou3d.js`、`src/xinsheng3d.js` 各叫一次。
- patch：公館那一半（v1）LAWWW-C 已合進開發分支 f4d136ef4c；各街共用那一半＝`shop_closed_sign_streets_v1.patch`（對 f4d136ef4c `apply --check` 過）。
- 測試（Node，模擬）：新 `tests/gg_closed_sign_1112_unit.js`（公館 13 間每間 2～7 個、62 盞騎樓燈不分）、`tests/shop_closed_sign_1112_unit.js`（溫州街 15 個光暈 4 間、汀州路 13 個 7 間、新生南路 1 個）ALL PASS；`gg_glow_shoplit`、`gg_lit12_1112`、`gg_real_inside_1112`、`gg_shoplit_reentry`、`gg_shops2_1104`、`shop_real_inside_1112`、`xinsheng_unit`、`place_gate` ALL PASS。
- 沒做：瀏覽器。請 CC 拍 23:30 公館、汀州路、溫州街各一張（招牌暗、騎樓燈和路燈亮）。
- 先將就的：
  - 溫州街只有四間（OFFBEAT、林家乾麵、小路、SUNNY SIDE）會熄；其他店（阿德、一盞、木曜日、2:30 AM、日常失速、紅茶、冰菓室…）不在「真的店內」清單，招牌還亮——下一包給溫州街一張「哪一棟是哪一間」的表。
  - 118 巷另一套（L118-CLOSED-LOOKS-OPEN-1112）。
  - 鐵捲門還是一片平的。
