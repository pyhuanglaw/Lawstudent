# CC：D124 以後的測試腳本改版（海商法改選修）

- 日期：2026-11-02
- 背景：D124（`690ac5f4d` 起，發布候選 `b1b249873` 已包含）。大四下「海商法與海洋法」（`maritime`）改成選修（choice group `y4s2_mar`、`none:true`），被當只記成績，不延畢，也不排補考。程式判斷在 `faildelay3d.js` 的 `FD.counts`：必修或重修（`c.rt`）才會讓人延畢。大四下會延畢或要補考的情況只剩兩種：
  - 前面學期被當，重修排到大四下又沒過。這次和 LAWWW 一樣，用「大四上強制執行法 `enforcement` 被當 → 大四下重修」。
  - 日本路線的補修（`civpro_2_re`、`insurance_re`）。
- 受測版本：
  - `b1b249873`，解壓在 scratchpad 的 `hdb1`。
  - 修改前的對照 `d75871437`，解壓在 scratchpad 的 `hd10`。
  - 兩份都只讀，沒有改 `src/`，沒有開瀏覽器。
- 只改了 `docs/story_planning/test_tools/cc/` 底下的腳本。BB 的 `test_tools` 其他資料夾沒有動。沒有 commit，也沒有 push。

## 共通的新參數

| 參數 | 值 | 意思 |
|---|---|---|
| `FAIL_ROUTE` | `retake`（預設） | 【前置】大四上 `RETAKE_COURSE` 期末答對 0 題。接著用遊戲的 `CLS.planRetakes(G,'Y4S1')` 排進大四下，排的時候暫時包住 `CLS.failedIn`，只讓那一門算被當，排完就還原。最後只讓大四下重修的那一門答錯。 |
| | `maritime` | 舊規則：大四下海商法答錯。給 D124 以前的版本用。 |
| `RETAKE_COURSE` | 預設 `enforcement` | 重修的是哪一門課，必須是大四上考五題的課。 |

做法和 `cc_makeup_probe.py` 的 `PLANRT`、`n14_delay_retake.js` 的 `FD_COURSE` 一致。在 `hdb1` 上，`planRetakes` 排出的重修是 `{"id":"enforcement","from":"Y4S1","base":"Y4S1","term":"Y4S2","slots":[{"wd":1,"block":"am"}],"alt":false}`，課名「強制執行法（重修）」，期末考在 2029-05-28（一）上午。

## 1. audit_makeup_timeskip.js、audit_makeup_trip.js

- 改動：`y4s2()` 原本讓大四下第一門考五題的課答錯，那一門就是海商法。現在 `retake` 路線會先 `planRT(G)` 排好重修，大四下其他考五題的課都答對 3 題（包含海商法），只有重修的強制執行法答錯。執行時第一行會印出 `[前置] FAIL_ROUTE=…：大四下答錯的課＝…`。
- 用法：`WT=<受測資料夾> [FAIL_ROUTE=retake|maritime] [RETAKE_COURSE=enforcement] node audit_makeup_timeskip.js`（`audit_makeup_trip.js` 用法相同）。

| 執行 | 結果 |
|---|---|
| hdb1，預設 retake：timeskip | **ALL PASS**（A3、A4、B1、D1）。補考科目是強制執行法，A5、B2、E1 的延畢旁白也寫「強制執行法，你沒有去考」。 |
| hdb1，預設 retake：trip | **ALL PASS**（F1～F5） |
| hd10，`FAIL_ROUTE=maritime`：timeskip | **ALL PASS**，和舊版在 d9d637553 時的結果相同 |
| hd10，`FAIL_ROUTE=maritime`：trip | **ALL PASS** |
| 對照：hdb1，`FAIL_ROUTE=maritime` | timeskip 的 A0 補考是 undefined，A3、A4 FAIL；trip 的 F1、F2、F5 FAIL。這是舊腳本在新版本上會出現的假 FAIL，因為海商法已經不排補考。 |

## 2. m4_makeup_qs.js

- C 節：題庫縮小改用補考科目 `CC`／`CT`。
  - `retake` 路線縮的是 `enforcement` 在 Y4S1 的題庫，原本 8 題。
  - 【前置】大四上被當，用 `planRetakes` 排進大四下，再只考大四下。
  - k 超過 8 就等於全部 8 題。C2 也改成同一門課。
  - `FAIL_ROUTE=maritime` 照舊縮海商法 Y4S2 的題庫。
- A 節：我加了一個必要的小修正，任務沒有列，但不修會整節 FAIL。
  - D124 以後，大四下全錯時海商法不排補考。舊的 A0（補考科數＝大四下全部考五題的課）和 A1（每科補考 5 題）在 hdb1 每個種子都會 FAIL，共 48 項。
  - 現在先用 `FD.counts` 篩掉不會延畢的課，舊版本沒有 `FD.counts`，就全部算。
  - 新增 A5：不會延畢的課（maritime）沒有補考，也沒有補考紀錄。
- 用法：`[FAIL_ROUTE=retake|maritime] [RETAKE_COURSE=enforcement] nice -n 19 node m4_makeup_qs.js <資料夾> [種子數]`

| 執行 | PASS | FAIL | 說明 |
|---|---|---|---|
| hdb1，預設 retake | 168 | 24 | 24 項 FAIL 全部是 A4【嚴格】。強制執行法、法律倫理、刑事判決研討的題庫各只有 8 題，必然重複 2 題，舊版也一樣會 FAIL。C 節 k=4～11 全 PASS，突變 M1～M4 全部抓到。 |
| hd10，`FAIL_ROUTE=maritime` | 144 | 24 | 只有 A0 的檢查名稱多了「會延畢的」幾個字，其餘逐行和改版前的腳本（cc181b2b4 版）在 hd10 的結果相同。 |
| 對照：舊腳本，hdb1 | 96 | 72 | 多出來的 FAIL 是 A0、A1 各 24 項，都是 D124 造成的假 FAIL。 |

## 3. m5_save_size.js

- 改動：延畢路線原本是 `{failY4S2:'maritime',delay:true}`，現在改成 `{failY4S1:RT_COURSE,failY4S2:RT_COURSE,delay:true}`。走的是真正的遊戲流程：大四上期末全錯 → `showGrades`／`planRetakes` 排進大四下 → 重修期末全錯 → 補考全錯。`forceWrong` 也多看 Y4S1。
- 用法：`[FAIL_ROUTE=retake|maritime] [RETAKE_COURSE=enforcement] nice -n 19 node m5_save_size.js <資料夾>`

| 執行 | 延畢路線 | 2030-01-31 單一存檔 | 最壞情況總量 |
|---|---|---|---|
| hdb1，新腳本 | `FAIL_DELAY=["enforcement"]`，`FD_MAKEUP` fail，`y5.cls=16` | 283,949 字（555 KB） | 8.20 MB |
| hdb1，舊腳本（對照） | `FAIL_DELAY=[]`，**沒有延畢**，等於這條路線沒有測到 | 281,779 字 | 8.20 MB |
| hd10，舊腳本 | `FAIL_DELAY=["maritime"]`，`y5.cls=15` | 283,194 字 | 8.20 MB |

- 執行沒有出錯，數字和改版前大致相同。
- 檢查 1、2（總量小於 5 MB，以及小於 5 MB 的 80%）照舊 FAIL，和改版前一樣，不是這次改動造成的。

## 4. k1_exchange.js

- 改動：只改 `y4s2` 這個情境。
  - **TW**：大四上強制執行法被當 → 大四下重修又被當。
  - **US**：大四上人在美國，所以改成大三下被當一科，用 `base[(seed+1)%n]`，和 `y4s2b` 錯開 → 重修排進大四下 → 又被當。
  - **JP**：課池拿掉海商法，只剩 `civpro_2_re` 和 `insurance_re` 輪流。
  - `FAIL_ROUTE=maritime` 照舊。
- 用法：`[FAIL_ROUTE=retake|maritime] [RETAKE_COURSE=enforcement] nice -n 19 node k1_exchange.js <資料夾> [種子數] [--no-mut] [--v]`

| 執行 | 檢查 | FAIL | 突變漏抓 |
|---|---|---|---|
| hdb1，預設 retake（3 個種子） | 1938 | **16** | 0 |
| hd10，`FAIL_ROUTE=maritime` | 1908 | 20 | 0 |
| 對照：舊腳本，hdb1 | 1908 | 25 | 0 |

- 在 hd10 上，`FAIL_ROUTE=maritime` 和改版前腳本的 PASS／FAIL 逐行相同，只多了開頭一行 `FAIL_ROUTE＝maritime`。
- hdb1 的 16 項 FAIL：

| FAIL | 數量 | 和 K1 原報告（`CC_K1_exchange.md`）比較 |
|---|---|---|
| A6：US 國外學期，「法律」頁「這學期」列出台灣的課 | 12 | 一樣（K1-1） |
| F3：大五上重修和週二 10:00 法律實習撞時段（JP s1 y4s2b 刑訴、US s1 y4s2b 保險法） | 2 | 一樣 |
| F2、F4：US s3 y4s2 大三下被當的 `civpro_2` 重修又被當，大五上排不出重修（`FD.items` 週一上午，和 US 補修強制執行法同一時段），課表卻有列 | 2 | 就是 K1-2 的第二種情況（「US 一路重修被當民訴甲下」），問題還在。 |

- 和 K1 原報告不同的地方：
  - K1-2 的主要情況是「US 被當海商法，大五上排不出重修」，原報告每個種子都會 FAIL F2、F4。D124 以後海商法被當不延畢，這個情況已經不存在，新情境裡也不會再出現。
  - 舊腳本直接拿去跑 hdb1 會多出這些假 FAIL，都是因為海商法已經不延畢：
    - TW y4s2 的 E4（不排補考）×3
    - JP、US y4s2 的 E2（`FAIL_DELAY_COURSES` 是空的）×4
    - F2 ×4
  - 新情境裡 TW 的補考科目是 `["enforcement"]`，E4 PASS。US 的 `FAIL_DELAY_COURSES` 是 `["civpro_2"]` 或 `["labor_law"]`，E2、E3 PASS。
- INFO（不計 PASS／FAIL）和 K1 原報告相同：
  - JP 法律頁在國外學期名下列出課。
  - JP 出席 0 堂也拿「過了」。
  - US Y4S1 的 `examList` 仍回傳 5 場。
  - 交換路線大五上重修 0 堂時沒有 `FAIL_DELAY_CERT`。

## 5. cc_y4s2final_probe.py（Python，只改不跑）

- 改動只影響 `main` 和 `noexam_stay`。
- 加了 `FAIL_ROUTE`，預設 `retake`；受測科目 `MK` 預設 `enforcement`。
- 5/27 21:00 的存檔多放：
  - 大四上期末答對 0 題的紀錄。
  - 成績單「0 分（不及格，下學期重修）」。
  - 頁面裡用 `PLANRT` 排出的 `courses.retake`，`PLANRT` 是從 `cc_makeup_probe.py` 複製過來的。
- 期末考日不再寫死 5/30，改成照頁面裡 `CLS.examDay(重修那一門,'Y4S2','final')`。Node 在 hdb1 算出來是 2029-05-28（一）上午。
- 課名和成績那一句用 `MK_RE`：比對「強制執行法（重修）：」或「強制執行法：」，手機上的文字比對「…（考試）」。
- 海商法照玩家去考。
- 檢查和截圖名稱都改用 `MK`／`MK_NAME`：
  - 前置檢查：`termCourses` 有 MK，failedIn ⊆ {maritime, MK}。
  - `STATE.examDay` 改成看 MK。
  - `MSTAT`、強制帶進考場的判斷、`Y4S2:<MK>:final`。
  - 成績單 `grades[MK]`。
  - `FAIL_DELAY_COURSES` 要有 MK。
- `rescue_bar`、`rescue_nobar`、`rescue_study`、`rescue_bc`、`rescue_grades`、`y4s1fail_old`、`y4s1_retake_rescue` 是舊存檔救援，**保留海商法**，不受 `FAIL_ROUTE` 影響。
- 驗證：
  - `ast.parse` 通過。
  - 內嵌的 JS（`STATE`、`PLANRT`、`MSTAT`）用 node 的 `new Function` 檢查過語法。
  - `PLANRT` 的邏輯和 Node 的 `planRT` 一樣，已在 hdb1 驗證排得進 Y4S2。
  - **瀏覽器沒有跑**，還要由 CC 在 Playwright 上實跑。
- 用法：`LW_TESTS=<工作樹>/tests SHA=<sha> [CASES=…] [FAIL_ROUTE=retake|maritime] [RETAKE_COURSE=enforcement] python3 cc_y4s2final_probe.py '<URL>/index.html?turbo' <輸出>`
- 實跑時要注意兩點：
  - retake 路線的考試在 5/28 一早。存檔是 5/27 21:00，所以第一晚睡醒就是考試日，`today` 的直向和橫向截圖會在 5/28 拍。
  - 成績單那一句的課名格式（有沒有「（重修）」）是我照 `rtCourse` 的 `name` 推的，`MK_RE` 兩種都比對得到。

## 6. 給 BB 決定（沒有改）

- `docs/story_planning/test_tools/baseline_1102/routes2.js:49`：
  - X9「被當延畢、2030 報名 18 題」直接設旗標 `FAIL_DELAY:true,FAIL_DELAY_COURSES:['maritime']`。
- `docs/story_planning/test_tools/baseline_1102/routes3.js:50`：
  - 同一個 X9，但前面是 `if(0)`，目前沒有在跑。
- 這兩處是直接設旗標，不經過 `FD.check`。`FD.rescueElective` 只處理還在等補考的 `FD_MAKEUP`，不會碰 `FAIL_DELAY_COURSES`，所以這個情境技術上還跑得動。
- 但 D124 以後的遊戲不會產生「因為海商法延畢」的存檔。要不要改成 `['enforcement']`，並補上 `courses.retake`，由 BB 決定。

## 檔案

- 這次改的腳本：
  - `docs/story_planning/test_tools/cc/audit_makeup_timeskip.js`
  - `docs/story_planning/test_tools/cc/audit_makeup_trip.js`
  - `docs/story_planning/test_tools/cc/m4_makeup_qs.js`
  - `docs/story_planning/test_tools/cc/m5_save_size.js`
  - `docs/story_planning/test_tools/cc/k1_exchange.js`
  - `docs/story_planning/test_tools/cc/cc_y4s2final_probe.py`
- 執行紀錄在 scratchpad：`m4_*.log`、`m5_*.log`、`k1_*.log`。`*_orig` 是改版前的腳本（`cc181b2b4` 版）跑出來的對照。
- 注意：上層在 `66391989a`、`571e8a409`（WIP 存檔）已經把這段期間的部分改動 commit 進去了。這裡說的「改版前」是以 `cc181b2b4` 為準。
