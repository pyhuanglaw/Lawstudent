#!/bin/bash
# 萬才館室內（一樓大廳＋二樓走廊、迴廊、門廳；WANCAI-LM-1028，LAWWW2-C 2026-10-28；使用者 P0「校內建築室內……廉價手遊感」）：建模 → 光照烘焙（白天／晚上）→ WebP。repo 根目錄跑：
#   bash tools/blender/env_second/lightbake/bake_wancai.sh [取樣數，預設 512] [輸出資料夾，預設 assets/models/env]
# 輸出：wancai_interior.glb（多一套 UV＝TEXCOORD_1）＋ wancai_interior_lm_day.webp、wancai_interior_lm_night.webp。遊戲：src/building3d.js 的 attachFormal 看到 GLB 的 extras.lightmap 就接
# （霖澤館大廳 LINZE-LOBBY-V2-1028 的程式；萬才館的 wancai3d.js 也呼叫 B3.attachFormal）。
# 燈（每盞一個面光源；發光面本身不烘）：天花板（8.4 m）十二片燈板 4×3（x −6～6 每 4 m、z −4.5、0.1、4.7）；二樓走廊樓板下十二盞崁燈（x −7.5～7.5 每 3 m、z −5.6、−3.4）；
#   迴廊下兩盞（x −6.05、z 0、2.6）；中庭兩排線型吊燈（6.4 m，WANCAI-DRESS-1028 加的）。窗：南面東段兩層樓高的玻璃帷幕（x −5.1～9.0）。
# --nolm 另外加：展示櫃的燈條、獎盃獎牌（金、黃銅）。
# 亮度、白平衡照霖澤館大廳校正好的（bake_linze_lobby.sh 的說明）：一樣的燈具、一樣朝南的玻璃中庭。
set -e
SAMPLES=${1:-512}
OUTDIR=${2:-assets/models/env}
TMP=$(mktemp -d)
NOLM='light_panel|lightbar|glow|leaf|bark|soil|steel|nosing|gold|brass'
LIGHTS='-8,8,-6.8,7.0,8.38,4,3,19,1.14,0.54;-9,9,-6.7,-2.3,3.885,6,2,4.5,0.26,0.26;-6.55,-5.55,-1.3,3.9,3.885,1,2,4.5,0.26,0.26;-3.6,6.0,-0.4,6.0,6.365,3,2,13,2.8,0.08'
/opt/blenv/bin/python tools/blender/wancai_interior.py -- --out "$TMP/wancai_interior_plain.glb"
/opt/blenv/bin/python tools/blender/env_second/lightbake/bake_room.py -- --in "$TMP/wancai_interior_plain.glb" --out "$OUTDIR/wancai_interior.glb" \
  --lm "$TMP/wc" --url assets/models/env/wancai_interior_lm --res 1024 --samples "$SAMPLES" --hide glass --nolm "$NOLM" \
  --sun 165,52,2.2 --sky 0.15 --daywb 0.85,0.8,0.72 --lights "$LIGHTS" --smooth 1 --shell S
python3 tools/blender/env_second/lightbake/to_webp.py "$TMP/wc" "$OUTDIR/wancai_interior_lm" 90
cp "$TMP/wc.json" tools/blender/env_second/lightbake/wancai_interior_lm.json
rm -rf "$TMP"
echo "done: $OUTDIR/wancai_interior.glb + wancai_interior_lm_day/night.webp"
