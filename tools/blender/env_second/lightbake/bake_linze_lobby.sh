#!/bin/bash
# 霖澤館一樓大廳＋二樓迴廊（LINZE-LOBBY-V2-1028，LAWWW2-C 2026-10-28；使用者 P0「校內建築室內……廉價手遊感」）：建模 → 光照烘焙（白天／晚上）→ WebP。repo 根目錄跑：
#   bash tools/blender/env_second/lightbake/bake_linze_lobby.sh [取樣數，預設 512] [輸出資料夾，預設 assets/models/env]
# 輸出：linze_interior.glb（多一套 UV＝TEXCOORD_1）＋ linze_interior_lm_day.webp、linze_interior_lm_night.webp。遊戲：src/building3d.js 的 attachFormal 看到 GLB 的 extras.lightmap 就接（Z3.roomLightmap）。
# 燈（每盞一個面光源；發光面本身不烘，--nolm 的 light_panel）：
#   天花板（8.4 m）十二片燈板 4×3（x −6～6 每 4 m、z −4、0.6、5.2；1.2×0.6）；
#   二樓迴廊樓板下十盞崁燈（x −6～6 每 3 m、z −6.0、−4.4；高 3.875 m）；
#   中庭兩排線型吊燈（6.38 m 高；x 三段、z 0.6、3.8；linze_interior.py 的 L1_pendant_*）。
# 白天：天空＋太陽（方位 165°、仰角 52°：中午前後的秋天，從南面兩層樓高的玻璃照進來）；晚上：只有燈＋一點夜空。玻璃烘焙時當作不存在（--hide glass）。
# 外殼（--shell S,E）：南面、東面一樓是玻璃，天光從這兩面進來；北、西、上、下包黑殼（門縫不漏天光）。
# --nolm（照舊即時光）：發光面、盆栽（葉子、樹皮、土：幾千個小島）、金屬（扶手、欄杆的鋼管）、獎盃獎牌（金、黃銅）、樓梯止滑條（1.5 cm 高，分不到一個像素）。
# 亮度（10-28 校正，五輪；每輪遊戲截圖量地板的顏色，和沒有光照貼圖的同一個模型比）：
#   第一輪（天空 1.0、太陽 2.0、燈 60／15／40 W）白天地板整片發白（202 的 3.5 倍）——南面整片兩層樓高的玻璃，天光比教室多很多。
#   之後：白天燈只開一半時，二樓迴廊（照不到天光）白天比晚上暗一倍，不合理 → 白天燈照樣全開，改把天光降到 0.15。
#   現在：燈 19／4.5／13 W（晚上地板和原本的即時光一樣亮、偏暖）；白天天空 0.15＋太陽 2.2（靠南面玻璃那一帶有一塊陽光，窗框的影子，約是陰影處的 2.5 倍），
#   再乘 --daywb 0.85,0.8,0.72（Nishita 天光偏藍，調成暖灰；整體和原本差不多亮）。--smooth 1：2 會把 12 cm 寬的窗框影子抹掉。
set -e
SAMPLES=${1:-512}
OUTDIR=${2:-assets/models/env}
TMP=$(mktemp -d)
NOLM='light_panel|lightbar|exitglow|leaf|bark|soil|lz_gold|lz_brass|steel|nosing'
LIGHTS='-8,8,-6.3,7.5,8.38,4,3,19,1.14,0.54;-7.5,7.5,-6.8,-3.6,3.865,5,2,4.5,0.26,0.26;-4.725,4.725,-1.0,5.4,6.365,3,2,13,2.8,0.08'
/opt/blenv/bin/python tools/blender/linze_interior.py -- --out "$TMP/linze_interior_plain.glb"
/opt/blenv/bin/python tools/blender/env_second/lightbake/bake_room.py -- --in "$TMP/linze_interior_plain.glb" --out "$OUTDIR/linze_interior.glb" \
  --lm "$TMP/lz" --url assets/models/env/linze_interior_lm --res 1024 --samples "$SAMPLES" --hide glass --nolm "$NOLM" \
  --sun 165,52,2.2 --sky 0.15 --daywb 0.85,0.8,0.72 --lights "$LIGHTS" --smooth 1 --shell S,E
python3 tools/blender/env_second/lightbake/to_webp.py "$TMP/lz" "$OUTDIR/linze_interior_lm" 90
cp "$TMP/lz.json" tools/blender/env_second/lightbake/linze_interior_lm.json
rm -rf "$TMP"
echo "done: $OUTDIR/linze_interior.glb + linze_interior_lm_day/night.webp"
