# GG-SHOPS3-ART-1110 六間店室內（使用者 2026-11-10 23:xx「六家的內部參考圖」）——一間一件，做好一間交一間

參考圖：`docs/art-rebuild/second_ai/ref/gg_shops6_1110/interior/`（六張，README 有每張的重點）。
共用的三個檔（之後每加一間只是加資料）：`src/data/tz_shops_layout.js`（配置）、`src/tz_shops3d.js`（區域：一間一個、資產自己登記）、`tools/blender/env_second/tz_shops_interior.py --shop <店>`（模型）、`tests/tz_shops_unit.js`（配置裡每一間都測）。

| 店 | 區域 | 狀態 |
|---|---|---|
| 泰米村食 | `tz_taimi`（汀州路） | **第 1 版已交** |
| 洗樂洗衣坊 | `tz_xile`（汀州路） | **第 1 版已交** |
| 印得好 | `tz_yindehao`（汀州路） | **第 1 版已交：`tz_shops_int_v1b_yindehao.patch`（套在泰米＋洗樂那一個後面）** |
| 安泰藥局、汀州鮮果、榮恩典文具社 | `gg_antai`、`gg_xianguo`、`gg_rongendian`（公館） | **第 1 版已交：併在 `wip/flower_notes_1110/gg_flowerB_gg3_ext_int_r2.patch`** |

## 泰米村食 第 1 版（D141 1／3）
**patch：`tz_shops_int_v1_taimi_xile.patch`（base＝dev `2a7edffd5`；泰米＋洗樂兩間一起，取代原本只有泰米的 `taimi_int_v1.patch`）**。泰米的部分：`index.html` 兩行、配置、區域、模型 `tz_taimi_interior.glb`（1.1 MB、1.6 萬三角形）、貼圖集 `tz_taimi_int_atlas.jpg`（牆上的菜色照片板、兩張街景照片，從參考圖裁）、測試、`zone_assets.js`、LICENSES。

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

## 洗樂洗衣坊 第 1 版（D141 1／3）
同一個 patch。新區域 `tz_xile`（6 × 9 m）、模型 `tz_xile_interior.glb`（1.1 萬三角形）。
照參考圖做的：白牆＋淺天藍腰帶、淺灰地磚、六支日光燈；左牆從門口往裡——三連座淺藍塑膠椅（三個座位）、兌幣機（不鏽鋼）和洗衣精販賣機（白色、看得到瓶子）、七台滾筒洗衣機；右牆四組上下疊的大烘衣機；後方木折衣桌、三個洗衣籃、置物架、後門、水槽；牆上使用說明海報（四格圖示，沒有字）、三塊層板上的黃金葛、壁扇、冷氣、監視器。沒有店員（投幣式）。
給 LAWWW 接：kind `tz_xile_wash`（洗衣機）、`tz_xile_dry`（烘衣機）、`tz_xile_change`（兌幣機・洗衣精）、`tz_xile_fold`（折衣桌）；座位 `seat.table＝'xile_t1'`（等衣服的椅子）。
和 AA_743 的差異：等拿到 AA_743 洗樂那一節再對（我這次只對了泰米）；以圖為準。
先將就的：海報沒有字；洗衣機、烘衣機的控制面板只有一塊深色板和一小塊藍色螢幕；滾筒玻璃是不透明的深色（看不到裡面的衣服）；沒有光照貼圖。預覽 `preview_xile.jpg`（Blender，不是遊戲截圖）。
`node tests/tz_shops_unit.js` 兩間都 ALL PASS。

## 印得好 第 1 版（D141 1／3）
patch `tz_shops_int_v1b_yindehao.patch`：**先套 `tz_shops_int_v1_taimi_xile.patch`，再套這一個**（只加印得好的資料、模型、貼圖集）。新區域 `tz_yindehao`（6.5 × 10 m）、模型 `tz_yindehao_interior.glb`（7 千三角形）。
照參考圖做的：左邊由門口往裡——三台落地型影印機（一台深藍色）、裁紙機、膠裝機，最裡面大圖輸出機和立著的紙捲；左牆價目表、裝訂樣品、海報樣張（參考圖裁的；價目表在圖上本來就是糊的）；右邊長櫃台（白色抽屜櫃、白檯面木邊、南端轉角接東牆）：電腦、鍵盤、標籤機、一疊疊講義、斜立的裝訂樣本、盆栽；櫃台後面右牆整面鐵層架和彩色紙；後牆冷氣、布簾、紙箱；灰色地磚、日光燈、牆角的管線。店員站櫃台後面（客人走不進去）。沒有座位。
給 LAWWW 接：kind `tz_yin_copy`（自助影印）、`tz_yin_counter`（櫃台：列印・裝訂）、`tz_yin_price`（價目表）、`tz_yin_samples`（裝訂樣本）；`zone.shopClerk` (2.3, 0.6)。
先將就的：影印機是簡化的方盒造型（紙匣、掃描台、面板有做，細節少）；價目表沒有清楚的字；沒有光照貼圖。預覽 `preview_yindehao.jpg`（Blender，不是遊戲截圖）。
`node tests/tz_shops_unit.js` 三間 ALL PASS。

## 公館三間 第 1 版（D141 1／3）：安泰藥局、汀州鮮果、榮恩典文具社
**（11-10 23:0x 更新：這個 patch 併進 `wip/flower_notes_1110/gg_flowerB_gg3_ext_int_r2.patch` 了，原檔刪掉；見那邊的 README_r2.md）** 原本的 patch `tz_shops_int_v1c_gg3.patch`：**依序套 `tz_shops_int_v1_taimi_xile.patch` → `tz_shops_int_v1b_yindehao.patch` → 這一個**。`LICENSES.md` 和花序 B 件（`flower_notes_v1b_gg_shops3.patch`）都在「花序室內」那一列後面加列，兩邊都套的時候那一檔可能要手動併；`zone_assets.js` 套完重跑 `node tools/gen_zone_assets.js`。

進出（不改 `zones3d.js`）：`src/tz_shops3d.js` 的 `hookOut` 包住 gongguan 的 build，在 G04／G08／G13 店門前（騎樓裡 z 21）加「進入＋店名」，出來站在門前人行道（z 18）；x 照實際的樓房位置。**如果花序 B 件還沒套，G04／G08／G13 門前中間還有一根騎樓柱**（B 件才拿掉），互動點在柱子後面 1.7 m，站得到、走得到，但畫面上門前有柱子。

| 店 | 區域・大小 | 照參考圖做的 | 給 LAWWW 接的 kind |
|---|---|---|---|
| 安泰藥局 | `gg_antai` 9×10 m，1.9 萬三角形 | 中間走道兩邊各一排白色雙面貨架（四層，藥盒、瓶罐）；正後方白色藥師櫃台（深綠踢腳、收銀螢幕）＋後牆整面藥品櫃、上面白底綠字招牌（**用外觀那一塊：藥罐圖示，沒有十字**——規格寫不用十字，室內參考圖上的綠十字沒照做）；左牆玻璃櫃、壁扇、時鐘；右牆兩張衛教海報（參考圖裁）、書報架、血壓計桌和黑色圓凳（一個座位）；門邊盆栽、玻璃上的綠線；格柵天花板和日光燈 | `gg_antai_counter`（藥師櫃台）、`gg_antai_shelf`（看貨架）、`gg_antai_bp`（量血壓）；`zone.shopClerk` (0, −3.95)；座位 `antai_t1` |
| 汀州鮮果 | `gg_xianguo` 8×10 m，6.2 萬三角形 | 整面開著（沒有玻璃門）；左牆三階木架，一格一格綠色塑膠籃和木箱裝水果（蘋果、芭樂、柳丁、葡萄），最上面鳳梨和西瓜；門口左邊一桌香蕉；中間木工作桌（電子秤、切好的水果盒、砧板鳳梨、桌邊粉紅條紋塑膠袋、桌下的籃子）；右牆不鏽鋼冷藏展示櫃（切好的水果盒三層）；門口右邊一籃橘子；後面紙箱堆、水槽、立扇；左牆水果壁畫（參考圖裁）；吊燈、日光燈 | `gg_fruit_pick`（挑水果）、`gg_fruit_counter`（秤重結帳）、`gg_fruit_box`（切好的水果盒）；`zone.shopClerk` (1.1, 0.45)（老闆站工作桌後面，客人走得到那一區） |
| 榮恩典文具社 | `gg_rongendian` 9×10 m，3.5 萬三角形 | 左牆整面筆（七層壓克力格，一格一把同色的筆）＋下面木櫃；中間兩座木層架（筆記本、資料夾）；右牆畫材四層（素描本、畫筆筒、顏料瓶、調色盤）；正後方木櫃台（收銀機、檯燈、筆筒）、後牆層架和紙捲、**小十字架和祝福卡**（規格：小、低調）、植物；門口左邊特價推車（黃底紅牌，沒有字）；右前方兩個木畫架、靠牆的畫布；格柵天花板、日光燈、吊扇 | `gg_rong_pens`、`gg_rong_art`、`gg_rong_notes`、`gg_rong_counter`（結帳）、`gg_rong_cart`（特價推車）；`zone.shopClerk` (−0.3, −4.05) |

和 AA_743 的差異：三間我還沒逐項對 AA_743（只對了泰米）；配置照參考圖。AA 那邊的互動點名稱（window、card、art、cart…）和這裡的 kind 不一樣的，請 AA／LAWWW 對一次，要改名我改。

先將就的：
1. 貨架上的商品是一排排彩色小方塊（藥盒、筆記本），沒有圖案、沒有字；汀州鮮果的籃子裡水果堆得不夠滿（從門口看有些籃子像空的）。
2. 汀州鮮果三角形 6.2 萬（水果一顆顆是圓的），手機上要看 CC 量的幀數。
3. 特價牌、海報架沒有字；沒有光照貼圖；窗外沒有景。
預覽 `preview_antai.jpg`、`preview_xianguo.jpg`、`preview_rongendian.jpg`（Blender，不是遊戲截圖；預覽沒有暖色燈）。

驗證：`node tests/tz_shops_unit.js` 六間 ALL PASS；相關 31 支 Node 測試只有 `gg_shops2_1104_unit` 第 6 項沒過（dev 本來就沒過）——`regression_gg3.log`。
