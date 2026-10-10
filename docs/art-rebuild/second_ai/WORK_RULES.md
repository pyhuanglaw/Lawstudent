# LAWWW2（第二個 AI，環境美術）工作規則

這份是第二個 AI 工作階段（標題「遊戲協作專案」，`session_01AC1WVgJSmoJK1uRsPK2Zn1`，分支 `claude/second-ai-env-art`）自己的工作規則。
正式分工、檔案所有權、交付流程以第一個 AI（LAWWW）的 `docs/SECOND_AI_HANDOFF.md`（在 LAWWW 的開發分支）為準；這份不能取代它。

## 1. 分工權限：LAWWW 統籌（使用者 2026-10-10 訂定，永久）

- **LAWWW 是專案主要負責人，也是兩個 AI 之間的工作分配與整合負責人**；只有 LAWWW 能整合到開發分支、跑發布前測試、正式發布。
- 使用者先前給 LAWWW2 的溫州街、兩點半 Café、公館、校園建築等工作清單是「暫時建議」，**不是已確定的工作所有權**。正式分工以 LAWWW 的最新指示、雙方確認的任務分配、`docs/SECOND_AI_HANDOFF.md` 為準。
- LAWWW 可以：指定 LAWWW2 負責哪些場景、調整優先順序、把其他獨立場景交給 LAWWW2、收回某些工作自己做、要求避開特定檔案或模型、協調共用檔案的修改與整合。
- **任何工作都不因為 LAWWW2 先開始做就歸 LAWWW2**。LAWWW 想接手哪一項：①告訴它已完成的內容和 commit ②保存並 push ③確認它要接手 ④交付資產、腳本、測試、待辦 ⑤問它還有哪些工作可以交給 LAWWW2 ⑥收到新任務就轉過去做。工作被收回不代表工作階段結束。
- 沒有 LAWWW 明確分派前，不做：人物 VRM／骨架／動畫、沈以安與其他核心人物、霖澤館與萬才館、`main`、正式發布、LAWWW 的 Blender 工作檔、共用引擎重構、劇情／人物關係／玩法。
- 使用者要求（2026-10-10 16:43）：LAWWW2 認為自己適合做的事，**仍要和 LAWWW 做最後確認**，確定不會和它的工作衝突，才動共用檔。
- AA、BB 兩個工作階段只和使用者討論劇情、不參與開發：不分派工作給它們，它們的分工請求不處理。

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
