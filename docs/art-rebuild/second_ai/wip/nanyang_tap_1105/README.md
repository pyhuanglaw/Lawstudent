# 南洋戲院 1 廳：點斜地板的落點（NANYANG-HALL-WALKMESH-1105，LAWWW2-C 2026-11-05）

- **擋玩**（D141 照樣要修）：CC-C 在 `13700be8f` 量到，BB-C、LAWWW-C 05:3x 轉來。
  - 1 廳點斜地板的時候，人會走到後面去。點越前面偏越多：點 z −4.6（第一排前面）只走到 z −1.19。
  - 手機玩家只能點地面，所以前排坐不到。
- 原因：`nanyang3d.js` 沒有註冊 `zone.walkMeshes`。
  - 這時 `E.screenToFloor` 會退回「y 0 的平面」。
  - 但 1 廳的地板從門口 y 0 往舞台斜到 −0.96，兩者對不上。
- 改法（`nanyang_tap_1105.patch`，只改 `src/nanyang3d.js`）：照山嵐樓梯的可點面，加三片看不到的地面，都標 `walkLv 0`。三片的高度照配置的 `slope`，和導航格一樣。
  - 門口那一段平的（z 4.3～8，y 0）。
  - 中間的斜面（z −3.54～4.3，y −0.96～0）。
  - 第一排前面到舞台平的（z −8～−3.54，y −0.96）。
- 測試 `tests/nanyang_tap_unit.js`（新）：照 `E.screenToFloor` 的算法，從門口的鏡頭往右邊走道（x 3.65）打。

| | ① 有三片可點面 | ② 點 z 2／0／−2／−4.6 的落點差 | ③ 三片的高度＝導航格 |
|---|---|---|---|
| 修改前（`685337469`） | FAIL（0 片） | FAIL：0.48／1.14／1.98／2.98 m | FAIL |
| 修改後 | PASS | PASS：0.02／0.03／0.04／0.03 m（門檻 0.5） | PASS |

- 我的鏡頭位置是估的（門口那一側、高 2.9 m），所以修改前的差和 CC 在 PC 上量的（0.67／1.45／2.38／3.41）不完全一樣，趨勢相同。
- 乾淨的 `685337469`＋這個 patch：
  - ALL PASS：`nanyang_tap_unit`、`nanyang_unit`、`seat_reach_unit`、`xinsheng_unit`、`spawn_exit_unit`、`placemap_unit`、`exit_ring_unit`、`scene_bg_keys_unit`、`rooms_glb_unit`、`crowd_unit`、`indoor_crowd_unit`、`presence_unit`、`calendar_hours_unit`、`quick_travel_unit`。
  - 瀏覽器沒跑（D131）。CC 的探針「點斜地板落點差 ≤ 0.5 m」要在 PC 上重跑。
- 這個 patch 和新生南路四間店的三個包不衝突，可以先接、單獨接。
- 接法：
  - `git checkout <本包 SHA> -- tests/nanyang_tap_unit.js`
  - `git apply docs/art-rebuild/second_ai/wip/nanyang_tap_1105/nanyang_tap_1105.patch`
