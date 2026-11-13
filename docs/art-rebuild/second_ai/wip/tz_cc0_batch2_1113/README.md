# 汀州路 CC0 第二批（SHOP-REALISM-1112；D159／D160／D161；LAWWW2-C 2026-11-13）

一個 patch 五間：**印得好 v2、洗樂 v3、聯通 v1、客居 v1、越好吃 v1**。原始碼 `tz_shops_interior.py` 整份換（CC0 名單開到這五間＋泰米；**東南大聯不在裡面**：貨架還是一樣大小的方塊排格子，做 v2 再交）。
用 patch 裡的原始碼重建五間，大小和交出去的模型（烘焙用的那份）完全一樣——原始碼和模型一致。

## 每一間改了什麼
- **印得好 v2**（BB_379 末節 372fcad0b1 ①② FAIL＋P2）：層架改成一疊疊影印紙（每疊 2～7 包、厚薄不同、橫放直放混著、拆開的散紙）＋Poly Haven 精裝書一排＋頂層 Poly Haven 紙箱（大小角度不同）；櫃台：真的螢幕（外框、發光畫面、頸、底座）、鍵盤一排排按鍵、滑鼠、小印表機（機身、上蓋、出紙匣、一張紙、電源燈）、螺旋裝訂講義一疊疊（本數高低方向不同）、筆筒、Poly Haven 釘書機、壓克力架上斜靠的螺旋筆記本；影印機中間藍紙匣、深灰上蓋、支架上的觸控螢幕；後牆 Poly Haven 紙箱；天花板灰泥雲斑壓到 4%。並排圖最上面是參考圖 int_yindehao。
- **洗樂 v3**（BB_379 洗樂 P2）：滾筒＝亮筒壁＋暗筒底＋最深一點（看起來往裡凹）、網孔改圓、擋板、玻璃上一道反光；白／藍塑膠黑紋修掉（Plastic006 vary）。海報、洗衣精瓶還沒做。
- **聯通 v1**：白色櫃子、溝槽板、櫃台、盒子 → 白塑膠；鋁框 → 不鏽鋼；招牌藍 → 藍塑膠；Poly Haven 金屬圓凳兩張（套 CC0 黑鐵）、維修台 Poly Haven 檯燈、櫃台 Poly Haven 盆栽；輕鋼架天花板。純色零件 23.8%。
- **客居 v1**：木頭直條、櫃子 → 木頭材質組；Poly Haven 圓木凳 16 張、陶鍋（上成砂鍋的深褐）13 個、落地盆栽；廚房白磁磚。
- **越好吃 v1**：竹條櫃台、斗笠 → 藤編（Wicker010A）；外帶紙袋 → 紙箱；Poly Haven 梯背椅（共用）、落地盆栽、窗台小盆；廚房白磁磚。

## 檔案
- `tz_cc0_batch2.patch`（底＝開發分支 `6b7619ccba`，`git apply --cached --check` 過）：5 間的 GLB／json／光照貼圖兩張／`lightbake/*_lm.json`、`tz_shops_interior.py`、`bake_tz_shops.sh`、`LICENSES.md`、`tests/shop_cc0_baseline.json`。`SHOP_STANDARD_STATUS.md` 不在裡面（請 `place_gate --write`）。
- 並排圖：`cmp_yindehao_v2.jpg`、`cmp_xile_v3.jpg`、`cmp_liantong_v1.jpg`、`cmp_keju_v1.jpg`、`cmp_yuehaochi_v1.jpg`（最上面一列參考圖）。

## 還沒做
- 手機效能（面數：印得好 6.5 萬、越好吃 5.1 萬、洗樂 4.8 萬、客居 4.4 萬、聯通 3.6 萬）。
- 東南大聯 v2（貨架重做）；公館安泰、榮恩典、鮮果、禮貌生財。

## 測試（在開發分支＋這個 patch 的檔上）
tz_shops_unit、shop_cc0_unit（五間三項都過：掃描模型、CC0 材質組、純色 <25%；基準表拿掉聯通、客居、越好吃）、tz_shops_notrap、tz_shop_views、tz_front_lit、tz_liantong_aa824、tz_keju_aa825、tz_yuehaochi_aa821 ALL PASS；place_gate 只差狀態表要重產。
