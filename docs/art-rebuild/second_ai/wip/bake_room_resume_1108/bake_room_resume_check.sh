#!/bin/bash
# bake_room.py 續烘（BAKE_CACHE／BAKE_STOP_AFTER）回歸（LAWWW2-B 2026-11-08）。repo 根目錄跑，需要 Blender python（/opt/blenv/bin/python）：
#   bash bake_room_resume_check.sh <原本的 bake_room.py> <套了 patch 的 bake_room.py>
# 輸入：總圖 B1 4.1 版原檔（git blob 87f1da5e，沒烘過）；小烘焙：128 貼圖、2 取樣、單執行緒（結果固定），兩顆點光源。
#   1. 沒設環境變數：原本的 vs 套 patch 的 → GLB、白天、晚上的 PNG 逐位元組一樣；烘焙紀錄只差 bake_seconds
#   2. BAKE_CACHE＋BAKE_STOP_AFTER=day：結束碼 3、cache 裡只有白天
#   3. 同一個指令再跑（BAKE_CACHE）：白天從 cache 讀、只烘晚上 → 輸出和 1 逐位元組一樣
#   4. 參數改過（取樣 3）、同一個 cache：雜湊不一樣，照樣重烘（不會拿錯的 cache）
# 結束碼：有的機器 Blender（bpy 模組）結束時 segfault（139），輸出都已經寫完（11-08 LAWWW-B 那台雲端，原本的 bake_room.py 也一樣）。
#   所以結束碼 139 也接受，但一定要看到輸出檔／cache 檔都對：正常跑＝0 或 139＋三個輸出都在；BAKE_STOP_AFTER＝3 或 139＋cache 裡只有白天。
set -u
BASE=$1; NEW=$2; T=$(mktemp -d); fails=0
ok() { echo "PASS $1"; }; ng() { echo "FAIL $1"; fails=$((fails+1)); }
git cat-file -p 87f1da5e2805d0109c1d5bcaf7ffd37cf670f33b > "$T/in.glb"
NOLM='^(?!(library_b1_floorm|library_b1_ceiling|library_b1_columns|library_b1_woodpanels|WALL_[A-Z0-9]+_(wall|wain|woodwain))$)'
run() {   # run <bake_room.py> <輸出資料夾> [取樣]
  mkdir -p "$2"; BAKE_THREADS=1 /opt/blenv/bin/python "$1" -- --in "$T/in.glb" --out "$2/o.glb" --lm "$2/lm" --url x --res 128 --samples "${3:-2}" \
    --hide 'glass|frost' --nolm "$NOLM" --sky 0 --nightsky 0 --points '0,2.5,0,60,1,1,1;-15,2.5,-8,60,1,0.9,0.8' --keep-instances > "$2/log" 2>&1; echo $?; }
same() { cmp -s "$1/o.glb" "$2/o.glb" && cmp -s "$1/lm_day.png" "$2/lm_day.png" && cmp -s "$1/lm_night.png" "$2/lm_night.png"; }
outs() { [ -s "$1/o.glb" ] && [ -s "$1/lm_day.png" ] && [ -s "$1/lm_night.png" ] && [ -s "$1/lm.json" ]; }   # 三個輸出＋烘焙紀錄都寫了
rc=$(run "$BASE" "$T/a"); { [ "$rc" = 0 ] || [ "$rc" = 139 ]; } && outs "$T/a" && ok "原本的 bake_room 跑完（rc $rc，輸出都在）" || ng "原本的 bake_room rc=$rc 或輸出不齊"
rc=$(run "$NEW" "$T/b"); { [ "$rc" = 0 ] || [ "$rc" = 139 ]; } && outs "$T/b" && ok "套 patch 的跑完（rc $rc，輸出都在）" || ng "套 patch 的 rc=$rc 或輸出不齊"
same "$T/a" "$T/b" && ok "1 沒設環境變數：GLB、白天、晚上逐位元組一樣" || ng "1 沒設環境變數，輸出不一樣"
python3 - "$T/a/lm.json" "$T/b/lm.json" <<'PY' && ok "1 烘焙紀錄只差 bake_seconds" || ng "1 烘焙紀錄還有別的不一樣"
import json, sys
a, b = (json.load(open(p)) for p in sys.argv[1:]); a.pop('bake_seconds'); b.pop('bake_seconds'); sys.exit(0 if a == b else 1)
PY
grep -q "BAKE_CACHE\|cbake\|cached" "$T/b/log" && ng "1 沒設環境變數卻印了 cache 訊息" || ok "1 沒設環境變數：沒有 cache 訊息"
export BAKE_CACHE="$T/cache"
rc=$(BAKE_STOP_AFTER=day run "$NEW" "$T/c"); { [ "$rc" = 3 ] || [ "$rc" = 139 ]; } && [ ! -s "$T/c/o.glb" ] && ok "2 BAKE_STOP_AFTER=day 結束碼 $rc（3，或結束時 segfault 139）、沒有匯出" || ng "2 結束碼 $rc（要 3）或匯出了"
[ -f "$T/cache/day.npy" ] && [ ! -f "$T/cache/night.npy" ] && ok "2 cache 裡只有白天" || ng "2 cache 內容不對：$(ls "$T/cache" | tr '\n' ' ')"
rc=$(run "$NEW" "$T/d"); grep -q "day from cache" "$T/d/log" && grep -q "night lm mean" "$T/d/log" && ! grep -q "^day lm mean" "$T/d/log" && ok "3 白天從 cache 讀、只烘晚上" || ng "3 沒有照 cache 走（rc $rc）"
same "$T/b" "$T/d" && ok "3 續烘的輸出和一次跑完逐位元組一樣" || ng "3 續烘的輸出不一樣"
rc=$(run "$NEW" "$T/e" 3); grep -q "cache 不能用" "$T/e/log" && grep -q "^day lm mean" "$T/e/log" && ok "4 參數改過：不用舊 cache、照樣重烘" || ng "4 參數改過卻用了舊 cache"
unset BAKE_CACHE; rm -rf "${T:?}"
[ $fails = 0 ] && echo "ALL PASS" || echo "FAILED $fails"; exit $fails
