# CC 稽核：開發分支 4174ffe89 以後的 src 改動（2026-11-02）

- 範圍：`git log 4174ffe89^..origin/claude/confident-ritchie-8rwh7t -- src` 共三個 commit
  - `84ca312d` D118 大四下被當改排 6/26 補考（`src/faildelay3d.js`、`src/classes3d.js`、`src/study3d.js`）
  - `4174ffe8` 合併 84ca312d（內容相同）
  - `0c3d9e7a` BUG-MAKEUP-HOME-1102：在家的選單列「出發：補考」（`src/faildelay3d.js`）
- 方法：只用 Node（`tests/pg_harness.js` 載入方式，同 `tests/y4s2_makeup_unit.js`），沒開瀏覽器、沒跑 tests/*.py、沒改遊戲程式。工作樹 head `0c3d9e7a5`（＝目前分支最新）。
- 既有測試 `node tests/y4s2_makeup_unit.js`：ALL PASS（a～i）。下面的疑點都是這份測試沒涵蓋的。
- 重現腳本：`docs/story_planning/test_tools/cc/audit_makeup_timeskip.js`
  用法：`WT=<工作樹根目錄> node docs/story_planning/test_tools/cc/audit_makeup_timeskip.js`（FAIL＝疑點成立；最後印 `FAILED 4`）
- **判定一律歸 BB**；以下「CC 初判」只是建議。

## 共通原因

補考的窗口只有 6/26 09:30～11:00（`fd_makeup` 的 `until`＝11:00，1.5 小時），超過就由 `PG.pending` 的 `onMiss` 當場記「缺考」→ `FD.applyDelay`（延畢、`BAR_REG=false`）。
這個停點只登記在 `PG.STEPS`（畢業後篇的「跳到下一件事」、`PG.tick` 站著不動），**沒有登記到一般「會跳時間」的動作看的那幾份清單**：
`CLS.studyLengths`／`CLS.spanCheck`／`CLS.nextFixed`（座位讀書）、`CLS.STOP_FNS`（`CLS.skipTo`：待到中午、小睡）、`HOME.wouldMiss`（在家休息的 R1 預告）。
只有一鍵總複習接了（`STUDY.REVIEW_CHECKS` → 「會錯過補考。」），所以同一個時間點，總複習會擋、一般讀書和跳時間不擋。
對照：可昕的電話（`src/postgrad3d.js:371`）同樣是 PG 停點，有另外推進 `CLS.STOP_FNS`。

---

## 疑點 1：BUG-MAKEUP-STUDY-NOWARN-1102（座位讀書跳過補考，沒有預告）

- commit：`84ca312d`
- 位置：`src/faildelay3d.js:159`（`fd_makeup` 停點只進 PG.STEPS）；`src/classes3d.js:1163`（`studyLengths` 的 miss 只看 `dayItems`）、`:1159`（`nextFixed` 只看課與當面約）
- 問題：6/26 08:30 在總圖坐下「讀書」，「讀 3 小時」沒有變灰、提示也沒寫會錯過補考，也沒有「讀到補考前」的選項；讀完 11:30 → 補考記缺考 → 延畢、2029 國考取消。`studySession` 是一次 `advance(hrs)`，中間 `PG.tick` 不會插進來。
- Node 重現（A 節）：
  ```
  A1 讀書選項 [["讀 1 小時",false,"用掉上午 1 次（還剩 0）"],["讀 2 小時",false,…],["讀 3 小時",false,"用掉上午 1 次（還剩 0）"]]
  A2 nextFixed null  spanCheck(3h) {"closed":false,"miss":[],"exam":[]}
  FAIL A3. 6/26 08:30 在總圖「讀 3 小時」應該提示會錯過補考（或變灰）
  FAIL A4. 「讀到…前」應該有一項停在補考前　null
  A5 讀完 3 小時以後： {"hour":11.5,"mk":"missed","FAIL_DELAY":true,"BAR_REG":false,"done":"missed"}
  C1 對照：總複習的 reviewCheck {"dim":true,"why":"會錯過補考。"}
  ```
- 玩家重現：大四下有一門考五題的課期末 0 題 → 6/18 成績單排補考 → 6/26 早上 08:30 從宿舍走到總圖、坐下 →「讀書」→「讀 3 小時」→ 讀完 11:30，接著出現「（補考的時間過了。…你沒有去考。）」＋延畢。
- CC 初判：成立，**P1**（一次普通操作就延畢＋國考取消，事前沒有任何提示；同一畫面的總複習卻會擋，行為不一致）。修法方向（給 LAWWW 參考）：補考也進 `spanCheck`/`studyLengths` 的 miss（或 dim）與 `nextFixed`。

## 疑點 2：BUG-MAKEUP-SKIPTO-1102（「待到中午」／小睡跳過補考，不停）

- commit：`84ca312d`
- 位置：`src/faildelay3d.js:159`；`src/classes3d.js:874`（`skipStops` 只看 `CLS.STOP_FNS`、課、考試、約、出遊、閉館、auto 事件）
- 問題：`CLS.skipTo` 從 08:30 跳到 12:00，停點清單是空的，不停在 09:30（或出發前），也不跳出「會錯過」確認 → 直接記缺考延畢。對照可昕電話（`postgrad3d.js:371`）有推 `CLS.STOP_FNS`，補考沒有。
- Node 重現（D 節）：
  ```
  FAIL D1. 6/26 08:30 跳到 12:00 的停點應該有補考（09:30 或出發前）　[]
  D2 跳過以後： {"skipTo":true,"hour":12,"mk":"missed","FAIL_DELAY":true,"BAR_REG":false}
  ```
- 玩家重現：6/26 上午在總圖讀過一次（上午次數用完）→ 座位選單出現「待到中午（12:00）」→ 按下 → 12:00，補考缺考、延畢。床上小睡跨過 11:00 同理（`skipTo` 的 nap）。
- CC 初判：成立，**P1**（有現成機制 `CLS.STOP_FNS` 可接，前例 kx_bar_2029）。

## 疑點 3：BUG-MAKEUP-HOME-REST-1102（在家「休息一下」跨過 11:00，R1 預告沒列補考）

- commit：`0c3d9e7a`（在家的補考選項是這次加的，但 R1 預告沒一起接）
- 位置：`src/faildelay3d.js:163`（`homeMakeupOpt`）；`src/home3d.js:110`（`wouldMiss` 只看出遊、當面約）、`:126`（`confirmMiss`）
- 問題：6/26 10:30 在家，選單有「出發：補考」，但選「在家休息一下」（一小時）時 `confirmMiss` 沒有「會錯過：補考」→ 11:30 → 離開家／下一次 `PG.pending` 就記缺考延畢。家裡的「等吃晚餐」等其他跳時間選項同理（只看 `wouldMiss`）。
- Node 重現（B 節）：
  ```
  B0 前置：家裡選單有補考 出發：補考（法律系館A）
  FAIL B1. 10:30 在家「休息一小時」的 R1 預告應該列補考　[]
  B2 休息完： {"hour":11.5,"mk":"missed","FAIL_DELAY":true,"BAR_REG":false}
  ```
- 玩家重現：6/26 早上回臺北的家（或前一晚住家裡）→ 拖到 10:30 → 選「在家休息一下」→ 沒有「會錯過」確認 → 11:30，出門後補考缺考、延畢。
- CC 初判：成立，**P2**（選單上就寫著「出發：補考」，玩家自己選休息，嚴重度比 1、2 低；但 R1 規則是「會錯過的要先講」，補考不在清單裡）。

## 疑點 4（觀察，玩家路徑未確認）：缺考的旁白窗口只到 6/28 24:00

- commit：`84ca312d`
- 位置：`src/faildelay3d.js:159-160`（`fd_mk_missed` 的 `until`＝補考日＋2 天 24:00）
- 問題：缺考是在 `PG.pending` 第一次跑到時才記（`onMiss`）。如果 6/26 11:00～6/28 24:00 之間一次都沒跑到 `PG.pending`，缺考的那一刻 `fd_mk_missed` 也已經過期 → 被標 `missed`、旁白（「補考的時間過了…」＋證書、國考兩句）一句都不演，玩家只會在 22:00 收到阿哲私訊、日期卡變延畢版，不知道為什麼。
- Node 重現（E 節，直接把時間設在 6/29 09:00 再跑 `PG.pending`）：
  ```
  E1 6/29 才第一次算： {"mk":"missed","said":null,"narrDone":"missed","FAIL_DELAY":true,"due":null,"lines":[]}
  ```
- 玩家路徑：CC 沒找到確定的路徑——在家睡覺會經過 `PG.sleepJump`→`PG.due`，3D 世界有 `PG.tick`；可能的是連續好幾天都不跑 `PG.pending` 的模組（多日行程、在家的其他迴圈模式），沒查到。
- CC 初判：**低**，邏輯上旁白和旗標的時間點可能脫鉤；建議 `fd_mk_missed` 的 `until` 改成跟著 `M.missedAt` 算（或不設上限，`said` 擋重複）。交 BB 決定要不要列。

## 疑點 5（設計確認）：6/18～6/26 之間、用舊版本已經判延畢的存檔不給補考

- commit：`84ca312d`（`FD.check` 的 `F.FAIL_DELAY_COURSES!=null` 就不判；測試 e1 刻意鎖住）
- 狀況：玩家在 D118 以前的版本 6/18 已經被判延畢，存在 6/20；更新後讀檔，日期還在補考前，但照舊延畢、不排補考。
- Node：`tests/y4s2_makeup_unit.js` e1、e3 已經示範（PASS＝照設計）。
- CC 初判：不是 bug，是設計選擇；只是提醒 BB 這和「過了照常畢業」的新規則對舊存檔玩家看起來不一致，要不要對「`FAIL_DELAY_V=2`、`G.day<補考日`、被當全是考五題的課」的舊存檔補排補考，由 BB／使用者定。

---

## 看過、認為沒問題的部分

- `classes3d.js` `drawExam` kind `'makeup'`：`examPool` 對非 `'mid'` 一律用第 15 週範圍；先抽期末沒考過的題；key 不同所以種子不同；重修課（`rtTerm`／`redoOf`）照原本學期的題庫，key 仍是 `Y4S2:<id>:makeup`，和 `makeupPassed` 讀的 key 一致。
- `failedIn`／`reportFor` 認補考及格；補考沒過時 `R.exam[...:makeup].correct=0`，`failedIn` 照期末判、仍算被當（一致）。
- `FD.migrate`：`FD_MAKEUP` 排了以後 `FAIL_DELAY_COURSES=[]` → migrate 第一個條件就 return；補考沒過／缺考走 `applyDelay` 記 `FAIL_DELAY_V=2` → 不會被 NOFINAL 救援誤救。
- 交換路線（`exch`）、`termAway`（大四下在國外）、經濟系那一年（`breakOf`/`termOf` 6/26 都是 null，也不在 `law` 以外的 stage）、SEMFF（只在學期中）、ECONFF（經濟系那一年）：都碰不到 6/26 補考。
- 約會（`DATE.check`）：畢業典禮以後不能預約，不會和補考撞；`pgdates` 的 `busyDays` 看 `s.cond`，補考待考時 6/26 算有事。
- 在家睡覺：`PG.sleepJump` → `advance` → `PG.due`，6/26 早上睡覺會停在 09:30 演補考；10:30 在家睡覺也會直接演補考（due 已到）。
- 6/25 20:00 提醒只在成績單早於那個時間才排（`mkPlan`）；成績單補考當天才發＝直接延畢（測試 h）。

## 補考第二輪 ① Node（BB 09:25 插隊）

- audit_makeup_timeskip.js：d9d637553 → ALL PASS（rc=0）；0c3d9e7a5 → FAILED 4（A3、A4、B1、D1，照舊）
- 新增 audit_makeup_trip.js（TRIP.wouldMiss）：d9d637553 F1～F4 PASS、F5 FAIL；0c3d9e7a5 F1、F2、F5 FAIL
```
PASS F1. 6/26 08:30 自由出行到 13:00 應該列補考　["10:00 補考：海商法與海洋法"]
PASS F2. 6/26 09:45 出行到 12:00 應該列補考　["10:00 補考：海商法與海洋法"]
PASS F3. 6/26 11:30（補考已過）出行 不該列補考　[]
PASS F4. 6/26 06:30 出行到 09:00（補考前回來） 不該列補考　[]
FAIL F5. 邊界：已有 3 件會錯過＋補考，補考仍要列出　["09:00 約好的見面1","09:30 約好的見面2","10:00 約好的見面3"]
FAILED 1
```
- F5：faildelay3d.js:185 的包裝是 w0 結果 concat 補考再 slice(0,3)，當天已有 3 件會錯過（例：3 個約好的見面）時補考被擠掉。home3d.js:126 confirmMiss 也是 concat 後 slice(0,3)（HOME 包裝本身不截，但補考接在 wouldMiss 後面、dormMiss 前面，前面已有 3 件時同樣會被截）。建議補考放最前面。
