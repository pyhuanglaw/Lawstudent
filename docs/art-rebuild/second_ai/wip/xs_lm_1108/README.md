# 光照第二級最後一組：新生南路 9 個模型（LAWWW2-B 2026-11-08）

**狀態：交件**（檔案 commit 見 HANDOFF；交件訊息會寫 SHA）。512 取樣、1024 貼圖，白天／晚上兩張（南洋 1 廳多一張「開演」）。

## 做了什麼
- 七個區域、九個模型：大步、好拍、同弦、新生運動、山嵐、大口一樓／二樓、南洋大廳、南洋 1 廳。
- 原地烘在 AA、BB 的原檔上（LAWWW-B 11-07 14:51 同意的做法），只動三件事：
  - 加第二套 UV、`extras.lightmap`；
  - 不烘光照的網格如果和要烘的共用材質，拆出 `*_rt` 一份（照舊即時光）；
  - 其他節點、材質、GPU instancing 都不變。每一間都用 `glbdiff` 逐節點和開發分支的原檔比過。
- 白天：天光從臨街的玻璃進來；不放太陽（店在遊戲裡轉過方向）。天光色調 1.32,1.0,0.72，和公館那一組一樣。晚上：只有店裡的燈。
- 只烘地板、天花板、牆面；家具、商品、金屬、玻璃、發光的東西照舊即時光，照樣擋光（接觸陰影烘得進去）。
- 腳本 `tools/blender/env_second/lightbake/bake_xs.sh <店>`，每一間的燈、參數寫在裡面。烘焙紀錄在 `tools/blender/env_second/lightbake/<名字>_lm.json`，有 `src_sha256`＝烘焙用的原檔。
  - **九個原檔的 sha256 都和開發分支 `51d7f0ff6` 上的一樣。**
  - 山嵐原本拿到我分支上較舊的 v5，已改用開發的 v5.1（AA-C `4977d6c72`）重烘。光照貼圖結果一樣：v5.1 只把兩盆盆栽歸到 L2_，位置沒變。
- 大口一樓第一次烘太亮：白天／晚上 0.55／0.46，地板一成多燒白。
  - 原因：一樓燈板材質的自發光強度是 26（二樓同名材質 2.4），烘焙時 60 片燈板本身就是很強的光源。只把面光源調弱 40%（`PW=3 WW=4`），亮度幾乎沒差（0.53／0.42）。
  - 改法：一樓烘焙時把燈板藏起來（`bake_xs.sh` 的 HIDE 加 `dk_lightpanel$`；照樣原樣匯出，遊戲裡照舊發光），燈照原本的 5 W／6 W。結果 0.46／0.33，和二樓一致。
  - 順便修了 `bake_room.py`：`--emit` 調過的材質，匯出前原本一律設成 1.0，改成設回原本的值（`f6b2caf18`）。到今天交過、用過 `--emit` 的 13 個材質原本都是 1.0，沒受影響。
- 南洋 1 廳白天、晚上兩張一模一樣：沒有窗、白天也只有場燈，照設計。「開演」那一張另外一張。

## 程式 patch：`xs_lm_1108.patch`
- 對開發 `51d7f0ff6` `git apply --check` 過（寫的時候是對 `f7c6380d7`，這三個檔沒變）。
- `src/zones3d.js` `attachRoomGLB`：`root.userData.lightmaps`＝好幾顆 GLB 各自的光照貼圖，給大口用。
  - 大口一樓、二樓兩顆放在同一個 Group，Group 本身沒有 `extras.lightmap`。
  - 陣列是空的時候照舊，天花板照舊加自發光。
- `src/dakou3d.js`：把兩層各自的 `extras.lightmap` 放進 `lightmaps`，只有真的有才放。
- `src/nanyang3d.js` `houseLights`：開演時叫 `z.lightsOff(1)`，換到「開演」那一張（場燈關，只剩走道地燈、太平門、銀幕）；演完叫 `z.lightsOff(0)`。

## 要換的檔
| 模型 | 誰做的 | glb sha256（開發 → 這一版） | 大小 | 光照貼圖（新檔） | 白天／晚上平均（過曝） |
|---|---|---|---|---|---|
| 大步 `bb_support/dabu` | BB | `3956419f…` → `f9fad488…` | 2,434,276 → 2,490,672 B | `day` 4955c9c6…, `night` f532cbac… | 0.38（0.7%）／0.33（0.0%） |
| 好拍 `bb_support/haopai` | BB | `d3fd4b7a…` → `8088e492…` | 3,134,624 → 3,252,952 B | `day` 0004e70c…, `night` 8023e321… | 0.33（0.3%）／0.31（0.0%） |
| 同弦 `bb_support/tongxian` | BB | `210de132…` → `4b9b12c5…` | 2,997,640 → 3,149,364 B | `day` 58ed7611…, `night` e3fa78ed… | 0.31（0.7%）／0.32（0.0%） |
| 新生運動 `bb_support/xinsheng_sports` | BB | `a06b2cd6…` → `5e986dca…` | 3,799,984 → 3,923,848 B | `day` e9413a20…, `night` be637852… | 0.39（0.5%）／0.32（0.0%） |
| 山嵐 `aa_support/shanlan` | AA（AA-C v5.1） | `5abb4be4…` → `19602ef0…` | 5,440,896 → 5,876,276 B | `day` bb364cf1…, `night` badb6516… | 0.37（0.0%）／0.31（0.1%） |
| 大口 1F `bb_support/dakou_1f` | BB | `333bf444…` → `93aa685a…` | 1,671,360 → 1,720,932 B | `day` cdbbc1b7…, `night` 50e3ad0f… | 0.46（1.3%）／0.33（0.1%） |
| 大口 2F `bb_support/dakou_2f` | BB | `789f3202…` → `abdb9920…` | 2,514,308 → 2,545,824 B | `day` e877d355…, `night` 707c0a7f… | 0.47（0.3%）／0.32（0.2%） |
| 南洋大廳 `bb_support/nanyang_lobby` | BB | `25d722da…` → `1622ac63…` | 3,188,876 → 3,358,156 B | `day` 99094429…, `night` 40b20156… | 0.35（6.0%）／0.29（0.1%） |
| 南洋 1 廳 `bb_support/nanyang_hall` | BB | `3045eaa2…` → `c66cdec0…` | 4,647,808 → 4,733,812 B | `dark` 2fe2fd68…, `day` aaa5ce84…, `night` aaa5ce84… | 0.23（0.0%）／0.23（0.0%） |

- 都在 `assets/models/env/second_ai/` 底下。光照貼圖是新檔，開發分支上沒有。
- 烘焙紀錄：`tools/blender/env_second/lightbake/{dabu,haopai,tongxian,xinsheng_sports,shanlan,dakou_1f,dakou_2f,nanyang_lobby,nanyang_hall}_lm.json`。
- 腳本：`bake_xs.sh`、`glb_fix_instnames.py`（`--match`：烘完照原檔補回 GPU instancing 節點的名字、extras）。
- 新測試：`xs_lm_unit.js`（這個資料夾），放 `tests/`。
- 動了誰做的檔：
  - AA：`aa_support/shanlan.glb`；
  - BB：`bb_support/` 其他八個。
  - 這次只加光照，形狀、材質、配置不變。

## 過曝說明
- 南洋大廳白天 6%：全部在前牆朝街道那一面的外側（白天曬到天光），從室內看不到，不處理。
- 大口一樓白天 1.3%：靠臨街玻璃那一塊地板的天光。
- 其他幾間都在 1% 以下，在燈正下方。

## 測試（Node，D131；工作樹＝開發最新 `51d7f0ff6`＋patch＋這九個檔）
- **`xs_lm_unit.js`**：
  - 1～4：九個模型各自檢查四項：extras.lightmap 和貼圖都在、該烘的網格有第二套 UV、沒有共用材質、淡出的牆和 instancing 數目照舊。
  - 5：大口兩層各自接上自己那一張。
  - 6：南洋 1 廳開演、演完換貼圖、場燈對。
  - 開發原樣（沒換檔、沒套 patch）**FAILED 15** → 這一版 **ALL PASS**。
- 提到這九間的 39 支 Node 測試：**ALL PASS**。大口 1F 換成最後一版以後，大口那 5 支和 xs_lm_unit 又跑了一次，也都過。

## 還沒驗
- 遊戲內：CC 拍七個區域白天、晚上；南洋 1 廳開演前、開演中。BB-B 判。
