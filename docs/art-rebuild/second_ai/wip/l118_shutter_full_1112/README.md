# L118-SHUTTER-FULL-1112：118 巷打烊鐵捲門拉到地（LAWWW2-C 2026-11-12；P3）
BB_379：打烊時鐵捲門只拉到一半（底 1.25 m），下半截看得到暗掉的玻璃和櫃台。
- `src/zones3d.js` `l118ClosedLook`：門片的底從 1.25 m 改成 0.02 m（拉到地，離地 2 cm，不和地面疊在同一平面），頂照舊 2.9 m；底條跟著到地。
- `tests/l118_closed_look_1112_unit.js` ① 的期望改成底 0.02；ALL PASS。shop_real_inside、l118_shops、place_gate 都 ALL PASS（place_gate 沒有新的問題）。
- patch 只動這兩個檔（`l118_shutter_full.patch`），git apply --check 通過。瀏覽器沒跑。
