# 總圖大廳一樓的小孤島（NAV-LIBHALL-ISLAND-1030；LAWWW2-B 2026-10-30）

- **起因**：LAWWW-B 整合 LM-COLLAPSE 總圖大廳時查到，`tests/library_copier_unit.js` 的「一樓沒有小孤島」一直 FAIL。
  - 總圖大廳一樓約 (5.85, −8.4) 有一塊只有 2 格的孤島。換回舊 GLB 也一樣：跟光照無關。
  - 這支測試有 FAIL 也 exit 0，所以全部 Node 一直把它算成通過。
- **位置**：一樓東側北牆的牆角。
  - 西邊是樓梯核心（實心，x 到 5.3），東邊是滅火器（x 6.35～6.65），北邊是牆。
  - 中間 1 m 寬的牆角裡只有一點人（半徑 0.3 m）站得住，四周的縫都比人窄，走不出去。
  - 遊戲裡「點地移動」點到那裡、或人物被擠進去，會卡住。
- **改法**（`docs/art-rebuild/second_ai/patches/libhall_island_1030.patch`，對開發 `4470ef1a9`，`git apply --check` 通過）：
  1. `src/data/library_layout.js`：
     - 一樓那支滅火器加 `nav`：[5.975, −8.7, 1.35, 0.4]，導航往西接到樓梯核心，把那個牆角整個封掉。
     - 畫面不變：Blender 的滅火器只讀 x、z，正式模型不用重做。
  2. `src/library3d.js`：
     - 地上小擺設（prop）的備用方塊，照東西本身的大小畫（`f.w`、`f.d`）。
     - 原本照 `nav` 畫：導航比東西大的時候，備用方塊會變成一塊 1.35 m 的長方塊。只影響正式模型沒載到的時候。
  3. `tests/library_copier_unit.js`：有 FAIL 就 `exit 1`。
- **測試**：
  - `library_copier_unit.js`：開發分支原樣「區塊 2」FAIL、exit 1（改過的測試）；套 patch 後「區塊 1」ALL PASS。
  - 可站的地方 22,629 → 22,623 格（0.1 m 一格；少的是那 2 格孤島和旁邊 4 格）。
  - `nav_buildings_unit.js` ALL PASS。
  - 會載入總圖配置的 Node 測試 61 支全過：含 `library_hall_lightmap_unit`、`library_b1_unit`、`library_upper_unit`、`library_media_unit`、`seat_reach_unit`、`quick_travel_unit`…
- **沒有測**：瀏覽器的 `reachability_all.py`（這一包只封掉一個走不到的牆角，沒有動到任何互動點附近）。
