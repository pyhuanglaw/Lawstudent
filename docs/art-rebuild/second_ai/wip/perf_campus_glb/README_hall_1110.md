# PERF-CAMPUS-GLB-1102 ②：行政大樓、文學院、校史館壓 draw call — LAWWW2 帳號 A，2026-11-10

狀態：`MODEL_READY`，交 LAWWW 整合。外觀不變，前後渲染對照在 `admin_before_after.jpg`。遊戲截圖、手機實際的幀率請 CC 量（D131）。

## 為什麼先做這三棟
- 校園正式 GLB 的盤點見 `census_1110.md`。普通、博雅已經壓到 4～5 個網格，其他大多還在 10～18 個。
- 這三棟是同一支腳本 `campus_hall.py` 做的，椰林大道上會同時入鏡，所以先處理。

## 做法
`tools/blender/env_second/campus_hall.py` 匯出前，套 TEACH-EAST-DRAWCALL-1104（campus_teach.py）的壓法：
- 面磚牆、洗石子收邊、石材基座、屋瓦合成一張貼圖集，純色的天花板也併進來，材質叫 `wz_vc_adm／art／his`。遊戲照 `wz_vc_` 的規則投影。
- 窗邊的洗石子和木窗框另外合成一張，材質叫 `ck_win_tiles`。這部分原本就不投影；如果併進會投影的那張，陰影那一輪會多 2 萬個三角形。
- 門廊、拱廊的柱子：兩個材質合成一張 `seethru_ck_tiles`。遊戲的樹幹透視是照 seethru_ 開頭的名字打開的，所以照舊有效。
- 玻璃（夜間燈光）、匾額（FACE）照舊分開。
- 加 `--no-tiles` 參數可以匯出原本的做法。

## 數字
| | 修改前 | 修改後 |
|---|---|---|
| 每棟的網格 | 11 | 5 |
| 鏡頭裡的 draw call（主畫面＋陰影），行政大樓／文學院／校史館 | 15／15／16 | 6／6／7 |
| 三棟合計 draw call | 47 | 18（少 29） |
| 三棟三角形（主畫面＋陰影） | 37,399 | 63,837 |
| GLB 大小（行政大樓） | 0.93 MB | 1.57 MB |

鏡頭是 Node 建的校園，從椰林大道 (−20, 1.7, 0) 看 (−60, 7, 0)，三棟都在畫面裡。

**代價**：三角形多了 2.6 萬。原因是貼圖集要把大面積的牆沿著貼圖重複的格線切開，面磚牆每 2 m 切一次。用 29 個 draw call 換 2.6 萬個三角形；手機上通常 draw call 比較貴，但實際划不划算要看 CC 在手機上量的幀率。

## 測試
- 新測試 `tests/campus_hall_drawcall_unit.js`，在 Node 建真正的校園、用 attachWenzhouModel 接上三棟：
  - ① 三棟都接上，套件版藏起來；
  - ② 每棟主畫面 ≤ 5 個網格、投影 ≤ 2 個；
  - ③ 柱子有樹幹透視，wz_vc_* 會投影；
  - ④ 頂點色零件的 UV 在白色帶子上。
  - **開發分支 be84c8680：② FAIL**（10～11＋5）；套上 patch：**ALL PASS**。
- **改了一支既有測試** `tests/campus_hall_pillar_seethru_unit.js`（LAWWW2-B 的）：
  - 原因：它直接比對材質名字 seethru_ck_col／pier、ck_trim／ck_wall。合併以後三棟的名字變了，修改後原本 FAILED 12。
  - 檢查的內容不變，只是改成照合併後的名字找：柱子只在一樓、到門廊高度、從地面開始；牆和收邊比柱子高 3 m 以上；seethru_ 開頭的只有柱子；遊戲端有標透視。
  - 新的名字也加進遊戲端那一項。
  - 新舊兩版 GLB 都是 ALL PASS，沒有放寬。請你確認這樣改可以。
- 回歸：讀到校園、campus_admin／arts／hist、ckTag、attachWenzhouModel、seethru_ck 的 37 支，見 `regression_hall.log`。全部通過，只有上面那支要更新。

## 整合
- `git apply --binary perf_campus_hall_1110.patch`，以開發分支 be84c8680 為底。
- 內容：3 顆 GLB／json、campus_hall.py、新測試、更新的 pillar 測試。
- 貼圖集的中間檔 `tools/blender/env_second/textures/gen/hall_*.png`（27 張，約 11 MB）沒有放進 patch：腳本會重新產生。要的話在我的分支上。

## 下一步（還沒做）
照網格數排：社科院 18 → 總圖 13 → 黑森林 12、醉月湖 11。做法一樣，每一棟都會量三角形的代價。
