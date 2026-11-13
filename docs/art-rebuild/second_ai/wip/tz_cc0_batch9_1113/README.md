# 第九批：afar 咖啡機重做（BB 第八批 FAIL）、2:30 AM 單人沙發（BB P2）、一盞前院 CC0 化（SHOP-REALISM-1112）

底：開發分支 `origin/claude/adoring-meitner-mqzst8` b9fbcb200c（含第八批 9c21a7c439、幫手三間 f6449442c7）。`git apply --check` 乾淨。

## 1. afar：吧台的義式咖啡機（BB-C 第八批判 FAIL「白色方盒加三個黑點，改前改後一模一樣」）

- 改成雙孔義式機，朝吧台外：
  - 機身：不鏽鋼，走 c_steel（Metal009），四支黑腳。
  - 沖煮：往前凸的沖煮頭外殼，兩個沖煮頭，每個配沖煮把手（粉碗＋黑把手）和兩個出水口。
  - 接水：格柵接水盤，上面兩個小白瓷杯。
  - 左右蒸氣管＋黑旋鈕，前面兩個壓力錶（白錶面、黑指針）、四個按鈕。
  - 上面的溫杯盤有欄杆，倒扣八個杯子。
- 顏色全部在 VC_ROUTE 上：不鏽鋼 → Metal009、黑 → c_metal_dk、白瓷 → Plastic006。
- 三角形 52,730 → 54,306。重烘（`bake_gg_new.sh aa_afar 256`）。

## 2. 2:30 AM：窗邊兩張單人沙發（BB-C P2「灰布沙發還是一整塊方的」）

- `armchair()` v2：
  - 外形：底座、靠背、坐墊都改成大圓角；扶手頂上是捲邊圓柱；靠背前面多一塊分開的靠背墊。
  - 抱枕改靠在靠背墊上。坐墊頂面照舊 0.53 m，座位高度不變。
  - 北邊那張的毛毯沿著捲邊扶手的弧度搭過去，外側垂到離地 0.15 m，有三道摺、流蘇。
- 順便修一個錯：毛毯（`#d8cfc0`）和米色抱枕（`#c9c0ae`）第八批被分到白瓷材質（c_ceramic），看起來像塑膠。
  - 改走新的 c_wool（ambientCG Fabric030，米色）。
  - `bake_cafe230.sh` 的 NOLM 加 `a23_c_wool`。
- 三角形 53,830 → 55,934。重烘（`bake_cafe230.sh`）。

## 3. 一盞前院 `wz_teahouse_yard.glb`（我的腳本 `wz_teahouse_yard.py`）

- 原本 shop_cc0 兩項沒過：沒有 Poly Haven 掃描模型；純色零件 40%（43 個裡 17 個）。
- 純色零件換 ambientCG 材質組：

| 零件 | 材質組 |
|---|---|
| 四つ目垣、建仁寺垣的竹 | Bamboo001A |
| 綁竹籬的繩子 | Rope001 |
| 雨溝、雨水管、門燈與提燈的鐵件 | Metal032 |
| 路緣、紅路緣、屋脊、緣側下面 | Concrete034 |
| 甕 | Plastic006（上釉） |
| 簷下木板 | dark_wood |

- Poly Haven 掃描：石燈籠前面碎石的邊上放一個 wooden_bucket_01 木水桶（0.36 m 高，打水灑庭院用）。
- 景石不換：Poly Haven 的石頭掃描（rock_moss_set_01、stone_01、rock_07、rock_09）顏色都是褐色砂岩。試過 rock_moss_set_01，遊戲裡像一堆橘色碎磚，和苔庭的灰花崗岩不合，所以照舊用程式景石。
- 結果：純色零件只剩頂點色零件和燈籠紙兩個，三項同時成立。
- 三角形 63,780 → 64,547；GLB 6.03 → 6.20 MB。
- 前院戶外沒有光照貼圖，不用烘。

## 測試

- `shop_cc0`：ALL PASS；基準表用 `--write` 重產，只拿掉一盞前院，剩 21 家。
- `place_gate`：ALL PASS（已知未過 11 項）；`--coplanar`、`--write` 都已含在 patch 裡。
- 相關單元測試 165 支全過，0 個 FAIL：
  - 提到 afar、cafe230、teahouse、yizhan 的；
  - `shop_*`、`cafe*`、`wz_*`，其中含 `cafe_bar_cam_1111`、`cafe_seethru`。
- 改底到 b9fbcb200c 以後重跑：提到 afar、cafe230、teahouse、yizhan 的測試和 `cafe*`，共 126 支全過；`shop_cc0`、`place_gate` 也重產、全過。
- 全部 Node 測試以 GHA 為準。

## 圖

- `cmp_afar_em.jpg`：afar。參考圖；同鏡頭改前（第八批）／改後三組：吧台、咖啡機正面、咖啡機斜面。
- `cmp_cafe230_armchair.jpg`：2:30 AM。參考圖；同鏡頭改前／改後三組：北邊那張（搭毛毯）、南邊那張、沙發角 14:00。
- `cmp_yard_cc0.jpg`：一盞前院，同鏡頭改前／改後四組（冠木門、石燈籠、東側、竹垣）。

## 還沒做

- BB 看圖；LAWWW 套了以後 CC 拍四鏡頭。
