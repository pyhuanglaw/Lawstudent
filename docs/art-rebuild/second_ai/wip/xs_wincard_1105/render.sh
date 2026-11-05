S=/tmp/claude-0/-home-user-Lawstudent/2ec5981f-0474-5329-8b76-bb65d93e5c0b/scratchpad
cd /home/user/Lawstudent || exit 1; G=assets/models/env/second_ai
C0="--res 2048x1024 --lens 18 --clip-start 0.3 --samples 48 --glb $G/xinsheng_street.glb --place $G/campus_moon.glb@159.4,0,-91.4,1.5708 --place $G/campus_gymext.glb@159.4,0,-91.4,1.5708 --slabs $S/xswin/slabs.json --trees $S/xswin/trees.json --lamps $S/xswin/lamps.json"
shoot(){ n=$1; eye=$2; at=$3
  timeout 1800 /opt/blenv/bin/python tools/blender/env_second/wz_window_view.py -- --eye $eye --at $at $C0 --out $S/xswin/${n}_day.png --hour 14 2>&1 | grep -E "^OK|Traceback" | sed "s/^/$n day: /"
  timeout 1800 /opt/blenv/bin/python tools/blender/env_second/wz_window_view.py -- --eye $eye --at $at $C0 --out $S/xswin/${n}_night.png --night --lamp-k 4 --exposure -0.7 --pools $S/xswin/pools.json --pool-w 220 2>&1 | grep -E "^OK|Traceback" | sed "s/^/$n night: /"; }
shoot xs_dabu -16.27,1.6,-16.6 30,1.6,-16.6
shoot xs_haopai -16.27,1.6,-23.2 30,1.6,-23.2
shoot xs_dakou -16.2,1.6,40.4 30,1.6,40.4
shoot xs_dakou_2f -16.1,5.2,40.4 30,5.2,40.4
shoot xs_dakou_w -22.7,1.6,46.7 -22.7,1.6,90
shoot xs_dakou_w2f -24.5,5.2,46.8 -24.5,5.2,90
echo ALLDONE
