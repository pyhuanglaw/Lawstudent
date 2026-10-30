# 有光照貼圖的房間：沒烘焙的細小零件晚上跟著暗（RT-NIGHT-1028；LAWWW2-C 2026-10-28 寫 patch，LAWWW2-B 2026-10-30 收尾交件）

- **起因**：INTERIOR-AAA-REVIEW-1028（使用者 P0「校內建築 空間內配置……廉價手遊感」）做了光照烘焙的房間（霖澤館 201、202、霖澤館大廳、萬才館、多功能教室、男一舍門廳、總圖大廳）：
  - 牆、地板、大家具有第二套 UV，吃白天、晚上兩張光照貼圖；晚上那張只剩燈，比白天暗很多。
  - 沒有第二套 UV 的東西（細小零件、頂點色的小東西、門框窗框）照舊吃即時光：半球光晚上只從 1.2 降到 0.95，所以晚上比旁邊的牆、地板亮 2～3 倍，像浮在畫面上。
  - 總圖大廳的天窗是發光面，烘焙時只有白天那一張發光；遊戲裡原本整晚照樣亮，像一片日光燈。
- **改法**（`patches/rt_night_1028.patch`：`src/zones3d.js` 的 `Z3.roomLightmap`＋新測試 `tests/room_rtnight_unit.js`）：
  - 沒有第二套 UV 的材質，shader 在半球光、方向光、點光源後面乘 `rtK`：
    - 白天 1；
    - 晚上＝這一間晚上／白天光照貼圖的平均亮度比 × 1.2／0.95（限 0.3～1）。貼圖還沒載好、讀不到像素時用 0.55。
    - 照換光照貼圖的同一條曲線混合（17:00～18:36、05:36～06:48 慢慢換）。
  - 自己發光的（燈罩等 emissive）不動；人物不在房間的 GLB 裡，不受影響。
  - 只在白天發光的材質（GLB 的 `extras.lightmap.dayEmit`；現在只有總圖大廳的天窗 `lb_skylight`）：晚上發光降到 4%、顏色換成暗的夜空。GLB 沒寫 `dayEmit` 的房間（之前交的六間）天窗、燈照舊。
  - 快取的 GLB 第二次進同一間：不再包一層 shader（BB-C 10-28 抓過的「第二次進去 shader 編不過」那一類），兩次都照時段。
- **狀態**：`READY_FOR_ART_REVIEW`（patch，沒進遊戲；LAWWW-B 整合）。建築、場景只有使用者能標 `ART_APPROVED`。
- **怎麼套**：`git apply docs/art-rebuild/second_ai/patches/rt_night_1028.patch`（開發分支 `c76d0cb69` 上 `apply --check` 通過；和 `library_hall_lm_1028.patch` 一起也通過）。和 LIB-HALL-LM-1028 一起交：總圖大廳晚上的天窗要兩包都套才會暗。

## 晚上 20:30 同角度（左＝開發 `c76d0cb69`、右＝同一個 commit＋這個 patch；總圖兩邊都換上 LIB-HALL-LM-1028 的模型）

（截圖整理中）

## 測試

- 新 `tests/room_rtnight_unit.js`（不需要瀏覽器；假的房間：有第二套 UV 的地板、沒有的小東西、會發光的燈罩、只在白天發光的天窗）：**開發分支 FAIL、套 patch 以後 ALL PASS**。
  1. 地板接光照貼圖；小東西沒接光照貼圖、shader 在半球光和方向光後面乘 `rtK`；燈罩不動；地板的 shader 沒有 `rtK`。
  2. `rtK`：12:00＝1、20:00＝晚上的值、17:48 在兩者之間。
  3. 同一批材質再進一次：`rtK` 只宣告一次，兩次都照時段。
  4. 回傳的接光照貼圖材質數不把小東西算進去。
  5. 天窗：12:00 照原本亮、20:00 降到 4%、換暗的夜空色；再進一次不會越乘越暗；不包 `rtK`；GLB 沒寫 `dayEmit` 的晚上照舊亮。
- 開發分支 `c76d0cb69`＋這個 patch＋`library_hall_lm_1028.patch`＋總圖的模型和光照貼圖：`tests/` 725 支 Node 測試 0 失敗（含 `linze_lightmap_unit`、`room_ceiling_unit`、`nav_buildings_unit`、`library_hall_lightmap_unit`）。
- 沒跑：瀏覽器流程測試、整套回歸、iPhone 實機。
