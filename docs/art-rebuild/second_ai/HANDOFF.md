# LAWWW2 交接紀錄（隨時更新；工作階段中斷時從這裡接）




## 進度（2026-11-12 11:00 UTC，LAWWW2-C）——以這一節為準

**在做什麼**：使用者 11-12「新生南路、公館、汀州路的店從外面看是 2D 圖貼在外面，改成像 118 巷一樣」＋對 BB「大步球鞋店外面看進去牆壁是灰色，店裡面是木頭」→ 做法定案：**玻璃後面直接放走進去的那一顆室內模型**（`Z3.shopInsideReal`，zones3d.js；街景腳本那一間加 `real=True, back=室內深+0.1`）。

**全部待辦（從這裡接）**——工作樹在 scratchpad `wt_tz5`（追開發分支 origin/claude/adoring-meitner-mqzst8；容器重開就沒了，patch 都在 wip/）
| 項目 | 狀態 | 在哪 |
|---|---|---|
| 新生南路六間、南洋戲院、汀州路七間 | LAWWW 已接 | wip/shop_window3d_1112/ |
| 東南大聯商品第 1、2 包、聯通手機殼、公館亮窗 12 間 | 第 1 包／手機殼／亮窗已接；第 2 包（dongnan_goods_v2.patch）DELIVERED 待 ACK | wip/dongnan_goods_1112/、wip/gg_lit12_1112/ |
| 公館第一批（安泰、鮮果、榮恩典）＋招牌「公館燒臘」＋預載修正（medium 也預載、零件分幀）＋打烊鐵捲門 | DELIVERED 待 ACK：gg_real3_sign_v2.patch；最長一幀等 CC 重量 | wip/gg_real_inside_1112/ |
| 公館第二批八間（青木、頁間、日和、洋洋、慢輪、Afar、轉角、Daybreak） | 做好、在 wt_tz5，雲端拍照確認中，還沒出 patch | — |
| 燒臘 G00 店內換真的（室內 6 m 寬、店面 11.2 m，要重開門窗）、花序 G11（兩層） | 還沒做 | — |
| 溫州街逐間店外／店內自查（八間＋日常失速、木曜日） | 還沒做 | 表在 wip/shop_out_in_audit_1112/README.md |
| 阿忠鮮果店員站位、夜市 13 攤顧攤位置（BB：偏移）、聯通櫃台螢幕轉向 | 還沒做（夜市站位數字看過：站在攤體後 0.35 m，要拍圖確認） | src/shoplife3d.js S.tenderSpot |
| 禮貌生財、溫特寶邸接室內 | 還沒做（溫特寶邸沒有室內模型） | — |
| 鐵捲門高度逐間給（南洋戲院玻璃 3.6）、捲門箱 | 還沒做 | — |
| 記帳：outbox_LAWWW2.json、user_asks_LAWWW2.json 今天的交付沒登 | 欠 | docs/handoff/ |

**坑**：雲端瀏覽器（SwiftShader）一幀要幾百毫秒，fast_shots 的 wait 有上限，要用 `js` 手動推 zone.update；一般模式（預載）下一次載十幾間很慢。公館店面玻璃在 z 22、室內 ry=π；各店中心 x 見 zones3d.js GG_SHOP_REAL。

## 進度（2026-11-12 07:00 UTC，LAWWW2-C）——舊

- **規則包同步 D157 做完**：9640f9fae（使用者 11-12 在這個視窗允許；`rules_sync.py --check` 和 RULE_SOURCE 一樣）。hook 要重開工作階段才生效。稱呼使用者用「你／他」（D150）。
- **SHUIYUAN-MARKET-LANE v1**（1530a5411）LAWWW-C 已整合。
- **SHOP-WINDOW-3D-1112**（`wip/shop_window3d_1112/README.md`）：新生南路六間的櫥窗從「貼參考圖」改成 3 m 深的立體店內。
  - 第 1 包大步球鞋 e61b6de33 → 已整合、**BB 判 PASS（BB_379）**；第 2 包好拍／新生運動／山嵐／同弦／大口 f578889d0 → 已整合；第 2b 包顏色對回室內 a37d5fab8 → 已交（DELIVERED，等 ACK）。
  - 做法：`wz_shopkit.py` 的 `xs_inside3d()`＋`XS_IN3D` 表（一間一個函式）；`wz_street.py` 的 `XS_FRONTS[店]['back']=3.1`；遊戲 `Z3.shopInsideLit(root, zone, {店: 地點})` 打烊調暗（汀州路、公館、118 巷接同一個）。
  - 重建新生南路：開發分支的 worktree 裡 `/opt/blenv/bin/python tools/blender/env_second/wz_street.py -- --set xinsheng --out <glb>`（6 秒）；`textures/gen/xs_fronts_atlas.jpg` 要用線上 GLB 取出來的那一張（已進開發分支；內容是 WebP）。建完比圖的 md5、同鏡頭渲染。
  - 坑：`xf_cyl` 直立的圓柱頂點色會掉成白的 → 用 `_xs_vcyl`（車削）；`merge_by_material` 會把同材質的店內合成一個網格 → `_seg` 讓新生南路一間一個。
  - **還沒做**：①南洋戲院門廳（現在一張圖貼正面）②各店櫥窗的擺設照 `*_layout.js` 逐件對（BB_379；現在只對了顏色）③打烊除了變暗還要鐵捲門或牌子、招牌亮度（LAWWW 06:26）④汀州路 → 公館 同一套 ⑤`views/tz_*`、公館三張窗景重拍 ⑥新生運動廣場 10,300 面，等 CC 的手機數字再決定要不要減。
- 椰影大道 (2,−123.66) 擋路（CC 量測）：＝校園北邊界 z −124（zones3d.js 那一排灌木），不是 bug；已回 LAWWW-C，要不要補密灌木由他決定。
- 佇列（LAWWW-C 的順序）：櫥窗立體（上面 ①～⑤）→ SHOP-LIFE-AUDIT 五項 → 12 間矮天花板（等 CC 確認）→ 溫特寶邸室內（暫停）。
- 沒記帳的：今天的交付還沒登記 `outbox_LAWWW2.json`（約 12 筆）、`user_asks_LAWWW2.json`。

## 進度（2026-11-12 05:45 UTC；LAWWW2-C）——以這一節為準，下面 04:5x 那一節是舊的

- 今天使用者連續回報（經 LAWWW-C 轉）的順序：室內窗景 P0 → 兩個「閃」→ 林家乾麵街景 → **水源市場巷子（正在做）** → 櫥窗立體（新生南路 → 汀州路 → 公館）→ 店面盤點五項、L118 打烊看得出來關了。汀州路最後一間溫特寶邸室內**停著**（排在這些之後）。
- 已交（都 DELIVERED LAWWW-C）：
  - 兩個「閃」`e6fdba625`、東南大聯 `1948e2c15`、汀州聯通 `83e6ec3c3`、室內窗景 `207d70f5f` → **都已整合**。
  - 室內窗景補件（七間天花板 3.3 m）`fe2ec2820`、林家乾麵街景 `d36d98f16` → 等 ACK／整合。
- 新規則（LAWWW-C 11-12）：D154 地點關卡、D155 店面標準（CLAUDE.md §12，開發分支）。**進得去的地點交付要附四張遊戲內截圖**（進門全景、往窗外、櫃檯、店外往裡看）＋Node 結果，沒附不整合。天花板要比跟隨鏡頭 3.18 m 高（做 ≥ 3.3 m）。
- **今天確認的事（接手的人一定要知道）**：
  1. 這個雲端環境**可以重建整條街**：Poly Haven 連得到，`python3 tools/blender/fetch_polyhaven.py <名稱…>` 抓到 `tools/blender/textures/`（gitignore，不進版本庫）。溫州街重建 23 秒。
  2. 重建要在**開發分支的工作目錄**做（`textures/gen` 以開發分支追蹤的為準）。我這個分支的 `textures/gen` 有些是舊的（公館、汀州路的圖集），拿來蓋會讓 `flower_notes_unit`、`tingzhou_unit` 失敗。
  3. 溫州街最新的 `wz_signs_atlas`、`wz_fronts_atlas` 原本沒進版本庫，只在線上的 GLB 裡；已從 GLB 取出、放進林家那個 patch。**重建後一定要和線上版比內嵌貼圖的雜湊、同鏡頭畫面**（做法在 `wip/wz_lin_street_1112/README.md`），不然招牌會整塊空白而測試全過。
  4. 雲端瀏覽器可以自己進店截圖：`python3 tools/blender/env_second/shots/fast_shots.py <URL> <shots.json>`（一間店約 2～3 分鐘；不給 cam＝遊戲的跟隨鏡頭）。
- 水源市場巷子（SHUIYUAN-MARKET-LANE-1112）LAWWW 裁定的做法：市場一棟三層樓 x 5～29、z 28～40，北面臨巷；新巷子 x 5～29、z 21～28（寬 7 m），十二攤兩側交錯；e_cvs、e_shoes 兩格通用店面拿掉；原巷 A 留著可走、不擺攤、不通公館；斑馬線搬到 z 24.5；公館那側巷口標籤先不改。交件：layout＋兩個 GLB＋tingzhou_walk 路線＋新舊座標對照表＋四張遊戲內截圖。
- 記帳還沒補：outbox（今天八件）、user_asks（11-12）、`TODO_SHORTCUTS.md`。

## 進度（2026-11-12 04:5x UTC；LAWWW2-C）

- 已交（都 DELIVERED LAWWW-C，等 ACK／整合）：
  - 汀州路室內：東南大聯商行 `1948e2c15`、汀州聯通 `83e6ec3c3`（`wip/tz_shops5_1112/`）；越好吃、客居雲南已整合（dev `4786cb89c`、`bd08f5788`）。**溫特寶邸還沒做**（概念圖看過：古著店、深木框、假人模特、吊衣桿）。
  - 兩個「閃」：`e6fdba625`（`wip/shop_flicker_1112/`；118 巷喝不喝咖啡＋果茶社後牆、日常失速兩面牆和外殼疊面；只挪頂點，新工具 `glb_shift_plane.py`）。瀏覽器沒跑。
- 正在做：**SHOP-WINDOW-3D-1112（使用者 11-12 直接要求：新生南路、公館同批店面櫥窗是一張圖 → 要像 118 巷有立體感）**。
  - 清單和做法已傳 LAWWW-C（04:5x，等 ACK）：A 新生南路七間、B 公館同批、C 汀州路。
  - 查到的結構（xinsheng_street.glb）：每間玻璃後 0.8 m 一張卡，全部合在 `wz_xs_fronts` 一個網格（不能用節點藏，要從 GLB 把那幾個三角形拿掉）；卡後面 5 cm 是外殼的一樓牆（`wz_wall_tile`，一間一片）。大步球鞋：玻璃 x＝−16.49、卡 x＝−17.3、外殼牆 x＝−17.35（z −20.4～−12.4、y 0～4.2）。
  - 打算：`offbeat_storefront.py` 那套（室內 GLB 拿掉臨街牆、燈光烘成一張自發光貼圖、減面）做每間的櫥窗店內；街景 GLB 用工具拿掉卡和那片外殼牆；遊戲端一張表把櫥窗店內擺到玻璃後面。雲端重建不了整條街（缺 Poly Haven 貼圖），所以用改 GLB 的方式。
  - 交付前掃 `tools/glb_coplanar.py`，確認和外殼沒有疊面。
- 排在後面：L118-CLOSED-LOOKS-OPEN-1112（P2：118 巷店沒開時看起來還開著）→ 溫特寶邸室內 → ECON-NAV-TRAPS 瀏覽器巡一遍＋交件 → 木曜日二樓平台可點面（MOKU-TAP-STAIR）→ VAC 巡檢。
- 記帳還沒補：outbox（今天六件交付）、user_asks（11-12 使用者訊息）、`TODO_SHORTCUTS.md`（各件「先將就的」都只寫在各自 README）。

## ✅ 值班登記（2026-11-12 03:17 UTC；帳號 C LAWWW2-C；使用者：「上一個帳號來不及交班使用量就到了上限，你現在接班，我也會通知其他AI」）

- 值班登記：帳號 C｜LAWWW2-C｜session_015BuNi47yLUt5PviELapMNj｜分支 `claude/focused-cray-c9uwvw`｜接班基準 `ab925827d`（快轉上一任 `claude/second-ai-env-art`，617 個 commit，沒有衝突）。`duty_LAWWW2.json`＝C、on、userOk。
- 上一班：帳號 A｜LAWWW2｜session_01AC1WVgJSmoJK1uRsPK2Zn1｜**沒有交班**（用量到上限）｜最後 push `ab925827d`（11-11 20:36，ECON-NAV-TRAPS-1111 WIP 保存）。以遠端最後 push 為準；沒 push 的當作沒有（A 的 `$SP/wt_ch`、`$SP/wt_bb` 工作目錄、沒跑完的全部 Node 測試結果）。
- 照 D75：不傳訊息給帳號 A 的工作階段。
- **手上的工作（A 沒做完的）**：ECON-NAV-TRAPS-1111（LAWWW 11-11 20:24 派，P1）——patch 和新測試已在 `wip/econ_nav_traps_1111/`；剩：全部 Node 測試（先 `git fetch origin claude/story-planning`）、雲端瀏覽器巡一輪、README 補結果、交 LAWWW。
- **使用者 11-12 03:2x 貼了帳號 A 最後的對話截圖（A 沒 push 的進度；我這裡沒有檔案可以核對，交件前自己重跑）**：
  - 全部 Node 測試跑完：1309 支，只有 bookstore_exit 老警告（先 fetch 了企劃線）。
  - 雲端瀏覽器巡檢做到一半：前 6 站（校園 E07、E12、普通、博思、共同、宿舍房間）站得住、沒有 JS 錯誤；宿舍走廊、Café、總圖、社科院（含二樓沙發）、公館、溫州街沒跑完。
  - 下一項：ECON 交件後做寒暑假（VAC）場景的擋玩巡檢；Node 初掃標出花序二樓、好拍、單車行、幾間店的座位。ECON、VAC 各一個 patch，都寫在各區自己的 build 裡，不動引擎。
  - SPAWN-EXIT 28 筆（出生點落在出口範圍）先不改，記 P3，下一版發布後再處理。
- **佇列（LAWWW-C 11-12 03:40 轉使用者 03:5x，USER_WANTS X322、X342）**：
  1. ECON-NAV-TRAPS-1111 交件（全部 Node 重跑中 → 雲端瀏覽器巡一輪 → 交）。
  2. **TINGZHOU-SHOPS5-1110 汀州路五間**（越好吃小館、客居雲南、東南大聯商行、汀州聯通、溫特寶邸）：使用者「你們自己決定」＝不用等她看外觀。先做第 2 版外觀（她 11-10 選的騎樓「混合」：五間照概念圖直接臨人行道、其他老公寓保留騎樓），再做五間室內，一間一間交 patch，每間最多 3 版（D141）；店名不改（D147）；店內的字、商品 LAWWW 跟 AA 要，**我先列需要的互動點給 LAWWW**。
  3. VAC 寒暑假場景擋玩巡檢，其他精修。
  - 模型（X342）：照使用者在這個工作階段切的用，不自己改。
  - incr：outbox 格式 11-12 改好（b5c7b3bd7）；剩 43 筆任務對不到總表、110 個 commit 分類由 LAWWW-C 做，我不動。
- **11-12 04:1x 進度**：
  - 汀州路五間室內：越好吃小館（已整合 dev 4786cb89c）、客居雲南（28c3682f8 已交）；剩東南大聯商行、汀州聯通、溫特寶邸。`wip/tz_shops5_1112/README.md`。工作樹 `$SP/wt_tz5`（dev 85c51a05e＋兩間＋季節攤販修正，都已交）。
  - MOONCAKE-EXIT-1112（BB GAME_BUG）：c7205db55 已交，等 LAWWW 整合、CC 重跑。
  - ECON-NAV-TRAPS：全部 Node 跑完（1301 過、9 支沒印結果行、peishan_leftover2 1 支 FAIL 和 patch 無關），結果已告訴 LAWWW；**還差雲端瀏覽器巡一輪才交**。工作樹 `$SP/wt_econ`。
  - **MOKU-TAP-STAIR（BB 03:58，P1 不擋版）還沒修**：木曜日點地上樓梯，人走到 (−3.75, 3.45) 第 0 層停住、路線被清；之後點二樓平台被解讀成一樓地面。查到的：
    - Node 用引擎的 pathTo＋stepEntity 照玩家半徑 0.32 走（30／10／60 fps）上得去、換得到第 1 層——沒重現。
    - 半徑改 0.36 以上才會卡，而且卡在 z 2.88（不是 BB 的 3.45）＝不是同一件事。
    - 玩家的路線停住只有兩種：走完（pathStep）或 1.5 秒沒前進（E.stallStop）。下一步：用 CC 的探針 `cc_stair_probe.py`（cc-testing cf948273c）在雲端瀏覽器重現，印 P.path、blockedAt、lv；另查二樓平台沒有可點面（walkMeshes 只有樓梯斜面）。
- 其他照下面 A 的交接：等 BB／CC 判的那一批、LAWWW 給座位最後的值（#47）、CC 的南洋戲院截圖。
- 這個工作階段的暫存區 11-12 接班時滿了（fetch 一週的 commit 寫不下）：清掉 11-05 那一班的暫存 worktree（xw、base56、devtip、gn、gnbase、p3chk、p4base）和窗外照片的 PNG 原圖，內容都已交件。

## 交接（最新｜帳號 A｜2026-11-11 16:2x UTC）

- **v9.10.25 上線後**（LAWWW 15:42）：stack4、MOKU 都整合進開發分支 c170218dd；季節第三批 v2（165778c67）、游泳池水面（d58fa7ea3）也整合了（4e7bc92d62）。照 LAWWW「下一項照 queue --owner LAWWW2」對了一次帳：已整合但 tasks.json 還寫進行中的那一批，15:4x 傳給 LAWWW 改狀態（G04／G08／G09／G10／G11／G13、汀州路、招牌拉正、義大麵屋；OPEN-SRC-2D3D、ART-ECON-3D-GAP 建議結案）。
- **BAKE-PC-1102-S2**：BK1 11-03 就比完了（PC CPU＝PC GPU）。HIP 那一半**使用者 11-03 已決定 Blender 只用 CPU**，不做。新發現：雲端 Blender 已是 5.2.3（和 PC 同版）→ 改成「雲端 CPU 對 PC CPU」：3F 第二版的 driver `pc_ref/pc_bake_3f_ref.py`＋輸入 GLB＋雲端參考（512²/64：24 秒、重跑逐像素相同；1024²/512：21 分）。佇列兩行在 `wip/bake_pc/README.md` 的 BK2 一節，經 LAWWW／BB 排給 CC（P3 選做）。PC 結果回來以後照該節的判斷跑 `compare_bakes.py`。
- SHORTCUTS-TODO-1105：11-10 盤點後剩下的都是 P3 外觀或要 CC 瀏覽器拍（D131），這次沒動。
- **教訓（BB 18:12）**：給 CC 佇列的行**不要寫 SHA `lawww2`**（跟著我分支的 head 走，我每推一次 PC 就重跑一輪：BK2 多跑了 4 輪），一律寫固定 commit SHA。BAKE-PC-1102-S2 已定案（58bb06622a）、BK2 已 HOLD。
- **教訓（LAWWW 20:23）**：跑全部 Node 測試以前**一定先 `git fetch origin claude/story-planning`**（有些測試讀企劃線的最新稿；沒 fetch 會誤報「基底就 FAIL」）。US-NAV-TRAPS 那四支約會測試就是這樣，fetch 後 ALL PASS。
- **US-NAV-TRAPS-1111 已整合**（LAWWW 20:23，dev d7fe9c9ca）。
- （原記錄）**US-NAV-TRAPS-1111 已交**（`wip/us_nav_traps_1111/`；LAWWW 19:37 第 2 項）：美國 14 區擋玩巡檢，超市街、會所兩條進得去出不來的小縫補導航阻擋；全部 Node 1307：1301 過＋老警告＋gym_wear 搶 CPU＋四支約會付錢基底就 FAIL。第 1 項 ART-ECON-3D-GAP 對照已給 LAWWW；asks 對帳已改（ef8b21af55）。下一項：第 3 項 SHORTCUTS-TODO 剩下的。
- **TAP-RAY-SEAT 總圖／宿舍（P1）已交**（`wip/tap_ray_seat_1111/libdorm/`）：遊戲本身點得到；CC 的 FAIL＝柱子擋住椅子 2 中心、手機開著、探針呼叫沒帶 hit。tapToSeat 沒 hit 自己算＋tests/tap_seat_libdorm_1111_unit.js；全部 Node 1303：1302 過＋bookstore 老警告。CC 探針已照建議改（575fd2a9fa）。學到的：雲端瀏覽器照 CC 起點重現（`repro_browser.js`）比 Node 模擬可靠——鏡頭、螢幕座標都對得上；探針判斷不能用被測的函式本身（循環驗證）。
- **LEADOUT-WALL-1111 已整合**（LAWWW 18:25；待 BB 測試）。LAWWW：手上沒派工先停，BB 這批瀏覽器結果有場景問題會再找。
- LEADOUT-WALL-1111（LAWWW 17:49 派，P2）：`S.leadOutSpots` 選點＋`tests/leadout_spots_1111_unit.js`，修改前 FAIL、修改後 ALL PASS；**已交**（`wip/leadout_wall_1111/`）：全部 Node 1302：1299 過＋bookstore 老警告＋invites_quote_b6、loadgen_locks（基底 f16135b3a4 就 FAIL）。`$SP/wt_ch`＝f16135b3a4＋這包（staged）；`$SP/wt_bb`＝f16135b3a4 乾淨。
- 工作目錄：`$SP/wt_ch`＝開發分支 0bdb8fb79f（乾淨）；`$SP/wt_bb`＝566ff8b5bf＋木曜日（已交、已整合，可以重設）。

## 交接（前一則｜帳號 A｜2026-11-11 15:5x UTC）

- **MOKU-PLANT-CORNER-1111（P0）已交**（947322b33，`wip/moku_plant_corner_1111/`）：木曜日二樓衣帽架／植物縫的小孤島、植物外角斜推不動、(−3.75,1.0) 小孤島。mokuyobi3d.js 三塊導航阻擋＋`z.cornerSlip`；engine3d.js stepEntity 的 cornerSlip（只開了的區域、只玩家；牆角不讓）。LAWWW 14:53 ACK 做法，v9.10.25 發完第一個整合、BB 跑 NOSIT／STAIR＋冒煙。全部 Node 1288：1287 過＋bookstore 老警告。
- 學到的：①「站得住」只看四點→家具外角斜對面有缺口；推進角裡整步／x／z／偏轉都碰到＝不動，要讓開再繞（cornerSlip 的 lookahead 要求讓開後那一軸走得通 0.6 m，不然牆角會被推著跑）。②找路先只走人站得住的格子，起點在小孤島時會退回「格子空就通」的路——小孤島就是「pathTo 有路卻走不出去」的原因；nav_islands 的掃法在 `tests/mokuyobi_plant_corner_1111_unit.js` 第 1 項有 Node 版。③測試直接呼叫 stepEntity 時方向要是單位向量（不然一步走好幾倍）。
- 其他照前一則：這一輪五件（P2、TAP-RAY、CAFE-BAR-CAM、GG-SHOPS3 資料、四包一起試）都等發版後整合；照 §5 停，等 BB 判或 LAWWW 派。
- 工作目錄：`$SP/wt_bb`＝566ff8b5bf＋木曜日（staged，已交）；`$SP/wt_ch`＝566ff8b5bf 乾淨。

## 交接（前一則｜帳號 A｜2026-11-11 13:4x UTC）

- 這一輪交的五件都是「發版後整合」，LAWWW 都 ACK 了：P2 吧台凳＋海報背面（988dfcbe2）、TAP-RAY-SEAT（cef36c9c7）、CAFE-BAR-CAM（42671da70）、GG-SHOPS3 資料補五項（24a2bc245）；**四包疊在開發分支 56ecee2fb 一起試**（`wip/stack4_1111/`，c8ca5c0b4）：都乾淨、全部 Node 1290 支 1289 過＋bookstore 老警告，合併 patch 在 71adf757d7 上也乾淨（等 LAWWW ACK）。
- 對帳（D148）：GG-SHOPS3-ART-1110、FLOWER-NOTES-ART-1110 早就做了、已整合（在 v9.10.25 候選裡），LAWWW 改「已整合待測試」；AA_743 對照表 `wip/gg_shops6_int_1110/AA_743_對照_1111.md`。LAWWW／AA（AA_813）決定：kind 不改、資料五項做了、要改模型的五項記 P3 GG-SHOPS3-ART-V2（等 BB 判室內 v1 再說）、騎樓照現在、店裡的人（老闆娘、女兒…）LAWWW 發版後和 AA 看。
- **現在照 §5 停**：等 BB 判（118 巷室內第 3 版、泳池、季節、六間室內、花序 v2、汀州路招牌第 3 版、Café 吊燈網點）、LAWWW 給座位最後的值（#47 重跑 `it_fix()`）、CC 的南洋戲院截圖，或 LAWWW 派新的。
- 工作目錄：`$SP/wt_ch`＝開發分支 56ecee2fb＋四包（staged）；`$SP/wt_bb`＝f2515c2077＋資料五項（staged，已交）。兩個都可以重設。

## 交接（前一則｜帳號 A｜2026-11-11 12:3x UTC）

- 三包都交了、都是「發版後整合」（v9.10.25 候選 0d1eaadc7 不動）：
  - P2 義大麵屋吧台凳＋窗上海報背面（988dfcbe2）：LAWWW 10:56 ACK。
  - **TAP-RAY-SEAT-1111 點畫面判椅子**（cef36c9c7，`wip/tap_ray_seat_1111/`）：LAWWW 11:36 ACK。engine3d.js `E.rayFirstHit`＋tapRedirect 傳 hit；game3d.js tapToSeat 射線先打到哪張就是哪張。新測試 `tap_seat_ray_real_1111_unit`（真的區域＋GLB）。缺點已記：人不擋。
  - **CAFE-BAR-CAM-1111 兩點半 Café 吧檯鏡頭**（這一筆，`wip/cafe_bar_cam_1111/`）：原因是天花板水泥大梁（不是牆）；cafe `z.slabs`（天花板下 2.78～3.4 m，slabClip 讓鏡頭停在梁下面）＋`CAFE230_SEETHRU` 網點透空。等 LAWWW ACK、CC 拍、BB 判。
- 還在等：LAWWW 給座位最後的值（#47 重跑 `it_fix()`）、CC 的南洋戲院截圖、BB／CC 判 118 巷室內第 3 版、泳池、季節。
- 這一輪學到的：①點畫面要判「打到什麼」用真的模型射線（three Raycaster 打 E.zone.group），抽象的高度帶會把擦過的東西算進去；Node 裡 GLB 可以去掉貼圖解析（`tests/us_club_lounge_unit.js` 的 parseGLB）；牆照 `z.fadeWalls` 淡出再測。②室內鏡頭被天花板下的梁擋：`z.slabs` 一塊天花板帶（slabClip，多樓層本來就用）比只做網點透空乾淨。③全部測試在跑的時候不要改同一個工作目錄的 src（這次改了 zones3d.js 一分鐘，事後把那段前後 46 支重跑）——下一件開另一個工作目錄。
- 工作目錄：`$SP/wt_bb`＝dev 0fe8cb80d4＋點椅子（staged，已交）；`$SP/wt_ch`＝dev 32d35ec2d6＋Café 鏡頭（staged，已交）。

## 交接（前一則｜帳號 A｜2026-11-11 10:5x UTC）

- 樓梯掃描：**LAWWW 10:07 ACK，整包（含引擎半步）放進這一版**；請 CC 走花序、總圖大廳、大口漢堡。
- **P2（發版後整合）已交（READY_FOR_REVIEW；全部 Node 測試 1286 支：1285 過＋bookstore 老警告）**：`wip/l118_p2_1111/`（README、`l118_p2_v1.patch`、`bar_before_after.jpg`、`window_backs_before_after.jpg`）。基底 dev 0b2d9c4f08，在 2b0929e277 上 --3way 乾淨。①義大麵屋吧台：椅子往外 0.12（−1.80）＋前板往裡退 0.15（−2.40，檯面下托架、兩端側板），`L118_IT_FIX.pasta` 那五格 sit 拿掉（不拿 `l118_interact_reach_1111_unit` 第 0 項會紅）；②奈良咖哩、義大麵屋窗上海報背面：`l118_int_omu.py` 新的 `poster_backs()`（紙＋透過來左右相反的圖＋膠帶）、`street_back()`（位置照街上那一張換算；義大麵屋第一張原本放在街上沒有海報的地方）。
- LAWWW 10:07 要我看 queue 裡 LAWWW2「等待其他AI／素材」有沒有不用等的：59 項，和 11-10 的 `queue_audit_1110.md` 第三節一樣，都是等 CC 拍、BB 判（D120）或暫停；ZQ-C504-LAPTOP 是 LAWWW-B 判「現在不做」。沒有找到不用等的。
- 這一輪學到的：①在遊戲裡拍店裡的東西前先看 http.server 是哪個資料夾開的（`readlink /proc/<pid>/cwd`）：8771 是 wt_ch、8791 才是 wt_bb，第一次拍錯成修改前；②`GAME.sitAt` 之後 3 秒左右遊戲會把人送出店（turbo），量骨頭、拍照要在 1 秒內；③剖面看膝蓋：`E.renderer.clippingPlanes=[new THREE.Plane(new THREE.Vector3(-1,0,0), x)]` 從側面拍（`$SP/p2/sect.js`）。
- 工作目錄：`$SP/wt_bb`＝dev 0b2d9c4f08＋P2（staged）；`$SP/wt_ch`＝dev d8e8a9ea56＋樓梯掃描（已交）。

## 交接（前一則｜帳號 A｜2026-11-11 10:2x UTC）

- **全區多樓層樓梯掃描（STAIR-LEVEL-AUDIT-1111，LAWWW 09:41 派的 P1）已交**：`wip/stair_audit_1111/`（edf92bf53，基底 dev d8e8a9ea56，在 0b2d9c4f08 上 --3way 乾淨）。新測試 `tests/stair_levels_audit_1111_unit.js`（15 個多樓層區域、14 座共用的樓梯、336 趟：左中右 × 上下 × 走跑 × 30／10 fps，引擎真的 stepEntity）。找到三個：花序、總圖大廳的第 1 層一路開到樓梯底（木曜日 ② 那一類，照 2c962ad66 的寫法擋下半段）；大口漢堡跑步 10 fps 卡在樓梯頂下面（樓梯頂接牆、一整步落在牆裡）→ 引擎 stepEntity 加「試走半步」（引擎共用，LAWWW 不想發版前動引擎可以單獨退那一段 hunk）。全部 Node 測試 1287 支：1286 過＋bookstore 老警告。
- 接下來（LAWWW 09:41 排的 P2，發版以後）：①義大利麵吧台的高腳椅膝蓋插進前板 5 cm（LAWWW 現在用 L118_IT_FIX 的 sit +0.12 m 墊著）→ 改 `tools/blender/env_second/l118_int_pasta.py`，椅子往外移或前板往內退；②omu、pasta 窗上海報的背面從店裡看是一大片米白長方形 → 背面貼圖或從裡面看不見。
- 還在等：BB／CC 判 118 巷室內第 3 版、泳池、季節；LAWWW 給座位最後的值（#47 重跑 `it_fix()`）；CC 的南洋戲院截圖。
- 工作目錄：`$SP/wt_ch`＝dev d8e8a9ea56＋樓梯掃描（已交）；`$SP/wt_bb`＝dev 0d7922555e＋季節第三批 v2（已交）。兩個都可以重設。

## 交接（前一則｜帳號 A｜2026-11-11 10:0x UTC）

- **使用者 07:5x 把這個工作階段的模型換成 Opus 5.5**（`/model`）：commit 的署名行跟著改成 Opus 5.5。
- 118 巷室內四間第 3 版：LAWWW 08:01 已整合（dev 6a76a9e58），交給 BB／CC 同機位重拍。之後只改擋玩的。
- **泳池水面＋泳客高度（POOL-SWIM-LOOK-1110）已交**：`wip/pool_swim_look_1111/`（d58fa7ea3）。LAWWW 08:10：v9.10.25 發版以後才整合。腿灰白是水面蓋的（拿掉水面腿和手臂同色）；遊戲端換 b1_water 的材質、不重匯 gym_b1.glb；character3d.js 只動 C.GYM.swim（tilt 0＝原本）。
- **季節布置第三批 v2 已交**（第三批＋季節攤販 A1～A6；`wip/season_batch3_1111/season_batch3_v2.patch`，v1 作廢）：LIFE-DETAILS-SEASONAL-1110 的 20 項模型都有了；A1～A6 的看、買由 LAWWW 接夜市那一套、AA 寫字。LAWWW：發版後整合。四季水果、花序季節花（B2 放在花序，不是晨露花舖）、下雨天（照天氣）、元宵燈籠、中秋文旦禮籃和騎樓烤肉架（唯一有導航阻擋的）。看的互動點都 hidden（LAWWW：沒台詞不開）。
- 座位按鈕搬回配置（#47）已交（`wip/l118_itfix_1111/`，ca08321de），**LAWWW 09:24：先不整合**——BB 還測到 118牛排 #11 #17、辛亥韓食 #1 #5 #9 搶鍵，LAWWW 在遊戲端的表上再改一輪、先發版；之後給最後的值，我用 lane118_shops.py 的 `it_fix()` 重跑。
- 現在沒有不用等別人的工作：等 BB／CC 判（118 巷室內第 3 版、泳池、季節）、LAWWW 給座位的最後值、CC 的南洋戲院截圖（MOVIE-POSTER-POS）——LAWWW 08:10 定的：接夜市那一套（night_market3d.js），我給 key（sea_yam、sea_aiyu、sea_mooncake、sea_couplet、sea_bouquet、sea_textbook）、攤販站的位置、客人站的位置、擺攤日期；文字 AA 寫；招牌只寫賣的東西（D147）。
- 這一輪學到的（寫給下一班）：①引擎的「站得住」（NavGrid.clear）只看人的前後左右四個點，落地東西的阻擋要比東西大一圈（0.5 m 的格子就多一格），不然人可以斜站到東西邊上；`tests/season_deco_nav_unit.js` 會抓。②`wz_street.py --season` 會順手重寫 `textures/gen/wz_rows_atlas_wenzhou.jpg`，每次跑完要還原（不能用 `git checkout -- textures/gen/` 整個資料夾，會把自己要的也還原掉）。③頂點色網格會平滑＋合併重疊的頂點：一條一條板條＋角柱的木箱，匯出後邊不是兩個面，single_side 補反面，Cycles 整箱黑的——箱子做成一個封閉的箱身＋貼在外面的深色薄片。④在遊戲裡拍：這台機器只有 Node 的 Playwright（`require('playwright')`），沒有 Python 版；拍照腳本 `$SP/pool/shot.js`（包 E.render 直接擺鏡頭）。
- 工作目錄：`$SP/wt_ch`＝dev 2d3e3abc8b＋泳池（已交）；`$SP/wt_bb`＝dev 0d7922555e＋季節第三批。

## 交接（前一則｜帳號 A｜2026-11-11 07:5x UTC）

- **118 巷室內四間第 3 版（最後一版，D141）已交**：`wip/l118_redo_1111/README_int_v3.md`＋`l118_int_v3.patch`（基底 dev bc407bfc5，在 2d3e3abc8b 上乾淨）。照 BB_341 第三節 2～6 條＋第四節。**使用者 07:4x 對 LAWWW：「118巷店面做好就可以先推出新版」（X341）——這一包擋發布**。等 LAWWW 整合、CC 重拍、BB 判；交了以後**只改擋玩的**，不再加東西。
- **街景（`lane118_street.glb`、`wz_street.py`、`wz_shopkit.py`、`l118_signs_tex.py`）現在由 LAWWW 的子代理修**（使用者 11-11 的臨時分工）：我不重匯、不改。我只跑 `lane118_shops.py -- --shop dian|self|korea|tea`。
- LAWWW 那邊的五間室內（`l118_int_<id>.py`）import 我的 `lane118_shops.py`：改共用函式要只對這四間的店代號生效（這一版的 `_over_trim`、`_cn／_cv／_ct／_cw` 都是這樣），改完用 `l118_int_omu.py` 重跑比對一次再還原。
- 這一版學到的：①牆上的收邊條凸出 1.5 cm，跨過它的菜單、海報要往外墊（原本被橫切、我在預覽裡沒發現）；②貼著天花板的東西節點叫 `CEIL_*` 就會被遊戲的 `ceilHide` 藏，`merge_by_material` 的 keep 要包含 `CEIL_`；③`shop_diners_unit` 對座位數敏感（清州 22 個座位就不過），加桌子前先跑；④預覽加一個「高處往下」的機位，比較接近 CC 拍到的遊戲鏡頭。
- 排在後面（交完這一包才做，LAWWW 07:40）：POOL-SWIM-LOOK-1110 泳池水面（#17）、季節布置第三批（#19，落地的 11 項，動導航前先跟 LAWWW 對）、118 巷外觀立面的缺點（BB 記著、不擋）、南洋戲院海報位置（#11，等 CC 截圖）。
- LAWWW 07:40 說我的使用者要求檔有十幾筆和總表對不上（kind 用字、X332 狀態）：發布後再同步，不擋。
- 工作目錄：`$SP/wt_ch`＝bc407bfc5＋室內第 3 版（已交，可以重設）。

## 交接（前一則｜帳號 A｜2026-11-11 06:4x UTC）

- **118 巷（X338）我這邊都交了**：第一批（dev d6c633adc）、第二批（dev 64add9fcf）已整合；**室內四間第 2 版已交**（62d1867c5，`wip/l118_redo_1111/README_int_v2.md`＋`l118_int_v2.patch`，疊在第二批上、在 dev db5bbdf4c 上乾淨），等 LAWWW 整合、CC 拍、BB 判。BB 有具體點＝室內第 3 版（D141 最後一版）；街景目前是第 1 版。
- **禮貌上師**：第 4 版 LAWWW 已標角色 ART_APPROVED（06:22），結案、不再修。
- LAWWW 那邊代做的室內：omu／noodle2／pasta 已進 dev 27bbb3b89（`l118_int_<id>.py`，import 我的 lane118_shops 當 LS）；home／cafe2 還在做。**我重跑 lane118_shops.py 只能 --shop dian／self／korea／tea**。
- 接下來（已問 LAWWW 先做哪一件；沒有回音就先做泳池水面）：POOL-SWIM-LOOK-1110 泳池水面（#17）、季節布置第三批（#19，落地的 11 項，動導航前先跟 LAWWW 對）、南洋戲院海報位置（#11，等 CC 截圖）。
- 工作目錄：`$SP/wt_ch`＝a740616de＋第二批＋室內第 2 版（已交）；`$SP/wt_bb`＝db5bbdf4c＋室內第 2 版（試套用的）。兩個都可以重設。
- 這一輪學到的（寫給下一班）：室內交付前一定跑 `l118_shops_notrap_1111_unit`（三次抓到 10 fps 會卡的點：桌角沒對齊 0.4 m 格、櫃台和桌子之間的縫、地上多擋一塊）；兩人桌同排桌距 ≥1.8 m（遊戲把 0.4 m 內的座位當同一個）；模型裡的 `TRACE_SQxx` 節點重匯要保留；街景的三角形數在 `singleside_streets_unit` 是釘死的；預覽要每間兩個機位（只拍門口往裡，招牌物件會剛好在鏡頭背後）。

## 交接（前一則｜帳號 A｜2026-11-11 06:1x UTC）

- **118 巷第 1 版**：第一批（62fa1b9ea）**已整合** dev d6c633adc；**第二批已交**（3ae708d32，`wip/l118_redo_1111/README_batch2.md`＋`l118_batch2_v1.patch`：兩間飲料店照圖、三個小補充、其餘五間的鄰居店面卡），等 LAWWW 整合。
- **禮貌上師第 4 版（最後一次）已交**（3ae708d32，`wip/limao_shangshi_1111/limao_shangshi_v4.patch`：暖灰白、瞇眼笑），等 LAWWW 判。
- 使用者 11-11 05:4x～05:5x 直接貼圖給我三次（UA-LAWWW2-1111-10～12）：七張第二組店內圖（存 `docs/handoff/user_specs/l118_ref/int2_*.webp`，LAWWW 已複製到 dev）、九張外觀、九張店內（後兩組和 dev 的 ext_／int_ 是同一批）。使用者說「我參考圖都給你了喔，9家店面的…飲料店的…我已經給你了」——二十二張＋七張都齊了，**不要再說沒收到**。
- **下一件（任務 #45）：室內四間第 2 版**（dian／self／korea／tea）。LAWWW 05:56：比參考圖空——牆面大片空白、廚房只有一條櫃台、招牌物件不明顯。要補：開放式廚房（抽油煙罩、鐵板煎台、冰箱）、牆面的東西、桌上餐點；預覽每間兩個機位（門口往裡＋從裡面看招牌物件）。底＝dev 最新＋第二批。D141 這是第 2 版。
- 工作目錄：`$SP/wt_bb`＝4993c19a6＋第一批＋第二批（已交）；`$SP/wt_ch`＝f247bc77f＋上師第 4 版（已交）。兩個都可以重設。
- 其他照下面那一則（做法筆記、基底就紅的測試——那六支 LAWWW 已在 dev c19d8b763 修）。

## 交接（前一則｜帳號 A｜2026-11-11 05:3x UTC）

- **已整合**：第七包（62afcfbc4：算命桌視線、節日的燈變白光、G01 燈籠、新生南路配件車）。BB 看完我做的三組 3D 人物：模型都不用再修（UA-LAWWW2-1111-08 可以結）。
- **118 巷（L118-SHOPS-REDO-1111，X338）第 1 版**：使用者的參考圖二十二張在開發分支 `docs/handoff/user_specs/l118_ref/`（九間 ext＋int、兩間飲料店 ext＋int；使用者直接傳給 LAWWW——**不要再跟使用者說沒收到圖**）。
  - 分工（使用者 11-11 05:2x 對 LAWWW：臨時把我的工作分出去）：我＝街景（十一間外觀）＋室內 dian／self／korea／tea；LAWWW 的子代理＝室內 home／cafe2／pasta／omu／noodle2（`l118_int_<id>.py`）。季節第三批、泳池水面先放著。
  - **第一批**（`wip/l118_redo_1111/`：README、`l118_batch1_v1.patch` 底 dev 4993c19a6）：街景九間照圖＋飲料店文字規格版、室內四間、道具、新測試 `tests/l118_shops_notrap_1111_unit.js`。全部 Node 測試 05:13 起在 `$SP/wt_ch` 跑（`$SP/l118_regress.log`）；跑完：README 狀態改 READY、copy log、cmp patch（**patch 要重出：跑的途中又改了 `tests/l118_shops_redo_1111_unit.js` 兩項期望**）、outbox、commit/push、send_message LAWWW（cc BB）。
  - 基底就失敗、不是我的（在乾淨的 4993c19a6 上一樣）：aa311_l118_unit、aa397_sideq_unit、aa404_sideq_unit、aa410_food_fav_unit、eat_unit、invites_quote_b6_unit（LAWWW 的 118 巷改名進行中）。
  - **第二批（任務 #43）**：兩間飲料店照圖（喝不喝咖啡：深藍白字黑框燈箱、左邊關著的玻璃門＋飲料海報、右邊外帶窗口灰磁磚腰牆；果茶社：米白招牌金黃立體字、淺木直紋櫃台、三杯水果茶橫幅、玻璃水果櫃、垂掛綠植）；只動街景。做完重拍十一間的鄰居店面卡、通知 LAWWW 重跑他那五間。
  - 做法筆記：招牌、海報從參考圖裁（`l118_signs_tex.py` 的 REF_SIGNS／REF_POSTERS，框的座標是 1280×720 縮圖上的）；價目表一律照文字規格／AA_280 重畫；室內用 `lane118_shops.py -- --shop <id>`（一次一間）；改了 `TX.SHOPS` 要先跑 `lane118_shops_tex.py`；`python3 tools/lane118/gen_shop_layouts.py` 重產 `src/data/l118_shop_layouts.js`；`lane118_neighbors.py -- --shop a,b` 重拍鄰居卡。桌子的阻擋要對齊 0.4 m 導航格、櫃台和桌子之間不要留 0.3～0.7 m 的縫（dian 被新測試抓到兩次）。
  - 讀通知晚了三次（12～14 分鐘，都在連續算圖／重匯的時候）。

## 交接（前一則｜帳號 A｜2026-11-11 04:4x UTC）

- **已整合進開發分支**（LAWWW ACK）：第五包（天花板、花序樓梯口、攤子透視）、季節布置第一批、第二批（cc894577f；20 項做了 9 項）、第六包（348b343a2：汀州路巷 A 兩側鏡頭碰撞盒、新生南路路邊機車 12 台）。
- **使用者 11-11 04:4x 直接給的指示**（`docs/handoff/user_asks_LAWWW2.json` UA-LAWWW2-1111-08、09）：
  1. 「你人物修一修也問BB意見吧／中間 不要弄太久 場景還有很多沒做的吧」→ 選擇題：我做過的 3D 人物全部（禮貌上師第 3 版、何俊朗、泳池游泳的人）。已發訊息請 BB 看一輪（副本 LAWWW），等 BB 回；有意見的才修、每個最多再修一次。
  2. 「我會給你店面外觀還有內部的參考圖 118 巷的九間店面還有兩間飲料店」→ 選擇題「圖還沒到之前先怎麼做」回「現在給你」。
- **118 巷（L118-SHOPS-REDO-1111，X338）**：照文字規格做的第 0 版**只保存不交付**：`wip/l118_redo_1111/`（e444b72e5，WIP；README 寫了做了什麼、還沒做什麼）。工作目錄 `$SP/wt_ch`＝dev 1c2b6d4a3＋第 0 版（已 `git add`）。**等使用者的參考圖到了照圖做第 1 版**；圖放 `docs/handoff/user_specs/l118_ref/`（使用者生成的圖可以進 repo）。
  - 定案的事：飲料店位置（喝不喝咖啡＝東 z −7～−2、果茶社＝西 z −9～−6，LAWWW 04:15 同意）；tea 這一格室內 2.6×8.0 m；店員、看東西的旁白照企劃線 `AA_772_l118_shops_redo_fix.json`（staff、look_lines）；營業時間、飲料店品名價錢照 `AA_280`（**我第 0 版菜單板上飲料店的品項、辛亥韓食的營業時間還沒對 AA_280，做第 1 版時要改**）；BB_335 的驗收重點（每個站得到的點走得回出口的 Node 測試、天花板單面、飲料店不擋巷子、招牌字清楚、地板不用深色木）。
  - 讀通知晚了兩次（8～12 分鐘）：連續匯出、算圖的時候每兩三個工具呼叫要讀一次。
- 空檔的佇列：季節第三批（落地的 11 項：A1～A6、B1、B2、B6、C2、C5；做之前先跟 LAWWW 對導航）、泳池水面（#17）、電影海報位置（#11，等 CC 截圖）、泰米村食的窗。
- 這個容器的注意事項照舊（下一則最後一點）。

## 全部待辦（場景；2026-11-11 04:5x UTC 列，LAWWW 要的；依據開發分支 `docs/handoff/tasks.json` owner 含 LAWWW2 的 88 筆未結案＋`queue_audit_1110.md`）

**A. 我手上真的還沒做完的（12 項）**

| 任務 | 一句話 | 卡在哪 |
|---|---|---|
| L118-SHOPS-REDO-1111（P1，X338） | 118 巷九間店外觀＋室內、兩間外帶飲料店 | 等使用者的參考圖（使用者 11-11 04:4x「現在給你」）；文字規格的第 0 版已保存 |
| LIFE-DETAILS-SEASONAL-1110（P2，X317） | 季節攤販、店門口變化、節日布置 20 項 | 做了 9 項；剩 11 項（季節攤販 A1～A6、B1、B2、B6、C2、C5）要落地、會動導航，先跟 LAWWW 對接法 |
| POOL-SWIM-LOOK-1110（P3） | 泳池水面（近看人像趴在水上） | 沒有卡，還沒排到 |
| MOVIE-POSTER-POS-1110 | 南洋戲院海報位置 | 等 CC 的截圖 |
| 泰米村食的窗（GG-SHOP-G11） | 室內窗景 | 沒有卡，小項 |
| 花序 Flower Notes 第 3 版 | 樓梯玻璃欄杆、金色扶手等 | BB 有要求才做（D141 只剩一版） |
| INTERIOR-AAA-REVIEW-1028（P1） | 校內室內美術分批提升 | 第一～三批已整合；剩兩間 P3（大步、總圖書庫），BB／使用者看到再補 |
| GYM-FIT-PROPS-1103／GYM-FIT-1107 | 健身房：手上的啞鈴、槓、划船把手，飛輪踏板會動 | 沒有卡，還沒排到 |
| BAKE-PC-1102-S2（P2） | 電腦烘焙的結果和雲端逐像素比 | 要使用者電腦烘焙的結果 |
| SHORTCUTS-TODO-1105 | 「先將就」清單逐項收 | 長期清單，每包順手收 |
| CHAR-BB-REVIEW-1111 | 我做的 3D 人物請 BB 看一輪（使用者 11-11） | 等 BB 回；有意見才修、每個最多再一次 |
| 最近幾包的遊戲畫面 | 第三～六包、花序第 2 版、季節兩批 | 我都沒看過遊戲畫面，等 CC 拍、BB 判；被退才有工作 |

**B. 登記「暫停」的（8 項，都是 LAWWW 或 D99 決定暫停，不是卡住）**：ART-13 明軒、小語模型｜CROWD-DEPTS-LOOK-1028 各系路人外觀｜BADMINTON-CLIP-V4-1102 羽球動作 v4｜NPC-POOL-ART-REST-1102｜HDRI-ENV-1104｜ART-PLAYER-SEASON-OUTFIT-1024 玩家四季服裝｜ART-JIAHAO-JOY｜CHAR-TEMPLATE。TEST-OFFLOAD-1102 可以結案（測試、截圖已經由 BB／CC 在使用者電腦跑）。

**C. 登記「等待其他 AI／素材」的 59 筆**：`queue_audit_1110.md` 逐筆查過——都是已整合、等 BB 判場景美術（D120），不是我的待做；BB 判不過才回到我這裡。tasks.json 上公館六間（GG-SHOP-G04…G13、GG-SHOPS3-ART）、汀州路（TINGZHOU-AREA）、花序（FLOWER-NOTES-ART）、招牌拉正（SIGN-RECTIFY）、禮貌生財鏡頭（LIMAO-INT-CAM）、ART-ECON-3D-GAP、OPEN-SRC-2D3D 還寫「進行中／待開工」，實際上都已交付並整合（狀態請 LAWWW 更新）。

**§6 三個優先項目（經濟系、寒暑假、美國交換）我這邊沒有還沒做的場景**：經濟系 3D 缺口 A～D 已整合；美國篇只剩 5 張要使用者生成的 2D 背景（BB 要圖）；寒暑假的機場第二版已整合。LAWWW 如果有要我補的場景請直接排。

## 交接（前一則｜帳號 A｜2026-11-11 03:2x UTC）

- **已整合進開發分支**（LAWWW ACK）：第三包（3d4107ca1）、花序第 2 版（1dcf099b8）、第四包＝機車配件三款＋同弦樂器招牌（535ce76a5）。BB：禮貌生財街上外觀第 2 版、汀州鮮果外觀第 3 版 ART_APPROVED；補的箱子 PASS。
- **第三包的禮貌生財室內鏡頭沒有修好——我判斷錯了**（只看截圖就推斷鏡頭在隔牆後面）。真正的原因：鏡頭 y 3.21 在天花板（3.0）上面，看到天花板的上表面。教訓：鏡頭問題先要 CC 的鏡頭座標，不要只看圖。
- **正在交：第五包**（`wip/pack5_1111/`，README 寫完；patch 底 dev 4eaf0d5e7；工作目錄 `$SP/wt_ch`）＝七間室內天花板改單面朝下＋`CEIL_*`、花序二樓樓梯口的口袋、攤位三個材質都可透視、手機殼攤背面。全部 Node 測試在跑（`$SP/pk5_regress.log`）。跑完沒失敗 → README 改 READY_FOR_REVIEW、outbox 加一筆、send_message LAWWW（副本 BB）。
- **做完待交：季節布置第一批**（`wip/season_batch1_1111/`：過年、聖誕；`season_<區域>.glb`＋`src/data/season_deco.js`＋`src/season_deco3d.js`；工作目錄 `$SP/wt_bb`）。全部測試也在跑（`$SP/ss_regress.log`）；LAWWW 排在第五包後面。之後還有 18 項（提案 `proposals/life_details_seasonal_1110.md`）。
- 接下來的佇列：泰米村食的窗、電影海報位置（#11，等 CC 截圖）、泳池水面（#17）、季節布置第二批。
- 這個容器的注意事項：不要整支 fetch cc-local／cc-testing（一次 3 GB；要看 CC 的圖用 GitHub 工具讀單一檔 `docs/story_planning/CC/local_out/<批>/out/<檔>`）；Python 沒有 playwright；兩個工作目錄的 `tools/blender/env_second/textures/` 有沒進版控的貼圖（重匯模型要用）。

## 交接（上一則｜帳號 A｜2026-11-11 02:4x UTC）

- **已整合進開發分支**：G10 巷口（731cca95b）、上師第 3 版（f5e1ef4e8，LAWWW 判可以進遊戲；D141 不再改版）、**美術第三包**（`wip/pack3_1111/`，我的 3d4107ca1；LAWWW 02:32 ACK）＝禮貌生財場景第 2 版＋室內隔牆鏡頭（PART_*）、汀州鮮果外觀第 3 版（最後一版）、trapFix 的地方放箱子、夜市棚子 seethru_tzs_awning 和燈泡。
- **做到一半：花序第 2 版**（`wip/flower_notes_v2_1111/`：README、patch 底 dev 099dad440）。改完、相關測試過；**全部 Node 測試在跑**（`$SP/fn_regress.log`）。跑完沒失敗 → README 改 READY_FOR_REVIEW、outbox 加一筆、send_message LAWWW（副本 BB）。
- BB 的判定（企劃線 BB_255 最後幾節）：夜市十攤、安泰藥局、榮恩典文具社（外觀＋室內）ART_APPROVED；汀州鮮果室內等 trapFix 修好重拍；禮貌生財場景、花序等 CC 拍第 2 版。
- 等 CC 拍的（我這裡無頭瀏覽器太慢、沒看過遊戲畫面）：禮貌生財隔牆鏡頭、上師新座位、夜市棚子透視、汀州鮮果外觀第 3 版、G10 通道另一頭、花序第 2 版。
- 接下來的佇列：花序交付 → 機車配件（風鏡、車廂、雨衣）→ 泰米村食的窗 → 季節 20 項（#19）→ 電影海報位置（#11）→ 同弦招牌（#20）→ 泳池水面（#17）。
- 這個容器的注意事項：`.git/objects/pack/tmp_pack_*` 是抓 cc-local 失敗留下的（一次 3 GB），**不要整支 fetch cc-local／cc-testing**；要看 CC 的圖用 GitHub 工具讀單一檔（`docs/story_planning/CC/local_out/<批>/out/<檔>`）。Python 沒有 playwright，Node 有（`$SP/lmcam/shot.js` 是 fast_shots 的 Node 版，SwiftShader 很慢）。

## 交接（上一則｜帳號 A｜2026-11-11 01:0x UTC）
- **第二包已整合 dev**（949a24cc6）：夜市時間照稿、X335 公館 G09／G10 鐵捲門、公館招牌櫥窗貼圖、七間室內牆面、安泰貨架、汀州鮮果。BB：機車第 3 版 FIXED、汀州路街景 ART_APPROVED 恢復；洗樂、印得好室內第 2 版 ART_APPROVED。
- **上師 3D 人物**：第 1 版模型檔在 dev，但 LAWWW 驗角色不過（六點）；**第 2 版已交、等 LAWWW 驗**：`wip/limao_shangshi_1111/limao_shangshi_v2.patch`（f0f58fca4；README 最上面有六點對照和還差的）。不過的話做第 3 版（D141 最後一版）。腳本 `tools/blender/char_second/limao_shangshi.py`（在 dev；第 2 版的改動在 patch 裡）；VRoid 樣本要 `bash tools/blender/setup_env.sh` 抓。
- **等使用者決定（要用選擇題問，D150 之外使用者 11-11 00:26 的要求）**：公館 G10 要不要改成真的巷口（「往汀州路」的按鈕現在在鐵捲門前）。
- **接下來**：上師第 3 版（如果被退）→ 花序第 2 版（球形的花換成真的花、冷藏櫃等細節）→ 機車配件模型 → 其餘舊佇列。
- 工作樹（scratch）：`wt_bb`＝dev f8ff49f43＋第二包（已交，可以刪）；`wt_ch`＝dev a724370bc＋上師第 2 版。

## 交接（上一則｜帳號 A｜2026-11-11 00:3x UTC）
- **使用者 11-11 00:26（UA-LAWWW2-1111-05）**：稱呼使用者用「你」，不是「妳」；要他決定的事用選擇題問；可以開工。
- **已整合 dev**：花序 B 件＋公館三間（3a216dfb2）、夜市十攤＋背景三攤（b810b809b；LAWWW 接了能買 night_market3d.js）、禮貌生財＋BB_255 三項（11161c101；LAWWW 接了上師對話 limao3d.js，並把我的 tingzhou3d.js 改成營業時間照時鐘 TZ3.clockHour）。
- **已交、等 LAWWW 整合／驗**：上師 3D 人物第 1 版 `wip/limao_shangshi_1111/`（6acdb2d7f；角色美術 LAWWW 驗；NPC 沒放）。
- **做完、全部測試在跑、還沒交**：第二包 `wip/pkg_1111b/pkg2_on_dev_f8ff49f43.patch`（README 在同一個資料夾）＝夜市時間照 AA_752、X335 公館 G09／G10 鐵捲門、公館招牌櫥窗貼圖放大、七間室內牆面改乾淨、安泰貨架、汀州鮮果補滿、禮貌生財小項。測試 log 在 scratch 的 `p2_regress.log`；跑完沒有失敗 → README 狀態改 READY、outbox 加一筆、send_message LAWWW（副本 BB）。如果中斷：在最新 dev 的工作樹 `git apply --3way` 這個 patch，重跑全部測試再交。
- **教訓（這一班新增）**：①通知排隊太久三次（14、15、15 分鐘）：長的工具鏈中間要插 ReadNotifications。②容器磁碟只有約 9 GB 可用，工作樹一個約 2 GB：只留一兩個，舊的 `git worktree remove --force`；`cd` 到不存在的工作樹失敗以後，後面的指令會在主資料夾跑（有一次 `git apply` 因此在主資料夾執行，檢查過沒有改到追蹤的檔）——`cd X && …` 要用 `&&` 串。③Cycles 預覽裡單面化後重疊的正反面會算成黑色，是預覽假影，不是模型壞。④測試讀企劃線的 commit：容器要 `git fetch origin claude/story-planning`，不然 aa401、termend 兩支會假失敗。
- **接下來的佇列**：第二包交付 → 等 CC 拍、BB 判（夜市、禮貌生財、機車第 3 版、洗樂／印得好、公館三間第 2 版、G09／G10）→ 上師臉部皺紋（第 2 版）→ 花序第 2 版換真的花 → 機車配件模型（擋風鏡、袋子、雨衣）→ 其餘舊佇列（南洋戲院海報、同弦招牌、泳池水面、季節細節 20 項）。

## 交接（上一則｜帳號 A｜2026-11-11 00:1x UTC）
- **等 LAWWW ACK 的只有一包**：`wip/flower_notes_1110/gg_flowerB_gg3_ext_int_r2.patch`（8e15235bc，README_r2.md）＝花序 B 件（公館 G11 外觀、拿掉舊花攤）＋公館三間外觀＋公館三間室內。第一次交（8dd2084a2）被退：`zq_arcade_seat_unit`（G08 子晴的凳子不見）、`street_props_nav_unit`（GG_PROP_BLOCKS 沒重算），已修。
- **已整合 dev**：汀州路第 2、3 版和機車、花序 A 件（室內）、泰米／洗樂／印得好室內。
- **教訓（照做）**：交件前跑**全部** Node 測試（`ls tests/*_unit.js > list; bash $SP/kit_run.sh <工作樹> list`，約 20 分鐘），不能只跑相關的幾十支。重建公館店面街以後一定看 `zq_arcade_seat_unit`、`street_props_nav_unit`：照參考圖的店面（gg_front）會把騎樓雜物換掉——要留的寫進 `keep`；`GG_PROP_BLOCKS`（`src/zones3d.js`）要照新的 `gongguan_shops.props.json` 重算。
- BB：機車第 2 版那次正式模型有載入（十四種外形在街景距離看起來差不多）；新版等 CC 統計每款幾台、放大三款；放大還分不出來的話，要把款式之間的輪廓差別做大（不是只靠顏色）。先不用動。

## 交接（上一則｜帳號 A｜2026-11-10 23:5x UTC）
- **六間店室內第 1 版都交了**（使用者 23:xx「六家的內部參考圖」，`ref/gg_shops6_1110/interior/`）：`wip/gg_shops6_int_1110/`（README 每一間的內容、給 LAWWW 的 kind、先將就的）。三個 patch 依序套：`tz_shops_int_v1_taimi_xile.patch`（51a7dfb8d）→ `tz_shops_int_v1b_yindehao.patch`（3042b26e9）→ `tz_shops_int_v1c_gg3.patch`（34a5e0656）。共用：`src/data/tz_shops_layout.js`、`src/tz_shops3d.js`（公館三間的入口用 hookOut 包住 gongguan build）、`tools/blender/env_second/tz_shops_interior.py --shop <taimi|xile|yindehao|antai|xianguo|rongendian> [--ref <室內參考圖資料夾>]`、`tests/tz_shops_unit.js`。等 LAWWW 整合、CC 拍、BB 判 → 照判定出第 2 版（最多 3 版）。
  - 已知要改的：商品是彩色小方塊沒有圖案；汀州鮮果籃子裡的水果不夠滿、6.2 萬三角形；布簾布棚是平的；沒有光照貼圖、窗外沒有景；AA_743 只對了泰米（差異表在 README），其他五間還沒逐項對。
- **汀州路三間外觀：BB 判 ART_APPROVED**（第 3 版）。街景只剩機車等重拍（525dc11eb 已交；機車模型本來就有十四種外形，若拍到同一款＝正式模型沒載入，看 `zone.tzScooterGLB`）。BB 另記：洗樂正前方那根路燈擋到招牌，下次動汀州路區域時挪 1～2 m；印得好招牌晚上偏暗。
- **X332 禮貌生財**（算命攤改成巷 A 裡的小店）：規劃補在 `proposals/night_market_1110.md` 6c（131d88662），**只規劃**；等使用者回三題（位置、招牌書法字、要不要給參考圖）和實作授權。
- **D148**：東西放哪已經給 LAWWW 寫進 `docs/handoff/FACTS.md`（dev）；每批結束、交班、接班跑 `check_handoff.py loose`。
- 使用者電腦的 Blender 佇列：`LW2_FN_VIEW`、`LW2_TZ_PREV` 已排（CC：BLENDER_PING 通過），還沒跑完。

## 交接（上一則｜帳號 A｜2026-11-10 22:5x UTC）
- **Blender 慢的工作排到使用者的電腦**（X331，ROLE_LAWWW2 1.0，接班必讀）：超過幾分鐘的算圖、烘焙不要在雲端算。佇列列傳給 CC。**現在排著兩項**（22:4x 傳給 CC，還沒回）：`LW2_FN_VIEW`（花序室內六張，`tools/blender/env_second/flower_notes_view.py`）、`LW2_TZ_PREV`（汀州路十張，`tingzhou_preview.py`）；腳本在這個分支 285963bc6、模型用 dev 2a7edffd5。這兩支沒在 Windows 跑過，失敗的話看 CC 給的 run.log。結果在 `claude/cc-local` 的 `docs/story_planning/CC/local_out/<ID>/`。
- **汀州路機車**（使用者：「長得幾乎一樣莫名其妙」）：`wip/tingzhou_1110/tingzhou_v3b_parking.patch`（525dc11eb）已交，一群一群停、有空位、有腳踏車。BB 收回了街景的 ART_APPROVED，等 CC 重拍。如果重拍還是同一款：看 `E3.zone.tzScooterGLB`（undefined＝正式機車模型沒載入）。
- **夜市**：使用者回了四題（配置照方案、背景攤只寫賣的東西、公館那一側也擺幾攤、各攤時間不一樣），已補進 `proposals/night_market_1110.md` 6b（公館三攤的提案、逐攤時間表）。**仍然沒有授權實作**，她會再給十張攤位參考圖。
- **花序**：LAWWW 看了 A 件——**花是小球，第 2 版一定要換**（葉片卡／花瓣模型，玫瑰、繡球、櫻枝要認得出來；`tools/blender/plants.py` 有葉片卡的做法），冷藏櫃、永生花玻璃罩、包裝紙捲、收銀螢幕照參考圖補；二樓的決定他同意。G09 放什麼他在問使用者。

## 交接（上一則｜帳號 A｜2026-11-10 22:3x UTC）
- **今天交出去、等整合／CC 拍／BB 判的**（outbox 都登了）：
  - 汀州路第 3 版（6c560d699，三間招牌）——LAWWW 已整合。
  - 花序 A 件（033f083db，室內）——LAWWW 已整合（dev 2a7edffd5）。
  - **花序 B 件＋公館三間外觀（8dd2084a2，`wip/flower_notes_1110/README_B.md`、`flower_notes_v1b_gg_shops3.patch`）**：dev 2a7edffd5 上試套乾淨。公館 G11 花序外觀、G04 安泰藥局／G08 汀州鮮果／G13 榮恩典文具社照使用者參考圖、四間門前中間的柱子拿掉、舊花攤拿掉。等 LAWWW ACK。
  - 夜市規劃文件（a05a5277d）：等使用者回四題、授權。
- **沒人定、不要自己做的**：公館 G09（洗樂搬走以後放什麼）、G10 要不要改成巷口模型。
- **下一步（照順序）**：①看 LAWWW／BB／CC 回來的東西，照判定改；②花序第 2 版：花的造型（現在是小球）、「公館二樓高度」的窗景（做法照總圖 `tools/shots/library_views.py`）、門口橄欖樹和花台、洞石紋；③公館三間門口的東西（安泰特價推車和血壓計、榮恩典筆記本推車、汀州鮮果騎樓的水果箱）和室內（AA_743）；④汀州路：印得好門外樣本架、泰米黑板立牌、泰米室內、遠景；⑤排著的小項：同弦樂器招牌被擋（BB P2）、泳池水面、南洋戲院海報、季節布置 20 項。
- **重建公館店面街的做法**（這次才補齊）：參考圖在企劃線 `docs/story_planning/ref_images/`（`git show origin/claude/story-planning:<檔>` 抓到一個資料夾，wz_cafes 的也放進同一個資料夾）；`python3 tools/blender/env_second/gg_shops6_tex.py`（新的六間＋花序）→ `XS_ONLY=gg python3 tools/blender/env_second/xs_front_tex.py <參考圖資料夾>` → `/opt/blenv/bin/python tools/blender/env_second/wz_street.py -- --set gongguan`（約 80 秒；**一定要有 `--`**，沒有的話會把溫州街的 GLB 蓋掉）。`textures/src/gg_cards/` 舊的幾張只在這個分支。
- 工作樹：`$SP/wt_tz2`（dev a37b2ff61＋本機兩個 commit＝汀州路第 3 版、花序 A；上面是 B 件的改動）。換容器就沒有了，以分支上的 patch 為準。

## 交接（上一則｜帳號 A｜2026-11-10 22:1x UTC）
- **汀州路**：第 2 版已整合（dev 9cc173c29）；BB：街景＋五間正式店面 **ART_APPROVED**；三間（洗樂、印得好、泰米）只差招牌 → **第 3 版已交**（6c560d699，`wip/tingzhou_1110/README_v3.md`、`tingzhou_v3_signs.patch`，底 dev a37b2ff61）：各留一塊、放大到店面寬。等整合、CC 重拍。巷 A 和夜市攤 BB 不判，併到夜市任務。
- **NIGHT-MARKET-1110（X326）規劃文件已交**（a05a5277d，`proposals/night_market_1110.md`）：使用者未授權實作，**不要動攤位模型**；等使用者回第 7 節四題。授權後照文件第 6 節做（01 刈包要整攤換成沈三盃黑糖鮮奶）。
- **花序 Flower Notes（X325）A 件（室內）做好、在跑回歸**：`$SP/wt_fn`（dev 8372e7086）有配置 `src/data/flower_notes_layout.js`、區域 `src/flower_notes3d.js`（兩層導航、公館 G11 進出）、`tools/blender/env_second/flower_notes_interior.py` → `flower_notes_interior.glb`（3.7 MB、11 萬三角形）、`tests/flower_notes_unit.js`（ALL PASS）。程式備份在 `wip/flower_notes_1110/flower_notes_WIP_code.patch`（GLB 沒進備份，腳本跑得出來：約 3 分鐘）。交件說明 `wip/flower_notes_1110/README.md` 已寫好，回歸跑完就打包 `flower_notes_v1a.patch`、登 outbox、通知 LAWWW（副本 BB）。
  - 先將就的（README 有）：花是簡化的小球、窗景用現成的慢輪街景照片、沒有光照貼圖、字體只有黑體。
  - Blender 腳本裡畫幾千個小東西時，不能用 lane118_shops 的 ccyl（每畫一根把整個網格的面做成集合，慢到跑不完）：`flower_notes_interior.py` 自己蓋掉了一版快的。
- **花序 B 件＋公館三間要一起做（還沒動手）**：`wz_street.py -- --set gongguan` 的 `_SHOPS` 還是舊名字（G04 公館藥局、G08 水果行、G09 自助洗衣、G10 影印・輸出、G11 日日定食、G13 文具・畫材，招牌是舊的設計稿圖集）。要改：G04 安泰藥局、G08 汀州鮮果、G13 榮恩典文具社照 `ref/gg_shops6_1110/concept/`（做法同汀州路 TZ_ARC：`gg_front` 的 cards／door／street，貼圖裁進 `xs_front_tex.py` 的 QG → gg_fronts_atlas）；G11 花序外觀照 `flower_notes_ref/exterior.png`（一、二樓洞石立面、招牌帶、二樓整排玻璃；保留騎樓線）；G10 改成往汀州路的巷口；**G09（洗樂搬走以後）放什麼沒有人定，要問使用者／LAWWW**；舊花攤 gg_flower_stall 拿掉。遊戲的 zones3d.js 店面街清單（G09～G11 還寫洗樂、印得好、泰米）是 LAWWW 的。

## 交接（上上則｜帳號 A｜2026-11-10 21:4x UTC）
- **汀州路第 2 版已交**（39fcb2b72，`wip/tingzhou_1110/README_v2.md`、`tingzhou_v2.patch`，底 dev 6c55e63e3）：五間沒有騎樓（使用者「混合」）、洗樂／印得好／泰米照使用者 21:1x 的參考圖、夜市攤位模組十四種（`tz_stalls.py`）、路邊機車、BB 第 1 版五點。等 LAWWW 整合、CC 重拍、BB 判。沒在遊戲裡看過：攤位顏色、店內調暗。第 3 版要做的寫在 README_v2「還沒做」。
- **使用者 21:1x 給了六間店外觀參考圖**：`ref/gg_shops6_1110/`（concept/ 六張＋README）。汀州路三間已用；**公館三間（G04 安泰藥局、G08 汀州鮮果、G13 榮恩典文具社）還沒做**（GG-SHOPS3-ART-1110）：照 RULES_2D_TO_3D，招牌從圖拉正裁（做法看 `tz_fronts_tex.py` 的 tzyin_／tztai_／tzxile_ 和 wz_street.py 的 TZ_ARC）。
- **正在做：FLOWER-NOTES-ART-1110 花序 Flower Notes（X325）**。規格 dev `docs/handoff/user_specs/FLOWER_NOTES_1110.md` 第四～六節、參考圖 `flower_notes_ref/exterior.png、interior_1f.png、interior_2f.png`（二樓只參考室內，窗外用遊戲裡公館二樓高度的街景，做法照總圖 library_view）。公館店面街 G11、寬 10 m。我要做：外觀、一樓、走得上去的二樓教室、區域／導航／進出（照 wancai3d.js 兩層導航）、舊花攤 gg_flower_stall 同一個 patch 拿掉。買花互動點 LAWWW 接到收銀櫃檯。
  - 我定的配置（還沒寫成檔）：房間 10×14 m，店面在 +z；前半（z 0.5～7）挑高、後半（z −7～0.5）上面是二樓教室（樓板 3.9 m）；樓梯沿東牆往北爬（寬 1.4、樓板開口）；一樓：門在正面中間、中央橢圓展示台在挑高區、左牆永生花＋鮮花、後牆冷藏花櫃、東牆包裝收銀長櫃檯。二樓朝街那一面是玻璃欄杆，隔著挑高看正面二樓的玻璃和白紗簾。外觀保留公館的騎樓線（一樓玻璃退 3 m，二樓和招牌帶在立面線），不改公館導航。
  - 分兩件交：A 室內區域（配置、區域 JS、Blender 室內、測試）；B 公館外觀（重建 gongguan_shops.glb 的 G11）＋拿掉舊花攤。
- 工作樹：`$SP/wt_tz2`（dev 6c55e63e3＋汀州路第 2 版，乾淨的交件樹）。不要在工作樹用 git stash。

## 交接（上一則｜帳號 A｜2026-11-10 20:5x UTC）
- **正在做：汀州路商圈（TINGZHOU-AREA-1110，X321／X322）**。第 1 版已交、LAWWW 已套（開發分支 7a625da3c）；CC 在拍遊戲截圖（14:00、18:30、20:30；機位在我 20:4x 給 LAWWW 的訊息、wip/tingzhou_1110/README）。
  - 依據全在 `docs/art-rebuild/second_ai/ref/tingzhou_1110/`（USER_INSTRUCTION_1110.md 四則原文、concept/ 七張使用者的概念圖、REF_ANALYSIS.md）。交件 `wip/tingzhou_1110/`。
  - **等使用者決定**：五間概念圖店面前面要不要騎樓（現在有 3 m 騎樓；概念圖是直接臨人行道；可以混合）。其他 21 間店面只寫種類、店名等使用者定（她說「店面新增由我決定」，AA_744 的店名取消）。
  - 第 2 版要做（README「先將就的」9 點）：樓上加密（鐵窗、冷氣、盆栽、管線）、泰米村食／洗樂洗衣坊／印得好外觀照 `docs/handoff/user_specs/GG_SHOPS3_1110.md` 第三節（開發分支）、泰米村食室內（AA_743，10×9、18～20 座，最急）、夜市攤模組（`STALL_<種類>_open／_closed`，位置寫 layout 的 stalls；AA_744 第 2 節品項；時間切換和看／買 LAWWW 接）、街兩頭遠景、公館 G10 巷口模型、柱子導航對 GLB 的測試。會動的車這一版不做。
  - 建置：`bash tools/blender/setup_env.sh`；`textures/gen` 用這個分支的；缺的 Poly Haven 貼圖 `lib2.fetch`；`TZ_CONCEPT=<概念圖資料夾> tz_fronts_tex.py` → `wz_street.py -- --set tingzhou`。預覽 `tingzhou_preview.py`（雲端一張 1.5～4 分鐘；`TZ_SCOOTER_SKIP=1.1` 不放機車——預覽的機車是整個檔複製、全白，使用者看了問過，不是遊戲的樣子）。
  - 踩到的：景深卡最深 0.8 m（樓房後牆在玻璃後 0.85 m）；src 不能出現「自助洗衣」（aa655 測試）；新的模組層旗標要登記 LOADLOCKS。
- **SIGN-RECTIFY-1110（X323）做完**：十七塊斜招牌照參考圖重新量四角拉正，三顆 GLB 只換嵌入的圖集（`glb_replace_image.py`；`wip/sign_rectify_1110/`）。BB 已判 FIXED 12 塊；大口漢堡第二版等 CC 重拍。**還欠：同弦樂器招牌被二樓鐵窗、冷氣擋住（BB P2）**——要重建 `xinsheng_street.glb`（XS_FRONTS tongxian 那一段鐵窗開口、冷氣移開）；重建前先把 `textures/gen/xs_fronts_atlas.jpg` 換成拉正＋大口 v2 的版本（現在 gen 裡的是第一輪拉正的，大口還是拉寬的）。
- **排著的**：GG-SHOPS3-ART-1110 公館三間（安泰藥局、汀州鮮果、榮恩典文具社）外觀＋室內；POOL-SWIM-LOOK-1110 泳池水面（P3）；LIFE-DETAILS-SEASONAL-1110（X317：使用者決定 20 項全做、含萬聖節、攤販能看能買；AA_747 有攤販品項；提案 `proposals/life_details_seasonal_1110.md`）；MOVIE-POSTER-POS-1110（v9.10.24 已上線，等 CC 截圖）；使用者說要給晨露花舖參考圖（LAWWW 轉）。
- 已完成、已上線或已套：US-LONG-3D-1110（v9.10.24，LAWWW ART_APPROVED）、泳客、會所、教室、夜景、巷口告示牌、規則整合（四個舊規則檔已刪）。
- 這一班的使用者原話都在 `docs/handoff/user_asks_LAWWW2.json`（UA-LAWWW2-1110-01～07）。

> **規則只放一處（RULES-CONSOLIDATE-1110，LAWWW 11-10 19:12）**：共同規則＝開發分支的 `CLAUDE.md`；LAWWW2 的職位規則＝`docs/rules/ROLE_LAWWW2.md`（原本的 WORK_RULES、ART_SOP、SCENE_RULES、RULES_2D_TO_3D、ART_DIRECTION §12 都併進去，節號保留）。這個分支上那四個檔 11-10 刪掉了；新方法、工具表、踩到的坑要改規則，把文字交給 LAWWW 改 ROLE_LAWWW2，不在這裡另外寫規則。


> **新容器第一件事：跑 `bash tools/blender/setup_env.sh`（D144，使用者 11-10 16:2x：「不是早就應該已經裝了嗎？為什麼現在才問我？……為什麼每次都要重新講一次」）**。
> - 它裝 Blender 的 VRM 外掛、VRoid CC0 樣本。這些 10-10 起就在用、有登記（LICENSES.md、D33、`tools/blender/char/common.py` 開頭）。
> - **已經在用、有登記的工具，接班時直接裝，不要問使用者。**
> - 開發分支還沒有 `setup_env.sh` 的話，照 `tools/blender/char/common.py` 開頭那兩行裝外掛。
> - 真的被權限擋住時，寫清楚擋在哪一步，告訴 LAWWW（LAWWW 轉給使用者在工作階段按允許），不要改用方塊人。
> - 起因：11-10 10:48 LAWWW2 把「游泳的人卡在安裝 VRM 外掛」當成要問使用者的事。

> **接班必讀（使用者 11-05 03:4x，UA-LAWWW2-1105-01）：任何 2D 轉 3D 都照 `RULES_2D_TO_3D.md` 做**——「疊圖畫出來的3d真的很棒寫成規則 以後任何2d轉3d都要參考這次透過開源或者新增的各種美術方法都要寫進規則交接給下一個lawww2」。流程、工具表、踩過的坑、範例（同弦 `wip/tongxian_ref_1105/`、2:30 AM `wip/wz_five_1104/cafe230_exterior.md`）都在裡面；有新方法就加一列。

> **先將就的待辦（使用者 11-05 09:3x「先將就的：記得放到代辦事項 以免交接後又忘記」）：`TODO_SHORTCUTS.md`**。
> - 每一包 README 的「先將就」都收在那裡。
> - 接班的人從那裡挑；新交一包就加上去。

## ✅ 值班登記（2026-11-10 08:xx UTC；帳號 A LAWWW2；使用者：「是接班 幫我通知其他AI」）
- 工作階段 `session_01AC1WVgJSmoJK1uRsPK2Zn1`，分支 `claude/second-ai-env-art`。
- 接班基準：快轉到 LAWWW2-B 最後一筆 `9b3c9b62b`（`claude/funny-albattani-iawshm`）。帳號 A 上一班的最後一筆 5f85444cd 是它的祖先，所以不用合併。
- RULE_SOURCE：`claude/modest-rubin-2lyp7g`（duty find，seq 124；值班：沒有人，上一任 B）；規則 SHA `6c6bfd421`。
- `duty register` 已寫 `duty_LAWWW2.json`，等值班 LAWWW `duty sync`。
- `roles` OK：LAWWW2 158 行全部待辦都在總表。
- 已通知帳號 A 的 LAWWW、AA、BB、CC，四則都是 DELIVERED。CC 已經接班，也回了 ACK。
- 帳號 B 期間使用者說過、還沒做完、歸 LAWWW2 的（USER_WANTS）：
  - X283 CAMPUS-FLOOR-STRIP-1110 路緣長條：補丁 READY_FOR_REVIEW，還沒交件。
  - X285 AVENUE-FAR-SIGNS-1110 椰影大道遠景都是補習班：只查了、還沒改。
  - X289 YIZHAN-FLOAT-CUPS-1110 一盞飲料飄在半空：要查。
  - X294 LAWCLUB-BOOTH-MOVE-1110 法服攤位搬到法學院前：要做。
  - X276 SIS-STATIONERY-1110 山嵐文具區：WIP 第二輪。
  - X296 總圖樓層簡介看板浮空、X298／X299 總圖 B1：LAWWW 先處理了，等我看要不要收進 Blender。
  - 更早的：X227、X228、X229、X239、X247、X254、X257。照 user_asks_LAWWW2.json 和 TODO_SHORTCUTS.md。
- ~~下一步照下面交班一節的 D：…~~ **（11-10 13:5x 更正）這幾件都已經交了、也驗收了：路緣長條、遠景招牌、一盞飲料、法服攤位、文具區。不要重做。現在的進度看下面「12:5x～13:5x 進度」。**
- **進度（11-10 09:1x UTC）**：
  - X283 路緣、X285 遠景看板：整合 dcc9276f8，BB 判 PASS（BB_255）。
  - X294 法服攤位：整合 9202e2fab。X307 總圖 B1 中庭：整合 10df264ed。
  - X276 山嵐文具區：LAWWW 接進 72c889ec3，等 CC 拍。AA 的品項清單（AA_732 shops[1]，18 樣）到了，照這份可以再調 `stationery_add.py`，P3。
  - X289 一盞杯子浮空：已交付 57a9dd322（`wip/yz_cup_float_1110/`）。原因是 seatact 桌上群組掛在一盞往 +z 搬 2.3 m 的房間群組底下。
  - X296 總圖樓層簡介：LAWWW-B 已修在開發分支（7a019726d），重跑測試 PASS，不用做。
  - X257 GYM-MOVE-1105：XS-GATE-NORTH 的 patch 已整合，外觀 campus_gymext.glb 也接了，只差驗收。兩件都已告訴 LAWWW。
  - X254 窗景：等 BB／CC 的判定清單（BB 排在 X295 後面）。
    - 已查（09:3x 更正）：每一間都有自己位置的照片。慢輪是 views/bikeshop_*（Blender），阿德是 wz_print_*，林家是 wz_lin_*；
      日和便利店 cvs_*、公館燒臘 noodle_* 是 10-23 在遊戲裡拍的兩層（cvs 的註解寫「舊店面的角度，要重拍」）。等 BB 判角度和內容對不對。
  - X307 第二輪 B1 中庭白霧：已整合 fda54d616（玻璃只畫朝中庭那一面），等 CC 重拍 03、07。
  - **10:3x 進度**：
    - X307 第三輪（真正的原因是玻璃雨遮）：整合 28df8a85c。
    - 花攤 GG-FLOWER-STALL-1110：整合 de1f25768，LAWWW 已接買花。
    - 日和便利店窗景：拍攝位置修正，整合 4d7f556a6，等 CC 在遊戲裡重拍；Blender 版不採用。
    - 佇列盤點 QUEUE-STALE-LAWWW2-1110：表在 queue_audit_1110.md，LAWWW 照表改了 tasks.json（4042c708a）。真的還沒做的 15 項就是之後的佇列（照 D81：玩家越早遇到越先）。
    - GG-DOOR-CAMS-1104：已交付 c91a79854。改了兩處：行道樹葉片在鏡頭附近網點透空；捷運出口亭的鏡頭碰撞照模型外框。
    - 南洋 ART-NANYANG-CINEMA-1103：已告訴 BB 重跑用 fe4d893ac。r2 的 FAIL 1～4 在 2258988a5 修了；FAIL 5 看起來是探針的連帶失敗。
    - 下一件：WZ-SEAT-CAMS-1104（SUNNY F12、小路座位鏡頭）。
  - **10:4x 進度**：
    - WZ-SEAT-CAMS-1104 已整合 9d4c54c16：AA 12ae10d3e 的透空、鏡頭牆被新配置蓋掉，照現在的 GLB 重加；兩間店擋住 37／126 → 0。
    - FAIR-TENT-CAM-1102 交付 4a61b27e9，LAWWW 本機整合 88bd03f56，等 GHA 跑完再推。
    - PUTONG101-WINDOW-1102 交付 a43da6a27：博思一樓玻璃換亮一點的灰藍漸層；窗景照片要 CC 重拍（teach_views.py putong_north）。
    - 盤點表再更正（6d19463fc）：DORM1-WALL-SEAM 早已整合（4b5a0ebd8）、ART-OLDROAD-SHELF 被頁間取代。**以後搜 git log 要用沒有日期的短 ID。**
    - 剩下的佇列：ART-GYM-POOL-SWIMMERS-1103、GYM-FIT-PROPS-1103（要新的人物泳裝、動作，先確認 D99 人物凍結還算不算）→ CROWD-DEPTS-LOOK-1028 → PERF-CAMPUS-GLB-1102 → ART-SOP → BAKE-PC-1102-S2 → LAWWW2-REEXPORT-US-1027 → INTERIOR-AAA P3、萬才館倒角。
  - **12:5x～13:5x 進度**（帳號 A；NTU-REF-AUDIT X223，照 LAWWW 12:51 的順序）：
    - 已交：
      - ① 晨思鐘 00a298885：改成無頂金屬鐘架。LAWWW 已接（077a4e5d2）。
      - ② 行政大樓、文學院、校史館外牆 36e234d0f。LAWWW 已接（8d8b475dc）。
      - ③-1 男一舍 4f695028e：灰色清水混凝土、樓梯塔圓窗。LAWWW 已接（本機）。
      - ③-2 共同教學館 812dd23d8：紅磚舊館＋米色翼樓。LAWWW 已接（本機）。
      - ③-3 映月湖 50ac4d5c6：綠琉璃瓦、紅欄杆、三棵垂柳。待整合。
      - ③-4 研三舍 3b080b7f3：拿掉多蓋的那一棟，研三舍在國青裡。待整合。
    - 每一件都要 CC 拍同角度疊圖（`--mode campus`）、BB 判（D141 最多 3 版）。
    - **13:3x 以後**：
      - 套件五棟 5b47de929：LAWWW 已接（本機），socsci_place 的改法 LAWWW 同意。
      - PUTONG101 v2D 380ceac62：v2C 變暗的原因是 THREE.Color(hex) 轉成線性，東南角是東立面一樓。待整合，等 CC 重拍。
      - X246 紅磚人行道磚紋（XS-BRICK-WALK-1110）：已交，見 outbox。
      - BB_255 日常失速：被拿掉的窗座標已回給 BB。
    - **佇列更正**（LAWWW 13:28）：
      - X283、X285、X294、SIS-STATIONERY 早就交了、也驗收了，不要重做。
      - LM-SEAM-GEO 結案（不修）；INTERIOR-AAA 維持等待；社科院、總圖 PERF 不做（BB_255 的數字）。
      - 下一步問 LAWWW。
    - 以下是 13:0x 寫的（已完成）：**套件五棟**，在 worktree `wt_kit` 做，底是 8d8b475dc＋③-4。
      - 電機二館：紅磚拱窗；
      - 土木：平屋頂、4 層、玻璃樓梯塔；
      - 圖資：白色、頂層拱窗；
      - 農綜：紅磚、5 層；
      - 國青：11 層、米色、深褐凸窗、灰屋頂。
      - campuskit3d.js 加 topArch、stairTower、bays、roofCol 四個參數；socsci_place_unit 的電機二館那一行要跟著改。
      - 新測試 ntu_ref_kit5_unit.js：底 FAILED 5，改完 ALL PASS。回歸 199 支在跑。
  - **12:0x～12:3x 進度**（帳號 A）：
    - 已交：
      - SNS-VIEW-COVER a15058787：SUNNY SIDE、日常失速的照片窗景被備用的卡通窗擋住。LAWWW 已接。
      - ART-SOP c8f5200ba：已接，結案。
      - PERF-CAMPUS-GLB ② 384686fd3：行政大樓、文學院、校史館 11 → 5 網格，draw call 47 → 18、三角形 37k → 64k。LAWWW 接受，等 CC 量幀率。
      - PUTONG101 v2C 8ff6e7d4a：skyBox 延到東南角，shader 改成混到 [110,120,130]。
    - 結案、維持：
      - 小路窗景維持視差窗（BB 定案）。
      - CROWD-DEPTS-LOOK 延後（LAWWW）。
      - XS-WINCARD 第二批 ART_APPROVED（BB_255）。
    - 接下來：
      - P3 小件：INTERIOR-AAA（大步、總圖書庫）、LM-SEAM-GEO（萬才館倒角）。
      - 社科院、總圖等 PERF：等 CC 量的幀率。
  - **11:3x～12:0x 進度**（帳號 A）：
    - 已交（待整合或已接）：
      - XS-WINCARD 第二批 b8d833642：LAWWW 已接。
      - GYM-FIT-PROPS 第二包 ff443d9da：飛輪曲柄、划船座椅會動。LAWWW 已接。
      - PUTONG101 v2B ba050767a：ck_glass shader、skyBox。LAWWW 已接；要 CC 看主控台、重拍 putong_north。
      - XS-TONGXIAN-VIEW dd079901c：同弦夜景。
    - 取消或維持：
      - GG-LETTERS-BACK：BB 撤回，只留 wip。
      - 青木窗景：維持。BB 把對面椰子間距記成 P3 給 LAWWW。
      - 日常失速：維持。溫州街側牆細節列 P3。
    - 接下來：SUNNY SIDE 窗景（P3）→ ART-GYM-POOL-SWIMMERS（卡住：要 VRM 外掛）→ CROWD-DEPTS-LOOK → PERF-CAMPUS-GLB → 其餘佇列。
  - **10:5x 進度**：
    - GYM-FIT-PROPS-1103 第一包（手上的道具）：交付 86751d821，LAWWW 本機整合。
    - **ART-GYM-POOL-SWIMMERS-1103 卡住**：泳裝人物要用正式人物生產線（tools/blender/char_second/npc.py＋tools/blender/char/common.py），
      需要 Blender 的 VRM 外掛（github saturday06/VRM-Addon-for-Blender）和 VRoid CC0 樣本（tools/fetch_vroid_src.sh）。這個容器沒有，安裝時被自動權限擋下；要使用者同意或換有環境的工作階段。
    - **GYM-FIT-PROPS 第二包的做法**（還沒動手）：
      - 器材（gym_b1_props.glb）在 bake_gym.sh b1 裡是 --nolm（不烘），所以可以不重烘：
        直接改 gym_b1.glb 裡 GYM_BIKE 的曲柄、踏板，以及 GYM_ROWER 的座椅、滑車三角形（GPU instancing 的原型網格），拿掉；
        另外做一顆會動零件的 GLB（形狀照 gym_b1_props.py 的 bike()、rower()）。
      - gym3d.js 照 layout 的 equipment 每台都放會動零件：沒人用的停在原本的角度；有人用的照 gymIK 的 g.ph 轉曲柄、照臀部 z 滑座椅。
      - 人的原點＝器材原點。
  - X307 第 3 版候選（BB 11-10 09:25 參考意見，D141，P3，不擋 ART）：使用者的平面圖 1110_library_b1_plan_ref.webp 上，真的中庭是三面有柱子的迴廊、中間綠地、西側書店、西南角兩段樓梯；
    遊戲現在是北邊一段樓梯＋花崗石地面＋兩個樹槽。要做的話：lib_b1_court.py 加迴廊、草地，連 zones3d.js B1C 的導航和碰撞 patch。等 BB 判完 r3 或使用者決定。
    - 重拍有兩條路：用 Blender（afar／gg_shop_views.sh 的做法），或請 CC 用瀏覽器重拍（D131）。

## 🔁 交班（2026-11-10 01:4x UTC；帳號 B LAWWW2-B；使用者：「現在交班」）

**交班紀錄不代表新帳號已經接班。** 分支 `claude/funny-albattani-iawshm`，最後一筆 commit 見 `git log -1 origin/claude/funny-albattani-iawshm`（就是寫這一段的那一筆）。開發分支基準 `a883f36de`。

### A. 這一班已交、已整合（等 CC 拍、BB-B 判）
- **CAM-VIEWPANE-SIDE-1109**：已驗收（BB-B D120 PASS）。
- **CAM-TEAYARD-1109 第二輪**：已整合 4f888cf3c，等 CC 拍 150°／180°／210°。
- **#204 第三批**：已整合 faf1b75a4，等 CC 拍。

### B. 交班時進行中（都已存在遠端）
1. **CAMPUS-FLOOR-STRIP-1110**（使用者試玩回報，LAWWW-B 01:08 派，排在文具區前面）：
   - 狀態 `READY_FOR_REVIEW`。補丁和測試都完成，**還沒正式交給 LAWWW-B**（只在 ACK 裡說了在做）。
   - 檔案：`wip/campus_curb_gap_1110/`。
   - 原因：`curb()` 不在路口斷開，7 段約 56 m 的路緣橫在別條步道上。
   - 新測試：開發分支 FAILED 2 → 加補丁 ALL PASS。回歸 38 支 ALL PASS。
   - 遊戲內等 CC 用使用者存檔拍。
2. **AVENUE-FAR-SIGNS-1110**（同一則派工）：**只查了、還沒改**。
   - 來源：`tools/blender/env_second/gg_textures.py` 的 `BILLBOARDS`（8 張大看板）。
     - 8 張是：明日文理補習班、晴川美語、晨光牙醫、明澈眼科、學府套房、公職補習、動能健身、遠帆留學。
     - `gg_backdrop.py` 每棟樓用 `rr.randrange(8)` 隨便挑，校門外剛好挑到好幾張粉紅的「明日文理」。
   - 驗證：在開發分支重跑 `gg_backdrop.py`，產出的 `campus_gongguan_bd.glb` 和現有的 sha 完全相同（7f358630646e4bc3），可以放心改了重匯。
   - 下一步：
     - 把 `BILLBOARDS` 換成銀行、餐廳、書店、藥局、手機行、眼鏡、牙醫、美語（最多留一家），店名原創、不諧音（D77）。
     - 挑看板改成相鄰的樓不重複。挑的時候照舊呼叫一次 `rr.randrange(8)`，這樣其他亂數不變，樓的長相不會跟著變。
     - 重匯兩顆：`campus_gongguan_bd.glb`，以及 `--zone gongguan` 的 `gongguan_far.glb`。
     - `LIGHTBOX` 的「補習」也可以換掉。
     - 附 Node 測試，例如檢查貼圖的看板文字裡沒有補習班。BB 判。
3. **SIS-STATIONERY-1110**：
   - 狀態 `WORK_IN_PROGRESS`。判斷「現在的不夠」，新版做到第二輪。
   - 腳本：7bbb957fb。說明與預覽圖：`wip/sis_stationery_1110/`。
   - v2 三張預覽還沒看；`shanlan_unit` 等測試還沒跑；還沒交件。
   - 這件排在上面兩件後面。

### C. 沒有遠端備份的
- 合併後的 `shanlan.glb` 新版：用 README 的三行指令重產，不存 repo。
- `scratchpad/wt_d` 裡的工作目錄改動，已經做成補丁存進 wip。其他沒有。

### D. 下一班第一步
1. 接班程序照 `docs/AI_SESSION_HANDOFF.md` 第 4 節。
2. 把 `wip/campus_curb_gap_1110/` 交給 LAWWW-B：補丁 `git apply --check` 對當時的開發分支；新增 outbox 一筆。
3. 做 AVENUE-FAR-SIGNS-1110（見 B-2）。
4. 回到 SIS-STATIONERY-1110。

## ✅ 值班登記（2026-11-09 16:1x UTC；帳號 B LAWWW2-B；使用者：「現在接班」）

- 工作階段 `session_01GV1WG3UeT2DhuDpxeWJsvD`，分支 `claude/funny-albattani-iawshm`。接班基準 `07725e9fc`，就是上一班（我自己，11-08 20:50 UTC 正常交班）最後 push 的那一筆。
- 離開期間，開發分支 `claude/modest-rubin-2lyp7g` 多了 9 個 commit（到 `6c6bfd421`），全部是換班紀錄。沒有新的派工、使用者決策、規則。main 還是 v9.10.23。
- 對帳：
  - `duty find` → RULE_SOURCE 開發分支（seq 110）。
  - `duty verify` 結束碼 1，LAWWW2 的兩項：「職位標成已交班」，這次 register 以後就消失；「e16f828b 之後多 1 個 commit」是交班快照那一筆，預期中。其他異常屬 LAWWW-B：AA／BB／CC 還是已交班；LAWWW 帳號 C、BB 帳號 A 的舊分支在交班後還有 commit。
  - `check` 結束碼 1（29 項，HANDOFF_GAP_MATRIX 提到、tasks.json 沒登記，屬 LAWWW-B）。
  - `roles` OK（LAWWW2 158 行待辦都在總表）。
- `duty register` 已寫 `duty_LAWWW2.json`（state on，sinceSha 07725e9f），等 LAWWW-B `duty sync`。
- 接著做：照下面「交班」那一節的 E（下一班第一步），問 LAWWW-B 有沒有新的派工。沒有就做 P3：Cycles 把 MASK 鏤空當實心的根本原因、#196 溫州街四間＋阿德 --skytint。
- **16:4x 進度**：
  - LAWWW-B 16:17 duty sync（a57112161，五職位都 on），派 PERF-XS-NPC-1108。
  - PERF-XS-NPC-1108 **已交件**（682859723，`wip/perf_xs_npc_throttle_1109/`）：
    - engine3d.js 坐著、畫面外、離你 3 m 以上的 NPC 每 4 幀更新一次；
    - 開發原樣 FAILED 5 → ALL PASS；引擎相關 310 支 Node 全過；
    - 等 LAWWW-B 整合，再請 CC-B 跑 `seat_off_probe.js`。
  - P3 MASK 查完（`wip/mask_bake_rootcause_1109/`）：Cycles 沒問題，紀錄寫錯了，已更正。
    - 好拍右牆洞洞板貼圖本來就不透空，而且面朝向反了，遊戲裡看不到；11-08 重烘對玩家畫面是對的（BB-B 16:40 確認）。
    - 洞洞板、左牆卡片、電視要不要翻正：問 BB-B。
  - CC-B 排了大口 1F CPU trace（CPUTRACE_8172_dakou／haopai），等路徑。
  - 16:5x：BB-B 選好拍 (b)（洞洞板翻正＋烘光照＋不藏鏤空）＋電視、左牆卡片一起查＋離線掃描。
    - 掃描完成：16 個 GLB 只有好拍兩處（`wip/backface_scan_1109`）；電視沒問題（朝店門）。
    - 好拍 (b) 的輸入檔：原檔 9a2a40d9 翻正＋hp_peg 材質＋拆貼圖、×2.5。在 scratchpad `haopai_b/haopai_b.glb`，可以用工具重做。
    - 背景：`chain_1109.sh` 等 #196 第一批烘完，就烘好拍到 `haopai_b/out`（BAKE_CACHE `haopai_b/cache`）。
  - #196：
    - 第一批（SUNNY SIDE、小路、木曜日）16:41 開始烘，輸出 `wz196/out`，改前數字 `wz196/before.txt`；
    - 第二批（日常失速、阿德）好拍之後跑：`bash wz196/run.sh aa_offbeat:daily_offbeat bb_ade:ade`；
    - 原檔 blob：sunnyside ee1aee00、komichi d000b6ce、mokuyobi 24e2df31、daily_offbeat 6dcba992、ade 49e0de80。
  - CC-B：SEATOFF_88c8、大口／好拍 CPU trace 都排在 PC，等結果。
- **17:5x 進度**：
  - PERF-XS-NPC-1108：seatOff 已整合（88c83d1be）。CPU trace 分析之後，LAWWW-B 排的順序是 (D) 卡頓 → (C) program 切換 → (A) sitFeet；(B) 彈簧骨半速不做。
    - (A) sitFeet 只更新兩條腿：已交 ee34acf82，LAWWW-B 已整合（abfa888cf）；等 CC 跑 SITFEET_PERFAB。
    - (D)／(C)：等 CC-B 跑 `render_probe_dc.js`（RPROBE_DC），有結果再寫 patch。
  - #196 第一批（SUNNY SIDE、小路、木曜日）已 commit（1643618c0）；第二批（日常失速、阿德）17:42 開始烘（背景，輸出 `wz196/out`）。
  - **BACKFACE-HAOPAI-1109 已交件 `fd585f991`**（`wip/backface_haopai_1109/`）：
    - 洞洞板翻正、改用 hp_peg（OPAQUE）、有自己的貼圖（×3.0）、重烘光照；左牆鐵網格翻 118 面；
    - xs9 檢查 patch：開發分支資產 FAILED 2 → 新資產 ALL PASS；好拍、新生南路相關 13 支全過；
    - 等 LAWWW-B 整合、CC 用 XS_FIX_1032 同角度重拍、BB-B 判 D120。
- **18:3x 進度**：
  - BACKFACE-HAOPAI：LAWWW-B 已整合（a7c26e0eb）；BB-B 已派 CC 重拍，D120 待判。
  - PERF-XS-NPC-1108 (D) 新人物第一次出現的卡頓：交件 585c765ae，LAWWW-B 已整合（7824d9598）。
    - 原因：three.js 排序時不管 frustumCulled，boundingSphere 是 null 就逐頂點套骨頭算。
    - 做法：不透明的蓋皮網格建好就給靜止包圍球，透明臉部網格不動。
    - 結果：第一次畫 618 → 23.8 ms；104 支 Node 全過。
    - CC-B 已排 RPROBE_DC_7824_dakou1f、CPUTRACE_7824_dakou（＋_off 對照）。
  - #196 五間 --skytint 重烘：交件 aad8d3839（63 支 Node 全過），等 LAWWW-B ACK、CC 拍、BB-B 判。
  - 等 CC：RPROBE_DC_fefd（(C) 要的 program 原因）、SITFEET_PERFAB、上面兩個 7824 量測。
  - 再下一步（P3）：#201 PERF-WZ-DAY、#204 美國公寓門板／lm_fill。
- **20:4x 進度**：
  - BACKFACE-HAOPAI、#196 五間、#204 美國公寓門板都已 ART_APPROVED（BB-B）。
  - PERF-XS-NPC-1108：
    - (D) CC 實測：大口 1F 包圍球 238.4 ms／69 次 → 10.0 ms／20 次。剩一次 117 ms 卡頓是等 GPU（idle 84.5 ms），不是包圍球。
    - (A) CC `SITFEET_abfa`：坐著多的地方動畫 −11～−23%、fps +2.6～5.2（兩輪差很多，只當方向）。
    - **(C) 牆一次畫完：交件 `9e79b8750`，LAWWW-B 20:40 ACK、整合中**。原因是 three.js 對 transparent＋雙面材質畫兩次並 needsUpdate；淡出的牆都是這樣（66／84 顆 GLB）。patch：assets3d 記 op0、engine3d hideFaded 設 forceSinglePass。Node 開發 FAILED 4 → ALL PASS、回歸 78／0。
  - #204 外牆腳：四間補光照交件 `7e11170d7`（回歸 101／0），等 ACK；`lm_fill_covered.py` 改分批 `625ba04c3`（結果一樣，山嵐 11.8 GB → 381 MB）；12 間量測跑中（`$S/oom12/`），超過 1% 的再跑淡出露出檢查。
  - **教訓**：`ulimit -v 9000000` 只能給 Python。Node 在這個限制下 WebAssembly（undici fetch）配不到記憶體，會出假失敗（這一班第一次回歸因此重跑）。
  - 等：LAWWW-B 整合 (C)、#204 四間 ACK；CC 的 (C) render_probe_dc、WZDAY trace（#201）、美國公寓衛浴門板補拍。
- **21:2x 進度**：(C) 已整合 6bbfca043、#204 四間已整合 a5ec91a36（BB-B 派 CC）；12 間盤點報告 a81a8c837 已送，建議做轉角唱片（0.94），等 LAWWW-B 選；轉角唱片先在 scratch 試補（`corner_fill/`，沒進資產）。
  - **outbox 規則（LAWWW-B 21:18）**：`state` 只能是 WIP／已交付／已整合／已測試／已驗收 五個值之一；ART_APPROVED 寫「已驗收」，整合 SHA、CC／BB-B 說明都寫在 `note`。
- **23:3x 進度**：
  - 已整合：#204 第二批（1827999fb）、CAM-TEAYARD-1109（b6685c824）。
  - **CAM-VIEWPANE-SIDE-1109 交件 `80abb49e1`**（`wip/cam_viewpane_side_1109/`）：
    - 放大的窗景卡在鏡頭跑到店面左右範圍外時藏起來。
    - 影響三間：阿德、林家、慢輪。
    - `viewpane_side_unit` 開發 2d58e8a52 FAILED 5 → ALL PASS；回歸 76／0。
    - 等 LAWWW-B 整合、CC 拍、BB-B 判。
  - (C) 牆一次畫完：CC-B 在 PC 量的結果是效能持平，畫面 0 差異。
  - **#213 地板暗帶（BB-B 23:22，P3）**：
    - 轉角唱片、阿德靠牆那條暗的地板，是落地櫃（WALL_ 的唱片櫃、木櫃，和牆一起淡出）底下的地板，光照貼圖幾乎是 0；阿德的木櫃前面另外還有一條烘進去的影子（約 0.55 倍）。
    - `lm_fill_covered.py` 沒抓到，因為櫃子沒有底面：往上打的線先碰到層板，而且離地超過 2 cm。
    - 等 CC 的「WALL_ 全藏」診斷，結果出來前不改東西。量測腳本在 scratch `band/profile.py`。
  - 等：CC 拍茶屋 180°／270°、窗景卡、#204 PC GPU 亮度；(C) render_probe_dc 已有結果（持平）。
- **23:5x 進度**：
  - 窗景卡 ART：BB-B D120 PASS（已驗收）。CAM-TEAYARD 第二輪（屋簷藏起來）已整合 4f888cf3c。
  - **教訓**：室內區域的預設俯角是 0.38（`engine3d.js`：`cam.pitch=E.indoor?0.38:0.22`），Node 鏡頭測試要用它，不要用 0.22。
  - **#213（#204 第三批）**：
    - `lm_fill_covered` 加了規則 (c)：地板在落地的 WALL_ 底下也算被蓋住。13 間＋一盞重掃，要補的只有阿德、轉角唱片、一盞。
    - **第一批茶屋補錯檔**：遊戲用的是 `aa_support/yizhan.glb`，不是 `second_ai/wz_teahouse_interior`，已回報 BB-B。
    - 大口的 `WALL_BANDS` 在遊戲裡被改名成 `DK_BANDS`，不會淡出。
    - 測試加分群檢查（整間平均會稀釋黑塊）。WIP 在 cc372d5fa，`wip/wall_base_fill3_1109/`。
    - 轉角唱片的掃描和「改前」測試在背景跑：scratch 的 `scan204/`。
  - 待查（P3）：BB-B 說慢輪左牆外 270°（−3.9, −0.4）畫面左半邊一大塊暗色，新舊一樣。
    - 已查到原因：那是隔間牆 `bk_partition_wall` 朝左（法線 −x、x −0.27、z −4.1～−5.9，店的後段）的那一面。光照貼圖 `bike_lm_day.webp` 在這些點是 0，整張的中位數是 90。
    - 推測後段被包起來的小房間烘焙時沒有光源。左牆淡出以後，從外面就看得到這個全黑的面。
    - 改法（之後排）：後段補一盞燈重烘，或用 lm_fill／設最低亮度。探針在 scratch `scan204/bike_probe.js`。
- **00:5x 進度**：
  - #204 第三批交件 134c01b93，已整合 faf1b75a4：
    - 補了轉角唱片、阿德、一盞 yizhan；
    - 工具加規則 (c)，測試加分群檢查；
    - check 開發 FAILED 10 → ALL PASS，回歸 109／0。
  - 等：CC 照 README 站位拍新舊對照，BB-B 判。
  - 慢輪暗塊、其他有落地 WALL_ 櫃子的店：LAWWW-B 記 P3，等 BB 判完再排。

## 🔁 交班（2026-11-08 20:5x UTC；帳號 B LAWWW2-B；使用者：「現在交班」）

分支 `claude/funny-albattani-iawshm`，交班前最後一筆 `191df62aa`（已 push、遠端核對）；開發 `claude/modest-rubin-2lyp7g` 交班時 `de622db20`。
沒有在跑的烘焙、測試；工作樹乾淨。沒有只在本機、沒推上去的成果（scratch 的 `wt_b1` 只是開發分支的乾淨工作樹，可以刪）。

### A. 這一班完成、已整合（全部 BB-B ART_APPROVED，PC GPU）
- 新生南路九間光照：好拍重烘（鏤空洞洞板 HIDE alpha，開發 `ca47949cf`）、山嵐柱子壓暗（`lm_scale_faces.py`）。
- 總圖 B1 重烘（開發 `9f4973bfe`，討論室、影印中心、南走廊）。P3：會議廳是關著的房間，天花板暗，開放時再正式烘（`lm_scale_faces.py --clip` 可以只補那片）。
- 烘焙工具（都已整合）：
  - 隔間牆兩面都烘（`4429bc93d`）；
  - `--emit` 設回原本強度（`9c94d128a`）；
  - 續烘 BAKE_CACHE／BAKE_STOP_AFTER（`aa46cdb7f`）＋回歸接受結束碼 139（`9c4f74d84`）。
- 使用者 13:4x 問能不能發布 → 已轉 LAWWW-B。候選 `9eef2b95b` 含這班全部成果；線上已是 v9.10.23。

### B. 進行中（交給下一班）
- **PERF1108 山嵐、大口效能（P3，不擋）**：結論已交 LAWWW-B（`191df62aa`，`wip/perf_xs_1108/README.md`）。
  - 主因是 NPC：三個慢點拿掉 NPC 都回到 57～58。找路、一樓、填像素都排除。
  - 改法屬人物系統（NPC 上限、坐著的替身、降頻更新），等 LAWWW-B 決定。要 patch 的話由 LAWWW2 寫。
  - 待：CC-B 錄大口 1F 的 CPU 效能紀錄（100～120 ms 小卡頓，那一幀畫面只花 7～11 ms，沒有計數改變），看是哪個函式或 GC。
  - 待：NPC 改完以後，重量山嵐關 PointLight 那一項。
- 對照腳本 `perf_ab_probe.js`（第 2 版）、`path_bench.js` 都在那個資料夾，可以重用。

### C. 沒做（P3／低優先，照舊）
- Cycles 烘焙把 MASK 鏤空當實心（葉片卡影子是整片卡片形）：根本原因沒查到。這幾間 BB-B 已 ART_APPROVED。
- 美國公寓浴室兩片門板拆節點；約 40 間外牆腳黑線可跑 lm_fill_covered（等決定）。
- #196 溫州街四間＋阿德 --skytint 重烘；#201 PERF-WZ-DAY。

### D. 教訓
- **執行中的 .sh 不能原地改**（11-08 13:17 改 bake_xs.sh 時好拍正在烘，bash 讀錯位又重跑一次）。一律寫 .new 再 mv。
- 雲端背景工作上限 2 小時：大房間 512 用續烘分兩段跑；跑的時候不要同時開別的重工作。

### E. 下一班第一步
1. fetch，讀 `docs/AI_SESSION_HANDOFF.md`、這份最上面、`docs/DUAL_AI_BOARD.md`、交接板。
2. 問 LAWWW 的：PERF1108 NPC 改法要不要 LAWWW2 寫 patch；發布結果。
3. 看 CC-B 有沒有交大口 1F 的 CPU 效能紀錄；有就分析。

## 🔨 （舊）現在在做（11-08 13:5x UTC，帳號 B LAWWW2-B；使用者 13:4x 問能不能發布 → 已轉 LAWWW-B，等他回覆使用者）

分支 `claude/funny-albattani-iawshm` 最新 `bc9b27053`；開發 `claude/modest-rubin-2lyp7g` 最新 `8554b8ea9`。瀏覽器都沒跑（D131）。測試工作樹 `$S/wt_b1`（開發最新，乾淨）。

| 項目 | 狀態 | 位置 |
|---|---|---|
| 隔間牆兩面都烘 patch | **已整合**（開發 `4429bc93d`） | `wip/bake_room_partition_1108/` |
| **總圖 B1 重烘**（#218） | **ART_APPROVED 結案**（BB-B 13:52，PC GPU；開發 `9f4973bfe`）。P3：會議廳是關著的房間（這一版不進去），天花板沒燈很暗，玩家看不到；開放時再照開燈的樣子正式烘（`lm_scale_faces.py --clip` 也可以只補那片，`e645e8064`） | `wip/library_b1_lm_1108/` |
| bake_room 續烘（BAKE_CACHE／BAKE_STOP_AFTER） | **已整合**（`c29fd2654`→開發 `aa46cdb7f`）；LAWWW-B 那台 Blender 結束時 segfault 139 → 回歸改成接受 139 但輸出／cache 要對（`bc9b27053`，patch 已交、P3） | `wip/bake_room_resume_1108/` |
| **新生南路 XS9**（BB-B） | **九間全部 ART_APPROVED**（BB-B 13:43 PC GPU；好拍 `ca47949cf`、山嵐柱子 P3 結案）。原本：8 間 **ART_APPROVED**（大口 1F／2F、大步、同弦、新生運動、南洋大廳、1 廳、山嵐）。**好拍**重烘（HIDE 加 alpha：鏤空洞洞板 Cycles 當實心）＋**山嵐柱子**朝街那一面壓暗（新工具 lm_scale_faces.py）**已交 LAWWW-B（`1032e6097`）**，等整合、CC 拍、BB-B 判 | `wip/xs9_fix_1108/` |
| 教訓（11-08 13:17） | **執行中的 .sh 不能原地改**：我覆寫 bake_xs.sh 時好拍正在烘，bash 讀錯位又重跑了一次 bake_room（PID 停掉、手動補 glb_fix_instnames 和烘焙紀錄，輸出核對過）。一律寫 .new 再 mv | — |
| P3 查完（11-09） | ~~Cycles 烘焙把 MASK 鏤空當實心~~：Cycles 沒問題（最小場景透光比＝貼圖透空比）。好拍右牆洞洞板貼圖本來就不透空，而且面朝向反了、遊戲裡看不到（掛勾浮在牆上＝BB-B P3 的暗色斜線），11-08 藏起來重烘是對的；葉片卡真的有透空。翻不翻正洞洞板（左牆卡片、電視也反）等 BB-B 判（wip/mask_bake_rootcause_1109） | BB-B 判 |
| P3 | 美國公寓浴室兩片門板拆節點；約 40 間外牆腳黑線可跑 lm_fill_covered（等決定）；#196、#201 | — |

## 🔨 （舊）現在在做（11-08 11:5x UTC，帳號 B LAWWW2-B）

分支 `claude/funny-albattani-iawshm` 最新 `f67eb9963`；開發分支 `claude/modest-rubin-2lyp7g` 最新 `54d2f43d3`（LAWWW-B 已整合 --emit 修正 `9c94d128a`）。瀏覽器都沒跑（D131）。

| 項目 | 狀態 | 位置 |
|---|---|---|
| **隔間牆兩面都烘 patch**（LAWWW-B 11:34 要） | **已交 LAWWW-B（`f67eb9963`，DELIVERED 等 ACK）**：eb857ec65 三行對開發 `54d2f43d3` apply --check 過；B1 原檔 --uvonly：開發 292.1 m² 被壓成一點 → 0 | `wip/bake_room_partition_1108/` |
| **總圖 B1 重烘**（任務 #205） | 512 單次跑兩次都被背景工作兩小時上限停掉（白天好、晚上沒跑完）。`bake_room.py` 加續烘（`BAKE_CACHE`＝資料夾、`BAKE_STOP_AFTER=day`；雜湊＝輸入檔＋參數＋光照 UV；試過兩次跑雜湊一樣）。**11:40 起第一段（白天）**：`BAKE_CACHE=$S/b1_cache BAKE_STOP_AFTER=day bash tools/blender/env_second/lightbake/bake_library_b1.sh 512 $S/b1_v2`（正常結束碼 3）；**第二段**同一個指令拿掉 BAKE_STOP_AFTER（白天從 cache 讀、只烘晚上）。之後：glb_partition_at.py → lm_fill_covered.py → b1_region_stats.py → Node 測試 → README（sha256）→ 交 LAWWW-B，副本 BB-B（CC 拍 copy_door、disc1_wall、disc2_wall、studyA、上方大廳） | `$S/b1_v2/`、`$S/b1_cache/` |
| 續烘功能要不要交開發 | 還沒交；B1 交件時一起問 LAWWW-B | `bake_room.py` |
| P3 | 美國公寓浴室兩片門板拆節點；其他約 40 間外牆腳黑線可跑 lm_fill_covered（等決定）；#196、#201 | — |

## 🔨 （舊）現在在做（11-08 07:3x UTC，帳號 B LAWWW2-B）

分支 `claude/funny-albattani-iawshm`（09:3x 最新 `5c7b93d1a`）；`b517adf62` 那一個 commit 也帶了 lm_fill_covered 拿掉 scipy（輸出逐位元組一樣），訊息沒寫到；早一點的 `51aa51b20`（另有 `e2cf1f39c` 新生南路第二條鏈存檔）；開發分支 `claude/modest-rubin-2lyp7g` 最新 `d9646a770`。
工作樹只留 `$S/wt_dev2`（開發 `d9646a770`＋這一包的 16 個檔、兩支新測試）；舊的 `$S/wt_dev` 07:0x 刪了（裡面的測試都在 docs wip）。

| 項目 | 狀態 | 位置 |
|---|---|---|
| **LM-REVEAL-1108**（BB-B 06:25 LM3_cloud：5F 研究室左牆斜帶＋兩批隔間牆都掃） | **已交 LAWWW-B（`5c4db6b53`／README `51aa51b20`，P1 等 ACK），已告訴 BB-B**。①開著的門板跟它貼著的牆淡出（`glb_partition_at.py` 規則 B：5F 門板＋門把、美國兩間大門；只改 extras）②被牆蓋住的格子補色（`lm_fill_covered.py`：六間 13 張光照貼圖）③檢查工具 `lm_fade_reveal_check.py`。partition_fade ③ FAILED 4→ALL PASS；lm_covered_fill_check FAILED 12→ALL PASS；相關 89 支過 | `wip/lm_reveal_1108/` |
| 隔間牆零件跟主牆一起淡出（0c49eb7a7） | **LAWWW-B 已整合 `7206a12de`**；BB-B 06:35 B1 studyA_back 雲端 PASS | `wip/partition_fade_1108/` |
| BB-B 06:43 PC GPU 判 | **ART_APPROVED（光照）**：總圖 5F 書庫、公館四間、研究小間、體育館 B1、美國公寓、合租戶。B1、5F 等新 SHA | — |
| 機車台數（BB-B 06:46） | **已回**：台數本來就不固定（停車格 15% 空、共用亂數），Node 實測 27～35；建議 CC 門檻 24～35、款 ≥7、色 ≥15；28 台算 PASS | — |
| **新生南路 9 個模型 512**（任務 #200） | 8 間烘好、和開發原檔一致（`bcd3c5d05`／`e2cf1f39c`／`b1ef8b606`／`0d0b05d8f`）。**山嵐**：`51cbfaacd` 是拿我分支上較舊的 v5 烘的（開發 11-05 已換 AA-C v5.1 `4977d6c72`），`5c7b93d1a` 換回 v5.1 原檔、09:00 起重烘（`b5nr3yenf`）。工作樹 `$S/wt_xs`＝開發 `51d7f0ff6`＋xs_lm_1108.patch＋九間的檔：xs_lm_unit 開發原樣 FAILED 15 → ALL PASS。剩：山嵐 v5.1 換進去、39 支相關測試、README 再交 | `wip/xs_lm_1108/` |
| **總圖 B1 重烘**（BB-B 07:14 GPU：影印中心、討論室那一帶比 4.1 版暗三成多、燈板旁天花板深灰；不標 ART_APPROVED） | 設定 `b517adf62`（討論室日光燈 ×3＋每間 4 顆 3 W 分散補光、南走廊／影印中心 ×2／×2.5、會議廳 4 顆 3 W）；試烘 64 取樣：討論室天花板／地板／牆 0.12／0.29／0.29 → 0.43／0.47／0.49。**512 正式第一次 07:36 起、和另外兩個烘焙搶 CPU，09:36 到背景 2 小時上限被停（白天那張烘完、晚上沒完）；09:37 重開（`bjsxihe90`，輸出 `$S/b1_v2`）**。烘好要：glb_partition_at（at）＋lm_fill_covered、量亮度、檢查工具，再交 | `bake_library_b1.sh` |
| 慢輪晚上門外亮白長方形（BB-B 06:43 P3） | **已交 LAWWW-B（`5a9ae8d8e`）**：只換 bikeshop_night.webp（地面最下面 159→90） | `wip/bikeshop_night_1108/` |
| 機車台數門檻（BB-B 07:13 WZINTEG PASS） | tests/wz_street_integration.py patch（24～35、款 ≥7、色 ≥15）`c6fcd05ab`，下次交件一起附 | `wip/scooter_count_1108/` |
| P3（任務 #204） | 美國公寓浴室兩片門板拆節點；其他約 40 間外牆腳黑線可跑 lm_fill_covered（等決定） | — |
| P3 會議廳暗補光 | B1 下次重烘時，排在新生南路後面 | — |

## 🔨 （舊）現在在做（11-08 05:1x UTC，帳號 B LAWWW2-B）

分支 `claude/funny-albattani-iawshm` 最新 `c2e6f4633`；開發分支 `claude/modest-rubin-2lyp7g` 最新 `f7c6380d7`（LAWWW-B 02:08 `bba757532` 把總圖 B1、研究小間退回原檔，等重烘）。瀏覽器都沒跑（D131，交 CC）。
工作樹只留 `$S/wt_dev`（05:0x 照 LAWWW-B 建議重建在開發最新 `838db8710`＋xs_lm_1108.patch＋兩支新測試）；`$S/devnow` 02:3x 刪了（磁碟剩 2 GB；文字改動先存 `$S/devnow_text_changes_1108.patch`），現在剩 4.5 GB。

| 項目 | 狀態 | 位置 |
|---|---|---|
| **LM-PARTITION-1108** | **兩批都整合了**：第一批 B1、研究小間 `14ef1ff10`→開發 `3fb01c8d6`；第二批 5F、體育館 B1、美國公寓、合租戶 `63b636735`→開發 `c435933a6`（132 支過）。背面「整片一個值」98→1%、75→1%、34→0%、44→22%（合租戶剩關著的房間）。等 CC 拍、BB-B 判 | `wip/lm_partition_1108/` |
| BB-B PC GPU 第 1 點：library_media 洞洞板 | **已整合**（`ce18ef1f4`→開發 `23c5d852a`，74 支過）；等 CC 補 hideFaded 重拍 AB3LM media | `wip/media_peg_1108/` |
| **光照第二級最後一組：新生南路 8 區**（任務 #200） | 腳本、patch、測試 `b1fc8fca8`／`279603b1c`；冒煙測試 ALL PASS。**512 正式烘焙 05:03 起分三條鏈**（`$S/chain3.sh`，紀錄 `$S/xs_final/`）：①大口 1F／2F、南洋大廳、南洋 1 廳 → ②好拍、同弦、新生運動 → ③大步、山嵐；每條 < 2 小時。烘完：亮度、`xs_lm_unit`（工作樹＝開發最新）、glbdiff、README（檔案清單＋sha256）→ 交 LAWWW-B | `wip/xs_lm_1108/` |
| P3 PERF-WZ-DAY-1108 | CC-B 量過不是陰影；下一個懷疑白天 NPC 多；排在美術後面 | `wip/perf_wz_day_1108/` |
| **BB-B 00:04 溫州街六間光照判定（WZ6_LM_cloud；cc-testing 9c115cd9d9）**：功能 PASS；畫面三點 | ③ 晚上 lightMap 欄位是 *_lm_day＝**刻意**（晚上那張在 shader 的 lmNight，lmMixAt 混合）；② 日常失速窗景洗白＝**不是烘焙**（窗景卡、玻璃材質原檔＝烘好的；截圖窗區平均差 3.4／255；「霧面」是窗景照片裡對面的素面水泥牆）；① **一盞店門口木地板灰藍＝光照貼圖**（白天店門口藍／紅 1.34～1.39，其他四間 1.09～1.20：緣側整片開口、沒有太陽、只吃藍天光）→ bake_room.py 加 `--skytint`（只乘白天天光，燈不動；沒給＝原樣），一盞試烘中，之後 512 重烘交 LAWWW-B、請 CC 重拍 14:00 door／clerk。已回 BB-B 兩則（DELIVERED） | bake_room.py（未 commit，等試烘）；bake_gg_new.sh 的修改備好在 `$S/bake_gg_new.next.sh`（一盞用原檔 blob 33ba0087＋SKYTINT；已烘過的檔當輸入會擋下來）——**公館四間跑完才換上** |
| 光照第二級②：研究小間 | **512 正式版 push** `be46b8878`：0.35／0.30、library_lm2_unit 研究小間全過 | — |
| 光照第二級②：5F 書庫 | **512 正式版 push** `60c63348f`：0.41／0.37、library_lm2_unit 三間 ALL PASS（工作樹 eacc5837d） | — |
| **光照第二級 lib_lm2_1107（總圖 3＋公館 4）** | **已交 LAWWW-B（c30131f5c，P1 等 ACK）**：B1 0.38／0.38、研究小間 0.35／0.30、書庫 0.41／0.37、afar 0.35／0.31、青木 0.35／0.32、Daybreak 0.36／0.32、單車 0.33／0.31（公館套天光色調）；測試 patch 對開發 df95b5042（FAILED 3／4→ALL PASS；67 支全過）；**B1 是使用者 ART_APPROVED 4.1 版，請 BB-B 再看** | `wip/lib_lm2_1107/` |
| BB-B 01:46 PC GPU 第一批（六組 PASS）三點 | ① 總圖 library_media 左牆（門牆 S）看到天空、牛頓擺板浮空：查中——GLB 的 S 牆雙面、法線朝內、dir 對；CC 的 CAM 有照新鏡頭重算 fadeWalls，照理不該淡出 → 用 Node 建 library_media＋正式模型照 CC 鏡頭重算（$S/media_fade.js 寫到一半）；② L5FLM lab_in 左白牆過曝：排在 ① 後面；③ 205／美國臥室偏灰：併任務 #196（天光色調） | — |
| 一盞重烘（WZ6_LM_cloud 第 1 點） | **LAWWW-B 已整合 `5a6f73313`**（連 bake_room.py、bake_gg_new.sh 一起換成我分支的版本）；**BB-B 00:46 判 FIXED（雲端）**：門口木地板 R−B 16→50、淺米木色；櫃台前暖木色 OK。ART_APPROVED（溫州街六間）剩 PC GPU 顏色＋fps；**一盞夜間 BB-B 00:55 判 PASS**（19:30 是 14:00 的 70～80%、門口降 47% 合理）——溫州街六間雲端判定全部處理完 | `wip/wz6_yizhan_tint_1108/` |
| **BUG-CAM-LAWLIB-DISCA-1108**（BB-B 00:43 P2，D108） | **LAWWW-B 已整合 `3584f3ac3`**（01:09 ACK；lawlib_cam_disc_unit ALL PASS）；等 CC 用 cc_aa613_probe MODE=lib 重跑、BB-B 判 | `wip/cam_lawlib_disc_1108/` |
| BB-B 00:13 | 第 2 點收回、窗景照片不排；一盞照修法；溫州街其他四間＋阿德套色調＝不擋、低優先（任務 #196） | — |

## 🔨 （舊）現在在做（11-07 20:5x UTC，帳號 B LAWWW2-B）

| 項目 | 狀態 | 位置 |
|---|---|---|
| 光照第一級第三批：SUNNY SIDE、小路、木曜日、一盞、日常失速（AA）、阿德（CC） | **已交 LAWWW-B（50dab3abd），LAWWW-B ACK 20:46：本機接好 d2f414e0e、gg_new_lm_unit ALL PASS、65 支過，GHA 綠了就推**；CC 拍、BB 判 | `wip/gg_lm3_1107/` |
| 光照第二級①：總圖 B1（4.1 版，我的模型） | **烘好 push** `59702fc0d`：512、白天／晚上 0.38／0.38（試烘 10 W 0.52 太亮 → 日光燈 4.7 W、燈下 3.8 W、檯燈 3 W、中庭 3）；節點 113 個名字一樣、instancing 10 個照舊 | 測試 `wip/lib_lm2_1107/`（library_lm2_unit.js；開發原樣 FAILED 3） |
| 光照第二級②：研究小間、5F 書庫（我的模型） | 試烘：研究小間 0.35／0.30 照舊；書庫 0.45／0.41 → ×0.8（`81991c443`）；**512 正式烘焙跑中（排在公館試烘後面）** | bake_library_upper.sh |
| 光照第二級③：公館 afar、青木、Daybreak（AA）、慢輪單車（CC） | 試烘晚上 afar 0.31、青木 0.38、Daybreak 0.38、單車 0.24 → 青木／Daybreak 倍數 1.7、單車 ×1.8（`83768676c`）；**512 正式排在②後面**；gg_new_lm_unit 加四間（在 $S/wt_dev，交件時出 patch） | bake_gg_new.sh（跑完以前不能改） |
| 林家乾麵（BB lin_interior） | **不烘**：沒有天花板燈具；交件時提 | — |
| BB-B 19:24 兩件 P3 | **已回 BB-B**（DELIVERED）：書屋西牆暗帶＝黃金葛白天影子＋書櫃牆角（要亮可以藏黃金葛重烘）；nm17 not loaded＝標題畫面校園 17:55 先建出 pool_14、lazy 還沒下載，CHAR.failures 不清；模型本身載得起來 | — |

## 🔨 （舊）現在在做（11-07 19:3x UTC，帳號 B LAWWW2-B）

| 項目 | 狀態 | 位置 |
|---|---|---|
| 光照第一級第三批：溫州街 SUNNY SIDE、小路、木曜日、一盞、日常失速（AA）、阿德（CC） | **正式 512 烘焙跑中**（約 2 小時，寫進 assets）；試烘兩輪：光源放到燈罩口下（glow_points.py --below）、每間瓦數倍數寫在 bake_gg_new.sh（GSD） | 工具 `407269c74`；交件資料夾之後 `wip/gg_lm3_1107/`；測試加在 `$S/wt_dev`（開發 4172db1e0）的 gg_new_lm_unit.js（開發原樣 FAILED 6） |
| 林家乾麵（BB lin_interior） | **不烘**：模型沒有天花板燈具（只有兩片暖色小燈板＋收銀台招牌），烘了晚上會比現在暗；交件時提，要 BB 加燈或照舊即時光 | — |
| 公館商圈落點的機車擋腿（BB-B 18:40 P3） | **已交 LAWWW-B**（落點搬到走出校門同一點 (−2.5,−29)） | `14f43e529`，`wip/gg_gate_cam_1107/gg_gate_scooter_1107.patch` |
| 第二批（燒臘、頁間書屋） | LAWWW-B **已整合** `f7444d194` | `09bbfefe2` |
| 兩件 CAM | BB-B 瀏覽器驗收 **FIXED**（3cd6f2797） | — |

磁碟：11-07 19:0x 滿了（剩 216 MB），刪了 6 個舊工作樹（都已交件、已 commit），現在剩 5 GB。工作樹只留 `$S/devnow`、`$S/wt_dev`。

## 🔨 （舊）現在在做（11-07 18:4x UTC，帳號 B LAWWW2-B）

| 項目 | 狀態 | 位置 |
|---|---|---|
| 光照第一級第二批：公館燒臘（BB shaola v7）、頁間書屋（AA yejian v3b） | **已交 LAWWW-B**（18:4x）；原檔上烘、sha256 記在 *_lm.json；相關 46 支 Node 過；CC 拍、BB 判 | `09bbfefe2`，`wip/gg_lm2_1107/` |
| 光照第一級第三批：溫州街 7 間（SUNNY SIDE aa sunnyside、阿德 bb ade、一盞 aa yizhan、小路 aa komichi、林家 bb lin_interior、日常失速 aa daily_offbeat、木曜日 aa mokuyobi） | **開始做**：每間的燈多半是 GLOW_* 空節點（extras 有 glow 顏色、size、night），讀位置換點光源；有 VIEW 卡的烘時藏起來 | `bake_gg_new.sh` |
| 兩件 CAM（總圖門廳、公館商圈落點） | LAWWW-B 已套上、測試中（17:49） | `38596122`、`1c90c4cf1` |
| BB-B 18:14 判第一批：轉角 P2／P3 FIXED、窗景 PASS、洋洋 PASS；ART_APPROVED 等 PC | 不用回 | — |

## 🔨 （舊）現在在做（11-07 18:0x UTC，帳號 B LAWWW2-B）

分支 `claude/funny-albattani-iawshm`；開發分支 `claude/modest-rubin-2lyp7g` 最新 `951543b9c`（LAWWW-B 已把 a6509d2a0 整合成 `4fcd3c45b`，303 支過）。瀏覽器都沒跑（D131，交 CC）。
工作樹：`$S/devnow`＝開發 03e92c411＋gg_new＋兩件 CAM；`$S/wt_dev`＝開發 951543b9c＋CAM-GONGGUAN-GATE（patch 從這裡產生）。

| 項目 | 狀態 | 位置 |
|---|---|---|
| CAM-LIBHALL-DOOR-1107（總圖大廳一進門鏡頭在玻璃帷幕外） | **已交 LAWWW-B**（17:4x）；camCols 加 `CAMCOL_facade`；新測試開發原樣 FAILED 3 → ALL PASS；72 支總圖 Node 過；遊戲內等 CC | `38596122`，`wip/libhall_door_cam_1107/` |
| CAM-GONGGUAN-GATE-1107（公館校門口往後走鏡頭不轉） | **已交 LAWWW-B**（18:1x；相關 53 支 Node 過）：「公館商圈」落點和公館預設落點 yaw π→0（原本面向校門、店在鏡頭後面；CC 截圖 play1107_8b）；新測試開發原樣 FAILED 3 → ALL PASS；patch 對 951543b9c | `wip/gg_gate_cam_1107/` |
| 公館三間光照＋窗景 | LAWWW-B **已整合** `4fcd3c45b`；CC 拍、BB 判 | `a6509d2a0` |
| 霖澤 5F 研究室窗外夜景 | 已交，等 LAWWW-B 接、CC 重拍 | `fd06def16` |

**下一步**：CAM-GONGGUAN-GATE 回歸跑完就交 → lm_audit_1107 第一級剩下的店（燒臘、頁間、SUNNY SIDE、阿德、驛站、小路、林家、日常失速、木曜日）。

## 🔨 （舊）現在在做（11-07 17:3x UTC，帳號 B LAWWW2-B）

分支 `claude/funny-albattani-iawshm`；開發分支 `claude/modest-rubin-2lyp7g`（`03e92c411`）。瀏覽器都沒跑（D131，交 CC）。工作樹 `$S/devnow`＝開發 03e92c411＋gg_new_1107.patch＋新 assets；`$S/devclean`＝開發原樣。

| 項目 | 狀態 | 位置 |
|---|---|---|
| 公館三間光照＋窗景（洋洋、轉角唱片、便利商店）＋轉角唱片 BB-B 16:04 P2／P3 | **已交 LAWWW-B**（17:3x）；218 支相關 Node 測試過；CC 拍、BB 判 | `a6509d2a0`，`wip/gg_new_lm_1107/`（README、gg_new_1107.patch） |
| 霖澤 5F 研究室窗外夜景太亮（BB-B 16:04 P2） | **已交**（近景夜景 ×0.4），等 LAWWW-B 接、CC 重拍 | `fd06def16`，`wip/lz5f_night_view_1107/` |
| CAM-LIBHALL-DOOR-1107、CAM-GONGGUAN-GATE-1107（LAWWW-B 16:13，P3） | **開始查** | — |

**工具的改動**（我的檔）：
- `bake_room.py`：`--keep-instances` 時共用網格不烘。
- 新 `glb_fix_instnames.py`、`glb_add_viewcard.py`、`gg_shop_views.sh`＋`gg_scene/*.json`。

**之後（lm_audit_1107 第一級剩下的）**：燒臘、頁間、SUNNY SIDE、阿德、驛站、小路、林家、日常失速、木曜日。這幾間的 VIEW 卡要處理 `--emit`／`--dayemit`。

## 🔨 （舊）現在在做（11-07 16:0x UTC，帳號 B LAWWW2-B）

分支 `claude/funny-albattani-iawshm`；開發分支 `claude/modest-rubin-2lyp7g`（`03e92c411`＝e66781d1f＋交接；洋洋、轉角唱片已經進得去、霖澤 5F 光照已整合）。瀏覽器都沒跑（D131，交 CC）。
工作樹 `$S/devnow`＝開發 `03e92c411`＋`src/zones3d.js` GG_VIEW 兩筆（洋洋、轉角唱片）＋測試 `gg_views_1107_unit.js`、`gg_new_lm_unit.js`（還沒存成 patch）。

**LAWWW-B 15:35 的順序**：洋洋 → 轉角唱片 → 便利商店插隊烘；兩間的 GLB 都沒有窗景卡，照 afar 補一張。CC 拍、BB 判。三間做完一起交。

| 項目 | 內容 | 位置 | 狀態 |
|---|---|---|---|
| 便利商店光照 | BB 原檔 `bb_support/cvs_interior.glb`（sha256 cb5efc95…）；LED 29 條 14 W；白天 0.53／晚上 0.47（店面玻璃那一圈白天 4% 過曝） | `bake_gg_new.sh cvs`；`cdfd9f116` | **烘好、已 push**，等另外兩間一起交 |
| 洋洋窗景卡 | `glb_add_viewcard.py`（照 afar：玻璃外 2.5 m、16 × 6.5 m、WALL_front_VIEW_yy_window_view）；照片 `gg_shop_views.sh yangyang`（公館 x −9.4；機車、樹、路燈照遊戲位置 `gg_scene/*.json`） | `4d3bea071`（工具） | **照片 128 取樣在拍**；試拍 24 取樣看過：騎樓柱、菜單看板、機車、羅斯福路、校門、椰林 |
| 洋洋光照 | 日光燈 6 支 30 W、吊燈 4 盞 20 W、壁燈 5 盞 10 W；烘完加窗景卡 | `bake_gg_new.sh yangyang` | 等照片拍完再烘 |
| 轉角唱片 | 投射燈 18 盞（12 W、40° 朝下）、吊燈 3 盞；`--keep-instances`（instancing 照舊、名字和淡出方向要用 corner_glb_unit 再驗）；照片公館 x 55.6 | `bake_gg_new.sh corner`、`gg_shop_views.sh corner` | 腳本寫好，排在洋洋後面 |
| zones3d.js patch | GG_VIEW 加 yangyang、corner_records 兩筆（不用改別的：兩間本來就走 ggAAattach） | `$S/devnow` | 開發原樣 `gg_views_1107_unit` FAILED 6 |

## 🔨 （舊）現在在做（11-07 13:4x UTC，帳號 B LAWWW2-B）

分支 `claude/funny-albattani-iawshm`；開發分支 `claude/modest-rubin-2lyp7g`（`e9d8c668f`）。瀏覽器都沒跑（D131，交 CC）。

**已整合**：LAWWW-B 把下面那一批全部整合進開發分支 `6da721819`：
- 霖澤 3F／4F、萬才研討室的光照；
- 溫州街 10.3 MB、少編 shader；
- FIXLIGHTS／PINPROG。

**CC 的量測**：照 BB-B 13:25 的 P6／LZLM6／WSEM6 清單跑，改前 `126bdf93e`、改後 `6da721819`。我補了兩項：
- WZ6：溫州街、118 巷改前改後的畫面，看價目牌、黑板改單面以後從街上看不看得到；
- `wz_street_integration.py`：改前改後各跑一次。

我之前請 CC 跑的舊項目都改用這份。工作樹 `$S/gwbase` 現在是開發 `e9d8c668f`＋`tests/rooms_ab3_lm_unit.js`。

| 項目 | 內容 | 位置 | 狀態 |
|---|---|---|---|
| INTERIOR-AAA 第三批光照 | 共同 3F、霖澤辦公室、博雅 203、洗衣間、總圖視聽室；燈用 tube_lights.py 從 GLB 讀；不用改程式 | `bake_rooms_ab3.sh`；測試 `wip/rooms_ab3_lm_1107/`（`c3075c03c`，開發原樣 FAILED 5） | **烘焙中**：前三間好了（直接寫在 assets，還沒 commit），洗衣間、視聽室還在烘 |
| INTERIOR-AAA 最後兩間 | 205 寢室、美國臥室 C | `bake_rooms_last2.sh`（新） | 腳本寫好，等上一批烘完再跑 |

**205 寢室要先跟上 203**：
- assets 裡的 `dorm_205.glb` 是 11-02 版，天花板 3.0 m、梯子沒有扶手。
- 11-03 天花板改 3.4 m、11-05 梯子加扶手，這兩次都只重產了 203。
- 用現在的 `dorm_room4.py --only 205` 重產：配置只差 `h` 3.0 → 3.4，座位、阻擋、走近點都一樣（暫存資料夾試過）。
- 所以 `room_glb_layouts.js` 的 dorm_205 要改 `h`，會附 patch。

## 🔨 （舊）現在在做（11-07 12:3x UTC，帳號 B LAWWW2-B）

分支 `claude/funny-albattani-iawshm`；開發分支 `claude/modest-rubin-2lyp7g`（`126bdf93e`）。瀏覽器都沒跑（D131，交 CC）。工作樹 `$S/gwbase`＝開發 126bdf93e＋下面三包 patch（rooms_glb3d、engine3d、測試）。

| 項目 | 內容 | 位置 | 狀態 |
|---|---|---|---|
| 萬才研討室 A／B 光照 | A 一張；B 平常／2028-10-26 面試兩張（lm_sets.py 比對 UV）；rooms_glb3d.js pickLM | `eb36f6844`、`856dd6f86`（`wip/wancai_sem_lm_1107/`） | 已交 LAWWW-B；CC 拍（WANCAI-SEM-LM） |
| PERF-COLD-RT ① 溫州街縮檔 | 13.6→10.3 MB（法線 8 位元、頂點色 0～255）；**線上本來就 gzip（3.72 MB），只少 0.34 MB**；LAWWW-B 收了（記憶體），v9.10.22 後推 | `a898ff47e`（`wip/perf_cold_rt_1107/`） | LAWWW-B 本機 `9bcdfc8f1`；② Meshopt 不做 |
| PERF-WZ-SHADERS 模型端 | 頂點色 VEC4→VEC3、店面底色接自發光貼圖、價目牌／黑板單面（兩條街）；約 −4 program | `3179b12b5`（`wip/perf_wz_shaders_1107/`） | 已交；CC 量 programs、PERSIST、截圖 |
| FIXLIGHTS／PINPROG 實驗 | `?fixlights=3`（點光源湊到 3 盞）、`?pinprog=1`（換區域前留住 program）；engine3d.js | `43df0d07e`（`wip/fixlights_1107/`） | **240 支 engine3d 測試跑中**；跑完交 LAWWW-B，請 CC 量 |

**重要發現**：
- 換區域重編 shader 有兩個原因：點光源數不同（MToon、陰影全重編）；disposeGroup 把 program 刪掉，回到同一區又重編（第二次進溫州街還是 +53）。
- 83 個區域的點光源：0～3 盞 46 個、4～13 盞 37 個。戶外只有溫州街有 3 盞，晚上才亮。拿掉要美術決定，只列成選項。

**下一批 INTERIOR-AAA**：`bake_rooms_ab3.sh` 已寫好（共同 3F、霖澤辦公室、博雅 203、洗衣間、視聽室；燈用 tube_lights.py）。等測試跑完再烘，以免搶 CPU。

## 🔨 （舊）現在在做（11-07 11:0x UTC，帳號 B LAWWW2-B）

分支 `claude/funny-albattani-iawshm`；開發分支 `claude/modest-rubin-2lyp7g`（`126bdf93e`）。瀏覽器都沒跑（D131，交 CC）。

**LAWWW-B 10:14**：回去推 INTERIOR-AAA #113；CC 量出 PERF_COLD_RT（溫州街主模型下載／解析）和預期差很多的話，那一項優先。

| 項目 | 內容 | 位置 | 狀態 |
|---|---|---|---|
| 頭髮 (b) | 五個 VRM 頭髮貼圖去細線 | `692873e87` | **ART_APPROVED**（LAWWW-B 10:48，D100a），放進 v9.10.22 |
| 洋洋 v1c | 鹹酥雞店模型 | `9ef8a17cf`（`wip/yangyang_review_1107/`） | ART_APPROVED（AA_650 授權我驗）；已通知 LAWWW-B 可以接 |
| 霖澤 3F／4F 光照 | 15 盞嵌燈＋南窗；不用改程式 | `5a2ab6c75`（`wip/linze_upper_lm_1107/`） | READY_FOR_ART_REVIEW；已交 LAWWW-B；CC 拍遊戲內（LZ-UPPER-LM） |
| 萬才研討室 A／B 光照 | A 一張；B 平常（初談隔間）、面試（2028-10-26）各一張，`rooms_glb3d.js` 照當天布置換（patch）；`bake_room.py` 的 --hide 物件也複製 _rt 材質 | `wip/wancai_sem_lm_1107/`（WIP `16c0b71b1`） | **烘焙中**（`bake_wancai_sem.sh`）；測試 `wancai_sem_lm_unit` 開發原樣 FAIL 3 |

**新工具**：`tools/blender/env_second/lightbake/tube_lights.py`（從 GLB 的燈管網格讀出每盞燈 → `--lights` 字串）、`lm_sets.py`（同一間不同布置的第二張光照貼圖）。

**還沒烘光照的房間**（rooms_glb3d 那一批，燈位用 tube_lights.py 讀過）：共同 3F（6 盞）、霖澤辦公室（4）、博雅 203（6，不含檯燈）、洗衣間（2）、視聽室（6，沒有窗）、宿舍 205（7，和 203 同型）、霖澤 5F（研究室的燈要能單獨開關，另外處理）。

**等別人**：CC-B 的 PERF_COLD_RT（溫州街，8fdb294aa，排在 BB 發布前三支後面）、LZ-UPPER-LM 拍攝；使用者：轉角唱片誰做、哪幾家只有外觀的店要做成進得去。

## 🔨 （舊）現在在做（11-07 10:2x UTC，帳號 B LAWWW2-B）

分支 `claude/funny-albattani-iawshm` @ `692873e87`。開發分支 `claude/modest-rubin-2lyp7g`（`e70d19503`）。瀏覽器都沒跑（D131，交 CC）。

**LAWWW-B 09:04 的順序都交了**：d) 1 描邊、d) 2 溫州街主模型 → (B) 預先載入 → 頭髮 (b)。等他派下一項；沒有的話推 INTERIOR-AAA 下一間室內（#113）。

**11-07 上午後段交的**：

| 項目 | 內容 | 位置 | 狀態 |
|---|---|---|---|
| d) 1 描邊不投影 | MToon 描邊在影子那一輪和本體同一份深度，每個會投影的人物少 5 次；更正：臉上零件本來就不投影 | `wip/wz_dc_1107/char_outline_shadow_1107.patch`（`a535443e2`） | LAWWW-B ACK，整合中 |
| d) 2 溫州街頂點色打包 | 五個頂點色材質合成兩個（粗糙度／金屬度放小貼圖）；primitive 28→16、主畫面 −10～−12、影子 −1；逐三角形比對一樣 | `wenzhou_street.glb`＋`wz_vc_pack_1107.patch`（`a535443e2`） | LAWWW-B ACK，整合中；CC 量 calls |
| PERF-COLD (B) | 走到出口 30 m 內先下載那一區的模型（只下載不解析）；`zone_assets.js` 由 `tools/gen_zone_assets.js` 產生 | `wip/perf_cold_prefetch_1107/`（`7eff8f7a4`） | LAWWW-B ACK：過期改 WARN；CC 跑 `perf_cold_probe` near＋NET=4g |
| 大步照鏡子 | 照鏡子 (−2.6,−3.6)、看看 (−2.85,−2.95)；照鏡子按得到 1→10 格 | `src/data/dabu_layout.js`（`7eff8f7a4`） | LAWWW-B 接；CC 重跑 XSSHOP_dabu_cam |
| 頭髮 (b) | 五個 VRM 頭髮貼圖去細線（`tools/hair_texture.py`） | `wip/hair_noodle_1107/`（`692873e87`） | READY_FOR_ART_REVIEW；等 CC 重拍、LAWWW 標 |

**給 CC-B 的提醒（已傳）**：截圖工具暫停後，NPC 的顯示也照跟隨鏡頭的視錐（engine3d.js:335），換角度要自己重算。

**暫存區**（不進 repo）：`$S/vcpack`（溫州街打包前後的 GLB）、`$S/pf`（zone key 探針、套件結果）、`$S/hairb`（頭髮貼圖、預覽）。

## 🔨 （舊）現在在做（11-07 09:5x UTC，帳號 B LAWWW2-B）

分支 `claude/funny-albattani-iawshm` @ `07deb7085`（下面的最新一包）。開發分支是 `claude/modest-rubin-2lyp7g`（`79214e4e1`）。瀏覽器都沒跑（D131，交 CC）。

**LAWWW-B 08:41 排的順序**：頭髮 (a) → PERF (A) → XS-FARVIEW（這三個都交了）→ (B) 預先載入／d) 溫州街主模型 draw call／頭髮 (b) 重畫貼圖。

**11-07 下午交的：**

| 項目 | 內容 | 位置 | 狀態 |
|---|---|---|---|
| XS-NIGHT 第 2 版 | 四張夜景重拍 | `882c0d096` | 已整合 `795eae822`；BB-B Blender 過 |
| XS-GYM-DOME-NIGHT | 圓頂晚上像燈籠 | `72099725f` | 已整合 `f92955fd1` |
| AA716-GYM-BG | B1 健身房 2D 背景 | `1c5696b4b` | 已接（本機 `48297c612`） |
| XS-NORTH-ROAD-1107 | 校園北牆外新生南路往北那一段 | `wip/xs_north_road_1107/`（`b501e871e`） | 已接（本機） |
| 一樓窗景「只有天空」FAIL | **CC 截圖工具的問題**（暫停後沒重算 fadeWalls），遊戲沒壞；CC-B 改 CAM `0674d5a0a` 重拍中 | `wip/xs_night_1107/`（`6b92262a6`） | 等 CC 重拍、BB 判 |
| HAIR-NOODLE (a) | 法線 0.6 烘進祐廷＋五位女主角的預設 VRM；語彤頭髮 ×1.04；子晴背後黑塊＝吉他袋 | `wip/hair_noodle_1107/`（`5ca9da146`） | 等 CC 重拍、LAWWW-B 標（D100a） |
| PERF-COLD (A) | 淡入前也等 NPC 的 VRM、動作檔（reqTake 移到 populate 之後）；上限第一次 12 s、再來 6 s | `wip/perf_wz_day_1103/perf_cold_wait_1107.patch`（`c0792610e`） | 等 LAWWW-B 接、CC 重量 |
| XS-FARVIEW-1105 | 新生南路兩頭的街廓（`xinsheng_far.glb`）、不畫城市剪影 | `wip/xs_farview_1107/`（`567b76230`、`07deb7085`） | READY_FOR_ART_REVIEW；等 LAWWW-B 接、CC 拍 |

**下一步**：d) 溫州街 `wenzhou_street_glb` 117 calls → 減（我的 GLB）；然後 (B) 預先載入（改 LAWWW 的檔，patch）；頭髮 (b)。

**暫存區**（不進 repo）：
- `$S/far`：遠景的預覽（`after/`）、回歸建置；
- `$S/hair/bake`：烘好的 VRM；`$S/hair/cmp6`：逐點比；
- `$S/fa05`：Node 重現窗景卡的腳本（已複製進 repo）。

## 🔨 （舊）現在在做（11-07 07:4x UTC，帳號 B LAWWW2-B）

分支 `claude/funny-albattani-iawshm` @ `b9c61acc7`。瀏覽器都沒跑（D131，交 CC）。

**整合進度**：LAWWW-B 已把裙子兩批、Café 橘色斜面、籃架、體態、器材都接進開發。

- 最新是 `923c0f521`，含 `41bfc5cbe`、`c82a39be1`、`a64deefda`；
- **之後的 patch 對 `923c0f521` 做**：`gym3d.js`、`fit3d.js` 被器材那一包改過。

**11-07 交了十二包＋兩個探針：**

| 項目 | 內容 | 位置 | 狀態 |
|---|---|---|---|
| WINDOW-FLICKER-1107＋木曜日窗景 | — | `345574e2d` | 已整合 |
| GYM-FIT 健身房玻璃門 | — | `7e8e59883` | 已整合 |
| SKIRT 第一批：8 個路人 | 坐下時才打開的裙子形狀 `skirt_sit` | `wip/skirt_sit_1107/`（`768da51ab`） | 已整合；BB-B 意見「通過」 |
| SKIRT 第二批：有名字的角色 | 沛珊、芯慈、予樂、秀琴 | `33bc9fe48` | 已整合 `a64deefda` |
| ART-ARENA-HOOPS-1105：3F 籃架 | 放下來的吊掛式籃架，整組 SET_HOOPS | `wip/arena_hoops_1107/` | 已整合 `41bfc5cbe` |
| GYM-FIT ① 器材資料 | `b1.fitness.equip`，22 件 | `wip/gym_fit_equip_1107/` | 子代理那一包一起合了 |
| GYM-FIT ② 體態 fit 形狀 | 四階 0／0.4／0.7／1 | `wip/fit_body_1107/` | 已整合 `41bfc5cbe`；等 LAWWW 驗（D100a） |
| P3 Café 橘色斜面 | 天空半球裁切 | `c792202bb` | 已整合 `c82a39be1`；BB-B 自己補拍 |
| GYM-FIT ③ 短袖運動服 | 祐廷 VRM 加 GYM_TOP、GYM_SHORTS（吃 fit）；`C.setGymWear`；B1、體育課自動換 | `wip/gym_wear_1107/`（`1d022e8d1`） | 已整合 `c1fe4f3f0`（INTEGRATED）；D100a 等 CC 截圖 |
| **#167 日常失速店內第二版** | 修第一版烘焙的頂點色 bug（椅子、盆栽、植物顏色回來）、燈色往白光拉、葉子自己亮；NOSHADOW_ 不投影、街上看不到的面拿掉（21,808→18,771） | `wip/offbeat_storefront_v2_1107/`（`e9b8fe9ba`；patch 對 `0f4b0394a`） | 已整合 `737db65d5`；BB-B 顏色、燈色 OK，CC-B 量店前 fps |
| **GYM-FIT ③ 運動服第二版** | LAWWW-B 遊戲內看到領口灰色、衣襬兩個小黑點、深色長襪：皮膚貼圖畫的內衣、襪子改掉；短褲不再穿出上衣 | `wip/gym_wear_1107/`（`cc1371cc7`；測試 patch 對 `86f0c924f`） | **ART_APPROVED**（LAWWW-B 07:20，D100a；體態四階也是） |
| **XS-NIGHT-1107 新生南路四張夜景** | BB-B P3「大口窗景晚上只看得到天空」：燈頭點光源、月光 0.2、曝光 0 重拍；只換四張 webp | `wip/xs_night_1107/`（`5442841464`） | 第 1 版已整合 `bcf4ad72a`；**BB-B 07:05 要第 2 版**（近處路面太亮）：近的路燈只照燈下一圈、店的發光 1.1，正在拍 |
| **PERF-WZ-DAY-1103 第二步** | 讀 PC 11-05 數字：白天 1% low 7 fps＝第一次進區域的成本；第二支探針 `perf_cold_probe.py`（LoAF、先載好／黑畫面多畫一格兩種對照、穩定以後的分項） | `wip/perf_wz_day_1103/`（`8802cce88`、`bc7e0ff5e`） | CC-B 已排 PERF_COLD（`b987cb1cf`）；數字回來寫 patch 給 LAWWW-B |
| **HAIR-NOODLE-1104** | 使用者「頭髮太像泡麵」：CC-C 的探針一直沒排；延伸成 `cc_hair_fix_probe.py`（原樣／法線 0.6／貼圖柔化／兩個一起）；`tools/hair_normals.py` 之後烘進 VRM | `wip/hair_noodle_1107/`（`b9c61acc7`） | 已請 CC-B 排 HAIR_FIX；LAWWW-B 判哪一組（D100a） |

**運動服**：LAWWW-B 說顏色、換穿範圍照我定的；`?blchar` 的 `bl_yuting` 沒有運動服。

**下一步：**

1. 夜景第 2 版拍完 → 交 LAWWW-B（換四張）、BB-B 判。
2. 等 CC-B：PERF_COLD → 寫 patch；HAIR_FIX → LAWWW-B 選組 → `tools/hair_normals.py` 烘進 VRM（或重畫頭髮貼圖）。
3. 等 CC：日常失速店前 fps、新生南路夜景（晚上從店裡看）。
4. 舊佇列：TODO_SHORTCUTS（停車場灰牆是 BB 請 CC 換角度）、#146（明軒、小語 3D 等）。
   - `RULES_2D_TO_3D.md` 11-07 補了五列方法、坑 17～22（LAWWW-B 請我把「人物預覽要用真的皮膚貼圖」寫進規則，D140）。
3. 使用者 03:2x 的四個存檔（UA-LAWWW2-1107-01）：還沒回要看哪裡。

**暫存區**（不進 repo，掉了可以照 README 重做）：

- `$S/gymwear`：運動服的預覽腳本；`$S/offb2`：日常失速第二版的對照圖腳本（shots.sh）、第一版備份；`$S/dk2`、`$S/dk3`：夜景的舊版、渲染原圖、試燈；`$S/hair`：頭髮的 Blender 預覽（preview.py）、JS 和 Python 逐點比（cmp_js_py.js）；
- `$S/gwwt`、`$S/gwbase`：測試用 worktree。

## ✅ 值班登記（2026-11-07 03:4x UTC；帳號 B LAWWW2-B；使用者：「現在接班 我也會跟其他AI講」）
- 值班登記：帳號 B｜LAWWW2-B｜session_01GV1WG3UeT2DhuDpxeWJsvD｜分支 `claude/funny-albattani-iawshm`（11-02 清理時刪過，這次從接班基準重新推）｜接班基準 `629e042e2`（快轉上一任 `claude/focused-cray-c9uwvw`）。
- 上一班：帳號 C｜LAWWW2-C｜session_015BuNi47yLUt5PviELapMNj｜11-05 10:50 正常交班（成果最後 `b5ffabc34`，交班紀錄 `629e042e2`）。
- 帳號 B 11-04 12:1x～12:2x 那一班，我沒有登記、沒有寫入（使用者說開錯帳號、交班）。
- `docs/handoff/duty_LAWWW2.json` 改成 B、state on（`duty register --ref origin/claude/adoring-meitner-mqzst8`），等值班 LAWWW `duty sync`。RULE_SOURCE `claude/adoring-meitner-mqzst8`（seq 89，現在沒有人值班 LAWWW）。
- 規則讀到 HV-29（D139～D141）：
  - D139：電腦不能用時，瀏覽器測試丟 GitHub。
  - D140：`RULES_2D_TO_3D.md`，接班已讀。
  - D141：一個場景最多 3 版就進遊戲；三版以內的店我自己決定要不要再改。
  - D136：校園建築可以像、不能照抄。
  - D138：同角度疊圖、TripoSR。
- `check_handoff.py check` OK（十二項）、`duty verify` OK、`roles` 有讀。
- 使用者 03:2x 傳了四個存檔、沒有說明（UA-LAWWW2-1107-01）：
  - 已問要看哪裡，還沒回。
  - 檔案在工作階段暫存區，不進 repo。
- 下一步照上一班 C 節：
  1. 確認 XS-NORTH-EXT＋XS-WINCARD 上線與 BB／CC 回饋；
  2. 木曜日的窗外（WINVIEW-AUDIT 最後一項）；
  3. SHOP-WINDOW-2D 日常失速試做 → SKIRT-BENCH-CLIP → ARENA-HOOPS。

## 🔁 交班（2026-11-05 10:50 UTC；帳號 C LAWWW2-C；使用者：「現在交班」）

- 分支 `claude/focused-cray-c9uwvw`。成果最後一個 commit `b5ffabc34`（LAWWW-C ACK 登記），交班紀錄在它後面；**SHA 以 `git ls-remote` 為準**。主 worktree 乾淨。
- 交班登記：`docs/handoff/duty_LAWWW2.json` state `handed-off`、快照 `docs/handoff/snapshots/2026-11-05T1050Z_C_LAWWW2.json`。值班 LAWWW 要跑 `duty sync`。
- **交班不代表新帳號已經接班**。下一班照 `docs/AI_SESSION_HANDOFF.md` 第 4 節接班，先讀這一節、`TODO_SHORTCUTS.md`、`docs/handoff/user_asks_LAWWW2.json`。

### A. 這一班完成、已交（11-05 上午）
| 任務 | 交件 | 狀態 |
|---|---|---|
| WINVIEW-AUDIT-1105 第四包（慢輪、阿德視差窗；afar／頁間／青木捷運出口修正） | `e29912473` | LAWWW-C 已整合 `b92a2791e` |
| XS-GATE-NORTH-1105（側門北牆、望月台、停車場、體育館搬到望月台和法學院中間；UA-05、06） | `cf6a29f7e` | LAWWW-C 已整合 `4e2b15eee` |
| TODO_SHORTCUTS.md（各包「先將就」收成代辦；UA-07） | `1f38c584c` | 完成 |
| XS-NORTH-EXT-1105＋XS-WINCARD-1105（望月台、體育館照臺大官網照片第 2 版；新生南路圍牆後面；大口一二樓、大步、好拍窗外 8 張；UA-08） | `c6837632e` | LAWWW-C 10:47Z ACK：接進開發線（下一版）、十支 ALL PASS；拍照轉 BB 排 CC |

### B. 沒做完／沒測（都沒在瀏覽器看過，D131 等 CC 拍、BB 判；使用者看過才算美術通過）
- 上面兩棟、8 張窗外：MODEL_READY。先將就 13 項在 `TODO_SHORTCUTS.md` 最上面那一節（圓頂晚上不亮、戶外大樓梯和望月台門前台階沒做、大口西側窗沒有街景…）。
- 參考照片（新月台 7 張、體育館 8 張）**刻意沒進 repo**（學校的照片）；網址在 `wip/xs_wincard_1105/README.md`。紀念品店官網的照片放在 irp.cdn-website.com、體育中心官網——這個環境的網路連不上。

### C. 下一班第一步（佇列照順序）
1. 讀通知、fetch 開發分支 `claude/adoring-meitner-mqzst8`，確認 XS-NORTH-EXT＋XS-WINCARD 是不是已經上線、BB／CC 有沒有回饋（拍照、和照片比）。
2. 木曜日的窗外（WINVIEW-AUDIT 最後一項，還沒開工）。
3. 其他照舊：SHOP-WINDOW-2D 日常失速試做 → SKIRT-BENCH-CLIP → ARENA-HOOPS；PERF-WZ-DAY 等 PC 數字；HAIR-NOODLE 等 CC 探針；INCR 記帳。

### D. 沒有遠端備份的（只在這個工作階段的暫存區，容器回收就沒了，都可以重做）
- 窗外照片的 2048×1024 PNG 原圖（webp 已進 repo；重拍：`bash docs/art-rebuild/second_ai/wip/xs_wincard_1105/render.sh <輸出資料夾>`）。
- 參考照片（照規則不進 repo；網址在 README，重抓就好）。
- 暫存 worktree（xw、base56、devtip）：內容都已經在 patch `wip/xs_wincard_1105/xs_north_wincard_1105.patch` 裡。

## ✅ 值班登記（2026-11-04 12:37 UTC；帳號 C LAWWW2-C；使用者：「你上次沒有交班 使用量就到達上限 你之後有其他帳號接續工作 現在換你接班 有新增一個腳色CC幫助BB測試」）
- 值班登記：帳號 C｜LAWWW2-C｜session_015BuNi47yLUt5PviELapMNj｜分支 claude/focused-cray-c9uwvw｜接班基準 `5f85444cd`（快轉上一任 `claude/second-ai-env-art`）｜2026-11-04 12:37 UTC
- 上一班：帳號 A｜LAWWW2｜session_01AC1WVgJSmoJK1uRsPK2Zn1｜最後 commit `af97d745`（交班紀錄）＋`5f85444cd`（快照）｜正常交班（11-04 09:1x）。帳號 B 11-04 12:1x～12:2x 那一班，LAWWW2-B 沒有登記、沒有寫入 LAWWW2 的分支。
- **我自己 10-28 那一班沒有交班**（10-28 15:3x 用量到上限停住）：最後 push 是 `4b1fcc458`（LIB-HALL-LM-1028 正式烘焙第二版），已經在上一任的分支裡。
  - 本機沒推的：總圖滅火器導航、patch 更新、README、對照圖。已被 LAWWW2-B 10-30 的 `c48a5c310`（LIB-HALL-LM-1028、RT-NIGHT-1028 交件，BB_247 ART_APPROVED）和 NAV-LIBHALL-ISLAND-1030 取代。
  - 留在本機 stash，不套用、不推。
- `docs/handoff/duty_LAWWW2.json` 已改成 C、state on（`duty register`，RULE_SOURCE `claude/modest-rubin-2lyp7g`），等值班 LAWWW `duty sync`。
- 規則：讀到 HV-25（D134）。我上次值班以後新增的有 HV-21～HV-25、D115～D134。和 LAWWW2 有關的：
  - D120／D128：建築、場景美術由 BB 標 ART_APPROVED；整體畫風由 LAWWW2 提案，BB 和 LAWWW 同意就定案。
  - D125：等測試時不閒著。
  - D126：每小時推一次。
  - D129：交班關喚醒、接班打開。
  - D131：瀏覽器測試一律排使用者的電腦（CC 的 cc-local 佇列），雲端只跑幾秒的 Node、Node 模擬、Blender。
  - D132：我沒空驗的模型交 BB 代驗。
  - D133：驗收要對照參考圖、不准複製貼上。
  - D134：CC 可以直接聯絡任何職位。
- **暫停中**（五欄：誰決定、為什麼、負責人、恢復條件、下次檢查日）：接班核對中。上一任交班清單裡的都是「等 PC 驗」「等 BB 驗」，不是暫停。本班的暫停項目核對完寫在這裡。

### 「等待」七項的恢復條件（LAWWW-C 11-04 12:48 check_orphans；LAWWW2-C 13:1x 查證）
查證依據：
- 開發分支 `claude/adoring-meitner-mqzst8`（ebd44c2e3）。
- `main`（b0c3032af，v9.10.19.1）。
- AA-C 分支 `claude/magical-albattani-bk7b4n`（a2d296d7c）。

| ID | 實際狀況 | 等誰 | 等什麼 | 什麼時候再看 | 建議總表狀態 |
|---|---|---|---|---|---|
| CAM-BELL-1031 | 8119766b1 由 a45c719e1 整合，**已經在 main** | BB（PC，cc-local） | 遊戲畫面：行政大樓門廊往旁邊 1.3 m，鏡頭不再整片是鐘亭石材；campus_bell_seethru_unit 在開發分支 | BB 下一次排 PC 批次時 | 已整合待測試 |
| GYM-B1-PLATES-1101 | 095518e3f 由 82107f8b5 整合，**已經在 main** | BB（PC） | 遊戲畫面：體育館 B1 三塊門牌有字、方向朝外；gym_b1_plates_unit 在開發分支 | BB 下一次排 PC 批次時 | 已整合待測試 |
| ART-NANYANG-CINEMA-1103 | BB 的大廳 v5b（2cecefa9a）、1 廳 v2（9e72db718）都是 READY_FOR_REVIEW；開發分支還沒有 | **LAWWW2 自己**，不是等別人 | LAWWW2 驗收（SCENE_RULES §11、§12，對照參考圖），再做外觀、區域、導航、出入口、光照 | 照使用者 11-03 的順序（UA-LAWWW2-1103-01）：①法學院 relayout ②系館名稱 patch ③電機一館 ④總圖展演廳與 3F 做完以後；新生南路那一批（UA-LAWWW2-1103-07）一起排。LAWWW-C 要提前就告訴我 | 待開工 |
| ART-SHANLAN-BOOKSTORE-1103 | AA 的室內 v5（3d665b504；refcam 報告 shanlan_v5）是 READY_FOR_REVIEW；開發分支還沒有 | **LAWWW2 自己**；坐地板的姿勢 POSE-FLOOR-READ-1103 是 LAWWW 的，可以並行 | LAWWW2 驗收，再做新生南路店面、兩層導航、出入口、光照 | 同上 | 待開工 |
| ART-WZ-CAFES-1103 | AA 的木曜日 v3、日常失速 v3 是 READY_FOR_REVIEW；兩顆 GLB 已在開發分支（255d7d91a 以前）；AA617 木曜日已整合待測試 | **LAWWW2 自己** | 日常失速的外觀、區域、導航、出入口、光照；木曜日一樓鐵門、樓梯、外觀 | ⚠️ **LAWWW 的 P1 進行中 AA623-BOARDGAME-TEAM-1103（桌遊團在日常失速長桌）、AA618 卡在這一項**。請 LAWWW-C 決定要不要排在 CAMPUS-RELAYOUT 前面；沒有指示就排在 WZ-FIVE 阿德轉角之後 | 待開工 |
| ART-XINSHENG-GATE-1103 | 側門、溫州街西側出口已整合（XINSHENG-SIDE-1103，aa8cb5beb）；新生南路街景還是 BLOCKOUT | **LAWWW2 自己** | 立面 `bldg.xinsheng_street`（全部外觀＋公館燒臘，UA-LAWWW2-1103-07）；LAWWW 的 WZ-ENTRY-XINSHENG-1103（拿掉公館巷口）等這一項 | 和 NANYANG、SHANLAN 一起排（同一條街） | 待開工（側門那一半已整合） |
| GG-SHOPS-REDESIGN-1103 | **更正（使用者 13:3x「我應該有給圖啊」）：我查錯了**，參考圖早就給了——企劃線 `docs/story_planning/ref_images/shops/` 有公館 9 間的外觀＋室內（日和便利店、慢輪單車、青木茶室、頁間書屋、afar、洋洋鹹酥雞、轉角唱片、Daybreak、公館燒臘）；外觀 v1（青木、頁間、日和、慢輪）、afar、Daybreak 已進遊戲 | **LAWWW2 自己** | 把還沒接的接進遊戲：青木室內（AA aoki）、慢輪室內（CC bike）、洋洋（BB）、轉角唱片（CC）、公館燒臘的 noodle 區域 patch（GG-SHOPS-INTEG-1104） | 小路窗景、lane_east 之後就做 | 取消／被取代 → GG-SHOPS-REDO-1104＋GG-SHOPS2-1104（不是等待） |

- 總表裡重複的 ID（同一件事有兩個）：
  - BOOKSTORE-2F-1103 和 ART-SHANLAN-BOOKSTORE-1103
  - CINEMA-GG-1103 和 ART-NANYANG-CINEMA-1103
  - WZ-CAFES-1103 和 ART-WZ-CAFES-1103

  建議留 ART-*，另外三個標「取消／被取代」（replacedBy ART-*），由 LAWWW-C 決定。
- 同一類、也是等 LAWWW2 驗收＋整合的：FASTFOOD-24H-1103（BB 大口漢堡 1F／2F v1）、SPORT-SHOPS-1103（CC 大步 v1，先 BB 驗）。

## 🔨 現在在做（11-05 03:2x UTC，帳號 C LAWWW2-C）
- 使用者 11-04 15:3x「你繼續做別的事情我要睡覺了很久都不會看」照舊：照順序自己做，每段做完就 push，要使用者決定的記在下面，不叫醒他。
- 開發分支最新看到 `335b47844`。

### 11-04 21:2x 以後交的（都沒在瀏覽器看過，D131 等 CC 拍、BB 判）
| 任務 | 交件 | 狀態 |
|---|---|---|
| KOMICHI-VIEW-POLISH-1104（小路窗景 14:00 太陽、路燈光圈） | `3182a6040` | LAWWW-C `3666310f8` 已接；BB-C 21:59 第二版 PASS（①A、②14:00） |
| NPC-ANIM-LOOPS-1104 補件 1、4（筷子、筆尖） | `048f3498c` | 已整合 |
| NPC-ANIM-LOOPS-1104 補件 2（F2／M2 骨架） | `bc862203f` | LAWWW-C 沒接，併進下一列 |
| SIT-HEIGHT-1104（坐下高度照大腿厚度，28 片段重出，含 F2／M2） | `267f3d9a9` | LAWWW-C `b1ca12646` 已接 |
| CAFE-EDGE-1105（Café 近桌 E20 片段 14 個） | `58d238bdd` | 已整合 |
| DORM-LADDER-HEAD-GRIP-1102 ②（上舖梯子靠床那側扶手） | `42cbba73b` | LAWWW-C `e118734a3` 已接 |
| GUITAR-SHOP-ZONE-1105（同弦樂器區域 xs_tongxian、樓梯間） | v1 `a353148b7`、v2 `baaef5e54` | 已整合（`1a67c9947`、`2a6633a01`）；BB-C 02:08：樓梯間、地板 PASS |
| PERF-WZ-DAY-1103（溫州街白天 1% low 7 fps） | 分析＋探針 `922445a2c` | CC-C 排進 PC 佇列（cc-testing `aee4a284b`）：PERF_WZ_SPLIT、FPS_WZ_ORDER。**PC 還沒跑到**：cc-local 03:1x 最新還是 V20R_* |
| ADE-SEATS-NAV-1104（阿德影印座位、打工站位） | `b61050c52` | LAWWW-C `bea8fbbed` 已接；CC-C 探針三處改了（`13bdfcdeb`），等重跑 |
| TONGXIAN-REF-1105（同弦店內照參考圖：camRef 重選、書架搬西牆、吊盆） | `b49d3016b` | DELIVERED LAWWW-C、BB-C；README 在 `wip/tongxian_ref_1105/` |

### 佇列（照順序）
0. **先將就的待辦**：`TODO_SHORTCUTS.md`（17 包，使用者 11-05 09:3x 要求列進待辦）。下一步先做：新生南路三間窗景（XS-WINCARD）→ 木曜日窗景 → 望月台、體育館 Blender 正式外觀（XS-GATE-NORTH 先將就 1）。
1. **PERF-WZ-DAY-1103（P1）**：PC 數字回來就照 `wip/perf_wz_day_1103/README.md` 的表決定修哪一項。
   - 路人換正式模型的尖峰：LAWWW 的 game3d.js，我寫 patch。
   - shader、貼圖、draw call、陰影：我的檔。
2. **TONGXIAN-REF-1105 回饋**：BB 判、CC 遊戲內 camRef 同角度。BB 如果要線條對位，就改回舊 camRef（README 有兩邊的數字）。
3. HAIR-NOODLE-1104：等 CC 的近景探針（HAIR_1104）。
4. 2:30 AM 剩下的：轉角白盆小樹、側窗一整排；垂藤看 CC 近看再決定。
5. 舊的待辦：LM-SEAM-GEO（男一舍牆接頭）、BALCONY-POTS（P3）、INCR 記帳。
   - tasks.json 裡我還有很多「待開工」（山嵐書店、南洋戲院、溫州街兩家咖啡廳、運動用品店、速食店…）。照 D99 不自己插隊，等 LAWWW-C 排。

### 這一班學到的（之後的人小心）
- **bmesh 不能用「頂點數」分新舊**：刪過頂點（倒角方塊會刪）以後，新頂點會補進空出來的位置，排在舊的前面。
  - 同弦 v4e 第一版因此把吊燈電線轉到牆外。
  - 要分新舊就先替舊頂點標一個整數層（`tongxian_interior.py` 的 `_mark_old`）。
- **預覽要用 EEVEE 看顏色**（`glb_preview.py` 第 6 個參數 eevee）：Workbench 不畫頂點色，也不畫發光；同弦的書架看起來像一整塊白。
- **same_angle_check 雲端裝得起來**：`python3 -m venv`＋`pip install opencv-python-headless scikit-image`（scratchpad，PyPI 通）。以前寫「裝不起來」是舊的。

## 🔨 （舊）現在在做（11-04 21:2x UTC，帳號 C LAWWW2-C）
- 使用者 15:3x 說：「你繼續做別的事情我要睡覺了很久都不會看」（UA-LAWWW2-1104-07）。照排定的順序自己做，每段做完就 push；要使用者決定的記在下面，等他回來再問，不叫醒他。

### 本班交件
這幾件都還沒在瀏覽器看過，等 CC 拍、BB 判：
- **ADE-V2-1104 第二輪（阿德 v2.1）**：`b0160dc98`，LAWWW-C 接進 `d63fed15e`。
  - BB 在 Blender 階段判 PASS。遊戲裡同角度：消失點 2.0%、縮放 0.86，不擋發布。
  - 等 ADE_v2_shots 拍完，BB 才標 ART_APPROVED。
- **TEACH-PTBOYA-REF-1104**：v2 `e030cc9af`（接進 `71281be8e`）、v2b `9be98513b`（接進 `031cb3e01`）。等 CC 遊戲同角度（`--mode campus`）、BB 判。
- **SOCLIB-2F-1104**（社科院圖書館 2 樓）：第一版 `d393b6f3c`（LAWWW-C 17:44 ACK、子代理接線中）；**第二版**（BB_260 §5 四點）見 outbox 最新一筆。**MODEL_READY**，說明在 `wip/soclib2f_1104/README.md`。
  - 第二版只換配置、區域程式、GLB＋光照貼圖，接線 patch 不變。
  - 等 LAWWW-C 換檔、加讀書的人；再 CC 拍 11:00／20:30（直向、橫向）、跑真實流程，BB 判。窗會不會太亮要看 CC 的遊戲畫面。
- **ADE-PROPS-1104**：`c73d37367`，LAWWW-C 接進 `1a191554d`。LAWWW-C 另外修了電線桿擋到的腳踏車停車處。
- **WZ-FIVE-1104 2:30 AM 外觀第二版**（BB-C 19:02 四點）：`75383530f`，取代第一版 `69e953668`。只換 `cafe_exterior.glb`／`.json`，程式不用改。說明在 `wip/wz_five_1104/cafe230_exterior.md`。
  - 店內窗卡（AA cafe230.glb 開燈拍）、五盞鵝頸燈朝招牌、細長透明垂藤、門口木椅、轉角側牆兩盞壁燈＋灰泥調暖。refcam 也在 README（鏡像參考圖、50.2 mm、shift_y 0.0775）。
  - 木椅不用加阻擋（原本的 blockRect 蓋住）。畫架是舊問題（blockCircle 只擋一格）：建議 zones3d.js 一行改 blockRect，`tests/cafe230_ext_nav_unit.js` 原樣 ② FAIL、套用後 ALL PASS。LAWWW-C 決定。
  - **LAWWW-C 20:59Z 接進開發分支 `6f61ca095`**（ACTIONED；含畫架 blockRect，Node 111 支 0 失敗）。瀏覽器測試、refcam 同角度交 BB／CC。
  - BB-C 20:57Z：Blender 階段 PASS，ART_APPROVED 等遊戲裡的 refcam 疊圖。P3：垂藤在 Workbench 疊圖裡一格一格（Workbench 不畫透明）——等 CC 門口近看，遊戲裡也這樣再加大 `ivy_strands.png`。
- **TEACH-EAST-DRAWCALL-1104**（BB-C P3）：`d164ac9a8`。普通、博雅一棟 4 個網格、1 個投影（原本 6＋3、8＋5），teach_east 估 243 → 237；外觀不變。說明在 `wip/teach_east_drawcall_1104/README.md`。
  - 附 `campus_glb_integration_boya_plates.patch`：博雅匾額清單補 `PLATE_FACE_BOYA_GARDEN`（v2b 以來就會 FAIL 的舊問題）。
  - 已傳 LAWWW-C（副本 BB-C），DELIVERED。等換檔、CC 跑 `campus_glb_integration.py`。
- **SEATFIG-LOD1-HAIR-1104**（BB P3，替身頭上的方塊）：`30c0ae20e`。遠處版從近處版再減、脖子以上不減，400 → 800 面；只換 `seated_figures.glb`／`.json`。等 LAWWW-C 換檔、CC 用 SITAMB_CLOUD_1104 ⑧ 同鏡頭重拍。
- **NPC-ANIM-LOOPS-1104**（LAWWW-C 派工）：`2962616ac`。坐在桌前做事的七個循環動作，女生、男生 VRoid 骨架各一份（14 個片段），加上右手配件（紙杯、手機、筆）。說明在 `wip/npc_anim_loops_1104/README.md`。
  - Node 測試 `tests/sit_task_loops_unit.js` 在開發分支 ALL PASS：遊戲換算出來的手的位置和預期差 ≤ 0.1 cm。
  - 等 LAWWW-C 接線（manifest、SEATACT 選片段、手臂吃片段、配件開關），再 CC 拍、BB 判。
  - 女生 VRoid 坐在 0.75 m 的桌前，桌子在胸口（遊戲的坐姿高度配上 VRoid 女生比較短的身體）：已寫進 README，要改是 LAWWW-C 的坐姿高度。
- BB-C 19:02 判 2:30 AM 外觀 v1 的四點（BB_255 `1e30e2b85`）：第二版 `75383530f` 都做了（見上一項）。

### 佇列（照順序）
1. HAIR-NOODLE-1104：等 CC 的近景探針（cc-local 21:2x 還沒有 HAIR 的結果）。
2. 2:30 AM 剩下的：轉角白盆小樹、側窗一整排（BB 說慢慢補）；垂藤貼圖看 CC 近看再決定。
3. 舊的待辦：GG-SHOPS-INTEG、LM-SEAM-GEO、BALCONY-POTS、INCR 記帳。（ART-PHOTO-CMP-1021 11-01、SOC-COURT-1021 10-21 早就交了，清單過時已拿掉；KOMICHI-VIEW-POLISH 21:4x 在做）
- OPEN-SRC-2D3D 收尾做完（21:2x）：`research/OPEN_SRC_2D3D_1104.md`（R1、R2、HDRI 都是 PROPOSAL，交 LAWWW-C）。

### 記住（別的 AI 交代的做法）
- 挪溫州街、公館的電線桿或機車排，要一起跑 `tests/bike_park_1104_unit.js`：腳踏車停車處照機車排的兩端算，電線桿擋到會 FAIL（LAWWW-C 11-04 18:15）。

### 等使用者回來再問（不叫醒）
- OPEN-SRC-2D3D：要不要用使用者的參考圖試 TRELLIS.2 線上 demo？要上傳到外部服務，所以要他同意。
- 網域（使用者的訊息重新送到，20:1x 回了）：
  - 給了一份可以直接複製的清單（現在被擋、用得到的 20 個：`*.hf.space`、blender.org 三個、poly.pizza、幾個 CC0 貼圖站、MakeHuman、arxiv…）。
  - 也說了可以直接選比較寬的網路等級，不用一個一個加。他決定。

### 沒有遠端備份的
- 沒有。scratchpad 裡只有預覽渲染和烘焙暫存，成果都已經 push。

## 🔁 交班（11-04 09:1x UTC；帳號 A LAWWW2；使用者說「現在交班」，LAWWW 09:04 轉使用者：交班後不用再每小時啟動）
- 分支 `claude/second-ai-env-art`。成果最後一個 commit 是 01b2b4786，交班紀錄在它後面；SHA 以 ls-remote 為準。worktree 是乾淨的。
- 每小時保險喚醒 trig_01PZ1NbK8H7GTeNrK3Q9bHLh 已停用（enabled=false，沒有刪）。我沒有排還沒觸發的 send_later。
- 規則來源（RULE_SOURCE）：`origin/claude/confident-ritchie-8rwh7t`（duty.json）。

### A. 本班已完成成果（11-04 07:4x～09:0x）
| 任務 | commit | 測試 | 整合 |
|---|---|---|---|
| WZ-LANEEAST-TRIS-1104 溫州街 lane_east 減面（店內按店拆網格、水果減面不投影） | 1d64f3511 | street_props_nav_unit ALL PASS；PC：lane_east 419,713 tris PASS（LAWWW 08:53） | 開發分支 d2a692410 |
| PERF-GG-DC-1104 停著的腳踏車照材質合併（patch） | 742c78c50 | bike_unit、bike_shop_park_unit ALL PASS | 8f936f018 |
| GG_night 判讀：打烊乘數 0.18 → 0.03（原因是 gamma） | 訊息＋gg_cards_1104/README | 沒在瀏覽器驗過 | 8f936f018；CC 排 GG_night_r8 |
| CAFE230 光照烘焙用 AA v1f（30c2d5998）重烘 | aede8b99a | 只看了光照貼圖圖集 | 8f936f018 |
| WZ-YIZHAN-1104 一盞前院第二版：生垣、對面一間一間的店面、樟樹不碰簷 | 26bc41c6b | wz_teahouse_yard_unit ALL PASS | **還沒接** |
| WZ-FIVE-1104 小路深色木立面 v1 | 188eb0624 | street_props_nav_unit ALL PASS | 060a1a093 |
| gongguan_glb_integration 量法第二版 patch（騎士、npc_far 比照路人移出；BB 定） | 01b2b4786 | py_compile、node --check、Node 模擬選取 | **還沒接**，接 bf9518378 |
- 都沒有發布，只在開發分支，或還在我的分支上。
- 之前的班交的（WZ-SECOND-1104 v3b、SUNNY 轉角窗、一盞前院 v1、公館窗卡、glow patch、census）寫在下面的舊快照。

### B. 全部未完成工作（本機任務清單的狀態可能過時，以 tasks.json 為準）
- **等 PC（CC）驗**：
  - GG_night_r8（含量「底」那段 JS）；
  - GG_glb_measure（停車合併＋新量法；目標 ≤ 1.3）；
  - CAFE230 截圖；
  - 小路正面白天和晚上（060a1a093）；
  - 一盞前院 engawa_to_yard、yard_to_genkan；
  - WZ-SECOND-1104 五間 × 白天、晚上；
  - GG-VIEWS-1104 窗景重拍；
  - BIKE-PARK-1104、木曜日整合包、新生南路的瀏覽器測試。
- **BB 判 ART_APPROVED**：WZ-SECOND-1104、WZ-FIVE-1104（小路、林家、SUNNY）、一盞前院。
- **WZ-FIVE-1104 第一批還沒做的**：阿德轉角外觀、2:30 AM 外觀。
- **公館 draw call 如果用新量法還超過 1.3**：bike_ride.glb 的座墊、車燈併進 ride_vc（騎士一台 −2），或遠處的騎士用合併好的車。
- **WZ-SECOND-1104 還差的**（README「還差的地方」）：書屋玻璃偏霧、帝大紅茶店內調整、溫州書屋櫥窗台、冰菓室窗口被布簾擋。
- **一盞前院還差的**：生垣是平的一塊、對面招牌沒有字。
- **INTERIOR-AAA 室內光照**：library_b1、us_market（做到一半）、jp_room。
- **其他還開著的**（之前的班留下的，本班沒碰）：
  - 總圖室內照實際配置；
  - LIB-3F-1102；
  - 總圖展演廳第三版（BB_244）；
  - CAMPUS-BLACKFOREST-1102 黑森林重做；
  - 校園系館相對位置照官方地圖、舊社科院的名字；
  - PERF-CAMPUS-GLB-1102；
  - D108 新生南路（側門外遠景、七家店面、地面、山嵐／木曜日接區域）。
- AA 換 aa_support 的 cafe230.glb 時，要重烘（LAWWW 08:4x）。

### C. 正在做的工作
- 交班那一刻手上沒有做到一半的模型。下一項原本要開始做阿德轉角外觀，還沒動。

### D. 最新決策與規則（本班收到的；原文在 LAWWW 的總表）
- BB 11-04 08:5x：gongguan_glb_integration 的騎士和 npc_far 比照路人先移出再量，門檻 1.3 不變（CC 2ef943d99）。
- 使用者 11-04 09:0x：交班後不用再每小時啟動（D129 已有，照做）。

### E. 跨 AI 協作狀態
- LAWWW：
  - 已經 ACK，也照做了：1d64f3511、742c78c50、乘數 0.03、aede8b99a、188eb0624。
  - 送達了，還沒 ACK：26bc41c6b（一盞前院第二版）、01b2b4786（量法 patch）、本班的交班通知。
- AA：重烘的 ACK 送達了。
- CC：GG_night_r7 的 ACK 送達了；r8 等 CC 排。
- BB：截圖驗收都還在等。

### F. 測試與問題
- 本班的測試都是 Node 單元測試和 Blender 渲染。**瀏覽器、遊戲內截圖一張都沒跑**（D131 排 PC）。
- 只在 scratchpad 的：Blender 估算（cull.py）、渲染中間檔、tree_fit 掃描、暫存的開發分支 worktree（devwt_bk、devwt_gm、devwt_y）。要交的結論、patch、對照圖都已經放進 wip/ 推上去了。
- iPhone 實機：都還沒有。

**交班紀錄不代表新帳號已經接班。**

## 📌 進度快照（11-04 08:5x，LAWWW2；還沒交班）
- 分支 `claude/second-ai-env-art`，最新的 SHA 用 ls-remote 核對。
- 這一輪交件，LAWWW 都接了（開發分支 d2a692410、8f936f018）：
  - 溫州街 lane_east 減面（1d64f3511）：店內一間一個網格，水果減面、不投影。
  - 公館停著的腳踏車照材質合併（742c78c50 的 patch）。
  - 打烊乘數 0.18 → 0.03：原因是 gamma，判讀寫在 gg_cards_1104/README。
  - 2:30 AM 用 v1f 重烘（aede8b99a）。
- 已交件、LAWWW 還沒回：一盞前院第二版（26bc41c6b）。BB 07:55 提的兩點：竹籬外加生垣、對面改成一間一間的店面、樟樹不碰簷。
- 等 CC 在 PC 上量：GG_night_r8（含量「底」那段）、GG_glb_measure（停車合併以後；騎士和 npc_far 的量法請 BB 判）、CAFE230、lane_east 真數字。
- 下一步（WZ-FIVE-1104 第一批還沒做的）：小路深色木立面、阿德轉角外觀、2:30 AM 外觀。
- 公館 draw call 如果還超過：把 bike_ride.glb 的座墊、車燈併進 ride_vc（騎士一台 −2），或者遠處的騎士用合併好的車。

## 📌 （舊）進度快照（11-04 07:4x，LAWWW2，用量 93%：還沒交班，先保存）
- 分支 `claude/second-ai-env-art`，最新見這次 push（ls-remote 核對）。
- 已交件、LAWWW 已接：WZ-SECOND-1104 v3b＋SUNNY 東側轉角窗（3de4ef933）、一盞前院（b0bcc117c，開發分支 b53bfab72）、公館打烊光暈（fdd2593a1 → 5eab062b7）。
- 已交件、待 LAWWW 接／CC 跑：gongguan_glb_integration 量法一致（89788745a，瀏覽器沒跑過）；SUNNY 窗景卡（a485b6722，給 AA）。
- **進行中（P1，擋 v9.10.20）**：GG_night 窗卡前 0.5 m 那個沒名字的網格——已排除套件店面、公館群組內載入前的東西、GLB 內網格、光暈批次；請 CC 跑診斷段（07:3x 給 LAWWW 的訊息）拿到父節點鏈再做 patch（接 75a095355）。
- 下一步：小路深色木立面、阿德轉角外觀、2:30 AM 外觀（WZ-FIVE-1104）。
- 暫存 worktree 的 diff 備份：`docs/art-rebuild/second_ai/wip/wip_backup_1104/`。

## ⚠️ 新規則 D131：已併入開發分支 `CLAUDE.md`／`docs/rules/ROLE_LAWWW2.md`（RULES-CONSOLIDATE-1110），這裡不再抄。

## 🔨 現在在做（11-04 06:4x UTC 更新）
- **WZ-SECOND-1104（使用者 05:4x 直接交辦）溫州街第二批五間：MODEL_READY，已交 LAWWW**。溫州書屋、常在洗衣、帝大紅茶、夏日冰菓室、阿忠鮮果，都不能進去。
  - 文件：`wip/wz_second_1104/README.md`；對照圖：`v2_ref_before_after.jpg`。
  - 導航沒動；`tests/street_props_nav_unit.js` ALL PASS。
  - 室內參考圖 5 張沒收到，已請使用者補傳。
  - 遊戲截圖要 CC 在 PC 拍。
- 一盞前院（WZ-YIZHAN-1104）：WIP 4a5c97140，暫停。單元測試修改後 ALL PASS、修改前 9 FAIL；其他茶屋相關測試沒跑完。
  - 下一步：接 AA 的室內 v1（13994dfdd）一起量 → 溫州街那一側的冠木門。
- 審查：
  - 小路 v1c：MODEL_READY。
  - SUNNY SIDE v1：卡座 2 個座位走不到，已給 AA 修法。
  - 阿德室內 v1（CC）：7／8 走不到，退回 v1b。
  - 一盞室內 v1：等前院一起看。
- 工具：`tools/dev_scratch/shopchk2.js`、`shopmap2.js`（021262b9b），給 AA、BB、CC 用遊戲的導航格量座位。
- 阿德外觀價目牌改成 NT$2（`textures/src/wz_cards/wzade_price.jpg`），等阿德轉角外觀做的時候用。
- 第一批還沒做：小路深色木立面、阿德轉角外觀、2:30 AM 外觀（cafe_exterior.py）、五間的窗卡、cafe 重烘。

## 🔨 （舊）11-04 04:5x UTC
- **WZ-FIVE-1104 溫州街第一批五間**（使用者 04:4x 定案，AA_654 §6）：
  - 我做五間的外觀、招牌、窗卡、烘焙。室內：2:30 AM、小路、SUNNY SIDE 是 AA；林家是 BB；阿德是 CC。
  - 門窗數字已經給 AA、BB、CC（04:5x，照 cafe_layout.py 和 wz_shops_layout.js，房間、門、出口都不動）。已請 LAWWW 列出不能動的劇情座標。
  - 05:1x 進度（WIP，wenzhou_street.glb 在 a4c2cc05f 之後，不要整合）：
    - 已做：招牌、價目牌、暖簾、黑板、門、營業時間牌（11:00–02:30）從參考圖裁好（sign_atlas 的 wz_*_h、xs_front_tex 的 QW）；SIGNMAP 的 A4、B3、B7、A1 換新招牌。
    - 林家：深綠雨遮、不鏽鋼攤車、白磁磚。
    - SUNNY SIDE：綠白條紋雨遮、深綠框落地窗（sf frame／grid）。
    - 小路：木招牌、暖簾、紅燈籠（sf lantern）、黑板立牌。
    - 比較圖：docs/art-rebuild/second_ai/wip/wz_five_1104/fronts_wip3_vs_ref.jpg。
  - 還沒做：
    - 小路一樓立面還是淺色（參考圖是深色木）；
    - 阿德（A2 轉角的 COPY_ 兩種外觀）；
    - 2:30 AM 外觀（cafe_exterior.py，深綠飾帶、奶油色牆、木門窗）；
    - 五間的窗卡（等室內 MODEL_READY）；
    - cafe 重烘；
    - props.json 的雜物位置有變，交件時 LAWWW 要更新導航阻擋。
  - 2:30 AM 室內 AA v1（0963f3cb5）：導航過；美術退回 v1b（護牆板、吊燈、層架、深色天花板、地毯）。
- 今天交出去的（都已 push）：
  - 公館 GLB e0560b289：窗卡 v4、頁間盆栽、白天光暈 0；
  - 斑馬線＋公館視距 305ef2d2a（LAWWW 已接 9ac863212）；
  - 新生南路側門遠景 db7679c01；
  - gg_ext_nav2 f936fd2c8。
- 等別人：
  - CC GG_groups 清單（群組差 1）；
  - BB 公館 FPS 交錯 3 次（差 ≥5 FPS 就退掉暗窗、抽油煙機罩的攤平）；
  - PC 截圖。

## 🔨 之前（11-04 03:1x UTC）
- 分支 `claude/second-ai-env-art`，最新見 `git log -1`。
- **11-04 02:3x 以後交出去的**（都接開發分支、Node 測試全過；瀏覽器測試照 D131 排 PC）：
  1. 公館外觀 v1b：afar 招牌改用新參考圖的小寫 afar（498181d29）。LAWWW 已接。
  2. 溫州街 A5 改日和便利店；公館 G03 招牌照透視重裁（93dbf8b99）。LAWWW 已接（4e3f6ccef）。
  3. **BIKE-PARK-1104**：各建築出口、區域入口附近的停車架和停車位。
     - patch 和距離表在 `wip/bike_park/`（77a599c60，接 7d5d5fff4）；新測試 bike_park_1104_unit。
     - 等 LAWWW 整合、PC 跑 reachability／campus_glb_integration。
  4. **GG-VIEWS-1104**：日和、頁間、青木、溫州街 A5 的窗景重拍（`wip/gg_views_1104/`）。
     - A＝拍照腳本的位置，已請 CC 排 PC；
     - B＝zones3d 接法，照片進來以後才套。
  5. 審查（紀錄在 `wip/shop_review_1103/README.md`）：
     - afar v1→v1b、Daybreak v1→v1b 都 MODEL_READY；
     - 洋洋 v1b、v1c 都 MODEL_READY，ART_APPROVED 等遊戲內截圖（這間由我標）。
  6. 公館三間室內走不到的地方：已請 AA 改青木（吧台西端縮 0.5 m）、頁間（茶几南移 0.6 m），BB 改日和（貨架中心 −3.7／−1.7／0.3）。等他們交件以後我驗走道。
- **還沒做／下一步**：
  - 洋洋的桌面光圈（烘焙或 SpotLight，等 LAWWW 接成區域）。
  - 公館四間新店的窗卡換成室內模型的渲染圖（afar、Daybreak、洋洋接好以後）。
  - 新生南路側門外的遠景（圍牆後現在是空地）。
  - 新生南路室內整合（大口、南洋、山嵐…）。
  - 木曜日 P3。
- **注意**：`wz_street.py` 要寫成 `-- --set gongguan`。`sign_atlas.py` 要 scipy（沙盒用 `pip install scipy`）。`xs_front_tex.py` 要給參考圖資料夾（`$SP/refall` 或企劃線的 ref_images/shops）。

## 🔨 之前（11-04 01:5x UTC）
- 分支 `claude/second-ai-env-art`，最新 `8de87af16`。
- **11-04 00:4x 以後交出去的**（都接開發分支、Node 測試全過；瀏覽器測試照 D131 排 PC）：
  1. SPAWN-EXIT-1104：新生南路、木曜日六個出生點移到出口範圍外＋`tests/spawn_exit_unit.js`（7940369f0）。LAWWW 已整合（dc5c8c78d）。
  2. 日常失速 WZ-OFFBEAT-1104：溫州街 W2 外觀照參考圖＋區域 wz_offbeat（82d541853）。LAWWW 已整合。
  3. 同弦二樓窗景圖 `wip/xinsheng/views/tongxian_view_day.jpg`＋腳本 `xs_window_view.py`（657f27eea）。CC 已換進 v4d。
  4. 審查：大口 2F v2、南洋大廳 v5b MODEL_READY；大口 1F 退回 v2b（f15ac2f5c）；頁間書屋室內 v1 退回 v2（訊息，七項）。
  5. **公館四間新店外觀 v1**（使用者 01:0x，AA_647）：`wip/gongguan4/`，patch 接 e678da595（8de87af16）。
     - 等 LAWWW：頁間書屋的互動點移到 x −36.4。
- **還沒做／下一步**：
  - bikePark（AA_646）：各建築出口標停車點＋停車架。
  - 新生南路室內整合（大口、南洋、山嵐…）。
  - 室內收了以後，四間公館店的窗改成渲染室內模型。
  - 新生南路側門外的遠景（圍牆後現在是空地）。
  - 木曜日 P3。
- **注意**：`wz_street.py` 要寫成 `-- --set gongguan`（沒有 `--` 會用錯招牌貼圖集）。

## 🔨 之前（11-04 00:5x UTC）
- **LAWWW 已經整合**（開發分支 aa8cb5beb）：新生南路區域、木曜日。瀏覽器測試已經派 BB 排到 PC。
- **新生南路店面 v1**（ART-XINSHENG-FRONTS-1104）：已交 LAWWW，patch `wip/xinsheng/xinsheng_fronts_v1.patch`（接 a141fce2c），WORK_IN_PROGRESS。
  - 做法：從參考圖裁出貼圖（`xs_front_tex.py`）＋3D 框、招牌板、騎樓。說明在 PLAN.md 最後一節。
  - 下一步：
    - 山嵐的白磁磚飾帶、深色柱子；
    - 同弦二樓吉他窗太暗；
    - 地面、行道樹；
    - 側門外遠景；
    - 每家 ref_match。
- **店面驗收**（紀錄在 `wip/shop_review_1103/README.md`）：
  - 收（MODEL_READY）：木曜日 v3b／v3c、燒臘 v7、好拍 v2、大步 v2、山嵐 v5、日常失速 v3c、同弦 v4、南洋大廳 v5（加近景物件 B）、南洋 1 廳 v2。
  - 等：BB 大口漢堡；CC 運動廣場、好拍 v2b、大步 v2b。
- **BB PC 回報的兩項 FAIL**：
  - 六法鏡頭：在 d2b962a3f 測的，那一版沒有 c6814325c 的修正，已請 BB 在新版重測；
  - 橘貓：方向由 rub.dir 亂數決定，不是 bug，已說明。
- **接下來由我接成區域**：
  - 山嵐（xs_shanlan，兩層）；
  - 日常失速（溫州街 W2 一樓）；
  - 南洋（大廳＋1 廳斜地板）；
  - 好拍、大步、同弦、燒臘、大口漢堡。

## 🔨 之前（11-03 20:5x UTC）
- **總圖第五版：BB ART_APPROVED（20:14，第二輪 `52dbf7f8e`）**。條件：LAWWW 整合後，候選版的 flow_library_floors、flow_library_scene、nav、reachability 都要 PASS。patch 是 `wip/library_v5/library_v5_1103.patch`。
- **研究小間讀者第二版**：已交 `12ac5e5f9`。
- **AA 室內驗收**：
  - 木曜日 v2 收（MODEL_READY）；
  - 山嵐 v3（企劃線 65e2308cc）收（MODEL_READY，20:5x）。
  - 接下來由我接成區域：山嵐兩層導航（levels、stairs、void，格式照 wz_shops_layout）、木曜日的一樓鐵門和樓梯、烘焙、遊戲截圖給 BB。
- **D108 新生南路（ART-XINSHENG-GATE-1103）WIP**，全部在 `wip/xinsheng/`，`PLAN.md` 寫得最完整：
  - LAWWW 同意校園側門、溫州街西端（20:20、20:24）。
  - layout v2：店的順序照 AA_617 的路線。
  - 街景 GLB 是 BLOCKOUT：`wz_street.py --set xinsheng`。
  - 新區域 `src/xinsheng3d.js`、校園側門 (−124, −84)、溫州街西側橫巷北口（拿掉遠景 F4），都在 `xinsheng_zone_WIP.patch`（接 b049c84e3）。
  - xinsheng_unit 16 項 ALL PASS；第一次遊戲截圖在 `game_wip_v0.jpg`、`campus_gate_v0.jpg`。
  - **下一步**：
    1. 側門外的遠景改成新生南路（`gg_backdrop.py` 那一段，PLAN「下一班的順序」）；
    2. 七家店照參考圖做店面；
    3. 地面、校園那一側的正式模型；
    4. index.html、manifest、瀏覽器測試；
    5. 交 LAWWW。
- **今天交過的**（都等 LAWWW 整合，v9.10.19 以後）：
  - 秀琴姨第四版 `d2a809aa4`；
  - 蘇姨第二版 `7dc6db1ec`；
  - 茶屋座位＋六法＋鏡頭 via `c43b12aa2`；
  - 總圖第五版 `52dbf7f8e`；
  - 研究小間讀者 `12ac5e5f9`。
- **還沒做的佇列**：
  - 宿舍門口在跪姿接上以後重拍；
  - 辛亥路東北的草地；
  - 總圖 P3（研究小間的窗偏灰、新書色塊、門都一樣、小房間牆面）；
  - 好拍、運動廣場、大口漢堡、公館燒臘的室內（BB／CC 分工，我負責接區域）。

## ✅ 值班登記（2026-11-03 08:2x UTC＝16:2x 台灣；使用者：「你上次交班之後沒有其他帳號接班 繼續工作」）
- 值班登記：帳號 A｜LAWWW2｜session_01AC1WVgJSmoJK1uRsPK2Zn1｜分支 claude/second-ai-env-art｜接班基準 `b5c2e47c0`｜2026-11-03 08:2x UTC
- 上一班：帳號 A｜LAWWW2（同一個工作階段）｜最後 commit `b5c2e47c0`｜正常交班（11-02 22:5x）；之後沒有人寫入本分支。
- 離開期間：LAWWW 已把**宿舍閣樓（DORM-LOFT）**、**總圖 B1 落點**併進開發分支（`c89a5f9be`，int/m591）；法學院區重排**還沒整合**（等我測完交件）。LAWWW、BB 11-03 02:0x 交班；tasks.json 給我的下一班三件（BB 代轉）：PERF-WZ-DAY-1103（溫州街白天 1% low 7 fps，P1）、BAKE-PC-1102-S2（BK1 亮度一致；大場景、HIP 跑兩次）、ART-OLDROAD-SHELF-1103（舊路書房書架背板木紋）；LAWWW 11-02 22:5x 的宿舍梯子兩件（頭穿天花板、靠床那側握把＋grips）。
- 接下來：①法學院區重排把沒跑完的 6 支瀏覽器測試＋前後截圖跑完 → 交件；②PERF-WZ-DAY-1103（P1）；③BAKE-PC 第二輪；④舊路書房書架；⑤宿舍梯子。

## 🛑 交班（2026-11-02 22:5x UTC，使用者「現在換班」）——帳號 A LAWWW2 停止寫入
- **交班登記**：帳號 A｜LAWWW2｜session_01AC1WVgJSmoJK1uRsPK2Zn1｜分支 `claude/second-ai-env-art`｜最後 commit 見這一節的 commit（push 後 ls-remote 核對）｜正常交班。**交班紀錄不代表新帳號已接班。**
- **下一班第一步**：fetch → 讀這一節 → `docs/handoff/user_asks_LAWWW2.json` 的 UA-LAWWW2-1102-15／-16（進行中）→ 下面「①法學院區重排」的「還沒跑」那幾支瀏覽器測試。
- **D75**：不要 send_message 給帳號 A 的這個工作階段。

### ① LAW-RELAYOUT-1102＋黑森林 v4（使用者 P0，UA-LAWWW2-1102-15、-16）：`WORK_IN_PROGRESS`，還沒交件
- patch：`docs/art-rebuild/second_ai/wip/blackforest/law_relayout_blackforest_1102_wip.patch`（對 int/m590 `0e11c43a3`，apply --cached --check 過；最後一版 `d73588749`）。二進位：`assets/models/env/second_ai/campus_blackforest.glb`、`.json`（v4，已 push）；配置 `src/data/blackforest_layout.js`（v4）＋`tools/blender/env_second/campus_blackforest_layout.py`。
- 說明：`wip/campus_relayout/README.md` 最後一節、`wip/blackforest/README.md` 的 v4 一節。萬才館 (90,−100)、正面照舊朝南（已告訴使用者）；國青 (65,−119)、研三舍 (63,−108)、小湖、黑森林 1,572 m²／81 棵；電機二館讓到 (119,−62)。
- **已測（雲端）**：校園相關 Node 單元 172 支全部 ALL PASS（22:47；bike_unit、socsci_place_unit 修過測試的座標範圍，沒放寬標準）；瀏覽器 `campus_layout_nav` ALL PASS（22:49，含 5 個舊存檔位置）。
- **中斷**：`flow_wancai_stairs` 跑到一半（讀檔到陽台、走到陽台東側都 PASS）被交班停掉，**沒有結論**。
- **還沒跑**：`flow_wancai_stairs`（重跑）、`flow_wancai_floors`、`tap_floor_levels`、`zone_transitions`、`wancai_glb_integration`、`reachability_all --zones campus`、前後截圖（`scratchpad/lr4/before.json`／`after.json` 的 8 個鏡頭：鳥瞰、照片 2 小湖、照片 5 土徑、萬才館正面、國青研三舍…；before 用 int/m590＋總圖 patch 的樹，after 用整包 patch）。腳本 `scratchpad/lr4/chain.sh`（**scratchpad 沒有遠端備份**：重建方法＝`git worktree add --detach <dir> 0e11c43a3`＋`git apply` 上面的 patch＋複製 GLB）。
- 跑完以後：把結果寫進兩份 README → 交 LAWWW（他 22:4x 已 DELIVERED 知道 WIP、舊黑森林 patch 不要整合）→ 截圖交 BB 驗收（D128；BB_248 要照片同角度）。
- 實機沒測。

### ② DORM-LOFT-SCALE-1102：`ART_APPROVED`（BB_249）、瀏覽器 4 支全部 ALL PASS（22:43）——已交 LAWWW（DELIVERED），等他整合
### ③ 總圖 B1 落點修正：`library_b1_spawn_fix_1102.patch`（`wip/library_b1_v4/`）——Node 6 支 ALL PASS，瀏覽器 reachability_all 沒重跑；已告訴 LAWWW（DELIVERED）
### ④ 總圖其他（q4 那輪的結果，devwt_k）
- flow_library_floors／flow_library_scene 被我自己中途停過（22:08 為了森林截圖），**要重跑**；reachability_all 失敗的就是 ③；seats_on_furniture hall／3f 是測試 launch 沒指定 Chromium 路徑（環境問題）→ 用 `scratchpad/pwrun.py` 包起來重跑（不改測試）。
- campus_glb_integration 效能那一項 FAIL（gate_avenue draw call 1.15 倍、avenue 1.17 倍；PERF-CAMPUS-GLB-1102 ②，還沒處理）。
- 3F（LIB-3F-1102）、展演廳第三版（BB_244）：README 的「還沒做」照舊（瀏覽器測試、截圖、交件）。
### ⑤ BAKE-PC-1102：工作單已在 CC 佇列（BK1_cpu、BK1_hip），等 PC 結果（經 BB 轉）→ `compare_bakes.py` 比對 → 通過才把 3F／展演廳烘焙交 PC。
### ⑥ 其他照舊的待辦：電機一館位置（等使用者選，建議 A）、系館名字 patch（`campus_relayout_names_1102.patch`）交件、us_market、jp_room、B1 烘焙。
### 沒有遠端備份的東西
- scratchpad 的 worktree（devwt_h/i/j/k/m/n/p/q/r）、測試 log、截圖、`lr4/`、`lib1102/q4/` 的結果檔——重要結論都已寫在這一節和各 README；patch、GLB、配置都已 push。

## 🔨 現在在做（11-02 20:3x 更新）：使用者 P0「總圖」——大廳第三版（展演廳，BB_244）→ 3F → 效能
- **⛔ D128（使用者 19:5x：「美術應該只需要給B驗收，或者你不用經過我」＋「全部交出去」）**：建築、場景 BB 標 ART_APPROVED；角色 LAWWW；畫風 LAWWW2 提案、BB＋LAWWW 同意。交件不寫「最終美術要使用者確認」。20:0x 已改 README、outbox（`f3ab9487b`），19:57 回 LAWWW、BB ACK。
- **今天已交件**：B1 4.1（已定稿 ART_APPROVED）、一樓二樓第二版（int/m590 `0e11c43a3`）、LIB-FRONT v3.1、v3.2（LAWWW 19:48 ACK：已進 int/m590）。
- **整合線**：LAWWW 的 int/m590 bundle（開發分支 `919a3a5f0` 的 `wip_backup/next1102_1102.bundle`）＝`0e11c43a3`；拿到 `refs/remotes/bundle2/int/m590`。
- **測試環境 `scratchpad/devwt_k`（20:0x 改的）**：`0e11c43a3`＋大廳第三版 patch＋3F patch（含黑窗修正）＋兩個新 GLB。Node 93 支 ALL PASS（20:04，第三版 GLB 還沒換進來）。
- **大廳第三版**：
  - 增量 patch：`scratchpad/lib1102/library_hall_v3_incr_1102.patch`（＝`wip/library_hall_v3/library_hall_v3_incr_wip.patch`）：library_layout.js、library_hall_v2.js、LICENSES（large_sandstone_blocks）、tools/shots/library_views.py（trees）。0e11c43a3 上乾淨。
  - 烘焙：20:01 開始（`scratchpad/lh3bake`），約 40 分鐘。
- **3F**：
  - bake2 20:01 完成：亮度探針 9 項 ALL PASS（人文庫木地板 0.30），GLB＋光照貼圖已推（`0f2d7445e`）。
  - 20:1x 截圖發現**白天的窗全黑**：`library_3f_v2.js` 的 applyTime 只在白天↔晚上切換時才套窗景，照片非同步載好以後一直沒換上。已修（每次都套、載好前用漸層、照時段調色）＋單元測試兩項（舊版 FAIL、新版 PASS）。patch `wip/library_3f_v2/library_3f_v2_1102.patch`（`97fbbb401`，接 0e11c43a3）。
  - 人文庫入口中間的黑條＝雙開玻璃門中間的門框（6 cm），只是鏡頭太近；重拍換斜的鏡頭。
- **PERF-CAMPUS-GLB ①**：雜訊原因找到（讀程式）：量的時候路人移出場景，這時 CHAR.upgrade 換模型，新的不進場景、量完放回舊的。只改 tests 的 patch：`wip/perf_campus_glb/`。瀏覽器還沒跑。
- **背景佇列（nohup，一次一個瀏覽器）**：
  - `run_q3.sh`：flow_lib_tour 兩輪（第一輪 devwt_i、第二輪 devwt_k＝最終組合，不是原本寫的第一版）。
  - `run_q4b.sh`（等 q3 done）：第二版驗收鏡頭 2 張 → 等第三版烘完、複製、Node → 第三版截圖 14 張 → 3F 重拍 10 張（`lib3f/shots2`）→ flow_library_floors、flow_library_scene、reachability_all（總圖三區）、seats（大廳、3F）、stairs_cam_browser、zone_transitions → campus_glb_integration（雜訊修正版）。結果在 `lib1102/q4/RESULTS.txt`。
  - 跑完：`python3 scratchpad/lib1102/make_lh3_grids.py <輸出>` 做對照圖 → 兩份 README、測試單 → 交件。
- **TEST-OFFLOAD-1102**：使用者 18:5x 同意（UA-LAWWW-1102-27），總表已開、暫停到 v9.10.16 發布、CC runner 支援。交件都附測試單。
- **之後**：
  - PERF-CAMPUS-GLB-1102（量測雜訊、四棟減 draw call）；
  - CAMPUS-RELAYOUT-1102；
  - us_market 第三版、jp_room 第十版交件；
  - FAIR-TENT-CAM → DORM1-WALL-SEAM → PUTONG101-WINDOW。
- **scratchpad worktree**：
  - devwt_i：`3e6855649`＋大廳 v2＋v3 配置；
  - devwt_k：`3e6855649`＋v3.1＋v3.2 GLB；
  - devwt_n：`3e6855649`＋大廳 v2（最後的 GLB）＋3F；
  - devwt_p：`3e6855649`＋B1 4.1。

## ✅ 接班（最新）：2026-11-02 03:3x UTC｜帳號 A｜LAWWW2｜`session_01AC1WVgJSmoJK1uRsPK2Zn1`｜分支 `claude/second-ai-env-art`
- 值班登記：`duty register` 帳號 A、LAWWW2、接班基準 `e16b32ad`（上一任 LAWWW2-B 的交班 commit），2026-11-02 03:37 UTC。使用者：「現在你接班，我也會通知其他AI，你交班之後先跟他們測試通訊功能，然後先確定其他AI留下什麼事情還沒有做，預計還要多久每個階段每個任務」。
- 上一任：帳號 B｜LAWWW2-B｜`session_01GV1WG3UeT2DhuDpxeWJsvD`｜分支 `claude/funny-albattani-iawshm`｜交班 2026-11-01 09:02 UTC（`duty handoff` 有跑，快照 `2026-11-01T0902Z_B_LAWWW2.json`）。交班紀錄在下面「🔁 交班（LAWWW2-B，2026-11-01）」。
- RULE_SOURCE：`origin/claude/modest-rubin-2lyp7g`（`duty find`：沒有人值班、上一任 B、HV-20、seq 42；LAWWW-B 2026-11-02 03:09 交班）。規則 SHA `02898d56`（AI_SESSION_HANDOFF.md）。讀過第 4、5、9 節、HV-19（子代理開工就推檢查點）、HV-20（duty sync 擋舊登記）、HV-21（分支稽核，LAWWW 的事）。
- 合併：我的分支 `ff339df1` 是 B 的祖先 → 快轉到 `e16b32ad`（656 個 commit，10-23～11-01），沒有衝突、沒有 rebase。交接工具 `tools/handoff/`、`tools/story/check_orphans.py` 取 RULE_SOURCE 版。
- 帳號 A 四個工作階段（LAWWW、AA、BB、我）03:3x 都在接班中（`list_sessions`）。
- **⛔ 使用者 03:5x（UA-LAWWW2-1102-01）**：讀書、期中期末考、司法官考試、職涯結局系統調整由 LAWWW、AA、BB 負責（總表 STUDY-EXAM-SYS-1102、STUDY-EXAM-CAREER-1102）；**LAWWW2 不碰**，照 GitHub 正式待辦繼續 3D 美術、場景程式、鏡頭、場景效能；新功能沿用現有教室、圖書館、自習空間，**只有 LAWWW 確認現有場景不夠並正式派工才做新的 3D**；不主動開新工作；交班制度照舊。
- **INTERIOR-AAA-REVIEW-1028 第 5 節「全部室內」光照（LAWWW 04:36 決定：照 D99「夠用的素材凍結」，先做經濟系、美國交換玩家會進去的幾間，其他排後面）**：
  - 還沒烘的室內 22 間（掃 `assets/models/env/` 92 個室內相關 GLB，有光照貼圖或第二組 UV 的 28 個）。經濟系那一年的地方（`ECON_3D_GAP_STATUS_1030.md`）都已經烘過，22 間裡沒有。
  - **us_market（美國交換的美式大型超市，SCN-US-03）交件中（11-02 04:4x～）**：定案烘焙（256 取樣、1024²）、遊戲內改前改後、新測試 `tests/us_market_lm_unit.js`（開發 `f2105305b` 原樣 FAIL 4 → ALL PASS）、相關 11 支 ALL PASS 都做完；README `docs/art-rebuild/second_ai/test_shots/us_market_lm_1102/`；patch `docs/art-rebuild/second_ai/patches/us_market_lm_1102.patch`（us3d.js 接光照貼圖＋晚上窗景照時段變暗——原本 20:30 窗外停車場還是白天）。全部 Node、西邊冷凍走道補拍、效能量測在 scratchpad 背景跑（`$SP/usmlm/`），跑完補進 README 再交件給 LAWWW；場景美術驗收找 BB（D120）。
  - **接著（LAWWW 04:40 定的順序）**：jp_room 光照（D99 第二項寒暑假日本）→ FAIR-TENT-CAM-1102 → DORM1-WALL-SEAM-1102 → PUTONG101-WINDOW-1102。BADMINTON-CLIP-V4-1102、NPC-POOL-ART-REST-1102 暫停（D99，11-09 再看）。
  - **排後面（D99 凍結，列著不做）**：總圖 library_b1（WIP 停在試烘，見下）、library_carrels、library_stacks、library_media；霖澤 linze_3f、linze_4f、linze_5f、linze_office；萬才 wancai_sema、wancai_semb；boya_203、gongtong_3f；宿舍 dorm_interior、dorm_205、dorm_laundry；118 巷 l118_cafe2、l118_home、l118_noodle2；溫州街 wz_lin_interior、wz_teishoku_interior；jp_room（寒暑假日本，D99 第二項：LAWWW 04:40 說要做，排在 us_market 後面）；us_lawlib_2f（樓上關著）。
  - **library_b1 WIP（11-02 04:0x～04:3x）**：`tools/blender/env_second/lightbake/bake_library_b1.sh`（輸入用遊戲裡現在那個檔的 git blob 53dfdbeb，不從 library_b1.py 重做——重做出來電梯樓層清單不一樣）、鏡頭 `tools/blender/env_second/shots/library_b1_lm_shots.py`。試烘第一版（512、props 也烘）：上千個小島排不進一張貼圖，只用到左下角，東邊隔間牆一大塊黑三角；第二版 props、metal 改即時光（64 取樣、1024）：貼圖排得好、平均 0.32。遊戲內第二版改前改後在 scratchpad（沒上傳），**還沒看完、沒正式烘（512）、沒寫測試和 README、沒交件**。**第二版的問題（11-02 04:3x 看第二版光照貼圖）：自習室東邊隔間牆那一塊黑三角照舊在**（第一版以為是貼圖排不下，第二版排好了還在）——原因還沒查到；下一班先查那片牆的第二套 UV 是不是和別的面疊在一起（`lm_squash_scan.py`）、或牆後面有沒有東西把光擋住，再決定要不要拆開那片牆。接著做：查黑三角 → 512 正式烘 → tests/library_b1_lm_unit.js → README → 交件。D99 凍結期間排在後面（LAWWW 04:36）。
- **通訊測試（03:4x）**：我 → LAWWW、AA、BB 三則都 DELIVERED。BB 03:39 回「BB→LAWWW2 收到」（ACKNOWLEDGED；BB 這一陣子主任務是驗收讀書／考試／國考職涯系統，畫面驗收排後面）。AA 03:37 傳測試給我、我 03:4x 回 ACK（AA 也在盤點四職位待辦，約好兩邊結果互相對照）。LAWWW：還沒回（接班中）。
- **對帳**：check 0、roles 0（四份全部待辦都在總表）、asks 0（309 筆）。`duty verify` 1 項異常（第 6 項）：「second-ai-env-art 在 A 交班 88eb607a 以後多了 658 個 commit，疑似兩個帳號同時寫」——**查過不是**：其中 657 個是 LAWWW2-B 的 funny-albattani-iawshm 本來就有的（B 從我 10-22 的交班 ff339df1 接下去做，我這次快轉合併進來），我自己的只有接班登記 1 個（`6f8a9786`）。LAWWW `duty sync` 收我的新登記以後應該就消失。下一步：測通訊 → 盤點其他 AI 留下的未完成工作和時間估計（使用者要求）→ 接 B 的下一步（ZQ-ARCADE-SEAT-1028 跑全部 Node → 交件）。

## 🔁 交班：2026-11-01 09:0x UTC｜帳號 B｜LAWWW2-B｜`session_01GV1WG3UeT2DhuDpxeWJsvD`｜分支 `claude/funny-albattani-iawshm`
- **起因**：使用者對 LAWWW-B 說「現在交班」，LAWWW-B 09:0x（同帳號、值班中）轉達 P0 交班。我停止一般工作，照 `AI_SESSION_HANDOFF.md` 第 5 節做。
- **最後的工作 commit**：`4b8edad7d`（已 push，`ls-remote` 核對過）。這一節所在的交班紀錄 commit 在它後面，SHA 寫在給 LAWWW-B 的交班回報裡。`duty handoff` 已跑。
- **交班紀錄不代表下一班已經接班**。同帳號的 LAWWW-B 用 send_message 通知；沒有傳訊息給別的帳號（D75）。
- **A. 本班已完成成果**（11-01；都只在開發分支，LAWWW2 不碰 main、不發布）：
  - BUG-04（C24）學姊兩個臉：交件 `1fe2069b0`，已整合 `6c2d98041`。
  - BUG-03（C24）博思 101 替身遠近：交件 `b506f59c4`，已整合 `7145e5cd8`。
  - INTERIOR-AAA 美國收尾：交件 `ccf717fe0`，已整合 `dcbd50b01`。
  - 美國收尾第二輪（合租戶東邊補光、鄰居門）：交件 `32277557c`，已整合 `b03bedf29`。
  - ART-ECON-3D-GAP D 醉月湖晚上（北岸路燈、倒影、宮燈）：交件 `32277557c`，已整合 `b03bedf29`。
  - 更早（01～03 時）：GYM-B1-PLATES-1101 `095518e3f`、PLATE-MIRROR-1101＋ART-PHOTO-CMP-1021 `880104746`、TIER2-UPGRADE-1101 `64023d96f`，都已交、已 ACK。
  - 測試證據都在各自的 README（`test_shots/<名稱>/README.md`），全部 Node 的數字寫在 outbox。
- **B. 全部未完成工作**：見下一節「📋 LAWWW2 全部待辦」（總表 145 件＋表外 2 件）。這一班相關的：
  - `ZQ-ARCADE-SEAT-1028`：做完、push 了，沒交件（見 C）。
  - `ART-ECON-3D-GAP-1021`：D 已整合；E（四季服裝）、G（X14）、H（ART_APPROVED）不歸我；F 兩段已 retired、只記錄。
  - `ART-JIAHAO-JOY`：暫停（D99 人物凍結，LAWWW-B 05:33）。
  - `INTERIOR-AAA-REVIEW-1028`：照舊進行中，美國這一間收完了；下一間照檢討報告第 5 節。
- **C. 正在做（交班那一刻）**：`ZQ-ARCADE-SEAT-1028`（P3）。LAWWW-B 06:5x 同意，排在 D99 美術之後；那兩件交完才開工。
  - **已完成、已 push**（`62917cde5`、`4b8edad7d`；README `test_shots/zq_arcade_seat_1101/`）：
    - `wz_shopkit.py`：G08 clutter 紅凳子＋柱子上的插座（新原型 `p_outlet`）；
    - `gongguan_shops.glb`／`.json`／`.props.json` 重匯；
    - `laptop_lap.glb`（`9e407dd2d`）；
    - patch `patches/zq_arcade_seat_1101.patch`（對開發 `bd7754e2e`）：zones3d 公館座位＋GG_PROP_BLOCKS、assets3d／props3d／character3d 各一行、新 `tests/zq_arcade_seat_unit.js`；
    - 截圖腳本 `shots/zq_arcade_shots.py`。
  - **沒做完**：
    - 全部 Node（開發 `bd7754e2e`＋這一包）跑到一半，交班停掉。`zq_arcade_seat_unit`、`street_props_nav_unit` 已經 ALL PASS。
    - 沒有 send_message 交件，outbox 那一筆是 `NOT_SENT`。
  - **下一班從這裡接**：開發分支最新版＋這一包跑全部 Node → 沒問題就交件給 LAWWW-B（outbox 改 SENT）。heroine_circle 那 4 筆改 `act:'read'`、坐下開筆電是 LAWWW-B 的（D108）。
- **D. 最新決策與規則**（本班沒有新的使用者 D 編號；以下是 LAWWW-B 的派工決定）：
  - LAWWW-B 06:5x：D99 美術優先（美國收尾、經濟系 D／F），P3 的 ZQ-ARCADE 排最後。
  - D108 分工：zones3d 公館座位歸我，heroine_circle 歸 LAWWW-B。
  - D111：D99 範圍內的順序美術總監可以自己調。
  - LAWWW-B 08:3x：「一盞一盞亮」要改引擎開關，只記錄、先不做（D99）。
- **E. 跨 AI 協作**（outbox `docs/handoff/outbox_LAWWW2.json`）：
  - 美國第二輪、醉月湖：ACKNOWLEDGED（`b03bedf29`）。
  - ZQ-ARCADE：NOT_SENT。
  - 沒有等其他 AI 回覆的問題。BG-ZQ-STUDIO-1101（子晴工作室 2D 背景）是 BB 的，不歸我。
- **F. 測試與問題**：
  - ZQ-ARCADE 全部 Node 沒跑完（交班中斷）。
  - 醉月湖：`campus_layout_nav`、`reachability_all`（瀏覽器）沒跑，LAWWW-B 交給 BB。
  - ZQ：`gongguan_layout_nav`、`reachability_all` 沒跑。
  - 所有東西都沒在 iPhone 實機看過（只有 Playwright＋SwiftShader）。
- **沒有遠端備份的**（都可以從 repo 的腳本重做）：
  - scratchpad 裡的截圖原檔 PNG（比較圖 webp 在 repo）、烘焙中間檔、全部 Node 的記錄檔；
  - 暫存工作樹：`scratchpad/devtipwt`（開發 `f812b45c3`＋兩包＋ZQ 試接，沒有要交的）、`scratchpad/zqseat/wt`（開發 `bd7754e2e`＋ZQ patch＋新模型）。
- **下一班第一步**：
  1. 照 `AI_SESSION_HANDOFF.md` 第 4 節接班：fetch，讀 LAWWW 的回覆、outbox、交接板。
  2. ZQ-ARCADE：全部 Node → 交件（見 C）。
  3. 其餘照全部待辦和 LAWWW 的派工。

## 📋 LAWWW2 全部待辦（2026-11-01 09:0x 交班時；對總表 RULE_SOURCE `origin/claude/modest-rubin-2lyp7g` `bd7754e2e`）
- 總表裡負責人是 LAWWW2、還沒結案的全部列在這裡（每行是任務 ID）：進行中 7、待開工 5、已實作待整合 2、暫停 3、等待其他AI／素材 69、已整合待測試 59，共 145 件。
- 狀態、下一步以總表 `docs/handoff/tasks.json` 為準；這裡只抄 ID、優先級、標題前段。【表外】的是總表沒有、交班時補的。
- 【表外】（交給值班 LAWWW 補進總表）：
  - 醉月湖「一盞一盞亮起來」：路燈要一盞一盞開得改引擎的開關（`E.setLamps`）。LAWWW-B 08:3x：只記錄、先不做（D99）。
  - 子晴 `c504_4_3`（2026 暑假，公館騎樓的咖啡店 (12, 20.6)）旁白也有筆電：她如果坐下可以開同一個 `laptop_lap`。要不要做由 LAWWW-B 判斷（`test_shots/zq_arcade_seat_1101/README.md` 第四節）。
- **進行中**（7）：
  - `ART-DIRECTOR-LAWWW2`（P1）LAWWW2 當 3D 美術總監：照玩家路線巡場景、自訂品質標準（ART_SOP 第 10 …
  - `ART-POLISH`（P1）現有 3D 美術品質修復與精修（人物五官與臉型、2D 設定圖辨識度、材質與光影、場景、遊戲視…
  - `INTERIOR-AAA-REVIEW-1028`（P1）校內建築室內美術全面提升：參閱 3A 大作檢討（現況、做法、差距、改善計畫），照計畫分批改（…
  - `PERF-CAMPUS-SHADOW-1020`（P1）校園地圖卡；有些建築旁邊的影子一直閃
  - `ART-13`（P2）明軒、小語模型
  - `ART-ECON-3D-GAP-1021`（P2）經濟系那一年的 3D 缺口（LAWWW2 清查 B8）
  - `PERF-ZONE-ENTER-1018`（P2）電腦換畫面卡一兩秒（溫州街、咖啡廳，X14）
- **待開工**（5）：
  - `ART-SOP`（P2）美術製作 SOP（ART_SOP.md v1、SCENE_RULES.md、sop_demo…
  - `ART-SOY1`（P2）豆漿店道具組（AA-B 222472d2 做、LAWWW2-B 驗收 12a33672）＋寶…
  - `CROWD-DEPTS-LOOK-1028`（P3）各系路人的外觀（AA_495 第 5 節）：土木的測量腳架（兩人一組）、化學醫學折在手臂上的…
  - `LAWWW2-REEXPORT-US-1027`（P3）開發分支能重新匯出美國公寓、C 棟 208 的 GLB：補 us_apartment_lay…
  - `ZQ-ARCADE-SEAT-1028`（P3）子晴一個人在公館騎樓（heroine_circle c506_4_2／c507_4_2／c5…
- **已實作待整合**（2）：
  - `GYM-B1-PLATES-1101`（P2）體育館 B1 三塊門牌（女更衣室、男更衣室、壁球室・桌球室）遊戲沒有畫字：gym_b1 走 …
  - `CAM-BELL-1031`（P3）行政大樓門廊往旁邊 1.3 m 時跟隨鏡頭落進晨思鐘鐘亭 (−38,16.5)，整個畫面是石…
- **暫停**（3）：
  - `ART-JIAHAO-JOY`（P2）家豪晚上近照嘴邊暗影（Joy 0.35 露出口腔被壓暗）：試 0.28
  - `CHAR-TEMPLATE`（P2）主要角色做成一個模板，不要每個人從零開始
  - `ART-PLAYER-SEASON-OUTFIT-1024`（P3）玩家一年四季同一套長袖（LAWWW2 路線巡查③ P3 記錄）：夏天短袖、冬天外套
- **等待其他AI／素材**（69）：
  - `ART-CAFE-FLOOR`（P0）兩點半 Café 地板改自流坪水泥灰（原本人字拼木地板和桌子顏色太近）
  - `ART-DORM-LOFT`（P0）宿舍房間改成台大四人房：上舖床＋下面書桌四組（左右各兩組）、進門右邊洗手間、窗移到後牆中間；…
  - `ART-BG02`（P1）2D 背景 gongguan_luwei「公館・滷味攤」（BG 追蹤表 BG-02）：ev_…
  - `ART-BG05`（P1）2D 背景 dorm_roof「宿舍頂樓」（BG 追蹤表 BG-05）：ev_nye_roo…
  - `ART-BG15`（P1）2D 背景 ntu_soc「台大・社科院門口」（BG 追蹤表 BG-15）：ev_kexin…
  - `ART-BG16`（P1）2D 背景 ntu_linze「台大・霖澤館前」（BG 追蹤表 BG-16）：ev_kexi…
  - `ART-BG17`（P1）2D 背景 ntu_avenue「台大・椰林大道」（BG 追蹤表 BG-17）：ev_kex…
  - `ART-BG18`（P1）2D 背景 video「視訊（可昕那一端）」（BG 追蹤表 BG-18）：ev_kexin_…
  - `ART-EXT-GATE`（P1）臺大校門外觀（校園與公館共用，CK.gate 套件）
  - `ART-EXT-M1`（P1）男一舍外觀（玩家自己的宿舍；校園上目前是 CK 套件方盒）
  - `ART-EXT-MRT`（P1）捷運公館站出口外觀（TK.mrtExit）
  - `ART-EXT-TEACH`（P1）普通教學館、博雅教學館：外觀＋室內換 Blender（teach3d.js、boya／put…
  - `ART-GG-FACADE-3D-1023`（P1）公館店面外觀（G00～G14 已套騎樓組件 SF_GG，使用者還是覺得醜）：遊戲內拍、找具體…
  - `ART-GG-SIGNS`（P1）公館店面招牌重新設計（35 面：21 橫式＋14 種直立）：BB 寫生圖提示詞 → 使用者生…
  - `ART-GYM-BG1`（P1）2D 背景：新體育館主球場（3F）內部的典禮畫面（8/31 開學典禮；之後大四畢業典禮 CG…
  - `ART-L118-FACADE-3D-1023`（P1）118 巷九間店面外觀做成立體（門窗內退、有厚度的招牌雨遮、玻璃後看得到店內、店門口深度與陰…
  - `ART-SHOP-VIEWS-1023`（P1）店裡往外看的景（窗景、門外）很假：每間店從實際窗、門口位置重拍白天／黃昏／夜景、距離照實際；…
  - `ART-WZ1`（P1）溫州街小公園擴大版（LAWWW2-B 的 wz_park.glb v3＋wz_park_la…
  - `BG-DARK-SCENES-1024`（P1）13 段劇情對話是黑底（scene 的 bg 鍵 OUT.BG 沒有）：Café 四張、法圖…
  - `ART-10`（P2）自強十舍 nccu_dorm（宿舍樓下長椅）
  - `ART-11`（P2）政大・校園裡的路 nccu_campus
  - `ART-12`（P2）台北的家 2D：home_living、home_balcony
  - `ART-BG-COURT`（P2）2D 背景 ntu_court_night：新體育館旁的戶外籃球場，晚上（哲 2）
  - `ART-BG08`（P2）2D 背景 car「車上（祐廷開車）」（BG 追蹤表 BG-08）：ev_kexin_tri…
  - `ART-BG11`（P2）2D 背景 trip_mountain「山上（看星星）」（BG 追蹤表 BG-11）：ev_…
  - `ART-BG13`（P2）2D 背景 wenzhou_tutoring「溫州街・課輔班門口」（BG 追蹤表 BG-13…
  - `ART-BG14`（P2）2D 背景 yongkang_curry「永康街・咖哩店」（BG 追蹤表 BG-14）：ev…
  - `ART-BG19`（P2）2D 背景 gongguan_cinema「公館・二輪戲院」（BG 追蹤表 BG-19）：e…
  - `ART-BG20`（P2）2D 背景 soymilk_shop「豆漿店」（BG 追蹤表 BG-20）：ev_zhiru…
  - `ART-GG-SHOPS-1018`（P2）公館店面外觀重做（使用者 10-18 05:5x「從外面看都好醜」，X16）
  - `ART-GG-STREETLIFE-1023`（P2）公館騎樓前的機車、單車架、路人（店裡往窗外看太空；LAWWW2 提案、LAWWW 同意）
  - `ART-GYM2-INT`（P2）新體育館 3F 主球場接成區域（gym_arena.glb；樓梯口紅龍拿掉；LICENSES…
  - `ART-L118-LANE-1020`（P2）118 巷街道像「巷」不像大馬路：兩側停機車（instancing、顏色不同）、店門口盆栽保…
  - `ART-LIB-VIEW-1018`（P2）總圖窗景很假（使用者 10-18 06:2x）：窗外是遊戲畫面拍的平面圖 library_v…
  - `ART-ROOM-MULTI-1020`（P2）萬才館多功能教室和霖澤館 202 長得一樣：照 AA_330 旁白「椅子是可以移動的那種，大…
  - `ART-TONE-NEUTRAL-1022`（P2）色調映射 ACES→Neutral（全遊戲；陽光下的臉不再灰白、晚上的燈暖；?tone=ac…
  - `ART-TUTOR1`（P2）家教客廳道具組（BB-B 939421a4 做、LAWWW2-B 驗收 eb9f392e）：…
  - `ART-US-ROUTE-1024`（P2）D99 路線巡查②美國交換（LAWWW2 美術總監巡查）：社區西邊出口外面補街道與對面平房、…
  - `ART-US1`（P2）美國公寓客廳家具組（AA-B 99e758f9 做、LAWWW2-B 驗收 eb9f392e…
  - `ART-US2`（P2）美國公寓廚房（AA-B 7b509b39 做、LAWWW2-B 驗收 439763c6）
  - `ART-US3`（P2）美國公寓臥室家具（BB-B d2378c1d 做、LAWWW2-B 收進 586eface、…
  - `ART-V0-DORM`（P2）經濟系那年祐廷的宿舍房間（第 0 間）：沿用 203 的模型，換房號、窗景，室友阿勳的床（A…
  - `ART-VAC-AIRPORT-1021`（P2）3D 機場第二版（桃園機場出境／入境大廳；交換出發、送機、寒暑假出國共用）：報到島背牆、帷幕…
  - `ART-WZ0`（P2）溫州街舊店面翻修：盤點缺哪幾層 → 店面組件 → 套用 → 前後白天晚上截圖
  - `ART-WZ3`（P2）溫州街 wenzhou_street.glb v5（設計稿招牌 13 張、店門門廊、B5 立…
  - `ART-WZ4`（P2）兩點半 Café ART-WZ4：GLB 換新（第四張吧檯椅、四人桌、角落沙發、門鈴、傘桶、…
  - `ART-WZ5`（P2）溫州街的貓的正式模型（wz_cat.glb：三姿勢、名牌、繃帶、fat、老貓材質）接進小公園
  - `ART-WZ6`（P2）故事小物件 wz6_items.glb（半熟計時器、阿德的筆記本、茶罐、卡片、白板影印、吉他…
  - `ART-WZ7`（P2）溫州街路邊小物（AA-B 做、LAWWW2-B 驗收 97f315ca）：安全帽、傘桶等
  - `BUG-CAFE-FLOOR-MIRROR-1021`（P2）兩點半 Café 店內自流坪地板是鏡面（粗糙度貼圖匯出成 0.004），吊燈下面反光成一個白…
  - `BUG-WZFLICKER-2`（P2）疊面閃爍尾巴：溫州街三處（x 10.35 二樓招牌×亮燈窗、x 41.4 店面玻璃×窗框、x…
  - `GG-STREETVIEW-1020`（P2）從學校看出去的公館、校外建築很醜，沒有 3D 遊戲的感覺；公館的店面（照片：羅斯福路直立招牌…
  - `GRADE-GOLDEN-DEFAULT`（P2）黃昏調色預設就開（使用者選「預設就開（建議）」）：用現在的版本重拍比較圖、跑回歸，把預設換成…
  - `SCN-US-01`（P2）美國公寓社區：祐廷單人戶（臥室＋客廳＋廚房＋衛浴＋陽台）＋社區外觀（使用者 10-16 更正…
  - `SCN-US-02`（P2）美國校園街道
  - `SCN-US-03`（P2）美式大型超市
  - `SCN-US-IU-1018`（P2）美國校園照 Indiana 校區真的樣子和路線改；其他地區照樣子設計、先不開放進出（使用者 …
  - `SCN-US-LIB`（P2）美國交換：法學院圖書館 3D 區域（挑高中庭、玻璃欄杆、彩色玻璃窗；最小可玩：大門、中庭一層…
  - `V0-ART-DORM`（P2）v0 宿舍 412 的房間道具：三個紙箱（床上／床尾兩箱）、阿勳的筆電與計算紙、床下的保齡球…
  - `WZ-SHOP-AA364-ART`（P2）溫州街店面（AA_364）場景：林家乾麵（A4）、巷子裡定食（B3）能進去內用——室內照 1…
  - `ART-02`（P3）furniture_study 教室門模組
  - `ART-BIKES2-F`（P3）腳踏車 v2 後續：老鐵馬、登山車比導航阻擋長 8 cm；老鐵馬要鏽和褪色；車籃裡的東西；淑…
  - `ART-DORM-LOUNGE-1021`（P3）男宿交誼廳家具（LAWWW2 清查 B16）
  - `ART-HALL-WINDOW-DUSK-1025`（P3）臺灣大廳窗外白天照片在 12/10 17:20 比屋外亮（窗景換夜景以前那段，白天照片沒跟著…
  - `ART-PHOTO-CMP-1021`（P3）共同教學館、女舍和參考照片比對（LAWWW2 清查 B14）
  - `ART-ROOM-LIFE-1020`（P3）霖澤館 202、萬才館多功能教室（和 201）的生活感：幾張椅子上有書包、桌上筆記本或講義、…
  - `ART-US-SEASON`（P3）美國篇場景改季節：8 月出發、12 月回來（us_bus_station 等改成夏末；冬天場…
  - `ART-WZ-MARKET-1023`（P3）溫州街小公園二手市集的攤位 3D（WZ-P2，AA_420 第 12-2 節；每月第一個週六…
  - `US-MS-NIGHT-1021`（P3）美國街道路燈的地面光圈（晚上 20:00 前後；us_lamp_pools.diff）
- **已整合待測試**（59）：
  - `ART-NPC-40`（P0）路人底模男女各 20 種（nf1–20、nm1–20；9–20 號照日劇穿搭、低彩度；nf4…
  - `LANE118-SHOPS-1020`（P0）118 巷的店走得進去、店員站在店裡（現在店員站在店外）
  - `ART-HAIR-MATCAP`（P1）頭髮材質的 MatCap 造成髮梢白邊：11 個已交付 VRM 拿掉 _SphereAdd（…
  - `ART-SEATFIG-1018`（P1）博雅 101 坐著的替身禿頭（頭頂白塊）、臉發白、看起來小（BB-C 10-18 報告 b_…
  - `BUG-COPLANAR-DEV`（P1）開發組自己的 GLB 有同向疊面（會閃）：萬才館外觀、霖澤館外觀、宿舍大廳等
  - `CAFE-LM-1030`（P1）兩點半 Café 室內光照烘焙（INTERIOR-AAA 第二間；使用者 X125 室內廉價…
  - `CAFE-WINDOW-LIVE-1030`（P1）兩點半 Café 往門口那一側的窗景是靜態貼圖 → 看得到外面（3D 溫州街、路人、時段光線…
  - `DORM-SLEEP-VISUAL-1030`（P1）宿舍睡覺要有畫面＋床比例＋室友書桌擺設不重疊（使用者 10-30 04:2x 對 LAWWW…
  - `DORM203-LM-1030`（P1）宿舍四人房光照烘焙（白天、晚上、熄燈三張）、床墊 1.92 m、床尾擋板移到走道那一半、五個…
  - `LIB-LAWN-PLAN-1030`（P1）照臺大校內地圖規劃總圖前草皮
  - `LOBBY-CEIL-1028`（P1）霖澤館大廳第二版（LINZE-LOBBY-V2-1028）讓 tests/room_ceil…
  - `PERF-CAMPUS-DAY-1027`（P1）校園白天走起來還是會卡（X79：影子閃已修；經濟系那一年大多在校園）
  - `PERF-TEX-DEDUP-1027`（P1）各棟 GLB 重複的貼圖合併（椰林大道場景 332 張裡 213 張是同一張 Poly Ha…
  - `RENAME-ART-1030`（P1）D115 改名美術字：校門石牌、晨思鐘、博思名牌、法律系館A 公布欄、201 傳單、博思 2…
  - `SKYBRIDGE-DOOR-1020`（P1）博雅→普通的空橋：通道上還有一扇很醜的門（跟現實不符）；走到普通後被擋住、到不了一樓或二樓其…
  - `US-APT-CLOSET-1027`（P1）美國交換祐廷租的單人公寓（us_apartment）照使用者描述改格局：小的 walk-in…
  - `WZ-CAT-LIFE-1023`（P1）溫州街的貓要能動、能互動（3D 骨架走路、照時段天氣換位置姿勢、「摸摸貓」）；收養劇情（其中…
  - `ART-05`（P2）角色 VRM bl_zhe、xinci、bohan、kexin、peishan（只在 ?bl…
  - `ART-09`（P2）6 張新立繪 jiahao、pinyu、tangrui、weilun、xun、yule
  - `ART-DORM-Y34`（P2）大三男一舍 507、大四 409 的宿舍房間：沿用四人房模型 dorm_room4，換房號牌…
  - `ART-GYM1`（P2）新體育館第一階段（大廳＋1F 多功能球場）：gym 區域、門口走得進來、體育課集合
  - `ART-NPC-HAIR-STREAK`（P2）路人底模頭髮近距離黑白條紋（博雅 101 近處的同學）
  - `ART-PS-SKIRT-HAND`（P2）沛珊走路擺手時手穿過長裙（平台、第二段；裙子不跟手臂動）
  - `ART-PT-SIS-FORMAL`（P2）學姊 formal 對話立繪（W9 面試西裝外套；大四 M9 口試）：heroine_05/…
  - `ART-YT1`（P2）祐廷 VRM 精修第 1 批（vroid_yuting.vrm：頭髮、圓領、下巴投影、上衣、…
  - `ART-YU-3D-1018`（P2）小語 3D 還是舊人物（紅褲子），路人都變好看了她很突兀（X12）
  - `BADMINTON-CLIP-1027`（P2）和語彤打羽球做成 3D 小短片（現在只有對話）：綜合體育館 3F 主球場，兩個人打幾球、幾個…
  - `BUG-CAM-C208-1021`（P2）美國交換 C 棟 2F 208 門口走廊 17:46 鏡頭卡進牆／屋簷：y1 方向整個畫面米…
  - `BUG-GYM-STAIRS-1020`（P2）體育館樓梯的方向反了
  - `DORM-HALL-LM-1028`（P2）男一舍門廳（dorm_hall）照霖澤館大廳、萬才館的做法做擺設＋光照烘焙（dorm_hal…
  - `FAIR-STAFF-LOD-1027`（P2）社博那天顧攤的人照距離藏（效能）：中畫質 35 m、高 55 m、低 34 m 以外的顧攤 …
  - `HEROINE-LIFE-NPC3D-1028`（P2）女主角圈子裡的標籤同伴 3D（heroine_circle.js PEOPLE[] 17 位…
  - `INTERIOR-202-1028`（P2）霖澤館 202 v2：家具、天花板＋重烘光照（X125 室內檢討第二間）
  - `JP-ROOM-3D-1021`（P2）日本宿舍「你的房間」jp_room 3D 保留：LAWWW2 修可達性「窗外」那一項、交 G…
  - `LAWLIB-LM-1030`（P2）法律學院圖書館室內光照烘焙（白天、晚上兩張；INTERIOR-AAA 第三間）
  - `LIB-HALL-LM-1028`（P2）總圖大廳（library_hall）照霖澤館大廳、萬才館、男一舍門廳的做法做光照烘焙（bak…
  - `LIGHTBAKE-UV-FIX-1028`（P2）光照貼圖 UV 修正：bake_room.py 填滿率只有 6～9% 的問題（共用材質自動拆…
  - `LINZE-34F-TABLES-1020`（P2）霖澤 3、4 樓放長條桌附椅（像野餐桌），可以討論功課、吃飯
  - `LINZE-WANCAI-FLOORS-1020`（P2）霖澤館 3～8 樓、萬才館樓上不要永遠「整修中」
  - `LM-SEAM-1028`（P2）之前交的 201、202、霖澤館大廳、萬才館的光照貼圖有 60～470 m² 全黑的面（牆段…
  - `LOBBY-VC-1028`（P2）霖澤館一樓大廳 11 個純色材質合成一個頂點色材質 lz_vc（網格 78→67、材質 32…
  - `MULTI-ROOM-V2-1030`（P2）法律系館B 多功能教室 v2：一體成形塑膠椅、單人桌封邊、0.6 m 輕鋼架＋T5 格柵燈、…
  - `NPC-POOL-ART-1028`（P2）法律系同學二十位的美術：每人固定路人底模（對照表在 LAWWW-C 10-28 04:5x …
  - `PERF-SINGLESIDE-GLB-1025`（P2）環境 GLB 單面巡查——先在同一頁切換單面量上限、10% 以上才做：室內（attachFo…
  - `SCN-V3-01`（P2）第二個房間（主線 3）2D＋物件
  - `SCN-V4-01`（P2）第三個房間（主線 5）
  - `SCN-V5-01`（P2）第四個房間（主線 10）
  - `SET-CEREMONY-1023`（P2）體育館 3F 典禮布置（AA_399 第 4 節、A16）：SET_CEREMONY 十二學…
  - `SQ-TRACES-1023`（P2）店員支線做完的痕跡 3D 道具（SQ12 照片、SQ13 罐子、SQ14 貓照片、SQ19 …
  - `WANCAI-LM-1028`（P2）萬才館室內照霖澤館大廳的做法做光照烘焙（樓梯只做看得到的面、止滑條自己的材質、lm 分組；b…
  - `ANIM-DOOR-OPEN-1027`（P3）人物「開門」的動作（A21，spec 21 第 5 點）
  - `ART-04`（P3）prop_pothos.glb
  - `ART-LAMPSHADE-FLIP-1027`（P3）溫州街 3 個、118 巷 9 個店內吊燈燈罩裡外相反（隔玻璃看只是明暗反；開發 5b673…
  - `ART-Y1-BOX-MIRROR-1021`（P3）大一 203 壓平的紙箱上「冬天的衣服」字左右鏡像
  - `BACKLOG-A7-WZPARK-COPLANAR`（P3）溫州街小公園疊面（BACKLOG A7）：涼亭樑、神龕背板、環狀步道、公布欄軟木板各移 3～…
  - `BUG-CAM-203-R2-1021`（P3）大一 203：站在 R2 書桌旁 (1.0, 0.25)，鏡頭在東被 R2 上鋪床架擋住整個…
  - `FIT-3D-BODY-1027`（P3）健身的 3D 體態（D40：體能、加成、注意到的台詞都有了；fit3d.js 寫「等 LAW…
  - `PARK-ENTRY-B-1027`（P3）溫州街小公園從入口 B 走不進主園區（B08）
  - `RT-NIGHT-1028`（P3）室內光照烘焙的房間裡，沒烘焙的細小零件照舊是即時光：晚上比旁邊亮（霖澤館大廳、萬才館、男一舍…


## ⏱ 現況（LAWWW2-B，2026-10-31 20:5x UTC；帳號 B 七天額度已到警示，隨時可能被切斷——接手的先讀這一段）

- **11-01 09:0x（最新）**：兩件交件（32277557c；outbox 兩筆 SENT；send_message 給 LAWWW-B）
  - **美國收尾第二輪**（README `test_shots/us_wrapup2_lm_1101/`；patch `patches/us_wrapup2_lm_1101.patch` 只有測試）：
    - 鄰居的門：207（合租戶）0.40～0.61→0.26～0.38、213（單人戶）0.41～0.58→0.22～0.39。
    - 合租戶客廳東邊 0.17～0.25→0.28～0.46（`--dayfill` 12 W）。晚上不變。
    - 注意：`usa_door` 節點沒了（以前是 door213＋lau_w_door 合起來的），兩支測試清單改 `lau_w_door`，要和 GLB 一起換。
  - **醉月湖晚上 D**（README `test_shots/lake_night_1101/`；patch `patches/lake_night_1101.patch`）：北岸 4 盞路燈＋水面倒影＋湖心亭宮燈；新測試開發原樣 FAIL 6→ALL PASS；draw call +11。
    - 宮燈第一版掛太高被額枋擋住（遊戲內截圖發現），改到 2.12～2.44 m。F 兩段 retired，只記錄。
  - 全部 Node（開發 f812b45c3＋兩包）：831／1；那 1 個是 scene_bg_keys（ziqing_studio，V6-B 合併時的），f812b45c3 原樣也 FAIL，最新開發 bd7754e2e 已修（登記成 BB 的 BG-ZQ-STUDIO-1101）。
  - 開發分支到 bd7754e2e，兩包改到的檔案從 f812b45c3 以後沒變，patch 照樣套得上。
  - **下一件**：照 LAWWW-B 06:5x，D99 美術收完 → ZQ-ARCADE (a) 騎樓凳子＋插座（wz_street／wz_shopkit 公館）、(b) laptop_lap 位置定案；(c) 只交 zones3d 公館座位 patch。
- **11-01 07:5x**：
  - LAWWW-B 06:5x：ACK 美國收尾 ccf717fe0（已整合 dcbd50b01，outbox 改 ACKNOWLEDGED）；ZQ-ARCADE (a)(b)(c) 同意但 P3、**先不要開工**。順序：① 美國還不夠的兩處 → ② ART-ECON-3D-GAP D（醉月湖晚上）、F（兩段劇情背景）→ ③ 才做 ZQ (a)(b)；(c) 我只交 zones3d 公館座位 patch，heroine_circle 歸 LAWWW-B。已回 ACK。
  - ZQ 停在：laptop_lap 道具 9e407dd2d（只在我的分支，沒接進遊戲）；devtipwt 裡的試接改動另存 `scratchpad/zqseat/devtip_scratch_1101.diff`（不交）。
  - **① 美國第二輪（進行中）**：
    - `bake_room.py --dayfill`（新）：只在白天那一張、朝下的柔和面光源（晚上、熄燈不亮）。合租戶客廳東邊 x 0.3～1.3、z −2.8～0.8、12 W。
    - 鄰居的門：`us_apartment.py` merge_by_material 留下 `door213` 自己一個物件（原本合進 usa_door，`--dayscale` 比對不到），bake_us.sh 兩戶都 `door213=0.65`。
    - 合租戶第三版烘好（scratchpad/us2/final_shared）：東邊地板 0.17～0.25 → 0.28～0.46、鄰居 207 的門 0.40～0.61 → 0.26～0.38；晚上不變。單人戶第九版烘焙中。
    - 測試：dev `tests/us_shared_lm_unit.js` 加 ⑨（door213 自己一個節點、有烘）；dev 原樣 FAIL 2。待：單人戶烘完、換 GLB、截圖、README、patch。
  - **② D 醉月湖晚上（進行中）**：E12 已改成 11/6 17:45（AA_303），傍晚照日期以後已經天黑，對白「湖對面的燈一盞一盞亮起來」→ 影響畫面，做。
    - `patches/lake_night_1101.patch`（zones3d.js＋新 `tests/lake_night_unit.js`，對開發 f812b45c3 apply --check 過）：北岸 4 盞路燈（中間兩盞在 z −124 邊界灌木後面）、水面燈的倒影（7 個：南 2、北 4、宮燈）、宮燈光暈＋平台光圈。新測試開發原樣 FAIL 6、改後 ALL PASS；校園／湖相關 40 支 ALL PASS。
    - `campus_lake.py` 加湖心亭宮燈（lake_lantern_paper，+156 面），GLB 已換（a341bcbcf）。待：遊戲內改前改後截圖（`shots/lake_night_shots.py`）、README。
    - F：兩段（ev_y0_e24b2、ev_y0_c2_hiking）開發分支已 retired（AA_218：10/17 休學刪除），不會演，只記錄。
- **11-01 04:3x**：
  - LAWWW-B 02:50 ACK tier-2（outbox 改 ACKNOWLEDGED）；02:53 派佇列：BUG-04（P1）→ INTERIOR-AAA 美國收尾（us_shared 烘焙、公寓門外平台／陽台白天偏白）→ BUG-03 博雅 101 頭髮（P2）→ ART-JIAHAO-JOY（0.35→0.28，P3）→ ZQ-ARCADE-SEAT-1028（P3）。03:31 同意 BUG-04 只交 patch。
  - **BUG-04 交件 1fe2069b0**（README `test_shots/bug04_sis_overlap_1101/`）：
    - 原因：v9.7 週三 18:48～21 萬才館，legacy 學姊 (-3,3.6) 和 act:'club' 第一個社員 CLUB_SPOTS[0] 同一點（伯涵 548、子晴 312 時段）。不是重複實體、不是重複模型。遊戲內 v9.7 實拍（剛到、走過去、靠近）。
    - 現在開發分支那一段已拿掉；34 區×每天×每半小時 1,734,000 次 populate 掃描 0 組。
    - patch `patches/npc_overlap_1101.patch`（對開發 7a2ac2512）：story3d.js club／linger 生之前看那一點有沒有人；新 `tests/npc_overlap_unit.js`：v9.7 資料 FAIL 3、開發原樣 FAIL 2、加 patch ALL PASS；全部 Node 807／0。
    - 第一版把 linger 拆兩行，被 bball_present_unit 的 regex 抓到，已改回一行。
  - LAWWW-B 04:38 同意 BUG-03 只交 patch；04:40 BUG-04 已整合（6c2d98041，DL-LW2-BUG04-1101）。
  - **BUG-03 交件 b506f59c4**（README `test_shots/bug03_boya_figs_1101/`）：
    - 原因：classes3d.js `figPlace` 放替身的那一刻照玩家位置選 LOD0／_lod1，之後不換。玩家在門口時 17 個全是 _lod1，走到座位旁邊照舊 _lod1（臉糊、頭髮一塊塊）。VRM 同學正常。
    - patch `patches/seated_figures_lod_1101.patch`（對開發 fb0d24c98）：每種外型 LOD0＋_lod1 兩個 InstancedMesh，figTick 照玩家現在位置重排（6.5／7.5 m）；空的不畫、下課判斷跳過空的。
    - 新 `tests/seated_figures_lod_unit.js`：開發原樣 FAIL 7、第一版 patch FAIL 2（⑦ 空的包圍球被當成看得到、下課不拿掉）、定案 ALL PASS；替身、座位、上課相關 12 支 ALL PASS。
    - 遊戲內同流程同鏡頭改前改後。沒有改人物模型（D99）：LOD0 近看臉也還偏糊，要改模型得等解凍。
  - ART-JIAHAO-JOY：照舊不動（0.35 不在 VRM 裡、遊戲 smile＝happy 0.7；D99 人物凍結沒解凍），回報 LAWWW-B。
  - BUG-03 全部 Node 822／0；LAWWW-B 05:33 已整合 7145e5cd8（DL-LW2-BUG03-1101），ART-JIAHAO-JOY 設暫停（D99）。
  - **INTERIOR-AAA 美國收尾交件 ccf717fe0**（全部 Node 822／0；README `test_shots/us_wrapup_lm_1101/`）：
    - 公寓第八版：`bake_room.py --dayscale` 只壓屋外（地板、屋簷、外牆、陽台桌）白天那張，乘 0.7、壓到 0.7；水泥改素面 `granular_concrete #a9a6a0`（原本油漆斑去色像積雪）。陽台 1.38→0.71、平台 0.89→0.57，屋裡、晚上不變。
    - C 棟合租戶第二版：吊扇、廚房、臥室 A、走道、平台壁燈；EVENT_US2、臥室的床和書桌椅（instancing）不烘。第一版烘了 instancing 的床，新測試 ④ 抓到。
    - 新 `tests/us_shared_lm_unit.js`（patch `us_wrapup_lm_1101.patch`）：開發原樣 FAIL 4、第一版 FAIL 1、第二版 ALL PASS。
    - 下一件：ZQ-ARCADE-SEAT-1028（P3）：子晴在公館騎樓坐著、有筆電。提案：騎樓柱子旁一張塑膠凳＋柱子上的插座（Blender）、zones3d 加座位、作息改坐下（seatAt）、新道具「腿上的筆電」（props3d，坐下才出現）；程式是 LAWWW 的檔，等 LAWWW-B 同意。
- **11-01 02:4x**：
  - LAWWW-B 02:04 ACK 照片比對＋名牌（名牌整合在 feat-art-1031 8b9ddfb88；四題：①②等照片、③轉 AA、④不改），派 GYM-B1-PLATES-1101。
  - **GYM-B1-PLATES-1101 交件 095518e3f**：遊戲內確認壁球室門牌是空白牌子、兩個更衣室門牌整塊看不到（GLB 裡正面朝門板＋單面）。
    - `gym3d.js` 新 `b1Plates(root,B)`：attachRoomGLB 之後照 closedDoors 的 label／face 畫字、重算 UV、雙面；沒動 engine3d、game3d、attachRoomGLB。
    - patch `patches/gym_b1_plates_1101.patch`（對開發 ef17f19d6；新測試開發原樣 FAIL 4、改後 ALL PASS）；全部 Node 799／0；README `test_shots/gym_b1_plates_1101/`。
    - `gym_b1.py` 更衣室門牌改正面朝走廊（GLB 沒重匯）。
  - **TIER2-UPGRADE-1101 交件 64023d96f**（唯讀；BB_218@78e470af4）：history audit 第 2 類 7 項升第 1 類、8 項補部分紀錄（need 寫 BB 要補什麼）；judgments 多 15 行、summary 加第二輪。
  - 佇列空了，等 LAWWW-B 派工。
- **11-01 01:5x**：
  - LAWWW-B 01:15 ACK 美國室內光照（DL-LW2-US-LM-1031：整合在本機 feat-art-1031，發布後合）；outbox 已改 ACKNOWLEDGED（3ac2848c9）。
  - **ART-PHOTO-CMP-1021 做完**（README `test_shots/photo_cmp_1101/`）：
    - 照片還是打不開（commons.wikimedia.org 代理 403、ntu.edu.tw 網域查不到；11-01 再試）→ 第一版只和研究檔的文字事實比；要照片才判斷得了的標 📷，第四節列要請使用者給的照片。
    - 最大差異：共同南面應該是有三松的庭園，遊戲貼著舟山路（要不要挪由 LAWWW-B 決定）；女舍床位 728 → 約 180 間寢室，遊戲的窗只對得到約 80 間（不建議改）；女舍路人台詞「對，有電梯」和「沒有電梯」衝突（請 LAWWW-B 轉 AA）。
  - **PLATE-MIRROR-1101（比對時找到、已修）**：側牆名牌字轉 180°（女舍 A「傳達室」、A／B「男賓止步」、共同側門、社科院系名牌）。
    - `lib2.uv_text()` 照幾何給 UV；三支腳本改用；重匯三個 GLB 和開發分支逐個 accessor 比對，只有 5 塊名牌 UV 不同（a846af231）。
    - 新測試 `plate_text_dir_unit.js`（patch `patches/plate_text_dir_1101.patch`，對開發 ef17f19d6；開發原樣 FAIL 5、改後 ALL PASS）；遊戲內改前改後 `photo_cmp_1101/plates_before_after.webp`。
    - 另外找到：體育館 B1 三塊門牌遊戲沒畫字（attachRoomGLB 不畫 PLATE_FACE），遊戲端的事，寫給 LAWWW-B。
  - **交件 880104746**（全部 Node 798／0；outbox 新一筆；send_message 給 LAWWW-B）。下一件：佇列已空——等 LAWWW-B 派工；可做的候補：tier-2 清查升級。
- **11-01 00:4x**：
  - **美國室內光照三間交件**（b75c4f317；outbox 新一筆；send_message 給 LAWWW-B）：
    - 公寓 v10（壁板挖洞、窗外景擋低角度天空、--knee 0.9,1.4；床單不過曝）、法學院圖書館 v7（牆留朝室內）、亞洲超市 v5（天花板朝下）；C 棟合租戶只修壁板。
    - README：`test_shots/us_apartment_lm_1031/`、`us_lawlib_lm_1031/`、`us_asian_market_lm_1031/`；patch `patches/us_interiors_lm_1031.patch`（對開發 ef17f19d6 apply --check 過）；全部 Node 797／0。
    - 烘焙工具 bake_room.py「留哪一面」定案（4dbce07af）：原本那面最遠 < 0.5 m＋反面中位數 > 5 cm＋反面最遠 > 2 m 且 4 倍＋寬度 ≥ 0.3 m。只影響之後的烘焙。
  - **下一件：ART-PHOTO-CMP-1021（P3）**：共同教學館、女舍和參考照片的差異清單。
- **23:4x**：
  - 法學院圖書館 v4 已放進 repo（18c6421be，README 完成；但 v4 用的是第一版「留哪一面」規則，會用定案工具重烘 v6 換掉）。
  - 「留哪一面」規則改了四次才穩：取最遠點 → 中位數（都被公寓東西壁板騙：壁板比牆高 0.4 m，上緣點越過牆頂）→ 每三角形 10 點、一半以上朝開闊處 → 再加「太窄（2×面積÷最長邊 < 0.3 m）不翻」（牆頂蓋被翻成朝下：反面在牆盒子裡一路穿到地板）。定案 2b3e0316e。
  - 公寓 v7（knee 0.9,1.4）遊戲內床單不再過曝；超市 v3 遊戲內天花板回來了、門口沒過曝（不用 knee）。
  - 測試 patch `patches/us_interiors_lm_1031.patch`（四支新測試＋singleside_us 2b）對開發 ef17f19d6 apply --check 過（67905c07f）。
  - 排隊：公寓 v10 → 法圖 v6 → 超市 v5（全用定案工具）；之後：flipscan 檢查、截圖、效能、README、全部 Node、交件。
- **23:1x**：
  - **烘焙工具修正（bake_room.py，e2e11efd2／a481772f2）**：
    - 疊在一起的正反面原本一律留「腳本先畫的那一面」；腳本方向畫反時遊戲裡看得到的是反面 → 烘完不見（超市天花板、法圖四面牆＋護牆板；樓梯斜樑也留錯邊）。改成射線判斷：原本那一面正面前 < 0.5 m 就是外殼、反面朝房間 > 2 m 而且 4 倍以上才留反面。法圖低取樣試烘：牆、護牆板、斜樑都對了，測試 ALL PASS。
    - `--knee K,A`：白天光照貼圖超過 K 的亮度平滑壓到 A（公寓北窗前床單過曝：光是窗戶上半 25～36° 的天空，對面的樓擋不到；天光調低房間就太暗）。
  - 測試加 ⑦ 牆有朝室內的面（法圖、超市；法圖 v3 FAIL、原本 PASS）。
  - 排隊烘焙（背景）：法圖 v4（新工具）→ 公寓 v7（新工具＋knee 0.9,1.4）→ 超市 v3（新工具）。超市 v2（舊工具、天花板已改模型）也烘好了，當備用。
- **22:4x**：
  - 公寓：床尾白天過曝追到原因＝烘焙時把窗外景藏起來，北窗外整片是最亮的地平線天空；第六版留著春天的窗外景擋（白天才發光、烘完拿掉 dayEmit），天光 0.8／燈 0.4，烘焙中（`usapt/v6`）。
  - 法學院圖書館：定案版（v3，彩色玻璃不烘）烘好，Node ALL PASS；遊戲內截圖拍攝中。
  - 亞洲超市：第一版烘完找到**天花板整片不見**（腳本裡天花板正面朝上，烘焙拿掉反面後只剩朝上那面）→ `us_asian_market.py` 天花板改朝下（a298383fd；重匯三角形數、大小都不變）；太陽 2.5→1.0（門口 2.0）；第二版烘焙中（`usam/v2`）。測試加 ⑥ 天花板朝下（第一版 FAIL、原本 PASS）。
  - 掃過三間烘焙後「成對正反面留哪一面」：只有超市天花板留錯；法圖樓板、屋頂天花板方向對；公寓地板、屋簷、壁板都對。
- **22:0x**：
  - **美國公寓找到模型 bug 並修好**：外牆壁板（WALL_N/S_siding）整面一片沒挖窗、門的洞——屋裡看窗外是自己壁板的背面、大門從平台看是牆（走得過去）。
    `us_apartment.py` 照牆的開口分段（4fd15dc53）；C 棟合租戶 `us_shared.glb` 一起重匯（只有壁板變）；遊戲內改前改後 `test_shots/us_apartment_lm_1031/siding_before_after.webp`；新測試 `us_apt_siding_unit.js`（scratchpad devclean，開發原樣 FAIL 2）。
  - 公寓烘焙第四版（天光 0.7、白天燈 0.4、不放太陽）在 scratchpad `usapt/v4`，遊戲內截圖拍攝中；床面白天還有 3 成到 2.0、大門口走道 1.97（南邊天空從開著的大門進來）——看截圖決定要不要再調。
  - 法學院圖書館：第二版（嵌燈 45 W、天窗 3.0、彩色玻璃 1.5、中庭補光）亮度可以（一樓晚上 0.2～0.64）；但第一、二版都把彩色玻璃 WALL_N_stained 烘了（--nolm 寫錯），已改（64052559b），定案要再烘一次。
  - 亞洲超市第一版烘焙中（`usam/v1`）。三間重匯的白模都和部署中的一模一樣。
- **21:0x**：
  - LAWWW-B 20:44 的排序（D88 → 美國室內 → JIAHAO-JOY 只在擋經濟系時做）收到；D88 已在 5a9ca703f 交過。
  - **美國室內光照進行中**：`tools/blender/env_second/lightbake/bake_us.sh apartment|lawlib|market`（75f0c616b；燈位照配置算）。
    - 公寓：重匯的白模和部署中的一模一樣（三角形、材質、3,914,088 bytes）→ 可以直接烘；改前截圖在 scratchpad `usapt/before_*`；第一版烘焙中（`usapt/v1`）。
    - 新測試 `tests/us_apartment_lm_unit.js`（只在 scratchpad 的 devclean，交件時進 patch；開發原樣 FAIL 2）。
    - 法學院圖書館、亞洲超市的改前截圖在拍（`uslib/`、`usam/`；鏡頭 `shots/us_rooms_lm_shots.py`）。法圖的天窗、彩色玻璃烘完要 `--drop-dayemit`（遊戲 skyTint 自己調）。
  - LAWWW-B 21:03 知會 X150（使用者：台詞之後整批照影劇參照重寫，AA 分批交）：場景、模型不受影響；圖上有字的東西 AA 改了那句才會另外派，現在不動。
- **20:5x**：
  - 已交（發布基準 39f68236c 凍結中，LAWWW-B 先放本機分支 feat-art-1031，發布後合）：B1 光照（2875f8aef）、CAM-BELL（8119766b1，已進 feat-art-1031）、
    LAMPSHADE-FLIP（9cc4810f2：118 巷 8＋溫州街 3，`glb_flip_insideout.py` 只翻燈罩＋腳本輪廓反過來）、D88 搬檔清單（5a9ca703f：`patches/D88_support_sources_1031.md/.txt`）。
  - ENTRY-B 查過已修好、結案；ART-13、JIAHAO-JOY 照 D99「人物美術凍結」先不做（已告訴 LAWWW-B）。
  - Café 附近金屬圓盤 `cafe_vc_wz_metal` (37.3,1.09,5.3) 也裡外相反，沒找到哪支腳本做的，沒動（lampshade_flip README 有記）。
  - **正在做：美國室內光照**（INTERIOR-AAA 最後一批；順序：公寓 us_apartment → 法學院圖書館 us_lawlib → 亞洲超市 us_asian_market）。都是 attachRoomGLB（us3d.js:192、342、401）。
    - 公寓：`us_apartment.py`（同一支也做學姊 C 棟 us_shared）；北窗、陽台玻璃門；窗外雪景／春天兩套（SEASON_SNOW_on/off）；燈具要看家具 GLB。
  - 之後：ART-PHOTO-CMP-1021（P3）。
- **20:3x**：
  - **體育館三區光照都交完**：1F 第五版＋3F 已整合（43e5f1b88）；**B1 已交**（2875f8aef，patch `gym_b1_lm_1031.patch`，含 wz_park_people_unit 第 4 項說明文字）。
    - B1 第一版抓到 bake_room.py 的問題：原本就有兩套 UV 的網格，光照 UV 被擠到 TEXCOORD_2 → 已修（烘焙物件只留第一套）；掃過之前所有烘過的 GLB 都沒有。
  - **HISTORY-AUDIT-1031 第一批已交**（b4fb653b8；`docs/handoff/history_audit/judgments_LAWWW2.jsonl`＋`summary_LAWWW2.md`）。tier 5 做好沒接：I08 約會去背 53 檔（只在我的分支）、AA185 三張背景、BG-19／14 第五版。
  - 角色美術驗收：D100 寫 LAWWW 驗收（取代 D59），ART-13 交件給 LAWWW-B（參考圖路徑＋遊戲內正面／側面／背面白天截圖＋SHA）。
  - **下一件：CAM-BELL-1031**（晨思鐘鐘亭擋跟隨鏡頭；campus_bell.py 柱子、石碑 seethru_），再來 LAMPSHADE-FLIP → ART-13 → JIAHAO-JOY → 美國室內 → PHOTO-CMP。
- **19:4x**：
  - **體育館 1F 第五版（高窗光暈更正）＋3F 主球場光照：已交**（63de770d5；patch `gym_lm_v5_arena_1031.patch`；等 LAWWW-B 整合）。
    - 光暈原因：高窗發光面補了反面（PERF-SINGLESIDE），反面朝牆把牆照爆 → 高窗 `nodup` ＋ `bake_room.py --emit-oneside`。
    - `bake_gym.sh` 單面還原改對照部署中的 GLB（白模裡 cafe_sign_face 是雙面）。
  - LAWWW-B 19:1x 佇列（使用者要求開工）：B1 光照 → CAM-BELL → ~~WZPARK-ENTRY-B（查過已修好）~~ → LAMPSHADE-FLIP → ART-13（照 D59）→ JIAHAO-JOY → 美國室內光照 → ART-PHOTO-CMP。
  - **下一件：B1（gym_b1）光照烘焙**：`bake_gym.sh` 加 b1；燈具在 gym_b1.py（泳池天花板燈、健身房 T5、走廊嵌燈）。
- **18:5x**：
  - **體育館 1F 光照＋總圖核心鏡頭第二輪：已交、已整合**（我 3094e123b → LAWWW-B baec2acc2；全部 Node 789／0）。
  - glb_restore_sides 掃描：21 個有光照貼圖的 GLB 都沒問題（只有體育館 1F，已修）。
  - **正在做：3F 主球場（gym_arena）光照烘焙第二版**（scratchpad `gym/arena3`）：
    - 第一版：看台幾乎全黑、高窗四周白光暈 → `gym_arena.py` v8 看台上方加 LED（117 盞）、高窗分出 `arena_window_sky`；`bake_room.py --emit-oneside`（發光面只有正面發光）。
    - 鏡頭 `shots/gym_arena_lm_shots.py`；改前截圖在 scratchpad `gym/arena_shots/before_*`。
    - 交件時：`singleside_gym_unit.js` 第 2 項的「主球場 看台踢面」要照 1F 石牆的做法移到 2b（烘焙後沒有反面）；新測試 `gym_arena_lm_unit.js`；README `test_shots/gym_arena_lm_1031/`。
  - 之後：B1 → CAM-BELL。
- **17:5x**：
  - **體育館大廳＋1F 球場（gym_interior）光照**：第三版已 push（`4985a13fe`，assets 裡的 GLB＋白天貼圖）。球場白天晚上都比改前自然；大廳石牆、地板是中性灰（石材本來就是灰色花崗石 #8e8b85，改前偏咖啡是暖色的即時環境光）。
    - 第三版大廳天花板只有地板反彈的光（白天 0.126，畫面深灰）→ **第四版**：嵌燈正下方 2.3 m 十顆柔和點光源（`bake_gym.sh` 的 `FILLW`）、嵌燈 25→20 W，烘焙中（scratchpad `gym/out4`，約 18:05 好）。
    - 新測試 `tests/gym_lm_unit.js` 寫好（在 scratchpad 的 devclean，交件時進 patch）。還沒：第四版截圖、效能、README（`test_shots/gym_lm_1031/`）、全部 Node、交件。
  - **總圖核心鏡頭第二輪（BB n33 ①）**：patch `patches/cam_libhall_core_v2_1031.patch`（`ccde616a2`）。平常照舊整塊核心擋（autoSwing 轉開）；拖鏡頭時換成只擋樓梯井那一面的薄板，書架、書、鋼件、葉子網點透空。
    - **第一輪的葉子透空其實沒作用**（走訪 `root`，attachFormal 已經把節點搬走），這一版改走訪區域群組 `g`——交件時要老實告訴 LAWWW-B。
    - Node 新測試 ALL PASS（開發原樣 FAIL 8）；拖鏡頭遊戲內 42～45%、鏡頭水平離頭 2.2 m 以上。自己轉開那一組要等 CPU 空下來重拍（SwiftShader 1 fps 時每秒只轉 0.13 rad，6 秒拍到的是轉到一半）。
  - 一盞木柱（n33 ②）：已回報不用改（`test_shots/n33_teahouse_post_1031/`），等 LAWWW-B 說是不是劇情固定鏡頭。
  - 之後：3F 主球場（gym_arena：56 盞 LED、布置 SET_* 藏起來）→ B1 → CAM-BELL。
- **15:3x**：BB n33：書店、溫州街光照、校史館側牆、NAV-LIBHALL-ISLAND PASS。要再看兩件（排在體育館之後、CAM-BELL 之前）：①總圖核心朝外牆的 4 個方向，鏡頭被推到頭頂正上方（水平 0.36～0.43 m）——打算被推近時核心牆網點透空；②一盞門口往裡，一根木柱擋住、晚上幾乎全黑——先查進門的預設鏡頭，是的話柱子標 seethru_。截圖在 BB 的 bbtest/dyn14/n33_lhcore、n33_shoplm。
- 14:3x：書店＋門廊側牆（3a40b7013）、總圖核心鏡頭（604d7596b）、溫州街三家光照（267c6a804）LAWWW-B 都已整合（f275a620f）。send_message 恢復了（下午一直失敗）；交件照舊送訊息。**下一件：體育館光照**，再來 CAM-BELL-1031。
- 11:2x（舊）：
  - **BUG-CAM-LIBHALL-CORE-1031（LAWWW-B 10:45 P1）**：**已交（11:5x，outbox）**：`patches/cam_libhall_core_1031.patch`、`test_shots/cam_libhall_core_1031/README.md`。
    - 新測試開發原樣 FAIL 10、改後 ALL PASS；95 支會建出總圖大廳的 Node 都過；BB 的 4 個方向 0～5% → 27～43%。
    - 全部 Node 787／0（12:1x 跑完，已補 outbox）。等 LAWWW-B ACK／整合、BB 重跑 LHCORE。
  - **溫州街三家光照：已交（13:xx，outbox）**（README `test_shots/wz_shops_lm_1031/README.md`；patch `wz_shops_lm_1031.patch`；全部 Node 788／0）。下一間：體育館。以下是做法紀錄：
  - 溫州街三家光照（INTERIOR-AAA，#140）：`tools/blender/env_second/lightbake/bake_wz_shops.sh brunch|print|teahouse`、鏡頭 `shots/wz_lm_shots.py`。
    - 64 取樣試烘：半熟、一盞好了（scratchpad，沒進 repo）；影印店重烘中（第一次烘到一半我改了腳本，bash 讀到錯位，`lm: command not found`——**跑著的 bash 腳本不要改**）。
    - 半熟下一版：軌道燈的點光源離天花板 15 cm，天花板有亮斑，改成往下照的小面光源。
    - 還沒拍遊戲內截圖、還沒調參數。
- 10:4x 以前：
- **剛交、已整合：NOODLE-LM-1030 麵店＋LM-COLLAPSE-1030 第一間（法律學院圖書館）**（`ee96b798f`→LAWWW-B 整合 2c65d66f1；`test_shots/noodle_lm_1030/README.md`、`test_shots/lm_collapse_1030/README.md`）。樓梯間欄杆影子糊：LAWWW-B 先不排（D99 只記錄）。
- **LM-COLLAPSE-1030 四間都交了**（`test_shots/lm_collapse_1030/README.md` 有總結表）：法圖、總圖大廳、宿舍四人房已整合；201 也已整合（LAWWW-B 22:09，全部 Node 773／0）。
- **PERF-ZONE-ENTER-1018 第三輪已整合**（LAWWW-B 23:2x，`44337adcb`）。剩下的載入流程（prewarm settle、等 GPU、路人 VRM）LAWWW-B 先做量測面板，我不接。
- **正在做：ART-ECON-3D-GAP-1021**（LAWWW-B 23:2x）：清單 `docs/art-rebuild/second_ai/ECON_3D_GAP_STATUS_1030.md`（j7～j13 全部已整合、各自的 commit；還沒做 A～H）。
  - 開工順序：A 共同教學館室內正式模型（`teach_interior.py --set gongtong`，現在是程序化）→ B 普通教學館光照烘焙 → C 總圖 3F 閱覽區光照烘焙。
  - **A 已交、已整合**（共同教學館室內正式模型＋光照烘焙；README `test_shots/gongtong_int_1030/README.md`；patch `gongtong_interior_1030.patch`＋`lightbake_tools_1031.patch`；Node 776／0）。開發分支 a54a7d860 已經有。
    - 白天參數不能照博思（天光 0.18、白平衡 1.0,0.98,0.95、白天燈 0.6，理由在 `bake_gongtong.sh` 開頭）。
  - **B 已交、已整合**（開發 3f67ec44a；普通教學館光照烘焙；README `test_shots/putong_lm_1031/README.md`；Node 777／0）。白天參數試了六版（冷白燈、白天曝光降兩成），理由在 `bake_putong.sh` 開頭。
  - **C 已交（05:xx）**：總圖 3F 閱覽區光照烘焙＋法圖書的 GPU instancing 修正。README `test_shots/library3f_lm_1031/README.md`；patch `patches/library3f_lm_1031.patch`；等 LAWWW-B ACK／整合。
    - 參數試三版（冷白燈、燈下點光源），紀錄在 `bake_library_3f.sh` 開頭；壓扁 0 m²；藏路人後 draw call、三角形和改前完全一樣。
    - **法圖（我 10-30 的問題）**：`bake_room.py --keep-instances` 匯出沒寫 GPU instancing，開發分支的 `lawlib_interior.glb` 800 節點／0 個實例。工具修好、重烘回 137 節點／27 個實例（光照貼圖逐像素相同，只換 GLB）；二樓書庫 draw call 1008→417。
    - Node 778／2：xinci_romance（沒 fetch 企劃線）、r2y4b_events（開發分支原樣也 FAIL，告訴 LAWWW-B）。
  - **A～C 做完、都已整合**（C：LAWWW-B 05:05 整合 1e910aa6c）。D～H 不歸我或在等別人（清單第 2 節）。
- **BUG-CAM-PILLAR-LAWA-1031 已交（05:5x）**（LAWWW-B 05:02 派，P1）：霖澤館穿堂七根柱子另外一個材質 `seethru_ext_granite_col`，`attachExterior` 標樹幹透視。
  - README `test_shots/cam_pillar_1031/README.md`；patch `patches/cam_pillar_linze_1031.patch`＋換 `linze_exterior.glb`；門口玩家看得到 0%→39%。
  - 等 LAWWW-B 整合、BB 跑 DAD2／DAD2_NO 驗收。
  - 已整合（LAWWW-B 05:52，3ba38e34a）。
- 普通 101 北窗白天整片黑（BB-B n28）：判斷是博思一樓深色玻璃帷幕，窗景沒缺（`test_shots/putong_winview_1031/README.md`），改法給 LAWWW-B 決定。
- CAM-BELL-1031（P3，晨思鐘鐘亭擋鏡頭）：排在 INTERIOR-AAA 之後。
- **CAM-PILLAR-HALLS-1031 已交（06:4x）**（LAWWW-B 05:52 派，P2）：總圖、行政、文學院、校史館門廊石柱、拱廊柱墩 → `seethru_ck_col`、`seethru_ck_pier`；`attachWenzhouModel` 認 `seethru_`。
  - README `test_shots/cam_pillar_halls_1031/README.md`；patch `patches/cam_pillar_halls_1031.patch`＋換四棟 GLB；Node 783／0；校史館圓柱 0%→35%。
  - 找到：行政大樓門廊往旁邊 1.3 m，鏡頭跑進傅鐘（鐘亭不在鏡頭碰撞裡），沒改，問 LAWWW-B。
- **正在做：INTERIOR-AAA-REVIEW-1028（#113）**（LAWWW-B 05:52：四棟做完回這個）。06:5x 排的順序（已告訴 LAWWW-B）：
  - 還沒有光照貼圖的正式室內：便利商店 cvs_interior → 書店 bookstore_interior → 溫州街三家（wz_brunch／print／teahouse）→ 體育館（gym_interior、gym_b1）→ 美國 us_*。
  - 便利商店：已交、已整合（d5bfed485）。**書店：已交（10:4x）**（README `test_shots/bookstore_lm_1031/README.md`；patch `patches/bookstore_lm_1031.patch`；Node 786／0）。下一間：溫州街三家（wz_brunch／print／teahouse）。
  - CAM-PILLAR-HALLS 續（門廊兩端側牆）：已交（patch `cam_pillar_halls_endwall_1031.patch`）。
  - 便利商店的做法紀錄：照 bake_noodle.sh（同一排公館南側店面、店面朝東、太陽 0）寫 bake_cvs.sh。
    - 燈：天花板十條 LED 燈條（cvs_interior.py：z −3.2～3.2 每 1.6 m、x ±0.6～±5.4，H−0.05）＋飲料櫃背光（右牆 x≈5.9、z 0～4）。
    - --nolm：cvs_led、cvs_cooler_light、cvs_goods_items（四萬多個三角形的商品）、SIGN_FACE、glass、rail、tag、black、steel 等小零件。
    - 注意：attachCvsInterior 對 cvs_wall／floor／shelf／counter 加 TK.bounce（自發光）——麵店也是這樣、遊戲內一起調參數。
- **NAV-LIBHALL-ISLAND-1030 已交、已整合（cfb70a5fd，`patches/libhall_island_1030.patch`；LAWWW-B 21:37）**（P2）：總圖大廳一樓約 (5.85,-8.4) 2 格導航孤島（換回舊 GLB 也一樣）；改 `library_layout.js` 阻擋接回大塊或封掉；`tests/library_copier_unit.js` 有 FAIL 就 exit 1（原本 FAIL 也 exit 0）；跑 `nav_buildings_unit`。
- 已交、已整合：SOCLIB-LM-1030＋BOYA n19（3bc7a8800）。
- **X133 第二版等使用者的地圖或照片**（使用者 10-30 16:5x 回 LAWWW-B）：第一版照舊在遊戲裡（f75d60a4c），第二版不要再猜。
- **重烘要從 `claude/funny-albattani-iawshm` 拿烘焙用的原始貼圖**（LAWWW-B 21:37 同意留在這裡、不搬進開發分支：遊戲不讀）：`tools/blender/env_second/textures/` 底下 asphalt_02、castle_brick_02_white、concrete_floor_painted、floor_tiles_06、grass_ground、large_sandstone_blocks、linoleum_brown、red_brick_03、snow_02、white_sandstone_bricks、withered_grass 這 11 種開發分支沒有（宿舍四人房的 `floor_tiles_06` 就是因為這樣第一次烘不起來）。在開發分支的測試樹重烘以前，先把這些資料夾複製進去。
- **注意**：我的分支 10-16 以後沒有合併開發分支（直接 merge 一百多個衝突），一律在開發分支的測試樹上做、只把自己負責的檔案搬回來。測試樹 `scratchpad/slwt` 在開發 44337adcb（加了 A、B 的 patch＋C 的試烘）、`scratchpad/devclean` 在開發 3ba38e34a＋四棟柱子 patch（沒 commit；C 的測試樹存在 stash）。
- **沒有遠端備份的**：scratchpad 的截圖、測試樹、總圖大廳的重烘輸出（重做就有：`bash tools/blender/env_second/lightbake/bake_library_hall.sh 512`）。

## 📣 給 LAWWW-B（2026-10-30 23:3x UTC｜PERF-ZONE-ENTER-1018 第三輪（室內）交件；send_message 另外傳）

- README：`docs/art-rebuild/second_ai/test_shots/zone_enter_interior_1030/README.md`；patch：`docs/art-rebuild/second_ai/patches/zone_enter_readback_1030.patch`（只改 `src/zones3d.js`）。
- `Z3.prewarm`／`warmup` 本來就每個區域都做；室內淡入後新編 shader 只有 0～5 個。真正停最久的是兩段讀像素，已拿掉。
- **18 站整體在 SwiftShader 看不出變快**——照實寫在 README 第三節第 2 點；剩下的三種停頓（第四節）在載入流程，你決定。
- Node 772／3（aa497、whois、xinci_romance 開發原樣也 FAIL：讀不到 AA 的稿）。

## 📣 給 LAWWW-B（2026-10-30 21:1x UTC｜NOODLE-LM-1030＋LM-COLLAPSE 法律學院圖書館 交件；send_message 另外傳）

- **麵店**：README `docs/art-rebuild/second_ai/test_shots/noodle_lm_1030/README.md`。換 `noodle_interior.glb`＋兩張光照貼圖（＋json），不用改程式。
- **法律學院圖書館**：README `docs/art-rebuild/second_ai/test_shots/lm_collapse_1030/README.md`。換 `lawlib_interior.glb`＋兩張光照貼圖，不用改程式。
- 全部 Node 775／0。

## 📣 給 LAWWW-B（2026-10-30 19:0x UTC｜SOCLIB-LM-1030＋BOYA n19 交件；send_message 另外傳）

- **社科圖**：README `docs/art-rebuild/second_ai/test_shots/soclib_lm_1030/README.md`。
  - 換二進位：`soclib_interior.glb`＋`soclib_interior_lm_day.webp`、`_night.webp`（＋`soclib_interior.json`）。程式不用改（`attachRoomGLB` 自己接）。
  - **要套**：`docs/art-rebuild/second_ai/patches/soclib_lm_test_1030.patch`（只改 `tests/singleside_interiors_unit.js`：天井烘焙以後沒有反面，改成檢查留下來的是看得到的那一面）。對 753e32cd3、最新 207cffb0e 都套得上。
- **博思 n19**：README `boya_lm_1030/README.md` 第六節。只換二進位：`boya_interior.glb`＋兩張光照貼圖（＋json）。
  - 講桌桌面 #26282b → #5c5953；101／102 講台前斜的深色影子＝烘焙工具 bug，修了重烘。
- 全部 Node 772／0。舊房間重烘（LM-COLLAPSE-1030）等你決定。

## 📣 給 LAWWW-B（2026-10-30 15:0x UTC｜BOYA-LM-1030 博思教學館室內 交件；send_message 另外傳）

- README：`docs/art-rebuild/second_ai/test_shots/boya_lm_1030/README.md`。
- 換二進位：`boya_interior.glb`＋`boya_interior_lm_day.webp`、`_night.webp`（＋`boya_interior.json` 統計）。
- **要套 patch**：`docs/art-rebuild/second_ai/patches/boya_lecture_furn_1030.patch`（對開發 dd8b216c0，`git apply --check` 通過）——teach3d.js 看到 SEATPANS 就藏起備用方塊桌椅、接 Z3.seatFold；`desk_furniture_unit.js` C 項跟著改找的地方；新測試 `boya_lecture_glb_unit.js`。
- 全部 Node 771／0；遊戲內 `boya_fold_check.py` ALL PASS（開發原樣 FAIL）；draw call 差不多、三角形最多 +2 萬；GLB 1.32 → 4.51 MB。

## 📣 給 LAWWW-B（2026-10-30 10:0x UTC｜D115 改名美術字＋X133 總圖前草皮第一版 交件；send_message 另外傳）

- **改名**：`docs/art-rebuild/second_ai/test_shots/rename_art_1030/README.md`。
  - 換二進位：`campus_gate.glb`、`campus_bell.glb`、`campus_boya.glb`（extras 的字）、`linze_interior.glb`、`classroom_201.glb`、`boya_203.glb`（貼圖）、`assets/bg/ntu_linze.webp`（重拍）。不用改程式。
  - 遊戲內同角度改前改後都對。`wz6_items.glb`（支援素材）也改了。
  - `plate_border_cap_1030.patch`（選用）：博思名牌外框上限，4:1 以內的牌子不變。
  - 測試樹（開發 ca5f3381c＋這一包＋外框 patch）全部 Node 763 過、1 FAIL：`home_unit.js`，乾淨的開發分支一樣 FAIL（題目還寫政大）。
- **X133**：`docs/art-rebuild/second_ai/test_shots/lib_lawn_1030/README.md`。
  - `campus_lib_lawn.glb`（226 三角形）＋`lib_lawn_1030.patch`（zones3d、assets3d、新測試 `tests/lib_lawn_unit.js`）。
  - 兩個 patch 一起套 `git apply --check` 通過。

## 📣 給 LAWWW-B（2026-10-30 08:0x UTC｜CAFE-LM-1030 兩點半 Café 光照烘焙交件；send_message 另外傳）

- README：`docs/art-rebuild/second_ai/test_shots/cafe_lm_1030/README.md`。
- 換二進位：`cafe_interior.glb`（多 TEXCOORD_1、extras.lightmap）＋`cafe_interior_lm_day.webp`、`_night.webp`。**不用改程式**（attachRoomGLB 自己接）。
- 白天：店面西曬、窗框影子、天光；晚上：十二盞吊燈＋立燈。椅凳桌、植物、杯盤照舊即時光。
- 測試：全部 Node 738 支 0 失敗；白天／黃昏／晚上 × 三個鏡頭同角度改前改後。draw call 不變。

## 📣 給 LAWWW-B（2026-10-30 07:3x UTC｜X132 CAFE-WINDOW-LIVE-1030 交件；send_message 另外傳）

- README：`docs/art-rebuild/second_ai/test_shots/cafe_window_live_1030/README.md`；patch：`docs/art-rebuild/second_ai/patches/cafe_window_live_1030.patch`（只改 zones3d.js＋新測試 `tests/cafe_street_live_unit.js`）。不用換二進位檔（用溫州街現有的 wenzhou_street、wz_props）。
- 做了什麼：Café 店面玻璃外原本那張畫的街景 → 溫州街真的 3D 模型照實際位置（溫州街 (x,z) → Café (z, 61−x)）、裁切平面只畫玻璃外、晚上亮窗與路燈光圈、黃昏偏暖、4 個路人（E.addExtra）。
- 測試：單元測試改前 10 FAIL → ALL PASS；全部 Node 738 支 0 失敗；白天／黃昏／晚上 × 三個鏡頭同角度改前改後。
- 效能：門口鏡頭 158→265 draw call、25→47 萬三角形（最多黃昏 310、53 萬）；和溫州街本身同一級。手機實機沒量。
- 下一步（我）：Café INTERIOR-AAA（光照烘焙）→ X133 總圖前草皮 → 法律學院圖書館。

## 📣 給 LAWWW-B（2026-10-30 06:4x UTC｜X140 系外套交件＋#120 床欄透空 patch 給你看；send_message 另外傳）

- **X140（SK02-LINE-JACKET-1030）**：README `docs/art-rebuild/second_ai/test_shots/jacket_econ_1030/README.md`。
  - 二進位：`assets/models/char/vroid_yuting.vrm`（多 `JACKET_ECON`）、`assets/models/env/second_ai/dorm_room4.glb`（多 `JACKET_CHAIR`）、`dorm_room4.layout.json`（多 `jacket_chair`）。三張光照貼圖沒變。
  - patch：`docs/art-rebuild/second_ai/patches/jacket_econ_1030.patch`（assets3d `hide`、`CHAR.setJacket`、`z.setJacketChair`、新測試 `tests/jacket_econ_unit.js`）。
  - 遊戲內 `jacket_ingame.py` ALL PASS；`jacket_econ_unit`、`dorm_lightmap_unit` ALL PASS；全部 Node 737 支 0 失敗（測試樹＝開發 4df154b26＋DORM203＋這一包＋cine_seethru）。
  - 你接：什麼時候穿（存檔裡記狀態，每次建玩家模型後叫 `CHAR.setJacket`）、什麼時候掛椅背。
- **#120 床欄透空**：README `docs/art-rebuild/second_ai/test_shots/cine_seethru_1030/README.md`；patch `cine_seethru_1030.patch`（只改 engine3d：`E.cam.seeThru={x,y,z,r,aspect}`）。**等你看過再整合**。建議中心＝躺著的身體中段、床墊上 0.25～0.3 m，r 0.2，aspect 0.5。
- **之後的佇列**：Café＋X132 窗景 → X133 總圖前草皮 → 法律學院圖書館。

## 📣 給 LAWWW-B（2026-10-30 05:3x UTC｜DORM203-LM-1030＋DORM-SLEEP-VISUAL-1030 場景那一半 交件；send_message 另外傳）

- **README**：`docs/art-rebuild/second_ai/test_shots/dorm203_lm_1030/README.md`。
- **patch**：`docs/art-rebuild/second_ai/patches/dorm203_lm_1030.patch`。最新開發 `ba7c0726d` 上 apply 通過；和 rt_night、library_hall_lm 三包依序也通過。
- **二進位**：
  - `dorm_room4.glb`、三張光照貼圖（day／night／dark）、`dorm_room4.layout.json`
  - `prop_pothos.glb`、`dorm_y2_items.glb`、`dorm_y3_items.glb`、`aa_support/v0_dorm_props.glb`
- **測試**：全部 Node 736 支 0 失敗；dorm_lightmap_unit 開發 FAILED 9 → ALL PASS；進兩次 0 錯誤。
- **還沒的**（LAWWW-B）：
  - 人物爬梯、躺下、睡覺流程。
  - 熄燈時把半球光、方向光降下來（沒烘焙的小東西偏亮）。
- **之後的佇列**：X140 系外套（JACKET_ECON、JACKET_CHAIR）→ Café＋X132 窗景 → X133 總圖前草皮 → 法律學院圖書館。

## 🔴 使用者新指示（2026-10-30 04:2x UTC，直接對 LAWWW2-B 說；P0）

- **原話**：「繼續做，第四輪好了給我看 我覺得宿舍玩加上去睡覺要真的有畫面 不然從頭到尾都是站在門口說睡完覺 很沒有真實感 床的比例也要注意 每個室友書桌上東西不要重疊」
- **意思**：
  1. 宿舍睡覺要有真的畫面。現在是 `zones3d.js` dorm 的 sleep 互動點在 L2 梯子前，淡出就睡完，人不上床。
  2. 床的比例要注意。
  3. 每個室友書桌上的東西不要重疊。
- **處理**：併進 DORM203-LM-1030（203 這一包）；兩點半 Café 往後排。
  - 我（場景）：床、梯子、躺的位置、睡覺的鏡頭、熄燈的光（第三張光照貼圖），寫進 `dorm_room4.layout.json`；附 zones3d.js 的 patch 草稿。
  - LAWWW-B（人物、核心系統）：爬梯子、躺下的動畫，睡覺流程的接法。
- **通知**：04:2x send_message 給 LAWWW-B，DELIVERED，等 ACK；請它登記 USER_WANTS。

## 📣 給 LAWWW-B（2026-10-30 03:xx UTC｜LIB-HALL-LM-1028＋RT-NIGHT-1028 交件；send_message 另外傳）
- **上一任 LAWWW2-C 的兩個 WIP，我收尾交件**。交件 SHA＝這個 commit（outbox 第 206、207 筆）。v9.10.14 凍結中：照你說的在獨立工作樹先套。
- **怎麼套**（開發 `c76d0cb69` 上兩份 `apply --check` 都過）：
  1. `git apply docs/art-rebuild/second_ai/patches/library_hall_lm_1028.patch`（多了 `tests/singleside_interiors_unit.js`：大樓梯改實心石材、烘焙前拿掉了反面，踏面不再需要反面，只拿掉那一項檢查）
  2. `git apply docs/art-rebuild/second_ai/patches/rt_night_1028.patch`（`src/zones3d.js` 的 `Z3.roomLightmap`；新 `tests/room_rtnight_unit.js`）
  3. `git checkout <這個 commit> -- assets/models/env/library_interior.glb assets/models/env/library_interior_lm_day.webp assets/models/env/library_interior_lm_night.webp tools/blender/env_second/lightbake/bake_room.py tools/blender/env_second/lightbake/bake_library_hall.sh tools/blender/env_second/lightbake/lm_probe.py tools/blender/env_second/lightbake/library_interior_lm.json`
- **測試**：開發 `c76d0cb69`＋兩份 patch＋二進位檔：全部 Node 725 支 0 失敗；`library_hall_lightmap_unit`、`room_rtnight_unit`（開發 FAILED 9）ALL PASS；進兩次（新工具 `shots/lm_reentry.py`）總圖、霖澤館 0 錯誤。
- **效能**（總圖大廳一樓、二樓各兩個方向）：fps 看不出變慢、draw call −4～+3%、三角形 +3～8%。
- **晚上**：總圖閘門、服務台小東西跟著地板暗；天窗晚上暗（兩包都要套）；萬才館、男一舍門廳幾乎一樣。
- **缺點**：總圖光照貼圖解析度偏低（填滿率 28.7%、地板 9 px/m，男一舍是 18）；近看影子比較糊。之後可分兩張或 2048。
- README：`test_shots/library_hall_lm_1028/README.md`、`test_shots/rt_night_1028/README.md`。`READY_FOR_ART_REVIEW`；iPhone 實機沒測；BB-B 驗畫面。
- **另外兩個美術決定**（你 02:20 問）：夏天傍晚窗景維持；體育館大廳木格柵波紋記成已知，排進 INTERIOR-AAA 體育館那一輪（`b0604a236`）。
- **下一步（LAWWW2-B）**：照 INTERIOR-AAA-REVIEW-1028 第 5 節推下一間室內；暫停中的羽球第四版、社博帳篷 seeThrough 照舊暫停。

## ✅ 接班：2026-10-30 02:1x UTC｜帳號 B｜LAWWW2-B｜`session_01GV1WG3UeT2DhuDpxeWJsvD`｜分支 `claude/funny-albattani-iawshm`
- **使用者原話**：「上個帳號來不及交班 你現在要接班 查的到他做到哪邊和代辦事項嗎 有什麼他正在做沒有放上github的? 我也會通知這個帳號其他AI上線 你接班後先跟其他AI訊息聯絡測試」
- **上一任沒交班**：LAWWW2-C（帳號 C，`session_015BuNi47yLUt5PviELapMNj`，分支 `claude/focused-cray-c9uwvw`）還登記在值班；最後 push `4b1fcc458`（10-28 15:27Z）。照使用者明確指示接班：`duty register --user-ok`（工具記 no-handoff 異常）。
- **RULE_SOURCE**：`duty find` → `claude/adoring-meitner-mqzst8`（值班 C、seq 32）。帳號 B 的 LAWWW-B 接班以後會改。
- **合併**：`claude/focused-cray-c9uwvw` 快轉進我的分支（我上次的 `e1486b51b` 是它的祖先），沒有衝突。
- **上一任正在做、還沒交件的（都已在 GitHub，WIP）**：
  - **LIB-HALL-LM-1028**（P2）：總圖大廳擺設＋光照烘焙。GLB、兩張光照貼圖、`patches/library_hall_lm_1028.patch`、README、截圖都推了（`4b1fcc458`）。README 最後一行「施工中：數字、測試、缺點」——效能數字、測試結果、缺點還沒寫，**沒交件**。
  - **RT-NIGHT-1028**（P3）：有光照貼圖的房間，沒烘焙的細小零件晚上跟著暗（`patches/rt_night_1028.patch`，`zones3d.js` 的 `rtK`）。patch 推了，**沒測完、沒交件**。
  - **INTERIOR-AAA-REVIEW-1028**（P1，使用者 P0 UA-LAWWW2-1028-01「廉價手遊感」）：照檢討報告第 5 節一間一間推；已交 201 v2、202 v2、霖澤館大廳、萬才館、男一舍門廳、接縫修正（都已整合）。總圖大廳是第七包。
  - 暫停中：羽球第四版（WIP `1aba3ec42`）、社博帳篷 seeThrough（WIP）。
- **沒推上 GitHub 的**：查不到。帳號 C 的容器我看不到；照 D49 以遠端最後 push 為準，`4b1fcc458` 以後如果它在本機還有做（例如 README 的數字、測試），那些沒有了，要重做。
  - 我自己（帳號 B）10-25 的本機東西：公寓、C 棟 208 屋內的改前改後截圖（scratchpad），LAWWW2-C 10-27 已接手第四份收尾，這些已經過時，不補。
- **下一步**：① 跟 LAWWW-B、AA-B、BB-B 傳訊息測試 ② 把 LIB-HALL-LM-1028 收尾（量效能、跑測試、寫缺點）→ 交件 ③ RT-NIGHT-1028 測完交件 ④ 照檢討報告推下一間室內。

## 📣 給 LAWWW-C（2026-10-28 13:5x UTC｜LM-SEAM-1028 交件：之前交的五間＋男一舍門廳的光照貼圖接縫，只換 GLB；send_message 另外傳）
- **起因**：男一舍門廳第一次正式烘焙，門框上方一條條點狀黑線（方塊拼的牆段 T 形接頭露縫，看到夾在中間、烘成全黑的面）。之前交的 201、202、霖澤館大廳、萬才館也量到 50～470 m² 全黑的面。
- **交件 SHA**：`d5e28e291`。**只換二進位檔，程式不用改**：
  - `git checkout d5e28e291 -- assets/models/env/classroom_201.glb assets/models/env/second_ai/linze_202.glb assets/models/env/linze_interior.glb assets/models/env/wancai_interior.glb assets/models/env/second_ai/wancai_multi.glb assets/models/env/dorm_hall.glb`
  - 男一舍門廳：開發分支 `217e655bd` 整合的是接縫工具第三版，這包換成第六版。
- **工具**：`tools/blender/env_second/lightbake/lm_fix_hidden.py` 第六版。貼圖不動，只改第二套 UV。
  - 夾在零件中間的面：接共用一條邊的那一面。
  - 露在外面的面：接附近同方向的面。
  - 朝建築外面的面：沒分像素的接附近有亮的面，烘成全黑的不動。
  - 露在外面、本來就很暗的縫：不拉亮。
- **交件前自己抓到、已經修掉的退步**（第三～五版）：
  - 202 後牆「教室使用須知」下面一塊暗影：只看中心判斷全黑，整面牆被改掉。
  - 霖澤館大廳地板朝外的切邊變黑。
  - 男一舍門口往裡看，門洞裡的牆一塊暗的。
- **玩家看得到的**：
  - 201：窗框頂、捲簾盒、壁柱邊上的黑線不見；兩扇門中間的鋁壓條、出口燈側面本來全黑，現在是鋁色。
  - 萬才館大廳：花崗石柱子轉角的黑線不見。
  - 霖澤館大廳：木條牆不規則的黑線不見。
  - 其他看起來幾乎一樣。
  - 截圖：`docs/art-rebuild/second_ai/test_shots/lm_seam_1028/README.md`。
- **沒修**：男一舍走廊北牆和樓梯間牆的接頭，放大看還有一點一點的暗線（第三版也有）。要從建模改，之後另開一項。
- **測試**：開發分支 `ce70927ed`＋六個 GLB，相關 16 支 Node ALL PASS（rooms_glb、x78_rooms、linze／wancai／dorm_hall_lightmap、room_ceiling、nav_buildings、door_open、seat_fold、aa509_s0、宿舍六支）；company_priv_unit 4 項 FAIL 和這包無關（拿掉六個 GLB 一樣，我這邊缺企劃分支 commit f6069e42d）。
- 三角形、節點、材質、`extras.lightmap` 都不變；頂點和 GLB 大小見 README。
- iPhone 實機沒測。

## 📣 給 LAWWW-C（2026-10-28 12:5x UTC｜DORM-HALL-LM-1028 交件：男一舍門廳擺設＋光照烘焙；send_message 另外傳）
- **起因**：使用者 P0（UA-LAWWW2-1028-01）室內「廉價手遊感」；檢討報告第 5 節的順序。這是第六包，玩家每天起床、出門、回來都會走過。
- **交件 SHA**：`4d89f42fe`。
  - 程式：`git apply docs/art-rebuild/second_ai/patches/dorm_hall_lm_1028.patch`（開發分支 `a35df1f5c` 上 apply --check 通過）。
    - `src/data/dorm_layout.js` 八筆擺設（包裹架、傘架、滅火器四支、洗衣籃、二樓回收桶）。
    - `src/dorm3d.js` 兩處：家具多一種 `prop`（和 `building3d.js`、`wancai3d.js` 一樣）；正式模型接上以後，自己住的那一扇門（`HOMES` 的 `rep`）上別人的東西藏起來——大四住 409 用 202 那扇門，202 的社團貼紙那一年不顯示。
    - `tools/blender/dorm_hall.py`（開發分支的這支還沒有 NPC-POOL-ART-1028 的公用冰箱那段，一起補上）、新測試 `tests/dorm_hall_lightmap_unit.js`、`LICENSES.md` 男生宿舍室內那一列。
  - 二進位檔：`git checkout 4d89f42fe -- assets/models/env/dorm_hall.glb assets/models/env/dorm_hall_lm_day.webp assets/models/env/dorm_hall_lm_night.webp`。
- **光照的程式不用改**：宿舍也走 `B3.attachFormal`。
- **測試**：開發分支 `a35df1f5c`＋patch＋二進位檔：`dorm_hall_lightmap_unit`（新）、`room_ceiling_unit`、`nav_buildings_unit`、宿舍相關 36 支 Node 測試 ALL PASS。
  - 拿掉 `dorm3d.js` 的改動，新測試 FAIL：擺設站得上去；大四 202 門上還有貼紙。
- **一起修的（開發分支原本就有）**：走廊北牆和樓梯間的牆疊在同一個平面（`check_coplanar` 同方向疊面 50 → 7），遊戲裡會閃。
- **效能**：draw call 多 0～13%（門口 69 → 73、走廊 52 → 57，拿掉路人量）；光照貼圖兩張 96＋81 KB；填滿率 52.3%。
- **進兩次**（同一次遊戲進出宿舍再進來）：兩次都接上 45 個材質、shader 0 個編不過、沒有 JS 錯誤。
- **新工具 `tools/blender/env_second/lightbake/lm_fix_hidden.py`（不用重烘，只改 GLB 的第二套 UV）**：這包第一次正式烘焙在門框上方看到點狀黑線——方塊拼的牆段 T 形接頭露縫，看到夾在中間烘成黑的端面。
  - 沒分像素、全黑的面改接旁邊看得到的面的光（夾在中間的接共用邊的那一面；露在外面的接附近同方向的面）。`bake_dorm_hall.sh` 最後一步就是它。
  - 之前交的 201、202、霖澤館大廳、萬才館量到 60～470 m² 全黑的面，我接著套這個工具（LM-SEAM-1028），只換 GLB。
- iPhone 實機沒測。

## 📣 給 LAWWW-C（2026-10-28 10:3x UTC｜WANCAI-LM-1028 交件：萬才館室內擺設＋光照烘焙；send_message 另外傳）
- **起因**：使用者 P0（UA-LAWWW2-1028-01）室內「廉價手遊感」；檢討報告第 5 節的順序 201 → 霖澤館大廳 → 其他。這是第五包。
- **交件 SHA**：`69bf6b2e4`。
  - 程式：`git apply docs/art-rebuild/second_ai/patches/wancai_lm_1028.patch`（`478890c97` 上 apply --check 通過；和 `lobby_ceil_1028.patch` 一起也通過）。
    - `src/data/wancai_layout.js` 九筆擺設、`src/wancai3d.js` 家具多一種 `prop`（和 `building3d.js` 一樣）、`tools/blender/wancai_interior.py`、新測試 `tests/wancai_lightmap_unit.js`、`LICENSES.md` 萬才館那一列。
  - 二進位檔：`git checkout 69bf6b2e4 -- assets/models/env/wancai_interior.glb assets/models/env/wancai_interior_lm_day.webp assets/models/env/wancai_interior_lm_night.webp`。
- **光照的程式不用改**：萬才館也走 `B3.attachFormal`，大廳那一包加的接法看到 `extras.lightmap` 就接上。
- **測試**：開發分支 `116d70325`＋patch＋二進位檔：`wancai_lightmap_unit`（新）、`room_ceiling_unit`（連同 LOBBY-CEIL）、`nav_buildings_unit`、`wancai_semb_unit`、`nav_lawlib_unit` 等 ALL PASS。
  - 拿掉 `wancai3d.js` 的改動，新測試 FAIL：展示櫃、小圓桌變成站得上去。
- **效能**：draw call 多 7～10%（入口 128 → 139）。
- **要注意的**：西南角（法律學院圖書館門口）、樓梯那一側在二樓樓板下面，比改前暗。BB 看畫面覺得太暗，我再加崁燈重烘。
- iPhone 實機沒測。

## 📣 給 LAWWW-C（2026-10-28 10:1x UTC｜LOBBY-CEIL-1028 交件：大廳吊燈讓 room_ceiling 不過的那 12 個三角形；send_message 另外傳）
- **交件 SHA**：`e29fde3c5`。
  - 程式：`git apply docs/art-rebuild/second_ai/patches/lobby_ceil_1028.patch`（只有 `tools/blender/linze_interior.py`：開發分支還沒有的頂點色合併那段＋吊燈；`116d70325`、`478890c97` 上 apply --check 通過）。
  - 二進位檔：`git checkout e29fde3c5 -- assets/models/env/linze_interior.glb assets/models/env/linze_interior_lm_day.webp assets/models/env/linze_interior_lm_night.webp`。
- 中庭六盞吊燈的發光條（`light_panel`，5 mm 方盒）拿掉朝上那一面（`open_top()`；頂面貼在燈體底下，看不到）。外觀一樣：二樓迴廊平視、晚上同角度，吊燈亮線逐列比對亮度一樣。
- 開發分支 `116d70325`＋patch＋二進位檔：`room_ceiling_unit`、`linze_lightmap_unit`、`nav_buildings_unit`、`company_priv_unit` ALL PASS；全部 Node 721 支都過（劇情稿比對 17 支要先抓到企劃線的 commit）。
- 萬才館的吊燈是同一段程式，已一起改；萬才館那包（WANCAI-LM-1028）正在烘焙。

## 📣 給 LAWWW-C（2026-10-28 09:2x UTC｜LOBBY-VC-1028 交件：大廳純色材質合併，只換二進位檔；send_message 另外傳）
- **交件 SHA**：`bfe39116c`。`git checkout bfe39116c -- assets/models/env/linze_interior.glb assets/models/env/linze_interior_lm_day.webp assets/models/env/linze_interior_lm_night.webp`；程式不用改。
- 11 個純色材質合成一個頂點色材質 `lz_vc`：網格 78 → 67，材質 32 → 22。
- 大廳本身的 draw call：入口 117 → 104、中間 115 → 105、樓梯 114 → 101（原本 93／94／90）。
- 開發分支 `165ec9ebe`＋新二進位檔：`linze_lightmap_unit` ALL PASS，同角度截圖外觀一樣（README 效能一節）。

## 📣 給 LAWWW-C（2026-10-28 09:1x UTC｜LINZE-LOBBY-V2-1028 交件：霖澤館一樓大廳第二版；send_message 另外傳）
- **起因**：使用者 P0（UA-LAWWW2-1028-01）「校內建築 空間內配置……廉價手遊感」；檢討報告第 5 節的順序 201 → 大廳 → 其他。
- **交件 SHA**：`98b90c9c5`。
  - 程式：`git apply docs/art-rebuild/second_ai/patches/linze_lobby_v2_1028.patch`（`e324ccc5e` 上 apply --check 通過）。
  - 二進位檔：`git checkout 98b90c9c5 -- assets/models/env/linze_interior.glb assets/models/env/linze_interior_lm_day.webp assets/models/env/linze_interior_lm_night.webp`。
- **內容**：
  - 擺設分四區：入口、等候、公共設施、法學院展示櫃。樓梯側面改木條牆，中庭加兩排吊燈。
  - 光照烘焙：白天南面玻璃的陽光和窗框影子、晚上燈光；亮度調了五輪，和原本的即時光一樣亮。
  - 樓梯模型改成只有看得到的面，外觀一樣。
- **程式**：
  - `building3d.js` 的 `attachFormal` 看到 GLB 的 `extras.lightmap` 就接（`Z3.roomLightmap`，`zones3d.js` 多匯出這一個）。萬才館也走這一段，它的 GLB 沒有 extras，照舊。
  - `linze_layout.js` 是第一階段的六筆擺設，導航都在牆邊。
- **測試**：`e324ccc5e`＋patch＋二進位檔：
  - `linze_lightmap_unit`（新的；拿掉改動 FAIL 6 項）、`nav_buildings`、`linze_5f`／`office`／`upper`、`wancai_semb`：ALL PASS。
- **效能**：大廳本身的 draw call 多 22～34%（入口 93 → 117），是新擺設的純色材質。下一小包合成頂點色材質，只換二進位檔。
- **狀態**：`READY_FOR_ART_REVIEW`。只有使用者能標 `ART_APPROVED`；iPhone 實機沒測。
- 截圖、數字：`docs/art-rebuild/second_ai/test_shots/linze_lobby_v2_1028/README.md`。

## 📣 給 LAWWW-C（2026-10-28 08:5x UTC｜NPC-STORY-1028＋BOOKSTORE-EXIT-SHOP-1028 交件；send_message 另外傳）
- **交件 SHA**：`4e0b212f8`。
  - 程式：`git apply docs/art-rebuild/second_ai/patches/npc_story_bookstore_1028.patch`（`30e7921b7` 上 apply --check 通過）。
  - 二進位檔：`git checkout 4e0b212f8 -- assets/models/env/second_ai/library_copier.glb`。
- **書店**：櫃台互動點 (0,4.05) r1.1 → 桌子東端 (1.8,3.2) r0.9。門口、落腳點都是「離開書店」。
  - 店員在桌子北側，所以沒照 BB 建議移到 (0,2.2)。
  - 新測試 `bookstore_exit_unit`：改前 FAIL 3、改後 ALL PASS。
- **影印機**：放東牆邊 (11.4,2.6)、正面朝西。
  - **芯慈 2-2 的站位請改成 (10.35,2.35)、(10.35,2.95) 朝 +x**：原本 (8.0,2.6) 會擠到服務台客人站的地方。
  - 新測試 `library_copier_unit` ALL PASS。
- **站位**：
  - 法圖 (−4.8,−5.2) 最近的座位在二樓：要一樓改 `seatAt:[-4.6,-6.0]`。
  - 霖澤館電梯前 (4.6,−4.3) 離電梯按鈕 0.4 m：建議 (3.2,−4.1)。
  - 其他四個沒問題。
- 畫面、細節：`test_shots/npc_story_bookstore_1028/README.md`。
- **之前的兩包已整合**：NPC-POOL-ART-1028（`971db04b9`）、HEROINE-LIFE-NPC3D-1028（`8630ac32a`），outbox 改 ACTIONED。

## 📣 給 LAWWW-C（2026-10-28 08:1x UTC｜HEROINE-LIFE-NPC3D-1028 交件：標籤同伴的配件；send_message 另外傳）
- **交件 SHA**：`73fbfc4ae`。
- **套用**：疊在 NPC-POOL-ART-1028 後面。
  1. `git apply .../npc_pool_art_1028.patch`
  2. `git apply .../hlife_props_1028.patch`
  3. `git checkout 73fbfc4ae -- assets/models/char/second_ai/name_pin.glb mug.glb lawbook.glb`
- **內容**：
  - `heroine_circle.js` PEOPLE[] 十六位加 props：只加 props，底模、label 都沒動。
  - `hcircle3d.js` 的 specOf 傳 props（一行）。
  - 新做三個配件：Café 名牌、老闆馬克杯、厚法典。
- **測試**：44e8ff8b7＋兩份 patch：badclip_bag、anon_pool ALL PASS；heroine_circle3d_unit 的讀稿 4 項 FAIL，和沒有這份 patch 時逐行一樣。
- 畫面：`test_shots/hlife_props_1028/README.md`。
- **下一步（LAWWW2-C）**：NPC-STORY-1028（總圖一樓影印機 (8.0,2.6)、六個站位）。

## 📣 給 LAWWW-C（2026-10-28 07:3x UTC｜NPC-POOL-ART-1028 交件：同學的隨身道具＋冰箱＋補給桌；send_message 另外傳）
- **交件 SHA**：`35b26938c`。
- **程式**：`git apply docs/art-rebuild/second_ai/patches/npc_pool_art_1028.patch`。開發分支 `44e8ff8b7` 上 `apply --check` 通過。
- **二進位檔**：`git checkout 35b26938c -- <檔案>`。
  - `assets/models/env/dorm_hall.glb`、`assets/models/env/second_ai/linze_supply_table.glb`；
  - `assets/models/char/second_ai/` 的十二個道具 GLB：camera_film、lanyard_tag、thermos_silver、sports_drink、recorder、cooler_bag、novel、notebook_q、handouts、audio_cable、ladle、bandage。
- **內容**：
  - 十一位同學的配件。相機背帶、名牌掛繩照底模身體量過。
  - props3d 的 DEF 可以寫 `sit:'hide'`（坐下藏）／`'only'`（坐下而且開了才看得到）。
  - 靖雯坐在傅鐘長椅時保溫瓶放在身旁（AA_498 旁白）。
  - 振宇補後背包：安全帽本來浮在背後。
  - 男一舍交誼廳冰箱、霖澤館一樓補給桌（只有那一天、GLB 載好才擋路；互動點南移 (4.6,2.05)）。
- **要你接的**：`heroine_circle.js` 的 PEOPLE[] 要能傳 props。阿姨建議 `[{name:'apron',show:true},'ladle','bandage']`。
- **測試**：`44e8ff8b7`＋patch，Node 5 支 ALL PASS；aa497、aa498、aa502 的讀稿檢查 FAIL 數和沒有 patch 時一樣。
- **細節**：截圖、同角度改前改後、效能、沒做的清單都在 `test_shots/npc_pool_art_1028/README.md`。
- **D99 不做**：衣服類、趴著睡、鯊魚夾。
- **下一步（LAWWW2-C）**：
  - HEROINE-LIFE-NPC3D-1028：標籤同伴的配件，小婷、老闆、麵店阿姨、學姊的兩個同學先做。
  - NPC-STORY-1028：總圖一樓影印機 (8.0,2.6)，順便看六個站位。

## 📣 給 LAWWW-C（2026-10-28 05:3x UTC｜INTERIOR-AAA-REVIEW-1028 第三包：202 v2＋三間光照重烘＋講台淺色地板；send_message 另外傳）
- **交件 SHA**：`e95a1aeb4`（二進位檔在 `ba625a84a`，之後沒動）。**只有二進位檔，沒有新的程式**：你已經整合 201 v2（`7b90397a4`）、第二包（`ab290c818`），這包直接換檔：
  `git checkout e95a1aeb4 -- <下面十個檔>`。
  - `assets/models/env/classroom_201.glb`、`classroom_201_lm_day.webp`、`classroom_201_lm_night.webp`
  - `assets/models/env/second_ai/linze_202.glb`、`linze_202.json`、`linze_202_lm_day.webp`、`linze_202_lm_night.webp`
  - `assets/models/env/second_ai/wancai_multi.glb`、`wancai_multi_lm_day.webp`、`wancai_multi_lm_night.webp`
- **202 v2**（使用者「廉價手遊感」、和 201 同一棟）：
  - 模壓夾板課椅；長桌改 C 形鋼腳（原本整片 4 cm 鐵板）、加電源盒；天花板改 0.6 m 輕鋼架＋格柵燈具。
  - 配置 JSON 和原本一模一樣（座位、碰撞、互動點、門）。
- **LIGHTBAKE-UV-FIX-1028**（烘焙工具，我自己查到的；201 v2 和第二包都有）：
  - 光照貼圖只用了整張的 6～9%，主要的面每公尺 2～14 個像素。
  - 頂點色零件的光照 UV 進了 TEXCOORD_0，遊戲沒吃到。
  - 烘焙時房間外面是天空，門縫漏光（202 門前地板 1.35 → 0.17）。
  - 修好：填滿 202 50%／多功能 61%／201 28%。
- **講台區木地板改淺色**：201 v2（我做的）、202 原本是深色，違反使用者永久規則 UA-LAWWW2-1023-03。改成 `#cdb594`，`scan_floors.py` 不再標 DARK。
- **測試**（開發分支 `923e81d20`＋這包的檔）：Node 11 支 ALL PASS（seat_fold、rooms_glb、x78_rooms、door_open、room_ceiling、windowless_night、class_teacher、boya_203、dorm_205、nav_buildings、singleside_interiors）；reachability_all --zones linze_202,wancai_multi,classroom ALL PASS（127 個互動點，沒有 JS 例外）。
- **README**：`test_shots/interior_202_v2_1028/README.md`、`interior_201_v2_1028/README.md`（重烘一節）、`interior_rooms_lm_1028/README.md`（多功能教室重烘）。
- **接下來**：NPC-POOL-ART-1028（法律系同學二十位的道具），然後照檢討報告推到其他室內（等使用者看過 201）。

## 📣 給 LAWWW-C（2026-10-28 03:0x UTC｜兩件交件；send_message 可以用了，兩件都另外傳了訊息）
- **WZ-SHRINE-TRAP-1028（你 02:03Z 的 P1，v9.10.12 擋發布）已交付**：`984f24dc1`。
  - patch：`patches/wz_shrine_trap_1028.patch`（基準 562a5ead9，05740674b 也套得上）。
  - 只改導航：遊戲場的阻擋只擋有遊具的南邊 2.9 m；土地公供桌＋F1 牆邊小角落擋起來。
  - BB 的 shrine_pocket_check：0 個死角、23/23 走得到。
  - reachability_all 溫州街 ALL PASS；wz_park_unit 加 2b（修改前 3 FAIL）。
  - 細節：`test_shots/wz_shrine_trap_1028/README.md`。
- **INTERIOR-AAA-REVIEW-1028 示範：霖澤館 201 v2 已交付**（使用者 P0；`READY_FOR_ART_REVIEW`，等使用者看）：`2fb76710c`。
  - 遊戲端 patch：`patches/interior_201_v2_1028.patch`（基準 05740674b）。
    - `zones3d.js`：`roomLightmap`、`seatFold` 翻椅、`roomBackdrop` 牆外暗殼、classroom 接上。
    - `tests/seat_fold_unit.js`、assets3d 說明、LICENSES。
  - 二進位檔在 commit 裡的實際路徑：`git checkout 2fb76710c -- assets/models/env/classroom_201.glb assets/models/env/classroom_201_lm_day.webp assets/models/env/classroom_201_lm_night.webp`。
  - 配置、座位、導航、存檔都沒動。
  - 同角度改前改後、效能（draw call 105→145、三角形 9.9 萬→16 萬，含人物）、還沒做到的：`test_shots/interior_201_v2_1028/README.md`。
- **暫停中**：羽球第四版（WIP `1aba3ec42`）、社博帳篷 seeThrough（WIP）照舊。
- **下一步**：等使用者看 201；看過再照檢討報告第 5 節推到其他室內（霖澤館大廳、萬才館、總圖、宿舍…）。

## 📣 給 LAWWW-C（2026-10-28 01:5x UTC｜P0 使用者新指示；send_message 還是不能用）
- **使用者直接對我說**（UA-LAWWW2-1028-01，原話）：「我仍然覺得 校內建築 空間內配置 有很大的美術提升空間 現在是一個廉價手遊感 請你去參閱3A大作好好檢討」。
- **我立刻改做 INTERIOR-AAA-REVIEW-1028**：
  1. 各棟室內現況截圖。
  2. 研究 3A 作品的室內做法。
  3. 寫檢討報告，包含「為什麼照 10-16 的 ART_SOP 做了還是廉價」。
  4. 改善計畫，挑一間做示範（同角度前後對照）。
- **暫停**：
  - 羽球第四版：WIP `1aba3ec42`，做到一半，不要套那支 WIP patch。
  - 社博帳篷 seeThrough：WIP，沒交件。
  - D40、貓等你的事照舊。
- **可能要你配合的**：如果檢討的結論是要換光照做法（烘焙光照貼圖、環境貼圖），會動到 `zones3d.js` 的 `attachRoomGLB`／`engine3d.js`。我先做示範和 patch，你決定要不要整合。
- 人物美術不在範圍（D99 凍結）。

## 📣 給 LAWWW-C（2026-10-28 01:3x UTC；收到你 01:12Z＝ACK；send_message 還是不能用）
- 收到：開門第二階段、WZCAT.hold 已整合（`8531a71ab`）；D40 第二階段你問使用者、我等；社博帳篷擋鏡頭（BB_218 最後兩節）排在羽球之後（FAIR-TENT-CAM，P3）。
- **羽球第四版（腳＋球）做到一半**（WIP：`patches/badminton_clip_v4_1028_WIP.patch`，含第三版；還沒交件）：
  - 準備姿勢膝蓋彎、兩腳比肩寬。
  - 接球的人在球飛過來時踩步移到擊球點（踩著的腳不滑）；伸拍時右腳跨一大步。
  - 羽球放大 2 倍，加淡淡的殘影。
  - 腳靠 `character3d.js` 新加的 `u.overlay.feet`（兩段式 IK，借 `ik2`）。
  - 註：第三版（`023ba6930`）你還沒合；第四版的 patch 會包含第三版，直接套第四版就好。

## 📣 給 LAWWW-C（2026-10-27 23:5x UTC；send_message 還是不能用）
- **A21 第二階段＋BB 的開門三點 已交付**：`patches/door_open_phase2_1027.patch`（只動 `src/door3d.js`、`tests/door_open_unit.js`；對 `fe2fc0241` apply --check 過）。說明、截圖：`test_shots/door_open_1027/README.md` 第二階段。
  - 有單獨門板的門推門時真的轉開（宿舍 203／205、霖澤館 202、博雅 203、萬才館研討室 A／B、多功能教室、法律學院辦公室、總圖多媒體中心、研究小間、日本宿舍）。門上的小窗、牌子、格柵從合併網格切出來跟著轉。
  - BB 三點照上一則；另外 `door:true` 布林不算、「走出校門」不是門、沒有動詞的建築入口照門。67 區對照表：`phase2_exits_kind_before_after.txt`。
  - 測試：`door_open_unit` 改前 FAILED 8、改後 ALL PASS（41）；`zone_transitions` ALL PASS（37）；瀏覽器連按兩下只推一次、推門時搖桿推不動（舊版在 SwiftShader 重現不出推兩次，README 寫了）。
- **WZCAT.hold('lie')／release() 已交付**：`patches/wzcat_hold_1027.patch`（`src/wzcat3d.js`、`src/zones3d.js` 一行、`tests/wz_cat_walk_unit.js`；對 `fe2fc0241` apply --check 過）。
  - 「所長回來」演之前 `WZCAT.hold('lie')`，`finally` 裡 `WZCAT.release()`。hold 期間 `awake()`＝false，句子自動用趴著那一版，**白天替代句可以拿掉**。說明：`test_shots/wz_cat_walk_1027/README.md` 最後一節。
  - `wz_cat_walk_unit` 改前 FAILED 2、改後 ALL PASS（29）；溫州街、貓相關 20 支 ALL PASS。
- **D40 第二階段的選擇題** 給 BB：`docs/art-rebuild/second_ai/D40_第二階段_給使用者的選擇題.md`（四題，附各答案的做法）。
- **接下來我做**：羽球下一輪（腳、球的大小）。

## 📣 給 LAWWW-C（2026-10-27 23:3x UTC；收到你 23:08Z、23:11Z 兩則＝ACK；send_message 還是不能用）
- **BB 的開門三點**併進 A21 第二階段（門板會動）一起出一支 patch（WIP 檢查點，還沒交件）：
  1. 118 巷「進〇〇」算門（`^進`）。**九間店都照推門**：我看模型，九間的室內都是同一個店面外殼（`lane118_shops.py` 的 `shell()`：鋁框玻璃門＋推把），沒有開放式的。溫州街林家乾麵（`wz_shopkit.py` A4 `door='open'`）是開放式 → 放進 `OPEN_ZONES`。
  2. 推門那 0.45 秒 `E.player.busy=true`（路線也清掉），演完還原原本的值；正在推時再呼叫回傳同一個 Promise。
  3. 洗衣間：模型裡有一片關著的淺灰鐵門 → 照推門。「走出去（大樓梯平台）」：萬才館二樓入口的玻璃門（從二樓的門出去到平台）→ 照推門。總圖正面：模型是兩扇自動門（`library_interior.py` 的 `L0_autodoor`）→ 校園↔總圖改自動門（總圖裡面的多媒體中心、研究小間照推門）。
  - 另外照全部 67 區的出入口總表找到的：校園的「進入霖澤館」「回宿舍」等 5 個本來就帶 `door:true`（布林），原本被當成「只轉身」→ 只認字串；「走出校門」原本推門 → 不是門；「博雅教學館」「體育館」「法律學院圖書館」「研究小間」這種沒有動詞的字照門（跟出來一致）；普通↔博雅空橋、美國社區「出門（去超市）」不是門。剩兩個刻意不一致：敲門（別人開門）、美國 C 棟「上樓（C 棟 208）」（先上樓梯）。
- 之後：`WZCAT.hold('lie')／release()` → D40 第二階段給 BB 的選擇題 → 羽球下一輪。

## 📣 給 LAWWW-C（2026-10-27 23:0x UTC；原本誤寫 10-28 00:3x；send_message 還是不能用）
- **羽球第三版已交付**：`patches/badminton_clip_v3_1027.patch`（對 `fe4d31a86` apply --check 過；你的 BADCLIP-BAG 兩行照留）。場邊地板立著兩個人放下來的包（BB 建議：複製身上那個包）、每一拍前小跳步 5 cm；`badminton_clip_unit` 改前 FAILED 3、改後 ALL PASS，`badclip_bag／wire_unit` ALL PASS。
- **接下來我做**：A21 第二階段（門板動，先挑最常走的幾扇）。

## 📣 給 LAWWW-C（2026-10-27 23:0x UTC；原本誤寫 10-28 00:xx；send_message 還是不能用）
- **單面化第七份（美國校園）已交付**——PERF-SINGLESIDE-GLB-1025 七份全部交完。換我分支的 `us_campus.glb`／`.json`、套 `patches/singleside_us_campus_1027.patch`（對 `de75d3106` apply --check 過；檔名把 `_WIP` 拿掉了）。
  - fps 公車站 3.46／3.51 → 3.83、法學院台階前 3.62／3.58 → 3.93（**+9～11%**；上限 +57～61% 差在樹葉卡照舊雙面、補的反面多 13% 三角形）；draw call 一樣；六格同角度一樣。README：`test_shots/singleside_glb_1025/README.md`「第七份」。
- **更正**：上面原本寫「接下來做 PS-SKIRT-LEG」——**不做**：D99 人物美術凍結（「美術的那個人不要再修人物」），沛珊的裙子是人物模型。SOC-COURT、陽台盆栽是不影響遊玩的外觀（D99：只記錄），也先不做。
- **收到你 22:55Z**（貓、開門合進 `4978b283a`；羽球 `056851057` 拿掉背包那兩行我會帶著）。**接下來照你的佇列**：羽球下一輪（從 `48e997635` 以後：場邊地板放下來的包〔BB 建議〕、腳步、球）→ A21 第二階段（門板動，先挑最常走的幾扇）→ LAWWW2-REEXPORT-US-1027（P3，下次動美國公寓前）。D99 三個優先項目需要新場景的話派給我，我插到最前面。
- **VAC-A1**（看板「待開工」）：盤點文件 `docs/art-rebuild/second_ai/VAC_A1_既有資產盤點.md` 在我的分支上，只差你合進開發分支（D88）就可以結案。

## 📣 給 LAWWW-C（2026-10-27 23:3x；send_message 還是不能用）
- **D40 體態第一階段（姿勢）已交付**：`patches/fit_posture_1027.patch`（對 `de75d3106` apply --check 過）；說明、對照圖：`test_shots/fit_posture_1027/README.md`。
  - 體能越高祐廷站、走、跑、說話越挺（經常鍛鍊肩膀往後約 4 cm、頭往後約 4 cm）；坐、騎車、羽球、開門不加；`character3d.js` 3 行（乘在動作上、不會累加）、`fit3d.js` `FIT.POSTURE`。
  - 測試：`fit_posture_unit`（真的載祐廷 VRM）改前 FAILED 1、改後 ALL PASS；載入 character3d 的 Node 測試全過。
  - **誠實**：遊戲鏡頭看得出但很細（站直了，不是變壯）。**第二階段（身體形狀）會改主角外觀，請你問使用者要不要、要多明顯**；我可以先做一張普通／結實並排圖。
- 你的四支 patch 現在對 `de75d3106` 的狀態：貓、開門、顧攤的人距離 LOD、體態都 apply --check 過；羽球第二版已經在開發分支（`b49841b83`）。
- **接下來我做**：美國校園單面化第七份收尾（同角度＋fps、README、交件）。

## 📣 給 LAWWW-C（2026-10-27 23:1x；你 22:24Z 收到；send_message 還是不能用）
- **FAIR-STAFF-LOD-1027 已交付**：`patches/fair_staff_lod_1027.patch`（對 `155323e04`、`de75d3106` apply --check 過）。做法我選引擎的距離剔除接 `fairStaff`（D108）：`engine3d.js` NPC 距離 LOD 一行，每個人可以帶 `n.lodLim={low,medium,high}`（只會縮短）；`clubfair3d.js` 顧攤的人帶 `{low:34, medium:35, high:55}`。新 `tests/fair_staff_lod_unit.js` 改前 FAILED 4、改後 ALL PASS。
  - 重量（社博 9/30、大道往西）：中 draw call 503→455、三角形 106→96 萬、畫面裡的人 32→16、模擬 fps +15%；高 +16%。README：`test_shots/fair_perf_1027/README.md`「改了以後」。
- UA-LAWWW2-1027-02 改「在開發分支」了（`f72b0bd4f`）。
- **接下來我做**：D40 體態第一階段（姿勢）。

## 📣 給 LAWWW-C（2026-10-27 23:0x；send_message 還是不能用）
- **A21 開門第一階段 已交付**：`patches/door_open_1027.patch`（對 `479e35f11`、`de75d3106` apply --check 過）；說明、截圖：`test_shots/door_open_1027/README.md`。
  - 按有門的出入口：轉向門＋右手推門約 0.45 秒再變黑；到新區域手已經放下（換區域第一格、畫面全黑時放下）。自動門只轉向；樓梯、電梯、路、開放式麵店不演；出入口寫 `exit.door:'push'|'auto'|'none'` 可以蓋過判斷。
  - 測試：`door_open_unit` 改前 FAILED 1、改後 ALL PASS（16）；`zone_transitions` 套上以後 ALL PASS（37）。
  - 門板不會動（第二階段要從各棟模型把門板分出來，要做再排）。
- **接下來我做**：D40 體態第一階段（姿勢：有在運動以上挺胸、肩膀往後；不改外觀形狀）。第二階段（身體形狀）等你問使用者。

## 📣 給 LAWWW-C（2026-10-27 22:3x；收到你 21:45Z、21:56Z 兩則；send_message 還是不能用）
- **社博那天的效能（你 21:45Z 第 3 點）量好了**：`test_shots/fair_perf_1027/README.md`。`479e35f11`、舊局社博 9/30 vs 平常 10/02、11:00、大道往西看：
  - 中畫質 draw call 382→503（+32%）、三角形 72→106 萬（+48%）、畫面裡的人 10→32、模擬 fps −29%；高畫質 +44%／+69%／−38%。舞台前往北兩天差不多。
  - **我判斷超標**。建議**不減人數、照距離藏顧攤的人**：中 35 m、高 55 m 外不畫（這個鏡頭畫面裡 15→4、模擬 fps +27%；35 m 外的帳篷在手機上只有幾個像素，看不出差）。做法在 README（engine3d.js 第 374 行的 NPC 距離 LOD 讓 `fairStaff` 用短的 `lim`）。要我寫 patch 告訴我。
  - 注意：讀檔做的測試局是舊局，社博在 9/30、10/1（9/6 是新局）——BB 測的時候也要注意日子。
- **UA-LAWWW2-1027-02**：狀態改成允許的值「做好了沒進遊戲」（`382a12e9d`）；你套進開發分支以後我改「在開發分支」。
- 羽球第二版 game3d.js 那一行你留一個就好（你那邊已經有 BADCLIP.busy）。

## 📣 給 LAWWW-C、AA-C（2026-10-27 22:xx；send_message 還是不能用）
- **J13 溫州街的貓會走動 已交付**：`patches/wz_cat_walk_1027.patch`（對 `d874aa740` apply --check 過）＋我的分支的 `aa_support/wz_cat.glb`／`.json`（取代原本的；四個姿勢名字照舊）。說明、截圖：`test_shots/wz_cat_walk_1027/README.md`。
  - 白天 07:00～17:30、不下雨：貓在小公園七個點之間走（坐一陣子 → 站起來看 → 走 → 坐）；玩家走近停下看玩家；劇情時坐著；「摸摸」跟著貓。晚上、下雨、寒流、走失、收養照舊趴著／縮著／沒有。
  - 測試：`wz_cat_walk_unit` 改前 FAILED 6、改後 ALL PASS（23）；溫州街 40 支 Node 測試、`reachability_all --zones wenzhou` ALL PASS。
  - **AA-C 請看一下**：白天公園的劇情有沒有寫「貓睡在圓椅上」這種句子（現在白天貓可能在別的地方走）。有的話告訴我是哪幾則，我讓貓在那幾則演的時候回到圓椅。
- **接下來我做**：A21 開門動作第一階段（推門姿勢＋有門的出入口播 0.5 秒；用羽球那支 patch 的 `u.overlay` 掛勾）。

## 📣 給 LAWWW-C（2026-10-27 21:5x；send_message 還是不能用）
- **羽球短片第二版**：同一個檔名 `patches/badminton_clip_1027.patch` 換新（對 `d874aa740` apply --check 過；第一版還沒套的話直接套這一份）。
  - **要注意**：多了 `src/game3d.js` 卡住偵測一行——短片約 13 秒、沒有對話，超過 10 秒門檻會跳「畫面好像停住了」、把 HUD 叫回來，**真機也會**（我第一版說真機不會，錯了）。改成羽球短片在演的時候算「有東西在演」；`tests/stale_lock_escape.py` 還是 PASS（真的卡住照樣放開）。
  - 其他：引拍拍頭垂到頭後面；以安結尾直接切到她正前方；沛珊坐在地上（第一版坐在空氣上）＋近景；羽球放大 1.5 倍。七個人都播完、沒有例外。README 有前後截圖。
- **評估 J13／A21／D40**：`docs/art-rebuild/second_ai/EVAL_J13_A21_D40_1027.md`（`cadd4d543`）。建議順序 貓 → 開門第一階段 → 體態第一階段（姿勢）；**D40 第二階段（祐廷身體變結實的形狀）會改主角外觀，要你問使用者**。
- **接下來我做 J13 貓走動**（Blender 骨架＋走路／站著／坐下動畫、白天在公園幾個點之間走、摸摸的互動點跟著貓），交 patch。

## 📣 給 LAWWW-C（2026-10-27 21:2x；send_message 還是不能用）
- **BADMINTON-CLIP-1027 已交付**：`docs/art-rebuild/second_ai/patches/badminton_clip_1027.patch`（對 `c9ed80184` apply --check 過）＋我的分支的 `badminton_props.glb`／`.json`。說明、截圖：`test_shots/badminton_clip_1027/README.md`。
  - 內容：`character3d.js` 加「疊加姿勢」掛勾 `u.overlay`（2 行，坐下、騎車不受影響）；新 `src/badminton_clip3d.js`（`BADCLIP.play(GM,{who,full})`：三個鏡頭、八種結尾照 AA_485、可跳過、播完人和鏡頭復原）；Blender 球拍兩支、羽球；新 `tests/badminton_clip_unit.js`（改前 FAILED 3、改後 ALL PASS 16 項）。
  - 你那邊要做：在 `invites3d.js` 羽球邀約見面之後、「一起的時候」那段之前呼叫 `BADCLIP.play`（第一次 `full:true`，之後 `false`＝只演鏡頭 2）；`BADCLIP.LINES[id]` 的一句接在短片後面；短片期間的「畫面好像停住了」卡住偵測提示可以考慮關掉（SwiftShader 會跳出來）。
  - **場地是 1F 羽球場**（上一則說明的原因）；要 3F 再告訴我。
  - 還不夠好：引拍時拍子沒垂到頭後面、腳不動、羽球在中景很小；以安、語彤以外的結尾只在程式裡、沒截圖。
- **接下來我做**：補拍其他六種結尾、調引拍的手腕角度（同一支 patch 再交一版）；之後回到待辦（美國第 7 校、J13／A21／D40 評估）。柏油路消失的 BUG 你要我查就說。

## 📣 給 LAWWW-C（2026-10-27 21:0x；send_message 還是不能用）
- **你 20:44Z 的 AA_485 兩件收到了**（社博先、羽球後）。貼圖合併、B08 在那之前就交了。
- **CLUBFAIR-REAL-1027 已交付**：`docs/art-rebuild/second_ai/patches/club_fair_expo_1027.patch`（對 `48d2ba832` apply --check 過）＋我的分支的 `club_fair_expo.glb`／`.json`。椰林大道兩邊 36 頂（北 18、南 16、傅鐘兩側法服／系籃）＋北側中段舞台；能加入 5、看看 10、服務台 1、背景 20；一個網格一個材質＝一個 draw call。**位置表（攤位 id → 帳篷中心、front、顧攤的人兩張椅子）在 `test_shots/club_fair_expo_1027/README.md`**，程式也有 `Z3.fairExpoFront(id)`。
  - 你那邊要做：`activities.js` 的 `club_expo_y1s1.dates` 改 `['2025-09-06']`；大二 2026-09-12 我放在 `EXPO_DAYS`（舊的 9/16、9/17 在 `FAIR_DAYS` 沒拿掉，你決定）；舊集合點 `(-13.5,13.6)`、法服 `(-18,13.5)` 現在在南側帳篷後面，改用 front；北側人行道的路人路線會穿過舞台那一段要繞。
- **羽球短片（下一件，做法變一點，請確認）**：遊戲裡打羽球是在**新體育館 1F**（`gym_layout.js` 的六面羽球場、網都在；邀約地點也是 1F「新體育館羽球場」）；3F 主球場是籃球／排球地板、沒有羽球網。所以我**在 1F 的羽球場拍**（不換區域、旁邊幾面場地本來就在畫面裡）。如果一定要 3F，告訴我，我在 3F 放網和場地線。AA 的三個鏡頭、八種結尾照做；`BADCLIP.play(GM,{who,full})`，台詞（以安、語彤、學姊、沛珊那一句）放在 `BADCLIP.LINES[id]` 給你接在短片後面。

## 📣 給 LAWWW-C（2026-10-27 21:0x；send_message 還是不能用）
- **PERF-TEX-DEDUP-1027 已交付**：`docs/art-rebuild/second_ai/patches/tex_dedup_1027.patch`（`src/assets3d.js`＋新 `tests/tex_dedup_unit.js`；對 `6c65b866f` apply --check 過）。README：`test_shots/tex_dedup_1027/`。你的五點注意都照做（只合併圖片來的貼圖、執行中改貼圖的只有路面兩處且沒有共用、共用的圖片不 close、量了時間、A→B→A 不變黑）。
  - 數字（SwiftShader）：校園場景 Texture 682→631；電腦 105.8→92.6 百萬像素（−12.5%）、手機 79.8→71.4（−10.5%）；到溫州街累計合併 74／63 張、重複的 ImageBitmap 同數 close；雜湊 25～74 ms；沒有 JS 例外。測試改前 7 FAIL＋例外、改後 ALL PASS。iPhone 有沒有比較不會被踢回標題要真機看。
- **新 BUG（原本就有，和合併、X79 都無關）**：手機模擬，**校園 → 溫州街 → 回校園，約 15 秒後椰林大道中間的柏油路不見、變成人行道地磚＋直條紋**。`?nodedup`、`?nodedup&nowarmup` 都一樣；電腦模式沒有。路面網格本身沒變（看得見、同一個材質、同一張 Canvas 貼圖 256×256）。重現：`tools/shots/road_probe.py 工作樹 URL 輸出 '?nodedup&nowarmup'`；截圖 `test_shots/tex_dedup_1027/preexisting_road_bug_nodedup_nowarmup.jpg`。要我查的話排在羽球短片之後（或你那邊先看）。
- **接下來：羽球短片**（道具 Blender 已經做了第一版：球拍兩支、羽球、球網）。

## 📣 給 LAWWW-C（2026-10-27 20:2x；回你 20:21Z 的兩件，send_message 還是不能用）
- **收到**：BADMINTON-CLIP-1027（X106）、CLUBFAIR-REAL-1027（X109，等 AA 的攤位表）。**B08 我已經交了**（`c89b4aa8d`），不用排了。
- **順序**：PERF-TEX-DEDUP-1027 先（設計照你同意的＋五點注意，離線盤點做完：89 個建築 GLB、924 份貼圖只有 554 張不同、370 份可省、約 153 百萬像素；路面的圖沒有別的 GLB 在用，柏油標記不會傳出去）→ 預計一個多小時交 → 接著羽球短片。
- **羽球短片做法（提案）**：
  - 揮拍：**程式驅動骨頭**（VRM normalized humanoid 的右上臂、前臂、手、脊椎、頭；準備 → 引拍 → 擊球 → 收拍 四個姿勢之間內插），不用 Blender 關鍵影格 clip——任何 VRM（祐廷、語彤）都能套，不必重定向、沒有 Mixamo 授權問題；腳下照舊用現成的走／待機，要移動就用引擎走位。
  - 球拍、羽球：Blender bpy 做小 GLB（球拍：框、線床、拍桿、握把，掛在右手骨；羽球：軟木頭＋羽毛裙），手機輕量。
  - 球飛：程式算拋物線（過網高度、落點），每一拍換方向；擊球那一格和揮拍同步。
  - 網：gym3d.js 已經有三個羽球場的網（平面），短片用主球場那一面；看起來太簡陋就順便換 Blender 網（網柱＋網＋白邊）。
  - 鏡頭：3～4 個（側面全景 → 祐廷背後越肩 → 語彤正面 → 球落地特寫），用 cinematic 控鏡頭；可以跳過（點一下或按鈕）。
  - 預估：第一版能看（揮拍、球、網、鏡頭、跳過）約 3～4 小時，加截圖、測試、交 patch。AA-C 的演出（鏡頭、台詞）來了我照改；還沒來之前先照上面四個鏡頭做。
  - 檔案：新 `src/badminton_clip3d.js`（或你指定）＋Blender `tools/blender/env_second/badminton_props.py`；接到哪個事件／互動點由你接。

## 📣 給 LAWWW-C（2026-10-27 20:4x；send_message 還是不能用——ToolSearch 也載不到，繼續用這裡；你 19:58Z 的 ACK 收到了）
- **US-APT-CLOSET-1027（X104，使用者 P0）已交付**：`f64e0e6d3`（GLB 在 `7e1cd225a`）。美國公寓 v3——衣物間走得進去（門開著、兩面吊衣桿＋衣服、層架、鞋、行李箱、燈）；臥室東牆照順序：床 → 書桌（緊貼床）→ 洗手間門；衛浴和衣物間對調，洗手間門開著、浴缸靠南牆；C 棟合租戶不動；「看」的字照舊。
- 套法：`docs/art-rebuild/second_ai/patches/us_apt_closet_1027.patch`（`src/us3d.js`、`src/data/us_layouts.js` 一行、`tests/us_cam_walls_unit.js`、新 `tests/us_apt_closet_unit.js`）＋從我的分支拿 `assets/models/env/second_ai/us_apartment.glb`、`.json`。對最新開發 `0969b1028` `git apply` 過。
- 測試：新測試改前 FAILED 11、改後 ALL PASS；`0969b1028`＋patch 相關 13 支 Node ALL PASS；`reachability_all --zones us_apartment,us_shared` ALL PASS。寫死座標清單、截圖、缺點：`docs/art-rebuild/second_ai/test_shots/us_apt_closet_1027/README.md`（只有書桌椅走近點要改，已在 patch；SPAWN0、去上課、明信片不用改）。
- BB 要測：進門、床、書桌、洗手間、衣物間、睡覺起床、舊存檔在公寓讀檔。READY_FOR_ART_REVIEW。
- **回 LAWWW-C 20:05Z**：①走道旁的「衣帽櫃」**留著**（位置、門、互動點都沒動），AA 那三句照舊；②舊存檔剛好站在公寓裡讀檔：`E.loadZone` 對讀檔出生點也做 `E.unstick`，新測試第 7 項（臥室、衣物間、衛浴每 0.2 m，493 個位置）移出來都站得住、走得到床邊——patch 已更新（同一個檔名）；③寫死座標的互動點、事件站位清單在 README（只有書桌椅走近點要改，已在 patch）。
- **X14 第二輪也交了**：`e55f18585`，`docs/art-rebuild/second_ai/patches/x14_prewarm_settle_1027.patch`（`src/zones3d.js` prewarmRun 5 行＋`tests/zone_prewarm_unit.js` ⑪；對 `0969b1028` apply --check 過；⑪ 改前 3 FAIL、改後 ALL PASS）。咖啡廳→溫州街（第二次）淡入後最長一格 5.1～5.3→3.2～3.4 秒，黑畫面變長 1.7 秒（等待挪到黑畫面）。README：`test_shots/x14_prewarm_settle_1027/`。
- **B08（PARK-ENTRY-B-1027）也交了**：`c89b4aa8d`（GLB 在 `bd10b3789`）。小公園遊戲場移開、入口 B 步道改線，從北巷走入口 B 直通老樹（原本要繞 42.5 m）。`patches/park_entry_b_1027.patch`＋我的分支的 `wz_park.glb`；README `test_shots/park_entry_b_1027/`。`crowd3d.js` 課輔班路線會自動改回從入口 B 進來（不用改程式）。
- 接下來：PERF-TEX-DEDUP-1027（離線盤點：89 個建築 GLB、924 份貼圖只有 554 張不同；路面的圖沒有別的在用，柏油標記不會傳出去）。

## 📣 給 LAWWW-C、AA-C（2026-10-27 19:5x；工作階段重啟後 send_message 不能用，改用這裡＝GitHub 備援通道，請讀到時回 ACK）
- **P0 使用者新指示**（19:4x 直接對 LAWWW2-C 說，紀錄 `131e59df` UA-LAWWW2-1027-02）：「美國交換學生我租的地方 有一個小的WALKIN CLOSET 不是衣櫃 然後床旁邊是書桌再旁邊是洗手間 洗手間有浴缸」。
- 我的處理（已回使用者，先照做、使用者更正再改）：us_apartment（祐廷的單人戶）衣物間改成走得進去的小 walk-in closet；臥室「床頭靠東牆 → 書桌貼床邊 → 洗手間的門」同一側（洗手間、衣物間對調）；洗手間保留浴缸、改成走得進去看得到浴缸。C 棟合租戶不動。
- 會動：`src/data/us_layouts.js` 的 US_APARTMENT_LAYOUT、`tools/blender/env_second/us_apartment.py`、`us_apartment.glb`；寫死座標的程式（床、書桌、衣物間的互動點、事件站位）我會列出來一起交 patch。
- **AA-C**：請看美國交換的稿裡有沒有寫成「衣櫃」、或寫到書桌在窗下、洗手間位置的句子；`us_life_events.js` 的「衣物間。行李箱塞在最裡面」還對（走進去看得到）。
- 我的佇列：公寓（現在）→ X14 交件（做完了，只差登記；WIP `7946893be`）→ B08 → PERF-TEX-DEDUP（你 19:30 的五點補充已讀，照做）。

## ✅ 接班：2026-10-27｜帳號 C｜LAWWW2-C｜`session_015BuNi47yLUt5PviELapMNj`｜分支 `claude/focused-cray-c9uwvw`
- **使用者原話**：「上一班來不及交班，現在由帳號 C 接班。我也跟這個帳號其他AI說了」（附上一個帳號最後的對話，那段停在 ART-WZ6 開始建模之前；查 GitHub 後確認那是 10-23～24 的對話，ART-WZ6 早已交件 `f6ace8353`、整合 `025ab4f30`）。
- **上一任沒交班**：LAWWW2-B（`session_01GV1WG3UeT2DhuDpxeWJsvD`，分支 `claude/funny-albattani-iawshm`）還登記在值班，最後 push `e1486b51`（10-25 19:22Z）。照使用者明確指示接班：`duty register --user-ok`（工具記 no-handoff 異常）。**沒 push 的東西當作沒有**（D49）。依 D75，不對帳號 B 的工作階段傳訊息。
- **RULE_SOURCE**：`duty find` → `claude/modest-rubin-2lyp7g`（值班 B、seq 27）。帳號 C 的 LAWWW 接班後會改。
- **合併**：我的分支 `2b4f2028` 是 B 分支的祖先 → 快轉到 `e1486b51`（沒有 rebase、沒有 force push）。
- **對帳**（`--ref origin/claude/modest-rubin-2lyp7g`）：`check` OK；`asks` OK（203 筆、USER_WANTS 295 列）；`incr` 異常 245 項（LAWWW2 217：outbox 第 67 筆以後 150 項欄位又是自由文字、上一班 67 個 WIP 檢查點 commit 沒分類；AA 28 項）——都是記帳格式，不是遺失的工作；LAWWW2 的我來修（照 10-21 outbox_fix 的做法）。
- **上一班停在哪**：PERF-SINGLESIDE-GLB-1025 **第四份**（美國公寓、C 棟 208、法學院圖書館、亞洲超市、C 棟臥室單面 GLB＋測試 patch＋README，fps +11～40%）已 push（`09b41377`），**沒交件**：最後一個 commit「公寓、C 棟 208 屋內補拍中」——那兩組同角度對照圖沒 push，要重拍。outbox 沒有這一筆。
- **下一步**：① 補拍第四份公寓、C 棟 208 屋內 → 交 LAWWW（outbox）② 修 outbox／WIP 分類（incr 的 LAWWW2 異常）③ 照下面上一班的佇列。
- **10-27 17:0x 更新**：
  - LAWWW-C 已登記（seq 28／29），RULE_SOURCE 改成 `claude/adoring-meitner-mqzst8`；我用新的 `--ref` 重新登記（`3c309690`），LAWWW-C 已 `duty sync`（`14016b1e4`）。
  - **新規則**（LAWWW-C 轉達）：
    - **D113**（使用者 10-27）：派子代理的人開工就推檢查點，長的工作（Blender、匯出、截圖）每 15～20 分鐘 commit＋push 一次 WIP；
    - **HV-20**：交班一定要跑 `python3 tools/handoff/check_handoff.py duty handoff …`，把自己的 `duty_LAWWW2.json` 改成 handed-off；只寫 HANDOFF.md 不算（10-27 的誤判：10-21 交班時那個檔還寫著 state on）。
  - outbox 記帳修好（`a44e9e08`：outbox_problems 0；65 個 WIP commit 補登，剩第四份兩個交件時涵蓋）。
  - 通訊實測：BB-C 雙向 ACK；AA-C 送達、還沒回。
- **10-27 17:2x 更新**：
  - **單面第四份已交件**（`d66eed04`，outbox `edddae2a`）：補拍公寓、C 棟 208 屋內 32 格＋等 8 秒重拍 4 格，改前改後一樣；開發 `5b6737cd3` 上 singleside_us_unit 舊 FAILED 7→新 ALL PASS、美國相關 18 支 ALL PASS。LAWWW-C 17:16Z ACK：DL-LW2-SINGLESIDE-4（`5f563a875`），v9.10.11 發布以後合進開發、派 BB 測；重匯問題開 **LAWWW2-REEXPORT-US-1027（P3，我的）**：開發分支重匯不了公寓、C 棟 208（配置檔舊名、aa_support／bb_support 道具組），下次動這兩個模型以前做。
  - **正在做：單面第五份——美國大超市**（`us_market.py` 加 `single_side`，玻璃照舊雙面、水果 `nodup`：三角形 98,732 → 115,382；第一次全補是 134,626，水果占 1.9 萬）。WIP `98caf3f2`。以**我分支的腳本**為底（開發分支的腳本少了 10-22 天花板單面朝下那兩行，GLB 三個分支一樣）。遊戲內 11 個位置同角度＋兩個位置 fps 在背景拍（`$S/ab_us_market.py`、測試樹 `$S/devwt12` 開發／`$S/devwt13` 開發＋新 GLB）。
  - 之後：量機場出境大廳（`airport_dep`）、美國校園（`us_campus`）的上限（工具 `$S/upper_singleside.py`：同一頁原本／全部單面各兩輪）→ 過 10% 才做。LAWWW-C：巡查時看到經濟系、寒暑假路線上更擋玩家的美術問題可以先做（說一聲）。
- **10-27 18:xx 更新**：**單面第五份（美國大超市）已交件**（`f1774b37`，outbox `fe903518`）：fps 入口 3.85→5.09、第 1 走道 1.50→2.16；三角形 98,732→115,382；修 `fruit_bin` 一半的箱子面朝下（第一次單面整箱水果不見）；新測試 `singleside_us_market_unit`（開發 FAILED 3→ALL PASS）；以我分支的 `us_market.py` 為底（開發的少 10-22 天花板兩行）。正在量機場出境、美國校園的上限（`tools/shots/singleside_upper.py`，背景，測試樹 `$S/devwt12`）。
- **10-27 18:1x 更新**：
  - **單面第六份（桃園機場出境、入境）已交件**（`ed222cf2`）：出境 fps 2.60→3.38、2.74→3.46（+26～31%；上限 +53～61%，差在玻璃、霧面玻璃）；10 格同角度一樣；新測試 `patches/singleside_airport_1027.patch`。
  - **修 `lib2.single_side`**（`56257299`）：判斷「裡外相反」的體積原本用 32 位元從原點算，離原點遠的小零件正負號會錯 → 改 64 位元、以零件自己的頂點當原點；重匯機場網格不變。已知問題（P3）：溫州街 3、118 巷 9 個店內吊燈燈罩裡外相反（開發 `5b6737cd3` 就是）。
  - **第七份（美國校園）暫停在 WIP**：`us_campus.py` 加了 `single_side`（`56257299`）；重匯 `$S/uc/ss4.glb`（155,036 個三角形，沒推：跑腳本約 1 分鐘重做）；測試 `patches/singleside_us_campus_1027_WIP.patch` 在新 GLB 上 ALL PASS、開發 FAILED 4。剩：同角度＋fps（`tools/shots/singleside_zone_ab.py`）、README、交件。
  - **LAWWW-C 18:00 P1 派工（D99）**：先做經濟系的卡——**X79 校園白天走起來會卡**、**X14 換區域（Café→溫州街）卡一下比較久**；排在美國單面化前面，量法自己決定、附改前改後數字。另外評估排期：J13 溫州街的貓會走動、B08 小公園從入口 B 走不進主園區、D40 健身的 3D 體態、A21 人物開門動作。
  - **下一步**：X79 → X14 → 第七份美國校園收尾 → 評估 J13／B08／D40／A21。
- **10-27 20:xx 更新**：
  - **X79 交件**（PERF-CAMPUS-DAY-1027，`test_shots/perf_campus_day_1027/README.md`、`patches/x79_warmup_1027.patch`）：原因＝第一次走時路上編新 shader（13 次、SwiftShader 0.5～2.2 秒）；`Z3.warmup` 淡入後背景預先編＋主動讀一次。經濟系路線第一次走：新 shader 30→0、>1 秒 9→3、多出來的時間 9.5→3.9 秒。Node 650 支 647 過（3 支缺企劃線 commit，開發一樣）。
  - user_asks 4 筆對齊 USER_WANTS（e7a47555，LAWWW-C 18:39 通知）。
  - **下一步**：X14（換區域卡一下：`$S/x14_prof.py` 寫好了，CPU profiler 分格）→ B08（遊戲場往北 1.5 m、入口 B 步道改走遊戲場南邊、wz_park 重匯）→ 第七份美國校園收尾 → 評估 J13／A21／D40。
  - 建議 LAWWW-C 討論：各棟 GLB 重複貼圖合併（校園 332 張裡 213 張重複，約 24 百萬像素；改 assets3d.js）。

## ✅ 接班：2026-10-23 06:4x UTC｜帳號 B｜LAWWW2-B｜`session_01GV1WG3UeT2DhuDpxeWJsvD`｜分支 `claude/funny-albattani-iawshm`
- **使用者原話**（06:4x）：「我回來了，請同步 GitHub 最新進度，接續工作。我也會通知同個帳號其他AI，請你們確定彼此通訊OK」（UA-LAWWW2-1023-01）。
- **值班狀態**：
  - `duty find` 的結果：RULE_SOURCE＝`origin/claude/confident-ritchie-8rwh7t`（HV-18，登記鏈 seq 23）。
  - 上一任＝帳號 A 的 LAWWW2，分支 `claude/second-ai-env-art` @ `ff339df1`，10-22 15:09Z 正常交班。
  - 中間 10-17～10-21 是帳號 C，B 的成果都已經在 A 的分支裡。
- **合併**：我的分支 `2d88db5f` 是 A 分支的祖先，快轉到 `ff339df1`（560 個 commit；沒有 rebase，也沒有 force push）。
- **對帳**（都在 RULE_SOURCE 的工作樹跑，`--ref origin/claude/confident-ritchie-8rwh7t`）：

  | 工具 | 結果 |
  |---|---|
  | `check` | 1 項異常：HANDOFF-A-1022「已驗收」沒有證據。這是 LAWWW 的任務，已轉告 LAWWW-B |
  | `incr` | OK |
  | `duty verify` | OK |
  | `roles` | OK |
  | `asks` | OK（177 筆、USER_WANTS 279 列） |

- **HV-15**：`check_orphans` 是全專案的數字：沒用到的素材 49、停住的看板項目 26（沒寫恢復條件的 0）、白名單待接 24。
  - LAWWW2 暫停中的有兩項：
    - CHAR-TEMPLATE（下次檢查 10-25，還沒到）；
    - I16 環境細節（三個優先項目穩定後）。
- **通訊**（同帳號，值班中）：
  - claude-code-remote 一開始連線逾時，06:45Z 恢復。
  - 對 LAWWW-B、AA-B、BB-B 各傳一則測試，都 DELIVERED。
  - AA-B（06:44）、LAWWW-B（06:45）也主動傳來測試，我都回了 ACK。
  - BB-B 06:47 回 ACK（分支 claude/elegant-brown-fcos7n @ 28fef8fd）。LAWWW-B 06:51 已 `duty sync`、`duty verify` OK，HANDOFF-A-1022 的證據補上了。
- **值班登記**：`docs/handoff/duty_LAWWW2.json` state on @ `ff339df1`，等 LAWWW-B 跑 `duty sync`。
- **D90 ACK**：讀過 D90、D95、D96，以及上次值班之後新增的 D99～D110、HV-12～HV-18，照這些規則工作。
- **進度（07:1x）**：
  - ART-WZ-LIN-MENU-1022：遊戲內前後截圖拍完、交件（`test_shots/wz_lin_menu_1022/README.md`）。
  - 沛珊第三十一版（WIP `9c425e65`）：
    - 在這個容器重建 r（`d8ff855e`）和試做 s（`105e8353`），和 A 那一班的檔位元組相同。
    - 遊戲渲染器比過：s 把分線那一側的太陽穴、額角蓋住了，頭頂沒有多翹出髮片的邊。所以 `HAIR_CUR_AHS` 預設改成 2.0，用預設從頭重做出來就是 `105e8353`。
    - 正面閉眼閉滿，瀏海沒有穿過眼皮。
    - VRM 已經換進 repo。
    - 遊戲內五個角度（`tools/shots/char_review.py`，椰林大道，第三十版對第三十一版）在背景拍，SwiftShader 很慢。
    - 拍完：和參考圖並排 → README 改交件版 → outbox → 交 LAWWW 驗收（D100：角色美術 LAWWW 驗）。
- **P0（07:3x 使用者直接說）ART-NO-DARK-WOOD-1023**：「圖書館三樓那種深色木地板 很醜 不要出現這種深色木底板 整個遊戲都不要 只能接受淺色木地板或其他材質」（UA-LAWWW2-1023-03）。
  - 標準：木地板的平均顏色和宿舍四人房一樣淺（目標色 `#cdb594`，GLB 平均約 205,181,148）。家具、桌面不是地板，不動。
  - 工具：`tools/blender/env_second/floors/scan_floors.py`（量每個 GLB 大片水平網格的材質平均色，標出深色木頭）。
  - 第一批 `15551b2f`：圖書館 3F `l3_parquet`、總圖大廳二樓 `lb_parquet`（161,123,86 → 206,182,149）。遊戲內前後截圖在背景拍（`$SP/floors/b1/run.sh`）。
  - 第二批 `6fbe2830`：書店、日本房間、118 巷咖啡、美國公寓（單人戶、學姊合租戶）、萬才館研討室 A、早午餐、茶行、定食，九個 GLB，結構和開發分支相同、只換地板貼圖。程式備用地板的 patch：`patches/no_dark_wood_src.patch`（對開發 719cca3b）。遊戲內前後截圖還沒拍。
  - 還沒做：3F 主球場 `arena_floor`（楓木本身 210,162,104，平均偏深是外圈深色漆；要不要調亮再看）；2D 背景咖哩店 `bg_curry.py`、視訊 `bg_video_far.py`（BB 說 2D 背景它會逐張列給使用者）；我的分支有、開發分支沒有的 GLB 還沒掃。
  - 已通知：LAWWW-B（開任務、USER_WANTS）、BB-B（07:46 ACK：深色木地板＝畫面驗收不通過）。
  - 衍生（同一條規則）：溫州街店面玻璃後的淺店內 `wz_shopkit.shallow_interior` 定食用 `wood_dk`、書店／早午餐用 `wood_lt`（#b48a5e，偏中）當地板 → 改淺色（和 118 巷店面一起做，下面）。
- **使用者 07:5x 直接說：ART-L118-FACADE-3D-1023**「118店面裡面做了 但外觀還是很2D」（UA-LAWWW2-1023-04）。
  - 原因：`wz_street.py` 第 540 行只有溫州街套用新版店面組件（`wz_shopkit.SF`），註解「公館、118 巷照舊」→ 118 巷九間店還是舊的 `shopfront`：玻璃後面是平面的景深卡 INTERIOR_FACE、招牌平板。
  - 做法：給 118 巷九間店（＋填空的小店）一份 `SF_L118`（門型、招牌、雨遮、地坪、燈、立體淺店內 `inner=True`、門口雜物），第 540 行加 lane118；導航、店門互動點照 `lane118_layout.js` 不動 → 重建 `lane118_street.glb` → lane118 整合測試 → 遊戲內前後（白天、晚上）→ 交 LAWWW。
  - 遊戲內修改前的診斷截圖在背景拍（`$SP/l118/shots.json`）。
  - 排在深色木地板交件之後；已通知 LAWWW-B 開任務。
- **使用者 08:0x～08:1x 另外四件（都已記 user_asks、LAWWW-B 開任務）**：
  - CLOSED-SPACES-1023：關著的空間（清單＋提案 `CLOSED_SPACES_1023.md`），劇情用途 AA-B 回答中。
  - WZ-CAT-LIFE-1023：公園的貓。**AA-B 定案（AA_397 第 3 節，企劃線 ffd7eef8）：子晴收養**（2028-12-11～17 寒流週、12/14 22:10 用外套包走；**AA-B 09:10 更正（8f1701b2）：子晴住臺北家裡（BB_171），貓收養後住她家，只用照片和 2D，不做 3D 房間**）。我做：照時段／天氣換位置姿勢、公園走動、摸摸貓、`CAT_curl`（寒流縮在涼亭石桌下）、大四下不顯示；抱貓只用 2D。
  - 店員支線痕跡（AA_397 第 2 節九則，使用者 08:1x 對 AA）：做店面、室內、公園時留位置——林家菜單手寫「乾麵沒有湯」、巷口茶飲櫃台貼紙、冰菓室重寫的價目板、慢讀咖啡插座那桌小卡＋十個月後牆上「榜單影本」、六張犁麵舖煮麵台旁的卡片、蛋包飯研究所門口小黑板（SF_L118 omu 已放）、公園公布欄餵貓表 → 領養公告。
  - 店員支線第二批（AA_404，企劃線 30bf21de）留位置：滇香菜單手寫「炸乳扇（限量）」、巷口家常菜櫃台「發票請投這裡」紙盒、Pasta 118 吧檯後牆兩人合照、韓食小廚小菜櫃「她的」玻璃罐、一盞茶屋櫃台舊貓照片。hwaxin_street、vet_clinic 兩張 2D 歸 BB-B（D100），已提醒 AA-B 轉。
  - ART-SHOP-VIEWS-1023：店內窗景（LAWWW-B 同意改 `W3.windowMat`，要跑 room_ceiling_unit、see_through 單元測試）。
  - 沛珊第三十一版排在這後面；遊戲內截圖那一輪在 07:2x 回合結束時被停掉了（第三十版拍了四張），要重拍。
- **進度（09:5x）：118 巷店面、公館店面一起做**（同一套 `wz_shopkit`）：
  - 深色木地板兩批都已交、已整合（`b32ee2c4`、`29e074e0`）。
  - **118 巷第二版**拍完（`$SP/l118/pc_*`）：九間店和填空小店都是立體淺店內了。但店裡整片白，跟街上一樣亮，像貼在玻璃後面的白紙。
  - **公館的原因**：十五間店（茶飲除外）玻璃後面根本不是立體店內，是遊戲畫的平面店內圖（INTERIOR_FACE）。10-18 試過立體店內，因為「騎樓下太暗、書店一片黑」退回平面圖，所以和 118 巷一樣 2D。藥局那張圖是一格格彩色方塊，最醜。
  - **做法**（WIP `b1c245cf`，之後再改）：
    - `shallow_interior` 加明暗：店內頂點色越裡面越暗（後牆 0.64）、天花板和牆角暗一點；燈、冰箱、商品照舊亮。
    - 公館十四間改成 `inner=True`。新店種：藥局 `pharm`（白層架藥盒、綠十字燈箱、藥師櫃台、血壓計）、二手唱片 `records`（封面朝外的展示架、木箱唱片櫃、唱盤）、文具畫材 `stationery`（洞洞板吊卡、畫材層架）、腳踏車行 `bike`（掛輪胎、工具板、修車架）。G02 書店改 `books`。
    - 商品用 `cvs_goods.py`（便利商店室內那一套），加藥盒、黑膠、畫材，`lod=1` 低面數。整條街一個網格，一張 1024 貼圖 `wz_goods_atlas.jpg`。
  - **效能**：
    - 第一次建 14 MB／16.8 萬三角形，太重。
    - 主要是唱片行 CD 架三千多個方塊（3.4 萬），改成書背貼圖；商品改低面數、不疊。
    - 重建後在背景拍前後截圖並量效能（`$SP/gg/run_ab.sh`）。118 巷第三版（含明暗）也一起拍（`pd_*`）。
- **進度（12:5x）**：
  - **已交付**：
    - 118 巷、公館店面立體化：`82725bf8`，LAWWW-B 已整合（`6b2827942`）。
    - 店內窗景第一批：`ecfe5a6a`，公館三家＋Café。LAWWW-B 12:33 ACK，這一兩回合合併。
    - **公園的貓 WZ-CAT-LIFE-1023**：`32e9ddf3`，outbox `d5089789`。內容：
      - 寒流那一週石桌底下 `CAT_curl`；
      - 收養以後不顯示；
      - 價目板、子晴站位的導航檢查 ALL PASS。
  - **使用者規則 X99**（經 LAWWW-B 12:06 轉述）：要使用者決定的事（場景 ART_APPROVED、選哪個版本）一律用選擇題問，給 A／B／C 選項＋我的推薦。
  - **正在做**：SQ16 輪轉單車店門口互動點＋店員支線痕跡道具（SQ12／13／14／16／19／20）。
    - 程式：`patches/sideq_shops_1023.patch`，對開發 `c42228351`。內容：
      - `traceVis`：`TRACE_SQxx` 節點照 `SIDEQ.traceOn` 開關；
      - 「找車行老闆」`shop:'bike'`；
      - SQ16 紙條 `TRACE_SQ16_note`。
    - Blender：`aa_support/sq_traces.py`、`aa_support/sq_trace_photos.py`（照片在店的模型裡拍）；五個店腳本加 `TRACE_` keep。
    - 重建的 GLB 在 `$SP/trnew/`，還沒放進 repo。測試樹 `$SP/rs` 已套 patch＋新 GLB。
    - 第一輪算圖發現三個問題，已修、重建中：
      - 韓食的罐子浮在玻璃箱裡 → 改放在箱頂 1.50 m；
      - 半熟的證書埋在牆裡（wz 的牆 0.12 m 厚、往屋裡長）；
      - 失物籃像紙箱 → 橢圓竹籃＋提把。
    - 下一步：遊戲內 on／off 截圖 → README → commit → outbox → 交 LAWWW-B。
  - **10-25 17:xx 更新（PERF-SINGLESIDE-GLB-1025 第三份＋ART-HALL-WINDOW-DUSK-1025）**：
    - LAWWW-B 15:0x：主球場用交出去的那一版；1F 大廳木格柵照舊雙面、重匯、fps 照實報。16:2x 轉 BB-B 驗收（社科圖 +33～54%、總圖大廳 +28～37%、便利商店 +30～38%、體育館 +3～27%，沒有破面）：便利商店端架促銷牌從背面不見 → 只給促銷牌補背面。
    - 已交第三份（`test_shots/singleside_glb_1025/README.md` 第三份）：
      - 溫州街、118 巷：只關「大面、背面看不到」的材質的雙面旗標（店內、牆面、騎樓柱、牆腳；幾何不動），溫州街 +8～30%、118 巷 +16～19%（另一個方向沒差別）。
      - 體育館大廳：木格柵照舊雙面，+2～11%，波紋沒了（16）。
      - 便利商店：`cvs_goods.promo(back=True)`，三角形 +8，三版對照（17、18）。
      - patch（對開發 `e015b7c10`）：`singleside_streets_1025`（新）、`singleside_gym_wood_1025`、`singleside_cvs_promo_1025`。
    - 已交 ART-HALL-WINDOW-DUSK-1025（`test_shots/window_dusk_1025/README.md`、`patches/window_dusk_fade_1025.patch`）：光線 18.6～19.2 窗外白天照片照 nk 疊成夜景照片。12/10 17:20 霖澤館窗 0.084 → 0.055（屋外 0.041）、總圖 0.116 → 0.069（屋外 0.029，剩下大多是玻璃反光）、萬才館 0.057 → 0.061（屋外 0.054）；換夜景那一刻不跳。改 `world3d.js`、`building3d.js`、`library3d.js`、`l118_shops3d.js`、`zones3d.js`（不是 engine3d／story3d／us3d）。
    - 新工具：`shots/window_dusk_ab.py`（屋外 vs 大廳窗，窗的像素用「藏起窗景平面再拍一張」找）。
    - 下一步：單面巡查美國那邊——有 `WALL_` 會淡出的室內（`us_apartment` 23、`us_lawlib` 15、`us_asian_market` 14、`us_bed_c` 11 個 WALL_ 節點，幾乎全雙面）先量上限；`us_campus`、`us_community`、`us_market*`、`airport_dep` 是戶外／不透明，照街景的經驗可能只有大面才有用。最後補超市街停車場車子 LOD 那一張截圖。
  - **10-25 15:xx 更新（PERF-SINGLESIDE-GLB-1025 第二份）**：
    - LAWWW-B 13:2x：第一份 ACK，v9.10.10 發布後整合；flow_soclib 是測試舊（BB 改，TEST-FLOW-SOCLIB-X75-1025）。
    - 已交第二份：體育館 1F 大廳、B1、3F 主球場的 GLB＋腳本、`patches/singleside_gym_1025.patch`。大廳 +2～31%、B1 +7～38%、主球場只有 +6～10%（上限 +47% 是連該畫的背面都不畫）。
    - `lib2.single_side` 新規則：裡外相反的薄零件翻成朝外（主球場欄杆收邊第一次變細）；B1 用 `flip=False`（4 片小鐵片 Blender 和 GLB 算出來相反，沒查到底）。
    - 看得出的差別：大廳木格柵放大看有斜波紋（木條比像素細），交 LAWWW-B／使用者決定。
    - 匯出 B1 要有 `bb_support/gym_b1_props.glb`、`gym_b1_entry.glb`（測試樹沒有，第一次少了 1.7 萬個三角形；我從自己的分支複製進去）。
    - 新工具 `shots/singleside_breakdown.py`（同一頁一組一組改單面量）。
    - 下一步：街景（溫州街、118 巷）用 breakdown 拆是哪一組貴 → 量得到 10% 的才做；之後 ART-HALL-WINDOW-DUSK-1025。
  - **10-25 13:xx 更新（PERF-SINGLESIDE-GLB-1025 第一份）**：
    - LAWWW-B 10:5x：同意「同一頁量上限、10% 以上才做、室內先」；開發分支即將凍結（v9.10.10 候選），交件照常交，他在獨立工作樹先套；另排 ART-HALL-WINDOW-DUSK-1025（單面巡查告一段落時看）。
    - 上限表（8 處都過 10%）：`test_shots/singleside_glb_1025/README.md`。
    - 已交第一份：社科圖、總圖大廳、便利商店的 GLB＋腳本（`single_side`）、`patches/singleside_interiors_1025.patch`（新測試）。fps 社科圖 2.35→3.4、總圖 1.8→2.55、便利商店 3.25→4.95；同角度截圖一樣。
    - `lib2.single_side` 新規則：原本就單面的材質不補反面（便利商店天花板第一次補了，高處看整片擋住）。
    - `flow_soclib.py` 在乾淨的開發也失敗（校園那一側的門口互動點），已告訴 LAWWW-B。
    - 下一步：體育館三個（`gym_interior.py`、`gym_b1.py`、`gym_arena.py` 已加 `single_side`，還沒匯出）→ 街景先拆是哪些東西貴 → ART-HALL-WINDOW-DUSK-1025。
  - **10-25 11:0x 更新（PERF-PATROL-ECON-1025 ④／PERF-SINGLESIDE-GLB-1025）**：
    - LAWWW-B 09:1x：④ 照我提的 1（單面）、2（小零件不投影）做，3（遠處簡化）先不要；之後全部環境 GLB 單面巡查照 D99 順序（公館 → wenzhou_street → lane118 → soclib_interior → library_interior → cvs → gym → us_campus → us_community／us_market／us_market_street → airport_dep），兩面都看得到的平面保留雙面，兩三棟一份交。
    - ④ 結果：**不交 GLB**（我的分支的 `gongguan_shops.glb`、`wz_street.py` 已還原成開發的版本）。試了三版：只改材質 → 鐵窗直條、葉子消失（09）；薄零件補反面（`lib2.single_side`）→ 畫面一樣（10、11），但 instancing 的鐵窗、鋁框補反面多了 3.7 萬個三角形，fps 沒差（往店面 2.1 → 2.2、另一側 2.77 → 2.63）。小零件不投影只剩鐵窗一組（2,900 個三角形），量不出來。
    - 新工具：`lib2.single_side(root, keep, nodup, skip)`（封閉的殼直接單面、開口的零件補反面）；`shots/glb_ab_views.py`（換 GLB 拍改前改後並排，正式模型載入失敗會印出來）。
    - 教訓：①遊戲照名字接手的板面（`SIGN_FACE_`／`INTERIOR_FACE_`）不能改網格，`wzAtlasFaces` 合不起來會整排店面退回套件；②街景外觀（不透明）單面量不出差別，室內 `WALL_*`（attachFormal／attachRoomGLB 設 transparent）才有用 → 巡查改成每棟先在同一頁切換量上限、10% 以上才做，室內先。
    - 下一步：等 LAWWW-B 回「單面巡查的順序改不改」；不回就照建議先量 soclib_interior、library_interior、cvs、gym 的上限。
  - **10-25 08:xx 更新（PERF-PATROL-ECON-1025）**：
    - 派工（LAWWW-B 05:0x）：經濟系路線效能巡查，先列最慢三處＋原因，再逐項修。06:0x 交「最慢三處」；LAWWW-B 06:1x 定順序 ①～⑥。
    - 報告：`test_shots/perf_patrol_econ_1025/README.md`（12 個地點的表、一次藏一類的找原因表、每一項改前改後同角度）。
    - 已做完、patch 在 `docs/art-rebuild/second_ai/patches/`（都對開發 `cc9bd3c4e`）：
      - ① 教學館室內殼、家具單面（`teach_interior.py`、`furniture_study.py` → `boya_interior.glb`、`putong_interior.glb`、`furniture_study.glb`）＋② 自習椅 10 m 外 lod1：`teach_perf_econ_1025.patch`（teach3d.js、新 `tests/teach_perf_econ_unit.js`、`tests/desk_furniture_unit.js` 椅子改成兩組合起來檢查）。博雅大廳 1.45→2.35。
      - ③ 博雅 9 盞燈 → 3 盞跟著玩家（最近的 3 個燈位、淡入淡出）：`teach_lights_econ_1025.patch`（接在 ①② 後面）。博雅大廳 2.15→3.2。試過「同一層優先」二樓人物變暗，不採用。
      - ⑤ 校園外圍 820 m 柏油不墊底：`campus_backdrop_ground_1025.patch`（zones3d.js＋新 `tests/campus_backdrop_ground_unit.js`）。校門、大道、醉月湖 +8～18%。
      - ⑥ 18／24／30 m 比較圖已拍（07、08）；24／18 m 各能快多少量測中。
    - 還在做：④ 公館店面（整排藏起來 2.3→4.1，但店內商品、單面、影子、貼圖各自都不是原因；下一輪：玻璃、亮的材質、牆面、換成不受光的材質）。
    - 測試樹：`$SP/dv8`＝開發 `cc9bd3c4e` 乾淨（量 fps 用 page.route 換檔案，沒改它）；`$SP/dv9`＝`cc9bd3c4e`＋①②③⑤＋新 GLB（跑單元測試用）。
    - 教訓：`perf_variants.py` 最後會自動「再量一次第一份」，要等它跑完才能開下一個瀏覽器工作（07:1x 兩個工作重疊，柏油第一輪的數字作廢重量）。
  - **10-25 05:xx 更新**：
    - LAWWW-B 03:5x：② 已整合（`3ea2a78d5`），fps 重量派 BB；04:3x 知會 `us3d.js` 的 `usSeasonKey(g)`（patch 要對 `96efb47a2` 以後）。
    - 已交 ③ US-COMMUNITY-EAST-PERF（自己排，03:5x 告知開工、04:5x 告知動 us3d.js 哪一段）：`test_shots/us_community_east_perf_1025/README.md`、`patches/us_cars_lod_1025.patch`（對 `bcb0dc771`）、`us_cars.glb`（＋json）、`us_cars.py`。
      - 往東最貴的是停車場 28 台車；合併網格、車材質單面都不採用（理由在 README）；遠處 14 m 外換 `_lod1`（約 1/4 三角形），近處完整版不動。
      - 往東 1.9 → 2.6、出生點 2.2 → 2.6；改前改後、切換點附近完整版／遠處版／自動並排都看不出差別。
    - 測試樹 `$SP/dv8`＝開發 `bcb0dc771`＋這份 patch＋新的 `us_cars.glb`（還沒還原）。
    - 下一項：等 LAWWW-B；巡查清單 D99 三條路線內沒有其他開著的 P1／P2。
  - **10-25 04:xx 更新**：
    - LAWWW-B 02:0x：窗景同步 v2＋沒有窗的室內已整合（`eaeefdc4b`）；派 ① US-AIRPORT-DUSK-1025 ② US-COMMUNITY-WEST-PERF-1025 ③ 之後照巡查清單自己排（D99 三條路線內）。
    - 已交 ①：`test_shots/us_airport_dusk_1025/README.md`、`patches/us_airport_dusk_1025.patch`（對 `b8a6934e7`；只動 `us3d.js` 的 `apOutside`＋兩支測試，不碰 engine3d.js）。新測試改前 FAIL 6、改後 ALL PASS；12 張截圖 errors 0。
    - LAWWW-B 02:5x：① 已整合（`91c8f9c6e`）。
    - 已交 ②：`test_shots/us_community_west_perf_1025/README.md`；`us_community.glb`（＋`.json`）、`us_community.py`、新 `tests/us_community_perf_unit.js`、量 fps 工具 `shots/perf_us_community_west.py`。
      - 原因不是樹、房子，是地面雙面＋草地墊在柏油底下；改單面、草地只鋪看得到的地方。
      - 往西（橫向）天空 4.3／改前 3.2／改後 4.0，直向 3.9／3.1／3.9；換算 BB 的量法約 5.6～6.1。
    - 測試樹 `$SP/dv8`＝開發 `32b1f99dc`＋新的 `us_community.glb`、`tests/us_community_perf_unit.js`（還沒還原）。
    - 下一項：③ 照巡查清單自己排（D99 三條路線內）。
  - **10-25 01:5x 更新**：
    - LAWWW-B 00:36：SIGN-AUDIT 已整合（`7d56892eb`）。
    - 已交：路線巡查⑤美國交換的傍晚（`test_shots/route_us_dusk_1025/README.md`，117 張、errors 0）＋ `patches/window_night_sync_v2_1025.patch`（臺灣七棟大廳 18.6、美國 VT 19.5 → 19.2）。
    - 已交：沒有窗的室內晚上不變暗（`test_shots/windowless_night_1025/README.md`、`patches/windowless_night_1025.patch`；engine3d.js 兩處，00:3x 先告知 LAWWW-B）。
    - 兩份 patch 對 `32ddad549` 一起套、分開套都乾淨；相關 Node 測試約 40 支 ALL PASS。
    - 01:3x 容器重啟過一次：改後截圖重拍；WIP 先 push 在 `b2d79438d`。
    - 測試樹 `$SP/dv8`＝開發 `32ddad549` 原樣（已還原）。
    - 下一項：等 LAWWW-B 派。
  - **10-25 01:0x 更新**：
    - LAWWW-B 00:10：B1 健身中心已整合（`32ddad549`）；下一項照順序：①路線巡查⑤美國交換的傍晚 ②沒有窗的室內晚上不變暗（動 engine3d.js 前先說哪一段）。已回 ACK。
    - 已交：SIGN-AUDIT-1025（`test_shots/sign_audit_1025/README.md`）：機場換匯看板、美國社區公車站牌字左右相反；3F 主球場舞台深色木板 → 紅地毯（D112 清查漏掉）；新工具 `check_signs.py`；新測試 `tests/sign_audit_1025_unit.js` 改前 FAIL 5、改後 ALL PASS。
    - 只記錄：118 巷七家＋定食店收銀機店員那面螢幕被機身包住（`lane118_shops.py` register() 差 3 cm）。
    - 測試樹 `$SP/dv8`：開發 `5bcdd7e8e`＋三份新 GLB（交件後還原）。
    - 下一項：路線巡查⑤。
  - **10-25 00:1x 更新**：
    - 已交：B1 健身中心不再單調（`test_shots/gym_b1_fitness_1024/README.md`；只換 `gym_b1.glb`，`gym_b1.py` v7、`gym_tex.py b1`、新測試 `tests/gym_b1_fitness_unit.js` 改前 FAIL 11、改後 ALL PASS）。
    - 順便修：大廳開館時間牌、公告欄原本貼在框後面（看起來是黑板、空木板）、字左右相反。
    - 記錄給 LAWWW-B：B1 地下室晚上偏藍偏暗（引擎室內夜間光線）。
    - 測試樹 `$SP/dv8`：開發 `5bcdd7e8e`＋新的 `gym_b1.glb`（還沒還原）。
    - 下一項：等 LAWWW-B 派；巡查表剩機場柱子（記錄）、e24b2／c2_hiking（退役事件）。
  - **10-24 23:2x 更新**：
    - LAWWW-B 22:45：舟山路路燈已整合（`5bcdd7e8e`）。
    - send_message 恢復，宿舍洗手間外牆的通知已補傳。
    - 已交（`3374cdd79`）：路線巡查④（傍晚光線照季節以後的每天路線，`test_shots/route_dusk_1024/README.md`）。
      - 沒有大問題；
      - 修一項：窗景和屋外同一刻天黑（`patches/window_night_sync_1024.patch`，五個 19.4 → 19.2）。
    - 測試樹 `$SP/dv8`＝開發 `5bcdd7e8e` 原樣。
    - 下一項：B1 健身房單調（P3），或等 LAWWW-B 派。
  - **10-24 22:4x 更新**：
    - 已交（`21fc4fd96`）：舟山路晚上不再整條是黑的（`test_shots/zhoushan_lamps_1024/README.md`、`patches/zhoushan_lamps_1024.patch`）。
    - 重看過、不用改：312／409／507 三間一模一樣（窗景、室友的東西每年都不同；`252c5d4dd`）。
    - `send_message` 還是不能用，交件都寫在 outbox。
    - 測試樹 `$SP/dv8`＝開發 `a690484c8` 原樣。
    - 下一項：巡查表 P3 還沒處理的（B1 健身房單調、出境大廳柱子貼鏡頭——都不是每天看得到）；先問 LAWWW-B。
  - **10-24 21:5x 更新**：
    - LAWWW-B 21:27：v9.10.9 發布（main `f10d27011`）；ENGINE-SEASON-DUSK A＋B、遠景店面已合進開發分支（`a690484c8`）；他改了 `engine3d.js` 的 `nearestInteractable` 一行（跟著玩家的人不擋門口）——下一份 engine patch 先 fetch 開發最新。
    - 已交（`6a95a5e51`）：宿舍四人房洗手間外牆不再是浴室磁磚（`test_shots/dorm_bath_outer_1024/README.md`）；只要換 `dorm_room4.glb`。
    - `send_message` 工具這一段時間在這個工作階段不能用（工具清單裡沒有），改用 outbox 通知；恢復後補傳。
    - 測試樹 `$SP/dv8`＝開發 `a690484c8` 原樣（GLB 已還原）。
    - 下一項：巡查表 P3 挑玩家每天看得到的（候選：312／409／507 三間一模一樣、大一女舍門口晚上馬路全黑）。
  - **10-24 16:5x 更新**：
    - LAWWW-B 16:29：ENGINE-SEASON-DUSK A、B 兩份都收，v9.10.9 後合；等的時間從巡查 P3 挑玩家每天看得到的。
    - 已交（`6a620726e`）：醉月湖北邊那排遠景店面不像布景（`test_shots/bg_city_awnings_1024/README.md`、`patches/bg_city_awnings_1024.patch`）。北側一排四成有店面、招牌壓低彩度；測試修改前 FAIL 4 → ALL PASS。
    - 測試樹 `$SP/dv8` 已還原成 `0d3125c88` 原樣。
    - 下一項：問 LAWWW-B；沒有就從巡查表 P3 挑玩家每天看得到的。
  - **10-24 16:3x 更新**：
    - LAWWW-B 15:51：巡查③登記（`0d3125c88`）；208 照舊同意；第 2 項「做」→ ENGINE-SEASON-DUSK-1024，`engine3d.js` 由我改（D108）；**v9.10.9 發布後才整合**。P3：遮雨棚記錄、e24b2／c2_hiking 是退休事件、ART-PLAYER-SEASON-OUTFIT-1024 暫停。
    - 已交（`86567dc65`，報告補完在下一個 commit）：`test_shots/season_dusk_1024/README.md`。
      - A `patches/engine_season_dusk_1024.patch`：光線用的時刻（15:00／當天日落→18.95／21:00 三點內插），臺北、布魯明頓（11/5 換冬令時間）、大阪三組日落；`G.hour` 不動。
      - B `patches/engine_after_midnight_1024.patch`（LAWWW-B 決定要不要收）：00:00～04:30 用 24:00 那一列，半夜不會突然變亮。
      - 測試：season_dusk 修改前 FAIL 14 → ALL PASS；after_midnight 只套 A FAIL 6 → ALL PASS；Node 17 支、levels_no_sky、see_through ALL PASS。
    - 測試樹：`$SP/dv7`＝開發 `0d3125c88`＋A＋B；`$SP/dv8`＝`0d3125c88` 原樣。
    - 下一項：等 LAWWW-B；沒有新派工就從巡查表 P3 挑。
  - **10-24 16:0x 更新**：
    - 已交：D99 路線巡查③經濟系那一年（`test_shots/route_econ_1024/README.md`；開發 `2b3a99cdd`，31 張）。
      - 沒有要我直接修的美術：沒有 patch／GLB。ART-ECON-3D-GAP-1021 修過的地方都正常。
      - 交 LAWWW-B 決定（引擎，D108）：傍晚的天色不分季節。11/6、12/10 17:45 是金黃色斜陽（台北 17:30 左右已天黑）；10/16 19:00 總圖窗外還是白天。
        - 建議：`E.applyTime` 照日期把時鐘換成光線用的時刻（15:00、當天日落 → 18.95、21:00 三點內插），也傳給各區的 `applyTime`。
      - P3 記錄：醉月湖北邊那排彩色遮雨棚（`TK.bgCity`）像布景；「偷偷旁聽」「登山社」沒寫背景（不在縮短的流程裡）；玩家一年四季同一套長袖（人物，不是場景）。
    - 208 門口鏡頭（P3）：試做大門擋鏡頭，遊戲內比較更差，決定照舊（`b8640cf15`）。測試樹 `$SP/dv8` 的 `src/us3d.js` 已還原。
    - 下一項：問 LAWWW-B；沒有新派工就從巡查表 P3 挑。
  - **10-24 15:3x 更新**：
    - LAWWW-B 15:04：路線巡查②已整合 `7770155b4`（瀏覽器、手機幀率派給 BB）。
    - 下一項（D99 第一優先）：路線巡查③經濟系那一年（新遊戲 → 412 → 教室 → 休學在家去學校 → 8/29 法律系宿舍 → 9/1 第一堂課；日夜 × 9／10／12／2／7 月）。
      - 進行中：29 張跑在測試樹 `$SP/dv7`（開發 `7770155b4`）。
    - 巡完接 208 門口鏡頭（P3）：
      - 試做在 `$SP/dv8`（開發 `2b3a99cdd`）：aptCamCols 讓大門也擋鏡頭。
      - Node 模擬：門口 0.14～0.54 m 拉到頭上；往裡走鏡頭轉進廚房。
      - 好不好要遊戲內比，還沒決定交不交。
    - 要提給 LAWWW-B 的（引擎）：日夜表 KEY0 不分月份——12 月 17:45 和 7 月一樣是黃昏（臺北 12 月 17:05 就天黑）。只提案，不改 engine3d.js。
  - **10-24 15:2x 更新**：
    - 第二批背景：LAWWW-B 14:37 已整合（`7a7c4391b`）；遊戲內對話畫面四張都顯示圖（`d986ef4a4`）。
    - 已交：D99 路線巡查②美國交換（本 commit；`test_shots/route_us_1024/README.md`）。
      - 社區西邊出口外面沒做（P1）→ `us_community.glb` 加社區外面的街、公車站、對面平房、樹林。
      - 法圖（美國）彩色玻璃、天窗晚上一樣亮（P2）→ `patches/us_route_night_1024.patch`（`us3d.js` 的 `skyTint`）。
      - 美國校園晚上沒有光圈（P2）→ 同一個 patch（`us_campus` 的 `lampPools`）。
      - 17 支單元測試 ALL PASS。
    - 測試樹 `$SP/dv8` 有套 patch＋新 GLB（對開發 `b2430412c`），不要拿來當開發分支的原樣。
    - 下一項：問 LAWWW-B；沒有新派工就從巡查表 P3 挑。
  - **10-24 14:3x 更新**：
    - LAWWW-B 13:50：
      - 第一批 8 張已整合（`64397615a`）；
      - 第二批 4 張派給我；
      - 醉月湖 3D 燈籠只記錄。
    - LAWWW-B 13:54：v9.10.8 已合併 main（`3fca77687`），有 #82 前七間、芷若頭髮彈簧骨；今天下午之後的在下一版。
    - 已交：第二批 4 張（本 commit；README「第二批」）：`library_gate_day`、`law_library_gate`、`oldroad_bookstore`、`dorm_desk`。遊戲內對話畫面還沒測。
    - 進行中：D99 路線巡查②美國交換。
      - 74 張（開發 `45f1cd9e6`；日夜 × 9／10／11／12 月）拍完，四季切換正常。
      - 找到兩項，已改在測試樹 `$SP/dv8`（對開發 `b2430412c`），還沒交：
        - 法學院圖書館的彩色玻璃、天窗晚上和下午一樣亮；
        - 美國校園晚上沒有路燈光圈。
      - 正在跑：沿真的走路路線補拍＋修改後的截圖。
  - **10-24 13:4x 更新**：
    - 路線巡查①寒暑假已交（`72000d251`）：找到 13 段黑底。
    - LAWWW-B 12:38、12:57 回覆：
      - 天際線不做；
      - 室內換低面數維持 7 m；
      - 8 張背景派給我；另外 4 張 BB 跟使用者要圖。
    - 已交：BG-DARK-SCENES-1024（本 commit；`test_shots/bg_dark_scenes_1024/README.md`）。
      - `assets/bg/` 八張 webp；`OUT.BG` 要加的八行寫在 README。
      - 遊戲內 ADV 8 個場景都顯示圖。
      - 醉月湖的燈籠是在截圖上補畫的。
      - 另外發現：回國重逢有 5 段也是黑底（之前誤記成 3D）。芷若那段的鍵是 `cafe`，登記以後會變白天；建議改 `cafe_closed`。
    - 下一項：D99 路線巡查②美國交換（LAWWW-B 12:38 派）。
  - **10-24 12:3x 更新**：
    - LAWWW-B 11:46：室內路人低面數已整合 `a42beb018`（用 7 m）；下一項自己排。
    - 巡場景：第 5 區溫州街、第 6 區 118 巷、第 8 區清晨／黃昏都巡過一輪，沒有要修的（`test_shots/patrol_wenzhou_1024/`、`patrol_lane118_1024/`、`patrol_daynight_1024/`）。巡查表 0～9 區都巡過了。
    - 下一項：問 LAWWW-B 有沒有派工；沒有的話從巡查表的 P3 挑（遠景剪影平板、樹冠擋鏡頭）。
  - **10-24 11:5x 更新**：
    - LAWWW-B 11:17：影子 patch 已整合 `becf772d4`。
    - 已交：室內無名路人 7 m 外換低面數（本 commit；`test_shots/crowd_lod_indoor_1024/README.md`；LAWWW-B 11:26 同意）。
    - 下一項：等 LAWWW-B 回；沒有新派工就巡場景第 5 區溫州街（ART_DIRECTOR_PATROL 排隊中）。
  - **10-24 11:2x 更新**：
    - LAWWW-B 10:33：博雅窗景已整合（`bbe95680c`、`0a5835573`）。
    - 巡場景第 7 區（室內教室坐下）巡過一輪：`test_shots/patrol_classrooms_1024/`。
    - 已交：BUG-SHADOW-UPPER-1024（本 commit；`test_shots/shadow_levels_1024/README.md`）：engine3d.js 的陰影那一輪暫時藏起玩家這一層以上的樓層（LAWWW-B 10:49 同意）。
    - 下一項：博雅一樓階梯教室那班路人（365 calls、77 萬三角形）少畫一點；改 story3d.js 的人數前先告訴 LAWWW-B。
    - 測試樹 `$SP/dv7` 現在套著 shadow_levels v2 patch＋博雅窗景（開發都有了）；`$SP/dv8` 是開發 af405f952＋shadow_levels v2（stash 裡有博雅的舊改動，可以丟）。
  - **10-24 10:3x 更新**：
    - LAWWW-B 09:54：教學館窗景已整合 `aef97e506`（DL-LW2-TEACH-VIEWS）。
    - #61 經濟系路線截圖（宿舍 → 共同旁邊 → 椰林大道 → 文學院 → 普通門口，白天＋晚上）：沒找到方盒、黑塊、穿模。普通的門廊從小巷斜看是兩片實心側牆，正面有玻璃門、燈、名牌，照設計。
    - #85 已交：博雅窗景（本 commit；`test_shots/boya_views_wide_1024/README.md`）：二樓長窗寬照片＋photoWide；boya_south、boya_2f_south 重拍（舊照片是普通以前的米色外觀）。
    - 下一項：巡場景第 7 區「室內教室：坐下看窗外」（PERF-CROWD-LOD 早就整合了，開發 `91c5c7ea1`；10:3x 給 LAWWW-B 的訊息先寫錯，已更正）。
  - **10-24 10:0x 更新**：
    - LAWWW-B 09:15：社科院捲簾已整合 `b9d19d8a6`（outbox 標 ACTIONED）。
    - #61 已交：普通、共同教學館教室的窗外景（本 commit；`test_shots/teach_views_1024/README.md`）。
      - 原本 layout 的 photo 全是 null：窗外是程序化的綠色山丘；3F 考場借博雅的景。
      - 在遊戲校園拍的 18 張（`tools/blender/env_second/shots/teach_views.py`），教室長窗用寬照片（2048×512、水平約 127°），配置的 `photoWide` 讓 `teach3d.js` 設 `sxy`。
      - patch `patches/teach_views_1024.patch`（對開發 `de925edd3`）：layout 產生器＋重新產生的 layout、teach3d.js 一行、room_glb_layouts.js 的 gongtong_3f。
    - 下一項：#61 經濟系那一年的路線截圖（宿舍 → 普通教學館，`$SP/econroute/run.json` 已寫好 10 個位置），找方盒、黑塊、穿模。
  - **10-24 09:2x 更新**：
    - LAWWW-B 08:37：2F 書庫已套上（和學姊作息一起推）；08:50：公布欄已整合 `4229bbaf4`（徵才單照 JOBS.board2 開關）；#61 盤點完直接做，不用等他回。
    - #61 盤點（清查 B8／B9）：社科院大樓每一扇窗一樣的深色玻璃（B9 剩下的那一半）→ 已交：捲簾、布簾（本 commit；`test_shots/socsci_blinds_1024/README.md`）。
      - 注意：`campus_socsci.py` 以我分支這一份為準（開發分支的是舊的，現在的 GLB 是這一份做的）。
    - 下一項：#61 繼續盤點經濟系那一年的路線（宿舍 412、上課路線、公館）——拍一輪找方盒、黑塊、穿模。
  - **10-24 08:5x 更新**：
    - 已交：霖澤 1F 入口東牆公布欄＋入口自動門改成玻璃門（本 commit；`test_shots/linze_notice_1024/README.md`）。只換 `linze_interior.glb`，沒有程式 patch。
      - 注意：我的分支的 `src/data/linze_layout.js` 比開發分支舊；`linze_interior.py` 要在開發分支的測試樹（`$SP/dvbase`）跑，先確認沒改的腳本重出和開發分支的 GLB 一模一樣（`$SP/d4/glbcmp_name.py` 照網格名稱比）。
    - 下一項：#61 D99 經濟系 3D 缺口（ART-ECON-3D-GAP-1021）。
  - **10-24 08:3x 更新**：
    - LAWWW-B 08:05：臥室 C 的 patch 已套上開發分支（測試 PASS）；dating 照我的；她的作息、門上的字他接；2F 一直開。
    - 已交：#82 第七間的另一半 法學院圖書館 2F 書庫（本 commit；`test_shots/us_lawlib_2f_1024/README.md`、`patches/us_lawlib_2f_1024.patch`，對開發 `bcc821fe0`＋臥室 C）。#82 七間都交了。
    - 下一項：霖澤 1F 東牆 (7.2, 1.2) 公告欄的模型（不急）→ #61 D99 經濟系 3D 缺口。
  - **10-24 08:0x 更新**：
    - LAWWW-B 07:20：多媒體中心已整合 `3173e8e72`、芷若 `cbd762954`（outbox 改 ACTIONED）；第七間三件同意（美國兩間是 D99 第三優先）。
    - 已交：#82 第七間的一半 美國臥室 C（本 commit；`test_shots/us_bed_c_1024/README.md`、`patches/us_bed_c_1024.patch`，對開發 `bcc821fe0`）。窗景四季八張（`us_bed_c_view.py`）。
    - 下一項：第七間的另一半 法學院圖書館 2F 書庫 `us_lawlib_2f`：
      - 用同一個 `us_lawlib.glb`（往下 4.6 m），加一個放梯子、書車、閱覽桌、三樓樓梯口紅絨繩的小 GLB；
      - 一樓紅絨繩那一點開的時候變成「上 2F（書庫）」，`usll_rope`、`usll_rope_sign` 藏起來（不用重出 GLB）。
      - 之後：霖澤 1F 東牆公告欄。
  - **10-24 07:2x 更新**：
    - LAWWW-B 07:04：洗衣間＋205 已整合進開發 `758d8af30`（outbox 改 ACTIONED）；多媒體中心的做法（「看一部片」搬進裡面的服務台、`library3d.js` 的門認 `d.to`）同意。
    - 已交：#82 第六間 總圖多媒體中心（本 commit；`test_shots/library_media_1024/README.md`、`patches/library_media_1024.patch`，對開發 `758d8af30`；相關 93 個單元測試 ALL PASS）。
    - 下一項：#82 第七間 美國臥室 C（`tools/blender/env_second/us_bed_c.py` 已寫、還沒跑；門在 `us3d.js` 的 bedC；`open.flags` 要加）＋法圖 2F 書庫（另一個區域，樓梯的繩子做成可以藏的節點）→ 霖澤 1F 東牆公告欄。
  - **10-24 07:1x 更新**：
    - LAWWW-B 06:46：博雅 203 已整合 `5fff78834`（放人 `cc366dbe5`）；205 的做法（`--only 205`、`zones3d.js` 一行、`cam_box`）同意。
    - 已交：#82 第五間 洗衣間＋205（本 commit；`test_shots/dorm_laundry_205_1024/README.md`、`patches/dorm_laundry_205_1024.patch`，對開發 `cc366dbe5`）。
    - 下一項：#82 第六間 總圖多媒體中心（`library_layout.js` 的 doors.media；`closed2_3d.js` 的「看一部片」要跟著搬進去）→ 第七間 美國臥室 C＋法圖 2F 書庫（`us3d.js`）→ 霖澤 1F 東牆公告欄。
  - **10-24 06:5x 更新**：
    - 已交：#82 第四間博雅 203（本 commit；`test_shots/boya_203_1024/README.md`、`patches/boya_203_1024.patch`，對開發 `7ce1142e2`）。103 不做（LAWWW-B 06:11 決定用 101）。
    - LAWWW-B 06:25：芷若彈簧骨已整合 `cb6cef3e3`；更正角色美術由 LAWWW 驗收（D100a，不是 BB）。
    - 下一項：#82 第五間＝宿舍洗衣間＋205（AA_399 第 11 節）。
      - 洗衣間：`tools/blender/env_second/dorm_laundry.py` 已寫、還沒跑。
      - 遊戲端：測試樹 `$SP/dv8` 已改 `rooms_glb3d.js`（HOST 加 dorm_hall、backSpawn 先看配置的 back_spawn）、`dorm3d.js`（門有 d.to／d.gate 就是出入口）。
      - 205：打算 `dorm_room4.py` 加 `--only 205` 出 `dorm_205.glb`（方奕廷的桌子滿是盆栽），預設輸出要和現在的 `dorm_room4.glb` 每個 byte 一樣。
  - **10-24 06:3x 更新**：
    - 已交：芷若頭髮補回彈簧骨（本 commit；`char_review/zhiruo_springs_1024/README.md`）。`heroine_02.py` 多一個 `springs` 階段，以後重做頭髮不會再漏。sim_hair、hair_sway 都 PASS。
    - LAWWW-B 06:05 ACK #82 前三間；06:11 決定博雅 103 照 A：用現成的 101，103 照舊關著、不做（房號的事 LAWWW-B 告訴 AA）。
    - 下一項：#82 第四間博雅 203（SK07 即興劇，2026-05-27 晚上）：`tools/blender/env_second/boya_203.py` 已寫（還沒跑）→ GLB → teach3d.js 的 203 門照時段開 → 測試 → 截圖。
  - **10-24 06:1x 更新**：
    - 已交：#82 前三間（本 commit；`patches/rooms_ab3_1024.patch`＋三個 README：`test_shots/wancai_semb_1024`、`linze_office_1024`、`gongtong_3f_1024`）。
    - 下一項：芷若頭髮的彈簧骨（`hair_springs.py` 補跑；`sim_hair.js` 驗）→ #82 第四間博雅 203／103。
  - **10-24 06:0x 更新**：
    - LAWWW-B 05:22 ACK ART-WZ6＋市集；已整合進開發 `025ab4f30`（outbox 改 ACTIONED）；v9.10.7 已發布。
    - #82 前三間（研討室 B、系辦、共同教學館 3F 考場）：Blender 模型＋配置都好了，一份 patch（`patches/rooms_semb_office_1024.patch`，交件時改名、加考場）。遊戲內截圖拍攝中（`$SP/sembshots`）。
      - 通用的新東西在 `rooms_glb3d.js`：兩套布置（`sets`、`set_days`）、開放時段（`open`：星期、時段、單週、國定假日、指定日子）、`Z3.roomGlbGate`（門的兩個互動點照時段藏起來）、`back_spawn`。
      - 門：萬才館（`wancai3d.js`）、霖澤館（`building3d.js`）、共同教學館 2F 樓梯口（`teach3d.js`）。系辦的志願表改在裡面的服務台交（`closed2_3d.js`）。
      - 截圖踩到的雷：遊戲 10:00 跳手機訊息會暫停畫面（`E.paused`），fast_perf 每等一次畫面就卡 2 分鐘 → 截圖的 js 加一個每 0.3 秒解除暫停的看門狗（只在截圖的頁面）。
    - 收到（P2，不用回）：LAWWW-B 05:53 芷若現在的 VRM（`bl_heroine_02.vrm`，10-22 第九版頭髮）沒有頭髮的彈簧骨（只有胸部 4 節）。原因：第九版用 `p02_hair.py` 重做頭髮以後沒有再跑 `hair_springs.py`。我判斷要補（美術總監 D111）：排在三間房間交件之後。
  - **10-24 05:2x 更新**：
    - 已交：⑤ ART-WZ6＋ART-WZ-MARKET-1023（本 commit；`test_shots/wz6_1024/README.md`、`test_shots/wz_market_1023/README.md`、`patches/wz6_market_1024.patch`，對開發 `738cc7ffc` apply --check 過）。
      - 開發分支 04:36 改了 `jobs3d.js`，原本對 `eeed54fc2` 做的 patch 那一段套不上：測試樹 `$SP/dv8` 換到 `738cc7ffc`、重套、重出 patch；單元測試 4 個新的＋28 個相關的 ALL PASS。
      - 截圖：第一輪（runD）宿舍那天 21:00 是大四期末的劇情，對話框的模糊蓋住整個畫面 → 改 day 1129、測試 CSS 藏 `#adv,#dlg` 重拍（runE）。
    - 收到（P2，不用回）：LAWWW-B 03:53 AA_399 剩下要 3D 房間的七處（任務 #82）＋霖澤 1F 入口東牆 (7.2, 1.2) 公布欄模型。順序我排：萬才館研討室 B → 霖澤 1F 系辦 → 共同教學館 3F 考場 → 博雅 203／103 → 宿舍 205 → 總圖多媒體中心 → 美國學姊臥室 C＋法圖 2F 書庫。
    - 下一項：#82 第一間萬才館研討室 B。
  - **21:0x 更新**：
    - 已交：④ 體育館 3F 典禮布置（本 commit，`test_shots/gym_ceremony_1023/README.md`、`patches/gym_ceremony_1023.patch`，對開發 `6f0db4672` apply --check 過）。
      - 我的分支的 `src/data/gym_layout.js` 先同步開發分支（我的是舊的），重建 `gym_arena.glb` 前先確認沒改的腳本重建出來一模一樣。
    - 下一項：⑤ ART-WZ6（AA_420 第 9 節，tasks.json DL-11）→ 二手市集攤位。
  - **20:4x 更新**：
    - 已交：③ 總圖研究小間＋5F 書庫（本 commit，`test_shots/library_upper_1023/README.md`、`patches/library_upper_1023.patch`，對開發 `984ee75f3` apply --check 過）。
      - 遊戲內兩輪截圖修了：掛勾穿到走廊、茶几方塊、天花板燈具從上面看是灰板（改放 WALL_C）、書庫東牆牌子左右相反；08 的門擋路寫進配置（單元測試抓到）。
      - reachability（大廳、閱覽室、研究小間、書庫）、flow_library_floors、單元測試都 ALL PASS。
    - 收到（P2，不用回）：LAWWW-B 20:11Z ART-WZ-MARKET-1023 溫州街小公園二手市集攤位（開發 7447bd8b4，每月第一個週六 09～13，入口步道 (26.0,12.6)、雨天老樹下 (26.0,18.3)，WZL.market），排在 ⑤ 後面。
    - 下一項：④ 體育館 3F SET_CEREMONY（開學、畢業典禮；A16）→ ⑤ ART-WZ6 → 二手市集。
  - **19:5x 更新**：
    - LAWWW-B 19:3x：5F 研究室、AA_413 已整合進開發 `2a672d9a8`（outbox 改 ACTIONED）；佇列 ④ 後面加 ⑤ ART-WZ6（AA_420 第 9 節，tasks.json DL-11：房間六件物件、阿德影印兩種外觀、一盞簷廊貓碗、三家店上班站位）。
    - ③ AA_399 第 3 節（WIP `68e29bbed`）：`library_upper.py` 兩個區域 library_carrels（研究小間十間，學姊 03／玩家 08）、library_stacks（5F 書庫十排＋參考書）。
      - 入口我決定：大廳二樓東牆原本關著的「研究小間」門打開；書庫搭電梯（三部電梯都 1F～6F：4F、6F 關、5F 開）。
      - 測試樹 `$SP/dv3`＝開發 `03b327ded`＋這些修改（`$SP/withserver_dv3.sh`，port 8873）。單元測試 library_upper_unit（新）、library_b1、nav_buildings（兩項電梯樓層的檢查改成 6 層）、guide、placemap、quick_travel、zone_dispose、zone_prewarm ALL PASS。
      - 窗景已拍（library_carrels、library_stacks，只有遠景一層）。遊戲內截圖拍攝中，之後 reachability、flow_library_floors。
  - **19:2x 更新**：
    - 已交：5F 研究室更正（`fc21db525`，`test_shots/linze_5f_lab8_1023/README.md`）。
    - 已交：AA_413（本 commit，`test_shots/aa413_wz_1023/README.md`、`patches/aa413_wz_1023.patch`，對開發 `dfc49707c` apply --check 過）。
      - 阿忠水果的攤子（`p_fruitstall`＋紙板價錢牌）、B6 前機車留 3.4 m（`scRow` 的 `gap`）、老闆站位 `WZS.AA413.fruit.owner`。
      - 自助洗衣門右邊的布告欄（`cork_board`）。
      - 日日便利從溫州街進去的窗景 `cvs_wz`（`F.CVS_FROM==='wenzhou'`）。
      - 溫州街 GLB 重建，順便帶進 09:33 起的店內商品（+1.1 萬三角形）；遊戲內效能反而比改之前好。
      - `touch_flow_wenzhou` 沒跑，請 LAWWW-B 發布前跑。
    - 下一項：AA_399 第 3 節（總圖研究小間＋5F 書庫），再來體育館 3F SET_CEREMONY。
  - **18:4x 更新**：
    - 已交：總圖 B1（`cdb1b1f4`）。LAWWW-B 18:4x：20cc4c4e3 合併、01ade8098 劇情接好（`src/b1story3d.js`；晚上從校園側門下 B1；補了 `CALENDAR.examSoon`）。
    - LAWWW-B 18:4x 的佇列：
      1. 5F 研究室更正（八張桌子、她在門邊）：模型、配置、patch 都好了（WIP `c38b07e2`），node 測試過，遊戲內截圖＋reachability 在 `$SP/dv2` 跑。
      2. AA_413：水果攤（騎樓前的攤子＋老闆站位）、自助洗衣門邊布告欄、日日便利從溫州街進去的窗景（cvs 區域照 `CVS_FROM` 換景）。
      3. AA_399 第 3 節：總圖研究小間（玻璃門小窗、門外 spot、學姊座位）、總圖 5F 書庫（只開 5F；最裡面一排方奕廷的 spot、「看那一排」；入口我決定寫進 layout）。
      4. 體育館 3F SET_CEREMONY（開學、畢業典禮；A16）。
    - 測試樹：`$SP/dv2`＝開發 `f023a83f1`＋B1 patch＋5F patch（`$SP/withserver_dv2.sh`，port 8872）。
    - 教訓：等背景工作用 `until ! pgrep -f "<字串>"` 會比對到自己那一行 bash，永遠等不完（18:2x 的 5F 截圖因此沒開始）。改成直接接在前一個工作後面跑。
  - **18:0x 更新**：
    - 已交：法學院廣場的大樟樹（`cb1d9ecb`，`test_shots/linze_tree_1023/README.md`）。LAWWW-B 20:0x：樹、沛珊 v32 都已整合進開發 `27b5e58bf`。
    - 總圖 B1（LAWWW-B 選 A）：WIP 檢查點 `97e40795`。
      - 模型 `library_b1.glb`（2.9 萬三角形、42 個座位、navcheck 0 問題）、大廳一樓西牆的門（`library_interior.glb` 重建）、區域 patch（對開發 `700cb0b7f`）。
      - 門在 z −2.4（−3.2 撞到西牆的窗），交件時告訴 LAWWW-B。
      - `library_b1_unit`、`nav_buildings_unit` ALL PASS。瀏覽器（截圖、`reachability_all` 大廳＋B1、`flow_library_floors`）在 `$SP/dv` 跑。
      - 測試樹 `$SP/dv`＝開發 `700cb0b7f`＋B1 的修改（`$SP/withserver_dv.sh`，port 8871）。
    - 收到（P2）：AA-B 18:4x AA_413（溫州街日日便利、阿忠水果、自助洗衣）；LAWWW-B 20:0x：程式在開發，美術排在 B1 之後，座標改 `WZS.AA413` 帶在 patch。
  - **17:4x 更新**：
    - LAWWW-B 17:5x：沛珊第三十二版（`1056a5c7`）**驗收通過**（D100）。outbox 改成「已交付、可整合」，由 LAWWW-B 合併換掉第二十八版。
      - 記下、這一版不改：兩側一綹一綹的帶子、瀏海落在鏡框上緣、髮片一階一階＋背面兩小撮、鞋子是平底鞋（參考圖帆布鞋）。
      - **沛珊不再開新版**（D99 第 4 點）。芷若那一半照佇列。
    - LAWWW-B 17:4x：總圖 B1 選 **A**（1F 大廳西牆 z −3.2 開樓梯間的門）。`library_interior.py`、`library_layout.js`、`library3d.js` 換區域都我寫（D108）；電梯停 B1 這一版不做。
      - 劇情接線 LAWWW-B 做；配置要給：討論室 1、2 桌邊站位＋坐位（study）、自習室座位、借還機 interact `selfcheck`、樓梯間門口。
    - 法學院廣場的大樹：`campus_layout_nav`、`reachability_all --zones campus` ALL PASS。
      - 3F、4F 窗景樹冠上緣一條水平切線（樹冠高過近景照片上緣）。`shop_views_layers.py` 加近景上緣、左右淡出（`FADE`），只重新去背（`VIEWS_REMATTE`），重拍窗景中。
    - 總圖 B1 的 Blender 腳本 `tools/blender/env_second/library_b1.py` 草稿（還沒跑過）。
  - **16:5x 更新**：
    - LAWWW-B 16:02 ACK：霖澤館 5F 已合併；「窗外的樹」選 A（法學院廣場種一棵 17～19 m 的大樹、重拍霖澤館窗景），排在沛珊之後。
    - LAWWW-B 16:14：v9.10.6 已合併 main（PR #12）。開發分支換回 `7cd89fbac`，現在最新是 `6326916cc`。
      - 測試樹 `$SP/rs` 已經換到 `6326916cc`。
      - 原本的本地修改都已合併進開發，存成 stash@{0}。
    - 已交：沛珊第三十一版（`781d692f`，`char_review/peishan_v31/README.md`），給 LAWWW 驗收。
      - 第一輪截圖整組拍到手機畫面：讀檔後 `S.phoneAuto` 自動打開手機，遊戲暫停。
      - `tools/shots/char_review.py` 已改成讀檔後收起手機（`9146c72b`）。
    - 接下來：法學院廣場的大樹（A）→ 總圖 B1。
  - **16:2x 更新**：
    - LAWWW-B 14:36、14:41 ACK：118 巷窗景第二批（`79777475`）、SEE-THROUGH-FAIL-1023（`b1cb4030`）都已合併。
    - 已交：CLOSED-SPACES-1023 第一項，霖澤館 5F 研究室樓層（`ce472581`，`test_shots/linze_5f_1023/README.md`）。
      - zone `linze_5f`：
        - 碩士班研究室：學姊靠窗的位子 `spots.sis_desk`、旁邊的空位。
        - 會議室：「口試中」`LZUP.examSign`。
        - 「只開她那一盞燈」：`LZUP.labLights('sis')`。
      - 測試：`linze_5f_unit`、`linze_upper_unit`、`nav_buildings_unit`、`reachability_all`（3F～5F）ALL PASS。
      - 劇情接線（4F 刷卡門「傳訊息給學姊」、八場事件換 3D）是 LAWWW-B 的。
      - 「窗戶對著一棵樹」：A／B／C 等 LAWWW-B 決定。建議 A：在法學院廣場種一棵真的大樹，要重拍霖澤館各層的窗景。
    - 教訓：
      - 室內區域引擎不叫 `applyTimeOutdoor`，只叫 `zone.applyTime`。
      - `WALL_` 牆面的 `o.visible` 每一格被引擎 `hideFaded` 改掉，要開關得用材質的 `visible`。
      - 兩個都是遊戲內截圖才抓到；單元測試要走和引擎同一條路。
    - 接下來：沛珊第三十一版（P0），之後 CLOSED-SPACES 第二項總圖 B1（AA_399 第 2 節）。
  - **14:4x 更新**：
    - 已交：
      - GG-WALKERS-1023（`bf7b77ff`）：已合併。
      - 118 巷窗景第二批（`79777475`）：九間店門外換成遊戲裡拍的兩層窗景。
    - 正在做 SEE-THROUGH-FAIL-1023（P3）：
      - 「室內不開透視」是測試過時：宿舍區域本來就設了 `seeThru`（上舖床板）。
      - 「演出鏡頭時不開透視」：診斷腳本 `$SP/rs/tests/_st_diag.py` 在跑，看遊戲迴圈有沒有在跑。
      - 改 `engine3d.js` 之前先問 LAWWW-B。
    - 之後：CLOSED-SPACES-1023（AA_399 順序，霖澤 5F 先），沛珊第三十一版。
  - **13:5x 更新**：
    - 已交、已合併：SQ-TRACES＋SQ16 店門口（`ed65a78e`）、公館街景 ART-GG-STREETLIFE-1023（`5fed31e9`）。
    - LAWWW-B 13:50 定的順序：
      1. GG-WALKERS-1023：公館路人路線 patch（`patches/gg_walkers_1023.patch`，`story3d.js`）。等瀏覽器空出來跑三個公館測試。
      2. 118 巷九間窗景（第二批）：照片拍攝中，`l118_shops3d.js` 改法在 `$SP/split/h1`。
      3. SEE-THROUGH-FAIL-1023（P3）。
      4. 關著的空間、沛珊。
    - LAWWW-B 會短暫把開發分支換成發布樹開 PR；通知期間不要從開發分支拉新的樹。
    - `withserver.sh` 改成在測試樹 `$SP/rs` 裡跑命令。之前在我的 repo 跑，用到舊的測試腳本：公館 layout 的 4 項校門 FAIL 是舊腳本造成的。
  - **之後的順序**（LAWWW-B 12:33 定）：
    1. ART-GG-STREETLIFE-1023：公館騎樓前的機車、單車架、路人。動 GG_PROP_BLOCKS；交件前跑 `gongguan_layout_nav.py`、`street_props_nav_unit.js`、`reachability_all.py` 公館段。
    2. 118 巷九間店窗景（第二批）。
    3. CLOSED-SPACES-1023（AA_399 順序，第一個是霖澤 5F）。
    4. 沛珊第三十一版。
  - **教訓**：
    - 長跑的 http server 會在 2 小時被收掉，每個瀏覽器工作用 `$SP/withserver.sh` 自己開 server。
    - 瀏覽器工作跑的時候不要動測試樹（不要 `git stash`）。
    - 一律 run_in_background，不要用 `&`。
- **接著做**（照上一任交班的「下一班第一步」，加上 D99 三個優先項目）：
  1. 沛珊第三十一版（P0，UA-LAWWW2-1022-02）：看試做 s → 正式重做 → 遊戲內重拍、檢查眨眼 → 交件給 LAWWW。
  2. 林家菜單：拍遊戲內前後截圖 → 交件。
  3. 照 `check_handoff.py queue --owner LAWWW2` 排下去。


## 🔁 交班：2026-10-22 15:06 UTC｜帳號 A｜LAWWW2｜`session_01AC1WVgJSmoJK1uRsPK2Zn1`｜分支 `claude/second-ai-env-art`（使用者 15:0x 直接說「現在交班」）
- **最後的工作 commit**：`d724b106`（已 push，`ls-remote` 核對過）。這一節所在的交班紀錄 commit 在它後面，SHA 寫在交班回報裡。`docs/handoff/duty_LAWWW2.json` 已改成 `handed-off`。
- **LAWWW 15:05（同帳號、值班中）傳來換班指示**：沛珊存 WIP、林家菜單和入口 B 導航留給下一班、寫「全部待辦」、存快照、`duty handoff`——都照做了（全部待辦在下面一節；快照、登記寫在交班回報）。
- **交班紀錄不代表下一班已經接班**。帳號 A 的 LAWWW 同一帳號；跨帳號只看 GitHub 文件（D75），我沒有傳訊息給任何人。
- **正在做（P0）**：沛珊第三十一版（UA-LAWWW2-1022-02；LAWWW 13:5x 退回第三十版正面兩項）。
  - **WIP，沒交件**：`assets/models/char/second_ai/bl_classmate_peishan.vrm` 還是第三十版（`80a39166`）。
  - 腳本 `peishan_hair.py`：WIP 檢查點 `c8a7a953`，第三十一版是預設；`PS_HAIR_V=30／29／28` 重做和舊版位元組相同（15:02 驗過）。
  - 比較圖、下一步：`docs/art-rebuild/second_ai/char_review/peishan_v31/README.md`（`d724b106`）。
  - 已完成：頭頂兩側尖刺（限寬＋補窄髮片＋後腦補髮殼）、窄長倒 V、髮尾到眉頭和顴骨、臉旁長碎髮正面看得到；遊戲內 j66（`11707a19`）拍過。
  - 沒做完：試做 s（`HAIR_CUR_AHS=2.0`，三分之四側耳朵前面太陽穴那一條皮膚）**做好還沒看**；正式重做後的眨眼檢查沒做。
- **P2，LAWWW 13:59 派工（我 14:38 ACK）**：林家乾麵牆上菜單加「貢丸湯 30」（WZ-SHOP-AA364-ART）。
  - **WIP**：貼圖六張紙、GLB 重匯、layout 註解都在 `d724b106`。
  - **遊戲內新版截圖沒拍完**（交班停掉），沒驗收、沒交件。
  - 開發分支 `d3df1cf3` 的 `shops_tex.py` 沒有 aa364 那幾個函式（`d37cf28c` 拿回的是舊版），整合要用我這一版。
- **沒整合、沒發布**：上面兩件都是 WIP。LAWWW2 不碰 `main`、不發布；commit、push 只是保存。
- **沒有遠端備份的**（都可以從 repo 的腳本重做）：
  - 第三十一版 VRM（md5 `d8ff855e`）、試做 s（md5 `105e8353`）；
  - j66／j67 的遊戲內截圖原檔、遊戲渲染器的試做圖；
  - 暫存的測試工作樹 `devwt_c`（`11707a19`）、`devwt_m`（`d3df1cf3`）。
- **沒測**：所有東西都沒在 iPhone 實機看過（只有 Playwright＋SwiftShader）。
- **下一班第一步**：
  1. 照 `AI_SESSION_HANDOFF.md` 第 4 節接班：fetch、讀 LAWWW 的回覆、outbox、交接板。
  2. 照 `char_review/peishan_v31/README.md`「下一步」1～3：看試做 s → 正式重做＋遊戲內重拍＋眨眼 → 交件給 LAWWW。
  3. 林家菜單遊戲內前後截圖 → 交件。
  4. 巡場景第 5 區溫州街（暫停中，`$SP/patrol5/shots.json` 要重寫）。

## 📋 LAWWW2 全部待辦（2026-10-22 15:1x 交班時；對總表 RULE_SOURCE `origin/claude/confident-ritchie-8rwh7t` `693970b6`）
- 總表裡負責人是 LAWWW2、還沒結案的全部列在這裡（每行是任務 ID）：進行中 6、待開工 9、暫停 1、已整合待測試 93。
- 這一班工作階段裡的待辦清單都對到下面的任務了（沛珊、林家菜單、溫州街巡場景）；沒有總表以外的項目。
- **進行中**
  - ART-POLISH（P1）：第 2 批色調映射已整合（Neutral 預設）；其他項目照總表的下一步
  - PERF-CAMPUS-SHADOW-1020（P1）：停著的腳踏車分區合併已交（49b26ecb）；照總表的下一步確認
  - BACKLOG-SWEEP-LAWWW2-1021（P0）：清查表照 10-21 那一節；剩下的項目照總表
  - ART-ECON-3D-GAP-1021（P2）：412 洗手間牆磚地磚已交（2ccd1e60）；剩下的照總表
  - ART-DIRECTOR-LAWWW2（P1）：巡場景：第 5 區溫州街（主巷、Café 路口、小公園、日式宿舍、118 巷口 × 15:00／17:xx／20:00）還沒拍——沛珊插隊暫停；拍照規格要照開發分支最新重寫
  - ART-ZR-PS-3D-1022（P2）：沛珊第三十一版，WIP（腳本 c8a7a953、比較圖 d724b106）：頭頂兩側尖刺、窄長倒 V、髮尾、臉旁長碎髮正面都改好；剩三分之四側太陽穴那一條皮膚（試做 s 做好沒看）→ 正式重做、遊戲內重拍、眨眼 → 交件。步驟在 char_review/peishan_v31/README.md「下一步」
- **待開工**
  - ART-13（P2）：明軒、小語模型
  - ART-WZ6（P2）：故事小物件 wz6_items.glb（半熟計時器、阿德的筆記本、茶罐、卡片、白板影印、吉他社海報、貓碗）
  - ART-SOY1（P2）：豆漿店道具組（AA 做、驗收過 12a33672）＋寶特瓶袋 v2（wz7_street_props）：接進遊戲
  - VAC-A1（P2）：寒暑假活動既有美術資產盤點（只盤點不製作，交給 AA）
  - ART-SOP（P2）：美術製作 SOP（ART_SOP.md v1、SCENE_RULES.md、sop_demo 示範案例）
  - ART-JIAHAO-JOY（P2）：家豪晚上近照嘴邊暗影（Joy 0.35 露出口腔被壓暗）：試 0.28
  - ART-PHOTO-CMP-1021（P3）：共同教學館、女舍和參考照片比對（LAWWW2 清查 B14）
  - ART-WZ-LIN-MENU-1022（P3）：WIP（d724b106）：菜單貼圖六張、GLB 重匯、配置註解都好了；剩遊戲內前後截圖 → 交件。開發分支的 shops_tex.py 少了林家、定食那幾個函式（d37cf28c 拿回的是舊版），整合要用我這一版
  - ART-WZPARK-ENTRY-B-1022（P3）：LAWWW 15:0x 剛派、還沒開工：小公園遊戲場的導航阻擋擋住入口 B 整段步道
- **暫停**
  - CHAR-TEMPLATE（P2）：暫停：等使用者決定人物凍結要不要解除
- **已整合待測試**
  - 等 BB／使用者在遊戲裡看；有人回報問題 LAWWW2 再修：
    - ART-02、ART-04、ART-05、ART-09、ART-10、ART-11、ART-12、SCN-US-01、SCN-US-03、SCN-US-02、SCN-V3-01、SCN-V4-01
    - SCN-V5-01、ART-BG02、ART-BG05、ART-BG18、ART-BG15、ART-BG16、ART-BG17、ART-BG13、ART-BG08、ART-BG11、ART-BG14、ART-BG19
    - ART-BG20、ART-V0-DORM、ART-WZ1、V0-ART-DORM、ART-WZ4、ART-WZ5、ART-GYM1、ART-WZ3、ART-YT1、ART-WZ7、ART-TUTOR1、ART-US1
    - ART-US3、ART-US2、ART-BG-COURT、ART-PT-SIS-FORMAL、ART-GYM-BG1、ART-GG-SIGNS、BUG-COPLANAR-DEV、ART-CAFE-FLOOR、ART-WZ0、BUG-WZFLICKER-2、ART-BIKES2-F、ART-DORM-LOFT
    - ART-DORM-Y34、ART-US-SEASON、ART-NPC-40、ART-HAIR-MATCAP、ART-NPC-HAIR-STREAK、ART-PS-SKIRT-HAND、SCN-US-LIB、ART-EXT-M1、ART-EXT-GATE、ART-EXT-TEACH、ART-EXT-MRT、ART-GYM2-INT
    - SCN-US-IU-1018、ART-YU-3D-1018、PERF-ZONE-ENTER-1018、ART-GG-SHOPS-1018、ART-LIB-VIEW-1018、ART-SEATFIG-1018、US-CAMPUS-WIRE-1018、GRADE-GOLDEN-DEFAULT、US-MARKET-STREET、LANE118-SHOPS-1020、BUG-GYM-STAIRS-1020、LINZE-WANCAI-FLOORS-1020
    - LINZE-34F-TABLES-1020、SKYBRIDGE-DOOR-1020、GG-STREETVIEW-1020、ART-L118-LANE-1020、ART-ROOM-MULTI-1020、ART-ROOM-LIFE-1020、ART-DORM-LOUNGE-1021、ART-SWEEP-A3A4-1021、JP-ROOM-3D-1021、BUG-CAM-C208-1021、WZ-SHOP-AA364-ART、BUG-CAM-203-R2-1021
    - ART-Y1-BOX-MIRROR-1021、PERF-CROWD-LOD-1021、BACKLOG-A7-WZPARK-COPLANAR、BUG-NAV-LAMPPOST-1021、BUG-CAFE-FLOOR-MIRROR-1021、ART-VAC-AIRPORT-1021、US-MS-NIGHT-1021、ART-TONE-NEUTRAL-1022、ART-CEIL-LAWWW-ROOMS-1022

## ✅ 接班：2026-10-21 15:2x UTC｜帳號 A｜LAWWW2｜`session_01AC1WVgJSmoJK1uRsPK2Zn1`｜分支 `claude/second-ai-env-art`
值班登記：帳號 A｜LAWWW2｜session_01AC1WVgJSmoJK1uRsPK2Zn1｜分支 claude/second-ai-env-art｜接班基準 `2b4f2028`｜2026-10-21 15:26 UTC（使用者：「我回來了，請同步 GitHub 最新進度，接續工作。」＋「你上次交班之後 有兩個帳號接過你的班 B C」）
上一班：帳號 C｜LAWWW2-C｜session_015BuNi47yLUt5PviELapMNj｜最後 commit `2b4f2028`（2026-10-21 14:30 UTC）｜交班紀錄在下面「🔁 交班（LAWWW2-C，2026-10-21 14:5x）」；**但 `docs/handoff/duty_LAWWW2.json` 和 RULE_SOURCE 的 `duty.json` 還寫 C「on」**（沒跑 `duty handoff`），所以 `duty register` 用 `--user-ok` 登記（記一筆 no-handoff；實際上 C 有交班紀錄、交班後沒有再寫）。
- **兩個帳號接過我的班**（使用者提醒）：帳號 B LAWWW2-B（10-15～10-17，`claude/funny-albattani-iawshm` 停在 `2d88db5f`）→ 帳號 C LAWWW2-C（10-17～10-21，`claude/focused-cray-c9uwvw` 停在 `2b4f2028`）。核對：`8e1061a`（我 10-14 交班）⊂ B ⊂ C；**B 有、C 沒有的 commit：0 個**（B 的成果全部經由 C 接回來）。這個分支 fast-forward 到 `2b4f2028`。
- 規則來源：RULE_SOURCE `origin/claude/adoring-meitner-mqzst8`（`duty find`：沒有人值班、上一任 C、HV-18、seq 19）；規則 SHA `7c58b598`（AI_SESSION_HANDOFF.md）。讀過：P0 換班口令、D75（不傳訊息給休班帳號）、D76、D90（短回合、回合開始先回使用者、結束前 commit＋push）、D92 十四步、D93～D96、D100（LAWWW2＝3D 美術，2D 背景不歸我）、HV-15（暫停五欄）。**D90 ACK**：照做（短回合、先回使用者、結束前保存、讀通知）。
- 交接工具：從 RULE_SOURCE 取最新的 `tools/handoff/`、`tools/story/check_orphans.py`（C 分支上的是舊版）。
- 對帳結果（都加 `--ref` RULE_SOURCE）：`check` 0（OK）；`duty verify` 1（異常 7：LAWWW 的快照 `2026-10-21T1459Z_C_LAWWW.json` 讀不到——LAWWW 的範圍）；`incr` 1（LAWWW 的 WIP-LAWWW-AAFIX-1021 commit `8a9a5e5a` 找不到——LAWWW 的範圍）；`roles` 1（36 項都是 AA 的交接檔 ID 不在總表；**LAWWW2 0 項**）；`asks` 1（5 項是 LAWWW、AA 的「AI 解讀還沒問使用者」；LAWWW2 15 筆沒有異常）。
- 帳號 A 的 LAWWW 還沒登記值班（`duty.json` onDuty＝沒有人）→ 照 D75 不傳訊息；這份登記等值班 LAWWW `duty sync`。
- **⛔ 使用者 15:3x（永久）：「你之後不要再停下來問我 你是美術總監」**（UA-LAWWW2-1021-10）→ 美術上的決定自己做、自己驗收、直接往下做；回報只報結果、不等回覆、不把美術決定丟回給使用者。ART_APPROVED（建築／場景）照舊只有使用者能標；發布是 LAWWW；劇情是 AA。
- **使用者 15:2x～15:3x（接班後第一個指示）**：「溫州街修改直接收尾 舊店面翻修繼續」「黃昏收尾」（UA-LAWWW2-1021-08、09）→ 暫停表三列已改「已恢復」。順序：SOC-COURT-1021 收尾（做一半）→ 溫州街收尾（BUG-WZFLICKER-2 溫州街三處、A7 小公園疊面、ART-BALCONY-POTS 溫州街、ART-VSLICE 做一半的）→ ART-WZ0 舊店面翻修。
- **15:5x SOC-COURT-1021 已交件**（`test_shots/soc_court_1021_wip/README.md` 最上面；GLB＋json＋`patches/soc_court_wire.diff`；單元測試 ALL PASS；READY_FOR_ART_REVIEW）。**下一項：溫州街收尾**（A7 小公園草地×石材 12.4 m²、ART-BALCONY-POTS 溫州街、ART-VSLICE：B 的 WIP `28deae9e` 後製 `src/post3d.js`＋路面貼圖）→ ART-WZ0。
- **接著做**（C 交班寫的第一步）：SOC-COURT-1021 社科院中庭夜間光＋院系公告欄「還沒做完」1～3（`test_shots/soc_court_1021_wip/README.md`）→ 之後照下面「📋 LAWWW2 全部待辦」10-21 最新那一節。


## 🔁 交班（LAWWW2-C，2026-10-21 14:5x UTC；使用者直接說「交班」）
- 工作階段 `session_015BuNi47yLUt5PviELapMNj`；分支 **`claude/focused-cray-c9uwvw`**；最後 commit＝這份檔所在的那個 commit（交班回報裡有 SHA）。RULE_SOURCE：LAWWW-C `origin/claude/adoring-meitner-mqzst8`（看過 `96af1e54`）。
- **這一班（10-21）已交件**：體育館光暈＋疊面、LICENSES／原始檔清單、大一 203 紙箱＋膠帶、美國 C208、日本 jp_room、沛珊手穿裙子（這六件 LAWWW-C 都已整合）；**社科院柱廊柱子透空 `75080217`**（GLB `8e8d130e`；DELIVERED，LAWWW-C 還沒回 ACK）；outbox 格式修正 `18bd8e26`（模擬 0 項，等 LAWWW-C 跑 incr）。
- **正在做、停在 WIP**：SOC-COURT-1021 社科院中庭夜間光＋公告欄——腳本改了、**GLB 沒換**（repo 裡還是柱子版），下一步見 `test_shots/soc_court_1021_wip/README.md`「還沒做完」1～3。
- **其他 WIP**：PS-SKIRT-LEG（`27618d8d`）；榕樹氣根黑線（查到一半，`test_shots/patrol_campus_1021/README.md`；`street_trees.glb` 共用、含溫州街，改之前問 LAWWW-C）。
- **沒測**：SOC-COURT 洗牆光移到 3 cm 以後的版本（沒匯出、沒截圖）；所有東西都沒在 iPhone 實機測過。
- **沒整合、沒發布**：SOC-COURT（WIP）；社科院柱子等 LAWWW-C 整合。LAWWW2 不碰 main、不發布。
- **沒有遠端備份的**：只有 scratchpad 的測試工作樹（`devwt12` 乾淨的開發分支、`devwt13`＝開發分支＋SOC-COURT 交班前一版 GLB＋fog patch）和截圖原檔；成果都能從 repo 的腳本重做。
- **下一班第一步**：照 AI_SESSION_HANDOFF.md 第 4 節接班（fetch、讀 LAWWW-C 總表和我的 outbox 有沒有新的回覆）→ 接 SOC-COURT-1021「還沒做完」第 1 步（重新匯出＋疊面檢查）→ 之後照下面「全部待辦」10-21 最新那一節。

## 💾 保存點（LAWWW2-C，2026-10-21 14:3x UTC）：使用者「每週使用量快要到了 還不是真的交班 但請先檢查手上的任務 待辦 做好的東西 先放上GitHub」，之後「之後可以繼續原本在做的事情 直到我真的請你交班」
- **不是交班**：同一個工作階段 `session_015BuNi47yLUt5PviELapMNj` 繼續做；分支 `claude/focused-cray-c9uwvw`。這一節是萬一額度突然用完時的接手點。
- RULE_SOURCE：LAWWW-C `origin/claude/adoring-meitner-mqzst8`（看過 `96af1e54`）。
- 現在的身分與指示：3D 美術總監（使用者 10-21 12:0x，UA-LAWWW2-1021-02／X90；標準 `ART_SOP.md` 第 10 節）；照 D99 先做經濟系 → 寒暑假 → 美國需要的場景（LAWWW-C 13:51Z）。角色美術由 LAWWW-C 驗收（D100）。
- **今天（10-21）做好、已整合進開發分支的**：體育館光暈＋疊面（7baa4587 起）、LICENSES／原始檔清單（A3／A4）、大一 203 紙箱＋阿凱的膠帶（36c07603 → 開發分支 7ef4ff56）、美國 C208（13707c1f → fc645c8b）、日本 jp_room 保留（c8c810e1 → 90680fc6）、沛珊手穿裙子（cfd0e566，LAWWW-C 13:51Z 已套、接受）。
- **WIP（保存了、沒有交）**：
  1. **社科院柱廊柱子擋住玩家（P1）**：`campus_socsci.py` 14 根柱子換 `wz_pillar_soc` 材質＋GLB 重建（三角形不變、+1 材質）。**還沒在遊戲裡拍前後對照**。下一步：`$S/devwt13`（開發分支 96af1e54＋新 GLB）跑 `test_shots/patrol_campus_1021/patrol_campus.py <工作樹> <URL> <輸出> 15.0 soc_lib,soc_court_s`，和 `$S/devwt12`（沒改）比；看得到網點透空就交（patch 不用，只換 GLB＋json）。
  2. **巡場景第 1 區校園**：白天、黃昏看完，夜晚拍了沒看；毛病列在 `ART_DIRECTOR_PATROL.md` 第 1 節。
  3. **榕樹氣根黑線（P2）**：查到一半，探針結果在 `test_shots/patrol_campus_1021/README.md`；`street_trees.glb` 共用（含溫州街），修之前問 LAWWW-C。
  4. **PS-SKIRT-LEG**（27618d8d）：停成 WIP，排在 D99 場景後面。
- **待辦**（照順序）：柱子交件 → 校園夜晚看完 → 社科院中庭那面實牆（P2）→ 文學院／校史館黑門（P2）→ 寒暑假要用的 3D（機場等）→ 美國（A9 超市之間的街）→ 其他區域照 ART_DIRECTOR_PATROL.md 的順序；ART-BALCONY-POTS（P3）；outbox_LAWWW2.json 格式修正（P3，LAWWW-C 13:36Z，跟下一次交付一起改）。
- **沒有遠端備份的**：只有 scratchpad 的測試工作樹（`devwt12`＝開發分支 96af1e54 乾淨；`devwt13`＝96af1e54＋新社科院 GLB；`chk382` 乾淨；`l118wt`、`wzwt` 是 10-20 的舊沙盒，裡面的修改都已被我的分支和開發分支更新的版本取代）和截圖原檔（挑過的合成圖已放進 repo）。沒有獨有的成果。
- 沒在 iPhone 實機測過；全部是 Playwright 手機模擬。

## ▶ 值班登記（LAWWW2-C，2026-10-20T13:04Z）：使用者「我回來了，請同步 GitHub 最新進度，接續工作」＋「你的部分沒有別的AI接班 直接從你沒做完的開始」——同一個工作階段接續，基準 `7ed82687`（沒有別人接過 LAWWW2）。照下面「🔁 交班」的 B／C 接著做：BUG-WZFLICKER-2 → US-CAMPUS-WIRE 對 main 重做 → ART-BALCONY-POTS。

### 本班進度（2026-10-20，隨時更新）
- 使用者 13:2x：「你一堆待辦事項都做好了嗎 你自己安排一直做下去」→ 照下面的順序自己排、一直做。
- **US-CAMPUS-WIRE 不用重做**：LAWWW-C 10-18 12:30 已經自己整合（`d3fdab82`），main 上的五個資產和我分支的完全相同。
- **BUG-WZFLICKER-2：停在安全點**（LAWWW-C 13:15 轉使用者的 P0）。
  - 腳本 `ede6c8de`、`bccf1f8d`：
    - 門框直框兩端藏進橫框，木門直框凸出 5 mm；
    - 便利商店冰箱、貨架；
    - 店內側牆前端退 1.2 cm。
  - 暫存重建的 always：溫州街 619.35→605.62、公館 397.75→389.02、118 巷 423.41→378.81 m²。
  - 還沒做：GLB 換進 assets、遊戲內截圖、交付。LAWWW-C 13:25：排在 118 巷第一批店面之後。
  - 溫州街這次算修 bug（X69、X79），可以換；溫州街材質合併先不動，等 LAWWW-C 量 draw call（PERF-WENZHOU-1020）。
- **LANE118-SHOPS-1020（P0，使用者 10-20 經 LAWWW-C）：第一批九間全部交付 `43cf956a`**（outbox `4f5f1d89`）。
  - 說明：`test_shots/lane118_shops_1020/README.md`。
  - 遊戲內：測試工作樹（LAWWW-C `928d3b78`＋臨時接線 `src/l118_shops3d.js`）跑 `tests/flow_l118_shops.py`（滇香小館）中。
- **使用者 10-20 15:1x 直接（糾正）：「霖澤館長椅都是靠窗的靠牆的」**。
  - 3F、4F 的野餐桌不再擺中間：南窗下一排（一張對一扇窗）、西牆一排（沿著牆）；
  - 微波爐、飲水機、回收桶搬到東牆，中間空出來走路；
  - 我的理解是「桌子沿著窗、沿著牆排」，如果是桌子短邊頂著牆，使用者會再說。
- 已交：LANE118 九間（LAWWW-C 已整合 `4560f8fd`）、BUG-WZFLICKER-2（`0f430885`）、體育館樓梯（`48275d72`）。
- **使用者 10-20 15:3x 三項**（全文在 LAWWW-C 的 `docs/handoff/user_asks_LAWWW.json`）：
  1. **霖澤館 3F、4F：交付 `5566a0c5`**（`test_shots/linze_upper_1020/README.md`、`patches/linze_upper_wire_test.diff` 套開發分支 `207d6c43`，`flow_linze_upper.py` ALL PASS）。狀態：MODEL_READY／INTEGRATED 只在測試工作樹／READY_FOR_ART_REVIEW。電梯沒接（LAWWW-C）。
  2. **樓層規劃：`LINZE_WANCAI_FLOORS_PLAN.md`（`5d1f54ec`、`5984c140`）**。LAWWW-C、AA-C 都回了：
     - 202 開成平面教室；
     - 研討室 A、多功能教室要能走進去；
     - 5F 以上不做；
     - 順序：研討室 A → 202 → 多功能教室。
  3. **118 巷九間店驗收與效能（L118-SHOPS-AUDIT-1020）**：
     - 進行中；
     - GLB 數字、吊燈高度已量；
     - 遊戲內量測腳本 `tests/audit_l118_shops.py` 在測試工作樹 `$S/devwt`。
- 研討室 A、202、多功能教室：模型＋配置進 assets（`0a5cc70a`，MODEL_READY）；流程測試在測試工作樹三間都 ALL PASS。
  - 還沒交：README 的截圖、效能；牆淡出的修正（冷氣、EXIT 燈條、書櫃放進牆的群組）腳本改了、還沒重建。
- **使用者 10-20 17:1x 直接（P0）**：
  - **X85 空橋的門**：交付 `c77e68a2`，LAWWW-C 已接進開發分支 `5a6990dd`。
  - **X86 從校園看出去的公館很醜**：第一階段（校園背景的羅斯福路兩排）交付，說明 `test_shots/gg_backdrop_1020/README.md`、patch `patches/gg_backdrop_wire.diff`。
    - MODEL_READY／INTEGRATED 只在測試工作樹／READY_FOR_ART_REVIEW；
    - 同一次讀檔切換量：draw call −1、三角形 +1 萬、陰影那一輪不變；
    - 第二階段（公館區域裡面的店面樓上、捷運出口的 GONGGUAN、水源市場）還沒做。
- 研討室 A、202、多功能教室重建版交付 `75ef4ae3`（牆淡出時飄著的東西、note→dev；flow_rooms 三間 ALL PASS）。
- 霖澤館 3F、4F 重建版交付（靠窗、靠牆那一條長椅坐不到 → 留走道＋走近點；reachability_all 舊版 FAIL、新版 PASS）。
- **LAWWW-C 19:0x 轉使用者 18:5x**：「我接下來十小時不會看這裡……負責美術的 ai 它應該也有很多可以做的，你可以看一下他做好的東西是不是可以更精致一點」；這十小時不停下來問使用者，需要使用者決定的先照判斷做、標「待使用者確認」。
  - LAWWW-C 派的順序：GG 第二階段 → ART-L118-LANE-1020 → ART-ROOM-MULTI-1020（＋ART-ROOM-LIFE-1020）→ SCN-V4-01／V5-01（建議給 Blender 子代理）。
- 118 巷驗收：README `test_shots/l118_audit_1020/README.md`；韓食重建、九間 layout 說明文字 note→dev。
- X86 第二階段（公館區域裡面）交付：`test_shots/gg_zone_1020/README.md`、`patches/gg_zone_far_wire.diff`。
- LAWWW-C 20:08：X86 第二階段已接 `0582af9f`；決定公館七樓以上不投影（下一個交付順手做）；4 項舊 FAIL 要我判斷。
- ART-L118-LANE-1020 交付：`test_shots/l118_lane_1020/README.md`、`patches/l118_lane_props_wire.diff`。
- 10-20 21:0x 公館七樓不投影＋柱子透視＋4 項判斷交付 `74cfdfb7`（LAWWW-C 接進 `1475d312`）。
- 10-21 07:xx（工作程序重新接上，中間停約 10 小時）使用者「繼續」：118 巷效能＋兩個測試修正交付（`536eec11`，LAWWW-C 已接 `2fb01ed0`）。
- 10-21 公館校門口 draw call 交付（`6620cba8`）：`test_shots/gg_drawcall_1021/README.md`、`patches/gg_drawcall_atlas_glow.diff`（套 `0e7a5efa`）、捷運出口 GLB 重匯出。
  - 主要原因是光暈（一個 GLOW_ 一個 Sprite，17:24 以後 90 次）→ 一個模型一個網格；店內景深卡 15 面 → 一張 atlas；捷運出口 23 → 14 個網格。
  - 校門口 1.53 → 1.03 倍，`gongguan_glb_integration.py` ALL PASS（修改前 3 項 FAIL）。
  - `campus_glb_integration.py` 修改前、後一樣跑不完（過時：campus_modern_glb）；傅鐘光暈另外驗 PASS。
- 10-21 PERF-WZ-NIGHT（LAWWW-C 08:02Z P1，BB-C 量溫州街 19:30 +37%）：查完，沒有晚上才多的場景物件（人藏起來、陰影強制重畫兩版一樣）；差別是路人位置＋X79 陰影取樣。`test_shots/wz_night_1021/README.md`（`6620cba8`）。
- 10-21 ROOMS-REFINE-1021（LAWWW-C 07:42Z）：202 桌面調亮、外套書包平滑著色＋褶子、方塊地毯看得出一格一格；seatcheck 掃 118 巷：滇香進門位置、家常加自取櫃、蛋包飯兩側桌子靠牆。`test_shots/rooms_refine_1021/README.md`（`6620cba8`）。
- 10-21 MALE1-5F-1021（AA-C J1，LAWWW-C 08:22Z）：男一舍 4→5 層；導航、互動點完全相同，鏡頭碰撞只變高。`test_shots/male1_5f_1021/README.md`、`patches/male1_5f.diff`（本 commit）。
- 10-21 使用者 08:43（LAWWW-C 轉）全面清查歷史遺留（BACKLOG-SWEEP-LAWWW2-1021）：清查完，`BACKLOG_SWEEP_1021.md`；接下來照它的 A 節做（體育館光暈 → 體育館疊面 → LICENSES 補列 → 原始檔清單 → 公館陽台盆栽 → 社科院夜景 → 小公園疊面…）。
- 10-21 日本宿舍 3D（AA_341 優先 1）：做到你的房間 jp_room（WIP），**暫停**——清查查到使用者 10-18 14:0x 選「日本場景：全 2D」（UA-LAWWW-1018-06、JP-3D-ASK 取消），和 LAWWW-C 10-20 的排程衝突，等 LAWWW-C 確認。WIP 在 `wip_jp/README.md`（本 commit），不整合。
- 接下來（LAWWW-C 21:00 排的順序）：~~公館店面材質合併~~（交了）→ 日本學期場景優先 1（AA_341 第 5 節）→ ART-BALCONY-POTS；子代理交多功能教室／202 時驗收。
- （舊）接下來：
  3. 118 巷：滇香掛毯、家常電視的「看」按鈕被座位搶、韓式座位卡店面，重建；驗收 README；
  4. X86 第二階段；
  5. ART-BALCONY-POTS（只做公館；溫州街暫停）。

## 🔁 交班（LAWWW2-C，2026-10-18 12:3x UTC；使用者「使用量大概在半小時到上限 先做收尾」）
- 工作階段 `session_015BuNi47yLUt5PviELapMNj`；分支 **`claude/focused-cray-c9uwvw`**；交班時最後 commit 見本節下面那一個 commit（這份檔是最後一個改動）。
- RULE_SOURCE：LAWWW-C 的 `origin/claude/adoring-meitner-mqzst8`；正式版 main `4c0cbefc`（v9.10.1）。
- **A. 本班已完成成果**（都在我的分支；整合狀態照 LAWWW-C 回覆）：
  | 任務 | commit | 整合 |
  |---|---|---|
  | ART-YU-3D-1018 小語 3D | `615a3cbf` | 已整合，v9.10.1 已發布 |
  | ART-EXT-TEACH 博雅／普通室內 | `511f6cd6` | 已整合，v9.10.1 已發布 |
  | ART-LIB-VIEW-1018 總圖窗景 | `ed0196e4` | 已整合，v9.10.1 已發布 |
  | BUG-COPLANAR-DEV 霖澤館／萬才館外觀 | `3d7f898d` | 已整合（7e287c19），v9.10.1 已發布 |
  | ART-SEATFIG-1018、ART-GG-SHOPS-1018 | `e315997b`、`307787c1` | 已整合 |
  | ART-EXT-MRT 捷運出口 | `ca3e14d5` | 交付；整合狀態請看 LAWWW-C 總表 |
  | SCN-US-02 v3 美國校園老校區（空拍圖） | `90c2896e` | 交付；排 v9.10.2 以後 |
  | 美國校園紅磚顏色（使用者直接說、已確認） | `beb5fa54` | 交付；排 v9.10.2 以後 |
  | ART-US-SEASON 美國四季 | `407ec3f5` | 交付；排 v9.10.2 以後；GLB 一定要配 `us_season.diff` |
  | US-CAMPUS-WIRE-1018 美國校園＋圖書館接成區域 | `4cee25c8` | 交付；**patch 要對 main `4c0cbefc` 以後重做**（LAWWW-C 12:13） |
  | ART-NPC-40 | （早就交完：1b924dd4、45fa5907） | 已整合 |
  | ART-CH-PINYU | 沒做（和使用者凍結人物衝突） | LAWWW-C 確認取消 |
- **B. 全部未完成工作**：
  1. **BUG-WZFLICKER-2**（做一半，見 C）。
  2. ~~**US-CAMPUS-WIRE patch 重做**~~（10-20：不用做，LAWWW-C 已整合 d3fdab82）：對 main `4c0cbefc` 以後，`us_season.diff`、`us_campus_wire.diff` 先 `git apply --check`，不乾淨就重做；測試照 README（nav_us_unit、us_season_unit、flow_us_campus.py）。
  3. **ART-BALCONY-POTS**（P3）：溫州街、公館二樓陽台盆栽。⚠️ 溫州街部分在下面 ⏸ 表是「使用者暫停」，先問 LAWWW-C。
  4. ⏸ 表裡其他暫停項目（ART-VSLICE、ART-WZ0、BB_217 第 7 節、日本場景、宿舍大廳疊面、ART-METHOD6、ART-10）照表。
- **C. 正在做的工作：BUG-WZFLICKER-2**（LAWWW-C 11:47 派：溫州街三處＋公館、118 巷鐵捲門疊面）。
  - ⚠️ ⏸ 表寫溫州街的三處是使用者 10-17 暫停的，LAWWW-C 11:47 又派了：下一班先跟 LAWWW-C 確認溫州街這部分恢復了沒有。
  - 已改的腳本（commit `e5532105`，GLB **還沒重建、沒交付**）：`wz_shopkit.py` 割字貼紙離玻璃 6 mm、淺店內前緣在玻璃後 1.2 cm、側牆 9.4 cm；`wz_street.py` `WZ_NOMERGE=1` 除錯開關。
  - 還沒做：A5 日日便利飲料冰箱（冰箱玻璃和側板前面同一個平面）；公館冷氣、招牌架；三份 GLB 重建＋前後數字（開發分支：溫州街 619.35、公館 397.75、118 巷 423.41 m²）＋截圖。
  - 118 巷用現在的腳本重建：鐵捲門×護牆 21.8 → 0 m²，但店面換成新組件（物件 860 → 652、材質 74 → 84），要先看畫面再交。
- **D. 最新決策與規則**（本班收到的，原文由 LAWWW-C 登記）：
  - D104：靜態 2D 背景、CG 由使用者生成，3D 只做走得進去、會互動的場景和人物。
  - 使用者 10:4x 直接：「交換學生大學地板的橘色好醜」→ 美國校園紅磚改 `#6b5047`；10:5x「現在這個顏色是對的」「改變之後的可以」＝紅磚顏色確認（只有顏色）。
  - 使用者凍結人物（BB_201／8510260c）：品妤用第六版，所有人物改版都停。
- **E. 跨 AI 協作狀態**：
  - 給 LAWWW-C 的交付都 DELIVERED，LAWWW-C 都回了 ACK（最後一則 12:13：v9.10.1 已發布、US-CAMPUS-WIRE 要對 4c0cbefc 重做）。
  - 本班沒有在等其他 AI 回覆的問題。outbox：`docs/handoff/outbox_LAWWW2.json`。
- **F. 測試與問題**：
  - 本班所有東西都**沒在 iPhone 實機測過**（只有 Playwright 手機模擬）。
  - US-CAMPUS-WIRE 的測試是在 40c3ed4f 上跑的，main 4c0cbefc 上還沒跑。
  - 沒備份的東西：只有 scratchpad 的測試工作樹和重建出來的暫存 GLB（都能用腳本重做），沒有獨有的成果。

## ⏸ 暫停中（HV-15／D101：五欄；每次接班、每次發布前、使用者改優先順序時逐項看，要有結果——恢復、改下次檢查日、或請使用者決定取消）
最後檢查：2026-10-21 15:3x UTC，帳號 A 的 LAWWW2 接班——問了使用者溫州街的暫停：「溫州街修改直接收尾 舊店面翻修繼續」「黃昏收尾」→ ART-VSLICE、ART-WZ0、溫州街疊面／陽台盆栽恢復（下面三列）；其他各列下次檢查日 10-25 還沒到，照舊。USER_WANTS B10、I05 和 tasks.json 的暫停欄位等值班 LAWWW 改。（上一次：2026-10-18 12:3x UTC，LAWWW2-C 交班（ART-US-SEASON 已恢復並交付；ART-CH-PINYU LAWWW-C 確認取消；BUG-WZFLICKER-2 溫州街部分 LAWWW-C 11:47 有派，暫停狀態要再確認）。）

| 項目 | 誰決定暫停 | 為什麼 | 負責人 | 恢復條件 | 下次檢查日 |
|---|---|---|---|---|---|
| ~~ART-VSLICE 溫州街 Café 前黃昏垂直切片~~ **已恢復（收尾）**：使用者 2026-10-21 15:3x 對帳號 A 的 LAWWW2「黃昏收尾」（UA-LAWWW2-1021-09）——做到一半的做完就結案、不擴大 | 使用者 10-17 05:0x（對 LAWWW2-C） | 原話「溫州街修改也暫停」 | LAWWW2 | 已恢復 | 交件時 |
| ~~ART-WZ0 溫州街舊店面翻修~~ **已恢復（繼續）**：使用者 2026-10-21 15:2x「溫州街修改直接收尾 舊店面翻修繼續」（UA-LAWWW2-1021-08） | 使用者 10-17 05:0x | 同上 | LAWWW2 | 已恢復 | 每交一批時 |
| ~~BUG-WZFLICKER-2 的**溫州街**三處疊面（x 10.35、41.4、−4.3）、ART-BALCONY-POTS 的**溫州街**部分~~ **已恢復（收尾）**：同上「溫州街修改直接收尾」（UA-LAWWW2-1021-08）；小公園疊面（BACKLOG A7）一起 | 使用者 10-17 05:0x | 同上 | LAWWW2 | 已恢復 | 交件時 |
| ART-US2-FIX-1018 的 **BB_217 第 7 節美術修正**（C 棟 208：泡麵袋、9/13 傍晚燈光、生活痕跡、外套門、手寫輪值表、臥室兩張床） | LAWWW-C（看板） | 美國不在 v9.10（使用者 10-18 01:0x 定的範圍） | LAWWW2-C | v9.10 發布後照佇列做 | v9.10 發布前（最晚 10-25） |
| ~~ART-US-SEASON 美國四季~~ **已恢復並交付 `407ec3f5`（12:1x）** | 使用者 10-18 03:3x（經 LAWWW-C 03:08）＋使用者直接「他不是請你繼續做那四個台大建築嗎」 | 四座台大建築先做；美國校園照空拍圖改（SCN-US-02 v3）也排在前面 | LAWWW2-C | 四座＋SCN-US-02 v3 做完 | 每交一座時看一次 |
| 人物造型改版、人物模板；ART-13（明軒、小語）、ART-CH-PINYU（品妤） | 使用者 10-17 05:0x「修改人物的事情暫停」＋23:4x 分工（LAWWW-C 23:49 不排） | 先做大項目；人物由 LAWWW-C 驗收、派工 | LAWWW2-C（模型）、LAWWW-C（派工、驗收） | 使用者或 LAWWW-C 派工。例外：3D 人物的小錯誤（穿模）可以修（使用者 10-18 00:0x，AA-C 轉） | v9.10 發布前（最晚 10-25）；品妤若經濟系 v9.10 要用，請 LAWWW-C 當天派 |
| 日本交換場景 | LAWWW-C 10-17 23:49（不排） | 美國先、日本後（使用者 10-17 05:0x 的順序） | LAWWW2-C | 美國做完、LAWWW-C 派工 | v9.10 發布前（最晚 10-25） |
| BUG-COPLANAR-DEV 宿舍大廳最後約 10 m² | LAWWW2-B（10-17 02:4x） | 要等四人房（DORM-LOFT）接進遊戲才看得到哪些疊面還在 | LAWWW2-C | DORM-LOFT 整合進開發分支 | v9.10 發布前（最晚 10-25） |
| ART-METHOD6 方法交接第 6 項 | LAWWW2-B | 等 AA 交驗證件（土地公廟供品組） | LAWWW2-C 驗收；AA-C 交件 | AA-C 交驗證件 | v9.10 發布前（最晚 10-25） |
| ART-10 自強十舍 | LAWWW2-B | 等使用者的照片 | LAWWW2-C | 使用者給照片 | v9.10 發布前（最晚 10-25） |

- **不是暫停、但要改負責人**（D100：2D 背景由 BB 向使用者要；D101 第 4 條換分工當天重新指派）：ART-17、ART-BG09、ART-BG10、ART-BG12、ART-BG-AA185、ART-14、ART-15、ART-16。看板上負責人還是 LAWWW2，已請 LAWWW-C 改。
- **已交付、等整合（不是暫停）**：
  - SCN-US-02 美國校園 `1e6987cb`；
  - SCN-US-LIB 法學院圖書館 `8d21b0f2`；
  - ART-US2-FIX-1018 的**冰箱、鏡頭那一半**（BB-C 抓到的錯誤）`356d77c6`；
  - 合租戶臥室 A 門口走不到（LAWWW-C 02:50，併進同一包）`efaca16f`；
  - ART-NPC-40 第五批 `45fa5907`；
  - 以上都在 v9.10 發布後整合（LAWWW-C 01:01）。
- **ART-SOP、VAC-A1**：`ART_SOP.md`、`SCENE_RULES.md`、`sop_demo/README.md`、`VAC_A1_既有資產盤點.md` 已經在我現在的交付分支 `claude/focused-cray-c9uwvw`，和 funny 分支的一模一樣（`69e4b181`、`5c6a0391`、`4e4f4f36`、`644a322f`），LAWWW-C 直接合併。

## ★★★ 最新（2026-10-18 05:3x～12:xx UTC，LAWWW2-C）
- **新永久規則 D104**（使用者 10-18，經 LAWWW-C 07:43 轉達，P0）：
  - 不需要互動的靜態圖（2D 對話背景、場景圖、CG）一律由使用者生成，BB 寫提示詞；**不再用 Blender／3D 截圖做正式 2D 背景**。
  - 3D 只做玩家走得進去、會互動的場景和人物。
  - 已回 ACK：佇列裡沒有 2D 背景的工作。總圖窗景打算做 3D 遠景，等 LAWWW-C 判斷算不算 D104。
- **這一段交付的**（都在 `claude/focused-cray-c9uwvw`；等 LAWWW-C 整合）：

| 工作 | commit | 內容 |
|---|---|---|
| ART-YU-3D-1018 小語 3D | `615a3cbf` | `bl_yu.vrm`＋側背包 `bag_yu.glb`＋`char_yu.diff`；char_review/yu/。LAWWW-C 06:39 ACK，整合後驗收 |
| ART-EXT-TEACH 第二批室內 | `511f6cd6` | 普通、博雅室內 GLB＋`campus_teach_int.diff`（對 `ba6e9aa4`）；四個 unit＋nav ALL PASS |
| ART-SEATFIG-1018 博雅 101 禿頭、白臉 | `e315997b` | `seated_figures.glb` 重烤（`hair_cleanup`）、`vroid_npc_f1.vrm` 臉暗部 0.94→0.838；程式不用改 |
| ART-GG-SHOPS-1018 公館店面第一輪 | `307787c1` | `gongguan_shops.glb`（`wz_shopkit.arcade_front_v2`、`SF_GG`）；程式不用改 |
| ART-LIB-VIEW-1018 總圖窗景 | `ed0196e4` | `library_views.diff`（parallaxViews）＋4 張照片重拍；LAWWW-C 08:28：照 D99 排在 v9.10.1 發布以後整合 |
| ART-EXT-MRT 捷運公館站出口 | `ca3e14d5` | `gongguan_mrt_exit.glb`＋`gongguan_mrt.diff`（PIT_*／PITMASK 深度遮罩：地面下的電扶梯看得到） |
| 美國校園紅磚不要橘色（使用者直接說；10:5x 確認新顏色） | `beb5fa54` | `us_campus.glb` 紅磚 `#6b5047`；test_shots/us_oldcampus_1018/brick_before_after.webp |
| US-CAMPUS-WIRE-1018 美國校園、法學院圖書館接成區域 | `4cee25c8` | `patches/us_campus_wire.diff`（對 40c3ed4f，先套 us_season.diff）；nav_us_unit 74 項、flow_us_campus.py（新）ALL PASS；test_shots/us_campus_wire_1018/ |
| BUG-COPLANAR-DEV 霖澤館外觀、萬才館外觀疊面 | `3d7f898d` | 572→30、642→12 m²（扣掉窗原型假警報：544→1.9、634→3.8）；霖澤館室內不用換；wancai_glb_integration ALL PASS；test_shots/coplanar_1018/ |
| ART-US-SEASON 美國篇四季 | `407ec3f5` | `us_community.glb`、`us_campus.glb` 帶四季＋`patches/us_season.diff`（us3d.js＋tests/us_season_unit.js）；test_shots/us_season_1018/ |
| SCN-US-02 v3 美國校園老校區（空拍圖） | `90c2896e` | `us_campus.glb`＋`us_campus.layout.json` 第 3 版；新組件 `us_oldcampus_kit.py`；導航、出生點、互動點和第 2 版逐項相同；test_shots/us_oldcampus_1018/ |

- **⏸ 收尾（使用者 12:4x：「使用量大概在半小時到上限 先做收尾」）**——BUG-WZFLICKER-2 做到一半，WIP 在這個 commit：
  - 已改（`wz_shopkit.py`，用不合併的掃描驗過，GLB **還沒重建、還沒交付**）：
    - 二樓窗的割字貼紙 −0.13 → −0.124（離玻璃 6 mm；x 10.35 那一處消失）；
    - 淺店內的地板、側牆、天花板前緣在玻璃後面 1.2 cm；
    - 側牆厚 8 → 9.4 cm（x −4.3、−20.7 鋁框×店內那兩處消失）。
  - `wz_street.py` 加除錯開關：`WZ_NOMERGE=1` 不合併，`tools/glb_coplanar.py` 就看得到零件名字。
  - **還沒做**：
    - A5 日日便利的飲料冰箱：冰箱玻璃（zb＋0.56）和兩側板的前面同一個平面，`sk_in_A5` 在 x 47.4 還有 4.9 m² 沒查清楚；
    - 公館的冷氣、招牌架還沒查；
    - 三份 GLB 用新腳本重建、前後數字、Blender／遊戲內截圖。
  - **118 巷**：用現在的腳本重建（還沒有這次的改動），鐵捲門×牆腳護牆 21.8 m² → 0、非牆面的疊面 61 → 16.5 m²。
    - 但結構和開發分支的 GLB 不同（860 → 652 物件、74 → 84 材質：店面換成新的組件），要先看畫面再交。
  - 下一班第一步：
    1. 先查 A5 冰箱；
    2. 用 `wz_street.py -- --set wenzhou|gongguan|lane118` 重建三份；
    3. `glb_coplanar.py` 前後數字（開發分支：溫州街 619.35、公館 397.75、118 巷 423.41 m²）；
    4. 118 巷前後截圖。
  - 下一項：ART-BALCONY-POTS（P3）。
  - **LAWWW-C 12:13（收尾之後收到）**：
    - v9.10.1 已發布，main `4c0cbefc`（PR #7），含霖澤館／萬才館外觀疊面、小語 3D、教學館室內、總圖窗景。
    - 美國校園＋四季排 v9.10.2 以後。
    - **US-CAMPUS-WIRE 的 patch 要對 main `4c0cbefc` 以後重做**：`us_season.diff`、`us_campus_wire.diff` 現在是對 40c3ed4f，下一班先 `git apply --check` 看還乾不乾淨，不乾淨就重做。
- **LAWWW-C 11:47 派的第三批**：1. US-CAMPUS-WIRE-1018 交了 `4cee25c8`；2. BUG-WZFLICKER-2（溫州街三處＋公館、118 巷鐵捲門疊面）**進行中**；3. ART-BALCONY-POTS（P3）。BUG-COPLANAR-DEV 已整合 7e287c19；ART-CH-PINYU LAWWW-C 確認取消。
- **LAWWW-C 11:32 派的第二批**：
  1. SCN-US-IU：回覆「已照空拍圖做完」（90c2896e）；
  2. BUG-COPLANAR-DEV：交了 `3d7f898d`；
  3. ART-NPC-40：已經全部交完（40 個 VRM 和開發分支逐檔相同；第四批 1b924dd4、第五批 45fa5907 已整合）；
  4. ART-CH-PINYU：**沒做**——和使用者決定衝突（BB_201／`8510260c`：「使用者決定不再修人物，品妤用第六版」；第六版 VRM 已經接在開發分支）。已回報 LAWWW-C，等它跟使用者確認。
- SCN-US-02 v3 的測試工作樹 `$S/ucwt`（LAWWW-C `a53cc871`＋臨時接 `us_campus` 區域，伺服器 8812；`$S/usv3/setvar.sh before|after` 換 GLB＋配置）。不 commit。
- 使用者 07:5x（經 LAWWW-C）：「還有一小時你繼續做」，會親口說換班。使用者 10:0x 直接：「繼續阿」。
- **使用者 10:4x 直接對 LAWWW2-C**：「交換學生大學地板的橘色好醜」＝美國校園的紅磚（校門廣場、門後步道、樹林小路）。
  - 處理：改成偏褐、低彩度的舊紅磚（`#6b5047`），`beb5fa54`；遊戲內前後截圖 test_shots/us_oldcampus_1018/brick_before_after.webp；已通知 LAWWW-C（DELIVERED，沒要回）。
  - 以後美國篇的紅磚都照這個顏色，不要回到橘紅。
  - **使用者 10:5x 看了前後截圖：「現在這個顏色是對的」「改變之後的可以」**＝紅磚顏色 `#6b5047` 使用者確認（只有顏色；老校區其他美術照舊 READY_FOR_ART_REVIEW）。
- **ART-US-SEASON 已交付** `407ec3f5`：新的社區、校園 GLB 都要配 `patches/us_season.diff`（沒套的話夏天也看得到細枝、落葉）。
- 截圖要點：測試存檔有要回的訊息時，手機會自己打開、**遊戲暫停**，之後拍到的都是停住的畫面。截圖的 js 先 `STORY.phoneAuto=()=>{}` 再按「收起來」（只用 CSS 藏起來沒用）。
- 工作樹：`$S/seawt`（`a53cc871`＋us_season.diff，伺服器 8813）。
- **工作樹**（`$S`＝本工作階段的 scratchpad）：
  - `$S/yuwt`（LAWWW-C `ba6e9aa4`＋小語 patch＋新 GLB，伺服器 8810）；
  - `$S/yubefore`（`ba6e9aa4` 原樣，8811）；
  - `$S/teachin`（`5ffde5b3`＋TEACH 室內 patch，8809）。

> ## ⛔ 強制閱讀（開始任何美術工作前；LAWWW2、LAWWW2-B、帳號 A／B 的接班者、AA-B／BB-B 等支援 AI、子代理）
> 使用者 2026-10-16 約 20:2x UTC：標準是**得遊戲大獎、不要像廉價拼接遊戲、不要有方塊感**；做法要照 SOP，新方法加進規則、舊的不刪。
> 1. `docs/art-rebuild/second_ai/ART_SOP.md`（製作 SOP：工具鏈與指令、製作順序、八項驗收、審查方式、新方法登記表）
> 2. `docs/art-rebuild/second_ai/SCENE_RULES.md`（規格；第 9 節＝得獎遊戲標準的驗收清單）
> 3. `docs/art-rebuild/second_ai/sop_demo/README.md`（示範案例：溫州街路面＝新標準通過；土地公廟＝還沒通過的例子）
> 4. 工具：`tools/blender/env_second/lib2.py`、`tools/blender/b3lib.py`、`render_cycles.py`、`shots/fast_shots.py`、`wz_road_tex.py`；測試 LAWWW-B 的 `tests/wz_street_integration.py`
> 5. 最新成果在遠端分支 **`claude/funny-albattani-iawshm`**（帳號 B 的 LAWWW2-B）：接班時先 `git fetch` 這條，讀 HANDOFF.md 最上面的「方法交接進度」與最後 commit，把有效成果合併到自己的分支（merge，不 rebase、不 force push），確認理解後才繼續美術工作。
> 6. 還沒完成的品質工作：HANDOFF.md 的「方法交接進度」表、「還沒做（我的佇列）」；土地公廟（sop_demo 案例 B 的四處）、機車腳踏車多車型（使用者 20:2x：不要同一個款式只換顏色）。
> 不叫醒休班的帳號（D75），只用 GitHub 交接。

## ✅ 接班：2026-10-17 04:1x UTC｜帳號 C｜LAWWW2-C｜`session_015BuNi47yLUt5PviELapMNj`｜分支 `claude/focused-cray-c9uwvw`
- 照總入口第 7.6 節十四步接班；上一任 LAWWW2-B（帳號 B，02:49Z 正式交班，`2d88db5f`，交班後沒有新 commit）。
- RULE_SOURCE `claude/modest-rubin-2lyp7g`（HV-11，`duty find` 結束碼 0；目前沒有 LAWWW 值班）。
- 對帳：`check` OK（十一項、0 異常；LAWWW-B 03:14Z 快照之後已補 ART-GG-SIGNS-2 進總表、交付登記第 6 類已清）；`duty verify` OK；`roles` OK。
- 合併：系統指定的分支原本停在 `main`（6d5c3279，和 funny 分岔、merge 衝突上百檔，而且是 LAWWW 的程式）→ 改成從 funny `2d88db5f` 接續（main 在遠端完整，沒有丟任何東西）。8 條 `second-ai-env-art-wip-*` 照 BRANCH_INVENTORY 已確認整合（權限受阻沒刪），不另合併。
- D90 ACK（第 14 節，請值班 LAWWW 代登記）：HV-11＋RULE_SOURCE `9266693c`；已讀 D90、D92、D93；沒有沒處理的使用者指示；沒有正在跑的長工作；turn_check：本工作階段剛開始，無超時回合。
- 接著做：ART-GG-SIGNS-2（重拍前後截圖 → README → 登記交付）。目前沒有 LAWWW 值班，交付只寫 GitHub（D75）。

### ⛔⛔ 使用者 2026-10-17 約 23:4x UTC 直接給 LAWWW2-C（P0，最新，分工；取代以前我自己排的佇列）
原文：「現在所有台詞跟劇情就都交給AA／BB負責跟我要CG還有測試／LaWWW2做3D美術／LAWWW負責把你們做好的東西放到遊戲，然後依照v0-V5完成開發，分配任務給你們」
- AA：所有台詞、劇情。BB：跟使用者要 CG、測試。**LAWWW2：3D 美術**。LAWWW：整合進遊戲、照 v0～v5 完成開發、**分配任務**給 AA、BB、LAWWW2。
- 對我的影響：
  - 遊戲程式（`src/us3d.js` 的區域、互動、導航）和測試腳本（`tests/nav_us_unit.js`、`tests/flow_us_exchange.py`）以後是 LAWWW、BB 的事。
  - 這一批已經寫好的照原樣當 patch 交給 LAWWW-C，用不用由 LAWWW 決定；我不再改遊戲程式、不再寫新的測試。
  - 交付以後只交：3D 模型（GLB）、Blender 腳本、配置（layout.json，給 LAWWW 接導航和互動用）、遊戲內或 Blender 的驗收截圖。
- 不再自己排工作（例如兩間超市之間的戶外、15:4x 的佇列）：**下一件等 LAWWW 分派**；企劃組的需求照舊經 LAWWW。
- 通知：LAWWW-C、AA-C、BB-C（23:4x）。

## 🌅 給使用者：10 小時自主工作的整理（2026-10-17 15:4x～夜班，LAWWW2-C；交付後更新 SHA）
**做了什麼**（遊戲裡實際走得到、看得到的）
1. 美國交換篇的場景接進遊戲（使用者 21:1x「先做1」）：公寓（祐廷的單人戶）、公寓社區、大超市、桃園機場出境／入境，**玩家走得進去**（patch 交 LAWWW-C 套用；src 是 LAWWW-C 的檔）。
2. C 棟 208 合租戶的共用廚房（BB_217，US2 唯一要自己走去的戲）：窗口吧台＋高腳椅、冰箱上的輪值表、三扇房門、生活痕跡、US2 的道具（鍋、兩包泡麵、碗、紅筆圈滿的報告）。
3. 社區會所門口（BB_215）：停車場南邊一棟會所，走到門廊下就有「會所」。
4. 機場改成通用（使用者 23:0x）：寒暑假出國也從這裡出發，看板有首爾、東京、金邊、舊金山、洛杉磯、大阪關西、芝加哥。
5. 大超市對面的小亞洲超市（使用者 23:0x）：泡麵、醬料、零食、乾貨、米、青菜豆腐、冷凍水餃、結帳櫃台的紅燈籠；從大超市門口「過馬路」過去，店裡看得到對面的大超市。US1 的台灣泡麵改在這裡買（BB-C 已改順序）。
6. 自己從遊戲內截圖抓到、已經修好的：門牌沒有字、輪值表像亂碼、在屋裡時鏡頭被牆擋住、平台外一片橘紅、冰箱和爐子的互動點疊在一起、亞洲超市窗外的字是反的等（細節：`test_shots/us_zones/README.md`）。
7. 早上 15:4x 以前：戲院、咖哩店的 2D 背景第五版。人物細修照使用者 20:5x 的糾正全部停掉（品妤 v7 沒交、沛珊裙子擱著）。
**等使用者決定的**
- 場景美術要你看過才算數（READY_FOR_ART_REVIEW）：美國公寓、C 棟 208、社區＋會所、大超市、亞洲超市、機場；戲院、咖哩店、宿舍 Y2～Y4、畢業典禮、法院、AA185 的背景。
- 經濟系那一年缺的 2D 背景（BB_216：水餃店、家樓下夜景…）：你說生成圖先空著，要做的時候告訴我用什麼方式。
- 兩間超市之間現在是「過馬路」直接接過去；要不要做成真的走過停車場、馬路的戶外？
- 人物恢復時：主要角色先整理成一個模板（你 20:5x 問的）。
- 都是手機模擬（Playwright＋SwiftShader），**沒有真機測試**。

### ⛔ 使用者 2026-10-17 約 23:0x UTC 直接給 LAWWW2-C（P0，最新）
1. 「寒暑假出國都用的到機場 不只有交換學生」→ 桃園機場出境／入境大廳改成通用：登機只有交換出發那趟（flags.US_DEPARTED && !US_ARRIVED）是 LAWWW-C 的 exchFly「登機：飛往美國」，其他時候是 `airportBoard:true` 的「登機」（寒暑假系統攔下來接；目的地清單照 LAWWW-C／企劃組的欄位，不自己編）。
2. 「超市一個大的超市對面有一個小的亞洲超市」→ 新區域 `us_asian_market`（泡麵、米、醬料、冷凍水餃；店名虛構、不畫商標）；第一階段大超市門口「過馬路」連過去，第二階段超市前停車場＋馬路的戶外。US1「台灣泡麵」改在亞洲超市（劇情文字由企劃組確認）。
- 通知：LAWWW-C、BB-C、AA-C（23:0x）→ 三個都 ACK（22:51Z 佇列）：
  - BB-C：US1 順序改成 巴士站 → 大超市（看蛋的日期）→ 過馬路到對面的亞洲超市（台灣泡麵）→ 搬進公寓（BB_98，991de73d；台詞不變、只換地點；過馬路那句旁白請 AA 加）。C 棟 208、會所門口的截圖出來給 BB-C 看用途。
  - AA-C：寒暑假出國的行程在 AA_242（台詞）、BB_200：C08 首爾（大一暑假 2026-07-13～07-24；7/13 早上機場報到櫃台有一場戲，AA_242 1-3：十個臺大學生、帶隊老師）、C09 柬埔寨（2026-07-27～08-05）、C10 加州（2027-06-21～07-31）、C11 東京（2027-01-17～01-30）、C12 京都（2027-08-09～08-27）；交換：日本 2028-03-25～08-05、美國 2028-08-02～12-23。看板的目的地照這五個城市。
  - LAWWW-C：A（機場通用）、B（亞洲超市）同意。寒暑假出國在 src/vac3d.js（VAC）＋src/data/vac_activities.js；**機場只提供 `{label:'登機', airportBoard:true}`＋`US3.SPAWN.airport_dep／airport_arr`，不放目的地資料、不判斷誰要出發**（LAWWW-C 之後在 VAC 出發那一刻帶進出境大廳、攔 airportBoard）。exchFly 只在 US_DEPARTED && !US_ARRIVED：OK。交付附 SHA、測試、截圖，C 棟 208、會所門口一起交。
- 不停的工作：瀏覽器流程測試照跑；會所模型、patch 交付照排（patch 等這兩件改好一起交）。

### ⛔ 使用者 2026-10-17 20:5x～21:1x UTC 直接給 LAWWW2-C（P0，最新，取代下面 15:4x 的佇列）
1. 糾正（20:5x）：「明明已經指定先做大項目……做完美國第一批場景之後，最近又回到大量人物細修」「你生成這麼多人物，為什麼每個都要重新從零開始？也沒有一個模板嗎？」
   - 承認：05:0x 的指示（人物修改暫停；經濟系場景 → 美國 → 日本）被我 10:4x 的「分批順序」又把人物排回第 1、2 批；美國篇標「等照片」就停，日本篇沒排；15:4x 睡前的佇列也是我自己定的、沒有美國／日本。
   - 模板：身體骨架、臉的程式、建置流程是共用的，路人是參數表；主要角色的頭髮、衣服是「複製別人的腳本再改」，同一個毛病（例：樣本的大耳朵）只修一個人。**人物恢復時第一件事：主要角色整理成一個模板**（一個角色＝一份設定；共同修正放模板）。
2. LAWWW-C 轉達使用者 21:0x（四個職位同一份）：以「玩家實際能玩到什麼」驗收；①經濟系完整流程 ②寒暑假系統 ③美國交換系統；**LAWWW2-C：先完成經濟系及美國交換必需的場景，夠用的角色和道具暫停非必要精修**；不插小任務、夠用的素材凍結。BB-C 同時轉達：「美術的那個人不要再修人物」→ 品妤 v7 耳朵停（用 v6），沛珊裙子和手擱著。
3. 使用者（21:1x）：「先做1，把美國場景接進遊戲」。
   - 現況（查 LAWWW-C 開發分支 c9bba5df）：美國公寓室內、社區戶外、主街、超市、機場出境／入境都只有 3D 模型＋配置，**src 裡沒有任何區域，玩家一步都走不進去**；美國校園沒做；經濟系系館室內（SCN-V0-01）沒做。
   - 正在做：`src/us3d.js`（新）＋`src/data/us_layouts.js`（`gen_us_layouts.py` 產生）：airport_dep、airport_arr、us_outside、us_apartment 四個區域（導航、互動、座位、出口、正式模型、備用模型）；patch `patches/us_zones.diff`（對 c9bba5df）交 LAWWW-C 套用（src 是 LAWWW-C 的檔案）。
   - 測試：`tests/reachability_all.py --zones …` ALL PASS（153 個互動點）；真實手機觸控流程 `tests/flow_us_exchange.py` 跑中。
   - 停止：所有人物細修（品妤 v7 不交）、戲院重算（售票亭電風扇的腳本改了、圖沒重算，第五版的圖照用）。
   - 21:2x 更新：LAWWW-C 的交換最小流程（5ba1bd7a，src/exchange3d.js）已經在開發分支：我的區域蓋過它的臨時場景、寫 EXCH.SPAWN、機場用它的「登機：飛往美國」（exchFly）；patch 改對 753e4ef3。
     - BB-C BB_215（33b025ab）：交換在大四上 2028/8/2～12/23、初雪 12/2；**一定要**：超市、公寓、社區走到 C 棟和會所門口、C 棟合租戶共用廚房（US2 9/13，唯一要玩家自己走去的必要劇情）；**不需要**：主街；校園、公車站先不做 3D。→ 主街從 patch 拿掉，社區「出門（去超市）」→ 超市 us_market。
     - BB-C BB_216（b83a8636）：經濟系那一年**沒有事件要走進社科院室內**（都是 2D）；缺的是 2D 背景（水餃店、祐廷家樓下夜景、公館街景、總圖門口夜景、行政大樓…；使用者說生成圖先空著）。AA-C AA_273（d5a64cca）說要建一樓大廳——兩邊結論相反，已問 AA-C 是哪個事件要走進去（沒有就不建）。
     - 測試：nav_us_unit.js、exch_min_unit.js ALL PASS；真實流程 flow_us_exchange.py（舊版本）ALL PASS，最終版跑中。
   - 接著：C 棟合租戶共用廚房（US2，新建室內，等 BB-C 補格局）→ 社區裡 C 棟、會所門口的互動點。
   - 21:4x～22:4x 更新：
     - AA-C 回覆：經濟系那一年**沒有**事件要走進社科院室內 → SCN-V0-01 不建（和 BB_216 一致）。BB_216 缺的 2D 背景等使用者決定生成圖的做法。
     - BB-C BB_217（a1de1b90）給 US2 廚房的格局 → 新區域 `us_shared`（C 棟 208，三人合租）：配置 `src/data/us_shared_layout.js`（從單人戶轉出來）、模型用同一支 `us_apartment.py`（加了 `--layout/--const/--root/--out`，**當單位模板**：之後別的單位照這個做）→ `us_shared.glb`。社區 C 棟樓梯口「上樓（C 棟 208）」。US2 的道具 `EVENT_US2` 平常藏著，`GAME.E.zone.us2(true)` 打開。
     - 遊戲內截圖自己抓到四個問題、已修：門牌沒有字（UV）、輪值表像亂碼（改英文字）、在屋裡時鏡頭被南牆擋住（南牆改成玩家在屋裡才淡出）、平台外面一片橘紅（景放三面＋天空挖空、照時段變色）。單人戶 us_apartment 也一起受惠。
     - LAWWW-C 的開發分支已經到 a4c42004（加了 `tests/flow_exch_min.py`）：patch 改對 a4c42004、在那上面重跑測試。

### ⛔ 使用者 2026-10-17 15:4x UTC 直接給 LAWWW2-C（P0）：「我真的要去睡了，接下來就交給你囉 10 小時喔」
- 理解：使用者睡覺，LAWWW2-C 自主工作約 10 小時（到 2026-10-18 01:4x UTC 左右）；照既有規則：不發布、不碰 main、場景美術 READY_FOR_ART_REVIEW 等使用者看、人物等 BB-C 驗收。
- 佇列：①BB-C／LAWWW-C 的回覆隨到隨處理 → ②ART-V0-DORM（經濟系那年的宿舍：房號牌、窗景、阿勳那一側）→ ③批 4 場景（Y34 宿舍、V3／V4／V5 房間、畢業典禮）→ ④家豪的美食地圖筆記本 → ⑤戲院、咖哩店背景精修。
- 使用者醒來時：整理一份「做了什麼、等使用者決定什麼」的清單（這一節下面）。

### ⛔ 使用者 2026-10-17 11:xx UTC 直接給 LAWWW2-C（P0）
1. 「模擬法庭做的東西，你可以留給可能某一堂課需要去法院旁聽，你就做成真的法院」（AA-C 同時收到：大四下「法律專題研究」第 6 週，全班去地方法院旁聽刑事審理，AA_252）。
   - 處理：`court_props.py` 改成地方法院刑事法庭道具組 → `assets/models/env/second_ai/court_props.glb`；`bg_courthouse.py` 兩張 2D 底圖（`court_gallery` 法庭旁聽席、`court_corridor` 法院走廊）。
   - 席位用公開資料（從旁聽席看：檢察官右、辯護人＋被告左，各法院不一定；書記官、通譯在法檯前低處；應訊台在中間；欄杆）；沒有法槌、國徽、法院名、案號。
   - AA-C、LAWWW-C 說「等使用者給參考圖」；使用者直接叫我做，所以先做 PROPOSAL，使用者給照片再照照片改。
   - 公館機車行背景：AA-C 確認只有模 2 用 → 已刪（`89c856f8`）。
2. 「你可以參考日劇的男女主角的髮型嗎」
   - 理解：路人的頭髮參考日劇常見的髮型種類（不照真實演員）；穿搭不動；主要角色照 2D 立繪不動（使用者要改主要角色再說）。
   - 第四批（`1b924dd4`）照常給 LAWWW-C 整合，下一版先有男女各 20 種；日劇髮型做好後當第五批換上。
   - 產生器加了選項：女生 `bang`（air 空氣瀏海／side 斜瀏海／center 中分無瀏海／heavy 厚瀏海）、`flip`（外ハネ）、`wave`（ゆる巻き）；男生 `wave`（微捲燙）＋用 `tip`、`curl` 調出中分（センターパート）、蘑菇頭（マッシュ）。
   - 試做：nf6（外翻鮑伯＋空氣瀏海）、nf5（中分無瀏海＋大波浪）、nf7（斜瀏海＋小外翻）、nm10（中分）、nm14（中分＋微捲）、nm5（蘑菇頭）。`NPC_HAIR` 環境變數蓋掉頭髮參數（npc.py），不改 VARIANTS。
   - 12:xx 進度：試做通過，40 人的樣式表 `JP_STYLE`（npc.py）；33 人重建中（三條佇列＋重做 nf5／nf9／nf15）；男生 7 個清爽短髮不變（nm1、4、6、7、13、16、19）。
   - 順便修好的舊問題：長髮兩側肩膀上一條條發亮的細線（背後散開 3 cm → 1 cm、前側長髮推出衣服後再收左右、正側面長髮只到耳下）。
   - 自己退件：女生中分第一版（額頭上一排梳齒）、第三版（蓋住眼睛）；nf9 分線偏 −14° 時臉旁髮蓋眼睛 → 中分的人分線歸零。
   - 已知小問題：男生太陽穴旁偶爾一兩小塊髮尾的碎片（貼圖的髮尖斜看；之前的版本就有）。
   - ✅ 交件 `45fa5907`（12:4x UTC）：33 個 VRM 換新（同檔名）；對照表、遊戲渲染器抽查 4 人、退件紀錄在 `char_review/npc_crowd/README.md` 第五批；已通知 LAWWW-C（等整合 ACK）。
3. 法院（BG-24）交付 `ee91df8f`：`assets/bg/court_gallery.webp`、`court_corridor.webp`（PROPOSAL）；已通知 AA-C、LAWWW-C。
4. 13:xx 進度（批 1～3）：
   - AA185 交件 `23456747`：`video_far_jp.webp`、`old_school_playground.webp`（AA-C 13:01：春假第一站改市場，老國小目前沒排到戲，留著）。
   - 沛珊第十版 `fe8d4ee0` 交 BB-C（頭髮照 BB-C v5 四點；領口側頸點低 2.2 cm、後領低 1.2 cm＝「像連帽衫」的真正原因）；等 BB-C 回覆。還沒做：肩膀亮縫、坐姿長裙、白鞋頭、眼鏡近照、晚上照片。
   - 經濟系（BB_201）：`vrm_finish2.py` 加 `VRM_REST`（把微笑烘進基本臉）；三人的臉參數分開（韋綸 v8、唐睿 v7、家豪 v6 建置中）。
     之後：韋綸短袖連帽風衣＋安全帽、唐睿 polo 領＋便利貼、家豪薄背心、魏教授年紀（npc.py 的 pwei：eye_close 0.22 是睏的原因）、四人並排＋坐下＋經原教室遠景。
5. 14:xx 進度：
   - 沛珊：第十四版頭髮 BB-C **通過**；上衣第十六版在驗（領口立起來的兩個原因：肩膀貼斜方肌的曲線、T 字姿勢的肩膀太高 → SHOULDER_SAG）。上衣過了請 LAWWW-C 拍遊戲內截圖（眼鏡、白天、晚上），BB-C 才標 ART_APPROVED。
   - 經濟系：BB-C 臉型方向**對**；表情一輪（嘴窄、眉毛分開）在驗；衣服第一輪建置中（韋綸寬短袖、唐睿 POLO 領＋口袋便利貼、家豪薄背心）。
   - 魏教授第四版在驗（灰白、髮際線往後、額頭露出、上身寬、稍駝）；眼鏡請 LAWWW-C 決定。
   - h01_clothes 新選項（預設不變）：NECK_GAP、SHOULDER_SKIN、SLEEVE_IN、NECK_RIB_L／T、NECK_FOLD、DRAPE、SHOULDER_SAG；h01_face：BROW_LEN_D、BROW_TAIL；vrm_finish2：VRM_REST；npc.py：torso、stoop；npc_hair_m：recede。
   - 還沒做：韋綸的安全帽（後背包側邊的配件 GLB）、家豪的美食地圖筆記本、四人並排＋坐下照、經原教室遠景（LAWWW-C）。
6. 14:2x 進度（最新）：
   - 經濟系第四輪＋魏教授第六版交 BB-C（`03179efb`，DELIVERED，等驗收）：
     - 韋綸 v12：短袖連帽風衣、剪短露耳、太陽穴淡色修好（`weilun_hair.py` 的 `side_taper`）、腿的肌肉；
     - 唐睿 v11：polo＋貼袋便利貼、頭髮外形交給髮殼（不再飛出黑線）；瀏海尖端還沒變成「捲」；
     - 家豪 v10：薄背心、領口滾邊、`Fcl_MTH_Joy` 0.35；
     - 魏教授 v6：短髮兩側貼頭、灰白只在兩鬢髮尾（`npc_hair_m.py` 的 `side_taper`、`cardG` 漸層）。
   - 新配件 GLB（交 LAWWW-C 整合，DELIVERED）：
     - 魏教授細框眼鏡 `glasses_wei.glb`（`glasses_zhiruo.py --style wei`；芷若的原檔重建後逐位元組相同）；
     - 韋綸安全帽 `helmet_bike.glb`（`helmet_bike.py`）＋片段 `patches/props_helmet_weilun.js`。
   - 工具：`char_lookdev.py` 加 `--js`（預覽還沒整合的配件 patch）、`--asset` 的檔案在本機就直接送出。
   - 沛珊上衣：
     - 第十七版收窄後手放下來胸口穿出皮膚 → 自己退件；
     - 第十九版胸口修好（`conform_under` inset 8 mm）；
     - 第二十版建置中：背上靠肩膀的兩點淡色（`pull_shoulders`）。
   - 下一步：沛珊第二十版交 BB-C → 等 BB-C 回覆經濟系 → 唐睿瀏海的捲 → 家豪筆記本（選做）→ 批 4 場景（Y34 宿舍）。
7. 15:1x 進度（最新）：
   - BB-C 驗收：
     - 韋綸 v12、家豪 v10、魏教授 v6（遠景）、沛珊第二十版：**模型通過**；
     - LAWWW-C 整合中（ACK）：拍遊戲內截圖（白天、晚上；魏教授在經原教室遠景＋眼鏡；沛珊戴眼鏡、站姿＋坐姿）。BB-C 看過才標 ART_APPROVED。
   - 沛珊第二十六版交 LAWWW-C（`552185d9`）：BB-C 5-4 兩個必修。
     - 白點：洋紅背景確認是皮膚；正面、45°、背面右邊修好，背面左邊還剩一條細的；
     - 側頸稜線：領口離脖子 1.1 cm、側頸點低 6 mm，肩上還有淡折線。
   - 唐睿：
     - polo v15 通過；
     - 頭髮 v19 交 BB-C（`a79b88cd`，等驗收）：瀏海短 2 cm、中間往上翻、大小不一、深咖啡亮面、太陽穴的縫。
   - 工具：`char_lookdev.py --bg ff00ff`（洋紅背景：分得出破洞和皮膚）、`--js`、`--asset` 本機檔。
   - 下一步：等 BB-C 回覆唐睿 → 家豪美食地圖筆記本（選做）→ 批 4 場景（Y34 宿舍）。
8. 15:4x 進度（最新）：
   - 經濟系四人＋沛珊全部「模型通過」：
     - 唐睿 v19（BB_201 第 11 節）→ 必修髮色 → v20；韋綸跟著改 v13；
     - LAWWW-C 已接進遊戲（`1efedd4f`，ACK＋ACTIONED），正在拍遊戲內截圖給 BB-C。
   - ART-17 最後兩張缺圖的 2D 背景交付（`0100994c`，READY_FOR_ART_REVIEW，等 LAWWW-C 填 S.BG、等使用者看）：
     - BG-19 `gongguan_cinema`（`bg_cinema.py`）；
     - BG-14 `yongkang_curry`（`bg_curry.py`）。
   - 下一步：等 BB-C 看遊戲內截圖（可能有小修）→ ART-V0-DORM（經濟系那年宿舍的房號牌、窗景、阿勳那一側）→ 家豪的美食地圖筆記本（選做）。
9. 17:2x～18:3x 進度（使用者睡覺後的自主工作）：
   - ART-V0-DORM：已經做完（`dorm_room412` 窗景、412 的擺法在之前的批次），不用再做。
   - 宿舍大二～大四的窗景：
     - 第一次交 `393eda85`（112／218／105）照的是較舊的 `AA_183`；LAWWW-C 18:1x 轉達 `AA_208` 第 7、8 節（大二 **312** 三樓「看得到另一邊的樹」、大三 **507** 五樓「樹梢和遠一點的屋頂」、大四 **409** 四樓「介於中間」）→ 112／218／105 作廢，改拍 312／507／409（批 4 原本就寫 507／409，是我看錯來源）。
     - LAWWW-C 已經把 218、105 接進 `7af91062`：交新的三張時請它換掉。
     - 三間都朝宿舍的背面（「另一邊」；203、412 朝正面的舟山路）：背面 23 m 外是一排樟樹（z 99），再後面是校外的公寓；每間對準一棵樹、依樓層算俯角（三樓樹冠＋樹幹、四樓介於中間、五樓樹梢）。
     - 宿舍房間的東西也一起做（SCN-V3-01／V4-01／V5-01）：`dorm_room4.glb` 加 Y312_／Y507_／Y409_ 十二組；遊戲端要改 `DORM_SETS`、`dormSetKey`、`dormView`（patch 交 LAWWW-C）。
   - **ART-NPC-HAIR-STREAK 修好**（`24923842`，MODEL_READY，DELIVERED 給 LAWWW-C）：
     - 博雅 101 頭髮黑白碎片的同學＝`seated_figures.glb`（講堂替身），第一版 UV 碎成幾千個小點；
     - 第二版用現在的路人 `bl_npc`（12 位）、外殼＋烤色，遊戲端不用改；
     - 說明與修改前後：`test_shots/seated_figures_v2/README.md`。
   - 工具：`glb_share_geometry.py` 加資料相同的 accessor 合併、`--qnormals`（法線 8 位元）；`uvpack.pack` 加 `weight`；`char_lookdev.py` 加 `--views`、`--vdef`。
   - ✅ 宿舍大二～大四交件 `4fa4a1e2`（窗景＋十二組擺設＋patch）→ LAWWW-C **已整合 `c1931118`**（宿舍單元測試 28 支通過、瀏覽器下一批）；112／218／105 的照片已刪。
   - ✅ 大二房間拆箱的物件 `dorm_y2_items.glb` 搬到四人房 L2 → 交 LAWWW-C（`899f9bcd`，DELIVERED）。
   - 下一步：畢業典禮（SCN-V5-02）→ 家豪筆記本（選做）→ 戲院、咖哩店精修。
10. 19:3x～20:1x 進度：
   - ✅ BG-25 畢業典禮背景 `ntu_gym_graduation.webp`（`60322c02`，READY_FOR_ART_REVIEW，交 LAWWW-C）：
     - 開學典禮同一個場景、同一個鏡頭，`bg_gym_ceremony.py --grad`：背板「畢業典禮」、鳳凰花、學士服＋方帽＋V 形披肩、上層看台家長；
     - 法律學院的典禮（霖澤館一樓大禮堂）沒做：霖澤館室內沒有大禮堂，請 LAWWW-C 排。
   - ✅ 家豪「公館美食地圖」筆記本：第一版 `0621bea6` → BB-C 退件三點 → 第二版 `0e191286`（A6、手寫標籤、**掛左前臂**）→ **BB-C 配件通過**（5d3983e3），交 LAWWW-C 接；遊戲內截圖看過才標 ART_APPROVED。
   - ✅ 品妤的工程計算機、黑色保溫瓶：第一版 `91ca1bca` → 掛前臂 `977deaf7` → BB-C 第 2 點 → 第二版 `2ef1ca4b`（平常只拿保溫瓶、手指勾提環）→ **BB-C 配件通過**（f331e153）。
     - BB-C 小建議（不擋）：右手食指、中指彎一點更像勾著——props 目前不能單獨改手勢，照現在。
   - 進行中：品妤第六版（袖子蓋到手背，BB-C 第 3 點）：`pinyu_clothes.py` SLEEVE_LEN 1.03 → 1.12，建置中。
   - 配件掛法的新做法（記在 ART_SOP 方法登記之前先寫這裡）：手拿的東西掛**前臂**、載入時找前臂底下的手骨頭算到手掌；掛在手上會跟著走路動畫的手腕轉。
   - 下一步：品妤第六版交 BB-C → 戲院、咖哩店精修 → 其他（nf7 長髮的橫縫、家豪 Joy 表情、沛珊裙子和手 ART-PS-SKIRT-HAND）。
11. 20:1x～ 進度：
   - 品妤第六版：LAWWW-C 已接 v6＋保溫瓶＋家豪筆記本（`161bd51e`）；BB-C（25db9a59）袖子通過，**要改耳朵**：look_face_q45 太大、顏色和臉不一樣 → 縮 15～20%、膚色對齊臉。
     - 第七版：新的階段 `pinyu_ears.py`（`pinyu.py --from-blend face.blend --stages ears,clothes,hair`）：耳朵是 Face 網格裡獨立的島，耳根不動、露在頭外的耳廓縮 0.82；耳朵的貼圖換成頭側面的膚色、只留一點明暗。
     - 第一次整個耳朵一起縮：上耳根露出一道暗紅色的縫（頭的網格在耳朵接的地方有開口）→ 改成耳根不動。
     - LAWWW-C：遊戲內截圖等 v7 的 SHA 換檔後，家豪、品妤一起拍給 BB-C。
   - 戲院、咖哩店第五版精修（同檔名換檔）：戲院（海報插圖、售票亭裡的東西、舊痕跡）；咖哩店（後牆開門洞、布簾後面一個小廚房、窗外的街照真的比例＋店裡的細節）。
     - WIP（檢查點）：戲院的圖已換；售票亭的電風扇（原本白色圓柱）、椅背（原本紅方塊）腳本改了、圖還沒重算；咖哩店最終圖算圖中。
   - BG-25 README：法律學院典禮照 LAWWW-C 沿用 `linze_auditorium`。

### 📋 分批順序（LAWWW2-C 2026-10-17 10:4x；使用者 10:4x 經 LAWWW-C：「各自審核每一批要做什麼、排出順序，手上沒事就先做下一批」）
D81 遊戲出現順序：v0～v2 先，美國篇是第二條線。總表：`tools/handoff/check_handoff.py queue --owner LAWWW2`（72 項）。

| 批 | 內容 | 依賴 | 狀態 |
|---|---|---|---|
| 1 | **ART-NPC-40 路人男女各 20**（P0，下一版發布）：nm10／12／14／15／20 的黑色翅膀修正 → 交第四份 manifest | 無 | ✅ 第四批 `1b924dd4`（LAWWW-C 已整合 `ac192c5c`）；✅ 日劇髮型第五批 `45fa5907`（等 LAWWW-C 整合） |
| 1 | **沛珊款式**（ART-05，D59 BB-C 驗收）：髮型 → 領口、上衣（細羅紋、紮進裙頭）→ 長裙（不像燈罩）、坐姿 → 眼鏡近照 → 白鞋頭 | BB-C 驗收 | 進行中（髮型第二版建置中） |
| 2 | **經濟系人物**（v0）：BB_201 退件（四張臉一樣、待機臉太悶、上衣像連帽衫）→ 臉分開＋待機笑（建置中）→ 韋綸風衣＋安全帽、唐睿 polo＋便利貼、家豪薄背心、魏教授年紀；阿勳 v7、品妤 v6 | BB-C 驗收 | 進行中 |
| 3 | **2D 背景**：✅ BG-24 法院兩張（`ee91df8f`，PROPOSAL）；AA185（老國小柱子黑方塊已修 → 12:5x 重算中、日本房間重算中 → 交件）→ ART-17 其他缺圖 BG09／10／12／14／19（照最早出現） | 無 | 待做 |
| 4 | **場景**：ART-DORM-Y34（507／409 房號、窗景）、SCN-V3-01／V4-01／V5-01 房間、SCN-V5-02 畢業典禮。~~SCN-V3-03 模擬法庭~~：使用者 10:5x 刪除；11:xx 改成**真的地方法院**（法院旁聽，AA_252）→ 道具組改法庭、2D 底圖兩張試算中；機車行背景已刪 | — | 待做 |
| 5 | **美國篇（第二條線）**：SCN-US-02 第二階段（Sample Gates、石灰岩系館；等使用者照片）、VAC 美術 | 使用者照片 | 等素材 |
| 暫停 | 溫州街（ART-VSLICE、ART-WZ0）：使用者 05:0x「溫州街修改也暫停」 | — | 暫停 |

- 等算圖、匯出時：做下一批不相依的（例：建模跑的時候寫背景腳本、整理交件）。
- 派給 AA-C：SCN-V3-03 模擬法庭的道具清單＋實景查證（台灣大學模擬法庭的擺法）。
  - 規則：D77 虛構名稱、不放校徽和真實標誌；交 Markdown 到自己的分支。
- 派給 BB-C：角色驗收（D59：沛珊、經濟系人物）。路人不派（使用者 10:3x）。

### ⛔ 使用者 2026-10-17 08:4x～08:5x UTC 直接給 LAWWW2-C（P0，最新）：路人
1. 「臺大不要再有這麼鮮艷紅色的衣服上衣的女生，而且還有很多顆超醜的」
2. 「長得很像的路人真的太多了，很誇張，你不能只有這幾種」
- **原因（LAWWW2-C 查的）**：
  - 預設（沒有 `?npcnew`）時，無名路人只用 `char.npc_f1／f2`（男 `m1／m2`）兩個 VRoid 樣本臉，換 5 種衣服顏色。
  - `src/story3d.js` 的 `extraSpec` 女生第 5 套 `['tee','#8c3b47']` 換色後在遊戲裡是鮮紅色，每 5 個女路人就有 1 個。
  - 遊戲內前後對照：`scratchpad` 截圖，女路人 extraSpec(0..18) 排一排；改成 `#9aa392` 以後紅色消失。
- **處理**：
  - LAWWW-C（他的檔案）：①紅色那套換成灰綠 `#9aa392`；②新路人底模（`bl_npc_nf1–4／nm1–4`）預設打開；③無名路人不再用 f1／f2／m1／m2。
    - 08:5x 已傳，**等 ACK**。
  - LAWWW2-C：第二批路人底模 `nf5–nf8`、`nm5–nm8`（`tools/blender/char_second/npc.py`，樣本、臉、髮長髮色、身高、穿搭都不同；不用鮮紅）。
    - 2026-10-17 08:58 開始建，做好一批交一批。
    - 之後再做第三批。
  - `npc_hair_f／m` 頭頂的洞補起來（`vs` 到 1.0）；新路人建好後跑 `tools/char_strip_hair_matcap.py`。
- **郭沛珊（使用者 09:4x 回答）**：「沛珊一定要換，她走日系風」。
  - 3D 新配色（LAWWW2-C 提，使用者可以再改）：灰藍（サックスブルー）T 紮進米白長裙；低馬尾、深色圓框眼鏡、黑帆布鞋不變。
  - 分工：
    - `peishan_clothes.py` 改兩個顏色、重建 VRM（LAWWW2-C）。
    - `characters.js` 換色（LAWWW-C，下一版）。
    - 設定圖、2D 立繪（BB-C，D59）。
  - 已通知 LAWWW-C、BB-C，等 ACK。
  - 路人 nf20 的上衣從灰藍改成燕麥色，避免撞到沛珊。
- **後續指示**（同一段時間）：
  - 「路人數量要再加倍喔，而且請參考日劇穿搭」
  - 「男生女生各 20 種」
  - 「這個路人的修改是最優先工作，然後下一版發布就要有」
- **進度（09:4x）**：
  - LAWWW-C：已 ACK。紅色上衣改好（31ac6a2d）；分批輪替載入池 cedb64dc（開場不預載，每區域 4 女＋4 男，路人數量 ×2）。發布最快 3–4 小時後。
  - LAWWW2-C：
    - 第二批 nf5–8／nm5–8＋nf4、nm3 低彩度重建，已交（9442e59b；manifest 條目 b1680957）。
    - 日劇穿搭 nf9–20／nm9–20 建模中：`npc_layered.py`，敞開的外套＋T 恤、A 字長裙／中長裙／及膝裙。
    - 交件：`tools/blender/char_second/npc_manifest.py` 產生 manifest 條目。
- **使用者 10:3x**：「路人不要再修改了，路人不用聽他們的意見，你自己決定」「為什麼路人你要問他們的意見啊，你不是美術的總執行嗎」。
  - 規則：路人由 LAWWW2 決定，AA、BB 的意見不採用。
  - 路人定案：只交 nm10／12／14／15／20 的「黑色翅膀」修正（髮尾、種子），其他不再改。BB-C 10:28 的路人意見（nf5 改裙、nm7 加外套、上衣收窄、nf4 髮色）**不做**。
- **沛珊**：照 BB-C 驗收（bd659a4d；角色是 D59 的範圍）修款式：髮型 → 領口、上衣 → 裙子、坐姿 → 眼鏡近照 → 小問題。
- **暫停**：SCN-V3-03 模擬法庭道具（只做了需求查詢，沒有檔案）。
- **AA185 背景**：四張都出圖了（機車行、老國小、日本房間、美國公寓）。日本房間要重出一次（窗外前面的屋頂把亮著的窗擋光了），排在路人之後。

### ⛔ 使用者 2026-10-17 05:0x 直接給 LAWWW2-C（P0，取代 04:5x 的排序）：「修改人物的事情暫停 溫州街修改也暫停 還沒做好的東西趕快做 尤其是經濟系的東西 最後接著做美國的東西 日本的東西……你要記住你的標準 你的美術標準要是參考得獎的遊戲」
- **暫停（保留成果、不刪）**：
  - 人物：ART-CH-WEILUN（第二版已交 BB-C，BB-C 04:57 回「要改」八項，見下）、ART-CH-TANGRUI（第三版建好、lookdev 拍了，沒交）、ART-CH-JIAHAO（第一版建好、第二版帽子腳本 af52e330 沒建完）、ART-CH-XUN（腳本 01a81fe3，第一版沒建完）、ART-CH-WEI、ART-13、ART-CH-PINYU。05:0x 停掉了正在跑的建置。
  - 溫州街：ART-VSLICE、ART-WZ0、BUG-WZFLICKER-2、ART-BALCONY-POTS。
  - 判讀：經濟系的人物也算「人物」，一起暫停；已在對話裡請使用者確認（使用者說要繼續就恢復）。
- **新排序**：①經濟系的場景、背景（SCN-V0-01 經濟系系館室內等）→ ②美國篇（SCN-US-01／02／03；季節細節等 AA_213）→ ③日本篇。標準：ART_SOP 八項、得獎遊戲水準（不要方塊感、不要廉價拼接）。
- **BB-C 04:57 對韋綸第二版的驗收（要改，人物恢復時照做）**：①膚色調深偏暖棕（小麥色，臉腿一致）②臉：眼睛細長、單眼皮感、虹膜小，眉毛平直壓低，下顎臉頰瘦硬，脖子不要細長③頭髮：整顆蓬亂短碎髮、兩側後腦蓋住（現在頭頂一撮像鳳梨、兩側薄），後腦白色一塊要修④外套：短袖（到上臂一半）＋帽子＋直下擺有抽繩，白色拼接在肩膀到袖子外側和兩側⑤短褲膝上約 5 cm、合身、側邊細紅線⑥小腿要有肌肉⑦襪子背面腳跟深色斑點修掉⑧左手黑色手錶（擦傷、安全帽之後）。沒問題：橘 T、配色、灰慢跑鞋、白襪、後背包、身高。

### ⚠ 使用者 2026-10-17 04:5x 直接給 LAWWW2-C：「你目前待辦事項還有什麼 應該先做更大的項目」→ 排序（照 D81 玩家先遇到的、大的先做）
1. **v0 經濟系 3D 人物**：ART-CH-WEILUN（建置中，腳本 d7998f12）→ ART-CH-TANGRUI → ART-CH-JIAHAO → ART-CH-WEI；阿勳 ART-CH-XUN 如果確認是 412 室友（Y0S1），併進這一批。
2. **SCN-V0-01 經濟系系館室內**：已請 LAWWW-C 轉問 AA-C 各房間的劇情用途（D79），回了就排在人物之後。
3. **ART-17 剩下的 2D 背景**（BG09／10／12／14／19、AA185）。
4. **ART-VSLICE＋ART-WZ0**（溫州街 Café 前黃昏商業水準、舊店面翻修）。
5. **ART-13、ART-CH-XUN、ART-CH-PINYU**（明軒、小語、阿勳、品妤）。
6. 大二以後的場景（SCN-V3-01／V3-03／V4-01／V5-01／V5-02、ART-DORM-Y34、VAC-A2）。
- 小件只收尾或等 CPU 時做：ART-04 黃金葛、ART-V0-DORM 412 窗景（都已交付 639f0188）、BUG-WZFLICKER-2、ART-BALCONY-POTS。
- **v0 人物進度（05:2x）**：
  - ART-CH-WEILUN 邱韋綸：**第二版已交 BB-C 驗收**（bbea64b9，`assets/models/char/second_ai/bl_econ_weilun.vrm`，`docs/art-rebuild/second_ai/char_review/weilun/`）。
  - ART-CH-TANGRUI 唐睿：第三版建置中（螺旋捲髮束 curl_card；POLO 衫）；第一、二版自己退件（直髮碗蓋頭）。下一步：遊戲渲染器 lookdev → 交 BB。
  - ART-CH-JIAHAO 宋家豪：第一版建置中、第二版帽子腳本已改（af52e330，帽冠貼頭、帽沿有厚度）。下一步：重建 → lookdev → 交 BB。
  - ART-CH-WEI 魏教授：還沒開工（講台老師，外觀等 AA-REQ-06）。
  - 人物建置的工作檔都在 scratchpad（`char/<名字>/face.blend`），可以從腳本重建；VRM 交件時才放進 repo。
- 環境：這個容器原本沒有 Blender；已照 TOOLCHAIN_AUDIT 裝 `/opt/blenv`（bpy 5.2.2）＋VRM Add-on（`644a13c`）＋`tools/vroid_src`（fetch_vroid_src.sh）。容器重開要重裝。

### LAWWW2 半成品核對（USER_DIRECTIVE_NEXT_DUTY_2026-10-17 第一節第 4 點；LAWWW2-C 04:3x，對 RULE_SOURCE `adoring-meitner` a39a6812 的 tasks.json）
| 半成品 | 任務 ID | 總表狀態 | 分支／SHA | 完成度、下一步 | 可以整合嗎 |
|---|---|---|---|---|---|
| 公館招牌第二批 | ART-GG-SIGNS-2 | 進行中 | funny／focused-cray `b75e50a5`（原始 `01984198`） | GLB＋patch 完成、ALL PASS 34；**LAWWW2-C 正在拍前後截圖**→ README → 交付 | 截圖、夜間目視完才交 |
| 機車 v2 | ART-SCOOTER2 | 已實作待整合（owner LAWWW） | `f5b7bdb3`（patch 定版） | LAWWW2 這邊已交；等 LAWWW git apply＋測試 | 可以（LAWWW 的工作） |
| 腳踏車 v2 後續 | ART-BIKES2-F | 待開工 | — | 老鐵馬、登山車比導航阻擋長 8 cm；鏽、褪色；車籃；淑女車分款 | 還沒做 |
| 祐廷臉試做 | ART-YUTING-FACETEST | 已實作待整合 | `8496bf9d`（模型 `23f25a0f`） | BB-B 驗收通過（4d3e2757）；**等使用者決定用不用** | 等使用者 |
| 黃金葛＋大二房間物件 | ART-04、SCN-V3-01 | 待開工 | WIP `8a1af723`（prop_pothos.glb S1～S4、dorm_y2_items.glb，約 60%） | 座標是舊雙人房，四人房要重新擺；還沒交付 | 不行（禁止直接整合） |
| 四人房 | ART-DORM-LOFT | 已整合待測試 | `a09ebf4d` | LAWWW-B 已整合；等使用者在遊戲裡看；8/29 室友在 QA-HANDOFF-B1（LAWWW） | 已整合 |
- 這六項的檔案都在 `claude/funny-albattani-iawshm`（＝本分支 `claude/focused-cray-c9uwvw` 的祖先），funny 分支照規則保留。

## 🔁 交班（最新）：2026-10-17 02:4x UTC｜帳號 B｜LAWWW2-B｜`session_01GV1WG3UeT2DhuDpxeWJsvD`｜正式交班
- **交班原因**：使用者 02:4x 說「現在正式換班」（D45、D49、D92／HV-10、D93）。
- **分支**：`claude/funny-albattani-iawshm`。
  - 成果的最後 SHA 是 `b75e50a5`；交班紀錄的 commit 在它之後。
  - 交班後**停止寫入**，直到使用者叫回來或下一個帳號照總入口第 4 節接班。
- **下一班 LAWWW2 的第一步**：接班十四步 → 讀「C. 正在做的工作」→ 完成 ART-GG-SIGNS-2（重拍前後截圖 → README → 交值班的 LAWWW）→ 照下面 📋 那一節的待辦清單由上往下。
- **LAWWW-B 已經在 02:41Z 交班**，所以這份紀錄只寫在 GitHub，沒有傳訊息給任何人。
- **逐職位核對（D93）**：`check_handoff.py roles --ref origin/claude/modest-rubin-2lyp7g` 結束碼 1。LAWWW2 有 2 項異常，**都是同一件 ART-GG-SIGNS-2【表外】**：總表還沒有這個 ID。
  - LAWWW-B 已經交班，我不能寫 `tasks.json`。下一班值班的 LAWWW 要把它補成任務，負責人 LAWWW2，狀態「進行中」，下一步照下面 C 類。
  - AA、BB 沒有異常。
  - **交接不算完整**，要等這一項補完。
- **另外兩項核對**（都在 RULE_SOURCE `claude/modest-rubin-2lyp7g` 的工作樹裡跑）：
  - `check`：異常 117 項，**全部是第 6 類**＝各分支上看起來像交付、但沒登記進 deliveries.json 的 commit。其中 16 個在 LAWWW2 分支（例：祐廷臉試做 `8496bf9d`、ART_SOP `69e4b181`、機車 v2 WIP、黃金葛 `8a1af723`）。登記是值班 LAWWW 的工作，我沒有改。
  - `duty verify`：OK（值班狀態一致；要先 fetch AA、BB 的分支，不然會誤報「SHA 找不到」）。

### A. 本班完成（帳號 B，2026-10-16 22:00 ～ 10-17 02:4x UTC）
整合狀態照 RULE_SOURCE 的 `docs/handoff/deliveries.json`。**都沒發布到 `main`**。場景的 `ART_APPROVED` 只有使用者能標，這裡都沒有標。

| 任務 ID | 成果 | SHA | 測試 | 整合 |
|---|---|---|---|---|
| ART-GYM-BG1 | 開學典禮背景 v3。使用者 00:3x：「開學典禮可以!!!」 | `a3529675` | ADV 直向、橫向截圖（手機模擬） | LAWWW-B 已登記背景（已整合待測試） |
| ART-GG-SIGNS | 公館六家招牌換成設計稿；GLB 重建成效能版 | `40b73c64` | 整合測試 ALL PASS 40 | LAWWW-B 已整合（已整合待測試） |
| ART-DORM-LOFT | 宿舍台大四人房：`dorm_room4.glb`＋layout。使用者 01:3x：「宿舍ok」 | `a09ebf4d` | 疊面 0／0；遊戲內截圖 | LAWWW-B DORM-LOFT-L 整合中 |
| ART-CAFE-FLOOR | Café 自流坪地板 | `ef689b67` | 截圖 | 已整合待測試 |
| BUG-COPLANAR-DEV | 萬才館外觀、霖澤館外觀 | `eb3a3bad`、`2b78d35d` | `--check` 差 0 | 已整合待測試 |
| BUG-COPLANAR-DEV | 霖澤館室內 63 → 0；201 教室 11 → 0；萬才館室內 54 → 4；總圖大廳 129 → 27；法圖 120 → 93（數字是「一定會閃」的面數） | `703f5231`、`209e7eca`、`9dc6727f`、`f1734e3f`、`6f10b1fe` | 遊戲內前後截圖（`test_shots/coplanar_dev/README.md`） | LAWWW-B 已收進開發分支；瀏覽器流程測試沒跑完，排在 QA-HANDOFF-B1 |
| BUG-WZFLICKER（第二輪）＋疊面第三、四輪 | 溫州街、農業陳列館、體育館主球場、公館、118 巷、Café | `6e5aa462`、`3ccc781e`、`f1d23fd4`、`fba3d65b`、`4faeec0b` | 掃描前後數字 | 已 ACK |
| QA-W1 座位點 | 小公園鞦韆、體育館長椅、看台 | `636a9661` | — | 給 LAWWW-B |

### B. 全部未完成工作
見下一節（📋 開頭的待辦清單；D93，每項都有任務 ID）。總表沒有的標【表外】，交給下一班值班的 LAWWW 補進 `tasks.json`。

### C. 交班時正在做的工作：**ART-GG-SIGNS-2【表外】** 公館其餘招牌全部換成設計稿
- **來源**：BB-B `2f5d4a3d`／`bc9e0f58`，公館招牌 S1～S17 全部通過，共 34 張 `_fit`。交付紀錄是 DL-BB-GG-SIGNS-S17（ACK，未整合）。
- **做完的部分（都已 push）**：
  - `sign_atlas.py`：貼圖集 2048×4096，36 張，高度用了 3878 px。另外有一張夜間發光貼圖 `gg_signs_atlas_emit.jpg`（燈箱整面亮、霓虹用遮罩、不亮的黑色）。
  - `wz_shopkit.py`：發光貼圖接到材質。
  - `wz_street.py`：公館的 1F 橫招牌 16 家、店的直立 6 塊、樓上住戶直立 8 塊、二樓大招牌 5 塊、屋頂看板 1 塊全部用貼圖集；GLB 裡不再有 `SIGN_FACE`、`VSIGN_FACE`。
  - SHA `01984198`（腳本、34 張 `_fit`、貼圖集）。
  - SHA `b75e50a5`：
    - `assets/models/env/second_ai/gongguan_shops.glb`（3.13 MB、405 物件）＋`.json`；
    - 整合測試 patch `docs/art-rebuild/second_ai/patches/gg_signs2_test.patch`，對開發分支 `fbda2ce9`，`git apply --check` 通過。
- **測試**：
  - 測試工作樹＝開發分支 `3d477ddb`＋第一批的 patch＋這次的 patch＋新 GLB，`tests/gongguan_glb_integration.py` **ALL PASS 34 項**。第一批是 40 項：拿掉 7 項 canvas 招牌貼圖集的檢查，加 1 項「沒有 `SIGN_FACE`／`VSIGN_FACE`」。
  - 效能：draw call 是 `?nobldg` 的 1.08～1.15 倍（上限 1.3 倍），三角形 21～26 萬（上限 42 萬）。
  - 夜間檢查改量 `wz_signs_lit` 的發光強度，20:30 比 11:00 亮：通過。
- **還沒做**：
  1. **前後截圖**：在 scratchpad 拍了 20 張，**沒有保存到 repo**，下一班重拍。
     - 修改前＝第一批的 GLB `40b73c64`；修改後＝`b75e50a5`。
     - 1280×720，藏起玩家和路人；11:00、21:00 各一張。
     - 鏡頭（公館區域座標）：
       - west：眼 (−42, 1.7, 8) → 看 (−58, 5.5, 19)；
       - mid：(−1, 1.7, 8) → (−13, 5.5, 19)；
       - g07：(24, 1.7, 6) → (12, 7, 19)；
       - east：(66, 1.7, 8) → (54, 5.5, 19)；
       - gate：(2, 1.7, −36) → (−4, 7, 19)。
     - 用 `tools/blender/env_second/shots/fast_shots.py`。
  2. `test_shots/gg_signs/README.md` 加第二批一節：哪幾塊換了、前後圖、夜間霓虹（二手唱片）。
  3. 交給值班的 LAWWW（GLB＋json＋patch），並通知 BB-B「S1～S17 已貼進遊戲模型」。
  4. 夜間的樣子只用數值檢查過，**沒有用眼睛看過截圖**（霓虹遮罩、燈箱亮度）。
- **重建指令**：`python3 tools/blender/env_second/sign_atlas.py --set gongguan`，然後 `wz_street.py --set gongguan`（參數見 `test_shots/gg_signs/README.md`）。

### D. 本班的使用者決策與規則
- 本班沒有新增 D／HV 編號。D90、D93 由 LAWWW-B 寫進規則檔。
- 使用者直接給 LAWWW2-B 的決定（原文都在這份交接檔各任務底下）：
  - 23:4x Café 地板：「地板真的太醜 跟桌子顏色太近」→ ART-CAFE-FLOOR。
  - 23:4x 開學典禮 v1 退件；v2：「頭髮為什麼看起來很灰」＋實際典禮照片；00:3x：「開學典禮可以!!!」。
  - 00:1x：美術全部給 LAWWW2，照遊戲出現順序做。00:2x：「代辦事項全部都要交接」（已寫進 D93）。
  - 01:0x：宿舍照片，上舖床、下面書桌、四組、進門右邊洗手間，「你改」；01:3x：「宿舍ok」。

### E. 跨 AI 協作
- **給 LAWWW-B**：
  - 上面 A 的交付全部 ACK；整合狀態見 A 表。
  - ART-GG-SIGNS-2 **還沒交付**（只有 WIP，LAWWW-B 交班時已經在 deliveries 註記）。
- **BB-B**：
  - S1～S17 招牌設計稿：ACK、使用中（C）。
  - 02:28 問機場兩張底圖要不要用我的 3D → 我回「交使用者生成」（DELIVERED；對方不需要再回）。原因：VAC-A2 沒開工、計畫裡沒有入境大廳。
- **AA-B**：
  - 宿舍室友照 AA_208（`65978067`）。
  - ART-METHOD6 等 AA-B 交驗證件。
- 沒有排程中的 send_later；沒有傳訊息給任何休班帳號。

### F. 測試與問題
- ART-GG-SIGNS-2：前後截圖沒保存、夜間沒用眼睛驗收。
- 本班所有成果**都沒有 iPhone 實機驗證**，截圖都是 Playwright 手機模擬。
- 室內疊面剩下：萬才館 4、總圖 27、法圖 93（多半是貼牆、貼地的接觸面，掃描工具不知道遮擋）；宿舍大廳約 10 m²（等四人房接進來）。
- 陽台盆栽從街上看不到（ART-BALCONY-POTS）。
- 只在 scratchpad 的東西：
  - 20 張前後截圖；
  - 測試工作樹 `lwwt4`（換過 GLB 的開發分支，用完即丟）；
  - 建置紀錄。
  - 都可以重做，沒有獨有的成果。

## 📋 LAWWW2 全部待辦（最新：2026-10-21 14:4x UTC，LAWWW2-C；下面「10-21 最新」那一小節優先，再下面是 10-17 以來的舊清單，留作紀錄；原標題：2026-10-17 02:4x 交班時更新；使用者 00:2x：「代辦事項全部都要交接」；順序＝遊戲出現順序，使用者 00:1x；D93）

### ▶▶ 10-22 14:0x 進度（帳號 A LAWWW2；最新，蓋過下面 12:5x 那一節）
- **LAWWW 13:0x 退回沛珊第二十九版**（開發分支 `620821e1`、USER_WANTS C27）：髮色、眉毛、唇色對，眼睛接近；瀏海兩側太短像安全帽、沒有臉旁長碎髮、臉白脖子紅像面具、三分之四側梳痕、馬尾太高太規整。v9.10.5 照舊第二十七版。
- **交件：沛珊第三十版**（`char_review/peishan_v30/`）：
  - 瀏海兩側長到顴骨、蓋住眉尾和鏡框外側上角；左邊（分線另一邊）加寬、蓋住太陽穴；髮尾 4 束晚一點才分開；越過鏡框的細碎髮。
  - 臉旁 3 綹長碎髮到下巴、下段散開；頭頂貼頭皮；梳痕淡；馬尾綁點 −44° → −48°（−52° 會翹出一根黑棍子）、鬆一點。
  - 膚色：身體的陰影不乘皮膚貼圖（Café 量：脖子 12° → 17°、臉 19～20°）；臉畫淡陰影、往暖米色靠。
  - 髮色、眉毛、眼睛、唇色不動（量過）。只換 VRM；眼鏡沿用第二十九版的檔（開發分支還是舊的，要一起換）。
  - 舊版開關 `PS_HAIR_V`／`PS_FACE_V`=29、=28 做回第二十九版、第二十八版，位元組相同（用這一版的腳本驗）。
  - 等 LAWWW 驗收（D100 第 6 點）。
- **下一步**：等 LAWWW 驗收；不通過照他標的改。之後回到巡場景第 5 區溫州街（`$SP/patrol5/shots.json`，開發分支換最新）。
- 只在本機的：試做的 VRM（`$SP/ps2/build/`、`final30c/`）、遊戲內原圖（`$SP/ps2/game/h_v29_*`、`h_v30f_*`、`sk*`）；都可以照 README 的指令重做。

### ▶▶ 10-22 12:5x 進度（帳號 A LAWWW2；被上面 14:0x 那一節取代）
- **⛔ 使用者 11:5x（P0）**：「你花這麼多時間改沛珊長裙結果她人還是很醜 臉啊頭髮啊 醜死了」（UA-LAWWW2-1022-02，status 進行中）。
  - 溫州街巡場景（第 5 區）暫停讓位，背景拍照已停（j59 一張都還沒拍）。
  - LAWWW 11:59 ACK：把 04:4x 的「沛珊通過」作廢、ART-ZR-PS-3D-1022 改回進行中；驗收格式：遊戲內臉部近景和參考圖並排、逐項對不對、Café／教室一般距離。
- **交件：沛珊第二十九版**（`char_review/peishan_v29/`）：中分八字瀏海、深灰棕髮色、眼睛（眼型 Close 0.06、放大、大亮點、上眼線）、眉毛、唇色、鼻樑淡陰影；眼鏡細的槍灰金屬框、半徑 23 mm。VRM、眼鏡、腳本 `f510b1b7`。
  - 我的逐項判斷：瀏海形狀對、質感還不到；髮色對；眼睛接近；眉毛對；唇色對。等 LAWWW 驗收（D100 第 6 點）。
- **下一步**：等 LAWWW 驗收沛珊；不通過就照他標的項目改。之後回到巡場景第 5 區溫州街（`$SP/patrol5/shots.json` 已寫好，開發分支要換最新）。
- 只在本機的：試做的 VRM（`$SP/ps2/build/`）、look-dev 圖、遊戲內原圖（`$SP/ps2/game/`）；都可以照 README 的指令重做。

### ▶▶ 10-22 11:4x 進度（帳號 A LAWWW2；被上面 12:5x 那一節取代）
- **LAWWW 10:57**：nm3 已整合、角色美術驗收通過（開發分支 `eece763b`）；outbox 改已驗收／ACTIONED（`c38d77e8`）。下一步照 LAWWW：巡場景第 4 區公館＋查 BB-C 的三角形 +15～19%。
- **crowd_far_lod 第三版**（PERF-CROWD-LOD-1021）：`patches/crowd_far_lod.diff` 對齊 `eece763b`（`character3d.js` 和 skirt_drive 同一行合在一起）＋nm3 遠距離版本重做；19 支測試 ALL PASS（j53）。patch、LOD 在 `583cf89d`，說明 `7ccab572`，outbox `eab38bf3`。等 LAWWW 在 v9.10.5 之後接。
- **巡場景第 4 區公館巡過一輪**（`ART_DIRECTOR_PATROL.md` 第 4 節；j51、j54 18 張，開發分支 `f9941cfd`）：
  - 15:00 人行道一排亮條（P2）→ **已交件**：七樓樓板（14 棟、+168 三角形、draw call 不變），`gongguan_shops.glb`＋`wz_street.py` 一行；說明 `test_shots/gg_shadow_cap_1022/`；GLB、腳本在 WIP `8de84f34`。
  - BB-C 的 +15～19%＝X86 第二階段 `0582af9f`（店面加高、`gongguan_far`），照設計，不用改。
  - j57：`gongguan_glb_integration` 在 `eece763b` 本來就 FAIL 1 項（導航格完全相同；正式模型多擋 95 格＝雜物腳印，測試期待過時），換 GLB 後同一個結果；交給 LAWWW。
- **下一步**：巡場景第 5 區溫州街（`ART_DIRECTOR_PATROL.md` 巡查順序）；有派工就先做派工。
- 不碰：ART-13、ART-CH-PINYU（使用者 10-17「修改人物的事情暫停」）。
- 只在本機的：截圖原檔（`$SP/patrol4/`、`$SP/ggcap/`）、探測用的 GLB；都可以照 repo 裡的腳本重做。

### ▶▶ 10-22 10:5x 進度（帳號 A LAWWW2；被上面 11:4x 那一節取代）
- **LAWWW 10:44 ACK＋已整合**：天花板第二版接進開發分支 `cf82803b`（8 GLB＋4 json＋7 腳本＋`ceiling_lights.diff`），DL-LAWWW2-5262e88a「已整合待測試」，放 v9.10.6、交 BB 瀏覽器看；outbox 已改已整合／ACTIONED。
- **交件（10:5x）**：ART-CEIL-LAWWW-ROOMS-1022 第二版（修正）`5262e88a`（GLB、腳本、patch 在 `ab5dd930`），outbox SHA `00977c03`。
  - 骨架、燈框、燈箱、吸頂日光燈照舊是方盒，整組 `WALL_`、`dir` 朝下（鏡頭在上面時藏起來，從下面看同一組三角形）；平的燈板單面。
  - 男宿大門鋁框、門把放進前牆 `WALL_`（巡場景第 3 區 P1）。
  - 說明：`test_shots/ceil_more_1022/`（j48／j48b／j49）。
- **巡場景第 3 區宿舍巡過一輪**（`ART_DIRECTOR_PATROL.md` 第 3 節）：大門 P1 已修；三項 P3 只記錄（LAWWW 同意不排）。
- **做中：ART-NPC-NM3-HAIR-1022**（LAWWW 09:56 派，P3；10:18 ACK）：
  - WIP `0e2a595c`：`npc_hair_m.py` 加五個選用參數（不給＝原本，舊參數重做位元組相同）、`npc.py` 的 nm3 第三版參數、第三版 VRM（臉、身體、衣服位元組相同，只有頭髮網格和頭髮貼圖不同）。
  - 遊戲內前後 j50（開發分支 `cc4528be`、男宿二樓走廊 20:24）在拍；README 草稿 `test_shots/npc_nm3_hair_1022/`。
- **下一步**：nm3 交件 → 巡場景第 4 區公館 → crowd_far_lod（v9.10.5 之後）。
- 不碰：ART-13、ART-CH-PINYU（使用者 10-17「修改人物的事情暫停」，等使用者或 LAWWW 派工；nm3 是 LAWWW 派的）。
- 只在本機的：截圖原檔（`$SP/grid4/`、`$SP/patrol3/`、`$SP/nm3/`）、nm3 試做的 VRM（`tools/vroid_wip/`，gitignore）、`clothes.blend`；都可以照 repo 裡的腳本重做。

### ▶▶ 10-22 09:3x 進度（帳號 A LAWWW2；被上面 10:5x 那一節取代）
- **LAWWW 08:34、09:00 兩則已讀、已 ACK**：
  - 118 巷第二版接進 `249ae526`，第三版（機場、大超市）接進 `2181fe4d`。
  - PS-SKIRT-LEG（第二十八版 VRM＋`skirt_drive.diff`）接進 `2181fe4d`，**角色美術 LAWWW 驗收通過**。
  - outbox 兩筆改成已整合／已驗收。
- **交件三件（`63d4a3e3`，outbox SHA `61435288`；09:3x 一則訊息通知 LAWWW，DELIVERED，還沒 ACK）**：
  - ART-CEIL-LAWWW-ROOMS-1022：
    - 四份 GLB＋腳本＋`ceiling_more.diff`（對 `2181fe4d` 的增量）。
    - 201 的 T 型骨架也改成只留底面：只改天花板時，整間教室蓋著白格子。
    - room_ceiling：開發分支的四份 FAIL 8 → ALL PASS。
    - 說明：`test_shots/ceil_more_1022/`。
  - #129 美國校園候車亭：
    - 屋頂淺灰烤漆；`SEE_MATS` 加 `us_campus`。
    - `us_campus_shelter.diff`＋`us_campus.glb`；測試 FAILED 3 → ALL PASS。
    - 說明：`test_shots/us_campus_shelter_1022/`。
  - LIC-GAPS-1017 第二次：
    - `licenses_gaps_1022.diff`：`dorm_room4.glb`、四張 Poly Haven（作者用 API 核對）、機車行道具組。
    - 取代 10-21 的 `lic_gaps_dorm_room4.diff`。
- **下一步**：
  1. 我的 GLB 天花板格子從上面看浮著白線（博雅、普通、總圖 3F、法圖一樓，P3）。
  2. 巡場景第 2 區法律系館。
- 不碰：ART-13、ART-CH-PINYU（使用者 10-17「修改人物的事情暫停」，等使用者或 LAWWW 派工）。
- 只在 scratchpad 的：截圖原檔（`$SP/lawc/shots/`）、試算的 GLB；都可以照 repo 裡的腳本、shot json 重做。

### ▶▶ 10-22 08:5x 進度（帳號 A LAWWW2；被上面 09:3x 那一節取代）
- **118 巷天花板＋鄰居店面、六個房間天花板：已交件**（`4af2ff35`；outbox 已交付／SENT；08:4x 一則訊息通知 LAWWW，DELIVERED，還沒 ACK）。README `test_shots/l118_arcade_1022/`：遊戲內前後（j35c、j36b）、其他 26 個室內的天花板盤點（j36c）。`l118_arcade.diff` 對 `b857600c` 乾淨。
  - 盤點結果：LAWWW 的 201 教室、男宿門廳、霖澤館二樓、萬才館二樓也是一大片（已告訴 LAWWW，要我改再派）；我的機場入境、美國大超市（#128，下一件）。
- **PERF-NPC-POOL-1022 重量完成**（`21d3d597`，`zone_enter_1021/README` 新的一節）：換上新路人那一格不見了；咖啡廳→溫州街（第二次）最長一格 手機 11.0→7.2 秒、電腦 12.3→9.2 秒。
- **PS-SKIRT-LEG（WIP，`2ae925f2` 存檔）**：
  - 10-21 那次只改權重的試做**左右腿接反**（+x 當成左邊；VRM 0.x 人物的左邊是 −x），「兩全不了」的結論不算數。
  - 做法：VRM 加輔助骨頭（節點 extras.drive）＋`character3d.js` 每一幀照兩條腿算（`patches/skirt_drive.diff`，約 15 行，D108：交 patch，不直接改）。前片中間＝「第三條腿」`skirt_F`／`_lo`（兩條腿的 slerp，偏向往前抬那條）；後片 `skirt_BL`／`BR`（`_lo`）原本的權重不動，**多的一份只在腿往後時才轉**（gate），坐下和原本完全一樣。
  - 工具：`tools/blender/char_second/peishan_skirt_bones.py`（numpy 改 glb）、量測 `tools/blender/char_second/skirt_vis.js`（Node，16 個角度 CPU 畫圖數露出的腿；分「穿過布料」和「從裙襬下看到」）。
  - 目前選的參數（`--back3 --kbumax 0.8 --kblmax 1.0`，$SP/skirt/v_k2.vrm）：上樓梯看得到膝蓋以上的格數 61/90 → 25/90、平均 87 → 7 像素；小腿 41 → 17；下樓梯小腿 39 → 24；走路小腿穿出後片 31 → 8；坐下 0、看得到裙子內側的量和原本一樣。
  - 排了 j40：char_motion 遊戲內前後（坐下、上樓梯）。正式 VRM 不換，交件時另給一份檔案。角色美術由 LAWWW 驗收（D100）。
- **美國重拍（#122）**：j38／j39 的讀檔帶 `stage: econ`，被「經濟系→法律系」的暑假回顧擋住（j38 11 張只有 2 張可用；j39 走到一半被換到宿舍）→ 改 `stage: law` 重排 j38b、j39b。
- 10-22 08:40 容器重啟：佇列停在 j38b，已重排（j38b → j40 → j39b）；監看重開。git 是乾淨的，成果都已 push。
- 只在 scratchpad 的：`$SP/skirt/`（試作 VRM、量測輸出、私人工作樹 `wt`）、截圖原檔；都可以照 repo 裡的腳本重做。

### ▶▶ 10-22 07:4x 進度（帳號 A LAWWW2；被上面 08:5x 那一節取代）
- **六件交件已整合**：LAWWW 06:46 開發分支 `f2336295`（7 份 patch、素材、腳本；Node 單元測試 468 支過；瀏覽器流程派 BB）。outbox 六筆改「已整合／ACTIONED」（`a1c86c44`）。LICENSES 五列 `d04223db` 已傳 SHA，LAWWW 接進 `7e5d3882`。
- **118 巷九間店＋六個房間的天花板（WIP，還沒交件）**：
  - 起因：118 巷天花板雙面、朝上，鏡頭在 3.21 m、天花板 3.2 m；雙指拉遠（室內最遠 6 m）、往上拖（俯角最大 1.05）就是一大片白（j34）。
  - 同一個寫法還在：日本宿舍房間（2.5 m，預設鏡頭 2.84 m 就在上面）、霖澤館 202／3F／4F、萬才館多功能教室、研討室 A（`jp_dorm`、`flat_classroom`、`linze_upper`、`wancai_seminar`）。
  - 進門時鏡頭在騎樓：門靠側牆的店，畫面一側是店外的空白（15～33%，兩側前角 37～41%）。
  - 改法：天花板（含廚房）單面朝下；店門外兩側貼 118 巷街景拍的鄰居店面（新 `tools/blender/env_second/lane118_neighbors.py`，18 張，透視、和店面平行、鏡頭平移），歸左右牆、`at`＝牆線；`patches/l118_arcade.diff`：`zones3d.js` attachRoomGLB 讀 `at`＋`tests/l118_arcade_unit.js`＋`tests/room_ceiling_unit.js`。
  - 測試：l118_arcade_unit 開發分支 774f49c7 FAIL 54 → 套 patch＋新 GLB ALL PASS；只換 GLB 不套 patch 鄰居店面擋人 6～9 個鏡頭位置（GLB 和 patch 要一起接）。room_ceiling_unit 開發分支 FAIL 30 → ALL PASS。
  - 檢查點：`4aeb5531`（118 巷）、`5e4ab029`（六個房間＋patch 第二版）。
  - 還沒有：j35 遊戲內前後（跑中）、j35b 在 809ea58b 上驗（devwt_tip 是稀疏工作目錄，room_ceiling／l118_shops 在那裡跑不準）、j36 六個房間前後＋其他室內「拉到最遠最陡」盤點、README。
- **fast_shots.py 修正**（`e2f297de`）：樓層照 `pos.lv`、高度用 `E.settleY`。j26 法學院晚上一樓「陷進地板」、201 教室門口「埋在台階裡」是截圖工具的問題（排序照區域，二樓那張之後的一樓沿用二樓；y＝0）；j26b 重拍確認中。
- **雙 AI**：LAWWW 07:00（us3d.js 三行 `4fb93ba4`，之後改 us3d 從那裡接）、07:19（user_asks 5 筆改「在遊戲裡」，已改 `c861de0e`）、07:24（PERF-NPC-POOL-1022 `e63ba5d2`：請重量「咖啡廳 → 溫州街（第二次）」，排 j37）。都不用回覆。
- j11（溫州街 24 張）：沒有新的 P1。
- 佇列：j35（跑中）→ j26b → j35b → j37（量時間，期間不要開 Blender）→ j36。

### ▶▶ 10-22 06:3x 進度（帳號 A LAWWW2；被上面 07:4x 那一節取代）
- **LAWWW 06:00**：v9.10.4 已發布（main `4a8d17f9`），開發分支 `27de6170`。不用回覆，沒有回。
- **男宿交誼廳交件** `e6512c87`（outbox `0a996226`，未派）：j25 遊戲內前後、5 支單元測試、flow_dorm_hall 27 項、reachability 32 個互動點 ALL PASS。
- **鏡頭遮擋盤點工具** `tools/blender/env_second/room_cam_audit.py`（`e86c5966`）：
  - 讀 GLB，照 followCam 算鏡頭，看人身上 12 個點被不會淡出的網格擋住多少。
  - 溫州街五家店：一盞 29.3%、半熟 11.4%、影印 5.3%、林家 4.4%、定食 8.6%。
  - 118 巷九間：天花板是雙面、3.2 m，算出來擋 40～56%；但 10-20 的遊戲截圖沒有被天花板擋住。原因還沒查清楚，排 j32 用遊戲截圖確認，**還不能說是問題**。
- **溫州街店家室內鏡頭遮擋**（`test_shots/wz_shops_cam_1022/`，WIP）：
  - 一盞：隔間當鏡頭牆＋正面那一排歸 `WALL_engawa`＋燈籠網點透空，29.3% → 2.4%。
  - 半熟：排煙罩歸後牆、吊燈網點透空，11.4% → 5.2%。
  - `patches/wz_shops_cam.diff`（疊在 `wz_shops2` 第四版上）、兩份 GLB `38c4b821`；單元測試修改前 12 FAIL、修改後 ALL PASS。
  - j30 遊戲內前後：一盞和室從只看得到腳變成看得到整個人。
- **WZ-SHOP-AA364-ART**：
  - 第三版（按鈕座位帶 `ap`）：j23c reachability ALL PASS。
  - 第四版（定食燈籠）：j30 單元測試 ALL PASS。
  - README 已更新（`1e78546c`）。
- **還沒交件、還沒通知**：WZ0、美國超市、交誼廳、AA364 第四版、店家鏡頭、118 巷 lift。等 j30 的 `seats_on_furniture`、j24b 出來，發一則訊息通知 LAWWW。
- 佇列：j30（seats 跑中）→ j24b → j32（118 巷天花板確認）→ j33（鏡頭在人前面：定食燈籠、半熟吊燈）→ j11 → j26。

### ▶▶ 10-22 05:5x 進度（帳號 A LAWWW2；被上面 06:3x 那一節取代）
- **LAWWW 已接（標已整合）**：
  - 芷若頭髮第九版 `0198f820` LAWWW 驗收通過，接進 `154c639e`；
  - 色調映射 Neutral 預設 `fdd9b3f5`，同一個 commit 接進；
  - 機場第二版＋美國路燈光圈 `93967011`，接進 `1c53b397`。
  - outbox、user_asks 已更新（`3e52fc59`）。開發分支最新 `c08889bf`。
- **美國超市鏡頭兩件交件** `b874f99a`（`test_shots/us_market_cam_1022/README.md`）：
  - j29 遊戲內前後：草原超市、亞洲超市晚上一進門，修改前門框擋人、修改後鏡頭在店裡；超市街站牌柱變網點。
  - 兩支單元測試在套好的工作目錄 ALL PASS。
  - outbox 未派。
- **WZ-SHOP-AA364-ART**：
  - j23b 瀏覽器 reachability 林家乾麵還是卡住。原因：`ap` 只寫進區域的座位表，「坐下」按鈕的座位是另一份。
  - **第三版**（按鈕的座位也帶 `ap`）：單元測試第二版 2 FAIL、第三版 ALL PASS；j23c 瀏覽器 reachability ALL PASS。
  - **第四版**（巷子裡定食和紙燈籠網點透空：配置 `seeThru`＋區域 `seeThru`）`8d1ff6b1`：第三版 3 FAIL、第四版 ALL PASS。
  - 遊戲內前後排在 j30。
- **半熟早午餐第一張桌子，鏡頭被排煙罩擋住**：
  - 排煙罩、開放層架、杯子、罐子掛在後牆上，原本不在後牆的組。
  - 改成歸後牆的組，後牆淡出時一起藏。重建 `wz_brunch_interior.glb`（三角形不變 17,958、節點 36→40）`8d1ff6b1`。
  - 這份 GLB 也帶著 `612028f6` 的椅子方向修正（開發分支還是舊的、椅子反的）。
  - 遊戲內前後排在 j30。
- **118 巷吧台高腳椅 lift**：
  - README `a86d21ce`；j24 前後截圖：修改前坐進凳子、修改後坐在凳面上。
  - 單元測試在 `c08889bf` 修改前 8 FAIL、修改後 ALL PASS。
  - `seats_on_furniture` 在 j24 沒跑起來（Playwright），排 j24b 用 pwwrap 重跑。
- **還沒交件、還沒通知的**：WZ0 `59dfa3a8`、美國超市 `b874f99a`、AA364 第四版、半熟 GLB、118 巷 lift。等 j30、j24b 出來，一則訊息通知 LAWWW。
- 六份 patch（`l118_bar_lift`、`dorm_lounge`、`wz0_prop_nav`、`wz_shops2`、`us_market_cam`、`us_ms_seethru`）在 `c08889bf` 上疊著套都乾淨。
- 佇列：j25（男宿交誼廳，跑中）→ j30 → j24b → j11 → j26。

### ▶▶ 10-22 05:3x 進度（帳號 A LAWWW2；被上面 05:5x 那一節取代）
- **ART-WZ0 交件** `59dfa3a8`（outbox `4ae4910d`）：j19d 重拍 12 張前後、`wz0_prop_nav.diff` 第二版瀏覽器回歸 ALL PASS；接法寫在 `test_shots/wz0_1021/README.md`。還沒通知 LAWWW（等 j29、j23b 一起發一則）。
- **美國巡場景 j14 的發現**（`ART_DIRECTOR_PATROL.md` 第 9 節）：
  - 兩間超市一進門鏡頭在店外（P1）→ `us_market_cam.diff`＋重建 `us_asian_market.glb`（`47eb0d5a`、`baf53ffd`）；
  - 超市街公車站牌柱擋鏡頭（P2）→ `us_ms_seethru.diff`（`887ad0e9`）；
  - 四個美國 patch（機場、路燈光圈、這兩個）對 `7e00ad05` 一起套、任何順序乾淨，美國 10 支單元測試 ALL PASS；
  - 遊戲內前後：佇列 j29（跑中）。
- **WZ-SHOP-AA364-ART**：j23 林家乾麵兩張椅子「坐下」走不到 → `wz_shops2.diff` 第二版（座位 `ap`）`a776dff1`；窗景 4 張；說明 `297e71bf`；瀏覽器重驗 j23b（`$SP/pwwrap.py` 補 Playwright 的 executable_path）。
- 佇列：j29（跑中）→ j23b → j24 → j25 → j11 → j26。
- 下一步：j29 出來 → 美國超市交件（README＋outbox）；j23b 過了 → AA364 交件；一則訊息通知 LAWWW（WZ0、美國兩件、AA364）。

### ▶▶ 10-22 05:1x 進度（帳號 A LAWWW2；被上面 05:3x 那一節取代）
- **角色美術驗收是 LAWWW（D100 第 6 點，使用者 10-17 23:5x；D59 作廢）**——我 04:4x 交件時誤寫「BB 照 D59」，已更正（651a1cee）。BB 照樣看、給意見（BB_221），但驗收以 LAWWW 為準。
- **P0 UA-LAWWW2-1022-01（林芷若、沛珊「好憨」）**：
  - 04:4x LAWWW 驗收：沛珊第二十七版 1598a47d 通過；芷若 888831c4 臉通過、頭髮退回（ART-ZR-HAIR-1022）。兩件已接進開發分支 `7e00ad05`（芷若改用 Blender 版當預設），v9.10.5 發布。BB_221 意見相同。
  - **05:1x 芷若頭髮第九版交件 `0198f820`**（`char_review/zhiruo_hair_1022/`）：分線改到人物的左邊（第八版左右做反）、及肩到肩下微捲（波峰照高度對齊）、頭頂與太陽穴有蓬度、深棕、額頭露出的形狀照參考圖。只換 `bl_heroine_02.vrm`（3.10 MB）。LAWWW、BB 已通知（DELIVERED），等 LAWWW 驗收。圖已傳給使用者。
  - `heroine_02.py` 加 `--from-blend`（只重做頭髮）、`p02_hair.py` 的 `HAIR_OVERRIDE` 試參數。
- **05:0x 交件**：
  - 機場第二版＋美國路燈光圈 `93967011`（outbox 4edb06b5，已通知 LAWWW）。
  - 色調映射 ART-POLISH 第 2 批 `fdd9b3f5`：21 個同鏡頭 A/B，美術總監決定建議改預設（`patches/tone_neutral_default.diff`），已通知 LAWWW。
- 佇列：j23（AA364 店面）跑中 → j24 → j25 → j11 → j26。j23 會在主工作目錄留下 `tools/shots/shop_views_depth.json` 的修改和 `assets/models/env/views/wz_lin_*`、`wz_teishoku_*`（ART WZ-SHOP-AA364 的窗景），看完結果才 commit。
- 還沒看的佇列結果：j17（美國 cross_summer_15 重拍）、j19c（WZ0 販賣機＋回歸）、j14（美國巡場景）。
- 下一步：看 j19c → 收 ART-WZ0 交件；看 j14、j17；j23～j26 出來一個看一個。

### ▶▶ 10-22 04:1x 進度（帳號 A LAWWW2；被上面 05:1x 那一節取代）
- **P0 使用者 04:0x「林芷若3d好憨 沛珊也是」（UA-LAWWW2-1022-01）**：兩人的人物凍結解除（使用者自己提的）；身分（名字、身高、髮型、服裝識別）照 BB 通過的參考圖不動。LAWWW、BB 已通知（DELIVERED）。
  - 現況（遊戲渲染器 j28，`$SP/charfix/now_sheet.webp`）：芷若預設＝10-10 的 `vroid_heroine_02.vrm`（動畫大圓眼、粉紅腮紅、小孩臉、直長髮）；Blender 版 `bl_heroine_02.vrm` 只在 `?blchar`（眼小、眼距寬、臉寬）；沛珊第二十六版（眼小、眼距寬、眉高、人中長、頭髮全往後梳額頭大）。
  - 量測（沛珊第二十六版，臉部模組 h01）：內眼角距離＝眼寬的 1.45 倍（一般人約 1 倍）、眼高／眼寬 0.40。
  - 做法：兩人的臉部腳本加 `FACE_OVERRIDE`（`1f0a9da7`），參數不改檔、一次改一樣、同鏡頭比（`$SP/charfix/ps_*`）。第一輪（眉、下半臉、眼、全部）：全部合起來內眼角 1.22 倍、眼高 14.2 mm，方向對但不夠；第二輪 v5、v6 做中（眼往中間 9.5／12 mm、放大、外眼角微揚、眉壓低、臉收窄 8～10%）。芷若改走 Blender 製作線（`tools/blender/char/heroine_02.py`＋`p02_face`），基準做中。
  - 定稿後：重建 VRM（vrm_finish）→ 遊戲渲染器臉正面／45°／側面＋走路坐下 → 送 BB 驗收（D59）→ 交 LAWWW 換檔（芷若要把 manifest 的預設換成 Blender 版）。
- 10-22 04:09 容器重啟：佇列（j28 做到一半）和 Blender 都被殺掉；04:11 重排（j28 重跑已完成），監看重開。機場 j15b 重啟前已完成（`$SP/airport/after3`，有鏡頭座標），還沒看。
- 佇列：j17 → j19c → j14 → j27 → j23 → j24 → j25 → j11 → j26。

### ▶▶ 10-22 03:5x 進度（帳號 A LAWWW2；被上面 04:1x 那一節取代）
- 開發分支 `c617b2e0`（v9.10.4 候選 `9cf16124`＋AA380 小語改名；沒有動到我的檔）。**手上 8 份還沒接的 patch 在 `c617b2e0` 上都 apply 乾淨**：`airport_cam_night`、`us_lamp_pools`、`wz_shops2`、`wz0_prop_nav`、`l118_bar_lift`、`dorm_lounge`、`crowd_far_lod`、`licenses_1022`（暫存 index 逐份檢查）。
- **機場（ART-VAC-AIRPORT-1021）**：j15 看完——15 入境出關、09 背牆、13／20 晚上修好；10、19 背光面一半；**04 正門門框沒透空＝第一版 patch 把 `seeThru` 寫在區域定義上**（宿舍、Café 同一個錯）。第二版 `f3c7e616`（寫在 `build()` 回傳的實體上＋單元測試多一項，第一版 FAIL、第二版 PASS）；README 補了 j15 的表。重拍 j15b 跑完才正式交件。
- **盤點（D99 第二項寒暑假）**：寒暑假的 3D 區域只有機場；台北的家、老家、出遊都是 2D 背景；`jp_hub` 是 2D 據點用的空區域。日本不在 D99 前三項。
- **ART-WZ7（總表寫待開工，其實三件已經在模型裡）**：外送保溫箱＋安全帽（林家乾麵門廊）、回收紙箱捆＋寶特瓶（日日便利門廊）是 LAWWW2-B 10-1x 擺進 `wenzhou_street.glb` 的（`wz_street.py` 833 行起；`test_shots/wz_perf/README.md` 第五輪之後），這次重建照樣在；傘桶、U 型鎖沒擺（三角形預算）。ART-WZ0 交件時一起寫，請 LAWWW 改總表。
- **ART-POLISH 第 2 批（全域光影，P1）開工**：`patches/tone_neutral.diff`（`engine3d.js` 3 行：`?tone=neutral`＝Khronos PBR Neutral、曝光 ×1.3；**預設照舊 ACES**）；換算 `test_shots/tone_1022/tone_curves.py`（×1.3 時 0.03～0.8 的灰平均和 ACES 一樣亮；ACES 把亮的顏色洗成灰白：陽光下的臉彩度 0.15，Neutral 0.27）。同鏡頭 19 張 A/B＝佇列 j27。不動人物材質（人物精修照使用者暫停）。動 engine3d.js 前已通知 LAWWW（03:4x，DELIVERED）。
- **佇列（qlist.txt）**：j18 美國停車場光圈（跑中，修改後那一輪）→ j15b 機場第二版 → j17 → j19c 溫州街販賣機 → **j14 美國巡場景（改在 `c617b2e0`、多拍超市街 15:00／20:00）** → **j27 色調 A/B（新）** → j23 林家／定食 → j24 → j25 交誼廳 → **j11 溫州街巡場景（改在 `c617b2e0`＋這一批還沒接的 patch 和 GLB，改用 fast_shots）** → **j26 法律系館巡場景（改在 `c617b2e0`）**。
- 磁碟剩 4.1 GB；`devwt_tip` 重設到 `c617b2e0`（原本的修改存成 `$SP/devwt_tip_wip_c69c91a5.diff`，內容就是已交的 `wz_shops2.diff`）。

### ▶▶ 10-22 03:2x 進度（帳號 A LAWWW2；被上面 03:5x 那一節取代）
- 開發分支 `be8c1b0e`（AA379 學姊大二大三、手機橫向選單；沒有動到我的檔）。我的分支最新見 `git log`（這一節寫的時候 `6c9301c2` 之後）。三份 patch（`wz0_prop_nav`、`wz_shops2`、`l118_bar_lift`）在 `be8c1b0e` 上一起套、兩種順序都乾淨。
- **佇列重排（D99 優先）**：j19（溫州街雜物導航前後，跑中）→ j22b 路人記憶體 → **j15 機場 → j18、j17 美國** → j19c（溫州街販賣機修正前後＋j19 沒拍完的 4 張）→ j14 美國巡場景 → j23 林家乾麵／定食店（總表寫 v9.10.3 以後整合，所以排在 D99 後面）→ j24 118 巷高腳凳 → j25 交誼廳 → j11 溫州街巡場景。j23、j24、j25 改在 `be8c1b0e` 上測。
- **ART-WZ0 新發現並修好（`7be8b62f`）**：街上的自動販賣機（`wz_shopkit.py` 的 `p_vend`）機身整塊包住展示窗——飲料和玻璃都在機身裡面，從街上看是米色大方塊（溫州街 A1、B2，公館 G03、G09、G10）。改成展示窗凹進去（機身到 z 0.22，四邊是框）；兩條街的 GLB 重建：三角形 +104／+156、導航腳印（props.json）一樣。遊戲內前後在 j19c。
- **j19 結果（到 03:18）**：修改前、修改後都是 2400 秒逾時、各拍到 12 張（缺 G08、G12、118 巷兩張陽台 → j19c 補）；單元測試 ALL PASS；回歸（reach、ggnav、wzint）修改前都 exit 0，修改後還在跑。對照圖 `$SP/wz0/cmp/`：公館騎樓有東西了、C1 鐵捲門的招租、B5 冰菓室新菜單。
- **ART-DORM-LOUNGE-1021（P3，佇列空檔做的，WIP `3a7f9a92`、`3588cc8c`）**：男宿交誼廳家具做細（皮沙發、電視櫃、兩台不同顏色的販賣機＋亮的展示窗「奶茶售完」、飲水機三個出水口＋「請自備杯子」、塑膠椅、回收桶、吊扇（扇葉 3.09 m 以上，鏡頭最高 3.0）、冷氣、時鐘、公告欄、窗簾、地毯、盆栽）。`dorm_hall.glb` 三角形 12,116 → 18,490。`patches/dorm_lounge.diff`（回收桶擋導航＋備用模型；`tests/dorm_lounge_unit.js` 修改前 2 FAIL、修改後 ALL PASS；原本家具的阻擋一格都沒變）。說明 `test_shots/dorm_lounge_1022/README.md`（WIP，遊戲內在 j25）。
- **ART-JIAHAO-JOY（P2）不動**：0.35 不在 VRM 裡（Joy 綁定 100）、遊戲的 smile＝happy 0.7；人物造型凍結（使用者 10-17）沒有解凍，維持待開工。
- **WZ-SHOP-AA364-ART**：README 草稿 `test_shots/wz_aa364_1022/README.md`（WIP；Blender 渲染三張）；`wz_shops2.diff` 一行註解改正。等 j23。

### ▶▶ 10-22 02:4x 進度（帳號 A LAWWW2；被上面 03:2x 那一節取代）
- 開發分支 `c2ec6681`。LAWWW 已整合：PERF-ZONE-ENTER＋四棟大門（`7b4fb34b`／`9f187fed`）、室內透空＋Café 地板＋宿舍 412（`e8c4ce7a`）；outbox 三件改「已整合」（`ca85b3a4`）。
- **WZ-SHOP-AA364-ART（做中，WIP `612028f6`、`2970217d`）**：
  - 林家乾麵、巷子裡定食室內：`tools/blender/env_second/wz_aa364_shops.py`（AA_364「照 118 巷的店面做法」：零件用 `lane118_shops.py`，配置讀 `wz_shops_layout.js`）；林家 18.2k、定食店 19.5k 三角形；零件的阻擋框都在配置的阻擋框裡。Blender 渲染 `$SP/aa364/render/`（可以重做）。
  - 配置：林家菜單 1.6×0.9；定食店吧台六張高腳凳 `lift: 0.27`（座面 0.72 m）；傘架加阻擋。
  - `patches/wz_shops2.diff` 第二版（對 `c2ec6681` 乾淨）：wzShop 座位帶 lift；`wz_shops2_unit` 加高腳凳檢查（拿掉那一行 1 FAIL、加上 ALL PASS）。
  - 順手修：半熟早午餐的椅子整排是反的（`wz_shops_interior.py` 多加了 π；椅背在人和桌子中間），GLB 重新匯出。
  - 外帶窗口：巷口茶飲、夏日冰菓室的店面本來就有（ART-WZ0）；菜單照 AA_364 第 2 節改（茶飲燈箱四樣、冰菓室三片木牌＋芒果冰 6～8 月）、冬天鐵捲門紙條改「五月見」；`wenzhou_street.glb` 重新匯出。
  - 給 LAWWW 的座標（eat3d／店員；Node 用真的導航格查過）：茶飲點餐 (17.4, −7.35) 面向 −z、店員 (16.8, −9.2) 面向 +z；冰菓室點餐 (24.4, −7.4)、店員 (24.4, −9.3)；冬天「看」(26.5, −7.4)。兩個店員都在店裡（導航格站不住，NPC 不能被 unstick 推到騎樓）。原本的「看手搖飲菜單」在 (23.0, −6.5)＝兩家中間。
  - 還沒做：佇列 **j23**（窗景照片 → 單元測試 → 遊戲內 16 張 → seats_on_furniture → reachability）→ README → 交件。
- **PERF-CROWD-LOD**：j22 的「修改後」沒有套到 patch（devwt_c 裡上一個工作留下的 `tools/shots/crowd_lod_audit.py` 擋住 git apply），after.json 其實是第二次修改前；修改前的數字：校園 geometries 470～537、textures 337～468，三趟來回沒有越來越多。**j22b** 重跑修改後（工作腳本加了 `git clean tools/`，套不上就停）。
- **新發現（還沒修）**：118 巷 cafe2（4）、pasta（6）、omu（5）的吧台高腳凳座位沒有 lift（凳面 0.76 m），人坐在 0.45 m、凳子穿過大腿。修法：`lane118_shops.py` 的 bar 座位寫 `lift: 0.31`＋重新產生配置；`l118_shops3d.js`（LAWWW 的檔）座位帶 `s.lift`。AA364 交件後做、patch 給 LAWWW。
- **佇列**：j19（溫州街雜物導航前後＋回歸，01:51 起，還在跑）→ j22b → j23 → j15 機場 → j18、j17、j14 美國 → j11 溫州街巡場景。

### ▶▶ 10-22 01:4x 進度（帳號 A LAWWW2；被上面 02:4x 那一節取代）
- 10-21 23:5x 到 10-22 01:10 額度用完；01:1x 使用者（經 LAWWW）：「繼續 也跟別的AI說繼續」。工作階段重啟過，**背景佇列被殺掉**（j11 跑到一半），01:16 重排，01:33 改成可以插隊的佇列（`$SP/queue/qrun.sh` 讀 `qlist.txt`，一次拿一行）。
- 開發分支 `77554430`。我的分支最新見 `git log`（這一節寫的時候 `259d2ceb` 之後）。
- **已交件**（都傳 LAWWW，DELIVERED）：
  - ART-ECON-3D-GAP-1021 四棟拱廊大門＋博雅東側一樓（`223252e5`；只換 GLB）。
  - PERF-ZONE-ENTER-1018（`3d6f2cee`）：`zone_prewarm.diff` 第五版只在電腦上預熱（手機模擬一次黑畫面 13.6 秒）；SwiftShader 量不出預熱效果；預先載下一區有效；**換區域最大的卡是路人底模池同一格換 8 個**（LAWWW 的範圍，三個建議寫給它）。
  - outbox 格式照 OUTBOX_TEMPLATE 修好（`1f3efbdf`，本機用 incremental.outbox_problems 檢查 0 項）。
- **新發現的 bug（我的範圍，已修、等遊戲內重拍 j21）**：宿舍、Café（還有 us3d 的美國公寓）把 `seeThru:true` 寫在區域「定義」上，但 `engine3d.js` 的 `updateSeeThrough` 看的是區域「實體」`E.zone.seeThru`——**室內網點透空從來沒開過**（宿舍上舖、大一 203 坐著鏡頭在北看不到人、Café 吊燈電線都是這個）。修法在我的檔：`dorm_seethru.diff` 第三版、`cafe_seethru.diff` 第二版各加 `z.seeThru=true`；單元測試第 1 項改查實體（沒加那一行 FAIL、加了 PASS）。美國公寓沒有標透空的材質，開不開都一樣，沒動。
- **宿舍 412 洗手間**：j12 看過，牆、地磚從暗灰變白磁磚（`test_shots/dorm412_1021/`，`259d2ceb`）；和 Café 一起交（等 j21）。
- **Café 地板**：j13 看過，人腳邊的白色反光點沒了；吊燈電線還是黑線（就是上面的透空 bug）。
- **路人遠距離 LOD**：j10 看過（同一時刻開／關：draw call −17～−34、三角形 −4.7～−9.6 萬；畫面看不出差別）；對 77554430 乾淨、`npc_far_unit`、`zone_dispose_unit` ALL PASS；LAWWW 要的換區前後記憶體量測 → 新工具 `tools/shots/crowd_mem_probe.py`，佇列 **j22**。
- **BB P3 路燈柱 1.1～1.6 m 就停住**：查過（Node）：0.5 m 格子＋`clear()` 只看前後左右四點，燈柱在格角要擋 4 格、在格子中央要擋十字 5 格，正面停在 0.7～0.95 m（SwiftShader 一步 0.4 m 才量到 1.1～1.6）。半徑改小沒用（溫州街一盞會穿過去）；**燈柱挪到格子中央、只擋那一格**：正面 0.58 m、斜向 0.36 m（身體離燈桿表面 0.28 m）。要改八處路燈位置（溫州街小公園兩盞在 Blender 模型裡，先不動）→ 排在交件之後做。
- **新認領**：WZ-SHOP-AA364-ART（tasks.json 派給 LAWWW2，D108）：林家乾麵（A4）、巷子裡定食（B3）能進去內用——照溫州街三家新店的做法（`wz_shops_layout.js`＋`wz_shops_interior.py`＋`wzShop(key)`），出口回溫州街的店門。規劃好了，還沒開工。
- **佇列（qlist.txt）**：j21 透空重拍（跑中）→ j22 路人記憶體 → j19 溫州街／公館雜物導航前後＋回歸 → j15 機場 → j18 美國停車場光圈 → j17 美國路口 → j14 美國巡場景 → j11 溫州街巡場景。

### ▶▶ 10-21 23:3x 進度（帳號 A LAWWW2；被上面 10-22 01:4x 那一節取代）
- 開發分支照舊 `34e488e4`。我的分支最新 `bc5b08a8`。
- **ART-WZ0（使用者 15:2x「舊店面翻修繼續」）第二、三批**（WIP，`test_shots/wz0_1021/README.md`）：
  - 靜態盤點（店面表對 AA_164 7b-2）：溫州街 B2 洗衣、C1 鐵捲門、C2 公寓缺層 → 補（`0aa92195`）；**公館騎樓 15 間門口雜物全部是 0** → 14 間補 2～4 樣、G10 自動門、G06 玻璃櫥窗（`5cdc70b4`）。
  - 門口雜物會讓人穿過去（貼牆走）：`wz_street.py` 建模時寫出 `<模型>.props.json`；新測試 `tests/street_props_nav_unit.js`；`patches/wz0_prop_nav.diff`（zones3d.js 的 `WZ_PROP_BLOCKS` 6、`GG_PROP_BLOCKS` 39，**模型接上時才擋**）：修改前 4 FAIL→ALL PASS；兩區沒孤島、互動點都走得到。和 `zone_prewarm.diff` 兩種順序都套得上。
  - 118 巷用現在的腳本重建（`e6c2669a`）：ART-BALCONY-POTS 那次漏了，補上陽台鐵花架。
  - 遊戲內前後（溫州街 7、公館 7、118 巷 2）＋瀏覽器回歸排在佇列 **j19**（j11 之後）。
- **PERF-ZONE-ENTER-1018**：`zone_prewarm.diff` 第四版（prewarm 期間主迴圈先不畫；第一版在遊戲裡丟例外已修），佇列 **j16c** 量測（prewarm、路人池不輪換對照、電腦模擬＋預先載入）在 j9 之後。
- **PERF-CROWD-LOD-1021**：40 個遠距離 GLB 放進 assets＋LICENSES（`6134c0af`），j10 照舊。
- **ART-VAC-AIRPORT-1021**：新的機場 GLB 放進 assets（`bc5b08a8`，原本只在 scratchpad）。
- **ART-ECON-3D-GAP-1021**：j9（三棟大門正面）跑到最後；文學院、行政 15:00／20:00 已看過（白天看得出雙開玻璃門，晚上玻璃透暖光）→ 看完校史館、總圖就交「四棟大門＋博雅」。
- **背景佇列**：j9（快完）→ j16c → j10 → j11 → **j19** → j12 → j13 → j14 → j15 →（j16b 空）→ j17 → j18。

### ▶▶ 10-21 22:5x 進度（帳號 A LAWWW2；被上面 23:3x 那一節取代）
- **開發分支最新 `34e488e4`**（22:3x fetch）。LAWWW 已整合：榕樹氣根＋燈柱導航＋椰林大道路燈（`ae968ffb`）、US-MARKET-STREET（`d2252a05`）。outbox 已改（`41043fec`）。
- 待交的 patch 在 `34e488e4` 上都乾淨：`us_lamp_pools.diff`（現在不用先套超市街）、`airport_cam_night.diff`、`crowd_far_lod.diff`、`zone_prewarm.diff`。
- **WIP：PERF-ZONE-ENTER-1018**（使用者 X14；最新 `03d91e7a`）：
  - 修改前量測（j16，80af0168，SwiftShader）：每次換區域黑畫面 4～5 秒（建區域＋第一格編 shader）；淡入以後還會再停：
    - 已載過的正式模型在淡入時才接上（microtask），那一格才編 shader、傳貼圖；
    - **路人底模池每次換區域輪換 8 個新的 VRM**（`character3d.js` 的 `C.anonPool`，使用者 10-17 P0「長得很像的路人太多」），下載、解析、換上時最長停 8.5 秒（第二次進溫州街）——LAWWW 的範圍，量完 `--keep-anon` 對照再寫建議給 LAWWW。
  - `patches/zone_prewarm.diff` 第二版：`Z3.prewarm`（等已載過的模型接上 → compileAsync → 傳貼圖；只做看得到的物件）＋`game3d.js` 的 enter 淡入前等它（**LAWWW 的檔，交件前先通知**）。第一版在遊戲裡丟例外：溫州街三個藏起來的套件零件 material 是 TK paint 描述，compile 走到就丟 TypeError——第二版已修，單元測試加了這一項（第一版 FAIL、第二版 PASS）。
  - `wz_jphouse.glb` 不再帶整張 2048² 招牌圖集（`63d3bc5e`；燈籠、木牌切 288×416，UV 對到同一個像素）。
  - 修改後量測排在佇列 j16c（after2、base_keepanon、after2_keepanon），在 j9 之後。
- **ART-ECON-3D-GAP-1021**：博雅東側一樓遊戲內前後對照已寫進 `campus_doors_1021/README.md`（`081847ae`；15:00 灰牆→玻璃帶、20:00 透暖光；「正面」兩張鏡頭落在東邊系館的柱子裡作廢）。三棟拱廊門的正面重拍 j9 跑中，看完就交「四棟大門＋博雅」。
- **背景佇列**（`$SP/queue/`）：j9 三棟大門（跑中）→ j16c 換區域量測 → j10 路人 LOD → j11 溫州街巡場景 → j12 宿舍 412 → j13 Café → j14 美國巡場景 → j15 機場前後對照 →（j16b 空）→ j17 超市街重拍 → j18 超市街光圈。監看到 ALLQ13。
- 稀疏工作樹：`$SP/devwt_ze`（`34e488e4`＋prewarm 修改＋新測試）、`$SP/devwt_ap`（機場）、`$SP/devwt_us`（超市街光圈）。
- **接下來**：j9 看完交「四棟大門＋博雅」→ j16c 看完寫 PERF-ZONE-ENTER 說明、通知 LAWWW（game3d.js 一行＋路人池建議）→ 照佇列交其他項。

### ▶▶ 10-21 22:2x 進度（帳號 A LAWWW2；被上面 22:5x 那一節取代）
- 開發分支照舊 `80af0168`。
- **22:2x 已交件 US-MARKET-STREET**（patch `8512b3b0`、模型 `fa7c85e2`、說明 `07967c55`；遊戲內 12 張；DELIVERED、沒 ACK）。
- **WIP：ART-VAC-AIRPORT-1021**（機場；說明 `test_shots/airport_1021/README.md`，最新 `7587ac4f`）：
  - `patches/airport_cam_night.diff`（`ef7ffd89`）：鏡頭牆、網點透空、晚上換夜景平面（沒有夜景平面的舊模型照舊調暗）；`airport_cam_unit` 修改前 13 FAIL→ALL PASS。
  - 窗外遠景改 Blender 渲染：新 `tools/blender/env_second/airport_backdrop.py`（停車大樓 P2、樟樹、車、高架、飯店、塔台；白天＋`--night`），貼圖 `textures/gen/ap_outside*.png`（`31ae6897`）；`airport_t2.py` 加夜景平面、背牆鋁收邊、框改鋁灰（`ab8544f6`、`ef7ffd89`）。
  - 新 GLB 在 `$SP/airport/glb/new_{dep,arr}.glb`（還沒換進 assets；等 j15 遊戲內對照）。
- **WIP：US-MS-NIGHT-1021**（`17c2af30`，`patches/us_lamp_pools.diff`，接在超市街 patch 後面）：美國戶外區域路燈地面光圈；`us_lamp_pools_unit` 修改前 12 FAIL→ALL PASS。遊戲內 20:00 前後對照排 j18。
- **WIP：PERF-CROWD-LOD-1021**（`21ada28c`）：照舊等 j10。
- **PERF-ZONE-ENTER-1018**（使用者 X14，LAWWW 改派）：量測工具 `tools/shots/zone_enter_probe.py`（`83b4a478`）排 j16。靜態盤點：進溫州街要載約 4,500 萬像素的貼圖；`wz_signs_atlas`（2048²）在 `wenzhou_street.glb`、`wz_jphouse.glb` 各包一份；`wz_road_atlas` 4096×1200。懷疑是新材質第一次畫的 shader 編譯＋大貼圖解碼上傳；等數字再改（預熱 compileAsync、縮貼圖）。
- **背景佇列**（`$SP/queue/`）：j8 博雅 → j9 三棟大門 → j10 路人量測 → j11 溫州街巡場景 → j12 宿舍 412 → j13 Café → j14 美國巡場景 → j15 機場前後對照 → j16 換區域量測 → j17 超市街重拍一張 → j18 超市街夜間光圈前後對照（master13，ALLQ13）。
- 稀疏工作樹：`$SP/devwt_ap`（80af0168＋機場修改）、`$SP/devwt_us`（80af0168＋超市街 patch 已 stage＋光圈修改）。
- **接下來**：佇列輸出逐項交件（博雅＋三棟大門 → 路人 LOD → 宿舍 412＋Café 地板 → 機場 → 超市街光圈）；ART-WZ0 盤點（j11）；PERF-ZONE-ENTER（j16）；B16 男宿交誼廳家具（P3）。

### ▶▶ 10-21 21:5x 進度（帳號 A LAWWW2；被上面 22:2x 那一節取代）
- 開發分支最新 `80af0168`（21:19；LAWWW 已整合 BUG-CAFE-KIT-GLOW-1021）。待交的 patch（lamppost_nav→campus_avenue_lamps、dorm_seethru、cafe_seethru、us_market_street、crowd_far_lod、airport_cam_night）在 `80af0168` 上一起套都乾淨。
- **21:3x 已交件（DELIVERED、沒 ACK）**：榕樹氣根（`f858b47c`／說明 `c36c2dbe`）、燈柱導航＋椰林大道路燈（`5f03d748`／說明 `fb8546f3`；Node＋四支瀏覽器回歸修改前後都 ALL PASS）。
- **WIP：PERF-CROWD-LOD-1021**（`21ada28c`）：遠距離路人的明暗改成照 MToon 公式（身體陰影面 0.53、頭髮 0.47，第一版估的 0.82 太亮）；`npc_far_unit` 第 8 項最大差 0.002；18 支相關單元測試 ALL PASS。j10 會用新版（`$SP/crowdlod/crowd_lod_src.diff` 已更新）。遠距離 GLB 等 j10 看過再放進 assets＋LICENSES。
- **WIP：ART-VAC-AIRPORT-1021**（D99 寒暑假；j6 機場巡場景 20 張）：
  - `patches/airport_cam_night.diff`（`1997dc31`）：鏡頭牆（帷幕、出關門、出口、報到島背牆）、網點透空、晚上窗外變暗；`tests/airport_cam_unit.js` 修改前 13 FAIL→ALL PASS；11 支美國／機場 Node 測試前後相同。
  - `airport_t2.py`（`ab8544f6`）：背牆烤漆深灰＋鋁收邊、帷幕框鋁灰、輸送帶；新 GLB 在 `$SP/airport/glb/new_*.glb`（還沒換進 assets）。
  - 說明草稿 `test_shots/airport_1021/README.md`（`25da22cb`）。遊戲內前後對照排在佇列 j15（master10，等 ALLQ9）。
  - 測試用的稀疏工作樹：`$SP/devwt_ap`（`80af0168`，只有 lib／src／tests／tools／機場模型，26 MB）。
- **背景佇列**：j7 美國超市街拍照中 → j8 博雅 → j9 三棟大門 → j10 路人量測 → j11 溫州街巡場景（ART-WZ0）→ j12 宿舍 412 → j13 Café（含 cafe_glb_integration）→ j14 美國巡場景 → j15 機場前後對照。監看到 ALLQ10。
- **接下來**：照佇列輸出交件（博雅＋三棟大門 → 超市街 → 路人 LOD → 宿舍 412＋Café 地板 → 機場）；ART-WZ0 盤點（j11）。

### ▶▶ 10-21 20:5x 進度（帳號 A LAWWW2；被上面 21:5x 那一節取代）
- 開發分支最新 `d22748f5`（20:5x fetch；19:4x 那一節寫的 `a9da472a` 已經舊了）。交件前所有 patch 要重新對 `d22748f5`（或當時最新）確認乾淨。
- **已整合**（LAWWW 18:58／19:14／19:27 ACK）：BOX-MIRROR、ART-02、C208、ART-GYM2-INT、A7、arena look 文字。
- **WIP：ART-ECON-3D-GAP-1021**（六項，19:4x 那一節的 1～6）＋**BUG-NAV-LAMPPOST-1021**（`lamppost_nav.diff`）：
  - 已看過的遊戲內對照：
    - 傅鐘 15／20 點；
    - 大道 20 點的人眼高度、高處；
    - 總圖門 15／20 點：黑色長方形 → 雙開玻璃木門，晚上透光；
    - 椰林大道路燈的說明 `test_shots/avenue_lamps_1021/README.md` 已寫（WIP）。
  - 文學院、行政、校史館的門：econfix2 的斜角鏡頭被拱廊柱子擋住，**改正面鏡頭重拍**（佇列 j9 `doors2`）。
  - 博雅東側：角度太斜，重拍（佇列 j8 `boya2`）。
- **WIP：US-MARKET-STREET**（`fa7c85e2`／`8512b3b0`）：區域、GLB、配置、patch、測試都好了，遊戲內 13 張截圖排在佇列 j7（`usms`），看完寫 README 再交。
- **WIP：PERF-CROWD-LOD-1021**（`1fd9547a`；20:4x 已傳 LAWWW 開工通知，DELIVERED、沒 ACK）：
  - 工具 `tools/lod/npc_lod.py`：40 個路人底模的遠距離版本，31k → 6.4k 三角形，13 → 2 個網格。
  - `patches/crowd_far_lod.diff`（對 `d22748f5` 乾淨）＋`tests/npc_far_unit.js`：修改前 FAIL、修改後 ALL PASS；18 支相關單元測試修改前後都 ALL PASS。
  - 遠距離 GLB 還沒放進 assets：在 `$SP/crowdlod/all/`，工具可以重新產生（確定性）。
  - 遊戲內量測（`tools/shots/crowd_lod_audit.py`，修改前後各一次）排在佇列 j10。
- **背景佇列**：
  - 位置：`$SP/queue/`，`$SP`＝scratchpad；master → master2 → … → master5 依序等前一條寫 ALLQ*；工作樹都用 `devwt_c`。
  - 順序：j1 econfix2（完）→ j2 banyan → j3 dorm412 → j4 cafe → j5 lampnav（瀏覽器回歸：reachability_all 四區、campus_layout_nav、gongguan_layout_nav、p0_movement，修改前後各一次）→ j6 airport 巡場 → j7 美國超市街 → j8 博雅重拍 → j9 三棟大門正面重拍 → j10 路人遠距離版本量測。
  - 輸出：各自資料夾的 `run.out`、`*.log`。
- **接下來**：
  1. 照佇列輸出逐項看、寫 README、交件（ART-ECON 六項＋燈柱導航 → 超市街 → 路人 LOD）；
  2. 機場巡場（D99 寒暑假）；
  3. ART-WZ0 盤點。

### ▶▶ 10-21 19:4x 進度（帳號 A LAWWW2；被上面 20:5x 那一節取代）
- 開發分支照舊是 `a9da472a`（v9.10.3 發布後）；所有 patch 都對它做。
- **已交件、等整合**（都對 `a9da472a` git apply 乾淨）：BOX-MIRROR `86dd6d54`、ART-02 `8b38e054`、C208 `76b3a0d5`（18:5x 傳，DELIVERED、沒 ACK）、A7 小公園 `1effaa35`、ART-GYM2-INT `c1e65c33`（19:1x 傳，DELIVERED、沒 ACK）。
- **WIP：ART-ECON-3D-GAP-1021**（經濟系那一年；都已 commit＋push，遊戲內前後對照排隊中，看完才交）：
  1. 四棟拱廊大門 `89655410`（總圖、行政、文學院、校史館；只換 GLB）；
  2. 博雅東側一樓玻璃帶 `0343b994`（只換 GLB）；
  3. 椰林大道路燈 `campus_avenue_lamps.diff` **第三版**（`5f03d748`；要接在 `lamppost_nav.diff` 後面套）＋傅鐘前那一盞移到鐘亭兩側；
  4. 榕樹氣根 `f858b47c`（貼圖＋`street_trees.glb`）；
  5. 宿舍四人房洗手間頂板 `2bc9992d`＋`dorm_seethru.diff`（`b47d499b`：宿舍的網點透空從來沒作用過）；
  6. Café 吊燈電線透空＋光暈 `71ca706a`（GLB＋`cafe_seethru.diff`）。
  - 巡場景清單（`$SP/econ2`，33 張，對話都點完）：上面 6 項＋燈柱導航；博雅門口鏡頭貼在人頭後面＝巡場腳本把鏡頭手動轉向牆（manualT 60 秒），引擎的範圍、不處理；公館出生點的機車在人後面 2 m，不是穿模。
- **WIP：BUG-NAV-LAMPPOST-1021**（P1，`5f03d748`）：路燈的燈柱擋不住人（blockCircle 0.25 在 0.5 m 格角一格都沒擋）。`patches/lamppost_nav.diff`：校園、公館、118 巷、小公園的燈柱改 0.5。`tests/lamppost_nav_unit.js` 修改前 4 區都 FAIL、修改後 ALL PASS；0.1 m 取樣找孤島前後都 0；16 支 Node 測試前後相同。瀏覽器回歸排隊中。
- **背景佇列**（`$SP`＝scratchpad；一個接一個，避免搶 CPU）：`econfix2/run.sh`（四棟大門、博雅、傅鐘、大道 20:00）→ `banyan/run.sh` → `dorm412/run2.sh` → `cafepend/run.sh`（含 `cafe_glb_integration.py`）→ `lampnav/run.sh`（reachability_all 四區、campus_layout_nav、gongguan_layout_nav、p0_movement；修改前後各一次）。輸出都在各自資料夾的 `run.out`、`*.log`。
- 七份待整合 patch（gym_arena_int、art02、c208、lamppost_nav、campus_avenue_lamps v3、dorm_seethru、cafe_seethru）在 `a9da472a` 上一起套乾淨（`dorm_cam_203.diff` 已整合）。
- **接下來**：看完對照 → ART-ECON 七項＋燈柱導航交件（README、outbox、傳 LAWWW）→ ART-WZ0 盤點（溫州街每一間店白天／晚上，列出缺哪幾層；10-16 那批已經把八間店都做成立體淺店內）→ US-MARKET-STREET → PERF-ZONE-ENTER-1018。

### ▶▶ 10-21 19:0x 進度（帳號 A LAWWW2；被上面 19:4x 那一節取代）
- **v9.10.3 已發布**（LAWWW 18:39，main `5b3f1023`），凍結結束。開發分支現在是 `a9da472a`；之後的 patch 都對它做。
- **已整合進開發分支**（在 `a9da472a` 用 `git apply -R --check` 確認）：
  - 黃昏調色預設開 `723d49a4` → 開發分支 `6d49e79c`；
  - 203 鏡頭 `58fb6115` → `6313c019`；
  - 校園停著的腳踏車 `49b26ecb` → `51740da7`。
- **已交件、等整合**：下面的 patch 都對 `a9da472a` git apply 乾淨，單元測試在 `a9da472a` 上 ALL PASS。
  - ART-Y1-BOX-MIRROR-1021：`86dd6d54`（只換 GLB `37884326`）。
  - ART-02-GONGTONG-1021：`8b38e054`（patch `art02_gongtong_doors.diff`）。
  - BUG-CAM-C208-1021：`76b3a0d5`（patch 第二版；`engine3d.js` 一行是 LAWWW 的檔）。78 號 PARTIAL。
  - 以上三項 18:5x 傳給 LAWWW，狀態 DELIVERED，還沒收到 ACK。
  - BACKLOG A7 小公園疊面：`1effaa35`（只換 `wz_park.glb`、`c53c3c6d`）。還沒傳訊息，和 3F 主球場一起傳。
- **WIP：ART-GYM2-INT 第二輪**（遊戲內截圖抓到四個問題，都修了）：
  - patch v3 `dec70791`；GLB：`gym_arena.glb` 三角形 51,926，`gym_interior.glb` 是拿掉紅龍那一版（已放到正式路徑）。
  - `tests/gym_arena_unit.js` 第 11～15 項：修改前 FAIL、修改後 ALL PASS。
  - 第一次重建時，門片被南看台後牆包在裡面，看不到。後牆已經開門洞，第 14 項加了「看得到門片」的檢查。
  - 遊戲內重拍跑在背景：`$SP/arena3/after2`；修改前那組在 `$SP/arena3/before`。
- **WIP：ART-ECON-3D-GAP-1021**：
  - 四棟大門 `89655410`、博雅東側一樓 `0343b994`、椰林大道路燈 `fa34a418`。
  - `campus_avenue_lamps.diff`：腳踏車已經整合，所以現在可以直接套在 `a9da472a` 上。
  - 遊戲內前後對照跑在背景：`$SP/econfix/econ_fix_check.py`。
  - 第一輪經濟系巡場景**作廢**：33 張全部被「新生座談」的對話蓋住。改過的腳本先把對話點完：`$SP/econ2/econ_patrol2.py`，排在 `$SP/econfix/run_all.sh` 最後。
- **接下來**：
  1. 交 ART-GYM2-INT、ART-ECON 三項修正；
  2. 用重拍的巡場景寫 ART-ECON 缺口清單，接著修；
  3. ART-WZ0；
  4. US-MARKET-STREET（D99 美國）；
  5. PERF-ZONE-ENTER-1018。
- **磁碟**：剩 5.5 GB，scratchpad 用了 5.9 GB。

### ▶▶ 10-21 18:0x 進度（帳號 A LAWWW2；被上面 19:0x 那一節取代）
- **BB／LAWWW 已驗收或已整合**：
  - ART-BALCONY-POTS：BB PASS。
  - 203 膠帶＋壓平紙箱：BB FIXED。
  - 體育館 1F 白色光柱：LAWWW 整合 `1cd80a95`，BB FIXED（20:30 +43.8→+9.0）。
  - LIC-GAPS-1017：已交件 `64bcc529`（patch）。
- **新任務 ART-Y1-BOX-MIRROR-1021**（BB 17:10「壓平紙箱上的字左右鏡像」，LAWWW 17:17 排進來）：
  - 原因：原本故意寫倒著（`hand(..., ang=182)`，整串轉半圈），遊戲裡看起來像寫反了。
  - 改法：改成正的、微歪，`37884326`；貼圖只變那一塊，三角形、物件、旗標不變。
  - 狀態：遊戲內前後對照排在背景最後（`$SP/boxmirror/run_box.sh`，工作樹 `devwt_a`＝開發分支 `15f3c677`）。
- **patch 都對最新開發分支 `15f3c677` git apply 乾淨**（`docs/art-rebuild/second_ai/patches/`）：
  - `grade_golden_default.diff`：v2 `b0217a39`，加了 `tools/shots/golden_compare.sh`，原版用 `?grade=off`。
  - `c208_cam_walls.diff`：`74abbef1`。
  - `dorm_cam_203.diff`：`837ac4e0`。
  - `gym_arena_int.diff`：`bee24087`。
  - `lic_gaps_dorm_room4.diff`。
- **ART-GYM2-INT 的 GLB 還沒放到正式路徑**：
  - 拿掉紅龍的 `gym_interior.glb` 只在 scratchpad（`$SP/gym/gym_norope.glb`，沒有遠端備份）。
  - 腳本 `gym_interior.py` 已在 `bee24087`，可以重建。
  - 交件時 GLB 和 patch 一起。
- **背景排隊**（一條，不並行）：
  - `master.sh`：黃昏 golden 對照（白天、黃昏、夜晚已拍完：白天、夜晚一樣，黃昏變暖、店燈亮）→ 後製開關＋每幀時間 → C208 鏡頭前後 → 校園投影子物件盤點 19.5／15.0 → 203 鏡頭前後 → 小公園前後。
  - 接著 `arena/run_arena.sh`（3F 主球場）→ `boxmirror/run_box.sh`。
- **接下來**：跑完一項交一項（README＋前後對照 → outbox → LAWWW／BB SHA）→ PERF-CAMPUS-SHADOW-1020（P1，用盤點數字）→ ART-WZ0 → PERF-ZONE-ENTER-1018 → ART-02。
  - ART-02 已查：共同教學館三個關著的門（203、兩間洗手間）都是 1.2 m 寬，剛好是門模組的門洞；牆在那裡沒有開口，門片要貼在走廊那一面。
- **磁碟**：剩 5.8 GB。刪舊測試工作樹被權限擋下（不硬做）；不夠時請使用者決定。

### ▶▶ 10-21 16:4x 進度（帳號 A LAWWW2；做完的照順序交，交件時傳 LAWWW SHA）
- **已保存、遊戲內對照排隊中**（背景工作串成一條：公館陽台 → 203 第二輪 → 體育館 → 黃昏（golden＋後製） → C208 鏡頭；腳本與輸出在 scratchpad，重跑方法寫在各 README）：
  - ART-BALCONY-POTS：溫州街 `efc1730d`（遊戲內前後對照拍完，`test_shots/balcony_pots_1021/`）＋公館 `a53eb709`（舊腳本重建和遊戲裡的逐位元組相同；遊戲內對照拍中）。
  - 大一 203（BB_218）：膠帶「國界」／「法律系免簽」4.8 cm、壓平紙箱搬到衣櫃門前 `33b3a556`、字距與下緣 `a47e1860`；第一輪遊戲內對照：字看得到、紙箱看得到；第二輪（字距修正後）排隊中。
  - 體育館 1F 白色光柱（BB_218）：地板粗糙度 0.32→0.5 `c31a2554`。第一次逐盞關燈量光柱**無效**（20:30 進館手機自己跳出來蓋住畫面），腳本已加「收起手機」重排。
  - GRADE-GOLDEN-DEFAULT：patch `patches/grade_golden_default.diff`（對 b804db03 乾淨）；VISUAL_REVIEW 第 10 節對照重拍排隊中（`?grade=off` 對預設）。
  - ART-VSLICE 收尾：路面（精修第 3 批）早就整合了；剩後製 `src/post3d.js`（B 的 WIP，沒接進 index.html）——在 Café 門口 17:30／20:00／12:00 拍開關對照＋量每幀時間，決定接不接（預設畫質「中」，要接也只在「高」開）。人物光影不做（使用者凍結人物）、街道 AO 不新開（「收尾、不擴大」）。
  - **BUG-CAM-C208-1021**：`patches/c208_cam_walls.diff`（`74abbef1`；us3d.js aptCamCols＋engine3d.js followCam 一行＋tests/us_cam_walls_unit.js）；鏡頭在牆後面的方向 41%→0%（208）、42%→0%（公寓）；BB 五個位置 3 秒內轉開；teach_cam_walls、nav_us、us_life ALL PASS。engine3d.js 那一行 16:4x 已事先告訴 LAWWW（DELIVERED）。遊戲內前後對照排隊中。
- **全部待辦補兩項**（LAWWW 16:1x 派的）：BUG-CAM-203-R2-1021（P3，大一 203 R2 書桌旁鏡頭被上鋪床架／浴室磁磚牆擋住；可以用 C208 同一套 camCols 做）；WZ-SHOP-AA364-ART（暫停到 v9.10.3 之後，10-28 再看）。

### ▶▶ 10-21 16:1x 帳號 A 最新（LAWWW 16:05 P1：使用者 16:0x「讓 LAWWW2 接場景相關的程式修改 可以」＝D108，改 D100 第 3 點；改派 10 項）
- **D108 範圍**：場景、區域與配置、模型接線、場景導航與碰撞、場景鏡頭碰撞、場景效能與光影、LICENSES 補登。
  - 劇情流程、事件、存檔、系統照舊是 LAWWW 的。
  - 推自己的分支、跑相關 Node 單元測試 → outbox＋通知 LAWWW SHA → LAWWW 合併、BB 測。
  - 共用核心檔 engine3d／game3d／story3d／character3d／assets3d：動手前先告訴 LAWWW。
  - 改 src 前先把開發分支 merge 進這個分支（不 rebase、不 force）。
- **順序**（LAWWW2 自己排，16:1x 回 LAWWW）：
  1. 手上收尾：
     - ART-BALCONY-POTS 溫州街（陽台盆栽上花架）。
     - C208：BB_218 的外套、門牌淡出，加上 **BUG-CAM-C208-1021**（C 棟 2F 208 門口走廊 17:46 鏡頭卡進牆、屋簷；BB test_shots/artrev_1021/38、39）一起交。
  2. **ART-VSLICE**＋**GRADE-GOLDEN-DEFAULT**：重拍 VISUAL_REVIEW 第 10 節；engine3d.js 預設改 golden、保留 ?grade=off；改之前先告訴 LAWWW。
  3. **PERF-CAMPUS-SHADOW-1020**（P1）：校園投影子物件 857、draw calls 516 → 合併網格、小物件不投影、instancing。影子閃 LAWWW 已修（shadowSnap），等真機。
  4. **ART-WZ0** 舊店面翻修，**ART-WZ7**、**ART-SOY1** 能一起放就一起。
  5. **PERF-ZONE-ENTER-1018**：進溫州街、咖啡廳卡一兩秒；用 tests/perf_scenes.py 量，從素材端降。
  6. **ART-GYM2-INT**：gym_arena.glb＋layout v3 接成 gym 3F 區域、拿掉 closed_3f 紅龍。
  7. **LIC-GAPS-1017**：LICENSES 補 ntu_gym_ceremony.webp、dorm_room4.glb、gym_arena.glb、機車行道具組。
  8. **ART-02**：共同教學館的關門換成 furniture_study 門片（teach3d.js:165）。
  - **ART-WZ6**：擺放歸 LAWWW2，照舊等溫州街故事線（DL-11／DL-13）。
- **BB_218 補拍判定**（BB 16:03）：
  - **203 膠帶的字不通過**：已問 AA 膠帶上能寫什麼；特寫鏡頭的建議已交 LAWWW。
  - 壓平的紙箱、體育館白霧：BB 還在查。

### ▶ 10-21 最新（照這個順序；任務 ID 對 RULE_SOURCE 的 tasks.json）
1. **ART-DIRECTOR-LAWWW2 巡場景**（使用者 10-21 12:0x；標準 `ART_SOP.md` 第 10 節；紀錄 `ART_DIRECTOR_PATROL.md`；D99 先做經濟系 → 寒暑假 → 美國）：
   - 第 1 區校園：白天、黃昏、夜晚都拍了也看了。已交：社科院柱廊柱子透空（`75080217`）。
   - 下一個：社科院中庭朝圖書館那面實牆（P2）→ 文學院／校史館的黑門（P2，套件建築，D38 第④類）→ 傅鐘前的路燈（P3）。
   - 榕樹氣根黑線（P2）：查到一半（`test_shots/patrol_campus_1021/README.md`）；`street_trees.glb` 共用、含溫州街（使用者 10-17 暫停），改之前問 LAWWW-C。
   - 之後：寒暑假的 3D（機場等）→ 美國（清查 A9 超市之間的街）→ 法律系館 → 宿舍 → 公館（BB-C 量的三角形 +15～19%）→ 118 巷 → 教室 → 日夜。溫州街只記錄。
2. **PS-SKIRT-LEG**（沛珊腿穿出長裙）：WIP `27618d8d`，只改權重不夠，要加前片骨頭或程式布料碰撞；排在 D99 場景後面。交件時要附 char_motion 前後＋坐下兩個角度（LAWWW-C 13:51Z）。
3. **清查剩下的**（`BACKLOG_SWEEP_1021.md`）：A5 公館陽台盆栽（＝ART-BALCONY-POTS，P3，只做公館）、A6 社科院夜景、A7 小公園疊面（溫州街，暫停）、A8 室內疊面的尾巴、A9 US-MARKET-STREET；體育館 B1 健身房單調（P3）。
4. **等驗收**：體育館、203 紙箱／膠帶（膠帶上的字在玩家鏡頭下認不出，等 BB-C 給鏡頭再改）、C208、jp_room、社科院柱子（場景美術只有使用者能標 ART_APPROVED）；沛珊手臂 LAWWW-C 已接受（D100）。
5. **outbox 格式**：已照 outbox_fix_1021 改完（`18bd8e26`，模擬 0 項），等 LAWWW-C 跑 incr 確認。

任務 ID 對到 RULE_SOURCE 的 `docs/handoff/tasks.json`。原本的【表外】6 項 LAWWW-B 已經補進總表（89e254a1），下面換成正式 ID；**【表外】**＝總表還沒有的。交班、接班都跑 `python3 tools/handoff/check_handoff.py roles`。接班的人照這張表由上往下做。

### ★ 使用者 2026-10-18 01:0x 直接給 LAWWW2-C：美國校園照使用者給的法學院照片改（P0；取代 SCN-US-02 原本的配置）
- **原話**：「我剛剛有給你我的美國法學院的建築，你已經完成了建築不需要全部刪掉，但是可以照他的外觀去改」；校門照片：「校區門口，其實在法學院的左邊我們可以直接從馬路進去法學院通常不會走校門口，除非我們要去活動中心」；另外給了「法學院圖書館」室內照片兩張。
- **照片不放進 repo**（第三方照片有版權；也會讓人認出是哪一間學校——repo 是公開的，CLAUDE.md 第 2 條）。照片在帳號 C 的對話裡；下面是文字描述，接手的人照這個做：
  - **法學院（系館）**：淺米色光面石灰岩（石塊大小不一、橫向接縫清楚），1950 年代的學院哥德式。轉角一座約六層樓高的方塔，頂上一層一層往內收、平屋頂女兒牆；塔正面中間是三層樓高的多邊形凸窗（正面五扇、兩側斜面各兩扇，石頭直櫺），凸窗底下是往下一階一階收的托座，托座正面一塊浮雕板（**不刻校名、校徽**：做成抽象花紋）；凸窗下面是入口：圓弧形（略扁）拱門、兩三圈線腳、門往裡退，木框玻璃雙開門＋上方的鉛條玻璃氣窗，門的兩側各一盞黑色壁燈；門前約八階台階、兩條不鏽鋼扶手、台階兩側是石灰岩的矮牆（擋土牆一樣、一層層的石塊）。塔頂層兩側有細長的窄窗，塔側面每層兩三扇方窗。兩翼三層樓，每層大片成組的方窗（四到六扇一組、石頭直櫺、深色窗框、上面一排小氣窗），平屋頂女兒牆上有小小的城垛；有一翼後面是緩坡的深灰石板瓦屋頂。人行道邊一道亂石（毛石）矮擋土牆，後面是比人行道高一點的草坪、大樹；路邊有深綠色的路燈柱、黃色菱形路牌。
  - **校門**（在法學院的左邊；平常從馬路直接進法學院，**只有去活動中心才走校門**）：兩座對稱的石灰岩門樓，各是一座方塔（頂上八角形的小亭：小拱窗、尖頂、石頭尖飾）＋外側一道尖拱的側門＋外側一根矮一點的石柱；兩座塔中間是開口（車道寬）。塔身有黑色壁燈、小銅牌（**牌子留白**）。門前是紅磚鋪的小廣場，石灰岩矮花台裡種花（秋天是菊花）。門後是粗面石灰岩、陡屋頂的老系館（有圓塔）。
  - **法學院圖書館（室內）**：挑高中庭，四周幾層書庫；玻璃欄杆＋木扶手；樓梯斜著穿過中庭（樓梯邊有一排小燈）；中庭吊著鐵絲球狀的裝置藝術；一面藍綠色的彩色鉛條玻璃大窗；淺木色長閱覽桌、圓桌、藍色地毯、軟椅。**要不要做成 3D 區域由 LAWWW-C 排**（LAWWW-C 00:20 的範圍：教室是 2D）。
- **做法**：已經做好的不刪——`us_campus_kit.gothic_hall`（陡屋頂、尖拱的哥德式系館）改當校門後面的老系館（背景）；新加 `law_school()`（方塔＋凸窗＋拱門＋台階＋兩翼）和 `campus_gate()`（雙門樓）。配置改成：公車（字卡）→ 法學院前的人行道 → 走道 → 台階下「進教室」；校門在法學院西邊（左邊），門口互動「往活動中心」（活動中心還沒做：門後不能走，當成區域的出口，LAWWW-C 決定按了以後怎麼辦）。
- **停止**：原本的配置（校門在正中間 → 長紅磚步道 → 正中間的系館＋兩側系館）。D77 照舊：不放校名、校徽、銅牌文字；場景標 PROPOSAL／READY_FOR_ART_REVIEW，使用者看過才算數。
- **通知**：LAWWW-C（出生點、互動點會變；圖書館排不排）。LAWWW-C 00:36 ACK：照做；「往活動中心」接成關著的出口（通用提示）；**法學院圖書館排成 SCN-US-LIB**（順序 SCN-US-02 → SCN-US-LIB → ART-US-SEASON；最小可玩：大門進去、中庭一樓可以走、幾張長桌可以坐，樓上看得懂的方式關起來）。
- **交件（01:2x）**：SCN-US-02 第二版 `1e6987cb`（GLB 8.4 萬三角形 5.9 MB、配置第 2 版、README `test_shots/us_campus/README.md`：同角度算圖、遊戲內手機截圖、還沒做到照片的地方）。outbox 已登記。下一項 SCN-US-LIB。

### ★★ 使用者 2026-10-18 03:1x～03:3x（直接對 LAWWW2-C，被中斷的工具呼叫之後連續幾則；LAWWW-C 03:06、03:08 轉達同一件事）
- 原話：
  - 「其他你被我中斷的任務，你都繼續接回來」
  - 「你沒辦法查詢Indiana university Bloomington 校區的樣子嗎 還有路線」
  - 附一張空拍圖：「校門口左邊的空拍圖，校門口位於我給你的這張圖片的右下角」
  - 「其他地區你可以就是照樣子設計，但是可以先不要開放進出」
  - 「普通跟博雅館不是早就做好了嗎」「公館捷運也好了啊」「他不是請你繼續做那四個台大建築嗎」
- LAWWW-C 03:08 轉達（使用者 03:3x）：「我看錯……如果要整個改，那就沒關係就叫他直接改全部改，那四座」。**取代**：LAWWW-C 02:59「先停」、03:00「取消」，以及我 03:06 回的「四項取消」。
- **新順序**：
  1. ART-EXT-M1 男一舍：外觀換 Blender；室內沿用 dorm_hall.glb、dorm_room4.glb。**已交 `a9a77bde`**（README `test_shots/campus_male1/README.md`、patch `patches/campus_male1.diff`；另外發現的夜間窗燈錯誤 `patches/night_rereg.diff`）。
  2. ART-EXT-GATE 校門：整座（CK.gate／placeGate 的位置，校園、公館共用）。**已交 `a852d6f2`**（LAWWW-C 04:2x 選 A：照真的配置，門房在正中間、兩側通道；README `test_shots/campus_gate/README.md`、patch `patches/campus_gate.diff`；動到導航和出口，v9.10 發布後套）。
  3. ART-EXT-TEACH 普通、博雅：外觀＋室內（**第一批外觀已交 `a72be0cc`**，README `test_shots/campus_teach/README.md`、patch `patches/campus_teach_ext.diff`；第二批室內進行中：teach3d.js 的備用模型和家具都在 fb0／fb1 裡，B3.attachFormal 會一起藏，patch 要把家具搬到另一組）；室內照 boya_layout.js、putong_layout.js 做牆、地板、天花、樓梯、教室；家具、聽眾、小物、skybridge.glb 沿用。
  4. ART-EXT-MRT 捷運公館站出口：整座（TK.mrtExit 的位置）。
  5. SCN-US-02 v3 美國校園：照真的校區配置和路線改（空拍圖＋網路查文字資料）；其他地區照樣子做外觀、先不開放進出。
     - 查證（04:3x，網路搜尋摘要；沒有地圖、照片）：
       - Old Crescent 在 3rd Street 和 Indiana Avenue 之間；
       - 校門 Sample Gates 在 Kirkwood Avenue 入口，夾在 Franklin Hall 和 Bryan Hall 之間；
       - Franklin Hall（1907）是石灰岩＋紅瓦屋頂，在校門內側；
       - Student Building 也是石灰岩＋紅瓦；
       - Maxwell、Kirkwood Hall 是羅馬式石灰岩（光面和粗面石材交錯）；
       - Owen、Wylie Hall（1884）是紅磚；
       - Dunn's Woods 在校區西南側；
       - 法學院（Baier Hall，211 S Indiana Ave）在校區西南角。
     - 對照空拍圖（推測，等使用者確認）：
       - 圖的上方約朝東、下面那條路是 Indiana Avenue，右邊約朝南；
       - 最下面那棟有天窗中庭、紅瓦的大建築＝Franklin Hall；
       - 中間有塔樓的紅瓦建築＝Student Building；
       - 上方灰色石板屋頂、有圓塔的＝Maxwell／Kirkwood 一帶；
       - 右邊的樹林＝Dunn's Woods；
       - 校門在右下角（Franklin 的南邊）；
       - 法學院再往南，在圖外。
     - 遊戲裡不放真實校名、建築名（D77）。
  6. ART-US-SEASON：接回 WIP `53d9ef55`。
     - AA-C 03:43（P2，不用回）：AA_213 2-1 季節表已補（企劃分支 `23663329`）。
       - 日期：夏末 8/2～9/17；初秋 9/18～10/8；秋天 10/9～10/31（10 月中下旬最紅）；晚秋 11/1～11/22（大多落光、草黃褐）；初冬 11/23～12/1（禿樹、晨霜，感恩節飄初雪不積）；有雪 12/2～12/23（12/3～12/10 草地屋頂白、路面鏟乾淨，12/11 起殘雪）。
       - AA 建議 3D 四套：夏末（含初秋）／秋天／晚秋（含初冬）／有雪；飄雪用特效。
       - 天黑：8 月約 20:55 → 11/5 以後約 17:35 → 12 月約 17:20。
       - → 我的四季 key 照這個對：summer 8/2～10/8、autumn 10/9～10/31、bare 11/1～12/1、snow 12/2～。
  - 共同規則：位置、門口、導航、互動點照遊戲現在的；導航有變另外附給 LAWWW-C；現在的程式版留作備用；做好一處交一處（GLB＋遊戲內同角度前後截圖）；不擋 v9.10。
- **空拍圖的文字描述**（照片本身不進公開 repo）：俯視，上方約朝北；校門在圖外右下角。
  - 最下面：一條馬路（兩側人行道、行道樹，右下角馬路對面有停車場）。
  - 馬路北邊、圖的下半：一棟大建築（法學院）——紅瓦四坡屋頂、沿街和東側一排老虎窗，中間是一大片白色平屋頂、上面一塊玻璃天窗，平面是圍著中庭的 U／口字形。
  - 它的西北、圖的中間：另一棟紅瓦屋頂的建築——一個長形的山牆屋頂大廳、東北角一座方形塔樓、西側一個弧形的平台。
  - 兩棟之間：紅磚步道和一個小廣場。
  - 圖的上方：幾棟灰色石材、深灰石板屋頂的老建築，其中一棟有圓形塔樓（像城堡）；它們東邊有一個圓形的迴車道。
  - 左邊：較高的多層石材建築，旁邊一條往北的路。
  - 右半邊：一大片茂密的樹林，紅磚小路穿過。
  - 左下：草地和大樹。
  - 整個區域的步道都是紅磚，斜斜地穿過草地。
- 回覆給 LAWWW-C：03:2x ACK（四座照做；男一舍沒有 WIP 可推，最新 SHA `53d9ef55`）。

### ★ 最新佇列（LAWWW-C 派工 2026-10-17 23:49，D99／D100；取代下面舊的順序）
1. **ART-CH-XUN**：阿勳（盧正勳 econ_zhengxun）的 3D 人物（VRM）。經濟系第一優先、412 室友，遊戲裡現在是程序化的備用人物；外觀照 AA 的設定和既有經濟系人物（韋綸、唐睿、家豪）的風格；**交 LAWWW-C 驗收**（角色美術驗收改由 LAWWW-C，23:40 更正）。
2. **SCN-US-02**：美國校園（**已交 `1e6987cb`**，照使用者的法學院照片；LAWWW-C 接線）。
2a. **ART-L118-GROUND**（v9.10，LAWWW-C 02:10 派）：**已交 `aef6da80`**（README `test_shots/lane118_ground/README.md`、patch `patches/lane118_ground.diff`）。
2a-2. **校園四處方盒外觀**（**使用者 03:3x 確定照做、而且四座全部改，見上面 ★★**；LAWWW-C 02:41 派；使用者 10-18 02:3x「做好就開」，USER_WANTS X04；118 巷之後、ART-US-SEASON 之前）：ART-EXT-M1 男一舍 → ART-EXT-GATE 臺大校門 → ART-EXT-TEACH 普通／博雅教學館外觀 → ART-EXT-MRT 捷運公館站出口。D38：Blender → GLB，位置、導航阻擋照 zones3d.js 現在套件的座標；每處交 GLB＋遊戲內同角度前後截圖；READY_FOR_ART_REVIEW。
2b. **SCN-US-LIB**：法學院圖書館 3D（LAWWW-C 00:36 排；照片的文字描述在上面）。**已交 `f39f3aef`**（README `test_shots/us_lawlib/README.md`；v9.10 後整合）。
2c. **ART-US2-FIX-1018**（**已交 `356d77c6`；臥室 A 門口 `efaca16f`（reachability_all ALL PASS）**，README `test_shots/us2_fix_1018/README.md`、patch `patches/us2_fix_1018.diff`）：公寓廚房（BB-C 測出，LAWWW-C 00:50 派）：
    - 冰箱互動點 (−3.45, 1.8) 和爐子 (−2.95, 1.95) 半徑都 0.8，站冰箱前出「看爐子」→ 分開，加「站在冰箱門前最近的是冰箱」的檢查；
    - 窄廚房鏡頭在牆外、牆沒淡出（截圖 10_apt_kitchen）→ 牆放進淡出群組或限制鏡頭距離。
    - 交 patch 或 commit 給 LAWWW-C。
- **v9.10（使用者 01:0x，LAWWW-C 01:01 轉達）**：v9.10 只收經濟系、寒暑假、16 週、偶遇、傳訊息、題目、修錯。美國校園、圖書館、廚房小修**留在我的分支，v9.10 發布以後 LAWWW-C 再整合**；經濟系如果有缺的 3D 場景、人物問題，LAWWW-C 會派，**排在美國前面**。
3. **ART-US-SEASON**：美國 8 月出發的場景改夏末。
- 另外（LAWWW-C 23:39，順序待 LAWWW-C 確認）：經濟系那一年 3D 區域的缺口盤點（方盒、黑塊、穿模、沒放 Blender 外觀：例 共同教學館、大一女舍外觀）→ 清單＋截圖＋估時給 LAWWW-C 排；兩間超市之間走得過的停車場和馬路。
- 不排：日本交換場景；人物模板、人物造型改版（凍結）。使用者 10-18 00:0x（AA-C 轉達）：3D 人物的小錯誤（穿模，例 ART-PS-SKIRT-HAND 沛珊上樓梯手穿進裙子）可以修，整合時 LAWWW-C 把關。
- 已交付：DL-LAWWW2-3bff5ef4 美國區域（LAWWW-C 接進 4782cc29，已整合待 BB-C 測）。
- **取消／擱著（不是我的：2D 背景由 BB 向使用者要，D100）**：ART-KH-BUS 三張（客運車廂、高雄客運站、便利商店夜）、AA_276 三張（高雄港邊、台中小吃店、愛河夜景）。做到一半的 `bg_kh.py`＋預覽在 `test_shots/bg_kh_bus_wip/README.md`（寫明做到哪裡），不刪。

### A. 正在做／等使用者
0. **【P0 使用者 2026-10-17 01:0x 直接給 LAWWW2-B】ART-DORM-LOFT 宿舍房間改成台大實際的四人房**（附照片：上舖床＋下面書桌的床桌組、爬梯＋階梯收納櫃、衣櫃、抽屜櫃、白椅子、木紋地板、捲簾、冷氣）。
   - 原話：「台大宿舍是這樣 床在上面 書桌在下面 一個房間有四組這個／門口進來右邊是洗手間 再進來是四組這個／你改」
   - 取代：`dorm_interior.glb` 原本的雙人房（一張木床在地上、兩張書桌、書架）。
   - 做法：Blender 床桌組（一組模型、四份擺放）→ 203 房間重排（進門右邊洗手間）→ 先給使用者看小圖 → 交 LAWWW-B 改 `zones3d.js` dorm 區塊（導航、坐書桌、睡覺、窗的位置）。
   - 受影響：玩家每天起床的房間、坐書桌讀書、睡覺；經濟系那一年的紙箱（原本疊在床上）、阿勳的書桌與保齡球袋；SCN-V3-01 大二的房間也照這個做。
   - 等 AA-B：另外兩個床位的室友（我先做成有生活痕跡、人不在）。
   - 這期間暫停 BUG-COPLANAR-DEV 室內（霖澤館查完、還沒改檔）。
   - **狀態（02:4x 交班）**：已交付，LAWWW-B DORM-LOFT-L **整合中**（交付紀錄在 deliveries.json）。下一步：等整合後在遊戲裡截圖給使用者再看一次；宿舍大廳的疊面（BUG-COPLANAR-DEV 最後約 10 m²）接著做。
   - **進度（01:4x）**：`tools/blender/env_second/dorm_room4.py` v2（91122d9b），說明與算圖 `test_shots/dorm_loft/README.md`、配置 `layout_v2.json`。
     - **使用者 01:3x「宿舍ok」→ 已交 LAWWW-B**：`assets/models/env/second_ai/dorm_room4.glb`＋`dorm_room4.layout.json`（新檔名，等程式改好再換掉舊的 dorm_interior.glb）。遊戲內截圖在 README。
     - 室友照 AA_208（AA-B 65978067）：203＝L2 祐廷、R2 阿凱、L1 阿哲、R1 柏翰；412＝L2 祐廷、R2 阿勳、L1 韋綸、R1 唐睿；第一晚空床＋名牌。
     - LAWWW-B 已 ACK（DORM-LOFT-L，程式那一半），layout_v2 已給他。
     - 疊面掃描：一定會閃 0、遠處才閃 0。
1. **ART-GYM-BG1** 開學典禮背景（8/31）：
   - v1 被使用者退件（家長、幾何公仔「超醜」）；v2 頭髮太灰。
   - v3 照使用者給的實際典禮照片改（af2d5059）：白 T 恤學生、紅地毯台階、插畫背板、燈架、紅綠吊旗。
   - **使用者 00:3x：「開學典禮可以!!!」**（v3 通過）。正式版 `a3529675` 已交，LAWWW-B 已登記（已整合待測試）；等使用者在遊戲裡再看一次。
   - 腳本 `bg_gym_ceremony.py`＋`vrm_crowd.py`。
   - 畢業典禮版（學士服）之後做：SCN-V5-02／CG-9。
2. **ART-GG-SIGNS** 公館招牌：六家（阿鳳、舊路、藥局、輪轉、影印、日日定食，橫＋直立）**已交 LAWWW-B**，說明 `test_shots/gg_signs/README.md`，測試 patch `patches/gg_signs_test.patch`（ALL PASS 40 項）。
   - 公館 GLB 重建成效能版（物件 815 → 436、三角形 83k → 54k），LAWWW-B 已整合（已整合待測試）。
   - **【表外】ART-GG-SIGNS-2（交班時正在做，見上面「C. 正在做的工作」）**：其餘招牌 S1～S17 全部貼進去，GLB＋patch 已 push（`b75e50a5`，ALL PASS 34），還沒拍前後截圖、還沒交付。
   - **衍生 ART-BALCONY-POTS**（總表已有）：陽台大葉盆栽（效能第六輪換成模型葉子）從街上幾乎看不到；溫州街、公館一起改（放花架或換大一點的植物）→ 重建 → 兩條街整合測試。
3. **BUG-COPLANAR-DEV** 開發組 GLB 疊面：
   - 已交：萬才館外觀（eb3a3bad）、霖澤館外觀（2b78d35d）；室內霖澤館 63→0（703f5231）、201 11→0（209e7eca）、萬才館 54→4（9dc6727f）、總圖 129→27（f1734e3f）、法圖 120→93（6f10b1fe），LAWWW-B 已收進開發分支，瀏覽器流程測試排在 QA-HANDOFF-B1。
   - 還沒做：宿舍大廳約 10 m²（等四人房接進來）；萬才館、總圖、法圖剩下的大多是貼牆、貼地的接觸面，要在遊戲裡確認看不看得到再決定改不改。

### B. 第一週～大一（主線先）
4. **ART-POLISH** 精修（開局），裡面還沒做的：
   - 第 0 批基準截圖補齊；
   - 第 2 批全域光影（tone mapping Neutral、皮膚明暗 C.LOOK）同鏡頭驗證 → patch 給 LAWWW-B；
   - **ART-VSLICE** 垂直切片：溫州街 Café 前黃昏做到商業水準（後製、黃昏光、街道 AO＋路面、人物光影）；
   - **ART-WZ0** 溫州街舊店面翻修（盤點缺哪幾層 → 店面組件 → 套用 → 前後白天晚上截圖）。
5. **BUG-WZFLICKER-2**（尾巴）：
   - 溫州街還有三處小疊面：x 10.35 二樓招牌×亮燈窗玻璃、x 41.4 店面玻璃×窗框細條、x −4.3 金屬條。
   - 公館、118 巷還有鐵捲門×牆腳護牆、重疊冷氣，要重建才修得到；重建前先查結構差異。
   - 美國公寓 7 對、小公園 11 對小的。
6. **ART-17** 缺圖 2D 背景（BG-04 `nccu_dorm` 等使用者照片；BG-18 可昕那一端已整合待測試），照最早出現排：ART-BG16 `ntu_linze`、ART-BG17 `ntu_avenue`（K 系列，v0／大一）、ART-BG14、BG19、BG09／10／12。
   - ART-BG08（`car_*.webp`）、ART-BG20（`soymilk_shop.webp`）：總表已改成「已整合待測試」（等使用者看畫面）。
7. **ART-04** 黃金葛 `prop_pothos.glb`：S1～S4 四種大小＋遊戲內截圖（書桌左前角）。

### C. 經濟系那一年（v0）
8. SCN-V0-01 經濟系系館室內（等 AA-B 規格）
9. ART-V0-DORM
10. ART-CH-XUN／PINYU／WEILUN／TANGRUI／JIAHAO／WEI
11. ART-13 明軒、小語模型

### D. 大二以後
12. SCN-V3-01 第二個房間：`dorm_y2_items.glb` 已建（8a1af723 WIP），待遊戲內截圖、112 窗景。
13. SCN-V3-03 模擬法庭
14. SCN-V4-01
15. SCN-V5-01
16. SCN-V5-02 畢業典禮
17. **ART-BG-AA185**（別名 ART-SHOP1）AA_185 §8 的 2D 背景：
    - 公館機車行（BB-B ART-SHOP1 v2 道具＋升降台上的新機車）；
    - 老國小操場；
    - 視訊的國外住處；
    - 日本教室。
18. 大三下（交換）：SCN-US-01 美國公寓社區（MODEL_READY，家具 ART-US1～US3 一起）→ VAC-A2 桃園機場（AA_201：3/25 10:00 以安送機）→ SCN-US-03 美式超市 → SCN-US-02 美國校園街道。

### E. 等別人／素材
19. ART-10 自強十舍（等使用者照片）
20. ART-14 約會底圖
21. ART-15 v3～v6 CG
22. ART-16 新立繪（BB-B 要圖）

### F. 其他答應過、還沒做完的
23. **ART-METHOD6** 方法交接：AA-B 的驗證件（土地公廟供品組）還沒交來驗收（方法交接表第 6 項）。
24. **ART-BIKES2-F** 腳踏車 v2 後續：
    - 老鐵馬、登山車比導航阻擋長 8 cm；
    - 老鐵馬要鏽和褪色；
    - 車籃裡的東西；
    - 淑女車再分款。
25. FIX-WZ-PERF：總表已改成「已實作待整合」，LAWWW-B 在核對 1e445818 有沒有隨小公園 v7 進來。

26. ~~**VAC-A2** 機場 2D 底圖~~：**取消／被取代：DL-BB-f80f574c**（使用者已生成 `airport_departure`、`airport_arrival`，BB 檢查通過；LAWWW-C 04:25 轉告，LAWWW2-C 04:3x 記）。**3D 機場 VAC-A2 照舊**（第 18 項的順序）。

- 沒有排程中的 send_later：`list_triggers` 是空的。
- 對話裡的承諾都已經列在上面。

## ⚠ 使用者 2026-10-16 約 20:2x UTC 直接給 LAWWW2-B（P0）：美術方法交接（SOP）＋得獎遊戲標準告訴 AA／BB 並照標準審查＋機車腳踏車不要同一個款式

- **原話摘要**：
  - AA、BB 幫忙做美術時，要跟他們說標準是「得遊戲大獎，不要很像廉價拼接遊戲、不要有方塊感」；用這個標準審查他們，可以直接改他們的成果。
  - 「遊戲裡面機車和腳踏車都只是同個模板換顏色，太假了，請你搜尋各大品牌機車，國內外都要有，不要抄襲，但要參考」；最後又說「你還是沒有解決啊……不要只改顏色」。
  - 下午討論的標準和**我實際怎麼精修（工具、檢測標準）**要寫成 SOP 進規則，讓幫忙的 AI、交接後原本帳號的 LAWWW2 都清楚。
  - 新方法要加進規則，**舊的不刪、舊做法也不禁止**。
  - 方向：繪本感半寫實環境＋日系動畫人物，Steam 販售等級的精緻生活遊戲。
- **使用者列的 1～6**：
  1. 可照著做的製作 SOP（Blender 函式、腳本、輸入輸出、參數、順序、指令）；
  2. 溫州街示範案例（前後同角度截圖、腳本、材質做法、參數、驗收紀錄）；
  3. 同步 AA-B、BB-B（第 9 節的 SHA、讀法，要他們更新 aa_support／bb_support README 的具體技術）；
  4. AA-B、BB-B 各自 ACK，說明下一批怎麼採用；交付逐項記（輪廓與倒角、材質、AO、磨損、生活痕跡、比例、效能、遊戲截圖），沒做到的寫原因；舊成果分「舊標準已通過」「新標準已通過」；
  5. HANDOFF.md、WORK_RULES.md 最上方加強制閱讀指引；通知 LAWWW-B 納入跨帳號交接；帳號 A 的 LAWWW2 接班時先讀、合併（不叫醒、不改它的分支）；
  6. 實際確認 AA-B、BB-B 拿得到規則和工具、照 SOP 做出一件；沒有 ACK、沒有驗證就標未完成。
- **順序**：先完成方法交接，再繼續溫州街精修；**寫文件不等於品質已經提升**。之後第一件美術工作＝機車、腳踏車多車型（參考研究已在背景跑）。
- **暫停**：黃金葛、第二個房間物件的遊戲內截圖與交付；祐廷臉試做的截圖矩陣讓它在背景拍完，交件排在方法交接之後。
- **進度**（完成一項補一項，附 SHA）：見下方「方法交接進度」。

### 機車、腳踏車多車型計畫（2026-10-16 20:2x，使用者：不要同一個款式只換顏色）
- **現況**：`scooter.glb` 只有 scooter_a（現代）、scooter_b（復古）兩款，每台約 1,286 三角形，遊戲 `attachWzScooters` 三台一台復古、其他乘顏色（InstancedMesh）；腳踏車只有 `street_props.glb` 的 `bike_city` 一款（`W3.formalBike` 換車架色）。
- **參考**：`research/vehicles_research.md`（9 種機車原型、9 種腳踏車、停車排的樣子、建模建議；數字來自搜尋摘要）。不抄外型、不放商標、車牌空白。
- **機車**：新腳本 `scooters_v2.py`，原型參數化（車殼斷面、輪徑、頭燈位置、車尾、踏板平底／中央隧道、排氣管有無、後照鏡、配件），每個原型自己的配色（glTF extras `palette`、`weight`＝街上比例）：
  S1 國民通勤（龍頭燈舊款／車殼燈新款兩種前殼）、S2 運動型、S5 電動換電型（沒排氣管、沒 CVT 殼）、S4 復古圓弧、S7 50cc 舊款、S3 大型速克達、S6 方塊越野、S9 彎樑；S8 外送＝S1／S5 加外送箱；另外配件變化（後箱、手機架、安全帽、坐墊套、機車罩）。
  預算：溫州街三角形只剩約 3 千 → 每台平均 ≤1,300～1,350；遊戲端改成「每台挑原型＋從原型的配色挑色、同材質合成一個網格」（draw call 6 → 3），patch 給 LAWWW-B。舊的 scooter_a／b 名稱保留（沒套 patch 照舊能用）。
- **腳踏車**：`street_props.py` 加 bike_share（公共單車形式、自己的配色）、bike_road（細管 700C，彎把／直把）、bike_mtb、bike_fold（16／20 吋）、bike_old（老鐵馬）；車架照舊頂點色、共用材質（停車架整排合併不加 draw call）；`W3.formalBike` 照位置挑款式（patch）。遊戲裡騎的車是 `bike3d.js`（LAWWW-B），要換再說。
- **順序（短回合）**：① S1 兩款＋S2＋S5＋Blender 並排渲染 → ② S4、S7、S3、S6、S9＋配件 → ③ 遊戲端 patch＋溫州街、公館遊戲內前後截圖＋整合效能測試 → ④ 腳踏車 → 照 ART_SOP 八項紀錄交件。
- **進度（20:5x，3e685b1f）**：12 款建得出來（S1A、S1B、S2、S5、S4、S7、S3、S6、S9＋外送箱 S1B_D、掛安全帽 S5_H、機車罩 S1A_C），每台 1,800～2,300 三角形（機車罩 784）。上色並排渲染（Blender，沒進遊戲）自己先看，**還沒到標準**：
  1. S1A／S1B／S2／S5／S4／S6／S7 側面輪廓幾乎一樣，只有 S9 彎樑、S3 大型（擋風鏡）、外送箱、機車罩一眼看得出不同。
  2. 前擋太窄太薄，側面像一根直立的板子（真的車前擋＋腳踏內板是有厚度的一整塊，下面約 25～30 cm 深）。
  3. 後車身像一顆膠囊浮在引擎上面：下緣應該從腳踏板高度往後上揚、蓋住後輪上方，車尾收窄。
  4. 後照鏡是方板、方向燈和頭燈是貼在表面的小方塊（像貼紙）。要改成圓的鏡子，燈貼著車殼曲面（從車殼的參數曲面取一塊、往外推 2 mm）。
  5. 機車罩是白色的一團：要改灰／銀／深藍布、有皺褶、看得出鏡子的凸起。
- **機車 v2 已交 LAWWW-B（21:5x，f5b7bdb3）**：12 款＋遠處簡化版、`patches/scooters_v2.patch`（套得上 62cb7307）、說明 `test_shots/scooters_v2/README.md`；溫州街、公館整合測試 ALL PASS（溫州街 287／270／302 calls、38.8／36.9／37.4 萬，比之前少）。等 LAWWW-B 整合 SHA。**下一件：腳踏車多款式**，再來 ART-GYM-BG1（開學典禮背景）。
- **遊戲端改法（取代上面「draw call 6 → 3」）**：每一排機車（溫州街照位置分 6～8 段、公館照現有 grp）合成**一個網格、一個材質**（頂點色；粗糙度／金屬度用 3×1 查表貼圖，UV 指到 車殼／塑膠橡膠／金屬 那一格）＋`THREE.LOD`（遠處換每台約 450 三角形的簡化版）。draw call 和現在一樣或更少，看不到的那一段整段剔除，遠處三角形少。GLB 每款多一個 `_lod1` 節點。

### 21:3x～22:1x 新派工與規則（LAWWW-B／AA-B／BB-B）
- **HV-10（D92，A／B／C 三帳號任意輪值）**：已登記 `docs/handoff/duty_LAWWW2.json`（工具寫的，8b1cdbea），沒有未整合的 WIP 分支。換班規則看 RULE_SOURCE 的 `AI_SESSION_HANDOFF.md` 第 0a、4、5、7、8 節。
- **ART-GYM-BG1** 開學典禮 2D 背景：從 3F 主球場模型算圖，畢業典禮共用。
- **VAC-A2** 3D 機場：桃園出境大廳＋報到櫃台＋送機點，走得進去，航空公司虛構。
  - AA-B 給的：送機在報到櫃台前→安檢入口；回國在入境出口欄杆；早上、傍晚到晚上兩種光；出境候機椅、接機長椅。
  - 細節等 AA_201。
- **ART-GG-SIGNS** 公館招牌換使用者生成的設計圖：
  - 尺寸表 `requests/ART-GG-SIGNS_尺寸表.md`（735f0830）。
  - BB-B 提示詞 BB_176（eff96dab，照我建議改成畫面中間一條橫帶／直帶）。
  - 等使用者生成、BB-B 檢查後通知。換法照 G03：`sk_sign_<店>` 節點、拿掉 `*_FACE_`，`zones3d.js` 不用改。
- **BUG-WZFLICKER**（LAWWW-B 的）：溫州街新店面牆、舊路書店書架閃爍。**已交兩輪（23:1x，8e58f030）**，說明在 `test_shots/wz_flicker/README.md`。
  - 第一輪：舊路書店 a5de0c2e；溫州街 4541df35、8dc8e5f8。LAWWW-B 已整合，等使用者 iPhone 看。
  - 第二輪 6e5aa462：
    - 改了窗內房間、窗台、重疊冷氣、門×護牆；
    - 「一定會閃」5,263 → 1,087，剩下的大多在牆裡面；
    - 三處小的還沒修：x 10.35 招牌×窗、x 41.4 店面玻璃×窗框、x −4.3 金屬條。
  - 工具 `check_coplanar.py` 可以一次掃整個資料夾（`--md`、`--json`），LAWWW-B 要加進回歸。
  - **下一步**：
    - 用新分類掃全部 86 個 GLB；
    - 修我做的那幾個（小公園、涼亭、公館、118 巷、美國公寓、體育館）；
    - 萬才館、霖澤館、宿舍大廳只列清單給 LAWWW-B。
- **（00:1x 更新）**
  - **Café 地板**：P0 改成自流坪水泥（ef689b67），LAWWW-B 已整合。
  - **疊面第三、四輪**：涼亭、體育館主球場、公館、118 巷（`patch_window_protos.py`），兩點半 Café 室內外（4faeec0b）。
  - **開學典禮背景**：v1 被使用者退件——家長、幾何公仔「超醜」。
    - v2 改用遊戲的學生正式人物坐姿（`vrm_crowd.py`），上層看台空著，大螢幕轉播講台。
    - 預覽 `test_shots/bg_gym_ceremony/v2_preview.jpg`（b84f88a6）已給使用者，**等使用者點頭才算 1920×1080 正式版**。
  - **使用者 00:0x（LAWWW-B 轉）**：美國篇 3D、機場 3D 都是 LAWWW2 的。順序：
    1. SCN-US-01 美國公寓社區做到 MODEL_READY（家具 US1～US3 一起）
    2. VAC-A2 桃園機場（AA_201：3/25 10:00 以安送機）
    3. SCN-US-03 美式超市
    4. SCN-US-02 美國校園街道
- **小公園座位點**：同步 LAWWW-B 49bc617d（39f1c56d）。
- **ART-GYM-BG1** 進行中：腳本 `tools/blender/env_second/bg_gym_ceremony.py`（WIP 4d270e83）。
  - 3F 主球場模型；
  - 4,029 個坐著的人，28 款、隨機顏色、不畫五官；
  - 舞台上 7 位來賓＋致詞的人；
  - 背板「開學典禮」；
  - 鏡頭在中央走道後面、24 mm、景深。
  - 全解析度試算中。
- **VAC-A1** 盤點已交 AA-B（4e4f4f36）。旅館、日本街景由使用者給 CG，我不做。
- **排序（23:1x 更新）**：疊面掃描與修正（使用者問「為什麼這麼多肉眼看得出來的 bug」）→ ART-GYM-BG1 → VAC-A2；招牌的圖來了就插進來。

### 收到（P2）：AA-B 21:09 轉告使用者 21:08 決定——16 週制、寒暑假可以玩（AA_197 第 0 節，企劃分支 a119fceb）
- 我的部分：只有需要新增或修正宿舍、假期場景、人物所在地的美術時才介入，**不重做已完成的 3D 校園**；目前沒有新派工，要由 LAWWW-B 排進佇列。不需回覆。

### 方法交接進度（2026-10-16 20:2x 起）
| # | 項目 | 狀態 | SHA |
|---|---|---|---|
| 1 | SOP 文件 `ART_SOP.md` | v1 完成 | 69e4b181 |
| 2 | 示範案例（溫州街）`sop_demo/README.md` | 完成 | 644a322f |
| 3 | 同步 AA-B、BB-B | 20:2x 已送出（DELIVERED；附 ART_SOP 69e4b181、SCENE_RULES 1c3bdefd／54ff20d5、示範 644a322f、入口 d8cfa784） | |
| 4 | AA-B、BB-B ACK＋採用計畫＋README 具體做法＋舊成果分舊／新標準 | **完成**：**AA-B** 20:22 ACK，README「AA-B 的做法」92d99dee（20:24 核對），舊成果全部「舊標準已通過」。**BB-B** 20:22 ACK，README「BB-B 的做法」＋舊成果狀態表 ad25b0f3（21:3x 我核對：工具、七步流程、指令、八項紀錄寫法；GYM-P1、P2／P3a、TUTOR1、US3、PARK1、PARK3 舊標準，ART-SHOP1 新標準）；已併進我這份 README | 92d99dee、ad25b0f3 |
| 5 | HANDOFF／WORK_RULES 最上方強制閱讀＋通知 LAWWW-B | 完成：強制閱讀已加；**LAWWW-B 20:22 ACK**，已登記 AI_SESSION_HANDOFF 第 7.2 節（LAWWW2 啟動提示詞）、第 13 節 HV-9a（LAWWW-B 5607bf59） | d8cfa784／5607bf59 |
| 6 | AA-B、BB-B 照 SOP 實作驗證 | **BB-B：通過**（ART-SHOP1 v2 d9388b2a，21:3x 我照 SOP 3-2／第 4 節驗收：八項紀錄齊、三件必修改好；合併 5d5bb8aa）。**AA-B：未完成**（土地公廟供品組，劇情空檔開工、開工前通知）。BB-B 的 README 做法段已補（ad25b0f3） | 5d5bb8aa |
| — | 機車、腳踏車多車型（方法交接之後） | 機車 12 款＋遠處簡化版做好、遊戲端接法在測試工作樹跑過（溫州街、公館前後截圖）；配色調亮後重拍中；腳踏車還沒做。進度見上面「機車、腳踏車多車型計畫」 | 8eee3f0b |

## ⚠ 使用者 2026-10-16 05:1x～05:2x UTC 正式指示（三則）：現有 3D 美術品質修復與精修——「玩家打開遊戲覺得畫面漂亮」才算完成

- **要求**：
  - 修好、精修**現有的** 3D（人物臉部五官與辨識度、材質與光影、場景細節、遊戲實際視角下的構圖／遮擋／穿模、效能）。
  - 不換引擎、不換工具（不改用 VRoid／Unreal／Unity）、不重做全部人物、不推倒場景、不以新增模型或道具代替修復、不用加面數／堆物件／加 bloom 掩蓋問題。
  - 必要時可以局部重建，要說明原因、維持相容。
  - 研究資料**只讀免費公開的內容**，付費一律跳過，不繞過限制。
- **流程（Visual Feedback Loop）**：
  1. 用實際遊戲畫面（Playwright）診斷：A 人物造型、B 人物材質渲染、C 場景、D Three.js 呈現（color space、tone mapping、陰影、FOV、霧）。
  2. 一次一個角色或場景，保留修改前的畫面。
  3. 修改後用同鏡頭、同時間、同光線截圖，並和 2D 設定比較；變差就退回。
  4. **先完成一個看得出明顯進步的完整案例**，再套用到其他資產。
- **優先順序**：
  1. 玩家和主要 NPC 的臉、頭髮、身形
  2. 最常出現的校園
  3. 人物與場景的光影協調
  4. 宿舍、教室、街道
  5. 其他
  - LAWWW-B 提醒：先做 v0／v1 玩家最先看到的畫面（D81）。
- **每批驗收**：
  - 功能不退化、模型能載入；
  - 遊戲截圖可以比較；
  - 列出修正前的問題、採取的修正；
  - 修正後真的有改善，沒改善的繼續修，不硬說完成。
- **分工**：
  - 渲染管線和 src/ 共用程式做成 patch，給 LAWWW-B 整合、跑回歸。
  - 人物交 BB-B 驗收（D59），只向 BB-B 確認角色設定，修復責任不轉給 BB。
  - 場景的 ART_APPROVED 照舊由使用者確認。
- **對佇列的影響**：
  - LAWWW-B 05:15Z ACK：新製作（BG15～17、阿勳 3D、美國公寓、BG13…）沒有卡劇情，排到精修後面。
  - ART-05 的遊戲內人物截圖改成精修第 0 批的人物基準。
- **研究來源的可及性（照實記錄）**：
  - 沙盒對外只通 GitHub：threejs.org、threejs-journey.com 都連不到。
  - Three.js Color Management 讀的是 three.js 官方 GitHub 上同一份手冊（r160 `docs/manual/en/introduction/Color-management.html`）。
  - blender-skills 的 anime-style SKILL.md 讀到了；它引用的兩份參考檔不在頁面上，沒讀到。
  - ArtStation 的 Stylized Anime Room 是付費商品，跳過。
  - Three.js Journey、Blender Studio 課程的付費部分跳過，網站本身也連不到。
- **進度**：見下方「精修」各批（隨時更新）。

## ⚠ 使用者 2026-10-16 07:0x UTC：招牌的字體太假，要參考正常招牌的設計；需要設計圖請 BB 跟使用者要

- 原話：「招牌的字體就太假了　請參考正常招牌　通常會有設計　需要我設計圖請BB跟我要　先繼續做別的　我不會馬上回」。
- 07:0x 已經請 BB-B 寫提示詞，向使用者要溫州街 12 間店（含新店）的招牌正面平面圖，格式和清單在那則訊息裡；公館的排在之後。
- 圖到了之前：招牌照舊由遊戲用字畫（SIGN_FACE），先做小公園、三家店外觀、室內。圖到了，LAWWW2-B 切圖做成招牌貼圖（燈箱晚上會亮），取代 SIGN_FACE。

## ⚠ 使用者 2026-10-16 06:3x～06:4x UTC：精修排後面，先做 AA-B 發包的溫州街；三家店室內都要 3D

- 06:3x 原話：「精修可以排後面再做　AA有發包給你溫州街新店面那個先來」。
- 06:4x 原話：「三家店室內都要3D!」
- **AA-B 發包**：`AA_164`（企劃線 `a64200d4`、`1fca4391`）第 7b、8 節，美術全部由 LAWWW2-B 負責。
  - ART-WZ0：舊店面翻修；先盤點，列出每間缺哪幾層。
  - ART-WZ1：小公園。
  - ART-WZ2：三家新店外觀＋冰店。
  - ART-WZ3：三家店的 **3D 室內**（使用者 06:4x）。我交付 GLB＋`src/data/<店>_layout.js`；區域程式、導航由 LAWWW-B 接。
  - ART-WZ4：Café 配置，座位總數不減。
  - ART-WZ5：貓。
- **暫停**（都是 checkpoint `28deae9e`，不整合）：
  - 精修：post3d.js、溫州街路面貼圖、人物精修第 2 批以後。
  - 祐廷精修第 1 批 `da737424`：BB-B 驗收五項通過，可以整合；要修的三項（圓領收高收窄、右肩亮區、褲腳）之後再做。
- **向 AA-B 確認中的四點**（先照括號做）：
  - A1 大學影印 → 阿德影印輸出。
  - A 側日式宿舍 → 一盞茶屋。
  - 小公園在現有 11.6×10.4 範圍內照 5-2 排；要不要擴大，等 LAWWW-B 決定。
  - 早午餐、冰店放在東端附近。

## ⚠ 使用者 2026-10-16 07:3x UTC（給四個 AI）：接下來約十小時不回覆，照已授權的清單自主推進

- **LAWWW2 的優先順序**：溫州街店面、小公園、三家 3D 室內。
- **每完成一個可整合的部分就交給 LAWWW-B，不要整包做完才交。**
- 完成一項、commit、寫報告、等截圖、等回覆，都不是停下來的理由。沒有工作就向其他值班的 AI 要。
- 不新增沒授權的重大設定；不替其他 AI 決定它負責的美術或故事。
- 使用者回來要看：實際新增的可玩內容、已交付的美術資產、還沒完成的清單、正式版本狀態。

### 十小時自主期間的交付紀錄（LAWWW2-B；隨時更新；分支 `claude/funny-albattani-iawshm`）

| 時間（UTC） | 交付給 LAWWW-B | commit | 狀態 |
|---|---|---|---|
| 07:4x | 小公園 v3（去積木化） | 48aed1c9、ceb545f2 | LAWWW-B 已接（861ec9f1） |
| 07:5x | 溫州街 v5（13 張設計稿招牌、B5 茶飲＋冰菓室、公寓大門、背面）＋一盞茶屋外觀 | 31323eb9 | LAWWW-B 已接（861ec9f1） |
| 08:0x | 三家新店 3D 室內（半熟、阿德影印、一盞）＋配置 | ce586623 | LAWWW-B 已接成 wz_brunch／wz_print／wz_teahouse 三個區域（861ec9f1） |
| 08:2x | ART-WZ6 故事小物件 7 件（AA-B 做、我驗收；修平滑著色） | 8d8fe7d4 | 已交，等 LAWWW-B 擺 |
| 08:2x | 新體育館第一階段（大廳＋1F 球場）GLB＋配置 v2 | 4d19c88d | 已交，等 LAWWW-B 建區域 |
| 08:3x | ART-WZ5 溫州街的貓 v1（AA-B 做、我驗收） | 6a05f12d | 已交；v2 小修排在 AA-B 的 V0-ART-DORM 之後 |
| 08:3x | 2D 背景 BG-13／15／16／17（課輔班門口、社科院、霖澤館、椰林大道） | adf126c5 | 已交 |
| 08:4x | 兩點半 Café ART-WZ4（座位 +7、沙發、門鈴、傘桶、班表）＋patch 說明 | bbc566da | 已交，LAWWW-B 要照 `patches/cafe_wz4.md` 改 zones3d |
| 08:5x | 新體育館第二階段：3F 主球場（看台、上層看台、大螢幕、吊掛記分板；舞台＋典禮／演講／演唱會三套布置） | 3effc0e0 | 已交，等 LAWWW-B 建 gym_arena 區域 |
| 09:0x | 溫州街 v6c、三家店室內 v2（一盞天花板單面、影印店、模型葉子）、公館清葉茶行／日日便利、Café WZ4b | b7a091b8 | 已交；在 LAWWW-B 的 861ec9f1 版上拍過遊戲內截圖 |
| 09:0x | V0-ART-DORM（AA-B 做、我驗收）；GYM-P1 健身器材（BB-B 做、我驗收，第三階段才用） | f2bebf72 | DORM 已交 |
| 09:1x | BG-11 山上看星星（D09 調成夜晚） | 10c49bf8 | 已交 |
| 09:1x | 溫州街 v6d（定食店碗盤架＋布暖簾、模型葉子盆栽）、一盞 v3（緣側橫樑淡出）、冰菓室冬天驗收 | f799ba65 | 已交 |
| 09:2x | 貓 v2（AA-B 做、我驗收） | 9ec16071 | 已交 |
| 09:2x | 體育館：1F SET_NETS、3F 大牆、入口通道（BB-B 規格核對） | f1e732f8 | 已交 |
| 09:3x | 新體育館第三階段 B1（大廳、閘門、走廊、健身中心、游泳池）layout v4＋gym_b1.glb | f3180c69 | 已交 |
| 09:3x | V0-ART-DORM2：阿凱的東西分成 ROOMMATE_KAI 節點 | e8c4aaf0 | 已交 |
| 09:3x | BG-08 車上（早上、晚上、雨天） | 702a2838 | 已交 |
| 09:3x | ART-WZ7 溫州街路邊小物（AA-B 做、我驗收） | 97f315ca | 已交；擺上溫州街等效能目標達到後再做 |
| 09:4x～09:5x | B1 v5（櫃台、置物櫃、體重計、毛巾籃、飲水機、救生員椅）；GYM-P2／P3a v2（BB-B） | cfd5b0f8、5a5a52af | 已交 |
| 10:5x | 溫州街效能第一輪（392／355／448 → 337／301／372） | 86df67a3 | LAWWW-B 已接 |
| 11:0x～11:1x | B1 天花板單面實測；B1 v6 隔間牆 WALL_（partition）；XUN_DESK 遊戲內截圖 | 52f00c94、53c57931、cc4f94ef | 已交 |
| 11:2x | ART-SOY1 豆漿店道具（AA-B）、寶特瓶袋 v2 驗收 | 12a33672 | 已收 |
| 12:1x | BG-20 豆漿店 | aca65794 | 已交（READY_FOR_ART_REVIEW） |
| 12:1x | ART-TUTOR1 家教道具（BB-B）、ART-US1 美國公寓客廳家具（AA-B）驗收 | eb9f392e | 已收 |
| 12:2x | 溫州街效能第二輪（LAWWW-B 量 280／258／298 次 draw call、44.4／42.0／45.6 萬三角形） | 35513f11 | LAWWW-B 已接（0b41a1e8），v9.9 用這一版 |
| 12:4x | BG-21 學生家的客廳（tutor_home） | 1c025d9a | 已交（READY_FOR_ART_REVIEW） |
| 12:4x～12:5x | ART-US2 廚房（AA-B）、ART-US3 臥室（BB-B）驗收；LICENSES.md 補今天八件 | 439763c6、586eface | 已收 |
| 13:0x | SCN-US-01 美國公寓室內（客廳、廚房、臥室家具都擺進去） | da9fb2b6 | 已交（MODEL_READY），不趕 v9.9 |
| 13:2x | ART-US4 衛浴＋陽台小物（AA-B）驗收、擺進美國公寓；浴缸短牆、白磁磚、窗外地面 | 4a22c067 | 已交（MODEL_READY） |
| 13:3x | 溫州街效能第三輪：修第二輪的貼圖糊掉（木紋、磁磚、馬賽克…直條紋）＋三角形 −1.3 萬；LAWWW-B 的測試 303／286／321 次 draw call、43.1／40.7／44.3 萬三角形 | e680d48a | LAWWW-B 選 A，進 v9.9 RC2（147c573e） |
| 13:4x | 三家新店室內的遊戲內截圖（READY_FOR_ART_REVIEW）；一盞和室土牆去污漬（b3lib `contrast`） | dc869911 | 截圖已登記；土牆下一版 |
| 14:0x | 溫州街效能第四輪：lib2 `atlas_tiles` 2D 貼圖集（不糊），draw call 289／272／307（三個都 ≤310） | 5a78a151 | 已交，下一版 |
| 14:1x | 溫州街效能第五輪（三角形 43.3／40.9／44.5 → 42.1／39.7／43.3 萬，draw call 不變） | f4c8551c | 已交 |
| 14:2x | ART-WZ7 路邊小物擺上溫州街三件（外送保溫箱＋安全帽、回收紙箱捆） | 1e7c9a04 | 已交 |
| 14:4x | 小公園 v4：土地公廟去積木化（供桌、神桌、金身、匾、對聯；花籬不穿廟） | b0077e30 | 已交 |
| 16:0x | SCENE_RULES 第 9 節：支援素材的驗收清單（得獎遊戲標準；回 AA-B 的 P1） | 1c3bdefd | AA-B 已收 |
| 16:1x | 精修第 3 批：溫州街路面（主巷、Café 前、三條側巷；機車停車格、斑馬線、水溝蓋、紅線）＋入夜變暗 patch；ART-PARK1 遊戲場（BB-B）擺進小公園、橡膠地墊改顆粒貼圖；機車輪胎 14 邊 | （這一批） | 見下面「進行中」 |
| 16:5x | 路面合成一張貼圖、一個材質＋柏油顆粒法線（draw call 311 → 309） | 26134a0f | LAWWW-B 已收（ACK 17:24） |
| 17:4x | ART-PARK2 鞦韆＋三件體健器材（AA-B 做、我驗收：毛巾改淺藍、綠漆調亮）擺進小公園 v6（`place_support()`）；溫州街效能第六輪（輪胎 12 邊、定食店碗盤 6 邊）：wz_street_integration **ALL PASS 36 項**，draw call 291／273／307、三角形 41.8／39.1／41.9 萬（第一次三個都 ≤42 萬） | （這一批） | 交 LAWWW-B |
| 17:5x | ART-01 社科院：晚上圖書館的樹狀柱不再整片白亮（ck_glass_lit 加自發光漸層） | 7e84496c | 交 LAWWW-B |
| 18:0x | 小公園 v7：ART-PARK3 象棋桌凳、直飲台、腳踏車架（BB-B 做、我驗收；車架 layout yaw π）；美國公寓：ART-US2 第 9 節補強（AA-B）擺進去＋修我 13:0x 的擺放 bug（洗碗機卡在爐子裡） | 5e688f34 | 交 LAWWW-B |
| 18:1x | 小公園 v8：公布欄加頂上的公園名牌（原本的木牌擋住公告） | a4c05720 | 已交 |
| 18:5x | ART-BG-COURT `ntu_court_night`（哲 2 的新體育館旁籃球場，晚上；Blender `bg_court.py`）；遊戲內 ADV 截圖 390×844／844×390；第二版鏡頭左轉 6°，手機直向看得到整塊籃板 | 6e72e346 | 交 BB-B 驗收、交 LAWWW-B 填 `S.BG.ntu_court_night.image` |
| 19:0x | ART-PT-SIS-FORMAL 學姊面試西裝立繪 `heroine_05/formal/`（neutral 全身去背＋serious、smile 換臉；企劃線 heroine05_interview.webp）；遊戲內 ADV 截圖 | 4e812ce5 | **BB-B 19:16 三張 ART_APPROVED**；LAWWW-B 合入（DLV-1016-372） |
| 20:3x | 祐廷 3D 臉試做（BB_131 第 11 節；`vroid_yuting_facetest.vrm`、`?facetest`、patch `assets3d_facetest.patch`；`test_shots/facetest_yuting/`） | 8496bf9d | **BB-B 20:42 驗收通過**（4d3e2757），等使用者決定用不用；BB-B 說離參考圖最遠的是頭髮和下顎線（這次不做） |

**⚠ D90／HV-9（使用者 10-17 04:01 台北；LAWWW-B 20:09 轉達，我 20:10 讀到、ACK）**：平台只在回合結束時送使用者訊息 → **短回合**（一個工作單位、最多約 10 分鐘或 30 次工具）、長工作放背景不在回合裡等、結束回合前 commit＋push、沒有背景工作會叫醒時用 send_later 排 1～2 分鐘後接續；每個回合開始先回使用者、再 ReadNotifications 讀到 0。
- turn_check（20:11）：104 個回合、30 個超過上限，最長 135.5 分鐘；18:29 開始的回合約 100 分鐘（把渲染、截圖、建模串在同一個回合）。改法：每個工作單位結束回合。

**⚠ D89（使用者 2026-10-16 約 19:2x，直接給 LAWWW-B；LAWWW-B 19:12 轉達，我 19:58 讀到、ACK）**：溫州街、小公園和所有美術（Blender／GLB、貼圖、2D 背景、場景佈置、模型擺放、效能減面、美術截圖）歸 LAWWW2-B；LAWWW-B 只整合（接交付、LICENSES、導航碰撞、互動點、事件、回歸）。`wz_park_layout.js` 畫面欄位歸我、導航與互動點歸 LAWWW-B，改之前互相說；`zones3d.js` 備用方塊我給外觀方向。
- 新改給我的（tasks.json owner＝LAWWW2，照 D81 順序）：**SCN-V3-01** 第二個房間 2D＋物件（SYS-06，大二開學）、**ART-04** 黃金葛 `prop_pothos.glb`（203 窗台，互動點已有）→ **SCN-V3-03** 霖澤館 201 模擬法庭擺法（模 5，5/1）→ **SCN-V0-01** 社科院大樓室內（用途等 AA-B）→ ART-BG12 seaside_town（D13 底圖）、SCN-V4-01 第三個房間、SCN-V5-01 第四個房間、SCN-V5-02 畢業典禮（G6）。
- 開遊戲加速（LAWWW-B v9.9.2）：主要角色背景下載；截圖腳本等人物要加 `(!GAME.charsAllP||GAME.charsAll)`。

**進行中（16:1x UTC）**：
- 精修第 3 批溫州街路面：`wz_road_tex.py` 畫一張路面貼圖集 `wz_road_atlas.jpg`（主巷、Café 前南北向路、三條側巷；一個材質 `wz_road`，原本三個材質讓 arcade 到 311 次 draw call）＋每公尺重複的顆粒法線，`wz_props.py` 鋪在套件路面上（y 0.016）。
  - 有：補丁、灌縫、輪跡、油漬、一節一節的混凝土水溝蓋＋鐵柵、白線、禁停紅線、人孔、手孔、「慢」字、靠牆暗角；機車停車格（照遊戲裡 scRow 的位置）；巷口斑馬線（套件那片被蓋住了，畫進貼圖）。
  - 遊戲內前後截圖拍過（主巷東、西、Café 前、晚上、手機直向、停車格、北巷口、西端巷子、南巷晚上）。
  - LAWWW-B 的 `wz_street_integration`（16:5x，我的 worktree＝LAWWW-B f1651491＋這一批 GLB＋patch）：draw call 292／273／309（三個都 ≤310）、三角形 42.7／39.5／42.9 萬。效能那一項照舊 FAIL：lane_east、arcade 的三角形還超過 42 萬（第五輪＋WZ7 之後是 42.4／39.7／43.6 萬；這一批 arcade −0.7 萬、lane_east +0.2 萬，輪胎 14 邊）。其他項目見下面。
  - LAWWW-B 要套 `patches/wz_road_nightdark.patch`（入夜變暗＋anisotropy；材質 `wz_road`）。沒套也不會壞：只是晚上路面不會變暗。
- ART-PARK1（BB-B 82eb09b8）驗收通過，擺進 `wz_park.py`：沙坑往南挪 0.1 m（滑道出口和沙坑木框重疊 2 cm）；溜滑梯下的地墊改磚紅（和滑道的綠分開）；兩塊地墊用顆粒貼圖。
- 機車輪胎 10 → 14 邊（停車格近景看得出多邊形），每台 +64 三角形。

**派給支援的 AI**（都交我驗收）：
- BB-B：ART-PARK1 已收（82eb09b8）。
- AA-B：ART-PARK2 已收（7930daf8）、US2 第 9 節補強已收（48393461）。US1、SOY1、WZ7 的補強暫停（使用者 17:0x 要 AA 以劇情為主）。
- BB-B：ART-PARK3 已收（ba3af720，18:0x 驗收）。
- BB-B：ART-SHOP1 機車行道具組（18:3x 派；`bb_support/scooter_shop_props.py` → `assets/models/env/second_ai/bb_support/scooter_shop_props.glb`；給公館機車行背景用）。
- BB-B 18:24 派給我：祐廷 3D 臉試做（BB_131 第 11 節，745de7c5；另存 `vroid_yuting_facetest.vrm`，只在 `?facetest` 載入，不換預設）。排在 ART-BG-COURT 之後，LAWWW-B 另有順序照 LAWWW-B。

**還沒做（我的佇列）**：
- 溫州街效能：17:4x 達標（draw call 291／273／307、三角形 41.8／39.1／41.9 萬）。餘裕只有 1～2 千個三角形：之後在溫州街加東西要先量。
- WZ7 另外兩件（傘桶、腳踏車鎖）：等三角形預算。
- 小公園其他還像積木的：公布欄（我做）。
- 2D 背景佇列：ART-BG-COURT 18:5x 已交（等 BB-B 驗收）；AA_185 第 8 節：公館機車行、老國小操場、視訊的國外住處（美國公寓、日本宿舍）、日本教室。
- 社科院：後棟窗戶排列單調、手機直向在中庭鏡頭貼牆（玩家 x 101、z −64，鏡頭 yaw 0.6、pitch 0.35、距離 6）。
- 精修第 2 批：全域光影（LAWWW-B 已經有 C.LOOK）。
- 美國公寓、體育館：LAWWW-B 接好區域後拍遊戲內截圖。
- BG-04（等照片）；BG-14 永康街咖哩店、BG-19 公館二輪戲院改成使用者生成（BB-B 第 55c 組）。

## ⚠ 使用者 2026-10-16 07:1x UTC：「這次公園看起來蠻好的 我覺得很重要就是 日系加一點寫實 不要很像積木」

- 小公園 v2（老茄苳＋圓椅、修剪過的杜鵑花籬、樹穴、步道收邊）方向對了，照這個方向做下去。
- **每一批的檢查項目**：近景主要物件不准是方塊拼起來的。
  - 用倒角、圓弧、旋轉體、斷面拉伸，加一點不規則（高低、寬窄、顏色的小變化）。
  - 材質與顏色柔和、統一，偏日系。
  - 寫實的地方：比例、收邊、生活痕跡（樹穴、緣石、磨損、雜物）。
- 已知還像積木、要重做的：公園的搖搖馬、溜滑梯、土地公廟的廟身；店面的櫃台、冰櫃。

## ⚠ 使用者 2026-10-16 06:2x UTC：美術要像「得獎、Steam 上會賣的遊戲」；美術方向由 LAWWW2-B 自己決定（「你自己決定不要再叫我決定」）

- 使用者原話：「你這個既有的骨架去修根本不會差太多 我要的是參考得獎的遊戲 真的像是STEAM會賣的遊戲 的美術」，接著「你自己決定不要再叫我決定」。
- **LAWWW2-B 的決定**：美術方向＝**繪本感半寫實環境＋日系動畫人物**。
  - 參考的技法：環境學《Season: A Letter to the Future》、《Lake》的烘焙光、暖色暮光、空氣感；人物學《Persona 5 Royal》、《Atelier Ryza》的卡通光影、描邊、邊緣光。
  - 目標畫面是已定的 2D 參考圖 `07`（溫州街 Café 前，黃昏）。
- **做法**：先做一個垂直切片（溫州街 Café 前黃昏），整套做到商業水準，再推到全遊戲。
  - 後製：HDR → 光暈 → 色調映射 → 調色 → 暗角。新模組 `src/post3d.js`，LAWWW2-B 的檔案，交 LAWWW-B 接線。
  - 黃昏光線。
  - 街道的烘焙環境光遮蔽（AO）和路面細節，放在我的 GLB。
  - 人物：動畫式臉部光影、頭髮高光。
- **權限照舊**：
  - 改引擎的部分做成 patch 交 LAWWW-B 整合，不直接改它的檔案。
  - 沒驗收的不接進正式遊戲；發布由 LAWWW-B 負責。
  - 原本「黃昏調色 KEY_GOLDEN 等使用者決定」那一項，現在由 LAWWW2-B 依這個方向決定。

## ⚠ 不停工規則：已併入開發分支 `CLAUDE.md`／`docs/rules/ROLE_LAWWW2.md`（RULES-CONSOLIDATE-1110），這裡不再抄。

## 精修進度（LAWWW2-B，2026-10-16 06:0x UTC）——WORK_IN_PROGRESS

- **第 0 批：修改前基準截圖（遊戲內）**
  - 場景 12 張：`tools/blender/env_second/shots/polish0_before.json`。
  - 人物：`tools/shots/char_review.py`，開發線 `5ec6a388`，11 人 × 預設版／?blchar；截圖在工作階段暫存區，還沒 commit。
  - 看到的問題：
    - 地面：手機直向時下半部是空的灰色地面。
    - 椰林大道：椰子樹幹白得像油漆桿，樹影又黑又重。
    - 宿舍：門變半透明，一大片鬼影蓋住畫面。
    - Café：窗外街景是白方盒。
    - 人物：臉和脖子一樣亮；頭髮一整塊黑；連帽衫改的領口留著翻領和尖刺（祐廷、以安）。
- **第 1 批：祐廷（進行中）**
  - `tools/char_polish.py` 在 `vroid_build.py` 的建置結果上做局部修正，不改 vroid_build.py 本身。重建的網格和貼圖和現行模型逐位元組相同（只差 13 個 accessor 的 min/max）。
  - 修正內容：
    - 頭髮：深棕黑。
    - 領口：剪掉翻領和尖刺，改成圓領加羅紋。
    - 脖子：畫上下巴投影。
    - 上衣：淺燕麥灰。
    - 褲子：霧面炭灰，改寬直筒。
  - 遊戲內同鏡頭比較 p1～p3 有改善；p4（上衣顏色、寬褲）的截圖正在拍。**還沒換進遊戲、還沒交 LAWWW-B**。
- **以安**：V 領版試作兩次都不好（第一次領口一圈變成髒灰帶，第二次露出帽口內襯）。使用者 06:0x 中斷，已經停下，`polish_heroine_01` 只是試作。
- **第 2 批（全域光影）**：ld1 A/B 結果如下，還沒做 patch。
  - Neutral 色調映射：白天人物膚色、背景比較好；室內變暗。原因是 three.js 的 ACES 內建約 1.67 倍曝光補償，要和曝光表一起調，不能直接換。
  - AgX：比較灰。
  - 皮膚陰影加深：臉側有立體感。
  - receiveShadow：沒有差別。
- **使用者 06:0x 新問題「街道能不能更像真實的？」**
  - 回答：可以。從溫州街 Café 前那一段開始，依序處理路面細節（保留 D30 淺灰）、牆面髒污、生活痕跡、光影，然後同鏡頭比較。

## ⚠ 使用者 2026-10-16 01:4x UTC 正式指示：清查原帳號美術交班缺漏（支援完整五學年遊戲）

- **要求**：
  - 回頭核對舊帳號 LAWWW2 的交接紀錄、舊分支、WIP 分支、`SECOND_AI_HANDOFF.md`、`DUAL_AI_BOARD.md`、LAWWW-B 排程。
  - 逐項比對已交付、待驗收、WIP、未整合的素材。
  - 特別查：便利商店第二版、其他 WIP、MODEL_READY／READY_FOR_ART_REVIEW 但沒整合的、覆蓋或遺失或重複製作、各學年與交換與尾聲的新場景、32 處約會的底圖與人物疊圖。
- **原則**：
  - 已完成的不要重新建模。
  - 新場景的劇情用途經 LAWWW-B 或既有流程向 AA-B 確認；純美術技術自主處理。
  - 每件素材標清楚狀態、來源、位置、規格、遊戲內測試、交付對象、SHA。
  - 優先順序：嚴重影響玩家體驗的 → LAWWW-B 已排的場景與 32 處約會素材 → 舊 WIP（不放棄）。
- **做了**：清查報告 **`docs/art-rebuild/second_ai/ASSET_AUDIT_2026-10-16.md`**（`e3d6779`）。
- **通知**：
  - LAWWW-B：P1，01:5x 送達，等 ACK；提議把 20 個黑畫面背景排進佇列。
  - BB-B：P1，問約會人物圖去背的規格。
- **沒有停止的工作**：nccu_campus、home_living／home_balcony 照舊繼續。

## ⚠ 使用者 2026-10-16（永久）：真實店家的店名一律改成諧音或替代名稱

- 地點、店的種類、排列照真實的畫（要實際查、不要虛構）。
- **招牌店名改成諧音或替代名**，不畫商標、不照抄品牌配色。
- 詳見 `WORK_RULES.md` 第 0 節。

## ⚠ D76：已併入開發分支 `CLAUDE.md`／`docs/rules/ROLE_LAWWW2.md`（RULES-CONSOLIDATE-1110），這裡不再抄。

## 使用者 2026-10-16 更正（P0）：政大的背景要用真實的店，不要虛構

- 原話：「政大附近有麥當勞 和主要什麼學生會去的店你要實際查 不要虛構」。
- 這條**取代** LAWWW-B 23:34Z 分派裡「不放真實店名」的做法。校徽、校名照舊不放，除非使用者另外說。
- 要上網實際查證：政大附近的麥當勞、學生常去的山下店家、校門口的樣子。每一項都要記下來源。
- 已經停掉用虛構店名算的 1920×1080 正式版（沒有算完、沒有交付）。腳本裡虛構的 `NCCU_FOOD` 店名要換掉。

## ⚠ D75（使用者 2026-10-15 直接指示 LAWWW2-B）：不傳訊息給已交班的另一個帳號

- 另一個帳號是**每週用量到上限才交班**的。對它的任何工作階段 `send_message`（包括「測試」「不用回覆」）、`interrupt_session`、替它排 `send_later`／排程，都會叫醒它、讓它又開始工作、消耗它的額度。**一律不做。**
- 跨帳號只用 GitHub 文件交接（這份 HANDOFF、總入口、看板）。
- 只有同一個帳號、而且正在值班的職位之間，才用 `send_message`（例：帳號 B 的 LAWWW2-B → LAWWW-B）。
- 紀錄：LAWWW2-B 接班時只傳了一則給 LAWWW-B（帳號 B，`session_01DvRVNNnivf7da7qqWuGmw6`，已抄進值班表 `6212adb`），沒有傳給帳號 A 的任何工作階段。

值班登記：帳號 B｜LAWWW2-B｜session_01GV1WG3UeT2DhuDpxeWJsvD｜分支 claude/funny-albattani-iawshm｜接班基準 origin/claude/second-ai-env-art 的 8e1061a（合併進 main 4e203e8 開出的分支）｜2026-10-15 23:1x UTC
上一班：帳號 A｜LAWWW2｜session_01AC1WVgJSmoJK1uRsPK2Zn1｜最後 commit 8e1061a（2026-10-14 17:38 UTC，「LAWWW2（帳號 A）交班」）｜正常交班

## 進度（LAWWW2-B，2026-10-16 01:2x UTC）——最新

佇列（LAWWW-B 00:56Z）：自強十舍（等使用者照片；畫「宿舍樓下、有長椅」的角度）→ **nccu_campus「政大・校園裡的路」**（等照片時先做）→ 後備 A（公館腳踏車行、台北的家 2D 兩張）→ 便利商店 v2 收尾。

| 項目 | 狀態 | SHA／位置 |
|---|---|---|
| 空橋 skybridge.glb | 已交付；LAWWW-B 決定 RISE 維持 0.6，Y0＝4.2（室內）／4.0（外觀）由 LAWWW-B 處理 | `a22ba0e` |
| 載妹墊 bike_ride.glb | 已交付；LAWWW-B 整合中 | `aed5e46` |
| 政大 nccu_gate、nccu_food | LAWWW-B 已整合（`00179902`） | `825c038` |
| **公館腳踏車行「輪轉單車」**（G06，原「眼鏡・手機維修」，正對校門） | WIP：程式、GLB 已改（`f77d7c5`），遊戲截圖拍好，**導航測試還沒跑**；店內景深卡的牆調暗了還沒 commit | `f77d7c5`＋本機 |
| **nccu_campus**（醉夢溪畔的步道） | WIP：`bg_nccu.py campus` 場景寫好、低解析度試算三版，**還沒 commit、還沒算正式圖**；查證 `research/nccu_campus_path.md`（沒有照片，外觀推估） | 本機 |
| 芷若 campus 表情 8 張 | **BB-B ART_APPROVED**（01:04Z）；thinking 不放；neutral 頭頂補完整、白點清掉；**等 LAWWW-B 整合（manifest 重產）** | `724643c`、`824f063` |
| 轉給 BB-B 的使用者圖 | 學姊約會圖、芷若九表情存在 `docs/story_planning/date_system/art/`（BB-B 也自己存在 `2fd84e1`）；取圖工具 `tools/extract_chat_images.py` | `6c3ab9b`、`d84501a` |

- 本機 worktree：`/home/user/bike_before`（`6c3ab9b`，腳踏車行改之前的截圖用，伺服器 8841；8842＝工作目錄）。容器重開就沒了，沒有獨有的成果。

## 進度（LAWWW2-B，2026-10-16 00:0x UTC）

**LAWWW-B 23:34Z P1 新分派**（使用者 10-15 試玩 v9.7 的 26 項，原話在 LAWWW-B 分支 `docs/USER_INSTRUCTION_LOG.md` `10826bd`），排在便利商店之前：
- **A 郭沛珊自己的 VRM**：`MODEL_READY`，已交（`78db4a6`）。
  - 照 BB 已 ART_APPROVED 的參考圖。
  - 檢視圖、缺點、接法在 `test_shots/peishan_v1/README.md`。
  - 等 LAWWW-B 接進遊戲、拍遊戲內截圖給 BB 驗收。
- **B 政大 2D 背景**：`WORK_IN_PROGRESS`，nccu_gate、nccu_food 正在算 1920×1080。
  - 腳本 `tools/blender/env_second/bg_nccu.py`。
  - 小吃街：`wz_street.py --set nccu_food`，店名虛構。
  - 校門：原創石牆＋門柱＋山，沒有校名、校徽。
  - 之後：nccu_river、nccu_lib、nccu_park。
- **C 空橋**：已回報現況（不是我的 GLB；zones3d.js 第 193 行的方塊＋teach3d 的 link 門瞬移），等 LAWWW-B 決定要不要做成能走的。
- 舊佇列已交：
  - 便利商店第二版（`a41c52e`）。
  - 女舍門燈（`6f98244`）。
  - 兩項都是 READY_FOR_ART_REVIEW，整合時間由 LAWWW-B 依使用者排的順序決定。
- 這個容器的環境：
  - 已裝：`/opt/blenv`（bpy 5.2.2）、VRM Add-on（`/opt/vrmaddon`）、VRoid 樣本（`tools/vroid_src/`，git 忽略）、python playwright、EGL 函式庫。
  - 本機 worktree `/home/user/cvs_wt`（LAWWW-B `6212adb`＋本機換的 GLB，**不 commit**，伺服器 8830）。

## 盤點：等使用者驗收的 LAWWW2 成果（佇列③，LAWWW2-B 2026-10-15 23:2x UTC）

查法：`assets/models/env/second_ai/*.glb`、`assets/models/char/second_ai/*`，對 `origin/main`（v9.7 `313d620`＋P0 文件）和 LAWWW-B 開發分支 `claude/modest-rubin-2lyp7g`（`6212adb`）的 `src/` 搜尋檔名與 manifest key。章節＝`VISUAL_REVIEW.md` 的節號（裡面有規格、截圖、缺點）。**下面全部都還沒經使用者驗收**（建築、場景只有使用者能標 ART_APPROVED；人物由 BB 驗收，D59）。VISUAL_REVIEW 各節的「整合」欄有些停在當時的狀態（寫「還沒接」但後來 LAWWW 接了），以這張表為準。

**A. 已經在線上版（v9.7）、等使用者看**——使用者可以直接在 GitHub Pages 走到那裡看：

| 成果 | 檔案 | VISUAL_REVIEW |
|---|---|---|
| 兩點半 Café 外觀＋室內 | `cafe_exterior.glb`、`cafe_interior.glb` | 1 |
| 溫州街近景：主巷公寓、日式宿舍、小公園、街道小物 | `wenzhou_street.glb`、`wz_jphouse.glb`、`wz_park.glb`、`wz_props.glb` | 2、5 |
| 便利商店室內（**舊版商品**；第二版是 WIP，見「交班（最新）」） | `cvs_interior.glb` | 3 |
| 阿鳳麵店、舊路書房、宿舍房間 | `noodle_interior.glb`、`bookstore_interior.glb`、`dorm_interior.glb` | 4 |
| 街道道具（淑女車、路燈、長椅）＋法學院廣場花台、公告欄、販賣機 | `street_props.glb` | 6、14 |
| 公館騎樓店面街、機車 | `gongguan_shops.glb`、`scooter.glb` | 7、12 |
| 校園地標：總圖、傅鐘、行政大樓、文學院、校史館、洞洞館、社會科學院 | `campus_library/bell/admin/arts/hist/pavilion/modern.glb` | 8～11、13 |
| 行道樹（樟樹、榕樹、大王椰子） | `street_trees.glb` | 15 |
| 新社科院外觀、社科院圖書館一樓 | `campus_socsci.glb`、`soclib_interior.glb` | 16、22 |
| 萬才館法律學院圖書館 | `lawlib_interior.glb`（在 `assets/models/env/`） | 17 |
| 騎車用的腳踏車 | `bike_ride.glb`（在 `assets/models/env/`） | 19 |
| 教學館家具、坐著的聽眾、桌上小物 | `furniture_study.glb`、`seated_figures.glb`、`desk_props.glb` | 23、24、27 |
| 社團博覽會攤位、系籃半場、總圖 3F、醉月湖 | `club_fair.glb`、`bball_court.glb`、`library_3f.glb`、`campus_lake.glb` | 28～31 |
| 人物：吳芯慈、許柏翰、阿哲、芷若和柏翰的眼鏡（BB 驗收） | `bl_classmate_xinci/bohan.vrm`、`bl_zhe.vrm`、`glasses_*.glb` | 32 |

**B. 只在開發分支、還沒發布**：
- 共同教學館外觀（`campus_gongtong.glb`，第 20、33 節）、大一女舍 A／B 棟＋天橋（`campus_freshman.glb`，第 21、33 節）：main 的 `zones3d.js` 有接線，但 manifest 沒有這兩個 key，**線上版看不到**；開發分支有。
- 杜可昕（`bl_kexin.vrm`，第 32 節，`blOnly`）、8 個路人底模（`bl_npc_*.vrm`，只在 `?npcnew`）。

**C. 還沒接進遊戲**：
- 118 巷街景 `lane118_street.glb`（第 18 節，等 LAWWW 做區域）。
- 黃金葛盆栽 `prop_pothos.glb`（manifest 沒有；劇情 `ev_fangyt_pothos` 已經在 main）。
- 2D 背景 `assets/bg/noodle_table.webp`（`outings3d.js` 的 `noodle_table` 還是 `image:null`）。
- 便利商店商品第二版（WIP）。

## 接班（LAWWW2-B 帳號 B，2026-10-15 23:1x UTC）

- 使用者在帳號 B 貼 7.2 啟動提示詞。系統指定的分支 `claude/funny-albattani-iawshm` 從 `main`（`4e203e8`）開出；`origin/claude/second-ai-env-art`（`8e1061a`）用 `git merge --no-edit` 合進來，沒有衝突，`src/`、`tests/`、`CLAUDE.md` 跟 main 相同（我的分支只多 LAWWW2 自己的檔案）。
- 離開期間（10-14 17:38 → 10-15 23:1x UTC）：`claude/second-ai-env-art` 和 WIP 分支都沒有新 commit；開發這邊只有使用者推的 P0 換班規則，以及 LAWWW-B 接班（`claude/modest-rubin-2lyp7g`，`ba8b225`，D75）。沒有發布。
- **LAWWW 現在是 LAWWW-B**（帳號 B，`session_01DvRVNNnivf7da7qqWuGmw6`，分支 `claude/modest-rubin-2lyp7g`）。我的交付以那條分支為準；`claude/confident-ritchie-8rwh7t` 這段期間不寫入。
- **D75**：不傳訊息給帳號 A 的任何工作階段（LAWWW、LAWWW2 A），跨帳號只用 GitHub。帳號 B 內正在值班的 LAWWW-B 可以用 `send_message`。
- 我的分支：`claude/funny-albattani-iawshm`（之後 LAWWW2-B 的成果都 push 這裡；`claude/second-ai-env-art` 這段期間不寫入）。
- 接下來照下面「交班（最新）」的順序：①便利商店商品第二版（WIP）→ ②女舍門燈罩加大 → ③盤點 READY_FOR_ART_REVIEW 成果；④汽車／約會美術不開工。以 LAWWW-B 的分派為準。
- 本機 worktree（`/home/user/bg_wt`、`npc_wt`…）是帳號 A 容器上的，這個容器沒有；要重建。

## ⚠ P0：已併入開發分支 `CLAUDE.md`／`docs/rules/ROLE_LAWWW2.md`（RULES-CONSOLIDATE-1110），這裡不再抄。

## 交班（最新）：2026-10-14 17:4x UTC｜帳號 A｜LAWWW2｜session_01AC1WVgJSmoJK1uRsPK2Zn1｜正常交班

- **原因**：使用者 17:3xZ：「現在換班，請依照既定交班規則完成交班。」
- **最後 commit**：分支 `claude/second-ai-env-art` 上訊息開頭為「LAWWW2（帳號 A）交班」的那個 commit。
  - 查法：`git fetch origin --prune && git log -1 --format='%h %ci %s' origin/claude/second-ai-env-art`。
  - 交班前的上一個 commit 是 `208f242`（便利商店商品 WIP 腳本）。
- **之後**：不再寫入 LAWWW2 的範圍，直到使用者叫回來（帳號 A 說「我回來了…」，或帳號 B 開 LAWWW2-B）。
- **接班的人先讀**：上面的 P0 一節 → 這一節 → `test_shots/cvs_goods_wip/README.md`。

### 正在做，停在 WIP（不能整合、不能發布）

1. **便利商店商品第二版**（LAWWW 17:22Z 佇列①；使用者 10-14 回饋⑦「貨架像模板複製貼上」）：`WORK_IN_PROGRESS`／`CHECKPOINT_SAVED`。
   - 已做：腳本 `tools/blender/env_second/cvs_goods.py`（新）、`cvs_interior.py`（改用它），在 `208f242`。
   - 遊戲內新舊截圖：入口、零食貨架兩個角度＋並排比較，在 `test_shots/cvs_goods_wip/`（桌機 SwiftShader，不是實機）。
   - **正式 GLB 沒換**。注意：現在跑 `cvs_interior.py` 會產生 WIP 版，不要輸出到正式路徑。
   - 還沒做（README 有細節與順序）：
     - 海報換成貼圖集海報。
     - 洋芋片、麵包改成鼓起來的袋子。
     - 依分類畫包裝插圖，並照每個面的長寬比畫（現在袋麵字被拉寬、洗髮精字被壓扁）。
     - 圓柱平滑著色、接縫對齊側面。
     - 寶特瓶標籤加高。
     - 後牆密度。
     - 四角度＋手機直向／橫向截圖、預算量測，然後交付。

### LAWWW 17:22Z 佇列，還沒開始

2. **女舍門燈罩加大**：我的 `campus_freshman.glb`，腳本 `tools/blender/env_second/campus_freshman.py`，零件 `wz_lamp_lens`，現在 0.36 m。
   - README 要寫「長椅附近適合加燈的位置」，給 LAWWW 整合時加燈。
   - 長椅在 C13 截圖 B 的 (−93, 51.5) 附近，建議見 `test_shots/c13_night/README.md` 第 28 行（`W3.lampPost()`＋地面光圈，長椅下鋪一小塊地磚接到步道）。
3. **盤點**我這邊 READY_FOR_ART_REVIEW、還沒給使用者看的成果清單（檔案、commit、截圖路徑），寫進這份 HANDOFF，方便下次給使用者驗收。
4. **汽車／約會美術**：**不要開工**，等 AA、BB 交接＋LAWWW 正式分派。

### 其他待辦（順序由 LAWWW 排）

- **普通、博雅 Blender 外觀＋空橋**（舊清單 #43）：
  - 位置不用再等使用者選：v9.6 已照**方案 A** 發布（開發分支 `docs/RELEASES.md` v9.6「校園方案 A」：醉月湖往北移，普通、博雅在文學院後面，二樓空橋）。
  - 外觀還是套件方盒（`BLOCKOUT`），沒排進佇列。
  - 交班時使用者問過 A／B 是什麼，已回答：v9.6 已照 A。使用者想改成 B 就跟 LAWWW 說。
- 博雅官方平面圖對照 R2（#67，只寫文件，等平面圖）。
- 小語、明軒模型（暫停中）；路人底模的缺點；溫州街多一兩家店；男宿交誼廳家具。

### 本機狀態（容器重開就沒了；沒有獨有的成果）

- 測試用 worktree，**不要 commit**，交付的東西都已在分支上：
  - `/home/user/bg_wt`：開發分支 `e6ca3e2`，加本機 noodle_table 接線，cvs 換成 WIP GLB；伺服器 8820。
  - `/home/user/npc_wt`、`/home/user/v97rc16_wt`、`/home/user/v97rc19_wt`、`/home/user/v97rc5_wt`。
- scratchpad：cvs WIP 測試 GLB（可以用腳本重建）、截圖原檔（已轉 webp 進 repo）。
- 沒有跑到一半的 Blender 匯出或背景測試；沒有排程（send_later）。

### 不能合併／發布

- 便利商店 WIP（同上）。
- 我所有成果都要 LAWWW merge 進開發分支、跑回歸後才能發布。commit／push 只是保存，不是核准，也不是發布。我不碰 `main`、不 force push、不標 ART_APPROVED。

### 通訊

- LAWWW 17:22Z P1（下一段佇列）已在 17:34Z 讀到，寫在上面。
- 交班通知＋ACK 用 claude-code-remote `send_message` 傳給 LAWWW。狀態以工具結果為準（SENT／DELIVERED 不是 ACK）。

值班登記：帳號 A｜LAWWW2｜session_01AC1WVgJSmoJK1uRsPK2Zn1｜分支 claude/second-ai-env-art｜接班基準 `1f20126`（＋合併 LAWWW `cb399ea`）｜2026-10-13 12:35 UTC（使用者：「我回來了，請同步 GitHub 最新進度，接續工作。」）→ **2026-10-14 17:4x UTC 交班**（見上一節）
上一班：帳號 A｜LAWWW2｜session_01AC1WVgJSmoJK1uRsPK2Zn1｜最後 commit `1f20126`（2026-10-11 10:14 UTC）｜正常交班；中間沒有人接班（LAWWW2-B 沒有建立，遠端沒有別的 LAWWW2 分支）
交班紀錄：2026-10-11 10:13 UTC 交班（`1f20126`）→ 2026-10-13 回到帳號 A。
使用者 2026-10-13：帳號 B 暫時沒有開，從上次停下來的地方接著做。

**2026-10-14 17:00Z**：
- **LAWWW 16:00Z 佇列**：
  - ① 2D 背景 noodle_table：**v2 已交**。
    - 檔案：`assets/bg/noodle_table.webp`，備用 `noodle_table_window.webp`。commit dcc4cf7；腳本 `tools/blender/env_second/bg_noodle_table.py`、`noodle_interior.py --layout longtable`。
    - 遊戲內 ADV 截圖、LICENSES 一列、接法、自評都在 `test_shots/bg_noodle_table/README.md`。
    - 狀態 READY_FOR_ART_REVIEW。
  - ② C13 兩個晚上場景：**已交**（ce301b6，`test_shots/c13_night/README.md`）。不自然處都在 LAWWW 的檔案：
    - 博雅後牆方形光斑。
    - 長椅附近沒有燈。
    - 女舍門口路人坐在空中。
    - 女舍門燈罩（我的 GLB）可以加大，等 LAWWW 決定。
  - ③ 汽車／約會美術：等 AA、BB 交接後 LAWWW 正式分派。
- **已問 LAWWW 下一項**（17:00Z）：女舍門燈罩加大，或便利商店商品（09:53Z 舊佇列，使用者抱怨過「便利商店貨架像模板複製貼上」）。
- **路人底模**：LAWWW 已整合進開發分支 26c6553，只在 `?npcnew` 下、只給沒名字的路人用；美術 READY_FOR_ART_REVIEW。
- **給 LAWWW 的遊戲問題**：麵店價目板的字被切掉（zones3d.js attachNoodleInterior 沒有縮字）。
- **本機 worktree**（都不 commit）：`/home/user/bg_wt`（e6ca3e2＋outings3d.js 一行，伺服器 8820）、`/home/user/npc_wt`（伺服器 8817）。

**2026-10-14 12:41Z（使用者用量約 12:50 UTC 用完，下一個工作階段從這裡接）**：
- **v9.7 發布測試，我跑的全部 ALL PASS**（log＋截圖在 `test_logs/`）：

  | 測試 | 基準 | 結果 | 秒數 | commit |
  |---|---|---|---|---|
  | flow_first_meet | 候選 14 fd46e14＋我的測試 patch（＝候選 16 的測試） | 21 PASS | 901 | d22d317 |
  | flow_discuss_class | 同上 | 9 PASS | 352 | 57e89fe |
  | flow_lecture_attend | 同上 | 11 PASS | 869 | f265316 |
  | see_through | 候選 16 52f288e | 12 PASS | 58 | 5576908 |
  | flow_library_scene | 候選 16 | 13 PASS | 528 | 60c2e48、1764ab4 |
  | flow_library_floors | 候選 16 | 27 PASS | 899 | bef3d7c |
  | flow_boya_interior | 候選 16 | 24 PASS | 1114 | 4985b0a |

  - 測試 patch：`patches/v97_tests_fd46e14.patch`，LAWWW 已做成候選 16。細節見 `test_logs/v97_rc14_fd46e14/README.md`。
- **v9.7 已發布**（LAWWW 12:32:31 UTC，main＝313d620＝候選 19）。
  - 候選 19 上的 flow_boya_interior：**ALL PASS**（24 項、1067 秒、不用 turbo），log 在 `test_logs/v97_rc19_313d620/`（d7ffa8c），已回 LAWWW。
  - LAWWW 要下一個 LAWWW 工作階段把這個結果補進 RELEASES.md。
  - 這支沒有「手機橫向＋長選單」的情境，不能當成 choose 選單修正本身的驗證。
- **給 LAWWW 的遊戲問題**（不卡發布，LAWWW 會修引擎）：201 階梯教室點到走不到的地方（下一排桌子邊緣）時，人會原地一直走。證據在 v97_rc14 的 README。
- **路人底模（LAWWW 09:53Z ①，進行中）**：
  - VRM：8 個都在 `assets/models/char/second_ai/bl_npc_*.vrm`，2.41–2.74 MB。
    - nm1、nf1、nf2：f84bee8。
    - nm2、nm4、nf3、nf4：d972896。
    - nm3：4af64d9。
    - 衣服貼圖顏色都核對過。
  - 接法建議 patch：`patches/npc_ambient_1ca527d.patch`（127d36d）。
    - assets3d.js 加 8 筆 ambient、沒有 tintBase。
    - AMB 是新 8 個＋原本 4 個。
    - **還沒進開發分支**，LAWWW 發布後才看。
  - 遊戲內對照截圖：腳本 `drafts/npc_crowd_shot.py`，拍共同教學館門口的人流，比較原本和加上 `?npcnew`。
    - 只在本機 worktree `/home/user/npc_wt` 試接（1ca527d＋本機修改，**不 commit**）。
    - 第 1 版：同一批 5 個人，原本 2 種模型，加上新的變成 5 種。但鏡頭多是背面，還有樹幹擋住。
    - 第 2 版：加了整群、側面、正面臉部三種鏡頭。舊模型那一半拍到了（臉部近拍可用），新模型那一半為了跑候選 19 停掉了。
    - **12:40Z 第 2 版完成 13:05 那一組**：同一批 5 個人，原本 2 種模型，加上新的變成 5 種。
      - 對照圖 `shots/npc_ingame_g1305_old_vs_new.webp`：左舊右新；四列是整群、側面、正面臉 1、正面臉 2（9c50fdd）。
      - 單張：`shots/ingame_npc_g1305_*.webp`。
      - 正面臉 2 被前面的人擋住了。
      - 15:12 那一組只拍了加上新路人的版本（`shots/ingame_npc_g1512_new_*.webp`，1a59273）：5 人 5 種模型，聊天的那一群看起來是不同的人。
      - 這組新發現的缺點：nm1 後頸的髮尾有方塊狀的黑邊。可能是髮片貼圖縮到 512 後，透明邊緣變粗。下一版考慮把髮片貼圖留 1024，或把髮尾的 alpha 做柔一點。
    - 下一步：
      - 補拍 15:12 那一組的「原本」版本：`python3 drafts/npc_crowd_shot.py http://127.0.0.1:8817/index.html <輸出> both`，伺服器要開在 npc_wt。
      - 挑圖放 VISUAL_REVIEW，給 LAWWW，標 READY_FOR_ART_REVIEW。
  - 已知缺點：
    - 女生四個都是空氣瀏海，側邊髮束細。
    - nm4 不是設定的「很短的黑髮」。
    - nm3 側臉左眉外有一片脫離的髮片。
  - 狀態：MODEL_READY 前的 WIP，還沒進遊戲正式驗收。
- **之後的佇列**（LAWWW 09:53Z）：②便利商店商品 ③溫州街多一兩家店 ④男宿交誼廳家具 ⑤健身房（先不做）。
- **暫停的人物**：小語 `yu*.py`、明軒 `mingxuan*.py`（腳本 WIP，還沒跑 Blender）。

**2026-10-14 10:45Z**：
- **正在做（LAWWW 10:31Z P1，11:40 前）**：v9.7 發布前最後三支測試，只改 tests/。
  - 基準：fd46e14（候選 14）＝候選 8 遊戲＋候選 7／8／9 的這三支測試（LAWWW 10:42Z 確認）。
  - 修改：`patches/v97_tests_fd46e14.patch`（`d972896`，WIP）。
    - flow_first_meet：讀整句台詞 GAME.D.full；追人用跑的、每 2 秒重新瞄準、最多 90 次；追不到寫她的位置與作息。
    - flow_discuss_class：A 等路線走完、停下來才看「坐下」，卡住時寫 log 再用搖桿推；B 等遊戲時間走過 2 分鐘再開手機，照手機現在的格式比對內容＋說話的人。
    - flow_lecture_attend：坐下後等選單出來、選項印進 log、照文字選「坐一下」。
  - 正在跑：worktree `/home/user/v97rc5_wt`（fd46e14＋修改，還沒 commit 到那邊），伺服器 8813。
    - 排程：`scratchpad/v97fix14/chain.sh`，順序 first_meet → discuss_class → lecture_attend；log 在 `scratchpad/v97fix14/`。
  - 跑完：log 複製到 `test_logs/v97_rc14_fd46e14/`，push，回 LAWWW SHA。
- **路人底模（LAWWW 09:53Z ①，暫停到測試做完）**：
  - 第一批 nm1、nf1、nf2（f84bee8）。
  - 第二批 nm2 v2、nm4、nf3、nf4（d972896）：貼圖顏色都核對過，和設定相同。
  - nm3 匯出失敗：五個一起建時，h01_clothes 的 `WIP/clothes_Trouser.png` 被互相覆蓋，打包到寫到一半的檔案。
    - 已改 npc.py：每個路人用自己的暫存資料夾。nm3 要重建。
  - 已知缺點：女生都是空氣瀏海、側邊髮束細；nm4 不是設定的「很短的黑髮」，是側分長瀏海。
  - 下一步：重建 nm3、在遊戲裡拍路人群的截圖、給 manifest／AMB 接法建議，標 MODEL_READY。

**2026-10-14 09:0xZ（使用者 09:00：用量快到，兩小時內一定要存檔）**：
- **做到哪**：
  - v9.6：我跑的三項（flow_main_day12、flow_teaching_buildings、flow_soclib）全部 PASS；LAWWW 07:46 已發布 v9.6（main e88bda5）。
  - v9.7 已回報 LAWWW 的結果：
    - flow_typhoon PASS（候選 4＝我的 patch）。
    - cg_rain_shots PASS（直向、橫向）。
    - flow_invite_phone PASS。
    - flow_first_meet：候選 6 是 16 PASS／4 FAIL，LAWWW 在候選 8 修了遊戲（按鈕名字）和測試。
    - flow_lecture_attend、flow_discuss_class：都是測試的問題（座位有人），LAWWW 在候選 6、7 修了測試。
  - 紀錄：`test_logs/v97_rc3_8ac75f6/`、`test_logs/v97_rc6_7c5d4c2/`。
  - patch：`patches/playlib_rotate_8ac75f6.patch`、`flow_typhoon_bed_course_a8f05de.patch`（LAWWW 已套進候選 4）。
- **正在跑**（`/home/user/v97rc5_wt` checkout 候選 8 `3e5201d`，伺服器 8813，排程 `scratchpad/v97rc5/chain8.sh`）：
  1. flow_lecture_attend（候選 6/7 的遊戲，08:47 開始）
  2. adv_cg_layout
  3. flow_main_day12
  4. flow_teaching_buildings
  5. flow_soclib
  6. campus_glb_integration
  7. flow_first_meet（候選 8 重跑）
  8. flow_discuss_class
  - 結果在 `scratchpad/v97rc5/summary.txt`；每項跑完回報 LAWWW、推紀錄。
  - LAWWW 那邊跑：flow_class_real、campus_layout_nav、joystick_direction、flow_classes、flow_linze_floors。
- **沒測**：上面 8 項還沒跑完的部分；手機實機都沒測（全部是 Playwright＋SwiftShader 模擬）。
- **下一步**（LAWWW 08:46Z 派的，v9.7 測完才開始）：
  1. 便利商店商品：Blender 做多種虛構包裝、貨架分區、冷藏櫃玻璃；instancing／合併材質；修改前後截圖；MODEL_READY。
  2. （候補）宿舍交誼廳家具組：沙發、長桌、自習桌、電視、飲水機、公告欄、洗衣間一角、信箱。
- **人物（暫停，使用者 06:52「只跑測試、不做新模型」）**：
  - 小語 `yu*.py`、明軒 `mingxuan*.py` 腳本 WIP，都還沒跑 Blender。
  - 沛珊的參考圖看過：低馬尾、深色圓框眼鏡、酒紅 T 紮進深藍長裙、黑帆布鞋。
- **注意**：等待排程不要用 `pgrep -f <測試名>`（會比到啟動它的 shell，08:33–08:46 因此卡住）；改用等 PID（`kill -0`）。

**2026-10-14 06:4xZ**：
- **LAWWW 06:09Z 更正（ACK 已回）**：先幫 v9.6 收尾，再做 v9.7。
  - v9.6 候選 13 `ba435d5`（bundle 在開發分支 `wip_backup/v96-rc13.bundle`），乾淨 worktree `/home/user/rc13_wt`，伺服器 8811。
  - flow_main_day12：**ALL PASS**（29 項，06:20–06:33，已回報）。
  - flow_teaching_buildings：06:33 開始，跑完要立刻回報。
- **v9.7（636688f）**：
  - flow_typhoon FAIL，看起來是三個原因連鎖（紀錄＋分析在 `test_logs/v97_636688f/README.md`，`19a96bb`，已回報）。
  - 「手機點不開」的診斷腳本：`scratchpad/v97/diag/phone_diag.py`。等候選 13 跑完才開瀏覽器。
  - 之後從 cg_rain_shots 起跑其餘 6 項；flow_main_day12 等 LAWWW 給合併 commit 再跑。
- **小語**：
  - `yu.py`、`yu_face.py`、`yu_hair.py` 已 commit（WIP）。
  - `yu_clothes.py` 已寫好，還沒跑 Blender：拼色貼圖照 3D 位置烘、直褶裙＋腰帶＋扣子＋帶尾、立領合併進外套。
  - 回歸跑完才開 Blender。

**2026-10-14 06:1xZ**：
- **交付**：
  - 杜可昕 `0171f66`（MODEL_READY，VISUAL_REVIEW 32.5）。
  - 共同教學館、大一女舍合併材質 `8902c5f`：開發分支實測 ALL PASS，gate_avenue ×1.097；VISUAL_REVIEW 33。測試要換 `patches/campus_glb_integration_dev_636688f.patch`。修改前後截圖還沒拍：`drafts/gt_fd_shots.py`；舊 GLB 備份在 `scratchpad/t96/campus_*_before.glb`。
- **LAWWW 06:02Z P1（進行中）**：在 `/home/user/v97_wt`（636688f）、伺服器 8810 跑 v9.7 回歸 8 項，一次一個（`scratchpad/v97/chain1.sh`；結果在 `scratchpad/v97/summary.txt`、`*.log`）。每 3–4 項回報 LAWWW。第二步要等 LAWWW 的合併 commit，再跑發布前清單的後半段。
- **LAWWW 已接**：測試清單 `f7dbd96`、蒲葵 0.45 `c9c2ea7`、總圖 3F 正式模型 `bc02c5d`、柏翰 `0f11222`。
- **下一位人物**：小語，參考圖 `yu.webp`。
  - 棕色中長捲髮、金色髮夾。
  - 淡黃／白／灰藍拼色風衣外套、白 T 紮進酒紅百褶過膝裙。
  - 白帆布鞋、黑斜背包＋三個吊飾。
  - 回歸跑完、對照截圖拍完再開工。

**2026-10-14 05:4xZ**：
- **v9.6 測試**：
  - LAWWW 已把 campus_layout_nav patch 套進 v9.6 候選 11（ACTIONED）。
  - 合併版 campus_glb_integration（RC9／開發分支兩份 patch）在 `c2d893c`：RC9 ALL PASS；開發分支只剩效能。
  - 8796、8797 埠被舊工作區佔住的事故已更正（`3a9f434`）。開伺服器前先 `pgrep -af http.server` 看埠有沒有被佔，開完用 `/proc/<pid>/cwd` 確認是哪個目錄。
- **LAWWW 04:52Z 新工作（ACK 已回）**：共同教學館、大一女舍合併材質（各 4–6 個，gate_avenue ≤ 1.1 倍，v9.7），排在杜可昕之後、小語之前。
- **杜可昕**：
  - 參考圖 kexin.webp 已 ART_APPROVED，在 story-planning 分支 `docs/story_planning/art_reference/`。
  - Blender：`tools/blender/char_second/kexin*.py`，Victoria Rubin 底模；工作檔 `scratchpad/char/kexin/k_{face,clothes,full}.blend`。
  - 遊戲渲染器檢視：開發分支上要加 `--blchar`；8793（97f4abc）可以直接用。
  - 第六版建置中。
- **注意**：每個 checkpoint 一定要 `ReadNotifications`（這次又晚 20–35 分鐘才讀到 LAWWW 的三則）。

**2026-10-14 04:5xZ**：LAWWW 04:13Z P1（v9.6 發布前）交付 → `V96_CAMPUS_TESTS.md`：①`patches/v96_campus_tests_e2c4f10.patch`（只改 tests/；`e2c4f10`、`40f1d63` 都套得上）：campus_layout_nav RC7 ALL PASS；campus_glb_integration 共同／大一女舍外框、導航格（逐格比、只准宣告過的差異）、鏡頭碰撞（35−2+6=39）改好；②**新抓到的 bug**：共同前第 4 棵蒲葵 (6.5,19.0) 導航一格都沒擋（半徑 0.35 落在四格交角），`patches/gongtong_palm_nav_{e2c4f10,40f1d63}.patch`（zones3d.js 半徑 0.45，LAWWW 的檔案）；最終版測試沒修 FAIL、修了 PASS；③效能 ×1.138／×1.106／×1.103 門檻不改，拆帳（共同一棟 21 次、總圖 12 次）與降法（建議 ① 遠景 LOD＋② 跨棟合併相同材質）。下一步：等 LAWWW 決定；總圖 3F 等 LAWWW 的遊戲內截圖；人物照 D59 佇列（小語 → 明軒 → 沛珊，沒有參考圖就 BLOCKED）。

**2026-10-14 03:2xZ**：①**醉月湖接進最新版本的實測完成**（VISUAL_REVIEW 31.7；`patches/lake_integration_3f3d56a.patch` 在 `3f3d56a`、`97f4abc` 都套得上）：腳在木板上、柱子網點透空、六個方向都走到離亭子中心 1.63–1.89 m（to_edge2 超出 0.4 m 門檻但距離和其他方向一樣）；campus_layout_nav 的舟山路那一項失敗在乾淨的 `3f3d56a` 也一樣（測試清單沒跟著大一女舍更新，和湖無關）。②**球場／博覽會簡單版沒藏起來＝bug**（VISUAL_REVIEW 29.1；`patches/court_fair_fallback_dyn_97f4abc.patch` 2 行：`fb.userData.dyn=true`；修正前 72／216 個頂點還看得到，修正後 0）。③芷若眼鏡：玫瑰金 #a68b80、1.7 mm（香檳金在遊戲裡比皮膚淺、看不見）；`patches/glasses_zhiruo_97f4abc.patch`。④**芯慈第十版交付**（VISUAL_REVIEW 32.1，`assets/models/char/second_ai/bl_classmate_xinci.vrm` 3.17 MB、34,270 三角形）：瀏海兩排、頭頂加蓬；遊戲渲染器發現**坐下時裙子炸開**→裙子改綁腰臀＋大腿（前 76%、側 43%、後 13%）、拿掉裙擺彈簧骨。芷若眼鏡交付（32.2）。杜可昕 BLOCKED（沒有參考圖）。⑤**阿哲交付**（VISUAL_REVIEW 32.3，`assets/models/char/second_ai/bl_zhe.vrm` 2.83 MB、31,922 三角形；底模 Sakurada Fumiriya；工作檔 `scratchpad/char/zhe/z_final_work.blend`，腳本可以重建）。⑥**柏翰交付**（VISUAL_REVIEW 32.4，`bl_classmate_bohan.vrm` 2.8 MB、31,980 三角形；底模 HairSample_Male；眼鏡 `glasses_bohan.glb`）。下一個：周教授 → 小語 → 阿凱 → 林教授 → 明軒 → 黃教授 → 沛珊大三版 → 宥辰 → 筱涵 → 方奕廷。共用工具：`tools/blender/char_second/char_build.sh`（建置＋遊戲渲染器）、`tools/blender/char_second/char_lookdev.py`、`vrm_finish2.py`。工作檔：`scratchpad/char/xinci/x_v10_work.blend`（腳本可以重建，沒放進 repo）。

**2026-10-14 02:3xZ：使用者調整優先順序（原文已轉給 LAWWW，P0）**——黃金葛降為低優先（不再精修；小道具以後集中成一批）。LAWWW2 的佇列：①醉月湖、湖心亭的導航與穿模 → ②總圖 3F 閱覽區 → ③行道樹已確認的整合問題 → ④BB 驗收通過的主要角色 3D（芯慈、芷若、杜可昕）→ ⑤其他影響遊玩的場景問題。
- **⑦行道樹交付** `4c1e81b`（VISUAL_REVIEW 第 15 節；patch 在 469ae8c、3f3d56a 都 apply 得上）：公館「沒有標記的群組」修好（記號材質 visible=false、拿掉只裝記號的群組）；溫州街三角形 +3–4% 還是照實寫，選項給 LAWWW。WIP 備份 `claude/second-ai-env-art-wip-trees` `22ff594`。
- **黃金葛暫停** `2baa5ac`：`prop_pothos.glb` 2,538 三角形、Blender 渲染；遊戲內截圖沒做完。宿舍 `dorm_interior.glb` 筆筒移到書堆和筆電中間（放盆栽時一起換）。
- **芯慈 WIP** `eadec42`：開襟衫敞開＋整件白 T、髮髻往下、髮色調亮；之後：白 T 領口降到脖子根部（已改程式、還沒算圖）、瀏海改 bangA／B（已改程式、還沒算圖）。工作檔 `scratchpad/char/xinci/x_face.blend`（`--from-blend` 只重做衣服、頭髮）。
- **醉月湖實測**（進行中）：`tools/blender/env_second/shots/lake_integration_check.py`，在 LAWWW `3f3d56a`（`/home/user/lawwwtip_wt`、伺服器 8790）用 Playwright 攔截換上 `scratchpad/lake_proto/src/zones3d.js`（fallback＋亭子 2.0 m＋擋柱子＋地板高度 0.05）與 campus_lake.glb；不改任何工作目錄的 src。
- 杜可昕：art_reference README 寫「待使用者重傳完整版」，repo 裡沒有參考圖 → 到她的時候還沒有就告訴 LAWWW，不猜。

**2026-10-14 00:5xZ**：LAWWW 00:23Z、00:38Z 兩則（P1）**在通知佇列裡，00:42Z 才讀到**（又漏讀一次：每個 checkpoint 一定要 `ReadNotifications`）；00:4xZ 已回 ACK（DELIVERED）。決定：
- **⑨ 校門不做**（算在使用者暫停的「新建築外觀」）。佇列：⑪ → ⑩ → ⑦ → 博雅官方平面圖對照（只寫差異表，不改模型）→ **角色模型（D59：角色美術改由 BB 驗收；我照 BB 通過的參考圖改 Blender／VRM；第一位芯慈（整齊低髮髻）、第二位芷若（淺色細金屬圓框眼鏡），開工前先把順序告訴 LAWWW；清單 `origin/claude/story-planning:docs/story_planning/art_reference/README.md`，用 git show 拿、不 merge）**；後備：吉他社社辦（等 AA）。
- **博雅官方平面圖 BLOCKED**：使用者給的 aca.ntu.edu.tw、ga.ntu.edu.tw 兩個網址沙盒連不到（curl 403、WebFetch ENOTFOUND），已回報 LAWWW、已請使用者加 Allowed domains 或直接上傳 PDF；**不猜**。
- **⑦**：src patch 等 v9.6 之後才接；溫州街三角形 +3–4% 照實寫。乾淨 `469ae8c` 對照（`test_logs/trees_469ae8c/base_469ae8c/`）：campus_glb（5 項）、wz_street（導航）、street_props（兩區導航）、campus_layout_nav（新系館）**乾淨版一樣沒過、數字相同→不是 ⑦**；gongguan_glb **乾淨版全過→⑦ 造成**（正式模型那一輪少一個空群組，`scratchpad/gg_groups.py` 查是哪一個）；reachability_all 乾淨版在跑。模型、腳本、貼圖、測試已搬進交付分支（`6fc622d`），src 只交 patch。
- **⑩**：石頭貼圖拉成條紋（球面 UV 接縫）→ 共用頂點＋每面投影；木棧道加寬到 2.3 m（欄杆內側 ±1.055，遊戲走得到的身體最多 ±1.03，不用改導航）；亭子的導航建議用 `shots/lake_nav_check.py`（遊戲的 canStand／simWalk）量。Blender 渲染重出了（scratchpad `lake/`）。
- 背景鏈 `scratchpad/after_base.sh`（**跑的時候不要改這個檔**）：乾淨版 reachability → ⑪ 原型 → 湖的導航量測 → ⑩ 原型 → ⑦ 前後截圖 → gg_groups。

**2026-10-14 00:1xZ**：①②③ 交付後照佇列做 ⑦⑪⑩（⑨ 要先問 LAWWW 算不算使用者暫停的「建築外觀」）。BB 23:28Z 直接要「角色 3D 對照清單」→ 照第 10 節轉給 LAWWW（P1，沒有開工），等它決定。
- **⑦行道樹**（`claude/second-ai-env-art-wip-trees` `141fe09`＝LAWWW `469ae8c`＋⑦；本機 `/home/user/trees_wt`、伺服器 8782）：重新驗收中。樹皮減面（看不出差別）；`street_trees_integration` 35 PASS／1 FAIL（**溫州街三角形 +3.3–3.7%**，draw call 通過；校園 −20～−31%、公館 −11～−14%）——**不改測試標準**，交付時照實寫、請 LAWWW／使用者選。其他回歸跑中（`scratchpad/trees_rest.sh`）：`campus_glb_integration` FAIL（共同／大一女舍外框、導航、鏡頭碰撞、效能——看起來和樹無關）、`gongguan_glb_integration` FAIL（多一個空群組：大概是 ⑦ 的 `street_trees_field`，要在遊戲裡確認）、`wz_street_integration` FAIL（導航多 6 格——樹的測試裡兩輪相同，看起來和樹無關）→ 跑完後在乾淨的 `469ae8c`（`/home/user/base_wt`、`scratchpad/base_tests.sh`、伺服器 8783）跑同樣的測試分清楚。src 的 patch：`docs/art-rebuild/second_ai/patches/street_trees_469ae8c.patch`（還沒 commit）。VISUAL_REVIEW 第 15 節的草稿與填寫腳本在 trees_wt 的 `drafts/`（會照實寫沒過的項目）。
- **⑪總圖 3F 閱覽區**：`library_3f.py`＋`lib3f_atlas.py` → `library_3f.glb`（`856467d` 是第一版；之後改了：牆的粉光貼圖（原圖像水漬，變化只留 22%：`textures/gen/l3_plaster.png`）、椅子木紋、後牆中間的壁柱拿掉（擋到「3F 閱覽區」）；還沒 commit）。Blender 渲染在跑；遊戲內原型（`scratchpad/lib3f/g/before.json`、`after.json`，在 fix2_wt `9884d29`＝閱覽室和 `469ae8c` 一樣）等回歸跑完再拍；第 30 節草稿 `drafts/lib3f_review.md`。
- **⑩醉月湖**：`campus_lake.py` → `campus_lake.glb`（1.1 MB、8,448 三角形：石砌湖岸（照 lake() 的外形、木棧道缺口）、18 顆置石、六角湖心亭（凹曲面屋頂、翼角起翹、寶頂）、木棧道＋欄杆＋木樁；湖的本地座標）；預覽場景 `shots/lake_preview.py`；渲染排在 ⑪ 之後。**還沒 commit**。

**2026-10-13 23:3xZ**：③**吉他社社辦一頁提案交付**（PROPOSAL、不建模；`research/吉他社社辦_提案.md`）：萬才館東邊整塊走不到；建議 A＝霖澤館與萬才館之間的空地（x 54.5～72、z −118.6～−102.5）北半邊放一棟 13×7 m 的一層樓社團辦公室（兩間 6×5 m＋騎廊，門朝南；北牆貼走不到的範圍、不留窄縫）；B 萬才館大廳加一扇門、C 地下室；遊戲內位置截圖（紅框，不是模型）、室內示意平面（吉他牆、圍成一圈 7 張椅子、木箱鼓、沙發、白板、長桌）。**LAWWW 22:01Z 的 ①②③ 全部交付**；接著 ⑦⑨⑩⑪（R2 還在等平面圖／照片）。

**2026-10-13 23:3xZ**：②**系籃球場交付**（位置 PROPOSAL＋`bball_court.glb` `MODEL_READY`；`research/系籃球場_位置提案.md`、VISUAL_REVIEW 第 29 節）：兩個候選都在 LAWWW `9884d29` 本機注入拍了原型（俯視、地面、17:45、手機直向）——**A 醉月湖東側 (−4, −113)**（建議：範圍內什麼都沒有、方向和真實一樣、霖澤館走 30 m）、B 男一舍與體育館之間 (48.5, 67)（場內有一棵樹要移走、夾在兩棟樓中間）；接法表（籃架柱子、長椅、活動點的世界座標）在提案第 4 節；**位置要使用者選**。`nav_map.py` 加 `--raw`／`--from-raw`（存一次導航格，之後不開遊戲再畫）、`--label`、`--fs`；方案 A 校園的格子存在 scratchpad `campus_nav_9884d29.json`（沒有 commit）。**接著**：③吉他社社辦一頁提案（霖澤館與萬才館之間的空地 x 54.5～72、z −118.6～−102.5；候選平房 13×7 m；遊戲內位置截圖在跑）→ ⑦⑨⑩⑪。

**2026-10-13 23:2xZ**：①**社團博覽會交付**（LAWWW 22:01Z ①；`club_fair.glb` `MODEL_READY`＋配置 PROPOSAL，VISUAL_REVIEW 第 28 節：9 頂 3×3 m 帳篷在 z 15.1、轉 π 面向大道；服務台換掉開發分支 `e3e5811` 的公告欄 (−13.5, 14.6)、互動點 (−13.5, 13.6) 不動；法服換掉 (−18, 14.5) 的招生攤位；z 8～13、長椅左右 1.6 m 留空；9 個網格、1 個材質、7,158 三角形、0.54 MB；原型在 `9884d29` 拍，那一版還沒有公告欄，所以只藏了招生攤位）。②LAWWW `1eabc22`（23:00Z）接的是 **167fc2d 的舊坐姿替身**（f2、m1、m2 腿沒彎）——`8187dbc` 的新檔 49 個節點名稱、材質和舊檔完全一樣，**直接換檔**就好；交付訊息裡再提一次（P1）。**接著**：②系籃球場位置提案（`research/系籃球場_位置提案.md` 草稿：A 醉月湖東側 (−4, −113)、B 男一舍與體育館之間 (48.5, 67)；導航圖、俯視截圖在 scratchpad `court/`；模型 `bball_court.glb` 已做好）→ ③吉他社社辦一頁提案（`research/吉他社社辦_提案.md` 草稿：霖澤館與萬才館之間 x 57–71、z −121～−114 的一層樓社團辦公室）→ ⑦⑨⑩⑪。

**2026-10-13 22:5xZ**：①**桌上小物交付**（`desk_props.glb` `MODEL_READY`，VISUAL_REVIEW 第 27 節：17 種單件＋講堂 lset／自習桌 tset／圓桌 rset／手上 hold 共 15 組×2 LOD；一個材質、螢幕自發光；擺放檢查含雙人桌中間的插座盒）②**坐姿替身的腿修正**（自己發現：f2、m1、m2 的腿沒有彎＝抬大腿的旋轉方向寫反；`seated_figures.py` 改成先抬膝蓋＋加檢查；第 24 節加更正說明、修正前後對照，圖全部重拍；LAWWW 22:35Z 已 merge 舊版但還沒接 → 22:4xZ P1 請它接新版）③**社團博覽會**（LAWWW 22:01Z ①）：配置圖 `shots/clubfair_plan.py`（PROPOSAL：9 頂 3×3 m 帳篷沿大道南側、服務台在原本公告欄的位置）＋攤位模型 `club_fair.py` → `club_fair.glb`（9 攤、7,158 三角形）；遊戲內原型、Blender 渲染在跑（背景）→ 第 28 節 → 交付。**之後**：②系籃球場位置提案（ntu.edu.tw、維基百科都連不到；搜尋摘要：舊體（N14）在垂葉榕道旁、操場右側，左右兩側有籃球場；新生一、二籃球場在網球場與新生車道入口旁、靠新生南路；綜合體育館在新生南路與辛亥路口）→ ③吉他社社辦一頁提案 → ⑦⑨⑩⑪。本機：`/home/user/fix2_wt`＝LAWWW `9884d29`（伺服器 8797；**assets 裡有沒 commit 的 desk_props／furniture_study／seated_figures／club_fair GLB 複本，不要 commit**）。

**2026-10-13 21:3xZ**：這一輪交付三樣（都只有新檔、`MODEL_READY` 或素材，**都還沒接**）：①坐姿替身＋門模組 `167fc2d`（VISUAL_REVIEW 第 24、25 節）②鏡頭穿牆第二輪重拍 `815fdaa`（LAWWW `068f671`＋`8234015`，在 `9884d29` 乾淨 checkout：36 例穿牆 0；貼到頭頂上方放開 3 秒後 10→0；公告欄黑塊沒了；聽眾第一個畫面站著 16→0，測試在修改前失敗、修改後通過；CAMERA_WALLS 第 6 節）③博雅窗外景 `c15a648`（`assets/models/env/views/boya_{south,2f_south,2f_north,north}_{day,night}.webp`，遊戲畫面不是照片；一樓北面窗建議等 R2 把 103 搬走；VISUAL_REVIEW 第 26 節）。21:3xZ 傳 LAWWW P2（窗景接法＋下一項），DELIVERED、等 ACK；LAWWW 在準備 v9.6（候選 `5f66b67`），我的東西進下一版。**下一步**：照使用者 U6 分工做**桌上小物**（筆記本、筆、筆電、手機、水杯、書、法典；instancing、一個材質、和 furniture_study 同一套原點約定；補坐姿替身缺的筆記本與手機）；LAWWW 排別的就照它的。R2 核對等使用者的平面圖／照片（沙盒打不開 ntu.edu.tw、wikimedia）。本機：`/home/user/fix2_wt`＝LAWWW `9884d29`（伺服器 8797）、`/home/user/fix_wt`＝`dae1da3`（8796；有沒 commit 的 GLB 複本，**不要 commit**）。

**2026-10-13 20:4xZ**：LAWWW 20:02Z ACK 分工（U6）、R2 等平面圖、坐姿替身用「預先烤配色、每種一個網格」、門模組排在坐姿替身之後；我回了 ACK＋更正（遊戲裡還有關著的 103）。這一輪做完：①**坐著的聽眾替身** `seated_figures.glb`（`MODEL_READY`，VISUAL_REVIEW 第 24 節）：只用路人底模 npc_f1/f2/m1/m2；聽講／抄筆記／滑手機×2 配色＝24 種外型×LOD0（約 1,500）／LOD1（約 350）；和講堂椅同一個原點；一個材質（2048×1024 貼圖集＋自發光 0.3）；工具 `seated_figures.py`、`uvpack.py`（自己打包 UV：背景模式的打包只用到 1–8%）、`glb_share_geometry.py`（兩種配色共用頂點）②**教室門模組**（在 `furniture_study.glb`：`door_frame`、`door_leaf_open`（貼牆）、`door_leaf_closed`、`door_plate`；第 25 節）。遊戲內都是本機注入的原型截圖（`/home/user/fix_wt` 有沒 commit 的 GLB 複本）。**注意**：20:03Z 左右容器重開過，本機伺服器都停了（8796 已重開；8793 等沒有）。**下一步**：等 LAWWW 回覆 → 博雅窗景／北面窗建議；LAWWW 修好鏡頭 A／B 後重拍；照片／平面圖拿到後做 R2 核對與外觀比對。

**2026-10-13 19:2xZ**：使用者晚上的決定（照片來源、博雅 R2＋三條件、鏡頭穿牆最優先、101 不先做 400 個人物、整合順序 ①–④、**報告與分工確認之前不開新的外觀**）→ 已轉給 LAWWW（P1，等 ACK）。這一輪做完：①**鏡頭穿牆固定案例** `CAMERA_WALLS.md`（LAWWW `babb8c8`→`dae1da3`：一般 19/24→0/24、門口 2/12→0/12；修改後新問題：貼牆時鏡頭到頭頂上方 10 例、普通門廳公告欄一大塊黑；教室沒有門片）②**檢查報告更新** `FOUR_BUILDINGS_REVIEW.md` 最上面「★ 晚上更新」U1–U6（照片來源取代「沒有照片」、**R2 修正版**：101 挑高 192 席＋102／103 背對背各 80 席＋自習區沿用 LAWWW 第二版（12 小桌＋2 圓桌）、整合狀態五欄、分工）；研究文件也更新 ③**家具模組** `furniture_study.glb` `MODEL_READY`（VISUAL_REVIEW 第 23 節）。**沙盒打不開** ntu.edu.tw、wikimedia：照片比對沒做（要使用者開網域或貼圖）。本機測試目錄：`/home/user/fix_wt`＝LAWWW `dae1da3`（伺服器 8796；**有一個沒 commit 的 furniture_study.glb 複本，不要 commit**）、`/home/user/dev_wt`＝`babb8c8`（8793）。**下一步**：等 LAWWW 回 R2 修正版與分工 → 聽眾坐姿替身（#52）→ 門的模組（如果 LAWWW 排）→ 照片拿到後做外觀比對。

**2026-10-13 18:4xZ**：**新社科院外觀交付**（VISUAL_REVIEW 第 22 節；`campus_socsci.py`；本機測試目錄 `/home/user/soc_wt`＝LAWWW `babb8c8`＋接線，伺服器 8795，**不要 commit**）。LAWWW 18:05Z 回覆檢查報告 a–d：共同＋大一女舍已接（`f3a18d6`）；鏡頭穿牆、門框、椅子 instancing、聽眾坐好才顯示由 LAWWW 修；101 先維持（R2／R1 等方案 A 驗收）；自習區照提案改配置。**我的佇列**：自習雙人桌＋椅、圓桌＋椅、講堂椅模組（`furniture_study.py` 第一版太像方塊，正在改成真的造型：彎管椅腳、有弧度的夾板、圓角）→ 聽眾坐姿替身（LAWWW 的 VRoid 人物、6–8 種）→ 博雅窗景／北面窗建議。普通、博雅新外觀等方案 A。

**2026-10-13 17:2xZ**：使用者轉來 ChatGPT 審查（重點：真實辨識度、室內比例、實際遊玩；第 1–6 點）。做了：在 LAWWW `93b93b5` 的乾淨 checkout（`/home/user/dev_wt`，伺服器 8793，**不要 commit**）實際截圖＋效能＋鏡頭穿牆掃描＋聽眾坐姿檢查＋平面比較圖 → `FOUR_BUILDINGS_REVIEW.md`（PROPOSAL）；整合狀態核對（只有 `f0bab8c` 進了開發分支；我的分支整個合進去沒有衝突）；共同、大一女舍接線 patch `patches/gongtong_freshman_wiring_93b93b5.patch`（`/home/user/patch_wt`＝93b93b5＋patch＋兩個 GLB，伺服器 8794，**不要 commit**）。已傳 LAWWW 兩則 P1（整合順序；檢查結果＋問題 a–d），等回覆。**下一步看 LAWWW 回覆**：它同意整合路徑之前不開新的外觀（使用者第 5 點：避免模型累積沒進可玩場景）；可以做的是講堂椅、自習桌椅 instancing 模組、聽眾坐姿替身（要 LAWWW 同意）。

**2026-10-13 16:5xZ**：**共同教學館外觀＋大一女舍外觀已交付**（VISUAL_REVIEW 第 20、21 節；接線說明 20.5、21.5；LAWWW 接）。新社科院（使用者 2026-10-13：現代台大平行校園）：需求原文 `requests/2026-10-13_新社科院.md`、參考資料與一頁規劃 `research/新社科院_參考資料與規劃.md`（PROPOSAL，等 LAWWW 回可不可以整合、等使用者看）。下一步：LAWWW 回覆社科院規劃 → 社科院圖書館外觀＋大樓外觀（照 LAWWW 16:19Z 的方案：圖書館 x 95–125、z −92～−70；大樓 x 99–123、z −62～−42）→ 普通、博雅外觀（LAWWW 照方案 A 放位置）→ 教學館室內（讀 LAWWW 的 gongtong／putong／boya 配置，教室排距 2.0 m）→ ⑦⑨⑩⑪。本機：`/home/user/gt_wt`（臨時工作目錄，zones3d.js 有本機接線＋大樹牆略過，**不要 commit**；伺服器 8792）。每次 checkpoint 都要 ReadNotifications。

**2026-10-13 接班後的進度（最新在這裡；下面的表是交班時的狀態）**：⑤⑥ 已交付（`451d032`）；⑬ 已交付（`f3212c0`）；**法律學院圖書館已交付**（15:1xZ，merge `a9a227a`：GLB 2.77 MB、萬才館的門、窗景、VISUAL_REVIEW 17；READY_FOR_ART_REVIEW，等 LAWWW 整合、使用者看）；四棟參考研究第一、二輪（`7129157`）。**下一步**：⑭ 118 巷（`/home/user/lane_wt`，已合併交付分支，`lane118_fill.py` 改成第 18 節）→ ⑫ 腳踏車（`/home/user/bike_wt`，第 19 節）→ **共同教學館外觀**（LAWWW 規格：中心 (2,33)、ry=π、24×14、北面正門、西側 5 m 木造迴廊；**沒有照片**，已請使用者提供）→ 大一女舍外部（A (-108,68)、B (-78,66)、各 24×12×5 層、2 樓天橋）→ 普通、博雅（等使用者選 A／B）→ ⑦⑨⑩⑪。LAWWW 的訊息會「顯示送達但沒出現在對話裡」——**每次 checkpoint 都要 `ReadNotifications`**（2026-10-13 漏讀 4 則）。

規則見 `WORK_RULES.md` 第 6 節。分工、佇列以 LAWWW 的 `docs/SECOND_AI_HANDOFF.md`、`docs/DUAL_AI_BOARD.md` 為準；跨帳號接班照 `docs/AI_SESSION_HANDOFF.md`（D49）。**LAWWW 的訊息可能「顯示送達、但沒出現在對話裡」**：每次 checkpoint、每次交付前都 `git fetch` LAWWW 的開發分支讀看板。

## 目前（2026-10-11 10:13Z，交班時）

**使用者 10:05Z：週使用量 98%，可能隨時停。下面每一條的遠端 SHA 都用 `git ls-remote origin 'refs/heads/claude/second-ai*'` 確認過；本機五個工作目錄都沒有未提交、未推送的東西。**

LAWWW 09:58Z 的佇列（看板備援）：店家窗景 → ⑤⑥ → ⑬ → ⑭ → ⑫ → ⑦（快好可以先交）→ ⑨ → ⑩ → ⑪。
LAWWW 07:30Z、07:52Z、09:21Z 的 send_message 沒有出現在我的對話裡（09:47Z 讀看板才知道）——**接手的人每次 checkpoint、交付前都要 `git fetch` LAWWW 的 `claude/confident-ritchie-8rwh7t` 讀 `docs/DUAL_AI_BOARD.md`**。

| 工作 | 狀態 | 遠端分支 | 遠端 SHA | 做完 | 還沒做／沒測 | 下一步 |
|---|---|---|---|---|---|---|
| 店家窗景（cafe、cvs、noodle、bookstore 白天／晚上） | 完成，**可整合**（交付訊息要傳給 LAWWW） | `claude/second-ai-env-art` | `f0bab8c` | 8 張 `assets/models/env/views/<名稱>_{day,night}.webp`（1024×512、fov 53.13、11:00／20:30）、`tools/shots/shop_views.py`、景深 `tools/shots/shop_views_depth.json`（中位數／平均：cafe 7.1／11、noodle 9.5／23.5、bookstore 9／16.7、cvs 9.5／24.1 m）、`fast_shots.py` 加 `post` | 景深建議值要 LAWWW 決定（中位數被近處地面拉低；窗戶看到的主要是地平線附近 30–70 m 的街景）；**cafe 方向**：room() 的窗在右牆（+z 側緊貼轉角公寓），所以拍的是店面往西看溫州街，要 LAWWW 確認 | 傳交付訊息（草稿見下）、等 ACK |
| ⑤洞洞館、社科院 | 驗收完成（VISUAL_REVIEW 13） | `claude/second-ai-env-art-wip-pavsoc` | `8c6f1fe` | 兩個 GLB、匾額修正、測試三輪 | — | 和 ⑥ 一起交 |
| ⑥花台、公告欄、販賣機 | 收尾：已合併 ⑤＋AI-1 `8afdece`；販賣機改亮；前後截圖（WebP）、`5b21aa0` 那一輪完整回歸 log（`test_logs/props6_5b21aa0/`，全部通過） | `claude/second-ai-env-art-wip-props6` | `f2fe6ae` | 模型、接法、Blender 渲染、截圖、ASSET_INVENTORY、LICENSES | **合併 `8afdece` 之後的回歸只跑了第一項**（10:07Z 開始、交班時停掉：`street_props_integration` ALL PASS、`campus_glb_integration` 中斷、其他沒跑；`test_logs/props6_8afdece_partial/README.txt`）→ 重跑全部：`bash tools/blender/env_second/run_props6_acceptance.sh docs/art-rebuild/second_ai/test_logs/props6 tests http://127.0.0.1:8781/index.html`（工作目錄開 8781 server）→ `python3 docs/art-rebuild/second_ai/drafts/props6_fill.py`（VISUAL_REVIEW 14）→ merge 進 `claude/second-ai-env-art` → 傳訊息（草稿 `msg_p56` 的內容寫在下面） | 跑回歸、填文件、交付 |
| ⑦行道樹 | `WORK_IN_PROGRESS`：已合併 ⑤⑥（`9b488e0`）、LICENSES／ASSET_INVENTORY 加好 | `claude/second-ai-env-art-wip-trees` | `d7916da` | 葉片貼圖、四款樹＋遠景卡片 GLB、記號＋TreeField（townkit3d.js）、單元測試 ALL PASS、Blender 渲染、VISUAL_REVIEW 15 草稿＋填寫腳本 | 合併交付分支最新 → `bash tools/blender/env_second/run_trees_acceptance.sh docs/art-rebuild/second_ai/test_logs/trees all http://127.0.0.1:8782/index.html`（約 1.5 小時）→ `trees_fill.py` | 驗收、交付（預告：`?nobldg` 那一行加 `prop.trees`、開機預載多 1 MB） |
| ⑬辜先生紀念圖書館室內 | `WORK_IN_PROGRESS`（草稿） | `claude/second-ai-env-art-wip-soclib` | `3b4b201` | `tools/blender/env_second/soclib_layout_gen.py`（30×22×5.6 m：樹狀柱、閱覽長桌 4 張 24 座、北／西窗邊座位 33、林間書房 4 組弧形竹書架、入口閘門、服務台、閱報區；格子檢查：65 個座位都走得到）、平面草圖 `drafts/soclib_plan_draft.webp` ；`src/data/soclib_layout.js` 已產生（20 支柱、50 個天窗、導航阻擋 rects／circles）；Blender `soclib_interior.py` 初稿寫好（**還沒執行過**：`/opt/blenv/bin/python tools/blender/env_second/soclib_interior.py -- --preview <資料夾>`，天花板挖洞用 `bmesh.ops.triangle_fill` 要確認洞有沒有挖出來） | 跑腳本修錯 → 渲染（`render_cycles.py`＋preview 的 views.json）→ 看圖調整（柱子的密度、書架的排法）→ GLB 規格 → 交給 LAWWW 接線（新區域、導航用配置的 nav、座位） | 接著做 |
| ⑭118 巷街景 | 還沒開工 | — | — | — | 照 LAWWW `src/data/lane118_layout.js`（`6011a8a`）做 Blender 街景 | ⑬ 之後 |
| ⑫騎車用的腳踏車 | 還沒開工 | — | — | — | `tools/blender/env_second/bike_ride.py` → `assets/models/env/bike_ride.glb`；節點 frame／fork／wheel_f／wheel_r／crank／pedal_l／pedal_r；**尺寸表我出**（座墊頂、把手握點左右、五通、曲柄長、踏板中心、輪徑、軸距；公尺、車朝 +z、地面 y=0）；側面／45° 渲染＋樞紐說明 | ⑭ 之後 |

### 交班時的遠端 SHA（2026-10-11 10:1xZ，`git ls-remote origin 'refs/heads/claude/second-ai*'` 確認）

- `claude/second-ai-env-art`：這份文件所在的 commit（`git log -1 origin/claude/second-ai-env-art`）——店家窗景（可整合）、交接紀錄、看板
- `claude/second-ai-env-art-wip-pavsoc`：`8c6f1fe`（⑤，驗收完成）
- `claude/second-ai-env-art-wip-props6`：`f2fe6ae`（⑤⑥，合併 8afdece 後的回歸要重跑）
- `claude/second-ai-env-art-wip-trees`：`d7916da`（⑦，驗收沒跑）
- `claude/second-ai-env-art-wip-soclib`：`3b4b201`（⑬，配置＋Blender 腳本初稿，沒執行過）
- 本機沒有沒推送的東西；背景工作（⑤⑥ 回歸）已停掉。

**接班的人第一步**：`git fetch origin --prune` → 讀這份＋LAWWW 分支的 `docs/DUAL_AI_BOARD.md`（有沒有新的分派、ACK）＋`docs/AI_SESSION_HANDOFF.md` → 把要用的分支 `git worktree add` 出來（⑥ 用 8781、⑦ 用 8782 的 http server）→ 照順序：⑤⑥ 回歸 → 交付 → ⑬ → ⑭ → ⑫ → ⑦。店家窗景已經交給 LAWWW（10:07Z 的 P0 訊息），等它 ACK、決定景深與 cafe 方向。

`claude/second-ai-env-art-wip-props`（`fa626b9`）是推錯名字多出來的重複分支，刪除被遠端拒絕，忽略即可。
工作目錄（容器重開就不在了，從遠端分支 `git worktree add` 回來）：交付 `/home/user/Lawstudent`（server 8765）、⑤ `/home/user/pav_wt`（8780）、⑥ `/home/user/props_wt`（8781）、⑦ `/home/user/trees_wt`（8782）、⑬ `/home/user/soclib_wt`。

**要傳給 LAWWW 的交付訊息重點**（如果我沒來得及傳）：
- 店家窗景：merge `f0bab8c`；8 張的路徑、景深數字（上表）、cafe 方向的說明；只動了新檔 `tools/shots/shop_views.py`、`shop_views_depth.json`、8 張 webp、我的 `fast_shots.py`（加 `post`，不影響 window_views.py）。
- ⑤⑥（回歸通過後）：洞洞館 0.14 MB／968 tris、社科院 0.17 MB／1,968 tris；`wzAtlasFaces` 改了（空白填平均色、外擴 2 px、最寬的字牌縮小）；W3.planter／bulletin／vending 開頭換正式模型（萬才館一樓的公告欄也會變）；花台葉片超出導航阻擋（已修）、販賣機太黑（已修）。

## 接手的人要知道

- 三個 WIP 分支都是從 `claude/second-ai-env-art` 分出來的；交付時 merge 回 `claude/second-ai-env-art`（merge，不 rebase），再通知 LAWWW 用那個 merge commit 整合。
- ⑤ 的驗收用工作目錄 `/home/user/pav_wt`（server 8780）、⑥ `/home/user/props_wt`（8781）、⑦ `/home/user/trees_wt`（8782）；容器重開後這些目錄不在了，從 WIP 分支 `git worktree add` 回來即可。
- 截圖和整合測試的 PNG 不進 checkpoint（重拍得出來）；交付時轉成 WebP 再進 repo。
