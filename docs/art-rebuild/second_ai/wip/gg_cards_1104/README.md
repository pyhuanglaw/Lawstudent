# GG-CARDS-1104：公館店面的窗卡改用室內 GLB 渲染（LAWWW2，2026-11-04）

狀態：`MODEL_READY`。要 BB 看過圖、PC 遊戲截圖確認後才算數。

## 改了什麼
公館 8 間有室內的店，13 張窗卡（從人行道透過玻璃看到的店內景深卡）原本是從使用者的**外觀參考圖**裁下來的。
問題：裁下來的圖帶著參考圖的窗框、玻璃反光、店外的立牌；走進店裡看到的又是 AA／BB／CC 做的 3D 室內，兩邊不一樣。
這一版照日常失速的做法，從街上看進每一間店的室內 GLB 拍窗卡：
- 鏡頭在窗中心外 6 m，藏起 WALL_front、GLASS_front、DECAL_front。
- 鏡頭參數在 `render_jobs.json`，渲染器是 Cycles 32 samples。
渲染圖原本比參考圖亮、偏白（從玻璃看會像曝光過度），所以每張照同一扇窗原本那張裁切做了調色：亮度往參考圖靠 75%，色偏靠 60%。

| 店 | 窗卡 |
|---|---|
| 青木茶室 G01 | ggtea_int、ggtea_take |
| 頁間書屋 G02 | ggbook_int、ggbook_int2 |
| 日和便利店 G03 | ggcvs_side、ggcvs_int |
| 恆輪單車 G06 | ggbike_int、ggbike_int2 |
| afar G07 | ggafar_win、ggafar_int |
| 轉角唱片 G12 | ggcorner_win、ggcorner_int |
| Daybreak G14 | ggdb_int |

洋洋鹹酥雞（G05）沒有窗卡，照舊。

## 檔案
- `tools/blender/env_second/textures/src/gg_cards/*.jpg`：13 張，調過色。
- `tools/blender/env_second/xs_front_tex.py`：QG 裡這 13 個條目改成 `@textures/src/gg_cards/<key>.jpg`；尺寸照窗的比例。
- `textures/gen/gg_fronts_atlas.jpg/json`：1024×2994 → 1024×3010。
- `assets/models/env/second_ai/gongguan_shops.glb/.json`：9.6 MB。

## 數字
- GLB：47 primitives、40 materials、167 nodes，三角形 105,166／118,630，**和換之前完全一樣**，只換了貼圖內容。
- dc.js 的 draw call 估計，換之前和換之後相同：arcade 50、from_gate 52、lane 31。
- Node 測試：`street_props_nav_unit`、`zq_arcade_seat_unit` ALL PASS（GLB 換進開發分支 637ee6982 的工作目錄跑的）。

## 比較圖
`cards_before_after.jpg`：左邊是原本的參考圖裁切，右邊是新的渲染（調過色）。

## 誠實說明（要 BB 決定）
- 新卡和走進店裡看到的一致；窗卡上也不會再出現第二層窗框和店外的立牌。
- 可是有幾間的 3D 室內比參考圖樸素，從窗外看得出差距：
  - afar 的 ggafar_int 大半是牆和掛畫，參考圖是咖啡吧和木櫃；
  - 轉角唱片少了參考圖的大海報、唱盤；
  - 青木的 ggtea_take 參考圖是外帶窗口，新的是茶罐牆。
  這是室內模型本身的差距，不是窗卡的問題。要補，是改室內模型（各店的負責人）。
- 不要的話，`xs_front_tex.py` 這 13 個條目改回原本的裁切、重建 atlas 和 GLB 就回去了。舊的裁切座標在 git 的上一版：f50bf41bd 之前那一版。
- 瀏覽器畫面還沒看（D131：等 PC）。

## v2（BB 11-04 03:52：選 ①＋③）
- BB 決定全部用渲染，裁切圖不改回去。
- 便利商店兩張、青木正面、頁間兩張原本過亮、偏白，這版改了：
  - 亮部壓縮：gamma 1.30～1.45，白牆、白櫃不再一片白；
  - 調成暖黃：R ×1.08～1.10、B ×0.80～0.84。
- 13 張全部疊一層淡淡的玻璃反光：上緣一帶冷灰的天空倒影，加一條斜的亮帶。只疊在窗卡貼圖上，室內 GLB 沒動。
- 窗框不疊：GLB 本來就有 3D 窗框。
- 調色程式：`tools/blender/env_second/gg_cards_grade.py <渲染圖資料夾> db7679c01`。之後 AA／CC 補好室內，用 `render_jobs.json` 的同一組鏡頭重拍，再跑這支。
- 比較圖 `cards_before_after.jpg` 改成三欄：參考圖裁切／v1／v2。
- 數字：primitive、材質、三角形、draw call 估計（50／52／31）都不變；street_props_nav、zq_arcade_seat ALL PASS。
- 第 3 點（補模型）：
  - AA 補 afar 的咖啡吧、層架、吊燈、植物；
  - CC 補轉角唱片的大海報、唱盤、綠沙發；
  - AA 補青木外帶窗的窗台、紙杯、菜單牌、茶壺。
  補好後我重拍。
