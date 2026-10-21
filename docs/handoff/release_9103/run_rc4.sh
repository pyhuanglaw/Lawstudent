#!/bin/bash
# v9.10.3 候選第二版 bcbd4b65（f72a2a21＋手機自動打開修正 4c90c913）：等 rc3 的 save_compat_start1 跑完，
# 先用 probe 對照 f72a2a21／bcbd4b65 手機自己打開幾次，再跑 f72a2a21 上沒過、或受手機影響的四支（開發分支的測試版本）
S=/tmp/claude-0/-home-user-Lawstudent/742ba598-1396-5e88-b31e-f2cb9e414c34/scratchpad; OUT=$S/rc4_bcbd4b65; W=$S/wt_rc4; W3=$S/wt_rc3
while ! grep -q "^START1 DONE" $S/rc3_f72a2a21/summary.txt; do sleep 20; done
mkdir -p $W/tests_new; for f in smoke_release flow_v0_start touch_flow_wenzhou flow_exam_terms playlib; do cp /home/user/Lawstudent/tests/$f.py $W/tests_new/; done
(cd $W && exec python3 -m http.server 8931 >/dev/null 2>&1 &); (cd $W3 && exec python3 -m http.server 8932 >/dev/null 2>&1 &); sleep 3
NEW=http://127.0.0.1:8931/index.html
echo "start $(date -u +%H:%M:%S)" >> $OUT/summary.txt
run(){ name=$1; shift; st=$(date +%s); (cd $W && timeout 3600 python3 "$@" > $OUT/$name.log 2>&1); rc=$?; echo "$name exit=$rc $(( ($(date +%s)-st)/60 ))min $(tail -1 $OUT/$name.log | cut -c1-200)" >> $OUT/summary.txt; }
run probe_old $S/probe_phone_reopen.py http://127.0.0.1:8932/index.html f72a2a21
run probe_new $S/probe_phone_reopen.py $NEW bcbd4b65
P=$(pgrep -f "http.server 8932"); [ -n "$P" ] && kill $P
run smoke_release tests_new/smoke_release.py $NEW $OUT/smoke
run flow_v0_start tests_new/flow_v0_start.py $NEW $OUT/v0start
run touch_flow_wenzhou tests_new/touch_flow_wenzhou.py $NEW
run flow_exam_terms tests_new/flow_exam_terms.py $NEW $OUT/exam
P=$(pgrep -f "http.server 8931"); [ -n "$P" ] && kill $P
echo "RC4 DONE $(date -u +%H:%M:%S)" >> $OUT/summary.txt
