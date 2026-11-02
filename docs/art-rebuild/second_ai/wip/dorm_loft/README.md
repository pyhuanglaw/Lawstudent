# 宿舍四人房：床桌組比例＋房間變窄（DORM-LOFT-SCALE-1102）

LAWWW2（帳號 A）2026-11-02 21:3x。狀態：**`ART_APPROVED`（BB_249，21:32，dc41197b7）**；LAWWW 21:31 ACK、排在黑森林後面整合；瀏覽器測試排隊中（LAWWW 也請 BB 排到使用者電腦）。

BB_249 的小意見（不擋定稿，下次動到時順手改）：白色床護欄板太空，可以加木紋收邊，或擺毛巾、貼紙；鏡頭貼近床欄等使用者回報再處理。commit、push 只是保存，不是核准，也不是發布。

## 起因（使用者 11-02 原話）

- 20:3x「宿舍的床跟人的比例太奇怪了，床太小，階梯太小」（UA-LAWWW2-1102-13）
- 21:0x「宿舍走道太大了 我記得宿舍的床之間大概只能走同時站的話大概三個人的寬度吧，而且床的長度會更長，我記得是那種我去看過是很深的，一邊有兩個床啊，而且還有階梯的寬度，所以你打開門看起來會是深的」（UA-LAWWW2-1102-14）

## 改了什麼

| 項目 | 改前 | 改後 |
|---|---|---|
| 房間 | 6.0 × 7.0 m | **4.2 × 7.0 m**（門照舊在中間；左右牆各往內 0.9 m） |
| 中間走道 | 約 4 m | **1.8 m**（約三個人並排） |
| 床桌組（每組） | 長 2.4 m、離牆 0.95 m | 長 **2.57 m**、離牆 **1.05 m**；一邊兩組 |
| 床板／床欄頂 | 1.56／2.02 m | **1.66／2.12 m**；床墊 2.0 m 長 |
| 梯子 | 寬 0.40 m、4 階（頂 1.28 m） | 寬 **0.52 m**、**5 階**（每階 0.32 m、頂 1.60 m） |
| 洗手間 | — | 1.3×1.5 m，淋浴、小洗手台、馬桶重排，門 z 2.3～2.95 |
| 窗 | — | 1.6 m 寬 |
| 光照 | 舊房間 | **重烘**（白天／晚上／熄燈三張；燈條、吸頂燈照新位置） |

- 建模：`tools/blender/env_second/dorm_room4.py`（配置 `dorm_room4.layout.json` → `tools/gen_dorm_room_layout.py` → `src/data/dorm_room_layout.js`）。
- 四個年度的雜物（大一～大四、溫州街那一年、205 房）：`dorm_loft_remap.py` 把舊座標換到新床桌組上（三角形數不變），GLB 都重匯出。
- 烘焙：`tools/blender/env_second/lightbake/bake_dorm_room4.sh`（1024²、512 取樣，21:18 完成）。

## 給 LAWWW 的 patch

`dorm_loft_scale_1102_wip.patch`（對 int/m590 `0e11c43a3`，`git apply --cached --check` 過）：
- `src/zones3d.js`：宿舍房間導航格 **0.4 → 0.2 m**（`room()` 多一個 `cell` 選項，只有宿舍用）。原因：房間 4.2 m 寬以後，0.4 m 的格線（從 −3.1 起算）對不上 ±0.9 的床桌組邊，**自己書桌旁、梯子前都站不住**（Node 實測重現）。鏡頭範圍、鏡頭碰撞照床桌組內緣算（以前寫死 ±1.6）；大二紙箱那一塊 `Y2_BOX` 跟著挪。
- `src/story3d.js`：爬梯子的鏡頭夾在房間裡、離牆 ≥ 0.35 m（梯子往門口挪了 0.34 m，不夾的話離門那面牆只剩 0.2 m）。
- `src/data/dorm_room_layout.js`、`src/data/room_glb_layouts.js`（205 房）：重產。
- 測試（寫死舊房間尺寸的地方改讀配置，沒有放寬標準）：`aa347_y1_unit`、`dorm_205_unit`、`dorm_cam_unit`、`dorm_sleep_scene_unit`（梯子「4 階」→「≥ 4 階、每階 0～0.35 m」）、`dorm_y2_items_unit`、`nav_buildings_unit`。
  - `dorm_cam_unit` 的 BB 04「鏡頭在南被洗手間擋住」：4.2 m 的房間從 R2 書桌旁正南那條線離洗手間隔間只差 5 cm、量不到被擋，改成南偏東 11° 才重現（重現檢查是證明測試抓得到 bug；修好的檢查照舊）。
- 二進位從本分支拿：`assets/models/env/second_ai/dorm_room4.glb`、`dorm_room4_lm_{day,night,dark}.webp`、`dorm_205.glb`、`dorm_205.layout.json`、`dorm_room4.layout.json`、`dorm_{y1,y2,y3,wz}_items.glb`；`tools/blender/env_second/lightbake/dorm_room4_lm.json`。

## 測試（在 int/m590＋這份 patch＋新 GLB 上；雲端，不是手機實機）

| 測試 | 結果 |
|---|---|
| 宿舍相關 105 支 Node 單元測試（`dloft/dorm_units.txt` 清單） | 105 pass、0 fail（21:03，改導航格以後重跑） |
| 換成新烘的 GLB 以後再跑：`dorm_lightmap_unit`、`dorm_dark_lights_unit`、`dorm_seethru_unit`、`dorm_sleep_scene_unit`、`dorm_cam_unit`、`v0_dorm_props_unit` | 全部 ALL PASS |
| 遊戲內改前改後（同鏡頭 6 張：門口、窗邊往門看、梯子、人站在梯子旁、人站在走道、晚上） | `dorm_cmp_a.jpg`、`dorm_cmp_b.jpg` |
| 瀏覽器：`flow_dorm_hall`、`dorm_start_memory`、`reachability_all`（dorm、dorm_hall、dorm_205）、`seats_on_furniture dorm` | **排隊中**（總圖測試後面），結果出來補在這裡 |

## 還沒達到的／要注意的

- 截圖第 6 張（晚上）室友坐在右邊書桌：截圖工具 hideNPCs 沒藏到房間裡的室友，不是房間的問題。
- 走道變窄，鏡頭可以活動的範圍也變小（camBox ±0.8 m）：鏡頭比較常貼近床欄，BB 看畫面時請特別看這一點。
- 實機沒測。
