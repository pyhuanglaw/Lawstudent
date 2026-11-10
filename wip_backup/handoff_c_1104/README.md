# 帳號 C 接班（2026-11-04）時清掉的兩個舊子代理 worktree 備份（D88：WIP 不無故丟掉；D126：推上 GitHub）

| 備份 | 原本在哪 | 內容 | 狀態 |
|---|---|---|---|
| worktree-agent-a744cdfb5b91b19c4.bundle | 本機 worktree `.claude/worktrees/agent-a744cdfb5b91b19c4`（分支 worktree-agent-a744cdfb5b91b19c4，head 6a14dda7d） | 2 個沒合併的 WIP（10-28）：c86067ca6「WIP HEROINE-LIFE-1028 AA_525：劇情匯入白名單登記 AA_525（6081f725f）」、6a14dda7d「WIP HEROINE-LIFE-1028 AA_525：改原句、閒聊階梯與約會台詞（_fix／產生器重產）」，17 個檔 +122／−27 | AA_524＋AA_525 後來由另外兩個子代理交件合併（TaskList #118 已完成）；這兩個是中途的 WIP，留備份不再合併 |
| aa524_lines.untracked_1028.js | 本機 worktree `.claude/worktrees/agent-acb1f7eef4f17b0d7` 沒 commit 的 src/data/aa524_lines.js（10-28 15:33，31 行） | AA_524 台詞的中途檔 | 那個 worktree 的 head c2d719fd5 已併進開發分支；這個檔沒被 commit 過，留備份 |

還原：`git fetch wip_backup/handoff_c_1104/worktree-agent-a744cdfb5b91b19c4.bundle worktree-agent-a744cdfb5b91b19c4:restore-a744`。
