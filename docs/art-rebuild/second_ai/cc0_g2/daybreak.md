# Daybreak CC0 化 交件（幫手 g2，SHOP-CC0-HELP-1113，2026-11-13）

- **patch**：`docs/art-rebuild/second_ai/cc0_g2/daybreak_cc0.patch`（底＝`origin/claude/adoring-meitner-mqzst8` @ `4556c4be0`；`git apply --check` 過）
  - 12 個檔：`aa_support/daybreak.glb`（已烘焙）、`daybreak.json`、`daybreak_lm_day/night.webp`、`lightbake/daybreak_lm.json`、建模腳本 `aa_support/daybreak_interior.py`、`aa_kit.py`（只加 `Shop.route`，舊呼叫輸出不變，見 README_cc0_g2.md）、`README_cc0_g2.md`、`LICENSES.md`、`tests/shop_cc0_baseline.json`（拿掉 daybreak）、`tests/place_gate_coplanar.json`（只換 daybreak）、`docs/handoff/SHOP_STANDARD_STATUS.md`（套 patch 後 `place_gate --write` 重產）。
  - **和青木 patch 重疊的檔**：`aa_kit.py`、`README_cc0_g2.md` 兩份 patch 內容一樣；先套青木再套這份時，這兩個檔會說「已經套過」，略過就好（`git apply --exclude=tools/blender/env_second/aa_support/aa_kit.py --exclude=tools/blender/env_second/aa_support/README_cc0_g2.md`）。
- **並排圖**：`docs/art-rebuild/second_ai/cc0_g2/daybreak_cmp.jpg`（參考圖 `gongguan_daybreak_int`；店門往裡、門口、從裡面朝門口、近看吧台、20:00；新版是烘焙後的遊戲內截圖）
- **測試**（套 patch 到 4556c4be0 的乾淨副本跑）：`shop_cc0_unit` ALL PASS（Daybreak 純色零件 11%，54 個零件 6 個）；`place_gate` ALL PASS（狀態表已附）；有提到 daybreak 的 27 支測試和開發分支（沒套 patch）結果完全一樣
- **面數**：55,370（原本 47,376）；GLB 4.7 MB
- **互動點、座位、導航、店員位置**：都沒動（`src/data/daybreak_layout.js` 沒改）
- **CC0 素材**：Poly Haven `potted_plant_02`（落地植物 3）、`potted_plant_04`（吧台、層板小盆栽）、`CashRegister_01`（收銀機）；ambientCG `Plastic006`（灰綠窗框烤漆、白瓷杯盤、綠方磚、黑色塑膠）、`Fabric030`（椅墊、卡座、抱枕、地墊）、`Marble012`（吧台檯面）、`Metal009`（柱腳桌灰綠烤漆、黑鐵軌道燈、不鏽鋼咖啡機／磨豆機／抽油煙機）、`Plaster001`（天花板白梁）
- **自己先改過的**（照青木 v1 的退件理由）：椅子、吧台直紋木條用和吧台本體同一個 Poly Haven `walnut_veneer`（Wood049 在細椅腳、直條椅背上太碎）
