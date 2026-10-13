# 第二個 AI（環境美術）畫面驗收

> 第二個 Claude Code 工作階段（`claude/second-ai-env-art`，見 `docs/SECOND_AI_HANDOFF.md`）的場景成果。
> 所有遊戲截圖都是**實際執行 Three.js 遊戲**的畫面（`tools/shots/scene_shot.py`，Playwright＋SwiftShader，**手機模擬，不是 iPhone 實機**）。
> 修改前＝網址加 `?nobldg`（不載入 Blender 正式模型，看到的是原本的程序化套件）；修改後＝一般網址。兩邊同一個鏡頭、同一個時段。
> 驗收狀態依 D38：`BLOCKOUT` → `MODEL_READY` → `INTEGRATED` → `FUNCTIONAL_VERIFIED` → `READY_FOR_ART_REVIEW` → `ART_APPROVED`（只有使用者能標）。

---

## 1. 兩點半 Café（外觀＋室內）

### 1.1 玩家會看到什麼不同

| | 修改前（程序化套件） | 修改後（Blender 正式模型） |
|---|---|---|
| 店面 | 一層薄木框＋一大片近乎透明的玻璃；玻璃後面是 3.4 m 深的「布景」：後牆是一張畫上去的書架與黑板貼圖 | 有厚度的深色木框店面：窗下木板（凸起線板）、窗台板、直櫺、橫楣與氣窗、雙開木門＋黃銅長門把；玻璃後面是**完整 12 m 深的店**，和走進去看到的是同一套東西 |
| 招牌 | 方塊招牌，字被拉寬（貼圖比例 4:1、招牌 11:1） | 深色木框招牌，字的比例正確（canvas 2048×192 配 6.6×0.62 m 板面）、右側小字營業時間；三盞鵝頸燈照招牌 |
| 雨遮、燈 | 一條木板雨遮、方塊壁燈 | 木板斜雨遮（底下有木條、黑鐵斜撐）、方形燈籠壁燈（黑鐵框＋暖色玻璃）兩大兩小 |
| 植物 | 方塊盆＋球形樹叢 | 橄欖樹、大葉植物、蕨類盆栽（陶盆、米色瓷盆、深灰盆）；壁柱腳的花台＋常春藤爬到招牌兩側、從雨遮垂下；窗台小盆栽 |
| 立牌 | 方塊黑板 | 木製 A 字立牌（兩面黑板、粉筆字＋手繪咖啡杯） |
| 二三樓 | 套件公寓（貼圖窗＋鐵窗貼圖） | 長條磁磚外牆（Poly Haven）、鋁窗＋窗簾＋窗內房間、外凸鐵窗（真的鐵條）與盆栽、浪板雨遮、冷氣室外機＋鐵架＋排水管、陽台（磁磚矮牆、鐵欄杆、盆栽、曬衣桿）、頂樓不鏽鋼水塔 |
| 夜晚 | 店內貼圖發光 | 店內是真的空間被燈照亮（吊燈、燈籠、招牌燈發光＋光暈），樓上兩戶亮燈 |
| 店內（`cafe` 區域） | 方塊吧檯、程序化桌椅、牆上一塊黑板 | 人字拼木地板、暖米色灰泥牆＋木護牆、木梁天花板；直條木紋吧檯（磨石檯面、咖啡機、磨豆機、檸檬塔甜點櫃、黃銅腳踏桿）、吧檯後層架與咖啡豆玻璃罐、黑板菜單、整面書牆、窗邊雙人桌＋曲木椅、店面玻璃內側的窗邊吧台與高腳椅、玻璃球吊燈、大盆栽；店面從裡面看是同一套木框玻璃門窗，**玻璃外是往溫州街看的街景**（白天／黃昏／夜晚三張） |

**沒有改的東西**：導航、碰撞、店門互動點、門口盆栽與立牌的導航阻擋、室內的 8 個座位（故事用的 `seats[0..7]`）、4 個雙人桌互動點、吧檯點餐 (−2.5,−3.2)、出口 (0,5.6)。溫州街與店內的導航格，正式模型版和 `?nobldg` 版**完全相同**（`tests/cafe_glb_integration.py` 比對）。

### 1.2 驗收狀態

| 項目 | 技術（A） | 功能（B） | 美術（C） |
|---|---|---|---|
| Café 外觀（`bldg.cafe_exterior`） | 完成 | 完成（`FUNCTIONAL_VERIFIED`，見 1.6；手機模擬） | `READY_FOR_ART_REVIEW`（等使用者看） |
| Café 室內（`bldg.cafe_interior`） | 完成 | 完成（`FUNCTIONAL_VERIFIED`，見 1.6；手機模擬） | `READY_FOR_ART_REVIEW`（等使用者看） |

### 1.3 參考與設計依據

- 參考圖：`docs/art-rebuild/references/04`（① 店面外觀白天、4 店內）、`05`、`07`（黃昏店門口：木框大玻璃、燈籠壁燈、爬藤、黑板立牌、窗內書架與吊燈）。沒有使用者提供的 Café 實景照片；溫州街的台北老公寓細節照 ART_DIRECTION 第 5 節。
- 尺寸照遊戲現有的建築（`TK.apartment` 寬 14、深 13、一樓 3.8 m、二三樓 3.2 m），門面朝西（D22：傍晚夕陽照在店門口）。
- **外觀與室內一致**（ART_DIRECTION 第 7 節）：`tools/blender/env_second/cafe_layout.py` 是唯一一份配置——店面零件、雙人桌（照故事的桌位）、吧檯、層架、書牆、窗邊吧台、吊燈。外觀從街上透過玻璃看到的店內，就是同一套東西搬過去（外觀座標 z＝室內座標 z−6）。室內右牆的兩扇窗，外觀右側牆同一個位置也有。

### 1.4 製作方式與材質

- 工具：Blender 5.2.2（`bpy`，無介面），腳本 `tools/blender/env_second/cafe_exterior.py`、`cafe_interior.py`、共用 `cafe_layout.py`、工具 `lib2.py`（建在 `tools/blender/b3lib.py` 上、不改它）。
- 材質：Poly Haven CC0（長條外牆磁磚、深褐壁柱磁磚、磨石子、細紋木、深色木、浪板、人字拼木地板、白灰泥、胡桃木），貼圖用照片量色校正成需要的顏色；葉片貼圖由 `gen_leaves.py` 程式產生（本作）。授權記在 `LICENSES.md` 的第二個 AI 小節。
- 中文字（招牌、立牌、黑板菜單）不放在 GLB：GLB 裡是空白板面（`SIGN_FACE`、`ABOARD_FACE_*`、`MENU_FACE`），遊戲用 canvas 畫，比例照板面。
- 夜間：材質名稱約定（`cafe_bulb`、`cafe_lampglass`、`cafe_sign_face`、`ext_glass_lit`）用 `TK.addNight`；店內材質用 `TK.bounce`（白天也有燈光感）；`GLOW_*` 空節點生成光暈。

### 1.5 GLB 規格

| 檔案 | 大小 | 三角形 | 網格／draw call | 材質 | 貼圖 |
|---|---|---|---|---|---|
| `assets/models/env/second_ai/cafe_exterior.glb` | 2.19 MB（目標 ≤ 2.5 MB；2026-10-10 溫州街第二輪減量後，原本 1.94 MB） | 27,096（畫出 33,796） | 37 個網格、約 41 次 draw call（原本 51／56；小零件合成 `cafe_vc_gloss`／`cafe_vc_matte`／`cafe_vc_metal`，見 2.5.1；6 組 instancing：鐵窗、雨遮、冷氣、桌、椅、高腳椅） | 30 | 27 張 WebP（512×512 ×13、256×256 ×13、色票 8×1）共 519 KB |
| `assets/models/env/second_ai/cafe_interior.glb` | 1.14 MB（目標 ≤ 2 MB） | 17,268（畫出 21,752） | 45 個網格、約 47 次 draw call（3 組 instancing） | 27 | 17 張 WebP（512×512 ×8、256×256 ×8、色票）共 197 KB |

（`python3 tools/blender/env_second/glb_specs.py <glb>` 產生。同材質零件已合併（`lib2.merge_by_material`）：外觀原本 90 個網格物件。）

### 1.6 測試結果

全部是 **Playwright＋SwiftShader 手機模擬（iPhone 390×844 直向、觸控），不是 iPhone 實機**。紀錄在 `docs/art-rebuild/second_ai/test_logs/`。

| 測試 | 結果 | 說明 |
|---|---|---|
| `tests/cafe_glb_integration.py`（第二個 AI 新寫） | **ALL PASS（62 項）** | 正式模型接上、套件外觀藏起來；招牌／立牌／菜單有 canvas 字；溫州街與店內的導航格和 `?nobldg` **完全相同**；店門互動點、8 個座位、4 個雙人桌、吧檯點餐、出口不變；牆面淡出；店面玻璃外的街景白天／夜晚換貼圖 |
| `tests/reachability_all.py --zones wenzhou,cafe` | **ALL PASS** | 兩個區域所有互動點都用引擎真正的移動走得到 |
| `tests/zone_transitions.py` | **ALL PASS（37 項）** | 所有區域切換，包括溫州街 ↔ Café |
| `tests/p0_movement.py` | **ALL PASS（34 項）** | 搖桿、點地移動（溫州街在內） |
| `tests/touch_flow_wenzhou.py` | **ALL PASS（21 項）** | 從標題畫面：觸控走到 Café、進門、對話、坐下、出門、存讀檔 |

**整合測試抓到的真實錯誤（已修）**：第一次跑 `cafe_glb_integration` 時，「吧檯後的層架」在某些鏡頭角度會被錯誤地當成淡出的牆藏起來——
`lib2.merge_by_material` 合併同材質物件時，牆面的方向屬性 `dir` 在原物件刪掉後變成亂碼（`[687033168,0,32]`）。修正後重建 GLB：
**舊 GLB 這一項失敗、新 GLB 通過**（TESTING.md 規則 3：測試要能在有 bug 的版本失敗）。另外加了自我檢查：故意把前牆的 `dir` 弄反，淡出檢查必須失敗。

**測試本身改過的地方（誠實列出）**：第一版測試有三項預期寫錯——座位順序（照 `twoTop` 的實際順序）、門口走道的檢查點（0,5.4）在 `?nobldg` 的原版也走不到（是 `room()` 的牆邊格子；改成 0,5.0）、
牆面淡出只等固定 1.5 秒（SwiftShader 每秒 1–4 格，可能一格都沒畫；改成等引擎再畫 6 格）。三項都是**兩個版本的遊戲資料完全相同**、測試寫錯，不是遊戲的錯；改完後新舊 GLB 的差別只剩上面那個真實錯誤。

**沒有測的**：iPhone 實機（效能、觸控手感）；Café 的完整故事事件（沈以安在 Café 的對話由 `touch_flow_wenzhou` 測到第一段，其他事件沒有逐一跑）。

### 1.7 遊戲內截圖（修改前｜修改後）

實際執行遊戲的畫面（`tools/shots/scene_shot.py`；清單 `tools/blender/env_second/shots/cafe_{before,after}.json`）。修改前＝`?nobldg`，修改後＝一般網址，同一個鏡頭、同一個時段。人物在店外的演出鏡頭藏起來；NPC 都藏起來（只看場景）。 **外觀的修改後截圖在 2026-10-10 溫州街第二輪減量（2.5.1：Café 外觀的小零件合成頂點色材質）之後重拍**；店內的沒有變（店內是另一個模型）。

| 鏡頭 | 修改前（程序化套件） | 修改後（Blender 正式模型） |
|---|---|---|
| 一般玩家鏡頭（手機直向）11:00 | ![修改前](shots/cafe_before_follow_portrait_1100.webp) | ![修改後](shots/cafe_after_follow_portrait_1100.webp) |
| 一般玩家鏡頭 17:30 | ![修改前](shots/cafe_before_follow_portrait_1730.webp) | ![修改後](shots/cafe_after_follow_portrait_1730.webp) |
| 一般玩家鏡頭 20:30 | ![修改前](shots/cafe_before_follow_portrait_2030.webp) | ![修改後](shots/cafe_after_follow_portrait_2030.webp) |
| 手機橫向 17:30 | ![修改前](shots/cafe_before_follow_landscape_1730.webp) | ![修改後](shots/cafe_after_follow_landscape_1730.webp) |
| 從路口南側走過來 17:30 | ![修改前](shots/cafe_before_approach_1730.webp) | ![修改後](shots/cafe_after_approach_1730.webp) |
| 對街斜看店面 11:00 | ![修改前](shots/cafe_before_street_1100.webp) | ![修改後](shots/cafe_after_street_1100.webp) |
| 對街斜看店面 17:30 | ![修改前](shots/cafe_before_street_1730.webp) | ![修改後](shots/cafe_after_street_1730.webp) |
| 對街斜看店面 20:30 | ![修改前](shots/cafe_before_street_2030.webp) | ![修改後](shots/cafe_after_street_2030.webp) |
| 店門口近景 17:30 | ![修改前](shots/cafe_before_close_1730.webp) | ![修改後](shots/cafe_after_close_1730.webp) |
| 店門口近景 20:30 | ![修改前](shots/cafe_before_close_2030.webp) | ![修改後](shots/cafe_after_close_2030.webp) |
| 店內：進門（手機直向）11:00 | ![修改前](shots/cafe_before_int_entry_1100.webp) | ![修改後](shots/cafe_after_int_entry_1100.webp) |
| 店內：進門 17:30 | ![修改前](shots/cafe_before_int_entry_1730.webp) | ![修改後](shots/cafe_after_int_entry_1730.webp) |
| 店內：進門 20:30 | ![修改前](shots/cafe_before_int_entry_2030.webp) | ![修改後](shots/cafe_after_int_entry_2030.webp) |
| 店內：往店門口看（玻璃外的街景）17:30 | ![修改前](shots/cafe_before_int_door_1730.webp) | ![修改後](shots/cafe_after_int_door_1730.webp) |
| 店內：坐在窗邊雙人桌 20:30 | ![修改前](shots/cafe_before_int_seat_2030.webp) | ![修改後](shots/cafe_after_int_seat_2030.webp) |
| 店內：吧檯點餐 11:00 | ![修改前](shots/cafe_before_int_bar_1100.webp) | ![修改後](shots/cafe_after_int_bar_1100.webp) |

### 1.7.1 整合示範：17:30 祐廷＋小安在 Café 門口（參考圖 07）

實際遊戲畫面（`tools/shots/scene_shot.py`，清單 `tools/blender/env_second/shots/cafe_demo_proposal.json`；人物是遊戲內的 VRM，站位用 scene_shot 的 companion）。給第一個 AI 做整合示範用的建議鏡頭。

| 寬景 | 雙人 |
|---|---|
| ![寬景](shots/cafe_demo_wide_1730.webp) | ![雙人](shots/cafe_demo_two_shot_1730.webp) |

### 1.8 還沒達到參考品質的地方（誠實列出）

1. **玻璃沒有反射**：遊戲沒有環境貼圖（envMap），玻璃只是淡淡的透明，看不到街景倒影；參考圖 07 的玻璃有反光。需要 AI-1 的 HDRI 環境反射（交接文件 C 項）。
2. **店內的光是「自發光」做的**：牆、地板整體均勻地亮，沒有吊燈下的光池、角落比較暗的層次；店內不投影。
3. **植物是葉片卡**：近看是平的（尤其大葉植物），常春藤偏稀疏、呈方塊感。
4. **店內往外看的街景是 2D 背景**：透視正確、白天／黃昏／夜晚會換，但建築細節簡單（沒有鐵窗、冷氣）。
5. **二三樓沒有真的室內**：窗內是窗簾＋深色房間盒。
6. **店門前的紅磚人行道、旁邊的腳踏車、電線桿**還是原本的程序化版本（屬於溫州街近景，下一項工作）。
7. **沒有附 Blender 渲染圖**：這個沙盒的 EEVEE 要用軟體 OpenGL，一張十幾分鐘還出不來；Cycles 低取樣可以跑（`tools/blender/env_second/render_cycles.py`），但和遊戲截圖同時跑會拖慢回歸測試，這次先不附。驗收以上面的遊戲內截圖為準（Blender 渲染成功不等於遊戲美術驗收完成）。
8. **沒有 iPhone 實機驗證**；手機效能只用 draw call 與三角形數估計，沒有實測 FPS。
9. 時段用 ART_DIRECTION 第 8 節的 11:00／17:30／20:30（交接文件寫 10:00，差一小時）。
10. 招牌、立牌、菜單的字用裝置上的字型畫（Noto Serif／Sans TC，沒有時用系統字型），不同手機字型會不一樣。

---

## 2. 溫州街近景（主巷公寓、日式宿舍、街道細節、小公園、機車）

### 2.1 玩家會看到什麼不同

| | 修改前（程序化套件） | 修改後（Blender 正式模型） |
|---|---|---|
| 主巷兩側 14 棟公寓 | 方盒＋貼圖窗（窗、鐵窗、冷氣都是畫上去的）；招牌字被拉寬（512×128 的字貼在 6.5×0.75 m 的招牌上） | 真的窗洞（鋁窗、窗簾、窗內房間；三成五的窗晚上亮燈）、外凸鐵窗（真的鐵條）與窗台盆栽、**約四分之一的鐵窗裡曬著衣服**（T 恤、毛巾、長褲、襯衫）、**每扇窗台下有往下流的雨痕**、浪板雨遮、冷氣室外機＋鐵架＋排水管、樓板線、女兒牆、頂樓不鏽鋼水塔或頂樓加蓋；外牆照每棟原本的種類與顏色（長條磁磚、小方塊馬賽克、水泥漆）；一樓：店面（木框或鋁框玻璃、店內景深卡、橫招牌、直立招牌、帆布雨遮）、住家（凸框造型鐵門、信箱、門燈、門口台階、小窗）、鐵捲門、騎樓（磁磚柱、天花板日光燈、地磚）；招牌字照板面比例畫，不再被拉寬 |
| 日式宿舍（A 側圍牆裡） | 木紋貼圖方盒、平的四坡屋頂、紙貼在牆上的窗 | 水泥基座（高架地板、鐵條通風口）、下見板（雨淋板）＋直條押緣、腰線以上白灰泥、木柱、木框玻璃拉窗（窗格；後面是紙拉門，有的半開，晚上紙拉門透出暖光）、寄棟黑瓦屋頂（瓦的波浪、屋簷一排瓦頭、隅棟、大棟、鬼瓦）、屋簷下的椽木、鐵皮雨水槽與落水管、玄關（切妻小屋頂、格子拉門、門燈、沓脫石）；後來加的窗型冷氣、浪板雨遮、電表箱 |
| 院牆 | 平的牆＋瓦頂方塊 | 有污漬的水泥粉刷牆、壁柱、牆腳、瓦頂、木門柱＋冠木＋門上的小屋頂；**藍底白字的門牌**（台北的門牌）、「私人住宅 請勿進入」告示、鐵信箱 |
| 電線桿 | 灰色圓柱＋方塊橫擔 | 錐形水泥桿、鍍鋅橫擔與斜撐、瓷礙子、腳踏釘、黃黑反光帶、貼在桿上的小廣告、白底黑字的桿號牌；路燈臂（往上翹的鋼管＋燈具，晚上燈罩亮）；第 3 根有柱上變壓器、第 5 根有藍底白字的路牌 |
| 反光鏡、路名牌、紅磚道 | 橘色圓柱＋平的圓；浮在空中的綠色牌子；canvas 畫的紅磚 | 凸面鏡（橘框、黑背板、遮雨罩）；灰色柱＋圓頂＋細框的綠底白字「溫州街 Wenzhou St.」；Poly Haven 紅磚（brick_pavement_04）＋水泥路緣 |
| 小公園 | 貼圖草地與鋪面、方塊樹圍座椅 | Poly Haven 草地（有落葉的台北公園草地）、方磚步道與圓形廣場、花崗石路緣、樹穴（石框＋土）、八角形樹圍座椅（每邊五條木條、鋼腳；座面高度和原本一樣）、綠柱黃桿的單槓、雙木柱的「溫州公園」名牌 |
| 機車（主巷約 37 台＋路口 6 台） | 擠出的側面輪廓方塊 | 兩款 125cc 速克達（現代款、復古款；不仿特定品牌）：車殼、座墊、前擋、前土除、龍頭罩、把手、後照鏡、頭燈、方向燈、尾燈、車牌、傳動箱、排氣管、中柱；每台顏色照原本的套件 |

**沒有改的東西**：導航格、鏡頭碰撞方塊、所有互動點（看櫥窗、看日式宿舍、坐在長椅／大樹下的圓椅、回公館、進 Café）和 `?nobldg` 版**完全相同**（`tests/wz_street_integration.py` 比對）；電線、路燈的光暈與地面光圈、玄關燈光暈、樹、灌木、石燈籠、踏石、長椅、盆栽、郵筒、腳踏車都是原本的。

### 2.2 驗收狀態

| 項目 | 技術（A） | 功能（B） | 美術（C） |
|---|---|---|---|
| 主巷公寓（`bldg.wenzhou_street`） | 完成 | （見 2.5） | `READY_FOR_ART_REVIEW`（等使用者看） |
| 日式宿舍＋院牆（`bldg.wz_jphouse`） | 完成 | （見 2.5） | `READY_FOR_ART_REVIEW` |
| 電線桿、反光鏡、路名牌、紅磚道（`bldg.wz_props`） | 完成 | （見 2.5） | `READY_FOR_ART_REVIEW` |
| 小公園（`bldg.wz_park`） | 完成 | （見 2.5） | `READY_FOR_ART_REVIEW` |
| 機車（`bldg.wz_scooter`，交接第三項的一部分，只用在溫州街） | 完成 | （見 2.5） | `READY_FOR_ART_REVIEW` |

### 2.3 製作方式

- 全部是 Blender 5.2 `bpy` 腳本（`tools/blender/env_second/wz_street.py`、`wz_jphouse.py`、`wz_props.py`、`wz_park.py`、`scooter.py`），配置照 `zones3d.js buildWenzhou` 的套件（位置、寬深、樓層、牆面種類、顏色、店名都照抄）；GLB 用溫州街的世界座標（機車是自己的座標）。
- **效能**：公寓的窗（每扇窗＝房間＋鋁框＋玻璃＋窗台）、鐵窗、雨遮、冷氣、水塔、盆栽、屋簷瓦頭、電線桿、反光鏡都用 `EXT_mesh_gpu_instancing`（三角形只存一次）；外牆每一種只有一個材質，每棟的顏色放在頂點色（同一種外牆整條巷子一次 draw call）；機車在遊戲裡是 `InstancedMesh`（39 台＝每款 3 次 draw call），車殼顏色用 `instanceColor`；招牌、門牌合成 atlas；只有大面投影（見 2.5 的效能）。
- 字不放在 GLB：招牌、直立招牌、店內景深卡、門牌、告示牌、桿號牌、路牌、公園名牌都是空白板面＋自訂屬性，遊戲用 canvas 畫，**比例照板面**。
- 貼圖：Poly Haven CC0（長條磁磚、馬賽克、水泥漆、磨石子、鐵捲門、騎樓地磚、雨淋板 dark_planks、有污漬的水泥 concrete_wall_006、紅磚 brick_pavement_04、草地 leafy_grass…）；**黑瓦與紙拉門是本作程式產生**（`gen_jp_textures.py`：Poly Haven 沒有日本瓦）。授權在 `LICENSES.md` 第二個 AI 小節。
- 套件物件都還在（導航、碰撞、互動、光暈照舊），正式模型載入後才把它們的外觀藏起來；載入失敗或 `?nobldg` 時和以前一模一樣。有正式模型時，被替換的套件物件不參加整區靜態合併（才藏得起來）；機車另外自己合併成一組。

### 2.4 GLB 規格

（`python3 tools/blender/env_second/glb_specs.py <glb>`）

| 檔案 | 大小 | 三角形 | 網格／draw call | 材質 | 貼圖 |
|---|---|---|---|---|---|
| `assets/models/env/second_ai/wenzhou_street.glb`（14 棟公寓） | 1.34 MB | 13,410（畫出 95,100） | 52 個網格（10 組 instancing：窗框、亮燈／沒亮燈窗內、鐵窗、雨遮、冷氣、水塔、盆栽 3 款；遊戲裡 16 面招牌合成 1 個網格）；**第二輪減量後** | 26 | 20 張 WebP 共 342 KB |
| `assets/models/env/second_ai/wz_jphouse.glb`（日式宿舍＋院牆） | 0.57 MB | 4,854（畫出 8,979） | 16 個網格、約 16 次 draw call（屋簷瓦頭 instancing） | 14 | 14 張 WebP 共 220 KB |
| `assets/models/env/second_ai/wz_props.glb`（電線桿 6、反光鏡 3、路名牌、紅磚道） | 0.28 MB | 1,876（畫出 7,532） | 17 個網格、約 23 次 draw call（3 組 instancing） | 8 | 5 張 WebP 共 112 KB |
| `assets/models/env/second_ai/wz_park.glb`（小公園） | 0.49 MB | 1,554 | 9 個網格、9 次 draw call | 9 | 7 張 WebP 共 389 KB |
| `assets/models/env/second_ai/scooter.glb`（機車兩款） | 0.15 MB | 3,052（現代款 1,388、復古款 1,664；遊戲裡 39 台用 InstancedMesh） | 一款 3 個材質（車殼＋頂點色的塑膠橡膠、頂點色的金屬）→ 6 個 InstancedMesh＋1 個影子貼片 | 3 | 無（車殼 instanceColor、其他頂點色） |

溫州街這五個加起來 2.8 MB（第二輪減量後；顏色放進頂點色多了約 0.2 MB；進溫州街時才下載；Café 外觀另外 2.19 MB）。每一個都在交接文件的目標內（外觀 ≤ 2.5 MB）。
**draw call 比原本多**：套件的公寓、電線桿等在整區合併後只有幾十次；正式模型的窗、招牌、店內景深卡各自是一次（招牌和景深卡每家店有自己的 canvas）。實際的 draw call 與三角形數在 2.5 的整合測試裡量（同一個鏡頭，修改前／後）。

### 2.5 測試結果

測試都是 **Playwright 手機模擬**（Chromium＋SwiftShader，iPhone 尺寸、觸控），**不是 iPhone 實機**。log 在 `docs/art-rebuild/second_ai/test_logs/street/`，測試寫出來的截圖在 `docs/art-rebuild/second_ai/test_shots/`。
跑法：`bash tools/blender/env_second/run_street_acceptance.sh <log 資料夾> all <網址>`（一次只跑一個瀏覽器）。

| 測試 | 測什麼 | 結果 |
|---|---|---|
| `tests/wz_street_integration.py`（新增） | 一般網址與 `?nobldg` 各載入一次溫州街：5 個正式模型都接上、被替換的套件外觀藏起來；**導航格、鏡頭碰撞方塊、互動點（位置、半徑、名稱）和 `?nobldg` 完全相同**；招牌合成 atlas（16 面一個網格、atlas 不超過 2048×1024），atlas 裡每一格的長寬比照板面（±8%，含故意拉寬的自我檢查）；入夜時亮燈的窗、招牌、燈罩、玄關燈、紙拉門會亮；樹幹透視的標記（水泥柱、電線桿）；12 個門牌／告示牌有字（每個 GLB 一張 atlas）；機車換成 InstancedMesh（台數相同、每台顏色照套件）；同一個鏡頭的 draw call／三角形 | 38 項 ALL PASS |
| `tests/cafe_glb_integration.py` | Café 外觀＋室內（溫州街改動後重跑，確定 Café 沒被影響） | 62 項 ALL PASS |
| `tests/cvs_glb_integration.py`（新增，見第 3 節） | 便利商店 | 38 項 ALL PASS |
| `tests/reachability_all.py --zones wenzhou,cafe,cvs` | 用引擎真正的移動模擬走到每一個互動點、劇情走路目的地、出入口到達點 | 3 個區域、19 個互動點全部走得到 |
| `tests/zone_transitions.py` | 全部區域的進出（含溫州街、Café、便利商店） | 37 項 ALL PASS |
| `tests/p0_movement.py` | 搖桿移動、各區域出生點（含溫州街、公館店門口） | 34 項 ALL PASS |
| `tests/touch_flow_wenzhou.py` | 觸控走到 Café 門口、互動按鈕不蓋住搖桿、NPC 都是正式模型 | 21 項 ALL PASS |
| `tests/see_through.py` | 樹幹透視的引擎行為（**這個測試在椰林大道測**；溫州街的電線桿、騎樓柱子有沒有標記透視，由 `wz_street_integration` 檢查） | 11 項 ALL PASS |

**效能**：

量法：`tests/wz_street_integration.py` 在同一個鏡頭讀 `renderer.info`（**含陰影那一輪**；量的時候把路人暫時移出場景，只比場景本身——路人每次的位置不同，會讓數字飄 ±30 次）。SwiftShader 的 FPS 不準，所以不報 FPS。

| 鏡頭 | 修改前（`?nobldg`） | 第一版（全部投影、機車 10 個材質） | 減量後（交付版） | 和修改前比 |
|---|---|---|---|---|
| 巷子往東 | 219 次／25.2 萬 | 約 485 次／57.6 萬（含路人） | **322 次／35.6 萬** | +47%／+41% |
| 巷子往西 | 188 次／24.8 萬 | 約 492 次／63.2 萬（含路人） | **286 次／32.9 萬** | +52%／+33% |
| 騎樓 | 224 次／25.2 萬 | 約 515 次／60.8 萬（含路人） | **329 次／35.6 萬** | +47%／+41% |

減量做了什麼（畫面上幾乎看不出差別）：
1. **只有大面投影**：陰影貼圖一格約 4 cm（1024² 蓋 44 m），窗框、鐵窗、冷氣、盆栽、招牌、門把這些小零件的影子本來就看不出來，卻要在陰影那一輪整組再畫一次。現在只有「不是 instancing、平均三角形面積 > 0.1 m²、最高點離地 0.35 m 以上」的網格投影（牆、屋頂、雨遮、鐵捲門、騎樓天花板…）；店內、窗內房間、窗簾、紙拉門、玻璃、燈泡、葉子、貼地的鋪面都不投影。
2. **機車**：零件顏色改成頂點色（一款 3 個材質，原本約 10 個）、減面（每台 1.4k–1.7k 個三角形）；機車不進陰影那一輪，改成每台車底下一片柔和的影子貼片（全部一個 InstancedMesh）。
3. **招牌、門牌合成 atlas**：16 面招牌（橫、直立）一張 2048×1024 貼圖、一個網格（直的招牌轉 90° 排；字牌高度縮 6%，看不出差別）；門牌、告示牌、桿號牌、路牌每個 GLB 一張（原本 29 面各自一次 draw call）。店內景深卡（8 面）還是各自的網格（貼圖要重複，不能放進 atlas）。

**還沒達到 LAWWW 訂的目標（draw call ≤ 原本 +30%）**：三角形在目標內（≤ 42 萬），draw call 還是比修改前多 47–52%（286–329 次；LAWWW 的目標是 +30%，約 310 次：巷子往西 286 次在目標內，另外兩個鏡頭多 12–19 次）。剩下的主要是：正式模型每一種材質一次 draw call（公寓約 40 種、Café 外觀約 45 種，含窗內看得到的店內）、窗的 instancing 原型（不同尺寸、亮燈與否各一組）、玩家本人（VRM，約 60 次，修改前後都有）。再降的做法（還沒做，等 LAWWW 決定要不要現在做）：在 Blender 把門、雨遮、窗框、小五金這些純色材質改成頂點色合併（公寓約 −10、Café 約 −15）；窗統一一個原型、用縮放（約 −10）；遠處的公寓用簡化版（LOD）。

### 2.5.1 第二輪減量（2026-10-10 19:35Z 量；LAWWW 18:54Z：同一鏡頭 ≤ 約 310 次 draw call）

量法同上（`tests/wz_street_integration.py`，同一個鏡頭、含陰影那一輪、藏起路人、含玩家）。

| 鏡頭 | 修改前（`?nobldg`） | 第一次交付（`e2ae4d6`） | 第二輪減量後 | 和修改前比 |
|---|---|---|---|---|
| 巷子往東 | 219 次／25.2 萬 | 322 次／35.6 萬 | **277 次／36.1 萬** | +26%／+43% |
| 巷子往西 | 188 次／24.8 萬 | 286 次／32.9 萬 | **239 次／33.4 萬** | +27%／+35% |
| 騎樓 | 224 次／25.2 萬 | 329 次／35.6 萬 | **283 次／36.1 萬** | +26%／+43% |

做了什麼（都在 Blender 腳本裡，遊戲端只改投影規則）：
1. **純色零件改成頂點色**（`lib2.vc_consolidate`）：門、雨遮、鋁框、木框、鐵件、黃銅把手、鐵窗欄杆、排水管、屋頂板、騎樓天花板、窗簾、信箱、冷氣、水塔、曬的衣服——原本每一種顏色一個材質、整條巷子各一次 draw call（會投影的再加陰影一次），現在合成兩個材質：`wz_vc_matte`（霧面）、`wz_vc_metal`（金屬）；顏色放在頂點色，金屬度不同的照漫射補償（顏色看起來一樣）。日式宿舍、電線桿／反光鏡／路名牌、小公園也一樣；Café 外觀的小零件（盆栽、瓷杯、檯面、黃銅、鐵件、鋁框、窗簾…）合成 `cafe_vc_gloss`／`cafe_vc_matte`／`cafe_vc_metal` 三個（Café 的這些零件本來就不投影，現在也不投影）。
2. **窗戶共用原型**：原本「每種寬度 × 亮燈與否」各一個原型、每個 5 個材質（20 次 draw call）；現在窗框＋窗台＋雨痕是一個原型（116 扇共用，3 次），窗內房間＋玻璃分亮燈（52 扇）／沒亮燈（64 扇）兩個原型（各 2 次）。比較窄的窗用 x 方向縮放（2.2 m → 最窄 1.85 m，鋁框粗細差不到 1 cm）。
3. **曬的衣服**不用 instancing（三款各一次 draw call），直接合進 `wz_vc_matte`。
4. **投影**：`wz_vc_*` 合併的網格整個投影（原本門、雨遮、屋頂板、鋁框這些就會投影；現在黃銅把手、窗簾、排水管、曬的衣服也投影，影子很小；陰影那一輪一次 draw call）；小公園樹圍的土（貼地）、Café 的小零件照舊不投影。

Blender 渲染比對（同一個鏡頭、同樣的燈光；左＝減量前的模型、右＝減量後）：平均每個像素差 1.7／255（渲染雜訊與粗糙度的差別），顏色一樣。

| 減量前 | 減量後（頂點色合併） |
|---|---|
| ![](blender_renders/wz_lane_east.webp) | ![](blender_renders/wz_lane_east_vc.webp) |

畫面差異：顏色一樣；粗糙度、金屬度變成兩組（霧面 0.85、金屬 0.45／0.35），雨遮、鐵門、鋁框的反光略有不同。截圖見 2.6（修改後是第二輪減量之後重拍的）。

**測試（第二輪減量後整套重跑，Playwright 手機模擬，不是實機；log 在 `docs/art-rebuild/second_ai/test_logs/street_perf2/`）**：`wz_street_integration` 42 項（加了 4 項：純色零件都已合併、合併網格的投影規則、窗戶共用原型、**三個鏡頭 draw call ≤ 310／三角形 ≤ 42 萬**）、`cafe_glb_integration` 62、`cvs_glb_integration` 39、`reachability_all --zones wenzhou,cafe,cvs` 14、`zone_transitions` 37、`p0_movement` 34、`touch_flow_wenzhou` 21、`see_through` 11，**全部 ALL PASS**。修改後截圖（2.6 的溫州街、第 3 節的便利商店、第 1 節的 Café 外觀）是減量之後重拍的。

**LOD（遠處公寓簡化）沒有做**：正式模型是「整條巷子同一個材質一個網格」，遠近都在同一個網格裡，LOD 不會少 draw call；三角形已經在目標內（≤ 42 萬）。

### 2.6 遊戲內截圖（修改前｜修改後）

實際遊戲畫面（`tools/blender/env_second/shots/fast_shots.py`：和 `tools/shots/scene_shot.py` 同一種清單格式，只是同一種畫面大小只載入一次遊戲；清單 `tools/blender/env_second/shots/street_{before,after}.json`）。修改前＝`?nobldg`，修改後＝一般網址，同一個鏡頭、同一個時段；演出鏡頭時人物與 NPC 藏起來。 **修改後的截圖是遠景公寓（第 5 節）做完之後重拍的**（含第二輪減量）。

| 鏡頭 | 修改前（程序化套件） | 修改後（Blender 正式模型） |
|---|---|---|
| 巷子中段往東（Café）11:00 | ![修改前](shots/street_before_lane_east_1100.webp) | ![修改後](shots/street_after_lane_east_1100.webp) |
| 巷子中段往東 17:30 | ![修改前](shots/street_before_lane_east_1730.webp) | ![修改後](shots/street_after_lane_east_1730.webp) |
| 巷子中段往東 20:30 | ![修改前](shots/street_before_lane_east_2030.webp) | ![修改後](shots/street_after_lane_east_2030.webp) |
| 巷子中段往西 17:30 | ![修改前](shots/street_before_lane_west_1730.webp) | ![修改後](shots/street_after_lane_west_1730.webp) |
| 巷子中段往西 20:30 | ![修改前](shots/street_before_lane_west_2030.webp) | ![修改後](shots/street_after_lane_west_2030.webp) |
| 騎樓（巷口茶飲）17:30 | ![修改前](shots/street_before_arcade_1730.webp) | ![修改後](shots/street_after_arcade_1730.webp) |
| A 側店面（書店、電線桿）11:00 | ![修改前](shots/street_before_shops_a_1100.webp) | ![修改後](shots/street_after_shops_a_1100.webp) |
| Café 南側轉角 20:30 | ![修改前](shots/street_before_corner_2030.webp) | ![修改後](shots/street_after_corner_2030.webp) |
| 日式宿舍正面 17:30 | ![修改前](shots/street_before_jp_front_1730.webp) | ![修改後](shots/street_after_jp_front_1730.webp) |
| 日式宿舍正面 20:30 | ![修改前](shots/street_before_jp_front_2030.webp) | ![修改後](shots/street_after_jp_front_2030.webp) |
| 日式宿舍斜看 11:00 | ![修改前](shots/street_before_jp_oblique_1100.webp) | ![修改後](shots/street_after_jp_oblique_1100.webp) |
| 小公園 11:00 | ![修改前](shots/street_before_park_1100.webp) | ![修改後](shots/street_after_park_1100.webp) |
| 小公園 17:30 | ![修改前](shots/street_before_park_1730.webp) | ![修改後](shots/street_after_park_1730.webp) |
| 機車近景 11:00 | ![修改前](shots/street_before_scooters_1100.webp) | ![修改後](shots/street_after_scooters_1100.webp) |
| 一般玩家鏡頭（手機直向）11:00 | ![修改前](shots/street_before_follow_east_1100.webp) | ![修改後](shots/street_after_follow_east_1100.webp) |
| 一般玩家鏡頭 17:30 | ![修改前](shots/street_before_follow_east_1730.webp) | ![修改後](shots/street_after_follow_east_1730.webp) |
| 一般玩家鏡頭 20:30 | ![修改前](shots/street_before_follow_east_2030.webp) | ![修改後](shots/street_after_follow_east_2030.webp) |

### 2.6.1 Blender 渲染圖（模型本身，不是遊戲畫面）

`tools/blender/env_second/render_cycles.py`（Cycles、CPU、24 samples＋降噪；四個 GLB 一起載入，世界座標相同；灰色地面是渲染時加的，遊戲裡的柏油路、人行道是套件）。**招牌、門牌的字在遊戲裡用 canvas 畫，所以渲染圖裡是空白板面**；窗內亮燈、路燈要遊戲的夜間設定，渲染圖只有白天。

| 巷子中段往東 | 騎樓 |
|---|---|
| ![](blender_renders/wz_lane_east.webp) | ![](blender_renders/wz_arcade.webp) |
| 日式宿舍正面 | 小公園 |
| ![](blender_renders/wz_jp_front.webp) | ![](blender_renders/wz_park.webp) |

### 2.7 還沒達到參考品質的地方（誠實列出）

1. **生活痕跡還不夠**：有了鐵窗裡曬的衣服、窗台下的雨痕，但還沒有門口的鞋櫃與雜物、招牌燈箱的污漬、牆面整片的老舊斑駁；雨痕每扇窗都一樣（共用一個模型）。
2. **公寓的窗內房間是暗盒＋窗簾**，亮燈的窗只是整面發光，沒有室內的家具剪影。
3. **一樓店面的店內是一張景深卡**（原本套件的 canvas 畫，依板面寬度重複），近看是平的；「看櫥窗」的互動沒有變。
4. **日式宿舍的瓦是貼圖＋法線**（屋簷一排瓦頭是真的幾何），斜看屋面時還是平的；屋頂沒有青苔、落葉。
5. **電線還是原本套件的線**（位置對得上礙子），沒有下垂的細節、沒有電纜箱。
6. **機車兩款都是同一個比例**，沒有安全帽、車廂置物、雨衣；車牌沒有字。為了效能減面後（每台 1.4k–1.7k 個三角形），**近看車殼的弧面有稜角**；影子是貼地的柔和貼片，不是真的投影。
7. **沒有 iPhone 實機驗證**：效能只用 draw call 與三角形數估計（見 2.4、2.5 的量測），沒有實測 FPS。
8. **效能**：第二輪減量後同一個鏡頭 277／239／283 次 draw call（LAWWW 的目標 ≤ 約 310，見 2.5.1），比修改前（套件整區合併）還是多 26–27%。材質合併後粗糙度、金屬度只剩兩組（霧面、金屬），雨遮、鐵門、鋁框的反光和原本略有不同。
9. 遠景（巷底、北邊、路口南邊的遠景公寓、`detail:false` 的那些）**還是套件**；這次只換近景。Café 往南看，路的盡頭是施工護欄（LAWWW 建議延伸成遠景街道，排在下一批）。

---

## 3. 全日便利商店（`cvs` 室內）

### 3.1 玩家會看到什麼不同

| | 修改前（程序化） | 修改後（Blender 正式模型） |
|---|---|---|
| 空間 | 灰白方盒房間、礦纖天花板、牆上兩扇假窗 | 白色大地磚、白牆＋上緣青綠／琥珀色帶（和溫州街「日日便利」招牌同一套顏色，不仿特定品牌）、深灰踢腳板、明亮的天花板＋十排 LED 燈條 |
| 貨架 | 一塊塊白色方塊，正面貼一張商品圖 | 白色金屬貨架（底座、背板、層板、價格條＋黃色價格標籤），每層排滿商品（盒子、瓶子、罐子；顏色各不同，放在頂點色：所有商品一次 draw call）；兩排雙面貨架＋端架促銷堆疊 |
| 飲料櫃 | 淺藍方塊＋發光平面 | 不鏽鋼框、五扇玻璃門＋門把、櫃內打光背板、五層飲料瓶 |
| 櫃檯 | 白色方塊 | 白色櫃身＋青綠色帶、石材檯面、兩台收銀機、關東煮鍋（有料）、茶葉蛋鍋、包子蒸櫃；櫃檯後面是香菸櫃（黑框、打光的背板、玻璃門，菸盒排在裡面）＋兩台咖啡機；後牆中間是促銷看板（「咖啡第二杯半價・集點換好禮」，canvas 字）＋海報 |
| 店面 | 兩扇假窗 | 兩扇大玻璃窗（窗外是遊戲原本的窗景，跟著時段換）、玻璃自動門（門頂箱、門上的貼紙帶）、門口地墊；門外也放了一片窗景 |
| 分類牌 | 沒有 | 吊在走道上的「零食・餅乾」「泡麵・調味」「麵包・飯糰」「冷藏飲料」（canvas 字） |

**沒有改的東西**：導航格（貨架、雙面貨架、櫃檯、飲料櫃的阻擋照套件）、結帳 (3.2,−0.6)、離開 (0,4.2)、出生點；沒有加新的障礙物。

### 3.2 驗收狀態

| 項目 | 技術（A） | 功能（B） | 美術（C） |
|---|---|---|---|
| 便利商店室內（`bldg.cvs_interior`） | 完成 | （見 3.5） | `READY_FOR_ART_REVIEW`（等使用者看） |

### 3.3 GLB 規格

| 檔案 | 大小 | 三角形 | 網格／draw call | 材質 | 貼圖 |
|---|---|---|---|---|---|
| `assets/models/env/second_ai/cvs_interior.glb` | 1.35 MB（1,411,160 bytes；目標 ≤ 2 MB） | 17,220 | 47 個網格、約 47 次 draw call（所有商品一個網格，顏色在頂點色） | 23 | 3 張 WebP 共 100 KB |

第一版有 4.2 MB、5.4 萬個三角形（每個商品六面、前後兩排）；改成只做看得到的四面、只排最前面一排後是現在的大小。

### 3.4 測試結果

Playwright 手機模擬（不是 iPhone 實機）；和溫州街同一批跑（log 在 `docs/art-rebuild/second_ai/test_logs/street/`）。

| 測試 | 測什麼 | 結果 |
|---|---|---|
| `tests/cvs_glb_integration.py`（新增） | 一般網址與 `?nobldg`：正式模型接上、程序化備用模型藏起來；會淡出的牆有四面；鏡頭在前牆外時前牆淡出、後牆不淡出（含故意把前牆方向弄反、檢查必須失敗的自我檢查）；**導航格和 `?nobldg` 完全相同**；貨架、雙面貨架、櫃檯、飲料櫃擋住，出生點、結帳、走道走得到；結帳 (3.2,−0.6)、離開 (0,4.2) 不變；走道分類牌 8 面有 canvas 字；LED 燈條、飲料櫃背光、商品的頂點色自發光；自動門外的窗景和窗戶同一個材質（跟著時段換）；**自動門玻璃保持透明**（2026-10-10 19:00Z 補的檢查，見 4.7） | 38 項 ALL PASS（`e2ae4d6`）→ 加上玻璃檢查 39 項：**沒修的版本 FAIL、修好的版本 ALL PASS** |
| `tests/reachability_all.py --zones wenzhou,cafe,cvs` | 結帳、離開走得到（引擎真正的移動模擬） | ALL PASS |
| `tests/zone_transitions.py`、`tests/p0_movement.py` | 進出便利商店、公館便利商店門口的搖桿移動 | ALL PASS |

效能：便利商店是室內小區域，正式模型約 47 次 draw call、1.7 萬個三角形（室內不投影）。


### 3.5 遊戲內截圖（修改前｜修改後）

（清單 `tools/blender/env_second/shots/cvs_{before,after}.json`。）**修改後的 6 張在玻璃修正之後重拍**（4.7：`e2ae4d6` 的自動門玻璃在鏡頭進到店裡時會變成不透明的灰板；`e2ae4d6` 交付時的進門截圖鏡頭在門外、剛好淡出，所以當時沒看出來）。

| 鏡頭 | 修改前（程序化套件） | 修改後（Blender 正式模型） |
|---|---|---|
| 進門（手機直向）11:00 | ![修改前](shots/cvs_before_entry_1100.webp) | ![修改後](shots/cvs_after_entry_1100.webp) |
| 進門 17:30 | ![修改前](shots/cvs_before_entry_1730.webp) | ![修改後](shots/cvs_after_entry_1730.webp) |
| 進門 20:30 | ![修改前](shots/cvs_before_entry_2030.webp) | ![修改後](shots/cvs_after_entry_2030.webp) |
| 走道 11:00 | ![修改前](shots/cvs_before_aisle_1100.webp) | ![修改後](shots/cvs_after_aisle_1100.webp) |
| 櫃檯 17:30 | ![修改前](shots/cvs_before_counter_1730.webp) | ![修改後](shots/cvs_after_counter_1730.webp) |
| 飲料櫃 20:30 | ![修改前](shots/cvs_before_cooler_2030.webp) | ![修改後](shots/cvs_after_cooler_2030.webp) |

### 3.5.1 Blender 渲染圖（模型本身）

Cycles、三盞點光代替遊戲的燈（遊戲裡是自發光的燈條＋天花板光）；走道牌、促銷看板的字在遊戲裡用 canvas 畫，渲染圖裡是空白。

| 走道 | 櫃檯 |
|---|---|
| ![](blender_renders/cvs_aisle.webp) | ![](blender_renders/cvs_counter.webp) |

### 3.6 還沒達到參考品質的地方

1. **商品是色塊**：盒子、瓶子、罐子的形狀和顏色有變化，但沒有包裝上的字和圖案（近看是素色）。
2. **沒有店員**（櫃檯後面空的）；收銀機螢幕沒有畫面。
3. **店內的光是「自發光＋一盞點光」**，沒有貨架的陰影、地板沒有燈條的反光。
4. 沒有 ATM、影印機、座位區（套件原本也沒有；要加就會改導航，這次不動）。

---

## 4. 阿鳳麵店、舊路書房、宿舍房間（`noodle`、`bookstore`、`dorm` 室內）

### 4.1 玩家會看到什麼不同

| | 修改前（程序化） | 修改後（Blender 正式模型） |
|---|---|---|
| 麵店 | 方盒房間、灰色方塊煮麵台＋一個圓柱鍋、程序化桌椅、牆上一塊價目字 | 牆的下半白色小方磚＋紅色收邊、上半奶油色；磨石子地板；不鏽鋼煮麵台（櫃門、煮麵爐＋三支麵杓、湯鍋、滷味玻璃櫃與小菜、碗堆、調味罐）；白色美耐板桌＋紅色鐵椅（座面高度照原本）、每桌辣椒罐／醬油／醋／筷筒／面紙盒、桌上的乾麵與餛飩湯；價目板（白底深咖啡字）、一排紅紙菜單（直式黑字：陽春麵、餛飩麵、炸醬麵…）、牆上的電扇、角落的電視、日光燈管；店面玻璃窗與門 |
| 書店 | 方盒房間、書架是方塊＋書的貼圖（右牆和右邊那排的書朝錯邊） | 深色木書架塞滿書（書背顏色、高矮、厚薄都不同，偶爾一疊平放、一個空隙；頂點色，一次 draw call），兩側牆的書都朝店內、中間兩排是雙面；木地板、灰泥牆、木梁天花板、暖色燈罩吊燈；櫃台桌（一疊疊書、舊收銀機、黃銅檯燈、牛皮紙袋）；手寫牌「二手書・法律・人文」、門邊的老海報；店面玻璃窗與門 |
| 宿舍（玩家每天起床的地方） | 礦纖天花板的方盒房間、木色方塊床、方塊書桌＋程序化椅子、書櫃是一片書的貼圖、牆上兩扇假窗 | 米白粉光牆＋深灰踢腳板、米色磨石子地板、兩組雙管日光燈（格柵）、偵煙器；**分離式冷氣**（冷媒管蓋板）、**鋁框推拉窗＋紗窗＋石材窗台＋收起來的波浪窗簾**（窗外是遊戲原本的窗景，跟著時段換）、木門（門板凸框、壓把、門下通風百葉、門檔）、電燈開關；木床（床柱、床頭板、床尾板）＋圓角床墊、藍色被子（床尾摺一段）、枕頭、床下收納箱；**書架**（兩片直隔板、五層層板，塞滿高矮厚薄不同的書、紅色六法、藍白講義夾、盆栽、相框、紙箱）；**我的書桌**（三抽屜櫃、筆電開著、檯燈、一疊書、攤開的筆記本、馬克杯、筆筒、手機）；**室友的書桌**（兩台螢幕、鍵盤、滑鼠、掛著的耳機、零食、飲料）；兩張辦公椅（五爪腳、氣壓桿、網背、扶手；座面高度和原本一樣）；門邊的掛勾（毛巾、帆布袋）。牆上的月曆、床頭的「法律服務社」傳單是遊戲原本的內容，照舊掛著 |

**沒有改的東西**：導航格（家具的阻擋照套件）、麵店的 6 個座位與「坐下吃麵」、書店的「看看法律書與文具」、宿舍的「坐在書桌前」「睡覺」、三間的出口與出生點；沒有加新的障礙物（宿舍沒有加衣櫃：走得到的地方不放家具，掛在牆上的不佔地）。

### 4.2 驗收狀態

| 項目 | 技術（A） | 功能（B） | 美術（C） |
|---|---|---|---|
| 阿鳳麵店（`bldg.noodle_interior`） | 完成 | （見 4.4） | `READY_FOR_ART_REVIEW` |
| 舊路書房（`bldg.bookstore_interior`） | 完成 | （見 4.4） | `READY_FOR_ART_REVIEW` |
| 宿舍房間（`bldg.dorm_interior`） | 完成 | （見 4.4） | `READY_FOR_ART_REVIEW` |

### 4.3 GLB 規格

| 檔案 | 大小 | 三角形 | 網格／draw call | 材質 | 貼圖 |
|---|---|---|---|---|---|
| `assets/models/env/second_ai/noodle_interior.glb` | 0.42 MB | 6,008 | 47 個網格、約 47 次 draw call | 24 | 5 張 WebP 共 127 KB |
| `assets/models/env/second_ai/bookstore_interior.glb` | 1.33 MB | 17,992 | 21 個網格、約 21 次 draw call（所有書一個網格） | 15 | 5 張 WebP 共 29 KB |
| `assets/models/env/second_ai/dorm_interior.glb` | 0.65 MB | 8,144 | 38 個網格、約 38 次 draw call（書與雜物一個網格，顏色在頂點色） | 28 | 8 張 WebP 共 155 KB |

### 4.4 測試結果

Playwright 手機模擬（不是 iPhone 實機）。log 在 `docs/art-rebuild/second_ai/test_logs/interiors/`。跑法：`bash tools/blender/env_second/run_interiors_acceptance.sh <log 資料夾> all <網址> noodle,bookstore,dorm`。
**下面的結果都是玻璃修正（4.7）之後重跑的**（修正前也全部跑過一次，結果相同、整合測試當時 98 項；修正前的 log 在 `test_logs/interiors/before_glass_fix/`，整合測試那一份被修正後的結果蓋掉了）。

| 測試 | 測什麼 | 結果 |
|---|---|---|
| `tests/interior_glb_integration.py`（新增） | 三間各比較一般網址與 `?nobldg`：正式模型接上、程序化備用模型藏起來；會淡出的牆有四面；鏡頭在前牆外時前牆淡出、後牆不淡出（含故意弄反方向、檢查必須失敗的自我檢查）；**導航格和 `?nobldg` 完全相同**；家具擋住、走道走得到；互動點（名稱、位置）與麵店的 6 個座位不變；牌子都有 canvas 字；店面自動門外的窗景和窗戶同一個材質；**宿舍的月曆、社團傳單在正式模型載入後還看得到、貼在牆前**；**玻璃、紗窗保持透明**（見 4.7） | 101 項 ALL PASS（加上玻璃檢查之後重跑） |
| `tests/reachability_all.py --zones noodle,bookstore,dorm` | 坐下吃麵、看書、坐在書桌前、睡覺、離開，都走得到（引擎真正的移動模擬） | ALL PASS |
| `tests/zone_transitions.py` | 全部區域的進出 | ALL PASS |
| `tests/movement_regression.py A`（宿舍：搖桿前進、轉向、走／跑、撞牆、沿牆滑、離開牆） | **改之前**（交接文件要求）在沒改過的版本跑兩次：6/7（A4 失敗）、6/7（A5 失敗）——同一個房間兩次失敗在不同步驟，是模擬器速度造成的不穩定（人物上一步停在哪裡會影響下一步）；**改之後**：7/7 PASS | 改後 7/7 PASS |
| `tests/p0_movement.py` | 搖桿移動、各區域出生點 | 34 項 ALL PASS |


### 4.5 遊戲內截圖（修改前｜修改後）

實際遊戲畫面（`tools/blender/env_second/shots/fast_shots.py`；清單 `tools/blender/env_second/shots/interiors_{before,after}.json`）。修改前＝`?nobldg`，修改後＝一般網址，同一個鏡頭、同一個時段；演出鏡頭時玩家藏起來。修改後的 13 張是**玻璃修正（4.7）之後重拍**的。
麵店座位那張的客人是遊戲原本坐在店裡的 NPC（前後兩張都有；截圖工具的「藏 NPC」沒有效果——引擎每一格會把 NPC 設回看得見，所以前後兩張都照實拍進去）。

| 鏡頭 | 修改前（程序化） | 修改後（Blender 正式模型） |
|---|---|---|
| 麵店：進門（手機直向）11:00 | ![修改前](shots/interiors_before_noodle_entry_1100.webp) | ![修改後](shots/interiors_after_noodle_entry_1100.webp) |
| 麵店：進門 17:30 | ![修改前](shots/interiors_before_noodle_entry_1730.webp) | ![修改後](shots/interiors_after_noodle_entry_1730.webp) |
| 麵店：煮麵台 17:30 | ![修改前](shots/interiors_before_noodle_counter_1730.webp) | ![修改後](shots/interiors_after_noodle_counter_1730.webp) |
| 麵店：座位 20:30 | ![修改前](shots/interiors_before_noodle_seat_2030.webp) | ![修改後](shots/interiors_after_noodle_seat_2030.webp) |
| 書店：進門（手機直向）11:00 | ![修改前](shots/interiors_before_bookstore_entry_1100.webp) | ![修改後](shots/interiors_after_bookstore_entry_1100.webp) |
| 書店：進門 17:30 | ![修改前](shots/interiors_before_bookstore_entry_1730.webp) | ![修改後](shots/interiors_after_bookstore_entry_1730.webp) |
| 書店：左邊走道 17:30 | ![修改前](shots/interiors_before_bookstore_aisle_1730.webp) | ![修改後](shots/interiors_after_bookstore_aisle_1730.webp) |
| 書店：櫃台（從門口左邊看）20:30 | ![修改前](shots/interiors_before_bookstore_counter_2030.webp) | ![修改後](shots/interiors_after_bookstore_counter_2030.webp) |
| 宿舍：進門（手機直向）11:00 | ![修改前](shots/interiors_before_dorm_entry_1100.webp) | ![修改後](shots/interiors_after_dorm_entry_1100.webp) |
| 宿舍：進門 17:30 | ![修改前](shots/interiors_before_dorm_entry_1730.webp) | ![修改後](shots/interiors_after_dorm_entry_1730.webp) |
| 宿舍：進門 20:30 | ![修改前](shots/interiors_before_dorm_entry_2030.webp) | ![修改後](shots/interiors_after_dorm_entry_2030.webp) |
| 宿舍：床與書架 17:30 | ![修改前](shots/interiors_before_dorm_bed_1730.webp) | ![修改後](shots/interiors_after_dorm_bed_1730.webp) |
| 宿舍：我的書桌 20:30 | ![修改前](shots/interiors_before_dorm_desk_2030.webp) | ![修改後](shots/interiors_after_dorm_desk_2030.webp) |


### 4.5.1 Blender 渲染圖（模型本身，不是遊戲畫面）

Cycles、點光代替遊戲的燈（遊戲裡是自發光的日光燈管＋天花板光）；牌子上的字（麵店的紅紙菜單與價目板、書店的手寫牌）在遊戲裡用 canvas 畫，渲染圖裡是空白。宿舍窗外的景在遊戲裡是時段貼圖，渲染圖裡是天空。

| 麵店：煮麵台 | 麵店：座位 |
|---|---|
| ![](blender_renders/noodle_counter.webp) | ![](blender_renders/noodle_seat.webp) |

| 書店：左邊走道 | 書店：櫃台（從門口左邊看） |
|---|---|
| ![](blender_renders/bookstore_aisle.webp) | ![](blender_renders/bookstore_counter.webp) |

| 宿舍：床與書架 | 宿舍：我的書桌 |
|---|---|
| ![](blender_renders/dorm_bed.webp) | ![](blender_renders/dorm_desk.webp) |

### 4.6 還沒達到參考品質的地方

1. **書背、菜單以外沒有字**：書背是色塊（沒有書名）；麵店的紅紙菜單和價目板有字，其他海報是色塊。
2. **沒有店員、沒有客人**（遊戲原本的 NPC 照舊）；麵店沒有蒸氣、書店沒有灰塵光束。
3. **店內的光是「自發光＋一盞點光」**，沒有燈罩下的光池。
4. 麵店的煮麵台是「照套件的位置」放在後牆前；真實的台北麵店常把煮麵台放在店門口（面向街），要改就得改導航，這次不動。
5. **宿舍是「床在地上」的雙人房**（照原本的配置）；台大宿舍常見的是上床下桌的四人房，要改就得改導航與睡覺的位置，這次不動。沒有衣櫃（原本的配置裡走得到的地方不能放）。
6. 宿舍的被子、枕頭是圓角方塊＋一點起伏，沒有布料皺褶；書背沒有書名。
7. 夜間（20:30）的麵店是偏白的日光燈色，比程序化版本的暖黃色冷（台灣麵店常見日光燈，但畫面比較平）；店內沒有局部的暖色光。

### 4.7 驗收時發現並修好的 bug：玻璃變成灰板（也影響第 3 節的便利商店）

- **原本錯在哪**：`src/zones3d.js` 的 `attachRoomGLB`（正式室內模型共用）把名字含 `WALL_` 的網格全部放進 `z.walls`（會淡出的牆）；`room()` 每一格依鏡頭位置把清單裡的牆設成不透明度 1（鏡頭在牆內）或淡出。玻璃（約 0.16–0.18）和宿舍的紗窗也在清單裡，所以**鏡頭在室內時，玻璃變成不透明的灰板**：麵店、書店的店面玻璃，宿舍的窗戶（窗外的景看不到），便利商店的自動門。鏡頭在牆外時剛好淡出，所以 `e2ae4d6` 便利商店的進門截圖沒看出來。Café 室內用自己的函式，不受影響。
- **改了什麼**：本來就半透明的 `WALL_` 材質（玻璃、紗窗）不放進 `z.walls`，改成窗的零件（`z.winParts`：固定透明，牆淡出時一起藏，和 Café 室內一樣）。`src/zones3d.js` 3 行。
- **怎麼測**：`tests/interior_glb_integration.py`、`tests/cvs_glb_integration.py` 加「玻璃、紗窗保持透明（不在 `z.walls`、不透明度 < 0.5）」。**在沒修的版本跑會失敗**（宿舍：`WALL_back_glass`、`WALL_back_screen` 不透明度 1、在 `z.walls` 裡，log `test_logs/interiors/interior_glb_integration_unfixed_dorm.log`；便利商店：`WALL_front_glass` 在 `z.walls` 裡），修好之後通過。修改後截圖（這一節、第 3 節）都是修好之後重拍的。
- **沒有測的**：iPhone 實機。

### 4.8 交付後 LAWWW 發現並修好的 bug：宿舍貼在牆上的東西在牆淡出後浮在半空中（2026-10-10 19:58Z 回報）

- **原本錯在哪**：宿舍的 Blender 腳本把門邊的掛勾架、毛巾、帆布袋（前牆）、冷氣、冷氣管蓋板、窗簾桿、窗簾（後牆）做成一般的家具網格，不在那面牆的 `WALL_` 群組裡。鏡頭跑到牆外、那面牆淡出時，它們不會跟著淡出，看起來浮在半空中（LAWWW 從 `test_shots/interior_glb_integration/03_dorm_formal.png` 左前方看到）。遊戲本身掛的**月曆（右牆）、社團傳單（左牆）**是同一類問題（程序化備用模型也有）。
- **改了什麼**：`dorm_interior.py` 把這些零件放進那面牆的群組（`WALL_front_chrome`／`_curtain`／`_pillow`、`WALL_back_ac`／`_black`／`_trim`／`_curtain`／`_rod`；原本毛巾和窗簾在同一個網格，現在按前後牆拆開），遊戲端不用改淡出的程式；月曆、傳單在 `zones3d.js` 的宿舍區塊加進 `z.walls`（`dormWallItems`，方向＝那面牆往室內的法線；正式模型、程序化備用模型都適用）。
- **怎麼測**：`tests/interior_glb_integration.py` 加「貼在牆上的東西（離牆 0.3 m 內、離地 0.5 m 以上）都在那面牆的 `WALL_` 群組裡」（三間都檢查；落地家具不算），**在沒修的版本跑會失敗**、修好之後通過（見下面 log）；另外每間多拍一張「鏡頭在後牆外」的截圖（`*_formal_from_back.png`）。
- 麵店、書店照同一項檢查：沒有貼牆卻不在牆群組裡的東西（靠牆的書架、煮麵台、貨架是落地家具）。

| 鏡頭在前牆外（前牆淡出；門邊的掛勾、毛巾跟著淡出） | 鏡頭在後牆外（後牆淡出；冷氣、窗簾、窗簾桿跟著淡出，落地的書架照樣在） |
|---|---|
| ![](test_shots/interior_glb_integration/05_dorm_formal.png) | ![](test_shots/interior_glb_integration/06_dorm_formal_from_back.png) |

（測試的截圖，畫面下方是遊戲開場的對話框；`?nobldg` 與麵店、書店的同一組截圖在同一個資料夾。）

---

## 5. 溫州街遠景公寓（巷底、巷口兩端、Café 往南／往北的路）

LAWWW 2026-10-10 的工作順序第 ③ 項「Café 往南看的街底」。施工護欄**保留**（看得懂的邊界，D36 不做隱形牆），護欄外的街景換成正式模型。

### 5.1 玩家會看到什麼不同

| | 修改前 | 修改後 |
|---|---|---|
| Café 往南看（施工護欄外） | 套件的遠景公寓（`detail:false`：平的窗貼圖、沒有鐵窗、沒有窗台） | 和主巷同一套 Blender 公寓：長條磁磚／馬賽克外牆、鋁窗＋窗簾、窗內房間（傍晚、晚上有的亮燈）、樓板線、女兒牆、水塔、一樓鐵門／鐵捲門、少數鐵窗 |
| Café 往北看 | 同上（套件） | 同上（正式模型） |
| 巷子西端（日式宿舍後面那一段） | 巷底那棟住家公寓（`endB`）是近景套件，兩側遠景是套件 | 巷底那棟換成正式模型（陽台、鐵窗、冷氣、曬衣服、鐵門、信箱），兩側遠景也換 |

**沒有改的東西**：導航、鏡頭碰撞（遠景公寓的 `addCollider` 照舊）、施工護欄、路、行道樹、互動點。正式模型載入失敗或 `?nobldg` 時照舊是套件。

### 5.2 製作方式與效能

- `wz_street.py` 的 `SPECS` 加 15 棟（巷底 `W0` 近景、遠景 `F1`–`F4`、`S1`–`S4`、`N1`–`N4`、`W1`、`W2`），和主巷 14 棟在**同一個 GLB、同一套材質與窗戶原型**裡（同材質整條巷子一個網格、instancing 共用原型）→ **draw call 不增加**。
- 遠景（`far`）細節少一點：沒有雨遮、冷氣、曬衣服、盆栽，鐵窗只有約 15%（instancing 的原型整條巷子一組，任何鏡頭都整組畫出來；遠景加太多會超過三角形預算）。
- 鐵窗、窗框的細鐵條去掉看不到的端蓋（每根 8 個三角形，原本 12）：近景也一起變輕。
- `wenzhou_street.glb`：2.20 MB（原本 1.34 MB）、25,872 個三角形（畫出 125,982；原本 95,100）、材質 26 個（不變）。同一個鏡頭（量法同 2.5.1）：**draw call 268／224／274**（比第二輪減量後的 277／239／283 還少：遠景的套件公寓不用畫了），**三角形 39.4／36.7／39.5 萬**（≤ 42 萬，但餘裕剩約 2.5 萬：之後在溫州街加東西要先量）。

### 5.3 測試結果

測試都是 Playwright 手機模擬（不是 iPhone 實機）；log 在 `docs/art-rebuild/second_ai/test_logs/street_south/`。

`wz_street_integration` 42、`cafe_glb_integration` 62、`cvs_glb_integration` 39、`reachability_wenzhou_cafe_cvs` 14、`zone_transitions` 37、`p0_movement` 34、`touch_flow_wenzhou` 21、`see_through` 11，**全部 ALL PASS**。`wz_street_integration` 的效能檢查（三個鏡頭 draw call ≤ 310、三角形 ≤ 42 萬）在這一版照樣通過。

`cafe_glb_integration` 第一次跑有 3 項失敗：測試等「任何一個物件有 formal」就開始檢查 Café，這一版溫州街公寓先接上正式模型（也會標 formal），測試在 Café 還沒接上時就檢查了。改成「等 Café 那一棟接上」之後重跑 ALL PASS（截圖清單的同一個等待條件也一起改）。這個時序問題之前就存在，只是剛好沒碰到。

### 5.4 遊戲內截圖（修改前｜修改後）

| 鏡頭 | 修改前（程序化套件） | 修改後（Blender 正式模型） |
|---|---|---|
| Café 往南看（施工護欄外） 11:00 | ![修改前](shots/south_before_south_vista_1100.webp) | ![修改後](shots/south_after_south_vista_1100.webp) |
| Café 往南看（施工護欄外） 17:30 | ![修改前](shots/south_before_south_vista_1730.webp) | ![修改後](shots/south_after_south_vista_1730.webp) |
| Café 往南看（施工護欄外） 20:30 | ![修改前](shots/south_before_south_vista_2030.webp) | ![修改後](shots/south_after_south_vista_2030.webp) |
| Café 往北看 17:30 | ![修改前](shots/south_before_north_vista_1730.webp) | ![修改後](shots/south_after_north_vista_1730.webp) |
| 巷子西端（巷底那棟） 17:30 | ![修改前](shots/south_before_west_end_1730.webp) | ![修改後](shots/south_after_west_end_1730.webp) |
| 玩家鏡頭往南（手機直向） 17:30 | ![修改前](shots/south_before_follow_south_1730.webp) | ![修改後](shots/south_after_follow_south_1730.webp) |

溫州街主巷的修改後截圖（2.6）也在這一版重拍（巷子往西的鏡頭看得到巷底那棟）。

### 5.5 還沒達到參考品質的地方

1. 遠景公寓的一樓只有住家鐵門／鐵捲門，沒有店面招牌（套件原本也沒有）；遠景沒有騎樓。
2. 往南、往北的路盡頭還是天空（沒有橫向的街）；遠景的電線桿、機車還是沒有（只有主巷有）。
3. 正式模型的鐵窗是直條鐵窗；套件原本巷底那棟有拱形花紋的鐵窗（台灣老公寓常見），這次沒有做花紋款。
4. 沒有 iPhone 實機驗證。

---

## 6. 街道道具：淑女車、路燈、公園長椅（全遊戲）

交接文件第三項；LAWWW 2026-10-10 16:45Z 同意改共用檔（條件見下面 6.4）。機車在第 2 節（只用在溫州街）。

### 6.1 玩家會看到什麼不同

| | 修改前（程序化） | 修改後（Blender 正式模型） |
|---|---|---|
| 腳踏車（校園停車架、騎車的路人、溫州街、公館） | 管子拼的淑女車（4 邊形管、平面鋼絲貼圖、方盒前籃） | 平滑的彎下管＋座管＋頭管、後下叉／後上叉、彎的前叉、淺 V 形斷面的擋泥板、**鍊條蓋**、略胖的城市車胎＋輪圈＋花鼓、36 根交叉鋼絲（透明貼圖）、**鐵絲網前籃**（實體上緣與底框＋鐵絲網貼圖）、舒適型座墊、後掠把手＋握把、車鈴、後貨架、**環形鎖**、雙腳中柱、前燈、紅色後反光片；車架顏色照原本的參數（每台不同） |
| 路燈（校園椰林大道、法學院、醉月湖、公館、溫州街） | 車床柱座＋錐形燈桿＋彎臂＋半球燈罩 | 鑄鐵柱座（六道直條紋凹槽、檢修門）、燈桿中段的裝飾環、柱頂尖飾、彎燈臂＋下方的捲曲裝飾、扁圓頂燈罩（前後拉長）＋邊緣、朝下的發光面（**燈頭位置和原本完全一樣**，夜間光暈、地面光圈照舊） |
| 公園長椅（椰林大道、傅鐘旁、霖澤館前、醉月湖畔、溫州街小公園） | 第三方 CC0 長椅模型（market.pmnd.rs） | 兩側鑄鐵椅腳（前腳、後腳連椅背、扶手、地腳板）、四條木條座面、三條往後傾的木條椅背（Poly Haven `dark_wood`）、中間的橫撐；**座面高度、坐的位置和朝向照原本**（0.45 m、正面朝 +z） |

**沒有改的東西**：呼叫方式（`W3.lampPost()`、`W3.bike(color)`、`W3.bikeRack(n)`、`BENCH()`）、所有擺放位置、整區合併（`P3.mergeStatic`）、導航、碰撞、互動點、座位。正式模型還沒載入、載入失敗、`?nobldg` 時照舊是程序化版本。

### 6.2 驗收狀態

| 項目 | 技術（A） | 功能（B） | 美術（C） |
|---|---|---|---|
| 街道道具（`prop.street`） | 完成 | （見 6.4） | `READY_FOR_ART_REVIEW` |

### 6.3 製作方式與規格

- Blender 5.2 `bpy` 腳本 `tools/blender/env_second/street_props.py` → `assets/models/env/second_ai/street_props.glb`：**169 KB**、三樣道具各一個網格（多材質）。
- 三角形（LAWWW 的預算）：**腳踏車 1,484（≤ 1,500）、路燈 584＋發光面 12（≤ 600）、長椅 524（≤ 800）**；整個檔案 ≤ 0.5 MB。
- 材質：腳踏車 5 個（車架白色＋遊戲端頂點色上色、深色、銀色、透明貼圖〔鋼絲＋鐵絲網共用一張 512×256，本作程式產生〕、反光片）；路燈 2 個；長椅 2 個（木頭 Poly Haven `dark_wood` 256 px）。
- 遊戲端（共用檔，LAWWW 同意）：`world3d.js` 的 `lampPost`、`bike`、`bench` 開頭各一行＋一小段 helper（`formalSrc`、`formalLamp`、`formalBike`、`formalBench`）；`zones3d.js` 頂端的 `BENCH()` 一行；`assets3d.js` 標記區加 `prop.street`（**不是 lazy**：這三個函式是同步建立、建完就被整區合併，所以開機時和其他環境資產一起預載）、`?nobldg` 那一行也關掉它。

### 6.4 測試結果

測試都是 Playwright 手機模擬（不是 iPhone 實機）；log 在 `docs/art-rebuild/second_ai/test_logs/props/`。

`street_props_integration` 26、`campus_layout_nav` 67、`see_through` 11、`movement_regression_BE` 30、`reachability_all` 48、`zone_transitions` 37、`p0_movement` 34：**全部通過**（`reachability_all`：全遊戲 11 個區域、139 個互動點、11 個劇情走路目的地、20 個出入口到達點，用引擎真正的移動模擬走一遍）。

**效能（LAWWW 的條件：校園前後的 draw call、三角形、載入時間）**：同一版遊戲、同一個鏡頭（藏起路人；含陰影那一輪、含玩家），修改前＝只擋掉 `street_props.glb` 的下載（其他正式模型照舊），17:30。

| 鏡頭 | draw call（前→後） | 三角形（前→後） |
|---|---|---|
| 校園：椰林大道（長椅、路燈） | 266 → 260 | 940,276 → 928,056 |
| 校園：停車架（腳踏車） | 243 → 237 | 933,600 → 920,780 |
| 溫州街：小公園（長椅、路燈） | 203 → 199 | 355,251 → 351,607 |
| 公館：人行道（路燈） | 202 → 202 | 333,762 → 332,372 |

開機到載入完成（SwiftShader 模擬，只能相對比較）：這次量測修改前 8.4 秒、修改後 9.9 秒（和截圖同時跑，雜訊大）；`street_props_integration` 單獨跑時：正式模型 8.0 秒、`?nobldg` 7.1 秒、道具模型網址故意壞掉 7.7 秒。`street_props.glb` 169 KB，開機時和其他環境資產一起預載（不是 lazy），所以開機多下載 169 KB；沒有 iPhone 實機數字。 道具在整區合併（`P3.mergeStatic`）裡和原本的程序化版一樣併進同材質的大網格，所以 draw call 幾乎不變；三角形差多少看那個鏡頭裡有幾台腳踏車、幾支路燈、幾張長椅。（錯誤：無）

### 6.5 長椅坐姿（玩家坐在溫州街小公園的長椅，正面＋側面；`tools/shots/char_motion.py`）

| | 正面 | 側面 |
|---|---|---|
| 正式模型 | ![](shots/props_bench_formal_front.webp) | ![](shots/props_bench_formal_side.webp) |
| `?nobldg`（程序化長椅） | ![](shots/props_bench_nobldg_front.webp) | ![](shots/props_bench_nobldg_side.webp) |

**新舊長椅的坐姿完全一樣**：座面高度 0.45 m、坐的位置、朝向照約定（`userData.seat`），人物照常坐在座面上、沒有陷進去；正式模型的扶手在手的外側，沒有穿模。腿的姿勢（大腿略抬、小腿接近垂直）是 LAWWW 20:15Z 改過的坐姿（`sitFeet`），新舊長椅相同，不是長椅造成的。

### 6.6 三時段前後比較（實際遊戲；修改前＝擋掉 `street_props.glb` 的下載，其他正式模型照舊）

| 鏡頭 | 修改前（程序化） | 修改後（Blender 正式模型） |
|---|---|---|
| 椰林大道（長椅、路燈） 11:00 | ![修改前](shots/props_before_campus_bench_1100.webp) | ![修改後](shots/props_after_campus_bench_1100.webp) |
| 椰林大道（長椅、路燈） 17:30 | ![修改前](shots/props_before_campus_bench_1730.webp) | ![修改後](shots/props_after_campus_bench_1730.webp) |
| 椰林大道（長椅、路燈） 20:30 | ![修改前](shots/props_before_campus_bench_2030.webp) | ![修改後](shots/props_after_campus_bench_2030.webp) |
| 校園停車架（腳踏車） 11:00 | ![修改前](shots/props_before_campus_racks_1100.webp) | ![修改後](shots/props_after_campus_racks_1100.webp) |
| 校園停車架（腳踏車） 17:30 | ![修改前](shots/props_before_campus_racks_1730.webp) | ![修改後](shots/props_after_campus_racks_1730.webp) |
| 校園停車架（腳踏車） 20:30 | ![修改前](shots/props_before_campus_racks_2030.webp) | ![修改後](shots/props_after_campus_racks_2030.webp) |
| 溫州街小公園（長椅、路燈） 11:00 | ![修改前](shots/props_before_wenzhou_park_1100.webp) | ![修改後](shots/props_after_wenzhou_park_1100.webp) |
| 溫州街小公園（長椅、路燈） 17:30 | ![修改前](shots/props_before_wenzhou_park_1730.webp) | ![修改後](shots/props_after_wenzhou_park_1730.webp) |
| 溫州街小公園（長椅、路燈） 20:30 | ![修改前](shots/props_before_wenzhou_park_2030.webp) | ![修改後](shots/props_after_wenzhou_park_2030.webp) |
| 公館人行道（路燈） 11:00 | ![修改前](shots/props_before_gongguan_lamps_1100.webp) | ![修改後](shots/props_after_gongguan_lamps_1100.webp) |
| 公館人行道（路燈） 17:30 | ![修改前](shots/props_before_gongguan_lamps_1730.webp) | ![修改後](shots/props_after_gongguan_lamps_1730.webp) |
| 公館人行道（路燈） 20:30 | ![修改前](shots/props_before_gongguan_lamps_2030.webp) | ![修改後](shots/props_after_gongguan_lamps_2030.webp) |

### 6.7 Blender 渲染圖

| 腳踏車（側面、斜前方） | 路燈（全景、燈頭） | 長椅 |
|---|---|---|
| ![](blender_renders/props_bike_side.webp) ![](blender_renders/props_bike_34.webp) | ![](blender_renders/props_lamp_full.webp) ![](blender_renders/props_lamp_head.webp) | ![](blender_renders/props_bench_34.webp) |

### 6.8 還沒達到參考品質的地方

1. **腳踏車為了預算減面**（輪胎 16 段、管子 4–5 邊），近看輪胎外緣有稜角；鋼絲和鐵絲網是透明貼圖，很斜的角度看會變薄。
   **路燈也一樣**：燈罩 12 邊、燈臂下的捲曲裝飾只有 3 邊，近看燈罩邊緣是多邊形（燈頭在 4 m 高，從地面看比較不明顯）。
2. **只有一款腳踏車**（淑女車），顏色不同；沒有登山車、公路車、YouBike。
3. **路燈只有一款**（公園式）；台北街道常見的高桿路燈、校園的方形庭園燈還是套件或沒有。
4. 長椅只有一款；**行道樹、盆栽**（交接文件第三項的其他道具）還沒做。
5. 沒有 iPhone 實機驗證；效能用 `renderer.info` 量（見 6.4）。

---

## 7. 公館：羅斯福路南側的騎樓店面街（15 棟＋往溫州街的巷口轉角）

LAWWW 2026-10-10 的工作佇列第 4 項「公館近景」；21:21Z 同意我認領 `gongguan` 區塊（條件見 7.4）。

### 7.1 玩家會看到什麼不同

| | 修改前（程序化套件 `TK.apartment`） | 修改後（Blender 正式模型） |
|---|---|---|
| 店面街 15 棟（麵店、茶行、書房、便利商店…早午餐） | 平的窗貼圖、鐵窗是透明貼圖片、樓上只有窗 | 和溫州街同一套台北公寓：長條磁磚／馬賽克／水泥漆外牆（Poly Haven PBR）、鋁窗＋窗簾＋窗內房間（傍晚、晚上有的亮燈）、真的鐵條鐵窗、雨遮、冷氣室外機＋排水管、樓板線、女兒牆、水塔、頂樓加蓋 |
| 騎樓 | 柱子、天花板、日光燈（套件） | 磁磚柱子（位置照套件，擋住玩家時一樣網點透空）、店與店之間的壁柱也貼同一種磁磚、天花板日光燈（晚上亮）、地磚、**店面上方的鐵捲門箱**、玻璃店面＋店內景深卡 |
| 樓上的招牌（套件沒有） | 只有一樓的店招牌、少數直立招牌 | **樓上住戶的直立招牌 8 塊**（美髮、中醫診所、民宿、數學補習、按摩、健身房、鋼琴教室、撞球）、**二樓整面大招牌 5 塊**（文理補習班、小火鍋、桌遊・撞球、牙醫診所、英語會話）、**屋頂廣告看板 1 座**（學生套房出租，鐵架）；晚上和店招牌一起亮 |
| 往溫州街的巷口 | 轉角那棟和麵店的側面是一整片沒有窗的牆 | 兩棟朝巷子的側面都有窗（鐵窗、冷氣、樓板線） |

**沒有改的東西**（LAWWW 的條件 1–3、6）：店的位置與寬度、騎樓柱子與導航阻擋、鏡頭碰撞（`addCol`）、店門互動點（z=21）、從店裡出來的位置（z=18）、捷運出口、路人路線、校門（`CK.gate`）、傅鐘、路燈（`W3.lampPost`）、店門口的立牌、機車、柏油路、`sunYaw`（π/2）、`campusBackdrop`（從校門往外看的背景，維持套件）。正式模型還沒載入、載入失敗、`?nobldg` 時照舊是套件。

### 7.2 驗收狀態

| 項目 | 技術（A） | 功能（B） | 美術（C） |
|---|---|---|---|
| 公館店面街（`bldg.gongguan_shops`） | 完成 | `FUNCTIONAL_VERIFIED`（見 7.4） | `READY_FOR_ART_REVIEW` |

### 7.3 製作方式與規格

- Blender 5.2 `bpy`：`tools/blender/env_second/wz_street.py --set gongguan`（和溫州街同一支腳本、同一套公寓、材質、窗戶原型）→ `assets/models/env/second_ai/gongguan_shops.glb`：**1.91 MB**、814 個物件（89 個不同的網格；窗、鐵窗、雨遮、冷氣、水塔、盆栽用 `EXT_mesh_gpu_instancing`）、三角形 20,279（含 instancing 畫出來 83,073）、貼圖 512 px。
- 配置照 `zones3d.js` gongguan 區塊的 `shops`（位置、寬度＝店寬＋店與店之間的 1.2 m、樓層、牆、顏色、招牌、柱子位置）；改那邊要一起改這裡（腳本裡有註明）。
- 招牌的字不放在 GLB：板面帶店名、顏色（自訂屬性），遊戲用 canvas 畫、合成一張 atlas（和溫州街同一套）。直立招牌兩面的字一樣，改成共用 atlas 的同一格（`wzAtlasFaces`；溫州街也受惠）。
- 公館和溫州街不同的地方（`--set gongguan` 才有）：樓上住戶的招牌、鐵捲門箱、側面開窗；鐵窗、盆栽、冷氣的密度比較低、冷氣用簡化版（見 7.4）；騎樓裡店與店之間的壁柱貼和柱子一樣的磁磚（溫州街用磨石子）；店面玻璃後面兩側的牆用淺米色素面（溫州街用 Café 室內的暖米色灰泥貼圖；第一版公館也是，在騎樓的陰影＋玻璃後面變成一大片深褐色斑點，像髒汙，改掉）。
- 遊戲端：`zones3d.js` gongguan 區塊（套件店面標 `userData.ggShop`＝G00–G15；有正式模型時不參加整區合併；載入後用 `attachWenzhouModel` 藏套件外觀）、`assets3d.js` 加 `bldg.gongguan_shops`（lazy）。

### 7.4 測試結果

測試都是 Playwright 手機模擬（不是 iPhone 實機）；log 在 `docs/art-rebuild/second_ai/test_logs/gongguan/`。

`gongguan_glb_integration` 35、`gongguan_layout_nav` 46、`p0_movement` 34、`reachability_all` 48、`zone_transitions` 37：**全部通過**（`reachability_all`：全遊戲 11 個區域、139 個互動點、劇情走路目的地、出入口到達點，用引擎真正的移動模擬走一遍，含公館的店門口、捷運、往溫州街、回校園）。

**效能（LAWWW 的條件：同一個鏡頭 draw call ≤ `?nobldg`＋30%、三角形 ≤ 42 萬；藏起路人、含陰影那一輪、含玩家）**：

| 鏡頭（17:30） | draw call：`?nobldg` → 正式模型（倍數） | 三角形：`?nobldg` → 正式模型 |
|---|---|---|
| 人行道往西看整排店面 | 183 → 194（×1.06） | 335,172 → 402,728 |
| 校門口往南看過羅斯福路 | 192 → 202（×1.052） | 334,490 → 401,392 |
| 騎樓裡往西 | 183 → 199（×1.087） | 335,168 → 402,766 |
| 往溫州街的巷口 | 150 → 167（×1.113） | 333,118 → 396,926 |

第一輪（照溫州街的密度）三角形 44.6～45.0 萬，超過上限：instancing 的小零件（鐵窗、冷氣、盆栽）整條街一組、任何鏡頭都整組畫出來，從校門看整排店面的鏡頭一定全部看到。改成公館的鐵窗比例 0.7→0.4、盆栽 0.6→0.25、冷氣 0.65→0.5（商店街的鐵窗、盆栽本來就比住宅巷少），冷氣用簡化版（每台 328→200 個三角形；冷氣都在二樓以上，從街上看不出差別）→ 模型裡 instancing 畫出來的三角形 12.9 萬→8.3 萬。draw call 多出來的是正式模型的材質（三種外牆、窗、鐵件、招牌 atlas…）各一次、會投影的再加陰影那一輪一次。

**新檢查在修正前會失敗**（docs/TESTING.md 規則 3）：第一輪（照溫州街的密度、atlas 還沒共用格）的 log 保留在 `test_logs/gongguan/gongguan_glb_integration_first.log`——效能（三角形 44.6～45.0 萬）、atlas（2048×4096）兩項 FAIL；修正後 PASS。同一份 log 裡另外兩項 FAIL 是測試本身的問題（太陽方位的門檻寫錯：12:00 的時段表本來就是 150°；「沒有標記的群組」把路燈光暈算進去，兩輪之間路燈亮了），已修正測試，判定的意思不變。


### 7.5 遊戲內截圖（修改前｜修改後；修改前＝同一版遊戲、只擋掉 `gongguan_shops.glb`）

| 鏡頭 | 修改前（程序化套件） | 修改後（Blender 正式模型） |
|---|---|---|
| 人行道往西看整排店面 11:00 | ![修改前](shots/gongguan_before_street_west_1100.webp) | ![修改後](shots/gongguan_after_street_west_1100.webp) |
| 人行道往西看整排店面 17:30 | ![修改前](shots/gongguan_before_street_west_1730.webp) | ![修改後](shots/gongguan_after_street_west_1730.webp) |
| 人行道往西看整排店面 20:30 | ![修改前](shots/gongguan_before_street_west_2030.webp) | ![修改後](shots/gongguan_after_street_west_2030.webp) |
| 校門口往南看過羅斯福路 11:00 | ![修改前](shots/gongguan_before_from_gate_1100.webp) | ![修改後](shots/gongguan_after_from_gate_1100.webp) |
| 校門口往南看過羅斯福路 17:30 | ![修改前](shots/gongguan_before_from_gate_1730.webp) | ![修改後](shots/gongguan_after_from_gate_1730.webp) |
| 校門口往南看過羅斯福路 20:30 | ![修改前](shots/gongguan_before_from_gate_2030.webp) | ![修改後](shots/gongguan_after_from_gate_2030.webp) |
| 騎樓裡往西 11:00 | ![修改前](shots/gongguan_before_arcade_1100.webp) | ![修改後](shots/gongguan_after_arcade_1100.webp) |
| 騎樓裡往西 17:30 | ![修改前](shots/gongguan_before_arcade_1730.webp) | ![修改後](shots/gongguan_after_arcade_1730.webp) |
| 騎樓裡往西 20:30 | ![修改前](shots/gongguan_before_arcade_2030.webp) | ![修改後](shots/gongguan_after_arcade_2030.webp) |
| 往溫州街的巷口 11:00 | ![修改前](shots/gongguan_before_lane_1100.webp) | ![修改後](shots/gongguan_after_lane_1100.webp) |
| 往溫州街的巷口 17:30 | ![修改前](shots/gongguan_before_lane_1730.webp) | ![修改後](shots/gongguan_after_lane_1730.webp) |
| 往溫州街的巷口 20:30 | ![修改前](shots/gongguan_before_lane_2030.webp) | ![修改後](shots/gongguan_after_lane_2030.webp) |
| 玩家鏡頭（手機直向） 17:30 | ![修改前](shots/gongguan_before_follow_1730.webp) | ![修改後](shots/gongguan_after_follow_1730.webp) |

### 7.6 Blender 渲染圖（Cycles；招牌的字是遊戲裡用 canvas 畫的，所以這裡是空白板面）

| 人行道往西 | 立面（二樓大招牌、直立招牌） | 往溫州街的巷口（兩側開窗） |
|---|---|---|
| ![](blender_renders/gongguan_street_w.webp) | ![](blender_renders/gongguan_facade.webp) | ![](blender_renders/gongguan_lane.webp) |

| 騎樓（磁磚柱、日光燈、鐵捲門箱） | 屋頂看板 | 夜景（亮燈的窗、騎樓日光燈） |
|---|---|---|
| ![](blender_renders/gongguan_arcade.webp) | ![](blender_renders/gongguan_roof.webp) | ![](blender_renders/gongguan_night_street_w.webp) |

### 7.7 還沒達到參考品質的地方

1. 店內是景深卡（一張圖），不是有深度的室內；站在騎樓裡近看玻璃，看得出是平面。
2. 店面的造型都一樣（玻璃＋四道直框）：真實的公館有開放式的攤位（滷味、水果行、手搖飲的櫃台），這裡都是玻璃店面。
3. 騎樓裡沒有機車、沒有騎樓下的吊牌（保持騎樓可以走、鏡頭不被擋）。
4. 店面街東西兩端以外（x 超過 ±78）、後面那排高樓還是套件的遠景方盒；從校門往外看的背景（`campusBackdrop`）也還是套件（LAWWW 之後決定要不要改用同一個 GLB）。
5. 機車還是套件（溫州街已經換成正式模型的那兩款）。2026-10-11 量了換成正式模型的預算（`tools/blender/env_second/shots/gg_scooter_budget.py`，Playwright；log 在 `test_logs/gongguan/gg_scooter_budget.log`）：公館 60 台，套件每台 1,050 個三角形（會投影的 880），同一個鏡頭實際畫到的是 1.8～3.8 萬（看不到的車會被剔除）；正式模型兩款 1,388／1,664 個，InstancedMesh 不分台剔除、整組都畫 88,920 個 → 同鏡頭估計 42.0～43.6 萬，**超過 42 萬的上限，先不換**（LAWWW 23:26Z：不夠就不換）。要換的話可以把車分成幾組 InstancedMesh（看不到的那組不畫），或做一款輕量版的車（約 600 個三角形）。
6. 沒有 iPhone 實機驗證；效能用 `renderer.info` 量（見 7.4）。

---

## 8. 校園地標①：總圖書館（椰林大道東端盡頭）

LAWWW 2026-10-10 23:26Z 分派：校園地標依序 ①總圖 ②傅鐘 ③行政大樓 ④文學院、校史館，一次交一棟（校門 `CK.gate` 不動）。條件見 8.4。

### 8.1 玩家會看到什麼不同

| | 修改前（程序化套件 `CK.hall`） | 修改後（Blender 正式模型） |
|---|---|---|
| 外牆 | 單色磚紋貼圖 | 褐色面磚（Poly Haven `exterior_wall_cladding_02`，真實比例：一塊約 22×8 cm，接近二丁掛），法線貼圖讓磚縫有凹凸 |
| 窗 | 貼在牆面上的薄片（窗框、玻璃都在牆的同一個平面附近） | **牆上真的開出拱形窗洞**：石材窗框外凸 6 cm、玻璃內凹 30 cm（看得到窗洞的內側面）、深色窗框＋直櫺＋起拱線的橫櫺、外凸的石材窗台；傍晚以後約七成的窗亮暖光 |
| 石材（門廊、拱圈、柱頭柱腳、樓層腰帶、簷口、窗框） | 程序化斑點的米色石材 | **切石**（Poly Haven `sandstone_blocks_08`，一塊約 86×57 cm，看得到石塊的接縫與表面），降低彩度、校正成套件的淺米灰 |
| 一樓拱廊 | 拱只有正面一片 | 每個拱有拱腹（拱的內側面）、正面石材拱圈；柱墩是面磚＋石材柱頭柱腳；轉角的柱墩一路到二樓樓板（套件的轉角柱子上面是空的） |
| 中央門廊 | 石材方塊＋三角山牆 | 五個拱（有拱腹、拱圈）、兩側實牆、檐部、山牆斜邊線腳、天花板、花崗石地坪；匾額「總圖書館」是**石材匾額**：大字、字距拉開、一圈細內框（canvas 字，晚上不發光） |
| 簷口、屋頂 | 方塊收邊、四坡屋頂 | 三段線腳的簷口（四周斜接）、屋簷底下有簷底板與屋簷前緣；屋瓦貼圖（Poly Haven `grey_roof_tiles`）、屋脊 |
| 中央塔樓 | 面磚方塊＋四坡屋頂 | 四面各兩扇拱窗（真的窗洞）、腰帶、線腳簷口、四坡瓦屋頂 |

**沒有改的東西**（LAWWW 的條件）：位置、尺寸、朝向、樓層、開間（照 `CK.hall` 的參數；外框差異見 8.4）、導航阻擋（`userData.ck.blocks`）、鏡頭碰撞（`ckPlace`）、門口互動點、`campusBackdrop`、`sunYaw`、樹、椰林大道、路燈、其他建築、霖澤館／萬才館／國青中心／法學院廣場（LAWWW 的）。`zones3d.js` campus 區塊只加了：總圖的 `ckTag='library'`、有模型時 `dyn`（不參加整區合併）、區塊最後載入模型（和溫州街、公館同一個 `attachWenzhouModel`，多一個參數：只藏標記等於 `library` 的那一棟）。正式模型還沒載入、載入失敗、`?nobldg` 時照舊是套件。

### 8.2 驗收狀態

| 項目 | 技術（A） | 功能（B） | 美術（C） |
|---|---|---|---|
| 總圖書館外觀（`bldg.campus_library`） | 完成 | `FUNCTIONAL_VERIFIED`（見 8.4） | `READY_FOR_ART_REVIEW` |

### 8.3 製作方式與規格

- 參考：ART_DIRECTION（台大校舍語彙：褐色面磚、石材收邊、一樓連續拱廊、拱窗）、D23／D25（校園配置：總圖在椰林大道東端、正面朝西）。**沒有使用者提供的總圖照片**；這是照套件的量體與台大校舍的共同特徵做的，不是照真實總圖的立面一比一重建（真實的總圖是 1998 年的建築，正面細節和這裡不同）。
- Blender 5.2 `bpy`：`tools/blender/env_second/campus_library.py` → `assets/models/env/second_ai/campus_library.glb`：**1.47 MB**、11 個網格（每個材質一個，全部合成：不用 instancing）、**三角形 22,816**（套件的總圖 34,503）、貼圖 512 px（WebP）、校園世界座標（套件的 `ckPlace(lib,100,0,−π/2)` 換算好）。
- 參數照 `zones3d.js` 的 `CK.hall({w:60,d:26,floors:4,gfh:5.0,fh:4.3,…,arcade:true,arcDepth:3.0,porch:{bays:5,depth:4.2,…},tower:{w:9,h:9}})`；改那邊要一起改這裡（腳本開頭有註明）。
- 遊戲端：窗框、窗洞內側、玻璃、門不投影（陰影那一輪少畫）；亮燈的窗（`ck_glass_lit`）晚上照 `CK.setNight` 發光；匾額是 `PLATE_FACE_LIB`（`wzPlateTex` 的石材匾額樣式：`serif`，門牌、告示牌的樣式不變）。
- 驗收時改掉的五個問題（都是遊戲內截圖看到的）：①石材第一版用清水混凝土貼圖（`concrete_wall_006`），門廊柱子滿是褐色水痕，比套件的切石還髒 → 換成切石；②面磚第一版縮成一半大小，近看是一片紅色雜訊、看不出磚縫 → 真實比例；③拱廊裡斜看窗戶，玻璃和窗框之間有一條縫，看得到空的建築裡面和後面的草地（一條綠線）→ 玻璃改成整個窗洞、邊緣壓在窗框後面，窗洞內側延伸到玻璃後面；④拱廊、門廊的天花板晚上反而整片發亮（白天補的反射光，晚上設得比白天還亮；拱廊沒有燈）→ 晚上比白天暗；⑤亮燈的窗是一片平均的光，近看像發亮的平板 → 加自發光貼圖，由上往下漸暗（像天花板的燈照下來）。
- Blender 渲染圖（8.6）是加窗內自發光貼圖之前輸出的同一個模型（幾何、材質相同；自發光在遊戲裡只有晚上開，Blender 的白天渲染會一直亮，所以沒有重渲）。

### 8.4 測試結果

測試都是 Playwright 手機模擬（不是 iPhone 實機）；log 在 `docs/art-rebuild/second_ai/test_logs/library/`。

`campus_glb_integration` 27、`campus_layout_nav` 67、`see_through` 11、`p0_movement` 34、`reachability_all` 48、`zone_transitions` 37：**全部通過**（`reachability_all`：全遊戲 11 個區域、139 個互動點、劇情走路目的地、出入口到達點，用引擎真正的移動模擬走一遍，含總圖門口）。`campus_glb_integration` 的外框檢查：{"kit": [81.9, -0.0, -30.8, 113.8, 30.6, 30.8], "glb": [81.9, 0, -30.8, 113.8, 30.52, 30.8]} 最大差 0.08 m。

`tools/dev_scratch/view_audit.py`（360° 盤點，總圖門口、總圖前廣場南側、椰林大道東段、社科院前各 8 個方向）：正式模型 `shots/library_audit/`、改之前（`?nobldg`）`shots/library_audit_nobldg/`，沒有 JS 錯誤；沒有看到空洞、穿模、被擋住的方向（例：總圖門口）：

![總圖門口 360°](shots/library_audit/總圖門口.jpg)

④⑤修好之後，`campus_glb_integration` 多兩項檢查（亮燈的窗有自發光貼圖、天花板晚上比白天暗）：用同一份測試跑修正前的版本（`7cd230b`）這兩項 **FAIL**（`test_logs/library/campus_glb_integration_old_7cd230b.log`），修正後 **PASS**（docs/TESTING.md 規則 3）；第一輪的 log 保留在 `campus_glb_integration_first.log`。

**效能（LAWWW 的條件：同一個鏡頭三角形不能比現在多、draw call ≤ 現在的 +10%；藏起路人與騎腳踏車的路人、含陰影那一輪、含玩家）**：「改之前」＝同一版遊戲、進校園前把 `bldg.campus_library` 從 manifest 拿掉（套件照舊參加整區合併，和這次修改之前一樣；路燈、腳踏車、霖澤館的正式模型兩邊都有，只比總圖）。

| 鏡頭（17:30） | draw call：改之前 → 正式模型（倍數） | 三角形：改之前 → 正式模型（倍數） |
|---|---|---|
| 進校門往東看椰林大道盡頭（總圖在 210 m 外） | 331 → 297（×0.897） | 962,190 → 950,916（×0.988） |
| 椰林大道後段往東 | 156 → 165（×1.058） | 772,582 → 761,630（×0.986） |
| 總圖前廣場，斜看正面 | 149 → 157（×1.054） | 756,604 → 745,640（×0.986） |
| 門廊近看 | 143 → 151（×1.056） | 739,228 → 728,264（×0.985） |
| 一樓拱廊裡 | 148 → 156（×1.054） | 757,372 → 746,408（×0.986） |

三角形每個鏡頭都比改之前少（模型 22,816 個三角形，套件 34,503；窗框、窗洞、玻璃、門不投影）。draw call 多 5～6%：套件原本和整個校園一起合併（同材質的網格合成一個），正式模型是自己的 11 個材質各一次（會投影的牆、屋頂、石材、勒腳、天花板再加陰影那一輪）。進校門往東看的鏡頭，正式模型兩次量到 341（第一輪，`campus_glb_integration_first.log`）和 297（這一輪）、改之前兩次都是 331：差 44 次 draw call、三角形只差 382 個，是遠處很小的東西在量的那一格有沒有畫（原因沒有再追）；兩次都在 +10% 以內。

### 8.5 遊戲內截圖（修改前｜修改後；修改前＝同一版遊戲、只擋掉 `campus_library.glb`）

| 鏡頭 | 修改前（程序化套件） | 修改後（Blender 正式模型） |
|---|---|---|
| 椰林大道往東看總圖 11:00 | ![修改前](shots/library_before_avenue_1100.webp) | ![修改後](shots/library_after_avenue_1100.webp) |
| 椰林大道往東看總圖 17:30 | ![修改前](shots/library_before_avenue_1730.webp) | ![修改後](shots/library_after_avenue_1730.webp) |
| 椰林大道往東看總圖 20:30 | ![修改前](shots/library_before_avenue_2030.webp) | ![修改後](shots/library_after_avenue_2030.webp) |
| 總圖前廣場，斜看正面 11:00 | ![修改前](shots/library_before_plaza_1100.webp) | ![修改後](shots/library_after_plaza_1100.webp) |
| 總圖前廣場，斜看正面 17:30 | ![修改前](shots/library_before_plaza_1730.webp) | ![修改後](shots/library_after_plaza_1730.webp) |
| 總圖前廣場，斜看正面 20:30 | ![修改前](shots/library_before_plaza_2030.webp) | ![修改後](shots/library_after_plaza_2030.webp) |
| 門廊近看 11:00 | ![修改前](shots/library_before_porch_1100.webp) | ![修改後](shots/library_after_porch_1100.webp) |
| 門廊近看 17:30 | ![修改前](shots/library_before_porch_1730.webp) | ![修改後](shots/library_after_porch_1730.webp) |
| 門廊近看 20:30 | ![修改前](shots/library_before_porch_2030.webp) | ![修改後](shots/library_after_porch_2030.webp) |
| 一樓拱廊裡 11:00 | ![修改前](shots/library_before_arcade_1100.webp) | ![修改後](shots/library_after_arcade_1100.webp) |
| 一樓拱廊裡 17:30 | ![修改前](shots/library_before_arcade_1730.webp) | ![修改後](shots/library_after_arcade_1730.webp) |
| 一樓拱廊裡 20:30 | ![修改前](shots/library_before_arcade_2030.webp) | ![修改後](shots/library_after_arcade_2030.webp) |
| 玩家鏡頭（手機直向） 17:30 | ![修改前](shots/library_before_follow_1730.webp) | ![修改後](shots/library_after_follow_1730.webp) |

### 8.6 Blender 渲染圖（Cycles；匾額的字是遊戲裡用 canvas 畫的，所以這裡是空白板面；窗的亮燈要遊戲的夜間設定，這裡只有白天）

| 正面（從椰林大道） | 斜看正面 | 門廊 |
|---|---|---|
| ![](blender_renders/library_front.webp) | ![](blender_renders/library_three_q.webp) | ![](blender_renders/library_porch.webp) |

| 一樓拱廊 | 背面＋側面 | 鳥瞰 |
|---|---|---|
| ![](blender_renders/library_arcade.webp) | ![](blender_renders/library_back_side.webp) | ![](blender_renders/library_aerial.webp) |

### 8.7 還沒達到參考品質的地方

1. **不是照真實總圖的立面重建**：沒有總圖的照片，量體與開間照套件、細節照台大校舍的共同語彙（面磚、石材、拱窗、拱廊、門廊山牆）。真實的總圖正面有高大的中央入口與不同的開窗比例；有照片的話，可以照照片改立面（位置、尺寸、導航不用動）。
2. 窗裡面是一片深色玻璃（亮燈時是由上往下漸暗的暖光），沒有窗簾或室內的景深；近看拱廊裡的窗看得出是平的。
3. 外觀模型裡面是空的；從拱廊裡的大門進去，照舊切換到原本的室內區域「總圖書館 閱覽室」（`library`，套件的房間，還沒換成 Blender）。
4. 屋頂、塔樓沒有排水管、避雷針、冷氣等設備；牆面沒有雨痕與髒污（刻意保持乾淨，避免像第一版的混凝土一樣髒）。
5. 沒有 iPhone 實機驗證；效能用 `renderer.info` 量（見 8.4）。

---

## 9. 校園地標②：傅鐘（椰林大道南側的傅鐘廣場，行政大樓正前方）

LAWWW 2026-10-10 23:26Z 分派的第二棟（條件和總圖相同，見 8.4、9.4）。

### 9.1 玩家會看到什麼不同

| | 修改前（程序化套件 `CK.bell`） | 修改後（Blender 正式模型） |
|---|---|---|
| 台基、柱子、梁 | 程序化斑點的米色石材方塊 | 和總圖同一種**切石**（Poly Haven `sandstone_blocks_08`）：兩階台基與柱腳的上緣倒角、柱身四個角倒角、柱頸＋柱頭（下緣倒角）、梁上一圈線腳 |
| 屋頂 | 程序化瓦紋貼圖、方塊寶頂 | 屋瓦（Poly Haven `grey_roof_tiles`，真實比例）、四條垂脊的脊瓦、瓦的前緣、屋簷板、石座＋銅寶珠 |
| 銅鐘 | 同一個剖面的旋轉體、吊環、鐘舌（球） | 照套件的剖面（外擴的鐘口、裡面看得到鐘舌），加**三道凸起的鐘帶**（鐘口、鐘腰、鐘肩）；直立的吊環、鐵吊件、鐘舌（桿＋錘）；木橫梁（Poly Haven `dark_wood`） |
| 石碑 | 方塊碑身＋碑帽、貼上去的字 | 倒角的碑身與碑帽；碑面「傅鐘」是石材匾額樣式（和總圖同一套 canvas 字：大字、細內框） |
| 夜間 | 前面兩根柱子腳下的地燈、柱面由下往上淡出的暖光、光暈 | 同一個位置、同一種做法（地燈燈罩 `ck_bell_lens` 晚上發光、柱面暖光片加法混合、`GLOW_*` 空節點放光暈）；暖光片改成和柱子一樣寬（套件比柱子寬，晚上柱子兩側的空中也有一條光） |

**沒有改的東西**：位置、尺寸、朝向（照 `CK.bell` 的尺寸、`place(g,bell,-38,16.5,π)`；外框差異見 9.4）、導航阻擋（`userData.gate.blocks` → `placeBlocks`：台基整個、石碑）、傅鐘廣場的地坪、兩棵樹、長椅與座位、行政大樓、路燈。`zones3d.js` campus 區塊只加了：傅鐘的 `ckTag='bell'`、有模型時 `dyn`、區塊最後載入模型（和總圖同一個 `attachWenzhouModel`）。正式模型還沒載入、載入失敗、`?nobldg` 時照舊是套件。

`attachWenzhouModel`（第二個 AI 的函式）這次多做三件事（溫州街、公館、總圖不受影響：它們沒有這些東西）：
1. `GLOW_*` 空節點 → `TK.glowSprite` 光暈（和 Café 同一種），照現在路燈開了沒先設好亮度（校園的夜間只在路燈開關時切換；不先設的話，夜裡才進校園時光暈要等到下一次開關燈才會亮）。
2. `ck_bell_wash` → 黑色底＋自發光貼圖、加法混合（和套件的柱面暖光同一種做法）。
3. 藏起來的套件光暈（`TK.glowSprite`）：`TK.setNight` 每次都會依時段重設 `visible`，只藏起來的話晚上又會出現、和正式模型的光暈疊在一起 → 日夜亮度都設成 0。（總圖的套件沒有光暈，所以總圖那一批沒有遇到；整合測試有一項專門檢查這個，並用「自我檢查」證明沒修的話會被數到。）

### 9.2 驗收狀態

| 項目 | 技術（A） | 功能（B） | 美術（C） |
|---|---|---|---|
| 傅鐘（`bldg.campus_bell`） | 完成 | `FUNCTIONAL_VERIFIED`（見 9.4） | `READY_FOR_ART_REVIEW` |

### 9.3 製作方式與規格

- 參考：ART_DIRECTION（台大校園）、D23／D25（傅鐘在椰林大道南側、行政大樓正前方，石碑朝北對著大道）、套件 `CK.bell`（v9.3 第十六批）。**沒有使用者提供的傅鐘照片**；這是照套件的量體與尺寸做的（四柱鐘亭、四坡屋頂、銅鐘、石碑），細節是一般的石造鐘亭，不是照真實傅鐘一比一重建。
- Blender 5.2 `bpy`：`tools/blender/env_second/campus_bell.py` → `assets/models/env/second_ai/campus_bell.glb`：**126 KB**、8 個網格（每個材質一個）、三角形 1,562（套件 1,292；會投影的：套件 1,254、正式模型 528）、貼圖 512 px（WebP）、校園世界座標。
- 驗收時改掉的：柱身第一版用粉光（`white_plaster_02`），遊戲裡是灰色斑駁、像髒的水泥 → 改成和台基、柱頭一樣的切石；拍攝角度第一版放在柱子裡（Blender 渲染、遊戲截圖都改到台基外面）。

### 9.4 測試結果

測試都是 Playwright 手機模擬（不是 iPhone 實機）；log 在 `docs/art-rebuild/second_ai/test_logs/bell/`。

`campus_glb_integration` 35、`campus_layout_nav` 67、`see_through` 11、`p0_movement` 34、`reachability_all` 48、`zone_transitions` 37：**全部通過**（`campus_layout_nav` 含「傅鐘本體、台基角、石碑」不能走、「傅鐘石碑前、傅鐘旁長椅前、傅鐘廣場」站得住而且走得到；`reachability_all`：全遊戲 11 個區域、139 個互動點，含「坐在傅鐘旁的長椅」）。`campus_glb_integration` 的外框檢查：{"kit": [-40.4, -0.0, 13.27, -35.6, 5.67, 18.9], "glb": [-40.4, 0, 13.27, -35.6, 5.75, 18.9]} 最大差 0.08 m。

`campus_glb_integration` 傅鐘的夜間檢查：地燈燈罩 20:30 亮度 1.6、11:00 是 0；柱面暖光片加法混合、20:30 亮度 0.75；兩個光暈 20:30 亮、11:00 不亮；夜裡（20:30）才進校園時，模型載入後光暈、地燈直接是亮的；藏起來的套件光暈晚上沒有跑回來，「自我檢查」把套件光暈改回照時段開關（＝沒修的版本），晚上會數到 2 個。

`tools/dev_scratch/view_audit.py`（360° 盤點，傅鐘廣場、傅鐘石碑前、傅鐘旁長椅前各 8 個方向）：正式模型 `shots/bell_audit/`、改之前（`?nobldg`）`shots/bell_audit_nobldg/`，沒有 JS 錯誤（例：傅鐘石碑前）：

![傅鐘石碑前 360°](shots/bell_audit/傅鐘石碑前.jpg)

**效能（LAWWW 的條件：同一個鏡頭三角形不能比現在多、draw call ≤ 現在的 +10%；藏起路人與騎腳踏車的路人、含陰影那一輪、含玩家）**：「改之前」＝進校園前把 `bldg.campus_library`、`bldg.campus_bell` 都從 manifest 拿掉（總圖、傅鐘都是套件、照舊參加整區合併）。

| 鏡頭（17:30） | draw call：改之前 → 正式模型（倍數） | 三角形：改之前 → 正式模型（倍數） |
|---|---|---|
| 進校門往東看椰林大道（傅鐘在右前方） | 341 → 307（×0.9） | 971,604 → 960,404（×0.988） |
| 椰林大道後段往東（總圖） | 156 → 165（×1.058） | 771,736 → 760,580（×0.986） |
| 總圖前廣場 | 157 → 165（×1.051） | 768,936 → 757,768（×0.985） |
| 總圖門廊近看 | 148 → 156（×1.054） | 748,546 → 737,378（×0.985） |
| 總圖一樓拱廊裡 | 148 → 156（×1.054） | 756,526 → 745,358（×0.985） |
| 從椰林大道看傅鐘 | 163 → 166（×1.018） | 772,880 → 766,992（×0.992） |
| 傅鐘近看（斜前方） | 166 → 169（×1.018） | 825,704 → 819,816（×0.993） |

傅鐘本身（`kit_tris` 量，Playwright）：套件 1,292 個三角形（會投影的 1,254）；正式模型 1,562（顏色那一輪多 270：鐘的三道鐘帶、倒角、垂脊），會投影的只剩 528（台基、柱子、梁、屋頂、木橫梁、屋簷板；銅鐘、吊環、鐘舌、地燈、匾額太小、影子看不出來，不投影）→ 兩輪加起來每一格少畫 456 個。傅鐘那兩個鏡頭三角形少 5,888 個，大部分是總圖：套件的總圖和整個校園合併成同一組網格，面向南邊看傅鐘時也整組畫；正式模型的總圖是自己一個物件，看不到就不畫。draw call 多 3 次（×1.018：正式模型的材質各一次，套件原本和校園一起合併）。總圖那幾個鏡頭和第 8 節一樣（進校門的遠景鏡頭這一輪量到 341 → 307）。

### 9.5 遊戲內截圖（修改前｜修改後；修改前＝同一版遊戲、只擋掉 `campus_bell.glb`，總圖兩邊都是正式模型）

| 鏡頭 | 修改前（程序化套件） | 修改後（Blender 正式模型） |
|---|---|---|
| 從椰林大道看傅鐘（後面是行政大樓） 11:00 | ![修改前](shots/bell_before_avenue_1100.webp) | ![修改後](shots/bell_after_avenue_1100.webp) |
| 從椰林大道看傅鐘（後面是行政大樓） 17:30 | ![修改前](shots/bell_before_avenue_1730.webp) | ![修改後](shots/bell_after_avenue_1730.webp) |
| 從椰林大道看傅鐘（後面是行政大樓） 20:30 | ![修改前](shots/bell_before_avenue_2030.webp) | ![修改後](shots/bell_after_avenue_2030.webp) |
| 斜前方近看（銅鐘、柱子、石碑） 11:00 | ![修改前](shots/bell_before_close_1100.webp) | ![修改後](shots/bell_after_close_1100.webp) |
| 斜前方近看（銅鐘、柱子、石碑） 17:30 | ![修改前](shots/bell_before_close_1730.webp) | ![修改後](shots/bell_after_close_1730.webp) |
| 斜前方近看（銅鐘、柱子、石碑） 20:30 | ![修改前](shots/bell_before_close_2030.webp) | ![修改後](shots/bell_after_close_2030.webp) |
| 台基東邊抬頭看鐘 11:00 | ![修改前](shots/bell_before_side_1100.webp) | ![修改後](shots/bell_after_side_1100.webp) |
| 台基東邊抬頭看鐘 17:30 | ![修改前](shots/bell_before_side_1730.webp) | ![修改後](shots/bell_after_side_1730.webp) |
| 台基東邊抬頭看鐘 20:30 | ![修改前](shots/bell_before_side_2030.webp) | ![修改後](shots/bell_after_side_2030.webp) |
| 玩家鏡頭（手機直向） 17:30 | ![修改前](shots/bell_before_follow_1730.webp) | ![修改後](shots/bell_after_follow_1730.webp) |

### 9.6 Blender 渲染圖（Cycles；石碑的字是遊戲裡用 canvas 畫的，所以這裡是空白板面；柱面的夜間暖光片不渲染（遊戲裡白天是看不到的加法混合））

| 正面（從椰林大道） | 斜看 | 從側面看銅鐘 |
|---|---|---|
| ![](blender_renders/bell_front.webp) | ![](blender_renders/bell_three_q.webp) | ![](blender_renders/bell_bell.webp) |

| 石碑 | 屋頂 |
|---|---|
| ![](blender_renders/bell_tablet.webp) | ![](blender_renders/bell_roof.webp) |

### 9.7 還沒達到參考品質的地方

1. **不是照真實傅鐘重建**：沒有照片，量體照套件；真實的傅鐘的柱子、屋頂、鐘的形狀與比例可能不同，有照片可以照照片改（位置、導航不用動）。
2. 銅鐘沒有銘文、紋飾；鐘的材質是單色的銅（沒有銅綠、磨損）。
3. 屋簷板底下是平的深色板，沒有椽子。
4. 沒有 iPhone 實機驗證；效能用 `renderer.info` 量（見 9.4）。

---

## 10. 校園地標③：行政大樓（椰林大道南側，傅鐘後面）

LAWWW 2026-10-10 23:26Z 分派的第三棟（條件和總圖相同）。和總圖用同一支腳本產生（`campus_hall.py`；總圖改用這支之後重建的 GLB 和交付的逐位元組相同）。

### 10.1 玩家會看到什麼不同

| | 修改前（程序化套件 `CK.hall`） | 修改後（Blender 正式模型） |
|---|---|---|
| 外牆 | 單色磚紋貼圖（米黃） | 米黃面磚（Poly Haven `exterior_wall_cladding_02`，真實比例，先降低彩度再校正成套件的顏色 `#cdb48e`），看得到磚縫與每塊磚的深淺 |
| 窗 | 貼在牆面上的薄片 | 牆上真的開出的拱形窗洞（石材窗框外凸、玻璃內凹 30 cm、窗台外凸）；傍晚以後約七成的窗亮暖光（由上往下漸暗） |
| 一樓拱廊 | 拱只有正面一片 | 13 個開間的拱都有拱腹、石材拱圈；面磚柱墩＋石材柱頭柱腳；轉角柱墩到二樓樓板 |
| 中央門廊 | 三拱、頂上正面一排欄杆柱 | 三拱（有拱腹、拱圈）、兩側實牆、檐部；頂上是**三面的陽台欄杆**（底座、欄杆柱、轉角大柱、扶手；套件只有正面一排） |
| 匾額 | 很大的「行政大樓」貼在門廊拱上方的石材上 | 刻在**門廊檐部正面**的石材匾額（canvas 字，和總圖、傅鐘同一套樣式；字高約 0.3 m，比套件的字小） |
| 簷口、屋頂 | 方塊收邊、四坡屋頂 | 三段線腳的簷口、簷底板、屋簷前緣；屋瓦（真實比例）、屋脊 |

**沒有改的東西**：位置、尺寸、朝向、樓層、開間（`CK.hall({w:46,d:16,floors:3,gfh:4.2,fh:3.4,…})`、`ckPlace(admin,-38,33,π)`）、導航阻擋、鏡頭碰撞、傅鐘廣場、長椅、樹、路燈。`zones3d.js` campus 區塊只加了：行政大樓的 `ckTag='admin'`、有模型時 `dyn`、區塊最後載入模型。

### 10.2 驗收狀態

| 項目 | 技術（A） | 功能（B） | 美術（C） |
|---|---|---|---|
| 行政大樓外觀（`bldg.campus_admin`） | 完成 | `FUNCTIONAL_VERIFIED`（見 10.4） | `READY_FOR_ART_REVIEW` |

### 10.3 製作方式與規格

- 參考：ART_DIRECTION（台大校舍語彙）、D23／D25（行政大樓在椰林大道南側、傅鐘後面、正面朝北）、套件 `CK.hall` 的參數。**沒有使用者提供的行政大樓照片**；是照套件的量體與台大校舍的共同特徵做的，不是照真實行政大樓一比一重建。
- Blender 5.2 `bpy`：`tools/blender/env_second/campus_hall.py -- --set admin` → `assets/models/env/second_ai/campus_admin.glb`：**0.92 MB**、11 個網格（每個材質一個）、**三角形 13,453**（套件 20,443；會投影的：套件 4,082、正式模型 3,898）、貼圖 512 px（WebP）、校園世界座標。
- 開間照套件的算法：正面 13 開間（每間 3.54 m，和門廊的 3 拱同奇偶，門廊兩側的牆剛好落在拱廊的柱子上）、側面 4 開間；拱廊深 2.6 m；門廊深 3.0 m、高 4.8 m。
- 面磚：和總圖同一張貼圖（真實比例），**先降低彩度（0.3）再校正成套件的米黃**——第一版直接校正，原圖的橘、褐、深色磚混在一起，近看太花。
- 匾額：拱頂上方到檐部只剩 0.6 m，放不下有框的匾額（會和拱圈石材重疊），所以刻在檐部正面：5.2×0.42 m、字高是板面的 0.72 倍（約 0.3 m）。第一版 4.4×0.36 m、字高 0.6 倍（約 0.22 m），和套件很大的招牌字比，遠看讀不出來（第一輪截圖），放大後重拍門廊、正面的截圖。

### 10.4 測試結果

測試都是 Playwright 手機模擬（不是 iPhone 實機）；log 在 `docs/art-rebuild/second_ai/test_logs/admin/`。

`campus_glb_integration` 43、`campus_layout_nav` 67、`see_through` 11、`p0_movement` 34、`reachability_all` 48、`zone_transitions` 37：**全部通過**（`campus_layout_nav` 含「行政大樓前（柱廊外）」站得住、「行政大樓建築內」不能走；`reachability_all`：全遊戲 11 個區域、139 個互動點）。`campus_glb_integration` 的外框檢查：{"kit": [-61.8, -0.0, 21.1, -14.2, 15.81, 41.8], "glb": [-61.8, 0, 21.1, -14.2, 15.87, 41.8]} 最大差 0.06 m。

`tools/dev_scratch/view_audit.py`（360° 盤點：行政大樓前、傅鐘旁長椅前、行政大樓西側）：正式模型 `shots/admin_audit/`、改之前（`?nobldg`）`shots/admin_audit_nobldg/`，沒有 JS 錯誤（例：行政大樓前）：

![行政大樓前 360°](shots/admin_audit/行政大樓前（柱廊外）.jpg)

**效能（同一個鏡頭三角形不能比現在多、draw call ≤ 現在的 +10%；藏起路人與騎腳踏車的路人、含陰影那一輪、含玩家）**：「改之前」＝進校園前把總圖、傅鐘、行政大樓的 key 都從 manifest 拿掉（三棟都是套件、照舊參加整區合併）。

| 鏡頭（17:30） | draw call：改之前 → 正式模型（倍數） | 三角形：改之前 → 正式模型（倍數） |
|---|---|---|
| 進校門往東看椰林大道 | 341 → 314（×0.921） | 971,604 → 953,384（×0.981） |
| 椰林大道後段往東（總圖） | 156 → 164（×1.051） | 771,736 → 756,839（×0.981） |
| 總圖前廣場 | 157 → 165（×1.051） | 768,936 → 754,039（×0.981） |
| 總圖門廊近看 | 148 → 156（×1.054） | 748,546 → 733,649（×0.98） |
| 總圖一樓拱廊裡 | 148 → 156（×1.054） | 756,526 → 741,629（×0.98） |
| 從椰林大道看傅鐘（後面是行政大樓） | 163 → 172（×1.055） | 772,880 → 759,966（×0.983） |
| 傅鐘近看 | 166 → 175（×1.054） | 825,704 → 812,790（×0.984） |
| 行政大樓：傅鐘廣場東側斜看正面 | 160 → 170（×1.062） | 825,654 → 812,764（×0.984） |
| 行政大樓一樓拱廊裡 | 244 → 261（×1.07） | 862,878 → 845,040（×0.979） |

測試本身這一輪修了兩件事（檢查標準不變）：
1. **建校園之前也要等資產載完**。路燈、腳踏車、長椅（街道道具）在**建校園的那一刻**有沒有載好，決定那一輪用正式模型還是合併過的套件（`W3.lampPost()`、`W3.bike()` 是同步建立的），之後再等也換不回來。AI-1 改成「兩輪都等資產全部載完再量」之後，這一輪的「改之前」還是在載好之前就建了校園：進校門鏡頭 297 → 358（×1.205，**FAIL**，`campus_glb_integration_fail_build_timing.log`）。改成建校園之前先等，並多一項檢查「兩輪的街道道具正式模型一樣多」（這一輪兩邊都是 57 個）之後 **PASS**。
2. **17:30 的截圖凍結遊戲時鐘**（`fast_shots.py`：拍照前讓玩家 busy，時鐘就不走）。17:30 剛好是路燈開關的時刻，畫面一慢、時鐘多走一點點，路燈和亮燈的窗就會打開：匾額放大後重拍的那幾張 17:30 窗都亮了，第一輪是暗的。17:30 的前後兩邊都用凍結時鐘重拍。

### 10.5 遊戲內截圖（修改前｜修改後；修改前＝同一版遊戲、只擋掉 `campus_admin.glb`，總圖、傅鐘兩邊都是正式模型）

| 鏡頭 | 修改前（程序化套件） | 修改後（Blender 正式模型） |
|---|---|---|
| 從椰林大道往南看（傅鐘後面） 11:00 | ![修改前](shots/admin_before_bell_axis_1100.webp) | ![修改後](shots/admin_after_bell_axis_1100.webp) |
| 從椰林大道往南看（傅鐘後面） 17:30 | ![修改前](shots/admin_before_bell_axis_1730.webp) | ![修改後](shots/admin_after_bell_axis_1730.webp) |
| 從椰林大道往南看（傅鐘後面） 20:30 | ![修改前](shots/admin_before_bell_axis_2030.webp) | ![修改後](shots/admin_after_bell_axis_2030.webp) |
| 傅鐘廣場東側斜看正面 11:00 | ![修改前](shots/admin_before_front_1100.webp) | ![修改後](shots/admin_after_front_1100.webp) |
| 傅鐘廣場東側斜看正面 17:30 | ![修改前](shots/admin_before_front_1730.webp) | ![修改後](shots/admin_after_front_1730.webp) |
| 傅鐘廣場東側斜看正面 20:30 | ![修改前](shots/admin_before_front_2030.webp) | ![修改後](shots/admin_after_front_2030.webp) |
| 門廊近看 11:00 | ![修改前](shots/admin_before_porch_1100.webp) | ![修改後](shots/admin_after_porch_1100.webp) |
| 門廊近看 17:30 | ![修改前](shots/admin_before_porch_1730.webp) | ![修改後](shots/admin_after_porch_1730.webp) |
| 門廊近看 20:30 | ![修改前](shots/admin_before_porch_2030.webp) | ![修改後](shots/admin_after_porch_2030.webp) |
| 一樓拱廊裡往東 11:00 | ![修改前](shots/admin_before_arcade_1100.webp) | ![修改後](shots/admin_after_arcade_1100.webp) |
| 一樓拱廊裡往東 17:30 | ![修改前](shots/admin_before_arcade_1730.webp) | ![修改後](shots/admin_after_arcade_1730.webp) |
| 一樓拱廊裡往東 20:30 | ![修改前](shots/admin_before_arcade_2030.webp) | ![修改後](shots/admin_after_arcade_2030.webp) |
| 玩家鏡頭（手機直向） 17:30 | ![修改前](shots/admin_before_follow_1730.webp) | ![修改後](shots/admin_after_follow_1730.webp) |

### 10.6 Blender 渲染圖（Cycles；匾額的字是遊戲裡用 canvas 畫的，所以這裡是空白板面；亮燈的窗只有遊戲的夜間才亮，這裡關掉自發光）

| 正面（從傅鐘那邊） | 斜看正面 | 門廊 |
|---|---|---|
| ![](blender_renders/admin_front.webp) | ![](blender_renders/admin_three_q.webp) | ![](blender_renders/admin_porch.webp) |

| 一樓拱廊 | 背面 |
|---|---|
| ![](blender_renders/admin_arcade.webp) | ![](blender_renders/admin_back.webp) |

### 10.7 還沒達到參考品質的地方

1. **不是照真實行政大樓重建**：沒有照片，量體照套件；真實的行政大樓（舊台北帝國大學本部）的立面、門廊、開窗比例不同，有照片可以照照片改（位置、導航不用動）。
2. 和總圖用同一套零件（窗、拱廊、簷口），兩棟的差別主要在比例、顏色與門廊頂（山牆／陽台欄杆）；真實校園每棟的細部都不一樣。
3. 窗裡面是一片深色玻璃（亮燈時是由上往下漸暗的暖光），沒有窗簾或室內的景深。
4. 沒有 iPhone 實機驗證；效能用 `renderer.info` 量（見 10.4）。

---

## 11. 校園地標④：文學院、校史館（椰林大道北側）

LAWWW 2026-10-10 23:26Z 分派的第四項（兩棟一起交，條件和總圖相同）。和總圖、行政大樓用同一支腳本產生（`campus_hall.py --set arts／hist`；加新零件之後先確認總圖、行政大樓重建的 GLB 和交付的逐位元組相同；之後為了五個地標一起看得到時的 draw call，四棟一起換了材質重建，見 11.3）。

### 11.1 玩家會看到什麼不同

| | 修改前（程序化套件 `CK.hall`） | 修改後（Blender 正式模型） |
|---|---|---|
| 外牆 | 單色磚紋貼圖 | 紅褐面磚（Poly Haven `exterior_wall_cladding_02`，真實比例，校正成套件的顏色：文學院 `#9b5a42`、校史館 `#a25d43`），看得到磚縫與每塊磚的深淺 |
| 窗 | 貼在牆面上的薄片 | 牆上真的開出的拱形窗洞（石材窗框外凸、玻璃內凹 30 cm、窗台外凸）；傍晚以後約七成的窗亮暖光（由上往下漸暗） |
| 一樓拱廊 | 拱只有正面一片 | 每個開間的拱都有拱腹、石材拱圈；面磚柱墩＋石材柱頭柱腳；轉角柱墩到二樓樓板（文學院 11 開間、校史館 7 開間） |
| 中央門廊 | 三拱、方柱、山牆是一塊三角形 | 三拱（有拱腹、拱圈）、兩側實牆、檐部、山牆斜邊的線腳；**山牆中間的牛眼窗**（石材圓框＋深色玻璃＋十字窗櫺）；**校史館門廊是圓石柱**（方形柱礎、圓柱身、喇叭形柱頭，照套件註解「紅磚拱窗、圓石柱」） |
| 匾額 | 很大的字貼在中央拱上方 | 文學院：刻在門廊檐部正面（中央拱上方到檐部只剩 0.67 m，放不下有框的匾額）；校史館：中央拱上方的石框匾額（拱頂到檐部有 0.98 m）。canvas 字，和總圖、傅鐘、行政大樓同一套樣式 |
| 簷口、屋頂 | 方塊收邊、四坡屋頂 | 三段線腳的簷口、簷底板、屋簷前緣；屋瓦（真實比例）、屋脊 |

**沒有改的東西**：位置、尺寸、朝向、樓層、開間（`CK.hall` 的參數、`ckPlace(arts,-38,-34,0)`、`ckPlace(hist,-77,-29,0)`）、導航阻擋、鏡頭碰撞、門口互動點、往文學院的步道、樹、路燈。`zones3d.js` campus 區塊只加了：兩棟的 `ckTag`（`arts`、`hist`）、有模型時 `dyn`、區塊最後載入模型。

### 11.2 驗收狀態

| 項目 | 技術（A） | 功能（B） | 美術（C） |
|---|---|---|---|
| 文學院外觀（`bldg.campus_arts`） | 完成 | `FUNCTIONAL_VERIFIED`（見 11.4） | `READY_FOR_ART_REVIEW` |
| 校史館外觀（`bldg.campus_hist`） | 完成 | `FUNCTIONAL_VERIFIED`（見 11.4） | `READY_FOR_ART_REVIEW` |

### 11.3 製作方式與規格

- 參考：ART_DIRECTION（台大校舍語彙）、D23／D25（兩棟在椰林大道北側、正面朝南；校史館靠近大門）、套件 `CK.hall` 的參數與註解（文學院「仿羅馬式拱窗」、校史館「紅磚拱窗、圓石柱、屋瓦」）。**沒有使用者提供的文學院、校史館照片**；是照套件的量體與台大校舍的共同特徵做的，不是照真實建築一比一重建。
- Blender 5.2 `bpy`：`tools/blender/env_second/campus_hall.py -- --set arts／hist` → `assets/models/env/second_ai/campus_arts.glb`（文學院）：**0.65 MB**、9 個網格（每個材質一個）、**三角形 8,776**（套件 13,397；會投影的：套件 3,306、正式模型 2,633）；`assets/models/env/second_ai/campus_hist.glb`（校史館）：**0.51 MB**、9 個網格（每個材質一個）、**三角形 6,354**（套件 9,105；會投影的：套件 2,314、正式模型 2,111）；貼圖 512 px（WebP）、校園世界座標。
- 開間照套件的算法：文學院正面 11 開間（每間 3.64 m）、側面 5 開間；校史館正面 7 開間（每間 3.43 m；套件把 6 改成 7，和門廊的 3 拱同奇偶）、側面 4 開間；拱廊深 2.6 m；門廊深 3.0／2.6 m、山牆高 1.8／1.6 m。
- **draw call 減量（五個地標一起）**：第一次整合測試在進校門鏡頭（五個地標都看得到）超過 +10%。改了三件事：①大門併進深色木作材質（`ck_frame` 改用 Poly Haven `dark_wood` 木紋：窗框、直櫺、大門、門把、屋脊；原本大門自己一個材質、只有 2 個三角形，窗框是純色）；②拱廊天花板、簷底板（`ck_ceiling`）與勒腳、地坪（`ck_stone_base`）不投影（都在屋頂的影子裡或貼地，畫面上看不出差別）；③亮燈的窗、沒亮燈的窗合成同一個玻璃材質（`ck_glass`）：自發光貼圖 64×64 左半黑、右半是由上往下漸暗的燈光，每扇窗的 UV 決定亮不亮（取樣點離黑白交界 24 個像素，避開 WebP 壓縮的漣漪；遊戲端這張貼圖不用 mipmap，遠處不會混色）。每棟少 4 次 draw call（材質 11 → 9、投影 5 → 3）。**總圖、行政大樓的 GLB 也一起重建**（幾何、三角形數不變；窗框和大門的材質、玻璃合併）。
- 這一版新加的零件（`campus_hall.py` 的選項，總圖、行政大樓不受影響）：山牆的牛眼窗（`oculus`：石材圓框外凸 7 cm、深色玻璃、十字窗櫺）、門廊的圓石柱（`cols='round'`：0.8 m 方形柱礎、柱腳圓盤、直徑 0.6 m 的柱身往上稍微收分、喇叭形柱頭，平滑著色；上面照舊是方形拱墩，導航阻擋照舊是套件的 0.9 m 方形，柱子在裡面）、中央拱上方匾額的石框高度（`bh`：校史館 0.8 m）。

### 11.4 測試結果

測試都是 Playwright 手機模擬（不是 iPhone 實機）；log 在 `docs/art-rebuild/second_ai/test_logs/arthist/`。測試前 merge 了 AI-1 開發分支的 `c296d70`（萬才館室內兩層樓、走樓梯引擎修正）；交付前再 merge 最新的 `2c0cbc1`——遊戲程式和 `c296d70`＋這次的修改完全相同，只有 `reachability_all` 改成照出生點的樓層檢查出入口的到達點（AI-1 `2e2cd32`）：merge 前那一次在萬才館二樓的兩個到達點 FAIL（AI-1 新開的二樓門在第 1 層，舊測試一律在第 0 層檢查；不是這次的修改造成的），merge 後重跑 ALL PASS。

`campus_glb_integration` 56、`campus_layout_nav` 67、`see_through` 11、`p0_movement` 34、`reachability_all` 48、`zone_transitions` 37：**全部通過**（`reachability_all`：全遊戲的互動點都走得到）。`campus_glb_integration` 的外框檢查：文學院 {"kit": [-58.8, -0.0, -43.8, -17.2, 14.61, -21.1], "glb": [-58.8, 0, -43.8, -17.2, 14.67, -21.1]} 最大差 0.06 m；校史館 {"kit": [-89.8, -0.0, -37.8, -64.2, 14.61, -17.5], "glb": [-89.8, 0, -37.8, -64.2, 14.67, -17.5]} 最大差 0.06 m。

`tools/dev_scratch/view_audit.py`（360° 盤點：文學院前、文學院與校史館之間的草地、校史館前）：正式模型 `shots/arthist_audit/`、改之前（`?nobldg`）`shots/arthist_audit_nobldg/`，沒有 JS 錯誤（例：校史館前）：

![校史館前 360°](shots/arthist_audit/校史館前（門廊外）.jpg)

測試本身這一輪修了兩件事（檢查標準不變，兩件都是量測方法）：
1. **量測前凍結遊戲時鐘在 17:30**。17:30 剛好是路燈開關的門檻（時段表的值＝0.5，大於 0.5 才開），引擎每 5 格才套用一次時段，時鐘在跑的話量的那一刻路燈可能開也可能關——22 盞路燈的光暈＋地面光圈＝44 次 draw call。第一次跑的時候「改之前」的進校門鏡頭是 297（路燈關）、正式模型是 377（路燈開），除錯腳本在同一版本連量兩次「改之前」都是 341（log：`test_logs/arthist/campus_glb_integration_fail_round1.log`、`gate_diff.json`）。之前 297／331／341 不穩定的另一半原因也是這個。凍結後兩輪都是「路燈剛好還沒開」的同一個狀態（比較嚴格：沒有 44 個光暈稀釋倍數）。
2. **「沒有多藏任何一個群組」改數「被藏起來」的群組**（底下有網格、但一個都看不到），不數「整區靜態合併後變成空的」群組。第一次跑的時候「改之前」225、正式模型 224：多出來的是 (2,33) 的無名系館——地標有正式模型時不參加合併，它和地標共用的材質只剩一個網格、沒有合併，兩邊都畫得出來，不是被藏起來。新加自我檢查：故意把一個沒有標記的群組藏起來，數字會多一。

**效能（同一個鏡頭三角形不能比現在多、draw call ≤ 現在的 +10%；藏起路人與騎腳踏車的路人、含陰影那一輪、含玩家）**：「改之前」＝進校園前把五個地標（總圖、傅鐘、行政大樓、文學院、校史館）的 key 都從 manifest 拿掉（都是套件、照舊參加整區合併）。

| 鏡頭（17:30） | draw call：改之前 → 正式模型（倍數） | 三角形：改之前 → 正式模型（倍數） |
|---|---|---|
| 進校門往東看椰林大道 | 297 → 323（×1.088） | 971,222 → 941,008（×0.969） |
| 椰林大道後段往東（總圖） | 152 → 157（×1.033） | 771,700 → 747,977（×0.969） |
| 總圖前廣場 | 157 → 161（×1.025） | 768,936 → 745,189（×0.969） |
| 總圖門廊近看 | 148 → 152（×1.027） | 748,546 → 724,799（×0.968） |
| 總圖一樓拱廊裡 | 148 → 152（×1.027） | 756,526 → 732,779（×0.969） |
| 從椰林大道看傅鐘 | 159 → 164（×1.031） | 772,858 → 733,122（×0.949） |
| 傅鐘近看 | 162 → 165（×1.019） | 825,682 → 785,242（×0.951） |
| 行政大樓正面 | 160 → 164（×1.025） | 825,654 → 785,238（×0.951） |
| 行政大樓一樓拱廊裡 | 220 → 231（×1.05） | 862,676 → 818,016（×0.948） |
| 文學院：從椰林大道北側斜看正面 | 167 → 180（×1.078） | 806,174 → 782,971（×0.971） |
| 文學院一樓拱廊裡 | 241 → 255（×1.058） | 884,038 → 850,943（×0.963） |
| 校史館：從椰林大道北側斜看正面 | 152 → 163（×1.072） | 804,136 → 780,444（×0.971） |
| 校史館門廊近看 | 151 → 156（×1.033） | 804,134 → 772,157（×0.96） |

### 11.5 遊戲內截圖（修改前｜修改後；修改前＝同一版遊戲、只擋掉 `campus_arts.glb`、`campus_hist.glb`，總圖、傅鐘、行政大樓兩邊都是正式模型；17:30 凍結遊戲時鐘）

| 鏡頭 | 修改前（程序化套件） | 修改後（Blender 正式模型） |
|---|---|---|
| 文學院：從椰林大道往北看 11:00 | ![修改前](shots/arthist_before_arts_avenue_1100.webp) | ![修改後](shots/arthist_after_arts_avenue_1100.webp) |
| 文學院：從椰林大道往北看 17:30 | ![修改前](shots/arthist_before_arts_avenue_1730.webp) | ![修改後](shots/arthist_after_arts_avenue_1730.webp) |
| 文學院：從椰林大道往北看 20:30 | ![修改前](shots/arthist_before_arts_avenue_2030.webp) | ![修改後](shots/arthist_after_arts_avenue_2030.webp) |
| 文學院：斜看正面 11:00 | ![修改前](shots/arthist_before_arts_front_1100.webp) | ![修改後](shots/arthist_after_arts_front_1100.webp) |
| 文學院：斜看正面 17:30 | ![修改前](shots/arthist_before_arts_front_1730.webp) | ![修改後](shots/arthist_after_arts_front_1730.webp) |
| 文學院：斜看正面 20:30 | ![修改前](shots/arthist_before_arts_front_2030.webp) | ![修改後](shots/arthist_after_arts_front_2030.webp) |
| 文學院：門廊近看 11:00 | ![修改前](shots/arthist_before_arts_porch_1100.webp) | ![修改後](shots/arthist_after_arts_porch_1100.webp) |
| 文學院：門廊近看 17:30 | ![修改前](shots/arthist_before_arts_porch_1730.webp) | ![修改後](shots/arthist_after_arts_porch_1730.webp) |
| 文學院：門廊近看 20:30 | ![修改前](shots/arthist_before_arts_porch_2030.webp) | ![修改後](shots/arthist_after_arts_porch_2030.webp) |
| 文學院：一樓拱廊裡往東 11:00 | ![修改前](shots/arthist_before_arts_arcade_1100.webp) | ![修改後](shots/arthist_after_arts_arcade_1100.webp) |
| 文學院：一樓拱廊裡往東 17:30 | ![修改前](shots/arthist_before_arts_arcade_1730.webp) | ![修改後](shots/arthist_after_arts_arcade_1730.webp) |
| 文學院：一樓拱廊裡往東 20:30 | ![修改前](shots/arthist_before_arts_arcade_2030.webp) | ![修改後](shots/arthist_after_arts_arcade_2030.webp) |
| 校史館：從椰林大道往北看 11:00 | ![修改前](shots/arthist_before_hist_avenue_1100.webp) | ![修改後](shots/arthist_after_hist_avenue_1100.webp) |
| 校史館：從椰林大道往北看 17:30 | ![修改前](shots/arthist_before_hist_avenue_1730.webp) | ![修改後](shots/arthist_after_hist_avenue_1730.webp) |
| 校史館：從椰林大道往北看 20:30 | ![修改前](shots/arthist_before_hist_avenue_2030.webp) | ![修改後](shots/arthist_after_hist_avenue_2030.webp) |
| 校史館：斜看正面 11:00 | ![修改前](shots/arthist_before_hist_front_1100.webp) | ![修改後](shots/arthist_after_hist_front_1100.webp) |
| 校史館：斜看正面 17:30 | ![修改前](shots/arthist_before_hist_front_1730.webp) | ![修改後](shots/arthist_after_hist_front_1730.webp) |
| 校史館：斜看正面 20:30 | ![修改前](shots/arthist_before_hist_front_2030.webp) | ![修改後](shots/arthist_after_hist_front_2030.webp) |
| 校史館：門廊近看（圓石柱） 11:00 | ![修改前](shots/arthist_before_hist_porch_1100.webp) | ![修改後](shots/arthist_after_hist_porch_1100.webp) |
| 校史館：門廊近看（圓石柱） 17:30 | ![修改前](shots/arthist_before_hist_porch_1730.webp) | ![修改後](shots/arthist_after_hist_porch_1730.webp) |
| 校史館：門廊近看（圓石柱） 20:30 | ![修改前](shots/arthist_before_hist_porch_2030.webp) | ![修改後](shots/arthist_after_hist_porch_2030.webp) |
| 校史館：一樓拱廊裡往東 11:00 | ![修改前](shots/arthist_before_hist_arcade_1100.webp) | ![修改後](shots/arthist_after_hist_arcade_1100.webp) |
| 校史館：一樓拱廊裡往東 17:30 | ![修改前](shots/arthist_before_hist_arcade_1730.webp) | ![修改後](shots/arthist_after_hist_arcade_1730.webp) |
| 校史館：一樓拱廊裡往東 20:30 | ![修改前](shots/arthist_before_hist_arcade_2030.webp) | ![修改後](shots/arthist_after_hist_arcade_2030.webp) |
| 文學院：玩家鏡頭（手機直向） 17:30 | ![修改前](shots/arthist_before_arts_follow_1730.webp) | ![修改後](shots/arthist_after_arts_follow_1730.webp) |
| 校史館：玩家鏡頭（手機直向） 17:30 | ![修改前](shots/arthist_before_hist_follow_1730.webp) | ![修改後](shots/arthist_after_hist_follow_1730.webp) |

### 11.6 Blender 渲染圖（Cycles；匾額的字是遊戲裡用 canvas 畫的，所以這裡是空白板面；亮燈的窗只有遊戲的夜間才亮，這裡關掉自發光）

文學院：

| 正面 | 斜看正面 | 門廊（山牆的牛眼窗） |
|---|---|---|
| ![](blender_renders/arts_front.webp) | ![](blender_renders/arts_three_q.webp) | ![](blender_renders/arts_porch.webp) |

| 一樓拱廊 | 背面 |
|---|---|
| ![](blender_renders/arts_arcade.webp) | ![](blender_renders/arts_back.webp) |

校史館：

| 正面 | 斜看正面 | 門廊（圓石柱、拱上方的匾額） |
|---|---|---|
| ![](blender_renders/hist_front.webp) | ![](blender_renders/hist_three_q.webp) | ![](blender_renders/hist_porch.webp) |

| 一樓拱廊 | 背面 |
|---|---|
| ![](blender_renders/hist_arcade.webp) | ![](blender_renders/hist_back.webp) |

### 11.7 還沒達到參考品質的地方

1. **不是照真實建築重建**：沒有照片，量體照套件；真實的文學院（中庭、長向立面）、校史館（舊總圖：正面的開窗與門廊）比例和細部都不同，有照片可以照照片改（位置、導航不用動）。
2. 四棟（總圖、行政大樓、文學院、校史館）用同一套零件（窗、拱廊、簷口），差別在比例、顏色、門廊頂（山牆／陽台欄杆）、牛眼窗、圓石柱；真實校園每棟的細部都不一樣。
3. 門廊的山牆在二樓窗戶前面，從正面看中間三扇窗被山牆擋住一部分（套件的量體就是這樣；斜看是自然的）。
4. 窗裡面是一片深色玻璃（亮燈時是由上往下漸暗的暖光），沒有窗簾或室內的景深。
5. 沒有 iPhone 實機驗證；效能用 `renderer.info` 量（見 11.4）。

---

## 12. 公館機車：換成 Blender 正式模型（分組 InstancedMesh，⑧）

LAWWW 2026-10-11 03:47Z 排進佇列的 ⑧：公館 60 台機車換成溫州街已經在用的 Blender 正式模型（`bldg.wz_scooter`：現代款、復古款），**每 6～9 台一組各自一套 InstancedMesh**，看不到的那一組整組不畫；目標同一個鏡頭三角形 ≤ 42 萬。校門外背景（校園那一側看出去的公館，`campusBackdrop`）照樣是套件。

### 12.1 玩家會看到什麼不同

| | 修改前（套件 `TK.scooter`） | 修改後（Blender 正式模型） |
|---|---|---|
| 機車 | 擠出的車殼＋方塊座墊、圓環輪胎 | 溫州街同兩款 125cc 速克達（現代款、復古款，三台裡一台復古款）：車殼曲面、座墊、腳踏板、後照鏡、車燈；車殼顏色每台不同 |
| 顏色 | 只有白、藍、灰藍 3 種（套件的配色公式 `round(x*7)%7` 每排都是 0） | 7 種顏色輪流（白、黑、酒紅、藍、奶茶、米白、灰藍；套件和正式模型讀同一個配色，`?nobldg` 也一起變） |
| 影子 | 每台車進陰影那一輪 | 不進陰影那一輪（60 台×1.4–1.7k 個三角形要再畫一次），每台車底下一片柔和的影子貼片（和溫州街相同） |

**沒有改的東西**：每台車的位置、方向、台數、導航阻擋（`nav.blockRect` 照舊）、路燈、行道樹、店面。

### 12.2 驗收狀態

| 項目 | 技術（A） | 功能（B） | 美術（C） |
|---|---|---|---|
| 公館機車（`bldg.wz_scooter` 分組 InstancedMesh） | 完成 | `FUNCTIONAL_VERIFIED`（見 12.4） | `READY_FOR_ART_REVIEW`（模型本身和溫州街相同，溫州街那邊已經是 READY_FOR_ART_REVIEW） |

### 12.3 做法

- `zones3d.js` gongguan 區塊：有模型時套件機車先放進 `gg_kit_scooters` 群組、自己合併（載入前 draw call 少）；載入後整組藏起來，換成 `attachWzScooters(..., 'gg_scooters_glb')`。每台車記下所屬的組（`grp`：北側人行道 N0–N4、南側店面街 S0–S2，照 x 分段，每組 6～9 台）。
- `attachWzScooters`：list 裡有 `grp` 時每一組各自建一套 InstancedMesh（兩款×3 個零件），每一組自己的外框球（`computeBoundingSphere`），three.js 的視錐剔除就會整組不畫；溫州街沒有 `grp`＝全部一組，和分組之前完全相同。
- 每組最多 6 次 draw call（兩款×3 個零件），影子貼片全部一次。

### 12.4 測試結果

測試都是 Playwright 手機模擬（不是 iPhone 實機）；log 在 `docs/art-rebuild/second_ai/test_logs/ggsc/`。

`gongguan_glb_integration` 39、`gongguan_layout_nav` 46、`wz_street_integration` 42、`p0_movement` 34、`reachability_all` 48、`zone_transitions` 37、`ggsc_perf`（修改前後的效能，見下表）：**全部通過**（`wz_street_integration`：溫州街的機車也走同一個函式，沒有分組時和之前一樣）。

機車檢查（`gongguan_glb_integration`）：{"kitScooters": 60, "kitHidden": true, "paintInstances": 60, "perGroup": {"N0": 6, "N1": 6, "N2": 8, "N3": 7, "N4": 9, "S0": 6, "S1": 9, "S2": 9}, "colors": 7, "castShadow": false}。第一次跑的時候「車殼至少 5 種顏色」FAIL（`gongguan_glb_integration_fail_round1.log`：只有 3 種）——查到是套件原本的配色公式只會算出 3 種，改成 7 種輪流後 PASS。

**效能：修改前 → 修改後（`tools/blender/env_second/shots/ggsc_perf.py`：修改前＝上一版的遊戲，機車是套件、併進整區合併；兩邊都在建公館之前等資產全部載完，藏起路人與騎腳踏車的路人、含陰影那一輪、含玩家）**：

| 鏡頭（17:30） | draw call：修改前 → 修改後（倍數） | 三角形：修改前 → 修改後（倍數） | 這個鏡頭畫到的機車組 |
|---|---|---|---|
| 人行道往西看整排店面 | 171 → 174（×1.018） | 369,494 → 276,014（×0.747） | S0、S1（共 8 組） |
| 校門口往南看過羅斯福路 | 180 → 191（×1.061） | 369,592 → 297,500（×0.805） | N2、S0、S1、S2（共 8 組） |
| 騎樓裡往西 | 171 → 174（×1.018） | 369,480 → 276,000（×0.747） | S0、S1（共 8 組） |
| 往溫州街的巷口 | 145 → 135（×0.931） | 365,126 → 249,326（×0.683） | 一組都沒有（共 8 組） |
| 北側人行道邊的一排機車（近看） | 148 → 150（×1.014） | 389,008 → 290,828（×0.748） | — |
| 店面街人行道上的一排機車（近看） | 145 → 147（×1.014） | 365,084 → 266,904（×0.731） | — |

和 `?nobldg`（全部程序化）比（`gongguan_glb_integration`，LAWWW 21:21Z 的條件：draw call ≤ 1.3 倍、三角形 ≤ 42 萬）：

| 鏡頭（17:30） | draw call：`?nobldg` → 一般 | 三角形（一般，≤ 42 萬） |
|---|---|---|
| 人行道往西看整排店面 | 183 → 197（×1.077） | 309,248 |
| 校門口往南看過羅斯福路 | 192 → 213（×1.109） | 329,300 |
| 騎樓裡往西 | 183 → 202（×1.104） | 309,286 |
| 往溫州街的巷口 | 150 → 157（×1.047） | 281,126 |

### 12.5 遊戲內截圖（修改前｜修改後；修改前＝同一版遊戲、只擋掉 `scooter.glb`：機車是套件，顏色已經是新的 7 種）

| 鏡頭 | 修改前（套件機車） | 修改後（Blender 正式模型） |
|---|---|---|
| 北側人行道邊的機車（近看） 11:00 | ![修改前](shots/ggsc_before_north_row_1100.webp) | ![修改後](shots/ggsc_after_north_row_1100.webp) |
| 北側人行道邊的機車（近看） 17:30 | ![修改前](shots/ggsc_before_north_row_1730.webp) | ![修改後](shots/ggsc_after_north_row_1730.webp) |
| 北側人行道邊的機車（近看） 20:30 | ![修改前](shots/ggsc_before_north_row_2030.webp) | ![修改後](shots/ggsc_after_north_row_2030.webp) |
| 店面街人行道上的機車（近看） 11:00 | ![修改前](shots/ggsc_before_south_row_1100.webp) | ![修改後](shots/ggsc_after_south_row_1100.webp) |
| 店面街人行道上的機車（近看） 17:30 | ![修改前](shots/ggsc_before_south_row_1730.webp) | ![修改後](shots/ggsc_after_south_row_1730.webp) |
| 店面街人行道上的機車（近看） 20:30 | ![修改前](shots/ggsc_before_south_row_2030.webp) | ![修改後](shots/ggsc_after_south_row_2030.webp) |
| 人行道往西看整排店面 11:00 | ![修改前](shots/ggsc_before_street_west_1100.webp) | ![修改後](shots/ggsc_after_street_west_1100.webp) |
| 人行道往西看整排店面 17:30 | ![修改前](shots/ggsc_before_street_west_1730.webp) | ![修改後](shots/ggsc_after_street_west_1730.webp) |
| 人行道往西看整排店面 20:30 | ![修改前](shots/ggsc_before_street_west_2030.webp) | ![修改後](shots/ggsc_after_street_west_2030.webp) |
| 校門口往南看過羅斯福路 11:00 | ![修改前](shots/ggsc_before_from_gate_1100.webp) | ![修改後](shots/ggsc_after_from_gate_1100.webp) |
| 校門口往南看過羅斯福路 17:30 | ![修改前](shots/ggsc_before_from_gate_1730.webp) | ![修改後](shots/ggsc_after_from_gate_1730.webp) |
| 校門口往南看過羅斯福路 20:30 | ![修改前](shots/ggsc_before_from_gate_2030.webp) | ![修改後](shots/ggsc_after_from_gate_2030.webp) |
| 玩家鏡頭（手機直向） 17:30 | ![修改前](shots/ggsc_before_follow_1730.webp) | ![修改後](shots/ggsc_after_follow_1730.webp) |

### 12.6 還沒達到參考品質的地方

1. 只有兩款車（溫州街同一套），真實的公館還有檔車、外送箱、安全帽掛在車上、雨衣；60 台看久了會發現重複。
2. 每台車的擺放和角度照套件（三台一排、規律的間距），真實的騎樓前停車更亂、更擠。
3. 校門外背景（`campusBackdrop`）的機車還是套件（LAWWW 03:47Z：照樣用套件）。
4. 沒有 iPhone 實機驗證；效能用 `renderer.info` 量。

---

## 13. 校園⑤：農業陳列館（洞洞館）、社會科學院

LAWWW 23:26Z 佇列的後備 ⑤（兩棟一起交，條件和總圖相同）。兩棟都是新的 Blender 腳本：`campus_pavilion.py`（洞洞館，套件 `CK.pavilion`）、`campus_modern.py`（社科院，套件 `CK.modern`）。**材質壓到最少**：進校門鏡頭五個地標加起來已經是改之前的 1.088 倍（上限 1.1）。

### 13.1 玩家會看到什麼不同

| | 修改前（程序化套件） | 修改後（Blender 正式模型） |
|---|---|---|
| 洞洞館的鏤空牆 | 一張畫了深色圓點的貼圖貼在方塊上 | **真的鏤空**：圓洞用貼圖的透明度挖掉（洞的直徑 0.24 m、間距 0.4 m，四面共約 2,000 個洞），前後兩層相隔 0.12 m（斜看時前後兩層的洞錯開，看得出筒狀的厚度）；洞的後面是二樓的牆（深色），白天從洞裡看進去是暗的、晚上照房間透出暖光；陽光穿過洞口，影子一點一點的 |
| 洞洞館一樓 | 牆上貼玻璃片、方柱；**入口正中間有一根柱子**，擋住門和匾額（套件的柱距公式剛好算出 x=0 一根） | 往內退的玻璃帷幕（每格 1.57 m、深色直櫺與橫框、亮燈的窗晚上由上往下漸暗）、方柱（入口正前方那一根拿掉：整棟的佔地本來就是導航阻擋，走路不受影響）、石材門框＋玻璃雙開門＋匾額「農業陳列館」 |
| 社科院的長窗 | 貼在牆面上的玻璃片＋框 | 牆上真的開出的帶狀長窗（內凹 25 cm、看得到窗洞內側）、深灰鋁框分格（約 1.4 m） |
| 社科院的量體 | 方塊＋白線 | 外凸 15 cm 的樓板邊（白色水平線）、外挑 0.6 m 的薄簷＋女兒牆、往內退 1.2 m 的玻璃大廳（看得到大廳的天花板與兩端的實牆）、玻璃雙開門、薄雨遮、匾額「社會科學院」（石材匾額樣式：細的內框、刻字一樣的大字，和洞洞館、總圖同一種） |
| 牆面 | 程序化粉刷貼圖 | Poly Haven `painted_plaster_wall`（平整的漆面粉刷，降低彩度、校正成套件的米白；`white_plaster_02` 試過，斑駁太重、白牆看起來髒） |

**沒有改的東西**：位置、尺寸、朝向、樓層（`CK.pavilion({w:22,d:14,gfh:4.0,h:9})`／`ckPlace(hole,-104,-30,0)`、`CK.modern({w:56,d:22,floors:4,gfh:4.4,fh:3.85})`／`ckPlace(soc,110,-70,-π/2)`）、導航阻擋（兩棟都是整個佔地）、鏡頭碰撞、社科院門前的白色樹狀柱（AI-1 的）、校門外背景裡的洞洞館（`campusBackdrop`，維持套件）。`zones3d.js` campus 區塊只加了兩棟的 `ckTag`（`pavilion`、`soc`）、有模型時 `dyn`、區塊最後載入模型。

### 13.2 驗收狀態

| 項目 | 技術（A） | 功能（B） | 美術（C） |
|---|---|---|---|
| 洞洞館外觀（`bldg.campus_pavilion`） | 完成 | `FUNCTIONAL_VERIFIED`（見 13.4） | `READY_FOR_ART_REVIEW` |
| 社科院外觀（`bldg.campus_modern`） | 完成 | `FUNCTIONAL_VERIFIED`（見 13.4） | `READY_FOR_ART_REVIEW` |

### 13.3 製作方式與規格

- 參考：ART_DIRECTION、D23／D25（洞洞館在校門東北、椰林大道北側；社科院在法學院廣場東側、正面朝西）、套件 `CK.pavilion`、`CK.modern` 的參數與註解。**沒有使用者提供的洞洞館、社科院照片**；是照套件的量體做的，不是照真實建築一比一重建（真實的洞洞館是張肇康設計的陶管鏤空牆，真實的社科院不是這個樣子）。
- Blender 5.2 `bpy`：`assets/models/env/second_ai/campus_pavilion.glb`（洞洞館）：**0.14 MB**、5 個網格（每個材質一個）、**三角形 968**（套件 378；會投影的：套件 300、正式模型 334）；`assets/models/env/second_ai/campus_modern.glb`（社科院）：**0.17 MB**、4 個網格（每個材質一個）、**三角形 1,968**（套件 5,392；會投影的：套件 180、正式模型 412）；貼圖 512 px（WebP）、校園世界座標。
- 洞洞館的材質：`ck_pav_conc`（結構：柱、樓板邊、屋簷、牆、台階）、`ck_pav_screen`（鏤空牆：RGBA 貼圖 512×512＝2.4 m×2.4 m、6×6 個洞，alphaMode MASK，兩面都畫）、`ck_pav_dark`（二樓內牆、窗框、門框、屋頂防水層：自發光貼圖左半黑、右半暖光，每 2.4 m 一段照「房間」亮或不亮，約七成）、`ck_glass`（和總圖同名＝遊戲端同一套夜間設定）、匾額。社科院：`ck_soc_wall`、`ck_soc_metal`、`ck_glass`、匾額。
- 遊戲端：`ck_pav_dark` 加進 WZ_NIGHT（晚上 0.9）、WZ_NO_SHADOW、和 `ck_glass` 一樣自發光貼圖不用 mipmap；`ck_soc_metal` 不投影。
- 遊戲端（共用）：字牌合成 atlas 的 `wzAtlasFaces`（溫州街、公館的招牌、校園地標的匾額都用它）——空白處填所有字牌的平均顏色、每一格往外多畫 2 px，縮小取樣（mipmap）時不會混到黑色；最寬的字牌只比 2 的次方寬一點點（≤ 12%）時全部等比例縮小，atlas 寬度少一半。

### 13.4 測試結果

測試都是 Playwright 手機模擬（不是 iPhone 實機）；log 在 `docs/art-rebuild/second_ai/test_logs/pavsoc/`。

**截圖檢查發現兩個問題，改完重跑**（測試本身每一輪都通過——這兩個問題測試抓不到，是看截圖發現的；第一輪的 log 在 `test_logs/pavsoc/round1/`）：
1. 洞洞館入口正中間有一根柱子，擋住門和匾額中間兩個字（套件也有這根柱子，只是套件的匾額比較大、比較前面，只擋掉一個字）→ 入口正前方不放柱子（第二輪）。
2. 社科院的匾額在遊戲裡是一條黑帶。第二輪先以為是字牌 atlas 只有一角有字、其他是黑色空白、縮小取樣（mipmap）混成黑色 → 改了 `wzAtlasFaces`（見 13.3；這個改法本身是對的，遠看的字牌不會再混到黑色，所以留著），**但重拍還是黑的**；第三輪正面拍近照才查到真正原因：社科院的匾額用的是「門牌」樣式，外框寬度照板面「寬度」的 4% 算，6 m 寬的匾額外框粗到把整塊蓋成深色 → 改成和洞洞館、總圖一樣的石材匾額樣式（`serif`，細的內框），重新匯出 `campus_modern.glb`。

重跑：第二輪 `campus_glb_integration`、`wz_street_integration`、`gongguan_glb_integration`（atlas 是共用的）、全部前後截圖；第三輪 `campus_glb_integration`、社科院的「修改後」截圖。導航相關的（`campus_layout_nav`、`see_through`、`p0_movement`、`reachability_all`、`zone_transitions`）是第一輪的結果——三個修正都只改畫面（模型的一根柱子、字牌貼圖、匾額樣式），導航格、碰撞、互動點不變（`campus_glb_integration` 每一輪都檢查兩棟的導航、碰撞、互動點和改之前完全相同）；合併 AI-1 最新開發分支之後，和 ⑥ 一起再跑一次完整回歸（見第 14 節）。

`campus_glb_integration` 66、`wz_street_integration` 42、`gongguan_glb_integration` 39、`campus_layout_nav` 67、`see_through` 11、`p0_movement` 34、`reachability_all` 48、`zone_transitions` 37：**全部通過**。`campus_glb_integration` 新加的檢查：洞洞館鏤空牆是 alphaTest（不是半透明）、兩面都畫、會投影；鏤空牆後面的房間 20:30 透出暖光、11:00 不發光、不投影；兩棟的玻璃和總圖同一套（約七成亮燈）。外框檢查：洞洞館 {"kit": [-116.1, -0.0, -38.1, -91.9, 9.44, -21.9], "glb": [-116.1, 0, -38.1, -91.9, 9.4, -21.9]} 最大差 0.04 m；社科院 {"kit": [96.7, -0.0, -98.6, 121.6, 16.85, -41.4], "glb": [96.7, 0, -98.6, 121.6, 16.8, -41.4]} 最大差 0.05 m。

`tools/dev_scratch/view_audit.py`（360° 盤點：洞洞館前、洞洞館與校史館之間、社科院前）：正式模型 `shots/pavsoc_audit/`、改之前（`?nobldg`）`shots/pavsoc_audit_nobldg/`，沒有 JS 錯誤（例：洞洞館前）：

![洞洞館前 360°](shots/pavsoc_audit/洞洞館前（柱廊外）.jpg)

**效能（同一個鏡頭三角形不能比現在多、draw call ≤ 現在的 +10%；17:30 凍結時鐘、藏起路人與騎腳踏車的路人、含陰影那一輪、含玩家）**：「改之前」＝進校園前把七個地標（總圖、傅鐘、行政大樓、文學院、校史館、洞洞館、社科院）的 key 都從 manifest 拿掉。

| 鏡頭（17:30） | draw call：改之前 → 正式模型（倍數） | 三角形：改之前 → 正式模型（倍數） |
|---|---|---|
| 進校門往東看椰林大道 | 297 → 324（×1.091） | 971,222 → 937,508（×0.965） |
| 椰林大道後段往東（總圖） | 152 → 157（×1.033） | 771,700 → 740,217（×0.959） |
| 總圖前廣場 | 157 → 161（×1.025） | 768,936 → 737,429（×0.959） |
| 總圖門廊近看 | 148 → 152（×1.027） | 748,546 → 717,039（×0.958） |
| 總圖一樓拱廊裡 | 148 → 152（×1.027） | 756,526 → 731,957（×0.968） |
| 從椰林大道看傅鐘 | 159 → 164（×1.031） | 772,858 → 732,300（×0.948） |
| 傅鐘近看 | 162 → 165（×1.019） | 825,682 → 784,420（×0.95） |
| 行政大樓正面 | 160 → 164（×1.025） | 825,654 → 784,416（×0.95） |
| 行政大樓一樓拱廊裡 | 220 → 231（×1.05） | 862,676 → 810,256（×0.939） |
| 文學院正面 | 167 → 180（×1.078） | 806,174 → 782,815（×0.971） |
| 文學院一樓拱廊裡 | 241 → 256（×1.062） | 884,038 → 847,443（×0.959） |
| 校史館正面 | 152 → 163（×1.072） | 804,136 → 780,288（×0.97） |
| 校史館門廊近看 | 151 → 156（×1.033） | 804,134 → 772,001（×0.96） |
| 洞洞館：從椰林大道北側斜看 | 150 → 158（×1.053） | 800,956 → 770,647（×0.962） |
| 洞洞館近看鏤空牆 | 142 → 142（×1.0） | 799,542 → 763,489（×0.955） |
| 社科院：法學院那邊斜看正面 | 153 → 151（×0.987） | 730,854 → 704,181（×0.964） |
| 社科院玻璃大廳近看 | 144 → 143（×0.993） | 680,748 → 636,339（×0.935） |

### 13.5 遊戲內截圖（修改前｜修改後；修改前＝同一版遊戲、只擋掉 `campus_pavilion.glb`、`campus_modern.glb`；17:30 凍結遊戲時鐘）

| 鏡頭 | 修改前（程序化套件） | 修改後（Blender 正式模型） |
|---|---|---|
| 洞洞館：從椰林大道往北看 11:00 | ![修改前](shots/pavsoc_before_pav_avenue_1100.webp) | ![修改後](shots/pavsoc_after_pav_avenue_1100.webp) |
| 洞洞館：從椰林大道往北看 17:30 | ![修改前](shots/pavsoc_before_pav_avenue_1730.webp) | ![修改後](shots/pavsoc_after_pav_avenue_1730.webp) |
| 洞洞館：從椰林大道往北看 20:30 | ![修改前](shots/pavsoc_before_pav_avenue_2030.webp) | ![修改後](shots/pavsoc_after_pav_avenue_2030.webp) |
| 洞洞館：斜看正面 11:00 | ![修改前](shots/pavsoc_before_pav_front_1100.webp) | ![修改後](shots/pavsoc_after_pav_front_1100.webp) |
| 洞洞館：斜看正面 17:30 | ![修改前](shots/pavsoc_before_pav_front_1730.webp) | ![修改後](shots/pavsoc_after_pav_front_1730.webp) |
| 洞洞館：斜看正面 20:30 | ![修改前](shots/pavsoc_before_pav_front_2030.webp) | ![修改後](shots/pavsoc_after_pav_front_2030.webp) |
| 洞洞館：近看鏤空牆 11:00 | ![修改前](shots/pavsoc_before_pav_close_1100.webp) | ![修改後](shots/pavsoc_after_pav_close_1100.webp) |
| 洞洞館：近看鏤空牆 17:30 | ![修改前](shots/pavsoc_before_pav_close_1730.webp) | ![修改後](shots/pavsoc_after_pav_close_1730.webp) |
| 洞洞館：近看鏤空牆 20:30 | ![修改前](shots/pavsoc_before_pav_close_2030.webp) | ![修改後](shots/pavsoc_after_pav_close_2030.webp) |
| 社科院：斜看正面 11:00 | ![修改前](shots/pavsoc_before_soc_front_1100.webp) | ![修改後](shots/pavsoc_after_soc_front_1100.webp) |
| 社科院：斜看正面 17:30 | ![修改前](shots/pavsoc_before_soc_front_1730.webp) | ![修改後](shots/pavsoc_after_soc_front_1730.webp) |
| 社科院：斜看正面 20:30 | ![修改前](shots/pavsoc_before_soc_front_2030.webp) | ![修改後](shots/pavsoc_after_soc_front_2030.webp) |
| 社科院：玻璃大廳、雨遮 11:00 | ![修改前](shots/pavsoc_before_soc_lobby_1100.webp) | ![修改後](shots/pavsoc_after_soc_lobby_1100.webp) |
| 社科院：玻璃大廳、雨遮 17:30 | ![修改前](shots/pavsoc_before_soc_lobby_1730.webp) | ![修改後](shots/pavsoc_after_soc_lobby_1730.webp) |
| 社科院：玻璃大廳、雨遮 20:30 | ![修改前](shots/pavsoc_before_soc_lobby_2030.webp) | ![修改後](shots/pavsoc_after_soc_lobby_2030.webp) |
| 洞洞館：玩家鏡頭（手機直向） 17:30 | ![修改前](shots/pavsoc_before_pav_follow_1730.webp) | ![修改後](shots/pavsoc_after_pav_follow_1730.webp) |

### 13.6 Blender 渲染圖（Cycles；匾額的字是遊戲裡用 canvas 畫的，所以這裡是空白板面；亮燈的窗只有遊戲的夜間才亮，這裡關掉自發光）

洞洞館：

| 正面 | 斜看 | 近看鏤空牆 |
|---|---|---|
| ![](blender_renders/pav_front.webp) | ![](blender_renders/pav_three_q.webp) | ![](blender_renders/pav_screen.webp) |

| 一樓柱廊、入口 | 背面 |
|---|---|
| ![](blender_renders/pav_ground.webp) | ![](blender_renders/pav_back.webp) |

社科院：

| 正面 | 斜看 | 玻璃大廳、雨遮 |
|---|---|---|
| ![](blender_renders/soc_front.webp) | ![](blender_renders/soc_three_q.webp) | ![](blender_renders/soc_lobby.webp) |

| 帶狀長窗近看 | 背面 |
|---|---|
| ![](blender_renders/soc_ribbon.webp) | ![](blender_renders/soc_back.webp) |

### 13.7 還沒達到參考品質的地方

1. **不是照真實建築重建**：沒有照片。真實的洞洞館（1963，張肇康）是綠釉陶管砌成的鏤空牆、屋頂和柱子的比例也不同；真實的社科院不是這個量體。有照片可以照照片改（位置、導航不用動）。
2. 洞洞館的洞是貼圖透明度挖的（不是一根一根的陶管模型）：正面看很像，貼著牆往上看時看得出是兩片板（四面約 2,000 個洞，做成真的陶管模型會多 6 萬個三角形，超過預算）。
3. 社科院的一樓大廳裡面沒有東西（玻璃是深色反光，看不進去）；帶狀長窗裡也沒有窗簾或室內。
4. 沒有 iPhone 實機驗證；效能用 `renderer.info` 量（見 13.4）。

---

## 14. 法學院廣場的近景小物：花台、公告欄、販賣機（⑥）

LAWWW 佇列的 ⑥（法學院廣場的花台、公告欄、販賣機等近景小物）。三樣都加進街道道具的 GLB（`street_props.glb`，開機預載），`W3.planter()`、`W3.bulletin()`、`W3.vending()` 開頭換成正式模型（和路燈、腳踏車、長椅同一套接法；`?nobldg`、載入失敗照舊是程序化版本）。用到的地方：法學院前庭的花台 4 個、椰林大道北側的花台 2 個、霖澤館西側的公告欄與販賣機；AI-1 萬才館一樓的公告欄（`wancai3d.js` 也呼叫 `W3.bulletin()`）也一起換成正式模型（尺寸相同）。

### 14.1 玩家會看到什麼不同

| | 修改前（程序化） | 修改後（Blender 正式模型） |
|---|---|---|
| 花台 | 一個灰色方塊＋一片綠色方塊＋幾顆彩色小球 | 水泥花槽（Poly Haven `concrete_wall_006`，壓頂外凸 2 cm、土比槽口低 8 cm）、茂密的小葉灌木（交叉的葉片卡＋頂上一層，本作程式產生的 `ivy_leaves` 葉片貼圖）、葉叢表面開著紅、黃、白、粉紅的五瓣小花 |
| 公告欄 | 兩根柱子＋一塊板＋幾張純色方塊 | 木柱、木框（Poly Haven `dark_wood`）、軟木板、往前斜的小雨遮、九張 A4／A3 公告（稍微歪著貼、紅／藍標題＋灰色字行） |
| 販賣機 | 紅色方塊＋一片淺藍色平面 | 台灣常見的飲料販賣機：紅色烤漆機身、往內 34 cm 的展示窗（背光日夜都亮、四層層板、罐裝與寶特瓶、層板前緣的按鈕條）、頂上的燈條、深灰投幣面板（會亮的金額顯示、紙鈔口、投幣口、找零口）、白底藍帶的廣告面板、取物口、底座 |

**沒有改的東西**：每樣東西的位置、方向、尺寸範圍（花台 1.2×0.5、公告欄柱距 2.2 m、販賣機 1.1×1.9×0.8）、導航阻擋、互動點。

### 14.2 驗收狀態

| 項目 | 技術（A） | 功能（B） | 美術（C） |
|---|---|---|---|
| 花台、公告欄、販賣機（`prop.street`） | 完成 | `FUNCTIONAL_VERIFIED`（見 14.4） | `READY_FOR_ART_REVIEW` |

### 14.3 規格

- Blender 5.2 `bpy`：`tools/blender/env_second/street_props.py`（加 `planter_box()`、`bulletin_board()`、`vending_machine()`）→ `street_props.glb`：431 KB（原本 169 KB）；三角形：花台 314、公告欄 204、販賣機 872（腳踏車、路燈、長椅不變）。
- 材質：花槽 `planter_conc`、土 `planter_soil`、葉片 `planter_leaf`（alphaMode MASK）、花／公告紙／飲料瓶／按鈕一個頂點色材質 `prop_vc`、軟木 `board_cork`、機身 `vend_body`、展示窗背光 `vend_light`（自發光）；木頭、深色鐵件和長椅、腳踏車共用。這些道具在區域裡和其他靜態物件一起合併（`P3.mergeStatic`），材質相同的合成一個網格。
- 遊戲端：`world3d.js` 加 `formalProp(name)`，花、公告紙、飲料瓶、背光不投影。
- 截圖檢查抓到、已修：販賣機第一版在陰影裡幾乎全黑——機身用了金屬度 0.3（遊戲沒有環境貼圖，金屬的部分只剩很暗的漫射光），取物口那一區和投幣面板又整塊塗成近黑色。改成不帶金屬的紅色烤漆、下半部只有取物口是深色（上面加白底藍帶的廣告面板）、投幣面板改深灰並加會亮的金額顯示、頂上燈條改自發光（三角形 848 → 872），重拍販賣機的兩組鏡頭、重跑 `street_props_integration`。
- 中間遇到的問題：花台的葉片一開始幾乎看不見——葉片卡的 UV 層用 `new('UVMap')` 建，和其他零件的盒狀 UV 層（`verify()`）名稱不同，合併成一個網格時變成第二層，匯出的葉片 UV 全是 0（取到貼圖透明的角落）。改用 `verify()` 後正常（Blender 渲染確認）。

### 14.4 測試結果

測試都是 Playwright 手機模擬（不是 iPhone 實機）；log 在 `docs/art-rebuild/second_ai/test_logs/props6/`。

**這一輪是 ⑤（洞洞館、社科院）和 ⑥ 一起、合併 AI-1 開發分支 `cb399ea` 之後的完整回歸**（2026-10-13；合併 `5b21aa0` 時已經整套跑過一次、全部通過，log 在 `test_logs/props6_5b21aa0/`；合併 `8afdece` 那一輪因為交班只跑完第一項，見 `test_logs/props6_8afdece_partial/`。修改前的截圖＝⑤＋AI-1 `5b21aa0` 那一版，只差 ⑥）。第一次跑 `street_props_integration` 時「花台在導航阻擋裡」**FAIL**（`street_props_integration_round1.log`：葉片卡最外到 x=0.74，比 1.2 m 的花台、導航阻擋多出 0.14 m——後排的葉片卡往右偏了 8 cm）→ 改模型（葉片卡最外到 |x|≤0.64 m）、重新匯出、重跑 PASS；其他測試第一次就通過。

`street_props_integration` 31、`campus_glb_integration` 66、`campus_layout_nav` 67、`p0_movement` 34、`reachability_all` 53、`zone_transitions` 37、`wancai_glb_integration` 13、`see_through` 11、`gongguan_glb_integration` 39、`wz_street_integration` 42、`nav_buildings_unit` 126、`nav_levels_unit` 13、`kit_nav_check` 0：**全部通過**。`street_props_integration` 新加的檢查：三樣都是正式模型、外框在導航阻擋的範圍裡、著地（[-0.62, 0.637, 0, 0.81, -0.27, 0.27]}, "bulletin": {"formal": "prop.street", "box": [-1.32, 1.32, 0, 2.6, -0.12, 0.296]}, "vending": {"formal": "prop.street", "box": [-0.55, 0.55, 0, 1.9, -0.4, 0.425]}}；[-1.32, 1.32, 0, 2.6, -0.12, 0.296]；[-0.55, 0.55, 0, 1.9, -0.4, 0.425]）；校園畫面上有它們的材質，`?nobldg`、載入失敗時沒有（照舊程序化）；導航格、互動點、座位和 `?nobldg` 完全相同。`wancai_glb_integration`（AI-1 的萬才館）照舊通過。

校園地標的效能（`campus_glb_integration`，道具在兩輪都是正式模型）：gate_avenue ×1.092、avenue ×1.033、plaza ×1.025、porch ×1.027…（全部 ≤ 1.1、三角形都比改之前少）。

### 14.5 遊戲內截圖（修改前｜修改後；修改前＝上一版的遊戲：這三樣是程序化版本；17:30 凍結遊戲時鐘）

| 鏡頭 | 修改前（程序化） | 修改後（Blender 正式模型） |
|---|---|---|
| 法學院前庭：長椅旁看花台 11:00 | ![修改前](shots/props6_before_plaza_planters_1100.webp) | ![修改後](shots/props6_after_plaza_planters_1100.webp) |
| 法學院前庭：長椅旁看花台 17:30 | ![修改前](shots/props6_before_plaza_planters_1730.webp) | ![修改後](shots/props6_after_plaza_planters_1730.webp) |
| 法學院前庭：長椅旁看花台 20:30 | ![修改前](shots/props6_before_plaza_planters_2030.webp) | ![修改後](shots/props6_after_plaza_planters_2030.webp) |
| 霖澤館西側：公告欄 11:00 | ![修改前](shots/props6_before_board_vending_1100.webp) | ![修改後](shots/props6_after_board_vending_1100.webp) |
| 霖澤館西側：公告欄 17:30 | ![修改前](shots/props6_before_board_vending_1730.webp) | ![修改後](shots/props6_after_board_vending_1730.webp) |
| 霖澤館西側：公告欄 20:30 | ![修改前](shots/props6_before_board_vending_2030.webp) | ![修改後](shots/props6_after_board_vending_2030.webp) |
| 椰林大道北側的花台 11:00 | ![修改前](shots/props6_before_avenue_planter_1100.webp) | ![修改後](shots/props6_after_avenue_planter_1100.webp) |
| 椰林大道北側的花台 17:30 | ![修改前](shots/props6_before_avenue_planter_1730.webp) | ![修改後](shots/props6_after_avenue_planter_1730.webp) |
| 椰林大道北側的花台 20:30 | ![修改前](shots/props6_before_avenue_planter_2030.webp) | ![修改後](shots/props6_after_avenue_planter_2030.webp) |
| 霖澤館西側：販賣機（正面） 11:00 | ![修改前](shots/props6_before_vending_1100.webp) | ![修改後](shots/props6_after_vending_1100.webp) |
| 霖澤館西側：販賣機（正面） 17:30 | ![修改前](shots/props6_before_vending_1730.webp) | ![修改後](shots/props6_after_vending_1730.webp) |
| 霖澤館西側：販賣機（正面） 20:30 | ![修改前](shots/props6_before_vending_2030.webp) | ![修改後](shots/props6_after_vending_2030.webp) |
| 玩家鏡頭（手機直向）：公告欄前 17:30 | ![修改前](shots/props6_before_follow_1730.webp) | ![修改後](shots/props6_after_follow_1730.webp) |

### 14.6 Blender 渲染圖（Cycles）

![花台、公告欄、販賣機](blender_renders/props6_sheet.webp)

### 14.7 還沒達到參考品質的地方

1. 公告紙上沒有真的字（紅／藍標題＋灰色字行）；遠看像公告，近看讀不到內容。
2. 販賣機的飲料是簡單的圓柱（沒有瓶蓋、標籤細節），展示窗前面沒有玻璃（看得到裡面）；沒有品牌標誌（不仿特定品牌）。
3. 花台的灌木是葉片卡，從正上方往下看會看到卡片的交叉。
4. 只有這三樣；法學院廣場的其他小物（垃圾桶、指標、腳踏車停車架以外的設施）還是程序化或沒有。
5. 沒有 iPhone 實機驗證。

---

## 16. 社會科學院 辜振甫先生紀念圖書館：一樓開架閱覽室（⑬，Blender 正式模型＋配置）

LAWWW 佇列的 ⑬（使用者 D46：法律系學生念書會去「新社科院的辜振甫先生紀念圖書館」）。交付**配置 `src/data/soclib_layout.js`＋Blender GLB**；區域程式、導航、校園入口的接線由 LAWWW 做，所以這一節只有 Blender 渲染，**還沒有遊戲內截圖**。

參考（公開報導；臺大圖書館的介紹頁從沙盒連不到）：一樓開架閱覽室挑高將近 6 m，屋頂由 88 支白色樹狀柱撐起，柱頂像荷葉一樣散開，中間有 130 個形狀不一的天窗；配合竹製書架與閱覽家具，白天陽光從天窗灑下，像在林蔭間閱讀（[天下雜誌](https://www.cw.com.tw/article/5140431)、[蕃薯藤旅遊](https://travel.yam.com/article/120519)、[Bella 儂儂](https://www.bella.tw/articles/design&gadget/59150/toyo-ito-architecture-landmarks-taiwan)、[中央社](https://www.cna.com.tw/news/acn/201702220326.aspx)）。**平面配置、柱子數量、書架排法是遊戲化設計（推估），不是實測。**

### 16.1 玩家會看到什麼

| | 內容 |
|---|---|
| 樹狀柱 | 白色細柱，上面一段像喇叭一樣張開成荷葉（20 支；柱頂高度 4.75–5.25 m 錯開，一片一片像樹冠） |
| 天窗 | 荷葉之間的天花板上 40 個圓形光井（白色井壁＋頂上的天光面板，自發光） |
| 玻璃帷幕 | 北牆、西牆整面玻璃（白色直框每 1.5 m）；前面是窗邊長桌＋竹椅 |
| 林間書房 | 東半邊 4 組竹集成材的弧形**雙面**書架圍著一支樹狀柱，開口朝走道；其中一組外面再一道矮弧 |
| 閱覽長桌 | 4 張長桌（竹色桌面、中間一排小檯燈、板狀桌腳），每張 6 個座位 |
| 入口 | 南牆的雙開玻璃門 → 門口地墊、還書箱 → 閘門（玻璃翼板）與玻璃欄杆 → 服務台（借還書感應板、兩台螢幕）、館員區矮隔板；查詢電腦、新書展示台 |
| 其他 | 東牆 2.4 m 靠牆書架、南牆期刊架、東南角閱報區（兩組單人沙發＋圓矮桌）、招牌板面（字由遊戲畫） |

### 16.2 驗收狀態

| 項目 | 技術（A） | 功能（B） | 美術（C） |
|---|---|---|---|
| 辜振甫圖書館一樓（`soclib_interior.glb`＋`soclib_layout.js`） | 完成（模型、配置） | **還沒接進遊戲**（LAWWW 接線；配置的導航格檢查：65 個座位都走得到） | `MODEL_READY`（使用者還沒看過） |

### 16.3 規格

- 房間 30×22 m、天花板 5.6 m、牆厚 0.2 m；座標 x 往東、z 往南（+z＝南牆：入口），地板 y=0。
- `soclib_interior.glb`：**5.53 MB、85,540 個三角形、20 個材質、29 個物件**（三角形最多的：soclib_books 44,362、soclib_columns 20,120、soclib_bamboo 12,144、soclib_lightwells 2,912、soclib_bamboo_dark 1,760、soclib_ceiling 810）。
- 貼圖：Poly Haven CC0 `terrazzo_tiles`（地板）、`walnut_veneer`（調成淺色直紋當竹集成材）；其他是純色材質。遊戲沒有環境貼圖：金屬度都在 0.45 以下。
- Blender 5.2 `bpy`：`tools/blender/env_second/soclib_interior.py`（讀配置）；配置由 `tools/blender/env_second/soclib_layout_gen.py` 產生（先排家具、再在空的地方排柱子；用 0.2 m 格子＋人物半徑 0.33 m 檢查每個座位都走得到、沒有走不到的孤島）。

### 16.4 給 LAWWW 的接線說明

- 配置 `SOCLIB_LAYOUT`：`entrance`（門在南牆 x=-9.0、寬 2.4 m；出生點 (-9.0, 9.3)、yaw π 面向館內；離開的互動點 z=10.2）、`gates`、`desk`、`columns`、`skylights`、`furniture`、`seats`（65 個：長桌 24、窗邊 33、閱報區沙發 8；`yaw`＝坐下時面向的方向，和 library_layout.js 一樣）、`signs`、**`nav`**（`rects`＝[中心 x, 中心 z, 寬, 深, ry]、`circles`＝[x, z, r]：家具、書架、柱子的導航阻擋，直接 blockRect／blockCircle 就好；牆和門洞照 W×D、wallT、entrance）。
- GLB 的命名照其他室內（attachRoomGLB）：會淡出的牆 `WALL_<side>_*`（自訂屬性 `dir`＝往室內的法線；front＝南牆、back＝北牆玻璃帷幕、left＝西牆玻璃帷幕、right＝東牆）；招牌 `WALL_front_SIGN_FACE_0`（自訂屬性 `sign`＝「社會科學院圖書館」，字由遊戲畫；全名要不要寫上辜振甫先生紀念圖書館由你決定）。
- 自發光材質：`soclib_skylight`（天窗；晚上可以調暗或換成夜空色）、`soclib_lamp`（檯燈）、`soclib_screen`（螢幕）。天花板 `soclib_ceiling` 有天窗的洞（單面朝下）。
- 北牆、西牆的玻璃帷幕外面需要窗景：可以照店家窗景的做法拍兩張（北、西），等你決定圖書館在校園裡的位置（社科院 `CK.modern` 在 (110, −70)）之後我來拍。

### 16.5 Blender 渲染圖（Cycles，曝光 −1；**不是遊戲畫面**）

| 入口往裡看 | 往上看：樹狀柱、荷葉柱頂、天窗 |
|---|---|
| ![](blender_renders/soclib_entrance.webp) | ![](blender_renders/soclib_up.webp) |
| **林間書房（弧形雙面書架圍著樹狀柱）** | **另一組林間書房** |
| ![](blender_renders/soclib_grove.webp) | ![](blender_renders/soclib_grove1.webp) |
| **閱覽長桌** | **北側玻璃帷幕前的窗邊座位** |
| ![](blender_renders/soclib_tables.webp) | ![](blender_renders/soclib_window.webp) |

平面草圖（綠＝走得到的地方、棕＝導航阻擋、深灰圓點＝柱子、淡紫圓圈＝荷葉柱頂、紅點＝長桌座位、藍點＝窗邊與沙發座位、綠圓點＝出生點）：

![](drafts/soclib_plan_draft.webp)

### 16.6 還沒達到參考品質的地方

1. **還沒接進遊戲**：沒有遊戲內截圖、沒有跑整合測試；手機上的效能（85,540 個三角形，一整間大多同時看得到）要接線後量。
2. 規模縮小：真的閱覽室有 88 支柱子、地下一樓到二樓；遊戲版一層、20 支柱子。
3. 柱頂是平的圓盤；真的荷葉是很薄、邊緣起伏的殼，天窗形狀也不一樣（這裡都是圓的）。
4. 竹材是木紋貼圖調色（沒有竹節）；書是一本一本的盒子、沒有書名；期刊是色塊。
5. 玻璃帷幕外面還沒有景（Blender 渲染裡是天空色）。
6. 沒有 iPhone 實機驗證。

---

## 17. 萬才館 法律學院圖書館（LAWWW 2026-10-13 13:16Z 分派、使用者指定；Blender 正式模型＋萬才館的門＋窗景）

使用者 2026-10-11：「萬才館一樓進去左手邊就是法律系圖書館，裡面自己有樓梯，有兩層樓；1 樓主要是櫃檯、自習區、影印室、兩間可以借用的討論室（小的）；2 樓比較多是藏書。」
LAWWW 已經做好配置 `src/data/lawlib_layout.js`、區域 `src/lawlib3d.js`（導航、互動點、程序化備用模型）；這一節是第二個 AI 做的**正式模型**：`tools/blender/lawlib_interior.py` → `assets/models/env/lawlib_interior.glb`（讀同一份配置，兩邊的牆、樓梯、家具位置一致），加上萬才館大廳那一側的門、三個方向的窗景。

### 17.1 做法與內容

- 工具：Blender 5.2 `bpy`（無介面）；共用小工具 `tools/blender/env_second/lib2.py`、植物 `tools/blender/plants.py`（只讀使用）。材質：Poly Haven CC0——一樓 `granite_tile`（調成淺色、60 cm 地磚）、二樓與討論室 `dirty_carpet`（去彩度調成灰藍地毯）、樓梯 `granite_tile_03`、木作 `walnut_veneer`、輕鋼架天花板 `ceiling_interior`；其他是純色材質；金屬度都在 0.45 以下。
- **書**：一層書架的一個開間做成一個「書模組」（一本一本的書：書背、書口、露出來的側面；寬、高、深、顏色不一，偶爾有空隙和書擋），共 19 種（法律教科書 8、外文書 3、博碩士論文 3、期刊合訂本 5），每一格放一個 → **663 個 GPU instancing**（glTF `EXT_mesh_gpu_instancing`；遊戲的 GLTFLoader 會變成 InstancedMesh）。
  書背是程式畫的圖集 `tools/blender/env_second/textures/gen/lawlib_books.png`（`lawlib_atlas.py`）：書名只寫科目（民法總則、刑事訴訟法…）、版次、圖書館的索書號標籤（中國圖書分類法 58x）；論文是深色精裝燙金、期刊合訂本同一種期刊同一個顏色＋卷號、年份；**沒有真實的作者、出版社、期刊名稱**。字用系統字型文泉驛正黑畫成點陣圖（GLB 裡沒有字型）。期刊封面、新書封面是另一張 `lawlib_covers.png`（虛構的刊名與專題）。
- **一樓**：入口（東牆，雙開玻璃門、出口標示燈、地墊；門外補一小段萬才館大廳，從館內看出去不是空的）、防盜感應門柱（半透明壓克力板）、櫃台（胡桃木面板、花崗石檯面、還書口、館員那一側的工作檯、兩台螢幕）、館員工作區（分類書架、隔板、辦公椅、書車）、兩張長閱覽桌（中間一排綠色玻璃燈罩的桌燈、插座）、靠南窗的四個閱覽隔間、參考書書架、現期期刊架、新書展示台、兩台館藏查詢機；北側玻璃隔間的討論室 A、B（拉門推開、霧面腰帶、桌子、四張會議椅、白板、牆上的螢幕）、影印室（兩台影印機、加值機、回收紙箱）、館員辦公室（木門關著）；輕鋼架天花板＋燈＋偵煙器。
- **U 形樓梯**：A 跑（往南，13 階）、平台、B 跑（往北，12 階；和二樓共用）；花崗石踏面＋止滑條、兩跑中間的牆（頂上胡桃木扶手）、B 跑東側的木格柵牆（大廳那一面；「法律學院圖書館」牌子在上面）、牆上的不鏽鋼扶手、南牆的樓梯高窗、二樓樓梯井的玻璃欄杆。台階的位置和遊戲的 `stairSurfs`（一階一階的畫面高度）完全一致。
- **二樓**：灰藍地毯；10 座雙面書架（鐵灰色鋼架、胡桃木端板＋頂板、端板上的索書號卡座）、外文書／博碩士論文／期刊合訂本三面靠牆書架、現期期刊展示架、閱覽桌 5 張、書車、踏凳、盆栽、安全梯的門（關著、出口標示燈）；北、西高窗、南面大窗；長條燈在書架之間的走道上方。
- 吊牌：遊戲用 canvas 畫字的吊牌（櫃台、樓梯口、二樓）做了深色背板＋吊線；貼牆的牌子（房間名稱、「法律學院圖書館」）不用。
- **萬才館那一側的門**（`tools/blender/wancai_interior.py`，LAWWW 授權只改門洞、門、名牌、盆栽位置；盆栽配置裡已經搬到 (−8.2, −6.2)，模型照配置）：一樓西牆南段開門洞（`lawlibDoor`：z 5.35–6.55、高 2.4 m）、鋁框、兩扇玻璃門（關著）、直把手、門上淺色木作名牌＋胡桃木框（字是遊戲畫的深咖啡色字，所以用淺色木板）、門後一小段館內（地磚、白牆、天花板、感應門柱、亮的牆）。`wancai_interior.glb` 2.51 MB（原本 2.40 MB）。
- **窗景**（`tools/shots/window_views.py` 加三筆，遊戲裡拍的實際畫面，1024×512、水平 90°、白天 11:00／晚上 20:30）：`lawlib_south`（弧形量體前面往南看法學院前的廣場與樹林）、`lawlib_north`（萬才館背面往北）、`lawlib_west`（西牆外二樓高度往西：國青中心、霖澤館）。

### 17.2 驗收狀態

| 項目 | 技術（A） | 功能（B） | 美術（C） |
|---|---|---|---|
| 法圖室內 `lawlib_interior.glb` | 完成 | 載入、接上 `B3.attachFormal`、遊戲內截圖（17.6）；**整合測試（走路、坐下、上下樓）由 LAWWW 跑** | `READY_FOR_ART_REVIEW`（使用者還沒看過） |
| 萬才館西牆的門 | 完成 | 遊戲內還沒截圖（LAWWW 整合後） | `MODEL_READY` |
| 窗景 3 張×2 時段 | 完成 | 檔名照 `lawlib_layout.js` 的 `photo` | — |

### 17.3 規格

- `lawlib_interior.glb`：**2.77 MB**；靜態三角形 27,366；書 663 個 instancing（19 種模組、不重複的三角形 2,924），**畫出來的書 97,422 個三角形**；合計畫出來 124,788；材質 47 個。
- 節點：`L0_root`（一樓＋整座樓梯＋入口外那一小段）、`L1_root`（二樓）；書的 instancing 在 `L0_books`、`L1_books` 底下。外牆和貼在外牆上的東西名字含 `WALL_`（自訂屬性 `dir`）；玻璃不放進 `WALL_`。
- 網點透空的材質：`ll_shelf_steel`、`ll_book_atlas`、`ll_endpanel`、`ll_journal_covers`（`lawlib3d.js` 的 `/^ll_(shelf|book|endpanel|journal)/`）。天花板材質名有 `ceiling`（`attachFormal` 會加地面反光）。
- `src/assets3d.js` 的第二個 AI 區塊加了 `bldg.lawlib_interior`（lazy）。

### 17.4 遊戲內效能（Playwright＋SwiftShader，1280×800；手機直向 390×844；`renderer.info`：draw call／三角形；「擋掉 GLB」＝程序化備用模型）

| 鏡頭 | 擋掉 GLB | 正式模型 | 正式模型接上了 |
|---|---|---|---|
| `g_entrance` | 521／22,034 | 365／125,628 | 是 |
| `g_reading` | 459／20,982 | 320／125,162 | 是 |
| `g_stairs` | 230／14,944 | 149／96,994 | 是 |
| `g_rooms` | 302／16,972 | 201／113,304 | 是 |
| `g_stacks` | 410／17,314 | 312／122,998 | 是 |
| `g_upper` | 347／16,708 | 257／104,158 | 是 |
| `g_follow_1f` | 386／95,270 | 280／201,450 | 是 |
| `g_follow_2f` | 386／93,384 | 294／194,652 | 是 |
| `g_follow_stairB` | 496／97,614 | 356／194,530 | 是 |
| `m_follow_1f` | 333／92,612 | 235／180,434 | 是 |
| `m_follow_2f` | 336／91,726 | 245／187,906 | 是 |
| `g_night_1f` | 521／22,034 | 365／125,628 | 是 |

遊戲內 console 錯誤：沒有。**這是模擬，不是 iPhone 實機**；效能要 LAWWW 在手機上量。

### 17.5 Blender 渲染圖（Cycles；**不是遊戲畫面**；吊牌、房間名稱的字是遊戲畫的，這裡沒有）

| 入口往館內看 | 閱覽長桌、玻璃討論室 |
|---|---|
| ![](blender_renders/lawlib_entrance.webp) | ![](blender_renders/lawlib_reading.webp) |
| **一樓往樓梯看** | **閱覽桌的綠色桌燈、北側的房間** |
| ![](blender_renders/lawlib_stairs.webp) | ![](blender_renders/lawlib_rooms.webp) |
| **櫃台** | **二樓書架走道** |
| ![](blender_renders/lawlib_counter.webp) | ![](blender_renders/lawlib_stacks.webp) |
| **二樓：書架、東牆外文書** | **二樓往東南閱覽區** |
| ![](blender_renders/lawlib_stacks2.webp) | ![](blender_renders/lawlib_upper.webp) |
| **樓梯平台往上看 B 跑** | **二樓往下看樓梯井** |
| ![](blender_renders/lawlib_landing.webp) | ![](blender_renders/lawlib_well.webp) |
| **討論室 A（白板在西牆、螢幕在東牆）** | **入口：雙開玻璃門、感應門柱** |
| ![](blender_renders/lawlib_disc.webp) | ![](blender_renders/lawlib_door.webp) |
| **二樓：期刊合訂本、現期期刊架** | **書背（索書號標籤）** |
| ![](blender_renders/lawlib_journals.webp) | ![](blender_renders/lawlib_thesis.webp) |
| **萬才館大廳：圖書館的門** | **萬才館大廳：遠一點** |
| ![](blender_renders/wancai_lldoor.webp) | ![](blender_renders/wancai_lldoor_far.webp) |

### 17.6 遊戲內截圖（修改前＝擋掉 GLB 的程序化備用模型｜修改後＝正式模型；11:00，晚上那張 20:30）

| 鏡頭 | 修改前（程序化） | 修改後（Blender 正式模型） |
|---|---|---|
| 入口往館內看（一樓） | ![](shots/lawlib_before_g_entrance.webp) | ![](shots/lawlib_after_g_entrance.webp) |
| 閱覽長桌、玻璃討論室 | ![](shots/lawlib_before_g_reading.webp) | ![](shots/lawlib_after_g_reading.webp) |
| 一樓往樓梯看 | ![](shots/lawlib_before_g_stairs.webp) | ![](shots/lawlib_after_g_stairs.webp) |
| 北側的討論室、影印室 | ![](shots/lawlib_before_g_rooms.webp) | ![](shots/lawlib_after_g_rooms.webp) |
| 二樓書架走道 | ![](shots/lawlib_before_g_stacks.webp) | ![](shots/lawlib_after_g_stacks.webp) |
| 二樓往東南閱覽區 | ![](shots/lawlib_before_g_upper.webp) | ![](shots/lawlib_after_g_upper.webp) |
| 跟隨鏡頭：一樓 | ![](shots/lawlib_before_g_follow_1f.webp) | ![](shots/lawlib_after_g_follow_1f.webp) |
| 跟隨鏡頭：二樓書架之間（書架網點透空） | ![](shots/lawlib_before_g_follow_2f.webp) | ![](shots/lawlib_after_g_follow_2f.webp) |
| 跟隨鏡頭：B 跑樓梯上（南牆淡出） | ![](shots/lawlib_before_g_follow_stairB.webp) | ![](shots/lawlib_after_g_follow_stairB.webp) |
| 手機直向 390×844：一樓 | ![](shots/lawlib_before_m_follow_1f.webp) | ![](shots/lawlib_after_m_follow_1f.webp) |
| 手機直向 390×844：二樓書架之間 | ![](shots/lawlib_before_m_follow_2f.webp) | ![](shots/lawlib_after_m_follow_2f.webp) |
| 晚上 20:30：入口往館內看 | ![](shots/lawlib_before_g_night_1f.webp) | ![](shots/lawlib_after_g_night_1f.webp) |

萬才館大廳那一側的門（左：程序化備用模型，深色木牌＋深色字看不清、玻璃門後面是空的；右：正式模型，淺色木牌＋門後一小段館內）：

| 鏡頭 | 修改前（程序化） | 修改後（Blender 正式模型） |
|---|---|---|
| 大廳往圖書館的門 | ![](shots/wancai_lldoor_before_door.webp) | ![](shots/wancai_lldoor_after_door.webp) |
| 手機直向：跟隨鏡頭 | ![](shots/wancai_lldoor_before_door_follow.webp) | ![](shots/wancai_lldoor_after_door_follow.webp) |

### 17.7 窗景（遊戲畫面，1024×512）

| 南（白天／晚上） | 北（白天／晚上） | 西（白天／晚上） |
|---|---|---|
| ![](../../../assets/models/env/views/lawlib_south_day.webp) | ![](../../../assets/models/env/views/lawlib_north_day.webp) | ![](../../../assets/models/env/views/lawlib_west_day.webp) |
| ![](../../../assets/models/env/views/lawlib_south_night.webp) | ![](../../../assets/models/env/views/lawlib_north_night.webp) | ![](../../../assets/models/env/views/lawlib_west_night.webp) |

### 17.8 配置的問題（傳給 LAWWW；配置是 LAWWW 的，我不改）

1. ~~兩間討論室的白板擋在北窗前面~~ → **LAWWW 已修（`20301c3`：白板在側牆，`face`）**；GLB 照新配置，螢幕在對面的牆。
2. ~~一樓盆栽壓在第四個閱覽隔間的桌子上~~ → **已修（(2.95, 7.45)）**；GLB 照新配置。
3. ~~書架標示牌太寬、互相重疊~~ → **已修（range 的 `signW` 1.3 m）**；GLB 在每塊標示牌後面加了深色背板（坐在書架頂板上）。
4. 「法律學院圖書館」牌子在**備用模型**裡被牆蓋住（GLB 的牆面做在牌子後面，看得到）——備用模型的事，還沒改。
5. 二樓 B 跑最上面一階和樓板邊之間 22 cm 的縫：GLB 補成樓板（備用模型照舊）。
6. 同一道門兩側大小不一樣（法圖 1.6×2.5 m、萬才館 1.2×2.4 m）——等 LAWWW 決定。
7. **新的**：二樓兩塊吊牌的 `y`（6.9、6.4）像是絕對高度，遊戲會再加 4.2 m（變成 11.1、10.6，在屋頂上面，看不到）；建議改成 2.7、2.2。GLB 的吊牌背板照遊戲的算法放，在天花板上面的就不做（改了配置重新匯出就會出現）。

### 17.9 還沒達到參考品質的地方

1. **沒有照片參考**：室內是照使用者的描述做的遊戲化設計，不是還原真實館舍（材質、家具、書架排法、櫃台位置都是推估）。
2. 書是程式畫的書背：近看是真的書名、索書號，但每一種模組重複出現（663 格只有 19 種）；沒有斜放、平放的書。
3. 討論室的門是「推開的拉門」，不會動；入口玻璃門關著（出去是互動點）。
4. 吊牌、房間名稱的字要靠遊戲畫；二樓兩塊吊牌的高度要等配置改（17.8 第 7 點）。
5. **遊戲裡斜著看書架時書背的字糊掉**（17.6 二樓那幾張只看得到顏色）：書背圖集 1024×1024，正面近看有字；斜看時 three.js 預設沒有各向異性過濾，選到很小的 mipmap。遊戲端可以只對 `ll_book_atlas` 的貼圖設 `anisotropy`（`renderer.capabilities.getMaxAnisotropy()`）——這是遊戲程式，LAWWW 決定。
6. 窗景北面那張左半邊是很近的建築牆面（萬才館背面那一帶的套件建築）。
7. 沒有 iPhone 實機驗證；整合測試（走路、坐下、上下樓、鏡頭、存讀檔）由 LAWWW 跑。

---

## 18. 和平東路二段 118 巷街景（⑭，Blender 正式模型；遊戲區域由 LAWWW 做）

使用者 D46：法律系學生吃飯常去台大後門（辛亥復興校門）外的 118 巷。LAWWW 先出配置 `src/data/lane118_layout.js`（巷寬、兩側店面、門、和辛亥路／和平東路的接口），我照同一份配置做兩側的街景；**遊戲區域、導航、店門互動由 LAWWW 做**，所以這一節只有 Blender 渲染。

### 18.1 做法與內容

- 工具：和溫州街、公館店面街同一支腳本 `tools/blender/env_second/wz_street.py`，加一組 `--set lane118`（讀配置）→ `assets/models/env/second_ai/lane118_street.glb`。同一套台北老公寓零件、材質、窗戶原型（長條磁磚／馬賽克／水泥漆外牆、鋁窗＋窗簾、外凸鐵窗、浪板雨遮、冷氣與排水管、陽台盆栽、頂樓水塔與加蓋）。
- 配置裡的 9 間店照 z0～z1 蓋（店門在中間）：滇香小館（西側 z 22～28）、好家自助餐（西側 z 14～21）、一一八茶飲（西側 z 10～13）、巷口家常菜（西側 z -6～2）、慢讀咖啡（西側 z -16～-9）、Pasta 118（東側 z 20～28）、韓食小廚（東側 z 12～19）、蛋包飯研究所（東側 z -2～5）、六張犁麵舖（東側 z -14～-7）；店名是配置裡的虛構店名，招牌配色照店的類型，有的有帆布遮雨棚。
- 店與店之間的空檔補上沒有互動的樓房：寬度不到 2.6 m 的是住家樓梯間（紅／綠鐵門、信箱、門燈），其他是住家、鐵捲門、一般小店（早餐店、影印、自助洗衣、水果行…）；兩條小巷（配置的 alleys）不蓋，靠小巷、靠和平東路／辛亥路的那一面開側窗。
- 中文字不放在 GLB：招牌 `SIGN_FACE_<棟>`、直立招牌 `VSIGN_FACE_<棟>`、店內景深卡 `INTERIOR_FACE_<棟>` 是空白板面（自訂屬性帶店名、顏色、店種），**和溫州街、公館同一套**，遊戲用 `wzAtlasFaces`（TK.signTex／TK.interiorTex）畫字——Blender 渲染裡是空白的咖啡色板子。每棟的編號：西側 `W00`…、東側 `E00`…（由北往南；字牌板面的名字帶這個編號，`lane118_street.json` 的 `buildings` 有完整清單）；牆、窗這些依材質合併成整條街一個網格（和溫州街一樣）。

### 18.2 驗收狀態

| 項目 | 技術（A） | 功能（B） | 美術（C） |
|---|---|---|---|
| 118 巷兩側街景（`lane118_street.glb`） | 完成 | **還沒接進遊戲**（LAWWW 做區域） | `MODEL_READY` |

### 18.3 規格

- `lane118_street.glb`：**2.01 MB**；不重複的三角形 21,763、畫出來的三角形 110,155（鐵窗、冷氣、水塔、窗戶是 instancing）；兩側 27 棟。
- 座標＝配置的座標（x 往東、z 往南）；西側立面在 x=-5.2、東側 x=5.2；一樓高 3.6 m、樓高 3.2 m（配置的 groundH／floorH）。

### 18.4 給 LAWWW 的接線說明

- GLB 只有兩側的建築（照 wenzhou_street.glb 的接法：載入後加進區域、字牌用 `wzAtlasFaces` 畫、夜間發光照 `WZ_NIGHT`）；巷子的路面、人行道、機車格、辛亥路／和平東路與後門、背景由區域做。
- 機車：可以用溫州街的機車 InstancedMesh（`scooter.glb`），停在配置的 `scooters.zRanges`。
- 導航阻擋：兩側建築從立面往外都不能走（x &lt; -5.2、x &gt; 5.2）；小巷口要用看得懂的方式擋（例如機車、花盆），不要隱形牆。

### 18.5 Blender 渲染圖（Cycles；**不是遊戲畫面**；招牌的字是遊戲畫的，這裡是空白）

| 從辛亥路那一端往北看 | 中段往南看（小巷口、住家樓梯間） |
|---|---|
| ![](blender_renders/lane118_south_end.webp) | ![](blender_renders/lane118_middle.webp) |
| **巷口家常菜（西側）** | **蛋包飯研究所（東側）** |
| ![](blender_renders/lane118_shop_home.webp) | ![](blender_renders/lane118_shop_omu.webp) |

![從上空看整條巷子](blender_renders/lane118_aerial.webp)

### 18.6 還沒達到參考品質的地方

1. **沒有照片參考**：118 巷真實的樣子（店面寬度、騎樓有沒有、招牌密度）沒有查證，照台北巷弄的一般樣子做；店名、店家都是虛構的。
2. 還沒接進遊戲：沒有遊戲內截圖、招牌的字還沒畫上去、晚上的燈光沒看過。
3. 和溫州街、公館共用同一套公寓零件：細看會覺得像（同一種窗、鐵窗、雨遮）。
4. 小吃店的特色（菜單看板、蒸籠、冰箱、外帶窗口、桌椅擺到騎樓）還沒有做。
5. 沒有 iPhone 實機驗證。

---

## 19. 騎車用的腳踏車（⑫，Blender 正式模型＋尺寸表；人物騎乘由 LAWWW 做）

使用者要求「我應該要可以騎腳踏車」、路上的騎士要真的踩踏板（LAWWW 07:52Z 分派）。交付 `assets/models/env/bike_ride.glb`（**235 KB**）＋尺寸表 `assets/models/env/bike_ride.json`（**從模型量出來的**）＋腳本 `tools/blender/env_second/bike_ride.py`。
造型和街上停的淑女車（`street_props.glb` 的 `bike_city`）同一款：彎下管的低跨車架、前籃、前燈、擋泥板、後貨架、鍊條蓋、環形鎖、彈簧座墊、後掠把手、車鈴；放大成成人騎的 26 吋。車架顏色是灰綠色烤漆（材質 `ride_frame`，遊戲可以改色）。

### 19.1 驗收狀態

| 項目 | 技術（A） | 功能（B） | 美術（C） |
|---|---|---|---|
| 騎車用的腳踏車（`bike_ride.glb`） | 完成（零件分開、樞紐自我檢查通過） | **還沒接進遊戲**（騎乘姿勢、IK、操作由 LAWWW 做） | `MODEL_READY` |

### 19.2 尺寸表（遊戲座標，公尺；車頭朝 +z、地面 y=0、中心線 x=0；**騎士的左手邊＝+x**、右手邊＝−x，鍊條在右邊）

| 量 | 值 |
|---|---|
| 座墊頂 | (+0.000, 0.935, -0.310)（座墊最高的那一點（坐骨的位置在它後面約 3–5 cm）） |
| 把手握點（左，+x） | (+0.290, 1.060, +0.083) |
| 把手握點（右，−x） | (-0.290, 1.060, +0.083) |
| 五通中心 | (+0.000, 0.285, -0.045) |
| 曲柄長 | 0.165 m |
| 踏板中心（靜止姿勢：右曲柄朝前、左曲柄朝後） | 右 (-0.115, 0.285, +0.120)、左 (+0.115, 0.285, -0.210) |
| 輪徑（輪胎外徑） | 0.666 m |
| 前輪軸／後輪軸 | (+0.000, 0.333, +0.560)／(+0.000, 0.333, -0.500) |
| 軸距 | 1.06 m |
| 轉向軸 | 通過 (+0.000, 0.700, +0.373)、方向（往上）(+0.000, 0.940, -0.342)、頭管角 70.0° |

### 19.3 節點與怎麼動（glTF 的節點名稱固定）

| 節點 | 父節點 | 原點（樞紐） | 怎麼動 | 三角形 |
|---|---|---|---|---|
| `frame` | （根） | 地面 (0,0,0) | 不動：車架、座管＋座墊、後貨架、後擋泥板、鍊條蓋、鍊條、環形鎖、中柱（收起） | 1,340 |
| `fork` | frame | 轉向軸和頭管下緣的交點 | **本地 +Y＝轉向軸**（往上、往後傾 20°）：轉把手＝繞本地 Y 轉；前叉、龍頭、把手、握把、煞車把、車鈴、前籃、前擋泥板、前燈一起轉 | 946 |
| `wheel_f` | fork | 前輪軸心 | 繞本地 X 轉（跟著把手轉向） | 984 |
| `wheel_r` | frame | 後輪軸心 | 繞本地 X 轉 | 984 |
| `crank` | frame | 五通中心 | 繞本地 X 轉（齒盤＋兩根曲柄） | 248 |
| `pedal_r`／`pedal_l` | crank | 右／左踏板軸（曲柄末端） | 繞本地 X 轉：每格轉「負的曲柄角度」，踏板保持水平 | 136／136 |

腳本最後有自我檢查：fork 的本地 +Z（Blender；glTF 匯出後是本地 +Y）和轉向軸一致、每個節點的世界位置等於樞紐點（誤差 < 0.1 mm），不符合就匯出失敗。
輪子往前滾 1 m 轉 1/(π×0.666) 圈；曲柄的轉速照遊戲的齒比自己決定（建議：輪子轉 1 圈、曲柄轉 0.4–0.5 圈）。

### 19.4 規格

- 材質：車架 `ride_frame`（灰綠烤漆）、黑色零件 `ride_dark`、輪胎與握把 `ride_rubber`、金屬 `ride_metal`（金屬度 0.45 以下）、座墊 `ride_saddle`、反光片 `ride_reflector`／`ride_reflector_amber`、前燈 `ride_lamp_lens`（自發光）、鋼絲與前籃鐵絲網 `ride_alpha`（透明貼圖 `textures/gen/bike_alpha.png`，alphaMode MASK，和停著的淑女車同一張）。
- 三角形合計 4,774。

### 19.5 Blender 渲染圖（Cycles；**不是遊戲畫面**）

| 側面 | 45° |
|---|---|
| ![](blender_renders/bike_ride_side.webp) | ![](blender_renders/bike_ride_q45.webp) |
| **正面** | **把手區（從後上方往下看）** |
| ![](blender_renders/bike_ride_front.webp) | ![](blender_renders/bike_ride_top_cockpit.webp) |

### 19.6 還沒達到參考品質的地方

1. 還沒有人騎（騎乘姿勢、手腳貼合握把和踏板要 LAWWW 接上才看得到）；沒有遊戲內截圖。
2. 鍊條是靜態的一圈（不會跟著齒盤動）；齒盤是實心圓盤、沒有齒。
3. 煞車線、變速線沒有做；握把是直的圓柱（真的淑女車握把稍微往後彎）。
4. 輪胎沒有胎紋；鋼絲是透明貼圖（從正側面看是平的）。
5. 沒有 iPhone 實機驗證。

---

## 20. 共同教學館外觀＋西側木造走廊＋北側蒲葵（四棟清單第一棟；Blender 正式模型；**依文字資料的遊戲化設計，沒有照片**）

使用者 2026-10-13「台大四大生活場景」要求（原文 `requests/2026-10-13_四棟教學館與宿舍.md`）＋LAWWW 13:54Z 規格（中心 (2,33)、正面朝北、24×14、3–4 層、北面中間正門、西側 5 m 有頂木造走廊、玩家從走廊下走過、型別同行政大樓）＋LAWWW 15:38Z 決定（北側蒲葵做在同一個 GLB、三松不放、戶外樓梯不做、附鏡頭碰撞）。
腳本 `tools/blender/env_second/campus_gongtong.py` → `assets/models/env/second_ai/campus_gongtong.glb`（校園世界座標，和行政大樓一樣直接放）；`src/assets3d.js` 第二個 AI 區塊加了 `bldg.campus_gongtong`（lazy）。

### 20.1 根據（哪些查證過、哪些是推測）

查證資料都是搜尋摘要（`research/四棟教學館與宿舍_參考資料.md` 第 1 節），**沒有任何照片**：

| 做在模型裡的 | 根據 | 確認程度 |
|---|---|---|
| 土黃色十三溝面磚 | 維基（簡體）、校史館〈臺灣大學校園建築變遷互動地圖簡史〉 | B（十三條溝太細，遊戲距離看不到，沒做） |
| 每層樓板的位置磚豎貼（一條直紋帶） | 同上 | B |
| 開口用洗石子收邊、拱窗 | 同上 | B |
| 山牆頂三塊青瓷花磚排成磬形 | 同上 | B（花磚的圖案、顏色是推測） |
| 一二樓在前、三四樓在後逐層退縮 | 維基 | B（「前」是哪一面是推測：南面有走廊、面向三松 → 南面低、往北退） |
| L 形 | 維基 | B（遊戲佔地是 24×14 的長方形；L 形做在上面：東半部三四樓＋西翼的屋頂） |
| 南側走廊多處開口 | 維基 | B（做在三、四樓南面：一樓南牆到舟山路只有 2.5 m） |
| 西邊隔著木造走廊和行政大樓相鄰 | 維基、法律系學生會 | B（走廊的樣子、方向是推測：照 LAWWW 規格做成東西向、連接兩棟的有頂走廊） |
| 北側蒲葵樹列 | 校史館 | B（株數、位置、樹高是遊戲化的） |
| 4 層 | LAWWW 的教室編號到 4xx＋維基「三四樓」 | B |
| 一樓北面拱廊、中央門廊 | **遊戲的套件**（導航阻擋照它） | 遊戲設計（不是查證） |

**沒做的**：西側階梯教室的戶外樓梯（走不上去的裝飾樓梯不能做，D38 第 4 條）、南側三棵琉球松（共同三松；遊戲裡南牆到舟山路只有 2.5 m，LAWWW：等照片）。

### 20.2 做法

- 量體：一二樓滿版（北面一樓 7 開間拱廊＋中央門廊，柱子、門廊側牆的位置和套件一樣）；東半部（x −12..5.14，本地座標）三樓往北退 3.5 m、四樓退 7 m，東西向雙坡屋頂；西翼（共 101 階梯教室那一側）兩層＋南北向雙坡屋頂 → 從上面看是 L 形，南面是兩段紅色隔熱磚的露台。
- 立面：土黃色面磚（`exterior_wall_cladding_02` 降低彩度校正）；每層樓板一條 0.33 m 的豎貼面磚帶（同一張貼圖轉 90°、外凸 2.5 cm）；二到四樓的教室是**雙拱窗**（兩扇 1 m 寬拱窗、洗石子窗框在中間相接、共用窗台）；兩端是單拱窗；三、四樓南面是開放走廊（拱形開口＋矮牆＋洗石子壓頂、走廊天花板的吸頂燈、教室那一側的木門與窗）。
- 山牆四面（東、西半部四樓兩端、西翼南北兩端）＋門廊山牆都有**三塊青瓷花磚排成倒 V（磬形）**：菱形擺、釉面、深一點的凹框、中間白釉小花（頂點色）。
- 門廊：面磚側牆＋洗石子勒腳、起拱線腰帶、拱圈、拱腹；檐部；山牆面磚；兩坡屋瓦小屋頂；匾額「共同教學館」（遊戲用 canvas 畫字）。
- 一樓拱廊：面磚柱墩＋洗石子柱頭柱腳、拱圈；花崗石地坪；吸頂燈 7 盞；玻璃雙開門（古銅色鋁框、上面氣窗；晚上門廳的燈從玻璃透出來）；門兩側各一個公告欄。
- 西側木造走廊：x 12..17（世界 x −10..−15）、z ±1.0（世界 32..34）；四根柱子（石礎、托木）、桁、梁、束、脊桁、椽、望板、屋瓦；中間吊一盞燈；兩端各一扇關著的木門，共同這一側的門上有「側門　請由正門出入」。
- 北側蒲葵 6 棵：真的幾何（樹幹 8 面＋圓柱 UV、樹冠基部、16 片掌狀葉，每片 22 條裂片：內半段有摺、外半段裂開、尖端下垂，老葉尖端枯黃；平滑著色＋頂點色，一個材質）。
- 其他：西翼西簷的簷溝＋落水管、南面與東面的落水管、露台上的冷氣室外機。

### 20.3 驗收狀態

| 項目 | 技術（A） | 功能（B） | 美術（C） |
|---|---|---|---|
| 共同教學館外觀＋木造走廊＋蒲葵（`bldg.campus_gongtong`） | 完成 | **還沒接進遊戲**（LAWWW 整合；我用本機、沒有 commit 的兩行接線拍了遊戲截圖） | `MODEL_READY`（遊戲畫面拍過；接線後才是 `INTEGRATED`） |

### 20.4 規格

- GLB **1.71 MB**、三角形 **28,627**（建築約 1.47 萬＋蒲葵 1.36 萬＋樹幹 0.04 萬；沒有 instancing）、網格（≈ draw call）18、材質 17、貼圖 {'256×256': 5, '64×64': 1, '512×512': 6}（共 296 KB，WebP）。
- 材質名稱沿用校園地標的約定：`ck_glass`（窗：自發光貼圖左黑右亮，晚上約七成亮燈）、`ck_ceiling`、`ck_trim_win`、`ck_frame`、`ck_stone_base`、`wz_lamp_lens`（燈罩晚上發光）；新的：`gt_wall`、`gt_wash`、`gt_roof`、`gt_terrace`、`gt_wood`、`gt_plaster`、`gt_celadon`、`gt_misc`、`gt_palm`、`gt_palm_bark`。
- Poly Haven CC0：`exterior_wall_cladding_02`（面磚）、`granular_concrete`（洗石子）、`granite_tile_03`、`grey_roof_tiles`、`square_brick_paving`、`dark_wood`、`palm_tree_bark`。

### 20.5 給 LAWWW 的接線說明（`src/zones3d.js` 是你的，我沒有改；下面是我本機測試用的寫法）

1. 載入（和行政大樓同一套）：
   - `ckPlace(gongtong,2,33,Math.PI); buildings.push(gongtong);` 後面加：`const gtGLB=typeof ASSETS!=='undefined'&&!!ASSETS.manifest['bldg.campus_gongtong']; gongtong.userData.ckTag='gongtong'; if(gtGLB) gongtong.userData.dyn=true;`
   - 區塊最後（和 `admGLB` 那幾行一起）：`if(gtGLB) ASSETS.loadOne('bldg.campus_gongtong').then(c=>{ if(!c||!c.scene||E.zone!==zone) return; attachWenzhouModel(E,g,c.scene.clone(true),'ckTag','campus_gongtong_glb','gongtong'); }).catch(e=>console.warn('共同教學館正式模型載入失敗，用套件的外觀',e));`
2. **導航不用改**：一樓本體範圍、7 開間拱廊的 8 根柱子、門廊兩側牆的位置都和 `CK.hall` 一樣；門口互動點 `DOORS.common` (2,22.8) 不動。木造走廊的四根柱子（世界 (−10.17, 32.25／33.75)、(−14.83, 32.25／33.75)）在兩棟導航外擴（0.3 m）裡面，不用另外擋。
3. **蒲葵和大道南側的大樹牆**：蒲葵 6 棵在大樹牆那一條線上（世界座標 (−10.5,19.2)、(−6.5,18.8)、(−2.5,19.1)、(6.5,19.0)、(10.5,18.9)、(14.5,19.2)）。大樹牆在共同前面有 4 棵（x≈−10、−4.7、9.4、14.7），樹冠會和蒲葵插在一起 → 建議有 GLB 時把南側的略過範圍 `[-2,6]` 改成 `[-12,16]`（我本機測試就是這樣），並加 `nav.blockCircle(x,z,0.35)` 擋 6 棵蒲葵的樹幹。不想換的話，把 `gt_palm`、`gt_palm_bark` 兩個網格藏起來就好（其他不受影響）。
4. **鏡頭碰撞**（建議；套件預設只到 11.4 m，西翼上面是空的）：有 GLB 時在 `ckPlace` 前設 `gongtong.userData.ck.cols=[[0,-1.3,24,11.4,0,7.8],[0,5.7,24,2.6,3.85,7.8],[-3.43,1.75,17.14,10.5,7.8,11.4],[-3.43,3.5,17.14,7,11.4,15.0],[8.57,0,6.86,14,7.8,10.0],[14.5,0,5,2.0,2.8,4.1]]`（本地座標 [x,z,寬,深,y0,y1]；最後一個是木造走廊的屋頂：玩家從底下走過時鏡頭留在屋頂下面）。
5. 可以加（你決定）：蒲葵的網點透空（`gt_palm_bark`、`gt_palm` 照 `wz_pillar_tile` 那一行加 `seeThrough`）；木造走廊兩端的門加「看一看」互動（「側門關著，請由正門出入」）。
6. 測試：Playwright＋SwiftShader 截圖 沒有 JavaScript 錯誤；**沒跑** `campus_layout_nav`、`reachability_all`、`see_through`（導航沒有改；蒲葵和大樹牆的調整是你的）。

### 20.6 遊戲內截圖（左＝現在的套件方盒｜右＝正式模型；本機接線＋大樹牆前 4 棵換成蒲葵；Playwright＋SwiftShader，**不是 iPhone**）

| 鏡頭 | 修改前 draw call／三角形 | 修改後 | 倍數 |
|---|---|---|---|
| 從椰林大道往南看正門（11:00） | 116／654,983 | 124／664,174 | ×1.07／×1.01 |
| 東北邊（11:00） | 130／719,163 | 140／736,456 | ×1.08／×1.02 |
| 西北邊：西翼山牆、行政大樓（11:00） | 123／675,278 | 131／684,469 | ×1.07／×1.01 |
| 門廊近看（11:00） | 122／659,981 | 133／677,276 | ×1.09／×1.03 |
| 一樓拱廊裡（11:00） | 185／732,031 | 196／749,336 | ×1.06／×1.02 |
| 西側：兩棟中間的木造走廊（11:00） | 111／650,463 | 122／659,680 | ×1.10／×1.01 |
| 舟山路那一側（南面：退縮的露台、開放走廊）（11:00） | 247／791,763 | 252／797,530 | ×1.02／×1.01 |
| 空拍（11:00） | 240／801,779 | 257／819,148 | ×1.07／×1.02 |
| 東北邊 17:30 | 137／726,704 | 147／743,997 | ×1.07／×1.02 |
| 從椰林大道往南看正門 20:00 | 124／662,769 | 132／671,960 | ×1.06／×1.01 |
| 跟隨鏡頭：玩家在正門前（11:00） | 155／728,141 | 164／737,344 | ×1.06／×1.01 |
| 手機直向 390×844：正門前 | 137／710,428 | 151／719,183 | ×1.10／×1.01 |

| 鏡頭 | 修改前 | 修改後 |
|---|---|---|
| 從椰林大道往南看正門（11:00） | ![](shots/gongtong_before_front_axis.webp) | ![](shots/gongtong_after_front_axis.webp) |
| 東北邊（11:00） | ![](shots/gongtong_before_front_ne.webp) | ![](shots/gongtong_after_front_ne.webp) |
| 西北邊：西翼山牆、行政大樓（11:00） | ![](shots/gongtong_before_front_nw.webp) | ![](shots/gongtong_after_front_nw.webp) |
| 門廊近看（11:00） | ![](shots/gongtong_before_porch.webp) | ![](shots/gongtong_after_porch.webp) |
| 一樓拱廊裡（11:00） | ![](shots/gongtong_before_arcade.webp) | ![](shots/gongtong_after_arcade.webp) |
| 西側：兩棟中間的木造走廊（11:00） | ![](shots/gongtong_before_corridor.webp) | ![](shots/gongtong_after_corridor.webp) |
| 舟山路那一側（南面：退縮的露台、開放走廊）（11:00） | ![](shots/gongtong_before_south.webp) | ![](shots/gongtong_after_south.webp) |
| 空拍（11:00） | ![](shots/gongtong_before_aerial.webp) | ![](shots/gongtong_after_aerial.webp) |
| 東北邊 17:30 | ![](shots/gongtong_before_ne_1730.webp) | ![](shots/gongtong_after_ne_1730.webp) |
| 從椰林大道往南看正門 20:00 | ![](shots/gongtong_before_axis_2000.webp) | ![](shots/gongtong_after_axis_2000.webp) |
| 跟隨鏡頭：玩家在正門前（11:00） | ![](shots/gongtong_before_follow.webp) | ![](shots/gongtong_after_follow.webp) |
| 手機直向 390×844：正門前 | ![](shots/gongtong_before_mobile.webp) | ![](shots/gongtong_after_mobile.webp) |

### 20.7 Blender 渲染圖（Cycles，曝光 −0.8；**不是遊戲畫面**；匾額的字是遊戲畫的，這裡空白；旁邊是行政大樓的正式模型）

![](blender_renders/gongtong_front.webp)
![](blender_renders/gongtong_porch.webp)
![](blender_renders/gongtong_gable.webp)
![](blender_renders/gongtong_arcade.webp)
![](blender_renders/gongtong_front_nw.webp)
![](blender_renders/gongtong_corridor.webp)
![](blender_renders/gongtong_palms.webp)
![](blender_renders/gongtong_south.webp)
![](blender_renders/gongtong_loggia.webp)
![](blender_renders/gongtong_front_ne.webp)
![](blender_renders/gongtong_aerial.webp)

### 20.8 還沒達到參考品質的地方

1. **沒有照片**：面磚顏色、窗的形式（雙拱窗）、退縮的方向、山牆的位置、花磚的樣子、木造走廊的樣子都是依文字描述推測的。有照片要重新對。
2. 十三溝面磚的溝、面磚的真實尺寸沒做（遊戲距離看不到）；面磚是 Poly Haven 的通用面磚改色。
3. 南側的「共同三松」沒有放（舟山路太近）；西側階梯教室的戶外樓梯沒做。
4. 室內（教室、走廊）不在這個 GLB 裡：遊戲的室內是 LAWWW 的 `teach3d.js` 模板；窗裡面是暗的玻璃（晚上亮燈）。
5. 蒲葵的株數、位置、高度是遊戲化的；和大道大樹牆的關係要 LAWWW 決定。

---

## 21. 大一女舍 A、B 棟外觀＋二樓天橋＋門口（四棟清單；Blender 正式模型；**依文字資料的遊戲化設計，沒有照片**）

LAWWW 14:09Z 規格：A 棟中心 (−108,68)、B 棟 (−78,66)，各 24×12×5 層，二樓天橋（兩棟中間 6 m，下面可以走），第一階段只做外部＋門禁（男賓止步），不做室內。
腳本 `tools/blender/env_second/campus_freshman.py` → `assets/models/env/second_ai/campus_freshman.glb`（校園世界座標）；立面工具抽成 `tools/blender/env_second/archkit.py`（之後普通、博雅、社科院共用；共同教學館的腳本不動）。`src/assets3d.js` 加了 `bldg.campus_freshman`（lazy）。

### 21.1 根據

查證過的只有（住宿組大一女舍頁、暑期營隊租用宿舍簡介、臺大訪客中心地圖的搜尋摘要）：A、B 兩棟、地上 5 層（B 棟另有地下 1 層）、**沒有電梯**、**二樓天橋連通**、A 棟一樓入口有服務台＋24 小時傳達室、1991 年落成、2008 年整修、四人房、在舟山路一帶。**外觀沒查到**。
下面這些是**台灣 1990 年代大學宿舍常見的樣子**（遊戲化設計），不是照片還原：米色二丁掛面磚、一樓花崗石勒腳、每層樓板一條灰白混凝土線、寢室鋁框推拉窗＋窗上的混凝土遮陽板、部分窗下的窗型冷氣、一樓窗的鐵窗；正面中間是樓梯間（白色粉刷的直條、每個樓梯平台一扇窗、出屋頂）、兩側浴室與洗衣間的小窗；屋頂女兒牆、不鏽鋼水塔、太陽能熱水器、冷氣室外機；背面（南）寢室窗外的曬衣架與衣服。

### 21.2 做法

- 門口（套件門廊的位置：側牆 x=±2、深 2 m）：平頂雨遮、面磚側牆＋花崗石勒腳、門口地坪、鋁框玻璃雙開門（上面氣窗，晚上透出門廳的燈）、吸頂燈；名牌「大一女舍　A 棟／B 棟」、門廊左牆「男賓止步」（紅字）。
  - **A 棟**：門廊右牆的傳達室小窗（鋁框、檯面）＋名牌「傳達室」；門左邊的信箱（3×4 格）。
  - **B 棟**：門廊右牆的刷卡機（綠燈）；門左邊的公告欄。
- 二樓天橋：A 棟東牆（世界 x=−96）到 B 棟西牆（x=−90），z 65.4..68.6；地板底面離地 3.25 m（下面可以走）、面磚矮牆、帶狀鋁窗（晚上亮）、平屋頂與天花板燈；兩棟二樓各一扇通天橋的門（關著的鋁門）。
- 門口的盆栽沒有做：放在門廊外面會在導航阻擋外面，玩家會穿過去——要的話請 LAWWW 加阻擋再放。

### 21.3 驗收狀態

| 項目 | 技術（A） | 功能（B） | 美術（C） |
|---|---|---|---|
| 大一女舍外觀＋天橋＋門口（`bldg.campus_freshman`） | 完成 | **還沒接進遊戲**（LAWWW 整合；本機接線拍了截圖） | `MODEL_READY` |

### 21.4 規格

- GLB **1.19 MB**、三角形 **15,970**、網格（≈ draw call）16、材質 12、貼圖 {'256×256': 4, '64×64': 1, '512×512': 2}（共 71 KB）。
- 材質：`fd_wall`（面磚）、`fd_paint`（粉刷、樓板線、雨遮）、`fd_roof`（屋頂隔熱磚）、`fd_misc`（頂點色：冷氣、水塔、太陽能板、鐵窗、刷卡機、信箱、曬衣架）、`fd_cloth`（頂點色：衣服）＋校園地標約定的 `ck_glass`、`ck_frame`（銀色鋁框）、`ck_trim_win`、`ck_stone_base`、`ck_ceiling`、`wz_lamp_lens`。
- Poly Haven CC0：`exterior_wall_cladding_02`、`painted_plaster_wall`、`granite_tile_03`、`square_brick_paving`。

### 21.5 給 LAWWW 的接線說明

1. 大一女舍那個區塊（`fdA`、`fdB`、天橋 `br` 都在同一個 `{}` 裡）：`br.position.set(-93,0,67); g.add(br);` 後面加 `const fdGLB=typeof ASSETS!=='undefined'&&!!ASSETS.manifest['bldg.campus_freshman']; for(const o of [fdA,fdB,br]){ o.userData.ckTag='freshman'; if(fdGLB) o.userData.dyn=true; }`（天橋也要標，正式模型載入後你的天橋才會藏起來）。
2. 區塊最後：`if(typeof ASSETS!=='undefined'&&ASSETS.manifest['bldg.campus_freshman']) ASSETS.loadOne('bldg.campus_freshman').then(c=>{ if(!c||!c.scene||E.zone!==zone) return; attachWenzhouModel(E,g,c.scene.clone(true),'ckTag','campus_freshman_glb','freshman'); }).catch(e=>console.warn('大一女舍正式模型載入失敗',e));`
3. **導航、門口互動點、長椅、車架都不用改**：本體與門廊側牆的位置和套件一樣；天橋在 3.25 m 以上；你的天橋鏡頭碰撞（`bc`）照舊（正式模型的天橋在同一個範圍裡，地板底面比你的低 0.3 m）。
4. 測試：Playwright＋SwiftShader 截圖 沒有 JavaScript 錯誤。

### 21.6 遊戲內截圖（左＝現在的套件方盒｜右＝正式模型；本機接線；Playwright＋SwiftShader，**不是 iPhone**）

| 鏡頭 | 修改前 draw call／三角形 | 修改後 | 倍數 |
|---|---|---|---|
| 從舟山路看兩棟與天橋（11:00） | 68／446,878 | 63／418,322 | ×0.93／×0.94 |
| 東北邊（11:00） | 94／685,492 | 91／672,181 | ×0.97／×0.98 |
| A 棟門口：傳達室小窗、信箱、男賓止步（11:00） | 60／344,474 | 59／315,988 | ×0.98／×0.92 |
| 二樓天橋底下（11:00） | 69／417,174 | 64／388,618 | ×0.93／×0.93 |
| 跟隨鏡頭：玩家在門口長椅旁（11:00） | 113／493,886 | 108／465,330 | ×0.96／×0.94 |
| 手機直向 390×844：門口長椅旁 | 125／695,346 | 120／666,790 | ×0.96／×0.96 |

（晚上 20:00 那張不列：修改前、修改後是兩次不同的載入，路燈開關、路人的狀態不一樣，draw call 不能比。）

| 鏡頭 | 修改前 | 修改後 |
|---|---|---|
| 從舟山路看兩棟與天橋（11:00） | ![](shots/freshman_before_fd_street.webp) | ![](shots/freshman_after_fd_street.webp) |
| 東北邊（11:00） | ![](shots/freshman_before_fd_ne.webp) | ![](shots/freshman_after_fd_ne.webp) |
| A 棟門口：傳達室小窗、信箱、男賓止步（11:00） | ![](shots/freshman_before_fd_entrance_a.webp) | ![](shots/freshman_after_fd_entrance_a.webp) |
| 二樓天橋底下（11:00） | ![](shots/freshman_before_fd_bridge.webp) | ![](shots/freshman_after_fd_bridge.webp) |
| 跟隨鏡頭：玩家在門口長椅旁（11:00） | ![](shots/freshman_before_fd_follow.webp) | ![](shots/freshman_after_fd_follow.webp) |
| 從舟山路看 20:00 | ![](shots/freshman_before_fd_street_2000.webp) | ![](shots/freshman_after_fd_street_2000.webp) |
| 手機直向 390×844：門口長椅旁 | ![](shots/freshman_before_fd_mobile.webp) | ![](shots/freshman_after_fd_mobile.webp) |

### 21.7 Blender 渲染圖（Cycles，曝光 −0.8；**不是遊戲畫面**；名牌的字是遊戲畫的）

![](blender_renders/freshman_front.webp)
![](blender_renders/freshman_entrance_a.webp)
![](blender_renders/freshman_entrance_b.webp)
![](blender_renders/freshman_bridge.webp)
![](blender_renders/freshman_ne.webp)
![](blender_renders/freshman_back.webp)
![](blender_renders/freshman_aerial.webp)

### 21.8 還沒達到參考品質的地方

1. **沒有照片**：外觀全部是「台灣 1990 年代大學宿舍」的通用樣子；真實的大一女舍面磚顏色、窗型、樓梯間位置、天橋的樣子都可能不一樣。
2. 背面（曬衣）在遊戲裡幾乎看不到（靠地圖南邊界）。
3. 沒有室內；門是關著的（照規格：男賓止步）。
4. 兩棟用同一套設計（只差門口的傳達室／刷卡機、信箱／公告欄）。
