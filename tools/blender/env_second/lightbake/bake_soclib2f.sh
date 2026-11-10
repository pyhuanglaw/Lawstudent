#!/bin/bash
# 社科院圖書館東側館（SOCLIB-2F-1104，LAWWW2-C 2026-11-04；一樓門廳＋樓梯＋影印休息區、二樓自習室、討論室、走廊）：建模 → 光照烘焙（白天／晚上）→ WebP。repo 根目錄跑：
#   bash tools/blender/env_second/lightbake/bake_soclib2f.sh [取樣數，預設 384] [輸出資料夾，預設 assets/models/env/second_ai] [貼圖邊長，預設 1024]
# 輸出：soclib2f_interior.glb（多一套 UV＝TEXCOORD_1、extras.lightmap）＋ soclib2f_interior_lm_day.webp、_night.webp、soclib2f_interior.json（統計）。
#   遊戲：src/soclib2f3d.js → B3.attachFormal 看到 GLB 的 extras.lightmap 就接（和總圖大廳、宿舍走廊同一套，程式不用改）。
# 燈：天花板的日光燈盤，位置照 soclib2f_interior.py 寫的統計 JSON（lights.panels；一個面光源在發光面下 1 cm、大小和燈盤一樣；燈盤本身不烘）；
#   圖書館白天照樣開燈。功率照面積（1.2×0.6＝40 W）。
# 窗：一樓北面、東面；二樓東面（自習室整排、電梯廳、走廊盡頭、討論室 3）、北面（三間討論室）、南面（南北向走廊盡頭）——北、南、東三面開著（--shell N,S,E），
#   西面（閱覽室那一邊，沒有窗）、屋頂、地板包起來。太陽 110°（羅盤：東南東，配置的 +x＝東）、仰角 35°：從自習室那排窗斜照進來。
# --nolm（照舊即時光）：發光面、頂點色的小東西（插座、置物櫃、公告、門框門片、影印機、沙發）、門框窗框、玻璃、霧面隔板、鋁框、不鏽鋼、螢幕、椅子（instancing，--keep-instances 不展開）。
set -e
SAMPLES=${1:-384}
OUTDIR=${2:-assets/models/env/second_ai}
RES=${3:-1024}
TMP=$(mktemp -d)
NOLM='^L[01]_(light|vc|vcm|frame|glass|frost|steel|alu|screen|exit)$|INST_|_root'
/opt/blenv/bin/python tools/blender/env_second/soclib2f_interior.py -- --out "$TMP/soclib2f_plain.glb"
LIGHTS=$(python3 - "$TMP/soclib2f_plain.json" <<'PY'
import json, sys
J = json.load(open(sys.argv[1])); out = []
for l in J['lights']['panels']:
    W = round(max(10.0, 40.0 * l['w'] * l['d'] / 0.72), 1)
    out.append(f"{l['x']},{l['x']},{l['z']},{l['z']},{l['y'] - 0.01:.3f},1,1,{W},{l['w']},{l['d']}")
print(';'.join(out))
PY
)
/opt/blenv/bin/python tools/blender/env_second/lightbake/bake_room.py -- --in "$TMP/soclib2f_plain.glb" --out "$OUTDIR/soclib2f_interior.glb" \
  --lm "$TMP/sl2" --url assets/models/env/second_ai/soclib2f_interior_lm --res "$RES" --samples "$SAMPLES" --hide "glass|frost" --nolm "$NOLM" \
  --sun "${SUN:-110,35,2.2}" --sky "${SKY:-0.4}" --daywb "${DAYWB:-0.95,0.93,0.88}" --nightwb "${NIGHTWB:-1.0,0.95,0.86}" --lights "$LIGHTS" --smooth 1 --shell N,S,E --keep-instances
python3 tools/blender/env_second/lightbake/to_webp.py "$TMP/sl2" "$OUTDIR/soclib2f_interior_lm" 90
# 後處理（lm_fix_hidden.py）：沒分像素、夾在中間烘成全黑的面改接旁邊看得到的面的光
/opt/blenv/bin/python tools/blender/env_second/lightbake/lm_fix_hidden.py -- --in "$OUTDIR/soclib2f_interior.glb" --out "$OUTDIR/soclib2f_interior.glb" --lm "$OUTDIR/soclib2f_interior_lm"
cp "$TMP/soclib2f_plain.json" "$OUTDIR/soclib2f_interior.json"
cp "$TMP/sl2.json" "$OUTDIR/soclib2f_interior_lm.json"
[ "$OUTDIR" = "assets/models/env/second_ai" ] && mv "$OUTDIR/soclib2f_interior_lm.json" tools/blender/env_second/lightbake/soclib2f_interior_lm.json
rm -rf "$TMP"
echo "done: $OUTDIR/soclib2f_interior.glb + soclib2f_interior_lm_day/night.webp"
