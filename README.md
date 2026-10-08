# 法條之外：台灣法律人生 — 3D×ADV 原型（v2）

即時 3D、第三人稱、手機優先的 life RPG 原型。你是台大法律系一年級的學生：
讀（或不讀）指定案例 → 上民法總則 → 被周教授點到 → 走出霖澤館 → 小安追上來 →
一起走椰林大道、出校門、穿過公館到溫州街的咖啡廳（或總圖）→ 坐下聊天 →
你的選擇會被記住 → 光線變成黃昏 → 晚上去公館吃麵 → 回宿舍睡覺 → 第三天自由行動。

所有人物與故事皆為虛構。多數 NPC 模型為程序化生成的 **PLACEHOLDER_CHARACTER**、世界為 **LEVEL_BLOCKOUT**——都不是最終美術。主角使用 VRM（Seed-san by VirtualCast, Inc. 改色版）、小安使用 VRM（three-vrm 範例模型）；五位女主角的 2D 立繪為使用者提供的正式圖（campus/neutral）。其餘 NPC 仍是 PLACEHOLDER_CHARACTER；沒有立繪的人物在對話時用 compact 模式（不顯示 placeholder）。

v2 新增：ADV 模式（3D→2D 對話演出→3D）、資料驅動 NPC 社會網絡（五位主要女主角、熟同學、不熟同學 pool、其他系、教授、助教）、六維關係＋NPC 記憶＋揭露階段、條件事件引擎（事件包 v1＋v1.1：52 個）、刑事訴訟法題庫融入上課／讀書會／同學討論、研究所志向骨架、CC0 環境資產與可替換資產層。詳見 docs/。

## 遊玩

- **線上（GitHub Pages）：https://pyhuanglaw.github.io/Lawstudent/** — 直接載入根目錄的 `index.html`（分檔載入 `lib/`、`src/`、`assets/`，不需要 build）。
  第一次需在 repo 的 Settings → Pages → Build and deployment 選 **Deploy from a branch → `main` / `(root)`**。根目錄有 `.nojekyll`，GitHub 不會跑 Jekyll。
- 本機：在 repo 根目錄 `python3 -m http.server 8765`，開 `http://localhost:8765/`（需要靜態伺服器；`file://` 無法載入模型）。
- 單檔版：`python3 build.py` 產生 `build/index.html`（內嵌全部程式）與 `build/artifact.html`（claude.ai artifact 用）；`build/` 不進 git。
- 測試：`python3 tests/p0_movement.py http://127.0.0.1:8765/index.html`、`python3 tests/movement_regression.py http://127.0.0.1:8765/index.html`（Playwright，iPhone 直向模擬＋觸控搖桿）。

## 操作

| 手機 | 桌機 |
|---|---|
| 點地面走過去（遠處會用跑的） | 滑鼠點地面 |
| 單指拖曳旋轉鏡頭、雙指縮放 | 拖曳旋轉、滾輪縮放（未實作）／WASD 移動、Shift 跑 |
| 左下虛擬搖桿（可在設定關閉） | 空白鍵／Enter 互動或推進對話 |
| 右下「跑」切換、「◎」鏡頭回正 | Esc 開關選單 |
| 靠近人或物件時右下出現互動按鈕 | |

建議橫向遊玩；直向會出現提示，點一下可以直接直向玩。

## 系統

- 時間：自由行動時 1 遊戲小時 ≈ 2.5 分鐘實際時間；上課、讀書、聊天直接推進。日出／白天／黃昏／藍調時刻／夜晚有不同光線、天空、霧與路燈。
- 天氣：每天隨機（晴／陰／雨）。
- 區域：台大校園（法學院區、椰林大道、傅鐘、校門、總圖、校史館、行政大樓、文學院、宿舍）、公館（羅斯福路、騎樓店家、捷運站入口）、溫州街（公寓、小公園、兩點半 Café）、室內（霖澤館教室、萬才館大廳、總圖閱覽室、咖啡廳、便利商店、麵店、書店、宿舍房間）。區域是進入時才建立（chunk 載入）。
- NPC：五位主要女主角、熟同學、其他系同學、助教、八位教授各有日程與對話；20 位不熟同學會從「不認識」逐步揭露名字；社會圖上的朋友會一起走、站著聊、坐一起；路人走路、騎腳踏車、坐長椅讀書；認識的人靠近時會揮手。
- 法律內容：民法總則（§154、§88、§91、§153、§71）寫在劇情裡；刑事訴訟法題庫 84 題融入週二上課、週三讀書會、同學討論、小考（day 13 起）；答錯會記成「誤解」，之後讀書時會回頭補。
- 研究所路線：說明會（週五 15:00 萬才館）→ 跟溫學姊聊 → 她給的文章（讀書時選讀，三次）→ 吵一次；階段 NONE→CURIOUS→CONSIDERING→PREPARING。
- 存檔：自動存檔（進出區域、事件結束、每 45 秒）、3 個手動欄位、匯出（複製文字／下載檔案）、匯入（貼上文字或選擇 .json）。匯入前自動備份、驗證欄位與版本、舊版自動補欄位。
- 設定：畫質（低／中／高，中以上有陰影）、搖桿、音量、文字速度、FPS 顯示。
- 聲音：全部以 WebAudio 合成（鳥叫、風與樹葉、黃昏蟬鳴、公館車流、咖啡廳杯盤、腳步）。

## 專案結構

```
index.html          開發版入口
build.py            打包腳本 → build/index.html（單檔）、build/artifact.html（artifact 用）
lib/three.bundle.js three.js r187dev（自 GitHub 原始碼打包成 classic script）
lib/three-vrm.bundle.js @pixiv/three-vrm（自 TS 原始碼以 esbuild 打包）
src/assets3d.js   資產層：manifest、GLB/VRM 載入、fallback、VRM 實例池
src/character3d.js 人物層：proc / GLB / VRM 三種 driver 的統一介面
src/people3d.js     人物：程序化成人比例模型、髮型（含馬尾動態）、表情、動畫、靜態網格合併
src/world3d.js      世界物件：材質貼圖、建築產生器、樹、路燈、腳踏車、校門、風動 shader
src/engine3d.js     引擎：導航格 A*、碰撞、第三人稱鏡頭、觸控、時間光線、天氣、區域、NPC 行為
src/zones3d.js      區域定義：校園、公館、溫州街、各室內
src/audio3d.js      合成環境音
src/game3d.js       遊戲層：狀態、HUD、對話與運鏡、互動、存檔、設定、主迴圈
src/story3d.js      劇情：人物、日程、路人、事件、法律內容
play.py / shot3d.py Playwright 自動遊玩與截圖測試
shots/              測試截圖
```

## 測試方式與已知限制

- 測試環境：Linux 容器內的 Chromium（Playwright，SwiftShader 軟體算圖）以 844×390／390×844 視窗、觸控事件模擬手機。**沒有在實體 iPhone／Android 上測過**。SwiftShader 沒有 GPU，FPS 數字不代表真機表現。
- 真機效能未知的部分：同畫面 10–15 個人物時 draw call 約 600–900，中階手機可能需要「低」畫質。
- NPC 是程序化 placeholder：臉部與手部粗糙、走路動畫簡單、沒有 skinning。主角是 rigged GLB（RPM 範例）＋ Mixamo idle/walk/run（`CHAR.retargetClip` v2 處理 T-pose→A-pose）。
- 尚未實作：滾輪縮放、更多天數的專屬事件、更多店家互動、社團活動、考試系統（舊 2D 版有）。
- 在 claude.ai artifact 內：下載使用平台的 downloads 能力（會跳出確認）；若不可用，請用「複製文字」把存檔帶到另一支手機。


## 測試

- `python3 tests/p0_movement.py` — 手機直向＋觸控搖桿：8 個出生點移動、點地面、事件鎖定／解鎖、save→reload（需先 `python3 build.py` 並在專案根目錄開 `python3 -m http.server 8765`）。
- `python3 tests/movement_regression.py` — TEST A–E（宿舍／互動／ADV／存檔／各區域）。
- 設定 →「顯示移動除錯資訊」或 URL 加 `?mdbg`：畫面上顯示輸入向量、速度、位置、鎖定狀態、碰撞。
