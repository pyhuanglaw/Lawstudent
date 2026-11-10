# XS-BRICK-WALK-1110：新生南路紅磚人行道磚紋（X246）— LAWWW2 帳號 A，2026-11-10

- 狀態：`MODEL_READY`，交 LAWWW 整合；BB 判。以開發分支 48aa47a5b 為底。
- 遊戲截圖請 CC 拍（D131）：新生南路側門外的人行道，白天、晚上各一張，站在人行道上、往南看。

## 為什麼做
- 使用者 11-05：「新生南路側門改成我的照片的樣子」（USER_WANTS X246：人行道花台、紅磚、廣場…）。
- 差距表裡「紅磚人行道」原本是一整片純色 #b77a62，沒有磚紋。
- LAWWW 11-10 13:28 派：PBR 磚紋（D38 第 6 點），draw call 不能增加。

## 玩家會看到什麼
- 校園那一側的人行道從一片紅色，變成一塊一塊的紅磚：
  - 丁字砌，一塊磚約 23×10 cm，長邊順著人行道；
  - 有磚縫的凹凸（法線貼圖），每塊磚的深淺、偏褐偏橘有一點不同。
- 整體顏色和原本一樣：平均調回 #b77a62。
- 範圍：近景的人行道、遠景往兩頭延伸的那幾段、南端沿校園圍牆轉角的那一段、側門洞裡那一小段。
- 店面那一側的騎樓、人行道（米灰）不動。

## 做法
- **貼圖**：`tools/blender/env_second/textures/xs_brick_tex.py`。
  - 來源：Poly Haven CC0 `brick_pavement_04`（已經在 repo，LICENSES.md 已登記，這次補上新的用途）。
  - 原圖紅、深褐、灰的磚混著，腳本做三件事：
    - 每個像素的明暗照原圖；
    - 色相拉到紅磚色，留一半的色差；
    - 平均校正到 #b77a62。
  - 輸出 `assets/textures/campus/brick_red_diff.webp`（512×512，78 KB）、`brick_red_nor.webp`（39 KB）。
  - `brick_red_tiled.jpg` 是貼圖 2×1 拼起來的樣子，看接縫用。
- **程式**：`src/xinsheng3d.js`。
  - 紅磚的地面全部共用**一個**材質 `xs_brick_walk`（MeshStandard：顏色貼圖＋法線，粗糙度 0.9）。
  - UV 照世界座標算：一張 1.8 m，u＝z、v＝x。這樣：
    - 段與段接得上，不會每一段從頭開始；
    - 遠景照舊照材質合成一個網格（`W3.mergeGroup`）。
  - 貼圖載入前、載入失敗時，照舊是 #b77a62 的純色，載到才換圖。
- **draw call**：整個區域的網格修改前後都是 238 個；遠景的紅磚照舊是 1 個網格。

## 測試
- 新測試 `tests/xs_brick_walk_unit.js`，在 Node 建出新生南路區域：
  - ① 紅磚地面都用同一個 `xs_brick_walk`，沒有剩下純色 #b77a62 的地面；
  - ② 每個紅磚網格的頂點 uv＝(世界 z, 世界 x)／1.8；
  - ③ 遠景的紅磚合成 1 個網格；
  - ④ 程式讀的兩張貼圖都在。
- 結果：**開發分支 48aa47a5b：FAILED 4**；套上 patch：**ALL PASS**。
- 回歸：讀到 xinsheng3d、新生南路區域、xinsheng_layout 的 46 支，全部通過，見 `regression.log`。
  - `shop_crowd_new_unit` 印的是「全部通過」，不是 ALL PASS。

## 沒驗證
- 遊戲畫面：磚的大小看起來對不對、晚上會不會太亮或太暗。
- 手機效能：多兩張貼圖共 117 KB；材質從純色變成有貼圖＋法線，draw call 不變。

## 整合
- `git apply --binary xs_brick_walk_1110.patch`，已確認可以套在 48aa47a5b 上。
- 內容：xinsheng3d.js、兩張 webp、產生貼圖的腳本、LICENSES.md（brick_pavement_04 補用途）、新測試。

## 先將就
- 側門內的廣場（校園那一邊）不在這個區域，這一包沒動。
- 正式門柱、圍牆的磚紋還是純色（LAWWW 11-10：先不做）。
