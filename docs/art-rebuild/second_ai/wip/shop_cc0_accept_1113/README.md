# SHOP-CC0 幫手交件驗收（LAWWW2-C，2026-11-13）

## 公館燒臘 v8（幫手 g4，claude/shop-cc0-g4 37a58d3de）— PASS

- 驗收底：開發分支 5057ca2f14，套 g4 的 `shaola_v8.patch`（3way 乾淨）。
- `shop_cc0_unit`：燒臘三項同時成立（Poly Haven：CashRegister_01、plastic_crate_02、cardboard_box_01；ambientCG 材質組；純色零件 18%）。ALL PASS。
- `place_gate_unit`：ALL PASS（新的問題 0）；`--coplanar` 燒臘牆疊面 3.50→3.49 m²（沒變多）。
- 回歸：shaola_wire、gg_new_lm、shaola_order_1112、noodle_seat_ap、yejian_buy_1112、shop_viewpanes_1105 ALL PASS。
- 看圖（並排圖 g4 分支 `docs/art-rebuild/second_ai/shop_cc0_g4/shaola_cmp.jpg`）：切肉盤從等大方塊格子改成一片一片角度不同的肉片（D159 那一點修掉）；不鏽鋼、紅凳、木、紙箱有紋路；座位、導航、菜單沒動。
- 補上的：g4 的 patch 沒有 `tests/place_gate_coplanar.json`、`docs/handoff/SHOP_STANDARD_STATUS.md`（跑 `--write` 重產），`shaola_v8_full.patch`＝g4 的 patch＋這兩個檔，**LAWWW 直接套這一份**（底 5057ca2f14）。
- 還沒做：CC 地點關卡第二層四個鏡頭、BB 判美術。

## 青木茶室 v2（幫手 g2，claude/shop-cc0-g2 24957fd305）— PASS

- 驗收底：開發分支 19399e5d39，套 g2 的 `aoki_cc0.patch`，乾淨。
- v1 退回的兩點都改了（並排圖 g2 分支 `docs/art-rebuild/second_ai/cc0_g2/aoki_cmp.jpg`「近看吧台」「參考鏡頭」）：
  - 吧台高腳凳凳面改回木頭；
  - 吧台正面直木條改成和吧台同一個 walnut_veneer，整片直紋，像參考圖。
- 檯面改成大理石紋，比 v1 更接近參考圖。
- `shop_cc0` ALL PASS（純色 12%）。
- `place_gate` ALL PASS（重產狀態表後）；`--coplanar` 青木牆疊面 1.01 m²。
- 回歸：gg_new_lm、gg_real_inside_1112、gg_interiors_1104、seat_reach、tap_seat_reach、l118_seat_reach、shop_viewpanes／viewpanes2 ALL PASS。
- **LAWWW 套 `aoki_v2_full.patch`**（底 19399e5d39）：g2 的 patch＋重產的 `SHOP_STANDARD_STATUS.md`。
- 還沒做：CC 第二層四鏡頭、BB 判美術。

## 阿德影印 v2（幫手 g4，claude/shop-cc0-g4 17538fd36）— PASS（附一個之後補的 P2）

- 驗收底：開發分支 19399e5d39，套 g4 的 `docs/art-rebuild/second_ai/shop_cc0_g4/ade_v2.patch`。乾淨；這一份已經含重產的狀態表、coplanar，**LAWWW 直接套 g4 的 patch**。
- `shop_cc0` 三項過：Poly Haven potted_plant_01、desk_lamp_arm_01、vintage_stapler；ambientCG 材質組；純色零件 14%。
- `place_gate` ALL PASS；`--coplanar` 沒有新的。
- 回歸：ade_seat_clip、ade_seats_nav、ade_v1c、gg_new_lm、wall_dir_inherit、wz_shops／shops2／shops_cam／shops_lm、wz_work_spots、zq_arcade_* 等 17 支 ALL PASS。
- 看圖：
  - 前面的大盆栽換成掃描的真盆栽。
  - 金屬、塑膠、紙箱有紋路。
  - 整體和參考圖的配置一樣。
- **P2（下一輪補，不擋整合）**：鐵層架上的便利貼一排四塊大小一樣（D159「同類東西大小、角度要有變化」）。請 g4 南洋做完以後改成高低、大小、角度不一，有的拆封散開，然後重烘。
- 還沒做：CC 第二層四鏡頭、BB 判美術。

## 一盞（店內）＋小路、SUNNY SIDE v3 小修（幫手 g1，claude/shop-cc0-g1 58a50cc2cb）— PASS

- 驗收底：開發分支 19399e5d39，依序套 g1 的三份 patch，都乾淨：`yizhan_cc0.patch`、`komichi_v3_cc0.patch`、`sunnyside_v3_cc0.patch`。
- **一盞**：
  - Poly Haven 掃描模型：電水壺、兩種藤籃、陶甕。
  - ambientCG 材質組：灰泥、塑膠、金屬、布。
  - 純色零件從 32% 降到 13%，面數 23.9k。
  - 互動點、座位、導航、店員、找貓支線節點都沒動。
  - 看圖：水屋的壺、緣側的甕換成掃描模型；地板照 D112 用淺色木。
- **小路、SUNNY SIDE v3**：只換貼圖，把大面積淺色零件上雲狀的斑壓低。看圖沒有退步。
- 測試：
  - `shop_cc0` ALL PASS。
  - `place_gate` ALL PASS（重產狀態表後）；`--coplanar` 三間牆疊面：一盞 1.22、小路 0.75、SUNNY SIDE 1.34 m²。
  - 回歸：teahouse_tap、teahouse_yard_cam、wz_teahouse_seats、wz_teahouse_yard、yizhan_place、te_komichi_stage、wz_shops*（4 支）、wz_interiors_aa659、room_ceiling ALL PASS。
- **LAWWW 套 `g1_yizhan_komichi_sunny_full.patch`**（底 19399e5d39）：三份合一，加上重產的狀態表和 coplanar。
- 還沒做：CC 第二層四鏡頭、BB 判美術。

## 木曜日（幫手 g1，claude/shop-cc0-g1 c5f00f9619）— PASS（附兩個之後補的 P2）

- 驗收底：開發分支 19399e5d39，套 g1 的 `mokuyobi_cc0.patch`，乾淨。
- `shop_cc0` 三項過：
  - Poly Haven：potted_plant_04 窗台兩盆、book_encyclopedia_set_01 東牆精裝書；
  - ambientCG 材質組：灰泥、塑膠、金屬、布、皮革；
  - 純色零件 38% → 9%；面數 66.6k（大店 ≤8 萬）。
- `place_gate` ALL PASS（重產狀態表後）。
- 回歸：mokuyobi_unit、mokuyobi_aa618、moku_stair_void_1112、moku_exam_seats_1110、mokuyobi_stair_top_1111、mokuyobi_plant_corner_1111 ALL PASS。
- **P2（下一輪補，不擋整合）**：
  1. 東牆矮櫃上那盆大葉植物還是程式拼的平面葉片（近看一片片切面）。請換成 Poly Haven 盆栽，potted_plant_01／02 都已經在用。
  2. 「店門往裡看」新版畫面右上角多了一團大葉子貼著鏡頭（20:00 也有），請查是哪一盆，是不是 v3c 黃金葛的藤垂到門口鏡頭前；是的話往裡收。
- **LAWWW 套 `mokuyobi_full.patch`**（底 19399e5d39）：g1 的 patch＋重產的狀態表。
- 還沒做：CC 第二層四鏡頭、BB 判美術。

## 日常失速（幫手 g1，claude/shop-cc0-g1 912ca51920）— PASS（附一個 P2；另記一個窗景問題歸 LAWWW2）

- 驗收底：開發分支 19399e5d39，套 g1 的 `daily_offbeat_cc0.patch`，乾淨。
- `shop_cc0` 三項過：
  - Poly Haven：potted_plant_04 三盆、croissant 長桌上的麵包；
  - ambientCG 材質組；
  - 純色零件 32% → 11%；面數 65.7k。
- `place_gate` ALL PASS（重產狀態表後）。
- 回歸：wz_offbeat、offbeat_aa618、offbeat_cat_board、offbeat_storefront ALL PASS。
- **P2（g1 下一輪補，不擋整合）**：天花板吊的幾盆植物還是程式拼的大平面葉片，「店裡朝店門」那張看得最清楚；請換成掃描植物，或改成垂吊的黃金葛藤（木曜日 v3c 那一套）。
- **另記（LAWWW2 自己查，WINVIEW-AUDIT-1105）**：並排圖 20:00 那張，東側落地窗外還是白天的綠樹，新舊版都一樣。WZ_VIEW 只有正面 WALL_front_VIEW 照時段換夜景，側面那片窗景卡大概沒有夜版。
- **LAWWW 套 `daily_offbeat_full.patch`**（底 19399e5d39）：g1 的 patch＋重產的狀態表。如果先套了木曜日，render_interior.py、aa_cc0.py、glb_swap_images.py 內容一樣，會報「已經存在」，用 `--exclude` 略過。
- 還沒做：CC 第二層四鏡頭、BB 判美術。

## 南洋戲院大廳 v6（幫手 g4 dc93e7768e）——LAWWW2-C 驗收 PASS（2026-11-13 23:4x UTC）
- 套法：**直接套 g4 的** `docs/art-rebuild/second_ai/shop_cc0_g4/nanyang_v6.patch`（在 `claude/shop-cc0-g4` 上；底 4556c4be0；對 bf9d623e69 `git apply --3way` 乾淨；已附 SHOP_STANDARD_STATUS.md、coplanar）。
- 內含 `bb_support/cc0kit.py` 的 ph_obj 高度快取修正（181e2a27c 那一段）；燒臘、阿德、洋洋之後的 patch 若也帶這段，以先套的為準、後面 `--exclude` 或 3way。
- 測試（套在 bf9d623e69 上）：shop_cc0 ALL PASS（南洋三項同時成立；baseline 刪一列）、place_gate ALL PASS（已知未過 11＝SHOP-WINDOW-3D）、nanyang_unit／bench／staff_1107／tap 四支 ALL PASS。38,539 面。
- 看圖（`shop_cc0_g4/nanyang_cmp.jpg`）：垃圾桶換 Poly Haven metal_trash_can（有壓邊、紋路）、櫃檯收銀機 CashRegister_01，粉紅方塊減少。
- P2（不擋，下一版再補）：①飲料櫃裡的瓶子還是純色瓶形；②櫃檯那疊紅杯子是一整塊；③入口左邊的黑色立式方箱（看起來像音箱）是純黑方塊，參考圖這位置沒有，可以換掃描模型或拿掉。

## 阿德影印 v2.1（幫手 g4 cb8fabdd4）——LAWWW2-C 驗收 PASS（2026-11-13 23:5x UTC）＋南洋 v6 合併成一包
- 看圖（`shop_cc0_g4/ade21_cmp.jpg`）：v2 的 P2「便利貼四大塊一樣大」改好——每格 1～3 疊、邊長 7.5～12 cm、厚度不一、各轉 ±20°，一疊拆封散開。33,142 面。
- **開發分支已經到 626c128e54（青木 v2 整合）**，g4 的 nanyang_v6.patch、ade_v21.patch 各自都會在 LICENSES.md／狀態表衝突，兩包先後套也會互相衝突。所以我在 626c128e54 上把兩間合成一份：
  **`nanyang_ade_on626c128e54.patch`**（17 個檔；LICENSES 兩邊的列都留、狀態表和 coplanar 用 place_gate `--write` 重新產生）。**請套這一份，取代上面「南洋 v6 直接套 g4 的」和 g4 的 ade_v2／ade_v21。**
- 測試（套在 626c128e54 上）：shop_cc0 ALL PASS、place_gate ALL PASS（已知未過 11）、ade_seat_clip／ade_seats_nav／ade_v1c／gg_new_lm／wall_dir_inherit／wz_shops／wz_work_spots、nanyang 四支、cinema_work_spot_1112、shop_real_inside_1112、xs_lm、seat_reach、tap_seat_reach、l118_seat_reach_1112、shop_npc 全 ALL PASS。
- P2（不擋）：筆筒區的筆是一根根純色圓柱（v2 就這樣，BB 判 v2 時沒列）；之後有空可換掃描的筆筒。
