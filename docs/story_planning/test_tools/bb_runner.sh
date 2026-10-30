#!/bin/bash
# 換班後重建：BB_OUT=<輸出資料夾> nohup bash bb_runner.sh queues/<佇列>.txt <工作樹> <port> <標籤> &（存檔放 $BB_OUT/user_day9.json，不提交）
# 用法：runner.sh <佇列檔> <工作樹> <port> <標籤>
# 佇列每行：<名稱> <腳本> <SCEN 或 ->；跑過的記在 <佇列檔>.done
Q=$1; LW=$2; PORT=$3; TAG=$4
T=/home/user/Lawstudent/docs/story_planning/test_tools
B=${BB_OUT:?設 BB_OUT＝輸出資料夾（放 user_day9.json 存檔）}
SHA=$(git -C "$LW" rev-parse --short=8 HEAD)
touch "$Q.done"
while true; do
  line=$(grep -v '^#' "$Q" | grep -v '^\s*$' | while read -r n s c; do grep -qx "$n" "$Q.done" || { echo "$n $s $c"; break; }; done)
  [ -z "$line" ] && { echo "[$TAG] $(date -u +%H:%M) 佇列跑完"; break; }
  read -r NAME SCRIPT SCEN <<< "$line"
  echo "[$TAG] $(date -u +%H:%M) 開始 $NAME（$SCRIPT SCEN=$SCEN，$SHA）"
  mkdir -p "$B/$NAME"
  if [ "$SCEN" = "-" ]; then unset SCEN_ENV; else SCEN_ENV="$SCEN"; fi
  ( cd /tmp && env LW_TESTS="$LW/tests" SHA="$SHA" ${SCEN_ENV:+SCEN="$SCEN_ENV"} timeout 14400 python3 "$T/$SCRIPT" "http://127.0.0.1:$PORT/index.html?turbo" "$B/$NAME" "$B/user_day9.json" > "$B/$NAME.log" 2>&1 )
  rc=$?
  echo "$NAME" >> "$Q.done"
  echo "[$TAG] $(date -u +%H:%M) 結束 $NAME rc=$rc；$(grep -c 'FAIL' "$B/$NAME.log") 行 FAIL、$(grep -c 'PASS' "$B/$NAME.log") 行 PASS"
done
