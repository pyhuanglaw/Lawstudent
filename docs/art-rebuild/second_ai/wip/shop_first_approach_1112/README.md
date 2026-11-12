# SHOP-FIRST-APPROACH-1112（BB FIRST_gg_desk_r3：公館燒臘 233 ms、新生南路 150 ms、SUNNY 333 ms——第一次走近建店內那一幀）

- **還沒有 CC 的 shopReal.prof 數字**，這一包是照最常見的原因先做的：材質第一次畫的時候 WebGL 在主執行緒同步編譯、連結著色器（一間店十幾種材質，Windows／ANGLE 一個程式幾十 ms）。
- 改法（`src/zones3d.js` shopInsideReal）：店內建好（掛上場景、還藏著）那一刻就 `renderer.compileAsync(那一間, 鏡頭, 整個場景)`——有 KHR_parallel_shader_compile 的話在背景編、不卡主執行緒；照場景的燈編，之後畫的時候直接用同一個程式。編好以前這一間的零件先不打開（warmRun 跳過、先做別間的貼圖／clone／prep）；2.5 秒保險，編不完也照舊一幀一個打開。prof 多記 `compile`（編了多久）。
- patch：`shop_compile_async_v1.patch`（對開發分支 c618a7e819 `apply --check` 過）。
- 測試（Node）：`shop_real_inside_1112` 加 ㊷～㊻（修改前 FAILED 4）；gg_real_inside、wz_real_inside、zone_prewarm、place_gate、三支招牌燈 ALL PASS。
- 沒做：瀏覽器。CC 拍 FIRST_gg_desk 時請一起讀 `GAME.E.zone.shopReal.prof`（step.compile、step.mesh、frame.mesh、frame.load 的 max）——如果長幀是 load（解析 GLB）或 tex（上傳大貼圖）而不是編譯，這一包不夠，我照數字再改。
