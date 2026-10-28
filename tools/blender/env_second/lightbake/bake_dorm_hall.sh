#!/bin/bash
# 男一舍門廳（一樓門廳、交誼廳、走廊、樓梯間、二樓走廊；DORM-HALL-LM-1028，LAWWW2-C 2026-10-28；使用者 P0「校內建築室內……廉價手遊感」）：建模 → 光照烘焙（白天／晚上）→ WebP。repo 根目錄跑：
#   bash tools/blender/env_second/lightbake/bake_dorm_hall.sh [取樣數，預設 512] [輸出資料夾，預設 assets/models/env] [貼圖邊長，預設 1024]
# 輸出：dorm_hall.glb（多一套 UV＝TEXCOORD_1）＋ dorm_hall_lm_day.webp、dorm_hall_lm_night.webp。遊戲：dorm3d.js → B3.attachFormal 看到 GLB 的 extras.lightmap 就接（程式不用改）。
# 燈（每支日光燈管一個面光源，在燈管下面 1 cm；燈管、燈座本身不烘）：一樓走廊九支（x −12～12 每 3 m）、門廳和交誼廳六支、二樓走廊九支、樓梯間一支（沿 z）；
#   舍監室裡一盞（窗口看得到裡面，值班的人在那裡；舍監室沒做模型，只有窗口裡的桌子）。白天燈照樣開（走廊整天開燈）。
# 窗：南面門廳大門、交誼廳兩扇窗；走廊東西兩端的窗；樓梯平台的北窗——四面都有窗，外殼只包上下（--shell N,S,E,W＝四面開著）；
#   白平衡比霖澤館大廳輕（0.95,0.93,0.88）：走廊白天、晚上都是日光燈，照大廳的 0.85,0.8,0.72 白天反而比晚上暗。
#   舍監室、洗衣間那一塊沒做模型、南邊西邊直接是天空，用 dorm_hall.py --bakeblock 加的 BAKEONLY_ 板子擋住（--nolm、--drop：不分光照貼圖、輸出前刪掉）。
# --hide 也含 _deco_：某一扇門上、遊戲會照年級藏起來的東西（L1_deco_r202_…，202 的社團貼紙；大四住 409＝202 那扇門）烘焙時當作不存在，門板上才不會留下貼紙的影子
set -e
SAMPLES=${1:-512}
OUTDIR=${2:-assets/models/env}
RES=${3:-1024}
TMP=$(mktemp -d)
# 細小零件不烘（照舊即時光）：頂點色的小東西（鞋、紙、回收桶、滅火器）、門框窗框和門下的百葉、黑色零件、塑膠椅——方塊一面一個島，幾千個島光是 4 像素的間隔
#   就塞不進一張貼圖（排版器把範圍撐到 2 倍，烘出來全黑；10-28 第一次試烘）。和 201 一樣：小東西即時光，在暗處會比旁邊亮一點
NOLM='tube|fixture|glow|_gap|leaf|bark|soil|nosing|screen|vend_panel|steel|BAKEONLY|dm_vc|dm_frame|dm_black|dm_shell'
T1='1.15,0.06'
LIGHTS="-13.5,13.5,0,0,3.26,9,1,13,$T1;0,0,4.5,4.5,3.26,1,1,13,$T1;5,5,3.5,3.5,3.26,1,1,13,$T1;9,9,4.5,4.5,3.26,1,1,13,$T1;12,12,3.0,3.0,3.26,1,1,13,$T1;5,5,6.2,6.2,3.26,1,1,13,$T1;9,9,6.6,6.6,3.26,1,1,13,$T1"
LIGHTS="$LIGHTS;-13.5,13.5,0,0,6.81,9,1,13,$T1;0,0,-3.9,-3.9,6.81,1,1,13,0.06,1.15;-3.6,-3.6,3.2,3.2,3.0,1,1,6,0.6,0.6;0,0,-6.32,-6.32,4.41,1,1,13,$T1"
/opt/blenv/bin/python tools/blender/dorm_hall.py -- --out "$TMP/dorm_hall_plain.glb" --bakeblock
/opt/blenv/bin/python tools/blender/env_second/lightbake/bake_room.py -- --in "$TMP/dorm_hall_plain.glb" --out "$OUTDIR/dorm_hall.glb" \
  --lm "$TMP/dh" --url assets/models/env/dorm_hall_lm --res "$RES" --samples "$SAMPLES" --hide "glass|_deco_" --nolm "$NOLM" --drop BAKEONLY \
  --sun 165,52,2.2 --sky "${SKY:-0.4}" --daywb 0.95,0.93,0.88 --lights "$LIGHTS" --smooth 1 --shell N,S,E,W
python3 tools/blender/env_second/lightbake/to_webp.py "$TMP/dh" "$OUTDIR/dorm_hall_lm" 90
cp "$TMP/dh.json" "$OUTDIR/dorm_hall_lm.json"
[ "$OUTDIR" = "assets/models/env" ] && mv "$OUTDIR/dorm_hall_lm.json" tools/blender/env_second/lightbake/dorm_hall_lm.json
rm -rf "$TMP"
echo "done: $OUTDIR/dorm_hall.glb + dorm_hall_lm_day/night.webp"
