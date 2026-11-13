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
- 白天光照貼圖平均 0.34、晚上 0.26。
- 烘焙：第一次的背景程序在烘完白天時被收掉（外層殼結束），重烘一次才完成，GLB 是第二次的結果。

## 測試（開發分支 4556c4be0c＋這一包）
- `shop_cc0` ALL PASS：三項同時成立，便利店從基準表拿掉。
- `place_gate` ALL PASS（重產狀態表）；`--coplanar` 便利店牆疊面 2.66 m²。
- 回歸：cvs_interior_lm、cvs_view_cam_1110、gg_interiors_1104、gg_new_lm、gg_real_inside_1112、gg_shops2_1104 ALL PASS。
- 並排圖 `cvs_cmp.jpg`（遊戲內同鏡頭，改前＝開發分支那一版）：
  - 參考圖；
  - 店門往裡看 14:00；
  - 走道；
  - 貨架近看：最能看出商品高低、深淺、縫隙的變化；
  - 櫃台；
  - 晚上 21:00。

## patch
`cvs_cc0.patch`（底開發分支 4556c4be0c）。
- 改的檔：
  - 便利店 GLB 和兩張光照貼圖、`cvs_interior_lm.json`；
  - 建模腳本 `bb_support/cvs_interior.py`（開發分支原本沒有，從企劃線 BB 版＋g2 的 CC0 改法＋這次的商品拆段）；
  - `cc0_kit.py`：只加 g2 的 `vc_tex`，開發分支的 `part_faces` 保留；
  - `bake_gg_new.sh`：只改 cvs 那一行 NOLM＋S_ph_；
  - LICENSES 兩列、`shop_cc0_baseline.json`、`place_gate_coplanar.json`、`SHOP_STANDARD_STATUS.md`。
- 還沒做：CC 第二層四鏡頭、BB 判美術。
