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
#   - 外殼只開北面（--shell N）：門縫、牆角不漏天光；下面那一片外殼往北多 1 m，等於窗外陽台的地板（暗）。
# --hide：窗玻璃。
# --nolm（照舊即時光）：燈的發光面、筆電螢幕、頂點色的小東西（jp_room_props：檯燈、筆電、筆筒、盆栽、鞋、熱水壺、行李箱……上千個小島，
#   排不進一張貼圖——總圖 B1 11-02 的教訓）、金屬（窗框、陽台欄杆、檯燈臂）、書櫃的書、踢腳板和窗台那些細條（trim）、海報、冷氣、掛勾上的外套。
set -e
SAMPLES=${1:-512}
OUTDIR=${2:-assets/models/env/second_ai}
RES=${3:-1024}
TMP=$(mktemp -d)
PLAIN="$TMP/jp_room_plain.glb"
git cat-file -p 4b967f46d3684e2214ef81a8389d8bf0b87de0a8 > "$PLAIN"
HIDE='glass'
NOLM='tubes|warm|screens|props|metal|books|frame|rail|_ac$|E_cloth|trim|print'
LCOL=${LCOL:-1.0,0.95,0.88}
LIGHTS="0,0,-0.4,-0.4,2.40,1,1,${CEILW:-30},0.4,0.4,$LCOL"
POINTS="0,2.30,-0.4,${UPW:-4},$LCOL;-0.97,1.10,-1.05,${LAMPW:-3},1.0,0.82,0.6"
/opt/blenv/bin/python tools/blender/env_second/lightbake/bake_room.py -- --in "$PLAIN" --out "$OUTDIR/jp_room.glb" \
  --lm "$TMP/jp" --url assets/models/env/second_ai/jp_room_lm --res "$RES" --samples "$SAMPLES" --hide "$HIDE" --nolm "$NOLM" \
  --sun 180,${SUNEL:-40},0 --sky "${SKY:-1.0}" --lights "$LIGHTS" --points "$POINTS" --daylights "${DAYL:-0.4}" --smooth 2 --shell N
python3 tools/blender/env_second/lightbake/to_webp.py "$TMP/jp" "$OUTDIR/jp_room_lm" 90
/opt/blenv/bin/python tools/blender/env_second/lightbake/lm_fix_hidden.py -- --in "$OUTDIR/jp_room.glb" --out "$OUTDIR/jp_room.glb" --lm "$OUTDIR/jp_room_lm"
if [ "$OUTDIR" = "assets/models/env/second_ai" ]; then cp "$TMP/jp.json" tools/blender/env_second/lightbake/jp_room_lm.json; else cp "$TMP/jp.json" "$OUTDIR/jp_room_lm.json"; fi   # 試烘到別的資料夾時不覆蓋 repo 裡定案那一份
rm -rf "$TMP"
echo "done: $OUTDIR/jp_room.glb + jp_room_lm_day/night.webp"
