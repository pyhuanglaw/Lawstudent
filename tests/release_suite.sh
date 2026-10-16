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
run stairs_cam_slab_unit  node tests/stairs_cam_slab_unit.js    # 樓梯上、電梯裡的人不被上一層的樓板擋住（2026-10-11 v9.5 審查）
for c in char.yuting char.heroine_01 char.heroine_02 char.heroine_03 char.heroine_04 char.heroine_05; do run "stairs_feet_${c#char.}" node tests/stairs_feet_unit.js "$c"; done
run sim_hair              node tools/dev_scratch/spring_sim/sim_hair.js
run sit_feet_unit         node tests/sit_feet_unit.js
run seated_look_unit      node tests/seated_look_unit.js        # 坐著的人看著玩家時上半身不轉圈（2026-10-11 室友轉圈）
run guide_unit            node tests/guide_unit.js              # 目標文字 → 導航目的地、開放時間
run schedule_refresh_unit node tests/schedule_refresh_unit.js     # 待在區域裡，照行程該出現的人會出現、時段結束的人離開（人物線索和實際一致；v9.5 審查）
run presence_unit       node tests/presence_unit.js           # 人物在不在學校（AA_110 第 3 節）：某學期不在（交換）、之後不在（休學）、寒暑假算前一學期；不在時不生出來、線索寫原因、沒有課堂反應句
run allowance_unit        node tests/allowance_unit.js          # 生活費：每月 1 日 30,000、開局 22,000、舊存檔補一次（D48）
run nav_lawlib_unit       node tests/nav_lawlib_unit.js         # 法律學院圖書館：兩層導航、U 形樓梯、座位、萬才館大廳的門（D46）
run calendar_hours_unit   node tests/calendar_hours_unit.js     # 日曆（學期、寒暑假、國定假日）＋法圖開放時間（D53）
run classes_unit          node tests/classes_unit.js            # 課表（AA_103／AA_104，D52）：資料、撞課、狀態、教授位置、考試週、成績單、門口上課點
run quick_travel_unit     node tests/quick_travel_unit.js       # 快速前往的落點都站得住、走得出去；時間照距離（D54）
run campus_public_unit    node tests/campus_public_unit.js      # 公共場景（共同教學館、大一女舍）：入口站得住、從校門與霖澤館前走得到、建築走不進去（D55）
run crowd_unit            node tests/crowd_unit.js              # 人流：共同教學館門口上課前後、大一女舍門口早晚；同一時段進出看到同一批人；跳過時間重排（D55）
run nav_teach_unit        node tests/nav_teach_unit.js          # 公共教學館模板（共同、博雅室內）：座位、樓梯、出口、牆、階梯教室、關著的房間、小孤島（D55）
run teach_class_unit      node tests/teach_class_unit.js        # 建築裡的教室上課（共同教學館 101）：坐下的上課選項、目標導航、同學、門（D55）
run boya_lecture_unit     node tests/boya_lecture_unit.js       # 博雅的講座人潮（測試資料）：開始前 15 分鐘坐滿、結束離開、講座資訊螢幕（D55）
run indoor_crowd_unit     node tests/indoor_crowd_unit.js       # 教學館室內的人流：上課前門口等、走進去坐空位、下課走出去（不是瞬間消失）、跳過時間直接移除（D55）
run syllabus_unit         node tests/syllabus_unit.js           # BB 的普通課堂內容（AA_104 syllabus）＋課程代號同步（AA_110）：每門課都有內容、字數、不講案號、B／C 樣板
run activities_unit      node tests/activities_unit.js         # 活動與演講（資料格式、海報、進行中）＋事件的 room／activity／npcHere 條件（D55）
run events_interface_unit node tests/events_interface_unit.js  # 事件介面五種狀況：一次性／冷卻、不同學期、關係與旗標的值、跳過時間與快速前往（錯過就錯過、tier 上限）、演講到場（AA_107 第 10-1 節）
# 其他所有 Node 單元測試（TEST-06，2026-10-16：上面點名的之外，新寫的 *_unit.js 自動跟著跑——戀愛、閒聊階梯、回家、阿凱宿舍、載妹墊、經濟系那一年、各學期事件…）
for f in tests/*_unit.js; do n=$(basename "$f" .js); grep -q "^run $n " "$0" && continue; [ "$n" = stairs_feet_unit ] && continue; run "$n" node "$f"; done
run handoff_check_unit    python3 tests/handoff_check_unit.py     # 交接對帳工具（D82）
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
run flow_wancai_stairs    python3 tests/flow_wancai_stairs.py "$URL" "$OUT/flow_wancai_stairs"     # 萬才館大樓梯（D41）
run flow_wancai_floors    python3 tests/flow_wancai_floors.py "$URL" "$OUT/flow_wancai_floors"     # 萬才館室內兩層樓（D42）
run flow_library_floors   python3 tests/flow_library_floors.py "$URL" "$OUT/flow_library_floors"   # 總圖大廳（D43）
run flow_library_scene    python3 tests/flow_library_scene.py "$URL" "$OUT/flow_library_scene"     # 小安「總圖的下午」在二樓自習區
run flow_classes          python3 tests/flow_classes.py "$URL" "$OUT/flow_classes"                 # 課表、手機、快速前往、跳過時間（D52、D54）
run flow_teaching_bldgs   python3 tests/flow_teaching_buildings.py "$URL" "$OUT/flow_teaching_buildings"   # 公共教學館（D55）：走到正門、大地圖、手機快速前往、舊存檔
run guide_flow            python3 tests/guide_flow.py "$URL?turbo" "$OUT/guide_flow"           # 導航、大地圖、入口名牌、開放時間（2026-10-11 使用者回報）
run levels_no_sky         python3 tests/levels_no_sky.py "$URL?turbo" "$OUT/levels_no_sky"     # 霖澤館上下樓梯、搭電梯不看到大片天空（2026-10-11）
run flow_dorm_hall        python3 tests/flow_dorm_hall.py "$URL" "$OUT/flow_dorm_hall"         # 宿舍走廊（D44）
run flow_main_day12      python3 tests/flow_main_day12.py "$URL" "$OUT/flow_main_day12"   # TESTING.md 第五節第 6 項（第一、二天主線，20–40 分鐘）：2026-10-11 才補進來，之前的發布都沒跑
[ -n "$V7" ]   && run save_compat_v7   python3 tests/save_compat_v7.py "$V7" "$URL"
[ -n "$LIVE" ] && run save_compat_live python3 tests/save_compat_v7.py "$LIVE" "$URL"
echo "=== 總表（$SUM）"; cat "$SUM"; grep -q "FAIL" "$SUM" && exit 1 || exit 0
