cd $S/stk || exit 1; G=assets/models/env/second_ai
C="--eye 0.0875,1.7,21.39 --at 0.0875,1.7,0 --res 2048x1024 --lens 18 --shift-y 0 --clip-start 0.3 --samples 48 --glb $G/gongguan_shops.glb,$G/gongguan_far.glb --gg-street --place $G/campus_gate.glb@0,0,-46,0 --place $G/gongguan_mrt_exit.glb@-36.6,0,11,1.5708 --trees $S/trees/trees_gg.json --scooters $S/trees/scooters_gg.json"
timeout 2400 /opt/blenv/bin/python tools/blender/env_second/wz_window_view.py -- $C --out $S/ggv2/bikeshop_day.png --hour 14 2>&1 | grep -E "^OK|^trees|Error|Traceback" | sed "s/^/bike day: /"
timeout 2400 /opt/blenv/bin/python tools/blender/env_second/wz_window_view.py -- $C --out $S/ggv2/bikeshop_night.png --night 2>&1 | grep -E "^OK|^trees|Error|Traceback" | sed "s/^/bike night: /"
echo ALLDONE
