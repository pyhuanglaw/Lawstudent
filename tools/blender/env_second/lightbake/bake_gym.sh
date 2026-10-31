#!/bin/bash
# 綜合體育館室內（INTERIOR-AAA-REVIEW-1028，LAWWW2-B 2026-10-31；照 bake_library_hall.sh、bake_cvs.sh）：建模 → 光照烘焙（白天／晚上）→ WebP。repo 根目錄跑：
#   bash tools/blender/env_second/lightbake/bake_gym.sh interior [取樣數，預設 512] [輸出資料夾，預設 assets/models/env/second_ai] [貼圖邊長，預設 2048]
# interior＝大廳＋1F 球場（gym 區域，gym_interior.glb；gym_interior.py）。3F 主球場（arena）、B1 之後再加。
# 輸出：gym_interior.glb（多一套 UV＝TEXCOORD_1、extras.lightmap）＋ gym_interior_lm_day.webp、_night.webp。
#   遊戲：gym3d.js 的 gym → Z3.attachRoomGLB 看到 GLB 的 extras.lightmap 就接，不用改程式。
# 座標＝遊戲區域座標（gym_interior.py；配置 src/data/gym_layout.js）：球場 x ±20、z −19～11、高 9 m；大廳 z 11～19、高 4.2 m；入口（玻璃）在 +z。
# 空間大（40×38 m）：貼圖 2048²（1024² 只有一公尺 15 個像素左右）。
# 燈（照 gym_interior.py；改那邊要一起改）：
#   球場：屋頂桁架下的高天井燈（燈面 7.25 m，x −12、−4、4、12 × z −14、−9、−4、1、6）：往下照的面光源（0.5 m 見方），冷白。
#     模型裡 z 11 還有一排，剛好嵌在大廳和球場之間的牆裡（gym_interior.py 10-16 的小錯，README 有寫）：烘焙不放。
#   大廳：天花板嵌燈（x −14、−7、0、7、14 × z 13、17，4.19 m）：往下照的面光源，暖白。
#   白天燈開著（--daylights）。
# 東西兩面的高窗：外面沒做東西，是自發光的天空色（gym_window_sky）。烘焙時用 --dayemit 讓它在白天那一張發光（天光從高窗進來），
#   烘完把 extras.lightmap.dayEmit 拿掉：遊戲的 gym 區域自己照時段調高窗的亮度（gym3d.js skyLevel），Z3.roomLightmap 再調一次會互相蓋掉。
# 外殼（--shell S）：大廳入口（+z）有玻璃，天光從這一面進來；其他包黑殼。太陽 0（高窗不是真的開口）。
# --hide：玻璃、燈面（gym_light：下面放面光源）、第二會場（SET_SECONDHALL：平常藏著，畢業典禮那天才打開）、羽球網（SET_NETS：第二會場打開的日子收起來）——
#   照條件出現的東西，影子不能烘進地板。第二會場的折疊椅是 GPU instancing：--keep-instances 照舊輸出成實例。
# --nolm（照舊即時光）：桁架（細的鋼管，幾千個小島）、燈罩、黃銅、小零件、籃框、膠帶、牌子（記分板、指標、公告、開館時間、樓層指引、樓梯口的告示）、高窗發光面、窗框。
#   地板、球場、天花板、屋頂板、牆、護牆軟墊、石材、看台、木格柵、服務台照樣烘。
set -e
ZONE=${1:?interior}
SAMPLES=${2:-512}
OUTDIR=${3:-assets/models/env/second_ai}
RES=${4:-2048}
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
    LIGHTS="$LIGHTS;$(python3 -c "print(f'{$x-0.01:.3f},{$x+0.01:.3f},{$zz-0.01:.3f},{$zz+0.01:.3f},4.17,1,1,${DLW:-25},0.36,0.36,$WARM')")"; done; done
  LIGHTS=${LIGHTS#;}
  EXTRA=(--dayemit "gym_window_sky=${SKYWIN:-3.0}" --sun 90,30,0 --sky "${SKY:-0.5}" --daywb ${DAYWB:-0.96,0.97,1.0} --daylights "${DAYL:-0.7}" --shell S --keep-instances) ;;
*) echo "未知的區域：$ZONE"; exit 1 ;;
esac
/opt/blenv/bin/python $SCRIPT -- --out "$TMP/plain.glb"
python3 -c "import json,sys; d=json.load(open(sys.argv[1])); d['out']='assets/models/env/second_ai/$NAME.glb'; json.dump(d,open(sys.argv[2],'w'),ensure_ascii=False,indent=1)" "$TMP/plain.json" "$OUTDIR/$NAME.json"   # 統計（三角形、材質）
/opt/blenv/bin/python tools/blender/env_second/lightbake/bake_room.py -- --in "$TMP/plain.glb" --out "$OUTDIR/$NAME.glb" \
  --lm "$TMP/lm" --url assets/models/env/second_ai/${NAME}_lm --res "$RES" --samples "$SAMPLES" --hide "$HIDE" --nolm "$NOLM" \
  --lights "$LIGHTS" "${EXTRA[@]}" --smooth 1
python3 tools/blender/env_second/lightbake/to_webp.py "$TMP/lm" "$OUTDIR/${NAME}_lm" 90
/opt/blenv/bin/python tools/blender/env_second/lightbake/lm_fix_hidden.py -- --in "$OUTDIR/$NAME.glb" --out "$OUTDIR/$NAME.glb" --lm "$OUTDIR/${NAME}_lm"
# 高窗的亮度由遊戲的 gym 區域自己照時段調（見開頭）：extras.lightmap.dayEmit 拿掉
python3 - "$OUTDIR/$NAME.glb" <<'PY'
import json, struct, sys
p = sys.argv[1]; b = bytearray(open(p, 'rb').read()); n = struct.unpack('<I', b[12:16])[0]; j = json.loads(b[20:20 + n])
for sc in j.get('scenes', []):
    lm = (sc.get('extras') or {}).get('lightmap')
    if lm and 'dayEmit' in lm: del lm['dayEmit']
s = json.dumps(j, ensure_ascii=False, separators=(',', ':')).encode('utf8'); s += b' ' * ((4 - len(s) % 4) % 4)
rest = bytes(b[20 + n:]); out = struct.pack('<III', 0x46546C67, 2, 12 + 8 + len(s) + len(rest)) + struct.pack('<II', len(s), 0x4E4F534A) + s + rest
open(p, 'wb').write(out); print('dayEmit 拿掉', p)
PY
cp "$TMP/lm.json" tools/blender/env_second/lightbake/${NAME}_lm.json
echo "done: $OUTDIR/$NAME.glb + ${NAME}_lm_day/night.webp"
