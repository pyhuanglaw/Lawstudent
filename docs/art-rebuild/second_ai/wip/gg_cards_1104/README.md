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

## v3（AA 68c166ed2 補模型之後重拍，11-04 04:2x）
用同一組鏡頭（`render_jobs.json`）重拍 7 張：青木 2、頁間 2（換成 v3b，沙發往北 0.2）、afar 2、Daybreak 1。調色照 v2。
`rerender_68c166ed2_before_after.jpg`：左邊舊模型，右邊新模型。
- 青木 ggtea_take：檯面上看得到三疊紙杯、「季節限定」菜單牌、茶壺、外帶杯。
- afar：**兩張窗卡都看不到新加的 side_station**，它在 x 4.8、門的東邊靠東牆，不在任一扇窗的視線裡。afar 的窗是 x −3.9～1.75，門在 x 1.8～3.35。
  ggafar_int（x −0.3～1.75）看進去是後牆：兩幅畫、綠色腰牆、讀書桌。要讓窗外看得到咖啡店的樣子，要補在這一段的後牆上（請 AA 決定）。
- Daybreak、頁間：畫面幾乎一樣。
- 數字不變：primitive 47、材質 40、三角形 105,166／118,630，draw call 估計 50／52／31；street_props_nav、zq_arcade_seat ALL PASS。

## v4（AA afar v1d a7f16be34，11-04 04:4x）
afar 兩張窗卡用同一組鏡頭重拍：ggafar_int 看得到後牆的兩層層板（咖啡罐、豆袋、小盆栽、燈條）、深綠吊燈、黃金葛；ggafar_win 右上角也看得到層板。
比較圖 `rerender_afar_v1d_before_after.jpg`（左舊、右新）。這版 GLB 也包含 gg_ext_nav2 的兩項修正（f936fd2c8：頁間盆栽、白天光暈 0）。數字不變。

## v5（BB 11-04 05:06／LAWWW 05:05，11-04 05:2x）
1. **draw call 1.38 的查證**：9ac863212 和 610c528cb 的 gongguan_shops.glb 結構完全一樣（47 primitive、40 材質、167 node，node 名稱逐一相同），差別只有貼圖內容。多出的 34～36 個 draw call 不是這個 GLB 造成的，已請 CC 關掉路人、同一時段 A/B 重量。
2. **打烊的店窗卡要暗（BB 判 FAIL）**：
   - 窗卡還是同一個網格 NOSHADOW_xs_fronts_lit，沒有拆開。
   - 加了第二組 UV（TEXCOORD_1，three.js 讀 `uv1`）：u＝店的編號，1～8；0＝不屬於哪一間，永遠亮。
   - 編號對照寫在這個 node 的 extras `xsShops`：`ggtea,ggbook,ggcvs,ggyy,ggbike,ggafar,ggcorner,ggdb`，也就是 1＝青木（aoki）、2＝頁間（bookstore）、3＝日和（cvs）、4＝洋洋、5＝單車、6＝afar、7＝轉角唱片、8＝Daybreak。
   - 遊戲要做的（LAWWW）：在這個材質的 onBeforeCompile 裡讀 `uv1.x`，查一張 uniform 陣列（照 PLACES.isOpen 每幀更新），打烊的店把 emissive 乘 0.15～0.2。這樣還是一次 draw call。
3. **三張太糊**：ggbook_int2 768→1024、ggcvs_side 768→1024、ggcorner_win 384→512。atlas 2048×6020 → 2048×6332，存檔再縮一半。
4. GLB：primitive、材質、node 都不變（47／40／167），三角形不變，dc.js 估計 50／52／31。
5. `gg_groups_zebra_patch_ae50cb459.patch`（zones3d.js＋tests，接 ae50cb459）：
   - 校園那一側的斑馬線改成獨立網格 `zebra_campus_gate`，不再併進車道線，y 0.03 → 0.05。BB 說 gate_out 看不到；Node 裡位置是對的（x −173.6～−139.4、z ±6），要 PC 再拍。
   - 群組差 1：公館遠景 clone 改名 gongguan_far_glb；套件行道樹、校門、捷運套件給固定名字（gg_kit_trees／gg_kit_gate／gg_kit_mrt）；測試兩邊都排除這些名字和 street_trees_field。
   - Node：street_props_nav、bike_park_1104、spawn_exit ALL PASS。

## 11-04 06:5x：GG_ext_glb4 的 ?nobldg 分母 164 → 184／176（BB 問、LAWWW 轉）
- 用 `nobldg_mesh_census.js <checkout>` 在 Node 建公館區域（GLB 全部不載入＝?nobldg），數看得到的網格（不算視錐裁切）：
  - 9ac863212（群組 patch 之前）1478、9271834e0（接 1d4675069）1478、3424d8e66 1478。
  - 只差在名字：沒名字的 Group 1357 → 1334（−23）＝ gg_kit_gate 9＋gg_kit_mrt 8＋gg_kit_trees 6。
- 所以 1d4675069 的群組 patch **沒有讓 ?nobldg 多畫東西**；prop.street 在 ?nobldg 照舊被 assets3d.js 第 230 行拿掉（patch 沒碰）。LAWWW 猜的那個原因不成立。
- 同一版量兩次是 184 和 176，差 8：場景是靜態的，差的應該是跟時間有關、會開關的東西（路燈光暈、騎樓燈光暈、窗卡夜間），或路人沒有全部移出。雲端沒辦法數瀏覽器的 draw call（D131），請 CC 用下面那段在兩種網址、同一個鏡頭各跑一次，貼回清單比對。
