# AA 歷史待辦複核：子代理共同說明（HISTORY-AUDIT-1031）

你在幫劇情導演 AA-B 複核過去的劇情企劃有沒有真的做進遊戲。只讀程式、只寫你自己的輸出檔，不改其他檔、不 commit、不 push。

## 要讀的
- 企劃：/home/user/Lawstudent/docs/story_planning/ 裡你負責的那一批檔（工作目錄就是企劃線，最新）。
- 遊戲：開發分支，用 git 讀，不要讀工作目錄的 src（工作目錄是企劃線，沒有最新程式）：
  - `git -C /home/user/Lawstudent show origin/claude/modest-rubin-2lyp7g:<path>`
  - `git -C /home/user/Lawstudent grep -n '<pat>' origin/claude/modest-rubin-2lyp7g -- src`
  - 開工先 `git -C /home/user/Lawstudent fetch -q origin claude/modest-rubin-2lyp7g`。
- 正式版：`origin/main`，同樣用 git 讀（`git -C ... grep -n '<pat>' origin/main -- src`），用來填 main 欄。
- 格式與七類：開發分支的 docs/handoff/history_audit/README.md（`git show origin/claude/modest-rubin-2lyp7g:docs/handoff/history_audit/README.md`）。

## 怎麼判
- 只判「已定稿」的企劃：使用者批准的，或 AA／BB 自己定稿交給 LAWWW 的（檔頭寫「交 LAWWW」「定稿」「照做」「給 LAWWW-B」「第①②級」之類）。
  - 純討論、回覆、問答、稽核報告、讀稿報告：不用判，列進你最後回報的「略過」清單（檔名＋一句原因）。
  - PROPOSAL 還沒批准的：不判，列「略過」。
- 每一份已定稿的企劃，到開發分支找實作：事件 id、資料檔的關鍵台詞（抓一兩句原文 grep）、旗標。
  - 整份都找得到：寫一行 tier 2（或有 BB 實測紀錄就照 README），evidence 寫一兩個檔:行號，`missing` 空白。不用逐場列。
  - 只找到一部分：tier 4，`missing` 寫缺哪幾場、哪幾句（具體到節號、事件、一句原文開頭）。
  - 完全找不到：tier 5。
  - 被後來的企劃取代（檔頭或內文有「作廢」「以 AA_xxx 為準」「取代」，或後來的稿明說換掉）：tier 7，`basis` 寫取代它的稿和節，`covered` 寫新稿怎麼涵蓋原本要的。新稿沒涵蓋的部分，另寫一行 tier 4／5。
  - 查不到又不確定（例如只是說明性質、找不到可以 grep 的句子）：照最接近的 tier，`evidence_gap: true`。
- **不要為了好看寫成做完**。找不到就是找不到。
- BB 驗收紀錄：BB 的分支是 `origin/claude/elegant-brown-fcos7n`（docs/test_logs 或 qa 資料夾）。這次不用逐項查 BB 紀錄，`bb` 寫 `none`，tier 最高寫 2（除非你剛好看到明確的 BB 實際操作紀錄）。

## 輸出
- 一行一個 JSON，寫到你被指定的檔（docs/handoff/history_audit/wip/<你的批次>.jsonl），**每判完一份就 append 一行**（中途斷掉也留得住）。
- 欄位照 README：`id` 用企劃檔的編號加節號，例如 `AA_315`、`AA_315#3-2`；`src` 寫 `plan`；`by` 寫 `AA-B`；`at` 寫現在的 UTC 時間；`owner`：tier 4／5 寫 `LAWWW`（要實作）或 `AA`（要先補稿），其他寫 `LAWWW`。
- 全部用繁體中文。
- 最後回報（你的最後一則訊息）：判了幾份、tier 各幾份、所有 tier 4／5 的一行摘要清單、略過清單。
