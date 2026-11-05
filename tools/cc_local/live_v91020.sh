#!/bin/bash
# CC-C：LIVE_V91020（BB-C 02:14）。雲端連不到 pyhuanglaw.github.io（proxy 403）＝在「線上那個 SHA」的本機複本跑 deploy_check、TAPPREF、p0（不是線上網址）；線上網址那一份排 PC 佇列。
# 用法：bash live_v91020.sh <main 的 SHA> <版本字樣>
SHA=$1; VER=$2; SP=/tmp/claude-0/-home-user/bf9567b3-8550-59a7-85d5-19c7b8aa16e5/scratchpad; CC=/home/user/pyhuanglaw/lawstudent/docs/story_planning/test_tools/cc; O=$SP/live_v91020; mkdir -p $O
cd /home/user/pyhuanglaw/lawstudent && git fetch -q origin main && echo "origin/main=$(git rev-parse origin/main) 要的=$SHA" > $O/main_sha.txt
git worktree add --detach $SP/wt_live $SHA >> $O/main_sha.txt 2>&1; (cd $SP/wt_live && setsid nohup python3 -m http.server 8823 --bind 127.0.0.1 > $SP/srv_8823.log 2>&1 &); sleep 2
U=http://127.0.0.1:8823/index.html
(cd $SP/wt_live && timeout 1800 python3 tests/deploy_check.py $U "$VER" > $O/deploy_check.log 2>&1); echo "deploy_check exit=$? $(tail -1 $O/deploy_check.log)" >> $O/summary.txt
(cd $SP && timeout 1800 env LW_TESTS=$SP/wt_live/tests SHA=$SHA python3 $CC/cc_tappref_zone_probe.py $U $O/tappref > $O/tappref.log 2>&1); echo "tappref exit=$? $(tail -1 $O/tappref.log)" >> $O/summary.txt
(cd $SP/wt_live && timeout 2400 python3 tests/p0_movement.py $U > $O/p0.log 2>&1); echo "p0 exit=$? $(tail -1 $O/p0.log)" >> $O/summary.txt
