# WINVIEW-MIRROR-TREE-1114：窗景裡左右對稱的樹（公館安泰、鮮果、榮恩典）

狀態：`READY_FOR_REVIEW`（第一部分：patch＋Node 測試；遊戲內還沒拍）。LAWWW2-B，2026-11-14。

## 問題（BB-B 11-14，PC GPU，WINVIEW_GG3_dev @c109767aae，BB_379）

- 安泰：右格半空一團左右對稱的樹葉（像一張臉），沒有樹幹。
- 榮恩典：左格的樹左右對稱像萬花筒，樹冠中間對折。
- 鮮果：左邊半空一團對稱樹葉；近處大樹的樹冠也是鏡像。
- 圖：claude/cc-local `docs/story_planning/CC/local_out/WINVIEW_GG3_dev/out/win_gg_{antai,rongendian,xianguo}_{1400,2000}_card1.png`。

## 原因一（這一包修）：照片外面鏡像取樣

- 視差窗景（`src/world3d.js` 的 `W3.windowMat`）把一張照片當成窗外幾公尺遠的一面景。鏡頭抬高或往旁邊看，視線會落到照片外面。
- 第一版：夾在邊上那一排像素 → 拉成條紋（WINVIEW-EDGE-STRIPE-1114）。
- 第二版（11-14 稍早整合 fc1813e4f2）：鏡像回來 → 條紋沒了，但邊上的樹被對折：上緣的樹冠往上再畫一次＝半空一團沒有樹幹的對稱樹葉；左右邊的樹＝萬花筒。
- 這一版：位置夾在邊上，但改取很模糊的那一層（mipmap 往上 7 層，1024×512 剩 8×4 格）。邊緣顏色柔和地往外延伸，沒有細節可以拉成條紋，也沒有東西可以對稱。超出 2.5% 以內由清楚漸漸變模糊。
- 全遊戲所有照片窗景共用這個 shader，都跟著改。

## 原因二（這一包沒修）：近景、遠景分層把樹切開

- BB-B 的線索：公館三間的近景層多了一小撮樹葉和一片圓形花台面，沒有樹幹和花台側面（claude/cc-testing `docs/story_planning/CC/cloud_out/WINVIEW_GG3_1939_r3_remat/remat_check.png`）。
- 原因：`tools/shots/shop_views_layers.py` 照距離 D 切近景／遠景，樹剛好跨在分界上。
- 改法：分界改成不切過樹和花台（整棵歸同一層），然後三間重拍。重拍要在使用者電腦跑（瀏覽器，D131），排 CC。**還沒做**。

## 測試

- `tests/winview_edge_mirror_1114_unit.js`（原本驗鏡像的那一支，改成驗新做法，10 項）：開發分支 b4663868c1 原樣 FAILED 4（`test_before.txt`）→ 套 patch ALL PASS。
- 回歸：用到 `windowMat`／`setWindowView`／`viewPhoto`／`VIEW_LAYERS` 的 8 支 Node 測試全部通過（`regression.txt`）。
- Node 測試只驗 shader 字串和公式；shader 在瀏覽器編不編得過、畫面對不對，雲端沒有驗（D131）。

## 還沒做的、風險

- 遊戲內重拍：請 CC 用 WINVIEW_GG3_dev 同樣的鏡頭拍公館三間（14:00、20:00），另外抽一間教室、一間宿舍的窗確認沒有變糟。
- 風險：照片外面現在是模糊的色塊；上緣是樹的照片，往上看會是一片柔和的綠／天色，不是天空。要更好只能把照片拍高一點（重拍）。
- 風險：`texture2D(map,uv,bias)` 第三個參數在 WebGL2 沒問題；WebGL1 的裝置也支援（片段著色器），但沒有實機驗過。
- 原因二的重拍。

## 套用

```bash
git apply docs/art-rebuild/second_ai/wip/winview_mirror_tree_1114/winview_edge_blur_on_b4663868c1.patch
node tests/winview_edge_mirror_1114_unit.js
```
