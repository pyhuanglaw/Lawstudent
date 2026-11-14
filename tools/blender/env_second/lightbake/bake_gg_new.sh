#!/bin/bash
# AA／BB／CC 新做的店內（aa_support／bb_support）光照烘焙（白天／晚上）→ WebP（INTERIOR-AAA，LAWWW2-B 2026-11-07；lm_audit_1107 第一級）。repo 根目錄跑：
#   bash tools/blender/env_second/lightbake/bake_gg_new.sh <店> [取樣數，預設 512]
#   OUTDIR=<資料夾> 試烘（輸出、烘焙紀錄都寫在那裡，不動 assets）
# LAWWW-B 11-07 14:51：可以直接在 aa_support／bb_support 的原檔上烘——只加第二套 UV、extras.lightmap、拆開共用的材質，不動幾何、節點、座標、配置；
#   原作者以後重新匯出，光照貼圖會不見，要再跑一次這支。這支會把原檔的 sha256 記在烘焙紀錄（<店>_lm.json 的 src_sha256），交件時列「動了誰做的哪個檔」。
# 遊戲：這些店都走 Z3.attachRoomGLB（zones3d.js 的 ggRoom／wzShop），GLB 有 extras.lightmap 就接，不用改程式。
# 共同的做法：
#   - 白天：天光從店面的玻璃進來（外殼只開店面那一面）；不放太陽（店面朝哪邊各店不同、房間在遊戲裡轉過，烘進去的太陽整天同一個位置，和美國公寓一樣）。
#   - 晚上：只有店裡的燈。
#   - 頂點色的小東西、貨架上的商品、金屬件、玻璃、發光的東西照舊即時光（--nolm），照樣擋光：地上的接觸陰影照樣烘進去。
set -e
SHOP=${1:?cvs|yangyang|corner|shaola|yejian|aa_sunnyside|aa_komichi|aa_mokuyobi|aa_yizhan|aa_offbeat|bb_ade}
SAMPLES=${2:-512}
OUT=${OUTDIR:-}
LB=tools/blender/env_second/lightbake
TMP=$(mktemp -d)
CARD=()
case $SHOP in
cvs)
  # 日和便利店 v2b（BB 製作，bb_support/cvs_interior.glb；公館 G03）：11.4 × 11.2 m、天花板 3.3 m；店面（+z）整面玻璃＋自動門。24 小時，晚上很亮。
  # 燈：天花板 29 條 LED 燈條（cvs_led，0.10 × 2.24 m，在 3.245 m），tube_lights.py 讀出來，每條 14 W（試烘 22 W：白天平均 0.63、最亮的頂到 1.0，天花板燈條附近吃掉）。冷藏櫃的發光（GLOW_cvs_cooler）照樣發光、會照到地上。
  # 烘：地板、天花板、四面牆（WALL_*_vc：頂點色、沒有貼圖 UV，bake_room 自己展第二套 UV）、木作（cvs_wood）。
  # 不烘：貨架和商品（cvs_vc 4.8 萬個三角形、cvs_goods）、金屬（cvs_vm、WALL_front_vm 門框）、燈條、冷藏櫃、螢幕、印刷品、店面貼紙（DECAL_front）、玻璃。
  GLB=bb_support/cvs_interior.glb
  LIGHTS=$(python3 $LB/tube_lights.py assets/models/env/second_ai/$GLB --mesh 'cvs_led$' --w "${LW:-14}" --shrink 0.0)
  HIDE='glass|GLASS_'
  NOLM='^cvs_vc$|cvs_vm|_vm$|cvs_goods|cvs_led|cvs_cooler|cvs_screens|cvs_prints|DECAL_|glass|GLASS_|S_ph_'   # S_ph_＝Poly Haven 模型（SHOP-CC0-HELP-1113）
  EXTRA=(--sun 180,35,0 --sky "${SKY:-1.0}" --daylights "${DAYL:-0.8}" --shell S)
  ;;
yangyang)
  # 洋洋鹹酥雞 v1c（BB 製作，bb_support/yangyang_interior.glb；公館 G05）：9.2 × 11 m、天花板 3.3 m；店面（+z）左邊開放式炸物櫃台＋玻璃、右邊玻璃門＋落地窗。營業 15–24 點，晚上是主場。
  # 燈：天花板 6 支日光燈管（yy_screens 朝下的那幾片，y 3.25；同一個網格裡另外兩片是直立的菜單螢幕，用高度篩掉），每支 30 W；
  #     桌上 4 盞黃銅圓頂吊燈（桌 1～4 的正上方，燈泡 2.29 m，點光源放在燈罩口 2.2 m）每盞 20 W、右牆 5 盞鵝頸壁燈（x 4.27、2.35 m）每盞 10 W，暖色。
  # 烘：地板、天花板、四面牆（WALL_*_wall 漆面、WALL_*_vc 磚牆和腰牆：頂點色、沒有貼圖 UV，bake_room 自己展第二套 UV）、木作（yy_wood：桌面、椅子、結帳櫃）。
  # 不烘：頂點色的櫃台、廚具、小東西（yy_vc 1 萬個三角形）、炸物（yy_food 3.1 萬）、金屬、不鏽鋼、燈、螢幕、海報印刷、玻璃。
  # 窗外的景：BB 的模型沒有。烘完以後加一張（glb_add_viewcard.py；照 afar：玻璃外 2.5 m、16 × 6.5 m；照片 gg_shop_views.sh yangyang）。烘的時候沒有這張卡，不擋天光。
  GLB=bb_support/yangyang_interior.glb
  LIGHTS=$(python3 $LB/tube_lights.py assets/models/env/second_ai/$GLB --mesh 'yy_screens$' --w "${LW:-30}" --shrink 0.0 | tr ';' '\n' | awk -F, '$5>3' | paste -sd';' -)
  PW=${PW:-20}; SW=${SW:-10}; WC=1.0,0.78,0.52
  PTS="1.2,2.2,2.9,$PW,$WC,0.08;1.2,2.2,0.6,$PW,$WC,0.08;1.1,2.2,-1.7,$PW,$WC,0.08;-2.9,2.2,-4.3,$PW,$WC,0.08"
  for zz in 4.6 3.3 0.3 -1.5 -3.3; do PTS="$PTS;4.27,2.35,$zz,$SW,$WC,0.06"; done
  HIDE='glass|GLASS_'
  NOLM='^yy_vc$|yy_vm|_vm$|yy_food|yy_screens|yy_warm|print|yy_steel|glass|GLASS_|_cc_|_ph_|^WALL_[a-z]+_(plastic|metal|cardboard|wood_d|brass)'   # v2（SHOP-CC0-HELP-1113）：CC0 材質組的零件（yy_cc_*、牆上的 WALL_*_plastic_w…）、Poly Haven 模型（*_ph_*）照舊即時光
  EXTRA=(--sun 180,35,0 --sky "${SKY:-1.0}" --daylights "${DAYL:-0.8}" --shell S --points "$PTS")
  CARD=(--name WALL_front_VIEW_yy_window_view --mat yy_window_view --img assets/models/env/second_ai/bb_support/yangyang_view_day.webp --x0 -8 --x1 8 --y0 -1 --y1 5.5 --z 8.0)
  ;;
corner)
  # 轉角唱片 v1c（CC 製作、LAWWW2-B 改原型分組 38f4021e1；bb_support/corner.glb；公館 G12）：8 × 11.5 m、天花板 3.3 m；店面（+z）左邊櫥窗、右邊木門。營業 12–21 點。
  # 燈（照配置 corner_layout.js 的 lights，和 GLB 的 GLOW_* 同一個位置）：天花板兩條軌道上 18 盞投射燈（y 3.0），每盞一個 16 W、70° 的小面光源朝下
  #     （遊戲的投射燈打向牆上的唱片，這裡簡化成往下、光束放寬：地上、唱片箱亮一圈，不會一條一條過曝）；3 盞白色圓罩吊燈（燈罩口）每盞 40 W；暖色 3000K。
  # 烘：地板、天花板（cr_concrete，含外露的樑）、四面牆（WALL_*_wall_wall、前牆 WALL_front_front_wall）。
  #   木作（cr_wood、WALL_*_cr_wood：唱片櫃、唱片箱、層架）不烘：幾百個小島，試烘（48 取樣）時把一張 1024 貼圖切碎，地板、牆分到的解析度太低；木作照舊即時光。
  # 不烘：唱片和商品（*_goods）、頂點色的小東西和音響（*_vc）、金屬、葉子和海報（*_alpha）、發光、招牌、玻璃；GPU instancing 的東西（--keep-instances：照舊是 instancing、名字和淡出方向不變）。
  # 窗外的景：CC 的模型沒有。烘完以後加一張（照 afar：牆外 2.5 m、16 × 6.5 m；照片 gg_shop_views.sh corner）。
  GLB=bb_support/corner.glb
  SPW=${SPW:-16}; SPR=${SPR:-70}; PW=${PW:-40}; WC=1.0,0.82,0.62   # 試烘：12／25 W、40° 白天 0.19（太暗）；24／40 W、40° 0.32 但軌道底下的地板兩條過曝（6%）→ 光束放寬 70°、20 W：0.34、過曝 3～5%（軌道底下兩條）→ 16 W
  LIGHTS=""
  for x in -1.85 1.75; do for z in 4.5 3.4 2.3 1.2 0.1 -1.0 -2.1 -3.2 -4.3; do LIGHTS="$LIGHTS${LIGHTS:+;}$x,$x,$z,$z,2.95,1,1,$SPW,0.08,0.08,$WC,$SPR"; done; done
  PTS="-0.45,2.2,-1.75,$PW,$WC,0.08;1.0,2.25,-2.9,$PW,$WC,0.08;-0.9,2.15,-4.1,$PW,$WC,0.08"
  HIDE='glass'
  NOLM='goods|_vc$|cr_vc|vcm|metal|alpha|emit|sign|glass|_inst|wood'   # _inst 不加 $：Blender 匯入 GPU instancing 時，第二個以後的實例叫 …_inst.001（試烘第三輪：它們被烘、共用網格的全部多了第二套 UV）
  EXTRA=(--sun 180,35,0 --sky "${SKY:-1.0}" --daylights "${DAYL:-0.8}" --shell S --points "$PTS" --keep-instances)
  CARD=(--name WALL_front_VIEW_cr_window_view --mat cr_window_view --img assets/models/env/second_ai/bb_support/corner_view_day.webp --x0 -8 --x1 8 --y0 -1 --y1 5.5 --z 8.25)
  ;;
shaola)
  # 公館燒臘 v7（BB 製作，bb_support/shaola_interior.glb；noodle 區域，公館 G00）：6 × 13 m、天花板 3.2 m；店面（+z）中間玻璃門、兩邊窗。窄長老店。
  # 窗外的景：遊戲已經有（zones3d.js buildShaola 的 shopViewPane 視差窗，WINVIEW-AUDIT-1105），不加卡。
  # 燈：天花板 9 組雙管日光燈（sl_tube，每組兩支 1.22 m，y 3.08），tube_lights.py 讀出 18 支，每支 14 W（試烘 12 W：比轉角唱片、洋洋暗一點）；
  #     燒臘玻璃櫃上面 5 顆暖色燈泡（sl_warm，x 1.3、y 2.34）每顆 6 W、左牆 2 盞暖色小壁燈（WALL_left_warm）每盞 6 W。
  #     後牆外廚房那支燈管（WALL_back_tube，z −7.4，布簾門後面）不算：玩家看不到廚房裡面。
  # 烘：地板、天花板、四面牆（WALL_*_wall）。
  #   牆上的頂點色零件（WALL_left／right／back_vc：層架、櫃台後面、廚房裡）不烘：試烘時佔了光照貼圖 26%，其中 72～97% 是全黑（貼著牆、在櫃台後面、在廚房），地板、牆分到的解析度被吃掉。
  # 不烘：桌凳和小東西（sl_vc 1.9 萬個三角形）、燒臘和調味罐（sl_gloss 2.3 萬）、不鏽鋼、金屬、燈、螢幕、印刷品、玻璃、
  #       牆上的頂點色零件、店面外面的騎樓立面（WALL_front_vc，z 6.5～9.2，在店外）。
  GLB=bb_support/shaola_interior.glb
  LIGHTS=$(python3 $LB/tube_lights.py assets/models/env/second_ai/$GLB --mesh 'sl_tube$' --w "${LW:-14}" --shrink 0.0)
  BW=${BW:-6}; WC=1.0,0.76,0.50
  PTS=""
  for zz in 2.5 3.15 3.8 4.45 5.1; do PTS="$PTS${PTS:+;}1.3,2.3,$zz,$BW,$WC,0.05"; done
  for zz in 0.43 0.77; do PTS="$PTS;-2.65,2.3,$zz,$BW,$WC,0.05"; done
  HIDE='glass'
  NOLM='_vc$|sl_vm|_vm$|gloss|steel|tube|warm|screens|print|glass|_cc_|_ph_|^WALL_[a-z]+_(plastic|metal|cardboard|wood_d|brass|sack)'   # v8（SHOP-CC0-HELP-1113）：CC0 材質組的零件（sl_cc_*、牆上的 WALL_*_plastic_w…）、Poly Haven 模型（*_ph_*）照舊即時光
  EXTRA=(--sun 180,35,0 --sky "${SKY:-1.0}" --daylights "${DAYL:-0.8}" --shell S --points "$PTS")
  ;;
yejian)
  # 頁間書屋 v3b（AA 製作，aa_support/yejian.glb；bookstore 區域，公館）：12 × 10 m、天花板 3.8 m；店面（+z）西端木門、東邊整片窗（x −3.6～5.6）。
  # 窗外的景：模型已經有（WALL_front_VIEW_yej_window_view，windowView），烘的時候藏起來（不擋天光），照樣輸出。
  # 燈：全部是燈泡（yej_bulb），tube_lights.py 讀出每一顆的位置，照高度換成點光源（暖色 2700K），燈泡本身烘的時候藏起來（點光源在燈泡裡面會被擋住）：
  #     天花板裸燈泡 14 顆（y 3.52）每顆 13 W；吊燈（閱讀桌上、窗邊、右邊，y 2.1～2.4）每盞 8 W；吧台黃銅檯燈、落地燈、右牆那支（y 1.6 以下）每盞 4 W。
  #     （試烘 10／7 W：晚上 0.26，比轉角唱片 0.32、燒臘 0.46 暗）
  # 烘：地板、天花板、四面牆（WALL_*_wall 奶油色漆）、牆上的木作（WALL_*_yej_wood：護牆板、窗框，島少）。
  # 不烘：家具和書櫃的木頭（yej_wood 6400 個三角形、島太多）、書、黃金葛、印刷品、頂點色的小東西（yej_vc／vcg／vcm）、燈泡、玻璃、窗景卡。
  GLB=aa_support/yejian.glb
  CW=${CW:-13}; PW=${PW:-8}; DW=${DW:-4}; WC=1.0,0.78,0.55
  PTS=$(python3 $LB/tube_lights.py assets/models/env/second_ai/$GLB --mesh 'yej_bulb$' --w 1 --shrink 0.0 | tr ';' '\n' | \
    awk -F, -v cw="$CW" -v pw="$PW" -v dw="$DW" -v wc="$WC" '{x=($1+$2)/2; z=($3+$4)/2; y=$5; w=(y>3.3)?cw:((y>1.9)?pw:dw); printf "%s%.3f,%.3f,%.3f,%s,%s,0.05", (NR>1?";":""), x, y-0.02, z, w, wc}')
  LIGHTS=""
  HIDE='glass|VIEW|bulb'
  NOLM='^yej_wood$|books|pothos|print|_vc$|vcg|vcm|bulb|glass|VIEW'
  EXTRA=(--sun 180,35,0 --sky "${SKY:-1.0}" --daylights "${DAYL:-0.8}" --shell S --points "$PTS")
  ;;
aa_sunnyside|aa_komichi|aa_mokuyobi|aa_yizhan|aa_offbeat|aa_afar|aa_aoki|aa_daybreak)
  # 溫州街 AA 做的五間（光照第一級第三批）：命名都一樣——<字首>_floor／_ceiling（一盞多 _tatami）、WALL_<面>_<字首>_wall／_wood／_post、
  #   燈是 GLOW_<種類>_<編號> 空節點（extras：glow 顏色、size、day、night）、窗景卡 WALL_<面>_VIEW_<字首>_window_view。
  # 烘：地板（含榻榻米）、天花板、牆面、牆上的木作和柱子（島少）。其他全部照舊即時光（家具、小東西、書、植物、印刷品、燈、玻璃、窗景卡）。
  # 燈：glow_points.py 把 GLOW_* 換成點光源（吊燈 9 W、壁燈 5 W、投射燈 6 W、檯燈 4 W、落地燈 6 W、紙燈 6 W、行燈 4 W、蠟燭 0.6 W、吧台燈條 3 W、軌道燈 6 W；顏色照 extras.glow），
  #     燈泡、紙燈罩、玻璃、窗景卡烘的時候藏起來（光源在裡面會被擋住；窗景卡會擋天光），照樣輸出。
  # 外殼：窗在哪一面就開哪一面（S＝+z 店面；E＝+x）。
  case $SHOP in
    aa_sunnyside) GLB=aa_support/sunnyside.glb; P=sns; OPEN=S,E; GSD=2.4 ;;   # SUNNY SIDE（wz_brunch）6.4 × 10 × 3.2：店面＋右牆整面落地窗
    aa_komichi)   GLB=aa_support/komichi.glb;   P=kmc; OPEN=S; GSD=4.5 ;;     # 小路（wz_teishoku）8 × 8 × 2.9：木頭天花板、老牆
    aa_mokuyobi)  GLB=aa_support/mokuyobi.glb;  P=mok; OPEN=S; GSD=2.6 ;;     # 木曜日（wz_mokuyobi）9 × 14 × 3.0
    aa_yizhan)    GLB=aa_support/yizhan.glb;    P=yzn; OPEN=S; GSD=6; ORIG=33ba0087be49864893c215c66959f9eae8c64e1c ;;     # 一盞（wz_teahouse）8.4 × 10 × 2.6＋緣側：格子玻璃拉門朝 +z（燈只有紙燈 3、行燈 3）
    aa_offbeat)   GLB=aa_support/daily_offbeat.glb; P=dof; OPEN=S,E; GSD=1.5 ;;   # 日常失速（wz_offbeat）11 × 10 × 3.4：店面＋右牆窗
    # 第二級（11-07 21:xx）：公館 AA 三間，命名一樣；店面在 +z（S）。試烘 128（倍數 2.4）晚上：afar 0.31、青木 0.38、Daybreak 0.38 → afar 照舊、青木／Daybreak 1.7
    aa_afar)      GLB=aa_support/afar.glb;      P=afr; OPEN=S; GSD=${GSD_AFAR:-2.4} ;;    # afar（公館）：吊燈 5、投射燈 8、檯燈 10
    aa_aoki)      GLB=aa_support/aoki.glb;      P=aok; OPEN=S; GSD=${GSD_AOKI:-1.7} ;;    # 青木（公館）：投射燈 16
    aa_daybreak)  GLB=aa_support/daybreak.glb;  P=dbk; OPEN=S; GSD=${GSD_DBK:-1.7} ;;     # Daybreak（公館）：吊燈 7、投射燈 8
  esac
  # 瓦數倍數 GSD（GLOW 的預設瓦數 × 倍數）：試烘第二輪（光源已放到燈罩口下）晚上的光照貼圖平均（WebP）小路 0.13、SUNNY SIDE 0.21、木曜日 0.20、一盞 0.09、日常失速 0.27，
  #   目標咖啡店、西式 0.32、日式 0.25（洋洋 0.38、轉角 0.32、頁間 0.29）；WebP 值大約是線性的 0.49 次方 → 倍數＝(目標／試烘)^2.04。GS＝環境變數蓋過。
  # 白天天光色調 SKYTINT（11-08 WZ6_LM_cloud，BB-B 判一盞 14:00 店門口的淺色木地板變灰藍、像水泥；日常失速門口一格青藍）：
  #   沒有太陽、只吃 Nishita 的藍天光，開口大的店門口光照貼圖藍／紅到 1.34～1.39（WebP；其他四間 1.09～1.20）。--skytint 只乘白天的天光（燈不動、晚上那張不動），
  #   1.32,1.0,0.72＝藍天光的亮度不變、顏色接近中性（一盞試烘 128：1.25,1.0,0.78 → 店門口 1.39→1.16、白天平均 0.31→0.31；再推一點到約 1.1）。
  #   這一組從 11-08 起預設都套（公館三間第一次烘就套；溫州街其他四間還是 11-07 沒套的版本，重烘時會套）；SKYTINT= 空字串＝不套。
  SKYTINT=${SKYTINT-1.32,1.0,0.72}
  #   ORIG（一盞那一行）：AA 的原檔（git blob，sha256 a4d1bc30…）——assets 裡的已經烘過，不能再拿來烘。
  if [ -n "${ORIG:-}" ] && [ -z "${IN:-}" ]; then git cat-file -p "$ORIG" > "$TMP/orig.glb"; IN=$TMP/orig.glb; fi
  PTS=$(python3 $LB/glow_points.py "${IN:-assets/models/env/second_ai/$GLB}" --scale "${GS:-$GSD}")
  LIGHTS=""
  HIDE='glass|VIEW|bulb|washi|_pend$'
  NOLM="^(?!(${P}_(floor|ceiling|tatami)|WALL_[a-z]+_${P}_(wall|wood|post))\$)"
  EXTRA=(--sun 180,35,0 --sky "${SKY:-1.0}" --daylights "${DAYL:-0.8}" --shell "$OPEN" --points "$PTS" ${SKYTINT:+--skytint "$SKYTINT"})
  ;;
bb_bike)
  # 慢輪單車（CC 製作，bb_support/bike.glb，公館；第二級 11-07 21:xx）：10.2 × 12 × 3.6 m（天花板是外露的混凝土樓板＋樑 bk_concrete）；店面（+z）整面玻璃。
  # 燈：GLOW_pendant_1～11（吊燈，燈罩是 GPU instancing 的 bk_pendant_0_*_inst——烘的時候藏起來，光源才不會被燈罩擋住）、GLOW_tube_1～7（天花板日光燈 5 W）。
  # 烘：地板、天花板（含樑）、隔間牆、四面牆。其他（貨架、商品、腳踏車、輪子、木作、頂點色、金屬、植物、招牌、玻璃）照舊即時光；instancing 不展開、烘完補回節點名字。
  GLB=bb_support/bike.glb
  PTS=$(python3 $LB/glow_points.py assets/models/env/second_ai/$GLB --scale "${GS:-1.8}")   # 試烘 128（×1.0）白天／晚上 0.28／0.24 偏暗 → ×1.8
  LIGHTS=""
  HIDE='glass|pendant'
  NOLM="^(?!(bk_floor_floor|bk_concrete|bk_partition_wall|WALL_[a-z]+_wall_wall|WALL_front_front_wall)\$)"
  SKYTINT=${SKYTINT-1.32,1.0,0.72}   # 白天天光色調（同 AA 那一組，11-08）
  EXTRA=(--sun 180,35,0 --sky "${SKY:-1.0}" --daylights "${DAYL:-0.8}" --shell S --points "$PTS" --keep-instances ${SKYTINT:+--skytint "$SKYTINT"})
  ;;
bb_ade)
  # 阿德影印（BB 製作，bb_support/ade.glb；溫州街 wz_print）：4.3 × 9.1 m、天花板 3.0 m；店面（+z）整面玻璃。
  # 燈：天花板 10 片平板燈（GLOW_panel_1～10，x ±1.0、z 3.3～−3.7、y 2.9；extras 冷白 240,246,255），每片一個 0.4 × 1.2 m 朝下的面光源，14 W。
  # 烘：地板、天花板、四面牆（WALL_*_wall_wall、WALL_front_front_wall）。
  # 不烘：櫃台、影印機、紙、商品、頂點色、金屬、植物、招牌、發光、玻璃；GPU instancing 的椅子、桌子、平板燈（--keep-instances，烘完照原檔補回節點名字、extras）。
  GLB=bb_support/ade.glb
  PW=${PW:-14}   # 試烘 18 W：白天／晚上 0.56／0.55、過曝 1%（便利商店 0.57／0.51）→ 14 W
  LIGHTS=$(python3 $LB/glow_points.py assets/models/env/second_ai/$GLB --only '^GLOW_panel' --drop 0.03 | tr ';' '\n' | \
    awk -F, -v w="$PW" '{printf "%s%.3f,%.3f,%.3f,%.3f,%.3f,1,1,%s,0.4,1.2,%s,%s,%s", (NR>1?";":""), $1, $1, $3, $3, $2, w, $5, $6, $7}')
  HIDE='glass'
  NOLM="^(?!(ad_floor_floor|ad_ceiling_ceil|WALL_[a-z]+_wall_wall|WALL_front_front_wall)\$)"
  EXTRA=(--sun 180,35,0 --sky "${SKY:-1.0}" --daylights "${DAYL:-0.8}" --shell S --keep-instances)
  ;;
*) echo "不認得的店 $SHOP（cvs、yangyang、corner、shaola、yejian、aa_sunnyside、aa_komichi、aa_mokuyobi、aa_yizhan、aa_offbeat、aa_afar、aa_aoki、aa_daybreak、bb_ade、bb_bike）"; exit 1;;
esac
SRC=assets/models/env/second_ai/$GLB
NAME=$(basename "$GLB" .glb)
DST=${OUT:-$(dirname "$SRC")}
# 輸入：IN（環境變數，或上面各店的 ORIG＝原檔的 git blob）；沒有就用 assets 裡的檔。已經烘過的（場景有 extras.lightmap）不能再烘：第二套 UV 會疊兩次。
IN=${IN:-$SRC}
if python3 -I - "$IN" <<'EOF'
import json, struct, sys
b = open(sys.argv[1], 'rb').read(); J = json.loads(b[20:20 + struct.unpack('<I', b[12:16])[0]])
sys.exit(0 if any('lightmap' in (J['scenes'][i].get('extras') or {}) for i in range(len(J.get('scenes', [])))) else 1)
EOF
then echo "$IN 已經烘過（有 extras.lightmap）：用 IN=<原檔> 指定沒烘過的版本（git log -- $SRC 找烘焙前的 commit，git show <commit>:$SRC）"; rm -rf "${TMP:?}"; exit 1; fi
SHA=$(sha256sum "$IN" | cut -d' ' -f1)
cp "$IN" "$TMP/$NAME.glb"
/opt/blenv/bin/python $LB/bake_room.py -- --in "$TMP/$NAME.glb" --out "$DST/$NAME.glb" \
  --lm "$TMP/$NAME" --url "$(dirname "$SRC")/${NAME}_lm" --res 1024 --samples "$SAMPLES" --hide "$HIDE" --nolm "$NOLM" \
  --lights "$LIGHTS" --smooth 2 "${EXTRA[@]}"
python3 $LB/to_webp.py "$TMP/$NAME" "$DST/${NAME}_lm" 90
if [ "$SHOP" = corner ] || [ "$SHOP" = bb_ade ] || [ "$SHOP" = bb_bike ]; then   # instancing 節點的名字、extras（WALL_／CEIL_、dir、at）照原檔補回去：Blender 重新匯出會叫「<檔名>.N」
  python3 $LB/glb_fix_instnames.py "$TMP/$NAME.glb" "$DST/$NAME.glb"
fi
if [ ${#CARD[@]} -gt 0 ]; then   # 窗外的景（烘完才加：不擋天光、沒有第二套 UV）
  python3 $LB/glb_add_viewcard.py "$DST/$NAME.glb" "$DST/$NAME.glb" "${CARD[@]}"
fi
python3 -I - "$TMP/$NAME.json" "$SHA" "$SRC" <<'EOF'
import json, sys
j = json.load(open(sys.argv[1])); j['src'] = sys.argv[3]; j['src_sha256'] = sys.argv[2]
json.dump(j, open(sys.argv[1], 'w'), ensure_ascii=False, indent=1)
EOF
if [ -z "$OUT" ]; then cp "$TMP/$NAME.json" $LB/${NAME}_lm.json; else cp "$TMP/$NAME.json" "$OUT/${NAME}_lm.json"; fi
rm -rf "${TMP:?}"
echo "done: $SHOP → $DST/$NAME.glb（原檔 sha256 $SHA）"
