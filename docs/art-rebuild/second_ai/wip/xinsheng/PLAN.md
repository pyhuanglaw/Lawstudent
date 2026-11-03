# ART-XINSHENG-GATE-1103：新生南路側門＋新生南路店面街（PROPOSAL，LAWWW2 11-03 20:3x）

需求：AA_615 第 1～3 節、AA_622、參考圖 `ref_images/shops/xinsheng_street_b.webp`（企劃線）。D108：地圖、區域、導航由 LAWWW2 做，改 zones3d／campus **先跟 LAWWW 說**。這份是要先跟 LAWWW 說的計畫。

## 1. 校園這一側（`zones3d.js` campus，要 LAWWW 同意）
- **側門位置**：西側圍牆北段（x −124，z −141～−80 這一段，現在是一整面牆）開一個門，位置在 **(−124, −88)**。
  - 這裡是醉月湖那一側。理由：圍牆裡西北角 x −116～2、z −98～−136 是走不到的樹林，z −88 正好在樹林南緣外面。
  - 門內接一條步道往東，接到現在走得到的地方（湖南岸步道 z −97 那一帶，x ≈ −64）。步道的實際路線要照導航格調整。
  - 門的造型：照參考圖，兩根門柱寫「首都帝大」、鐵柵門開著；用 `CK.gate` 的小號版或另做，在 Blender。
- **互動**：門口「往新生南路」→ 新區域 `xinsheng`。新生南路的側門「回到首都帝大（新生南路側門）」→ 校園 (−121.5, −88, yaw π/2)。
- **背景**：校門外西北那一段（x < −124、z −141～−80）現在是背景。改成和 `xinsheng` 區域一致的街景，做法照公館（遠景用同一份配置換算座標）。
- **相容**：
  - 不動現有建築、座位、劇情站位，只在圍牆開口加導航。
  - 舊存檔：沒有人會站在新開的格子上；`p0_movement`、`reachability_all`、`campus_layout_nav` 要重跑。

## 2. 新區域 `xinsheng`（新生南路，新檔 `src/xinsheng3d.js`＋`src/data/xinsheng_layout.js`）
- **大小**：約 130 × 44 m。座標：+x 往北（沿新生南路）、−z 往西（對面是店面）、+z 是校園那一側。
- **由東往西排**：
  - 校園圍牆、側門、紅磚人行道，有大王椰子和樟樹（照參考圖 b）；
  - 新生南路：雙向四線道＋中央分隔島，斑馬線兩條，公車站一座；
  - 對面騎樓人行道；
  - 店面一排（一到三層）。
- **店面**（由南往北，暫定；座標寫進 layout，AA、BB、CC 室內的出入口對齊這裡）：
  1. 大口漢堡（路口、兩層、24 小時）；
  2. 南洋戲院（售票窗在騎樓下）；
  3. 山嵐書店（兩層、整面玻璃，3.95～4.45 m 有一條白磁磚飾帶，對齊 AA 的室內）；
  4. 同弦樂器（二樓；一樓是手機行，騎樓有樓梯口）；
  5. 大步球鞋；
  6. 好拍運動（靠側門）；
  7. 新生運動廣場（兩層）；
  8. 巷口：路牌寫「溫州街」，接 `wenzhou`。
- **立面**：Blender（`tools/blender/env_second/xinsheng_street.py`）。共用 `b3lib`，重用公館 `gongguan_shops` 的騎樓模組，每家照參考圖做招牌、櫥窗、門。
  - 遠端的公寓用低面數。
  - 招牌字全部虛構（D77），不出現真實品牌。
- **室內**：各組交件以後，我接成區域（`room()`／GLB＋layout）。店門口互動點「進 ○○」、店裡「離開 ○○」回到騎樓。

## 3. 溫州街這一側（`wenzhou`，要 LAWWW 同意）
- 新生南路巷口進來，接 `wenzhou` 的**西端**，x ≈ −55。理由：
  - 東端已經是公館巷口和兩點半；
  - 日常失速在「靠新生南路那一頭的轉角」，放西端轉角。
- 公館那個巷口照留（AA_615 1-3），舊存檔不受影響。
- **要你決定**：如果劇情或 AA_617 的木曜日、日常失速已經假設新生南路在東端，跟我說，我改成在東端另開一條巷子。

## 4. LAWWW 那邊（不歸我）
- `places.js` 加「新生南路」、溫州街的說明；
- 劇情句子；
- Alison 的作息；
- 戲院坐下看電影的流程。

## 5. 順序
1. layout＋Blender 街景（新區域，不動現有程式）；
2. 你同意以後：校園開側門、溫州街西端接口；
3. 各店室內一家一家接進來；
4. 測試：`nav_buildings`、`p0_movement`、`reachability_all`、`zone_transitions`、新的 `xinsheng_unit`。

## 進度（11-03 21:0x，`BLOCKOUT`）
- `xinsheng_layout.js`（這個資料夾，草案 v1）：店面、騎樓、馬路、斑馬線、側門、公車站、樹、路燈、溫州街巷口的座標。接進遊戲時搬到 `src/data/`。
- **街景第 0 版**：`wz_street.py` 加了 `--set xinsheng`，重用溫州街、公館的公寓和騎樓做法，照 layout 排西側一整排樓房。
  - 輸出：`xinsheng_street.glb`，21,909 個三角形、2.0 MB，還沒放進 assets。
  - 指令：`/opt/blenv/bin/python tools/blender/env_second/wz_street.py -- --set xinsheng --out <glb>`
- 圖：`blockout_v0_vs_ref.jpg`。左上從側門看、右上從南往北、左下騎樓，右下是參考圖 b。
  - **離參考圖還很遠**：
    - 七家店的店面還是一般的騎樓鐵捲門、玻璃；
    - 招牌字是空白的（遊戲畫字）；
    - 沒有地面、馬路、斑馬線、校園那一側（圍牆、側門、椰子、樟樹、公車站）；
    - 樓房太白、太整齊。
- **下一步**：
  1. 七家店改用店面組件 `wz_shopkit`。照各自的參考圖做：大口漢堡兩層玻璃＋24h 燈箱、南洋戲院舊燈箱＋海報櫥窗＋售票口、山嵐兩層整面玻璃＋白磁磚帶、同弦的樓梯口和吉他、大步白色店面、好拍窄店、運動廣場兩層。
  2. 地面 GLB：柏油、分隔島、斑馬線、紅磚人行道、騎樓地磚。照 `lane118_ground.py` 的做法。
  3. 校園那一側：圍牆、側門門柱、椰子、樟樹、候車亭。
  4. 招牌字：sign_atlas 設計稿，或遊戲用 TK.signTex 畫。
  5. 等 LAWWW 回覆 PLAN 第 1、3 節，再碰 campus、wenzhou。

## LAWWW 回覆（11-03 20:20、20:24）
- **校園開側門＋往東步道：同意。** 現有建築、座位、劇情站位不動。做好要跑：nav_buildings、reachability_all、campus_l123（圓窗館前）、campus_layout_nav。
- **溫州街接口在西端 x≈−55：同意。** AA 確認和 AA_617 第 1 節的路線對得上：
  - 側門 → 斑馬線 → 溫州街靠新生南路的轉角＝日常失速（綠遮雨棚）→ 中段老公寓二樓＝木曜日（37 號）→ 再往裡＝兩點半；
  - 從兩點半走到同弦：往回走經過木曜日、日常失速，到新生南路，沿對面騎樓**往北**。
  - 做好要跑：nav_buildings、reachability_all、touch_flow_wenzhou、wz 系列單元。
- 這件進 v9.10.19 以後的版本；先交不擋發布的部分。
- **layout 改成 v2**：照上面的路線重排店的順序。
  - 溫州街巷口在 z −5.4～2.6；
  - 往北是同弦、大步、好拍、運動廣場；
  - 往南是山嵐（側門對面，側門改在 z 10）、南洋、大口漢堡（南邊路口）。

## 區域程式 WIP（11-03 20:2x）
- `xinsheng_zone_WIP.patch`（接 b049c84e3，`git apply --check` 過）內容：
  - `src/xinsheng3d.js`：新區域 `Z3.ZONES.xinsheng`。包括導航格、套件暫代的地面／圍牆／側門門柱／方塊立面、鏡頭碰撞、側門和溫州街兩個出口、七間店門口的互動點，載入 `bldg.xinsheng_street` 立面。
  - `src/data/xinsheng_layout.js`：layout v2。
  - `tests/xinsheng_unit.js`：8 項。
  - `src/zones3d.js`：一行，Z3 匯出 `attachWenzhouModel`。
- `node tests/xinsheng_unit.js`：ALL PASS。用真的引擎 NavGrid，建起整個區域後檢查。
- **還沒做**：
  - index.html 載入、assets manifest（GLB 還沒進 assets）；
  - 校園側門那一端、溫州街西端那一端；
  - 瀏覽器截圖。
  - **所以現在套上去，遊戲裡也還走不到這裡。**

## 校園那一端：做好了（11-03 20:4x，在 `xinsheng_zone_WIP.patch` 裡）
- **側門位置改成 (−124, −84)**，原本計畫是 z −88。
  - 圍牆內 z −88 那一帶是走不到的西北角樹林；z −84 的圍牆內本來就走得到，不用另外開步道（`campus_probe`：z −80、−84 從 x −122 到 −54 都走得到）。
- **改了什麼**：
  - 西側圍牆北段原本 z −141～−80 一整段，改成兩段，中間 z −87.2～−80.8 是門洞；
  - 兩根門柱（套件暫代）；
  - 出口「往新生南路（側門）」在 (−122.6, −84)，`typeof XS3` 有才加，沒載入 xinsheng3d.js 時照舊沒有這個出口；
  - 從新生南路回來落在 (−122, −84)，面向東。
- **測試**：
  - `xinsheng_unit` 12 項 ALL PASS（新增第 9～12 項：校園出口、校園出生點站得住而且走得到校門口、側門以外的圍牆照舊擋）。
  - 這份 patch 單獨套在 b049c84e3 的乾淨 worktree 上：xinsheng_unit、nav_buildings ALL PASS。
  - 套 patch 後（另一個 worktree）又跑了：campus_l123、campus_public、ground_zfight、campus_backdrop_ground、blackforest、lib_lawn、world_rename、seat_reach，都 ALL PASS。
  - **還沒跑**（瀏覽器，慢）：reachability_all、campus_layout_nav、zone_transitions。

## 溫州街那一端：下一班做（LAWWW 11-03 20:24 同意西端）
- 現在溫州街西端是**巷底**：W0 公寓在 (−37.2, −1)，面向東、寬 14，把巷子封住。兩側是 W1 (−37.2, 11)、W2 (−37.2, −13)。
- 要做的：
  1. 拿掉 W0，巷子往西延伸到導航格邊 x ≈ −57，出口「往新生南路」放在那裡。要改的地方：
     - `wz_street.py` 的 SPECS；
     - zones3d.js buildWenzhou 的 endB 套件、導航；
     - 溫州街 GLB 重出。
  2. 日常失速放在巷口轉角（W1 或 W2 的一樓，AA_617：綠遮雨棚、從學校過來第一眼看到）。室內是 AA 的。
  3. xinsheng 的 `wenzhouLane.exit.spawn` 改成溫州街西端的真座標。
  4. 跑 nav_buildings、reachability_all、touch_flow_wenzhou、wz 系列單元測試。

### 溫州街那一端：改成打開西側橫巷的北口（11-03 20:5x，取代上面「拿掉 W0」）
- **為什麼不拿掉 W0**：W0 是巷底的住家公寓（7 號）。門口有走失貓的告示、盆栽，`WZ_PROP_BLOCKS` 兩個導航阻擋也在它的門邊。拿掉會動到已經做好、驗收過的東西。
- **改法**：西端本來就有一條南北向的橫巷（x −36.8～−30.2，z −15～15）。北口被遠景 F4（−33.4, −16.2，招牌「新生大樓」）擋住，套件和 GLB 都有它。
  1. 拿掉 F4。它是遠景（far），沒有劇情道具；拿掉以後橫巷往北接到導航格邊 z ≈ −29.5，出口「往新生南路」放在 (−33.4, −28.5)。
     - 要改的地方：`zones3d.js` buildWenzhou 的 F3／F4 迴圈（只留 F3）、`open()` 多開一段、互動點。
     - `wz_street.py` 的 SPECS 拿掉 F4，重出 wenzhou_street.glb。
     - F4 在 GLB 裡和別的樓合併成一個網格，不能只藏一個節點，所以要重出 GLB。
     - `tests/wz_street_integration.py` 的名單拿掉 F4（照實寫原因）。
  2. 日常失速放在 W2（−37.2, −13）一樓：橫巷北口的轉角。從新生南路走進來第一眼看到，對得上 AA_617。
  3. xinsheng 的 `wenzhouLane.exit.spawn` 改成 (−33.4, −27.5, yaw 0：面向南，走進橫巷)。
  4. 要跑的測試：nav_buildings、reachability_all、touch_flow_wenzhou、wz 系列單元、wz_street_integration。
- 這還是 LAWWW 同意的「西端」：橫巷在 x −33，就是巷子的西端。

## 溫州街那一端：做好了（11-03 20:3x，在 `xinsheng_zone_WIP.patch` 裡）
- **改了什麼**：
  - `wz_street.py` 的 SPECS 拿掉 F4，重出 `wenzhou_street.glb`：93,155 個三角形，原本 93,881；8.02 MB。
  - 先確認過：照舊的腳本重出一次，和開發分支的 GLB 只差 720 bytes，所以這份 GLB 只少了 F4。
  - `zones3d.js` buildWenzhou：`XSL`（有載入 xinsheng3d.js）的時候：
    - F4 的套件不放；
    - 橫巷往北多開 x −36.4～−30.6、z −29.6～−15，加一段柏油；
    - 出口「往新生南路」放在 (−33.4, −28.4)，進去落在新生南路那一側巷口、面向馬路。
  - `tests/wz_street_integration.py` 的名單拿掉 F4，原因寫在註解。
  - layout 的 `wenzhouLane.exit.spawn` 改成 (−33.4, −27, yaw 0)。
- **測試**：
  - `xinsheng_unit` 16 項 ALL PASS（新增第 13～16 項：溫州街出口、出生點、走得到兩點半和公館巷口、W0 照舊擋）。
  - nav_buildings 和 wz 系列 16 支單元測試（cat、market、park、shops、shops_lm、copy_shop、swing_front、work_spots…）、seat_reach 都 ALL PASS。
  - 單獨套在 b049c84e3 的乾淨 worktree 上：xinsheng_unit、nav_buildings、wz_shops ALL PASS。
  - 四份 patch 依序套（六法 → 總圖第五版 → 這份 → 研究小間讀者），`git apply --check` 都通過。
- **注意（不要單獨整合這份）**：
  - GLB 已經沒有 F4。如果 index.html 沒有載入 `src/data/xinsheng_layout.js`、`src/xinsheng3d.js`，溫州街橫巷北口會空一塊，而且沒有出口。
  - 整合時 index.html 要在 zones3d.js 後面加這兩行（index.html 是 LAWWW 的檔案）。
- **還沒做**：
  - 瀏覽器測試：reachability_all、campus_layout_nav、zone_transitions、touch_flow_wenzhou、wz_street_integration；
  - 新生南路的店面、地面正式模型；
  - 北口外面的遠景（現在走出去前看到的是空地）。

## 遊戲截圖（11-03 20:4x，第一次在遊戲裡看）
- **條件**：開發分支 b049c84e3 加上這份 patch；只在我的測試 worktree 裡，index.html 加兩行 script、assets 的 manifest 加 `bldg.xinsheng_street`。這兩樣都不在 patch 裡。15:00，Playwright＋SwiftShader，是桌機模擬，不是手機。
- `game_wip_v0.jpg`：
  - 左上：從新生南路側門看對面。立面 GLB 載入了，招牌字遊戲畫得出來，看得到「山嵐書店」；有樟樹、路燈。
  - 右上：騎樓。
  - 左下：校園側門。門洞開了，看出去是公館的遠景。
    - 原本兩根門柱沒有出現：用了 `TK.paint`（給 TK.Bin 合併用、要頂點色的材質），單獨的網格沒有頂點色。改成 `TK.col` 以後出現了（`campus_gate_v0.jpg`）。
    - **還要改**：門外現在看到的是公館（羅斯福路）的遠景，應該是新生南路的街景。校園背景 campusBackdrop 在 x < −124、z −141～−80 這一段，要照 xinsheng layout 換算，做法和公館一樣。
  - 右下：溫州街西側橫巷北口打開了。
- **整合時要加的**（給 LAWWW；index.html、assets3d.js 是 LAWWW 的檔案）：
  - index.html：在 `src/lane118.js` 後面加 `<script src="src/data/xinsheng_layout.js?v=…"></script>`、`<script src="src/xinsheng3d.js?v=…"></script>`；
  - assets3d.js 的 manifest：`'bldg.xinsheng_street':{url:'assets/models/env/second_ai/xinsheng_street.glb', type:'building', lazy:true, …}`；
  - GLB 本身等店面做好再交。

## 下一班的順序（11-03 20:5x 整理）
1. **側門外的遠景**：
   - 現在校園背景在 x −189 那一排（z −88～−142）是公館（羅斯福路）往北延伸的公寓。正式模型 `bldg.campus_gongguan_bd`（`gg_backdrop.py`），套件 cityRows 是備用。
   - 要改成新生南路：這一段（校園 z < −80）的店面照 xinsheng layout 換算。換算：校園 x ＝ xs.x − 142.4、校園 z ＝ xs.z − 94。側門對面是山嵐書店。
   - z −80 以南照舊是公館（羅斯福路）。
   - 要改 `gg_backdrop.py` 的那一段，以及 cityRows 第 424 行那個迴圈。
2. 七家店照參考圖做店面（`wz_shopkit` 店面組件），sign_atlas 的招牌設計稿。
3. 新生南路地面的正式模型：柏油、分隔島、斑馬線、紅磚、騎樓地磚、候車亭、側門門柱上「首都帝大」。
4. 溫州街北口外面的遠景。
5. 瀏覽器測試（reachability_all、campus_layout_nav、zone_transitions、touch_flow_wenzhou、wz_street_integration）。都過了交 LAWWW，附上 index.html、manifest 要加的那幾行。

## 新店面整合排序（LAWWW 11-03 21:38 問，LAWWW2 21:4x 回）
1. 新生南路（`xinsheng`）＋側門＋溫州街北口。
2. 木曜日（`wz_mokuyobi`）。
3. 日常失速（`wz_offbeat`，W2 一樓）。
4. 大口漢堡（`xs_dakou`）。
5. 山嵐（`xs_shanlan`）。
6. 南洋戲院（`xs_nanyang`，大廳）。
7. 同弦、大步、好拍、運動廣場（`xs_tongxian`／`xs_dabu`／`xs_haopai`／`xs_xsports`）。

每一批是一份 patch，交件時附 zone id、出入口座標。

## 使用者 11-03 22:0x（AA 轉述，企劃線 AA_615 檔首 ba26f7f7d）：溫州街只從新生南路進出
- 原話：
  - 「溫州街主要入口應該是新生南路側門 溫州街就在新生南路後面」；
  - 「舊存檔不要管了」；
  - 公館西端往溫州街的巷口：選「拿掉」。
- **改了什麼**（都是有載入 xinsheng3d.js 的時候才生效，在 patch 裡）：
  - 公館的「往溫州街」出口拿掉，巷口 (−71, 19～22.7) 用導航擋住。轉角那棟、麵店側面、巷子的街景照留。
  - 溫州街東端的「回公館」拿掉，溫州街只剩西側橫巷北口「往新生南路」一個出入口。
  - `xinsheng_unit` 加第 17、18 項：18 項 ALL PASS。nav_buildings、street_props_nav、wz_shops、seat_reach 也都 ALL PASS。
- **整合後會受影響、要 LAWWW 改的**（劇情、導覽、測試）：
  - **導覽**（guide）：去兩點半的路線原本是「走出校門 → 公館『往溫州街』」，要改成「新生南路側門 → 新生南路『往溫州街』」。`tests/guide_flow.py` 檢查「公館指向『往溫州街』」。
  - `tests/gongguan_layout_nav.py` 第 98～106 行：巷口走到溫州街、再走回來。
  - `tests/flow_day2_an.py`：快速前往溫州街，用的是手機地點，應該不受影響，還是要跑一次確認。
  - places.js「溫州街」的說明、快速移動落點：現在落在東端 (51.3, −9.8)，兩點半門口附近。
- **公館 15 間店**：使用者說要重新設計外觀和室內，會給 2D 參考圖，AA 收到以後轉給我。已經排進佇列。

### 更正（11-03 22:3x，LAWWW 22:29）：公館巷口、溫州街「回公館」由 LAWWW 改
- LAWWW 要在同一批裡一起改：拿掉公館巷口的互動點、把溫州街的「回公館」改回新生南路、手機地圖、places.js、劇情移動。
- 所以這份 patch **不刪**公館巷口的程式：上面那兩處改動（公館的「往溫州街」、溫州街的「回公館」、巷口的導航阻擋）已經從 patch 拿掉，xinsheng_unit 第 17、18 項也拿掉了。
- patch 只加新生南路那一端：新區域、校園側門、溫州街西側橫巷北口、拿掉 F4。xinsheng_unit 16 項 ALL PASS。

## 木曜日外觀的約束（AA 11-03 23:12 問，LAWWW2 選甲）
- 室內 v3 的前窗縮成 x −2.6～2.6；x 2.6～4.5 那 1.9 m 是實牆，牆前放唱片櫃、檯燈、海報，照參考圖。
- 窗台 0.75、窗頂 2.55、氣窗照舊。
- 外觀照這個開二樓的窗：木框窗＋紗簾；實牆那段外面是老公寓的磁磚牆。

## patch 改接開發分支 e95e0e4e9（11-03 23:5x）
- 開發分支從 b049c84e3 走到 e95e0e4e9（71 個 commit）。LAWWW 的「辛亥路往東南彎」改了校園圍牆那一行，我的 patch 套不上。
- 只改了那一處：西側圍牆的門洞和門柱照原本的做法，接到新的那一行後面。其他內容沒變。
- 在 e95e0e4e9 的乾淨 worktree 上測過：
  - `git apply --check` 通過；
  - xinsheng_unit 16 項、nav_buildings、wz_shops、seat_reach 都 ALL PASS。
