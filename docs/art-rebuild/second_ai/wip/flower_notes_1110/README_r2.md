# 重交（r2）：花序 B 件＋公館三間外觀＋公館三間室內，合成一個 patch（LAWWW 2026-11-10 22:43 退件後）

**patch：`gg_flowerB_gg3_ext_int_r2.patch`**（base＝dev `fd4dd9aef`；在 `9a5164f24` 上 `git apply --check` 乾淨）。取代並刪掉：`flower_notes_v1b_gg_shops3.patch`（8dd2084a2，被退）和 `wip/gg_shops6_int_1110/tz_shops_int_v1c_gg3.patch`（34a5e0656，還沒套）。內容說明照舊看 `README_B.md`（外觀、拿掉舊花攤）和 `wip/gg_shops6_int_1110/README.md` 最後一節（公館三間室內）。

## 退件的兩點怎麼修
| LAWWW 退的 | 原因 | 修法 |
|---|---|---|
| `zq_arcade_seat_unit`：G08 騎樓的凳子 `sk_stool_r_G08`（子晴的劇情座位）不見了 | 照參考圖的店面（`gg_front`）會把原本騎樓的雜物整組換掉 | `wz_shopkit.py`：照參考圖的店面多一個 `keep` 名單（要留著的騎樓雜物）；G08 留 `stool_r`、`outlet`。重建後凳子、插座在原位 |
| `street_props_nav_unit`：`gongguan_shops.props.json` 變了，`GG_PROP_BLOCKS` 沒跟著改 | 我沒有重算 | `src/zones3d.js` 的 `GG_PROP_BLOCKS`：拿掉十一塊已經不存在的舊雜物的阻擋（G04、G08、G11、G13 原本的箱子、立牌、盆栽——不拿掉會變成看不見的牆），加花序門口兩盆盆栽。安泰、榮恩典門邊的盆栽拿掉了 |

順便：汀州路洗樂洗衣坊的 `keep=('bench',)`（騎樓木長椅；下次重建汀州路街道模型時才會出現，這一包沒有重建 `tingzhou_street.glb`）。

## 驗證
- **全部 1241 支 Node 測試都跑了**（`regression_r2_full.log`）：全部通過；`bookstore_exit_unit` 最後一行印的是載入警告，結束碼 0。
- 在 `9a5164f24` 的乾淨工作樹套上後再跑：`zq_arcade_seat_unit`、`street_props_nav_unit`、`flower_notes_unit`、`tz_shops_unit`（六間）、`tingzhou_unit`、`gift_holiday_unit` 都 ALL PASS。
- 之前只跑相關的幾十支就交件，漏了這兩支；之後交件一律跑全部。
- 瀏覽器的測試（`gongguan_glb_integration.py` 等）沒跑，請 CC。
