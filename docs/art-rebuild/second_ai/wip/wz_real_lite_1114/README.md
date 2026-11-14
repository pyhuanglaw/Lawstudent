# WZ-REAL-LITE-EMPTY-1114：省資源模式站在路中間，眼前的店櫥窗後面是空的

狀態：`READY_FOR_REVIEW`（patch＋Node 測試；遊戲內還沒拍）。LAWWW2-B，2026-11-14。

## 問題

- BB-B 11-14（BB_379，CC 的 WZ_REAL_r4）：站在溫州街路中間看 SUNNY SIDE，櫥窗後面是空的（一片深綠）。
- CC 雲端查：站路中間最近的是對街的林家乾麵；省資源模式（手機、畫質 low）只建最近的一間。站到門口 1 m 才建得出來。

## 原因

- `src/zones3d.js` 的 `shopInsideReal`：省資源模式一次只建一間「走進去的那一顆室內模型」，挑的是離玩家最近的那一間。
- 街道兩側都有店時，玩家站得靠另一側，最近的就是背後那一間；眼前那一間沒建。
- 溫州街的 SUNNY SIDE、小路、日常失速、林家在街景模型裡沒有簡化店內可以墊（`wenzhou_street.glb` 只有 A1、A3、A5、B2、B5、B6 有 `sk_in_*`），所以沒建就是空的。

## 改法（只改 `src/zones3d.js` 一處）

- 最近的那一間在鏡頭背後、而鏡頭前面有另一間在 near 以內：建鏡頭前面最近的那一間。
- 還是一次只建一間，手機的負擔不變。
- 沒有鏡頭、兩間在同一側、前面那一間超過 near：照舊挑最近的。

## 測試

- 新測試 `tests/shop_real_lite_front_1114_unit.js`：開發分支 b4663868c1 原樣 FAILED 1（`test_before.txt`）→ 套 patch ALL PASS（5 種情況）。
- 回歸：用到 `shopInsideReal`／`shopReal` 的 16 支 Node 測試全部通過（`regression.txt`）。

## 還沒做的、風險

- 遊戲內沒拍：請 CC 用 WZ_REAL_r4 原本的站位（路中間）在省資源模式重拍；公館、新生南路、汀州路共用同一段程式，各抽一個「站在路中間」的站位。
- 風險：站在兩側都有店的路中間原地轉鏡頭，會拿掉一間、建另一間（建一間要幾十幀）。原本走過去也會換，但現在轉鏡頭也會換；請 CC 量轉鏡頭時的長幀。太卡的話改成「換店至少隔 2 秒」。
- 手機實機沒測。

## 套用

```bash
git apply docs/art-rebuild/second_ai/wip/wz_real_lite_1114/wz_real_lite_on_b4663868c1.patch
node tests/shop_real_lite_front_1114_unit.js
```
