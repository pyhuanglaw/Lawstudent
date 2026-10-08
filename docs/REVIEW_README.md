# 《法條之外：台灣法律人生》SOURCE REVIEW README

版本：3D×ADV 原型 v2（2026-09-27）。本文件給另一位工程師／AI 做 code / architecture / game-design review 用。

## A. 專案目前如何啟動

- 沒有 node_modules、沒有 bundler。純靜態檔案：`index.html` + `lib/` + `src/` + `assets/`。
- 本機：`python3 -m http.server 8765` 於專案根目錄，開 `http://localhost:8765/index.html`（開發版，分檔載入）或 `http://localhost:8765/build/index.html`（單檔版）。需要 http（GLB 以 fetch 載入）；`file://` 會讓資產載入失敗而退回 procedural placeholder（遊戲仍可玩）。
- 線上：claude.ai artifact（`build/artifact.html` + `build/assets/**.glb.json`；平台不提供 .glb MIME，所以資產以 `{b64}` JSON 供 `fetch`）。
- 測試工具：`play.py`（Playwright 自動遊玩；`?lowres&turbo` 加速）、`shot3d.py`（截圖）、`test_*.html`（子系統測試頁）。

## B. Build command

`python3 build.py` → `build/index.html`（所有 script 內嵌）、`build/artifact.html`（去掉 html/head/body 外殼的 artifact 版）、`build/assets/**`（GLB＋同名 .glb.json）。沒有 minify、沒有 tree-shaking。

## C. Entry point

`index.html` 依序載入：`lib/three.bundle.js` → `lib/three.jsm.bundle.js` → `src/people3d.js` → `src/assets3d.js` → `src/character3d.js` → `src/world3d.js` → `src/engine3d.js` → `src/zones3d.js` → `src/audio3d.js` → `src/data/characters.js` → `src/data/legal_qbank.js` → `src/data/events.js` → `src/social3d.js` → `src/adv3d.js` → `src/legal3d.js` → `src/events3d.js` → `src/game3d.js` → `src/story3d.js` → `GAME.boot()`。
全部是 classic script、全域 IIFE 模組（`THREE, THREE_JSM, P3, ASSETS, CHAR, W3, E3, Z3, A3, CHARACTERS/PORTRAITS/SOCIAL_GRAPH, QBANK, STORY_EVENTS/SMALLTALK, SOCIAL, ADV, LEGAL, EVENTS, GAME, STORY`）。原因：環境無法使用 npm/CDN，three.js 由 GitHub 原始碼手動打包。

## D. Folder structure

```
index.html            開發版入口（UI DOM + CSS + script 順序）
build.py              打包
lib/three.bundle.js   three.js r187dev core+modules（classic script）
lib/three.jsm.bundle.js  GLTFLoader / SkeletonUtils / BufferGeometryUtils
src/people3d.js       PLACEHOLDER_CHARACTER：程序化人物、髮型、表情、動畫、mergeStatic
src/assets3d.js       ASSET LAYER：manifest、loader、fallback、instance
src/character3d.js    CHARACTER LAYER：build/animate/setExpr 統一介面；GLB driver（Mixamo 重定向）
src/world3d.js        LEVEL_BLOCKOUT 產生器：貼圖、建築、樹（fallback）、路燈、腳踏車…、風動 shader
src/engine3d.js       渲染、時間光線、天氣、鏡頭、觸控、導航格 A*、碰撞、NPC 行為、LOD
src/zones3d.js        區域定義（校園、公館、溫州街、教室、萬才館、總圖、咖啡廳、便利商店、麵店、書店、宿舍）
src/audio3d.js        WebAudio 合成環境音
src/data/characters.js CHARACTERS / UNFAMILIAR_POOL / SOCIAL_GRAPH / PORTRAITS
src/data/legal_qbank.js 刑訴題庫（使用者提供，Q001–Q084）
src/data/events.js    STORY_EVENTS（事件包 v1）＋ SMALLTALK
src/social3d.js       關係、記憶、揭露、教授紀錄、研究所志向
src/adv3d.js          ADV 演出層＋立繪解析＋CG 登錄
src/legal3d.js        法律知識系統（狀態、誤解標籤、抽題、自然語言包裝）
src/events3d.js       條件事件引擎＋對話執行器
src/game3d.js         遊戲層：狀態、HUD、對話框、選項、互動、運鏡、存檔、設定、主迴圈
src/story3d.js        劇本層：第一、二天的固定劇情（程式碼）、日程生成、路人、環境事件、talkCharacter
src/chars3d.js        （已淘汰）舊 Q 版人物；未載入，保留供 reviewer 對照
assets/models/env/*.glb   CC0 環境資產（見 LICENSES.md）
assets/models/char/*.glb  RPM 範例 avatar＋Mixamo 動畫（原型用）
assets/models/*.glb   three.js 範例模型（僅 test_glb.html 實驗用；未打包）
tools/undraco.js      Draco glTF → 未壓縮 GLB（Node）
docs/                 本文件、schema、美術規格
test_*.html           子系統測試頁；play.py / shot3d.py 自動測試
```

## E. Major systems

| 系統 | 檔案 | 狀態 |
|---|---|---|
| 3D 世界與探索（移動、碰撞、鏡頭、觸控、分區載入） | engine3d, zones3d, world3d | 可玩 |
| 時間／天氣／光線（日夜關鍵影格、路燈、室內燈、雨） | engine3d | 可玩 |
| 人物：placeholder 程序化 ＋ GLB 主角 ＋ VRM 小安 | people3d, character3d, assets3d, lib/three-vrm.bundle.js | 主角 GLB、小安 VRM 可玩；其他 NPC 仍 placeholder |
| 資產層（manifest、fallback、merge） | assets3d, people3d.mergeStatic | 可玩 |
| NPC 日程（資料驅動）、Tier 0–3、揭露 | story3d.populateSchedule, social3d | 可玩 |
| 關係（6 維）、記憶、社會圖、教授紀錄 | social3d | 可玩（顯示於人物面板） |
| 事件引擎（條件、觸發、對話、後果） | events3d, data/events.js | 可玩（52 個事件：v1 18 ＋ v1.1 34） |
| ADV 模式（背景、立繪、表情、選項、歷史） | adv3d | 可玩（立繪皆 placeholder） |
| 法律知識（題庫、狀態、誤解、抽題、上課／讀書會／同學包裝） | legal3d, data/legal_qbank.js | 可玩 |
| 研究所志向 | social3d.grad + 事件 + game3d.gradReadingSession | NONE→CURIOUS→CONSIDERING→PREPARING 可達（說明會、學姊給的文章讀三次、吵一次）；APPLYING/ADMITTED 未做 |
| NPC 與 NPC（社會圖配對：並肩走、站著聊、朋友坐一起） | story3d.pairUp, engine3d（buddy/chat） | 可玩 |
| 室內時間感（窗色、地板光斑、暖燈／冷燈、黑板依課表） | zones3d.room.applyTime, engine3d, story3d | 可玩 |
| 存檔（自動、3 欄、匯出／匯入、驗證、備份、遷移 v1→v2） | game3d | 可玩 |
| 手機控制（搖桿、拖曳鏡頭、雙指縮放、跑、回正、safe-area、直向提示） | engine3d, game3d, index.html | 可玩（僅模擬測試） |
| 環境音 | audio3d | 可玩 |

## F. Gameplay loop

第一天晚上宿舍（讀或不讀案例）→ 第二天民總（周教授提問，答案取決於是否讀案例）→ 走出霖澤館、小安追上來 → 一起走到咖啡廳／總圖 → 對話與選擇 → 黃昏 → 公館吃麵（阿哲）→ 宿舍 → 之後自由：課表（週二刑訴、週四民總）、讀書會（週三法服）、圖書館讀書（把混淆的爭點讀懂）、咖啡廳、公館、溫州街；資料驅動事件依地點／時間／天氣／關係／記憶觸發；NPC 依日程出現。時間在自由行動時流動（1 小時≈2.5 分鐘）。

## G. Rendering architecture

three.js WebGLRenderer、ACES tone mapping、sRGB；HemisphereLight＋DirectionalLight（陰影，中／高畫質）＋室內 PointLight；自製天空 shader（球體跟隨鏡頭）；霧；雨為 Points；風動為材質 `onBeforeCompile` 頂點位移。區域建立後 `P3.mergeStatic` 依材質合併靜態網格（校園 ~1900 → ~500 個 mesh、draw call ~1500 → ~250）。LOD：遠處路人不渲染、動畫降頻。沒有 post-processing、沒有 instancing。

## H. Character architecture

`CHAR.build(spec)`：spec.model 指到 ASSETS 的 rigged GLB 時走 GLB driver（SkeletonUtils.clone、AnimationMixer、Mixamo 動畫重定向 `CHAR.retargetClip` v2（沿階層算世界旋轉、每根骨頭固定補償 C=inv(Bs)·A·Bd，A 為目標→來源 rest 骨頭方向的最小旋轉，解決 T-pose→A-pose 與 +X/+Y 骨軸慣例差異；舊版 `retargetClipSimple` 保留對照）、sit/read 用靜態骨骼姿勢、talk/wave 用骨骼覆寫、mouthOpen/mouthSmile morph）；否則 `P3.build`（PLACEHOLDER_CHARACTER）。引擎與劇本只呼叫 `CHAR.animate / CHAR.setExpr / CHAR.headY`。

**VRM driver**（`spec.model` 指到 `type:'vrm'` 的資產）：`lib/three-vrm.bundle.js`（@pixiv/three-vrm，esbuild 打包）＋ `VRMLoaderPlugin`；資產層在 preload 時把同一個 buffer 解析成 N 個實例放進 pool（three-vrm 沒有 clone），`CHAR.build` 取一個、`E.removeNPC / loadZone` 釋放。動畫：Mixamo clip → normalized humanoid bones（官方 loadMixamoAnimation 作法）；sit/read/wave/talk 直接寫 normalized bone rotation（`SIT_VRM/READ_VRM`）；表情 `expressionManager`（happy/relaxed/surprised/sad/angry、blink、aa 口型）；注視 `vrm.lookAt.target`。目前小安（heroine_01，含 legacy `an`）用 VRM 範例模型；主角用 RPM GLB；其他 NPC 為 placeholder。要換人：把 .vrm 放進 `assets/models/char/`、在 `ASSETS.manifest` 加 `{url,type:'vrm',anims:'char.mixamo_clips',height,instances}`、在 `CHARACTERS[id].char3d.model` 指到它。

## I. Environment architecture

`Z3.ZONES[id].build(E)` 產生區域：地面／道路、建築（`W3.building` 產生器＝LEVEL_BLOCKOUT）、樹（`ASSETS.get('tree.*')`，CC0 GLB；無資產時退回 W3.banyan/palm）、長椅（GLB）、小道具（GLB）、導航格阻擋、互動點、鏡頭碰撞盒、路燈光暈。室內由 `room()` 產生牆／燈／窗，牆面依鏡頭淡出。

## J. NPC architecture

三層：程式碼固定劇情用的 legacy NPC（an/zhe/sis/kai/yu/prof，`GM.spawnNPC`）；資料驅動人物（`CHARACTERS` + `daily_schedule` → `populateSchedule` → `GM.spawnCharacter`）；ambient extras（`spawnExtra`／`spawnRider`，含牽腳踏車、坐長椅讀書、站著聊天）。行為：idle/wander/route/follow（並肩）、buddy（跟另一個 NPC 並肩走）、chat（兩人面對面輪流說話）、seat、greet（揮手）、lookAt。`STORY.pairUp` 在 populate 後依 `SOCIAL_GRAPH`（＋pool 同學隨機）把同區有空的兩人配對；`friendSeat/seatNear` 讓圖上的朋友坐相鄰座位。legacy id（an/zhe/sis/kai/yu）在第二天劇情結束後（`afternoonDone`）也會由資料日程補位（同一人不重複：先查 `EVENTS.npcOf`）。對話入口 `STORY.talkCharacter(id)` → `EVENTS.onInteract(id)` → 否則 SMALLTALK／pool 揭露。

## K. Dialogue / event architecture

見 docs/STORY_EVENT_SCHEMA.md、docs/ADV_SYSTEM.md。共用對話框（打字機）、選項、caption（走路時的非阻塞字幕）、cinematic 3D 運鏡（two/ots/close/wide/front/sky）＋ ADV 立繪層。舊劇情（第一、二天）仍是程式碼（story3d.js），已接上 ADV 與記憶。

## L. Legal knowledge architecture

見 src/legal3d.js。狀態機 unseen→seen→confused→learned→understood→mastered；答錯記 misconception tag（程式端依章節標註，非法律見解）；抽題優先 confused（隔天）→ unseen → 到期複習；包裝成教授提問（含教授反應與教授紀錄）、同學隨口問、讀書會、（小考／考試預留 context）；讀書把 confused→learned 並顯示核心考點；筆記本「法律」頁顯示各章節狀態與易混淆處。題庫檔在 Q085 截斷，載入 84 題；Q085 標記 LEGAL_REVIEW_REQUIRED（不完整）。

## M. Save architecture

`GM.snapshot()` 序列化整個 `G`（含 social/events/legal/cg）；`validate()` 檢查版本與必要欄位；`migrate()` 補欄位（v1→v2：舊 rel 遷移為 fam/trust）；localStorage 自動存檔＋3 欄；匯出＝base64(JSON) 文字（可複製）或檔案（artifact 用 downloads capability；一般瀏覽器用 blob 下載）；匯入＝貼上或選檔，匯入前備份 `fatiao3d_backup`。

## N. 哪些是 placeholder

- **PLACEHOLDER_CHARACTER**：除主角與小安外的所有 NPC 與路人（`src/people3d.js`）。主角為 RPM 範例 avatar（棕西裝、光頭；casting 不符，僅證明 pipeline）；小安為 three-vrm 範例 VRM（白 T 黑短褲、棕長髮；不是依 Character Bible 製作的，僅證明 VRM pipeline）。
- **PLACEHOLDER_2D_PORTRAIT**：全部立繪（圖片尚未提供）。
- **LEVEL_BLOCKOUT**：所有建築（`W3.building` 方盒＋貼圖立面）、道路、室內牆面桌椅書櫃、公館店面、溫州街公寓、校門／傅鐘／總圖門廊等地標。
- 程序化 fallback 樹（W3.banyan/palm/bush）與腳踏車、路燈、販賣機等 props。
- 天空 shader、雨、環境音（合成）。

## O. 接近 production 的部分

事件 schema 與引擎、關係／記憶／揭露模型、法律知識狀態機與抽題、ADV 流程與 fallback、存檔驗證／遷移、資產層 manifest 與 fallback、導航格與碰撞、日夜關鍵影格系統。

## P. 已知 bugs

1. （已修）事件 `enter` 觸發在讀檔進入區域時不再觸發（`enter(...,{fromLoad:true})`）；但 `auto` 觸發（例如雨天總圖門口）讀檔後仍可能在幾秒內發生。
2. `freeze` 背景會停在當下的 cinematic 鏡頭（有時是主角手部特寫）。
3. 主角 GLB 在 sit/read 為靜態姿勢，坐下瞬間無過渡；站立→坐下時腳步可能穿過椅子。sit/read 骨骼表是手調的（對 RPM），換模型需重調。
4. NPC 之間沒有互相碰撞，路人可能重疊。
5. 教室座位分配：資料驅動人物與 legacy NPC 各自分配，週四民總時 pool NPC 可能與 extras 重疊座位。
6. 校園導航格 0.5 m，狹窄處（校門）路徑會貼牆。
7. 手機：長按拖曳與點擊在極慢幀率下可能誤判為拖曳；未在實機驗證。
8. 「法服讀書會」事件需要 `lawclub` 旗標（看過公告）才觸發，玩家可能不知道。
9. 3D 人物與 ADV 立繪的名稱：3D 名牌用暱稱（小安），立繪用暱稱／全名混用。
10. NPC 配對（chat）把兩人設為 frozen；玩家搭話結束後兩人會慢慢轉回面對彼此（已處理），但配對是進入區域時一次決定，不會解散或換人。
11. （測試環境）SwiftShader 1–3 fps，`STORY.tick` 每 30 幀執行一次 → 在測試環境中「小安追上來」等每 0.5 秒輪詢的觸發可能延遲 10–20 秒（真機 30–60 fps 不受影響）。

## Q. 已知 technical debt

- 全域 IIFE 模組、無型別、無測試框架（只有 Playwright 腳本）。
- story3d.js 的第一、二天劇情是程式碼而非事件資料；legacy NPC id（an/sis/prof）與 character_id 需要 ALIAS 對照。
- zones3d.js 每個區域是一大段命令式程式，沒有資料化的 level 格式。
- 三個「人物來源」（legacy spawnNPC、spawnCharacter、extras）尚未統一。
- 三 bundle 檔為手工打包（無 sourcemap）。

## R. 尚未完成項目

- 五位女主角：只有初遇與少量後續事件（各 1–3 個）；沒有中後期 arc、告白／交往／分手、結局。
- 研究所路線：到 PREPARING 為止（說明會、文章、與學姊爭論）；沒有選組 UI、口試、放榜（APPLYING/ADMITTED）；NPC 不會考研究所。
- 考試（小考／期中／期末／國考）：LEGAL.ask 有 context 但沒有考試事件與成績。
- 學期／學年結構、選課、社團活動、打工、交換、實習、生病／疲勞／考前焦慮。
- CG Gallery UI、auto 模式、正式立繪／背景／CG 圖片。
- NPC 之間的互動只有「並肩走／站著聊／坐一起」的演出，沒有 NPC 之間的對話內容與關係變化。
- 關係衰減（淡掉）。
- 真機效能測試。

## S. 外部 assets（名稱、來源、license）

見 LICENSES.md。摘要：three.js（MIT）；Draco decoder（Apache-2.0，僅離線工具）；market.pmnd.rs 的 CC0 模型（Kenney：palm-detailed-long、tree-big；Sara Vieira：low-poly-tree、bench；其他 CC0 小道具）；three.js examples 的 readyplayer.me.glb（RPM 範例，原型用）與 Xbot.glb 的 Mixamo 動畫（Adobe 條款，不可單獨再散布）；Noto Sans/Serif TC（OFL）。

## S2. v7（2026-09-27 傍晚）P0 修復與角色視覺整合

- **P0 root cause**：校園 NavGrid 只涵蓋 z ∈ [-85,85]，法學院前庭（z -84～-124）全在格外＝阻擋 → 霖澤館前不能動；公館店門口出口在 blockOutside 之外；宿舍書桌起身位置只檢查中心點不檢查半徑。修法見 `tests/p0_movement.py`、`tests/movement_regression.py` 與 REVIEW_NOTES 13。
- 玩家模型：`char.vrm_player`（Seed-san 改色、隱藏機械配件）；RPM 範例降為 `TEMP_PLAYER_DEV_MODEL`（fallbackModel）。`CHAR.build`：VRM → GLB → fallbackModel GLB → 程序化。
- 2D：五位女主角 `campus/neutral` 由使用者合圖切出（production）；`PORTRAIT_FILES` manifest；`ADV.hasProductionPortrait / portraitQuality`；沒圖的人物走 compact 模式，玩家版本沒有 placeholder 標籤。
- 資料：五位女主角 `height_cm`、`zodiac`（正式），3D 身高同步。
- TEMP MOVEMENT DEBUG 面板（設定或 `?mdbg`）。

## T. 最近 8 小時實際修改／新增的檔案

新增：src/assets3d.js、src/character3d.js、src/social3d.js、src/adv3d.js、src/legal3d.js、src/events3d.js、src/data/characters.js、src/data/legal_qbank.js、src/data/events.js、tools/undraco.js、assets/models/env/*.glb、assets/models/char/*.glb、test_assets.html、test_rpm.html、docs/*。
（本次續作新增／修改：src/character3d.js 重定向 v2；src/engine3d.js buddy/chat 行為、室內時段光；src/zones3d.js room.applyTime、窗色、光斑、暖燈、黑板 setBoard、時鐘、投影幕、咖啡廳吊燈；src/story3d.js pairUp、friendSeat、profSpec、legacy 補位、黑板課表；src/game3d.js gradReadingSession、studySession 選項、GM.updateInteract/snapshot；src/events3d.js 行內 consequences；src/data/events.js v1.1 事件包 34 個；src/data/characters.js 日程補充；src/legal3d.js 是非題措辭。）
修改：index.html（腳本順序、法律頁、設定、z-index）、src/game3d.js（bindSystems、spawnCharacter、ADV 鉤子、人物／法律面板、存檔 v2、downloads）、src/story3d.js（populateSchedule、talkCharacter、ADV、記憶）、src/zones3d.js（資產層替換樹／椅／道具、花圃）、src/engine3d.js（LOD、跟隨、揮手）、src/people3d.js（mergeStatic 保留 vertex color、眼睛）、src/world3d.js（風動 shader、警衛室、招牌高度）、build.py。
