# v9.6 候選 13（ba435d5）— LAWWW2 跑的三項

LAWWW 06:09Z、06:39Z 分派。乾淨 worktree `/home/user/rc13_wt`（`git worktree add --detach … ba435d5`，bundle 在開發分支 `wip_backup/v96-rc13.bundle`），
http server 8811（`/proc/<pid>/cwd` 確認），一次只跑一個瀏覽器。Playwright＋SwiftShader（iPhone 390×844 手機模擬、CDP 觸控），**不是 iPhone 實機**。
標題畫面版本字樣「版本 v9.6（2026-10-14）」（`flow_main_day12_01_title.webp`）。

| 測試 | 結果 | 時間（UTC） |
|---|---|---|
| flow_main_day12 | **ALL PASS**（29 PASS） | 06:20:40–06:33:25 |
| flow_teaching_buildings | **ALL PASS**（35 PASS） | 06:33:25–06:51:31 |
| flow_soclib | **ALL PASS**（21 PASS） | 06:51:36–07:04:54 |

候選 14（4ba8c8b）、15（e88bda5）只改測試（flow_classes、playlib），遊戲程式和候選 13 相同（LAWWW 說明），這三項的結果照樣算。
