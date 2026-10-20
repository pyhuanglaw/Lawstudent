# MISSING_EXTERNAL_ART — 尚未提供的正式美術（2026-09-27）

原則：沒有正式圖片的人物走 **compact 對話模式**（模糊 3D 背景＋姓名＋對話框），玩家版本不顯示任何 `PLACEHOLDER_2D_PORTRAIT` 標籤；只有 `?dev` 才顯示 `MISSING_PORTRAIT` 小標籤。
圖片放到對應路徑、重新 build（`python3 build.py` 會重掃 `assets/portraits/` 產生 manifest）即生效，不必改程式。

## 已有（production）

| character_id | 檔案 | 來源 |
|---|---|---|
| heroine_01 沈以安 | assets/portraits/heroine_01/campus/neutral.webp（260×892） | 使用者提供的五人 master sheet，`tools/cut_portraits.py` 切圖去背 |
| heroine_02 林芷若 | assets/portraits/heroine_02/campus/neutral.webp（245×832） | 同上 |
| heroine_03 陳語彤 | assets/portraits/heroine_03/campus/neutral.webp（213×820） | 同上 |
| heroine_04 高子晴 | assets/portraits/heroine_04/campus/neutral.webp（256×885） | 同上 |
| heroine_05 溫書瑀 | assets/portraits/heroine_05/campus/neutral.webp（240×907） | 同上 |

注意：來源合圖 1198×1313，切出的人物約 210–260 px 寬、820–910 px 高。手機直向顯示約 190×650 CSS px（1.3×）、桌機／橫向 130% 放大時已接近 1:1，會略軟。**建議之後提供 ≥2× 的單人高解析度版本**（同一構圖即可直接替換）。

## 缺（MISSING_EXTERNAL_ART）

### TIER 3 — 五位女主角
- 表情差分（每人）：smile, laugh, serious, surprised, embarrassed, annoyed, sad, tired, thinking → `assets/portraits/<id>/campus/<expression>.webp`（同構圖、同頭部位置；目前全部 fallback 到 neutral）
- 服裝：casual、formal（每套至少 neutral）
- 高解析度單人版 master（≥ 520×1800）

### TIER 2 — recurring NPC（至少 neutral, smile, serious, annoyed／surprised；bust 或膝上）
- kai 阿凱（室友）、zhe 阿哲、yu 小語
- classmate_bohan 許柏翰、classmate_xinci 吳芯慈、classmate_mingxuan 江明軒、classmate_youchen 賴宥辰、classmate_peishan 郭沛珊
- npc_ta_chen 陳助教
- 教授（neutral, speaking, serious）：prof_zhou 周教授、prof_lin 林教授、prof_xu 許教授；其餘教授（prof_zhang, prof_wu, prof_huang, prof_tsai, prof_chen）目前只在課表出現，可先不做

### TIER 1 — minor talking NPC（1 張 bust neutral，可共用身體模板）
- npc_fangyt 方奕廷、npc_huangxh 黃筱涵
- 不熟同學 pool_1–pool_20（可用 4–6 個共用模板＋不同髮型／配色；揭露名字前用同一張也可以）

### TIER 0 — ambient
- 路人／騎士：不進 ADV，不需要 2D。

### 背景圖（bg_id，1920×1080 ＋ 1080×1920）
law_classroom_day / law_classroom_evening / library_day / library_night / cafe_day / cafe_evening / cafe_rain / dorm_night / campus_sunset / campus_rain / royal_palm_road_day / gate_night / noodle_shop_night / gongguan_night / wenzhou_alley_dusk
（目前事件用 3D freeze／blur 當背景；提供圖片後在事件把 `background` 改為 `{image:'assets/backgrounds/<bg_id>.webp'}`）

### 出遊的 2D 背景（離開 3D 地圖的地方；src/outings3d.js 的 `OUT.BG`，交接包 v1 第 7 批，2026-10-14）
沒有圖時是深色底＋地點字幕（ADV 的 `dark`）。有圖以後在 `OUT.BG[id].image` 填路徑（例：`assets/backgrounds/nccu_gate.webp`），事件不用改。
| id | 地點 | 用在 |
|---|---|---|
| `nccu_gate` | 政大・校門口 | 可昕 K1 導遊、K1b |
| `nccu_food` | 政大・山下的小吃街 | K1、K1b |
| `nccu_river` | 政大・河堤 | K1b |
| `nccu_lib` | 政大・圖書館 | K1b |
| `nccu_park` | 政大・停車場 | K1、K1b |
| `car` | 車上 | 開車的轉場（還沒用到） |
| `riverside` | 河濱（和子晴的河堤夜景共用） | 中秋烤肉（A13、K3） |
| `gongguan_luwei` | 公館・滷味攤（公館有 3D 區域，滷味攤還沒有） | 考完的宵夜（A15） |
| `noodle_table` | 阿鳳麵店的長桌（兩張桌子併起來，晚上；麵店有 3D 區域，這一幕先用 2D） | 大一下期中考完的晚餐（交接包 v2 C11、C21） |
| `seaside_town` | 海邊的小鎮（虛構，不寫真實地名）：火車站、堤防、民宿；第一天下雨 | 春假麵店團的兩天一夜（交接包 v2 C9） |
| `trip_sea`、`trip_oldtown`、`trip_mountain` | 海邊、別的城市的老街、山上（虛構或一般化的地點，不指定真實店家） | 春假：可昕 K8 開車旅行（交接包 v2 C9） |
| `chiayi_living`、`chiayi_balcony` | 嘉義老家的客廳（年菜、圓桌）、陽台；道具：一疊土地謄本（不寫真實地號） | 主線 2 親戚的土地資料（交接包 v2 C2） |
| `dorm_roof` | 宿舍頂樓 | 跨年（A21） |
| `video` | 視訊（可昕的房間） | 可昕的期末成績（BB_95 9-8） |
政大的四個背景依 `AA_112` 第 11 節先用一般化的（不指定真實店家）。

### Event CG
- cg_cafe_dusk_heroine01（登錄在 `CG_REGISTRY`，檔案不存在時自動退回一般 ADV）
- ~~cg_library_rain_heroine03~~：2026-10-14 已補（使用者用 AI 生成、BB 檢查通過的第二版，`assets/cg/heroine_03/event_rain_library.webp`）
- 其他 BB 檢查通過的 CG（企劃分支 `docs/story_planning/cg_approved/`）：事件還沒批准實作，先留在企劃分支，事件批准後再接

### 1A-06～1A-15（AA_317、AA_318；大三寒假到大四畢業、搬走，2026-10-20）
沒有圖的照下面的退路，不擋遊玩。
| 用在哪 | 缺的 | 現在的退路 |
|---|---|---|
| 1A-06、1A-07、1A-12 姊姊（宜蓁） | 立繪（AA_12：smile、laugh、thinking） | compact（說話人「姊姊」） |
| 1A-07、1A-12 大伯、媽媽、爸爸 | 立繪 | compact；爸爸沒有台詞 |
| 1A-15 麵店阿姨 | 立繪 | compact（麵店工讀才有） |
| 1A-12 午餐 | 「公館的餐廳」2D 背景（`gongguan_hotpot` 是冬天的火鍋，不合適） | 3D 公館＋字卡「公館的餐廳」 |
| 1A-12 校級典禮 | `ntu_gym_ceremony` 的畢業典禮版（現在的是開學典禮那張） | 先用開學典禮那張 |
| 1A-12 家人、學士服 | 3D 家人（路人底模改色，AA_12 寫需開發組評估）、祐廷的 3D 學士服 | 2D 背景＋旁白，不顯示 3D |
| 1A-15 公館的套房（SCN-V5-01，AA_175） | 3D 房間（或 2D 背景） | 2D `home_room_night`＋字卡「公館的套房」 |
| 1A-09 美國路線返台 | 2D 桃園機場入境大廳 | 深色底 |
| 1A-09、1A-11 大三的新東西（志願表、塑膠袋、謄本、鑰匙圈、明信片、製作名單、田野筆記） | 3D 小物件 | 只有旁白（同 1A-03） |

### 3D
- **玩家正式模型**：目前用 Seed-san（VirtualCast, Inc.；VRM Public License 1.0，須標示出處）改色版：黑短髮、墨綠 T-shirt、炭灰長褲；**赤腳、褲長七分、胸口有原貼圖徽章**。要一個「有球鞋、後背包」的台灣大學生男性 VRM。RPM 範例（棕西裝光頭）已降級為 `TEMP_PLAYER_DEV_MODEL`，只在 VRM 載入失敗時出現。
- 五位女主角的 3D VRM（依 Character Bible）：目前只有小安用 three-vrm 範例（白 T 黑短褲，與 2D 不一致）；其餘四位是程序化 placeholder。
- 主要 NPC（阿哲、阿凱、小語、同學、教授）的 3D：全部程序化 placeholder。
