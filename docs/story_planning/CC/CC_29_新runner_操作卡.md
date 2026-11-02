# CC_29 新 runner（tools/cc_local/run_queue.py）雲端驗證與使用者操作卡草稿

## 雲端驗證（b1b249873，`--no-push`，本機測試分支用完已刪）
| 項目 | 結果 |
|---|---|
| py（quota_check） | PASS |
| node（tests/guide_unit.js） | PASS |
| probe（cc_legalpage_probe crim_qb） | PASS |
| LAWWW2 的 SHA（佇列 SHA 寫 `lawww2`＝claude/second-ai-env-art 的 head；跑 node allowance_unit） | PASS |
| 並行 2（時間重疊，commit 數＝項目數，沒有互相打架） | PASS |
| 跳過規則：同一佇列再跑全部 skip；換 RERUN 只重跑那一項；同一輪內換 RERUN 也會重跑 | PASS |
| timeout：殺掉整個程序樹；不存在的 SHA 記成 error、接著跑下一項 | PASS |
| headed（xvfb）兩項並行＋headless 一項，跑同一支探針 | 三份 PASS 行完全一致；視窗 slot 0 `--window-position=0,0`、slot 1 `920,0`，`--window-size=900,900`，`--window-name=CC 測試中，請勿點選 [<id>]` |
| blender | **只驗到管線**（雲端沒有 Blender，用假的 bpy 驗了 {out}、獨佔、commit）。真正的 Blender 5.2 要在 PC 驗 |
| webkit | **只驗到轉接**（CC_BROWSER=webkit 時 chromium.launch 會改成 webkit.launch）。真正的 WebKit 要在 PC 驗。注意：WebKit 沒有 CDP，用 playlib 手機觸控的探針會失敗 |
| gpu_wrap 不變性 | 舊迴圈的情況（CC_GPU=1、CC_HEADLESS 有設或沒設、沒有 CC_SLOT）下，新舊 fix_kwargs 結果完全相同（CC 另外比對過一次） |

## 和舊版不同的地方
- 預設 headed：probe、game、webkit 會開視窗。佇列 ENV 寫的 CC_HEADLESS 優先；fps 照佇列原本的設定。`--headless` 可以全部關掉。
- 每一項的 ENV 只傳給它自己的子程序，不改 runner 自己的環境。
- 本機已經有 claude/cc-local 時，沿用它再合併，不會洗掉沒 push 的結果。
- 讀得懂舊版 PowerShell 寫的 meta.json（有 BOM），所以舊結果照樣 skip。
- blender 加了 `--python-exit-code 1`，腳本出錯時 exit 不會是 0。
- 退回層：舊的 run_queue.ps1（main→stable→proven）**完全沒動**。

## 使用者操作卡（草稿，給 BB 轉）
**（BB 19:26 審過：第 3 行用 `python`，不用 `py -3`——使用者昨天用 `python -m playwright install webkit` 成功，這一支確定有 playwright 和 webkit；第一行會印出 python 路徑和 playwright 版本，可以核對。）**

**什麼時候做**：LAWWW 發布 v9.10.16 完成，**而且** PC 上目前那一項跑完（看到「CC-local: … result」推上去）以後。

1. 把正在跑的舊視窗（PowerShell）關掉，或在那個視窗按 Ctrl+C。
2. 開一個新的 PowerShell，**一行一行**貼下面三行：
```
git -C "$env:USERPROFILE\Documents\Lawstudent" fetch origin claude/cc-testing claude/second-ai-env-art
git -C "$env:USERPROFILE\Documents\Lawstudent_cclocal" merge --no-edit origin/claude/cc-testing
python "$env:USERPROFILE\Documents\Lawstudent_cclocal\tools\cc_local\run_queue.py" --parallel 2
```
3. **貼完應該看到**：
   - 第 1、2 行：幾行灰色或白色的 git 訊息，最後回到 `PS C:\...>` 提示字元。如果第 2 行出現 `CONFLICT`，就停下來，把畫面截圖給 BB。
   - 第 3 行：大約 10 行設定說明：
```
[時:分:秒] python : C:\...\python.exe (3.x.x)
[時:分:秒]          playwright 1.xx.x OK
[時:分:秒] git    : git version 2.x.x.windows.1
[時:分:秒] node   : C:\Program Files\nodejs\node.exe  v26.13.0
[時:分:秒] blender: C:\Program Files\Blender Foundation\Blender 5.2\blender.exe  Blender 5.2.3
[時:分:秒] repo   : C:\Users\...\Documents\Lawstudent
[時:分:秒] work   : C:\Users\...\Documents\Lawstudent_cclocal  (branch claude/cc-local, push to origin)
[時:分:秒] parallel: 2  (blender items run alone)
[時:分:秒] browser: visible windows side by side (...) - please do not click them
[時:分:秒] git fetch
```
   - 接著會看到 `queue: …`、`==== START <項目> ====`，以及**兩個並排的 Chromium 視窗**，標題寫「CC 測試中，請勿點選」。視窗可以看，但請不要點。不小心點到也沒關係，那一項重跑就好。
   - **不會**停在 `>>`。如果停在 `>>`，按 Ctrl+C，重新貼那一行。
4. **出問題就退回**：按 Ctrl+C 停下來，改貼原本的舊指令（舊的 PowerShell runner 沒動）：
```
powershell -ExecutionPolicy Bypass -File "$env:USERPROFILE\Documents\Lawstudent_cclocal\tools\cc_local\run_queue.ps1"
```

---

## 新操作卡 v2：改用永久外殼 run_forever.ps1（BB 2026-11-02 20:08；以後 runner 的更新不用使用者再動手）

### 雲端驗證（cc-testing，見 commit 訊息）
| 項目 | 結果 |
|---|---|
| `tools/cc_local/restart_unit.py`（exit 75 單元測試，6 組 10 項） | **ALL PASS**：①沒有新版時回 0、全部跑完 ②parallel 2 中途出新版：手上那一項跑完（等了 1.01 s）才結束、c、d 不開始、回 75 ③最後一項後才出新版也回 75 ④refresh 了但檔案沒變回 0 ⑤parallel 1 第二項不開始 ⑥SELF_FILE＝run_queue.py 本身 |
| 修正前對照（上一版 run_queue.py＋同一支單元測試） | **FAIL**（main() 回 None、沒有 RESTART_EXIT）＝這支測試抓得到 |
| 外殼邏輯（雲端沒有 pwsh：用等價的 `run_forever.sh`＋假 runner 依序回 75、75、3、0） | 75 → 立刻重跑（同一秒）；3 → 等 RF_WAITERR 再跑；0 → 等 RF_WAIT0；額外參數（--headless）有原樣傳下去 |
| run_forever.ps1 本身 | **雲端沒辦法跑 PowerShell**，只驗了等價的 sh 邏輯。PS 語法要在使用者電腦第一次執行時確認（看下面「應該看到」）。 |

### runner 的行為
- 每跑完一項，就合併 cc-testing，比對 run_queue.py 的 sha256：
  - 和啟動時不同：不再開新項目，等手上的項目都跑完、push 完，exit 75。
  - 外殼收到 75，立刻用新版重跑。
- 佇列這一輪跑完（exit 0）：外殼等 **300 秒** 再跑一輪，抓新佇列。BB 原本說「其他 exit 等 60 秒」，這裡把 0 單獨拉長：每一輪開頭都會跑 `blender --version`、`git fetch`，每分鐘一次太吵。
- 其他 exit（git 暫時連不上之類）：等 60 秒再跑。
- 按 Ctrl+C 才真正停。

### 使用者操作卡（最後一次換入口；給 BB 轉）
**什麼時候做**：PC 上目前那一項跑完以後，也就是看到最新的「CC-local: … result」推上去以後。中途停也可以，那一項會重跑。

1. 在正在跑的 PowerShell 視窗按 **Ctrl+C**，停掉現在的 runner。
2. 在同一個視窗，**一行一行**貼：
```
git -C "$env:USERPROFILE\Documents\Lawstudent" fetch origin claude/cc-testing claude/second-ai-env-art
git -C "$env:USERPROFILE\Documents\Lawstudent_cclocal" merge --no-edit origin/claude/cc-testing
powershell -ExecutionPolicy Bypass -File "$env:USERPROFILE\Documents\Lawstudent_cclocal\tools\cc_local\run_forever.ps1"
```
3. **貼完應該看到**：
   - 第 1、2 行：幾行 git 訊息，最後回到 `PS C:\...>`。如果第 2 行出現 `CONFLICT`，停下來，截圖給 BB。
   - 第 3 行：
     - 先出現一行**青色**的 `[時:分:秒] run_forever: round 1 - python …run_queue.py --parallel 2`。
     - 接著和之前一樣的約 10 行設定說明（python、`playwright … OK`、git、node、blender…），然後是兩個並排的視窗。
   - 以後 runner 自己更新時，會看到青色的 `runner updated itself (exit 75) - restarting now`，接著馬上出現 `round 2`。**這是正常的，不用做任何事。**
   - 佇列跑完時，會看到青色的 `runner exit 0 - next round in 300 s`，5 分鐘後自己再開始。
   - 如果第 3 行出現紅字，例如「無法辨識 run_forever.ps1」或「找不到檔案」，表示第 2 行沒有合併到最新版。把畫面截圖給 BB。
4. **以後**：這個視窗開著就好，不用再貼任何指令。要停就按 Ctrl+C。
5. **出問題就退回**：按 Ctrl+C，改貼上一張卡的第 3 行（`python "...\run_queue.py" --parallel 2`），或最舊的 `run_queue.ps1`。兩者都沒有改。

## 當機／重開機以後（BB_00 第 13 點）
- **雙擊桌面的「啟動測試迴圈」捷徑**就好。捷徑執行的是
  `powershell -NoExit -ExecutionPolicy Bypass -File "%USERPROFILE%\Documents\Lawstudent_cclocal\tools\cc_local\run_forever.ps1"`。
- 捷徑不見了：開 PowerShell，貼這一行：
  `powershell -NoExit -ExecutionPolicy Bypass -File "$env:USERPROFILE\Documents\Lawstudent_cclocal\tools\cc_local\run_forever.ps1"`
- 不用先手動 fetch／merge：runner 一啟動就會 `git fetch` cc-testing、開發分支、LAWWW2 分支和 cc-local，再把 cc-testing 合併進 `Lawstudent_cclocal`，拿到最新的佇列和最新版 runner。
- **中斷的項目會自動重跑**：meta.json 只在一項跑完時才寫，沒跑完的項目沒有新的 meta，所以下一輪一定會重跑。上一次留下的 worktree 資料夾，會先刪掉，刪不掉就換一個名字。工作樹裡沒 commit 的殘檔，因為 commit 前會先清索引，不會被帶進結果。
- **應該看到**：青色的 `run_forever: round 1`，接著是設定那幾行，然後是兩個並排的視窗。雲端會在 cc-local 看到「CC-local: runner start (rf_round 1, …)」。
- **不要搬動或改名 `tools/cc_local/run_forever.ps1`**：捷徑寫死了這個路徑。
- 已知的風險（還沒處理）：如果當機剛好發生在 git 寫入的時候，可能留下 `index.lock`，git 指令會失敗。runner 會印出 git 錯誤，然後每 60 秒重試一次。遇到這種情況，請 BB 把 console.log 或畫面給 CC 看。之後 runner 會加上自動清除過期 lock 的功能。
