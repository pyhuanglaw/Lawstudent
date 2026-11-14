# 慢輪單車 交件 v2.1（幫手 g2，SHOP-CC0-HELP-1113，2026-11-14；v1 已由 LAWWW2 PASS、在開發分支）

- **patch**：`docs/art-rebuild/second_ai/cc0_g2/bike_cc0.patch`（底＝`origin/claude/adoring-meitner-mqzst8` @ `4cc26d4b8`；`git apply --check` 過；附 `place_gate --write` 重產的 SHOP_STANDARD_STATUS.md；疊面照新流程：先 `place_gate`（不加參數）沒有新的問題，才 `--coplanar --write`，只換單車那一列——牆 2.91／全部 5.35 m² 和開發分支一樣，只換 sha1；沒用 --allow-grow；LICENSES 只加三列：Poly Haven `tire_pump`、`old_tyre`，ambientCG `Cardboard001`）
- **並排圖**：`docs/art-rebuild/second_ai/cc0_g2/bike_cmp.jpg`（參考圖 bike_int；改之前＝開發分支現在的 v1；門口往店內、**近看右牆層架**、門口、從裡面朝門口、近看櫃台、20:00；新版是烘焙後的遊戲內截圖）
- **v2（LAWWW2 意見）**：右牆層架的方盒減半，換成印刷包裝盒（自製盒面圖集 × Cardboard001 紋路，有的斜放、有的開蓋）；車燈 4 → 2；水壺加瓶蓋；鎖每格最多 3 組；最下層紙箱間距拉開；中間那支打氣筒換 Poly Haven `tire_pump`；工作台東邊靠牆加 Poly Haven `old_tyre`
- **v2.1**：v2 烘完 place_gate 抓到疊面 +0.02 m²——右牆最下層，第一排最後一個盒子伸到 z=0.2 以下、第二排又從 0.2 開始，兩個盒子互相插進去；改成第二排從那個盒子後面接著排（`bike_interior.py`），重烘後和開發分支一樣
- **面數**：59,746（含 instancing，≤60k）；互動點、座位、導航、店員位置都沒動
- **CC0 素材**：Poly Haven `CashRegister_01`（v1）、`tire_pump`、`old_tyre`；ambientCG `Plastic006`、`Metal009`（v1，vc_tex）、`Cardboard001`（包裝盒）
- **測試**（套 patch 到 4cc26d4b8 的乾淨副本跑）：`shop_cc0_unit` ALL PASS；`place_gate` ALL PASS；有提到 bike 的 116 支測試和開發分支（沒套 patch）逐支一樣（開發分支本來就失敗的 16 支，多半是台詞、劇情檢查，套了 patch 一樣，不是這次造成的）
