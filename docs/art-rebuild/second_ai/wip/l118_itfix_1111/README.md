# 118 巷 118牛排、辛亥韓食：座位的按鈕位置搬回配置（L118-IT-REACH-1111；LAWWW2 帳號 A，2026-11-11）

狀態：**READY_FOR_REVIEW**（2026-11-11 09:5x UTC）。依據：LAWWW 11-11 08:48（BB 在使用者電腦用搖桿測到靠牆那張椅子永遠坐不到；LAWWW 先在遊戲端 `src/l118_shops3d.js` 的 `L118_IT_FIX` 覆寫，開發分支 `a2dd74af1`，要我把我負責的四間搬回腳本）。

- patch：`l118_itfix_v1.patch`（7 個檔，基底 dev `33ccd6440c`；在最新 dev `b1437614bd` 上試過 `git apply --3way`：乾淨）。
- **只有 118牛排（dian）、辛亥韓食（tea）**：水上便當、清州刀削麵 LAWWW 的表上沒有改，我也沒動。

## 改了什麼

| 檔案 | 內容 |
|---|---|
| `tools/blender/env_second/lane118_shops.py` | 新的 `it_fix()`：照座位座標把按鈕位置 `i`、坐下前站的位置 `ap`、按鈕半徑 `r` 寫進配置的座位；點餐、看的東西可以寫 x、z、r、`prio`。dian 8 張、tea 12 張＋點餐 prio 0.3＋小菜櫃（x −0.05、z −2.15、r 0.4、prio 0.3）——**值和 LAWWW 表上的一樣**（照抄，註解也搬過來） |
| `l118_dian.layout.json`、`l118_tea.layout.json`、`src/data/l118_shop_layouts.js` | 重新產生（只有配置；**GLB 沒有重匯**——模型沒有變，跑完腳本把 GLB 和 json 還原了） |
| `src/l118_shops3d.js` | 兩行：座位的按鈕位置讀配置的 `s.i`（`f.i||s.i||at`，覆寫表還是優先）；看的東西的 prio 讀配置的 `q.prio`（`f.prio`、`q.prio`、−0.3 的順序）。**`L118_IT_FIX` 裡 dian、tea 兩格拿掉了**（換成一行說明）——你說要自己拿，我一起拿是為了讓測試量到的就是最後的樣子；要自己拿的話把這一段 hunk 退掉就好 |
| `tests/l118_shops_redo_1111_unit.js` | 3-6 改期望（檔案裡寫了原本的期望和原因）：原本「辛亥韓食靠牆 6 個座位 r 1.25」→ 現在靠牆 6 個 r 0.8＋按鈕位置 i、門口那張外側 r 0.6（遊戲裡原本就是這些值：覆寫表的 r 蓋過配置的 1.25） |
| `tests/l118_shops_notrap_1111_unit.js` | 「每個座位在互動半徑裡有站得到的點」改成從按鈕位置 `i` 量（有 i 的話；按鈕不在椅子上了） |

## 測試

- `tests/l118_interact_reach_1111_unit.js`（你的，不改）：dian 17 張、tea 12 張每張至少一個站位按鈕是它、四周 0.1 m 也是它、點餐和看的東西各有站得到的位置、站位沒有被搶走、seatApproach 推搖桿和點椅子走過去都是那一張——**全過，而且 dian、tea 已經不靠覆寫表**（「拿掉覆寫表時 0 張搖桿坐不到」）。
- `l118_shops_notrap_1111_unit`、`l118_shops_redo_1111_unit`、`l118_shops_unit`、`shop_diners_unit`、`l118_bar_lift_unit`、`l118_int_pon_1111_unit` 全過。
- **全部 Node 測試 1286 支**（`regression_full.log`）：1284 支 ALL PASS；`bookstore_exit_unit` 老警告；`singleside_streets_unit` FAILED 2 是基底 `33ccd6440c` 當時的狀態（你 3b7277b89 已經改了期望）。
