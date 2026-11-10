# GG-FLOWER-STALL-1110：公館捷運站口的花攤「晨露花舖」

狀態：**已交付（MODEL_READY）**，等 LAWWW 整合、接買花的程式；之後 CC 拍、BB 判。LAWWW2 帳號 A，2026-11-10。

- **來由**：LAWWW 11-10 派工。GIFT-HOLIDAY-1110 的 AA_732 有 `gg_flower`「公館站口花攤」（花束 450、向日葵 120，09:00～21:00），遊戲裡沒有這個攤位。
- **做法**（D141 v1，Blender `tools/blender/env_second/gg_flower_stall.py` → `gg_flower_stall.glb`／`.json`）：
  - 花台：木頭三層階梯花台，鋅桶裡插玫瑰（紅、粉、白）、黃鬱金香、薰衣草、滿天星、尤加利、向日葵。
  - 前面地上：一個高桶插著牛皮紙＋玻璃紙包好的花束，一桶向日葵；花台前斜靠一塊價目小黑板。
  - 右邊工作台：牛皮紙捲、收銀小鐵盒、包到一半的花束。
  - 雨棚：四支細鋼柱撐深綠／米白條紋帆布，前面垂下的布簾寫店名「晨露花舖　鮮花・花束・盆栽」（原創，D77），雨棚下一串燈泡。
  - 規格：23,478 個三角形，1.98 MB。燈泡材質 `ggf_lit_bulb` 晚上亮（`TK.addNight(1.6, 0)`）。
- **位置**：公館區域座標 (−47, 11.6)，捷運出口西邊的人行道，攤子正面朝騎樓（+z）。
  - 東邊離捷運出口的阻擋 2.5 m，走得過去。
  - 西邊是行道樹 (−53, 9.4)；北邊是路邊的機車 (z 6.8)。
  - 路人 (−60,10)→(−48,14.5) 在攤子前 2 m。
- **整合（patch `gg_flower_stall_28df8a85c.patch`，--binary，在 28df8a85c 上做的）**：
  - `src/zones3d.js` 公館：
    - 導航阻擋 `blockRect(-47, 11.725, 2.9, 2.05)`；
    - 互動點 `{x:-47.2, z:13.45, kind:'gg_flower', label:'看看花攤', look:…}`；
    - 載入 GLB，燈泡登記夜間發光；載入失敗時沒有畫面，阻擋和互動照舊。
  - `src/assets3d.js`：`bldg.gg_flower_stall`。
  - `src/data/zone_assets.js`：重產。公館多一個；校園那一列只是順序變了，內容相同。
  - `LICENSES.md` 一列；新測試 `tests/gg_flower_stall_unit.js`。
  - **買花要 LAWWW 接**：互動點的 `kind:'gg_flower'` 接 `GIFTH.shopOpt(G,'gg_flower')`／`GIFTH.pick`。沒接之前按下去是「看」那一句。營業時間要不要放進 places.js，也由 LAWWW 決定。
- **測試**：`gg_flower_stall_unit.js`。
  - 開發分支：1、2、3、5 FAIL。加 patch：**ALL PASS**。
  - 模型在範圍裡、範圍裡的導航都擋住。
  - 互動點站得住，從捷運入口、騎樓、往溫州街的巷口都走得到（E.simWalk）。
  - 捷運入口照舊走得到、路人那條線站得住、和捷運出口中間有 2.5 m。
- **回歸**：`flower_reg.txt`，street_props_nav、zone_prefetch、nav_buildings、ground_zfight、gg_gate_cam、gg_glow_shoplit、gg_shops2、gg_views_1107、gg_shoplit_reentry 都 ALL PASS。
- **預覽**：`flower_stall_v1_sheet.jpg`（Blender 預覽，**不是遊戲截圖**，D131）。葉片卡在預覽裡沒有透明，看起來是深色方塊；遊戲裡的 alpha 照 cafe 的葉子。
- **還沒做、沒測過**：
  - 遊戲畫面要等 CC 拍白天、晚上（燈泡）各一張，從騎樓和捷運出口兩個方向。
  - 老闆（NPC）沒有放，要不要放由 LAWWW、AA 決定。
  - 三角形偏多的話，可以把花頭的面數減半。
