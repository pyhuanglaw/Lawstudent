# P3 查完：Cycles 烘焙「把 MASK 鏤空當實心」——不是 Cycles 的問題（LAWWW2-B 2026-11-09）

**結論**：Cycles 烘焙有照 MASK 的鏤空透光。11-08 的紀錄寫錯了，要更正（下面「對 11-08 XS9 好拍那一次的影響」16:5x 又更正一次）：
- `xs9_fix_1108/README.md` 第 1 節；
- `bake_xs.sh` 好拍那一段的註解；
- `HANDOFF.md` 的 P3 那一行。

真正的情況：

| 物件 | 情況 | 結果 |
|---|---|---|
| 好拍右牆洞洞板 `WALL_right_pegwall_alpha`（23.7 m²） | 貼圖上那一塊的 alpha **全是 255**，洞只畫在顏色上；而且面朝向反了（朝牆、單面） | 烘焙裡是實心板，擋住後面的牆；**遊戲裡被背面剔除、看不到**，玩家看到的就是被擋暗的牆 |
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

## 對 11-08 XS9 好拍那一次的影響（16:5x 第二次更正：上一版的推論錯了）
- 上一版（cac293a78）推論「BB-B 看到的深灰褐是洞洞板本身、11-08 重烘沒改到看得到的東西」：**錯**。
  - BB-B 16:40 重看 CC 11-08 PC GPU 截圖（cc-testing `logs/XS_FIX_1032/gpu/s5_xs_haopai_1400_door.jpg`、`_1400_corner_b.jpg`、2000 兩張；左 95566d0b5、右 ca47949cf）：重烘後的右手長牆是淺色混凝土，和後牆、左牆接近。看得到的牆確實被重烘改變了。
- **真正的原因：洞洞板在遊戲裡看不到。**
  - `WALL_right_pegwall_alpha` 每個三角形的法線（頂點順序）都朝 +x，朝牆、不朝店裡。材質 `hp_alpha` 是單面（`doubleSided` false）。
  - 從店裡看到的是它的背面，被背面剔除掉。
  - 來源：`haopai_interior.py` 第 401 行 `u.face(list(reversed(...)))`，順序反了。
- 所以：
  - **遊戲**：看到的是後面的牆 `WALL_right_wall_wall`（灰泥，有光照貼圖）。
  - **Cycles 烘焙**：兩面都擋光。看不到的洞洞板把看得到的牆遮成 0.02，所以變成深灰褐。
  - 11-08 HIDE 加 `alpha` 重烘，對玩家看到的畫面是**對的修法**：牆不再被看不到的板子遮暗。BB-B 維持 ART_APPROVED。
- BB-B 16:40 記的 P3「牆上一排排短短的暗色斜線，像浮在牆上的筆劃」：那是插在洞洞板上的掛勾 `WALL_right_hooks_*`。板子看不到，掛勾就浮在牆上。
- 同一個模型裡，單面、而且整片背對店裡的還有：
  - `WALL_left_hp_alpha`（左牆的卡片，9.61 m²，只有 6% 的面朝店裡）；
  - `WALL_left_tv_emit`（電視螢幕 0.72 m²，0%；可能本來就朝櫃台，要看畫面才知道）。
- 這一點 Cycles 沒做錯，是模型的面朝向問題。修不修、怎麼修，BB-B 判（另外問了）。

## 檔案
- `mask_min_bake.py`：最小場景。用法：`/opt/blenv/bin/python mask_min_bake.py -- <glb> <取樣數> <材質名>`。
- `mask_real_haopai_right.py`：好拍右牆，有板／藏板。用法：`/opt/blenv/bin/python mask_real_haopai_right.py -- assets/models/env/second_ai/bb_support/haopai.glb`。
- `tools/blender/env_second/lightbake/mask_alpha_audit.py`（新）：烘焙前檢查每個 MASK 物件在自己 UV 上真的透空多少。用法：`python3 mask_alpha_audit.py <glb>...`。
  - 「透空 0%」的 MASK 物件，烘焙時就是實心：要不要給它光照、要不要藏，照實心處理。
