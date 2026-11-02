# 黑森林重做（CAMPUS-BLACKFOREST-1102）交件

LAWWW2（帳號 A）2026-11-02 21:3x。狀態：**v4 WIP**（22:3x 起和法學院區重排合成一份 patch，見下面 v4 一節；第一版的 patch 不要整合）。BB 畫面驗收（D128）。commit、push 只是保存，不是核准，也不是發布。

## 起因

使用者 11-02 20:3x 直接說：「你的黑森林超奇怪的，而且裡面怎麼還會有草皮中的磁磚啊，而且你這一小塊根本就不能叫做黑森林」（UA-LAWWW2-1102-12）。
第二十四批的黑森林：法學院廣場南邊 34×14 m、11 棵樹散在草地上，「小步道」是淺色地磚。

## 改了什麼

| 項目 | 改前 | 改後 |
|---|---|---|
| 範圍 | 約 480 m² | 約 1,450 m²：北塊 x 37.5～100、z −78.6～−65.4；南塊 z −54.6～−44.6；z −60 那條路變成穿過森林 |
| 樹 | 11 棵 | 52 棵（榕樹 35 棵：氣根、樹冠寬、深綠；其他是樟樹），間距約 4 m、樹冠交疊；樹幹擋導航 |
| 地面 | 草皮＋地磚步道 | 落葉泥土地（Poly Haven `forest_leaves_02`）＋土徑（`forest_ground_04`），露出地面的榕樹根；**沒有草皮、沒有地磚** |
| 林下 | 沒有 | 152 叢：蕨類（羽狀葉）＋矮灌木（不規則葉叢卡，第一版是方形綠箱子，已重做） |
| 水池 | 第二十四批的小水池 | 照舊 |

- 真實的黑森林：國青宿舍、霖澤館、萬才館之間一大片茂密的樹林，約 9,660 m²，以榕樹為主（維基百科〈國立臺灣大學黑森林〉；台大自然保育社 2012 年紀錄）。遊戲的法學院區壓縮過（D25），位置照使用者的法律學院配置圖（D31）。
- 配置：`tools/blender/env_second/campus_blackforest_layout.py --write .` → `src/data/blackforest_layout.js`（遊戲和 Blender 讀同一份）。
- 模型：`tools/blender/env_second/campus_blackforest.py` → `assets/models/env/second_ai/campus_blackforest.glb`（7,346 三角形、5 個材質、0.9 MB）。樹用遊戲現有的 `TK.tree`（street_trees 正式模型，instanced）。
- 路人、騎腳踏車的人：路人用找路；`story3d.js` 騎車路線第一條改繞過森林（騎車是直線、不找路）。

## v4（11-02 22:3x，跟法學院區重排一起；取代上面第一版的範圍、數字與 patch）

- **起因**：使用者 21:3x 五張實景照片＋「兩個系館之間、真的很大」「從系館之間的走道會經過小湖，湖再往校園才是黑森林」（UA-LAWWW2-1102-15）；BB_248 五點（樹不規則、彎曲溝渠池、蕨類少一點、柳葉細一點、照片同角度比較）；使用者 22:1x 選法學院區重排（UA-LAWWW2-1102-16，見 `../campus_relayout/README.md` 最後一節）。
- **範圍**：五塊，共 **1,572 m²**、**81 棵**（Poisson 間距 2.8～4.6 m；大小 0.6～1.3 倍；榕樹 55%、樟樹 25%、高樹 20%；每棵樹皮顏色不同〔`TK.tree` 的 bark instanceColor〕）。萬才館前的弧形量體、大樓梯前留廣場（舖面）。
- **小湖**：霖澤館前庭東南，彎曲溝渠池（5 個控制點、寬 2.4～4.8 m），水泥邊（Poly Haven `concrete_wall_006`）、深綠水面、對岸石頭（`mossy_rock`）與紙莎草、西北角一棵垂柳（340 條細葉卡）。兩館之間的鋪面走道 (x 68.5) 從小湖東邊經過；湖邊一張長椅「坐在小湖邊的長椅」。
- **地面**：落葉泥土地＋落葉貼花（裁在範圍裡，不蓋到路）＋土徑；蕨類比例降到 20%。
- **模型**：`campus_blackforest.glb` 7,442 三角形、12 個材質、1.0 MB（v3 的 7,346／5 個材質；材質多是池邊、石頭、柳樹、紙莎草）。
- **patch**：`law_relayout_blackforest_1102_wip.patch`（和法學院區重排同一份，**取代 `blackforest_1102_wip.patch`**）。
- **測試**：`blackforest_unit.js`（v4：範圍 ≥ 1,500 m²、85% 以上在小湖南邊、萬才館入口、國青／研三舍／萬才館後面走不到…）ALL PASS；其他見重排那一節。照片同角度比較圖（照片 2 小湖、照片 5 土徑）排在瀏覽器測試後面拍。

## 給 LAWWW 的 patch

`blackforest_1102_wip.patch`（對 int/m590 `0e11c43a3`，`git apply --cached --check` 過）：`index.html`（載入 blackforest_layout.js）、`src/assets3d.js`（`bldg.campus_blackforest`）、`src/zones3d.js`（森林：沒有 GLB 時的備用地面、樹、導航；萬才館那條 4 m 路改土徑、讓開兩棵原本的樹）、`src/story3d.js`（騎車路線）、`src/data/blackforest_layout.js`、`tests/blackforest_unit.js`。
二進位檔從本分支拿：`assets/models/env/second_ai/campus_blackforest.glb`、`.json`；貼圖已嵌在 GLB。

## 測試（在 int/m590＋這份 patch 上；雲端 SwiftShader，不是手機實機）

| 測試 | 結果 |
|---|---|
| `node tests/blackforest_unit.js`（樹不擋土徑、路人的點、水池；騎車路線離樹幹 ≥ 1 m…） | ALL PASS |
| `tests/campus_layout_nav.py` | ALL PASS（21:13） |
| `tests/reachability_all.py --zones campus`（45 個互動點、9 個出入口） | ALL PASS（21:14） |
| 遊戲內截圖改前／改後（同鏡頭 8 張 × 兩輪） | `cmp_f1.jpg`、`cmp_f5.jpg`（第一輪）、`cmp2_a.jpg`、`cmp2_b.jpg`（灌木重做以後） |

還沒做：`campus_glb_integration`（效能：多 52 棵樹、152 叢林下植物；樹是 instanced，草叢在一個網格裡）——排在總圖測試後面，數字出來補在這裡。實機沒測。

## 還沒達到的（自己看出來的缺點）

- 林下的亮度：樹冠交疊，但畫面還不夠「陰暗」（遊戲是即時光、沒有烘焙；BB 看要不要加深地面顏色）。
- 灌木葉叢卡從某些角度看得出是平面（三張交叉的卡）。
- 總圖展演廳窗外的黑森林照片（`library_view_trees_*`）還是舊的，要重拍（`tools/shots/library_views.py`）。
