# LAWWW2 美術成果清查（LAWWW2-B，2026-10-16）

> **指令**：使用者 2026-10-16 01:4x UTC 正式指示 LAWWW2-B 清查舊帳號（LAWWW2）的美術交班缺漏，確保「原帳號的美術成果沒有浪費，所有已經製作的素材都能追蹤到是否真正接入遊戲」，並盤點經濟系大一、法律系大二～大四、交換、尾聲與 32 處校外約會需要的場景與素材。
> 清查時的分支：
> - LAWWW-B 開發分支 `claude/modest-rubin-2lyp7g`（下稱「開發分支」）
> - `main`（v9.7）
> - 舊帳號 `claude/second-ai-env-art`（`8e1061a`）與 8 條 WIP 分支
> - 我的分支 `claude/funny-albattani-iawshm`

## 0. 結論（先看這裡）

1. **沒有遺失、沒有被舊版蓋掉**：
   - 舊帳號主分支 `claude/second-ai-env-art` 已全部在 LAWWW2-B 的分支裡。
   - 8 條 WIP 分支（bike、lane118、lawlib、pavsoc、props、props6、soclib、trees）上屬於 LAWWW2 的檔案（`tools/blender/env_second`、`docs/art-rebuild/second_ai`、`assets/models/env/second_ai`、`assets/models/char/second_ai`、`assets/bg`），在我的分支上都有，**而且都是較新的版本**（逐檔比對最後修改時間，0 個 WIP 版本比較新）。WIP 分支可以留著當歷史，不需要再合併。
2. **做好了但遊戲還沒用到的（要 LAWWW-B 整合）**：

   | # | 素材 | 現況 | 卡在哪裡 |
   |---|---|---|---|
   | ① | **便利商店商品第二版** `cvs_interior.glb`（`a41c52e`） | 開發分支還是**舊版商品**（v9.7 線上也是舊版） | 只要換 GLB，不用改程式。使用者 10-14 抱怨過「貨架像模板複製貼上」，**影響玩家體驗，建議優先** |
   | ② | **大一女舍門廊燈加大** `campus_freshman.glb`（`6f98244`） | 開發分支是舊版 | 換 GLB；遊戲端要在 (−108, 2.9, 61)、(−78, 2.9, 59) 附近加點光源（LAWWW-B 已排） |
   | ③ | **118 巷街景** `lane118_street.glb`（第 18 節） | 不在 manifest | 遊戲還沒有 118 巷這個區域（`src/data/lane118_layout.js` 寫「之後的 src/lane118.js」） |
   | ④ | **黃金葛盆栽** `prop_pothos.glb` | 不在 manifest | 劇情 `ev_fangyt_pothos`、宿舍的「黃金葛」互動點都有了，但房間裡沒有放這個模型 |
   | ⑤ | **經濟系、學長、予樂的 6 張立繪**（weilun、pinyu、xun、tangrui、jiahao、yule；`portraits_v1`） | 開發分支沒有 | 這幾個人在遊戲裡還沒有 character id（經濟系大一路線還沒實作）；LAWWW-B 建角色時用 |
   | ⑥ | `assets/bg/noodle_table_window.webp`（麵店長桌的另一個角度） | 沒有用到 | 備用圖，不一定要用 |

3. **其他全部已經在開發分支、而且是最新版**：
   - 56 個 GLB／VRM／背景都已比對檔案雜湊：`second_ai/*.glb`、`*.vrm`、`bike_ride.glb`（含 `rear_cushion`）、`lawlib_interior.glb`、`skybridge.glb`、`nccu_gate/food.webp`、`noodle_table.webp`，以及 45 張窗景 `views/*.webp`。
   - LAWWW2 留給 LAWWW 的 19 個 patch 都已整合：10 個可以原樣反向套用；另外 9 個因為程式後來改過，用功能確認（manifest key、`?npcnew`、湖的導航…）。
4. **舊帳號交班時的待辦**，目前狀態見第 2 節。沒做完的都列進第 5 節的待辦，不放棄。

## 1. 素材逐項（開發分支 vs 最新版）

查法：`docs/art-rebuild/second_ai/` 的清查腳本概念如下（實際用 scratch 腳本跑）：
- 對每條美術分支的 `assets/models/env/second_ai/*`、`assets/models/char/second_ai/*`、`assets/bg/*`、`assets/models/env/views/*`、`bike_ride`、`lawlib_interior`，比對開發分支與 main 同路徑的 blob；
- 再看開發分支的 `src/assets3d.js` manifest 和 `src/`、`index.html` 有沒有讀到這個檔。窗景是用 `VIEW_URL` 組字串載入，另外確認過。

| 類別 | 檔案 | 開發分支 | 遊戲有沒有讀 | 狀態 |
|---|---|---|---|---|
| 室內 | cafe_interior、noodle_interior、bookstore_interior、dorm_interior、library_3f、soclib_interior、lawlib_interior | 最新 | 有 | 已整合（READY_FOR_ART_REVIEW，等使用者看） |
| 室內 | **cvs_interior** | **舊版** | 有（讀舊版） | **第二版沒換上去（①）** |
| 外觀 | cafe_exterior、campus_admin/arts/bell/hist/library/modern/pavilion/socsci/gongtong、campus_lake、club_fair、bball_court | 最新 | 有 | 已整合 |
| 外觀 | **campus_freshman** | **舊版** | 有（讀舊版） | **門燈修正沒換上去（②）** |
| 外觀 | skybridge | 最新 | 有 | 已整合（LAWWW-B：Y0＝4.2／4.0） |
| 街景 | wenzhou_street、wz_jphouse、wz_park、wz_props、gongguan_shops（含輪轉單車）、scooter、street_props、street_trees | 最新 | 有 | 已整合 |
| 街景 | **lane118_street** | 有檔案 | **沒有** | MODEL_READY，等 118 巷區域（③） |
| 道具 | furniture_study、seated_figures、desk_props、bike_ride（rear_cushion） | 最新 | 有 | 已整合 |
| 道具 | **prop_pothos** | 有檔案 | **沒有** | MODEL_READY，沒接（④） |
| 人物 | bl_zhe、bl_classmate_bohan/xinci/peishan、bl_kexin、glasses_zhiruo/bohan/peishan | 最新 | 有 | 已整合（角色美術由 BB 驗收） |
| 人物 | bl_npc_nf1～4、nm1～4（路人底模） | 最新 | 只在 `?npcnew` | 已整合，**預設沒開**（等 LAWWW-B 決定什麼時候預設打開） |
| 2D | nccu_gate、nccu_food、noodle_table | 最新 | 有 | 已整合 |
| 2D | noodle_table_window | 有檔案 | 沒有 | 備用（⑥） |
| 立繪 | 25 張 campus/neutral＋芷若 cafe＋芷若 campus 8 個表情 | 最新 | 有 | 已整合（BB 驗收） |
| 立繪 | **weilun、pinyu、xun、tangrui、jiahao、yule** | **沒有** | — | 切好了，等遊戲 id（⑤） |
| 窗景 | views/*.webp（45 張） | 最新 | 有（`VIEW_URL`） | 已整合 |

## 2. 舊帳號交班（2026-10-14 17:4x UTC）時的待辦 → 現在

| 舊帳號的待辦 | 現在 | 證據 |
|---|---|---|
| 便利商店商品第二版（WIP，正式 GLB 沒換） | **做完了、正式 GLB 已換**（READY_FOR_ART_REVIEW），**但 LAWWW-B 還沒整合** | `a41c52e`、`test_shots/cvs_goods_wip/README.md`（8 組遊戲截圖） |
| 女舍門燈罩加大 | **做完了**，LAWWW-B 還沒整合 | `6f98244`、`test_shots/fd_lamp/` |
| 盤點 READY_FOR_ART_REVIEW 成果 | 做完了 | `HANDOFF.md`「盤點」一節（23:2x UTC） |
| 汽車／約會美術（等分派） | 載妹墊已做（`aed5e46`、`4c7feb7`）；汽車沒有分派；約會底圖見第 4 節 | — |
| 普通、博雅 Blender 外觀＋空橋 | **空橋做完、已整合**（`a22ba0e`）；**普通、博雅外觀還是套件方盒（BLOCKOUT）** | 待辦第 5 節 |
| 博雅官方平面圖對照 R2（只寫文件） | 沒做（等平面圖） | 待辦 |
| 小語、明軒模型（暫停中） | 暫停中；使用者要求「3D 和新立繪比對」（阿哲、小語、柏翰、明軒、宥辰、阿凱） | 待辦 |
| 路人底模的缺點 | 底模已整合但只在 `?npcnew`；缺點（VISUAL_REVIEW）沒修 | 待辦 |
| 溫州街多一兩家店、男宿交誼廳家具 | 沒做 | 待辦 |
| 麵店價目板的字被切掉（給 LAWWW） | LAWWW-B 已修（`b2ca5b6`） | — |
| C13 夜景：長椅附近沒燈、女舍門口路人坐在空中 | LAWWW-B 已修（`b2ca5b6`）；博雅後牆方形光斑**沒查到有修** | 待確認 |

## 3. LAWWW2-B（這個帳號）做的，對照遊戲

| 成果 | SHA | 狀態 | 遊戲 |
|---|---|---|---|
| 郭沛珊 VRM v1 | `78db4a6` | MODEL_READY | 已整合（manifest 有）；v2（領口、瀏海、筆記本）待做 |
| 25 張參考立繪切圖＋芷若 cafe | `portraits_v1` | BB 驗收 | 已整合（6 張等 id，見①⑤） |
| 芷若 campus 8 表情 | `724643c`、`824f063` | **ART_APPROVED（BB-B）** | 已整合 |
| 便利商店第二版、女舍門燈 | `a41c52e`、`6f98244` | READY_FOR_ART_REVIEW | **沒整合** |
| 政大 nccu_gate、nccu_food | `825c038` | READY_FOR_ART_REVIEW | 已整合（`00179902`） |
| 空橋 | `a22ba0e` | MODEL_READY | 已整合 |
| 載妹墊（rear_cushion） | `aed5e46`、`4c7feb7` | MODEL_READY | 已整合（D78：開局就有） |
| 公館「輪轉單車」 | `eca9ca7` | READY_FOR_ART_REVIEW | 已整合（`305052b2`；D78 只當街景） |
| 政大 nccu_campus | WIP | 第三版正式圖算好，山還不合格，改用樹卡 | 沒交付 |
| 台北的家 home_living（平常／除夕／白天）、home_balcony | WIP | 腳本 `bg_home.py`，試算中 | 沒交付 |
| 取圖工具 extract_chat_images | `d84501a` | — | 給 BB-B 用（已用成功） |

## 4. 新場景與 32 處校外約會（企劃文件盤點）

分支：
- 開發＝`claude/modest-rubin-2lyp7g`；
- AA-B＝`claude/cool-heisenberg-o8kuqx`；
- BB-B＝`claude/elegant-brown-fcos7n`。

SP＝`docs/story_planning/`。只讀，沒有改企劃文件。

### 4-1 遊戲裡**已經有事件、但背景是黑的** 2D 背景（開發分支 `src/outings3d.js` 的 `S.BG`）

- 23 個 key 裡只有 3 個有圖：nccu_gate、nccu_food、noodle_table。
- 另外 **20 個是 `image:null`，事件都已經在用**。播放時是深色底加地點字幕：

| key（字幕） | 備註 |
|---|---|
| nccu_campus（政大・校園裡的路）、nccu_dorm（政大・宿舍） | LAWWW-B 已排給我；nccu_dorm 等使用者照片。`events.js` 第 424 行的字幕寫「政大・宿舍樓下」，和 label「政大・宿舍」不同，給 LAWWW-B |
| home_living（臺北・家裡的客廳）、home_balcony（臺北・家裡的陽台） | LAWWW-B 已排給我（`bg_home.py` 試算中） |
| ntu_soc（台大・社科院門口）、ntu_linze（台大・霖澤館前）、ntu_avenue（台大・椰林大道） | 遊戲裡已有正式 3D 模型：社科院、霖澤館、椰林大道。**可以用現有模型算 2D，不用從頭做** |
| dorm_roof（宿舍頂樓）、gongguan_luwei（公館・滷味攤）、wenzhou_tutoring（溫州街・課輔班門口）、soymilk_shop（豆漿店）、gongguan_cinema（公館・二輪戲院）、yongkang_curry（永康街・咖哩店） | 宿舍、公館、溫州街已有正式 3D 模型可以沿用；店名要照 D77；二輪戲院、永康街的店要查證 |
| riverside（河濱）、car（車上）、video（視訊） | 「車上」：祐廷家有車（AA_12）；「視訊」比較像 UI 畫面 |
| trip_sea（海邊）、trip_oldtown（老街）、trip_mountain（山上）、seaside_town（春假・海邊的小鎮） | 地點是哪裡、要不要照真實地方，要問 AA-B |

→ 這 20 個都是**玩家現在會看到黑畫面**的地方。**建議 LAWWW-B 排進我的佇列**：用現有 3D 模型算的三個台大背景最快。劇情用途（時段、站位）照使用者規則，由 LAWWW-B 向 AA-B 確認。

### 4-2 32 處校外約會

- **底圖、人物約會圖由使用者用 AI 生成，BB 寫提示詞並檢查**，不用 Blender 做。
  - 出處：`BB_132` 開頭與 §0、`使用者決策_2026-10-14_校外單獨約會系統.md` 第七節、`BB_128` §0。
  - 沒有任何文件要求 LAWWW2 用 Blender 做約會底圖。
- **LAWWW2-B 的工作**（`BB_132` §1c、§2 第 3 組；`BB_128` §2-3、§4）：人物約會圖去背、芷若九張表情疊到姿勢①（**已做完，ART_APPROVED**）、特殊姿勢去背。座標由 BB 標。
- **底圖現況**（以 BB-B 的 `BB_132` §2 為準）：
  - 已通過：D01、D02（陰天＋雨天）、D03、D05、D06、D09、D13、D18、D25。
  - 已給使用者生成：D04、D07。
  - 排隊中：其餘 21 處。
  - 規格：`date_system/底圖規格_AA負責的地點.md`、`BB_132` §3、§3b、`BB_128` §2-2。
- **約會人物圖（每人一套、所有地點共用）**：以安 heroine_01_date_knit、芷若 heroine_02_date_warm（＋九張表情）、語彤 heroine_03_date_tee、子晴 heroine_04_date_hoodie、學姊 heroine_05_date_shirt、沛珊 classmate_peishan_date_casual、可昕 kexin_date_denim、祐廷 player_date_casual。
  - 以安、語彤目前只在 BB-B 的分支（`53ca92f6`）。
  - 心願事件的特殊姿勢 H7～H11、Y5、Y6 和道具小圖層：還沒有檔案。
- 開發分支 `assets/` 還沒有任何約會圖接進遊戲。
- → **我可以先做的**：8 套人物約會圖去背，同一個構圖、透明背景，規格比照 `cut_reference_portraits.py`。交給 BB-B 標座標、交給 LAWWW-B 整合。這是純美術技術工作，先問 BB-B 要不要現在做、要什麼畫布規格。

### 4-3 之後學年／路線的新場景（只列地點；企劃組標明「美術需求只是清單，要不要做由開發組和使用者決定」，`給開發組_交接板.md` §5）

| 路線 | 地點 | 形式 | 出處 |
|---|---|---|---|
| 經濟系大一 | 保齡球館、摩天輪、宿營營地、跨年人潮、祐廷臺北的家（→ 用 home_living）、政大、河濱 | 2D | `BB_104` §7-2、`AA_106` B-3 |
| 經濟系大一 | 社科院一樓大廳／講堂、系辦、辜振甫圖書館閱覽區、討論室 | 2D 或教室模板 | `BB_106` §6：**等使用者確認才排** |
| 經濟系大一 | 新住處、公館豆花店、公館火鍋店 | 沒寫 | `BB_104` 事件表 |
| 大二 | 河堤夜景、山屋與檜木林步道、研究室門口走廊；可昕線的政大小教室、山邊老街＋公車、社科院一樓；以安家教學生的家 | 2D | `BB_97` §6、§9，`BB_107` |
| 大三 | 地方法院刑事法庭、行政法院、社會系館門口、車內、機場出境大廳外、資工系展示廳、體育館 | 2D | `AA_31` §4、`BB_98` §7 |
| 交換（美國） | 交換宿舍（房間、公用廚房、交誼區）、校園一段、超市 | **3D**（D47） | `PROJECT_DECISIONS.md` D47 |
| 交換（美國／日本） | 機場、巴士站、上課、中餐館、結冰湖邊；日本：便利商店、町公所公告欄、車站 | 2D | D47、`BB_98` §2-8 |
| 大四 | 車內（夜）、機場入境大廳、研究室、研究室門口長椅、嘉義雲海與紅檜、課輔班教室後門、晚餐餐廳 | 2D | `BB_99` §8 |
| 畢業後／尾聲 | 公館套房、考場外、第一天上班；尾聲沿用兩點半 Café＋CG | 照片帶過／CG | `交接包_v5` §4、§5 |

- **衝突（給 LAWWW-B → AA-B）**：可昕線（`BB_97`、`BB_98`、`BB_99`、`AA_112` §3-1）還要政大圖書館、河堤、小教室，但 `AA_137` §7-1（使用者 10-16 更正）說政大只做主要校園＋自強十舍，需要企劃組統一。
- 開發分支的 `docs/MISSING_EXTERNAL_ART.md`〈出遊的 2D 背景〉還列著 nccu_river、nccu_lib、nccu_park、chiayi_living、chiayi_balcony，已經過時（LAWWW-B 的檔案）。

## 5. 待辦（依使用者 10-16 指示的優先順序）

1. **嚴重影響玩家體驗的美術／顯示問題**：
   - 便利商店第二版（①）、女舍門燈（②）：已做完，催 LAWWW-B 整合。只要換 GLB。
   - 黃金葛盆栽（④）：問 LAWWW-B 要不要接。
2. **LAWWW-B 已排的場景**：
   - nccu_campus：山改成樹卡，算完交付。
   - home_living（平常為主，除夕、白天兩個變體）、home_balcony。
   - 自強十舍：等使用者照片。
3. **20 個黑畫面的 2D 背景**（4-1）：建議 LAWWW-B 排進佇列。先做能用現有 3D 模型算的：ntu_soc、ntu_linze、ntu_avenue、wenzhou_tutoring、gongguan_luwei、dorm_roof。劇情用途由 LAWWW-B 向 AA-B 確認。
   **32 處校外約會**：底圖是使用者生成。我做人物約會圖去背（8 套），以及特殊姿勢、表情疊圖。先問 BB-B 要的規格。
4. **舊帳號沒完成的**：
   - 普通、博雅外觀（BLOCKOUT → Blender）。
   - 沛珊 v2。
   - 3D 人物和新立繪比對：阿哲、小語、柏翰、明軒、宥辰、阿凱。
   - 路人底模的缺點。
   - 溫州街多一兩家店、男宿交誼廳家具。
   - 博雅 R2（等平面圖）。
   - 博雅後牆光斑（確認是否已修）。
5. **新學年／路線的場景**：依第 4 節，先由 LAWWW-B 經 AA-B 確認劇情用途再做。
