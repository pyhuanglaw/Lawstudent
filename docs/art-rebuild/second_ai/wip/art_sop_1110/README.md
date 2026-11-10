# ART-SOP：美術製作 SOP 合進開發分支 — LAWWW2 帳號 A，2026-11-10

- 狀態：文件，可直接整合。
- 原因：這三份只在 LAWWW2 的分支上（focused-cray、funny-albattani、second-ai-env-art，內容一樣），開發分支沒有。佇列盤點 queue_audit_1110 寫「留：LAWWW 把文件合進開發分支（或 LAWWW2 出 patch），然後結案」。
- 內容（只新增檔案，不改其他檔）：
  - `docs/art-rebuild/second_ai/ART_SOP.md`：美術製作 SOP v1，最後修改 edfe5a2c1，10-21。
  - `docs/art-rebuild/second_ai/SCENE_RULES.md`：場景規則，最後修改 cee7c6973，11-05。
  - `docs/art-rebuild/second_ai/sop_demo/README.md`：SOP 範例。它引用的 test_shots 圖片開發分支上都有。
- 整合：`git apply art_sop_1110.patch`。整合後 ART-SOP 可以結案。
