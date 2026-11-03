# BB_250　Node 單元全套：GitHub Actions 對使用者電腦，速度評估（2026-11-03 起，BB）
- 使用者 11-03 01:1x：「這次測試 GitHub 免費跑，也要看他的速度，如果比我的電腦慢太多的話，如果我的電腦跑起來也不太花時間，那就還是給我的電腦跑，你要評估記錄他的時間。」
## 量法
- 同一個 SHA 的全套（約 890 支）牆鐘時間；結果要和雲端基準一致才算數（PC 先前有環境差異 22 支，修好前時間照記，但正確性另記）。
- 也記「佔不佔資源」：PC 跑 Node 時同一格不能跑瀏覽器測試（並行 3 格的其中一格）。
## 紀錄
| 日期 | 跑的地方 | SHA | 方式 | 牆鐘時間 | 結果 | 備註 |
|---|---|---|---|---|---|---|
| 11-03 | 使用者 PC | ef63b1877 | 一支一支依序（node_units.js），佔 1 格 | **3755 s（62.6 分）** | FAILED 95（CRLF 等環境差異） | 第一次 |
| 11-03 | 使用者 PC | ef63b1877 | 同上（LF） | **2953 s（49.2 分）** | FAILED 22（環境差異） | lf2 |
| 11-03 | GitHub Actions | bc8ffc08f | run 41557768927（01:08:44 UTC 開始） | — | **cancelled**（01:20:31，被 LAWWW 改目標取代，約 12 分沒跑完，不計） | 不算數 |
| 11-03 | GitHub Actions | 7224af47a | run 41558969904，910 支，4 支並行（xargs -P 4） | **測試本身 728 s（12.1 分）；整個 run 含排隊與安裝 848 s（14.1 分）** | conclusion＝failure（有失敗，清單在 artifact，BB 雲端沙盒下載被代理擋 403，改在雲端重跑同 SHA 找出失敗支） | 01:19:20–01:33:28 |
## 判斷規則（BB 定）
- GHA ≤ PC 的 1.5 倍（約 75 分）而且結果和雲端一致 → **GHA**（免費、不佔 PC 格子、不吃額度、和 Linux 雲端環境一致）。
- GHA 明顯更慢（>1.5 倍）而且 PC 的環境差異修到 0 → **PC**（使用者偏好：PC 快就給 PC）。
- 兩邊都慢 → 再看能不能把 GHA 拆成幾個並行 job。

## 下一位 BB／下次上班怎麼補完（額度可能先用完，使用者 11-03 提醒）
1. ToolSearch 載入 `mcp__github__actions_get`，`method=get_workflow_run`、`owner=pyhuanglaw`、`repo=lawstudent`、`resource_id=41558969904`。
2. status＝completed 時：牆鐘時間＝`updated_at − run_started_at`（或 `get_workflow_run_usage` 的 run_duration_ms）；結果看 conclusion＋job 日誌（`actions_list` 的 `list_workflow_jobs`，再看失敗支數）。
3. 若又被取消／重跑：`actions_list` `list_workflow_runs` `resource_id=node-sweep.yml` 找 claude/gha-node-sweep 最新那筆完成的。
4. 填進上表 → 套判斷規則 → 告訴使用者「GHA 幾分 vs PC 49 分，以後給誰跑」→ 若改回 PC，請 CC 把 queue.txt 的 N1 解除註解。
5. 怎麼讀結果（LAWWW 01:22）：conclusion＝success 就是沒有失敗。執行摘要分三份：失敗的、最後一行看不出結果的、輸出有「跳過／找不到」字樣的。**bookstore_exit 最後一行本來就是 `}`，不算失敗**。有失敗就記進總表（docs/handoff/tasks.json），交給下一班 LAWWW。LAWWW 那邊的時間紀錄在 `docs/handoff/GHA_TEST_OFFLOAD_1103.md` 第六節（456c343d0）。網址公開：https://github.com/pyhuanglaw/Lawstudent/actions/runs/41558969904

## 判定（BB，11-03 01:5x UTC）
- GHA 12.1 分 vs PC 49.2 分（PC 是一支一支依序、佔一格）→ **GHA 快約 4 倍，而且不佔 PC、不吃額度、環境和雲端一致 → Node 全套照舊給 GHA**。PC 只跑瀏覽器測試（PC 的 N1 維持註解）。
- 注意：GHA 的失敗清單要靠 run 頁面摘要（公開網址，使用者／人可直接看）或 artifact；雲端沙盒下載 artifact 被代理擋。

## 更正（BB，11-03 08:4x UTC；使用者質疑「12 分鐘是因為被中斷」）
- 被中斷的是第 1 次（41557768927，cancelled，本來就不計）。第 2 次（41558969904，7224）與第 3 次（41563231494，0f66，success、失敗 0）都跑完 910 支（log「共 910 支」、artifact 916 檔），測試步驟 728 s／748 s。12 分鐘成立。
- **但比較不對等**：GHA 是 `xargs -P 4`（4 支並行），PC 的 49.2 分是一支一支依序、只佔三格中的一格。「快 4 倍」主要是並行數差異，不是機器快；PC CPU 比雲端快，PC 若也 4 並行，估計 12～15 分（未實測）。
- 結論不變但理由改：Node 給 GHA＝免費、不佔 PC 格子（PC 專跑瀏覽器測試）、環境和雲端一致（沒有 CRLF 類誤報）；不是因為比較快。
