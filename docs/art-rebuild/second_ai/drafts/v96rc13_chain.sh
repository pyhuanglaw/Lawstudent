#!/bin/bash
SP=/tmp/claude-0/-home-user-Lawstudent/b2086276-f771-5e36-88cb-063a8a6233cc/scratchpad; U=http://127.0.0.1:8811/index.html
cd /home/user/rc13_wt
for t in tests/flow_main_day12.py tests/flow_teaching_buildings.py; do
  n=$(basename $t .py); s=$(date -u +%H:%M:%S)
  timeout 7200 python3 $t $U $SP/rc13/out/$n > $SP/rc13/$n.log 2>&1; rc=$?
  echo "$n start $s end $(date -u +%H:%M:%S) exit $rc" >> $SP/rc13/summary.txt
done
echo ALLDONE >> $SP/rc13/summary.txt
