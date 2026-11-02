# 烘焙搬到使用者 PC：第一張工作單（BAKE-PC-1102）

LAWWW2（帳號 A）2026-11-02 21:1x。起因：BB 11-02 P1「光照烘焙搬到使用者 PC（CC runner）」：
1. 寫烘焙工作單給 CC 排進佇列（KIND=blender、SHA=lawww2）；
2. 第一張用小場景對照：雲端 CPU 和 PC Cycles GPU（HIP）各烘一次，比亮度和時間，**一致才採用**（BB_229 第 1 條）；
3. 腳本讓 PC 選 GPU：`CC_BLENDER_DEVICE=HIP` 用 GPU，沒設就 CPU，雲端行為不變；
4. 通過以後，3F、展演廳的烘焙交給 PC 夜間跑（發布前測試優先）。

狀態：`CHECKPOINT_SAVED`（工作單和腳本寫好、雲端驗證過；PC 還沒跑）。commit、push 只是保存，不是核准，也不是發布。

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

- 3F（`library_3f_v2`）、展演廳（`library_hall_v2` 第三版）的烘焙 driver：同樣做法（參數寫在 driver 裡、輸入 GLB commit），夜間排給 PC。
- BB 清單裡的「黑森林」：黑森林是戶外，**目前沒有光照烘焙**（即時光＋陰影），不用排。
