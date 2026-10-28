#!/bin/bash
# 霖澤館 202、萬才館多功能教室：在現有的正式模型（flat_classroom.py 產生的 GLB）上加光照貼圖（INTERIOR-AAA-REVIEW-1028，LAWWW2-C 2026-10-28）。repo 根目錄跑：
#   bash tools/blender/env_second/lightbake/bake_flat_rooms.sh [取樣數，預設 512]
# 先照舊用 flat_classroom.py 產生沒有光照貼圖的 GLB（會蓋掉 assets 裡的），再烘焙。每間 CPU 約 6 分鐘。
# 燈：202 v2（10-28）是 0.6 m 輕鋼架天花板的 T5 格柵燈具（1.2×0.6，x −5.2～4.4 每 2.4 m 五盞、z ±2.7；面光源 1.14×0.54 放在格柵下緣）；
#     多功能教室是兩排雙管日光燈（x −4.2～4.2 四組、z ±2.55）。每盞放一個 30 W 面光源；燈管、發光面不烘（--nolm）。
# 白天：天空＋太陽（方位 160°、仰角 35°：窗在 +z 那一面）；晚上：只有燈。
set -e
SAMPLES=${1:-512}
TMP=$(mktemp -d)
/opt/blenv/bin/python tools/blender/env_second/flat_classroom.py -- --room all
for R in linze_202 wancai_multi; do
  cp assets/models/env/second_ai/$R.glb "$TMP/$R.glb"
  if [ $R = linze_202 ]; then LIGHTS=-6.4,5.6,-5.4,5.4,3.345,5,2,30,1.14,0.54; NOLM='tubes|glow|screens|light'; else LIGHTS=-5.6,5.6,-5.1,5.1,3.30,4,2,30,1.2,0.5; NOLM='tubes|glow|screens'; fi
  /opt/blenv/bin/python tools/blender/env_second/lightbake/bake_room.py -- --in "$TMP/$R.glb" --out assets/models/env/second_ai/$R.glb \
    --lm "$TMP/$R" --url assets/models/env/second_ai/${R}_lm --res 1024 --samples "$SAMPLES" --hide glass --nolm "$NOLM" \
    --sun 160,35,2.0 --lights $LIGHTS --smooth 2
  python3 tools/blender/env_second/lightbake/to_webp.py "$TMP/$R" assets/models/env/second_ai/${R}_lm 90
  cp "$TMP/$R.json" tools/blender/env_second/lightbake/${R}_lm.json
done
rm -rf "$TMP"
