# PERF-COLD-RT：溫州街主模型縮小（LAWWW2-B 2026-11-07）

**派工**：LAWWW-B 10:14「CC 量出 PERF-WZ-DC／PERF-COLD 的數字，如果和你預期的差很多，那一項優先」。

**狀態**：第一階段已做，遊戲端不用改程式。第二階段（Meshopt）等 LAWWW-B 決定。

## CC-B 量到的（PERF_COLD_RT，PC，4G 20 Mbps）

| 輪 | 黑畫面 | `wenzhou_street.glb` 傳輸 | 下載完（進區域後） | 載好（進區域後） |
|---|---|---|---|---|
| base | 18.5 s | 13,619,276 B | 21.7 s | 23.9 s |
| near ① | 17.6 s | 13,619,276 B（不是快取） | 18.2 s | 18.8 s |
| near ② | 16.9 s | 13,619,276 B（不是快取） | 21.7 s | 22.3 s |

- **慢在下載，不是解析**：下載完到載好只差 0.6～2.2 s。
- **先下載也沒進快取**：小的 `wz_park.glb` 有進快取。我判斷是測試瀏覽器的快取上限，不是遊戲的問題：
  - Playwright 的新 context 用記憶體快取；
  - Chromium 記憶體快取的上限是 min(2% RAM, 50 MB)，單一檔案最多上限的 1/8，約 6 MB。
  - 一般 Chrome 用磁碟快取，13.6 MB 會留。
  - 已請 CC 用磁碟快取驗證（PERF_COLD_PERSIST）。

## 這個檔的大小花在哪裡

| | MB |
|---|---|
| 位置 POSITION（32 位元浮點） | 3.21 |
| 法線 NORMAL（32 位元浮點） | 3.21 |
| 頂點色 COLOR_0 | 2.20 |
| UV | 1.47 |
| 索引 | 0.93 |
| 貼圖（58 張 WebP） | 2.33 |

## 第一階段（已做）：13.6 MB → 10.3 MB（−25%）

`tools/blender/env_second/glb_slim.py`；`wz_street.py` 匯出以後自動做，`WZ_NOSLIM=1` 可以關掉。

**怎麼縮**：
- **法線**：浮點改 8 位元（normalized BYTE，KHR_mesh_quantization；three.js 的 GLTFLoader 本來就支援）。轉了 84 個。
- **頂點色**：浮點改 0～255。換算回 sRGB 誤差超過 1.5/255 的改用 16 位元；17 個用 8 位元、21 個用 16 位元。
- **不受光的材質**（KHR_materials_unlit）：法線拿掉，MeshBasicMaterial 用不到。拿掉 13 個。

**不動的**：
- 位置、UV、索引、節點、貼圖、材質都不動。位置量化要改節點的變換，招牌、門牌是照幾何大小畫字的。
- 遊戲會自己改幾何的板面整個不碰：`PLATE_FACE_`、`SIGN_FACE_`、`VSIGN_FACE_`、`INTERIOR_FACE_`。`zones3d.js` 的 `wzSplitQuadU`、`wzAtlasFaces` 會切塊、合成網格，合併時每一塊的格式要一樣。
- 和板面共用的 5 個 accessor 不轉。

**驗證**：
- `glb_vc_compare.py`：
  - 其他網格完全相同；
  - draw call（主畫面 94、影子 62）不變；
  - 頂點色每個三角形的粗糙度、金屬度、投影分類都一樣；
  - 顏色加總差 0.4% 以內，就是量化誤差。
- three.js 的 GLTFLoader 在 Node 解原檔和新檔（`parse_check.js`，貼圖先拿掉）：
  - 102 個網格名字都對得上；
  - 位置一模一樣；
  - 法線最大偏差 0.37°；
  - 顏色最大差 1.1/255（sRGB）；
  - 拿掉法線的 13 個都是 MeshBasicMaterial；
  - `vertexColors` 都一樣。

## 測試（Node，開發 `126bdf93e`）

| | 開發原樣 | 換新的 `wenzhou_street.glb` |
|---|---|---|
| 新 `tests/wz_slim_unit.js`（`wz_slim_1107.patch`） | **FAILED 5** | **ALL PASS** |
| 會讀這個檔的 8 支：cafe230_nobldg_nav、lampshade_flip、offbeat_storefront、singleside_streets、street_props_nav、wz_copy_shop、wz_vc_pack、zone_prewarm | — | 8 支全過 |

第 9 支 `tests/wz_street_integration.py` 要瀏覽器，交 CC。

## 第二階段（等 LAWWW-B 決定）：Meshopt

| 做法 | 檔案大小 |
|---|---|
| 原檔 | 13.6 MB |
| 第一階段 | 10.3 MB |
| gltf-transform meshopt（預設，會量化位置） | 4.9 MB |
| 原檔 gzip | 4.6 MB |
| meshopt 再 gzip | 3.5 MB |

**遊戲端要做的**：
- 加 meshoptimizer 的解碼器（MIT，約 20 KB，裡面是 WebAssembly）；
- `assets3d.js` 的 GLTFLoader 加 `setMeshoptDecoder`；
- LICENSES 加一列。

**還要先解決**：預設會量化位置、改節點的變換，招牌、門牌會畫錯。

**改法**：在第一階段的檔上只做 Meshopt 無損壓縮（EncoderMethod.QUANTIZE，不再量化），節點、格式都不動。量到的大小：

| | 檔案 | gzip 以後 |
|---|---|---|
| 第一階段 | 10.28 MB | 4.28 MB |
| 第一階段＋Meshopt（無損） | **5.67 MB** | 3.82 MB |

- 線上沒有 gzip：少 4.6 MB。
- 線上有 gzip：只少 0.46 MB。

還沒做的：用解碼器在 Node 解開、逐網格比對（LAWWW-B 決定要做才做）。

**GitHub Pages 有沒有 gzip `.glb`**：雲端查不到（代理擋 github.io），已請 CC 查（PAGES-GZIP）。有 gzip 的話：
- 玩家實際只下載約 4.6 MB；
- 第二階段的好處小很多（4.6 → 3.5 MB）。

## 還沒驗

- 遊戲內畫面（CC）：溫州街白天、晚上各一張，和改前同角度。
  - 法線 8 位元在大面的牆上看不出來；最可能看得出差別的是圓柱、曲面的打光。
- CC 用新檔重跑 PERF_COLD_RT（`ZONES=wenzhou VARIANTS=base NET=4g`），看黑畫面少多少。
- 公館 `gongguan_shops.glb`、118 巷、新生南路的主模型可以照做；先看溫州街的結果。
