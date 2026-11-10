# 花序 Flower Notes 第 1 版・B 件＋GG-SHOPS3-ART-1110 公館三間外觀（LAWWW2 帳號 A 2026-11-10）

patch：`flower_notes_v1b_gg_shops3.patch`。**要先套**：汀州路第 3 版（`wip/tingzhou_1110/tingzhou_v3_signs.patch`）→ 花序 A 件（`flower_notes_v1a.patch`）→ 這一件（這一件的底＝dev `a37b2ff61`＋那兩件；都動到 `wz_street.py`、`wz_shopkit.py`）。

## 內容
| 項目 | 做了什麼 |
|---|---|
| G11 花序外觀（X325；參考圖 `flower_notes_ref/exterior.png`） | `gongguan_shops.glb` 的 G11：米白洞石色、香檳金細框；一樓兩個大櫥窗＋中間雙開玻璃門（玻璃後面是參考圖裁的景深卡）；招牌帶「花序｜Flower Notes」在騎樓外面（9.4 m 寬）；二樓整排玻璃（看得到教室的長桌）；原本二樓的「牙醫診所」大招牌、直立「定食」招牌拿掉；樓上照舊是公寓 |
| G04 安泰藥局、G08 汀州鮮果、G13 榮恩典文具社（X320；使用者 11-10 21:1x 的外觀參考圖 `ref/gg_shops6_1110/`） | 招牌從參考圖拉正裁、放大到店面寬、一間一塊；店面玻璃後面是參考圖裁的店內（汀州鮮果是整面開著的）；舊的設計稿招牌（公館藥局、水果行、文具・畫材）不用了 |
| 店門前的柱子 | G04、G08、G11、G13 中間那一根拿掉（參考圖門在中間）。**`src/zones3d.js` 改一行**：`[5,7,12,14]` → `[4,5,7,8,11,12,13,14]`（套件和導航阻擋跟著少一根；和 `wz_street.py` 同一份名單） |
| 舊花攤拿掉（X325：完全取代） | `src/zones3d.js` 的花攤那一段（阻擋、互動點、模型載入）拿掉；`src/assets3d.js` 的 `bldg.gg_flower_stall`、`gg_flower_stall.glb／.json`、`tests/gg_flower_stall_unit.js`、LICENSES 那一列拿掉；`zone_assets.js` 重產。買花的互動點 kind `gg_flower` 現在只在花序一樓收銀櫃檯前。`tools/blender/env_second/gg_flower_stall.py` 留著（歷史） |
| 工具 | `gg_shops6_tex.py`（從參考圖拉正裁到 `textures/src/gg_cards/`）；`xs_front_tex.py`（公館、新生南路、溫州街的店面貼圖集產生器，這次第一次進 dev：含 SIGN-RECTIFY-1110 拉正過的四角；`XS_ONLY=gg` 只重做公館那一張；圖集高度超過 4096 會等比例縮） |

## 沒做／要 LAWWW 決定
1. **G09、G10 沒動**：模型還是舊的「自助洗衣」「影印・輸出」（洗樂、印得好已經搬去汀州路）。G10 要改成往汀州路的巷口、G09 放什麼，等使用者／LAWWW 定。`zones3d.js` 的店面街清單 G09～G11 也還是洗樂、印得好、泰米（G11 的套件招牌會寫泰米村食，正式模型載入後看不到）。
2. 三間（安泰、汀州鮮果、榮恩典）只有外觀；室內、進得去是 AA_743 之後的事。門口的東西（安泰的特價推車和血壓計、榮恩典的筆記本推車、汀州鮮果騎樓的水果箱）還不是模型，只在景深卡裡看得到。
3. 花序：外觀保留公館的騎樓線（一樓玻璃退 3 m）；參考圖是沒有騎樓的平立面、門口兩盆橄欖樹和右側花台——這一版只放兩盆盆栽。洞石是淺色灰泥調色，不是真的洞石紋。
4. `gift_holiday_unit` 還是過；買花清單原本接在「看看花攤」，請 LAWWW 改接花序櫃檯。

## 驗證
- `node tests/flower_notes_unit.js` ALL PASS（多三項 1b：沒有舊花攤、G11 門前沒柱子、貼圖集有新的八塊）。
- 公館、花序、汀州路、區域、資產、禮物相關 56 支 Node 測試 ALL PASS（`regression_b.log`）。`tests/gongguan_glb_integration.py`（瀏覽器）沒跑，請 CC。
- `preview_gg_fronts.jpg`：Blender 快速預覽（玻璃在這個預覽裡是不透明的白，遊戲裡是透明、看得到後面的景深卡）；`crops_gg3_flower_from_ref.jpg`：從參考圖裁出來的十一塊。
