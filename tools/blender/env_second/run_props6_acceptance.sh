#!/bin/bash
# ⑥法學院廣場的近景小物（花台、公告欄、販賣機：street_props.glb＋W3.planter／bulletin／vending）的驗收：
# street_props_integration（約定、三樣都是正式模型、外框在導航阻擋裡、校園畫面上有它們、?nobldg／載入失敗照舊程序化、導航格互動點不變）、
# campus_glb_integration（地標的效能與「沒有多藏」照舊）、campus_layout_nav、p0_movement、reachability_all（全遊戲）、zone_transitions、
# wancai_glb_integration（AI-1 萬才館一樓的公告欄也是 W3.bulletin）；三時段前後比較圖（修改前＝主工作目錄的 server：上一版）。模擬器一次只跑一個瀏覽器工作。
# 用法：bash tools/blender/env_second/run_props6_acceptance.sh [log 資料夾] [tests|shots|all] [網址] [修改前的網址＝沒有 ⑥ 的版本]
cd "$(dirname "$0")/../../.."
LOG=${1:-docs/art-rebuild/second_ai/test_logs/props6}; WHAT=${2:-all}; U=${3:-http://127.0.0.1:8781/index.html}; UB=${4:-http://127.0.0.1:8765/index.html}; mkdir -p "$LOG"
keep(){ local d=docs/art-rebuild/second_ai/test_shots/props6/$1; mkdir -p "$d"; git status --porcelain -- screenshots docs/art-rebuild/screenshots | sed 's/^...//' | while read -r f; do [ -f "$f" ] && cp "$f" "$d/"; done; git checkout -q -- screenshots docs/art-rebuild/screenshots 2>/dev/null; }
run(){ local name=$1; shift; echo "=== $name $(date -u +%H:%M:%S)"; timeout 3600 "$@" > "$LOG/$name.log" 2>&1; echo "exit $? $(date -u +%H:%M:%S)"; grep -E "^(ALL PASS|FAILED|RESULT)" "$LOG/$name.log" | tail -2; keep "$name"; }
if [ "$WHAT" = tests ] || [ "$WHAT" = all ]; then
  run street_props_integration python3 tests/street_props_integration.py $U
  run campus_glb_integration python3 tests/campus_glb_integration.py $U
  run campus_layout_nav python3 tests/campus_layout_nav.py $U
  run p0_movement python3 tests/p0_movement.py $U
  run reachability_all python3 tests/reachability_all.py $U
  run zone_transitions python3 tests/zone_transitions.py $U
  run wancai_glb_integration python3 tests/wancai_glb_integration.py $U
  # ⑤（洞洞館、社科院、字牌 atlas）和 AI-1 開發分支一起併進來之後的回歸（2026-10-11：⑤⑥ 一起交付，共用一次完整回歸）
  run see_through python3 tests/see_through.py $U
  run gongguan_glb_integration python3 tests/gongguan_glb_integration.py $U
  run wz_street_integration python3 tests/wz_street_integration.py $U
  run nav_buildings_unit node tests/nav_buildings_unit.js
  run nav_levels_unit node tests/nav_levels_unit.js
  run kit_nav_check node tools/dev_scratch/kit_nav_check.js
fi
if [ "$WHAT" = shots ] || [ "$WHAT" = all ]; then
  python3 tools/blender/env_second/shots/props6_shots.py > /dev/null
  run shots_before python3 tools/blender/env_second/shots/fast_shots.py "$UB" tools/blender/env_second/shots/props6_before.json
  run shots_after python3 tools/blender/env_second/shots/fast_shots.py "$U" tools/blender/env_second/shots/props6_after.json
fi
echo "=== done $(date -u +%H:%M:%S)"
