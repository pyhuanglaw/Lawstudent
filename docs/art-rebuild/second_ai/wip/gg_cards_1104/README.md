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

## 11-04 07:2x：打烊的店光暈一起熄（LAWWW 06:58 P1，擋 v9.10.20）
- **`gg_glow_shoplit_patch_d432de8ba.patch`**（接開發分支 d432de8ba，`git apply` 過）：只改 `src/zones3d.js`＋新測試 `tests/gg_glow_shoplit_unit.js`。
  - 窗卡 uv1 店編號核對過（讀 gongguan_shops.glb 的 NOSHADOW_xs_fronts_lit）：1 青木 x −56.4～−50.3、2 頁間 −46.6～−35.8、3 日和 −34.1～−23.5、4 洋洋 −12.9～−5.1、5 單車 −3.8～4.7、6 afar 7.2～14.4、7 轉角唱片 53.2～59.0、8 Daybreak 70.0～76.4，和 xsShops 的順序一致。
  - wzGlowBatch 的 items 多記光暈名字；ggShopLit 接上以後（新函式 ggShopGlow）給光暈網格加 aShop（每頂點店編號），著色器乘同一個 uShopLit：那一間 < 0.99（打烊）就不畫。
  - 收哪些：GLOW_gg_xs_in、GLOW_shopin、GLOW_gg_xs_lamp（x 放寬 0.8 m），GLOW_signbox、GLOW_vsign（不放寬：直立招牌在店的邊上，放寬會分到隔壁那間）。騎樓燈 GLOW_arcadelamp 不熄（整排騎樓的）。
  - 公館 GLB 實際分到：青木 2、頁間 5、日和 4、洋洋 5、單車 6、afar 3、轉角 3、Daybreak 3；其他 27 個是另外幾間不能進去的店，照舊亮。
- 測試：`gg_glow_shoplit_unit` 修改前（d432de8ba）FAIL 5、修改後 ALL PASS；`gg_shops2_1104_unit`、`gym_arena_unit`、`gym_unit`（也用 glowBatch）前後都 ALL PASS。瀏覽器的亮度要 CC 用同一組取樣框重量。

## 11-04 07:3x：gongguan_glb_integration 效能的量法一致（BB 06:47、LAWWW 06:55）
- `gongguan_glb_integration_measure_d432de8ba.patch`：只改 `tests/gongguan_glb_integration.py`。
  - DRAW：量的時候時鐘停住（`E.player.busy`，game3d 這時不加時間）、時間定在 17:30（`E.applyTime`）、路人照舊移出去；回傳多帶 hour、lamps、npcsHidden、census（畫面裡的網格照最上層群組｜材質數）。
  - 新增一項檢查：兩輪的時刻、路燈狀態相同。門檻（1.3 倍、42 萬）沒改。
  - census 寫進 note，兩輪對不上時直接比。
- 雲端跑不了瀏覽器（D131），**這支沒跑過**；只做了 Python 語法檢查、`git apply --check`。請 CC 在 PC 跑。

## 公館 street_west／arcade draw call 1.43 倍（BB 07:54；LAWWW2 11-04 08:5x）
CC 的 census（cc-local `docs/story_planning/CC/local_out/GG_glb_measure/run.log` 第 26、37 行）。主畫面裡的網格，一般網址 162 個、?nobldg 105 個，差 57 個：
- **騎乘腳踏車 bike_ride.glb 兩台＝30 個網格**（ride_vc 16、ride_alpha 6、ride_frame 4、ride_saddle 2、ride_lamp_lens 2；一台 15 個）。?nobldg 是 0 個。
  兩台應該是玩家停著的車和公館那一位騎士（story3d.js 的 riders(1)）。陰影那一輪一台還要 6 次。
- `Group|npc_far` 4 個：遠處路人的低面數版本。?nobldg 是 0 個。
- 剩下的才是建築：shops、捷運出口、遠景、行道樹。
### 這一次的修正：`bike_parked_merge_dac871e25.patch`（只改 src/bike3d.js）
- 停著的車不會動，所以照材質合成網格（W3.mergeGroup），藏起來的載妹墊不合進去。名字照舊 `bike_ride`，上車時照舊另外 make() 一台零件分開的。
- 每台停著的車：主畫面 15 → 6、陰影 6 → 2（照 GLB 算的；投影規則和 load() 一樣）。
- `bike_unit`、`bike_shop_park_unit` 都 ALL PASS（在 dac871e25 上）。這兩支測試的車是只有一個方塊的替身，合併前後的數字是用 GLB 算出來的，不是遊戲裡量的。
### 量法的問題（請 BB 判）
- 騎士和遠處路人的低面數版本，?nobldg 那一輪沒有畫：一共 15＋4 個網格，陰影還要再加。
- 兩輪都把路人移出去了（BB 06:47），騎士和 npc_far 卻沒有移出去。建議這兩樣也比照路人移出去。這是讓兩輪的條件一樣，門檻 1.3 不變。
- 估算：停著的車合併以後約 −13。騎士、npc_far 也移出去的話再約 −25。224 → 約 186～190，除以 157 約 1.2。PC 的真數字要 CC 重量。

### 量法 patch 第二版：`gongguan_glb_integration_riders_bf9518378.patch`（BB 定，LAWWW 08:53 要；只改 tests/）
- 量 draw call 的時候，除了 E.npcs 裡的路人，下面兩樣也暫時移出場景，量完放回去：
  - 騎士：名字是 bike_ride、但不是直接放在區域群組底下的那一組（BIKE.rider 的群組）。
  - 遠處路人的低面數版本：npc_far。
- 這兩樣不動：停在區域裡的自己的車（parent 就是區域群組）、玩家身上的車。
- 分子、分母兩輪都用同一套量法，門檻 1.3 不變。note 多記一個 extraHidden（移出去幾組）。
- 檢查做了：py_compile、量測那段 JS 的 node --check；選取的規則用 Node 模擬一個場景驗過（停著的車留著，騎士、npc_far 移出）。瀏覽器還沒跑，要 CC 跑。

---

## GG-NIGHT-CARDS-1104：第二次進公館，整張窗卡不畫（LAWWW2-C，2026-11-04 13:0x）

狀態：修法＋單元測試交給 LAWWW-C 整合；瀏覽器回歸（CC-C r8c）還沒跑。

### 原本錯在哪
- 證據：CC-C r8c 用雲端 SwiftShader，在 060a1a093 上同一頁先讀檔 14:00、再讀 21:00。
  - 21:00 那一次，窗卡的程式 `LINK_STATUS＝false`。
  - vertex 錯誤：`'uv1' : redefinition`、`'vShopIdx' : redefinition`。
  - fragment 錯誤：`'uShopLit' : redefinition`、`'vShopIdx' : redefinition`。
  - 原因 BB-C 讀程式碼先看出來，r8c 證實了。
- 機制：
  1. 快取的 GLB 每次進區域都是 `c.scene.clone(true)`：網格是新的，材質還是同一個。
  2. `ggShopLit` 每次進公館都再包一層 `onBeforeCompile`。新的 `mine.prev` 是上一次的 `mine`，著色器就被 patch 兩次。
  3. 程式連結失敗，整張窗卡網格不畫。營業中的店也一樣，框裡只看到後面被燈照著的磚牆 `wz_wall_mosaic`。
- 所以這個 bug 是「第二次進公館」才出現，不是「晚上」才出現。r8b 的探針剛好先 14:00、後 21:00，晚上那張正好是第二次進去。
  - 這也解釋了 r8b 的兩個怪現象：把材質設黑沒有變化，打烊乘數改多少也沒有差別。
  - **之前所有「打烊的店窗還亮」的亮度數字，都是在窗卡不見的狀態下量的，修好以後要重量**（BB-C 第 4 點）。
- 還有一個潛在問題：別的程式如果在 ggShopLit 之後又包一層（像 `patchSeeThrough` 那樣串在後面），`guard` 接回去時兩個包裝會互相呼叫，編譯會無限遞迴。目前 `wz_xs_fronts` 沒有被別的程式包，還沒真的發生；單元測試第 4 項會觸發這種情況，修改前就是 `Maximum call stack size exceeded`。

### 改了什麼（`gg_shoplit_reentry_ebd44c2e3.patch`，只改 `src/zones3d.js` 的 ggShopLit，另外新增一個測試）
做法和 LOBBY-REENTRY（`roomLightmap` 的 `lmWired`）同一型：
1. 接過的材質記在 `ggLitWired`（WeakMap：材質 → `{lit, U, mine, compiled, rewrap, entries}`）。再進來就沿用，不再包。
2. uniform 物件也沿用。材質如果沒有被丟掉，three.js 會用快取的程式、不再呼叫 `onBeforeCompile`，綁著的還是第一次的 uniform；所以新的 `upd` 要寫進同一個 `lit` 陣列，打烊才會暗。修改前，第二次的 `lit` 是新的陣列，沒有綁到任何程式。
3. patch 本身先看原始碼裡有沒有 `uShopLit`／`vShopIdx`：有的話只接 uniform、不改原始碼。
4. 包裝函式加防遞迴。
5. 除錯欄位 `GAME.E.zone.ggLit.entries()`：這個材質接過幾次，也就是第幾次進公館。`compiled()`、`rewrap()` 改成跨進場累計。

### 測試（Node，不需要瀏覽器，D131）
`node tests/gg_shoplit_reentry_unit.js` 用遊戲真正的 `zones3d.js`，加上 three.js 真的 `ShaderLib.standard` 原始碼，拿同一個材質建三次區域：

| 項目 | 修改前（ebd44c2e3） | 修改後 |
|---|---|---|
| 1 第一次：各宣告一次 | PASS | PASS |
| 2 第二次、第三次重新編譯：各宣告一次 | **FAIL**（各 2 次，和 r8c 的 redefinition 一致） | PASS |
| 3 沒有重新編譯時：快取的程式讀到第二次 upd 寫的值（22:00 afar＝0.03） | **FAIL**（讀到 1） | PASS |
| 4 別的程式串在後面、guard 接回去：不遞迴，兩邊的 patch 各一次 | **FAIL**（無限遞迴） | PASS |
| 5 光暈同一個 uniform、材質沒有複製、entries＝3 | entries FAIL | PASS |

其他相關測試套用修法以後：
- `gg_glow_shoplit_unit` 9/9 PASS。
- `gg_shops2_1104_unit` 120 PASS、1 FAIL。這項 FAIL 是第 10 項「台詞逐字在 AA_652 裡」，修改前在 ebd44c2e3 上就失敗，和這次修改無關。

### 還沒驗證
- 瀏覽器（PC，cc-local）：請 CC 排 r8c 回歸，兩種順序都跑，各看兩次的 `LINK_STATUS` 和卡面：
  1. 先 14:00 再 21:00；
  2. 先 21:00 再 14:00。
- 打烊亮度要重新量（GG_night），因為之前的數字作廢。
- `tests/gongguan_glb_integration.py`。
