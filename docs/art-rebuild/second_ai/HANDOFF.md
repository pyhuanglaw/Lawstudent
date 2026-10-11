# LAWWW2 交接紀錄（隨時更新；工作階段中斷時從這裡接）

值班登記：帳號 A｜LAWWW2｜session_01AC1WVgJSmoJK1uRsPK2Zn1｜分支 claude/second-ai-env-art｜接班基準 —（從頭值班）｜2026-10-10 15:39 UTC
上一班：無（帳號 B 還沒建立；跨帳號接班制度 D49，總入口在 LAWWW 分支的 `docs/AI_SESSION_HANDOFF.md`）

規則見 `WORK_RULES.md` 第 6 節。分工、佇列以 LAWWW 的 `docs/SECOND_AI_HANDOFF.md`、`docs/DUAL_AI_BOARD.md` 為準；跨帳號接班照 `docs/AI_SESSION_HANDOFF.md`（D49）。**LAWWW 的訊息可能「顯示送達、但沒出現在對話裡」**：每次 checkpoint、每次交付前都 `git fetch` LAWWW 的開發分支讀看板。

## 目前（2026-10-11 09:55Z）

**LAWWW 07:30Z、07:52Z、09:21Z 的三則 send_message 沒有出現在我的對話裡**（09:47Z 讀 LAWWW 看板才看到；09:48Z 回 ACK、請 LAWWW 補 ⑫ 尺寸表與 ⑭ 分派內容）。教訓：每次交付前、每次 checkpoint 都要 fetch LAWWW 的開發分支讀看板，不能只等訊息。

LAWWW 07:30Z 的佇列：**店家窗景（插隊）** → ⑤ → ⑥ → ⑦ → ⑨ → ⑩ → ⑪；07:52Z 加 **⑫ 騎車用的腳踏車**（排在店家窗景之後，尺寸表還沒收到）；`6011a8a` 提到 ⑭ 118 巷街景（分派內容還沒收到）。
我這邊的順序：店家窗景 → ⑤⑥ 交付（合併 `a46f944`＋回歸）→ ⑫ → ⑦ → ⑨ → ⑩ → ⑪。

| 工作 | 狀態 | 分支（遠端） | 最新 SHA | 做完 | 還沒做／沒測 | 能不能整合 |
|---|---|---|---|---|---|---|
| 店家窗景（cafe、cvs、noodle、bookstore 白天／晚上） | 拍攝中 | `claude/second-ai-env-art`（已合併 AI-1 `a46f944` → `399f65e`） | — | `tools/shots/shop_views.py`（照 `window_views.py`＋射線量景深）、`fast_shots.py` 加 `post` | 8 張照片、景深數字、傳給 LAWWW | 拍完確認就交 |
| ⑤洞洞館、社科院 | 驗收完成，等 ⑤⑥ 合併 `a46f944` 後的回歸 | `claude/second-ai-env-art-wip-pavsoc` | `8c6f1fe` | 兩個 GLB、匾額修正、VISUAL_REVIEW 13 | — | 和 ⑥ 一起交 |
| ⑥花台、公告欄、販賣機 | 收尾：販賣機改亮、重拍完；合併 `a46f944`（`23733b4`） | `claude/second-ai-env-art-wip-props6` | `fa626b9` | 模型、接法、Blender 渲染、合併 `5b21aa0` 後的完整回歸全部通過（花台修正後） | 合併 `a46f944` 後重跑 `run_props6_acceptance.sh tests`、`props6_fill.py`（VISUAL_REVIEW 14） | 回歸通過後交 |
| ⑦行道樹 | `WORK_IN_PROGRESS` | `claude/second-ai-env-art-wip-trees` | `879d983` | 葉片貼圖、四款樹＋遠景卡片 GLB、記號＋TreeField、單元測試 ALL PASS、Blender 渲染、VISUAL_REVIEW 15 草稿 | 合併我的分支（⑤⑥ 交付後）＋AI-1 最新 → `run_trees_acceptance.sh` → `trees_fill.py`；ASSET_INVENTORY、LICENSES | 還不能 |
| ⑫腳踏車（騎車用、零件分開） | 等 LAWWW 補尺寸表 | — | — | — | 全部 | — |

`claude/second-ai-env-art-wip-props` 是 09:46Z 推錯名字多出來的（和 `-wip-props6` 同一個 commit），刪除被遠端拒絕，忽略即可。

## 接手的人要知道

- 三個 WIP 分支都是從 `claude/second-ai-env-art` 分出來的；交付時 merge 回 `claude/second-ai-env-art`（merge，不 rebase），再通知 LAWWW 用那個 merge commit 整合。
- ⑤ 的驗收用工作目錄 `/home/user/pav_wt`（server 8780）、⑥ `/home/user/props_wt`（8781）、⑦ `/home/user/trees_wt`（8782）；容器重開後這些目錄不在了，從 WIP 分支 `git worktree add` 回來即可。
- 截圖和整合測試的 PNG 不進 checkpoint（重拍得出來）；交付時轉成 WebP 再進 repo。
