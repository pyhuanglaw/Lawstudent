#!/usr/bin/env bash
# 換執行器（舊的 25229 在 12:16 到期）：舊的跑完目前這一項，看到佇列空＋STOP 就結束；這裡等它結束，再把佇列接回來、開新的執行器
Q=/tmp/claude-0/-home-user-Lawstudent/a98cd672-cd93-5881-9adc-d5e86cb59d66/scratchpad/q; OLD=25229
while kill -0 $OLD 2>/dev/null; do sleep 5; done
rm -f $Q/STOP; [ -f $Q/queue.hold ] && mv $Q/queue.hold $Q/queue.txt
echo "runner handover $(date -u +%T)：舊執行器結束、佇列接回（$(wc -l < $Q/queue.txt) 項）" >> $Q/Q.txt
exec bash /tmp/claude-0/-home-user-Lawstudent/a98cd672-cd93-5881-9adc-d5e86cb59d66/scratchpad/run_q.sh
