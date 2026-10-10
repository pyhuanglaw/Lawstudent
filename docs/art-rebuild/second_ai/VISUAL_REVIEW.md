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
| `assets/models/env/second_ai/cafe_exterior.glb` | 1.94 MB（目標 ≤ 2.5 MB） | 27,096（畫出 33,796） | 51 個網格、約 56 次 draw call（6 組 instancing：鐵窗、雨遮、冷氣、桌、椅、高腳椅） | 46 | 27 張 WebP（512×512 ×13、256×256 ×13、色票 8×1）共 504 KB |
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

實際執行遊戲的畫面（`tools/shots/scene_shot.py`；清單 `tools/blender/env_second/shots/cafe_{before,after}.json`）。修改前＝`?nobldg`，修改後＝一般網址，同一個鏡頭、同一個時段。人物在店外的演出鏡頭藏起來；NPC 都藏起來（只看場景）。

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
