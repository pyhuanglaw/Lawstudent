#!/usr/bin/env bash
# 瀏覽器測試佇列（wt_dev，port 8768）：一次跑一個（SwiftShader 搶不到 CPU 會誤判）。
# 加測試：echo "名稱|指令" >> q/queue.txt（指令在 wt_dev 執行，{U}＝網址、{O}＝輸出資料夾）
# 換程式版本：echo <commit> > q/FF（下一個測試開始前快轉 wt_dev，不會在測試中途改檔案）；停止：touch q/STOP
SP=/tmp/claude-0/-home-user-Lawstudent/a98cd672-cd93-5881-9adc-d5e86cb59d66/scratchpad; Q=$SP/q; U=http://127.0.0.1:8768/index.html; F=$Q/Q.txt
cd $SP/wt_dev
while pgrep -f "tests/flow_soclib.py" >/dev/null; do sleep 10; done
echo "start $(date -u +%FT%TZ) $(git rev-parse --short HEAD)" >> $F
while true; do
  if [ -s $Q/FF ]; then t=$(cat $Q/FF); : > $Q/FF; if git merge -q --ff-only "$t" 2>>$F; then echo "ff → $(git rev-parse --short HEAD) $(date -u +%T)" >> $F; else echo "ff FAILED $t" >> $F; fi; fi
  line=$(head -1 $Q/queue.txt 2>/dev/null)
  if [ -z "$line" ]; then [ -f $Q/STOP ] && break; sleep 15; continue; fi
  sed -i 1d $Q/queue.txt
  n=${line%%|*}; cmd=${line#*|}; O=$Q/$n; mkdir -p $O; cmd=${cmd//\{U\}/$U}; cmd=${cmd//\{O\}/$O}
  t0=$(date +%s); bash -c "$cmd" > $O.log 2>&1; rc=$?
  echo "$n rc=$rc ($(( $(date +%s)-t0 ))s) @$(git rev-parse --short HEAD) $(grep -E 'ALL PASS|FAILED|RESULT|PASS [0-9]|通過' $O.log | tail -1 | cut -c1-220)" >> $F
done
echo "DONE $(date -u +%FT%TZ)" >> $F
