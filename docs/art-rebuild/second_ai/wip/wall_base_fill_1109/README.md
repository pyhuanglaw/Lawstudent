# #204 外牆腳黑線：四間補光照貼圖（LAWWW2-B 2026-11-09；LAWWW-B 19:42 選盤點的 1～4）

狀態：`READY_FOR_REVIEW`（只改光照貼圖，GLB、程式都不動；遊戲內等 CC 拍、BB-B 判）。
盤點：`docs/art-rebuild/second_ai/wip/wall_base_survey_1109/README.md`。

## 做了什麼
- 用 `tools/blender/env_second/lightbake/lm_fill_covered.py`（11-08 做的）補四間、五個模型的光照貼圖：
  - 宿舍四人房 `dorm_room4`（白天、晚上、熄燈）
  - 205 `dorm_205`（白天、晚上）
  - 萬才館一樓 `wancai_interior`（白天、晚上）
  - 大口漢堡一樓 `dakou_1f`（白天、晚上）
  - 溫州街茶屋 `wz_teahouse_interior`（白天、晚上）
- 補哪些格子：被另一個 WALL_ 網格貼著（2 cm 內）蓋住、牆淡出時會露出來的格子。從同一個網格沒被蓋住的鄰格一圈一圈往裡補；整塊被蓋住的面用那個網格的中位數。
- 這些格子在牆還在的時候看不到（被蓋住），所以平常的畫面不變。只有牆淡出時，露出來的不再是黑的。

## 工具改分批（11-09 20:1x；LAWWW-B 19:42「做完 1～4 再把 lm_fill_covered 改分批」）
- 盤點時 12 間跑到記憶體不夠被砍：判斷「被蓋住」時一次算 格子數 × 三角形數 × 3 的陣列，大的房間十幾 GB。
- 改成 `hit_min_count()`：一批最多約 200 萬組（格子 × 三角形），只留每格的最近距離和碰到幾個三角形。**算出來的結果和舊的完全一樣**：
  - SUNNY SIDE、大口一樓 `--dry` 的輸出逐字相同。
  - 山嵐（原本 11.8 GB 被砍）：跑完，124 秒，最高 381 MB；被蓋住、會露出來的 2695 格（0.39%）。
- 上面四間的光照貼圖是改之前補的；因為結果一樣，不用重做。

## 亮度比（被蓋住、會露出來的格子平均 ÷ 旁邊 3 格；≥ 0.85 倍算過，同 11-08 的標準）
| 貼圖 | 格子數 | 改前 | 改後 |
|---|---|---|---|
| 宿舍四人房 白天／晚上／熄燈 | 16,960 | 0.38／0.37／0.32 | 1.37／1.37／1.07 |
| 205 白天／晚上 | 17,387 | 0.35／0.32 | 1.32／1.28 |
| 萬才館一樓 白天／晚上 | 3,814 | 0.15／0.14 | 0.95／0.97 |
| 大口漢堡一樓 白天／晚上 | 7,748 | 0.10／0.11 | 0.95／1.18 |
| 溫州街茶屋 白天／晚上 | 8,944 | 0.21／0.20 | 1.01／1.05 |

- 宿舍兩間大於 1 倍：被蓋住的大多是「整片貼著牆的面」，例如床架、白框靠牆那一面。這些面用了網格的中位數。旁邊 3 格是牆腳的接觸陰影，本來就偏暗，所以比起來亮一點。
  露出來的時候，那一面看起來和同一個床架其他的面一樣亮。
- 熄燈那一張本來就近乎全黑（平均 3／255）。

## 別的地方有沒有被動到（WebP 有損，重新編碼）
- 被補的格子和留邊以外，平均差 0.5～1.2／255，看不出來。
- 差超過 8／255 的格子只有 0.3～3.7%，就是補的格子和留邊。

## 測試
- **`tests/lm_covered_fill_check.py`**：patch `lm_covered_fill_check_1109.patch`，對開發 `0e7491b75`，只改這一支。原本的六間後面加這五個模型。
  - 開發的光照貼圖：**FAILED 10**（這五個的白天、晚上都 FAIL；熄燈那張差 ≤ 3／255 算過；原本六間照舊 PASS）。
  - 新的光照貼圖：**ALL PASS**。
- 改前、改後的原始輸出：`ratio_before.txt`、`ratio_after.txt`。
- Node 測試：見下面「回歸」。

## 交付的檔案（sha256 前 16 碼：開發 `0e7491b75` → 新）
| 檔案 | 開發 | 新 |
|---|---|---|
| `assets/models/env/second_ai/bb_support/dakou_1f_lm_day.webp` | `cdbbc1b73f0d1af9` | `e08b7dbf8cd66125` |
| `assets/models/env/second_ai/bb_support/dakou_1f_lm_night.webp` | `50e3ad0f2e4fbf64` | `87b1b7176e1f16d9` |
| `assets/models/env/second_ai/dorm_205_lm_day.webp` | `8fdb790169b688f2` | `56ae0238f9a5a059` |
| `assets/models/env/second_ai/dorm_205_lm_night.webp` | `fc4308c4867d50c5` | `27a13276c94399b9` |
| `assets/models/env/second_ai/dorm_room4_lm_dark.webp` | `0c7e5f67f97b444d` | `64b22bf8a0f37c15` |
| `assets/models/env/second_ai/dorm_room4_lm_day.webp` | `250d050f39077d63` | `abe3a6989d9bc08e` |
| `assets/models/env/second_ai/dorm_room4_lm_night.webp` | `379918369096c4c4` | `2d121e1e9bc7e559` |
| `assets/models/env/wancai_interior_lm_day.webp` | `0d838f00f5cd281b` | `3d18a1727d74a171` |
| `assets/models/env/wancai_interior_lm_night.webp` | `5689720ff94922d4` | `f5faecd761f592ce` |
| `assets/models/env/second_ai/wz_teahouse_interior_lm_day.webp` | `2baa4cc3fd7546e4` | `6fc22aac40dc0d98` |
| `assets/models/env/second_ai/wz_teahouse_interior_lm_night.webp` | `d1eba950628e1c04` | `5cc0c5a0497b7845` |
| `tests/lm_covered_fill_check.py`（patch） | `8aff7fb384e05746` | `0bc93b9e70ec1641` |

- patch `lm_covered_fill_check_1109.patch` sha256 `5b6dc03f3a6337ac…`
- **不用改程式**。GLB 不動。

## 還沒驗
- 遊戲內（請 CC 拍、BB-B 判）：四間各找最明顯的那一塊，鏡頭在牆外、讓那面牆淡出：
  - 宿舍：左牆外看床架；浴室牆外看白框。
  - 萬才館一樓：西牆外看深色木頭。
  - 大口漢堡一樓：右牆外看牆上的橫帶後面。
  - 茶屋：右牆外看木柱。
- 2～30 cm 的接觸陰影（牆腳、牆角那一圈淡淡的影子）照舊：那是真的陰影，不補。
