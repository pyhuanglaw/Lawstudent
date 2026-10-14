#!/bin/bash
# 行道樹（prop.trees，⑦）的驗收：
#   單元測試（Node）：street_trees_unit（共用亂數、樹以外的網格、導航、每棵樹的記號）
#   整合測試：street_trees_integration（正式／改之前＝擋掉 street_trees.glb：TreeField、記號、材質、LOD、導航／碰撞／互動點、效能、換區域、?nobldg）、
#     campus_glb_integration、gongguan_glb_integration、wz_street_integration、street_props_integration（共用的區域與樹附近的正式模型）、
#     see_through（樹幹透視：樹幹現在是 InstancedMesh）、campus_layout_nav、p0_movement、reachability_all、zone_transitions
#   三時段前後比較圖（修改前＝只擋掉 street_trees.glb）。模擬器（SwiftShader）一次只跑一個瀏覽器工作。
# 用法：bash tools/blender/env_second/run_trees_acceptance.sh [log 資料夾] [tests|shots|all] [網址]
cd "$(dirname "$0")/../../.."
LOG=${1:-docs/art-rebuild/second_ai/test_logs/trees}; WHAT=${2:-all}; U=${3:-http://127.0.0.1:8782/index.html}; mkdir -p "$LOG"
keep(){ local d=docs/art-rebuild/second_ai/test_shots/trees/$1; mkdir -p "$d"; git status --porcelain -- screenshots docs/art-rebuild/screenshots | sed 's/^...//' | while read -r f; do [ -f "$f" ] && cp "$f" "$d/"; done; git checkout -q -- screenshots docs/art-rebuild/screenshots 2>/dev/null; }
run(){ local name=$1; shift; echo "=== $name $(date -u +%H:%M:%S)"; timeout 3600 "$@" > "$LOG/$name.log" 2>&1; echo "exit $? $(date -u +%H:%M:%S)"; grep -E "^(ALL PASS|FAILED|RESULT)" "$LOG/$name.log" | tail -2; keep "$name"; }
if [ "$WHAT" = tests ] || [ "$WHAT" = all ]; then
  run street_trees_unit node tests/street_trees_unit.js
  run street_trees_integration python3 tests/street_trees_integration.py $U
  run campus_glb_integration python3 tests/campus_glb_integration.py $U
  run gongguan_glb_integration python3 tests/gongguan_glb_integration.py $U
  run wz_street_integration python3 tests/wz_street_integration.py $U
  run street_props_integration python3 tests/street_props_integration.py $U
  run see_through python3 tests/see_through.py $U
  run campus_layout_nav python3 tests/campus_layout_nav.py $U
  run p0_movement python3 tests/p0_movement.py $U
  run reachability_all python3 tests/reachability_all.py $U
  run zone_transitions python3 tests/zone_transitions.py $U
fi
if [ "$WHAT" = shots ] || [ "$WHAT" = all ]; then
  python3 tools/blender/env_second/shots/trees_shots.py > /dev/null
  run shots_before python3 tools/blender/env_second/shots/fast_shots.py "$U" tools/blender/env_second/shots/trees_before.json --block=street_trees.glb
  run shots_after python3 tools/blender/env_second/shots/fast_shots.py "$U" tools/blender/env_second/shots/trees_after.json
fi
echo "=== done $(date -u +%H:%M:%S)"
