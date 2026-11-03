# 法學院區第二輪：萬才館照官方地圖轉 42°（LAW-RELAYOUT-1102 第二輪）——WIP，還沒交件

- **起因**：使用者（經 BB 11-03 09:31 轉述）「超不對 系館a不應該跟系館b平行!!!!」：萬才館的長軸順著辛亥路的弧線轉 40～45°，正面朝西南，對著霖澤館和法學院廣場；國青、研三舍在兩館中間偏北；黑森林照著重排。
- **patch**：`law_relayout_r2_1103_wip.patch`，接在開發分支 `3670b96eb`（**交件時會在當時開發分支的最新版上重產**，LAWWW 11-03 09:37 要求；43b715b1a 的第一輪 patch 作廢、不套）。模型（`campus_blackforest.glb` 第五版）在本分支 `assets/models/env/second_ai/`。
- **做法**：萬才館中心 (94,−96)、`rotation.y = −0.733`（−42°）。`zones3d.js` 的 `ckPlace` 支援斜放（導航阻擋 `blockRect` 帶角度、鏡頭碰撞盒跟著轉）；`wancaiStairs` 改成在萬才館自己的座標裡算台階高度、平台、陽台，再轉回世界座標。黑森林配置第五版（樹林 1,512 m²、73 棵；往萬才館的土徑改到廣場前 (75.2,−76.6)）。
- **座標（給 LAWWW；舊 → 新）**：萬才館出來 1F (93.8,−98.4) → (89.21,−82.01)、朝向 −0.733；2F 平台出來 → (84.83,−87.31, 第 1 層)；一樓入口互動點 (93.8,−100.6) → (90.68,−83.65)；萬才館二樓的門 → (86.03,−88.64)。`wancai3d.js`、`classes3d.js`、`zrzq3d.js`、`heroine_circle.js`、`pool_more3d.js`、`pool_story.js`、`places.js`、`placemap3d.js`、`story3d.js`（以安的散步路線；舊配置照舊）都照同一個轉換改了。
- **舊存檔**：站在萬才館舊位置的存檔（舊平台、舊門口、舊陽台）讀進來會移到最近站得住的地方（campus_layout_nav 的 OLD_SAVES 檢查）。

## 測試（雲端）
- Node：176 支單元測試 ALL PASS（含 nav_buildings、blackforest_unit 第五版新增「萬才館照官方地圖斜放、轉 34～50°」——0° 時 FAIL、−42° PASS；kit_nav_check、heroine_circle3d、nav_soclib、bike、socsci_place、placemap）。
- 瀏覽器（一支一支跑）：campus_layout_nav、flow_wancai_stairs、flow_wancai_floors、wancai_glb_integration、tap_floor_levels、zone_transitions、reachability_all（campus、wancai）——**跑中**。

## 還沒做
- 瀏覽器測試結果、截圖（鳥瞰＋官方地圖並排、斜看、萬才館正面、霖澤館往萬才館）、在最新開發分支重產 patch → 交 LAWWW、BB。
