⑤⑥ 合併 AI-1 8afdece（d2b6628）之後的回歸，2026-10-11 10:07Z 開始，10:2xZ 因為交班（使用者要求換班）中斷：
- street_props_integration：ALL PASS（10:07:54–10:12:27）
- campus_glb_integration：跑到一半被停掉（這份 log 不完整，不算結果）
- 其他（campus_layout_nav、p0_movement、reachability_all、zone_transitions、wancai_glb_integration、see_through、gongguan_glb_integration、wz_street_integration、nav_buildings_unit、nav_levels_unit、kit_nav_check）：沒跑
接班的人：bash tools/blender/env_second/run_props6_acceptance.sh docs/art-rebuild/second_ai/test_logs/props6 tests http://127.0.0.1:8781/index.html（工作目錄開 8781 server）重跑全部。
