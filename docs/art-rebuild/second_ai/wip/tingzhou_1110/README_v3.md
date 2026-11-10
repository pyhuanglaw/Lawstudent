# TINGZHOU-AREA-1110 第 3 版（D141 第 3／3 版）：只改洗樂洗衣坊、印得好、泰米村食的招牌（BB 第 2 版判定，BB_255）

patch：`tingzhou_v3_signs.patch`（base＝dev `a37b2ff61`）。只動 `tingzhou_street.glb`（＋json）、`wz_street.py`、`wz_shopkit.py`。
- BB：「洗樂、印得好店名上下各出現一次，參考圖只有一塊」→ 三間都只留騎樓外面那一塊（參考圖的位置），店面上方那一塊拿掉；泰米招牌上的三盞射燈跟著拿掉（參考圖的燈在招牌板上，已經在貼圖裡）。
- BB：「泰米、印得好招牌字比參考圖小很多」→ 招牌板放大到整個店面寬（泰米 7.4 m × 1.45 m、印得好 6.1 m × 0.9 m、洗樂 5.6 m × 0.7 m；`wz_shopkit` 的 `street_fit`），字高照參考圖的比例。
- 櫥窗、門、菜色照片沒動。
驗證：`node tests/tingzhou_unit.js` ALL PASS。`preview_v3_three_signs.jpg` 是 Blender 快速預覽（不是遊戲截圖）：上＝泰米正面，下＝洗樂（左）、巷 A 口、印得好（右）。
巷 A、夜市攤這一版不動（BB：併到 NIGHT-MARKET-1110）。
