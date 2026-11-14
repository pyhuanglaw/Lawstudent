# SHOP-FIRST-APPROACH-1112 r7：店內在畫面外先畫一次（LAWWW2-C 2026-11-12）

BB_379 r6 仍 FAIL：公館最長一幀 183 ms、新生南路 150 ms。最長那一幀前 30 ms 沒有任何記錄到的事件，所以推測卡在 GPU 端第一次畫這一間的時候：貼圖上傳、program link、頂點上傳。

## 改了什麼（`shop_first_r7.patch`，底：開發分支 6740b3d860，`git apply --check` OK）
- `src/zones3d.js` `shopInsideReal`：零件一幀一個打開以後、標記「可以顯示」以前，多一步 `pre`。這一步在畫面外先真的畫一次整間：
  - 同一個鏡頭，viewport 和 scissor 都設成 1×1，畫在畫布左下角那一點。這一幀接著正式整張重畫，玩家看不到那一點。
  - 用一個暫時的場景，霧和正式場景同一個；霧不同的話，正式畫的時候又要再編一次著色器。
  - 不用 1×1 的 render target：畫到 render target 時，three.js 用的輸出色彩空間和色調映射不一樣，編出來是另一個著色器，等於白做。
  - 畫完以後，viewport、scissor、店內掛的位置、顯示狀態全部還原。
- 開關：網址加 `?noshoppre` 就關掉，給 CC 做前後對照。
- 量測：`GAME.E.zone.shopReal.prof.step.pre`（這一步主執行緒花多久）、`prof.frame.pre`（那一幀整幀多長）。
- 同一個 patch 也帶了 `s.sb`（鐵捲門拉一半，給溫特寶邸打烊用；沒給＝拉到地，和原本一樣）。

## 測試
- `tests/shop_real_inside_1112_unit.js` 新增兩項：
  - ㊼：pre 只畫一次；用同一個鏡頭、1×1、開 scissor、同一個霧。
  - ㊼b：畫完 viewport、scissor 還原，店內掛回原處、照常顯示，prof 有記到 pre。
  
  兩項都通過，整支 ALL PASS。另外 9 支相關測試也都 ALL PASS：gg_lit12、gg_real_inside、offbeat_storefront、shop_flicker、shop_window_rects、tongxian_closed、tz_shops、wz_real_inside、shop_real_inside。

## 請 CC 在電腦上量
FIRST_gg_desk、FIRST_xs_desk 各跑兩次，一次一般、一次加 `?noshoppre`。要看三個數字：
- 最長一幀
- 超過 50 ms 的次數
- `prof.frame.pre`

## 先將就的、沒把握的
- 長幀如果其實是 GC（GLB 解析完留下的大塊記憶體被回收），這一步沒有用；那時要改成 GLB 在閒置時解析，或共用解析結果。
- 這一步要多畫一次整間店內，所以會多一次 draw call 的成本，不過放在沒事做的那幾幀。
