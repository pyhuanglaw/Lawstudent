# WZ-YIZHAN-1104 一盞前院走得進去（LAWWW2 11-04）— WORK_IN_PROGRESS（CHECKPOINT_SAVED，不是交件）

暫停原因：使用者 05:4x 直接交辦溫州街第二批五間（溫州書屋、帝大紅茶、夏日冰菓室、阿忠鮮果、常在洗衣），P0 先做；一盞排在後面。

## 已完成
- `tools/blender/env_second/wz_teahouse_yard.py` → `assets/models/env/second_ai/wz_teahouse_yard.glb`（5.6 萬三角形）：前院地面（y −0.42）、碎石庭、踏石、玄關前石板土間（−0.24）、緣側前沓脫石（−0.21）、緣側裙板與束、冠木門＋「一盞」木牌＋門燈、灰泥紅磚柱牆、四つ目垣、建仁寺垣、老樟樹、春日石燈籠、景石、杜鵑、蕨、甕、竹掃把、暖簾、提燈、柱上木牌；YARD_EAVE（簷）、YARD_ROOF（寄棟瓦屋頂）只在玩家在前院時顯示；牆外人行道、馬路、對面公寓。
- `wz_shops_interior.py --shop teahouse --no-garden`：舊室內拿掉前院（前院改到上面那個 GLB）。**還沒輸出正式檔**（現在的 wz_teahouse_interior.glb 照舊，有前院）。
- `yard_patch_c7eb109d4.patch`（接開發分支 c7eb109d4）：wz_shops_layout.js（yard 高度、冠木門開口、出生點與出口改到冠木門、前院擋住的範圍換成擺設）、zones3d.js（teaYard）、assets3d.js（bldg.wz_teahouse_yard）。
- `wz_teahouse_yard_unit.js`：修改後 ALL PASS（26 項）；修改前（c7eb109d4）9 項 FAIL。

## 還沒做／沒測
- 其他碰到茶屋的現有單元測試（約 20 支）跑到一半被中斷，**結果未知**。
- 溫州街那一側的冠木門外觀（wz_jphouse.py）沒改。
- 美術：Blender 渲染（不是遊戲截圖）照參考圖還差：老樹的樹蔭、植物密度、木頭顏色；遊戲內截圖要 PC。
- 出生點、出口、劇情站位最後由 LAWWW 定（AA_656 第 3 節）；AA 的新室內要做到 z 6.2 為止（已通知 AA）。
