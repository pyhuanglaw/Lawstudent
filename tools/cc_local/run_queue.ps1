# CC (account A): run the CC test queue on the user's Windows PC (GPU browser).
# Usage (from anywhere):
#   powershell -ExecutionPolicy Bypass -File "$env:USERPROFILE\Documents\Lawstudent\tools\cc_local\run_queue.ps1"
# Needs: Git, Python 3.12 + playwright + chromium (already installed), push access to origin (gh login).
# It does NOT touch your own checkout: results are made in a separate worktree
#   %USERPROFILE%\Documents\Lawstudent_cclocal  on branch claude/cc-local
# and pushed only to origin/claude/cc-local. No secrets in this file.
param(
  [string]$Repo = "$env:USERPROFILE\Documents\Lawstudent",
  [string]$Only = ""          # e.g. -Only 02_mk12  (comma list) to run selected items
)
$ErrorActionPreference = 'Continue'
$GitExe = (Get-Command git -CommandType Application -ErrorAction Stop | Select-Object -First 1).Source   # never shadowed by a function
$DevBranch = 'claude/confident-ritchie-8rwh7t'
$Base = Split-Path $Repo -Parent
$Work = Join-Path $Base 'Lawstudent_cclocal'
$env:PYTHONUTF8 = '1'; $env:PYTHONIOENCODING = 'utf-8'
$Summary = New-Object System.Collections.ArrayList

function CC-Log($m) { Write-Host ("[{0}] {1}" -f (Get-Date -Format 'HH:mm:ss'), $m) }
function CC-RetryPush($dir) {
  foreach ($w in 0,2,4,8,16) {
    if ($w) { Start-Sleep -Seconds $w }
    & $GitExe -C $dir push -u origin claude/cc-local 2>&1 | ForEach-Object { "$_" } | Out-Host
    if ($LASTEXITCODE -eq 0) { return $true }
  }
  return $false
}
function CC-FreePort([int]$start) {
  for ($p = $start; $p -lt $start + 200; $p++) {
    try { $l = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $p); $l.Start(); $l.Stop(); return $p } catch {}
  }
  throw "no free port"
}
function CC-FindPython {
  $c = Get-Command python -ErrorAction SilentlyContinue
  if ($c -and $c.Source -notmatch 'WindowsApps') { return @($c.Source) }
  $c = Get-Command py -ErrorAction SilentlyContinue
  if ($c) { return @($c.Source, '-3.12') }
  throw "python not found"
}
$Py = @(CC-FindPython)   # @() so a single path is not unrolled into a string
$PyExe = $Py[0]; $PyPre = @(); if ($Py.Count -gt 1) { $PyPre = $Py[1..($Py.Count-1)] }
CC-Log "python: $($Py -join ' ')"

# ---- 1. branch claude/cc-local in its own worktree ----
if (-not (Test-Path (Join-Path $Repo '.git'))) { Write-Host "Repo not found: $Repo"; exit 1 }
CC-Log "git fetch"
& $GitExe -C $Repo fetch origin claude/cc-testing $DevBranch 2>&1 | Out-Host
& $GitExe -C $Repo fetch origin claude/cc-local 2>$null | Out-Host
$hasRemoteLocal = $LASTEXITCODE -eq 0
if (-not (Test-Path $Work)) {
  & $GitExe -C $Repo worktree prune 2>&1 | Out-Host
  & $GitExe -C $Repo worktree add --detach $Work origin/claude/cc-testing 2>&1 | Out-Host
}
if ($hasRemoteLocal) {
  & $GitExe -C $Work checkout -B claude/cc-local origin/claude/cc-local 2>&1 | Out-Host
  & $GitExe -C $Work merge --no-edit origin/claude/cc-testing 2>&1 | Out-Host   # get the newest queue/probes from CC
} else {
  & $GitExe -C $Work checkout -B claude/cc-local origin/claude/cc-testing 2>&1 | Out-Host
}
if ($LASTEXITCODE -ne 0) { Write-Host "git checkout/merge failed in $Work - fix it and rerun"; exit 1 }
$Head = (& $GitExe -C $Repo rev-parse --short "origin/$DevBranch").Trim()
CC-Log "dev head = $Head"

# ---- 2. read queue ----
$QFile = Join-Path $Work 'tools\cc_local\queue.txt'
$Items = @()
foreach ($line in Get-Content -Encoding UTF8 $QFile) {
  $t = $line.Trim(); if (-not $t -or $t.StartsWith('#')) { continue }
  $f = $t.Split('|') | ForEach-Object { $_.Trim() }
  $Items += [pscustomobject]@{ Id=$f[0]; Sha=$f[1]; Kind=$f[2]; Script=$f[3]; Url=$f[4]; Tmin=[int]$f[5]; Env=$(if ($f.Count -gt 6) { $f[6] } else { '' }) }
}
if ($Only) { $sel = $Only.Split(',') | ForEach-Object { $_.Trim() }; $Items = $Items | Where-Object { $sel -contains $_.Id } }
CC-Log ("queue: " + (($Items | ForEach-Object { $_.Id }) -join ', '))
$OutRoot = Join-Path $Work 'docs\story_planning\CC\local_out'
New-Item -ItemType Directory -Force -Path $OutRoot | Out-Null

foreach ($it in $Items) {
  $id = $it.Id; $sha = $it.Sha; if ($sha -eq 'head') { $sha = $Head }
  $od = Join-Path $OutRoot $id; New-Item -ItemType Directory -Force -Path $od | Out-Null
  $meta = [ordered]@{ id=$id; sha=$sha; kind=$it.Kind; script=$it.Script; env=$it.Env; machine=$env:COMPUTERNAME; start=(Get-Date).ToString('s'); end=$null; seconds=$null; exit=$null; error=$null }
  $wt = Join-Path $Base ("wt_cc_" + $id); $srv = $null
  CC-Log "==== $id  ($($it.Kind) @ $sha) ===="
  try {
    if (Test-Path $wt) { & $GitExe -C $Repo worktree remove --force $wt 2>&1 | Out-Host }
    & $GitExe -C $Repo worktree add --detach $wt $sha 2>&1 | Out-Host
    if ($LASTEXITCODE -ne 0) { throw "worktree add $sha failed" }
    $port = CC-FreePort 8800
    $srv = Start-Process -FilePath $PyExe -ArgumentList ($PyPre + @('-m','http.server',"$port",'--bind','127.0.0.1')) -WorkingDirectory $wt -WindowStyle Hidden -PassThru
    Start-Sleep -Seconds 3
    $url = "http://127.0.0.1:$port/$($it.Url)"; $meta.url = $url
    foreach ($kv in ($it.Env -split ';')) { if ($kv -match '^\s*([^=]+)=(.*)$') { Set-Item -Path ("env:" + $Matches[1].Trim()) -Value $Matches[2] } }
    $wrap = Join-Path $Work 'tools\cc_local\gpu_wrap.py'
    switch ($it.Kind) {
      'gpu'   { $args2 = @((Join-Path $Work $it.Script), $url, (Join-Path $od 'gpu.txt')); $cwd = $Work }
      'game'  { $args2 = @($wrap, (Join-Path $wt $it.Script), $url); $cwd = $wt }
      'probe' { $env:LW_TESTS = (Join-Path $wt 'tests'); $env:SHA = $sha
                $args2 = @($wrap, (Join-Path $Work $it.Script), $url, (Join-Path $od 'out')); $cwd = $Work }
      default { throw "unknown kind $($it.Kind)" }
    }
    $env:CC_GPU = '1'
    $p = Start-Process -FilePath $PyExe -ArgumentList ($PyPre + $args2 | ForEach-Object { if ($_ -match '\s|\?') { '"' + $_ + '"' } else { $_ } }) -WorkingDirectory $cwd -NoNewWindow -PassThru `
           -RedirectStandardOutput (Join-Path $od 'run.log') -RedirectStandardError (Join-Path $od 'err.log')
    $null = $p.Handle   # cache handle so ExitCode is readable
    $ok = $p.WaitForExit($it.Tmin * 60 * 1000)
    if (-not $ok) { Stop-Process -Id $p.Id -Force -ErrorAction SilentlyContinue; $meta.error = "timeout $($it.Tmin) min" }
    $meta.exit = $p.ExitCode
    foreach ($kv in ($it.Env -split ';')) { if ($kv -match '^\s*([^=]+)=') { Remove-Item -Path ("env:" + $Matches[1].Trim()) -ErrorAction SilentlyContinue } }
  } catch { $meta.error = "$_"; CC-Log "ERROR $id : $_" }
  finally {
    if ($srv) { Stop-Process -Id $srv.Id -Force -ErrorAction SilentlyContinue }
    Start-Sleep -Seconds 1
    & $GitExe -C $Repo worktree remove --force $wt 2>&1 | Out-Null
  }
  $meta.end = (Get-Date).ToString('s'); $meta.seconds = [int]((Get-Date $meta.end) - (Get-Date $meta.start)).TotalSeconds
  $meta | ConvertTo-Json | Out-File -Encoding utf8 (Join-Path $od 'meta.json')
  # last lines of the log into summary
  $tail = ''; $rl = Join-Path $od 'run.log'; if (Test-Path $rl) { $tail = (Get-Content -Encoding UTF8 $rl -Tail 3) -join ' / ' }
  [void]$Summary.Add(("{0}  sha={1}  exit={2}  {3}s  {4}  {5}" -f $id, $sha, $meta.exit, $meta.seconds, $meta.error, $tail))
  # ---- 5. commit + push only local_out (screenshots capped at 25 MB per item) ----
  $sumFile = Join-Path $OutRoot 'summary.md'
  ("- " + (Get-Date -Format 's') + "  " + $Summary[$Summary.Count-1]) | Out-File -Append -Encoding utf8 $sumFile
  $files = Get-ChildItem -Recurse -File $od
  $nonPng = $files | Where-Object { $_.Extension -ne '.png' }
  foreach ($f in $nonPng) { & $GitExe -C $Work add -- $f.FullName 2>&1 | Out-Null }
  $acc = 0; $skipped = 0
  foreach ($f in ($files | Where-Object { $_.Extension -eq '.png' } | Sort-Object FullName)) {
    if ($acc + $f.Length -le 25MB) { $acc += $f.Length; & $GitExe -C $Work add -- $f.FullName 2>&1 | Out-Null } else { $skipped++ }
  }
  if ($skipped) { "screenshots not pushed (over 25 MB): $skipped" | Out-File -Append -Encoding utf8 (Join-Path $od 'notes.txt') }
  & $GitExe -C $Work add -- $sumFile 2>&1 | Out-Null
  & $GitExe -C $Work commit -q -m "CC-local: $id result (sha $sha, exit $($meta.exit), $($meta.seconds)s)" 2>&1 | Out-Host
  if (-not (CC-RetryPush $Work)) { CC-Log "push failed for $id (results stay in $Work, rerun later)" }
}

Write-Host ""
Write-Host "===== SUMMARY ====="
$Summary | ForEach-Object { Write-Host $_ }
Write-Host "Results: $OutRoot  (pushed to origin/claude/cc-local)"
