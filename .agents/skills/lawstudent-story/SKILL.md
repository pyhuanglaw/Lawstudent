---
name: lawstudent-story
description: Apply Lawstudent AA story, dialogue, character voice, legal classroom and exam-content rules. Use to prepare or review authorized narrative specifications and source deliveries without editing game runtime files.
---

# AA — 劇情與台詞

先讀 `AGENTS.md` 及 `$lawstudent-handoff`。目前僅允許唯讀設定驗證，不創作、修改或
匯入任何遊戲劇情；正式開發需使用者批准及既有接班寫入權。

## 權責與來源

以 `duty find` 找到的最新 RULE_SOURCE 讀 `CLAUDE.md` 的 D79／D100／D109／D118／D137，
及 `docs/AI_SESSION_HANDOFF.md`。AA 負責**所有**劇情、台詞、法律課堂與考題內容，
已授權範圍內的 AA 稿件為定稿，不恢復舊 BB 口氣審查關卡。人物設定、重大感情方向、
結局依現行使用者決策權，不因其他職位要求而改變。

從 duty 記錄定位有效企劃分支，用 `git show` 讀：

- `docs/story_planning/00_台詞寫作規則.md`（唯一台詞規範）；
- `docs/story_planning/00_人物口氣表.md` 第 1、2 節；
- `docs/story_planning/AA_140_v0到v6_交付實作驗收對照表.md` 及相關已批准企劃；
- 自己最新交接紀錄、「全部待辦」、現有 tasks／deliveries／outbox。

找不到來源或有矛盾就列出具體檔案、事件與問題，不根據舊對話猜設定。

## 正式工作流程

1. 確認既有任務 ID 與允許修改的精確企劃路徑；使用獨立 worktree／有效分支。
2. 核對學年、學期、日期、人物所在地與關係、既有事件 ID、前置旗標和後續銜接。
3. 交付包含台詞、選項、觸發／錯過處理、時間限制、旗標、關係變化及存讀檔要求，
   清楚區分定稿、PROPOSAL 與 WIP。法律內容附現有素材與可核查來源，不捏造法條。
4. 按現有規範執行 `tools_aa/line_lint.py`（以有效企劃分支的實際用法為準）；
   不創造 trivial passing tests，不把文字檢查冒充遊戲流程驗證。
5. 不直接編輯 `src/`、`assets/` 或遊戲 HTML，不改中央 tasks／deliveries／watermarks。
   在自己的 outbox 登記來源 SHA、精確路徑與是否允許匯入，交 LAWWW 接線；BB 負責測試。

交付給 LAWWW 的內容必須可直接實作；跨職位 ACK 和使用者未完成要求按原交接制度保存。
結束時列任務 ID、來源 SHA、改動路徑、未定事項與下一步，不因寫完文件就宣稱進遊戲。
