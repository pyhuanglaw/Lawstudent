#!/bin/bash
# 日日便利室內（cvs 區域；INTERIOR-AAA-REVIEW-1028，LAWWW2-B 2026-10-31；照 bake_noodle.sh）：建模 → 光照烘焙（白天／晚上）→ WebP。repo 根目錄跑：
#   bash tools/blender/env_second/lightbake/bake_cvs.sh [取樣數，預設 512] [輸出資料夾，預設 assets/models/env/second_ai] [貼圖邊長，預設 1024]
# 輸出：cvs_interior.glb（多一套 UV＝TEXCOORD_1、extras.lightmap）＋ cvs_interior_lm_day.webp、_night.webp。
#   遊戲：zones3d.js 的 cvs → attachRoomGLB 看到 GLB 的 extras.lightmap 就接（和麵店、Café 同一套），光照不用改程式。
# 座標＝遊戲 cvs 區域（room() 12×9×3.2 m）：店面在 +z（玻璃、自動門），後牆 −z 是貨架，右牆 x=+6 是飲料櫃。
#   和麵店同一排公館南側店面、店面朝東：下午的太陽在屋子後面，白天只有店面進來的天光（太陽 0 W）。
# 燈（照 cvs_interior.py；改那邊要一起改）：
#   天花板十條 LED 燈條（x ±0.6～±5.4、z −3.2～3.2 每 1.6 m，貼著天花板）：面光源 4.8×0.12 m，晝光色（便利商店的燈很白）；
#   燈條下 0.8 m 各兩顆點光源：面光源只往下照，天花板只吃到地板反彈的光（普通教學館、總圖 3F 同一個問題）；
#   飲料櫃背光（右牆 x≈5.9、z 0～4、高 0.25～2.2）：櫃子裡一排點光源，冷白。
#   白天燈照開（--daylights）。
# 外殼（--shell S）：店面（+z）有玻璃，天光從這一面進來；其他包黑殼。
# --nolm（照舊即時光）：燈條、飲料櫃背光、商品（四萬多個三角形的小盒子、瓶罐，頂點色）、端架商品、海報、分類牌和看板（SIGN_FACE：字由遊戲 canvas 畫）、
#   價格條、層板鐵條、黑色小零件、不鏽鋼、包子蒸櫃、關東煮、吊牌的框、店面窗框、飲料櫃的框。地板、牆、色帶、天花板、貨架、櫃檯、地墊照樣烘。
# 10-31 遊戲內試了三版（64 取樣；截圖在 docs/art-rebuild/second_ai/test_shots/cvs_lm_1031/README.md）：
#   第一版（燈條 14 W、點光源 6 W）：和改前幾乎一樣——遊戲的 attachCvsInterior 對牆、地板、貨架、櫃檯加了一層均勻的自發光（CVS_BOUNCE），把烘焙的影子洗掉。
#     遊戲那邊改成有光照貼圖的材質不加（和宿舍四人房 DORM_BOUNCE 一樣；patch cvs_lm_1031.patch）。
#   第二版：貨架底下、櫃檯正面有影子了，但白色貨架偏灰。定案（第三版）：燈條 18 W、燈下點光源 8 W。
set -e
SAMPLES=${1:-512}
OUTDIR=${2:-assets/models/env/second_ai}
RES=${3:-1024}
TMP=$(mktemp -d)
HIDE='glass'
NOLM='cvs_led|cvs_cooler_light|goods_items|^cvs_goods$|posters|SIGN_FACE|cvs_tag|cvs_rail|cvs_black|cvs_steel|cvs_buns|cvs_oden|cvs_sign_hang|WALL_front_frame|^cvs_cooler$'
H=3.2
COL=${LCOL:-0.96,0.98,1.0}
LW=${LEDW:-18}; UPW=${UPW:-8}; CW=${COOLW:-4}
LIGHTS=""; PT=""
for z in -3.2 -1.6 0.0 1.6 3.2; do for x in -3.0 3.0; do
  LIGHTS="$LIGHTS;$(python3 -c "print(f'{$x-0.01:.3f},{$x+0.01:.3f},{$z-0.01:.3f},{$z+0.01:.3f},{$H-0.06:.3f},1,1,$LW,4.8,0.12,$COL')")"
  for dx in -1.2 1.2; do PT="$PT;$(python3 -c "print(f'{$x+$dx:.2f},{$H-0.8:.2f},$z,$UPW,$COL')")"; done
done; done
for z in 0.4 1.2 2.0 2.8 3.6; do PT="$PT;5.75,1.25,$z,$CW,0.92,0.96,1.0,0.05"; done   # 飲料櫃背光（櫃子裡、玻璃門後面）
LIGHTS=${LIGHTS#;}; PT=${PT#;}
/opt/blenv/bin/python tools/blender/env_second/cvs_interior.py -- --out "$TMP/cvs_plain.glb"
python3 -c "import json,sys; d=json.load(open(sys.argv[1])); d['out']='assets/models/env/second_ai/cvs_interior.glb'; json.dump(d,open(sys.argv[2],'w'),ensure_ascii=False,indent=1)" "$TMP/cvs_plain.json" "$OUTDIR/cvs_interior.json"   # 統計（三角形、材質）
/opt/blenv/bin/python tools/blender/env_second/lightbake/bake_room.py -- --in "$TMP/cvs_plain.glb" --out "$OUTDIR/cvs_interior.glb" \
  --lm "$TMP/cv" --url assets/models/env/second_ai/cvs_interior_lm --res "$RES" --samples "$SAMPLES" --hide "$HIDE" --nolm "$NOLM" \
  --sun 90,30,0 --sky "${SKY:-0.6}" --daywb ${DAYWB:-0.96,0.97,0.98} --lights "$LIGHTS" --points "$PT" --daylights "${DAYL:-1.0}" --smooth 1 --shell S
python3 tools/blender/env_second/lightbake/to_webp.py "$TMP/cv" "$OUTDIR/cvs_interior_lm" 90
/opt/blenv/bin/python tools/blender/env_second/lightbake/lm_fix_hidden.py -- --in "$OUTDIR/cvs_interior.glb" --out "$OUTDIR/cvs_interior.glb" --lm "$OUTDIR/cvs_interior_lm"
cp "$TMP/cv.json" tools/blender/env_second/lightbake/cvs_interior_lm.json
echo "done: $OUTDIR/cvs_interior.glb + cvs_interior_lm_day/night.webp"
