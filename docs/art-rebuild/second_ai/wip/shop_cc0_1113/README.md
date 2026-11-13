# SHOP-REALISM-1112／D160：店內模型有沒有用 CC0 素材的自動檢查（LAWWW2-C 2026-11-13）

使用者 2026-11-12 21:5x：「早就該這麼做了 這些素材早就跟你講了 一定要寫進規則 每間店做好的也要檢查 用這些素材更貼近2D圖篇」（UA-LAWWW2-1112-07；規則 D160＝CLAUDE.md §12 第 2 點「素材」）。

## 檔案（交 LAWWW 放進 tests/、接 node-unit-auto）
- `shop_cc0_unit.js` → `tests/shop_cc0_unit.js`
- `shop_cc0_baseline.json` → `tests/shop_cc0_baseline.json`（在開發分支上重跑 `node tests/shop_cc0_unit.js --write` 產生，和這份應該一樣，除非期間有店改了）

## 一間店算「有用 CC0」要三樣都有
1. LICENSES.md「Poly Haven 模型」那一節有一列寫到這個店內模型＝道具用了掃描模型
2. LICENSES.md 的 ambientCG／Poly Haven 貼圖有一列寫到它＝用了 CC0 材質組
3. 沒貼圖的純色零件少於 25%（地點關卡「質感」同一個算法；門檻比它的 ★50% 嚴）

店的清單＝`tests/place_gate_coplanar.json` 的鍵（地點關卡從每一間店算出來的店內模型，去掉 `*_stair.glb`）＋只從街上看的溫特寶邸。

## 結果（在 21773bf35b＋溫特寶邸 v2 上跑）
**50 個店內模型，只有溫特寶邸 v2 過；其他 49 個都要照 SHOP-REALISM-1112 重做**（清單 `todo_49.txt`，每一間寫了缺哪一樣）。
一開始只看「LICENSES 有寫到」＋純色 <50% 時，有 20 間會「過」——因為牆、地板用過一張 Poly Haven 貼圖，道具還是方塊。這和使用者說的「所有店面都是方塊」不符，所以改成三樣都要。

## 怎麼擋
- 基準表上的 49 間只印 TODO、不擋（不讓每個人推程式都變紅）。
- 擋的：①新的店內模型沒用 CC0 ②基準表上的店已經改好、表沒拿掉（跑 `--write`，和模型同一個 commit 交）③基準表的模型改名或拿掉了。
- 驗過：基準表照實時 ALL PASS；把 l118_tea 從表上拿掉 → FAIL 1（擋得住）。
- 給地點關卡用：`require('./shop_cc0_unit.js').cc0Of(glb)` 回 `{ok, model, material, flatPct, why}`，SHOP_STANDARD_STATUS「CC0 素材」那一欄可以直接接。
