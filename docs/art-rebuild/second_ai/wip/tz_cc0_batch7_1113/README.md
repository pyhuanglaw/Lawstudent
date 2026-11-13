# 第七批：一盞天花板加高 v2（含紙燈縮小）＋汀州鮮果葡萄 v2.2

底：開發分支 `origin/claude/adoring-meitner-mqzst8` 0f9c78d37f。`git apply --check` 乾淨。
**這一份取代 `wip/yizhan_ceiling_1113/yizhan_ceiling_1113.patch`（v1）**：v1 還沒整合就直接用這一份；已經套了 v1 的話，先 `git checkout -- .` 退回再套這一份。

## 1. 一盞（wz_teahouse）天花板 2.6 → 2.9 m（SHOP-INTERIOR-VIEW-1112）

BB 判 PASS（BB 分支 23c9c2170e）。v1 的內容不變：
- `yizhan.glb` 2.34 m 以上的頂點抬高 0.3 m；
- 配置 `h: 2.9`，`wz_shops_layout` 用 sync 工具重產；
- `WZ_CAMDIST.teahouse = 3.2`，鏡頭 2.86 m；
- place_gate 已知未過表拿掉一盞這一項。

**v2 加的**：BB 判紙燈是 P2，三盞紙燈離鏡頭太近，佔了畫面上半部。
- BB 原本建議燈跟著上移，但鏡頭在 2.86 m，燈往上移只會更靠近鏡頭、在畫面上更大，所以改成縮小。
- 做法：三盞紙燈（`yzn_washi` 紙面＋`yzn_pend` 木框，中心 (−2.3, 1.7)、(−0.9, 1.7)、(1.4, 1.7)）以燈頂中心為支點縮到 0.72 倍，燈頂照樣接著吊線，燈底從 1.93 m 收到 2.02 m。共 978 個頂點。
- `GLOW_washi_*` 的光源位置沒動。
- 光照不重烘：BB 判 P3，下次有別的改動要重烘時再一起做。

## 2. 汀州鮮果葡萄 v2.2（SHOP-REALISM-1112；BB P2：一撮一撮的紫點 → 一大串一大串堆起來、看不到箱底）

- Poly Haven 沒有葡萄的掃描模型（`food_grapes_01` 的 API 回 404），所以照 BB 的第二個建議做。
- 每串的芯放大 1.45 倍，小葡萄 10 顆，比原本大一點，分布在上半圈；每串隨機傾斜，像壓在別串上。
- 箱裡串和串的間距從 0.18 m 縮到 0.15 m，比一串短，所以互相壓著；一半的縫上面再壓一串。
- 三角形 78,626 → 79,182，沒超過 8 萬。重新用 Cycles 烘了光照。

## 測試（套用後）

- `place_gate`：ALL PASS，已知未過 13 項。`--coplanar` 只改了 yizhan、gg_xianguo 兩筆，`--write` 已重產，兩個都含在 patch 裡。
- 下列測試全部通過：
  - 所有提到 yizhan、teahouse、xianguo 的測試；
  - `wz_*`、`tz_*`、`gg_*`、`shop_*` 單元測試（含 `shop_cc0`）。

## 圖

- `yizhan_ceiling_cmp_v2.jpg`：參考圖；原本 vs v2 的預設跟隨鏡頭；v1 vs v2 的紙燈；抬頭看天花板。
- `cmp_xianguo_v22.jpg`：參考圖；第六批 vs v2.2 的水果架；近看葡萄箱。
