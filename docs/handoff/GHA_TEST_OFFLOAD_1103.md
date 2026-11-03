# GHA-TEST-OFFLOAD-1103：評估把不需要使用者電腦的自動測試改由 GitHub Actions 免費執行

> 任務總表：`docs/handoff/tasks.json` 的 `GHA-TEST-OFFLOAD-1103`；USER_WANTS X154；使用者要求檔 `user_asks_LAWWW.json` UA-LAWWW-1103-04（開題）、UA-LAWWW-1103-05（這份背景與驗收標準）。
> 狀態：**還沒做**。這份只是背景、評估項目與驗收標準；**輪到時先做小規模效能比較、交白話評估報告，再決定要不要擴大**。不要直接跑 900 支、不要直接建完整的 GitHub Actions 系統。
> 已完成的前置：GHA-NODE-TRIAL-1103（試用分支 `claude/gha-node-trial`、`.github/workflows/node-trial.yml`、只跑 `tests/nav_levels_unit.js`；https://github.com/pyhuanglaw/Lawstudent/actions/runs/41554813408 成功，整個 job 49 秒，其中下載專案約 45 秒、測試本身約 1 秒）。

## 最終目標（使用者原話）
「最終目標不是盲目把所有測試搬到 GitHub，而是找到整體最省錢、最省 Claude 使用量，又不會降低測試品質的分工方式。」
「GitHub 負責免費執行適合的例行測試，我的電腦負責需要實際畫面與操作的測試，Claude 負責分析與修正問題。三者不要重複浪費資源。」

## 一、已查到的 GitHub Actions 資訊（使用者 2026-11-03 提供）
1. 《Law Student》目前是公開 repository，GitHub 標準 Linux runner 原則上免費，不扣 Claude 額度、不需要 Claude API。
2. 若未來改私人 repository：GitHub Free 每月約 2,000 分鐘標準 Linux 額度；超過一般 Linux 約 US$0.006／分鐘（以當時官方價格、帳號設定為準）。
3. 標準 GitHub-hosted runner 單一 job 上限一般 6 小時。
4. 公開專案免費不代表所有資源無限：大型 runner、artifact 儲存、快取等可能另外計費。
- 官方：https://docs.github.com/en/billing/concepts/product-billing/github-actions 、https://docs.github.com/en/actions/reference/limits

## 二、可能比較慢的因素（要納入評估，不能只確認「可以跑」）
1. **每次啟動都有準備時間**：試跑 49 秒裡約 45 秒在取得專案、準備環境，測試約 1 秒 → 短測試每支各開一個 job 會浪費在準備；評估合併執行、避免重複下載。
2. **大型 3D 圖片、人物模型**：每次下載整個 repo 會拖慢純 Node 測試；評估減少不必要的下載（例：sparse checkout、只取 src／lib／tests／data），**但不能漏掉測試需要的程式、資料或歷史版本**。
3. **GitHub 雲端機器不一定比本機快**：下載、啟動、大型測試可能偏慢，也有人遇過網路異常、快取慢、偶發失敗；**以本專案實測為準**（可參考 GitHub Community、Reddit 討論找實際瓶頸，不單純相信宣傳或個別經驗）。
4. **分批平行不一定越多越快**：每批都要重新開機器、下載專案。比較：①全部放同一個 job；②少數幾批同時跑（4 批、8 批）；③平常只跑受影響的、重要整合或發布前才跑全部。以實際總時間、資源消耗、可靠性決定，不預設越平行越好。
5. **測試可能因為缺少舊版本而被跳過、卻顯示成功**（重要）：試跑的 `nav_levels_unit.js` 第 1 段要 `git show 92acd48`，GitHub 預設淺層下載會讓這段跳過。後續必須確認**所有必要測試都確實執行**，「找不到資料而略過」不能算通過；需要企劃分支、歷史版本（例：白名單 SHA、`git show <舊SHA>`）、測試資料的要取得完整，或改成找不到就 FAIL。

## 三、要實際比較的效能與成本（同一個遊戲版本、相同測試範圍）
1. GitHub 取得專案花多久。
2. 準備測試環境花多久。
3. 實際執行全部 Node 測試花多久。
4. 單批 vs 分批平行，哪個快。
5. 有沒有測試被跳過、漏跑、因環境差異失敗。
6. 相較現在由 Claude 執行，能減少多少重複工作。
7. 若改私人專案，每月大約多少錢。
8. 免費機器夠不夠、是否完全不需要買付費機器。
- **分開寫「測試完成的總時間」和「Claude 實際要投入的時間」**：GitHub 跑得慢，只要 Claude 不必全程參與，也可能比較有效率。

## 四、與使用者電腦測試的分工
- 已排在使用者電腦的 3D 畫面、人物動作、碰撞、操作流程、截圖測試**維持現有安排**（D123：`tools/cc_local/run_queue.py`、`run_forever.ps1`、佇列 `claude/cc-testing` 的 `tools/cc_local/queue.txt`、結果 `claude/cc-local`）。
- **先確認 BB／CC 正在用的本機測試系統，不重複建立、不干擾。**
- GitHub 優先：不需要實際畫面的 Node 測試、資料檢查、遊戲規則、劇情條件檢查。
- Claude：分析結果、修正問題，不是每次重跑大量重複測試。

## 五、執行限制與交接
- 現在只補充資料；**不跑 900 支、不建完整系統**；沿用任務 ID GHA-TEST-OFFLOAD-1103，不另開重複任務；遊戲整合照原計畫。
- 輪到時：**先小規模效能比較，再決定是否擴大**。
- 白話評估報告要回答：
  - 值不值得全部搬到 GitHub？
  - 能省下多少 Claude 工作？
  - GitHub 會不會比較慢？慢在哪裡？
  - 怎麼安排最快、最省資源？
  - 對目前本機測試有沒有影響？
  - 未來如果要付費，大約會花多少錢？
- 分工：LAWWW 統籌、交報告；測試範圍與判定由 BB（D100），CC 執行（D119）。
