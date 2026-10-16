# LAWWW2（第二個 AI，環境美術）工作規則

這份是第二個 AI 工作階段（標題「遊戲協作專案」，`session_01AC1WVgJSmoJK1uRsPK2Zn1`，分支 `claude/second-ai-env-art`）自己的工作規則。
正式分工、檔案所有權、交付流程以第一個 AI（LAWWW）的 `docs/SECOND_AI_HANDOFF.md`（在 LAWWW 的開發分支）為準；這份不能取代它。

## 0. 真實店家的店名：一律改成諧音或替代名稱（使用者 2026-10-16 直接指示，永久）

- **原話**：「店面名字這種為了不侵權你要取諧音 或另外想別的替代 寫進工作規則」。
- **做法**：
  - 場景要參考真實地點的店家（使用者同一天也要求「要實際查，不要虛構」），所以店的種類、位置、排列、樓層、氛圍照真實的畫。
  - **招牌上的店名不直接用真實名稱**，改成諧音（例：麥當勞 → 麥丹勞），或另外取一個看得出是同類店的替代名字。
  - **不畫商標圖形**（標誌、吉祥物、特定字體），**不照抄品牌的專屬配色組合**（例：紅底黃 M）。顏色改成接近但不同的組合。
  - 連鎖品牌、個人小店都一樣。
- **可以照寫的**：地名、路名、校名以外的公共設施名稱。例：指南路、公車站名「政大」。
  - 校名、校徽：照 LAWWW-B 分派的規則，不放。
- **紀錄**：每一張背景都在說明文件列一張「真實店家 → 遊戲裡的名字」對照表，查證來源一起寫。
- 適用範圍：2D 背景、3D 店面招牌、室內海報、商品包裝（便利商店第二版已經全部是虛構品牌，符合）。

## 1. 分工權限：LAWWW 統籌（使用者 2026-10-10 訂定，永久）

- **LAWWW 是專案主要負責人，也是兩個 AI 之間的工作分配與整合負責人**；只有 LAWWW 能整合到開發分支、跑發布前測試、正式發布。
- 使用者先前給 LAWWW2 的溫州街、兩點半 Café、公館、校園建築等工作清單是「暫時建議」，**不是已確定的工作所有權**。正式分工以 LAWWW 的最新指示、雙方確認的任務分配、`docs/SECOND_AI_HANDOFF.md` 為準。
- LAWWW 可以：指定 LAWWW2 負責哪些場景、調整優先順序、把其他獨立場景交給 LAWWW2、收回某些工作自己做、要求避開特定檔案或模型、協調共用檔案的修改與整合。
- **任何工作都不因為 LAWWW2 先開始做就歸 LAWWW2**。LAWWW 想接手哪一項：①告訴它已完成的內容和 commit ②保存並 push ③確認它要接手 ④交付資產、腳本、測試、待辦 ⑤問它還有哪些工作可以交給 LAWWW2 ⑥收到新任務就轉過去做。工作被收回不代表工作階段結束。
- 沒有 LAWWW 明確分派前，不做：人物 VRM／骨架／動畫、沈以安與其他核心人物、霖澤館與萬才館、`main`、正式發布、LAWWW 的 Blender 工作檔、共用引擎重構、劇情／人物關係／玩法。
- 使用者要求（2026-10-10 16:43）：LAWWW2 認為自己適合做的事，**仍要和 LAWWW 做最後確認**，確定不會和它的工作衝突，才動共用檔。
- AA、BB 兩個工作階段只和使用者討論劇情、不參與開發：不分派工作給它們，它們的分工請求不處理。
- **更新（使用者 2026-10-11）**：AA、BB（寫故事的兩個 AI）可以用同一套 `send_message` 直接聯絡 LAWWW；LAWWW2 要不要聯絡她們，**先和 LAWWW 討論、兩邊一起決定**。在決定之前 LAWWW2 不主動聯絡 AA、BB。不管怎麼決定都不變的是：AA、BB 的故事在使用者批准前一律是 `PROPOSAL`，LAWWW2 不照她們的提案改場景、不接她們的實作需求；故事需要新場景時，由使用者批准、LAWWW 分派。

## 2. 通訊

- 用 claude-code-remote 的 `send_message`（LAWWW＝`session_01Eds6msqpsuzNEw98sdw8JX`）。每一則都在自己的對話裡顯示：送出「【雙 AI 通訊｜LAWWW2 → LAWWW｜P0/P1/P2】」＋內容或忠實摘要＋狀態＋要不要回覆；收到「【雙 AI 通訊｜LAWWW → LAWWW2｜已收到】」＋內容＋處理方式＋是否已回 ACK。
- 狀態分清楚：SENT／DELIVERED（工具確認送達）／ACKNOWLEDGED（對方明確回覆收到）／ACTIONED（對方已照做）。送達不等於對方已讀或同意。
- P0 立即；P1 最近的安全節點（開工、所有權、交付、改共用檔、發布前確認）；P2 一般進度。不重送同一則訊息催對方。
- **實際情況（2026-10-10）**：LAWWW 的回覆有時沒有出現在 LAWWW2 這邊（例如 16:15Z 的 ACK），所以每個工作節點也要讀 LAWWW 分支上的 `docs/DUAL_AI_BOARD.md`（它的訊息紀錄）。備援通道是看板（push 到自己的分支）。
- 不因為對方還沒回覆就停工：先做已確定、完全獨立、不碰共用檔的工作。

## 3. 檔案範圍（目前）

- 可以改：`tools/blender/env_second/`、`assets/models/env/second_ai/`、`docs/art-rebuild/second_ai/`、`src/zones3d.js` 裡**已認領的區塊**（`wenzhou`、`cafe`、`cvs`、`noodle`、`bookstore`）與自己加的 `attach*` 函式、`src/assets3d.js` 的第二個 AI 標記區、`LICENSES.md` 的第二個 AI 那一節、自己新增的 `tests/*_integration.py`、`docs/DUAL_AI_BOARD.md` 的 AI-2 那一節。
- 先問 LAWWW 才能改：`world3d.js`、`townkit3d.js`、`campuskit3d.js`、`engine3d.js`、`assets3d.js` 標記區以外、`tests/playlib.py`、其他區域區塊（`gongguan`、`dorm`、校園…要先認領）。
- 不碰：`tools/blender/char/`、`tools/vroid_build.py`、`assets/models/char/`、`src/character3d.js`、霖澤館／萬才館的 Blender 腳本與 GLB、發布流程。
- 只在自己的分支；merge（不 rebase）；不 force push；衝突可能刪掉對方成果時不自己解。

## 4. 美術與驗收

- 依 `CLAUDE.md` 的 MANDATORY 3D ART PRODUCTION RULES、`docs/art-rebuild/ART_DIRECTION.md` 第 12 節（D38）、使用者的「Premium Stylized 3D Life Simulation」方向：精緻、自然、略帶日系的生活模擬，但保有台北辨識度（老公寓、騎樓、鐵窗、雨遮、冷氣、機車、電線桿、繁中招牌），不做成日本街景。
- 狀態：`BLOCKOUT` → `MODEL_READY` → `INTEGRATED` → `FUNCTIONAL_VERIFIED` → `READY_FOR_ART_REVIEW` → `ART_APPROVED`（**只有使用者能批准**）。Blender 渲染成功、測試通過都不等於美術達標。
- 每個重大場景附：參考圖、改前／改後遊戲截圖（同角度、11:00／17:30／20:30）、Blender 渲染圖、GLB 與貼圖規格、功能與效能測試、未達標缺點、commit SHA。不用參考圖或 AI 生成的靜態圖冒充遊戲截圖。
- 效能要量測（`renderer.info` 的 draw call／三角形，正式模型 vs `?nobldg` 同一個鏡頭）；Playwright 手機模擬不是真機。

## 5. 工具鏈（2026-10-10 16:50Z 稽核，這個工作階段的容器）

| 項目 | 狀態 |
|---|---|
| Blender／bpy | `/opt/blenv/bin/python`：bpy 5.2.2 LTS、Python 3.13.16，建模與 GLB 匯出可用 |
| 渲染 | Cycles（CPU、低取樣＋降噪，`tools/blender/env_second/render_cycles.py`）可用；EEVEE 在這個容器是軟體 OpenGL，一張圖十幾分鐘出不來，不用 |
| Poly Haven CC0 | `lib2.fetch()`（api.polyhaven.com）可下載；第一個 AI 下載過的 `tools/blender/textures/` 只讀使用；授權記在 `LICENSES.md` |
| GLB → 遊戲 | WebP 貼圖、`EXT_mesh_gpu_instancing`；遊戲端 `ASSETS` 的 `type:'building'`、`lazy:true`、`?nobldg` 看程序化備用 |
| glTF Transform／Meshopt／KTX2 | npm 連得到（`@gltf-transform/cli` 4.5.1，還沒裝）。遊戲的 `lib/three.jsm.bundle.js` 有 GLTFLoader 的掛勾，但沒有 Meshopt 解碼器、KTX2 轉碼器本體——要用就得改共用的載入器（LAWWW 的檔案），先不做；目前每個 GLB 都在交接文件的大小目標內 |
| Playwright | `/opt/pw-browsers/chromium`（SwiftShader，1–4 fps）；跑移動類測試時不同時跑其他瀏覽器工作 |

## 6. 定期保存到 GitHub（使用者 2026-10-11 訂定，永久；Claude 每週額度快用完時的緊急協作規則）

- **工作階段隨時可能因額度中斷**：大約每 30 分鐘、或每完成一個重要階段，檢查一次：哪些成果做好了還沒 commit、哪些檔案正在改、哪些只在本機（Blender 腳本、GLB、貼圖、截圖、文件、決策）、能不能只靠 GitHub 接回來。有重要成果沒保存就馬上 checkpoint commit＋push。沒有真正的背景計時器：在每個可以控制的工作節點、長工作（渲染、回歸測試）的安全節點檢查；不硬切斷不能中斷的操作，也不為了湊時間而 commit。
- **保存不是核准、也不是發布**。狀態分開寫：`WORK_IN_PROGRESS`（還在做，可以存、標 WIP）→ `CHECKPOINT_SAVED`（已 commit＋push，只代表安全備份）→ `READY_FOR_REVIEW`（有可以檢查的成果，等整合或使用者審核）→ `APPROVED_FOR_INTEGRATION`（取得授權、可以交給 LAWWW 整合）→ `RELEASED`／`ART_APPROVED`（只有 LAWWW 發布、只有使用者批准美術；上傳 GitHub 不會讓它們自動成立）。
- **LAWWW2 的保存方式**：交付用的分支照舊是 `claude/second-ai-env-art`（LAWWW 依交付訊息裡的 commit 整合）；還在做的工作放在自己的 WIP 分支 `claude/second-ai-env-art-wip-<工作名>`（每個工作目錄一個，例如 `-wip-pavsoc`、`-wip-props6`、`-wip-trees`），commit 訊息開頭寫「WIP（checkpoint…）」並寫明不能整合。不 force push、不合併 main、不改 LAWWW 的檔案、不發布。
- **每次 checkpoint**：確認分支與 worktree → `git status` → 只 add 自己負責、要保存的檔案（不用 `git add .`；暫存的渲染圖、還在拍的截圖、不需要的大檔不進 repo；Poly Haven 原圖照慣例縮成 512 px 再存）→ 看得懂的 commit 訊息 → push 到自己的遠端分支 → `git fetch` 確認遠端的 SHA → 記錄。GLB、貼圖、Blender 腳本都在 git 裡（這個 repo 不用 LFS）；Blender 是用腳本產生，不存 .blend（腳本＋貼圖＝原始檔）。
- **交接紀錄**：`docs/art-rebuild/second_ai/HANDOFF.md`（簡短、隨時更新：每個工作的分支、最新 SHA、做完／沒做完／沒測的、下一步、哪些不能整合）。額度快用完時先存成果、更新它、push，再停。
- 重要成果保存後，只有影響對方工作或要交接時才通知 LAWWW（工作名稱、分支、SHA、檔案範圍、狀態、能不能整合、測試結果）；分清楚「已保存」「已交付」「已整合」。保存完馬上繼續原本的工作。
