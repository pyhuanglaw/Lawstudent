#!/bin/bash
# 總圖大廳第二版（LIB-INTERIOR-1102 一樓：中庭的木頭台階書牆、半圓形展演廳、多元共享區、數位媒體區；LAWWW2〔帳號 A〕2026-11-02；照 bake_library_hall.sh）：
#   建模 → 光照烘焙（白天／晚上）→ WebP。repo 根目錄跑：
#   bash tools/blender/env_second/lightbake/bake_library_hall_v2.sh [取樣數，預設 512] [輸出資料夾，預設 assets/models/env/second_ai] [貼圖邊長，預設 1024] [配置，預設 src/data/library_layout.js]
# 輸出：library_hall_v2.glb（多一套 UV＝TEXCOORD_1、extras.lightmap）＋ library_hall_v2_lm_day.webp、_night.webp。
#   遊戲：library_hall_v2.js → B3.attachFormal 看到 GLB 的 extras.lightmap 就接（和第一版同一套，程式不用改）。
# 窗：南面兩層樓高的玻璃帷幕（門廳）、東西牆每 2.4 m 一扇窗（兩層）、展演廳一圈高窗（北）——四面都開（--shell S,W,E,N），屋頂、地板包黑殼。
# 燈（每盞一個面光源或點光源；發光面本身不烘，照舊自己發光；改 library_hall_v2.py 的燈要一起改這裡）：
#   - 中庭（台階書牆上方）方格天花板 4×8 片燈板（RY＋0.43，每片 0.7×0.7）；
#   - 兩翼屋頂的燈條（x ±8、±11，z 每 3 m，1.2×0.3）；
#   - 一樓天花板（二樓樓板底下）每 2.4 m 一盞崁燈（照 library_hall_v2.py 的 slab_rects；電梯旁邊不放）；
#   - 展演廳弧形軌道燈的 8 顆燈頭（點光源，暖色）。
# --nolm（照舊即時光）：發光面（燈板、展示櫃裡的亮片）、植物、頂點色的小東西（書、雜誌、擺設）、椅子（instancing）、玻璃、門框窗框、不鏽鋼。
set -e
SAMPLES=${1:-512}
OUTDIR=${2:-assets/models/env/second_ai}
RES=${3:-1024}
LAYOUT=${4:-src/data/library_layout.js}
TMP=$(mktemp -d)
# --nolm 比對的是物件名（library_hall_v2.py 的 Lv 物件叫 L0_<材質鍵>，不是材質名）；椅子是 GPU instancing（匯出後節點叫 L0_root.N／L1_root），
#   --keep-instances 不展開、不烘（展開會變成一個上千小島的網格，排不進光照貼圖：B1 試烘的教訓）
NOLM='^L[01]_(light|warm|vc|vcm|books|frame|glass|steel)$|plant|INST_|_root'
export WARM='1.0,0.82,0.62'
read -r LIGHTS POINTS < <(python3 - "$LAYOUT" <<'PY'
import json, math, sys, os
E = lambda k, d: os.environ.get(k, d)
src = open(sys.argv[1], encoding='utf-8').read(); L = json.loads(src[src.index('{'):src.rindex('}') + 1])
assert L.get('version') == 2, '要第二版的配置'
Y1, RY, ST, T = L['floors'][1]['y'], L['roofY'], L['slabT'], L['wallT']; U, EL, R = L['upper'], L['elevator'], L['rotunda']
Z0, Z1 = L['bounds']['z0'], L['bounds']['z1']; ZI0, ZI1 = Z0 + T / 2, Z1 - T / 2
lights = []
lights.append(f"-3.7,3.7,{U['north']['z1']},{U['band']['z0']},{RY + 0.42:.3f},4,8,{E('CEIL','26')},0.7,0.7")               # 中庭方格天花板
n = int((ZI1 - ZI0 - 2) / 3.0) + 1; za = ZI0 + 1.6 - 1.5
for x in (-11.0, -8.0, 8.0, 11.0): lights.append(f"{x},{x},{za:.3f},{za + 3.0 * n:.3f},{RY - 0.03:.3f},1,{n},{E('STRIP','16')},1.2,0.3")   # 兩翼屋頂的燈條
for r in [U['band'], U['north']] + U['wings'] + U.get('closed', []):                                              # 一樓天花板的崁燈
    nx, nz = max(1, int((r['x1'] - r['x0']) / 2.4)), max(1, int((r['z1'] - r['z0']) / 2.4))
    for i in range(nx):
        for j in range(nz):
            x = r['x0'] + (i + 0.5) * (r['x1'] - r['x0']) / nx; z = r['z0'] + (j + 0.5) * (r['z1'] - r['z0']) / nz
            if EL['x0'] - 0.3 < x < EL['x1'] + 0.3 and EL['z0'] - 0.3 < z < EL['z1'] + 0.3: continue
            lights.append(f"{x:.3f},{x:.3f},{z:.3f},{z:.3f},{Y1 - ST - 0.02:.3f},1,1,{E('DOWN','14')},0.28,0.28")
pts = []
for i in range(24):                                                                                              # 展演廳的軌道燈頭（第三版 BB_244：大圓環半徑 4.4、十二顆；照片 2 是白光 → 中性色）
    if i % 2 != 1: continue
    am = math.pi * (0.03 + 0.94 * (i + 0.5) / 24); hx, hz = R['cx'] + 4.4 * math.cos(am), R['cz'] - 4.4 * math.sin(am)
    pts.append(f"{hx:.3f},6.30,{hz:.3f},{E('SPOT','24')},{E('WARM','1.0,0.96,0.9')}")
print(';'.join(lights), ';'.join(pts))
PY
)
# 第三版（BB_244，11-02）：白天的白平衡 0.85,0.80,0.72 → 0.92,0.89,0.83（展演廳的白牆偏米色；照片 1、2 都是白光）；展演廳軌道燈改成大圓環、中性色
/opt/blenv/bin/python tools/blender/env_second/library_hall_v2.py -- --layout "$LAYOUT" --out "$TMP/library_hall_v2_plain.glb"
/opt/blenv/bin/python tools/blender/env_second/lightbake/bake_room.py -- --in "$TMP/library_hall_v2_plain.glb" --out "$OUTDIR/library_hall_v2.glb" \
  --lm "$TMP/lh2" --url assets/models/env/second_ai/library_hall_v2_lm --res "$RES" --samples "$SAMPLES" --hide glass --nolm "$NOLM" \
  --sun "${SUN:-200,45,2.2}" --sky "${SKY:-0.35}" --daywb "${DAYWB:-0.92,0.89,0.83}" --nightwb "${NIGHTWB:-1.0,0.92,0.80}" --lights "$LIGHTS" --points "$POINTS" --smooth 1 --shell S,W,E,N --keep-instances
python3 tools/blender/env_second/lightbake/to_webp.py "$TMP/lh2" "$OUTDIR/library_hall_v2_lm" 90
/opt/blenv/bin/python tools/blender/env_second/lightbake/lm_fix_hidden.py -- --in "$OUTDIR/library_hall_v2.glb" --out "$OUTDIR/library_hall_v2.glb" --lm "$OUTDIR/library_hall_v2_lm"
cp "$TMP/lh2.json" "$OUTDIR/library_hall_v2_lm.json"
[ "$OUTDIR" = "assets/models/env/second_ai" ] && mv "$OUTDIR/library_hall_v2_lm.json" tools/blender/env_second/lightbake/library_hall_v2_lm.json
rm -rf "$TMP"
# 烘完自己檢查（lm_probe.py）：重點位置的亮度不能低於下限（白天、晚上）
python3 tools/blender/env_second/lightbake/lm_probe.py "$OUTDIR/library_hall_v2.glb" "$OUTDIR/library_hall_v2_lm" '[["1F 門廳地板",0,0,7.0,"up",0.5,0.2],["1F 中庭地毯（台階前）",0,0,-3.0,"up",0.4,0.2],["台階中間第 10 階踏面",0,1.79,-9.0,"up",0.3,0.15],["1F 西側多元共享區地板",-8.0,0,-12.0,"up",0.2,0.15],["1F 東側數位媒體區地板",8.4,0,-11.0,"up",0.2,0.15],["展演廳地板",0,0,-19.5,"up",0.25,0.15],["2F 西翼自習區地板（長桌之間的走道）",-8.4,5.0,-5.3,"up",0.3,0.2],["展演廳天花板",0,9.6,-19.5,"down",0.06,0.06],["2F 北側連廊地板",0,5.0,-15.6,"up",0.3,0.2],["1F 西翼天花板（樓板底面）",-8.4,4.7,-4.0,"down",0.06,0.06]]'
