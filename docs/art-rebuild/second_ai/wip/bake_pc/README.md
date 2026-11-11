# 烘焙搬到使用者 PC：第一張工作單（BAKE-PC-1102）

LAWWW2（帳號 A）2026-11-02 21:1x。起因：BB 11-02 P1「光照烘焙搬到使用者 PC（CC runner）」：
1. 寫烘焙工作單給 CC 排進佇列（KIND=blender、SHA=lawww2）；
2. 第一張用小場景對照：雲端 CPU 和 PC Cycles GPU（HIP）各烘一次，比亮度和時間，**一致才採用**（BB_229 第 1 條）；
3. 腳本讓 PC 選 GPU：`CC_BLENDER_DEVICE=HIP` 用 GPU，沒設就 CPU，雲端行為不變；
4. 通過以後，3F、展演廳的烘焙交給 PC 跑（發布前測試優先）。BB 21:08 更正：**不用排夜間**，使用者 20:4x 說電腦隨時可以用（BB_00 第 9 點），排在發布前測試後面就好。

狀態：`CHECKPOINT_SAVED`（工作單和腳本寫好、雲端驗證過；PC 還沒跑）。CC 21:08：已排進 cc-testing 佇列（28fada015，BK1_cpu、BK1_hip，SHA lawww2＝fa9b9f5d8），在 ef63 發布前測試後面，預估 2～3 小時後開始；之後聯絡經 BB。commit、push 只是保存，不是核准，也不是發布。

## 改了什麼

| 檔案 | 內容 |
|---|---|
| `tools/blender/env_second/lightbake/bake_room.py` | 開頭選裝置：`CC_BLENDER_DEVICE`＝HIP／CUDA／OPTIX／METAL／ONEAPI → Cycles GPU；沒設或 `CPU` → CPU（跟以前一樣）。要 GPU 卻找不到 → 照樣用 CPU 烘完，但印 `DEVICE CPU（要 HIP 找不到；裝置：…）`，`<prefix>.json` 的 `device` 也這樣寫，**這種結果不能當 GPU 對照**。`<prefix>.json` 多 `device`、`blender`、`bake_seconds`。 |
| `tools/blender/env_second/lightbake/pc_ref/pc_bake_dorm_ref.py` | 小場景對照的 driver：宿舍四人房（11-02 新房間 4.2×7 m），和 `bake_dorm_room4.sh` 同一組燈、天空、外殼、隱藏規則；只收 `--out {out}`、`--res`、`--samples`（參數都寫在檔案裡，佇列的 ENV 欄不用塞一長串含 `;` 的燈光參數）。輸出 `d.glb`、`d_day/night/dark.png`、`d.json`、`stats.json`。 |
| `tools/blender/env_second/lightbake/pc_ref/dorm_room4_bakein.glb` | 輸入（`dorm_room4.py --bakeblock` 匯出，1.3 MB）：PC 不用先跑建模、不需要系統 python。 |
| `tools/blender/env_second/lightbake/pc_ref/compare_bakes.py` | 比較兩個輸出資料夾（系統 python3＋PIL＋numpy）。 |

## 雲端驗證（已做）

- 原本的 `bake_room.py`（HEAD）和改過的這一版，同一組參數（256²、8 取樣，CPU）：三張光照貼圖**逐像素完全相同**（`compare_bakes.py`：比例 1.0、平均差 0）——沒設 `CC_BLENDER_DEVICE` 時行為不變。
- `CC_BLENDER_DEVICE=HIP` 在雲端（沒有 GPU）：印 `DEVICE CPU（要 HIP 找不到；裝置：CPU/Intel Xeon Processor @ 2.10GHz）`，照樣烘完、exit 0。
- 雲端 Blender 5.2.2 LTS；PC 是 5.2.3（CC_29 操作卡）。**PC 上的 HIP 還沒實測**（雲端沒有 GPU）。

## 給 CC 的佇列（照 queue.txt 格式；兩項都是 blender kind，runner 會讓它們各自獨佔）

```
BK1_cpu | lawww2 | blender | tools/blender/env_second/lightbake/pc_ref/pc_bake_dorm_ref.py | index.html | 60 | CC_BLENDER_DEVICE=CPU;XARGS=--out {out} --res 512 --samples 256
BK1_hip | lawww2 | blender | tools/blender/env_second/lightbake/pc_ref/pc_bake_dorm_ref.py | index.html | 60 | CC_BLENDER_DEVICE=HIP;XARGS=--out {out} --res 512 --samples 256
```

- 排在發布前測試**後面**（BB：發布前測試優先）；兩項各約 10～20 分鐘（雲端 CPU 估計；PC 的 CPU 應該更快）。
- `BK1_cpu` 是 PC 的 CPU：用來分開「PC 和雲端不同」與「GPU 和 CPU 不同」兩件事。
- 請回傳每一項 `{out}` 裡的 `stats.json`、`d.json`、`d_day.png`、`d_night.png`、`d_dark.png`（512²，每張幾百 KB）和 runner 的 log（要看 `DEVICE` 那一行：`HIP：AMD Radeon RX 6600M` 才算真的用到 GPU）。

## 怎麼判斷（看結果以前先定好）

```
python3 tools/blender/env_second/lightbake/pc_ref/compare_bakes.py <雲端參考> <PC 輸出>
```
1. day／night 平均亮度比 0.97～1.03（只算有分到光照的像素；熄燈那張平均 < 0.02，8 位元量化不準，只看像素差）；
2. 同一個 UV 像素的亮度差：平均 ≤ 3/255、95 百分位 ≤ 12/255；
3. 圖一樣大、alpha 一樣。

三項都過＝PASS（一致，可以採用）；時間只報告（GPU 快幾倍）。不過就不採用、先查原因（GPU 和 CPU 的 Cycles 結果本來就有取樣雜訊的差，標準就是用來分「雜訊」和「亮度不一樣」）。
雲端參考：宿舍重烘（DORM-LOFT-SCALE-1102）烘完、CPU 空下來以後在雲端跑同一組（512²、256 取樣），結果放 `docs/art-rebuild/second_ai/wip/bake_pc/cloud_ref/`。

## 通過以後（還沒做）

- 3F（`library_3f_v2`）、展演廳（`library_hall_v2` 第三版）的烘焙 driver：同樣做法（參數寫在 driver 裡、輸入 GLB commit），通過對照就排給 PC（不用等夜間）。
- BB 清單裡的「黑森林」：黑森林是戶外，**目前沒有光照烘焙**（即時光＋陰影），不用排。

## BK1 結果（PC 11-03 01:0x 跑完；LAWWW2 11-03 08:4x 比對）

PC（RX 6600M，Blender 5.2.3）：`BK1_cpu` 51 秒、`BK1_hip` 196 秒（`DEVICE HIP：AMD Radeon RX 6600M`，真的用到 GPU）。檔案在 `claude/cc-local` 的 `docs/story_planning/CC/local_out/BK1_*/out/`。

| 比什麼 | 結果 |
|---|---|
| **PC CPU 對 PC GPU（HIP）** | **PASS**：同一份 UV，逐像素平均差 0.2/255、95% 0.07～0.2/255；三角形中心取樣平均差 0.1/255。**GPU 和 CPU 的結果一樣，可以採用。** |
| 雲端（5.2.2）重烘兩次 | 逐像素完全相同（雲端是穩定的） |
| 雲端 對 PC | 逐像素「平均差 64/255」——**這個數字沒有意義**：兩個 Blender 版本自動展開、排列光照貼圖 UV 的結果不一樣（47 個網格的 UV 全部不同，有 9 個網格因為接縫切法不同，頂點數差幾個），同一個像素位置對到的是不同的面。 |
| 雲端 對 PC（新比法：`compare_bakes_uv.py`，每個三角形中心照各自的 UV 取值、用 3D 位置配對） | 平均亮度比 0.98～1.01（過），但每點平均差 14/255、95% 72/255（不過）。拆到每個網格：中位數只差 2/255，差很多的是**踢腳板**（雲端 78、PC 0：PC 烘成全黑；雲端的踢腳板 UV 縮成一個點）、門那面牆、幾個枕頭。 |

- **判斷**：GPU 本身沒問題（和 PC CPU 一樣）。雲端和 PC 不一樣，原因是 **Blender 版本不同**，加上**踢腳板貼著牆、和牆面共面**（兩邊各自出了不同的毛病：一邊縮成一點、一邊全黑）。**不是 GPU 造成的。**
- **建議**：
  1. 正式烘焙固定在同一台機器、同一個 Blender 版本（PC 5.2.3），不要雲端和 PC 混著用（同一個房間的三張圖一定要同一次烘）。
  2. 踢腳板的毛病**雲端版也有**（光照貼圖只有一個點），下次改宿舍房間時順手修：把踢腳板往房間裡推 1～2 mm，或從光照貼圖排除，改用頂點色。
  3. 速度：HIP 這次比 CPU 慢將近 4 倍（第一次要編譯 kernel，加上場景太小）。下一張工作單換大場景（3F 或展演廳），HIP 連跑兩次、只算第二次的時間；如果還是比較慢，就用 PC 的 CPU（PC 的 CPU 本來就比雲端快 4 倍：51 秒對雲端 213 秒）。
- 比對 json：`bk1_result/`。

## BK2：大場景（總圖 3F）——BAKE-PC-1102-S2（LAWWW2 帳號 A，2026-11-11 16:2x UTC）

狀態：`CHECKPOINT_SAVED`（driver、輸入、雲端參考都 commit 了；**PC 還沒跑**，要經 LAWWW／BB 排進 CC 的佇列）。**選做（P3）**，排在發布前測試和其他正式工作後面。

### 為什麼和原本的工作單不一樣

- 原本的 S2 是「HIP 連跑兩次、只算第二次的時間；GPU 還是比較慢就改 PC 的 CPU 烘」。**這一半已經由使用者決定了**：11-03 13:3x 選「改成只用 CPU（建議）」，CC 的 runner 把 blender 項目的 `CC_BLENDER_DEVICE` 一律強制成 CPU（`tools/cc_local/README.md`「SOLO=1、blender 等待…」一節，cc-testing 分支）。HIP 不排、不比。
- **新的情況**：雲端的 Blender 已經升到 **5.2.3 LTS**，和 PC 同版（BK1 時雲端是 5.2.2）。BK1 雲端和 PC 不能逐像素比，原因就是版本不同、自動 UV 排法不同。現在同版，值得再比一次：**如果一樣，雲端和 PC 烘出來的就可以混著用**（例如這間在雲端烘、那間在 PC 烘），BK1 建議第 1 點（固定一台機器）可以放寬。

### 檔案

| 檔案 | 內容 |
|---|---|
| `tools/blender/env_second/lightbake/pc_ref/pc_bake_3f_ref.py` | 3F 第二版的 driver：和正式烘焙（`bake_library_3f_v2.sh`）同一組燈、太陽、天空、外殼、`--nolm`、`--keep-instances`；燈寫死、93 顆點光源讀 `library_3f_v2_lm.json`（上一次正式烘焙實際用的那一組；數量不對會停）。只收 `--out`、`--res`（預設 1024）、`--samples`（預設 512）。3F 沒有熄燈那張。 |
| `tools/blender/env_second/lightbake/pc_ref/library_3f_v2_bakein.glb` | 輸入（`library_3f_v2.py --layout src/data/library_3f_layout.js` 匯出，配置用開發分支 0bdb8fb79f 那一份；5.4 MB、94 個物件、7.4 萬個三角形）。 |
| `compare_bakes.py`（改一行） | 兩邊都沒有的那一張（3F 沒有 `d_dark.png`）記「兩邊都沒有（這個場景不烘）」，不算不一致。兩邊都有、或只有一邊有，照舊。宿舍那一組（三張都有）結果不變。 |
| `cloud_ref_3f_s/` | 雲端參考：512²、64 取樣（day、night PNG、`d.json`、`stats.json`）。 |
| `cloud_ref_3f_full/` | 雲端參考：1024²、512 取樣（正式烘焙的大小）。 |
| `bk1_result/bk2_cloud_repeat.json` | 雲端同一組參數（512²、64）跑兩次：**逐像素完全相同**（平均差 0、95% 0）。雲端 5.2.3 是穩定的。 |

`d.glb`（5.5 MB）沒有 commit：雲端重跑結果逐像素一樣，要用 `compare_bakes_uv.py` 時重跑（小的 26 秒、大的 21 分）就有。

### 雲端時間（CPU，Intel Xeon 2.1 GHz；同時沒有別的重工作）

| 參數 | 烘焙秒數 | 全部秒數 | day 平均 | night 平均 |
|---|---|---|---|---|
| 512²、64 取樣 | 24.4 | 27.9 | 0.11718 | 0.11234 |
| 1024²、512 取樣 | 1259.5 | 1265.0（約 21 分） | 0.19676 | 0.1931 |

（512² 那張平均比較低，是因為貼圖空白的地方多：同樣的面積攤在比較少的像素上，空白比例不同；比對只算有分到光照的像素。）

### 給 CC 的佇列（照 cc_local/queue.txt 的格式；runner 會強制 CPU，ENV 照寫 CPU 比較清楚）

```
BK2_cpu_s    | ceaab04cb | blender | tools/blender/env_second/lightbake/pc_ref/pc_bake_3f_ref.py | index.html | 30 | CC_BLENDER_DEVICE=CPU;XARGS=--out {out} --res 512 --samples 64
BK2_cpu_full | ceaab04cb | blender | tools/blender/env_second/lightbake/pc_ref/pc_bake_3f_ref.py | index.html | 90 | CC_BLENDER_DEVICE=CPU;XARGS=--out {out} --res 1024 --samples 512
```

- `BK2_cpu_s` 幾分鐘：先看這個就知道能不能混用。`BK2_cpu_full` 是正式大小，只是要 PC 的時間（雲端 21 分；BK1 時 PC 的 CPU 比雲端快約 4 倍，估 5～8 分）。只排得下一個就排 `BK2_cpu_s`。
- ~~SHA 寫 `lawww2`（second-ai-env-art 最新），或指定這一包的 commit。~~ **更正（BB 11-11 18:12）**：寫 `lawww2` 會跟著我分支的最新 head 走——我每推一次，CC 的 runner 就當成新項目重跑一輪（17:1x～18:1x 多跑了 4 輪、每輪約 17 分鐘），BB 已請 CC 加 #HOLD。**以後給 PC 的佇列行一律寫固定的 commit SHA**（例：BK2 這兩行應寫 `ceaab04cb`），不寫 `lawww2`。
- 請回傳 `{out}` 裡的 `stats.json`、`d.json`、`d_day.png`、`d_night.png`，和 runner 的 log（看 `DEVICE CPU`、`blender 5.2.3`）。`d.glb` 小於 50 MB 會推，留著：萬一 UV 不一樣，要用 `compare_bakes_uv.py`。

### 怎麼判斷（看結果以前先定好，和 BK1 同一套標準）

```
python3 tools/blender/env_second/lightbake/pc_ref/compare_bakes.py docs/art-rebuild/second_ai/wip/bake_pc/cloud_ref_3f_s <PC 的 BK2_cpu_s/out>
python3 tools/blender/env_second/lightbake/pc_ref/compare_bakes.py docs/art-rebuild/second_ai/wip/bake_pc/cloud_ref_3f_full <PC 的 BK2_cpu_full/out>
```
1. day／night 平均亮度比 0.97～1.03；
2. 同一個 UV 像素：平均差 ≤ 3/255、95 百分位 ≤ 12/255；
3. 圖一樣大、alpha 一樣。

- **PASS**：同版 Blender 的雲端和 PC 一樣，可以混著烘（BK1 建議第 1 點放寬成「同一個 Blender 版本就好」；同一個房間的白天、晚上照舊要同一次烘）。
- **FAIL、平均差很大但亮度比在範圍內**：多半是 UV 排法還是不一樣（CPU 不同、浮點數）→ 用 `compare_bakes_uv.py`（要兩邊的 `d.glb`）再比；如果還是不一樣，維持 BK1 建議第 1 點（固定一台機器）。
- **亮度比不在範圍內**：真的不一樣，先查原因，不混用。

時間只報告（雲端 21 分對 PC 幾分）：正式烘焙放哪裡，由 LAWWW／BB 依排程決定，這張單不決定。

### BK2_cpu_s 結果（PC 11-11 17:1x 跑完、BB 轉；LAWWW2 17:2x 比對）——初判 FAIL；**定案見下一節 BK2_cpu_full**

PC：`DEVICE CPU blender 5.2.3 LTS`、烘焙 21 秒、全部 32.8 秒（雲端 24.4／27.9 秒：這個大小 PC 沒有比較快）。檔案在 `claude/cc-local` 的 `docs/story_planning/CC/local_out/BK2_cpu_s/`。

| 比什麼 | 結果 |
|---|---|
| 平均亮度（`stats.json`） | day 0.1186 對雲端 0.11718（1.012）、night 0.11384 對 0.11234（1.013）：整張的平均在範圍內 |
| 逐像素（`compare_bakes.py`，`bk1_result/bk2_cmp_s.json`） | **FAIL**：平均差 39.6／38.5、95% 105/255——**UV 排法不一樣**（同版 Blender，14 個網格的光照貼圖 UV 一個都不相同；雲端重跑兩次則完全相同）。可能是 UV 打包和 CPU 核心數有關（PC 的 runner 用核心數減 2 個執行緒），沒有查證。 |
| 照 UV、三角形中心配對（`compare_bakes_uv.py`，`bk1_result/bk2_uvc_s.json`） | **FAIL**：day 亮度比 0.929、平均差 15.2、95% 76.6；night 0.968、13.7、88.2 |

每個網格（`compare_bakes_uv.py` 新加的 per_mesh，day）：
- 大平面幾乎一樣：地板（parquet）、天花板、地毯、四面牆、人文庫弧牆，**中位數差 0.7～3.7/255**（平均差被少數點拉高：牆角、窗邊的小三角形）。
- 差的集中在 **`L3_walnut`**（書架、閱覽桌的胡桃木，1872 個三角形中心＝一半的點）：雲端平均 35.1、PC 27.4，中位數差 12/255。這種網格是很多小面（層板、桌腳），512² 的貼圖每個小面只分到幾個像素，64 取樣的雜訊和 `--smooth` 在不同 UV 排法下結果不同。

判斷：照事先寫好的標準是 **FAIL**。原因很像 BK1：UV 排法不一樣，加上小面多、像素少。**大平面一樣、平均亮度一樣，不是光不一樣**。但 3F 是書架場景，胡桃木差 8/255 看得出來，所以**現在還不能混用**。`BK2_cpu_full`（1024²、512 取樣＝正式大小）比較不受像素少、取樣少影響，等它回來再定：
- 胡桃木中位數差降到 ≤ 3/255、整體過標準 → 「同版 Blender、正式大小可以混用」；
- 還是差 → 維持 BK1 建議第 1 點：同一個房間固定在一台機器烘。

### BK2_cpu_full 結果（PC 11-11 17:0x～17:3x 跑兩次、BB 17:46 轉；LAWWW2 17:5x 比對）——**定案：FAIL，維持 BK1 建議第 1 點**

PC 正式大小跑了兩次（ceaab04cb：烘焙全部 893 秒；5e5dfd047：881 秒），小的也多跑一次（5e5dfd047）。cc-local 的資料夾會被下一次蓋掉，第一次的檔案在 cc-local `7185bf5ef1`（full）、`cdc5ca05d8`（s）。

| 比什麼 | 結果 |
|---|---|
| PC 自己跑兩次（full、s 各一組；`bk2_pc_repeat_full.json`、`bk2_pc_repeat_s.json`） | **逐像素完全相同**（平均差 0）：PC 和雲端一樣，各自都是穩定的 |
| 雲端 對 PC，逐像素（`bk2_cmp_full.json`） | FAIL：平均差 34.5、95% 109/255——UV 排法還是不一樣（14 個網格 0 個相同；`uv pack … max` 雲端 0.9958、PC 0.9959） |
| 雲端 對 PC，照 UV 配對（`bk2_uvc_full.json`） | **FAIL**：day 亮度比 0.991（過）、平均差 12.2、95% 91/255；night 亮度比 **0.959**（不過）、平均差 10.8、95% 78/255 |

每個網格（中位數差／平均差，/255）：
- 大平面：牆 0.1～1.2／3.8～9.1；石膏 0.6～1.0／5.7；木作 1.0～1.1／13；收邊 1.0～1.6／21（平均被少數點拉高）。
- 胡桃木（書架、閱覽桌，一半的點）：**白天中位數 0.0**（平均 16.2 對 15.9）；**晚上中位數 5.7**（平均 18.3 對 15.4：PC 暗一點）——比 512²／64 的 12 好很多，但晚上還是超過事先定的 3/255。

**定案**：照事先寫好的標準是 FAIL，**維持 BK1 建議第 1 點**：雲端和 PC 不混用；同一個房間的 GLB、白天、晚上一定同一次、同一台烘。原因不是 Blender 版本，而是**不同機器排出來的光照貼圖 UV 不一樣**（同一台重跑完全一樣），小面多的家具在晚上（只有燈光）差得比較多。

給排程參考（不是建議改決定）：
- 每間房間的 GLB 和光照貼圖是同一次烘出來的，彼此對得上；**不同房間各自在不同機器烘，遊戲裡不會壞**，只是同一個房間換一台機器重烘，晚上的胡桃木會差約 3/255（平均值）。
- 時間：3F 正式大小，PC 的 CPU 893 秒、雲端 1265 秒（PC 快 1.4 倍；BK1 宿舍小場景是 4 倍，場景大了差距變小）。
- 11-03 另外有一組 PC 跑的宿舍正式大小（cc-local `BK2_cpu`、`BK2_hip_a／b`，sha 7cb22d757，名字和這次撞到）：HIP 595 秒、CPU 785 秒（runner 秒數）。使用者 11-03 已經決定 Blender 只用 CPU，這裡只記資料。

BAKE-PC-1102-S2 到這裡做完。
