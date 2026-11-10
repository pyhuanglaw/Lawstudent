# XS-TONGXIAN-VIEW-1110：同弦樂器臨街窗的白天／晚上窗景 — LAWWW2 帳號 A，2026-11-10

狀態：`MODEL_READY`，交 LAWWW 整合。遊戲截圖請 CC 拍（D131）。

## 問題
- 來源：BB X254 GAME_BUG P2，「21:00 窗外跟白天一模一樣」。
- 原因：CC 的室內模型 tongxian.glb 窗外是一塊固定的白天街景板。那塊板子在窗外 1.6 m，用的是 tx_props 貼圖集的一格，沒有晚上的版本。
- 更正：我在第二批的 README 寫「同弦正面沒有玻璃」，這是錯的。臨街的窗在後牆 z −5.2，就是這一扇。

## 做法
和新生南路其他店（XS-WINCARD）一樣，放一片視差窗：
- `src/tongxian3d.js`：
  - 新增 `PANES`：店內 (−1.7, 1.7, −5.37)，大小 4.4×2.6，比窗大，斜看也不露邊。位置在後牆外 5 cm、擋在那塊白天的板子前面。
  - 正式模型接上後呼叫 `Z3.shopViewPane`。換時段時，19:12 以後換成夜景。
  - 不動 CC 的模型。
- 照片：
  - `assets/models/env/views/xs_tongxian_{day,night}.webp`，1024×512，共 74 KB。
  - Blender 在新生南路場景裡、站在那片窗的位置往外拍。看得到對面的校園圍牆、體育館、大王椰子；晚上有窗燈和路燈光圈。
  - 渲染腳本 `render.sh`，總覽圖 `views_tongxian_sheet.jpg`。
- 換算（寫在 render.sh 開頭）：
  - 街 x＝−18.2 − 店內 z；街 z＝−9.2 ＋ 店內 x；y 加 4.2（二樓樓板高）。
  - 依據：tongxian_layout.js 說店內 z −1.7 在一樓店面玻璃 x −16.5 的正上方；wz_street.py 說同弦二樓的窗在本地 x 0.4～3.0。

## 測試
- 新測試 `tests/xs_tongxian_view_unit.js`，在 Node 建出真正的同弦區域、接上正式模型：
  - ① 有一片視差窗，照片檔都在；
  - ② 在玻璃、後牆外面，面向店裡，蓋住整扇窗；
  - ③ 中心＝拍照位置，誤差 ±0.15 m；
  - ④ 14:00 向 W3.viewPhoto 要白天那張，21:00 要晚上那張。
- 結果：
  - **開發分支 0ec32e6f6：FAILED 4**（照片檔已放，只拿掉程式的修改）。套上 patch：**ALL PASS**。
  - 讀到同弦、吉他的回歸 49 支，加 xs_wincard_1105，見 `regression.log`。只有 bulletin_board_1110 沒過：開發分支上原樣也失敗，原因是要讀企劃線的 AA_737 檔案，和這次無關。

## 整合
`git apply --binary xs_tongxian_view_1110.patch`，已確認可以套在開發分支 0ec32e6f6 上。內容：tongxian3d.js、2 張 webp、測試。
