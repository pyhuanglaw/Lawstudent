# 美術資產清單與替換狀態（ASSET INVENTORY）

> 依 `CLAUDE.md`「MANDATORY 3D ART PRODUCTION RULES」第 7 條與 `docs/art-rebuild/ART_DIRECTION.md` 第 12.7 節（D38，2026-10-10 使用者訂定的永久規範）建立。
> 每次替換資產都要更新這份清單。驗收狀態：`BLOCKOUT` → `MODEL_READY` → `INTEGRATED` → `FUNCTIONAL_VERIFIED` → `READY_FOR_ART_REVIEW` → `ART_APPROVED`（只有使用者確認才能標）。
>
> **分類**：①已達品質要求可保留 ②適合遠景或背景 ③適合當碰撞、導航或 GLB 載入失敗時的備用 ④主要近景模型、必須升級 ⑤已被正式 GLB 取代、停止當預設畫面。
> 一個資產可以同時是 ④（畫面要升級）和 ③（升級後留作導航與備用）。
>
> **誠實說明**：v9.3 以前「正式化」的套件（`CK`、`TK`、`W3`）都是 three.js 程序化幾何＋canvas 貼圖。照 D38 的標準，近景部分**全部還不算正式美術**，下表一律標 `BLOCKOUT`（即使當時寫過 READY_FOR_ART_REVIEW）。

最後更新：2026-10-10 22:05 UTC（v9.4.2 候選：LAWWW2 的溫州街、Café、四間室內；六位主要人物的 Blender 第一版）

## 一、校園建築（`src/campuskit3d.js`，`CK`）

| 資產 | 用在哪裡 | 分類 | 狀態 | 升級做法（D38） |
|---|---|---|---|---|
| `CK.lawhall` 法律系館A（外觀） | 校園：法學院廣場北側 | ⑤（套件：③導航阻擋、鏡頭碰撞、GLB 失敗時的備用） | **INTEGRATED**：`tools/blender/linze_exterior.py` → `assets/models/env/linze_exterior.glb`（2.32 MB；Poly Haven 花崗石磚、預鑄混凝土、紅磚；窗框窗戶 GPU instancing）；穿堂、前後台階可以走（D36）；新舊比較 VISUAL_REVIEW 17.1 | 玻璃反射（沒有環境貼圖）、遠處磚紋、Meshopt／KTX2 壓縮；使用者看過才能標 ART_APPROVED |
| 法律系館A室內（`src/building3d.js` 程序化備用） | 法律系館A大廳、樓梯、二樓迴廊（`linze` 區域） | ③（備用；點地面用的透明地板也在這裡，正式模型載入後搬出來繼續用） | 正式模型 **INTEGRATED**：`tools/blender/linze_interior.py` → `linze_interior.glb`（1.95 MB）；遊戲化設計（D37，沒有照片）；比較圖 VISUAL_REVIEW 17.2 | 三樓以上、更多家具與標示 |
| 玻璃電梯（`building3d.js` 程序化，要動） | 法律系館A中庭 | ④ | BLOCKOUT | Blender 車廂與井道模型（車廂、門分開的節點，遊戲照樣控制開關與上下） |
| `CK.lawhall` 法律系館B | 校園：法學院廣場東側 | ⑤＋③（套件留作導航、鏡頭碰撞、載入失敗的備用） | **INTEGRATED**（2026-10-11，D41）：外觀換成 Blender `wancai_exterior.glb`（`tools/blender/wancai_exterior.py`）；弧形大樓梯**可以走**（兩層共用的台階高度，平台與陽台在校園第 1 層）；二樓入口這一版關著；`READY_FOR_ART_REVIEW` | 室內兩層（二樓入口接陽台）；兩側張開的窄台階目前不能走 |
| `CK.hall` 總圖、行政大樓、文學院、校史館、男一舍、無名系館 | 校園 | ④（總圖、行政大樓、文學院：主要地標）／②（無名系館、遠的）；總圖、行政大樓、文學院、校史館：⑤＋③ | **總圖**：LAWWW2 Blender `campus_library.glb`（1.47 MB、22,816 個三角形；拱窗是真的窗洞、切石、面磚、屋瓦 PBR），導航、碰撞、互動點不變，`READY_FOR_ART_REVIEW`（second_ai/VISUAL_REVIEW 第 8 節）；**行政大樓**：LAWWW2 Blender `campus_admin.glb`（0.92 MB、13,453 個三角形，套件 20,443；米黃面磚、拱窗窗洞、三拱門廊＋三面陽台欄杆、檐部匾額），`READY_FOR_ART_REVIEW`（second_ai/VISUAL_REVIEW 第 10 節）；**文學院、校史館**：LAWWW2 Blender `campus_arts.glb`（0.65 MB、8,776 個三角形）、`campus_hist.glb`（0.51 MB、6,354 個三角形；門廊圓石柱）；紅褐面磚、拱窗窗洞、拱廊、山牆＋牛眼窗、石材匾額，`READY_FOR_ART_REVIEW`（second_ai/VISUAL_REVIEW 第 11 節）；其他（男一舍、無名系館）：BLOCKOUT | 第三階段：地標逐棟 Blender（LAWWW 23:26Z 順序：總圖 → 晨思鐘 → 行政大樓 → 文學院、校史館）；背景系館可保留程序化 男一舍外觀（**使用者 2026-10-18 03:3x：四座全部換 Blender**（「如果要整個改，那就沒關係就叫他直接改全部改」）；普通／博思含室內；位置、門口、導航不動；ART-EXT-*，LAWWW2） |
| `CK.hall` 共同教學館（外觀，2026-10-13 D55） | 校園：大道南側、行政大樓東邊（真實位置；取代原本的無名系館，同尺寸） | ④（近景、必須升級）；套件留作③導航阻擋與備用 | **BLOCKOUT**（掛館名牌；門口有入口名牌） | LAWWW2 Blender 外觀 GLB（已分派，排在法圖之後）；真實外觀照片查證 |
| `CK.hall`×2＋天橋 大一女舍 A、B 棟（外觀，2026-10-13 D55） | 校園：西南角、舟山路西段南側（學務處官方：近公館捷運站 2、3 號出口；取代無名系館 (-92,66)） | ④；套件留作③ | **BLOCKOUT**（A 棟傳達室、B 棟刷卡門；門口長椅、腳踏車架；2 樓天橋是程序化方盒＋玻璃） | LAWWW2 Blender 外觀（A、B、天橋、門口等候區、生活細節）；照片查證 |
| `CK.modern` 社會科學院、背景系館 | 校園東側 | ④（社科院）／②；社科院：⑤＋③ | **社科院**：LAWWW2 Blender `campus_modern.glb`（0.17 MB、1,968 個三角形，套件 5,392；帶狀長窗是真的窗洞、外凸的樓板邊、薄簷＋女兒牆、往內退 1.2 m 的玻璃大廳、雨遮、匾額），導航、碰撞、互動點不變，`READY_FOR_ART_REVIEW`（second_ai/VISUAL_REVIEW 第 13 節）；國際學苑（AI-1）、背景系館：BLOCKOUT | 有照片時照照片改社科院（現在照套件的量體做） |
| `CK.pavilion` 農業陳列館（洞洞館） | 校園西側 | ⑤＋③ | LAWWW2 Blender `campus_pavilion.glb`（0.14 MB、968 個三角形，套件 378；鏤空牆是貼圖透明度挖的圓洞（前後兩層）、二樓內牆晚上照房間透出暖光、往內退的玻璃帷幕、入口石材門框＋匾額；入口正前方不放柱子），導航、碰撞、互動點不變，`READY_FOR_ART_REVIEW`（second_ai/VISUAL_REVIEW 第 13 節） | 有照片時照照片改（真實的洞洞館是綠釉陶管砌的鏤空牆） |
| `CK.gate` 校門 | 校園西端、公館 | ④ | BLOCKOUT （**使用者 2026-10-18 03:3x：四座全部換 Blender**（「如果要整個改，那就沒關係就叫他直接改全部改」）；普通／博思含室內；位置、門口、導航不動；ART-EXT-*，LAWWW2） | 第三階段（地標） |
| `CK.bell` 晨思鐘 | 椰影大道南側 | ⑤＋③（套件留作導航阻擋與載入失敗的備用） | LAWWW2 Blender `campus_bell.glb`（126 KB、1,562 個三角形；切石台基與柱子、瓦屋頂、銅鐘三道鐘帶、石碑匾額、夜間地燈／柱面暖光／光暈），導航、互動不變，`READY_FOR_ART_REVIEW`（second_ai/VISUAL_REVIEW 第 9 節） | 有照片的話照照片改比例與細節 |
| `CK.tileTex`、各套件的 canvas 貼圖（面磚、花崗石、紅磚） | 全部校園建築 | ④ | BLOCKOUT（canvas 隨機斑點） | 換 Poly Haven PBR（紅磚、花崗石、混凝土） |

## 二、台北街景（`src/townkit3d.js`，`TK`）

| 資產 | 用在哪裡 | 分類 | 狀態 | 升級做法 |
|---|---|---|---|---|
| `TK.apartment` 騎樓街屋、公寓 | 公館南側店面街、溫州街 | 溫州街：⑤＋③；公館：④（近景店面）／②（後排） | **溫州街**：被 LAWWW2 的 Blender GLB 取代（`wenzhou_street.glb`：主巷 14 棟＋遠景 15 棟，同一套材質與窗戶原型；`READY_FOR_ART_REVIEW`，v9.4.2 候選／遠景在下一版），套件留作 `?nobldg` 與載入失敗的備用。**兩點半 Café**：`cafe_exterior.glb`（v9.4.1 已上線）。**公館**：BLOCKOUT（LAWWW2 21:21Z 認領，製作中） | 公館：同溫州街的做法（Blender 模組化組件、同材質合併、窗戶共用原型） |
| `TK.japaneseHouse` 日式老屋 | 溫州街 | ⑤＋③ | 被 `wz_jphouse.glb`（日式宿舍＋院牆，LAWWW2 Blender）取代；`READY_FOR_ART_REVIEW`（v9.4.2 候選） | — |
| `TK.mrtExit` 捷運出口 | 公館 | ④ | BLOCKOUT （**使用者 2026-10-18 03:3x：四座全部換 Blender**（「如果要整個改，那就沒關係就叫他直接改全部改」）；普通／博思含室內；位置、門口、導航不動；ART-EXT-*，LAWWW2） | Blender（地標） |
| `TK.utilityPole`、`TK.wires`、`TK.trafficMirror`、`TK.mailbox`、`TK.aBoard`、`TK.pots` | 溫州街、公館 | 溫州街：⑤＋③；公館：④ | 溫州街：被 `wz_props.glb`（電線桿、反光鏡、路名牌、Café 門前紅磚道）取代，`READY_FOR_ART_REVIEW`；公館：BLOCKOUT | 公館跟著公館近景一起換 |
| `TK.scooter`（`W3.scooter` 舊版） | 公館、溫州街、校門外背景 | 溫州街、公館：⑤＋③；校門外背景：② | 溫州街：`scooter.glb`（兩款，LAWWW2 Blender）`READY_FOR_ART_REVIEW`；**公館：同一個 GLB，分組 InstancedMesh（北側 5 組、南側 3 組，看不到的那組整組不畫），`READY_FOR_ART_REVIEW`（second_ai/VISUAL_REVIEW 第 12 節）**；校門外背景：維持套件 | 更多車款（檔車、外送箱、安全帽） |
| `TK.road`、`W3.asphaltTex`、人行道磚 | 全部戶外 | ④ | BLOCKOUT（canvas） | Poly Haven 柏油／鋪面 PBR，**維持淺灰（D30）**、入夜變暗的標記保留 |
| `TK.tree`、`TK.royalPalm`、`TK.plantClump` | 全部戶外 | ④（近景）／②（遠景）；套件＝③（`street_trees.glb` 載入失敗、`?nobldg` 時的備用） | `TK.tree`、`TK.royalPalm`：LAWWW2 Blender（`street_trees.glb`：樟樹兩款、榕樹、大王椰子的模型＋遠景卡片；`TK.tree`／`TK.royalPalm` 載入後回傳樹的位置記號，整區 InstancedMesh：42 m 內畫模型、遠的畫面向鏡頭的卡片、畫面外不畫），位置、高度、樹冠參數、導航阻擋照呼叫端，`READY_FOR_ART_REVIEW`（second_ai/VISUAL_REVIEW 第 15 節）；`TK.plantClump` 還是 BLOCKOUT（葉片卡） | 樹種、樹形沒有照片參考；遠景卡片只有一個角度；`plantClump`（灌木叢） |
| `TK.bgCity`、`E3` 天際線剪影 | 地圖邊界外 | ② | 保留（背景） | 不升級（背景） |
| `TK.lightPool`、`TK.glowSprite`、夜間發光材質 | 路燈光圈、窗光 | ① | 保留（效果，不是模型） | — |

## 三、通用物件（`src/world3d.js`，`W3`）

| 資產 | 用在哪裡 | 分類 | 狀態 | 升級做法 |
|---|---|---|---|---|
| `W3.building`（LEVEL_BLOCKOUT 方盒） | 已不在校園使用 | ⑤／③ | 已被套件取代 | 不再當畫面 |
| `W3.lampPost` 路燈 | 校園、公館、溫州街 | ④ | BLOCKOUT；LAWWW2 的 `street_props.glb`（路燈、腳踏車、長椅）`MODEL_READY`、整合驗收中 | Blender 路燈（燈頭位置 (0,3.95,0.75) 不變，夜間光暈照舊） |
| `W3.bike`、`W3.bikeRack` | 校園（含法律系館A後面的小廣場） | ④ | BLOCKOUT | Blender 腳踏車＋Instancing |
| `W3.bench`（`ASSETS 'prop.bench'`，CC0 GLB） | 校園長椅 | ①（待使用者確認） | INTEGRATED | 保留；風格不合再換 |
| `W3.palm`、`W3.banyan`、`W3.bush`、`W3.hedge`、`W3.foodCart`、`W3.gate`、`W3.mrtEntrance`、`W3.awning` | 舊版 fallback／零星 | ③／⑤ | 舊 placeholder | 不再當正式畫面 |
| `W3.planter` 花台、`W3.bulletin` 公告欄、`W3.vending` 販賣機 | 法學院前庭、椰影大道北側、法律系館A西側、法律系館B一樓（`wancai3d.js` 的公告欄） | ⑤＋③ | LAWWW2 Blender（`street_props.glb` 的 `planter_box`、`bulletin_board`、`vending_machine`：水泥花槽＋灌木葉片卡＋小花、木框軟木板＋雨遮＋公告紙、紅色飲料販賣機＋展示窗＋背光），尺寸照程序化版本、導航不變，`READY_FOR_ART_REVIEW`（second_ai/VISUAL_REVIEW 第 14 節）；`?nobldg`、載入失敗照舊程序化 | 公告紙上的字、飲料瓶細節、展示窗玻璃 |
| `W3.grassTex`、`W3.pathTex`、`W3.stoneTex`、`W3.brickTex`、`W3.facadeTex`（canvas） | 地面、室內地板 | ④ | BLOCKOUT | Poly Haven PBR |

## 四、室內（`src/zones3d.js`）

| 資產 | 用在哪裡 | 分類 | 狀態 | 升級做法 |
|---|---|---|---|---|
| `room()` 牆、地板、天花板、窗 | 總圖、Café、便利商店、麵店、書店、宿舍（法律系館B改用 `src/wancai3d.js`） | Café、便利商店、麵店、書店、宿舍：⑤＋③；總圖：④＋③ | **Café**：`cafe_interior.glb`（v9.4.1 已上線）；**便利商店、麵店、書店、宿舍**：LAWWW2 Blender GLB（`cvs_interior`、`noodle_interior`、`bookstore_interior`、`dorm_interior`），導航格與程序化版完全相同，`READY_FOR_ART_REVIEW`（v9.4.2 候選）；**總圖閱覽室**：BLOCKOUT | 總圖：Blender 室內（閱讀區、自習區，需求 21） |
| 法律系館B室內兩層樓（`src/wancai3d.js`＋`src/data/wancai_layout.js`；D42） | `wancai` 區域 | ⑤＋③（程序化備用留作導航與載入失敗時） | **INTEGRATED**（2026-10-11）：Blender `tools/blender/wancai_interior.py` → `wancai_interior.glb`（2.36 MB、4,954 個三角形）；一樓大廳座標和 v9.3 相同（劇情、社團、舊存檔照舊）、二樓走廊／迴廊／門廳、樓梯、玻璃電梯、二樓門通到外面平台；遊戲化設計（不是實測）；`READY_FOR_ART_REVIEW`（使用者還沒看過） | 磨石子地在燈光下偏白、近處玻璃欄杆偏霧；樓梯下方是實心石材；房間都關著（演講廳、研討室） |
| 總圖書館大廳（`src/library3d.js`＋`src/data/library_layout.js`；D43） | `library_hall` 區域（新）；閱覽室（`library`）多了電梯與樓梯間的出口 | ⑤＋③（程序化備用留作導航與載入失敗時） | **INTEGRATED**（2026-10-11）：Blender `tools/blender/library_interior.py` → `library_interior.glb`（5.1 MB、約 4.8 萬個三角形：書一本一個方塊約一半；植物是葉片卡＋模型葉子，第一版的多面體圓球已換掉）；窗外的景是遊戲裡校園的實際畫面（`library_view_*.webp`：正面玻璃看出去是椰影大道、側窗是總圖南側的草地與系館，白天／晚上兩套；原本是程序化畫的綠色半圓）；一樓大廳（門廳、閘門、服務台、期刊報紙、新書展示）、帝國式中央大樓梯、電梯（可以到 3F 閱覽區）、二樓自習區；遊戲化設計（不是實測）；功能驗證與 `READY_FOR_ART_REVIEW` 的截圖在 VISUAL_REVIEW 第 21 節（使用者還沒看過） | 閱覽室（3F）本身還是 `room()` 程序化方盒（④）；GLB 5.1 MB 偏大（Meshopt／KTX2 還沒做） |
| 公共教學館模板（`src/teach3d.js`＋`src/data/gongtong_layout.js`；2026-10-13 D55 第二階段） | `gongtong` 區域（共同教學館室內：大廳、走廊、101／102／201／202 普通教室、U 形樓梯、休息區、自習區、長椅、公告欄；管理室、203、洗手間關著） | ④（近景；程序化版本之後留作③導航與備用） | **BLOCKOUT**（室內未查證＝可替換的模板；功能：導航、77 個座位、教室上課——單元測試通過、瀏覽器還沒跑） | LAWWW2 照同一份 layout 建 Blender 室內（使用者優先順序第 4 項：普通、共同的可重用教室）；之後普通、博雅用同一套模板 |
| 博思教學館、普通教學館室內（`src/teach3d.js`＋`src/data/boya_layout.js`、`putong_layout.js`；2026-10-13 D55） | `boya`、`putong` 區域（校園上的門等方案 A／B） | ④（玩家常停留的近景，必須升級）；程序化留作③導航與載入失敗的備用 | **BLOCKOUT**（備用模型：方盒牆、程序化家具；正式模型由 LAWWW2 照同一份配置做） 普通、博思外觀（**使用者 2026-10-18 03:3x：四座全部換 Blender**（「如果要整個改，那就沒關係就叫他直接改全部改」）；普通／博思含室內；位置、門口、導航不動；ART-EXT-*，LAWWW2） |
| 男生宿舍室內（`src/dorm3d.js`＋`src/data/dorm_layout.js`；D44） | `dorm_hall` 區域（新）；房間（`dorm`）的出口改成二樓走廊 | ⑤＋③（程序化備用留作導航與載入失敗時） | **INTEGRATED**（2026-10-11）：Blender `tools/blender/dorm_hall.py` → `dorm_hall.glb`（2.4 MB、約 1.2 萬個三角形）；一樓門廳、交誼廳、走廊、雙跑樓梯、二樓走廊；遊戲化設計（不是實測）；美術還沒經使用者看過 | 寢室都關著（只有自己的房間能進）；窗外的景還是程序化畫的 |
| 201 階梯教室（v9.4：平台、走道台階、長桌、木翻椅） | `classroom` 區域 | ③（程序化版本留作導航與備用） | 正式模型 **INTEGRATED**：`tools/blender/classroom_201.py` → `classroom_201.glb`（1.57 MB；深色長桌、木翻椅 48 張 instancing、木講桌、投影幕、方格天花板＋日光燈，照使用者的教室照片）；48 個座位導航 FUNCTIONAL（Node 模擬）；瀏覽器真實流程見 TESTING 第八節 | 黑板／投影內容、窗外景、使用者看過才能標 ART_APPROVED |
| 社會科學院 辜先生紀念圖書館 一樓開架閱覽室（⑬；配置 `src/data/soclib_layout.js`，由 `tools/blender/env_second/soclib_layout_gen.py` 產生） | 新區域（還沒接進遊戲；區域程式、導航、校園入口由 LAWWW 做） | ⑤（新做） | `MODEL_READY`（LAWWW2）：`tools/blender/env_second/soclib_interior.py` → `assets/models/env/second_ai/soclib_interior.glb`（白色樹狀柱＋荷葉柱頂、圓形天窗光井、竹集成材的弧形雙面書架與靠牆書架、閱覽長桌＋檯燈、竹椅、北／西玻璃帷幕前的窗邊長桌、服務台、閘門、查詢電腦、閱報區）；配置含導航阻擋（rects／circles）與 65 個座位 | 接進遊戲後：窗外照片（北、西玻璃帷幕）、整合測試、遊戲內截圖 |
| 和平東路二段 118 巷兩側街景（⑭；配置 `src/data/lane118_layout.js`：LAWWW） | 新區域（還沒接進遊戲；區域、導航、店門互動由 LAWWW 做） | ⑤（新做） | `MODEL_READY`（LAWWW2）：`wz_street.py --set lane118` → `assets/models/env/second_ai/lane118_street.glb`（9 間店＋補空檔的住家、樓梯間、一般小店；字牌板面照溫州街的做法由遊戲畫字） | 接進遊戲後：遊戲內截圖、夜間燈光、照片查證 |
| 騎車用的腳踏車（⑫） | 新資產（還沒接進遊戲；騎乘姿勢、IK、操作由 LAWWW 做） | ⑤（新做） | `MODEL_READY`（LAWWW2）：`bike_ride.py` → `assets/models/env/bike_ride.glb`（235 KB；節點 frame／fork／wheel_f／wheel_r／crank／pedal_l／pedal_r，樞紐自我檢查）＋從模型量的尺寸表 `bike_ride.json` | 接上人物後：遊戲內截圖、踩踏動作 |
| 法律系館B 法律學院圖書館（配置 `src/data/lawlib_layout.js`、區域 `src/lawlib3d.js`：LAWWW） | 程序化備用模型（LAWWW）→ 正式模型載入後藏起來 | ③（備用）／新做 | `READY_FOR_ART_REVIEW`（LAWWW2）：`tools/blender/lawlib_interior.py` → `assets/models/env/lawlib_interior.glb`（一樓櫃台、閱覽桌、閱覽隔間、玻璃討論室、影印室、U 形樓梯、二樓書架＋書模組 instancing、期刊架）；法律系館B西牆的門（`wancai_interior.py`）；窗景 `lawlib_*` | LAWWW 整合測試；配置的問題 1～7（VISUAL_REVIEW second_ai 17.8）；使用者看美術 |
| 共同教學館外觀（LAWWW2 正式模型；套件 `CK.hall` 留作③導航阻擋與備用） | 校園 (2,33)：取代套件方盒的畫面；導航、門口不變 | ⑤（新做） | `MODEL_READY`（LAWWW2）：`campus_gongtong.py` → `assets/models/env/second_ai/campus_gongtong.glb`（土黃面磚、樓板豎貼帶、洗石子雙拱窗、山牆青瓷花磚、三四樓退縮＋南側開放走廊、西側木造走廊、北側蒲葵 6 棵；依文字資料的遊戲化設計） | LAWWW 接線（VISUAL_REVIEW second_ai 20.5：大道南側大樹牆前 4 棵換蒲葵、蒲葵樹幹導航、鏡頭碰撞）；照片查證 |
| 大一女舍外觀（LAWWW2 正式模型；套件 `CK.hall`×2＋天橋方盒留作③） | 校園 A (−108,68)、B (−78,66)、天橋 (−93,67)：取代套件的畫面；導航、門口、長椅、車架不變 | ⑤（新做） | `MODEL_READY`（LAWWW2）：`campus_freshman.py` → `assets/models/env/second_ai/campus_freshman.glb`（米色二丁掛、樓梯間、窗型冷氣、鐵窗、屋頂水塔與太陽能熱水器、背面曬衣、A 棟傳達室小窗與信箱、B 棟刷卡機、男賓止步；依文字資料的遊戲化設計） | LAWWW 接線（VISUAL_REVIEW second_ai 21.5：fdA、fdB、天橋標 ckTag）；照片查證 |
| 新社科院外觀（LAWWW2 正式模型；取代套件 `CK.modern` 社科院、門前 7 根白柱、⑤ `campus_modern.glb`（白色原型）當預設畫面） | 校園 x 95–125：圖書館 z −92～−70、中庭 z −70～−58、大樓 z −58～−42 | ⑤（新做；舊的 `CK.modern` 社科院與 ⑤ GLB 變成 ⑤ 已被取代） | `MODEL_READY`（LAWWW2）：`campus_socsci.py` → `assets/models/env/second_ai/campus_socsci.glb`（玻璃帷幕、從外面看得到的樹狀柱與天窗、植栽屋頂、8 層清水混凝土、一樓玻璃大廳、中庭；遊戲化南北對調） | **2026-10-16 LAWWW-B 接線（`INTEGRATED`）**：`src/data/socsci_layout.js`（`tools/gen_socsci_layout.py` 從 `campus_socsci.json` 產生）——導航 22 個阻擋＋樹穴、鏡頭碰撞 3 個、圖書館的門改到南牆 (101,−69.3)（出來站 (101,−67.6) 面向南）、中庭 4 張長椅可以坐、大樓室內沒做（門不開；經濟系那年的「社會科學院」說明、SK02 系辦在西面主入口）；舊白色樓與 7 根柱拿掉，備用量體同尺寸（ckTag soc）。`tests/nav_soclib_unit.js`。瀏覽器截圖、reachability_all、flow_soclib 還沒跑（`FUNCTIONAL_VERIFIED` 之前）；照片查證 |
| 教學館家具模組（LAWWW2 正式模型 `assets/models/env/second_ai/furniture_study.glb`：自習雙人桌、自習椅、圓桌、講堂椅（座面放下／收起）、排尾側板、連續桌板＋簡化版；教室門：門框、門片開／關、門牌——VISUAL_REVIEW 第 25 節） | 博思 101 講堂、教學館自習區、教室門口（取代模板的方塊桌椅、牆上的門洞；座位配置、入座、LOD 由 LAWWW 做） | ⑤（新做） | `MODEL_READY`（LAWWW2；還沒接）：VISUAL_REVIEW 第 23 節 | 一個材質（顏色＋法線＋粗糙度／金屬度）、每種一個網格，給 `InstancedMesh` |
| 坐著的聽眾替身（LAWWW2 正式模型 `assets/models/env/second_ai/seated_figures.glb`：路人底模 4 種×3 姿勢×2 配色＝24 種外型，LOD0 約 1,500／LOD1 約 350 三角形，一個材質） | 博思 101 講堂、教學館自習區的遠處人群（近處用真的 VRM 人物；放法、數量、LOD 由 LAWWW 做） | ⑤（新做） | `MODEL_READY`（LAWWW2；還沒接）：VISUAL_REVIEW 第 24 節 | 和講堂椅同一個原點，直接用同一個 instance 矩陣 |
| 桌上小物（LAWWW2 正式模型 `assets/models/env/second_ai/desk_props.glb`：17 種單件＋15 組（講堂 `lset`／自習桌 `tset`／圓桌 `rset`／手上 `hold`）×2 LOD，一個材質，螢幕自發光——VISUAL_REVIEW 第 27 節） | 博思 101 講堂、教學館自習區（配坐姿替身或真的 NPC；放法、配哪一組由 LAWWW 做） | ⑤（新做） | `MODEL_READY`（LAWWW2；還沒接）：VISUAL_REVIEW 第 27 節 | 講堂組、手上的東西和講堂椅、替身同一個原點，直接用同一個 instance 矩陣 |
| 社團博覽會攤位（LAWWW2 正式模型 `assets/models/env/second_ai/club_fair.glb`：九個攤位，每攤一個網格、一個材質——VISUAL_REVIEW 第 28 節） | 椰影大道南側草地（9/30、10/1；服務台換掉 (−13.5, 14.6) 的公告欄、法服換掉 (−18, 14.5) 的招生攤位） | ⑤（新做；取代那兩天的公告欄與方盒招生攤位） | `MODEL_READY`（LAWWW2；配置是 PROPOSAL，還沒接）：VISUAL_REVIEW 第 28 節 | 顯示日期、導航（每頂帳篷 3×3 m）、互動、藏起原本的公告欄與招生攤位由 LAWWW 做 |
| 系籃半場（LAWWW2 正式模型 `assets/models/env/second_ai/bball_court.glb`：鋪面＋場線、籃架、長椅三個網格——`docs/art-rebuild/second_ai/research/系籃球場_位置提案.md`） | 校園（提案 A：映月湖東側 (−4, −113)；B：男一舍與體育館之間 (48.5, 67)；**位置等使用者確認**） | ⑤（新做；現在系籃練球只是體育館門口的一個點） | `MODEL_READY`（LAWWW2；位置是 PROPOSAL，還沒接） | 導航只擋籃架柱子與長椅；活動點搬到長椅前面 |
| 總圖書館 3F 閱覽區（LAWWW2 正式模型 `assets/models/env/second_ai/library_3f.glb`——VISUAL_REVIEW 第 30 節） | library 區域（room() 22×16×4.0） | ④→⑤（取代程序化的牆、地板、桌椅、書架；程序化留作載入失敗的備用） | `MODEL_READY`（LAWWW2；還沒接） | 家具都在原本的導航阻擋範圍裡；電梯（library3d.js）不在 GLB 裡 |
| 映月湖：湖岸、置石、湖心亭、木棧道（LAWWW2 正式模型 `assets/models/env/second_ai/campus_lake.glb`——VISUAL_REVIEW 第 31 節） | 校園 lake()（湖的本地座標，放在 (cx,0,cz)） | ④→⑤（取代程序化的湖岸帶子、柱體亭子、木板；水面 shader、睡蓮、草叢照舊） | `MODEL_READY`（LAWWW2；還沒接） | 程序化的湖岸／亭／木棧道要先放進 `lake_fallback` 群組（patches/lake_fallback_9884d29.patch）；導航不變 |
| `desk()`、`chair()`、`shelfWall()`、`goodsWall()`、床、沙發、Café 家具 | 各室內 | ④ | BLOCKOUT | Blender 家具組（GLB，同一款重用） |

## 五、人物（`src/character3d.js`、`assets/models/char/`）

| 資產 | 分類 | 狀態 | 升級做法 |
|---|---|---|---|
| 六位主要人物的 Blender 版（`bl_yuting`、`bl_heroine_01`～`05.vrm`；`tools/blender/char/`） | ④（升級中） | **六位第一版完成**、`READY_FOR_ART_REVIEW`，只在網址加 `?blchar` 時載入（沈以安第二版；CHARACTER_REVIEW 第 9–14 節）；五官仍是 VRoid 的畫法；祐廷、林芷若、陳語彤、高子晴的頭髮沒有彈簧骨 | 使用者驗收後再決定換成預設；五官、彈簧骨、衣服細節繼續修 |
| VRoid CC0 樣本改作的主角與重要 NPC（`vroid_*.vrm`） | ④ | INTEGRATED（目前的預設畫面）；**不是最終模型**（D38 第 5 條：臉、髮型、服裝輪廓多半來自同幾個樣本） | Blender 修整臉型、髮型、服裝輪廓；上下樓梯、轉身、坐下、起身、開門的動作（Blender Action／NLA）；腳不穿過台階（IK） |
| 路人（4 個底模＋顏色） | ②（中遠景）／④（近景） | INTEGRATED | 增加底模款式（不能只靠換色） |
| `people3d.js` 程序化人物 | ③／⑤ | 只在 VRM 全部失敗時出現 | 不再當畫面 |
| `chars3d.js` Q 版 | ⑤ | 已淘汰（不載入） | — |
| 人物動畫 `char.mixamo_clips`（`assets/models/char/mixamo_clips.glb`，走、跑、待機） | ④ | INTEGRATED；**授權疑慮**：來自 three.js 範例的 Mixamo 動畫，Adobe 條款不允許單獨再散布，repo 是公開的（2026-10-10 再確認，狀態不變） | 換成可以再散布的動畫：Blender 自己做走、跑、待機、上下樓、坐下（D38 第 2 條）或 CC0 動畫；換之前 footIK、坐姿、彈簧骨測試都要重跑 |

## 六、天空、光線、效能

| 項目 | 分類 | 狀態 | 升級做法 |
|---|---|---|---|
| 天空 shader（漸層、雲、星星）、日夜時段表 | ① | 保留 | 加合法 HDRI 做環境反射（PBR 材質需要），白天／黃昏／夜晚 |
| 遠景剪影（山、台北市區、台北 101） | ② | 保留 | — |
| 壓縮（glTF Transform、Meshopt、KTX2） | — | **尚未導入**（v9.4 第一批先用 WebP 貼圖、512 px） | 量測 GLB 大小與手機載入時間後導入 Meshopt（需要加 decoder），KTX2 需要 basis transcoder |
