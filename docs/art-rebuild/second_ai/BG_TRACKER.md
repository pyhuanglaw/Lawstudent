# 2D 劇情背景追蹤表（黑畫面 → 有圖）｜LAWWW2-B 維護

> 依使用者 2026-10-16 正式施工指示第二節：開發分支 `src/outings3d.js` 的 `S.BG` 有 20 個 `image:null`，事件都在用（玩家看到深色底＋地點字幕）。全部納入製作。
> 分類（使用者訂）：
> - **A** 已有遊戲 3D 場景 → 取鏡頭算圖；
> - **B** 已有可重用的背景圖 → 直接重用或做日夜版；
> - **C** 有現成模型或構件 → 組合製作；
> - **D** 必須新增 → 列缺的素材與規格。
>
> 優先順序＝劇情實際出現的順序，大一上、大一下先做。
> 劇情用途（時間、站位、視角）由 LAWWW-B 向 AA-B 確認；人物外觀由 BB-B 核對；鏡頭、光線、構圖、製作由 LAWWW2-B 決定。
> 共用總表 `docs/HANDOFF_GAP_MATRIX.md`（LAWWW-B 管理）記任務 ID、狀態、阻礙、下一步；這份記技術細節。

## 狀態

`TODO` → `WIP` → `READY_FOR_ART_REVIEW`（已交 LAWWW-B）→ `INTEGRATED`（LAWWW-B 接上、遊戲內截圖）→ `ART_APPROVED`（使用者）

| ID | key（字幕） | 用的事件（開發分支 events.js） | 學期 | 類別 | 做法 | 狀態 |
|---|---|---|---|---|---|---|
| BG-01 | riverside（河濱） | ev_mid_autumn_bbq 中秋烤肉（L439）、ev_nye_river 跨年（L756） | 大一上 | **B**（生成圖） | **改用 BB-B 第 20 組使用者生成的 riverside**（LAWWW-B 已接進遊戲，run13 驗過）；跨年也用同一張（LAWWW-B 04:25 決定） | **INTEGRATED（BB-B 版本）**；LAWWW2-B 停 |
| BG-02 | gongguan_luwei（公館・滷味攤） | ev_midterm_supper 考完的宵夜（L525）；v0 E19、E28 | 大一上 | **C** | 公館店面街 GLB（G05「滷味・鹹酥雞」）＋晚上 20:30＋騎樓下的攤車、**一張折疊桌**、塑膠椅（AA_147） | **INTEGRATED**：`cee40151` → LAWWW-B `92094895`（READY_FOR_ART_REVIEW，等使用者看） |
| BG-03 | nccu_campus（政大・校園裡的路） | ev_kexin_yule_pass（L418） | 大一上 | **D**（已做） | `bg_nccu.py campus --time night｜dusk`。AA_147：主圖是**十月平日 21:30 夜晚**，傍晚是變體 | **INTEGRATED**：夜晚主圖 `6e5a02b6` → LAWWW-B `92094895`；傍晚變體 v8 暫停（山色太黃，只是變體） |
| BG-04 | nccu_dorm（政大・宿舍） | ev_kexin_yule_pass（L424；字幕寫「政大・宿舍樓下」） | 大一上 | **D** | 自強十舍樓下有長椅的角度 | 等使用者照片 |
| BG-05 | dorm_roof（宿舍頂樓） | ev_nye_roof 跨年（L767）；v0 E24c | 大一上 | **C** | 男一舍的套件建築沒有頂樓；用 Blender 做頂樓：水泥平台、矮牆、水塔、**一盞昏黃的燈**、矮牆上有便利商店塑膠袋和飲料；遠方最高的大樓放煙火，很小、很遠，**不打出字或數字**（AA_147）；深夜 | **交付** `2a0a7ff4`（`assets/bg/dorm_roof.webp`；READY_FOR_ART_REVIEW） |
| BG-06 | home_living（臺北・家裡的客廳） | LAND_Y1 除夕（L46）、home3d.js 週末回家 | 大一上寒假起 | **D**＋**B** | **平常版（主圖）、白天版**＝`bg_home.py living`（LAWWW2-B）；**除夕版**＝BB-B 第 25 組使用者生成（c57e39ad，LAWWW-B 04:11 分配） | 平常版 `1fc16c76` **INTEGRATED**（`792946fd`）；白天版 `2a0a7ff4` 交付；除夕版＝BB-B |
| BG-07 | home_balcony（臺北・家裡的陽台） | LAND_Y1（L61） | 大一上寒假 | **B**（生成圖） | **改用 BB-B 第 26 組使用者生成**（LAWWW-B 04:25 同意）：`bg_home.py balcony` 試算的曬衣、構圖不夠，停在試算 | LAWWW2-B 停；BB-B 處理 |
| BG-08 | car（車上） | ev_kexin_trip_spring_y1 春假開車旅行（L843、L866） | 大一下 | **D**（LAWWW2-B；BB-B 讓出，04:25） | **祐廷開車，從駕駛座看出去**（AA_147）：方向盤、儀表板、擋風玻璃外的路；早上、晚上、雨天三版；新做車內模型 | DONE（LAWWW2-B 2026-10-16 09:4x：Blender 新做的駕駛座視角——左駕方向盤、儀表板（68 km/h，沒有品牌）、擋風玻璃外的濱海公路（雙黃線、護欄、海、山壁、岬角）；`tools/blender/env_second/bg_car.py` → `assets/bg/car_morning.webp`（早上，太陽在海那一側）、`car_night.webp`（車頭燈、路邊反光標、遠處漁港燈）、`car_rain.webp`（雨滴、雨刷、濕路面）1920×1080） |
| BG-09 | trip_sea（海邊） | 同上（L848） | 大一下 | **B**（AA-B 裁定：D25 調成白天版，不重新生成） | AA-B 確認用約會底圖 D25（字幕寫通稱）。**注意**：AA_147 寫「海邊白天、她拎著鞋站在浪裡」，D25 是夕陽——要白天版就得另外生成或調色，待 AA-B／BB-B 決定 | 已確認來源；時段待定 |
| BG-10 | trip_oldtown（老街） | 同上（L854，「別的城市的老街」） | 大一下 | **B**（AA-B 裁定：D18 調成白天版、燈籠不亮） | AA-B 確認用 D18（字幕「別的城市的老街」）。AA_147：白天、牆上貼滿發黃的老照片；D18 是黃昏——同上待定 | 已確認來源；時段待定 |
| BG-11 | trip_mountain（山上） | 同上（L860，「山上看星星」） | 大一下 | **B** | AA-B 確認用 D09 做**夜晚版**（星星、月亮，幾乎全黑）：調色＋星空，我來做 | DONE（LAWWW2-B 2026-10-16 09:2x：D09 黃昏底圖調成夜晚＋星空＋上弦月，茶館的燈籠、城市燈光保留；`tools/blender/env_second/bg_trip_mountain.py` → `assets/bg/trip_mountain.webp` 1920×1080） |
| BG-12 | seaside_town（春假・海邊的小鎮） | ev_noodle_trip_spring_y1（L874，坐火車去） | 大一下 | **B** | AA-B 確認用 D13（字幕寫通稱） | 已確認 |
| BG-13 | wenzhou_tutoring（溫州街・課輔班門口） | ev_peishan_tutoring（L992，term Y1S2） | 大一下 | **A** | 溫州街正式 GLB：選一棟一樓改成課輔班門口（招牌虛構）；晚上 | DONE（LAWWW2-B 2026-10-16 08:4x：遊戲內截圖 19:36，溫州街 v6 的 22 號公寓大門＋「課輔」直幅、樓上「小書包兒童」招牌；`assets/bg/wenzhou_tutoring.webp` 1920×1080） |
| BG-14 | yongkang_curry（永康街・咖哩店） | ev_family_dinner 家族聚餐（L978） | 大一下 | **C** | 店名照 D77；店面＋室內用 Café／麵店的構件 | **交付**（LAWWW2-C 2026-10-17 15:4x：`assets/bg/yongkang_curry.webp` 1920×1080，`bg_curry.py`＋`bg_paint.py`；虛構的日式小咖哩店、晚上 18:42；`test_shots/bg_cinema_curry/`；READY_FOR_ART_REVIEW） |
| BG-15 | ntu_soc（台大・社科院門口） | ev_kexin_visits_ntu（L1074）＝K2 第 6 週六 16:00 | 大一下 | **A** | 社科院正式 GLB 取鏡頭；**傍晚**（AA_147；可昕和品妤在門口等，品妤用 compact） | DONE（LAWWW2-B 2026-10-16 08:4x：遊戲內截圖傍晚，社科院正面＋菇狀柱；`assets/bg/ntu_soc.webp`） |
| BG-16 | ntu_linze（台大・霖澤館前） | 同上（L1079） | 大一下 | **A** | 霖澤館正式 GLB 取鏡頭；傍晚 | DONE（LAWWW2-B 2026-10-16 08:4x：遊戲內截圖傍晚粉紅天空，霖澤館穿堂＋館名；`assets/bg/ntu_linze.webp`）；**10-30 重拍（D115 改名：外牆館名改法律系館A；鏡頭 d、16:36；`test_shots/rename_art_1030/` 第五節）** |
| BG-17 | ntu_avenue（台大・椰林大道） | 同上（L1087） | 大一下 | **A** | 椰林大道（遊戲校園）取鏡頭；傍晚 | DONE（LAWWW2-B 2026-10-16 08:4x：遊戲內截圖傍晚，椰林大道往總圖；`assets/bg/ntu_avenue.webp`） |
| BG-18 | video（視訊） | ev_kexin_video_study（L1099）、ev_kexin_grades_open（L1149）、情人節 | 大一下 | **C** | **可昕那一端：書桌一角＋檯燈**，看不出是宿舍還是家（AA_147、LAWWW-B）；晚上；宿舍和寒假在家用同一張 | **交付** `3a85d367`（`assets/bg/video.webp`）→ LAWWW-B `5ec6a388` 接進 S.BG.video |
| BG-19 | gongguan_cinema（公館・二輪戲院） | ev_zhiruo_early_show（L1243） | 大一下 | **C** | 公館的二輪戲院（店名照 D77），門口、售票口、海報（海報不放真實電影） | **交付**（LAWWW2-C 2026-10-17 15:4x：`assets/bg/gongguan_cinema.webp` 1920×1080，`bg_cinema.py`＋`bg_paint.py`；虛構的二輪戲院大廳、上午 10:00，海報不放真實電影；`test_shots/bg_cinema_curry/`；READY_FOR_ART_REVIEW） |
| BG-20 | soymilk_shop（豆漿店） | 同上（L1243） | 大一下 | **C** | 台式早餐店：店面用街屋構件，室內用麵店構件（不鏽鋼台、豆漿桶、燒餅爐） | READY_FOR_ART_REVIEW（LAWWW2-B 2026-10-16 12:1x：`assets/bg/soymilk_shop.webp`，Blender `bg_soymilk.py`；道具是 AA-B 的 ART-SOY1；AA_147：Z5 早場散場後約 12:00、老闆不入鏡。從門口往裡看：左邊桌子＋紅凳、右邊前檯（豆漿桶、保溫櫃）和炸鍋、中間走道空著給人物；後牆紅字菜單（沒有店名，D77）、冰箱、往廚房的藍門簾、時鐘 11:58） |
| BG-21 | tutor_home（學生家的客廳） | 明軒介紹的家教（events.js L891，每週二 19:00） | 大一下 | **C** | 一般台北公寓客廳、晚上；BB_132 第 55b 組改成不用生成（09:35） | READY_FOR_ART_REVIEW（LAWWW2-B 2026-10-16 12:4x：`assets/bg/tutor_home.webp` 1920×1080，Blender `bg_tutor.py`；道具是 BB-B 的 ART-TUTOR1。從沙發斜對面看：米白布沙發、咖啡桌上攤開的講義和作業、地毯、落地燈、電視櫃、冷氣、書包、往房間的門；右邊落地窗外是夜晚的公寓（窗紗、窗簾）。已知：牆是 Poly Haven 灰泥，近看有一點斑駁（老公寓的感覺）；掛畫是畫的色塊，沒有字） |
| BG-22 | ntu_court_night（台大・新體育館旁的籃球場（晚上）） | ev_zhe_court_y2 哲 2（AA_177 第 5 節；`outings3d.js` 已登記 `S.BG.ntu_court_night`，image:null） | 大二 | **C**（LAWWW-B ART-BG-COURT 17:42） | 晚上、路燈、一個籃框；Blender 新做 | READY_FOR_ART_REVIEW（LAWWW2-B 2026-10-16 18:5x：`assets/bg/ntu_court_night.webp` 1920×1080，Blender `bg_court.py`。綠色 PU 球場＋紅色緩衝區、FIBA 線（罰球圈靠中場實線、禁區內虛線，三分線 6.75 m）、壓克力籃板＋舊籃網、10 m 高桿燈、圍網、長椅、沒標籤的水瓶、一顆球；樹後面是體育館玻璃立面（沒有館名）。沒有人、沒有字。手機直向看得到整塊籃板（第二版鏡頭左轉 6°）。遊戲內 ADV 截圖：`test_shots/bg_court/`。**BB-B 18:56 驗收三點通過**（沒有人；沒有字和標誌；籃板、罰球圈虛實、無撞人區、三分線直線段正確），場景美術最後由使用者確認） |
| BG-23 | ntu_gym_ceremony（台大・新體育館 3F 主球場的典禮（白天）） | 8/31 開學典禮（新遊戲第三天；開發分支 tasks.json ART-GYM-BG1）；大四畢業典禮 CG-9 之後換橫幅、換學士服共用 | 大一 | **C**（LAWWW-B ART-GYM-BG1） | 白天室內、坐滿新生、橫幅「開學典禮」；Blender 從 3F 主球場模型算圖 | **使用者通過（2026-10-17 00:3x：「開學典禮可以!!!」）**——v3：照使用者給的實際典禮照片改（白 T 恤新生坐滿場地與下層看台、上層看台不放人；紅地毯舞台＋台階、插畫背板「開學典禮」、燈架、紅綠吊旗、大螢幕轉播講台）；人物是遊戲的學生 VRoid 人物擺坐姿（`vrm_crowd.py`），2,955 人。`assets/bg/ntu_gym_ceremony.webp` 1920×1080。說明與 ADV 截圖：`test_shots/bg_gym_ceremony/README.md`。v1 退件紀錄也在那裡。 |
| BG-24 | court_gallery（地方法院・法庭旁聽席）、court_corridor（地方法院・走廊） | AA_252 大四下「法律專題研究」第 6 週週四上午：全班去地方法院旁聽刑事審理（使用者 2026-10-17：「模擬法庭做的東西……你就做成真的法院」） | 大四下 | **D**（LAWWW2-C） | `bg_courthouse.py --scene room｜corridor`；道具 `court_props.glb`（模擬法庭道具組改的）。從旁聽席最後一排往前看；席位照公開資料（檢察官右、辯護人＋被告左，各法院不一定）；沒有國徽、法院名、案號、法槌；畫面上沒有人 | **PROPOSAL 交付**：`assets/bg/court_gallery.webp`、`court_corridor.webp`（README `test_shots/bg_courthouse/`）；等使用者看（使用者給照片再照照片改） |
| BG-25 | ntu_gym_graduation（台大・新體育館 3F 主球場的畢業典禮（白天）） | G6 畢業典禮（大四下 6/2 校級典禮 09:00～10:30，AA_13 G6；SCN-V5-02）；BG-23 寫的「換橫幅、換學士服共用」 | 大四下 | **C**（LAWWW2-C） | `bg_gym_ceremony.py --grad`：同一個場景、同一個鏡頭；背板「畢業典禮／Commencement」、杜鵑換鳳凰花；學生黑色學士服＋方帽＋流蘇、背上 V 形的彩色披肩（全校各學院混在一起，不照真實配色）；上層看台坐一部分家長（畫面裡幾乎看不到） | **交付**（README `test_shots/bg_gym_graduation/`）：`assets/bg/ntu_gym_graduation.webp` 1920×1080；READY_FOR_ART_REVIEW，等使用者看 |

## 先做的順序

1. **大一上**：
   - BG-03、BG-06、BG-07（已在做）；
   - BG-01（河濱，兩個事件、兩個時段）；
   - BG-02（滷味攤）；
   - BG-05（宿舍頂樓）；
   - BG-04（等照片）。
2. **大一下**：
   - A 類最快：BG-15、BG-16、BG-17、BG-13、BG-18；
   - B 類等 AA-B 一句話：BG-09～12；
   - C 類：BG-19、BG-20、BG-14；
   - D 類：BG-08（車內）。

## 之後（D81 排很後面）

- 日本路線（AA_145 3-6，大三下）先用 2D、不做 3D：`jp_room` 國際學生宿舍單人房、`jp_konbini` 便利商店（不要真實連鎖的配色和字）、`jp_notice` 町公所公告欄、`jp_riverbank` 四月初河堤櫻花。

## 時段與用途的依據

企劃線 `docs/story_planning/AA_147_20張事件背景_用途與時段.md` 第 2 節（AA-B 4a135c36）：每張的事件、時段、誰在場、必要元素、變體。

## 給 LAWWW-B／AA-B 的問題（已回答的劃掉）

- ~~BG-01：河濱是哪一條河？~~ 新店溪，同一處。
- ~~BG-09～12 能不能用約會底圖？~~ 可以（D25、D18、D09 夜晚版、D13，字幕寫通稱）。還沒解決：AA_147 的海邊、老街是白天，D25、D18 是夕陽／黃昏。
- ~~BG-18：視訊要哪一邊？~~ 可昕那一端：書桌一角＋檯燈。
- BG-04：字幕「政大・宿舍樓下」和 label「政大・宿舍」要統一。
