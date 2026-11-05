# 體育館 3F 主球場：點看台的落點（GYM-ARENA-TAP-1105，LAWWW2-C 2026-11-05）

- **擋玩**：和南洋 1 廳斜地板同一個問題（CC-C `13700be8f`；那邊是 `../nanyang_tap_1105/`）。修完南洋以後，我把所有有高度的區域掃過一遍，只剩這裡。
  - 主球場的看台最上面一排 5.2 m，但 `gym3d.js` 沒有註冊 `zone.walkMeshes`。
  - 點地面的時候，`E.screenToFloor` 會退回 y 0 的平面，所以點看台的走道、座位會落到看台後面。
  - 修改前在 Node 量到：點第 2 排偏 1.9 m、第 6 排偏 17.9 m；點第 10 排，射線碰不到 y 0 平面，等於點了沒反應。
- 掃過的其他區域都已經有可點面：
  - 霖澤館、萬才館、總圖、男一舍、法圖、社科圖、普通、博雅、木曜日、山嵐、校園的總圖平台、201 教室的階梯。
  - 新生南路新做的三間（大口漢堡、運動廣場）有樓梯的可點面。
- 改法（`gym_arena_tap_1105.patch`，只改 `src/gym3d.js`）：
  - 新增 `arenaWalk`：每一面看台一片可點面，缺口兩邊分開，共 4 片，`walkLv 0`。
  - 每一片沿著碰撞用的連續斜面 `cont(d)`，從前緣外 0.42 m 到最上面一排。
  - 點在座位上，照舊由 `tapRedirect` 走到那張座位前面。點在看台走不進去的地方，找路會走到最近的走道。
  - 場地照舊是 y 0。
- 測試 `tests/gym_arena_tap_unit.js`（新）：

| | ① 4 片可點面 | ② 點八條走道第 2、6、10 排（24 點） | ③ 點場地照舊 | ④ 高度＝斜面 |
|---|---|---|---|---|
| 修改前（`685337469`） | FAIL（0 片） | FAIL：差 1.9／17.9 m、第 10 排點不到 | PASS | FAIL |
| 修改後 | PASS | PASS：最大差 0.02 m | PASS | PASS |

- 乾淨的 `685337469`＋這個 patch：
  - `gym_*_unit` 15 支、`gymcer_unit` ALL PASS。
  - `seat_reach_unit`、`rooms_glb_unit`、`crowd_unit`、`indoor_crowd_unit`、`scene_bg_keys_unit`、`exit_ring_unit` ALL PASS。
  - 和南洋那一包一起套也 ALL PASS。瀏覽器沒跑（D131）。
- 接法：
  - `git checkout <本包 SHA> -- tests/gym_arena_tap_unit.js`
  - `git apply docs/art-rebuild/second_ai/wip/gym_arena_tap_1105/gym_arena_tap_1105.patch`
  - 在 `685337469` 上乾淨，和其他包不衝突。
