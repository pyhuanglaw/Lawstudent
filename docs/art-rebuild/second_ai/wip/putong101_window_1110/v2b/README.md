# PUTONG101-WINDOW-1102 第 2 版 B（博思一樓玻璃白天反射天空）— LAWWW2 帳號 A，2026-11-10

狀態：`MODEL_READY`，交 LAWWW 整合。**取代** `../v2/`：那個 WIP 多了一個網格，不要用。遊戲截圖請 CC 拍（D131）。

## 玩家會看到的差別
- 普通 101 北面的窗外是博思一樓的玻璃大廳。
- 以前：白天整片幾乎是黑的。BB 量 RGB 是 [42,38,28]，第 1 版的頂點色調亮，實際上看不出差別。
- 現在：白天那片玻璃加一層灰藍 #4f5f73，像反射對面的天空和普通的白牆。目標平均約 [110,120,130]。
- 晚上這一層是 0，照舊看得到室內的燈。遠的時候跟著霧淡掉。

## 做法（LAWWW 選 B：不多網格）
- `tools/blender/env_second/campus_teach.py`：
  - 那片帷幕的範圍（校園座標，前後各放 0.1 m）寫進 by_glass 網格的 `extras.skyBox`，範圍是 [−47.05, 0, −74.72] 到 [−28.95, 4.3, −74.52]。
  - 拿掉第 2 版那片 by_skyref。重匯 campus_boya.glb：8,630 個三角形，4 個材質，和第 1 版一樣。
- `src/zones3d.js` 的 `glassSky`（attachWenzhouModel 裡，ck_glass 有 skyBox 的才套）：
  - shader：
    - 頂點把 position 傳過去，片段只在範圍內加灰藍。
    - 加在輸出色空間，等於加法混合；半透明材質才除以 alpha。
    - 霧裡乘 (1−fogFactor)。
  - 白天的比例：每次畫之前（onBeforeRender）算 1 − emissiveIntensity／nightI。ck_glass 白天 0、晚上 1，所以白天 1、晚上 0。
  - customProgramCacheKey 加 `|glassSky`。其他棟的玻璃沒有 skyBox，不受影響。

## 測試
- `tests/putong101_window_unit.js`：
  - 第 0～2 項照舊。
  - 第 3 項：帷幕 42 個頂點全在 skyBox 裡、其他玻璃在外面、沒有多的網格。
  - 第 4 項：遊戲裡套得上 three.js 真的 MeshStandard shader；快取鍵不同；白天 1、晚上 0；別的材質沒有。
  - **開發分支 0ec32e6f6：3、4 FAIL**；套上 patch：**ALL PASS**。
- 回歸 28 支全過，包括 **teach_east_drawcall**（博雅照舊 ≤ 4 個網格）。見 `regression.log`。
- **沒驗證**：
  - GLSL 真的編譯（Node 不能編譯 shader，這個容器也沒有 GLSL 驗證工具）。我人工看過接起來的程式碼：fogFactor 在 fog_fragment 的 #ifdef 裡、宣告在函式層級；`#include <dithering_fragment>` 在 meshphysical 片段的最後。
  - 請 CC 第一次開校園時看主控台有沒有 shader 錯誤，再用 `python3 tools/blender/env_second/shots/teach_views.py <網址> putong_north` 重拍普通北窗的窗景（白天、晚上）。

## 整合
`git apply --binary putong101_window_v2b.patch`，已確認可以套在開發分支 0ec32e6f6 上。內容：campus_boya.glb／.json、zones3d.js、測試、campus_teach.py。
