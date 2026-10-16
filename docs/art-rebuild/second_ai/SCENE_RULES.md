# LAWWW2 的場景製作規則（給支援的 AI：AA-B 等）

LAWWW2-B，2026-10-16。使用者 06:4x 對 AA-B 說：「如果你跟BB手上都沒工作了　就去支援LAWWW2美術　要跟他要他生成場景的規則　照他原本的3D規則」。

這份是我實際在用的做法。上位規則照舊有效：
- `CLAUDE.md` 的美術規則（D38）；
- `docs/SECOND_AI_HANDOFF.md` 第 5～9 節；
- `WORK_RULES.md`：店名用諧音、不停工。

---

## 1. 工具與檔案

| 項目 | 做法 |
|---|---|
| Blender | `/opt/blenv/bin/python 腳本.py [-- --out 路徑]`。Blender 5.2，無介面 `bpy` |
| 共用函式庫 | `tools/blender/env_second/lib2.py`（`L`）、`cafe_layout.py`（`CL`）。腳本開頭照抄任何一支，例如 `wz_park.py` 的 import 區塊 |
| 腳本位置（支援者） | `tools/blender/env_second/aa_support/<名稱>.py` |
| 輸出位置（支援者） | `assets/models/env/second_ai/aa_support/<名稱>.glb`（`.json` 統計 `L.export` 會自動寫） |
| Poly Haven 貼圖（CC0） | `L.pbr(名稱, '<polyhaven id>', ...)` 會到 `tools/blender/env_second/textures/<id>/` 找；沒有的話用 `lib2.fetch(id)` 下載（dl.polyhaven.org 連得到）。新用到的貼圖要在 `LICENSES.md` 加一行 |
| 自己畫的貼圖 | 用系統 python3（PIL、numpy）產生到 `tools/blender/env_second/textures/gen/`。產生貼圖的腳本也要 commit（例：`shopkit_tex.py`） |

## 2. 座標與比例

- **遊戲座標**：x 往東、y 往上、z 往南。單位是公尺。
  - Blender 用 `g2b(x, y, z)` 換：Blender 的 (x, −z, y)。
  - `Mesh.box(x0, x1, y0, y1, z0, z1)`、`cyl(a, b, r)`、`sphere`、`quad` 都直接吃遊戲座標。
- **道具**：原點放在**底部中央**、正面朝 **+z**。遊戲端用 yaw 轉：正面朝 (sin yaw, cos yaw)。
- **常用尺寸**：
  - 祐廷身高 1.75 m；門高 2.1 m；
  - 座面 0.45 m；桌面 0.75 m；吧檯 1.05 m；
  - 樓高：一樓 3.4 m、其他 3.1 m（街屋）。

## 3. 材質

| 種類 | 寫法 | 注意 |
|---|---|---|
| PBR 貼圖 | `L.pbr('名稱', 'polyhaven id', tile=每張幾公尺, target='#sRGB 色碼', normal=0.5, maps=('diff','nor'), res=256, rough_value=0.7)` | `target` 會把貼圖校正到那個平均色 |
| 純色 | `L.flat('名稱', '#色碼', rough=, metal=, emit=B.srgb('#色碼'))` | **metal 最多 0.45**：遊戲沒有環境貼圖，金屬度高會變黑 |
| 小零件 | `L.CMesh('名稱', 頂點色材質)` 的 `cbox(..., '#色碼')`；或最後 `L.vc_consolidate(root, {材質名: L.vc_material(...)})` | 很多種顏色合成一個材質，一次 draw call |
| 透明（葉子、紙張） | 影像的 Alpha 經過 Math **ROUND** 再接 BSDF Alpha（範例：`cafe_layout.leaf_mat`） | 匯出成 alphaMode MASK，不要用半透明混合 |
| 晚上發光 | `emit=B.srgb(...)`；要光暈的地方放 `CL.glow(root, '種類', x, y, z, color=..., size=..., day=0, night=1)` | 遊戲會在那裡生光暈 |

- 貼圖解析度：`B.reset(texres=512)`。近景主角級的物件才用到 1024。
- 名稱前綴：每個物件、材質加自己的前綴（例：`wz6_`、`cat_`），不要和別的 GLB 撞名（遊戲有時候依材質名稱做夜間設定）。

## 4. 特殊節點名稱（遊戲端看名字處理）

| 名稱開頭 | 用途 |
|---|---|
| `PLATE_FACE_*`、`SIGN_FACE_*`、`VSIGN_FACE_*` | 招牌、門牌的字，遊戲用 canvas 畫；自訂屬性放 sign、bg、color |
| `INTERIOR_FACE_*` | 店面玻璃後的室內景深卡 |
| `GLOW_*` | 夜間光暈的位置（空節點） |
| `SEASON_<名稱>_on` 和 `_off` | 依季節切換顯示，例如楓香的紅葉 |

## 5. 效能預算（手機）

- 小道具：每件 0.5～5k 三角形；整間室內：60k 以內；整條街：約 35k，原型會重複使用。
- 重複的東西用 `B.instance(共用網格, ...)`，匯出時 `L.export(OUT, gpu_instances=True)` 會變成 GPU instancing。
- 最後 `L.merge_by_material(root, keep=...)`：同材質合成一個網格，招牌臉、季節節點要用 `keep` 留下來。
- 不要用方塊拼成近景的主要物件（D38 第 1 點）。用 `L.lathe`（旋轉體）、`cyl`、`bmesh`，做出倒角和比例正確的造型。

## 6. 驗收截圖

1. **Blender 渲染**：Cycles 32～64 spp、AgX、OIDN 降噪，正面、斜 45°、近景三張。範例：`street_trees.py --preview`。
2. **遊戲內截圖**：GLB 要接進 manifest 之後才拍得到。工具是 `tools/blender/env_second/shots/fast_shots.py`。
   - JSON 欄位：`out`、`w`、`h`、`dpr`、`mobile`、`hidePlayer`、`hideNPCs`、`state{zone, hour, pos{x,z,yaw}}`、`cam{pos,look}` 或 `{yaw,pitch,dist}`、`js`。
   - 範例：`shots/polish0_before.json`。
   - 先開本機伺服器：`python3 -m http.server 8852`，在放了新 GLB 的 worktree 開；網址用 `http://127.0.0.1:8852/index.html?turbo`。
   - 時段：白天 11:00、傍晚 17:30、晚上 20:30。手機直向 390×844（dpr 2）、橫向 844×390。
   - 雲端沙盒是軟體繪圖，每張要一兩分鐘。放背景跑，不要等。
3. **修改前後**：同一個鏡頭、時段、光線，並排比較。

## 7. 交付

1. 在自己的分支 commit：腳本、GLB、`.json`、Blender 渲染圖、README（做了什麼、規格、還沒做的）。
2. 用 send_message 傳給 LAWWW2-B：SHA、路徑、三角形數、材質數、截圖位置。
3. LAWWW2-B 驗收、merge 進 LAWWW2-B 分支，照原流程交給 LAWWW-B 接進遊戲。
   - 支援者不改 `src/`、`zones3d`、`assets3d`。
   - 美術狀態最多標到 READY_FOR_REVIEW。

---

## 8. 給 AA-B 的分工（2026-10-16 06:5x）

### ART-WZ6 故事線的小物件（AA_166、AA_167）

- **輸出**：一個 GLB `assets/models/env/second_ai/aa_support/wz6_items.glb`，每一件一個頂層節點。
- **原點**：底部中央，正面朝 +z。
- **用途**：放在宿舍房間 203 的書桌和書架；擺放位置由 LAWWW-B 決定。
- **清單**：

| 節點名稱 | 物件 | 尺寸、造型 |
|---|---|---|
| `WZ6_egg_timer` | 蛋的計時器 | 半熟早午餐的老闆娘送的；廚房機械式，約 6 cm，旋鈕上有刻度 |
| `WZ6_notebook` | 膠裝的空白筆記本 | 影印店老闆阿德送的；A5、書背膠裝、封面素色，書背要「對齊」 |
| `WZ6_tea_tin` | 一小罐茶 | 茶屋蘇姨送的；約 8 cm 高，鐵罐或紙罐，標籤只有一個「茶」字 |
| `WZ6_card` | 手寫的卡片 | 對折，立著；字用貼圖，內容請 AA-B 定 |
| `WZ6_whiteboard_print` | 讀書會白板的影印照片 | A4 紙，黑白影印的白板；用貼圖 |
| `WZ6_poster` | 成發的海報 | A2，捲起來或貼著；設計照 WZ-C4 |
| `WZ6_cat_bowl` | 貓碗 | 茶屋緣側；陶碗約 14 cm，旁邊一個小水碗 |

- 每件 2k 三角形以內，材質合併。

### ART-WZ5 溫州街的貓（AA_164 5-5；AA-B 06:33：橘白色、很胖）

- **輸出**：`assets/models/env/second_ai/aa_support/wz_cat.glb`。
- **體長**：身體約 46 cm（不含尾巴）。
- **姿勢**：靜態網格，遊戲不播動畫，用擺姿勢加輕微呼吸；呼吸由 LAWWW-B 做縮放。
  - `CAT_sit`：坐著，尾巴繞前腳；
  - `CAT_lie`：趴睡，像麻糬一團；
  - `CAT_walk`：走路中的一步。
- **體型**：每個姿勢都要有 `fat`（大二上，胖了）的 morph target。
  - 大二下「瘦了一點」用 morph 0.5。
  - 老（大四）：另一個材質 `cat_fur_old`（毛色淡、口鼻偏白）。
- **配件**（獨立節點，遊戲切換顯示）：
  - `CAT_tag`：大三的名牌；字「請不要再餵我，我很胖。——里長」用貼圖。
  - `CAT_bandage`：大三上有一週，前腳纏繃帶。
- **毛色**：橘虎斑＋白色的肚子、口鼻、腳掌。用自己畫的貼圖，或頂點色加條紋。
- **效能**：3k 三角形以內。

### 之後

三家店的 3D 室內（ART-WZ3），我先做阿德影印輸出、半熟。AA-B 做完 WZ6、WZ5 還有空的話，再談一盞茶屋。
