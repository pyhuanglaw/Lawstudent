#!/bin/bash
# 博思教學館室內（BOYA-LM-1030；LAWWW-B 10-30 派工，D99 經濟系那一年最常待的室內；LAWWW2-B 2026-10-30）：建模 → 光照烘焙（白天／晚上）→ WebP。repo 根目錄跑：
#   bash tools/blender/env_second/lightbake/bake_boya.sh [取樣數，預設 512] [輸出資料夾，預設 assets/models/env/second_ai] [貼圖邊長，預設 1024]
# 輸出：boya_interior.glb（多一套 UV＝TEXCOORD_1、extras.lightmap）＋ boya_interior_lm_day.webp、_night.webp。
#   遊戲：teach3d.js 用 B3.attachFormal 接正式模型，看到 GLB 的 extras.lightmap 就接（Z3.roomLightmap；和法律學院圖書館同一套），光照不用改程式。
#   階梯教室的長桌、翻椅（模型裡的 LECT_*、SEATPANS）另外要 docs/art-rebuild/second_ai/patches/boya_lecture_furn_1030.patch：藏起備用的方塊桌椅、空位椅面掀起來。
# 座標＝配置（src/data/boya_layout.js）：34 × 18 m，x 往東、z 往南（+z＝南牆：入口）；一樓地板 0、天花板 4.2；二樓地板 4.8、屋頂 8.6。
# 燈（面光源）：T5 格柵燈具 1.2×0.6，位置照 teach_interior.py 的 trof()（配置 lightPanels 的格點對到 0.6 m 格子）；一樓樓梯井那一塊沒有燈（同一個條件）。
#   101／102 階梯教室沒有窗：白天、晚上都只有燈（白天那一張的燈照樣開）。大廳南面兩扇窗、二樓南北兩排長窗：天光＋下午的太陽（方位 200°、仰角 38°）。
# --nolm（照舊即時光）：階梯教室的長桌、翻椅（LECT_*、SEATPANS：椅面會掀起來）、燈具、格柵、輕鋼架、鋼、窗框、止滑條、小零件。
set -e
SAMPLES=${1:-512}
OUTDIR=${2:-assets/models/env/second_ai}
RES=${3:-1024}
TMP=$(mktemp -d)
HIDE='glass'
NOLM='LECT_|SEATPANS|_light|louvre|tbar|trof|steel|sofaleg|frame|nosing|stepvinyl|tray|_dark'
LIGHTS=$(python3 - <<'EOF'
import json, os
s = open('src/data/boya_layout.js', encoding='utf8').read(); J = json.loads(s[s.index('{', s.index('BOYA_LAYOUT')):s.rindex('}') + 1])
C0, RY = J['ceil0'], J['roofY']; WL = J['stair']['well']; LP = J['lightPanels']
trof = lambda x, z: (round(0.6 * round(x / 0.6), 3), round(0.4 + 0.6 * round((z - 0.4) / 0.6), 3))   # 照 teach_interior.py（改那邊要一起改）
w0, w1 = os.environ.get('TROFW', '14'), os.environ.get('TROFW2', '12')   # 一樓天花板 4.2 m、二樓 3.8 m
out = []
for lv, y, w in ((0, C0, w0), (1, RY, w1)):
    for x in LP['xs']:
        for z in LP['zs']:
            if lv == 0 and WL['x0'] - 0.7 < x < WL['x1'] + 0.7 and WL['z0'] - 0.2 < z < WL['z1'] + 0.2: continue
            cx, cz = trof(x, z)
            out.append(f'{cx-0.01:.3f},{cx+0.01:.3f},{cz-0.01:.3f},{cz+0.01:.3f},{y-0.05:.3f},1,1,{w},1.14,0.54')
print(';'.join(out))
EOF
)
# 燈具往四周散出去的光（點光源，燈具下方 0.9 m、8 W；10-30 第二次試烘焙 0.4 m、3 W：天花板上只有一個一個小亮點，整片照樣暗）：面光源只往下照，試烘焙（64 取樣）階梯教室的天花板只吃到木桌、地毯反彈上來的光，整片暗、偏咖啡色
# （T5 格柵燈具的「洞穴效應」，遊戲裡看起來像髒的）。真的燈具格柵、燈管旁邊也會漏光到天花板：每盞燈下面一顆小點光源，天花板在燈的四周亮一圈
POINTS=$(python3 - <<'EOF'
import json, os
s = open('src/data/boya_layout.js', encoding='utf8').read(); J = json.loads(s[s.index('{', s.index('BOYA_LAYOUT')):s.rindex('}') + 1])
C0, RY = J['ceil0'], J['roofY']; WL = J['stair']['well']; LP = J['lightPanels']
trof = lambda x, z: (round(0.6 * round(x / 0.6), 3), round(0.4 + 0.6 * round((z - 0.4) / 0.6), 3))
up = os.environ.get('UPW', '8')
out = []
for lv, y in ((0, C0), (1, RY)):
    for x in LP['xs']:
        for z in LP['zs']:
            if lv == 0 and WL['x0'] - 0.7 < x < WL['x1'] + 0.7 and WL['z0'] - 0.2 < z < WL['z1'] + 0.2: continue
            cx, cz = trof(x, z); out.append(f'{cx:.3f},{y - 0.9:.3f},{cz:.3f},{up},1.0,0.96,0.9')
print(';'.join(out))
EOF
)
/opt/blenv/bin/python tools/blender/env_second/teach_interior.py -- --set boya --out "$TMP/boya_plain.glb"
python3 -c "import json,sys; d=json.load(open(sys.argv[1])); d['out']='assets/models/env/second_ai/boya_interior.glb'; json.dump(d,open(sys.argv[2],'w'),ensure_ascii=False,indent=1)" "$TMP/boya_plain.json" "$OUTDIR/boya_interior.json"   # 統計（三角形、材質）
/opt/blenv/bin/python tools/blender/env_second/lightbake/bake_room.py -- --in "$TMP/boya_plain.glb" --out "$OUTDIR/boya_interior.glb" \
  --lm "$TMP/by" --url assets/models/env/second_ai/boya_interior_lm --res "$RES" --samples "$SAMPLES" --hide "$HIDE" --nolm "$NOLM" \
  --sun 200,${SUNEL:-38},${SUNW:-1.8} --sky "${SKY:-0.5}" --daywb 0.92,0.88,0.8 --lights "$LIGHTS" --points "$POINTS" --daylights "${DAYL:-0.9}" --smooth 1 --shell S,N
python3 tools/blender/env_second/lightbake/to_webp.py "$TMP/by" "$OUTDIR/boya_interior_lm" 90
/opt/blenv/bin/python tools/blender/env_second/lightbake/lm_fix_hidden.py -- --in "$OUTDIR/boya_interior.glb" --out "$OUTDIR/boya_interior.glb" --lm "$OUTDIR/boya_interior_lm"
cp "$TMP/by.json" tools/blender/env_second/lightbake/boya_interior_lm.json
