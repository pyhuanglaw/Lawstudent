# 轉角唱片 CC0 化 交件 v2（幫手 g2，SHOP-CC0-HELP-1113，2026-11-14）

- **patch**：`docs/art-rebuild/second_ai/cc0_g2/corner_cc0.patch`（底＝`origin/claude/adoring-meitner-mqzst8` @ `15be72634`；`git apply --check` 過；附 `place_gate --write` 重產的 SHOP_STANDARD_STATUS.md；疊面基準照新流程：先 `place_gate`（不加參數）沒有新的問題，才 `--coplanar --write`，只換唱片那一列——牆 10.81／全部 13.31 m² 和開發分支一樣，只有 sha1 變；沒用 --allow-grow）
- **並排圖**：`docs/art-rebuild/second_ai/cc0_g2/corner_cmp.jpg`（參考圖 corner_int；門口往店內、門口、從裡面朝門口、近看唱片牆、20:00；新版是烘焙後的遊戲內截圖）
- **做法**：頂點色零件（音響、唱盤、沙發、櫃子、鐵架、燈具…）改 `cc0_kit.Kit.vc_tex`：頂點色 × 校成近白色的 ambientCG 材質組（紋路＋法線）；右前大盆栽換 Poly Haven `potted_plant_02`（約 2,100 面），盆子用 `cr_vc`（材質數守住 12）
- **v2 修了什麼**：v1 的盆子多一個材質（13 > 12，`tests/corner_glb_unit.js` 第 1 項）→ 改 `cr_vc`。烘焙重新匯入又把它複製成 `cr_vc.001`（設定一樣、只差貼圖編號），所以新增 `tools/blender/env_second/bb_support/glb_merge_dup_mat.py`：烘完跑一次，把「名字.001」且設定相同的材質併回原本那一個（以後重烘唱片也要跑）
- **測試第 1 項的大小**：`tests/corner_shop_unit.js` 第 1 項寫死 GLB 大小（原本 4,238,972 B＝LAWWW2-B 11-07 那一版），換成這一版 4,875,700 B，說明文字一起改；其他檢查不變
- **面數**：57,364（含 instancing，≤60k）；互動點、座位、導航、店員位置都沒動
- **CC0 素材**：Poly Haven `potted_plant_02`；ambientCG `Plastic006`（霧面零件）、`Metal009`（金屬零件）
- **測試**（套 patch 到 15be72634 的乾淨副本跑）：`shop_cc0_unit` ALL PASS；`place_gate` ALL PASS（沒有新的問題）；`corner_glb_unit`、`corner_ceil_1107_unit`、`corner_kexin_weekend_unit` 全過；`corner_shop_unit` 只剩第 9、10 項（三位女主角答應的台詞不在 AA_725 裡）——開發分支沒套 patch 也是這兩項失敗，不是這次造成的（台詞歸 AA）
