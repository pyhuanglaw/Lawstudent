# 一盞茶屋：點下沉地板走到點的地方（TEA-SUNKEN-TAP-1105，LAWWW2-C 2026-11-05）

- 來源：BB-C TAPSCAN（Node）06:4x 掃到「一盞第 0 層 42／42 格沒接住、0 片可點面」，LAWWW-C 06:41 插隊，要放進 v9.10.21。v9.10.20 線上就有。
- 問題：手機玩家點地移動走 `E.screenToFloor`。區域沒有 `walkMeshes` 時，退回「y 0 的平面」。
  - 一盞的前院 −0.42、玄關前的石板土間 −0.24、玄關 −0.12、緣側前的沓脫石是斜的。
  - 點這些地方，落點會跑到點的位置後面，最多差 0.97 m。和南洋 1 廳、體育館看台是同一個問題。
- 改法：`zones3d.js` 加 `navTapMesh()`。照導航格的高度（`nav.heightAt`）做一片看不到的網格，每 0.2 m 一格。
  - 一盞在 `teaYard` 裡建一片，蓋整間（室內 0、玄關、土間、前院、沓脫石），放進 `z.walkMeshes`。
  - 每一格自己四個頂點：同一塊高度裡和導航格完全一樣；兩塊高度的交界斷開，不做斜坡（斜坡會擋住交界旁邊的點）。
  - 每格往外多 3 mm：射線剛好沿著格子的邊時，不會兩格都漏接（第一次寫的時候 x 0 那一條漏接，偏 0.97 m）。
  - 只蓋下沉的地方不行：從屋裡往前院的方向點室內地板，射線會穿過去打到前院那一片，所以整間一起蓋。
- `navTapMesh(nav,x0,x1,z0,z1,step,lv,off)` 是通用的，其他有高差、沒有可點面的區域可以照用（見下面「其他區域」）。

## 測試（Node，不用瀏覽器）

`node tests/teahouse_tap_unit.js`：ALL PASS

| | 檢查 |
|---|---|
| ① | 有可點面、第 0 層、看得到 |
| ② | 前院、土間、玄關、沓脫石 442 點 × 4 個鏡頭方向：落點水平差 ≤ 0.3 m、高度差 ≤ 0.05 m（實際最大 0.06 m） |
| ③ | 室內 1,360 點 × 4 方向照舊 ≤ 0.3 m |
| ④ | 可點面的高度＝導航格的高度（1,706 點） |

- 修改前（開發分支 `d64b75c20`）：① ② ④ FAIL（② 1,800 次不合格，最大 0.97 m）。
- 照實寫：
  - 第一版（相鄰格子共用頂點、交界做斜坡）② 還有 131 次不合格：交界旁邊被斜坡擋住。改成每格獨立。
  - 被地板的邊擋住、畫面上本來就看不到的點（95 次）不算。
  - **射線貼地 5 cm 以內的另外列（72 次），最大偏 0.86 m，不擋**：
    - 站在屋裡往南點緣側外面的第一排前院，射線剛好擦過緣側的邊，落點在緣側邊上。
    - 順著沓脫石往下點，射線和石階差不多斜，落點停在上一階。
    - 畫面上那一排本來就幾乎被緣側擋住；往前一步再點就準。這是「先將就的」。
- 在 `d64b75c20` 上一起跑、ALL PASS：`wz_teahouse_yard_unit`、`wz_teahouse_seats_unit`、`wz_shops_unit`、`wz_shops_cam_unit`、`wz_shops_lm_unit`、`wz_shops2_unit`、`seat_reach_unit`、`nav_buildings_unit`、`wz_interiors_aa659_unit`，以及另外 40 支讀到 teahouse 的 `*_unit.js`。
- 瀏覽器沒跑（D131）。CC 的 TAPSCAN 可以在電腦上量真的點地。

## 接法（LAWWW-C）

`git apply docs/art-rebuild/second_ai/wip/teahouse_tap_1105/teahouse_tap_1105.patch`（`d64b75c20` 上 `--check` 通過）：`src/zones3d.js` 13 行、新測試 `tests/teahouse_tap_unit.js`。

## 其他區域（BB-C 清單，還沒改）

在下一包看。xs_shanlan、xs_dakou、xs_xsports 是我的兩層樓店，樓梯的可點面在 GLB 載入以後才建（Node 看不到）。要先確認那一片在遊戲裡真的有，再決定補不補。
