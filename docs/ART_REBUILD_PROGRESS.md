# 3D 美術重建 v1：工作日誌（ART REBUILD PROGRESS）

> 這份文件是本次「3D 美術重建 v1」的即時工作日誌，**每次 push 都會一起更新**。其他 AI 或開發者可以從這裡接手。
> 需求原文：`docs/history/specs/20_3D美術重建v1_人物與溫州街.txt`。
> 開發分支：`claude/friendly-brahmagupta-6bbkzc`（本工作階段被設定只能推這個分支；它就是獨立開發分支，**沒有動 `main`**，也沒有 force push）。
> 截圖：`docs/art-rebuild/screenshots/`（全部是實際執行遊戲或模型檢視頁的渲染結果；檔名規則見最後一節）。

---

## CURRENTLY WORKING ON — 現在正在修改什麼

- **最近更新**：2026-10-09（台灣時間，v9.3）
- **最新已推送 commit**：見本次 push（上一個是 `f3254d5`）。PR：https://github.com/pyhuanglaw/Lawstudent/pull/1
- **畫面驗收**：[`docs/art-rebuild/VISUAL_REVIEW.md`](art-rebuild/VISUAL_REVIEW.md)。**美術規範**：[`docs/art-rebuild/ART_DIRECTION.md`](art-rebuild/ART_DIRECTION.md)（參考圖在 `docs/art-rebuild/references/`）

### 這次完成（v9.3）

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

| 測試 | 結果 |
|---|---|
| `tests/p0_movement.py`（校園重排後） | **ALL PASS** |
| `tests/movement_regression.py`（校園重排後；C 改在新的總圖門口） | **42/42 PASS** |
| `tests/touch_flow_wenzhou.py`（只用觸控：溫州街搖桿 → 走到 Café → 進出 → 存到欄位 → 重新整理讀回 → 再走） | **ALL PASS** |
| `tests/campus_layout_nav.py`（新增） | 跑中 |
| 日式老屋、小公園、湖放大之後的 p0＋觸控流程 | 跑中 |

### 正在做／接下來

1. 參考圖 07 的構圖重拍：黃昏、祐廷和沈以安並肩走過 Café 前（Café 在左、夕陽從右邊）——腳本 `tools/shots/integration_walk.py` 已寫好。
2. 三時段光影（Café 門口、小公園 11:00／17:30／20:30）。
3. 溫書瑀長袖襯衫與低馬尾、林芷若微捲髮：VRoid 樣本裡沒有適合的衣服與髮型，可能要標 BLOCKED_BY_ART_ASSET。

## 進度總表

| 項目 | 目前狀態 | 正在修改什麼 | 已完成什麼 | 下一步 | 相關檔案 |
|---|---|---|---|---|---|
| 男性角色 | PARTIAL | 祐廷與阿哲的外觀細修（髮色反光、阿哲髮型的紅色高光） | 祐廷：VRoid CC0「HairSample_Male」改作（黑短髮、燕麥灰連帽上衣、炭灰長褲、白球鞋、深棕虹膜）；阿哲：「Sakurada Fumiriya」＋移植連帽上衣（深棕髮、墨綠連帽、卡其褲）；男性路人底模 2 種 | 祐廷補後背包（目前沒有合法可用的背包模型）；男性臉型只有 2 種（樣本限制），需要更多 CC0 男性 VRM 或使用者用 VRoid Studio 做 | `tools/vroid_build.py`、`assets/models/char/vroid_yuting.vrm`、`vroid_zhe.vrm`、`vroid_npc_m1.vrm`、`vroid_npc_m2.vrm` |
| 女性角色 | PARTIAL | 沈以安重拍展示截圖（已改單一高馬尾、拿掉貓耳） | 沈以安：「HairSample_Female」＋移植長褲；深棕高馬尾、米杏長袖上衣（剪到腰）、深藍長褲、白球鞋；陳語彤：「Sendagaya Shibu」拿掉領結與百褶裙、深綠上衣、牛仔褲；女性路人底模 2 種（Shino、Victoria 改作） | 林芷若、高子晴、溫書瑀還在用路人底模＋換色（**尚未**對應 Character Bible 的髮型與服裝）；沈以安的褲子是直筒不是立繪的寬褲 | 同上，`vroid_heroine_01.vrm`、`vroid_heroine_03.vrm`、`vroid_npc_f1.vrm`、`vroid_npc_f2.vrm` |
| VRM 系統 | IN PROGRESS | — | parse 一次＋骨架 clone 共用 GPU 資源；VRM 0.x 朝向與姿勢軸向；身高計算；換色（材質顏色相乘）；路人不投即時陰影改圓影；NPC frustum culling；載入失敗在 `?dev` 顯示 | 動畫仍是 Mixamo（授權疑慮，見 REVIEW_NOTES）；clone 沒有彈簧骨與表情（路人頭髮不會晃）；手機實機效能未測 | `src/assets3d.js`、`src/character3d.js`、`src/engine3d.js` |
| 溫州街 | PARTIAL | — | 10m 巷道、20+ 棟台北公寓（磁磚、鐵窗、冷氣、陽台、雨遮、水塔、加蓋）、8 間店面（含兩點半 Café）、日式宿舍、小公園、騎樓、死巷、電線桿＋電線＋路燈、反光鏡、機車、盆栽、行道樹（葉片卡）、白天／黃昏／夜晚光線；NavGrid 與鏡頭碰撞同步 | 日式宿舍從街上看不太到（圍牆擋住）；騎腳踏車的 NPC 很粗糙（W3.bike）；遠景建築單調；雨天地面反光未做；只有 Café 能進，其他店是「看櫥窗」 | `src/townkit3d.js`、`src/zones3d.js`（`buildWenzhou`） |
| NPC 動畫 | PARTIAL | — | VRM 0.x 坐／讀書／揮手／說話軸向修正；教室同學坐下面向黑板 | 騎腳踏車沒有踩踏動畫（VRM 沒有 P3 的 parts）；路人 clone 沒有表情 | `src/character3d.js`、`src/story3d.js` |
| 互動與存檔 | IN PROGRESS | 互動按鈕蓋住搖桿（見上方） | 標題畫面不再自動存檔覆蓋進度；Café 裡有人坐的位子不擋說話；觸控存檔到欄位、標題讀取欄位（`#menu` z-index，7f38a46）皆 PASS | 重跑完整觸控測試確認「讀檔後可以走」 | `src/game3d.js`、`src/engine3d.js`、`index.html`、`tests/touch_flow_wenzhou.py` |

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
| 13 | （新發現）沈以安的頭髮是「貓耳＋雙馬尾」 | HairSample_Female 是 VRoid 的髮型示範樣本 | FIXED（模型）／截圖待重拍 | `tools/vroid_build.py`（`ponytail_from_twintails`） | 模型檢視：正面／側面／背面為單一高馬尾 | 馬尾是剛體綁在頭骨上，不會隨走路擺動 |
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
