# AA 讀稿工具（AA-B 2026-10-25）

劇情導演「像讀者一樣讀」用的四支小工具。只讀開發分支、不改任何檔案、不需要瀏覽器。遊戲不讀這個資料夾。

| 檔案 | 做什麼 | 用法 |
|---|---|---|
| `term_sweep.js` | 一個學期（或假期）一天一天快轉：停點、一定要演的事件、手機訊息、出遊、誰不在。存檔種類見檔內 `PROFILES`（單身、可昕、七位交往中、學姊朋友版 `sisf`、沒認識學姊 `sisn`） | `LW=<開發分支工作樹> MODE=accept ONLY=sisf_dorm TERM=Y2S1 FROM=2026-09-07 TO=2027-02-21 ROUTE=TW node term_sweep.js out.json` |
| `term_sweep_ana.py` | 讀上面的 json：學姊相關的每一天、各人訊息則數、最長空白 | `python3 term_sweep_ana.py out.json` |
| `pg_read.js` | 畢業以後篇（含大五上）照玩家的順序「跳到下一件事」，場景真的播，記下台詞、字卡、手機（要回的選第一個）。存檔種類見檔內 `P` | `LW=<工作樹> P=tw_sis node pg_read.js out.txt` |
| `pg_read_diff.py` | 把某一種存檔和 `tw_single` 比，只印不一樣的行 | `python3 pg_read_diff.py tw_kexin`（在放 txt 的那一層跑；路徑照檔內） |

- 限制（寫報告時照實寫）：
  - 每次都從新存檔開始，以前演過的一次性訊息會再出現；
  - 學校裡記的旗標沒有（例：可昕的 `KX_OUR_DAY`）；
  - 3D 裡的偶遇、地點觸發的事件 `term_sweep` 看不到；
  - `pg_read` 先把大四下記成全部通過（`FAIL_DELAY_COURSES=[]`），被當延畢那一種（`P=fd`）除外。
- 用過的報告：`AA_458`～`AA_466`（學期）、`AA_470`（學姊三種玩家）、`AA_471`～`AA_473`（大五、畢業以後、前任）。
