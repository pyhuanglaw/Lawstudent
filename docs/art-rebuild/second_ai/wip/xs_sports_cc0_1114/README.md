# 新生運動廣場 CC0（SHOP-REALISM-1112；LAWWW2-C 11-14 從 g3 接手）

**做法**（跟慢輪、日和一樣）：
- 頂點色零件改用 `cc0_kit.Kit.vc_tex`：頂點色 × ambientCG 材質組。霧面用 Plastic006，金屬用 Metal009。
- 每一件照舊自己的顏色（球衣、球、水壺），多了紋路和法線。
- 收銀機改用 Poly Haven CashRegister_01，取代原本兩個方塊加一片螢幕。
- 後牆貨架頂上放五個 Poly Haven cardboard_box_01，大小、角度各不同。

**量到的**：沒貼圖的純色零件 62%（112 個裡 69 個）→ 5%（114 個裡 6 個，剩下的全是玻璃）。

**狀態**：檢查點，只有原始碼和 LICENSES 4 列（`xs_sports_src_wip.patch`）。接下來拍預覽並排圖 → 烘焙（`bake_xs.sh xinsheng_sports`）→ 先跑 place_gate（不加 --write）→ 出完整 patch。

## 11-14 01:4x 更新：改用 g3 的進度當底（252bc3765a）
- g3 已經做的：衣服 Fabric036、水壺 Plastic006、球鞋 Leather037、獎盃 Metal009（vc_tex），加上 Poly Haven 足球。
- 我在上面加的：其他頂點色零件（層架、衣架、人台、背包、球、欄杆…）改用 Plastic006／Metal009 的 vc_tex，名字照舊 xs_vc／xs_vc_metal；Poly Haven 收銀機；貨架頂上的紙箱。
- 純色零件 62% → 5%（116 個裡 6 個，全是玻璃）。畫面上 103,758 三角形（原本 93,788）。
- 並排圖 `xs_sports_cmp.jpg`（Cycles 預覽，不是遊戲截圖）：收銀機、貨架紙箱看得出來；衣服、球的材質細紋要近看才看得到。
- 正在烘（`bake_xs.sh xsports`）。烘完先跑 place_gate（不加 --write），再出 patch。

## 交件（11-14 01:5x UTC）
- **patch**：`xs_sports_cc0_on_07bbd8564e.patch`（底 07bbd8564e），內容：
  - GLB、json、光照貼圖日夜兩張、xinsheng_sports_lm.json
  - xinsheng_sports_interior.py
  - LICENSES 4 列
  - shop_cc0_baseline 拿掉新生運動
  - xs_lm_unit：instancing 56 → 58（足球、紙箱各一組 Poly Haven）
  - 疊面基準只換 sha1
  - 狀態表
- **流程**：先跑 place_gate，不加 --write，新的問題 0。之後 --coplanar --write：牆 2.12、一定會閃 48.06，兩個數字都沒變。
- **測試**：shop_cc0 三項都成立（純色 5%）。新生南路、新生運動、xs、shop_window、seat_reach、placemap、shop_npc 共 28 支 ALL PASS。
- **烘焙**：白天平均 0.173、晚上平均 0.111。
- **誰做的**：g3（252bc3765a：衣服、鞋、水壺、獎盃、足球）＋LAWWW2-C（其他頂點色零件、收銀機、紙箱）。驗收是 LAWWW2-C 自己做的，要再請 BB 判美術。
