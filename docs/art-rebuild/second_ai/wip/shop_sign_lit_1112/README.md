# SHOP-SIGN-LIT-1112（SHOP-STANDARD-BACKFILL-1112；BB 17:4x 公館燒臘 23:30 鐵門拉了招牌還亮；店面標準 §12 第 1 點）

- 原因：街景模型的招牌板面（`SIGN_FACE_*`、`VSIGN_FACE_*`）在 `attachWenzhouModel` 裡全部合成一張 `wz_signs_atlas`，晚上整片一起亮（`TK.addNight`），不分哪一間——打烊的店招牌照樣亮，不只燒臘（汀州路 102 塊、新生南路 2 塊、公館 3 塊）。
- 改法（`src/zones3d.js`）：
  - `wzAtlasFaces`：合併前每一塊板面記 `aItem`（第幾塊），`userData.atlas.items` 多記中心 `c`。
  - 新 `Z3.shopSignLit(root,zone,list)`：每一塊先看名稱有沒有那一棟的編號（`SIGN_FACE_G00`、`VSIGN_FACE_Tdongnan_t_a`），沒有再照位置分給那一間（店面寬＋0.4 m、前後 6 m）；著色器把那一間沒開的板面發光乘 0（字照樣看得到，只是不亮）。
  - `ggShopLit`（公館，有真的店內清單時）和 `shopRealGlow`（溫州街、汀州路、新生南路）各叫一次；同一個網格不重複接。
- 同一包：溫州街光暈表（WZ_GLOW_ONLY）加阿忠鮮果（wz_fruit，B6 x 30～40，AA 定的營業時間，LAWWW ec4e20f59c）；夏日冰菓室已在表裡，營業時間改全年以後照 PLACES.isOpen 自動跟上。
- 順手修兩支過時的測試（開發分支上本來就紅，是我之前招牌燈那兩包改了它們比對的那一行）：`shop_window_rects_1112`（匯出那一行多了 shopRealGlow）、`wz_real_inside_1112`（溫州街那一句改成先存 wr）。
- patch：`shop_sign_lit_v1.patch`（對開發分支 a57b6ec8ab `apply --check` 過；動 `src/zones3d.js`＋新測試＋兩支舊測試各一行）。
- 測試（Node，模擬）：新 `tests/shop_sign_lit_1112_unit.js` ALL PASS（修改前 FAIL）——燒臘橫招牌＋兩面直立招牌分給燒臘；汀州路名稱帶那一棟的都分對、別人家的不分給真的店內；03:00 打烊＝0、15:00＝1。回歸：place_gate＋tests/gg_*、shop_*、wz_*、tz_*、tingzhou*、xinsheng*、xs_* 共 97 支——只有上面那兩支過時的紅（開發分支上也紅），修好以後 ALL PASS。
- 沒做：瀏覽器（請 CC 拍公館燒臘 23:30、汀州路 23:30 招牌）。
- 先將就的：
  - 只管「真的店內」清單裡的店；其他店（汀州路 Te_／Tw_ 那一排、新生南路 W02／W11）沒有營業時間資料，招牌照舊整晚亮。
  - 越好吃小館在汀州路街景模型裡沒有 SIGN_FACE 板面（招牌是別的網格），這一包管不到；要再查它的招牌是哪一個網格。
  - 騎樓燈（燒臘門前那三盞）照舊不熄，等 BB 決定。

## v1 合進去以後發現的錯（shop_sign_tenant_v1.patch，對開發分支 cfc0fd04bf apply --check 過）
- 汀州路名稱帶 `_t_a／_t_b`（wz_street.py 的 vtenant）和 `_2F` 的招牌是**樓上住戶／二樓別家**的（套房出租、按摩、桌遊二樓、鋼琴教室、美髮造型），v1 照名稱把它們分給一樓那間店 → 一樓打烊時樓上的招牌也跟著暗。改成這兩種名稱一律不分（照自己的時間亮）。
- 測試加一條：樓上住戶的招牌不分給真的店內。現在汀州路分到的是泰米村食、洗樂洗衣坊、印得好的直立招牌各 2 塊。
- 東南大聯、汀州聯通、科舉、越好吃在汀州路街景模型裡**沒有自己的招牌板面**（只有樓上住戶的直立招牌），所以這四間的招牌燈這一套管不到——要在 wz_street.py 給它們加招牌板面才行（模型那邊的事，另開）。

## TZ-FRONT-LIT（tz_front_lit_v1.patch，對開發分支 0c57971f3c apply --check 過）
- 東南大聯、汀州聯通、客居雲南、越好吃的招牌其實有，在店面板 `xs_fronts_lit`（招牌字、玻璃後的亮光；第二組 UV＝店編號，extras.xsShops＝tzxile,tztai,tzwen,tzlian,tzdong,tzkeju,tzyue,limao）上，不是 SIGN_FACE 板面。汀州路原本沒有叫 `Z3.ggShopLit`，整晚亮。
- 改法：`src/tingzhou3d.js` 接街景模型以後叫 `Z3.ggShopLit(tzR,zone,S.SHOP_LIT_PLACE,{glow:false})`（新生南路同一套）；`S.SHOP_LIT_PLACE` 七間 → tz_* 地點（溫特寶邸還沒有營業時間＝照舊亮）。光暈照舊歸 shopRealGlow。
- 測試：新 `tests/tz_front_lit_1112_unit.js`（修改前 FAILED 2）＋tingzhou*／tz_*／shop_closed_sign／shop_sign_lit／place_gate 全過。瀏覽器沒拍。
