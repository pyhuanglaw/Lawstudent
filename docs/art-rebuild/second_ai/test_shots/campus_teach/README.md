# ART-EXT-TEACH：普通教學館、博雅教學館（外觀＋室內）

LAWWW2-C，2026-10-18。

- 誰派的：使用者 10-18 03:3x 說四座全部改；LAWWW-C 03:08 派，範圍是外觀＋室內。
- 狀態：`MODEL_READY`，場景美術 **READY_FOR_ART_REVIEW**（使用者看過才算）。
- 分兩批交：
  - **第一批：外觀**（這一節）。
  - **第二批：室內**（牆、地板、天花、樓梯、教室），做好再補在下面。

## 第一批：外觀

### 查到的真實資料（只有文字，沒有照片）
來源：`docs/art-rebuild/second_ai/research/四棟教學館與宿舍_參考資料.md` 第 2、3 節。使用者 10-13 給的照片連結，沙盒還是打不開。
- **普通**：
  - 1991 年重建、五層樓、磚紅色、和周圍建築協調；
  - 二樓有空橋往北接博雅。
- **博雅**：
  - 2011 年啟用、地上五層＋地下一層，境向聯合建築師事務所；
  - 入口在西南（綠園）與東側；北邊是醉月湖；
  - 一樓有階梯教室和三處大型公共空間。

### 玩家會看到什麼
- **普通**（照文字資料）：
  - 五層；紅褐色面磚；
  - 每層一條洗石子的樓層帶，窗是洗石子窗框＋鋁窗，一開間一道磚柱；
  - 正面中間的平頂門廊（洗石子框、玻璃門、名牌「普通教學館」）；
  - 北面二樓是空橋的門；屋頂有樓梯間出口、水塔、冷氣室外機。
- **博雅**（**現代建築的外觀是推測**，沒有照片）：
  - 五層；
  - 一樓整面玻璃（大廳、公共空間），往內退 0.6 m、上面的樓板挑出去；
  - 上層是橫向長窗＋垂直鋁鰭；淺灰外牆；
  - 東端一道直的樓梯間長窗；四面挑出 0.9 m 的薄屋頂板；
  - 南面入口：薄雨遮＋兩支細鋼柱、名牌「博雅教學館」。
- 兩棟都是五層（真的樓層數）。原本的套件是四層，patch 一起改。
- 樓層高度和空橋對得上：
  - 普通一樓 4.0 m＝校園空橋外觀的 `Y0`；
  - 博雅一樓 4.6 m＝空橋往北升 0.6 m 的那一端。

### 遊戲內前後截圖
Playwright、iPhone 直向 390×844 模擬（另一張橫向）；LAWWW-C 分支 `5ffde5b3`。
- 上一排：改之前，套件。
- 下一排：改之後，本 patch＋GLB。

| 普通（從東南看） | 普通晚上 20:30 | 兩棟之間（空橋下） | 博雅（醉月湖那一側） |
|---|---|---|---|
| ![](before_pt_front2.webp) | ![](before_pt_night2.webp) | ![](before_gap.webp) | ![](before_by_lake.webp) |
| ![](after_pt_front2.webp) | ![](after_pt_night2.webp) | ![](after_gap.webp) | ![](after_by_lake.webp) |

橫向：

| 改之前 | 改之後 |
|---|---|
| ![](before_land.webp) | ![](after_land.webp) |

- 普通正面南邊離文學院的背面只有約 5.5 m，鏡頭退不開，所以正面那張從東南斜看。

Blender 算圖（Cycles）：

| 普通 | 博雅（北面） | 鳥瞰 |
|---|---|---|
| ![](blender_pt_front.webp) | ![](blender_by_north.webp) | ![](blender_aerial.webp) |

### 交付
- GLB：
  - `assets/models/env/second_ai/campus_putong.glb`：7.2 千三角形、0.7 MB；
  - `assets/models/env/second_ai/campus_boya.glb`：3.4 千三角形、0.5 MB。
- 腳本：`tools/blender/env_second/campus_teach.py -- --set putong|boya`。
- patch：`docs/art-rebuild/second_ai/patches/campus_teach_ext.diff`，對 LAWWW-C 分支 `5ffde5b3`。
  - `src/assets3d.js`：加 `bldg.campus_putong`、`bldg.campus_boya`。
  - `src/zones3d.js`：
    - 普通 `CK.hall` 改 `floors:5, fh:3.6`；
    - 博雅 `CK.modern` 改 `floors:5, gfh:4.6`；
    - 兩棟加 `ckTag`、有正式模型時 `dyn`；
    - 載入後 `attachWenzhouModel`，和其他校園地標同一套接法。
  - 導航、門口互動點（`classes3d.js` 的 `DOORS.putong`、`DOORS.boya`）都沒改。
- 測試：
  - `node tests/nav_buildings_unit.js` ALL PASS；
  - 遊戲內截圖沒有 JS 錯誤。
  - 沒測：iPhone 實機；`campus_layout_nav`（導航沒動，沒有跑）。

### 還沒做到的
- 兩棟都沒有照片。博雅的外觀幾乎都是推測：顏色、材料、窗的分割、雨遮。
- 博雅西南、東側的另外兩個入口沒有做。遊戲只有南面一個門口互動點。
- 博雅地下一層看不到，沒有做。

## 第二批：室內
做好再補。
