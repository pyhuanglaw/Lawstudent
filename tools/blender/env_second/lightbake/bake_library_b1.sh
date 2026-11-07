#!/bin/bash
# 總圖 B1 自習室・討論室（遊戲 library_b1 區域；INTERIOR-AAA-REVIEW-1028 第 5 節 P1「全部室內」；LAWWW2（帳號 A）2026-11-02；照 bake_library_3f.sh）：
#   光照烘焙（白天／晚上）→ WebP。repo 根目錄跑：
#   bash tools/blender/env_second/lightbake/bake_library_b1.sh [取樣數，預設 512] [輸出資料夾，預設 assets/models/env/second_ai] [貼圖邊長，預設 1024]
# 輸入：烘焙前、遊戲裡正在用的 library_b1.glb（git blob 53dfdbeb，LAWWW2-B 10-23 做的；開發分支同一個檔）——每次都從這個 blob 開始，
#   不會把光照 UV 疊兩次。不從 library_b1.py 重做：11-02 重做出來和這個檔不一樣（library_layout.js 的電梯樓層清單後來改過），配置、導航不能動。輸出：library_b1.glb（多一套 UV＝TEXCOORD_1、extras.lightmap）＋ library_b1_lm_day.webp、_night.webp。
#   遊戲：library_b1_3d.js 用 Z3.attachRoomGLB 接正式模型，看到 extras.lightmap 就接（Z3.roomLightmap；和總圖 3F、社科圖同一套），不用改程式。
# 座標＝遊戲 library_b1 區域：x −12～12、z −9～9，天花板 3.2 m。地下室，沒有窗：四面、上下都包黑殼（--shell NONE），沒有天光、太陽——
#   白天、晚上兩張一樣（只有燈）；照舊出兩張，遊戲的接法不用分情況。
# 燈：
#   - 日光燈 LT（照 library_b1.py 的「日光燈」那一段；燈框發光面 library_b1_tubes 不烘、照舊自己發光；改那邊要一起改）：每盞 1.16×0.56 m 面光源朝下，
#     燈下 0.9 m 一顆點光源（總圖 3F 10-31 的教訓：面光源只往下照，天花板只吃到地板反彈的光，整片暗）。
#   - 自習室 28 盞綠色檯燈：燈罩下面亮的那一片（GLOW_l118_warm）的位置，往下 3 cm 一顆暖黃點光源。
# --nolm（照舊即時光）：日光燈發光面、檯燈亮片、冰箱燈、螢幕、燈罩、印刷品（海報、門牌）、玻璃、霧面玻璃、不鏽鋼。玻璃、霧面玻璃烘焙時當作不存在（--hide）。
set -e
SAMPLES=${1:-512}
OUTDIR=${2:-assets/models/env/second_ai}
RES=${3:-1024}
TMP=$(mktemp -d)
PLAIN="$TMP/library_b1_plain.glb"
git cat-file -p 53dfdbeb92fc63fcec3035ed6f1ad3025ee2556c > "$PLAIN"
HIDE='glass|frost'
NOLM='tubes|warm|fridgelight|screens|lampshades|print|glass|frost|steel|props|metal'   # props＝椅子、檯燈、書、植物合成一個網格（上千個小島，排不進一張光照貼圖：11-02 試烘 512 只用到左下角、東邊隔間牆整片黑三角），照總圖 3F 椅子那樣用即時光
LIGHTS=$(python3 - <<'PY'
import os
H = 3.2
LT = [(x, z) for x in (-10.0, -8.0) for z in (-7.0, -4.0, -1.0, 2.0, 5.0, 8.0)]
LT += [(x, z) for x in (-5.0, -2.0, 1.0, 4.0) for z in (-7.5, -5.5, -3.0)] + [(6.0, -7.5), (6.0, -5.5), (6.0, -3.0)]
LT += [(x, 0.0) for x in (-5.0, -1.0, 3.0, 7.0)] + [(8.6, -7.0), (10.6, -7.0), (8.6, -4.6), (10.6, -4.6)]
LT += [(x, z) for x in (-4.5, 0.5) for z in (3.0, 6.0)] + [(x, z) for x in (5.0, 8.0, 10.8) for z in (3.0, 6.0, 8.3)]
w, col = os.environ.get('TUBEW', '10'), os.environ.get('LCOL', '0.95,0.98,1.0')
print(';'.join(f'{x-0.01:.3f},{x+0.01:.3f},{z-0.01:.3f},{z+0.01:.3f},{H-0.03:.3f},1,1,{w},1.14,0.54,{col}' for (x, z) in LT))
PY
)
POINTS=$(PLAIN="$PLAIN" python3 - <<'PY'
import os, json, struct
import numpy as np
H = 3.2
LT = [(x, z) for x in (-10.0, -8.0) for z in (-7.0, -4.0, -1.0, 2.0, 5.0, 8.0)]
LT += [(x, z) for x in (-5.0, -2.0, 1.0, 4.0) for z in (-7.5, -5.5, -3.0)] + [(6.0, -7.5), (6.0, -5.5), (6.0, -3.0)]
LT += [(x, 0.0) for x in (-5.0, -1.0, 3.0, 7.0)] + [(8.6, -7.0), (10.6, -7.0), (8.6, -4.6), (10.6, -4.6)]
LT += [(x, z) for x in (-4.5, 0.5) for z in (3.0, 6.0)] + [(x, z) for x in (5.0, 8.0, 10.8) for z in (3.0, 6.0, 8.3)]
up, col = os.environ.get('UPW', '8'), os.environ.get('LCOL', '0.95,0.98,1.0')
out = [f'{x:.3f},{H - 0.9:.3f},{z:.3f},{up},{col}' for (x, z) in LT]
# 檯燈：從 GLB 找 GLOW_l118_warm（燈罩下面亮的那一片，整層一個網格）的每一盞（相連的面聚在 0.3 m 以內算同一盞）
p = os.environ['PLAIN']
b = open(p, 'rb').read(); n = struct.unpack('<I', b[12:16])[0]; j = json.loads(b[20:20 + n]); off = 20 + n; bl = struct.unpack('<I', b[off:off + 4])[0]; B = b[off + 8:off + 8 + bl]
def acc(i):
    a = j['accessors'][i]; bv = j['bufferViews'][a['bufferView']]; o = bv.get('byteOffset', 0) + a.get('byteOffset', 0)
    nc = {'SCALAR': 1, 'VEC3': 3}[a['type']]; dt = {5126: np.float32, 5125: np.uint32, 5123: np.uint16}[a['componentType']]
    return np.frombuffer(B, dt, a['count'] * nc, o).reshape(a['count'], nc) if nc > 1 else np.frombuffer(B, dt, a['count'], o)
nd = next(x for x in j['nodes'] if x.get('name') == 'library_b1_warm'); pr = j['meshes'][nd['mesh']]['primitives'][0]
P = acc(pr['attributes']['POSITION']).astype(float)
lamps = []
for v in P:
    for g in lamps:
        if abs(g[0] / g[3] - v[0]) < 0.3 and abs(g[2] / g[3] - v[2]) < 0.3: g[0] += v[0]; g[1] += v[1]; g[2] += v[2]; g[3] += 1; break
    else: lamps.append([v[0], v[1], v[2], 1])
lw = os.environ.get('LAMPW', '3')
out += [f'{x / k:.3f},{y / k - 0.03:.3f},{z / k:.3f},{lw},1.0,0.82,0.6' for (x, y, z, k) in lamps]
print(';'.join(out))
PY
)
echo "lights $(echo "$LIGHTS" | tr ';' '\n' | wc -l), points $(echo "$POINTS" | tr ';' '\n' | wc -l)"
/opt/blenv/bin/python tools/blender/env_second/lightbake/bake_room.py -- --in "$PLAIN" --out "$OUTDIR/library_b1.glb" \
  --lm "$TMP/b1" --url assets/models/env/second_ai/library_b1_lm --res "$RES" --samples "$SAMPLES" --hide "$HIDE" --nolm "$NOLM" \
  --sun 0,30,0 --sky 0 --nightsky 0 --lights "$LIGHTS" --points "$POINTS" --daylights 1.0 --smooth 1 --shell NONE
python3 tools/blender/env_second/lightbake/to_webp.py "$TMP/b1" "$OUTDIR/library_b1_lm" 90
/opt/blenv/bin/python tools/blender/env_second/lightbake/lm_fix_hidden.py -- --in "$OUTDIR/library_b1.glb" --out "$OUTDIR/library_b1.glb" --lm "$OUTDIR/library_b1_lm"
if [ "$OUTDIR" = "assets/models/env/second_ai" ]; then cp "$TMP/b1.json" tools/blender/env_second/lightbake/library_b1_lm.json; else cp "$TMP/b1.json" "$OUTDIR/library_b1_lm.json"; fi   # 試烘到別的資料夾時不覆蓋 repo 裡定案那一份（照 bake_us.sh）
echo "done: $OUTDIR/library_b1.glb + library_b1_lm_day/night.webp"
