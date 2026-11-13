# 東南大聯 v2.1、客居 P2、聯通零件盒＋SHOP-FIRST-APPROACH r8（LAWWW2-C 2026-11-13）

## 東南大聯商行 v2.1（SHOP-REALISM-1112；LAWWW-C 退回 v2：11.8 萬面；BB_379 末節三點）
- **面數**：78,902 面（v2 是 11.8 萬，大店上限 8 萬）。逐行量面數以後減掉的有：
  - 罐頭 PH 減面 0.1→0.03，疊兩層的少一點；
  - 塑膠籃、米袋加大減面；
  - 杯麵 12 邊改 8 邊、疊兩個的機率 35%→15%；
  - 掛著的零食串改成方塊（原本是圓角方塊）；
  - 飲料籃裡看不到的瓶身拿掉，只留瓶蓋；
  - 泡麵袋的封口改成印在包裝圖上。
- **BB ① 零食是硬方盒** → 枕頭形袋子：薄袋身，正面中間鼓起 4.5 cm（2×3 格曲面，邊緣貼回袋身），上緣一道封口。
- **BB ② 杯麵是六角柱、一色一個** → 圓杯（8 邊、平滑法線）＋紙蓋；正面一塊印刷，上寬下窄、跟著杯身斜。
- **BB ③ 端架招牌純色板** → 印刷的特價看板：貼圖集多一列，四款，有爆炸星、假字價錢、一碗麵。
- **P2 零食串偏大** → 每包改成 7×9 cm、比較扁、正面印刷，一串 3～6 包、排得比較密。
- 純色零件 20%，shop_cc0 三項都過。

## 客居雲南 P2（BB_379）
- **扎染布太乾淨、像標靶** → 自畫大理扎染：
  - 靛藍底，一圈圈不規則的環，綁線留下的放射摺痕；
  - 邊緣暈開、斑駁，乘上 ambientCG Fabric036 的布紋；
  - 下緣一排短流蘇；
  - 隔間門簾也換成印花布。
- **牆面空** → 左牆兩幅扎染之間各掛一塊小木層板，上面放 Poly Haven 的 fern_02 和陶罐。
- **天花板雲斑** → 灰泥 vary 0.04→0.015。
- 45,978 面，純色零件 21%。

## 汀州聯通（P2：零件抽屜盒）
- 左後牆的零件抽屜盒改成白、藍塑膠（CC0 材質組），前面貼印刷標籤。
- 維修台上的四個小盒子改成印刷配件盒。
- 21,752 面，純色零件 23%。

## 檔案、測試
- `dongnan_keju_liantong_1113.patch`：底是開發分支 `d587922b01`，`git apply --check` 過。共 18 個檔：
  - 三間的 GLB、json、光照貼圖兩張、`lightbake/*_lm.json`；
  - `tz_shops_interior.py` 整檔。裡面多一段 `TRIS_PROF=1` 才會開的面數量測，平常不跑；
  - `LICENSES.md`：東南大聯 PH 模型 5 列、材質 4 列；客居 fern_02、Fabric036 各一列；陶罐那一列補上層板陶罐；
  - `tests/shop_cc0_baseline.json`：拿掉東南大聯，43→42。
  - `SHOP_STANDARD_STATUS.md` 請跑 `place_gate --write`。
- 測試（在 d587922b01 上套 patch 以後跑）ALL PASS，共 18 支：
  - tz_shops、shop_cc0（三間三項都過）；
  - tz_dongnan_aa823、tz_keju_aa825、tz_liantong_aa824、tz_yuehaochi_aa821；
  - tz_shops_notrap、tz_shop_views、tz_front_lit；
  - shop_real_inside、gg_real_inside、wz_real_inside；
  - tingzhou、tingzhou_places、tingzhou_walkers；
  - shop_viewpanes 1／2、l118_shops_notrap。
  - place_gate 只差狀態表過期。
- 截圖：
  - `cmp_dongnan_v21.jpg`：最上面是概念圖；左邊是退回的 v2，右邊是 v2.1；
  - `cmp_keju_p2.jpg`：左邊是已整合的 v1，右邊是 P2；
  - `close_dongnan_keju_liantong.jpg`：中間走道和端架、客居左牆、聯通抽屜盒、東南大聯從裡面朝門口。

## SHOP-FIRST-APPROACH r8（場景效能 D108；CC r7 0b32cab5cc）
- **原因**：r7 在畫面外把整間先畫一次，所以 `step.pre` 這一步本身就成了長幀——公館 G03 153 ms、新生南路 shanlan 115 ms。compile 只剩約 2 ms，剩下的時間花在頂點上傳和第一次用到的光照貼圖上傳。
- **改法**（`src/zones3d.js`）：
  - 先畫改成分幀：零件照頂點數分組，一幀只畫 12,000 個頂點以內，其他零件這一下先藏起來，畫完照原樣還原；
  - 光照貼圖（白天、晚上）排進貼圖上傳那一段先傳；
  - `?noshoppre` 照舊可以關掉。
- **測試**：
  - 新增 `tests/shop_first_pre_r8_unit.js`，改之前 FAILED 7，改之後 ALL PASS；
  - shop_real_inside、gg_real_inside、wz_real_inside、tz_shop_views 照舊 ALL PASS。
- **patch**：`shop_first_pre_r8.patch`，底是 d587922b01，只動 2 個檔。
- **還要做**：請 CC 在電腦上跑 FIRST_* r8（公館、新生南路，一般和 ?noshoppre 各一趟），看 step.pre 最長一幀、>50 ms 的次數。真機時間我沒量。
