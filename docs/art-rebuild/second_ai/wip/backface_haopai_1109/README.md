# BACKFACE-HAOPAI-1109：好拍右牆洞洞板翻正、給光照（BB-B 選 (b)）

LAWWW2-B 2026-11-09。狀態：`READY_FOR_REVIEW`（模型、光照已換；遊戲內畫面等 CC-B 用 PC GPU 拍、BB-B 判 D120）。

## 為什麼

- 原因查到的過程：`docs/art-rebuild/second_ai/wip/mask_bake_rootcause_1109/README.md`；全部 16 個 GLB 的離線掃描：`docs/art-rebuild/second_ai/wip/backface_scan_1109/`（只有好拍有問題，兩處）。
- 好拍進門右手那面的洞洞板 `WALL_right_pegwall_alpha`（23.7 m²）面朝向反了（法線 +x 朝牆、單面）：遊戲裡被背面剔除，**玩家一直看不到這塊板子**，看到的是後面的灰泥牆；掛勾、球拍像是浮在空中。
- 左牆的鐵網格 `WALL_left_hp_alpha` 有 118 個三角形也反了（朝牆）。電視是對的（朝門口）。
- BB-B 16:45 選 (b)：把洞洞板翻正、讓它看得到、有自己的光照；亮度目標是「跟現在的淺牆差不多、不要回到 11-08 之前那種深灰褐」。

## 做了什麼（照順序；都不用 Blender，只有第 3 步烘焙用）

輸入是還沒烘過的原檔（haopai_interior.py 匯出的那一份，sha256 `d3fd4b7a…`），**不是**已經烘過的遊戲檔。

1. 翻面＋洞洞板自己一份不透明材質：
   ```
   python3 tools/blender/env_second/lightbake/glb_flip_faces.py haopai_orig.glb haopai_flip.glb \
     --node '^WALL_right_pegwall_alpha$' --normal x+ --node '^WALL_left_hp_alpha$' --normal x- \
     --opaque-copy '^WALL_right_pegwall_alpha$=hp_peg'
   ```
   → 洞洞板翻 224／224 個三角形，左牆鐵網格翻 118／598 個三角形；洞洞板改用 `hp_peg`（OPAQUE，從 `hp_alpha` 複製）。
   洞洞板在貼圖上那一塊 alpha 本來就全是 255（洞是畫上去的暗色），所以換成不透明，畫面上沒有差別；好處是遠處的 mipmap 不會混到旁邊鐵網格那一塊的透空。
2. 洞洞板拆出自己的貼圖、板面調亮（烤漆 #8c7f68 的反照率只有旁邊灰泥牆的 1/2.7）：
   ```
   python3 tools/blender/env_second/lightbake/glb_split_tile.py haopai_flip.glb haopai_b.glb \
     --node '^WALL_right_pegwall_alpha$' --tile 0,0.5,0.25,1 --gain 2.5 --name haopai_peg
   ```
   → 新圖 `haopai_peg` 512×512；板面線性亮度 0.222 → 0.554；暗色的洞（15% 像素）不動。
3. 烘焙（`bake_xs.sh` 好拍那一段：洞洞板不再藏起來，自己也烘；球拍卡、鐵網格也不藏，Cycles 照 MASK 透光）：
   ```
   OUTDIR=<out> IN=haopai_b.glb BAKE_CACHE=<cache> bash tools/blender/env_second/lightbake/bake_xs.sh haopai 512
   ```
   → 1019 秒（CPU），skytint [1.32, 1.0, 0.72]；烘 8 個物件（多了 `WALL_right_pegwall_alpha`）。
4. 看了烘好的亮度，板面倍數改 ×3.0。**光照貼圖和板子本身的顏色無關**，所以不重烘，只換那一張圖：
   ```
   python3 tools/blender/env_second/lightbake/glb_split_tile.py haopai_flip.glb haopai_g30.glb \
     --node '^WALL_right_pegwall_alpha$' --tile 0,0.5,0.25,1 --gain 3.0 --name haopai_peg
   python3 tools/blender/env_second/lightbake/glb_replace_image.py <out>/haopai.glb haopai.glb --name haopai_peg --from-glb haopai_g30.glb
   ```
   → 板面線性亮度 0.222 → 0.665。和烘完的檔比：493 個 accessor 全部一樣，只有 `haopai_peg` 那一張圖不同。
   （差別只在洞洞板自己反彈到別處的那一點點光；重做時直接用 ×3.0 烘也可以。）

以上四步重做一次，結果和交出去的檔逐位元組相同（`cmp` 過）。

## 數字

| | 改前（開發分支） | 改後 |
|---|---|---|
| 玩家看到的右牆前段 z 0～6（光照貼圖編碼值，白天／晚上） | 灰泥牆 0.483／0.463 | 洞洞板 0.451／0.438（`xs9` 檢查用的範圍；整面 0.437／0.419，球拍的影子烘進去了） |
| 板面反照率（線性亮度，含洞） | 灰泥牆 0.53 | 0.571（×3.0；只算板面 0.665） |
| 看起來的亮度（反照率 × 光照，線性） | 1 | 約 0.89（比現在的淺牆暗約 5%～11%，不是 11-08 之前那種深灰褐） |
| 整張光照貼圖平均（白天／晚上） | 0.191／0.179 | 0.190／0.177 |
| 圖片 | 10 張 | 11 張（多 `haopai_peg` 512×512 WebP，39,668 B） |
| GLB | 3,252,952 B（開發分支） | 3,296,852 B（+43,900 B） |

模型（和開發分支比，97 個網格節點一樣多）：
- 改的網格：`WALL_right_pegwall_alpha`（翻面、hp_peg、自己的 UV、新的 TEXCOORD_1）、`WALL_left_hp_alpha`（翻 118 個三角形：索引、法線）。
- 重烘的 7 個物件：TEXCOORD_1 換了；`WALL_right_wall_wall`、`hp_floor_floor`、`WALL_front_front_wall` 的頂點順序也不同（Blender 讀進來再匯出），**三角形數、面積、外框、各方向的面積完全一樣**。
- 其他網格、其他 10 張圖都沒動。

## 交付的檔案（sha256 前 16 碼：開發分支 → 新）

| 檔案 | 開發 `abfa888cf` | 新 |
|---|---|---|
| `assets/models/env/second_ai/bb_support/haopai.glb` | `8088e4928a422b11` | `5676e2200d6273f9` |
| `assets/models/env/second_ai/bb_support/haopai_lm_day.webp` | `a80833e645179861` | `cbe256f9f0c94b9b` |
| `assets/models/env/second_ai/bb_support/haopai_lm_night.webp` | `9f737ebe49eed78a` | `9ebe785ddd09c326` |
| `tools/blender/env_second/lightbake/haopai_lm.json` | `d628e73f666c0e25` | `86d72bb219e42932` |
| `tests/xs9_haopai_shanlan_check.py`（`xs9_haopai_check_1109.patch`） | `531aba4aced32060` | `d061c339723253f8` |

工具（只在 LAWWW2 這邊，遊戲不讀）：`glb_flip_faces.py`、`glb_split_tile.py`、`glb_replace_image.py`（新）、`backface_scan.py`；`bake_xs.sh`、`haopai_interior.py` 的註解改成 ×3.0 和這份說明的位置。

**不用改遊戲程式**：好拍的 GLB 照舊用 `attachRoomGLB` 接，光照貼圖照 `_lm.json` 對應。

## 測試

- `tests/xs9_haopai_shanlan_check.py`（patch 改的：第 1 項改量洞洞板；新增 1b：洞洞板每一個三角形朝店裡、材質 `hp_peg` OPAQUE；沒有 TEXCOORD_1 的 primitive 跳過、量不到算 0）：
  - 開發分支的資產：`FAIL 1 … 白天 0.000 晚上 0.000`、`FAIL 1b … 材質 [('hp_alpha', 'MASK')]` → **FAILED 2**
  - 新資產：`PASS 1 好拍右牆前段（洞洞板）白天 0.451 晚上 0.438 ≥ 0.35`、`PASS 1b 洞洞板 224 個三角形都朝店裡（法線 x 最大 -1.00）、材質 [('hp_peg', 'OPAQUE')]` → **ALL PASS**
- 新資產放進開發分支 `88c83d1be`（和 `abfa888cf` 這幾個檔一樣）的 worktree，跑提到好拍／新生南路店家的 13 支（`*_unit.js`、`*check*.py`）：**13 支全部通過**。
- **沒測**：遊戲內畫面（雲端沒有瀏覽器，D131）。請 CC-B 用 XS_FIX_1032 同一組角度（1400／2000 的 door、corner_b，PC GPU）重拍，BB-B 判 D120。

## 還沒做到／要注意

- 看起來比現在的淺牆暗約 5%～11%（反照率 × 光照換算；實際以 PC GPU 截圖為準）。BB-B 覺得太暗：只要把第 4 步的 `--gain` 調高再換一次圖（不用重烘，幾秒鐘）。上限：板面線性亮度到 1 就截掉，×3.0 時已經有一些像素接近 1。
- 洞洞板翻正以後，看得到掛勾、球拍是掛在板子上（以前像浮在空中），但這也表示玩家第一次看到這塊板子的貼圖本身：BB-B 判的是新的東西，不只是亮度。
- 左牆鐵網格翻了 118 個三角形，那一面也是第一次看得到（以前背面剔除）。
