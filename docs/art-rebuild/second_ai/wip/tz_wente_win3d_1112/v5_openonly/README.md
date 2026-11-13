# OPEN-ONLY-1113：營業才擺／打烊才擺（溫特寶邸 v5＝最後一版；BB_379 v4 P2）（LAWWW2-C 2026-11-13）

- `src/zones3d.js` 新增 `Z3.openOnly(root, zone)`：街景模型裡名字開頭 `OPENONLY__<地點>__…` 的物件只在營業時顯示、`CLOSEDONLY__<地點>__…` 只在打烊時顯示（`PLACES.isOpen`，颱風停業算打烊）；掛 `zone.update` 每 30 幀切一次；記在 `zone.openOnly`。
- `src/tingzhou3d.js`：汀州路街景載入後呼叫 `Z3.openOnly(tzR,zone)`；**拿掉 LAWWW-C cabdf8ad9a 的專用版**（`S.OPEN_ONLY`、`zoneTime` 開頭那段、`zone.tzOpenOnly`），不兩套並存。
- `wz_shopkit.py`：`clutter ('glb', 檔, x, z, 地點)` 給第五個＝節點名 `OPENONLY__<地點>__<店>_<n>`，而且不擋路（收起來以後不能留一道看不到的牆）。`wz_street.py` 溫特寶邸衣架給 `'tz_wente'`。
- 街景 `tingzhou_street.glb` 重建（節點 `OPENONLY__tz_wente__Twente_0`；大小 9,918,440，和開發分支差 12 bytes）。
- 測試：新 `tests/open_only_1113_unit.js`（營業／打烊／公休／颱風／zone.update 切回來／節點在模型裡）；`tests/wente_rack_closed_1113_unit.js` 改成驗新機制＋舊專用版已拿掉。另外 tingzhou、tz_shops、tz_shops_notrap、tingzhou_walkers、tingzhou_places、tz_shop_views、tz_front_lit、tz_wente_interior、shop_window3d、shop_cc0、shop_real_inside 都 ALL PASS（13 支）。
- `open_only_1113.patch`：底＝開發分支 cabdf8ad9a，`git apply` 直接套。
- 照片：`cmp_rack_open_closed.jpg`（週四 15:00 擺出來／23:00 收進去）。
- 之後同一套可以用：阿忠鮮果（`OPENONLY__wz_fruit` 水果箱、`CLOSEDONLY__wz_fruit` 藍帆布＋紙板）、汀州鮮果、清州刀削麵湯鍋檯（BB 建議）。
