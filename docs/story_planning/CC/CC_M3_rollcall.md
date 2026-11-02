# CC M3：隨機點名（Node 模擬四年）

- 受測版本：開發分支 `5b40dad61`（`git archive 5b40dad61 src tests index.html` 解壓到 scratchpad/mhead；沒有 assets）
- 腳本：`docs/story_planning/test_tools/cc/m3_rollcall.js`（用法寫在檔頭）
- 指令：
  ```
  cd /home/user/Lawstudent && git archive 5b40dad61 src tests index.html | tar -x -C <資料夾>
  nice -n 19 node docs/story_planning/test_tools/cc/m3_rollcall.js <資料夾> 8      # 8 個種子＋故意改壞的自我檢查
  nice -n 19 node docs/story_planning/test_tools/cc/m3_rollcall.js <資料夾> 2 --no-mut   # 快速版（約 3 秒）
  ```
- 只用 Node，沒有開瀏覽器。8 個種子含 MUT 全部跑完約 50 秒。結束碼 1（本體有 2 項 FAIL）。

## 程式怎麼做（從原始碼讀出來，當判斷依據）

| 項目 | 實作 | 位置 |
|---|---|---|
| 哪些課點名 | `attCourse`：不考五題、而且是 general／elective，或是 `econ_principles_N`（國文、英文、通識、體育、日文、經濟學原理）。實際上只有大一、大二有這種課；大三、大四只會在重修時出現 | `src/classes3d.js:558` |
| 數量、週次 | `ROLL_N=4`、`ROLL_FAIL=3`、`ROLL_WEEKS=[2..7,10..15]`。註解寫「每學期 4 個點名週（第 2～7、10～15 週）」 | `src/classes3d.js:536-540` |
| 抽週 | 種子字串是 `examSeed|roll|學期|課`，用 FNV hash 洗牌後取前 4 週。只從「那門課這學期真的有上的週」（`met`，用 `dayItems` 掃過整學期）挑。`dayItems` 已經排除國定假日、校定假日、颱風假、人在國外、開局以前、第二天早上。抽好以後存進 `G.courses.roll`，之後照存的用 | `src/classes3d.js:542-547` |
| 到／缺 | `rollStat`：點名週裡只要有一堂 `R.done`、而且沒有 `R.abs`（遲到超過 15 分鐘），就算到 | `src/classes3d.js:548-555` |
| 及格 | `attPass`：缺的次數 < 3 就及格。舊存檔保底：`rollSince` 晚於學期開始、而且出席 ≥ `ATT_PASS`（3）也及格 | `src/classes3d.js:556-557` |
| 種子來源 | 只有 `CLS.drawExam`（考期末考時）和 postgrad 會在 `examSeed` 還沒有時補上。新遊戲的 `defaults()` 沒有 `examSeed` | `src/classes3d.js:612`、`src/game3d.js:10` |

## 測法

- 載入方式是 `tests/pg_harness.js`，另外載入 `src/jp3d.js`（`JP.skipTerm`）。
- 情境：8 個種子，每個種子跑以下幾種：
  - TW，9/17 開局
  - TW，8/29 開局，所有看出席的課都不去，用真的 `planRetakes` 排重修
  - JP
  - US
  - JP、US 再各加一次「全部重修」
  - TW／JP／US 各跑一次「國文（上）一路重修」：其他課都過，只有這門每學期都被當，用真的 `planRetakes` 一路排到大四下
- 合計 1664 筆（存檔×學期×課），其中重修 584 筆。
- 「真的有上課」用**獨立模型**判斷，不呼叫 `dayItems`。一堂課要同時符合這些條件才算：
  - 不是 `CALENDAR.holiday`（含颱風假、校定假日）
  - 不在國外（`STORY.abroad`）
  - 不在開局以前，也不是第二天早上
  - `termOf.exam!=='final'`
  - 不是學期最後一週
  - 在 `c.weeks` 範圍內
  - 不是 JP 不修的學期
- 另外用 2m 確認：非考試週時，這個模型和 `dayItems` 一致。

## 結果

| # | 檢查 | 結果 |
|---|---|---|
| 1a | 每學期每門看出席的課剛好 4 個點名週（不重複、遞增、都在 ROLL_WEEKS）；每門課可以點名的週都至少 4 個 | **PASS**（1664 筆） |
| 1b | 同一個種子：兩份獨立存檔一樣；存進 `R.roll` 的和回傳的一樣；刪掉 `R.roll` 重算也一樣 | **PASS** |
| 1c | 不同種子會變：120 組（路線×學期×課）在 8 個種子下，沒有一組 8 個種子全部相同 | **PASS** |
| 1d | **真正的新遊戲（沒有 examSeed）**：兩個不同玩家大一上的點名週不同 | **FAIL**（問題 1） |
| 2 | 點名只落在有上課的週。實際有點名課的學期是 Y1S1～Y2S2，重修會延伸到 Y3S1～Y4S2 | **FAIL**：只錯在大四下第 15 週（問題 2）。國定假日、颱風假、開局前、第 16 週都沒有抽到 |
| 2m | 獨立模型＝`CLS.dayItems` | **PASS** |
| 3 | 重修照同一套規則；JP 大三下沒有台灣的點名課；US 大四上（整學期在國外）大四上本身沒有看出席的課；US／JP 的重修會跳過國外那一學期 | **PASS**（大四下第 15 週同問題 2） |
| 4 | attPass 邊界：缺 0、1、2 次＝及格；缺 3、4 次＝不及格（3 個種子 × 缺前面幾次／缺後面幾次）。`reportFor`、`failedIn` 也一致 | **PASS**（30 筆） |
| 4 | 3 次遲到超過 15 分鐘（`R.abs`）＝缺 3 次＝不及格 | **PASS** |
| 4 | 舊存檔保底：點名全缺時，出席 2 次＝不及格、出席 3 次＝及格。新遊戲（`rollSince`＝8/29）不適用保底 | **PASS** |
| 4 | 重修課（大一下）：缺 2 次＝及格、缺 3 次＝不及格 | **PASS** |

attPass 門檻的依據是程式註解：「點名缺 3 次以上（只到 0～1 次）不及格」（`classes3d.js:538`）。實測結果和註解一致。

### 故意改壞（MUT）

每一種改壞都要讓檢查**多出新的 FAIL** 才算抓到。本體原本就有的 FAIL 不算，所以不會因為問題 2 而誤判為「抓到」。

| 改壞的方式 | 抓到？ |
|---|---|
| `ROLL_WEEKS` 加入 8、9、16 | 抓到（2：第 16 週） |
| 抽週時不排除假日 | 抓到（2：`pe_y1s1` 第 5 週 9/29 補假） |
| `ROLL_N=3` | 抓到（1a） |
| 種子沒用到（一律當 0） | 抓到（1c） |
| 不存 `R.roll`、每次重抽 | 抓到（1a/1b） |
| `ROLL_FAIL=4` | 抓到（4：8 項） |
| `ROLL_FAIL=2` | 抓到（4：7 項） |
| `rollStat` 忽略遲到 | 抓到（4） |

## 問題

### 問題 1：新遊戲沒有 examSeed，所有玩家大一上的點名週都一樣

- 位置：
  - `src/classes3d.js:543`：`seed=(F.examSeed!=null?F.examSeed:0)+...`
  - `src/classes3d.js:547`：抽到的結果存進 `R.roll`
  - `src/classes3d.js:612`：只有 `drawExam` 會補 `examSeed`
  - `src/game3d.js:10`：`defaults()` 的 flags 沒有 `examSeed`
- 時間線（8/29 開局）：
  - 第一堂看出席的課在 2025-09-01。進教室（`classes3d.js:318`）、看課表（`:943`）、第 12 週的出席提醒（`honor3d.js:36`）都會呼叫 `rollWeeks`。
  - 第一次 `drawExam`（才會產生 `examSeed`）要到 2025-12-15 期末考。
  - 所以大一上 5 門課（國文、英文、通識、體育、經濟學原理）都用種子 0 抽，抽完存進存檔，之後補上 examSeed 也不會變。
- 實測：
  - 玩家甲、乙的國文（上）都是 `[4,6,7,11]`，5 門全部相同。
  - 補上 examSeed 以後再問，還是 `[4,6,7,11]`。
- 影響：「照存檔種子、玩家事先看不到」在大一上不成立，每一局都一樣，可以背起來。大一下以後已經考過期末、有 examSeed，所以正常。
- 為什麼現有單元測試抓不到：`tests/pg_harness.js` 的 `H.fresh` 預設給 `examSeed:12345`，`tests/attend_rollcall_unit.js` 也指定了 777。
- 重現：`node m3_rollcall.js <資料夾> 2 --no-mut`，看「1d」那一段。
- 可能的修法（給開發組參考）：在 `rollWeeks` 裡比照 `drawExam`，`examSeed` 沒有時先補上；或是新遊戲時就產生。已經用種子 0 存進 `R.roll` 的舊存檔要不要重抽，需要另外決定。

### 問題 2：大四下第 15 週（期末考週）會被抽成點名週

- 位置：
  - `src/data/calendar.js:22`：大四下只有 15 週，第 15 週就是期末考週。
  - `src/data/calendar.js:75`：`termOf` 中，`week>=T.weeks` 時 exam 是 `'final'`。
  - `src/classes3d.js:540`：`ROLL_WEEKS` 寫死 15。
  - `src/classes3d.js:109`：依 D118-B1，不考試的課在考試週照常上課，所以 `met` 會包含第 15 週。
- 實測：大四下有看出席的課（重修）的 24 份存檔中，15 份抽到第 15 週，例如 2029-05-29（二）。TW、JP、US 三條路線都會發生。違規只出現在這裡，沒有別的地方。
- 怎麼走到：看出席的課一路重修到大四下就會遇到。例如國文（上）每學期都被當；或 US 路線在大三下被當，重修會跳過大四上、直接排進大四下。這是少見但走得到的路徑。
- 註解寫的「第 2～7、10～15 週」是照 16 週學期設計的（排除期中 8、9 週和期末 16 週）。15 週的大四下沒有對應排除期末週。
- 重現：`node m3_rollcall.js <資料夾> 2 --no-mut`，看「2」的 FAIL，例如 `TW 國文一路重修 種子777 Y4S2 chinese_y1（重修） 第 15 週`。

## 其他觀察（不在 M3 判定範圍，只記錄）

- **全部被當時，重修會悄悄排不下**：`planRetakes` 在 `src/classes3d.js:88` 寫 `if(slots.length<c.slots.length) continue;`，註解說「不會發生：一週有 15 個時段」。實際上如果整學期每一門都被當，到大二、大三就會把 15 個時段排滿，之後的重修會直接消失，不會排、也沒有提示。
  - 例子（種子 777，全部不去）：大三上被當的 `japanese_1`、`pe_y2s1` 重修，沒有出現在大三下。
  - 這是極端玩法，請 BB 判斷要不要開單。
- **US 大四上**：大四上本身沒有看出席的課，所以 `reportFor` 和 `failedIn` 沒有不一致。
  - 但 `rollWeeks` 在 `met` 為空時，會退回用全部 `ROLL_WEEKS` 抽（`classes3d.js:545` 的 `!met.size||`）。
  - 目前沒有路徑會走到這裡，以後如果國外學期出現看出席的課，要再看一次。

## CC 初判（判定歸 BB）

- 問題 1：初判 **FAIL／要修**。大一上點名週每一局都一樣，違反「照存檔種子、玩家事先看不到」的設計。
- 問題 2：初判 **FAIL／要修（低頻）**。期末考週會點名，和「點名不落在考試週」的規則衝突。需要企劃確認：大四下是不是應該把 15 排除，改成 2～7、10～14？
- 其他（1a、1b、1c、2 的其餘部分、3、4）：初判 **PASS**，而且已經用故意改壞的方式確認檢查抓得到。

## 重驗 @ 479c0324b（BB 09:51）

- m3_rollcall.js（8 種子、--no-mut）：本體全部 PASS（29.8 秒）；1d 新遊戲兩個玩家大一上點名週不同；大四下第 15 週 0 筆（有點名重修的大四下存檔 120 份）。
- m3b_recheck.js：479c0324b ALL PASS；修改前 5b40dad61 FAILED 3（①a、①c、③a）。
  - ① 抽點名週時產生 examSeed，期末抽題沿用同一個；6 個新遊戲 examSeed 各異、點名週 5 種（修改前 6 個全是 null／[4,10,11,12]）。
  - ③【構造：CLS.failedIn 換成每學期全部被當】Y1S1～Y2S1 共 7 門順延到再下一學期、7 則【教務處】通知（例「民法總則的重修，下學期的課表排不進去，改到大二上。」），各學期課表沒有撞時段；修改前同一情境 Y1S1 只排 7／9 門、2 門靜靜消失。retakeDropped 這個情境沒觸發到（沒能構造出「之後每一學期都排不下」）。大四下被當不排重修（沒有下一學期，交給延畢），也不記 retakeDropped。
  - ④ 舊存檔 R.roll=[3,5,9,15]（含舊規則才有的 9、15）讀出照舊。
