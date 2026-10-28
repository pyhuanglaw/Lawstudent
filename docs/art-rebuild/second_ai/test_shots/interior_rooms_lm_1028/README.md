# 霖澤館 202、萬才館多功能教室：只加烘焙光照＋牆外暗殼（INTERIOR-AAA-REVIEW-1028；LAWWW2-C 2026-10-28）

- **這一包做的**：201 v2 的兩個做法套到這兩間，模型、配置、座位、導航都沒改。
  1. 光照貼圖（`tools/blender/env_second/lightbake/bake_room.py`）。
  2. 牆外暗色的殼：這兩間的窗都有窗景板，逐間確認過。
- **要先套**：`patches/interior_201_v2_1028.patch`（`roomLightmap`、`roomBackdrop` 在那裡）。
  - 再套 `patches/interior_rooms_lm_1028.patch`：
    - `zones3d.js`：`roomBackdrop` 加房間中心參數。
    - `rooms_glb3d.js`：`BACKDROP` 兩間開暗殼。
    - `LICENSES.md`：202 那一列。
  - 二進位檔在 commit 裡的實際路徑：`assets/models/env/second_ai/linze_202.glb`、`wancai_multi.glb`、`linze_202_lm_day/night.webp`、`wancai_multi_lm_day/night.webp`。
- **重做**：`bash tools/blender/env_second/lightbake/bake_flat_rooms.sh`；參數在 `lightbake/linze_202_lm.json`、`wancai_multi_lm.json`。
- **狀態**：`READY_FOR_ART_REVIEW`。

## 同角度改前／改後

- 遊戲內，下午 2 點。手機橫向模擬，不是 iPhone。

![202](cmp_202.webp)

![多功能教室](cmp_multi.webp)

## 結果和還不夠的地方

- **改善**：
  - 鏡頭在牆外時，原本整片淺藍色天空，現在是暗色。
  - 桌子底下、牆角比較暗，燈下面比較亮。
- **還不夠**：
  - 只加光，桌椅還是原本細細的樣子，整間看起來還是比 201 v2 簡單。這正好是檢討報告第 0 節的結論：光很重要，但只有光不夠。
  - 下一步是家具和細部照 201 v2 做（`flat_classroom.py`），等使用者看過 201 的方向再做。
  - 白牆有點偏亮，可以再調。
- **測試**（05740674b＋201 patch＋這個 patch）：
  - Node：rooms_glb_unit、windowless_night_unit、x78_rooms_unit、room_ceiling_unit、class_teacher_unit、boya_203_unit、dorm_205_unit、door_open_unit、seat_fold_unit 全部 ALL PASS。
  - reachability_all --zones linze_202,wancai_multi（瀏覽器）ALL PASS：202 43 個互動點、多功能教室 35 個。
- **烘焙前後的 GLB**：材質（雙面、透明、自發光、顏色）、節點、頂點屬性都一樣，只多第二套 UV。

## 效能

- 光照貼圖：每間兩張 1024 的 WebP（約 80 KB）。
- draw call、三角形幾乎不變（多一個暗殼）：202 窗邊鏡頭 86 → 87 calls。
