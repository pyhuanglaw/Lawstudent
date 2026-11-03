# 茶屋給語彤的座位（YT-TEAHOUSE-SEATS）＋書桌六法改成厚書＋選了東西時鏡頭的路線（BB 16:16 P3）——LAWWW2 2026-11-03

兩個 patch，基底都是開發分支 `b049c84e3`。分開套、一起套都可以，用 `git apply --cached --check` 檢查過。
| patch | 內容 |
|---|---|
| `teahouse_seats_1103.patch` | `src/data/wz_shops_layout.js`（茶屋加圓木凳 `stool_round`＋一個座位）、`wz_teahouse_interior.glb`＋白天／晚上光照貼圖（重新烘焙，512 取樣）、新測試 `tests/wz_teahouse_seats_unit.js` |
| `liufa_camvia_1103.patch` | `dorm_desk_items.glb/.json`（六法四本＋每件的 via）、`src/engine3d.js`（`E.cinematic(pos,look,via)`，改 3 行）、`src/story3d.js`（`roomItemFocus` 傳 via，改 1 行）、`src/zones3d.js`（`deskItemKeys` 加 `liufa_<房間>`，改 1 行）、`tests/dorm_desk_items_unit.js`（第 15 項排除六法，新增第 21～25 項） |

## 1. 茶屋的座位（LAWWW 17:23 ②；AA_630 C-001、C-015）
茶屋沒有吧檯，水屋（茶罐、電熱水壺、沙漏那一排工作台）就是 C-015 說的「吧檯」。
- **c510_3_2**（2029 暑假週四顧店，「她坐在吧檯最旁邊，考古題攤開。客人進來，她把書闔上，站起來。」）
  - `seatAt: [3.05, 3.35]`：水屋西南角旁邊的新圓木凳。座面直徑 34 cm、高 45 cm，和茶席的椅子一樣高，坐姿不用抬高（`lift` 0）。
  - 朝向 `yaw −π/2`：面向茶席，水屋南端的台面在她右手邊。
  - `standAt: [2.3, 3.4]`：客人進來時她站起來的位置，`S.shopSeat` 會讓她面向門口。
  - 起身點由 `crowd3d.js S.seatSide` 算出來，是 (3.05, 3.90)。
- **c506_3_3**（2027 暑假週六日 12:30～13:00 上班前，阿伯坐她對面）：
  - `seatAt: [-0.7, 0.95]`：長桌面向院子那一側最東邊的位子，離水屋最近。
  - 阿伯坐對面 `[-0.7, 2.45]`。
  - 兩個都是現成的座位，不用改 layout。
- 截圖 `teahouse_stool_before_after.jpg`（遊戲畫面，15:00）：左＝修改前，右＝修改後；上下是兩個角度。
- 測試 `tests/wz_teahouse_seats_unit.js`：在 b049c84e3 上 11 項 ALL PASS；修改前第 1 項 FAIL。檢查的是：
  - 座位在區域的 seats 裡；
  - 起身點站得住、從門口走得到；
  - standAt 站得住、走得到，離木凳 ≥ 0.6 m；
  - 木凳不和打工的站位疊在一起，水屋前泡茶的位置照樣走得到；
  - c506 兩個位子面對面。
- 一起跑過、都通過：`wz_work_spots_unit`、`wz_shops_unit`、`wz_shops_cam_unit`、`wz_shops_lm_unit`、`wz_shops2_unit`、`seat_reach_unit`、`shop_enc_seat_unit`、`shop_diners_unit`。

## 2. 六法（BB 11-03 16:16 P3 (a)：書桌左端的紅色方塊像盒子）
- 紅色方塊是 `dorm_room4.py` 畫的（`yuting203`、`yuting_y` 的 `lbox`）。量 GLB 的位置：x −1.92～−1.64、z 0.26～0.52、頂 0.82，507 是 0.85。
- 不重做 dorm_room4，因為改了要重新烘焙整間房間。改成在 `dorm_desk_items.glb` 做一本把方塊整個包住的厚書，每邊大 3～8 mm：
  - 上下兩片倒角封面板：深紅布紋、燙金框；
  - 封面燙金「綜合六法」「二〇二七年版」；
  - 書背朝走道：「綜 合 六 法」、出版社「青松書局」、兩條燙金線；
  - 書頁那一疊，三個側面看得到一頁一頁。
  - 書名和出版社都是虛構的（D77）。
- 節點一年一本：`ITEM_desk_liufa_203／312／507／409`（room＝那一年）。不在「看東西」選單裡，由 `zones3d.js deskItemKeys` 照房間加進去；搬家那幾天和其他東西一起收起來。
- 手機往走道挪了 6 mm，不然會貼到書背。
- 截圖 `liufa_blender.jpg`：Blender 渲染，dorm_room4.glb＋新的 dorm_desk_items.glb，兩個角度。**還沒在遊戲裡拍**。

## 3. 選了東西時鏡頭的路線（P3 (b)：轉過去會穿過梯子、床欄）
- 原本 `E.cinematic` 從目前的鏡頭直線內插到 eye。祐廷那組的床板、床欄、梯子在 x −2.0～−0.9，eye 都在床板下面，從高處直線過去就會穿過床欄。
- 改成：每件東西多一個 `via`＝走道上 x −0.6、和 eye 同高同 z 的點。鏡頭先往 via 走，離它 15 cm 以內再往 eye，也就是先在走道降下來、再橫著鑽到床板下面。
  - engine3d.js 的 `E.cinematic(pos, look, via)`：via 不給就跟原本一樣，其他呼叫的地方不受影響。
- 測試 `tests/dorm_desk_items_unit.js` 25 項 ALL PASS，新增的是第 21～25 項（六法節點與包住方塊、deskItemKeys、via、roomItemFocus 傳 via、engine 的 via）。
- 一起跑過、都通過：`dorm_lightmap_unit`、`dorm_seethru_unit`、`dorm_205_unit`、`dorm_sleep_scene_unit`、`dorm_y3_items_unit`、`room_ceiling_unit`、`ladder_headroom_unit`、`room_y4_unit`、`v0_dorm_props_unit`。
- **還沒做**：實際在遊戲裡選一項、錄下鏡頭的路線（SwiftShader 很慢）。
