# WINVIEW-AUDIT-1105：日常失速右窗（朝北）晚上也是晚上（LAWWW2-C，2026-11-13）

驗收幫手 g1 日常失速時發現：並排圖 20:00 那張，東側／北側落地窗外還是大白天的綠樹，新舊版都一樣。

- 原因：`src/zones3d.js` 的 WZ_VIEW.offbeat 只換正面那片（WALL_front_VIEW）。右窗 WALL_right_VIEW 留著模型原本那張樹，沒有夜版。11-05 決定「那一頭是地圖外，拍出來是一片空地，先留樹」。
- 改法：
  - 樹照留。從 daily_offbeat.glb 把那張抽出來，縮成 1024×512，存成 `aa_support/offbeat_view_right_day.webp`。
  - 晚上用同一張做 `offbeat_view_right_night.webp`：整體壓暗、偏暖，上面暗、下面兩團路燈的暖光。對照圖 `right_day_night.jpg`。
  - WZ_VIEW.offbeat 加一筆 WALL_right_VIEW。wzViewSwap 每一筆各自複製一份材質，前窗不受影響。
- 測試：
  - 新的 `tests/offbeat_rightview_night_1113_unit.js` 修改前 FAIL 2 → ALL PASS。
  - `tests/wz_views_1105_unit.js` 第 ⑤ 項原本寫死「右窗是模型原本那張」，改成「右窗是自己的樹、和前窗分開」，ALL PASS。
  - offbeat 四支、te_komichi_stage、mokuyobi_unit、place_gate ALL PASS。
- 套法：`git apply docs/art-rebuild/second_ai/wip/winview_offbeat_right_1113/offbeat_rightview.patch`（底 19399e5d39）。和 g1 的日常失速 patch 不衝突（那份不動 zones3d.js）。
- 還沒做：CC 晚上 20:00 店裡朝窗拍一張、BB 判。
