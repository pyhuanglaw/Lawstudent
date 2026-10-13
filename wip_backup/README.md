# wip_backup：只在本機分支上的半成品，備份到開發分支（遊戲不會讀這個資料夾）

2026-10-11 使用者訂的「緊急保存規則」（D45）：工作階段可能隨時因額度中斷，所有成果都要能從 GitHub 找回來。
工作階段只能 push 自己的開發分支（`claude/confident-ritchie-8rwh7t`），所以還沒合併的本機分支用 **git bundle** 備份在這裡。
**這些都是 WORK_IN_PROGRESS：保存不等於完成、不等於可以發布。**

| 檔案 | 本機分支 | 最新 commit | 內容 | 狀態 |
|---|---|---|---|---|
| `dorm-hall.bundle` | `wip/dorm-hall` | `bf750b4` | 宿舍走廊（D44）：新區域 `dorm_hall`（src/dorm3d.js、src/data/dorm_layout.js）、Blender 正式模型（tools/blender/dorm_hall.py → assets/models/env/dorm_hall.glb）、窗景拍攝腳本（tools/shots/dorm_views.py）、測試（tests/flow_dorm_hall.py、nav_buildings_unit 宿舍段） | WIP：導航單元測試 17 項通過；**瀏覽器流程測試、窗景照片、VISUAL_REVIEW 還沒做**；不可合併進要發布的版本 |

還原（在 repo 裡，開發分支已經 fetch 過）：
```bash
git fetch wip_backup/dorm-hall.bundle wip/dorm-hall:wip/dorm-hall   # 需要的前置 commit（79e1fed、3c9e02f）都在 origin 的開發分支上
git worktree add <資料夾> wip/dorm-hall
```

- `wancai-stairs.bundle`（2026-10-11 10:04 UTC 緊急保存）：本機分支 `wip/wancai-stairs`（`8b08c61`，萬才館第二階段早期版本；內容已用其他 commit 整合進開發分支，這裡只是備份）。還原：`git fetch wip_backup/wancai-stairs.bundle wip/wancai-stairs:wip/wancai-stairs`。
- `dorm-hall.bundle` 10:04 UTC 重新建立（同樣是 `bf750b4`，宿舍走廊 WIP，還沒在瀏覽器實測，不可合併進要發布的版本）。
- `v96-rc2.bundle`（2026-10-13 22:30 UTC）：v9.6 發布候選 2，本機分支 `rel/v96-rc2`（`93877e9`＝`5f66b67`＋`f9b9017` 只改文件＋互動按鈕修正）。前置 commit `5f66b67` 在 origin 的開發分支上。還原：`git fetch wip_backup/v96-rc2.bundle rel/v96-rc2:rel/v96-rc2`。**發布回歸跑完、全部通過以前不是可以發布的版本。**
- `v96-rc3.bundle`（2026-10-13 22:48 UTC）：v9.6 發布候選 3，本機分支 `rel/v96-rc3`（`a6c3d1a`＝候選 2 `93877e9`＋要離開的人不擋出口、補人時段剩不到 15 分鐘的不補）。前置 commit `5f66b67` 在 origin 的開發分支上。還原：`git fetch wip_backup/v96-rc3.bundle rel/v96-rc3:rel/v96-rc3`。**發布回歸跑完、全部通過以前不是可以發布的版本。**
