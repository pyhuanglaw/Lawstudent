#!/bin/bash
# 總圖 B1 自習室・討論室・影印中心（遊戲 library_b1 區域）光照烘焙（白天／晚上）→ WebP。repo 根目錄跑：
#   bash tools/blender/env_second/lightbake/bake_library_b1.sh [取樣數，預設 512] [輸出資料夾，預設 assets/models/env/second_ai] [貼圖邊長，預設 1024]
# 歷史：LAWWW2（帳號 A）11-02 寫的第一版照 10-23 版的模型（blob 53dfdbeb，x −12～12）寫死燈位，試烘兩版、沒交件；之後模型改成 4.1 版
#   （BB_242，使用者確認 ART_APPROVED；x −22～22、z −13～13、西牆外有下沉中庭），燈位全換了。LAWWW2-B 11-07 改寫（lm_audit_1107 第二級）：
#   - 輸入：遊戲裡正在用的 4.1 版 library_b1.glb（git blob 87f1da5e，開發分支同一個檔）——每次都從這個 blob 開始，不會把光照 UV 疊兩次。
#   - 燈位從模型讀（mesh_lights.py）：日光燈的發光面 library_b1_tubes（131 支）、檯燈燈罩下的亮片 library_b1_warm（76 盞）。配置再改版也不用改這支。
# 遊戲：library_b1_3d.js 用 Z3.attachRoomGLB 接正式模型，看到 extras.lightmap 就接（Z3.roomLightmap），不用改程式。
# 燈：
#   - 日光燈：每支一個朝下的面光源（大小＝發光面 1.16×0.24 m），燈下 0.9 m 一顆點光源（面光源只往下照，天花板只吃得到地板反彈的光，整片暗；總圖 3F 10-31 的教訓）。
#   - 檯燈：亮片下面 3 cm 一顆暖黃點光源。
#   - 中庭天光：西牆玻璃外的下沉中庭，上面的 GLOW_library_b1_courtsky（4.45 m 高的發光面）只在白天那一張發光（--dayemit），晚上不亮。
#     西面不包黑殼（--shell W），其他五面包；沒有太陽、沒有天空（--sky 0）：白天比晚上多的只有中庭進來的光。
# 瓦數（11-07 試烘定的）：試烘 128 取樣、日光燈 10 W＋燈下 8 W：白天／晚上 0.52／0.52（總圖 3F 0.31、社科圖 0.40）→ 日光燈 4.7 W、燈下 3.8 W、檯燈 3 W、中庭 3：
#   512 正式 0.38／0.38、過曝 0%。白天、晚上整體差不多：中庭的天光只照亮西牆玻璃邊那一塊（下沉中庭本來就這樣）。
# 只烘地板、天花板、柱子、牆（牆面、護牆板、木護牆板）、木牆板；其他（桌椅、檯燈、書架、隔板、櫃台、影印機、印刷品、玻璃……）照舊即時光。
# 玻璃、霧面玻璃烘焙時藏起來（--hide），照樣輸出。桌椅、檯燈是 GPU instancing（--keep-instances：不展開、照舊寫回 EXT_mesh_gpu_instancing）。
set -e
SAMPLES=${1:-512}
OUTDIR=${2:-assets/models/env/second_ai}
RES=${3:-1024}
LB=tools/blender/env_second/lightbake
TMP=$(mktemp -d)
PLAIN="$TMP/library_b1_plain.glb"
git cat-file -p 87f1da5e2805d0109c1d5bcaf7ffd37cf670f33b > "$PLAIN"
HIDE='glass|frost'
NOLM="^(?!(library_b1_floorm|library_b1_ceiling|library_b1_columns|library_b1_woodpanels|WALL_[A-Z0-9]+_(wall|wain|woodwain))\$)"
COL=${LCOL:-0.95,0.98,1.0}
# 11-08 BB-B B1 GPU 判定（CC/logs/B1_gpu_7206）：南半邊的影印中心、討論室那一帶比使用者驗收的 4.1 版（即時光＋天花板自發光）暗三成多
#   （copy_door 166→115、disc1_wall 153→100、disc2_wall 157→97），燈板旁的天花板深灰。那一帶的日光燈本來就比自習室 A 區稀。
#   → 南半邊（z > SOUTHZ，預設 5：南走廊、討論室、影印中心、南邊兩間小房間）日光燈 ×SOUTHT（預設 2.0）、燈下往上打天花板的點光源 ×SOUTHU（預設 2.5）。
#   自習室 A 區（z < 4.7）、東北那一間不動（BB-B：自習室 A 區不要改回去）。
# 會議廳（x −8～8、z −2.4～4.7，關著、沒有燈，從上面看像黑洞；BB-B LM2_cloud P3）：天花板下四顆 HALLW（預設 0.8 W）的點光源，地板是暗灰、不是黑。
SOUTHZ=${SOUTHZ:-5}; SOUTHT=${SOUTHT:-2.0}; SOUTHU=${SOUTHU:-2.5}; HALLW=${HALLW:-0.8}
zscale() { python3 -c 'import sys
mode, zc, k = sys.argv[1], float(sys.argv[2]), float(sys.argv[3]); out = []
for e in sys.stdin.read().strip().split(";"):
    v = e.split(",")
    if mode == "cells": z, wi = (float(v[2]) + float(v[3])) / 2, 7
    else: z, wi = float(v[2]), 3
    if z > zc: v[wi] = "%g" % (float(v[wi]) * k)
    out.append(",".join(v))
print(";".join(out))' "$@"; }
LIGHTS=$(python3 $LB/mesh_lights.py "$PLAIN" library_b1_tubes cells --w "${TUBEW:-4.7}" --y -0.03 --col "$COL" | zscale cells "$SOUTHZ" "$SOUTHT")
UP=$(python3 $LB/mesh_lights.py "$PLAIN" library_b1_tubes up --w "${UPW:-3.8}" --y -0.9 --col "$COL" | zscale points "$SOUTHZ" "$SOUTHU")
HALL="-5,2.6,0,$HALLW,1.0,0.92,0.82;5,2.6,0,$HALLW,1.0,0.92,0.82;-5,2.6,3,$HALLW,1.0,0.92,0.82;5,2.6,3,$HALLW,1.0,0.92,0.82"
POINTS="$UP;$(python3 $LB/mesh_lights.py "$PLAIN" library_b1_warm points --w "${LAMPW:-3}" --y -0.03 --col 1.0,0.82,0.6);$HALL"
echo "lights $(echo "$LIGHTS" | tr ';' '\n' | wc -l), points $(echo "$POINTS" | tr ';' '\n' | wc -l)"
/opt/blenv/bin/python $LB/bake_room.py -- --in "$PLAIN" --out "$OUTDIR/library_b1.glb" \
  --lm "$TMP/b1" --url assets/models/env/second_ai/library_b1_lm --res "$RES" --samples "$SAMPLES" --hide "$HIDE" --nolm "$NOLM" \
  --sun 0,30,0 --sky 0 --nightsky 0 --dayemit "GLOW_library_b1_courtsky=${SKYW:-3}" --lights "$LIGHTS" --points "$POINTS" --daylights 1.0 --smooth 1 --shell W --keep-instances
python3 $LB/to_webp.py "$TMP/b1" "$OUTDIR/library_b1_lm" 90
/opt/blenv/bin/python $LB/lm_fix_hidden.py -- --in "$OUTDIR/library_b1.glb" --out "$OUTDIR/library_b1.glb" --lm "$OUTDIR/library_b1_lm"
python3 - "$TMP/b1.json" "$PLAIN" <<'PY'
import hashlib, json, sys
p = sys.argv[1]; d = json.load(open(p)); d['src'] = 'assets/models/env/second_ai/library_b1.glb（4.1 版，git blob 87f1da5e）'; d['src_sha256'] = hashlib.sha256(open(sys.argv[2], 'rb').read()).hexdigest(); json.dump(d, open(p, 'w'), ensure_ascii=False, indent=1)
PY
if [ "$OUTDIR" = "assets/models/env/second_ai" ]; then cp "$TMP/b1.json" $LB/library_b1_lm.json; else cp "$TMP/b1.json" "$OUTDIR/library_b1_lm.json"; fi   # 試烘到別的資料夾時不覆蓋 repo 裡定案那一份
echo "done: $OUTDIR/library_b1.glb + library_b1_lm_day/night.webp"
