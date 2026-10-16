# ART-09 予樂對話立繪＋3 表情（BB-B c383df3b，2026-10-16）｜LAWWW2-B

- 來源：企劃線 `docs/story_planning/date_system/art/yule_portrait_sheet.webp`（1024×1536，BB D59 通過）。
  - 左邊是正面全身；右邊直排三個頭，由上到下是平常（帶笑）、微笑（大笑露牙）、驚訝。
- 輸出：`assets/portraits/yule/campus/`（600×1000，透明，和其他人同構圖）。
  - `neutral.webp`：全身，去背；臉用右上那個頭替換，所以和 smile、surprised 是同一個清晰度。
  - `smile.webp`、`surprised.webp`：頭疊回全身。
  - 做法和學姊、沛珊、可昕相同：先用最像的那格對到全身，其他格用頭頂和頭帶對齊；下巴以下淡出。
- **遊戲 id 由 LAWWW-B 決定**：目前開發線沒有予樂。檔案先放在 `yule`。
- 腳本：
  - `tools/portraits/cut_reference_portraits.py --only yule`：yule 這一項改用這張立繪表；
  - `tools/portraits/overlay_expressions.py --id yule`：新增「表情是幾個框、不是九格」的設定 `boxes`。
- 對照：
  - `heads.webp`：三個表情，深色底、紅底各一張；
  - `full.webp`：全身三張並排。
- 已知缺點：
  - 亂髮外緣有少量灰白細毛；
  - 脖子右側有一小塊淡灰。
  - 原圖的髮絲很細，清得更乾淨會連頭髮一起吃掉。
