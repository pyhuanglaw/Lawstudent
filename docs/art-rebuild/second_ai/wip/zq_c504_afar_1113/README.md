# ZQ-C504-LAPTOP-1101 方案 A：afar café 門口騎樓的戶外小桌（LAWWW2-C，2026-11-13）

LAWWW-C 11-13 21:2x 選 A。子晴 c504_4_3（2026 暑假）在「公館騎樓的咖啡店」(12, 20.6)，旁白是咖啡店桌邊、筆電開著、旁邊一杯冰美式；afar 門口原本沒有座位（最近的 G08 紅凳子 3.7 m，seatAt 只找 3.5 m 內）。

## 做了什麼
- **模型** `assets/models/env/second_ai/gg_afar_terrace.glb`（腳本 `tools/blender/env_second/gg_afar_terrace.py`）：Poly Haven `outdoor_table_chair_set_01`（CC0 掃描：木條桌面、金屬摺疊腳），afar 大窗前（玻璃 z 22），桌子在中間、兩張椅子沿著玻璃面對面；桌上靠西邊那張椅子一杯冰美式（透明杯、咖啡、冰塊、綠吸管）。10,102 面、552 KB。
- **遊戲** `src/zones3d.js` 公館：
  - 兩個座位「坐在 afar 門口的小桌」：西 (11.87, 21.46) yaw 1.552、東 (12.79, 21.37) yaw −1.357，面向桌子，ap 在騎樓那一側 z 20.55。
  - 桌椅三塊腳印加進 GG_PROP_BLOCKS（模型接上時才擋），騎樓 z 19.6～20.9 照樣走得通。
  - 載入模型；沒有登記模型就不放座位。
  - `src/assets3d.js`：manifest `bldg.gg_afar_terrace`。
- `LICENSES.md`：Poly Haven 模型表加 `outdoor_table_chair_set_01`（James Ray Cock）一列。

## 測試
- 新測試 `tests/zq_c504_afar_seat_unit.js`：修改前 FAIL 4 → ALL PASS。檢查四項：
  1. 兩個座位面向桌子；c504_4_3 最近的是西邊那張，0.87 m，就是有冰美式的那張。
  2. 座位和模型的椅子對得上，腳印都有。
  3. ap 站得住；騎樓找得到路；afar 店門口站得住。
  4. manifest、檔案、LICENSES 都在。
- 回歸：gg_*（16 支）、seat_*／seated_*（13 支）、street_props_nav、prop_restand、zq_arcade_seat、zq_arcade_spawn、zq_dates、place_gate 全部 ALL PASS。
- 遊戲內截圖（14:00）：`game_shots.jpg`，左邊騎樓斜看、右邊從馬路看。模型預覽 `model_preview.jpg`。

## 還沒做（LAWWW 那一半）
- `src/data/heroine_circle.js` 的 c504_4_3 改 `act:'read'`、`seatAt:[11.87,21.46]`、`prop:'laptop_lap'`（同 ZQ-ARCADE 那四筆的做法）。
- CC 拍、BB 判。

## 套法
`git apply docs/art-rebuild/second_ai/wip/zq_c504_afar_1113/zq_c504_afar.patch`（底：開發分支 19399e5d39）
