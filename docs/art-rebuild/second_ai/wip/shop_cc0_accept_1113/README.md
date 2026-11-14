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

## Daybreak（幫手 g2 077485f27e）驗收 PASS＋**最新套法（23:5x UTC，取代本檔上面兩段的套法）**
- 看圖（`cc0_g2/daybreak_cmp.jpg`）：吧台檯面 Marble012、吧台直條木紋、收銀機 Poly Haven CashRegister_01、門口盆栽有盆（potted_plant_02/04）。55,370 面；純色 11%。
- **P1（g2 v2.1 補，不擋這次整合）**：吧台上的義式咖啡機還是灰方盒加三個黑點——BB 判 afar FAIL 就是「咖啡機是白方盒」，這台會被同樣判。照第九批 afar 雙孔義式機的做法（`wz_cafe230`／afar 的 espresso 那段）換掉。
- 另記（LAWWW2 自己的）：從 Daybreak 店內往窗外看，公館街上的行道樹是一顆顆浮著的綠球。
- **開發分支一直在前進**（626c128e54 → fd7794caac → 35de5a923d：阿德 v2、木曜日、日常失速、便利店、cc0_kit part_faces 都已進），我前面出的 `nanyang_ade_on626c128e54.patch` 已刪。**現在請套：`batch_nanyang_ade_daybreak_on_35de5a923d.patch`**（22 檔＝南洋 v6＋阿德 v2.1（在 v2 上只換 GLB／JSON／光照貼圖／腳本）＋Daybreak；LICENSES 兩邊都留、基準表刪南洋／Daybreak、狀態表和 coplanar 重新 `--write`）。
- 測試（套在 35de5a923d 上）：shop_cc0 ALL PASS、place_gate ALL PASS（已知未過 11）、ade／nanyang／daybreak／gg_*／offbeat／cvs／seat_reach／shop_npc／xs_lm 等 44 支 Node 測試 ALL PASS。
- cc0_kit.py 的 part_faces：LAWWW 在 35de5a923d 已補回（g2 23:36 提醒；我這邊也查到同一件事，本來要交的修正 patch 不需要了，已刪）。

## 木曜日 v2.1（幫手 g1 cedaa1c50d）驗收 PASS＋**還沒整合的六包合成一份（00:0x UTC 11-14，取代本檔以上所有套法）**
- 木曜日 v2.1 看圖（g1 `wip/shop_cc0_g1_1113/mokuyobi_cmp.jpg`）：東牆矮櫃那盆換 Poly Haven potted_plant_02（陶盆）；店門鏡頭右上角懸空那團吊盆黃金葛搬到窗邊 (1.8, 3.6)。69,104 面、純色 9%。
  - P2（v2.2，不擋）：矮櫃上方牆上層板的垂藤還是平面葉片卡（v2_fill 第 147 行），近看很明顯。
- LAWWW-C 11-13 23:44Z 請我把還沒整合的在新底上重做一份。**請套 `pending6_on_a40672644e.patch`**（底＝開發分支 a40672644e；46 檔），依序疊了：
  1. place_gate 已知未過 11 列拿掉（`wip/shop_window3d_knownfail_1113/`）
  2. 第九批＋一盞前院 P2／P3（`wip/tz_cc0_batch9_1113/b9_yard_p3_full.patch`：afar 雙孔義式機、2:30 AM 單人沙發 v2、前院 CC0）
  3. ZQ-C504 afar 門口小桌兩椅＋座位（`wip/zq_c504_afar_1113/`）
  4. 花序花束 P2（`wip/flower_notes_p2_1113/`）
  5. 木曜日 v2.1（g1 cedaa1c50d；開發分支已有 v2，所以 GLB／光照／腳本取 g1 版、LICENSES 只多 v2.1 的列；共用工具 aa_cc0.py 等和 g1 分支最新一致）
  6. Daybreak（g2 077485f27e）
  - 解衝突規則：LICENSES 兩邊的列都留；基準表兩邊各刪的列都刪；狀態表、coplanar 用 place_gate `--write` 重新產生。木曜日、Daybreak 的模型和腳本逐檔核對＝幫手交件版。
- 測試（套在 a40672644e 上）：shop_cc0 ALL PASS；**place_gate ALL PASS、已知未過 0 項**（原本 11）；afar／cafe*／teahouse／yizhan／zq_c504／flower*／moku*／daybreak／gg_*／wz_views／wz_shops／offbeat／seat_reach／shop_npc／shop_view*／tz_shop*／wall_dir 共 72 支 Node ALL PASS。
- 還不在這包：Daybreak v2.1（義式機，g2 做）、木曜日 v2.2（垂藤）、洋洋（g4 烘焙中）、日常失速 v2.1（g1 烘焙中）、g2 單車／唱片／山嵐／頁間、g3 五間。

## 洋洋鹹酥雞 v2b（幫手 g4 70a4be126）——LAWWW2-C 驗收 PASS（11-14 00:1x UTC）
- 看圖（`shop_cc0_g4/yangyang_cmp.jpg`）：牆、地、櫃檯、桌椅換 ambientCG 材質組（紋路出來了）；三盆 Poly Haven 陶盆植物（高度照設計，cc0kit 高度快取修好後）；後牆地上四個 Poly Haven 紙箱。58,993 面、純色 18%。
- g4 補了 `lightbake/glb_add_viewcard.py`（bake_gg_new.sh 的 CARD 步驟一直叫它，開發分支沒有，轉角唱片和洋洋重烘都會卡）。bake_gg_new.sh 只改洋洋那一行 NOLM，便利店那行沒動。
- **請套 `yangyang_v2b_on_04ac5af9ed.patch`**（底＝開發分支 04ac5af9ed，已含你整合的六包 5d88e515d8；13 檔）。g4 的原 patch 底 e687f2f3b，在 LICENSES／基準表／狀態表會衝突，我重出了：LICENSES 兩邊都留、基準表從開發分支版刪洋洋一列、狀態表與 coplanar 重新 `--write`。
- 測試（套在 04ac5af9ed 上）：shop_cc0 ALL PASS、place_gate ALL PASS（已知未過 0）、yangyang_shop／yangyang_seat_prio_1112／gg_new_lm／gg_views_1105／gg_views_1107／corner_ceil_1107／close_unify／gg_real_inside_1112／placemap／tz_invite_supper／wall_dir_inherit／seat_reach 等 15 支 ALL PASS。
- P2（不擋）：牆上層架的瓶罐還是純色瓶形。

## 日常失速 v2.1（幫手 g1 37ee5046b9）——LAWWW2-C 驗收 PASS（11-14 00:2x UTC）
- 看圖（g1 `wip/shop_cc0_g1_1113/daily_offbeat_cmp.jpg` 第二列最明顯）：天花板 13 個吊盆的大片平面黃金葛葉片卡 → Poly Haven fern_02 單株。65,431 面、純色 11%。
- **請套 `daily_offbeat_v21_on_e0525231f6.patch`**（底＝開發分支 e0525231f6；狀態表、coplanar 重新 `--write`；aa_cc0.py 和 GLB 跟 g1 交件版完全一致）。木曜日 v2.1 已在六包合成（5d88e515d8）裡，不用再套 g1 那份。
- 測試（套在 e0525231f6 上）：shop_cc0 ALL PASS、place_gate ALL PASS（已知未過 0）、offbeat／wz_shops／wz_views／moku／seat_reach／wall_dir 等 20 支 ALL PASS。
- 下一版（g1 做中）：木曜日 v2.2＝層板那盆＋東牆高書櫃頂上兩盆垂藤換 planter_pot_clay＋fern_02。

## 慢輪單車 CC0（幫手 g2 c180ee1f75）——LAWWW2-C 驗收 PASS（三項過；畫面差異小，要 v2）（11-14 00:4x UTC）
- 看圖（`cc0_g2/bike_cmp.jpg`）：頂點色零件全改 vc_tex（×Plastic006／Metal009 紋路），收銀機換 Poly Haven CashRegister_01。純色 3%（只剩 2 塊玻璃）。跟原本比畫面差異很小。
- **請套 `bike_cc0_on_0c49bcf64e.patch`**（底＝開發分支 0c49bcf64e；LICENSES 兩邊都留、狀態表與 coplanar 重新 `--write`）。
- 測試（套在 0c49bcf64e 上）：shop_cc0 ALL PASS、place_gate ALL PASS（已知未過 0）、bike／gg_new_lm／seat_reach／shop_npc／shop_viewpanes／wall_dir 共 13 支 ALL PASS。
- **v2（g2，P2）**：右牆層架的商品還是一排排純色方盒＋圓柱水壺（D159 那一類）。商品方塊數量減半、改印刷包裝盒（Cardboard001＋品牌色塊、側標），水壺換有瓶蓋、瓶身弧度的；騰出的面數放 1～2 件 Poly Haven 掃描物（打氣筒、工具箱之類）。
- 另：慢輪窗外（視差窗 `assets/models/env/views/bikeshop_{day,night}.webp`）也是 11-05 那批「椰子疊樟樹」，GG-STREET-TREES 一併重拍中（LAWWW2-C）。

## LICENSES.md 去重（LAWWW-C 11-14 00:24 請託）
- `licenses_dedup_on_984cd2ba8d.patch`：刪掉三列一字不差的重複（mokuyobi 的 potted_plant_04、book_encyclopedia_set_01 兩列；`Plaster001、Plastic006、Metal009、Fabric030、Leather037` 那列），各留第一次出現的。shop_cc0、place_gate 在 984cd2ba8d 上照舊 ALL PASS。

## 大口漢堡一樓＋二樓 CC0（幫手 g3 69755b5546）——LAWWW2-C 驗收 PASS（三項過；畫面差異小，要 v2）（11-14 01:1x UTC）
- 看圖（g3 `cc0_help/g3/dakou_cmp.jpg`）：盆栽換 Poly Haven potted_plant_02、窗框桌腳 Metal009、踢腳板 Plastic006、合併的頂點色材質改 vc_tex；牆改自己的平塗材質 dk_wall（油漆牆照 shop_cc0 規則不算純色零件，可以）。純色 17%／7%。面數 27,028／35,773。並排圖上幾乎看不出差別。
- **請套 `dakou_cc0_on_10aa10ed32.patch`**（底＝開發分支 10aa10ed32；LICENSES 兩邊都留、狀態表與 coplanar 重新 `--write`）。
- 測試（10aa10ed32 上）：shop_cc0 ALL PASS、place_gate ALL PASS（已知未過 0）、dakou_*、xs_lm、aa625_yt_study、bar_group_3d、sit_feet_fast、skinned_sphere、wall_onepass、stair_tap、shop_crowd_new、yue_meal_visible、seat_reach 共 19 支全過。
- **v2（g3，P2）**：①一樓櫃檯後面的層架是一格格彩色方塊（換印刷包裝盒／罐子、大小顏色錯開）②二樓長桌上的課本是平盒子、紙袋是方塊、筆電是一片板（課本改 Poly Haven book 模型或有書脊、書口的印刷書，紙袋改有提把和摺邊的，筆電換掃描模型）。排在好拍、同弦、新生運動之後。

## 大口漢堡 patch 退回＋驗收流程修正（11-14 01:2x UTC）
- LAWWW 套 `dakou_cc0_on_10aa10ed32.patch` 時 place_gate 抓到新疊面：dakou_1f 牆疊面 5.13→6.81 m²（WALL_front_frame×WALL_front_frame 1.153 m² @[1.76,0.47,7.94]）。我驗收時先跑了 `--coplanar --write`，基準被蓋掉才沒看到——**這是驗收疏失**。整包退回，g3 修前牆框、重烘一樓再交。
- 回查今天整合的：比對 4556c4be0c → 現在開發分支的疊面基準，只有 yizhan（always 2.03→2.07）、yangyang（2.13→2.25）多一點，最大一對沒變；不退回，g1、g4 下一版一起修。
- 流程修正：`howto_coplanar_first.patch`（SHOP_CC0_HOWTO.md 第 1 節第 3 點下面加一條）＝改了 GLB 先跑 place_gate 不加 `--write`，沒有新疊面才准 `--coplanar --write`。我之後驗收照這個順序。

## 好拍運動 CC0（g3 6da531c6ee）——驗收 PASS（11-14 00:5x UTC）
- **patch**：`haopai_cc0_on_582eb7d807.patch`（底 582eb7d807，用 `git apply --3way` 套）。
- **改了什麼**：
  - 球拍、羽球筒、桌球拍（instancing 原型）改用 ambientCG Plastic006，每一支各自上色。
  - 地上兩箱封好的貨改用 Poly Haven cardboard_box_01。
  - 洞洞板照 11-09 BACKFACE-HAOPAI 重做；bake_xs.sh 好拍那一段改回 fd585f9915 的做法：烘焙時不藏洞洞板，洞洞板也烘。
- **驗收順序**：先跑 place_gate（不加 --write），沒有新問題、疊面沒有增加（35.44，跟基準一樣），才跑 `--write` 更新狀態表。
- **測試**：都是 ALL PASS。
  - shop_cc0：三項都成立，純色 12%。
  - xsshop、xs_close、xs_lm（instancing 64→65）、xs_wincard ×2、shop／gg／wz_real_inside、shop_window3d、shop_window_rects、seat_reach、placemap、shop_npc。
  - xs9_haopai_shanlan_check：洞洞板白天 0.452、晚上 0.439。
- **我改的**：patch 把 bake_xs.sh 的執行權限拿掉了（100755→100644），我改回 755。
- **畫面**：變化小，見 `haopai_cmp.jpg`。
- **v2（P2）**：層架上的貨箱還是程式拼的方塊加標籤，改用 Poly Haven 紙箱；冷氣、櫃台下面的收納櫃。

## 木曜日 v2.2（g1 dd0bc769a1）——驗收 PASS（11-14 01:3x UTC）
- **patch**：`mokuyobi_v22_on_98a1bddf63.patch`，共 12 個檔，順便補上日常失速 v2.1 漏登的 fern_02 一列。
- **改了什麼**：
  - 全部小盆栽、層板和書櫃頂上垂下來的葉片卡，換成 Poly Haven planter_pot_clay＋fern_02。
  - 木樑吊盆盆口那一圈葉片卡拿掉。
  - 畫面上共 77,732 三角形。
- **流程**：開發分支的疊面基準不動，先跑 place_gate（不加 --write），沒有新問題，才跑 --coplanar --write 和 --write。
  - 疊面基準只有 sha1 變：木曜日的 wall 2.62、always 5.54 都沒變；另外好拍的 sha1 本來就沒更新，這次一起補上。
  - g1 的 patch 裡也改了狀態表和疊面基準，我丟掉，用開發分支的版本重產。
- **測試**：都 ALL PASS，包括 shop_cc0、木曜日 7 支、cafe 系列、wz_real_inside、shop_window ×2、seat_reach ×3。
- **畫面**：`mokuyobi_v22_cmp.jpg`。葉片卡變成真的蕨類盆栽，東牆、木樑吊盆、書櫃頂上的差別最明顯。

## 大口漢堡一樓＋二樓（g3 第二次交件 7157a25df7）——驗收 PASS（11-14 01:4x UTC）
- **patch**：`dakou_cc0_v2_on_07bbd8564e.patch`；第一次退回的 `dakou_cc0_on_10aa10ed32.patch` 已經刪掉。
- **疊面**：開發分支的基準不動，先跑 place_gate（不加 --write），新的問題 0；之後才跑 --coplanar --write，兩層都只有變少：
  - dakou_1f：牆 5.13 → 0.32，一定會閃 10.55 → 3.71。
  - dakou_2f：牆 1.65 → 0.34，一定會閃 8.29 → 6.30。
- **修了哪些**：窗框直框、門邊重複的直框、樓梯口邊、踢腳板、員工通道牆、櫃檯身。
- **測試**：都 ALL PASS，包括 shop_cc0（兩層都過）、dakou 系列 5 支、xs_lm、xsshop ×2、xs_wincard ×2、shop_real_inside、shop_window ×2、stair_tap、wall_onepass、shop_crowd_new、yue_meal_visible 等 21 支。
- **畫面**：`dakou_cmp.jpg`，跟第一次交件差不多，看不出疊面修正的差別。v2（層架方塊、桌上的課本、紙袋、筆電）排在同弦後面。

## 一盞 v1.1（g1 3077099179，COPLANAR-CREEP-1114 驛站那一半）——驗收 PASS（11-14 01:5x UTC）
- **patch**：`yizhan_v11_on_2da495e693.patch`，8 個檔。
- **改了什麼**：
  - 電熱水壺抬高 3 mm，不再跟檯面同一個平面。
  - 和紙吊燈框的橫木比柱子窄 3 mm。
- **疊面**：先跑 place_gate（不加 --write），新的問題 0；之後 --coplanar --write：always 2.07 → 2.03（回到 4556c4be0c 原本的數字），wall 1.22 沒變。
- **測試**：都 ALL PASS，包括 shop_cc0、yizhan_place、teahouse ×2、wz_teahouse ×2、wz_real_inside、shop_window ×2。
- COPLANAR-CREEP-1114 兩半都修完：洋洋已整合 98a1bddf63，一盞是這一包。

## glb_coplanar 實例化修正（g3 edb96e33ec，工具）——驗收 PASS（11-14 09:5x UTC）
- **patch**：`coplanar_instancing_on_6f4cf29026.patch`（底＝開發分支 6f4cf29026）。**先整合這一包，再整合同弦**。
- **錯在哪**：`tools/glb_coplanar.py` 讀到 EXT_mesh_gpu_instancing 的網格時，只拿原型在原點的那一份來比，每一份實例都疊在一起，算出很多其實不存在的疊面。修法：每一份實例套它自己的位置、旋轉、縮放再比。
- **LAWWW 的四個條件都做到**：工具單獨一包；前後對照表（下面）；變多的逐項列（**0 項**）；小測試 `tests/glb_coplanar_instancing_check.py`（兩份錯開的實例不算疊面、真的疊在一起的仍然抓得到）ALL PASS。
- **基準重算**：先跑 place_gate（不加 --write）新的問題 0，再 --coplanar --write，8 個模型變少、0 個變多：

| 模型 | always 前 → 後 |
|---|---|
| 慢輪 bike | 17.45 → 5.35 |
| 轉角 corner | 18.63 → 13.31 |
| 大步 dabu | 34.54 → 33.11 |
| 大口 2F | 6.30 → 2.29 |
| 好拍 | 35.44 → 11.68 |
| 同弦 | 38.08 → 7.45 |
| 新生運動廣場 | 48.06 → 6.38 |
| 鮮果 | 13.04 → 10.19 |

- 大步還有 33 m²，大多是真的疊面（g3 說真的有 5.11 m² 要在大步 v2 修），不是工具算錯。

## 同弦樂器 CC0（g3 768816c33c）——驗收 PASS（11-14 09:5x UTC）
- **patch**：`tongxian_cc0_on_coplanar_instancing.patch`，疊在上面那包之後（底＝6f4cf29026＋工具那包）。
- **三項**：shop_cc0 過（Poly Haven 掃描模型、CC0 材質組、純色零件 19%）；`shop_cc0_baseline.json` 拿掉同弦。
- **疊面**：用新工具跑，先不加 --write 新的問題 0，再 --coplanar --write 只有 sha1 變（always 維持 7.45）。
- **測試**：19 支 ALL PASS，包括 tongxian_unit、tongxian_closed、xs_tongxian_view、xs_tongxian_sign、aa619_guitar ×2、xs_lm（同弦 30 份實例＋新生運動廣場 58）、seat_reach、shop_npc、shop_window3d、place_gate、shop_cc0。
- **畫面**：`tongxian_cmp.jpg`，改動不大：工作檯上多了烏克麗麗、架上的紙箱，木頭和金屬改 CC0 材質組。

## 頁間書屋 v4（g2 389adca8c0）——驗收 PASS（11-14 10:0x UTC）
- **patch**：`yejian_v4_on_coplanar_instancing.patch`，疊在 glb_coplanar 工具那包之後（底＝6f4cf29026＋工具那包；和同弦那包互不相干，先後都可以）。
- **衝突**：LICENSES 兩邊都留（新生運動廣場的列和頁間的列）；狀態表、疊面基準用新工具重算。
- **三項**：shop_cc0 過（Poly Haven `potted_plant_02`、`CashRegister_01`；ambientCG Fabric030、Metal009、Plastic006、Marble012；純色零件 13%）。
- **疊面**：先跑 place_gate（不加 --write）新的問題 0，再 --coplanar --write：always 6.88 → 6.80，牆 0.7 不變。
- **測試**：有提到 yejian／gongguan_book 的 24 支 ALL PASS。
- **畫面**（`yejian_cmp.jpg`）：咖啡吧換成雙孔義式機、收銀機、大理石檯面；門口大盆換掃描盆栽，比原本的葉片卡好很多。
- **小盆栽的判斷**：小盆栽（櫃上、桌上那幾盆）仍是葉片卡。g2 試過 Poly Haven `potted_plant_04`，減到 300 面以下會變成一團灰。這幾盆很小、在背景，不是方塊，所以這次不退件。記一筆 P3：找面數低的 CC0 小盆栽，或把 `potted_plant_02` 縮小重用。

## 一盞 v1.2（g1 4ba5e16e70，霧面雲狀斑）——驗收 PASS（11-14 10:1x UTC）
- **patch**：`yizhan_v12_on_15be72634e.patch`，底是開發分支 15be72634e。
- **底的問題**：g1 用的底是 1a7d7e1994（v9.10.26 發布樹），那裡的 yizhan.glb 是舊的，和開發分支衝突。
  - 腳本 yizhan_interior.py、aa_cc0.py 和開發分支一樣，模型是用 v1.1 的腳本整個重建的，所以 GLB 和兩張光照貼圖直接用 g1 的。
  - 狀態表、疊面、shop_cc0 基準照開發分支重算。
- **改了什麼**：霧面紋路 tile 0.6 → 0.15 m。aa_cc0.enable 多一個 tiles 參數，只有一盞用。
- **疊面**：先跑 place_gate（不加 --write），新的問題 0；之後 --coplanar --write 只有 sha1 變（一定會閃 2.03 m² 不變）。
- **測試**：shop_cc0 過；yizhan 相關 6 支 ALL PASS。
- **畫面**（`yizhan_v12_cmp.jpg` 第三列）：水屋左邊壁櫥的雲狀斑沒了，其他不變。
- 其他四間（aa_cc0 的 Plaster001 雲狀斑）照舊留 P3。

## 轉角唱片 v2（g2 26b1f7976b）——驗收 PASS（11-14 10:3x UTC）
- **patch**：`corner_v2_on_452a96aa6c.patch`，底是開發分支 452a96aa6c，套上去沒有衝突。
- **三項**：shop_cc0 過。Poly Haven `potted_plant_02`；ambientCG Plastic006、Metal009（vc_tex）。原本是「純色 41%、沒有掃描模型」，baseline 拿掉轉角。
- **疊面**：先跑 place_gate（不加 --write），新的問題 0；之後 --coplanar --write 只有 sha1 變（牆 10.81、全部 13.31 不變）。
- **其他**：新工具 `glb_merge_dup_mat.py`，把烘焙時多出來的 cr_vc.001 併回去，材質數回到 12。corner_shop_unit 寫死的 GLB 大小 4,238,972 → 4,875,700 B，有寫理由。
- **測試**：corner_shop、corner_glb、corner_ceil、corner_kexin、mokuyobi_plant_corner、shop_cc0、place_gate 都 ALL PASS。
- **畫面**（`corner_v2_cmp.jpg`）：右邊落地的大盆栽換成掃描盆栽（白盆），比原本的葉片卡好；其他不變。

## 好拍 v2（g3 200d3b6c66）——驗收 PASS（11-14 10:3x UTC）
- **patch**：`haopai_v2_on_452a96aa6c.patch`，底是開發分支 452a96aa6c，套上去沒有衝突。
- **改了什麼**：後段鐵架上程式拼的貨箱換成 Poly Haven `cardboard_box_01`，大小照原本的格子、角度偏 ±0.08 rad；鐵架用的原型減到約 200 面。有標籤的羽球拍箱、桌球盒、資料夾照舊。
- **疊面**：place_gate（不加 --write）新的問題 0；--coplanar 牆 7.97 → 7.92、always 11.68 → 11.62（變少）。
- **測試**：shop_cc0、xs_lm（instancing 65 → 66）、xsshop、xs_close、seat_reach、shop_npc、xs_wincard ×2、xs9_haopai_shanlan_check 都 ALL PASS。
- **畫面**（`haopai_v2_cmp.jpg`）：後段鐵架的紙箱看起來像真的紙箱（有膠帶、皺折）。畫出的三角形 57k → 77k，要留意手機效能，請 CC 量。

## 南洋戲院大廳 v7（g4 8034794c2，BB 的 P2 三點）——驗收 PASS（11-14 10:4x UTC）
- **patch**：`nanyang_v7_on_07bf3613b4.patch`，底＝開發分支 07bf3613b4。LICENSES 有衝突，兩邊都留（新生運動廣場、南洋的列）。
- **三點**：
  - 飲料櫃的瓶子：有標籤帶、高矮不一。
  - 紅白條紋紙桶：分成五疊，不再黏成一整塊。
  - 入口的黑色立式方箱：原來是「本日放映」立牌的背面，改成深色木框，背面也貼海報。
  - 另外，純黑方塊的舊放映機換成 Poly Haven `filmstrip_projector_8mm`，放在木展示台上。
- **三項**：shop_cc0 過（純色 5%）。
- **疊面**：先跑 place_gate（不加 --write），新的問題 0；再 --coplanar --write：always 16.50 → 16.43。
- **測試**：nanyang、nanyang_bench、nanyang_staff_1107、nanyang_tap、cinema_work_spot_1112、shop_real_inside_1112、wall_dir_inherit、xs_close、xs_lm、xs_wincard2_1110 都 ALL PASS。
- **畫面**（`nanyang_v7_cmp.jpg`）：三點都看得出來改了，放映機最明顯。

## 山嵐書店 v3（g2 fbb14ee0ef）——驗收 PASS（11-14 10:5x UTC）——**最後一間，shop_cc0 待做名單清空**
- **patch**：`shanlan_v3_on_6fe2265f29.patch`，底＝開發分支 6fe2265f29。LICENSES 有衝突，兩邊都留（南洋的列和山嵐的列）。
- **三項**：shop_cc0 過。baseline 的 todo 拿掉山嵐以後是空的，**所有進得去的店都過了三項**。
- **改了什麼**：
  - 天花板換成 Plaster001。
  - 高的盆栽換成 Poly Haven `potted_plant_02`，小盆栽照舊是葉片卡（同頁間，記 P3）。
  - 櫃台換成大理石檯面。
  - 門把改成黑鐵。
  - 面數 79,600（大店上限 80k）。
- **疊面**：先跑 place_gate（不加 --write），新的問題 0；再 --coplanar --write：always 53.81 → 53.75。
- **測試**：提到 shanlan、xs_lm 的 34 支 ALL PASS。
- **畫面**（`shanlan_v3_cmp.jpg`）：陶盆大盆栽、大理石櫃台都看得出來；天花板質感變化不大。

## Daybreak v2.1b（g2 58ce364c6e，我的 P1：義式機）——驗收 PASS（11-14 11:3x UTC）
- patch：`daybreak_v21b_on_4cc26d4b8d.patch`（以開發分支 4cc26d4b8d 為底；`git apply --3way` 乾淨）。並排圖：`daybreak_v21b_cmp.jpg`（g2 的五組）。
- 改了什麼：
  - 義式機原本是一個方盒插三根圓柱，改成雙孔義式機：倒角機身、兩個壓力錶、溫杯盤、兩個沖煮頭（附把手和杯子）、接水盤格柵、蒸氣管。
  - 磨豆機重做，只留一台。
  - 整台機器抬高 3 mm，不再貼在吧台面上。
  - 互動點、座位、導航、店員位置都沒動。
- 驗收（在 4cc26d4b8d＋patch 上）：
  - `place_gate_unit`（不加參數）：0 個新問題。
  - `--coplanar --write`：daybreak 疊面全部 1.42 → 1.40 m²，牆 0.36 不變。
  - `--write`：狀態表更新。
  - `shop_cc0_unit` ALL PASS。
  - 檔案裡有 daybreak 的 33 支測試 ALL PASS。
- 並排圖：近看吧台那一張，新版看得出是一台義式機和磨豆機，原本是方盒。其他四個鏡頭沒有別的變化。
- 門框自己疊自己的那一對（0.139 m²，在地板下面看不到）沒修：要改 aa_kit 共用的門框，所有店都會跟著變。開發分支原本就有，記著。

## 大口漢堡 v2（g3 7f4f1e4d71）——驗收 PASS（11-14 11:4x UTC）
- patch：`dakou_v2_on_4cc26d4b8d.patch`（以開發分支 4cc26d4b8d 為底；`git apply --3way` 乾淨，LICENSES 沒有衝突）。並排圖：`dakou_v2_cmp.jpg`。
- 改了什麼：
  - 一樓櫃檯後的層架：原本 14 個一樣大的彩色方塊，換成一疊一疊的紙杯（白杯，有橘、藍兩種杯套）、Poly Haven 的紙箱 `cardboard_box_01`（寬度、高低、角度不同）、餐巾紙包、杯蓋筒。紙箱已登記 LICENSES，CC0。
  - 二樓：
    - 課本有封面板、書背、往內縮的書頁。
    - 紙袋有內摺和紙繩提把。
    - 筆電有一顆一顆的鍵、觸控板、轉軸。
- 驗收（在 4cc26d4b8d＋patch 上）：
  - `place_gate_unit`（不加參數）：0 個新問題（只有狀態表過期）。
  - `--coplanar --write`：一樓疊面 3.71 → 3.67 m²，二樓 2.29 → 2.12 m²。
  - `--write` 以後 ALL PASS。
  - `shop_cc0_unit` ALL PASS。
  - 大口相關和 g3 列的 48 支 ALL PASS，含 dakou_unit、dakou_act、dakou_clerk_1107、dakou_nightcard、xs_lm、stair_tap、shop_crowd_new。
- 並排圖：
  - 近看層架，從色塊變成看得懂的紙杯、紙箱。
  - 二樓長桌的紙袋、筆電、課本都有細節。
  - 一樓櫃檯、二樓晚上其他地方沒有變化。

## 輪轉單車 v2.1（g2 d8ee8b27c2）——驗收 PASS（11-14 12:4x UTC，LAWWW2-B）

- 交件：`origin/claude/shop-cc0-g2` 的 `docs/art-rebuild/second_ai/cc0_g2/bike_cc0.patch`（LAWWW2-C 的 P2：右牆層架不要一格一個等大方塊）。上一班看到一半，這一班接著驗。
- 重出的 patch：`bike_v21_on_166e9d3096.patch`（8 個檔，不含 `SHOP_STANDARD_STATUS.md`；LAWWW 套完跑 `node tests/place_gate_unit.js --write`）。並排圖 `bike_v21_cmp.jpg`。
- 機器檢查（開發分支 0c83b7e4b3＋patch；166e9d3096 只多文件）：
  - `tests/shop_cc0_unit.js` ALL PASS。
  - `tests/place_gate_unit.js`：新的問題 0，只有「狀態表過期」。
  - 提到 bike 的 115 支 Node 測試改前改後各跑一輪：讀單車模型的（`bike_*`、`xs_lm_unit`、`place_gate`、`shop_cc0`）結果一樣。
  - 有 6 支結果不同（`aa720_decide_opened`、`invites_quote_b3／b5／b6`、`ladder_aa781_1111`、`peishan_misc3_1111`）：都是劇情、題目測試，這包沒動 `src/`；單獨重跑 `peishan_misc3` 的失敗是 `fatal: invalid object name`（這個淺層 checkout 缺舊 commit），其他是整批跑時逾時。和這包無關，以 GitHub Actions `node-unit-auto` 為準。
- 看圖：
  - 右牆層架：改成大小不同的紙盒、瓶罐、U 型鎖，不再是等大方塊排格子。
  - 其他鏡頭沒有比舊版差；互動點、座位、導航沒動。
  - 還沒做到參考圖的：牆上掛整台車、輪胎牆。記著，不擋這一版（D141）。
- 下一步：LAWWW 套 patch → CC 拍 → BB 判。

## 大步球鞋 v2（g3 ee32d5714f）——驗收 PASS（11-14 13:0x UTC，LAWWW2-B）

- 交件：`origin/claude/shop-cc0-g3` 的 `docs/art-rebuild/second_ai/cc0_help/g3/dabu_v2.patch`（LAWWW2-C 的 P2：鞋盒牆不要等大純色盒）。
- 重出的 patch：`dabu_v2_on_166e9d3096.patch`（9 個檔，原 patch 在 166e9d3096 直接套得上；本來就不含 `SHOP_STANDARD_STATUS.md`，LAWWW 套完跑 `node tests/place_gate_unit.js --write`）。並排圖 `dabu_v2_cmp.jpg`。
- 機器檢查（開發分支 166e9d3096＋patch）：
  - `tests/shop_cc0_unit.js` ALL PASS。
  - `tests/place_gate_unit.js`：新的問題 0，只有「狀態表過期」。
  - 疊面：牆 32.98 → 18.09 m²；後牆 `WALL_back_back_vc × WALL_back_back_paint` 5.11 m² 那一對沒了。
  - 提到 dabu 的 22 支 Node 測試：21 支通過（含 `xs_lm_unit`，牆節點 23 → 25）。
  - `gift_holiday_unit` FAILED 1：第 0 項是 AA 稿的白名單比對，這包沒動 `src/`，和大步無關。
  - `shop_crowd_new_unit`：全部通過（結尾印的是「全部通過」，批次腳本沒抓到；單獨重跑，有沒有套 patch 都過）。
  - 50,938 個三角形（上限 60k）、4.0 MB。
- 看圖：
  - 鞋盒牆、收銀台後盒子牆：盒身＋盒蓋，六種顏色、大小不同，有幾盒露出蓋子。
  - 參考圖鏡頭、門口、晚上三個鏡頭沒有比舊版差；互動點、長凳、導航沒動。
- 還剩（我的，記在全部待辦）：左牆 `WALL_left_left_vc × WALL_left_print` 4.372 m² 疊面。
- 下一步：LAWWW 套 patch → CC 拍 → BB 判。
