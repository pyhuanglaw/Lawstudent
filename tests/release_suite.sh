#!/usr/bin/env bash
# 發布前測試（docs/TESTING.md 第五節的核心＋v9.4 多樓層／人物載入）：對一個「乾淨的 checkout」依序跑，最後印總表。
# 用法：在發布候選版本的乾淨 worktree 裡執行（Node 測試讀的是這個資料夾的檔案）：
#   git worktree add --detach /tmp/rc <commit>; cd /tmp/rc; python3 -m http.server 8799 &
#   bash tests/release_suite.sh http://127.0.0.1:8799/index.html <輸出資料夾> [預期版本字樣] [舊版 v7 URL] [線上舊版 URL]
# 一次只跑一個瀏覽器測試（SwiftShader）；機器很忙時移動類測試（touch_flow_wenzhou、p0_movement）可能因為時間差失敗，失敗的要在安靜時單獨重跑確認。
URL="$1"; OUT="${2:-/tmp/release_suite}"; VER="${3:-}"; V7="${4:-}"; LIVE="${5:-}"
mkdir -p "$OUT"; SUM="$OUT/SUMMARY.txt"; : > "$SUM"
run() { local name="$1"; shift; local t0=$(date +%s); "$@" > "$OUT/$name.log" 2>&1; local rc=$?; local dt=$(( $(date +%s) - t0 ));
  local tail1=$(grep -E "ALL PASS|FAILED|^PASS|^FAIL" "$OUT/$name.log" | tail -1 | cut -c1-160)
  printf '%-28s %s  (%ss)  %s\n' "$name" "$([ $rc -eq 0 ] && echo PASS || echo "FAIL(rc=$rc)")" "$dt" "$tail1" | tee -a "$SUM"; }
run nav_levels_unit       node tests/nav_levels_unit.js
run nav_buildings_unit    node tests/nav_buildings_unit.js
for c in char.yuting char.heroine_01 char.heroine_02 char.heroine_03 char.heroine_04 char.heroine_05; do run "stairs_feet_${c#char.}" node tests/stairs_feet_unit.js "$c"; done
run sim_hair              node tools/dev_scratch/spring_sim/sim_hair.js
run deploy_check          python3 tests/deploy_check.py "$URL" $VER
run model_upgrade         python3 tests/model_upgrade.py "$URL" "$OUT/model_upgrade"
run zone_transitions      python3 tests/zone_transitions.py "$URL"
run campus_layout_nav     python3 tests/campus_layout_nav.py "$URL"
run gongguan_layout_nav   python3 tests/gongguan_layout_nav.py "$URL"
run reachability_all      python3 tests/reachability_all.py "$URL"
run indoor_cam_occlusion  python3 tests/indoor_camera_occlusion.py "$URL" "$OUT/occlusion"
run minimap_direction     python3 tests/minimap_direction.py "$URL" "$OUT/minimap"
run joystick_direction    python3 tests/joystick_direction.py "$URL" "$OUT/joystick"
run p0_movement           python3 tests/p0_movement.py "$URL"
run touch_flow_wenzhou    python3 tests/touch_flow_wenzhou.py "$URL"
run flow_class_real       python3 tests/flow_class_real.py "$URL" "$OUT/flow_class_real"
run flow_linze_floors     python3 tests/flow_linze_floors.py "$URL" "$OUT/flow_linze_floors"
[ -n "$V7" ]   && run save_compat_v7   python3 tests/save_compat_v7.py "$V7" "$URL"
[ -n "$LIVE" ] && run save_compat_live python3 tests/save_compat_v7.py "$LIVE" "$URL"
echo "=== 總表（$SUM）"; cat "$SUM"; grep -q "FAIL" "$SUM" && exit 1 || exit 0
