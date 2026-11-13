#!/bin/bash
# 118 巷的店改用 CC0 素材以後的光照烘焙（SHOP-CC0-HELP-1113，AA-C 2026-11-13；照 LAWWW2-C 的 bake_tz_shops.sh）：
#   建模（lane118_shops.py，CC0 材質組＋Poly Haven 模型）→ 光照烘焙（白天／晚上，只有光、不含顏色）→ WebP。repo 根目錄跑：
#   bash tools/blender/env_second/lightbake/bake_l118_shops.sh self [取樣數，預設 256] [輸出資料夾，預設 assets/models/env/second_ai] [貼圖邊長，預設 1024]
# 輸出：l118_<店>.glb（多一套 UV＝TEXCOORD_1、extras.lightmap）＋ l118_<店>_lm_day.webp、_night.webp；.layout.json 照建模那一份。
#   遊戲：src/l118_shops3d.js → Z3.attachRoomGLB 看到 GLB 的 extras.lightmap 就接，不用改程式。
# 座標＝遊戲區域座標（lane118_shops.py：房間中心在原點、店門在 +z＝S 面）。燈的位置照 lane118_shops.py 的 build_<店>（改那邊要一起改）。
set -e
SHOP=${1:?self}
SAMPLES=${2:-256}
OUTDIR=${3:-assets/models/env/second_ai}
RES=${4:-1024}
TMP=$(mktemp -d)
NAME=l118_${SHOP}
PT=""; LIGHTS=""
case "$SHOP" in
self)
  # 水上便當（6.6×9×3.2 m＋後面 2.2 m 深的廚房）：天花板八片輕鋼架燈盤（沿 z，0.3×1.2 m 面光源往下，冷白；位置照 build_self 的 troffers）＋配菜櫃上三盞保溫燈（暖、點光源 y 1.5）
  #   ＋廚房一支日光燈（x 0、z −5.18，沿 x 1.24 m）、抽油煙罩下的暖燈（y 1.9）。白天燈也開著；店面玻璃朝 118 巷（S），太陽不直接照進來，只有天光。
  # --hide：玻璃（配菜櫃的防護罩、店面）、發光的燈管和燈泡（GLOW_）、店門外的巷子景和鄰居店面卡（view）。
  # --nolm：頂點色的小東西（配菜、照片、時鐘…）、Poly Haven 的植物（葉子碎，光照貼圖分不到幾個像素）、印刷品和螢幕、
  #   便當盒（白 _box_w、牛皮紙 _box_k；一疊疊貼在一起的薄盒子，上下面互相遮住，烘出來是一條條黑帶：AA-C 11-13 第一次烘）。
  HIDE='glass|GLOW_|view'
  NOLM='_vc$|ph_potted|prints|screens|_box_w|_box_k'
  COL=${LCOL:-0.96,0.98,1.0}; WARM=${WCOL:-1.0,0.8,0.55}
  for xz in "-1.8 -2.1" "-1.8 0.3" "-1.8 2.7" "0.6 -2.1" "0.6 2.7" "2.4 -2.1" "2.4 0.3" "2.4 2.7"; do set -- $xz
    LIGHTS="$LIGHTS;$(python3 -c "print(f'{$1-0.01:.3f},{$1+0.01:.3f},{$2-0.01:.3f},{$2+0.01:.3f},3.11,1,1,${TROFW:-30},0.3,1.2,$COL')")"; done
  LIGHTS="$LIGHTS;$(python3 -c "print('-0.010,0.010,-5.185,-5.165,3.1,1,1,${TUBEW:-24},1.24,0.05,$COL')")"
  for z in -2.5 -1.2 0.1; do PT="$PT;-2.0,1.47,$z,${HEATW:-18},$WARM,0.04"; done
  PT="$PT;0.55,1.85,-6.0,${HOODW:-14},$WARM,0.1"
  SUN="0,30,0"; SKY=${SKY:-1.0}; DAYWB=${DAYWB:-0.98,0.98,1.0}; DAYL=${DAYL:-1.0}; SHELL=S ;;
korea)
  # 清州刀削麵（6.6×8.5×3.2 m＋後面 2.2 m 深的廚房）：天花板八片輕鋼架燈盤（六片沿 z、兩片沿 x；位置照 build_korea 的 troffers）＋廚房一支日光燈（x 0、z −4.93）
  #   ＋抽油煙罩下三盞暖燈（x 0.7／1.5／2.3、z −5.85、y 1.9）。白天燈也開著；店面玻璃朝 118 巷（S），只有天光。
  # --hide／--nolm 同上（蒸氣 steam 也藏：半透明的球，擋光）。
  HIDE='glass|GLOW_|view|steam'
  NOLM='_vc$|ph_potted|prints|screens'
  COL=${LCOL:-0.96,0.98,1.0}; WARM=${WCOL:-1.0,0.8,0.55}
  for xz in "-1.8 -1.0" "-1.8 1.4" "0.6 -1.0" "0.6 1.4" "2.4 -1.0" "2.4 1.4"; do set -- $xz
    LIGHTS="$LIGHTS;$(python3 -c "print(f'{$1-0.01:.3f},{$1+0.01:.3f},{$2-0.01:.3f},{$2+0.01:.3f},3.11,1,1,${TROFW:-30},0.3,1.2,$COL')")"; done
  for xz in "-1.8 3.4" "-0.5 -3.25"; do set -- $xz
    LIGHTS="$LIGHTS;$(python3 -c "print(f'{$1-0.01:.3f},{$1+0.01:.3f},{$2-0.01:.3f},{$2+0.01:.3f},3.11,1,1,${TROFW:-30},1.2,0.3,$COL')")"; done
  LIGHTS="$LIGHTS;$(python3 -c "print('-0.010,0.010,-4.935,-4.915,3.1,1,1,${TUBEW:-24},1.24,0.05,$COL')")"
  for x in 0.7 1.5 2.3; do PT="$PT;$x,1.85,-5.85,${HOODW:-10},$WARM,0.08"; done
  SUN="0,30,0"; SKY=${SKY:-1.0}; DAYWB=${DAYWB:-0.98,0.98,1.0}; DAYL=${DAYL:-1.0}; SHELL=S ;;
dian)
  # 118牛排（5.6×8×3.2 m＋後面 2.2 m 深的廚房）：天花板六片輕鋼架燈盤（四片沿 z、兩片沿 x；位置照 build_dian 的 troffers）＋廚房一支日光燈（x 0、z −4.68）
  #   ＋抽油煙罩下四盞暖燈（x −1.3／−0.5／0.3／1.1、z −5.6、y 1.9）。白天燈也開著；店面玻璃朝 118 巷（S），只有天光。
  HIDE='glass|GLOW_|view'
  NOLM='_vc$|ph_potted|prints|screens|_steak$'
  COL=${LCOL:-0.96,0.98,1.0}; WARM=${WCOL:-1.0,0.8,0.55}
  for xz in "-1.6 -1.0" "-1.6 1.4" "1.6 -1.0" "1.6 1.4"; do set -- $xz
    LIGHTS="$LIGHTS;$(python3 -c "print(f'{$1-0.01:.3f},{$1+0.01:.3f},{$2-0.01:.3f},{$2+0.01:.3f},3.11,1,1,${TROFW:-30},0.3,1.2,$COL')")"; done
  for xz in "0.0 3.2" "-1.0 -3.0"; do set -- $xz
    LIGHTS="$LIGHTS;$(python3 -c "print(f'{$1-0.01:.3f},{$1+0.01:.3f},{$2-0.01:.3f},{$2+0.01:.3f},3.11,1,1,${TROFW:-30},1.2,0.3,$COL')")"; done
  LIGHTS="$LIGHTS;$(python3 -c "print('-0.010,0.010,-4.685,-4.665,3.1,1,1,${TUBEW:-24},1.24,0.05,$COL')")"
  for x in -1.3 -0.5 0.3 1.1; do PT="$PT;$x,1.85,-5.6,${HOODW:-9},$WARM,0.08"; done
  SUN="0,30,0"; SKY=${SKY:-1.0}; DAYWB=${DAYWB:-0.98,0.98,1.0}; DAYL=${DAYL:-1.0}; SHELL=S ;;
*) echo "還沒做 CC0 版的店：$SHOP（lane118_shops.py 的 CC0_SHOPS 加進去、這裡加一個 case）"; exit 1 ;;
esac
PT=${PT#;}; LIGHTS=${LIGHTS#;}
/opt/blenv/bin/python tools/blender/env_second/lane118_shops.py -- --shop "$SHOP" --out-dir "$TMP"
cp "$TMP/$NAME.layout.json" "$OUTDIR/$NAME.layout.json"
python3 -c "import json,sys; d=json.load(open(sys.argv[1])); d['out']='assets/models/env/second_ai/$NAME.glb'; json.dump(d,open(sys.argv[2],'w'),ensure_ascii=False,indent=1)" "$TMP/$NAME.json" "$OUTDIR/$NAME.json"
EXTRA=(); [ -n "$LIGHTS" ] && EXTRA+=(--lights "$LIGHTS"); [ -n "$PT" ] && EXTRA+=(--points "$PT")
/opt/blenv/bin/python tools/blender/env_second/lightbake/bake_room.py -- --in "$TMP/$NAME.glb" --out "$OUTDIR/$NAME.glb" \
  --lm "$TMP/lm" --url assets/models/env/second_ai/${NAME}_lm --res "$RES" --samples "$SAMPLES" --hide "$HIDE" --nolm "$NOLM" \
  --sun "$SUN" --sky "$SKY" --daywb $DAYWB "${EXTRA[@]}" --daylights "$DAYL" --smooth 1 --shell "$SHELL"
python3 tools/blender/env_second/lightbake/to_webp.py "$TMP/lm" "$OUTDIR/${NAME}_lm" 90
