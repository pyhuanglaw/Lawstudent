# CC 本機測試佇列（tools/cc_local）

CC（帳號 A，雲端）寫的腳本。使用者在自己的 Windows 電腦上執行，用顯示卡跑 CC 的瀏覽器測試。雲端的 Chromium 是 SwiftShader，只有 1～4 fps。

## 執行（一行）

```powershell
powershell -ExecutionPolicy Bypass -File "$env:USERPROFILE\Documents\Lawstudent\tools\cc_local\run_queue.ps1"
```

腳本是從 `claude/cc-testing` 抓的。如果你本機的 repo 目前不在那個分支，先執行：
`git -C "$env:USERPROFILE\Documents\Lawstudent" fetch origin claude/cc-testing; git -C "$env:USERPROFILE\Documents\Lawstudent" show origin/claude/cc-testing:tools/cc_local/run_queue.ps1 > "$env:TEMP\run_queue.ps1"`，再執行 `powershell -ExecutionPolicy Bypass -File "$env:TEMP\run_queue.ps1"`。

- 只跑某幾項：在指令後面加 `-Only 02_mk12`（多項用逗號隔開）。
- repo 不在預設位置：加 `-Repo D:\路徑\Lawstudent`。

## 腳本做什麼

1. 在 repo 執行 `git fetch`。另外開一個 worktree `Documents\Lawstudent_cclocal`，切到 `claude/cc-local` 分支：這個分支以 `origin/claude/cc-testing` 為底；遠端已經有 `cc-local` 的話，以它為底，再合併 `cc-testing` 拿到最新佇列。**不會動你原本的工作目錄**。
2. 讀 `tools/cc_local/queue.txt`，每行一項，格式是 `ID | SHA | KIND | 腳本 | 網址 | 逾時分鐘 | 環境變數`。
3. 每一項依序做：
   - 用 `git worktree add --detach` 開出那個 SHA；
   - 在背景啟動 `python -m http.server`，埠號從 8800 起往上找空的；
   - 跑腳本；
   - 輸出放在 `docs/story_planning/CC/local_out/<ID>/`：`run.log`、`err.log`、`meta.json`（開始／結束時間、秒數、exit code）、探針的輸出；
   - 關掉 server，移除 worktree。
4. 瀏覽器用顯示卡跑：`gpu_wrap.py` 只在 Python 程序裡替換 playwright 的 `launch`。
   - 拿掉雲端的 `executable_path` 和 SwiftShader 參數。
   - 加上 `--ignore-gpu-blocklist --use-gl=angle --use-angle=d3d11`，並用 `headless=False`。
   - 不改開發分支的 `tests/playlib.py`。`CC_GPU=0` 可以關掉這些替換。
5. 每做完一項，只 `git add` 該項的 local_out 和 `local_out/summary.md`。截圖每項最多推 25 MB，其他沒推的截圖在 `notes.txt`。接著 commit、push 到 `origin/claude/cc-local`，失敗會重試 5 次。
6. 某一項出錯就記下來，繼續跑下一項。全部跑完印出摘要。
7. 腳本裡沒有任何金鑰。push 用的是你電腦上 git／gh 已經登入的權限。

## 佇列項目

- 第 0 項 `00_gpu`（`gpu_check.py`）：開兩次瀏覽器——一次用顯示卡（d3d11、有視窗），一次用 SwiftShader 當對照。各讀 WebGL `UNMASKED_RENDERER`、量 10 秒 fps，寫進 `local_out/00_gpu/gpu.txt`。
- 跑測試時，電腦上會跳出 Chromium 視窗（因為 headless=False）。請不要點它、也不要關掉它；最小化沒關係，但有些顯示卡在最小化時會降速。

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
