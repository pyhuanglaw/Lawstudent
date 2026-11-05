# 阿德 v2.1 same_angle_check 雲端試算（CC-C 11-04 16:2x UTC；**SwiftShader，只當參考**）

- 遊戲截圖：d63fed15e，`cc_ade_v2_shots_probe.py` 的 refcam（14:00），雲端 Chromium（SwiftShader）→ `ade_refcam_1400_cloud.jpg`（1672×941）
- 參考圖：story-planning 的 `wz_ade_ext.webp`（美術參考圖，不是第三方照片）
- 指令：`same_angle_check.py --mode shop --fov 45.7`（BB 的工具）→ `ade_v21_cloud_overlay.jpg`、`ade_v21_cloud_structure.json`
- 數字：消失點差 2.0%（門檻 ≤2%，FAIL 剛好在邊上）、垂直傾斜 0.5° PASS、長寬比 1.777 PASS、detail_gap 11／24 格 FAIL、line_F 0.36（對位後 0.41）、ssim_struct 0.44、最佳對位縮放 0.86、平移 +2.5%／−1.3%、工具建議 FOV 52.2
- 換算核對（BB-C 16:27 要的）：遊戲垂直 45.7°、寬高比 1.7768（探針讀回 cam.fov、cam.aspect）→ 水平 73.65°；Blender 24 mm／36 mm 寬 → 水平 73.74°，一致。shift_y 0.0867 → 投影矩陣第 9 格 +0.308（畫面高度 15.4%）。縮放 0.86 不是換算造成的。
- 正式數字等電腦的 ADE_v2_shots 拍完再算；判定歸 BB。
