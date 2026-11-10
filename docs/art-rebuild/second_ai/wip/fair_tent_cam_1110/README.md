# FAIR-TENT-CAM-1102：社團博覽會的帳篷擋跟隨鏡頭

狀態：**已交付**（patch＋Node 測試）。遊戲畫面等 CC 拍（D131）。LAWWW2 帳號 A，2026-11-10。

## 原因
- BB_218 最後兩節：在攤位之間走、站在攤位後面時，人被帳篷頂蓋住。
- 正式模型 club_fair.glb（大一 9 攤）、club_fair_expo.glb（大二 36 頂＋舞台）：
  - 每一攤或整片是一個合併網格、一個材質，帳篷頂和桌子、立牌分不開；
  - 帳篷不是鏡頭碰撞，也沒有接樹幹透視，所以鏡頭在帳篷頂上或另一攤後面時，整個人被蓋住。

## 修法（`src/zones3d.js`，patch `fair_tent_cam_9d4c54c16.patch`，在開發分支 9d4c54c16 上做的）
- 新的 `fairSeeThru(o)`：兩個社博正式模型載入時，每個網格的材質標 `userData.seeThrough`，並接上 `E3.patchSeeThrough`，和行道樹樹幹同一套。
  - 擋在鏡頭和玩家之間的部分，在玩家周圍網點透空；離鏡頭 1.7 m 內也透空。
  - 其他時候照常畫。
- 新測試 `tests/fair_tent_cam_unit.js`。

## 測試
- `fair_tent_cam_unit.js`：在 Node 建出社博那一天的校園，正式模型從檔案讀；帳篷附近每 1 m 一點 × 8 個鏡頭方向，用 followCam 算。
  - 大一：頭到鏡頭穿過帳篷 421 次。開發分支 421 次都擋住、不會透空，**FAIL**；加 patch 後 0 次，**ALL PASS**。
  - 大二：穿過 1,861 次。開發分支全部 **FAIL**；加 patch 後 0 次，**ALL PASS**。
- 回歸 `regression_9d4c54c16.txt`：讀到社博的 11 支（club_fair_align、club_fair_expo、clubfair_1027、fair_staff_lod、clubs_aa110、aa613…）＋兩支校園 seethru，都 ALL PASS。

## 沒有測過
- 瀏覽器畫面：請 CC 在大一社博那天（2025-11-15）、大二（2026-09-12）各走一段攤位中間、站到攤位後面看。
