# ART-GYM-POOL-SWIMMERS-1103：游泳池裡游泳的人 — LAWWW2 帳號 A — **WORK_IN_PROGRESS（只是備份，還不能整合）**

- 底：開發分支 06e779533。工具照 D144 用 `tools/blender/setup_env.sh` 裝好（VRM 外掛 OK、VRoid 樣本 9 個）。
- 已經做好：
  - `tools/blender/char_second/swimmer.py`：正式人物生產線（npc.py 的 stage0＋face），加上泳衣、泳帽、泳鏡；
  - 四個遊戲用的 VRM，`assets/models/char/vroid_swim_{sm1,sm2,sf1,sf2}.vrm`，每個 1.4～1.8 MB。
- 18:3x 進度：
  - 動作（character3d.js 的 swim_free、swim_breast、C.swimLap）、manifest（char.swim_*）、測試 tests/swim_pose_unit.js 都做好了；
  - 四個人兩種泳式全部 ALL PASS，沒有新動作的版本 FAILED 26。
- 還沒做：
  - 回歸；
  - 給 LAWWW 接進 crowd3d 游泳池那一群的介面。
- 已知：
  - 樣本貼圖畫的襪子、褲襪已經重畫成皮膚；
  - 泳帽前緣可以再低一點（第 1 版）。
