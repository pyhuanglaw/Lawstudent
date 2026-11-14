# Daybreak 交件 v2.1b（幫手 g2，SHOP-CC0-HELP-1113，2026-11-14；v2 已由 LAWWW2 PASS、在開發分支）

- **patch**：`docs/art-rebuild/second_ai/cc0_g2/daybreak_cc0.patch`（底＝`origin/claude/adoring-meitner-mqzst8` @ `ed792633a`；`git apply --check` 過；附 `place_gate --write` 重產的 SHOP_STANDARD_STATUS.md；疊面照新流程：先 `place_gate`（不加參數）沒有新的問題，才 `--coplanar --write`，只換 Daybreak 那一列——牆 0.36 m² 不變、全部 1.42 → 1.40 m²（變少）；沒用 --allow-grow；LICENSES 不用改：這一版沒有新的 CC0 素材）
- **並排圖**：`docs/art-rebuild/second_ai/cc0_g2/daybreak_cmp.jpg`（參考圖 daybreak_int；改之前＝開發分支現在的 v2；窗邊往吧台、近看吧台、門口、從裡面朝門口、20:00；新版是烘焙後的遊戲內截圖）
- **v2.1（LAWWW2 P1）**：吧台的義式咖啡機原本是灰方盒＋三個黑點（BB 判 afar 同樣的機器 FAIL）→ 雙孔機：四支腳、倒角機身、黑色面板、兩個壓力錶、溫杯盤＋欄杆、兩個沖煮頭＋把手＋杯子、接水盤格柵、蒸氣管、熱水管、旋鈕；磨豆機改成底座＋車床機身＋出粉口＋豆槽（裡面有豆子）
- **v2.1b**：只留一台磨豆機（第二台落在甜點玻璃櫃裡）；整台義式機抬 3 mm——v2.1 的黑腳正好貼在吧台面 y=1.0，place_gate 抓到疊面 +0.02 m²（1.42 → 1.44）；抬了以後 1.40
- **沒修的**：門框自己疊自己那一對 0.139 m²（門的底部 y=0、朝下，在地板下面看不到；開發分支的基準本來就有）要改 `aa_kit.wall_with_openings` 共用的門框（所有用到的店輸出都會變），這次不動
- **面數**：56,464；互動點、座位、導航、店員位置都沒動
- **CC0 素材**：和 v2 一樣（Poly Haven `potted_plant_02`、`potted_plant_04`、`CashRegister_01`；ambientCG `Plastic006`、`Fabric030`、`Marble012`、`Metal009`、`Plaster001`）；義式機、磨豆機是腳本建的（不鏽鋼走 Metal009 材質組）
- **測試**（套 patch 到 ed792633a 的乾淨副本跑）：`shop_cc0_unit` ALL PASS；`place_gate` ALL PASS；有提到 daybreak 的 33 支測試和開發分支（沒套 patch）逐支一樣（開發分支本來就失敗的 7 支，套了 patch 一樣，不是這次造成的）
