# 第二個 AI 交接文件（環境美術工作階段）

- 建立：2026-10-10 晚上（台灣時間），由第一個 AI 寫（工作階段「LAWWW」）。依據是使用者的〈雙 Claude Code 工作階段分工與即時協作指令〉。
- 這份文件給第二個 Claude Code 工作階段（環境美術）。新的工作階段讀完這份＋`CLAUDE.md` 就可以開工，不必再問使用者專案背景。
- 分工有變動時由第一個 AI 改這份文件，並用訊息通知第二個 AI。工作看板在 [`docs/DUAL_AI_BOARD.md`](DUAL_AI_BOARD.md)。
- **名稱（使用者 2026-10-10 晚上確定）**：第一個 AI＝**LAWWW**（主要負責人、工作分配者、整合者、唯一的正式發布者）；第二個 AI＝**LAWWW2**（環境美術協作組，以 LAWWW 的正式分派為準）。另外兩個工作階段 **AA、BB 只和使用者討論劇情，不參與開發**，不用回應它們的分工請求。
- **2026-10-10 晚上更新**：使用者訊息優先、雙 AI 訊息要讓使用者看得到、ACK 與 P0／P1／P2 規則（第 10 節，CLAUDE.md「USER MESSAGE PRIORITY」、D40）；LAWWW2 的九小時工作佇列（第 3 節開頭）。

---

## 0. 一分鐘摘要

| 項目 | 內容 |
|---|---|
| 你是誰 | **第二個 AI「LAWWW2」**：環境美術（Blender 場景資產＋把自己的場景接進遊戲）。工作階段 `session_01AC1WVgJSmoJK1uRsPK2Zn1`（標題「遊戲協作專案」，2026-10-10 12:45Z 開） |
| 你的分支 | **`claude/second-ai-env-art`**，基底是第一個 AI 的開發分支。如果平台另外指定了分支，以平台為準，並用訊息告訴第一個 AI 分支名稱 |
| 第一個 AI | **LAWWW**：工作階段 `session_01Eds6msqpsuzNEw98sdw8JX`，分支 `claude/confident-ritchie-8rwh7t`（開發主線）。負責人物、核心系統、霖澤館、萬才館、整合、發布，也負責分派 LAWWW2 的工作（使用者 2026-10-10 授權） |
| 通訊 | claude-code-remote MCP 的 **`send_message`**（`session_id` 填對方的 ID），2026-10-10 已確認雙向可用。用名稱定址的 `SendMessage` 到不了對方 |
| 目前任務 | **兩點半 Café**（外觀＋`cafe` 室內，Blender 正式模型接進遊戲）→ 溫州街近景 → 後備 A 街道道具 → 後備 B 獨立室內 → 公館、校園地標。佇列見第 3 節開頭 |
| 絕對不能做 | 改 `main`、發布 GitHub Pages、force push、改劇情／角色設定／存檔格式、改第一個 AI 擁有的檔案（第 5 節）、標 `ART_APPROVED` |
| 交付 | 一次完成一個場景，做到遊戲內可驗收 → push 自己的分支 → `send_message` 通知第一個 AI（commit、檔案、測試、截圖）→ 第一個 AI merge 進開發分支、跑回歸測試 → 接著做下一個 |

---

## 1. 遊戲目前的狀態（2026-10-10）

- **線上版（`main`）**：**v9.4**（`6b9c0dc`，2026-10-10 14:47:16Z 部署；上一個穩定版 v9.3 第 25 批 `cd52bab`）。下一次發布最早 17:47:16Z（兩次發布至少相隔三小時）。發布紀錄：[`docs/RELEASES.md`](RELEASES.md)。
- **人物**：沈以安、祐廷的 Blender 版第一版完成（`READY_FOR_ART_REVIEW`），網址加 `?blchar` 才載入，預設仍是 VRoid 加工版。
- **開發分支 `claude/confident-ritchie-8rwh7t`（v9.4，還沒發布）**：
  - 多樓層導航（D36）。
  - 霖澤館外觀、室內（大廳、樓梯、電梯、二樓）、201 階梯教室都換成 Blender 正式模型（`tools/blender/linze_*.py`、`classroom_201.py` → `assets/models/env/*.glb`）。
  - 長椅坐姿修正、霖澤館鏡頭遮擋修正。
  - 人物改用 Blender 製作，示範角色沈以安正在做（`tools/blender/char/`）。
  - 發布候選 `47b2043`：發布前測試做到一半。
- **美術規範（強制）**：`CLAUDE.md` 的「MANDATORY 3D ART PRODUCTION RULES」（D38）、[`docs/art-rebuild/ART_DIRECTION.md`](art-rebuild/ART_DIRECTION.md) 第 12 節。
  - 正式近景用 Blender＋合法 PBR＋GLB。three.js 方盒、canvas 隨機貼圖只能當碰撞、導航、遠景、備用。
  - 驗收狀態依序：`BLOCKOUT` → `MODEL_READY` → `INTEGRATED` → `FUNCTIONAL_VERIFIED` → `READY_FOR_ART_REVIEW`。`ART_APPROVED` 只有使用者能給。
- **資產盤點**：[`docs/art-rebuild/ASSET_INVENTORY.md`](art-rebuild/ASSET_INVENTORY.md)，列出每個程序化資產的分類與升級做法。
- **劇情暫停**：使用者之後會大幅重寫四年主線、人物關係、事件與部分玩法。
  - 現在不改、不擴充、不刪除劇情。
  - 環境美術盡量跟劇情脫鉤：店門、座位、互動點的位置維持原樣，故事重寫後還能用。
- **測試制度（永久）**：[`docs/TESTING.md`](TESTING.md)（D34）。
  - 真實玩家流程不用 `?turbo`、不瞬移。
  - 分清楚 Playwright 手機模擬和 iPhone 真機。
  - 不用「N 項全部通過」代替畫面驗收。

---

## 2. 全遊戲未完成工作清單（以 2026-10-10 開發分支 `08d0841` 為準；已完成的不列）

負責人：**AI-1**＝第一個 AI，**AI-2**＝第二個 AI，**使用者**＝要使用者提供或決定。

### A. 人物美術

| 工作 | 負責 | 狀態 |
|---|---|---|
| 沈以安 Blender 正式模型：臉、頭髮、服裝 → 整合 → 遊戲用 VRM → 走／站／坐／樓梯／表情／彈簧骨的遊戲內驗收 → 三方比較 | AI-1 | 進行中。臉第二版、髮第二版已 push（`232ebdc`、`08d0841`），服裝製作中 |
| 把沈以安的流程整理成六位角色共用的 Blender 人物生產線（`tools/blender/char/common.py`、`vrm_finish.py` 已有） | AI-1 | 沈以安完成後 |
| 祐廷、林芷若、陳語彤、高子晴、溫書瑀的 Blender 正式模型（一次一位） | AI-1 | 尚未開工。VRoid 加工第一輪已在遊戲裡，等使用者確認方向 |
| 阿哲、教授等重要 NPC，以及路人底模的款式 | AI-1 | 之後 |
| 動作：開門、轉身、坐下起身細修；Mixamo 動畫授權疑慮（要換成可再散布的動畫） | AI-1 | 之後 |
| 2D 立繪：表情、服裝、高解析度、NPC | 使用者（外部素材） | MISSING_EXTERNAL_ART（`docs/MISSING_EXTERNAL_ART.md`） |
| 人物與場景整體風格一致（參考圖 07） | AI-1＋AI-2 | 持續 |

### B. 建築與場景美術

| 工作 | 負責 | 狀態 |
|---|---|---|
| 霖澤館剩餘：夜間暖色玻璃重拍、Blender 渲染圖、玻璃反射、天花板／入口／窗／門框細節、201 窗外景與設備、玻璃電梯 Blender 化、三樓以上 | AI-1 | 部分進行中（WIP patch 在 AI-1 的暫存區） |
| 萬才館第二階段：Blender 正式模型＋可以走的弧形大樓梯＋二樓平台與陽台（依賴多樓層導航與校園區塊） | AI-1 | 尚未開工 |
| **兩點半 Café**：外觀＋室內 | **AI-2** | **進行中（第一項）** |
| **溫州街近景**：日式老屋、小公園、巷弄公寓立面（鐵窗、冷氣、雨遮、磁磚）、紅磚人行道、電線桿、路名牌、反光鏡 | **AI-2** | 第二項 |
| **街道道具 Blender 化**：機車 2–3 款、腳踏車、行道樹（樟樹、榕樹近景）、盆栽、路燈（燈頭位置 (0, 3.95, 0.75) 不能動）、長椅；Instancing＋遠景簡化 | **AI-2** | 第三項 |
| **公館近景**：南側騎樓店面模組、捷運出口、往溫州街的巷口 | **AI-2** | 第四項 |
| **獨立室內**：便利商店（`cvs`）、麵店（`noodle`）、書店（`bookstore`）、宿舍（`dorm`）＋家具組 | **AI-2** | 第五項 |
| 校園地標：總圖、行政大樓、文學院、傅鐘、校門、洞洞館、社科院 | 先由 AI-2 做 Blender 模型，AI-1 接進校園（校園區塊是 AI-1 的） | 第六項，開工前雙方協調 |
| 椰林大道：大王椰子 Blender、鋪面 PBR | AI-2 做資產（併入第三項），AI-1 接進校園 | 之後 |
| 總圖閱覽室（`library` 室內）、萬才館大廳（`wancai` 室內） | AI-1（校園建築） | 之後 |
| 地面材質 PBR（柏油維持淺灰 D30、人行道磚、草地） | 溫州街／公館：AI-2；校園：AI-1 | 之後 |

### C. 技術與玩家體驗

| 工作 | 負責 | 狀態 |
|---|---|---|
| v9.4 發布：`zone_transitions` 的 classroom 失敗待查；p0／touch_flow／flow_class_real／flow_linze_floors／save_compat 待跑 → 標記上一版 → 合併 main → 確認部署 | AI-1 | 暫停中（使用者要求先做沈以安），之後恢復 |
| 每個 AI 負責自己區域的導航、碰撞、鏡頭；引擎層級（`engine3d.js`）只由 AI-1 改 | 各自 | 持續 |
| GLB 壓縮評估（Meshopt、KTX2）；目前用 512–1024 px WebP 貼圖 | AI-1 評估，AI-2 照結論做 | 未做 |
| 環境反射 HDRI（PBR 金屬與玻璃需要；目前沒有環境貼圖，金屬度上限 0.45） | AI-1 | 未做 |
| 畫質分級的效能量測（手機） | AI-1 | 未做 |
| iPhone 真機驗證 | 使用者 | 持續待驗證 |
| 存讀檔相容（新欄位要有預設值、舊存檔能讀） | AI-1 | 持續（AI-2 不改存檔格式） |
| legacy alias 清理、三種人物來源並存 | AI-1 | 劇情重寫時一起處理 |

### D. 劇情及遊戲設計

- **暫停**：使用者將重寫四年主線、角色關係、事件、對話與部分玩法。兩個 AI 都不要重寫劇情，也不要擴充還沒定稿的故事。
- 不刪舊劇情、不破壞現有功能。
- 優先做重寫後仍能重用的東西：人物模型、場景、通用互動（坐下、點餐、開門、上下樓梯、電梯、看公告）。

---

## 3. 第二個 AI 的工作佇列（一次一個場景，做到可驗收再接下一個）

**2026-10-10 晚上 LAWWW 正式派給 LAWWW2 的九小時佇列**（做完一項自己接下一項，不必等 LAWWW 回覆；LAWWW 在佇列快用完或收到完成通知時補充）：

| 順序 | 工作 | 備註 |
|---|---|---|
| 目前 | 兩點半 Café 外觀＋室內（第一項） | 已接進 `wenzhou`／`cafe` 區塊（`a72f85d`）。補齊下面的驗收後發「可整合」訊息；17:00Z 前通知、LAWWW merge＋回歸測試通過，就會進下一版 |
| 下一項 | 溫州街近景（第二項） | `tools/blender/env_second/wz_street.py` 已開始 |
| 後備 A | 街道道具的 Blender GLB（第三項） | 資產先在自己的目錄做；換掉 `world3d.js` 的 `W3.lampPost`／`bike`／`bikeRack`／`scooter` 之前先通知 LAWWW（校園也在用） |
| 後備 B | 獨立室內：`cvs` → `noodle` → `bookstore` → `dorm`（第五項） | 開工前發一句「認領 xxx 區塊」就可以開始；`dorm` 改之前跑 `movement_regression` 的 A 段 |
| 其他 | 公館近景（第四項）、校園地標 GLB（第六項） | 公館：認領 `gongguan` 區塊，動到店面時通知 LAWWW 改校園那邊的背景；校園地標：交 GLB＋接法建議，由 LAWWW 接進校園 |
| 整合示範 | 17:30 祐廷與沈以安站在 Café 外（目標圖 07） | Café merge 後由 LAWWW 拍；LAWWW2 可以先提供最好的 Café 外鏡頭（`tools/shots/scene_shot.py` 的 JSON） |

每一項都走同樣的流程：參考圖 → 比例與構造 → Blender `bpy` 建模 → PBR 材質 → GLB → 接進遊戲 → 驗證導航／碰撞／互動 → 三個時段的遊戲內截圖（新舊比較）→ push → 通知 AI-1。

### 第一項：兩點半 Café（外觀＋室內）

**外觀**
- 位置：溫州街區域東端路口，`src/zones3d.js` 的 `wenzhou` 區塊。
  - 現在是 `TK.apartment({w:14,d:13,floors:3,fh:3.2,groundH:3.8,...,ground:{type:'shop',shop:{type:'cafe',...}}})`，位置 `(55.4,0,0)`、`rotation.y=-π/2`，門面朝西。
  - 導航 `nav.blockRect(61.9,0,13,14,0,0)`。
  - 店門互動點 `(54.2, 0)`。
- 店面程式碼：`src/townkit3d.js` 的 `cafeFront`。
- 參考圖：`docs/art-rebuild/references/07_yuting_shen_cafe_dusk_target.webp`（黃昏目標圖，全遊戲人物與場景風格一致性的主要參考）、`04_overview_characters_wenzhou_cafe_ui.webp`、`05_four_heroines_wenzhou_lighting_ui.webp`。
- 要做到：
  - 有厚度的木框玻璃門窗、門把、招牌與支架、雨遮、外牆磁磚或洗石子（PBR）、樓上住家的鐵窗與冷氣。
  - 門口盆栽、A 字立牌。
  - 從窗戶看得到的室內一角：桌椅、吊燈、書架、吧檯。
  - 夜間窗光：材質名稱約定＋`TK.addNight`，寫法參考 `zones3d.js` 的 `attachExterior`。
- 整合方式：照霖澤館外觀。
  - `ASSETS.loadOne(key).then(c=>attachExterior(...))`，套件外觀藏起來，導航與鏡頭碰撞沿用。
  - GLB 載入失敗時回到程序化外觀。

**室內**
- `zones3d.js` 的 `const cafe={...}` 區塊，14 × 12 m、高 3.4 m。
- 要保留的位置：
  - 座位與互動點：`twoTop` 桌、`cafeTable`。
  - 吧檯點餐 `(-2.5,-3.2)`。
  - 出口。
- 整合方式：照 201 教室。
  - `attachRoomGLB(z,g0,fb,root)`：名字含 `WALL_` 的網格是會淡出的牆，glTF extras 的 `dir`＝往室內的法線。
  - 程序化備用模型整組藏起來。
  - `fb` 要先自己 `P3.mergeStatic`，外層合併會跳過有 `userData.dyn` 的群組。

**驗收（都要有，缺一項就標 PARTIAL）**
- 新舊截圖：同角度、同時段 10:00／17:30／20:30。舊版用網址 `?nobldg`（manifest key 要用 `bldg.` 開頭）。
- 拍攝視角：
  - 跟隨鏡頭：從公館走進溫州街看到 Café、站在店門口。
  - 室內：進門、坐下。
- 測試（不要和其他瀏覽器工作同時跑）：
  - `python3 tests/zone_transitions.py`
  - `python3 tests/reachability_all.py --zones wenzhou,cafe`
  - `python3 tests/p0_movement.py`
  - `python3 tests/touch_flow_wenzhou.py`
  - `python3 tests/see_through.py`（如果動到溫州街的樹或電線桿）
- 模型規格：三角形數、貼圖大小、GLB 大小，目標每棟 ≤ 2.5 MB。
- 還沒達到參考品質的地方要寫出來。
- 寫進 `docs/art-rebuild/second_ai/VISUAL_REVIEW.md`，直接嵌入圖片、說明差異。

### 第二項：溫州街近景

- `TK.japaneseHouse` 日式老屋：雨淋板、黑瓦、木窗、院牆。
- 小公園。
- 巷弄公寓立面做成模組（鐵窗、冷氣、雨遮、磁磚、鐵門、信箱），重用到整條巷子。
- 紅磚人行道 PBR。
- 電線桿、反光鏡、路名牌。
- 保留台北辨識度，不要變成日本街景。

### 第三項：街道道具

- 機車 2–3 款、腳踏車、行道樹近景、盆栽、路燈、長椅。
- 用 Blender 做 → GLB → `InstancedMesh` 或 `EXT_mesh_gpu_instancing`，遠景簡化。
- `W3.lampPost`、`W3.bike`、`W3.bikeRack`、`TK.scooter` 的內部換成正式模型；呼叫方式與擺放位置不變。
- 校園也用到路燈和腳踏車，改之前先通知 AI-1。路燈燈頭位置 (0, 3.95, 0.75) 不能動，各區域的夜間光暈照這個位置加。

### 第四項：公館近景

- 南側騎樓店面街（`TK.apartment` 的連續騎樓）。
- 捷運出口（`TK.mrtExit`）。
- 往溫州街的巷口。
- 改公館要跑 `tests/gongguan_layout_nav.py`。店門口座標和 `tests/p0_movement.py` 的出生點要一起看。
- 校門外看得到的公館背景在校園區塊裡（`campusBackdrop`），屬於 AI-1。動到公館店面時通知 AI-1 一起改背景。

### 第五項：獨立室內

- 便利商店 `cvs`、麵店 `noodle`、書店 `bookstore`、宿舍 `dorm`。
- 每間一個 Blender 室內 GLB＋家具組（同款重用）。
- 互動點、座位、出口位置不變。
- 宿舍是玩家每天起床的地方，改之前看 `tests/movement_regression.py` 的 A 段。

### 第六項（之後，先協調）：校園地標

- 傅鐘、校門、總圖、行政大樓的 Blender 模型。
- 校園區塊、`campuskit3d.js` 是 AI-1 的。AI-2 交 GLB＋接法建議，由 AI-1 接進去，或由 AI-1 開放修改窗口。

**做完一項就自己接下一項，不必等使用者或 AI-1 回覆。** 被擋住時記錄原因、通知 AI-1，改做佇列裡下一個不受阻的項目。

---

## 4. 第一個 AI 保留的工作

- 沈以安 Blender 正式模型（第一優先），以及其他五位主角、NPC 的 Blender 重製。
- 人物系統：VRM、骨架、表情、動畫。
  - 檔案：`src/character3d.js`、`src/props3d.js`、`tools/blender/char/`、`tools/vroid_build.py`、`assets/models/char/`。
- 霖澤館（外觀、室內、201）剩餘美術與效能。萬才館第二階段。
- 校園區域：`zones3d.js` 的 `campus`、`linze`、`classroom`、`wancai`、`library` 區塊，`campuskit3d.js`、`building3d.js`。
- 引擎、導航、存檔、遊戲流程：`engine3d.js`、`game3d.js` 等。
- v9.4 與之後的正式發布（只有 AI-1 能發布，兩次發布至少間隔三小時）。
- 兩個分支的最終整合與回歸測試。
- 專案層級文件：`CLAUDE.md`、`PROJECT_DECISIONS.md`、`ART_REBUILD_PROGRESS.md`、`TESTING.md`、`RELEASES.md`、`ASSET_INVENTORY.md`、`VISUAL_REVIEW.md`、`CHARACTER_REVIEW.md`。

---

## 5. 檔案所有權

| 範圍 | 擁有者 | 另一方可以做什麼 |
|---|---|---|
| `tools/blender/env_second/**`（Blender 腳本、自己的工具 lib、工作檔）、`assets/models/env/second_ai/**`（GLB、貼圖）、`docs/art-rebuild/second_ai/**`（進度、VISUAL_REVIEW、截圖） | AI-2 | AI-1 只讀 |
| `src/zones3d.js` 的 `const cafe={...}`、`const wenzhou={...}` 兩個區塊，包括溫州街的建置函式 `buildWenzhou` 與它用到、放在它旁邊的 Café 專用 helper（例如 `attachCafeExterior`、`cafe*`） | AI-2 | AI-1 不改。需要改時先發訊息 |
| `src/zones3d.js` 的 `gongguan`、`cvs`、`noodle`、`bookstore`、`dorm` 區塊 | 認領後歸 AI-2 | 開工前發訊息「認領」，AI-1 回覆後就不碰 |
| `src/zones3d.js` 其他部分：`campus`、`linze`、`classroom`、`wancai`、`library` 區塊、共用 helper（`room()`、`chair()`、`desk()`、`shelfWall()`、`attachRoomGLB()`、`attachExterior()`……）、`ZONES` 表 | AI-1 | AI-2 可以**呼叫** helper，不改它們。需要不同行為就在自己的區塊裡另寫 |
| `src/townkit3d.js`（街道套件 TK） | AI-2 | AI-1 不改。`TK.bgCity`（校園背景用）、`TK.addNight`／`TK.bounce`／`TK.lightPool`（全遊戲共用）的行為要改之前，AI-2 先通知 |
| `src/world3d.js`：`W3.lampPost`、`W3.bike`、`W3.bikeRack`、`W3.scooter` | AI-2（第三項開工時） | 先通知 AI-1（校園也在用） |
| `src/world3d.js` 其他部分 | AI-1 | — |
| `src/assets3d.js`：「第二個 AI 的資產」標記區塊（兩行 `// ====` 註解之間） | AI-2 | AI-2 只在區塊內增減；其他部分是 AI-1 的 |
| `LICENSES.md` 最後的「第二個 AI」小節 | AI-2 | AI-2 只在小節內追加 |
| `docs/DUAL_AI_BOARD.md` | 各自改自己那一節 | — |
| `tests/` 新檔案 | 各自（檔名不重複；AI-2 用場景名開頭，例如 `tests/cafe_*.py`） | — |
| `src/engine3d.js`、`character3d.js`、`props3d.js`、`building3d.js`、`campuskit3d.js`、`game3d.js`、`story3d.js`、`events3d.js`、`adv3d.js`、`social3d.js`、`legal3d.js`、`audio3d.js`、`src/data/**`、`index.html`、`build.py`、`tests/playlib.py`、`tests/release_suite.sh`、`tools/blender/b3lib.py`、`tools/blender/linze_*.py`、`classroom_201.py`、`tools/blender/char/**`、`assets/models/char/**`、`assets/models/env/linze_*`、`classroom_201.glb` | AI-1 | AI-2 不改。需要時發訊息請 AI-1 改。`b3lib.py` 可以 import，或複製函式到自己的 lib |
| 專案文件（第 4 節最後一點） | AI-1 | AI-2 的成果由 AI-1 整合時記進去 |

共用檔案要改時：先 `send_message` 說明要改哪個檔、哪幾行、為什麼，等對方回覆（或對方的進度文件寫明可以）再改。對方正在忙時不必等即時回覆，先做不衝突的工作。

---

## 6. 工具與做法（照專案已經驗證過的流程）

- **Blender**：`bpy` 5.2.2，用無介面的 Python 模組執行。
  - 安裝：`python3 -m venv /opt/blenv && /opt/blenv/bin/pip install bpy==5.2.2 numpy pillow`。
  - 執行：`/opt/blenv/bin/python tools/blender/env_second/<腳本>.py`。
  - 參考腳本：`tools/blender/b3lib.py`（材質、貼圖烘焙、GLB 匯出、`MAX_METAL`）、`linze_exterior.py`（外觀、窗戶 instancing、夜間材質名稱約定）、`linze_interior.py`（`WALL_*` 淡出牆的分組、`fadedir`）、`classroom_201.py`（室內家具 instancing）。
- **材質**：Poly Haven（CC0）。
  - `tools/blender/fetch_polyhaven.py` 下載到 `tools/blender/textures/`。AI-2 的容器連得到 `api.polyhaven.com`。
  - 每個用到的材質都記在 `LICENSES.md` 的「第二個 AI」小節。
  - 遊戲沒有環境貼圖：金屬度上限 0.45，玻璃靠顏色、粗糙度、夜間發光。
  - 柏油維持淺灰（D30）。新的柏油貼圖要加 `userData.asphalt`，入夜才會變暗。
- **GLB 規格**：
  - 貼圖 512–1024 px WebP。
  - 重複物件用 `EXT_mesh_gpu_instancing`，遊戲已支援，霖澤館窗戶、201 椅子都是這樣做。
  - 一棟外觀 ≤ 2.5 MB、一間室內 ≤ 2 MB。超過要說明理由。
- **資產登錄**：`src/assets3d.js` 的第二個 AI 區塊，例如：
  ```js
  'bldg.cafe_exterior':{url:'assets/models/env/second_ai/cafe_exterior.glb', type:'building', lazy:true, source:'本作 Blender 腳本 tools/blender/env_second/cafe_exterior.py（貼圖 Poly Haven CC0）', license:'本作；貼圖 CC0'},
  ```
- **戶外區域要注意**：
  - 導航阻擋（`nav.blockRect`）、鏡頭碰撞（`addCollider`）要和模型輪廓一致。
  - 樹幹、電線桿要標 `seeThrough`（`townkit3d.js` 的 `seeThru()`）。
  - 太陽方位 `sunYaw`（D29）。
  - 改了導航就跑 `tools/dev_scratch/nav_islands.py`，避免出現比人窄的縫。
- **遊戲內截圖**：
  - `tools/shots/scene_shot.py`（JSON 描述讀檔位置、時段、鏡頭）。
  - 共用的手機觸控工具：`tests/playlib.py`（只讀）。
  - 開發伺服器：`python3 -m http.server 8765`（repo 根目錄）。
- **雲端沙盒的 Chromium 是 SwiftShader（1–4 fps）**：回歸測試一次跑一個，不要同時跑別的瀏覽器工作，不然會逾時或誤判。

---

## 7. 美術品質要求（兩個 AI 共同）

- 目標是正式販售的日系生活模擬遊戲質感（Premium Stylized 3D Life Simulation），同時保留台北、台大、溫州街的辨識度。使用者現在最大的不滿是「畫面像廉價 3D 原型」。
- 每個近景都要達到：
  - 正確的比例、輪廓、構造厚度（窗框、門框、雨遮、招牌支架都有厚度）。
  - 材質差異（木、玻璃、石材、金屬、磁磚、植物）。
  - 生活感（盆栽、招牌、冷氣、鐵窗、腳踏車）。
  - 黃昏、白天、夜晚三個時段都好看。
- 不盲目堆面數；手機效能要控制（重用、instancing、遠景簡化）。
- 不能只因為是 Blender 匯出的 GLB 就說達到商業品質。Blender 渲染成功不等於遊戲驗收；不能用 AI 生成的圖冒充遊戲截圖。
- 保留舊版本：程序化備用模型留著，`?nobldg` 可以看舊版。比較圖要附。

---

## 8. 參考圖與資料

- `docs/art-rebuild/references/`：
  - `01` 沈以安設定圖、`02` 祐廷設定圖、`03`／`06` 六人設定。
  - `04` 溫州街 Café 全景＋介面、`05` 四位女主角＋溫州街光影、**`07` 祐廷與沈以安在 Café 黃昏（目標圖）**。
- 使用者的實景照片：
  - 椰林大道、霖澤館、萬才館、教室、法律學院配置圖：使用者在第一個 AI 的對話裡給過，但**沒有存進 repo**。從照片得到的結論寫在 `docs/PROJECT_DECISIONS.md` 的 D23–D31。
  - `docs/history/user_feedback_images/` 只有 iPhone 實機回報截圖。
  - 溫州街、公館、Café 沒有使用者的照片，用參考圖＋台北常見構造。缺的參考圖記在自己的進度文件裡，先照現有描述做第一版，並寫明假設。
- 需求原文：`docs/history/specs/`（20 美術重建、21 多樓層、22 永久美術規範）。

---

## 9. 測試與提交

- 每個場景的最低測試組合寫在第 3 節，另外加上：
  - `node tests/nav_levels_unit.js`（如果動到導航）。
  - 自己的場景測試（例如 `tests/cafe_layout_nav.py`：店門、座位、吧檯走得到，出入口不卡）。
- 測試沒過不能改測試標準假裝成功；Playwright 模擬不是 iPhone 真機。
- commit 訊息用繁體中文，說明玩家看得到的差異。有實質進展就 commit＋push 自己的分支。
- 定期把開發主線 merge 進來，保持接近最新，**用 merge，不要 rebase**：
  ```bash
  git fetch origin claude/confident-ritchie-8rwh7t && git merge origin/claude/confident-ritchie-8rwh7t
  ```
  時機：每開始一個新場景之前，以及 AI-1 通知改了共用檔案之後。

---

## 10. 通訊（事件驅動，不定時問候）

**2026-10-10 晚上使用者訂的永久規則（D40，兩邊都照做）**：
- **讓使用者看得到**：送出時在自己的對話顯示「【雙 AI 通訊｜LAWWW → LAWWW2】」（或反方向）＋內容或忠實摘要＋狀態＋要不要回覆；收到重要訊息時顯示「【雙 AI 通訊｜LAWWW2 → LAWWW｜已收到】」（或反方向）＋摘要＋怎麼處理＋是否已回 ACK。重要訊息一定要真的用 `send_message` 傳。
- **狀態**：SENT（已送出）／DELIVERED（工具確認送達）／ACKNOWLEDGED（對方明確回覆收到）／ACTIONED（對方已照做）。工具只確認送達，所以接收方要主動回 ACK。
- **優先級**：P0 立即（使用者要求先回覆或決策、會破壞對方成果的衝突、緊急暫停合併或發布、線上嚴重錯誤）；P1 在最近的安全工作節點回覆（開工、分工與檔案所有權、交付可整合成果、要改共用檔、發布前確認）；P2 一般進度（可以累積）。不重送同一則訊息催對方。
- **使用者訊息永遠優先**：使用者要求先回覆、先決定、先分工時，下一個可以處理訊息的時點先回，再恢復施工；不可安全中斷的原子操作先完成並保存。
- **備援通道**：`send_message` 不通時，寫進 `docs/DUAL_AI_BOARD.md` 自己那一節並 push，訊息裡寫明是備援；不要因為通訊不通就停工。

- 工具：claude-code-remote MCP 的 `send_message`（`session_id`＝對方的 ID）。另一邊的訊息會以新的一輪送進對方的工作階段。
  - 對方可能正在忙，送達後就繼續做不衝突的工作。
  - 不要重送同一則訊息。
- 對方的工作階段結束、訊息送不到時：
  - 把要說的事寫進 `docs/DUAL_AI_BOARD.md` 自己那一節，加上 push 的 commit。
  - 不要假裝訊息已送達。
- **一定要通知的時機**：
  1. 正式開工（第一次讀完這份文件）。
  2. 要改另一方可能用到的檔案之前。
  3. 完成一個可整合的模型或場景。
  4. 發現共用系統的 bug。
  5. 要 merge 另一方的分支之前。
  6. 合併衝突或測試退步。
  7. 卡住、需要對方幫忙。
  8. AI-1 發布前、發布成功後。
  9. 任一方即將結束或交接。
- **訊息格式**：
  ```
  【AI-2→AI-1｜事件】
  工作：
  修改檔案：
  commit：
  測試：通過／失敗／未測（分清楚）
  需要對方做：
  ```

---

## 11. 交付可整合成果的流程

1. AI-2 在自己的分支完成一個場景：Blender 腳本、GLB、整合程式只在自己的區塊、測試、截圖、`docs/art-rebuild/second_ai/` 的紀錄。
2. AI-2 push，`send_message` 通知 AI-1。
3. AI-1 執行 `git fetch && git merge --no-ff origin/claude/second-ai-env-art`，保留完整歷史。
   - 跑相關回歸測試：`zone_transitions`、`reachability_all`、`p0_movement`、`touch_flow_wenzhou`，以及受影響區域的版面測試。
   - push 開發分支，回覆 AI-2 合併後的 commit。
4. 衝突的處理：
   - 在 AI-1 擁有的檔案：AI-1 解。
   - 在 AI-2 的區塊：AI-1 先問 AI-2，不自己刪對方的內容。
   - 測試退步：AI-1 通知 AI-2，由 AI-2 修自己的部分。
5. 正式發布只由 AI-1 決定，條件見 `CLAUDE.md` 與 `docs/RELEASES.md`。
   - 美術屬性：新場景以 `READY_FOR_ART_REVIEW` 進入發布版本，舊版可以用 `?nobldg` 看到。
   - 方向性的大改（例如整條街風格大變）由 AI-1 判斷：先留在開發分支，等使用者看過再發布。

---

## 12. 使用者不回覆時（睡眠期間）

- 不等使用者看圖。純美術的選擇保留候選版本，寫進自己的 VISUAL_REVIEW，標 `READY_FOR_ART_REVIEW`，然後繼續。
- 不標 `ART_APPROVED`。需要使用者決定的事先記錄，轉做其他獨立任務。
- 不會因為完成一個場景就停，也不會因為對方沒回覆就停。
- 發現對方做了同一件事時，立刻發訊息協調，停止重複的部分。
- 工作階段或平台要停止時：先 commit＋push，把狀態寫進自己的進度文件與看板。不宣稱能突破平台限制。

---

## 13. 給新開的第二個 AI 工作階段的啟動指令（使用者可以直接貼上）

> 你是《法條之外》專案（GitHub `pyhuanglaw/Lawstudent`）的第二個 Claude Code 工作階段，負責環境美術。請先做以下五件事：
>
> 1. `git fetch origin`，讀分支 `claude/confident-ritchie-8rwh7t` 上的 `docs/SECOND_AI_HANDOFF.md` 與 `CLAUDE.md`，照交接文件執行。
> 2. 你的分支是 `claude/second-ai-env-art`。如果遠端已有這個分支，就接著做；如果沒有，從 `origin/claude/confident-ritchie-8rwh7t` 開。如果平台指定了別的分支，用平台指定的，並 merge `origin/claude/confident-ritchie-8rwh7t` 進來。
> 3. 用 claude-code-remote MCP 的 `send_message` 通知第一個 AI（`session_id`＝`session_01Eds6msqpsuzNEw98sdw8JX`）你已開工，告訴它你的工作階段 ID 與分支。
> 4. 從 `docs/DUAL_AI_BOARD.md` 找到目前輪到你的項目，接著做。
> 5. 不改 `main`、不發布、不 force push、不改劇情與角色設定、不改第一個 AI 擁有的檔案。一次完成一個能在遊戲內驗收的場景，做完通知第一個 AI，接著做下一個。使用者睡覺時不要停工。
