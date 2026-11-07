R=$(cd "$(dirname "$0")/../../../../../.." && pwd); A=$R/docs/art-rebuild/second_ai/wip/xs_farview_1107/preview; O=${OUT:-$PWD}; G=$R/assets/models/env/second_ai
C0="--res 1024x512 --lens 18 --samples 24 --hour 14 --glb $G/xinsheng_street.glb --place $G/xinsheng_far.glb@0,0,0,0 --place $G/campus_moon.glb@159.4,0,-91.4,1.5708 --place $G/campus_gymext.glb@159.4,0,-91.4,1.5708 --slabs $A/slabs.json --trees $A/trees.json --lamps $A/lamps.json"
t(){ name=$1; eye=$2; at=$3; timeout 1500 /opt/blenv/bin/python $R/tools/blender/env_second/wz_window_view.py -- --eye $eye --at $at $C0 --out $O/$name.png 2>&1 | grep -E "^OK|Traceback|Error" | sed "s/^/$name: /"; }
t north 13,1.6,8 2,4,-60
t south 13,1.6,12 2,4,80
t north_far 0.5,1.6,-40 0,5,-120
t west_up 15,1.7,-20 -30,10,-45
echo ALLDONE
