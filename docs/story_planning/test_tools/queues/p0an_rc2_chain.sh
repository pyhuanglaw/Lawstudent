#!/bin/bash
# BB-C 10-27 21:3x：P0 AN-MEAL-STUCK 照玩家操作（f54 重現 → rc2 修正）→ rc2 補跑邀約／吃飯／出遊流程＋save_compat＋relsuite 剩下的瀏覽器項目
SP=/tmp/claude-0/-home-user-Lawstudent/4f52e6f0-1e48-5c03-872f-171d129a03fd/scratchpad; P=$SP/bbtest/p0an; TT=/home/user/Lawstudent/docs/story_planning/test_tools
LOG=$P/chain.log; F54=$SP/lwwt5; RC2=$SP/lwwt8
probe(){ local tree=$1 port=$2 sha=$3 mode=$4 save=$5 tag=$6; local o=$P/${sha}_${tag}; mkdir -p $o
  echo "[p0] $(date -u +%H:%M) 開始 $sha $tag" >> $LOG
  ( cd $SP && FCALL=${FCALL:-} LW_TESTS=$tree/tests MODE=$mode SHA=$sha timeout 900 python3 $TT/an_stuck_probe.py "http://127.0.0.1:$port/index.html?${QS:-turbo}" $o $save > $o.log 2>&1 ); local rc=$?
  echo "[p0] $(date -u +%H:%M) 結束 $sha $tag rc=$rc；$(grep -c '^ *FAIL\|\bFAIL ' $o.log) 行 FAIL；卡住：$(grep -c '卡住：' $o.log)；$(grep -o '進門後 [0-9]* ms' $o.log | head -1)" >> $LOG; return $rc; }
echo "[p0] $(date -u +%H:%M) 第四版：talk 不用 turbo（turbo 把 GM.sleep 壓到 120 ms，0.9 秒的空檔變 0.4 秒）＋lowres；按鈕版沒重現就加跑 FCALL（直接呼叫 an.talk，同 LAWWW-C 子代理）" >> $LOG
# A：f54 重現（talk 兩次，有一次卡住就停；都沒有就 FCALL 一次）
for i in 1 2; do QS=lowres probe $F54 8837 f54a35ec4 talk $P/user_day14.json talk$i; grep -q '卡住：' $P/f54a35ec4_talk$i.log && break; done
grep -q '卡住：' $P/f54a35ec4_talk*.log || FCALL=1 QS=lowres probe $F54 8837 f54a35ec4 talk $P/user_day14.json fcall1
# B：f54 讀「進門那一刻」的存檔（自己造的＋LAWWW-C 的 day14_going_in_noodle）
probe $F54 8837 f54a35ec4 reload $P/user_day14.json reload
probe $F54 8837 f54a35ec4 user $P/day14_going_in_noodle.json goingsave
# C：rc2
for i in 1 2; do QS=lowres probe $RC2 8838 6aebbb4d8 talk $P/user_day14.json talk$i; done
FCALL=1 QS=lowres probe $RC2 8838 6aebbb4d8 talk $P/user_day14.json fcall1
probe $RC2 8838 6aebbb4d8 plain $P/user_day14.json plain
probe $RC2 8838 6aebbb4d8 reload $P/user_day14.json reload
probe $RC2 8838 6aebbb4d8 user $P/day14_going_in_noodle.json goingsave
probe $RC2 8838 6aebbb4d8 user $P/user_day14.json usersave
echo "[p0] $(date -u +%H:%M) P0 全部跑完" >> $LOG
# D：rc2 補跑（release_suite.sh 的 run 格式）
OUT=$SP/bbtest/rc2suite; mkdir -p $OUT; SUM=$OUT/SUMMARY.txt; : > $SUM; URL=http://127.0.0.1:8838/index.html
run() { local name="$1"; shift; local t0=$(date +%s); echo "[rc2] $(date -u +%H:%M) 開始 $name" >> $LOG; ( cd $RC2 && "$@" ) > "$OUT/$name.log" 2>&1; local rc=$?; local dt=$(( $(date +%s) - t0 ));
  local tail1=$(grep -E "ALL PASS|FAILED|^PASS|^FAIL" "$OUT/$name.log" | tail -1 | cut -c1-160)
  printf '%-28s %s  (%ss)  %s\n' "$name" "$([ $rc -eq 0 ] && echo PASS || echo "FAIL(rc=$rc)")" "$dt" "$tail1" | tee -a "$SUM" >> $LOG; }
run inv_arrive_lock_unit node tests/inv_arrive_lock_unit.js
for f in $(cd $RC2 && grep -l "invites3d" tests/*_unit.js); do n=$(basename $f .js); [ $n = inv_arrive_lock_unit ] && continue; run $n node $f; done
run flow_invite_phone   python3 tests/flow_invite_phone.py "$URL" "$OUT/flow_invite_phone"
run flow_termend        python3 tests/flow_termend.py "$URL" "$OUT/flow_termend"
run flow_trip_date      python3 tests/flow_trip_date.py "$URL" "$OUT/flow_trip_date"
run flow_lane118        python3 tests/flow_lane118.py "$URL" "$OUT/flow_lane118"
run save_compat_v7      python3 tests/save_compat_v7.py http://127.0.0.1:8812/index.html "$URL"
run save_compat_live    python3 tests/save_compat_v7.py http://127.0.0.1:8827/index.html "$URL"
run flow_main_day12     python3 tests/flow_main_day12.py "$URL" "$OUT/flow_main_day12"
run flow_wancai_stairs  python3 tests/flow_wancai_stairs.py "$URL" "$OUT/flow_wancai_stairs"
run flow_wancai_floors  python3 tests/flow_wancai_floors.py "$URL" "$OUT/flow_wancai_floors"
run flow_library_floors python3 tests/flow_library_floors.py "$URL" "$OUT/flow_library_floors"
run flow_library_scene  python3 tests/flow_library_scene.py "$URL" "$OUT/flow_library_scene"
run flow_classes        python3 tests/flow_classes.py "$URL" "$OUT/flow_classes"
run flow_teaching_bldgs python3 tests/flow_teaching_buildings.py "$URL" "$OUT/flow_teaching_buildings"
run guide_flow          python3 tests/guide_flow.py "$URL?turbo" "$OUT/guide_flow"
run levels_no_sky       python3 tests/levels_no_sky.py "$URL?turbo" "$OUT/levels_no_sky"
run flow_dorm_hall      python3 tests/flow_dorm_hall.py "$URL" "$OUT/flow_dorm_hall"
echo "[rc2] $(date -u +%H:%M) 全部跑完" >> $LOG
