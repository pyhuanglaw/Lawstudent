# BB_256 Playwright 失敗自動追蹤與重現系統（使用者 2026-11-04 04:4x UTC 對 BB 的規格，原文照存）

- 任務 ID：**TEST-TRACE-1104**（USER_WANTS 請 LAWWW 開列）
- 分工（照使用者原文）：**CC 規劃與實作**；**BB 驗收**；涉及遊戲本體的修改交 LAWWW。
- 優先：不得中斷正在執行的重要測試（目前 PC 佇列：GG_perf_rep → GG_perf_fog／GATE → GG_int → GG_shops2 → STUDY…）。CC 先做最小可行版（2～3 支代表性測試），驗證有效再整合進 run_queue。

## BB 驗收清單（對照規格第七、八節；全部要有證據，不得改測試標準製造 PASS）

| # | 情境 | 通過條件（BB） | 證據 |
|---|---|---|---|
| V1 | 正常測試通過 | 結果 PASS；local_out 只有 log＋meta（SHA、時間、環境），**沒有 trace.zip、沒有錄影** | 目錄清單＋大小 |
| V2 | 故意的斷言錯誤 | 首次 FAIL → 自動重跑 1 次（同 SHA、同腳本版本、同存檔／種子／輸入）→ 仍 FAIL → 分類 `GAME_BUG` 或 `TEST_BUG`（依注入點）＋trace.zip＋report.json | report.json、trace.zip |
| V3 | 第一次失敗、第二次通過 | 分類 `FLAKY`；首次 FAIL 的證據保留；**總結果不得是 PASS** | report.json 兩段 |
| V4 | 錯誤選擇器 | 分類 `TEST_BUG`，report 指出是哪個 selector／等待條件 | report.json |
| V5 | 遊戲 JS 例外 | 例外訊息＋stack＋發生前後截圖＋遊戲狀態快照 | report.json、png |
| V6 | 瀏覽器異常退出 | 分類 `ENVIRONMENT`（不是 GAME_BUG），留下 stderr／exit code | report.json |
| V7 | timeout | 正確中止；最多重跑 1 次；不無限循環；狀態寫明 timeout | run.log、report.json |
| V8 | 兩個測試同時跑（--parallel 2） | 兩份證據各在自己的目錄，不互相覆蓋、不混檔 | 目錄清單、檔案 hash |
| V9 | Trace Viewer | **實際用 `playwright show-trace` 開一份**，附截圖證明看得到時間軸、DOM snapshot、畫面 | 截圖 |
| V10 | 遊戲狀態快照 | 至少：zone、day／date、hour、玩家座標與 lv、事件旗標（變動的那些）、ADV／對話狀態、busyDepth、lastTalkError | report.json |
| V11 | 環境資訊 | commit SHA、測試 ID、腳本版本（cc-testing SHA）、瀏覽器版本、GPU renderer、turbo／讀檔捷徑標示 | report.json |
| V12 | 既有功能不壞 | GPU 加速、佇列、平行、worktree、timeout、回傳、run_forever 自動接續都照舊；拿一支既有測試前後各跑一次比結果 | run.log |
| V13 | 保存規則 | 單一 trace 有大小上限（CC 定數字並寫明）；PASS 不留大檔；推送前掃描本機絕對路徑、Cookie、Token；有清理政策 | 規則文件＋掃描結果 |
| V14 | 成本 | 每次失敗多花的磁碟、CPU、GPU、時間有實測數字 | 報告 |

分類規則（BB）：CC 可以初判，但**只憑 timeout 不得判 GAME_BUG**；證據不足一律 `UNKNOWN`；最終由 BB 判。

---

## 使用者原文

# LAWSTUDENT｜Playwright 失敗自動追蹤與重現系統

## 一、任務目標

請為 Lawstudent 現有的 Playwright 自動測試系統，建立「**測試失敗時自動重跑、收集 Trace、保存證據、協助 AI 判斷原因**」的機制。

**核心目標：讓 CC 不必再花大量時間猜測測試為何失敗，減少反覆執行、排查錯誤所消耗的 Claude 使用量。**

這是現有測試系統的改善工程，不是重新開發一套測試工具。

由 CC 負責規劃與實作，BB 負責驗收。涉及遊戲本體的修改，依照現有職位分工交給 LAWWW。

## 二、先盤點現有系統

開始修改前，請先檢查：

- `tools/cc_local/run_queue.py`
- `tools/cc_local/gpu_wrap.py`
- `tools/cc_local/queue.txt`
- `tests/playlib.py`
- `tests/screencheck.py`
- 目前的 `local_out` 結果保存與 GitHub 回傳機制
- 其他已經存在的 Trace、截圖、重跑、逾時與例外處理工具

確認哪些功能已經存在，哪些還缺少。

**禁止重複開發已有功能，也不要破壞目前已經正常運作的 GPU 測試佇列。**

## 三、失敗時自動收集 Playwright Trace

使用 Playwright 官方 Tracing API，保存可用 Trace Viewer 開啟的追蹤檔案。

預期包含：

1. 測試執行過程中的重要操作與時間軸。
2. DOM snapshots、畫面截圖與操作前後狀態。
3. JavaScript 例外與 Console errors。
4. 必要的 Network 請求與失敗紀錄。
5. 測試失敗時的遊戲狀態，包括區域、日期、時間、角色位置、事件旗標與目前對話狀態。
6. 測試使用的 commit SHA、測試 ID、瀏覽器版本、GPU Renderer、執行時間與環境設定。

請確認現有 Python Playwright 版本支援哪些功能，使用官方 API 實作，不要假設所有資訊都會自動包含在 Trace 中。

其中遊戲狀態、測試斷言結果、Console 與例外資訊，必要時另外保存為結構化檔案。

## 四、失敗自動重跑機制

採取以下原則：

**首次測試通過：**
- 只保存 PASS、SHA、執行時間、必要的環境資料。
- 不保留大型 Trace 或錄影。

**首次測試失敗：**
- 保存第一次失敗的 log、錯誤、重要截圖。
- 自動使用相同的遊戲 SHA、測試腳本版本與環境設定重跑失敗情境。
- 重跑時啟用 Trace、screenshots、必要的遊戲狀態記錄。
- 使用相同的前置存檔、隨機種子及測試輸入，盡量確保結果可以重現。
- 預設最多自動重跑一次，避免無限循環。

**重跑仍失敗：**
- 保存 Trace 與完整診斷資料。
- 標示為可重現失敗。

**重跑通過：**
- 不得直接把第一次 FAIL 改成 PASS。
- 標示為 `FLAKY / 首次失敗、重跑通過`。
- 保留第一次失敗的證據及重跑紀錄。

**環境問題：**
- 瀏覽器意外關閉、GPU 初始化失敗、記憶體不足、伺服器無法啟動等，須與真正的遊戲邏輯錯誤分開記錄。
- 無法判定時標示 `UNKNOWN`，不可自行宣稱遊戲有 Bug。

如單項測試耗時過長，請評估能否只重跑失敗情境，而非重新跑完整條流程；不得為了加速而跳過原本需要驗證的操作。

## 五、讓 CC 能直接分析失敗原因

請建立統一的失敗報告，至少包含：

- 測試 ID、SHA、腳本版本
- 第一次執行結果
- 重跑結果
- 失敗步驟與斷言
- 預期狀態與實際狀態
- JavaScript 與 Console 錯誤
- 遊戲狀態快照
- 截圖及 Trace 的保存位置
- 是否使用 turbo、讀檔跳轉或其他測試捷徑
- 初步分類及判斷依據

失敗分類至少區分：

1. `GAME_BUG`：有證據支持的遊戲問題。
2. `TEST_BUG`：測試腳本、選擇器或等待條件錯誤。
3. `ENVIRONMENT`：GPU、瀏覽器、效能或系統環境問題。
4. `FLAKY`：第一次失敗、重跑通過。
5. `UNKNOWN`：尚無足夠證據判斷。

CC 可以提出初步判斷，但不得只憑逾時就認定遊戲有 Bug。最終驗收由 BB 決定。

## 六、與現有 MSI GPU 測試系統整合

新功能必須能在我目前的 Windows MSI 電腦上使用，保留既有的：

- GPU 硬體加速
- 測試佇列
- 平行執行
- Git worktree 隔離
- timeout 保護
- GitHub 結果回傳
- `run_forever.ps1` 自動接續功能

不需要額外購買 API，也不需要在本機執行 Claude 模型。

Trace 由 Playwright 與 Python 收集，雲端 CC 只負責分析結果。

考慮到 GitHub repository 已經存有大量測試截圖與紀錄，請設定保存規則：

- PASS 不保留大型 Trace。
- FAIL 才保存必要證據。
- 單一 Trace 設大小上限。
- 大型檔案優先評估 GitHub Actions Artifacts 或其他適合的保存方式；若只能透過 GitHub 分支回傳，請制定檔案大小限制與清理政策。
- 不得把本機絕對路徑、憑證、Cookie、Token 或其他敏感資料不加檢查地公開推送到 repository。

## 七、驗收測試

請至少用以下情境證明系統有效：

| 情境 | 預期 |
|---|---|
| 正常測試通過 | PASS，無大型 Trace |
| 故意製造的測試斷言錯誤 | FAIL，自動重跑並保存 Trace |
| 第一次失敗、第二次通過 | FLAKY，不可假裝首次成功 |
| 故意使用錯誤選擇器 | 能辨識測試工具問題 |
| 遊戲產生 JS 例外 | 留下例外與相關畫面 |
| 瀏覽器異常退出 | 分類為環境或工具異常，留下證據 |
| 測試 timeout | 正確中止，不能無限重跑 |
| 兩個測試同時執行 | 證據不能混在一起或互相覆蓋 |

請實際以 Playwright Trace Viewer 開啟至少一份生成的 Trace，確認不是只有產生 ZIP 檔案，而是真的能回看操作與畫面。

不得修改測試標準來製造 PASS。

## 八、實作策略與成果回報

請先挑選兩至三個代表性測試做最小可行版本，確認機制有效後再整合進主要 runner。

避免一次大幅改動所有測試腳本，造成新的不穩定因素。

完成後提供：

1. 修改的檔案與 commit SHA。
2. 功能說明與實際操作方式。
3. 成功、失敗、FLAKY 的測試證據。
4. 一份可供 Trace Viewer 開啟的實際案例。
5. 新增的磁碟、CPU、GPU 與執行時間成本。
6. 新系統能減少哪些人工排查工作。
7. 哪些功能還沒完成、有哪些限制。

**成功標準不是「所有測試都變 PASS」，而是測試失敗以後，CC 可以迅速看懂發生什麼事，減少猜測、誤判與反覆測試。**

請依照既有 LAWSTUDENT 開發與交接規則進行，不要中斷正在執行的重要測試工作。

## BB-C 驗收判定（2026-11-04 13:2x UTC，PC MSI GPU；cc-local TT_* 21:07 台灣、cc-testing 4aa1dbb44、遊戲 d2e36f6eb；CC_48 規則文件）
| 項 | 判定 | 證據 |
|---|---|---|
| V1 | PASS | TT_V12_moku（node，PASS）目錄只有 err.log、meta.json、run.log；TT_V12_noodle（PASS）只有探針自己的截圖，沒有 trace.zip、沒有錄影 |
| V2 | **PARTIAL** | 首次 FAIL→自動重跑 1 次、conditions.same＝true（同 SHA d2e36f6eb、同 script_blob、同 input_hash）、仍 FAIL、attempt2 有 trace＋state＋env ✔；**分類 UNKNOWN／assert ✗**（規格要「GAME_BUG 或 TEST_BUG（依注入點）」）。不放寬標準 → CC 補兩種注入（斷言比對遊戲狀態讀出的值＝GAME_BUG 候選、斷言比對探針自己的常數＝TEST_BUG），讓分類照注入點出來 |
| V3 | PASS | final＝FLAKY（不是 PASS）、class FLAKY「首次失敗、重跑通過」、attempt1 的 log＋截圖保留 |
| V4 | PASS | TEST_BUG；basis 指出 `Page.wait_for_selector` 逾時、selector `#no-such-button`、st_selector.py 第 13 行、trace DOM 裡沒有這個 selector |
| V5 | PASS | GAME_BUG；pageerror TypeError「GAME.ccSelftestMissingFn is not a function」＋stack、jserror_before／after.png（兩次）、state 快照 |
| V6 | PASS | ENVIRONMENT／browser；TargetClosedError＋events.jsonl browser_disconnected＋err_tail |
| V7 | PASS | TT_V7_timeout：60 秒中止、TIMEOUT、只跑 1 次；TT_V7_timeout_r（CC_RETRY_TIMEOUT=1）：最多 2 次、154 秒結束、「只憑逾時不判 GAME_BUG」；沒有無限循環 |
| V8 | PASS | TT_V8_par_a／_b 並行（82／99 秒），各自目錄 attempt1、attempt2、trace 檔名帶各自 ID，沒有混檔 |
| V9 | PASS | 帳號 A 的 BB 11-04 已看過 show-trace 截圖（BB_00 交班紀錄「V9 show-trace 截圖 OK」）；CC_48 第 114 行有指令 |
| V10 | PASS | state 快照有 zone、day、hour、pos（x,z,y,lv,yaw）、player（busy、pose、seat）、busyDepth、dlg／adv／events／phone／entering、lastTalkError、flags、walkFallbacks |
| V11 | PASS | sha、id、script、cc_testing_sha、runner、browser 156.0.8078.4、playwright 1.64.1、gpu_renderer「AMD Radeon RX 6600M … D3D11」、shortcuts（turbo false、前置／捷徑行） |
| V12 | PASS | 佇列、GPU、並行（V8）、worktree、timeout（V7）、run_forever 自動接續都照常（這一輪 PC 一路跑下來）；TT_V12_moku、TT_V12_noodle 都 PASS（noodle 的舊結果 NOODLE_exit 是 FAILED，不是這次改壞的） |
| V13 | PASS | CC_48 第 7 節：單一 trace 20 MB、每項 25 MB、PASS 不留、推送前清理路徑／使用者名稱／Cookie／Token（這一輪 12 份 report 的 sanitize.left_hits 都空）、sanitize_unit 77 項；清理政策（14 天或判定後 git rm）有寫、還沒自動化——不擋 |
| V14 | PASS | 雲端數字在 CC_48 第 5 節；PC GPU 實測：失敗重跑多 10～17 秒（V2 16→27 秒、V5 15→26 秒、V8 17→33～34 秒）、trace 瘦身後 1.3～5.3 MB、整項目錄約 1.7～2.1 MB |
| V15 | PASS | TT_V15b：A、B PASS、C FAIL、6 段 trace、FAIL 段有推；前一段推送順序已改（BB 定：FAIL 段→前一段第二個 commit→後一段塞得下才推） |
- **整體**：14 項裡 13 項 PASS、V2 PARTIAL → 還不能回報使用者「完成」。CC 補 V2 的兩種注入＋分類以後，PC 再跑 TT_V2_assert 兩支就結案。
