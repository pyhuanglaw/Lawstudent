# L118-IT-REACH-1111 收尾：118 巷店內按鈕的值搬回配置（LAWWW2-C 2026-11-12）

LAWWW 11-12 12:00Z 派（P3）：`src/l118_shops3d.js` 的 `L118_IT_FIX`（線上 v9.10.25 用的那一份，BB 在使用者電腦驗過）搬回配置，遊戲程式不再靠覆寫表。

- patch：`l118_it_reach_v2.patch`
- 新檔 `tools/lane118/it_fix.py`：整張表（六間、56 張椅子＋辛亥韓食小菜櫃／點餐 prio、五湖四海點餐和大鍋）和各店為什麼這樣排的說明。`apply(sid, lay)` 寫進配置；單獨跑＝直接改 `l118_<id>.layout.json`（不用重出模型），`--check` 只查對不對得到。
- `lane118_shops.py`：匯出配置以前呼叫 `it_fix.apply()`——以後重出模型，值會自己帶上。
- 六個 `l118_*.layout.json`、`src/data/l118_shop_layouts.js`（`gen_shop_layouts.py` 重產）：座位多 `i`（按鈕位置）、`ap`、`r`；`order`、`interact[]` 帶 `prio` 和新位置。**GLB 沒動。**
- `src/l118_shops3d.js`：`L118_IT_FIX` 清空（表和機制留著，以後臨時要挪先寫這裡）；讀配置的 `s.i`、看的東西的 `q.prio`。
- 測試 `tests/l118_interact_reach_1111_unit.js`：ALL PASS；統計那一行「拿掉覆寫表時 0 件」（原本 60 幾件）＝不靠覆寫表全過。加 0b（配置自己帶 56 張的按鈕位置、表是空的、`it_fix.py --check` 過）。
- 沒做：沒有在瀏覽器重驗（數值和線上版一樣，只是換地方放）；`IT_DEF.seatR` 0.8 仍在遊戲程式（是預設值，不是覆寫）。
- 跟著改的三支舊測試（`l118_int_home_cafe2_1111_unit.js`、`l118_int_pon_1111_unit.js`、`l118_shops_notrap_1111_unit.js`）：原本假設按鈕在椅子上、從椅子量半徑；配置寫了 `i` 以後改成從按鈕量。四支都 ALL PASS；用到 118 巷配置的其他 Node 測試沒有新的紅。
- **v2（11-12 12:3x）**：LAWWW 退 v1——`tests/l118_shops_redo_1111_unit.js` 3-6 還在期望「辛亥韓食靠牆 6 張 r 1.25、五湖四海 4 張 r 1.6、其他店沒有 r」。改成：寫了 r 的都在 0.6～0.95、而且帶 `i` 或 `ap`；辛亥韓食、五湖四海是 0.8／0.6（舊期望寫在測試的註解裡）。`tests/l118*.js`、`tests/lane118*.js` 全部掃過沒有紅。v1 的 patch 拿掉了。
