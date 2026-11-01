#!/bin/bash
# 兩點半 Café 室內（INTERIOR-AAA，LAWWW-B D111 的第二間；LAWWW2-B 2026-10-30）：建模 → 光照烘焙（白天／晚上）→ WebP。repo 根目錄跑：
#   bash tools/blender/env_second/lightbake/bake_cafe.sh [取樣數，預設 512] [輸出資料夾，預設 assets/models/env/second_ai] [貼圖邊長，預設 1024]
# 輸出：cafe_interior.glb（多一套 UV＝TEXCOORD_1）＋ cafe_interior_lm_day.webp、cafe_interior_lm_night.webp。遊戲：zones3d.js 的 cafe → attachRoomGLB 看到 GLB 的 extras.lightmap 就接。
# 座標＝遊戲 cafe 區域（14×12×3.4 m，店面在 +z、右牆 +x 有兩扇窗）。Café 在溫州街東端、店面朝西：遊戲座標的 +z（--sun 的 180°）＝真的西邊，下午的太陽從店面照進來。
# 燈（點光源，暖色；燈泡、玻璃球燈罩烘焙時當作不存在，照舊自己發光）：
#   四張桌子上方的玻璃球吊燈（燈泡 2.17 m）、吧檯上方三盞金屬燈罩（2.27 m）、店面窗邊吧台上方四盞小燈罩（2.32 m）、角落立燈（1.42 m）。
#   位置照 cafe_layout.py 的 TABLES、BAR、COUNTER_Z。咖啡廳白天燈也開著（--daylights）。
# 外殼（--shell S,E）：店面（S＝+z）、右牆（E＝+x）有玻璃，天光從這兩面進來；其他包黑殼。
# --nolm（照舊即時光）：燈泡、燈罩玻璃、植物（葉子、樹皮、土）、黃銅、鋼、黑鐵、電線、白瓷杯盤、蛋糕、傘、印刷品、班表、黑板字、書背（幾千個小零件，分不到像素）；
#   椅子、凳子、桌子（實例展開後叫 cafe_interior.N_inst：曲面多、小島多，第一次試烘把整張貼圖擠滿，地板只分到 0.08%）。
# 亮度（10-30 兩輪；遊戲內同角度和沒有光照貼圖的版本比）：第一輪吊燈 28／30／14／18 W、天光 0.5——白天、晚上都比原本暗；
#   現在吊燈 45／45／22／28 W、天光 0.8、太陽 1.6（仰角 28°）：白天和原本差不多亮，多了店面窗框的陽光影子；晚上吊燈下一圈光、角落暗。
set -e
SAMPLES=${1:-512}
OUTDIR=${2:-assets/models/env/second_ai}
RES=${3:-1024}
TMP=$(mktemp -d)
HIDE='cafe_glass|winglass|lampglass|cafe_bulb|_bulb'
NOLM='bulb|lampglass|leaf|fern|_pl_|bark|soil|brass|steel|iron|cord|ceramic|cake|umbrella|print|roster|board_face|books|beans|jars|cups|pots|MENU|_inst'
WARM='1.0,0.78,0.55'
PT=""
for p in "4.5,2.13,-2.5" "4.5,2.13,1.5" "0,2.13,1.5" "-4,2.13,2.5"; do PT="$PT;$p,${GLOBEW:-45},$WARM"; done
for x in -5 -2.5 0; do PT="$PT;$x,2.22,-4.4,${BARW:-45},$WARM"; done
for x in -4.6 -2.6 2.6 4.6; do PT="$PT;$x,2.27,5.55,${WINW:-22},$WARM"; done
PT="$PT;-6.55,1.42,4.85,${FLOORW:-28},$WARM"; PT=${PT#;}
/opt/blenv/bin/python tools/blender/env_second/cafe_interior.py -- --out "$TMP/cafe_plain.glb"
/opt/blenv/bin/python tools/blender/env_second/lightbake/bake_room.py -- --in "$TMP/cafe_plain.glb" --out "$OUTDIR/cafe_interior.glb" \
  --lm "$TMP/cf" --url assets/models/env/second_ai/cafe_interior_lm --res "$RES" --samples "$SAMPLES" --hide "$HIDE" --nolm "$NOLM" \
  --sun 180,${SUNEL:-28},${SUNW:-1.6} --sky "${SKY:-0.8}" --daywb 0.95,0.88,0.78 --points "$PT" --daylights "${DAYL:-0.8}" --smooth 1 --shell S,E
python3 tools/blender/env_second/lightbake/to_webp.py "$TMP/cf" "$OUTDIR/cafe_interior_lm" 90
/opt/blenv/bin/python tools/blender/env_second/lightbake/lm_fix_hidden.py -- --in "$OUTDIR/cafe_interior.glb" --out "$OUTDIR/cafe_interior.glb" --lm "$OUTDIR/cafe_interior_lm"
cp "$TMP/cf.json" tools/blender/env_second/lightbake/cafe_interior_lm.json
rm -rf "$TMP"
echo "done: $OUTDIR/cafe_interior.glb + cafe_interior_lm_day/night.webp"
