# LIB-B1-COURT-ART-1110：總圖 B1 的露天下沉中庭（X307）

- 使用者 11-10 對 LAWWW：「總圖b1樓梯 是往地下走到一個中庭 中庭的部分，我現在看不出來 你請lawww2做」。
- 狀態：`MODEL_READY`（v1）。LAWWW2 帳號 A，11-10。
- 照 D141，這一版就先進遊戲；之後只改使用者說的、或擋玩的。

## 做了什麼
Blender 腳本 `tools/blender/env_second/lib_b1_court.py` → `assets/models/env/second_ai/lib_b1_court.glb`（8,582 個三角形，約 0.96 MB）。

尺寸全部照 `src/zones3d.js` 的 `B1C`（LAWWW-B 第一階段 BLOCKOUT）：中庭 x 92～104、z −41～−31、深 4.2 m，北邊 24 階，南牆的 B1 玻璃門在 (98, −31)。導航、門、樓梯一格都沒動。

| 部位 | 做法 |
|---|---|
| 擋土牆 | 清水模（社科院同一種木紋模板），每 1.2 m 一條施工縫，上緣花崗石壓頂、滴水線 |
| 地面那一圈的矮牆 | 同材質，兼種花槽：土、一叢叢灌木，常春藤從牆頂垂下來 |
| 地面 | 花崗石大方磚，深色收邊，東、西兩條排水溝蓋 |
| 樓梯 | 花崗石踏面＋深色防滑條、清水模踢面；靠中庭一側是跟著樓梯斜的清水模矮牆＋不鏽鋼扶手；北牆也有扶手、每三階一盞腳燈 |
| 南牆（B1 外牆） | 鋁框玻璃帷幕、雙開玻璃門＋直把手、門上的玻璃雨遮（不鏽鋼拉桿）＋崁燈、招牌「總圖書館 B1／24 小時自習室」 |
| 玻璃後面 | 亮著的自習室：天花板、後牆、兩排桌椅的剪影 |
| 中庭裡 | 兩個花崗石樹槽（小樹＋蕨）、東牆前一張石凳（木頭坐面）、東西牆上四盞壁燈 |
| 晚上 | 燈的材質是 `lbc_lit_*`，接線時登記 TK.addNight：晚上 1.4、白天 0.35 |

- 參考：`docs/handoff/user_shots/1110_library_b1_plan_ref.webp`。照氣氛做、不照抄（D136）。
- 對照 `b1c_v1_sheet.jpg`：
  - 左上是 LAWWW-B 的 BLOCKOUT 遊戲截圖；
  - 右上是 Blender 白天從中庭看門；
  - 左下是同一角度的晚上；
  - 右下是晚上從地面的樓梯口看下去。
  - 這些是 Blender 渲染，不是遊戲截圖。預覽沒有地面，所以外牆露出來；遊戲裡草地會蓋住。

## 接線 patch（`lib_b1_court_9202e2fab.patch`，接 9202e2fab）
- `src/zones3d.js` 的 B1C 那一段：
  - BLOCKOUT 的方塊、地面、招牌、扶手都收進 `b1c_fallback` 群組。正式模型載好以後藏起來；載入失敗就照舊用方塊。
  - 牆的碰撞盒照舊在 `E.colliders`。Raycaster 不看 visible，藏起來照樣擋鏡頭。
  - 載入 `bldg.lib_b1_court`：燈、玻璃、葉子不投影，燈登記 TK.addNight。
  - **新加的導航阻擋只有三個**：兩個樹槽 (102.2～103.9, −32.8～−31.1)、(102.2～103.9, −38.9～−37.2)，石凳 (103.35～103.95, −36.4～−33.8)。數字和 `lib_b1_court.json` 的 planters、bench 一樣。
- `src/assets3d.js`：manifest 加 `bldg.lib_b1_court`。
- `src/data/zone_assets.js`：用 `node tools/gen_zone_assets.js` 重新產生，campus 多一個。
- `LICENSES.md`：加一列。
- 新測試 `tests/lib_b1_court_art_unit.js`：
  - 開發分支原樣 FAILED 5 → 加 patch ALL PASS；
  - 原本的 `tests/lib_b1_court_unit.js`（第一階段）照舊 ALL PASS。

GLB、json 要從 LAWWW2 的分支拿：`assets/models/env/second_ai/lib_b1_court.glb`、`.json`（sha256 見下方）。

## 還差的
- 樓梯口在地面那一端，斜矮牆最上面一段比地面高 0.85 m（擋人掉下去），從遠處看是一片牆。
- 自習室只是玻璃後面的剪影，走不進去（進 B1 照舊換區域）。
- 白天、晚上的亮度要看 CC 的 PC 截圖：中庭在地下 4.2 m，遊戲的陰影可能讓地面偏暗。

| 檔案 | sha256 前 16 碼 |
|---|---|
| assets/models/env/second_ai/lib_b1_court.glb | 37a43ef393c6552e |
| assets/models/env/second_ai/lib_b1_court.json | 30c0418026dc441f |

- 回歸：在 9202e2fab 上跑 50 支，ALL PASS（`regression_9202e2fab.txt`：B1 中庭、B1、校園、導航、zone_prefetch、劇情相關）。

## 第二輪：鏡頭在背後時畫面下半白霧（BB 11-10 PC 跑 10df264ed，GAME_BUG）——2026-11-10
- **原因**：
  - 站在 B1 門口（南牆前約 0.9 m）時，鏡頭在玩家南側。
  - engine3d.js 的 followCam 碰到南牆的碰撞盒會拉近，但最近只拉到 0.7 m，所以鏡頭會跑到玻璃帷幕（`lbc_glass`，z −30.94）後面。
  - 玻璃是雙面的，從背後看就是一整片半透明面蓋住畫面下半。玻璃上緣 Y+2.92 以上看得清楚，所以截圖上半是正常的。
- **修法**：`lib_b1_court.py` 讓玻璃帷幕只畫朝中庭那一面（`use_backface_culling`），重匯 GLB。
  - 從背後看，玻璃不畫，看出去就是中庭；從中庭看玻璃照舊。
  - 雨遮照舊是雙面。只改材質，三角形數 8,582 不變。
- **測試** `tests/b1court_glass_cam_unit.js`：在 Node 建出遊戲真正的校園（碰撞盒、followCam），玻璃直接讀 GLB。
  - 量到 65 次鏡頭跑到玻璃後面。
  - 舊 GLB：65 次都看得到玻璃，第 2 項 **FAIL**。新 GLB：0 次，**ALL PASS**。
  - 從中庭看玻璃：4/4 照常畫得到。
- **回歸**（1c767edf8＋patch）：`regression_fog_1c767edf8.txt`。b1court_glass_cam、lib_b1_court_art、lib_b1_court、ground_zfight、campus_public 都 ALL PASS。
- **patch**：`b1court_fog_1c767edf8.patch`（`git apply` 用 `--binary` 產的：GLB、json、新測試）。腳本在本分支 `tools/blender/env_second/lib_b1_court.py`。
- **沒有改的**：鏡頭最近 0.7 m 的規則（引擎共用，LAWWW 的範圍）。白霧的根本原因是看到玻璃背面，所以模型這邊修就夠了。
- **沒有測過**：瀏覽器畫面（等 CC 用同一個 probe 的 03、07 兩個鏡頭重拍）。
