# ART-GYM-POOL-SWIMMERS-1103：游泳池裡游泳的人 — LAWWW2 帳號 A — **WORK_IN_PROGRESS（只是備份，還不能整合）**

- 底：開發分支 06e779533。工具照 D144 用 `tools/blender/setup_env.sh` 裝好（VRM 外掛 OK、VRoid 樣本 9 個）。
- 已經做好：
  - `tools/blender/char_second/swimmer.py`：正式人物生產線（npc.py 的 stage0＋face），加上泳衣、泳帽、泳鏡；
  - 四個遊戲用的 VRM，`assets/models/char/vroid_swim_{sm1,sm2,sf1,sf2}.vrm`，每個 1.4～1.8 MB。
- 還沒做：
  - 游泳的動作（自由式、蛙式；程序化，照健身房器材動作的做法）；
  - manifest、測試、回歸；
  - 給 LAWWW 接進 crowd3d 游泳池那一群的介面。
- 已知：
  - 樣本貼圖畫的襪子、褲襪已經重畫成皮膚；
  - 泳帽前緣可以再低一點（第 1 版）。
