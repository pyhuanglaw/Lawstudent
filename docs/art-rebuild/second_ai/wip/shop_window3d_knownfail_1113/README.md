# SHOP-WINDOW-3D-1112：place_gate 的「已知未過」11 列拿掉（LAWWW2-C，2026-11-13）

`node tests/place_gate_unit.js` 還列著 11 項「已知未過」，都是 SHOP-WINDOW-3D-1112（從店外看進去是立體的）。這 11 間是：
- 新生南路：山嵐、同弦、大口、好拍、大步、新生運動廣場；
- 汀州路：越好吃、客居雲南、東南大聯、汀州聯通、泰米。

這 11 間 BB-C 都已經判過 ⑦b PASS（`docs/handoff/place_gate_bb.json` 各店的 note），是測試表沒跟著改。BB 判的是 SHOP-REAL-INSIDE：店外看得到的牆、地板、擺設和走進去的室內一樣，而且是立體的。公館九間 11-12 已經照這個做法拿掉了。

- 改了：`tests/place_gate_unit.js` 的兩行 KF(T_WIN,'street3d',…) 刪掉、留註解寫原因；`docs/handoff/SHOP_STANDARD_STATUS.md` 重產。
- 結果：place_gate ALL PASS，已知未過 11 → 0；這 11 項回到「第二層」（174 → 185）照常等 CC 拍。
- 不影響：這幾間其他還沒過的事照舊在 place_gate_bb.json 的 fail／pending 裡，由 SHOP-REALISM-1112 等任務追：
  - 質感（D159）：大口、新生運動廣場 FAIL；
  - 第一次走近店門的效能；
  - 山嵐 14:00 沒客人。
- 套法：`git apply docs/art-rebuild/second_ai/wip/shop_window3d_knownfail_1113/place_gate_knownfail.patch`（底：開發分支 19399e5d39；狀態表有衝突就重跑 `node tests/place_gate_unit.js --write`）。
