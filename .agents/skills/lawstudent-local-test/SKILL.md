---
name: lawstudent-local-test
description: Execute Lawstudent CC assigned browser or local test probes, preserve raw evidence, manage authorized test queues and return preliminary assessments to BB. Use for test execution rather than final acceptance.
---

# CC — 測試執行與原始證據

先讀 `AGENTS.md`、`$lawstudent-handoff` 與最新 RULE_SOURCE 的 D119／D121／D130／D134／D143。
讀有效 CC 分支的 `docs/story_planning/CC/CC_00_交接紀錄.md`、CC_01 測試執行紀錄與
BB 的實際派工。當次只做 Codex 唯讀 smoke，不啟動 PC 佇列、回歸 backlog 或定期排程。

## 正式執行

1. 接收任務 ID、測試目標完整 SHA、範圍、優先序、指令與接收者。回 ACK，佇列工作
   回報排第幾項；直接收到 LAWWW／LAWWW2 派工時副本 BB，範圍和順序仍照 BB。
2. 測試目標以獨立 worktree 取出，不合併 LAWWW 的程式進 CC 分支。
   CC 稿件與探針放自己的有效分支；現有 Claude CC 分支為 `claude/cc-testing`，
   不因 Codex 安裝任意換掉 duty 記錄的有效分支。
3. 先確認所需 runtime／服務／瀏覽器、工作目錄與可用資源。靜態遊戲可由 repo 根目錄
   執行 `python3 -m http.server 8765 --bind 127.0.0.1`；驗證實際頁面行為，
   不以 port 已開當通過。僅停止自己啟動的程序。
4. 所有瀏覽器工作共用一把 `flock` 鎖。雲端無 GPU 時記 SwiftShader；不將雲端
   幀率或色彩結果當 PC／iPhone 驗收。Playwright 的 executable/cache 依實際環境
   設定，不改遊戲或測試內容來掩蓋缺少瀏覽器。
5. 記開始／結束、目標 SHA、原始命令與退出碼、捷徑、結果數、log、截圖和量測。
   產物放任務分配的暫存路徑，不覆蓋 tracked 截圖。失敗保留，標未跑／環境阻礙。
6. 探針與共用測試工具自身出錯可按 D143 修復並列出需重跑項目；不修改遊戲邏輯、
   台詞或素材。新／改探針先雲端試跑再進 PC 佇列，ID 唯一、SOLO 項目最後。

D143 的每小時 :11／:41 例行檢查只在正式值班、主機可用且獲准排程後執行；
查看正在跑的項目、最近 START／END 與未出結果數，依原規則補隊列，交班停用。
沒有主機連線或排程工具時明說能力缺口，不捏造已排程。

## 交付

所有結論標「CC 初判」交 BB；角色美術證據交 LAWWW、場景交 BB、副本 BB。
BB 保有最終 PASS／FAIL／GO 與分類權。沿用 CC 的原交接檔及 outbox，
不改中央 tasks／deliveries／watermarks／duty，不發布。可直接聯絡本次值班職位，
不可聯絡休班 Claude session。
