#!/bin/bash
# 美國交換的室內光照烘焙（INTERIOR-AAA-REVIEW-1028 最後一批，LAWWW2-B 2026-10-31；照 bake_gym.sh）：建模 → 光照烘焙（白天／晚上）→ WebP。repo 根目錄跑：
#   bash tools/blender/env_second/lightbake/bake_us.sh apartment [取樣數，預設 256] [輸出資料夾，預設 assets/models/env/second_ai] [貼圖邊長，預設 1024]
# apartment＝祐廷的單人戶（us_apartment 區域，us_apartment.glb；us_apartment.py，配置 src/data/us_apartment_layout.js）。
#   遊戲：us3d.js 的公寓區域走 Z3.attachRoomGLB，看到 GLB 的 extras.lightmap 就接（和台灣那幾間一樣，不用改程式）。
# 輸出：<名字>.glb（多一套 UV＝TEXCOORD_1、extras.lightmap）＋ <名字>_lm_day.webp、_night.webp。
set -e
ZONE=${1:?apartment}
SAMPLES=${2:-256}
OUTDIR=${3:-assets/models/env/second_ai}
RES=${4:-1024}
TMP=$(mktemp -d)
PT=""; LIGHTS=""
case "$ZONE" in
apartment)
  # 公寓在二樓（窗外的停車場在 y −3）：窗、陽台玻璃門都在北牆（z −3，北邊沒有太陽直射）；大門在南牆（z 3），外面是有屋頂的走廊平台。
  # 燈（照 us3d.js 公寓區域的燈位置〔遊戲在 2.25 m 放點光源〕和模型的燈具；改那邊要一起改）：
  #   客廳吊扇燈 (−1.6,−1.0)：燈罩下緣 2.18 m，往下照的面光源＋燈罩旁一顆柔和的點光源（吊扇燈的燈罩是磨砂玻璃，天花板也照得到）。
  #   臥室吸頂燈 (3.2,−1.0)：2.45 m，往下照＋往旁邊漏一點。
  #   廚房 (−3.2,2.0)、走道 (−1.0,2.0)、衣物間 (1.6,2.0)、衛浴 (3.9,1.6)：模型沒有燈具（遊戲是看不到的點光源），天花板下往下照的小面光源。
  #   門外平台 (0,4.0)：壁燈（usa_sconce）旁一顆點光源。
  #   書桌檯燈 (4.57,1.11,−0.78)、邊桌燈 (−4.29,1.03,−2.6)：燈罩裡的光暈（US_glow）位置各一顆小點光源（遊戲沒有這兩盞的點光源，只有光暈）。
  #   衣物間的吸頂燈（usa_sconce 的扁球，2.48～2.6 m）：面光源放在燈下面 2.46 m（放進球裡光出不來）。
  #   模型本身會發光的材質（usa_sconce：壁燈、衣物間吸頂燈、衛浴鏡燈的燈泡）烘焙時不發光（--emit usa_sconce=0）：很小的發光面取樣很吵，光改用上面的燈。
  #   白天：房間的燈多半關著（--daylights 0.2），天光從北窗、陽台門進來；太陽在南邊（北窗沒有直射），只照得到門外的平台。
  # --hide：玻璃、窗外的景（usa_view_*、usa_lot_*：在窗外 9 m 的平面、樓下的停車場；烘焙時不拿掉，天光進不來）、燈的光暈（GLOW、US_glow）。
  # --nolm：GPU instancing 的椅子（陽台椅、吧檯椅：匯入以後叫 US_BALCONY_CHAIR.NNN、US_BARSTOOL.NNN）、百葉（半透明的貼圖：照舊擋光、透光，但不烘）、
  #   黑色小零件、鍍鉻、壁燈、門牌（遊戲畫字）、廚房檯面的小東西、毛巾架、梯子書架、衣物間的衣服和鐵線層架、陽台和平台的欄杆（細）。
  # 外殼（--shell N,S）：北牆的窗、南邊門外的走廊平台不包（天光從這兩邊來）。
  NAME=us_apartment; SCRIPT=tools/blender/env_second/us_apartment.py
  HIDE='glass|usa_view|usa_lot|GLOW|US_glow'
  NOLM='US_BALCONY_CHAIR|US_BARSTOOL|usa_blinds|usa_black|usa_chrome|usa_sconce|PLATE_FACE|US_KITCHEN_LIFE|US_TOWELBAR|US_LADDER|usa_closet_clothes|usa_closet_shelf|usa_rail'
  WARM=${LCOL:-1.0,0.87,0.7}
  for xz in "-1.6 -1.0 2.16 ${FANW:-35} 0.4" "3.2 -1.0 2.43 ${BEDW:-30} 0.3" "-3.2 2.0 2.56 ${KITW:-22} 0.3" "-1.0 2.0 2.56 ${HALW:-12} 0.25" "1.6 2.0 2.46 ${CLOW:-8} 0.25" "3.9 1.6 2.56 ${BATHW:-15} 0.25"; do
    set -- $xz; LIGHTS="$LIGHTS;$(python3 -c "print(f'{$1-0.01:.3f},{$1+0.01:.3f},{$2-0.01:.3f},{$2+0.01:.3f},$3,1,1,$4,$5,$5,$WARM')")"; done
  PT="-1.6,2.05,-1.0,${FANUP:-6},$WARM,0.3;3.2,2.3,-1.0,${BEDUP:-4},$WARM,0.25;0.0,2.3,4.0,${LANDW:-10},$WARM,0.15;4.57,1.06,-0.78,${DESKW:-5},$WARM,0.05;-4.29,0.98,-2.6,${ENDW:-5},$WARM,0.05"
  EXTRA=(--emit usa_sconce=0 --sun 180,35,${SUNW:-3.0} --sky "${SKY:-1.0}" --daywb ${DAYWB:-0.98,0.98,1.0} --daylights "${DAYL:-0.2}" --shell N,S --keep-instances) ;;
*) echo "未知的區域：$ZONE"; exit 1 ;;
esac
LIGHTS=${LIGHTS#;}
REF="$TMP/plain.glb"; [ -f "assets/models/env/second_ai/$NAME.glb" ] && cp "assets/models/env/second_ai/$NAME.glb" "$TMP/ref.glb" && REF="$TMP/ref.glb"
/opt/blenv/bin/python $SCRIPT -- --out "$TMP/plain.glb"
python3 -c "import json,sys; d=json.load(open(sys.argv[1])); d['out']='assets/models/env/second_ai/$NAME.glb'; json.dump(d,open(sys.argv[2],'w'),ensure_ascii=False,indent=1)" "$TMP/plain.json" "$OUTDIR/$NAME.json"
/opt/blenv/bin/python tools/blender/env_second/lightbake/bake_room.py -- --in "$TMP/plain.glb" --out "$OUTDIR/$NAME.glb" \
  --lm "$TMP/lm" --url assets/models/env/second_ai/${NAME}_lm --res "$RES" --samples "$SAMPLES" --hide "$HIDE" --nolm "$NOLM" \
  --lights "$LIGHTS" --points "$PT" "${EXTRA[@]}" --smooth ${SMOOTH:-1}
python3 tools/blender/env_second/lightbake/to_webp.py "$TMP/lm" "$OUTDIR/${NAME}_lm" 90
/opt/blenv/bin/python tools/blender/env_second/lightbake/lm_fix_hidden.py -- --in "$OUTDIR/$NAME.glb" --out "$OUTDIR/$NAME.glb" --lm "$OUTDIR/${NAME}_lm"
python3 tools/blender/env_second/lightbake/glb_restore_sides.py "$OUTDIR/$NAME.glb" "$REF"   # 材質單面／雙面照部署中的那一份還原（見 bake_gym.sh）
cp "$TMP/lm.json" tools/blender/env_second/lightbake/${NAME}_lm.json
echo "done: $OUTDIR/$NAME.glb + ${NAME}_lm_day/night.webp"
