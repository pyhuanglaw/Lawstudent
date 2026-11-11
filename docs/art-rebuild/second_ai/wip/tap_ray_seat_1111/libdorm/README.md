# TAP-RAY-SEAT：總圖、宿舍點椅面「不生效」（LAWWW 11-11 18:58 派回 LAWWW2，P1；BB：CC 在 b77af3a4f 跑 TSR_LIB／TSR_DORM）

狀態：**READY_FOR_REVIEW**。結論：**遊戲本身點得到**。CC 的 FAIL 是探針的三種情形；遊戲這邊只做一個讓探針讀數和遊戲一致的小改。

- patch：`tap_seat_libdorm_v1.patch`（2 個檔：`src/game3d.js`、新 `tests/tap_seat_libdorm_1111_unit.js`；基底開發分支 `3df6cfdf6a`）。

## 查到的

用雲端瀏覽器（SwiftShader），照 CC `cc_tapseat_reg_probe.py` 的起點重現：

- 總圖：讀檔到 `library_hall` (−4,0) 第 1 層，面向 −0.785；
- 宿舍：出生點 (0,5.6)；
- 兩邊都是鏡頭在玩家背後。

`repro_browser.js` 重現出來的鏡頭位置 (−0.85,8.43,−3.15)、離椅子 11.16／9.77 m、螢幕座標，都和 CC 的 log 一樣。在那一刻呼叫 `E.tapRedirect`：

| 椅子 | 帶遊戲真的參數 `{ray,fy,hit}` | 探針的呼叫 `{ray,fy}`（沒帶 hit） | CC 的結果 |
|---|---|---|---|
| 總圖 1 (−10.175,2.2) | 導去這一張 | null | 走到這一張、按鈕「坐下讀書」、坐得下（PASS） |
| 總圖 2 (−7.025,3.8) | **不導**：射線先打到二樓的白柱子（L1_plaster (−4.95,6.45,1.46)） | null | 走到地板那一點（FAIL） |
| 總圖 3 (−8.075,5.8) | 導去這一張 | **別張** (−9.125,7.4)（照舊的地板判斷） | PASS |
| 宿舍長桌 (6,3.42)、(6,4.98)、(4.8,3.42)、沙發 (9,5.85) | 都導去那一張 | null | 沙發 PASS；長桌 (6,3.42) 點下去手機開著、沒點到遊戲畫面（r2 判「不判」） |

1. **總圖椅子 2**：椅子中心那個像素被柱子擋住（`lib_taps_crosshair.png` 第二格：十字正好在柱子邊上，椅子左半邊露在外面）。點那個像素＝點柱子，照規則不導。點露出來的那一半就導得到。
2. **宿舍長桌椅子**：手機開著，點不到遊戲畫面。BB 19:00 修好的探針 r2 判「不判」；r2 其他（沙發、走道 1～4）全 PASS。
3. **log 的「tapRedirect 導去 null」**：探針呼叫 `E.tapRedirect(x,z,lv,{ray,fy})` 沒帶 `hit`（地板那一點）。`tapToSeat` 的射線判斷要 `hit` 才跑，所以探針自己那一次永遠拿到 null，或照舊的地板判斷挑到別張。遊戲（`engine3d.js` 271 行）有帶 `hit`，實際走路是對的。

## 改法（`src/game3d.js` tapToSeat，3 行）

沒給 `hit`、有 `ray`＋`fy` 時：地板那一點＝射線和 y＝fy 的交點（`screenToFloor` 沒有走路網格時也是這樣算）。

- 遊戲本身有傳 `hit`，行為不變；
- 探針、測試那種呼叫，讀數會和遊戲一致。

## 給 CC 的探針改法（LAWWW 請我直接寫給 CC，已傳，副本 BB）

1. `TAP_PT` 的 `tapRedirect` 補 `hit:{x:h.x,y:h.y,z:h.z}`。
2. `TAP_PT` 加 `E.rayFirstHit` 判斷：射線第一個打到的東西不在目標點 0.35 m 內、高度差 0.6 m 內＝`blocked`。
3. `aim()` 的 `bad` 加 `q.get('blocked')`：沿用現有的換點（OFFS）→ 轉鏡頭 → 走近。

## 測試（`tests/tap_seat_libdorm_1111_unit.js`，Node，約 2.5 分鐘）

做法和 `tap_seat_ray_real_1111_unit.js` 一樣：遊戲真的區域＋正式模型 GLB、three 的 Raycaster、牆淡出照 `z.fadeWalls`。

1. 總圖大廳二樓（10 張）、閱覽區（44 張）、宿舍交誼廳（6 張），每一張椅子：
   - 鏡頭：近的（3.2／4.6 m、俯角 0.3～0.7）和 CC 那種遠的（8／10／12 m、俯角 10°～20°），八個方向，點椅面中心；
   - 射線先打到那張的（664／2378／291 次），帶 `hit`、不帶 `hit` 都導去那一張。
2. CC log 的那幾下（同一個鏡頭、同一條射線）：
   - 總圖椅子 1、3、宿舍四張：帶不帶 `hit` 都導去那一張；
   - 總圖椅子 2：射線先打到柱子，兩種呼叫都不導。
3. BB 的四個走道點（總圖 (−8.5,5)、(−11,6.5)；宿舍 (11.5,3)；Café (1.5,−0.5)）：看得到地板的 85 個點，帶不帶 `hit` 都照舊走過去（null）。

- **修改前（3df6cfdf6a，`before_3df6cfdf6a.log`）**：1 FAIL（帶 `hit` 664／2378／291 全部導對＝遊戲本身沒問題；不帶 `hit` 0 次）、2 FAIL；3 PASS。
- **修改後**：ALL PASS。
- `tap_seat_ray_real_1111_unit`、`tap_seat_ray_1111_unit`：ALL PASS。
- 全部 Node 測試：見下面。

## 沒做的

- 「椅子被柱子擋住一部分時，點柱子也導去椅子」**沒做**：那會回到 BB TSR 那一種（射線先打到別的東西也被帶去椅子），走道點會退。
- 手機實機、CC 的 PC 上沒有跑過這一版（D131）。CC 照上面改了探針以後，TSR_LIB／TSR_DORM 重跑給 BB 判。
