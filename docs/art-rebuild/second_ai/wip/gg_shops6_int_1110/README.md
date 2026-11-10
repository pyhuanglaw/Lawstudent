# GG-SHOPS3-ART-1110 六間店室內（使用者 2026-11-10 23:xx「六家的內部參考圖」）——一間一件，做好一間交一間

參考圖：`docs/art-rebuild/second_ai/ref/gg_shops6_1110/interior/`（六張，README 有每張的重點）。
共用的三個檔（之後每加一間只是加資料）：`src/data/tz_shops_layout.js`（配置）、`src/tz_shops3d.js`（區域：一間一個、資產自己登記）、`tools/blender/env_second/tz_shops_interior.py --shop <店>`（模型）、`tests/tz_shops_unit.js`（配置裡每一間都測）。

| 店 | 區域 | 狀態 |
|---|---|---|
| 泰米村食 | `tz_taimi`（汀州路） | **第 1 版已交：`taimi_int_v1.patch`** |
| 洗樂洗衣坊 | `tz_xile`（汀州路） | 下一間 |
| 印得好 | `tz_yindehao`（汀州路） | 還沒做 |
| 安泰藥局、汀州鮮果、榮恩典文具社 | 公館 | 還沒做（公館那邊的店門入口要 LAWWW 接，或照花序用包住 build 的方式加） |

## 泰米村食 第 1 版（D141 1／3）
patch `taimi_int_v1.patch`（base＝dev `2a7edffd5`）：`index.html` 兩行、配置、區域、模型 `tz_taimi_interior.glb`（1.1 MB、1.6 萬三角形）、貼圖集 `tz_taimi_int_atlas.jpg`（牆上的菜色照片板、兩張街景照片，從參考圖裁）、測試、`zone_assets.js`、LICENSES。

照參考圖做的：8 × 10 m；左牆皮面長卡座＋五張兩人木桌；右邊三張四人木桌、深色木椅皮坐墊；右牆大幅菜色照片板；正後方木櫃台（直紋木板、底下燈條、收銀螢幕、蘭花、醬料瓶）；後面開放式廚房（不鏽鋼、排煙罩、鍋、冰箱）、紅格紋布棚；左後方隔牆和格紋布簾的門；藤編吊燈九盞；左牆街景照片、藤編圓盤、層板和蕨類；裸露風管、冷氣出風口、軌道燈；灰色石紋地磚；門口兩側深木框窗、門上的米色布簾（和外觀一樣）。**22 個座位**（卡座 5、兩人桌椅子 5、四人桌 12）。

進出：汀州路泰米村食門口原本是「看泰米村食」，有了區域就自動變成「進泰米村食」（tingzhou3d.js 原本就這樣寫）；店裡門口「離開泰米村食」→ 汀州路店門前的騎樓外緣（−5.4, −1.0）。

給 LAWWW 接：互動點 kind `tz_taimi_order`（櫃台前「點餐」）、`tz_taimi_menu`（右牆菜單）、`tz_taimi_kitchen`、`tz_taimi_photo`——現在只有一句暫時的「看」；`zone.shopClerk`（老闆娘站櫃台後面 (1.3, −3.45)）；座位 `seat.table＝'taimi_t<桌號>'`；places／營業時間、eat3d 登記、crowd。

### 和 AA_743 不一樣的地方（圖來以前寫的；以圖為準，請 AA 改文件）
| AA_743 | 參考圖／這一版 |
|---|---|
| 11.2 × 8 m，店面寬 | 8 × 10 m，窄深（汀州路這一間店面寬 8 m；圖也是深的） |
| 廚房在隔牆後面，只開一個出餐窗口 | 開放式廚房在櫃台後面，上面紅格紋布棚 |
| 兩人桌 3、四人桌 4（靠左牆是獨立的兩人桌） | 左牆長卡座＋兩人桌 5、四人桌 3；座位數一樣 22 |
| 泰國的裝飾只有兩樣（家鄉照片、手織桌旗） | 圖上有兩張街景照片、藤編圓盤、藤編吊燈、格紋布——照圖；沒有大象、佛像 |
| 地板淺米色陶磚 | 灰色石紋地磚 |
| 菜單板在出餐窗口上方 | 菜色照片板在右牆 |
| 互動點 condiments、photo、menu、kitchen、order | 這一版有 order、menu、kitchen、photo；餐具調味料在每張桌上（沒有獨立的調味料架），condiments 沒做 |

### 先將就的
1. 預覽（`preview_taimi.jpg`，Blender，不是遊戲截圖）沒有暖色的光；遊戲裡區域開了暖色（warm），實際顏色等 CC 拍。沒有光照貼圖。
2. 布簾、布棚是平的色條，沒有布的垂墜；廚房只有大件；卡座靠枕簡單。
3. 桌上只有餐具筒、面紙盒、辣椒罐；沒有餐點。
4. 窗外沒有景（從店裡往門口看是空的）。

### 驗證
- `node tests/tz_shops_unit.js` ALL PASS（13 項；沒有這一件時第 0 項失敗）。
- 相關 28 支 Node 測試（`regression_taimi.log`）：只有 `gg_shops2_1104_unit` 第 6 項沒過——dev `2a7edffd5` 本來就沒過（大地圖判定 afar、daybreak），不是這一件。
