#!/bin/bash
# 日和便利店（公館 G03）窗外重拍（WINVIEW-AUDIT-1105 日和便利店，LAWWW2 帳號 A 11-10）：視差窗格式（2:1、水平 90°＝焦距 18、鏡頭在視差窗正中間、不鏡像；同 winview_audit_1105 第四包的慢輪）
#   視差窗（遊戲 cvs 區域、正式模型 cvs_interior_v2 載入後）：店內 (−1.18, 1.4, 6.1)、朝外 +z；玻璃在店內 z 5.44 → 視差窗在玻璃外 0.66 m。
#   換成公館座標：x＝店中心 −28.8 − 店內 x＝−27.62；z＝店面玻璃 22.07 − 0.66＝21.41；朝北（−z）。
#   用法（repo 根目錄）：bash docs/art-rebuild/second_ai/wip/winview_cvs_1110/render.sh <輸出資料夾> [取樣，預設 96]
cd "$(git rev-parse --show-toplevel)" || exit 1
OUTD=$1; S=${2:-96}; G=assets/models/env/second_ai; SCN=tools/blender/env_second/gg_scene
C=(--eye -27.62,1.4,21.41 --at -27.62,1.4,0 --lens 18 --res 1024x512 --samples $S --clip-start 0.1 --glb $G/gongguan_shops.glb,$G/gongguan_far.glb --gg-street
   --place "$G/campus_gate.glb@0,0,-46,0" --place "$G/gongguan_mrt_exit.glb@-36.6,0,11,1.5708"
   --scooters $SCN/gg_scooters.json --trees $SCN/gg_trees.json --lamps $SCN/gg_lamps.json)
/opt/blenv/bin/python tools/blender/env_second/wz_window_view.py -- "${C[@]}" --hour 14 --out $OUTD/cvs_day.png 2>&1 | grep -E "^OK|Error|rror"
/opt/blenv/bin/python tools/blender/env_second/wz_window_view.py -- "${C[@]}" --night --pools $SCN/gg_pools.json --pool-near 18 --out $OUTD/cvs_night.png 2>&1 | grep -E "^OK|Error|rror"
echo DONE
