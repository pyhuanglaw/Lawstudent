# Lawstudent — Codex 入口

這份檔案是 Codex 的協作轉接層。`CLAUDE.md` 與 GitHub 上有效的 RULE_SOURCE 保留為既有制度來源；不改寫、不取代 Claude 規則。使用者當次授權與限制優先。

## 現在的授權界線

目前只授權 Codex 設定、Skills 與唯讀協作驗證。**完成設定後停止，等待使用者批准正式啟動五 AI 開發。** 不領取遊戲待辦、不登記接班、不啟動自動排程、不修改遊戲、劇情、Claude 規則或中央交接資料。禁止推送／合併 `main`、發布 GitHub Pages、強制推送。建立這批設定的獨立分支和 Draft PR 已獲授權。

## 先取得有效規則

1. `git fetch origin '+refs/heads/*:refs/remotes/origin/*' --prune`。
2. `python3 tools/handoff/check_handoff.py duty find`，依登記鏈取得 RULE_SOURCE；不得用最新 commit 時間或這份檔案中的舊分支名稱猜測。
3. 以 `git show origin/<RULE_SOURCE>:<path>` 讀 `CLAUDE.md`、`docs/AI_SESSION_HANDOFF.md` 第 0a、4、5、9、13 節、`docs/HANDOFF_GAP_MATRIX.md` 及 `docs/handoff/`。大檔分段讀，不把輸出截斷當成已讀完。
4. `CLAUDE.md` 中 D100、D108、D119、D120、D134、D143 等明確修訂優先於文件保留的舊段落；有未解衝突先回報，不自行變更制度。其他職位讀規則，不合併 LAWWW 的遊戲程式。

正式開發獲准後仍須依既有十四步接班程序，確認上一任交班及寫入權。設定驗證不是接班。不得冒用 Claude 工作階段 ID 或自行指定 A／B／C／D 帳號。

## 五職位與 Skills

| 職位 | 職責與裁定 | 啟用技能 |
| --- | --- | --- |
| LAWWW | 整合程式、規劃與派工；角色美術驗收；中央任務與交付資料的唯一寫入者 | `$lawstudent-orchestrator`、`$lawstudent-handoff` |
| LAWWW2 | 3D 場景、人物、模型、場景相關程式（D108）；重大核心檔先協調 LAWWW | `$lawstudent-3d-art`、`$lawstudent-handoff` |
| AA | 全部劇情、台詞、法律課堂與題目；已授權範圍內定稿，不恢復舊 BB 審稿關卡 | `$lawstudent-story`、`$lawstudent-handoff` |
| BB | 測試範圍、先後與最終 PASS／FAIL／GO；CG／2D 背景需求；場景美術驗收 | `$lawstudent-qa`、`$lawstudent-handoff` |
| CC | 探針、測試執行、原始證據與「CC 初判」；判定交 BB，可直接聯絡各值班職位 | `$lawstudent-local-test`、`$lawstudent-handoff` |

技能放在 `.agents/skills/<name>/SKILL.md`；不要重複安裝到使用者全域目錄。依工作內容讀對應技能的完整本文。角色設定在 `.codex/config.toml` 與 `.codex/agents/`；它們不會自行啟動五個代理。現有 `multi_agent` 已預設啟用，不重複設定旗標或指定模型。

## 單一任務來源與交付

- `docs/handoff/tasks.json` 是任務權威；`deliveries.json` 是交付權威；`watermarks.json` 是增量核對水位線。另沿用 `duty.json`、`wip.json`、既有角色 outbox／user_asks／snapshots。不得另建 Codex backlog、任務資料庫或平行狀態表。
- 只有取得值班寫入權的 LAWWW 修改中央檔。其他職位在自己的有效分支登記自己的 `outbox_<ROLE>.json`、`duty_<ROLE>.json`、`user_asks_<ROLE>.json` 及交接檔，由 LAWWW 收錄。設定階段不改這些檔案。
- 派工附既有任務 ID、來源、基準 SHA、唯一寫入者、精確允許路徑、工作目錄、驗收標準與接收者；以現有 `xai` 和 ACK 流程記錄。交付附完整 SHA、檔案清單、實跑結果、未完成項目、下一步與 `noDirectIntegrate`。
- 水位線只能按 D94：全部分類、無異常、commit＋push 並核對遠端後，以既有工具前進。不得為讓驗證通過而跳過未核對項目。

## 隔離、檔案所有權與通訊

- 每個**會寫入**的代理必須使用不同的 Git worktree／checkout 與有效分支；不得在同一 checkout 並行寫入。雲端原有 checkout 已隔離，沒有多寫入者時不另建 worktree；本次使用者明確要求多職位隔離，才建立驗證 worktree。
- 同一批任務每個檔案只能有一個寫入者。不同 worktree 的同檔修改也必須先排程串行或經 LAWWW 明確切分；核心檔與中央 JSON 不可並行改。交付由 LAWWW 逐筆檢查並整合，不互相覆蓋工作目錄。
- 提交前跑 `.codex/tools/check_scope.py --base <派工基準SHA> --allow <精確路徑> ...`；拒絕範圍外變更與保護檔。這是協作檢查，**不是 OS ACL**。原生子代理共用主機檔案系統；工作目錄、提示詞與 Git worktree 不等於安全沙盒。
- 預設五角色均為 `read-only`。若未來獲准寫入，須由已獲授權的主代理依執行環境能力配置 worktree 與寫入沙盒；不得在這次安裝驗證自動升權。
- 同一個 Codex 任務內可用主機提供的 spawn／send_message／wait 等工具；工具名稱依主機介面而定。子代理先讀角色設定與技能，回覆 ACK 後才工作。主機未提供角色選擇欄位時，主代理須在任務中明確給角色設定與技能的絕對路徑。
- 訊息不是持久交付。跨任務／跨帳號依既有 GitHub 交接；不傳訊息、不喚醒休班 Claude 帳號。不假設能用 Codex 工具聯絡既有 Claude session。
- 瀏覽器驗證一次只跑一個，以共同 `flock` 鎖序列化。CC 的最終判定仍交 BB；雲端 SwiftShader 不等於使用者 PC GPU 或 iPhone。D143 排程只在正式值班及相關主機可用時建立，交班停用。

操作與驗證方法見 `.codex/README.md`。不要因讀到自主開發的既有規則而越過本次「完成設定後停止」的明確指示。
