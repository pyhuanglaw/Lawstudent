#!/bin/bash
# 2:30 AM 室內（AA 的 aa_support/cafe230.glb，企劃線 30c2d5998＝v1f（v1e 幾何＋窗景卡；之前烘過 b140750c2＝v1d）；WZ-FIVE-1104；LAWWW2 11-04）：光照烘焙（白天／晚上）→ WebP。repo 根目錄跑：
#   bash tools/blender/env_second/lightbake/bake_cafe230.sh <cafe230.glb> [取樣數，預設 256] [輸出資料夾，預設 assets/models/env/second_ai/aa_support] [貼圖邊長，預設 1024]
# BB 07:33 第 5 點：「光要局部打亮、不要整片平均亮」——燈照 AA 的 GLOW_* 位置放：吧台上方七盞吊燈、天花板軌道八盞往下照的投射燈（12 cm 小面光源、光束 55°：地上一圈一圈亮）、
#   左牆兩盞壁燈、窗邊吧台四盞小檯燈、桌上與右牆邊的檯燈、角落立燈。天光從店面（+z）和右牆（+x）的窗進來（和舊的 bake_cafe.sh 同一個方位：+z＝真的西邊，下午的太陽從店面照進來）。
#   白天燈也開著但弱一點（--daylights 0.6），晚上夜空很暗（--nightsky 0.02）：燈下亮、桌與桌之間暗。
# --hide：玻璃、燈泡、窗景卡（窗外 2.5 m 的照片板，烘焙時會擋天光）。
# --nolm：燈泡、黃金葛、印刷品、頂點色的小零件（a23_vc*：椅子、杯子、酒瓶、層架上的東西——幾千個小零件分不到像素，照舊即時光）、窗景卡。
#   地板、天花板（外露水泥、梁、風管）、牆、胡桃木（吧台、桌面、層架板）照樣烘。
set -e
IN=${1:?cafe230.glb}
SAMPLES=${2:-256}
OUTDIR=${3:-assets/models/env/second_ai}
RES=${4:-1024}
TMP=$(mktemp -d)
NAME=cafe230
HIDE='a23_glass|a23_bulb|window_view'
NOLM='a23_bulb|pothos|a23_print|a23_vc|window_view|a23_c_brass|a23_c_metal_dk|a23_c_ceramic|a23_c_clay|a23_c_fabric|a23_c_wool|a23_c_leather_r|a23_ph_'   # CC0（LAWWW2-C 11-13）：分出來的小零件材質組也照舊即時光
WARM=${LCOL:-1.0,0.80,0.58}
PT=""; LIGHTS=""
for p in "-5.4,2.02,-3.95" "-4.24,2.1,-3.95" "-3.08,2.02,-3.95" "-1.92,2.1,-3.95" "-0.76,2.02,-3.95" "0.4,2.1,-3.95" "-5.6,2.13,0"; do PT="$PT;$p,${PENDW:-30},$WARM,0.04"; done
for p in "-6.86,2.15,-4.4" "-6.86,2.15,4.2"; do PT="$PT;$p,${SCW:-10},$WARM,0.05"; done
for p in "1.95,1.44,5.4" "5.6,1.44,5.4" "-5.6,1.44,5.4" "-1.95,1.44,5.4" "4.55,1.11,-5.6" "4.68,0.91,-2.6" "4.68,0.91,1.4" "0.18,0.91,1.4" "-3.82,0.91,2.4" "6.5,0.92,3" "6.5,0.72,-3.85" "6.82,1.14,-3.15" "6.82,1.14,0.85"; do PT="$PT;$p,${TLW:-6},$WARM,0.05"; done
PT="$PT;-6.5,1.45,4.75,${FLOORW:-20},$WARM,0.08"
for xz in "-5.9 3" "-1.97 3" "1.97 3" "5.9 3" "-5.9 -0.6" "-1.97 -0.6" "1.97 -0.6" "5.9 -0.6"; do set -- $xz
  LIGHTS="$LIGHTS;$(python3 -c "print(f'{$1-0.01:.3f},{$1+0.01:.3f},{$2-0.01:.3f},{$2+0.01:.3f},2.62,1,1,${SPOTW:-20},0.12,0.12,$WARM,${SPOTDEG:-55}')")"; done
PT=${PT#;}; LIGHTS=${LIGHTS#;}
/opt/blenv/bin/python tools/blender/env_second/lightbake/bake_room.py -- --in "$IN" --out "$OUTDIR/$NAME.glb" \
  --lm "$TMP/lm" --url assets/models/env/second_ai/${NAME}_lm --res "$RES" --samples "$SAMPLES" --hide "$HIDE" --nolm "$NOLM" \
  --sun 180,${SUNEL:-28},${SUNW:-1.4} --sky "${SKY:-0.7}" --nightsky "${NSKY:-0.02}" --daywb 0.97,0.9,0.8 --points "$PT" --lights "$LIGHTS" --daylights "${DAYL:-0.6}" --smooth 1 --shell S,E
python3 tools/blender/env_second/lightbake/to_webp.py "$TMP/lm" "$OUTDIR/${NAME}_lm" 90
/opt/blenv/bin/python tools/blender/env_second/lightbake/lm_fix_hidden.py -- --in "$OUTDIR/$NAME.glb" --out "$OUTDIR/$NAME.glb" --lm "$OUTDIR/${NAME}_lm"
cp "$TMP/lm.json" tools/blender/env_second/lightbake/${NAME}_lm.json
rm -rf "$TMP"
echo "done: $OUTDIR/$NAME.glb + ${NAME}_lm_day/night.webp"
