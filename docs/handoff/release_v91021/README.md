# v9.10.21 發布交接（LAWWW-C 2026-11-05 交班時還沒發布）

- 發布樹（已推）：`aa0f3bcd3`＝候選 `098aafb74`（＝`83d09d13b`＋afar／頁間／青木 6 張窗景重拍（LAWWW2 e29912473）＋NOODLE-AP-1105 修正）＋index.html 版本字樣 v9.10.21（2026-11-05）。
  - `098aafb74` 沒有推到任何分支；它的遊戲檔案（src／tests／assets／lib）和 `aa0f3bcd3` 一模一樣，用 `aa0f3bcd3` 當候選就好。
- LAWWW-C：候選 098aafb74 全部 Node 1051 支，2 支已知（bookstore_exit_unit 誤報、ladder_headroom_unit ④ 梯子動畫預設不播）。
- GitHub Actions（node-unit-auto）在開發線抓到本機 full.sh 漏掉的一支：wz_interiors_aa659_unit A6「小路窗景卡晚上調暗」在發布樹 aa0f3bcd3 也 FAIL——是測試的舊期望（小路窗景 11-05 換成街景照片、晚上改換夜版圖不調暗，wz_views_1105_unit ③ 查這件），遊戲行為正確；開發線 tests 已改期望。發布時可以不管，或把這一支測試帶進發布樹。另外 full.sh 只看最後一行，最後一行是 ALL PASS 但 exit 1 的會漏：以 GitHub Actions 的結果為準。
- BB 已過：WINVIEW r1、V21R p0／class／mini／zone、noodle_seat_ap Node、版本字樣 358 處、雲端 reach noodle（2 點是半徑 0.32 的誤報，不擋，NOODLE-AP-RADIUS-1105）。
- 還差（BB 說過了就 GO）：`aa0f3bcd3` 的 deploy_check、PC 的 p0＋燒臘店吃飯截圖（walkFallbacks 要 0）、afar 晚上／青木窗景 r2。
- 發布步驟：BB GO →（工作目錄乾淨）`bash docs/handoff/release_v91021/make_release_tree.sh aa0f3bcd3 9.10.21 <當天日期> HEAD` → 它印出 RELEASE_TREE、BACK 兩個 commit（commit-tree 做的，沒簽章；要讓 hook 不擋就照 LAWWW-C 的做法：`git restore --source=<RELEASE_TREE> --staged --worktree :/` 後一般 commit，核對 tree 相同）→ 加 RELEASES.md（草稿 `RELEASES_draft.md`，填 GO 時間、PR、Pages run、測試結果）→ push → PR（head＝這條分支 tip）→ 合併 → Pages → 換回開發檔案（BACK）→ BB 排線上檢查。
- 不准為了交班趕著發布（P0 換班口令第 7 條）。
