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

## 待本次後續驗證填入

五 worktree、五代理並行、即時訊息 ACK、同檔衝突拒絕與最終變更範圍，將在完成實跑後
更新本紀錄；這一階段尚不把它們列為通過。

## 界線

不測遊戲功能，不領取既有任務，不登記 duty、不改中央 JSON、不啟動 PC／瀏覽器佇列或
D143 排程。不合併 main、不發布 GitHub Pages。CLI 自訂角色載入與雲端主機子代理是
不同控制面；後者需在派工時明確提供角色設定、技能與 worktree 路徑。
