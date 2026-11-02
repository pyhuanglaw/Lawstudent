#!/bin/sh
# run_forever.ps1 的等價 sh 版（雲端沒有 pwsh，用來驗證迴圈邏輯；Linux 上也能直接用）。
# 等待秒數可用 RF_WAIT0／RF_WAITERR 覆寫（測試用）；RF_MAX＝最多跑幾輪（測試用，0＝無限）。
here=$(cd "$(dirname "$0")" && pwd)
runner=${RF_RUNNER:-$here/run_queue.py}
py=${RF_PY:-python3}
n=0
while :; do
  n=$((n+1))
  echo "[$(date +%H:%M:%S)] run_forever: round $n - $py $runner --parallel 2 $*"
  CC_RF_ROUND=$n "$py" "$runner" --parallel 2 "$@"
  rc=$?
  if [ "${RF_MAX:-0}" -gt 0 ] && [ "$n" -ge "${RF_MAX}" ]; then echo "run_forever: RF_MAX reached"; exit 0; fi
  if [ $rc -eq 75 ]; then echo "[$(date +%H:%M:%S)] run_forever: runner updated itself (exit 75) - restarting now"; continue; fi
  if [ $rc -eq 0 ]; then w=${RF_WAIT0:-300}; else w=${RF_WAITERR:-60}; fi
  echo "[$(date +%H:%M:%S)] run_forever: runner exit $rc - next round in $w s"
  sleep "$w"
done
