# GitHub 分支盤點（D85；LAWWW 維護，每次整理分支、換班時更新）

> **2026-10-28 起（使用者 01:4x「定期做一次唯讀稽核，再由開發 AI 整理」，D114／BRANCH-AUDIT-1028）**：
> - 稽核用 `python3 tools/handoff/branch_audit.py --write`（只讀：fetch、比對，不刪不推）。結果寫在下面「定期唯讀稽核」一節和 `docs/handoff/branch_audit.json`。
> - 時機：發布前後、換班（交班存快照前、接班第 9 步）、值班期間每天至少一次（`check_handoff.py check` 超過 24 小時會提醒）。
> - 值班 LAWWW 整理：
>   1. 保留四個崗位正在用的分支（duty.json）；
>   2. 保留還沒整合完的 WIP（wip.json）；
>   3. 已完成、內容全部在 main 的列清理候選，在「整理紀錄」寫決定和 SHA。
> - 再下面那張 10-16 的人工盤點表留作紀錄：「誰在用」已經過時，以稽核一節和 duty.json 為準。

> 使用者 2026-10-16 正式授權：LAWWW（A 帳號 LAWWW、B 帳號 LAWWW-B）負責分支管理、main 合併與正式發布（D85，CLAUDE.md「GitHub 分支管理、main 合併與發布」）。
> **刪除規則**：只刪「已完整合併、確定沒有人再用」的分支。刪之前在下表記下 SHA（還原：`git push origin <SHA>:refs/heads/<分支名>`）。
> - **禁止只因為很久沒更新就刪。**
> - **休班帳號的工作分支，沒有確認交接依賴前不刪。** 判斷靠 GitHub 的交接紀錄：值班表（AI_SESSION_HANDOFF.md 第 1 節）、各職位的進度檔，**不叫醒休班帳號問**（D75）。
> **三帳號（D92／HV-10，2026-10-16）**：帳號 A、B、C 的分支都照這張表管。**誰在用哪條分支以 `docs/handoff/duty.json` 為準**（`roles.<職位>.branch`、`history` 裡各帳號交班時的分支與 SHA；`python3 tools/handoff/check_handoff.py duty verify` 會列出各分支在記錄的 SHA 之後又多了幾個 commit、還沒整合的 WIP）。休班帳號（現在：A）的分支一律保留到它下一次接班或使用者另外指示；帳號 C 啟用後，它的分支也加進這張表。WIP 分支用 `duty register --wip <分支>` 登記，沒整合前不刪。
> **盤點時間**：2026-10-16 03:5x UTC，LAWWW-B（帳號 B 值班中）。基準：`git fetch --prune` 後的 17 條遠端分支。
> 「在開發線」＝整個分支都已經包含在 RULE_SOURCE `claude/modest-rubin-2lyp7g` 裡（`git merge-base --is-ancestor`）。

<!-- BRANCH-AUDIT:BEGIN（tools/handoff/branch_audit.py --write 產生，不要手改）-->
## 定期唯讀稽核（最新一次；BRANCH-AUDIT-1028）

**稽核時間**：2026-10-31T10:12Z（`tools/handoff/branch_audit.py`，只讀）；main＝`271cd2305`；共 26 條遠端分支：保留｜主線 1、保留｜崗位在用 4、保留｜WIP 沒整合完 4、保留｜main 沒有的內容 4、清理候選 13

| 分類 | 分支 | 最後 commit | 誰的（duty.json） | main 沒有的 commit | 判斷 |
|---|---|---|---|---|---|
| 保留｜主線 | `main` | `271cd2305`（2026-10-30） | — | 0 | GitHub Pages 正式版 |
| 保留｜崗位在用 | `claude/cool-heisenberg-o8kuqx` | `b3df9c4e9`（2026-10-31） | AA-B | 5030 | duty.json：AA-B |
| 保留｜崗位在用 | `claude/elegant-brown-fcos7n` | `468f31c92`（2026-10-31） | BB-B | 5099 | duty.json：BB-B |
| 保留｜崗位在用 | `claude/funny-albattani-iawshm` | `49809174c`（2026-10-31） | LAWWW2-B | 1378 | duty.json：LAWWW2-B |
| 保留｜崗位在用 | `claude/modest-rubin-2lyp7g` | `40539e05b`（2026-10-31） | LAWWW-B、RULE_SOURCE | 384 | duty.json：LAWWW-B、RULE_SOURCE |
| 保留｜WIP 沒整合完 | `claude/adoring-meitner-mqzst8` | `c76d0cb69`（2026-10-28） | LAWWW-C（交班過） | 0 | wip.json：WIP-DORM-ROOM4-0829、WIP-AB65-3-Y1S2-L、WIP-V0-REWRITE-L、WIP-LAWWW-RC4-1021 |
| 保留｜WIP 沒整合完 | `claude/focused-cray-c9uwvw` | `4b1fcc458`（2026-10-28） | LAWWW2-C（交班過） | 1201 | wip.json：WIP-L2-YUTING-FACE、WIP-L2-SHOP-BG、WIP-L2-DATE-CUTOUTS、WIP-L2-SOP、WIP-L2-PS-SKIRT-LEG、WIP-L2-SOC-COURT-1021 |
| 保留｜WIP 沒整合完 | `claude/magical-albattani-bk7b4n` | `ea43bd9a0`（2026-10-28） | AA-C（交班過） | 4325 | wip.json：WIP-AA-211、WIP-AA-194-L12、WIP-AA-199-VAC、WIP-AA-210-NYE、WIP-AA-212-AB655、WIP-AA-208-ROOM4、WIP-AA-103-SP、WIP-AA-213-US |
| 保留｜WIP 沒整合完 | `claude/wonderful-mayer-7fm9g6` | `3e23808e7`（2026-10-28） | BB-C（交班過） | 4381 | wip.json：WIP-BB-181、WIP-BB-LADDER-Y2Y4、WIP-BB-HOLIDAY-SYS、WIP-BB-START-WEEK、WIP-BB-SIS-BF、WIP-BB-POSTCARDS、WIP-BB-S3 |
| 保留｜main 沒有的內容 | `claude/second-ai-env-art` | `ff339df10`（2026-10-22） | LAWWW2-A（交班過） | 850 | main 沒有的 commit 844 個（內容比對）；分出去以後改的檔案有 2217 個和 main 不一樣；整條分支已經在 claude/funny-albattani-iawshm 裡（還沒發布到 main） |
| 保留｜main 沒有的內容 | `claude/second-ai-env-art-wip-trees` | `22ff594d7`（2026-10-14） | — | 7 | main 沒有的 commit 5 個（內容比對）；分出去以後改的檔案有 16 個和 main 不一樣 |
| 保留｜main 沒有的內容 | `claude/story-planning` | `4a25046b7`（2026-10-22） | AA-A（交班過）、BB-A（交班過） | 3835 | main 沒有的 commit 3389 個（內容比對）；分出去以後改的檔案有 1732 個和 main 不一樣；整條分支已經在 claude/cool-heisenberg-o8kuqx、claude/elegant-brown-fcos7n 裡（還沒發布到 main） |
| 保留｜main 沒有的內容 | `postrel-1030` | `3808792fe`（2026-10-30） | — | 73 | main 沒有的 commit 62 個（內容比對）；分出去以後改的檔案有 162 個和 main 不一樣；整條分支已經在 claude/modest-rubin-2lyp7g 裡（還沒發布到 main） |
| 清理候選 | `claude/confident-ritchie-8rwh7t` | `719cca3bc`（2026-10-22） | LAWWW-A（交班過） | 0 | 整條分支是 main 的祖先。還原：`git push origin 719cca3bc3d9:refs/heads/claude/confident-ritchie-8rwh7t` |
| 清理候選 | `claude/friendly-brahmagupta-6bbkzc` | `eb53fd75c`（2026-10-10） | — | 0 | 整條分支是 main 的祖先。還原：`git push origin eb53fd75caa4:refs/heads/claude/friendly-brahmagupta-6bbkzc` |
| 清理候選 | `claude/release-v9.8` | `e987af481`（2026-10-16） | — | 0 | 整條分支是 main 的祖先。還原：`git push origin e987af48137a:refs/heads/claude/release-v9.8` |
| 清理候選 | `claude/release-v9.8-rc2` | `1ebfefcb9`（2026-10-16） | — | 0 | 整條分支是 main 的祖先。還原：`git push origin 1ebfefcb94bd:refs/heads/claude/release-v9.8-rc2` |
| 清理候選 | `claude/release-v9.9-rc2` | `6ff9ac21f`（2026-10-16） | — | 0 | 整條分支是 main 的祖先。還原：`git push origin 6ff9ac21f470:refs/heads/claude/release-v9.9-rc2` |
| 清理候選 | `claude/release-v9.9.1` | `d65f9610d`（2026-10-16） | — | 0 | 整條分支是 main 的祖先。還原：`git push origin d65f9610d1ee:refs/heads/claude/release-v9.9.1` |
| 清理候選 | `claude/second-ai-env-art-wip-bike` | `fb23c7db4`（2026-10-13） | — | 0 | 整條分支是 main 的祖先。還原：`git push origin fb23c7db4c7e:refs/heads/claude/second-ai-env-art-wip-bike` |
| 清理候選 | `claude/second-ai-env-art-wip-lane118` | `0b1788b9e`（2026-10-13） | — | 0 | 整條分支是 main 的祖先。還原：`git push origin 0b1788b9e846:refs/heads/claude/second-ai-env-art-wip-lane118` |
| 清理候選 | `claude/second-ai-env-art-wip-lawlib` | `3ba830573`（2026-10-13） | — | 0 | 整條分支是 main 的祖先。還原：`git push origin 3ba830573dc8:refs/heads/claude/second-ai-env-art-wip-lawlib` |
| 清理候選 | `claude/second-ai-env-art-wip-pavsoc` | `8c6f1fe02`（2026-10-11） | — | 0 | 整條分支是 main 的祖先。還原：`git push origin 8c6f1fe02503:refs/heads/claude/second-ai-env-art-wip-pavsoc` |
| 清理候選 | `claude/second-ai-env-art-wip-props` | `fa626b9df`（2026-10-11） | — | 0 | 整條分支是 main 的祖先。還原：`git push origin fa626b9dfbc6:refs/heads/claude/second-ai-env-art-wip-props` |
| 清理候選 | `claude/second-ai-env-art-wip-props6` | `49d32ed85`（2026-10-13） | — | 0 | 整條分支是 main 的祖先。還原：`git push origin 49d32ed85714:refs/heads/claude/second-ai-env-art-wip-props6` |
| 清理候選 | `claude/second-ai-env-art-wip-soclib` | `af7de02eb`（2026-10-13） | — | 0 | 整條分支是 main 的祖先。還原：`git push origin af7de02ebc9f:refs/heads/claude/second-ai-env-art-wip-soclib` |

清理候選＝「已完成、內容全部在 main」；**刪不刪由開發 AI（值班 LAWWW）整理時決定**，刪之前在下面「整理紀錄」記 SHA（雲端工作階段刪不了別的分支：只標記，不反覆重試，D85 第 8 點）。「保留｜main 沒有的內容」的分支不能刪：裡面有 main 沒有的東西（企劃線的文件本來就不進 main）。
<!-- BRANCH-AUDIT:END -->

| 分支 | 最後 commit | 誰的 | 沒合併的有效工作 | 誰依賴它 | 還有人用嗎 | 處置 |
|---|---|---|---|---|---|---|
| `main` | 4e203e8b（2026-10-14） | GitHub Pages 正式版（v9.7） | — | GitHub Pages | 是 | 保留。由 LAWWW 合併（D85） |
| `claude/modest-rubin-2lyp7g` | 最新 | LAWWW-B（帳號 B，值班中）；**RULE_SOURCE** | 比 main 多 586 個 commit（v9.7 以後的開發） | 四個職位讀規則；帳號 A 接班時合併它 | 是 | 保留 |
| `claude/funny-albattani-iawshm` | 6e5a02b6 | LAWWW2-B（值班中） | 有：交付品（LAWWW-B 按 deliveries.json 挑著接）；**`wip_backup/second_ai_wip_branches_2026-10-16.bundle`（25 MB，8 條 WIP 的全部 commit）只在這條** | LAWWW-B 整合；8 條 WIP 的還原 | 是 | 保留（刪 WIP 以前不能刪這條；之後換班時把 bundle 一起記進交接） |
| `claude/cool-heisenberg-o8kuqx` | 67251112 | AA-B 企劃線（值班中；BB-B 的交付也合到這裡） | 有：企劃文件（開發線不合併企劃線，只用 git show 讀） | LAWWW-B 匯入資料 | 是 | 保留 |
| `claude/elegant-brown-fcos7n` | 93b06e1d | BB-B（值班中） | 有：BB 的交付（由 AA-B 合進企劃線） | AA-B 合併 | 是 | 保留 |
| `claude/confident-ritchie-8rwh7t` | c8b3eab8（2026-10-14 交班） | LAWWW（帳號 A，休班） | 沒有：整個在開發線、也在 funny 裡 | 帳號 A 的 LAWWW 接班時可能接著用這條（AI_SESSION_HANDOFF 第 1 節） | 休班帳號要用 | **保留**（休班帳號的交接分支） |
| `claude/second-ai-env-art` | 8e1061a9（2026-10-14 交班） | LAWWW2（帳號 A，休班） | 有：54 個 commit 不在開發線（已在 funny 裡） | 帳號 A 的 LAWWW2 接班 | 休班帳號要用 | **保留** |
| `claude/story-planning` | 0d278bb9（2026-10-14 交班） | AA／BB（帳號 A，休班）的企劃線 | 有：企劃文件（已在 cool 裡） | 帳號 A 的 AA、BB 接班 | 休班帳號要用 | **保留**（D66：帳號 A 的企劃線名字，不要再推舊名） |
| `claude/second-ai-env-art-wip-bike` | fb23c7db | LAWWW2（帳號 A）的 WIP | **沒有**：LAWWW2-B 逐檔比內容（6ac09c6e `BRANCH_CLEANUP_D88.md`），美術都在正式分支或有更新版本；LAWWW 的程式快照都被後來的版本取代（LAWWW-B 抽查通過） | 沒有（全部 commit 另有 bundle 備份，見下） | 沒有 | **已整合、可刪、權限受阻**（D88；這個工作階段刪不了遠端分支，不重試）。還原：`git push origin fb23c7db:refs/heads/claude/second-ai-env-art-wip-bike` 或從 bundle |
| `…-wip-lane118` | 0b1788b9 | LAWWW2（帳號 A）的 WIP | **沒有**：LAWWW2-B 逐檔比內容（6ac09c6e `BRANCH_CLEANUP_D88.md`），美術都在正式分支或有更新版本；LAWWW 的程式快照都被後來的版本取代（LAWWW-B 抽查通過） | 沒有（全部 commit 另有 bundle 備份，見下） | 沒有 | **已整合、可刪、權限受阻**（D88；這個工作階段刪不了遠端分支，不重試）。還原：`git push origin 0b1788b9:refs/heads/claude/second-ai-env-art-wip-lane118` 或從 bundle |
| `…-wip-lawlib` | 3ba83057 | LAWWW2（帳號 A）的 WIP | **沒有**：LAWWW2-B 逐檔比內容（6ac09c6e `BRANCH_CLEANUP_D88.md`），美術都在正式分支或有更新版本；LAWWW 的程式快照都被後來的版本取代（LAWWW-B 抽查通過） | 沒有（全部 commit 另有 bundle 備份，見下） | 沒有 | **已整合、可刪、權限受阻**（D88；這個工作階段刪不了遠端分支，不重試）。還原：`git push origin 3ba83057:refs/heads/claude/second-ai-env-art-wip-lawlib` 或從 bundle |
| `…-wip-pavsoc` | 8c6f1fe0 | LAWWW2（帳號 A）的 WIP | **沒有**：LAWWW2-B 逐檔比內容（6ac09c6e `BRANCH_CLEANUP_D88.md`），美術都在正式分支或有更新版本；LAWWW 的程式快照都被後來的版本取代（LAWWW-B 抽查通過） | 沒有（全部 commit 另有 bundle 備份，見下） | 沒有 | **已整合、可刪、權限受阻**（D88；這個工作階段刪不了遠端分支，不重試）。還原：`git push origin 8c6f1fe0:refs/heads/claude/second-ai-env-art-wip-pavsoc` 或從 bundle |
| `…-wip-props` | fa626b9d | LAWWW2（帳號 A）的 WIP | **沒有**：LAWWW2-B 逐檔比內容（6ac09c6e `BRANCH_CLEANUP_D88.md`），美術都在正式分支或有更新版本；LAWWW 的程式快照都被後來的版本取代（LAWWW-B 抽查通過） | 沒有（全部 commit 另有 bundle 備份，見下） | 沒有 | **已整合、可刪、權限受阻**（D88；這個工作階段刪不了遠端分支，不重試）。還原：`git push origin fa626b9d:refs/heads/claude/second-ai-env-art-wip-props` 或從 bundle |
| `…-wip-props6` | 49d32ed8 | LAWWW2（帳號 A）的 WIP | **沒有**：LAWWW2-B 逐檔比內容（6ac09c6e `BRANCH_CLEANUP_D88.md`），美術都在正式分支或有更新版本；LAWWW 的程式快照都被後來的版本取代（LAWWW-B 抽查通過） | 沒有（全部 commit 另有 bundle 備份，見下） | 沒有 | **已整合、可刪、權限受阻**（D88；這個工作階段刪不了遠端分支，不重試）。還原：`git push origin 49d32ed8:refs/heads/claude/second-ai-env-art-wip-props6` 或從 bundle |
| `…-wip-soclib` | af7de02e | LAWWW2（帳號 A）的 WIP | **沒有**：LAWWW2-B 逐檔比內容（6ac09c6e `BRANCH_CLEANUP_D88.md`），美術都在正式分支或有更新版本；LAWWW 的程式快照都被後來的版本取代（LAWWW-B 抽查通過） | 沒有（全部 commit 另有 bundle 備份，見下） | 沒有 | **已整合、可刪、權限受阻**（D88；這個工作階段刪不了遠端分支，不重試）。還原：`git push origin af7de02e:refs/heads/claude/second-ai-env-art-wip-soclib` 或從 bundle |
| `…-wip-trees` | 22ff594d | LAWWW2（帳號 A）的 WIP | **沒有**：LAWWW2-B 逐檔比內容（6ac09c6e `BRANCH_CLEANUP_D88.md`），美術都在正式分支或有更新版本；LAWWW 的程式快照都被後來的版本取代（LAWWW-B 抽查通過） | 沒有（全部 commit 另有 bundle 備份，見下） | 沒有 | **已整合、可刪、權限受阻**（D88；這個工作階段刪不了遠端分支，不重試）。還原：`git push origin 22ff594d:refs/heads/claude/second-ai-env-art-wip-trees` 或從 bundle |
| `claude/release-v9.8` | e987af48（2026-10-16） | LAWWW-B 的 v9.8 候選 1 | 沒有：整個在開發線裡 | 沒有（候選 1 因為 BUG-15 作廢、沒有發布） | 沒有 | **可以刪**：權限受阻（GitHub 工具沒有刪分支的功能），不重試。還原：`git push origin e987af48:refs/heads/claude/release-v9.8` |
| `claude/release-v9.8-rc2` | 9508b534（2026-10-16） | LAWWW-B 的 v9.8 候選 2（固定給回歸測試和合併 main 用，開發線照常推） | 沒有：整個在開發線裡 | 發布流程（PR → main） | 是（發布前） | 保留到 v9.8 合併 main；之後可以刪（權限受阻就標記） |
| `claude/release-v9.9.1` | d65f9610（2026-10-16） | LAWWW-B 的 v9.9.1 修正版（PR [pyhuanglaw/Lawstudent#5](https://github.com/pyhuanglaw/Lawstudent/pull/5) 已合併，main 6d5c3279） | 沒有：內容＝候選 09630e60（從 v9.9 改），修正同樣在開發線（982b389e、dbf41306） | 沒有 | 沒有 | **可以刪**：權限受阻（GitHub 工具沒有刪分支） |
| `claude/friendly-brahmagupta-6bbkzc` | **eb53fd75**（2026-10-10） | 帳號 A 早期的開發線（2026-10-10 起由 confident-ritchie 快轉接續，CLAUDE.md 第 10 點） | **沒有**：整個在開發線、confident-ritchie、funny 裡 | 沒有（值班表、進度檔、任務總表都沒有用到；只在歷史說明裡提到） | 沒有 | **可以刪**：已完整合併、沒人用。還原：`git push origin eb53fd75:refs/heads/claude/friendly-brahmagupta-6bbkzc`。實際刪除結果記在下面 |

## 整理紀錄（最新的在最上面）

| 時間（UTC） | 誰 | 動作 | 分支與 SHA | 結果 |
|---|---|---|---|---|
| 2026-10-31 10:1x | LAWWW-B | 定期唯讀稽核（D114，branch_audit.py --write）：26 條＝主線 1、四個崗位在用 4、WIP 沒整合完 4、main 沒有的內容 4（企劃線、second-ai-env-art 舊線、postrel-1030 誤推的那條）、清理候選 13（全部是 main 的祖先，release-v9.8／9.9 系列、second-ai-env-art-wip-* 舊 WIP、confident-ritchie、friendly-brahmagupta） | 見上表（branch_audit.json 同一份） | 雲端工作階段刪不了別的分支：13 條只標記、不刪（D85 第 8 點）；休班帳號 C 的四條交接分支照舊保留（D88 第 5 點） |
| 2026-10-30 05:3x | LAWWW-B | **誤推**：本機整合分支 `postrel-1030` 誤推到遠端（`git push origin HEAD:postrel-1030`，應該只推指定的開發分支），遠端多出一條 `postrel-1030`；馬上試刪被權限擋下，照 D88 第 4 點不重試 | `postrel-1030` 3808792fe | 內容另有 D113 bundle 在開發分支 `wip_backup/postrel_1030.bundle`；v9.10.14 發布後整條合進開發分支，之後內容全部在開發分支＝**清理候選（權限受阻）**。之後只推 `claude/modest-rubin-2lyp7g` |
| 2026-10-30 03:2x | LAWWW-B | 定期唯讀稽核（D114；容器是淺層 clone，先 `git fetch --unshallow`；第一次和另一個 fetch 同時跑撞到 ref lock，重跑）：25 條＝主線 1、崗位在用 4（B 帳號四職位）、WIP 沒整合完 4（C 帳號四職位交班分支，wip.json 有未結項目）、main 沒有的內容 3、清理候選 13 | 清理候選和 10-28 同一批 13 條（confident-ritchie、friendly-brahmagupta、release-v9.8／rc2、v9.9-rc2、v9.9.1、second-ai-env-art-wip-bike／lane118／lawlib／pavsoc／props／props6／soclib），SHA 見上表 | 只標記不刪（雲端工作階段刪不了別的分支，D85 第 8 點）；C 帳號四條交班分支照留（休班帳號、WIP 沒結） |
| 2026-10-28 01:2x | LAWWW-C | 第一次定期唯讀稽核（`branch_audit.py`，先 `git fetch --unshallow`：雲端 clone 原本是淺層的，祖先判斷會錯，工具現在遇到淺層 clone 直接報錯）：25 條遠端分支＝主線 1、崗位在用 4（C 帳號四職位）、main 沒有的內容 6、清理候選 14。**整理**：①14 條清理候選（帳號 A 的 `confident-ritchie`、帳號 B 的 `modest-rubin`、`friendly-brahmagupta`、四條 release、七條 LAWWW2 舊 WIP）全部整條是 main 的祖先＝內容都在 main，標「可刪、權限受阻」（雲端工作階段刪不了別的分支，不重試；還原指令在稽核一節）；休班帳號 A、B 回來時系統指定同一個分支名，push 就會重建，交接狀態在 duty.json；②`second-ai-env-art-wip-trees` 有 5 個 commit 的內容不在 main（16 個檔案不同）：10-16 D88 人工判定已被新版本取代、有 bundle 備份，但不符合「完全併入 main」→ 照規則保留；③帳號 A、B 的企劃線、美術線（`story-planning`、`cool-heisenberg`、`elegant-brown`、`funny-albattani`、`second-ai-env-art`）內容都已經在 C 帳號的分支裡、還沒到 main（企劃文件本來就不進 main）→ 保留 | 25 條（HEAD 見稽核一節） | 沒有刪任何分支；清理候選 14 條 |
| 2026-10-16 19:5x | LAWWW-B | 建 v9.9.1 release 分支：GitHub 工具只能從分支名稱建分支、git 只能推開發分支，所以開發分支先推 d65f9610（內容＝候選 09630e60，父節點＝候選與開發線）、建 `claude/release-v9.9.1`、再推 68c74cc4 把開發分支的內容還原（＝60fc1207，兩個 commit 中間約一分鐘）；之後 v9.10 從開發線合併 main 時，main 這邊沒有要保留的差異 | `claude/release-v9.9.1` d65f9610；開發線 68c74cc4 | PR #5 合併，main 6d5c3279 |
| 2026-10-16 05:4x | LAWWW-B | 建 release 分支（GitHub 工具 create_branch）：v9.8 候選固定在一條分支上，回歸測試跑幾個小時期間開發線照常推 | `claude/release-v9.8`（e987af48，作廢）、`claude/release-v9.8-rc2`（9508b534） | 候選 1 作廢（BUG-15 要一起發布）；分支數 17 → 19 |
| 2026-10-16 05:0x | LAWWW-B | D88 複核 LAWWW2-B 的 8 條 WIP 清查報告（6ac09c6e）：第 2、3 節的美術判定照收；第 4 節 LAWWW 的程式快照抽查 `classes3d.js` 的坐姿替身（FIG_KEY）、`syncRooms`、`activities.js` 的系籃、`lawlib_layout.js` 草案 v1，開發線都有後來的版本 | 8 條 WIP（HEAD 見上表） | **複核通過**：8 條都標「已整合、可刪、權限受阻」。沒有刪（這個工作階段只能 push 自己的分支、GitHub 工具沒有刪分支的功能；照使用者指示不重試）。備份：funny 分支的 bundle（`git bundle verify` 通過，LAWWW2-B） |
| 2026-10-16 03:5x | LAWWW-B | 刪 friendly-brahmagupta | eb53fd75 | **沒刪成**：這個工作階段的 git 只能 push 系統指定的分支，`git push --delete` 兩次都被斷線（unexpected disconnect）。分支照留。請使用者在 GitHub 網頁刪，或之後有權限時再刪 |
| 2026-10-16 03:5x | LAWWW-B | 盤點 17 條；只有 friendly-brahmagupta 可以刪 | — | 見上表 |

## D88 生命週期與 8 條 WIP 的收斂（2026-10-16 04:1x 起）

- 生命週期：建立 → 工作 → 交付 → 整合 → 驗證 → 清理。每次換班、發布、大型任務結案時增量更新這份表。
- 8 條 `second-ai-env-art-wip-*`：LAWWW2-B 逐條確認（任務 WIP-02-BIKE～TREES），整合報告交 LAWWW-B 複核（SYS-23）。用 SHA 粗算，每條和 funny、開發線、second-ai-env-art 比，都還有 9～173 個「獨有」commit，大多應該是 cherry-pick 過的；**要用內容比對確認**。
- 刪除：複核通過才刪；權限受阻就在上表標「已整合、可刪、權限受阻」，不重試。

## D88 回報六項（2026-10-16 05:0x，LAWWW-B）

| 項目 | 結果 |
|---|---|
| 整理前、後的分支數量 | 前 17、後 17（實際刪除 0 條：權限受阻） |
| 8 條 WIP 每條的結果 | 都是「內容已保存或已由更新版本取代」→ 已整合、可刪、權限受阻（上表） |
| 實際刪除的分支與 SHA | 無 |
| 沒刪的分支與原因 | 8 條 WIP＋friendly-brahmagupta：已整合、可刪，權限受阻；帳號 A 的 3 條交接分支、值班中的 4 條（開發線、funny、cool、elegant）、main：照規則保留 |
| 只存在 WIP 的資產 | 沒有（LAWWW2-B 逐檔比內容；13 個 GLB Blender 匯入、貼圖全載入） |
| 對下一次 A／B 接班的影響 | 沒有：帳號 A 的交接分支沒動；8 條 WIP 的內容在開發線、`second-ai-env-art`、funny；舊 commit 可從 funny 的 bundle 還原 |

## 下次整理的條件

- 帳號 A 的 WIP 八條：等 LAWWW2（A 或 B）在 HANDOFF.md 說明每一條已經接進交付分支或確定放棄（使用者同意），才整理。
- 休班帳號的三條交接分支：換班時新的值班職位改用系統指定的新分支、而且舊分支的內容已經包含在新分支裡，才可以刪；刪前記 SHA。
- main 以外，沒有任何分支在發布流程裡。
