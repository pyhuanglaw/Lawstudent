#!/bin/bash
# 用法：[SP=工作資料夾] [LOOK_ROOT=LAWWW 工作目錄的伺服器（要有 test_charlook.html；眼鏡要套 patch）] [EXTRA="--asset key=網址"] tools/blender/char_second/char_build.sh <name> <版本> <VRoid 樣本> <標題> <虹膜色> <base key> <身高> <配件> [face|reuse]
# 一般化的人物建置：<name> <版本> <VRoid 樣本> <標題> <虹膜色> <test_charlook 的 base key> <身高> <配件逗號分隔> [face|reuse]
# face：先做 stage0＋臉存工作檔；reuse：用上一次的臉工作檔（只重做衣服、頭髮）
SP=${SP:-/tmp/char_build}   # 工作資料夾（中間檔、算圖、遊戲渲染器截圖）
EXTRA=${EXTRA:-}; N=$1; V=$2; BASE=$3; TITLE=$4; IRIS=$5; LB=$6; H=$7; PROPS=$8; MODE=${9:-face}
cd "$(dirname "$0")/../../.."; D=$SP/char/$N; mkdir -p $D
if [ "$MODE" = face ]; then nice -n 5 timeout 2400 /opt/blenv/bin/python tools/blender/char_second/$N.py -- - --stages stage0,face --blend $D/face.blend > $D/face_$V.log 2>&1; echo "face exit $?"; fi
nice -n 5 timeout 2400 /opt/blenv/bin/python tools/blender/char_second/$N.py -- $D/$V.vrm --from-blend $D/face.blend --stages clothes,hair --render $D/$V --views face_front,face_q45,body_front > $D/$V.log 2>&1; echo "$V exit $?"
VRM_BASE=$BASE VRM_MALE=1 python3 tools/blender/char_second/vrm_finish2.py $D/$V.vrm $D/bl_${N}_$V.vrm "$TITLE" "$IRIS" > $D/finish_$V.log 2>&1; echo "finish exit $?"; tail -1 $D/finish_$V.log
for m in idle sit walk; do timeout 900 python3 tools/blender/char_second/char_lookdev.py ${LOOK_ROOT:-http://127.0.0.1:8793} $D/bl_${N}_$V.vrm $SP/look_${N}_$V $m --base $LB --height $H --tag $N --props "$PROPS" $EXTRA > /dev/null 2>&1; echo "look $m exit $?"; done
