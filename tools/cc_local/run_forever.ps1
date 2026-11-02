# CC（帳號 A）：cc-local 的永久外殼（BB 2026-11-02 20:08）。這個檔以後幾乎不用改。
# 迴圈跑 run_queue.py --parallel 2：
#   exit 75 ＝ runner 自己有新版（合併 cc-testing 以後雜湊不同；手上的項目已經跑完、push 完）→ 立刻重跑新版
#   exit 0  ＝ 佇列這一輪跑完 → 等 300 秒再跑（抓新佇列）
#   其他     ＝ 出錯（例如 git 暫時連不上）→ 等 60 秒再跑
# 按 Ctrl+C 才真正停。
# 用法：powershell -ExecutionPolicy Bypass -File "$env:USERPROFILE\Documents\Lawstudent_cclocal\tools\cc_local\run_forever.ps1"
# 額外參數會原樣傳給 run_queue.py（例如 --headless）。
$ErrorActionPreference = 'Continue'
$runner = Join-Path $PSScriptRoot 'run_queue.py'
$py = 'python'
$n = 0
while ($true) {
    $n++
    Write-Host ("[{0}] run_forever: round {1} - python {2} --parallel 2 {3}" -f (Get-Date -Format 'HH:mm:ss'), $n, $runner, ($args -join ' ')) -ForegroundColor Cyan
    $env:CC_RF_ROUND = "$n"   # runner 寫進每一項的 meta.json（rf_round），雲端看得出是經 run_forever 跑的、第幾輪
    & $py $runner --parallel 2 @args
    $rc = $LASTEXITCODE
    if ($rc -eq 75) {
        Write-Host ("[{0}] run_forever: runner updated itself (exit 75) - restarting now" -f (Get-Date -Format 'HH:mm:ss')) -ForegroundColor Cyan
        continue
    }
    if ($rc -eq 0) { $wait = 300 } else { $wait = 60 }
    Write-Host ("[{0}] run_forever: runner exit {1} - next round in {2} s (Ctrl+C to stop)" -f (Get-Date -Format 'HH:mm:ss'), $rc, $wait) -ForegroundColor Cyan
    Start-Sleep -Seconds $wait
}
