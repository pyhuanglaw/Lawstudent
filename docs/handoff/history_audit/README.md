# 歷史待辦全面複核（HISTORY-AUDIT-1031）

使用者 2026-10-31 19:5x 對 LAWWW-B 提出這次複核（原話見 `docs/handoff/user_asks_LAWWW.json` UA-LAWWW-1031-03，USER_WANTS X149）。

**目的**：確認過去各帳號累積的工作，哪些真的完成、驗收、進了正式版。查出沒完成的直接派工，不是只多一份表。

## 這份紀錄怎麼保持最新（不是一次性的表）

1. **證據檔**：四個職位各寫一份，各自寫在自己的分支，互不覆蓋。值班 LAWWW 合併進來。
   - `judgments_LAWWW.jsonl`
   - `judgments_AA.jsonl`
   - `judgments_BB.jsonl`
   - `judgments_LAWWW2.jsonl`
2. **重算報告**：`python3 tools/handoff/history_audit.py` 每次都從 GitHub 現況重算。
   - 讀的資料：10/21 稽核原始結果（`docs/handoff/audit_1021/`）、`tasks.json`、`deliveries.json`、`USER_WANTS.md`、`origin/main`，以及上面四份證據檔。
   - 產出 `ledger.json`（每一筆的判定與證據）和 `REPORT.md`（給人看的報告）。
   - 這兩個檔都是工具產生的，不要手改。
3. **新證據加一行**：同一個 id 可以有好幾行，以 `at` 最新的那一行為準，舊的留著當歷史。
4. **任務總表照舊**：`tasks.json` 仍然是唯一的永久任務總表。查出沒做的，接續既有任務；真的沒登記才新增。不另開重複任務。

## 七類完成狀態（使用者指定，不能混用）

| tier | 名稱 | 條件 |
|---|---|---|
| 1 | 正式版已完成且實際驗收 | `origin/main` 有，而且 BB 有實際流程驗收證據（瀏覽器操作紀錄、截圖、重現步驟）。只有 Node 單元測試不算。 |
| 2 | 已實作但尚未實際驗收 | 程式或資料有，單元測試可能通過，還不能確定玩家正常玩得到。 |
| 3 | 已驗收但尚未發布 | 開發分支功能完整、BB 已實際驗收，等發布。 |
| 4 | 部分完成 | 原本需求做了一部分。`missing` 欄必填，寫剩下哪些。 |
| 5 | 完全未開工 | 只有企劃、討論或待辦，沒有實作成果。 |
| 6 | 等待素材或使用者決定 | 寫清楚缺什麼。先查以前有沒有給過、決定過，不重複要。 |
| 7 | 經確認取消或被取代 | `basis` 寫使用者決定的出處，`covered` 寫新方案怎麼滿足原本需求。新方案滿足不了，就不算取消。 |

- **以下都不能直接算第 1 類**：「已交件」「已整合」「Node PASS」「找到程式碼」。
- **查不到證據時**：不等於已確認沒做，標 `evidence_gap`，安排補驗。
- **沒有驗收紀錄時**：不等於功能有問題，標 tier 2，排 BB 補驗。

## 證據檔一行的格式（JSONL，一行一個 JSON）

```json
{"id":"<原始 ID：任務 ID、交付 ID、USER_WANTS 列號、企劃 ID>",
 "src":"audit_B|audit_A|audit_C|audit_D|USER_WANTS|user_asks|plan|branch|new",
 "tier":1,
 "evidence":"GitHub 證據：檔案:行號、事件 ID、commit SHA、BB 紀錄檔:行號",
 "main":"yes|no|partial|unknown",
 "bb":"BB 實際操作紀錄出處；沒有寫 none",
 "missing":"還缺的部分（tier 4 必填）",
 "basis":"取消、取代的使用者依據（tier 7 必填）",
 "covered":"新方案怎麼滿足原需求（tier 7 必填）",
 "need":"缺的素材或要問使用者的事（tier 6 必填），以及以前有沒有給過、決定過",
 "task":"接續的任務 ID（沒有就寫 new: 加一句說明）",
 "owner":"LAWWW|AA|BB|LAWWW2|USER",
 "severity":"P0|P1|P2|P3",
 "next":"下一步",
 "by":"LAWWW-B",
 "at":"2026-10-31T20:0xZ",
 "evidence_gap":false}
```

## 分工（使用者第五節）

- **LAWWW**：統籌、交叉比對總表、查程式與整合狀態、找沒有負責人的工作、安排實作、驗收、發布。
- **AA**：查過去的劇情、角色、法律課堂、事件、對話企劃。特別是已定稿沒實作、只做了一部分、後來的版本忘了的。已定案的不重新發明劇情。
- **BB**：被標 done 但沒有實際玩過的，分批實際遊玩驗收：觸發條件、存檔、不同選擇、正常遊玩路徑。不只跑單元測試。**發布前回歸（QA-PLAYTHROUGH-1018）優先。**
- **LAWWW2**：查舊帳號的美術模型、沒整合的資產、場景缺漏、做好沒接進遊戲的素材、還沒驗收的美術修正。

## 各帳號的分支（查舊帳號的工作時用）

| 職位 | 帳號 A | 帳號 C | 帳號 B（現在） |
|---|---|---|---|
| LAWWW | `confident-ritchie-8rwh7t` | `adoring-meitner-mqzst8` | `modest-rubin-2lyp7g` |
| LAWWW2 | `second-ai-env-art`（另有 `-wip-*` 八條） | `focused-cray-c9uwvw` | `funny-albattani-iawshm` |
| AA | `story-planning` | `magical-albattani-bk7b4n` | `cool-heisenberg-o8kuqx` |
| BB | `story-planning` | `wonderful-mayer-7fm9g6` | `elegant-brown-fcos7n` |

表裡分支名都省略了前綴 `claude/`。另有 `friendly-brahmagupta-6bbkzc`（最早的開發分支）、`release-v9.8*`、`release-v9.9*`、`postrel-1030`。
