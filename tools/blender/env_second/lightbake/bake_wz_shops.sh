#!/bin/bash
# 溫州街三家新店（半熟、阿德影印輸出、一盞；wz_brunch／wz_print／wz_teahouse 區域；INTERIOR-AAA-REVIEW-1028，LAWWW2-B 2026-10-31；照 bake_cvs.sh、bake_cafe.sh）：
#   建模 → 光照烘焙（白天／晚上）→ WebP。repo 根目錄跑：
#   bash tools/blender/env_second/lightbake/bake_wz_shops.sh brunch|print|teahouse [取樣數，預設 512] [輸出資料夾，預設 assets/models/env/second_ai] [貼圖邊長，預設 1024]
# 輸出：wz_<店>_interior.glb（多一套 UV＝TEXCOORD_1、extras.lightmap）＋ wz_<店>_interior_lm_day.webp、_night.webp。
#   遊戲：zones3d.js 的 wzShop → attachRoomGLB 看到 GLB 的 extras.lightmap 就接（和 Café、麵店同一套）；這三家沒有另外加補光（便利商店 CVS_BOUNCE、書店 BK_BOUNCE 那種），不用改程式。
# 座標＝遊戲區域座標（wz_shops_interior.py：room() 中心在原點、店門在 +z）。燈的位置照 wz_shops_interior.py 和 src/data/wz_shops_layout.js（改那邊要一起改）。
# 方位：溫州街區域沒有轉方向（x 往東、−z 往北）。
#   半熟在街的北側、店面朝南：房間的 +z＝真的南邊，下午的太陽從店面的窗照進來（--sun 215°，房間座標＝真的羅盤方位）。
#   阿德影印、一盞在街的南側、店面朝北：太陽在屋子後面，白天只有店面（一盞：前院）進來的天光（太陽 0）。
# 10-31 試烘（64 取樣，遊戲內同角度和改前比）：半熟第一版白天偏灰（天光 0.8、白平衡 0.97,0.93,0.86、白天燈 0.6）→ 定案天光 1.0、白平衡 1.0,0.94,0.86、白天燈 0.9；
#   影印店、一盞第一版就用；三家都把照條件出現的物件放進 --hide。
set -e
SHOP=${1:?brunch|print|teahouse}
SAMPLES=${2:-512}
OUTDIR=${3:-assets/models/env/second_ai}
RES=${4:-1024}
TMP=$(mktemp -d)
NAME=wz_${SHOP}_interior
PT=""; LIGHTS=""
case "$SHOP" in
brunch)
  # 半熟（6.4×10×3.2 m）：每張桌子上方一盞黑色錐形燈罩的吊燈（燈罩下緣 2.15 m，燈泡在燈罩裡：光往下、天花板只吃反彈光）；
  #   出餐檯上方兩盞保溫燈（燈罩下緣 1.77 m，偏橘）；天花板兩條軌道（z −1.0、1.8）各三顆往下照的投射燈（小面光源，只往下）。白天燈也開著（--daylights）。
  # --hide：玻璃、燈泡（點光源放在燈泡的位置：燈泡的球會把光整個擋住；和 Café 一樣烘焙時當作不存在，照舊自己發光）、
  #   支線做完才出現的證書（TRACE_SQ20：遊戲平常藏著，烘焙時在的話右牆會多兩塊影子——10-31 第一次試烘就這樣）。
  # --nolm：燈泡、燈罩、黑鐵（桌腳、時鐘框）、杯盤、罐子、頂點色小零件、黑板、時鐘、蛋的畫、植物、白色小東西、證書（TRACE_）。
  #   地板、天花板、牆、料理台（不鏽鋼：麵店 10-30 的教訓，大面積的不鏽鋼不烘會和旁邊對不起來）、桌椅、出餐檯、櫃台照樣烘。
  HIDE='glass|_bulb|TRACE_'
  NOLM='_ceramic|_vc|WALL_back_board|clock|eggprint|_black|_bulb|_pendant|_pl_|pothos|terra|_white'
  WARM=${LCOL:-1.0,0.86,0.68}
  for xz in "-2.35 -1.3" "-2.35 0.5" "-2.35 2.3" "1.95 1.0" "2.35 3.35"; do set -- $xz; PT="$PT;$1,2.21,$2,${PENDW:-60},$WARM,0.04"; done
  for x in -1.7 0.3; do PT="$PT;$x,1.83,-2.7,${HEATW:-12},1.0,0.72,0.48,0.03"; done
  for zz in -1.0 1.8; do for x in -0.6 0.2 1.0; do   # 軌道上的投射燈：往下照的 12 cm 小面光源（第一次試烘用點光源，離天花板 15 cm，天花板上六個亮斑）
    LIGHTS="$LIGHTS;$(python3 -c "print(f'{$x-0.01:.3f},{$x+0.01:.3f},{$zz-0.01:.3f},{$zz+0.01:.3f},3.04,1,1,${TRACKW:-15},0.12,0.12,$WARM')")"; done; done
  SUN="215,${SUNEL:-38},${SUNW:-1.6}"; SKY=${SKY:-1.0}; DAYWB=${DAYWB:-1.0,0.94,0.86}; DAYL=${DAYL:-0.9}; SHELL=S ;;
print)
  # 阿德影印輸出（4.4×9.2×3.0 m）：天花板四片平板日光燈（1.16×0.56 m，z −2.8、−0.6、1.8、3.6）：面光源往下照，冷白；
  #   燈下 0.8 m 各一顆點光源：面光源只往下照，天花板只吃到地板反彈的光（便利商店、普通教學館同一個問題）。白天燈也開著。
  # --nolm：燈管、燈框、窗框、黑色小零件、紙疊、牆上的紙（本店不影印整本書、營業時間、價目表）。影印機、櫃台、紙箱、文具架、工作檯照樣烘。
  HIDE='glass'
  NOLM='_tube|frame_alu|_black|_notes|nobook|hours|price|_paper'
  COL=${LCOL:-0.96,0.98,1.0}
  for zz in -2.8 -0.6 1.8 3.6; do
    LIGHTS="$LIGHTS;$(python3 -c "print(f'-0.01,0.01,{$zz-0.01:.3f},{$zz+0.01:.3f},2.94,1,1,${PANELW:-30},1.16,0.56,$COL')")"
    PT="$PT;0,2.15,$zz,${UPW:-6},$COL"
  done
  SUN="90,30,0"; SKY=${SKY:-0.6}; DAYWB=${DAYWB:-0.96,0.97,0.98}; DAYL=${DAYL:-1.0}; SHELL=S ;;
teahouse)
  # 一盞（主屋 8.4×10×2.6 m、緣側、前院；區域 z −5～9.6）：茶席長桌上方兩盞、兩間和室各一盞和紙燈籠（燈籠下緣 1.75／1.85 m）。
  #   和紙燈罩、燈泡烘焙時當作不存在（--hide）：燈罩是封閉的，點光源在裡面會被整個擋住；和紙本來就往四面透光（天花板也照得到）。
  #   石燈籠的燈泡在石頭的火袋裡（看不到，只有遊戲的光暈），不另外放燈。白天燈籠也開著，弱一點（--daylights）。
  # --hide 也放貓的照片（TRACE_SQ14）、貓碗（WZ_CATBOWL）：照條件出現的東西，影子不能烘進去。
  # 外殼（--shell S,UP）：前院那一面（+z）和上面不包——前院沒有屋頂，天光從上面進來；主屋有天花板擋著。
  # 太陽：前院朝北，下午的太陽在屋子後面偏東（房間座標的 40°＝真的西南 220°），主屋的影子蓋住緣側和前院靠屋子的一半，樟樹的上半、矮木牆照得到。
  # --nolm：樟樹（葉片卡、樹皮）、灌木、楓樹、杜鵑、燈罩、杯盤、頂點色小零件、白色小東西、不鏽鋼、黑鐵、掛軸、貓的照片（TRACE_）、貓碗、
  #   隔壁公寓的牆（背景：16 m 寬、5.6 m 高，退在矮木牆後面 4.5 m）。地板、緣側、天花板、榻榻米、牆、柱、拉門、紙門、坐墊、矮桌、苔地、碎石、踏石、石燈籠、矮木牆照樣烘。
  HIDE='glass|_bulb|washi|TRACE_|CATBOWL'
  NOLM='camphor|wzs_leaf|maple|azalea|_pendant|_ceramic|_vc_parts|_white|_steel|_black|scroll|wzs_neighbor'
  WARM=${LCOL:-1.0,0.84,0.64}
  for p in "-1.6,1.95,0.8" "-1.6,1.95,2.4" "-2.15,2.05,-2.8" "2.15,2.05,-2.8"; do PT="$PT;$p,${LANW:-40},$WARM,0.12"; done
  SUN="40,${SUNEL:-40},${SUNW:-1.4}"; SKY=${SKY:-1.0}; DAYWB=${DAYWB:-0.97,0.96,0.94}; DAYL=${DAYL:-0.5}; SHELL=S,UP ;;
*) echo "未知的店：$SHOP"; exit 1 ;;
esac
PT=${PT#;}; LIGHTS=${LIGHTS#;}
/opt/blenv/bin/python tools/blender/env_second/wz_shops_interior.py -- --shop "$SHOP" --out "$TMP/plain.glb"
python3 -c "import json,sys; d=json.load(open(sys.argv[1])); d['out']='assets/models/env/second_ai/$NAME.glb'; json.dump(d,open(sys.argv[2],'w'),ensure_ascii=False,indent=1)" "$TMP/plain.json" "$OUTDIR/$NAME.json"   # 統計（三角形、材質）
EXTRA=(); [ -n "$LIGHTS" ] && EXTRA+=(--lights "$LIGHTS"); [ -n "$PT" ] && EXTRA+=(--points "$PT")
/opt/blenv/bin/python tools/blender/env_second/lightbake/bake_room.py -- --in "$TMP/plain.glb" --out "$OUTDIR/$NAME.glb" \
  --lm "$TMP/lm" --url assets/models/env/second_ai/${NAME}_lm --res "$RES" --samples "$SAMPLES" --hide "$HIDE" --nolm "$NOLM" \
  --sun "$SUN" --sky "$SKY" --daywb $DAYWB "${EXTRA[@]}" --daylights "$DAYL" --smooth 1 --shell "$SHELL"
python3 tools/blender/env_second/lightbake/to_webp.py "$TMP/lm" "$OUTDIR/${NAME}_lm" 90
/opt/blenv/bin/python tools/blender/env_second/lightbake/lm_fix_hidden.py -- --in "$OUTDIR/$NAME.glb" --out "$OUTDIR/$NAME.glb" --lm "$OUTDIR/${NAME}_lm"
cp "$TMP/lm.json" tools/blender/env_second/lightbake/${NAME}_lm.json
echo "done: $OUTDIR/$NAME.glb + ${NAME}_lm_day/night.webp"
