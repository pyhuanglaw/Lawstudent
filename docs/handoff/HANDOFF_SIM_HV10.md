# 三帳號交接模擬測試結果（HANDOFF-ABC，D92／HV-10）

> 使用者 2026-10-16 21:35 要求：「模擬只能使用測試資料、臨時工作區或只讀驗證，不得真的轉移值班權、覆蓋正式紀錄或發布遊戲」，每一項要有 PASS／FAIL 與具體結果。
> 做法：`tests/handoff_duty_sim.py` 在暫存資料夾開一個假的 origin（bare repo），模擬 A、B、C 三個帳號的四個職位各自 clone、工作、交班、接班，用的是正式的 `tools/handoff/check_handoff.py`（`duty find／plan／register／handoff／sync／verify`、`snapshot`、`check`）。**不碰正式 repo、不 push 到 GitHub、不叫醒任何工作階段**；跑完刪掉暫存資料夾。
> 跑法：`PYTHONDONTWRITEBYTECODE=1 python3 tests/handoff_duty_sim.py`（約 8 分鐘）。第 4 輪（工具 `b1d95de2`）**19／19 PASS**（2026-10-16 21:5x UTC）；register 加了「補登記」以後第 5 輪（工具 `73d93699`）**19／19 PASS**（2026-10-16 22:1x UTC）。
> 前三輪的失敗與修正：第 2 輪 9／19（`__pycache__` 被 commit、交班紀錄本身被當成「交班後還在寫」、check 用 `--no-git` 少查一項、分岔情境沒先 fetch）；第 3 輪 17／19（帳號休班回來再交班，舊的交班紀錄被誤判成兩個帳號同時寫；AA 情境沒先 fetch）；都修了工具或測試，**沒有放寬判斷標準**。

| # | 情境 | 結果 | 具體結果 |
|---|---|---|---|
| 1 | A → B | **PASS** | 找到 RULE_SOURCE＝A 的 LAWWW 分支、check／verify OK、四職位改登記 B、上一任 A、A 的任務和四職位的成果都在 |
| 2 | A → C | **PASS** | 找到 RULE_SOURCE＝A 的 LAWWW 分支、check／verify OK、四職位改登記 C、上一任 A、A 的任務和四職位的成果都在 |
| 3 | B → A | **PASS** | 找到 RULE_SOURCE＝B 的 LAWWW 分支、check／verify OK、四職位改登記 A、上一任 B、B 的任務和四職位的成果都在 |
| 4 | B → C | **PASS** | 找到 RULE_SOURCE＝B 的 LAWWW 分支、check／verify OK、四職位改登記 C、上一任 B、B 的任務和四職位的成果都在 |
| 5 | C → A | **PASS** | 找到 RULE_SOURCE＝C 的 LAWWW 分支、check／verify OK、四職位改登記 A、上一任 C、C 的任務和四職位的成果都在 |
| 6 | C → B | **PASS** | 找到 RULE_SOURCE＝C 的 LAWWW 分支、check／verify OK、四職位改登記 B、上一任 C、C 的任務和四職位的成果都在 |
| 7 | A → B → C → A | **PASS** | 最後的 A 接到 C 的最新成果（3 班的任務、四職位的工作都在）、上一任＝C（不是自己上次交出去的那一班） |
| 8 | A → C → B → A | **PASS** | 最後的 A 接到 B 的最新成果（3 班的任務、四職位的工作都在）、上一任＝B（不是自己上次交出去的那一班） |
| 9 | 帳號 A 連續休班多次（A→B→C→B→C）才回來 | **PASS** | 最後的 A 接到 C 的最新成果（5 班的任務、四職位的工作都在）、上一任＝C（不是自己上次交出去的那一班） |
| 10 | 上一班沒有正式交班 | **PASS** | 沒有使用者指示就拒絕接班；使用者明確要求（--user-ok）才接，並記 no-handoff 異常、verify 不報正常；成果照遠端最後 push 的狀態接上 |
| 11 | 某職位交班資料缺漏（BB 沒交班） | **PASS** | BB 的接班被擋（要使用者指示）、verify 報「BB 還在 A 手上」，不假裝正常 |
| 12 | 某職位有未整合的 WIP 分支 | **PASS** | verify 列出「還有 N 個 commit 沒整合」（不能當完成、不能刪） |
| 13 | 交付送達沒 ACK（LAWWW2-C 的交付停在 DELIVERED） | **PASS** | check 報異常 11，不算完成 |
| 14 | 新舊規則來源不一致（ruleSource 不是值班 LAWWW 的分支） | **PASS** | verify 報異常 3 |
| 15 | 兩份值班狀態的登記鏈分岔（A 的舊分支自己又登記） | **PASS** | duty find 不自己選、回報使用者（結束碼 1） |
| 16 | 值班登記和 commit 時間衝突（A 交班以後的分支有更新的 commit） | **PASS** | duty find 照登記鏈還是選 B，不看 commit 時間 |
| 17 | 同職位兩個帳號疑似同時寫入（A 交班後還 commit 到 LAWWW 分支） | **PASS** | verify 報異常 6、要求查清楚以前不合併不覆寫 |
| 18 | 同職位兩個帳號同時寫入（AA） | **PASS** | verify 也抓得到 |
| 19 | 交班快照不存在／壞掉 | **PASS** | verify 報 REMEDIAL_FULL_AUDIT；check 在最新快照壞掉時結束碼 2（不能報正常） |

## 對照使用者要求的模擬項目

| 使用者列的項目 | 對應 # |
|---|---|
| A→B、A→C、B→A、B→C、C→A、C→B | 1～6 |
| A→B→C→A、A→C→B→A | 7、8 |
| 帳號休班很久才回來 | 9（A 休了 4 班） |
| 上一班沒有正式交班 | 10 |
| 某職位交班資料缺漏 | 11 |
| 有未整合的 WIP 分支 | 12 |
| 交付已送達但沒 ACK | 13 |
| 新舊規則來源不一致 | 14、15 |
| 值班登記和 commit 時間衝突 | 16 |
| 兩個帳號同時寫同一職位 | 17、18 |
| 交班快照不存在或壞掉 | 19 |

