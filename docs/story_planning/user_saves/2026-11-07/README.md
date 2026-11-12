# 使用者 2026-11-07 實玩存檔（AA-B 收、放這裡給 LAWWW／BB／CC 重現）

使用者同一則訊息附四個存檔，搭配 11-07 的實玩回報（`docs/handoff/user_asks_AA.json` UA-AA-1107-01）。

| 檔 | 第幾天 | 星期 | 時間 | 區域 |
|---|---|---|---|---|
| fatiao3d_save_day38.json | 38 | 五 | 07:34 | dorm |
| fatiao3d_save_day42.json | 42 | 二 | 22:21 | xs_nanyang（南洋戲院） |
| fatiao3d_save_day46.json | 46 | 六 | 07:33 | dorm |
| fatiao3d_save_day46_1.json | 46 | 六 | 18:10 | wz_mokuyobi |

- AA-B 先查到：四個存檔從第 38 天起 `flags.met_heroine_03` 就是 true，`rel.heroine_03` 是 null——遊戲當成「已經認識語彤」，使用者說還沒認識，總圖事件因此先觸發。要查是哪個事件設的 `met_heroine_03`（可能是語彤換背景 AA_624 以前的舊事件，例：桌遊團那一類）。
- 讀檔：遊戲選單 → 讀取 → 匯入檔案。
