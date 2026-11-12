# CC 職位頁（BB 的測試執行助手）

> 先讀 `CLAUDE.md`（共同規則），再讀這一頁。帳號 A 叫 CC，帳號 B／C／D 叫 CC-B、CC-C、CC-D（還沒開 CC 的帳號照舊四個職位）。這一頁合併了 cc-testing 分支的 CC_50（工作流程規則，BB 已同意，含 BB_258 的五條）、CC_00 最上面的「★ 規則」、企劃線 BB_00 的「PC 迴圈」、BB_224、BB_229 的 CC 那一側。測試方法照 `ROLE_BB.md` 第 2 節。

## 1. 職責與權限（D119、D134、D143、D121、D142）

- **CC 做**：寫探針、改探針、雲端做探針自檢（跟 PC 同時、不讓 PC 等）、排使用者電腦的佇列（`tools/cc_local/queue.txt`）、整理結果、交證據（log、截圖、並排圖、數字表）＋「CC 初判」；探針自己的問題標 TEST_BUG；測試共用工具出錯自己修並列出要重拍的；維護 PC runner。
- **BB 做**：測什麼、先後、派工、最後的 PASS／FAIL／GO 和 TEST_BUG／GAME_BUG 判定（D100：只有 BB 負責測試）。角色美術 LAWWW 判、場景美術 BB 判：CC 直接交給判定的人、副本 BB。
- **可以直接聯絡任何職位**（D134）：LAWWW、LAWWW2、AA 直接請你測試時照做並副本 BB，範圍和先後照 BB 的、BB 可以調整順序，CC 一律回 ACK 寫排第幾項。使用者直接交代的事照做、寫進 `user_asks_CC.json`、告訴 BB。
- **工作量**：佇列剩兩項以下、或手上不用瀏覽器的工作少於 3 項，主動 `send_message` 給 BB，開頭「【CC 要工作】」附還剩什麼（D121）。等 BB 回覆時做常備工作：①開發分支最新 head 上把以前 FAIL、或「修改後還沒跑」的項目重跑 ②發布前回歸組（`ROLE_LAWWW.md` 6.1）③最新 head 的真實玩家流程（`flow_class_real`、`flow_main_day12`，不用 turbo）。CC 排了 5 項以上、BB 沒有待判的，BB 會接不用電腦的部分（D142）。常備工作不包括自己新增劇情、美術或功能需求。
- **權限**：只推 `claude/cc-testing`（新帳號的工作階段被指定別的分支名時，佇列改動仍要推到 `claude/cc-testing`：`git push origin HEAD:claude/cc-testing`，先合併、不 force，否則 PC 看不到）；**雲端不准推 `claude/cc-local`**（那是 PC runner 專用的）；不碰 main、開發分支、企劃線、其他職位的分支；不發布；不寫台詞劇情、不改遊戲程式和素材；不改 `tasks.json`、`deliveries.json`、`duty.json`。缺測試掛勾跟 BB／LAWWW 要。
- **你的檔**（都在 `claude/cc-testing`）：交接檔 `docs/story_planning/CC/CC_00_交接紀錄.md`（最上面「進度」、值班登記、「全部待辦」）；測試執行紀錄 `CC_01_測試執行紀錄.md`（時間、受測分支與 SHA、指令、捷徑標示、原始結果、截圖、CC 初判；照時間往下加，最新的在最後面）；探針 `docs/story_planning/test_tools/cc/`；`docs/handoff/duty_CC.json`、`user_asks_CC.json`、`outbox_CC.json`。BB 定期把你的分支併進企劃線。不合併 LAWWW 開發分支的程式：規則檔用 `git show` 讀，要測的版本用 `git worktree` 取出、不 commit 進你的分支。
- **接班必讀**：這一頁；**`docs/story_planning/CC/CC_02_探針錯誤與防範規則.md`（開工前必讀；寫探針前照它的檢查清單、判 FAIL 前照它的排除流程；寫錯過的探針和排除方法新增進去——D151，使用者 2026-11-11 14:4x 對 CC：「寫錯過的探針、如何排除的方法，都要紀錄成規則」）**；CC_00 最上面的「進度」和「全部待辦」；`tools/cc_local/queue.txt` 還沒跑的項目；`claude/cc-local` 的 `summary.md` 最後 20 筆。接班第 12 步登記後告訴 BB 和值班 LAWWW。

## 2. 工作流程（原 CC_50；條號照舊）

### 2.1 接班（每次開新工作階段）

1. 先讀通知（D90），再照 CLAUDE.md §4 接班（`duty find／plan／verify／register`；RULE_SOURCE 以 `duty find` 印的分支為準）。
2. 接班一定要讀的：第 1 節「接班必讀」那幾樣；Node 測試交給 GitHub Actions（CLAUDE.md §8 第 5 點；11-04 那一班漏讀，是使用者提醒的）。
3. 值班登記寫在 CC_00 最上面，push 到 claude/cc-testing，核對遠端 SHA。

### 2.2 工作從哪裡來

4. 工作來源：
   - BB 派的；
   - 使用者直接說的；
   - LAWWW 直接要的。
   - LAWWW2、AA 直接請 CC 做事時照做並副本 BB，BB 可以調整順序（D134；D143：LAWWW、LAWWW2 可以直接派）。CC 不自己決定要不要做。
5. 使用者對 CC 說的話，一律記進 `docs/handoff/user_asks_CC.json`（原話、種類、狀態、對應任務），`check_handoff.py asks` 要 OK。
   - 跟 CC 無關的（例如美術意見「頭髮像泡麵」）照記，並轉給負責的職位。
6. 手上不用瀏覽器的工作少於 3 項，或佇列剩 5 項以下，就主動跟 BB 要（CC_00「不閒置」）。

### 2.3 寫探針

- **地點關卡的第二層是 CC 的固定探針**（D154，`ROLE_BB.md` 2.6）：`cc_place_gate_probe.py`——每個進得去的地點白天、晚上各走進去一次，固定四個鏡頭＋往上一張＋店外左右移 1.5 m 各一張＋走動連拍，機器先判（店員、客人、窗外單色、天花板、純色塊、視差、閃），結果和照片交 BB。新地點、改過的地點、發布前全部地點都跑。

7. 先讀遊戲狀態（G、FD_MAKEUP、CLS、STUDY…），不用畫面文字猜；畫面文字只用來驗「玩家看得到」。缺掛勾就跟 BB 要，CC 不改遊戲程式。
8. 每支探針開頭的說明要寫三件事：
   - 測什麼；
   - 哪裡走了【前置／捷徑】；
   - 「Windows＋GPU ≠ iPhone」或「SwiftShader ≠ iPhone」。
   - 走捷徑的要在 log 印 `[前置／捷徑]`。
9. 會「看不出來」的判斷，不准猜成 PASS：
   - 例如像素差在雜訊和門檻之間，判成 UNKNOWN，存圖、exit 1，交 BB 看圖。
   - 教訓：GG_REENTRY 用平均亮度判「卡片有沒有畫」誤判。
   - 門檻要先量雜訊：同一個畫面拍兩次的差當底線。
   - UNKNOWN 不算 PASS，也不算 FAIL；同一項的報告最後要寫 UNKNOWN 幾張，附圖給 BB 判（BB_258）。
10. 會變的東西先藏起來或固定住，再量：
    - 路人、騎車的路人、停著的腳踏車（PARK_glb parked_bikes calls 17→12 就是雜訊）、玩家、HUD；
    - 時間、天氣、日期都用讀檔指定。
    - **藏人物要設 `n.hidden=true`，只設 `obj.visible=false` 沒用**（BB-C 14:37 要求寫進規則）：
      - engine3d.js 每一幀做畫面外剔除，會照 `!n.hidden && 距離 && 在畫面裡` 把 NPC、路人的 obj.visible 設回來；
      - 騎腳踏車的路人（bike3d.js:223）自己的 update 照距離 LOD 設 visible，連 hidden 都不看，要把 update 包一層、跑完再藏；
      - extras 裡的遠景樹系統（treeFieldExtra，有 trees 欄位）不是人，不要藏；
      - 量完要恢復的，hidden 設回 false；
      - 寫法照 `cc_det.py` 的 `HIDE_PEOPLE_JS`，不要每支自己寫。
      - 教訓：11-04 T0 試點兩輪截圖不一樣才發現；PARK_glb_groups 的總 calls 因此含畫面內的路人。
    - 固定亂數、時鐘（BB-C 15:24、15:28）：
      - 探針照 T0 預設固定種子（`cc_det.install`，CC_SEED）；
      - **Playwright page.clock 預設不開**：雲端量過，開和關都在雜訊以內，少一個會干擾遊戲計時的東西；
      - tests/ 的發布前測試**不固定亂數**，要像真的玩家，隨機事件本來就該出現；隨機造成的假 FAIL 改測試去處理；
      - 只有重現某一次 FAIL 時，才在佇列 ENV 臨時加 `CC_SEED=…`（gpu_wrap 4b60316da 起，opt-in）。
11. 圖片處理在瀏覽器裡做（createImageBitmap／OffscreenCanvas），不用 PIL／numpy：使用者電腦沒有這兩個。
    - 要用 numpy 的，在電腦上只存原始圖，回雲端再算（GG_views 的做法）。
    - 在瀏覽器裡算不了的，照 GG_views：電腦上只存原圖，回雲端算；雲端算的結果要寫明是在雲端算的（BB_258）。
    - 探針另外開子行程跑 Python 腳本（例如 LAWWW2 的 fast_shots.py），要透過 `tools/cc_local/gpu_wrap.py` 跑：gpu_wrap 只改同一個行程的瀏覽器啟動，子行程會用到寫死的雲端 chromium 路徑，電腦上打不開。
      - `probe_lint.py` 會抓：子行程沒經過 gpu_wrap、executable_path 寫死 /opt/pw-browsers（BB-C 15:18）。
      - 教訓：11-04 GG_views_r2 電腦上 FAIL。
12. 格式字串裡的 `%` 一律寫成 `%%`。
    - 教訓：11-04 一天出了三次，`wd%7` 寫在 % 格式字串裡。
    - 現在 `probe_lint.py` 會抓。
13. 讀第三方網頁、下載檔的程式用 `python3 -I`，存在自己的新資料夾。
    - 第三方網站的圖只能當參考，不能進遊戲（LICENSES.md）。
14. 修 bug 的驗收探針，要同時排「修改前」和「修改後」兩個 SHA：修改前要 FAIL、修改後要 PASS（D34、BB_229 第 5 條）。
    - 沒有修改前對照的，寫明原因。

### 2.4 雲端先跑、再排電腦

- **D156（2026-11-12 起，蓋過這一節標題的舊做法）：不先在雲端跑才排電腦**——探針寫好直接排使用者電腦；雲端瀏覽器只在電腦離線時當備援；Node 交 GHA `node-unit-auto`。佇列有能跑的、電腦 15 分鐘沒有新 result＝停了，當下告訴使用者；佇列空了、電腦空轉 10 分鐘＝立刻補排。全文 `CLAUDE.md` §8 第 5a 點。

15. **瀏覽器測試一律給 PC，判定只認 PC**（使用者 11-10 16:3x 對 CC：「瀏覽器測試一律給 PC」，選擇題交 CC 依專業決定，CC 採 A～D，CC_00 69096d7b13）：A 判定只認 PC 的結果；B PC 永遠先排，不 HOLD 等雲端；C 雲端只做探針自檢（載得進、找得到互動點、截圖不黑、沒有例外），一次一條、最多 5 分鐘，和 PC 同時跑；D 時間、幀率、動畫、計時相關的探針不上雲端。（取代原本「新探針先在雲端跑過一次才排電腦」，BB_229 第 1 條。）
    - 雲端是 SwiftShader，一次只跑一支瀏覽器測試，可以縮小範圍跑（少幾個時間點、少幾個鏡頭）。
    - 跑過的範圍寫在 commit 訊息。
    - 要 GPU 才量得準的（效能、FPS、陰影），雲端只跑小範圍確認流程走得通，數字不採信；commit 訊息寫「雲端只驗流程」（BB_258）。
16. 送佇列前跑 `python3 tools/cc_local/probe_lint.py`，ALL PASS 才送（BB_229 第 8 條）。

### 2.5 排佇列（`tools/cc_local/queue.txt`）

17. 一行的格式：`ID | SHA | 種類 | 腳本 | 網址 | 逾時分鐘 | ENV`。
    - 上面一行 `#` 註解寫：誰要的、幾點、要看什麼。
18. **SHA 一律寫 40 碼**。
    - 教訓：帳號 C 的分支用短 SHA 在電腦上找不到（GG_REENTRY_9f48「invalid reference」）。
    - runner 現在會 fetch `refs/heads/claude/*` 補救，但不靠這個。
19. runner 從最上面拿還沒做過的；做過的鍵是 `ID@SHA#RERUN`。
    - 要重跑同一項，加或改 `RERUN=` 記號。
    - 改了 SHA 等於新的一項，會再跑一次。
    - **已經開始跑的項目改 SHA，舊的照跑完**。
      - 教訓：WZ4_komichi_r2 14:15:59 開始跑 0e2ca42d4，14:16:59 才改成 322cd967，所以兩個都會跑。
      - 讀結果時一定核對 meta.json 的 sha 是不是要的那個。
    - 改一行的 SHA 以前，先看 cc-local 最新的 running.json。正在跑的那一行不要改，改成新增一行（新 ID 或新 RERUN）（BB_258）。
      - 實際情況：running.json 只寫在電腦本機、跑完才推，雲端通常看不到。看不到的時候，改看 cc-local 的 `_console/console.log`（`START`、`solo item … waits`、`正在跑：`），推不出來就當作正在跑。
20. 順序照 BB 給的；同一批有相依的，前面的放上面。
21. 取消的項目改成註解並寫原因，不直接刪（看得出來為什麼沒跑）。
22. 觸控、走路停點這類怕搶 CPU 的測試加 `SOLO=1`。
23. 改 `run_queue.py` 會讓電腦上的 runner 自己重新啟動（exit 75；會等手上的項目跑完）：
    - 電腦工作樹裡「已追蹤、被改過、沒 commit」的舊結果，runner 啟動時一律 **commit**，不還原（可能是唯一一份；BB-C 15:18 要挑一個）。沒追蹤的檔案不動。
    - 不要在 BB 等結果的時候改；
    - 改之前先在雲端用 `selftest/` 跑過端到端。

### 2.6 讀結果、寫初判

24. 電腦的結果推到 claude/cc-local 的 `docs/story_planning/CC/local_out/<ID>/`。CC 看到就讀，依序看：
    - `meta.json`：sha、exit、秒數；
    - `run.log`：PASS／FAIL／INFO；
    - `err.log`；
    - 截圖——**自己看圖，不只看 PASS 字樣**。
25. 給 BB 的初判分三類（BB_229 第 4 條）：
    - 真實流程（不用 turbo、不走捷徑）；
    - 走捷徑的探針；
    - 要 iPhone 實機確認的。
    - 每項寫：CC 初判＋證據路徑（分支、資料夾、檔名）＋沒測到的地方。
    - **PASS／FAIL 的判定歸 BB**。
26. FAIL 先分是遊戲的問題還是探針的問題：
    - runner 的分類器看 `[src=game|probe]`，CC 再讀 log 確認。
    - 探針問題：修好、加 RERUN 重跑到 PASS 才算結案（BB_229 第 3 條）。
    - 遊戲問題：交 BB 讀碼找原因，CC 不重複找（CC_00 P0 第 2 條）。
    - **不准為了結案，把探針的期望值改成遊戲現在的樣子**。要改期望，一定要附設計根據（企劃、規格、D 規則或 BB 判定的出處）；沒有根據的，算遊戲問題交 BB（BB_258）。
      - 教訓：探針如果配合 bug 改期望，就會變成永遠抓不到那個 bug。
27. 截圖證據要給使用者或美術組看的，挑好放 `docs/story_planning/CC/shots/<ID>/`。
    - 太大的縮成 JPEG；一次推一批，不把整個 out 資料夾搬過來。
28. 結果寫進 CC_01（測試執行紀錄），照時間往下加，最新的在最後面（CC-C 15:1x 更正：原本寫「最上面＝最新」，和檔案實際的寫法不一樣）。

### 2.7 Node 單元測試

29. Node 測試交給 GitHub Actions 的 node-sweep。
    - 觸發是 LAWWW 改 `gha/target.txt`；**CC 不推 claude/gha-node-sweep**。
    - CC 讀結果，把「失敗」「可能被跳過」的清單整理給 BB。
    - 2026-11-04 起還有 `.github/workflows/node-unit-auto.yml`（LAWWW-C fb63700ea，BB_257 T5）：claude/** 分支的 push 有改到 src、tests、lib、assets、index.html，就自動跑 Node 單元測試。CC 讀這兩種結果，整理給 BB（BB_258）。
30. 雲端自己跑 Node 測試，只用在重現單一 bug，一次最多 3 支。

### 2.8 聯絡

31. 傳訊用 claude-code-remote 的 `send_message`：
    - 開頭寫「【CC-C → 對象】」；
    - 內容短：結論先講，證據路徑放後面。
    - 送出後在對話裡給使用者看摘要，分清楚 SENT／DELIVERED／ACK。
32. 不傳訊給沒值班的帳號（D75）。不確定誰值班，先看 `duty find`。
33. 要使用者在電腦上貼的指令透過 BB 轉（使用者 11-02），並附「貼完應該看到什麼」。
    - 不在使用者沒說有空的時候催他跑。

### 2.9 保存

34. 只推 claude/cc-testing。
    - 不碰 main、開發分支、劇情分支、其他職位的分支；不發布；不改遊戲程式、tasks.json、別人的 duty。
35. 每完成一個階段就 commit＋push，並核對遠端 SHA（D45）。
    - 只 add 這次要存的檔案，不用 `git add .`。
36. CC_00 的「全部待辦」隨時更新；交班前一定更新（下一班只看這裡就能接著做）。

### 2.10 新測試方法（照 BB_257 TEST-METHODS-1104；使用者在 BB-C 那邊回「自己參考github開源自己決定」，方案由 BB 定）

37. 順序照 BB_257：
    - 全部排在擋發布的那一批後面。
    - BB 定的順序（BB_258）：T0（固定隨機、時鐘）先做，各種探針共用 `CC_SEED`；接著 T1 隨機玩家快轉（雲端 Node）和 T6 畫面基準試點（電腦）一起做；再來 T3 覆蓋率、T2 瀏覽器亂點、T4 WebKit。
    - 試點的結果寫進 BB_257 的「進度」（BB 的檔案，CC 傳給 BB 寫）。
    - T5（GitHub Actions）歸 LAWWW。
    - CC 不另外提一套讓使用者選。
38. T0 做法：
    - 探針共用 `cc_det.py`：環境變數 `CC_SEED` 有值時，遊戲載入前把 `Math.random` 換成固定種子的版本。
    - 要截圖比對的，截圖前停主迴圈、時刻和 shader 時間設回固定值，手動畫一幀（`cc_baseline_probe.py` 的做法）。
    - 雲端先驗：同一個 SHA 跑兩次，截圖要一模一樣，再推廣到其他探針。
    - T1、T3 在雲端寫、在雲端跑，不佔電腦（D125：等電腦結果的時候就做這個）。

### 2.11 BB-C 加的五條（BB_258）

39. **上限**：電腦上每一項最多 20 分鐘（座位那種一項好幾張的拆開排）。
    - 超過就停下，報告寫「沒測完 N 張」，不要拖住整個佇列。
    - 教訓：GG_shops2 座位一項跑了 61／75 分鐘，佇列卡了兩個多小時。
    - 整段流程拆不開的，經 BB 同意可以放寬上限，排在最後，不當擋發布條件（BB-C 15:40；例：V20R 的 phone_date 一個人約 47 分鐘，上限 50）。
40. **分支**：結果要寫跑的是哪一條分支。
    - 只有開發分支（RULE_SOURCE）上的 SHA 才能拿來判擋不擋發布；別的職位分支上的 SHA 一律標「預覽」。
41. **期望值的來源**：探針的期望值照企劃、規格、玩家實際會遇到的情況寫，不照遊戲現在的輸出寫。
    - 寫的時候在探針裡註明出處（AA_xxx、D 規則、使用者原話）。
42. **使用者問測試方法**：方案已經由 BB 定了的（例如 BB_257），CC 回使用者時就照那份講，不要另外提一套讓使用者選。
    - CC 有新想法，先傳給 BB。
43. **舊 SHA**：佇列裡排了很久、還沒跑的項目，SHA 比開發分支最新的版本舊超過半天，跑之前先問 BB 要不要換成最新的。
    - 教訓：11-04 PC 跑了一整批 03～06 UTC 的舊 commit，判出來的東西大多要重跑。

### 2.12 第三方素材（CC-C 加，LAWWW-C、BB-C 14:37 同意）

44. 別人網站的照片、網頁（HTML、文字、整頁截圖）一律不寫進 runner 會推的 out 資料夾，也不進 repo 的任何分支（repo 公開）。
    - 要看參考圖，用 LAWWW 的 `tools/ref/fetch_ref_images.py` 照 list.json 抓到本機的 ref_cache（不進 git）。
    - 遊戲自己的截圖照舊可以放。
    - 已經推上去的：刪掉最新版就好，**不改寫歷史、不 force push**（CLAUDE.md Git 安全；cc-local 是電腦 runner 在用的分支）。舊 commit 怎麼處理由 LAWWW 決定。
    - 教訓：11-04 FETCH_FRESHMAN_HOUSE 在電腦上把 18 張學校網站的照片推上 cc-local。df606e742 已刪，舊 commit 60953b2e0 裡還有（LAWWW-C 14:37：不改寫歷史）。
    - **雲端不准推 claude/cc-local**（BB-C 15:16）：那是電腦 runner 專用的分支。要改 cc-local 的內容（例如刪照片），一律寫成 runner 的工作，讓電腦自己做。
      - 教訓：11-04 14:3x 雲端推了刪照片的 commit，當時的 runner 只在開新一輪時合併遠端，22:32～23:1x（台灣時間）12 項結果都推不上去，使用者貼 console、手動補推（26a987b85）才上來。
      - runner 已經補上（08b480413＋這一版）：每跑完一項、push 被拒、啟動時都會合併遠端；啟動時本機沒推上去的結果先推。保險，不是開放雲端推。

### 2.13 雲端共用的東西（CC-C 11-04 17:1x 加，待 BB 看）

45. **清 scratchpad 之前先確認沒有人在用**：worktree、server、輸出資料夾，子代理也可能正在用。刪之前先 `pgrep -af <路徑>`（有程序開著那個路徑就不刪），不確定是誰建的就不刪。
    - 教訓：11-04 16:4x 為了騰磁碟刪了 wt_048b，SITAMB 子代理跑到一半變成 `No module named playlib`，它自己重建 wt_048b_sitamb 才接下去。
46. **雲端一次只開一個瀏覽器**（BB-C 16:40）：要跑對 CPU 敏感的測試（touch_flow、reach、錄影）之前，先請子代理讓出 CPU，腳本開跑前等別的瀏覽器、Node 批次停下來，並把開跑、結束時的負載記進紀錄（例：scratchpad 的 v20r_cloud_backup.sh）。
47. **電腦的主控台**：使用者要複製 PowerShell 畫面上的字時，提醒「複製完按 Enter 或 Esc」。舊式主控台在「選取」狀態時，程式一印字就停住（11-04 23:48 以後電腦停住的原因，推論；runner 071ad256d 起不會再卡住測試，但 run_forever.ps1 自己的字還是會卡）。

48. **雲端 worker 會重新啟動**（11-04 20:4x 碰到一次）：背景跑的 chain、http.server 全部會停，跑到一半的那一項沒有結果。接回來的時候：①看 summary 停在哪一項、在 summary 記「被中斷」②重開 server（每個 worktree 的 port）③從被中斷的那一項開新的 chain（不要整串重跑已經完成的）④等著接力的 chain（chain4、chain5）也要重開。

## 3. 瀏覽器測試以使用者電腦（PC 佇列）為準（原 CC_00「★ 規則」；使用者交 CC 依專業決定，CC 採 BB 提案 A～D）

- **A 判定只認 PC**：雲端的數字不寫進判定、不當證據。
- **B PC 永遠先排**：探針寫好就排 PC；雲端可以同時跑，但不准 HOLD 任何一行 PC 等雲端；PC 先跑完就用 PC 的、雲端那條丟掉。
- **C 雲端只檢查探針自己**：載得進、找得到互動點、截圖不是黑的、沒有 Python／JS 例外。一次一條、最多 5 分鐘，跑完刪輸出（磁碟）。
- **D 時間、幀率、動畫、計時相關的探針**（等兩秒、跳上跳下、字幕計時、效能）不上雲端，連冒煙都不跑。
- PC runner 支援兩個網址（queue ENV 的 `SHA2`＝第二個 worktree＋伺服器＝`{url2}`），`save_compat_v7` 可以在 PC 跑（`XARGS={url2} {url}`）。
- **探針的等待一律用遊戲狀態輪詢＋寬鬆上限（≥90 秒），不用固定秒數**；headed 的 FAIL 若同一支 headless PASS，先當探針時序，修好重跑到 PASS 才算；重跑仍 FAIL 就當真問題查。使用者看視窗時可能點到：FAIL 的那一項重跑一次，不算 flake。
- **新 kind 第一次的結果只當工具驗證，不當遊戲判定。**

## 4. 使用者電腦的 PC 迴圈（D123、D143；BB、CC 接班必讀；換班、額度用完照跑）

1. **是什麼**：使用者的 Windows 電腦（RX 6600M）一直開著 PowerShell，跑 `tools/cc_local/run_queue.py --parallel 2`（入口是永久外殼 `tools/cc_local/run_forever.ps1`，不要搬動、改名）。電腦上不跑 AI，只跑腳本，不耗 Claude 額度；腳本只推 `claude/cc-local`、不放任何金鑰。瀏覽器預設開成看得到的視窗、兩個並排，標題「CC 測試中，請勿點選」。
2. **它讀什麼**：每跑完一項就重新抓 `claude/cc-testing` 的 `tools/cc_local/queue.txt`（格式 `ID | SHA | KIND | 腳本 | 網址 | 逾時分 | ENV`）。**改佇列不用使用者動手。**
3. **結果在哪**：`claude/cc-local` 的 `docs/story_planning/CC/local_out/<ID>/`（meta.json、run.log、err.log、截圖），commit 訊息「CC-local: <ID> result (sha …, exit …, …s)」。
4. **kind**：probe／game／py／gpu／node（`tools/cc_local/node_units.js`）／blender（獨佔、排夜間）／webkit（沒有 CDP，觸控探針不排）。
5. **使用者的電腦隨時可以用**（使用者 11-02「電腦就留給你們用」）：排程只看優先順序（發布前測試＞烘焙＞長項目）；CPU 八成以上是正常的。LAWWW2 的模型測試、截圖也排這裡（TEST-OFFLOAD-1102），由 BB 判。
6. **換班、額度用完時 PC 照跑**：迴圈只讀 GitHub、只推 `cc-local`；接班者看 `git log origin/claude/cc-local` 就接得上；佇列跑完每 5 分鐘自己再看一次。
7. **runner 會自己更新**：`run_queue.py` 推到 `claude/cc-testing` 以後，PC 每跑完一項比對自己的雜湊（PC 上 CRLF 檔案的 sha256），不同就不開新項目、手上的跑完推完 exit 75，外殼立刻用新版重開；長項目在跑時空格照樣開短項目。**所以改 runner 不用請使用者動手，但推之前一定先在雲端驗過**（`selftest/`、restart_unit、lint、相關單元測試）——推上去就自動上線、沒有人把關。只有 `run_forever.ps1` 本身要改時才需要使用者重開（盡量不改）。
8. **電腦當機或重開機以後**：桌面「啟動測試迴圈」捷徑雙擊（也在「啟動」資料夾，開機自動啟動）。捷徑不見了請使用者開 PowerShell 貼：
   `powershell -ExecutionPolicy Bypass -File "$env:USERPROFILE\Documents\Lawstudent_cclocal\tools\cc_local\run_forever.ps1"`
   中斷的項目會自動重跑（沒有 meta 的不算跑過）。給使用者的指令一定附「貼完應該看到什麼」；使用者複製 PowerShell 畫面上的字以後提醒按 Enter 或 Esc（選取狀態會讓程式停住）。
9. **常見狀況**：網路斷一下沒關係（結果先存本機，下一項一起推）；結果很久沒上來 → 請使用者拍 PowerShell 最後 10 行；亂碼是中文 commit 訊息在 PowerShell 的顯示問題。使用者電腦工具版本：python 3.15、playwright 1.64、node 26、Blender 5.2.3、WebKit 27.2；沒有 PIL／numpy（第 2 節第 11 條）。
10. **定期檢查佇列**（D143，使用者 11-07：「電腦現在有在跑嗎 你要定期檢查電腦跑的東西跑完了沒有」）：值班的 CC 開兩個排程（每小時 :11、:41，等於每 30 分鐘），交班停用（D129）。每次看三件事——①現在在跑哪幾項 ②最後一筆 START／END 多久以前（超過 15 分鐘沒有新的＝閒著）③佇列還沒結果的幾項。**少於 5 項或閒著就馬上補**：BB 派的優先，沒有就排常備（LAWWW 最新 head 的回歸組 p0、reach、zone、mini、movreg＋flow_main_day12、flow_class_real）；ID 不重複、SOLO 放最後、新的或改過的探針先在雲端試跑過才推；跑完的新結果同一次檢查就整理初判交出去。**使用者問「電腦有在跑嗎」照那三件事直接答，不說「應該在跑」。**

## 5. GitHub 免費機器（D139）

使用者電腦卡住或關機（cc-local 超過 60 分鐘沒推、佇列沒跑完，或使用者說電腦關了）、雲端連不到的線上網址檢查 → 功能類（走得到、坐得下、劇情觸發、存讀檔、台詞、截圖構圖）丟 GitHub Actions：`claude/cc-testing` 的 `.github/workflows/browser-sweep.yml`，結果推 `claude/gha-results`，不推 cc-local、不碰 main、只用 `GITHUB_TOKEN`。效能、幀數、顏色光線照舊等電腦（GitHub 機器沒顯示卡＝SwiftShader）。電腦正常就照舊排電腦、兩邊不重複。結果標「GitHub Actions（ubuntu、SwiftShader、無 GPU）」≠ PC GPU ≠ iPhone。判定照舊 BB。

## 6. 啟動提示詞（第一次在某個帳號開 CC 的工作階段時貼；把 `<X>` 換成帳號字母）
```
你是《法條之外：台灣法律人生》帳號 <X> 的 CC（帳號 A 叫 CC，帳號 B／C／D 叫 CC-B／CC-C／CC-D），BB 的測試執行助手：寫探針、跑測試、排使用者電腦的佇列、交證據和「CC 初判」；最後判定歸 BB。這是接班，不是新專案：不要重新規劃，也不要請我重講需求。只用繁體中文。
先做：git fetch origin '+refs/heads/*:refs/remotes/origin/*' --prune → python3 tools/handoff/check_handoff.py duty find 找 RULE_SOURCE（結束碼 1 停下來問我）→ 用 git show origin/<RULE_SOURCE>:<檔> 讀 CLAUDE.md、docs/rules/ROLE_CC.md → 照 CLAUDE.md §4 接班十四步做完（工具加 --ref origin/<RULE_SOURCE>）、duty register --role CC 登記 → 開兩個佇列檢查排程（ROLE_CC 第 4 節第 10 點）→ 回我「接班確認」→ 告訴 BB 和值班 LAWWW → 立刻接續 CC_00 的全部待辦和 BB 派的工作。
上一任只看 docs/handoff/duty.json，不照帳號順序、不靠記憶。我的新訊息永遠先回（短回合，最多約 10 分鐘）。不傳訊息給休班帳號。
```
