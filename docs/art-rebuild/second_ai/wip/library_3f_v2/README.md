# 總圖 3F 閱覽區第二版（LIB-3F-1102）：WIP，還沒交件，不要整合

- **起因**：使用者 11-02 08:58 給的 3F 平面圖（`docs/art-rebuild/second_ai/ref/lib1102_user/0858_plan_3f.jpg`）。
- **排序**：BB 15:46 的順序是一樓二樓第二版 → B1 第三版 → LIB-FRONT v3.1 → **3F** → 效能 → v3.2。
- **LAWWW 15:34 的保留要求**：
  - 學姊的座位與作息；
  - 「三樓靠窗」；
  - 樓梯間出口、東側電梯；
  - 自習座位；
  - 座標有改要附新舊對照表；
  - 要跑 flow_library_floors、flow_library_scene、學姊總圖的 unit。

## 目前做到

- **配置**：`tools/blender/env_second/library_3f_v2_layout.py` → `library_3f_layout.js`（這裡放一份）。
  - 和大廳第二版同一個外框，北側半圓是臺大人文庫，兩旁是討論室 344／346。
  - 書架照平面圖分五區：人社西文（粉紅）、人社中文（黃）、科技西文（藍）、科技中文（綠）、現期期刊（紅）。
  - 研究小間、考古題、指定參考書、四庫全書、參考書都有。
  - 東西兩面窗前各一排閱覽桌。
  - 共 44 個座位（第一版 36）。
- **遊戲模組**：`library_3f_v2.js`（這裡放一份）。
  - 只有配置是 version 2、模組也有載入時，才接手 zones3d.js 的 `library`；第一版的 22×16 閱覽室照舊留著當備用。
  - 樓梯間在東牆 z −6，和大廳二樓樓梯間的門在同一個位置。
  - 電梯和大廳同一個井。
  - 接手時把 `LIBRARY_LAYOUT.reading` 的 `spawnFromStairs`、`elevator` 換成第二版，第一版的值留在 `reading.v1`。
- **劇情座標**（`coords_wip.patch`）：

| 用途 | 第一版 | 第二版 |
|---|---|---|
| 學姊（story3d.js，`seats[2]`） | (−2.4, −3.9)：中間長桌 | (−10.55, −7.4)：西側靠窗 |
| pool「愛睡覺的男生」seatAt（pool_more3d.js） | (−2.4, 1.5) | (−3.0, 7.25)：南側長桌 |
| pool「坐窗邊的人」seatAt（pool_story.js） | (5.6, −3.9) | (10.55, 1.6)：東側靠窗 |
| 新生導覽最後一站（classes3d.js） | (0, 3.2) | (0, 4.4)（第一版的點在第二版的書架上） |
| 新生導覽上三樓的落點（classes3d.js） | (0, 7)＋館員 (0.8, 5.6) | 讀 `reading.spawnFromStairs` (10.6, −6)＋館員 (8.98, −6.51)；第一版照舊算出 (0.8, 5.5) |
| 樓梯間落點（reading.spawnFromStairs） | (0, 7) | (10.6, −6) |
| 電梯（reading.elevator） | x 8.8～10.8、z −1～1.2 | x 9.4～11.4、z −2.6～−0.4（和大廳同一個井） |
| 「看桌上的紙條」（守誠那張桌子；pool_more3d.js 的 POP） | (−2.4, 0.6)：第一版長桌上 | (−3.0, 6.75)：南側長桌上、他座位 (−3.0, 7.25) 前面 |
| 「看期刊架」（語彤的系刊；r2y4a3d.js 的 shelfPlace） | (−9.7, 2.4)：西側書牆前 | (0, −2.75)：中間紅色現期期刊展示架（最南那一座）前面；第二版的 (−9.7, 2.4) 是靠窗的閱覽桌旁邊 |

- 後兩個是互動點，程式裡照 `L3F.active()` 選第一版或第二版的點（第二版沒載入時照舊用第一版的）；座位（seatAt）照 LAWWW 15:34 說的直接改座標。

- **單元測試**：`library_3f_v2_unit.js`（這裡放一份），在 `scratchpad/devwt_n`（int/next1102 `3e6855649`＋大廳第二版 patch＋這些）ALL PASS。
  - 44 個座位都走得到；
  - `seats[2]` 在西側靠窗；
  - 靠窗的位子 18 個；
  - 9 個互動點都站得住、走得到；
  - pool 的兩個 seatAt 是座位；
  - 導覽的最後一站、上三樓的落點都站得住；
  - 人文庫走得進去；
  - 電梯在同一個井。

- **整份 patch**（11-02 18:00）：`library_3f_v2_1102.patch`，接在 `3e6855649`＋大廳第二版 patch 上面（`git apply --check` 過）。
  - 8 個檔：`index.html`（兩個 script）、`src/classes3d.js`、`src/data/pool_story.js`、`src/pool_more3d.js`、`src/r2y4a3d.js`、新的 `src/data/library_3f_layout.js`、`src/library_3f_v2.js`、`tests/library_3f_v2_unit.js`。
  - `coords_wip.patch` 是 17:3x 的舊版（只有座標），被整份 patch 取代。
- **單元測試**：多了 3 項（紙條、期刊架、程式裡的點和配置一致），共 15 項 ALL PASS。
- **Blender**：`library_3f_v2.py` 試建 6.2 萬三角形、5.4 MB；人文庫的弧牆 18:0x 修過（頂點順序反了，和大廳展演廳同一個問題）。
- **光照烘焙**：腳本 `tools/blender/env_second/lightbake/bake_library_3f_v2.sh` 寫好了，還沒跑（等大廳第二版重烘完）；遊戲模組 `attach()` 最後用 `Z3.roomLightmap` 接光照貼圖（18:0x 補上）。

## 還沒做

- 光照烘焙（跑上面的腳本）。
- 瀏覽器測試：flow_library_floors、flow_library_scene、flow_lib_tour、reachability_all、學姊總圖 unit、library_upper_unit 等。
- 截圖、交件 README。
