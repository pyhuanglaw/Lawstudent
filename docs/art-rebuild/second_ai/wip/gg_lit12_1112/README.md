# GG-LIT-12-1112：公館亮窗 12 間都照營業時間暗＋燒臘打烊變暗（LAWWW2-C，2026-11-12）

LAWWW-C 11-12 07:50：公館燒臘（區域 noodle）有營業時間了（每天 11:00～23:00，AA_831），但打烊時從街上看它的窗不會變暗。查的時候發現原本就有的問題：公館街景模型的亮窗現在有 12 間，程式只處理前 8 間。

`gg_lit12_v1.patch`（底：開發分支 `ed70b6d35`；apply --check 乾淨）：`src/zones3d.js`＋測試三支。狀態 `READY_FOR_REVIEW`。模型沒動。

**玩家看到的**
- 燒臘店 23:00 以後店裡暗下來（`noodle_2000_open_2330_closed.jpg`：左 20:00、右 23:30）。
- 花序、轉角唱片、榮恩典文具社、Daybreak 打烊時窗戶會暗了（原本一直亮著）；安泰藥局、汀州鮮果照自己的營業時間暗（原本沒對到營業時間，也是一直亮）。

**原因和改法**
- 街景模型 `gongguan_shops.glb` 的亮窗店編號（extras.xsShops）有 12 個：ggtea、ggbook、ggcvs、ggantai、ggyy、ggbike、ggafar、ggfruit、ggfn、ggcorner、ggrong、ggdb。`Z3.ggShopLit` 的亮度陣列和著色器只開 8 格（`uShopLit[9]`、迴圈 `i<8`／`i<9`、光暈分店 `s>8`）→ 第 9～12 間永遠亮。改成 16 間（`GG_LIT_N`）。
- 對照表 `GG_LIT_ZONE` 補四筆：ggantai→gg_antai、ggfruit→gg_xianguo、ggfn→flower_notes、ggrong→gg_rongendian。
- 燒臘是 G00 那一棟的立體店內（`sk_in_G00`，不是窗卡）：新 `GG_IN_PLACE={G00:'noodle'}`，公館接上街景模型以後呼叫 `Z3.shopInsideLit`（和新生南路同一個函式）。

**驗證**
- 雲端遊戲內（開發版）：20:00 → 亮度陣列第 6、12 格 0.03（慢輪、Daybreak 已打烊），燒臘 1；23:30 → 12 間裡營業的只剩日和便利店（24 小時）、洋洋等還開著的，燒臘 0.07。
- 新測試 `tests/gg_lit12_1112_unit.js` 11 項 ALL PASS（讀 GLB 的店數、每一間都對到有營業時間的地點、陣列和迴圈的長度、燒臘接上）。打 patch 前：②③⑤⑥⑦⑧⑩ FAIL。
- 改兩支舊測試裡寫死的 `uShopLit[9]` → `[17]`（gg_shoplit_reentry、gg_shops2_1104）。回歸 26 支（gg_*、shop_*1112、place_gate、zone_pre*、gongguan*）ALL PASS。

**先將就的／另外看到的**
1. 燒臘打烊以後，店裡天花板那兩團光暈還亮著（`GLOW_shopin` 是整條街合成一個網格，光暈照窗卡的範圍分店；燒臘沒有窗卡所以分不到）——要關得在模型裡給那兩個光暈標店編號，下一次重建公館街景時做。
2. 招牌寫的是「阿鳳麵店」、店裡是白牆紅菜單的麵店樣子；走進去的區域是燒臘（noodle）——店外／店內一不一致排在公館自查那一批看。
3. 真機、PC 沒看過。
