# AA-C 2026-11-14：SHOP-CC0-HELP-1113 兩個 worktree 收尾前的備份

- 磁碟滿了，要刪 scratchpad 的兩個 worktree：
  - `devwt`（detached @ c94f2bf7d3）
  - `dv`（detached @ 01a512595d）
- 刪之前把每個「修改過、沒 commit」的檔，拿 blob 用 `git log --remotes --find-object` 查過：
  - 35 個已經在遠端分支上（4b293fede7、01a512595d 等），不用備份；
  - 下面 6 個在遠端找不到，存在這裡（路徑照原本的）。
- `devwt/tools/blender/env_second/textures/gen/`：
  - l118_self_tags.png、l118_steak_atlas.png、l118_steam.png、l118_view_cafe2.png
  - 程式產生的貼圖，可以重跑產生器得到。最後交給 LAWWW2 的版本，以 b16d452c52／a1e7284dfe 那幾次交件為準。
- `dv/docs/handoff/SHOP_STANDARD_STATUS.md`、`dv/tests/place_gate_coplanar.json`：worktree 裡的小改（diff 在 `dv_text.patch`，11 行增 11 行刪）。
  - 這兩個檔歸 LAWWW。開發分支上的版本以 LAWWW 的為準，這裡只是留底，不要直接蓋回去。
