#!/bin/bash
# 普通教學館室內（ART-ECON-3D-GAP-1021 B；經濟系那一年在普通上課；LAWWW2-B 2026-10-31；照 bake_gongtong.sh）：建模 → 光照烘焙（白天／晚上）→ WebP。repo 根目錄跑：
#   bash tools/blender/env_second/lightbake/bake_putong.sh [取樣數，預設 512] [輸出資料夾，預設 assets/models/env/second_ai] [貼圖邊長，預設 1024]
# 輸出：putong_interior.glb（多一套 UV＝TEXCOORD_1、extras.lightmap）＋ putong_interior_lm_day.webp、_night.webp。遊戲：teach3d.js 看到 extras.lightmap 就接（Z3.roomLightmap），不用改程式。
# 座標＝配置（src/data/putong_layout.js）：34 × 16 m，x 往東、z 往南；一樓地板 0、天花板 3.6；二樓地板 4.2、屋頂 7.8。二樓北面往博思的空橋（門洞；空橋是另一個模型）。
# 燈（面光源）：普通照舊是 1.2×0.3 的平板燈（teach_interior.py：TROF 只給博思、共同），位置＝配置的 lightPanels；一樓樓梯井那一塊沒有燈。
#   窗：一樓南北各兩扇、二樓南面一扇、北面兩扇；天光＋下午的太陽（方位 200°、仰角 38°）。
#   白天參數照共同教學館（天光 0.18、白平衡 1.0,0.98,0.95、白天燈 0.6；理由見 bake_gongtong.sh 開頭：教室小、窗大，博思的參數會過曝偏黃）。
# --nolm（照舊即時光）：燈、輕鋼架、鋼、窗框、止滑條、小零件。
set -e
SAMPLES=${1:-512}
OUTDIR=${2:-assets/models/env/second_ai}
RES=${3:-1024}
TMP=$(mktemp -d)
HIDE='glass'
NOLM='LECT_|SEATPANS|_light|louvre|tbar|trof|steel|sofaleg|frame|nosing|stepvinyl|tray|_dark'
LIGHTS=$(python3 - <<'EOF'
import json, os
s = open('src/data/putong_layout.js', encoding='utf8').read(); J = json.loads(s[s.index('{', s.index('PUTONG_LAYOUT')):s.rindex('}') + 1])
C0, RY = J['ceil0'], J['roofY']; WL = J['stair']['well']; LP = J.get('lightPanels') or {'xs': [-9.6, -6.0, -1.2, 1.2, 6.0, 9.6], 'zs': [-5.2, -2.0, 1.0, 4.6]}   # 照 teach_interior.py 的 DEFAULT_LP
trof = lambda x, z: (round(0.6 * round(x / 0.6), 3), round(0.4 + 0.6 * round((z - 0.4) / 0.6), 3))   # 照 teach_interior.py（改那邊要一起改）
w0, w1 = os.environ.get('TROFW', '12'), os.environ.get('TROFW2', '12')   # 兩層天花板都 3.6 m（64 取樣試烘：11 的晚上比博思暗 15%）
out = []
for lv, y, w in ((0, C0, w0), (1, RY, w1)):
    for x in LP['xs']:
        for z in LP['zs']:
            if lv == 0 and WL['x0'] - 0.7 < x < WL['x1'] + 0.7 and WL['z0'] - 0.2 < z < WL['z1'] + 0.2: continue
            cx, cz = x, z   # 普通沒有 T5：燈板就在配置的位置
            out.append(f'{cx-0.01:.3f},{cx+0.01:.3f},{cz-0.01:.3f},{cz+0.01:.3f},{y-0.03:.3f},1,1,{w},1.2,0.3')   # 平板燈 1.2×0.3（發光面在天花板下 2 cm）
print(';'.join(out))
EOF
)
# 燈具往四周散出去的光（點光源，燈具下方 0.9 m、8 W；10-30 第二次試烘焙 0.4 m、3 W：天花板上只有一個一個小亮點，整片照樣暗）：面光源只往下照，試烘焙（64 取樣）階梯教室的天花板只吃到木桌、地毯反彈上來的光，整片暗、偏咖啡色
# （T5 格柵燈具的「洞穴效應」，遊戲裡看起來像髒的）。真的燈具格柵、燈管旁邊也會漏光到天花板：每盞燈下面一顆小點光源，天花板在燈的四周亮一圈
POINTS=$(python3 - <<'EOF'
import json, os
s = open('src/data/putong_layout.js', encoding='utf8').read(); J = json.loads(s[s.index('{', s.index('PUTONG_LAYOUT')):s.rindex('}') + 1])
C0, RY = J['ceil0'], J['roofY']; WL = J['stair']['well']; LP = J.get('lightPanels') or {'xs': [-9.6, -6.0, -1.2, 1.2, 6.0, 9.6], 'zs': [-5.2, -2.0, 1.0, 4.6]}   # 照 teach_interior.py 的 DEFAULT_LP
trof = lambda x, z: (round(0.6 * round(x / 0.6), 3), round(0.4 + 0.6 * round((z - 0.4) / 0.6), 3))
up = os.environ.get('UPW', '8')
out = []
for lv, y in ((0, C0), (1, RY)):
    for x in LP['xs']:
        for z in LP['zs']:
            if lv == 0 and WL['x0'] - 0.7 < x < WL['x1'] + 0.7 and WL['z0'] - 0.2 < z < WL['z1'] + 0.2: continue
            cx, cz = x, z   # 普通沒有 T5：燈板就在配置的位置; out.append(f'{cx:.3f},{y - 0.9:.3f},{cz:.3f},{up},1.0,0.96,0.9')
print(';'.join(out))
EOF
)
/opt/blenv/bin/python tools/blender/env_second/teach_interior.py -- --set putong --out "$TMP/pt_plain.glb"
python3 -c "import json,sys; d=json.load(open(sys.argv[1])); d['out']='assets/models/env/second_ai/putong_interior.glb'; json.dump(d,open(sys.argv[2],'w'),ensure_ascii=False,indent=1)" "$TMP/pt_plain.json" "$OUTDIR/putong_interior.json"   # 統計（三角形、材質）
/opt/blenv/bin/python tools/blender/env_second/lightbake/bake_room.py -- --in "$TMP/pt_plain.glb" --out "$OUTDIR/putong_interior.glb" \
  --lm "$TMP/pt" --url assets/models/env/second_ai/putong_interior_lm --res "$RES" --samples "$SAMPLES" --hide "$HIDE" --nolm "$NOLM" \
  --sun 200,${SUNEL:-38},${SUNW:-1.8} --sky "${SKY:-0.18}" --daywb ${DAYWB:-1.0,0.98,0.95} --lights "$LIGHTS" --points "$POINTS" --daylights "${DAYL:-0.6}" --smooth 1 --shell S,N
python3 tools/blender/env_second/lightbake/to_webp.py "$TMP/pt" "$OUTDIR/putong_interior_lm" 90
/opt/blenv/bin/python tools/blender/env_second/lightbake/lm_fix_hidden.py -- --in "$OUTDIR/putong_interior.glb" --out "$OUTDIR/putong_interior.glb" --lm "$OUTDIR/putong_interior_lm"
cp "$TMP/pt.json" tools/blender/env_second/lightbake/putong_interior_lm.json
