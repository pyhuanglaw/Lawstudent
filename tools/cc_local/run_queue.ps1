# CC (account A): entry point for the CC test queue on the user's Windows PC.
# Runs run_queue_main.ps1 (re-reads the queue after every item). If that file does not parse,
# or throws, falls back to run_queue_stable.ps1 (the version that already ran on this PC).
# Usage: powershell -ExecutionPolicy Bypass -File "<repo>\tools\cc_local\run_queue.ps1"
param(
  [string]$Repo = "$env:USERPROFILE\Documents\Lawstudent",
  [string]$Only = ""
)
$dirs = @((Join-Path $Repo 'tools\cc_local'), $PSScriptRoot)
$main = $null; $stable = $null
foreach ($d in $dirs) {
  if (-not $d) { continue }
  if (-not $main -and (Test-Path (Join-Path $d 'run_queue_main.ps1'))) { $main = Join-Path $d 'run_queue_main.ps1' }
  if (-not $stable -and (Test-Path (Join-Path $d 'run_queue_stable.ps1'))) { $stable = Join-Path $d 'run_queue_stable.ps1' }
}
$useMain = $false
if ($main) {
  $tok = $null; $errs = $null
  $null = [System.Management.Automation.Language.Parser]::ParseFile($main, [ref]$tok, [ref]$errs)
  if ($errs -and $errs.Count -gt 0) {
    Write-Host "run_queue_main.ps1 has parse errors - using run_queue_stable.ps1" -ForegroundColor Yellow
    $errs | ForEach-Object { Write-Host ("  " + $_.Message) -ForegroundColor Yellow }
  } else { $useMain = $true }
}
if ($useMain) {
  try { & $main -Repo $Repo -Only $Only }
  catch {
    Write-Host ("run_queue_main.ps1 failed: " + $_) -ForegroundColor Yellow
    if ($stable) { Write-Host "falling back to run_queue_stable.ps1" -ForegroundColor Yellow; & $stable -Repo $Repo -Only $Only }
  }
} elseif ($stable) {
  & $stable -Repo $Repo -Only $Only
} else {
  Write-Host "Neither run_queue_main.ps1 nor run_queue_stable.ps1 found under $Repo\tools\cc_local" -ForegroundColor Red
}
