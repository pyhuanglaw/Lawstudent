#!/bin/bash
# 萬才館研討室 A、B（wancai_seminar.py／wancai_semb.py 的 wancai_sema、wancai_semb）：光照烘焙（白天／晚上）→ WebP（INTERIOR-AAA-REVIEW-1028 P1，LAWWW2-B 11-07）。
# repo 根目錄跑：bash tools/blender/env_second/lightbake/bake_wancai_sem.sh [取樣數，預設 512] [房間，預設「wancai_sema wancai_semb」]
# 直接烘現在 assets 裡的 GLB（不重新產生）。遊戲：rooms_glb3d.js 用 Z3.attachRoomGLB，GLB 有 extras.lightmap 就接。
# 燈：天花板的日光燈（燈管 1.16×0.56，下緣 3.174 m），每盞一個 30 W 面光源放在燈管下緣（--lights 的格子是「每格中心一盞」）：
#   A：x −2.8、0、2.8 × z −1.7、1.7（wancai_seminar.py 第 253 行）；B：x −1.9、1.9 × z −1.5、1.4（wancai_semb.py 第 318 行）。
# 白天：天空＋太陽（方位 160°、仰角 35°：窗在 +z），和 202、多功能教室同一組；晚上：只有燈。外殼只開南面（窗），門是關著的。
# --nolm（照舊即時光）：燈管、冰箱燈、頂點色的小東西（props：椅子、桌上的東西）、金屬件、書櫃裡一本一本的書（books：幾千個小島）。
#   它們照樣擋光：地板上桌椅的接觸陰影照樣烘進去。地板、牆、天花板、腰牆、收邊條、窗框、書櫃、會議桌照樣烘。
# B 有兩套家具（SET_CONSULT 平常的初談隔間、SET_INTERVIEW 2028-10-26 推甄面試），光照貼圖是整間一張：
#   兩套家具本身都不烘（--nolm consult|interview）；平常那一張烘的時候面試的家具藏起來（--hide），面試那一張反過來。
#   兩次烘的網格一樣（兩套家具都不烘），所以第二套 UV 一樣；lm_sets.py 先比對兩個 GLB 的第二套 UV，一樣才把面試那一張寫進
#   extras.lightmap.sets.interview。遊戲端：rooms_glb3d.js 照當天的那一套換貼圖（docs/art-rebuild/second_ai/wip/wancai_sem_lm_1107/ 的 patch）。
set -e
SAMPLES=${1:-512}
ROOMS=${2:-"wancai_sema wancai_semb"}
TMP=$(mktemp -d)
OUT=${OUTDIR:-assets/models/env/second_ai}   # 試烘可以改輸出位置（--url 照舊是遊戲的路徑）
W=${LW:-30}
NOLM='tubes|glowpanel|GLOW|props|metal|books|consult|interview'
bake(){   # bake <房間> <輸入> <輸出 GLB> <貼圖前綴（暫存）> <遊戲路徑前綴> <--hide>
  /opt/blenv/bin/python tools/blender/env_second/lightbake/bake_room.py -- --in "$2" --out "$3" \
    --lm "$4" --url "$5" --res 1024 --samples "$SAMPLES" --hide "$6" --nolm "$NOLM" \
    --sun 160,${SUNEL:-35},${SUNW:-2.0} --lights "$LIGHTS" --smooth 2 --shell S
}
for R in $ROOMS; do
  cp assets/models/env/second_ai/$R.glb "$TMP/$R.glb"
  if [ $R = wancai_sema ]; then LIGHTS="-4.2,4.2,-3.4,3.4,3.17,3,2,$W,1.16,0.56"; else LIGHTS="-3.8,3.8,-2.95,2.85,3.17,2,2,$W,1.16,0.56"; fi
  if [ $R = wancai_semb ]; then
    bake $R "$TMP/$R.glb" "$TMP/${R}_a.glb" "$TMP/$R" "assets/models/env/second_ai/${R}_lm" 'glass|interview'
    bake $R "$TMP/$R.glb" "$TMP/${R}_b.glb" "$TMP/${R}_iv" "assets/models/env/second_ai/${R}_iv_lm" 'glass|consult'
    python3 tools/blender/env_second/lightbake/lm_sets.py "$TMP/${R}_a.glb" "$TMP/${R}_b.glb" interview "$OUT/$R.glb"
    python3 tools/blender/env_second/lightbake/to_webp.py "$TMP/${R}_iv" "$OUT/${R}_iv_lm" 90
    cp "$TMP/${R}_iv.json" tools/blender/env_second/lightbake/${R}_iv_lm.json
  else
    bake $R "$TMP/$R.glb" "$OUT/$R.glb" "$TMP/$R" "assets/models/env/second_ai/${R}_lm" 'glass'
  fi
  python3 tools/blender/env_second/lightbake/to_webp.py "$TMP/$R" "$OUT/${R}_lm" 90
  cp "$TMP/$R.json" tools/blender/env_second/lightbake/${R}_lm.json
done
rm -rf "${TMP:?}"
echo "done: $ROOMS"
