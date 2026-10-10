# 美術資產清單與替換狀態（ASSET INVENTORY）

> 依 `CLAUDE.md`「MANDATORY 3D ART PRODUCTION RULES」第 7 條與 `docs/art-rebuild/ART_DIRECTION.md` 第 12.7 節（D38，2026-10-10 使用者訂定的永久規範）建立。
> 每次替換資產都要更新這份清單。驗收狀態：`BLOCKOUT` → `MODEL_READY` → `INTEGRATED` → `FUNCTIONAL_VERIFIED` → `READY_FOR_ART_REVIEW` → `ART_APPROVED`（只有使用者確認才能標）。
>
> **分類**：①已達品質要求可保留 ②適合遠景或背景 ③適合當碰撞、導航或 GLB 載入失敗時的備用 ④主要近景模型、必須升級 ⑤已被正式 GLB 取代、停止當預設畫面。
> 一個資產可以同時是 ④（畫面要升級）和 ③（升級後留作導航與備用）。
>
> **誠實說明**：v9.3 以前「正式化」的套件（`CK`、`TK`、`W3`）都是 three.js 程序化幾何＋canvas 貼圖。照 D38 的標準，近景部分**全部還不算正式美術**，下表一律標 `BLOCKOUT`（即使當時寫過 READY_FOR_ART_REVIEW）。

最後更新：2026-10-10（v9.4 第一批）

## 一、校園建築（`src/campuskit3d.js`，`CK`）

| 資產 | 用在哪裡 | 分類 | 狀態 | 升級做法（D38） |
|---|---|---|---|---|
| `CK.lawhall` 霖澤館（外觀） | 校園：法學院廣場北側 | ⑤（套件：③導航阻擋、鏡頭碰撞、GLB 失敗時的備用） | **INTEGRATED**：`tools/blender/linze_exterior.py` → `assets/models/env/linze_exterior.glb`（2.32 MB；Poly Haven 花崗石磚、預鑄混凝土、紅磚；窗框窗戶 GPU instancing）；穿堂、前後台階可以走（D36）；新舊比較 VISUAL_REVIEW 17.1 | 玻璃反射（沒有環境貼圖）、遠處磚紋、Meshopt／KTX2 壓縮；使用者看過才能標 ART_APPROVED |
| 霖澤館室內（`src/building3d.js` 程序化備用） | 霖澤館大廳、樓梯、二樓迴廊（`linze` 區域） | ③（備用；點地面用的透明地板也在這裡，正式模型載入後搬出來繼續用） | 正式模型 **INTEGRATED**：`tools/blender/linze_interior.py` → `linze_interior.glb`（1.95 MB）；遊戲化設計（D37，沒有照片）；比較圖 VISUAL_REVIEW 17.2 | 三樓以上、更多家具與標示 |
| 玻璃電梯（`building3d.js` 程序化，要動） | 霖澤館中庭 | ④ | BLOCKOUT | Blender 車廂與井道模型（車廂、門分開的節點，遊戲照樣控制開關與上下） |
| `CK.lawhall` 萬才館 | 校園：法學院廣場東側 | ④＋③ | BLOCKOUT；弧形大樓梯**還不能走** | 第二階段：Blender 外觀＋大樓梯可以走（高度面）＋室內樓層 |
| `CK.hall` 總圖、行政大樓、文學院、校史館、男一舍、無名系館 | 校園 | ④（總圖、行政大樓、文學院：主要地標）／②（無名系館、遠的） | BLOCKOUT | 第三階段：地標逐棟 Blender；背景系館可保留程序化 |
| `CK.modern` 社會科學院、背景系館 | 校園東側 | ④（社科院）／② | BLOCKOUT | 第三階段 |
| `CK.pavilion` 農業陳列館（洞洞館） | 校園西側 | ④ | BLOCKOUT | 第三階段 |
| `CK.gate` 校門 | 校園西端、公館 | ④ | BLOCKOUT | 第三階段（地標） |
| `CK.bell` 傅鐘 | 椰林大道南側 | ④ | BLOCKOUT | 第三階段（地標） |
| `CK.tileTex`、各套件的 canvas 貼圖（面磚、花崗石、紅磚） | 全部校園建築 | ④ | BLOCKOUT（canvas 隨機斑點） | 換 Poly Haven PBR（紅磚、花崗石、混凝土） |

## 二、台北街景（`src/townkit3d.js`，`TK`）

| 資產 | 用在哪裡 | 分類 | 狀態 | 升級做法 |
|---|---|---|---|---|
| `TK.apartment` 騎樓街屋、公寓 | 公館南側店面街、溫州街 | ④（近景店面）／②（後排） | BLOCKOUT | Blender 模組化組件（騎樓柱、鐵窗、冷氣、招牌、鐵捲門）＋PBR 磁磚、洗石子 |
| `TK.japaneseHouse` 日式老屋 | 溫州街 | ④ | BLOCKOUT | Blender（雨淋板、黑瓦、木窗） |
| `TK.mrtExit` 捷運出口 | 公館 | ④ | BLOCKOUT | Blender（地標） |
| `TK.utilityPole`、`TK.wires`、`TK.trafficMirror`、`TK.mailbox`、`TK.aBoard`、`TK.pots` | 溫州街、公館 | ④ | BLOCKOUT | Blender 道具組＋Instancing |
| `TK.scooter`（`W3.scooter` 舊版） | 公館、溫州街、校門外背景 | ④（近景）／②（背景） | BLOCKOUT | Blender 機車（2–3 款）＋Instancing＋遠景 LOD |
| `TK.road`、`W3.asphaltTex`、人行道磚 | 全部戶外 | ④ | BLOCKOUT（canvas） | Poly Haven 柏油／鋪面 PBR，**維持淺灰（D30）**、入夜變暗的標記保留 |
| `TK.tree`、`TK.royalPalm`、`TK.plantClump` | 全部戶外 | ④（近景）／②（遠景） | BLOCKOUT（葉片卡） | Blender 樹（大王椰子、樟樹、榕樹）＋Instancing＋遠景卡片 LOD |
| `TK.bgCity`、`E3` 天際線剪影 | 地圖邊界外 | ② | 保留（背景） | 不升級（背景） |
| `TK.lightPool`、`TK.glowSprite`、夜間發光材質 | 路燈光圈、窗光 | ① | 保留（效果，不是模型） | — |

## 三、通用物件（`src/world3d.js`，`W3`）

| 資產 | 用在哪裡 | 分類 | 狀態 | 升級做法 |
|---|---|---|---|---|
| `W3.building`（LEVEL_BLOCKOUT 方盒） | 已不在校園使用 | ⑤／③ | 已被套件取代 | 不再當畫面 |
| `W3.lampPost` 路燈 | 校園、公館、溫州街 | ④ | BLOCKOUT | Blender 路燈（燈頭位置 (0,3.95,0.75) 不變，夜間光暈照舊） |
| `W3.bike`、`W3.bikeRack` | 校園（含霖澤館後面的小廣場） | ④ | BLOCKOUT | Blender 腳踏車＋Instancing |
| `W3.bench`（`ASSETS 'prop.bench'`，CC0 GLB） | 校園長椅 | ①（待使用者確認） | INTEGRATED | 保留；風格不合再換 |
| `W3.palm`、`W3.banyan`、`W3.bush`、`W3.hedge`、`W3.bulletin`、`W3.planter`、`W3.vending`、`W3.foodCart`、`W3.gate`、`W3.mrtEntrance`、`W3.awning` | 舊版 fallback／零星 | ③／⑤ | 舊 placeholder | 不再當正式畫面 |
| `W3.grassTex`、`W3.pathTex`、`W3.stoneTex`、`W3.brickTex`、`W3.facadeTex`（canvas） | 地面、室內地板 | ④ | BLOCKOUT | Poly Haven PBR |

## 四、室內（`src/zones3d.js`）

| 資產 | 用在哪裡 | 分類 | 狀態 | 升級做法 |
|---|---|---|---|---|
| `room()` 牆、地板、天花板、窗 | 萬才館大廳、總圖、Café、便利商店、麵店、書店、宿舍 | ④＋③ | BLOCKOUT | 逐間 Blender 室內（第二、三階段） |
| 201 階梯教室（v9.4：平台、走道台階、長桌、木翻椅） | `classroom` 區域 | ③（程序化版本留作導航與備用） | 正式模型 **INTEGRATED**：`tools/blender/classroom_201.py` → `classroom_201.glb`（1.57 MB；深色長桌、木翻椅 48 張 instancing、木講桌、投影幕、方格天花板＋日光燈，照使用者的教室照片）；48 個座位導航 FUNCTIONAL（Node 模擬）；瀏覽器真實流程見 TESTING 第八節 | 黑板／投影內容、窗外景、使用者看過才能標 ART_APPROVED |
| `desk()`、`chair()`、`shelfWall()`、`goodsWall()`、床、沙發、Café 家具 | 各室內 | ④ | BLOCKOUT | Blender 家具組（GLB，同一款重用） |

## 五、人物（`src/character3d.js`、`assets/models/char/`）

| 資產 | 分類 | 狀態 | 升級做法 |
|---|---|---|---|
| VRoid CC0 樣本改作的主角與重要 NPC（`vroid_*.vrm`） | ④ | INTEGRATED；**不是最終模型**（D38 第 5 條：臉、髮型、服裝輪廓多半來自同幾個樣本） | Blender 修整臉型、髮型、服裝輪廓；上下樓梯、轉身、坐下、起身、開門的動作（Blender Action／NLA）；腳不穿過台階（IK） |
| 路人（4 個底模＋顏色） | ②（中遠景）／④（近景） | INTEGRATED | 增加底模款式（不能只靠換色） |
| `people3d.js` 程序化人物 | ③／⑤ | 只在 VRM 全部失敗時出現 | 不再當畫面 |
| `chars3d.js` Q 版 | ⑤ | 已淘汰（不載入） | — |

## 六、天空、光線、效能

| 項目 | 分類 | 狀態 | 升級做法 |
|---|---|---|---|
| 天空 shader（漸層、雲、星星）、日夜時段表 | ① | 保留 | 加合法 HDRI 做環境反射（PBR 材質需要），白天／黃昏／夜晚 |
| 遠景剪影（山、台北市區、台北 101） | ② | 保留 | — |
| 壓縮（glTF Transform、Meshopt、KTX2） | — | **尚未導入**（v9.4 第一批先用 WebP 貼圖、512 px） | 量測 GLB 大小與手機載入時間後導入 Meshopt（需要加 decoder），KTX2 需要 basis transcoder |
