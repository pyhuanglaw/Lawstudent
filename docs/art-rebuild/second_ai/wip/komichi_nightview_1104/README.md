# KOMICHI-NIGHTVIEW-1104：小路的窗景改成 Blender 拍的白天／夜景（LAWWW2-C，2026-11-04）

狀態：`MODEL_READY`。要等 BB 判 ART_APPROVED（D120），還要在 PC 上看遊戲畫面。

## 原本錯在哪（BB_255 1(a)：「22:00 窗外還是白天街景，和 14:00 一模一樣」）
- 小路（wz_teishoku）的窗外是 room() 的視差窗景（W3.windowMat）。照片是 `assets/models/env/views/wz_teishoku_{day,night}.webp`，19:12 以後換成夜景那一張；這一段程式是對的。
- 問題在照片：那張夜景是 10-22 在遊戲裡 20:30 拍的（tools/shots/shop_views_layers.py）。
  - 遊戲裡的溫州街晚上也很亮，拍出來像黃昏：對面公寓、馬路都還是灰白的，只多了幾扇亮窗。
  - 所以 BB 對照 14:00 和 22:00，看起來是同一張白天的照片。
  - 放大 BB 的對照圖可以看到，22:00 確實換成夜景那張了：顏色偏暖，阿德影印店裡的燈亮著。
- 2:30 AM、SUNNY SIDE 的窗景卡是 Blender 拍的夜景（天空暗、窗和店裡的燈亮），BB 判「有換」。這一版照同一個做法拍。

## 改了什麼
- 新腳本 `tools/blender/env_second/wz_window_view.py`：用遊戲同一批溫州街正式模型在 Blender 拍店家窗外的照片，白天、晚上各一張。
  - 模型：wenzhou_street、wz_props、wz_jphouse、wz_park，加上 scooter.glb 的機車。
  - 機車的位置是用 Node 在遊戲的溫州街裡讀出來的（套件機車 43 台）。款式、顏色和遊戲 attachWzScooters 用同一個 hash。
  - 遊戲照狀態切換的節點，照預設狀態藏起來：
    - 阿德影印 COPY_*：還沒決定，A1 開著、轉角拉下鐵捲門。
    - 季節 SEASON_*：11 月。
  - 鏡頭和 shop_views_layers.py 的 wz_teishoku 一樣：(−2.8, 1.25, −4.6) 朝 +z、水平 90°、2:1。W3.windowMat 的視差以那一片為準，換照片不用改程式。
  - 夜晚：
    - 發光材質照遊戲 zones3d.js 的 WZ_NIGHT：招牌、亮燈的窗、店門口的燈。
    - GLOW_* 空節點放點光源：騎樓燈、門口燈、店內燈。
    - 店內（wz_in_*）晚上亮一點，表示店裡開著燈。
    - 天空接近黑的深藍，月光很弱。
  - 2048×1024、Cycles 64 取樣＋降噪，縮成 1024×512 存 webp。晚上用 `--lamp-k 4 --exposure -0.7`：點光源 35 的時候整條街被照亮（平均亮度 89，比原本的 75 還亮），試了 12／5／4，4＋曝光 −0.7 的平均亮度 54、中位數 43——路面、牆暗，窗、招牌、店裡的燈亮。
- 換掉的檔案（程式不用改）：
  - `assets/models/env/views/wz_teishoku_day.webp`
  - `assets/models/env/views/wz_teishoku_night.webp`

## 對照
`komichi_views_before_after.jpg`：左邊是原本在遊戲裡拍的（上白天、下 20:30），右邊是這一版 Blender 拍的（上白天、下晚上）。

## 還沒做 / 沒測
- 遊戲畫面還沒在 PC 上看過：小路 14:00、22:00 坐在窗邊座位往外看；18:36～19:12 白天換到夜景的過渡（photoFade）。
- 白天那張也換了，和夜景同一套模型，過渡的時候東西才不會突然變不見。
  - 遊戲裡用程式放的小東西，Blender 沒有：盆栽（TK.pots）、右上角的直立招牌。
- 公館三家（cvs、noodle、bookstore、cafe）的窗景是兩層的（VIEW_LAYERS），這次沒動。

## 重做的指令（這次的輸入：開發分支 4ff38f08d 的 GLB）
```
G=assets/models/env/second_ai
/opt/blenv/bin/python tools/blender/env_second/wz_window_view.py -- --eye -2.8,1.25,-4.6 --at -2.8,1.25,40 --out day.png --res 2048x1024 --samples 64 \
  --glb $G/wenzhou_street.glb,$G/wz_props.glb,$G/wz_jphouse.glb,$G/wz_park.glb --scooters docs/art-rebuild/second_ai/wip/komichi_nightview_1104/wz_scooters_wenzhou.json
/opt/blenv/bin/python tools/blender/env_second/wz_window_view.py -- （同上） --out night.png --night --lamp-k 4 --exposure -0.7
```
- `wz_scooters_wenzhou.json`：Node 在遊戲的溫州街裡讀出來的套件機車位置（wz_kit_scooters 的子物件，43 台；(0,0) 的幾筆是 LOD 的子節點，腳本會跳過）。
- 每張 2048×1024 約 5 分鐘（雲端 4 核心）。
