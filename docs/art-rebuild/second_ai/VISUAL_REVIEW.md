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

實際遊戲畫面（`tools/blender/env_second/shots/fast_shots.py`：和 `tools/shots/scene_shot.py` 同一種清單格式，只是同一種畫面大小只載入一次遊戲；清單 `tools/blender/env_second/shots/street_{before,after}.json`）。修改前＝`?nobldg`，修改後＝一般網址，同一個鏡頭、同一個時段；演出鏡頭時人物與 NPC 藏起來。 **修改後的截圖是第二輪減量（2.5.1）之後重拍的**。

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
