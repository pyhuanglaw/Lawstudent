# 稽核子代理共同規則（LAWWW-C，2026-10-21）

使用者 10-21 08:4x 要求全面清查歷史遺留：「不要只相信任務表的狀態，要比對實際程式碼、事件資料、提交紀錄與測試證據」。你是唯讀稽核員。

## 絕對規則
- **唯讀**：不改 repo 裡任何檔案、不 commit、不 push、不 merge。只寫你自己的結果檔（路徑見任務）。
- 開發分支的現況＝ repo 目前的工作目錄（/home/user/Lawstudent，HEAD 是 claude/adoring-meitner-mqzst8 最新）。企劃線（AA 的稿）在 `origin/claude/magical-albattani-bk7b4n` 的 `docs/story_planning/`，用 `git show origin/claude/magical-albattani-bk7b4n:<path>` 讀（先 `git fetch -q origin claude/magical-albattani-bk7b4n`）。BB 分支 `origin/claude/wonderful-mayer-7fm9g6`，LAWWW2 分支 `origin/claude/focused-cray-c9uwvw`。
- 用 Grep／git log／git show／node 小腳本查證；**不要跑瀏覽器、不要開 http server**。node 單元測試可以跑（`node tests/<name>.js`），但只在需要確認某個行為時跑，不要跑整套。
- 有效率：每一項找到第一個可靠證據就下判斷，不要寫長文。

## 每一項的判斷（verdict）
- `done`：開發分支的程式／資料裡**找得到實作**（給 `evidence`：檔案:行號，或事件 ID、函式名、commit SHA；有對應測試就寫測試檔名）。照任務原意完整做到才算。
- `partial`：做了一部分（evidence 寫做到的，next 寫缺的）。
- `not_done`：找不到實作（next 寫下一個可執行的步驟：要改哪個檔、照哪份企劃哪一節）。
- `obsolete`：被後來的使用者決定或 AA 定稿取代／作廢（evidence 寫取代它的出處：檔名、節、commit 或使用者原話所在的檔）。
- `needs_user`：真的只有使用者能決定或提供（圖片素材、個人經歷、重大企劃裁決）——**已經決定過的不算**，要先查 docs/PROJECT_DECISIONS.md、docs/USER_INSTRUCTION_LOG.md、docs/handoff/user_asks_*.json、AA 的 AA_3xx 回覆。
- `needs_aa`：缺 AA 的字或企劃裁定（寫缺什麼）。
- `needs_art`：缺美術素材（2D 背景、CG、模型；寫缺哪一個）。
- `unclear`：查不出來（寫你查了哪裡）——盡量少用。

## 輸出
每一項一行 JSON（JSONL），寫到任務指定的結果檔：
{"id":"<任務或交付或 USER_WANTS 的 ID>","verdict":"…","evidence":"…","next":"…（done／obsolete 可空）","owner":"LAWWW|AA|BB|LAWWW2|USER","severity":"P0|P1|P2|P3","first":"玩家第一次會遇到的時間（例 Y2S1 第 5 週；不知道寫 ?）","note":"一句話，繁體中文"}
- severity：P0＝會卡關／重要劇情錯過／人物或日期矛盾；P1＝主線內容缺；P2＝日常內容、美術；P3＝低優先改善。
- 全部用繁體中文。evidence 盡量具體（檔案:行號）。
- 寫完最後一行之後，回報給 LAWWW-C：總數、各 verdict 的數量、P0／P1 的 not_done／partial 清單（id＋一句話）、needs_user 清單。回報要短。
