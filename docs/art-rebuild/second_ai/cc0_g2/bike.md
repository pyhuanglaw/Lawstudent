# 慢輪單車 CC0 化 交件（幫手 g2，SHOP-CC0-HELP-1113，2026-11-14）

- **patch**：`docs/art-rebuild/second_ai/cc0_g2/bike_cc0.patch`（底＝`origin/claude/adoring-meitner-mqzst8` @ `04ac5af9e`；`git apply --check` 過）
  - 11 個檔：`bb_support/bike.glb`（已烘焙）、`bike.json`、`bike_lm_day/night.webp`、`lightbake/bike_lm.json`、建模腳本 `bb_support/bike_interior.py`、`bike_tex.py`（開發分支原本沒有，從 cc-testing 取來）、`LICENSES.md`、`tests/shop_cc0_baseline.json`（拿掉 bike）、`tests/place_gate_coplanar.json`（只換 bike）、`docs/handoff/SHOP_STANDARD_STATUS.md`（套 patch 後 `place_gate --write` 重產）。不帶 `cc0_kit.py`（開發分支已有 `vc_tex`）。
- **並排圖**：`docs/art-rebuild/second_ai/cc0_g2/bike_cmp.jpg`（參考圖 `gongguan_bike_int`；參考鏡頭、門口、從裡面朝門口、近看右牆層架、20:00；新版是烘焙後的遊戲內截圖）
- **測試**（套 patch 到 04ac5af9e 的乾淨副本跑）：`shop_cc0_unit` ALL PASS（純色零件 3%：77 個零件只剩玻璃 2 個）；`place_gate` ALL PASS；有提到單車的 27 支測試和開發分支（沒套 patch）結果完全一樣
- **面數**：畫出來的 59,842（原本 59,874；收銀機減面讓出來的）；GLB 3.9 MB
- **互動點、座位、導航、店員位置**：都沒動
- **做法**：所有頂點色零件（車架烤漆、坐墊、車籃、櫃子、零件；金屬的輪框、把手、鏈條、鐵架）改成「頂點色 × ambientCG 材質組」（`cc0_kit.Kit.vc_tex`：每個零件原本的顏色照舊，加上 Plastic006／Metal009 的紋路和法線；Plastic006 vary 0.015、法線 0.25，淺色零件不會有灰黑刮痕）；櫃台收銀機換 Poly Haven `CashRegister_01`（取代原本 18 個方塊拼的）
- **老實說**：和原本比，畫面差異很小（材質細紋＋收銀機）。原本畫出來的三角形已經 5.99 萬、碰到 6 萬上限，沒有空間再加 Poly Haven 模型（工具車、打氣筒、紙箱）；要加的話得先減別的（例如層架上的商品方塊），請你判要不要我再做一版。
- **CC0 素材**：Poly Haven `CashRegister_01`；ambientCG `Plastic006`、`Metal009`
