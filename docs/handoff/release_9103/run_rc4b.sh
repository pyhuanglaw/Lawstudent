#!/bin/bash
# 先在沒有別的工作的時候量幀率與前方有沒有被擋（v9.10.2 9335763d 對 bcbd4b65），再接著跑 rc4 剩下的三支
S=/tmp/claude-0/-home-user-Lawstudent/742ba598-1396-5e88-b31e-f2cb9e414c34/scratchpad; OUT=$S/rc4_bcbd4b65; W=$S/wt_rc4; WO=$S/wt_rel9102
(cd $W && exec python3 -m http.server 8931 >/dev/null 2>&1 &); (cd $WO && exec python3 -m http.server 8933 >/dev/null 2>&1 &); sleep 3
NEW=http://127.0.0.1:8931/index.html
run(){ name=$1; shift; st=$(date +%s); (cd $W && timeout 3600 python3 "$@" > $OUT/$name.log 2>&1); rc=$?; echo "$name exit=$rc $(( ($(date +%s)-st)/60 ))min $(tail -1 $OUT/$name.log | cut -c1-260)" >> $OUT/summary.txt; }
echo "restart $(date -u +%H:%M:%S)" >> $OUT/summary.txt
run fps_old $S/probe_fps.py http://127.0.0.1:8933/index.html v9.10.2_9335763d
run fps_new $S/probe_fps.py $NEW bcbd4b65
P=$(pgrep -f "[h]ttp.server 8933"); [ -n "$P" ] && kill $P
echo "FPS DONE" >> $OUT/summary.txt
run flow_v0_start tests_new/flow_v0_start.py $NEW $OUT/v0start
run touch_flow_wenzhou tests_new/touch_flow_wenzhou.py $NEW
run flow_exam_terms tests_new/flow_exam_terms.py $NEW $OUT/exam
P=$(pgrep -f "[h]ttp.server 8931"); [ -n "$P" ] && kill $P
echo "RC4 DONE $(date -u +%H:%M:%S)" >> $OUT/summary.txt
