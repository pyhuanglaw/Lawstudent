#!/bin/bash
# BB-C 10-27 23:1x：開發分支 05069d928（lwdev3，port 8840）——5p 羽球背包 → 5q 卡住防護 → A21 開門 → 兩支改好的測試；rc2 補跑＋main deploy_check 跑完才開始
SP=/tmp/claude-0/-home-user-Lawstudent/4f52e6f0-1e48-5c03-872f-171d129a03fd/scratchpad; T=$SP/lwdev3; TT=/home/user/Lawstudent/docs/story_planning/test_tools; O=$SP/bbtest/dev05; LOG=$O/chain.log; U=http://127.0.0.1:8840/index.html
while kill -0 3543 2>/dev/null; do sleep 10; done
r(){ local tag=$1; shift; echo "[dev] $(date -u +%H:%M) 開始 $tag" >> $LOG; ( cd $SP && "$@" ) > $O/$tag.log 2>&1; local rc=$?; echo "[dev] $(date -u +%H:%M) 結束 $tag rc=$rc；$(grep -c '^FAIL ' $O/$tag.log) 行 FAIL；$(grep -E 'ALL PASS|FAILED' $O/$tag.log | tail -1 | cut -c1-140)" >> $LOG; }
# 5p 羽球背包（X117）
r bag_yt_full    env LW_TESTS=$T/tests PARTNER=heroine_03 timeout 900 python3 $TT/badclip_bag_probe.py $U $O/bag_yt_full
r bag_an_full    env LW_TESTS=$T/tests PARTNER=heroine_01 timeout 900 python3 $TT/badclip_bag_probe.py $U $O/bag_an_full
r bag_zhe_full   env LW_TESTS=$T/tests PARTNER=zhe timeout 900 python3 $TT/badclip_bag_probe.py $U $O/bag_zhe_full
r bag_bohan_full env LW_TESTS=$T/tests PARTNER=classmate_bohan timeout 900 python3 $TT/badclip_bag_probe.py $U $O/bag_bohan_full
r bag_yt_second  env LW_TESTS=$T/tests PARTNER=heroine_03 FULL=0 timeout 900 python3 $TT/badclip_bag_probe.py $U $O/bag_yt_second
r bag_yt_skip    env LW_TESTS=$T/tests PARTNER=heroine_03 SKIP=1 timeout 900 python3 $TT/badclip_bag_probe.py $U $O/bag_yt_skip
r bag_an_phone   env LW_TESTS=$T/tests PARTNER=heroine_01 MODE=phone timeout 1200 python3 $TT/badclip_bag_probe.py $U $O/bag_an_phone
# 5q 卡住防護
r stale_lock     bash -c "cd $T && timeout 900 python3 tests/stale_lock_escape.py $U"
r an_talk1       env LW_TESTS=$T/tests MODE=talk SHA=05069d928 timeout 900 python3 $TT/an_stuck_probe.py "$U?lowres" $O/an_talk1 $SP/bbtest/p0an/user_day14.json
r an_fcall       env LW_TESTS=$T/tests MODE=talk FCALL=1 SHA=05069d928 timeout 900 python3 $TT/an_stuck_probe.py "$U?lowres" $O/an_fcall $SP/bbtest/p0an/user_day14.json
r an_reload      env LW_TESTS=$T/tests MODE=reload SHA=05069d928 timeout 900 python3 $TT/an_stuck_probe.py "$U?turbo" $O/an_reload $SP/bbtest/p0an/user_day14.json
# A21 開門
r door           env LW_TESTS=$T/tests timeout 2400 python3 $TT/door_anim_probe.py $U $O/door
# 兩支改好的測試（patch flow_invite_trip_1027）
r flow_invite_phone bash -c "cd $T && timeout 900 python3 tests/flow_invite_phone.py $U $O/flow_invite_phone"
r flow_trip_date    bash -c "cd $T && timeout 900 python3 tests/flow_trip_date.py $U $O/flow_trip_date"
echo "[dev] $(date -u +%H:%M) 全部跑完" >> $LOG
