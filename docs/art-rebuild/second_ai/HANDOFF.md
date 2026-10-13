# LAWWW2 交接紀錄（隨時更新；工作階段中斷時從這裡接）

值班登記：帳號 A｜LAWWW2｜session_01AC1WVgJSmoJK1uRsPK2Zn1｜分支 claude/second-ai-env-art｜接班基準 `1f20126`（＋合併 LAWWW `cb399ea`）｜2026-10-13 12:35 UTC（使用者：「我回來了，請同步 GitHub 最新進度，接續工作。」）
上一班：帳號 A｜LAWWW2｜session_01AC1WVgJSmoJK1uRsPK2Zn1｜最後 commit `1f20126`（2026-10-11 10:14 UTC）｜正常交班；中間沒有人接班（LAWWW2-B 沒有建立，遠端沒有別的 LAWWW2 分支）
交班紀錄：2026-10-11 10:13 UTC 交班（`1f20126`）→ 2026-10-13 回到帳號 A。
使用者 2026-10-13：帳號 B 暫時沒有開，從上次停下來的地方接著做。

**2026-10-13 接班後的進度（最新在這裡；下面的表是交班時的狀態）**：⑤⑥ 已交付（`451d032`）；⑬ 已交付（`f3212c0`）；**法律學院圖書館已交付**（15:1xZ，merge `a9a227a`：GLB 2.77 MB、萬才館的門、窗景、VISUAL_REVIEW 17；READY_FOR_ART_REVIEW，等 LAWWW 整合、使用者看）；四棟參考研究第一、二輪（`7129157`）。**下一步**：⑭ 118 巷（`/home/user/lane_wt`，已合併交付分支，`lane118_fill.py` 改成第 18 節）→ ⑫ 腳踏車（`/home/user/bike_wt`，第 19 節）→ **共同教學館外觀**（LAWWW 規格：中心 (2,33)、ry=π、24×14、北面正門、西側 5 m 木造迴廊；**沒有照片**，已請使用者提供）→ 大一女舍外部（A (-108,68)、B (-78,66)、各 24×12×5 層、2 樓天橋）→ 普通、博雅（等使用者選 A／B）→ ⑦⑨⑩⑪。LAWWW 的訊息會「顯示送達但沒出現在對話裡」——**每次 checkpoint 都要 `ReadNotifications`**（2026-10-13 漏讀 4 則）。

規則見 `WORK_RULES.md` 第 6 節。分工、佇列以 LAWWW 的 `docs/SECOND_AI_HANDOFF.md`、`docs/DUAL_AI_BOARD.md` 為準；跨帳號接班照 `docs/AI_SESSION_HANDOFF.md`（D49）。**LAWWW 的訊息可能「顯示送達、但沒出現在對話裡」**：每次 checkpoint、每次交付前都 `git fetch` LAWWW 的開發分支讀看板。

## 目前（2026-10-11 10:13Z，交班時）

**使用者 10:05Z：週使用量 98%，可能隨時停。下面每一條的遠端 SHA 都用 `git ls-remote origin 'refs/heads/claude/second-ai*'` 確認過；本機五個工作目錄都沒有未提交、未推送的東西。**

LAWWW 09:58Z 的佇列（看板備援）：店家窗景 → ⑤⑥ → ⑬ → ⑭ → ⑫ → ⑦（快好可以先交）→ ⑨ → ⑩ → ⑪。
LAWWW 07:30Z、07:52Z、09:21Z 的 send_message 沒有出現在我的對話裡（09:47Z 讀看板才知道）——**接手的人每次 checkpoint、交付前都要 `git fetch` LAWWW 的 `claude/confident-ritchie-8rwh7t` 讀 `docs/DUAL_AI_BOARD.md`**。

| 工作 | 狀態 | 遠端分支 | 遠端 SHA | 做完 | 還沒做／沒測 | 下一步 |
|---|---|---|---|---|---|---|
| 店家窗景（cafe、cvs、noodle、bookstore 白天／晚上） | 完成，**可整合**（交付訊息要傳給 LAWWW） | `claude/second-ai-env-art` | `f0bab8c` | 8 張 `assets/models/env/views/<名稱>_{day,night}.webp`（1024×512、fov 53.13、11:00／20:30）、`tools/shots/shop_views.py`、景深 `tools/shots/shop_views_depth.json`（中位數／平均：cafe 7.1／11、noodle 9.5／23.5、bookstore 9／16.7、cvs 9.5／24.1 m）、`fast_shots.py` 加 `post` | 景深建議值要 LAWWW 決定（中位數被近處地面拉低；窗戶看到的主要是地平線附近 30–70 m 的街景）；**cafe 方向**：room() 的窗在右牆（+z 側緊貼轉角公寓），所以拍的是店面往西看溫州街，要 LAWWW 確認 | 傳交付訊息（草稿見下）、等 ACK |
| ⑤洞洞館、社科院 | 驗收完成（VISUAL_REVIEW 13） | `claude/second-ai-env-art-wip-pavsoc` | `8c6f1fe` | 兩個 GLB、匾額修正、測試三輪 | — | 和 ⑥ 一起交 |
| ⑥花台、公告欄、販賣機 | 收尾：已合併 ⑤＋AI-1 `8afdece`；販賣機改亮；前後截圖（WebP）、`5b21aa0` 那一輪完整回歸 log（`test_logs/props6_5b21aa0/`，全部通過） | `claude/second-ai-env-art-wip-props6` | `f2fe6ae` | 模型、接法、Blender 渲染、截圖、ASSET_INVENTORY、LICENSES | **合併 `8afdece` 之後的回歸只跑了第一項**（10:07Z 開始、交班時停掉：`street_props_integration` ALL PASS、`campus_glb_integration` 中斷、其他沒跑；`test_logs/props6_8afdece_partial/README.txt`）→ 重跑全部：`bash tools/blender/env_second/run_props6_acceptance.sh docs/art-rebuild/second_ai/test_logs/props6 tests http://127.0.0.1:8781/index.html`（工作目錄開 8781 server）→ `python3 docs/art-rebuild/second_ai/drafts/props6_fill.py`（VISUAL_REVIEW 14）→ merge 進 `claude/second-ai-env-art` → 傳訊息（草稿 `msg_p56` 的內容寫在下面） | 跑回歸、填文件、交付 |
| ⑦行道樹 | `WORK_IN_PROGRESS`：已合併 ⑤⑥（`9b488e0`）、LICENSES／ASSET_INVENTORY 加好 | `claude/second-ai-env-art-wip-trees` | `d7916da` | 葉片貼圖、四款樹＋遠景卡片 GLB、記號＋TreeField（townkit3d.js）、單元測試 ALL PASS、Blender 渲染、VISUAL_REVIEW 15 草稿＋填寫腳本 | 合併交付分支最新 → `bash tools/blender/env_second/run_trees_acceptance.sh docs/art-rebuild/second_ai/test_logs/trees all http://127.0.0.1:8782/index.html`（約 1.5 小時）→ `trees_fill.py` | 驗收、交付（預告：`?nobldg` 那一行加 `prop.trees`、開機預載多 1 MB） |
| ⑬辜振甫先生紀念圖書館室內 | `WORK_IN_PROGRESS`（草稿） | `claude/second-ai-env-art-wip-soclib` | `3b4b201` | `tools/blender/env_second/soclib_layout_gen.py`（30×22×5.6 m：樹狀柱、閱覽長桌 4 張 24 座、北／西窗邊座位 33、林間書房 4 組弧形竹書架、入口閘門、服務台、閱報區；格子檢查：65 個座位都走得到）、平面草圖 `drafts/soclib_plan_draft.webp` ；`src/data/soclib_layout.js` 已產生（20 支柱、50 個天窗、導航阻擋 rects／circles）；Blender `soclib_interior.py` 初稿寫好（**還沒執行過**：`/opt/blenv/bin/python tools/blender/env_second/soclib_interior.py -- --preview <資料夾>`，天花板挖洞用 `bmesh.ops.triangle_fill` 要確認洞有沒有挖出來） | 跑腳本修錯 → 渲染（`render_cycles.py`＋preview 的 views.json）→ 看圖調整（柱子的密度、書架的排法）→ GLB 規格 → 交給 LAWWW 接線（新區域、導航用配置的 nav、座位） | 接著做 |
| ⑭118 巷街景 | 還沒開工 | — | — | — | 照 LAWWW `src/data/lane118_layout.js`（`6011a8a`）做 Blender 街景 | ⑬ 之後 |
| ⑫騎車用的腳踏車 | 還沒開工 | — | — | — | `tools/blender/env_second/bike_ride.py` → `assets/models/env/bike_ride.glb`；節點 frame／fork／wheel_f／wheel_r／crank／pedal_l／pedal_r；**尺寸表我出**（座墊頂、把手握點左右、五通、曲柄長、踏板中心、輪徑、軸距；公尺、車朝 +z、地面 y=0）；側面／45° 渲染＋樞紐說明 | ⑭ 之後 |

### 交班時的遠端 SHA（2026-10-11 10:1xZ，`git ls-remote origin 'refs/heads/claude/second-ai*'` 確認）

- `claude/second-ai-env-art`：這份文件所在的 commit（`git log -1 origin/claude/second-ai-env-art`）——店家窗景（可整合）、交接紀錄、看板
- `claude/second-ai-env-art-wip-pavsoc`：`8c6f1fe`（⑤，驗收完成）
- `claude/second-ai-env-art-wip-props6`：`f2fe6ae`（⑤⑥，合併 8afdece 後的回歸要重跑）
- `claude/second-ai-env-art-wip-trees`：`d7916da`（⑦，驗收沒跑）
- `claude/second-ai-env-art-wip-soclib`：`3b4b201`（⑬，配置＋Blender 腳本初稿，沒執行過）
- 本機沒有沒推送的東西；背景工作（⑤⑥ 回歸）已停掉。

**接班的人第一步**：`git fetch origin --prune` → 讀這份＋LAWWW 分支的 `docs/DUAL_AI_BOARD.md`（有沒有新的分派、ACK）＋`docs/AI_SESSION_HANDOFF.md` → 把要用的分支 `git worktree add` 出來（⑥ 用 8781、⑦ 用 8782 的 http server）→ 照順序：⑤⑥ 回歸 → 交付 → ⑬ → ⑭ → ⑫ → ⑦。店家窗景已經交給 LAWWW（10:07Z 的 P0 訊息），等它 ACK、決定景深與 cafe 方向。

`claude/second-ai-env-art-wip-props`（`fa626b9`）是推錯名字多出來的重複分支，刪除被遠端拒絕，忽略即可。
工作目錄（容器重開就不在了，從遠端分支 `git worktree add` 回來）：交付 `/home/user/Lawstudent`（server 8765）、⑤ `/home/user/pav_wt`（8780）、⑥ `/home/user/props_wt`（8781）、⑦ `/home/user/trees_wt`（8782）、⑬ `/home/user/soclib_wt`。

**要傳給 LAWWW 的交付訊息重點**（如果我沒來得及傳）：
- 店家窗景：merge `f0bab8c`；8 張的路徑、景深數字（上表）、cafe 方向的說明；只動了新檔 `tools/shots/shop_views.py`、`shop_views_depth.json`、8 張 webp、我的 `fast_shots.py`（加 `post`，不影響 window_views.py）。
- ⑤⑥（回歸通過後）：洞洞館 0.14 MB／968 tris、社科院 0.17 MB／1,968 tris；`wzAtlasFaces` 改了（空白填平均色、外擴 2 px、最寬的字牌縮小）；W3.planter／bulletin／vending 開頭換正式模型（萬才館一樓的公告欄也會變）；花台葉片超出導航阻擋（已修）、販賣機太黑（已修）。

## 接手的人要知道

- 三個 WIP 分支都是從 `claude/second-ai-env-art` 分出來的；交付時 merge 回 `claude/second-ai-env-art`（merge，不 rebase），再通知 LAWWW 用那個 merge commit 整合。
- ⑤ 的驗收用工作目錄 `/home/user/pav_wt`（server 8780）、⑥ `/home/user/props_wt`（8781）、⑦ `/home/user/trees_wt`（8782）；容器重開後這些目錄不在了，從 WIP 分支 `git worktree add` 回來即可。
- 截圖和整合測試的 PNG 不進 checkpoint（重拍得出來）；交付時轉成 WebP 再進 repo。
