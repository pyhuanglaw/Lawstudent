# outbox_AA.json 要改的地方

- 來源：LAWWW-C 的子代理，2026-10-21，對 `origin/claude/magical-albattani-bk7b4n d07eb988`。工具：`python3 tools/handoff/check_handoff.py incr`。
- 現在報 **60 項**；照下面改完，用同一支工具的 `outbox_problems()` 模擬＝**0 項**（LAWWW-C 10-21 13:5x：要用的任務都在總表了——AFFAIR-P0-1017 不另開、改用 EVPKG-AA227-228-KNOW；STORY-AUDIT-1017 已開）。
- 只改欄位，**舊的筆數不要刪**。state、task 原本括號裡的說明搬到新欄位 `note`（工具不讀 note，資訊不會丟）。

## 同類一起改（規則）
1. **state** 只能是 `WIP`／`已交付`／`已整合`／`已測試`／`已驗收`：改成 `已交付`，原文搬到 note。受影響：第 16、18～28 筆。
2. **ack** 只能是 `未派`／`SENT`／`DELIVERED`／`ACK`／`ACTIONED`／`自領`：第 30～50 筆照表（LAWWW 在 deliveries.json 已記 ACK／ACTIONED 的照抄；「已傳 send_message」＝`SENT`、「已傳 send_message（DELIVERED）」＝`DELIVERED`、「ACKNOWLEDGED…」＝`ACK`、「LAWWW-C 回報已發布」＝`ACTIONED`）。
3. **task** 欄只放總表的任務 ID（說明搬到 note）：第 22、24～28、30～50 筆照表。
4. **sha**：空的、「（本 commit）」、或對錯 commit 的，第 33、37、45～46 筆照表換成真的 SHA。

## 逐筆
| 筆 | task → | sha → | ack → | 其他 | 備註 |
|---|---|---|---|---|---|
| 22 | DATE-S6 |  |  |  |  |
| 24 | SIS-W1-1017 |  |  |  | W1 開頭那一半是 SIS-W1-1017；語彤雙主修時間線那一半總表沒有專門任務 |
| 25 | V3-D4 |  |  |  | V3-D4（語彤 7 法服第一次值班）是事件 7 的實作任務；它的 next 寫的還是在場版＋麵店轉述，事件 7 刪掉這件 LAWWW 要確認有沒有做 |
| 26 | LIFE-LINE-1017 |  |  |  |  |
| 27 | EVPKG-AA227-228-KNOW（LAWWW-C 10-21：不另開 AFFAIR-P0-1017，用這個） |  |  |  |  |
| 28 | AB-65 |  |  |  | 不確定：總表沒有 AA_225 專門的任務，最接近 AB-65（BB 人物逐學期改稿，D100 起由 AA 寫） |
| 30 | ROM-1017 |  | SENT |  |  |
| 31 | AA238-1017 |  | ACK |  | 不確定：AA_236 外部審稿回覆沒有專門任務，最接近 AA238-1017（AA_236 決定的後續台詞） |
| 32 | AA238-1017 |  | SENT |  |  |
| 33 | VAC-C08-12 | 4ff1220c | SENT |  |  |
| 34 | AA241-SUMMER |  | SENT |  |  |
| 35 | VAC-C08-12 |  | SENT |  |  |
| 36 | VAC-C08-12 |  | SENT |  |  |
| 37 | AA243-16W | 91a39ebf | SENT |  |  |
| 38 | AA245-PSBH |  | SENT |  |  |
| 39 | LIFE-G7-1017 |  | SENT |  |  |
| 40 | AA249-TERMEND |  | SENT |  |  |
| 41 | AA252-COURT |  | SENT |  |  |
| 42 | HOL-VA |  | SENT |  |  |
| 43 | MSG-KX-Y0-1018 |  | ACK |  |  |
| 44 | QA-TRANSCRIPT-1018 |  | DELIVERED |  |  |
| 45 | AA303-KX-RECONFIRM-1018 | 8aa33db0 | ACK |  |  |
| 46 | AA304-QA2-1018 | 8fcc2c7e | ACK |  |  |
| 47 | AA305-OTHERS-1018 |  | DELIVERED |  |  |
| 48 | AA306-KX-LADDER-1018 |  | DELIVERED |  |  |
| 49 | AA304-QA2-1018 |  | ACK |  |  |
| 50 | AA304-QA2-1018 |  | ACTIONED |  |  |

## 可選（工具沒報，但順手改比較好）
- outbox_AA.json 裡另外有一個 `items` 陣列（17 筆：AA254、AA257、AA253、AA256、AA259、AA260、AA262、AA263、AA264、AA265、AA266、AA267、AA268、AA269、AA270、AA271、AA162）：工具只讀 `entries`，這 17 筆不算登記；要算的話照模板欄位搬進 `entries`。
- 第 45、46 筆原本的 sha 互相錯開：8fcc2c7e 是 AA_304 的 commit、AA_303 是 8aa33db0（DL-AA-8aa33db0）；bbc81074 是交接紀錄 commit。第 33 筆 9b721b36 是 AA_250 第 9 節，AA_199 第 7 節是 41f7820d／d73e391c／4ff1220c（取最後一段 4ff1220c，VAC-C08-12 引用的就是它）。第 37 筆 2af03a63 是 AA_245，AA_243 是 91a39ebf。
- 第 47 筆 683a3684 是 AA_306 第十一批（順便改 AA_305 一句）；AA_305 主要的交付是 1ab0a39f（DL-AA-1ab0a39f），要的話也可以改。

改完：commit＋push 自己的分支，請值班 LAWWW 跑一次 `incr` 確認。
