#!/bin/bash
# 同弦樂器二樓臨街窗的窗景（XS-TONGXIAN-VIEW-1110；BB 11-10 X254 GAME_BUG P2：21:00 窗外和白天一模一樣——CC 的室內模型 tongxian.glb 裡窗外是一塊固定的白天街景板）。
# 做法、場景資料照 XS-WINCARD 第一、二批（docs/art-rebuild/second_ai/wip/xs_wincard_1105/、xs_wincard2_1110/）：視差窗格式 2:1、水平 90°（焦距 18）、鏡頭在視差窗正中間、不鏡像。
# 同弦的換算（店的後牆 z −5.2＝臨街的二樓立面 x −13.0（facade.upper）；店內 z −1.7 正好在一樓店面玻璃 x −16.5 的正上方：tongxian_layout.js 的樓梯說明）：
#   街 x＝−18.2 − 店內 z，街 z＝店的中心 −9.2 ＋ 店內 x（wz_street.py：西側的樓本地 +x＝北；外觀二樓窗本地 x 0.4～3.0＝店內 x −3.0～−0.4），街 y＝4.2（二樓樓板）＋店內 y。
#   視差窗 店內 (−1.7, 1.7, −5.37)（窗 x −3.0～−0.4、窗台 0.87、窗頂 2.53；後牆 0.12 厚，牆外 5 cm）→ 街 (−12.83, 5.9, −10.9)
# 用法（repo 根目錄）：bash docs/art-rebuild/second_ai/wip/xs_tongxian_view_1110/render.sh 輸出資料夾
D=docs/art-rebuild/second_ai/wip/xs_wincard_1105; OUT=${1:?輸出資料夾}; mkdir -p "$OUT"; G=assets/models/env/second_ai
C0="--res 2048x1024 --lens 18 --samples 48 --glb $G/xinsheng_street.glb --place $G/campus_moon.glb@159.4,0,-91.4,1.5708 --place $G/campus_gymext.glb@159.4,0,-91.4,1.5708 --slabs $D/slabs.json --trees $D/trees.json --lamps $D/lamps.json"
shoot(){ n=$1; eye=$2; at=$3; clip=${4:-0.3}
  timeout 1800 /opt/blenv/bin/python tools/blender/env_second/wz_window_view.py -- --eye $eye --at $at --clip-start $clip $C0 --out "$OUT/${n}_day.png" --hour 14 2>&1 | grep -E "^OK|Traceback|Error" | sed "s/^/$n day: /"
  timeout 1800 /opt/blenv/bin/python tools/blender/env_second/wz_window_view.py -- --eye $eye --at $at --clip-start $clip $C0 --out "$OUT/${n}_night.png" --night --lamp-k 4 --exposure -0.7 --pools $D/pools.json --pool-w 220 2>&1 | grep -E "^OK|Traceback|Error" | sed "s/^/$n night: /"; }
shoot xs_tongxian  -12.83,5.9,-10.9   30,5.9,-10.9
echo ALLDONE
