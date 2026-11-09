# #204 外牆腳黑線第二批：轉角唱片、阿德補光照貼圖（LAWWW2-B 2026-11-09；LAWWW-B 21:19 從 12 間盤點選這兩間）

狀態：`WIP`（貼圖已補好；`lm_covered_fill_check` 改前、改後和回歸跑中）。
盤點：`docs/art-rebuild/second_ai/wip/wall_base_survey_1109/README.md`「沒量到的 12 間」。第一批（四間）：`wip/wall_base_fill_1109/`。

## 做了什麼
- 和第一批同一個做法：`tools/blender/env_second/lightbake/lm_fill_covered.py` 只改光照貼圖，GLB、程式都不動。
  - 公館轉角唱片 `bb_support/corner`（白天、晚上）：補 20,029 格，被蓋住的那些平均 4.6 → 36.4（白天）、4.7 → 35.8（晚上）。
  - 溫州街阿德 `bb_support/ade`（白天、晚上）：補 85,222 格，平均 6.7 → 93.9、5.9 → 83.3。
- 其他格子（WebP 重編碼）：差 ≤ 8／255 的平均差 0.5～0.8；差 > 8 的只有補的格子和留邊（轉角唱片 2.0～2.1%、阿德 8.7%）。

## 淡出露出的嚴重度（`lm_fade_reveal_check.py`，400 組鏡頭／玩家位置；`reveal_before.txt`、`reveal_after.txt`）
| 店 | 改前 | 改後 | 剩下最明顯的 |
|---|---|---|---|
| 轉角唱片 | 0.94 | **0.12** | 樑 ← 右牆金屬架 0.5 m²，29%，0.36 倍（離 2 cm 以上，接觸陰影） |
| 阿德 | 0.49 | **0.13** | 地板 ← 貨架、格櫃底下（底部離地超過 2 cm，接觸陰影） |
- 轉角唱片原本最明顯的「地板 ← 左牆木作 4.4 m²，30%」已經補掉。
- 剩下的是 2～30 cm 的接觸陰影，照第一批的規則不補。

## 測試
- **`tests/lm_covered_fill_check.py`**：patch `lm_covered_fill_check_1109b.patch`（對開發 `12afed84e`，只改這一支：清單加 `bb_support/corner`、`bb_support/ade`）。
  - 開發的光照貼圖（`ratio_before.txt`）：**FAILED 4**——只有新加的四張（轉角唱片 0.12 倍、阿德 0.07～0.08 倍）；原本 11 間照舊 PASS。跑 1960 秒。
  - 新的光照貼圖：跑中（`ratio_after.txt`）。
  - **要用分批版的 `lm_fill_covered.py`**（`625ba04c3`，結果和舊版一樣）：開發分支那一份是舊版，這兩間會用到十幾 GB 記憶體被系統砍掉。這一份還有 11-08 把 `scipy.ndimage.binary_dilation` 換成自己寫的十字擴張（結果一樣，CC／LAWWW 的環境不一定有 scipy）。
- **回歸**：工作樹＝開發 `12afed84e`＋這 4 張圖＋patch 過的測試＋分批版工具，提到這兩間、光照貼圖、淡出的 46 支（`tests.txt`，`lm_covered_fill_check.py` 另外跑）：**46／0 全過**。
