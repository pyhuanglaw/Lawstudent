# 研究小間玻璃後面的讀者（LAWWW 11-03 12:08 的小派工，P3；CARREL-FREE-1103 以後）——LAWWW2 2026-11-03

狀態：`READY_FOR_REVIEW`。patch 接開發分支 `b049c84e3`，用 `git apply --check` 檢查過。

## 起因
研究小間改成免預約以後，08 在開館時間一直開著，其他九間玻璃後面都是空的，整排看起來很怪。

## 改法：`carrel_readers_1103.patch`
- `src/library_upper3d.js`
  - `LUP.carrelWant(G)`：開館時段（08:00～22:00）決定 01～10 哪幾間有人。08（玩家的）、03（學姊的，她的劇情 lupstory3d.js 自己放）不算在內。照日子和時段（上午、下午、晚上）各算一次，大約六成有人。
  - `LUP.populateCarrels(GM, entering)`：讀者坐在那一間的椅子（`carrels[].seat`），pose 是 `read`，frozen；從門上的小窗看得到。待著不會重複放；時段換了沒輪到、或閉館，就藏起來（門是關的，所以不讓他們走出來）。
- `src/story3d.js`：兩行，緊接在書庫 `LUP.populate` 那兩行後面，進來、待著各叫一次。
- `tests/library_upper_unit.js`：新增第 8 項，共 4 個 check：
  - 只坐那八間；
  - 30 天 × 三個時段，平均每個時段 5.2 間有人；
  - 閉館沒有人；
  - populateCarrels 放好、不重複、閉館藏起來；story3d 有叫。
- 開發分支 b049c84e3 上 ALL PASS。同樣跑過、都通過：`lupstory_unit`、`door_open_unit`、`library_media_unit`、`aa595_rules_unit`、`phone_unify_unit`、`say_cover_unit`、`sis_y3_sched_unit`。

## 沒做
- 瀏覽器裡從門上小窗看的截圖還沒拍。
- 讀者的外觀用 `STORY.extraSpec(880+…)`，就是路人池。
