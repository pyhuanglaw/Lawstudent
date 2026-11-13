# 青木茶室 CC0 化 交件（幫手 g2，SHOP-CC0-HELP-1113，2026-11-13）

- **patch**：`docs/art-rebuild/second_ai/cc0_g2/aoki_cc0.patch`（底＝`origin/claude/adoring-meitner-mqzst8` @ `01a512595`；`git apply --check` 過）
  - 14 個檔：`aa_support/aoki.glb`（已烘焙）、`aoki.json`、`aoki_lm_day/night.webp`、`lightbake/aoki_lm.json`、建模腳本 `aa_support/aoki_interior.py`＋共用 `aa_kit.py`、`aa_int_tex.py`（開發分支原本沒有這三支，從企劃線取來）、`cc0_kit.py`（只加 `vc_tex`）、`README_aoki.md`、`README_cc0_g2.md`、`LICENSES.md`、`tests/shop_cc0_baseline.json`（拿掉 aoki）、`tests/place_gate_coplanar.json`（只換 aoki 那一列）。不含 `SHOP_STANDARD_STATUS.md`。
- **並排圖**：`docs/art-rebuild/second_ai/cc0_g2/aoki_cmp.jpg`（參考圖 `gongguan_tea_int`；參考鏡頭、門口、從裡面朝門口、近看吧台、20:00；新版是烘焙後的遊戲內截圖，SwiftShader）
- **測試**（套 patch 到 01a512595 的乾淨副本跑）：
  - `node tests/shop_cc0_unit.js` ALL PASS（青木三項：Poly Haven 模型、CC0 材質組、純色零件 11%〔33 個零件 4 個純色：玻璃 2、燈泡、剩下的頂點色小東西〕）
  - `node tests/place_gate_unit.js` 只剩「狀態表過期」；牆的疊面 1.01 m²（和原本一樣）
  - 有提到 aoki 的 30 支測試：和開發分支（沒套 patch）結果一樣；原本就失敗的 aa653、corner_shop、gg_shops2、gift_holiday、invites_quote、yangyang 是台詞白名單，和模型無關
- **面數**：52,488（畫出來的，含共用網格；原本 39,278）；材質 33；GLB 4.6 MB
- **互動點、座位、導航、店員位置**：都沒動（配置 `src/data/aoki_layout.js` 沒改）
- **CC0 素材**：Poly Haven `potted_plant_02`（落地植物 3）、`potted_plant_04`（小盆栽 3）、`ceramic_vase_03`（桌上小瓷瓶）、`vintage_electric_kettle`（熱水壺 2）、`tea_set_01`（吧台東端茶具組）；
  ambientCG `Wood049`（椅子、高腳椅、吧台直木條）、`Wood066`（茶盤）、`Fabric030`（椅墊、卡座、抱枕）、`Cardboard004`（牛皮紙茶包）、`Paper001`（禮盒）、`Marble012`（石材檯面）、`Plastic006`（白瓷、青瓷、綠磁磚）、`Metal009`（茶罐、煮水機、秤）
- **我自己看到還可以更好的**：吧台正面直木條的木紋在近景有一點碎（Wood049 在 4 cm 寬的木條上）；煮水機在沒有環境貼圖的遊戲裡看起來是霧面灰。要改的話跟我說，改完重烘約 25 分鐘。
