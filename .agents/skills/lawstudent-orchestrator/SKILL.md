---
name: lawstudent-orchestrator
description: Coordinate Lawstudent LAWWW integration, task dispatch, exclusive file ownership and delivery ACKs using the existing GitHub handoff system. Use for planning or integrating approved project work.
---

# LAWWW — 統籌與整合

先讀根目錄 `AGENTS.md`，確認當次授權。**目前僅設定及唯讀驗證；完成後停止，等待使用者正式啟動五 AI。** 本技能不授予接班、遊戲修改、main 合併或發布權。

## 開始前

執行 `git fetch origin '+refs/heads/*:refs/remotes/origin/*' --prune` 及
`python3 tools/handoff/check_handoff.py duty find`。用找到的 RULE_SOURCE 讀
`CLAUDE.md`、`docs/AI_SESSION_HANDOFF.md` 第 0a／4／5／13 節、
`docs/HANDOFF_GAP_MATRIX.md`、`docs/handoff/{duty,tasks,deliveries,watermarks,wip}.json`。
遵守 D100／D108／D119／D120／D134／D143；舊 BB 審劇情、BB 驗收人物、
使用者獨占場景驗收等條文已被明確修訂，不得恢復。

## 正式開發獲准後的派工

1. 先完成既有十四步接班，確認 duty 登記鏈和前任交班。唯讀 smoke 不登記 duty。
2. 只從現有 `tasks.json` 選工作；先檢查 owner、進行中的分支、既有交付及 WIP。
   P0 及 D99／D81 玩家順序優先，不重複施工。沒有任務 ID 的要求由有效 LAWWW
   按原制度登記，不另建 Codex 任務總表。
3. AA：劇情、台詞、課堂與題目；LAWWW2：3D 與 D108 場景程式；BB：QA、2D 圖需求；
   CC：依 BB 範圍執行測試。新劇情規格先找 AA，不自行補台詞或選項。
4. 任務訊息必須附：task ID、規格來源與 SHA、基準 SHA、角色、獨立工作目錄／分支、
   精確允許路徑、唯一 writer、驗收條件、接收者。先收到 ACK；沒有回覆就不標 ACK。
5. 每個會寫入的代理一個 worktree。同檔跨 worktree 修改也須串行；中央 JSON
   只由有效 LAWWW 寫。核心共享檔先排定 writer。Git worktree 是工作目錄隔離，
   不是 OS 安全邊界。主機提供角色選擇時使用 `.codex/config.toml` 的角色；
   沒有該欄位時明確指示子代理讀 `.codex/agents/<ROLE>.toml` 與對應技能。

## 接收與整合

依 `docs/handoff/OUTBOX_TEMPLATE.md` 接收完整 SHA、檔案清單、task、state、remaining、
next、receiver、ack、noDirectIntegrate。先核對 scope 與實跑證據；WIP／待審或
`noDirectIntegrate:true` 不直接合併。由 LAWWW 逐筆整合，按既有中央資料登記
deliveries 與 tasks；watermarks 只在既有 `incr` 全部檢查通過、push 並核對後前進。

角色美術由 LAWWW 看實際遊戲內證據，場景美術與最終測試判定交 BB；CC 初判不算
最終驗收。平時只自行跑必要的短 Node 測試；瀏覽器流程派 BB／CC，單一瀏覽器鎖。

輸出：本批任務 ID、已交／已整合／已驗收的差別、證據、未完成、阻礙、SHA 與下一步。
使用 `$lawstudent-handoff` 保存既有交接格式。設定驗證結束就停止，不啟動 backlog。
