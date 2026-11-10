# YZ-CUP-FLOAT-1110：一盞的外帶杯浮在空中（使用者 X289；BB 11-08 重現判 GAME_BUG）

狀態：**已交付**（patch＋Node 測試；LAWWW 整合；整合後由 CC 用 BB 的 day47、day51 兩份存檔跑新舊對照）。LAWWW2 帳號 A，2026-11-10。

## 原因
- `src/zones3d.js` 的 wzShop 把一盞（wz_teahouse）整個房間的群組 g0 往 +z 搬了 cz＝9.6−d/2＝**2.3 m**（房間 z −5～9.6）。
- `src/seatact3d.js` 的 rebuild 用**世界座標**擺桌上的東西（S.probe 照 matrixWorld 找桌子），卻把群組直接掛在 `E.zone.group`（＝g0）底下。
- 所以每一件都多偏了 2.3 m。BB 的探針 `lawww2_js.json` 裡，`desk:item_cup` 的群組 z 正好是 2.3。
- 杯子在 (−2.32, 0.34, −0.24)，原本該在 (−2.32, 0.34, −2.54) 那張矮桌上；往 +z 偏 2.3 m，就跑到榻榻米上方 0.34 m 的空中。

## 修法（只改 seatact3d.js rebuild 一處）
- 群組掛上去以後，用父群組 matrixWorld 的反矩陣抵銷，讓桌上的東西回到世界座標。
- 沒有位移的區域是單位矩陣，照舊。這樣改是通用的：之後別的區域的群組有位移也不會再偏。

## 測試 `tests/seatact_offset_group_unit.js`（不需要瀏覽器，D131；用正式模型 yizhan 室內）
- A：一盞坐滿路人時，桌上有東西。
- B：每一件都在座位 0.95 m 內。
- C：每一件下面都有桌面，高度差 1 cm 內（用 Raycaster 打看得到的網格）。
- D：BB 的座位 (−2.15,−2.1) 前 0.9 m 內有東西。
- E：cafe 對照，群組是單位矩陣。
- 開發分支 72c889ec3：B、C、D **FAIL**，10 件都偏了 1.1～1.9 m。例：`item_cup(-2.67,0.35,4.30)` 離座位 1.86 m，下面是地板。
- 加上 patch：**ALL PASS**。BB 的座位是 `rset_cup_lod1(-2.15,0.34,-2.41)`。

## 回歸（8c050804c＋patch）：`regression_8c050804c.txt`
seatact_offset_group、seatact_lib3f、seat_activity_1104、seat_ambient、exam_lib_crowd、read_phone、sit_task_wire、ade_seat_clip、teahouse_tap，全部 ALL PASS。

## 檔案
- `yz_cup_float_8c050804c.patch`：在 8c050804c 上 `git apply --check` 通過。內容是 seatact3d.js＋新測試。
- `seatact_offset_group_unit.js`：測試的副本。

## 沒有測過
- 瀏覽器畫面：等 CC 跑（D131）。
- 其他群組有位移的區域：用 `grep "group.position"` 查，目前只有一盞有 cz；修法是通用的。
