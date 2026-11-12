# TZ-SHUTTER-POS-1112：汀州路四間（聯通、東南大聯、客居、越好吃）打烊的鐵捲門在騎樓外緣（LAWWW2-C 2026-11-12）

BB 11-12 FAIL：這四間 23:30 的鐵捲門放在騎樓外緣，蓋住招牌、騎樓、機車；泰米、印得好位置對。

- 原因（我的錯）：這四間沒有騎樓，街景模型把整棟退到店面線（立面再往裡 3.2 m，`wz_street.py` TZ_XS 那一段的 `pos`），玻璃在那裡再退 0.3 m＝離立面 3.5 m。`src/tingzhou3d.js` 的 `S.REAL_DEP` 寫成 0.3，所以**店內模型和鐵捲門都往街上多出 3.2 m**（不只鐵捲門）。
- 改法：`REAL_DEP` 四間 0.3 → 3.5；加 `S.REAL_SX`：鐵捲門只蓋玻璃那一段、高到玻璃上緣（不蓋住招牌板和照片菜單）。
- 測試 `tests/shop_real_inside_1112_unit.js`：㉖ 原本只比 dep（少 3.2 m 也過）→ 沒有騎樓的店比 arcade＋dep；加 ㉓b。ALL PASS；用到 tingzhou3d／shopReal 的測試、`place_gate_unit.js` 沒有新的紅。
- patch：`tz_shutter_pos_v1.patch`（只有 `src/tingzhou3d.js` 和那支測試）。
- **狀態：WIP——確認圖（白天、23:30 各兩張）還在拍，沒看到畫面以前不算交付。**
