#!/bin/bash
# 公館機車分組（⑧，LAWWW 2026-10-11 03:47Z）的驗收：gongguan_glb_integration（機車分組、台數、顏色、每個鏡頭至少一組在畫面外、效能：draw call ≤ ?nobldg 的 1.3 倍、三角形 ≤ 42 萬）、
# gongguan_layout_nav、wz_street_integration（溫州街的機車也用同一個函式：沒有分組時必須和之前一樣）、p0_movement、reachability_all（全遊戲）、zone_transitions、
# 修改前後的效能（修改前＝擋掉 scooter.glb）、三時段前後比較圖。模擬器（SwiftShader）一次只跑一個瀏覽器工作。
# 用法：bash tools/blender/env_second/run_ggsc_acceptance.sh [log 資料夾] [tests|shots|all] [網址]
cd "$(dirname "$0")/../../.."
LOG=${1:-docs/art-rebuild/second_ai/test_logs/ggsc}; WHAT=${2:-all}; U=${3:-http://127.0.0.1:8778/index.html}; mkdir -p "$LOG"
keep(){ local d=docs/art-rebuild/second_ai/test_shots/ggsc/$1; mkdir -p "$d"; git status --porcelain -- screenshots docs/art-rebuild/screenshots | sed 's/^...//' | while read -r f; do [ -f "$f" ] && cp "$f" "$d/"; done; git checkout -q -- screenshots docs/art-rebuild/screenshots 2>/dev/null; }
run(){ local name=$1; shift; echo "=== $name $(date -u +%H:%M:%S)"; timeout 3600 "$@" > "$LOG/$name.log" 2>&1; echo "exit $? $(date -u +%H:%M:%S)"; grep -E "^(ALL PASS|FAILED|RESULT)" "$LOG/$name.log" | tail -2; keep "$name"; }
if [ "$WHAT" = tests ] || [ "$WHAT" = all ]; then
  run gongguan_glb_integration python3 tests/gongguan_glb_integration.py $U
  run gongguan_layout_nav python3 tests/gongguan_layout_nav.py $U
  run wz_street_integration python3 tests/wz_street_integration.py $U
  run p0_movement python3 tests/p0_movement.py $U
  run reachability_all python3 tests/reachability_all.py $U
  run zone_transitions python3 tests/zone_transitions.py $U
  run ggsc_perf python3 tools/blender/env_second/shots/ggsc_perf.py $U
fi
if [ "$WHAT" = shots ] || [ "$WHAT" = all ]; then
  python3 tools/blender/env_second/shots/ggsc_shots.py > /dev/null
  run shots_before python3 tools/blender/env_second/shots/fast_shots.py "$U" tools/blender/env_second/shots/ggsc_before.json --block=scooter.glb
  run shots_after python3 tools/blender/env_second/shots/fast_shots.py "$U" tools/blender/env_second/shots/ggsc_after.json
fi
echo "=== done $(date -u +%H:%M:%S)"
