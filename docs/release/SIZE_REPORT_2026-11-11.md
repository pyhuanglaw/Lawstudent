# 容量報告（2026-11-11）

> 由 `tools/release/size_report.py` 產生；全部是實際檔案的大小，沒有估的。單位：MB＝10⁶ 位元組、MiB＝2²⁰ 位元組（檔案總管、`du -h` 顯示的是 MiB）。
> 分類與打包規則：`docs/RELEASE_PACKAGING.md`。**這不是 Steam 最終安裝容量**——還沒有封裝器、還沒做任何素材優化。

## 0. 量了哪幾棵樹

| 標籤 | commit | 分支 | 版本（index.html） | 檔案清單 | 執行期表 | 量的時間 |
|---|---|---|---|---|---|---|
| 開發分支（本任務的 worktree） | `b4a095576` | worktree-agent-a968ff346dabdb797 | v9.10.24（2026-11-10） | git 追蹤的檔 | 讀到 | 2026-11-11 06:13 UTC |
| main（線上 v9.10.24） | `779ddd650` | origin/main | v9.10.24（2026-11-10） | git 裡的那個版本（直接從物件庫讀） | 讀到 | 2026-11-11 06:13 UTC |

## 1. 總表

| 項目 | 開發分支（本任務的 worktree） | main（線上 v9.10.24） |
|---|---:|---:|
| 原始專案（不含 .git） | 8143 個檔 1445.73 MB（1378.76 MiB） | 7957 個檔 1381.18 MB（1317.19 MiB） |
| .git（另列） | 8387.35 MB（7998.80 MiB） | 8387.35 MB（7998.80 MiB） |
| 遊戲執行資產＝web 包 | 2048 個檔 865.03 MB（824.96 MiB） | 2002 個檔 831.55 MB（793.03 MiB） |
| 排除的開發檔案 | 6095 個檔 580.70 MB（553.80 MiB） | 5955 個檔 549.62 MB（524.16 MiB） |
| win-stage 未壓縮 | 2047 個檔 865.03 MB（824.96 MiB） | 2001 個檔 831.55 MB（793.03 MiB） |
| win-stage 壓縮後 | 443.51 MB（422.96 MiB）（zip（Deflate，壓縮等級 6；Python zipfile，逐檔壓、只數位元組不存檔）） | 433.13 MB（413.06 MiB）（zip（Deflate，壓縮等級 6；Python zipfile，逐檔壓、只數位元組不存檔）） |
| 其中「無法判定、先保留」 | 235 個檔 18.65 MB（17.79 MiB） | 220 個檔 18.63 MB（17.77 MiB） |
| 需要但不存在的檔 | 0 | 0 |

## 使用者 11-11 初步數字對照（main（線上 v9.10.24））

初步數字出處：`docs/handoff/user_specs/RELEASE_PACKAGING_1111.md` 第三節（main）。下面每一列是這次實測；差多少照實寫，不硬湊。

| 項目 | 初步數字 | 這次實測（MB） | 實測（MiB） | 差（實測 MB − 初步） | 這次怎麼分類 |
|---|---:|---:|---:|---:|---|
| 整個版本樹（不含 Git 歷史） | 1.38 GB | 1381.18 | 1317.19 | +1.18 | 全部檔案 |
| 遊戲程式與素材 | 831 MB | 831.55 | 793.03 | +0.55 | web 包（遊戲執行需要的檔） |
| 3D 場景 | 409 MB | 408.53 | 389.61 | -0.47 | 3D 場景（GLB、窗外景、匯出側寫） |
| 3D 人物 | 248 MB | 248.44 | 236.93 | +0.44 | 3D 人物（VRM、配件、動作、遠距離版本） |
| 2D 背景 | 97 MB | 96.78 | 92.30 | -0.22 | 2D 背景 |
| 事件 CG | 20 MB | 19.57 | 18.66 | -0.43 | 事件 CG |
| 電影海報 | 19 MB | 18.76 | 17.89 | -0.24 | 電影海報 |

---

# 詳細：開發分支（本任務的 worktree）

## A. 原始專案容量（不含 .git）：8143 個檔 1445.73 MB（1378.76 MiB）

| 頂層 | 檔數 | 容量 |
|---|---:|---:|
| `assets/` | 1632 | 987.97 MB（942.20 MiB） |
| `docs/` | 3125 | 241.63 MB（230.44 MiB） |
| `tools/` | 1247 | 108.31 MB（103.29 MiB） |
| `wip_backup/` | 229 | 63.72 MB（60.77 MiB） |
| `tests/` | 1440 | 22.02 MB（21.00 MiB） |
| `src/` | 426 | 18.65 MB（17.79 MiB） |
| `lib/` | 4 | 2.61 MB（2.49 MiB） |
| `.claude/` | 30 | 0.51 MB（0.49 MiB） |
| `LICENSES.md` | 1 | 0.17 MB（0.16 MiB） |
| `index.html` | 1 | 0.06 MB（0.06 MiB） |
| `CLAUDE.md` | 1 | 0.05 MB（0.05 MiB） |
| `README.md` | 1 | 0.02 MB（0.02 MiB） |
| `test_charlook.html` | 1 | 0.00 MB（0.00 MiB） |
| `.github/` | 1 | 0.00 MB（0.00 MiB） |
| `build.py` | 1 | 0.00 MB（0.00 MiB） |
| `.gitignore` | 1 | 0.00 MB（0.00 MiB） |
| `.env.example` | 1 | 0.00 MB（0.00 MiB） |
| `.nojekyll` | 1 | 0.00 MB（0.00 MiB） |

`.git`（另列）：8387.35 MB（7998.80 MiB），10347 個檔。這台機器上的 .git（所有分支、所有 worktree 共用，不是某一個版本的大小；不是淺層複本）；每台機器抓的分支不一樣，數字會不同。

## B. 遊戲執行資產、排除的開發檔案、Windows 發行包

| 包 | 檔數 | 未壓縮 | 排除的檔數 | 排除的容量 |
|---|---:|---:|---:|---:|
| web | 2048 | 865.03 MB（824.96 MiB） | 6095 | 580.70 MB（553.80 MiB） |
| win-stage | 2047 | 865.03 MB（824.96 MiB） | 6096 | 580.70 MB（553.80 MiB） |

win-stage 壓縮後：**443.51 MB（422.96 MiB）**（zip（Deflate，壓縮等級 6；Python zipfile，逐檔壓、只數位元組不存檔）；2047 個檔；壓縮比 51.3%）。只壓遊戲內容（win-stage 的檔），不含封裝器；不是 Steam 實際下載大小（Steam 用自己的分塊壓縮，未量）。

每條規則（web 包；規則說明見 `docs/RELEASE_PACKAGING.md` 第 3 節）：

| 規則 | 收／排除 | 檔數 | 容量 |
|---|---|---:|---:|
| R1-ENTRY | 收 | 1 | 0.06 MB（0.06 MiB） |
| R2-INDEX-REF | 收 | 423 | 21.15 MB（20.17 MiB） |
| R3-STATIC | 收 | 726 | 721.89 MB（688.45 MiB） |
| R4-GLBREF | 收 | 147 | 9.99 MB（9.53 MiB） |
| R4-RUNTIME | 收 | 210 | 56.30 MB（53.69 MiB） |
| R5-DYNAMIC | 收 | 304 | 36.81 MB（35.10 MiB） |
| R7-KEEP-UNSURE | 收 | 235 | 18.65 MB（17.79 MiB） |
| R8-LICENSE | 收 | 1 | 0.17 MB（0.16 MiB） |
| R9-PAGES | 收 | 1 | 0.00 MB（0.00 MiB） |
| X1-AI | 排除 | 30 | 0.51 MB（0.49 MiB） |
| X1-BACKUP | 排除 | 229 | 63.72 MB（60.77 MiB） |
| X1-CI | 排除 | 1 | 0.00 MB（0.00 MiB） |
| X1-DOCS | 排除 | 3125 | 241.63 MB（230.44 MiB） |
| X1-TESTS | 排除 | 1440 | 22.02 MB（21.00 MiB） |
| X1-TOOLS | 排除 | 1247 | 108.31 MB（103.29 MiB） |
| X2-DEVFILE | 排除 | 6 | 0.07 MB（0.07 MiB） |
| X3-BLEND | 排除 | 10 | 144.32 MB（137.63 MiB） |
| X5-UNLOADED | 排除 | 7 | 0.11 MB（0.10 MiB） |

## C. 各類素材容量排名

發行包（web）裡：

| 排名 | 類別 | 檔數 | 容量 | 佔包 |
|---:|---|---:|---:|---:|
| 1 | 3D 場景（GLB、窗外景、匯出側寫） | 796 | 438.14 MB（417.84 MiB） | 50.7% |
| 2 | 3D 人物（VRM、配件、動作、遠距離版本） | 171 | 251.54 MB（239.89 MiB） | 29.1% |
| 3 | 2D 背景 | 337 | 96.78 MB（92.30 MiB） | 11.2% |
| 4 | 事件 CG | 91 | 19.57 MB（18.66 MiB） | 2.3% |
| 5 | 電影海報 | 72 | 18.76 MB（17.89 MiB） | 2.2% |
| 6 | 早期的範例人物模型（assets/models/*.glb） | 4 | 10.21 MB（9.73 MiB） | 1.2% |
| 7 | 遊戲程式（src） | 227 | 9.78 MB（9.33 MiB） | 1.1% |
| 8 | 遊戲資料（src/data） | 192 | 8.76 MB（8.36 MiB） | 1.0% |
| 9 | 立繪 | 146 | 8.22 MB（7.84 MiB） | 1.0% |
| 10 | 函式庫（lib：three.js、three-vrm、lz-string） | 4 | 2.61 MB（2.49 MiB） | 0.3% |
| 11 | 貼圖（地面、牆面） | 5 | 0.43 MB（0.41 MiB） | 0.0% |
| 12 | 其他頂層檔 | 2 | 0.17 MB（0.16 MiB） | 0.0% |
| 13 | 入口（index.html） | 1 | 0.06 MB（0.06 MiB） | 0.0% |
| — | 音效檔 | 0 | 0 | 遊戲的聲音是 `src/audio3d.js` 用 Web Audio 即時合成的，沒有音效檔 |

整個專案（含開發檔）：

| 類別 | 檔數 | 容量 |
|---|---:|---:|
| 3D 場景（GLB、窗外景、匯出側寫） | 796 | 438.14 MB（417.84 MiB） |
| 3D 人物（VRM、配件、動作、遠距離版本） | 171 | 251.54 MB（239.89 MiB） |
| 文件（docs） | 3125 | 241.63 MB（230.44 MiB） |
| Blender 工作原檔（assets/blender） | 10 | 144.32 MB（137.63 MiB） |
| 開發工具（tools） | 1247 | 108.31 MB（103.29 MiB） |
| 2D 背景 | 337 | 96.78 MB（92.30 MiB） |
| 備份（wip_backup） | 229 | 63.72 MB（60.77 MiB） |
| 測試（tests） | 1440 | 22.02 MB（21.00 MiB） |
| 事件 CG | 91 | 19.57 MB（18.66 MiB） |
| 電影海報 | 72 | 18.76 MB（17.89 MiB） |
| 早期的範例人物模型（assets/models/*.glb） | 4 | 10.21 MB（9.73 MiB） |
| 遊戲程式（src） | 228 | 9.80 MB（9.35 MiB） |
| 遊戲資料（src/data） | 198 | 8.85 MB（8.44 MiB） |
| 立繪 | 146 | 8.22 MB（7.84 MiB） |
| 函式庫（lib：three.js、three-vrm、lz-string） | 4 | 2.61 MB（2.49 MiB） |
| GitHub／AI 設定（.github、.claude） | 31 | 0.52 MB（0.49 MiB） |
| 貼圖（地面、牆面） | 5 | 0.43 MB（0.41 MiB） |
| 其他頂層檔 | 8 | 0.25 MB（0.23 MiB） |
| 入口（index.html） | 1 | 0.06 MB（0.06 MiB） |

發行包照副檔名：`.glb` 287 個 446.26 MB（425.58 MiB）；`.vrm` 81 個 233.96 MB（223.13 MiB）；`.webp` 1025 個 162.47 MB（154.95 MiB）；`.js` 423 個 21.15 MB（20.17 MiB）；`.json` 228 個 0.64 MB（0.61 MiB）；`.png` 1 個 0.31 MB（0.30 MiB）；`.md` 1 個 0.17 MB（0.16 MiB）；`.html` 1 個 0.06 MB（0.06 MiB）

發行包裡最大的素材目錄：

| 目錄 | 檔數 | 容量 |
|---|---:|---:|
| `assets/models/env/second_ai/` | 404 | 304.59 MB（290.48 MiB） |
| `assets/models/char/second_ai/` | 109 | 168.95 MB（161.12 MiB） |
| `assets/bg/` | 337 | 96.78 MB（92.30 MiB） |
| `assets/models/char/` | 22 | 71.15 MB（67.85 MiB） |
| `assets/models/env/second_ai/bb_support/` | 69 | 55.50 MB（52.92 MiB） |
| `assets/models/env/second_ai/aa_support/` | 75 | 40.46 MB（38.58 MiB） |
| `assets/models/env/` | 50 | 30.17 MB（28.77 MiB） |
| `assets/posters/` | 72 | 18.76 MB（17.89 MiB） |
| `assets/models/char/second_ai/lod/` | 40 | 11.44 MB（10.91 MiB） |
| `assets/models/` | 4 | 10.21 MB（9.73 MiB） |
| `assets/models/env/views/` | 198 | 7.43 MB（7.09 MiB） |
| `assets/cg/heroine_01/` | 19 | 4.40 MB（4.20 MiB） |

## D. 最大的 20 個檔（發行包裡）

| # | 檔 | 容量 | 規則 |
|---:|---|---:|---|
| 1 | `assets/models/env/second_ai/us_campus.glb` | 11.81 MB（11.26 MiB） | R3-STATIC |
| 2 | `assets/models/env/second_ai/library_hall_v2.glb` | 11.00 MB（10.49 MiB） | R3-STATIC |
| 3 | `assets/models/env/second_ai/wenzhou_street.glb` | 10.41 MB（9.93 MiB） | R3-STATIC |
| 4 | `assets/models/env/second_ai/gongguan_shops.glb` | 9.52 MB（9.08 MiB） | R3-STATIC |
| 5 | `assets/models/env/second_ai/us_community.glb` | 8.67 MB（8.27 MiB） | R3-STATIC |
| 6 | `assets/models/env/second_ai/us_market_street.glb` | 8.23 MB（7.85 MiB） | R3-STATIC |
| 7 | `assets/models/env/second_ai/tingzhou_street.glb` | 8.05 MB（7.68 MiB） | R3-STATIC |
| 8 | `assets/models/env/second_ai/us_market.glb` | 7.73 MB（7.37 MiB） | R3-STATIC |
| 9 | `assets/models/char/vrm_player.vrm` | 7.44 MB（7.09 MiB） | R3-STATIC |
| 10 | `assets/models/env/second_ai/soclib_interior.glb` | 7.08 MB（6.75 MiB） | R3-STATIC |
| 11 | `assets/models/env/library_interior.glb` | 6.93 MB（6.61 MiB） | R3-STATIC |
| 12 | `assets/models/env/second_ai/flower_notes_interior.glb` | 6.90 MB（6.58 MiB） | R3-STATIC |
| 13 | `assets/models/env/second_ai/aa_support/shanlan.glb` | 6.43 MB（6.13 MiB） | R3-STATIC |
| 14 | `assets/models/env/second_ai/airport_dep.glb` | 6.04 MB（5.76 MiB） | R3-STATIC |
| 15 | `assets/models/env/second_ai/wz_teahouse_yard.glb` | 6.03 MB（5.75 MiB） | R3-STATIC |
| 16 | `assets/models/env/second_ai/lane118_street.glb` | 5.62 MB（5.36 MiB） | R3-STATIC |
| 17 | `assets/models/env/second_ai/bb_support/cvs_interior.glb` | 5.55 MB（5.30 MiB） | R3-STATIC |
| 18 | `assets/models/env/second_ai/library_3f_v2.glb` | 5.54 MB（5.29 MiB） | R3-STATIC |
| 19 | `assets/models/env/second_ai/gym_arena.glb` | 5.29 MB（5.05 MiB） | R3-STATIC |
| 20 | `assets/models/char/vrm_sample.vrm` | 5.03 MB（4.80 MiB） | R3-STATIC |

被排除的檔裡最大的 10 個（不進包）：`assets/blender/yuting_work_v1.blend` 17.90 MB（17.07 MiB）；`assets/blender/heroine_01_work_v1.blend` 16.95 MB（16.16 MiB）；`assets/blender/heroine_01_work_v2.blend` 16.94 MB（16.15 MiB）；`assets/blender/heroine_03_work_v1.blend` 14.66 MB（13.98 MiB）；`assets/blender/heroine_02_work_v1.blend` 14.63 MB（13.96 MiB）；`assets/blender/heroine_05_work_v1.blend` 14.55 MB（13.88 MiB）；`assets/blender/heroine_02_work_v2.blend` 14.19 MB（13.53 MiB）；`assets/blender/heroine_04_work_v1.blend` 11.81 MB（11.27 MiB）；`assets/blender/heroine_03_work_v2.blend` 11.37 MB（10.84 MiB）；`assets/blender/heroine_04_work_v2.blend` 11.32 MB（10.79 MiB）

## E. 重複資產

### E1. 整個檔內容一模一樣（sha256 相同）：4 組，多出來的 2.27 MB（2.16 MiB）

| 每個檔 | 幾份 | 檔 |
|---:|---:|---|
| 1.84 MB（1.75 MiB） | 2 | `assets/models/char/rpm_sample.glb`、`assets/models/readyplayer.me.glb` |
| 0.07 MB（0.07 MiB） | 4 | `assets/portraits/zhe/campus/laugh.webp`、`assets/portraits/zhe/campus/neutral.webp`、`assets/portraits/zhe/campus/smile.webp`、`assets/portraits/zhe/campus/surprised.webp` |
| 0.06 MB（0.06 MiB） | 4 | `assets/portraits/classmate_mingxuan/campus/embarrassed.webp`、`assets/portraits/classmate_mingxuan/campus/laugh.webp`、`assets/portraits/classmate_mingxuan/campus/neutral.webp`、`assets/portraits/classmate_mingxuan/campus/smile.webp` |
| 0.04 MB（0.03 MiB） | 2 | `assets/models/env/second_ai/bb_support/nanyang_hall_lm_day.webp`、`assets/models/env/second_ai/bb_support/nanyang_hall_lm_night.webp` |

### E2. GLB／VRM 內嵌的貼圖

- 368 個模型檔共 680.22 MB（648.71 MiB）；其中內嵌貼圖 121.83 MB（116.18 MiB）（17.9%）、JSON 區塊 15.93 MB（15.20 MiB）、其餘（幾何、動畫等）542.46 MB（517.33 MiB）。
- 內嵌貼圖 3726 張，內容不同的 2049 張；內容相同、重複存的部分 **35.42 MB（33.78 MiB）**（其中同一個檔裡自己重複的 0.05 MB（0.05 MiB））。
- 這是「如果每張圖只存一次」的理論上限；GLB 是自己帶貼圖的格式，要省這一塊得把貼圖抽成共用的外部檔，載入方式要改（見 F）。

| 貼圖（md5 前 10 碼） | 每張 | 幾份 | 幾個檔 | 例 |
|---|---:|---:|---:|---|
| `e664d1982b`（webp） | 0.37 MB（0.35 MiB） | 7 | 7 | `afar.glb`、`aoki.glb`、`daily_offbeat.glb` |
| `dc73c33b66`（webp） | 0.08 MB（0.07 MiB） | 16 | 16 | `lawlib_interior.glb`、`nanyang_hall.glb`、`boya_interior.glb` |
| `bed5d77525`（webp） | 0.36 MB（0.34 MiB） | 4 | 4 | `dorm_hall.glb`、`library_interior.glb`、`linze_interior.glb` |
| `dbaeca8a5f`（webp） | 0.35 MB（0.34 MiB） | 4 | 4 | `dorm_hall.glb`、`library_interior.glb`、`linze_interior.glb` |
| `d09b93ce8f`（png） | 0.03 MB（0.03 MiB） | 36 | 36 | `bl_yuting.vrm`、`bl_classmate_bohan.vrm`、`bl_econ_jiahao.vrm` |
| `43ba489d24`（webp） | 0.12 MB（0.11 MiB） | 9 | 9 | `library_interior.glb`、`airport_arr.glb`、`airport_dep.glb` |
| `7b732126d8`（webp） | 0.17 MB（0.17 MiB） | 5 | 5 | `dorm_hall.glb`、`library_interior.glb`、`linze_exterior.glb` |
| `d04a4f9023`（webp） | 0.21 MB（0.20 MiB） | 4 | 4 | `street_trees.glb`、`wz_park.glb`、`wz_teahouse_interior.glb` |
| `4710a080e3`（webp） | 0.10 MB（0.09 MiB） | 7 | 7 | `classroom_201.glb`、`lawlib_interior.glb`、`boya_interior.glb` |
| `f494e4972d`（webp） | 0.06 MB（0.06 MiB） | 10 | 10 | `bike.glb`、`corner.glb`、`campus_gongtong.glb` |
| `a810f9a1af`（webp） | 0.17 MB（0.16 MiB） | 4 | 4 | `wz_park.glb`、`wz_teahouse_interior.glb`、`wz_teahouse_yard.glb` |
| `16aeabbc07`（png） | 0.50 MB（0.48 MiB） | 2 | 2 | `bl_heroine_03.vrm`、`vroid_heroine_05.vrm` |
| `e41510dc35`（webp） | 0.45 MB（0.43 MiB） | 2 | 2 | `offbeat_storefront.glb`、`wenzhou_street.glb` |
| `02a49a20fb`（jpeg） | 0.40 MB（0.38 MiB） | 2 | 2 | `rpm_sample.glb`、`readyplayer.me.glb` |
| `d6bb73a5cd`（webp） | 0.06 MB（0.06 MiB） | 7 | 7 | `airport_arr.glb`、`airport_dep.glb`、`us_asian_market.glb` |

## F. 可以考慮的優化（只列建議與依據；這次都沒有做）

| 項目 | 依據（實測） | 最多可省 | 風險與前提 |
|---|---|---:|---|
| 確認「無法判定」的檔是不是真的沒用 | 235 個檔，最大的：`vroid_zhe.vrm`、`vroid_heroine_02.vrm`、`Michelle.glb`、`Xbot.glb` | 18.65 MB（17.79 MiB） | 要人確認（舊版人物、範例模型、匯出側寫）；確認以前留在包裡。`assets/models/` 直下 4 個範例 GLB 在 `LICENSES.md` 註明「正式發佈前應移除」 |
| 其中模型旁邊的匯出側寫 JSON | 228 個；程式裡沒有任何地方 fetch 它們（唯一的 `.json` 請求是 GLB 抓不到時的 `<檔名>.glb.json` 備援） | 0.64 MB（0.61 MiB） | 低；但省的很少，不急 |
| 整個檔重複的 | E1：4 組 | 2.27 MB（2.16 MiB） | 要改程式指到同一個檔；動到 manifest，要回歸 |
| GLB／VRM 之間重複的內嵌貼圖 | E2 | 35.42 MB（33.78 MiB）（理論上限） | 高：要把貼圖抽成外部共用檔或改用 KTX2，載入流程、快取、驗收都要重做；不是打包規則能解的 |
| 同一個 GLB 裡自己重複的貼圖 | E2 | 0.05 MB（0.05 MiB） | 中：重新匯出時合併（Blender 匯出設定）；程式載入時已經會合併重複貼圖（`bldgLoader` 的 texDedup），省的是下載量 |
| 不是 WebP 的圖 | `assets/portraits/heroine_02/campus/neutral.png` 0.31 MB（0.30 MiB） | 未量（要實際轉檔才知道） | 低；先確認有沒有人用 |
| 幾何壓縮（Draco／Meshopt） | 模型檔扣掉貼圖與 JSON 以後 542.46 MB（517.33 MiB） | 未量 | 高：載入器要加解壓、解析變慢；`tools/undraco.js` 顯示以前拿掉過 Draco，要先問原因。幾何佔模型檔的大宗，是最大的一塊，但要實際轉檔、量載入時間才知道值不值得 |

---

# 詳細：main（線上 v9.10.24）

## A. 原始專案容量（不含 .git）：7957 個檔 1381.18 MB（1317.19 MiB）

| 頂層 | 檔數 | 容量 |
|---|---:|---:|
| `assets/` | 1604 | 955.25 MB（911.00 MiB） |
| `docs/` | 3086 | 218.17 MB（208.06 MiB） |
| `tools/` | 1189 | 101.70 MB（96.99 MiB） |
| `wip_backup/` | 229 | 63.72 MB（60.77 MiB） |
| `tests/` | 1397 | 21.02 MB（20.05 MiB） |
| `src/` | 408 | 17.90 MB（17.07 MiB） |
| `lib/` | 4 | 2.61 MB（2.49 MiB） |
| `.claude/` | 30 | 0.51 MB（0.49 MiB） |
| `LICENSES.md` | 1 | 0.17 MB（0.16 MiB） |
| `index.html` | 1 | 0.06 MB（0.06 MiB） |
| `CLAUDE.md` | 1 | 0.04 MB（0.04 MiB） |
| `README.md` | 1 | 0.01 MB（0.01 MiB） |
| `test_charlook.html` | 1 | 0.00 MB（0.00 MiB） |
| `.github/` | 1 | 0.00 MB（0.00 MiB） |
| `build.py` | 1 | 0.00 MB（0.00 MiB） |
| `.gitignore` | 1 | 0.00 MB（0.00 MiB） |
| `.env.example` | 1 | 0.00 MB（0.00 MiB） |
| `.nojekyll` | 1 | 0.00 MB（0.00 MiB） |

`.git`（另列）：8387.35 MB（7998.80 MiB），10347 個檔。這台機器上的 .git（所有分支、所有 worktree 共用，不是某一個版本的大小；不是淺層複本）；每台機器抓的分支不一樣，數字會不同。

## B. 遊戲執行資產、排除的開發檔案、Windows 發行包

| 包 | 檔數 | 未壓縮 | 排除的檔數 | 排除的容量 |
|---|---:|---:|---:|---:|
| web | 2002 | 831.55 MB（793.03 MiB） | 5955 | 549.62 MB（524.16 MiB） |
| win-stage | 2001 | 831.55 MB（793.03 MiB） | 5956 | 549.62 MB（524.16 MiB） |

win-stage 壓縮後：**433.13 MB（413.06 MiB）**（zip（Deflate，壓縮等級 6；Python zipfile，逐檔壓、只數位元組不存檔）；2001 個檔；壓縮比 52.1%）。只壓遊戲內容（win-stage 的檔），不含封裝器；不是 Steam 實際下載大小（Steam 用自己的分塊壓縮，未量）。

每條規則（web 包；規則說明見 `docs/RELEASE_PACKAGING.md` 第 3 節）：

| 規則 | 收／排除 | 檔數 | 容量 |
|---|---|---:|---:|
| R1-ENTRY | 收 | 1 | 0.06 MB（0.06 MiB） |
| R2-INDEX-REF | 收 | 405 | 20.39 MB（19.45 MiB） |
| R3-STATIC | 收 | 713 | 689.20 MB（657.27 MiB） |
| R4-GLBREF | 收 | 147 | 9.99 MB（9.53 MiB） |
| R4-RUNTIME | 收 | 210 | 56.30 MB（53.69 MiB） |
| R5-DYNAMIC | 收 | 304 | 36.81 MB（35.10 MiB） |
| R7-KEEP-UNSURE | 收 | 220 | 18.63 MB（17.77 MiB） |
| R8-LICENSE | 收 | 1 | 0.17 MB（0.16 MiB） |
| R9-PAGES | 收 | 1 | 0.00 MB（0.00 MiB） |
| X1-AI | 排除 | 30 | 0.51 MB（0.49 MiB） |
| X1-BACKUP | 排除 | 229 | 63.72 MB（60.77 MiB） |
| X1-CI | 排除 | 1 | 0.00 MB（0.00 MiB） |
| X1-DOCS | 排除 | 3086 | 218.17 MB（208.06 MiB） |
| X1-TESTS | 排除 | 1397 | 21.02 MB（20.05 MiB） |
| X1-TOOLS | 排除 | 1189 | 101.70 MB（96.99 MiB） |
| X2-DEVFILE | 排除 | 6 | 0.06 MB（0.06 MiB） |
| X3-BLEND | 排除 | 10 | 144.32 MB（137.63 MiB） |
| X5-UNLOADED | 排除 | 7 | 0.11 MB（0.10 MiB） |

## C. 各類素材容量排名

發行包（web）裡：

| 排名 | 類別 | 檔數 | 容量 | 佔包 |
|---:|---|---:|---:|---:|
| 1 | 3D 場景（GLB、窗外景、匯出側寫） | 771 | 408.53 MB（389.61 MiB） | 49.1% |
| 2 | 3D 人物（VRM、配件、動作、遠距離版本） | 168 | 248.44 MB（236.93 MiB） | 29.9% |
| 3 | 2D 背景 | 337 | 96.78 MB（92.30 MiB） | 11.6% |
| 4 | 事件 CG | 91 | 19.57 MB（18.66 MiB） | 2.4% |
| 5 | 電影海報 | 72 | 18.76 MB（17.89 MiB） | 2.3% |
| 6 | 早期的範例人物模型（assets/models/*.glb） | 4 | 10.21 MB（9.73 MiB） | 1.2% |
| 7 | 遊戲程式（src） | 220 | 9.54 MB（9.10 MiB） | 1.1% |
| 8 | 遊戲資料（src/data） | 181 | 8.25 MB（7.86 MiB） | 1.0% |
| 9 | 立繪 | 146 | 8.22 MB（7.84 MiB） | 1.0% |
| 10 | 函式庫（lib：three.js、three-vrm、lz-string） | 4 | 2.61 MB（2.49 MiB） | 0.3% |
| 11 | 貼圖（地面、牆面） | 5 | 0.43 MB（0.41 MiB） | 0.1% |
| 12 | 其他頂層檔 | 2 | 0.17 MB（0.16 MiB） | 0.0% |
| 13 | 入口（index.html） | 1 | 0.06 MB（0.06 MiB） | 0.0% |
| — | 音效檔 | 0 | 0 | 遊戲的聲音是 `src/audio3d.js` 用 Web Audio 即時合成的，沒有音效檔 |

整個專案（含開發檔）：

| 類別 | 檔數 | 容量 |
|---|---:|---:|
| 3D 場景（GLB、窗外景、匯出側寫） | 771 | 408.53 MB（389.61 MiB） |
| 3D 人物（VRM、配件、動作、遠距離版本） | 168 | 248.44 MB（236.93 MiB） |
| 文件（docs） | 3086 | 218.17 MB（208.06 MiB） |
| Blender 工作原檔（assets/blender） | 10 | 144.32 MB（137.63 MiB） |
| 開發工具（tools） | 1189 | 101.70 MB（96.99 MiB） |
| 2D 背景 | 337 | 96.78 MB（92.30 MiB） |
| 備份（wip_backup） | 229 | 63.72 MB（60.77 MiB） |
| 測試（tests） | 1397 | 21.02 MB（20.05 MiB） |
| 事件 CG | 91 | 19.57 MB（18.66 MiB） |
| 電影海報 | 72 | 18.76 MB（17.89 MiB） |
| 早期的範例人物模型（assets/models/*.glb） | 4 | 10.21 MB（9.73 MiB） |
| 遊戲程式（src） | 221 | 9.56 MB（9.12 MiB） |
| 遊戲資料（src/data） | 187 | 8.33 MB（7.95 MiB） |
| 立繪 | 146 | 8.22 MB（7.84 MiB） |
| 函式庫（lib：three.js、three-vrm、lz-string） | 4 | 2.61 MB（2.49 MiB） |
| GitHub／AI 設定（.github、.claude） | 31 | 0.52 MB（0.49 MiB） |
| 貼圖（地面、牆面） | 5 | 0.43 MB（0.41 MiB） |
| 其他頂層檔 | 8 | 0.23 MB（0.22 MiB） |
| 入口（index.html） | 1 | 0.06 MB（0.06 MiB） |

發行包照副檔名：`.glb` 275 個 416.63 MB（397.33 MiB）；`.vrm` 80 個 230.90 MB（220.20 MiB）；`.webp` 1025 個 162.47 MB（154.95 MiB）；`.js` 405 個 20.39 MB（19.45 MiB）；`.json` 213 個 0.62 MB（0.59 MiB）；`.png` 1 個 0.31 MB（0.30 MiB）；`.md` 1 個 0.17 MB（0.16 MiB）；`.html` 1 個 0.06 MB（0.06 MiB）

發行包裡最大的素材目錄：

| 目錄 | 檔數 | 容量 |
|---|---:|---:|
| `assets/models/env/second_ai/` | 379 | 274.98 MB（262.24 MiB） |
| `assets/models/char/second_ai/` | 106 | 165.85 MB（158.16 MiB） |
| `assets/bg/` | 337 | 96.78 MB（92.30 MiB） |
| `assets/models/char/` | 22 | 71.15 MB（67.85 MiB） |
| `assets/models/env/second_ai/bb_support/` | 69 | 55.50 MB（52.92 MiB） |
| `assets/models/env/second_ai/aa_support/` | 75 | 40.46 MB（38.58 MiB） |
| `assets/models/env/` | 50 | 30.17 MB（28.77 MiB） |
| `assets/posters/` | 72 | 18.76 MB（17.89 MiB） |
| `assets/models/char/second_ai/lod/` | 40 | 11.44 MB（10.91 MiB） |
| `assets/models/` | 4 | 10.21 MB（9.73 MiB） |
| `assets/models/env/views/` | 198 | 7.43 MB（7.09 MiB） |
| `assets/cg/heroine_01/` | 19 | 4.40 MB（4.20 MiB） |

## D. 最大的 20 個檔（發行包裡）

| # | 檔 | 容量 | 規則 |
|---:|---|---:|---|
| 1 | `assets/models/env/second_ai/us_campus.glb` | 11.81 MB（11.26 MiB） | R3-STATIC |
| 2 | `assets/models/env/second_ai/library_hall_v2.glb` | 11.00 MB（10.49 MiB） | R3-STATIC |
| 3 | `assets/models/env/second_ai/wenzhou_street.glb` | 10.28 MB（9.80 MiB） | R3-STATIC |
| 4 | `assets/models/env/second_ai/gongguan_shops.glb` | 9.89 MB（9.43 MiB） | R3-STATIC |
| 5 | `assets/models/env/second_ai/us_community.glb` | 8.67 MB（8.27 MiB） | R3-STATIC |
| 6 | `assets/models/env/second_ai/us_market_street.glb` | 8.23 MB（7.85 MiB） | R3-STATIC |
| 7 | `assets/models/env/second_ai/us_market.glb` | 7.73 MB（7.37 MiB） | R3-STATIC |
| 8 | `assets/models/char/vrm_player.vrm` | 7.44 MB（7.09 MiB） | R3-STATIC |
| 9 | `assets/models/env/second_ai/soclib_interior.glb` | 7.08 MB（6.75 MiB） | R3-STATIC |
| 10 | `assets/models/env/library_interior.glb` | 6.93 MB（6.61 MiB） | R3-STATIC |
| 11 | `assets/models/env/second_ai/aa_support/shanlan.glb` | 6.43 MB（6.13 MiB） | R3-STATIC |
| 12 | `assets/models/env/second_ai/airport_dep.glb` | 6.04 MB（5.76 MiB） | R3-STATIC |
| 13 | `assets/models/env/second_ai/wz_teahouse_yard.glb` | 6.03 MB（5.75 MiB） | R3-STATIC |
| 14 | `assets/models/env/second_ai/lane118_street.glb` | 5.62 MB（5.36 MiB） | R3-STATIC |
| 15 | `assets/models/env/second_ai/bb_support/cvs_interior.glb` | 5.55 MB（5.30 MiB） | R3-STATIC |
| 16 | `assets/models/env/second_ai/library_3f_v2.glb` | 5.54 MB（5.29 MiB） | R3-STATIC |
| 17 | `assets/models/env/second_ai/gym_arena.glb` | 5.29 MB（5.05 MiB） | R3-STATIC |
| 18 | `assets/models/char/vrm_sample.vrm` | 5.03 MB（4.80 MiB） | R3-STATIC |
| 19 | `assets/models/env/second_ai/bb_support/nanyang_hall.glb` | 4.73 MB（4.51 MiB） | R3-STATIC |
| 20 | `assets/models/env/second_ai/xinsheng_far.glb` | 4.67 MB（4.46 MiB） | R3-STATIC |

被排除的檔裡最大的 10 個（不進包）：`assets/blender/yuting_work_v1.blend` 17.90 MB（17.07 MiB）；`assets/blender/heroine_01_work_v1.blend` 16.95 MB（16.16 MiB）；`assets/blender/heroine_01_work_v2.blend` 16.94 MB（16.15 MiB）；`assets/blender/heroine_03_work_v1.blend` 14.66 MB（13.98 MiB）；`assets/blender/heroine_02_work_v1.blend` 14.63 MB（13.96 MiB）；`assets/blender/heroine_05_work_v1.blend` 14.55 MB（13.88 MiB）；`assets/blender/heroine_02_work_v2.blend` 14.19 MB（13.53 MiB）；`assets/blender/heroine_04_work_v1.blend` 11.81 MB（11.27 MiB）；`assets/blender/heroine_03_work_v2.blend` 11.37 MB（10.84 MiB）；`assets/blender/heroine_04_work_v2.blend` 11.32 MB（10.79 MiB）

## E. 重複資產

### E1. 整個檔內容一模一樣（sha256 相同）：4 組，多出來的 2.27 MB（2.16 MiB）

| 每個檔 | 幾份 | 檔 |
|---:|---:|---|
| 1.84 MB（1.75 MiB） | 2 | `assets/models/char/rpm_sample.glb`、`assets/models/readyplayer.me.glb` |
| 0.07 MB（0.07 MiB） | 4 | `assets/portraits/zhe/campus/laugh.webp`、`assets/portraits/zhe/campus/neutral.webp`、`assets/portraits/zhe/campus/smile.webp`、`assets/portraits/zhe/campus/surprised.webp` |
| 0.06 MB（0.06 MiB） | 4 | `assets/portraits/classmate_mingxuan/campus/embarrassed.webp`、`assets/portraits/classmate_mingxuan/campus/laugh.webp`、`assets/portraits/classmate_mingxuan/campus/neutral.webp`、`assets/portraits/classmate_mingxuan/campus/smile.webp` |
| 0.04 MB（0.03 MiB） | 2 | `assets/models/env/second_ai/bb_support/nanyang_hall_lm_day.webp`、`assets/models/env/second_ai/bb_support/nanyang_hall_lm_night.webp` |

### E2. GLB／VRM 內嵌的貼圖

- 355 個模型檔共 647.53 MB（617.53 MiB）；其中內嵌貼圖 117.35 MB（111.91 MiB）（18.1%）、JSON 區塊 15.49 MB（14.77 MiB）、其餘（幾何、動畫等）514.69 MB（490.85 MiB）。
- 內嵌貼圖 3649 張，內容不同的 2008 張；內容相同、重複存的部分 **34.92 MB（33.30 MiB）**（其中同一個檔裡自己重複的 0.05 MB（0.05 MiB））。
- 這是「如果每張圖只存一次」的理論上限；GLB 是自己帶貼圖的格式，要省這一塊得把貼圖抽成共用的外部檔，載入方式要改（見 F）。

| 貼圖（md5 前 10 碼） | 每張 | 幾份 | 幾個檔 | 例 |
|---|---:|---:|---:|---|
| `e664d1982b`（webp） | 0.37 MB（0.35 MiB） | 7 | 7 | `afar.glb`、`aoki.glb`、`daily_offbeat.glb` |
| `dc73c33b66`（webp） | 0.08 MB（0.07 MiB） | 16 | 16 | `lawlib_interior.glb`、`nanyang_hall.glb`、`boya_interior.glb` |
| `bed5d77525`（webp） | 0.36 MB（0.34 MiB） | 4 | 4 | `dorm_hall.glb`、`library_interior.glb`、`linze_interior.glb` |
| `dbaeca8a5f`（webp） | 0.35 MB（0.34 MiB） | 4 | 4 | `dorm_hall.glb`、`library_interior.glb`、`linze_interior.glb` |
| `43ba489d24`（webp） | 0.12 MB（0.11 MiB） | 9 | 9 | `library_interior.glb`、`airport_arr.glb`、`airport_dep.glb` |
| `d09b93ce8f`（png） | 0.03 MB（0.03 MiB） | 35 | 35 | `bl_yuting.vrm`、`bl_classmate_bohan.vrm`、`bl_econ_jiahao.vrm` |
| `7b732126d8`（webp） | 0.17 MB（0.17 MiB） | 5 | 5 | `dorm_hall.glb`、`library_interior.glb`、`linze_exterior.glb` |
| `d04a4f9023`（webp） | 0.21 MB（0.20 MiB） | 4 | 4 | `street_trees.glb`、`wz_park.glb`、`wz_teahouse_interior.glb` |
| `4710a080e3`（webp） | 0.10 MB（0.09 MiB） | 7 | 7 | `classroom_201.glb`、`lawlib_interior.glb`、`boya_interior.glb` |
| `f494e4972d`（webp） | 0.06 MB（0.06 MiB） | 10 | 10 | `bike.glb`、`corner.glb`、`campus_gongtong.glb` |
| `a810f9a1af`（webp） | 0.17 MB（0.16 MiB） | 4 | 4 | `wz_park.glb`、`wz_teahouse_interior.glb`、`wz_teahouse_yard.glb` |
| `16aeabbc07`（png） | 0.50 MB（0.48 MiB） | 2 | 2 | `bl_heroine_03.vrm`、`vroid_heroine_05.vrm` |
| `e41510dc35`（webp） | 0.45 MB（0.43 MiB） | 2 | 2 | `offbeat_storefront.glb`、`wenzhou_street.glb` |
| `02a49a20fb`（jpeg） | 0.40 MB（0.38 MiB） | 2 | 2 | `rpm_sample.glb`、`readyplayer.me.glb` |
| `d6bb73a5cd`（webp） | 0.06 MB（0.06 MiB） | 7 | 7 | `airport_arr.glb`、`airport_dep.glb`、`us_asian_market.glb` |

## F. 可以考慮的優化（只列建議與依據；這次都沒有做）

| 項目 | 依據（實測） | 最多可省 | 風險與前提 |
|---|---|---:|---|
| 確認「無法判定」的檔是不是真的沒用 | 220 個檔，最大的：`vroid_zhe.vrm`、`vroid_heroine_02.vrm`、`Michelle.glb`、`Xbot.glb` | 18.63 MB（17.77 MiB） | 要人確認（舊版人物、範例模型、匯出側寫）；確認以前留在包裡。`assets/models/` 直下 4 個範例 GLB 在 `LICENSES.md` 註明「正式發佈前應移除」 |
| 其中模型旁邊的匯出側寫 JSON | 213 個；程式裡沒有任何地方 fetch 它們（唯一的 `.json` 請求是 GLB 抓不到時的 `<檔名>.glb.json` 備援） | 0.62 MB（0.59 MiB） | 低；但省的很少，不急 |
| 整個檔重複的 | E1：4 組 | 2.27 MB（2.16 MiB） | 要改程式指到同一個檔；動到 manifest，要回歸 |
| GLB／VRM 之間重複的內嵌貼圖 | E2 | 34.92 MB（33.30 MiB）（理論上限） | 高：要把貼圖抽成外部共用檔或改用 KTX2，載入流程、快取、驗收都要重做；不是打包規則能解的 |
| 同一個 GLB 裡自己重複的貼圖 | E2 | 0.05 MB（0.05 MiB） | 中：重新匯出時合併（Blender 匯出設定）；程式載入時已經會合併重複貼圖（`bldgLoader` 的 texDedup），省的是下載量 |
| 不是 WebP 的圖 | `assets/portraits/heroine_02/campus/neutral.png` 0.31 MB（0.30 MiB） | 未量（要實際轉檔才知道） | 低；先確認有沒有人用 |
| 幾何壓縮（Draco／Meshopt） | 模型檔扣掉貼圖與 JSON 以後 514.69 MB（490.85 MiB） | 未量 | 高：載入器要加解壓、解析變慢；`tools/undraco.js` 顯示以前拿掉過 Draco，要先問原因。幾何佔模型檔的大宗，是最大的一塊，但要實際轉檔、量載入時間才知道值不值得 |

