# 男一舍門廳的牆縫（DORM1-WALL-SEAM／LM-SEAM-GEO，LAWWW2-C 2026-11-05）

- LAWWW-C 05:39 排的佇列第 3。D141 排在店面後面，店面都交了才做。
- 問題：
  - 走廊北牆、樓梯間的牆段接頭，有一點一點的縫，看得到後面烘成黑色的端面。
  - LM-SEAM-1028 只把端面改亮，放大還是看得到。
  - 原因是 T 形接頭：一條三角形的邊中間夾著別段牆的頂點，自己卻沒有那個頂點，畫的時候兩邊的邊對不齊。
- 改法：
  - `tools/blender/dorm_hall.py` 匯出前跑 `conform_tjunctions`：把灰泥、腰牆每一條邊上夾著的頂點插進邊裡，新頂點用同一個座標，兩邊完全對齊。
  - 這段程式在 `a46a36a71` 就已經在這個分支上。
  - 重新烘光照貼圖：`bake_dorm_hall.sh`，512 samples、1024，CPU 945 秒。
  - 烘焙的輸入（`dorm_hall.py`、`b3lib.py`、`lib2.py`、`dorm_layout.js`、`bake_room.py`）和開發分支 `685337469` 一模一樣，只多了這段。
- 換的檔案：`assets/models/env/dorm_hall.glb`、`dorm_hall_lm_day.webp`、`dorm_hall_lm_night.webp`。
  - GLB 3,922,716 → 3,959,224 B。
  - 牆的三角形 1,416 → 1,760。
  - 光照貼圖平均亮度和原本一樣（白天 72.0／70.4／64.5 → 71.7／70.1／64.3）。
- 測試 `tests/dorm_hall_tjunc_unit.js`（新，讀 GLB，用 `tools/blender/env_second/glb_tjunctions.js`）：

| | ① 灰泥、腰牆的 T 形接頭 ≤ 3 | ② 同一個網格自己的 T 形接頭＝0 |
|---|---|---|
| 修改前（`685337469`） | FAIL：176 個 | FAIL：128 個 |
| 修改後 | PASS：3 個（牆垂直相接，頂在另一面牆的對角線上，不是共平面的縫） | PASS |

- 同一個樹上：男一舍、宿舍、光照貼圖相關的 36 支 `*_unit.js` ALL PASS，包括 `dorm_hall_lightmap`、`dorm_lightmap`、`dorm_seethru`、`dorm_cam`、`rooms_glb`、`lm_instancing`。
- **遊戲內還沒看**（D131，瀏覽器在使用者的 PC）。請 CC 照 `docs/art-rebuild/second_ai/test_shots/dorm_hall_lm_1028/` 的同角度（白天 3 張、晚上 2 張）重拍，看接縫還在不在。
- 萬才館柱子很細的倒角（LM-SEAM-GEO 的另一半）這一包沒做。D141：使用者沒提、不擋玩。
- 接法：`git checkout <本包 SHA> -- assets/models/env/dorm_hall.glb assets/models/env/dorm_hall_lm_day.webp assets/models/env/dorm_hall_lm_night.webp tests/dorm_hall_tjunc_unit.js tools/blender/dorm_hall.py`。不用改程式。
