#!/bin/bash
# AA_399 那一批走得進去的房間（rooms_glb3d.js：共同 3F、霖澤辦公室、博雅 203、宿舍洗衣間、總圖視聽室）：光照烘焙（白天／晚上）→ WebP
# （INTERIOR-AAA-REVIEW-1028 P1，LAWWW2-B 11-07）。repo 根目錄跑：
#   bash tools/blender/env_second/lightbake/bake_rooms_ab3.sh [取樣數，預設 512] [房間，預設下面五間]
# 烘 INDIR（預設 assets）裡的 GLB（不重新產生）；已經烘過的會停下來。遊戲：rooms_glb3d.js 用 Z3.attachRoomGLB，GLB 有 extras.lightmap 就接（不用改程式）。
# 燈：tube_lights.py 從每間 GLB 的燈管網格（<房間>_tubes）讀出每一盞的位置、大小、下緣高度，每盞一個 30 W 面光源——和看得到的燈管一定對得上。
#   博雅 203 的檯燈（_lamps）、螢幕（_screens）、洗衣機的面板（_display）不當光源、也不烘。
# 白天：天空＋太陽（方位 160°、仰角 35°：窗在 +z），和 202、研討室同一組；晚上：只有燈。外殼只開南面（窗）；視聽室沒有窗，五面都包（白天和晚上一樣）。
# --nolm（照舊即時光）：燈管、發光的東西、頂點色的小東西（props）、金屬件（metal）、玻璃、辦公室的信件格（pigeonvc：幾百個小格子）。
#   它們照樣擋光：地板上桌椅的接觸陰影照樣烘進去。地板、天花板、牆、腰牆、收邊條、窗框、桌子（woodparts）、櫃子照樣烘。
set -e
SAMPLES=${1:-512}
ROOMS=${2:-"gongtong_3f linze_office boya_203 dorm_laundry library_media"}
TMP=$(mktemp -d)
OUT=${OUTDIR:-assets/models/env/second_ai}   # 試烘可以改輸出位置（--url 照舊是遊戲的路徑）
W=${LW:-30}
NOLM='tubes|GLOW|screens|lamps|display|props|metal|glass|pigeonvc'
for R in $ROOMS; do
  # 輸入：INDIR（環境變數；例：重新匯出的白模放在別的資料夾）裡的 <房間>.glb，沒給就用 assets 裡的。已經烘過的（場景有 extras.lightmap）不能再烘：第二套 UV 會疊兩次（11-08 LAWWW2-B）
  IN=${INDIR:-assets/models/env/second_ai}/$R.glb
  if python3 -c "import json,struct,sys; b=open(sys.argv[1],'rb').read(); J=json.loads(b[20:20+struct.unpack('<I',b[12:16])[0]]); sys.exit(0 if any('lightmap' in (s.get('extras') or {}) for s in J.get('scenes',[])) else 1)" "$IN"; then
    echo "$IN 已經烘過（有 extras.lightmap）：先用房間的腳本重新匯出白模，INDIR=<那個資料夾>"; rm -rf "${TMP:?}"; exit 1; fi
  cp "$IN" "$TMP/$R.glb"
  LIGHTS=$(python3 tools/blender/env_second/lightbake/tube_lights.py "$TMP/$R.glb" --w "$W")
  if [ $R = library_media ]; then SHELL_OPEN=X; else SHELL_OPEN=S; fi   # X＝沒有這一面：五面都包
  /opt/blenv/bin/python tools/blender/env_second/lightbake/bake_room.py -- --in "$TMP/$R.glb" --out "$OUT/$R.glb" \
    --lm "$TMP/$R" --url assets/models/env/second_ai/${R}_lm --res 1024 --samples "$SAMPLES" --hide glass --nolm "$NOLM" \
    --sun 160,${SUNEL:-35},${SUNW:-2.0} --lights "$LIGHTS" --smooth 2 --shell $SHELL_OPEN
  python3 tools/blender/env_second/lightbake/to_webp.py "$TMP/$R" "$OUT/${R}_lm" 90
  cp "$TMP/$R.json" tools/blender/env_second/lightbake/${R}_lm.json
done
rm -rf "${TMP:?}"
echo "done: $ROOMS"
