#!/bin/bash
# 霖澤館 5F（linze_upper.py 的 linze_5f：北邊走廊、教授研究室的門、會議室 P3、西南角學姊的研究室 LAB、南牆一排窗）：光照烘焙（白天／晚上／全關）→ WebP
# （INTERIOR-AAA-REVIEW-1028 P1，LAWWW2-B 11-07；接在 3F、4F 後面，做法同 bake_linze_upper.sh）。repo 根目錄跑：
#   bash tools/blender/env_second/lightbake/bake_linze_5f.sh [取樣數，預設 512]
# 直接烘現在 assets 裡的 GLB（不重新產生）。遊戲：linze_upper3d.js 用 Z3.attachRoomGLB，GLB 有 extras.lightmap 就接；有 dark 那一張就接 roomDarkMap（z.lightsOff(k)）。
# 燈：tube_lights.py 從 GLB 讀：走廊、會議室、教授研究室的嵌燈 linze_5f_tubes 15 盞＋學姊研究室的 LAB_tubes 3 盞（x −5.7、z 1.6／3.7／5.6），每盞一個 30 W 面光源，在燈管下緣。
#   學姊桌上的檯燈（LAB_SIS_LAMP）不烘、不當光源：遊戲裡那裡有一盞即時的暖色點光（linze_upper3d.js 的 light5.sl：全開 0.6、只開檯燈 2.6）。
# 第三張「全關」（--dark）：研究室的燈有三種狀態（LZUP.labLights：'all' 全開／'sis' 只開學姊的檯燈／'off' 全關；劇情用）。
#   現在的遊戲在 'sis'／'off' 時把整層的環境光、天花板燈調暗（k5）——所以全關那一張也是整層的燈都關、只剩夜空（--darksky 0.045，和宿舍熄燈同一個值）。
#   遊戲端（patch）：apply5 在不是全開的時候叫 z.lightsOff(1)、全開 z.lightsOff(0)；roomDarkMap 照樣把燈管的自發光（材質名有 tube：GLOW_l118_tube，走廊和研究室共用）調暗；
#   檯燈的材質 GLOW_l118_warm 不在 tube|lamp_bulb 裡，'sis' 時照舊亮。
# 白天：天空＋太陽（方位 160°、仰角 35°：窗在 +z＝南），和 3F、4F 同一組；晚上：只有燈。外殼 S：只有南面開著（窗）。
# --nolm（照舊即時光）：燈管、檯燈、冰箱燈、螢幕（GLOW_）、頂點色的小東西、金屬件、鋼板、門的金屬件、印刷品（包括會議室門上的「口試中」牌 WALL_P3_EXAM_SIGN：
#   平常藏起來，用材質的 visible 開關，不能和牆共用光照貼圖的材質）、玻璃、東西兩面牆上的木條（slat：一千多個小島，3F、4F 也不烘）。
set -e
SAMPLES=${1:-512}
R=linze_5f
TMP=$(mktemp -d)
OUT=${OUTDIR:-assets/models/env/second_ai}   # 試烘可以改輸出位置（--url 照舊是遊戲的路徑）
LB=tools/blender/env_second/lightbake
cp assets/models/env/second_ai/$R.glb "$TMP/$R.glb"
LIGHTS=$(python3 $LB/tube_lights.py "$TMP/$R.glb" --mesh '(linze_5f_tubes|LAB_tubes)$' --w "${LW:-30}")
NOLM='tubes|fridgelight|GLOW|metal|props|steel|print|glass|slat|screens|^LAB_|EXAM_SIGN'
/opt/blenv/bin/python $LB/bake_room.py -- --in "$TMP/$R.glb" --out "$OUT/$R.glb" \
  --lm "$TMP/$R" --url assets/models/env/second_ai/${R}_lm --res 1024 --samples "$SAMPLES" --hide glass --nolm "$NOLM" \
  --sun 160,${SUNEL:-35},${SUNW:-2.0} --lights "$LIGHTS" --smooth 2 --shell S --dark --darksky "${DARKSKY:-0.045}"
python3 $LB/to_webp.py "$TMP/$R" "$OUT/${R}_lm" 90
if [ -z "$OUTDIR" ]; then cp "$TMP/$R.json" $LB/${R}_lm.json; else cp "$TMP/$R.json" "$OUT/${R}_lm.json"; fi   # 試烘（OUTDIR）不蓋 repo 裡的烘焙紀錄
rm -rf "${TMP:?}"
echo "done: $R"
