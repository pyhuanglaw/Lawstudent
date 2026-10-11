# LAWWW2 交接紀錄（隨時更新；工作階段中斷時從這裡接）

規則見 `WORK_RULES.md` 第 6 節。分工、佇列以 LAWWW 的 `docs/SECOND_AI_HANDOFF.md`、`docs/DUAL_AI_BOARD.md` 為準。

## 目前（2026-10-11 08:00Z 前後）

LAWWW 05:59Z 的佇列：④文學院、校史館（已交付、已整合）→ ⑧公館機車分組（已交付、已整合 `6ff3cbd`）→ **⑤社科院／洞洞館** → **⑥法學院廣場近景小物** → **⑦行道樹** → 後備 ⑨校門、⑩醉月湖、⑪總圖 3F 閱覽區室內。

| 工作 | 狀態 | 分支（遠端） | 最新 SHA | 做完 | 還沒做／沒測 | 能不能整合 |
|---|---|---|---|---|---|---|
| ⑤洞洞館、社科院 | `WORK_IN_PROGRESS`／`CHECKPOINT_SAVED`（驗收快做完） | `claude/second-ai-env-art-wip-pavsoc` | `68fa926` | 兩個 GLB、campus 區塊 ckTag＋載入、字牌 atlas 修正、第一輪 6 項＋第二輪 3 項測試 PASS、Blender 渲染 | 前後截圖（在拍）、VISUAL_REVIEW 第 13 節、合併 LAWWW 最新開發分支後的回歸（打算和 ⑥ 一起跑） | 不能（還沒交付） |
| ⑥花台、公告欄、販賣機 | `WORK_IN_PROGRESS`／`CHECKPOINT_SAVED` | `claude/second-ai-env-art-wip-props6` | `62bfa41`（＋`27e165d`） | 三樣加進 street_props.glb、W3.planter／bulletin／vending 接正式模型、整合測試的檢查、Blender 渲染 | 驗收（`run_props6_acceptance.sh`：⑤ 併進來後一起跑）、前後截圖、VISUAL_REVIEW 第 14 節（`props6_fill.py` 在本機 scratchpad，要搬進 repo） | 不能 |
| ⑦行道樹 | `WORK_IN_PROGRESS`／`CHECKPOINT_SAVED` | `claude/second-ai-env-art-wip-trees` | `7a28254` | 葉片貼圖、四款樹＋遠景卡片 GLB、TK.tree／royalPalm 記號＋TreeField（InstancedMesh LOD）、單元測試 ALL PASS、第一批遊戲內截圖看過 | 整合測試 `street_trees_integration.py`（寫好沒跑）、效能量測、前後截圖、Blender 預覽渲染（已渲染，在本機）、VISUAL_REVIEW 第 15 節；交付時要通知 LAWWW：`?nobldg` 那一行（assets3d.js 標記區外）加了 `prop.trees`、開機多下載約 0.96 MB | 不能 |

## 接手的人要知道

- 三個 WIP 分支都是從 `claude/second-ai-env-art` 分出來的；交付時 merge 回 `claude/second-ai-env-art`（merge，不 rebase），再通知 LAWWW 用那個 merge commit 整合。
- ⑤ 的驗收用工作目錄 `/home/user/pav_wt`（server 8780）、⑥ `/home/user/props_wt`（8781）、⑦ `/home/user/trees_wt`（8782）；容器重開後這些目錄不在了，從 WIP 分支 `git worktree add` 回來即可。
- 截圖和整合測試的 PNG 不進 checkpoint（重拍得出來）；交付時轉成 WebP 再進 repo。
