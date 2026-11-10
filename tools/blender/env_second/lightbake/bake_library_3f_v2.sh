#!/bin/bash
# 總圖 3F 閱覽區第二版（LIB-3F-1102：照使用者 11-02 08:58 的 3F 平面圖重排；LAWWW2〔帳號 A〕2026-11-02；照 bake_library_3f.sh、bake_library_hall_v2.sh）：
#   建模 → 光照烘焙（白天／晚上）→ WebP。repo 根目錄跑：
#   bash tools/blender/env_second/lightbake/bake_library_3f_v2.sh [取樣數，預設 512] [輸出資料夾，預設 assets/models/env/second_ai] [貼圖邊長，預設 1024] [配置，預設 src/data/library_3f_layout.js]
# 輸出：library_3f_v2.glb（多一套 UV＝TEXCOORD_1、extras.lightmap）＋ library_3f_v2_lm_day.webp、_night.webp。
#   遊戲：library_3f_v2.js 的 attach() 看到 GLB 的 extras.lightmap 就用 Z3.roomLightmap 接（外牆的材質複製、書架透空之後才接）。
# 座標＝遊戲 library 區域第二版：x −12～12、z −17～9，北側半圓（人文庫）圓心 (0, −17)、半徑 5.4；高 4.0 m。
# 窗：西、東、南三面（配置的 windows）；北牆、人文庫的弧牆沒有窗 → --shell W,E,S。
# 燈（照 library_3f_v2.py 的燈框；燈框本身 l3_lightpanel 不烘、照舊自己發光；改那邊要一起改這裡）：
#   方格天花板每 3 m 一片燈（1.2×0.6 m，8×8 片：x −10.8～10.2、z −14.8～6.2）＋人文庫中間一片（2.0×1.0 m）；
#   閱覽桌的綠色燈罩桌燈（點光源，燈罩下方）；
#   每片燈下 0.9 m 一顆往四周散的點光源（第一版 10-31 的教訓：面光源只往下照，天花板整片暗、偏咖啡色）。
# 燈的顏色照第一版定案的晝光色 0.95,0.98,1.0；白天整張乘 0.86,0.9,0.98。
#   瓦數：第一版（22×16 m）方燈、長燈、補光加起來每平方公尺約 1.3 W；第二版約 670 m²、燈的密度是第一版兩倍 → 方燈、補光都用 7 W（每平方公尺約 1.4 W）。
# 第一版的窗只在北面，太陽照不進來；第二版西、東、南三面有窗，太陽（方位 200°）會從南面、西面的窗照進來：太陽先用 1.0、天光 0.2，烘完看遊戲截圖再調。
# --nolm（照舊即時光）：燈框發光面、頂點色的小東西（書、雜誌、擺設）、椅子／扶手椅／桌燈（instancing）、窗框、玻璃。
set -e
SAMPLES=${1:-512}
OUTDIR=${2:-assets/models/env/second_ai}
RES=${3:-1024}
LAYOUT=${4:-src/data/library_3f_layout.js}
TMP=$(mktemp -d)
NOLM='^L3_(light|vc|vcm|books|frame|glass)$|INST_|_root'
read -r LIGHTS POINTS < <(python3 - "$LAYOUT" <<'PY'
import json, math, os, sys
E = lambda k, d: os.environ.get(k, d)
src = open(sys.argv[1], encoding='utf-8').read(); L = json.loads(src[src.index('{'):src.rindex('}') + 1])
assert L.get('version') == 2, '要第二版的配置'
H, R = L['h'], L['rotunda']; col = E('LCOL', '0.95,0.98,1.0')
# 照 library_3f_v2.py：gx＝range(int(X0), int(X1)−1, 3)＋1.2、gz＝range(int(Z0)+1, int(Z1)−1, 3)＋1.2
X0, X1, Z0, Z1 = L['bounds']['x0'], L['bounds']['x1'], L['bounds']['z0'], L['bounds']['z1']
gx = [x + 1.2 for x in range(int(X0), int(X1) - 1, 3)]; gz = [z + 1.2 for z in range(int(Z0) + 1, int(Z1) - 1, 3)]
assert len(set(round(b - a, 6) for a, b in zip(gx, gx[1:]))) == 1 and len(set(round(b - a, 6) for a, b in zip(gz, gz[1:]))) == 1
sx, sz = gx[1] - gx[0], gz[1] - gz[0]
lights = [f"{gx[0] - sx / 2:.3f},{gx[-1] + sx / 2:.3f},{gz[0] - sz / 2:.3f},{gz[-1] + sz / 2:.3f},{H - 0.03:.3f},{len(gx)},{len(gz)},{E('PANEL','7')},1.14,0.54,{col}"]
rz = R['cz'] - 2.1
lights.append(f"{R['cx'] - 0.01:.3f},{R['cx'] + 0.01:.3f},{rz - 0.01:.3f},{rz + 0.01:.3f},{H - 0.03:.3f},1,1,{E('ROT','16')},1.9,0.95,{col}")
pts = [f"{x:.3f},{H - 0.9:.3f},{z:.3f},{E('UPW','7')},{col},0.4" for x in gx for z in gz]
pts.append(f"{R['cx']:.3f},{H - 0.9:.3f},{rz:.3f},{E('UPW','7')},{col},0.4")
# 人文庫四片小燈（library_3f_v2.py 的 ROT_LAMPS：半徑 3.6 m、30°／70°／110°／150°）：每片 5 W 面光源＋燈下 0.9 m 一顆 5 W 補光
#   11-02 第一次烘：人文庫地板白天 0.155（主閱覽區約 0.42；半圓 46 m² 只有中間一片燈，每平方公尺約 0.5 W）→ 加到約 1.4 W，和主閱覽區一樣
for a in (math.pi / 6, math.pi * 7 / 18, math.pi * 11 / 18, math.pi * 5 / 6):
    lx, lz = R['cx'] + 3.6 * math.cos(a), R['cz'] - 3.6 * math.sin(a)
    lights.append(f"{lx - 0.01:.3f},{lx + 0.01:.3f},{lz - 0.01:.3f},{lz + 0.01:.3f},{H - 0.03:.3f},1,1,{E('ROTL','5')},0.54,0.54,{col}")
    pts.append(f"{lx:.3f},{H - 0.9:.3f},{lz:.3f},{E('ROTLP','5')},{col},0.4")
# 閱覽桌的桌燈（照 library_3f_v2.py 的 lamps）：燈罩下緣 0.99 m，光源放在 0.96 m
for f in L['furniture']:
    if f['type'] == 'desk' and f.get('lamp'):
        if f['w'] >= f['d']: q = [(f['x'] + k * 1.05, f['z']) for k in range(-1, 2)]
        else: q = [(f['x'] - 0.2 * (1 if f.get('side') == 'west' else -1), f['z'] + k * 1.0) for k in range(-1, 2)]
        pts += [f"{x:.3f},0.96,{z:.3f},{E('LAMPW','3')},1.0,0.82,0.6" for (x, z) in q]
print(';'.join(lights), ';'.join(pts))
PY
)
/opt/blenv/bin/python tools/blender/env_second/library_3f_v2.py -- --layout "$LAYOUT" --out "$TMP/l3v2_plain.glb"
/opt/blenv/bin/python tools/blender/env_second/lightbake/bake_room.py -- --in "$TMP/l3v2_plain.glb" --out "$OUTDIR/library_3f_v2.glb" \
  --lm "$TMP/l3v2" --url assets/models/env/second_ai/library_3f_v2_lm --res "$RES" --samples "$SAMPLES" --hide glass --nolm "$NOLM" --keep-instances \
  --sun 200,${SUNEL:-38},${SUNW:-1.0} --sky "${SKY:-0.2}" --daywb "${DAYWB:-0.86,0.9,0.98}" --lights "$LIGHTS" --points "$POINTS" --daylights "${DAYL:-1.0}" --smooth 1 --shell W,E,S
python3 tools/blender/env_second/lightbake/to_webp.py "$TMP/l3v2" "$OUTDIR/library_3f_v2_lm" 90
/opt/blenv/bin/python tools/blender/env_second/lightbake/lm_fix_hidden.py -- --in "$OUTDIR/library_3f_v2.glb" --out "$OUTDIR/library_3f_v2.glb" --lm "$OUTDIR/library_3f_v2_lm"
cp "$TMP/l3v2.json" "$OUTDIR/library_3f_v2_lm.json"
[ -f "$TMP/l3v2_plain.json" ] && cp "$TMP/l3v2_plain.json" "$OUTDIR/library_3f_v2.json"
[ "$OUTDIR" = "assets/models/env/second_ai" ] && mv "$OUTDIR/library_3f_v2_lm.json" tools/blender/env_second/lightbake/library_3f_v2_lm.json
rm -rf "$TMP"
# 烘完自己檢查（lm_probe.py）：重點位置的亮度不能低於下限（白天、晚上）
#   11-02 更正：第一次的「南側長桌旁地毯」(−3, 6.6) 在長桌正下方、「人文庫木地板」(0, −19.5) 在展示桌正下方（桌子底下本來就暗），改到旁邊的走道
python3 tools/blender/env_second/lightbake/lm_probe.py "$OUTDIR/library_3f_v2.glb" "$OUTDIR/library_3f_v2_lm" '[["中間走道地毯",0,0,-2.0,"up",0.3,0.2],["西側靠窗閱覽桌旁地毯（學姊的座位）",-10.0,0,-7.4,"up",0.3,0.2],["東側靠窗閱覽桌旁地毯",10.0,0,1.6,"up",0.3,0.2],["南側兩張長桌中間的走道",0.0,0,6.4,"up",0.3,0.2],["人文庫木地板（展示桌東邊）",2.0,0,-19.2,"up",0.2,0.15],["人文庫木地板（展示桌西邊）",-2.0,0,-19.2,"up",0.2,0.15],["人文庫門口",0,0,-17.6,"up",0.2,0.15],["天花板（中間）",0,4.0,-2.0,"down",0.06,0.06],["天花板（人文庫）",0,4.0,-19.5,"down",0.05,0.05]]'
