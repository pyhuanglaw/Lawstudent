cd /tmp/claude-0/-home-user-Lawstudent/2ec5981f-0474-5329-8b76-bb65d93e5c0b/scratchpad/stk || exit 1; G=assets/models/env/second_ai
M="--place $G/gongguan_mrt_exit.glb@-36.6,0,11,1.5708"
shoot(){ name=$1; eye=$2; lens=$3; sh=$4; res=$5; clip=$6; at=${7:-${eye%%,*},1.4,0}
  C="--eye $eye --at $at --res $res --lens $lens --shift-y $sh --clip-start $clip --samples 48 --glb $G/gongguan_shops.glb,$G/gongguan_far.glb --gg-street --place $G/campus_gate.glb@0,0,-46,0 $M --trees /tmp/claude-0/-home-user-Lawstudent/2ec5981f-0474-5329-8b76-bb65d93e5c0b/scratchpad/trees/trees_gg.json --scooters /tmp/claude-0/-home-user-Lawstudent/2ec5981f-0474-5329-8b76-bb65d93e5c0b/scratchpad/trees/scooters_gg.json"
  timeout 2400 /opt/blenv/bin/python tools/blender/env_second/wz_window_view.py -- $C --out /tmp/claude-0/-home-user-Lawstudent/2ec5981f-0474-5329-8b76-bb65d93e5c0b/scratchpad/ggv3/${name}_day.png --hour 14 2>&1 | grep -E "^OK|Error|Traceback" | sed "s/^/$name day: /"
  timeout 2400 /opt/blenv/bin/python tools/blender/env_second/wz_window_view.py -- $C --out /tmp/claude-0/-home-user-Lawstudent/2ec5981f-0474-5329-8b76-bb65d93e5c0b/scratchpad/ggv3/${name}_night.png --night 2>&1 | grep -E "^OK|Error|Traceback" | sed "s/^/$name night: /"; }
shoot daybreak 73.1,1.4,26.07 15.6 0.0567 1600x693 4.6
shoot afar 10.5,1.4,26.07 14.6 0.053 1600x650 4.6
shoot aoki -52.2,1.4,25.57 12.706 0.05 1600x612 4.1
shoot yejian -41.0,1.4,27.07 19.286 0.0607 1600x743 5.6
shoot bikeshop 0.0875,1.7,21.39 18 0 2048x1024 0.3 0.0875,1.7,0
echo ALLDONE
