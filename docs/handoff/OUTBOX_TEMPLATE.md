# 交付當下登記（outbox）格式（D94／HV-12，使用者 2026-10-17）

每個職位在**自己的分支**維護 `docs/handoff/outbox_<職位>.json`（LAWWW2、AA、BB；LAWWW 直接寫中央檔）。
**交出成果或留下 WIP 的那個 commit，同時在 outbox 加一筆**（不要等交班）。值班 LAWWW 跑 `python3 tools/handoff/check_handoff.py incr` 讀各分支的 outbox，同步進 `deliveries.json`、`wip.json`。

```json
{
 "role": "BB",
 "entries": [
  {
   "task": "AB-65",
   "branch": "claude/wonderful-mayer-7fm9g6",
   "sha": "9204411f",
   "files": ["docs/story_planning/BB_181_AA211口氣審_大二上BB人物.md"],
   "state": "已交付",
   "remaining": "",
   "next": "AA 裁定九項後寫進 AA_211",
   "noDirectIntegrate": true,
   "receiver": "AA",
   "ack": "SENT"
  }
 ]
}
```

| 欄位 | 必填 | 說明 |
|---|---|---|
| `task` | ✓ | `tasks.json` 的任務 ID（或它的 `aliases`）；總表沒有的先請 LAWWW 建任務 |
| `branch` | ✓ | 成果所在的分支 |
| `sha` | ✓ | commit SHA（至少 8 碼）。commit 自己的 SHA 要等 commit 完才知道：先 commit 成果，再用下一個 commit 補登這一筆（兩個 commit 都算已分類） |
| `files` | ✓ | 具體檔案路徑（陣列；資料夾以 `/` 結尾） |
| `state` | ✓ | 只能是 `WIP`／`已交付`／`已整合`／`已測試`／`已驗收`（也接受 DELIVERED／INTEGRATED／TESTED／ACCEPTED） |
| `remaining` | WIP 必填 | 還沒完成的工作 |
| `next` | ✓ | 下一步（誰、做什麼） |
| `noDirectIntegrate` | ✓ | `true`＝禁止直接整合（WIP、待審、未批准）；`false`＝可以整合 |
| `receiver` | ✓ | 接收者（LAWWW／LAWWW2／AA／BB／USER） |
| `ack` | ✓ | `未派`／`SENT`／`DELIVERED`／`ACK`／`ACTIONED`／`自領` |

- 只登記自己有權限修改的紀錄；舊的筆數不要刪（狀態改了就加一筆新的，或改那一筆的 state／ack）。
- 一般進度紀錄、接班登記不用進 outbox：值班 LAWWW 在 `deliveries.json` 的 `ignored` 用 `kind` 分類（`not_delivery`／`covered`／`wip`／`handoff_record`）。
- 劇情要匯進遊戲（閒聊階梯等）：交付寫明「已審版本＋commit＋檔案路徑」，LAWWW 才會改 `story_import_allow.json`（D94 第 5 點）。
