# WINVIEW-EDGE-STRIPE-1114：視差窗景照片邊緣拉成條紋（BB_379，LAWWW2-C 11-14）

**看到的**：BB-C 在 WINVIEW_GG3_r2（CC 截圖 `before_cc_xianguo_1400.png`）裡看到：汀州鮮果 14:00 樹冠上半變成一條條直紋，三間店左右兩邊比較遠的樹是橫紋。

**原因**：
- 條紋不在 3D 樹上，也不在窗景卡上，是在視差窗（`W3.windowMat`，`src/world3d.js`）。
- 鏡頭往上、往旁邊看到照片外面的時候，原本是 `uv=clamp(...,0.002,0.998)`，取的是照片邊上那一排像素。
- 以前照片邊上都是天空，同一個顏色，看不出來。GG-STREET-TREES 以後，邊上有樹，那一排像素就被拉成條紋。

**改法**：只改一行 shader。照片外面改成鏡像取樣（`wvMirror`）：往上看到的是樹冠鏡像回來，往旁邊看到的是街鏡像回來，不會再是同一排像素拉長。照片範圍裡面完全沒變。所有用 windowMat 的視差窗都一樣適用：公館、新生南路、溫州街、總圖、教室。

**patch**：`winview_edge_mirror_on_2da495e693.patch`，內容是 `src/world3d.js` 一行加一個函式，加上新測試 `tests/winview_edge_mirror_1114_unit.js`。

**測試**：
- 新測試在改之前 FAILED 2，改之後 ALL PASS。
- 窗景、視差窗、圖書館、教室相關的 Node 測試都 ALL PASS。
- world3d.js 語法檢查過。
- 還沒在瀏覽器裡看過：要請 CC 同一個鏡頭重拍（安泰、汀州鮮果、榮恩典 14:00），再請 BB 判。
