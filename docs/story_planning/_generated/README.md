# _generated：AA 產生、給 LAWWW 直接換上的遊戲資料檔

> 使用者 2026-10-18 00:1x 同意：純內容的資料檔（題庫、課堂內容、台詞資料）由 AA 用開發分支的匯入工具產生，LAWWW 只合併、測試。遊戲不讀這個資料夾。

## 這一批（v9.10 最優先：全部題目、16 週版課堂內容）
- 產生方式：開發分支 `b42f050a` 的工具，來源 ref＝AA 分支 `7abe189a`。
  - `python3 tools/exam/import_exam_bank.py 7abe189a` → `exam_bank.js`
  - `python3 tools/syllabus/import_syllabus.py 7abe189a` → `syllabus.js`
- 換上：
  - `git show <這個 commit>:docs/story_planning/_generated/exam_bank.js > src/data/exam_bank.js`
  - `git show <這個 commit>:docs/story_planning/_generated/syllabus.js > src/data/syllabus.js`
- **exam_bank.js**：
  - 399 題（另有刑訴 QBANK 84 題在 `legal_qbank.js`），合計 483 題。
  - 和你 `e7c5c924` 的差別只有一題：`AI_CP2_10` scopeWeek 16→15。第 16 週的題目期末考抽不到，現在 0 題在第 16 週。
- **syllabus.js**：從 `aa318d13` 版換成 16 週版，44 門課裡 40 門有變。
  - 第 16 週併進第 15 週。
  - 民訴甲下重排、刑訴 w15 special。
  - Y4S2 法律專題研究 w6/7/10、海商 w13/14。
  - Y0S2 經濟系 w14～16 提前。
  - 口語審改字。
  - 第 16 週剩 0 筆。

## 測試（開發分支 `b42f050a`＋換上這兩檔）
- 通過：`aa130_exam_unit`、`exam_slots_unit`、`aa130_curriculum_unit`、`discuss_unit`、`presence_unit`、`text_fixes_1016_unit`、`v0_a1_unit`、`v0_e03_unit`、`v0_econ_chars_unit`、`v0_p1_unit`、`v2_chr_unit`。
- **要 LAWWW 更新預期值的三支**（內容是新的、測試寫的是舊的，不是資料錯）：
  1. `syllabus_unit`：特殊課週次 `econ_principles_y0_2` [16]→[15]（16 週制）、`legal_research` [10]→[6,7,10]（AA_263）。
  2. `v2_c15_unit` 第 1、3b 點：憲法二第 12 週 B4 回想改字（口語審）。新句：「演講最後，講者問：『被限制的人，最後可以去哪裡？』今天的黑板寫著一部分答案。」
  3. `class_ask_unit` 第 1 點：**換之前就已經失敗**（n=76 不一致）。換上以後 ask 週＝74：civil40 拿掉 2 個第 16 週的 askedIn（16 週制）。預期值改 74。

## 第二批：沛珊老家桃園→台中（2026-10-18，回 LAWWW-C 00:09 第三點）
- 檔案：`taichung_1018.patch`（對開發分支 `a895bc62` 的 `git diff`）。套用：`git apply docs/story_planning/_generated/taichung_1018.patch`（取自 AA 分支這個 commit）。
- 內容：
  - `docs/handoff/story_import_allow.json`：六筆的 sha 改成 `741e94f1`（ladder_bb、ladder_bb_y1s2、ladder_bb_y3s1、date_system/lines D04、D12、BB_178），格式不動、只改那六行。
  - `tools/msg/build_pool.py`、`tools/msg/build_msg2.py`：沛珊「放假、在桃園」三則、「她在哪裡」、build_msg2 兩處改台中；source 的 BB_178 改 `741e94f1`。
  - 重新產生：`src/data/ladder.js`、`src/data/msg_pool.js`、`src/data/msg2_pool.js`。
- `741e94f1` 比你白名單的舊版多改了兩句（AA 順過，使用者「整個暑假在老家」）：
  - D04 沛珊「我家那邊的電影院比較小，這間好大。」（原「台中的電影院比較小」不合理）。
  - 大一下閒聊：「暑假我要回台中幫家裡。課輔班的營隊，我只帶第一週。」（原「課輔班帶夏令營兩個禮拜，還有回台中幫忙」和整個暑假在老家衝突）。
- 測試（`a895bc62`＋這個 patch）：`msg_chat_unit`、`vac_hometown_unit`、所有讀 ladder.js 的單元測試 ALL PASS。
- **date_lines.js 沒有產生**：`tools/date/import_date_lines.py` 在你乾淨的 `a895bc62` 上就會停，因為白名單有重複的 approved（BB_188：`d171faef`、`05571a45`；AA_224：`ff3f2a4b`、`4e3a7c2b`，可能還有別的）。請你整理白名單的重複項以後再跑這支，D04、D12 就會換成台中版。

## 第三批：開發文件過時標記（2026-10-18，使用者授權 AA 自己改 CLAUDE.md、docs/）
- 檔案：`docs_outdated_1018.patch`（對開發分支 `aed7fbd8` 的 `git diff`）。只加標記、補現況，不刪任何內容。
- `CLAUDE.md`：
  - 期末考 D73 那兩處標「已被取代」，換成 483 題的現行規則。
  - 目前版本改 v9.9.1。
  - 「劇情暫停修改」標過時。
  - 視覺驗收 D59 改 D100a。
  - D86 整節標「已被 D100／D100a 取代」。
  - 「先問 AA-B」改成問值班 AA。
  - 雙 AI 舊段落標歷史。
  - 「目前狀態」開頭加現況。
  - 「目錄」補新檔。
- `docs/`：
  - DUAL_AI_BOARD、SECOND_AI_HANDOFF、WAKEUP_REPORT_2026-10-10 標歷史。
  - REVIEW_README、REVIEW_NOTES、TIMELINE_COMPAT_AUDIT 標部分過時，寫以哪份為準。
