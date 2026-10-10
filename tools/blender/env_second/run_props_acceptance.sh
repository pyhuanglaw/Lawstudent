#!/bin/bash
# 街道道具（W3.lampPost／W3.bike／長椅 BENCH() 換成正式模型 prop.street）的驗收——LAWWW 2026-10-10 16:45Z 的條件：
# 約定不變（燈頭、lamp／lightPos、腳踏車方向、長椅坐的高度與位置）、導航不變、載入失敗退回程序化、校園 draw call 前後、
# campus_layout_nav、see_through、movement_regression B＋E、reachability_all 全遊戲、坐長椅正面＋側面截圖、三時段前後比較圖。
# 模擬器（SwiftShader）一次只跑一個瀏覽器工作。用法：bash tools/blender/env_second/run_props_acceptance.sh [log 資料夾] [tests|shots|all] [網址]
cd "$(dirname "$0")/../../.."
LOG=${1:-docs/art-rebuild/second_ai/test_logs/props}; WHAT=${2:-all}; U=${3:-http://127.0.0.1:8768/index.html}; mkdir -p "$LOG"
keep(){ local d=docs/art-rebuild/second_ai/test_shots/props/$1; mkdir -p "$d"; git status --porcelain -- screenshots docs/art-rebuild/screenshots | sed 's/^...//' | while read -r f; do [ -f "$f" ] && cp "$f" "$d/"; done; git checkout -q -- screenshots docs/art-rebuild/screenshots 2>/dev/null; }
run(){ local name=$1; shift; echo "=== $name $(date -u +%H:%M:%S)"; timeout 3600 "$@" > "$LOG/$name.log" 2>&1; echo "exit $? $(date -u +%H:%M:%S)"; grep -E "^(ALL PASS|FAILED|RESULT)" "$LOG/$name.log" | tail -2; keep "$name"; }
if [ "$WHAT" != shots ]; then
  run street_props_integration python3 tests/street_props_integration.py $U
  run campus_layout_nav python3 tests/campus_layout_nav.py $U
  run see_through python3 tests/see_through.py $U
  run movement_regression_BE python3 tests/movement_regression.py $U BE
  run reachability_all python3 tests/reachability_all.py $U
  run zone_transitions python3 tests/zone_transitions.py $U
  run p0_movement python3 tests/p0_movement.py $U
  run char_motion_formal python3 tools/shots/char_motion.py $U docs/art-rebuild/second_ai/test_shots/props/bench_formal player
  run char_motion_nobldg python3 tools/shots/char_motion.py "$U?nobldg" docs/art-rebuild/second_ai/test_shots/props/bench_nobldg player
fi
if [ "$WHAT" != tests ]; then
  python3 tools/blender/env_second/shots/props_shots.py before > /dev/null; python3 tools/blender/env_second/shots/props_shots.py after > /dev/null
  run shots_before python3 tools/blender/env_second/shots/fast_shots.py "$U" tools/blender/env_second/shots/props_before.json --block=street_props.glb
  run shots_after python3 tools/blender/env_second/shots/fast_shots.py "$U" tools/blender/env_second/shots/props_after.json
fi
echo "=== done $(date -u +%H:%M:%S)"
