# GitHub 分支盤點（D85；LAWWW 維護，每次整理分支、換班時更新）

> 使用者 2026-10-16 正式授權：LAWWW（A 帳號 LAWWW、B 帳號 LAWWW-B）負責分支管理、main 合併與正式發布（D85，CLAUDE.md「GitHub 分支管理、main 合併與發布」）。
> **刪除規則**：只刪「已完整合併、確定沒有人再用」的分支。刪之前在下表記下 SHA（還原：`git push origin <SHA>:refs/heads/<分支名>`）。
> - **禁止只因為很久沒更新就刪。**
> - **休班帳號的工作分支，沒有確認交接依賴前不刪。** 判斷靠 GitHub 的交接紀錄：值班表（AI_SESSION_HANDOFF.md 第 1 節）、各職位的進度檔，**不叫醒休班帳號問**（D75）。
> **盤點時間**：2026-10-16 03:5x UTC，LAWWW-B（帳號 B 值班中）。基準：`git fetch --prune` 後的 17 條遠端分支。
> 「在開發線」＝整個分支都已經包含在 RULE_SOURCE `claude/modest-rubin-2lyp7g` 裡（`git merge-base --is-ancestor`）。

| 分支 | 最後 commit | 誰的 | 沒合併的有效工作 | 誰依賴它 | 還有人用嗎 | 處置 |
|---|---|---|---|---|---|---|
| `main` | 4e203e8b（2026-10-14） | GitHub Pages 正式版（v9.7） | — | GitHub Pages | 是 | 保留。由 LAWWW 合併（D85） |
| `claude/modest-rubin-2lyp7g` | 最新 | LAWWW-B（帳號 B，值班中）；**RULE_SOURCE** | 比 main 多 586 個 commit（v9.7 以後的開發） | 四個職位讀規則；帳號 A 接班時合併它 | 是 | 保留 |
| `claude/funny-albattani-iawshm` | 20adecf4 | LAWWW2-B（值班中） | 有：比開發線多 110 個 commit（交付品，LAWWW-B 按 deliveries.json 挑著接） | LAWWW-B 整合 | 是 | 保留 |
| `claude/cool-heisenberg-o8kuqx` | 67251112 | AA-B 企劃線（值班中；BB-B 的交付也合到這裡） | 有：企劃文件（開發線不合併企劃線，只用 git show 讀） | LAWWW-B 匯入資料 | 是 | 保留 |
| `claude/elegant-brown-fcos7n` | 93b06e1d | BB-B（值班中） | 有：BB 的交付（由 AA-B 合進企劃線） | AA-B 合併 | 是 | 保留 |
| `claude/confident-ritchie-8rwh7t` | c8b3eab8（2026-10-14 交班） | LAWWW（帳號 A，休班） | 沒有：整個在開發線、也在 funny 裡 | 帳號 A 的 LAWWW 接班時可能接著用這條（AI_SESSION_HANDOFF 第 1 節） | 休班帳號要用 | **保留**（休班帳號的交接分支） |
| `claude/second-ai-env-art` | 8e1061a9（2026-10-14 交班） | LAWWW2（帳號 A，休班） | 有：54 個 commit 不在開發線（已在 funny 裡） | 帳號 A 的 LAWWW2 接班 | 休班帳號要用 | **保留** |
| `claude/story-planning` | 0d278bb9（2026-10-14 交班） | AA／BB（帳號 A，休班）的企劃線 | 有：企劃文件（已在 cool 裡） | 帳號 A 的 AA、BB 接班 | 休班帳號要用 | **保留**（D66：帳號 A 的企劃線名字，不要再推舊名） |
| `claude/second-ai-env-art-wip-bike` | fb23c7db | LAWWW2（帳號 A）的 WIP | 有：沒有被任何分支包含 | WIP-02（保留）；LAWWW2-B 清查 e3d6779 | 可能（美術 WIP 接續） | **保留** |
| `…-wip-lane118` | 0b1788b9 | 同上 | 有（ART-03 118 巷，暫停中） | ART-03、WIP-02 | 可能 | **保留** |
| `…-wip-lawlib` | 3ba83057 | 同上 | 有 | WIP-02 | 可能 | **保留** |
| `…-wip-pavsoc` | 8c6f1fe0 | 同上 | 有（11 個 commit） | WIP-02 | 可能 | **保留** |
| `…-wip-props` | fa626b9d | 同上 | 有 | WIP-02 | 可能 | **保留** |
| `…-wip-props6` | 49d32ed8 | 同上 | 有 | WIP-02 | 可能 | **保留** |
| `…-wip-soclib` | af7de02e | 同上 | 有（社科院圖書館 GLB） | WIP-02 | 可能 | **保留** |
| `…-wip-trees` | 22ff594d | 同上 | 有 | WIP-02 | 可能 | **保留** |
| `claude/friendly-brahmagupta-6bbkzc` | **eb53fd75**（2026-10-10） | 帳號 A 早期的開發線（2026-10-10 起由 confident-ritchie 快轉接續，CLAUDE.md 第 10 點） | **沒有**：整個在開發線、confident-ritchie、funny 裡 | 沒有（值班表、進度檔、任務總表都沒有用到；只在歷史說明裡提到） | 沒有 | **可以刪**：已完整合併、沒人用。還原：`git push origin eb53fd75:refs/heads/claude/friendly-brahmagupta-6bbkzc`。實際刪除結果記在下面 |

## 整理紀錄（最新的在最上面）

| 時間（UTC） | 誰 | 動作 | 分支與 SHA | 結果 |
|---|---|---|---|---|
| 2026-10-16 03:5x | LAWWW-B | 刪 friendly-brahmagupta | eb53fd75 | **沒刪成**：這個工作階段的 git 只能 push 系統指定的分支，`git push --delete` 兩次都被斷線（unexpected disconnect）。分支照留。請使用者在 GitHub 網頁刪，或之後有權限時再刪 |
| 2026-10-16 03:5x | LAWWW-B | 盤點 17 條；只有 friendly-brahmagupta 可以刪 | — | 見上表 |

## D88 生命週期與 8 條 WIP 的收斂（2026-10-16 04:1x 起）

- 生命週期：建立 → 工作 → 交付 → 整合 → 驗證 → 清理。每次換班、發布、大型任務結案時增量更新這份表。
- 8 條 `second-ai-env-art-wip-*`：LAWWW2-B 逐條確認（任務 WIP-02-BIKE～TREES），整合報告交 LAWWW-B 複核（SYS-23）。用 SHA 粗算，每條和 funny、開發線、second-ai-env-art 比，都還有 9～173 個「獨有」commit，大多應該是 cherry-pick 過的；**要用內容比對確認**。
- 刪除：複核通過才刪；權限受阻就在上表標「已整合、可刪、權限受阻」，不重試。

## 下次整理的條件

- 帳號 A 的 WIP 八條：等 LAWWW2（A 或 B）在 HANDOFF.md 說明每一條已經接進交付分支或確定放棄（使用者同意），才整理。
- 休班帳號的三條交接分支：換班時新的值班職位改用系統指定的新分支、而且舊分支的內容已經包含在新分支裡，才可以刪；刪前記 SHA。
- main 以外，沒有任何分支在發布流程裡。
