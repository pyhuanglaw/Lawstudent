# PERF-WZ-DAY-1103：溫州街白天 1% low 7 fps——先分清楚是什麼

LAWWW2-C，2026-11-05（P1，LAWWW-C 派的；驗收：BB 用同一支 F1／F2 探針重量）。

狀態：**分析＋量測探針**。還沒改遊戲：雲端的瀏覽器是 SwiftShader，fps 數字不能用（D131）。要先在 PC 上量出是哪一項，再修。

## CC 的 F1／F2 怎麼量、數字說了什麼

- F1／F2 是 `tools/cc_local/fps_zones.py`：cc-local `docs/story_planning/CC/local_out/F1_fps_hl`、`F2_fps_hd`，b1b249873，MSI RX 6600M，844×390，dpr 1，畫質中。
- 它每一區照 **day → night → rain** 的順序量：讀檔進區域，等 4 秒，量 15 秒。
- 所以 **day 永遠是剛進這一區的第一格**。

| 區域 | day 最慢一幀（ms） | night | rain | day 1% low（fps） | night | rain |
|---|---|---|---|---|---|---|
| 溫州街 | **293**（F1 350） | 63（67） | 83（117） | **7.4**（7.1） | 22.8（18.7） | 20.3（15.0） |
| 校園 | **187**（117） | 87（83） | 67（133） | 11.1（11.4） | 18.4（16.4） | 19.2（13.3） |
| 總圖大廳（室內） | **143**（183） | 40（100） | 33（50） | 16.7（8.6） | 31.2（13.3） | 30.4（20.0） |
| 萬才館（室內） | **370**（83） | 33（83） | 37（33） | 13.9（16.0） | 33.7（15.0） | 31.6（30.0） |
| 霖澤館（室內） | 40（100） | 50（83） | 37（83） | 27.6（12.7） | 30.0（14.1） | 30.7（23.3） |

（F2 有視窗；括號裡是 F1 無視窗。）

1. **尖峰幾乎都在第一格**：
   - 室內也一樣。萬才館 F2 白天最慢 370 ms、晚上 33 ms；室內白天、晚上的光差不多，沒有理由只有白天卡。
   - 溫州街 day 和 night 的平均、中位數幾乎一樣：F2 平均 40.4／41.4 fps、p50 都是 23.3 ms；F1 平均 33.4／35.6、p50 都是 33.3 ms。
   - 差的是少數幾格特別慢：15 秒約 500 格，1% low＝最慢的 5 格。
   - → **推論**：白天的 1% low 是「剛進區域那十幾秒的成本」，不是白天才有的成本。
     - 剛進區域的成本：編 shader、傳貼圖、路人換正式模型、GC。
     - 白天才有的成本：太陽陰影每一格重畫；晚上改成 2 秒一次，X79。
   - 這是推論，還沒證實。下面的兩支探針都會量。
2. **另一件事：溫州街平常就只有 33～40 fps**：
   - p50 23～33 ms，等於每一格要等 2 個 vsync。
   - 844×390、dpr 1 在 RX 6600M 上不是畫素多寡的問題。比較像每一格的 draw call 太多：CC 量到 280～480 個，含陰影那一輪。
   - 公館只有 130～170 個，平均 54～65 fps。

## 雲端能確定的（SwiftShader：只看相對，不看 fps）

用下面的探針在開發分支（ed7600ec5）上跑溫州街：

| 項目 | 結果 |
|---|---|
| 只跑程式、不畫（norender） | 程式每一格 2.5～5 ms：**程式本身不是瓶頸，是畫的那一段** |
| 陰影不每格重畫（noshadow） | draw call 357 → 294：陰影那一輪大約 60 個（217 個投影的網格，有剔除） |
| 進區域以後新編的 shader | 0：換區域的預熱（zones3d.js prewarm）有編到。PC 上要再看一次 |
| 路人換正式模型（CHAR.upgrade） | 每次進區域 1 次。雲端一次約 100 ms，PC 上多少要量 |

溫州街的正式模型（不剔除、一輪）大約 278 個 draw：

| 模型 | draw |
|---|---|
| 主巷 `wenzhou_street.glb` | 112 |
| 機車 | 76（每台 70 個 primitive；有分組 instancing） |
| 公園 | 29 |
| 道具 | 24 |
| 日式老屋 | 17 |
| 貓 | 13 |
| 市場 | 7 |

再加上人物（一個 VRM 5～10 個）、套件、燈、天空。

## 探針（給 PC 跑）：`perf_split_probe.py`

每一區做四件事：

1. **A 冷**：第一次進這一區（11:00 晴），一進來馬上量 12 秒。
2. **B 再進一次**：同一區、同一時段。A 有、B 沒有的尖峰＝第一次進來才有的成本。
3. **C 晚上**：21:00，和 CC 的 night 那一格對照。
4. **D 白天穩定以後的分項**：每一項 8 秒。
   - base；
   - noshadow：太陽陰影不每格重畫；
   - nonpc：NPC、騎士藏起來；
   - norender：只跑程式、不畫；
   - base2：最後再量一次 base，看有沒有漂移。

每一格記這些：

- 間隔；
- `E.update`、`E.render`、`STORY.tick`、`GAME.upgradeModels` 的 CPU 時間，以及換了幾個模型；
- 新編的 shader；
- 貼圖、幾何數；
- draw call、三角形；
- JS heap。

最慢 8 格另外列：和上一格比多了幾張貼圖、幾個幾何，heap 掉了多少，以及 gap（間隔減掉 update＋render：GPU、合成、GC）。

網址自己加 `?perf`，順便記 PERFPANEL 的換區域紀錄（黑畫面多久、淡入後新編幾個 shader）。

輸出 `perf_split.json`、`perf_split.txt`。雲端 SwiftShader 驗過可以跑：溫州街、總圖大廳都 ALL PASS，JS 例外 0。

雲端已經看得到一個線索（只看「發生了什麼」，不看毫秒）：

- 總圖大廳 B（再進一次）有一格是路人換正式模型（`upgN`＝1）。
- 那一格 `E.render` 裡多傳了 **46 張貼圖、28 個幾何**（`dtex`＝46、`dgeo`＝28）。
- VRM 是從實例池拿的（`ASSETS.acquireVRM`），每個實例各自一套貼圖：換一個路人，就把那一套全部傳上 GPU。
- 前一格 `STORY.tick` 花了很久（生路人）。
- PC 上這兩格是不是溫州街白天的尖峰，看 PC 的慢格。

PERFPANEL 那一行數的是淡入以後 10 秒。COLD 要 ≥ 10 秒，不然會把下一次進區域的黑畫面也算進去：雲端冒煙測試 COLD 3 秒時就算到了。

### 排進 cc-local 的兩項（請 CC-C 放進 `tools/cc_local/queue.txt`；探針檔要先複製到 cc-testing）

```
PERF_WZ_SPLIT | <開發分支最新 SHA> | probe | docs/story_planning/test_tools/cc/perf_split_probe.py | index.html | 30 | ZONES=wenzhou,campus,library_hall;COLD=12;SECS=8;CC_HEADLESS=0
FPS_WZ_ORDER  | <同一個 SHA>       | probe | tools/cc_local/fps_zones.py                         | index.html | 20 | ZONES=wenzhou,library_hall,wancai;SLOTS=night,day,day,rain;CC_HEADLESS=0
```

第二項用 CC 原本的探針，只把順序換成 night 先：

- 如果尖峰跑到 night（第一格）、兩個 day 都沒有，就證實是「第一次進區域」的成本。
- 如果兩個 day 都還有尖峰，就是白天本身的成本：陰影或白天才有的 NPC。

## 看了數字以後怎麼修（誰的檔）

| 量到的 | 原因 | 修法 | 誰 |
|---|---|---|---|
| A 的慢格 `upgN`＞0、B 沒有 | 路人換正式模型（每 1.5 秒換 1 個，換的那一格要建 VRM、傳貼圖） | 進區域的黑畫面裡先換好；或模型已經載好時直接用正式模型建，不先放替身 | LAWWW（game3d.js），我寫 patch |
| 慢格 `prog`＞0 | 淡入以後才編的 shader（晚到的 GLB、預熱沒編到的材質） | 預熱多編那幾種；晚到的模型先藏著、編好再顯示 | 我（zones3d.js prewarm）＋ LAWWW 接 |
| 慢格 `dtex`＞0 | 晚到的模型第一次畫，傳貼圖 | 預熱裡先 `initTexture` | 我 |
| 慢格 gap 大、heap 掉很多 | GC | 找每一格新建的物件 | 看數字 |
| D：noshadow 比 base 快很多 | 白天陰影那一輪 | 減少投影的網格（小東西、遠的不投影）；陰影隔一格畫 | 我（模型的投影旗標） |
| D：nonpc 比 base 快很多 | 人物 | 遠的人物 LOD、少幾個路人 | LAWWW |
| D：base 的 rnd（CPU）大、draw 多 | draw call | `wenzhou_street.glb` 材質合併（像公館店面的 atlas、霖澤館大廳的頂點色）、機車 primitive 合併 | 我 |

## 第二步：PC 的數字回來了（LAWWW2-B 2026-11-07）

- **PC 結果**：cc-local（MSI RX 6600M，844×390，dpr 1，畫質中），開發 `1344de13d`：
  - `PERF_WZ_SPLIT`：11-05 13:06（台灣）；
  - `FPS_WZ_ORDER`：11-05 23:13；
  - 在 `docs/story_planning/CC/local_out/` 下面。
- 上一班交班時還沒跑到，這一班才讀。

### ① 證實：尖峰是「第一次進區域」，不是白天

`FPS_WZ_ORDER` 把順序換成晚上先：

| 溫州街 | 晚上（第一次進） | 白天（第二次） | 白天（第三次） | 下雨 |
|---|---|---|---|---|
| 1% low（fps） | **1.9** | 15.0 | 20.0 | 18.8 |
| 最慢一格（ms） | **1,517** | 83 | 50 | 67 |

- 尖峰跟著換到晚上，兩次白天都沒有。
- 總圖大廳同樣是晚上（第一次）最差：1% low 3.6 fps。
- **CC F1／F2 的「白天 1% low 7 fps」＝第一次進溫州街的成本。** 白天本身沒有額外的尖峰。

### ② 第一次進溫州街（`PERF_WZ_SPLIT` A_cold）

**黑畫面 15.5 秒**：
- 建區域 1.7 秒；
- 「預熱」11.5 秒：大部分是 `ASSETS.waitLoaded` 在等溫州街的正式模型載完，prewarm 本身最多 2 秒。
- 第二次進只要 4.3 秒。

**淡入後的長格**：

| 淡入後 | 一格 | update | render | 換模型 | 新 shader | 多傳的貼圖 | 不在遊戲程式裡（gap） |
|---|---|---|---|---|---|---|---|
| 第 2 格 | **4,600 ms** | 6 | 84 | 1 次（71 ms） | 0 | 23 | **4,510** |
| 第 5 格 | 1,933 ms | 11 | 20 | 0 | 0 | 0 | 1,903 |

- 總圖大廳第一次進也一樣：7,266 ms 一格，換模型 1 次、gap 6,816 ms。
- 再進一次（B_again）最長只有 200 ms。

**gap 是什麼**：探針的 rAF 排在遊戲後面，所以 gap 發生在「換模型那一格」的**前面**。比較像是兩格之間：
- 在載入、解析某個模型，載好了下一格才換上；
- 或是 GPU 那邊第一次畫新東西（編譯、傳貼圖），瀏覽器排不出下一格。

另外兩件事：
- `ASSETS.waitLoaded` 黑畫面時只等 `type:'building'`，路人的 VRM 不等；
- 校園穩定以後（D_base）還是有「換模型 5」：有些路人模型是走進區域才載的。

這兩種要用第二支探針分清楚（下面）。

### ③ 穩定以後（D）：每一格要等兩個 vsync

| 溫州街 | 平均 fps | p50 | 1% low | E.update | E.render（CPU） | draw call | 三角形 |
|---|---|---|---|---|---|---|---|
| base | 33.9 | 33.3 ms | 20.0 | 8.4 ms | 19.3 ms | 360 | 52.7 萬 |
| 陰影不每格重畫 | 40.1 | **16.8 ms** | 20.0 | 6.2 | 17.2 | 289 | 46.6 萬 |
| NPC 藏起來 | 36.0 | 33.3 | 20.0 | 8.3 | 18.0 | 349 | 51.1 萬 |
| 不畫 | 60.0 | 16.7 | 59.5 | 8.3 | 0 | — | — |

- 光是 `E.render` 的 CPU 就 19 ms，加上 `E.update` 8 ms，一格超過 16.7 ms，所以只能 30 fps。
- 陰影那一輪大約 70 個 draw call、2～3 ms。關掉以後一半的格子回到 60 fps（p50 16.8 ms）。
- NPC 只佔 1 ms 左右。
- **要回到 60 fps，要省的是畫面的 draw call（CPU 那一邊）和陰影那一輪**。

溫州街模型的 draw call 都是我的檔。上面「雲端能確定的」那張表是 11-05 在雲端數的：
- 主巷 112、公園 29、道具 24；
- 機車那一列 76 可能是舊的：機車 v2 早就每 20 m 合成一個網格（`attachWzScooters` 的 `scMerge`，外加遠距離版本），一段只有 1 個 draw call。
- 所以不憑這張表開工。第二支探針加了**分項**：PC 上照模型分組、各畫一次，記 draw call、三角形（含陰影那一輪），數字回來再決定省哪一組。

校園：
- base 24.5 fps，CPU 30 ms，458 個 draw call；
- 陰影不重畫 → 358 個 draw call、1% low 2.5 → 12 fps。

## 第二支探針：`perf_cold_probe.py`（第一次進的那一格是誰）

**做法**：每一個「區域 × 做法」開一個新的瀏覽器（真的第一次進）：
- **base**：照原本。
- **pre**：先把 base 那一次「進區域以後才開始載」的資產全部載好，再進同一區。
  - 長格消失＝是載入、解析；
  - 還在＝是 GPU 第一次畫。
- **prewarm**：pre，再加上黑畫面裡把整個場景不剔除地畫一次到小畫布、讀一個像素。
  - 淡入後再變少＝「第一次畫」的成本可以搬進黑畫面（之後修法的候選）。

**另外**：base 那一次量完以後做分項——場景照模型分組（大的群組往下拆一層），每一組單獨畫一次，記 draw call、三角形（含陰影那一輪）。用 Node 的假場景驗過：數字對、跑完每個物件的 visible 都還原。

**記錄**：
- Chrome 的 **Long Animation Frames**（LoAF）：每一個長格裡跑了哪幾段 JS（呼叫方式、函式名、`檔案:行`、毫秒）。
  - 長格裡沒有對應的 JS＝主執行緒在等 GPU 或瀏覽器。
- `ASSETS.loadOne`（開始載、載好）、`ASSETS.parseVRM`、`CHAR.upgrade`、`Z3.prewarm`／`Z3.warmup` 的時間點。

**遊戲程式不用改**：都是在探針裡包 `ASSETS`、`Z3`、`CHAR` 的屬性。

**驗過的**：
- Python、四段 JS 用 `node --check` 過；
- 用假資料跑過分析和輸出（行號對應）；
- 照 D131 沒有在雲端開瀏覽器。

**排進 cc-local**：探針先複製到 cc-testing 的 `docs/story_planning/test_tools/cc/perf_cold_probe.py`。

```
PERF_COLD | <開發分支最新 SHA> | probe | docs/story_planning/test_tools/cc/perf_cold_probe.py | index.html | 40 | ZONES=wenzhou,library_hall;VARIANTS=base,pre,prewarm;COLD=12;CC_HEADLESS=0
```

- 6 次開瀏覽器，每次約 1 分鐘。
- 輸出 `perf_cold.txt`、`perf_cold.json`。

## 看了第二支的數字以後怎麼修

| 第二支量到的 | 修法 | 誰的檔 |
|---|---|---|
| base 的長格裡是 `parseVRM`、`loadOne` 的 JS，pre 就沒有 | 黑畫面的 `waitLoaded` 也等這一區要用的路人 VRM（現在只等 building）；或路人的 VRM 改在標題畫面背景載 | LAWWW（`game3d.js`、`assets3d.js`），我寫 patch |
| 長格裡沒有 JS（pre 也還在），prewarm 就沒有 | 黑畫面裡整個場景畫一次（`Z3.prewarm` 最後加這一步） | 我（`zones3d.js`）＋ LAWWW 接 |
| 都還在 | 看 LoAF 列出來的函式再說 | — |

**穩定以後的 30 fps**（和第一次進無關）：等第二支探針的分項，挑 draw call 最多的那幾組。候選：
- 主巷 112：材質合併成貼圖集；
- 不需要投影子的小東西不投影（陰影那一輪約 70 個）。

做完請 CC 用 `perf_split_probe.py` 的 D 重量。

## 還沒做

- 第二支探針的 PC 數字（等 CC-B 排）。
- 修：等數字決定第一次進的那一項。
- 穩定以後的 draw call：等分項（機車那一列可能是舊數字，先不動）。
- 驗收：BB 用同一支 F1／F2 重量。
