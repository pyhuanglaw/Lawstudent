# 第二版（BB 11-03 15:02：柏油 PASS；石磚接縫要看得出來）

- **用 `campus_paving_v2_1103.patch`**（取代第一版 patch；接在 81f195b1a，`git apply --check` 過）。`src/zones3d.js` 和第一版相同，只換石磚兩張貼圖＋產生工具。
- 石磚（`campus_paving_tex.py` 的 `paving()`）：原圖 5×5 塊（遊戲裡一塊 0.6 m），接縫畫在原圖接縫的位置——**寬＝磚長 3%（約 1.8 cm）、比磚面深 32%**；**每一塊明度 ±5%**（固定亂數，貼圖照樣無縫）；法線＝原圖法線＋接縫的凹槽（沒有大塊污漬）。BB 的範圍：深 25～35%、寬 2～3%、±4～6%。
- 圖：`v1_v2_tiles.jpg`（傅鐘廣場、法學院廣場；左第一版、右第二版，同鏡頭）、同五個角度的單張 `after_v2_*.jpg`（960×540）。
- 柏油、黃中線、白邊線、兩條路的起點：和第一版一樣（BB 已 PASS）。
- 測試：只換貼圖，程式沒變；第一版的 7 支單元測試照舊。截圖是開發分支 e2c470355＋patch（Playwright＋SwiftShader，不是手機實機）。

---

# ART-LIB-FRONT-PAVING-1103：總圖前椰影大道地磚／柏油（LAWWW2，2026-11-03）

使用者原話（經 LAWWW 轉，LIB-FRONT-1102）：「總圖前椰影大道地磚是怎樣」——斑點、柏油污漬、接縫錯開、黃線斷掉。
LAWWW 派工：照照片改用 PBR 石材和柏油（Poly Haven），拿掉斑點和大塊污漬，邊界對齊；柏油照 D30 淺灰；附同角度前後截圖給 BB 驗收。

## 交付
- patch：`campus_paving_1103.patch`（`git apply`；做在開發分支 e2c470355，**在最新的 81f195b1a 上 `git apply --check` 直接過**）
  - `src/zones3d.js`：`photoTex()`（每一份貼圖自己的 Source，載好後通知所有 clone 更新；載不到時先用舊的程序化貼圖，不會黑）、`pavingTex()`、`asphaltPhotoTex()`、`photoNor()`（石磚的法線貼圖）
    - 椰影大道兩側人行道、總圖前廣場、傅鐘廣場、法學院廣場三塊、15 條 pathTex 步道、黑森林旁的鋪面 → 淺米色花崗石磚＋法線
    - 椰影大道柏油 → 照片柏油（D30 淺灰，平均 #acacaa；有 `userData.asphalt`，晚上照舊會暗）
    - 黃色中線（連續、0.15 m 寬、z=0）＋白色邊線（0.12 m、z=±5.55）改成單獨的細長網格，不再靠貼圖畫，所以不會斷
    - 修兩條路的起點：法學院那條（x 30）原本從大道中線 z=0 開始、蓋在大道柏油上 → 從 z=-8（北側人行道外緣）開始；往南那條（x 20）z=0 → z=8
  - `assets/textures/campus/`：`paving_light_diff.webp`（1024²）、`paving_light_nor.webp`、`asphalt_light_diff.webp`（512²，無縫）
  - `tools/blender/env_second/textures/campus_paving_tex.py`：從 Poly Haven 原圖重產這三張（重跑結果和 patch 裡的檔案逐像素相同）
  - `LICENSES.md` 加一列（Poly Haven `granite_tile`、`asphalt_02` CC0 改作）
- 前後截圖：`before_after_paving.jpg`（五個角度，左改前、右改後，960 寬），各角度單張 `before_*.jpg`／`after_*.jpg`（960×540）
  - 改前＝開發分支 0f16f98a3；改後＝e2c470355＋patch。**法學院廣場那一張背景的樹林不同是黑森林第五版（e2c470355 有、0f16f98a3 沒有），不是這個 patch 改的**。
  - `after_latest_dev_81f195b1a_player.png`：最新開發分支＋patch 的實際遊戲畫面（有 HUD、玩家）。

## 測試（最新開發分支 81f195b1a＋patch）
- `node --check src/zones3d.js` OK
- nav_buildings_unit、blackforest_unit、campus_public_unit、ground_zfight_unit、lib_lawn_unit、world_rename_unit、socsci_place_unit：**ALL PASS**
- 瀏覽器（Playwright＋SwiftShader，桌機模擬；不是手機實機）：三張貼圖 HTTP 200；場景裡 19 個鋪面材質用照片石磚＋法線、1 個用照片柏油；console 沒有錯誤
- 沒跑：完整回歸、手機實機、效能量測（貼圖 +3 張共 0.35 MB；網格只多 3 條線）

## 還沒達到參考的地方
- 新石磚的接縫比舊的淡（傅鐘、法學院廣場遠一點就看不太出一塊一塊）。要更明顯可以加大 `campus_paving_tex.py` 的對比或法線強度（`photoNor` 的 normalScale 0.6）。
- 大道柏油沒有車道標線以外的東西（人孔蓋、修補痕）；照片裡也幾乎沒有，所以先不加。
- 驗收狀態：`READY_FOR_ART_REVIEW`（BB 驗收，D128）
