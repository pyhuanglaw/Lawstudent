#!/bin/bash
# AA／BB／CC 新做的店內（aa_support／bb_support）光照烘焙（白天／晚上）→ WebP（INTERIOR-AAA，LAWWW2-B 2026-11-07；lm_audit_1107 第一級）。repo 根目錄跑：
#   bash tools/blender/env_second/lightbake/bake_gg_new.sh <店> [取樣數，預設 512]
#   OUTDIR=<資料夾> 試烘（輸出、烘焙紀錄都寫在那裡，不動 assets）
# LAWWW-B 11-07 14:51：可以直接在 aa_support／bb_support 的原檔上烘——只加第二套 UV、extras.lightmap、拆開共用的材質，不動幾何、節點、座標、配置；
#   原作者以後重新匯出，光照貼圖會不見，要再跑一次這支。這支會把原檔的 sha256 記在烘焙紀錄（<店>_lm.json 的 src_sha256），交件時列「動了誰做的哪個檔」。
# 遊戲：這些店都走 Z3.attachRoomGLB（zones3d.js 的 ggRoom／wzShop），GLB 有 extras.lightmap 就接，不用改程式。
# 共同的做法：
#   - 白天：天光從店面的玻璃進來（外殼只開店面那一面）；不放太陽（店面朝哪邊各店不同、房間在遊戲裡轉過，烘進去的太陽整天同一個位置，和美國公寓一樣）。
#   - 晚上：只有店裡的燈。
#   - 頂點色的小東西、貨架上的商品、金屬件、玻璃、發光的東西照舊即時光（--nolm），照樣擋光：地上的接觸陰影照樣烘進去。
set -e
SHOP=${1:?cvs|yangyang}
SAMPLES=${2:-512}
OUT=${OUTDIR:-}
LB=tools/blender/env_second/lightbake
TMP=$(mktemp -d)
CARD=()
case $SHOP in
cvs)
  # 日和便利店 v2b（BB 製作，bb_support/cvs_interior.glb；公館 G03）：11.4 × 11.2 m、天花板 3.3 m；店面（+z）整面玻璃＋自動門。24 小時，晚上很亮。
  # 燈：天花板 29 條 LED 燈條（cvs_led，0.10 × 2.24 m，在 3.245 m），tube_lights.py 讀出來，每條 14 W（試烘 22 W：白天平均 0.63、最亮的頂到 1.0，天花板燈條附近吃掉）。冷藏櫃的發光（GLOW_cvs_cooler）照樣發光、會照到地上。
  # 烘：地板、天花板、四面牆（WALL_*_vc：頂點色、沒有貼圖 UV，bake_room 自己展第二套 UV）、木作（cvs_wood）。
  # 不烘：貨架和商品（cvs_vc 4.8 萬個三角形、cvs_goods）、金屬（cvs_vm、WALL_front_vm 門框）、燈條、冷藏櫃、螢幕、印刷品、店面貼紙（DECAL_front）、玻璃。
  GLB=bb_support/cvs_interior.glb
  LIGHTS=$(python3 $LB/tube_lights.py assets/models/env/second_ai/$GLB --mesh 'cvs_led$' --w "${LW:-14}" --shrink 0.0)
  HIDE='glass|GLASS_'
  NOLM='^cvs_vc$|cvs_vm|_vm$|cvs_goods|cvs_led|cvs_cooler|cvs_screens|cvs_prints|DECAL_|glass|GLASS_'
  EXTRA=(--sun 180,35,0 --sky "${SKY:-1.0}" --daylights "${DAYL:-0.8}" --shell S)
  ;;
yangyang)
  # 洋洋鹹酥雞 v1c（BB 製作，bb_support/yangyang_interior.glb；公館 G05）：9.2 × 11 m、天花板 3.3 m；店面（+z）左邊開放式炸物櫃台＋玻璃、右邊玻璃門＋落地窗。營業 15–24 點，晚上是主場。
  # 燈：天花板 6 支日光燈管（yy_screens 朝下的那幾片，y 3.25；同一個網格裡另外兩片是直立的菜單螢幕，用高度篩掉），每支 30 W；
  #     桌上 4 盞黃銅圓頂吊燈（桌 1～4 的正上方，燈泡 2.29 m，點光源放在燈罩口 2.2 m）每盞 20 W、右牆 5 盞鵝頸壁燈（x 4.27、2.35 m）每盞 10 W，暖色。
  # 烘：地板、天花板、四面牆（WALL_*_wall 漆面、WALL_*_vc 磚牆和腰牆：頂點色、沒有貼圖 UV，bake_room 自己展第二套 UV）、木作（yy_wood：桌面、椅子、結帳櫃）。
  # 不烘：頂點色的櫃台、廚具、小東西（yy_vc 1 萬個三角形）、炸物（yy_food 3.1 萬）、金屬、不鏽鋼、燈、螢幕、海報印刷、玻璃。
  # 窗外的景：BB 的模型沒有。烘完以後加一張（glb_add_viewcard.py；照 afar：玻璃外 2.5 m、16 × 6.5 m；照片 gg_shop_views.sh yangyang）。烘的時候沒有這張卡，不擋天光。
  GLB=bb_support/yangyang_interior.glb
  LIGHTS=$(python3 $LB/tube_lights.py assets/models/env/second_ai/$GLB --mesh 'yy_screens$' --w "${LW:-30}" --shrink 0.0 | tr ';' '\n' | awk -F, '$5>3' | paste -sd';' -)
  PW=${PW:-20}; SW=${SW:-10}; WC=1.0,0.78,0.52
  PTS="1.2,2.2,2.9,$PW,$WC,0.08;1.2,2.2,0.6,$PW,$WC,0.08;1.1,2.2,-1.7,$PW,$WC,0.08;-2.9,2.2,-4.3,$PW,$WC,0.08"
  for zz in 4.6 3.3 0.3 -1.5 -3.3; do PTS="$PTS;4.27,2.35,$zz,$SW,$WC,0.06"; done
  HIDE='glass|GLASS_'
  NOLM='^yy_vc$|yy_vm|_vm$|yy_food|yy_screens|yy_warm|print|yy_steel|glass|GLASS_'
  EXTRA=(--sun 180,35,0 --sky "${SKY:-1.0}" --daylights "${DAYL:-0.8}" --shell S --points "$PTS")
  CARD=(--name WALL_front_VIEW_yy_window_view --mat yy_window_view --img assets/models/env/second_ai/bb_support/yangyang_view_day.webp --x0 -8 --x1 8 --y0 -1 --y1 5.5 --z 8.0)
  ;;
corner)
  # 轉角唱片 v1c（CC 製作、LAWWW2-B 改原型分組 38f4021e1；bb_support/corner.glb；公館 G12）：8 × 11.5 m、天花板 3.3 m；店面（+z）左邊櫥窗、右邊木門。營業 12–21 點。
  # 燈（照配置 corner_layout.js 的 lights，和 GLB 的 GLOW_* 同一個位置）：天花板兩條軌道上 18 盞投射燈（y 3.0），每盞一個 12 W、40° 的小面光源朝下
  #     （遊戲的投射燈打向牆上的唱片，這裡簡化成往下：地上、唱片箱一圈一圈亮，和 2:30 AM 的軌道燈同一個做法）；3 盞白色圓罩吊燈（燈罩口）每盞 25 W；暖色 3000K。
  # 烘：地板、天花板（cr_concrete）、四面牆（WALL_*_wall_wall、前牆 WALL_front_front_wall）、木作（cr_wood、WALL_*_cr_wood：唱片櫃、唱片箱、層架）。
  # 不烘：唱片和商品（*_goods）、頂點色的小東西和音響（*_vc）、金屬、葉子和海報（*_alpha）、發光、招牌、玻璃；GPU instancing 的東西（--keep-instances：照舊是 instancing、名字和淡出方向不變）。
  # 窗外的景：CC 的模型沒有。烘完以後加一張（照 afar：牆外 2.5 m、16 × 6.5 m；照片 gg_shop_views.sh corner）。
  GLB=bb_support/corner.glb
  SPW=${SPW:-12}; PW=${PW:-25}; WC=1.0,0.82,0.62
  LIGHTS=""
  for x in -1.85 1.75; do for z in 4.5 3.4 2.3 1.2 0.1 -1.0 -2.1 -3.2 -4.3; do LIGHTS="$LIGHTS${LIGHTS:+;}$x,$x,$z,$z,2.95,1,1,$SPW,0.08,0.08,$WC,40"; done; done
  PTS="-0.45,2.2,-1.75,$PW,$WC,0.08;1.0,2.25,-2.9,$PW,$WC,0.08;-0.9,2.15,-4.1,$PW,$WC,0.08"
  HIDE='glass'
  NOLM='goods|_vc$|_vc_inst$|cr_vc|vcm|metal|alpha|emit|sign|glass|_inst$'
  EXTRA=(--sun 180,35,0 --sky "${SKY:-1.0}" --daylights "${DAYL:-0.8}" --shell S --points "$PTS" --keep-instances)
  CARD=(--name WALL_front_VIEW_cr_window_view --mat cr_window_view --img assets/models/env/second_ai/bb_support/corner_view_day.webp --x0 -8 --x1 8 --y0 -1 --y1 5.5 --z 8.25)
  ;;
*) echo "不認得的店 $SHOP（cvs、yangyang、corner）"; exit 1;;
esac
SRC=assets/models/env/second_ai/$GLB
NAME=$(basename "$GLB" .glb)
DST=${OUT:-$(dirname "$SRC")}
SHA=$(sha256sum "$SRC" | cut -d' ' -f1)
cp "$SRC" "$TMP/$NAME.glb"
/opt/blenv/bin/python $LB/bake_room.py -- --in "$TMP/$NAME.glb" --out "$DST/$NAME.glb" \
  --lm "$TMP/$NAME" --url "$(dirname "$SRC")/${NAME}_lm" --res 1024 --samples "$SAMPLES" --hide "$HIDE" --nolm "$NOLM" \
  --lights "$LIGHTS" --smooth 2 "${EXTRA[@]}"
python3 $LB/to_webp.py "$TMP/$NAME" "$DST/${NAME}_lm" 90
if [ "$SHOP" = corner ]; then   # instancing 節點的名字、extras（WALL_／CEIL_、dir、at）照原檔補回去：Blender 重新匯出會叫「corner_interior.N」
  python3 $LB/glb_fix_instnames.py "$TMP/$NAME.glb" "$DST/$NAME.glb"
fi
if [ ${#CARD[@]} -gt 0 ]; then   # 窗外的景（烘完才加：不擋天光、沒有第二套 UV）
  python3 $LB/glb_add_viewcard.py "$DST/$NAME.glb" "$DST/$NAME.glb" "${CARD[@]}"
fi
python3 -I - "$TMP/$NAME.json" "$SHA" "$SRC" <<'EOF'
import json, sys
j = json.load(open(sys.argv[1])); j['src'] = sys.argv[3]; j['src_sha256'] = sys.argv[2]
json.dump(j, open(sys.argv[1], 'w'), ensure_ascii=False, indent=1)
EOF
if [ -z "$OUT" ]; then cp "$TMP/$NAME.json" $LB/${NAME}_lm.json; else cp "$TMP/$NAME.json" "$OUT/${NAME}_lm.json"; fi
rm -rf "${TMP:?}"
echo "done: $SHOP → $DST/$NAME.glb（原檔 sha256 $SHA）"
