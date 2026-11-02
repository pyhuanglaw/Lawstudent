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
**什麼時候做**：LAWWW 發布 v9.10.16 完成，**而且** PC 上目前那一項跑完（看到「CC-local: … result」推上去）以後。

1. 把正在跑的舊視窗（PowerShell）關掉，或在那個視窗按 Ctrl+C。
2. 開一個新的 PowerShell，**一行一行**貼下面三行：
```
git -C "$env:USERPROFILE\Documents\Lawstudent" fetch origin claude/cc-testing claude/second-ai-env-art
git -C "$env:USERPROFILE\Documents\Lawstudent_cclocal" merge --no-edit origin/claude/cc-testing
py -3 "$env:USERPROFILE\Documents\Lawstudent_cclocal\tools\cc_local\run_queue.py" --parallel 2
```
3. **貼完應該看到**：
   - 第 1、2 行：幾行灰色或白色的 git 訊息，最後回到 `PS C:\...>` 提示字元。如果第 2 行出現 `CONFLICT`，就停下來，把畫面截圖給 BB。
   - 第 3 行：大約 10 行設定說明：
```
[時:分:秒] python : C:\...\python.exe (3.x.x)
[時:分:秒]          playwright OK
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
