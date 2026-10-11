#!/bin/bash
# 行政大樓（bldg.campus_admin）的驗收——LAWWW 2026-10-10 23:26Z 的條件：
# 整合測試（總圖＋傅鐘＋行政大樓：套件外觀藏起來、外框照套件、導航／碰撞／互動點和改之前一樣、石碑匾額、20:30 地燈／暖光／光暈與路燈、套件光暈不會跑回來、陰影、太陽方向、效能：三角形 ≤ 改之前、draw call ≤ +10%）、
# campus_layout_nav、see_through、reachability_all（全遊戲）、zone_transitions、p0_movement、view_audit（行政大樓四周 360°）、
# 三時段前後比較圖（修改前＝只擋掉 campus_admin.glb）。模擬器（SwiftShader）一次只跑一個瀏覽器工作。
# 用法：bash tools/blender/env_second/run_admin_acceptance.sh [log 資料夾] [tests|shots|audit|all] [網址]
cd "$(dirname "$0")/../../.."
LOG=${1:-docs/art-rebuild/second_ai/test_logs/admin}; WHAT=${2:-all}; U=${3:-http://127.0.0.1:8774/index.html}; mkdir -p "$LOG"
keep(){ local d=docs/art-rebuild/second_ai/test_shots/admin/$1; mkdir -p "$d"; git status --porcelain -- screenshots docs/art-rebuild/screenshots | sed 's/^...//' | while read -r f; do [ -f "$f" ] && cp "$f" "$d/"; done; git checkout -q -- screenshots docs/art-rebuild/screenshots 2>/dev/null; }
run(){ local name=$1; shift; echo "=== $name $(date -u +%H:%M:%S)"; timeout 3600 "$@" > "$LOG/$name.log" 2>&1; echo "exit $? $(date -u +%H:%M:%S)"; grep -E "^(ALL PASS|FAILED|RESULT)" "$LOG/$name.log" | tail -2; keep "$name"; }
if [ "$WHAT" = tests ] || [ "$WHAT" = all ]; then
  run campus_glb_integration python3 tests/campus_glb_integration.py $U
  run campus_layout_nav python3 tests/campus_layout_nav.py $U
  run see_through python3 tests/see_through.py $U
  run p0_movement python3 tests/p0_movement.py $U
  run reachability_all python3 tests/reachability_all.py $U
  run zone_transitions python3 tests/zone_transitions.py $U
fi
if [ "$WHAT" = audit ] || [ "$WHAT" = all ]; then
  run view_audit python3 tools/dev_scratch/view_audit.py $U tools/blender/env_second/shots/admin_audit.json docs/art-rebuild/second_ai/shots/admin_audit
  run view_audit_before python3 tools/dev_scratch/view_audit.py "$U?nobldg" tools/blender/env_second/shots/admin_audit.json docs/art-rebuild/second_ai/shots/admin_audit_nobldg
fi
if [ "$WHAT" = shots ] || [ "$WHAT" = all ]; then
  python3 tools/blender/env_second/shots/admin_shots.py > /dev/null
  run shots_before python3 tools/blender/env_second/shots/fast_shots.py "$U" tools/blender/env_second/shots/admin_before.json --block=campus_admin.glb
  run shots_after python3 tools/blender/env_second/shots/fast_shots.py "$U" tools/blender/env_second/shots/admin_after.json
fi
echo "=== done $(date -u +%H:%M:%S)"
