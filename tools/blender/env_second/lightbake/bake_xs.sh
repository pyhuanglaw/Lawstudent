#!/bin/bash
# 新生南路走得進去的店（光照第二級最後一組，lm_audit_1107；LAWWW2-B 2026-11-08）：光照烘焙（白天／晚上；南洋 1 廳多一張「開演」）→ WebP。repo 根目錄跑：
#   bash tools/blender/env_second/lightbake/bake_xs.sh <店> [取樣數，預設 512]
#   OUTDIR=<資料夾> 試烘（輸出、烘焙紀錄都寫在那裡，不動 assets）；IN=<原檔> 指定沒烘過的輸入（assets 裡的已經烘過就會停下來）
# 和 bake_gg_new.sh 同一套做法（LAWWW-B 11-07 14:51：可以直接在 aa_support／bb_support 的原檔上烘——只加第二套 UV、extras.lightmap、拆開共用的材質，
#   不動幾何、節點、座標、配置；原作者以後重新匯出，光照貼圖會不見，要再跑一次這支）。原檔的 sha256 記在烘焙紀錄（<名字>_lm.json 的 src_sha256）。
# 遊戲：七個區域都走 Z3.attachRoomGLB（xsshop3d.js 大步／好拍、tongxian3d.js、xsports3d.js、shanlan3d.js、nanyang3d.js），GLB 有 extras.lightmap 就接，不用改程式；
#   大口（dakou3d.js）兩顆 GLB 放在同一個 Group 給 attachRoomGLB，Group 本身沒有 extras.lightmap——要一小段 patch（各自 Z3.roomLightmap）；
#   南洋 1 廳開演關場燈（NY3.houseLights）——要一小段 patch（z.lightsOff）。
# 共同的做法：
#   - 白天：天光從臨街的玻璃進來（外殼只開那幾面）；不放太陽（店在遊戲裡轉過方向，烘進去的太陽整天同一個位置）。
#     白天天光色調 SKYTINT 1.32,1.0,0.72（同公館那一組 11-08：開口大的店門口不會變灰藍；SKYTINT= 空字串＝不套）。
#   - 晚上：只有店裡的燈。
#   - 只烘地板、天花板、牆面（島少、面積大）；家具、商品、頂點色的小東西、金屬、玻璃、發光的東西照舊即時光（--nolm），照樣擋光（地上的接觸陰影烘得進去）。
#   - GPU instancing 的東西照舊（--keep-instances），烘完照原檔補回節點名字、extras（glb_fix_instnames.py）。
set -e
SHOP=${1:?dabu|haopai|tongxian|xsports|shanlan|dakou_1f|dakou_2f|nanyang_lobby|nanyang_hall}
SAMPLES=${2:-512}
OUT=${OUTDIR:-}
LB=tools/blender/env_second/lightbake
TMP=$(mktemp -d)
A=assets/models/env/second_ai
SKYTINT=${SKYTINT-1.32,1.0,0.72}
POSTDAY=()
INST=0
LIGHTS=""; PTS=""
SKYD=${SKY:-1.0}; DAYLD=${DAYL:-0.8}   # bake_room.py 的參數只認第一個：各店要改的在 case 裡改這兩個變數，不要再寫進 EXTRA
area(){   # glow_points.py 的點（x,y,z,W,r,g,b,半徑）→ bake_room --lights 的面光源（朝下）：$1 W、$2×$3 m
  tr ';' '\n' | awk -F, -v w="$1" -v sx="$2" -v sz="$3" '{printf "%s%.3f,%.3f,%.3f,%.3f,%.3f,1,1,%s,%s,%s,%s,%s,%s", (NR>1?";":""), $1, $1, $3, $3, $2, w, sx, sz, $5, $6, $7}'; }
case $SHOP in
dabu)
  # 大步球鞋（BB 製作，bb_support/dabu.glb；新生南路）：7.7 × 12 × 3.4 m；店面（+z）西半櫥窗、東半玻璃門。
  # 燈（GLOW_ 空節點，glow_points.py）：投射燈 9（6 W）、層板燈條 5、櫃台燈條 1（5 W）、吊燈 1（9 W）；倍數 GS。
  # 烘：地板、天花板、四面牆的漆面（WALL_*_*_paint）。牆上的鞋架木作、頂點色零件、鞋子（instancing）不烘。
  # dabu_sun（地上一塊假的陽光，BB 畫的）烘的時候藏起來、照樣輸出。
  GLB=bb_support/dabu.glb; INST=1
  PTS=$(python3 $LB/glow_points.py "${IN:-$A/$GLB}" --scale "${GS:-1.6}" --hide 'glass|dabu_sun$')
  HIDE='glass|dabu_sun$'
  NOLM="^(?!(dabu_floor|dabu_ceiling|WALL_[a-z]+_[a-z]+_paint)\$)"
  EXTRA=(--shell S)
  ;;
haopai)
  # 好拍運動（BB 製作，bb_support/haopai.glb；新生南路）：4.4 × 14 × 3.4 m 窄長店；店面（+z）雙開玻璃門＋兩側落地玻璃。
  # 燈：GLOW_tube 11 支日光燈（前段兩排 8 支在 3.28 m、後段吊頂下 3 支在 2.48 m），每支一個 0.2 × 1.2 m 朝下的面光源（沿 z），TW W。
  # 烘：地板、天花板（含後段吊頂 hp_ceiling 2.6～3.4）、吊頂的側面（hp_soffit_wall）、四面牆（WALL_*_wall_wall、WALL_front_front_wall）。
  GLB=bb_support/haopai.glb; INST=1
  LIGHTS=$(python3 $LB/glow_points.py "${IN:-$A/$GLB}" --only '^GLOW_tube' --drop 0.03 --no-below | area "${TW:-16}" 0.2 1.2)   # 冒煙測試（4 取樣）12 W：0.31／0.27 → 16 W
  # alpha（hp_alpha：右牆洞洞板 23.7 m²、左牆 9.6 m²、球拍卡）烘焙時藏起來（照樣原樣匯出）（11-08 BB-B XS9 雲端判 FAIL：進門右手那面牆整面深灰褐）：
  #   洞洞板離牆 9 mm、貼圖 65% 是透空的，遊戲裡看到的是後面的牆；Cycles 烘焙卻把它當實心，牆的光照 0.02（藏起來試烘 0.45，和左牆、天花板一致）
  # 11-09 BACKFACE-HAOPAI 以後：輸入要先做洞洞板那兩步（glb_flip_faces.py、glb_split_tile.py --gain 3.0；步驟 docs/art-rebuild/second_ai/cc0_help/g3/README.md），
  #   洞洞板看得到了：烘焙時不藏、自己也烘（SHOP-CC0-HELP-1113 第③群：開發分支這一段原本還是舊的，照它烘會把洞洞板弄丟）
  HIDE='glass'
  NOLM="^(?!(hp_floor_floor|hp_ceiling|hp_soffit_wall|WALL_[a-z]+_wall_wall|WALL_front_front_wall|WALL_right_pegwall_alpha)\$)"
  EXTRA=(--shell S)
  ;;
tongxian)
  # 同弦樂器（BB 製作，bb_support/tongxian.glb；新生南路的二樓）：7.1 × 12 × 3.2 m；臨街的窗在後牆（−z，北），店門開在樓梯平台（不是開口）。
  # 燈：tx_emit 的 14 顆（tube_lights.py 讀位置）：東側軌道投射燈 8、西側 4（2.96 m）、吊燈 1（2.58 m）、櫃台檯燈 1（1.22 m）；
  #     燈頭在 tx_emit 網格裡，烘的時候藏起來，光源放在燈頭下 8 cm。投射燈 SW W（預設 9）、吊燈 12 W、檯燈 4 W，暖色。
  # 烘：地板、天花板、四面牆的漆面（WALL_*_plaster）。吉他、吉他牆、木條板、頂點色、金屬不烘。
  GLB=bb_support/tongxian.glb; INST=1
  WC=1.0,0.80,0.58
  PTS=$(python3 $LB/tube_lights.py "${IN:-$A/$GLB}" --mesh 'tx_emit$' --w 1 --shrink 0.0 | tr ';' '\n' | \
    awk -F, -v sw="${SW:-9}" -v wc="$WC" '{x=($1+$2)/2; z=($3+$4)/2; y=$5; w=(y>2.8)?sw:((y>2.0)?12:4); printf "%s%.3f,%.3f,%.3f,%s,%s,0.05", (NR>1?";":""), x, y-0.08, z, w, wc}')
  HIDE='glass|tx_emit$'
  NOLM="^(?!(tx_floor|tx_ceiling|WALL_[a-z]+_plaster)\$)"
  EXTRA=(--shell N)
  ;;
xsports)
  # 新生運動用品（BB 製作，bb_support/xinsheng_sports.glb；新生南路）：15.2 × 16.8 m；前段兩層樓高的挑空（天花板 7.6 m），後段兩層（一樓 3.4 m、二樓到 7.6 m）。
  #   店面（+z）整面玻璃；左牆（−x）上半一整排窗。
  # 燈：GLOW_tube 39 支日光燈（挑空和二樓的天花板 7.48 m 20 支、一樓後段 3.28 m 19 支），每支一個 0.2 × 1.2 m 朝下的面光源，TW W。
  # 烘：兩層的地板、天花板、牆的漆面（L0_／L1_ 的 floor、ceil、WALL_*_wall_wall、xs_plaster）、一樓的石材。
  GLB=bb_support/xinsheng_sports.glb; INST=1
  LIGHTS=$(python3 $LB/glow_points.py "${IN:-$A/$GLB}" --only '^GLOW_tube' --drop 0.03 --no-below | area "${TW:-16}" 0.2 1.2)   # 冒煙測試 12 W：0.36／0.27 → 16 W
  HIDE='glass'
  NOLM="^(?!(L0_floor_floor|L0_ceiling_ceil|L1_slab_floor|L1_ceiling_ceil|L[01]_xs_plaster|L0_xs_stone|WALL_[a-z]+_L[01]_wall_wall)\$)"
  EXTRA=(--shell S,W)
  ;;
shanlan)
  # 山嵐書店（AA 製作，aa_support/shanlan.glb；新生南路）：14 × 18 m、兩層（一層 4.2 m），西南角挑空兩層高；臨街（+z）整面玻璃。
  # 燈（GLOW_ 空節點，glow_points.py）：筒燈 30、投射燈 33、吊燈 4、層板燈條 3、檯燈 3、燈籠 1；燈泡（shl_bulb）烘的時候藏起來。倍數 GS。
  # 烘：兩層的地板、天花板、牆面（shl_wall、WALL_*_shl_wall）、牆上的木作條（WALL_*_shl_wood）。書櫃、書、家具、植物、印刷品不烘。
  GLB=aa_support/shanlan.glb
  PTS=$(python3 $LB/glow_points.py "${IN:-$A/$GLB}" --scale "${GS:-2.2}" --hide 'glass|bulb')   # 冒煙測試 ×1.4：0.32／0.23（書店，頁間 0.29）→ ×2.2
  HIDE='glass|bulb'
  NOLM="^(?!(shl_floor|shl_ceiling1|L2_shl_floor2|L2_shl_ceiling2|shl_wall|WALL_[a-z]+_shl_wall|WALL_[a-z]+_shl_wood)\$)"
  EXTRA=(--shell S)
  # 烘完：左前那根柱子（shl_wall 裡，x −1.5、z 5）朝街那一面白天乘 0.537（線性）（11-08 BB-B XS9 PC GPU：整面亮黃，接受是天光、P3 壓到 0.6 左右，和旁邊柱子接近）：
  #   1F 平均 0.82 → 0.62；整面同一個倍數，保留由下往上的明暗；晚上那張不動。lm_scale_faces.py 只改光照貼圖，不動 GLB
  POSTDAY=(--node '^shl_wall$' --box -2.2,-0.8,0,8.4,4,6.5 --normal z+ --factor 0.537)
  ;;
dakou_1f|dakou_2f)
  # 大口漢堡（BB 製作，bb_support/dakou_1f.glb、dakou_2f.glb；新生南路轉角、24 小時）：12 × 16 m、兩層各 3.6 m；+z（新生南路）和 −x（路口）兩面玻璃。
  #   兩層分開烘（每層一顆 GLB；一樓的天花板、二樓的地板各自包住）。NIGHT_FRONT／NIGHT_WEST（晚上的窗景卡，玻璃外面）烘的時候藏起來。
  # 燈：一樓 dk_lightpanel、二樓 CEIL_LIGHTS（天花板的方形平板燈，tube_lights.py 讀位置）每片一個 0.6 × 0.6 m 朝下的面光源 PW W（預設 5：一樓 60 片、二樓 54 片，每平方公尺約 1.6 W，和便利商店的 3.2 W 比，餐廳暗一點）；
  #     dk_warm（一樓櫃台上 3 盞吊燈、樓梯牆的燈條、門口；二樓 9 盞吊燈、兩條吧台燈條）每個點光源 WW W，暖色；吊燈、燈條烘的時候藏起來。
  # 烘：地板、天花板、牆面（WALL_*_plaster／base／solid）。櫃台、桌椅、頂點色、金屬、菜單螢幕不烘。
  if [ $SHOP = dakou_1f ]; then GLB=bb_support/dakou_1f.glb; PANEL='dk_lightpanel$'; else GLB=bb_support/dakou_2f.glb; PANEL='CEIL_LIGHTS$'; INST=1; fi
  LIGHTS=$(python3 $LB/tube_lights.py "${IN:-$A/$GLB}" --mesh "$PANEL" --w 1 --shrink 0.0 | tr ';' '\n' | \
    awk -F, -v w="${PW:-5}" '{x=($1+$2)/2; z=($3+$4)/2; printf "%s%.3f,%.3f,%.3f,%.3f,%.3f,1,1,%s,0.6,0.6", (NR>1?";":""), x, x, z, z, $5-0.02, w}')
  PTS=$(python3 $LB/tube_lights.py "${IN:-$A/$GLB}" --mesh 'dk_warm$' --w 1 --shrink 0.0 | tr ';' '\n' | \
    awk -F, -v w="${WW:-6}" '{x=($1+$2)/2; z=($3+$4)/2; printf "%s%.3f,%.3f,%.3f,%s,1.0,0.80,0.58,0.05", (NR>1?";":""), x, $5-0.08, z, w}')
  HIDE='glass|NIGHT_|dk_warm$'
  # 11-08：一樓燈板的材質自發光強度 26（二樓同名材質 2.4），烘焙時 60 片燈板本身就是很強的光源，比面光源亮十倍——第一次烘一樓白天／晚上 0.55／0.46、地板一成多燒白，
  #   調 PW 也幾乎沒差。一樓烘焙時把燈板藏起來（照樣原樣匯出，遊戲裡照舊發光），光全部交給面光源。不用 --emit：bake_room.py 匯出前會把 --emit 的材質強度設成 1.0。
  if [ $SHOP = dakou_1f ]; then HIDE="$HIDE|dk_lightpanel\$"; fi
  NOLM="^(?!(FLOOR|CEILING|WALL_[a-z]+_(plaster|base|solid))\$)"
  EXTRA=(--shell S,W)
  ;;
nanyang_lobby)
  # 南洋戲院大廳（BB 製作，bb_support/nanyang_lobby.glb；新生南路）：9.4 × 16.6 × 4.5 m；店門（+z）中間玻璃門、左邊售票亭的背牆。
  # 燈：照配置 nanyang_layout.js 的 lights（BB 寫給烘焙用）：吊燈 3（9 W）、壁燈 2（5 W）、鵝頸燈 2（4 W）、海報投射燈 4（6 W）、櫃台燈帶 1（3 W）、冰箱 1（2 W 冷色）；
  #     暖色燈具（ny_warm）烘的時候藏起來。倍數 GS。
  # 烘：地毯（地板）、天花板、四面牆的漆面（WALL_*_plaster）。護牆板（WALL_*_wains：頂點色、幾千個小面）、櫃台、木作、海報不烘。
  GLB=bb_support/nanyang_lobby.glb
  G=${GS:-8.0}; WC=1.0,0.76,0.50   # 冒煙測試（4 取樣）×1.0 晚上 0.11（太暗，4.5 m 高的大廳）；WebP 值約是線性的 0.42 次方 → 目標 0.27 要 ×8
  PTS=$(node -e "
    const L=require(process.argv[1]).lobby, W={pendant:9,sconce:5,gooseneck:4,poster_spot:6,counter_band:3,fridge:2}, D={pendant:0.12,sconce:0.05,gooseneck:0.06,poster_spot:0.08,counter_band:0.03,fridge:0};
    console.log(L.lights.map(l=>[l.x,(l.y-(D[l.kind]||0.05)).toFixed(3),l.z,(W[l.kind]*$G).toFixed(2),...(l.kind==='fridge'?[0.85,0.92,1.0]:[$WC]),0.05].join(',')).join(';'));" "$PWD/src/data/nanyang_layout.js")
  HIDE='glass|ny_warm$'
  NOLM="^(?!(ny_carpet|CEILING|WALL_[a-z]+_plaster)\$)"
  EXTRA=(--shell S)
  ;;
nanyang_hall)
  # 南洋戲院 1 廳（BB 製作，bb_support/nanyang_hall.glb）：12 × 16.4 m、4.5～5.6 m，地板往銀幕斜下去 0.96 m；沒有窗（外殼六面都包，白天和晚上一樣）。
  # 燈（配置的 HALL_LIGHTS）：場燈 6 盞（兩側壁燈 SCONCE_GLASS，±5.3、2.9 m）HW W；走道地燈 9 盞 0.4 W；太平門 2 盞 1 W（綠）；銀幕前 3 個點 SCW W（冷白）。
  # 第三張「開演」（--dark）：場燈關掉，只剩走道地燈、太平門、銀幕（--darkpoints）。遊戲：NY3.houseLights(false) → z.lightsOff(1)（patch）。
  # 烘：地毯（含斜面）、天花板、四面牆的漆面。座椅、護牆板、壁柱、絨布、銀幕不烘。
  GLB=bb_support/nanyang_hall.glb
  HW=${HW:-100}; SCW=${SCW:-4}   # 冒煙測試（4 取樣）10 W 場燈開著 0.07（太暗）→ 目標 0.2（戲院場燈偏暗）要約 ×10
  PTS=""
  for x in -5.25 5.25; do for z in 3.0 -0.5 -4.0; do PTS="$PTS${PTS:+;}$x,2.75,$z,$HW,1.0,0.74,0.48,0.06"; done; done
  DARKP=$(node -e "
    const H=require(process.argv[1]).hall; const o=[];
    for(const l of H.lights){ if(l.kind==='aisle') o.push([l.x,l.y,l.z,0.4,1.0,0.8,0.55]); if(l.kind==='exit') o.push([l.x,l.y-0.1,l.z,1.0,0.5,1.0,0.6]);
      if(l.kind==='screen') for(const dx of [-2.5,0,2.5]) o.push([l.x+dx,l.y,l.z+0.6,$SCW,0.85,0.9,1.0]); }
    console.log(o.map(a=>a.map(v=>+(+v).toFixed(3)).join(',')).join(';'));" "$PWD/src/data/nanyang_layout.js")
  HIDE='SCONCE_GLASS'
  NOLM="^(?!(nh_carpet|CEILING|WALL_[a-z]+_plaster)\$)"
  SKYTINT=""; SKYD=0; DAYLD=1.0   # 沒有窗：白天和晚上一樣（燈全開、沒有天光）
  DARKOFF='nh_warm'   # 開演時壁燈燈罩、放映室窗的自發光（nh_warm）跟著暗
  EXTRA=(--shell X --nightsky 0 --dark --darksky 0 --darkpoints "$DARKP")
  ;;
*) echo "不認得的店 $SHOP（dabu、haopai、tongxian、xsports、shanlan、dakou_1f、dakou_2f、nanyang_lobby、nanyang_hall）"; rm -rf "${TMP:?}"; exit 1;;
esac
SRC=$A/$GLB
NAME=$(basename "$GLB" .glb)
DST=${OUT:-$(dirname "$SRC")}
IN=${IN:-$SRC}
if python3 -I - "$IN" <<'EOF'
import json, struct, sys
b = open(sys.argv[1], 'rb').read(); J = json.loads(b[20:20 + struct.unpack('<I', b[12:16])[0]])
sys.exit(0 if any('lightmap' in (J['scenes'][i].get('extras') or {}) for i in range(len(J.get('scenes', [])))) else 1)
EOF
then echo "$IN 已經烘過（有 extras.lightmap）：用 IN=<原檔> 指定沒烘過的版本（git log -- $SRC 找烘焙前的 commit，git show <commit>:$SRC）"; rm -rf "${TMP:?}"; exit 1; fi
SHA=$(sha256sum "$IN" | cut -d' ' -f1)
cp "$IN" "$TMP/$NAME.glb"
KEEP=(); [ $INST = 1 ] && KEEP=(--keep-instances)
/opt/blenv/bin/python $LB/bake_room.py -- --in "$TMP/$NAME.glb" --out "$DST/$NAME.glb" \
  --lm "$TMP/$NAME" --url "$(dirname "$SRC")/${NAME}_lm" --res 1024 --samples "$SAMPLES" --hide "$HIDE" --nolm "$NOLM" \
  --lights "$LIGHTS" ${PTS:+--points "$PTS"} --smooth 2 --sun 180,35,0 --sky "$SKYD" --daylights "$DAYLD" "${KEEP[@]}" ${SKYTINT:+--skytint "$SKYTINT"} "${EXTRA[@]}"
python3 $LB/to_webp.py "$TMP/$NAME" "$DST/${NAME}_lm" 90
if [ ${#POSTDAY[@]} -gt 0 ]; then python3 $LB/lm_scale_faces.py "$DST/$NAME.glb" "$DST/${NAME}_lm_day.webp" "${POSTDAY[@]}"; fi   # 白天那張某幾面另外調（各店 case 裡設 POSTDAY）
if [ $INST = 1 ]; then python3 $LB/glb_fix_instnames.py "$TMP/$NAME.glb" "$DST/$NAME.glb" --match; fi   # instancing 節點的名字、extras 照原檔補回去（--match：比對位置，名字整個照原檔；大口二樓、大步的鞋子不是「網格名＋_inst」）
if [ -n "${DARKOFF:-}" ]; then   # 熄燈那一張時一起調暗自發光的材質（遊戲 roomDarkMap 的 spec.darkOff，預設 tube|lamp_bulb）：寫進 extras.lightmap.darkOff
  python3 -I - "$DST/$NAME.glb" "$DARKOFF" <<'EOF'
import json, struct, sys
p, v = sys.argv[1], sys.argv[2]; b = open(p, 'rb').read(); n = struct.unpack('<I', b[12:16])[0]; J = json.loads(b[20:20 + n]); rest = b[20 + n:]
J['scenes'][J.get('scene', 0)]['extras']['lightmap']['darkOff'] = v
js = json.dumps(J, ensure_ascii=False, separators=(',', ':')).encode('utf-8'); js += b' ' * ((4 - len(js) % 4) % 4)
out = struct.pack('<III', 0x46546C67, 2, 12 + 8 + len(js) + len(rest)) + struct.pack('<II', len(js), 0x4E4F534A) + js + rest
open(p, 'wb').write(out)
EOF
fi
python3 -I - "$TMP/$NAME.json" "$SHA" "$SRC" <<'EOF'
import json, sys
j = json.load(open(sys.argv[1])); j['src'] = sys.argv[3]; j['src_sha256'] = sys.argv[2]
json.dump(j, open(sys.argv[1], 'w'), ensure_ascii=False, indent=1)
EOF
if [ -z "$OUT" ]; then cp "$TMP/$NAME.json" $LB/${NAME}_lm.json; else cp "$TMP/$NAME.json" "$OUT/${NAME}_lm.json"; fi
rm -rf "${TMP:?}"
echo "done: $SHOP → $DST/$NAME.glb（原檔 sha256 $SHA）"
