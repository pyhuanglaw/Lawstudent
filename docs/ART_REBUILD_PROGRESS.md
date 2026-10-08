# 3D 美術重建 v1：工作日誌（ART REBUILD PROGRESS）

> 這份文件是本次「3D 美術重建 v1」的即時工作日誌，**每次 push 都會一起更新**。其他 AI 或開發者可以從這裡接手。
> 需求原文：`docs/history/specs/20_3D美術重建v1_人物與溫州街.txt`。
> 開發分支：`claude/friendly-brahmagupta-6bbkzc`（本工作階段被設定只能推這個分支；它就是獨立開發分支，**沒有動 `main`**，也沒有 force push）。
> 截圖：`docs/art-rebuild/screenshots/`（全部是實際執行遊戲或模型檢視頁的渲染結果；檔名規則見最後一節）。

---

## CURRENTLY WORKING ON — 現在正在修改什麼

- **最近更新**：2026-10-09 06:20（台灣時間）
- **最新程式 commit**：`7f38a46`（溫州街＋觸控測試）。本文件與截圖在其後的一個 commit。
- **正在處理**：「標題畫面 →『讀取／匯入存檔』→ 點欄位的『讀取』」在手機與電腦上都會誤觸到被蓋住的「開始新的一天」。
  - 原因：`#menu` 和 `#titleScreen` 都是 `.panel`（z-index 8），標題畫面在 DOM 後面，所以蓋在選單上面；選單看得到（標題背景半透明）但點不到。
  - 相關檔案：`index.html`（CSS z-index）。
  - 已完成到哪裡：已用觸控測試重現（`tests/touch_flow_wenzhou.py` 最後兩項 FAIL）並找到原因；修正（`#menu{z-index:9}`、`#toast{z-index:10}`）**尚未套用**（上一次嘗試被中斷，這次同步後立刻做）。
  - 還有哪些錯誤：見下方「技術問題紀錄」中狀態不是 FIXED 的項目。
  - 下一步：套用 z-index 修正 → 重跑觸控整合測試 → 重拍沈以安（已改成單一馬尾）的角色展示截圖 → 跑 `tests/p0_movement.py`、`tests/movement_regression.py` → `python3 build.py` → push。

---

## 進度總表

| 項目 | 目前狀態 | 正在修改什麼 | 已完成什麼 | 下一步 | 相關檔案 |
|---|---|---|---|---|---|
| 男性角色 | PARTIAL | 祐廷與阿哲的外觀細修（髮色反光、阿哲髮型的紅色高光） | 祐廷：VRoid CC0「HairSample_Male」改作（黑短髮、燕麥灰連帽上衣、炭灰長褲、白球鞋、深棕虹膜）；阿哲：「Sakurada Fumiriya」＋移植連帽上衣（深棕髮、墨綠連帽、卡其褲）；男性路人底模 2 種 | 祐廷補後背包（目前沒有合法可用的背包模型）；男性臉型只有 2 種（樣本限制），需要更多 CC0 男性 VRM 或使用者用 VRoid Studio 做 | `tools/vroid_build.py`、`assets/models/char/vroid_yuting.vrm`、`vroid_zhe.vrm`、`vroid_npc_m1.vrm`、`vroid_npc_m2.vrm` |
| 女性角色 | PARTIAL | 沈以安重拍展示截圖（已改單一高馬尾、拿掉貓耳） | 沈以安：「HairSample_Female」＋移植長褲；深棕高馬尾、米杏長袖上衣（剪到腰）、深藍長褲、白球鞋；陳語彤：「Sendagaya Shibu」拿掉領結與百褶裙、深綠上衣、牛仔褲；女性路人底模 2 種（Shino、Victoria 改作） | 林芷若、高子晴、溫書瑀還在用路人底模＋換色（**尚未**對應 Character Bible 的髮型與服裝）；沈以安的褲子是直筒不是立繪的寬褲 | 同上，`vroid_heroine_01.vrm`、`vroid_heroine_03.vrm`、`vroid_npc_f1.vrm`、`vroid_npc_f2.vrm` |
| VRM 系統 | IN PROGRESS | — | parse 一次＋骨架 clone 共用 GPU 資源；VRM 0.x 朝向與姿勢軸向；身高計算；換色（材質顏色相乘）；路人不投即時陰影改圓影；NPC frustum culling；載入失敗在 `?dev` 顯示 | 動畫仍是 Mixamo（授權疑慮，見 REVIEW_NOTES）；clone 沒有彈簧骨與表情（路人頭髮不會晃）；手機實機效能未測 | `src/assets3d.js`、`src/character3d.js`、`src/engine3d.js` |
| 溫州街 | PARTIAL | — | 10m 巷道、20+ 棟台北公寓（磁磚、鐵窗、冷氣、陽台、雨遮、水塔、加蓋）、8 間店面（含兩點半 Café）、日式宿舍、小公園、騎樓、死巷、電線桿＋電線＋路燈、反光鏡、機車、盆栽、行道樹（葉片卡）、白天／黃昏／夜晚光線；NavGrid 與鏡頭碰撞同步 | 日式宿舍從街上看不太到（圍牆擋住）；騎腳踏車的 NPC 很粗糙（W3.bike）；遠景建築單調；雨天地面反光未做；只有 Café 能進，其他店是「看櫥窗」 | `src/townkit3d.js`、`src/zones3d.js`（`buildWenzhou`） |
| NPC 動畫 | PARTIAL | — | VRM 0.x 坐／讀書／揮手／說話軸向修正；教室同學坐下面向黑板 | 騎腳踏車沒有踩踏動畫（VRM 沒有 P3 的 parts）；路人 clone 沒有表情 | `src/character3d.js`、`src/story3d.js` |
| 互動與存檔 | IN PROGRESS | 標題畫面讀取選單被蓋住（見上方） | 標題畫面不再自動存檔覆蓋進度；Café 裡有人坐的位子不擋說話；觸控存檔到欄位成功 | 套用 z-index 修正並重跑完整觸控測試 | `src/game3d.js`、`src/engine3d.js`、`index.html`、`tests/touch_flow_wenzhou.py` |

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
| 9 | 存檔欄位點擊失敗 | (a) 測試腳本點錯按鈕（點到自動存檔那列的「讀取」）→ 已修測試；(b) **真正的 bug**：標題畫面開啟的存檔選單被標題畫面蓋住 | (a) FIXED／(b) IN PROGRESS | `tests/touch_flow_wenzhou.py`、`index.html` | 觸控測試：存到欄位 1 PASS；重新整理後讀取 FAIL | 套用 z-index 修正後重測 |
| 10 | 溫州街 `townkit3d.js` 場景製作 | 原本的溫州街是 38m 寬的空柏油地＋一棟方盒 | PARTIAL | `src/townkit3d.js`、`src/zones3d.js` | 白天／黃昏／夜晚截圖；觸控測試走完整條街 | 見總表「溫州街」的下一步 |
| 11 | （新發現）自動存檔被空白第一天覆蓋 | 45 秒自動存檔計時在標題畫面也會跑，載入慢或停在標題 45 秒就會把真正的進度蓋掉 | FIXED | `src/game3d.js`（`autosave` 在 `titleIdle` 時不存） | 觸控測試：從標題點「繼續」讀到正確的溫州街存檔 PASS | — |
| 12 | （新發現）直向時小地圖蓋住 ☰ 選單按鈕 | `#minimap` 的基本 CSS 寫在 portrait media query 後面，把直向位置蓋掉 | FIXED | `index.html` | 截圖：直向時 ☰ 可見 | 橫向未重新截圖 |
| 13 | （新發現）沈以安的頭髮是「貓耳＋雙馬尾」 | HairSample_Female 是 VRoid 的髮型示範樣本 | FIXED（模型）／截圖待重拍 | `tools/vroid_build.py`（`ponytail_from_twintails`） | 模型檢視：正面／側面／背面為單一高馬尾 | 馬尾是剛體綁在頭骨上，不會隨走路擺動 |
| 14 | （新發現）胸部穿出上衣 | 原模型上衣領口開很低、身體比衣服大 | FIXED | `tools/vroid_build.py`（`paint_skin`、對模型自己的上衣做 `hide_covered`） | 模型檢視：上衣正常 | — |

---

## 已知限制與誠實說明

- **真機未測**：所有測試都是 Playwright（Chromium SwiftShader、iPhone 390×844 模擬、CDP 觸控事件）。SwiftShader 只有 1–4 fps，不能代表手機效能。
- **人物風格**：VRoid 是日系動畫風（MToon 卡通著色），與使用者提供的 2D 立繪同一類風格，但臉型、眼睛仍偏動畫；已用 blendshape 把女性眼睛收細一點，無法再大幅修改臉型（需要 VRoid Studio）。
- **合法素材的數量限制**：沙盒網路只能連 GitHub／npm／PyPI。找到的 CC0 VRoid 樣本只有 2 位男性、6 位女性（其中 Vivi 比例像小孩、Vita 是奇幻造型，未使用）。
- **動畫**：沿用既有 Mixamo 動畫（three.js 範例），REVIEW_NOTES 已記載再散布疑慮，尚未替換。
- **`build/` 單檔版尚未重建**（還是 v8）；GitHub Pages 用根目錄 `index.html`，不受影響。

## 截圖檔名規則（`docs/art-rebuild/screenshots/`）

- `before_v8_*`：重建前（v8）的實際遊戲畫面。
- 無前綴（例如 `wenzhou_day_1100.png`）：目前版本的實際遊戲畫面。
- `flow_*`：`tests/touch_flow_wenzhou.py` 觸控整合測試過程中的實際畫面。
- `WIP_*`：工作中、還要修改的畫面（例如 `WIP_hairfix_pending_*` 是沈以安改成單一馬尾之前拍的）。
- `BUG_*`：問題畫面（檔名註明是否已修）。
- `MODEL_VIEWER_*`：用同一套 three.js＋three-vrm 在模型檢視頁渲染的模型本身（不是遊戲畫面）。
