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
SHOP=${1:?cvs}
SAMPLES=${2:-512}
OUT=${OUTDIR:-}
LB=tools/blender/env_second/lightbake
TMP=$(mktemp -d)
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
*) echo "不認得的店 $SHOP（cvs）"; exit 1;;
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
python3 -I - "$TMP/$NAME.json" "$SHA" "$SRC" <<'EOF'
import json, sys
j = json.load(open(sys.argv[1])); j['src'] = sys.argv[3]; j['src_sha256'] = sys.argv[2]
json.dump(j, open(sys.argv[1], 'w'), ensure_ascii=False, indent=1)
EOF
if [ -z "$OUT" ]; then cp "$TMP/$NAME.json" $LB/${NAME}_lm.json; else cp "$TMP/$NAME.json" "$OUT/${NAME}_lm.json"; fi
rm -rf "${TMP:?}"
echo "done: $SHOP → $DST/$NAME.glb（原檔 sha256 $SHA）"
