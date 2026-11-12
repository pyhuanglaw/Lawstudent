# SHOP-FIRST-APPROACH-1112（BB FIRST_gg_desk_r3：公館燒臘 233 ms、新生南路 150 ms、SUNNY 333 ms——第一次走近建店內那一幀）

- **還沒有 CC 的 shopReal.prof 數字**，這一包是照最常見的原因先做的：材質第一次畫的時候 WebGL 在主執行緒同步編譯、連結著色器（一間店十幾種材質，Windows／ANGLE 一個程式幾十 ms）。
- 改法（`src/zones3d.js` shopInsideReal）：店內建好（掛上場景、還藏著）那一刻就 `renderer.compileAsync(那一間, 鏡頭, 整個場景)`——有 KHR_parallel_shader_compile 的話在背景編、不卡主執行緒；照場景的燈編，之後畫的時候直接用同一個程式。編好以前這一間的零件先不打開（warmRun 跳過、先做別間的貼圖／clone／prep）；2.5 秒保險，編不完也照舊一幀一個打開。prof 多記 `compile`（編了多久）。
- patch：`shop_compile_async_v1.patch`（對開發分支 c618a7e819 `apply --check` 過）。
- 測試（Node）：`shop_real_inside_1112` 加 ㊷～㊻（修改前 FAILED 4）；gg_real_inside、wz_real_inside、zone_prewarm、place_gate、三支招牌燈 ALL PASS。
- 沒做：瀏覽器。CC 拍 FIRST_gg_desk 時請一起讀 `GAME.E.zone.shopReal.prof`（step.compile、step.mesh、frame.mesh、frame.load 的 max）——如果長幀是 load（解析 GLB）或 tex（上傳大貼圖）而不是編譯，這一包不夠，我照數字再改。

## 第二包 `shop_compile_slice_v2.patch`（2026-11-12 19:1x，基準 ef21dcb1d0）
CC FIRST_gg_desk_r4／FIRST_xs_desk_r4（df0db36693）：最長一幀 233→183 ms（公館）、167 ms（新生南路）；剩下那一頓≈一次 compile（G06、大步約 190～210 ms）。第一包是建好就把**整間**一次 compileAsync——那一間所有著色器還是在同一幀送出去。
- 改成**一幀只編一個材質**：建好那一間以後，每個網格的材質組合（同一組只算一次）排一個 `compile` 工作（`Rn.compile(那個網格, 鏡頭, 整個場景)`，照場景的燈），一幀做一個；全部送出以後才 `compileAsync(整間)` 等 isReady（材質都準備過了，這一步不再編），等到才開始一幀一個打開零件。順序：貼圖上傳 → 逐一編材質 → 等 isReady → 打開零件。2.5 秒保險照舊。
- prof：`step.compile`＝每一個材質在主執行緒花多久（CC 看 max 就知道最慢那一個材質）；`step.compileWait`＝送出到全部 isReady 多久（不是卡住的時間）。**注意：第一包的 `step.compile` 量的是送出到 isReady 的總時間，不是主執行緒卡住的時間**——r4 的 211 ms 可能有一部分不是那一幀卡的；這一包分開記。
- 測試：`shop_real_inside_1112_unit` ㉘、㊷～㊻ 改寫（一幀最多一個、同組只編一次、全部送出才 compileAsync、編完前不打開）；引用 zones3d／店內預載的 **378 支 Node 測試全過**。
- **沒測**：瀏覽器。請 CC 重跑 FIRST_gg_desk、FIRST_xs_desk（同一套探針），看最長一幀和 `step.compile.max`。
- 先將就：一個材質本身編很久（例如很大的 shader）還是會那一幀頓一下；要再降就要減少材質種類（合併）。
