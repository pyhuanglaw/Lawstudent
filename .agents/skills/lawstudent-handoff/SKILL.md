---
name: lawstudent-handoff
description: Follow Lawstudent existing duty-chain discovery, role handoff, outbox delivery, task reconciliation and incremental watermarks. Use before taking over a role or handing off approved work; do not create a second task authority.
---

# 五職位共用交接

先讀 `AGENTS.md`。**本次是設定與唯讀能力驗證，不是接班。** 不執行 register、sync、
snapshot、handoff、incr --advance 或任何會寫入既有交接資料的命令。
正式開發獲准後才依下列既有制度執行，不用 Codex 新帳本取代它。

## 唯一來源

`git fetch origin '+refs/heads/*:refs/remotes/origin/*' --prune` →
`python3 tools/handoff/check_handoff.py duty find` → 用 `git show` 讀找到的 RULE_SOURCE：
`CLAUDE.md`、`docs/AI_SESSION_HANDOFF.md` 第 0a、4、5、9、13 節、
`docs/HANDOFF_GAP_MATRIX.md`、`docs/handoff/`。
RULE_SOURCE 是登記鏈決定的有效來源，不是 main，不是 commit 時間最新的分支。
分岔、無法讀取或前任交班後仍寫入，停下相關範圍並回報，不擅自重設。

| 資料 | 原有權威與規則 |
| --- | --- |
| tasks.json | 唯一任務狀態與 owner；GAP_MATRIX 為閱讀版 |
| deliveries.json | 交付登記及 SENT／DELIVERED／ACK／ACTIONED；不能自行假設 ACK |
| watermarks.json | 五職位已分類水位線，依 D94 增量前進 |
| duty.json | 唯一中央值班登記鏈；只有有效 LAWWW 寫 |
| wip.json | 永久 WIP 索引，不無故刪未完成成果 |
| outbox_ROLE／duty_ROLE／user_asks_ROLE | 各職位只寫自己分支的紀錄，LAWWW 按原工具收錄 |

## 正式接班與寫入前提

完整遵循原十四步：同步分支、找 RULE_SOURCE、讀規則與自己交接、plan／check、
增量／角色／使用者要求核對、查暫停項與孤兒項、確認前任交班與寫入權、
保留有效成果、register、回報有證據的接班確認，再接續已批准工作。
適用命令以有效分支的工具 `--help` 及原文件為準；其他角色用 `--ref origin/<RULE_SOURCE>`。
不冒用 Claude session ID、不自行映射帳號；若 Codex 身分尚未納入原 duty schema，
先回報協調，不手改欄位或繞過拒絕。禁止把安裝 smoke 記成已完整接班。

## 交付與交班

- 沿用 `docs/handoff/OUTBOX_TEMPLATE.md`：task、branch、sha、files、state、remaining、
  next、noDirectIntegrate、receiver、ack。WIP 的 remaining 必填且不得直接整合。
  原模板允許先 commit 成果，再下一個 commit 補登自己的真實 SHA，不能填假的 SHA。
- 中央檔只由有效 LAWWW 寫；各角色保留自己的「全部待辦」與使用者要求，不覆寫對方。
  寫入先取得精確檔案範圍，每個 writer 有自己的 worktree；交付 commit 由 LAWWW 串行整合。
- D135 只有改遊戲的 commit 逐筆分類；文件仍由全部待辦與快照涵蓋，不能因此丟掉待辦。
  watermarks 只在全部分類、無異常、commit＋push 並核對遠端後用 `incr --advance` 前進。
- 原交班六類 A～F、全部待辦、快照、正式 duty handoff、commit＋push、遠端 SHA
  與通知都要有證據；只寫「我交班了」不等於登記完成。交班停排程並停止寫入。
- 同團隊 Codex 訊息可用本次主機工具；跨任務／帳號只靠 GitHub，禁止喚醒休班帳號。
  即時訊息不能取代持久交付，沒有測過的通訊方向明說未驗證。

回報分清：讀到的 SHA／規則、已跑檢查及退出碼、既有異常、未核範圍、未完成事項、
交付與 ACK 狀態。資料衝突或檢查未過時不能宣稱「完整交接」。
