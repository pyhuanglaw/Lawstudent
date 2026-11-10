# PUTONG101-WINDOW-1102 第 4 版（v2D）— LAWWW2 帳號 A，2026-11-10

- 狀態：`MODEL_READY`，交 LAWWW 整合。
- 以開發分支 8d8b475dc 為底，它已經有 v2C。
- 遊戲截圖請 CC 用同一個角度重拍（D131）。

## BB_255 的判定（v2C 沒有作用）
- 北窗：v2c 是 [40,38,33]，比 v2b 的 [50,54,57] 還暗。
- 博思中間那片：v2c 是 [44,50,55]，v2b 是 [62,75,90]。
- 東南角：三版都是 [60,67,68]。

## 原因（兩個，都查到了）
1. **顏色用錯色空間**：
   - 這段 shader 在 `dithering_fragment` 混色。遊戲沒有後製，這時 gl_FragColor 已經過 tone mapping、轉成 sRGB，是**輸出色空間**的數值。
   - 我卻用 `new THREE.Color(hex)` 傳顏色。three.js 會把 hex 當成 sRGB，轉成**線性**值。
   - v2b 加的 0x4f5f73 轉成線性是 (20,29,44)。CC 量到的增加量是 (19,29,42)，對得上。第 2 版 README 寫「只剩三成、原因沒查到」，原因就是這個。
   - v2c 混的 0x6e7882 轉成線性是 (40,48,57)，所以混了以後反而比 v2b 暗。
2. **「東南角那一片」在東立面**：
   - 看 GLB 的頂點，那一片在博思的東立面一樓：x −21.16，z −75.25～−84.25，朝東；從普通的北窗斜著看得到。
   - 第 3 版的範圍 z 只到 −75.37，只碰到它的邊，所以三版都沒變。

## 改了什麼
- `src/zones3d.js` 的 glassSky：
  - 灰藍改用 `THREE.Vector3` 直接傳輸出色空間的數值 [110,120,130]/255，不經過 THREE.Color 的轉換。
  - 快取鍵改成 `|glassSky4`。
  - 其他照舊：混 85%、晚上 0、霧裡淡掉。
- `tools/blender/env_second/campus_teach.py`：匯出前照玻璃網格實際的頂點，把範圍往南延到東立面一樓那一片的盡頭。
  - 重匯 campus_boya.glb：二進位內容一模一樣，只有 extras.skyBox 的 z0 從 −75.37 變成 −84.3。
  - 三角形 8,630、材質 14，和以前一樣。
- 一樓沒有別的玻璃在這個範圍裡，樓上的玻璃也都在外面（測試第 3 項查）。

## 測試
`tests/putong101_window_unit.js`：
- 第 3 項：改成一樓的玻璃全部要在範圍裡，包括東立面那一片。
- 新增第 5 項：傳進 shader 的灰藍，乘 255 要等於 [110,120,130]；用 THREE.Color 會 FAIL。
- 第 4 項：拿掉 `getHex()===0x6e7882`（新的做法不是 THREE.Color），改由第 5 項查。其他條件照舊。

結果：
- **開發分支 8d8b475dc（v2C）：FAILED 2**（第 3、5 項）；套上 patch：**ALL PASS**。
- 回歸：和 v2C 同一份 28 支，全部通過，見 `regression.log`。

## 沒驗證
- GLSL 實際編譯（Node 只檢查 shader 文字）。
- 畫面上的顏色真的到 [110,120,130]。
- 請 CC 用 teach_views.py 重拍 putong_north 和博思一樓東南角，量玻璃的平均顏色。照上面的原因，北窗、中間那片應該到 [100～130] 左右，東南角也會變。

## 整合
`git apply --binary putong101_window_v2d.patch`。內容：campus_boya.glb、zones3d.js、campus_teach.py、測試。
