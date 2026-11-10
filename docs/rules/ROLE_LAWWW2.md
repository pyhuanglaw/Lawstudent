# LAWWW2 職位頁（美術總監：3D 美術、場景程式）

> 先讀 `CLAUDE.md`（共同規則，美術底線在 §9），再讀這一頁。帳號 A 叫 LAWWW2，帳號 B／C／D 叫 LAWWW2-B、LAWWW2-C、LAWWW2-D。幫 LAWWW2 做美術的任何 AI、子代理也照這一頁。
> 這一頁合併了原本的 `ART_DIRECTION.md` 第 12 節、`second_ai/RULES_2D_TO_3D.md`、`SCENE_RULES.md`、`ART_SOP.md`（2026-11-10，以 LAWWW2 分支的版本為準）。其他文件寫「SCENE_RULES §5／§9／§11／§12」「ART_SOP 第 9 節」「RULES_2D_TO_3D」「ART_DIRECTION 12.x」就是這一頁第 4、5、3、2 節裡同編號的那一段。美術聖經（參考圖、人物外觀、街景、光影、鏡頭）照舊在 `docs/art-rebuild/ART_DIRECTION.md` 第 0～11 節。

## 1. 職責與權限（D100 第 3 點、D108、D111、D84、D128）

- **3D 美術**：Blender 建模、3D 場景、模型、3D 人物模型；持續追蹤所有美術 WIP、已交付還沒整合的素材。**2D 背景圖不歸你**（BB 跟使用者要，D104：不需要互動的圖由使用者生成，3D 只做玩家會走進去、會互動的場景和人物）。
- **場景相關的程式也歸你**（D108）：區域與配置、模型接線、場景導航與碰撞、場景鏡頭碰撞、場景效能與光影；推自己的分支、跑相關的 Node 單元測試，LAWWW 合併。劇情流程、事件、存檔、系統照舊是 LAWWW。**改 `engine3d.js`、`game3d.js`、`story3d.js`、`character3d.js`、`assets3d.js` 先告訴 LAWWW。**
- **美術總監**（D111）：3D 美術在自己的領域決定；整體畫風由你提案、BB 和 LAWWW 同意就定案（D128）。
- **主動領工作**（D84 第 2 點）：`python3 tools/handoff/check_handoff.py queue --owner LAWWW2 --ref origin/<RULE_SOURCE>`，從「可以做的」挑最前面的（已批准、職責內、不是「等待」），在自己的 HANDOFF.md 用任務 ID 寫狀態，通知同帳號值班 LAWWW（LAWWW 改 `xai.ack`＝自領）；不必每次等指示。照 D81 先做玩家最早遇到的，不做低優先級裝飾填時間；不做還沒批准的場景設定。手上沒工作先問 LAWWW，也可以問 AA 劇情要哪些場景、道具。
- **人物**：照通過的參考圖調整 Blender／VRM 角色模型；角色美術由 LAWWW 驗收（D100a）；**不自己大改重要人物的外觀**（大改 LAWWW 定案），穿模之類的小錯誤可以自己修。人物美術凍結照 D99（夠用就不再精修）。
- **交付以後由 BB 測**，你不必自己跑流程測試；建築、場景的 `ART_APPROVED` 由 BB 標（D120）；你沒空驗收支援 AI 的模型時，交 BB 照這一頁的標準代驗（D132；BB 自己做的不由 BB 驗）。
- **權限**：只 push 系統指定的分支（帳號 A 是 `claude/second-ai-env-art`）；不碰 main、不發布；成果交 LAWWW 整合；不合併 LAWWW 開發分支的程式（規則檔用 `git show origin/<RULE_SOURCE>:<檔>` 讀）；不得因換班覆蓋還沒整合的模型。
- **接班必讀**：這一頁、自己的 `docs/art-rebuild/second_ai/HANDOFF.md` 最上面、`sop_demo/README.md`、第 3 節範例表的三個 README。**新容器接班第 14 步之後馬上跑 `bash tools/blender/setup_env.sh`**（D144：bpy 5.2.2、EGL、VRM Add-on、VRoid CC0 樣本；裝過的跳過；不用問使用者）。

### 1.0 使用者的電腦可以跑 Blender——慢的工作丟過去（使用者 2026-11-03：「其他 AI 的 Blender 也可以給我的電腦做」；2026-11-10 22:4x：「我的電腦都有裝了……都已經測試過了，而且都已經跑過了，為什麼你們會不知道交接前都已經做過的事情」）
- 使用者的 Windows 電腦（RX 6600M）**已經裝好 Blender 5.2、已經跑過**。雲端容器沒有顯示卡、CPU 少，算預覽圖、烘焙、整條街的匯出很慢——**超過幾分鐘的 Blender 工作排到她的電腦**，不要在雲端硬算，也不要再問她要不要裝。
- 排法（細節在 `claude/cc-testing` 的 `tools/cc_local/README.md`「別人的 Blender 工作」）：在 `tools/cc_local/queue.txt` 加一列，kind 寫 `blender`，SHA 寫 `lawww2`（你分支最新）或指定 commit；腳本在別的分支用 `ENV SCRIPT_FROM=`；例：`ID | lawww2 | blender | tools/blender/env_second/<腳本>.py | index.html | 120 | XARGS=--out {out}`。佇列是 CC 的檔——把那一列交給 CC 排（直接傳訊息，副本 BB）。
- Blender 項目在她電腦上永遠單獨跑、**一律只用 CPU**（使用者 11-03 選的，`CC_BLENDER_DEVICE` 強制 CPU）；結果在 `claude/cc-local` 的 `docs/story_planning/CC/local_out/<ID>/`。
- 接班必讀這一段；交班時寫明哪些 Blender 項目還在她電腦的佇列裡。

### 1.1 檔案範圍
| 範圍 | 誰 |
|---|---|
| `tools/blender/env_second/**`、`assets/models/env/second_ai/**`、`assets/models/char/second_ai/**`、`docs/art-rebuild/second_ai/**` | LAWWW2 |
| `src/zones3d.js` 的場景區塊、`src/townkit3d.js`、各區域的 `src/data/*_layout.js`、`src/assets3d.js` 的「第二個 AI 的資產」標記區（兩行 `// ====` 之間，只在區塊內增減） | LAWWW2（D108；共用 helper 的行為要改先通知 LAWWW） |
| `LICENSES.md` 最後的「第二個 AI」小節 | LAWWW2（只在小節內追加） |
| `tests/` 新檔（用場景名開頭） | 各自，檔名不重複 |
| 劇情、事件、存檔、系統、`index.html`、`build.py`、`tests/playlib.py` | LAWWW |

交付流程：在自己分支做完一個場景（Blender 腳本、GLB、整合程式、測試、截圖、`second_ai/` 紀錄）→ push、在 `outbox_LAWWW2.json` 登記 → 通知 LAWWW → LAWWW `git merge --no-ff`、跑 `zone_transitions`、`reachability_all`、`p0_movement` 等回歸 → 測試退步由 LAWWW2 修自己的部分；衝突在 LAWWW2 的區塊時 LAWWW 先問，不自己刪。

## 2. 製作規範（原 ART_DIRECTION 第 12 節；D38、D5、D6、D9、D10、D33）

- **美術方向**（D5）：Premium Stylized 3D Life Simulation——精緻、自然、略帶日系的 3D 生活模擬；不是 Q 版、不是低多邊形藝術、不是純 2D 視覺小說、也不追求電影級寫實。
- **2026-10-09 的美術參考圖是正式 Art Direction Reference**（D6）：六位核心角色的臉、髮型、服裝、比例，溫州街的建築密度、店面、植物、材質、光影都以它為目標；角色身分以 Character Bible 為準；不准把參考圖當遊戲背景；遊戲截圖要和參考圖並排比較。
- **3D 人物用成熟的 humanoid 資產（VRM／rigged GLB）**（D9），程序化人物只當開發 fallback；人物素材採 VRoid Studio β CC0 官方樣本改作（`tools/vroid_build.py`），主要角色不接受「只換色」（D10）。
- **工具鏈**（D33）：Blender 5.2.2 的 `bpy`（無介面）寫腳本建模 → 程序化材質烘焙成 PBR → 匯出 GLB（WebP 貼圖）→ Three.js GLTFLoader；HDRI 用 Poly Haven CC0 的 GitHub 鏡像（`pmndrs/drei-assets`）；專案 Skill `.claude/skills/blender-web-3d`。安裝一律 `bash tools/blender/setup_env.sh`（D144）。
- **溫州街氛圍**（D15）：日本生活街道般的舒服氛圍，同時保留台灣城市元素（台北公寓、騎樓巷弄、繁中招牌、機車腳踏車、便利商店小吃、咖啡廳文化）。

> 原文：`docs/history/specs/22_永久3D美術製作規範.txt`。這是長期有效的強制開發規則，任何接手專案的工作階段都必須遵守。

#### 12.1 最高原則：禁止回到廉價 3D 原型美術

正式美術定位：**成人比例、日系青春生活模擬的細膩質感、具有台灣大學校園與台北都市辨識度的 3D 世界**。遊戲要讓玩家覺得身處真實、完整、值得探索的生活環境。

以下方法**不得當作正式美術的主要製作方法**：

- 大量使用 `BoxGeometry`、`CylinderGeometry`、`SphereGeometry` 拼出完整建築、家具及人物；
- 用 Canvas 隨機畫幾何斑點、色塊或線條，冒充石材、磚牆、木材與混凝土；
- 只靠增加幾何裝飾數量來宣稱美術品質提升；
- 同一組模型換顏色，就當作不同重要角色或地標；
- 只改顏色、亮度、霧氣與陰影，就宣稱完成全面美術翻新；
- 用獨立模型預覽圖代替正式遊戲畫面驗收；
- 把測試通過當成美術品質達標。

這些方法**仍可用於**：碰撞體、導航、遠景、效能最佳化、不可見輔助物件、開發階段的 blockout、正式模型載入失敗時的備用。**正式近景美術以品質為準，不能用最容易寫程式的方式取代真正的模型製作。**

#### 12.2 每類美術資產的指定工具

| 資產類別 | 主要製作工具 | 正式成果 |
|---|---|---|
| 校園主要建築 | Blender bpy | 結構完整的 GLB 建築 |
| 樓梯、穿堂、走廊、電梯 | Blender + Three.js | 可實際行走、探索的空間 |
| 室內與家具 | Blender bpy | 有合理比例與材質的模型 |
| 台北公寓、騎樓、店面 | Blender + 模組化建築組件 | 具有台灣城市特色的街景 |
| 紅磚、石材、木材、柏油 | Poly Haven PBR + Blender | Base Color、Normal、Roughness 等材質 |
| 近景小道具（盆栽、冷氣、街道雜物、桌上小物） | Poly Haven／ambientCG 的 CC0 實景掃描模型 → `lib2.ph_model`（減面、貼圖 512、半透明 alpha clip） | 造型和材質都是真的小道具 |
| 主角與重要 NPC | Blender + VRM／three-vrm | 有獨特外觀及完整動作的角色 |
| 人物動作 | Blender Animation + 現有骨架系統 | 行走、上下樓、坐下、互動 |
| 樹木、機車、腳踏車 | Blender + Three.js Instancing | 近景精緻、遠景輕量 |
| 天空、天氣與光線 | Three.js + 合法 HDRI | 隨時間變化的環境 |
| 模型與貼圖壓縮 | glTF Transform、Meshopt、KTX2 | 手機可流暢載入的最佳化資產 |
| 視覺與遊玩測試 | Playwright + Blender Render | 實際畫面、互動測試與新舊比較 |

指定的是工具用途與品質流程，不代表每項資產都必須用全部工具。已有品質更好、授權合法的正式模型可以直接使用。

**實景掃描小道具（R1；LAWWW2-C 提、LAWWW-C 和 BB 同意，D128 定案，2026-11-04）**：
- 只用 Poly Haven、ambientCG 的 CC0 模型；不要有品牌的東西（D77）。
- 貼圖預設 512。玩家常在 1 m 內看到的桌上小物，遊戲截圖看起來糊的話可以用 1024。
- `LICENSES.md` 一個模型記一列。
- 第一次用在阿德影印的冷氣、盆栽（`0a6f626be`）。

**TripoSR 試過（BB_259）**：只適合玩家走不到 3 m 內的有機小雜物，**目前不用**。單張圖轉 3D 的其他 AI（TRELLIS.2 等）見 `second_ai/research/OPEN_SRC_2D3D_1104.md`：要 NVIDIA 顯示卡，也不適合店面、建築。

#### 12.2b 同角度疊圖門檻與 TripoSR（D138）
- **驗收鏡頭結構**：有使用者參考圖的場景，交件前用 `tools/art/same_angle_check.py` 把參考圖和同角度的**遊戲截圖**疊起來（Blender 渲染只能預看），量消失點、左右兩半的垂直線傾斜、參考圖東西比較多的格子（紅框）；交件附 `_overlay.jpg`、`_structure.json`、鏡頭設定。暫定門檻（6 組圖校過）：消失點差 ≤2%、垂直線傾斜差 ≤1.5°、長寬比 ±3%、紅框 ≤3／24；鏡頭對好了比例還不對就改 layout，不硬湊 FOV；紅框逐格補東西。和 `ref_match`（只量光和顏色）互補——青木茶室鏡頭歪 10%，ref_match 照樣報 ALL PASS。
- **校園建築用 `--mode campus`**（D136）：分數不是越高越好——大體量、材質、開窗節奏要接近，對好位置以後細部（窗型、裝飾、屋頂輪廓）1:1 重疊的格子要是 0；報 REVIEW_COPY 就看橘框，是照抄的改成自己的設計。
- **TripoSR**（MIT，CPU 約 1 分鐘，`tools/art/triposr/`；目前不用，要用之前先問 BB）：只限 Poly Haven 和 `tools/blender/plants.py` 都做不出來、玩家走不到 3 m 內的中遠景有機小雜物（盆栽、袋子、布、雜貨堆），用 `cleanup_tsr.py` 整理、顏色調回參考圖。**不准用**：近景、桌上的東西、要坐／互動／碰撞的、建築、家具主體、人物、頭髮、有品牌的、被遮住一半以上的；第三方照片不能當輸入。預算：中景 ≤8,000 面、遠景 ≤2,000 面、每個 GLB ≤300 KB，重複的用 instancing；LICENSES.md 寫 TripoSR、commit、權重 sha256、輸入圖來源；驗收附正面、45° 和參考圖並排，加一張遊戲內實際距離的截圖，近看穿幫就退回手做。頭髮改法還沒在遊戲裡驗證，不寫。

#### 12.3 Blender 優先：標準流程

重要建築、近景店面、主要室內家具、需要精細造型的物件，原則上用 Blender 製作：

1. 蒐集或讀取現有參考照片（使用者提供的照片不放進 repo：`/root/.claude/uploads/…`、對話紀錄；`docs/history/specs/` 有文字描述）；
2. 確認比例、尺寸、構造與辨識特徵（照片、配置圖、本頁第 7 節的 D25、D28、D31、D37）；
3. 用 Blender Python `bpy` 建模；
4. 用合理的 PBR 材質；
5. 必要時 UV 展開與烘焙貼圖；
6. 匯出 GLB；
7. 整合進現有 Three.js 世界；
8. 驗證導航、碰撞、互動與樓層（`tests/nav_buildings_unit.js`、`tests/reachability_all.py`、真實流程測試）；
9. 壓縮與最佳化；
10. 提供實際遊戲截圖給使用者驗收。

**Blender 模型完成，不等於遊戲美術完成**；只有在正式遊戲中正確顯示、可正常互動、畫面符合品質目標後，才有資格進入最終驗收。

**本專案的做法（v9.4 起）**：

- Blender：`/opt/blenv`（PyPI 的 `bpy` 5.2.2，無介面；`/opt/blenv/bin/python 腳本.py -- 參數`）。EEVEE 渲染需要 `apt install libegl1 libegl-mesa0 libgl1-mesa-dri libgbm1`（`bash tools/blender/setup_env.sh` 一次裝好，D144）。
- 貼圖：`tools/blender/fetch_polyhaven.py`（Poly Haven CC0：顏色 diff、法線 nor_gl、粗糙度 rough，1k）→ `tools/blender/textures/<id>/`；匯出 GLB 時縮到 512、轉 WebP。
- 建模腳本：`tools/blender/<物件>.py`（例：`linze_interior.py`）。**配置和遊戲共用一份**（例：`src/data/linze_layout.js`，`const X=` 後面是純 JSON），導航、互動點、模型位置一定一致。
- 座標：遊戲 (x 東, y 上, z 南) ＝ Blender (x, −z, y)；glTF 匯出 +Y up 會轉回遊戲座標。
- 節點命名約定（遊戲照名字整合）：`L0_*`／`L1_*`＝第幾層（多樓層剖面視角用）；名字含 `WALL_`＝會淡出的外牆，自訂屬性 `dir`＝往室內的法線；不放在 GLB 的東西：要動的（電梯車廂、門）、中文字（門牌、告示，遊戲用 canvas 畫）、點地面用的透明地板（遊戲由配置產生）。
- UV：每個面依法線方向用世界座標投影（`box_uv`，材質自訂屬性 `tile`＝每幾公尺重複一次），磚縫、地磚的尺寸對得上真實尺寸。
- 整合：`ASSETS.manifest` 加 `type:'building', lazy:true`（進區域才載入）；載入失敗就用程序化備用模型（導航、互動不受影響）。

#### 12.4 禁止製作不能探索的假建築

主要可進入的建築必須支援真正的空間探索：進入大廳及穿堂；走上樓梯與平台；在不同樓層移動；搭乘電梯；進入開放的教室、圖書館及其他房間；NPC 在不同樓層活動；鏡頭、碰撞、尋路和人物動畫正確配合；玩家可以正常離開，不會永久卡住。D26 的平面高度限制已由 D36 取代。允許分階段完成樓層，但**不能用不可行走的裝飾樓梯冒充完成**。Blender 負責視覺與必要的碰撞幾何；Three.js 的移動、導航和互動系統負責實際可玩性。

#### 12.5 人物美術品質

主角與重要 NPC：成人比例（約 7–8 頭身）；各自獨特的五官、髮型與服裝；自然的人體比例與衣物輪廓；外觀和個性、背景一致；可靠的走路、跑步、轉身、坐下、上下樓梯；不穿模、不滑步、不漂浮。VRoid 樣本可以當基礎，但不能因為技術上可載入就視為最終角色模型；優先改善臉型、髮型、衣服輪廓與動作，而不是只改色彩。

#### 12.6 材質品質

近景用合理的 PBR 工作流程，優先用授權明確的 Poly Haven 資產；依材質特性使用 Base Color、Normal、Roughness、Metallic、Ambient Occlusion（不要求每種材質都有五張，重點是物理表現、模型細節與整體風格）。紅磚有自然排列、接縫與表面細節；混凝土與花崗石不能是單色平面；木材有紋理與粗糙度；玻璃有合理透明度與反射；金屬欄杆與扶手有自然光澤；柏油維持使用者指定的淺灰（D30）。不為了真實感破壞整體風格或手機效能。

#### 12.7 既有程式資產的處理

`src/campuskit3d.js`、`src/townkit3d.js`、`src/world3d.js`（以及 `zones3d.js` 的室內家具、`building3d.js` 的備用模型）不必全部刪除，逐項分成：①已達品質要求可保留 ②適合遠景或背景 ③適合當碰撞、導航或 GLB 載入失敗時的備用 ④主要近景模型、必須升級 ⑤已被正式 GLB 取代、停止當預設畫面。清單與替換狀態：`docs/art-rebuild/ASSET_INVENTORY.md`。不重寫整個引擎，不破壞劇情、人物資料與玩家存檔。

#### 12.8 永久視覺驗收制度

每次重大美術修改必須提交：①真實照片或既有美術參考 ②修改前遊戲截圖 ③修改後遊戲截圖 ④相同角度、相近時間與光線條件的比較 ⑤Blender 模型渲染圖 ⑥GLB 模型與貼圖規格（檔案大小、三角面數、材質數、貼圖尺寸與格式） ⑦手機模擬測試結果 ⑧實機尚未驗證的事項 ⑨Git commit SHA ⑩尚未達到參考品質的缺點。禁止只用文字說「現在比較精緻」「材質改善」「細節增加」，要讓使用者實際看到差異（`docs/art-rebuild/VISUAL_REVIEW.md` 直接嵌圖）。

**照參考圖做的店面、場景（R2；LAWWW2-C 提、LAWWW-C 和 BB 同意，D128 定案，2026-11-04）**：驗收要附參考圖鏡頭（焦距、shift_y、眼睛和看的點的遊戲座標）和同角度疊圖（`tools/art/same_angle_check.py`，D138）。
- **2D 轉 3D 的完整流程（使用者 2026-11-05 03:4x 對 LAWWW2-C：「疊圖畫出來的3d真的很棒寫成規則 以後任何2d轉3d都要參考這次透過開源或者新增的各種美術方法都要寫進規則交接給下一個lawww2」）**：照本頁第 3 節——拆圖＋左右順序、反推參考圖鏡頭（`fit_refcam.py`）、候選鏡頭比較、同角度疊圖（R2）、把構圖鎖進 Node 測試、四格對照交件、照實寫取捨；開源和新做的美術方法列在那份的工具表，有新的就加一列。
- 店面用 `--mode shop`，越像越好（D133）。校園建築用 `--mode campus`，照抄檢查要是 0（D136）。
- 交件附 `_overlay.jpg`、`_structure.json`。
- 遊戲做成鏡像的，比對用翻過來的參考圖。
- 原本的鏡頭位置在遊戲裡被擋住的話，用走得到的位置：同一個方向、同一個焦距，參考圖照比例裁中間（2:30 AM 外觀第二版的做法）。

驗收狀態：

| 狀態 | 意思 |
|---|---|
| `BLOCKOUT` | 原型或佔位資產（程序化方塊、canvas 貼圖） |
| `MODEL_READY` | 正式模型已製作（Blender／GLB），還沒整合 |
| `INTEGRATED` | 已整合進正式遊戲（載入、位置、樓層正確） |
| `FUNCTIONAL_VERIFIED` | 相關互動已完成測試（導航、碰撞、樓層、互動點） |
| `READY_FOR_ART_REVIEW` | 等美術驗收（建築、場景 BB；角色 LAWWW） |
| `ART_APPROVED` | 美術驗收通過：**建築、場景由 BB 標**（D120），**角色由值班 LAWWW 標**（D100a）；美術驗收不經使用者（D128） |

#### 12.9 效能不是粗糙美術的預設理由

目標是**精緻而有效率**：可重用模型與材質、Instancing、LOD、貼圖壓縮、幾何最佳化、適當的資產分區載入、遠景簡化、合理的光影品質分級。主要人物、關鍵建築與玩家常停留的近景是品質優先保障區。**沒有量測實際效能之前，不能以手機效能為由把主要人物或建築退回廉價方塊模型**。

#### 12.10 執行與交接

以後任何新增建築、室內、人物與街景，開工前先判斷適合的製作工具，不得自行退回舊的低品質程序化方法。每次開發回報寫明：實際使用的建模工具、材質來源、整合情況與驗收狀態。

## 3. 照參考圖做：2D 轉 3D（原 RULES_2D_TO_3D.md；D140、D138、D136、D141）

**使用者 2026-11-05 03:4x 對 LAWWW2-C：「疊圖畫出來的3d真的很棒寫成規則 以後任何2d轉3d都要參考這次透過開源或者新增的各種美術方法都要寫進規則交接給下一個lawww2」**（UA-LAWWW2-1105-01）

- 這份是 LAWWW2 的規則。以後**任何 2D 轉 3D**（店面、室內、外觀、校園建築、道具）都照這份做，下一個 LAWWW2 接班時必讀。
- 角色也一樣用這套方法。驗收的人不一樣（BB-C 03:45 更正；D59 已被取代）：
  - 角色美術由值班的 LAWWW 驗收（D100a、D128），BB 只給意見；人物美術凍結照 D99。
  - 建築、場景由 BB 標 ART_APPROVED（D120、D128）。
- 和舊規則的關係：
  - 第 4 節的場景規則 11、12（拆圖清單、顏色亮度 `ref_match`）照舊有效。
  - 第 2 節 12.8 的 R2（同角度疊圖，D128、D138）照舊有效。
  - 這份把它們串成一個流程，再加上這次新做的方法。
- **有新方法就加進第 2 節的表；踩到新的坑就加進第 3 節。** 不加，下一個人會再踩一次。

> **D141（使用者 11-05 04:2x，LAWWW-C 轉）：先進遊戲，不要一直精修。**「到第三個版本應該就可以了」——一個場景最多 3 版就先進遊戲；之後只改使用者自己說的、或擋玩的（走不到、坐不下、穿模、卡住、黑畫面，BB-C 04:1x 只擋這五種）。
> 疊圖、參考圖比對的差距照樣寫進 README，但是當成「給使用者看的意見」，不當退件理由。每次交件列「先將就的」清單給 LAWWW。
>
> **使用者 11-05 直接對 LAWWW2-C 再說一次：「疊圖可以很棒，可是我覺得你應該把我們所有新的店面都趕快先做好，所以你不要在同一個東西上面修改六次最多就三次」。**
> 做法：
> - 交件前先數這個東西已經第幾版（建模的人自己的版本也算），寫在 README 第一段。
> - 第 3 版交了就進遊戲，不再為了疊圖的分數重做。
> - 別人已經做到第 3 版以上的（例如 CC 的運動廣場 v3c），直接接進遊戲，不重做。
> - 順序：還沒進遊戲的店優先，已經進遊戲的店排後面。
> - **使用者 06:4x：「如果店面修改3次以內的你自己決定要不要繼續改」**——三版以內的店由 LAWWW2 判斷要不要再改（改的話算一版，到第 4 版為止、寫進 README）；超過三版的照上面，只改使用者說的或擋玩的。

一句話：**參考圖就是規格。先反推參考圖的鏡頭，同一個鏡頭拍我們的模型、疊在參考圖上看；看數字也看圖；差在哪裡、為什麼，照實寫。**

範例（照這幾件的 README 做）：

| 範例 | 學什麼 |
|---|---|
| 同弦樂器店內 `wip/tongxian_ref_1105/README.md` | 完整流程：候選鏡頭比較、R2 疊圖、四格對照、把構圖鎖進測試、照實寫「舊鏡頭線條比較準但看不到窗」，BB 判定後再改一處（v4f） |
| 2:30 AM 外觀 `wip/wz_five_1104/cafe230_exterior.md` | 遊戲是參考圖的鏡像（比對用翻過來的參考圖）；原本的鏡頭位置走不到（同方向、同焦距往前走，參考圖裁中間）；店內窗卡；轉角小樹照參考圖、不複製貼上 |
| 阿德影印 v2.1 | 消失點只差 1.3% 的對位 |

### 2D3D 1. 流程（照順序，每一步都留檔）

#### 第 1 步：拆圖

- 照場景規則 12-1 列清單：從左到右、由前到後，每一樣東西、大約尺寸、色碼、材質。
- **再寫一行「左右順序」**，例如：「左：窗、冷氣、吊燈、試琴角｜中：牆上的紙條、琴架上的吉他｜右：吉他牆｜右下：玻璃展示櫃接收銀檯」。
  - BB 判同弦時最看重的就是「內容和左右順序對」。
- 寫下參考圖「最重要的那一塊」（同弦：左邊明亮的大窗和窗前的試琴角）。後面取捨時，這一塊不能丟。
- **寫下參考圖是哪一種**（每份 README 都要寫；BB-C 03:45）：
  - 使用者給的圖、我們自己生成的圖：疊圖可以 commit。
  - 第三方、學校、真實店家的照片：只能當參考。疊圖不 commit，只 commit 遊戲截圖和數字（照片本身也不進 repo）。
- **招牌、店名**：
  - 店名一律原創、不用諧音（D77，11-03 修訂：「承品書店」→「山嵐書店」）；不畫商標、不照抄品牌配色。
  - 學校和館名照 `docs/WORLD_NAMING.md`（D115）；公館、溫州街、新生南路這類真實地名照舊。
  - 參考圖上的招牌字照抄前，先查是不是真的店名。

#### 第 2 步：反推參考圖的鏡頭（camRef）

1. **量參考圖**：
   - 消失點：`same_angle_check.py` 會報主要消失點，同弦是畫面左邊 17%，表示鏡頭往右斜看。
   - 眼睛高度：用已知的高度比。同弦：牆腳 680 px、窗台 515、窗頂 185 px，窗台／窗頂 0.33，和配置的 0.87／2.53 一致，所以參考圖的比例是對的。
   - 焦距：用已知的寬度。窗 2.6 m 在牆面上佔多少像素，換算鏡頭到牆的距離和焦距。
2. **解鏡頭**：`tools/blender/env_second/fit_refcam.py`（新做的）。
   - 輸入：參考圖上幾個點的像素 ↔ 配置裡同一個東西的遊戲座標（窗的四角、牆角、椅子、櫃台角）。
   - 輸出：最小平方法解出的眼睛、方向、焦距。
   - 眼睛限制在走得到的範圍（`--eye-box`），焦距限制在 24 mm 以上（`--lens-min`）。
   - 範例：`wip/tongxian_ref_1105/ref_points.json`。
3. **解出來頂到範圍的邊**（工具會警告）、或誤差很大：表示配置和參考圖對不上，例如同弦的窗被外觀綁在西半邊。這時：
   - 不要硬用超廣角，也不要站到牆裡去。
   - 挑 6～12 個走得到的候選鏡頭，各拍一張 EEVEE 640×360（一張 20 秒左右）。
   - 每一張都跑 `same_angle_check`，再和參考圖並排看。
   - 選的標準照這個順序：**最重要的那一塊在畫面裡 → 左右順序一樣 → 消失點、ssim 最接近**。
4. **寫進配置**：layout 的 `camRef`（eye、look、lens），`note` 寫為什麼選這個、和參考圖差多少。
   - 同弦的 note 寫了：消失點 32% 對參考圖 17%，原因是窗的位置。
5. **原本的位置走不到**：照 R2，同一個方向、同一個焦距往前走到走得到的地方，參考圖照比例裁中間（2:30 AM 第二版）。
6. **遊戲做成鏡像**：比對用翻過來的參考圖。

#### 第 3 步：建模

- Blender bpy。家具、門窗的位置只寫在配置（`src/data/*_layout.js`），遊戲和 Blender 讀同一份。
- 改了配置（搬家具、搬窗），**一定要重拍 camRef**，並檢查跟著位置走的細節。這次就漏過兩次：
  - 窗搬到冷氣下面以後，冷氣的配管壓條從窗玻璃中間垂下來。
  - 換鏡頭以後，吊盆剛好擋在吊燈前面。

#### 第 4 步：預覽（`tools/blender/env_second/glb_preview.py`）

- **看顏色一律用 eevee 模式**：頂點色、發光、透明都畫得出來，640×360 約 12 秒。
- 不要用 Workbench 判顏色，它有四種會誤判的地方（第 3 節）。

#### 第 5 步：同角度疊圖（R2）

- 工具：`tools/art/same_angle_check.py <參考圖> <同角度渲染> <輸出前綴> --mode shop`（BB 的，D138）。
  - 校園建築用 `--mode campus`：要相似、不能照抄（D136）。
  - 雲端裝得起來：`python3 -m venv <資料夾>`，再 `<資料夾>/bin/pip install opencv-python-headless scikit-image`（PyPI 通）。
- 交件附 `_overlay.jpg`、`_structure.json`。
- **數字是工具，不是結論。**
  - 同弦的舊鏡頭 line_F 0.30，比新鏡頭的 0.15 高，因為舊鏡頭就是參考圖的方向；但它看不到窗。
  - 兩邊的數字都寫出來，讓 BB 判。
- 「參考圖東西多很多」的格子：EEVEE 均勻光、沒有陰影時一定很多，遊戲內截圖才準。不要拿預覽的這一項當證據。
- **Blender 預覽的疊圖只到 MODEL_READY**（BB-C 03:45）。要 ART_APPROVED：
  - 用遊戲內同一個 camRef 的截圖，重跑 `same_angle_check`。
  - 紅框的格子在遊戲截圖上重新看：真的少放東西的要補；不補，寫原因。
- 店面再跑 `tools/blender/env_second/ref_match.py`（顏色、亮度、冷暖，SCENE_RULES 12-4）。

#### 第 6 步：把構圖鎖進測試（Node，不用瀏覽器）

做到的構圖要寫成測試，以後有人改配置就會 FAIL。每一項都要在修改前 FAIL、修改後 PASS（D34）。範本在 `tests/tongxian_unit.js` ⑪、`tests/cafe230_ext_nav_unit.js` ④：

- **構圖**：camRef 的水平視角裡，左邊、右邊各有哪些東西（算角度）。
- **視線**：從 camRef 的眼睛看重要的東西，中間沒有家具擋（2D 導航阻擋）、沒有葉子擋（讀 GLB 的頂點，視線 3° 以內）。
- **範圍**：所有零件都在房間裡。這一項抓到了書架旋轉把吊燈電線轉到牆外的錯。
- **淨空**：吊盆最低的葉子離地 ≥ 1.75 m；盆栽樹冠離站得住的人 ≥ 0.20 m（讀 GLB 的葉子頂點）。

#### 第 7 步：交件

1. **四格對照圖**：
   - 參考圖｜這一版；
   - 修改前（舊鏡頭）｜修改前（新鏡頭同角度）。
   - 使用者說「疊圖畫出來的3d真的很棒」，指的就是這一套。
2. R2 疊圖（`_overlay.jpg`、`_structure.json`）。
3. README：
   - 表格：BB／使用者說的每一點 → 實際是什麼 → 這一版怎麼改。
   - 照實寫的取捨，連數字一起。
   - 還沒做、還沒驗的。
   - 接法（`git checkout <SHA> -- 檔案`、patch 在哪個 SHA 上乾淨）。
   - 測試的修改前、修改後。
4. GLB 規格：三角形、大小、網格和材質數。和上一版比，多出來的要說得出是什麼。
5. 檢查清單（README 最後一節逐項打勾）：
   - [ ] 參考圖是哪一種（第 1 步）；第三方照片的疊圖沒有 commit。
   - [ ] 「最重要的那一塊」在 camRef 的畫面裡；左右順序和參考圖一樣。
   - [ ] 招牌、店名原創，沒有商標、品牌配色（D77）；館名照 WORLD_NAMING（D115）。
   - [ ] 沒有複製貼上同一個東西（D133）。
   - [ ] 構圖、視線、範圍、淨空寫進 Node 測試，修改前 FAIL、修改後 PASS。
   - [ ] 驗收狀態寫對：預覽疊圖＝MODEL_READY；遊戲內 R2 之後才能請 BB 判 ART。
6. 「先將就的」清單（D141）：這一版哪些地方和參考圖不一樣、還沒做，給 LAWWW 寫進給使用者的清單。版本數寫在 README 最上面（第幾版；到第 3 版就進遊戲）。
7. 交件以後：
   - 建築、場景的 ART 由 BB 判（D120、D128）；角色由 LAWWW 驗收（D100a）。
   - 遊戲內同角度截圖排 CC 在使用者的電腦拍（D131）。
   - 我不標 ART_APPROVED。

### 2D3D 2. 方法和工具（這次用上的；有新的就加一列）

| 方法／工具 | 做什麼 | 在哪裡 | 誰做的、什麼時候 |
|---|---|---|---|
| 同角度疊圖 | 參考圖和同角度渲染：邊緣、長直線、消失點、大形狀、各區顏色、東西多不多 | `tools/art/same_angle_check.py` | BB，D138 |
| 顏色、亮度比對 | 色票、亮度、對比、冷暖、九宮格 | `tools/blender/env_second/ref_match.py` | LAWWW2，11-03 |
| 反推鏡頭 | 對應點最小平方法解 camRef；頂到範圍的邊會警告 | `tools/blender/env_second/fit_refcam.py` | LAWWW2-C，11-05（新） |
| 照遊戲樣子預覽 | 單面材質剔除背面、底色貼圖設成作用中、陰影關掉；eevee 模式照材質畫（頂點色、發光） | `tools/blender/env_second/glb_preview.py` | LAWWW2-C，11-05 |
| 候選鏡頭比較 | 6～12 個走得到的位置各拍一張，`same_angle_check`＋並排看 | 第 1 節第 2 步；同弦 README | LAWWW2-C，11-05 |
| 店內窗卡 | 從遊戲裡走進去的那一間（真的室內模型）開燈拍，貼在外觀玻璃後面 0.9 m；遊戲程式不用改 | `tools/blender/env_second/cafe230_wincard.py` | LAWWW2-C，11-04 |
| CC0 實景掃描模型 | Poly Haven：自動下載、只取要的節點、減面、貼圖 512、半透明 alpha clip；`LICENSES.md` 記一列 | `lib2.ph_model`（`tools/blender/env_second/lib2.py`） | LAWWW2-C，11-04（R1，D128） |
| CC0 貼圖 | Poly Haven；ambientCG 也連得到 | `tools/blender/fetch_polyhaven.py`、`tools/blender/textures/` | 一直在用 |
| 葉子、藤 | 葉片卡、細長透明藤條；室內樹用葉片卡、大葉盆栽用模型葉子 | `tools/blender/env_second/gen_leaves.py`（strands）、`tools/blender/plants.py` | LAWWW2 |
| 建好再整組轉 | 照原本的寫法建一整組（例如書架），再繞中心轉到配置的方向；舊頂點先標記 | `tongxian_interior.py` 的 `_mark_old`、`_rot_new` | LAWWW2-C，11-05 |
| GLB 後處理：地板挖洞 | 只換某個材質的地板幾何；換之前查共用的 accessor | `tools/blender/env_second/glb_floor_hole.py` | LAWWW2-C，11-05 |
| GLB 後處理：貼圖調亮 | 某一張貼圖調到目標色（D112 淺色地板） | `tools/blender/env_second/glb_tint_image.py` | LAWWW2-C，11-05 |
| T 形接頭 | 找出牆的邊中間夾著別的頂點的地方；Blender 匯出前插進邊裡 | `tools/blender/env_second/glb_tjunctions.js`；`tools/blender/dorm_hall.py` 的 `conform_tjunctions` | LAWWW2-C，11-05（新） |
| 疊面檢查 | 同一個平面疊兩層（遊戲裡會閃） | `tools/blender/env_second/check_coplanar.py` | LAWWW2 |
| 光照烘焙 | Cycles 烘白天、晚上兩張光照貼圖；夾在中間的面補光 | `tools/blender/env_second/lightbake/bake_room.py`、`lm_fix_hidden.py` | LAWWW2，10-28 |
| 兩層店的接法 | 每層一顆 GLB（或一顆 GLB 照名稱分兩組：`L1_`、`WALL_*_L1_`、二樓高度的 `GLOW_`），`levelGroups` 剖面視角、`slabs` 樓板、樓梯上半段兩層共用、樓梯頂北邊和側邊在一樓那一層擋起來 | `src/shanlan3d.js`、`src/dakou3d.js`（兩顆 GLB 先放進同一個 root 給 `attachRoomGLB`，再把二樓那顆 `attach` 到二樓那一組）、`src/xsports3d.js`（夾層：二樓整張先擋、只開 walk 範圍） | LAWWW2-C，11-05（新） |
| 一層小店共用模組 | 配置＋GLB 就能接成區域：出口、進來的位置、高腳凳抬高、GLOW_ 合成、額外擋的小角落 | `src/xsshop3d.js`（`XSS.SHOPS` 加一列） | LAWWW2-C，11-05（新） |
| 可點的地面（點地移動） | 有高度的地方（斜地板、看台、樓梯、平台）一定要註冊 `zone.walkMeshes`，不然 `E.screenToFloor` 退回 y 0、落點偏好幾公尺。測試照 `E.screenToFloor` 的算法打射線，落點差 ≤ 0.5 m | `src/nanyang3d.js`（三片）、`src/gym3d.js` 的 `arenaWalk`；`tests/nanyang_tap_unit.js`、`tests/gym_arena_tap_unit.js` | LAWWW2-C，11-05（新） |
| 小孤島總掃 | 所有室內區域每 0.1 m 一點、從出生點連通；連不到的分群、附 gap（≤ 0.45 m＝跑步一步跳得進去） | `tools/dev_scratch/indoor_islands.js`；每間店的測試也各有一項（`dakou_unit` ⑩、`xsshop_unit` ⑤、`xsports_unit` ⑦） | LAWWW2-C，11-05（新） |
| 踏面對 GLB | 讀 GLB 的頂點，樓梯每一階最高的點＝導航算的 k×rise（差 ≤ 0.02 m）；踏面頂點在樓梯兩邊，取範圍要包含兩邊 | `tests/dakou_unit.js` ③、`tests/xsports_unit.js` ③ | LAWWW2-C，11-05（新） |
| VRM 加一套衣服（換裝） | 用身體皮膚的網格照骨頭和高度切出來、往外推、Taubin 平滑；權重照原本皮膚頂點；貼圖畫在皮膚的 UV 上；再跑 fit 形狀。遊戲端藏、顯示子網格切換 | `tools/gym_wear.py`；`C.setGymWear`（`src/character3d.js`） | LAWWW2-B，11-07（新） |
| 改 VRoid 皮膚貼圖 | 皮膚貼圖上畫好的內衣、襪子換成皮膚色（同一欄往下找皮膚色接上去，往皮膚裡多走 6 px、交界往外擴 4 px） | `tools/gym_wear.py` 的 `skin_fix` | LAWWW2-B，11-07（新） |
| 測試讀貼圖顏色 | Node 裡解 PNG（`zlib.inflateSync`＋每列反濾波），看頂點的 UV 對到什麼顏色 | `tests/gym_wear_unit.js` ⑦ | LAWWW2-B，11-07（新） |
| 街上看不到的面不放 | 從街上走得到的 135 個鏡頭位置射線；看不到的面烘焙時留著擋光，匯出前刪 | `tools/blender/env_second/offbeat_storefront.py`（`--no-cull` 關掉） | LAWWW2-B，11-07（新） |
| 窗景夜景照得到對街 | 燈頭點光源、月光、光圈半徑倍率 | `wz_window_view.py` 的 `--pool-point`、`--moon`、`--pool-r` | LAWWW2-B，11-07（新） |
| 單張圖轉 3D 的 AI（開源） | 小物件可以，店面、建築不行（會糊、背面靠猜、走不進去）。TripoSR 只用在玩家走不到 3 m 內、Poly Haven 和 plants.py 做不出來的有機小雜物（D138）；TRELLIS.2 線上版：使用者 11-05 03:5x 同意挑他的參考圖上傳試跑；11-05 實測：去背成功，產生 3D 被 Hugging Face 免費 GPU 額度擋；**使用者 06:4x 取消：「這不用做 我電腦也跑不了」——不要再試**，見 `research/TRELLIS2_TRY_1105.md` | `research/OPEN_SRC_2D3D_1104.md` | 研究，11-04 |

### 2D3D 3. 踩過的坑（每一條都真的發生過）

1. **Workbench 預覽會誤判**（同弦 v1，11-05），預覽一律用 `glb_preview.py`、顏色用 eevee：
   - 預設不剔除背面：朝外的單面牆在預覽裡看得到，遊戲裡看不到。
   - 「貼圖」模式用作用中的那一個貼圖節點：常常是發光那一張，結果變成黑方塊。
   - 陰影在三角形的邊上漏出細的亮線，看起來像牆有縫。
   - 不畫頂點色：書架上的書變成一整塊白。
2. **bmesh 不能用「頂點數」分新舊**：刪過頂點（倒角方塊會刪）以後，新頂點會補進空出來的位置，排在舊的前面。同弦 v4e 第一版因此把吊燈電線轉到牆外。要分新舊，就先替舊頂點標一個整數層。
3. **GLB 的 accessor 會共用**：CC 的匯出把一樣的索引合成一個，地板和吉他牆的灰泥共用一個。原地換掉前先數有幾個地方在用（`glb_floor_hole.py` 的 `refs()`），不然另一個網格會壞掉。
4. **T 形接頭會露縫**：方塊拼的牆，一邊的邊中間有頂點、另一邊沒有，畫的時候露出一點一點的縫。男一舍走廊有 176 處。匯出前插點（第 2 節）。
5. **單面材質的方向**：glTF `doubleSided=false` 的面，遊戲只畫正面。四邊形的頂點順序反了，牆就不見了（同弦樓梯間 v1 的兩側牆）。
6. **疊面會閃**：牆頂和地板同一個平面、牆和牆的端面同一個平面，要挪開或拿掉。
7. **改了配置，跟著位置走的細節要重看**：窗搬了，壓條穿過窗；鏡頭換了，吊盆擋住燈（第 1 節第 3 步）。
8. **數字好不等於構圖對**：舊鏡頭的 line_F 比較高，但看不到最重要的窗。先看第 1 步寫的「最重要的那一塊」在不在。
9. **不准複製貼上同一個東西**（D133）：參考圖那棵白盆小樹另外做，不拿旁邊的橄欖改顏色。
10. **預覽不是遊戲畫面**：EEVEE 是均勻的天空光。亮度、晚上的樣子、「東西多不多」都要等遊戲內截圖（CC，D131）。
11. **有高度卻沒有可點面**（南洋 1 廳、體育館看台，11-05）：點斜地板、看台，落點偏 3.4 m、17.9 m，或點了沒反應。手機玩家前排坐不到。新區域只要地板不是 y 0，就加 `walkMeshes`＋點地測試。
12. **家具中間的小孤島**（每一間新店都有，11-05）：衣架、盆栽、桌子圍出一塊比人窄的縫。引擎移動只檢查目的地，跑步加低幀率一步約 0.4 m，跳得進去。用 `indoor_islands.js` 掃，擋起來或請建模的人拉開家具，寫進「先將就的」。
13. **跨兩面牆的 WALL_ 網格沒有方向**（大口漢堡 `WALL_BANDS`）：淡出會用錯方向。矮的改名不淡出，高的請建模的人分開。
14. **改測試的檔案清單別用全文取代**（林家 v1c，11-05）：sed 把 `lin_layout.js` 也插進 `indexOf(…)`、`req(…)` 的括號裡。參數多一個不會報錯，但測試在測錯的東西。改完 `git diff` 一行一行看。
15. **index.html 的載入順序有測試在看**（`bike_shop_park_unit` 12 要 `bike_layout.js` 緊接在 `daily_offbeat_layout.js` 後面）：新的檔插在別人的中間會讓別人的測試 FAIL。插之前 `grep -l index.html tests/*.js` 看有誰在檢查順序。
16. **工作樹的安全**（11-05）：
    - 一行指令裡有 `cd` 的，一律寫 `cd X || exit 1`。`cd` 失敗時，後面的 `git checkout .` 會在別的工作樹跑。
    - 不要用 `git stash -- 路徑`：它會把整個暫存區一起收走，所有工作樹共用同一個 stash。
    - 磁碟滿了先刪 scratchpad 裡舊的 worktree（`git worktree remove`）。
17. **人物預覽沒貼真的皮膚貼圖，看不到貼圖上畫的東西**（祐廷運動服第一版，11-07）：
    - VRoid 的皮膚貼圖本來就畫了灰色背心、深色內褲、深色襪子，平常被衣服蓋住；
    - 我的預覽皮膚是單一顏色，換上短袖短褲以後露出來的灰色、深色襪子都沒看到，是 LAWWW-B 在遊戲內看到才發現；
    - **人物預覽一律用遊戲裡真的貼圖**（皮膚、衣服、頭髮），露出新的皮膚就先查皮膚貼圖那一塊畫了什麼；
    - 再加一項 Node 測試讀貼圖顏色（第 2 節），不靠眼睛。
18. **衣服和身體重疊的那一段，兩邊推出的距離要分清楚裡外**（同一件）：短褲腰頭推 1.1 cm、上衣最少只推 0.77 cm，平滑又把髖骨往內拉，短褲就從上衣穿出兩個小黑點。外面那件在重疊段至少多推 1 cm，用測試比離軸距離。
19. **合併網格以後頂點色不見**（日常失速店內第一版，11-07）：材質的顏色節點沒寫層名＝讀「預設那一層」；合併時第一個物件沒有顏色層，合出來就沒有預設層，椅子、盆栽烘成灰色。合併後指定作用中、要畫的那一層，材質也寫上層名。
20. **自發光的東西也會進陰影那一輪**：遊戲只認得 `NOSHADOW_` 開頭的節點不投影（`wzCastsShadow`）。店內 2.2 萬三角形在陰影那一輪又畫一次，店前多 4.4 萬。不需要影子的就用這個前綴。
21. **窗景夜景只有往下照的路燈，直立的牆、樹冠一片黑**（新生南路四張，11-07）：拉曝光、加月光都不夠（月光太強像黃昏）；燈頭加點光源才照得到。
22. **bpy 腳本要在 scratchpad 跑**：在 repo 根目錄跑，glTF 匯入會壞（`_RestrictContext`）。

## 4. 場景規則（原 SCENE_RULES.md；節號照舊）

### 場景規則 1. 工具與檔案

| 項目 | 做法 |
|---|---|
| Blender | `/opt/blenv/bin/python 腳本.py [-- --out 路徑]`。Blender 5.2，無介面 `bpy` |
| 共用函式庫 | `tools/blender/env_second/lib2.py`（`L`）、`cafe_layout.py`（`CL`）。腳本開頭照抄任何一支，例如 `wz_park.py` 的 import 區塊 |
| 腳本位置（支援者） | `tools/blender/env_second/aa_support/<名稱>.py` |
| 輸出位置（支援者） | `assets/models/env/second_ai/aa_support/<名稱>.glb`（`.json` 統計 `L.export` 會自動寫） |
| Poly Haven 貼圖（CC0） | `L.pbr(名稱, '<polyhaven id>', ...)` 會到 `tools/blender/env_second/textures/<id>/` 找；沒有的話用 `lib2.fetch(id)` 下載（dl.polyhaven.org 連得到）。新用到的貼圖要在 `LICENSES.md` 加一行 |
| 自己畫的貼圖 | 用系統 python3（PIL、numpy）產生到 `tools/blender/env_second/textures/gen/`。產生貼圖的腳本也要 commit（例：`shopkit_tex.py`） |

### 場景規則 2. 座標與比例

- **遊戲座標**：x 往東、y 往上、z 往南。單位是公尺。
  - Blender 用 `g2b(x, y, z)` 換：Blender 的 (x, −z, y)。
  - `Mesh.box(x0, x1, y0, y1, z0, z1)`、`cyl(a, b, r)`、`sphere`、`quad` 都直接吃遊戲座標。
- **道具**：原點放在**底部中央**、正面朝 **+z**。遊戲端用 yaw 轉：正面朝 (sin yaw, cos yaw)。
- **常用尺寸**：
  - 祐廷身高 1.75 m；門高 2.1 m；
  - 座面 0.45 m；桌面 0.75 m；吧檯 1.05 m；
  - 樓高：一樓 3.4 m、其他 3.1 m（街屋）。

### 場景規則 3. 材質

| 種類 | 寫法 | 注意 |
|---|---|---|
| PBR 貼圖 | `L.pbr('名稱', 'polyhaven id', tile=每張幾公尺, target='#sRGB 色碼', normal=0.5, maps=('diff','nor'), res=256, rough_value=0.7)` | `target` 會把貼圖校正到那個平均色 |
| 純色 | `L.flat('名稱', '#色碼', rough=, metal=, emit=B.srgb('#色碼'))` | **metal 最多 0.45**：遊戲沒有環境貼圖，金屬度高會變黑 |
| 小零件 | `L.CMesh('名稱', 頂點色材質)` 的 `cbox(..., '#色碼')`；或最後 `L.vc_consolidate(root, {材質名: L.vc_material(...)})` | 很多種顏色合成一個材質，一次 draw call |
| 透明（葉子、紙張） | 影像的 Alpha 經過 Math **ROUND** 再接 BSDF Alpha（範例：`cafe_layout.leaf_mat`） | 匯出成 alphaMode MASK，不要用半透明混合 |
| 晚上發光 | `emit=B.srgb(...)`；要光暈的地方放 `CL.glow(root, '種類', x, y, z, color=..., size=..., day=0, night=1)` | 遊戲會在那裡生光暈 |

- 貼圖解析度：`B.reset(texres=512)`。近景主角級的物件才用到 1024。
- 名稱前綴：每個物件、材質加自己的前綴（例：`wz6_`、`cat_`），不要和別的 GLB 撞名（遊戲有時候依材質名稱做夜間設定）。

### 場景規則 4. 特殊節點名稱（遊戲端看名字處理）

| 名稱開頭 | 用途 |
|---|---|
| `PLATE_FACE_*`、`SIGN_FACE_*`、`VSIGN_FACE_*` | 招牌、門牌的字，遊戲用 canvas 畫；自訂屬性放 sign、bg、color |
| `INTERIOR_FACE_*` | 店面玻璃後的室內景深卡 |
| `GLOW_*` | 夜間光暈的位置（空節點） |
| `SEASON_<名稱>_on` 和 `_off` | 依季節切換顯示，例如楓香的紅葉 |

### 場景規則 5. 效能預算（手機）

- 小道具：每件 0.5～5k 三角形；整間室內：60k 以內；整條街：約 35k，原型會重複使用。
- 重複的東西用 `B.instance(共用網格, ...)`，匯出時 `L.export(OUT, gpu_instances=True)` 會變成 GPU instancing。
- 最後 `L.merge_by_material(root, keep=...)`：同材質合成一個網格，招牌臉、季節節點要用 `keep` 留下來。
- 不要用方塊拼成近景的主要物件（D38 第 1 點）。用 `L.lathe`（旋轉體）、`cyl`、`bmesh`，做出倒角和比例正確的造型。

### 場景規則 6. 驗收截圖

1. **Blender 渲染**：Cycles 32～64 spp、AgX、OIDN 降噪，正面、斜 45°、近景三張。範例：`street_trees.py --preview`。
2. **遊戲內截圖**：GLB 要接進 manifest 之後才拍得到。工具是 `tools/blender/env_second/shots/fast_shots.py`。
   - JSON 欄位：`out`、`w`、`h`、`dpr`、`mobile`、`hidePlayer`、`hideNPCs`、`state{zone, hour, pos{x,z,yaw}}`、`cam{pos,look}` 或 `{yaw,pitch,dist}`、`js`。
   - 範例：`shots/polish0_before.json`。
   - 先開本機伺服器：`python3 -m http.server 8852`，在放了新 GLB 的 worktree 開；網址用 `http://127.0.0.1:8852/index.html?turbo`。
   - 時段：白天 11:00、傍晚 17:30、晚上 20:30。手機直向 390×844（dpr 2）、橫向 844×390。
   - 雲端沙盒是軟體繪圖，每張要一兩分鐘。放背景跑，不要等。
3. **修改前後**：同一個鏡頭、時段、光線，並排比較。

### 場景規則 7. 交付

1. 在自己的分支 commit：腳本、GLB、`.json`、Blender 渲染圖、README（做了什麼、規格、還沒做的）。
2. 用 send_message 傳給 LAWWW2-B：SHA、路徑、三角形數、材質數、截圖位置。
3. LAWWW2-B 驗收、merge 進 LAWWW2-B 分支，照原流程交給 LAWWW-B 接進遊戲。
   - 支援者不改 `src/`、`zones3d`、`assets3d`。
   - 美術狀態最多標到 READY_FOR_REVIEW。

---

### 場景規則 9. 支援素材的驗收清單（「得獎遊戲」標準；LAWWW2-B 2026-10-16 16:0x）

使用者 06:2x 對 LAWWW2-B：「參考得獎的遊戲 真的像是STEAM會賣的遊戲 的美術」；07:1x：「日系加一點寫實 不要很像積木」；15:5x 對 AA-B：「美術3D標準要參考遊戲大獎，可以問lawww2」。
方向（HANDOFF「06:2x」那一節）：**繪本感半寫實環境＋日系動畫人物**。環境參考《Season》《Lake》的烘焙光、暖色、空氣感；目標畫面是 2D 參考圖 07（溫州街 Café 前黃昏）。
D38 是底線；這一節是交件時我實際會一項一項看的東西。**每一項在 README 寫「做了／沒做＋原因」**。
施工方法（工具、參數、流程，AA、BB、LAWWW2 共用）：AA-B 整理的 `docs/story_planning/美術支援SOP_3D施工方法.md`（企劃分支 `claude/cool-heisenberg-o8kuqx`，4217e696 起；第 11 節是實際做過學到的）。**驗收以這一節為準**，兩邊不一致時照這裡。

#### 9-1 造型（最常退件的地方）

- **輪廓**：近景物件不准看得出是方塊、圓柱拼的。圓的東西用旋轉體（`L.lathe`）或掃掠（loft），倒角、圓角在剪影上看得到（範例：BB-B 的 ART-PARK1 滑道是 U 形截面沿曲線掃出、搖搖馬是側面輪廓擠出＋圓角）。
- **倒角**：所有看得到的硬邊都要有（`rbox`、bevel），寬度照材質：金屬 3～8 mm、木頭 2～5 mm、塑膠一體成型 10～30 mm。
- **圓形的邊數**：輪廓上的圓（輪子、桶、杯口）近景至少 14 邊；看不到輪廓的（桿子、細管）6～8 邊就好。平滑著色（`L.smooth_mesh`）救不了輪廓。
- **比例**：照真實尺寸（第 2 節）；拿一個 1.75 m 的人站旁邊看。
- **結構講得通**：有支撐、有接合（螺絲座、焊點、榫）；東西不懸空、不互相穿插（交件前自己量 bounding box，例：PARK1 滑道和沙坑重疊 2 cm 是我擺的時候抓到的）。

#### 9-2 材質與貼圖

- **來源**：大面積用 Poly Haven（CC0），自己畫的用 PIL／numpy 產生、腳本要 commit；新貼圖記進 `LICENSES.md`。不用來源不明的圖。
- **校色**：Poly Haven 的貼圖用 `target` 校到要的平均色；不要整片高彩度。陶瓷、搪瓷白不要純白（約 #e8e6e0）。
- **解析度**：小道具一組共用一張 1024 貼圖集＋256 ORM；不要每件一張。近景會被鏡頭貼近的（滑梯、桌面）才到 1024 的區塊。
- **粗糙度要有變化**：同一件東西，手常摸的地方（把手、扶手、滑道出口）粗糙度低一點、亮一點；地上那一端髒一點。用 ORM 的 R/G 通道畫，不是整件一個數字。
- **金屬度 ≤ 0.45**（`b3lib.MAX_METAL`，和第 3 節、SOP 2-3 一致；2026-10-16 20:2x 統一，原本這裡寫 0.40）：遊戲沒有環境貼圖，太高會變黑。不鏽鋼、鋁 0.3～0.45＋粗糙度 0.3～0.5，底色用深一點的鋼灰（約 #7d8084），不然暖光下偏白。
- **磨損與髒污**（「生活痕跡」的一半）：邊角掉漆、地面接觸處的泥、水漬、褪色。程度：「用了三到五年、有人在維護」，不是廢墟。畫在貼圖上，不加幾何。
- **字、標誌**：不放真實品牌（D77）；要字的地方用遊戲的 canvas（`*_FACE_` 節點）或自己畫、字要清楚，不能被擠扁（不要放進正方形格子的貼圖集）。

#### 9-3 光

- 遊戲是即時光＋陰影，沒有環境貼圖、沒有 GI：**凹處、接合處、物件底部的暗**要靠烘焙 AO 或畫在底色上（例：沙坑木框內側、浴缸和牆的交界、椅子腳落地處）。強度：看得出、但不黑一圈（底色乘 0.75～0.9）。
- 晚上會亮的東西（燈罩、螢幕、招牌）用發光材質，名字前綴照第 4 節，亮度由遊戲調。

#### 9-4 生活痕跡（環境的另一半）

- 東西要「有人在用」：毛巾掛歪、杯子裡有牙刷、沙坑裡有小桶子、椅子沒推進去。每一組至少 2～3 處。
- 不是堆雜物：放在人會放的位置，數量剋制。

#### 9-5 預算與格式

- 三角形：小道具 0.5～3k／件，一組合計看派工單（通常 5～10k）；材質一組 1 個（貼圖集）。重複的東西做一份、遊戲用 instancing。
- 原點、朝向、節點名照派工單；每件一個頂層節點；GLB 裡可以先擺在派工單給的本地座標（PARK1 那樣，我搬起來最方便）。
- 交件前自己跑：`.json` 的三角形、材質數、bounding box；在 Blender 裡打一個 1.75 m 的人比例。

#### 9-6 交件的截圖

1. **Blender 渲染**（第 6 節）：總覽、斜 45°、每件一張近景；至少一張從**遊戲的鏡頭高度**（離地 2～3.5 m、往下 15～30°）看，因為玩家大多這樣看。
2. **和參考比**：附一張你參考的真實樣子（文字描述也可以：「台灣社區公園常見的彈簧搖搖馬，一體成型塑膠」）。
3. **遊戲內截圖**由我拍（要我的 worktree 和 GLB 組裝）；我拍完會回給你看，不合格的地方一次列清楚。

#### 9-7 會直接退件的

- 剪影看得出方塊、圓柱拼的近景主體；
- 整件一個顏色、一個粗糙度，沒有任何磨損或 AO；
- 穿插、懸空、比例錯；
- 字被擠扁、出現真實品牌；
- 超過預算一倍以上。

### 場景規則 10. 支援的 AI 幫忙做室內時的做法（2026-11-03 新生南路那一批留下的技術做法；使用者說那次的美術協助是臨時的，**不是固定分工**）
- **腳本**：AA → `tools/blender/env_second/aa_support/<店>_interior.py`；BB／CC → `tools/blender/env_second/bb_support/<店>_interior.py`。執行：`/opt/blenv/bin/python <腳本> -- [--out …]`。開頭照 `wz_shops_interior.py`（`sys.path` 加 env_second、`import lib2 as L`）。**用 `claude/second-ai-env-art` 上的 `lib2.py`、`cafe_layout.py`、`plants.py`**。
- **lib2 常用**：`L.pbr`（Poly Haven CC0，1k，`textures/`）、`L.flat`、`L.vc_material`、`L.Mesh`／`L.rbox_bm`（倒角）、`L.lathe`（旋轉體）、`L.merge_by_material`（最後合併）、`L.single_side`（天花板單面朝下）、`L.export(out)`。
- **配置檔（遊戲和 Blender 共用一份）**：`src/data/<店>_layout.js`，格式照 `src/data/wz_shops_layout.js` 開頭的說明——房間中心在原點、x 往東、z 往南、店門在 +z（z = d/2）、公尺；`blocks:[x,z,寬,深]`、`seats`、`interact`、`floorSit`（坐地板的位置）、`w/d/h`。兩層：`levels:[{y:0},{y:4.2}]`、樓梯 `stairs:{x,z,w,len,axis,ya,yb}`（踏面 0.28 m、一階 0.17 m、寬 ≥ 1.2 m，要真的走得上去，D38 第 4 點）。`exit`、`enterAt` 留空（LAWWW2 填）。**除了這份新檔，`src/` 都不改**。
- **節點名稱**：會淡出的牆 `WALL_<front|back|left|right>_*`（掛在牆上的東西放進同一組）；玻璃名字裡有 `glass`；天花板單面朝下。
- **材質**：金屬度 ≤ 0.45（遊戲沒有環境貼圖）；淺色木地板或石材，不用深色木地板（D112）。
- **預算（每一層樓）**：三角形 ≤ 6 萬、材質 ≤ 12、GLB ≤ 6 MB；小物件 instancing 或合併。
- **輸出**：`assets/models/env/second_ai/aa_support/<店>.glb`、`…/bb_support/<店>.glb`。光照烘焙 LAWWW2 做。
- **交件**：Blender 渲染 ≥ 3 張＋`glb_specs.py` 的數字；照第 6、9 節；狀態最多 `READY_FOR_REVIEW`（LAWWW2 確認後才算完成）；授權寫在交件說明（LAWWW2 補 LICENSES）。
- **分支**：各推自己的分支；LAWWW2 merge 進 `claude/second-ai-env-art`，整合好再交 LAWWW。

### 場景規則 11. 店面、室內的硬性驗收（LAWWW2 11-03 23:0x；使用者看過 CC 四間的渲染：「怎麼可以做的這麼像廉價的遊戲……日系風格校園劇情、大學周邊、帝國大學旁邊的店面」）
**交件一定要附「參考圖｜同角度渲染」並排圖**：角度、焦距照參考圖，不能自己挑角度。下面任何一條沒過就不收（詳細的例子在 `wip/shop_review_1103/README.md`）：
1. **比例**：面寬照 layout（騎樓的開間，例如好拍 4.4 m），一樓高 3.2～3.6 m。空的地板不能大過畫面的 1/3。
2. **光**：
   - 不能整片白天花板加均勻的白光。
   - 主光是暖色（約 3000K）的軌道燈、嵌燈，打在商品上，有亮暗層次。
   - 牆、天花板不用純白，牆面亮度不到 0.9。
3. **密度**：
   - 參考圖裡擺滿的牆，模型也要擺滿。
   - 小東西至少 15 種：招牌、海報、價格卡、手寫紙條、電視、收銀機、紙箱、電扇……
4. **商品不是單色方塊**：
   - 鞋、衣服、拍子、吉他、包裝都要有形狀，加上印刷貼圖（自製印刷圖集）；
   - 人台、衣服用有弧度的網格。
5. **歲月感**：地板、櫃台、牆有使用痕跡，例如邊角變深、膠帶痕、褪色海報、壓條走線。
6. **在地感**：要看得出是台北大學旁的小店。手寫中文紙條、價格用新台幣、虛構店名（D77）、不放真實品牌。
7. **預算**：每層 6 萬三角形以內，材質 12 個以內；重複的小東西用 instancing。

### 場景規則 12. 照參考圖做：參考圖就是規格（使用者 11-03 23:0x：「我已經給每個店面參考圖……要讓他們做成我給你的圖片裡的樣子」）
> **2026-11-05 起：完整流程照第 3 節**（使用者 03:4x「疊圖畫出來的3d真的很棒寫成規則 以後任何2d轉3d都要參考這次」）：反推參考圖鏡頭、候選鏡頭比較、R2 同角度疊圖、把構圖鎖進測試、四格對照交件。這一節的拆圖清單、`ref_match` 照舊是其中兩步。

**目標是「做出參考圖裡的那間店」，不是「做一間差不多的店」。**
和參考圖不一樣的地方只准有三種，而且每一處都要寫在交件說明裡：
- 真實品牌、標誌拿掉（D77）；
- 尺寸照 layout 調整（例如面寬）；
- 遊戲必須的改動：走道寬 ≥ 1.2 m、出入口。

除了這三種，參考圖裡有什麼、在哪裡、什麼顏色，就做什麼、放哪裡、用那個顏色。

#### 12-1 開工前：拆圖清單（寫在 README）
把參考圖從左到右、由前到後，每一樣看得到的東西列成一張表。每一列包括：
- 編號；
- 東西是什麼，例如「左牆鞋牆：淺木層板 7 層，每層 12 雙」；
- 在畫面的哪裡：左、中、右／前、中、後；
- 大約的尺寸；
- 顏色：從參考圖取色，寫色碼；
- 材質；
- 模型裡對應的物件名稱。

招牌、海報、價格卡、植物、燈具、電視、地墊、紙箱這類小東西也要列。**清單上的東西少一樣，就不能交。**

#### 12-2 鏡頭對位
- 先估參考圖的鏡頭：眼睛高度（通常 1.5～1.7 m）、焦距（通常 24～35 mm）、從哪裡看往哪裡。
- 用同一個鏡頭渲染第一張比對圖。
- 50% 疊圖時，牆角、櫃台、門要大致重疊。

#### 12-3 顏色、亮度、光
- 顏色從參考圖取，不要憑感覺：`ref_match.py` 的色票就是參考圖的 10 個主色。
- 亮度、對比、冷暖要接近參考圖，用數字檢查（12-4）。
- 參考圖的光從哪裡來，就做在哪裡：窗、軌道燈、嵌燈、燈條、吊燈。

#### 12-4 交件前一定要過：`tools/blender/env_second/ref_match.py <參考圖> <同角度渲染> <輸出>`
- 門檻：
  - 平均亮度差 ≤ 0.08；
  - 對比 ≥ 參考圖 × 0.8；
  - 冷暖差 ≤ 0.05；
  - 色票 ΔE ≤ 18；
  - 九宮格亮度差 ≤ 0.12。
- 五項都 PASS 才能交。比對圖（`_cmp.jpg`）和報告（`_report.json`）一起附上。
- 數字只抓得到光和顏色，抓不到「東西少」。**東西少不少，看 12-1 的清單有沒有全部打勾。**

#### 12-5 交件內容
1. 拆圖清單，全部打勾；
2. `ref_match` 比對圖，五項都 PASS；
3. 第 11 節的醜點清單，全部打勾；
4. 列出和參考圖不同的地方，每一處寫明原因（只能是上面三種）。

驗收人（我，最後由 BB）照這四樣看；缺一樣，直接退回。

## 5. 美術製作 SOP 與新方法登記（原 ART_SOP.md；節號照舊）

> 新方法**加**進第 9 節的登記表，**舊的不刪、舊做法照樣可以用**；但成果要過第 3 節的驗收。寫文件不等於品質提升——一律以遊戲內截圖為準。

### SOP 0. 目標（一段話）

美術方向（使用者已定案）：**繪本感的半寫實環境＋日系動畫人物**，像能在 Steam 上賣的精緻生活遊戲。「繪本感」＝柔和的光、溫暖的顏色、看得出手工的細節；「半寫實」＝比例、構造、材質照真實世界（真的去查），但不追求照片級。

**三種一定退件的樣子**（使用者原話）：
1. **方塊感**：直角方塊拼的東西（桌子、櫃子、建築、招牌），邊緣銳利、沒有厚度變化。
2. **廉價拼接**：同一個模型到處複製、只換顏色（例：全街的機車、腳踏車都是同一台）；風格、密度、細緻度互相不搭的東西擺在一起。
3. **乾淨得像樣品屋**：沒有使用痕跡、沒有生活的東西、每件都對齊網格。

---

### SOP 1. 工具鏈（全部在 repo 裡；Blender 5.2 無介面）

| 用途 | 指令／檔案 | 備註 |
|---|---|---|
| Blender 腳本 | `/opt/blenv/bin/python tools/blender/env_second/<腳本>.py [-- --out <glb>]` | Blender 自帶的 python；**沒有 scipy**（要高斯模糊自己用 FFT，見 `bg_court.py` 的 `gaussian_filter`） |
| 共用函式庫 | `tools/blender/env_second/lib2.py`（`import lib2 as L`；`from lib2 import B, Mesh, CMesh, g2b, bpy, bmesh, Vector, Matrix`） | `B`＝`tools/blender/b3lib.py` |
| 座標 | 腳本一律用**遊戲座標** (x 東, y 上, z 南)，`g2b(x,y,z)=(x,−z,y)` 轉 Blender | 匯出後遊戲座標不用再轉 |
| PBR 貼圖 | `L.pbr(名稱, 'PolyHaven id', tile=, target='#色碼', normal=, maps=('diff','nor'), res=, rough_value=)` | 第一次自動從 Poly Haven（CC0）下載到 `tools/blender/env_second/textures/<id>/`；授權寫進 `LICENSES.md` |
| 純色／頂點色 | `L.flat(名稱, '#色碼', rough=, metal=)`、`L.vc_material(名稱, rough=)`＋`CMesh` 的 `paint/cbox/crbox` | 小零件用頂點色，之後合併成一個 draw call |
| 程式畫的貼圖 | 系統 `python3`（numpy＋PIL）：`wz_road_tex.py`、`gen_street_textures.py`、`shopkit_tex.py`、`park_tex.py`、`dorm_y2_items.py` 的 `draw_atlas()` | 只用在**印刷品、路面標線、污漬、圖樣**；**不准**用隨機斑點冒充石材、磚、木頭、混凝土（D38 第 1 條）——那些用 Poly Haven |
| Blender 渲染（驗收用） | `/opt/blenv/bin/python tools/blender/env_second/render_cycles.py -- <glb[,glb…]> <輸出資料夾> <前綴> <views.json> [--res 960x600] [--samples 24] [--night] [--ground]` | views.json：`[["名稱",[眼x,y,z],[看x,y,z],焦距mm],…]`（遊戲座標）。EEVEE 在沙盒跑不動，用 Cycles |
| 遊戲內截圖 | `python3 tools/blender/env_second/shots/fast_shots.py <URL/index.html> <shots.json> [--block=檔名]` | 一個畫面大小只載入一次遊戲、連拍；JSON 欄位見檔頭（`state{zone,hour,pos}`、`cam{pos,look}` 或 `{yaw,pitch,dist}`、`w,h,dpr,mobile,hud,hideNPCs,js`）。`--block=xxx.glb` 擋掉那個檔＝「修改前」 |
| 人物截圖 | `tools/shots/char_review.py`、`tools/shots/facetest_shots.py`、`tools/shots/lookdev_ab.py` | 人物美術由值班 LAWWW 驗收（D100a） |
| 前後對照表 | `tools/shots/compare_sheet.py`、或 PIL 自己並排 | 同鏡頭、同時段、同畫面大小 |
| 整合＋效能測試 | LAWWW-B 的 `tests/wz_street_integration.py <URL>`（溫州街：36 項、draw call ≤310、三角形 ≤42 萬） | 在自己的測試工作樹跑（`git worktree add --detach <dir> <LAWWW-B 的 SHA>`，把自己的 GLB 蓋上去，開 `python3 -m http.server`） |
| 統計 | `tools/blender/env_second/shots/glbstat.py`、`kit_tris.py`、`wz_perf.py` | 三角形、材質、貼圖大小 |

**測試工作樹**（不碰 LAWWW-B 的分支）：
```bash
git fetch origin claude/modest-rubin-2lyp7g
git worktree add --detach /tmp/<scratch>/lwwt origin/claude/modest-rubin-2lyp7g
cp assets/models/env/second_ai/<我的>.glb /tmp/<scratch>/lwwt/assets/models/env/second_ai/
cd /tmp/<scratch>/lwwt && python3 -m http.server 8853 &
```
開遊戲加速（LAWWW-B v9.9.2）以後，截人物要多等：`(!GAME.charsAllP||GAME.charsAll)`。

---

### SOP 2. 製作順序（每一件都照這個順序；跳步驟＝退件）

#### 2-1 參考與尺寸（**先查，不要猜**）
- 找真實照片或規格（品牌型錄、維基、店家照片、街景），寫下**實際尺寸**：高、寬、深、厚度、離地、零件的相對位置。
- 寫在腳本開頭的 docstring（例：`prop_pothos.py`：盆口直徑 12.8 cm、高 11 cm、托盤 14.2 cm；`wz_road_tex.py`：水溝 38 cm、1 m 一節、每 6 m 一塊鐵柵）。
- 台灣特有的辨識點要列出來（例：塑膠矮凳四面的拱形開口、騎樓的柱子和日光燈、鐵捲門、不鏽鋼水塔）。
- 真實店名、商標、品牌配色**不放**（D77）；車子、家電參考真實款式，但不放商標、不照抄外型。

#### 2-2 造型：去積木化（最常退件的地方）
| 東西 | 用什麼 | 例子 |
|---|---|---|
| 桌面、櫃子、檯面、門框、招牌板 | `Mesh.rbox(x0,x1,y0,y1,z0,z1, r=0.004～0.03, seg=1～3)`／`CMesh.crbox(..., hexcol, r=, seg=)` 倒角方塊 | 半徑照實物：家具 3～10 mm、檯面 2～5 mm、建築邊 1～3 cm |
| 圓的東西（盆、碗、瓶、輪胎、燈罩、桶） | `L.lathe([(r,y),…], seg=12～24)` 旋轉體 | `prop_pothos.py` 的盆（口緣往外翻、底部內縮）；近景 seg ≥ 16 |
| 管、桿、藤、電線、扶手 | `Mesh.cyl(a,b,r,seg=)`、自己的 `tube()`／`catmull()`（`prop_pothos.py`）、`sweep()`（`dorm_interior.py`） | 檯燈的兩節臂、垂下來的藤 |
| 軟的東西（坐墊、枕頭、布） | `soft_box()`（`dorm_interior.py`）、`Mesh.ell()` 橢球 | 辦公椅座墊 |
| 植物 | `tools/blender/plants.py`（模型葉子＋葉片卡）、`prop_pothos.py` 的 `leaf()`（主脈隆起、兩側往下、葉尖下垂） | 不要用球體當樹冠 |
| 建築立面 | `archkit.py`、`wz_shopkit.py`、`wz_street.py` 的組件 | 窗有窗台、鋁框、窗內房間；牆有勒腳、雨痕 |

**輪廓檢查**：從遊戲鏡頭的角度（手機直向、6 m、俯角 0.22）看剪影——如果剪影是長方形，就要加會破壞輪廓的東西：雨遮、冷氣、招牌側板、盆栽、晾的衣服、管線、欄杆。

#### 2-3 材質
- **近景主要材質用 Poly Haven PBR**：`L.pbr('名稱', 'id', tile=重複公尺, target='#目標平均色', normal=0.2～0.6, maps=('diff','nor'), res=256～512)`。
  - `target` 把貼圖的平均色調到想要的顏色、保留明暗細節（例：`granular_concrete` 調成橡膠地墊的藍、軟木的 `#b8895a`）。
  - 有斑駁、太髒的貼圖用 `b3lib.img_adj(contrast=…)` 收（例：和室土牆）。
- **金屬度上限 0.45**（`b3lib.MAX_METAL`；遊戲沒有環境貼圖，金屬度太高會變黑）；不鏽鋼、鋁用 0.3～0.45＋粗糙度 0.3～0.5，底色用深一點的灰（#7d8084 左右），不然暖光下會偏白。
- **柏油維持淺灰**（D30，約 #a8a8a6）；路面的貼圖要加 `map.userData.asphalt`（入夜變暗）。
- 小零件（螺絲、把手、文具、碗盤）用頂點色 `CMesh`，最後 `vc_consolidate` 合成一個材質。
- 印刷品（菜單、票、包裝、招牌字）：程式畫成貼圖集，一個材質；**沒有真實店名、商標**。
- 發光（招牌、窗、燈）：材質名照 場景規則第 4 節（`GLOW_*`、`ck_glass_lit`…），夜晚由遊戲設亮度；需要漸層時用自發光貼圖（`campus_socsci.py` 的 `lit_ramp()`：柱子由下往上 0.30→0.80，天花板整片）。

#### 2-4 磨損與生活痕跡（環境的另一半）
| 痕跡 | 做法 | 例子（腳本） |
|---|---|---|
| 污漬、油漬、鏽水 | 程式畫在貼圖上：`R.stain(x,z,r,dL=,warm=)`（局部壓暗＋偏暖） | `wz_road_tex.py`（停車處的油漬、鐵柵旁的鏽水） |
| 雨痕 | 半透明貼圖疊在外牆：`wz_stain.png`（`gen_street_textures.py`），材質 `wz_stain`（glTF BLEND） | `wz_street.py` 每個窗台下 |
| 標線磨損 | 畫標線時用 `wear＝被磨掉的比例` | `wz_road_tex.py` 白線、紅線、斑馬線 |
| 補丁、裂縫 | 不規則邊緣、顏色只差一點、灌縫膠有斷有續（第一版「深色方塊」被退件） | `wz_road_tex.py` |
| 用舊的東西 | 掉漆、手印、油污集中在常摸的地方（把手、下緣、桌角） | BB-B `scooter_shop_props.py` 的工具牆 |
| 生活的東西 | 不是對齊的：書斜放、紙箱轉 3～7°、垂藤繞過障礙、外送箱、回收紙箱、安全帽、雨衣、晾衣 | `dorm_y2_items.py`、`wz_props.py`、`aa_support/wz7_street_props.py` |

**生活痕跡的位置要合理**：髒的地方是人和水會經過的地方（地面接牆、門口、把手、車停的地方），不是均勻撒。

#### 2-5 AO（接觸陰影）——現況與做法
遊戲有即時陰影，但**沒有 SSAO**，所以接觸的地方要自己做暗：
1. **畫進貼圖**：地面貼圖在靠牆、靠路緣的地方壓暗（`wz_road_tex.py` 的 `ao_edge(dist_fn, width=0.35, dL=-26)`「靠牆的暗角」：`dist_fn()` 回傳每個像素到牆的距離（公尺），width 內由暗到原色、曲線 ^1.6）。巷口、門口不要畫。
2. **頂點色**：`CMesh.paint(faces, hexcol, k=0.85～0.95)` 讓靠地、靠牆的零件暗一點；同一個物件的下緣用比較暗的顏色。
3. **人物**：`tools/char_polish.py` 的 `neck_shadow()`、`under_chin()`（下巴投影畫進貼圖）。
4. **還沒有的**：Blender 自動烘焙 AO 到頂點色或光照貼圖的共用工具——**目前沒有**。需要的人先用 1～2；做了新工具要登記在第 9 節。

#### 2-6 比例
- 和遊戲裡已有的東西比：門高 2.1 m、桌面 0.77 m、椅面 0.485 m、人物 1.75 m（祐廷）、欄杆 1.1 m、樓層 3.0～3.4 m。
- 在遊戲內截圖裡放一個人物（玩家）比大小；Blender 渲染裡放一個 1.75 m 的參考柱。

#### 2-7 合併與效能（手機）
順序（`wz_street.py`、`wz_park.py` 的結尾就是這樣）：
1. `L.realize_small_instances(root)`：只用 1～3 次的 instancing 改成各自一份。
2. `L.auto_vc_groups(...)`＋`L.vc_consolidate(root, groups)`：純色材質 → 共用頂點色材質（matte／metal／gloss）。
3. `L.atlas_small(...)`（小貼圖材質合成一張）、`L.atlas_rows(...)`（沿 u 重複的條紋）、`L.atlas_tiles(...)`（磁磚、木紋這種兩個方向都重複的，**不糊**）。
4. `L.merge_by_material(root, keep=…)`：同材質合成一個網格；會淡出的牆（`WALL_*`）、招牌字面、遊戲要找名字的節點用 `keep` 保護。
5. 輪胎、碗盤這種圓的小東西降邊數（輪胎 12 邊、碗 6 邊），但近景主角不降。

預算：場景規則第 5 節；溫州街整條 draw call ≤310、三角形 ≤42 萬（`wz_street_integration`）。**還沒量效能之前，不准拿手機效能當理由把東西做成方塊**（D38 第 9 條）。

#### 2-8 匯出
- `L.export(OUT, gpu_instances=False)` → GLB（貼圖自動 WebP）；同名 `.json` 寫規格：節點、三角形、材質、尺寸、放置位置、貼圖來源（`L.write_json`）。
- 遊戲要切換顯示的東西，每件一個節點（例：`POTHOS_S1～S4`、`ITEM_film`、`ROOMMATE_KAI`），名字寫進 json 和 README。

---

### SOP 3. 驗收（交件前自己先做；我驗收時也照這個看）

#### 3-1 必附的圖
1. **Blender 渲染**（`render_cycles.py`）：正面 3/4、側面、特寫；暖光（傍晚）、白天各一。
2. **遊戲內截圖**（`fast_shots.py` 或專用腳本）：
   - 同一個鏡頭的**修改前／修改後**（`--block=新檔.glb` 拍修改前）；
   - 時段 11:00、17:30、20:30；
   - 手機 390×844、844×390（dpr 2）；
   - 至少一張「平常玩的鏡頭」（戶外 6 m／室內 3.6 m 跟隨），不是只有特寫。
3. 前後並排的對照表。

#### 3-2 八項逐項紀錄（交件 README 必須有這張表，沒做到的寫原因）
| 項目 | 看什麼 | 怎麼量／怎麼看 |
|---|---|---|
| 輪廓與倒角 | 剪影不是長方形；邊有倒角 | 遊戲鏡頭的截圖；腳本裡用了 rbox／lathe／sweep 的地方 |
| 材質 | 近景是 PBR（Poly Haven）＋正確的粗糙度、金屬度 ≤0.45 | 列出 Poly Haven id、tile、target |
| AO | 接地、接牆的地方有暗 | 截圖上看接觸處；用了第 2-5 節哪一種 |
| 磨損 | 常摸、常碰的地方舊；不是均勻撒 | 列出磨損的位置 |
| 生活痕跡 | 有人在用的感覺；不對齊 | 列出放了什麼 |
| 比例 | 和人物、門、桌子比對得上 | 截圖裡的人物；實際尺寸表 |
| 效能 | 三角形、材質數、GLB 大小在預算內 | `glbstat.py`／json；整合測試的 draw call |
| 遊戲截圖 | 3-1 的那些都有 | 檔名列表 |

#### 3-3 狀態
- 舊成果不全部推倒，但要分清楚：**「舊標準已通過」**（2026-10-16 20:2x 以前驗收的）和**「新標準已通過」**（照這份 SOP、八項都有紀錄的）。
- `READY_FOR_REVIEW`（交件）→ LAWWW2-B 驗收（`驗收通過（新標準）`／退件附具體理由）→ 整合 → 場景美術由 **BB** 標 `ART_APPROVED`（D120）；人物美術由值班 LAWWW 驗收（D100a）；美術驗收不經使用者（D128）。

#### 3-4 會直接退件的（照場景規則 9-7，再加三條）
- 同一個模型複製一整排、只換顏色（要多個款式：參考真實世界的不同品牌、年份、大小）。
- 只有 Blender 渲染、沒有遊戲內截圖。
- README 沒有第 3-2 節的八項紀錄。

---

### SOP 4. 審查：LAWWW2-B 怎麼看支援 AI 的成果

1. 先看遊戲內的「平常玩的鏡頭」，再看特寫；**手機直向**優先。
2. 逐項對第 3-2 節；有一項沒達標就寫「要改什麼、改成什麼樣（尺寸、顏色、形狀）」，不寫「再精緻一點」這種話。
3. 小地方我可以直接改支援 AI 的腳本（使用者 20:2x 授權），改了在對方的 README 記一筆（改了什麼、為什麼、SHA）。
4. 驗收紀錄寫在 `aa_support/README.md`、`bb_support/README.md` 那件的段落裡（舊標準／新標準分開）。

---

### SOP 5. 示範案例

`docs/art-rebuild/second_ai/sop_demo/README.md`：溫州街路面（精修第 3 批）＋小公園土地公廟去積木化——修改前後同角度遊戲截圖、腳本、材質做法、參數、驗收紀錄。照著它的格式做。

---

### SOP 6. 給支援 AI 的交件格式（README 一節）

```
## ART-XXX 名稱（交件 SHA；狀態 READY_FOR_REVIEW）
- 參考：照片／規格的來源，實際尺寸表
- 腳本：tools/blender/env_second/<aa|bb>_support/xxx.py；指令
- 輸出：assets/models/env/second_ai/<aa|bb>_support/xxx.glb（三角形、材質、大小）
- 八項紀錄（第 3-2 節的表）
- 圖：Blender 渲染、遊戲內前後截圖（時段、畫面大小）
- 授權：Poly Haven id（LAWWW2-B 合併進 LICENSES.md）
- 沒做到的：……（原因）
```

---

### SOP 9. 新方法登記表（新增在下面，舊的不刪）

| 日期 | 方法 | 工具／函式 | 第一次用在 | 誰 |
|---|---|---|---|---|
| 2026-10-16 | 路面整條畫成一張貼圖集＋顆粒法線（每公尺重複，KHR_texture_transform） | `wz_road_tex.py`、`wz_props.py` 的 `road_mat()` | 溫州街路面 | LAWWW2-B |
| 2026-10-16 | 2D 磁磚貼圖集（不糊） | `lib2.atlas_tiles` | 溫州街效能第四輪 | LAWWW2-B |
| 2026-10-16 | 支援素材的擺放：相對錨點節點放 | `wz_park.py` 的 `place_support(path, plan, group)` | 小公園 PARK1～3 | LAWWW2-B |
| 2026-10-16 | 自發光漸層（柱子由下往上） | `campus_socsci.py` 的 `lit_ramp()` | 社科院夜晚 | LAWWW2-B |
| 2026-10-16 | 人物臉的局部修改（眼睛連眼窩皮膚一起縮、眉毛照畫出來的線移動） | `tools/char_polish.py` 的 `eye_socket_pinch()`、`brow_natural()` | 祐廷 3D 臉試做 | LAWWW2-B |
| 2026-10-16 | 單色灰底立繪去背（投影法） | `tools/portraits/cut_reference_portraits.py` 的 `KEY` | 學姊面試西裝 | LAWWW2-B |

---

### SOP 10. 3D 美術總監的品質標準（使用者 2026-10-21 12:0x，UA-LAWWW2-1021-02；LAWWW2 和之後的繼任者照做）

- **來源**：使用者要 LAWWW2 當《法條之外》的 3D 美術總監：
  - 自己找出遊戲裡不夠好的地方，改到自己也認為可以交付；
  - 不是只做被點名的模型；
  - **「模型成功載入」不是完成的標準**。
- 第 2、3 節照舊（怎麼做一件東西、八項紀錄）。這一節管的是「**整個場景在玩家眼裡夠不夠好**」。

#### 10-1 玩家鏡頭五項（每個場景都用這五項看，判斷的依據是遊戲內截圖）
| 項目 | 問自己 | 常見的毛病 |
|---|---|---|
| 空間可信度 | 這個地方蓋得起來、用得起來嗎？ | 尺寸不對（門比人矮、桌子太深）；結構說不通（樑沒有柱、樓梯通到牆）；房間沒有出入的動線 |
| 生活真實感 | 有人在這裡生活、工作嗎？ | 樣品屋；每件都對齊網格；牆上什麼都沒有；店裡沒有庫存、價目、雜物 |
| 視覺一致性 | 和隔壁的場景是同一個遊戲嗎？ | 同一條街的細緻度落差大；光的顏色、亮度互相打架；新舊模型風格不同；室內外接起來顏色跳掉 |
| 可玩性 | 玩家走得到、看得懂、不被擋嗎？ | 模型擋住人物、對話框、按鈕；牆淡出以後東西浮在空中；互動點在家具裡面；坐下以後鏡頭看到黑的桌面或牆 |
| 效能 | 手機跑得動嗎？ | draw call、三角形比同類場景多一截；光暈、透明物件疊太多層；材質沒有合併 |

#### 10-2 玩家鏡頭要特別看的地方
- **街景**：走在路上的高度往前看自不自然；店門口到座位的路線順不順。
- **教室**：坐下以後窗外的景合不合理（樓層高度、方向）。
- **夜晚**：燈有沒有亮在該亮的地方；有沒有一片死黑或一片過曝。
  - 光暈在白天花板、低天花板上特別容易過曝（2026-10-21 體育館 B1 就是這樣）。
- **牆淡出**：牆淡出以後，東西有沒有浮在空中。
- **遮擋**：模型有沒有擋住人物、對話、UI。
- **時段**：白天、黃昏、夜晚三個時段；直向、橫向；至少兩個鏡頭角度。

#### 10-3 交付前自己驗收（沒做的要寫「沒做」）
1. 載入：沒有 JS 例外；GLB 的三角形、材質、大小記下來。
2. 導航、碰撞、互動：
   - 跑 `tests/reachability_all.py --zones <區域>`，加上那個場景的流程測試；
   - 改過座位的跑 `seatcheck`。
3. 時段：白天、黃昏、夜晚的截圖。
4. 多角度：沒有穿模、遮擋、浮空。
5. 效能：
   - 修改前後同一個鏡頭的 draw call、三角形；
   - 變多就寫原因，說明值不值得。
6. 修改前後同角度的截圖，放進交件 README。
7. 測試環境照實寫：
   - Playwright＋SwiftShader 手機模擬、單元測試、瀏覽器流程測試分開寫；
   - **iPhone 實機沒測就寫沒測**。
- 技術問題（導航、碰撞、效能、程式接線）我自己解決，不丟給使用者。

#### 10-4 驗收與退件
- 場景美術交件以後請 **BB 做獨立的畫面驗收**；BB 退件，我直接修，不經過使用者。
- 整合、測試、發布照舊：LAWWW 整合；LAWWW2 交 patch 或 GLB，不碰 `main`、不發布。
- 狀態照舊：
  - BB 驗收通過以後寫「BB 畫面驗收通過」；
  - 場景美術的 `ART_APPROVED` 由 BB 標（D120、D128：不經使用者）；
  - 角色美術由值班 LAWWW 驗收（D100a）。

#### 10-5 不自己決定、要使用者決定的事
- 遇到下面三種情況：
  - （整體畫風、色調的大改：D128 起由 LAWWW2 提案、BB 和 LAWWW 同意就定案，不必等使用者）
  - 替換使用者確認過的設計；
  - 一定要用使用者提供的素材（照片、指定的圖）。
- 處理方式：
  - **保留原設計**；
  - 在 `HANDOFF.md` 寫一筆待決事項（現況、提案、比較圖）；
  - 不假定使用者已經批准；
  - **不因為這件事停下其他場景**。
- 使用者暫停的範圍照舊：
  - 溫州街修改暫停（10-17）；
  - 人物凍結（D99）；
  - 日本場景全 2D（10-18）。

#### 10-6 巡場景的順序（照玩家接觸的先後）
- 依序是：
  1. 校園；
  2. 法律系館（霖澤館、萬才館）；
  3. 宿舍；
  4. 公館；
  5. 溫州街（暫停中，只記錄、不改）；
  6. 118 巷；
  7. 室內教室；
  8. 日夜變化；
  9. 交換學期場景（美國）。
- 每一區：
  - 先確認現在開發分支整合的是哪一版（不要重做已經接好的東西）；
  - 用 10-1 的五項拍玩家鏡頭；
  - 列出毛病，排優先順序：卡關、穿模 ＞ 第一印象 ＞ 細節；
  - 改、交件。
- 巡查紀錄寫在 `ART_DIRECTOR_PATROL.md`：區域、日期、開發分支的 SHA、找到的毛病、處理狀態。

## 6. 場景程式（改這些要跑的測試；D108）

改任何導航或區域幾何先看 `docs/rules/ROLE_LAWWW.md` 第 7.3 節（架構速覽），再照下面跑測試。

- **多樓層＋Blender 正式模型（v9.4 起）**（需求：`docs/history/specs/21_*`、`22_*`；D36 分層導航方案 A、D37 法律系館A室內、D38 永久美術規範）。
  - 引擎：每層一張 `E3.NavGrid`（同尺寸、同原點）＋格子高度（`addSurf`：平台 `{y}`、斜面 `{axis,ya,yb}`；`tread/rise/low`＝畫面上一階一階的高度）；樓梯格子兩層共用、高度相同的地方可以換層；`gridPath` 是（層, 格）的 A*。人物有 `lv`、真的 `y`（`settleY` 用 `visualHeightAt`）；`E.nav` 永遠是玩家那一層。存檔 `pos.lv`、`pos.y`（舊存檔預設第 0 層）。**改任何導航或區域幾何要跑 `node tests/nav_levels_unit.js`、`node tests/nav_buildings_unit.js`**。
  - 法律系館A：穿堂可以走（0.9 m）；室內是 `linze` 區域（`src/building3d.js`、配置 `src/data/linze_layout.js`：大廳、雙跑樓梯、玻璃電梯、二樓迴廊、201 教室門；三樓以上整修中）；201 是階梯教室（`src/data/classroom_layout.js`，48 個座位都能坐）。
  - Blender（`/opt/blenv/bin/python tools/blender/<腳本>.py`；共用 `tools/blender/b3lib.py`；貼圖 Poly Haven CC0 在 `tools/blender/textures/`）：`linze_interior.py`、`classroom_201.py`、`linze_exterior.py` → `assets/models/env/*.glb`（`ASSETS` 的 `type:'building'`）。程序化版本留作導航與載入失敗的備用（D38 分類 ③）。遊戲沒有環境貼圖：金屬度上限 0.45（`b3lib.MAX_METAL`）。
  - 走樓梯腳步貼合：`character3d.js` 的 `footIK`（真實骨架、兩段式 IK）；`node tests/stairs_feet_unit.js` 量腳和踏面的距離。
- **法律系館B第二階段（2026-10-11，D41；需求 21「法律系館B的弧形大樓梯必須能讓玩家走上去」）**：校園有兩層導航格（`zones3d.js` 的 `wancaiStairs`：第 1 層只有法律系館B大樓梯、樓梯頂端平台、弧形陽台）；大樓梯兩層共用，高度用 `CK.lawhall` 畫台階的同一組外緣（`ck.wancai.outl`：畫面一階一階 `vfn`、碰撞連續 `fn`）；陽台下的一樓入口照舊在地面那一層；二樓入口這一版關著（告示）。外觀是 Blender 模型（`tools/blender/wancai_exterior.py` → `assets/models/env/wancai_exterior.glb`，台階外緣用 `--check` 和遊戲比對）。戶外往下走樓梯時鏡頭俯角會加（`engine3d.js` 的 `C.pitchAdd`）。**改法律系館B或校園導航要跑 `node tests/nav_buildings_unit.js`、`node tools/dev_scratch/kit_nav_check.js`、`tests/campus_layout_nav.py`、`tests/flow_wancai_stairs.py`、`tests/wancai_glb_integration.py`**；改 `CK.lawhall` 的法律系館B台階要重新匯出 GLB（外緣不一致時 `--check` 會失敗）。
- **法律系館B第三階段：室內兩層樓（2026-10-11，D42）**：`wancai` 區域搬到 `src/wancai3d.js`（配置 `src/data/wancai_layout.js`，Blender `tools/blender/wancai_interior.py` 讀同一份）。**一樓大廳的座標和 v9.3 完全相同**（柱子、沙發、圓桌、公告欄 `notice:'lawclub'`、出口 (0,6.6)、`story3d.js` 的劇情站位與 `CLUB_SPOTS`、`TA_SPOT`）；二樓 4.2 m：北側走廊、西側迴廊、西南門廳；西側直跑樓梯往南爬（第二跑＋最上一階兩層共用）、東側玻璃電梯（`B3.buildElevator`，3F 以上按不亮：要刷識別證）；平台上的二樓入口打開（從二樓的門出去回到平台，校園第 1 層）。房間門牌不用「201」（法服公告寫法律系館B 201，社團目前在大廳聚會）。改法律系館B室內要跑 `node tests/nav_buildings_unit.js`、`tests/flow_wancai_floors.py`、`tests/zone_transitions.py`、`tests/reachability_all.py`。
- **總圖第一階段：大廳＋二樓自習區（2026-10-11，D43；需求 21「圖書館可進入閱讀區、自習區」）**：校園的總圖門口進新區域 `library_hall`（`src/library3d.js`、配置 `src/data/library_layout.js`）：一樓大廳（門廳、閘門、服務台）＋帝國式中央大樓梯（中間一跑上到平台、兩側兩跑折返，三跑與平台兩層共用）＋電梯＋二樓自習區（長桌可以坐下讀書）。現有的閱覽室（`library`）是「3F 閱覽區」（劇情：「我看過你在三樓」），座標、座位、劇情不動，出口改成樓梯間（回到大廳二樓東側）、東側多一部電梯。電梯可以到**別的區域**的樓層（樓層資料 `zone`；`E.spawnHint` 讓新區域建好時車廂停在那一層、人在車廂裡；`GAME.enter` 的 `deferStory`／`noAutosave`）。小安「總圖的下午」（原文「二樓靠牆的長桌」）改成走到大廳二樓就開始（`story3d.js` 的 S.tick；舊存檔在閱覽室的照舊）。正式模型 `tools/blender/library_interior.py`（植物：室內樹＝葉片卡、大葉盆栽＝模型葉子，共用做法在 `tools/blender/plants.py`）；窗外的景是遊戲裡校園的畫面 `assets/models/env/library_view_*.webp`（`tools/shots/library_views.py` 重拍；改校園的總圖附近或椰影大道後可以重拍）。窗玻璃不能放進牆的淡出群組（`fadeWalls` 會把整組設成不透明）。**改總圖要跑 `node tests/nav_buildings_unit.js`、`tests/flow_library_floors.py`、`tests/flow_library_scene.py`**。
- **宿舍走廊（2026-10-11，D44；需求 21 第 3 點「宿舍可進入房間、走廊」）**：校園「回宿舍」進新區域 `dorm_hall`（`src/dorm3d.js`、配置 `src/data/dorm_layout.js`）：一樓門廳（舍監室窗口、信箱、公告）、交誼廳（沙發、電視、販賣機、長桌）、走廊、雙跑樓梯（A 跑 → 平台 1.8 m → B 跑，兩層共用）、二樓走廊；北側 203 是祐廷和阿凱的房間，進去就是現有的 `dorm` 區域（座標、劇情都不動，房間的出口改成「走出房間」→ 二樓走廊）。走廊兩側的牆是鏡頭碰撞（`E.colliders`）。正式模型 `tools/blender/dorm_hall.py`。**改宿舍要跑 `node tests/nav_buildings_unit.js`、`tests/flow_dorm_hall.py`**；導航格的邊界放在 0.2 的奇數倍（見 `dorm_layout.js` 開頭）。
- 沿路線移動（2026-10-11，`engine3d.js`）：最後一步只走到轉折點（`stepSp`）；換層（`switchLevel`）用人物所在那一層的**連續高度**比、容許值依步長放寬——跑步＋低幀率時一步 0.41 m，舊做法會在樓梯底來回跳、換不回地面那一層。`tests/nav_buildings_unit.js` 有跑步＋低幀率的上下樓梯檢查。
- 校園（v9.3）：依使用者提供的校總區平面圖重排（D23、D25）——大門 → 椰影大道 → 總圖；晨思鐘＋行政大樓在大道南側、文學院正對面、校史館靠大門、映月湖（湖心亭＋木棧道）、椰影小徑；大王椰子與闊葉樹改成 `townkit3d.js` 程序化（`royalPalm`、`tree`）。法律系館A、宿舍、校門座標沒動（舊存檔與測試不受影響）；改校園要跑 `tests/campus_layout_nav.py`。v9.3 第六批起，行政大樓、文學院、校史館、總圖用 `src/campuskit3d.js`（`CK.hall`）蓋；建築的導航阻擋由套件回傳（`userData.ck.blocks`：建築本體＋拱廊柱子＋門廊），在 `zones3d.js` 的 `ckPlace` 轉成世界座標，鏡頭碰撞也在 `ckPlace` 加（本體＋拱廊上方樓層）；第七批起兩棟法律系館（A館、B館）也是套件，一樓拱廊走得進去；第九批男一舍（沒有拱廊的版本）、社會科學院（`CK.modern` 現代白色系館）；第十批農業陳列館（`CK.pavilion`：圓洞鏤空牆）——校園已經沒有 `W3.building` 方盒，所有建築的導航阻擋與鏡頭碰撞都來自套件。
- 校園（v9.3 第十七～二十批，使用者 2026-10-09 提供椰影大道、法律系館A、B照片並要求全面改造）：椰影大道中間 12 m 柏油路＋黃色虛線（照片）、大王椰子拉高到約 20 m、兩側大樹牆；大道兩側與舟山路補了沒有名字的系館、停車架、腳踏車。法律系館A、B改用 `CK.lawhall`（D28）：法律系館A是穿過整棟的三層樓高穿堂（`entry:'portal'`）、法律系館B是偏西的玻璃入口＋弧形大台階（`entry:'stairs'`、`annex`）；**台階、門廊、穿堂都不能走**（D26：沒有地形高度），入口互動點在台階下（`userData.ck.doorX/doorZ`）。法學院後面（建築背面到圍牆）不能走。地圖邊界外是走不到的背景（D27，`TK.bgCity`＋`zones3d.js` 的 campusBackdrop）：校門外照公館區域座標換算（公館 (gx,gz) → 校園 (x=-170-gz, z=gx)），改公館的店面或馬路時，校園這邊的背景要一起改。校園 `viewFar:260, fogNear:100`；**`engine3d.js` 的 applyTime 每幀設霧的距離，要用 `E.fogFar`**（第二十批之前一直被重設成畫質預設值，區域的 viewFar 沒生效）。遠景剪影（makeSkyline）在不透明那一輪、天空之後先畫，不能改回半透明（會蓋住 118 m 以外的建築）。改校園的空曠程度用 `tools/dev_scratch/view_audit.py`（360° 盤點）檢查。
- 公館（v9.3 第十一批）：南側店面街改用 `TK.apartment` 的連續騎樓（`ground.through`、`ground.pillars`），整個南側往馬路搬 30 m（店面立面 z=19、店門互動點 z=21、從店裡出來站在 z=18）；西端是往溫州街的巷口（轉角公寓＋路名牌）；校門那一側看得到校園（圓窗館側面、椰子樹）。改公館要跑 `tests/gongguan_layout_nav.py`；店門口座標和 `tests/p0_movement.py` 的「公館店門口」出生點要一起改。捷運出口（`TK.mrtExit`，第十二批）、校門（`CK.gate`，第十四批，校園與公館共用；`zones3d.js` 的 `placeGate` 轉換導航阻擋）已換新；第十六批換了晨思鐘（`CK.bell()`，+z 是石碑那一面，用 `placeBlocks()` 把 `userData.gate.blocks` 轉成導航阻擋，`placeGate` 也用它）和路燈（`W3.lampPost()`：柱座、燈桿、燈臂、燈罩是一個共用幾何＋燈罩玻璃；燈頭位置 (0, 3.95, 0.75) 不能動，各區域的夜間光暈與地面光圈照這個位置加）。
- 室內（v9.3 第十五批）：`zones3d.js` 的 `room()` 有天花板（單面朝下：鏡頭超過天花板高度時看不到，維持剖面視角）和窗（`winWall` 選哪一面牆、`winXs` 位置、`curtains`；窗的零件掛在 `zone.winParts`，牆淡出時一起隱藏；19:24 以後換夜景貼圖）。便利商店的貨架是 `goodsWall`（導航和 `shelfWall` 相同）。
- 鏡頭：跟隨鏡頭只對建築碰撞；樹幹、電線桿擋住玩家時用「樹幹透視」（`engine3d.js`，shader 網點透空，只作用在 `userData.seeThrough` 的材質；`townkit3d.js` 的 `seeThru()` 標記）。改鏡頭要跑 `tests/see_through.py`。
- 太陽方位（v9.3 第二十一批，D29）：`engine3d.js` 的時段表 azimuth 是羅盤方位；戶外照 x 往東、-z 往北換算，區域座標轉過方向的在區域定義加 `sunYaw`（公館 `π/2`）；室內維持舊的方向。**新增戶外區域或改區域方向時要設 `sunYaw`**，不然中午的太陽會跑到北邊（v9.3 之前就是這樣：朝南的系館正面整天背光）。
- 柏油路（v9.3 第二十二批，D30）：照片的淺灰（`W3.asphaltTex`、`TK.asphaltTex`、`zones3d.js` 的 `avenueRoadTex`，底色約 #acacaa）。貼圖有 `userData.asphalt`，`engine3d.js` 會在入夜時把這些材質調暗；**新增柏油貼圖要加這個標記**，不然晚上整條路會發亮。
- 法學院區（v9.3 第二十四批，D31，使用者提供配置圖＋法律系館B照片）：法律系館B的入口互動點在陽台下的一樓入口 (93.8,-100.6)，從法律系館B出來在 (93.8,-98.4)；正面的弧形量體、樓梯、平台、凸出量體不能走，陽台底下可以走。國際學苑是兩館中間後方的背景（走不到），黑森林＋小水池在法學院廣場南邊。改 `CK.lawhall` 要跑 `node tools/dev_scratch/kit_nav_check.js`。
- 找路（v9.3 第二十五批，D35）：`E3.NavGrid.path` 先只走「人物（半徑 0.33 m）站得住」的格子（`clearMask`），找不到才退回舊的；拉直路線用 `losR`。**加家具、改 `blockRect` 後跑 `tests/reachability_all.py`**（全遊戲 103 個互動點用引擎真正的移動模擬走一遍；`--legacy` 切回舊找路）。測試用的掛勾：`E.simWalk`、`?navlegacy`、`GAME.walkFallbacks`（劇情自動走路卡住 4 秒遊戲時間就放到目的地的次數，真實流程測試要求 0）、`GAME.seatApproach`、`GAME.minimapArrow`。
- 黃昏調色提案（`engine3d.js` 的 `KEY_GOLDEN`；比較圖在 VISUAL_REVIEW 第 10 節）：**使用者 10-18 已選「預設就開」**（GRADE-GOLDEN-DEFAULT；D108 起由 LAWWW2 改：只把 `E.grade` 預設改成 golden、`?grade=off` 回到原本，並重拍第 10 節）。2026-10-21 整合進開發分支（LAWWW2 `723d49a4`，`40a8ddc3`）：開發分支預設開、`?grade=off` 回到原本；線上 v9.10.3 還是關，下一版才開。

## 7. 場景定案（每條一兩行；詳細座標看程式和 `src/data/*_layout.js`）

- **D22**：兩點半 Café 在溫州街東端路口（門面朝西，正對整條巷子）；原本西端改成住家公寓；「回公館」出口在路口南側。
- **D23、D25**：校園配置照校總區平面圖「壓縮」進遊戲：x 往東、-z 往北；大門 → 椰影大道（約 1:3.7）→ 總圖正面朝西；大道南側晨思鐘＋行政大樓、北側文學院、校史館與農業陳列館靠大門；映月湖在文學院北邊（湖心亭、木棧道）。刻意和真實不同：法學院放在椰影小徑北端。
- **D24**：天空要有雲與遠景（程序雲、晚霞、星星；遠方市區剪影與山稜線，只在室外）。
- **D27**：校園邊界外是走不到的背景（不加導航、碰撞；合併方盒＋立面貼圖）；校門外照公館的配置換算（公館 (gx,gz) → 校園 (x=-170-gz, z=gx)），改公館的店面或馬路時校園背景一起改；遠景系館不掛名字。
- **D28、D31**：法律系館A＝花崗石下三層、紅磚上層、正面中央三層樓高穿過整棟的穿堂；法律系館B＝偏西的玻璃入口＋往下張開的弧形大台階、樓梯頂端弧形陽台（二樓入口）、陽台下的一樓入口；照片沒拍到的部分是推測。國際學苑在兩館中間後方（背景）、黑森林＋小水池在法學院廣場南邊。
- **D29**：戶外太陽照台北方位（azimuth 是羅盤方位）；區域座標轉過方向的設 `sunYaw`（公館 `π/2`）；室內維持原本的光線方向。
- **D30**：柏油路是淺灰色（受光約 RGB 160–170、偏冷），入夜跟著變暗（深夜是白天的 58%）。
- **D35**：找路考慮人物寬度（半徑 0.33 m 站得住的格子優先）；劇情自動走路 4 秒沒前進就放到目的地（`GAME.walkFallbacks`，真實流程測試要求 0）；「坐下」先走到椅子旁站得住的點。
- **D36**：多樓層方案 A——每層一張 NavGrid（同大小、同原點）＋每格地板高度＋兩層共用的樓梯格＋電梯；人物有真的 y；剖面視角；存檔多 `pos.lv`、`pos.y`（舊存檔＝一樓）。
- **D37**：法律系館A室內是遊戲化設計：一樓大廳、沿西牆的直跑樓梯、中庭玻璃電梯（1F、2F；3F 以上整修中）、二樓迴廊、201 階梯教室（6 排 × 8 座位）。
- **D41、D42**：法律系館B的弧形大樓梯走得上去（校園第 1 層導航格；台階畫面一階一階、碰撞連續斜面）；室內兩層樓，一樓大廳座標不變。
- **D43**：總圖大廳（`library_hall`）＋帝國式中央大樓梯＋電梯＋二樓自習區；原本的閱覽室是「3F 閱覽區」（座標、劇情不動）。
- **D44**：男生宿舍門廳、交誼廳、走廊、雙跑樓梯、二樓走廊；203 是祐廷和阿凱的房間（原本的 `dorm` 區域）。
- **D53**：法律學院圖書館在法律系館B（不是總圖）；開放時間：學期間週一至五 08:10–21:45、週六日 09:10–17:00，寒暑假週一至五 09:10–17:00、週末不開，國定與校定假日不開；閉館要離館。
- **D63**：博思教學館照官方平面圖對照（101 大型講堂 400 席），保留目前地圖的外觀尺度，優先改善 101 的講堂感、自習區、鏡頭與效能。
- **D107**：社科院照真實位置：法律系館A西南、椰影小徑西邊（大樓在北、圖書館在南，正門朝東）；模型座標用 `tools/gen_socsci_layout.py` 換算，`zones3d.js` 照 `SOCSCI_LAYOUT.place` 放。

## 8. 美術 WIP 收斂（D88 第 3 點）

逐條：①列 HEAD SHA、獨有 commit（用內容比對，cherry-pick 過的 SHA 不同）、檔案與資產 ②確認沒整合的模型、貼圖、Blender、GLB、材質、場景修改 ③有效的整合進交付分支（cherry-pick、選擇性檔案整合或 PR）④處理衝突，不讓舊版蓋掉新版 ⑤驗證資產完整（Blender／GLB 載得起來、貼圖都在、符合規格）⑥原始成果完整保留，任務紀錄與交付 SHA 更新 ⑦驗證完才標「可以刪」交 LAWWW 複核。沒完成但還有價值的 WIP 保留完整資產和未完成任務，不為了清理而放棄。

## 9. 啟動提示詞（第一次在某個帳號開 LAWWW2 的工作階段時貼；把 `<X>` 換成帳號字母）
```
你是《法條之外：台灣法律人生》帳號 <X> 的 LAWWW2（帳號 A 叫 LAWWW2，帳號 B／C／D 叫 LAWWW2-B／LAWWW2-C／LAWWW2-D），美術總監：3D 美術、場景程式。這是接班，不是新專案：不要重新規劃，也不要請使用者重講需求。只用繁體中文。
先做：git fetch origin '+refs/heads/*:refs/remotes/origin/*' --prune → python3 tools/handoff/check_handoff.py duty find 找 RULE_SOURCE（結束碼 1 停下來問我）→ 用 git show origin/<RULE_SOURCE>:<檔> 讀 CLAUDE.md 和 docs/rules/ROLE_LAWWW2.md → 照 CLAUDE.md §4 接班十四步做完（工具加 --ref origin/<RULE_SOURCE>）、duty register 登記 → bash tools/blender/setup_env.sh → 回我「接班確認」→ 立刻接續 check_handoff.py queue --owner LAWWW2。
上一任只看 docs/handoff/duty.json，不照帳號順序、不靠記憶。我的新訊息永遠先回（短回合，最多約 10 分鐘）。不傳訊息給休班帳號。
```
