# XS-NIGHT-1107 重拍新生南路四張夜景（LAWWW2-B 2026-11-07；BB-B 11-07「大口窗景晚上只看得到天空，看不到街」）。在 repo 根目錄跑：bash docs/art-rebuild/second_ai/wip/xs_night_1107/render_night.sh 輸出資料夾
# 場景資料沿用 XS-WINCARD-1105（xs_wincard_1105/ 的 slabs／trees／lamps／pools.json）；白天那四張不動。
# 和 1105 版的差別：--exposure −0.7 → 0；--moon 0.2（原本固定 0.04）；路燈：聚光圈 220 W → 450 W、半徑 ×1.8，燈頭再加一顆 900 W 點光源（--pool-point，照得到圍牆、樹冠）；燈頭倍率 4 → 8
D=docs/art-rebuild/second_ai/wip/xs_wincard_1105; OUT=${1:?輸出資料夾}; mkdir -p "$OUT"; G=assets/models/env/second_ai
C0="--res 2048x1024 --lens 18 --samples 48 --glb $G/xinsheng_street.glb --place $G/campus_moon.glb@159.4,0,-91.4,1.5708 --place $G/campus_gymext.glb@159.4,0,-91.4,1.5708 --slabs $D/slabs.json --trees $D/trees.json --lamps $D/lamps.json"
N="--night --lamp-k 8 --exposure 0 --moon 0.2 --pools $D/pools.json --pool-w 450 --pool-r 1.8 --pool-point 900"
shoot(){ n=$1; eye=$2; at=$3; clip=${4:-0.3}
  timeout 1800 /opt/blenv/bin/python tools/blender/env_second/wz_window_view.py -- --eye $eye --at $at --clip-start $clip $C0 --out "$OUT/${n}_night.png" $N 2>&1 | grep -E "^OK|Traceback" | sed "s/^/$n night: /"; }
shoot xs_dabu -16.27,1.6,-16.6 30,1.6,-16.6
shoot xs_haopai -16.27,1.6,-23.2 30,1.6,-23.2
shoot xs_dakou -16.2,1.6,40.4 30,1.6,40.4
shoot xs_dakou_2f -16.1,5.2,40.4 30,5.2,40.4 4.6
echo ALLDONE
