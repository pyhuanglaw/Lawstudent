#!/bin/bash
# 公館店內往外看的窗景照片（白天／晚上）：洋洋鹹酥雞、轉角唱片（LAWWW2-B 2026-11-07；LAWWW-B 15:35「兩間的 GLB 都沒有窗外的景，烘的時候順便看要不要補一張（照 afar 的做法）」）。repo 根目錄跑：
#   bash tools/blender/env_second/gg_shop_views.sh <店：yangyang|corner> [取樣數，預設 128] [day|night|both，預設 both]
#   OUTDIR=<資料夾> 試拍（照片寫在那裡，不動 assets）
# 做法照 afar（AFAR-VIEW-1105）、青木／頁間／Daybreak（WINVIEW-AUDIT-1105 README_gg3）：
#   - 公館的正式模型（gongguan_shops、gongguan_far、gongguan_mrt_exit、校門 campus_gate）＋ wz_window_view.py --gg-street 的路面、圍牆；
#   - 停著的機車（122 台）、行道樹（103 棵，照樹種）、路燈（46 盞）照遊戲公館區域的實際位置：gg_scene/*.json（Node 建開發分支 e66781d1f 的公館區域匯出；
#     afar、gg3 那兩批還沒有 --trees／--lamps，是整顆 street_trees.glb 放一次，這一批照遊戲的位置種）；
#   - 鏡頭在模型原點（店的正中間）、換成公館座標，朝北；視野剛好蓋滿窗景卡：焦距＝36 × 距離 ÷ 卡寬；shift_y＝（卡中心高 2.25 − 1.4）÷ 卡寬；
#     自己這一棟的玻璃、招牌用 --clip-start 剪掉（玻璃再往外 0.5 m）；
#   - 店面玻璃都在公館 z 22.07（wz_street.py 這一排 dep 3.0，和 afar 同一條線）；店內的座標 x 往西是公館的 x 往東（公館 x＝店中心 − 店內 x），
#     所以照片要左右鏡像過貼上去才是正的（和 afar 一樣：卡的 u=0 在店內 x −8）；
#   - 白天照遊戲 14:00 的太陽（--hour 14）；晚上 --night＋路燈光圈（離鏡頭 18 m 內只照燈下一圈，XS-NIGHT-1107 第 2 版 BB-B 的意見）。
set -e
SHOP=${1:?yangyang|corner}
SAMPLES=${2:-128}
WHICH=${3:-both}
LIB=tools/blender/env_second
ENV=assets/models/env/second_ai
SCN=$LIB/gg_scene
OUT=${OUTDIR:-}
case $SHOP in
yangyang)
  # 洋洋鹹酥雞（公館 G05，BB 的 bb_support/yangyang_interior.glb）：9.2 × 11 m，店面玻璃在店內 z 5.5；店中心公館 x −9.4（zones3d.js 店門 out＝−9.4 − 門 x）
  CX=-9.4; GLASS=5.5; CARD=8.0; CW=16; DST=$ENV/bb_support; NAME=yangyang_view;;
corner)
  # 轉角唱片（公館 G12，CC 的 bb_support/corner.glb）：8 × 11.5 m，店面玻璃在店內 z 5.69；店中心公館 x 55.6
  CX=55.6; GLASS=5.75; CARD=8.25; CW=16; DST=$ENV/bb_support; NAME=corner_view;;
*) echo "不認得的店 $SHOP（yangyang|corner）"; exit 1;;
esac
DST=${OUT:-$DST}
read -r EZ LENS SHIFT CLIP RH < <(python3 -c "
g=22.07; glass=$GLASS; card=$CARD; cw=$CW
print(round(g+glass,3), round(36*card/cw,4), round((2.25-1.4)/cw,5), round(glass+0.5,3), int(round(6.5/cw*1600)))")
TMP=$(mktemp -d)
GLBS=$ENV/gongguan_shops.glb,$ENV/gongguan_far.glb
COMMON=(--eye "$CX,1.4,$EZ" --at "$CX,1.4,0" --res "1600x$RH" --samples "$SAMPLES" --glb "$GLBS" --gg-street
  --place "$ENV/campus_gate.glb@0,0,-46,0" --place "$ENV/gongguan_mrt_exit.glb@-36.6,0,11,1.5708"
  --scooters "$SCN/gg_scooters.json" --trees "$SCN/gg_trees.json" --lamps "$SCN/gg_lamps.json"
  --lens "$LENS" --shift-y "$SHIFT" --clip-start "$CLIP")
echo "鏡頭 ($CX, 1.4, $EZ) 焦距 $LENS shift_y $SHIFT clip $CLIP 1600×$RH"
if [ "$WHICH" != night ]; then
  /opt/blenv/bin/python $LIB/wz_window_view.py -- "${COMMON[@]}" --out "$TMP/day.png" --hour 14
fi
if [ "$WHICH" != day ]; then
  /opt/blenv/bin/python $LIB/wz_window_view.py -- "${COMMON[@]}" --out "$TMP/night.png" --night --pools "$SCN/gg_pools.json" --pool-near 18
fi
python3 -I - "$TMP" "$DST" "$NAME" "$CARD" "$CLIP" <<'EOF'
import os, sys
import numpy as np
from PIL import Image, ImageOps
tmp, dst, name = sys.argv[1:4]; card, clip = float(sys.argv[4]), float(sys.argv[5])
# 卡的最下面一條：鏡頭前 clip 公尺內的地面（自己這一棟的騎樓地板）和玻璃一起被剪掉了，那一條是天空的顏色（afar、gg3 那兩批也有）。
#   地面在 clip 那個深度投影到卡上是 y＝1.4 − 1.4 × 卡距 ÷ clip；那一列以下用上面幾列地面的顏色（左右模糊）補滿（從店裡往外看的時候是騎樓地板）
yb = 1.4 - 1.4 * card / clip
for k in ('day', 'night'):
    p = os.path.join(tmp, k + '.png')
    if not os.path.exists(p): continue
    im = Image.open(p).convert('RGB'); a = np.asarray(im).copy(); H = a.shape[0]; rb = int((5.5 - yb) / 6.5 * H) + 1
    while rb > H // 2 and (np.median(a[rb - 1]) < 25 or a[rb - 1, :, 2].mean() > a[rb - 1, :, 0].mean() + 20): rb -= 1   # 剪開的地方有一條黑邊（騎樓地板的切口）、下面是天空色：往上找到真的地面
    base = a[max(0, rb - 6):rb].astype(float).mean(0); k = np.ones(81) / 81; pad = np.pad(base, ((40, 40), (0, 0)), mode='edge')
    base = np.stack([np.convolve(pad[:, c], k, mode='valid') for c in range(3)], 1)   # 地面的顏色左右模糊（不把看板、柱子的腳拉成直條）
    for r in range(rb, H): a[r] = base.astype(np.uint8)
    im = Image.fromarray(a); print('補地面：第', rb, '列以下（y', round(yb, 3), '）')
    im.save(os.path.join(dst, name + '_' + k + '_eye.jpg'), quality=88) if os.environ.get('OUTDIR') else None   # 試拍：另存一張人眼方向的（沒鏡像）
    ImageOps.mirror(im).save(os.path.join(dst, name + '_' + k + '.webp'), quality=82, method=6)
    print('wrote', os.path.join(dst, name + '_' + k + '.webp'), os.path.getsize(os.path.join(dst, name + '_' + k + '.webp')))
EOF
rm -rf "${TMP:?}"
