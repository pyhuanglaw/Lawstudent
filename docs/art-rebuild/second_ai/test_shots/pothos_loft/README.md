# ART-04 黃金葛：改放四人房（LAWWW2-C 2026-10-17；狀態 READY_FOR_ART_REVIEW）

- **為什麼改**：`prop_pothos.glb`（LAWWW2-B WIP 8a1af723，S1～S4 四種大小）原本照舊雙人房的書桌做（左前角 (1.11, 0.77, −2.36)）；宿舍已經換成台大四人房（ART-DORM-LOFT，LAWWW-B 已整合）。
- **新的位置**（`tools/blender/env_second/prop_pothos.py` 的 `PLACE`，寫在 GLB 根節點的 `place` 屬性）：祐廷 L2 書桌 +z 那一端的前緣 **(−2.39, 0.76, 0.145)、ry = π/2**。
  - 遊戲已有的互動點 `z.spots.pothos`＝(−1.55, 0.215)（LAWWW-B，zones3d.js）就在盆栽前面。
  - 再往 +z 會碰到 `Y203_YUTING` 的馬克杯；書桌那一端是書桌側板（u 0.315～0.337）＋整面衣櫃（u 0.34 起）。
- **藤**：第 2、3 條照舊越過書桌前緣垂下（衣櫃門面在 x −2.30，垂藤在前緣外 1～3 cm，不碰）；**第 1 條原本往書桌側緣垂、會穿進側板和衣櫃，改成沿桌面前緣往書桌另一端爬**（S4 爬得更遠），避開筆記本。
- **遊戲端接法**（LAWWW）：`ASSETS` 加 `prop_pothos`、`F.POTHOS` 時放在 `PLACE`、四種大小照 `pothosWaterN` 切換 `POTHOS_S1～S4` 的 visible；材質照宿舍家具加 `TK.bounce(0.3, 0.4)`（截圖腳本就是這樣接的）。
- **截圖**：`tools/blender/env_second/shots/pothos_dorm_shots.py`（開發分支 `a39a6812`＋這個 GLB，在頁面裡用 GLTFLoader 放上去；src 沒改）；Playwright 手機模擬（390×844、844×390），**不是真機**。修改前＝現在的遊戲（沒有盆栽）。
