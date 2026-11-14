# 洗樂長椅的互動鍵被搶（LAUNDRY-SEAT-PRIO-1114，BB_379，P3）——LAWWW2-C 11-14

- **問題**：長椅 #1 的走近點離「兌幣機・洗衣精」只有 0.66 m，#2 的走近點離「看使用說明」只有 0.70 m。人停得往那邊偏一點（0.4 m），互動鍵就變成那兩個，出不來「坐著等」。
- **改法**（不改 engine，只改場景配置＋一行接線）：
  - `src/data/tz_shops_layout.js`：xile 的 `change`、`guide` 兩個點加 `"prio": -0.3`。和別的互動點比遠近時讓 0.3 m；站在它們前面照樣是它們。
  - `src/tz_shops3d.js`：把配置裡的 `prio` 傳給互動點。之前沒有傳，其他店沒寫 prio 的就是 0，行為不變。
- **patch**：`laundry_seat_prio_on_6fe2265f29.patch`，底＝開發分支 6fe2265f29。
- **測試**：
  - 新增 `tests/laundry_seat_prio_1114_unit.js`，用真的 tz_xile 區域：長椅走近點往兩個點偏 0～0.4 m，按鈕都是「坐著等」；站在兌幣機、說明前面，按鈕是它們。修改前 FAILED 2，修改後 ALL PASS。
  - 回歸 22 支 ALL PASS，包括 gg_shops3_points、shop_life_audit、place_gate、shop_cc0、tz 各店、tap_pref、tapsteal。
