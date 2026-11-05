# 公館燒臘：進去是燒臘店了（SHAOLA-WIRE-1105，LAWWW2-C 2026-11-05）

- 使用者 06:4x：「公館燒臘線上版本怎麼還是麵店」。
- 原因：BB 做的燒臘店室內 `shaola_interior.glb` v7（企劃線 `65c2a43c5`，我 11-04 驗 MODEL_READY）一直只在企劃線上，沒有人接進遊戲。
  - `zones3d.js` 的 `noodle` 區域照舊載舊的 `noodle_interior.glb`（乾麵 60 的牌子）。
  - 我 06:4x 的店面版本表寫「每一間都已經進遊戲」，是錯的。逐店核對結果在下面。
- 這一包：`noodle` 區域改用 BB 的燒臘店，6 × 13 × 3.2 m 窄長老店。
  - 區域 id 照舊 `noodle`；公館的店門、回公館的落點照舊。
  - 配置是 BB 的原檔 `src/data/shaola_layout.js` v1，沒改；GLB 也沒改。

## 玩家會看到什麼

- 進門站在走道上 (0, 3.4)。這一點和舊的一樣，劇情的「約在燒臘店」、快速前往都用它。
- 店裡的樣子：
  - 左邊五張不鏽鋼方桌、紅圓凳。
  - 右邊整排櫃台：燒臘玻璃櫃、砧板檯、盛飯台。
  - 後牆是價目表、廚房門、冰箱，天花板一排排日光燈。
- 「坐下吃飯」五張桌子各一個（`eat:'noodle'`，照舊是 `story3d.js` 的 noodleScene：點叉燒飯／燒鴨飯）。坐的是面向店裡那一張，對面是 pairSeat。
- 阿哲（第一天約吃飯那一頓）坐第 3 桌北邊 (−2.1, −0.22)，面向店門。這是配置的 `spots.zhe_seat`，NOODLE-SHAOLA-SPOTS-1103 要的就是這一點。
- 老闆站在砧板檯後面 (2.4, 0.6)，面向走道（配置 clerk）。`story3d.js` 的店員、`hcircle3d.js` 的 `CLERK.noodle` 都照這一點。
- 週二、週四的固定客人坐第 4、5 桌，從店門口走進來、走出去（配置 `spots.regular_1～3`＋第 4 桌另一張）。
- 一般客人（crowd3d）坐第 1、2、4、5 桌，第 3 桌留給玩家、阿哲、麵店團，和舊麵店中間那張一樣。
- 出口「離開公館燒臘」在門內 (0, 5.9)，回公館 (−63, 18)，照舊。
- 燈：GLOW_ 光暈（日光燈、燒臘櫃燈泡、電視）合成一個網格，白天晚上都亮。

## 先將就的（D141：給使用者看的清單；不擋玩）

1. **配置裡的「點餐」「看菜單」「看櫥窗」三個互動點沒有接**：遊戲裡沒有這三種的台詞和處理。點餐照舊是「坐下吃飯」那一個。要接的話由 LAWWW 照 AA_612 接。
2. **燒臘櫃沒有比店裡亮**：BB 說「遊戲裡櫃子要比店裡其他地方亮（烘焙或補燈）」。這一版只有櫃子裡燈泡的光暈，沒有烘光照、沒有補燈。
3. **櫃台後面走不進去**：櫃台後面只有老闆站。櫃台南端、冰箱、層架圍起來的一小塊原本站得住 6 點、走不到，擋起來了。
4. **導航多擋的 16 塊**（工作檯、圓凳、椅疊、紙箱、水桶）寫在 `zones3d.js` 的 `SHAOLA_EXTRA`，是照 GLB 根節點的 `extras.extraBlocks` 抄的。測試 ② 會對照，BB 改模型時要一起改。
5. **配置沒載入時照舊是麵店**：例如 index.html 少了那一行。舊的程式全部留著。
6. **舊存檔**：使用者 11-03 說「舊存檔不要管了」。存在店裡的舊位置如果落在新的家具上，引擎會 unstick 一次。

## 測試（Node，不用瀏覽器）

`node tests/shaola_wire_unit.js`：ALL PASS（16 項）

| | 檢查 |
|---|---|
| ① | index.html 在 zones3d／story3d／crowd3d／hcircle3d 前面載入配置；區域是燒臘店；GLB 登錄、檔案在、是 v7（3,905,580 B） |
| ② | `SHAOLA_EXTRA`＝GLB 的 `extras.extraBlocks`；每一塊的中心站不住 |
| ③ | 店門落點 (0, 3.4)、z.spawn 站得住；出口走得到、按得到、回 (−63, 18)；落點不在出口範圍裡 |
| ④ | 五個「坐下吃飯」走得到、按得到，椅子後面（noodleScene 走去的點）走得到，pairSeat 是對面 |
| ⑤ | 阿哲的位子、和第 3 桌差 < 2.5 m；固定客人 4 個位子不在第 3 桌；從門口走得到每一個 |
| ⑥ | 老闆站位不在家具裡；hcircle3d 的 CLERK.noodle 照配置 |
| ⑦ | 沒有小孤島（每 0.1 m 一點） |
| ⑧ | crowd3d 的客人 8 個位子、不在第 3 桌 |

- 修改前（開發分支 `05ddf1e08`）：① 三項都 FAIL（沒有載入配置、還是舊的 10 × 9 麵店、沒有 GLB），後面的檢查不跑。
- 第一次跑 FAIL 2：
  - ① 的大小判斷寫錯：導航格比房間大一圈，改成量走道站得住的長度。
  - ⑦ **真的有問題**：櫃台南端的小孤島，照上面「先將就」第 3 條擋起來。
- 在乾淨的 `05ddf1e08` 上照「接法」拿檔、套 patch：`shaola_wire_unit` ALL PASS。
- 回歸：讀到 noodle、crowd3d、hcircle3d 的 `*_unit.js` 共 288 支，**已經跑完 142 支，全部 ALL PASS**。其他還在跑，跑完補在交件訊息裡。
  - 舊測試 `noodle_regulars_unit`（假的區域、沒有 spots）照舊走舊的六個位子，PASS。
- 瀏覽器沒跑（D131）。CC 的電腦請拍：進門、阿哲那一桌、燒臘櫃。

## 接法（LAWWW-C）

1. 拿 BB 的檔（企劃線，沒改）：`git checkout 65c2a43c5 -- $(cat docs/art-rebuild/second_ai/wip/shaola_wire_1105/files.txt)`。共 4 個：GLB、配置、Blender 腳本 2 支。
2. 套 patch：`git apply docs/art-rebuild/second_ai/wip/shaola_wire_1105/shaola_wire_1105.patch`。內容：
   - `index.html`：在 `aoki_layout.js` 後面載入 `shaola_layout.js`。
   - `zones3d.js`：`buildShaola`。
   - `story3d.js`：店員、阿哲、固定客人讀 `E.zone.spots`，沒有就照舊。
   - `crowd3d.js`、`hcircle3d.js`。
   - `LICENSES.md` 一列。
   - 新測試 `tests/shaola_wire_unit.js`。
3. 和一盞（`../teahouse_tap_1105/`）、樓梯（`../stair_tap_1105/`）、南洋長椅（`../nanyang_bench_1105/`）三包互不相干。

## 店面「真的接進遊戲的 GLB」逐店核對（取代 SHOP_VERSIONS_1105.md「每一間都已經進遊戲」那一句）

方法：在 Node 建每一個區域，記下它向 `ASSETS.loadOne` 要了哪一顆 GLB，再和建模那一邊的分支（企劃線、cc-testing）最新版比大小和 blob。

| 店 | 遊戲載入的 | 和最新版 | 結論 |
|---|---|---|---|
| 公館燒臘 | 舊的 `noodle_interior.glb` | BB v7 沒接 | **這一包修** |
| afar café | `aa_support/afar.glb` v1c | 企劃線有 v1d（a7f16be34：後牆窗卡那段加層板、吊燈、黃金葛，我 04:29 要的） | **v1d 沒接**；要接，換檔就好，配置沒變（待確認） |
| 轉角唱片、洋洋鹹酥雞 | **遊戲裡沒有這兩個區域**（`GG_LIT_ZONE` 有名字，`Z3.ZONES` 沒有） | 洋洋 v1c 的 GLB 在企劃線（e5e9351e0）；轉角唱片找不到 GLB | **沒進遊戲** |
| 同弦、南洋大廳／1 廳、山嵐（v5.1）、新生運動廣場、大口漢堡、大步、好拍 | 和最新版相同 | — | 進遊戲了 |
| 2:30 AM、小路、SUNNY SIDE、阿德影印（v1c）、一盞、林家、木曜日、日常失速 | 和交件版相同 | 阿德 v2.1 等 BB 判 | 進遊戲了 |
| 青木、頁間、日和、慢輪、Daybreak | 和最新版相同 | — | 進遊戲了 |
