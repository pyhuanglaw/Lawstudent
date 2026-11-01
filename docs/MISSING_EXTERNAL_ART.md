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
| `nccu_gate` | 木柵大學・校門口 | 可昕 K1 導遊、K1b |
| `nccu_food` | 木柵大學・山下的小吃街 | K1、K1b |
| `nccu_river` | 木柵大學・河堤 | K1b |
| `nccu_lib` | 木柵大學・圖書館 | K1b |
| `nccu_park` | 木柵大學・停車場 | K1、K1b |
| `car` | 車上 | 開車的轉場（還沒用到） |
| `riverside` | 河濱（和子晴的河堤夜景共用） | 中秋烤肉（A13、K3） |
| `gongguan_luwei` | 公館・滷味攤（公館有 3D 區域，滷味攤還沒有） | 考完的宵夜（A15） |
| `noodle_table` | 阿鳳麵店的長桌（兩張桌子併起來，晚上；麵店有 3D 區域，這一幕先用 2D） | 大一下期中考完的晚餐（交接包 v2 C11、C21） |
| `seaside_town` | 海邊的小鎮（虛構，不寫真實地名）：火車站、堤防、民宿；第一天下雨 | 春假麵店團的兩天一夜（交接包 v2 C9） |
| `trip_sea`、`trip_oldtown`、`trip_mountain` | 海邊、別的城市的老街、山上（虛構或一般化的地點，不指定真實店家） | 春假：可昕 K8 開車旅行（交接包 v2 C9） |
| （還沒有 id）`bus_night` | 晚上的公車上：窗外的燈、旁邊的人的肩膀（不畫臉） | 可昕 K12b「回程的公車」（AA_325 2-Y2-16；現在是 `dark`＋旁白）。`trip_oldtown` 也用在這一件的老街 |
| （還沒有 id）`nccu_classroom_small` | 木柵大學・系上的小教室：投影幕、燈關一半、二十幾個人 | 可昕 K10b 電影夜、大二生日（AA_325 2-Y2-06、2-Y2-15；現在先用 `classroom_small`）。邵鈞、詹靖沒有立繪（compact） |
| `chiayi_living`、`chiayi_balcony` | 嘉義老家的客廳（年菜、圓桌）、陽台；道具：一疊土地謄本（不寫真實地號） | 主線 2 親戚的土地資料（交接包 v2 C2） |
| `dorm_roof` | 宿舍頂樓 | 跨年（A21） |
| `video` | 視訊（可昕的房間） | 可昕的期末成績（BB_95 9-8） |
政大的四個背景依 `AA_112` 第 11 節先用一般化的（不指定真實店家）。

### Event CG
- cg_cafe_dusk_heroine01（登錄在 `CG_REGISTRY`，檔案不存在時自動退回一般 ADV）
- ~~cg_library_rain_heroine03~~：2026-10-14 已補（使用者用 AI 生成、BB 檢查通過的第二版，`assets/cg/heroine_03/event_rain_library.webp`）
- 其他 BB 檢查通過的 CG（企劃分支 `docs/story_planning/cg_approved/`）：**2026-10-20 第二批全部登錄 `CG_REGISTRY`**（40 張原檔＋CG-10 尾聲 8 張合成；`tests/cg_batch2_unit.js`、LICENSES.md「CG 第二批」那一列）。事件還沒做的先登錄，事件做好、在那一拍寫 `{cg:id}` 就會出現
- 畢業以後（AA_319，`src/postgrad3d.js`，2026-10-20）：程式在那一刻呼叫 `ADV.cg(id)`；下表的圖**2026-10-20 都已登錄**（BCG-39 `assets/cg/heroine_05/cg_no_plan.webp`、CG-10 `assets/cg/epilogue/`，`tools/cg/compose_reunion.py` 合成；語彤事件 17 交往版加 CG-21 `cg_one_umbrella_heroine03`）

  | CG id | 編號 | 場景（哪一刻） | 現在的背景 |
  |---|---|---|---|
  | `cg_graduation_mother_heroine01` | CG-9 | 1A-13 6/2 12:00 畢業典禮拍照 ③ 以安和媽媽（和以安 `FRIEND` 以上），「謝謝你們這四年陪她吵架。」那一句 | 2D `graduation_avenue`（沒有圖＝深色底） |
  | `cg_two_graduations_kexin` | BCG-07 | 6/9 可昕的畢業典禮（木柵大學）：去了＝「等我拍完。晚上吃山下那家。」之後；沒去＝6/9 18:30 打開她傳的照片那一段 | 去了：2D `nccu_campus`；沒去：深色底 |
  | `cg_this_time_heroine05` | BCG-39 | 6/2 20:30 學姊的生日（研究室，和學姊交往中）：「……許願要說出來嗎？」之後她閉眼許願那一拍 | 2D 研究室走廊（`ra_lab` 沒有＝`linze_prof_hall`） |
  | `cg_reunion_window_table_<kai／heroine01／heroine02／heroine03／heroine04／heroine05／kexin／peishan>` | CG-10（基底圖＋8 張人物圖層合成） | 1A-20 尾聲 2034-06-03 19:00 兩點半 Café：同一桌的人、前任說完以後；祐廷右手邊＝畢業時的伴侶，沒有＝阿凱 | 兩點半 Café 的 3D（模糊） |

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

### 1B-01～1B-11（AA_316、AA_321；大二～大三上的人物事件，2026-10-20）
沒有圖的照下面的退路，不擋遊玩。三張 CG 的圖**已經有**（使用者生成、BB 檢查過），在企劃分支 `docs/story_planning/cg_approved/`，開發分支還沒登錄（`CG_REGISTRY` 沒有＝不放，照原背景演；登錄以後自動出現）。
| 用在哪 | 缺的 | 現在的退路 |
|---|---|---|
| 1B-05 子晴 Q8 河堤（**2026-10-20 已登錄 CG_REGISTRY**，1e257b9d） | CG BCG-02 `cg_riverbank_heroine04`（cg_approved/ 有）→ `assets/cg/heroine_04/` | 2D `riverside` |
| 1B-06 芷若 Z9 最後一個班（**2026-10-20 已登錄 CG_REGISTRY**，1e257b9d） | CG BCG-15 `cg_last_shift_heroine02`（cg_approved/ 有）→ `assets/cg/heroine_02/` | 3D Café＋立繪 |
| 1B-08 語彤事件 12 那把傘（**2026-10-20 已登錄 CG_REGISTRY**，1e257b9d） | CG CG-6 `cg_umbrella_heroine03`（cg_approved/ 有）→ `assets/cg/heroine_03/` | 3D 總圖門口（雨）＋立繪 |
| 1B-03 語彤事件 9 | 阿姨（阿鳳）立繪 | compact（說話人「阿姨」） |
| 1B-05 | 子晴的爸爸（西裝的中年男人） | 只有旁白 |
| 1B-06 | 新店員 | 只有台詞裡提到 |
| 1B-01、1B-02 | 手機照片（畫滿重點的那一頁、課本那一頁） | 文字「（照片：……）」／旁白 |
| 1B-10 芷若明信片 | 4 張明信片插畫（倫敦的街、戲院、雨） | 文字卡（對話框「明信片」） |
| 1B-11 沛珊在台南 | 6 張背景：台南車站出口（白天）、她的學校（下午）、她打工的二手書店、老街、運河邊（傍晚）、小咖啡店（晚上） | 去台南的那一天還沒接（`Y2B.PS_TAINAN` 只有台詞）；接了以後深色底＋地點字幕 |

### 1C 群戲（AA_324，2026-10-20；src/data/group_events.js）
沒有圖的照下面的退路，不擋遊玩。
| 用在哪 | 缺的 | 現在的退路 |
|---|---|---|
| 1C-01 春假麵店團的第一站 | 「小鎮的傳統市場」2D 背景（AA_143，底圖等使用者） | 深色底＋字幕「小鎮的市場」 |
| 1C-01 和可昕：老街 | `trip_oldtown` 的圖（大一那一趟也是深色底） | 深色底＋字幕「老街」（海邊改用 `y0_sea_blue`） |
| 1C-04 哲 4 | 宿舍樓下的便利商店外（夜）2D 背景（AA_40 寫「現有」，`OUT.BG` 裡沒有）；鋁箔包紅茶 2D 圖示 | 深色底＋字幕 |
| 1C-04 冠軍賽 | 新體育館一樓球場的 2D 背景（頒獎 compact 群像）；3D 新體育館（`gym3d.js`）這一場沒有用 | 深色底＋字幕「新體育館・球場」 |
| 1C-04 阿哲的爸爸 | 立繪（Tier 1：不笑、拿著相機） | compact（說話人「阿哲爸爸」） |
| 1C-05 子晴交往中的自拍（**2026-10-20 已登錄**，`assets/cg/heroine_04/cg_crooked_cap.webp`） | **BCG-26**（企劃分支 `cg_approved/cg_crooked_cap_heroine04.webp`，要放進 `assets/cg/heroine_04/`、登錄 `CG_REGISTRY`） | 沒有 CG，照 `graduation_avenue` 演 |
| 1C-05 子晴、芷若 | 學士服立繪 | 一般立繪 |

### 1B-12～1B-25（AA_322、AA_323；大三下到大四下的人物線，`src/y34b3d.js`，2026-10-20）
事件在那一刻有 `{cg:id}`（`ADV.cg`）：下表前五張 **2026-10-20 已登錄 `CG_REGISTRY`**（企劃分支 `cg_approved/` 原檔，`assets/cg/<人物>/`）；1B-24 和以安交往的版本加 CG-19 `cg_first_to_ask_heroine01`（「……第一個問我的人是你。這也是理由之一。」那一句）。

| CG id | 編號 | 哪一刻 | 現在的背景 |
|---|---|---|---|
| `cg_depart_together_heroine01` | CG-22 | 1B-12 日本路線 3/25 一起出發（和以安交往中）：登機口「（她靠著窗，把手帳翻到四月那一頁。）」 | 2D `airport_departure` |
| `cg_final_stage_heroine04` | CG「最後一關」 | 1B-15 5/20 子晴的發表會（《九點以後》）：爸爸「最後一關，我打過了。」那一句 | 2D `soc_hall` |
| `cg_last_row_kexin` | BCG-12 | 1B-16 5/3 可昕的期末報告：她講到一半看你、停半秒 | 2D `classroom_small` |
| `cg_anniversary_23` | CG-8 | 1B-20 12/14 二十三週年：最後一碗端過去那一刻 | 2D `noodle_table` |
| `cg_defense_day_heroine05` | BCG-10 | 1B-25 5/29 學姊的口試：「過了。」 | 2D `linze_prof_hall` |
| （BCG-31 夏天版） | BCG-31 | 1B-18 8/2 兩個人送機：「回程路上喝。冰的。」 | 企劃分支只有冬天版；AA_323：重畫成夏天版以前不放（程式沒有呼叫） |

沒有圖的照下面的退路，不擋遊玩。
| 用在哪 | 缺的 | 現在的退路 |
|---|---|---|
| 1B-15 資工系館一樓展示廳 | 2D 背景 | 2D `soc_hall`＋地點字幕（AA_322 素材表） |
| 1B-13 水源市場、老書店、鐘錶行、修鞋店 | 2D 背景 | 3D 公館＋地點字幕（AA_322 素材表） |
| 1B-12、1B-18 登機口 | 2D 登機口 | `airport_departure`＋字幕「登機口」 |
| 1B-12 日本路線出發以後 | 日本的區域（3D 或 2D） | 字卡「飛往日本」「關西　約 3 小時」「抵達」，人留在原地（日本那幾個月照現有的交換流程） |
| 1B-15 日本路線的直播 | 2D 手機直播畫面 | 不演；當晚子晴的電話＋阿凱傳製作名單照常 |
| 1B-18＋22 M6 每天的照片、爭論題的「（照片）」 | 照片圖 | 文字「（照片：一片沒有雲的天空）」等（AA_323 素材表） |
| 1B-20 麵店客滿 | 3D `noodle` 多人坐姿 | 立繪＋旁白（AA_323：需開發組評估） |
| 1B-20 12/11 起麵店門口的白紙「12/14（四）晚上七點　二十三週年」 | 3D 物件（AA_323：可以用公告欄那一種） | 沒有（12/11 讀書會群組、12/12 語彤當面說照常） |
| 1B-20 美國路線：語彤在群組傳的滿座照片（CG-8 的縮圖） | 圖 | 文字「（一張滿座的照片）」 |
| 1B-15 製作名單的照片（沒去）、阿凱傳的特寫（日本路線） | 圖 | 文字「（照片：製作名單）」／「子晴的製作名單。」 |
| 以安的媽媽、子晴爸爸（西裝）、語彤的媽媽、修鞋店老闆、麵店阿姨 | 立繪 | compact（說話人的名字） |
| 子晴、學姊 formal 立繪 | 立繪 | 一般立繪 |

### 3D
- **玩家正式模型**：目前用 Seed-san（VirtualCast, Inc.；VRM Public License 1.0，須標示出處）改色版：黑短髮、墨綠 T-shirt、炭灰長褲；**赤腳、褲長七分、胸口有原貼圖徽章**。要一個「有球鞋、後背包」的台灣大學生男性 VRM。RPM 範例（棕西裝光頭）已降級為 `TEMP_PLAYER_DEV_MODEL`，只在 VRM 載入失敗時出現。
- 五位女主角的 3D VRM（依 Character Bible）：目前只有小安用 three-vrm 範例（白 T 黑短褲，與 2D 不一致）；其餘四位是程序化 placeholder。
- 主要 NPC（阿哲、阿凱、小語、同學、教授）的 3D：全部程序化 placeholder。
