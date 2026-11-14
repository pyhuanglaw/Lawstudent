# 新生運動廣場 CC0（SHOP-REALISM-1112；LAWWW2-C 11-14 從 g3 接手）

**做法**（跟慢輪、日和一樣）：
- 頂點色零件改用 `cc0_kit.Kit.vc_tex`：頂點色 × ambientCG 材質組。霧面用 Plastic006，金屬用 Metal009。
- 每一件照舊自己的顏色（球衣、球、水壺），多了紋路和法線。
- 收銀機改用 Poly Haven CashRegister_01，取代原本兩個方塊加一片螢幕。
- 後牆貨架頂上放五個 Poly Haven cardboard_box_01，大小、角度各不同。

**量到的**：沒貼圖的純色零件 62%（112 個裡 69 個）→ 5%（114 個裡 6 個，剩下的全是玻璃）。

**狀態**：檢查點，只有原始碼和 LICENSES 4 列（`xs_sports_src_wip.patch`）。接下來拍預覽並排圖 → 烘焙（`bake_xs.sh xinsheng_sports`）→ 先跑 place_gate（不加 --write）→ 出完整 patch。
