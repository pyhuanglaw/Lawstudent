# LAWWW2 交接紀錄（隨時更新；工作階段中斷時從這裡接）

值班登記：帳號 A｜LAWWW2｜session_01AC1WVgJSmoJK1uRsPK2Zn1｜分支 claude/second-ai-env-art｜接班基準 `1f20126`（＋合併 LAWWW `cb399ea`）｜2026-10-13 12:35 UTC（使用者：「我回來了，請同步 GitHub 最新進度，接續工作。」）
上一班：帳號 A｜LAWWW2｜session_01AC1WVgJSmoJK1uRsPK2Zn1｜最後 commit `1f20126`（2026-10-11 10:14 UTC）｜正常交班；中間沒有人接班（LAWWW2-B 沒有建立，遠端沒有別的 LAWWW2 分支）
交班紀錄：2026-10-11 10:13 UTC 交班（`1f20126`）→ 2026-10-13 回到帳號 A。
使用者 2026-10-13：帳號 B 暫時沒有開，從上次停下來的地方接著做。

**2026-10-13 21:3xZ（最新）**：這一輪交付三樣（都只有新檔、`MODEL_READY` 或素材，**都還沒接**）：①坐姿替身＋門模組 `167fc2d`（VISUAL_REVIEW 第 24、25 節）②鏡頭穿牆第二輪重拍 `815fdaa`（LAWWW `068f671`＋`8234015`，在 `9884d29` 乾淨 checkout：36 例穿牆 0；貼到頭頂上方放開 3 秒後 10→0；公告欄黑塊沒了；聽眾第一個畫面站著 16→0，測試在修改前失敗、修改後通過；CAMERA_WALLS 第 6 節）③博雅窗外景 `c15a648`（`assets/models/env/views/boya_{south,2f_south,2f_north,north}_{day,night}.webp`，遊戲畫面不是照片；一樓北面窗建議等 R2 把 103 搬走；VISUAL_REVIEW 第 26 節）。21:3xZ 傳 LAWWW P2（窗景接法＋下一項），DELIVERED、等 ACK；LAWWW 在準備 v9.6（候選 `5f66b67`），我的東西進下一版。**下一步**：照使用者 U6 分工做**桌上小物**（筆記本、筆、筆電、手機、水杯、書、法典；instancing、一個材質、和 furniture_study 同一套原點約定；補坐姿替身缺的筆記本與手機）；LAWWW 排別的就照它的。R2 核對等使用者的平面圖／照片（沙盒打不開 ntu.edu.tw、wikimedia）。本機：`/home/user/fix2_wt`＝LAWWW `9884d29`（伺服器 8797）、`/home/user/fix_wt`＝`dae1da3`（8796；有沒 commit 的 GLB 複本，**不要 commit**）。

**2026-10-13 20:4xZ**：LAWWW 20:02Z ACK 分工（U6）、R2 等平面圖、坐姿替身用「預先烤配色、每種一個網格」、門模組排在坐姿替身之後；我回了 ACK＋更正（遊戲裡還有關著的 103）。這一輪做完：①**坐著的聽眾替身** `seated_figures.glb`（`MODEL_READY`，VISUAL_REVIEW 第 24 節）：只用路人底模 npc_f1/f2/m1/m2；聽講／抄筆記／滑手機×2 配色＝24 種外型×LOD0（約 1,500）／LOD1（約 350）；和講堂椅同一個原點；一個材質（2048×1024 貼圖集＋自發光 0.3）；工具 `seated_figures.py`、`uvpack.py`（自己打包 UV：背景模式的打包只用到 1–8%）、`glb_share_geometry.py`（兩種配色共用頂點）②**教室門模組**（在 `furniture_study.glb`：`door_frame`、`door_leaf_open`（貼牆）、`door_leaf_closed`、`door_plate`；第 25 節）。遊戲內都是本機注入的原型截圖（`/home/user/fix_wt` 有沒 commit 的 GLB 複本）。**注意**：20:03Z 左右容器重開過，本機伺服器都停了（8796 已重開；8793 等沒有）。**下一步**：等 LAWWW 回覆 → 博雅窗景／北面窗建議；LAWWW 修好鏡頭 A／B 後重拍；照片／平面圖拿到後做 R2 核對與外觀比對。

**2026-10-13 19:2xZ**：使用者晚上的決定（照片來源、博雅 R2＋三條件、鏡頭穿牆最優先、101 不先做 400 個人物、整合順序 ①–④、**報告與分工確認之前不開新的外觀**）→ 已轉給 LAWWW（P1，等 ACK）。這一輪做完：①**鏡頭穿牆固定案例** `CAMERA_WALLS.md`（LAWWW `babb8c8`→`dae1da3`：一般 19/24→0/24、門口 2/12→0/12；修改後新問題：貼牆時鏡頭到頭頂上方 10 例、普通門廳公告欄一大塊黑；教室沒有門片）②**檢查報告更新** `FOUR_BUILDINGS_REVIEW.md` 最上面「★ 晚上更新」U1–U6（照片來源取代「沒有照片」、**R2 修正版**：101 挑高 192 席＋102／103 背對背各 80 席＋自習區沿用 LAWWW 第二版（12 小桌＋2 圓桌）、整合狀態五欄、分工）；研究文件也更新 ③**家具模組** `furniture_study.glb` `MODEL_READY`（VISUAL_REVIEW 第 23 節）。**沙盒打不開** ntu.edu.tw、wikimedia：照片比對沒做（要使用者開網域或貼圖）。本機測試目錄：`/home/user/fix_wt`＝LAWWW `dae1da3`（伺服器 8796；**有一個沒 commit 的 furniture_study.glb 複本，不要 commit**）、`/home/user/dev_wt`＝`babb8c8`（8793）。**下一步**：等 LAWWW 回 R2 修正版與分工 → 聽眾坐姿替身（#52）→ 門的模組（如果 LAWWW 排）→ 照片拿到後做外觀比對。

**2026-10-13 18:4xZ**：**新社科院外觀交付**（VISUAL_REVIEW 第 22 節；`campus_socsci.py`；本機測試目錄 `/home/user/soc_wt`＝LAWWW `babb8c8`＋接線，伺服器 8795，**不要 commit**）。LAWWW 18:05Z 回覆檢查報告 a–d：共同＋大一女舍已接（`f3a18d6`）；鏡頭穿牆、門框、椅子 instancing、聽眾坐好才顯示由 LAWWW 修；101 先維持（R2／R1 等方案 A 驗收）；自習區照提案改配置。**我的佇列**：自習雙人桌＋椅、圓桌＋椅、講堂椅模組（`furniture_study.py` 第一版太像方塊，正在改成真的造型：彎管椅腳、有弧度的夾板、圓角）→ 聽眾坐姿替身（LAWWW 的 VRoid 人物、6–8 種）→ 博雅窗景／北面窗建議。普通、博雅新外觀等方案 A。

**2026-10-13 17:2xZ**：使用者轉來 ChatGPT 審查（重點：真實辨識度、室內比例、實際遊玩；第 1–6 點）。做了：在 LAWWW `93b93b5` 的乾淨 checkout（`/home/user/dev_wt`，伺服器 8793，**不要 commit**）實際截圖＋效能＋鏡頭穿牆掃描＋聽眾坐姿檢查＋平面比較圖 → `FOUR_BUILDINGS_REVIEW.md`（PROPOSAL）；整合狀態核對（只有 `f0bab8c` 進了開發分支；我的分支整個合進去沒有衝突）；共同、大一女舍接線 patch `patches/gongtong_freshman_wiring_93b93b5.patch`（`/home/user/patch_wt`＝93b93b5＋patch＋兩個 GLB，伺服器 8794，**不要 commit**）。已傳 LAWWW 兩則 P1（整合順序；檢查結果＋問題 a–d），等回覆。**下一步看 LAWWW 回覆**：它同意整合路徑之前不開新的外觀（使用者第 5 點：避免模型累積沒進可玩場景）；可以做的是講堂椅、自習桌椅 instancing 模組、聽眾坐姿替身（要 LAWWW 同意）。

**2026-10-13 16:5xZ**：**共同教學館外觀＋大一女舍外觀已交付**（VISUAL_REVIEW 第 20、21 節；接線說明 20.5、21.5；LAWWW 接）。新社科院（使用者 2026-10-13：現代台大平行校園）：需求原文 `requests/2026-10-13_新社科院.md`、參考資料與一頁規劃 `research/新社科院_參考資料與規劃.md`（PROPOSAL，等 LAWWW 回可不可以整合、等使用者看）。下一步：LAWWW 回覆社科院規劃 → 社科院圖書館外觀＋大樓外觀（照 LAWWW 16:19Z 的方案：圖書館 x 95–125、z −92～−70；大樓 x 99–123、z −62～−42）→ 普通、博雅外觀（LAWWW 照方案 A 放位置）→ 教學館室內（讀 LAWWW 的 gongtong／putong／boya 配置，教室排距 2.0 m）→ ⑦⑨⑩⑪。本機：`/home/user/gt_wt`（臨時工作目錄，zones3d.js 有本機接線＋大樹牆略過，**不要 commit**；伺服器 8792）。每次 checkpoint 都要 ReadNotifications。

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
| ⑬辜先生紀念圖書館室內 | `WORK_IN_PROGRESS`（草稿） | `claude/second-ai-env-art-wip-soclib` | `3b4b201` | `tools/blender/env_second/soclib_layout_gen.py`（30×22×5.6 m：樹狀柱、閱覽長桌 4 張 24 座、北／西窗邊座位 33、林間書房 4 組弧形竹書架、入口閘門、服務台、閱報區；格子檢查：65 個座位都走得到）、平面草圖 `drafts/soclib_plan_draft.webp` ；`src/data/soclib_layout.js` 已產生（20 支柱、50 個天窗、導航阻擋 rects／circles）；Blender `soclib_interior.py` 初稿寫好（**還沒執行過**：`/opt/blenv/bin/python tools/blender/env_second/soclib_interior.py -- --preview <資料夾>`，天花板挖洞用 `bmesh.ops.triangle_fill` 要確認洞有沒有挖出來） | 跑腳本修錯 → 渲染（`render_cycles.py`＋preview 的 views.json）→ 看圖調整（柱子的密度、書架的排法）→ GLB 規格 → 交給 LAWWW 接線（新區域、導航用配置的 nav、座位） | 接著做 |
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
