cd /home/user/Lawstudent; G=assets/models/env/second_ai; S=/tmp/claude-0/-home-user-Lawstudent/2ec5981f-0474-5329-8b76-bb65d93e5c0b/scratchpad
M="--place $G/gongguan_mrt_exit.glb@-36.6,0,11,1.5708"
C="--eye 10.5,1.4,26.07 --at 10.5,1.4,0 --res 1600x650 --lens 14.6 --shift-y 0.053 --clip-start 4.6 --samples 48 --glb $G/gongguan_shops.glb,$G/gongguan_far.glb --gg-street --place $G/campus_gate.glb@0,0,-46,0 $M --trees $S/trees/trees_gg.json --scooters $S/trees/scooters_gg.json --tree-min-w 0.8"
timeout 1800 /opt/blenv/bin/python tools/blender/env_second/wz_window_view.py -- $C --out $S/tb/afar_day.png --hour 14 2>&1 | grep -E "^OK|^trees|Error|Traceback"
echo DONE
