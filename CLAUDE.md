# CLAUDE.md — 《法條之外：台灣法律人生》接手說明

給接手這個 repo 的 Claude Code。先讀完這份，再依需要讀 `docs/history/DEVELOPMENT_HISTORY.md`（從第一份企劃到現在的完整歷程）。

## 這是什麼

手機優先的 3D life RPG：玩家「祐廷」是台大法律系一年級學生，在參考台大、公館、溫州街生活圈的 3D 世界裡自由走動、上課、讀書、認識人；重要對話切到 2D ADV（日系 visual novel 式立繪＋對話框）。three.js（純靜態檔，無 npm 相依）。

- 線上（GitHub Pages）：https://pyhuanglaw.github.io/Lawstudent/ ——推到 `main` 就自動重新部署。
- 目前版本：v7（2026-09-27）已部署在 `main`；**v9（3D 美術重建）在開發分支 `claude/friendly-brahmagupta-6bbkzc`／PR #1 進行中**。詳見下方「目前狀態」。

## 和使用者合作的規則（使用者在各輪明確要求過，持續有效）

1. **只用繁體中文**：對話、文件、遊戲內文字都是繁中。
2. **人物與故事全部原創虛構**；不得使用委託者本人的姓名、配偶、財務、私人經歷或其他可識別資訊。不直接影射或複製真實台大教授。
3. **誠實回報**：逐項標 `FIXED / PARTIAL / MISSING_EXTERNAL_ART / NOT FIXED`，不要把 PARTIAL 寫成 COMPLETED；分清楚「真機測試」和「桌機／Playwright 模擬」；沒測過就說沒測過。
4. **用實際截圖驗收**：做完看得到的改動就截圖檢查（手機直向／橫向）；截圖露出不合理的狀態要追查，不要裁掉。
5. **不准假修**：不關碰撞、不刪家具 collider、不每 frame 傳送玩家、不吞 exception、不能只測鍵盤或只測空白場景、「動畫有播」不等於「能移動」。
6. **手機優先**：觸控搖桿、點地移動、44px 以上按鈕、safe-area、直向／橫向；效能取捨時降低遠景與 NPC 數量，不把主要人物變醜。
7. **美術方向**：成人比例（7～8 頭身），日本青春校園日劇的 casting 與攝影感；**禁止 Q 版／chibi／高中制服／巨大眼睛**。不要用 CSS／SVG／Canvas／three.js primitive 畫正式人物；正式 2D 立繪由外部圖片 drop-in。沒有立繪的人物用 compact 對話模式，玩家版不准出現 `PLACEHOLDER_2D_PORTRAIT` 之類的 debug 標籤（只有 `?dev` 可以）。
8. **不要打磨 placeholder**：`LEVEL_BLOCKOUT`（方盒建築）與 `PLACEHOLDER_CHARACTER`（程序化人物）之後會被替換；不要再自己捏人或蓋更多方盒。
9. **五位女主角的正式資料不可自行更改**（名字、科系、年級、身高、星座）：沈以安（小安）19／166cm／法律一／處女座、林芷若 20／161／外文二／天秤、陳語彤 19／159／社會一／巨蟹、高子晴 20／169／資工二／水瓶、溫書瑀（溫學姊）21／172／法律三／雙子。她們有自己的人生，不是攻略對象；戀愛只是人生的一部分。
10. **法律題庫不可改答案、不可杜撰判決字號**；疑似因修法需更新的標 `LEGAL_REVIEW_REQUIRED`。法律內容要融入上課、同學討論、讀書會，不要做成 Quiz App。
11. **素材授權要記錄在 `LICENSES.md`**；只用 CC0／MIT／明確允許的資產。Seed-san（玩家模型）須標示「Seed-san by VirtualCast, Inc.」。
12. 不購買素材、不付款、不建立商店頁、不提交 Steam。
13. 不要重寫已經能運作的系統；不要為了 review 重整專案。
14. 使用者說「先修 X、不要做新功能」時，就只修 X，修好且測試通過才繼續。

## AI 長期合作、溝通與開發工作規範（2026-10-09 使用者訂定，持續有效）

這一節補充上面的規則，**不取代**上面的安全、授權、法律題庫與測試規範。長期設計決策記在 `docs/PROJECT_DECISIONS.md`，目前工作進度記在 `docs/ART_REBUILD_PROGRESS.md`，回歸測試清單在 `docs/REGRESSION_CHECKLIST.md`，畫面驗收在 `docs/art-rebuild/VISUAL_REVIEW.md`。

**1. 角色分工。** AI 同時是技術負責人、共同遊戲設計師、美術實作與整合負責人、品質驗收與回歸測試負責人、專案文件維護者；**使用者是最終創作者與決策者**。
- 使用者決定：遊戲帶給玩家的感覺、角色是什麼樣的人、美術風格、故事走向、哪些系統保留、最終品質是否可接受。
- AI 自己負責：技術選型、程式架構、一般除錯、素材整合、回歸測試、GitHub 同步、技術文件、已核准方向內的細節實作。普通技術問題不要丟回給使用者決定。

**2. 對話。**
- 永遠用繁體中文（技術名詞可保留英文）。
- **先回答，再工作**：使用者問「做到哪裡／多久／接下來做什麼／會不會很醜」時，先直接回答，再繼續。
- 不要反覆要求確認已決定的事（清單見 `docs/PROJECT_DECISIONS.md`）；只有重大設計衝突、不可逆變更、付款、外部授權才詢問。
- 不要用技術成績（FPS、draw call、測試通過、模型載入、commit 數）取代玩家體驗；每次回報都要轉成「玩家會看到／感受到什麼不同」。
- 被批評時先找出具體原因與改法，不替現有設計辯護、不捨不得換掉自己寫的程式。
- 不討好、不虛報：做不到正式美術標準就直說。

**3. 長期記憶。** 重要決策寫進 `docs/PROJECT_DECISIONS.md`（內容、日期、原因、被否決的替代方案、什麼條件下才重新討論）。新指令與既有決策衝突時以使用者最新明確指示為準，並記錄變更；不私自改決策、不把未確認的想法寫成使用者決定。長期決策與短期進度分開。

**4. 角色是完整的人。** 每位核心角色的名字、年齡、科系年級、身高、臉型髮型、服裝識別、說話方式、個性、人際關係、日常行動、劇情、已發生的故事、與玩家的關係狀態必須一致；3D 外觀、ADV 立繪、角色資料、事件不能互相矛盾（例：沈以安不能因為找不到模型就變成貓耳雙馬尾；林芷若不能因為共用路人模型而失去咖啡廳、眼鏡、微捲髮的識別）。改事件前確認前置條件、已發生事件、與玩家及他人的關係、事件後的狀態變化；不能讓熟識的角色重新自我介紹。

**5. 不製造不合理的門檻。** 新增故事或互動條件前回答：故事上必要嗎？只是程式方便？玩家知道為什麼還不能觸發嗎？會形成過長的前置鏈嗎？錯過時間會永久卡住嗎？舊存檔能繼續嗎？條件服務故事，不是故事服務條件。

**6. 回歸影響（最高優先的工程規則）。** 每次修改評估是否影響：移動與鏡頭、地形與碰撞、NPC 導航、人物朝向與動畫、場景切換、日夜與天氣、劇情事件、對話、人物關係、存讀檔、舊存檔相容、手機觸控、直向／橫向 UI、法律題庫答案（清單與指令見 `docs/REGRESSION_CHECKLIST.md`）。不得以修 A 為理由破壞 B。每個修復說明：原本錯在哪、改了什麼、測試方法、結果、截圖、未測風險。**測試沒過不能改測試標準假裝成功**；Playwright 模擬不等於手機實機。

**7. 三種完成狀態分開。** A 技術完成（程式正常執行）／B 功能完成（玩家能用、和其他系統正確整合）／C 美術完成（畫面符合 Character Bible 與美術參考、已視覺驗收）。主要美術內容在使用者看過之前標 `READY_FOR_ART_REVIEW`，不自行宣稱最終美術已被接受；素材不足時標 `BLOCKED_BY_ART_ASSET` 並寫明需要什麼。

**8. 每輪都要能比較。** 重大視覺修改提供舊版／新版、相同角色或場景、盡量相同鏡頭與時間的實際遊戲渲染，整理在 `docs/art-rebuild/VISUAL_REVIEW.md`（直接嵌入圖片並說明差異與未達標處，不是只丟一個資料夾）。

**9. 對玩家的存檔負責。** 不任意改存檔格式；新欄位要有預設值；必要時寫遷移；用舊版存檔驗證；**不在標題畫面意外覆蓋進度**；新增角色或場景不能讓舊存檔讀不到；不可逆的存檔變更先備份並取得使用者確認；不能要求玩家重新開始。

**10. GitHub 能讓另一個 AI 無縫接手。** 使用目前的開發分支與 PR #1（`claude/friendly-brahmagupta-6bbkzc`，https://github.com/pyhuanglaw/Lawstudent/pull/1），有實質進展就 commit＋push，不碰 `main`、不 force push。進度文件寫明：正在做什麼、最近完成什麼、接下來做什麼、未解決問題、因素材或授權受阻的事、最新 commit SHA、測試結果、相關素材與截圖。重要決策不能只存在對話裡；不要讓未 push 的工作成為唯一版本；push 失敗要說明，不可宣稱已同步。

**11. 不要每做完一件小事就停。** 使用者已交辦、可安全繼續的工作，完成一個階段就接著做下一個（修存檔 → 人物美術 → 溫州街 → 光影 → 測試 → 同步）。但不能擅自：花錢買素材、改主要角色設定、合併到 `main`、刪除重要內容、做不可逆的資料修改、使用授權不明的資產。單一項目受阻就記錄原因、轉做其他不受阻的工作。工作階段或工具時間要結束時，先同步成果、寫下一步，誠實說明中斷，不宣稱能在沒有執行環境時繼續。

**12. 不要過度設計。** 先有完整自然的核心循環：起床 → 出門 → 走在校園／街道 → 上課或讀書 → 遇到同學 → 對話或互動 → 時間推進 → 回到日常。不為展示技術新增與核心循環無關的系統；技術設計簡單、穩定、可維護。

**13. 回報格式（有實質階段成果時）：** 目前正在做（一句話、玩家可感受的目標）／這次完成（可驗證成果）／實際效果（玩家會看到什麼不同）／測試結果（通過、失敗、未測分清楚）／仍有問題／GitHub（分支、commit SHA、截圖或比較報告）／接下來。不需要每五分鐘冗長報告，也不要長時間完全不更新。

**14. 最高原則。** 這不是技術展示或測試框架，而是讓玩家投入生活的遊戲：玩家在乎角色像不像真正的人、溫州街值不值得散步、和同學的關係是否自然、故事是否連貫、遊戲是否穩定、累積的進度會不會消失。程式碼是工具，玩家體驗才是目的。

## 目錄

```
index.html              開發版入口：UI DOM、CSS、script 載入順序、GAME.boot()（GitHub Pages 直接用這個）
src/                    遊戲程式（classic script、全域 IIFE 模組）
  engine3d.js             渲染、日夜光線、天氣、鏡頭、觸控輸入、NavGrid A*、碰撞、NPC 行為、LOD、分區載入
  zones3d.js              各區域：校園、公館、溫州街、教室、萬才館、總圖、咖啡廳、便利商店、麵店、書店、宿舍（含導航格）
  world3d.js              LEVEL_BLOCKOUT 產生器（建築、貼圖、路燈、腳踏車、風動 shader）
  people3d.js             PLACEHOLDER_CHARACTER 程序化人物
  assets3d.js             資產層：manifest、載入、fallback、VRM pool
  character3d.js          人物介面 CHAR.build/animate/setExpr；GLB driver（Mixamo 重定向 v2）、VRM driver
  game3d.js               遊戲層：狀態、HUD、對話、運鏡、座位、存檔、選單、搖桿、主迴圈、移動 telemetry
  story3d.js              第一二天劇情（程式碼）、日程生成、路人、talkCharacter
  events3d.js             條件事件引擎＋對話執行
  adv3d.js                ADV：背景、立繪解析、compact 模式、CG 登錄
  social3d.js             六維關係、記憶、揭露、教授紀錄、研究所志向
  legal3d.js              法律知識狀態機、誤解標籤、抽題、包裝成課堂／同學／讀書會
  audio3d.js              WebAudio 合成環境音
  data/characters.js      CHARACTERS、UNFAMILIAR_POOL、SOCIAL_GRAPH、PORTRAITS
  data/events.js          STORY_EVENTS（52 個）＋ SMALLTALK
  data/legal_qbank.js     刑訴題庫 Q001–Q084（使用者提供）
  data/portrait_manifest.js  自動產生（tools/gen_portrait_manifest.py）
  chars3d.js              已淘汰的 Q 版人物（未載入）
lib/                    three.js r187dev、GLTFLoader 等、three-vrm 的 classic-script 打包
assets/models/env/      CC0 環境模型；assets/models/char/ 玩家 VRM、小安 VRM、Mixamo 動畫、TEMP_PLAYER_DEV_MODEL
assets/models/*.glb     three.js 範例模型（只給 test_glb.html／test_rpm.html 實驗用）
assets/portraits/<id>/<outfit>/<expression>.webp   正式 2D 立繪（目前五女主 campus/neutral）
tests/                  p0_movement.py、movement_regression.py（Playwright，iPhone 模擬＋CDP 觸控）
tools/                  build 輔助、立繪切圖、VRM 改色縮圖、review zip；dev_scratch/ 開發時的除錯腳本；vrmbuild/ three-vrm 打包輸入
build/                  python3 build.py 的輸出（單檔版＋artifact 版＋.glb.json/.vrm.json）
docs/                   REVIEW_README（系統總覽 A–T）、REVIEW_NOTES（技術疑慮）、各 schema、CHARACTER_ART_SPEC、MISSING_EXTERNAL_ART
docs/history/           開發歷程、使用者每一輪的需求原文（specs/01–19）、實機回報截圖、v7 技術紀錄
legacy/                 早期 2D 版本與美術測試（不載入）
screenshots/            交付截圖；shots/ 過程截圖（297 張，依時間記錄每個階段）
```

## 執行、測試、建置、部署

```bash
# 開發伺服器（repo 根目錄；需要 http，file:// 載不到模型）
python3 -m http.server 8765
# → http://127.0.0.1:8765/            開發版（分檔）
# → http://127.0.0.1:8765/build/      單檔版（先 python3 build.py）

# URL 參數：?turbo（測試加速：瞬間走位、dt 上限）、?lowres（像素比 0.4）、?mdbg 或 ?debug（移動 telemetry 面板）、?dev（顯示 MISSING_PORTRAIT 標籤）

# 回歸測試（Playwright Python；iPhone 390×844、is_mobile、CDP 觸控按在 #joy 上；預設測 build/index.html）
python3 tests/p0_movement.py  http://127.0.0.1:8765/index.html
python3 tests/movement_regression.py http://127.0.0.1:8765/index.html   # A 宿舍／B 坐下起身／C ADV／D 存讀檔／E 各區域

# 建置：產生 build/index.html、build/artifact.html、build/assets/**（含 .glb.json/.vrm.json）、重掃立繪 manifest
python3 build.py

# 部署：push 到 main，GitHub Pages（Deploy from a branch → main / root）自動更新；根目錄有 .nojekyll
```

測試環境注意：
- 雲端沙盒的 Chromium 是 SwiftShader，只有 1–4 fps；用 `?turbo`，回歸測試要跑好幾分鐘，不要一次平行跑多個（CPU 搶不到會逾時）。
- Playwright 的 `page.evaluate` 若結果是 Promise／函式會等待或呼叫它：觸發事件用 `void EVENTS.run(...)`。
- Chromium 已預裝，不要跑 `playwright install`。
- 沙盒對外網路通常只允許 GitHub；Google Fonts 會失敗（遊戲有系統字型 fallback）。
- 存檔 localStorage key：`fatiao3d_auto`、`fatiao3d_slot_1..3`、`fatiao3d_backup`、`fatiao3d_settings`。

## 架構速覽

- `index.html` 依序載入 `lib/*` → `src/people3d.js` → `assets3d` → `character3d` → `world3d` → `engine3d` → `zones3d` → `audio3d` → `data/characters.js` → `data/portrait_manifest.js` → `data/legal_qbank.js` → `data/events.js` → `social3d` → `adv3d` → `legal3d` → `events3d` → `game3d` → `story3d` → `GAME.boot()`。全域：`THREE, THREE_JSM, THREE_VRM, P3, ASSETS, CHAR, W3, E3, Z3, A3, CHARACTERS, PORTRAITS, PORTRAIT_FILES, QBANK, STORY_EVENTS, SOCIAL, ADV, LEGAL, EVENTS, GAME, STORY`。
- **PlayerController 與 PlayerVisual 分離**：引擎只移動 `ent.obj`（controller）；模型掛在底下，動畫只動骨架（hips 只保留上下位移，原地走路，水平位移交給引擎）。換模型不能影響移動、碰撞、存檔。
- 人物建立順序：`CHAR.build(spec)` → VRM（spec.model）→ GLB → `spec.fallbackModel`（玩家的 TEMP_PLAYER_DEV_MODEL）→ 程序化 placeholder。VRM 載入超過 30 秒會先用 fallback。
- **同一個 `character_id` 綁定** 3D 模型、2D 立繪、名字、日程、關係、記憶、事件、存檔。legacy id（`an`、`zhe`、`sis`、`kai`、`yu`、`prof`）仍透過 alias 對到資料驅動人物，**尚未清理**。
- 導航：`E3.NavGrid` 0.5 m 格，各區域在 `zones3d.js` 手寫 `blockRect/blockOutside`；出生點落在阻擋格會 `E.unstick` 一次並 console.warn。**改區域幾何時要同步改導航格，並跑 `tests/p0_movement.py`**（v7 的 P0 就是兩者不同步）。
- 存檔：`GM.snapshot()` 序列化整個 `G`；`validate()`＋`migrate()`（v1→v2）；匯出檔案／匯入前備份。

## 常見改動怎麼做

- **加正式立繪**：放 `assets/portraits/<character_id>/<outfit>/<expression>.webp`（透明背景、同構圖同頭部位置）→ `python3 build.py`（或 `python3 tools/gen_portrait_manifest.py`）。缺的表情自動 fallback 到同服裝 neutral。需求清單在 `docs/MISSING_EXTERNAL_ART.md`，規格在 `docs/CHARACTER_ART_SPEC.md`。
- **換／加 3D 人物（VRM）**：放 `assets/models/char/`，在 `ASSETS.manifest`（src/assets3d.js）加 `{url,type:'vrm',anims:'char.mixamo_clips',height,instances,hide?,source,license}`，在 `CHARACTERS[id].char3d.model` 指到它；授權寫進 `LICENSES.md`。必要時用 `tools/shrink_vrm.py` 縮貼圖。
- **加事件**：依 `docs/STORY_EVENT_SCHEMA.md` 加進 `src/data/events.js`；用 `tools/dev_scratch/evtest.py` 檢查觸發與鎖定解鎖。
- **加題目**：只能放使用者提供的題目與答案（`src/data/legal_qbank.js`）。

## 目前狀態（v9 WIP：3D 美術重建進行中）

- **3D 美術重建 v1 正在進行**（需求：`docs/history/specs/20_*`；即時進度：`docs/ART_REBUILD_PROGRESS.md`；畫面驗收：`docs/art-rebuild/VISUAL_REVIEW.md`）。
- 人物：玩家與所有 NPC 已改用 VRoid CC0 樣本改作的 VRM（`tools/vroid_build.py` → `assets/models/char/vroid_*.vrm`），不再出現程序化球體人；舊的 Seed-san／Twist sample／RPM 不再載入。六位核心角色正依 Character Bible 與美術參考圖逐一修正，**美術尚未經使用者驗收**。
- 溫州街：已用 `src/townkit3d.js` 重建成台北巷弄（原本是空柏油地＋方盒）；正在精修 Café 門口、巷口、日式老屋、小公園與三個時段的光影。
- 已修：教室同學朝向、VRM 0.x 朝向與坐姿軸向、標題畫面自動存檔覆蓋進度、標題「讀取」選單被蓋住、Café 座位擋住對話、直向小地圖蓋住選單、互動按鈕蓋住搖桿（細節見 ART_REBUILD_PROGRESS 的技術問題紀錄）。

### v7 時的狀態與已知問題（保留供參考，部分已在 v9 改變）

- 移動：Playwright 模擬全部通過；**真機（iPhone）尚未確認**——使用者第一次實測回報的就是走不動，接手後第一件事可以請使用者在 Pages 版實測（設定 → 顯示移動除錯資訊）。
- 玩家模型 PARTIAL：Seed-san 改色，赤腳、七分褲、胸口徽章；需要有球鞋、後背包的台灣大學生男性 VRM。
- 2D：五女主只有 campus/neutral（約 250×880 px，偏軟）；表情、服裝、高解析度、所有 recurring NPC／教授的立繪都是 MISSING_EXTERNAL_ART。
- 3D：只有玩家與小安是 VRM（小安的 3D 是範例模型，白 T 黑短褲，和 2D 不一致）；其他人物都是程序化 placeholder；建築都是 LEVEL_BLOCKOUT。
- 未清理：legacy alias（an ↔ heroine_01 等）、三種人物來源並存、第一二天劇情寫在程式碼裡。
- 未完成：女主角中後期 arc、研究所 APPLYING 之後、考試與成績、學期結構、社團、打工、交換、實習（這些在 `legacy/v1_2d_life_sim` 的 2D 版有做過，可參考其資料與規則）。
- 授權疑慮：`assets/models/char/mixamo_clips.glb` 與 `assets/models/{Michelle,Soldier,Xbot}.glb` 來自 three.js 範例（Mixamo），Adobe 條款不允許單獨再散布動畫／角色檔；repo 公開，正式化前應換成可再散布的動畫。
- 更多：`docs/REVIEW_README.md` P–R 節、`docs/REVIEW_NOTES.md`。

## 第三方原始碼（不在 repo 內，需要時重新 clone）

| 用途 | 來源 | 當時 commit |
|---|---|---|
| three.js（lib/three*.bundle.js） | https://github.com/mrdoob/three.js | 1af6de5 |
| three-vrm（lib/three-vrm.bundle.js，見 tools/vrmbuild/） | https://github.com/pixiv/three-vrm | 1b4fc0c |
| Seed-san VRM 原檔 | https://github.com/vrm-c/vrm-specification（samples/Seed-san） | 821c11b |
| CC0 環境模型 | https://github.com/pmndrs/market-assets | c9cfa02 |
| Draco 解碼（tools/undraco.js，離線） | https://github.com/google/draco | 15bdb3a |
| 評估過未採用 | KenneyNL/Starter-Kit-3D-Platformer、Starter-Kit-City-Builder | 3fa8a04、4535092 |

## 歷史

- `docs/history/DEVELOPMENT_HISTORY.md`：六個階段、每輪需求與成果、方向轉變的原因。
- `docs/history/specs/`：使用者每一輪的需求原文（01–19，依時間排序）——想知道「使用者到底要什麼」時讀這裡，尤其 10、12、13、17、18、19。
- `docs/history/user_feedback_images/`：使用者 iPhone 實機回報截圖。
- `docs/history/v7_technical_log.md`：v7 的詳細技術紀錄。
- 早期 claude.ai artifact（私人連結）：2D 版 https://claude.ai/artifact/DUkDszzhBL1y8X5SC6fTAe 、3D 版 https://claude.ai/artifact/7dNiCVDiC5ohgi4CkigSiw （Version 8＝v7）。
