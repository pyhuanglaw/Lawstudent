# 法學院區第二輪：萬才館照官方地圖轉 42°（LAW-RELAYOUT-1102 第二輪）——交件（READY_FOR_REVIEW，11-03 12:0x）

- **起因**：使用者（經 BB 11-03 09:31 轉述）「超不對 系館a不應該跟系館b平行!!!!」：萬才館的長軸順著辛亥路的弧線轉 40～45°，正面朝西南，對著霖澤館和法學院廣場；國青、研三舍在兩館中間偏北；黑森林照著重排。
- **patch**：`law_relayout_r2_1103.patch`，**接在開發分支最新版 `5282f9bfb`（v9.10.18）**，`git apply --check` 過（LAWWW 11-03 09:37 要求；43b715b1a 的第一輪 patch 作廢、不套）。不含 assets、tools：模型（`campus_blackforest.glb`／`.json` 第五版）請從本分支 `claude/second-ai-env-art` 的 `assets/models/env/second_ai/` 拿。
- **做法**：萬才館中心 (94,−96)、`rotation.y = −0.733`（−42°）。`zones3d.js` 的 `ckPlace` 支援斜放（導航阻擋 `blockRect` 帶角度、鏡頭碰撞盒跟著轉）；`wancaiStairs` 改成在萬才館自己的座標裡算台階高度、平台、陽台，再轉回世界座標。黑森林配置第五版（樹林 1,512 m²、73 棵；往萬才館的土徑改到廣場前 (75.2,−76.6)）。
- **座標（給 LAWWW；舊 → 新）**：萬才館出來 1F (93.8,−98.4) → (89.21,−82.01)、朝向 −0.733；2F 平台出來 → (84.83,−87.31, 第 1 層)；一樓入口互動點 (93.8,−100.6) → (90.68,−83.65)；萬才館二樓的門 → (86.03,−88.64)。`wancai3d.js`、`classes3d.js`、`zrzq3d.js`、`heroine_circle.js`、`pool_more3d.js`、`pool_story.js`、`places.js`、`placemap3d.js`、`story3d.js`（以安的散步路線；舊配置照舊）都照同一個轉換改了。
- **舊存檔**：站在萬才館舊位置的存檔（舊平台、舊門口、舊陽台）讀進來會移到最近站得住的地方（campus_layout_nav 的 OLD_SAVES 檢查）。

## 測試（雲端）
- Node：開發分支 `b6a2ce3c0`＋patch 上 176 支單元測試 ALL PASS（lr_units 清單＋placemap、library_b1、library_upper、aa499_501_pool）；接到 `5282f9bfb` 以後重跑 nav_buildings、blackforest_unit、socsci_place、camp_y1（開發分支新改的）、heroine_circle3d ALL PASS。blackforest_unit 第五版新增「萬才館照官方地圖斜放、轉 34～50°」：0° 時 FAIL、−42° PASS。
- 瀏覽器（`3670b96eb`＋patch，一支一支跑）：campus_layout_nav、flow_wancai_stairs、flow_wancai_floors（第二次；第一次失敗＝測試裡出口的期望值還是第一輪的 (95.8,−86.4)，改成 (89.21,−82.01)＝wancai3d.js 的 CAMPUS_1F）、wancai_glb_integration、tap_floor_levels、zone_transitions、reachability_all（campus、wancai）**全部 ALL PASS**。
- 截圖：`cmp_aerial_map_before_r1_r2.jpg`（官方地圖／改前／第一輪／第二輪鳥瞰）、`game_r2_6views.jpg`（斜看、萬才館正面、霖澤館往萬才館、研三舍、高角度、黑森林土徑）。

## 還沒做／已知
- 實機沒測（只有 Playwright 手機模擬）。
- 萬才館的外觀 GLB（wancai_exterior.glb）是跟著套件一起轉，沒有重匯出；wancai_glb_integration 過了。
- 美術：BB 驗收（D128）。
