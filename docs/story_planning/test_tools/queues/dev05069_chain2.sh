#!/bin/bash
# BB-C 10-27 23:2x：chain_dev 跑完以後——5q stuck_harden（開發分支 05069d928＝lwdev3:8840；修正前 7f7fd7964＝lwpre:8841）→ R44 學姊第十二批 → R43 畢業以後
SP=/tmp/claude-0/-home-user-Lawstudent/4f52e6f0-1e48-5c03-872f-171d129a03fd/scratchpad; TT=/home/user/Lawstudent/docs/story_planning/test_tools; O=$SP/bbtest/dev05; LOG=$O/chain.log
while kill -0 10158 2>/dev/null; do sleep 10; done
r(){ local tag=$1; shift; echo "[dev] $(date -u +%H:%M) 開始 $tag" >> $LOG; ( cd $SP && "$@" ) > $O/$tag.log 2>&1; local rc=$?; echo "[dev] $(date -u +%H:%M) 結束 $tag rc=$rc；$(grep -c '^FAIL ' $O/$tag.log) 行 FAIL；$(grep -E 'ALL PASS|FAILED' $O/$tag.log | tail -1 | cut -c1-140)" >> $LOG; }
for m in aunt carrel; do for ov in inject force; do
  r sh_${m}_${ov}     env LW_TESTS=$SP/lwdev3/tests MODE=$m OVERLAP=$ov timeout 1200 python3 $TT/stuck_harden_probe.py "http://127.0.0.1:8840/index.html?lowres" $O/sh_${m}_${ov}
  r pre_sh_${m}_${ov} env LW_TESTS=$SP/lwpre/tests MODE=$m OVERLAP=$ov timeout 1200 python3 $TT/stuck_harden_probe.py "http://127.0.0.1:8841/index.html?lowres" $O/pre_sh_${m}_${ov}
done; done
r sh_reload env LW_TESTS=$SP/lwdev3/tests MODE=reload timeout 1200 python3 $TT/stuck_harden_probe.py "http://127.0.0.1:8840/index.html?lowres" $O/sh_reload
echo "[dev] $(date -u +%H:%M) 開始 R44 佇列（bb_runner r44）" >> $LOG
BB_OUT=$O/r44 bash $TT/bb_runner.sh $O/r44/q.txt $SP/lwdev3 8840 r44 >> $O/r44/runner.log 2>&1
echo "[dev] $(date -u +%H:%M) 開始 R43 佇列（bb_runner r43）" >> $LOG
BB_OUT=$O/r43 bash $TT/bb_runner.sh $O/r43/q.txt $SP/lwdev3 8840 r43 >> $O/r43/runner.log 2>&1
echo "[dev] $(date -u +%H:%M) 第二段全部跑完" >> $LOG
