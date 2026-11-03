#!/bin/bash
cd /home/user/Lawstudent
until [ "$(pgrep -fc '^(nice -n 15 )?/opt/blenv/bin/python')" -eq 0 ]; do sleep 30; done
nice -n 15 /opt/blenv/bin/python tools/blender/env_second/bb_support/xinsheng_sports_interior.py -- --tmp /tmp/claude-0/-home-user-Lawstudent/d06332e2-ec70-5e42-a15c-5a4b27dbdb56/scratchpad/model/out_xs > /tmp/claude-0/-home-user-Lawstudent/d06332e2-ec70-5e42-a15c-5a4b27dbdb56/scratchpad/model/out_xs/build.log 2>&1
echo EXIT $? >> /tmp/claude-0/-home-user-Lawstudent/d06332e2-ec70-5e42-a15c-5a4b27dbdb56/scratchpad/model/out_xs/build.log
