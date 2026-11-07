#!/bin/bash
# 總圖研究小間（library_carrels，2F 東側十間）、5F 書庫（library_stacks）光照烘焙（白天／晚上）→ WebP（LAWWW2-B 2026-11-07，lm_audit_1107 第二級）。repo 根目錄跑：
#   bash tools/blender/env_second/lightbake/bake_library_upper.sh carrels|stacks [取樣數，預設 512] [輸出資料夾，預設 assets/models/env/second_ai] [貼圖邊長，預設 1024]
# 模型都是本作 tools/blender/env_second/library_upper.py（LAWWW2 10-23）；遊戲 library_upper3d.js 用 Z3.attachRoomGLB 接，看到 extras.lightmap 就接，不用改程式。
# 輸入：遊戲裡正在用的 GLB（git blob 寫在下面）——每次都從這個 blob 開始，不會把光照 UV 疊兩次。
# 燈：天花板嵌燈的發光面 WALL_C_tube（mesh_lights.py 從模型讀：一支一個朝下的面光源＋燈下 0.9 m 一顆點光源補天花板）。
# 只烘地板、天花板、牆（牆面、護牆板）；家具、書架、書、檯燈、門、印刷品、玻璃……照舊即時光。玻璃、霧面玻璃烘焙時藏起來（--hide），照樣輸出。
#   carrels：東牆閱讀角一扇大窗（--shell E 不包黑殼、白天有天空）；每間研究小間外牆高處的霧面窗 CARREL_SKY 白天那一張發光（--dayemit；遊戲照時段調它的亮度）。
#            學姊的檯燈 SIS_CARREL_LAMP（劇情開關）、其他間關著的檯燈 lampoff 都不算光源。
#   stacks：南牆一排窗（--shell S）；燈＝17 盞嵌燈＋66 條書架走道的長條燈（0.14×1.14 m）。書是 GPU instancing（--keep-instances）。
set -e
WHICH=$1; SAMPLES=${2:-512}; OUTDIR=${3:-assets/models/env/second_ai}; RES=${4:-1024}
LB=tools/blender/env_second/lightbake
TMP=$(mktemp -d)
case "$WHICH" in
  carrels) NAME=library_carrels; BLOB=312b581d6eadcf71da28ca13036be7836333745d; OPEN=E; SUN="${SUN:-90,30,0}"
    EXTRA=(--dayemit "CARREL_SKY=${SKYW:-2.0}") ;;
  stacks) NAME=library_stacks; BLOB=4a26982f65fa666523437d660b38ff54137d7b9c; OPEN=S; SUN="${SUN:-180,35,0}"
    EXTRA=(--keep-instances) ;;
  *) echo "用法：$0 carrels|stacks [取樣數] [輸出資料夾] [邊長]"; exit 1 ;;
esac
PLAIN="$TMP/${NAME}_plain.glb"
git cat-file -p "$BLOB" > "$PLAIN"
HIDE='glass|frost'
NOLM="^(?!(${NAME}_floorm|${NAME}_ceiling|WALL_[A-Z0-9]+_(wall|wain))\$)"
COL=${LCOL:-0.95,0.98,1.0}
LIGHTS=$(python3 $LB/mesh_lights.py "$PLAIN" WALL_C_tube cells --w "${TUBEW:-5}" --y -0.03 --col "$COL")
POINTS=$(python3 $LB/mesh_lights.py "$PLAIN" WALL_C_tube up --w "${UPW:-4}" --y -0.9 --col "$COL")
echo "lights $(echo "$LIGHTS" | tr ';' '\n' | wc -l), points $(echo "$POINTS" | tr ';' '\n' | wc -l)"
/opt/blenv/bin/python $LB/bake_room.py -- --in "$PLAIN" --out "$OUTDIR/$NAME.glb" \
  --lm "$TMP/lm" --url assets/models/env/second_ai/${NAME}_lm --res "$RES" --samples "$SAMPLES" --hide "$HIDE" --nolm "$NOLM" \
  --sun "$SUN" --sky "${SKY:-1.0}" --daylights "${DAYL:-1.0}" --lights "$LIGHTS" --points "$POINTS" --smooth 1 --shell "$OPEN" "${EXTRA[@]}"
python3 $LB/to_webp.py "$TMP/lm" "$OUTDIR/${NAME}_lm" 90
/opt/blenv/bin/python $LB/lm_fix_hidden.py -- --in "$OUTDIR/$NAME.glb" --out "$OUTDIR/$NAME.glb" --lm "$OUTDIR/${NAME}_lm"
python3 - "$TMP/lm.json" "$PLAIN" "$NAME" "$BLOB" <<'PY'
import hashlib, json, sys
p = sys.argv[1]; d = json.load(open(p)); d['src'] = f'assets/models/env/second_ai/{sys.argv[3]}.glb（git blob {sys.argv[4][:8]}）'; d['src_sha256'] = hashlib.sha256(open(sys.argv[2], 'rb').read()).hexdigest(); json.dump(d, open(p, 'w'), ensure_ascii=False, indent=1)
PY
if [ "$OUTDIR" = "assets/models/env/second_ai" ]; then cp "$TMP/lm.json" $LB/${NAME}_lm.json; else cp "$TMP/lm.json" "$OUTDIR/${NAME}_lm.json"; fi
echo "done: $OUTDIR/$NAME.glb + ${NAME}_lm_day/night.webp"
