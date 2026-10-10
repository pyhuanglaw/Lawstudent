#!/bin/bash
# 溫州街近景（公寓、日式宿舍、街道細節、小公園、機車）＋便利商店室內的驗收流程（第二個 AI）：回歸測試（docs/SECOND_AI_HANDOFF.md 第 3 節；騎樓柱子有樹幹透視 → 加跑 see_through）→ 修改前／後截圖。
# 模擬器（SwiftShader）一次只跑一個，不要和其他瀏覽器工作同時跑（會逾時或誤判）。
# 用法：bash tools/blender/env_second/run_street_acceptance.sh [log 資料夾] [tests|shots|after|south|all] [網址]（after＝只拍修改後，加 Café 外觀；south＝測試＋遠景前後＋溫州街修改後）
cd "$(dirname "$0")/../../.."
LOG=${1:-docs/art-rebuild/second_ai/test_logs/street}; WHAT=${2:-all}; U=${3:-http://127.0.0.1:8765/index.html}; mkdir -p "$LOG"
# 回歸測試會把截圖寫進第一個 AI 的資料夾（screenshots/、docs/art-rebuild/screenshots/）：複製到第二個 AI 的 test_shots/street/<測試>/，再把第一個 AI 的檔案還原
keep(){ local d=docs/art-rebuild/second_ai/test_shots/street/$1; mkdir -p "$d"; git status --porcelain -- screenshots docs/art-rebuild/screenshots | sed 's/^...//' | while read -r f; do [ -f "$f" ] && cp "$f" "$d/"; done; git checkout -q -- screenshots docs/art-rebuild/screenshots; }
run(){ local name=$1; shift; echo "=== $name $(date -u +%H:%M:%S)"; timeout 3000 "$@" > "$LOG/$name.log" 2>&1; echo "exit $? $(date -u +%H:%M:%S)"; grep -E "^(ALL PASS|FAILED|PASS|FAIL)" "$LOG/$name.log" | tail -3; keep "$name"; }
if [ "$WHAT" != shots ] && [ "$WHAT" != after ]; then
  run wz_street_integration python3 tests/wz_street_integration.py $U
  run cafe_glb_integration python3 tests/cafe_glb_integration.py $U
  run cvs_glb_integration python3 tests/cvs_glb_integration.py $U
  run reachability_wenzhou_cafe_cvs python3 tests/reachability_all.py $U --zones wenzhou,cafe,cvs
  run zone_transitions python3 tests/zone_transitions.py $U
  run p0_movement python3 tests/p0_movement.py $U
  run touch_flow_wenzhou python3 tests/touch_flow_wenzhou.py $U
  run see_through python3 tests/see_through.py $U
fi
if [ "$WHAT" != tests ]; then
  python3 tools/blender/env_second/shots/make_shots.py > /dev/null
  # 截圖：fast_shots.py（同一種畫面大小只載入一次遊戲；和 scene_shot.py 同一種 JSON）
  python3 -c "import json;a=json.load(open('tools/blender/env_second/shots/street_before.json'))+json.load(open('tools/blender/env_second/shots/cvs_before.json'));json.dump(a,open('$LOG/shots_before.json','w'))"
  python3 -c "import json;a=json.load(open('tools/blender/env_second/shots/street_after.json'))+json.load(open('tools/blender/env_second/shots/cvs_after.json'));json.dump(a,open('$LOG/shots_after.json','w'))"
  if [ "$WHAT" = south ]; then   # south：遠景公寓那批——遠景的前／後＋溫州街的修改後（遠景出現在部分鏡頭裡）
    python3 -c "import json;json.dump(json.load(open('tools/blender/env_second/shots/south_before.json')),open('$LOG/shots_before.json','w'))"
    python3 -c "import json;a=json.load(open('tools/blender/env_second/shots/south_after.json'))+json.load(open('tools/blender/env_second/shots/street_after.json'));json.dump(a,open('$LOG/shots_after.json','w'))"
  fi
  [ "$WHAT" != after ] && run shots_before python3 tools/blender/env_second/shots/fast_shots.py "$U?nobldg" $LOG/shots_before.json
  if [ "$WHAT" = after ]; then python3 -c "import json;a=json.load(open('$LOG/shots_after.json'))+[v for v in json.load(open('tools/blender/env_second/shots/cafe_after.json')) if '_int_' not in v['out']];json.dump(a,open('$LOG/shots_after.json','w'))"; fi   # after：只重拍修改後（修改前＝?nobldg 沒變）；Café 外觀也一起
  run shots_after python3 tools/blender/env_second/shots/fast_shots.py "$U" $LOG/shots_after.json
fi
echo "=== done $(date -u +%H:%M:%S)"
