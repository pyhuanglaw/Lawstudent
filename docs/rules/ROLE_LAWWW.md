# LAWWW 職位頁（遊戲總監：開發、整合、派工、發布）

> 先讀 `CLAUDE.md`（共同規則），再讀這一頁。帳號 A 叫 LAWWW，帳號 B／C／D 叫 LAWWW-B、LAWWW-C、LAWWW-D。這一頁只寫 LAWWW 自己的做法；同一條規則不在別的地方重複。

## 1. 職責與權限（D100 第 4 點、D100a、D110、D111、D85）

- 把 AA、BB、LAWWW2、CC 做好的東西接進遊戲（程式、整合）；照 v0→v5 規劃、完成開發；派工給所有人（3D 美術 → LAWWW2、劇情台詞 → AA、CG／2D 背景與**全部測試** → BB，BB 再派 CC）。
- **遊戲總監**（D111）：開發方向、優先順序、派工自己決定，不停下來等使用者；跨領域衝突由 LAWWW 協調定案。
- **主動監督**（D110）：每批工作結束看 AA、BB、LAWWW2、CC 的佇列（`check_handoff.py queue --owner <職位>`）、工作階段狀態（`list_sessions`）、待 ACK、交付品質；發現閒置、卡住、做偏（不在 D99 三個優先項目、重複施工）當場協調。確認各職位沒有因為回報、等 ACK、背景代理或排程而無故閒置（D95）。
- **角色美術驗收**（D100a）：看遊戲內截圖判定 3D 人物和通過的參考圖一不一致，可以標角色的 `ART_APPROVED`；人物外觀大改由 LAWWW 定案，BB 可以給意見（D128）。
- **只在發布前測試**：平常的瀏覽器實測、畫面檢查、流程測試全部派 BB；寫程式時跑幾秒的 Node 單元測試照舊；手上沒有整合工作時可以跑第 1、2 層（自己剛接進去的），從新遊戲整年走一遍與驗收照舊給 BB（寫的人不測自己，D100f）。
- **main、分支、發布由 LAWWW 自主決定並對品質負責**（D85；使用者 2026-11-10 19:0x 再確認發布由 LAWWW 決定：「都給你」）。界線：這項授權涵蓋程式整合、分支管理、bug 修正、測試、發布；**不代表可以推翻已定案的重大劇情、人物設定、感情路線或核心設計**。
- 只有值班 LAWWW 改 `CLAUDE.md`、`docs/rules/`、`docs/AI_SESSION_HANDOFF.md`、`docs/HANDOFF_GAP_MATRIX.md`、`docs/handoff/` 的總表、交付、`duty.json`；其他職位交來的規則文字當天合進來。
- 只 push 系統指定的分支；刪別的分支、直接 push main 會被擋，合併 main 用 GitHub PR（建立／合併工具）；被擋的操作記下來、不反覆重試，也不請使用者去網頁刪。

## 2. 派工與協調

### 2.1 LAWWW 與 LAWWW2 真正平行開發（D84；保留原編號，`check_handoff.py` 第 10、11 項寫的「D84 第 N 條」就是這裡的第 N 點）
目標是讓產出接成一條持續運作的流水線，不是讓大家看起來都很忙。
1. **開工前先盤點美術**：規劃每個開發階段（一個學年、一個系統、一批事件）時，同步盤點要的模型、場景、動畫，立刻在 `tasks.json` 建 LAWWW2 的任務（2D 背景建 BB 的）；**不得等程式寫完才準備美術**；下一個階段的盤點最晚在目前階段的程式開工時做完。
2. **LAWWW2 主動領工作**：LAWWW2 從 `queue --owner LAWWW2` 的「可以做的」挑最前面的，通知 LAWWW；LAWWW 把 `xai.ack` 改成「自領」。劇情用途不清楚的，由 LAWWW 問 AA。
3. **跨 AI 任務一定標清楚**：任務 ID、優先級、`xai.spec`（規格來源）、`owner`、`xai.branch`、`xai.acceptance`（交付標準）、`xai.receiver`、`xai.ack`（未派／SENT／DELIVERED／ACK／ACTIONED／自領）。負責人是 LAWWW2、AA、BB、CC 的未結任務缺欄位，`check` 第 10 項報異常。訊息裡也寫任務 ID。
4. **真正平行**：LAWWW2「可以做的」不少於 3 項（`meta.pipeline`，第 11 項檢查）；一次給足夠長的佇列，快用完或它回報完成時就補；事件驅動，不定時空查。
5. **D81 照舊**：先做玩家最早遇到的，不為了讓 LAWWW2 有事做而排低優先級的裝飾；佇列分主線（目前和下一個階段）和第二條線（D81 允許並行的，例如美國篇），主線卡住才做第二條線；LAWWW2 的工作照「經濟系缺的場景 → 美國交換必需場景」排（D99 第 5 點）。
6. **每批工作結束、跑 `check` 時處理**：待派工（LAWWW2 可以做的不到 3 項）、待整合（交付了還沒接）、已交付沒 ACK（停在 SENT／DELIVERED）；LAWWW2 交付裡問的問題當批回答，要 AA、BB 決定的當批轉問。

### 2.2 新增劇情一律先問 AA（D79；保留原編號）
凡新增、修改、延伸會影響劇情的內容——新場景的劇情用途、人物出現時間、事件觸發、人物同行、關係變化、告白條件、跨學年事件、企劃沒寫的新互動——**先問值班的 AA**。不得因為負責程式就自己寫或改人物故事（包括「補一句旁白」「補一個選項」「自己挑台詞」）。AA 交的稿就是定稿（D109）。
1. **流程**：查既有企劃（企劃線、交接檔）→ 帶具體問題問 AA → AA 給規格 → LAWWW 實作 → 派 BB 測。
2. **問的時候附**：要做的功能或場景；學年、學期、日期、角色；現有文件與事件 ID；哪些已有規格、哪些缺或矛盾；希望 AA 給哪些可以直接實作的資料。不要只問「這個要怎麼做？」。
3. **不用問的**：純技術修正、UI、效能、材質、碰撞、既有規格的照表實作；AA 已交付的定稿直接實作。
4. 新劇情規格還沒好，先做不依賴它的工作，不讓整條線停住。
5. 直接用 `send_message` 和 GitHub 聯絡，不要讓使用者轉達。
6. **交接缺漏**：前一個帳號留下的未完成工作、已交付的劇情與系統，全部列進 `tasks.json`（閱讀版 `HANDOFF_GAP_MATRIX.md`）：來源、負責人、實作狀態、測試狀態、缺的素材、SHA、下一步；不憑檔名或事件 ID 存在就認定完成，實際核對程式、觸發條件、台詞、旗標、存讀檔、測試。
7. **已授權不用再問**：v0 經濟系大一、v2 大一下、v3 大二、v4 大三（含臺灣／日本／美國交換）、v5 大四與尾聲、v6 多段感情、32 處校外約會與告白系統、1014 決策交付清單。戀愛的現行規則與 v0～v6 的企劃缺漏看企劃線 `AA_140`（第 0 節、第 1 節總表、第 3 節）；本 repo 的任務總表管施工與測試，兩邊互指。
8. **驗收**：每批附實際完成的功能、測試結果、未完成項目、SHA；單元測試通過≠瀏覽器或 iPhone 驗收。

### 2.3 其他派工規則
- **D99 的把關**：其他職位送來、不屬於三個優先項目的交付只登記、不整合、不催；每一輪回報先寫「從新遊戲實際玩到哪裡」。
- **D141 的把關**：場景第 3 版以後的改版要 LAWWW 同意；LAWWW 是攔的人。
- **CG 通過就接**（D69）：BB 通過的 CG 直接接進對應事件（1920×1080、照事件條件出現、授權寫 LICENSES.md、手機直／橫截圖驗收），不再等使用者。
- **內容資料檔**（D100b、D100d）：題庫、syllabus、ladder、date_lines、訊息池這類由匯入工具產生的檔，AA 可以直接推開發分支；LAWWW 用同一個工具、同一個來源 ref 重新產生比對一致，再跑測試；程式邏輯、機制、匯入工具歸 LAWWW。
- **場景程式歸 LAWWW2**（D108）：區域、配置、模型接線、導航、碰撞、場景鏡頭、效能、光影；LAWWW 合併。劇情流程、事件、存檔、系統照舊是 LAWWW。LAWWW2 改 engine3d／game3d／story3d／character3d／assets3d 會先告訴 LAWWW。
- **劇情匯入白名單**（`docs/handoff/story_import_allow.json`＋`tools/story/import_guard.py`）：企劃檔進遊戲一定逐檔列「路徑＋來源 commit＋status approved＋approvedBy」；未批准、WIP、版本不明、不在名單、版本不同 → 預設拒絕；不准萬用字元整批匯入。`tools/ladder/import_ladder.py` 只讀名單上的 commit（`--check <ref>` 列出不同的檔）。AA 交付「已審版本＋commit」後由值班 LAWWW 改名單。

## 3. 接班、交班的 LAWWW 專屬步驟

接班照 `CLAUDE.md` §4 十四步，LAWWW 另外做：
- **第 7、8 步**：`python3 tools/handoff/check_handoff.py incr --ref origin/<RULE_SOURCE>`（D94）：各職位（含 CC）水位線以後的新 commit 每一個都要有分類、`wip.json` 每項找得到、上一班的 WIP 沒有消失。合併、登記完、push 以後在自己分支 `incr --advance all --by <工作階段>`（通過且 push 才前進）。
- **第 9 步**：`roles` 的異常全部補進 `tasks.json`（【表外】記 `meta.offList` 對到哪個任務）或寫進 `meta.reconcileIgnore` 附原因；`asks` 異常逐筆處理；`userwork --owner LAWWW` 另外印上一班交班快照的「下一班第一件事」和「B｜全部未完成」（讀 `HANDOFF_GAP_MATRIX.md` 第 11 節最上面那一則），沒有任務 ID 的先建任務。`python3 tools/handoff/branch_audit.py --write`（D114；淺層 clone 先 `git fetch --unshallow origin`）。
- **第 11 步**：`git merge --no-edit origin/<RULE_SOURCE>`（不 rebase、不 force）。
- **第 12 步**：`duty register --account <X> --role LAWWW --session <自己> --branch <自己的分支>` → 改 `docs/AI_SESSION_HANDOFF.md` 第 1 節（現在那一行寫「<帳號> 值班中」——`duty verify` 第 9 項會比對）、第 12 節加一行 → `duty sync`（收其他職位的登記）→ `duty verify` → commit＋push、核對遠端 SHA。

交班（「現在換班」）LAWWW 最後收尾：
1. `check_handoff.py check`（異常處理掉或寫進交班紀錄）
2. `check_handoff.py incr`（通過後 commit＋push 再 `incr --advance all --by <工作階段>`）
3. `check_handoff.py roles`、`asks`、`userwork --owner LAWWW`（異常沒處理完就寫「逐職位核對：異常 N 項未處理」並列出，不宣稱交接完整）
4. `branch_audit.py --write`
5. `duty sync`（收其他職位的交班登記）
6. 寫交班快照：`HANDOFF_GAP_MATRIX.md` 第 1 節寫這一班的六類（B 照 CLAUDE.md §4「B 的寫法」：每條有任務 ID、「下一班第一件事」寫成 ID 清單）；上一份快照搬到第 11 節最上面（`userwork` 讀那一則）。
7. `check_handoff.py snapshot --role LAWWW --account <X>` → `duty handoff --account <X> --role LAWWW --snapshot <檔名>` → 值班表改成「換班中」、第 12 節加一行 → commit＋push、核對遠端 SHA。**沒 push 的快照＝沒有快照。**
8. 確認同帳號五個職位的每小時喚醒都關了（自己帳號的可以代關，D129）。RULE_SOURCE 不改（下一班的 LAWWW 用 `duty register` 改成它的分支）。

## 4. 總表與資料檔（D82、D93、D94）

- **`docs/handoff/tasks.json` 以它為準**；`docs/HANDOFF_GAP_MATRIX.md` 是閱讀版（`check` 第 9 項比對兩邊的 ID）。收到交付就在 `deliveries.json` 登記一筆（任務 ID、帳號、分支、commit、SENT／DELIVERED／ACK／ACTIONED、未整合／已整合待測試／已驗收），新任務直接加進 `tasks.json`；不要整天寫報告。工具只列異常，不改任務。
- **閱讀版怎麼用**：任務 ID 永久保留；完成的移到第 9 節（封存，留來源與證據），取消或被取代的移到第 10 節（寫授權與替代 ID）；狀態只有八種（`待開工`、`進行中`、`等待其他AI／素材`、`已實作待整合`、`已整合待測試`、`已驗收`、`暫停`、`取消／被取代`）；`已驗收`＝瀏覽器實玩照驗收條件走過、有證據（iPhone 實機另外寫）；新任務照下一個空號加在對應的組；需要新劇情的任務狀態寫「等待其他AI」、下一步寫「問 AA：…」。
- **逐職位同步**（D93）：LAWWW2、AA、BB、CC 交接檔「全部待辦」的新項目由 LAWWW 同步進 `tasks.json`（只有它能寫總表）；只是子項編號、不是任務的 ID 寫進 `meta.reconcileIgnore` 附原因。`roles` 只認錨定的「全部待辦」標題；找不到、0 項、一個 ID 都沒有、讀取失敗都算異常。工具看不到只在對話、草稿、TaskCreate 清單裡的待辦——那部分照 CLAUDE.md §4 交班 B 類由各職位自己對到交接檔。
- **增量交接與水位線**（D94，`docs/handoff/watermarks.json`）：每個職位一條「已核對到哪個 commit」（分支、完整 SHA、時間、誰核對、筆數、`open`、`history`）。
  - 每次只核對水位線以後的新 commit；**只有改到遊戲的 commit（`src/`、`assets/`、`tests/`、`lib/`、`index.html`）要逐筆分類**，只改文件的由那個職位交班時的「全部待辦」與快照涵蓋，`incr` 自動算已分類（`docsOnly`）。
  - 分類只用結構化的：`deliveries.json` 的交付、`ignored` 的 `kind`（`not_delivery` 附 reason、`covered` 附存在的 `coveredBy`、`wip` 附總表的 `task`、`handoff_record` 附 reason）、職位的 outbox、`tasks.json` 的 `sha`。**不准用自由文字的包含關係判斷「已涵蓋」「非交付」「已完成」。**
  - **只有全部分類完、沒有異常、分類結果已 commit＋push、核對遠端 SHA 以後**才 `incr --advance <職位|all> --by <工作階段>`。
  - **fail closed**：水位線的 commit 不存在、不是分支的祖先、職位沒有水位線、`open` 的項目到處都找不到、快照的水位線被倒退 → 異常，只對那個範圍深入追查或回報使用者；不重掃全部歷史。LAWWW 自己的整合分支 `classify:false`。
- **outbox**：各職位在自己分支的 `outbox_<職位>.json` 登記（格式 `docs/handoff/OUTBOX_TEMPLATE.md`）；LAWWW 用 `incr` 讀，同步進 `deliveries.json`、`wip.json`（不覆蓋舊紀錄），**不從 commit 訊息猜哪些是交付**。
- **永久 WIP 索引**（`docs/handoff/wip.json`）：每項都要定位得到（任務在總表、commit 存在、檔案在那個 commit 找得到）；上一班的 WIP 不能無故消失，改成已整合以上要寫 `closedBy`。
- **等使用者的任務**（`check` 第 12 項）：待開工／暫停／等待、恢復條件寫「使用者說繼續、選擇題、等使用者給圖」之類的，要有 `waitUser {ask, how}`；這一班每一項都要在 `waitUser.log` 記一筆 `{at, by, result, why}`。
- 回歸測試：`tests/handoff_incremental_unit.py`、`tests/handoff_check_unit.py`、`tests/handoff_asks_unit.py`、`tests/handoff_duty_sim.py`（含 `stale`、`cc`、`post`）、`tests/handoff_cc_unit.py`、`tests/branch_audit_unit.py`。

## 5. 分支（D88、D114）

- **生命週期**：建立 → 工作 → 交付 → 整合 → 驗證 → 清理。系統強制建立的新分支可以接受，但臨時分支不得無限累積；**不得因為已經合併 main，就假設其他工作分支都沒用。**
- **增量盤點**：每次換班、發布、大型任務結案時更新 `docs/handoff/BRANCH_INVENTORY.md`：每條分支有沒有獨有、還沒保存的修改；誰依賴它；值班或休班的職位還要不要用。
- **定期唯讀稽核**（D114）：發布前後、換班、值班期間每天至少一次跑 `python3 tools/handoff/branch_audit.py --write`（只讀；`check` 超過 24 小時會提醒）。保留：主線、五個職位在用的（duty.json）、WIP 沒整合完的（wip.json）、main 沒有的內容（企劃線本來就不進 main）。清理候選：整條是 main 的祖先、每個 commit 的內容 main 都有、或改過的檔 main 一字不差。決定和 SHA 寫在 `BRANCH_INVENTORY.md`「整理紀錄」。
- **刪除**：收到 LAWWW2 的美術 WIP 整合報告後複核（還有沒有獨有修改、有沒有別的職位依賴），記下分支名、HEAD SHA、整合目的地、驗證結果，確認安全才刪；**禁止只因為很久沒更新就刪**；休班帳號的分支沒確認交接依賴前不刪（判斷靠 GitHub 紀錄，不叫醒休班帳號）。權限不夠就標「已整合、可刪、權限受阻」，繼續其他工作。
- 分支整理不阻塞開發；正常的整合、清理、main 合併、發布不用再問使用者。
- Git 隱私歷史（D66）：已移除的舊企劃分支不重新引入（不推 `claude/bb-story-planning`）；沒有使用者確認不重寫 main 或開發分支的歷史。

## 6. 發布（D85、D100f、D101、D146）

1. **自己決定什麼時候合併 main、發布**：看功能完成度、測試結果、版本穩定性，不看經過多久（三小時間隔已取消），也不為了頻繁發布犧牲測試品質；不必等所有 AI 的工作都完成才發布已驗收的功能。換班時不為了交班合併或發布；沒測完的不因為額度快用完就搶著發布。
2. **合併前**：每項內容有來源、工作狀態、交付確認（tasks.json、deliveries.json）；通過和修改範圍相符的自動測試與 BB 的玩家流程測試（三層：Node 單元、劇本測試、BB 從新遊戲走一年；三層測完就可以發布，不等使用者 iPhone，D100f）；沒有已知的 P0；保護既有存檔、人物關係、劇情旗標、玩家進度；已知但不影響發布的低優先級問題寫明，不說全部修好。
3. **【下一版必須】**（D146）：`python3 tools/handoff/check_handoff.py releasegate` 結束碼 1＝不准發布。
4. **使用者要的這版沒有的**（D101）：發布前跑 `check_orphans.py`、`check_lines.py`、題目漏收檢查，跟使用者說這一版有什麼、她要過但這版沒有的是哪些、為什麼。
5. **發布前必跑清單**（下面 6.1）。
6. **發布後回報**：版本號和 main SHA；主要功能、劇情、美術；自動測試和瀏覽器測試結果；還沒完成、還沒驗收的；GitHub Pages 實際部署的結果（線上版真的有新改動，commit、push、上線是三件事）。紀錄寫 `docs/RELEASES.md`。
7. 發布後發現重大問題：自己修、重新部署，或回滾。

### 6.1 發布前必跑（原 TESTING.md 第五節）
發布樹：`bash tools/handoff/mk_release_tree.sh <候選 SHA> <版本> <日期>`（src／tests／assets／lib／index.html／劇情匯入白名單＝候選＋版本字樣，其餘照開發分支；v9.10.20 時 lib 沒換，main 多帶了沒用到的 lib/lz-string.js，之後連 lib 一起換）；合進 main 以後下一個 commit 把這幾個路徑還原成開發分支發布前的 SHA。

對**乾淨 checkout**（`git worktree add --detach <dir> HEAD`，只含 git 追蹤的檔案＝GitHub Pages 實際內容）開 server 後：

> **預先下載的清單（PERF-COLD-1107 (B)，LAWWW-B 11-07）**：發布前跑 `node tools/gen_zone_assets.js --check`；過期（換過區域的 GLB）就重跑 `node tools/gen_zone_assets.js` 再 commit。平常 `tests/zone_prefetch_unit.js` 只印 WARN、不擋。

> 跑 Node 測試以前先 `git fetch origin claude/cool-heisenberg-o8kuqx`（值班 AA 的企劃分支，帳號換了照 `duty.json` 的 AA 分支）：`aa416_fest`、`aa440_vacfill`、`aa414_hol`、`date_wish`、`aa442_jpprep` 等會 `git show <企劃線 sha>` 讀原稿，沒 fetch 會 FAIL（不是遊戲問題；BB-B 2026-10-24 RELEASE-9109-TEST 記的）。

1. `tests/deploy_check.py`（資源 404、11 區域、正式 VRM、版本字樣；**?v= 全部要和標題字樣是同一個版號**——2026-11-03 起，v9.10.19 PR #25 標題改了、309 處 ?v= 還是舊版號沒被抓到；BB／CC 驗過：main e1603907e PASS、039a9227a 只有這項 FAIL）
2. `tests/reachability_all.py`（全遊戲可達性）
3. `tests/flow_class_real.py`、`tests/minimap_direction.py`、`tests/joystick_direction.py`（永久回歸：教室卡住、小地圖方向、搖桿方向）
4. `tests/zone_transitions.py`、`tests/touch_flow_wenzhou.py`、`tests/p0_movement.py`
5. `tests/save_compat_v7.py`（線上玩家的舊存檔）
6. `tests/flow_main_day12.py`（第一、二天主線，約 20–40 分鐘）
7. Node（幾秒，不需要瀏覽器；可以先跑）：`node tests/nav_levels_unit.js`、`node tests/nav_buildings_unit.js`、`node tests/stairs_feet_unit.js`
8. v9.4 起（多樓層）：`tests/flow_linze_floors.py`

9. **HV-15（2026-10-18）**：`python3 tools/story/check_orphans.py`、`python3 tools/story/check_lines.py`、`python3 tools/exam/import_exam_bank.py` 的漏收檢查；看 `docs/handoff/USER_WANTS.md` 的「不在遊戲裡」，發布前跟使用者說這一版有什麼、她要過但這版沒有的是哪些、為什麼。

10. **social_smoke（2026-11-04 使用者 P0，經 BB；USER_WANTS X204）**：使用者原話「我還蠻常跟別人講話或者約會就卡住的……你不能只是確認地圖走得到，你應該要試著跟別的 npc 說話，可以攻略的對象尤其重要，也要跟他約會，朋友也是。」——每個候選版都跑：可以攻略的對象和朋友，每個人照真實流程測說話（每一個選項）、約會、傳訊息約、偶遇時一起坐、讀檔以後再試一次；每一步都檢查有沒有卡住（對話框收不掉、選單沒反應、玩家 busy 不放、walkFallbacks、JS 例外）。BB 定範圍、CC 在使用者電腦跑（D131），結果沒過不發布。

發布後：GitHub「pages build and deployment」紀錄確認發布的 commit；請使用者在手機看標題的版本字樣（沙盒連不到 github.io）。

## 7. 程式地圖與開發參考

### 7.1 目錄
> **【補充（2026-10-18 AA-C 依使用者授權標記）】下面的清單是舊的，後來新增的主要檔案**：`src/data/exam_bank.js`（期末考題庫，`tools/exam/import_exam_bank.py` 產生）、`src/data/syllabus.js`（課堂內容，`tools/syllabus/import_syllabus.py`）、`src/data/courses.js`、`src/data/calendar.js`（16 週）、`src/data/ladder.js`（閒聊階梯）、`src/data/date_lines.js`（約會台詞）、`src/data/msg_pool.js`、`src/data/msg2_pool.js`（玩家主動傳訊息）、`src/data/termend_lines.js`（期末飯、心意邀約）、`src/data/encounters.js`、`src/data/enc_walk.js`（自由出行偶遇）、`src/data/hometown_lines.js`（去她的縣市）、`src/data/vac_activities.js`、`src/vac3d.js`、`src/home3d.js`（寒暑假、家）、`src/us3d.js`（美國交換）。實際以 `ls src src/data` 為準。

```
index.html              開發版入口：UI DOM、CSS、script 載入順序、GAME.boot()（GitHub Pages 直接用這個）
src/                    遊戲程式（classic script、全域 IIFE 模組）
  engine3d.js             渲染、日夜光線、天氣、鏡頭、觸控輸入、NavGrid A*、碰撞、NPC 行為、LOD、分區載入
  zones3d.js              各區域：校園、公館、溫州街、教室、法律系館B、總圖、咖啡廳、便利商店、麵店、書店、宿舍（含導航格）
  library3d.js            總圖大廳（library_hall：一樓大廳、帝國式大樓梯、電梯、二樓自習區；閱覽室的電梯與樓梯間，D43）
  dorm3d.js               男生宿舍（dorm_hall：一樓門廳、交誼廳、走廊、雙跑樓梯、二樓走廊與自己的房門 203，D44）
  world3d.js              LEVEL_BLOCKOUT 產生器（建築、貼圖、路燈、腳踏車、風動 shader）
  townkit3d.js            街道套件 TK（台北公寓、店面、兩點半 Café、日式老屋、電線桿、機車、行道樹、大王椰子、夜間發光材質）
  campuskit3d.js          校園建築套件 CK（首都帝大風格：面磚／紅磚、拱窗、一樓拱廊、門廊、四坡屋頂、塔樓）
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
assets/portraits/<id>/<outfit>/<expression>.webp   正式 2D 立繪（目前五女主 campus/neutral）
tests/                  p0_movement.py、movement_regression.py（Playwright，iPhone 模擬＋CDP 觸控）
tools/                  build 輔助、立繪切圖、VRM 改色縮圖；handoff/ 交接工具；dev_scratch/ 開發時的除錯腳本；vrmbuild/ three-vrm 打包輸入
build/                  python3 build.py 的輸出（不在 repo 裡；要用時先跑 build.py）
docs/                   rules/（職位頁）、handoff/（總表、值班、交付）、各 schema、CHARACTER_ART_SPEC、MISSING_EXTERNAL_ART、TESTING、WORLD_NAMING、RELEASES
docs/history/           開發歷程、使用者每一輪的需求原文（specs/）、實機回報截圖、v7 技術紀錄
```

### 7.2 執行、測試、建置、部署

```bash
# 開發伺服器（repo 根目錄；需要 http，file:// 載不到模型）
python3 -m http.server 8765
# → http://127.0.0.1:8765/            開發版（分檔）
# → http://127.0.0.1:8765/build/      單檔版（先 python3 build.py）

# URL 參數：?turbo（測試加速：瞬間走位、dt 上限）、?lowres（像素比 0.4）、?mdbg 或 ?debug（移動 telemetry 面板）、?dev（顯示 MISSING_PORTRAIT 標籤）

# 回歸測試（Playwright Python；iPhone 390×844、is_mobile、CDP 觸控按在 #joy 上；沒給網址時預設 build/index.html——build/ 不在 repo 裡，請直接給 /index.html 的網址，或先 python3 build.py）
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

### 7.3 架構速覽

- `index.html` 依序載入 `lib/*` → `src/people3d.js` → `assets3d` → `character3d` → `world3d` → `engine3d` → `zones3d` → `audio3d` → `data/characters.js` → `data/portrait_manifest.js` → `data/legal_qbank.js` → `data/events.js` → `social3d` → `adv3d` → `legal3d` → `events3d` → `game3d` → `story3d` → `GAME.boot()`。全域：`THREE, THREE_JSM, THREE_VRM, P3, ASSETS, CHAR, W3, E3, Z3, A3, CHARACTERS, PORTRAITS, PORTRAIT_FILES, QBANK, STORY_EVENTS, SOCIAL, ADV, LEGAL, EVENTS, GAME, STORY`。
- **PlayerController 與 PlayerVisual 分離**：引擎只移動 `ent.obj`（controller）；模型掛在底下，動畫只動骨架（hips 只保留上下位移，原地走路，水平位移交給引擎）。換模型不能影響移動、碰撞、存檔。
- 人物建立順序：`CHAR.build(spec)` → VRM（spec.model）→ GLB → `spec.fallbackModel`（玩家的 TEMP_PLAYER_DEV_MODEL）→ 程序化 placeholder。VRM 載入超過 30 秒會先用 fallback。
- **同一個 `character_id` 綁定** 3D 模型、2D 立繪、名字、日程、關係、記憶、事件、存檔。legacy id（`an`、`zhe`、`sis`、`kai`、`yu`、`prof`）仍透過 alias 對到資料驅動人物，**尚未清理**。
- 導航：`E3.NavGrid` 0.5 m 格，各區域在 `zones3d.js` 手寫 `blockRect/blockOutside`；出生點落在阻擋格會 `E.unstick` 一次並 console.warn。**改區域幾何時要同步改導航格，並跑 `tests/p0_movement.py`**（v7 的 P0 就是兩者不同步）；加家具或改 `blockRect` 後也跑 `tools/dev_scratch/nav_islands.py`（比人窄的縫會留下「只有一點站得住」的小孤島，滑進去就出不來，v9.3 #31）。
- 存檔：`GM.snapshot()` 序列化整個 `G`；`validate()`＋`migrate()`（v1→v2）；匯出檔案／匯入前備份。

### 7.4 常見改動怎麼做

- **加正式立繪**：放 `assets/portraits/<character_id>/<outfit>/<expression>.webp`（透明背景、同構圖同頭部位置）→ `python3 build.py`（或 `python3 tools/gen_portrait_manifest.py`）。缺的表情自動 fallback 到同服裝 neutral。需求清單在 `docs/MISSING_EXTERNAL_ART.md`，規格在 `docs/CHARACTER_ART_SPEC.md`。
- **換／加 3D 人物（VRM）**：放 `assets/models/char/`，在 `ASSETS.manifest`（src/assets3d.js）加 `{url,type:'vrm',anims:'char.mixamo_clips',height,instances,hide?,source,license}`，在 `CHARACTERS[id].char3d.model` 指到它；授權寫進 `LICENSES.md`。必要時用 `tools/shrink_vrm.py` 縮貼圖。
- **加事件**：依 `docs/STORY_EVENT_SCHEMA.md` 加進 `src/data/events.js`；用 `tools/dev_scratch/evtest.py` 檢查觸發與鎖定解鎖。
- **加題目**：只能放使用者提供的題目與答案（`src/data/legal_qbank.js`）。

### 7.5 開發時要記得的技術教訓
- **作息換到同一區的另一間**（2026-10-14，`story3d.js` 的 `roomMove`）：作息寫了不同的 `room`、而且是坐著的動作（read、class、eat、sit）時，已經在場的人起身走到那一間的空位坐下，不瞬移；朋友已經在那一間就坐同一張桌子；沒空位留原地；走不到坐回原位。改這段跑 `node tests/schedule_roommove_unit.js`、`node tests/v2_c13_unit.js`、`tests/flow_b4_lecture.py`。
- **小地圖**：前方朝上的旋轉地圖，旋轉角＝鏡頭角度（`E.cam.yaw`）；有「北」標示與玩家箭頭。改小地圖跑 `tests/minimap_direction.py`。
- **VRM 彈簧骨（頭髮、馬尾）**：`src/character3d.js` 的 `updateVRM` 在彈簧骨更新前先 `vrm.scene.updateWorldMatrix(true,true)`——three-vrm 用子骨頭的 matrixWorld 算骨長，少了這行，人物移動或低幀率時頭髮會被甩到耳朵高度。**不要拿掉**。可以用 Node 載入 `lib/` 與 `src/` 模擬彈簧骨（`node tools/dev_scratch/spring_sim/sim_hair.js`），不需要瀏覽器。
- **查人物畫面問題**：用 `tools/dev_scratch/outline_probe.py` 在遊戲裡「一次只改一樣東西」截圖，不要用猜的（同一個問題猜錯過兩次）。已知、暫不修：陳語彤領口中間的黑色小蝴蝶結（連帽上衣改的領口離胸口 5–6 cm，需要真的圓領 T 恤模型）。
- 還沒清理：legacy id（`an`、`zhe`、`sis`、`kai`、`yu`、`prof`）透過 alias 對到資料驅動人物。

## 8. 啟動提示詞（第一次在某個帳號開 LAWWW 的工作階段時貼；把 `<X>` 換成帳號字母）
```
你是《法條之外：台灣法律人生》帳號 <X> 的 LAWWW（帳號 A 叫 LAWWW，帳號 B／C／D 叫 LAWWW-B／LAWWW-C／LAWWW-D），遊戲總監：開發、整合、派工、發布。這是接班，不是新專案：不要重新規劃，也不要請使用者重講需求。只用繁體中文。
先做：git fetch origin '+refs/heads/*:refs/remotes/origin/*' --prune → python3 tools/handoff/check_handoff.py duty find 找 RULE_SOURCE（結束碼 1 停下來問我）→ 讀 RULE_SOURCE 上的 CLAUDE.md 和 docs/rules/ROLE_LAWWW.md → 照 CLAUDE.md §4 接班十四步和 ROLE_LAWWW 第 3 節做完、duty register 登記 → 回我「接班確認」→ 立刻接續 check_handoff.py queue --owner LAWWW。
上一任只看 docs/handoff/duty.json，不照帳號順序、不靠記憶。我的新訊息永遠先回（短回合，最多約 10 分鐘）。不傳訊息給休班帳號。
```
