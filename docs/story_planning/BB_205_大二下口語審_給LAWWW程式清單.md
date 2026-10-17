# BB_205　大二下口語審（AA_255 附錄 B）：給 LAWWW 的程式清單

> 2026-10-17 BB-C。企劃已改，見本次 commit：`BB_97`、`BB_194` §19／§20、`ladder_bb_y2s1.json`、`ladder_bb_y2s2.json`、三份角色企劃等。行號照開發分支 `0ca84d9c`。

## 1. 閒聊階梯
- 用 `tools/ladder/import_ladder.py` 重新匯入 `ladder_bb_y2s2.json`、`ladder_bb_y2s1.json`，不要手改 `ladder.js`。
- 確認三件：
  - `skipAfterWeek` 有沒有實作：Q4-L4 會用到。
  - `greet.when` 的 `if` 和 `weather` 陣列：`ladCtxOk` 應該已經讀得到，確認一下。
  - 新記憶 `KX_BDAY2_CAKE`：可昕大二生日事件的教室版要記這個。

## 2. P4 交接搬到 2026-12-17（大二上第 15 週週四）
- `events.js:2835` `ev_peishan_handover`：
  - `term:['Y2S2'],weeks:[1]` 改成 `term:['Y2S1'],weeks:[15]`，weekday 4。
  - `:2837` 改成「下學期起，我就不在這裡了。」
- `story3d.js:1846-1847` `ps_p4_missed`：改成 `termDay('Y2S1',15,4)`。
- `classes3d.js:273`：大二上第 15 週要有公法讀書會。
- `activities.js`：當初為了 P4 在大二下加的第 1 週，可以拿掉。
- `needed_msgs.js:63` `ps_notes`：改在 12/17 22:00 發。

## 3. 沛珊消失期：12/17 P4 之後到 2027-08-06 放榜
- `characters.js:68` presence：12/18 起「聯絡不到」，包括寒假、大二暑假考前。要用日期判斷，只看學期不夠。
- 以下在消失期都不發生：
  - P4b 和「陪重考生念書」小組：`story3d.js:1850-1863`；
  - `y2_ps_42`：`story3d.js:2315`；
  - `ev_peishan_cafe_42`：`events.js:2850-2852`；
  - `ps_kids`：`needed_msgs.js:64`，直接刪；
  - `invites.js:153` 的 `afterMeet`；
  - `invites.js:158-172` 的婉拒句，一律改成「沒有回覆」；
  - 大二上的期末飯邀約；
  - 2027 年的節日、過年訊息。

## 4. 學姊
- `needed_msgs.js:58` `sis_list` 改成三則：
  - 學姊：「法圖那本行政救濟的書被借走了。你們系上有人有嗎？」
  - 祐廷：「我問問看。」
  - 學姊：「好。不急。」
- `needed_msgs.js:59` `sis_report`：刪掉。
- MISS（`:85`）：改成一則配一句，`sis_list` 那句是「那本書我借到了。」
- `story3d.js:2313` `y2_sis_hotwater`：改成 Kevin 起頭。
  - Kevin：「📷（學姊桌上的保溫瓶）」
  - Kevin：「學姊今天裝熱水欸」
  - 學姊：「偶爾。」
- `story3d.js:2314` `y2_sis_m2read`：大二拿掉。
- M2（`:1838-1843`）、M3（`:1925-1930`）、上榜聚餐（`:1934-1936`、`events.js:2827`）：大二不播，搬到祐廷大一下（AA_218 17-12）。
- W3b（`story3d.js:1997`）：拿掉 `'Y2S2'`。
- SMALLTALK：
  - `events.js:3246`「法服週三晚上…」：只留 `term:['Y1S1']`，或刪掉。
  - 「判決要看事實…」：加 `term:['Y1S1','Y1S2']`。

## 5. 子晴
- `needed_msgs.js:52` `zq_dad`：
  - term 改成 `Y2S2`，w[11,12]；
  - 第一則「欸不是」改成「欸跟你說」；
  - 看過 Q6（`PLAYTESTED`）照原句；沒看過的，第三則改成「他說要來看我」。
- `:53` `zq_name`：cond 加 `PLAYTESTED`。
- MISS（`:84`）：改成一則配一句：
  - `zq_name`：「遊戲名字我自己取了。先不說。」
  - `zq_song`：「第四句歌詞，我自己寫完了。」
  - `zq_dad`：「我爸要來那則，你沒回。」／「……算了，沒差。」
- SMALLTALK `events.js:3244`：
  - 「欸不是，你手指好了沒？」加 `term:['Y1S2']`；
  - 「你室友要看好他」換成大二版。
- Q8 前置要 `PLAYTESTED`。沒看過的玩家走 `BB_194` §20 那則訊息，台詞在 AA_255 第 7 節。

## 6. 明軒、阿凱
- `needed_msgs.js:68` `mx_seat`：週次改 [3,3]；沒有 `SAW_HIM_STUDY` 的玩家用 `BB_97` 11-1 的另一版。
- `:69` `mx_form`：照 `BB_97` 11-1。
- `:73` `kai_kb`：照 `KAI_KEYBOARD` 分兩版。
- MISS（`:85-86`）：
  - 明軒：「說明會的位子我自己去佔了，第二排。」／「志願表我又改了一次。」
  - 阿凱：「Enter 我自己修好了，要按很大力。」

## 7. 可昕
- `needed_msgs.js:81` `kx_cv`：改成期中報告的摘要，照 `BB_97` 11-1。
- `story3d.js:2322` `y2_kx_landlord`、`:2324` `y2_kx_funny`：照 `BB_97` 9-16。
- `invites.js:177-178`：照 `BB_158` §5。

## 8. 機制
- MISS 要能一則訊息配一句：`BB_97` 11-2。
