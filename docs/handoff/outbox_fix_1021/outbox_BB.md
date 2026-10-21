# outbox_BB.json 要改的地方

- 來源：LAWWW-C 的子代理，2026-10-21，對 `origin/claude/wonderful-mayer-7fm9g6 fcdc576d`。工具：`python3 tools/handoff/check_handoff.py incr`。
- 現在報 **39 項**；照下面改完，用同一支工具的 `outbox_problems()` 模擬＝**0 項**（LAWWW-C 10-21 13:5x：要用的任務都在總表了——AFFAIR-P0-1017 不另開、改用 EVPKG-AA227-228-KNOW；STORY-AUDIT-1017 已開）。
- 只改欄位，**舊的筆數不要刪**。state、task 原本括號裡的說明搬到新欄位 `note`（工具不讀 note，資訊不會丟）。

## 同類一起改（規則）
1. **state** 只能是 `WIP`／`已交付`／`已整合`／`已測試`／`已驗收`：改成 `已交付`，原文搬到 note。受影響：第 35～36、40、42～43 筆。
2. **ack** 只能是 `未派`／`SENT`／`DELIVERED`／`ACK`／`ACTIONED`／`自領`：第 30、33、38 筆照表（LAWWW 在 deliveries.json 已記 ACK／ACTIONED 的照抄；「已傳 send_message」＝`SENT`、「已傳 send_message（DELIVERED）」＝`DELIVERED`、「ACKNOWLEDGED…」＝`ACK`、「LAWWW-C 回報已發布」＝`ACTIONED`）。
3. **task** 欄只放總表的任務 ID（說明搬到 note）：第 13～43 筆照表。
4. **sha**：空的、「（本 commit）」、或對錯 commit 的，第 14～23 筆照表換成真的 SHA。

## 逐筆
| 筆 | task → | sha → | ack → | 其他 | 備註 |
|---|---|---|---|---|---|
| 13 | ROM-1017 |  |  |  |  |
| 14 | ROM-1017 | 0a11a9d5 |  |  |  |
| 15 | ROM-1017 | 47ea6395 |  |  |  |
| 16 | LIFE-LINE-1017 | 4b1c49ca |  |  |  |
| 17 | LIFE-LINE-1017 | 1408a6f0 |  |  |  |
| 18 | LIFE-LINE-1017 | d615a1a6 |  |  |  |
| 19 | LIFE-LINE-1017 | 847ea3a4 |  |  |  |
| 20 | LIFE-LINE-1017 | 8105d618 |  |  |  |
| 21 | LIFE-HS-1017 | 9119467b |  |  |  |
| 22 | ROM-1017 | e6db8302 |  |  |  |
| 23 | DATE-S6 | 8b7edfdf |  |  |  |
| 24 | DATE-S6 |  |  |  | 也可以拆四筆：DATE-L04（74373b86）、DATE-L06（0542a02b）、DATE-L12（84efdcc5）、DATE-L13（e4f84942） |
| 25 | KNOWS-SPREAD-1017 |  |  |  | 不確定：使用者原文存檔不是成果；最接近 KNOWS-SPREAD-1017（自然抓包＝朋友聊天傳開，BB_191） |
| 26 | FAFU-1017 |  |  |  |  |
| 27 | FAFU-1017 |  |  |  |  |
| 28 | ART-CH-XUN |  |  |  |  |
| 29 | FAFU-1017 |  |  |  |  |
| 30 | FAFU-1017 |  | ACK |  |  |
| 31 | ART-CH-PINYU |  |  |  |  |
| 32 | KNOWS-SPREAD-1017 |  |  |  |  |
| 33 | KNOWS-SPREAD-1017 |  | ACK |  |  |
| 34 | ROM-1017 |  |  |  |  |
| 35 | EVPKG-AA227-228-KNOW（LAWWW-C 10-21：不另開 AFFAIR-P0-1017，用這個） |  |  |  |  |
| 36 | EVPKG-AA227-228-KNOW（LAWWW-C 10-21：不另開 AFFAIR-P0-1017，用這個） |  |  |  |  |
| 37 | STORY-AUDIT-1017（LAWWW-C 10-21 已開） |  |  |  |  |
| 38 | EVPKG-AA227-228-KNOW（LAWWW-C 10-21：不另開 AFFAIR-P0-1017，用這個） |  | ACK |  | §24（YT 旗標）那一部分已有 BB194-YTFLAGS |
| 39 | SYS-15 |  |  |  |  |
| 40 | AA243-P02 |  |  |  |  |
| 41 | SYS-15 |  |  |  |  |
| 42 | SYS-15 |  |  |  |  |
| 43 | SYS-15 |  |  |  |  |

## 可選（工具沒報，但順手改比較好）
- 第 14～23 筆的「(本 commit)」工具不會報（欄位不是空的），但 SHA 對不到 commit：表裡的 SHA 是用 git log -S 找到「加這一筆的那個 commit」。
- 第 24、27、34、35、36、38 筆的 sha 欄放了多個 SHA：工具只讀前 7 碼；第 24 筆可以拆四筆（DATE-L04 74373b86、DATE-L06 0542a02b、DATE-L12 84efdcc5、DATE-L13 e4f84942），其他的想讓每個 SHA 都算登記就各加一筆。

改完：commit＋push 自己的分支，請值班 LAWWW 跑一次 `incr` 確認。
