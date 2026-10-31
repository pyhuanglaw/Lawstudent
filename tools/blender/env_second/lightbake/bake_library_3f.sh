#!/bin/bash
# 總圖書館 3F 閱覽區（遊戲 library 區域；ART-ECON-3D-GAP-1021 C，經濟系那一年 10/16 19:00 那一場在這裡；LAWWW2-B 2026-10-31；照 bake_lawlib.sh）：
#   建模 → 光照烘焙（白天／晚上）→ WebP。repo 根目錄跑：
#   bash tools/blender/env_second/lightbake/bake_library_3f.sh [取樣數，預設 512] [輸出資料夾，預設 assets/models/env/second_ai] [貼圖邊長，預設 1024]
# 輸出：library_3f.glb（多一套 UV＝TEXCOORD_1、extras.lightmap）＋ library_3f_lm_day.webp、_night.webp。
#   遊戲：zones3d.js 的 library 區域用 attachRoomGLB 接正式模型，看到 extras.lightmap 就接（Z3.roomLightmap；和 Café、社科圖同一套），不用改程式。
# 座標＝遊戲 library 區域（room() 22×16×4.0 m）：x −11～11、z −8～8；後牆（北，z=−8）四扇窗，前牆中間是樓梯間的門。
# 燈（照 library_3f.py 算出來的燈框；燈框本身 l3_light_panel 不烘、照舊自己發光；改那邊要一起改）：
#   六張長桌正上方各一條長燈（4.4×0.24 m）；走道十二片方燈（1.2×0.6 m）；每張長桌三盞綠色燈罩的桌燈（點光源，燈罩下方）。
# 窗只在北面：太陽照不進來（方位 200°），白天主要是天光＋燈（圖書館白天燈照樣開）。--shell N。
# 10-31 遊戲內試了三版（截圖在 docs/art-rebuild/second_ai/test_shots/library3f_lm_1031/README.md）：
#   第一版（燈暖白 1,0.97,0.92、長燈 12 W、方燈 9 W、沒有往上的點光源）：天花板整片咖啡色 (113,88,56)、牆偏桃色，白天比晚上暗。
#     面光源只往下照，天花板只吃到人字拼地板、胡桃木桌櫃反彈上來的光，顏色越疊越暖（和普通教學館同一個問題）。
#   定案：燈晝光色 0.95,0.98,1.0、長燈 16 W、方燈 12 W；每盞燈下 0.9 m 點光源 12 W（長燈兩顆、方燈一顆）；
#     天光 0.12、太陽 0.6、白天燈 1.0；白天整張乘 0.86,0.9,0.98（稍微偏冷）。
# --nolm（照舊即時光）：書（EXT_mesh_gpu_instancing，--keep-instances 不展開）、書封、椅子、黃銅、燈罩、發光面、輕鋼架、鋼、黑白紅小零件、紙、窗框、百葉、冷氣出風口、牌子。
set -e
SAMPLES=${1:-512}
OUTDIR=${2:-assets/models/env/second_ai}
RES=${3:-1024}
TMP=$(mktemp -d)
HIDE='l3_glass'
NOLM='bk_|l3_books|book|bookcover|chair|seat|brass|lampshade|lamp_glow|light_panel|ceiling_grid|tbar|steel|black|white|red|paper|window_frame|blind|grille|sign|exit'
LIGHTS=$(python3 - <<'PY'
import os
H = 4.0
TABLES = [(-4 + 8 * c, -3 + 3.6 * r) for r in range(3) for c in range(2)]   # 照 library_3f.py
AISLE = [(0.0, -5.4), (0.0, -1.2), (0.0, 2.4), (0.0, 6.2), (-8.6, 6.4), (8.6, 6.4), (-8.4, -5.8), (8.4, -5.8), (-8.4, 0.6), (-8.4, 3.0), (7.6, 3.6), (7.6, -4.2)]
sw, aw, col = os.environ.get('STRIPW', '16'), os.environ.get('AISLEW', '12'), os.environ.get('LCOL', '0.95,0.98,1.0')   # 晝光色（冷白）：見檔頭的紀錄
out = [f'{x-0.01:.3f},{x+0.01:.3f},{z-0.01:.3f},{z+0.01:.3f},{H-0.04:.3f},1,1,{sw},4.36,0.2,{col}' for (x, z) in TABLES]
out += [f'{x-0.01:.3f},{x+0.01:.3f},{z-0.01:.3f},{z+0.01:.3f},{H-0.03:.3f},1,1,{aw},1.14,0.54,{col}' for (x, z) in AISLE]
print(';'.join(out))
PY
)
POINTS=$(python3 - <<'PY'
import os
TOP = 0.77
TABLES = [(-4 + 8 * c, -3 + 3.6 * r) for r in range(3) for c in range(2)]
lw = os.environ.get('LAMPW', '3')
out = [f'{tx - 1.6 + i * 1.6:.3f},{TOP + 0.29:.3f},{tz:.3f},{lw},1.0,0.82,0.6' for (tx, tz) in TABLES for i in range(3)]   # 燈罩下緣往下一點，暖黃
# 燈具往四周散出去的光（照普通教學館：面光源只往下照，天花板只吃到地板、木桌反彈上來的光，整片暗、偏咖啡色）：長燈下 0.9 m 兩顆、方燈下 0.9 m 一顆
H = 4.0; up, pcol = os.environ.get('UPW', '12'), os.environ.get('LCOL', '0.95,0.98,1.0')
AISLE = [(0.0, -5.4), (0.0, -1.2), (0.0, 2.4), (0.0, 6.2), (-8.6, 6.4), (8.6, 6.4), (-8.4, -5.8), (8.4, -5.8), (-8.4, 0.6), (-8.4, 3.0), (7.6, 3.6), (7.6, -4.2)]   # 同上面的 LIGHTS
out += [f'{tx + dx:.3f},{H - 0.9:.3f},{tz:.3f},{up},{pcol}' for (tx, tz) in TABLES for dx in (-1.1, 1.1)]
out += [f'{x:.3f},{H - 0.9:.3f},{z:.3f},{up},{pcol}' for (x, z) in AISLE]
print(';'.join(out))
PY
)
/opt/blenv/bin/python tools/blender/env_second/library_3f.py -- --out "$TMP/l3_plain.glb"
python3 -c "import json,sys; d=json.load(open(sys.argv[1])); d['out']='assets/models/env/second_ai/library_3f.glb'; json.dump(d,open(sys.argv[2],'w'),ensure_ascii=False,indent=1)" "$TMP/l3_plain.json" "$OUTDIR/library_3f.json"   # 統計（三角形、材質）
/opt/blenv/bin/python tools/blender/env_second/lightbake/bake_room.py -- --in "$TMP/l3_plain.glb" --out "$OUTDIR/library_3f.glb" \
  --lm "$TMP/l3" --url assets/models/env/second_ai/library_3f_lm --res "$RES" --samples "$SAMPLES" --hide "$HIDE" --nolm "$NOLM" --keep-instances \
  --sun 200,${SUNEL:-38},${SUNW:-0.6} --sky "${SKY:-0.12}" --daywb ${DAYWB:-0.86,0.9,0.98} --lights "$LIGHTS" --points "$POINTS" --daylights "${DAYL:-1.0}" --smooth 1 --shell N
python3 tools/blender/env_second/lightbake/to_webp.py "$TMP/l3" "$OUTDIR/library_3f_lm" 90
/opt/blenv/bin/python tools/blender/env_second/lightbake/lm_fix_hidden.py -- --in "$OUTDIR/library_3f.glb" --out "$OUTDIR/library_3f.glb" --lm "$OUTDIR/library_3f_lm"
cp "$TMP/l3.json" tools/blender/env_second/lightbake/library_3f_lm.json
echo "done: $OUTDIR/library_3f.glb + library_3f_lm_day/night.webp"
