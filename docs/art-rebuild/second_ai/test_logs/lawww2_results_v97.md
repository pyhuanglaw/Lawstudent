# lawww2_results_v97 — LAWWW2 跑的 v9.7 回歸（2026-10-14）

格式：項目｜rc｜秒數｜@commit（遊戲／測試）｜結果。全部是 Playwright＋SwiftShader 手機模擬（不是實機），同一時間只有一個瀏覽器。
「rc=0(log FAILED)」＝程式結束碼 0，但 log 最後一行是 FAILED（以 log 為準）。紀錄與截圖在同一層的 `v97_rc3_8ac75f6/`、`v97_rc6_7c5d4c2/`、`v97_rc8_3e5201d/`。

| 項目 | rc | 秒數 | @commit | 結果 |
|---|---|---|---|---|
| flow_typhoon | 0 | 180 | 6ad0923（候選 4＝我的兩個 patch） | ALL PASS（14） |
| cg_rain_shots | 0 | 172 | 6ad0923 | ALL PASS（直向＋橫向，正式 CG 1920×1080） |
| flow_invite_phone | 0 | 80 | 遊戲＝候選 1 | ALL PASS（13） |
| adv_cg_layout | 0 | 49 | 3e5201d（候選 8） | ALL PASS（11） |
| flow_main_day12 | 0 | 765 | 3e5201d | ALL PASS（29） |
| flow_teaching_buildings | 0 | 951 | 3e5201d | ALL PASS（35） |
| flow_soclib | 0 | 676 | 3e5201d | ALL PASS（21） |
| campus_glb_integration | 0 | 254 | 3e5201d | ALL PASS（70；gate_avenue draw call ×1.088、三角形 ≤ 改之前） |
| flow_first_meet | 0(log FAILED) | 909 | 3e5201d | 18 PASS／2 FAIL：A 追不到（d=30.9）；B2 事件正常（FIRST_MET 有記），比對台詞「林芷若，外文二。」不符 |
| flow_discuss_class | 0(log FAILED) | 201 | dbe16a5 測試＋3e5201d 遊戲 | 3 PASS／6 FAIL：A 檢查「坐下」時人還在走（path 2）；B 轉述訊息有、格式不是「（群組）名字：…」 |
| flow_lecture_attend | 1 | 872 | 64792d3 測試＋3e5201d 遊戲（候選 9） | 8 PASS／3 FAIL：第二場坐下後時間跳 3.8 小時 → 記成 full（像是選到「聽演講」不是「坐一下」） |

較早的版本（只供參考，已被上面取代）：flow_typhoon（636688f／06f2b64 第一版測試）、flow_first_meet（候選 1、候選 6）、flow_lecture_attend（候選 1、候選 6）、flow_discuss_class（候選 1）、cg_rain_shots 直向（候選 3）——原因與 patch 見各資料夾的 README／log。

LAWWW 那邊跑的（不在這裡）：deploy_check、reachability_all、zone_transitions、minimap、save_compat、p0、touch_flow_wenzhou、Node 單元測試、flow_class_real、campus_layout_nav、joystick_direction、flow_classes、flow_linze_floors、flow_bike。
