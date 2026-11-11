# 兩點半 Café 吧檯坐下鏡頭整片是牆（CAFE-BAR-CAM-1111；LAWWW 11-11 11:23 派給 LAWWW2，發版後，P2）

狀態：**WORK_IN_PROGRESS**。

依據（LAWWW 11:23，BB 11:2x 回報、線上 779 就有）：搖桿坐「坐吧檯」（中間那張），鏡頭在 (−1.3,3.46,0.6)，看不到自己和吧台。要：座位鏡頭往後拉或改俯角，照其他店吧檯座位的做法；交 patch＋同機位截圖，CC 拍、BB 判。

## 原因

- 吧檯 10～13 號是高腳椅（坐姿抬高 lift 0.27），跟隨鏡頭看的點＝人＋1.45 m＝1.72 m；俯角 0.38（BB 那時候）、距離 4.2 m → 鏡頭高 3.48 m。
- 店的天花板有三根水泥大梁（`tools/blender/env_second/aa_support/cafe230_interior.py`：深 0.42、橫跨整間，材質 `a23_vc`），梁底約 3.2 m。中間那張（−1.3,−3.3）鏡頭在人背後 (−1.3,3.46,0.6)，梁的側面在 z 0.2、離鏡頭 0.44 m——**整個畫面就是那根梁**（不是牆）。
- 其他方向（鏡頭轉到吧台那一邊、店的後牆外面）還有吧台後面的胡桃木層架、風管、燈泡、黃金葛擋住。

## 改了什麼

`src/zones3d.js` attachCafe230：新的 `CAFE230_SEETHRU`＝`a23_vc`、`a23_vc_metal`、`a23_vc_gloss`、`a23_walnut`、`a23_bulb`、`a23_leaf_pothos`，這幾個材質網點透空（擋在鏡頭和人中間、或離鏡頭 1.7 m 內；`engine3d.js` updateSeeThrough，區域本來就 `seeThru:true`）。**照溫州街 SUNNY SIDE、小路座位鏡頭的做法**（WZ-SEAT-CAMS-1104：`sunnyside_layout.js`、`komichi_layout.js` 的 seeThru 也是家具、管線、植物、胡桃木）。比人遠的照常畫（人面前的吧台不會透）；牆（WALL_，本來就淡出）、地板、天花板不動。鏡頭距離、俯角沒改（沒有動引擎、不影響其他店）。

## 測試

新 `tests/cafe_bar_cam_1111_unit.js`（照 `wz_seat_cams_1104_unit.js` 的做法：Node 建出 cafe、正式模型 cafe230.glb 從檔案讀、鏡頭照 `E.followCam`、牆照 `z.fadeWalls` 淡出）：
1. 吧檯 10～13 號 × 鏡頭 16 個方向 × 俯角 0.22（預設）／0.38／0.6／0.9：256 個鏡頭——**修改前擋住 90 個，修改後 0**。
2. BB 那一格（12 號、鏡頭在人背後、俯角 0.38 → (−1.3,3.46,0.6)）：修改前被 `a23_vc`（梁）在 0.44 m 擋住，修改後沒有。
3. 全店其他 22 張座位、預設俯角、16 個方向：修改前擋住 37 個，修改後 0。

相關 17 支（`cafe*`、`wz_seat_cams_1104`、`badclip_*`、`room_ceiling`）全過。全部 Node 測試：還沒跑（排在點椅子那一包的全部測試後面）。

## 還沒做的

- 同機位遊戲截圖（Playwright、SwiftShader）：排在點椅子那一包的全部測試跑完以後拍（同時跑會搶 CPU）。
- 手機實機沒看過；請 CC 照 BB 的走法（搖桿坐中間那張吧檯）拍。
