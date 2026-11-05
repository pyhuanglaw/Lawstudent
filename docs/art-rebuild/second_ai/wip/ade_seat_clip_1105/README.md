# 阿德影印：坐在長桌前的人不再卡進桌子（ADE-SEAT-CLIP-1105，LAWWW2-C 2026-11-05）

- 使用者 06:5x 截圖（線上 v9.10.20）：中間長桌靠走道那個坐著的男生，胸口、手臂整個卡進桌子。
- 原因：配置 v1c（CC）三張電腦椅的中心在 x −0.07，長桌西緣在 x −0.04。
  - 座位離桌緣只有 3 cm，椅子前緣伸進桌子底下 0.19 m。
  - 人坐下去，身體就在桌子裡。SEATACT 的近桌片段最近只處理到桌緣 0.14 m，這張太近，不套片段。
  - 開發分支 `05ddf1e08`（含 SIT-HEIGHT、ADE-SEATS-NAV）一樣有這個問題。
- 改法：三張電腦椅的座位和椅子，沿著自己面向的反方向往後挪 0.2 m。
  - `src/data/wz_shops_layout.js` 最後加一段：上面的 print 是照抄 ade_layout.js 的，所以不動那一筆，在最後改。挪完寫進 `chairShift`。
  - `src/zones3d.js` 的 `wzAAattach`：模型裡的椅子是 instancing（`ad_chair_0_vc_inst`、`_vcm_inst`），照 `chairShift` 找到那三個 instance 一起挪。
  - 座位離桌緣 0.235 m，套 0.20 那一組近桌片段。
  - 第四張「沒推進去」的（x −0.2，離桌緣 0.165）不動。
  - 沒改模型檔。
- 走道：椅背到大圖輸出機還有約 1.0 m。

## 測試（Node，不用瀏覽器）

`node tests/ade_seat_clip_unit.js`：ALL PASS（13 項）

- ① 配置：三張的座位、椅子都往後 0.2 m，第四張不動。
- ② 模型：椅子的 instance 挪了 6 個（vc、vcm 兩組 × 3），舊的位置沒有椅子了。
- ③ `SEATACT.probe` 量到的桌緣：0.235 m（修改前 0.035）。
- ④ F／M／F2／M2 四種骨架（`npc_f1`、`npc_m1`、`npc_nf10`、`npc_nm11`）坐這三張、照 SEATACT 打電腦，量身體和衣服的頂點有沒有穿過桌板（桌面往下 4.5 cm 那一層、桌子前緣以內）：
  - 新位置：四種都是 0 點。
  - 同一套量法放回舊位置：35～104 點，最深 8～20 cm。這證明量法抓得到使用者看到的問題。
- 修改前（`05ddf1e08`）：FAIL 5（① ② ③）。
- 一起跑、ALL PASS：`ade_seats_nav_unit`、`wz_copy_shop_unit`、`wz_shops_unit`、`wz_shops_cam_unit`、`wz_shops_lm_unit`、`seat_reach_unit`、`sit_task_wire_unit`、`wz_interiors_aa659_unit`、`wz_work_spots_unit`、`seat_activity_1104_unit`、`crowd_unit`、`indoor_crowd_unit`、`crowd_seat_talk_unit`、`shop_enc_seat_unit`、`wz_lin_v1c_unit`。
- 瀏覽器沒跑（D131）。

## 先將就的

1. 修法寫在程式裡，沒改模型檔。之後 CC／AA 改 `ade_layout.js`、把椅子拉開，要把 `wz_shops_layout.js` 最後那一段拿掉（`from` 對不上就不會動）。
2. 阿德 v2.1（我 b0160dc98，等 BB 判）沒有動這三張椅子。如果接 v2.1，也要照這個挪。

## 接法

`git apply docs/art-rebuild/second_ai/wip/ade_seat_clip_1105/ade_seat_clip_1105.patch`（在 `05ddf1e08` 上做的）：`src/data/wz_shops_layout.js`、`src/zones3d.js`，加新測試。和燒臘、一盞、樓梯、南洋長椅幾包互不相干。

## 第二版（11-05 07:4x，LAWWW-C 回報：開發分支 2258988a5 上第一次跑 ④ M2「0、0、2 點」FAIL、重跑 PASS）

- 原因：
  - 坐著的小動作是亂數（`CHAR.ambRand`），每次跑不一樣。
  - 而且 0.2 m 對 M2（手臂長的 nm11）第三張剛好在邊上，偶爾有 2 點穿過桌板。
- 改法（`ade_seat_clip_v2_1105.patch`，在 `3574b5462` 上做的）：
  - 往後挪 0.2 → **0.25 m**（座位離桌緣 0.285 m，照 0.30 那一組片段）。
  - 測試的小動作用固定種子；坐好以後 2～5 秒、每 0.5 秒量一次，取最多的那一次。
- 結果：`ade_seat_clip_unit` 連跑三次 ALL PASS，M2 三張都是 0 點。
- 一起跑 ALL PASS：`ade_seats_nav_unit`、`wz_copy_shop_unit`、`wz_shops_unit`、`seat_reach_unit`、`sit_task_wire_unit`、`crowd_unit`。
