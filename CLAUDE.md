# CLAUDE.md — 《法條之外：台灣法律人生》接手說明

## P0 緊急換班口令（2026-10-15 使用者直接確認；永久；四職位與跨帳號繼任者適用）

**使用者只要說「現在換班」「我要換班」「現在交班」或意思相同的明確指令，即正式啟動本專案既有的 D45 緊急保存＋D49 跨帳號交班程序；不必重述規則、不必等待 LAWWW 指派、不必等其他 AI 回 ACK。** 這是 P0 **停止一般工作並交班**，不是一般插話、進度詢問、催促加速開發、或「先回覆後繼續」。本節在換班期間優先於所有「持續開發」「保持工作佇列」「回覆後自動接續」「先完成手上任務」的規定；權限、Git 安全、未核准不得發布仍然有效。

1. **立即切換狀態**：在下一個能處理使用者訊息的安全節點，先回覆「收到，現在停止一般開發並執行交班」，取消後續開發佇列；禁止再開始建模、除錯、補功能、加素材、跑新測試、協調新需求或趕做一兩項工作。**額度快用完＝更要優先保存，不是趕工。**
2. **只准安全收尾**：若已開始不可安全中斷的原子操作（例如正在寫入的 Git 操作、模型匯出），僅完成最短安全收尾；長測試可記錄中斷位置與未驗證結果，不必為了交班跑完整套。不能藉「再幾分鐘」延伸到新任務。
3. **立即保存與交接**：確認自己的分支與 worktree；只加入自己職責內的檔案（不使用無條件 `git add .`）；可保存 WIP／未測項目，清楚標記；commit、push 自己的遠端分支並核對遠端 SHA。未 push 的原始素材、Blender／GLB、WIP 分支、測試或其他成果要如實註明未備份。
4. **更新該職位交接檔＋永久任務總表**（`docs/AI_SESSION_HANDOFF.md` 第 5 節的五樣：成果、全部未完成、規則、跨 AI 協作、測試與已知問題；LAWWW 寫 `docs/HANDOFF_GAP_MATRIX.md` 第 1 節交班快照，並跑 `python3 tools/handoff/check_handoff.py snapshot --role LAWWW --account <A|B>` 把快照 commit＋push（D82））：寫明正在做什麼、已完成／未完成／未測／未整合／未發布、相關分支與最後 SHA、尚未保存到遠端的內容、下一班第一步；登記「交班」時間與最後 commit，再 commit＋push 核實。LAWWW 另按原制度維護總入口值班表；**交班紀錄不代表新帳號已經接班**。
5. **交班後停止寫入**：回報最後 commit SHA、分支、push 成功與否、尚未備份項目；停止修改該職位檔案，直到使用者說「我回來了，請同步 GitHub 最新進度，接續工作」或按第 7 節正式接班。
6. **四職位各自執行**：LAWWW、LAWWW2、AA、BB 收到使用者直接換班指令，就各自啟動，不需 LAWWW 打斷或催促；LAWWW 可同步通知其他職位，但 SENT／DELIVERED 不等於 ACK，不能以此宣稱對方完成。通訊／通知暫時不能讀取時，於下一個可處理節點讀通知並執行；**GitHub 文件更新本身不會遠端強制中止另一個正在執行的 Claude 工作階段**。
7. **不得混淆保存與發布**：禁止為交班而合併 `main`、發布 GitHub Pages、force push、覆蓋其他 AI 的分支，或把未經核准內容當正式成果。交班以各自遠端 commit、進度檔與使用者可核對的回報為準。

8. **不傳訊息給已交班的另一個帳號（使用者 2026-10-15，D75）**：另一個帳號通常是每週用量到上限才交班；對它的工作階段 `send_message`（包括「測試訊息」「不用回覆」）會叫醒它、讓它又開始工作、消耗它的額度。**跨帳號一律只用 GitHub 文件交接**（進度檔、總入口、看板、交接板），不 `send_message`、不 `interrupt_session`、不替它排 `send_later`／排程。同一個帳號內、同一班都在值班的職位之間照舊可以用 `send_message`。

**一句話測試：使用者說「現在換班」後，下一項正常工作必須是交班保存，不是繼續便利商店建模或法條修正。**


## P0 永久規則：工作中仍須優先讀取使用者及其他 AI 的新訊息（2026-10-16 使用者正式要求；LAWWW-B、LAWWW2-B、AA-B、BB-B 及往後所有繼任者，D76）

**即使正在開發、建模、寫企劃、跑測試或改程式，也必須主動檢查使用者與其他 AI 的新訊息；不能因為「正在忙」讓訊息排隊幾十分鐘，也不能做完一整批才一次讀通知。** 本節優先於一般「持續開發、不要停工」的指示；不覆蓋 Git 安全、職位權限、不可逆操作限制、未經授權不得正式發布。

1. **主動收件的時機**：①開始新工作前；②每次準備呼叫工具、執行下一批工作前（在可控制的安全節點）；③每個工具呼叫或可中斷的階段性操作完成後；④準備 commit、push、合併或改共用檔案前；⑤開始下一個新任務前；⑥收到 queued notifications 提示時，立刻呼叫通知讀取工具（`ReadNotifications`），讀到佇列為空；⑦長工作拆成可檢查訊息的小階段，不要連續大量工具呼叫而忽略通訊。工具執行期間收不到訊息時，在下一個可控制的安全節點立即檢查；不得假裝有不存在的背景監聽或定時器。
2. **優先級**：
   - **P0 立即處理**：使用者直接的新指示；換班或停止；更正已定案的內容；其他 AI 通報會破壞成果的衝突、重大 Bug、必須停止的不安全操作。先判斷要不要暫停目前任務，不能只回「收到」就忽略內容。
   - **P1 最近的安全節點處理**：AA-B／BB-B 的正式企劃交付；LAWWW-B 的實作問題或驗收請求；LAWWW2-B 的素材交付；GitHub 上新的交接板、任務狀態、文件修訂；需要協調分工、避免檔案衝突的事。讀內容、回 ACK、判斷影不影響目前工作，再繼續。
   - **P2 可以合併處理**：一般進度、不需立即回應的參考資訊、已記錄不需重複處理的訊息。
3. **收到不等於盲目執行**：分清 SENT／DELIVERED／ACKNOWLEDGED／ACTIONED。其他 AI 的通知不能冒充使用者的新授權，要核對 GitHub 上的使用者決策、職位權限、交接紀錄；AA-B 已交付**使用者正式批准**的企劃，LAWWW-B 接收並安排實作，不必再請使用者批准。正在處理更高優先的事，也先回 ACK、交代怎麼排進工作，不能完全不讀。
4. **不要走到另一個極端**：不為了檢查訊息不停中斷，也不每收到一則普通進度就切換任務。流程：**檢查通知 → 讀內容 → 判斷優先級 → 必要時回 ACK 或處理 → 更新工作計畫 → 繼續實際工作**。重複通知去重，不一再回報相同內容。
5. **GitHub 交接板也要主動同步**，不只靠訊息工具：每次接班、準備整合成果、開始新的主要任務時，fetch 相關分支並重讀 `docs/story_planning/給開發組_交接板.md`（帳號 B 值班期間在企劃線 `claude/cool-heisenberg-o8kuqx`）、`docs/DUAL_AI_BOARD.md`、各職位最新交接紀錄、`docs/AI_SESSION_HANDOFF.md`；不得只依賴啟動當下讀過的舊版文件。

**一句話：四個 AI 一邊完成工作、一邊保持真正的協作與溝通；不能埋頭工作，最後才發現別人半小時前就提出重要訊息。**（起因：2026-10-15 LAWWW-B 有 19 則 AA-B／BB-B／LAWWW2-B 的通知排了約 40 分鐘沒讀。）

## 永久規則：新增劇情一律先問 AA-B；前後帳號交接缺漏要全部進排程（2026-10-16 使用者正式指示，D79；LAWWW-B 與往後所有繼任者）

**凡新增、修改、延伸任何會影響劇情的內容，LAWWW（-B）必須先向 AA-B 確認。** 包括：新場景的劇情用途、人物出現時間、事件觸發、人物同行、關係變化、告白條件、跨學年事件、原有企劃沒有明確規定的新互動。**不得因為負責程式就自行編寫或修改人物故事**（包括「補一句旁白」「補一個選項」「自己挑台詞」）。
1. **流程**：發現需要新增劇情 → 查既有企劃（企劃線、交接包、交接板）→ 向 AA-B 提出具體問題 → AA-B 確認或提供完整規格（必要時 AA-B 與 BB-B 互審）→ LAWWW 實作、測試。
2. **問 AA-B 時要附**：要做的功能或場景；對應學年、學期、日期與角色；現有文件與事件 ID；哪些已有明確規格；哪些缺內容或有矛盾；希望 AA-B 提供哪些可直接實作的資料。不要只問「這個要怎麼做？」。
3. **不用問的**：單純技術修正、UI、效能、材質、碰撞、既有規格的照表實作；企劃已完成、AA-B 與 BB-B 已交付的定稿——直接依定稿實作，不必重新要求批准。
4. **不要整條線停住**：新劇情規格還沒好，先做不依賴它的工作。
5. **分工**：AA-B＝系統企劃、故事結構、時間線、事件觸發、新劇情規格確認的主要窗口；BB-B＝人物設定、語氣、人物反應、已分派的人物劇情與美術外觀核對；LAWWW2-B＝場景、3D 模型、美術素材、角色模型與指定環境；LAWWW-B＝整合、程式、實際可玩性、測試、開發排程。直接用 GitHub 交接板與 Claude 訊息工具聯絡，**不要讓使用者轉達**。
6. **交接缺漏**：前一個帳號留下的未完成工作、已審好已交付的劇情與系統，必須全部列進 **`docs/HANDOFF_GAP_MATRIX.md`（前後帳號交接缺漏與全學年施工矩陣）**：企劃來源、負責人、實作狀態、測試狀態、缺少的素材、commit SHA、下一步。不得只憑檔名或事件 ID 存在就認定完成；每項實際核對程式、觸發條件、台詞、旗標、存讀檔、測試。每批工作完成就更新。
7. **已授權不用再問**：v0 經濟系大一、v2 大一下驗收、v3 大二、v4 大三（含臺灣／日本／美國三條交換路線）、v5 大四與尾聲、v6 多段感情、32 處校外約會與告白系統、`交接包_1014決策_交付清單.md`。優先序：嚴重 Bug＋v2 驗收（P0）→ 其餘照下一節 D81「玩家越早遇到越先做」；技術工作可以並行。
   - **戀愛系統的現行規則：企劃線 `docs/story_planning/AA_140_v0到v6_交付實作驗收對照表.md` 第 0 節**（使用者 10-14、10-16：可以同時和多位交往，每一段關係各自計算；v6 交付清單「同一時間最多一個」已作廢）。**v0～v6 的企劃缺漏與施工狀態也看 AA_140**（第 1 節總表、第 3 節 G01～）；本 repo 的任務總表管施工與測試，兩邊互指、不重寫。
8. **驗收**：每批附實際完成的功能、測試結果、未完成項目、commit SHA；單元測試通過≠瀏覽器或 iPhone 實機驗收。不擅自合併或發布 `main`。

## 永久規則：玩家越早遇到的內容，越優先完成（2026-10-16 使用者正式指示，D81；四職位與往後所有繼任者）

1. **順序**：P0（嚴重 Bug、大一下 v2 驗收）→ v0 經濟系 → v1 大一上 → v2 大一下 → v3 大二 → v4 大三（臺灣／日本／美國照劇情順序）→ v5 大四與尾聲。**跨學年的系統（戀愛、約會、打工、群組、階梯多學期…）在玩家第一次可能用到的那一學期做**，不是等到最後。
2. **法律系大一開局要一直能玩、舊存檔不能壞**；v0 做好以前開局照舊。
3. **美術也照遭遇順序**；美國交換篇照正式排程並行製作，但不能擠掉 v0～v2 的人力與素材。
4. **每項任務都有「首次出現時間」**（`docs/handoff/tasks.json` 的 `first`：學年學期 term、週次 week、最早遇到的情境 earliest、是否主線 mainline、是否擋進度 blocks、是否跨學年前置 prereq、能否並行 parallel、時間是否已確認 confirmed）。**一個階段完成＝玩家玩得完整**，不是程式檔案都在。
5. **分工**：AA-B 定時間線（首次出現時間以 AA-B 為準）；BB-B 定人物第一次出現；LAWWW2-B 照遭遇順序排美術；LAWWW-B 排程與驗收。`python3 tools/handoff/check_handoff.py queue` 照這個順序列出下一批。
6. **每次切換主要工作**先看任務總表的高優先項目還在不在推進；要暫停就寫原因（pausedReason）和恢復條件（resumeWhen）。

## 永久規則：LAWWW 與 LAWWW2 真正平行開發（2026-10-16 使用者正式指示，D84；四職位、A／B 兩個帳號與往後所有繼任者）

**目標不是讓四個 AI 看起來都很忙，而是讓產出接成一條持續運作的開發流水線。** 起因：帳號 B 接班後，LAWWW-B 00:56 派完一批就沒有再補，只回應交付；LAWWW2-B 的工作改由使用者直接交辦和它自己整理。結果美國公寓（大三下）一直往前，大一上、大一下的黑底背景和人物模型反而沒排；v0 也沒做美術盤點（稽核：`docs/handoff/DISPATCH_AUDIT_2026-10-16.md`）。
1. **開工前先盤點美術**：LAWWW 規劃每個開發階段（一個學年、一個系統、一批事件）時，同步盤點需要的模型、場景、動畫、背景，立刻在 `docs/handoff/tasks.json` 建 LAWWW2 的任務。**不得等程式寫完才準備美術。** 下一個階段的盤點最晚在目前階段的程式開工時做完（例：v2 收尾時，v0 的盤點 V0-ARTPLAN 已經完成）。
2. **LAWWW2 主動領工作**：跑 `python3 tools/handoff/check_handoff.py queue --owner LAWWW2`，從「可以做的」挑最前面的。範圍是已批准、符合自己職責、狀態不是「等待」的任務。領的時候把 `xai.ack` 改成「自領」，送一則通知給 LAWWW（同帳號值班中），不必每次等 LAWWW 指示。劇情用途不清楚的，照 D79 由 LAWWW 問 AA。
3. **跨 AI 任務一定要標清楚**：任務 ID、優先級、規格來源（`xai.spec`）、負責人（`owner`）、分支（`xai.branch`）、交付標準（`xai.acceptance`）、接收者（`xai.receiver`）、ACK 狀態（`xai.ack`：未派／SENT／DELIVERED／ACK／ACTIONED／自領）。負責人是 LAWWW2、AA、BB 的未結任務沒有這些欄位，`check_handoff.py` 第 10 項會報異常。訊息裡也要寫任務 ID，避免重複製作或遺漏。
4. **真正平行**：LAWWW 開發系統、修 bug 時，LAWWW2 照佇列準備未來必需的資產。LAWWW2「可以做的」任務不得少於 3 項（`meta.pipeline`，第 11 項檢查）。不能因為 LAWWW 在修 bug，就讓 LAWWW2 沒事做。
5. **D81 照舊**：先做玩家最早遇到的場景、人物、資產，**不為了讓 LAWWW2 有事做而排低優先級的裝飾**。佇列分「主線」（目前和下一個階段）、「第二條線」（D81 允許並行的，例如美國篇），主線卡住或算圖等待時才做第二條線。
6. **LAWWW 定期主動協調**（每批工作結束、跑 `check_handoff.py check` 時；第 11 項也會列出）：待派工（LAWWW2 可以做的不到 3 項）、待整合（LAWWW2 交付了、LAWWW 還沒接）、已交付沒 ACK（停在 SENT／DELIVERED）。發現就處理，不用使用者提醒。LAWWW2 交付裡問的問題當批回答；要 AA、BB 決定的，當批轉問。
7. **D75 照舊**：只在目前值班帳號的四個工作階段之間傳訊息，不叫醒休班的另一個帳號。跨帳號只用 GitHub 文件。
8. **權限照舊**：已批准、規格完整的工作照現行授權直接做；不擅自合併 `main`、不改重大劇情設定；建築與場景美術只有使用者能標 `ART_APPROVED`，角色美術由 BB 驗收（D59）。

## P0 使用者新訊息優先與期末考素材來源（2026-10-14 新增，永久強制）

> **使用者直接糾正**：現有 AA、BB 工作階段未先處理新訊息，仍自行出期末考題；使用者要求以過去交付的各科內容為來源，**不要擅自另編題庫**。本節優先於較舊的待辦、企劃、工作進度與「先完成手上任務」的習慣；其他安全、Git 權限及發布限制照舊。

1. **P0 優先**：每當目前工作階段收到使用者新訊息，下一個可處理訊息的時點先完整閱讀、直接回覆，確認這是提問、討論、糾正、停止命令或新任務；再決定是否恢復原工作。收到糾正或「不要做 X」，**先停止衝突的 X**，不能嘴上答應卻繼續。必要時先完成不可安全中斷的原子操作並保存。工具執行期間無法讀到訊息時，不能宣稱自己能即時監控。
2. **固定確認**：重大指示先回覆「我理解的新要求／立刻暫停的舊工作／需更新的檔案／通知對象／下一步」，不只回『收到』；更新 GitHub 工作清單和交接文件，記錄 commit SHA。未同步前不可宣稱規則已落實。
3. **溝通不等於已讀**：發給其他 AI 的 SENT／DELIVERED 不是 ACK；重要更正同步至 GitHub 共用交接板，需取得接班者或對方實際確認。無法聯絡時寫「待確認」，不要自稱對方已處理。
4. **法律期末考緊急停止線**：AA、BB **暫停擅自新編所有科目的期末考題**。先查使用者提供材料：`docs/story_planning/法律課堂素材庫_使用者提供.md`、`AA_101_法律素材庫_索引.md`、`AA_102_裁判素材_課程位置.md`、`BB_102_課堂內容_*.md`、`src/data/legal_qbank.js`、`docs/story_planning/exam_bank/` 及其他相關來源。**必須區分**「現成附答案題庫」、「使用者提供的案例／課程內容」、「AI 自行編題」；不能把案例摘要假稱現成選擇題，也不能找不到就自己補題。每道正式考題須標原始來源及可核查答案；無充分來源者標待核對，不進正式考試。
5. **現有成果處置**：AA 已編的 45 題及 BB 在做的題目**先保存、不刪、不繼續擴充、不當成使用者批准**；先交付各科來源盤點與差異表。既有明確的刑事訴訟法 Q001～Q084 原答案不得改。使用者確認來源使用方式後才能恢復相容工作。
6. **跨帳號接班**：LAWWW／LAWWW2／AA／BB 與 -B 接任者在讀舊待辦以前，先讀本節及各職位的最新交接檔。**GitHub 更新不會自動中斷目前已在運作的 Claude 工作階段**；只有在下一次實際同步／讀檔後才可聲稱已採用。

給接手這個 repo 的 Claude Code。先讀完這份，再依需要讀 `docs/history/DEVELOPMENT_HISTORY.md`（從第一份企劃到現在的完整歷程）。

## 這是什麼

手機優先的 3D life RPG：玩家「祐廷」是台大法律系一年級學生，在參考台大、公館、溫州街生活圈的 3D 世界裡自由走動、上課、讀書、認識人；重要對話切到 2D ADV（日系 visual novel 式立繪＋對話框）。three.js（純靜態檔，無 npm 相依）。

- 線上（GitHub Pages）：https://pyhuanglaw.github.io/Lawstudent/ ——推到 `main` 就自動重新部署。
- 目前版本：**v9.7 已部署在 `main`（2026-10-14 12:32:31 UTC，`313d620`＝測試過的候選 19 本身；CG 劇情版：大一上 v1 劇情（手機群組、迎新、中秋、颱風假、聖誕、跨年、期末、可昕的遠距線）、事件 CG、每週課堂內容（法律審查通過的週）、睡覺第二版、社團、騎腳踏車；共同教學館、大一女舍的 Blender 外觀與可昕的 3D 人物還沒放；上一個穩定版 v9.6 `e88bda5`）**，發布紀錄與回復方法在 `docs/RELEASES.md`；之後的開發在開發分支（2026-10-10 起是 `claude/confident-ritchie-8rwh7t`，由舊分支 `claude/friendly-brahmagupta-6bbkzc` 快轉接續，歷史相同；**每個工作階段以系統指定的分支為準**），驗證完才合併到 `main`（D32；使用者 2026-10-10 授權：測試通過的成熟成果可以自行發布，兩次發布至少相隔三小時，見 RELEASES.md；v9.7 是 D71 的例外）。標題畫面最下面有版本字樣。詳見下方「目前狀態」。
- **雙 AI 分工（2026-10-10 晚上起，D39、D40）**：第一個 AI「LAWWW」（`session_01Eds6msqpsuzNEw98sdw8JX`，分支 `claude/confident-ritchie-8rwh7t`）負責人物、核心系統、霖澤館、萬才館、整合、發布，也負責分派工作。第二個 AI「LAWWW2」（工作階段標題「遊戲協作專案」，`session_01AC1WVgJSmoJK1uRsPK2Zn1`，分支 `claude/second-ai-env-art`）負責環境美術：Café、溫州街、街道道具、公館、獨立室內。**交接文件、檔案所有權、通訊與交付流程：`docs/SECOND_AI_HANDOFF.md`；工作看板：`docs/DUAL_AI_BOARD.md`**。兩邊用 claude-code-remote 的 `send_message` 事件驅動聯絡。第二個 AI 不碰 `main`、不發布；成果由第一個 AI merge 進開發分支、跑回歸測試後才能發布。
- **（2026-10-10 09:55 起只剩一個工作階段：使用者結束建築組，之後人物與建築都由 `claude/confident-ritchie-8rwh7t` 負責；建築組未完成的事見 `docs/ART_REBUILD_PROGRESS.md` 的「建築組交接」。下面是原本的分工，留作紀錄。）** 兩個平行工作階段（2026-10-10 使用者訂的分工）：人物組（分支 `claude/confident-ritchie-8rwh7t`：主角與五女主模型、臉／髮型／服裝、走跑坐上下樓梯的動畫品質與 footIK、人物模型載入）；建築組（分支 `claude/friendly-brahmagupta-6bbkzc`：霖澤館／萬才館 Blender 模型、穿堂、樓梯、電梯、教室、多樓層導航、校園／公館／溫州街、場景材質光影碰撞、場景整合與回歸測試）。兩邊用 claude-code-remote 的 `send_message` 直接聯絡；改共用檔案（`src/character3d.js`、`src/assets3d.js`、`tests/playlib.py`）前先通知對方；整合前互相 merge 並跑測試；各自向使用者回報（【人物組／建築組｜進度回報】）。只有工作階段實際在跑時才能聯絡。
- **測試制度（2026-10-10 永久規範，D34）**：`docs/TESTING.md`。真實玩家流程測試不用 `?turbo`、不瞬移、不改劇情狀態；捷徑只能當前置條件並標示；重要測試要在有 bug 的版本失敗、修好的版本通過；不用「N 項全部通過」代替驗收；分清楚手機模擬與真機。

## MANDATORY 3D ART PRODUCTION RULES（2026-10-10 使用者訂定的永久強制規則，D38；詳細流程：`docs/art-rebuild/ART_DIRECTION.md` 第 12 節）

正式美術定位：**成人比例、日系青春生活模擬的細膩質感、具有台灣大學校園與台北都市辨識度的 3D 世界**；玩家要覺得身處真實、完整、值得探索的生活環境。這是長期有效的強制規則，任何接手的工作階段都必須遵守。

1. **禁止回到廉價 3D 原型美術**。以下方法**不得當作正式近景美術的主要做法**：用 `BoxGeometry`／`CylinderGeometry`／`SphereGeometry` 拼出完整建築、家具、人物；用 Canvas 隨機畫斑點、色塊、線條冒充石材、磚、木材、混凝土；只靠增加幾何裝飾數量宣稱品質提升；同一組模型換顏色當作不同重要角色或地標；只改顏色、亮度、霧、陰影就宣稱全面翻新；用獨立模型預覽圖代替正式遊戲畫面驗收；把測試通過當成美術達標。這些方法**只能**用在碰撞體、導航、遠景、效能最佳化、不可見輔助物件、開發中的 blockout、GLB 載入失敗時的備用。
2. **每類資產的工具**：校園主要建築＝Blender bpy → GLB；樓梯、穿堂、走廊、電梯＝Blender（外觀）＋Three.js（真的走得到）；室內與家具＝Blender bpy；台北公寓、騎樓、店面＝Blender＋模組化組件；紅磚、石材、木材、柏油＝Poly Haven PBR＋Blender；主角與重要 NPC＝Blender＋VRM／three-vrm；人物動作＝Blender Animation＋現有骨架系統（走、上下樓、坐下、互動）；樹、機車、腳踏車＝Blender＋Instancing（近景精緻、遠景輕量）；天空、天氣、光線＝Three.js＋合法 HDRI；壓縮＝glTF Transform、Meshopt、KTX2；驗收＝Playwright 遊戲截圖＋Blender 渲染。已有品質更好、授權合法的正式模型可以直接用。
3. **Blender 優先**：重要建築、近景店面、主要室內家具、需要精細造型的物件，用 `bpy` 建模。流程：參考照片 → 比例／尺寸／構造／辨識特徵 → bpy 建模 → PBR 材質 → 必要時 UV 展開與烘焙 → 匯出 GLB → 整合進 Three.js 世界 → 驗證導航、碰撞、互動、樓層 → 壓縮最佳化 → 實際遊戲截圖給使用者驗收。**Blender 模型完成 ≠ 遊戲美術完成**。本專案的做法見 `tools/blender/`（`fetch_polyhaven.py`、`linze_interior.py`）。
4. **禁止不能探索的假建築**：主要可進入的建築要走得進大廳與穿堂、走得上樓梯與平台、在不同樓層移動、搭電梯、進開放的房間；NPC 在不同樓層活動；鏡頭、碰撞、找路、動畫要配合；玩家一定能離開、不會永久卡住（D36）。可以分階段開樓層，但**不能用不能走的裝飾樓梯冒充完成**；沒做好的房間用看得懂的方式關起來，不用隱形牆。
5. **人物**：7–8 頭身；每個主角與重要 NPC 有自己的五官、髮型、服裝；衣服輪廓自然、外觀符合個性與背景；走、跑、轉身、坐下、上下樓梯可靠，不穿模、不滑步、不漂浮。VRoid 樣本只是基礎，載入得了不等於最終模型；優先改臉型、髮型、衣服輪廓與動作，不是只改顏色。
6. **材質**：近景用 PBR（Base Color、Normal、Roughness，需要時 Metallic、AO），優先用 Poly Haven（CC0）。紅磚要有自然排列、接縫與表面；混凝土、花崗石不是單色平面；木材有紋理與粗糙度；玻璃有合理透明度與反射；金屬欄杆有光澤；柏油維持使用者指定的淺灰（D30）。不為了寫實破壞整體風格或手機效能。
7. **既有程序化資產**（`campuskit3d.js`、`townkit3d.js`、`world3d.js`…）不必全刪，逐項分類：①已達品質可保留 ②適合遠景／背景 ③碰撞、導航或 GLB 失敗時的備用 ④主要近景、必須升級 ⑤已被正式 GLB 取代、停止當預設畫面。清單與狀態：`docs/art-rebuild/ASSET_INVENTORY.md`。不重寫引擎，不破壞劇情、人物資料、存檔。
8. **視覺驗收（每次重大美術修改都要附）**：真實照片或美術參考、修改前遊戲截圖、修改後遊戲截圖（同角度、相近時間與光線）、Blender 渲染圖、GLB 與貼圖規格、手機模擬測試結果、實機還沒驗證的事、commit SHA、還沒達到參考品質的缺點。不准只用文字說「比較精緻」。驗收狀態：`BLOCKOUT` → `MODEL_READY` → `INTEGRATED` → `FUNCTIONAL_VERIFIED` → `READY_FOR_ART_REVIEW` → `ART_APPROVED`。**誰能標 `ART_APPROVED`（D59，2026-10-14 使用者批准）**：**角色美術**（角色參考圖／設定圖，以及 3D 人物和通過的參考圖是否一致）由 **BB** 驗收、可以標；**建築、場景等其他美術照舊只有使用者實際確認才能標**。角色的分工：BB 驗收參考圖；LAWWW2 依通過的參考圖調整 Blender／VRM 角色模型；LAWWW 把模型接進遊戲、負責效能、動畫與回歸測試。重大人物外觀變更、整體畫風、主要劇情、大量 CG 製作仍由使用者決定。
9. **效能不是粗糙美術的預設理由**：目標是精緻而有效率——重用模型與材質、Instancing、LOD、貼圖壓縮、幾何最佳化、分區載入、遠景簡化、光影分級。主要人物、關鍵建築、玩家常停留的近景是品質優先區；**還沒量測實際效能前，不得以手機效能為由把主要人物或建築退回方塊**。
10. **開工前先判斷製作工具**：新增建築、室內、人物、街景前先決定用什麼工具做，不得自行退回舊的低品質程序化方法。每次回報寫明：實際使用的建模工具、材質來源、整合情況、驗收狀態。
11. **目前劇情、角色設定、法律內容暫停修改**，優先完成美術與多樓層探索系統（2026-10-10）。**例外（2026-10-11，D50）：劇情企劃組的「大一上 v1」交接包經使用者批准進入實作**（`交接包_v1_大一上.md`＋`BB_95_交接包v1_大一上.md`，企劃分支），劇情保留隨時修改的權利；其餘劇情照舊暫停。實作只照交接包，LAWWW 不自己改寫劇情。**劇情修改分三級（D50）**：①潤飾、錯字、事件條件小修正——AA、BB 自行審稿，LAWWW 直接同步；②新增／調整一般日常事件——AA、BB 共識後照已批准的方向整合；③人物性格、重大關係、主線結局、已確定的關鍵事件——使用者確認後才能改（LAWWW 直接問使用者，不只憑轉述）。分不清就當第③級。

## 和使用者合作的規則（使用者在各輪明確要求過，持續有效）

1. **只用繁體中文**：對話、文件、遊戲內文字都是繁中。
2. **人物與故事全部原創虛構**；不得使用委託者本人的姓名、配偶、財務、私人經歷或其他可識別資訊。不直接影射或複製真實台大教授。
3. **誠實回報**：逐項標 `FIXED / PARTIAL / MISSING_EXTERNAL_ART / NOT FIXED`，不要把 PARTIAL 寫成 COMPLETED；分清楚「真機測試」和「桌機／Playwright 模擬」；沒測過就說沒測過。
4. **用實際截圖驗收**：做完看得到的改動就截圖檢查（手機直向／橫向）；截圖露出不合理的狀態要追查，不要裁掉。
5. **不准假修**：不關碰撞、不刪家具 collider、不每 frame 傳送玩家、不吞 exception、不能只測鍵盤或只測空白場景、「動畫有播」不等於「能移動」。
6. **手機優先**：觸控搖桿、點地移動、44px 以上按鈕、safe-area、直向／橫向；效能取捨時降低遠景與 NPC 數量，不把主要人物變醜。
7. **美術方向**：成人比例（7～8 頭身），日本青春校園日劇的 casting 與攝影感；**禁止 Q 版／chibi／高中制服／巨大眼睛**。不要用 CSS／SVG／Canvas／three.js primitive 畫正式人物；正式 2D 立繪由外部圖片 drop-in。沒有立繪的人物用 compact 對話模式，玩家版不准出現 `PLACEHOLDER_2D_PORTRAIT` 之類的 debug 標籤（只有 `?dev` 可以）。
8. **不要打磨 placeholder**：`LEVEL_BLOCKOUT`（方盒建築）與 `PLACEHOLDER_CHARACTER`（程序化人物）之後會被替換；不要再自己捏人或蓋更多方盒。
9. **五位女主角的正式資料不可自行更改**（名字、科系、年級、身高、星座）：沈以安（小安）19／166cm／法律一／處女座、林芷若 20／161／外文二／天秤、陳語彤 19／159／社會一／巨蟹、高子晴 20／169／資工二／水瓶、溫書瑀（溫學姊）21／172／法律三／雙子。她們有自己的人生，不是攻略對象；戀愛只是人生的一部分。
10. **法律題庫不可改答案、不可杜撰判決字號**；疑似因修法需更新的標 `LEGAL_REVIEW_REQUIRED`。法律內容要融入上課、同學討論、讀書會，不要做成 Quiz App。
11. **素材授權要記錄在 `LICENSES.md`**；只用 CC0／MIT／明確允許的資產。Seed-san（玩家模型）須標示「Seed-san by VirtualCast, Inc.」。
12. 不購買素材、不付款、不建立商店頁、不提交 Steam。
12a. **店名、品牌不侵權（2026-10-16 使用者，經 LAWWW2-B 轉述，D77；四個職位都適用）**：真實地點照查證畫（政大背景「要實際查、不要虛構」照舊有效），但**招牌上的店名改用諧音或另外想的替代名**（例：麥丹勞、魔司漢堡），不畫商標、不照抄品牌配色；劇情台詞提到店名也一樣。美術交付附「真實 → 遊戲名」對照表。
13. 不要重寫已經能運作的系統；不要為了 review 重整專案。
14. 使用者說「先修 X、不要做新功能」時，就只修 X，修好且測試通過才繼續。

## 即時回覆與持續開發（2026-10-10 使用者明確指定，最高優先互動規則）

此規則參考《Jill's Kitchen》的「互動模式與自主模式」，但以使用者本次最新要求為準：

1. **使用者每傳一則新訊息，立即先回覆**。不必等正在跑的測試、模擬、研究、建置、發布或程式修改結束；不可把訊息排隊到幾十分鐘後才一次回答。若答案尚未查明，先簡短說明已知、未知與接下來怎麼查。
2. **先回覆，不等於停止原本工作**。回應、處理新指令後，預設自動接續原本未完成的工作與待辦，不需要使用者再說「繼續」。不要因為聊天而放棄工作、遺失進度或擅自把原任務標成完成。
3. **新指令優先處理，但要分辨性質**：提問或討論就先回答，不代表取消正在做的開發；明確要求修改則先處理新要求，再回到原工作；若明確說「停止」「暫停」「先只做這個」，立即遵照，不得偷偷繼續被暫停的部分。
4. **回覆簡短交代四件事**：目前在做什麼、做到哪裡、對新訊息的直接回答或處理方式、接下來會繼續什麼。不要用冗長工程日誌代替回答。
5. **長工作不可阻塞互動**：能在背景安全執行的測試、模擬、建置放背景；若工具或平台不支援真正並行／背景執行，必須誠實說明限制，並盡可能分段執行與回報，不能假稱能即時接收訊息。
6. **保持任務連續性**：記錄正在進行的任務、已完成、下一步、阻礙；回覆新訊息後從中斷點接續。不要重做已完成工作，也不要因為使用者提出新問題而自行展開無關長任務。
7. **需等待決策的例外**：涉及劇情／角色 canon 衝突、可能破壞存檔的高風險操作、使用者明確要求先討論再動手的設計選擇，先問清楚；其餘既定工作照原規劃繼續。
8. **發布仍須確認**：commit、push、GitHub Pages 實際發布是三件事。使用者要求發布時，驗證線上版本確實包含新改動；不要只報「已 push」就說已發布。

## USER MESSAGE PRIORITY — 使用者即時訊息優先＋雙 AI 即時協作（2026-10-10 使用者訂定，永久，D40）

**使用者的時間優先於 AI 的工作流程便利性。**
1. 使用者在工作階段傳來新訊息時，先判斷是否需要立即回答。
2. 使用者說「先回答我」「先分配工作」「先確認這件事」「回覆之後再繼續」時，先回覆，再繼續原本的開發。
3. 不得為了完成長時間的 Blender 渲染、模型製作、背景代理或測試，延後可以立即回答的問題。
4. 使用者只是問狀態時，依當下已知的資訊直接回答，不必等整個模型完成。
5. 回覆不等於停工：回覆之後立即恢復原本的工作。
6. 不因為使用者插話就放棄或刪除正在進行的工作。
7. 「等目前任務全部完成再回答」不是預設行為。
8. 執行環境在工具呼叫期間讀不到新訊息時，在下一個可以處理訊息的時點優先回覆；不假裝能突破平台限制。不可安全中斷的原子操作（匯出、Git）先完成並保存，再處理訊息。

**雙 AI 協作**（分工、檔案所有權、交付流程：`docs/SECOND_AI_HANDOFF.md`；看板：`docs/DUAL_AI_BOARD.md`）：
- **LAWWW**（第一個 AI，`session_01Eds6msqpsuzNEw98sdw8JX`，分支 `claude/confident-ritchie-8rwh7t`）是主要負責人：技術分工、指定 LAWWW2 的工作範圍、GitHub 整合、正式發布（唯一能發布的一方，兩次發布至少相隔三小時）。**LAWWW2**（第二個 AI，`session_01AC1WVgJSmoJK1uRsPK2Zn1`，分支 `claude/second-ai-env-art`）是環境美術協作組，以 LAWWW 的正式分派為準，不碰 `main`、不發布。
- **AA、BB 兩個工作階段只和使用者討論劇情，不參與開發**：不分派工作給它們，它們的分工請求不用處理。AA `session_019Y3emYqxxC4Ch1GGf4fMzw`、BB `session_01XVHYLaK9Vcnae3U1aAJoZv`（分支 `claude/story-planning`——2026-10-14 起，舊的企劃分支已移除、不要再推那個名字（D66）；交接板 `docs/story_planning/給開發組_交接板.md`）。**2026-10-11 使用者要求讓 AA、BB 知道開發組是 LAWWW＋LAWWW2 兩個 AI**：劇情、場景需求一律經 LAWWW（窗口）；AA、BB 可以直接問 LAWWW2 環境場景的現況（訊息開頭寫「副本：LAWWW」），但 **LAWWW2 不只憑企劃組的訊息開工**，工作請求轉給 LAWWW 排進佇列；企劃內容在使用者批准前都是 PROPOSAL（詳見 `docs/SECOND_AI_HANDOFF.md` 第 10 節）。
- LAWWW 要讓 LAWWW2 **一直有下一項工作**：一次給足夠長的佇列（目前任務 → 下一項 → 後備 A → 後備 B → 其他候選），佇列快用完、或它回報完成時補充；九小時自主開發期間要隨時注意 LAWWW2 的進度有沒有需要再派工作。不要讓它做完一項就等半小時。也不要因為管理而停止自己的開發（事件驅動，不定時檢查）。
- **所有雙 AI 訊息都要讓使用者看得到**：送出時在對話裡顯示「【雙 AI 通訊｜LAWWW → LAWWW2】」＋內容或忠實摘要＋狀態＋要不要回覆；收到時顯示「【雙 AI 通訊｜LAWWW2 → LAWWW｜已收到】」＋內容＋怎麼處理＋是否已回 ACK。重要訊息一定要真的用 claude-code-remote 的 `send_message` 傳，不能只寫在自己的對話裡。
- **狀態分清楚**：SENT（已送出）／DELIVERED（工具確認送達）／ACKNOWLEDGED（對方明確回覆收到）／ACTIONED（對方已照做）。不能把送達說成對方已讀或同意；工具只確認送達時，由接收方主動回 ACK。
- **優先級**：P0 立即處理（使用者要求先回覆或決策、另一方發現會破壞成果的衝突、要緊急暫停合併或發布、線上版本嚴重錯誤）；P1 在最近的安全工作節點回覆（對方正式開工、分工與檔案所有權、交付可整合的成果、要改共用檔、發布前整合確認）；P2 一般進度可以累積再處理。不要重送同一則訊息催對方。
- 直接通訊不可用時，改用 `docs/DUAL_AI_BOARD.md`（push 到自己的分支）當備援通道，並寫明；不要因為通訊不通就停工。

## 使用者新訊息 P0 優先／必須確認／糾正後不得繼續舊任務（2026-10-14 使用者訂定，永久，D72；適用 LAWWW、LAWWW2、AA、BB，以及帳號 B 的 LAWWW-B、LAWWW2-B、AA-B、BB-B）

這一節是 LAWWW 補的施工細節。**以這份檔案最上面的「P0 使用者新訊息優先與期末考素材來源」為準**：那一節是使用者自己寫進來的，2026-10-14 `f6c836e`／`ace5d7e`。上面的「即時回覆」「USER MESSAGE PRIORITY」兩節照舊有效；和這一節衝突時，以最上面那一節、再來這一節為準。使用者指示的紀錄放在 `docs/USER_INSTRUCTION_LOG.md`。
1. **新訊息先看、先回覆**：
   - 使用者每傳一則訊息，在下一個可處理訊息的時點讀完整內容。
   - 在做下一段非緊急工作以前，先直接回覆：理解了什麼、哪些工作受影響、準備怎麼處理。
   - 不能因為正在寫文件、研究、寫程式、做法律審查或跑測試，就先忽略訊息、繼續原任務。
   - 不能只回「收到」就照舊做已經被推翻的事。
   - 新訊息修正先前決策時，立刻以較新的明確指示為準。
2. **優先級**：
   - P0：使用者最新的明確指示、停止命令、糾正、要求立即處理的事。
   - P1：使用者已確認的決策及其必要修正。
   - P2：使用者已授權、正在進行的工作。
   - P3：AA、BB、LAWWW 自己提出的企劃與待辦。
   - P4：自行延伸的研究、優化、額外功能。
   - P0 到來時，P2～P4 先讓位；P2 做到一半也一樣。
   - 使用者只是詢問、閒聊、問狀態時，不代表取消工作：先回答，再依指示決定要不要繼續。
3. **被糾正的工作不得偷偷繼續**（例如「不要自己出題」「我之前給過素材」「先不要做這個」）：
   1. 立刻停止那個方向的新工作。
   2. 記錄舊做法和新指示的差別。
   3. 既有成果可以保存（例如存成 `wip_backup/` 的 patch），但沒有使用者同意不能整合、擴充或當作已核准。
   4. 先改企劃與工作清單。
   5. 通知受影響的其他 AI。
   6. 確認新規則已同步，才恢復相容的工作。
   - 不能只在對話裡說「理解」，GitHub 文件、交接板和實際工作卻照舊。
4. **重要指示要留在 GitHub**（`docs/USER_INSTRUCTION_LOG.md`；企劃組寫自己的交接檔），每則寫：
   - 收到的日期時間、具體要求、取代哪一條舊規則；
   - 哪些工作停止、修改或保留；受影響的文件、程式與 AI；
   - 通知了誰、對方有沒有 ACK、commit SHA、實際完成情況。
   - 重要指示不能只存在某個對話視窗。
5. **互相通知**：
   - 使用者只告訴 AA、但影響 BB：AA 回覆使用者並同步給 BB；反過來也一樣。
   - 涉及程式就通知 LAWWW；涉及環境美術就由 LAWWW 通知 LAWWW2。
   - SENT、DELIVERED 不代表對方讀過，要對方回 ACK 才算確認收到。
   - 沒有 ACK 時，不能說其他 AI 已經照新指令開始工作。
6. **長工作與工具限制**：
   - 不能安全中斷的原子操作（匯出、Git、寫存檔）先做完收尾。
   - 平台在工具執行期間讀不到新訊息時，在下一個可處理訊息的時點優先看，不假裝能即時監控。
   - 長任務分段做，每段之間檢查新訊息和待處理通知；有 queued notifications 就先讀。
7. **固定回覆格式**（指令、糾正、停止命令、重大決策時用；閒聊不用；貼了格式就要真的做）：
   ```
   【新指示確認】
   收到的新指示：……
   對既有工作的影響：……
   立即停止或修改：……
   需要同步的 AI：……
   GitHub 紀錄狀態：待寫入／已寫入（附 SHA）
   接下來處理：……
   ```
8. **法律系期末考題庫（同一則指示的糾正，D73）**：
   - 期末考只能從使用者提供的素材出題，不准自己另編考題；法律正確不等於符合使用者指定的來源。
   - 使用者提供的素材：`src/data/legal_qbank.js`（刑訴 Q001–Q084）、`docs/story_planning/法律課堂素材庫_使用者提供.md`、`AA_101`、`AA_102`、`BB_102_課堂內容_*` 等。
   - 已經有標準答案的題目照用、保留答案與來源。
   - 案例或爭點改成選擇、是非題時，不改法律意義與答案；每一題都要能追溯到原始素材。
   - 沒有明確、唯一、可判分答案的素材標「待處理」，不補造答案。
   - AA、BB 自己寫的題目（AA 的 45 題、BB 原定的刑總、債總）標「待來源核對／未獲使用者確認」。來源核對完成、使用者確認前，**LAWWW 不整合進考試系統**。
   - 五題隨機抽考的制度照舊。

## 緊急保存規則（2026-10-11 使用者訂定，永久，D45；適用 LAWWW、LAWWW2、AA、BB）

使用者的 Claude 每週額度可能隨時用完、工作階段隨時中斷：**即使下一分鐘就停止，也要能從 GitHub 找回大部分做好的工作並無縫接續。**
1. **約每 30 分鐘、或每完成一個重要階段**檢查：哪些成果完成但沒 commit、哪些檔案在改、哪些只在本機（含本機分支、worktree、scratchpad）、Blender 原始檔／GLB／腳本／圖片／企劃有沒有保存、已討論完但沒寫進 GitHub 的決策或草稿、現在的工作能不能從 GitHub 恢復。有重要成果沒保存就立刻 checkpoint commit＋push。沒有真正的背景計時器——在每個可控制的工作節點檢查，不假裝定時；不中斷不能安全中斷的操作（匯出、Git、完整回歸跑到一半）。
2. **狀態分清楚**：`WORK_IN_PROGRESS`（還在做，可以保存、標 WIP）→ `CHECKPOINT_SAVED`（已 commit＋push，只是備份）→ `READY_FOR_REVIEW` → `APPROVED_FOR_INTEGRATION` → `RELEASED`／`ART_APPROVED`／`STORY_APPROVED`（後三者只有正式發布或使用者批准才成立）。**commit、push 只是保存，不是核准、不是發布。**
3. **權限不變**：LAWWW 照舊負責開發分支、整合、發布；**沒測完的功能不因額度快用完而搶著發布**；沒批准的劇情不寫進正式遊戲；LAWWW 不標 ART_APPROVED（角色美術由 BB 驗收，D59）。LAWWW2 只 push 自己的分支、不碰 main、不改 LAWWW 的檔案、不發布。AA、BB 只在自己的企劃分支保存，故事都標 `PROPOSAL`，保存企劃不代表可以叫 LAWWW／LAWWW2 實作。
4. **Git 安全**：確認分支與 worktree → `git status` → 只加這次要存、自己負責的檔案（**不要無條件 `git add .`**）→ 看得懂的 commit 訊息 → push 到自己的遠端分支 → 確認成功、記下 SHA → 確認原始素材真的被追蹤。不 force push、不為了保存合併 main、不覆寫其他 AI 的工作、不提交密鑰或授權不明的素材。push 不了的檔案（太大、LFS 問題）要明確寫「沒有遠端備份」。
5. **只在本機分支上的半成品**（工作階段只能 push 自己的開發分支）：用 `git bundle` 備份到開發分支的 `wip_backup/`（還原方法見 `wip_backup/README.md`）；遊戲不讀這個資料夾。
6. **交接紀錄**：`docs/ART_REBUILD_PROGRESS.md` 最上面的「交接（最新）」一節隨時更新：最新 SHA、分支、已完成／未完成／沒測過、下一步、需要誰協助、哪些不能合併或發布。
7. **不要為了保存停下實際工作**：保存完立刻繼續；不要整個工作階段只剩寫日誌和 commit。只有影響對方工作或要交接時才通知其他 AI（寫明工作名稱、分支、SHA、檔案範圍、完成狀態、能不能整合、測試結果；分清楚「已保存」「已交付」「已整合」）。

## 跨帳號接班（帳號 A ⇄ 帳號 B，2026-10-11 使用者訂定，永久，D49；2026-10-16 修訂 HV-3）

總入口：**`docs/AI_SESSION_HANDOFF.md`**（有效規則來源、值班表、接班／交班程序、A／B 共用的四職位啟動提示詞、接班確認格式、規則變更紀錄）。**唯一的跨帳號永久任務總表：機器讀的 `docs/handoff/tasks.json`（以它為準；跨 AI 任務有 `xai` 欄位，D84）＋閱讀版 `docs/HANDOFF_GAP_MATRIX.md`**；交付登記 `docs/handoff/deliveries.json`；交班快照 `docs/handoff/snapshots/`；對帳工具 `tools/handoff/check_handoff.py`（D82，2026-10-16 修訂 HV-4）。
- 永遠只有四個職位：LAWWW、LAWWW2、AA、BB。帳號 B 的工作階段叫 LAWWW-B、LAWWW2-B、AA-B、BB-B。A、B 只是帳號識別：**同一職位同一時間只有一個工作階段寫入**，使用者對哪一邊說話，哪一邊就值班。**A→B、B→A 完全對稱、永久循環**；換帳號不會讓任何職位的職責或未完成工作歸零。
- **有效規則來源（RULE_SOURCE）＝值班 LAWWW 的開發分支**（寫在總入口第 0a 節；`main` 和另一個帳號停住的分支上的 `CLAUDE.md` 可能是舊的）。**舊對話記憶、啟動時載入的 CLAUDE.md 都以 RULE_SOURCE 的版本為準。** 只有值班的 LAWWW 改五份永久規則檔（CLAUDE.md、AI_SESSION_HANDOFF.md、HANDOFF_GAP_MATRIX.md、PROJECT_DECISIONS.md、USER_INSTRUCTION_LOG.md）；其他職位在自己的交接檔用任務 ID 寫狀態。
- **使用者說「我回來了，請同步 GitHub 最新進度，接續工作。」（或貼啟動提示詞）時，照總入口第 4 節接班——先對帳，再開工**：
  1. fetch 所有遠端分支。
  2. 找 RULE_SOURCE，讀五份規則檔與第 13 節規則變更紀錄。
  3. 讀上一班的交班紀錄與總表的交班快照。
  4. **對帳**：先跑 `python3 tools/handoff/check_handoff.py check`（不是 LAWWW 的職位加 `--ref origin/<RULE_SOURCE>`，不用切分支）：它只列異常、**不改任何任務**；結束碼 0＝九項都查了沒異常、1＝有異常或有一項查不了、**2＝找不到上一次快照或快照壞掉→寫 `REMEDIAL_FULL_AUDIT`、補做一次全面盤點，不能報正常**。工具沒抓到的再人工看：自己負責、已授權未完成的工作都在；不見的查證（已驗收要有證據、取消要有授權），證明不了就恢復成待開工；沒核完寫 `AUDIT_PENDING`，不宣稱已全部核實。
  5. 合併（不 rebase、不 force push）、值班登記（含規則 SHA 與對帳結果）、push、核對遠端 SHA。
  6. 回報「接班確認」，接著做，不用使用者再說開工。
- **交班（「現在換班」）留下五樣**（總入口第 5 節；LAWWW 最後跑 `check_handoff.py snapshot` 存快照並 push）：本班成果（任務 ID、SHA、測試、整合與發布狀態）、**全部**未完成工作（不只最後一件；寫進總表交班快照或自己交接檔）、本班新增／修訂／廢止的永久規則（第 13 節）、跨 AI 協作狀態（SENT／DELIVERED／ACK／ACTIONED）、未完成的測試與已知問題。
- **任務不得無故消失**：只能是待開工、進行中、等待其他AI／素材、已實作待整合、已整合待測試、已驗收、暫停（寫原因）、取消／被取代（寫授權與替代 ID）。不能因優先級改變刪掉；「已寫企劃」「已提交程式」「模型完成」都不是已驗收。**平時增量更新（D82）**：收到交付就在 `deliveries.json` 登記一筆（對到任務 ID、SENT／DELIVERED／ACK／ACTIONED、未整合／已整合待測試／已驗收），新任務直接加進 `tasks.json`；工具只掃各交付分支 `scannedThrough` 以後的新 commit，所以接班不必每次全面重查。不要整天寫報告。
- 平時每完成重要階段就 push（D45）。來不及交班時，以遠端最後 push 的狀態為準，沒 push 的當作沒有。
- 只有值班中的 LAWWW 或 LAWWW-B 可以正式發布，三小時規則跨帳號照算；規則修改不需要、也不准為此合併遊戲內容到 `main`。
- **不傳訊息給已交班的另一個帳號（使用者 2026-10-15，D75）**：另一個帳號通常是每週用量到上限才交班；對它的工作階段 `send_message`（包括「測試訊息」「不用回覆」）會叫醒它、讓它又開始工作、消耗它的額度。**跨帳號一律只用 GitHub 文件交接**，不 `send_message`、不 `interrupt_session`、不替它排 `send_later`／排程。同一個帳號內、同一班都在值班的職位之間照舊可以用 `send_message`。

## AI 長期合作、溝通與開發工作規範（2026-10-09 使用者訂定，持續有效）

這一節補充上面的規則，**不取代**上面的安全、授權、法律題庫與測試規範。長期設計決策記在 `docs/PROJECT_DECISIONS.md`，目前工作進度記在 `docs/ART_REBUILD_PROGRESS.md`，回歸測試清單在 `docs/REGRESSION_CHECKLIST.md`，畫面驗收在 `docs/art-rebuild/VISUAL_REVIEW.md`。

**1. 角色分工。** AI 同時是技術負責人、共同遊戲設計師、美術實作與整合負責人、品質驗收與回歸測試負責人、專案文件維護者；**使用者是最終創作者與決策者**。
- 使用者決定：遊戲帶給玩家的感覺、角色是什麼樣的人、美術風格、故事走向、哪些系統保留、最終品質是否可接受。
- AI 自己負責：技術選型、程式架構、一般除錯、素材整合、回歸測試、GitHub 同步、技術文件、已核准方向內的細節實作。普通技術問題不要丟回給使用者決定。

**2. 對話。**
- 永遠用繁體中文（技術名詞可保留英文）。
- **先回答，再工作**：使用者問「做到哪裡／多久／接下來做什麼／會不會很醜」時，先直接回答，再繼續。
- 不要反覆要求確認已決定的事（清單見 `docs/PROJECT_DECISIONS.md`）；只有重大設計衝突、不可逆變更、付款、外部授權才詢問。
- 不要用技術成績（FPS、draw call、測試通過、模型載入、commit 數）取代玩家體驗；每次回報都要轉成「玩家會看到／感受到什麼不同」。
- 被批評時先找出具體原因與改法，不替現有設計辯護、不捨不得換掉自己寫的程式。
- 不討好、不虛報：做不到正式美術標準就直說。

**3. 長期記憶。** 重要決策寫進 `docs/PROJECT_DECISIONS.md`（內容、日期、原因、被否決的替代方案、什麼條件下才重新討論）。新指令與既有決策衝突時以使用者最新明確指示為準，並記錄變更；不私自改決策、不把未確認的想法寫成使用者決定。長期決策與短期進度分開。

**4. 角色是完整的人。** 每位核心角色的名字、年齡、科系年級、身高、臉型髮型、服裝識別、說話方式、個性、人際關係、日常行動、劇情、已發生的故事、與玩家的關係狀態必須一致；3D 外觀、ADV 立繪、角色資料、事件不能互相矛盾（例：沈以安不能因為找不到模型就變成貓耳雙馬尾；林芷若不能因為共用路人模型而失去咖啡廳、眼鏡、微捲髮的識別）。改事件前確認前置條件、已發生事件、與玩家及他人的關係、事件後的狀態變化；不能讓熟識的角色重新自我介紹。

**5. 不製造不合理的門檻。** 新增故事或互動條件前回答：故事上必要嗎？只是程式方便？玩家知道為什麼還不能觸發嗎？會形成過長的前置鏈嗎？錯過時間會永久卡住嗎？舊存檔能繼續嗎？條件服務故事，不是故事服務條件。

**6. 回歸影響（最高優先的工程規則）。** 每次修改評估是否影響：移動與鏡頭、地形與碰撞、NPC 導航、人物朝向與動畫、場景切換、日夜與天氣、劇情事件、對話、人物關係、存讀檔、舊存檔相容、手機觸控、直向／橫向 UI、法律題庫答案（清單與指令見 `docs/REGRESSION_CHECKLIST.md`）。不得以修 A 為理由破壞 B。每個修復說明：原本錯在哪、改了什麼、測試方法、結果、截圖、未測風險。**測試沒過不能改測試標準假裝成功**；Playwright 模擬不等於手機實機。

**7. 三種完成狀態分開。** A 技術完成（程式正常執行）／B 功能完成（玩家能用、和其他系統正確整合）／C 美術完成（畫面符合 Character Bible 與美術參考、已視覺驗收）。主要美術內容在使用者看過之前標 `READY_FOR_ART_REVIEW`，不自行宣稱最終美術已被接受（角色美術由 BB 驗收、可以標 `ART_APPROVED`，D59）；素材不足時標 `BLOCKED_BY_ART_ASSET` 並寫明需要什麼。

**8. 每輪都要能比較。** 重大視覺修改提供舊版／新版、相同角色或場景、盡量相同鏡頭與時間的實際遊戲渲染，整理在 `docs/art-rebuild/VISUAL_REVIEW.md`（直接嵌入圖片並說明差異與未達標處，不是只丟一個資料夾）。

**9. 對玩家的存檔負責。** 不任意改存檔格式；新欄位要有預設值；必要時寫遷移；用舊版存檔驗證；**不在標題畫面意外覆蓋進度**；新增角色或場景不能讓舊存檔讀不到；不可逆的存檔變更先備份並取得使用者確認；不能要求玩家重新開始。

**10. GitHub 能讓另一個 AI 無縫接手。** 使用目前的開發分支（原本是 `claude/friendly-brahmagupta-6bbkzc`＋PR #1；2026-10-10 起是 `claude/confident-ritchie-8rwh7t`，接手時先比對兩個分支，把較新的快轉進來，不要丟掉另一邊的 commit），有實質進展就 commit＋push，不碰 `main`、不 force push。（2026-10-10 起：PR #1 已合併；使用者要求發布時才把開發分支合併到 `main`，見 `docs/PROJECT_DECISIONS.md` D32。）進度文件寫明：正在做什麼、最近完成什麼、接下來做什麼、未解決問題、因素材或授權受阻的事、最新 commit SHA、測試結果、相關素材與截圖。重要決策不能只存在對話裡；不要讓未 push 的工作成為唯一版本；push 失敗要說明，不可宣稱已同步。

**11. 不要每做完一件小事就停。** 使用者已交辦、可安全繼續的工作，完成一個階段就接著做下一個（修存檔 → 人物美術 → 溫州街 → 光影 → 測試 → 同步）。但不能擅自：花錢買素材、改主要角色設定、合併到 `main`、刪除重要內容、做不可逆的資料修改、使用授權不明的資產。單一項目受阻就記錄原因、轉做其他不受阻的工作。工作階段或工具時間要結束時，先同步成果、寫下一步，誠實說明中斷，不宣稱能在沒有執行環境時繼續。

**12. 不要過度設計。** 先有完整自然的核心循環：起床 → 出門 → 走在校園／街道 → 上課或讀書 → 遇到同學 → 對話或互動 → 時間推進 → 回到日常。不為展示技術新增與核心循環無關的系統；技術設計簡單、穩定、可維護。

**13. 回報格式（有實質階段成果時）：** 目前正在做（一句話、玩家可感受的目標）／這次完成（可驗證成果）／實際效果（玩家會看到什麼不同）／測試結果（通過、失敗、未測分清楚）／仍有問題／GitHub（分支、commit SHA、截圖或比較報告）／接下來。不需要每五分鐘冗長報告，也不要長時間完全不更新。

**14. 最高原則。** 這不是技術展示或測試框架，而是讓玩家投入生活的遊戲：玩家在乎角色像不像真正的人、溫州街值不值得散步、和同學的關係是否自然、故事是否連貫、遊戲是否穩定、累積的進度會不會消失。程式碼是工具，玩家體驗才是目的。

## 目錄

```
index.html              開發版入口：UI DOM、CSS、script 載入順序、GAME.boot()（GitHub Pages 直接用這個）
src/                    遊戲程式（classic script、全域 IIFE 模組）
  engine3d.js             渲染、日夜光線、天氣、鏡頭、觸控輸入、NavGrid A*、碰撞、NPC 行為、LOD、分區載入
  zones3d.js              各區域：校園、公館、溫州街、教室、萬才館、總圖、咖啡廳、便利商店、麵店、書店、宿舍（含導航格）
  library3d.js            總圖大廳（library_hall：一樓大廳、帝國式大樓梯、電梯、二樓自習區；閱覽室的電梯與樓梯間，D43）
  dorm3d.js               男生宿舍（dorm_hall：一樓門廳、交誼廳、走廊、雙跑樓梯、二樓走廊與自己的房門 203，D44）
  world3d.js              LEVEL_BLOCKOUT 產生器（建築、貼圖、路燈、腳踏車、風動 shader）
  townkit3d.js            街道套件 TK（台北公寓、店面、兩點半 Café、日式老屋、電線桿、機車、行道樹、大王椰子、夜間發光材質）
  campuskit3d.js          校園建築套件 CK（台大風格：面磚／紅磚、拱窗、一樓拱廊、門廊、四坡屋頂、塔樓）
  people3d.js             PLACEHOLDER_CHARACTER 程序化人物
  assets3d.js             資產層：manifest、載入、fallback、VRM pool
  character3d.js          人物介面 CHAR.build/animate/setExpr；GLB driver（Mixamo 重定向 v2）、VRM driver
  game3d.js               遊戲層：狀態、HUD、對話、運鏡、座位、存檔、選單、搖桿、主迴圈、移動 telemetry
  story3d.js              第一二天劇情（程式碼）、日程生成、路人、talkCharacter
  events3d.js             條件事件引擎＋對話執行
  adv3d.js                ADV：背景、立繪解析、compact 模式、CG 登錄
  social3d.js             六維關係、記憶、揭露、教授紀錄、研究所志向
  legal3d.js              法律知識狀態機、誤解標籤、抽題、包裝成課堂／同學／讀書會
  audio3d.js              WebAudio 合成環境音
  data/characters.js      CHARACTERS、UNFAMILIAR_POOL、SOCIAL_GRAPH、PORTRAITS
  data/events.js          STORY_EVENTS（52 個）＋ SMALLTALK
  data/legal_qbank.js     刑訴題庫 Q001–Q084（使用者提供）
  data/portrait_manifest.js  自動產生（tools/gen_portrait_manifest.py）
  chars3d.js              已淘汰的 Q 版人物（未載入）
lib/                    three.js r187dev、GLTFLoader 等、three-vrm 的 classic-script 打包
assets/models/env/      CC0 環境模型；assets/models/char/ 玩家 VRM、小安 VRM、Mixamo 動畫、TEMP_PLAYER_DEV_MODEL
assets/models/*.glb     three.js 範例模型（只給 test_glb.html／test_rpm.html 實驗用）
assets/portraits/<id>/<outfit>/<expression>.webp   正式 2D 立繪（目前五女主 campus/neutral）
tests/                  p0_movement.py、movement_regression.py（Playwright，iPhone 模擬＋CDP 觸控）
tools/                  build 輔助、立繪切圖、VRM 改色縮圖、review zip；dev_scratch/ 開發時的除錯腳本；vrmbuild/ three-vrm 打包輸入
build/                  python3 build.py 的輸出（單檔版＋artifact 版＋.glb.json/.vrm.json）
docs/                   REVIEW_README（系統總覽 A–T）、REVIEW_NOTES（技術疑慮）、各 schema、CHARACTER_ART_SPEC、MISSING_EXTERNAL_ART
docs/history/           開發歷程、使用者每一輪的需求原文（specs/01–19）、實機回報截圖、v7 技術紀錄
legacy/                 早期 2D 版本與美術測試（不載入）
screenshots/            交付截圖；shots/ 過程截圖（297 張，依時間記錄每個階段）
```

## 執行、測試、建置、部署

```bash
# 開發伺服器（repo 根目錄；需要 http，file:// 載不到模型）
python3 -m http.server 8765
# → http://127.0.0.1:8765/            開發版（分檔）
# → http://127.0.0.1:8765/build/      單檔版（先 python3 build.py）

# URL 參數：?turbo（測試加速：瞬間走位、dt 上限）、?lowres（像素比 0.4）、?mdbg 或 ?debug（移動 telemetry 面板）、?dev（顯示 MISSING_PORTRAIT 標籤）

# 回歸測試（Playwright Python；iPhone 390×844、is_mobile、CDP 觸控按在 #joy 上；預設測 build/index.html）
python3 tests/p0_movement.py  http://127.0.0.1:8765/index.html
python3 tests/movement_regression.py http://127.0.0.1:8765/index.html   # A 宿舍／B 坐下起身／C ADV／D 存讀檔／E 各區域

# 建置：產生 build/index.html、build/artifact.html、build/assets/**（含 .glb.json/.vrm.json）、重掃立繪 manifest
python3 build.py

# 部署：push 到 main，GitHub Pages（Deploy from a branch → main / root）自動更新；根目錄有 .nojekyll

# 發布前必跑（docs/TESTING.md 第五節）：對乾淨 checkout（git worktree add --detach <dir> HEAD，在那裡開 server）跑
#   tests/deploy_check.py、tests/reachability_all.py、tests/flow_class_real.py、tests/minimap_direction.py、
#   tests/zone_transitions.py、tests/touch_flow_wenzhou.py、tests/p0_movement.py、tests/save_compat_v7.py
# 真實玩家流程（不用 turbo，慢）：tests/flow_class_real.py、tests/flow_main_day12.py（從標題開新遊戲的第一、二天主線）
# 共用工具 tests/playlib.py：手機觸控、點對話／選項／互動、搖桿、拖曳、截圖、[前置／捷徑] 標示
```

測試環境注意：
- 雲端沙盒的 Chromium 是 SwiftShader，只有 1–4 fps；用 `?turbo`，回歸測試要跑好幾分鐘，不要一次平行跑多個（CPU 搶不到會逾時）。
- Playwright 的 `page.evaluate` 若結果是 Promise／函式會等待或呼叫它：觸發事件用 `void EVENTS.run(...)`。
- Chromium 已預裝，不要跑 `playwright install`。
- 沙盒對外網路通常只允許 GitHub；Google Fonts 會失敗（遊戲有系統字型 fallback）。
- 存檔 localStorage key：`fatiao3d_auto`、`fatiao3d_slot_1..3`、`fatiao3d_backup`、`fatiao3d_settings`。

## 架構速覽

- `index.html` 依序載入 `lib/*` → `src/people3d.js` → `assets3d` → `character3d` → `world3d` → `engine3d` → `zones3d` → `audio3d` → `data/characters.js` → `data/portrait_manifest.js` → `data/legal_qbank.js` → `data/events.js` → `social3d` → `adv3d` → `legal3d` → `events3d` → `game3d` → `story3d` → `GAME.boot()`。全域：`THREE, THREE_JSM, THREE_VRM, P3, ASSETS, CHAR, W3, E3, Z3, A3, CHARACTERS, PORTRAITS, PORTRAIT_FILES, QBANK, STORY_EVENTS, SOCIAL, ADV, LEGAL, EVENTS, GAME, STORY`。
- **PlayerController 與 PlayerVisual 分離**：引擎只移動 `ent.obj`（controller）；模型掛在底下，動畫只動骨架（hips 只保留上下位移，原地走路，水平位移交給引擎）。換模型不能影響移動、碰撞、存檔。
- 人物建立順序：`CHAR.build(spec)` → VRM（spec.model）→ GLB → `spec.fallbackModel`（玩家的 TEMP_PLAYER_DEV_MODEL）→ 程序化 placeholder。VRM 載入超過 30 秒會先用 fallback。
- **同一個 `character_id` 綁定** 3D 模型、2D 立繪、名字、日程、關係、記憶、事件、存檔。legacy id（`an`、`zhe`、`sis`、`kai`、`yu`、`prof`）仍透過 alias 對到資料驅動人物，**尚未清理**。
- 導航：`E3.NavGrid` 0.5 m 格，各區域在 `zones3d.js` 手寫 `blockRect/blockOutside`；出生點落在阻擋格會 `E.unstick` 一次並 console.warn。**改區域幾何時要同步改導航格，並跑 `tests/p0_movement.py`**（v7 的 P0 就是兩者不同步）；加家具或改 `blockRect` 後也跑 `tools/dev_scratch/nav_islands.py`（比人窄的縫會留下「只有一點站得住」的小孤島，滑進去就出不來，v9.3 #31）。
- 存檔：`GM.snapshot()` 序列化整個 `G`；`validate()`＋`migrate()`（v1→v2）；匯出檔案／匯入前備份。

## 常見改動怎麼做

- **加正式立繪**：放 `assets/portraits/<character_id>/<outfit>/<expression>.webp`（透明背景、同構圖同頭部位置）→ `python3 build.py`（或 `python3 tools/gen_portrait_manifest.py`）。缺的表情自動 fallback 到同服裝 neutral。需求清單在 `docs/MISSING_EXTERNAL_ART.md`，規格在 `docs/CHARACTER_ART_SPEC.md`。
- **換／加 3D 人物（VRM）**：放 `assets/models/char/`，在 `ASSETS.manifest`（src/assets3d.js）加 `{url,type:'vrm',anims:'char.mixamo_clips',height,instances,hide?,source,license}`，在 `CHARACTERS[id].char3d.model` 指到它；授權寫進 `LICENSES.md`。必要時用 `tools/shrink_vrm.py` 縮貼圖。
- **加事件**：依 `docs/STORY_EVENT_SCHEMA.md` 加進 `src/data/events.js`；用 `tools/dev_scratch/evtest.py` 檢查觸發與鎖定解鎖。
- **加題目**：只能放使用者提供的題目與答案（`src/data/legal_qbank.js`）。

## 目前狀態（v9 WIP：3D 美術重建進行中）

- **3D 美術重建 v1 正在進行**（需求：`docs/history/specs/20_*`；即時進度：`docs/ART_REBUILD_PROGRESS.md`；畫面驗收：`docs/art-rebuild/VISUAL_REVIEW.md`）。
- **v9.4（2026-10-10 14:47 UTC 已發布，`6b9c0dc`）：多樓層＋Blender 正式模型**（需求：`docs/history/specs/21_*`、`22_*`；D36 分層導航方案 A、D37 霖澤館室內、D38 永久美術規範）。
  - 引擎：每層一張 `E3.NavGrid`（同尺寸、同原點）＋格子高度（`addSurf`：平台 `{y}`、斜面 `{axis,ya,yb}`；`tread/rise/low`＝畫面上一階一階的高度）；樓梯格子兩層共用、高度相同的地方可以換層；`gridPath` 是（層, 格）的 A*。人物有 `lv`、真的 `y`（`settleY` 用 `visualHeightAt`）；`E.nav` 永遠是玩家那一層。存檔 `pos.lv`、`pos.y`（舊存檔預設第 0 層）。**改任何導航或區域幾何要跑 `node tests/nav_levels_unit.js`、`node tests/nav_buildings_unit.js`**。
  - 霖澤館：穿堂可以走（0.9 m）；室內是 `linze` 區域（`src/building3d.js`、配置 `src/data/linze_layout.js`：大廳、雙跑樓梯、玻璃電梯、二樓迴廊、201 教室門；三樓以上整修中）；201 是階梯教室（`src/data/classroom_layout.js`，48 個座位都能坐）。
  - Blender（`/opt/blenv/bin/python tools/blender/<腳本>.py`；共用 `tools/blender/b3lib.py`；貼圖 Poly Haven CC0 在 `tools/blender/textures/`）：`linze_interior.py`、`classroom_201.py`、`linze_exterior.py` → `assets/models/env/*.glb`（`ASSETS` 的 `type:'building'`）。程序化版本留作導航與載入失敗的備用（D38 分類 ③）。遊戲沒有環境貼圖：金屬度上限 0.45（`b3lib.MAX_METAL`）。
  - 走樓梯腳步貼合：`character3d.js` 的 `footIK`（真實骨架、兩段式 IK）；`node tests/stairs_feet_unit.js` 量腳和踏面的距離。
- **萬才館第二階段（2026-10-11，D41；需求 21「萬才館的弧形大樓梯必須能讓玩家走上去」）**：校園有兩層導航格（`zones3d.js` 的 `wancaiStairs`：第 1 層只有萬才館大樓梯、樓梯頂端平台、弧形陽台）；大樓梯兩層共用，高度用 `CK.lawhall` 畫台階的同一組外緣（`ck.wancai.outl`：畫面一階一階 `vfn`、碰撞連續 `fn`）；陽台下的一樓入口照舊在地面那一層；二樓入口這一版關著（告示）。外觀是 Blender 模型（`tools/blender/wancai_exterior.py` → `assets/models/env/wancai_exterior.glb`，台階外緣用 `--check` 和遊戲比對）。戶外往下走樓梯時鏡頭俯角會加（`engine3d.js` 的 `C.pitchAdd`）。**改萬才館或校園導航要跑 `node tests/nav_buildings_unit.js`、`node tools/dev_scratch/kit_nav_check.js`、`tests/campus_layout_nav.py`、`tests/flow_wancai_stairs.py`、`tests/wancai_glb_integration.py`**；改 `CK.lawhall` 的萬才館台階要重新匯出 GLB（外緣不一致時 `--check` 會失敗）。
- **萬才館第三階段：室內兩層樓（2026-10-11，D42）**：`wancai` 區域搬到 `src/wancai3d.js`（配置 `src/data/wancai_layout.js`，Blender `tools/blender/wancai_interior.py` 讀同一份）。**一樓大廳的座標和 v9.3 完全相同**（柱子、沙發、圓桌、公告欄 `notice:'lawclub'`、出口 (0,6.6)、`story3d.js` 的劇情站位與 `CLUB_SPOTS`、`TA_SPOT`）；二樓 4.2 m：北側走廊、西側迴廊、西南門廳；西側直跑樓梯往南爬（第二跑＋最上一階兩層共用）、東側玻璃電梯（`B3.buildElevator`，3F 以上按不亮：要刷識別證）；平台上的二樓入口打開（從二樓的門出去回到平台，校園第 1 層）。房間門牌不用「201」（法服公告寫萬才館 201，社團目前在大廳聚會）。改萬才館室內要跑 `node tests/nav_buildings_unit.js`、`tests/flow_wancai_floors.py`、`tests/zone_transitions.py`、`tests/reachability_all.py`。
- **總圖第一階段：大廳＋二樓自習區（2026-10-11，D43；需求 21「圖書館可進入閱讀區、自習區」）**：校園的總圖門口進新區域 `library_hall`（`src/library3d.js`、配置 `src/data/library_layout.js`）：一樓大廳（門廳、閘門、服務台）＋帝國式中央大樓梯（中間一跑上到平台、兩側兩跑折返，三跑與平台兩層共用）＋電梯＋二樓自習區（長桌可以坐下讀書）。現有的閱覽室（`library`）是「3F 閱覽區」（劇情：「我看過你在三樓」），座標、座位、劇情不動，出口改成樓梯間（回到大廳二樓東側）、東側多一部電梯。電梯可以到**別的區域**的樓層（樓層資料 `zone`；`E.spawnHint` 讓新區域建好時車廂停在那一層、人在車廂裡；`GAME.enter` 的 `deferStory`／`noAutosave`）。小安「總圖的下午」（原文「二樓靠牆的長桌」）改成走到大廳二樓就開始（`story3d.js` 的 S.tick；舊存檔在閱覽室的照舊）。正式模型 `tools/blender/library_interior.py`（植物：室內樹＝葉片卡、大葉盆栽＝模型葉子，共用做法在 `tools/blender/plants.py`）；窗外的景是遊戲裡校園的畫面 `assets/models/env/library_view_*.webp`（`tools/shots/library_views.py` 重拍；改校園的總圖附近或椰林大道後可以重拍）。窗玻璃不能放進牆的淡出群組（`fadeWalls` 會把整組設成不透明）。**改總圖要跑 `node tests/nav_buildings_unit.js`、`tests/flow_library_floors.py`、`tests/flow_library_scene.py`**。
- **宿舍走廊（2026-10-11，D44；需求 21 第 3 點「宿舍可進入房間、走廊」）**：校園「回宿舍」進新區域 `dorm_hall`（`src/dorm3d.js`、配置 `src/data/dorm_layout.js`）：一樓門廳（舍監室窗口、信箱、公告）、交誼廳（沙發、電視、販賣機、長桌）、走廊、雙跑樓梯（A 跑 → 平台 1.8 m → B 跑，兩層共用）、二樓走廊；北側 203 是祐廷和阿凱的房間，進去就是現有的 `dorm` 區域（座標、劇情都不動，房間的出口改成「走出房間」→ 二樓走廊）。走廊兩側的牆是鏡頭碰撞（`E.colliders`）。正式模型 `tools/blender/dorm_hall.py`。**改宿舍要跑 `node tests/nav_buildings_unit.js`、`tests/flow_dorm_hall.py`**；導航格的邊界放在 0.2 的奇數倍（見 `dorm_layout.js` 開頭）。
- 沿路線移動（2026-10-11，`engine3d.js`）：最後一步只走到轉折點（`stepSp`）；換層（`switchLevel`）用人物所在那一層的**連續高度**比、容許值依步長放寬——跑步＋低幀率時一步 0.41 m，舊做法會在樓梯底來回跳、換不回地面那一層。`tests/nav_buildings_unit.js` 有跑步＋低幀率的上下樓梯檢查。
- 作息換到同一區的另一間（2026-10-14，`story3d.js` 的 `roomMove`）：作息寫了不同的 `room`、而且是坐著的動作（read、class、eat、sit）時，已經在場的人會起身，走到那一間的空位坐下，不瞬移。朋友已經在那一間，就坐同一張桌子；沒有空位就留在原地；走不到就坐回原來的位子。例：B4 演講散場後，以安、小語從博雅 101 走到大廳的圓桌。改這一段要跑 `node tests/schedule_roommove_unit.js`、`node tests/v2_c13_unit.js`、`tests/flow_b4_lecture.py`。
- 人物：玩家與所有 NPC 已改用 VRoid CC0 樣本改作的 VRM（`tools/vroid_build.py` → `assets/models/char/vroid_*.vrm`），不再出現程序化球體人；舊的 Seed-san／Twist sample／RPM 不再載入。六位核心角色正依 Character Bible 與美術參考圖逐一修正，**美術尚未經使用者驗收**。
- 溫州街：已用 `src/townkit3d.js` 重建成台北巷弄（原本是空柏油地＋方盒）；兩點半 Café 搬到東端路口（D22）；正在精修日式老屋、小公園與三個時段的光影。
- 校園（v9.3）：依使用者提供的臺大校總區平面圖重排（D23、D25）——大門 → 椰林大道 → 總圖；傅鐘＋行政大樓在大道南側、文學院正對面、校史館靠大門、醉月湖（湖心亭＋木棧道）、小椰林道；大王椰子與闊葉樹改成 `townkit3d.js` 程序化（`royalPalm`、`tree`）。霖澤館、宿舍、校門座標沒動（舊存檔與測試不受影響）；改校園要跑 `tests/campus_layout_nav.py`。v9.3 第六批起，行政大樓、文學院、校史館、總圖用 `src/campuskit3d.js`（`CK.hall`）蓋；建築的導航阻擋由套件回傳（`userData.ck.blocks`：建築本體＋拱廊柱子＋門廊），在 `zones3d.js` 的 `ckPlace` 轉成世界座標，鏡頭碰撞也在 `ckPlace` 加（本體＋拱廊上方樓層）；第七批起霖澤館、萬才館也是套件，一樓拱廊走得進去；第九批男一舍（沒有拱廊的版本）、社會科學院（`CK.modern` 現代白色系館）；第十批農業陳列館（`CK.pavilion`：圓洞鏤空牆）——校園已經沒有 `W3.building` 方盒，所有建築的導航阻擋與鏡頭碰撞都來自套件。
- 校園（v9.3 第十七～二十批，使用者 2026-10-09 提供椰林大道、霖澤館、萬才館照片並要求全面改造）：椰林大道中間 12 m 柏油路＋黃色虛線（照片）、大王椰子拉高到約 20 m、兩側大樹牆；大道兩側與舟山路補了沒有名字的系館、停車架、腳踏車。霖澤館、萬才館改用 `CK.lawhall`（D28）：霖澤館是穿過整棟的三層樓高穿堂（`entry:'portal'`）、萬才館是偏西的玻璃入口＋弧形大台階（`entry:'stairs'`、`annex`）；**台階、門廊、穿堂都不能走**（D26：沒有地形高度），入口互動點在台階下（`userData.ck.doorX/doorZ`）。法學院後面（建築背面到圍牆）不能走。地圖邊界外是走不到的背景（D27，`TK.bgCity`＋`zones3d.js` 的 campusBackdrop）：校門外照公館區域座標換算（公館 (gx,gz) → 校園 (x=-170-gz, z=gx)），改公館的店面或馬路時，校園這邊的背景要一起改。校園 `viewFar:260, fogNear:100`；**`engine3d.js` 的 applyTime 每幀設霧的距離，要用 `E.fogFar`**（第二十批之前一直被重設成畫質預設值，區域的 viewFar 沒生效）。遠景剪影（makeSkyline）在不透明那一輪、天空之後先畫，不能改回半透明（會蓋住 118 m 以外的建築）。改校園的空曠程度用 `tools/dev_scratch/view_audit.py`（360° 盤點）檢查。
- 公館（v9.3 第十一批）：南側店面街改用 `TK.apartment` 的連續騎樓（`ground.through`、`ground.pillars`），整個南側往馬路搬 30 m（店面立面 z=19、店門互動點 z=21、從店裡出來站在 z=18）；西端是往溫州街的巷口（轉角公寓＋路名牌）；校門那一側看得到校園（洞洞館側面、椰子樹）。改公館要跑 `tests/gongguan_layout_nav.py`；店門口座標和 `tests/p0_movement.py` 的「公館店門口」出生點要一起改。捷運出口（`TK.mrtExit`，第十二批）、校門（`CK.gate`，第十四批，校園與公館共用；`zones3d.js` 的 `placeGate` 轉換導航阻擋）已換新；第十六批換了傅鐘（`CK.bell()`，+z 是石碑那一面，用 `placeBlocks()` 把 `userData.gate.blocks` 轉成導航阻擋，`placeGate` 也用它）和路燈（`W3.lampPost()`：柱座、燈桿、燈臂、燈罩是一個共用幾何＋燈罩玻璃；燈頭位置 (0, 3.95, 0.75) 不能動，各區域的夜間光暈與地面光圈照這個位置加）。
- 室內（v9.3 第十五批）：`zones3d.js` 的 `room()` 有天花板（單面朝下：鏡頭超過天花板高度時看不到，維持剖面視角）和窗（`winWall` 選哪一面牆、`winXs` 位置、`curtains`；窗的零件掛在 `zone.winParts`，牆淡出時一起隱藏；19:24 以後換夜景貼圖）。便利商店的貨架是 `goodsWall`（導航和 `shelfWall` 相同）。
- 鏡頭：跟隨鏡頭只對建築碰撞；樹幹、電線桿擋住玩家時用「樹幹透視」（`engine3d.js`，shader 網點透空，只作用在 `userData.seeThrough` 的材質；`townkit3d.js` 的 `seeThru()` 標記）。改鏡頭要跑 `tests/see_through.py`。
- 太陽方位（v9.3 第二十一批，D29）：`engine3d.js` 的時段表 azimuth 是羅盤方位；戶外照 x 往東、-z 往北換算，區域座標轉過方向的在區域定義加 `sunYaw`（公館 `π/2`）；室內維持舊的方向。**新增戶外區域或改區域方向時要設 `sunYaw`**，不然中午的太陽會跑到北邊（v9.3 之前就是這樣：朝南的系館正面整天背光）。
- 柏油路（v9.3 第二十二批，D30）：照片的淺灰（`W3.asphaltTex`、`TK.asphaltTex`、`zones3d.js` 的 `avenueRoadTex`，底色約 #acacaa）。貼圖有 `userData.asphalt`，`engine3d.js` 會在入夜時把這些材質調暗；**新增柏油貼圖要加這個標記**，不然晚上整條路會發亮。
- 法學院區（v9.3 第二十四批，D31，使用者提供配置圖＋萬才館照片）：萬才館的入口互動點在陽台下的一樓入口 (93.8,-100.6)，從萬才館出來在 (93.8,-98.4)；正面的弧形量體、樓梯、平台、凸出量體不能走，陽台底下可以走。國青中心是兩館中間後方的背景（走不到），黑森林＋小水池在法學院廣場南邊。改 `CK.lawhall` 要跑 `node tools/dev_scratch/kit_nav_check.js`。
- 找路（v9.3 第二十五批，D35）：`E3.NavGrid.path` 先只走「人物（半徑 0.33 m）站得住」的格子（`clearMask`），找不到才退回舊的；拉直路線用 `losR`。**加家具、改 `blockRect` 後跑 `tests/reachability_all.py`**（全遊戲 103 個互動點用引擎真正的移動模擬走一遍；`--legacy` 切回舊找路）。測試用的掛勾：`E.simWalk`、`?navlegacy`、`GAME.walkFallbacks`（劇情自動走路卡住 4 秒遊戲時間就放到目的地的次數，真實流程測試要求 0）、`GAME.seatApproach`、`GAME.minimapArrow`。
- 小地圖（v9.3 第二十五批）：前方朝上的旋轉地圖，旋轉角＝鏡頭角度（`E.cam.yaw`，鏡頭在玩家的 (sin yaw, cos yaw) 那一側）；有「北」標示與玩家箭頭。改小地圖跑 `tests/minimap_direction.py`。
- 已修：教室同學朝向、VRM 0.x 朝向與坐姿軸向、標題畫面自動存檔覆蓋進度、標題「讀取」選單被蓋住、Café 座位擋住對話、直向小地圖蓋住選單、互動按鈕蓋住搖桿（細節見 ART_REBUILD_PROGRESS 的技術問題紀錄）。
- 等使用者決定：黃昏調色提案（`engine3d.js` 的 `KEY_GOLDEN`，網址加 `?grade=golden` 才用，預設不開；比較圖在 VISUAL_REVIEW 第 10 節）。使用者沒選之前不要改預設。
- 已知、暫不修：陳語彤領口中間的黑色小蝴蝶結（ART_REBUILD_PROGRESS #34：連帽上衣改的領口離胸口 5–6 cm；收緊領口會更醜，需要真的圓領 T 恤模型）。查人物畫面問題時，用 `tools/dev_scratch/outline_probe.py` 在遊戲裡「一次只改一樣東西」截圖，不要用猜的（同一個問題猜錯過兩次）。
- 跑回歸測試（尤其 `touch_flow_wenzhou`、`movement_regression`）時，不要同時跑其他瀏覽器工作：SwiftShader 搶不到 CPU，走路停的位置會變，曾因此誤判（#36）。
- VRM 彈簧骨（頭髮、馬尾）：`src/character3d.js` 的 `updateVRM` 在彈簧骨更新前先 `vrm.scene.updateWorldMatrix(true,true)`——three-vrm 用子骨頭的 matrixWorld 算骨長，少了這行，人物移動或低幀率時頭髮會被甩到耳朵高度（v9.3 技術問題 #25）。**不要拿掉**。開發時可以用 Node 載入 `lib/` 與 `src/` 模擬彈簧骨（不需要瀏覽器），做法見 ART_REBUILD_PROGRESS #25。

### v7 時的狀態與已知問題（保留供參考，部分已在 v9 改變）

- 移動：Playwright 模擬全部通過；**真機（iPhone）尚未確認**——使用者第一次實測回報的就是走不動，接手後第一件事可以請使用者在 Pages 版實測（設定 → 顯示移動除錯資訊）。
- 玩家模型 PARTIAL：Seed-san 改色，赤腳、七分褲、胸口徽章；需要有球鞋、後背包的台灣大學生男性 VRM。
- 2D：五女主只有 campus/neutral（約 250×880 px，偏軟）；表情、服裝、高解析度、所有 recurring NPC／教授的立繪都是 MISSING_EXTERNAL_ART。
- 3D：只有玩家與小安是 VRM（小安的 3D 是範例模型，白 T 黑短褲，和 2D 不一致）；其他人物都是程序化 placeholder；建築都是 LEVEL_BLOCKOUT。
- 未清理：legacy alias（an ↔ heroine_01 等）、三種人物來源並存、第一二天劇情寫在程式碼裡。
- 未完成：女主角中後期 arc、研究所 APPLYING 之後、考試與成績、學期結構、社團、打工、交換、實習（這些在 `legacy/v1_2d_life_sim` 的 2D 版有做過，可參考其資料與規則）。
- 授權疑慮：`assets/models/char/mixamo_clips.glb` 與 `assets/models/{Michelle,Soldier,Xbot}.glb` 來自 three.js 範例（Mixamo），Adobe 條款不允許單獨再散布動畫／角色檔；repo 公開，正式化前應換成可再散布的動畫。
- 更多：`docs/REVIEW_README.md` P–R 節、`docs/REVIEW_NOTES.md`。

## 第三方原始碼（不在 repo 內，需要時重新 clone）

| 用途 | 來源 | 當時 commit |
|---|---|---|
| three.js（lib/three*.bundle.js） | https://github.com/mrdoob/three.js | 1af6de5 |
| three-vrm（lib/three-vrm.bundle.js，見 tools/vrmbuild/） | https://github.com/pixiv/three-vrm | 1b4fc0c |
| Seed-san VRM 原檔 | https://github.com/vrm-c/vrm-specification（samples/Seed-san） | 821c11b |
| CC0 環境模型 | https://github.com/pmndrs/market-assets | c9cfa02 |
| Draco 解碼（tools/undraco.js，離線） | https://github.com/google/draco | 15bdb3a |
| 評估過未採用 | KenneyNL/Starter-Kit-3D-Platformer、Starter-Kit-City-Builder | 3fa8a04、4535092 |

## 歷史

- `docs/history/DEVELOPMENT_HISTORY.md`：六個階段、每輪需求與成果、方向轉變的原因。
- `docs/history/specs/`：使用者每一輪的需求原文（01–19，依時間排序）——想知道「使用者到底要什麼」時讀這裡，尤其 10、12、13、17、18、19。
- `docs/history/user_feedback_images/`：使用者 iPhone 實機回報截圖。
- `docs/history/v7_technical_log.md`：v7 的詳細技術紀錄。
- 早期 claude.ai artifact（私人連結）：2D 版 https://claude.ai/artifact/DUkDszzhBL1y8X5SC6fTAe 、3D 版 https://claude.ai/artifact/7dNiCVDiC5ohgi4CkigSiw （Version 8＝v7）。
