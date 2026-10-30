#!/bin/bash
# BB-C 10-27：可以中途插隊的串接。用法：DYN=<資料夾> bash dyn_runner.sh [先等這個 PID 結束]
# 佇列 $DYN/q.txt 每行「<名稱> <shell 指令…>」（# 開頭＝註解）；每跑一項都重新讀，跑過的記在 q.txt.done；
# 佇列跑完就每 60 秒再看一次（可以再加）；碰到一行「STOP」就結束。輸出：$DYN/<名稱>.log；進度：$DYN/chain.log
D=${DYN:?設 DYN}; Q=$D/q.txt; LOG=$D/chain.log; touch "$Q.done"
[ -n "$1" ] && while kill -0 "$1" 2>/dev/null; do sleep 5; done
while true; do
  line=$(grep -v '^#' "$Q" | grep -v '^\s*$' | while read -r n rest; do grep -qx "$n" "$Q.done" || { echo "$n $rest"; break; }; done)
  if [ -z "$line" ]; then sleep 60; continue; fi
  read -r NAME CMD <<< "$line"
  [ "$NAME" = "STOP" ] && { echo "[dyn] $(date -u +%H:%M) STOP" >> "$LOG"; break; }
  echo "[dyn] $(date -u +%H:%M) 開始 $NAME" >> "$LOG"
  ( bash -c "$CMD" ) > "$D/$NAME.log" 2>&1; rc=$?
  echo "$NAME" >> "$Q.done"
  echo "[dyn] $(date -u +%H:%M) 結束 $NAME rc=$rc；$(grep -c '^FAIL\|FAIL(' "$D/$NAME.log") 行 FAIL；$(grep -E 'ALL PASS|FAILED' "$D/$NAME.log" | tail -1 | cut -c1-140)" >> "$LOG"
done
