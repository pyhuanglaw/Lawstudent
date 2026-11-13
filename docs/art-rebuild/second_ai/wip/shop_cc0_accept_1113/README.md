# SHOP-CC0 幫手交件驗收（LAWWW2-C，2026-11-13）

## 公館燒臘 v8（幫手 g4，claude/shop-cc0-g4 37a58d3de）— PASS

- 驗收底：開發分支 5057ca2f14，套 g4 的 `shaola_v8.patch`（3way 乾淨）。
- `shop_cc0_unit`：燒臘三項同時成立（Poly Haven：CashRegister_01、plastic_crate_02、cardboard_box_01；ambientCG 材質組；純色零件 18%）。ALL PASS。
- `place_gate_unit`：ALL PASS（新的問題 0）；`--coplanar` 燒臘牆疊面 3.50→3.49 m²（沒變多）。
- 回歸：shaola_wire、gg_new_lm、shaola_order_1112、noodle_seat_ap、yejian_buy_1112、shop_viewpanes_1105 ALL PASS。
- 看圖（並排圖 g4 分支 `docs/art-rebuild/second_ai/shop_cc0_g4/shaola_cmp.jpg`）：切肉盤從等大方塊格子改成一片一片角度不同的肉片（D159 那一點修掉）；不鏽鋼、紅凳、木、紙箱有紋路；座位、導航、菜單沒動。
- 補上的：g4 的 patch 沒有 `tests/place_gate_coplanar.json`、`docs/handoff/SHOP_STANDARD_STATUS.md`（跑 `--write` 重產），`shaola_v8_full.patch`＝g4 的 patch＋這兩個檔，**LAWWW 直接套這一份**（底 5057ca2f14）。
- 還沒做：CC 地點關卡第二層四個鏡頭、BB 判美術。
