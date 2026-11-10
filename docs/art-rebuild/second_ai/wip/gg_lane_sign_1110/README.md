# GG-LANE-SIGN-1110：公館巷口告示牌的字被切掉（BB 11-10 P3）— LAWWW2 帳號 A

- 狀態：修好，交給 LAWWW 整合。以開發分支 `97979ca46` 為底。
- 來源：BB 11-10 判 GGLANE FIXED 時記了一項 P3。近看告示牌（A3_lane_close），字被框切掉，只看得到「人巷道 請勿進」。
- **原因**：
  - 告示牌是一行字，遊戲畫字時字高是板高的一半（zones3d.js 的 `wzPlateTex`）；
  - 「私人巷道 請勿進入」9 個字，寬度要板高的 4.5 倍；但牌子 1.16×0.36 m，只有 3.2 倍寬；
  - 所以兩邊被切掉。
- **改法**：
  - 字改成兩行：上面「私人巷道」、下面「請勿進入」，用遊戲本來就支援的第二行 `sub`，程式不用改；
  - 只改 `gg_lane_gate.py` 給告示牌的字，重新匯出 `gg_lane_gate.glb`；
  - 二進位資料（網格、貼圖）和原本完全一樣，只有告示牌那一個節點的 extras 變了；
  - 牌子大小不變。
- **測試**：`tests/gg_lane_close_unit.js` 加了 2b「告示牌的字放得進牌子」，照 wzPlateTex 的字高算每一行寬度，要 ≤ 牌子寬的 90%。
  - 開發分支 `97979ca46`：**FAILED 1**（一行要 4.50 倍高，牌子只有 3.22 倍）；
  - 套上 patch：**ALL PASS**（兩行各 1.36、1.04 倍）。
- **回歸**：讀到 gongguan、gg_lane、gg_shops、zone_assets 的 160 支，159 支 ALL PASS。
  - `aa498_pool_unit` FAILED 1：index.html 的載入順序；開發分支 `97979ca46` 上一樣是 FAILED 1，和這次無關。
- 畫面請 CC 近拍巷口告示牌（D131）。
- 整合：`git apply --binary gg_lane_sign_1110.patch`。
