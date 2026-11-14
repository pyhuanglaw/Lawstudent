cd /home/user/Lawstudent; G=assets/models/env/second_ai; S=/tmp/claude-0/-home-user-Lawstudent/2ec5981f-0474-5329-8b76-bb65d93e5c0b/scratchpad
M="--place $G/gongguan_mrt_exit.glb@-36.6,0,11,1.5708"
shoot(){ name=$1; eye=$2; lens=$3; sh=$4; res=$5; clip=$6; at=${eye%%,*},1.4,0
  C="--eye $eye --at $at --res $res --lens $lens --shift-y $sh --clip-start $clip --samples 48 --glb $G/gongguan_shops.glb,$G/gongguan_far.glb --gg-street --place $G/campus_gate.glb@0,0,-46,0 $M --trees $S/trees/trees_gg.json --scooters $S/trees/scooters_gg.json --tree-min-w 0.8"
  [ "$7" = day ] && timeout 1800 /opt/blenv/bin/python tools/blender/env_second/wz_window_view.py -- $C --out $S/tb/${name}_day.png --hour 14 2>&1 | grep -E "^OK|Error|Traceback"
  [ "$7" = night ] && timeout 1800 /opt/blenv/bin/python tools/blender/env_second/wz_window_view.py -- $C --out $S/tb/${name}_night.png --night 2>&1 | grep -E "^OK|Error|Traceback"; }
shoot afar 10.5,1.4,26.07 14.6 0.053 1600x650 4.6 night
shoot daybreak 73.1,1.4,26.07 15.6 0.0567 1600x693 4.6 day
shoot daybreak 73.1,1.4,26.07 15.6 0.0567 1600x693 4.6 night
echo ALLDONE
