# 頁間書屋 CC0 化 交件（幫手 g2，SHOP-CC0-HELP-1113，2026-11-14）

- **patch**：`docs/art-rebuild/second_ai/cc0_g2/yejian_cc0.patch`（底＝`origin/claude/adoring-meitner-mqzst8` @ `2da495e69`；`git apply --check` 過；附 `place_gate --write` 重產的 SHOP_STANDARD_STATUS.md、`--coplanar --write` 只換頁間那一列〔牆的疊面 0.7 m² 不變〕；不帶 cc0_kit.py）
- **並排圖**：`docs/art-rebuild/second_ai/cc0_g2/yejian_cmp.jpg`（參考圖 `gongguan_book_int`；咖啡吧往書牆、門口、從裡面朝門口、近看咖啡吧、20:00；新版是烘焙後的遊戲內截圖）
- **版本**：v2 椅子、高腳椅、矮櫃門、咖啡吧木條改用和書牆同一個 Poly Haven `walnut_veneer`（Wood049 在細椅腳上太碎，同青木 v1 的退件理由）；v3 小盆栽改回原本的黃金葛葉片卡（Poly Haven `potted_plant_04` 減到三百面以下變一團灰）；v4 咖啡吧的義式機改雙孔（倒角機身、溫杯盤＋欄杆、兩個沖煮頭＋把手、壓力錶、接水盤格柵、蒸氣管、熱水管；同 Daybreak v2.1——原本灰方盒，BB 判 afar 同樣的機器 FAIL）；收銀機換 Poly Haven `CashRegister_01`
- **面數**：50,251；互動點、座位、導航、店員位置都沒動
- **CC0 素材**：Poly Haven `potted_plant_02`（落地植物六盆）、`CashRegister_01`（咖啡吧收銀機）；ambientCG `Fabric030`（椅墊、沙發、抱枕、圓地毯）、`Metal009`（黃銅、黑鐵、不鏽鋼）、`Plastic006`（類別牌底板、白瓷、米色陶杯）、`Marble012`（咖啡吧檯面）
- **測試**（套 patch 到 2da495e69 的乾淨副本跑）：`shop_cc0_unit` ALL PASS（純色零件 13%，48 個零件 6 個）；`place_gate` ALL PASS（沒有新的疊面）；有提到 yejian／bookstore 的 64 支測試和開發分支（沒套 patch）結果完全一樣
- **截圖附註**：20:00 那張有一個 NPC 沒被藏起來（截圖工具的問題，不影響店內）
