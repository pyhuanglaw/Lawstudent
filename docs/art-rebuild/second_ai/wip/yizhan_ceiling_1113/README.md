# 一盞（wz_teahouse）天花板加高：2.6 → 2.9 m（SHOP-INTERIOR-VIEW-1112，CLAUDE.md §12 第 2 點「有天花板（比跟隨鏡頭高）」）

底：開發分支 `origin/claude/adoring-meitner-mqzst8` 0f9c78d37f（第六批已經在裡面）。`git apply --check` 乾淨。

## 為什麼是加高，不是藏天花板

- 地點關卡第一層比的是「房間高度 vs 預設跟隨鏡頭高度」。藏天花板（CEIL_／ceilHide）過不了這一項，也不符合 §12 第 2 點「有天花板」。
- 只把鏡頭拉近也不行：2.6 m 要鏡頭距離 ≤2.43，LAWWW-C 判太擠。

## 改了什麼

1. `assets/models/env/second_ai/aa_support/yizhan.glb`：模型裡 2.34 m 以上的頂點整體抬高 0.3 m，包括天花板板、小梁、束、牆頂、柱頂、吊燈的線和吊座，共 1,190 個頂點。
   - 2.34 m 以下一個頂點都沒動：長押、紙拉門、木牌、水屋層架、吊燈燈罩都照舊。
   - 直接改 GLB 的頂點資料，沒有經過 Blender 重新匯出，所以材質、名字、光照貼圖 UV、`extras.lightmap` 全都不變。
   - 牆的上緣是拉長的，光照貼圖跟著拉長一點，看起來差不多。
2. `src/data/yizhan_layout.js`：`h: 2.6 → 2.9`。`src/data/wz_shops_layout.js` 用 `tools/layout/sync_wz_aa_layouts.js` 重產。
3. `src/zones3d.js`：`WZ_CAMDIST` 加 `teahouse:3.2`，和阿德影印、林家、小路同一個做法。跟隨鏡頭高 2.86 m，比天花板 2.9 m 低。
4. `tests/place_gate_unit.js`：已知未過表拿掉 `ceiling wz_teahouse`；`SHOP_STANDARD_STATUS.md` 用 `--write` 重產。
5. `tests/place_gate_coplanar.json`：用 `--coplanar` 重算（FACTS 11-13），只改了 yizhan 那一筆。牆的疊面 1.17 → 1.22 m²：原本柱子和牆就有的疊面，跟著牆頂一起拉高 0.3 m，沒有新的疊面。

## 測試（套用後）

- `place_gate_unit`：ALL PASS，已知未過 14 → 13 項。
- 所有提到 yizhan／wz_teahouse／teahouse 的測試，加上 `wz_*` 單元測試、`shop_cc0`：全部通過。

## 截圖

`yizhan_ceiling_cmp.jpg`：同鏡頭，左邊是改之前、右邊是改之後。三組依序是預設跟隨鏡頭、從玄關往裡看、抬頭看天花板。

## 還沒做／觀察

- 光照貼圖沒有重烘：牆的上半段跟著拉長，看起來沒有問題。BB 若覺得天花板附近的明暗不對，再重烘。
- 預設跟隨鏡頭會從兩盞紙燈中間看過去，紙燈在畫面上半部佔得比較大（改之前也一樣，只是之前鏡頭在天花板上面）。不擋，留給 BB 判。
