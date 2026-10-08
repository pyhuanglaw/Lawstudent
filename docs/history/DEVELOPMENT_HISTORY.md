# 《法條之外》開發歷程（2026-09-27 → 2026-10-09）

這份文件記錄這個遊戲從第一份企劃到現在，每一輪討論了什麼、做了什麼、為什麼轉向。

**資料來源與限制**

- 使用者每一輪的需求原文：`docs/history/specs/01–19`（依收到時間排序，內容未修改）。
- 使用者實機回報截圖：`docs/history/user_feedback_images/`。
- v7 那一輪的詳細技術紀錄：`docs/history/v7_technical_log.md`。
- 各時期的程式與截圖：`legacy/`、`shots/`（297 張過程截圖，檔案時間即製作時間）、`screenshots/`（交付截圖）。
- 原始對話逐字紀錄只保留到最後一次 context 壓縮之後（v7 之後）。更早各輪的交付報告原文已不存在；以下早期內容是依程式碼、檔案時間與需求文件重建，標「推定」的地方是重建結果。
- 時間皆為台灣時間（UTC+8）。

---

## 總覽

| 階段 | 時間 | 使用者要求（spec） | 成果 |
|---|---|---|---|
| 1 | 09-27 05:49–06:54 | 01 初版企劃、02 大幅擴充、03 生活感深化／大一上 vertical slice；04、05 國考參考資料 | 2D 回合制人生養成（`legacy/v1_2d_life_sim/`），發佈為 artifact「法條之外」（2D 版） |
| 2 | 07:01–07:31 | 06 重做成直接操控的校園、07 八小時自主開發／第一章、08 手機優先＋跨手機存檔、09 台大＋公館＋溫州街世界地圖 | 2D canvas 美術測試（`legacy/v1_5_2d_art_tests/`）→ 改用 three.js → Q 版 3D 人物（`src/chars3d.js`，後被淘汰） |
| 3 | 07:37–09:43 | 10 日劇成人比例、淘汰 Q 版；11 人中之龍式成人 3D；12 八小時 3D 原型 | 成人比例程序化人物、可走的台大／公館／溫州街、第一二天劇情、手機操控、存檔 |
| 4 | 09:44–13:58 | 13 資產 pipeline、14 刑訴題庫、15 SOURCE REVIEW ZIP、16 NPC 社會網絡／五女主／教授／法研所、17 3D×2D ADV 混合架構 | 資產層、GLB／VRM 人物、資料驅動人物與事件、法律知識系統、ADV 模式、第一份 review zip；發佈為 artifact「法條之外」（3D 版） |
| 5 | 16:54–18:52 | 實機回報＋五女主合圖、18 v7 修復與角色美術整合、19 P0「有動畫但原地走」 | 修好移動、玩家改用 VRM、五女主正式立繪、compact 對話、回歸測試；artifact Version 7、8 |
| 6 | 10-09 04:06– | 「發佈到 github」「所有你有的東西都放上去」 | 本 repo（pyhuanglaw/Lawstudent）＋ GitHub Pages |

---

## 階段 1：2D 回合制人生養成（v1）

**需求**（spec 01–05）

- 01：繁中網頁遊戲，「法律人生養成＋回合制時間管理＋職涯經營」，約 36 回合、律師／司法官／公司法務三條路線、至少 24 個事件、6 種結局、localStorage 存檔＋JSON 匯出入。
- 02：取消 36 回合限制，從大一到職涯中後期；交換學生要可玩；法官、檢察官分成兩條職涯；律師要能玩到合夥與開業；所有職業都有下班後的人生。
- 03：先停止橫向擴充，做「大一上學期」vertical slice；法律學習拆成多種能力（理解、體系、記憶、爭點、涵攝、結構、速度、檢索）；考試要有策略操作；NPC 有自己的人生；Memory Flags；「考上不是 Ending」。
- 04、05：律師考試、司法官考試的制度參考資料。

**做了什麼**（`legacy/v1_2d_life_sim/`）

- 單一 HTML、純 JavaScript＋SVG 場景（09_scenes.js），分成 10 個模組：基礎資料（虛構的「北辰大學法律學系」、課程、教授風格、活動、小事件、考試案例）、NPC 與人生軌跡（小安 安佳蓉、阿哲、溫學姊、阿凱、小語、媽媽、店貓阿判）、大學事件、核心引擎（學習模型、回合結算、學期流程、存檔）、考試引擎（期中期末策略作答）、交換學生、國考（一試二試、訓練、落榜分岔）、職涯（律師／法官／檢察官／法務、合夥、開業）。
- Node `vm` 無頭測試腳本：`test.js`、`scan.js`、`roles.js`、`debug.js`、`svgcheck.js`。
- 發佈為 claude.ai artifact「法條之外」（2D 版）；`legacy/v1_2d_life_sim/index.html` 與 artifact 內容逐字相同（已比對）。
- 更早的「36 回合」版本沒有保留下來。

## 階段 2：轉向「直接操控的校園」

**需求**

- 06：使用者不滿「人物場景不好看、每天只是選上課讀書打工、像文字問卷加數值面板」→ 直接操控人物在校園移動、碰撞、互動，先做好「法律系校園一週」，2D 手繪感 Q 版美術。
- 07：八小時自主開發，做「大一上第一章」，長期目標 Steam；**所有人物故事原創虛構，不得使用委託者的姓名、配偶、財務、私人經歷**；不購買素材、不付款、不提交 Steam。
- 08：改成手機優先（橫向、點擊移動＋虛擬搖桿、44px 觸控）；完整存檔：自動＋3 欄＋匯出檔案＋匯入驗證＋備份＋版本遷移；區分「實機測試」與「桌機模擬」。
- 09：以台大＋公館＋溫州街生活圈為世界（霖澤館、萬才館、總圖、學生活動中心、宿舍、便利商店、社科院、體育館、椰林大道、傅鐘、醉月湖、溫州街咖啡廳營業到凌晨、公館商圈）。

**做了什麼**

- 07:10–07:17：2D canvas 美術測試（`legacy/v1_5_2d_art_tests/`：色票、角色四方向走路坐讀、頭像表情、貓）。
- 07:21–07:25：改用 three.js（從 GitHub clone 原始碼、打包成 classic script，因為環境沒有 npm/CDN），`test3d.html`。
- 07:30–07:31：Q 版 3D 人物 `src/chars3d.js`、`test_char.html`、`shots/char_poses.png`。

## 階段 3：成人比例 3D 原型

**需求**

- 10：**淘汰 char_poses.png 的 Q 版方向**。要的是「一部可以自由走進去生活的日本青春校園日劇」，1:7～1:8 成人頭身，日劇 casting 氣質（男主角參考坂口健太郎、女主角參考天海祐希的氣質，不複製臉），大學生穿搭，日劇攝影感的光線。
- 11：3D 形式參考《人中之龍》（成人比例、城市尺度、走路本身就是體驗），tone 是青春、浪漫、自由，不是黑道。
- 12：八小時自主開發；保留 p_lineupf.png 的成人比例方向；**女主角固定馬尾**；優先順序：3D 基礎 → 成人人物 → 第三人稱手機移動與鏡頭 → 一小塊有台大辨識度的校園 → NPC → 一段完整共同活動 → 光影 → UI → 存檔。

**做了什麼**（推定，依檔案與截圖時間）

- `src/people3d.js`：程序化成人比例人物（PLACEHOLDER_CHARACTER），`shots/g_lineup.png`（08:11）、`p_lineupf`、`p_faces*`。
- `src/engine3d.js`：渲染、時間光線關鍵影格、天氣、第三人稱鏡頭、觸控搖桿與點地移動、NavGrid A*、碰撞、NPC 行為、LOD、分區載入。
- `src/world3d.js`、`src/zones3d.js`：校園（椰林大道、傅鐘、霖澤館、萬才館、總圖）、公館、溫州街、教室、咖啡廳、便利商店、麵店、書店、宿舍（LEVEL_BLOCKOUT）。
- `src/story3d.js`：第一二天劇情——宿舍讀或不讀案例 → 民總周教授提問 → 走出霖澤館、小安追上來 → 一起走到咖啡廳或總圖 → 選擇被記住 → 黃昏 → 公館吃麵 → 宿舍。
- `src/audio3d.js` 合成環境音；`src/game3d.js` HUD、對話、運鏡、存檔。
- 截圖：`shots/p1_*`～`p8_*`（08:42–09:28）、`landmarks_grid.png`（09:40）。

## 階段 4：資產 pipeline、社會網絡、法律題庫、ADV

**需求**（09:44–09:59 連續收到）

- 13：不要推倒重做；正式命名 LEVEL_BLOCKOUT／PLACEHOLDER_CHARACTER；建立可替換的視覺資產層；**不要再自己發明人類**，改用 VRM／CC0 rigged GLB；不要再蓋方盒建築；椰林大道最重要；NPC 分 Tier；法律內容不要變 Quiz App；關係要有記憶。
- 14：刑事訴訟法題庫（使用者整理）；**不得更改答案、不得杜撰判決字號**；知識狀態 unseen→mastered；誤解標籤；可能因修法需更新者標 LEGAL_REVIEW_REQUIRED。檔案在 Q085 截斷，實際載入 Q001–Q084。
- 15：SOURCE REVIEW ZIP（完整原始碼、REVIEW_README A–T、REVIEW_FILE_INDEX、REVIEW_NOTES 10 個疑慮；不放秘密，.env 只給 .env.example）。
- 16：NPC 社會層（熟同學、不熟同學 pool、其他系、五女主、教授、助教、ambient）、五位女主角不是攻略對象而是有自己人生的人、教授會記得玩家、法研所路線、SOCIAL GRAPH、NPC MEMORY、條件式事件、事件資料 schema。
- 17：3D＝世界與探索、2D＝人物與情緒（ADV）、CG＝重大時刻；**不要用程式碼畫動漫人物**，正式立繪由外部圖片提供；portrait registry 與 fallback；Character Bible（CHARACTER_ART_SPEC.md）；relationship 六維；choice 沒有明顯正解。

**做了什麼**

- `src/assets3d.js` 資產層（manifest、fallback、合併）；pmndrs/market-assets 的 CC0 樹、椰子樹、長椅、小道具。
- `src/character3d.js`：GLB driver（RPM 範例＋Mixamo 動畫，rest-pose 重定向 v2）、VRM driver（@pixiv/three-vrm 從 TypeScript 原始碼用 esbuild 打包，見 `tools/vrmbuild/`）；小安用 three-vrm 範例 VRM。
- `src/data/characters.js`（五女主、熟同學、不熟同學 pool 20、其他系、8 位教授、助教、SOCIAL_GRAPH、PORTRAITS）、`src/social3d.js`（六維關係、記憶、揭露階段、教授紀錄、研究所志向）。
- `src/legal3d.js`＋`src/data/legal_qbank.js`（知識狀態機、誤解標籤、抽題、包裝成教授提問／同學討論／讀書會）。
- `src/events3d.js`＋`src/data/events.js`（條件事件引擎；事件包 v1 18 個＋v1.1 34 個＝52）。
- `src/adv3d.js`（ADV 模式：凍結／模糊 3D 背景、立繪槽、表情、選項、歷史、CG 登錄）。
- NPC 並肩走／站著聊、室內時段光線、研究所志向到 PREPARING。
- 文件：`docs/REVIEW_README.md`、`REVIEW_NOTES.md`、`STORY_EVENT_SCHEMA.md`、`CHARACTER_SCHEMA.md`、`ADV_SYSTEM.md`、`CHARACTER_ART_SPEC.md`。
- 13:58 第一份 SOURCE REVIEW ZIP；發佈為 artifact「法條之外」（3D 版）。

## 階段 5：v7 實機回報與修復

**使用者在 iPhone（claude.ai app，直向）實際遊玩後回報**（`user_feedback_images/`）

- 「雖有2D圖你都沒做？劇情到霖澤前就無法推進，動不了」：阿凱、阿哲對話出現灰色墓碑 placeholder；霖澤館前走不動；玩家是灰白禿頭西裝測試模型。
- 提供五位女主角合圖（`assets/portraits_source_sheet.png`），並說「五個女主角2d就用我給你的圖」。
- 18：v7 修復規格（P0 霖澤館前不能動、玩家模型不可接受、五女主正式資料與美術方向、NPC portrait coverage tier、沒有立繪時用 compact 對話、dev 與玩家版分離、截圖 A–G、逐項標 FIXED／PARTIAL／MISSING_EXTERNAL_ART／NOT FIXED）。
- 19：P0 緊急——搖桿有反應、走路動畫有播，但位置不變（宿舍書桌旁、霖澤館附近）；要求畫面上的移動 telemetry、逐層檢查、回歸測試 A–E、手機觸控驗證；列出禁止的假修法。

**根本原因與修法**

- 校園導航格只涵蓋 z∈[−85, 85]，法學院前庭（z −84～−124）全在格子外，被當成牆 → 教室出口、霖澤館門口、校園預設出生點都走不動。擴大導航格、重畫邊界；公館店門口走道延伸；校門出口出生點移開柱子。
- 宿舍起身時被放在書桌旁、半徑內有阻擋格的位置 → 每一步都被碰撞拒絕。改成依半徑找起身點；已經卡住時允許「不變糟」的移動；出生點在阻擋格內時修正一次（`E.unstick`）。沒有關碰撞、沒有刪家具、沒有每 frame 傳送。
- 點地移動在低幀率下被誤判 → 改成「放開時沒滑動＝tap」。
- 加上 TEMP MOVEMENT DEBUG 面板（設定或 `?mdbg`）。

**交付狀態**

| 項目 | 狀態 |
|---|---|
| 霖澤館前／宿舍不能動 | FIXED（Playwright iPhone 模擬＋CDP 觸控；真機待驗證） |
| 玩家模型 | PARTIAL：Seed-san VRM（VirtualCast，須標示出處）改色，黑短髮、墨綠 T、炭灰褲；赤腳、七分褲、胸口徽章。RPM 範例降為 TEMP_PLAYER_DEV_MODEL |
| 五女主正式立繪 | FIXED（campus/neutral，從使用者合圖切出）；表情、服裝、高解析度 MISSING_EXTERNAL_ART |
| recurring NPC 立繪 | 規則與 registry 完成；圖片 MISSING_EXTERNAL_ART |
| 沒立繪時的對話 | FIXED（compact 模式） |
| ADV 結束後恢復移動 | FIXED |
| dev／玩家版分離 | FIXED |
| legacy alias 清理（an ↔ heroine_01） | NOT FIXED |

測試：`tests/p0_movement.py` 全部通過、`tests/movement_regression.py` 42/42、事件 104/104。artifact 更新到 Version 7（P0）與 Version 8（美術整合）。細節見 `v7_technical_log.md`。

## 階段 6：GitHub

- 2026-10-09 04:06「布置到github」→ 04:09「發佈到github Lawstudent」。
- 推送到 `pyhuanglaw/Lawstudent` 的 `main`；使用者在 Settings → Pages 設定 Deploy from a branch → `main` / `(root)`；遊玩網址 https://pyhuanglaw.github.io/Lawstudent/（根目錄 `index.html` 分檔載入，不需 build）。
- 04:23「所有你有的東西都放上去」、04:24「包含我們從一開始怎麼討論這個遊戲、各種修改版本，我之後要重新開對話窗用 claude code 接手」→ 加入 `build/`、`shots/`、`legacy/`、`tools/dev_scratch/`、`tools/vrmbuild/`、`docs/history/`、`CLAUDE.md`。

---

## 方向演變摘要

| 從 | 到 | 原因（使用者原話重點） |
|---|---|---|
| 2D 回合制選單 | 直接操控人物 | 「像文字問卷加數值面板，玩起來很無聊」 |
| 桌機／Steam 優先 | 手機優先、橫向、跨手機存檔 | 「拿起手機就能玩」 |
| Q 版 | 成人 7～8 頭身 | 「不是可愛 Q 版校園遊戲，而是可以走進去生活的日劇」 |
| 程式捏人 | 成熟 humanoid 資產（VRM／GLB） | 「不要再自己發明人類」「先做一個好看的正常人，再讓他走路」 |
| 3D 承擔所有演出 | 3D 探索 × 2D ADV | 「3D 讓玩家活在世界裡，2D 讓玩家記住這些人」 |
| 程式畫立繪 | 外部正式圖片 drop-in | 「不要用程式碼畫動漫人物」；使用者提供五人合圖 |
| 加功能 | 先修可玩性 | 「先讓祐廷可以走路」 |
