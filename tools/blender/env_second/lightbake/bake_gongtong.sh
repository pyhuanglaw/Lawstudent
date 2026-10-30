#!/bin/bash
# 共同教學館室內（ART-ECON-3D-GAP-1021 A；經濟系那一年在共同上課；LAWWW2-B 2026-10-30；照 bake_boya.sh）：建模 → 光照烘焙（白天／晚上）→ WebP。repo 根目錄跑：
#   bash tools/blender/env_second/lightbake/bake_gongtong.sh [取樣數，預設 512] [輸出資料夾，預設 assets/models/env/second_ai] [貼圖邊長，預設 1024]
# 輸出：gongtong_interior.glb（多一套 UV＝TEXCOORD_1、extras.lightmap）＋ gongtong_interior_lm_day.webp、_night.webp。
#   遊戲：teach3d.js 照 ASSETS 'bldg.gongtong_interior' 接正式模型（B3.attachFormal），看到 extras.lightmap 就接（Z3.roomLightmap）；看到 SEATPANS 就藏起備用的方塊桌椅（博思那一包已整合）。
# 座標＝配置（src/data/gongtong_layout.js）：24 × 14 m，x 往東、z 往南（+z＝南牆：入口）；一樓地板 0、天花板 3.6；二樓地板 4.2、屋頂 7.8（兩層都 3.6 m 高，比博思低）。
# 燈（面光源）：T5 格柵燈具，位置照 teach_interior.py 的 trof()；配置沒寫 lightPanels，用 teach3d.js 備用模型的預設燈位（DEFAULT_LP）。一樓樓梯井那一塊沒有燈。
#   窗：一樓南面（休息區）、北面（102、101 的後面），二樓南北兩排；天光＋下午的太陽（方位 200°、仰角 38°）。
#   天花板比博思低 0.2～0.6 m：燈的瓦數先用 11（博思一樓 14、二樓 12）。
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
s = open('src/data/gongtong_layout.js', encoding='utf8').read(); J = json.loads(s[s.index('{', s.index('GONGTONG_LAYOUT')):s.rindex('}') + 1])
C0, RY = J['ceil0'], J['roofY']; WL = J['stair']['well']; LP = J.get('lightPanels') or {'xs': [-9.6, -6.0, -1.2, 1.2, 6.0, 9.6], 'zs': [-5.2, -2.0, 1.0, 4.6]}   # 照 teach_interior.py 的 DEFAULT_LP
trof = lambda x, z: (round(0.6 * round(x / 0.6), 3), round(0.4 + 0.6 * round((z - 0.4) / 0.6), 3))   # 照 teach_interior.py（改那邊要一起改）
w0, w1 = os.environ.get('TROFW', '11'), os.environ.get('TROFW2', '11')   # 兩層天花板都 3.6 m
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
s = open('src/data/gongtong_layout.js', encoding='utf8').read(); J = json.loads(s[s.index('{', s.index('GONGTONG_LAYOUT')):s.rindex('}') + 1])
C0, RY = J['ceil0'], J['roofY']; WL = J['stair']['well']; LP = J.get('lightPanels') or {'xs': [-9.6, -6.0, -1.2, 1.2, 6.0, 9.6], 'zs': [-5.2, -2.0, 1.0, 4.6]}   # 照 teach_interior.py 的 DEFAULT_LP
trof = lambda x, z: (round(0.6 * round(x / 0.6), 3), round(0.4 + 0.6 * round((z - 0.4) / 0.6), 3))
up = os.environ.get('UPW', '7')
out = []
for lv, y in ((0, C0), (1, RY)):
    for x in LP['xs']:
        for z in LP['zs']:
            if lv == 0 and WL['x0'] - 0.7 < x < WL['x1'] + 0.7 and WL['z0'] - 0.2 < z < WL['z1'] + 0.2: continue
            cx, cz = trof(x, z); out.append(f'{cx:.3f},{y - 0.9:.3f},{cz:.3f},{up},1.0,0.96,0.9')
print(';'.join(out))
EOF
)
/opt/blenv/bin/python tools/blender/env_second/teach_interior.py -- --set gongtong --out "$TMP/gt_plain.glb"
python3 -c "import json,sys; d=json.load(open(sys.argv[1])); d['out']='assets/models/env/second_ai/gongtong_interior.glb'; json.dump(d,open(sys.argv[2],'w'),ensure_ascii=False,indent=1)" "$TMP/gt_plain.json" "$OUTDIR/gongtong_interior.json"   # 統計（三角形、材質）
/opt/blenv/bin/python tools/blender/env_second/lightbake/bake_room.py -- --in "$TMP/gt_plain.glb" --out "$OUTDIR/gongtong_interior.glb" \
  --lm "$TMP/gt" --url assets/models/env/second_ai/gongtong_interior_lm --res "$RES" --samples "$SAMPLES" --hide "$HIDE" --nolm "$NOLM" \
  --sun 200,${SUNEL:-38},${SUNW:-1.8} --sky "${SKY:-0.5}" --daywb 0.92,0.88,0.8 --lights "$LIGHTS" --points "$POINTS" --daylights "${DAYL:-0.9}" --smooth 1 --shell S,N
python3 tools/blender/env_second/lightbake/to_webp.py "$TMP/gt" "$OUTDIR/gongtong_interior_lm" 90
/opt/blenv/bin/python tools/blender/env_second/lightbake/lm_fix_hidden.py -- --in "$OUTDIR/gongtong_interior.glb" --out "$OUTDIR/gongtong_interior.glb" --lm "$OUTDIR/gongtong_interior_lm"
cp "$TMP/gt.json" tools/blender/env_second/lightbake/gongtong_interior_lm.json
