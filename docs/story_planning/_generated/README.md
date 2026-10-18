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
