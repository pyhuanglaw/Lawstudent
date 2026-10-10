#!/bin/bash
# 獨立室內（麵店 noodle、書店 bookstore、宿舍 dorm）的驗收流程（第二個 AI）：整合測試＋回歸測試（docs/SECOND_AI_HANDOFF.md 第 3 節）→ 修改前／後截圖（fast_shots）。
# 模擬器（SwiftShader）一次只跑一個，不要和其他瀏覽器工作同時跑。
# 用法：bash tools/blender/env_second/run_interiors_acceptance.sh [log 資料夾] [tests|shots|all] [網址] [區域，預設 noodle,bookstore,dorm]
cd "$(dirname "$0")/../../.."
LOG=${1:-docs/art-rebuild/second_ai/test_logs/interiors}; WHAT=${2:-all}; U=${3:-http://127.0.0.1:8765/index.html}; Z=${4:-noodle,bookstore,dorm}; mkdir -p "$LOG"
keep(){ local d=docs/art-rebuild/second_ai/test_shots/interiors/$1; mkdir -p "$d"; git status --porcelain -- screenshots docs/art-rebuild/screenshots | sed 's/^...//' | while read -r f; do [ -f "$f" ] && cp "$f" "$d/"; done; git checkout -q -- screenshots docs/art-rebuild/screenshots; }
run(){ local name=$1; shift; echo "=== $name $(date -u +%H:%M:%S)"; timeout 3000 "$@" > "$LOG/$name.log" 2>&1; echo "exit $? $(date -u +%H:%M:%S)"; grep -E "^(ALL PASS|FAILED|PASS|FAIL|RESULT)" "$LOG/$name.log" | tail -3; keep "$name"; }
if [ "$WHAT" != shots ]; then
  run interior_glb_integration python3 tests/interior_glb_integration.py $U $Z
  run reachability_interiors python3 tests/reachability_all.py $U --zones $Z
  run zone_transitions python3 tests/zone_transitions.py $U
  case ",$Z," in *,dorm,*) run movement_regression_A python3 tests/movement_regression.py $U A ;; esac   # 宿舍：玩家每天起床的地方（交接文件：改之前、之後都跑 A 段）
  run p0_movement python3 tests/p0_movement.py $U
fi
if [ "$WHAT" != tests ]; then
  python3 tools/blender/env_second/shots/make_shots.py > /dev/null
  python3 -c "import json;a=json.load(open('tools/blender/env_second/shots/interiors_before.json'));json.dump(a,open('$LOG/shots_before.json','w'))"
  python3 -c "import json;a=json.load(open('tools/blender/env_second/shots/interiors_after.json'));json.dump(a,open('$LOG/shots_after.json','w'))"
  run shots_before python3 tools/blender/env_second/shots/fast_shots.py "$U?nobldg" $LOG/shots_before.json
  run shots_after python3 tools/blender/env_second/shots/fast_shots.py "$U" $LOG/shots_after.json
fi
echo "=== done $(date -u +%H:%M:%S)"
