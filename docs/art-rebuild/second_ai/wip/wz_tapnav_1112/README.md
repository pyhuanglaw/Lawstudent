# WZ-SUNNY-TAPNAV-1112：點了走不到的地方，人完全不動也沒提示（LAWWW2-C 2026-11-12）

## 查到的（Node，引擎真的 canStand、pathTo、stepEntity）
- 溫州街 (−35,−1.6) → (45,−1.6)：兩點都站得住，`E.pathTo` 有路（直線一段）；`E.simWalk` 走得到 (44.8,−1.6)。
- 加上 `WZ_PROP_BLOCKS`（正式模型載入後才擋的擺設）也一樣有路。
- 結論：溫州街這一段在導航格子上沒有斷。遊戲裡 path 一直是 null，可能是下面幾種之一，要 CC 記錄點的那一刻的狀態才分得出來：
  - 點的那一刻 `P.busy`、`E.cam.mode!=='follow'`、對話框開著（`E.onTap` 吃掉），整個點擊都沒處理。
  - 有路，但第一步就被模型的碰撞擋住，1.5 秒沒前進就被 stallStop 放掉，path 變 null。94 秒後看到的就是 null。
  - 遊戲裡才有的動態擋格。
- 請 CC 下一輪記三樣東西：點的那一刻的 `P.busy`、`E.cam.mode`；`E.moveTo` 的回傳；之後 2 秒內 `P.path` 有沒有出現過。

## 先做的體驗改善（`tap_nopath.patch`）
- `src/engine3d.js`：點地面時 `E.moveTo` 回 false（真的找不到路），從點的位置往玩家這邊每 0.5 m 試一次，走到這條線上最近走得到的地方。都不行就提示「那邊走不過去」。`E.tapNoPath` 會計數，給 CC 看。
- `src/game3d.js`：`E.toast` 接到原本的 toast。
- 新 `tests/tap_nopath_1112_unit.js` ALL PASS；回歸 tap_seat_ray、l118_interact_reach、nav_notch_traps 都 ALL PASS。

## 要 AA 確認的
提示句「那邊走不過去」是系統提示，暫時由我寫。要換字請 AA 給，一句就好。
