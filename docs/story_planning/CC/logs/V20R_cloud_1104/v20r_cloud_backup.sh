#!/bin/bash
# CC-C 11-04：V20R 雲端備援（BB-C 16:40）：d3828452a，SwiftShader 無頭，一次一支；每支開跑前等別的瀏覽器／T1 的 Node 停下來（最多 30 分），開跑和結束時記負載
SP=/tmp/claude-0/-home-user/bf9567b3-8550-59a7-85d5-19c7b8aa16e5/scratchpad
W=$SP/wt_d382; O=$SP/v20r_cloud; U=http://127.0.0.1:8792/index.html; U7=http://127.0.0.1:8794/index.html
ss -ltn | grep -q ':8792 ' || (cd $W && python3 -m http.server 8792 >/dev/null 2>&1 &)
ss -ltn | grep -q ':8794 ' || (cd $SP/wt_385e && python3 -m http.server 8794 >/dev/null 2>&1 &)
sleep 2
others(){ pgrep -f 'cc_sitamb_probe|random_play_sim|cc_ptboya_probe|cc_dorm_loft_probe' | tr '\n' ' '; }
run(){ name=$1; shift; t0=$(date +%s); w=0
  while [ -n "$(others)" ] && [ $w -lt 1800 ]; do sleep 20; w=$((w+20)); done
  echo "=== $name start $(date -u +%H:%M:%S) waited ${w}s load=$(cut -d' ' -f1-3 /proc/loadavg) others=[$(others)]" | tee -a $O/summary.txt
  t1=$(date +%s); (cd $W && timeout 3600 "$@") > $O/$name.log 2>&1; rc=$?
  echo "=== $name end $(date -u +%H:%M:%S) exit=$rc $(( $(date +%s)-t1 ))s load=$(cut -d' ' -f1-3 /proc/loadavg) others=[$(others)] last: $(grep -E 'ALL PASS|FAILED|PASS [0-9]|FAIL' $O/$name.log | tail -1 | cut -c1-160)" | tee -a $O/summary.txt
}
run V20R_reach python3 tests/reachability_all.py "$U?turbo"
run V20R_zone python3 tests/zone_transitions.py "$U?turbo"
run V20R_p0 python3 tests/p0_movement.py "$U"
run V20R_v7 python3 tests/save_compat_v7.py "$U7" "$U"
run V20R_touch python3 tests/touch_flow_wenzhou.py "$U?turbo"
mkdir -p $O/linze_out; run V20R_linze python3 tests/flow_linze_floors.py "$U" $O/linze_out
echo "=== ALL DONE $(date -u +%H:%M:%S)" | tee -a $O/summary.txt
