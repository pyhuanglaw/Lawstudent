#!/bin/bash
# 美國交換的室內光照烘焙（INTERIOR-AAA-REVIEW-1028 最後一批，LAWWW2-B 2026-10-31；照 bake_gym.sh）：建模 → 光照烘焙（白天／晚上）→ WebP。repo 根目錄跑：
#   bash tools/blender/env_second/lightbake/bake_us.sh apartment|shared|lawlib|market|bigmart [取樣數，預設 256] [輸出資料夾，預設 assets/models/env/second_ai] [貼圖邊長，預設 1024]
# apartment＝祐廷的單人戶（us_apartment 區域，us_apartment.glb；us_apartment.py，配置 src/data/us_apartment_layout.js）；shared＝學姊她們的 C 棟合租戶（us_shared，同一支 us_apartment.py）；
# lawlib＝法學院圖書館（us_lawlib）；market＝竹葉亞洲超市（us_asian_market）。各自的說明在下面。
#   遊戲：us3d.js 的公寓區域走 Z3.attachRoomGLB，看到 GLB 的 extras.lightmap 就接（和台灣那幾間一樣，不用改程式）。
# 輸出：<名字>.glb（多一套 UV＝TEXCOORD_1、extras.lightmap）＋ <名字>_lm_day.webp、_night.webp。
set -e
ZONE=${1:?apartment|shared|lawlib|market|bigmart}
SAMPLES=${2:-256}
OUTDIR=${3:-assets/models/env/second_ai}
RES=${4:-1024}
TMP=$(mktemp -d)
PT=""; LIGHTS=""; DROPDE=""; SARGS=(); DF=""
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
  #   白天：房間的燈開一部分（--daylights 0.4），天光從北窗、陽台門進來（--sky 0.8）；不放太陽（--sun 強度 0）。
  #   試過的（README）：第一版天光 1.0／燈 0.2（壁板擋住窗，天光進不來）→ 第二版天光 1.5／燈 0.3／太陽 3（床中間、陽台過曝）→
  #   第三版天光 0.7／燈 0.4／太陽 1.5（大門開著，太陽從門照進走道一塊 2.0；烘進去的太陽整天同一個位置，早上八點、下午五點都在那裡）→ 第四版太陽 0
  #   （白天床面中間還是一塊 2.0：不是太陽，是北窗低角度的天光照在白色床單上）→ 第五版天光 0.45／燈 0.5（床尾照舊一塊 2.0）→
  #   第六版：窗外景春天那一組留著擋低角度的天空（見下面 --hide），天光 0.8／燈 0.4（床尾照舊 3 成到 2.0：進來的是窗戶上半 25～36° 的天空，對面的樓擋不到）→
  #   第七版：白天那張超過 0.9 的亮度平滑壓到最多 1.4（bake_room.py --knee；0.9 以下不變）
  #   第八版（11-01，LAWWW-B 派「公寓門外平台、陽台白天偏白」）：屋外的地板、屋簷、外牆（usa_concrete、usa_roof、breezeway_wall_w、WALL_*_siding、陽台桌）白天那一張乘 0.7、超過 0.5 的壓到最多 0.7（bake_room.py --dayscale）；平台 0.85、陽台 1.36 → 約 0.6、0.7。屋裡、晚上不動
  #   第九版（11-01，LAWWW-B 派「鄰居的門白天偏亮」）：平台上鄰居 213 的門（door213，白色六片門板；和屋裡的門同一個材質 usa_door、但是自己一個物件）白天那一張乘 0.65：
  #     旁邊的外牆壓暗了，白門照舊 0.47～0.6，看起來是一片偏藍的亮白
  # --hide：玻璃、雪景那一組窗外景（usa_view_on、usa_lot_on）、燈的光暈（GLOW、US_glow）。
  # 窗外景春天那一組（usa_view_off：窗外 9 m 對面的公寓、樹林；usa_lot_off：樓下的停車場）烘焙時留著（--nolm，不烘）：
  #   對面的公寓擋住低角度的天空、停車場把天光反上來（第二～五版藏起來：窗外整片是最亮的地平線天空，北窗正前方的床尾白天一大塊 2.0，天光從 1.5 降到 0.45 都還在）；
  #   景本身是自發光的貼圖：只在白天那一張發光（--dayemit），晚上暗；烘完拿掉 dayEmit（遊戲 viewTint 自己照時段調，和法學院圖書館一樣）。
  # --nolm：GPU instancing 的椅子（陽台椅、吧檯椅：匯入以後叫 US_BALCONY_CHAIR.NNN、US_BARSTOOL.NNN）、百葉（半透明的貼圖：照舊擋光、透光，但不烘）、
  #   黑色小零件、鍍鉻、壁燈、門牌（遊戲畫字）、廚房檯面的小東西、毛巾架、梯子書架、衣物間的衣服和鐵線層架、陽台和平台的欄杆（細）。
  # 外殼（--shell N,S）：北牆的窗、南邊門外的走廊平台不包（天光從這兩邊來）。
  NAME=us_apartment; SCRIPT=tools/blender/env_second/us_apartment.py; DROPDE=--drop-dayemit
  HIDE='glass|usa_view_on|usa_lot_on|usa_view_snow|GLOW|US_glow'
  NOLM='usa_view|usa_lot|US_BALCONY_CHAIR|US_BARSTOOL|usa_blinds|usa_black|usa_chrome|usa_sconce|PLATE_FACE|US_KITCHEN_LIFE|US_TOWELBAR|US_LADDER|usa_closet_clothes|usa_closet_shelf|usa_rail'
  WARM=${LCOL:-1.0,0.87,0.7}
  for xz in "-1.6 -1.0 2.16 ${FANW:-35} 0.4" "3.2 -1.0 2.43 ${BEDW:-30} 0.3" "-3.2 2.0 2.56 ${KITW:-22} 0.3" "-1.0 2.0 2.56 ${HALW:-12} 0.25" "1.6 2.0 2.46 ${CLOW:-8} 0.25" "3.9 1.6 2.56 ${BATHW:-15} 0.25"; do
    set -- $xz; LIGHTS="$LIGHTS;$(python3 -c "print(f'{$1-0.01:.3f},{$1+0.01:.3f},{$2-0.01:.3f},{$2+0.01:.3f},$3,1,1,$4,$5,$5,$WARM')")"; done
  PT="-1.6,2.05,-1.0,${FANUP:-6},$WARM,0.3;3.2,2.3,-1.0,${BEDUP:-4},$WARM,0.25;0.0,2.3,4.0,${LANDW:-10},$WARM,0.15;4.57,1.06,-0.78,${DESKW:-5},$WARM,0.05;-4.29,0.98,-2.6,${ENDW:-5},$WARM,0.05"
  EXTRA=(--emit usa_sconce=0 --dayemit "usa_view_spring=${VIEWW:-1.0}" --sun 180,35,${SUNW:-0} --sky "${SKY:-0.8}" --daywb ${DAYWB:-0.98,0.98,1.0} --daylights "${DAYL:-0.4}" --knee "${KNEE:-0.9,1.4}" --dayscale "${OUTSCALE:-usa_concrete|usa_roof|breezeway_wall|_siding|US_BALCONY_TABLE=0.7,0.5,0.7;door213=${NBDOOR:-0.65}}" --shell N,S --keep-instances) ;;
shared)
  # 學姊她們的 C 棟三人合租戶（208；us_shared 區域，us_shared.glb）：和單人戶同一支 us_apartment.py（--layout src/data/us_shared_layout.js），格局見那份配置的開頭。
  #   窗、陽台玻璃門在北牆，大門在南牆、外面是有屋頂的走廊平台——天光、外殼、窗外景、--nolm／--hide 都照單人戶（上面 apartment 那一段的說明）。
  # 燈（照配置的燈具：furniture 的 ceilingFan、ceilingLight、breezewaySconce；us3d.js 合租戶的點光源和單人戶同一組位置）：
  #   客廳吊扇燈 (−1.6,−1.0)；廚房吸頂燈 (−3.2,2.0)；臥室 A 吸頂燈 (3.2,−2.0)（門關著，玩家不進去：小一點）；走道 (−1.0,2.0) 沒有燈具、天花板下一顆小面光源；
  #   門外平台的壁燈 (−0.2,3.05,y 2)：旁邊一顆點光源。臥室 B、衛浴、衣物間（B 的套房，門關著）不放燈。
  # 臥室 A、B 的床、書桌椅兩間一樣、匯出是 GPU instancing（US_BED、US_DESKCHAIR）：不烘（--nolm；同一份 UV 兩個位置的光不一樣，和陽台椅、吧檯椅一樣）。
  # EVENT_US2（9/13 的劇情道具，平常藏著）烘焙時當作不存在（--hide）：影子不烘進地板；劇情時才出現，用即時光。
  # 屋外（陽台、平台的地板、屋簷、外牆）白天壓暗，和單人戶第八版一樣（--dayscale）。
  # 第三版（11-01，LAWWW-B 派美國收尾第二輪）：
  #   鄰居 207 的門（door213 物件，和單人戶同一個）白天乘 0.65，和單人戶第九版一樣。
  #   客廳東邊（臥室 A、B 門前）白天只有 0.17～0.25（窗都在北牆西半邊）：天花板下一片只在白天的朝下補光（bake_room.py --dayfill），x 0.3～1.3、z −2.8～0.8、12 W。
  NAME=us_shared; SCRIPT="tools/blender/env_second/us_apartment.py"; SARGS=(--layout src/data/us_shared_layout.js --const US_SHARED_LAYOUT --root us_shared); DROPDE=--drop-dayemit
  HIDE='glass|usa_view_on|usa_lot_on|usa_view_snow|GLOW|US_glow|EVENT_US2'
  NOLM='usa_view|usa_lot|US_BALCONY_CHAIR|US_BARSTOOL|US_BED|US_DESKCHAIR|usa_blinds|usa_black|usa_chrome|usa_sconce|PLATE_FACE|US_KITCHEN_LIFE|US_TOWELBAR|US_LADDER|usa_closet_clothes|usa_closet_shelf|usa_rail'
  WARM=${LCOL:-1.0,0.87,0.7}
  for xz in "-1.6 -1.0 2.16 ${FANW:-35} 0.4" "-3.2 2.0 2.43 ${KITW:-22} 0.3" "3.2 -2.0 2.43 ${BEDW:-18} 0.3" "-1.0 2.0 2.56 ${HALW:-12} 0.25"; do
    set -- $xz; LIGHTS="$LIGHTS;$(python3 -c "print(f'{$1-0.01:.3f},{$1+0.01:.3f},{$2-0.01:.3f},{$2+0.01:.3f},$3,1,1,$4,$5,$5,$WARM')")"; done
  PT="-1.6,2.05,-1.0,${FANUP:-6},$WARM,0.3;-0.2,2.0,3.35,${LANDW:-10},$WARM,0.15"
  DF="0.3,1.3,-2.8,0.8,2.6,1,1,${EASTW:-12},1.0,3.4"   # 試烘 12 W（x 0～1.3、1.2×3.6）：東邊地板 0.17～0.25 → 0.29～0.43，客廳中間也亮了 0.17 → 往東移、窄一點
  EXTRA=(--emit usa_sconce=0 --dayemit "usa_view_spring=${VIEWW:-1.0}" --sun 180,35,${SUNW:-0} --sky "${SKY:-0.8}" --daywb ${DAYWB:-0.98,0.98,1.0} --daylights "${DAYL:-0.4}" --knee "${KNEE:-0.9,1.4}" --dayscale "${OUTSCALE:-usa_concrete|usa_roof|breezeway_wall|_siding|US_BALCONY_TABLE=0.7,0.5,0.7;door213=${NBDOOR:-0.65}}" --shell N,S --keep-instances) ;;
lawlib)
  # 法學院圖書館（us_lawlib 區域，us_lawlib.glb；us_lawlib.py，配置 assets/models/env/second_ai/us_lawlib.layout.json）：四層樓的中庭（一樓走得到，樓上看得到），屋頂中間一片天窗。
  #   遊戲：us3d.js 的 us_lawlib 區域走 Z3.attachRoomGLB；嵌燈、樓梯小燈的發光面整天都亮（圖書館白天也開燈），天窗、彩色玻璃照時段變暗（skyTint）。
  # 窗：只有北牆一樓一整排彩色玻璃（usll_stained_glass，自發光）、屋頂的天窗（usll_skylight，自發光）——整棟包黑殼（--shell NONE），
  #   這兩片只在白天那一張發光（--dayemit：天光從天窗、彩色玻璃進來；照總圖大廳 LIB-HALL-LM-1028 的做法），晚上是暗的。
  # 燈：每一層樓板底下的嵌燈（us_lawlib.py：迴廊每 3.2×3.0 m 一盞，中庭上面沒有）→ 每盞一個往下照的小面光源；位置照同一份配置算（改 us_lawlib.py 的嵌燈要一起改）。
  #   白天燈照樣開（--daylights 1.0）。樓梯邊的小燈（GLOW_usll_stair_lamp）很小，不另外放燈。
  # --hide：玻璃欄杆、門的玻璃（usll_rail_glass）、所有發光面 GLOW_（嵌燈、螢幕、樓梯小燈、出口燈：光改用上面的燈）、
  #   樓梯口的紅絨繩、黃銅柱、小立牌（二樓開放以後遊戲會藏起來：影子不能烘進地板）。
  # --nolm：天窗、彩色玻璃（發光面本身；遊戲照時段調亮暗）、鋼件（欄杆柱）、鐵線雕塑（幾千個細面）。
  # 烘完拿掉 extras.lightmap.dayEmit（glb_restore_sides.py --drop-dayemit）：天窗、彩色玻璃晚上變暗是 us3d.js 的 skyTint 在調，roomLightmap 再調一次會變兩倍暗（照體育館 1F 的高窗）。
  NAME=us_lawlib; SCRIPT=tools/blender/env_second/us_lawlib.py; DROPDE=--drop-dayemit
  HIDE='rail_glass|GLOW_|usll_rope|usll_stanchions'
  NOLM='usll_skylight|_stained|usll_rail_posts|usll_wire_spheres|_steel'   # 彩色玻璃的物件叫 WALL_N_stained（--nolm 比對物件名字；第一版寫 usll_stained 沒對到，彩色玻璃被烘了）
  LIGHTS=$(python3 - "${DLW:-45}" <<'PY'
import json, sys
J = json.load(open('assets/models/env/second_ai/us_lawlib.layout.json')); W = sys.argv[1]
X0, X1, Z0, Z1 = (J['bounds'][k] for k in ('x0', 'x1', 'z0', 'z1')); V = J['void']; SL = J['slab']
BANDS = [(X0, X1, Z0, V['z0']), (X0, X1, V['z1'], Z1), (X0, V['x0'], V['z0'], V['z1']), (V['x1'], X1, V['z0'], V['z1'])]
out = []; seen = set()
for y in J['levels'][1:]:
    for (x0, x1, z0, z1) in BANDS:
        for gx in [x0 + 1.6 + k * 3.2 for k in range(int((x1 - x0 - 0.6) / 3.2))]:
            for gz in [z0 + 1.4 + k * 3.0 for k in range(int((z1 - z0 - 0.6) / 3.0))]:
                if V['x0'] - 0.4 < gx < V['x1'] + 0.4 and V['z0'] - 0.4 < gz < V['z1'] + 0.4: continue
                k = (round(gx, 2), round(gz, 2), y)
                if k in seen: continue
                seen.add(k); out.append(f'{gx - 0.01:.2f},{gx + 0.01:.2f},{gz - 0.01:.2f},{gz + 0.01:.2f},{y - SL - 0.02:.2f},1,1,{W},0.24,0.24,1.0,0.9,0.76')
print(';'.join(out))
PY
)
  # 中庭（一樓到天窗挑空，上面沒有樓板、沒有嵌燈）：中間一顆柔和的補光（位置照 us3d.js 遊戲原本中庭那一盞點光源 (0, 3.7, 0)；第一版沒有，晚上中庭地毯 0.09）
  PT="0,3.7,0,${CENW:-60},1.0,0.92,0.8,1.0"
  EXTRA=(--dayemit "usll_skylight=${SKYLIGHT:-3.0},usll_stained_glass=${STAINED:-1.5}" --sun 200,40,0 --sky 0 --daywb ${DAYWB:-0.95,0.95,1.0} --daylights "${DAYL:-1.0}" --shell NONE) ;;
market)
  # 竹葉亞洲超市（us_asian_market 區域，us_asian_market.glb；us_asian_market.py，配置 assets/models/env/second_ai/us_asian_market.layout.json）：16×12 m、天花板 3.4 m。
  #   正面（南，z 6）整片玻璃＋玻璃門，外面是人行道、停車場（遊戲照舊即時光），馬路對面的草原超市是一片景（usam_view）。
  #   遊戲：us3d.js 的 us_asian_market 區域走 Z3.attachRoomGLB；燈盤、冷藏櫃、燈籠整天都亮。
  # 燈：輕鋼架天花板的燈盤（us_asian_market.py：三排貨架走道上方＋東西兩側，每排五盞，0.58×1.16 m）→ 每盞一個往下照的面光源（冷白）；位置照同一份配置算。
  #   白天燈照樣開（--daylights 1.0）；太陽在南邊，從正面的玻璃照進門口那一帶（--sun 180，強度 1.0：第一版 2.5 門口地板 1.8～2.0，烘進去的光斑整天在同一個位置，太亮）。
  # --hide：玻璃（正面、門、冷藏櫃的門）、窗外的景、發光面 GLOW_（燈盤、冷藏櫃的燈、燈籠、螢幕：光改用上面的燈）。
  # --nolm：店外的停車場、人行道、標線（店外，照舊即時光）、貨架上的商品、價格條、小東西（頂點色）、招牌、金色小零件、黑色小零件、月曆。
  # 外殼（--shell S）：正面玻璃那一面不包。
  NAME=us_asian_market; SCRIPT=tools/blender/env_second/us_asian_market.py
  HIDE='glass|usam_view|GLOW_'
  NOLM='usam_out_|usam_products|usam_vc|usam_price|usam_signs|_sign|usam_gold|usam_black|usam_calendar'
  LIGHTS=$(python3 - "${TRW:-22}" <<'PY'
import json, sys
J = json.load(open('assets/models/env/second_ai/us_asian_market.layout.json')); W = sys.argv[1]; H = J.get('h', 3.4)
X0, X1 = J['bounds']['x0'], J['bounds']['x1']
out = []
for gx in [g['x'] + 1.7 for g in J['gondolas'][:3]] + [X0 + 1.5, X1 - 1.5]:
    for zz in (-4.2, -1.8, 0.6, 3.0, 5.0):
        out.append(f'{gx - 0.01:.2f},{gx + 0.01:.2f},{zz - 0.01:.2f},{zz + 0.01:.2f},{H - 0.04:.2f},1,1,{W},0.56,1.12,0.97,0.98,1.0')
print(';'.join(out))
PY
)
  EXTRA=(--sun 180,35,"${SUNW:-1.0}" --sky "${SKY:-0.8}" --daywb ${DAYWB:-0.98,0.98,1.0} --daylights "${DAYL:-1.0}" --shell S) ;;
bigmart)
  # 草原超市（美式大型超市；us_market 區域，us_market.glb；us_market.py，配置 assets/models/env/second_ai/us_market.layout.json；LAWWW2（帳號 A）2026-11-02，D99 第三項美國交換）：
  #   44×32 m、挑高 6.4 m（外露鋼桁架、鋼承板）。正面（南，z 16）玻璃帷幕＋兩組自動門，外面是停車場（窗景平面）。
  #   遊戲：us3d.js 的 us_market 區域「沒有」走 Z3.attachRoomGLB（g0.add(root)），要加一行 Z3.roomLightmap（patches/us_market_lm_1102.patch）。
  # 輸入：烘焙前、遊戲裡正在用的 us_market.glb（git blob 54fea93d，見 PLAINBLOB）——不從 us_market.py 重做（和總圖 B1 一樣，避免重做出來和部署中的檔不同）。
  # 燈（照 us_market.py「長條 LED」那一段；發光面 GLOW_usm_leds 不烘、照舊自己發光）：每條 LED（4.55～4.6 m）一個往下照的面光源：
  #   貨架走道上方沿 z 的（每排貨架 x＋1.45，z −7.5／−3.8／−0.1／3.6，長 2.8 m）；前段、後段、蔬果區沿 x 的（x −20～20 每 4 m，z −12.6／9.5／13.2）；熟食那三條（x 14～18.6）。
  #   挑高的天花板只吃得到地板反彈的光（總圖 3F 10-31 的教訓）：每條燈下 1.2 m 再一顆往四周散的點光源。白天燈照樣開（--daylights 1.0）。
  #   太陽在南邊（--sun 180），從正面玻璃照進門口那一帶，強度小（亞洲超市第一版 2.5 太亮，定案 1.0）。
  # --hide：玻璃（正面帷幕、冷藏櫃的門）、窗外的景、發光面 GLOW_、自動門。
  # --nolm：貨架上的商品、價格條、層板、走道牌、水果、推車、鍍鉻、黑色小零件、桁架、風管、收銀台輸送帶、門牌（遊戲畫字）、頂點色小東西、店外的地面——
  #   上千個小島排不進一張貼圖（總圖 B1 11-02 試烘：只用到左下角、隔間牆整片黑三角）。
  # 外殼（--shell S）：正面玻璃那一面不包。
  NAME=us_market; PLAINBLOB=54fea93dcabd6fb16317c09bfb1a152c2b2bbb85
  HIDE='glass|case_doors|usm_outside|GLOW_|DOOR_usm'
  NOLM='usm_products|usm_price|usm_shelves|usm_aisle_signs|usm_fruit|usm_cart|usm_chrome|usm_black|usm_joists|usm_ducts|usm_belts|PLATE_FACE|usm_vc|usm_outside|usm_case_frame|usm_mats'
  LIGHTS=$(python3 - "${LEDW:-18}" <<'PY'
import json, sys
J = json.load(open('assets/models/env/second_ai/us_market.layout.json')); W = sys.argv[1]; col = '0.97,0.98,1.0'
out = []
for g in J['gondolas']:
    xa = g['x'] + 1.45
    for zz in (-7.5, -3.8, -0.1, 3.6): out.append(f'{xa - 0.01:.2f},{xa + 0.01:.2f},{zz - 0.01:.2f},{zz + 0.01:.2f},4.53,1,1,{W},0.12,2.8,{col}')
for xx in range(-20, 22, 4):
    for zz in (-12.6, 9.5, 13.2): out.append(f'{xx - 0.01:.2f},{xx + 0.01:.2f},{zz - 0.01:.2f},{zz + 0.01:.2f},4.53,1,1,{W},2.8,0.12,{col}')
for zz in (-6.0, -1.6, 2.8): out.append(f'16.29,16.31,{zz - 0.01:.2f},{zz + 0.01:.2f},4.53,1,1,{W},4.6,0.12,{col}')
print(';'.join(out))
PY
)
  PT=$(python3 - "${UPW:-10}" <<'PY'
import json, sys
J = json.load(open('assets/models/env/second_ai/us_market.layout.json')); W = sys.argv[1]; col = '0.97,0.98,1.0'
out = []
for g in J['gondolas']:
    for zz in (-7.5, -3.8, -0.1, 3.6): out.append(f'{g["x"] + 1.45:.2f},3.35,{zz:.2f},{W},{col},0.3')
for xx in range(-20, 22, 4):
    for zz in (-12.6, 9.5, 13.2): out.append(f'{xx:.2f},3.35,{zz:.2f},{W},{col},0.3')
print(';'.join(out))
PY
)
  EXTRA=(--sun 180,40,"${SUNW:-1.0}" --sky "${SKY:-0.8}" --daywb ${DAYWB:-0.98,0.98,1.0} --daylights "${DAYL:-1.0}" --shell S) ;;
*) echo "未知的區域：$ZONE"; exit 1 ;;
esac
LIGHTS=${LIGHTS#;}
REF="$TMP/plain.glb"; [ -f "assets/models/env/second_ai/$NAME.glb" ] && cp "assets/models/env/second_ai/$NAME.glb" "$TMP/ref.glb" && REF="$TMP/ref.glb"
if [ -n "$PLAINBLOB" ]; then git cat-file -p "$(git rev-parse "$PLAINBLOB")" > "$TMP/plain.glb"   # 部署中的檔（不重做）；統計 json 照舊用 repo 裡那一份
else
/opt/blenv/bin/python $SCRIPT -- "${SARGS[@]}" --out "$TMP/plain.glb"
python3 -c "import json,sys; d=json.load(open(sys.argv[1])); d['out']='assets/models/env/second_ai/$NAME.glb'; json.dump(d,open(sys.argv[2],'w'),ensure_ascii=False,indent=1)" "$TMP/plain.json" "$OUTDIR/$NAME.json"
fi
/opt/blenv/bin/python tools/blender/env_second/lightbake/bake_room.py -- --in "$TMP/plain.glb" --out "$OUTDIR/$NAME.glb" \
  --lm "$TMP/lm" --url assets/models/env/second_ai/${NAME}_lm --res "$RES" --samples "$SAMPLES" --hide "$HIDE" --nolm "$NOLM" \
  --lights "$LIGHTS" --points "$PT" ${DF:+--dayfill "$DF"} "${EXTRA[@]}" --smooth ${SMOOTH:-1}
python3 tools/blender/env_second/lightbake/to_webp.py "$TMP/lm" "$OUTDIR/${NAME}_lm" 90
/opt/blenv/bin/python tools/blender/env_second/lightbake/lm_fix_hidden.py -- --in "$OUTDIR/$NAME.glb" --out "$OUTDIR/$NAME.glb" --lm "$OUTDIR/${NAME}_lm"
python3 tools/blender/env_second/lightbake/glb_restore_sides.py "$OUTDIR/$NAME.glb" "$REF" $DROPDE   # 材質單面／雙面照部署中的那一份還原（見 bake_gym.sh）
# 烘焙紀錄：輸出到正式資料夾時才寫進 tools/（試烘到別的資料夾時放在那裡，不覆蓋 repo 裡定案那一份）
if [ "$OUTDIR" = "assets/models/env/second_ai" ]; then cp "$TMP/lm.json" tools/blender/env_second/lightbake/${NAME}_lm.json; else cp "$TMP/lm.json" "$OUTDIR/${NAME}_lm.json"; fi
echo "done: $OUTDIR/$NAME.glb + ${NAME}_lm_day/night.webp"
