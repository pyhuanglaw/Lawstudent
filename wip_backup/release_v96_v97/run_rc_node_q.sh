#!/usr/bin/env bash
# 發布候選的 Node 測試（在佇列的 checkout 裡跑；目前資料夾＝候選版本）：每個檔案一行結果，最後一行 ALL PASS 或 FAILED
fails=""
echo "# $(git rev-parse --short HEAD) $(date -u +%T)"
for f in tests/*.js; do r=$(node $f 2>&1); rc=$?; echo "$f rc=$rc: $(echo "$r" | grep -E 'ALL PASS|FAIL|PASS' | tail -1 | cut -c1-160)"; [ $rc -ne 0 ] && fails="$fails $f"; done
for c in char.yuting char.heroine_01 char.heroine_02 char.heroine_03 char.heroine_04 char.heroine_05; do r=$(node tests/stairs_feet_unit.js $c 2>&1); rc=$?; echo "stairs_feet $c rc=$rc: $(echo "$r" | tail -1 | cut -c1-120)"; [ $rc -ne 0 ] && fails="$fails stairs_feet:$c"; done
r=$(node tools/dev_scratch/kit_nav_check.js 2>&1); rc=$?; echo "kit_nav_check rc=$rc: $(echo "$r" | tail -1 | cut -c1-160)"; [ $rc -ne 0 ] && fails="$fails kit_nav_check"
r=$(node tools/dev_scratch/spring_sim/sim_hair.js 2>&1); rc=$?; echo "sim_hair rc=$rc: $(echo "$r" | tail -1 | cut -c1-160)"; [ $rc -ne 0 ] && fails="$fails sim_hair"
if [ -z "$fails" ]; then echo "NODE ALL PASS"; exit 0; else echo "FAILED:$fails"; exit 1; fi
