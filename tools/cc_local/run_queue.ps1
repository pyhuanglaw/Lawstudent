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

# git writes progress ("From ...", "Preparing worktree ...") to stderr; PowerShell 5 turns that into red NativeCommandError text.
# CC-Git shows it in gray instead; success is judged only by $LASTEXITCODE.
function CC-Git {
  $old = $ErrorActionPreference; $ErrorActionPreference = 'SilentlyContinue'
  try {
    & $GitExe @args 2>&1 | ForEach-Object {
      if ($_ -is [System.Management.Automation.ErrorRecord]) { Write-Host $_.Exception.Message -ForegroundColor DarkGray } else { Write-Host $_ }
    }
  } finally { $ErrorActionPreference = $old }
}
function CC-GitQuiet { $old = $ErrorActionPreference; $ErrorActionPreference = 'SilentlyContinue'; try { & $GitExe @args 2>&1 | Out-Null } finally { $ErrorActionPreference = $old } }
function CC-Log($m) { Write-Host ("[{0}] {1}" -f (Get-Date -Format 'HH:mm:ss'), $m) }
function CC-RetryPush($dir) {
  foreach ($w in 0,2,4,8,16) {
    if ($w) { Start-Sleep -Seconds $w }
    CC-Git -C $dir push -u origin claude/cc-local
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
# Pick a Python that really runs and has playwright; then use its real python.exe (sys.executable),
# not the py.exe launcher or the WindowsApps alias (those can fail under Start-Process with redirection).
function CC-FindPython {
  $cands = @()
  $c = Get-Command py -CommandType Application -ErrorAction SilentlyContinue | Select-Object -First 1
  if ($c) { $cands += ,@($c.Source, '-3.12'); $cands += ,@($c.Source, '-3') }
  foreach ($c in @(Get-Command python -CommandType Application -All -ErrorAction SilentlyContinue)) { $cands += ,@($c.Source) }
  foreach ($c in @(Get-Command python3 -CommandType Application -All -ErrorAction SilentlyContinue)) { $cands += ,@($c.Source) }
  $report = @()
  foreach ($cand in $cands) {
    $exe = $cand[0]; $pre = @(); if ($cand.Count -gt 1) { $pre = $cand[1..($cand.Count-1)] }
    $old = $ErrorActionPreference; $ErrorActionPreference = 'SilentlyContinue'
    $out = & $exe @pre -c "import sys, playwright; print(sys.executable)" 2>&1 | ForEach-Object { "$_" }
    $code = $LASTEXITCODE; $ErrorActionPreference = $old
    $report += ("  {0} {1} -> exit {2}: {3}" -f $exe, ($pre -join ' '), $code, (($out | Select-Object -Last 2) -join ' / '))
    if ($code -eq 0) {
      $real = ($out | Where-Object { $_ -match 'python' } | Select-Object -Last 1)
      if ($real -and (Test-Path $real.Trim())) { $report | ForEach-Object { Write-Host $_ -ForegroundColor DarkGray }; return @($real.Trim()) }
      $report | ForEach-Object { Write-Host $_ -ForegroundColor DarkGray }; return @($cand)
    }
  }
  Write-Host "No usable Python with playwright was found. Tried:" -ForegroundColor Red
  $report | ForEach-Object { Write-Host $_ -ForegroundColor Red }
  Write-Host "Fix: install Python 3.12 from python.org (tick 'Add python.exe to PATH'), then run:" -ForegroundColor Yellow
  Write-Host "  py -3 -m pip install playwright==1.63.0" -ForegroundColor Yellow
  Write-Host "  py -3 -m playwright install chromium" -ForegroundColor Yellow
  exit 1
}
$Py = @(CC-FindPython)   # @() so a single path is not unrolled into a string
$PyExe = $Py[0]; $PyPre = @(); if ($Py.Count -gt 1) { $PyPre = $Py[1..($Py.Count-1)] }
CC-Log "python: $($Py -join ' ')"

# ---- 1. branch claude/cc-local in its own worktree ----
if (-not (Test-Path (Join-Path $Repo '.git'))) { Write-Host "Repo not found: $Repo"; exit 1 }
$gEmail = (& $GitExe -C $Repo config user.email); $gName = (& $GitExe -C $Repo config user.name)
if (-not $gEmail -or -not $gName) {
  Write-Host "git user.name / user.email is not set, so results cannot be committed. Set them once, then rerun:" -ForegroundColor Red
  Write-Host '  git config --global user.name "Your Name"' -ForegroundColor Yellow
  Write-Host '  git config --global user.email "you@example.com"' -ForegroundColor Yellow
  exit 1
}
CC-Log "git fetch"
CC-Git -C $Repo fetch origin claude/cc-testing $DevBranch
CC-GitQuiet -C $Repo fetch origin claude/cc-local
$hasRemoteLocal = $LASTEXITCODE -eq 0
if (-not (Test-Path $Work)) {
  CC-Git -C $Repo worktree prune
  CC-Git -C $Repo worktree add --detach $Work origin/claude/cc-testing
}
if ($hasRemoteLocal) {
  CC-Git -C $Work checkout -B claude/cc-local origin/claude/cc-local
  CC-Git -C $Work merge --no-edit origin/claude/cc-testing   # get the newest queue/probes from CC
} else {
  CC-Git -C $Work checkout -B claude/cc-local origin/claude/cc-testing
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

$skipped_n = 0; $ran_n = 0
foreach ($it in $Items) {
  $id = $it.Id; $sha = $it.Sha; if ($sha -eq 'head') { $sha = $Head }
  # ---- skip items already done on this exact sha (overnight loop, BB 10:29) ----
  # done = meta.json has the same resolved sha AND finished on its own (exit 0, or exit 1 = probe finished with FAIL checks; no timeout/error)
  # force a rerun: put RERUN=<anything new> in the ENV column (compared with meta.rerun)
  $rerunTok = ''; foreach ($kv in ($it.Env -split ';')) { if ($kv -match '^\s*RERUN=(.*)$') { $rerunTok = $Matches[1].Trim() } }
  $prevMeta = Join-Path (Join-Path $OutRoot $id) 'meta.json'
  if (Test-Path $prevMeta) {
    try {
      $pm = Get-Content -Raw -Encoding UTF8 $prevMeta | ConvertFrom-Json
      $pmRerun = ''; if ($pm.PSObject.Properties.Name -contains 'rerun' -and $pm.rerun) { $pmRerun = [string]$pm.rerun }
      if ($pm.sha -eq $sha -and ($pm.exit -eq 0 -or $pm.exit -eq 1) -and -not $pm.error -and $pmRerun -eq $rerunTok) {
        CC-Log "skip $id (already done on $sha, exit $($pm.exit))"; $skipped_n++; continue
      }
    } catch { CC-Log "meta.json of $id unreadable - rerun" }
  }
  $od = Join-Path $OutRoot $id; New-Item -ItemType Directory -Force -Path $od | Out-Null
  $ran_n++
  $meta = [ordered]@{ rerun=$rerunTok; id=$id; sha=$sha; kind=$it.Kind; script=$it.Script; env=$it.Env; machine=$env:COMPUTERNAME; start=(Get-Date).ToString('s'); end=$null; seconds=$null; exit=$null; error=$null }
  $wt = Join-Path $Base ("wt_cc_" + $id); $srv = $null
  CC-Log "==== $id  ($($it.Kind) @ $sha) ===="
  try {
    if (Test-Path $wt) { CC-Git -C $Repo worktree remove --force $wt }
    CC-Git -C $Repo worktree add --detach $wt $sha
    if ($LASTEXITCODE -ne 0) { throw "worktree add $sha failed" }
    $port = CC-FreePort 8800
    $srv = Start-Process -FilePath $PyExe -ArgumentList ($PyPre + @('-m','http.server',"$port",'--bind','127.0.0.1')) -WorkingDirectory $wt -WindowStyle Hidden -PassThru
    Start-Sleep -Seconds 3
    $url = "http://127.0.0.1:$port/$($it.Url)"; $meta.url = $url
    foreach ($kv in ($it.Env -split ';')) { if ($kv -match '^\s*([^=]+)=(.*)$') { Set-Item -Path ("env:" + $Matches[1].Trim()) -Value $Matches[2] } }
    $wrap = Join-Path $Work 'tools\cc_local\gpu_wrap.py'
    switch ($it.Kind) {
      'gpu'   { $args2 = @((Join-Path $Work $it.Script), $url, (Join-Path $od 'gpu.txt')); $cwd = $Work }
      'py'    { $args2 = @((Join-Path $Work $it.Script), $url, $od); $cwd = $Work }   # repo script, args <URL> <out dir>
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
    CC-GitQuiet -C $Repo worktree remove --force $wt
  }
  $meta.end = (Get-Date).ToString('s'); $meta.seconds = [int]((Get-Date $meta.end) - (Get-Date $meta.start)).TotalSeconds
  $meta | ConvertTo-Json | Out-File -Encoding utf8 (Join-Path $od 'meta.json')
  # last lines of the log into summary
  $tail = ''; $rl = Join-Path $od 'run.log'; if (Test-Path $rl) { $tail = (Get-Content -Encoding UTF8 $rl -Tail 3) -join ' / ' }
  [void]$Summary.Add(("{0}  sha={1}  exit={2}  {3}s  {4}  {5}" -f $id, $sha, $meta.exit, $meta.seconds, $meta.error, $tail))
  $el = Join-Path $od 'err.log'; if ((Test-Path $el) -and (Get-Item $el).Length -gt 0) { [void]$Summary.Add("    err.log (last 5): " + ((Get-Content -Encoding UTF8 $el -Tail 5) -join ' | ')) }
  # ---- 5. commit + push only local_out (screenshots capped at 25 MB per item) ----
  $sumFile = Join-Path $OutRoot 'summary.md'
  $line0 = $Summary.Count - 1; while ($line0 -gt 0 -and $Summary[$line0] -match '^\s') { $line0-- }
  ("- " + (Get-Date -Format 's') + "  " + (($Summary[$line0..($Summary.Count-1)]) -join "`n  ")) | Out-File -Append -Encoding utf8 $sumFile
  $files = Get-ChildItem -Recurse -File $od
  $nonPng = $files | Where-Object { $_.Extension -ne '.png' }
  foreach ($f in $nonPng) { CC-GitQuiet -C $Work add -- $f.FullName }
  $acc = 0; $skipped = 0
  foreach ($f in ($files | Where-Object { $_.Extension -eq '.png' } | Sort-Object FullName)) {
    if ($acc + $f.Length -le 25MB) { $acc += $f.Length; CC-GitQuiet -C $Work add -- $f.FullName } else { $skipped++ }
  }
  if ($skipped) { "screenshots not pushed (over 25 MB): $skipped" | Out-File -Append -Encoding utf8 (Join-Path $od 'notes.txt') }
  CC-GitQuiet -C $Work add -- $sumFile
  CC-Git -C $Work commit -q -m "CC-local: $id result (sha $sha, exit $($meta.exit), $($meta.seconds)s)"
  if ($LASTEXITCODE -ne 0) { Write-Host "ERROR: git commit failed for $id (exit $LASTEXITCODE) - results are only on this PC in $od" -ForegroundColor Red; [void]$Summary.Add("  !! commit failed for $id") }
  if (-not (CC-RetryPush $Work)) { CC-Log "push failed for $id (results stay in $Work, rerun later)" }
}

Write-Host ""
Write-Host "===== SUMMARY ====="
Write-Host ("ran {0} item(s), skipped {1} already done" -f $ran_n, $skipped_n)
if ($ran_n -eq 0) { Write-Host "Nothing new in the queue this round." }
$Summary | ForEach-Object { Write-Host $_ }
Write-Host "Results: $OutRoot  (pushed to origin/claude/cc-local)"
