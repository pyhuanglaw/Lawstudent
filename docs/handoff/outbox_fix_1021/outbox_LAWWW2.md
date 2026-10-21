# outbox_LAWWW2.json 要改的地方

- 來源：LAWWW-C 的子代理，2026-10-21，對 `origin/claude/focused-cray-c9uwvw ec61b946`。工具：`python3 tools/handoff/check_handoff.py incr`。
- 現在報 **194 項**；照下面改完，用同一支工具的 `outbox_problems()` 模擬＝**0 項**。
- 只改欄位，**舊的筆數不要刪**。state、task 原本括號裡的說明搬到新欄位 `note`（工具不讀 note，資訊不會丟）。

## 同類一起改（規則）
1. **state** 只能是 `WIP`／`已交付`／`已整合`／`已測試`／`已驗收`：改成 `已交付`（第 58 筆改 `已整合`），原文搬到 note。受影響：第 10～12、16～17、21～37、39～62 筆。
2. 補 **receiver**：第 11、29～62 筆（值見下表；沒寫的都是 `LAWWW`）。
3. 補 **noDirectIntegrate**（要是 true／false，不是字串）：第 11、29～62 筆寫 `false`（已交給 LAWWW、可以整合），第 11 筆例外見表。
4. **ack** 只能是 `未派`／`SENT`／`DELIVERED`／`ACK`／`ACTIONED`／`自領`：第 11、29～62 筆照表（LAWWW 在 deliveries.json 已記 ACK／ACTIONED 的照抄；「已傳 send_message」＝`SENT`、「已傳 send_message（DELIVERED）」＝`DELIVERED`、「ACKNOWLEDGED…」＝`ACK`、「LAWWW-C 回報已發布」＝`ACTIONED`）。
5. **task** 欄只放總表的任務 ID（說明搬到 note）：第 25～62 筆照表。
6. **sha**：空的、「（本 commit）」、或對錯 commit 的，第 11、16～18、53、55～57、59～62 筆照表換成真的 SHA。

## 逐筆
| 筆 | task → | sha → | ack → | 其他 | 備註 |
|---|---|---|---|---|---|
| 11 |  | e1b9133a | ACK | receiver＝"BB"；noDirectIntegrate＝true；next＝"第六版 05c57da1 已由 LAWWW-C 接（ART-PINYU-PROPS）；第七版（耳朵）照使用者 20:5x 停人物細修，沒交" |  |
| 16 |  | 1f488eb9 |  |  |  |
| 17 |  | 9b1889fe |  |  |  |
| 18 |  | 58d0ea90 |  |  |  |
| 25 | BUG-US-KITCHEN-1018 |  |  |  |  |
| 26 | ART-EXT-M1 |  |  |  |  |
| 27 | ART-EXT-GATE |  |  |  |  |
| 28 | ART-EXT-TEACH |  |  |  |  |
| 29 | ART-YU-3D-1018 |  | ACK |  |  |
| 30 | ART-EXT-TEACH |  | ACK |  |  |
| 31 | ART-SEATFIG-1018 |  | ACK |  |  |
| 32 | ART-GG-SHOPS-1018 |  | ACK |  |  |
| 33 | ART-LIB-VIEW-1018 |  | ACK |  |  |
| 34 | ART-EXT-MRT |  | ACK |  |  |
| 35 | SCN-US-02 |  | ACK |  |  |
| 36 | SCN-US-02 |  | ACK |  |  |
| 37 | ART-US-SEASON |  | ACK |  |  |
| 38 | BUG-COPLANAR-DEV |  | ACK |  |  |
| 39 | US-CAMPUS-WIRE-1018 |  | ACK |  |  |
| 40 | LANE118-SHOPS-1020 |  | ACTIONED |  |  |
| 41 | BUG-WZFLICKER-2 |  | ACTIONED |  |  |
| 42 | BUG-GYM-STAIRS-1020 |  | ACTIONED |  |  |
| 43 | LINZE-34F-TABLES-1020 |  | ACTIONED |  |  |
| 44 | GG-STREETVIEW-1020 |  | ACK |  |  |
| 45 | LINZE-WANCAI-FLOORS-1020 |  | SENT |  |  |
| 46 | LINZE-34F-TABLES-1020 |  | ACTIONED |  |  |
| 47 | LANE118-SHOPS-1020 |  | SENT |  |  |
| 48 | GG-STREETVIEW-1020 |  | ACTIONED |  |  |
| 49 | ART-L118-LANE-1020 |  | ACTIONED |  |  |
| 50 | GG-STREETVIEW-1020 |  | ACTIONED |  |  |
| 51 | ART-L118-LANE-1020 |  | ACK |  |  |
| 52 | ART-L118-LANE-1020 |  | ACK |  |  |
| 53 | FIX-WZ-PERF | 9aaa24a7 | SENT |  | 沒有專門的任務；最接近 FIX-WZ-PERF（溫州街效能）。LAWWW-C 要分開追的話開 PERF-WZ-NIGHT-1021，改成那個 |
| 54 | ART-ROOM-LIFE-1020 |  | ACK |  |  |
| 55 | SCN-V4-01 | 58f4ad1a | ACK |  |  |
| 56 | BACKLOG-SWEEP-LAWWW2-1021 | caf482d1 | SENT |  |  |
| 57 | GYM-GLOW-COPLANAR-1021 | 09324bda | ACTIONED |  |  |
| 58 | ART-02 |  | SENT |  |  |
| 59 | ART-SWEEP-A3A4-1021 | e85aff23 | ACK |  |  |
| 60 | ART-Y1-BOX-1021 | 36c07603 | ACK |  |  |
| 61 | ART-US2-FIX-1018 | 13707c1f | ACTIONED |  |  |
| 62 | JP-ROOM-3D-1021 | c8c810e1 | ACTIONED |  |  |

## 可選（工具沒報，但順手改比較好）
- 第 23 筆 task 現在是 ART-US2-FIX-1018（總表有這個 ID，工具不報）；LAWWW-C 登記時因為撞名改記 BUG-US-KITCHEN-1018（DL-LAWWW2-356d77c6），要一致的話改成 BUG-US-KITCHEN-1018。
- 第 40、41、58 筆的 sha 欄放了兩個 SHA：工具只讀前 7 碼，第二個 SHA 想算登記就另加一筆。

改完：commit＋push 自己的分支，請值班 LAWWW 跑一次 `incr` 確認。
