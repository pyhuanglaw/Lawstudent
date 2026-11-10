# WZ-SEAT-CAMS-1104：溫州街 SUNNY SIDE、小路坐下後鏡頭被擋

狀態：**已交付**（配置 patch＋Node 測試）。遊戲畫面等 CC 拍（D131）。LAWWW2 帳號 A，2026-11-10。

## 原因
- BB-C 11-04（BB_255）回報：SUNNY 吧台 F12／F13 被吊架擋、小路座位鏡頭卡在樑和酒瓶層架之間。
- AA 在 12ae10d3e（11-04 13:19）加過透空材質和小路三面鏡頭牆。
- 之後 SUNNY SIDE v1e、小路 v4 的配置（dc21c5949 從企劃線拿來的）**把那些設定蓋掉了**；小路的透空清單變回空的、鏡頭牆也沒了。
- 舊清單裡有幾個材質名和現在的 GLB 對不上，例如 kmc_walnut，現在的 GLB 叫 kmc_walnut_rt。

## 量法（Node 建出遊戲的 wz_brunch、wz_teishoku，正式模型從檔案讀）
- 每一個座位（頭在 lift＋1.2 m）× 鏡頭 16 個方向，照 E.followCam（室內 camDist、俯角 0.38、zone.camCols）算鏡頭位置。
- 鏡頭到頭這一條線上，第一個「畫得到、不透明、不會網點透空、不是會淡出的牆（WALL_）」的網格，就算被擋。
- 開發分支 fe4d893ac：
  - SUNNY 14 個座位 224 個鏡頭，**擋住 37 個**：吊架 sns_vc_metal、光亮小東西、出餐檯胡桃木框、菜單板、黃金葛。
  - 小路 18 個座位 288 個鏡頭，**擋住 126 個**：家具與隔板 kmc_vc、酒瓶、樑與層架、木札菜單。小路的鏡頭也常跑到店外。

## 修法（只改配置；patch `wz_seat_cams_fe4d893ac.patch`）
- `src/data/sunnyside_layout.js`：
  - seeThru 加 sns_vc、sns_vc_metal、sns_vc_gloss、sns_walnut_rt、sns_print、sns_leaf_pothos；
  - camWalls 加左牆（卡座那一面）、後牆。右牆是整面落地窗、前面是門窗，照舊淡出。
- `src/data/komichi_layout.js`：
  - seeThru 加 kmc_vc、kmc_vc_gloss、kmc_vc_metal、kmc_walnut_rt、kmc_ceiling_wood、kmc_print、kmc_leaf_pothos、kmc_bulb；
  - camWalls 用右、後、左三面牆（同 12ae10d3e）。
- `src/data/wz_shops_layout.js`：用 `node tools/layout/sync_wz_aa_layouts.js` 重抄（--check OK）。
- 網點透空只作用在「離鏡頭 1.7 m 內」和「擋在鏡頭與玩家之間、玩家周圍」的部分（engine3d.js 的樹幹透視）；其他時候家具照常畫。
- 新測試 `tests/wz_seat_cams_1104_unit.js`。

## 測試
- `wz_seat_cams_1104_unit.js`：開發分支 FAIL 2，加 patch **ALL PASS**（兩間都擋住 0 個）。
- 讀到這兩間配置的 30 支 *_unit.js：29 支 ALL PASS。
  - aa655_wz_rename_unit FAILED 1，**開發分支原樣也一樣**：src/story3d.js 的 GIFTH.shopOpt 對照表有「兩點半 Café」字串，屬於 GIFT-HOLIDAY-1110，不是這個 patch 造成的。
  - 詳見 `regression_fe4d893ac.txt`。

## 要注意的
- AA 改這兩份配置的時候，要保留 seeThru、camWalls 這兩行（上一次就是被蓋掉的），重跑 sync。
- 遊戲畫面請 CC 拍：
  - SUNNY 吧台兩張高腳凳 (−2.3／−1.6, −2.1) 坐下以後轉一圈；
  - 小路吧台、卡座各坐一張轉一圈。
  - 看家具透空的網點會不會太多。
