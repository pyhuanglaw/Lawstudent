# GYM-FIT-PROPS-1103 第一包：健身中心手上的道具（啞鈴、槓鈴、划船拉把）

狀態：**已交付**（模型＋程式 patch＋Node 測試）。遊戲畫面等 CC 拍（D131）。LAWWW2 帳號 A，2026-11-10。

## 原因
- GYM-FIT-ACTIVE-1103（8bc5b1207）讓 B1 健身中心的人用程式擺骨頭做動作（gymIK）：深蹲、啞鈴彎舉、坐姿推舉、飛輪、划船、拉筋。
- 但手上是空的（子代理截圖：彎舉、推舉、深蹲、划船都是空手）。

## 做了什麼（patch `gym_hand_props_9d4c54c16.patch`，--binary，在開發分支 9d4c54c16 上做的）
- 新模型 `assets/models/char/second_ai/gym_hand_props.glb`（Blender `tools/blender/env_second/gym_hand_props.py`，1,096 個三角形、74 KB）。
  - 三個道具：`gym_dumbbell` 啞鈴、`gym_barbell` 槓鈴（1.8 m、兩邊 15 kg 槓片＋小彩片）、`gym_row_handle` 划船拉把。
  - 原點＝握把中心、軸沿 +x。
- `src/character3d.js`：gymIK 擺好骨頭以後，每一格照手的位置擺道具（`gymProps`）。
  - 彎舉、坐姿推舉：每隻手一個啞鈴。握把中心＝手骨頭往中指根部 55%；軸線＝食指根部到小指根部，橫過拳頭。
  - 深蹲：槓鈴放在兩隻手掌心的中間，也就是肩膀後面，左右水平。
  - 划船：拉把在兩隻手中間，跟著拉。
  - 飛輪、拉筋手上沒東西。
  - 換回別的動作會藏起來；`CHAR.release` 拿掉（VRM 會被下一個人重用）。
  - 遠距離版本（u.isFar）不放。道具 lazy 載入，載入失敗最多重試 3 次；每一格不配置新物件。
- `src/assets3d.js`：`prop.gym_hand`（lazy）。

## 測試 `tests/gym_hand_props_unit.js`
- 在 Node 載入遊戲的路人人物 npc_nm1（男）、npc_nf1（女），照 gymIK 跑每個動作。
- 開發分支：**FAIL**（沒有道具）。加 patch：**ALL PASS**。
  - 彎舉、推舉：兩個啞鈴離手骨頭 ≤ 3.9 cm、和前臂夾角 ≥ 84°（橫過拳頭）、跟著手上下 26～43 cm。
  - 深蹲：槓鈴離兩肩中點 ≤ 9 cm、和左右方向的夾角 1°。
  - 划船：拉把離兩手中點 ≤ 3.9 cm、跟著前後 70～74 cm。
  - 飛輪、拉筋手上 0 個；換回站著 0 個；release 以後 0 個。
- 回歸 `gp_reg.txt`：gym_pose、gym_crowd、gym、sit_task_wire、sit_task_loops、stairs_feet、seat_ambient 都 ALL PASS。

## 還沒做（第二包）
- 飛輪的曲柄、踏板跟著腳轉，划船機的座椅跟著臀部前後滑。
- 現在的器材（BB-B 的 gym_b1_props.glb，GPU instancing 進 gym_b1.glb）曲柄停在固定角度，座椅不動。
- 要做的事：
  1. 把這幾個零件從靜態器材拆出來，重匯 gym_b1_props，重建 gym_b1.glb 並重烘 B1 的光照；
  2. 做成會動的零件，照 gymIK 的 g.ph 擺。
- 工作量比這一包大（要重烘），先交道具。

## 沒有測過
- 瀏覽器畫面：請 CC 在 B1 健身中心開館時間拍深蹲、彎舉、推舉、划船各一張，近一點，看握的位置和有沒有穿模。
