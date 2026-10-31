#!/bin/bash
# 舊路書房（二手書店）室內（bookstore 區域；INTERIOR-AAA-REVIEW-1028，LAWWW2-B 2026-10-31；照 bake_cvs.sh、bake_noodle.sh）：建模 → 光照烘焙（白天／晚上）→ WebP。repo 根目錄跑：
#   bash tools/blender/env_second/lightbake/bake_bookstore.sh [取樣數，預設 512] [輸出資料夾，預設 assets/models/env/second_ai] [貼圖邊長，預設 1024]
# 輸出：bookstore_interior.glb（多一套 UV＝TEXCOORD_1、extras.lightmap）＋ bookstore_interior_lm_day.webp、_night.webp。
#   遊戲：zones3d.js 的 bookstore → attachRoomGLB 看到 GLB 的 extras.lightmap 就接；attachBookstoreInterior 的補光（BK_BOUNCE）有光照貼圖時不加（patch，和便利商店一樣）。
# 座標＝遊戲 bookstore 區域（room() 12×10×3.4 m）：店面在 +z（玻璃、門），後牆、左右牆是書架，中間兩排雙面書架在 x=±2，櫃台桌在 (0, 3)。
#   和便利商店、麵店同一排公館南側店面、店面朝東：下午的太陽在屋子後面，白天只有店面進來的天光（太陽 0 W）。
# 燈（照 bookstore_interior.py；改那邊要一起改）：
#   七盞吊燈（暖色燈罩，燈罩下緣 2.37 m）：燈罩裡一顆暖色點光源；燈罩上面漏一點光到天花板（燈罩頂的開口），另一顆小的；
#   櫃台的黃銅檯燈（燈罩在 (0.95, 1.25, 3.05)）：一顆小的暖色點光源。二手書店的燈本來就偏暖、偏暗，白天燈照開。
# 外殼（--shell S）：店面（+z）有玻璃，天光從這一面進來；其他包黑殼。
# --nolm（照舊即時光）：書（一萬五千多個三角形，頂點色）、燈罩、檯燈、吊燈電線、黃銅、黑色小零件、紙袋、海報、手寫牌（SIGN_FACE：字由遊戲 canvas 畫）、窗框。
#   地板、天花板、樑、牆、書架、櫃台桌照樣烘。
# 10-31 遊戲內試了四版（64 取樣；截圖在 docs/art-rebuild/second_ai/test_shots/bookstore_lm_1031/README.md）：
#   吊燈 30 W、天光 0.5：整間偏暗，淺色木地板看起來是深咖啡色（D112：不要深色木地板）。四面牆、兩排都是深色木書架，光幾乎都被吃掉：
#     光照貼圖平均只有便利商店的四分之一。吊燈 80、160 W 還是偏暗。
#   定案（第四版）：吊燈 400 W、燈罩上面 40 W、天光 2.0；暖色從 1.0,0.8,0.56 改成 1.0,0.86,0.68（晚上地板太橘）。
set -e
SAMPLES=${1:-512}
OUTDIR=${2:-assets/models/env/second_ai}
RES=${3:-1024}
TMP=$(mktemp -d)
HIDE='glass'
NOLM='bk_books|lampshade|desklamp|lamp_cord|lamp_brass|bk_brass|bk_black|bk_bags|posters|SIGN_FACE|frame'
WARM=${LCOL:-1.0,0.86,0.68}
PW=${PENDW:-400}; TOPW=${TOPW:-40}; DW=${DESKW:-5}
PT=""
for xz in "-3.8 -2.0" "0.0 -2.0" "3.8 -2.0" "-3.8 1.5" "0.0 1.5" "3.8 1.5" "0.0 3.0"; do
  set -- $xz; x=$1; z=$2
  PT="$PT;$x,2.45,$z,$PW,$WARM,0.05;$x,2.62,$z,$TOPW,$WARM,0.03"
done
PT="$PT;0.95,1.17,3.05,$DW,$WARM,0.03"   # 櫃台檯燈
PT=${PT#;}
/opt/blenv/bin/python tools/blender/env_second/bookstore_interior.py -- --out "$TMP/bk_plain.glb"
python3 -c "import json,sys; d=json.load(open(sys.argv[1])); d['out']='assets/models/env/second_ai/bookstore_interior.glb'; json.dump(d,open(sys.argv[2],'w'),ensure_ascii=False,indent=1)" "$TMP/bk_plain.json" "$OUTDIR/bookstore_interior.json"   # 統計（三角形、材質）
/opt/blenv/bin/python tools/blender/env_second/lightbake/bake_room.py -- --in "$TMP/bk_plain.glb" --out "$OUTDIR/bookstore_interior.glb" \
  --lm "$TMP/bk" --url assets/models/env/second_ai/bookstore_interior_lm --res "$RES" --samples "$SAMPLES" --hide "$HIDE" --nolm "$NOLM" \
  --sun 90,30,0 --sky "${SKY:-2.0}" --daywb ${DAYWB:-0.98,0.97,0.95} --points "$PT" --daylights "${DAYL:-1.0}" --smooth 1 --shell S
python3 tools/blender/env_second/lightbake/to_webp.py "$TMP/bk" "$OUTDIR/bookstore_interior_lm" 90
/opt/blenv/bin/python tools/blender/env_second/lightbake/lm_fix_hidden.py -- --in "$OUTDIR/bookstore_interior.glb" --out "$OUTDIR/bookstore_interior.glb" --lm "$OUTDIR/bookstore_interior_lm"
cp "$TMP/bk.json" tools/blender/env_second/lightbake/bookstore_interior_lm.json
echo "done: $OUTDIR/bookstore_interior.glb + bookstore_interior_lm_day/night.webp"
