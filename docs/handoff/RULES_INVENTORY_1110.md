# 規則盤點與搬遷計畫（RULES-INVENTORY-1110，第一階段：只盤點、不刪不改）

> LAWWW 的子代理，2026-11-10。基準：開發分支 `74007ed4a`（RULE_SOURCE `claude/confident-ritchie-8rwh7t`）、`origin/claude/second-ai-env-art` `8cefb263c`、`origin/claude/story-planning` `85a5143a4`、`origin/claude/cc-testing` `480180ac8`。
> 使用者的決定（選擇題）：①已經被新規則取代的**直接刪**（git 歷史留著），不封存；②最後只剩**一份短的共同規則 CLAUDE.md**＋**每個職位一頁**（LAWWW、LAWWW2、AA、BB、CC），每一條規則只放一個地方。17:2x 補充：過時的東西不用寫「被誰取代」，直接列刪除。
> 根目錄雜物（test_*.html 除 test_charlook.html、play.py、shot3d.py、REVIEW_FILE_INDEX.txt、SOURCES.md、package.json、legacy/、screenshots/、shots/、build/）**已在開發分支 70e23b32c 刪掉**，本計畫不再分類，只在第 5 節列它們造成的斷點。

---

## 1. 帶規則的檔案（現況）

大小＝位元組（UTF-8，中文一字 3 位元組）；日期＝`git log -1` 的 commit 日期。

### 1.1 開發分支（RULE_SOURCE）

| 檔案 | 大小 | 最後修改 | 內容 |
|---|---|---|---|
| `CLAUDE.md` | 172,609（83,595 字） | 11-10 | 共同規則＋D 表格＋四職位分工＋技術說明＋舊狀態，三份內容互相重複 |
| `docs/AI_SESSION_HANDOFF.md` | 222,753（121,657 字） | 11-10 | 接班總入口：RULE_SOURCE、十四步、交班六類、14 份啟動提示詞（55k 字）、值班表、交班紀錄、HV 版本、ACK 表；開頭又抄了三節 CLAUDE.md 舊規則 |
| `docs/PROJECT_DECISIONS.md` | 143,557（64,818 字） | 11-10 | D1～D144 決策表（缺 D115、D131）＋變更紀錄；規則和遊戲設計定案混在一起 |
| `docs/USER_INSTRUCTION_LOG.md` | 131,965 | 11-05 | LAWWW 的使用者原話紀錄（10-14～11-05）；HV-18 以後由 `user_asks_LAWWW.json` 取代，11-05 以後沒更新 |
| `docs/HANDOFF_GAP_MATRIX.md` | 156,279（89,880 字） | 11-10 | 任務總表閱讀版＋LAWWW 交班快照；§11 快照歷史就 57k 字 |
| `docs/TESTING.md` | 43,375 | 11-07 | 測試制度（D34、D83、〇之一看畫面）＋測試清單、覆蓋表、發布前清單 |
| `docs/REGRESSION_CHECKLIST.md` | 14,848 | 10-30 | 回歸測試清單（和 TESTING.md 第五、七節重複） |
| `docs/WORLD_NAMING.md` | 16,574 | 11-02 | D115 命名規範（唯一依據；25 個程式／測試檔引用） |
| `docs/SECOND_AI_HANDOFF.md` | 32,019 | 10-30 | 舊雙 AI 時代 LAWWW2 的檔案所有權、交付流程 |
| `docs/DUAL_AI_BOARD.md` | 62,668 | 10-30 | 舊雙 AI 看板（被 deliveries.json／outbox 取代） |
| `docs/art-rebuild/ART_DIRECTION.md` | 27,700 | 11-05 | 美術規範：§0～11 美術聖經（參考圖、人物、街景、光影、鏡頭）、§12 MANDATORY 製作規範 |
| `docs/art-rebuild/TOOLCHAIN_AUDIT.md` | 11,129 | 10-10 | 10-10 工具鏈實測（被 D144 `tools/blender/setup_env.sh` 取代） |
| `docs/art-rebuild/second_ai/ART_SOP.md` | 22,567 | 11-10 | LAWWW2 美術 SOP（和 LAWWW2 分支相同） |
| `docs/art-rebuild/second_ai/SCENE_RULES.md` | 23,012 | 11-10 | LAWWW2 場景製作規則（和 LAWWW2 分支相同） |
| `docs/art-rebuild/second_ai/RULES_2D_TO_3D.md` | 19,840 | 11-05 | D140 流程（**比 LAWWW2 分支舊**：LAWWW2 分支多 17 行） |
| `docs/art-rebuild/second_ai/WORK_RULES.md` | 9,452 | 10-11 | LAWWW2 舊工作規則（LAWWW2 分支有 10-16 版） |
| `docs/art-rebuild/second_ai/HANDOFF.md` | 388,991 | 10-30 | LAWWW2 交接檔的**舊副本**（LAWWW2 分支 561,898、11-10） |
| `docs/handoff/OUTBOX_TEMPLATE.md` | 2,301 | 10-17 | outbox 格式（D94） |
| `docs/handoff/USER_WANTS.md` | 244,618 | 11-10 | 使用者需求總表（資料；`check_handoff.py asks` 讀） |
| `docs/handoff/BRANCH_INVENTORY.md` | 25,985 | 11-09 | 分支盤點（資料；`branch_audit.py --write` 寫） |
| `docs/handoff/USER_DIRECTIVE_NEXT_DUTY_2026-10-17.md` | 7,288 | 10-17 | 10-17 的一次性指示（已做成 D94） |
| `docs/handoff/*.json` | — | — | tasks、deliveries、duty、watermarks、wip、story_import_allow、user_asks_*、outbox_LAWWW2（資料，工具讀） |
| `docs/history/` | 2.4 MB | 11-04 | 只記一下：DEVELOPMENT_HISTORY、specs/01–22（使用者需求原文）、user_feedback、v7 紀錄、`CLAUDE_superseded_1104.md`（D135 封存的舊條文） |
| `.claude/settings.json` | 292 | 10-18 | UserPromptSubmit hook → `tools/handoff/user_ask_reminder.py`（HV-18） |
| `.claude/skills/blender-web-3d/` | — | 10-10 | Blender 技能（工具，不是專案規則） |
| `tools/handoff/check_handoff.py` | 52,087 | 11-04 | check／roles／incr／asks／queue／snapshot／duty |
| `tools/handoff/duty_state.py` | 37,989 | 11-04 | 值班狀態；讀 `AI_SESSION_HANDOFF.md` 第 1 節 |
| `tools/handoff/incremental.py` | 21,258 | 11-04 | 水位線、outbox、WIP |
| `tools/handoff/branch_audit.py` | 12,805 | 11-07 | 分支唯讀稽核 |
| `tools/handoff/turn_check.py` | 3,753 | 10-16 | 回合長度自我檢查（D90） |
| `tools/handoff/user_ask_reminder.py` | 1,513 | 11-02 | hook 提醒文字 |
| `tools/handoff/{history_audit.py, chat_images.py, late_week_scan.js, mk_release_tree.sh}` | — | 10-16～11-05 | 一次性稽核／D122 抓圖／16 週掃描／發布樹 |
| `.github/workflows/node-unit-auto.yml` | 4,165 | 11-04 | D131 Node 單元測試（不讀文件） |

### 1.2 `origin/claude/second-ai-env-art`（LAWWW2）

| 檔案 | 大小 | 最後修改 | 內容 |
|---|---|---|---|
| `docs/art-rebuild/second_ai/HANDOFF.md` | 561,898 | 11-10 | LAWWW2 交接檔（工具讀的 progressFile；中間夾著「⚠️ 新規則 D131」之類的規則抄本） |
| `…/ART_SOP.md` | 22,567 | 10-21 | 美術 SOP（§9 新方法登記表、§10 美術總監標準） |
| `…/SCENE_RULES.md` | 23,012 | 11-05 | 場景規則（§5 效能預算、§9 驗收清單、§11 店面硬性驗收、§12 參考圖就是規格；D132 指名這幾節） |
| `…/RULES_2D_TO_3D.md` | 23,107 | 11-07 | D140 2D 轉 3D 流程＋工具表 |
| `…/WORK_RULES.md` | 13,661 | 10-16 | 舊工作規則（D77、不停工、舊分工、通訊、保存——全部和 CLAUDE.md 重複或過時） |
| `…/TODO_SHORTCUTS.md` | 27,509 | 11-10 | 先將就的待辦（任務資料，不是規則） |
| `…/ART_DIRECTOR_PATROL.md`、`BRANCH_CLEANUP_D88.md`、`SOURCE_FILES_1021.md`、`SHOP_VERSIONS_1105.md`、`ASSET_AUDIT_2026-10-16.md`、`BACKLOG_SWEEP_1021.md`、`CLOSED_SPACES_1023.md`、`ECON_3D_GAP_STATUS_1030.md`、`EVAL_J13_A21_D40_1027.md`、`INTERIOR_AAA_REVIEW_1028.md`、`queue_audit_1110.md`、`US_EXCHANGE_PLAN.md`、`research/*` | — | 10-16～11-10 | 一次性盤點、巡檢、研究（紀錄，不是規則） |
| `docs/handoff/{duty_LAWWW2.json, outbox_LAWWW2.json, user_asks_LAWWW2.json}` | — | 11-07～11-10 | 職位登記資料 |

### 1.3 `origin/claude/story-planning`（AA、BB）

| 檔案 | 大小 | 最後修改 | 內容 |
|---|---|---|---|
| `docs/story_planning/00_台詞寫作規則.md` | 23,265 | 11-10 | D137 唯一台詞規則；**§11 是 `tools_aa/line_lint.py` 讀的規則表** |
| `…/00_人物口氣表.md` | 30,734 | 11-10 | 人物口氣（§1、2 是使用者原話） |
| `…/00_現行設定總表.md` | 22,011 | 11-10 | 劇情現行設定（分工、時間線、人物現況、系統規則、題庫） |
| `…/00_先讀這份.md` | 18,703 | 11-03 | 自己標「歷史紀錄」，指去現行設定總表 |
| `…/00_文件狀態表.md` | 96,979 | 10-30 | 企劃文件狀態表 |
| `…/00_世界觀基準_現代台大平行校園.md` | 13,867 | 10-30 | 自己標「部分過時」 |
| `…/AA_00_四年劇情企劃書_合併版.md` | 25,168 | 10-30 | 自己標「歷史、已過時」 |
| `…/AA_交接紀錄.md` | 469,923 | 11-10 | AA 交接檔（工具讀）；第 1172～1800 行抄了多節 P0 規則、ACK |
| `…/AA_596_AA工作規則_改稿與CG.md` | 7,926 | 11-03 | D127 AA 工作規則 |
| `…/BB_00_協作規範與交接紀錄.md` | 462,843 | 11-10 | BB 交接檔（工具讀）；第 144～393 行抄了 D100、D76、10-14、D45、D49、D50 等規則，另有 BB／CC 分工、PC 迴圈兩節 BB 自己的規則 |
| `…/BB_80_共同創作規則.md` | 1,826 | 10-14 | 自己標「暫定」 |
| `…/BB_224_CC工作規則_不閒置＋第二批佇列.md` | 3,374 | 11-02 | D121 |
| `…/BB_225_從對話抓原圖_規則.md` | 2,490 | 11-02 | D122 |
| `…/BB_229_使用者電腦跑測試_規則與操作卡.md` | 8,394 | 11-02 | D123 |
| `…/BB_243_生成CG規則.md` | 6,240 | 11-02 | 給使用者 CG 提示詞的規則（D97 延伸） |
| `…/BB_258_CC_50工作流程規則審閱.md` | 3,604 | 11-04 | BB 對 CC_50 加的五條 |
| `…/BB_300_獨立驗收總計畫.md` | 12,386 | 10-30 | BB 工作規範＋覆蓋表＋退件追蹤 |
| `…/README.md`、`README_新版_草稿.md`、`README_更名版_草稿.md` | 5,275／8,156／10,561 | 10-30 | 資料夾說明＋兩份 README 草稿 |
| `…/給開發組_交接板.md` | 56,985 | 10-30 | 自己標「部分過時」的舊交接板 |
| `…/_開發分支規則副本/`（CLAUDE.md、AI_SESSION_HANDOFF.md、HANDOFF_GAP_MATRIX.md、PROJECT_DECISIONS.md、USER_INSTRUCTION_LOG.md、README×2） | 共約 366k | 10-16 | **10-16 的規則副本**，最容易讓人讀到舊規則 |
| `…/test_tools/README.md` | 948 | 10-18 | BB 台詞對照小工具說明 |
| `…/tools_aa/line_lint.py`、`README.md` | — | — | 讀 `00_台詞寫作規則.md` §11 |

### 1.4 `origin/claude/cc-testing`（CC）

| 檔案 | 大小 | 最後修改 | 內容 |
|---|---|---|---|
| `docs/story_planning/CC/CC_00_交接紀錄.md` | 102,281 | 11-10 | CC 交接檔（工具讀）；最上面一節「★ 規則：瀏覽器測試以 PC 佇列為準」 |
| `…/CC/CC_50_工作流程規則.md` | 17,540 | 11-04 | CC 工作流程規則（接班、探針、雲端先跑、佇列、初判、聯絡、保存、新方法、BB 加的五條、第三方素材） |
| `…/CC/CC_29_新runner_操作卡.md` | 9,746 | 11-02 | 使用者電腦 runner 操作卡 |
| `…/CC/CC_48_失敗自動追蹤系統.md` | 29,174 | 11-04 | 失敗追蹤工具說明（工具文件） |
| `…/CC/CC_LOCAL_佇列.md` | 6,073 | 11-02 | 舊佇列說明（佇列已在 `tools/cc_local/queue.txt`） |
| `tools/cc_local/README.md` | 28,514 | 11-05 | PC runner 工具說明 |
| `tools/cc_local/queue.txt` | 72,730 | 11-10 | 佇列（資料） |
| `docs/handoff/{duty_CC.json, user_asks_CC.json}` | — | 11-10 | 職位登記資料 |

---

## 2. docs/ 的分類（根目錄已處理，略）

判斷方式：grep `src/ tests/ tools/ index.html build.py .github .claude`（不算 `tools/dev_scratch`）。「只有註解提到」不算功能依賴，但列在第 5 節要順手改註解。

### 2.1 `docs/` 最上層

| 檔案 | 分類 | 理由／誰在用 |
|---|---|---|
| `AI_SESSION_HANDOFF.md` | **縮成紀錄檔（KEEP-AS-DATA，路徑不改）** | `duty_state.py` 讀第 1 節「X 值班中」、`tests/handoff_duty_sim.py` 寫 `## 1. 值班表`；規則全部搬走，只留 §1 現在那一行、§12 交班紀錄、§13 HV 版本、§14 ACK |
| `HANDOFF_GAP_MATRIX.md` | **KEEP-AS-DATA（縮）** | `check_handoff.py` 第 9 項讀；`duty_state.py` 把它當 LAWWW 交接檔；§0 規則搬 ROLE_LAWWW；刪 §11～§13 |
| `TESTING.md` | **KEEP-AS-DATA（縮）** | 16 支測試註解指它；規則（〇、〇之一、一、二）搬 ROLE_BB，§五 發布前清單搬 ROLE_LAWWW；留 §三、四、六～九 當測試清單 |
| `WORLD_NAMING.md` | CURRENT（資料） | D115 命名表；src／tests 25 處引用 |
| `RELEASES.md` | KEEP-AS-DATA | 發布紀錄 |
| `CHARACTER_ART_SPEC.md` | CURRENT（資料） | 立繪／CG 規格；`src/adv3d.js` 註解；BB 要圖時用 |
| `CHARACTER_SCHEMA.md` | CURRENT（資料） | `src/data/characters.js` 註解 |
| `STORY_EVENT_SCHEMA.md` | CURRENT（資料） | `src/story3d.js`、`events3d.js`、`game3d.js`、`data/events.js` 註解 |
| `MISSING_EXTERNAL_ART.md` | KEEP-AS-DATA | `src/story3d.js`、`adv3d.js`、`pool3d.js`、`data/*events.js` 註解 |
| `PROJECT_DECISIONS.md` | **DELETE** | 規則搬進新家（每條保留 D 編號當標籤，`grep D84` 就找得到）；遊戲設計定案搬 ROLE_LAWWW2「場景定案」和企劃線 `00_現行設定總表.md`；只有 `tools/blender/setup_env.sh` 一行註解提到 |
| `USER_INSTRUCTION_LOG.md` | **DELETE** | HV-18 起由 `user_asks_LAWWW.json` 取代（11-05 後沒更新）；刪之前核對每節的原話在 user_asks／USER_WANTS 找得到，找不到的補進 user_asks_LAWWW.json |
| `REGRESSION_CHECKLIST.md` | **DELETE** | 併進 TESTING.md 清單（重複的不搬） |
| `SECOND_AI_HANDOFF.md` | **DELETE** | 還有效的（LAWWW2 交件到 `assets/models/env/second_ai/`、assets3d.js 標記之間增減）搬 ROLE_LAWWW2；`build.py`、`src/assets3d.js`、`tools/blender/env_second/*.sh` 只是註解 |
| `DUAL_AI_BOARD.md` | **DELETE** | 舊看板；CLAUDE.md C.19「通訊不通改用 DUAL_AI_BOARD」改成「寫進自己的交接檔／outbox」 |
| `ART_REBUILD_PROGRESS.md` | **DELETE** | 10-31 停更的工作日誌；CLAUDE.md 指的三條技術教訓（#25 彈簧骨 updateWorldMatrix、#34 一次只改一樣東西用 outline_probe、#36 SwiftShader 不併跑）先搬進 ROLE_LAWWW／ROLE_LAWWW2 |
| `ADV_SYSTEM.md` | **DELETE** | 10-09 v7 說明，只有 make_review_zip 索引提到 |
| `REVIEW_NOTES.md` | **DELETE** | v7 的「最擔心十個問題」，只有 make_review_zip 提到 |
| `REVIEW_README.md` | **DELETE** | v7 系統總覽 A–T，只有 make_review_zip 提到 |
| `TIMELINE_COMPAT_AUDIT.md` | **DELETE** | 10-18 一次性評估 |
| `WAKEUP_REPORT_2026-10-10.md` | **DELETE** | 一次性報告 |
| `proposals/`（PHONE_INVITE、SCHEDULE） | **DELETE** | 10-11／10-13 草案，都已實作或被取代 |
| `qa/`（四份舊序章逐字稿 10-18） | **DELETE** | 一次性 QA 紀錄 |
| `test-reports/`（v9.3-25） | **DELETE** | 10-10 發布前報告 |
| `perf/`（x79 兩份 json） | **DELETE** | 10-20 量測結果，沒人讀 |
| `campus/` | KEEP-AS-DATA | `src/zones3d.js`、`teach3d.js`、`data/*_layout.js`、`tests/campus_public_unit.js`、`tools/blender/env_second/*` 引用 |
| `history/` | 只記一下 | 其中 `CLAUDE_superseded_1104.md` **DELETE**（使用者：被取代的直接刪）；其他（specs 原文、DEVELOPMENT_HISTORY）照舊 |
| `story_planning/`（開發分支上的 AA_652、ref_images） | KEEP-AS-DATA | 匯入用 |

### 2.2 `docs/art-rebuild/`

| 檔案 | 分類 | 理由 |
|---|---|---|
| `ART_DIRECTION.md` | KEEP（§0～11 美術聖經）；§12 **刪**、搬 ROLE_LAWWW2 | env_second 腳本引用整份檔名 |
| `ASSET_INVENTORY.md`、`VISUAL_REVIEW.md`、`CHARACTER_REVIEW.md` | KEEP-AS-DATA | src 註解引用章節 |
| `TOOLCHAIN_AUDIT.md` | **DELETE** | D144 `setup_env.sh` 取代；只有 setup_env.sh 一行註解 |
| `second_ai/WORK_RULES.md` | **DELETE**（兩條分支都刪） | 全部重複或過時 |
| `second_ai/ART_SOP.md`、`SCENE_RULES.md`、`RULES_2D_TO_3D.md` | **併進 ROLE_LAWWW2 後 DELETE**（兩條分支） | 開發分支上是副本；先以 LAWWW2 分支的版本為準（RULES_2D_TO_3D 開發分支比較舊） |
| `second_ai/HANDOFF.md`（開發分支副本） | **DELETE 副本** | 正本在 LAWWW2 分支（工具從那裡讀） |
| 其他 `second_ai/*`（VISUAL_REVIEW、CAMERA_WALLS、FOUR_BUILDINGS_REVIEW、BG_TRACKER、drafts/、test_shots/、wip/…） | KEEP-AS-DATA | 美術紀錄；src 註解引用 wip/ 路徑 |

### 2.3 `docs/handoff/*.md`

| 檔案 | 分類 | 理由 |
|---|---|---|
| `USER_WANTS.md` | KEEP-AS-DATA | `check_handoff.py asks` 讀；src 註解引用 |
| `BRANCH_INVENTORY.md` | KEEP-AS-DATA | `branch_audit.py --write` 寫、`tests/branch_audit_unit.py` |
| `OUTBOX_TEMPLATE.md` | KEEP-AS-DATA | outbox 格式（CLAUDE.md 只寫一行指過去） |
| `D118_PLAN.md` | KEEP-AS-DATA | 進行中計畫；`src/study3d.js` 等 15 處註解 |
| `WZ_SHOPS1_FIXED_COORDS.md`、`WZ_YIZHAN_FIXED_COORDS.md` | KEEP-AS-DATA | src 版面檔、`tests/cafe230_aa657_unit.js` 引用 |
| `BLACK_BG_AUDIT.md` | KEEP-AS-DATA | `tools/story/black_bg_audit.js` 產生 |
| `LATE_WEEK_CONDITIONS.md` | KEEP-AS-DATA | `tools/handoff/late_week_scan.js` 產生 |
| `AA_QUESTIONS_1021`、`BB245_LAWWW_REPLY_1102`、`BB_TEST_QUEUE_1027`、`BLACK_BG_AUDIT_1018`、`CANDIDATE_9103`、`D118_MIDTERM_REFS`、`D118_MIDTERM_UNSURE`、`DISPATCH_AUDIT_2026-10-16`、`ESTIMATE_1102`、`GHA_TEST_OFFLOAD_1103`、`HANDOFF_SIM_HV10`、`LOGIC_AUDIT_LAWWW_1017`、`PLAYER_FEATURES_v9.10.3`、`TEST_RESULTS_1018`、`USER_ART_REVIEW_1027`、`USER_DIRECTIVE_NEXT_DUTY_2026-10-17`、`USER_WANTS_AUDIT_1027`、`VAC-L1_假期系統技術短評`、`VISUAL_WALKTHROUGH_W1`、`W1_AUDIT_2026-10-17`、`WEEK16_REFS_2026-10-17`、`WIP_INVENTORY_2026-10-17` | **DELETE（22 份）** | 一次性盤點／回覆／候選說明，沒有程式讀；`tests/date_t7a_unit.js`、`tests/aa581_midterm_lines_unit.js`、`src/story3d.js` 只是註解；`wip.json` 的 `"source": "WIP_INVENTORY_2026-10-17"` 是字串標籤、不讀檔 |
| 子資料夾 `audit_10xx/`、`history_audit/`、`release_*/`、`outbox_fix_1021/`、`user_shots/`、`bb_checklists/`、`snapshots/` | 不在本次範圍 | 紀錄／工具輸出（`snapshots/` 工具讀，必留） |

---

## 3. CLAUDE.md 與四份總入口文件逐節分類

### 3.1 CLAUDE.md 逐節

| 行 | 節 | 分類 | 現行規則（一兩行）／去處 |
|---|---|---|---|
| 1–5 | 檔頭「永久啟動與回班規則」（HV-17） | CURRENT | 收到「我回來了…」自己 fetch、`duty find`、讀 RULE_SOURCE 的 CLAUDE.md＋自己職位頁、照接班步驟登記再開工；不假設上一任 → **CLAUDE.md §4** |
| 6–19 | P0 使用者要過的東西不能停在半路（D101、HV-18） | CURRENT | ①USER_WANTS 一列一件、當天加 ②暫停寫五欄、當下告訴使用者 ③接班／發布前跑 check_orphans ⑥任何職位收到使用者交代當下寫進自己的 `user_asks_<職位>.json`、通知值班 LAWWW ⑦hook＋asks 檢查 → **CLAUDE.md §2**；④換分工逐條重派、⑤發布前跑 check_orphans／check_lines、跑 asks → **ROLE_LAWWW** |
| 20–89 | ⚠ 任何帳號回來接班先讀（D135～D143＋D75～D134 一行表） | **HISTORY-ONLY（刪）** | 整張表是 PROJECT_DECISIONS 的重複索引；每列的規則照第 4.3 節搬家 |
| 90–102 | D99 三個優先項目 | CURRENT | 舊序章完整流程 → 寒暑假 → 美國交換；驗收看玩家實際玩到什麼；不插隊、夠用凍結；優先於 D81 一般排序和「主動找工作」→ **CLAUDE.md §6**；第 5 點 LAWWW 把關 → **ROLE_LAWWW** |
| 103–111 | D118 法律學習、考試、職涯 | CURRENT | 不是讀書打卡、沒有隱藏每日懲罰、考前一鍵總複習、成績看答題、落榜可重考／可當律師、法服純劇情 → **CLAUDE.md §7**；第 4 點分工 → 各職位頁 |
| 112–135 | D100 四職位新分工（含 2a CC） | CURRENT（部分 SUPERSEDED） | 一張職責表 → **CLAUDE.md §1**；細節 → 各職位頁。已過時：第 6 點「建築場景只有使用者」（D120／D128）、2a「CC 只和 BB 聯絡」（D134）、第 4 點「下一版 v9.10 的標準」（HISTORY）→ 刪 |
| 136–167 | D86 派工協作／D79 新增劇情先問 AA／D84 平行開發 | CURRENT | 「手上沒工作找誰」→ **CLAUDE.md §5**；D79 全部 → **ROLE_LAWWW**（AA 那一側一行 → ROLE_AA）；D84 第 1～6 點 → **ROLE_LAWWW**，第 2 點 LAWWW2 自領 → **ROLE_LAWWW2**；D84 第 7、8 點重複 → 刪 |
| 168–224 | P0 使用者訊息優先協定（D90、D76、D72、D40、10-14、10-10） | CURRENT（第 23 點 HISTORY） | 回合 ≤10 分鐘、長工作放背景、回合開始先回使用者再讀通知、分清提問／糾正／停止、被糾正的不得偷偷繼續、【新指示確認】格式、SENT／DELIVERED／ACK、AI 間訊息標頭 → **CLAUDE.md §3**（壓到約 4k 字）；第 11 點「LAWWW 寫 USER_INSTRUCTION_LOG」改成 user_asks；第 19 點 DUAL_AI_BOARD 備援改交接檔；第 23 點期末考舊規定 → 刪 |
| 225–248 | D93 持續登記待辦、逐職位核對 | CURRENT | 每個職位交接檔要有「全部待辦」、ID、【表外】→ **CLAUDE.md §4**；LAWWW 同步進 tasks.json、跑 `roles` → **ROLE_LAWWW** |
| 249–266 | D94 增量交接（＋D135 docsOnly） | CURRENT（第 7 點 HISTORY） | 交付當下寫自己分支的 `outbox_<職位>.json` → **CLAUDE.md §4**；水位線、`incr --advance`、`ignored` 的 kind、WIP 索引、匯入白名單 → **ROLE_LAWWW**；第 7 點成本紀錄 → 刪 |
| 267–286 | 自主連續工作（D87、D95、D96、D125） | CURRENT（第 11 點 HISTORY） | 回報不是停、做完接下一項、等人時做不相依的、只有第 6 點五種情況可以停、send_later 一次一個、有背景通知就不排、批次回報 → **CLAUDE.md §5**；第 13 點 LAWWW 確認不閒置 → **ROLE_LAWWW** |
| 287–305 | P0 緊急換班口令（含 D75、D129） | CURRENT | 「現在換班」＝停一般工作、只做安全收尾、commit＋push 自己的檔、寫交接六類、snapshot＋duty handoff、不合併 main、不傳訊息給休班帳號、關掉自己的排程 → **CLAUDE.md §4** |
| 306–314 | D81 玩家越早遇到越先做 | CURRENT（第 5 點部分 SUPERSEDED） | P0 → v0 → v1 … v5；跨學年系統在第一次用到的學期做；tasks.json `first` 欄 → **CLAUDE.md §6**；第 5 點「BB-B 定人物第一次出現」被 D100 取代 → 刪 |
| 315–339 | D85 main 合併與發布 | CURRENT（第 7 點三小時 SUPERSEDED） | 全部 → **ROLE_LAWWW**；「其他職位不碰 main」→ CLAUDE.md §8 |
| 340–372 | D88 分支收斂＋D114 唯讀稽核 | CURRENT | 第 1、5 點原則（成果不能丟、休班分支不刪）→ **CLAUDE.md §8**；第 2、4、6、7 點 → **ROLE_LAWWW**；第 3 點美術 WIP 收斂 → **ROLE_LAWWW2** |
| 373–382 | 這是什麼 | 混合 | 遊戲一句話、線上網址、three.js 純靜態 → **CLAUDE.md §0**；「目前版本 v9.7…【過時】」、雙 AI 分工（D39）、人物組／建築組 10-10 分工 → **HISTORY-ONLY（刪）**；D34 測試制度一行 → **ROLE_BB** |
| 383–403 | MANDATORY 3D ART（D38＋D136／D138／D140／R1R2／D112） | CURRENT | 共通底線（不用 primitive 拼正式美術、Blender 優先、不准假建築、成人比例、地板不准深色木 D112、校園建築不准照抄 D136、店名 D77）→ **CLAUDE.md §9**（約 1.5k 字）；工具表、疊圖門檻、TripoSR 限制、R1／R2、驗收狀態、程序化資產分類、效能 → **ROLE_LAWWW2**；誰標 ART_APPROVED → CLAUDE.md §1 表＋ROLE_BB／ROLE_LAWWW；第 11 點「劇情暫停修改／D50 三級」→ **刪**（D99／D100／D109 取代） |
| 404–421 | 和使用者合作的規則 1～14 | CURRENT（第 8 點 HISTORY） | 繁中、原創、誠實標 FIXED／PARTIAL、截圖驗收、不准假修、手機優先、美術方向、女主角資料不可改（溫學姊年級照現行設定總表）、題庫不可改、授權記 LICENSES、不付款、店名 D77（不用諧音）、不重寫能用的系統、「先修 X」就只修 X → **CLAUDE.md §10**；第 8 點「不要打磨 placeholder／LEVEL_BLOCKOUT」→ 刪 |
| 422–432 | 緊急保存 D45（＋D126、D113） | CURRENT | 每小時至少推一次、子代理開工就推檢查點每 15～20 分鐘、推不上去用 bundle 進 wip_backup、狀態分 WIP／CHECKPOINT…、Git 安全（不 add .、不 force push）→ **CLAUDE.md §8**；第 6 點「ART_REBUILD_PROGRESS 交接（最新）」→ 刪 |
| 433–448 | 跨帳號接班（D49→D80→D92、HV-20） | CURRENT | RULE_SOURCE＝duty.json、上一任只看登記鏈、接班十四步摘要、交班六類、duty handoff 必跑、只有值班 LAWWW 改規則檔、不傳訊息給休班帳號 → **CLAUDE.md §4**（和上面換班口令合成一節） |
| 449–488 | AI 長期合作 1～14（10-09） | CURRENT（第 3、10、11 點部分 HISTORY） | 先回答再工作、不討好不虛報、角色是完整的人、不製造不合理門檻、回歸影響、三種完成狀態、存檔負責、不過度設計、回報格式 → **CLAUDE.md §10、§11**；第 3 點「寫進 PROJECT_DECISIONS」改成「寫進 user_asks＋規則頁」；第 10 點舊分支名、第 11 點指標 → 刪 |
| 489–529 | 目錄 | CURRENT（技術參考） | → **ROLE_LAWWW「程式地圖」**（LAWWW2、AA 改字串時也讀這一節） |
| 530–562 | 執行、測試、建置、部署 | CURRENT | 開發伺服器、URL 參數、建置、部署 → **ROLE_LAWWW**；發布前必跑 → ROLE_LAWWW §發布；SwiftShader／不要 playwright install／localStorage key → **ROLE_BB**（測試環境） |
| 563–578 | 架構速覽、常見改動 | CURRENT | → **ROLE_LAWWW**；導航格要同步、`nav_islands.py` → **ROLE_LAWWW2**（場景程式 D108） |
| 579–622 | 目前狀態（v9 WIP）＋v7 狀態 | 混合 | 「改 X 要跑 Y」的技術規則（多樓層 nav、萬才館、總圖、宿舍、sunYaw、柏油 `userData.asphalt`、霧 `E.fogFar`、樹幹透視、小地圖、roomMove）→ **ROLE_LAWWW2「場景程式」**；VRM 彈簧骨 updateWorldMatrix、outline_probe → **ROLE_LAWWW**；狀態敘述、v7 已知問題 → **刪**；Mixamo 授權疑慮 → LICENSES.md 一行 |
| 623–633 | 第三方原始碼 | KEEP-AS-DATA | → **LICENSES.md** 末尾 |
| 634–641 | 歷史 | 指標 | CLAUDE.md §0 留一行指 docs/history |

### 3.2 CLAUDE.md「⚠」表的 D 列（D75～D143）＋其餘 D 編號

完整 150 個 D 編號（D1～D144，含 D100a～f；PROJECT_DECISIONS 缺 D115、D131，兩條只在 CLAUDE.md）的去處在第 4.3 節。這裡只列「⚠」表裡需要說明的列：

| D | 分類 | 現行內容 |
|---|---|---|
| D135 | **SUPERSEDED**（本次重整取代） | 留下的只有「incr 只逐筆分類改到 src／assets／tests／lib／index.html 的 commit」→ ROLE_LAWWW |
| D136 | CURRENT | 校園建築可部分相同、絕不照抄；店面照參考圖 → CLAUDE.md §9；`--mode campus` → ROLE_LAWWW2／ROLE_BB |
| D137 | CURRENT | 寫台詞照 `00_台詞寫作規則.md`（唯一一份） → CLAUDE.md §7 一行＋ROLE_AA |
| D138 | CURRENT | 有參考圖的場景附同角度疊圖；TripoSR 只限中遠景有機小雜物 → ROLE_LAWWW2（驗收面 ROLE_BB） |
| D139 | CURRENT | 電腦不能用時功能類瀏覽器測試丟 GitHub Actions，效能／顏色等電腦 → ROLE_BB＋ROLE_CC |
| D140 | CURRENT | 2D 轉 3D 照疊圖流程、新方法進工具表 → ROLE_LAWWW2 |
| D141 | CURRENT | 場景最多 3 版就進遊戲，之後只改使用者說的或擋玩的，LAWWW 攔 → CLAUDE.md §6 |
| D142 | CURRENT | BB、CC 工作量平均 → ROLE_BB＋ROLE_CC |
| D143 | CURRENT | CC 每 30 分鐘查 PC 佇列、少於 5 項補；BB／CC 分工 → ROLE_CC（BB 那一側 ROLE_BB） |
| D75 | CURRENT | 不傳訊息給休班帳號 → CLAUDE.md §4 |
| D76、D90、D72、D40 | CURRENT（已合併） | 使用者訊息優先 → CLAUDE.md §3 |
| D77 | CURRENT（11-03 改） | 店名另取原創名、不用諧音、不畫商標 → CLAUDE.md §10 |
| D78 | HISTORY（已實作） | 刪 |
| D79 | CURRENT | 新增劇情先問 AA → ROLE_LAWWW |
| D80、D92 | CURRENT | RULE_SOURCE、登記鏈 → CLAUDE.md §4 |
| D81 | CURRENT | → CLAUDE.md §6 |
| D82 | CURRENT | tasks.json 為準、deliveries、snapshots → ROLE_LAWWW |
| D83 | CURRENT | 三級測試 → ROLE_BB（「寫程式跑幾秒 Node 單元測試」→ ROLE_LAWWW） |
| D84 | CURRENT | → ROLE_LAWWW（保留「D84 第 N 點」編號，`check_handoff.py` 訊息引用第 1、3、4、6 條） |
| D85 | CURRENT | → ROLE_LAWWW |
| D86 | **SUPERSEDED**（D100） | 還有效的「沒工作找誰」→ CLAUDE.md §5 |
| D87、D95、D96、D125 | CURRENT | → CLAUDE.md §5 |
| D88、D114 | CURRENT | → CLAUDE.md §8（原則）＋ROLE_LAWWW＋ROLE_LAWWW2 |
| D93、D94 | CURRENT | → CLAUDE.md §4＋ROLE_LAWWW |
| D97 | CURRENT | 純場景提示詞一次 10 組、先純文字 → ROLE_BB |
| D98 | **SUPERSEDED**（D100） | 刪 |
| D99 | CURRENT | → CLAUDE.md §6 |
| D100、D100a | CURRENT | 分工表 → CLAUDE.md §1；角色美術 LAWWW 驗收 → ROLE_LAWWW |
| D108 | CURRENT | 場景程式歸 LAWWW2 → ROLE_LAWWW2 |
| D109 | CURRENT | 劇情 AA 自己定，只有人物設定／感情走向／結局問使用者 → ROLE_AA＋CLAUDE.md §1 |
| D110、D111 | CURRENT | 四位總監各自決定；LAWWW 監督 → CLAUDE.md §1＋ROLE_LAWWW |
| D112 | CURRENT | 不准深色木地板 → CLAUDE.md §9 |
| D113、D126 | CURRENT | → CLAUDE.md §8 |
| D115 | CURRENT | 校名、館名照 WORLD_NAMING → CLAUDE.md §7 |
| D116 | CURRENT | 遊戲裡的人不跟別人比 → CLAUDE.md §7 |
| D117 | CURRENT | 問使用者一律可點選的選擇題 → CLAUDE.md §3 |
| D118 | CURRENT | → CLAUDE.md §7 |
| D119 | CURRENT | CC 職責 → ROLE_CC（表 → CLAUDE.md §1） |
| D120、D128 | CURRENT | 建築場景 BB 標 ART_APPROVED、美術不經使用者 → CLAUDE.md §1 表＋ROLE_BB |
| D121 | CURRENT | CC 佇列 ≥5、剩 ≤2 主動要 → ROLE_BB＋ROLE_CC |
| D122 | CURRENT | 使用者的圖從對話紀錄取原檔（`chat_images.py`）→ CLAUDE.md §10 |
| D123 | CURRENT | PC 跑瀏覽器測試、`run_forever.ps1`、只推 cc-local → ROLE_CC（BB 回操作卡 → ROLE_BB） |
| D124 | HISTORY（已實作的遊戲規則） | 海商法選修 → 企劃線 `00_現行設定總表.md` §3 |
| D127 | CURRENT | AA 改稿與內容規則 → ROLE_AA |
| D129 | CURRENT | 交班就關自己的排程、取消 send_later → CLAUDE.md §4 |
| D130 | **SUPERSEDED**（D134） | 刪 |
| D131 | CURRENT | 瀏覽器測試排 PC、Node 全套以 GHA `node-unit-auto` 為準、雲端只跑改到的那幾支 → CLAUDE.md §8 一行＋ROLE_BB／ROLE_CC |
| D132 | CURRENT | LAWWW2 沒空驗收的模型交 BB 代驗 → ROLE_BB |
| D133 | CURRENT（D141 改：比對照做、不當退件） | → ROLE_BB＋ROLE_LAWWW2 |
| D134 | CURRENT | CC 可以直接找任何職位、判定照舊 BB → ROLE_CC |

### 3.3 `docs/AI_SESSION_HANDOFF.md` 逐節

| 行 | 節 | 分類 | 去處 |
|---|---|---|---|
| 1–7 | 檔頭 | HISTORY | 刪，換成一行「值班與交班紀錄（資料）」 |
| 8–37 | ⚠ 帳號 A 回來接班先讀（10-14～10-16 D 表） | HISTORY（重複） | 刪 |
| 38–54 | P0 緊急換班口令 | 重複 CLAUDE.md | 刪 |
| 55–69 | P0 工作中讀訊息（D76） | 重複 | 刪 |
| 70–84 | P0 新訊息優先與期末考（10-14） | 重複／期末考已取代 | 刪 |
| 85–94 | §0 重點 | 重複＋過時（「LAWWW-C」、「三小時」） | 刪 |
| 95–118 | §0a RULE_SOURCE、duty.json、`duty find／verify` | CURRENT | → CLAUDE.md §4（「現在：adoring-meitner…」那句過時，刪） |
| 119–160 | §0b 使用者要過的東西 | CURRENT（和 CLAUDE.md 開頭重複） | → CLAUDE.md §2 |
| 161–198 | §1 值班表 | KEEP-AS-DATA | 只留最新一段（`duty_state.py` 讀「X 值班中」）；舊段刪 |
| 199–216 | §2 狀態放在哪 | CURRENT（D59、「建築只有使用者」過時） | 改正後 → CLAUDE.md §4 一張表 |
| 217–229 | §3 怎麼找最新檔 | CURRENT | → CLAUDE.md §4（三行） |
| 230–262 | §4 接班十四步（＋HV-20／21／22 註） | CURRENT | 共通步驟 → CLAUDE.md §4；LAWWW 專屬（check、incr、verify、asks、branch_audit、sync、merge RULE_SOURCE）→ ROLE_LAWWW；BB／CC 接班必讀（PC 迴圈）→ ROLE_BB／ROLE_CC |
| 263–293 | §5 交班六類 A～F | CURRENT | → CLAUDE.md §4；LAWWW 加做的（matrix §1 快照、incr --advance、確認五職位排程已關）→ ROLE_LAWWW |
| 294–318 | §6 接班確認格式 | CURRENT | → CLAUDE.md §4 |
| 319–329 | §6b D84 | 重複 | 刪（ROLE_LAWWW） |
| 330–356 | §6c D86＋D85 | SUPERSEDED／重複 | 刪 |
| 357–710 | §7 啟動提示詞 14 份（55k 字） | CURRENT（使用者貼的） | 每個職位一份通用範本（帳號字母當變數）→ 各職位頁最後一節；**注意：D135 時使用者「沒選」「啟動提示詞改一份範本」，這次要用選擇題再問一次** |
| 711–725 | §8 使用者換班時說的話 | CURRENT | → CLAUDE.md §4 |
| 726–741 | §9 通訊 | 規則重複 CLAUDE.md；實測表 HISTORY | 刪 |
| 742–755 | §10 權限 | 大半 SUPERSEDED（D59、AA／BB 只改企劃線、三級劇情修改） | 各職位權限一行 → 各職位頁；其餘刪 |
| 756–761 | §11 排程 | CURRENT（兩行）＋HISTORY | 「別的帳號建的排程觸發時先看值班表、不是自己值班只讀」→ CLAUDE.md §4；其餘刪 |
| 762–796 | §12 交班紀錄 | KEEP-AS-DATA | 留 |
| 797–833 | §13 HV 版本紀錄 | KEEP-AS-DATA | 留，加一行 HV-30（本次重整） |
| 834–877 | §14 ACK 表 | KEEP-AS-DATA | 留 |

### 3.4 `docs/PROJECT_DECISIONS.md`

| 節 | 分類 | 去處 |
|---|---|---|
| 檔頭說明（「短期進度在 ART_REBUILD_PROGRESS」） | HISTORY | 刪 |
| D 決策表（150 列） | 混合 | 第 4.3 節逐條；整檔 **DELETE** |
| 決策變更紀錄 | HISTORY | 刪 |

### 3.5 `docs/USER_INSTRUCTION_LOG.md`

全部 73 節都是 10-14～11-05 的使用者原話紀錄（HISTORY／紀錄）。規則內容都已經變成 D 編號；記錄功能由 `user_asks_LAWWW.json`（HV-18）取代。**DELETE**；刪之前跑一次比對，把 user_asks／USER_WANTS 找不到的原話補進 `user_asks_LAWWW.json`。

### 3.6 `docs/HANDOFF_GAP_MATRIX.md`

| 節 | 分類 | 去處 |
|---|---|---|
| §0 怎麼用 | CURRENT 規則 | → ROLE_LAWWW，原地只留一行 |
| §1 交班快照 | KEEP-AS-DATA | LAWWW 交接檔（`duty_state.py` 的 HANDOFF_PROGRESS） |
| §2～§10、§14 | KEEP-AS-DATA | 任務閱讀版（`check_handoff.py` 第 9 項讀 ID） |
| §11 交班快照歷史（57k 字） | HISTORY | 刪（權威在 `snapshots/*.json`） |
| §12 A→B 對帳結果、§13 制度靜態驗證 | HISTORY | 刪 |

---

## 4. 搬遷計畫

### 4.1 新 CLAUDE.md 大綱（目標 22k～26k 字，現在 83.6k 字）

| § | 標題 | 內容 | 估字數 |
|---|---|---|---|
| 0 | 這是什麼、先讀什麼 | 遊戲一句話、線上網址、技術一句話；「先讀本檔，再讀 `docs/rules/ROLE_<你的職位>.md`；規則版本看 RULE_SOURCE」；D 編號是標籤、`grep -rn "D84" CLAUDE.md docs/rules` 找得到 | 1.0k |
| 1 | 五個職位與誰決定什麼 | 一張表：LAWWW（總監、整合、發布、角色美術驗收）、LAWWW2（美術總監、3D、場景程式）、AA（劇情總監、所有台詞、題目）、BB（測試總監、CG／2D 背景、建築場景 ART_APPROVED）、CC（BB 的測試執行、PC 佇列）；使用者保留：人物設定、感情走向、結局、付款授權；其他各總監自己定（D100、D109～D111、D119、D120、D128） | 2.0k |
| 2 | 使用者要過的東西（D101、HV-18） | USER_WANTS、暫停五欄、`user_asks_<職位>.json` 一則一筆、hook、`asks` 異常不得宣稱交接完整 | 1.8k |
| 3 | 使用者訊息優先（D90、D72、D76、D40、D117） | 回合 ≤10 分鐘、背景執行、先回再做、分類、被糾正不得偷做、【新指示確認】、選擇題、AI 間訊息（SENT／DELIVERED／ACK、標頭、只傳值班中同帳號）、`turn_check.py` | 4.0k |
| 4 | 接班、交班、值班（HV-17、D80、D92、D93、D94 outbox、D75、D129、HV-20） | RULE_SOURCE＝duty.json、`duty find`；共通接班步驟（約 9 步）；「現在換班」口令；交班六類 A～F＋snapshot＋`duty handoff`；全部待辦＋【表外】；outbox 當下登記；各職位交接檔路徑表；使用者換班說的話；接班確認格式；不叫醒休班帳號；交班關排程 | 5.5k |
| 5 | 自主連續工作（D87、D95、D96、D125、D86 餘下） | 回報不是停、只有五種情況可停、等人做不相依的、一回合多項、send_later 規則、批次回報、沒工作找誰 | 2.5k |
| 6 | 先做什麼（D99、D81、D141） | 三個優先項目、遭遇順序、場景 3 版就進遊戲 | 1.5k |
| 7 | 內容規則（D115、D116、D118、D137、D77 台詞面、D103） | 校名照 WORLD_NAMING、不跟別人比、學習考試職涯原則、台詞照 00_台詞寫作規則、重要劇情不能只用手機 | 1.8k |
| 8 | Git、保存、測試去處（D45、D113、D126、D88 原則、D131、D85 一行） | 每小時推、子代理檢查點、bundle、不 add .／不 force push／不碰 main（LAWWW 除外）、成果不能丟、休班分支不刪；瀏覽器測試排 PC、Node 看 GHA | 2.0k |
| 9 | 美術底線（D38 精簡、D4、D112、D136、D128） | 不用 primitive 冒充正式美術、Blender 優先、不准假建築、成人比例、淺色地板、不照抄校園建築、店名原創、美術驗收不經使用者 | 1.5k |
| 10 | 和使用者合作（舊 1～14、D122） | 繁中、原創、誠實標狀態、截圖驗收、不假修、手機優先、女主角資料不可改、題庫不可改、授權、不付款、不重寫能用的、先修 X 就只修 X、使用者的圖從對話取 | 2.0k |
| 11 | 工程底線（AI 合作 4～9、12～14） | 角色一致、不製造門檻、回歸影響、三種完成狀態、存檔負責、不過度設計、回報格式 | 1.8k |
| | **合計** | | **約 27k 字以內（目標 <30k）** |

### 4.2 職位頁大綱（`docs/rules/ROLE_*.md`）

**ROLE_LAWWW.md（開發、整合、發布）**
1. 職責與權限（D100 第 4 點、D100a 角色美術驗收、D110、D111、D85 授權範圍與界線）
2. 派工與監督（D84 第 1～6 點保留編號、D79 第 1～8 點保留編號、D110 監督、D95 第 6 點確認不閒置、D69 CG 確認就接、D100b 內容資料檔 AA 產生）
3. 接班、交班的 LAWWW 專屬步驟（check、roles、incr／`--advance`／`ignored` kind、duty verify／sync／register、asks、check_orphans、branch_audit、合併 RULE_SOURCE、matrix §1 快照、確認五職位排程關閉、換分工逐條重派 D101-4）
4. 總表與資料檔（tasks.json 為準、deliveries、wip.json、watermarks、story_import_allow 白名單、HANDOFF_GAP_MATRIX 的用法、只有值班 LAWWW 改規則檔）
5. 分支（D88 第 2、4、6 點、D114、D66、工具限制：用 PR 合併 main、刪不了就記）
6. 發布（D85 第 2、4、5 點、TESTING §五發布前清單、D101-5 發布前列「這版沒有的」、commit／push／Pages 三件事、RELEASES.md）
7. 程式地圖與開發參考（舊「目錄」「執行、測試、建置」「架構速覽」「常見改動」、存檔 key、VRM 彈簧骨 updateWorldMatrix、outline_probe 一次改一樣）
8. 啟動提示詞（一份範本）

**ROLE_LAWWW2.md（3D 美術、場景程式）**
1. 職責與權限（D100 第 3 點、D108、D111 美術總監、只推自己分支、改 engine3d／game3d 等先告訴 LAWWW、主動領工作 D84 第 2 點）
2. 製作規範（舊 MANDATORY 細節：工具表、Blender 流程、PBR、人物、效能、程序化資產五類、D144 setup_env.sh、D9、D10、D33、D5、D6）
3. 照參考圖做（D140 RULES_2D_TO_3D 全流程與工具表、D138 疊圖門檻與 TripoSR 限制、R1 CC0 掃描小道具、R2 參考圖鏡頭、D136 `--mode campus`、D133／D141）
4. 場景規則（SCENE_RULES §1～§12：座標、材質、節點名、手機預算、驗收截圖、交付、支援 AI 驗收清單、店面硬性驗收）
5. SOP 與新方法登記（ART_SOP §2～§10）
6. 交件與驗收狀態（BLOCKOUT → … → ART_APPROVED；交件附件；assets3d.js 標記區、`assets/models/env/second_ai/`）
7. 場景程式（多樓層 nav、改導航要跑的測試、sunYaw、柏油 asphalt 標記、`E.fogFar`、樹幹透視、遠景剪影、`nav_islands.py`、`reachability_all.py`）
8. 場景定案（舊 D22～D31、D35～D37、D41～D44、D53、D63、D107 的位置與做法，每條一兩行）
9. 美術 WIP 收斂（D88 第 3 點）
10. 啟動提示詞

**ROLE_AA.md（劇情、台詞、題目）**
1. 職責與權限（D100 第 1 點、D109、D100b、D100d 直接推開發分支的範圍、D100e 改程式裡的台詞字串、D111 劇情總監、D86 主動找沒完成的故事）
2. 寫台詞：指向 `docs/story_planning/00_台詞寫作規則.md`（**不搬**，`line_lint.py` 讀它的 §11）＋`00_人物口氣表.md`
3. 改稿與內容規則（AA_596／D127 全文、D103、D116 掃描責任、D57 公開文件隱私）
4. 設定與世界觀：指向 `00_現行設定總表.md`（D46、D47、D48、D55、D56、D58、D65、D102、D124 併進去）、`docs/WORLD_NAMING.md`（AA 維護）
5. 題目與學習內容（D12、D118 AA 部分、exam_ai）
6. 跟 LAWWW 的介面（D79 AA 側：收到問題給可直接實作的規格；交稿＝定稿）
7. 啟動提示詞

**ROLE_BB.md（測試、CG／2D 背景）**
1. 職責與權限（D100 第 2 點、只有 BB 判定 PASS／FAIL／GO、D120／D128 建築場景 ART_APPROVED、D132 代驗模型、D111 測試總監）
2. 測試規則（TESTING §〇三級 D83、§〇之一看畫面、§一規則、§二四層、D34 捷徑標示、Playwright≠iPhone、Node≠可玩、D100f 分層與發布條件）
3. 測試在哪裡跑（D131、D123、D139、BB_229 操作卡給使用者、SwiftShader 一次一支、不 `playwright install`）
4. 和 CC 的分工（D119、D121、D142、D143 BB 側、BB_00 第 144 行「BB 與 CC 工作分配」、BB_258 五條）
5. 美術驗收（D133＋D141 比對不擋、D136 像但不照抄、D138 疊圖、證據清單 MANDATORY 第 8 點）
6. 跟使用者要圖（D97、D104、BB_243 全部、CHARACTER_ART_SPEC）
7. 獨立驗收計畫（BB_300 §1～§3、§7 測試教訓）
8. 啟動提示詞

**ROLE_CC.md（測試執行）**
1. 職責（D119、D134 直接聯絡任何職位、判定歸 BB、只推 `claude/cc-testing`／`claude/cc-local`／`claude/gha-results`）
2. 工作流程（CC_50 全部，含 BB_258 五條、第三方素材、雲端共用）
3. 使用者電腦佇列（D123、D143 每 30 分鐘查三件事、少於 5 項補、常備回歸組、SOLO 放最後、`run_forever.ps1`、runner 推上去 PC 自動換新版；CC_29 操作卡；CC_00 最上面「★ 規則」）
4. GitHub 機器（D139 `browser-sweep.yml` → `claude/gha-results`、結果標示）
5. 佇列不空轉（D121 CC 側、D142）
6. 啟動提示詞

### 4.3 每條現行規則的唯一新家（D 編號總表）

| 新家 | D 編號（數量） |
|---|---|
| **CLAUDE.md** | D1、D2、D3、D4、D7、D8、D11、D12、D13、D14、D17、D19、D20、D21、D40、D45、D72、D75、D76、D77、D80、D81、D87、D90、D92、D93（登記面）、D94（outbox 面）、D95、D96、D99、D101、D105、D106、D111（表）、D112、D113、D115、D116、D117、D118、D122、D125、D126、D128、D129、D131（一行）、D136、D141、HV-17、HV-20（**48**） |
| **ROLE_LAWWW** | D54、D66、D69、D79、D82、D84、D85、D88（2、4、6、7）、D93（同步面）、D94（水位線面）、D100（第 4 點）、D100a、D100b、D110、D114、D135（incr 餘下）（**16**） |
| **ROLE_LAWWW2** | 規則：D5、D6、D9、D10、D15、D33、D38、D88（第 3 點）、D108、D138、D140、D144（**12**）；場景定案：D22、D23、D24、D25、D27、D28、D29、D30、D31、D35、D36、D37、D41、D42、D43、D44、D53、D63、D107（**19**） |
| **ROLE_AA**（含企劃線 `00_` 三份） | 規則：D52、D57、D100d、D100e、D103、D109、D127、D137（**8**）；設定併進 `00_現行設定總表.md`：D46、D47、D48、D55、D56、D58、D65、D102、D124（**9**） |
| **ROLE_BB** | D34、D83、D97、D100f、D104、D120、D121（BB 側）、D123（BB 側）、D132、D133、D139、D142（**12**） |
| **ROLE_CC** | D119、D121（CC 側）、D123（CC 側）、D134、D143（**5**） |
| **刪除（被取代或一次性，不寫取代說明）** | D16、D18、D26、D32、D39、D49、D50、D51、D59、D60、D61、D62、D64、D67、D68、D70、D71、D73、D74、D78、D86、D89、D91、D98、D100c、D130、D135（**27**） |

合計：150 個 D 編號（D1～D144＋D100a～f）＝刪 27、留 123（其中 28 條是場景定案／劇情設定，不是工作規則）。D88、D93、D94、D121、D123 兩邊各放一部分（各寫自己那一側，不重複），D135 只留 incr 那一句、其餘刪。

### 4.4 刪除清單

**開發分支（LAWWW 刪）：25 個檔／資料夾**
- `docs/PROJECT_DECISIONS.md`、`docs/USER_INSTRUCTION_LOG.md`（先補 user_asks）、`docs/REGRESSION_CHECKLIST.md`（先併進 TESTING.md）、`docs/SECOND_AI_HANDOFF.md`、`docs/DUAL_AI_BOARD.md`、`docs/ART_REBUILD_PROGRESS.md`、`docs/ADV_SYSTEM.md`、`docs/REVIEW_NOTES.md`、`docs/REVIEW_README.md`、`docs/TIMELINE_COMPAT_AUDIT.md`、`docs/WAKEUP_REPORT_2026-10-10.md`
- `docs/proposals/`、`docs/qa/`、`docs/test-reports/`、`docs/perf/`
- `docs/history/CLAUDE_superseded_1104.md`
- `docs/art-rebuild/TOOLCHAIN_AUDIT.md`、`docs/art-rebuild/second_ai/WORK_RULES.md`、`…/ART_SOP.md`、`…/SCENE_RULES.md`、`…/RULES_2D_TO_3D.md`（三份併進 ROLE_LAWWW2 後）、`…/HANDOFF.md`（舊副本）
- `docs/handoff/` 一次性文件 22 份（第 2.3 節）——另算
- `tools/make_review_zip.py`（索引的檔案已被 70e23b32c 刪掉）
- 檔內刪除：CLAUDE.md 約 60k 字、AI_SESSION_HANDOFF 約 100k 字（留 §1 最新段、§12～§14）、HANDOFF_GAP_MATRIX §0、§11～§13（約 60k 字）、TESTING.md 規則節、ART_DIRECTION §12

**LAWWW2 分支（LAWWW2 自己做）**
- 刪 `WORK_RULES.md`；把 `ART_SOP.md`、`SCENE_RULES.md`、`RULES_2D_TO_3D.md` 寫成 ROLE_LAWWW2 第 2～5 節後刪（D132 寫的「SCENE_RULES §5／§9／§11／§12」改指 ROLE_LAWWW2 的節）
- `HANDOFF.md` 留（工具讀），刪裡面的規則抄本（例：「⚠️ 新規則 D131」節）
- `TODO_SHORTCUTS.md` 的項目進 tasks.json 後刪；一次性盤點（ART_DIRECTOR_PATROL、BRANCH_CLEANUP_D88、SOURCE_FILES_1021、SHOP_VERSIONS_1105、ASSET_AUDIT_2026-10-16、BACKLOG_SWEEP_1021、CLOSED_SPACES_1023、ECON_3D_GAP_STATUS_1030、EVAL_J13_A21_D40_1027、INTERIOR_AAA_REVIEW_1028、queue_audit_1110、D40_第二階段…選擇題、VAC_A1_既有資產盤點）LAWWW2 判斷後刪

**企劃線（AA、BB 各刪自己的）**
- AA：`_開發分支規則副本/`（整個，10-16 的舊規則副本，最優先）、`00_先讀這份.md`、`00_世界觀基準_現代台大平行校園.md`（有效的併進現行設定總表）、`AA_00_四年劇情企劃書_合併版.md`、`README_新版_草稿.md`、`README_更名版_草稿.md`、`給開發組_交接板.md`、`AA_596`（併進 ROLE_AA 後）、`00_文件狀態表.md`（AA 判斷：刪完舊檔以後重寫成短表或刪）；`AA_交接紀錄.md` 留（工具讀），刪第 1172 行以後的 P0 規則抄本與舊 ACK
- BB：`BB_80_共同創作規則.md`、`BB_224`、`BB_225`、`BB_229`、`BB_243`、`BB_258`（併進 ROLE_BB／ROLE_CC／CLAUDE.md 後）、`BB_300` 規則節（覆蓋表留在 BB 自己的檔）；`BB_00_協作規範與交接紀錄.md` 留（工具讀），刪第 144～393 行的規則抄本（D100、D76、10-14、D45、D49、D50 等），「BB 與 CC 工作分配」「PC 迴圈」兩節搬 ROLE_BB
- 留：`00_台詞寫作規則.md`、`00_人物口氣表.md`、`00_現行設定總表.md`（AA 頁的附件）

**cc-testing（CC 做）**
- `CC_50_工作流程規則.md`、`CC_29_新runner_操作卡.md`、`CC_LOCAL_佇列.md` 併進 ROLE_CC 後刪；`CC_00_交接紀錄.md` 留（工具讀），最上面「★ 規則」節搬走；`CC_48`、`tools/cc_local/README.md` 是工具說明，留

### 4.5 要先決定的事（給 LAWWW／使用者）

1. **職位頁誰改、放哪裡**：建議放 RULE_SOURCE 的 `docs/rules/`；LAWWW2／AA／BB／CC 在自己分支改同一路徑，值班 LAWWW 合併（現行「只有值班 LAWWW 改五份規則檔」要改成「CLAUDE.md 只有 LAWWW 改；職位頁由該職位改、LAWWW 合併」）。
2. **啟動提示詞改一份範本**：D135 時使用者沒選這一項，這次用選擇題再問。
3. **D 編號**：保留當標籤（新家每條寫「（D84）」），不再新增 PROJECT_DECISIONS；新規則直接寫進 CLAUDE.md／職位頁，HV 版本紀錄留在 AI_SESSION_HANDOFF §13。

---

## 5. 會壞掉的東西

### 5.1 功能依賴（改了會真的壞）

| 讀什麼 | 誰讀 | 怎麼讀 | 計畫裡的處理 |
|---|---|---|---|
| `docs/AI_SESSION_HANDOFF.md` | `tools/handoff/duty_state.py`（`ROSTER_DOC`，第 30、218、262～268 行） | `duty verify` 第 9 項：檔案要存在、要有「<帳號> 值班中」；檔案不在就報異常；commit 只改它算「交班紀錄」不算繼續寫 | **路徑不改**，§1 留「現在：X 值班中」 |
| 同上 | `tests/handoff_duty_sim.py`（第 57、115 行） | 測試自己寫 `## 1. 值班表` | 標題保留 `## 1. 值班表` |
| `docs/HANDOFF_GAP_MATRIX.md` | `check_handoff.py`（`MATRIX`，第 45、384～404 行，第 9 項） | 讀所有 ID 對 tasks.json；檔案不在報異常 | 路徑不改；刪節只會少 ID，不會壞 |
| 同上 | `duty_state.py` `HANDOFF_PROGRESS` | 當 LAWWW 交接檔 | 路徑不改 |
| 同上 | `tests/handoff_check_unit.py`、`handoff_cc_unit.py`、`handoff_duty_sim.py` | 測試自己寫 | 不影響 |
| 職位交接檔 `docs/art-rebuild/second_ai/HANDOFF.md`、`docs/story_planning/AA_交接紀錄.md`、`BB_00_協作規範與交接紀錄.md`（備用名 `BB_00_交接紀錄.md`）、`CC/CC_00_交接紀錄.md` | `check_handoff.py ROLE_FILES`（第 502～507 行，`roles` 找「全部待辦」）、`incremental.py PROGRESS_FILES`（第 209～213 行）、`duty_state.py HANDOFF_PROGRESS`（第 31～33 行）、`duty.json` 的 `progressFile` | 照路徑讀、照路徑分類 commit | **四個檔都不改名、不刪**，只刪裡面的規則抄本；「全部待辦」標題要留著 |
| `docs/handoff/USER_WANTS.md` | `check_handoff.py asks`（第 628 行） | 讀表格第 1、3 節的狀態欄 | 不動 |
| `docs/handoff/BRANCH_INVENTORY.md` | `branch_audit.py`（`INV`）、`tests/branch_audit_unit.py` | `--write` 改其中一節 | 不動 |
| `docs/handoff/{tasks,deliveries,duty,watermarks,wip,story_import_allow}.json`、`snapshots/`、`user_asks_*.json`、`outbox_*.json`、`duty_*.json` | check_handoff、incremental、duty_state、`tools/story/check_orphans.py`、`check_lines.py` | JSON | 不動 |
| `docs/story_planning/00_台詞寫作規則.md` §11 的 ```lint 區塊 | 企劃線 `docs/story_planning/tools_aa/line_lint.py`（第 23～38 行） | 讀相對路徑 `../00_台詞寫作規則.md`；讀不到**靜默改用內建舊規則** | **不搬、不改名**；ROLE_AA 只指過去 |
| `.claude/settings.json` | Claude Code | UserPromptSubmit → `tools/handoff/user_ask_reminder.py` | 不讀文件；提醒文字寫 `user_asks_<…>.json`、`check_handoff.py asks`，不受影響 |
| `.github/workflows/node-unit-auto.yml` | GitHub Actions | 不讀文件 | 不受影響 |

### 5.2 70e23b32c 刪根目錄雜物以後已經壞的

- `tests/p0_movement.py`（第 10 行）、`tests/movement_regression.py`（第 10 行）**沒給網址時預設 `build/index.html`**，build/ 已刪 → 要改預設成 `/index.html`，或跑之前 `python3 build.py`（`build.py` 會重建 build/）。
- `tests/see_through.py`（第 68 行）、`tests/movement_regression.py`（第 76～144 行）寫 `screenshots/*.png`；`tests/stale_lock_escape.py` 寫 `shots/…`；`tests/flow_camp_y1.py`、`tools/shots/friends_name_shots.py` 寫 `shots/<子資料夾>`（後者有 makedirs）——Playwright 存截圖會自己建資料夾，但要跑一次確認；另外建議把 `screenshots/`、`shots/` 加進 `.gitignore`，免得又被提交。
- `tools/make_review_zip.py` 的索引列了已刪的 test_*.html、play.py、package.json、SOURCES.md、REVIEW_FILE_INDEX.txt → 刪這支工具。
- `tools/dev_scratch/vrmtest.py`、`vrmpose.py`（test_vrm.html）、`shots_final.py`（play.py）→ dev_scratch，不用修。
- `test_charlook.html` 有留（`tools/shots/char_lookdev.py`、`tools/vroid_build.py`、`tools/blender/char_second/*` 在用），不要誤刪。

### 5.3 只是文字指標（不會當掉，但會指到不存在的地方）

- `check_handoff.py` 的訊息：「規則：docs/AI_SESSION_HANDOFF.md 第 4、5 節」（第 2 行）、「總入口第 4 節」（第 33、175、191 行）、「D84 第 3 條」（第 337 行）、「D84 第 4、6 條」（第 352 行）、「D84 第 1 條」（第 360 行）、「D84 第 6 條」（第 365 行）、「AI_SESSION_HANDOFF.md 第 1 節」（第 502 行）、「AI_SESSION_HANDOFF.md 第 5 節 B 類」（第 693 行）→ 改成「CLAUDE.md §4」「ROLE_LAWWW D84 第 N 點」（ROLE_LAWWW 保留 D84 第 1～6 點的編號）。
- `duty_state.py`：「總入口第 4 節第 2 步」（第 122 行）、「總入口第 4 節」（第 252 行）、「第 1 節的值班表」（第 264 行）、第 307～308 行印出的十四步摘要 → 改成新 CLAUDE.md §4 的步驟。
- `branch_audit.py` 第 9、179 行（BRANCH_INVENTORY 的節名）→ 不變。
- `user_ask_reminder.py`、check_handoff 註解裡的「HV-18」「D93／HV-11」「D119／HV-22」→ 標籤，保留即可。
- `tasks.json` 的文字欄指到 `CLAUDE.md`（102 處）、`AI_SESSION_HANDOFF`（15）、`HANDOFF_GAP_MATRIX`（13）、`PROJECT_DECISIONS`（10）、`USER_INSTRUCTION_LOG`（4）、`ART_REBUILD_PROGRESS`（1）、`CLAUDE_superseded`（1）；`USER_WANTS.md` 指 `CLAUDE.md`（16）、`PROJECT_DECISIONS`（14）、`AI_SESSION_HANDOFF`（3）、`USER_INSTRUCTION_LOG`（1）；`deliveries.json` 指 WIP_INVENTORY（29，字串）→ 都是紀錄，不改；D 編號在新家查得到就夠。
- 程式註解：`src/assets3d.js` 第 66 行（第二個 AI 資產標記區「docs/SECOND_AI_HANDOFF.md」）、`build.py` 第 15 行、`tools/blender/env_second/run_*_acceptance.sh`、`street_props.py`（SECOND_AI_HANDOFF）；`tools/blender/setup_env.sh`（PROJECT_DECISIONS、TOOLCHAIN_AUDIT）；`tests/npc_ambient_unit.js` 第 5 行（CLAUDE.md）；`tests/date_t7a_unit.js`（AA_QUESTIONS_1021）、`tests/aa581_midterm_lines_unit.js`（D118_MIDTERM_UNSURE）、`src/story3d.js`（WEEK16_REFS）；16 支測試註解指 `docs/TESTING.md`（檔案留著）→ 改 SECOND_AI_HANDOFF 那幾行註解指 ROLE_LAWWW2，其他可以不改。
- 職位交接檔、企劃線文件裡大量「CLAUDE.md 某節」「AI_SESSION_HANDOFF 第 N 節」「SCENE_RULES §N」的引用 → 各職位整理自己的檔時順手改。

---

## 6. 主要風險

1. **規則抄本散在職位交接檔裡**（BB_00 第 144～393 行、AA_交接紀錄 第 1172 行以後、LAWWW2 HANDOFF 的「新規則」節、`_開發分支規則副本/`）：只刪開發分支的話，其他職位接班照樣讀到舊版。第二階段要四個職位都做完才算完成。
2. **職位交接檔不能改名**（三支工具＋duty.json 寫死路徑）；`00_台詞寫作規則.md` 不能搬（line_lint 讀不到會靜默用舊規則）。
3. **AI_SESSION_HANDOFF.md 不能刪**：`duty verify` 第 9 項要它存在且寫著「X 值班中」。
4. **USER_INSTRUCTION_LOG 刪之前**要確認裡面的使用者原話都在 user_asks／USER_WANTS，否則會丟掉唯一的原話紀錄。
5. **RULES_2D_TO_3D.md 兩條分支版本不同**（LAWWW2 分支多 17 行）：搬進 ROLE_LAWWW2 要用 LAWWW2 分支的版本。
6. **權限改變**：職位頁由各職位改，和「只有值班 LAWWW 改五份規則檔」衝突，要先定規則（第 4.5 節第 1 點）。
7. **啟動提示詞縮成一份範本**是 D135 時使用者沒選的選項，要先問。
8. **build/ 已刪**：兩支最常用的移動回歸測試沒給網址就會 404。
