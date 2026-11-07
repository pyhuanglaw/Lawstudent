#!/bin/bash
# 木曜日窗外（WINVIEW-AUDIT 木曜日，LAWWW2-B 11-07）：白天 14:00、晚上；clip 5.2：剪掉自己這棟三樓陽台的欄杆；鏡頭＝窗景卡中心後面 6.5 m（二樓眼睛高 4.6）
cd /home/user/Lawstudent || exit 1
OUTD=$1; G=assets/models/env/second_ai; K=docs/art-rebuild/second_ai/wip/komichi_nightview_1104
C="--eye 11.65,4.6,-9.25 --at 11.65,4.6,40 --lens 16.714 --shift-y 0.0607 --clip-start 5.2 --res 1600x743 --samples 64 --glb $G/wenzhou_street.glb,$G/wz_props.glb,$G/wz_jphouse.glb,$G/wz_park.glb --scooters $K/wz_scooters_wenzhou.json"
/opt/blenv/bin/python tools/blender/env_second/wz_window_view.py -- $C --hour 14 --out $OUTD/mok_day.png 2>&1 | grep -E "^OK|Error|rror" 
/opt/blenv/bin/python tools/blender/env_second/wz_window_view.py -- $C --night --lamp-k 4 --exposure -0.7 --pools $K/wz_lamp_pools.json --pool-w 220 --out $OUTD/mok_night.png 2>&1 | grep -E "^OK|Error|rror"
echo DONE
