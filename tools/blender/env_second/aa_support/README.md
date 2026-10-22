# aa_support：AA-B 支援 LAWWW2-B 的美術

> 使用者 2026-10-16：「原則你和BB仍然是劇情喔 除非你們真的沒事做才去接LAWWW2做不完的事情 要先溝通好」「你如果幫忙美術，做之前要問清楚規格要求方式，做完要給LAWWW2確認」。
> - 分工、規格：LAWWW2-B 的 `docs/art-rebuild/second_ai/SCENE_RULES.md` 第 8 節。
> - 所有權：仍是 LAWWW2-B 的。AA-B 只在自己的分支（`claude/cool-heisenberg-o8kuqx`）commit；LAWWW2-B 驗收、merge 以後，照原流程交 LAWWW-B。
> - 不改 `src/`、`zones3d`、`assets3d`。美術狀態最多到 `READY_FOR_REVIEW`（LAWWW2-B 確認前不算完成）。

## ART-WZ6 故事線的小物件：`wz6_items.py` → `assets/models/env/second_ai/aa_support/wz6_items.glb`

```
/opt/blenv/bin/python tools/blender/env_second/aa_support/wz6_items.py
/opt/blenv/bin/python tools/blender/env_second/aa_support/render_wz6.py -- assets/models/env/second_ai/aa_support/wz6_items.glb <輸出資料夾> wz6 <views.json>
```

- **需要** LAWWW2-B 分支的 `lib2.py`（`rbox_bm`，48aed1c9 以後）。AA-B 分支上的 `lib2.py` 是舊版，在那裡跑會失敗：請在 LAWWW2-B 的分支跑。
- **工具**：Blender 5.2.2（bpy）。網格用旋轉體（`lathe`）、倒角方塊（`lib2.rbox_bm`）、紙張網格。
- **材質**：一個材質 `wz6_items`。
  - 底色是 1024 貼圖集，用 PIL 畫在腳本裡，存到 `tools/blender/env_second/textures/gen/wz6_items_atlas.png`。
  - 粗糙度、金屬度是 256 的 `wz6_items_orm.png`；金屬度最多 0.45（茶罐 0.35、罐口 0.45）。
  - 畫的只有本來就是平面印刷、手寫的東西：海報、影印、卡片、標籤、刻度、店章。陶、紙、鐵都是純色加粗糙度，沒有用隨機斑點冒充材質。
  - 沒有用 Poly Haven 貼圖，`LICENSES.md` 不用加。字型是系統的 WenQuanYi Zen Hei（只畫進貼圖，沒有附字型檔）。

| 節點 | 物件 | 尺寸 | 三角形 | 做法 |
|---|---|---|---|---|
| `WZ6_egg_timer` | 半熟早午餐老闆娘的計時器（WZ-B6） | Ø6.4 cm、高 5.8 cm | 721 | 旋轉體：蛋黃色底座、溝槽、0～55 分刻度的轉盤、圓頂；頂上倒角的捏把；正面紅色指針 |
| `WZ6_notebook` | 阿德的膠裝空白筆記本（WZ-C8） | A5 闔著，厚 1.2 cm | 240 | 封底、書頁、封面分開，0.5 mm 圓邊；書背深色布膠帶包住、兩面各 8 mm；封底右下角店章「阿德影印輸出」 |
| `WZ6_tea_tin` | 蘇姨的一小罐茶（WZ-T6） | Ø6.4 cm、高 8 cm | 612 | 旋轉體：深綠鐵罐、凸出 0.2 mm 的和紙標籤（只有「茶」字和紅色小章）、蓋子的罐口鋼圈 |
| `WZ6_card` | 林太太的手寫卡片（AA_167 3-5） | 每面 10.5×7.5 cm，對折立著 | 20 | 兩面 0.4 mm 厚；正面手寫「小老闆：謝謝你那天陪我去。我們會一直來吃。林」＋色鉛筆荷包蛋 |
| `WZ6_whiteboard_print` | 讀書會白板的影印照片（AA_167 2-4、2-6） | A4 橫，貼牆 | 254 | 0.6 mm 厚、背面和四邊都有面；右下角翹起 1.2 cm；三塊紙膠帶。內容：「葉老師的房子 時間線」日治→戰後→登記→現在、鐵盒子的紙①～⑤、Alison 寫的「不公平！」被劃掉、以安的「→ 理由在這疊紙裡」；黑白影印的對比、邊緣的影印機陰影、碳粉小點。**不寫年份、法條、字號** |
| `WZ6_poster` | 子晴的吉他社成發海報（BB_148 WZ-C4：A2、藍色要亮） | A2，貼牆 | 144 | 0.6 mm 厚、紙面有一點弧度；四角藍色紙膠帶。像素風的吉他和星星（子晴做遊戲）；「吉他社／期末成發／5.27 WED 19:00／萬才館大廳｜免費入場」（照 `activities.js` 的 guitar_show_y1s2：2026-05-27 週三 19:00 萬才館大廳） |
| `WZ6_cat_bowl` | 茶屋緣側的貓碗（AA_167 4-3） | 飼料碗 Ø14 cm＋水碗 Ø8.7 cm | 1890 | 旋轉體陶碗：不上釉的圈足、外面白釉、碗口一圈手畫藍線（有一點不平）、裡面淺色釉；碗裡 14 粒圓角的飼料；水碗有水面 |

- **合計**：3,881 三角形；1 個材質；1 張 1024 底色＋1 張 256 粗糙度金屬度；GLB 約 216 KB；7 個網格（7 次 draw call，沒有 instancing）。
- **原點**：
  - 桌上、地上的四件：底面中心，y=0 是放的那個面，正面朝 +z。
  - 貼牆的兩件：底邊中央，z=0 是牆面，+z 是房間那一側；紙在 z≈0.0006，紙膠帶在 z≈0.0011。
  - 貓碗：兩個碗一起，飼料碗在 x≈−0.036、水碗在 x≈+0.080。
- GLB 裡的物件位置只是排開給人看（`SPREAD`），遊戲端用網格本身擺。放在 203 書桌、書架、牆上的位置由 LAWWW-B 決定。
- **渲染**（`render_wz6.py`）：設定照 `render_cycles.py`（Cycles CPU 48 spp、OIDN、Nishita 天空＋太陽），差別：
  - 地面在 y=0（小道具不會浮 1 公分）；
  - z=−0.30 有一面淺色牆；
  - 色彩轉換用 Standard、曝光 −3.5。AgX 會把蛋黃色、海報的藍洗白，`render_cycles.py` 的 `--view Standard` 也是這個理由。
  - 圖在 `docs/art-rebuild/second_ai/blender_renders/aa_support/`：總覽、正面、45°、三張近景（桌上、貓碗、牆上）。

### 還沒做、要注意的

- **沒有遊戲內截圖**：GLB 還沒接進 manifest（那是 LAWWW-B 的事），所以只有 Blender 渲染（D38 第 8 點：Blender 渲染≠遊戲驗收）。
- 沒有 `_lod1`：七件都很小，只在房間近處看到；LAWWW-B 要的話可以補。
- 卡片、白板、海報的字在遊戲的距離大概讀不清楚，但內容和劇情一致。
- 海報的社團名「吉他社」是一般名詞，沒有校名、真實社團的標誌。

## ART-WZ5 溫州街的貓：`wz_cat.py` → `assets/models/env/second_ai/aa_support/wz_cat.glb`

```
/opt/blenv/bin/python tools/blender/env_second/aa_support/wz_cat.py
/opt/blenv/bin/python tools/blender/env_second/aa_support/render_wz6.py -- assets/models/env/second_ai/aa_support/wz_cat.glb <輸出資料夾> cat <views.json> [--shape fat=1.0] [--swap cat_fur=cat_fur_old] [--hide _tag --hide _bandage]
```

- **規格**：照 `SCENE_RULES.md` 第 8 節，加上 LAWWW2-B 2026-10-16 07:39 的回覆。
  - 配件每個姿勢各一份；所有網格都有 `fat`；兩張烘焙貼圖、同一組 UV；烘進 AO。
- **造型**：每個部位一個實際尺寸的橢球，合起來做體素重建網格（0.55 cm），關節自然融合。
  - 部位：臀、身體、胸、頭、臉頰、口鼻、四腳、腳掌，尾巴每 0.45 倍半徑一顆球。
  - 接著用保持體積的拉普拉斯平滑（不然尾巴、腳會縮瘦），再減面。
  - 耳朵是有厚度的三角錐，眼睛、鼻子是半埋的扁橢球。
  - 不用方塊。
- **三個姿勢**（頂層節點，原點＝四腳中間的地面、頭朝 +z；GLB 裡的位置只是排開給人看）：
  - `CAT_sit`：坐著，尾巴繞到前腳前面。摸、餵的時候用。
  - `CAT_lie`：趴著縮成一團（麻糬）。睡覺、睡在背包上用。
  - `CAT_walk`：走路中的一步（左前腳、右後腳往前），尾巴翹起來。
- **配件**（掛在姿勢底下，遊戲照名稱結尾切換顯示）：
  - `CAT_<姿勢>_tag`：紅色皮項圈＋名牌「請不要再餵我，我很胖。——里長」。大三起顯示。
  - `CAT_<姿勢>_bandage`：左前腳的紗布繃帶。只有大三上第 9 週找到以後那一週。
- **fat**：每個網格都有同名的 morph target `fat`。
  - 大二上 1.0、大二下 0.5（`AA_164` 5-5）。
  - 最胖的地方（身體）往外 2 cm；頭、腳、尾巴只動一點；貼地的那一圈不動，胖了也不會陷進地板。
  - 項圈、名牌、繃帶也跟著撐開。
- **材質**：
  - `cat_fur`（年輕：橘虎斑、白肚子、白胸、白口鼻、白腳掌）；
  - `cat_fur_old`（大四：毛色淡、條紋淡、口鼻偏白）。
  - 兩張都是 512 的烘焙貼圖，`textures/gen/wz_cat_fur.png`、`wz_cat_fur_old.png`。
  - 花色是程序產生的：頂點存遮罩（白色區域、條紋強度、條紋座標），著色器算 sin 條紋，乘上 AO（距離 3.5 cm），用 Cycles 烘成貼圖。
  - 配件那一格（項圈、名牌的字、繃帶）用 PIL 畫在貼圖右下角，兩張相同。
  - **`cat_fur_old` 掛在一個很小的隱藏節點 `CAT_fur_old_holder`**（y=−1，遊戲端不要顯示它），只是讓材質留在 GLB 裡；遊戲換材質就是老貓。
- **效能**：每個姿勢身體 2,672＋項圈名牌 180＋繃帶 120＝2,972 三角形（3k 以內）；整個檔案三個姿勢 8,916＋隱藏節點 1＝8,917；GLB 0.54 MB；2 個材質；2 張 512 webp 貼圖。
- **渲染**：`docs/art-rebuild/second_ai/blender_renders/aa_support/` 的 `cat_*`。
  - `cat_all`：三姿勢並排；`cat_sit`、`cat_lie`、`cat_walk`：近景；
  - `cat_fat_all`：fat 1.0；`cat_old_all`：cat_fur_old；
  - `cat_acc_sit`、`cat_acc_walk`：大三的名牌、繃帶。
  - 設定同 WZ6（Standard、曝光 −3.5、40 spp）。
  - 鏡頭：`cat_views.json`（總覽＋三個近景）、`cat_views_acc.json`（配件近景，不加 `--hide`）；`cat_fat_all`、`cat_old_all` 用 `cat_views_all.json` 加 `--shape fat=1.0`／`--swap cat_fur=cat_fur_old`，總覽三張都加 `--hide _tag --hide _bandage`。

### 還沒做、要注意的

- **沒有遊戲內截圖**：GLB 還沒接進 manifest（LAWWW-B 的事），所以只有 Blender 渲染。
- 靜態網格，沒有骨架。照 SCENE_RULES：遊戲不播動畫，用擺姿勢加輕微呼吸（縮放由 LAWWW-B 做）。
- 眼睛是消光的深色，沒有反光點（和身體同一個材質，粗糙度 0.85）。要亮一點的話，可以把眼睛拆成第二個材質，多一次 draw call。
- 走路姿勢背上靠近脖子有一個很小的深色點（烘焙時眼睛的遮罩滲到身體的 UV 島），近看才看得到。要修的話把 `uv_tile` 的 island_margin 加大。
- 貼圖每次烘焙的 AO 雜訊會有一點點不同（16 spp）。`textures/gen/wz_cat_fur*.png` 是從交件的 GLB 取出來的那兩張，和 GLB、渲染圖一致；重跑腳本會得到幾乎一樣、但不是逐像素相同的貼圖。

---

## LAWWW2-B 驗收紀錄

### ART-WZ6（2026-10-16 08:2x UTC）：通過 → 交 LAWWW-B（8d8fe7d4）

- 七件的尺寸、內容、劇情一致性都照規格；字沒有校名、年份、法條、字號；海報日期和 `activities.js` 一致。
- **我改了一處**：`to_blender()` 合併重疊頂點（`bmesh.ops.remove_doubles`，1e-6 m）。
  - 原本 `PM.vid` 讓每個面各自一組頂點，`smooth_mesh` 沒有作用，碗、罐子、計時器看得出一格一格的面。
  - 三角形數不變（3,881），GLB 197 KB。`wz6_close_bowl.webp`、`wz6_close_desk.webp` 換成修正後的渲染。
- 飼料顆粒是 7 邊的小旋轉體，近看有稜角（只有貓碗近景看得到，可以接受）。

### ART-WZ5 貓（2026-10-16 08:3x UTC）：v1 通過、先交 LAWWW-B；v2 小修排在 V0-ART-DORM 之後

- 通過的理由：
  - 不是方塊拼的，橘虎斑＋白肚子的花色清楚；
  - 三個姿勢、`fat` morph、老貓材質、配件都照規格；
  - 每個姿勢 2,972 三角形。
  - 遊戲裡貓大約 0.3 m 高、離鏡頭 4～8 m，v1 的問題在那個距離不明顯。
- v2 要修（AA-B 做完 V0-ART-DORM 再做）：
  1. `CAT_walk` 的四條腿太細（像筷子，跟胖身體不搭），粗 25～30%；尾巴粗一點、往尾端漸細，不要一節一節的鋸齒。
  2. `CAT_lie` 的兩隻前腳掌看起來和身體分開（白色的兩顆在前面），讓它從胸口下面伸出來。
  3. 眼睛：在烘焙貼圖上畫一個小白點當反光（不用第二個材質）。
  4. 走路姿勢脖子後面的小深色點（README 寫的 UV island margin）。
