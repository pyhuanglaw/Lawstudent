# 四職位半成品與未整合交付清單（帳號 B 交班，2026-10-17）

> 用途：讓下一班（帳號 A 或 C）找得到四個 AI 做到一半的成果。使用者 2026-10-17 02:5x 要求 LAWWW-B 做最後一次交接完整性補強，只補文件與登記，不改遊戲程式。
> 機器讀的總表照舊是 `docs/handoff/tasks.json`、`docs/handoff/deliveries.json`；這份是閱讀版的半成品索引，每項都寫任務 ID、檔案、分支、最後 commit、完成程度、剩餘工作、能不能整合。
> **狀態：核對進行中**（LAWWW-B 02:5x 開始；各節標「已核對」才算完成，沒標的交給下一班照第 5 節方法做完）。

## 1. LAWWW（LAWWW-B，分支 `claude/modest-rubin-2lyp7g`）——已核對

| 任務 ID | 內容 | 檔案 | 最後 commit | 完成程度 | 剩餘工作 | 能不能整合 |
|---|---|---|---|---|---|---|
| DORM-LOFT-L | 8/29 搬進宿舍當晚，21:55 轉場後在 203 補生阿凱（R2）、柏翰（R1）、阿哲（L1）坐姿 | `src/story3d.js`（kaiMoveIn，1 行） | `b9eaacf3`（WIP） | 程式寫完、單元測試 camp_y1_unit／v0_e01／v0_e02 通過 | 瀏覽器 `tests/flow_camp_y1.py` 確認 8/29 22:00 三人在位子上；沒問題就把 commit 訊息的 WIP 視為解除 | 已在開發分支；沒測過瀏覽器前不要發布 |
| DORM-LOFT-L／ART-DORM-LOFT | 台大四人房模型整合（LAWWW2-B `a09ebf4d` 交件，使用者 01:3x「宿舍ok」） | `assets/models/env/dorm_room4.glb`、`.json`、`.layout.json`；`src/data/dorm_room_layout.js`（`tools/gen_dorm_room_layout.py`）；`src/zones3d.js` dorm 區塊 | `69e74460`～`5d66f7bb`、`22bdbc41` | 已整合；interior_glb_integration 宿舍 ALL PASS 42、flow_dorm_hall ALL PASS、flow_camp_y1 ALL PASS | 截圖給使用者看；場景美術只有使用者能標 ART_APPROVED | 已整合待測試 |
| AB65-3-Y1S2-L | 大一下口語改稿（AA_209） | `src/story3d.js`、`src/data/events.js`、`src/data/invites.js`、`src/data/activities.js`、`src/data/characters.js`、測試 | `372c6512` | 第 3 節、第 4 節第 1、2、3、5 點做完 | 第 4 節第 4、6、7、8、10、11 點；附錄逐句；階梯 y1s2 等 AA SHA（見第 2 節）；大二 312 | 已做的部分已在開發分支 |
| CAMP-FIX-614 | 宿營＋開學第一週驗收修正 | `src/data/camp_y1.js`、`src/story3d.js`、`src/data/events.js` | `259a4c4f` | 台詞 8 項、程式 1～7 做完；flow_camp_y1 ALL PASS | 程式 8 經濟系路線宿營 | 已整合待測試 |
| V0-REWRITE-L | 經濟系前傳改稿 | `src/data/ladder*`、`src/data/events.js`、`src/classes3d.js` 等 | `793e78aa` | 段 A 全部、BB JSON、E15 CG | 段 B～E、BB_179 第 4 節 1～9、AA_203 第 3 節 30 處、AA_206 E26／E37、AA_200 7-2～7-4、BB_179 第 8 節 | 已做的部分已在開發分支 |
| QA-HANDOFF-B1 | 交班沒跑完的測試 | — | — | — | 整套單元測試、萬才館／zone_transitions／總圖×2／霖澤館／法圖／重訪日 1 瀏覽器流程 | — |

LAWWW-B 沒有本機沒 push 的檔案、沒有 WIP 分支。

## 2. AA（AA-B，分支 `claude/cool-heisenberg-o8kuqx`，已交班 `ec63dd53`）——核對中

## 3. BB（BB-B，分支 `claude/elegant-brown-fcos7n`，已交班 `55717c12`）——核對中

## 4. LAWWW2（LAWWW2-B，分支 `claude/funny-albattani-iawshm`）——已核對（2026-10-17 03:0x，唯讀子代理逐檔比對、LAWWW-B 登記）

- **交班狀態**：LAWWW2-B 在自己的交接檔寫了正式交班（`docs/art-rebuild/second_ai/HANDOFF.md`「交班（最新）：2026-10-17 02:4x」，成果最後 `b75e50a5`），但**沒有跑 `snapshot`、`duty handoff`**（funny 上 `duty_LAWWW2.json` 還是 on）。LAWWW-B 代做快照 `snapshots/2026-10-17T0303Z_B_LAWWW2.json`；duty.json 仍顯示 LAWWW2 on——下一班 `duty plan` 會列出來，以交接檔的正式交班紀錄為準（使用者 02:3x 對四職位都說了換班）。
- **第 6 項 16 筆**：DELIVERY 5（登記 DL-LW2-VACA1、DL-LW2-SHOP1V2、DL-LW2-FACETEST、DL-LW2-ARTSOP＋示範案例同一筆）、WORK 3（ignored 寫原因）、WIP 8（5 筆已被既有交付涵蓋、3 筆還開著：ART-GG-SIGNS-2 兩筆、ART-04＋SCN-V3-01 一筆；放 ignored 並寫「WIP 半成品、沒有交付」，任務都在總表）。
- **總表補的任務**：ART-GG-SIGNS-2、VAC-A1、ART-SOP、ART-YUTING-FACETEST（原本【表外】）；ART-BG-AA185 加別名 ART-SHOP1；LIC-GAPS-1017（LICENSES 缺漏）。DLV-1016-368 改已整合待測試（b8073a08）。

基準：`origin/claude/funny-albattani-iawshm`（LAWWW2-B，HEAD 0a49b298，成果最後 b75e50a5）對 `origin/claude/modest-rubin-2lyp7g`（開發分支，HEAD 7e33aa02）。兩條的共同祖先是 b2d498e4（10-16 00:01）：開發分支用「挑檔案」整合，所以比的是檔案內容（blob），不是 commit 祖先。
`assets`＋`tools/blender` 共 399 個路徑不同：315 個只在 funny、46 個只在開發分支、36 個兩邊版本不同、2 個改了路徑。

### 4-1. 未整合美術與 WIP

| 任務 ID | 檔案路徑（funny） | 分支 | 最後 commit | 完成程度 | 剩餘工作 | 能不能整合 |
|---|---|---|---|---|---|---|
| **ART-GG-SIGNS-2【表外】** | `assets/models/env/second_ai/gongguan_shops.glb`＋`.json`（funny 7f781af3、3.13 MB；開發分支＝40b73c64 第一批 a1c32ed8）、`docs/art-rebuild/second_ai/patches/gg_signs2_test.patch`、`tools/blender/env_second/sign_atlas.py`、`textures/gen/gg_signs_atlas*.jpg/json`、`textures/signs_src/gg_*_fit.webp`（34 張） | funny | b75e50a5（WIP，交班保存） | 約 85%：GLB＋測試 patch 好了，LAWWW2-B 的測試工作樹 ALL PASS 34 項 | 前後截圖重拍（scratchpad 那 20 張已遺失）、README 第二批、夜間用眼睛看、交 LAWWW、通知 BB-B、**總表補任務** | 技術上可以（patch 只改 `tests/gongguan_glb_integration.py`，fbda2ce9 之後開發分支沒改過）；但還沒交付。和 scooters_v2.patch 改同一個測試檔，要排順序 |
| ART-SCOOTER2（負責 LAWWW） | `scooter.glb`／`.json`（funny 6bea6c3d；開發分支 b21ecc8f＝1e445818 舊版）、`tools/blender/env_second/scooters_v2.py`、`patches/scooters_v2.patch`、`test_shots/scooters_v2/` | funny | f5b7bdb3（已交付，DL-LW2-SCOOTER2 未整合） | 已交付 READY_FOR_ART_REVIEW | LAWWW 套 patch（基準 62cb7307；之後開發分支 zones3d／assets3d／world3d 有 9 個 commit。patch 加的 74 行在開發分支只找得到 20 行，大多是測試檔裡共同的部分）→ 溫州街／公館整合測試 | 可以，等 LAWWW |
| ART-BIKES2-INT（LAWWW）／ART-BIKES2-F（LAWWW2） | `street_props.glb`／`.json`（funny 48de915e；開發分支 e404040f＝06e94eb0 舊版）、`street_props.py`、`patches/bikes_v2.patch` | funny | 945fd4d2（DL-LW2-BIKES2 未整合） | 已交付；F 是後續 | 疊在 scooters_v2.patch 後面套；F：老鐵馬、登山車比導航阻擋長 8 cm，還有鏽、車籃、分款 | 可以，等 LAWWW |
| 祐廷 3D 臉試做【表外】 | `assets/models/char/vroid_yuting_facetest.vrm`（3.46 MB）、`patches/assets3d_facetest.patch`、`tools/char_polish.py`（funny 81beab9d；開發分支 a062494e 沒有 --facetest）、`tools/shots/facetest_shots.py`、`test_shots/facetest_yuting/` | funny | 8496bf9d（交件）；模型 23f25a0f | READY_FOR_ART_REVIEW，BB-B 驗收通過（4d3e2757） | 等使用者決定用不用；交付與任務都還沒登記 | 可以當 `?facetest` 選用整合（不換預設）。patch 的前後文在開發分支 assets3d.js 第 124～125 行還在 |
| ART-04 | `prop_pothos.glb`／`.json`（funny：S1～S4 四種大小；開發分支是 2baa5ac1 舊版）、`prop_pothos.py`、`shots/pothos_dorm_shots.py` | funny | 8a1af723（WIP） | 約 60%：模型好了 | 遊戲內截圖；宿舍已換成四人房，place（x 1.11、z −2.36）是舊房間的座標，可能要重新定位（推測，未驗證）；交付 | 還不行 |
| SCN-V3-01 | `dorm_y2_items.glb`／`.json`、`dorm_y2_items.py`、`textures/gen/dorm_y2_print.png` | funny | 8a1af723（WIP） | 物件模型好了 | 遊戲內截圖、112 窗景；照四人房對位（json 寫的是「112 號房：同一個房間模型」＝舊模型）；2D 部分 | 還不行 |
| ART-BG-AA185（別名 ART-SHOP1 的素材） | `bb_support/scooter_shop_props.glb`／`.json`、`bb_support/scooter_shop_props.py`、`render_dusk.py`、四種 Poly Haven 貼圖、LICENSES 兩筆 | funny | 5d5bb8aa | 道具驗收通過；4 張 2D 背景還沒開工 | 做公館機車行等 4 張背景 | 道具本身不進遊戲；背景做好再交 |
| SCN-US-01＋ART-US1～US4 | `us_apartment.glb`／`.json`（2.7 MB）、`us_apartment.py`、`src/data/us_apartment_layout.js`、`aa_support/us_{living,kitchen,bath}_props.*`、`bb_support/us_bedroom_props.*` | funny | 5e688f34（MODEL_READY；DLV-1016-32／44／51／238／248／249 未整合） | 室內 MODEL_READY；社區外觀還沒 | LAWWW2 接續（使用者 00:0x 派：SCN-US-01 → VAC-A2 → US-03 → US-02） | 照 D81 排到 V4 美國線時接 |
| ART-14（約會去背） | `assets/date/**`（53 個檔：7 人×7 張＋player 3＋anchors.json） | funny | f3531c61（DLV-1016-88／128 未整合） | BB-B ART_APPROVED | 等 DATE-S6 半互動約會系統 | 可以，等系統 |
| ART-09（剩下 3 位） | `assets/portraits/{jiahao,tangrui,weilun}/campus/neutral.webp` | funny | 8fbe1e1a（DLV-1016-09 未整合） | 立繪第一版 | 等 v0 人物 id（AA-REQ-06）和表情 | 可以，等 id（pinyu、xun 已經以 econ_pinyu、econ_zhengxun 接進去） |
| ART-13 | `tools/blender/char_second/mingxuan*.py`（4 支）、`yu*.py`（4 支）（帳號 A 的 WIP 腳本） | funny（也在 second-ai-env-art） | ae6e4dfa／19a96bbc（10-14） | 腳本 WIP | 跑 Blender、BB-B D59 驗收 | 還不行 |
| 規則文件（ART-SOP【表外】、VAC-A1【表外】） | `docs/art-rebuild/second_ai/ART_SOP.md`、`sop_demo/README.md`、`SCENE_RULES.md`、`VAC_A1_既有資產盤點.md` | 只在 funny | 69e4b181、644a322f、5c6a0391、4e4f4f36 | 完成 | 交付登記；建議複製一份進開發分支（D88：不要只存在一條分支） | 參考用 |
| 已整合成品的原始檔 | `dorm_room4.py`（ART-DORM-LOFT）、`bg_court.py`、`bg_car.py`、`bg_trip_mountain.py`、`vrm_crowd.py`＋`bg_gym_ceremony.py` v3、`cvs_goods.py`、`skybridge.py`、`park_tex.py`、`shopkit_tex.py`、`shops_tex.py`、aa／bb_support 的腳本與 views、約 60 張生成貼圖＋13 組 Poly Haven 貼圖；開發分支另有十多支是舊版（wz_props、wz_road_tex、cafe_exterior、cafe_layout、gym_interior、street_props…） | funny | 各自的交付 commit | GLB／webp 都已經整合 | — | 可以複製保存，不影響遊戲 |

**開發分支比較新、不要用 funny 蓋掉的**：
- `assets/models/env/dorm_hall.glb`、`tools/blender/dorm_hall.py`：開發分支 e4b6b55e（LAWWW-B 自己修宿舍大廳的疊面，10-16 23:25）。funny 還是 75082571（10-11）。
- `assets/portraits/econ_pinyu`、`econ_zhengxun`：開發分支改成正式 id。funny 還是 pinyu、xun。
- 只在開發分支的 32 張 `assets/bg`、10 張 `assets/cg`：來自 BB-B 或使用者，不是 LAWWW2 的缺漏。
- 開發分支 `textures/gen/wz_road_{main,ns,side}.*` 是舊的原始貼圖：funny 在 26134a0f 改成貼圖集以後刪了。

**疊面 BUG-COPLANAR-DEV**：交付的 7 個 GLB 和開發分支的版本**完全相同**：萬才館外觀、霖澤館外觀、霖澤館室內、201、萬才館室內、總圖大廳、法圖。
- 剩下的：萬才館室內 4 對（在西牆裡面，看不到）、總圖 27、法圖 93。大多是貼牆、貼地的接觸面，要在遊戲裡確認看不看得到。
- 宿舍大廳 LAWWW-B 已經自己修了（e4b6b55e）。HANDOFF 還寫「約 10 m² 等四人房」，要再核一次。
- 瀏覽器流程測試還沒跑完，排在 QA-HANDOFF-B1。
- BUG-WZFLICKER-2 的尾巴還沒動：溫州街三處、公館和 118 巷的鐵捲門、美國公寓、小公園。

**四人房 `dorm_room4.glb`**：`.glb` 173df01a、`.json` 1c355bf7、`.layout.json` 059fe61f。
- 開發分支、funny、a09ebf4d 三邊 **blob 完全一致**。
- 開發分支由 69e74460 整合。
- a09ebf4d 之後 LAWWW2 **沒有再改**。
- 只有 `tools/blender/env_second/dorm_room4.py` 不在開發分支。

**順便看到的**（交給值班的 LAWWW 判斷）：
- 交付紀錄沒更新：DLV-1016-368（a4c05720 小公園 v8）寫「未整合」，但開發分支的 `wz_park.glb`＝a4c05720 版（b8073a08 已收）。
- LICENSES 缺幾筆：
  - `ntu_gym_ceremony.webp`、`dorm_room4.glb` 兩條分支都沒有；
  - `gym_arena.glb` 只有 funny 有；
  - ART-SHOP1 的兩筆只有 funny 有。
- LAWWW2-B 交班沒留快照：
  - `docs/handoff/snapshots/` 兩條分支都沒有 LAWWW2 的快照；
  - funny 的 `duty_LAWWW2.json` 還是 `state:on`，看起來沒跑 `snapshot --role LAWWW2`、`duty handoff`。
- `wip_backup/second_ai_wip_branches_2026-10-16.bundle`（25 MB）只在 funny，開發分支沒有。

### 4-2. WIP 分支

`git rev-list --count funny..<分支>`：

| 分支 | HEAD | 比 funny 多幾個 commit | 內容 | 狀態 |
|---|---|---|---|---|
| `claude/second-ai-env-art` | 8e1061a9（10-14 17:38） | 0（整條在 funny 裡；比開發分支多 54） | 帳號 A LAWWW2 的交接分支 | 休班帳號的分支，保留 |
| `…-wip-bike` | fb23c7db（10-13 15:14） | 145 | ⑫騎車用的腳踏車、⑭118 巷、法圖 | 已整合、可刪、權限受阻（D88，LAWWW-B 複核 05:0x） |
| `…-wip-lane118` | 0b1788b9（10-13 15:13） | 136 | 118 巷街景、法圖 | 同上 |
| `…-wip-lawlib` | 3ba83057（10-13 15:11） | 126 | 法律學院圖書館 | 同上 |
| `…-wip-pavsoc` | 8c6f1fe0（10-11 08:30） | 11 | 洞洞館、社科院驗收 | 同上 |
| `…-wip-props` | fa626b9d（10-11 09:51） | 41 | 販賣機、118 巷配置草案 v1 | 同上 |
| `…-wip-props6` | 49d32ed8（10-13 13:04） | 72 | 道具第 6 批 | 同上 |
| `…-wip-soclib` | af7de02e（10-13 13:30） | 86 | 社科院圖書館 | 同上 |
| `…-wip-trees` | 22ff594d（10-14 02:14） | 203 | 行道樹 | 同上 |

- 「多出來的」commit 是 SHA 不同：內容早就挑進 funny、開發分支或 second-ai-env-art 了，LAWWW2-B 逐檔比對過（`BRANCH_CLEANUP_D88.md`）。
- 8 條的 HEAD 和 funny 上 bundle 的 `refs/heads/d88/*` **一一相同**：`git bundle list-heads` 已核對。所以要刪 funny 之前，得先把 bundle 搬走。
- LAWWW2-B 沒有新的 WIP 分支：它的 WIP 都直接 commit 在 funny 上。


## 5. 方法與剩餘異常

- 範圍：`check_handoff.py check` 第 6 項列出的 commit（交付分支 `scannedThrough` 以後、符合交付關鍵字、還沒登記），02:49 重新列出：AA 分支 126、BB 分支 113、LAWWW2 分支 16（比交班時的 249 多，是各職位交班 commit）。
- LAWWW-B 02:4x 曾把 BB 分支 125 筆照 BB-B 的交班說法整批放進 ignored；使用者 02:5x 要求不得整批標非交付，**已撤回**，改逐筆核對。
- 分類：DELIVERY（正式交付，登記 deliveries.json 並寫整合狀態）／WORK（一般工作紀錄，放 ignored 並寫具體原因）／WIP（半成品，登記在本檔並寫完成程度與能不能整合）。
