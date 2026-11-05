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

## 還沒做

- PC 的數字（等 CC-C 排、PC 跑）。
- 修：等數字決定修哪一項。
- 驗收：BB 用同一支 F1／F2 重量。
