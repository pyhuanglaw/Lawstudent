# 萬才館室內（一樓大廳＋二樓）：擺設＋光照烘焙（WANCAI-LM-1028；LAWWW2-C 2026-10-28）

- **起因**：使用者 10-28 P0（UA-LAWWW2-1028-01）「校內建築 空間內配置……廉價手遊感」。
  - 檢討報告第 5 節的順序：201 → 霖澤館大廳 → 其他。萬才館是法律系的另一棟，社團（法服社）在一樓大廳聚會。
- **做法和霖澤館大廳一樣**（`test_shots/linze_lobby_v2_1028/README.md` 的光照一節）：同一套燈具、同樣朝南的兩層樓玻璃帷幕，亮度、白平衡照大廳校正好的參數。
- **光照的程式不用改**：萬才館也走 `B3.attachFormal`，大廳那一包加的接法看到 GLB 的 `extras.lightmap` 就接上（已整合在開發分支 `ac2ab0ae9`）。
- **擺設**（和霖澤館大廳第二版同一套）：改前的大廳只有兩張沙發、一張圓桌、柱子，一大片地板（截圖第一排）。這一包加：
  - 北牆兩扇門（演講廳、多功能教室）中間的展示櫃：法服社、模擬法庭的獎盃、獎牌、合照、法槌（沒有字和校徽，D77）。
  - 東牆（電梯南邊）飲水機＋三個回收桶；北牆消防栓箱＋兩支滅火器。
  - 出口燈：兩扇門上方、入口上方（綠色發光，跟著牆淡出）。
  - 南面玻璃前的長椅、入口東邊的傘架、兩張沙發旁的小圓桌（雜誌、小盆栽）、兩盆大葉盆栽。
  - 中庭兩排線型吊燈（6.4 m 高）。
  - 位置都在牆邊，離劇情、社團站位 1.2 m 以上（`story3d.js` 的 `CLUB_SPOTS`、`TA_SPOT`、吉他社成發 (0,4.6)、出生點 (0,5)）。
  - 純色擺設合成一個頂點色材質（和霖澤館大廳 LOBBY-VC-1028 一樣）。
- **狀態**：`READY_FOR_ART_REVIEW`。建築、場景只有使用者能標 `ART_APPROVED`。
- **怎麼套**：
  1. 程式：`git apply docs/art-rebuild/second_ai/patches/wancai_lm_1028.patch`：
     - `src/data/wancai_layout.js`：九筆擺設。
     - `src/wancai3d.js`：家具多一種 `prop`（備用方塊＋導航阻擋），和 `building3d.js` 一樣。
     - `tools/blender/wancai_interior.py`：模型。
     - `tests/wancai_lightmap_unit.js`：新的測試。
  2. 二進位檔：`assets/models/env/wancai_interior.glb`、`wancai_interior_lm_day.webp`、`wancai_interior_lm_night.webp`。
- **截圖**：遊戲內、玩家鏡頭，手機橫向 844×390，Playwright＋SwiftShader 模擬，**不是 iPhone 實機**。讀檔進萬才館、人放到指定位置是 [捷徑]。

## 同角度對照

SHOTS_PLACEHOLDER

## 模型為了光照貼圖改的（`tools/blender/wancai_interior.py`，外觀一樣）

- 樓梯：原本每一階一個從地面長上來的方塊（互相重疊），改成只有看得到的面：踏面、踢面、東側的鋸齒形側面、第二跑的背面。
  - 西側面貼著西牆的內面，看不到，不做。
  - 止滑條改用自己的材質，不烘（1.5 cm 高，光照貼圖分不到一個像素）。
- 光照貼圖分給各面的比例（`lm`）：一樓地板 1.6、二樓地板 1.3、8.4 m 高的天花板 0.3、二樓以上的牆 0.7～0.8。
- 看不到的面不分像素（`lmhide`）：一樓地板方塊的四邊、二樓樓板的上面（被地板蓋住）。
- 同材質合併時照 `lm` 分組。

UVFILL_PLACEHOLDER

## 沒有動的（玩法、存檔）

- 原本的家具、互動點、劇情站位（社團聚會、助教）、電梯、樓梯的走法都沒改；配置只多九筆擺設，導航都在牆邊。
- 存檔格式沒改。

## 測試

TESTS_PLACEHOLDER

## 效能

PERF_PLACEHOLDER

## 缺點、還沒做

LIMITS_PLACEHOLDER
