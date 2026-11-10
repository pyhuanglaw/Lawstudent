# NTU-REF-1110 ②：行政大樓、文學院、校史館外牆照官網改（X223／D136）— LAWWW2 帳號 A，2026-11-10

- 狀態：`MODEL_READY`，交 LAWWW 整合，BB 判（第 1 版）。以開發分支 74da28ca9 為底，這一版已經有 PERF-CAMPUS-GLB ②。
- 遊戲截圖、同角度疊圖請 CC 拍（`--mode campus`）。
- 對照圖 `halls_before_after.jpg`：左舊右新，由上往下是行政大樓、文學院、校史館。Blender 渲染，不是遊戲畫面。

## 改了什麼
| 建築 | 官網 | 原本 | 改成 |
|---|---|---|---|
| 行政大樓 | 「外牆以紅色清水磚為主」、北棟（臨椰林大道）二層 | 米黃面磚 #cdb48e、3 層 | 紅色清水磚（Poly Haven red_brick，和望月台同一張，每 1.6 m 一張）、#9e5139、**2 層** |
| 文學院 | 「國防色的十三溝面磚」 | 偏紅褐 #9b5a42 | 土黃偏褐 #9a8560（十三溝面磚的貼圖照舊，降彩度後校色） |
| 校史館 | 「土黃色的十三溝面磚」 | 偏紅褐 #a25d43 | 土黃 #b39762 |

- 保留：門廊、拱廊、山牆、圓窗、黑色屋瓦、整體配置。
- 不照抄：行政大樓的科林斯圓柱、校史館的雕花柱頭，照舊是簡化的柱子（D136）。
- `tools/blender/env_second/campus_hall.py`：每一棟可以設 `wall_tex`、`wall_tile`，牆和拱廊柱墩用同一張。三棟重匯。
- PERF ② 的合併照舊：一棟 5 個網格，材質是 wz_vc_*、ck_win_tiles、seethru_ck_tiles。行政大樓少一層，三角形 19,591 → 14,965。
- `src/zones3d.js` 的套件（載入失敗時的備用外觀、鏡頭碰撞的高度）同一組數字：行政大樓 floors:2、三棟的 wall 顏色。footprint 不變，導航不動。

## 測試
- 新測試 `tests/ntu_ref_halls_unit.js`，三項：
  - ① campus_hall.py 的數字；
  - ② 套件和正式模型的數字一樣；
  - ③ 行政大樓的 GLB 是兩層的高度（頂 12.47 m，三層時是 15.87 m），三棟照舊是合併材質。
- **開發分支 74da28ca9：FAILED 3**；套上 patch：**ALL PASS**。
- 回歸：讀到校園、三棟、ckTag、attachWenzhouModel、seethru_ck 的測試，包括 campus_hall_drawcall（網格數不回升），49 支全過，見 `regression.log`。

## 整合
`git apply --binary ntu_ref_halls_1110.patch`。內容：3 顆 GLB／json、campus_hall.py、zones3d.js（三行）、新測試。
