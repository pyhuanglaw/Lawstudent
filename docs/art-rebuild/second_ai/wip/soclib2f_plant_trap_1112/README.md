# SOCLIB2F-PLANT-TRAP-1112（P0；BB_255 d4c13dcc60、CC SOFA_SOCLIB2F）

- 現象：社科院圖書館東側館（區域 soclib_2f）一樓，人走到木格柵牆和沙發之間被夾住，搖桿、點地都動不了。
- 原因：格柵牆（x −3.9）和兩張沙發西端（x −3.2）之間只有 0.7 m；照玩家半徑算剩一條 0.1 m 寬、4 m 長的縫（x −3.4、z −3.3～0.5），盆栽（−3.4,−5.6）旁另有一格小口袋。BB 記到的 (−3.48,−3.01)、(−3.79,−5.07) 就是這兩處（第 0 層）。「看置物櫃」(−2.7,−1.5) 在第 1 層（二樓），探針在一樓朝它走才走進縫裡。
- 改法：`src/soclib2f3d.js` 第 0 層導航把那條縫和口袋擋掉（兩個 blockRect）。沙發照舊從東側坐（seat.ap）。不動模型。
- 測試（Node，模擬）：新 `tests/soclib2f_plant_trap_1112_unit.js` ALL PASS（修改前 1、2 FAIL；第 2 項掃一樓全部 0.1 m 格子，沒有只有一格寬的地方）；`nav_notch_traps_1112`、`soclib2f_unit`、`nav_soclib_unit`、`soclib_hours_unit`、`place_gate` ALL PASS。
- 沒做：瀏覽器（請 CC 用卡住偵測的 route 探針重走）；P2「沙發起身被放到 10.5 m 外」還沒查。
- 先將就的：格柵牆和沙發之間看起來還是有一條 0.7 m 的空隙，只是走不進去；要好看得把沙發往東移（模型也要改）。
