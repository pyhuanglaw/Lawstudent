#!/bin/bash
# 候選 8（3e5201d）：等 flow_lecture_attend（pid 4340，候選 6/7 的遊戲）跑完 → adv_cg_layout → main_day12 → teaching_buildings → soclib → campus_glb_integration → flow_first_meet（候選 8 重跑）→ flow_discuss_class
SP=/tmp/claude-0/-home-user-Lawstudent/b2086276-f771-5e36-88cb-063a8a6233cc/scratchpad; U=http://127.0.0.1:8813/index.html
while kill -0 4340 2>/dev/null; do sleep 5; done
grep -q '^ALL PASS' $SP/v97rc5/flow_lecture_attend.log && rc=0 || rc=1
echo "flow_lecture_attend start 08:47:00 end $(date -u +%H:%M:%S) exit $rc @7c5d4c2" >> $SP/v97rc5/summary.txt
cd /home/user/v97rc5_wt
for n in adv_cg_layout flow_main_day12 flow_teaching_buildings flow_soclib campus_glb_integration flow_first_meet flow_discuss_class; do
  s=$(date -u +%H:%M:%S); [ "$n" = flow_first_meet ] && o=flow_first_meet_rc8 || o=$n
  timeout 5400 python3 tests/$n.py $U $SP/v97rc5/out/$o > $SP/v97rc5/$o.log 2>&1; rc=$?
  echo "$o start $s end $(date -u +%H:%M:%S) exit $rc" >> $SP/v97rc5/summary.txt
done
echo ALLDONE2 >> $SP/v97rc5/summary.txt
