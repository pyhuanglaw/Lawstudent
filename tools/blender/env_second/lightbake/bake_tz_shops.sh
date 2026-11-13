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
liantong)
  # 汀州聯通（4.5×7×3.3 m）：輕鋼架天花板六組雙管日光燈（x ±1.0、z −2.4／0／2.3；1.16×0.16 m 面光源往下，冷白）＋右牆配件櫃前一點補光（櫃子層板下的燈條藏起來烘不到）。
  #   左邊整面玻璃＋玻璃門朝汀州路：白天天光 1.0。白天燈也開著。
  HIDE='glass|lightpanel'
  NOLM='lightpanel|_vc|_vcm|labels'
  COL=${LCOL:-0.96,0.98,1.0}
  for xx in -1.0 1.0; do for zz in -2.4 0.0 2.3; do
    LIGHTS="$LIGHTS;$(python3 -c "print(f'{$xx-0.01:.3f},{$xx+0.01:.3f},{$zz-0.01:.3f},{$zz+0.01:.3f},3.2,1,1,${TUBEW:-26},1.16,0.16,$COL')")"; done; done
  PT="1.5,1.6,0.05,${FILLW:-8},$COL,0.3"
  SUN="0,30,0"; SKY=${SKY:-1.0}; DAYWB=${DAYWB:-0.97,0.98,1.0}; DAYL=${DAYL:-1.0}; SHELL=S ;;
dongnan)
  # 東南大聯商行（7.5×9×3.3 m）：輕鋼架天花板八組雙管日光燈（x ±1.75、z −3.3／−1.0／1.3／3.5；1.16×0.16 m 面光源往下，冷白）＋右牆飲料冰箱前一點補光（冰箱燈條藏起來烘不到）。
  #   兩邊整面玻璃＋敞開的門朝汀州路：白天天光 1.0。白天燈也開著。
  HIDE='glass|lightpanel'
  NOLM='lightpanel|_vc|_vcm|labels'
  COL=${LCOL:-0.96,0.98,1.0}
  for xx in -1.75 1.75; do for zz in -3.3 -1.0 1.3 3.5; do
    LIGHTS="$LIGHTS;$(python3 -c "print(f'{$xx-0.01:.3f},{$xx+0.01:.3f},{$zz-0.01:.3f},{$zz+0.01:.3f},3.2,1,1,${TUBEW:-26},1.16,0.16,$COL')")"; done; done
  PT="2.6,1.4,0.05,${FILLW:-8},$COL,0.3"
  SUN="0,30,0"; SKY=${SKY:-1.0}; DAYWB=${DAYWB:-0.97,0.98,1.0}; DAYL=${DAYL:-1.0}; SHELL=S ;;
keju)
  # 客居雲南（5.5×9×3.3 m）：六盞藤編吊燈（燈泡 y 2.28，照 tz_shops_layout.js decor.pendants）＋右側天花板六顆軌道投射燈（x 1.27／1.47 交錯、z −1.8 起每 1.15 m，往下照桌子）＋天花板下三顆弱補光。暖色。
  #   白天燈也開著；店面朝汀州路，只有窗戶進來的天光。--nolm：植物（Poly Haven，葉子太碎）。
  HIDE='glass|lightpanel'
  NOLM='lightpanel|_vc|_vcm|ph_potted|labels'
  WARM=${LCOL:-1.0,0.84,0.64}
  for xz in "-1.95 2.8" "-1.95 0.6" "-1.95 -1.5" "2.2 2.5" "2.2 0.4" "1.0 -2.6"; do set -- $xz; PT="$PT;$1,2.28,$2,${PENDW:-75},$WARM,0.05"; done
  for i in 0 1 2 3 4 5; do z=$(python3 -c "print(round(-1.8+$i*1.15,3))"); x=$( [ $((i%2)) = 1 ] && echo 1.47 || echo 1.27 ); PT="$PT;$x,3.0,$z,${SPOTW:-18},$WARM,0.05"; done
  for z in -2.0 0.5 3.0; do PT="$PT;0.0,2.95,$z,${FILLW:-24},$WARM,0.2"; done
  SUN="180,30,0"; SKY=${SKY:-1.0}; DAYWB=${DAYWB:-1.0,0.95,0.88}; DAYL=${DAYL:-1.0}; SHELL=S ;;
yuehaochi)
  # 越好吃（6×9×3.3 m）：六盞藤編吊燈（y 2.28）＋五個會安絲布燈籠（燈泡在燈籠中心，彩色布透出來的暖光弱一點）＋天花板中線六顆軌道投射燈（x ±0.1 交錯、z −1.8 起每 1.15 m）＋三顆弱補光。暖色。
  #   位置照 tz_shops_layout.js decor.pendants／lanterns。--nolm：植物（Poly Haven）。
  HIDE='glass|lightpanel'
  NOLM='lightpanel|_vc|_vcm|ph_potted|ph_fern|labels'
  WARM=${LCOL:-1.0,0.84,0.64}
  for xz in "-2.3 2.9" "-2.3 0.6" "-2.3 -1.6" "2.45 2.7" "2.45 0.3" "1.0 -2.6"; do set -- $xz; PT="$PT;$1,2.28,$2,${PENDW:-70},$WARM,0.05"; done
  for xzy in "-0.9 3.2 2.35" "-1.05 1.7 2.5" "-0.9 0.0 2.3" "-1.05 -1.9 2.45" "1.9 3.45 2.45"; do set -- $xzy; PT="$PT;$1,$3,$2,${LANW:-22},1.0,0.7,0.45,0.12"; done
  for i in 0 1 2 3 4 5; do z=$(python3 -c "print(round(-1.8+$i*1.15,3))"); x=$( [ $((i%2)) = 1 ] && echo 0.1 || echo -0.1 ); PT="$PT;$x,3.0,$z,${SPOTW:-16},$WARM,0.05"; done
  for z in -2.0 0.5 3.0; do PT="$PT;0.8,2.95,$z,${FILLW:-24},$WARM,0.2"; done
  SUN="180,30,0"; SKY=${SKY:-1.0}; DAYWB=${DAYWB:-1.0,0.95,0.88}; DAYL=${DAYL:-1.0}; SHELL=S ;;
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
