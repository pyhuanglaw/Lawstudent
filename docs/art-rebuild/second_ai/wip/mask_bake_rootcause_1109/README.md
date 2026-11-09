# P3 查完：Cycles 烘焙「把 MASK 鏤空當實心」——不是 Cycles 的問題（LAWWW2-B 2026-11-09）

**結論**：Cycles 烘焙有照 MASK 的鏤空透光。11-08 的紀錄寫錯了，要更正：
- `xs9_fix_1108/README.md` 第 1 節；
- `bake_xs.sh` 好拍那一段的註解；
- `HANDOFF.md` 的 P3 那一行。

真正的情況：

| 物件 | 情況 | 結果 |
|---|---|---|
| 好拍右牆洞洞板 `WALL_right_pegwall_alpha`（23.7 m²） | 貼圖上那一塊的 alpha **全是 255**，洞只畫在顏色上 | 遊戲裡、烘焙裡都是一片實心板，後面的牆被擋住是對的 |
| 葉片卡、球拍卡、新生運動 `L0_xs_alpha` | 貼圖真的有透空，烘焙照比例透光 | 影子看起來是「卡片形」：光照貼圖一格幾公分＋面光源軟影，葉子的細節糊成整片卡的輪廓。不是透光錯 |

- 洞洞板的貼圖寫在 `tools/blender/env_second/bb_support/haopai_tex.py` 第 86 行：「洞（不透空：後面是牆，畫成暗的）」。
- 這一包只有紀錄和一支檢查工具，**不用整合任何遊戲檔案**。

## 證據
1. **最小場景**（`mask_min_bake.py`）：Blender 5.2.2 Cycles，DIFFUSE、DIRECT。
   - 場景：一面 1 m² 的牆，前面 9 mm 一片卡，UV 用整張貼圖，材質是從 GLB 匯入的原材質。
   - 量法：牆的光照「有卡／沒有卡」的比值，和貼圖整張的透空比例比。

   | 材質（GLB） | 貼圖透空比例 | Cycles 透光比 | 換成不透明 |
   |---|---|---|---|
   | `hp_alpha`（好拍） | 0.646 | **0.646** | 0.0 |
   | `xs_alpha`（新生運動） | 0.857 | **0.859** | 0.0 |
   | `dabu_leaf_pothos`（大步） | 0.424 | **0.402** | 0.0 |
   | `shl_leaf_pothos`（山嵐） | 0.424 | **0.402** | 0.0 |

   - 葉片差 2%：葉子邊緣的雙線性取樣剛好跨過 0.5 的門檻。
   - 匯入器的接法沒問題：`Alpha ← 1 − (貼圖 alpha < 0.5)`。
2. **每個 MASK 物件在自己的 UV 上取樣 alpha**（新工具 `tools/blender/env_second/lightbake/mask_alpha_audit.py`，不需要 Blender，直接讀 GLB 的貼圖）：

   | GLB | 物件 | 面積 | 真的透空 |
   |---|---|---|---|
   | haopai | `WALL_right_pegwall_alpha` | 23.69 m² | **0%** |
   | haopai | `WALL_left_hp_alpha` | 9.61 m² | 59% |
   | haopai | 球拍卡 `*_ten*_alpha`、`hp_badf0_0_alpha` | 各 0.06～0.11 m² | 66～88% |
   | dabu | `dabu_leaf` | 39.53 m² | 28% |
   | tongxian | `tx_leaf` | 1.19 m² | 5% |
   | xinsheng_sports | `L0_xs_alpha` | 27.60 m² | 70% |
   | shanlan | `shl_pothos`／`L2_shl_pothos` | 16.43／5.73 m² | 36%／39% |

   - 洞洞板的 UV 落在貼圖 u 0～0.25、v 0.5～1（從上算）那一塊。那一塊 262,144 個像素的 alpha 全是 255，顏色平均 (127, 115, 95)，灰褐色。
3. **好拍真實幾何**（`mask_real_haopai_right.py`）：只烘右牆，一盞面光源從店中間照過去。
   - 洞洞板後面那一塊：有板 0.0000、藏板 1.3348。
   - 和 11-08 實際烘焙的 0.02 一致。原因就是板子實心，不是透光算錯。

## 對 11-08 XS9 好拍那一次的影響
- BB-B 判 FAIL 的「進門右手那一整面長牆，從淺灰變成很深的灰褐色」：
  - 洞洞板在遊戲裡是實心的，後面那面牆的光照貼圖**看不到**。
  - 所以那一片深灰褐色最可能就是**洞洞板本身**：灰褐烤漆 `#8c7f68`、畫上去的暗色洞 `#2e2924`。它不在烘焙名單裡（`NOLM`），只吃即時光。
  - 「從淺灰變成」對得上 v2b 把右牆從白牆＋網格換成洞洞板（`haopai_interior.py` 第 393 行）。
- 11-08 的重烘（HIDE 加 `alpha`）把**板子後面看不到的牆**從 0.02 拉到 0.45～0.51，整張平均白天 0.158 → 0.194（少了板子擋住，間接光多一點）。
  - **洞洞板本身的樣子沒有變**。
  - 那一次交件說「修好了 FAIL」，根據不足。
- **要確認的**（不由我判，給 BB-B）：CC 在好拍 1400／2000 的 door、corner_b 重拍以後，右牆還是很暗嗎？
  - 還是暗，可以選：
    - 洞洞板也烘光照：它是實心的，可以像牆一樣給第二套 UV、從 `NOLM` 拿掉、重烘；
    - 把烤漆顏色調亮：BB 的模型，BB 決定。
  - 已經 OK：不用動，11-08 的重烘留著也沒壞處。
- 其他店的葉片卡（大步、山嵐、同弦、新生運動）：BB-B 已 ART_APPROVED，不動。以後真的要葉子的細影子，只能提高光照貼圖解析度或讓葉片不投影（`--hide`），沒有 Cycles 的 bug 要修。

## 檔案
- `mask_min_bake.py`：最小場景。用法：`/opt/blenv/bin/python mask_min_bake.py -- <glb> <取樣數> <材質名>`。
- `mask_real_haopai_right.py`：好拍右牆，有板／藏板。用法：`/opt/blenv/bin/python mask_real_haopai_right.py -- assets/models/env/second_ai/bb_support/haopai.glb`。
- `tools/blender/env_second/lightbake/mask_alpha_audit.py`（新）：烘焙前檢查每個 MASK 物件在自己 UV 上真的透空多少。用法：`python3 mask_alpha_audit.py <glb>...`。
  - 「透空 0%」的 MASK 物件，烘焙時就是實心：要不要給它光照、要不要藏，照實心處理。
