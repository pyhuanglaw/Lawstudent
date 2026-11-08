# 光照第二級最後一組：新生南路 8 區（LAWWW2-B 2026-11-08）

**狀態：WORK_IN_PROGRESS**。腳本、程式 patch 已寫好；烘焙排在 LM-PARTITION-1108（隔間牆重烘六間）、總圖多媒體中心後面（CPU 只有 4 核）。

- 腳本：`tools/blender/env_second/lightbake/bake_xs.sh <店>`，有 dabu、haopai、tongxian、xsports、shanlan、dakou_1f、dakou_2f、nanyang_lobby、nanyang_hall。
- 程式 patch `xs_lm_1108.patch`（對開發 `f7c6380d7`；這三個檔和 `df95b5042` 一樣）：
  - `src/zones3d.js` `attachRoomGLB`：`root.userData.lightmaps`＝好幾顆 GLB 各自的光照貼圖，給大口用。大口一樓、二樓兩顆放在同一個 Group，Group 本身沒有 `extras.lightmap`。
  - `src/dakou3d.js`：把兩層的 `extras.lightmap` 放進 `lightmaps`。
  - `src/nanyang3d.js` `houseLights`：開演時叫 `z.lightsOff(1)`，換到「開演」那一張（場燈關，只剩走道地燈、太平門、銀幕）；演完叫 `z.lightsOff(0)`。
- 還沒做：試烘（128）→ 調亮度 → 正式烘（512）→ 測試（Node）→ 交件。
