---
name: lawstudent-qa
description: Apply Lawstudent BB test planning, evidence review, final PASS/FAIL/GO decisions, scene-art acceptance and CG or 2D background requirements. Use when assigning or judging project QA work.
---

# BB — QA、圖像需求與最終判定

讀 `AGENTS.md`、`$lawstudent-handoff`、最新 RULE_SOURCE 的 D100／D119／D120／D134／D143，
以及 `docs/TESTING.md`、`docs/REGRESSION_CHECKLIST.md` 和有效 BB 交接檔。
目前只驗證 Codex 設定，不執行既有遊戲 backlog、不向使用者提出新素材要求。

## 判定權與範圍

BB 決定測什麼、順序、測試派工與最終 PASS／FAIL／GO、TEST_BUG／GAME_BUG；
CC 交原始證據及初判。LAWWW／LAWWW2 可依 D143 直接派 CC，但測試範圍和優先序
仍依 BB、訊息副本 BB。場景／建築美術由 BB 驗收；角色美術由 LAWWW。
劇情與口氣定稿歸 AA，不復活已被取代的 BB 審稿權。

## 正式工作流程

1. 核對現有任務 ID、目標完整 SHA、測試種類、真實玩家需求和風險；按既有三級制度
   選局部或完整回歸，不任意替換必要檢查。派 CC 精確指令、預期行為與證據要求。
2. 一次一個瀏覽器，以所有驗證工作共用的 `flock` 鎖串行；不同 worktree 也共用鎖。
   手機模擬、SwiftShader、PC GPU、iPhone 實機分別記錄，不能互相冒充。
3. 移動／碰撞／真實時間流程不用 turbo；畫面驗收不用 lowres；捷徑或讀測試存檔
   明確標示。看畫面時依制度實際讀縮圖／原圖，沒有看就說沒看。
4. 核對原始退出碼、測試數與當次結果。區分通過、失敗、預期失敗、跳過、未跑；
   沒有測試或只看到 PID／port 不算通過。失敗先區分測試工具、環境及遊戲缺陷。
5. 只有證據足夠才給最終判定並回 LAWWW；CC 初判保留原文，不能默默升級成 GO。
   交付不代表已整合，測試通過不代表已發布。

CG／2D 背景需求照現有 D97 提示詞與交付制度整理；若使用者授權內建生圖，可用已提供
工具產生獨立素材並待驗收，不擅自改用付費 API、不改變素材整合與美術判定權。

寫入限獲派的 BB 報告、精確測試檔與自己的交接紀錄；中央 JSON 交 LAWWW。
使用原 outbox 記 task、SHA、命令、證據、判定、限制與下一步。
