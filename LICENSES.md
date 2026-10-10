# 第三方素材與授權

| 項目 | 來源 | 授權 | 使用方式 |
|---|---|---|---|
| three.js r187dev | https://github.com/mrdoob/three.js （git clone，2026-09） | MIT | `lib/three.bundle.js`：core＋modules 打包成 classic script；`lib/three.jsm.bundle.js`：GLTFLoader、SkeletonUtils、BufferGeometryUtils |
| Draco decoder（`draco_decoder_gltf.js`） | https://github.com/google/draco | Apache-2.0 | 只在離線工具 `tools/undraco.js` 用來把 Draco 壓縮的 glTF 解成未壓縮 GLB；遊戲執行期不載入 |
| palm-detailed-long, tree-big（Kenney） | market.pmnd.rs（github.com/pmndrs/market-assets，creator: kenney） | CC0 | `assets/models/env/palm-detailed-long.glb`（椰林大道棕櫚）、`tree-big.glb`（校園針葉樹） |
| low-poly-tree, bench, cup, cup-saucer, glass, bottle, plate（Sara Vieira 等） | market.pmnd.rs（github.com/pmndrs/market-assets） | CC0 | `assets/models/env/*.glb`：校園闊葉樹、長椅、咖啡廳／圖書館小道具 |
| bowl-broth, rice-ball, soda-can, sandwich, pizza-box, chopstick, bag, bag-flat | market.pmnd.rs（github.com/pmndrs/market-assets） | CC0 | 麵店、便利商店、教室、宿舍小道具 |
| readyplayer.me.glb（Ready Player Me 範例 avatar） | three.js examples/models/gltf | Ready Player Me 範例模型（three.js 倉庫內附）；**僅原型測試用** | `assets/models/char/rpm_sample.glb`：v8 以前的 TEMP_PLAYER_DEV_MODEL；**v9 起不再載入**（正式模型載入失敗時退回程序化人物，並在 `?dev` 顯示錯誤） |
| Xbot.glb 的 Mixamo 動畫（idle/walk/run/agree/headShake） | three.js examples/models/gltf/Xbot.glb（Mixamo） | Adobe Mixamo 條款：可用於專案，不可單獨再散布動畫檔 | `assets/models/char/mixamo_clips.glb`：已移除網格，只保留骨架與動畫；執行期重定向到主角骨架 |
| Michelle.glb, Soldier.glb, Xbot.glb, readyplayer.me.glb（完整） | three.js examples（Michelle／Soldier／Xbot 為 Mixamo 角色） | 各檔說明；Mixamo 檔案依 Adobe 條款不可單獨再散布 | **只在 `test_glb.html` / `test_rpm.html` 實驗用；未打包進遊戲。** 依使用者要求「全部放上 GitHub」而放在 `assets/models/`；正式發佈前應移除或改用可再散布的檔案 |
| @pixiv/three-vrm（three-vrm、three-vrm-core、materials-mtoon、springbone、node-constraint、materials-v0compat、hdr-emissive-multiplier） | https://github.com/pixiv/three-vrm （git clone，2026-09；以 esbuild 從 TypeScript 原始碼打包） | MIT | `lib/three-vrm.bundle.js`：classic script（global `THREE_VRM`），只含 WebGL 版（不含 WebGPU/TSL 的 MToonNodeMaterial） |
| Seed-san.vrm（VirtualCast, Inc.） | vrm-c/vrm-specification `samples/Seed-san/`（git clone，2026-09） | VRM Public License 1.0（avatarPermission everyone、commercialUsage corporation、allowRedistribution true、modification allowModificationRedistribution、**creditNotation: required**） | `assets/models/char/vrm_player.vrm`：v8 以前的玩家（祐廷）3D 模型；**v9 起遊戲不再載入**（改用 VRoid CC0 改作的 `vroid_yuting.vrm`），檔案仍保留在 repo，所以署名仍需保留。本專案修改：機械手臂／背包／配件 mesh 隱藏（`hide`）、服裝貼圖改成墨綠 T-shirt＋炭灰長褲（`tools/recolor_player_vrm.py`）、貼圖縮小。**必須標示：「Seed-san by VirtualCast, Inc.」**（已寫在遊戲說明頁） |
| 五位女主角 2D 立繪（`assets/portraits/*/campus/neutral.webp`、`assets/portraits_source_sheet.png`） | 使用者提供（2026-09-27 合圖） | 使用者自有素材 | `tools/cut_portraits.py` 去背切圖；ADV 立繪 |
| VRM1_Constraint_Twist_Sample.vrm（(c) 2022 pixiv Inc.） | three-vrm 倉庫 `packages/three-vrm/examples/models/` | VRM Public License 1.0（meta：avatarPermission everyone、commercialUsage corporation、allowRedistribution true、modification allowModificationRedistribution、creditNotation unnecessary） | `assets/models/char/vrm_sample.vrm`：v8 以前小安（heroine_01）的 3D 模型，**v9 起不再載入**；貼圖已縮小（2048→≤1024、移除縮圖，10.5 MB→4.9 MB），其餘未改。正式版應換成自製或授權的 VRM |
| **VRoid Studio β 版 CC0 樣本模型**：HairSample_Male、HairSample_Female、Sakurada Fumiriya（桜田史利矢）、Sendagaya Shibu（千駄ヶ谷渋）、Sendagaya Shino（千駄ヶ谷篠）、Victoria Rubin、Vita（© pixiv Inc. / VRoid Project，已放棄著作權） | VRoid 官方說明「VRoid Studio 的樣本模型是否有使用條件」：β 版樣本為 **CC0**（AvatarSample_A／B／C 另有條件，**未使用**）。取得管道：github.com/madjin/vrm-samples `vroid/beta/`（commit e16eb18）。每個檔案內嵌的 VRM meta 皆為 `licenseName: CC0`、allowedUserName Everyone、commercialUssageName Allow（已用 `tools/vroid_build.py` 讀取確認） | CC0 1.0（不需署名；仍在此註明來源） | `assets/models/char/vroid_*.vrm`：**v9 起的正式 3D 人物**——祐廷（玩家）、沈以安、林芷若、陳語彤、高子晴、溫書瑀、阿哲，以及 4 個路人底模（npc_f1/f2、npc_m1/m2）。v9.2 起另外做的修改：連帽上衣拿掉帽子／抽繩／口袋線改成圓領上衣、針織衫或剪短袖成 T 恤；長褲加寬成直筒寬褲；馬尾改成自然下垂並加三節彈簧骨；眼睛幾何縮小；描邊顏色改成布料的深色。v9.3 起：長直髮沿著頭收成低馬尾（溫書瑀）、短袖襯衫的袖子用程式接長成反摺長袖（溫書瑀）、高領剪成圓領（林芷若、陳語彤、祐廷）。全部由 `tools/vroid_build.py` 修改：衣物在模型之間移植並依骨架重新綁定（例：女性角色穿上 HairSample_Male 的長褲）、刪除被衣物蓋住的皮膚三角形、HairSample_Female 拿掉貓耳並把雙馬尾改成單一高馬尾、貼圖換色、眼型 blendshape 微調、只保留用到的表情、合併同材質 primitive、縮貼圖。原始 VRM 不放進 repo（見 `tools/fetch_vroid_src.sh`） |
| Noto Sans TC / Noto Serif TC | Google Fonts | SIL OFL 1.1 | `<link>` 載入；離線退回系統字型 |

未使用（評估後排除）：Kenney 人物（方塊風格）、market bike（27 萬三角形）、bed/mug/headphones（過重）。
遊戲內其餘貼圖、建築（含 v9 溫州街 `src/townkit3d.js` 的公寓、店面、日式宿舍、電線桿、機車、行道樹）、程序化人物、聲音皆為程式即時產生。所有人物、店名、事件皆為虛構；「台大／公館／溫州街」僅作空間氣質與地標語彙參考。

其他：`legacy/` 的早期 2D 版本與美術測試全部為本專案自製程式（SVG／Canvas），未使用外部素材。`docs/history/specs/` 為使用者撰寫的需求文件，`docs/history/user_feedback_images/` 為使用者提供的實機截圖。

## 本作自製（程式產生，無外部素材）

| 內容 | 檔案 | 說明 |
|---|---|---|
| 人物配件（後背包、托特包、細框眼鏡、銀耳環、咖啡廳圍裙、吉他袋、判決節錄資料夾、髮圈） | `src/props3d.js` | three.js 幾何＋Canvas 布紋貼圖，本作自己寫的程式，無外部素材 |
| 天空（程序雲、星星）與遠方天際線（台北市區剪影、山稜線、台北 101 剪影） | `src/engine3d.js`（`makeSky`、`makeSkyline`） | Shader 雜訊與 Canvas 繪製，本作自己寫的程式；台北 101 只是遠景剪影（公共地標外形），沒有使用任何照片或商標圖 |
| 兩點半 Café 店面與室內（窗框、吊燈、書架、黑板菜單、桌椅、爬藤、盆栽） | `src/townkit3d.js`（`cafeFront`、`plantClump`） | 本作自己寫的程式；葉片貼圖為 Canvas 程序繪製 |
| 大王椰子（椰林大道、小椰林道）、闊葉行道樹 | `src/townkit3d.js`（`royalPalm`、`tree`） | 本作自己寫的程式；樹幹、羽狀葉、葉片貼圖都是 Canvas 程序繪製。取代原本的 Kenney CC0 椰子樹與方塊葉樹（那些 GLB 檔案仍保留，只在 TK 不存在時當 fallback） |
| 醉月湖（水面 shader、石砌湖岸、湖心亭、木棧道、睡蓮葉）、椰林大道杜鵑叢 | `src/zones3d.js`（`lake`、校園） | 本作自己寫的程式，無外部素材 |
| 校園建築外觀（行政大樓、文學院、校史館、總圖：面磚／紅磚、拱窗、一樓拱廊、石材門廊、四坡屋頂、塔樓） | `src/campuskit3d.js`（`CK.hall`） | 本作自己寫的程式；面磚、石材、屋瓦、玻璃貼圖都是 Canvas 程序繪製。依台大老建築常見的特徵做概略外觀，沒有使用照片、圖面或任何外部模型 |
| 校園配置 | `src/zones3d.js`（校園） | 地標相對位置參考臺大校總區平面圖（使用者 2026-10-09 提供，官方網址 https://map.ntu.edu.tw ）。**地圖本身沒有放進 repo，也沒有當貼圖或背景使用**；遊戲裡的建築、道路都是程式產生 |

## Poly Haven 貼圖（CC0，2026-10-10 起，D38）

正式 3D 模型（Blender 腳本 `tools/blender/*.py` 產生的 GLB）用的 PBR 貼圖來自 Poly Haven（https://polyhaven.com ，**CC0**，授權說明 https://polyhaven.com/license ），由 `tools/blender/fetch_polyhaven.py` 下載 1k JPG（顏色 diff、法線 nor_gl、粗糙度 rough）到 `tools/blender/textures/<id>/`，匯出 GLB 時縮成 512 px WebP 打包。

| Poly Haven id | 用途 | 用在哪個模型 |
|---|---|---|
| `large_floor_tiles_02` | 灰色石材地磚、牆面花崗石板、樓梯踏階；教室地磚與座位平台 | `assets/models/env/linze_interior.glb`（霖澤館室內）、`assets/models/env/classroom_201.glb`（201 階梯教室） |
| `painted_plaster_wall` | 白色粉光牆、樓板底面；教室牆面、平台側面 | 兩者 |
| `ceiling_interior` | 天花板；教室方格天花板 | 兩者 |
| `fine_grained_wood` | 服務台、門片、踢腳板；教室深色長桌、木講桌、門 | 兩者 |
| `wood_table_001` | 教室木翻椅（坐墊、椅背） | `classroom_201.glb` |
| `fabric_leather_02` | 大廳皮沙發（染成灰藍） | `linze_interior.glb` |
| `granite_tile_03` | 霖澤館外牆淺灰花崗石（去彩度）、台階、穿堂柱子與大梁 | `linze_exterior.glb`（霖澤館外觀） |
| `granular_concrete` | 灰色預鑄：遮陽板、窗楣遮陽盒、帶窗層、頂樓女兒牆與屋頂板 | `linze_exterior.glb` |
| `red_brick` | 紅磚窗格（五六樓、八九樓） | `linze_exterior.glb` |

（`tools/blender/textures/` 裡其他下載過、還沒用到的材質：`granite_tile`、`granite_tile_02`、`granite_wall`、`grey_plaster_02`、`floor_tiles_06`、`concrete_floor_02`，同樣是 Poly Haven CC0；用到時補進上表。）

## 本作自製的 3D 模型（Blender 腳本，2026-10-10 起）

| 模型 | 腳本 | 說明 |
|---|---|---|
| 霖澤館室內（一樓大廳、直跑樓梯、二樓迴廊） | `tools/blender/linze_interior.py` → `assets/models/env/linze_interior.glb` | 本作自己寫的 Blender Python 腳本建模；配置 `src/data/linze_layout.js`（遊戲化設計，D37）；貼圖見上表（CC0） |
| 霖澤館外觀（十層樓：花崗石基座＋三層樓高穿堂、灰色帶窗層、紅磚窗格＋窗楣遮陽盒、頂樓開放層＋大屋頂板、二樓天橋、玻璃大廳） | `tools/blender/linze_exterior.py` → `assets/models/env/linze_exterior.glb` | 本作自己寫的 Blender Python 腳本建模；量體與導航同 `src/campuskit3d.js` 的 `CK.lawhall`；外觀照使用者提供的霖澤館照片概略重建（照片本身沒有放進 repo；不是精確複製）；館名與「法律學院」招牌由遊戲用 Canvas 字畫（沒有把字型做進模型）；貼圖見上表（CC0） |
| 霖澤館 201 階梯教室（六排平台、兩側走道台階、深色長桌、木翻椅 ×48、講桌、黑板、投影幕、方格天花板＋日光燈、西牆三扇窗） | `tools/blender/classroom_201.py` → `assets/models/env/classroom_201.glb` | 本作自己寫的 Blender Python 腳本建模（共用工具 `tools/blender/b3lib.py`）；配置 `src/data/classroom_layout.js`；外觀參考使用者提供的教室照片（照片本身沒有放進 repo）；貼圖見上表（CC0） |
| 祐廷 Blender 版（v9.4 人物生產線第二位：臉、新的層次短髮、圓領毛衣、直筒寬褲、球鞋；網址加 `?blchar` 才使用，預設仍是 VRoid 加工版） | `tools/blender/char/player.py`（`p00_face.py`、`p00_clothes.py`、`p00_hair.py`，沿用 `h01_*`、`common.py`、`vrm_finish.py`）→ `assets/models/char/bl_yuting.vrm`；Blender 工作檔 `assets/blender/yuting_work_v1.blend` | 身體、臉、表情、骨架的基底是 VRoid CC0 樣本「HairSample_Male」（pixiv，CC0）；毛衣的骨頭權重參考同一樣本原本的連帽上衣（CC0，只用權重，網格是本作腳本產生）；頭髮、衣服、鞋的網格與貼圖由本作腳本產生（numpy，沒有用外部素材）；VRM 匯出用 VRM Add-on for Blender（MIT） |
| 沈以安 Blender 版（v9.4 示範角色：臉部立體結構、新髮型、新衣服；網址加 `?blchar` 才使用，預設仍是 VRoid 加工版） | `tools/blender/char/heroine_01.py`（`h01_face.py`、`h01_hair.py`、`h01_clothes.py`、`common.py`、`vrm_finish.py`）→ `assets/models/char/bl_heroine_01.vrm`；Blender 工作檔 `assets/blender/heroine_01_work_v1.blend` | 身體、臉、表情、骨架的基底是 VRoid CC0 樣本「HairSample_Female」（pixiv，CC0）；頭髮、衣服、鞋的網格與貼圖由本作腳本產生（numpy，沒有用外部素材）；VRM 匯出用 VRM Add-on for Blender（MIT） |

## 開發工具（不打包進遊戲）

- `.claude/skills/blender-web-3d/`：blender-web-3d-skill（https://github.com/czlonkowski/blender-web-3d-skill ，commit `858762f`），MIT License，Copyright (c) 2026 Romuald Członkowski / AiAdvisors；授權全文在該資料夾的 `LICENSE`。Claude Code 專案 Skill，只在開發時使用；裡面的範例模型 `station.glb` 與檢視器範本不載入遊戲。
- Blender 5.2.2（`bpy`，GPL）：開發時用來建模、烘焙材質、匯出 GLB（2026-10-10 起，見 docs/PROJECT_DECISIONS.md D33）。用 Blender 做出來的模型與貼圖不受 GPL 約束（Blender 授權只涵蓋程式本身）。
- VRM Add-on for Blender（https://github.com/saturday06/VRM-Addon-for-Blender ，commit `10bf3e7`），MIT License（或 GPL-3.0-or-later，雙授權；本作依 MIT 使用），Copyright (c) 2018 iCyP、(c) 2022 saturday06：開發時讓 Blender 讀寫 VRM（`tools/blender/char/`，2026-10-10 起）。工具本身不放進 repo、不打包進遊戲；用它匯出的人物模型的授權依模型來源（VRoid CC0 樣本＋本作在 Blender 做的修改）。

## 第二個 AI（環境美術工作階段）的素材與模型（2026-10-10 起）

第二個 Claude Code 工作階段（分支 `claude/second-ai-env-art`，見 `docs/SECOND_AI_HANDOFF.md`）只在這一節追加。格式：素材 id／來源網址／授權／用在哪個模型；本作 Blender 腳本產生的模型寫腳本路徑與輸出 GLB。

| 素材或模型 | 來源 | 授權 | 用在哪裡 |
|---|---|---|---|
| 兩點半 Café 外觀＋店面＋窗內店內＋門口道具 `assets/models/env/second_ai/cafe_exterior.glb` | 本作 Blender 腳本 `tools/blender/env_second/cafe_exterior.py`（配置與零件 `cafe_layout.py`，工具 `lib2.py`） | 本作 | 溫州街東端的 Café 建築 |
| 兩點半 Café 室內 `assets/models/env/second_ai/cafe_interior.glb` | 本作 Blender 腳本 `tools/blender/env_second/cafe_interior.py`（和外觀共用 `cafe_layout.py`） | 本作 | `cafe` 室內區域 |
| 葉片貼圖 `tools/blender/env_second/textures/gen/{ivy,broad,olive,fern}_leaves.png` | 本作程式產生 `tools/blender/env_second/gen_leaves.py`（固定亂數種子） | 本作 | Café 的爬藤、盆栽、窗台植物 |
| Poly Haven `rectangular_facade_tiles`（Charlotte Baglioni） | https://polyhaven.com/a/rectangular_facade_tiles ，`lib2.fetch()` 下載 1k JPG 到 `tools/blender/env_second/textures/` | CC0 | Café 二三樓長條磁磚外牆（校正成米色） |
| Poly Haven `exterior_wall_cladding_02`（Charlotte Baglioni） | https://polyhaven.com/a/exterior_wall_cladding_02 | CC0 | Café 一樓壁柱的深褐磁磚 |
| Poly Haven `plaster_grey_04`（Rob Tuytel） | https://polyhaven.com/a/plaster_grey_04 | CC0 | Café 樓板線、窗台、陽台板 |
| Poly Haven `terrazzo_tiles`（Amal Kumar） | https://polyhaven.com/a/terrazzo_tiles | CC0 | Café 牆腳石、門檻 |
| Poly Haven `dark_wood`（Dario Barresi、Dimitrios Savva、Rico Cilliers） | https://polyhaven.com/a/dark_wood | CC0 | Café 雨遮木板、A 字立牌、店內天花板木梁 |
| Poly Haven `corrugated_iron`（Jenelle van Heerden、Dimitrios Savva） | https://polyhaven.com/a/corrugated_iron | CC0 | Café 樓上窗的浪板雨遮 |
| Poly Haven `herringbone_parquet`（Jenelle van Heerden、Sergej Majboroda） | https://polyhaven.com/a/herringbone_parquet | CC0 | Café 店內人字拼木地板 |
| Poly Haven `white_plaster_02`（Rob Tuytel） | https://polyhaven.com/a/white_plaster_02 | CC0 | Café 店內牆面、天花板 |
| Poly Haven `walnut_veneer`（Jenelle van Heerden） | https://polyhaven.com/a/walnut_veneer | CC0 | Café 店內木護牆、桌椅、吧檯 |
| Poly Haven `black_walnut_veneer_01`（Jenelle van Heerden） | https://polyhaven.com/a/black_walnut_veneer_01 | CC0 | Café 書牆、層架、畫框 |
| Poly Haven `fine_grained_wood`（Rob Tuytel；第一個 AI 已下載到 `tools/blender/textures/`，只讀使用） | https://polyhaven.com/a/fine_grained_wood | CC0 | Café 店面門窗框、招牌框、窗下木板 |

