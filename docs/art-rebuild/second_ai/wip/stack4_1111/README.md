# 這一輪四包疊在開發分支上一起試（LAWWW 11-11 12:26 派給 LAWWW2）

狀態：**READY_FOR_REVIEW**（2026-11-11 13:4x UTC）。只是試套、跑測試，**沒有 push 到開發分支、四包的內容沒改**。

基底：開發分支 `56ecee2fb5`。照順序 `git apply --index --3way`：

| 順序 | patch（LAWWW2 分支） | 交付 SHA | 結果 |
|---|---|---|---|
| ① | `wip/l118_p2_1111/l118_p2_v1.patch`（義大麵屋吧台凳＋奈良咖哩、義大麵屋窗上海報背面） | 988dfcbe2 | 乾淨（9 個檔） |
| ② | `wip/tap_ray_seat_1111/tap_ray_seat_v1.patch`（點畫面判椅子） | cef36c9c7 | 乾淨（4 個檔） |
| ③ | `wip/cafe_bar_cam_1111/cafe_bar_cam_v1.patch`（Café 吧檯鏡頭） | 42671da70 | 乾淨（2 個檔） |
| ④ | `wip/gg_shops6_int_1110/gg_shops3_points_v1.patch`（GG-SHOPS3 資料補五項） | 24a2bc245 | 乾淨（3 個檔） |

- 四包動到的檔沒有重疊（①：l118 兩間的模型、腳本、`l118_shop_layouts.js`、`l118_shops3d.js`；②：`engine3d.js`、`game3d.js`、兩支測試；③：`zones3d.js`、一支測試；④：`tz_shops_layout.js`、`tz_shops3d.js`、一支測試），各自要不要改：**都不用改**。
- ① 的 `src/data/l118_shop_layouts.js` 是產生的檔：疊好以後用 `python3 tools/lane118/gen_shop_layouts.py` 重產一次，和套進去的一模一樣（開發分支從 ① 的基底以後沒有改過其他八間的配置）。
- 合併 patch：`stack4_on_56ecee2fb.patch`（18 個檔，就是上面四包依序疊起來，`git diff --binary --cached`）。你可以照順序一包一包套，也可以套這一個。

## 測試

- **全部 Node 測試（四包一起）1290 支**（`regression_stack4.log`，含四包新加、改過的測試）：1289 支 ALL PASS；`bookstore_exit_unit` 老警告（結束碼 0）。
- 合併 patch 在最新開發分支 `71adf757d7` 上也試過 `git apply --3way`：乾淨。
