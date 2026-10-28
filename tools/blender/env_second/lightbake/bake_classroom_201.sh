#!/bin/bash
# 霖澤館 201 階梯教室 v2：建模 → 光照烘焙（白天／晚上）→ WebP（INTERIOR-AAA-REVIEW-1028，LAWWW2-C 2026-10-28）。在 repo 根目錄跑：
#   bash tools/blender/env_second/lightbake/bake_classroom_201.sh [取樣數，預設 512]
# CPU 烘焙約 8 分鐘（1024 光照貼圖、512 取樣；雲端沙盒 4 核）。輸出：assets/models/env/classroom_201.glb、classroom_201_lm_day.webp、classroom_201_lm_night.webp。
# 燈：天花板 24 盞 T5 格柵燈具（4×6，1.2×0.6，對齊 0.6 m 的天花板格子；classroom_201.py 的 LX、LZ）的位置放面光源（每盞 30 W），發光面本身不烘（--nolm ceil_light）；
# 白天：天空＋太陽（方位 250°、仰角 35°，西牆的窗）；晚上：只有燈＋一點夜空。玻璃烘焙時當作不存在（--hide glass）。
set -e
SAMPLES=${1:-512}
TMP=$(mktemp -d)
/opt/blenv/bin/python tools/blender/classroom_201.py -- --out "$TMP/classroom_201_plain.glb"
/opt/blenv/bin/python tools/blender/env_second/lightbake/bake_room.py -- --in "$TMP/classroom_201_plain.glb" --out assets/models/env/classroom_201.glb \
  --lm "$TMP/c201" --url assets/models/env/classroom_201_lm --res 1024 --samples "$SAMPLES" --emit cls_light=2 --hide glass --nolm ceil_light \
  --sun 250,35,2.0 --lights -7.2,7.2,-9,9,5.555,4,6,30,1.14,0.54 --smooth 2
python3 tools/blender/env_second/lightbake/to_webp.py "$TMP/c201" assets/models/env/classroom_201_lm 90
cp "$TMP/c201.json" tools/blender/env_second/lightbake/classroom_201_lm.json
rm -rf "$TMP"
echo "done: assets/models/env/classroom_201.glb + classroom_201_lm_day/night.webp"
