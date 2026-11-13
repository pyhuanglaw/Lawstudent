# SHOP-REALISM-1112：日和便利店（cvs_interior）CC0（LAWWW2-C 接手幫手 g2，2026-11-13）

g2 改到一半（腳本已經改了、還沒烘焙），LAWWW2-C 接手做完：claude/shop-cc0-g2 3b7618671 的 `tools/blender/env_second/bb_support/cvs_interior.py`。

## g2 已經改好的（原樣保留）
- 頂點色零件（貨架、包裝、櫃子、冷藏櫃框）改成「頂點色 × ambientCG Plastic006」：霧面紋路，起伏 0.015，淺色包裝上不會有灰黑刮痕。
- 金屬零件改成 Metal009。
- 四面牆照舊乾淨的平塗（cvs_wall）。
- 左牆貨架頂上的庫存紙箱改用 Poly Haven `cardboard_box_01`。
- 烘焙排除清單（NOLM）加 `S_ph_`。

## LAWWW2-C 加的
- **貨架商品不再是等大的方塊**（D159）：
  - 原本每 1.2 m 一格、每一層是一整塊同高、同深的商品貼圖方塊。
  - 現在拆成 3～6 段，一段＝一種商品一排，長 0.16～0.38 m，高度 62～100%，中間留 1～3 cm 的縫。
  - 大約三段裡有一段被買掉一些，往後退到 45～70% 深。
  - 靠店門那一段前排照舊是真的瓶罐包裝。
- 試過把中間那一段也做成真的瓶罐：面數 9.7 萬，超過大店 8 萬，退回。現在 61,906 面（改前 57,022）。
- LICENSES.md：Poly Haven 表加 cardboard_box_01 一列、ambientCG 表加 Plastic006／Metal009 一列。
- `tests/shop_cc0_baseline.json` 拿掉便利店（三項同時成立）。

## 光照
`bash tools/blender/env_second/lightbake/bake_gg_new.sh cvs 384` 重烘。
