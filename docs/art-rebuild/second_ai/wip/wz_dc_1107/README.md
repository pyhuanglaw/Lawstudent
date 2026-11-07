# PERF-WZ-DC-1107：溫州街的 draw call（LAWWW2-B 2026-11-07；LAWWW-B 09:04 選 1 先做）

**起因**：
- CC-B PERF_COLD（`b987cb1cf`）量到溫州街穩定以後是 373 calls，含影子那一輪、58 萬三角形。
- 分項：
  - `wenzhou_street_glb` 117 calls；
  - 人物（human）幾組加起來約 113 calls。

## 1. 人物的描邊不進影子那一輪（patch：`char_outline_shadow_1107.patch`）

**先更正我 08:5x 的說法**：
- 我原本以為臉上的小零件（眼白、虹膜、睫毛、眉毛、嘴）也在投影子。查了才知道 `character3d.js` 早就有 `FACE_PART`，它們本來就不投影；
- 路人（`ambient`）整個不投影。
- 那一項不用做。

**真正白畫的是描邊**：
- three-vrm 的 MToon 描邊是同一個網格的第二個材質：名字 `...(Outline)`，用同一份幾何、另一個 group。
- 影子那一輪，three.js 每個 group 用深度材質各畫一次。深度材質不會把描邊往外推，所以描邊那一份畫出來的影子和本體**完全一樣**，等於白畫。
- 主角、女主角這種會投影的人物，每人 5 個：臉、身體、上衣、褲子、鞋。

**怎麼認描邊**：照材質。three-vrm 標的 `isOutline===true`，或名字結尾 `(Outline)`。只記 `castShadow` 的網格；路人本來就不投影，不會進來。

**改法**（對開發 `c8b09bcf0`）：
- **`src/character3d.js`**：
  - `buildVRM` 時把描邊材質記進 `CHAR.OUTLINE_MATS`；
  - `CHAR.shadowPassBegin()` 暫時把它們設成看不見，回傳清單；
  - `CHAR.shadowPassEnd(清單)` 還原。
- **`src/engine3d.js`**：既有的 `shadowLevels` 包裝（影子那一輪暫時藏上面樓層）裡，畫影子前後各呼叫一次。
- 只動影子那一輪，一般畫面的描邊照樣畫。

**畫面不變的證據**：
- 拿掉的都是和本體 `start`、`count` 相同的 group，同一份幾何、同一個深度材質，影子貼圖的每個像素都一樣；
- 測試 ② 檢查這一點。

**測試**（新 `tests/char_outline_shadow_unit.js`，Node，用遊戲的 `CHAR.build` 建人物）：

| | 開發原樣 | 加 patch |
|---|---|---|
| ① 記下描邊材質：以安 5、祐廷 8（多的 3 個是平常藏著的運動服）、路人 0 | FAIL（都 0） | PASS |
| ② 影子那一輪的 group：祐廷、以安 16 → 11（拿掉的和本體同一份幾何） | FAIL（16 → 16） | PASS |
| ③ 畫完還原：一般畫面的 group 數不變（22 → 22） | PASS | PASS |
| ④ `shadowLevels` 呼叫 begin／end | FAIL | PASS |

**其他測試**（會載 `character3d.js` 或 `engine3d.js` 的 259 支 `*_unit.js`，加 patch）：
- 255 支過。
- `bookstore_exit_unit`、`shop_diners_unit` 也是過的：最後一行不是 `ALL PASS`（書店的 GLB 在 Node 讀不到的提示、「全部 PASS」），我的統計沒算到。
- `gym_equip_use_1107_unit` FAIL 1：開發原樣 `c8b09bcf0` 也是 FAIL 1，不是這一包造成的。
- `shadow_levels_unit` ①：比對 `engine3d.js` 原始碼的正規式寫死了 `finally{ … g.visible=true; }`，多還原一樣東西就對不上。patch 裡把它放寬成 finally 裡可以多寫；
  加 patch 和開發原樣都是 ALL PASS。

**省多少**：
- 每個會投影的人物，影子那一輪少 5 次 draw call；
- 溫州街一般場景有祐廷＋1～3 位有名字的人，約少 10～20 次；
- 人多的地方，例如上課、社團，更多。
- 瀏覽器的實際數字等 CC 量。

## 2. 溫州街主模型 `wenzhou_street.glb`：五個頂點色材質合成兩個（模型＋`wz_vc_pack_1107.patch`）

**我原本說「已經接近合到底，能省的約 −13 都要降品質」**。再查一次，找到一個不降品質的做法：
- 主模型裡五個頂點色材質（顏色全在頂點色）只差粗糙度、金屬度：
  - `wz_vc_matte` 0.85／0、`wz_vc_metal` 0.45／0.35：投影；
  - `cafe_vc_wz_matte` 0.85／0、`cafe_vc_wz_gloss` 0.35／0、`cafe_vc_wz_metal` 0.45／0.35：不投影（遊戲 `WZ_NO_SHADOW` 的 `cafe_vc_`）。
- 但一個材質就要一次 draw call：四段 `wzx` 每段霧面、金屬各一次；窗、冷氣、鐵窗這些 instancing 原型，一個原型裡兩種就兩次。

**改法**（`tools/blender/env_second/lib2.py` 的 `vc_pack`，`wz_street.py` 只在溫州街呼叫）：
- 粗糙度、金屬度改從一張 48×16 的小貼圖讀：`metallicRoughnessTexture`，G＝粗糙度、B＝金屬度，三格，取樣 NEAREST。
- 每個面的 UV 放在它原本材質那一格的正中央。一個三角形三個頂點 UV 一樣，整個三角形讀同一個值，不會讀到隔壁格、沒有漸層。
- 顏色照舊是頂點色。
- 打包成兩個材質，照遊戲的影子規則分：
  - `wz_vc_pack`：投影，名字開頭還是 `wz_vc_`；
  - `cafe_vc_wz_pack`：不投影，開頭還是 `cafe_vc_`。
  - instancing 原型全部用不投影那一個（遊戲的 InstancedMesh 本來就不投影）。
- **遊戲程式不用改**，只換 GLB。

**畫面不變的證據**：
- `tools/blender/env_second/glb_vc_compare.py` 解 WebP、逐個三角形讀「實際讀到的」粗糙度、金屬度，連同頂點色、會不會投影、是不是 instancing 分類加總（`glb_vc_compare_result.txt`）。
- 對照組：同一個腳本 `WZ_NOPACK=1` 重建。先確認對照組和 repo 原本的 GLB 每一類都一樣；再和新的比：
  - 9 類（三格 × 投影／不投影／instancing）的三角形數、三角形中心總和、顏色總和**全部一樣**；
  - 不是頂點色的網格完全相同。
- 貼圖匯出是 WebP 82。解出來三格是 0.349／0.455＋0.353／0.851，和原本差 ≤ 0.005。
- 第一次建出來有 8,570 個霧面三角形讀到亮面那一格：合併時兩個 UV 層名字不一樣，有的面在另一層是 (0,0)。這個工具抓到了，已修（打包後的網格 UV 只留一層），重建後一樣。

**省多少**（GLB 裡的 primitive，遊戲「貼地、細小不投影」的規則沒算）：

| | 改前 | 改後 | 差 |
|---|---|---|---|
| 頂點色 primitive（含阿德影印兩種外觀 COPY_） | 28 | 16 | −12 |
| 主畫面，轉角是開著的那一種外觀 | 106 | 94 | −12 |
| 主畫面，轉角是拉下鐵捲門那一種 | | | −10 |
| 影子那一輪 | 63 | 62 | −1 |

- 合起來 −11～−13。
- 鏡頭只看到一兩段 `wzx` 的時候，裁掉的段照舊裁掉，所以實際少的會比這個少一點。
- 瀏覽器的實際數字等 CC 量。
- 其他：三角形數一樣（155,087）；材質 55 → 52；檔案 13.66 → 13.62 MB。

**測試**（Node，開發 `c8b09bcf0`；`wz_vc_pack_1107.patch`，`git apply --check` OK）：

| | 開發原樣 | 換新 GLB＋patch |
|---|---|---|
| 新 `tests/wz_vc_pack_unit.js` ①～④ | **FAIL 3** | **ALL PASS** |
| `singleside_streets_unit` ④（材質數 55 → 52，patch 改期待值） | PASS | 沒改期待值 FAIL；改了 PASS |
| 會建溫州街的 119 支 `*_unit.js` | 119 過 | 只換 GLB：118 過＋上面那一支 |

`wz_vc_pack_unit` 檢查四件事：
- ① 舊的五個材質不在了，兩個打包材質同一張貼圖、NEAREST；
- ② 每個三角形 UV 一樣、在格子正中央；
- ③ 每一類的三角形數和改前一樣；
- ④ 28 → 16。

- **`tests/wz_street_integration.py`**（瀏覽器，CC 跑）：檢查材質名 `wz_vc_matte`／`wz_vc_metal` 的那兩項改成也認 `wz_vc_pack`；`cafe_vc_wz_pack` 不管是不是 instancing 都不投影。我在雲端沒跑（D131）。

**沒做、不建議做**：
- 阿德門口的盆栽、冷氣（Poly Haven，有貼圖）合一張貼圖：會降近景品質。
- 店內照 wzx 分段合併：LANEEAST-TRIS2 試過，包圍球太大裁不掉。
