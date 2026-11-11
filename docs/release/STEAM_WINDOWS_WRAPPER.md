# Steam Windows 版：桌面封裝方案比較與推薦（REL-PACKAGING-1111）

> 任務 REL-PACKAGING-1111（USER_WANTS X340）；使用者規格 `docs/handoff/user_specs/RELEASE_PACKAGING_1111.md` 第四節。
> **這是評估文件，不是實作。** 這次沒有安裝任何封裝器、沒有改遊戲引擎、沒有碰 Steam。遊戲**還沒有在 Steam 上市，也沒有商店頁**。
> 專案規則 D13：不付款、不建商店頁、不提交 Steam——凡是要 Steamworks 帳號、App ID、費用、上傳的步驟，都由使用者自己決定和操作；下面只寫「到時候要做什麼」。
> 查詢日期：2026-11-11。各方案的版本與維護狀況是當天查的（來源在第 9 節）；查不到的寫「未查證」。**這次工作機器的網路只連得到 GitHub 和搜尋結果**，Electron、Steamworks、Microsoft、npm 的官方網站都連不上，所以凡是標「依既有知識」的，採用前要再對一次官方文件。

## 0. 結論先講

**推薦：Electron**（自帶 Chromium 的桌面殼），內容目錄用 `tools/release/pack.py --target win-stage` 產生的靜態檔，用自訂協定（例如 `app://`）載入；Steam 功能放在主程序，先只做「能從 Steam 啟動」，成就、雲端存檔之後再加。

一句話的理由：**這個遊戲現在就是在 Chromium 上開發和測試的**（Playwright 的 Chromium、使用者電腦上的 Chrome），Electron 把同一個引擎、固定的版本一起包進去，玩家電腦上跑的和我們測的是同一個東西；另外三個方案各有一個對這個專案很痛的缺點（第 3 節）。代價是安裝容量多一份 Chromium。

**採用以前要先做的最小驗證**在第 7 節（7 項，都不需要付款或 Steam 帳號）。

---

## 1. 這個遊戲實際用到哪些瀏覽器功能（grep 程式確認）

| 功能 | 用在哪 | 對封裝的意義 |
|---|---|---|
| **WebGL（three.js r187dev）** | `src/engine3d.js`：`new THREE.WebGLRenderer({canvas, antialias:true, powerPreference:'high-performance'})`；這一版 three.js 只支援 WebGL 2 | 需要有硬體加速的 WebGL 2；雙顯示卡筆電要確定用到獨立顯示卡 |
| **VRM 人物（@pixiv/three-vrm）**、GLB（GLTFLoader） | `lib/three-vrm.bundle.js`、`lib/three.jsm.bundle.js` | 純 JS，沒有額外的原生相依；沒有用 Draco／Basis 的 wasm 解碼器 |
| **`fetch()` 抓模型** | `src/assets3d.js`（6 處）、`character3d.js`、`seatact3d.js` | **不能用 `file://` 直接開**（Chromium 擋 `file://` 的 fetch；README 也寫「file:// 載不到模型」）→ 封裝器要用自訂協定或內建的本機伺服器提供檔案 |
| **localStorage** | `src/game3d.js`：存檔 `fatiao3d_auto`、`fatiao3d_slot_1..3`、`fatiao3d_backup…`、`fatiao3d_settings` 等；v9.10.20 起用 lz-string 壓成 UTF-16 字串 | 存檔跟著 origin 走（第 5 節）；容量上限是每個 origin 約 5 MB 等級（依既有知識；實際存檔大小未量） |
| sessionStorage | `src/game3d.js`（分頁內的標記） | 沒有問題 |
| **Web Audio** | `src/audio3d.js`：`AudioContext`，聲音全部即時合成，沒有音效檔 | 沒有檔案相依；瀏覽器的自動播放限制在桌面殼可以關掉（依既有知識） |
| `createImageBitmap` | `src/assets3d.js`（縮貼圖） | Chromium 都有 |
| Blob＋`URL.createObjectURL`＋`<a download>`、`FileReader` | 存檔匯出、匯入 | 匯出會觸發「下載」：封裝器要決定存到哪（預設是跳存檔對話框） |
| `navigator.clipboard.writeText` | 除錯面板、匯出文字 | 自訂協定要註冊成安全來源才給用 |
| `navigator.connection` | 預先下載的省流量判斷 | 沒有也沒關係（程式有防呆） |
| Pointer／鍵盤事件、`visibilitychange`、CSS `safe-area-inset` | 操作與版面 | 沒有問題；**UI 是手機優先的**，桌面的視窗大小、全螢幕、滑鼠操作體驗要另外看 |
| Google Fonts（`<link>`） | `index.html` | **離線拿不到**，退回系統字型；Windows 版要自帶字型（`docs/RELEASE_PACKAGING.md` 第 7 節） |
| `window.claude…`（下載能力） | `src/game3d.js` 存檔匯出的一個分支 | 只在 claude.ai artifact 環境存在，其他地方不會走到 |

**沒有用到的**（不用擔心相容）：service worker、IndexedDB、Cache API、Pointer Lock、Fullscreen API、Gamepad API、WebSocket、WebRTC、WebAssembly（遊戲本身）、Web Worker、動態 `import()`。

→ 這是一個「單一 HTML＋一堆靜態檔＋localStorage」的遊戲，對封裝器的要求很低：**提供檔案、給一個固定的 origin、給硬體加速的 WebGL 2**。難的不是相容，是 GPU 效能的一致性和 Steam 整合。

---

## 2. 比較的方案

| 方案 | 是什麼 | 2026-11-11 查到的現況 |
|---|---|---|
| **Electron** | 自帶 Chromium＋Node.js 的桌面殼 | 最新穩定版 **v45.3.0**（2026-11-10，Chromium 156.0.8078.96）；同一天還在出 v44.11.1、v43.8.8 的修補（三個主版本同時維護）；v46 在 alpha。每 8 週一個主版本、維護最新的三個主版本 |
| **Tauri 2** | Rust 寫的殼，畫面用**系統的 WebView**（Windows 上是 WebView2） | 核心 `tauri` 最新 **v2.12.5**（2026-10-21）；v3 在 alpha（`tauri-cli v3.0.0-alpha.6`，11-06） |
| **NW.js** | 自帶 Chromium＋Node.js（比 Electron 老的同類） | 搜尋結果顯示 **v0.117.0**（Chromium 154）；發布日期在搜尋結果裡不一致，**日期未查證** |
| **Neutralinojs** | 極小的殼，畫面用系統 WebView（Windows 上也是 WebView2） | 最新 **v6.10.0**（10-06） |
| 「直接用 Steam 的網頁」 | 不封裝，Steam 上只放一個開瀏覽器的啟動器 | 不是可行方案（見 3.5） |

Steam 整合用的套件：

| 套件 | 給誰用 | 查到的現況 |
|---|---|---|
| **steamworks.js**（ceifa） | Electron、NW.js（Node 原生模組，Rust 寫的，預編好） | GitHub 639 顆星、52 個未結議題；**主分支最後一次 commit 是 2025-09-07**（一年多沒動）；GitHub 上沒有 Release／Tag 頁（版本在 npm；**npm 頁連不上，最新版號未查證**）。README：`electronEnableSteamOverlay()` 開 Steam 內嵌介面。有人回報內嵌介面不出現（議題 #102）、第三方文章說只在 Windows 正常——都沒有日期，現況未查證 |
| **steamworks-ffi-node**（ArtyProf） | Electron（用 FFI 直接叫 Steamworks SDK） | 90 顆星；README 寫整合 **Steamworks SDK v1.64**，成就、統計、雲端、好友、工作坊等都有；Electron 的內嵌介面標「EXPERIMENTAL」；提醒 ASAR 打包會弄壞它（要設定不打包）。較新、使用者少 |
| **greenworks**（Greenheart Games） | NW.js、Electron | README：「maintained on a best-effort basis」「active development is not a priority」；Steam SDK v1.62。不建議新專案用 |
| Tauri 這邊 | Rust 的 `steamworks` crate（steamworks-rs）自己接 | 沒有查到官方的 Tauri Steamworks 外掛（未查證是否有社群外掛成熟到可用） |

---

## 3. 逐項比較

### 3.1 總表

| 重點 | Electron | Tauri 2（WebView2） | NW.js | Neutralinojs（WebView2） |
|---|---|---|---|---|
| **與現有遊戲的相容性** | **最高**：就是我們測試用的引擎，版本自己選、鎖住 | 高：WebView2 也是 Chromium 核心，但**版本是玩家電腦上的那一版**（Evergreen 會自動更新），不是我們測過的那一版 | 高：同樣自帶 Chromium | 同 Tauri；功能更少 |
| **3D GPU 效能** | 和 Chrome 同級（ANGLE→D3D11）；可以用啟動參數指定獨立顯示卡等（第 4 節） | 理論上和 Edge 同級；但啟動參數、GPU 設定能控制的比較少，版本不固定 → 效能問題難重現 | 和 Electron 同級 | 同 Tauri |
| **Windows 安裝與執行** | 一個資料夾（exe＋資源），Steam 直接放；不需要玩家另外裝東西 | 需要 WebView2 執行環境：Windows 11 內建；Windows 10 多半有、但不保證（微軟建議應用程式自己處理沒裝的情況）→ 要嘛帶安裝器、要嘛帶固定版（第三方資料說固定版 250 MB 以上，未查證） | 同 Electron | 同 Tauri |
| **離線遊玩** | 可以（檔案全在本機；字型要自帶） | 可以（同上）；但第一次若要線上裝 WebView2 就不是純離線 | 可以 | 可以 |
| **存檔位置與更新相容** | localStorage 在 `userData`（預設 `%APPDATA%\<應用程式名>`，可以在啟動時改）；origin 用自訂協定固定住；更新遊戲檔不動它 | 在 WebView2 的 user data folder（預設在應用程式資料目錄下）；origin 由 Tauri 的協定決定（Windows 上是 `http://tauri.localhost` 這類，**Tauri 1→2 改過一次**，依既有知識）→ 殼升級時有換 origin 的風險 | 在 NW.js 的使用者資料目錄 | 同 Tauri |
| **Steamworks 整合** | 有現成的 Node 套件（steamworks.js／steamworks-ffi-node）；**內嵌介面（Shift+Tab）做得到但脆弱**，要實測 | Steam API 可以從 Rust 端呼叫；**內嵌介面在 WebView2 上畫不出來**：Tauri 議題 #6196（2023-02 關閉，「不是 Tauri 的 bug」）；2026-07-24 有人留言說有社群繞法（PSG-Team/tauri-steam-overlay-surface）在 Windows 11 上可行，維護者沒有回應 → 未驗證 | greenworks（半停滯）或 steamworks.js；內嵌介面的情況和 Electron 類似 | 沒有現成的；要自己寫原生擴充 |
| **執行環境額外容量** | 最大：多一份 Chromium＋Node（Windows x64 解壓後約 250～300 MB；**依既有知識，未量**） | 最小：殼本身幾 MB 到十幾 MB（未量）；前提是 WebView2 已經在玩家電腦上 | 和 Electron 同級（未量） | 最小（未量） |
| **維護成本** | 我們寫的是 JS（和遊戲同一種語言）；每 8 週一個主版本，但可以選一版鎖住、只在需要時升；生態最大、問題最容易找到答案 | 要寫和維護 Rust（專案現在沒有 Rust、沒有建置系統）；Steam 整合要自己接；v3 正在 alpha，之後還有一次大版本遷移 | JS；社群比 Electron 小很多，Steam 套件半停滯 | JS；功能少、遇到缺的要自己補原生碼 |

### 3.2 Electron：推薦

- **好處**：引擎版本固定＝「測過的就是玩家拿到的」；GPU 相關的啟動參數完整；Steam 整合有現成套件、而且出問題時可以整個換掉（steamworks.js ↔ steamworks-ffi-node）而不動遊戲；殼的程式是幾十行 JS，專案現有的工具鏈（Node、Playwright）直接能測——Playwright 可以直接驅動 Electron 應用程式（依既有知識），現有的瀏覽器測試有機會原封不動跑在封裝版上。
- **代價**：安裝容量多 250～300 MB（依既有知識，未量）——相對 832 MB 的遊戲內容是三成；記憶體比系統 WebView 多一些（未量）。
- **要小心的**：
  1. Steam 內嵌介面在 Electron 上靠「讓 Steam 掛得上畫面輸出」的幾個 Chromium 參數（steamworks.js 的 `electronEnableSteamOverlay()`；依既有知識它會改 GPU 程序的執行方式），**可能影響 3D 效能或穩定**——這是 PoC 第 3 項要量的。沒有內嵌介面遊戲照樣能上 Steam（成就通知、Shift+Tab 沒有而已），所以這不是擋路的條件，是品質題。
  2. steamworks.js 一年多沒更新。只用最基本的功能（初始化、成就、雲端）風險不大；若卡住，steamworks-ffi-node 是備案，或者第一個測試版**完全不接 Steamworks**（Steam 只當下載與啟動器；Steam 的自動雲端不需要改程式——見 5.3）。
  3. 不要把遊戲內容包進 ASAR：GLB／VRM 維持一個一個的檔，Steam 更新時才只下載有變的檔（依既有知識：Steam 以檔案內容分塊比對；一個大封存檔會讓每次更新都很大）。

### 3.3 Tauri 2：不推薦（對這個專案）

- 最吸引人的是容量小。但：
  1. **引擎版本不在我們手上**。WebView2 的 Evergreen 版會跟著 Edge 自動更新（微軟文件：應用程式不能指定要哪一版）。這個專案的 3D 效能問題一向要靠「同一個版本、同一台機器」才能重現；玩家回報「昨天還好今天變慢」時我們無從對版本。要固定就得自帶固定版執行環境，容量優勢就沒了。
  2. **Steam 內嵌介面目前沒有官方解**（上表）。
  3. **多一種語言和建置鏈**（Rust、MSVC），而專案目前「沒有 npm 相依、不需要建置」；維護的人是 AI 工作階段，環境越單純越好。
  4. 存檔 origin 在殼的大版本之間改過（依既有知識），v3 又在路上。
- 什麼情況會改變結論：如果之後決定**不要 Steam 內嵌介面**、而且很在意下載容量，可以重新評估；`win-stage` 那份靜態檔兩種殼都能用，不會白做。

### 3.4 NW.js、Neutralinojs：不推薦

- **NW.js**：技術上和 Electron 幾乎一樣能用（很多早期的 HTML5 Steam 遊戲用它）。不選的原因只有生態：社群、文件、打包工具、測試工具（Playwright）都明顯比 Electron 少，配套的 greenworks 自己寫「不優先開發」。沒有哪一點比 Electron 好到值得換。
- **Neutralinojs**：和 Tauri 一樣用系統 WebView（同樣的版本不固定、內嵌介面問題），功能更少、沒有 Steam 套件，適合小工具，不適合要長期維護的 3D 遊戲。

### 3.5 「直接用 Steam 的網頁」：不可行

Steam 發行的是可執行檔，不代管網頁遊戲。只放一個「打開瀏覽器連到 GitHub Pages」的啟動器，會變成：不能離線、沒有內嵌介面與成就、存檔在玩家的瀏覽器裡（清瀏覽資料就沒了）、Steam 無法更新與驗證檔案。不建議，也可能不符合 Steam 的上架要求（未查證）。

---

## 4. 3D GPU 效能：要注意什麼（給 PoC 用）

1. **自帶的 Chromium vs 系統的 WebView2**：兩者算圖路徑一樣（WebGL→ANGLE→Direct3D 11）。差別在**能不能控制與重現**：Electron 的版本固定、啟動參數都能設；WebView2 的版本跟著玩家的系統、可傳的參數有限。對「偶爾某一版 Chromium 的 WebGL 有回歸」這種事，Electron 可以不升級躲過去，WebView2 躲不掉。
2. **獨立顯示卡**：遊戲已經要求 `powerPreference:'high-performance'`。在雙顯示卡筆電上這只是「請求」；Electron 可以再加啟動參數強制（`force_high_performance_gpu`，依既有知識）。PoC 要在使用者的電腦（AMD RX 6600M 的筆電）確認真的用到獨立顯示卡。
3. **硬體加速被關掉的情況**：驅動太舊被 Chromium 列入黑名單時會退回軟體算圖（就是我們雲端測試那種 1～4 fps）。封裝版應該在啟動時檢查並明講，不要讓玩家以為遊戲本來就這麼慢（這是之後的功能，不是這次）。
4. **Steam 內嵌介面的參數可能有代價**（3.2 的第 1 點）——有開、沒開各量一次。
5. **畫面更新率、垂直同步、視窗／全螢幕**：瀏覽器分頁沒有的問題，桌面版要定（預設跟螢幕更新率）。
6. 這些都**未量**：這次沒有裝封裝器，沒有任何封裝版的 fps 數字。現有的效能數字都是瀏覽器的（使用者電腦上的 Chrome、雲端軟體算圖）。

---

## 5. 存檔位置、更新相容、Steam Cloud

### 5.1 位置
- Electron：localStorage 是 Chromium 的 LevelDB 檔，在 `userData` 目錄（Windows 預設 `%APPDATA%\<應用程式名>`；搜尋到的資料對 Roaming／Local 的說法不一，**以 `app.getPath('userData')` 實際印出來的為準**，PoC 第 4 項）。**不在安裝目錄**，所以 Steam 更新、驗證檔案、重裝都不會動到。
- 這份存檔和網頁版（`https://pyhuanglaw.github.io`）是兩份、互不覆蓋。要帶進度：網頁版選單「匯出」→ Windows 版「匯入」（這條路已經在線上版）。

### 5.2 更新相容——兩個不能變的東西
1. **origin**：用自訂協定載入（例如 `app://fatiao/index.html`），而且**協定名和主機名定了就永遠不改**。改了＝換一個 localStorage，玩家以為存檔不見（其實還在舊 origin 底下）。
2. **`userData` 路徑**（跟著應用程式名）：改名也會讓存檔留在舊資料夾。應用程式名在第一個公開版以前定案。

存檔格式本身照現行規則（新欄位有預設值、舊存檔要能讀，CLAUDE.md §11.5），封裝不影響。

### 5.3 Steam Cloud
- Steam 有兩種雲端存檔（依搜尋到的 Steamworks 文件摘要；官方頁連不上，細節未查證）：**Auto-Cloud**——在 Steamworks 後台設定「哪個資料夾的哪些檔要同步」，**不用改遊戲程式**；和 **Cloud API**——程式自己呼叫讀寫。
- 對這個遊戲：直接把 Chromium 的 LevelDB 資料夾交給 Auto-Cloud 同步**不建議**（那是資料庫檔，含其他瀏覽器資料、會被鎖住、兩台電腦合併會壞）。比較穩的做法是殼這一層把存檔**另外鏡射成一般檔案**（例如 `userData/saves/slot_1.json`），讓 Auto-Cloud 只同步那個資料夾；啟動時若雲端的比較新就讀回 localStorage。這段寫在殼裡（包住 localStorage 的寫入），**不必改遊戲的存檔程式**；但它是新功能，要設計「哪一份比較新」的規則和測試——**之後的任務，不是 PoC 的一部分**。
- 設定雲端要 Steamworks 後台（App ID、配額）→ 使用者的操作。

---

## 6. Windows 安裝、離線、授權——上架前要清的事

- **安裝**：Steam 版就是一個資料夾（Electron 的 exe＋資源＋`win-stage` 的內容）。不需要另外的安裝程式；不需要系統管理員權限。
- **離線**：內容全在本機。唯一的線上相依是 Google Fonts → Windows 版要自帶 Noto Sans TC／Noto Serif TC（OFL 授權；要記進 `LICENSES.md`），入口要能改讀本機字型（要動 `index.html` 或加 Windows 專用入口；另開任務）。
- **素材授權（商業發行前一定要盤一次）**：`LICENSES.md` 自己就寫了幾個「正式發佈前要處理」的檔，而它們現在還在 `assets/` 裡、照規則會進包：
  - `assets/models/Michelle.glb`、`Soldier.glb`、`Xbot.glb`、`readyplayer.me.glb`：`LICENSES.md` 寫「只在實驗用；未打包進遊戲；**正式發佈前應移除**或改用可再散布的檔案」（Mixamo 角色依 Adobe 條款不可單獨再散布）。打包規則把它們列在「無法判定」（程式沒有任何地方指到）。**建議：Windows 版明確排除這 4 個檔**——要 LAWWW／使用者點頭後在 `tools/release/deps.py` 加規則。
  - `assets/models/char/rpm_sample.glb`（Ready Player Me 範例，「僅原型測試用」，v9 起不載入但還在 manifest）、`assets/models/char/vrm_player.vrm`（Seed-san，v9 起不載入；VRM Public License，要標示「Seed-san by VirtualCast, Inc.」）、`mixamo_clips.glb`（Mixamo 動畫，執行期在用）：商業發行能不能帶、要怎麼標示，要逐條對授權條款。
  - 這是「發行前檢查」，不影響現在的網頁版（網頁版現況不變）。
- **殼與 SDK 的授權**：Electron 是 MIT，另附 Chromium 的第三方授權檔（發行包要一起帶）；Steamworks SDK 的 `steam_api64.dll` 依 Valve 的 SDK 條款散布（要有 Steamworks 帳號才拿得到 SDK；使用者的操作）。
- **程式碼簽章**：沒簽章的 exe 從 Steam 啟動通常不會被 SmartScreen 擋（依既有知識；未查證）。先不處理。
- **Steam Deck／Linux**：Electron 也能出 Linux 版，或靠 Proton 跑 Windows 版；這次只評估 Windows，未測。

---

## 7. 採用前的最小驗證（PoC 清單）

全部**不需要付款、不需要 Steam 帳號**；在使用者的 Windows 電腦上做（有顯示卡），由 LAWWW 排、BB 定驗收範圍。PoC 的殼放在獨立目錄（例如 `desktop/`），不動 `src/`、不動網頁版。

| # | 驗什麼 | 怎麼算過 |
|---|---|---|
| 1 | **載得起來**：Electron 殼用自訂協定載入 `dist/win-stage/index.html` | 標題畫面出現、版本字樣正確；用現有的 `tests/deploy_check.py` 的檢查（全部區域、0 個 404、人物是正式 VRM）對封裝版跑一次 |
| 2 | **效能不輸瀏覽器**：同一台電腦，Chrome vs 封裝版 | 校園、溫州街、總圖大廳三個重場景的 fps（用現有的效能面板量），封裝版不低於 Chrome 的九成；確認用的是獨立顯示卡 |
| 3 | **Steam 內嵌介面的參數有沒有代價** | 用 Valve 公開的測試 App ID 480（Spacewar，不用自己的 App ID；依既有知識這是常見做法）試 steamworks.js 初始化與內嵌介面；開／不開各量第 2 項的 fps。內嵌介面出不來也**不算 PoC 失敗**，記錄下來，當作之後要不要做的依據 |
| 4 | **存檔**：位置、容量、更新 | 印出 `userData` 路徑；玩一段存檔→關掉→換一份新的 `win-stage`（模擬更新）→存檔還在；從網頁版匯出、封裝版匯入成功；量一份後期存檔（含備份）佔 localStorage 多少 |
| 5 | **離線** | 拔網路啟動：能玩；記錄字型退回的樣子，決定自帶字型的做法 |
| 6 | **視窗與操作** | 1920×1080 視窗與全螢幕、鍵鼠操作能完成一天的流程（起床→上課→對話→存檔）；列出手機 UI 在桌面上不順的地方（不在 PoC 修） |
| 7 | **容量** | 實際量：殼（Electron 執行環境）未壓縮多少、加上 `win-stage` 合計多少、壓成 zip／7z 多少——填進容量報告的「實際壓縮後容量」 |

PoC 過了以後才需要使用者決定的（都會用到 D13 列的東西，**AI 不做**）：申請 Steamworks、App ID 與費用、商店頁、上傳測試版（Playtest）、Steam Cloud 配額、要不要成就。

---

## 8. 這次沒做、也不能從這份文件推論的

- 沒有安裝 Electron／Tauri／NW.js／Neutralino，**沒有任何封裝版實測數字**（fps、容量、記憶體、啟動時間都是未量）。
- 沒有驗證 Steam 內嵌介面在目前的 Electron 45 上是否正常。
- 官方文件（Electron、Steamworks、Microsoft、npm）這次連不上；標「依既有知識」的幾點（Chromium 的 `file://` 限制、`userData` 預設路徑、Auto-Cloud 的設定方式、Electron 的容量、Playwright 支援 Electron、ASAR 與 Steam 分塊更新）在開工 PoC 以前要對一次官方文件。
- 沒有評估 macOS、Linux／Steam Deck、主機。

---

## 9. 來源（查詢日期 2026-11-11）

**直接讀到頁面的：**
- Electron 發布頁（最新穩定版 v45.3.0、Chromium 156；v46 alpha；v44、v43 仍有修補）：https://github.com/electron/electron/releases
- Tauri 發布頁（tauri v2.12.5、tauri-cli v3.0.0-alpha.6）：https://github.com/tauri-apps/tauri/releases
- Tauri 議題 #6196「Trying to make Steam Overlay work with Tauri」（2023-02-07 關閉；2026-07-24 的社群繞法留言）：https://github.com/tauri-apps/tauri/issues/6196
- steamworks.js（星數、未結議題、README 的 Electron 與內嵌介面說明）：https://github.com/ceifa/steamworks.js ；最近的 commit（2025-09-07）：https://github.com/ceifa/steamworks.js/commits/main
- steamworks-ffi-node（SDK v1.64、功能清單、EXPERIMENTAL 內嵌介面、ASAR 注意事項）：https://github.com/ArtyProf/steamworks-ffi-node
- greenworks（「maintained on a best-effort basis」、Steam SDK v1.62）：https://github.com/greenheartgames/greenworks
- Neutralinojs 發布頁（v6.10.0）：https://github.com/neutralinojs/neutralinojs/releases

**只看到搜尋結果摘要的（頁面本身連不上，內容未逐字核對）：**
- Electron 發布節奏與支援政策（每 8 週、維護最新三個主版本）：https://electronjs.org/docs/latest/tutorial/electron-timelines
- NW.js 版本公告（v0.117.0，Chromium 154）：https://groups.google.com/g/nwjs-general/c/MHNQvSIbxpc
- WebView2 發布方式（Windows 11 內建 Evergreen；建議應用程式仍自行處理未安裝的情況；Evergreen 不能指定版本）：https://learn.microsoft.com/microsoft-edge/webview2/concepts/distribution 、https://learn.microsoft.com/microsoft-edge/webview2/concepts/evergreen-vs-fixed-version
- WebView2 上畫不出 Steam 內嵌介面的討論：https://github.com/MicrosoftEdge/WebView2Feedback/discussions/4019 、Construct 開發者的文章 https://www.construct.net/en/blogs/ashleys-blog-2/trying-show-steam-overlay-1861
- Steam Cloud／Auto-Cloud（不用改程式、以根路徑＋子目錄設定、要先設配額）：https://partner.steamgames.com/doc/features/cloud
- steamworks.js 內嵌介面的問題回報：https://github.com/ceifa/steamworks.js/issues/102
- 第三方的 three.js 上 Steam 指南（Electron＋steamworks.js、Tauri 的 Steam 呼叫走 Rust）：https://www.summerengine.com/make-great-games/threejs-game-on-steam

**連不上、因此未查證的官方來源**：`releases.electronjs.org`、`www.npmjs.com`（steamworks.js 的最新版號）、`partner.steamgames.com`、`docs.github.com`、`learn.microsoft.com`、`electronjs.org` 的文件頁。
