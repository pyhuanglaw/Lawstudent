# 總圖多媒體中心：南牆的洞洞板不再浮在半空（LAWWW2-B 2026-11-08；BB-B 01:46 PC GPU 第一批第 1 點；D108 場景）

**狀態：交件**（`<本 commit>`）。模型已改好，光照從新白模重烘（512），測試過。

## 現象
- BB-B 01:46 的回報（AB3LM media 那張，烘前烘後一樣）：「鏡頭左邊那面牆上方直接看到天空，掛著牛頓擺的木板像浮在半空」。
- 「牛頓擺」是南牆（+z，門那一面）的洞洞板：上面掛著十副耳機、十個掛勾。

## 原因：有兩個
1. **看到天空：是 CC 拍照工具的問題，遊戲本身沒有。**
   - 遊戲主迴圈（engine3d.js `updateCamera`）每一格做兩步：`fadeWalls`（擋在鏡頭和人中間的牆，透明度設成 0.12），再 `hideFaded`（透明度 0.5 以下的牆直接藏起來）。
   - CC 的 `cc_d141_lib.py` CAM 只做第一步，淡出的牆留著 0.12 的透明度，所以看得到牆外的天空。
   - 建議 CC 在 `fadeWalls` 後面補一行 `if(E.hideFaded) E.hideFaded();`。01:59 已經告訴 BB-B。
2. **木板浮空：是模型的問題，遊戲裡一樣會出現。**
   - 洞洞板、耳機、掛勾原本做在 `library_media_props`、`library_media_metal` 裡。這兩個網格是整間房間的小東西合成的，名字不是 `WALL_` 開頭。
   - 所以鏡頭在南牆外面、南牆淡出的時候，它們照樣畫出來，就浮在半空。

## 怎麼修
- `tools/blender/env_second/library_media.py`（`5bec6898f`）：洞洞板、耳機、掛勾放進南牆那一組，改叫 `WALL_S_pegprops`、`WALL_S_pegmetal`（`dir [0,0,-1]`）。
  - `attachRoomGLB` 會把 `WALL_` 開頭的網格當成牆，所以它們會跟著南牆一起淡出、藏起來。
  - 名字裡有 props／metal：照舊不烘光照貼圖（`bake_rooms_ab3.sh` 的 `--nolm`），和原本一樣。
- 配置 `layout.json` 不變。其他節點、材質、座標也都不變，只多兩個節點（`glbdiff` 逐節點比過）。
- 光照要重烘：舊檔已經烘過，不能拿來再烘（第二套 UV 會疊兩次），所以用新匯出的白模。
  - `bake_rooms_ab3.sh` 這次加了 `INDIR=<資料夾>`（`5bec6898f`），輸入檔已經有 `extras.lightmap` 就會停下來。

## 動了誰做的哪個檔
| 檔案 | 誰做的 |
|---|---|
| `assets/models/env/second_ai/library_media.glb`、`library_media_lm_day.webp`／`_lm_night.webp`、`tools/blender/env_second/lightbake/library_media_lm.json` | **LAWWW2**（#82 第六間 `a8c448288`；光照 `f7f4b80e8`） |
| `tools/blender/env_second/library_media.py` | **LAWWW2** |

- `library_media.glb` sha256：開發的 `8a3fe4d4…` → `40abc920…`；大小 2,122,568 → 2,123,980 B。

## 要接的檔（`<本 commit>`）
- `assets/models/env/second_ai/library_media.glb`、`library_media_lm_day.webp`、`library_media_lm_night.webp`。
- `assets/models/env/second_ai/library_media.json`：匯出紀錄，節點 21 → 23。
- `tools/blender/env_second/lightbake/library_media_lm.json`。
- 新測試：`tests/library_media_peg_unit.js`，在這個資料夾。
- 腳本：`library_media.py`、`bake_rooms_ab3.sh` 已經在 `5bec6898f`。
- `library_media.layout.json` 不變。

## 光照
- 用 `INDIR=<白模資料夾> bash tools/blender/env_second/lightbake/bake_rooms_ab3.sh 512 library_media` 烘，燈和參數和 `f7f4b80e8` 那一版一樣。
- 白天／晚上 0.428／0.427，和那一版完全一樣。
- 節點：只多 `WALL_S_pegprops`、`WALL_S_pegmetal`，其他名字、材質都一樣。新的兩個不烘（名字有 props／metal），照舊即時光。

## 測試（Node，D131；工作樹＝開發最新 `838db8710`）
- **`library_media_peg_unit.js`**：在 Node 建出遊戲真正的 library_media 區域、接上 GLB，照遊戲主迴圈做 `fadeWalls` → `hideFaded`。
  - ① GLB：洞洞板那一塊（x −0.45～2.25、y 1.2～2.0、z 3.38～3.5）的頂點只在 `WALL_S_*` 網格裡。
  - ② 鏡頭在南牆外 (1.0, 3.2, 7.2)：南牆整組藏起來，洞洞板那一塊沒有畫得出來的頂點。
  - ③ 鏡頭在房間裡（CC 那一張 (2.89, 1.6, 2.05) → (0, 1.1, 3.5)）：南牆、洞洞板都在。
- 結果：
  - 開發最新的原檔：**FAILED 2**。① ② 不過，`library_media_props`、`library_media_metal` 在南牆淡出後照樣畫出來。
  - 這一版：**ALL PASS**。
- 提到 library_media、`rooms_ab3`、`aa399_closed2` 的 10 支全部過。
- 不用改程式。

## 還沒驗
- 遊戲內：請 CC 在拍照工具 `fadeWalls` 後面補 `if(E.hideFaded) E.hideFaded();`，重拍 AB3LM media，BB-B 判。
- 拍南牆外看進去那一張，洞洞板應該跟著牆一起不見。
