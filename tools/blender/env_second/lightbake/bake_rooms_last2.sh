#!/bin/bash
# INTERIOR-AAA-REVIEW-1028 P1 最後兩間沒烘的房間（rooms_glb3d.js；LAWWW2-B 11-07）：205 寢室（方奕廷）、美國臥室 C（學姊）→ 光照烘焙（白天／晚上）→ WebP。repo 根目錄跑：
#   bash tools/blender/env_second/lightbake/bake_rooms_last2.sh [取樣數，預設 512] [房間，預設 "dorm_205 us_bed_c"]
# 遊戲：rooms_glb3d.js 用 Z3.attachRoomGLB，GLB 有 extras.lightmap 就接（不用改程式）。輸出到 OUTDIR（預設 assets/models/env/second_ai）。
#
# dorm_205：和祐廷的房間同一型（dorm_room4.py --only 205）。assets 裡那一個是 11-02 匯出的：天花板 3.0 m、梯子沒有扶手——
#   之後 11-03 DORM-CEIL-1103（天花板 3.4 m）、11-05 DORM-LADDER-HEAD-GRIP-1102 ②（扶手）只重產了 203。這裡照現在的 dorm_room4.py 重產（加 --bakeblock：
#   窗外的對面大樓＋街道，只在烘焙時存在），配置和 assets 的 dorm_205.layout.json 比對：只能差 h（3.0 → 3.4），其他（座位、阻擋、走近點）一樣才繼續。
#   燈、天光、外殼照 bake_dorm_room4.sh（兩盞吸頂燈 35 W 在 3.35 m、洗手間一盞、四組床板下的 LED 燈條 9 W；北窗沒有直射的太陽、天光 ×3、白天燈開七成）。
#   不一樣的地方：205 只有一套東西（Y205_：方奕廷滿桌的盆栽、其他三個室友的東西）一直都在——不藏（--hide 只有玻璃），影子照樣烘進地板；它們本身不烘（--nolm，小零件太多）。
#   不做熄燈那一張（205 沒有睡覺的場景）。
# us_bed_c：3.6×3.4 m、天花板 2.6 m；東牆（+x）一扇窗 1.5×1.2 m（窗景 us_bed_c：窗前一棵大樹）。白天、晚上都進得去（週末 14～21）。
#   燈（模型的燈具 us_bed_c_bulbs）：天花板中間的吸頂燈（燈罩 r 0.2、下緣 2.53 m）→ 往下照的面光源 22 W 0.36 m 見方，在 2.52 m；
#   床頭櫃的檯燈（燈罩在 (−0.25, 0.82～0.98, −1.5)）、書桌的檯燈（燈罩在 (1.52, 1.08, −0.44)）→ 燈罩裡各一顆小點光源。
#   白天：天光從東窗進來（--sky 1.2），燈開一半（--daylights 0.5）；不放太陽（烘進去的太陽整天同一個位置，和美國公寓第四版以後一樣）。
#   試烘（64 取樣）天光 0.8／燈 0.4：白天平均 0.25、比晚上 0.30 暗；窗外方塊用飽和的綠，窗邊的牆、床反光偏綠 → 天光 1.2／燈 0.5、方塊改灰綠。
#   窗外只有天空時，接近地平線最亮的那一圈天光平平地照進來落在對面牆腳（宿舍、日本宿舍學到的）：加幾塊只在烘焙時擋光、反光的方塊
#   （glb_add_boxes.py；輸出前刪掉 --drop BAKEONLY）。房間在二樓（和合租戶同一棟，地面 y −3）：窗前 3～5 m 的樹冠（y 2.5～7、寬 2.4 m，窗景那棵大樹）、
#   12 m 外一排樹林（高到 y 4：擋住仰角 12° 以下）、草地（把天光反上來）。
#   外殼只開東面（--shell E）。不烘：燈罩（GLOW、_bulbs）、頂點色的小東西（_props）、金屬件（_metal）、牆上的紙（_prints、WALL_*_print）、玻璃。
set -e
SAMPLES=${1:-512}
ROOMS=${2:-"dorm_205 us_bed_c"}
OUT=${OUTDIR:-assets/models/env/second_ai}
LB=tools/blender/env_second/lightbake
TMP=$(mktemp -d)
for R in $ROOMS; do
  case $R in
  dorm_205)
    /opt/blenv/bin/python tools/blender/env_second/dorm_room4.py -- --only 205 --out "$TMP/$R.glb" --layout "$TMP/full.json" --room-layout "$TMP/room.json" --bakeblock > "$TMP/gen.log" 2>&1 || { tail -20 "$TMP/gen.log"; exit 2; }
    python3 -I - "$TMP/room.json" assets/models/env/second_ai/dorm_205.layout.json <<'EOF' || exit 3
import json, sys
a, b = json.load(open(sys.argv[1])), json.load(open(sys.argv[2]))
a.pop('h'); b.pop('h')
if a != b: print('配置和 dorm_205.layout.json 不一樣（h 以外）：先確認改了什麼（導航、座位）'); sys.exit(1)
EOF
    HIDE='glass'
    NOLM='tubes|fixtures|dorm_led|dorm_items|dorm_metal|chrome|black|_rod|mirror|shower|sign|bath_outer|BAKEONLY|^Y205_'
    LED='0.03,0.8,1.0,0.88,0.72'; LEDW=${LEDW:-9}
    LIGHTS="0,0,-1.7,-1.7,3.35,1,1,35,0.4,0.4;0,0,0.7,0.7,3.35,1,1,35,0.4,0.4;1.325,1.325,2.6,2.6,3.35,1,1,10,0.22,0.22"
    for X in 1.685 -1.685; do LIGHTS="$LIGHTS;$X,$X,-2.4725,-2.4725,1.64,1,1,$LEDW,$LED;$X,$X,0.1175,0.1175,1.64,1,1,$LEDW,$LED"; done
    /opt/blenv/bin/python $LB/bake_room.py -- --in "$TMP/$R.glb" --out "$OUT/$R.glb" \
      --lm "$TMP/$R" --url assets/models/env/second_ai/${R}_lm --res 1024 --samples "$SAMPLES" --hide "$HIDE" --nolm "$NOLM" \
      --sun 180,${SUNEL:-55},0 --sky "${SKY:-3.0}" --lights "$LIGHTS" --daylights "${DAYL:-0.7}" --smooth 2 --shell N --drop BAKEONLY
    python3 $LB/to_webp.py "$TMP/$R" "$OUT/${R}_lm" 90
    /opt/blenv/bin/python $LB/lm_fix_hidden.py -- --in "$OUT/$R.glb" --out "$OUT/$R.glb" --lm "$OUT/${R}_lm"
    cp "$TMP/room.json" "$OUT/$R.layout.json"
    ;;
  us_bed_c)
    python3 -I $LB/glb_add_boxes.py assets/models/env/second_ai/$R.glb "$TMP/$R.glb" "canopy,5.0,7.0,2.5,7.0,-1.2,1.2,#66705c;treeline,13.0,15.0,-3.0,4.0,-12.0,12.0,#5a6352;ground,1.8,16.0,-3.1,-3.0,-12.0,12.0,#7a8068"
    WARM=1.0,0.86,0.68
    LIGHTS="-0.01,0.01,-0.01,0.01,2.52,1,1,${CEILW:-22},0.36,0.36,$WARM"
    PT="-0.25,0.9,-1.5,${BEDW:-3},$WARM,0.06;1.52,1.08,-0.44,${DESKW:-3},$WARM,0.04"
    /opt/blenv/bin/python $LB/bake_room.py -- --in "$TMP/$R.glb" --out "$OUT/$R.glb" \
      --lm "$TMP/$R" --url assets/models/env/second_ai/${R}_lm --res 1024 --samples "$SAMPLES" --hide 'glass|GLOW' --nolm '_bulbs|_props|_metal|_prints|_print$|BAKEONLY' \
      --sun 180,35,0 --sky "${SKY:-1.2}" --daylights "${DAYL:-0.5}" --lights "$LIGHTS" --points "$PT" --smooth 2 --shell E --drop BAKEONLY
    python3 $LB/to_webp.py "$TMP/$R" "$OUT/${R}_lm" 90
    ;;
  *) echo "不認得的房間 $R"; exit 1;;
  esac
  if [ -z "$OUTDIR" ]; then cp "$TMP/$R.json" $LB/${R}_lm.json; else cp "$TMP/$R.json" "$OUT/${R}_lm.json"; fi   # 試烘（OUTDIR）不蓋 repo 裡的烘焙紀錄
done
rm -rf "${TMP:?}"
echo "done: $ROOMS"
