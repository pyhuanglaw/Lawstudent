#!/bin/bash
# v9.7 候選 2（06f2b64＋a8f05de 的 tests/flow_typhoon.py），server 8812（/home/user/v97rc2_wt）。等 v9.6 候選 13 的 flow_soclib 跑完才開始（一次一個瀏覽器）
SP=/tmp/claude-0/-home-user-Lawstudent/b2086276-f771-5e36-88cb-063a8a6233cc/scratchpad; U=http://127.0.0.1:8812/index.html
until grep -q ALLDONE $SP/rc13/summary2.txt 2>/dev/null; do sleep 5; done
cd /home/user/v97rc2_wt
run() { t=$1; n=$(basename $t .py); s=$(date -u +%H:%M:%S)
  timeout 5400 python3 $t $U $SP/v97rc2/out/$n > $SP/v97rc2/$n.log 2>&1; rc=$?
  echo "$n start $s end $(date -u +%H:%M:%S) exit $rc" >> $SP/v97rc2/summary.txt; }
run tests/flow_typhoon.py
# 手機：不管 flow_typhoon 過不過都跑診斷（新測試點不開會重點，第一次點有沒有被吃掉要另外看）
s=$(date -u +%H:%M:%S); timeout 900 python3 $SP/v97/diag/phone_diag.py $U $SP/v97rc2/out/phone_diag /home/user/v97rc2_wt/tests > $SP/v97rc2/phone_diag.log 2>&1; rc=$?
echo "phone_diag start $s end $(date -u +%H:%M:%S) exit $rc" >> $SP/v97rc2/summary.txt
for t in tools/shots/cg_rain_shots.py tests/flow_first_meet.py tests/flow_invite_phone.py tests/flow_lecture_attend.py tests/flow_discuss_class.py tests/adv_cg_layout.py tests/flow_main_day12.py \
         tests/flow_class_real.py tests/flow_classes.py tests/flow_linze_floors.py tests/flow_teaching_buildings.py tests/flow_soclib.py tests/campus_layout_nav.py tests/joystick_direction.py tests/campus_glb_integration.py; do
  run $t
done
echo ALLDONE >> $SP/v97rc2/summary.txt
