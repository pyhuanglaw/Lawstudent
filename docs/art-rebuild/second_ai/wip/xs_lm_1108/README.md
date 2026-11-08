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
- 大口一樓第一次烘太亮：白天／晚上 0.55／0.46，地板燈下有一成多燒白。平板燈從 5 W 調成 3 W、吊燈從 6 W 調成 4 W 重烘（`PW=3 WW=4`）。

## 程式 patch：`xs_lm_1108.patch`
- 對開發 `51d7f0ff6` `git apply --check` 過（寫的時候是對 `f7c6380d7`，這三個檔沒變）。
- `src/zones3d.js` `attachRoomGLB`：`root.userData.lightmaps`＝好幾顆 GLB 各自的光照貼圖，給大口用。
  - 大口一樓、二樓兩顆放在同一個 Group，Group 本身沒有 `extras.lightmap`。
  - 陣列是空的時候照舊，天花板照舊加自發光。
- `src/dakou3d.js`：把兩層各自的 `extras.lightmap` 放進 `lightmaps`，只有真的有才放。
- `src/nanyang3d.js` `houseLights`：開演時叫 `z.lightsOff(1)`，換到「開演」那一張（場燈關，只剩走道地燈、太平門、銀幕）；演完叫 `z.lightsOff(0)`。

## 要換的檔
TABLE_HERE

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
- 其他幾間的過曝都在 1% 以下，在燈正下方。

## 測試（Node，D131；工作樹＝開發最新 `51d7f0ff6`＋patch＋這九個檔）
- **`xs_lm_unit.js`**：
  - 1～4：九個模型各自檢查四項：extras.lightmap 和貼圖都在、該烘的網格有第二套 UV、沒有共用材質、淡出的牆和 instancing 數目照舊。
  - 5：大口兩層各自接上自己那一張。
  - 6：南洋 1 廳開演、演完換貼圖、場燈對。
  - 開發原樣（沒換檔、沒套 patch）**FAILED 15** → 這一版 **ALL PASS**。
- 提到這九間的 39 支 Node 測試：TESTS_HERE

## 還沒驗
- 遊戲內：CC 拍七個區域白天、晚上；南洋 1 廳開演前、開演中。BB-B 判。
