# LAWWW2 暫存工作目錄的備份（11-04 07:4x，使用者：用量 93%，做到一半的先放 GitHub）
- 每個檔名＝暫存的 detached worktree＋它的基準 commit，內容是 `git diff`（不含 GLB／圖片：都能用腳本重建，正式的 GLB 已經在這個分支上）。
- 這些都是**已經交件的 patch 在開發分支上試套的工作目錄**，正式交件版本在：
  - devwt_s：SPAWN-EXIT-1104（7940369f0）；devwt_x：新生南路（db7679c01 等）；spwt：舊的試套目錄；
  - devwt_y：一盞前院 → `wip/wz_yizhan_1104/yard_patch_3424d8e66.patch`；
  - glw：公館打烊光暈＋量法一致 → `wip/gg_cards_1104/gg_glow_shoplit_patch_d432de8ba.patch`、`gongguan_glb_integration_measure_d432de8ba.patch`。
- 還原：`git worktree add --detach <dir> <基準>` 之後 `git apply <檔>`。
