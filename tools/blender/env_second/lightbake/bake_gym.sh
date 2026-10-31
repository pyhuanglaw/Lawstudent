#!/bin/bash
# 綜合體育館室內（INTERIOR-AAA-REVIEW-1028，LAWWW2-B 2026-10-31；照 bake_library_hall.sh、bake_cvs.sh）：建模 → 光照烘焙（白天／晚上）→ WebP。repo 根目錄跑：
#   bash tools/blender/env_second/lightbake/bake_gym.sh interior [取樣數，預設 256] [輸出資料夾，預設 assets/models/env/second_ai] [貼圖邊長，預設 1024]
# interior＝大廳＋1F 球場（gym 區域，gym_interior.glb；gym_interior.py）；arena＝3F 主球場（gym_arena 區域，gym_arena.glb；gym_arena.py）。B1 之後再加。
# 輸出：gym_interior.glb（多一套 UV＝TEXCOORD_1、extras.lightmap）＋ gym_interior_lm_day.webp、_night.webp。
#   遊戲：gym3d.js 的 gym → Z3.attachRoomGLB 看到 GLB 的 extras.lightmap 就接，不用改程式。
# 座標＝遊戲區域座標（gym_interior.py；配置 src/data/gym_layout.js）：球場 x ±20、z −19～11、高 9 m；大廳 z 11～19、高 4.2 m；入口（玻璃）在 +z。
# 空間大（40×38 m）：10-31 第一次試烘用 2048²、64 取樣就花了一小時（321 個要烘的物件，每個都要烘白天、晚上兩次）。
#   1024² 看得到的面大約 3000 m²，一公尺 19 個像素（5 cm 一格），體育館柔和的光夠用；正式烘焙 1024²、256 取樣、平滑 2。
# 燈（照 gym_interior.py；改那邊要一起改）：
#   球場：屋頂桁架下的高天井燈（燈面 7.25 m，x −12、−4、4、12 × z −14、−9、−4、1、6）：往下照的面光源（0.5 m 見方），冷白。
#     模型裡 z 11 還有一排，剛好嵌在大廳和球場之間的牆裡（gym_interior.py 10-16 的小錯，README 有寫）：烘焙不放。
#   大廳：天花板嵌燈（x −14、−7、0、7、14 × z 13、17，4.19 m）：往下照的面光源，暖白。
#   白天燈開著（--daylights）。
# 東西兩面的高窗：外面沒做東西，是自發光的天空色（gym_window_sky）。烘焙時用 --dayemit 讓它在白天那一張發光（天光從高窗進來），
#   烘完把 extras.lightmap.dayEmit 拿掉：遊戲的 gym 區域自己照時段調高窗的亮度（gym3d.js skyLevel），Z3.roomLightmap 再調一次會互相蓋掉。
# 外殼（--shell S）：大廳入口（+z）有玻璃，天光從這一面進來；其他包黑殼。太陽強度 0（高窗不是真的開口），方位只決定天空的顏色（見下面第二版）。
# --hide：玻璃、燈面（gym_light：下面放面光源）、第二會場（SET_SECONDHALL：平常藏著，畢業典禮那天才打開）、羽球網（SET_NETS：第二會場打開的日子收起來）——
#   照條件出現的東西，影子不能烘進地板。第二會場的折疊椅是 GPU instancing：--keep-instances 照舊輸出成實例。
# --nolm（照舊即時光）：桁架（細的鋼管，幾千個小島）、燈罩、黃銅、小零件、籃框、膠帶、牌子（記分板、指標、公告、開館時間、樓層指引、樓梯口的告示）、高窗發光面、窗框。
#   地板、球場、天花板、屋頂板、牆、護牆軟墊、石材、看台、木格柵、服務台照樣烘。
# 10-31 試烘（64 取樣、2048²）：大廳白天整片偏藍灰（入口玻璃的天光＋白平衡 0.96,0.97,1.0）→ 白平衡改 1.0,0.98,0.95；球場地板 64 取樣的雜訊明顯。
#   正式第一版（1024²、256）：大廳白天照樣偏藍（分隔牆的石材、地板）——入口大片玻璃進來的天光本身偏藍 → 白平衡 1.0,0.93,0.84、天光 0.5→0.4（大廳多靠嵌燈的暖光）。
#   第二版：還是藍（石牆原本深咖啡 61,54,41 → 98,110,110）。原因是烘焙的天空（Nishita）照太陽方位上色：--sun 90（東）時，入口（+z＝南）看出去是背對太陽、偏藍的那一片天。
#     → 太陽方位改 180（入口那一側，強度照樣 0：高窗不是真的開口），入口看出去是靠太陽、偏白的天；天光 0.3、白平衡 1.0,0.96,0.9。
#   第三版：大廳的石牆、地板是中性灰（石材本身就是灰色花崗石 #8e8b85；改前偏咖啡是暖色的即時環境光），球場白天、晚上都比改前自然；
#     但大廳天花板只有地板反彈的光，白天 0.126（畫面上深灰）→ 第四版加天花板補光（見下面）。
set -e
ZONE=${1:?interior|arena}
SAMPLES=${2:-256}
OUTDIR=${3:-assets/models/env/second_ai}
RES=${4:-1024}
TMP=$(mktemp -d)
case "$ZONE" in
interior)
  NAME=gym_interior; SCRIPT=tools/blender/env_second/gym_interior.py
  HIDE='glass|gym_light|SET_SECONDHALL|SET_NETS'
  NOLM='gym_steel$|gym_steel_dk|gym_brass|gym_vc_parts|gym_rim|gym_tape|gym_white|gym_wayfind|gym_directory|gym_hours|gym_notice|PLATE_FACE|WALL_back_score|_sky$|_steel_dk$'
  COOL=${HBCOL:-0.97,0.98,1.0}; WARM=${DLCOL:-1.0,0.9,0.76}
  LIGHTS=""
  for zz in -14 -9 -4 1 6; do for x in -12 -4 4 12; do
    LIGHTS="$LIGHTS;$(python3 -c "print(f'{$x-0.01:.3f},{$x+0.01:.3f},{$zz-0.01:.3f},{$zz+0.01:.3f},7.22,1,1,${HBW:-150},0.5,0.5,$COOL')")"; done; done
  for zz in 13 17; do for x in -14 -7 0 7 14; do
    LIGHTS="$LIGHTS;$(python3 -c "print(f'{$x-0.01:.3f},{$x+0.01:.3f},{$zz-0.01:.3f},{$zz+0.01:.3f},4.17,1,1,${DLW:-20},0.36,0.36,$WARM')")"; done; done
  LIGHTS=${LIGHTS#;}
  # 大廳天花板的補光（第四版）：嵌燈只往下照，天花板只吃到地板反彈的光，第三版白天只有 0.126（畫面上深灰，比改前的白天花板暗很多）。
  #   嵌燈正下方 2.3 m 高（離天花板 1.9 m）各一顆柔和的點光源（半徑 0.6 m），把天花板提亮一些；嵌燈 25 → 20 W，地板不要跟著變太亮。
  PT=""; for zz in 13 17; do for x in -14 -7 0 7 14; do PT="$PT;$x,2.3,$zz,${FILLW:-8},$WARM,0.6"; done; done; PT=${PT#;}
  EXTRA=(--points "$PT" --dayemit "gym_window_sky=${SKYWIN:-3.0}" --sun 180,25,0 --sky "${SKY:-0.3}" --daywb ${DAYWB:-1.0,0.96,0.9} --daylights "${DAYL:-0.7}" --shell S --keep-instances) ;;
arena)
  # 3F 主球場（gym_arena 區域，gym_arena.glb；gym_arena.py）：場地 44×39 m、東西南三面下層看台、上層看台（4、5F）、北牆大螢幕、屋頂桁架 23 m 高。
  # 燈（照 gym_arena.py；改那邊要一起改）：屋頂桁架下的 LED（燈罩下緣 20.4 m，x −18～18 每 6 m × z −19～23 每 6 m，56 盞）：往下照的面光源（0.7 m 見方），冷白。白天燈也開著。
  # 東西兩面看台頂上的高窗（arena_window_sky：gym_arena.py v8 從 LED 的發光面 arena_light 分出來）：外面沒做東西。烘焙時整間包黑殼（--shell NONE：沒有開著的面），
  #   白天那一張讓高窗發光（--dayemit：天光只從高窗進來），晚上不亮。
  #   遊戲的 gym_arena 區域沒有照時段調高窗（原本和 LED 共用材質，一直亮），所以不用像 1F 那樣拿掉 dayEmit：Z3.roomLightmap 晚上把它調暗，高窗晚上不再是白的。
  # --hide：玻璃（門）、布置（SET_：舞台、典禮、演講、演唱會，平常藏著——影子不能烘進地板）。
  # --nolm：下層看台的座位（GPU instancing：一個網格給幾百個座位用，第二套 UV 沒辦法每個座位不同）、桁架鋼管、深色鋼件（欄杆、燈罩）、
  #   燈和高窗的發光面、大螢幕、記分板、出口燈、布旗。場地、看台踏面、上層的座位帶、牆、吸音板、屋頂板照樣烘。
  NAME=gym_arena; SCRIPT=tools/blender/env_second/gym_arena.py
  HIDE='glass|SET_'
  NOLM='arena_seats_lower|arena_steel|arena_light|arena_sky|arena_screen|arena_score|arena_exit|arena_banner'
  COOL=${HBCOL:-0.97,0.98,1.0}
  LIGHTS=""
  for zz in -19 -13 -7 -1 5 11 17 23; do for x in -18 -12 -6 0 6 12 18; do
    LIGHTS="$LIGHTS;$(python3 -c "print(f'{$x-0.01:.3f},{$x+0.01:.3f},{$zz-0.01:.3f},{$zz+0.01:.3f},20.38,1,1,${LEDW:-220},0.7,0.7,$COOL')")"; done; done
  LIGHTS=${LIGHTS#;}
  EXTRA=(--dayemit "arena_window_sky=${SKYWIN:-3.0}" --sun 180,25,0 --sky 0 --daywb ${DAYWB:-1.0,0.97,0.93} --daylights "${DAYL:-0.8}" --shell NONE --keep-instances) ;;
*) echo "未知的區域：$ZONE"; exit 1 ;;
esac
/opt/blenv/bin/python $SCRIPT -- --out "$TMP/plain.glb"
python3 -c "import json,sys; d=json.load(open(sys.argv[1])); d['out']='assets/models/env/second_ai/$NAME.glb'; json.dump(d,open(sys.argv[2],'w'),ensure_ascii=False,indent=1)" "$TMP/plain.json" "$OUTDIR/$NAME.json"   # 統計（三角形、材質）
/opt/blenv/bin/python tools/blender/env_second/lightbake/bake_room.py -- --in "$TMP/plain.glb" --out "$OUTDIR/$NAME.glb" \
  --lm "$TMP/lm" --url assets/models/env/second_ai/${NAME}_lm --res "$RES" --samples "$SAMPLES" --hide "$HIDE" --nolm "$NOLM" \
  --lights "$LIGHTS" "${EXTRA[@]}" --smooth ${SMOOTH:-2}
python3 tools/blender/env_second/lightbake/to_webp.py "$TMP/lm" "$OUTDIR/${NAME}_lm" 90
/opt/blenv/bin/python tools/blender/env_second/lightbake/lm_fix_hidden.py -- --in "$OUTDIR/$NAME.glb" --out "$OUTDIR/$NAME.glb" --lm "$OUTDIR/${NAME}_lm"
# 匯出以後的兩件事（不用重烘）：
#   ①材質的單面／雙面照白模（$TMP/plain.glb）還原：bake_room.py 重匯以後，樓梯口指標的字面 cafe_sign_face 變成雙面（白模是單面：PERF-SINGLESIDE-GLB-1025；
#     tests/singleside_gym_unit.js 第 1 項抓到）
#   ②interior：高窗的亮度由遊戲的 gym 區域自己照時段調（見開頭）：extras.lightmap.dayEmit 拿掉（arena 留著）
python3 tools/blender/env_second/lightbake/glb_restore_sides.py "$OUTDIR/$NAME.glb" "$TMP/plain.glb" $([ "$ZONE" = interior ] && echo --drop-dayemit)
cp "$TMP/lm.json" tools/blender/env_second/lightbake/${NAME}_lm.json
echo "done: $OUTDIR/$NAME.glb + ${NAME}_lm_day/night.webp"
