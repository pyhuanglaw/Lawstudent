# Lawstudent 的 Codex Skills 與五職位架構

這是既有 Claude 制度的 Codex 轉接設定。規則入口是根目錄 `AGENTS.md`，六個技能在
`.agents/skills/`，五個角色在 `.codex/config.toml` 與 `.codex/agents/`。
沒有新增遊戲內容、另一套任務帳本或自動發布流程。

**目前只完成設定與唯讀能力驗證。等待使用者批准正式啟動五 AI；不要自行領取遊戲任務、
登記接班、啟動 PC 佇列／排程、合併 main 或發布 GitHub Pages。**

## 有效規則與責任

每次重新 `git fetch` 並執行 `python3 tools/handoff/check_handoff.py duty find`。
不要永久固定 RULE_SOURCE 分支。設定時的查核來源是
`origin/claude/modest-rubin-2lyp7g` 的 `bb8a32765065cc64530791f42aee631e06133b12`，
登記鏈 seq 124，五職位均已交班。這只是本次查核證據，不是未來啟動時的固定值。

原文仍有舊規則，按最新明確修訂解析：D100（AA 全劇情／BB 測試）、D108（LAWWW2
場景程式）、D100a（LAWWW 驗收角色）、D120（BB 驗收場景）、D134（CC 可直接聯絡各職位）、
D143（BB 範圍及最終判定／CC 探針、佇列、證據與初判）。不修改 Claude 原文件。

沿用 `docs/handoff/tasks.json`、`deliveries.json`、`watermarks.json`、`duty.json`、
`wip.json` 與原 outbox／user_asks／snapshots。只在有效值班且正式獲准後按原工具更新；
中央檔只有 LAWWW 寫，其他職位只寫自己的紀錄。

## 已核對的 Codex 支援方式

- 安裝時 CLI 為 `0.167.0-alpha.4`；`codex features list` 的 `multi_agent` 為
  `stable true`。沒有重複啟用旗標，沒有指定或更換模型。
- `AGENTS.md` 是專案指令入口；技能用 `.agents/skills/<name>/SKILL.md`，YAML frontmatter
  包含 `name` 與 `description`。已盤點既有雲端／本機技能，六個名稱未重複，不做全域安裝。
- `[agents.<ROLE>]` 的 `description` 與 `config_file` 是官方設定格式；相對路徑以
  宣告它的 `.codex/config.toml` 為準。角色檔提供 `developer_instructions` 與
  `sandbox_mode = "read-only"`。不以未知欄位設定併發數；併發上限由主機／方案決定。
- CLI 自訂角色與本雲端對話的原生子代理介面不是同一個控制面。本對話的
  `spawn_agent` 只有 task_name/message，沒有 agent_type 選項，所以驗證時明確指定
  worktree、角色 TOML 與 Skills 路徑，讓子代理讀取後 ACK。不能宣稱這會自動套用
  TOML 的 OS 沙盒。支援 agent_type 的 CLI 才可直接選五個自訂角色。
- 同任務主機提供代理派工、等待與即時傳訊；訊息不是跨任務的持久帳本，也不是
  Codex／Claude session 之間的橋接。跨帳號照舊 GitHub 交接，不測休班 Claude 帳號。
- Git worktree 隔離 checkout／index／HEAD；不是容器或 OS ACL。同一主機仍共用
  filesystem、CPU、記憶體與瀏覽器資源，不保證五個瀏覽器同時跑。

官方查核來源（文件網站被環境政策擋下，改讀官方原始碼）：

- <https://developers.openai.com/codex/skills/>
- <https://developers.openai.com/codex/multi-agent/>
- <https://developers.openai.com/codex/guides/agents-md/>
- <https://developers.openai.com/codex/app/worktrees/>
- <https://raw.githubusercontent.com/openai/codex/main/codex-rs/core/config.schema.json>
- <https://raw.githubusercontent.com/openai/codex/main/codex-rs/skills/src/parser.rs>
- 本機 `codex app-server generate-json-schema --experimental --out <暫存目錄>` 所產生的
  `SkillsListParams`、`SkillsListResponse`、`ConfigReadParams`、`ConfigReadResponse`。

官方 main schema 可能比已安裝 CLI 新；以實際 CLI 解析和 loader 回應驗證，不只相信文件。

## 重跑發現與載入驗證

從 repo 根目錄：

```bash
codex --version
codex features list
codex --strict-config app-server --print-startup-config
python3 .codex/tools/probe_skills.py --repo "$(pwd)"
```

probe 只呼叫本機 app-server 的 initialize、skills/list、config/read；不啟動模型，
不修改認證或使用者設定，不輸出完整設定。它用暫存 SQLite/log 目錄並清理；驗證：

1. 六技能均在預期路徑、`scope=repo`、`enabled=true`、無重複及 loader errors。
2. 專案設定層有效且未被忽略，五個角色的 description/config_file 真正進入有效設定。

Codex 會忽略尚未信任的專案設定；在你已審閱並授權設定後，透過 Codex 的專案信任設定
將**這個儲存庫**設為 trusted。信任是每個使用者／機器的設定，不可寫進 repo 自我授權。
本次只增加 `/workspace/Lawstudent` 這一項信任，沒有更動其他全域選項或 auth。
新機器或搬移路徑時需重新確認信任；probe 對 ignored config 會失敗，不會假通過。

本雲端的一般沙盒將使用者 Codex home 設為唯讀，app-server 仍需建立執行期 metadata。
若 probe 報初始化失敗，使用主機提供的正常權限審核機制允許該本機驗證程序建立必要
runtime metadata。不要更換 CODEX_HOME、複製 token、使用 API Key 或放寬整個環境權限。

## 唯讀五代理 smoke

設定必須先在獨立分支 commit；在既有 checkout 執行：

```bash
python3 .codex/tools/smoke_worktrees.py \
  --root /workspace/lawstudent-codex-smoke-UNIQUE \
  --base HEAD
```

目錄必須全新且位於原 checkout 外。工具為 LAWWW／LAWWW2／AA／BB／CC 建立不同的
detached、sparse worktree，只展開根檔案與 Codex 設定／handoff 資料，檢查 SHA、
獨立 Git index 與乾淨狀態；不建立／推送角色開發分支、不修改 duty 或遊戲。
需要其他原文時用 `git show <ref>:<path>` 讀取，不假設 sparse tree 中有全部素材。

主代理在同一批啟動五個唯讀子代理；每則任務指定角色、絕對 worktree、角色 TOML、
專屬 Skill 與 handoff Skill，要求讀完回 ACK、回報角色權責與基準 SHA，禁止寫入。
至少測主→子→主 ACK，及兩個子代理間的帶 nonce 訊息與回覆；最後收斂結果並停止。
不得把這次 smoke 登記為 production task 或完整十四步接班。

## 正式啟動前與寫入交付

使用者批准後，由主代理先跑既有接班程序，確認 Codex 工作階段如何納入有效 duty
帳號／職位與分支。不能自行佔用已登記的 Claude session 或繞過工具的拒絕。
五角色目前預設唯讀；未來根據核准任務配置寫入 sandbox／獨立 worktree，
並在任務訊息及原 `xai` 紀錄中列精確 path grant 和唯一 writer。

| 職位 | 未來可派的寫入範圍上限（仍須精確逐檔授權） |
| --- | --- |
| LAWWW | 整合／系統程式、有效 duty 的中央交接檔；不自行寫故事 |
| LAWWW2 | 3D 資產、美術工具與文件、D108 場景程式；核心檔先協調 |
| AA | 自己的劇情企劃／定稿交付與角色交接檔；不直接改遊戲 |
| BB | 自己的 QA／圖像需求文件、獲派測試檔與交接檔 |
| CC | 自己的 CC 探針／報告／交接檔；獲派 PC queue，不改遊戲 |

`check_scope.py` 需在交付前檢查從派工基準起的 committed、staged、unstaged 及
untracked 變更；只接受精確檔案路徑，禁止路徑逃逸／symlink、保護規則檔與範圍外變更。
`--peer` 可比對平行 worktree 的同檔變更，但它不是鎖，也不取代開工前的唯一 writer
分配。語意正確性、任務身分與 duty 權限仍由原制度及 LAWWW 檢查。

```bash
python3 .codex/tools/check_scope.py --role AA --base FULL_BASE_SHA \
  --allow docs/story_planning/AA_EXACT_DELIVERY.md \
  --peer /absolute/path/to/other-worktree
```

收到交付後依原 OUTBOX_TEMPLATE 記 task／branch／SHA／files／state／remaining／next／
noDirectIntegrate／receiver／ack，LAWWW 逐筆整合。瀏覽器一律用共同 flock 鎖串行；
CC 交初判、BB 最終判定。PC 主機連線與 D143 定期排程尚未啟動，也不屬於本次設定。

本次實際結果與限制見 `VALIDATION.md`。架構與能力驗證完成後停止，等使用者指示。
