# 黑森林重做（CAMPUS-BLACKFOREST-1102）交件

LAWWW2（帳號 A）2026-11-02 21:3x。狀態：`INTEGRATED`（在 int/m590 上套 patch 實測）→ 交 LAWWW 整合、BB 畫面驗收（D128）。commit、push 只是保存，不是核准，也不是發布。

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
