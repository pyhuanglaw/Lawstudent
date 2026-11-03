# BUG-SWING-FRONT-1103：溫州街小公園鞦韆 A 從正面按不到「盪鞦韆」（CC 在 ffeec06e0 找到，BB 11-03 16:22 轉）

- **原因**：BUG-SWING-SEAT 把座位搬到座板上（A z 25.0、B 24.8），`buildWzPark` 的互動點跟著座位走。鞦韆架的導航阻擋是 z 23.9～25.7，A 正面最近站得住的點在 z 23.65，離互動點 1.35 m，比 radius 1.3 大，只有走到架子後面（25.85）才按得到。
- **修法**：`src/zones3d.js` 的 `buildWzPark`：鞦韆的互動點 z＝座位 −0.8（A 24.2、B 24.0，就是座位搬家以前的位置）。座位（`it.seat`，坐下的位置）照舊在座板上，走近點 `ap` 也不動。兩座一樣。radius 沒改。
- **patch**：`swing_front_1103.patch`（接在開發分支 e4ae60161）
  - `src/zones3d.js`
  - 新測試 `tests/wz_swing_front_unit.js`
  - `tests/wz_park_unit.js` 第 4 項：改比坐下的位置 `i.seat.x/z`，不再比互動點。原本比互動點等於座位，是因為那時兩者是同一個點；坐下的位置照舊要和 layout 一樣，互動點改由新測試檢查。
- **測試**（Node，不需要瀏覽器）：
  - `wz_swing_front_unit`：A 從 (31.70, 23.65) 按得到，離互動點 0.55 m；B 0.35 m；坐下的位置照舊。**在修正前的版本，A 那一項會失敗**（正面沒有點）。
  - `wz_park_unit`、`wz_park_talk_unit`、`wz_park_people_unit`、`seat_reach_unit`、`seat_approach_reach_unit`、`nav_buildings_unit`：ALL PASS。
- **沒跑**：瀏覽器 `reachability_all.py`、實際走過去按（BB 說會請 CC 用同一個重現步驟驗）。
