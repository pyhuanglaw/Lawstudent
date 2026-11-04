# WZ-YIZHAN-1104 一盞前院走得進去（LAWWW2 11-04）— READY_FOR_REVIEW（patch 可以整合；美術還差、遊戲截圖待 PC）

## 11-04 06:5x 更新（第二批五間做完以後接著做）
- **patch 換成 `yard_patch_3424d8e66.patch`**（接開發分支 3424d8e66，`git apply --check` 過；舊的 c7eb109d4 那份拿掉了）。GLB 在 LAWWW2 分支 `assets/models/env/second_ai/wz_teahouse_yard.glb`，要一起拿。
- 這份比上一份多兩處（都是因為前院改成走得進去，舊規格寫在測試裡）：
  1. `wz_shops_layout.js`：打工下班的點（teahouse.work.end）從玄關 (-3.0, 4.2) 搬到前院冠木門前 (-3.0, 8.0)——出口搬到冠木門以後，舊的點離出口 5.1 m，`wz_work_spots_unit` 第 3 項「≤ 3 m」不過。
  2. `tests/wz_shops_unit.js` 第 3 項：原本是「前院 (0,7.9)、(3,8.8) **走不到**」，改成「從冠木門**走得到**」（前院就是 AA_656 要開的）。(3,8.8) 貼著老樟樹的阻擋，人站不進去，改用 (2.6,8.8)。緣側邊緣不能直接上下（只有沓脫石）在 `wz_teahouse_yard_unit.js` 檢查。**這是改規格，不是放寬**：請 LAWWW 看過再收。
- **單元測試**：會讀 wz_shops_layout 或提到 teahouse 的 72 支（`grep -l "teahouse\|wz_shops_layout" tests/*.js`，扣掉 pg_harness），在 3424d8e66＋patch 上**全部通過**。上一份 patch 只跑了一半，剩下的就是上面兩支 FAIL。
- **和 AA 的新室內（b5bdadcec，一盞 v1b）一起渲染**：`yard_x_aa_v1b.jpg`。玄關兩階（前院 −0.42 → 土間 −0.24 → 玄關 −0.12 → 室內 0）接得上。AA 模型玄關東側木板有兩條黑縫（`aa_v1b_black_slots.jpg`），已請 AA 修。
- 室內用 AA 的 yizhan.glb（layout 2）；我這邊 `wz_shops_interior.py --no-garden` 的舊室內不再輸出。

## 已完成
- `tools/blender/env_second/wz_teahouse_yard.py` → `assets/models/env/second_ai/wz_teahouse_yard.glb`（5.6 萬三角形）：前院地面（y −0.42）、碎石庭、踏石、玄關前石板土間（−0.24）、緣側前沓脫石（−0.21）、緣側裙板與束、冠木門＋「一盞」木牌＋門燈、灰泥紅磚柱牆、四つ目垣、建仁寺垣、老樟樹、春日石燈籠、景石、杜鵑、蕨、甕、竹掃把、暖簾、提燈、柱上木牌；YARD_EAVE（簷）、YARD_ROOF（寄棟瓦屋頂）只在玩家在前院時顯示；牆外人行道、馬路、對面公寓。
- `wz_shops_interior.py --shop teahouse --no-garden`：舊室內拿掉前院（前院改到上面那個 GLB）。**還沒輸出正式檔**（現在的 wz_teahouse_interior.glb 照舊，有前院）。
- `yard_patch_c7eb109d4.patch`（接開發分支 c7eb109d4）：wz_shops_layout.js（yard 高度、冠木門開口、出生點與出口改到冠木門、前院擋住的範圍換成擺設）、zones3d.js（teaYard）、assets3d.js（bldg.wz_teahouse_yard）。
- `wz_teahouse_yard_unit.js`：修改後 ALL PASS（26 項）；修改前（c7eb109d4）9 項 FAIL。

## 還沒做／沒測
- 溫州街那一側的冠木門外觀（wz_jphouse.py）沒改。
- 美術：Blender 渲染（不是遊戲截圖）照參考圖還差：老樹的樹蔭、植物密度、木頭顏色；遊戲內截圖要 PC。
- 出生點、出口、劇情站位最後由 LAWWW 定（AA_656 第 3 節）；AA 的新室內要做到 z 6.2 為止（已通知 AA）。
