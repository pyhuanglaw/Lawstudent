# LAWWW2 交接紀錄（隨時更新；工作階段中斷時從這裡接）

規則見 `WORK_RULES.md` 第 6 節。分工、佇列以 LAWWW 的 `docs/SECOND_AI_HANDOFF.md`、`docs/DUAL_AI_BOARD.md` 為準。

## 目前（2026-10-11 08:40Z）

LAWWW 05:59Z 的佇列：④（已整合）→ ⑧（已整合 `6ff3cbd`）→ **⑤社科院／洞洞館** → **⑥法學院廣場近景小物** → **⑦行道樹** → 後備 ⑨校門、⑩醉月湖、⑪總圖 3F 閱覽區室內。

| 工作 | 狀態 | 分支（遠端） | 最新 SHA | 做完 | 還沒做／沒測 | 能不能整合 |
|---|---|---|---|---|---|---|
| ⑤洞洞館、社科院 | 驗收完成（三輪），`READY_FOR_REVIEW` 前一步：等和 ⑥ 一起的完整回歸 | `claude/second-ai-env-art-wip-pavsoc` | `8c6f1fe`（＝驗收版 `4aa08f1`＋AI-1 `5b21aa0`） | 兩個 GLB、匾額修正（洞洞館入口柱子、社科院石材匾額樣式）、字牌 atlas、VISUAL_REVIEW 第 13 節、8 項測試 PASS | 合併 AI-1 `5b21aa0` 之後的完整回歸（在 ⑥ 的分支上跑，08:40Z 開始） | 不能（回歸跑完、交付訊息送出之後才能） |
| ⑥花台、公告欄、販賣機 | 驗收進行中 | `claude/second-ai-env-art-wip-props6` | `1ad1545`（＝⑥＋⑤＋AI-1 `5b21aa0`） | 模型、接法、Blender 渲染、驗收腳本 | `run_props6_acceptance.sh`（14 項測試＋前後截圖，修改前＝⑤＋AI-1 的 server 8780）→ `drafts/props6_fill.py` → VISUAL_REVIEW 第 14 節 | 不能 |
| ⑦行道樹 | `WORK_IN_PROGRESS` | `claude/second-ai-env-art-wip-trees` | `879d983` | 葉片貼圖、四款樹＋遠景卡片 GLB、記號＋TreeField、單元測試 ALL PASS、Blender 渲染、VISUAL_REVIEW 第 15 節草稿 | 合併我的分支（⑤⑥ 交付後）＋AI-1 最新 → `run_trees_acceptance.sh`（整合測試、效能、全遊戲回歸、前後截圖）→ `drafts/trees_fill.py`；交付時通知 LAWWW：`?nobldg` 那一行加了 `prop.trees`、開機多下載約 1 MB | 不能 |

## 接手的人要知道

- 三個 WIP 分支都是從 `claude/second-ai-env-art` 分出來的；交付時 merge 回 `claude/second-ai-env-art`（merge，不 rebase），再通知 LAWWW 用那個 merge commit 整合。
- ⑤ 的驗收用工作目錄 `/home/user/pav_wt`（server 8780）、⑥ `/home/user/props_wt`（8781）、⑦ `/home/user/trees_wt`（8782）；容器重開後這些目錄不在了，從 WIP 分支 `git worktree add` 回來即可。
- 截圖和整合測試的 PNG 不進 checkpoint（重拍得出來）；交付時轉成 WebP 再進 repo。
