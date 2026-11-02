# CC K1「交換路線（JP、US）的核心玩法」測試報告

- 受測版本：開發分支 `claude/confident-ritchie-8rwh7t`。開始時 head 是 **`7776c53c8`**，測到一半分支前進到 **`c32f4c5a9`**（改了 faildelay3d.js 的 `FD.clsStop`、study3d.js 的 `STUDY.courses`）。兩版都完整跑過，輸出逐行相同（不算第一行的路徑）。下面的行號都是 `c32f4c5a9`。
- 環境：只用 Node（`nice -n 19`），沒有開瀏覽器；沒有改 src；沒有 commit。
- 腳本：`docs/story_planning/test_tools/cc/k1_exchange.js`（用法寫在檔頭）。載入方式：`test_tools/cc/n56_loadall.js`，照 index.html 的順序載入 src（game3d.js 除外；3D 繪圖的 17 檔在 Node 載不進，和這次的範圍無關）。
- 指令：
  ```
  git archive c32f4c5a9 src tests index.html | tar -x -C <資料夾>
  nice -n 19 node docs/story_planning/test_tools/cc/k1_exchange.js <資料夾> 3     # 約 6 秒，含突變測試
  nice -n 19 node docs/story_planning/test_tools/cc/k1_exchange.js <資料夾> 6     # 種子 1～6
  ```
- 結果：
  - 3 個種子：檢查 1908 項，**FAIL 20 項**，結束碼 1。
  - 6 個種子：檢查 3816 項，**FAIL 42 項**。
  - 突變測試 6 種全部被抓到（漏抓 0 種）。
- FAIL 只有 4 種，都是真的問題，見第 3 節。

## 1. 怎麼跑

新遊戲放在 2027-09-01，也就是大三上開學前。路線設成 `EXCHANGE_ROUTE`＝TW／JP／US，一天一天走到大五上（Y5S1）結束。除了畫面，全部呼叫遊戲真的函式：

- **每一天**：`CLS.dayItems`，看課表和考試。
- **考前一週週日 20:00**：`STUDY.remind`。
- **總複習**：`STUDY.reviewInfo`。
- **學期中第 36 天**：`STUDY.courses`，也就是手機「法律」頁的資料。
- **期末週**：dayItems 排出來的考試，真的跑 `CLS.runExam`。答對幾題照情境決定，要被當的就五題全錯。
- **成績公布日早上**：真的跑 `CLS.morning`，裡面會發成績單、排重修。如果那天人在國外，就改在回國隔天早上發。
- **JP 大三下**：照 `JP.classesOn` 的日本課表真的跑 `JP.attend`。每科上幾次照種子決定：0 次、5 次，或全部上（日本法入門 15 次、比較行政法 13 次；5/18 G5 那一堂會跑事件，跳過）。
- **US**：8/2 設 `US_DEPARTED`／`US_ARRIVED`，12/23 設 `US_RETURNED`，照 exchange3d.js 的旗標。
- **6/18 大四下成績單**：CLS.showGrades 包著 `FD.check`。
- **大五上**：`Y5.classItems`、`FD.items`、`FD.slots`、`FD.result`。

情境（每條路線 × 每個種子）：

| 情境 | 內容 |
|---|---|
| pass | 全部及格（每科答對 1～5 題） |
| mid | 國外學期前一學期被當一科（TW、JP＝大三上；US＝大三下）；JP 另外大四上也當一科（重修排進有日本補修的大四下） |
| y4s2 | 大四下被當一科（TW、US＝海商法；JP 照種子輪流：海商法、民訴甲下補修 `civpro_2_re`、保險法補修 `insurance_re`） |
| y4s2b | （JP、US）國外學期前一學期被當一科，之後那一門每一次重修都被當，一路到大四下 |

## 2. 每項結果

| 編號 | 檢查（壞掉時哪裡會 FAIL） | 結果 |
|---|---|---|
| A0 | `CLS.termAway`：JP＝大三下、US＝大四上，其他學期 false | PASS |
| A1 | 國外學期 dayItems 台灣的課 0 堂、考試 0 場（JP 整個大三下，包括 2/21～3/24 還沒出發的那段；US 大四上 8/2～12/22，回國的 12/23、12/24 是週末） | PASS |
| A2 | 國外學期沒有 `R.exam` 紀錄 | PASS |
| A3 | 國外學期考前一週不發總複習提醒（`STUDY.remind`） | PASS |
| A4 | 國外學期總複習開不了（`reviewInfo`＝null） | PASS |
| A5 | 國外學期沒有訂正筆記 | PASS |
| **A6** | 國外學期中，手機「法律」頁的「這學期」不應該有台灣的課 | **FAIL：US 全部情境**（JP PASS） |
| A7 | 國外學期的 `failedIn`＝[]、`GRADES.lv`＝null、書卷獎＝false | PASS |
| A8 | 國外學期發成績單時不排重修 | PASS |
| B0 | 人在國外的日子台灣的課 0 堂（其他學期） | PASS |
| B1 | 前後學期（含回國那一學期：JP 大四上、US 大四下）dayItems 排的考試＝examList，每科都考到 | PASS |
| B2 | 前後學期考前一週週日 20:00 有提醒 | PASS |
| B3 | 前後學期總複習開得了，範圍＝這學期的考試 | PASS |
| B4 | 答錯的考試都有訂正筆記（`examfix_<學期:課:final>`） | PASS |
| B6 | 前後學期每門課學過 x≤y、y＞0 | PASS |
| B6b | JP 補修課（`civpro_2_re`、`insurance_re`）的 y＝原課大三下的觀念卡數 | PASS |
| C0 | 每學期成績單都發得出來（JP 大三下在 8/6 回國隔天早上發） | PASS |
| C1 | JP 大三下成績單＝日本兩門，不含日本語；等第照出席次數（10 次以上很好、5 次以上不錯、其他過了，報告自己算） | PASS（三種出席次數都有跑到：很好、不錯、過了） |
| C1b | JP 成績單的字有兩門課名，沒有日本語 | PASS |
| C2 | US 大四上成績單＝美國三門「通過」，字是「三門通過」 | PASS |
| C3 | 被當的科＝故意答 0 題的那幾科（`failedIn`） | PASS |
| C4 | 國外學期的成績單，回國後的早上在發放期限內（公布日～＋45 天） | PASS |
| D1 | 重修不排進國外學期 | PASS |
| D2 | 重修排到的學期：JP 大三上→大四上、JP 大四上→大四下、US 大三下→大四下、TW 大三上→大三下 | PASS |
| D3 | 排進重修以後，那一學期的時段不重疊（JP 大四下有補修課也一樣，衝堂會換時段） | PASS |
| D4 | 被當幾科就排幾門重修 | PASS |
| E1 | JP／US 大四下被當或全過，都不排補考（沒有 `FD_MAKEUP`） | PASS |
| E2 | JP／US 的 `FAIL_DELAY_COURSES`＝大四下被當的那幾門（含 `civpro_2_re`、`insurance_re`、一路重修的課） | PASS |
| E3 | JP／US 不設 `FAIL_DELAY`；`PG.delayed`、`PG.exchDelayed`、`Y5.delayed` 都成立 | PASS |
| E4 | TW 大四下被當（考五題的課）就排補考：`FD_MAKEUP` pending，還沒延畢 | PASS |
| F1 | US 大五上有補修：強制執行法（週一）、法律倫理（週三），各 15～16 堂；JP 大五上沒有補修 | PASS |
| **F2** | 大四下被當的課，大五上排得到重修（`Y5.classItems`，至少 3 堂） | **FAIL：US 被當海商法（每次）、US 一路重修被當民訴甲下** |
| **F3** | 大五上的重修不和週二 10:00 的法律實習（交換版）同一時段 | **FAIL：一路重修被當刑訴（JP）、保險法（US）** |
| **F4** | 課表（`CLS.weekHTML`，列 `FD.slots`）上有的重修，今日頁（`Y5.classItems`）也排得到 | **FAIL：同 F2** |
| G1 | TW 全部及格就不延畢 | PASS |
| G2 | TW 全部及格，大五上不存在 | PASS |
| G3 | 交換全部及格：`FAIL_DELAY_COURSES`＝[]，大五上沒有重修 | PASS |

突變測試：只算基準那一次沒有的 FAIL。基準本來就 FAIL 的不算「抓到」。

| 突變 | 抓到的檢查 |
|---|---|
| M1 `CLS.termAway` 不認國外學期 | A0 等 3 項 |
| M2 重修不跳過國外學期 | D1、D2 等 4 項 |
| M3 FD.check 對交換路線也排補考 | E1 等 3 項 |
| M4 日本成績等第一律「過了」 | C1 |
| M5 `FD.items` 空 | F2 |
| M6 總複習提醒不看國外學期 | A3 |

## 3. 問題

### K1-1　US 路線大四上人在美國時，手機「法律」頁的「這學期」列出台灣大四上的 5 門課（A6，P3）

- 現象：學期中 `STUDY.courses(G)` 回傳 current 的 5 門課（enforcement、legal_ethics、ip_law、labor_social、crim_judgment_sem），每門顯示「期末範圍：學過 0／N」。玩家人在美國，根本沒有修這些課。JP 大三下是空的。
- 原因：
  - `study3d.js:64` 的「這學期」照 `CLS.termCourses(G,cur)` 列。
  - `classes3d.js:61-64` 的 `enrolled` 只問 `JP.skipTerm`。所以 JP 大三下沒有課，US 大四上的台灣課照列。
  - `CLS.termAway`（`classes3d.js:75`）有算 US，可是 termCourses／STUDY.courses 沒有用它。
- 重現：`k1_exchange.js` 任一 US 情境，看 A6；或 US 路線把 G.day 設在 2028-10-09，呼叫 `STUDY.courses(G).filter(e=>e.current)`。
- 附帶：`CLS.examList(G,'Y4S1')` 對 US 也回傳 5 場（12/18～12/22，見 INFO）。
- 沒驗證：這是資料層的結果，沒有開畫面確認「法律」頁在美國那段是不是真的看得到。

### K1-2　US 路線大四下被當海商法，大五上的重修完全排不出來；課表卻寫著有（F2、F4，P2）

- 現象：US 被當的課在 `FAIL_DELAY_COURSES` 裡，`FD.slots` 也給了時段，所以課表（`y5s1_3d.js:58` 起的 weekHTML）會列「重修：海商法 週三上午」。可是今日頁、一鍵上課（`Y5.classItems`）一堂都沒有。
- 原因：
  - `FD.slots`（`faildelay3d.js:129`）照原課的時段排：海商法週三 am。
  - US 的補修（`y5s1_3d.js:31`）佔了週一 am（強制執行法）、週三 am（法律倫理）。
  - `y5s1_3d.js:38` 遇到同時段就丟掉 FD 那一門（註解寫「和補修衝堂的不排」），沒有換時段。
- 影響範圍：
  - 海商法是 US 大四下唯一考五題的原生課，所以 **US 大四下被當的每一份存檔都會遇到**（6 個種子 6/6）。
  - 重修課原本在週一 am、週三 am 的也一樣，例如民訴甲下 `civpro_2`（種子 4）、公司法 `company_law`。
- 重現：`k1_exchange.js <dir> 6`，看 [US sN y4s2] F2／F4。
- 交換延畢的重修沒有過不過的後果（見 INFO-2），所以不會卡住進度。但玩家會看到課表上有一門永遠上不到的課，劇情台詞（FD.LINES plan1「這學期，只要重修{課名}」）也對不上。

### K1-3　交換路線大五上的重修排在週二上午，和週二 10:00 的法律實習（交換版）撞時段（F3，P3）

- 現象：
  - 刑事訴訟法：原課週二 am、週五 am。JP 一路重修被當到大四下。
  - 保險法：原課週二 am。US 一路重修被當到大四下。
  - 這兩門在大五上的 FD 重修會排在週二 9:10～12:10。可是交換延畢的人週二 10:00 要去法扶實習：`Y5.internOn` 在 `y5s1_3d.js:20`、`INTERN_TEXT` 在 :30、`dayLine` 在 :45，12/18 還有實習事件。
- 原因：`FD.slots`（`faildelay3d.js:129`）只避開 FD 自己的課互撞，不知道週二實習，也不知道 US 補修。
- 走得到的條件：同一門課被當三次（JP：大三上→大四上→大四下；US：大三下→大四下兩次）。很少見。
- 重現：`k1_exchange.js <dir> 6`，看 [JP s1/s5 y4s2b]、[US s1/s5 y4s2b] F3。

## 4. INFO（不計 PASS/FAIL，交 BB 判定）

1. **JP 大三下日本的課一堂都沒上，成績單照樣是「過了」**（`jp3d.js:438` 的 `S.report` 用 `CLS.gradeOf(0)`）。jp3d 檔頭寫的是「日本語不算學分」「出席照 CLS 的等第」，沒有「不及格」這一級。日本的課不會被當，出席 0 也算修過、抵學分。這是不是原設計，交 BB 確認。
2. **交換路線大四下又被當、大五上重修一堂都沒去：沒有任何後果。**
   - `FD.result`（`faildelay3d.js:141`）會記 `FAIL_DELAY_PASS=false`。
   - 但證書延到六月（`FAIL_DELAY_CERT`）只在 `S.on`＝`FAIL_DELAY` 成立時才判，交換路線不設 `FAIL_DELAY`（`faildelay3d.js:55`「本來就延畢」）。所以交換的人照樣 2030-01 領證書。
   - 畢業後篇跳日期的上課停點 `FD.clsStop`（:161）也是 `S.on` 才停。交換路線用「跳到下一件事」會直接跳過重修課。
   - 檔頭寫「交換路線又被當的：本來就延畢，只是大五上多那一門重修」，沒有寫沒去要怎樣。交 BB／AA 定。
3. **畢業後「法律」頁在「大三下」名下列出民訴甲下、保險法**（JP 路線；`study3d.js:66`，c32f4c5a9 改過這一段，結果一樣）。
   - JP 大四下補修課的觀念卡是原課 `civpro_2`／`insurance` 的卡（`redo`），所以學期結束後「之前的學期」那一列用原課、標「大三下」。可是 JP 大三下人在日本。
   - 補修課考過且有卡片紀錄才會出現：種子 1 兩門、種子 2 一門。
   - M6 報告第 3 節已經記過「日本補修課放在這學期」；這裡補充學期結束以後的標示。P4。
4. **`CLS.examList` 對 US 的大四上仍回傳 5 場考試**（`classes3d.js:603`，沒有問 termAway；JP 大三下因為 termCourses 是空的，所以回傳空）。dayItems 沒排、提醒和總複習都擋掉了（`study3d.js:119`、:167 有問 termAway）。其他呼叫者：
   - `sideq3d.js:528` examEve：12/17 晚上人在美國，民總那本書在台灣的房間，看不到。
   - `termend3d.js:98` examStart：被 backDay 12/24 蓋過。
   - `cracktalk3d.js:312`：只用在沛珊交往。
   - `classes3d.js:953` 台灣版課表：US 回國那兩天（12/23、12/24，週末）打開課表，會看到大四上的台灣課和 5 場「期末」（日期已過、灰字）。
   - 目前找不到玩家會因此被擋住的地方；和 K1-1 同一個根本原因（US 的大四上沒有像 JP 一樣從 termCourses 拿掉）。

## 5. 範圍外、沒測

- **只從大三上開始跑。** 大一、大二和交換無關。國文、體育這類看出席的課一路重修跳過國外學期的情形，M3（`m3_rollcall.js`）已經測過。
- **出席制（點名）的課。** 大三起本來就沒有；這裡也沒有讓看出席的課重修進國外學期前後。
- **路線決定（2027-11-18）以前就排好、而且順延進大三下的重修。** 理論上會在 JP 的 termCourses 出現（`classes3d.js:65` 重修不經過 enrolled）。要大二下幾乎全當、大三上排滿才會發生，沒有構造。
- **JP 在日本的那段，據點的 loop 會不會叫 `CLS.morning`。** 這裡改在回國隔天早上發（家裡的 `home3d.js:86` 會叫）。
- **學分。** 遊戲沒有學分制，畢業判定＝路線（交換＝延畢）＋`FAIL_DELAY`。JP 的 `credit:'外國法導論'`／`'行政法專題'`只用在課表顯示「不算學分」（`jp3d.js:435`），沒有拿去算畢業門檻。US 三門沒有 credit 欄位。「交換學分是否計入畢業門檻」在程式裡沒有對應的機制。
- **畫面。** 沒有開瀏覽器，「法律」頁、課表的實際畫面都沒看。

## 6. CC 初判（判定歸 BB）

- **K1-2**（US 大四下被當海商法，大五上的重修排不出來、課表卻有）：**P2**。每一份 US 大四下被當的存檔都會遇到。
- **K1-1**（US 在美國時「法律」頁列台灣大四上的課）：**P3**。
- **K1-3**（重修撞週二實習）：**P3**，很少見。
- **INFO-1、INFO-2**：屬於設計問題（日本的課出席 0 也過；交換又被當，重修沒去沒有後果）。請 BB／AA 決定。
- **其他沒有問題**：國外學期不排課、不考試、不提醒、不點名、不排重修；回國學期一切正常；JP／US 大四下不排補考、照舊延畢，`FAIL_DELAY_COURSES` 正確。這些都 PASS，而且都有突變測試證明檢查會抓到錯。
