#!/bin/bash
# 阿鳳麵店室內（NOODLE-LM-1030；LAWWW-B 10-30 派工，INTERIOR-AAA；LAWWW2-B 2026-10-30）：建模 → 光照烘焙（白天／晚上）→ WebP。repo 根目錄跑：
#   bash tools/blender/env_second/lightbake/bake_noodle.sh [取樣數，預設 512] [輸出資料夾，預設 assets/models/env/second_ai] [貼圖邊長，預設 1024]
# 輸出：noodle_interior.glb（多一套 UV＝TEXCOORD_1、extras.lightmap）＋ noodle_interior_lm_day.webp、_night.webp。
#   遊戲：zones3d.js 的 noodle → attachRoomGLB 看到 GLB 的 extras.lightmap 就接（和 Café 同一套），光照不用改程式。
# 座標＝遊戲 noodle 區域（room() 10×9×3.2 m）：店面在 +z（中間玻璃門、x＝±3 兩扇窗），後牆 −z 是煮麵台、價目板。
#   店面朝東（公館南側店面：公館 −z＝真的東邊，見 CLAUDE.md 公館 (gx,gz) → 校園 (x=−170−gz, z=gx)）：下午的太陽在屋子後面，白天只有店面進來的天光（太陽 0 W）。
# 燈：六支日光燈管（x＝±2.5、z＝−2.6／0.5／3.0，燈管在天花板下 0.12 m、長 1.2 m，上面一片燈座）。
#   每支燈管三顆點光源（燈管中間和兩邊 0.4 m，半徑 4 cm：再大會碰到上面的燈座），燈管本身烘焙時當作不存在（照舊自己發光）；燈座照樣擋光（燈管上面那一塊天花板暗一點）。
#   日光燈偏白，比 Café 的暖色燈冷；小麵店白天燈也開著（--daylights）。
# 外殼（--shell S）：店面（+z）有玻璃，天光從這一面進來；其他包黑殼。
# --nolm（照舊即時光）：燈管、燈座、碗、麵、湯、滷味、調味罐、筷筒、黑色小東西、椅腳桌腳、桌邊、面紙盒、湯鍋煮麵爐（深色不鏽鋼）、
#   紅紙菜單／價目板（SIGN_FACE：字由遊戲 canvas 畫）、窗框、電扇、電視（小零件，分不到像素）。桌面、椅子（方塊）、煮麵台櫃身照樣烘（有接觸陰影）。
set -e
SAMPLES=${1:-512}
OUTDIR=${2:-assets/models/env/second_ai}
RES=${3:-1024}
TMP=$(mktemp -d)
HIDE='glass|^ndl_tubes$|^ndl_tube$'
NOLM='tube|bowl|noodle|soup|food|jar|black|legs|table_edges|tissue|steel_dark|SIGN_FACE|frame|fan|_tv'
COOL='1.0,0.97,0.9'
TW=${TUBEW:-20}
PT=""
for z in -2.6 0.5 3.0; do for x in -2.5 2.5; do for dx in -0.4 0 0.4; do
  PT="$PT;$(python3 -c "print(f'{$x+$dx:.2f}')"),3.04,$z,$TW,$COOL,0.04"
done; done; done
PT=${PT#;}
/opt/blenv/bin/python tools/blender/env_second/noodle_interior.py -- --out "$TMP/noodle_plain.glb"
python3 -c "import json,sys; d=json.load(open(sys.argv[1])); d['out']='assets/models/env/second_ai/noodle_interior.glb'; json.dump(d,open(sys.argv[2],'w'),ensure_ascii=False,indent=1)" "$TMP/noodle_plain.json" "$OUTDIR/noodle_interior.json"
/opt/blenv/bin/python tools/blender/env_second/lightbake/bake_room.py -- --in "$TMP/noodle_plain.glb" --out "$OUTDIR/noodle_interior.glb" \
  --lm "$TMP/nd" --url assets/models/env/second_ai/noodle_interior_lm --res "$RES" --samples "$SAMPLES" --hide "$HIDE" --nolm "$NOLM" \
  --sun 90,30,0 --sky "${SKY:-0.8}" --daywb 0.96,0.96,0.94 --nightwb 0.97,0.98,1.0 --points "$PT" --daylights "${DAYL:-0.9}" --smooth 1 --shell S
python3 tools/blender/env_second/lightbake/to_webp.py "$TMP/nd" "$OUTDIR/noodle_interior_lm" 90
/opt/blenv/bin/python tools/blender/env_second/lightbake/lm_fix_hidden.py -- --in "$OUTDIR/noodle_interior.glb" --out "$OUTDIR/noodle_interior.glb" --lm "$OUTDIR/noodle_interior_lm"
cp "$TMP/nd.json" tools/blender/env_second/lightbake/noodle_interior_lm.json
rm -rf "$TMP"
echo "done: $OUTDIR/noodle_interior.glb + noodle_interior_lm_day/night.webp"
