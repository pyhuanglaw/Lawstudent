#!/bin/bash
# XS-WINCARD 第二批（山嵐一二樓、新生運動廣場一二樓、南洋大廳；LAWWW2 帳號 A 11-10；BB 11-10 10:52「山嵐、南洋、同弦沒有窗景卡」）。
# 做法、場景資料照第一批（docs/art-rebuild/second_ai/wip/xs_wincard_1105/render.sh）：視差窗格式 2:1、水平 90°（焦距 18）、鏡頭在視差窗正中間、不鏡像。
# 換算：街 x＝立面 −16.5＋（店內 z − d/2），街 z＝店的中心 − 店內 x；二樓 clip 4.6（剪掉新生南路外觀蓋在騎樓上面的自己這一棟）。
# 用法（repo 根目錄）：bash docs/art-rebuild/second_ai/wip/xs_wincard2_1110/render.sh 輸出資料夾
D=docs/art-rebuild/second_ai/wip/xs_wincard_1105; OUT=${1:?輸出資料夾}; mkdir -p "$OUT"; G=assets/models/env/second_ai
C0="--res 2048x1024 --lens 18 --samples 48 --glb $G/xinsheng_street.glb --place $G/campus_moon.glb@159.4,0,-91.4,1.5708 --place $G/campus_gymext.glb@159.4,0,-91.4,1.5708 --slabs $D/slabs.json --trees $D/trees.json --lamps $D/lamps.json"
shoot(){ n=$1; eye=$2; at=$3; clip=${4:-0.3}
  timeout 1800 /opt/blenv/bin/python tools/blender/env_second/wz_window_view.py -- --eye $eye --at $at --clip-start $clip $C0 --out "$OUT/${n}_day.png" --hour 14 2>&1 | grep -E "^OK|Traceback|Error" | sed "s/^/$n day: /"
  timeout 1800 /opt/blenv/bin/python tools/blender/env_second/wz_window_view.py -- --eye $eye --at $at --clip-start $clip $C0 --out "$OUT/${n}_night.png" --night --lamp-k 4 --exposure -0.7 --pools $D/pools.json --pool-w 220 2>&1 | grep -E "^OK|Traceback|Error" | sed "s/^/$n night: /"; }
shoot xs_shanlan    -16.14,1.6,10.2   30,1.6,10.2           # 山嵐一樓：視差窗 店內 (0, 1.6, 9.36)；店 z 3.2～17.2、d 18
shoot xs_shanlan_2f -16.14,5.8,10.2   30,5.8,10.2   4.6     # 山嵐二樓（樓板 4.2）：視差窗 店內 (0, 5.8, 9.36)
shoot xs_xsports    -16.27,1.6,-33    30,1.6,-33            # 新生運動廣場一樓：視差窗 店內 (0, 1.6, 8.23)；店 z −40～−26、d 16
shoot xs_xsports_2f -16.27,5.35,-33   30,5.35,-33   4.6     # 二樓（樓板 3.75）：視差窗 店內 (0, 5.35, 8.23)
shoot xs_nanyang    -16.2,1.6,25.3    30,1.6,25.3           # 南洋大廳：視差窗 店內 (0, 1.6, 7.3)；店 z 17.8～32.8、d 14
echo ALLDONE
