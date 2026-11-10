# NTU-REF-1110 ③-3：映月湖（醉月湖）亭子改綠色琉璃瓦、紅欄杆、加三棵垂柳（X223／D136）— LAWWW2 帳號 A，2026-11-10

- 狀態：`MODEL_READY`，交 LAWWW 整合；BB 判（第 1 版）。以開發分支 74da28ca9 為底。
- 遊戲截圖、同角度疊圖請 CC 拍（`--mode campus`）。
- 對照圖 `lake_before_after.jpg`：左舊右新，上面是木棧道近景，下面是湖岸遠景。Blender 渲染。
  - **注意：這個預覽工具不做透明裁切**，所以垂柳的葉片卡在圖裡是一整片方塊，看起來很糟。
  - 遊戲裡是 alphaTest 裁切：細枝和細長的葉子，背景透得過去。真正的樣子要看 CC 的遊戲截圖。

## 依據
官網照片的文字，見 `docs/story_planning/ref_images/buildings/README.md` 醉月湖那一列：
- 六角亭、綠色琉璃瓦；
- 湖邊垂柳、紅色木欄杆。

## 改了什麼
### `tools/blender/env_second/campus_lake.py`
- **亭子的瓦**：深灰改成綠色琉璃瓦。
  - 顏色 `#3f7a4f`，飽和度 0.8，粗糙度 0.32（有琉璃的光澤）。
  - 亭子原本就是六角，形狀不動。
- **木棧道的欄杆**：改成紅漆，新增網格 `lake_boardwalk_red`。棧道的踏板照舊是木頭。
- **三棵垂柳**：
  - 位置：西北 (−13, 6.92)、東北 (9.75, 7.01)、東岸 (16.77, 1.3)。
  - 樹幹在湖岸石砌的內側，也就是水裡；遊戲的導航本來就擋住這一帶，所以**導航不動**。
  - 每棵離木棧道、湖心亭都 3 m 以上。
  - 葉片是往下垂的長條葉片卡，材質 `lk_willow_leaf`，alphaMode MASK。
  - 葉片的貼圖 `textures/gen/willow_strand.png` 是腳本用 PIL 畫的（透明底、細枝＋細長葉子），每次匯出重畫，不用另外保存。
  - 位置寫進 json 的 `willows`。
- 不照抄：
  - 「分三池」、石拱橋這一版沒做，湖還是一個。
  - 亭子的斗栱、匾額照舊是自己的簡化設計。

### `src/zones3d.js` 的 `attachLakeGLB`（多一行）
- 垂柳的樹幹和葉片都打開網點透空（樹擋住玩家時會透）。
- 葉片另外設定：不投影、`alphaTest ≥ 0.5`、雙面。
  - 不投影的原因：長條葉片卡投下的影子是一條一條的方塊。

### 數字
| | 修改前 | 修改後 |
|---|---|---|
| 三角形 | 8,604 | 9,462 |
| 材質 | 12 | 14 |
| GLB | 885 KB | 968 KB |

## 測試
- 新測試 `tests/ntu_ref_lake_unit.js`：
  - ① 綠色琉璃瓦，木棧道是紅漆欄杆；
  - ② 三棵垂柳，樹幹在湖岸裡面，離木棧道、湖心亭 ≥ 3 m，葉片卡是 MASK；
  - ③ 在 Node 建的校園裡，走遊戲的 attachLakeGLB 接上：葉片不投影、alphaTest ≥ 0.5、雙面，樹幹和葉片都網點透空。
- 結果：**開發分支 74da28ca9：FAILED 3**；套上 patch：**ALL PASS**。
- 回歸：讀到醉月湖、校園、attachLakeGLB、seeThrough 的 35 支，加上新測試，全部通過。見 `regression.log`。

## 整合
- `git apply --binary ntu_ref_lake_1110.patch`。已確認可以套在 74da28ca9 上。
- 內容：campus_lake.glb／json、campus_lake.py、zones3d.js（一行）、新測試。

## 還沒做（BB 判了再說，D141 最多 3 版）
- 湖分成兩池或一道堤。
- 湖邊的木平台、石板橋。
