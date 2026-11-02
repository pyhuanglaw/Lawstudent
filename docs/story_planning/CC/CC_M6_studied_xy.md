# CC M6「學過 x／y 一致性」

- 受測 SHA：`188412f3b`（`origin/claude/confident-ritchie-8rwh7t` 最新 head；工作樹 `scratchpad/wt_hd`，只讀）
- 執行：CC 子代理，2026-11-02；只用 Node（`nice -n 19`），沒開瀏覽器。**這是模擬，不是瀏覽器、不是 iPhone 實機。**
- 腳本：`docs/story_planning/test_tools/cc/m6_studied_xy.js`
- 指令：
  ```
  nice -n 19 node docs/story_planning/test_tools/cc/m6_studied_xy.js <受測根目錄> 6        # 約 4 分鐘（含突變測試）
  nice -n 19 node docs/story_planning/test_tools/cc/m6_studied_xy.js <受測根目錄> 6 --no-mut
  ```
- 結果：`FAILED 2`（檢查 6、7；核心的 1～5 全部 PASS；7 種突變全部被抓到）

## 0. 「學過 x／y」怎麼算、在哪裡顯示

來源只有一個：`src/study3d.js:47` `STUDY.progress(G,course,kind,term)` → `{total, heard, read, got}`。
- y＝`total`＝`STUDY.units(G,course,term,'final')`（`study3d.js:38`）：那門課第 15 週以前的觀念卡；重修課照 `CLS.rtTerm` 用原本那一學期的卡、日本補修課（`civpro_2_re`、`insurance_re`）照 `CLS.redoOf` 用原課（大三下）的卡；刑事訴訟法多 9 張「刑訴題庫卡」（`week:null`）。
- x＝`heard`＝等級 ≥1 的卡（上過課、自習／總複習讀過、答對過任一種；BB 06:20 判定）；z＝`got`。等級只升不降（`STUDY.mark`，`study3d.js:28`）；刑訴題庫卡另外照 `G.legal.q` 的狀態（learned 以上＝讀過、mastered＝答對過）。
- 會讓 x 增加的地方：`CLS.attend`→`STUDY.heard`（`classes3d.js:334`）、`CLS.studyTopic`→read（`:631`）、`CLS.classAsk`→heard＋答對 got（`:642`）、`CLS.runExam`→答對 got（`:661`，答錯只進 miss，不算學過）、`STUDY.review`→範圍內全部 read（`study3d.js:149`）、讀書會（`G.legal.q`）→刑訴題庫卡。

顯示的地方（腳本都用遊戲實際產生字串的函式取值）：

| 代號 | 畫面 | 程式 | 取值方式 |
|---|---|---|---|
| A | 手機「法律」頁每一列 | `game3d.js:464` `renderLegal` → `ST.progress(G,e.c,'final',e.term)`（`:475-476`） | 把 `renderLegal` 原始碼抽出來執行（假 DOM），解析「學過 x／y・答對過 z」 |
| B | 自習結束字幕 | `game3d.js:317` `STUDY.line(G,course)`（**不帶學期**） | 直接呼叫 `STUDY.line(G,c)` |
| C | 一鍵總複習結束字幕 | `study3d.js:160` `S.line(G,x.c,info.term)` | 直接呼叫 `STUDY.line(G,c,term)` |
| D | — | `STUDY.progress` | 直接呼叫 |

**「課表」沒有顯示學過 x／y**：手機課表 `CLS.weekHTML`（`classes3d.js:939`）只顯示時段、出席次數（點名）、考試日期；今日頁 `CLS.todayHTML` 也沒有。所以「三處」實際是 A（法律頁）、B（自習字幕）、C（總複習字幕），加上 D（STUDY.progress 本身）。

## 1. 模擬怎麼做

- 從大一上（9/17 開局）到大四下，每天：每堂課照機率 `CLS.attend`（會自己跑課堂提問）、照機率自習（`CLS.studyTopic`＋`game3d.js` 抽出的 `addNote`）、考前一週照機率 `STUDY.review`、考試日 `CLS.runExam`（亂數作答）、學期末 `CLS.showGrades`（真的排重修）；讀書會＝直接寫 `G.legal.q`（harness 的 LEGAL 是假的，標明）。
- 路線：TW 一般 6 個種子（出席率、自習、總複習、讀書會機率各不同）、TW 全勤＋每次總複習、TW 只上課不自習、TW 重修（指定三門全錯）、JP 交換、US 交換。共 11 條四年。
- 每天結束、每次自習後、每次總複習後，對「這學期每一門考五題的法律課」做檢查點：共 **49,935 個檢查點**（每個檢查點 1、2、3 三項）；新學期歸零 288 項；上學期數字不變 935 項。
- 獨立模型（檢查 3）：不呼叫 STUDY 的計算，只用 `STUDY_UNITS` 原始資料＋存檔紀錄（`R.done`、筆記 id、`R.ask`、`R.exam` 的 qs/ans、總複習記下的卡、`G.legal.q`）自己推每張卡的等級，再算 x／y／z。

## 2. 每項判定

| # | 檢查 | 結果 |
|---|---|---|
| 1 | x ≤ y（A、B、C、D，法律頁每一列） | **PASS**（49,935 個檢查點） |
| 2 | 三處一致：A＝B＝C＝D（x、y、z 都比） | **PASS** |
| 3 | 獨立模型＝STUDY.progress（x、y、z、read） | **PASS** |
| 4a | 新學期第一天、還沒做任何事：這學期的課 x＝0、z＝0（重修、日本補修、刑訴另列） | **PASS**（288 項） |
| 4b | 學期結束後，上學期的課數字不再變（刑訴、之後又重修的除外） | **PASS**（935 項） |
| 5a | 只上課不自習：每一門課 x > 0（上課也算學過） | **PASS** |
| 5b | 全勤＋每學期總複習：每一門課 x＝y | **PASS** |
| 6 | 大一上只在讀書會碰過刑訴題庫：法律頁不應把「刑事訴訟法（大三上）」列在「之前的學期」 | **FAIL** |
| 7 | 重修那一學期：重修課在法律頁「這學期」那一區 | **FAIL**（83／83 門次在「之前的學期」） |
| MUT | 7 種突變都要被抓到 | **PASS**（見下） |

突變測試（故意改壞，證明檢查不是空的）：

| 突變 | 被哪一項抓到 |
|---|---|
| M1 progress 把 miss 的卡也算學過（x 會超過 y） | 1、3、4a |
| M2 法律頁顯示 read 而不是 heard | 2 |
| M3 上課不呼叫 `STUDY.heard` | 3 |
| M4 `mark` 不是只升不降 | 3 |
| M5 換學期沒歸零（同週次的上學期卡也算進來） | 3、4a、4b |
| M6 自習字幕（不帶學期）把「讀過」當學過 | 2 |
| M7 y 少算一張 | 1、3 |

## 3. 換學期、重修、日本補修怎麼算（實際數字）

- **一般的課**：每門課只有自己那一學期的卡，新學期第一天 x＝0（288 項全部 PASS），上學期的數字之後不再變（935 項 PASS）。上學期的不會帶過來。
- **重修課**：用原本那一學期的同一組卡（`CLS.rtTerm`），狀態只升不降 → **原課的「學過」整個帶過來**。11 條路線共 83 門次重修，第一天就 x>0 的 83／83，其中 x＝y（已滿）的 74 門次。例：「民法總則（重修）」大一下第一天＝學過 10／10・答對過 1。答對過（z）也帶過來。這是照程式設計（卡片狀態不分學期），是否符合 D118 的本意由 BB 判斷。
- **日本補修課**（`civpro_2_re`、`insurance_re`，大四下）：用原課（大三下，人在日本沒修）的卡，第一天 0／10、0／9，放在「這學期」。
- **刑事訴訟法**（大三上）：y＝10（第 1 週 1 張＋刑訴題庫卡 9 張）。讀書會在大一、大二碰過的題庫卡會先算進去：開學第一天 x 從 0 到 6 不等（11 條路線：0、0、1、1、3、3、5、5、6…）。照 D118 設計（LEGAL 狀態算進去），列出供 BB 判斷。

## 4. 問題（CC 初判，判定歸 BB）

1. **重修那一學期，法律頁把重修課放在「之前的學期」、標原本的學期**（檢查 7，P2 候選）。
   - 位置：`src/game3d.js:467` `LC=CLS.legalCourses(G)`——`src/classes3d.js:216` 照 `R.done` 第一次出現的那一學期建列（`by[cid]` 只建一次，term＝原課的學期）；`game3d.js:471` 再用 `have`（課程 id）擋掉 `STUDY.courses` 給的「這學期」那一筆（重修課 id＝原課 id）。
   - 結果：重修的學期裡，「這學期」區沒有那門課；它出現在「之前的學期」、名字是原課名（沒有「（重修）」）、學期標原本那一學期（例：大一下重修民總，顯示「民法總則・大一上」）。數字本身和 B、C、D 一致（同一組卡）。
   - 重現：`node m6_studied_xy.js <dir> 1 --no-mut`，看檢查 7 與「INFO 新學期第一天 重修」那幾行。（只有原課出席過才會這樣；原課完全沒出席的，`legalCourses` 會照重修那一學期建列。）
2. **大一、大二只在讀書會碰過刑訴題庫，法律頁就出現「刑事訴訟法・大三上」，而且放在「之前的學期」**（檢查 6，P3 候選）。
   - 位置：`src/study3d.js:59-63` `S.courses`：刑訴題庫卡有 LEGAL 狀態（`qb`）就 `add(c, c.term, c.term===cur)`——c.term＝Y3S1，不是這學期就被當成「之前的學期」。
   - 重現：大一上（2025-10-01）設 `G.legal.q={Q002:{state:'learned'}}`，法律頁出現 `{"name":"刑事訴訟法","sec":"prev","x":1,"y":10,"tn":"大三上"}`。腳本檢查 6。
   - 註：`renderLegal` 的舊段落（`game3d.js:483-484`「刑事訴訟法（讀書會、課堂遇到的題目）」）本來就會列刑訴題庫；這一列是 D118 新加的觀念卡列，標「大三上」放在「之前」容易誤會。
3. **（資訊）日本補修課的自習筆記 id 不是卡片 id**：`civpro_2_re_w1` 這種筆記，即時累積時有算（`STUDY.weekUnit` 照 `redoOf`），但 `STUDY.backfill`（`study3d.js:72`，只認「筆記 id＝卡片 id」）重算時漏掉：JP 路線大四下 read 10／9 → backfill 後 1／1。backfill 只在舊存檔第一次讀到時跑一次（`bf` 標記），D118 之前的舊存檔走到 JP 大四下補修的情況很少；總複習讀過的卡本來就沒有紀錄、backfill 也推不回（設計如此）。P4／資訊。
4. **（資訊）B（自習字幕）不帶學期、C（總複習字幕）帶學期**：目前每門課的卡都屬於同一學期、範圍也一樣（第 15 週以前），所以結果相同（檢查 2 全部 PASS）；如果之後有跨學期共用課程 id 的卡，B 會和 A、C 不同。

## 5. 限制

- 讀書會（`G.legal.q`）是直接寫狀態，不是真的 LEGAL 系統（harness 的 LEGAL 是假的）。
- 出席制的課（`CLS.attPass`）一律算過，不在範圍；延畢學期（Y5S1）沒有考五題的課、沒有 STUDY 卡，沒有納入。
- 法律頁是把 `renderLegal` 原始碼抽出來在假 DOM 上跑，CSS／換行（BB 07:15 的 nowrap）沒有看；沒有截圖。
