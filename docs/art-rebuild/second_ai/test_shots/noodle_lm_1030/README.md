# 阿鳳麵店室內：光照烘焙＋不鏽鋼、燈座（NOODLE-LM-1030；LAWWW2-B 2026-10-30）

- **起因**：LAWWW-B 10-30 派工（INTERIOR-AAA：`INTERIOR_AAA_REVIEW_1028.md` 第 5 節 P1 光照）。麵店是大一上麵店團、考完的晚餐常去的地方。
- **狀態**：`READY_FOR_ART_REVIEW`。建築、場景的 `ART_APPROVED` 只有使用者能標。
- **截圖條件**：
  - 遊戲內固定鏡頭（藏玩家、NPC），1280×720。
  - Playwright＋SwiftShader 模擬，**不是 iPhone 實機**。讀檔放位置是 [捷徑]。
  - 改前＝開發 `ade6ef271` 原樣；改後＝開發 `ade6ef271`＋這一包。

## 一、交付

| 檔案 | 內容 |
|---|---|
| `assets/models/env/second_ai/noodle_interior.glb` | 多一套 UV（TEXCOORD_1）、`extras.lightmap`；不鏽鋼、燈座換材質（下面）。437 → （待填）KB |
| `assets/models/env/second_ai/noodle_interior_lm_day.webp`、`_night.webp` | 光照貼圖 1024（待填） |
| `assets/models/env/second_ai/noodle_interior.json` | 統計（三角形 6,008 → 6,056：燈管 6 → 8 邊） |
| `tools/blender/env_second/noodle_interior.py` | 產生器：不鏽鋼金屬度、燈座材質 |
| `tools/blender/env_second/lightbake/bake_noodle.sh`、`noodle_interior_lm.json` | 建模＋烘焙＋WebP（512 取樣約 30 分鐘）、這次的參數紀錄 |
| `tools/blender/env_second/shots/noodle_lm_shots.py` | 截圖鏡頭 |

- **不用改程式、不用套 patch**：`zones3d.js` 的 noodle 用 `attachRoomGLB` 接正式模型，看到 `extras.lightmap` 就接（和 Café 同一套）。配置、座位、導航都不動。

## 二、改了什麼

（待填）

## 三、改前改後（同鏡頭；左＝改前、右＝改後）

五個鏡頭：門口往裡看、後面往店面看、煮麵台近看、往上看日光燈、左邊牆（菜單、電視）。

![白天 14:00](01_day.webp)

![晚上 20:30](02_night.webp)

## 四、測試、效能

（待填）

## 五、還沒做到的

- 人物、碗、調味罐、桌腳照即時光：晚上這些小東西會比旁邊烘過的地板、桌面偏暖一點（遊戲的即時燈是暖色）。
- 店面朝東，下午的太陽在屋子後面：白天只有店面進來的天光，地上沒有陽光的窗框影子。
- 生活感擺設（檢討報告 P4：牆上的電扇轉、冰箱、時鐘）這一輪沒做；背景版（`--layout longtable`）有的冰箱、時鐘、月曆沒有搬進遊戲版。
