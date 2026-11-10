#!/bin/bash
# 美國公寓、C 棟 208 從頭重做遊戲用的 GLB（LAWWW2-REEXPORT-US-1027，LAWWW2 帳號 A 2026-11-10）。repo 根目錄跑：
#   bash tools/blender/env_second/lightbake/rebuild_us_rooms.sh apartment|shared [取樣數，預設 256] [輸出資料夾，預設 assets/models/env/second_ai] [貼圖邊長，預設 1024]
# 步驟（遊戲裡的 us_apartment.glb／us_shared.glb 就是這樣做出來的；11-10 在開發分支 3f3d48325 用低取樣試過一次，節點、網格、材質、三角形、extras 和部署中的逐一相同）：
#   1. bake_us.sh：us_apartment.py 建模（家具 aa_support／bb_support 的道具組）→ 光照烘焙（白天／晚上）→ WebP → lm_fix_hidden → 單雙面照部署中的還原
#   2. 只有 apartment：glb_split_node.py 把衣物間、衛浴兩片開著的門板切成兩個節點（#204，docs/art-rebuild/second_ai/wip/us_door_split_1109/README.md）
#   3. glb_partition_at.py：隔間牆的零件、開著的門板跟它貼著的牆一起淡出（規則 A、B）
# 檢查輸入都在：node tests/us_reexport_inputs_unit.js
set -e
ZONE=${1:?apartment|shared}; SAMPLES=${2:-256}; OUTDIR=${3:-assets/models/env/second_ai}; RES=${4:-1024}
case "$ZONE" in apartment) NAME=us_apartment;; shared) NAME=us_shared;; *) echo "apartment 或 shared"; exit 2;; esac
bash tools/blender/env_second/lightbake/bake_us.sh "$ZONE" "$SAMPLES" "$OUTDIR" "$RES"
if [ "$ZONE" = apartment ]; then
  python3 tools/blender/env_second/lightbake/glb_split_node.py "$OUTDIR/$NAME.glb" "$OUTDIR/$NAME.glb" --node WALL_bath_n_door --axis x --cut 3.1 --name WALL_bath_n_door_e
fi
python3 tools/blender/env_second/lightbake/glb_partition_at.py "$OUTDIR/$NAME.glb" "$OUTDIR/$NAME.glb"
echo "rebuilt: $OUTDIR/$NAME.glb"
