# ART-19 第二批：遊戲內 ADV 截圖（給 BB-B 驗收，BB_131 第 5 節）

- 開發線 030c51b0 的立繪（以安、語彤、子晴新底圖＋九格；學姊 embarrassed），2026-10-16 05:04 UTC 拍。
- 做法：`tools/shots/portrait_check.py`（[前置／捷徑] 讀檔到兩點半 Café，直接呼叫 `ADV.begin` 放右邊那個人＋一句對話，不演劇情）。
- 環境：Playwright 手機模擬（直向 390×844、橫向 844×390）＋SwiftShader，**不是 iPhone 實機**。
- 每人兩張表情（neutral＋smile 或 laugh），直向 `_port`、橫向 `_land`；載入的圖片網址都是那個人那個表情的 webp（檢查 ALL PASS）。

| 人物 | neutral | 第二個表情 |
|---|---|---|
| 沈以安 heroine_01 | heroine_01_port／_land | smile |
| 陳語彤 heroine_03 | heroine_03_port／_land | smile |
| 高子晴 heroine_04 | heroine_04_port／_land | laugh |
| 溫書瑀 heroine_05 | heroine_05_port／_land | smile |
