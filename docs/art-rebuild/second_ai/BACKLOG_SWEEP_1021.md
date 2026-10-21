# BACKLOG-SWEEP-LAWWW2-1021：環境美術歷史遺留清查

LAWWW2-C，2026-10-21。
- 起因：使用者 10-21 08:43（UA-LAWWW-1021-02，LAWWW-C 轉）：
  - 「LAWWW2：清查所有未完成的建築、室內空間、模型、導航、碰撞、燈光及效能工作，包括過往各帳號留下的 WIP」；
  - 「不要只相信任務表的狀態，要比對實際程式碼、事件資料、提交紀錄與測試證據」。

## 比對範圍
- 開發分支 `fc7e87a1`（10-21 09:01 UTC）。
- 我的分支 `d3a755bb`。
- 8 條 `second-ai-env-art-wip-*`、`second-ai-env-art`、`funny-albattani`，以及 AA、BB、LAWWW 各帳號的分支。

## 資料
- `tasks.json`：挑出 LAWWW2 和環境美術相關的 241 項。
- `wip.json`、`WIP_INVENTORY_2026-10-17.md`、`outbox_LAWWW2.json`（55 筆）、`HANDOFF.md`、68 份 patch、開發分支的 `assets3d.js` manifest、GLB。

## 做法
- 唯讀；這一次清查本身沒有 commit 別人的分支。
- 美術子代理逐檔比 git blob、比 patch 加的行、掃 GLB。
- 我抽查了兩項：
  - 體育館 `gym_interior.glb` 有 50 個、`gym_b1.glb` 有 69 個 GLOW_ 節點，`gym3d.js` 一筆都沒處理；
  - `LICENSES.md` 沒有 `lane118_props`、`l118_omu`、`linze_3f`。
  - 兩項都屬實。
- **這次沒有重跑瀏覽器測試**；引用的 ALL PASS 都是之前的 Playwright＋SwiftShader 模擬，**沒有任何 iPhone 實機驗收**。

## A. 未完成、LAWWW2 負責（排進我的佇列，照這個順序）
| # | 項目 | 證據 | 下一步 |
|---|---|---|---|
| 1 | 體育館的光暈沒接（ART-GYM1） | `gym_interior` 50、`gym_b1` 69 個 GLOW_；`gym3d.js` 用 `attachRoomGLB`，不處理光暈。溫州街、公館已經有 `wzGlowBatch`（114a69fa） | **已交件**（`test_shots/gym_glow_1021/`）：patch＋重匯兩個 GLB（光暈大小改在腳本裡） |
| 2 | 體育館疊面（新發現，表上沒有） | 掃描：`gym_interior` 不同材質疊在一起 56 m²。<br>- 看台踢面 × 後牆墊 33.8 m²（4.68, 1.2, −19.0）；<br>- 鋼構 × 石牆 14.1 m²；<br>- 鋼構 × 燈 5.3 m²。<br>`gym_b1` 8.45 m² | **已交件**（同上）：一定會閃的 1F 5.41 → 0.95 m²、B1 2.23 → 0；56 m² 是連背對背（看不到）一起算的 |
| 3 | `LICENSES.md` 缺列 | 27 個已整合的 GLB 沒有列，`ntu_gym_ceremony.webp` 也沒有（清單在下面） | 寫補列 patch 交 LAWWW-C |
| 4 | 原始檔沒進開發分支（D88） | manifest 的 source 指到 13 支腳本，開發分支沒有（美國篇 7、機場、道具 2…）；`wancai_seminar.py`；新版 `campus_male1.py`／`linze_upper.py`；`ART_SOP` 等 6 份文件；`us_*.layout.json` | 列「檔案＋blob」清單，請 LAWWW-C 一次挑（不影響遊戲） |
| 5 | ART-BALCONY-POTS 公館那一半 | 沒有任何 commit | 照舊在佇列 |
| 6 | 社科院夜景（蓮花柱發白、窗戶單調；10-18 稽核 B9） | 沒有人查過，沒有任務 | 先拍遊戲內 19:30 截圖確認 |
| 7 | 小公園疊面 | `wz_park` 草地 × 石材 12.4 m²（16.23, 0, 27.31） | 確認會不會閃（修閃爍＝修 bug） |
| 8 | 室內疊面的尾巴（BUG-COPLANAR-DEV） | 法圖 12.3、總圖 6.4、萬才館室內 2.6、總圖 3F 1.7、宿舍大廳 1.0 m²（不同材質） | 遊戲內截圖；看不到就寫數字結案 |
| 9 | US-MARKET-STREET（兩家超市之間的停車場、馬路；使用者 10-17 選「做」） | `us3d.js` 第一階段直接接到亞洲超市門口 | GLB＋layout＋接線 patch |
| 10 | 3F 主球場接線（暫停中） | `gym_arena.glb` 在開發分支，沒有 manifest、沒有區域 | 等解除暫停 |

**LICENSES 缺列的 27 個 GLB**：
- 機場：`airport_arr`、`airport_dep`。
- 公館：`campus_gongguan_bd`、`gongguan_far`。
- 宿舍：`dorm_y2_items`。
- 118 巷：`l118_cafe2`、`l118_dian`、`l118_home`、`l118_korea`、`l118_noodle2`、`l118_omu`、`l118_pasta`、`l118_self`、`l118_tea`、`lane118_props`。
- 霖澤館、萬才館：`linze_3f`、`linze_4f`、`wancai_sema`。
- 美國：`us_apartment`、`us_shared`、`us_asian_market`、`us_cars`、`us_market`。
- 溫州街三家店室內：`wz_brunch_interior`、`wz_print_interior`、`wz_teahouse_interior`。
- 還沒接的：`gym_arena`。

## B. 暫停中（記下來，不做）
- **使用者 10-17「溫州街修改也暫停」**：ART-VSLICE＋`src/post3d.js`；ART-WZ0；ART-WZ1 公寓背面；ART-BALCONY-POTS 溫州街那一半。
- **ART-US2-FIX-1018** 美術那一半（冰箱、鏡頭那一半已整合 248cf684）。
- **人物（D99 凍結）**：CHAR-TEMPLATE、ART-13 明軒、ART-YT1 小修、ART-JIAHAO-JOY。
- **日本宿舍 3D**：我 10-21 做到你的房間（WIP），查到使用者 10-18 選「全 2D」以後停下來，見 `wip_jp/README.md`。

## C. 要 LAWWW-C（或 BB）一句話
| 項目 | 狀況 |
|---|---|
| **日本學期 3D 場景** | 使用者 10-18 14:0x 選「日本場景：全 2D（建議）」（UA-LAWWW-1018-06；JP-3D-ASK 取消，原文「LAWWW2 不做日本 3D」）；但 10-20 21:0x 的 JP-SEM-AA341 next 寫「3D 場景排給 LAWWW2 佇列 ⑤」。我先停，等你確認 |
| SCN-V5-02 畢業典禮 | 開發分支 `postgrad3d.js` 已經用 CG-9＋`graduation_avenue` 做好 → 應該改「取消／被取代」 |
| ART-02 教室門模組 | `teach3d.js` 寫正式室內 GLB 已經含門 → 結案？ |
| 法院 2D 兩張、戲院和咖哩店第五版、AA185 三張 | 只在我的分支；2D 依 D104 已歸 BB |
| Meshopt／KTX2 | 109 個 GLB 共 165 MB，只有 webp 貼圖。你 10-21 說 meshopt 先不接，記著 |
| 表外候補 | 經濟系 3D 缺口（B8）、共同教學館／女舍照片比對＋博雅光斑（B14）、男宿交誼廳家具（B16）要不要開任務 |

## D. 已經整合、任務表的狀態落後（請 LAWWW-C 改狀態）
- **GG-STREETVIEW-1020**（表上「進行中」）：0582af9f、1475d312、114a69fa；patch 加的行 100% 在開發分支、GLB blob 相同。
- **LINZE-WANCAI-FLOORS-1020**（「進行中」）：202／研討室 A／多功能 6ac74b06、8d341fe3；3F／4F 156430a2、5fc69491。
- **SCN-US-LIB**（「已實作待整合」）：d3fdab82（`us3d.js` 有 `us_lawlib`）。
- **VAC-A2**（LAWWW）：4782cc29。
- **ART-GG-SIGNS**（next 還寫「S5～S18 等使用者生成」）：ART-GG-SIGNS-2（6b8e2385）以後的版本已在開發分支。
- **ART-WZ3 v6／ART-WZ4b／ART-WZ5 v2**（next 寫「下一版」）：貓 `wz_cat.glb` blob 相同；Café 2d1e264c；溫州街 0f430885。
- **FIX-WZ-PERF**：已整合（a33d85b5 以後 `wz_street_integration` ALL PASS，模擬）。
- **ART-L118-LANE 效能**：536eec11 → 2fb01ed0。
- **wip.json 的 LAWWW2 項目**：
  - POTHOS-Y2ROOM 已整合（1053653c）；
  - US-APT 已整合；
  - PORTRAITS3 改名 econ_* 以後 blob 相同；
  - CHAR-SCRIPTS：小語做完（55b67ccf），明軒凍結；
  - SHOP-BG 歸 BB。

## E. 已整合、狀態正確
- outbox 55 筆裡，交付的 GLB、VRM、layout 都在開發分支：blob 相同或已是更新版。
- 不算的 3 筆本來就不整合或被取代：`socsci_bldg1f`、`us_street`、facetest。
- 6 份生成的配置 JS 和 layout.json 內容一致；`gen_shop_layouts.py --check` OK。

## F. 舊 WIP 分支（D88 結論成立）
- 8 條 `-wip-*`、`second-ai-env-art`、`funny-albattani`：沒有獨有的資產或腳本。
- 只有舊的 `src` 快照，開發分支比較新；bundle 備份在我的分支 `wip_backup/`。
- **注意**：開發分支的 312／409／507 窗景比我的分支新，不要用我的分支蓋回去。
