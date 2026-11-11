# 正式發行打包規格（REL-PACKAGING-1111）

> 任務 REL-PACKAGING-1111（USER_WANTS X340）；使用者規格原文：`docs/handoff/user_specs/RELEASE_PACKAGING_1111.md`。
> **狀態：規格與工具已建立，還沒有用它發布任何東西。** 這份規格不改遊戲、不改現有的 GitHub Pages 發布流程；採不採用、什麼時候用，等使用者決定。
> 數字都是 2026-11-11 實測（`docs/release/SIZE_REPORT_2026-11-11.md`）；單位 MB＝10⁶ 位元組、MiB＝2²⁰ 位元組。
> 「main」＝線上版 `779ddd650`；「開發分支」＝`claude/confident-ritchie-8rwh7t` 的 `d1b2dbdda` 加上這個任務的工具與文件（遊戲檔和 `d1b2dbdda` 一樣）。依賴檢查的完整清單：`docs/release/DEPS_2026-11-11_main.md`、`DEPS_2026-11-11_dev.md`。

一句話：**遊戲執行只需要 `index.html`、它載入的 `lib/`、`src/` 的 script，和 `assets/` 裡 Blender 原檔以外的素材**——線上版（main `779ddd650`，v9.10.24）整棵樹 1,381 MB，其中遊戲要的是 831.6 MB（2,002 個檔），其餘 549.6 MB 是文件、測試、工具、備份和 Blender 原檔。

---

## 1. 現況稽核

### 1.1 遊戲怎麼載入

- **入口只有 `index.html`**：用 `<script src="…?v=版號">` 依序載入 `lib/` 4 支（three.js、three.js 的附加模組、three-vrm、lz-string）和 `src/` 的全部遊戲程式與資料（開發分支 423 支、線上版 405 支）。沒有 npm 相依、沒有打包器、沒有建置步驟。
- **沒有動態載入 script**：程式裡沒有 `createElement('script')`、`import()`、Worker。所以「index.html 沒有列的 `.js`」遊戲一定不會載入（`tests/release_pack_unit.js` 第 21 項釘住）。
- **沒有 service worker、沒有 PWA manifest、沒有快取清單**。瀏覽器快取靠 `?v=版號`。
- **沒有音效檔**：聲音是 `src/audio3d.js` 用 Web Audio 即時合成的。
- **字型是唯一的對外網路依賴**：`index.html` 用 `<link>` 從 Google Fonts 載 Noto Sans TC／Noto Serif TC；載不到會退回系統字型（遊戲照常跑，字的樣子不同）。離線的 Windows 版要另外處理（第 7 節）。

### 1.2 資產從哪裡被指到（五種來源）

| 來源 | 例 | 在哪裡 | 靜態搜尋找得到嗎 |
|---|---|---|---|
| A 入口 | `lib/three.bundle.js`、`src/game3d.js` | `index.html` 的 `<script src>`、`<link href>` | 找得到 |
| B 程式裡的完整路徑 | `'assets/models/char/vroid_yuting.vrm'`、`CG_REGISTRY` 的 `file:'assets/cg/…'` | `src/assets3d.js` 的 `ASSETS.manifest`（主要的模型表）、`src/adv3d.js`、各 `src/data/*_layout.js` | 找得到（註解裡的要另外排除） |
| C 拼出來的路徑 | `'assets/portraits/'+id+'/'+outfit+'/'+expr+'.webp'`、`'assets/bg/'+a.bg+'.webp'`、`'assets/posters/'+id+'.webp'`、`'assets/models/env/second_ai/'+id+'.glb'`、`'assets/models/env/views/'+kind+'_day.webp'`、`'assets/textures/campus/'+…` | `adv3d.js`、`game3d.js`、`movies3d.js`、`rooms_glb3d.js`、`l118_shops3d.js`、`linze_upper3d.js`、`jp_dorm3d.js`、`world3d.js`、`dorm3d.js`、`zones3d.js`… | **只找得到前綴**，檔名是執行時才決定 |
| D 執行時才進表的 | 別的模組在載入時往 `ASSETS.manifest` 加的 key（`rooms_glb3d.js` 等）；`A.lodUrl()` 把 `…/bl_npc_x.vrm` 換成 `…/lod/bl_npc_x.lod.glb`；`PORTRAIT_FILES`（`src/data/portrait_manifest.js`，`tools/gen_portrait_manifest.py` 掃出來的現有立繪） | 要把全部 script 載入一次才看得到 | **找不到** |
| E 模型檔裡面寫的 | 光照貼圖：GLB 的 `scenes[].extras.lightmap.day／night`＝`assets/…/xxx_lm_day.webp`（`Z3.attachRoomGLB` 讀） | GLB 檔的 JSON 區塊 | **程式裡完全搜尋不到**（147 個檔、約 10 MB） |

另外兩個「條件載入」：
- **備用模型**：每個人物有 `url`（預設）和 `blUrl`（Blender 版）；路人底模有遠距離版本（`lod/`）；`?nobldg` 等網址參數會改用程序化版本。
- **Base64 JSON 備援**：`ASSETS.loadOne` 抓 `.glb` 失敗時會再試同名的 `<檔名>.glb.json`（見 1.3）。

這就是為什麼**不能「搜尋不到引用就排除」**：C、D、E 三種單看程式字串都會漏。

### 1.3 `build.py` 與它產生的 Base64 JSON

**它做什麼**（`python3 build.py`，輸出到 `build/`，`build/` 在 `.gitignore`、不在 repo、GitHub Pages 上沒有）：
1. 先跑 `tools/gen_portrait_manifest.py`（重掃立繪，改寫 `src/data/portrait_manifest.js`）。
2. 把 `index.html` 的所有外部 script 內嵌成一個檔：`build/index.html`（單檔版）和 `build/artifact.html`（拿掉外殼，給 claude.ai artifact 貼用）。
3. 複製一部分資產到 `build/assets/`，再把每個 GLB／VRM 轉成同名的 `<檔名>.glb.json`（內容 `{"b64":"…"}`）。

**Base64 JSON 是什麼、誰在用**：
- 它是給「不肯服務 `.glb` 檔的平台」（早期的 claude.ai artifact 環境）用的替代格式。遊戲端只有一個地方讀：`src/assets3d.js` 的 `ASSETS.loadOne`／`loadLOD`——**先抓 `.glb`，失敗才抓 `.glb.json`**。正常的網頁伺服器（GitHub Pages、本機伺服器、桌面封裝）第一步就成功，永遠走不到第二步。
- `window.ASSET_DATA`（同一段程式的另一個入口）是開發工具直接塞記憶體用的（`tools/anim/`、`tools/dev_scratch/spring_sim/`），和 `build.py` 的輸出無關。
- repo 裡**沒有**任何 `.glb.json`／`.vrm.json`（`tests/release_pack_unit.js` 第 20 項釘住）；資產目錄裡的 228 個 `.json` 是 Blender 匯出時寫的側寫（三角形數、配置座標），不是 Base64，遊戲不讀（見第 4 節）。

**重複佔多少容量**：Base64 比原檔大三分之一。照 `build.py` 現在會複製的 187 個 GLB／VRM（397.1 MB）用公式算（每檔 4×⌈n÷3⌉＋10 位元組），會多出 **529.5 MB**——也就是 `build/` 裡同一份模型存兩次（原檔＋Base64），合計約 927 MB。（這是由檔案大小算的，沒有實際執行 `build.py`：這次的工作機器磁碟只剩 1 GB 多。）

**另一個發現：`build.py` 的資產清單已經跟不上遊戲**。它只複製 `assets/models/env`、`assets/models/env/second_ai`、`assets/models/char` 三層的檔（不遞迴），漏掉 `assets/models/char/second_ai/`（95 個，大部分同學與路人的 VRM）、`…/lod/`（40 個）、`…/second_ai/aa_support/`（20 個）、`…/bb_support/`（22 個）、`assets/textures/`。現在的 `build/` 單檔版載不到這些模型。

**結論**：
1. **正式發行包不需要 Base64 JSON，也不用 `build.py`**。打包規則把 `build/`、`*.glb.json`、`*.vrm.json` 一律排除（規則 X4）。
2. **不動 `build.py`**（這次的限制，也沒必要）：它的輸出只給 claude.ai artifact 用途；要不要修好它漏掉的目錄、或乾脆退役，請 LAWWW 決定（第 11 節）。
3. **不破壞還在用的東西**：`src/assets3d.js` 的 `.json` 備援留著（不改遊戲）；`tools/gen_portrait_manifest.py` 是獨立的工具，遊戲靠它產生的 `PORTRAIT_FILES` 決定哪些立繪存在——新增立繪以後要重跑它（不必經過 `build.py`）。`tests/release_pack_unit.js` 第 26 項釘住「`PORTRAIT_FILES`＝磁碟上的立繪」。

### 1.4 GitHub Pages 怎麼部署

- 設定是「Deploy from a branch → `main` / root」（`docs/RELEASES.md`）；repo 根目錄有 `.nojekyll`。`.github/workflows/` 只有 `node-unit-auto.yml`（Node 單元測試），**沒有自訂的 Pages 部署流程**。
- 所以 **Pages 服務的是 main 的整個根目錄**：7,957 個檔、1,381 MB，包含 `docs/`、`tests/`、`tools/`、`wip_backup/`、`assets/blender/`。玩家只會下載遊戲用到的檔，但其餘 549.6 MB 也跟著部署、也公開讀得到。
- 發布流程（`docs/rules/ROLE_LAWWW.md` 第 6 節）：`tools/handoff/mk_release_tree.sh` 做發布樹（遊戲檔＝候選版＋版本字樣）→ PR 合併 main → Pages 自動部署 → `tests/deploy_check.py` 驗線上。**這份規格不改這個流程。**
- GitHub Pages 對網站大小有上限（記憶中是發布的網站 1 GB；**這次連不到 GitHub 文件，未查證現行數字**）。整棵樹 1.38 GB 可能已經超過建議值、目前仍部署成功；如果哪天部署開始失敗，改成「只部署 `dist/web`」是現成的解法（第 7 節的選項 B）。

### 1.5 相關測試

| 測試 | 驗什麼 | 在哪跑 |
|---|---|---|
| `tests/release_pack_unit.js`（這次新增，26 項） | 打包規則：開發檔不進包、遊戲要的都在、巢狀目錄不漏、沒人引用的素材不被排除 | Node；GitHub Actions `node-unit-auto` |
| `tests/readme_version_unit.js`（這次新增） | README 的版本＝`index.html` 的版本 | 同上 |
| `tests/zone_prefetch_unit.js`、`node tools/gen_zone_assets.js --check` | 每一區預先下載的模型清單（`src/data/zone_assets.js`）沒過期 | Node |
| `tests/loadgen_locks_unit.js`、`tests/*_glb_unit.js`、`tests/*_lm_unit.js` | 載入順序鎖、各場景 GLB 接上、光照貼圖 | Node |
| `tests/deploy_check.py` | 瀏覽器實際載入：資源 404、全部區域、人物是不是正式 VRM、`?v=` 和標題版號一致 | 瀏覽器（使用者電腦，CC 排） |
| `tests/save_compat_v7.py` | 舊存檔讀得進來 | 瀏覽器 |

---

## 2. 打包原則（對應使用者規格第三節的八條）

| # | 使用者的原則 | 這份規格怎麼做 |
|---|---|---|
| 1 | 正式包只含執行必需的檔 | 白名單思路：入口＋它載入的 script＋`assets/` 的執行期素材＋授權檔。其餘頂層檔**預設不收**，新出現的頂層檔會讓檢查失敗、逼人決定（規則 X9）。 |
| 2 | 排除 .git、Actions、AI Skills、交班資料、測試報告、開發工具、Blender 原檔、備份 | 規則 X1～X4（第 3 節），`tests/release_pack_unit.js` 第 4、5 項釘住。 |
| 3 | 保留所有實際使用的 GLB、VRM、WebP、JSON、JS | 規則 R1～R6；`assets/` 的 GLB／VRM／WebP／PNG／JPG **全部**保留（第 17 項）。 |
| 4 | 巢狀目錄完整依賴檢查 | 第 5 節；`second_ai/`、`aa_support/`、`bb_support/`、`lod/`、`views/` 各自釘住（第 13～15 項）。 |
| 5 | Base64 JSON 不需要就排除，不破壞仍依賴它的用途 | 1.3 的結論；規則 X4。 |
| 6 | 不得單憑檔名或搜尋不到引用就刪模型 | **這份規則不會因為「沒人引用」排除 `assets/` 的任何檔**：指不到的歸 R7「無法判定→保留」，列清單請人確認（第 4 節）。打包只複製，不刪、不搬原始檔。 |
| 7 | 存檔不得因打包規則遺失 | 存檔在瀏覽器的 localStorage，跟「包裡有哪些檔」無關；風險在網址（origin）改變。第 6 節。 |
| 8 | Pages 玩法正常，Windows 包與網頁發行分清楚 | 同一套原始檔、兩個輸出目錄、兩份 manifest；現有 Pages 流程不動。第 7 節。 |

---

## 3. 包含與排除的規則

規則寫在 `tools/release/deps.py`（`DEV_DIRS`、`DEV_FILES`、`DEV_SUFFIX`、`EXTRA_INCLUDE`、`DERIVED_RULES`）。每個檔只會落在一條規則；打包出來的 `manifest.json` 每個檔都寫是哪一條收的。先判排除（X1～X4），再判包含。

### 3.1 排除（確定是開發檔）

| 規則 | 範圍 | 為什麼 | main 的量 |
|---|---|---|---:|
| X1-GIT／CI／AI | `.git/`、`.github/`、`.claude/` | Git 歷史、GitHub Actions、AI Skills 與設定 | 0.5 MB（.git 另計） |
| X1-DOCS | `docs/` | 文件、交班資料、測試報告與截圖、規格書、企劃 | 218.2 MB |
| X1-TESTS | `tests/` | 測試程式 | 21.0 MB |
| X1-TOOLS | `tools/` | Blender 腳本與貼圖原檔、產生器、交班工具、打包工具本身 | 101.7 MB |
| X1-BACKUP | `wip_backup/` | git bundle 等備份 | 63.7 MB |
| X3-BLEND | `assets/blender/`、任何 `*.blend`／`*.blend1` | Blender 工作原檔（遊戲讀的是匯出的 GLB／VRM） | 144.3 MB |
| X4-BUILD／B64／DIST | `build/`、`dist/`、`*.glb.json`、`*.vrm.json` | `build.py` 的輸出與 Base64 JSON（1.3）、打包輸出本身 | repo 裡沒有 |
| X2-DEVFILE | `build.py`、`test_charlook.html`、`CLAUDE.md`、`README.md`、`.gitignore`、`.env.example` | 開發用頂層檔；遊戲不讀 | 0.06 MB |
| X5-UNLOADED | `src/`、`lib/` 裡 `index.html` 沒載入的 `.js`（現在 7 個：`src/chars3d.js` 與 6 個 `src/data/*_layout.js`） | 遊戲沒有動態載入機制，這些只有測試或工具在用 | 0.11 MB |
| X9-UNDECIDED | 其他沒有規則的頂層檔 | **預設不收，而且檢查會失敗**——新增頂層檔的人要到 `deps.py` 寫清楚收不收 | 現在 0 個 |

### 3.2 包含

| 規則 | 範圍 | 依據 | main 的量 |
|---|---|---|---:|
| R1-ENTRY | `index.html` | 入口 | 0.06 MB |
| R2-INDEX-REF | `index.html` 的 `<script src>`、`<link href>` 指到的本機檔 | 來源 A | 405 個、20.4 MB |
| R3-STATIC | 程式裡寫了完整路徑的資產 | 來源 B（註解裡的不算） | 713 個、689.2 MB |
| R4-RUNTIME | 執行期表才看得到的（`ASSETS.manifest` 動態加的 key、`A.lodUrl`、`PORTRAIT_FILES`、資料表） | 來源 D：`tools/release/runtime_manifest.js` 在 Node 載入全部 script 讀出來 | 210 個、56.3 MB |
| R4-GLBREF | 模型檔 `extras` 裡指到的檔（光照貼圖）、GLB 的外部 `uri` | 來源 E：讀每個 GLB／VRM 的 JSON 區塊 | 147 個、10.0 MB |
| R5-DYNAMIC | 拼出來的路徑：符合「前綴＋副檔名」的整批檔 | 來源 C：目錄級規則，前綴和副檔名由程式掃出來（現在 13 條） | 304 個、36.8 MB |
| R6-DERIVED-LOD | `assets/models/char/second_ai/lod/*.glb` | `A.lodUrl` 的字串取代（寫死的備援規則；通常已被 R4 收走） | 0（都被 R4 收了） |
| **R7-KEEP-UNSURE** | `assets/` 底下**沒有被上面任何一條指到**的檔 | **無法判定是不是備用或條件載入 → 保留**，列清單待確認 | 220 個、18.6 MB |
| R8-LICENSE | `LICENSES.md` | 素材授權與標示（Seed-san 等要求標示）；發行包一定要帶 | 0.17 MB |
| R9-PAGES | `.nojekyll` | GitHub Pages 設定；**只有網頁包收** | 0 |

---

## 4. 依賴檢查的做法

工具：`python3 tools/release/deps.py`（只讀檔）。五種來源一起算，缺一種就可能漏：

1. **入口**：解析 `index.html` 的 script、link、img、CSS `url()`。對外網路的網址另外列（現在只有 Google Fonts）。
2. **靜態路徑**：對 `index.html` 載入的每支 JS 做字串掃描（跳過 `//`、`/* */` 註解，分辨正規表示式），取出 `assets/…` 開頭、有副檔名的完整路徑。只在註解出現的另外列，不算依賴、也不算缺檔。
3. **動態路徑**：`assets/…` 開頭、後面接變數的字串（含樣板字串）→ 記下前綴，往後找這個算式的副檔名 → 變成「前綴＋副檔名」的整批保留規則。前綴越長越優先。
4. **執行期表**：`node tools/release/runtime_manifest.js` 用和 `tools/gen_zone_assets.js` 一樣的方法在 Node 載入全部 script（假的 `document`，不開瀏覽器、不連網路），讀出 `ASSETS.manifest` 每個 key 的 `url`、`blUrl`、`A.lodUrl(key)`，`PORTRAIT_FILES` 展開的路徑，和各資料表（`CG_REGISTRY`、各 `*_LAYOUT`…）裡寫成完整路徑的字串。
5. **模型檔裡面的引用**：讀每個 GLB／VRM 的 JSON 區塊，取 `extras` 裡的 `assets/` 路徑與外部 `uri`。

然後和實際檔案比對，輸出四張清單：

| 清單 | 意思 | 2026-11-11 的結果（main／開發分支） |
|---|---|---|
| **需要但不存在** | 被 1～5 指到、磁碟上沒有＝玩家會遇到 404 | **0／0** |
| 預留格（不算缺檔） | `PORTRAITS` 表列出每個人「可能有」的服裝×表情；遊戲先查 `PORTRAIT_FILES` 才載入，沒有圖就用 compact 對話模式 | 143／143 個預留格沒有圖（正常） |
| **無法判定（保留）** | `assets/` 裡沒有被任何一條指到 | 220 個 18.6 MB／235 個 18.7 MB（見下） |
| 確定是開發檔（排除） | 第 3.1 節 | 5,955 個 549.6 MB／6,095 個 580.7 MB（含這次新增的工具與文件） |

**結束碼**：有「需要但不存在」、有「需要卻被排除規則擋掉」、或有還沒決定的頂層檔 → 1，`pack.py` 不打包。

### 4.1 「無法判定」清單（全部留在包裡；要人確認）

| 類別 | 檔數／容量 | 現在知道的 |
|---|---|---|
| `assets/models/*.glb`（`Michelle`、`Xbot`、`Soldier`、`readyplayer.me`） | 4 個、10.2 MB | three.js 的範例人物模型；程式裡沒有任何字串指到它們。`LICENSES.md` 寫「只在實驗用；未打包進遊戲；**正式發佈前應移除**或改用可再散布的檔案」（Mixamo 角色不可單獨再散布）。**建議 Windows 版明確排除**；等 LAWWW／使用者點頭再加規則（第 11 節第 1、7 項） |
| `assets/models/char/vroid_zhe.vrm`、`vroid_heroine_02.vrm` | 2 個、7.5 MB | `src/assets3d.js` 的註解寫「舊的 VRoid 加工版不再載入」「留在 repo」。是刻意留的舊版，不是備用路徑 |
| 模型旁邊的匯出側寫 `*.json`（`*.layout.json`、`*.props.json`、`*.doors.json`…） | 213 個（開發分支 228 個）、約 0.6 MB | Blender 匯出腳本寫的統計與座標；遊戲唯一的 `.json` 請求是 `<檔名>.glb.json` 備援，不會讀這些。工具和測試會讀 |
| `assets/portraits/heroine_02/campus/neutral.png` | 1 個、0.3 MB | 同目錄有 `neutral.webp`；立繪路徑一律拼 `.webp`，這個 PNG 不會被載入 |

這些加起來不到包的 2.3%。**規格的立場是先全部留著**；要省的話，由 LAWWW2（模型）與 LAWWW（程式）逐類確認後，在 `deps.py` 加明確的排除規則並寫理由——不是從清單直接刪檔。

### 4.2 這個檢查器驗不到的

- **拼出來的檔名是不是真的存在**：例如 `'assets/bg/'+a.bg+'.webp'` 的 `a.bg` 來自劇情資料，檢查器只保證「`assets/bg/` 的 webp 全部在包裡」，不保證劇情指的那個名字有檔。這要靠瀏覽器實跑（`tests/deploy_check.py` 的 404 清單）和既有的劇情測試。
- **Node 載入和瀏覽器的差異**：`runtime_manifest.js` 沒有真的建場景、沒有跑劇情；只在特定劇情當下才往 manifest 加的 key 看不到（靠 R5 的目錄級規則與 R7 的「一律保留」兜住）。
- **CSS 或 HTML 字串裡用 JS 組出來的圖**：有 `assets/` 前綴的會被當成動態前綴；沒有的看不到。

---

## 5. 巢狀目錄的完整性檢查

`assets/models/env/second_ai/` 是最深、最容易漏的（主目錄 404 個檔，底下還有 `aa_support/` 75 個、`bb_support/` 69 個；人物在 `assets/models/char/second_ai/` 109 個＋`lod/` 40 個；窗外景 `assets/models/env/views/` 198 個）。規格的做法：

1. **不靠列舉目錄**：所有規則都是「路徑前綴」比對，天生遞迴，沒有「只複製某幾層」的清單（`build.py` 就是因為寫死三層而漏掉——1.3）。
2. **`assets/` 整棵樹預設保留**：指不到的也留（R7），所以新增子目錄不會漏包；只會出現在「無法判定」清單裡提醒人。
3. **`tests/release_pack_unit.js` 逐層釘住**：第 13 項（manifest 用到的 second_ai GLB 都在包裡）、第 14 項（磁碟上 second_ai 含子目錄的 GLB 全部在包裡）、第 15 項（`aa_support/`、`bb_support/`、`lod/`、`views/` 每個檔都在）、第 11 項（GLB 裡指到的光照貼圖都在）、第 12 項（每個 GLB／VRM 的 JSON 區塊讀得出來＝沒有壞檔）。
4. **打包後再驗一次**：`node tools/release/verify_dist.js dist/<target>` 對輸出目錄起本機伺服器，把 manifest 的每個檔都 GET 一次、比對大小與 sha256，把「遊戲會請求的路徑」（入口＋靜態＋執行期表＋GLB 引用；開發分支 1,507 個）逐一核對在包裡。

---

## 6. 存檔

**現況**（`src/game3d.js`）：
- 存在瀏覽器的 **localStorage**：`fatiao3d_auto`（自動存檔）、`fatiao3d_slot_1`～`3`（手動欄位）、`fatiao3d_quick`、`fatiao3d_backup…`（開新遊戲前等時機的備份）、`fatiao3d_settings`、`fatiao3d_stuck`、`fatiao3d_live`。v9.10.20 起內容用 lz-string 壓縮（`LZString.compressToUTF16`）。沒有用 IndexedDB。
- **匯出／匯入**：選單可以把存檔下載成 `fatiao3d_save_day<N>.json`，也可以選檔匯入（把進度帶到另一台裝置）。

**打包規則會不會動到存檔**：不會。localStorage 是照**網址的 origin**（協定＋網域＋埠）分的，跟部署了哪些檔無關。打包只決定「哪些檔進包」，不改存檔 key、不改存檔格式、不改遊戲程式。

**會讓存檔「看起來不見」的只有 origin 改變**：

| 情境 | origin | 存檔 |
|---|---|---|
| GitHub Pages 現況 | `https://pyhuanglaw.github.io` | 現有玩家的存檔在這裡 |
| Pages 改成只部署 `dist/web`（第 7 節選項 B） | 不變（同一個網址） | **不受影響** |
| 本機 `python3 -m http.server 8765` | `http://127.0.0.1:8765` | 另一份，互不影響 |
| Windows 版（桌面封裝） | 封裝器自己的 origin（例：`app://fatiao`；`file://` 也算一種） | **另一份**，存在使用者的 Windows 設定檔目錄；和網頁版互不覆蓋 |

所以：
1. **網頁版 → Windows 版不會自動帶存檔**。帶進度的方法是現有的匯出／匯入（這條路已經在線上版）。
2. **Windows 版的 origin 一旦定了就不能改**：從 `file://` 換成自訂協定、或改自訂協定的名字，等於換 origin，玩家的存檔會留在舊的那一份讀不到。這是封裝 PoC 要先定案的事（`docs/release/STEAM_WINDOWS_WRAPPER.md` 第 6 節）。
3. **Windows 版更新遊戲檔不影響存檔**：存檔在使用者的設定檔目錄（不在安裝目錄），Steam 更新、重裝遊戲都不會刪它；「解除安裝要不要一起清存檔」是之後的設計題。
4. **localStorage 有容量上限**（Chromium 每個 origin 約 5 MB 等級；**實際存檔多大這次未量**）。網頁版已經這樣運作；Windows 版 PoC 要量一份後期存檔（含備份）確認。
5. **舊存檔相容**照現行規則（CLAUDE.md §11.5）：打包不碰格式；`tests/save_compat_v7.py` 繼續是發布前必跑。

---

## 7. 網頁版與 Windows 版的區分

**同一套原始檔，不同的輸出目錄和清單**。兩個 target 都由 `tools/release/pack.py` 從 repo 產生，不互相複製、不手改：

| | `web` | `win-stage` |
|---|---|---|
| 輸出 | `dist/web/` | `dist/win-stage/` |
| 用途 | 等同 GitHub Pages 上「遊戲實際需要的檔」；可以直接當靜態網站根目錄 | 交給桌面封裝器當內容目錄的靜態檔（**不含封裝器、不含 Steamworks、不含安裝程式**） |
| 內容 | R1～R8＋`.nojekyll`（R9） | R1～R8（沒有 `.nojekyll`） |
| 2026-11-11 main | 2,002 個檔、831.55 MB | 2,001 個檔、831.55 MB |
| 2026-11-11 開發分支 | 2,048 個檔、865.03 MB | 2,047 個檔、865.03 MB |
| `manifest.json` | `target:"web"` | `target:"win-stage"` |

現在兩者只差一個 `.nojekyll`（`tests/release_pack_unit.js` 第 23 項釘住）。這是故意的：Windows 版「需要不一樣」的地方都還沒做決定，先把分岔點留好——

| Windows 版之後要處理的 | 現況 | 放哪裡 |
|---|---|---|
| 字型：Google Fonts 是線上的，離線拿不到 | 退回系統字型（Windows 會是微軟正黑體；畫面和網頁版不同） | 要把 Noto Sans TC／Noto Serif TC 的字型檔放進 `win-stage`（OFL 授權，要記進 `LICENSES.md`），並讓 Windows 版的入口改讀本機字型。**要動到 `index.html` 或加一層 Windows 專用的入口，這次不做** |
| 視窗、全螢幕、離開遊戲、鍵鼠提示 | 遊戲是手機優先的 UI | 封裝器那一層＋之後的 UI 任務 |
| 存檔放哪、Steam Cloud | localStorage | 第 6 節、封裝方案文件 |
| 版本字樣 | `index.html` 的標題字樣；`manifest.json` 也帶 `version` | 封裝器的應用程式版本從 `manifest.json` 讀，不另外手寫 |

**GitHub Pages 現有流程維持原樣**（選項 A，這次的做法）：照舊推 main、Pages 服務整個根目錄。`dist/web` 目前只用來驗證與量容量。

**選項 B（之後可以考慮，這次不做）**：Pages 改成用 GitHub Actions 部署 `dist/web`。好處：部署量從 1,381 MB 降到 832 MB、開發檔不再跟著上線。代價：發布流程多一個 workflow、`tests/deploy_check.py` 要對新流程重驗一次、`docs/`（例如 `docs/RELEASES.md`）的連結不再能從 Pages 網址打開。網址不變，所以玩家存檔不受影響。要 LAWWW 決定、BB 驗收。

---

## 8. 容量報告與分類規則

工具：`python3 tools/release/size_report.py`（第 9 節）。每次正式打包跑一次，存成 `docs/release/SIZE_REPORT_<日期>.md`＋同名 `.json`。全部由實際檔案計算；沒量的寫「未產生」「未量」。

輸出：原始專案容量（`.git` 另列）、遊戲執行資產（web／win-stage）、排除的開發檔、win-stage 未壓縮與壓縮後（加 `--zip` 才真的壓；不加就寫「未產生」）、各類素材排名、最大的 20 個檔、重複資產（整個檔相同；GLB／VRM 內嵌貼圖相同）、可以考慮的優化（只列，不執行）。

**分類規則**（`tools/release/relcommon.py` 的 `CATEGORIES`，照路徑前綴，第一條符合的算）：

| 類別 | 路徑 |
|---|---|
| 3D 場景 | `assets/models/env/`（GLB、光照貼圖、窗外景 `views/`、匯出側寫） |
| 3D 人物 | `assets/models/char/`（VRM、配件 GLB、動作檔、遠距離版本 `lod/`） |
| 早期的範例人物模型 | `assets/models/` 直接放的 4 個 GLB |
| 2D 背景／事件 CG／電影海報／立繪／貼圖 | `assets/bg/`／`assets/cg/`／`assets/posters/`／`assets/portraits/`／`assets/textures/` |
| Blender 工作原檔 | `assets/blender/` |
| 遊戲資料／遊戲程式／函式庫／入口 | `src/data/`／`src/` 其餘／`lib/`／`index.html` |
| 音效檔 | 任何 `.mp3`／`.ogg`／`.wav`／`.m4a`（現在 0 個） |
| 文件／工具／測試／備份／GitHub 與 AI 設定／其他 | `docs/`／`tools/`／`tests/`／`wip_backup/`／`.github/`、`.claude/`／其餘 |

**使用者 11-11 的初步數字核實**（main `779ddd650`）：

| 項目 | 初步數字 | 實測 | 說明 |
|---|---:|---:|---|
| 整個版本樹 | 約 1.38 GB | 1,381.18 MB | 相符（7,957 個檔） |
| 遊戲程式與素材 | 約 831 MB | 831.55 MB | 相符：正好是 `web` 包（2,002 個檔） |
| 3D 場景 | 約 409 MB | 408.53 MB | 相符（`assets/models/env/`） |
| 3D 人物 | 約 248 MB | 248.44 MB | 相符（`assets/models/char/`）；另有 10.21 MB 的 4 個早期範例模型放在 `assets/models/` 直下，沒算在裡面 |
| 2D 背景 | 約 97 MB | 96.78 MB | 相符 |
| 事件 CG | 約 20 MB | 19.57 MB | 相符 |
| 電影海報 | 約 19 MB | 18.76 MB | 相符 |

初步數字的單位是 MB（10⁶）；同一批檔在檔案總管或 `du -h` 會顯示成 MiB（例如 831.55 MB＝793.03 MiB），不是變小了。

---

## 9. 怎麼跑

```bash
# 依賴檢查（只讀；幾秒）
python3 tools/release/deps.py                       # 摘要；結束碼 1＝有缺檔或還沒決定的檔
python3 tools/release/deps.py --md <檔> --json <檔> # 完整報告
python3 tools/release/deps.py --root git:origin/main  # 直接檢查 git 裡的某個版本，不用解出來

# 打包
python3 tools/release/pack.py --target web --dry-run   # 只列清單與容量，不寫任何檔
python3 tools/release/pack.py --target all             # → dist/web/、dist/win-stage/（各約 0.9 GB；先確認磁碟空間）

# 驗證（Node，不是瀏覽器）：本機伺服器逐檔 GET、比對大小與 sha256、開發檔要 404
node tools/release/verify_dist.js dist/web

# 最小冒煙（雲端 headless Chromium；不是正式驗收）
node tools/release/verify_dist.js dist/web --serve 8791 &
node tools/release/smoke_dist.js http://127.0.0.1:8791/index.html --json <檔>

# 容量報告（--zip 會真的壓一次、只數大小不存檔，約多 1～2 分鐘）
python3 tools/release/size_report.py --tree "開發分支=." --tree "main=git:origin/main" --zip \
        --prelim main --md docs/release/SIZE_REPORT_<日期>.md --json docs/release/SIZE_REPORT_<日期>.json

# 規則的單元測試
node tests/release_pack_unit.js && node tests/readme_version_unit.js
```

- `dist/` 在 `.gitignore`；產物不 commit。
- **可重現**：同一個 commit 跑兩次，`manifest.json` 一模一樣（沒有時間戳；每個檔有 `path`、`size`、`sha256`、`rule`、`note`）。預設只算 git 追蹤的檔（＝Pages 實際內容），工作目錄裡沒 commit 的雜檔不會混進去。
- `pack.py` 只寫 `--out`（預設 `dist/`）底下，不改、不刪、不搬原始檔；輸出目錄不是自己產生的就拒絕清空。

---

## 10. 驗收清單（對應使用者規格第六節）

測試範圍與 PASS／FAIL 由 **BB** 判定，瀏覽器測試由 **CC** 在使用者電腦跑（D131）。下面是建議的驗法；「自動」欄是這次已經有的自動檢查，**自動通過不等於那一項驗收完成**。

| # | 使用者要驗的 | 自動（已經有） | 要在瀏覽器驗的（BB／CC） |
|---|---|---|---|
| 1 | 正式包沒有缺素材、404、載入失敗 | `deps.py` 缺檔 0；`verify_dist.js` 逐檔 GET＋sha256；`release_pack_unit.js` | 對 `dist/web` 起伺服器跑 `tests/deploy_check.py <網址> v<版號>`（全部區域、404 清單、`CHAR.failures`） |
| 2 | 3D 場景、人物、室內模型正確載入 | 檔案都在、GLB 的 JSON 區塊讀得出來 | `deploy_check.py` 逐區「玩家與 NPC 是正式 VRM」；BB 抽看室內場景截圖（光照貼圖有沒有接上——缺的話畫面只是變暗，不會報錯） |
| 3 | 立繪、事件 CG、電影海報正常顯示 | 檔案都在；`PORTRAIT_FILES`＝磁碟 | 實際開對話（有立繪的人）、相簿／CG 回顧、南洋戲院片單；看圖有沒有出來 |
| 4 | 校園、公館、溫州街、交換地圖能進出 | 無（自動檢查不走路） | `tests/zone_transitions.py`、`tests/reachability_all.py`、美國／日本區域的進出 |
| 5 | 新遊戲、存檔、讀檔、舊存檔相容 | 無 | 新遊戲兩條開局；存檔→重新整理→讀檔；`tests/save_compat_v7.py`；匯出後在 `dist/web` 的網址匯入（模擬換 origin 帶進度） |
| 6 | 原有 GitHub Pages 版不因打包規則壞掉 | 這次沒有改 `index.html`、`src/`、`lib/`、`assets/`、Pages 設定；新增的只有 `tools/release/`、兩支測試、文件、`.gitignore` 一行、README | 下次發布照常跑發布前清單即可；這份規格本身不需要發布 |
| 7 | 自動測試通過≠全部資產都驗過；未測項目明列 | 見下 | — |

**自動檢查驗不到、要明列的**：
1. 模型在瀏覽器裡**解析成功、畫出來是對的**（材質、光照貼圖、動畫、遠距離版本切換）。
2. 拼出來的檔名（劇情資料指的背景、CG、立繪表情）是不是每一個都有檔——只保證目錄整批在包裡。
3. 任何需要玩到特定劇情才載入的素材。
4. 手機實機（iPhone Safari）、不同顯示卡的 Windows 電腦。
5. 離線狀態（字型退回系統字型以後的排版）。
6. Windows 封裝後的任何行為——**還沒有封裝器**。
7. 存檔容量上限、長時間遊玩的記憶體。

這次另外跑了一次雲端 headless Chromium 的冒煙測試，結果與限制寫在 `docs/release/SMOKE_2026-11-11.md`。

---

## 11. 待確認與需要決定的事

| # | 事 | 誰 |
|---|---|---|
| 1 | 「無法判定」的 4 類檔（4.1）要不要排除 | LAWWW2 確認模型、LAWWW 確認程式；確認後在 `deps.py` 加規則 |
| 2 | `build.py`：修好漏掉的目錄、或退役（1.3） | LAWWW |
| 3 | Pages 要不要改成只部署 `dist/web`（第 7 節選項 B） | LAWWW 決定、BB 驗收 |
| 4 | Windows 版的字型（把 Noto 字型放進包、記授權） | LAWWW；要動入口，另開任務 |
| 5 | 桌面封裝方案、Windows 版的 origin、Steam 相關的每一步 | **使用者**（`docs/release/STEAM_WINDOWS_WRAPPER.md`；不付款、不建商店頁、不提交 Steam——D13） |
| 6 | 素材優化（重複貼圖、幾何壓縮）要不要做 | 之後的任務；這次只列在容量報告 F 節 |
| 7 | **商業發行前的素材授權盤點**：`LICENSES.md` 標了「正式發佈前應移除」「僅原型測試用」「不可單獨再散布」的檔（`assets/models/` 直下 4 個範例 GLB、`char/rpm_sample.glb`、`char/vrm_player.vrm`（Seed-san，要標示）、`char/mixamo_clips.glb`）現在都還在 `assets/`、照規則會進包 | LAWWW 逐條對授權；要排除的在 `deps.py` 加規則。細節：`docs/release/STEAM_WINDOWS_WRAPPER.md` 第 6 節 |

---

## 12. 版本資訊單一來源

- **來源**：`index.html` 標題畫面那一行「版本 vX.Y.Z（YYYY-MM-DD）」。發布樹腳本 `tools/handoff/mk_release_tree.sh` 每次發布寫它，同時把每支 script 的 `?v=` 換成同一個版號；`tests/deploy_check.py` 在瀏覽器驗兩者一致。
- **跟著它走的**：
  - `README.md` 的版本區塊（`<!-- VERSION:START … -->` 到 `<!-- VERSION:END -->`）：`python3 tools/release/sync_version.py` 產生；`tests/readme_version_unit.js` 釘住「README＝index.html」，而且標記以外不准再手寫「目前發布版本 vX」。
  - 打包的 `manifest.json`（`version`、`versionDate`、`commit`）：之後封裝器的應用程式版本從這裡讀。
- **發布流程多的一步**：`mk_release_tree.sh` 在改完 `index.html` 以後會自己跑 `sync_version.py` 並把 `README.md` 加進發布樹那個 commit（失敗只印提醒、不擋發布）。其餘行為不變。
- **不是單一來源、仍然人寫的**：`docs/RELEASES.md`（每一版的經過、測試結果、部署時間——這是紀錄，不是版號的來源）；README 的「已發布／尚未發布／開發中」三段內容（發布時由 LAWWW 把上線的項目往上搬）。
