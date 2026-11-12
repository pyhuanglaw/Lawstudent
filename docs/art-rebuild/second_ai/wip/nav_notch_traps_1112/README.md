# NAV-NOTCH-TRAPS-1112（共用場景的「進得去、出不來」）

原本跟著舊序章那一段的場景巡檢一起做（帳號 A 11-11 的 WIP）。那一筆 11-12 取消，但巡到的四個問題都在法律系也會走到的場景，另外交。

| 建議任務 ID | 哪裡 | 問題 | 改法 |
|---|---|---|---|
| NAV-NOTCH-CAMPUS-1112 | 校園法學院那一帶斜的一排（13 塊）＋(91.25,−113) 兩塊 | 小縫進得去、出不來 | `src/zones3d.js` `NAV_NOTCHES.campus`，蓋完導航以後擋那幾格 |
| NAV-NOTCH-WENZHOU-1112 | 溫州街 (20.75,5.75) | 同上 | `NAV_NOTCHES.wenzhou` |
| NAV-NOTCH-SOCLIB-1112 | 社科院圖書館一樓 (10.2,−7.0) | 同上 | `src/soclib3d.js` |
| SOCLIB2F-SOFA-AP-1112 | 社科院圖書館二樓東側兩張沙發 | 點沙發走到沙發背後，「坐在沙發上」不出來 | `src/soclib2f3d.js` 沙發 `seat.ap`（東側站得住的地方） |

- patch：`nav_notch_traps_v1.patch`（對開發分支 `git apply --check` 過）。動到：`src/zones3d.js`（`NAV_NOTCHES`、`navNotch`，Z3 匯出）、`src/soclib3d.js`、`src/soclib2f3d.js`、新測試 `tests/nav_notch_traps_1112_unit.js`。
- 測試（Node，模擬，D131）：新測試 ALL PASS（21 區、1125 個互動點、853 個座位）；`place_gate_unit`、`us_nav_traps_1111_unit`、`nav_soclib_unit`、`soclib2f_unit`、`soclib_hours_unit` 都 ALL PASS。全部 Node 以 GitHub Actions 為準。
- 沒做：瀏覽器裡走一遍（請 CC 排：溫州街 (20.75,5.75) 附近、社科院二樓點沙發坐下）。
- 先將就的：小縫是「擋格子」不是改模型，畫面上那條縫還在，只是走不進去。
