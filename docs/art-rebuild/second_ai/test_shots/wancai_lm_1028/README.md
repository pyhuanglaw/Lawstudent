# 萬才館室內（一樓大廳＋二樓）光照烘焙（WANCAI-LM-1028；LAWWW2-C 2026-10-28）

- **起因**：使用者 10-28 P0（UA-LAWWW2-1028-01）「校內建築 空間內配置……廉價手遊感」。
  - 檢討報告第 5 節的順序：201 → 霖澤館大廳 → 其他。萬才館是法律系的另一棟，社團（法服社）在一樓大廳聚會。
- **做法和霖澤館大廳一樣**（`test_shots/linze_lobby_v2_1028/README.md` 的光照一節）：同一套燈具、同樣朝南的兩層樓玻璃帷幕，亮度、白平衡照大廳校正好的參數。
- **程式不用改**：萬才館也走 `B3.attachFormal`，大廳那一包加的接法看到 GLB 的 `extras.lightmap` 就接上（已整合在開發分支 `ac2ab0ae9`）。
- **狀態**：`READY_FOR_ART_REVIEW`。建築、場景只有使用者能標 `ART_APPROVED`。
- **怎麼套**：
  1. 二進位檔：`assets/models/env/wancai_interior.glb`、`wancai_interior_lm_day.webp`、`wancai_interior_lm_night.webp`。
  2. 測試（新的，選用）：`git apply docs/art-rebuild/second_ai/patches/wancai_lm_1028.patch`（`tests/wancai_lightmap_unit.js`）。
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

- 配置（`src/data/wancai_layout.js`）、導航、互動點、劇情站位（社團聚會、助教）、電梯、樓梯的走法都沒改。
- 遊戲程式沒改；存檔格式沒改。

## 測試

TESTS_PLACEHOLDER

## 效能

PERF_PLACEHOLDER

## 缺點、還沒做

LIMITS_PLACEHOLDER
