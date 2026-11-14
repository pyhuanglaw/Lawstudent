# COPLANAR-CREEP-1114：洋洋鹹酥雞的疊面（LAWWW2-C，11-14）

g4 已經收工（dddc6a19d），這件我自己做。

**原因**：都在冷飲櫃，`yangyang_interior.py` 第 421、426 行。
- 黑色踢腳板的正面跟殼的底座疊在同一面。v2 把頂點色件依顏色拆成 plastic_dk 和 plastic_w 兩個材質以後，這兩片變成兩個網格，於是算進疊面。
- 底座、頂蓋的背面跟背板的背面同一面，在 z=-5.5，共 0.36 m²。

**修法**：
- 踢腳板前面凸出 3 mm，上下左右各縮一點。
- 底座、頂蓋改從背板前面開始，也就是 z0+0.06。

**結果**：「一定會閃」從 2.25 降到 1.46 m²（4556c4be0c 的原基準是 2.13）。現在正在重烘（`bake_gg_new.sh yangyang`）。



## 交件（11-14 01:1x UTC）
- **patch**：`yangyang_coplanar_on_920bf1bcfd.patch`，共 8 個檔：
  - 模型 GLB 和兩張光照貼圖
  - yangyang_interior.py
  - 烘焙紀錄 yangyang_interior_lm.json
  - place_gate_coplanar.json：yangyang 的 always 2.25→1.46、wall 0.64→0.53，只有變少
  - SHOP_STANDARD_STATUS.md
  - yangyang_shop_unit.js
- **流程**：先跑 place_gate，不加 --write，結果 ALL PASS、疊面沒有增加；之後才跑 `--coplanar --write` 和 `--write`，沒用 --allow-grow。
- **測試**：都 ALL PASS，包括 yangyang_shop、yangyang_seat_prio、shop_cc0、gg_shops2／3 ×3、gg_views ×2、gg_real_inside、shop_window3d、shop_window_rects、seat_reach ×3、shop_npc。
- **yangyang_shop_unit 第 1 項把 GLB 檔案大小寫死**：從 3,963,052 改成 3,963,196，在說明裡寫了原因。
- **畫面**：只差冷飲櫃底下 3 mm 和背板，看不出差別，所以沒有附對照圖。窗景卡有重新加上去（bake_gg_new.sh 的 CARD）。
- 沒處理的：地上兩件白色物件的疊面還在（[-0.94,0,-1.94]，0.122 m²），量小，留到下一版。
