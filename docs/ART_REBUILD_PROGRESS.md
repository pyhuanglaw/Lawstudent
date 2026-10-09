# 3D 美術重建 v1：工作日誌（ART REBUILD PROGRESS）

> 這份文件是本次「3D 美術重建 v1」的即時工作日誌，**每次 push 都會一起更新**。其他 AI 或開發者可以從這裡接手。
> 需求原文：`docs/history/specs/20_3D美術重建v1_人物與溫州街.txt`。
> 開發分支：`claude/friendly-brahmagupta-6bbkzc`（本工作階段被設定只能推這個分支；它就是獨立開發分支，**沒有動 `main`**，也沒有 force push）。
> 截圖：`docs/art-rebuild/screenshots/`（全部是實際執行遊戲或模型檢視頁的渲染結果；檔名規則見最後一節）。

---

## CURRENTLY WORKING ON — 現在正在修改什麼

- **最近更新**：2026-10-09（台灣時間，v9.3 第二批）
- **最新已推送 commit**：`66374e2`（v9.3 第三批：黃昏人物輪廓光、陳語彤領口、宿舍與溫州街窄縫卡住；測試全部 PASS）；之前是 `7a4eca6`（第二批）、`ad76109`（第一批）。分支 `claude/friendly-brahmagupta-6bbkzc`，PR：https://github.com/pyhuanglaw/Lawstudent/pull/1
- **畫面驗收**：[`docs/art-rebuild/VISUAL_REVIEW.md`](art-rebuild/VISUAL_REVIEW.md)。**美術規範**：[`docs/art-rebuild/ART_DIRECTION.md`](art-rebuild/ART_DIRECTION.md)（參考圖在 `docs/art-rebuild/references/`）

### 這次完成（v9.3 第三批，`e094b32` 之後）

| 項目 | 狀態 | 玩家會看到什麼 |
|---|---|---|
| 黃昏人物輪廓光 | 技術完成；READY_FOR_ART_REVIEW | 17:00–18:40 在室外，人物的頭髮邊緣有暖金色的光（像參考圖 07 被夕陽從後面照到），上衣邊緣淡淡一層；白天、晚上、室內不會出現。褲子、鞋子、皮膚、臉不加：試過全身都加，深色褲子會變成偏棕的塑膠光澤，所以拿掉 |
| 陳語彤領口 | 技術完成；READY_FOR_ART_REVIEW | 圓領兩側原本留著兩片帽口的尖角（臉部近景看起來是脖子旁邊的深色尖片），現在領口是平順的圓領（#30） |
| 移動：窄縫卡住 | FIXED（Playwright＋直接重現） | 宿舍書桌後面、床頭旁，以及溫州街兩處比人窄的縫，不會再把人卡住；被卡在窄處往前推時，會往左右偏一點找路出來（#31） |

測試（最終版，Playwright 模擬）：`campus_layout_nav` 29/29、`p0_movement` 31/31、`movement_regression` 42/42（A 組宿舍另外多跑 3 次都 7/7）、`touch_flow_wenzhou` 21/21、`sim_hair` PASS、`nav_islands` 11 個區域 ALL CLEAR，全部 PASS。

### 這次完成（v9.3 第二批，`ad76109` 之後）

| 項目 | 狀態 | 玩家會看到什麼 |
|---|---|---|
| 頭髮被甩起來（所有 VRM 角色，林芷若最明顯） | FIXED（遊戲內走路照＋Node 模擬驗證） | 走路、轉身、讀檔瞬移、手機卡頓時，長髮不再在耳朵高度往兩側翹。上一批以為是手臂碰撞體，改了沒用；真正原因見技術問題 #25 |
| 林芷若：眼鏡 | FIXED | 側面看不再有兩根細線從臉前面伸出去（鏡腳方向反了，#26） |
| 林芷若：領口 | 技術完成；READY_FOR_ART_REVIEW | 荷葉邊高領剪成圓領，看得到脖子和鎖骨（參考圖是開領上衣） |
| 溫書瑀：低馬尾 | 技術完成；READY_FOR_ART_REVIEW | 頭髮沿著頭收到後頸、深色髮圈、一束馬尾沿背垂下，臉旁前髮剪到下巴。原本從側面看是一片往後翹的長直髮 |
| 溫書瑀：長袖 | 技術完成；READY_FOR_ART_REVIEW | 白襯衫袖子接長到前臂、反摺袖口（參考圖）。VRoid 樣本只有短袖，袖管是程式接上去的 |
| 黃昏光線 | 技術完成；**效果很小，需要使用者看過** | 17:00–18:00 的陽光與天空略調亮、偏暖，雲的陰影不再偏紫。實際畫面平均亮度只多約 3%，Café 前的街道大部分在建築陰影裡，修改前後幾乎看不出差別。要接近參考圖的金色光，需要人物輪廓光與整體色調等較大的改動（下一步，做之前先給使用者看） |
| 晚上的 Café 門口 | 技術完成；READY_FOR_ART_REVIEW | Café 櫥窗的暖光灑到騎樓和路面；路口往北的路多一盞路燈。原本 Café 前的路面晚上是一片均勻的暗色 |
| 路口往北延伸 | 技術完成；READY_FOR_ART_REVIEW | 從 Café 前往北看，是延伸的路、兩側公寓、行道樹和天空。原本是一棟 6 樓公寓的牆；可走範圍用道路施工護欄與三角錐擋住，不是隱形牆 |
| 日式老屋屋頂 | 技術完成 | 寄棟（四坡）屋頂。原本是金字塔形屋頂，上面還浮著一根屋脊 |
| 校園長距離點地移動 | FIXED | 從霖澤館點地到校門走得到（#24） |
| 舊存檔安全（預防） | 技術完成 | 讀舊存檔被移位時，如果移到的空地走不到區域出生點，改放到出生點（#27）。目前的三個測試位置用舊程式也走得到，這是預防 |
| Café 三時段照片 | 重拍 | 第一批拍的照片鏡頭在南側建築裡面，右邊三分之一是一片灰牆（#28）；換到路口重拍 |

### v9.3 第一批（`ad76109`）


| 項目 | 狀態 | 玩家會看到什麼 |
|---|---|---|
| 校園依台大校總區平面圖重排（使用者 2026-10-09） | 技術完成；功能完成（導航測試）；READY_FOR_ART_REVIEW | 走椰林大道往東，盡頭就是總圖（有三角山牆的門廊）；傅鐘在大道南側、後面是行政大樓，文學院在正對面；校史館、農業陳列館靠大門；文學院北邊有醉月湖（湖心亭走得上去、睡蓮、湖畔長椅）；小椰林道兩排椰子樹通到法學院。決策 D23、D25 |
| 大王椰子、闊葉樹 | 技術完成；READY_FOR_ART_REVIEW | 椰林大道和小椰林道換成筆直灰白樹幹、綠色葉鞘、拱形羽狀葉的大王椰子（原本是彎曲的椰子樹）；校園和公館的方塊葉樹、針葉樹換成闊葉樹；大道中間不像台大的花圃分隔島拿掉，兩側改成杜鵑綠叢 |
| 舊存檔安全 | 技術完成 | 霖澤館、宿舍、校門座標沒動；舊存檔如果站在改版後的新建築或湖裡，讀檔會被移到最近的空地（再不行回到區域出生點） |
| 溫書瑀 | PARTIAL | 背心的 V 領線和描邊拿掉、髮色真的變深棕（原本材質乘了深藍色）、拿掉 X 髮夾、褲子改直筒。仍是短袖（參考圖是長袖反摺），低馬尾不明顯 |
| 高子晴 | 技術完成；READY_FOR_ART_REVIEW | 拿掉頭頂呆毛、臉頰科幻花紋、手上手套殘影、短褲中間垂下的布片；黑色短褲（參考圖）；眉毛眼線從淺藍灰改深棕 |
| 林芷若 | PARTIAL | 頭頂翹起的側馬尾殘段拿掉、眼睛的青色反光換成白色、眉毛改深色；頭髮仍是直的（微捲 BLOCKED_BY_ART_ASSET） |
| 陳語彤 | 技術完成；READY_FOR_ART_REVIEW | T 恤改成圓領（原本是帽子剪掉後的漏斗領）、下擺和袖口平整、黑髮不再偏藍、眉毛改深色、拿掉髮夾、頭髮拉長接近齊肩 |
| 沈以安 | 技術完成；READY_FOR_ART_REVIEW | 針織衫領口改成圓領（原本像襯衫領片） |
| 人物配件顏色 | 技術完成 | 吉他袋、後背包不再是全黑剪影（看得到布紋、拉鍊） |
| 中午淺色衣服過曝 | 技術完成；**亮度需要使用者看過** | 米白針織衫、淺灰上衣在中午不再曝成全白 |
| 日式老屋 | 技術完成；READY_FOR_ART_REVIEW | 圍牆降到 1.15 m、門開著；從巷子看得到木造外觀、有窗框的格子窗、玄關（小屋頂、木格拉門、門燈）、踏石、石燈籠、矮籬 |
| 小公園 | 技術完成；READY_FOR_ART_REVIEW | 鋪面步道＋圓形小廣場、大樹＋可以坐的樹圍座椅、兩側灌木、單槓、公園路燈（晚上照亮地面）、長椅上睡覺的橘貓 |


### 測試結果

| 測試 | 對象 | 結果 |
|---|---|---|
| `tests/campus_layout_nav.py`（17 個地點走得到、8 個點不能走、3 個舊存檔位置讀檔後站得住**而且走得到霖澤館前**、沒有 JS 例外） | 最終版 | **29/29 ALL PASS** |
| `tests/p0_movement.py`（iPhone 模擬、CDP 觸控搖桿，各區域上下左右） | 最終版 | **31/31 ALL PASS** |
| `tests/movement_regression.py`（A 宿舍／B 坐下起身／C ADV／D 存讀檔／E 各區域） | 最終版 | **42/42 PASS** |
| `tests/touch_flow_wenzhou.py`（只用觸控：溫州街 → Café 進出 → 存到欄位 → 重新整理讀回 → 再走） | 最終版 | **21/21 ALL PASS** |
| 同上四項 | A* 修正後、頭髮修正前 | 29/29、31/31、42/42、21/21，全部 PASS |
| Node 模擬（three.js＋three-vrm＋遊戲的 `CHAR`，不算圖）：0.3 秒一幀、人物移動時的髮尾高度 | 頭髮修正 | 修正前林芷若髮尾平均比站著高 12–16 cm（翹起來）；修正後六位角色走路與站著相差 ≤ 6 mm |

「最終版」＝這次 push 的程式與模型（含頭髮修正、林芷若與溫書瑀新模型、黃昏光線微調、路燈）。全部是 Playwright（Chromium SwiftShader）模擬，**不是手機實機**。

### 正在做／接下來

1. 三時段光影（任務 8）：黃昏調整後，校園、公館的傍晚也要截圖確認；溫州街其他巷段晚上的店家燈光。
2. 陳語彤：T 恤領口兩側看得到深色內層和小尖角（臉部近景）。
3. 林芷若微捲髮（BLOCKED_BY_ART_ASSET：VRoid 樣本沒有捲髮）、高子晴帽口兩側的白色髮尾、沈以安托特包太硬。
4. 臉：仍是 VRoid 動畫臉（BLOCKED_BY_ART_ASSET）。

## 進度總表

| 項目 | 目前狀態 | 正在修改什麼 | 已完成什麼 | 下一步 | 相關檔案 |
|---|---|---|---|---|---|
| 男性角色 | PARTIAL | — | 祐廷：VRoid CC0「HairSample_Male」改作（自然黑短髮、拿掉呆毛、淺灰圓領上衣、深灰直筒褲、白球鞋、黑色後背包配件）；阿哲：「Sakurada Fumiriya」＋移植連帽上衣；男性路人底模 2 種 | 男性臉型只有 2 種（樣本限制）；祐廷頭髮更厚、更柔需要新的髮型素材（BLOCKED_BY_ART_ASSET） | `tools/vroid_build.py`、`assets/models/char/vroid_yuting.vrm`、`vroid_zhe.vrm`、`vroid_npc_m1.vrm`、`vroid_npc_m2.vrm`、`src/props3d.js` |
| 女性角色 | PARTIAL | 細修（陳語彤領口、林芷若髮型） | 五位女主角各有自己的模型與服裝（不是路人換色）：沈以安（單一高馬尾、米白針織衫、藍灰寬褲、樂福鞋、托特包）；林芷若（黑直髮、細框眼鏡、米色亞麻上衣改圓領、米灰寬褲、銀色小耳環、工作時圍裙）；陳語彤（黑髮接近齊肩、深灰圓領 T 恤、牛仔褲、後背包）；高子晴（深棕短髮、淺灰連帽外套、黑短褲、白球鞋、吉他袋）；溫書瑀（深棕低馬尾＋髮圈、白襯衫反摺長袖、卡其直筒褲、判決節錄資料夾）。轉身照見 VISUAL_REVIEW 第 2–5 節 | 臉是 VRoid 動畫臉（BLOCKED_BY_ART_ASSET）；林芷若微捲髮（BLOCKED_BY_ART_ASSET）；陳語彤領口兩側的深色內層；高子晴帽口白色髮尾 | `tools/vroid_build.py`、`assets/models/char/vroid_heroine_0[1-5].vrm`、`src/props3d.js`、`src/character3d.js`（`MODEL_PROPS`） |
| VRM 系統 | 技術完成 | — | parse 一次＋骨架 clone 共用 GPU 資源；VRM 0.x 朝向與姿勢軸向；身高計算；換色（材質顏色相乘）；路人不投即時陰影改圓影；NPC frustum culling；載入失敗在 `?dev` 顯示；彈簧骨在人物座標系、固定小步長，更新前先更新 world matrix（#25）；配件掛在骨頭上（`src/props3d.js`） | 動畫仍是 Mixamo（授權疑慮，見 REVIEW_NOTES）；clone 沒有彈簧骨與表情（路人頭髮不會晃）；手機實機效能未測 | `src/assets3d.js`、`src/character3d.js`、`src/engine3d.js`、`src/props3d.js` |
| 溫州街 | PARTIAL | 三時段光影 | 10 m 巷道、20+ 棟台北公寓（磁磚、鐵窗、冷氣、陽台、雨遮、水塔、加蓋）、店面（含兩點半 Café：有深度的室內、木窗框、壁燈、爬藤）、日式老屋（圍牆降低、玄關、寄棟屋頂、石燈籠）、小公園（鋪面、大樹＋樹圍座椅、路燈、睡覺的貓）、騎樓、死巷、電線桿＋電線＋路燈、反光鏡、機車、盆栽、行道樹；Café 在東端路口，路口往北延伸到天空；白天／黃昏／夜晚光線；NavGrid 與鏡頭碰撞同步 | 騎腳踏車的 NPC 很粗糙（W3.bike）；雨天地面反光未做；只有 Café 能進，其他店是「看櫥窗」；日式老屋側面與背面是平的雨淋板 | `src/townkit3d.js`、`src/zones3d.js`（`buildWenzhou`） |
| NPC 動畫 | PARTIAL | — | VRM 0.x 坐／讀書／揮手／說話軸向修正；教室同學坐下面向黑板 | 騎腳踏車沒有踩踏動畫（VRM 沒有 P3 的 parts）；路人 clone 沒有表情 | `src/character3d.js`、`src/story3d.js` |
| 互動與存檔 | 技術完成；功能完成（Playwright） | — | 標題畫面不再自動存檔覆蓋進度；Café 裡有人坐的位子不擋說話；觸控存檔到欄位、重新整理後讀回、讀檔後可以走；互動按鈕不蓋搖桿；校園改版後舊存檔移位（含「走得到」檢查）——全部 PASS | 手機實機未測 | `src/game3d.js`、`src/engine3d.js`、`index.html`、`tests/touch_flow_wenzhou.py`、`tests/campus_layout_nav.py` |

---

## 技術問題紀錄（不會因為做下一項就刪掉）

| # | 問題 | 原因 | 狀態 | 相關檔案 | 測試 | 還有什麼問題 |
|---|---|---|---|---|---|---|
| 1 | 霖澤館教室裡同學方向錯誤（使用者回報） | `story3d.js` 把路人同學放到座位上時只設位置、沒設 `rotation.y = seat.yaw`，所以 yaw=0 朝教室後方 | FIXED | `src/story3d.js`（populate 的 classroom 兩段） | Playwright：教室所有坐著的 NPC yaw=π（面向黑板）；截圖 `classroom_students_face_board_fixed.png` | 只修了教室；其他區域的座位都有設 yaw（已逐一檢查 `isExtra` 的建立處） |
| 2 | VRM 0.x 模型 180° 朝向 | three-vrm 用 `rotateVRM0` 把整個 scene 轉 180°，但 `buildVRM` 之後做了 `model.rotation.set(0,0,0)` 把它轉回去，VRoid 模型會背對前進方向 | FIXED | `src/character3d.js`（外層 `vrmWrap`） | 渲染截圖：人物正面朝前進方向 | 骨架 clone 也要轉（`assets3d.js` 的 `cloneVRM` 已處理） |
| 3 | VRM 坐下與讀書的旋轉軸 | VRM 0.x 的 normalized rig 在模型空間朝 -Z，直接寫骨頭 Euler 時 x、z 方向相反（腿往後坐） | FIXED | `src/character3d.js`（`setBonesV`、`sx`） | 截圖 `WIP_hairfix_pending_char_an_sit.png`（坐在長椅）、`flow_05_sit.png` | 坐下高度用固定值 0.47×身高比例，部分角色可能略浮或略沉 |
| 4 | VRM instance 重複載入浪費 GPU 記憶體 | 舊的 VRM pool 每個實例重新 parse 一次檔案，貼圖在 GPU 重複 | FIXED | `src/assets3d.js`（`cloneVRM`、`acquireVRM`） | 溫州街／教室實測：所有 NPC driver=vrm，沒有 clone 錯誤 | clone 沒有彈簧骨與表情（設計取捨） |
| 5 | VRoid 頭髮 primitive 太多（draw call） | VRoid 匯出時頭髮拆成 40–80 個同材質 primitive | FIXED | `tools/vroid_build.py`（`merge_prims`） | 溫州街整體約 275 draw call（含人物與陰影 pass） | 手機實機 FPS 尚未測 |
| 6 | 衣物移植後手臂消失 | VRoid 同一個 mesh 的 primitive 共用整個頂點緩衝，移植時把整個身體的頂點都帶過來，遮蔽測試把手臂附近的皮膚全刪了 | FIXED | `tools/vroid_build.py`（`transplant` 只取用到的頂點；`hide_covered` 加切線距離限制） | 模型檢視截圖：手臂正常 | — |
| 7 | 女性 NPC（npc_f2）臉部深色條紋 | 調查中：低解析的檢視截圖裡看起來像瀏海染深色後蓋住眼睛；近距離檢視時臉部正常 | NEEDS RECHECK | `tools/vroid_build.py`（`build_npc_f2`） | 近距離模型檢視：正常；遊戲中遠距離尚未專門檢查 | 需要在遊戲裡近距離截圖確認 |
| 8 | Café 座位互動擋住沈以安 | 沈以安坐的位置正好是桌子「坐在這一桌」互動點，互動按鈕只取最近的一個 | FIXED | `src/engine3d.js`（`nearestInteractable`：有人坐的座位不顯示、人優先 0.5m） | 觸控測試 PASS：「靠近沈以安出現對話按鈕」「和沈以安的對話有內容並結束」 | — |
| 9 | 存檔欄位點擊失敗 | (a) 測試腳本點錯按鈕（點到自動存檔那列的「讀取」）→ 已修測試；(b) **真正的 bug**：標題畫面開啟的存檔選單被標題畫面蓋住（兩個 `.panel` 同為 z-index 8，標題在 DOM 後面） | FIXED（`#menu{z-index:9}`、`#toast{z-index:10}`，commit 7f38a46）；**已測試通過** | `tests/touch_flow_wenzhou.py`、`index.html` | 觸控測試：存到欄位 1、重新整理後讀回欄位 1、讀檔後可以走，全部 PASS | — |
| 10 | 溫州街 `townkit3d.js` 場景製作 | 原本的溫州街是 38m 寬的空柏油地＋一棟方盒 | PARTIAL | `src/townkit3d.js`、`src/zones3d.js` | 白天／黃昏／夜晚截圖；觸控測試走完整條街 | 見總表「溫州街」的下一步 |
| 11 | （新發現）自動存檔被空白第一天覆蓋 | 45 秒自動存檔計時在標題畫面也會跑，載入慢或停在標題 45 秒就會把真正的進度蓋掉 | FIXED | `src/game3d.js`（`autosave` 在 `titleIdle` 時不存） | 觸控測試：從標題點「繼續」讀到正確的溫州街存檔 PASS | — |
| 12 | （新發現）直向時小地圖蓋住 ☰ 選單按鈕 | `#minimap` 的基本 CSS 寫在 portrait media query 後面，把直向位置蓋掉 | FIXED | `index.html` | 截圖：直向時 ☰ 可見 | 橫向未重新截圖 |
| 13 | （新發現）沈以安的頭髮是「貓耳＋雙馬尾」 | HairSample_Female 是 VRoid 的髮型示範樣本 | FIXED（模型與遊戲內轉身照） | `tools/vroid_build.py`（`ponytail_from_twintails`、`add_ponytail_chain`） | 遊戲內正面／側面／背面：單一高馬尾 | v9.2 加了三節彈簧骨，走路時馬尾會擺動 |
| 14 | （新發現）胸部穿出上衣 | 原模型上衣領口開很低、身體比衣服大 | FIXED | `tools/vroid_build.py`（`paint_skin`、對模型自己的上衣做 `hide_covered`） | 模型檢視：上衣正常 | — |
| 15 | （新發現）互動按鈕蓋住搖桿 | `#interact` 沒有最大寬度，長標籤讓按鈕延伸到左下角搖桿上方（DOM 在後面，會吃掉觸控） | FIXED；**已測試通過** | `index.html`、`src/zones3d.js`、`tests/touch_flow_wenzhou.py` | 觸控測試「互動按鈕不會蓋住搖桿」PASS | 其他長標籤（例如「和法律系一年級的女生說話」）會換成兩行 |
| 16 | movement_regression B3 失敗 | 測試挑到有 NPC 坐著的座位（v9 起不能坐），且測試放玩家的點半徑 0.3 站不下 | FIXED（只改測試的挑座位與放置方式，判定標準不變）；**B 組已測試通過 4/4** | `tests/movement_regression.py` | `python3 tests/movement_regression.py URL B` → 4/4 PASS | 完整 A–E 下一輪程式改動後再整套重跑 |
| 17 | 沿著家具邊直走會卡住（v9.2） | `stepEntity` 的「沿牆滑動」分支在位移為 0 時也算成功，玩家原地不動 | FIXED | `src/engine3d.js` | movement_regression 42/42 | — |
| 18 | 吉他袋、後背包在遊戲裡是全黑剪影（看不到拉鍊、背帶） | 配件材質的顏色＝布紋貼圖的顏色，兩者相乘變成顏色平方（深色 → 接近黑） | FIXED（有貼圖時材質用白色） | `src/props3d.js` | 遊戲內轉身照 | — |
| 19 | 中午的淺色衣服（米白針織衫、淺灰上衣、白襯衫）曝成一片白 | MToon 卡通明暗：受光面拿到整個太陽亮度（不乘入射角），建築牆面卻有乘；淺色衣服在 ACES 色調映射後變白 | FIXED（衣服材質 ×0.8，皮膚臉頭髮不動）；**亮度需要使用者看過** | `src/character3d.js`（`C.CLOTH_K`） | 遊戲內轉身照 11:00 | 黃昏／夜晚衣服會略暗 |
| 20 | 頭髮、眉毛顏色改不過來（溫書瑀染棕還是黑、高子晴眉毛淺藍、林芷若眉毛淺米） | VRoid 樣本的頭髮／眉毛材質有顏色乘數（Shino 深藍、Vita 淺藍灰、Victoria 金髮米色），貼圖再怎麼改都會被乘 | FIXED | `tools/vroid_build.py`（`hair_factor_reset`、`face_line_colors`） | 模型檢視＋遊戲內臉部近景 | — |
| 21 | 剪短的衣褲邊緣是鋸齒；短褲大腿中間垂下一片布 | 以三角形為單位剪裁會留下跨線三角形；移植的長褲兩腿之間有連接面（寬褲看不出來） | FIXED | `tools/vroid_build.py`（`flatten_hem`、`remove_center_curtain`、`cut_sleeves(clean)`、`crew_neck`） | 模型檢視 | — |
| 22 | 總圖門口有一塊黑色三角形擋住館名 | 門廊山牆用了 3 邊的圓錐（尖錐），正面看是黑色三角形 | FIXED（改成三角柱山牆＋屋面，館名往上移） | `src/zones3d.js` | 校園截圖 | — |
| 23 | 校園改版後，舊存檔可能站在新建築或湖裡 | 原本只在 8 m 內找空地 | FIXED（擴大到 45 m，再不行回到區域出生點） | `src/engine3d.js` loadZone | `tests/campus_layout_nav.py` | — |
| 24 | 校園改版後，從霖澤館前點地移動到校門走不到（`tests/campus_layout_nav.py` 抓到；舊版走得到） | A* 搜尋上限 6 萬步；新增醉月湖、樹列後，長路徑展開的格子超過上限，回傳「沒有路」 | FIXED（上限 20 萬步、啟發函數 ×1.1；長路徑 27 ms） | `src/engine3d.js`（`NavGrid.path`） | campus_layout_nav、p0、回歸、觸控流程（重跑） | 路徑最多比最短路徑長 10%（之後還會直線平滑） |
| 25 | 林芷若走路時，長髮在耳朵高度往兩側翹（所有 VRM 角色都會，長髮最明顯；站著剛生成時也會） | **第一次判斷錯了**：以為是手臂碰撞體把頭髮往外推，改成頭髮只和頭、脖子、胸、脊椎碰撞之後重拍，還是翹。用 Node 載入遊戲的 three.js＋three-vrm＋`CHAR` 逐步模擬才找到真正原因：three-vrm 用「子骨頭的 matrixWorld」算每一節頭髮的骨長，但子骨頭的 matrixWorld 還停在上一幀；人物移動、瞬移或動畫之後，低幀率時一幀差幾十公分，骨長算錯，頭髮被當成甩出去。和碰撞體無關（拿掉所有碰撞體一樣會翹） | FIXED（彈簧骨更新前先更新整個 VRM 的 world matrix） | `src/character3d.js`（`updateVRM`） | Node 模擬：0.3 秒一幀、人物移動時，林芷若髮尾平均比站著高 12–16 cm → 修正後六位角色走路和站著相差 ≤ 6 mm；遊戲內轉身照：站著、走路的頭髮都自然下垂 | 30 fps 手機上誤差較小（一幀約 4–5 cm），原本髮尾會抖；實機未測。上一批加的「頭髮不和手臂碰撞」保留（不影響結果） |
| 26 | 林芷若的眼鏡從側面看，有兩根細線從臉前面伸出去 | 眼鏡整組轉 180°（模型檔空間的前方是 -z），鏡腳卻還是往 +z 畫，轉完就變成往前伸 | FIXED | `src/props3d.js`（`glasses`） | Node：鏡腳從鏡框往後約 10 cm（到眼睛後方）；遊戲內側面照 | — |
| 27 | 讀舊存檔被移位時，可能被移到新建築後面的封閉空地（走不出來） | 只找最近的空地，沒有檢查走不走得到 | 預防（目前三個測試位置用舊程式也走得到） | `src/engine3d.js`（`loadZone`） | `campus_layout_nav`：三個舊存檔位置讀檔後都走得到霖澤館前 | — |
| 28 | v9.3 第一批的 Café 三時段照片，右邊三分之一是一片灰牆 | 拍照鏡頭放在 Café 南側那棟建築的範圍裡，拍到的是建築內側（遊戲本身沒有問題，玩家走不進去） | FIXED（換鏡頭重拍；有問題的照片沒有 commit） | 拍照設定 | 重拍照片 | — |
| 29 | 林芷若領口剪低後，脖子有一個洞 | `hide_covered` 把領口附近的脖子皮膚當成「被衣服蓋住」刪掉 | FIXED（`hide_covered` 加 `y_keep`：領口線以上的皮膚不刪；要在剪領口之後、刪皮膚之前） | `tools/vroid_build.py` | bind pose 簡易算圖：脖子、鎖骨完整；遊戲內臉部近景 | — |
| 30 | 陳語彤臉部近景，脖子兩側有深色的尖片 | 連帽上衣改圓領時，領口剪裁線往兩側沿肩線升高（每公分 1.2 公分），在脖子兩側比脖子根部高 2 公分以上，帽口的布留成兩個尖角；從正面看到的是尖角的內側（深色） | FIXED（`crew_neck` 加 `cap`：領口線往兩側最多升高 4 mm） | `tools/vroid_build.py`、`assets/models/char/vroid_heroine_03.vrm` | bind pose 簡易算圖：背面尖角消失、正面圓領平順；遊戲內臉部近景 | — |
| 31 | 宿舍：沿牆斜推滑進書桌後面的窄縫之後，往哪個方向推都出不來（`movement_regression` A7 在一次測試失敗；重跑兩次通過，但把玩家直接放到那個位置可以穩定重現，所以不是偶發） | 書桌後面和後牆之間只有約 0.5 m（比人窄），導航格 0.4 m＋半徑 0.3 m 的「站得住」檢查在那裡留下只有一個點站得住的小孤島；測試模式（?turbo）一步最多 1.2 m，會跳進去；孤島四周都站不住，所以出不來 | FIXED：(1) 宿舍書桌後面、床頭與書架之間、溫州街 A 字立牌與盆栽之間、電線桿與郵筒之間，四個比人窄的縫標成不可走（沒有刪任何碰撞）；(2) 前進、沿牆滑、繞角都過不去時，再往左右偏 30°／50°／70° 試一步（只移到站得住的位置、不穿牆；目前位置本身站不住時不用，交給原本的脫困邏輯）；(3) 新增 `tools/dev_scratch/nav_islands.py` 掃描所有區域的小孤島 | `src/zones3d.js`、`src/engine3d.js`（`stepEntity`）、`tools/dev_scratch/nav_islands.py` | 把玩家直接放在卡住的位置推搖桿：修正前不動，修正後走出來；nav_islands：11 個區域 ALL CLEAR；campus_layout_nav 29/29、p0 31/31、movement_regression 42/42、touch_flow 21/21；A 組多跑 3 次都 7/7 | 手機實機一步約 7 cm（60 fps），本來就比較難跳進孤島；修正後孤島已不存在 |

---

## 已知限制與誠實說明

- **真機未測**：所有測試都是 Playwright（Chromium SwiftShader、iPhone 390×844 模擬、CDP 觸控事件）。SwiftShader 只有 1–4 fps，不能代表手機效能。
- **人物風格**：VRoid 是日系動畫風（MToon 卡通著色），與使用者提供的 2D 立繪同一類風格，但臉型、眼睛仍偏動畫；已用 blendshape 把女性眼睛收細一點，無法再大幅修改臉型（需要 VRoid Studio）。
- **合法素材的數量限制**：沙盒網路只能連 GitHub／npm／PyPI。找到的 CC0 VRoid 樣本只有 2 位男性、6 位女性（其中 Vivi 比例像小孩、Vita 是奇幻造型，未使用）。
- **動畫**：沿用既有 Mixamo 動畫（three.js 範例），REVIEW_NOTES 已記載再散布疑慮，尚未替換。
- **`build/` 單檔版**：`python3 build.py` 可以正常建置，但輸出這次不 commit（還是 v8 的檔案），等模型定案的里程碑再提交；GitHub Pages 用根目錄 `index.html`，不受影響。

## 截圖檔名規則（`docs/art-rebuild/screenshots/`）

- `before_v8_*`：重建前（v8）的實際遊戲畫面。
- 無前綴（例如 `wenzhou_day_1100.png`）：目前版本的實際遊戲畫面。
- `flow_*`：`tests/touch_flow_wenzhou.py` 觸控整合測試過程中的實際畫面。
- `WIP_*`：工作中、還要修改的畫面（例如 `WIP_hairfix_pending_*` 是沈以安改成單一馬尾之前拍的）。
- `BUG_*`：問題畫面（檔名註明是否已修）。
- `MODEL_VIEWER_*`：用同一套 three.js＋three-vrm 在模型檢視頁渲染的模型本身（不是遊戲畫面）。
