# 溫州街橘貓：蹭腳、有骨架的趴、跳下／跳上（WZ-CAT-FLOAT-RUB-1103，LAWWW 11-03 14:16 P2）——LAWWW2

`assets/models/env/second_ai/aa_support/wz_cat.glb`（`tools/blender/env_second/aa_support/wz_cat.py` 重新匯出；970 KB）的 CAT_walk 骨架多了 5 段動畫。原本的四段（cat_walk／cat_idle／cat_sit／cat_sit_idle）、四個姿勢網格、貼圖都不變。

| 片段 | 長度 | 內容 | 遊戲怎麼用 |
|---|---|---|---|
| `cat_rub` | 2 秒循環、原地 | 慢步（配 0.16 m/s）、頭低、往貓的**左邊**（+x）偏，側身拱著往左貼（一循環貼過去一次），尾巴豎直、尾端往前勾 | 玩家在貓的左邊時（`beginRub` 的 dir 讓玩家在左邊那一圈）。**已經自動用**：wzcat3d.js 有 `c.act.cat_rub` 就播 |
| `cat_rub_r` | 同上 | 左右鏡像（玩家在貓的右邊） | 要在 `beginRub` 照 `dir` 選：玩家在右邊那一圈播 `cat_rub_r`（目前程式只會播 `cat_rub`） |
| `cat_lie_idle` | 4 秒循環 | 有骨架的趴姿（獅身像那種：身體放低 0.105 m、前腳往前平放、後腳折在兩側、尾巴貼地繞到右邊）；呼吸、2.4 秒時尾巴尖甩一下、1.1 秒時頭抖一下 | 取代沒有骨架的 CAT_lie（S.breathe）：用 CAT_walk＋這段。原點＝趴的那個面（圓椅座面、地上） |
| `cat_jump_down` | 0.8 秒 | 蹲（0～0.17 秒）→ 跳（彈出、前腳往前下伸、後腳往後蹬）→ 落地緩衝。**位移在 body 骨頭**：前進 0.35 m、往下 0.45 m | 在座面上、面向跳的方向播；播完那一格把貓的位置移到「起點＋前方 0.35、往下 0.45」，接 `cat_idle` |
| `cat_jump_up` | 0.8 秒 | 同上反方向：前進 0.30 m、往上 0.45 m | 在地上面向座面播；播完移到「起點＋前方 0.30、往上 0.45」 |

- 圖：`clips_rub_lie_jump.jpg`（Workbench 算圖：rub、lie_idle、jump_down、jump_up，側面＋斜前方）、`clips_lie_v2_rub.jpg`（尾巴貼地以後的 lie_idle）、`clips_rub_lr.jpg`（cat_rub 和 cat_rub_r）。
  - 跳的那兩段在算圖裡跑到地面下或出畫面，是因為預覽的地面在起點高度；遊戲裡起點在座面上。
- 測試（開發分支 033242ae9＋新 GLB）：`wz_cat_unit`、`wz_cat_walk_unit`、`wz_cat_float_rub_unit`、`aa493_cat_lines_unit` ALL PASS。瀏覽器裡還沒看。
- 沒有耳朵骨頭，「耳朵抖一下」用頭的小幅快速晃動代替。
