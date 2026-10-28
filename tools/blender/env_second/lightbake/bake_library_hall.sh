#!/bin/bash
# 總圖大廳（一樓大廳、中庭、帝國式大樓梯、二樓自習區與東翼；LIB-HALL-LM-1028，LAWWW2-C 2026-10-28；使用者 P0「校內建築室內……廉價手遊感」）：建模 → 光照烘焙（白天／晚上）→ WebP。repo 根目錄跑：
#   bash tools/blender/env_second/lightbake/bake_library_hall.sh [取樣數，預設 512] [輸出資料夾，預設 assets/models/env] [貼圖邊長，預設 1024]
# 輸出：library_interior.glb（多一套 UV＝TEXCOORD_1）＋ library_interior_lm_day.webp、library_interior_lm_night.webp。遊戲：library3d.js → B3.attachFormal 看到 GLB 的 extras.lightmap 就接（程式不用改）。
# 窗：正面（南）兩層樓高的玻璃帷幕、西牆每 2.4 m 一扇窗（兩層）、大樓梯平台上方北牆的大窗——外殼包東、上、下（--shell S,W,N＝這三面開著）。
#   屋頂整片包黑殼，門廳上方、中庭（大樓梯）上方的天窗（lb_skylight，發光面）只在白天那一張發光（--dayemit），晚上是暗的。
# 燈（每盞一個面光源或點光源；發光面本身不烘）：二樓兩翼屋頂的燈板 2×4×2、一樓兩翼樓板下的崁燈 2×5×2、連廊樓板下的崁燈 4、中庭天窗樑上的筒燈 2×3、
#   二樓自習區長桌的檯燈 4×4（偏暖、小的面光源，桌上一圈光）、中庭四根柱子二樓那一段的黃銅壁燈（往上打，點光源）、大樓梯平台北牆窗戶兩邊的壁燈（點光源）。
# --nolm（照舊即時光）：發光面、植物、頂點色的小東西（書、雜誌、新的擺設）、門框窗框（lb_frame）、黃銅、不鏽鋼、螢幕、二樓的檯燈燈罩和椅子（幾百個小方塊）。
set -e
SAMPLES=${1:-512}
OUTDIR=${2:-assets/models/env}
RES=${3:-1024}
TMP=$(mktemp -d)
NOLM='light_panel|skylight|lampglow|exitglow|leaf|bark|soil|lb_vc|lb_frame|lb_brass|lb_steel|lb_screen|L1_lb_lampshade|L1_lb_wood_light'
WARM='1.0,0.82,0.62'
# 燈的高度：比發光面低 1～2 cm（bake_room.py 再往下 1 cm）——燈和發光面在同一個平面時，光被發光面自己擋住（第一次校正：二樓自習區的燈板放在 9.6＝屋頂，地板烘出來全黑）
LIGHTS="5.6,12.0,-8.5,8.3,9.58,2,4,${PANEL:-20},1.2,0.6;-12.0,-5.6,-8.5,8.3,9.58,2,4,${PANEL:-20},1.2,0.6"
LIGHTS="$LIGHTS;5.4,11.8,-9.0,9.0,4.69,2,5,${DOWN:-14},0.28,0.28;-11.8,-5.4,-9.0,9.0,4.69,2,5,${DOWN:-14},0.28,0.28;-4.8,4.8,0.4,0.4,4.69,4,1,${DOWN:-14},0.28,0.28"
LIGHTS="$LIGHTS;-3.4,3.4,-8.2,-1.0,9.29,2,3,${CORE:-22},0.15,0.15"   # 中庭天窗兩側樑上的六盞筒燈（library_interior.py 的 L1_corespot）
LIGHTS="$LIGHTS;-6.54,6.54,1.9,8.5,9.29,2,3,${LOBBY:-22},0.15,0.15"   # 門廳天窗最外側兩根樑上的六盞筒燈（L1_lobbyspot：x ±3.27、z 3.0／5.2／7.4）
for T in "-8.2,-6.8" "-8.2,-3.8" "-8.6,3.0" "-8.6,6.6"; do x=${T%,*}; z=${T#*,}
  LIGHTS="$LIGHTS;$(python3 -c "print(f'{$x-2.1:.2f},{$x+2.1:.2f},$z,$z,6.115,4,1,${DESK:-3},0.2,0.2,$WARM')")"
done
POINTS=""
for P in "-4.75,7.45,1.4" "4.75,7.45,1.4" "-4.75,7.45,5.4" "4.75,7.45,5.4"; do POINTS="$POINTS;$P,${SCONCE:-28},$WARM"; done
for P in "-3.45,4.65,-8.77" "3.45,4.65,-8.77"; do POINTS="$POINTS;$P,${LAND:-15},$WARM"; done
POINTS=${POINTS#;}
/opt/blenv/bin/python tools/blender/library_interior.py -- --out "$TMP/library_plain.glb"
/opt/blenv/bin/python tools/blender/env_second/lightbake/bake_room.py -- --in "$TMP/library_plain.glb" --out "$OUTDIR/library_interior.glb" \
  --lm "$TMP/lb" --url assets/models/env/library_interior_lm --res "$RES" --samples "$SAMPLES" --hide glass --nolm "$NOLM" \
  --sun "${SUN:-200,45,2.2}" --sky "${SKY:-0.15}" --dayemit "lb_skylight=${SKYLIGHT:-1.5}" --daywb "${DAYWB:-0.85,0.8,0.72}" --nightwb "${NIGHTWB:-1.0,0.92,0.80}" --lights "$LIGHTS" --points "$POINTS" --smooth 1 --shell S,W,N
python3 tools/blender/env_second/lightbake/to_webp.py "$TMP/lb" "$OUTDIR/library_interior_lm" 90
# 後處理（LM-SEAM-1028，lm_fix_hidden.py）：沒分像素、夾在中間烘成全黑的面改接旁邊看得到的面的光——牆段 T 形接頭露縫時看不出來，門洞、樓梯間開口的側面也是牆的亮度
/opt/blenv/bin/python tools/blender/env_second/lightbake/lm_fix_hidden.py -- --in "$OUTDIR/library_interior.glb" --out "$OUTDIR/library_interior.glb" --lm "$OUTDIR/library_interior_lm"
cp "$TMP/lb.json" "$OUTDIR/library_interior_lm.json"
[ "$OUTDIR" = "assets/models/env" ] && mv "$OUTDIR/library_interior_lm.json" tools/blender/env_second/lightbake/library_interior_lm.json
rm -rf "$TMP"
# 烘完自己檢查（lm_probe.py）：重點位置的亮度不能低於下限（白天、晚上；約是校正版的一半）。第一次校正烘焙二樓木地板、一樓天花板、樓梯踏面整面全黑，log 的平均亮度看不出來
python3 tools/blender/env_second/lightbake/lm_probe.py "$OUTDIR/library_interior.glb" "$OUTDIR/library_interior_lm" '[["1F 門廳地板",0,0,4.0,"up",0.6,0.2],["中間那一跑第 6 階踏面",0,1.0,-2.14,"up",0.4,0.2],["平台",0,2.5,-6.8,"up",0.5,0.2],["1F 西翼地板",-8.4,0,0.4,"up",0.2,0.18],["1F 東翼地板",8.4,0,-2.0,"up",0.2,0.2],["2F 西翼自習區地板",-8.4,5.0,-5.3,"up",0.3,0.25],["2F 東翼地板",8.4,5.0,-4.0,"up",0.4,0.3],["2F 連廊地板",0,5.0,0.4,"up",0.5,0.3],["1F 西翼天花板（樓板底面）",-8.4,4.7,-2.0,"down",0.08,0.08]]'
echo "done: $OUTDIR/library_interior.glb + library_interior_lm_day/night.webp"
