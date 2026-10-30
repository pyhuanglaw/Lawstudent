#!/bin/bash
# 社科院圖書館（辜先生紀念圖書館一樓開架閱覽室；SOCLIB-LM-1030，LAWWW-B 10-30 派工、D99 經濟系那一年念書的地方；LAWWW2-B 2026-10-30）：建模 → 光照烘焙（白天／晚上）→ WebP。repo 根目錄跑：
#   bash tools/blender/env_second/lightbake/bake_soclib.sh [取樣數，預設 512] [輸出資料夾，預設 assets/models/env/second_ai] [貼圖邊長，預設 1024]
# 輸出：soclib_interior.glb（多一套 UV＝TEXCOORD_1、extras.lightmap）＋ soclib_interior_lm_day.webp、_night.webp（＋soclib_interior.json 統計）。
#   遊戲：soclib3d.js 用 Z3.attachRoomGLB 接正式模型，看到 GLB 的 extras.lightmap 就接（和 Café 同一套），不用改程式；天窗（--dayemit）晚上由 Z3.roomLightmap 調暗（RT-NIGHT-1028）。
# 座標＝配置（src/data/soclib_layout.js）：30 × 22 m、天花板 5.6 m；x 往東、z 往南（+z＝南牆：入口、服務台）；北牆、西牆是玻璃帷幕（--shell N,W＝這兩面開著）。
# 燈（位置照 soclib_interior.py 寫進統計 JSON 的 lights：down 筒燈、up 荷葉上照燈、lamps 閱覽桌檯燈頭）：
#   筒燈＝面光源 0.13 m 見方往下照；荷葉上照燈＝荷葉頂面上方 0.35 m 的點光源（葉子擋住往下的光，只照天花板和四周）；檯燈＝燈頭下方的小面光源（暖色）。
# 白天：天光＋下午的太陽（方位 200°）從西面、北面的玻璃帷幕進來；圓形天窗（soclib_skylight）只在白天那一張發光（--dayemit）。白天燈照樣開（圖書館）。
# --nolm（照舊即時光）：竹書架、長桌、椅子、書（幾千本）、金屬、白色小零件、窗框、發光面、螢幕、招牌板面。
set -e
SAMPLES=${1:-512}
OUTDIR=${2:-assets/models/env/second_ai}
RES=${3:-1024}
TMP=$(mktemp -d)
NOLM='bamboo|books|chair_seats|skylights|metal|white|mull|black|downlight|uplight|lamps|screens|steel|glass|SIGN_FACE'
/opt/blenv/bin/python tools/blender/env_second/soclib_interior.py -- --out "$TMP/soclib_plain.glb"
python3 -c "import json,sys; d=json.load(open(sys.argv[1])); d['out']='assets/models/env/second_ai/soclib_interior.glb'; json.dump(d,open(sys.argv[2],'w'),ensure_ascii=False,indent=1)" "$TMP/soclib_plain.json" "$OUTDIR/soclib_interior.json"   # 統計（三角形、燈的位置）
read -r LIGHTS POINTS < <(python3 - "$TMP/soclib_plain.json" <<'EOF'
import json, os, sys
L = json.load(open(sys.argv[1]))['lights']; H = L['H']
dw, uw, lw = os.environ.get('DOWNW', '8'), os.environ.get('UPW', '30'), os.environ.get('LAMPW', '3')
lights = [f'{x-0.01:.3f},{x+0.01:.3f},{z-0.01:.3f},{z+0.01:.3f},{H-0.008:.3f},1,1,{dw},0.13,0.13,1.0,0.93,0.82' for (x, z) in L['down']]
lights += [f'{x-0.01:.3f},{x+0.01:.3f},{z-0.01:.3f},{z+0.01:.3f},1.150,1,1,{lw},0.05,0.3,1.0,0.82,0.62' for (x, z) in L['lamps']]
points = [f'{x:.3f},{y+0.35:.3f},{z:.3f},{uw},1.0,0.86,0.68' for (x, y, z) in L['up']]
print(';'.join(lights), ';'.join(points))
EOF
)
/opt/blenv/bin/python tools/blender/env_second/lightbake/bake_room.py -- --in "$TMP/soclib_plain.glb" --out "$OUTDIR/soclib_interior.glb" \
  --lm "$TMP/sl" --url assets/models/env/second_ai/soclib_interior_lm --res "$RES" --samples "$SAMPLES" --hide glass --nolm "$NOLM" \
  --sun "${SUN:-200,38,2.0}" --sky "${SKY:-0.6}" --dayemit "soclib_skylight=${SKYLIGHT:-1.0}" --daywb 0.92,0.88,0.8 --lights "$LIGHTS" --points "$POINTS" --daylights "${DAYL:-0.9}" --smooth 1 --shell N,W
python3 tools/blender/env_second/lightbake/to_webp.py "$TMP/sl" "$OUTDIR/soclib_interior_lm" 90
/opt/blenv/bin/python tools/blender/env_second/lightbake/lm_fix_hidden.py -- --in "$OUTDIR/soclib_interior.glb" --out "$OUTDIR/soclib_interior.glb" --lm "$OUTDIR/soclib_interior_lm"
cp "$TMP/sl.json" tools/blender/env_second/lightbake/soclib_interior_lm.json
