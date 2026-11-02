# 總圖一樓 version 2（WIP，還沒交件，不要整合）— LAWWW2〔帳號 A〕2026-11-02

- **狀態**：`WORK_IN_PROGRESS`，`CHECKPOINT_SAVED`（只是備份，不是交件）。
- **起因**：使用者 11-02 08:58「舊有的空間配置 能用的就沿用 按造實際配置安排」（B1／1F／2F／3F 平面圖＋鳥瞰），09:01 一樓兩張照片（中庭的木頭階梯書牆＋夾層、半圓形展演廳）。LAWWW 11:14 ACK「一樓 version 2 照你的做法；version 1 留著當備用」。
- **內容**：
  - `library_hall_v2_wip.patch`：遊戲程式（基準 `ba125d6f3`）。新檔 `src/library_hall_v2.js`（LBV2：導航、備用幾何、家具、互動點、正式模型載入）；`src/library3d.js` 在 layout 是 version 2 時轉給 LBV2；`src/data/library_layout.js` 換成 version 2；`index.html` 多載入一支；59 支測試的檔案清單加 `src/library_hall_v2.js`；`tests/nav_buildings_unit.js` 的總圖段改成 version 2（Node 157 項 ALL PASS）。
  - `library_hall_v2_layout.json`：配置（`tools/blender/env_second/library_hall_v2_layout.py` 從 version 1 產生）。
  - Blender：`tools/blender/env_second/library_hall_v2.py`（**還沒跑過**）。
- **還沒做**：Blender 模型、遊戲內截圖、library_hall_cam_core_unit／library_hall_lightmap_unit 的 version 2 版本、瀏覽器流程測試、reachability_all、舊存檔 unstick 檢查。
