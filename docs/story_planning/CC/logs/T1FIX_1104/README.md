# T1_FIX（BB-C 17:4x 派工；LAWWW-C c14d50710 修三個時間 bug）

- 修改前 `ec060dcee`、修改後 `c14d50710`（c14d 是 ec06 的下一個 commit，只改 story3d.js 這三處＋測試）。
- 工具：`docs/story_planning/test_tools/cc/random_play_sim.js`（T1，Node 跑真的 game3d.js）。
- 這次加的東西：
  - `--old-forcing`、`--stay-up` 兩個情境；
  - 環境變數 `RPS_TRACK_OPENING=1`：開局的宿營也檢查「時間只往前」。

## 當初的種子（868e94d1b 版的工具）
- 在 7f7fd7964 上照樣重現：
  - 種子 9：Café 退 5.43 小時；
  - 種子 3：NO_FORCEHOME，flags._forcing=true。
- 在 ec060dcee 上走不到同一個地方：
  - 7f7f→ec06 之間遊戲改了很多，同一個種子走出來的是另一串操作；
  - 經濟系那一年的宿營在 ec06 改成開局的旁白，不經過 S.campY1。
- 所以 ec06 跟 c14d 都是 PASS。檔案：`orig868e_*`、`7f7f_law_s3`、`7f7f_law_s9`。
- 改成在 ec06 上重新找會重現的種子，結果如下表。

## 修改前 FAIL → 修改後 PASS

| bug | 怎麼重現 | ec060dcee | c14d50710 |
|---|---|---|---|
| ② cafeScene | `--seed 37 --from 2025-08-29 --to 2025-09-06` | FAIL TIME_BACK：9/4 20:34 → 17:42（2.86 h，cafeScene） | PASS |
| ② libraryScene | `--seed 36 --from 2025-08-29 --to 2025-09-06` | FAIL TIME_BACK：9/4 19:10 → 17:42（1.47 h，libraryScene） | PASS |
| ③ 宿營換日（法律系 S.campY1） | `RPS_TRACK_OPENING=1 --seed 1 --from 2025-08-20 --to 2025-08-26`（種子 2 一樣） | FAIL TIME_BACK：8/23 19:30 → 17:30（2.00 h） | PASS |
| ① 原因（送回去睡的那一下存進 _forcing） | `--seed 1 --stay-up 2025-09-10 --to 2025-09-12` | FAIL：9/11 26:45 送回去睡；醒來的自動存檔 `_forcing:true` | PASS：存檔裡沒有 _forcing |
| ① 舊存檔（BB-C 加的情境） | `--seed 1 --old-forcing 2025-09-10 --to 2025-09-12` | FAIL：forceHome 叫了 58 次、0 次送回去睡，到 30:00（06:00）；_forcing 一直是 true | PASS：26:48 送回去睡、9/12 07:30 起床；_forcing 刪掉 |

- 舊存檔情境的做法：
  1. 9/11 21:38 把自動存檔的旗標放進 `_forcing:true`；
  2. 重新整理頁面，按「繼續」；
  3. 那一晚玩家不睡（不按床，選單選「再撐一下」）。
- 找種子：
  - ec06 法律系種子 1～60（到 9/06）：只有 36、37 FAIL（就是上面兩項），其他 58 個 PASS。
  - 找 FORCING 自然路徑的種子 1～6（8/20～9/20）全部 PASS；為了不跟 P1 的瀏覽器測試搶 CPU，先停（STOP）。
