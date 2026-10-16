# 心願事件與不分地點的句子（BB 五位；AA_140 G33）

> BB-B 2026-10-16。原稿是 `BB_128` 第 3 節（3-1～3-6），這裡只把它拆成資料，**台詞一字不改**（`build_wish.py` 會逐句比對 BB_128 原文，少一句就失敗）。以安、語彤的心願事件（`AA_127`）由 AA-B 照同一個格式做 `wish_aa.json`。
> 狀態：`READY_FOR_REVIEW`（給 LAWWW-B 實作；照 AA-B 的交付流程）。

| 檔案 | 內容 | 怎麼產生 |
|---|---|---|
| `wish_bb.json` | 五個心願事件：芷若 D05、子晴 D03、學姊 D15、沛珊 D06、可昕 D25 | `python3 build_wish.py`（原稿 `wish_bb.py`） |
| `wish_aa.json` | 兩個心願事件：以安 D07、語彤 D13（AA-B；原稿 `AA_127` 第 1、2 節，台詞一字不改） | `python3 build_wish_aa.py`（原稿 `wish_aa.py`；檢查同 `build_wish.py`） |
| `common_bb.json` | `DATE_LINES_COMMON`：出發、差不多了、取消、放鴿子、一個都沒做就走、合照還不行（五位 × 六種） | `python3 build_common.py`（直接讀 BB_128 3-6 的表） |

## 和地點檔的關係（G33 的「心願本人的 first」）

- **心願本人第一次單獨去她的心願地點，整趟由心願事件取代**（抵達、四個互動點、收尾都用 `wish_bb.json`）。地點檔 `date_system/lines/<LOC>.json` 裡她的 `first` 是 `{"wishEvent":"wish_<id>"}`，指到這裡（`build_wish.py` 會檢查）。
- 第二次以後照地點檔的一般反應（`normal`、`remember`、`dating`）；BB_128「再去 D0x」的句子已經在地點檔裡。
- 互動點的 id、時間、花費、她喜不喜歡和地點檔一致（`build_wish.py` 檢查 id 和喜好）。

## `wish_bb.json` 的欄位

一行：`{who, text}`；`who:'narr'`＝旁白（用「你」），`who:'note'`＝開發註記，**不顯示**。選項：`{t, reply:[行…]}`。

| 欄位 | 意思 |
|---|---|
| `id`、`char`、`loc`、`title`、`source` | 事件 id（`wish_<角色 id>`）、角色、地點、標題、原稿出處 |
| `wish`、`rule` | 給開發的說明（不顯示）。`rule` 是這一位特別的限制（學姊只在 `SIS_HEALED` 以後；沛珊雙方單身或她是女友；可昕不寫家鄉） |
| `record` | 完成時記：`flag`＝`WISH_DONE_<id>`（**第一次和她單獨去她的心願地點就算完成，不管哪一年**，`AA_128` 第 6 節）、`memory`（`SOCIAL.remember(她, tag)`，text 是記憶的說明）、`album`（Life Album 那一張） |
| `mention` | **聊天提到**（記 `SOCIAL.remember(她,'WISH_KNOWN')`）：`if` 條件、`where` 在哪裡說、`lines`、`choices`。只說一次 |
| `herInvite` | **她主動約**：`if`、`rule`（`AA_128 4-5`：她自己有伴侶、或她知道祐廷有伴侶時不約）、`perTerm`（每學期最多一次；BB_128 第 3 節共同規則：**每位都是每學期最多一次**、玩家拒絕不扣分不鎖線、至少隔 4 週才可能再問）、`dateWeekday`（0＝日）、`dateTime`（約的時間，14.5＝14:30）、`message`（訊息什麼時候傳）、`lines`（訊息）、`accept`（答應：建立行程 `by:'her'`、`wish:true`）、`decline`（這週不行，不扣分）、`linesIf`（換掉整段訊息的版本） |
| `playerInvite` | **玩家主動約她去**：`known`（已經 `WISH_KNOWN`）、`unknown`（還不知道；**這一次也算完成心願**）。學姊的 `if` 是 `SIS_HEALED`；沛珊大二下 `retakeTerm` 只答應 D06 |
| `arrive` | 抵達：`narr` 旁白、`lines`、`extraIf`（條件成立的**都**多說，照順序；交往中和第 6 階單身互斥，所以關係那句只會有一句）、`admission`（有門票，抵達時扣，`AA_128`） |
| `fixed` | 固定活動（芷若的看電影，120 分，不算互動點） |
| `hotspots` | 四個互動點：`name`、`minutes`、`cost`（祐廷自己的那份）、`like`、`lines`、`choices`。選項可以有 `if`（不成立就不出現）、`cost`／`extra`（選了才另外扣）、`replyIf`（條件成立時**換掉** reply；取第一個成立的）、`extraIf`（條件成立時在 reply 後面**多說**） |
| `closing` | 收尾（**心願場景，第一次一定播**）：`lines` → `timeline`（`insertAfter:N`＝在第 N 行後面插入；條件成立才有）→ `choices` → `after`（條件成立的都說，照順序）→ `ending`（依關係的結尾，**取第一個成立的**；`if:{}`＝其他情況） |
| `repeat` | 第二次以後去哪裡找台詞 |

### 條件（`if`）

照 `EVENTS.cond`（`flags`、`notFlags`、`flagIs`、`memory`、`events`、`any`…），另外加四個（給 LAWWW-B 實作）：

| key | 意思 |
|---|---|
| `dateStage:{min,max}` | 她的關係階段，照 `AA_126` 4-1 的 1～6 階（第 4 階好朋友、第 5 階願意私下約會、第 6 階能約情人節／告白門檻）。**不是** `SOCIAL.STAGES` 的序號 |
| `datingHer` | `true`＝她就是祐廷的女友（旗標 `dating_<她的 id>`，`AA_123` 第 2 節）；`false`＝不是 |
| `term`、`termFrom` | 學期（`Y2S2` 等）；`termFrom:'Y4S1'`＝大四以後（延畢的玩家照遊戲學期算） |
| `unless` | 放在 `if` 裡：裡面的條件成立時，這一條不成立 |

- 原稿寫「第 5 階」「第 6 階（單身）」「交往中」的地方：交往中＝`datingHer:true`；第 6 階（單身）＝`dateStage.min 6`＋`datingHer:false`；第 5 階＝其他情況（`if:{}`）。
- 用到的旗標與事件：`WATCHED_FILM`（芷若的記憶，Z5 兩個人看）、`ev_zhiruo_third_row`（Z11b 倒數第三排，**還沒實作，id 由 LAWWW-B 定**）、`ATTENDED_SHOW`（子晴 Q12 發表會）、`SIS_HEALED`、`ev_sis_empty_flask`（W4）、`SIS_BEEN_US`（學姊去過美國以後，**暫名**）、`ev_peishan_syllogism`（P2b）、`ev_kexin_trip_spring_y1`（K8）、`KX_TRIP_DEFERRED_DONE`（K8 延到暑假那一趟走完，**暫名**）、`KX_TRIP_Y1S2:'sea'`（K8 選海邊）、`ev_kexin_k18`（K18）、`EX_kexin`（和可昕分開過，`AA_123`）。暫名的請 LAWWW-B 換成實際的旗標，告訴 BB-B。
- `abroadBlock`：她在國外（芷若在英國、學姊在美國）時不提、不約。`notExamWeek`：那週不是考試週。`noBreaks`：寒暑假不約。`needsCar`：要開車（祐廷台北有車）。

## `common_bb.json`

`lines[角色][key]`＝好幾套，**擇一、輪流**（排除最近用過的）；一套是依序說的幾行。可昕的 `noPair` 只在 `EX_kexin`（分開以後）才說——交往中一定可以合照。`rules` 是取消、放鴿子的規則（`AA_128` 4-3）。

## 驗收（BB 看的，照 `BB_128` 2-10）

心願事件第一次一定播收尾；`WISH_DONE` 不管哪一年都算；她主動約每學期最多一次、拒絕不扣分；玩家自己約、她還不知道心願時也算完成；第二次去改用地點檔；直向、橫向的對話框不切字。

- **D13 語彤第二次以後**（BB-B 2026-10-16）：`BB_128` 5-1 寫「照 `AA_127` 2-6」的抵達、收尾，之前沒轉進 `lines/D13.json`（是空的）；已在 `lines/md_to_json_D13.py` 補上：抵達三句照 AA_127 2-6、收尾兩句照 BB_128 5-1、`remember`＝「上次看到最後了。今天……也看到最後。」

## AA 的兩位另外用到的（`wish_aa.json`；AA-B 2026-10-16）

**同一個格式**：地點檔 D07、D13 裡以安、語彤的 `first` 都是 `{"wishEvent":"wish_heroine_01"}`、`{"wishEvent":"wish_heroine_03"}`（`build_wish_aa.py` 會檢查）。下面這些 key，`wish_bb.json` 沒有用到：

| key | 在哪裡 | 意思 |
|---|---|---|
| `courseWeek:{course,week}` | 條件 | 那門課的第幾週已經上過（以安：`const_1` 第 6 週＝人身自由） |
| `mention.after` | 聊天提到 | 選項之後接著說的句子 |
| `mention.linesIf` | 聊天提到 | 條件成立時**整段換掉**（以安大二下以後的版本，沒有選項） |
| `mention.extraIf`、`playerInvite.extraIf` | 同 `arrive.extraIf` | 條件成立時多說 |
| `notMomCheckup` | 她主動約 | 不在語彤媽媽回診的那個週六（`AA_11` 第 0 節） |
| `dateTime:'sunset-2'` | 她主動約 | 夕陽前約兩小時（`AA_128` 第 8 節的每月日落表） |
| `memory:{tag,text}` | 選項、互動點 | 選了或做了就記（`SOCIAL.remember`） |
| `timeline[].replace` | 收尾 | 條件成立時，把某一句換成這幾句 |

- **暫名**：請 LAWWW-B 換成實際的 id，告訴 AA-B。
  - `ev_an_admin_answer`：以安新 9，行政法「我要改我的答案」。
  - `ev_an_choice_y4`：以安新 18，公法研究所。
  - `ev_yutong_free_thursday`：語彤事件 13，空出來的週四。
  - `GROUP_TRIP_TAMSUI_WITH_YUTONG`：玩家揪過一群人去淡水，語彤也去了。
