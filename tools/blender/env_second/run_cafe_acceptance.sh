#!/bin/bash
# 兩點半 Café 的驗收流程（第二個 AI）：回歸測試（docs/SECOND_AI_HANDOFF.md 第 3 節）→ 修改前／後截圖。
# 模擬器（SwiftShader）一次只跑一個，不要和其他瀏覽器工作同時跑（會逾時或誤判）。
# 用法：bash tools/blender/env_second/run_cafe_acceptance.sh [log 資料夾] [tests|shots|all]
cd "$(dirname "$0")/../../.."
LOG=${1:-docs/art-rebuild/second_ai/test_logs}; WHAT=${2:-all}; mkdir -p "$LOG"
U=http://127.0.0.1:8765/index.html
run(){ local name=$1; shift; echo "=== $name $(date -u +%H:%M:%S)"; timeout 3000 "$@" > "$LOG/$name.log" 2>&1; echo "exit $? $(date -u +%H:%M:%S)"; grep -E "^(ALL PASS|FAILED|PASS|FAIL)" "$LOG/$name.log" | tail -3; }
if [ "$WHAT" != shots ]; then
  run cafe_glb_integration python3 tests/cafe_glb_integration.py $U
  run reachability_wenzhou_cafe python3 tests/reachability_all.py $U --zones wenzhou,cafe
  run zone_transitions python3 tests/zone_transitions.py $U
  run p0_movement python3 tests/p0_movement.py $U
  run touch_flow_wenzhou python3 tests/touch_flow_wenzhou.py $U
fi
if [ "$WHAT" != tests ]; then
  python3 tools/blender/env_second/shots/make_shots.py > /dev/null
  run shots_before python3 tools/shots/scene_shot.py "$U?nobldg" tools/blender/env_second/shots/cafe_before.json
  run shots_after python3 tools/shots/scene_shot.py "$U" tools/blender/env_second/shots/cafe_after.json
fi
echo "=== done $(date -u +%H:%M:%S)"
