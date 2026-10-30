#!/bin/bash
# 法律學院圖書館（萬才館；INTERIOR-AAA 第三間，LAWWW-B D111；LAWWW2-B 2026-10-30）：建模 → 光照烘焙（白天／晚上）→ WebP。repo 根目錄跑：
#   bash tools/blender/env_second/lightbake/bake_lawlib.sh [取樣數，預設 512] [輸出資料夾，預設 assets/models/env] [貼圖邊長，預設 1024]
# 輸出：lawlib_interior.glb（多一套 UV＝TEXCOORD_1、extras.lightmap）＋ lawlib_interior_lm_day.webp、_night.webp。
#   遊戲：src/building3d.js 的 attachFormal 看到 GLB 的 extras.lightmap 就接（Z3.roomLightmap；和霖澤館大廳同一套），不用改程式。
# 座標＝配置（src/data/lawlib_layout.js）：x 往東、z 往南（+z＝南牆，窗朝法學院前的廣場）；一樓地板 0、天花板 3.6；二樓地板 4.2、屋頂 7.8。
# 燈（面光源，位置照 lawlib_interior.py 算出來的燈框；燈框本身 ll_light_panel 不烘、照舊自己發光）：
#   一樓：十八片 1.2×0.6 輕鋼架燈（TROF0，貼齊 60 cm 格子）；二樓：書架走道、閱覽區上方的長條燈（LIN）。
#   一樓長閱覽桌：八盞綠色燈罩的桌燈（點光源，燈罩下方 3 cm）。
# 白天：天空＋下午的太陽從南面的窗斜照進來（法學院前的廣場）；北面一樓也有窗（--shell S,N）。白天燈照樣開（圖書館）。
# --nolm（照舊即時光）：書（EXT_mesh_gpu_instancing，--keep-instances 不展開）、書架鐵件、椅子、植物、黃銅、鋼、發光面、燈罩、
#   小東西（黑色、灰色、白色、紙、紅色小零件、輕鋼架、止滑條）：幾千個小零件分不到像素（Café 第一次試烘：椅子展開把貼圖擠滿）。
set -e
SAMPLES=${1:-512}
OUTDIR=${2:-assets/models/env}
RES=${3:-1024}
TMP=$(mktemp -d)
HIDE='ll_glass|glass_rail'
NOLM='book|journal|cover|shelf_steel|L[01]_shelf|chair|seat|leaf|bark|soil|plant|brass|steel|light_panel|lamp_glow|lampshade|glow|screen|tv_glass|gate_led|nosing|tbar|black|grey|white|paper|red|frame|planter|sign_back|doormat'
LIGHTS=$(python3 - <<'EOF'
import json, os
s = open('src/data/lawlib_layout.js', encoding='utf8').read(); J = json.loads(s[s.index('{', s.index('const LAWLIB_LAYOUT=')):s.rindex('}') + 1])
W, D, T, C0, RY = J['W'], J['D'], J['wallT'], J['ceil0'], J['roofY']
XI0, ZI0 = -W / 2 + T / 2, -D / 2 + T / 2
snap = lambda v, o: o + 0.6 * round((v - o) / 0.6)
TROF0 = [(-1.4, -2.0), (1.0, -2.0), (-1.4, 2.0), (1.0, 2.0), (4.6, -1.0), (4.6, 5.8), (-5.4, -1.4), (0.8, 5.6), (-1.4, 5.6), (4.6, 2.6), (-5.4, 1.4), (4.6, -3.2), (1.0, -3.4), (-1.4, -3.4),
         (-5.4, -6.2), (-1.8, -6.2), (1.6, -6.2), (5.2, -6.2)]                      # 照 lawlib_interior.py（改那邊要一起改）
LIN = [(x, z, 0.16, 3.2) for x in (-1.6, 0.0, 1.6, 3.2, 5.4) for z in (-4.4, -0.2)] + [(-4.8, -4.6, 0.16, 2.4), (-4.8, -0.8, 0.16, 2.4)] + \
      [(x, z, 2.4, 0.16) for x in (-0.6, 2.4, 5.4) for z in (4.8, 6.6)] + [(-5.2, 5.0, 0.16, 3.0)]
w0, w1 = os.environ.get('TROFW', '11'), os.environ.get('LINW', '9')
out = []
for (x, z) in TROF0:
    cx, cz = snap(x, XI0), snap(z, ZI0 + 0.3)
    out.append(f'{cx-0.01:.3f},{cx+0.01:.3f},{cz-0.01:.3f},{cz+0.01:.3f},{C0-0.03:.3f},1,1,{w0},1.14,0.54')
for (x, z, w, d) in LIN:
    out.append(f'{x-0.01:.3f},{x+0.01:.3f},{z-0.01:.3f},{z+0.01:.3f},{RY-0.03:.3f},1,1,{float(w1)*max(w,d)/3.2:.2f},{max(w-0.04,0.1):.2f},{max(d-0.04,0.1):.2f}')
print(';'.join(out))
EOF
)
POINTS=$(python3 - <<'EOF'
import json, os
s = open('src/data/lawlib_layout.js', encoding='utf8').read(); J = json.loads(s[s.index('{', s.index('const LAWLIB_LAYOUT=')):s.rindex('}') + 1])
out = []
for tb in J['tables']:
    if not tb.get('lamps'): continue
    y = J['floors'][1]['y'] if tb['lv'] else 0.0
    for i in range(tb['n']):
        sx = tb['x'] - tb['w'] / 2 + tb['w'] * (i + 0.5) / tb['n']
        out.append(f"{sx:.3f},{y + 1.15:.3f},{tb['z']:.3f},{os.environ.get('LAMPW', '4')},1.0,0.82,0.6")   # 燈罩下緣（桌面 0.77＋0.36）往下一點
print(';'.join(out))
EOF
)
/opt/blenv/bin/python tools/blender/lawlib_interior.py -- --out "$TMP/lawlib_plain.glb"
/opt/blenv/bin/python tools/blender/env_second/lightbake/bake_room.py -- --in "$TMP/lawlib_plain.glb" --out "$OUTDIR/lawlib_interior.glb" \
  --lm "$TMP/ll" --url assets/models/env/lawlib_interior_lm --res "$RES" --samples "$SAMPLES" --hide "$HIDE" --nolm "$NOLM" --keep-instances \
  --sun 200,${SUNEL:-38},${SUNW:-1.8} --sky "${SKY:-0.5}" --daywb 0.92,0.88,0.8 --lights "$LIGHTS" --points "$POINTS" --daylights "${DAYL:-0.9}" --smooth 1 --shell S,N
python3 tools/blender/env_second/lightbake/to_webp.py "$TMP/ll" "$OUTDIR/lawlib_interior_lm" 90
/opt/blenv/bin/python tools/blender/env_second/lightbake/lm_fix_hidden.py -- --in "$OUTDIR/lawlib_interior.glb" --out "$OUTDIR/lawlib_interior.glb" --lm "$OUTDIR/lawlib_interior_lm"
cp "$TMP/ll.json" tools/blender/env_second/lightbake/lawlib_interior_lm.json
rm -rf "$TMP"
echo "done: $OUTDIR/lawlib_interior.glb + lawlib_interior_lm_day/night.webp"
