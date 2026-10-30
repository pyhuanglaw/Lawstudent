# 換區域不卡第三輪：室內（PERF-ZONE-ENTER-1018；LAWWW2-B 2026-10-30）

- **派工**（LAWWW-B 10-30，P1，D108／D99）：使用者回報過「換畫面卡一兩秒」（X14）。
  - 範圍：經濟系那一年最常進的室內——溫州街、兩點半 Café、阿鳳麵店、社科院圖書館、博思 101、宿舍。
  - 交 patch，附相關 Node 測試結果。
  - 改 `engine3d.js`、`game3d.js` 的載入流程要先告訴他；只動場景那一邊（`zones3d.js` 的區域 warmup 等）可以直接做。
- **結果**：只改 `src/zones3d.js`（場景這一邊），`engine3d.js`、`game3d.js` 沒動。
  - patch：`docs/art-rebuild/second_ai/patches/zone_enter_readback_1030.patch`（對開發 `610d74642`）。
- **狀態**：`READY_FOR_REVIEW`。
  - 量測是 Playwright＋SwiftShader 電腦模擬（1280×720），**不是電腦、手機實機**。
  - SwiftShader 的 GPU 也用 CPU 模擬，時間比實機長很多，只拿來比前後、找卡在哪一段。

## 一、先查卡在哪裡

### 1. `Z3.warmup`、`Z3.prewarm` 本來就每個區域都做

- `game3d.js` 的 `enter`：黑畫面時 `Z3.prewarm`（只在電腦），淡入以後 `Z3.warmup`。
- 兩個都不分室內室外，所以「把 warmup 做進室內」本身沒有要改的。

### 2. 改前量測：18 站

- 工具：`tools/shots/interior_enter_probe.py --desktop`。
- 路線：公館 → 溫州街 → Café → 溫州街 → 麵店 → 校園 → 社科圖 → 校園 → 博思 101 → 校園 → 宿舍 → … 共 18 站。
- 結果：淡入以後最長的一格 3～8 秒，但這段時間裡新編的 shader 只有 0～5 個。
  - 室內的 shader 在黑畫面時大多已經編好、讀過結果：prewarm 讀了 75～93 個。
  - 所以淡入以後停住，主要不是編 shader。
- 資料：`data/ie_before_desktop.json`、`data/before_desktop.log`。

### 3. 用 profiler 看長的那幾格在做什麼

- 工具：`tools/shots/x14_prof.py --route …`。
- 資料：`data/prof_before.log`。
- 室內、溫州街最明顯的是兩段 `zones3d.js` 裡的 `getImageData`（讀畫布的像素）：

| 哪一段 | 什麼時候 | 停多久（SwiftShader） |
|---|---|---|
| `wzAtlasFaces`：招牌、門牌、店內景深卡合成一張 atlas，算每一格的平均色（atlas 空白處填這個顏色） | 進溫州街、Café（窗外的街）、校園，**黑畫面時**；溫州街每次進來都重做 | 1.4～3.4 秒 |
| `lmMean`：光照貼圖的平均亮度（晚上沒烘焙的小東西跟著暗多少，RT-NIGHT-1028） | 進 Café、麵店、社科圖、博思、宿舍，貼圖載好那一刻，常常剛好在**淡入時** | 1.5～4.7 秒 |

- **只有第一次讀像素慢**，後面幾次都在 30 ms 以內。
  - 讀的不是什麼大圖：4×4、32×32 的小畫布。
  - 原因：這兩個畫布在 GPU 上，讀像素要等 GPU 把排在前面的工作全部做完。前面排著的有：
    - 招牌的字；
    - 解碼、上傳那張 1024～2048 px 的光照貼圖；
    - 剛送出的 shader。
- 其餘長的格子大多是 `(idle)`：主執行緒在等 GPU（貼圖上傳、shader）。這部分見第四節。

## 二、改了什麼（`src/zones3d.js`）

1. **光照貼圖的平均亮度（`lmMeanAsync`）**：
   - 用 `createImageBitmap` 把圖縮成 32×32：瀏覽器在另外的執行緒解碼、縮小。
   - 再畫到 CPU 上的小畫布（`willReadFrequently`）讀像素，主執行緒不用等 GPU。
   - 同一個網址只算一次：再進同一個房間直接用記下的值。
   - 沒有 `createImageBitmap`，或它失敗時，照原本的 `lmMean`（也改成 CPU 上的小畫布）。
2. **atlas 每一格的平均色（`wzAvgC`）**：
   - 同一張畫布、或內容一樣的格子（板面資料＋畫布大小一樣），用記下來的值。
   - 第二次進溫州街、Café 的窗外街、校園，不再讀像素。
3. **招牌、門牌的畫布（`wzCanvas`）畫在 CPU 上**（`willReadFrequently`）：
   - 只用在 `wzSignTex`、`wzPlateTex`。
   - 這些畫布只拿來合成 atlas，原本的 CanvasTexture 不會傳上 GPU。
   - 第一次讀平均色也不用等 GPU。
4. **店內景深卡**（`TK.interiorTex`，`townkit3d.js` 的畫布，跨區域共用同一張）：
   - 第一次照舊讀一次，之後用記下來的值。
   - `townkit3d.js` 沒有改。

模型、貼圖、shader 都沒有改，畫面應該一樣；第三節第 3 點是同角度比對。

## 三、量測

### 1. `getImageData`（每一站總共停多久；`tools/shots/readback_probe.py`）

| 站 | 改前 | 改後 |
|---|---|---|
| 溫州街（第 1 次） | 2,328 ms（14 次） | 3 ms |
| Café | 5,096 ms | 0 ms |
| 溫州街（第 2 次） | 1,431 ms | 0 ms |
| 麵店 | 1,724 ms | 0 ms |
| 校園（第 1 次） | 67 ms | 0 ms |
| 社科圖 | 4,777 ms | 0 ms |
| 校園（第 2 次） | 957 ms | 0 ms |
| 宿舍 | 1,574 ms | 0 ms |

（改後 Café 的 atlas 一次都沒讀：窗外那條街的招牌和溫州街是同一批，用記下來的值。）

### 2. 18 站（`interior_enter_probe.py --desktop`）

（量測中）

### 3. 招牌同角度比對

（量測中）

### 4. Node 測試

（量測中）

## 四、還沒解決的（不是這一包能改的）

（量測後補）
