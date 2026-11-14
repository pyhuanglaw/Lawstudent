# 山嵐書店 CC0 化 交件 v3（幫手 g2，SHOP-CC0-HELP-1113，2026-11-14）

- **patch**：`docs/art-rebuild/second_ai/cc0_g2/shanlan_cc0.patch`（底＝`origin/claude/adoring-meitner-mqzst8` @ `07bf3613b`；`git apply --check` 過；附 `place_gate --write` 重產的 SHOP_STANDARD_STATUS.md；疊面照新流程：先 `place_gate`（不加參數）沒有新的問題，才 `--coplanar --write`，只換山嵐那一列——牆 11.76 m² 不變、全部 53.81 → 53.75 m²（變少）；沒用 --allow-grow）
- **並排圖**：`docs/art-rebuild/second_ai/cc0_g2/shanlan_cmp.jpg`（參考圖 shanlan_int；店內往書牆、門口、從裡面朝門口、近看櫃台、20:00；新版是烘焙後的遊戲內截圖）
- **做法**：`aa_kit` 的 `Shop.route`（照顏色把零件轉進 CC0 材質組，牆的分組、樓層照舊）；天花板 L.flat → Plaster001；雜誌牆紙堆不倒角（少 7 千面）；高 ≥0.7 m 的盆栽換 Poly Haven `potted_plant_02`（減面 0.009），小盆栽留原本的葉片卡（`potted_plant_04` 減到幾百面會變一團灰）
- **v2、v3 修了什麼**：v2 小盆栽回葉片卡、截圖鏡頭換位置（v1 的「從裡面」鏡頭在書架裡）；v3 門把 `#b8b0a0` 改黑鐵 `blackmetal`——v2 多出一組店面牆，牆分組 11 ≠ 10（`tests/xs_lm_unit.js` 第 4 項），v3 回到 10
- **面數**：79,600（大店 ≤80k）；互動點、座位、導航、店員位置都沒動
- **CC0 素材**：Poly Haven `potted_plant_02`；ambientCG `Plaster001`（天花板）、`Paper001`（紙、雜誌）、`Metal009`（金屬）、`Plastic006`（霧面零件）、`Marble012`（櫃台檯面）、`Wood066`（木件）、`Fabric030`（布）、`Cardboard004`（紙箱）
- **測試**（套 patch 到 07bf3613b 的乾淨副本跑）：`shop_cc0_unit` ALL PASS（山嵐從待做名單拿掉——LAWWW2 說這是最後一間沒過的）；`place_gate` ALL PASS（沒有新的問題）；有提到 shanlan／xs_lm 的 34 支測試和開發分支（沒套 patch）逐支一樣（開發分支本來就失敗的 3 支：corner_shop 台詞、gift_holiday、invite_places_1107，套了 patch 一樣，不是這次造成的）
