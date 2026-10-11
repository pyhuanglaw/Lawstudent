# 四個職位的跨帳號接班（帳號 A ⇄ 帳號 B）——總入口

> 使用者 2026-10-11 訂定（`docs/PROJECT_DECISIONS.md` D49）。**現在只是預先準備：帳號 A 的四個工作階段照常工作，沒有換班，也還沒有帳號 B。**
> 這份是總入口：值班表、接班與交班程序、四份帳號 B 啟動提示詞。各職位的進度不在這裡重抄，放在各自的進度檔（第 1、2 節），這裡只寫在哪裡、怎麼查證。
> 維護：當前值班的 LAWWW 或 LAWWW-B（這份檔案在 LAWWW 那條分支上；別的職位不改這份，改自己的進度檔）。

## 0. 重點

- **永遠只有四個職位**：LAWWW、LAWWW2、AA、BB。A、B 只是帳號識別，帳號 B 的工作階段叫 **LAWWW-B、LAWWW2-B、AA-B、BB-B**。不會有八個 AI 同時工作：**同一個職位同一時間只有一個工作階段寫入**（值班中的那個）。
- **GitHub 是共同的進度來源**：每次接班都先讀 GitHub 最新遠端，**不能靠自己對話裡記得的進度**。沒 push 的東西當作不存在。
- **換班的信號是使用者**：使用者對哪一邊說話，哪一邊就值班。
  - 換到帳號 B：在帳號 B 開新工作階段、貼第 7 節的啟動提示詞（之後再回到 B，對既有的 B 工作階段說第 8 節那一句）。
  - 回到帳號 A：對 A 的四個工作階段各說一次「我回來了，請同步 GitHub 最新進度，接續工作。」
  - 不在值班的那一邊**不寫入**同一個工作範圍。
- **只有值班中的 LAWWW 或 LAWWW-B 可以正式發布**（main／GitHub Pages）。兩次發布至少相隔三小時，跨帳號照算，以 `docs/RELEASES.md` 最後一次發布時間為準。
- 已批准和未批准要分開：使用者批准的決策在 `docs/PROJECT_DECISIONS.md`；草案在 `docs/proposals/`，劇情企劃在 `docs/story_planning/`，兩者都是 PROPOSAL。

## 1. 值班表（換班時由值班的 LAWWW／LAWWW-B 更新；各職位的登記以自己進度檔裡的「值班登記」為準）

| 職位 | 職責 | 帳號 A | 帳號 B | 現在值班 | 分支（2026-10-11 10:06 UTC 的最新 commit） | 進度檔（在各自的分支上） |
|---|---|---|---|---|---|---|
| **LAWWW** | 開發負責人：核心系統、人物、建築室內、整合、測試、**正式發布**、分派 LAWWW2 | LAWWW `session_01Eds6msqpsuzNEw98sdw8JX` | LAWWW-B：未建立 | **A** | `claude/confident-ritchie-8rwh7t`（`e747724`）；本機半成品備份在 `wip_backup/`（git bundle：dorm-hall、wancai-stairs） | `docs/ART_REBUILD_PROGRESS.md` 最上面「交接（最新）」 |
| **LAWWW2** | 環境美術：Blender、3D 場景（Café、溫州街、公館、街道道具、校園地標、行道樹、獨立室內） | LAWWW2 `session_01AC1WVgJSmoJK1uRsPK2Zn1` | LAWWW2-B：未建立 | **A** | `claude/second-ai-env-art`（`afbf7ec`，含店家窗景）＋半成品分支 `-wip-pavsoc`（`8c6f1fe`，⑤）、`-wip-props6`（`8fe7a21`，⑤⑥）、`-wip-trees`（`d7916da`，⑦）、`-wip-soclib`（`030ce51`，⑬ 草稿）；`-wip-props` 是重複分支，忽略（LAWWW2 10:07Z 緊急保存回報） | `docs/art-rebuild/second_ai/HANDOFF.md` |
| **AA** | 劇情企劃：四年故事架構、主線、系統與劇情規劃 | AA `session_019Y3emYqxxC4Ch1GGf4fMzw` | AA-B：未建立 | **A** | `claude/bb-story-planning`（`1892599`，和 BB 共用） | `docs/story_planning/AA_交接紀錄.md` |
| **BB** | 劇情企劃：角色、人物關係、事件、對話與支線 | BB `session_01XVHYLaK9Vcnae3U1aAJoZv` | BB-B：未建立 | **A** | `claude/bb-story-planning`（同上） | `docs/story_planning/BB_00_協作規範與交接紀錄.md` |

- 表上的 SHA 只是更新當時的值，**真正的最新以遠端為準**：`git fetch origin --prune` 後跑 `git log -1 --format='%h %ci %s' origin/<分支>`。
- 帳號 B 的工作階段由系統指定分支名稱，那也沒關係：接班時把最新的進度合併進去，再登記在這張表。
- 劇情組和開發組之間的交接板：`docs/story_planning/給開發組_交接板.md`（企劃分支）。兩個開發 AI 之間的看板：`docs/DUAL_AI_BOARD.md`；分工與檔案所有權：`docs/SECOND_AI_HANDOFF.md`。

## 2. 每個職位的狀態放在哪（都要能在 GitHub 查證）

| 要知道的事 | 在哪裡 |
|---|---|
| 正在做什麼、做到哪裡、下一步、需要誰幫忙 | 各職位的進度檔（第 1 節最後一欄） |
| 還沒完成的修改、還沒跑的測試、還沒整合、還沒部署的東西 | 同上；開發另外看 `docs/RELEASES.md`（候選版本與發布前測試）、`docs/DUAL_AI_BOARD.md`（等整合的交付） |
| 已批准的決策 | `docs/PROJECT_DECISIONS.md`（D 編號，只有使用者明確說過的才算） |
| 還沒批准的提案 | `docs/proposals/*.md`（PROPOSAL）；`docs/story_planning/`（劇情，全部是 PROPOSAL，使用者批准前不寫進遊戲） |
| 上次交班之後的重要變更 | 第 12 節「交班紀錄」＋ `git log <上一班的最後 commit>..<分支>`＋各進度檔的最新一節 |
| 美術驗收狀態 | `docs/art-rebuild/VISUAL_REVIEW.md`、`docs/art-rebuild/ASSET_INVENTORY.md`（只有使用者能標 ART_APPROVED） |

**值班登記**：每個職位的進度檔最上面放這兩行，換班時更新：
```
值班登記：帳號 B｜LAWWW2-B｜session_xxxxxxxx｜分支 claude/…｜接班基準 <commit>｜2026-mm-dd hh:mm UTC
上一班：帳號 A｜LAWWW2｜session_01AC1WVgJSmoJK1uRsPK2Zn1｜最後 commit <sha>｜正常交班（或：未交班，以遠端 <sha> 為準）
```

## 3. 怎麼找到最新的檔案（可能在別的帳號的分支上）

```bash
# 0. 抓所有分支：新的工作階段可能只抓了 main，而且常常是淺層複本
git fetch origin '+refs/heads/*:refs/remotes/origin/*' --prune
# 1. 總入口在 LAWWW 那條開發分支。main 要等下一次正式發布才有這份檔案，不要只在 main 上找
git show origin/claude/confident-ritchie-8rwh7t:docs/AI_SESSION_HANDOFF.md
# 2. 有沒有更新的版本（例如之後 LAWWW-B 的分支），有就讀那一份
git log --all -1 --format='%H %ci %D' -- docs/AI_SESSION_HANDOFF.md
git branch -r --contains <上一行的 commit>
git show <上一行的 commit>:docs/AI_SESSION_HANDOFF.md
# 自己職位的進度檔：同樣的方法（例：LAWWW2）
git log --all -1 --format='%H %ci %D' -- docs/art-rebuild/second_ai/HANDOFF.md
# 某條分支上，自己上次的 commit 之後多了什麼
git log --oneline <自己上次的 commit>..origin/<那條分支>
```
- 中文檔名照樣可以當路徑用（`git log --all -1 -- 'docs/story_planning/AA_交接紀錄.md'`）；要看中文的檔案列表就加 `git -c core.quotepath=off`。
- git 讀不到時，用 GitHub 工具讀 `pyhuanglaw/Lawstudent` 分支 `claude/confident-ritchie-8rwh7t` 的 `docs/AI_SESSION_HANDOFF.md`，或打開 https://github.com/pyhuanglaw/Lawstudent/blob/claude/confident-ritchie-8rwh7t/docs/AI_SESSION_HANDOFF.md 。
- 淺層複本：`git log A..B` 出錯、或找不到上一班的 commit 時，先 `git fetch --deepen=300 origin <分支>`。
- 新的工作階段一開始讀到的 `CLAUDE.md` 可能是 main 上比較舊的版本，裡面還沒有接班規則。合併最新進度之後，要再讀一次。

## 4. 接班程序（A→B、B→A 都一樣，不限次數）

1. **同步**：`git fetch origin --prune`。
2. **找最新的總入口和自己的進度檔**（第 3 節的指令）：最新版可能在另一個帳號的分支上。
3. **檢查有沒有被接手過**：看進度檔的「值班登記」。如果最新的登記不是你，例如你是 LAWWW、上面寫 LAWWW-B，就表示你離開期間有人接手。
4. **讀離開期間的變更**：
   - `git log --oneline <你上次的 commit>..<接手者的分支>`。
   - 接手者的進度檔。
   - 新的 D 決策（`PROJECT_DECISIONS.md`）。
   - `RELEASES.md`（有沒有發布過、下一次最早什麼時候能發布）。
   - 對話裡記得的進度如果和 GitHub 不一樣，以 GitHub 為準。
5. **確認目前正在進行的任務**：進度檔裡「進行中」的那一項，接手者做到哪裡、哪些沒測、哪些沒推送。
6. **合併，不要覆蓋**：
   - 把接手者的分支合併進你現在的分支：能快轉就快轉，不能就 `git merge`。
   - **不 rebase、不 force push、不 reset 別人的分支。**
   - 有衝突時兩邊都保留；看不懂要怎麼合的，先問使用者。
   - 系統指定給你的新分支通常是從 main 開的。能快轉就快轉；不能快轉的（例如企劃分支不是 main 的後代），就 `git merge --no-edit origin/<那條分支>`，多一個合併 commit 沒關係。
   - 企劃線（AA、BB 共用一條）：AA（或 AA-B）負責把兩個人的分支合併、push，BB（或 BB-B）再拉最新的。
     - BB 那邊比 AA 先上線時，不用等：自己把最新的企劃分支合併進自己的分支，只寫 `BB_` 開頭的檔案和交接板 BB 的段落。
     - AA 那邊上線後，再把 BB 那邊的分支合併進來。
7. **確認輪到你寫入**：
   - 使用者對你說了接班的話（啟動提示詞，或「我回來了…」那一句），就是現在輪到你。
   - 從這時起，同一職位的另一個工作階段不寫入。
   - 如果發現它在你接班之後還有新 commit，先停下來告訴使用者，不要互相覆蓋。
   - 之後每次 push 前也看一下自己的值班登記：最新的登記不是你、而且時間比你晚，就表示使用者已經換班，停止寫入。
8. **登記**：
   - 在自己的進度檔最上面寫「值班登記」，commit＋push。
   - LAWWW／LAWWW-B 另外更新這份檔案的值班表和第 12 節交班紀錄。
   - 其他職位登記完通知值班的 LAWWW：同一個帳號用 `send_message`，不通就靠 GitHub，LAWWW 下次同步時抄進值班表。
9. **回報使用者「接班確認」**（第 6 節的格式），然後接著做進度檔寫的下一步，不用使用者再說「繼續」。

## 5. 交班程序（原工作階段還能操作的時候）

1. 不能安全中斷的操作（模型匯出、Git 操作、跑到一半的完整回歸）先做完，或記下停在哪裡。
2. 只 commit 自己負責、這次要保存的檔案（不要無條件 `git add .`），push 到自己的分支，確認遠端的 SHA。
3. 更新進度檔：
   - 正在做、做完的。
   - 沒做完、沒測、沒整合、沒部署的。
   - 下一步、需要誰幫忙、哪些不能合併或發布。
4. 在進度檔寫「交班」（時間、最後 commit），之後不再寫入這個職位的範圍，直到使用者叫你回來。

**來不及交班**（額度突然用完）時，接班的人以遠端最後 push 的狀態為準。沒 push 的成果當作沒有，不推測、也不假裝已經保存。所以平時每完成一個重要階段就 commit＋push（D45 緊急保存規則）。

## 6. 接班確認（回給使用者的格式）＋使用者怎麼確認交接成功

```
【接班確認｜LAWWW-B（帳號 B）】
工作階段：session_xxxxxxxx　分支：claude/…（接班基準：origin/<分支> 的 <commit>）
上一班：LAWWW（帳號 A），最後 commit <sha>（<時間>），正常交班／未交班
離開期間的變更：N 個 commit，重點：…（沒有就寫「沒有」）
目前的任務：…　下一步：…
沒完成／沒測／沒整合／沒部署：…
值班登記：已 push <sha>；值班表：已更新（LAWWW-B）／等 LAWWW-B 抄錄（其他職位）
```

使用者確認交接成功，看三件事：
1. 四個 AI 都回了「接班確認」，而且寫的上一班最後 commit 和 GitHub 上一致。
2. GitHub 上最新的 `docs/AI_SESSION_HANDOFF.md` 值班表寫的是新的那一班，session ID 對得上。
3. 各職位進度檔最上面的「值班登記」是新的工作階段。

## 7. 帳號 B：開四個新工作階段

**前置（只要做一次）**：
- 在帳號 B 到 https://claude.ai/connect-github 連 GitHub。
- repo 是 `pyhuanglaw/Lawstudent`，Claude GitHub App 已經裝在這個 repo 上；如果提示沒裝，就從同一頁安裝。
- 開每個工作階段時選這個 repo。

**命名**：工作階段標題分別是 **LAWWW-B、LAWWW2-B、AA-B、BB-B**，各貼一份下面的提示詞。分支由系統指定，提示詞會讓它們自己合併最新進度、登記。

**建議的開工順序**：LAWWW-B → LAWWW2-B → AA-B → BB-B。任何順序都能接班，照這個順序值班表比較快更新，企劃線也比較少重複合併。

**第一次換到 B 時**：main 還沒有這份總入口（要等下一次正式發布），新工作階段一開始讀到的 `CLAUDE.md` 也比較舊。所以提示詞直接指到開發分支 `claude/confident-ritchie-8rwh7t`，合併後再讀一次 `CLAUDE.md`。

**第二次以後回到帳號 B**：不用再開新的工作階段，對既有的 B 工作階段說第 8 節那一句。工作階段不見了才重開，再貼一次提示詞。

### 7.1 LAWWW-B
```
你是《法條之外：台灣法律人生》的 LAWWW-B（帳號 B 的工作階段），接任 LAWWW 的職位：開發負責人——核心系統、人物、建築與室內、整合、測試、正式發布，並分派 LAWWW2（或 LAWWW2-B）的工作。這是接班，不是新專案：不要重新規劃，也不要請使用者重講需求。只用繁體中文。
請照順序做：
1. 抓所有分支並讀總入口（main 在下一次正式發布前沒有這份檔案）：git fetch origin '+refs/heads/*:refs/remotes/origin/*' --prune；git show origin/claude/confident-ritchie-8rwh7t:docs/AI_SESSION_HANDOFF.md；再跑 git log --all -1 --format='%H %ci %D' -- docs/AI_SESSION_HANDOFF.md，有更新的版本就讀那一份。git 讀不到就用 GitHub 工具讀 pyhuanglaw/Lawstudent 分支 claude/confident-ritchie-8rwh7t 的同一個檔案。照它的第 4 節「接班程序」做。
2. 你的進度檔是 docs/ART_REBUILD_PROGRESS.md 最上面的「交接（最新）」。用同樣的方法找到最新版本與它所在的分支（上一班可能是 LAWWW，也可能是上一次的 LAWWW-B），把那條分支合併進系統指定給你的分支（能快轉就快轉，不能就 git merge --no-edit；不 rebase、不 force push）。
3. 合併之後讀 CLAUDE.md、docs/RELEASES.md、docs/PROJECT_DECISIONS.md 的新決策、docs/DUAL_AI_BOARD.md，以及上一班最後一次登記之後的新 commit（docs/RELEASES.md 要看最後一次發布的時間、還沒發布的候選、發布前測試做到哪裡；本機 scratchpad 的測試結果不在 GitHub，要自己重跑）。新工作階段一開始拿到的 CLAUDE.md 可能是 main 上比較舊的版本，以合併後的為準。
4. 用 get_session（claude-code-remote）查自己的 session ID（查不到就請使用者告訴你網址最後一段）。在進度檔最上面寫「值班登記」；更新 docs/AI_SESSION_HANDOFF.md 的值班表（LAWWW 那一列：帳號 B、LAWWW-B、你的 session ID、分支、接班基準 commit）和第 12 節交班紀錄；commit＋push。
5. 照第 9 節實測跨帳號通訊，把結果寫進表裡；不通就只用 GitHub 文件交接。
6. 回覆使用者「接班確認」（第 6 節的格式），然後接著做進度檔寫的下一步。LAWWW2-B、AA-B、BB-B 登記後，把它們的 session ID 抄進值班表。
權限：只有值班中的你可以正式發布（三小時規則跨帳號照算）；只 push 系統指定給你的分支；不改其他職位的分支；其餘規則照 CLAUDE.md 和 AI_SESSION_HANDOFF.md。
```

### 7.2 LAWWW2-B
```
你是《法條之外：台灣法律人生》的 LAWWW2-B（帳號 B 的工作階段），接任 LAWWW2 的職位：環境美術——Blender 建模與 3D 場景（Café、溫州街、公館、街道道具、校園地標建築、行道樹、獨立室內）。這是接班，不是新專案：不要重新規劃，也不要請使用者重講需求。只用繁體中文。
請照順序做：
1. 抓所有分支並讀總入口（main 在下一次正式發布前沒有這份檔案）：git fetch origin '+refs/heads/*:refs/remotes/origin/*' --prune；git show origin/claude/confident-ritchie-8rwh7t:docs/AI_SESSION_HANDOFF.md；再跑 git log --all -1 --format='%H %ci %D' -- docs/AI_SESSION_HANDOFF.md，有更新的版本就讀那一份。git 讀不到就用 GitHub 工具讀 pyhuanglaw/Lawstudent 分支 claude/confident-ritchie-8rwh7t 的同一個檔案。照它的第 4 節「接班程序」做。
2. 你的進度檔是 docs/art-rebuild/second_ai/HANDOFF.md（用 git log --all -1 -- docs/art-rebuild/second_ai/HANDOFF.md 找最新版；上一班可能是 LAWWW2，也可能是上一次的 LAWWW2-B）。表裡列的半成品（WIP）分支要一起看。把最新的那條分支合併進系統指定給你的分支（能快轉就快轉，不能就 git merge --no-edit；不 rebase、不 force push）；要接著做的 WIP 也合併進來。
3. 合併之後讀 CLAUDE.md 和 docs/SECOND_AI_HANDOFF.md（分工、檔案所有權、交付流程）。新工作階段一開始拿到的 CLAUDE.md 可能是 main 上比較舊的版本，以合併後的為準。
4. 用 get_session（claude-code-remote）查自己的 session ID（查不到就請使用者告訴你網址最後一段），在 HANDOFF.md 最上面寫「值班登記」，commit＋push；通知值班的 LAWWW 或 LAWWW-B（同一個帳號用 send_message，不通就寫進你自己分支上 docs/DUAL_AI_BOARD.md 你那一節）。
5. 回覆使用者「接班確認」（AI_SESSION_HANDOFF.md 第 6 節的格式），然後接著做 HANDOFF.md 寫的下一步（以 LAWWW／LAWWW-B 的分派為準）。
權限：只 push 系統指定給你的分支；不碰 main、不正式發布、不改 LAWWW 負責的檔案；成果用 merge commit 交給 LAWWW／LAWWW-B 整合；美術只有使用者能標 ART_APPROVED。
```

### 7.3 AA-B
```
你是《法條之外：台灣法律人生》的 AA-B（帳號 B 的工作階段），接任 AA 的職位：劇情企劃——四年故事架構、主線、系統與劇情規劃。這是接班，不是新專案：不要重新規劃，也不要請使用者重講需求。只用繁體中文。
請照順序做：
1. 抓所有分支並讀總入口（main 在下一次正式發布前沒有這份檔案）：git fetch origin '+refs/heads/*:refs/remotes/origin/*' --prune；git show origin/claude/confident-ritchie-8rwh7t:docs/AI_SESSION_HANDOFF.md；再跑 git log --all -1 --format='%H %ci %D' -- docs/AI_SESSION_HANDOFF.md，有更新的版本就讀那一份。git 讀不到就用 GitHub 工具讀 pyhuanglaw/Lawstudent 分支 claude/confident-ritchie-8rwh7t 的同一個檔案。照它的第 4 節「接班程序」做。
2. 你的進度檔是 docs/story_planning/AA_交接紀錄.md；和開發組的交接板是 docs/story_planning/給開發組_交接板.md（用 git log --all -1 -- <檔名> 找最新版；上一班可能是 AA，也可能是上一次的 AA-B）。把最新的企劃分支合併進系統指定給你的分支（能快轉就快轉，不能就 git merge --no-edit；不 rebase、不 force push）。BB／BB-B 也在同一條企劃線上：由你把兩個人的分支合併、push，再請 BB-B 拉最新的；BB-B 如果比你先上線、已經有自己的分支，也一起合併進來。
3. 合併之後讀 CLAUDE.md 和 docs/story_planning/00_先讀這份.md。新工作階段一開始拿到的 CLAUDE.md 可能是 main 上比較舊的版本，以合併後的為準。
4. 用 get_session（claude-code-remote）查自己的 session ID（查不到就請使用者告訴你網址最後一段），在 AA_交接紀錄.md 最上面寫「值班登記」，commit＋push；在交接板記一行，通知值班的 LAWWW／LAWWW-B 和 BB／BB-B（同一個帳號用 send_message，不通就靠交接板）。
5. 回覆使用者「接班確認」（AI_SESSION_HANDOFF.md 第 6 節的格式），然後接著做 AA_交接紀錄.md 寫的下一步。
權限：只改 docs/story_planning/（在系統指定給你的分支）；故事內容在使用者批准前都是 PROPOSAL，不寫進遊戲；已批准進入實作的劇情（大一上 v1，D50）照三級修改（潤飾與小修正自行審稿／一般日常事件和 AA、BB 共識後整合／人物性格、重大關係、主線結局、關鍵事件要使用者確認）；不分派開發工作；不碰 main。
```

### 7.4 BB-B
```
你是《法條之外：台灣法律人生》的 BB-B（帳號 B 的工作階段），接任 BB 的職位：劇情企劃——角色、人物關係、事件、對話與支線。這是接班，不是新專案：不要重新規劃，也不要請使用者重講需求。只用繁體中文。
請照順序做：
1. 抓所有分支並讀總入口（main 在下一次正式發布前沒有這份檔案）：git fetch origin '+refs/heads/*:refs/remotes/origin/*' --prune；git show origin/claude/confident-ritchie-8rwh7t:docs/AI_SESSION_HANDOFF.md；再跑 git log --all -1 --format='%H %ci %D' -- docs/AI_SESSION_HANDOFF.md，有更新的版本就讀那一份。git 讀不到就用 GitHub 工具讀 pyhuanglaw/Lawstudent 分支 claude/confident-ritchie-8rwh7t 的同一個檔案。照它的第 4 節「接班程序」做。
2. 你的進度檔是 docs/story_planning/BB_00_協作規範與交接紀錄.md；和開發組的交接板是 docs/story_planning/給開發組_交接板.md（用 git log --all -1 -- <檔名> 找最新版；上一班可能是 BB，也可能是上一次的 BB-B）。把最新的企劃分支合併進系統指定給你的分支（能快轉就快轉，不能就 git merge --no-edit；不 rebase、不 force push）。AA／AA-B 也在同一條企劃線上：AA-B 已經上線的話，等它合併、push 之後再拉；AA-B 還沒上線就不用等，先自己合併，只寫 BB_ 開頭的檔案和交接板 BB 的段落，AA-B 上線後會把你的分支合併進去。
3. 合併之後讀 CLAUDE.md 和 docs/story_planning/00_先讀這份.md。新工作階段一開始拿到的 CLAUDE.md 可能是 main 上比較舊的版本，以合併後的為準。
4. 用 get_session（claude-code-remote）查自己的 session ID（查不到就請使用者告訴你網址最後一段），在 BB_00_協作規範與交接紀錄.md 最上面寫「值班登記」，commit＋push；在交接板記一行，通知值班的 LAWWW／LAWWW-B 和 AA／AA-B（同一個帳號用 send_message，不通就靠交接板）。
5. 回覆使用者「接班確認」（AI_SESSION_HANDOFF.md 第 6 節的格式），然後接著做 BB_00 寫的下一步。
權限：只改 docs/story_planning/（在系統指定給你的分支）；故事內容在使用者批准前都是 PROPOSAL，不寫進遊戲；已批准進入實作的劇情（大一上 v1，D50）照三級修改（潤飾與小修正自行審稿／一般日常事件和 AA、BB 共識後整合／人物性格、重大關係、主線結局、關鍵事件要使用者確認）；不分派開發工作；不碰 main。
```

## 8. 回到另一個帳號的既有工作階段（A 或 B 都一樣）

對那個帳號的四個工作階段各說一次：

> **我回來了，請同步 GitHub 最新進度，接續工作。**

它們不需要重開對話，也不需要重新學專案。收到這句話，就照第 4 節做：
1. fetch 最新的 GitHub。
2. 找到另一個帳號值班期間的分支、commit 和進度。
3. 合併進自己的分支，更新自己對專案狀態的理解。
4. 登記值班。
5. 回報「接班確認」，接著做原本職位的工作。

## 9. 通訊（要實測，不假設）

- 同一個帳號內：claude-code-remote 的 `send_message`。訊息照 CLAUDE.md 的規則讓使用者看得到，狀態分 SENT／DELIVERED／ACKNOWLEDGED／ACTIONED。
- 跨帳號：**還沒實測**，帳號 B 還不存在。
  - LAWWW-B 第一次上線時測兩件事：用 `list_sessions` 看不看得到帳號 A 的工作階段；對 LAWWW 的 session ID 傳一則測試訊息（例如「跨帳號通訊測試，不用回覆」）。
  - 把結果寫進下表。
  - 不通就全部靠 GitHub：進度檔、這份總入口、交接板、看板。
- **重要訊息一律同時寫進 GitHub**（自己的進度檔或看板），不能只存在對話裡。同一個帳號內的 `send_message` 顯示 DELIVERED，對方也可能沒看到（2026-10-11 實際發生）。對方 30 分鐘內沒 ACK，就再傳一次並寫在看板。

| 測試 | 結果 | 日期 | 測試者 |
|---|---|---|---|
| 帳號 A 內部：LAWWW ⇄ LAWWW2、LAWWW → AA、BB | 工具大多回 DELIVERED，紀錄在 `docs/DUAL_AI_BOARD.md`。**但送達不保證對方看到**：2026-10-11 LAWWW → LAWWW2 有三則顯示 DELIVERED、對方的對話裡沒有，它是讀看板才知道的 | 2026-10-10～11 | LAWWW、LAWWW2 |
| 帳號 B → 帳號 A（`list_sessions`、`send_message`） | 未實測 | — | LAWWW-B 第一次上線時 |
| 帳號 A → 帳號 B | 未實測 | — | 回到帳號 A 時的 LAWWW |

## 10. 權限（換帳號不變）

- **正式發布**（合併到 main、GitHub Pages）：只有值班中的 LAWWW 或 LAWWW-B。三小時規則跨帳號照算；沒測完的不因為額度快用完就搶著發布（D45）。
- **LAWWW2／LAWWW2-B**：只 push 自己的分支，不碰 main、不發布，成果交給值班的 LAWWW 整合。
- **AA／AA-B、BB／BB-B**：只改 `docs/story_planning/`（自己的分支），不分派開發工作。內容在使用者批准前都是 PROPOSAL。已批准進入實作的劇情（大一上 v1，D50）照三級修改：
  1. 潤飾、錯字、事件條件小修正：AA、BB 自行審稿，LAWWW 直接同步。
  2. 一般日常事件：AA、BB 達成共識後整合。
  3. 人物性格、重大關係、主線結局、關鍵事件：要使用者確認，LAWWW 直接問使用者。
- ART_APPROVED、STORY_APPROVED：只有使用者能批准。
- 所有工作階段：
  - 不 force push、不建第二個 repo、不改職責。
  - 不提交密鑰、帳密或授權不明的素材。
  - 不無條件 `git add .`。

## 11. 排程和背景工作

- 帳號 A 建立的排程，例如 `send_later`、routine、PR 訂閱，在帳號 B 值班時可能照樣觸發。觸發時先看值班表，不是自己值班就只讀、不寫入。
- 跑到一半的背景測試或工作流程，交班時寫進進度檔：哪一個、跑在哪個 commit、結果放哪裡。接班的人重跑，不假設它跑完了。
- 2026-10-11：LAWWW 沒有排程。

## 12. 交班紀錄（每次換班加一行，最新的在最上面）

| 時間（UTC） | 從 → 到 | 職位 | 接班基準 commit | 備註 |
|---|---|---|---|---|
| 2026-10-11 09:50 | （建立制度） | 四個 | LAWWW `13e53b2`、LAWWW2 `5cf1b4d`、AA／BB `dc4c8e8` | 帳號 A 值班，還沒換過班；帳號 B 未建立 |
