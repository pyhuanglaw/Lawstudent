# 泰米村食 CC0 v2（BB_379 末節三點；LAWWW2-C 2026-11-13）— 已交付
**套法**：開發分支 0eb8ce091a（已有 v1）上 `git apply --3way taimi_cc0_v2_on_v1.patch`（含 GLB／光照貼圖二進位；在乾淨的 0eb8ce091a 試套過，乾淨）。
對照圖 `cmp_taimi_v2.jpg`：參考圖／v1／v2 同鏡頭遊戲內畫面（進門、櫃台、廚房、右牆、長椅、19:30、街上）。

## 改了什麼（對 BB 三點）
1. 廚房後牆＋抽油煙機「整塊灰平板」→ 後牆白磁磚到頂（ambientCG Tiles036）；不鏽鋼工作台有門片、黑縫、把手、檯面倒角；抽油煙機改斜罩＋下面濾網格柵＋風管到天花板；兩層層架上放鍋碗；冰箱分兩門、把手。
2. 「牆上太空」→ 全店一圈木腰板（深色木板＋淺色扶手條，高 0.95；右牆的跟著右牆淡出 WALL_Efix、正面牆窗下的跟著正面牆 WALL_Sfix）；相框四幅（Poly Haven fancy_picture_frame_01，0.62 m：右牆兩幅、左牆一幅、後面隔牆一幅）；天花板垂吊藤編盆三盆＋Poly Haven 蕨類。
3. 「燈偏暗平」→ 重烘：吊燈 45→80 W、牆上投射燈 12→20 W、補光 10→28 W、窗外天光 0.8→1.0。

## 測試（0eb8ce091a＋本 patch）
tz_shops、shop_cc0（泰米 OK，純色 13%、零件 38）、tz_shops_notrap、shop_real_inside、tz_shop_views、shop_window3d、tingzhou、open_only、place_gate：ALL PASS。雲端瀏覽器 8 張沒有 pageerror。

## 數字、還沒做的
- GLB 4.0 → 4.8 MB；手機效能請 CC 量（BB 排）。
- 相框裡的畫是 Poly Haven 模型自帶的風景油畫，不是參考圖的植物版畫；要換成泰式主題的圖要 BB／LAWWW 說。
