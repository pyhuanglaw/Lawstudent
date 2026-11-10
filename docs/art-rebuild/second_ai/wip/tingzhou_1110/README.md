# TINGZHOU-AREA-1110 汀州路商圈 第 1 版（X321／X322；LAWWW2 帳號 A，2026-11-10）

**第 1 版（最多 3 版就進遊戲，D141）。狀態：待整合。遊戲畫面還沒有人看過**——下面的圖都是 Blender 預覽（EEVEE，光線不是遊戲的）；同角度的遊戲截圖要 CC 拍（D131），場景美術 BB 判（D120）。

## 依據（`docs/art-rebuild/second_ai/ref/tingzhou_1110/`）
- `USER_INSTRUCTION_1110.md`：使用者 11-10 的四則原文（方向七點、3D 美術製作指令、「118這麼醜…你依照我的」、夜市攤位六點）。
- `concept/`：使用者自己生成的五間店面概念圖＋傍晚街景＋總覽（主要美術參考；README 有原文、拆圖）。
- `REF_ANALYSIS.md`：四張真實街景照片、三張地圖各參考什麼（第三方，不進 repo）。
- 配置提案 `../../proposals/tingzhou_area_1110.md`（LAWWW 18:42 同意）。

## 這一版有什麼
| 檔案 | 內容 |
|---|---|
| `src/data/tingzhou_layout.js` v3 | 汀州路三段一段 80 m（路寬 10 m、雙黃線、路邊機車格），兩側騎樓 3.2 m；巷 A（往公館，24 m）。29 間店面，寬 2.5～12 m、3～7 層、裝修年代（old／mid／new）和店面（整面開、玻璃、半開、市場）各不同。**使用者指定的八間**：泰米村食（巷 A 正對面）、洗樂洗衣坊、印得好（巷口兩邊）；越好吃小館、客居雲南、東南大聯商行、汀州聯通、溫特寶邸（西側 z 3～32，照傍晚街景概念圖的順序）。其他 21 間只寫店的種類（緬甸、印尼、馬來西亞、海南雞飯、人文咖啡、運動用品、豆花…），**不是店名**——使用者 19:0x「店面新增由我決定」，等她定。水源市場在東側南端。 |
| `src/tingzhou3d.js` | 新區域 `tingzhou`：導航（路面、兩側騎樓、巷 A 走得到；店面玻璃後、樓房、柱子擋）、地面（套件暫代）、備用方塊＋鏡頭碰撞、每間店門口的「看」（之後有 `tz_<id>` 室內就變「進」）、「往公館」、路燈和夜間光圈、正式模型接法（`Z3.attachWenzhouModel`）。`S.hookGongguan()`：包住公館的 build，在店面街 G10 門口（37.1, 21）加「往汀州路（巷子）」→ 巷 A 東端（**不改 zones3d.js**）。 |
| `assets/models/env/second_ai/tingzhou_street.glb`（7.2 MB、7.6 萬三角形、畫出來 10.5 萬） | `wz_street.py --set tingzhou`：公館騎樓那一套店面組件，每間照 era／front 換門、地磚、燈、門口雜物；直立燈箱 2.6～5.8 m 長短不一＋樓上住戶的直立招牌；鐵窗、冷氣、盆栽比溫州街密。**五間照概念圖**（`TZ_XS`，`wz_shopkit.gg_front`）：招牌、店內、門、照片菜單從概念圖拉正（`tz_fronts_tex.py` → `tz_fronts_atlas`，嵌在 GLB）；雨棚、框、鵝頸燈、盆栽是 3D。 |
| `tools/blender/env_second/wz_street.py`、`wz_shopkit.py` | 加 `tingzhou`（其他 set 的輸出不變：只加分支和 `vlen` 預設 2.6）。 |
| `tools/blender/env_second/tz_fronts_tex.py`、`textures/gen/tz_fronts_atlas.{jpg,json}`、`tingzhou_preview.py` | 貼圖集腳本與產物；Blender 預覽（招牌字、路面、白天／傍晚／夜間）。 |
| `index.html`、`src/data/zone_assets.js`、`LICENSES.md` | 載入兩個檔（接在 xinsheng3d.js 後面）；`gen_zone_assets.js` 重產；一列。 |
| `tests/tingzhou_unit.js` | 新測試（下面）。 |

## 測試
- `node tests/tingzhou_unit.js`：12 項——區域登記；出生點、「往公館」；八間店名一字不差、五間同側照順序相連；29 間店門口都有互動點、站得住、走得到；店面不重疊、沒有空隙、寬度和樓層至少三種；路走得到兩頭、過得了馬路（不是封閉的夜市）；店面後面、樓房裡站不住；柱子擋住、巷子兩側擋住；公館有「往汀州路」；模型的樓房數＝店數＋巷 A 三棟、有五間的貼圖集。**修改前（開發分支）：0 就 FAIL。修改後 ALL PASS。**
- 全部 Node 測試（1,241 支，底 70047bb79）：只有 `aa655_wz_rename_unit` FAIL 1——我把洗樂洗衣坊的種類寫成「自助洗衣」（那支測試不准 src 出現溫州街的舊店名「自助洗衣」）→ 改成「投幣洗衣」，重跑 PASS。其他沒寫 ALL PASS 的是說明檔、或用別的字（全部通過）。
- 最新開發分支（25c3039ec）上的相關回歸 85 支（讀 index.html、建公館、列區域的測試＋本支、aa655、zone_prefetch、nav_buildings、loadgen_locks）：ALL PASS（`regression.log`）。patch `tingzhou_v1.patch` 的底＝25c3039ec，`git apply --check` 乾淨。

## 圖（Blender 預覽，不是遊戲畫面）
- `compare_v2_concept_vs_blender.jpg`：左＝使用者的傍晚街景概念圖，右＝同方向的 3D。
- `blender_v2_dongnan_front_dusk.jpg`：東南大聯商行正面（左客居雲南、右汀州聯通、溫特寶邸）。
- `signs_from_concept.jpg`：五塊橫招牌從概念圖拉正的結果。

## 先將就的（和概念圖、使用者指示的差距；照實列，D141）
1. **光線、氣氛**：概念圖是暖色傍晚（店裡暖光、樓上亮窗、紫橘天空）；預覽偏平、偏灰粉。遊戲的光要看 CC 截圖。
2. **騎樓**：概念圖的五間店面直接臨人行道；這一版在 3 m 深的騎樓後面（總覽圖寫「騎樓連續」），柱子切過店面、招牌掛在騎樓梁上比較高。**已問使用者要不要騎樓／混合，還沒回。**
3. **樓上太乾淨**：凸出的鐵窗、冷氣、盆栽、管線、電線還不夠密（使用者第四則第 2 點）。
4. **沒有生活**：沒有夜市攤、停著的車、站牌、黑板立牌、機車彎；機車還沒擺（遊戲的機車另外放，照公館那一套）；街兩頭是空的（沒有遠景樓房）。
5. **其他 21 間**是一般店面（組件），沒有照任何參考圖；店名只有種類。
6. **泰米村食、洗樂洗衣坊、印得好**的外觀還沒照 GG_SHOPS3_1110.md 第三節做（現在是一般店面＋種類配色的招牌）；室內（AA_743）還沒做——門口是「看」。
7. **公館那一邊**只多一個互動點；G10 的店面模型還沒改成巷口，G09／G10／G11 原本的店門互動點還在（LAWWW 的 TINGZHOU-SHOPS-MOVE-1110）。
8. 騎樓柱子的導航位置照規則算（每棟一根、在一端），**沒有讀 GLB 對過**（新生南路有那種測試，這一版還沒寫）。
9. 地面是套件暫代（柏油、騎樓地坪是純色平面）。

## 下一版（第 2 版）打算做的
使用者回騎樓的決定以後：五間店面照概念圖再貼近（門口的東西、雨棚）；樓上加密；泰米村食等三間外觀照規格；夜市攤模組（`STALL_<種類>_open／_closed`，AA_744 第 2 節的品項）；街兩頭遠景；公館 G10 巷口模型；柱子對 GLB 的測試。

## 建置（雲端新容器）
`bash tools/blender/setup_env.sh`；`tools/blender/env_second/textures/gen/` 用 `claude/second-ai-env-art` 的（開發分支少很多檔）；缺的 Poly Haven 貼圖用 `lib2.fetch(<id>)`；`/opt/blenv/bin/python tools/blender/env_second/tz_fronts_tex.py`（要概念圖資料夾，或 `TZ_CONCEPT=<路徑>`）→ `wz_street.py -- --set tingzhou`。
