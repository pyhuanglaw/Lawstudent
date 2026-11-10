# NTU-REF-1110 ③-1：男一舍外觀照官網照片改（X223／D136）— LAWWW2 帳號 A，2026-11-10

- 狀態：`MODEL_READY`，交 LAWWW 整合；BB 判（第 1 版）。以開發分支 74da28ca9 為底。
- 遊戲截圖、同角度疊圖請 CC 拍（`--mode campus`）。
- 對照圖 `male1_before_after.jpg`：左舊右新。Blender 渲染，不是遊戲畫面。Blender 讀 GLB 不吃頂點色，所以圓窗的玻璃在這張圖裡是淺灰；遊戲裡是暗的，測試第 2 項有檢查。

## 改了什麼
- 依據：官網照片（`docs/story_planning/ref_images/buildings/README.md` 男一舍那一列）是灰色清水混凝土，樓梯塔開圓窗，正門有水平的混凝土雨遮。原本的外觀是照文字資料做的遊戲化設計：米灰小口馬賽克，樓梯間是一整面鏤空花磚。
- 外牆：從馬賽克（rounded_square_tiled_wall）改成清水模，用 socsci_formwork，和博思的清水模是同一張。混凝土框架、窗框、雨遮改成灰色 #bdbab3。
- 正面中間的樓梯塔：拿掉鏤空花磚和後面的樓梯平台，改成清水模牆，開 5 個圓窗。
  - 二到五樓每層一個，位置在半層平台的高度；屋頂出口再加一個。
  - 圓窗半徑 0.48 m，窗框凸出 10 cm，玻璃是暗的頂點色。
  - D136：數量、位置不照抄。
- 保留：5 層（AA-C 10-21 J1，房號 507）、正門的平頂雨遮、窗、冷氣、屋頂的水塔、太陽能熱水器。
- 位置、佔地不變，所以導航、門口互動點不用改。三角形 13,184。

## 測試
- 新測試 `tests/ntu_ref_male1_unit.js`，三項：
  1. 外牆是清水模，沒有馬賽克和花磚；
  2. 樓梯塔有 5 個暗的圓窗；
  3. 照舊是 5 層。
- **開發分支 74da28ca9：FAILED 2**（1、2）；套上 patch：**ALL PASS**。
- 回歸：讀到 campus_male1、校園、attachWenzhouModel 的測試，38 支全過，見 `regression.log`。

## 整合
`git apply --binary ntu_ref_male1_1110.patch`。內容：campus_male1.glb／json、campus_male1.py、新測試。
