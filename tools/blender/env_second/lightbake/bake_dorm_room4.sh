#!/bin/bash
# 宿舍四人房（玩家的房間：大一 203／經濟系 412／大二 312／大三 507／大四 409，同一個模型換東西；DORM203-LM-1030，LAWWW2-B 2026-10-30；
# 使用者 P0「校內建築室內……廉價手遊感」UA-LAWWW2-1028-01、X125）：建模 → 光照烘焙（白天／晚上）→ WebP。repo 根目錄跑：
#   bash tools/blender/env_second/lightbake/bake_dorm_room4.sh [取樣數，預設 512] [輸出資料夾，預設 assets/models/env/second_ai] [貼圖邊長，預設 1024]
# 輸出：dorm_room4.glb（多一套 UV＝TEXCOORD_1）＋ dorm_room4_lm_day.webp、dorm_room4_lm_night.webp。遊戲：zones3d.js 的 dorm → attachRoomGLB 看到 GLB 的 extras.lightmap 就接
#   （patches/dorm203_lm_1030.patch：attachDormInterior 的補光 TK.bounce 在有光照貼圖的材質上不加——光已經烘焙進去，再加會整片發白）。
# 燈：兩盞圓形吸頂燈（35 W、0.4 m 見方，在燈罩下面）＋洗手間一盞；四組床板底下的 LED 燈條（書桌上方，9 W、暖白；第一次試烘 6 W，離鏡頭近的書桌暗到全黑）。遊戲裡燈罩、燈條一直亮（自發光），所以白天照樣開（--daylights 0.8）。
# 窗：後牆（遊戲 −z＝北）一扇，北窗沒有直射的太陽（--sun 強度 0）：白天是天光從窗戶進來、往門口慢慢暗；外殼只開北面（--shell N），門縫不漏光。
#   天空（Nishita）的太陽位置照樣要放在南邊（180°）：第一次試烘放 0°（北），太陽附近那一圈很亮的天空正對著北窗，門口的地上照出一大塊像陽光的亮斑、整間偏橘。
# 窗外：dorm_room4.py --bakeblock 加對面大樓＋街道（BAKEONLY_，只在烘焙時存在）：第二次試烘只有天空，接近地平線的天光從北窗直直落到 5 m 外的門口地上、整片過曝。
# 洗手間朝前牆、右牆那兩面（dorm_bath_outer，貼著房間的牆、看不到；前牆淡出時才看得到斷面）不烘：烘出來每公尺只有 1 個像素、整面灰，照舊即時光＋補光（和改前一樣白）。
# 每一年不一樣的東西（Y203_／Y412_／Y312_／Y507_／Y409_／Y205_、NAMETAG_、ROOMMATE_KAI：書、筆電、紙箱、海報）烘焙時當作不存在（--hide）：
#   同一張光照貼圖給五個年級用，不能留下某一年的東西的影子；這些東西照舊即時光（和其他房間的小零件一樣）。被子、枕頭（BEDDING_）大部分時候都在，照樣烘。
# 細小零件不烘（--nolm，照舊即時光）：燈罩、燈條、頂點色的小東西、鐵管、鍍鉻、黑色零件、吊桿、鏡子、浴簾、門牌。
set -e
SAMPLES=${1:-512}
OUTDIR=${2:-assets/models/env/second_ai}
RES=${3:-1024}
TMP=$(mktemp -d)
HIDE='glass|^Y203_|^Y412_|^Y312_|^Y507_|^Y409_|^Y205_|^NAMETAG_|^ROOMMATE_'
NOLM='tubes|fixtures|dorm_led|dorm_items|dorm_metal|chrome|black|_rod|mirror|shower|sign|bath_outer|BAKEONLY'
LED='0.03,0.8,1.0,0.88,0.72'; LEDW=${LEDW:-9}
LIGHTS="0,0,-1.7,-1.7,2.95,1,1,35,0.4,0.4;0,0,0.7,0.7,2.95,1,1,35,0.4,0.4;1.8,1.8,2.45,2.45,2.95,1,1,10,0.22,0.22"
for X in 2.585 -2.585; do LIGHTS="$LIGHTS;$X,$X,-2.525,-2.525,1.54,1,1,$LEDW,$LED;$X,$X,-0.1225,-0.1225,1.54,1,1,$LEDW,$LED"; done
/opt/blenv/bin/python tools/blender/env_second/dorm_room4.py -- --out "$TMP/dorm_room4_plain.glb" --layout "$TMP/layout.json" --bakeblock
cmp -s "$TMP/layout.json" assets/models/env/second_ai/dorm_room4.layout.json || { echo '配置和 dorm_room4.layout.json 不一樣：先確認改了什麼（導航、座位）'; exit 3; }
/opt/blenv/bin/python tools/blender/env_second/lightbake/bake_room.py -- --in "$TMP/dorm_room4_plain.glb" --out "$OUTDIR/dorm_room4.glb" \
  --lm "$TMP/d4" --url assets/models/env/second_ai/dorm_room4_lm --res "$RES" --samples "$SAMPLES" --hide "$HIDE" --nolm "$NOLM" \
  --sun 180,${SUNEL:-55},0 --sky "${SKY:-1.0}" --lights "$LIGHTS" --daylights "${DAYL:-0.8}" --smooth 2 --shell N --drop BAKEONLY
python3 tools/blender/env_second/lightbake/to_webp.py "$TMP/d4" "$OUTDIR/dorm_room4_lm" 90
# 後處理（LM-SEAM-1028）：沒分像素、夾在中間烘成全黑的面接旁邊看得到的面的光
/opt/blenv/bin/python tools/blender/env_second/lightbake/lm_fix_hidden.py -- --in "$OUTDIR/dorm_room4.glb" --out "$OUTDIR/dorm_room4.glb" --lm "$OUTDIR/dorm_room4_lm"
cp "$TMP/d4.json" tools/blender/env_second/lightbake/dorm_room4_lm.json
rm -rf "$TMP"
echo "done: $OUTDIR/dorm_room4.glb + dorm_room4_lm_day/night.webp"
