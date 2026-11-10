#!/bin/bash
# 霖澤館 3F、4F（linze_upper.py 的 linze_3f／linze_4f；北邊走廊＋教室的門、南邊討論區、南牆一排窗）：光照烘焙（白天／晚上）→ WebP（INTERIOR-AAA-REVIEW-1028 P1，LAWWW2-B 11-07）。
# repo 根目錄跑：bash tools/blender/env_second/lightbake/bake_linze_upper.sh [取樣數，預設 384] [樓層，預設「linze_3f linze_4f」]
# 直接烘現在 assets 裡的 GLB（不重新產生：linze_upper.py 之後改過，重產會和交出去的不一樣）。遊戲端不用改程式：linze_upper3d.js 用 Z3.attachRoomGLB，GLB 有 extras.lightmap 就接。
# 燈：天花板嵌的日光燈（linze_upper.py 第 236 行：x −6、−3、0、3、6 × z −5.2、0.4、3.6，燈管 1.16×0.56 在 3.374 m），每盞一個 30 W 面光源，放在燈管下緣。
# 白天：天空＋太陽（方位 160°、仰角 35°：窗在 +z＝南）；晚上：只有燈。外殼 S：只有南面開著（窗），其他三面是黑的厚板（教室的門、樓梯間都是關著的）。
# --nolm：燈管、冰箱燈（GLOW_）、頂點色的小東西（props：販賣機、微波爐、飲水機、回收桶…）、金屬件、鋼板、印刷品——幾千個小零件分不到像素，照舊即時光；
#   東西兩面牆上的木條（WALL_E／W_slat，一千多個小島）也不烘：試烘時把貼圖擠掉一大塊。地板、天花板、牆、花崗石腰牆、長桌長椅照樣烘。
set -e
SAMPLES=${1:-384}
ROOMS=${2:-"linze_3f linze_4f"}
TMP=$(mktemp -d)
OUT=${OUTDIR:-assets/models/env/second_ai}   # 試烘可以改輸出位置（--url 照舊是遊戲的路徑）
W=${LW:-30}
LIGHTS=""
for z in -5.2 0.4 3.6; do LIGHTS="$LIGHTS;$(python3 -c "print(f'-7.5,7.5,{$z-0.01:.2f},{$z+0.01:.2f},3.37,5,1,$W,1.16,0.56')")"; done
LIGHTS=${LIGHTS#;}
NOLM='tubes|fridgelight|GLOW|metal|props|steel|print|glass|slat'
for R in $ROOMS; do
  cp assets/models/env/second_ai/$R.glb "$TMP/$R.glb"
  /opt/blenv/bin/python tools/blender/env_second/lightbake/bake_room.py -- --in "$TMP/$R.glb" --out "$OUT/$R.glb" \
    --lm "$TMP/$R" --url assets/models/env/second_ai/${R}_lm --res 1024 --samples "$SAMPLES" --hide glass --nolm "$NOLM" \
    --sun 160,${SUNEL:-35},${SUNW:-2.0} --lights "$LIGHTS" --smooth 2 --shell S
  python3 tools/blender/env_second/lightbake/to_webp.py "$TMP/$R" "$OUT/${R}_lm" 90
  cp "$TMP/$R.json" tools/blender/env_second/lightbake/${R}_lm.json
done
rm -rf "${TMP:?}"
echo "done: $ROOMS"
