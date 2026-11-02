# CC 本機測試佇列（tools/cc_local）

CC（帳號 A，雲端）寫的腳本。使用者在自己的 Windows 電腦上執行，用顯示卡跑 CC 的瀏覽器測試。雲端的 Chromium 是 SwiftShader，只有 1～4 fps。

## 執行（2026-11-02 起：Python 版 runner `run_queue.py`）

開一個新的 PowerShell，**一行一行**貼（操作卡全文、每一行貼完應該看到什麼：`docs/story_planning/CC/CC_29_新runner_操作卡.md`）：

```powershell
git -C "$env:USERPROFILE\Documents\Lawstudent" fetch origin claude/cc-testing claude/second-ai-env-art
git -C "$env:USERPROFILE\Documents\Lawstudent_cclocal" merge --no-edit origin/claude/cc-testing
python "$env:USERPROFILE\Documents\Lawstudent_cclocal\tools\cc_local\run_queue.py" --parallel 2
```

- 第 3 行一開始印約 10 行設定：python 路徑、`playwright <版本> OK`、git、node、blender、repo、work、parallel、browser。看得到 `playwright … OK` 才算環境正常。
- 用 `python`，不用 `py -3`（使用者電腦上有 playwright 和 webkit 的是 `python` 這一支）。
- 選項：`--only ID1,ID2` 只跑某幾項；`--parallel N` 同時跑幾項（blender 永遠單獨跑）；`--headless` 不開視窗；`--no-push` 不推結果（雲端驗證用）；`--repo`、`--work` 改路徑。
- 預設跑完整個佇列一次就結束（`--once` 是預設）。要再跑就再貼第 3 行。
- **runner 本身改版後要重新啟動才生效**：正在跑的程序已經載入舊程式碼（佇列和探針不受影響，每一項開始前都會抓最新的）。

### 建議入口：永久外殼 run_forever.ps1（2026-11-02 20:1x 起）

```powershell
powershell -ExecutionPolicy Bypass -File "$env:USERPROFILE\Documents\Lawstudent_cclocal\tools\cc_local\run_forever.ps1"
```

外殼在迴圈裡跑 `python run_queue.py --parallel 2`：
- runner 每跑完一項，就合併 cc-testing，比對自己的 sha256。和啟動時不同，代表 runner 有新版：手上的項目跑完、push 完以後，用 **exit 75** 結束，外殼立刻用新版重跑。**runner 的修正不用使用者再重啟。**
- exit 0（佇列這一輪跑完）：等 300 秒再跑。
- 其他 exit：等 60 秒再跑。
- Ctrl+C 才真正停。
- 單元測試：`python3 tools/cc_local/restart_unit.py`。等價的 sh 版是 `run_forever.sh`，雲端驗證用。
- 操作卡：CC_29「新操作卡 v2」。

### 退回用：舊的 PowerShell runner（沒有改，出問題時用）

```powershell
powershell -ExecutionPolicy Bypass -File "$env:USERPROFILE\Documents\Lawstudent_cclocal\tools\cc_local\run_queue.ps1"
```

舊版依序試 main → stable → proven 三層。舊版不能並行、不開並排視窗，不認 node／blender／webkit 三種 kind。

## runner 做什麼

1. 在 repo 執行 `git fetch`。另外開一個 worktree `Documents\Lawstudent_cclocal`，切到 `claude/cc-local` 分支：這個分支以 `origin/claude/cc-testing` 為底；遠端已經有 `cc-local` 的話，以它為底，再合併 `cc-testing` 拿到最新佇列。本機已經有 `claude/cc-local` 時沿用它再合併，不會洗掉還沒 push 的結果。**不會動你原本的工作目錄**。
2. 讀 `tools/cc_local/queue.txt`，每行一項：`ID | SHA | KIND | 腳本 | 網址 | 逾時分鐘 | 環境變數(k=v;…)`。
   - `#` 開頭的行跳過。`#HOLD雲端 `、`#HOLD正式SHA ` 開頭＝暫停中，等雲端驗過或等正式 SHA。
   - SHA 可以寫 `lawww2`，代表 `claude/second-ai-env-art` 的最新 commit。
3. **跳過規則**（BB 2026-11-02 19:46）：`local_out/<ID>/meta.json` 已經存在，而且 sha、RERUN 都相同，就跳過，不管上次 exit 幾、有沒有 error。要重跑就換 RERUN 記號，例如 `RERUN=rev1102wt`；逾時、error 的項目也一樣換記號重跑。舊 PowerShell 寫的 meta.json 有 BOM，也讀得懂。
4. 每一項：
   - 用 `git worktree add --detach` 開出那個 SHA。之前留下的同名資料夾，會先 remove、prune、刪掉；刪不掉就換一個名字。
   - 在背景開 `python -m http.server`，埠號從 8800 往上找空的。
   - 跑腳本，超過逾時就殺掉整個程序樹。
   - 輸出放在 `docs/story_planning/CC/local_out/<ID>/`：`run.log`、`err.log`、`meta.json`、探針自己的輸出。
   - 關掉 server，移除 worktree。
   - 每一項的 ENV 只傳給它自己的子程序。
5. **KIND 一覽**：
   - `probe`、`game`、`py`、`gpu`：Python 探針，經 `gpu_wrap.py` 用顯示卡跑。
   - `webkit`：同上，瀏覽器改成 WebKit（`CC_BROWSER=webkit`）。WebKit 沒有 CDP，用 playlib 手機觸控的探針會失敗。
   - `node`：用 node 跑。腳本在測試 SHA 的 worktree 裡找不到時，用 cc-local 工作目錄的同名檔，例如 `tools/cc_local/node_units.js`。
   - `blender`：用 Blender 5.2 背景跑，加 `--python-exit-code 1`，腳本出錯時 exit 不會是 0。永遠單獨跑。
6. **瀏覽器**（`gpu_wrap.py`，只在 Python 程序裡替換 playwright 的 `launch`，不改開發分支的 `tests/playlib.py`）：
   - 拿掉雲端的 `executable_path` 和 SwiftShader 參數，加 `--ignore-gpu-blocklist --use-gl=angle --use-angle=d3d11`。`CC_GPU=0` 關掉這些替換。
   - **headed 並排**：預設開視窗。probe、game、webkit 三種 kind 的並行第 0 格放在 `--window-position=0,0`，第 1 格放在 `920,0`，`--window-size=900,900`，視窗標題「CC 測試中，請勿點選 [ID]」。
   - 佇列 ENV 寫了 `CC_HEADLESS=1`／`0` 時，以佇列為準。`--headless` 全部不開視窗。
7. 每做完一項，只 `git add` 該項的 local_out 和 `local_out/summary.md`。截圖每項最多推 25 MB，沒推上的列在 `notes.txt`。然後 commit「CC-local: <ID> result (sha …, exit …, 秒數)」，push 到 `origin/claude/cc-local`，失敗會重試。
8. 某一項出錯就記下來，接著跑下一項。腳本裡沒有任何金鑰，push 用你電腦上 git 已經登入的權限。

## PC 畫面輸出（不用截圖）

runner 印到畫面上的每一行都會留一份，只保留最後 2000 行，去掉顏色碼，跟著每一項結果的 commit 一起推到 `docs/story_planning/CC/local_out/_console/console.log`。runner 啟動時也會推一次，commit 名稱是「CC-local: runner start (rf_round N, runner <雜湊>)」，裡面看得到設定那幾行。第一行寫 run_forever 第幾輪和 runner 雜湊。
- run_forever.ps1 自己印的青色訊息不在這個檔裡，因為 .ps1 改了要使用者重啟才會生效。改從 runner 那一行的 `run_forever round` 看輪次。
- 雲端怎麼看：`git show origin/claude/cc-local:docs/story_planning/CC/local_out/_console/console.log | tail -50`

## 怎麼確認 PC 還在跑（給雲端 CC／接班者）

`git fetch origin claude/cc-local && git log -3 --format='%h %ci %s' origin/claude/cc-local`

- 最新一筆「CC-local: … result」的時間（+0800 是 PC 的台灣時間），和正在跑的那一項的逾時比一比。超過逾時很久都沒有新 commit，可能是 PC 睡眠了、視窗被關掉、或 runner 已經跑完佇列結束（預設跑一輪就停）。這時請 BB 問使用者。
- 正在跑哪一項：看 queue.txt 裡最後一筆有結果的項目的下一項，跳過已經有 meta 的項目。

## 佇列項目與視窗

- 第 0 項 `00_gpu`（`gpu_check.py`）：開兩次瀏覽器，一次用顯示卡（d3d11、有視窗），一次用 SwiftShader 當對照。各讀 WebGL `UNMASKED_RENDERER`，量 10 秒 fps，寫進 `local_out/00_gpu/gpu.txt`。
- 跑測試時，電腦上會出現並排的 Chromium 視窗。請不要點，也不要關掉。不小心點到沒關係，那一項重跑就好。最小化也可以，但有些顯示卡最小化時會降速。

結果由雲端 CC 讀回來寫初判，最後判定歸 BB。


## BB_229 規則（2026-11-02 11:52 UTC）
1. 新寫或改過的探針、py 工具，要先在雲端實際跑過一次，才能排進 cc-local。還沒驗證的項目，在 queue.txt 前面標「#HOLD雲端 」，PC 會跳過。PowerShell 要保留 run_queue_proven.ps1 那一層退回。
2. 要使用者貼的指令，一定附上「貼完應該看到什麼畫面」。
3. 判定為探針問題的 FAIL，修好以後要重跑到 PASS。
4. 結果報告分三類：真實流程、走捷徑的探針、要 iPhone 實機確認的。
5. 修 bug 的項目要排修改前的對照；沒有排的，寫出原因（queue.txt 檔頭的規則 5 列表）。
- **規則 1 的意思（BB 11:57 修正）**：「先跑過」指的是**最後一次修改以後，至少在雲端或使用者電腦完整跑過一次**，而且 PASS／FAIL 判斷得出來（不是工具本身壞掉）。目的是不讓壞掉的工具卡住整晚；每一項都有 timeout，最多只損失那一項的時限。
  - 只有**從來沒有在任何地方完整跑過、而且改動很大**的探針才 HOLD（例如當晚新寫的 day9、boya203、wsem）。雲端挑最小的 case 驗證，跑過就解除 HOLD。
  - 其他探針（包括發布要用的 R 系列）照跑，這一輪就當第一次實跑。結果如果是工具的問題，由 BB 判定；修好以後重跑到 PASS（規則 3）。
  - 雲端兩條驗證線優先驗 R 系列用到的探針；雲端先過的，等 PC 的結果出來再互相對照。


## BB_229 第 7～10 條（2026-11-02 17:51 UTC，減少探針出錯）
7. **不要靠畫面文字猜狀態**。今晚的錯誤：「考卷發下來。」被擠出 14 行、按鈕有兩行字、用 == 比對、把題庫列當成課程列。以後一律先讀遊戲狀態（G、FD_MAKEUP、CLS、STUDY…），畫面文字只用來驗「玩家看得到」。缺少可以讀的狀態，就跟 BB 要，由 BB 請 LAWWW 加測試用的掛勾。
8. **送佇列前先做靜態檢查**：`python3 tools/cc_local/probe_lint.py`。內容：py_compile、pyflakes（有裝才跑）、用 ast 檢查 `%` 格式字串的參數數目（跨行串接不會誤報）、`.js` 用 node --check。今晚的三個 `%` bug（b3:745、layout16:304、351），用修正前的版本測都 FAIL，現在全部 81 個檔案 ALL PASS。
9. **共用函式庫 cc_lib**：認考卷、認選單、等劇情、關手機、存讀檔放在一起，所有探針都用它，修一次就全部修好。今晚的發布判完以後再整理。
10. **遊戲規則改了，探針要跟著改**：LAWWW 改規則時（例如 D124、AA_582），由 CC 列出受影響的探針，先在雲端跑一次，再排 PC。
