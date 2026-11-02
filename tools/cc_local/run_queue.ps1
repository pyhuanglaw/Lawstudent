# CC (account A): entry point for the CC test queue on the user's Windows PC.
# Runs run_queue_main.ps1 (re-reads the queue after every item). If it does not parse or throws,
# falls back to run_queue_stable.ps1, then to run_queue_proven.ps1 (= the run_queue.ps1 of 5f247e4b6,
# the one that really ran on this PC on 2026-11-02 18:24 local).
# Usage: powershell -ExecutionPolicy Bypass -File "<repo>\tools\cc_local\run_queue.ps1"
param(
  [string]$Repo = "$env:USERPROFILE\Documents\Lawstudent",
  [string]$Only = ""
)
$dirs = @((Join-Path $Repo 'tools\cc_local'), $PSScriptRoot)
$layers = @()
foreach ($name in @('run_queue_main.ps1', 'run_queue_stable.ps1', 'run_queue_proven.ps1')) {
  foreach ($d in $dirs) {
    if (-not $d) { continue }
    $f = Join-Path $d $name
    if (Test-Path $f) { $layers += $f; break }
  }
}
if ($layers.Count -eq 0) { Write-Host "No run_queue_main/stable/proven.ps1 under $Repo\tools\cc_local" -ForegroundColor Red; exit 1 }
foreach ($f in $layers) {
  $tok = $null; $errs = $null
  $null = [System.Management.Automation.Language.Parser]::ParseFile($f, [ref]$tok, [ref]$errs)
  if ($errs -and $errs.Count -gt 0) {
    Write-Host ("parse errors in " + $f + " - trying the next one") -ForegroundColor Yellow
    $errs | ForEach-Object { Write-Host ("  " + $_.Message) -ForegroundColor Yellow }
    continue
  }
  Write-Host ("running " + $f) -ForegroundColor Cyan
  try { & $f -Repo $Repo -Only $Only; break }
  catch { Write-Host ("failed: " + $f + " : " + $_ + " - trying the next one") -ForegroundColor Yellow }
}
