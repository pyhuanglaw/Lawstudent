#!/bin/bash
# 日本交換那一學期的宿舍房間（jp_room 區域，jp_room.glb；jp_dorm.py，配置 jp_room.layout.json／src/data/jp_dorm_layouts.js；
# INTERIOR-AAA-REVIEW-1028 第 5 節 P1「全部室內」；LAWWW 11-02 04:40 排的順序第二項〔D99 第二項寒暑假日本，玩家會待在這間〕；LAWWW2（帳號 A）2026-11-02）：
#   光照烘焙（白天／晚上）→ WebP。repo 根目錄跑：
#   bash tools/blender/env_second/lightbake/bake_jp_room.sh [取樣數，預設 512] [輸出資料夾，預設 assets/models/env/second_ai] [貼圖邊長，預設 1024]
# 輸入：烘焙前、遊戲裡正在用的 jp_room.glb（git blob 4b967f46，LAWWW2-C 10-21；開發分支同一個檔）——每次都從這個 blob 開始，不會把光照 UV 疊兩次；
#   不從 jp_dorm.py 重做（總圖 B1 11-02 的教訓：重做出來和部署中的檔不一樣，配置、導航不能動）。
# 遊戲：src/jp_dorm3d.js 用 Z3.attachRoomGLB 接正式模型，看到 extras.lightmap 就接（Z3.roomLightmap），不用改程式。
# 座標＝遊戲 jp_room 區域：x −1.4～1.4、z −2.3～2.3，天花板 2.5 m。窗在北牆（z −2.3，玻璃 x ±1.06、y 0.81～2.29），外面一道陽台欄杆；門在南牆靠西。
# 燈：
#   - 圓形吸頂燈（jp_room_tubes，(0, 2.45, −0.4)、直徑 0.44 m）：燈罩下面 0.4 m 見方往下照的面光源＋燈罩下 0.15 m 一顆小點光源（燈罩是霧面的，天花板照得到一圈）。
#     遊戲的點光源照這個位置（jp_dorm3d.js：(0, H−0.35, −0.4)、0xfff2e0）。
#   - 書桌的伸縮臂檯燈（jp_room_warm，燈罩下面亮的那一片 (−0.97, 1.13, −1.05)）：往下 3 cm 一顆暖黃點光源。
#   - 白天：北窗沒有直射的太陽（--sun 強度 0；天空的太陽位置照樣放南邊 180°——宿舍四人房 10-30 的教訓：放北邊，太陽附近那一圈很亮的天空正對北窗）；
#     天光從窗戶進來；燈開四成（遊戲白天檯燈、吸頂燈的發光面是晚上的 0.35）。
#   - 外殼只開北面（--shell N）：門縫、牆角不漏天光。
#   - 白天那一張超過 0.9 的亮度平滑壓到最多 1.4（--knee，和美國公寓一樣）。
# 試烘（11-02，64 取樣、512²；地板亮度＝lm_probe 的值，白天／晚上）：
#   1：天光 1.0、窗外只有天空 → 白天整片 2.0（過曝）。
#   2：天光 0.12 → 白天門口 1.33、窗前 0.32：接近地平線最亮的那一圈天光平平地照進來，落在房間最裡面；晚上門口 0.87 也比燈下亮（燈罩下 0.1 m 的點光源半徑 6 cm，天花板一個亮點、整片反射）。
#   3：加窗外的景（地面、仰角 11° 的遠景、兩棟房子、一棵樹）、天光 0.3 → 白天門口照舊 1.41。
#   4：遠景提高到 16°、加陽台地板和樓上陽台的底板；燈罩下的點光源改 2 W、往下 0.2 m、半徑 0.2 m → 晚上燈下 0.79、門口 0.3（正常）；白天 0.2～0.4（太暗）。
#   5：天光 1.0 → 白天燈下 0.58、整體比晚上暗。
#   6（定案）：天光 2.4、吸頂燈 32 W → 白天房間中間 0.8～1.0、窗前地上 0.2～0.3（窗台擋住）、門口 0.4～0.6；晚上燈下 0.85、門口 0.3。
# --hide：窗玻璃。
# 彩度減半（to_webp.py 第 4 個參數）：木地板、木門、木衣櫃互相反射，白色衣櫃門的光照貼圖偏橘（第六版遊戲內白天衣櫃、門中段一塊橘色）。
# --nolm（照舊即時光）：被子、枕頭（jp_room_cloth：第六版烘出來灰色、一塊一塊，白被子看起來髒）、燈的發光面、筆電螢幕、頂點色的小東西（jp_room_props：檯燈、筆電、筆筒、盆栽、鞋、熱水壺、行李箱……上千個小島，
#   排不進一張貼圖——總圖 B1 11-02 的教訓）、金屬（窗框、陽台欄杆、檯燈臂）、書櫃的書、踢腳板和窗台那些細條（trim）、海報、冷氣、掛勾上的外套。
set -e
SAMPLES=${1:-512}
OUTDIR=${2:-assets/models/env/second_ai}
RES=${3:-1024}
TMP=$(mktemp -d)
PLAIN="$TMP/jp_room_plain.glb"
git cat-file -p 4b967f46d3684e2214ef81a8389d8bf0b87de0a8 > "$TMP/blob.glb"
# 窗外的景（只在烘焙時有，BAKEONLY_：--nolm、--drop）：照 jp_view.py 的窗景（窗口離地 4.6 m＝房間地板在地面上 3.05 m）：
#   地面（草地、田）y −3.05、往北 90 m；遠處的山和村子、樹當作一道 300 m 外、仰角約 16° 的帶子；左前方一棟白牆兩層樓、右前方一棟米色的、右前方一棵樹；
#   窗外陽台的地板（水泥，淺灰）、樓上陽台的底板（外殼往北多出來的那 1 m 本來是黑的：換成淺灰的水泥底板）。
#   為什麼：11-02 第二次試烘（天光 0.12，窗外只有天空）白天門口的地上 1.33、窗前 0.32——接近地平線那一圈最亮的天光平平地照進來，落在房間最裡面。
FARH=${FARH:-83}
BOXES=${BOXES:-"ground,-60,60,-3.15,-3.05,-90,-2.6,#6f7d55;far,-420,420,-3.05,$FARH,-306,-300,#56634f;house_w,-20,-9,-3.05,3.9,-24,-14,#d6d2c6;house_e,9,17,-3.05,3.4,-30,-20,#c8b799;tree_e,8,13,0,5,-17,-12,#4e6b3c;balcony,-1.45,1.45,-0.03,0,-3.25,-2.42,#9c9a94;above,-2.4,2.4,2.52,2.54,-3.3,-2.42,#a8a6a0"}
python3 tools/blender/env_second/lightbake/glb_add_boxes.py "$TMP/blob.glb" "$PLAIN" "$BOXES"
HIDE='glass'
NOLM='tubes|warm|screens|props|metal|books|frame|rail|_ac$|cloth|trim|print|BAKEONLY'
LCOL=${LCOL:-1.0,0.95,0.88}
LIGHTS="0,0,-0.4,-0.4,2.40,1,1,${CEILW:-32},0.4,0.4,$LCOL"
POINTS="0,2.20,-0.4,${UPW:-2},$LCOL,0.2;-0.97,1.10,-1.05,${LAMPW:-3},1.0,0.82,0.6"
/opt/blenv/bin/python tools/blender/env_second/lightbake/bake_room.py -- --in "$PLAIN" --out "$OUTDIR/jp_room.glb" \
  --lm "$TMP/jp" --url assets/models/env/second_ai/jp_room_lm --res "$RES" --samples "$SAMPLES" --hide "$HIDE" --nolm "$NOLM" \
  --sun 180,${SUNEL:-40},0 --sky "${SKY:-2.4}" --lights "$LIGHTS" --points "$POINTS" --daylights "${DAYL:-0.4}" --smooth 2 --shell N --drop BAKEONLY --knee "${KNEE:-0.9,1.4}"
python3 tools/blender/env_second/lightbake/to_webp.py "$TMP/jp" "$OUTDIR/jp_room_lm" 90 "${SAT:-0.5}"
/opt/blenv/bin/python tools/blender/env_second/lightbake/lm_fix_hidden.py -- --in "$OUTDIR/jp_room.glb" --out "$OUTDIR/jp_room.glb" --lm "$OUTDIR/jp_room_lm"
if [ "$OUTDIR" = "assets/models/env/second_ai" ]; then cp "$TMP/jp.json" tools/blender/env_second/lightbake/jp_room_lm.json; else cp "$TMP/jp.json" "$OUTDIR/jp_room_lm.json"; fi   # 試烘到別的資料夾時不覆蓋 repo 裡定案那一份
rm -rf "$TMP"
echo "done: $OUTDIR/jp_room.glb + jp_room_lm_day/night.webp"
