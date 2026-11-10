# 設定驗證紀錄

日期：2026-11-10。本紀錄只描述 Codex 設定與唯讀 smoke，不是遊戲驗收或接班登記。

## 已完成的本機檢查

- CLI：`codex-cli 0.167.0-alpha.4`。
- `multi_agent`：`stable true`，沒有新增重複的啟用旗標或模型設定。
- `codex --strict-config app-server --print-startup-config`：exit 0。
- 真實 `skills/list`：六個 lawstudent Skills 均 enabled、repo scope、預期路徑，無 loader errors。
- 真實 `config/read`：五角色 description/config_file 及有效專案層 5/5 通過。
- 五角色 TOML 解析通過，均預設 `read-only`、含設定驗證停止門檻、不指定模型。
- `check_scope.py`：SETUP 正向檢查通過；CLAUDE.md grant 被拒絕，未修改該檔案。
- 所有原有 tracked 檔案仍與 origin/main 一致。

## 本機載入的必要條件

一般雲端沙盒將使用者 Codex home 設為唯讀；第一次 app-server 初始化失敗，需正常
權限審核後才能寫執行期 metadata。沒有更換 CODEX_HOME、複製 auth 或使用 API Key。
專案最初未受信任，真實 loader 正確回報角色設定被忽略。經本次授權，透過 Codex
config/value/write 的版本比對，只新增 `/workspace/Lawstudent` 的 trusted 項目；
保留其餘使用者設定與認證。重新驗證六技能、五角色皆通過。

## 五 worktree 與真實代理驗證

驗證基準 commit：`1fcb5b90aba0be5ea2d29561a3a80f5da7d1600d`。
此 commit 包含所有技能、五角色、入口及工具。後續補寫本報告，並修正下述 scope checker
的 index 層漏檢；角色、技能與多代理停止門檻未變更。

`smoke_worktrees.py` 實跑 exit 0，在 `/workspace/lawstudent-codex-smoke-20261110-v2/`
建立五個 detached sparse worktree，每個均核對相同 SHA、不同 gitdir／index、乾淨狀態。
初次 `--no-checkout` 的空 index 問題已修正為依 sparse 規則初始化新 worktree 的 index，
修正後重新從全新目錄完整跑過五職位；沒有 reset 既有 checkout 或修改遊戲檔案。

| 本次子代理 | 獨立 worktree 尾端 | 實讀角色技能 | 結果 |
| --- | --- | --- | --- |
| /root/smoke_lawww | LAWWW | orchestrator + handoff | 完整讀取、ACK、最終狀態乾淨、已結束 |
| /root/smoke_lawww2 | LAWWW2 | 3d-art + handoff | 完整讀取、ACK、D108 分工確認、已結束 |
| /root/smoke_aa | AA | story + handoff | 完整讀取、ACK、定稿權確認、已結束 |
| /root/smoke_bb | BB | qa + handoff | 完整讀取、ACK、最終判定權確認、已結束 |
| /root/smoke_cc | CC | local-test + handoff | 完整讀取、ACK、初判界線確認、已結束 |

主代理以主機原生 `spawn_agent` 派工，`list_agents` 實際同時觀測這五個子代理均為
`running`。各子代理完整讀取自己的 AGENTS、TOML、專屬 Skill 及 handoff Skill，
讀取目標 worktree 的 SHA／gitdir／status，向主代理 `send_message` 回 ACK。

主→CC 的 challenge：`LS-CODEX-20261110-7D42`。
CC 以 `send_message` 傳給本次 BB，BB 原樣回 ACK 並副本主代理，CC 收到後再次回報主代理。
**CC→BB→CC 真實往返成功**；不是只看工具存在，也未聯絡任何休班 Claude session。
主代理再送 REPORT，五角色確認乾淨後全部結束。

這證明五個 Codex 代理能平行進行唯讀工作，且本次團隊內支援即時互傳；
沒有測試五代理同時修改遊戲，也沒有宣稱跨任務／Codex↔Claude 的訊息橋接可用。

## 寫入範圍與衝突檢查

使用外部 smoke worktree 中**新建的 Codex 專用暫存檔**測試，結束後只刪除測試自行
建立的檔案，五個 worktree 再次確認乾淨。未動遊戲或 Claude 檔案。

| 檢查 | 實際結果 |
| --- | --- |
| SETUP 的精確允許清單 | 通過 |
| 要求允許 CLAUDE.md | exit 1，拒絕保護檔，未修改該檔 |
| 兩 worktree 修改同一路徑 | exit 1，parallel writers rejected |
| 兩 worktree 修改不同路徑 | exit 0 |
| untracked 檔不在允許清單 | exit 1，outside exact file grant |
| 範圍外檔 staged、工作樹還原為基準 | exit 1，仍識別 index 中的檔案並拒絕 |
| 清理暫存後五 worktree | 全部 status 為空 |

最後唯讀審查發現 scope checker 原本只看 base→worktree，會漏掉已 staged 但工作樹
還原為 base 的修改。已改為 committed／staged／unstaged／untracked 各層路徑聯集；
實際以 worktree 的 Codex README 測試該情境，確認普通 base diff 為空但 scope checker
仍 exit 1。測完恢復本次測試自己的 index／檔案，worktree 乾淨。

scope checker 是交付前拒絕機制，不是即時檔案鎖或 OS ACL。開工前仍須由 LAWWW
在既有任務派工中指派唯一 writer、基準 SHA 與精確檔案；不得共用 writable checkout。

## 最新規則與既有來源

已同步所有遠端分支；`duty find` 確認有效規則來源為
`origin/claude/modest-rubin-2lyp7g`、HEAD
`bb8a32765065cc64530791f42aee631e06133b12`、seq 124。
讀取原三份入口文件及 `docs/handoff/`；該來源有 1,844 個 tasks、1,271 筆 deliveries，
watermarks 包含五職位。它們完全未被這批設定修改，沒有新增 Codex 任務總表。

舊文件殘留的 BB 審稿／人物驗收、使用者獨占場景驗收、CC 只能聯絡 BB 等條文，
按 D100／D100a／D120／D134／D143 明確修訂解析。保留全部 Claude 原檔。
`duty.json.ruleVersion` 仍為 HV-20，不能只靠它判斷是否讀到最新規則；本次引用實際
RULE_SOURCE commit 與現行決策，未自行修正這個既有資料差異。

已盤點雲端技能（cloud-desktop、cloud-environment-runtime、setup）及本機既有技能，
不存在同名的六個 lawstudent 技能；只新增 repo-local 技能，沒有重複全域安裝。

## 界線

不測遊戲功能，不領取既有任務，不登記 duty、不改中央 JSON、不啟動 PC／瀏覽器佇列或
D143 排程。不合併 main、不發布 GitHub Pages。CLI 自訂角色載入與雲端主機子代理是
不同控制面；後者需在派工時明確提供角色設定、技能與 worktree 路徑。

五角色 TOML 預設 read-only；在本次 host-native 子代理讀入該檔案，不表示主機自動套用
該 TOML 的 OS sandbox。本次代理全部只讀，沒有要求或驗證遊戲寫入權。
正式開發仍需使用者批准、有效 duty 身分與分支協調、每個寫入者的獨立 worktree，
並依主機能力設定允許的寫入 sandbox。PC 連線、D143 排程及實機測試均未啟動。

當前環境的實測不是新機器還原測試。新任務需重新確認專案 trust、角色載入、主機
子代理工具與併發上限；不假設本次 live agents／worktree 路徑或 runtime 狀態會自動還原。

最終 diff 僅新增 `AGENTS.md`、`.agents/skills/` 與 `.codex/`，未修改任何原有 tracked
檔案。設定僅提交至 `codex/skills-multi-agent-20261110`；交付為 Draft PR，不合併或發布。
