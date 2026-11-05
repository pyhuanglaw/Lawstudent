# 室內區域的小孤島總掃（ISLAND-SWEEP-1105，LAWWW2-C 2026-11-05）

- 為什麼掃：這次接新生南路的店時，每一間都找到「站得住、走不到」的小角落（v9.3 #31 那一類）。所以把所有室內區域掃一遍。
- 工具：`tools/dev_scratch/indoor_islands.js`（Node，不用瀏覽器）。
  - 照 `index.html` 載入到 `game3d.js` 以前的區域檔，建出每一個 indoor 區域。
  - 每 0.1 m 取一點，人物半徑 0.32 m 站得住的點，從出生點四方向連通。多樓層的區域，同一個位置高度差 ≤ 0.3 m 可以換層。
  - 連不到的點分群列出來，附上和最近能走到的點的距離（gap）。
- 怎麼判斷：
  - 引擎的移動只檢查目的地（`stepEntity`），沒有切小步。跑步加上低幀率，一步大約 0.4 m。
  - 所以 gap ≤ 0.45 m 的跳得進去。也跳得出來（反方向同樣一大步），不會真的卡死，但會卡一下。
  - gap 更大的是封起來的房間或角落，走不進去，不影響。
- 開發分支 `001703460`：72 個室內區域，58 個沒有孤島。原始輸出在 `sweep_001703460.txt`。

| 區域 | 孤島 | gap | 判斷 |
|---|---|---|---|
| **山嵐書店** `xs_shanlan` | 店門東邊 (4.4, 8.1)，9 點 | **0.28** | 跳得進去。這一包擋起來（`shanlan_pocket_1105.patch`），修改後 0 點 |
| **afar café** `afar` | (−2.8, 2.1)，9 點，在「坐窗邊／看看書架」範圍裡 | **0.22** | 跳得進去。LAWWW-C 06:26 決定擋起來（AA 的配置不動）：`afar_pocket_1105.patch`，修改後 0 點 |
| 總圖閱覽室 `library` | (−10.6, −16.2)，88 點 | 0.50 | 邊界：跑步一步跳不到 |
| 美國法學院圖書館 2F `us_lawlib_2f` | (−11.6, 1.0)，69 點 | 0.50 | 同上 |
| 美國公寓、C 棟 `us_apartment`／`us_shared` | (−4.0, −2.6)，4 點 | 0.50 | 同上 |
| 木曜日 2F `wz_mokuyobi` | 1 點 | 0.57 | 不影響 |
| 頁間書屋、青木、社科圖 2F、南洋 1 廳（每排座位最西端的空位） | 2～26 點 | 0.7～3.9 | 不影響 |
| 總圖 B1、單人研究室、霖澤館 5F、辦公室、美國法圖另外兩塊 | 一大片（65～9,089 點） | 1.1～1.2 | 關著的房間、整修中的區域：走不進去 |

- `shanlan_pocket_1105.patch`：只改 `src/shanlan3d.js` 一行，`nav0.blockRect(4.4, 8.2, 0.5, 0.6)`。
  - 那個位置在大盆栽 (3.9, 8.5)、靠窗長椅 (5.3, 7.4)、正面玻璃中間。
  - 套上以後 `shanlan_unit`、`seat_reach_unit` ALL PASS，掃描結果 0 點。在 `001703460` 上乾淨。
- 瀏覽器沒跑（D131）。

## afar 補件（06:3x）

- `afar_pocket_1105.patch`：只改 `src/zones3d.js` 的 afar 那一行。
  - 加了 `z.nav.blockRect(-2.8, 2.15, 0.4, 0.5)`，擋的是 x −2.9～−2.7、z 2.0～2.3。
  - 位置在靠窗長凳西端、吧台南端、西牆層架中間。
- 在開發分支 `a0979ec3d` 上乾淨。
- 套上以後：
  - 掃描結果 afar 0 點。
  - 這些測試 ALL PASS：`seat_reach`、`gg_shops2_1104`、`aa653_shops`、`shop_enc_seat`、`shop_diners`、`crowd`、`indoor_crowd`、`bike_shop_park`、`gg_glow_shoplit`、`gg_shoplit_reentry`、`invite_menu`、`placemap`、`seat_activity_1104`、`sit_task_wire`、`world_rename`、`zone_dispose`。
