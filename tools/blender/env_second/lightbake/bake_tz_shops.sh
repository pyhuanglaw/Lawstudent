#!/bin/bash
# 汀州路走得進去的店改用 CC0 素材以後的光照烘焙（SHOP-REALISM-1112，LAWWW2-C 2026-11-13；照 bake_wz_shops.sh）：
#   建模（tz_shops_interior.py，CC0 材質組＋Poly Haven 模型）→ 光照烘焙（白天／晚上，只有光、不含顏色）→ WebP。repo 根目錄跑：
#   bash tools/blender/env_second/lightbake/bake_tz_shops.sh taimi [取樣數，預設 256] [輸出資料夾，預設 assets/models/env/second_ai] [貼圖邊長，預設 1024]
# 輸出：tz_<店>_interior.glb（多一套 UV＝TEXCOORD_1、extras.lightmap）＋ tz_<店>_interior_lm_day.webp、_night.webp。
#   遊戲：tz_shops3d.js → Z3.attachRoomGLB 看到 GLB 的 extras.lightmap 就接（和溫州街三家同一套），不用改程式。
#   為什麼不像溫特寶邸把光影烘進顏色貼圖：這幾間走得進去，店裡要跟著遊戲的時段（白天／晚上）換光；烘進顏色會亮兩次（docs/art-rebuild/second_ai/research/SHOP_REALISM_PLAN_TZ7.md）。
# 座標＝遊戲區域座標（tz_shops_interior.py：房間中心在原點、店門在 +z）。燈的位置照 src/data/tz_shops_layout.js 的 decor（改那邊要一起改）。
set -e
SHOP=${1:?taimi}
SAMPLES=${2:-256}
OUTDIR=${3:-assets/models/env/second_ai}
RES=${4:-1024}
TMP=$(mktemp -d)
NAME=tz_${SHOP}_interior
PT=""; LIGHTS=""
case "$SHOP" in
taimi)
  # 泰米村食（8×10×3.4 m）：九盞藤編吊燈（燈泡在燈罩裡 y 2.35：光往下，燈罩擋住往上的光）＋左牆軌道上六顆往牆照的投射燈（照照片、圓盤）＋天花板下三顆弱的補光（天花板只吃反彈光太暗）。
  #   白天燈也開著（--daylights；餐廳白天一樣開燈）。店面朝汀州路，太陽不直接照進來（0），只有窗戶進來的天光。
  # --hide：玻璃、發光的燈泡和燈條（tzs_lightpanel：點光源放在燈泡的位置，燈泡的球會把光擋住；遊戲裡照舊自己發光）。
  # --nolm：發光的、頂點色的小東西（醬料瓶、蘭花、收銀機…）、Poly Haven 的植物（葉子很碎，光照貼圖分不到幾個像素：照舊即時光、晚上跟著暗 rtK）。
  HIDE='glass|lightpanel'
  NOLM='lightpanel|_vc|_vcm|ph_fern|ph_potted|labels'
  WARM=${LCOL:-1.0,0.84,0.64}
  for xz in "-2.9 3.6" "-2.9 2.2" "-2.9 0.8" "-2.9 -0.6" "-2.9 -2" "2.1 3.4" "2.1 1.1" "2.1 -1.2" "1.3 -2.6"; do set -- $xz; PT="$PT;$1,2.33,$2,${PENDW:-80},$WARM,0.05"; done
  for i in 0 1 2 3 4 5; do z=$(python3 -c "print(-2.0+$i*1.2)")
    LIGHTS="$LIGHTS;$(python3 -c "print(f'-3.31,-3.29,{$z-0.01:.3f},{$z+0.01:.3f},3.14,1,1,${TRACKW:-20},0.08,0.08,$WARM')")"; done
  for z in -1.5 1.0 3.5; do PT="$PT;0.4,2.9,$z,${FILLW:-28},$WARM,0.2"; done
  SUN="180,30,0"; SKY=${SKY:-1.0}; DAYWB=${DAYWB:-1.0,0.95,0.88}; DAYL=${DAYL:-1.0}; SHELL=S ;;
xile)
  # 洗樂洗衣坊（6×9×3.3 m）：天花板六支日光燈（x ±1.4、z −2.6／0／2.6；1.24×0.07 m 面光源往下，冷白）＋燈下一點補光（天花板只吃反彈光太暗）；
  #   整面落地玻璃朝汀州路：白天天光 1.0。24 小時自助洗衣，白天燈也開著。
  HIDE='glass|lightpanel'
  NOLM='lightpanel|_vc|_vcm|ph_fern|labels'
  COL=${LCOL:-0.96,0.98,1.0}
  for xx in -1.4 1.4; do for zz in -2.6 0.0 2.6; do
    LIGHTS="$LIGHTS;$(python3 -c "print(f'{$xx-0.01:.3f},{$xx+0.01:.3f},{$zz-0.01:.3f},{$zz+0.01:.3f},3.2,1,1,${TUBEW:-28},1.24,0.07,$COL')")"; done; done
  for zz in -2.6 0.0 2.6; do PT="$PT;0,2.6,$zz,${FILLW:-12},$COL,0.3"; done
  SUN="0,30,0"; SKY=${SKY:-1.0}; DAYWB=${DAYWB:-0.97,0.98,1.0}; DAYL=${DAYL:-1.0}; SHELL=S ;;
yindehao)
  # 印得好影印店（6.5×10×3.3 m）：天花板四支日光燈（x −1.22～0.22、z −3.0／−0.6／1.8／3.9；1.44×0.07 m 面光源往下，冷白）＋右側櫃台上方兩點補光（燈都在左半邊，櫃台和右牆層架只吃反彈光太暗）；
  #   玻璃門＋兩側鋁框玻璃朝汀州路：白天天光 1.0。白天燈也開著。
  HIDE='glass|lightpanel'
  NOLM='lightpanel|_vc|_vcm|ph_potted|labels'
  COL=${LCOL:-0.96,0.98,1.0}
  for zz in -3.0 -0.6 1.8 3.9; do
    LIGHTS="$LIGHTS;$(python3 -c "print(f'-0.510,-0.490,{$zz-0.01:.3f},{$zz+0.01:.3f},3.2,1,1,${TUBEW:-32},1.44,0.07,$COL')")"; done
  for zz in -2.0 1.0; do PT="$PT;1.9,2.7,$zz,${FILLW:-14},$COL,0.3"; done
  SUN="0,30,0"; SKY=${SKY:-1.0}; DAYWB=${DAYWB:-0.97,0.98,1.0}; DAYL=${DAYL:-1.0}; SHELL=S ;;
*) echo "還沒做 CC0 版的店：$SHOP（先做泰米，其他五間照 SHOP_REALISM_PLAN_TZ7.md 的順序加進來）"; exit 1 ;;
esac
PT=${PT#;}; LIGHTS=${LIGHTS#;}
/opt/blenv/bin/python tools/blender/env_second/tz_shops_interior.py -- --shop "$SHOP" --out "$TMP/plain.glb"
python3 -c "import json,sys; d=json.load(open(sys.argv[1])); d['out']='assets/models/env/second_ai/$NAME.glb'; json.dump(d,open(sys.argv[2],'w'),ensure_ascii=False,indent=1)" "$TMP/plain.json" "$OUTDIR/$NAME.json"
EXTRA=(); [ -n "$LIGHTS" ] && EXTRA+=(--lights "$LIGHTS"); [ -n "$PT" ] && EXTRA+=(--points "$PT")
/opt/blenv/bin/python tools/blender/env_second/lightbake/bake_room.py -- --in "$TMP/plain.glb" --out "$OUTDIR/$NAME.glb" \
  --lm "$TMP/lm" --url assets/models/env/second_ai/${NAME}_lm --res "$RES" --samples "$SAMPLES" --hide "$HIDE" --nolm "$NOLM" \
  --sun "$SUN" --sky "$SKY" --daywb $DAYWB "${EXTRA[@]}" --daylights "$DAYL" --smooth 1 --shell "$SHELL"
python3 tools/blender/env_second/lightbake/to_webp.py "$TMP/lm" "$OUTDIR/${NAME}_lm" 90
/opt/blenv/bin/python tools/blender/env_second/lightbake/lm_fix_hidden.py -- --in "$OUTDIR/$NAME.glb" --out "$OUTDIR/$NAME.glb" --lm "$OUTDIR/${NAME}_lm"
cp "$TMP/lm.json" tools/blender/env_second/lightbake/${NAME}_lm.json
echo "done: $OUTDIR/$NAME.glb + ${NAME}_lm_day/night.webp"
