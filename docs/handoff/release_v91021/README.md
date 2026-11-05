# v9.10.21 發布交接（LAWWW-C 2026-11-05 交班時還沒發布）

- 發布樹（已推）：`aa0f3bcd3`＝候選 `098aafb74`（＝`83d09d13b`＋afar／頁間／青木 6 張窗景重拍（LAWWW2 e29912473）＋NOODLE-AP-1105 修正）＋index.html 版本字樣 v9.10.21（2026-11-05）。
  - `098aafb74` 沒有推到任何分支；它的遊戲檔案（src／tests／assets／lib）和 `aa0f3bcd3` 一模一樣，用 `aa0f3bcd3` 當候選就好。
- LAWWW-C：候選 098aafb74 全部 Node 1051 支，2 支已知（bookstore_exit_unit 誤報、ladder_headroom_unit ④ 梯子動畫預設不播）。
- BB 已過：WINVIEW r1、V21R p0／class／mini／zone、noodle_seat_ap Node、版本字樣 358 處、雲端 reach noodle（2 點是半徑 0.32 的誤報，不擋，NOODLE-AP-RADIUS-1105）。
- 還差（BB 說過了就 GO）：`aa0f3bcd3` 的 deploy_check、PC 的 p0＋燒臘店吃飯截圖（walkFallbacks 要 0）、afar 晚上／青木窗景 r2。
- 發布步驟：BB GO →（工作目錄乾淨）`bash docs/handoff/release_v91021/make_release_tree.sh aa0f3bcd3 9.10.21 <當天日期> HEAD` → 它印出 RELEASE_TREE、BACK 兩個 commit（commit-tree 做的，沒簽章；要讓 hook 不擋就照 LAWWW-C 的做法：`git restore --source=<RELEASE_TREE> --staged --worktree :/` 後一般 commit，核對 tree 相同）→ 加 RELEASES.md（草稿 `RELEASES_draft.md`，填 GO 時間、PR、Pages run、測試結果）→ push → PR（head＝這條分支 tip）→ 合併 → Pages → 換回開發檔案（BACK）→ BB 排線上檢查。
- 不准為了交班趕著發布（P0 換班口令第 7 條）。
