# 閒聊階梯資料（大一上；使用者 2026-10-15 全案通過，直接實作。大一下起一學期一個檔，2026-10-16）

- `ladder_bb.json`：BB-B 的芷若（heroine_02）、子晴（heroine_04）、溫學姊（heroine_05）、沛珊（classmate_peishan）、可昕（kexin）＋室友阿凱宿舍事件（`kaiDorm`）。原稿 `../BB_130_閒聊階梯_芷若子晴學姊沛珊_室友阿凱.md`；由 `build_ladder_bb.py` 產生（改台詞改 .py，再跑一次）。
- `ladder_aa.json`：AA-B 的以安（heroine_01）、語彤（heroine_03）。原稿 `../AA_135`、`../AA_136`；由 `build_ladder_aa.py` 產生。
- **大一下（Y1S2）**：`ladder_aa_y1s2.json`（以安 A2-L1～8、語彤 Y2-L1～8；原稿說明 `../AA_139`；`build_ladder_aa_y1s2.py`）。芷若、子晴、學姊、沛珊、可昕的大一下：`ladder_bb_y1s2.json`（Z2／Q2／S2／P2／K2-L1～8；原稿說明 `../BB_133`；`build_ladder_bb_y1s2.py`；BB-B 2026-10-16）。
- **大二上（Y2S1）**：`ladder_aa_y2s1.json`（以安 A3、語彤 Y3；`../AA_141`）；芷若、子晴、學姊、沛珊、可昕：`ladder_bb_y2s1.json`（Z3／Q3／S3／P3／K3-L1～8；原稿說明 `../BB_136`；`build_ladder_bb_y2s1.py`；BB-B 2026-10-16）。**大二下（Y2S2）**：`ladder_aa_y2s2.json`（以安 A4、語彤 Y4；`../AA_142`）。**大三上（Y3S1）**：`ladder_aa_y3s1.json`（以安 A5、語彤 Y5；`../AA_149`；路線差別用 `linesIf` 的 `flagIs:{EXCHANGE_ROUTE}`）。**大三下（Y3S2）**：`ladder_aa_y3s2.json`（只有語彤 Y6，給留在台灣的玩家；以安在日本，日本路線走 2D，`../AA_150`）。芷若、子晴、學姊、沛珊、可昕的大一下由 BB-B 寫（`ladder_bb_y1s2.json`，之後）。
- **一學期一個檔（給 LAWWW-B）**：每個檔的 `term` 決定它在哪一學期推進；進度記在 `G.social.ladder[term][層 id 所屬角色]`（或用 `term:角色` 當 key），**換學期就從新檔的第 1 層開始**，上學期沒走完的層不帶過去（新學期的台詞不假設玩家聽過上學期哪一層，要接的用 `linesIf`／`extraIf` 看記憶）。舊存檔：沒有 term 的進度當成 Y1S1。

## 給 LAWWW-B：欄位

| 欄位 | 意思 |
|---|---|
| `steps[]` | 依序推進。**每人每天最多推進一層**；推進記 `G.social.ladder[id]=層的序號`、`ladderDay[id]=G.day`。存檔新欄位，舊存檔預設 0 |
| `if`／`unless` | 照 `EVENTS.cond`（stage、events、memory、notMemory、flags、notFlags、flagNum）。**新增 `any:[cond,…]`**：其中一個成立就算 |
| `term`、`week`、`location`、`time`、`weekday` | 和 `SMALLTALK` 的 `ok()` 一樣（location＝zone id；time＝[h0,h1)；weekday 0＝日） |
| `unlessWorking` | 芷若：她的日程現在是 `act:'barista'`（在吧檯上班）就不推進，只給短招呼的 `working` 句 |
| `unlessWeekdayTime` | 這個星期幾＋時段不推進（學姊週五傍晚和陳助教吃飯） |
| `lines` | 她說的話（依序）；`choices`（最多 2）＝玩家回答，`reply`＝她的收尾；沒有 `choices` 的層，她說完就結束 |
| `rel`（層）＋`choices[].rel` | 加在她身上（fam、comf、trust、resp）；兩者相加 |
| `mem`（層或選項）| `SOCIAL.remember(她,'TAG')` |
| `friendOnly` | 學姊：她有伴侶，階梯只有朋友的話（已經寫成這樣，不用另外處理；只是提醒不要接戀愛選項） |
| `context:'date'`、`dateOnly` | 可昕：**只在「我們的日子」見面或視訊時推進**（不在路上）；`dateOnly:'meet'` 只在見面、`'video'` 只在視訊。沒有 `dating_kexin` 就停 |
| `greet.base` | 當天推進過、或條件不到時的短招呼：5 句輪替、不連續重複 |
| `greet.when[]` | 情境句：符合 location／time／weekday（芷若另有 `working`）時**優先**用；一天只說一次同一句 |
| `dayMin` | （AA）遊戲第幾天以後（開局那天是第 1 天）；以安 A-L1＝第二天的事件之後 |
| `locTime` | （AA）`{zone:{weekday,time}}`：在這個 zone 只有這些時段才推進（語彤在麵店只有週二、四 20:00～20:30 客人少的時候）；其他 zone 照一般條件 |
| `greet.when[].weather`、`.week` | （AA）情境句也可以看天氣（`'rain'`）、週次範圍 |
| `greet.when[].weekParity` | （BB 2026-10-16）`'odd'`＝只在單週（第 1、3、5…週）說，`'even'`＝只在雙週。例：學姊「今天法服值班」只在單週週六（法服方案 A，`AA_132`） |
| `linesIf` | （AA 2026-10-16）`[{if?／unless?, lines}]`：第一個條件成立的那一套**取代**這一層的 `lines`（選項照用）。例：語彤 Y-L1 只在麵店認識的玩家 |
| `extraIf` | （AA 2026-10-16）`[{if?／unless?, lines}]`：條件成立時，在這一層的 `lines` 後面**多說**這幾句。例：語彤 Y-L5 傘給她的玩家 |
| `skipIf` | （AA 2026-10-16 提議，BB 的 Q-L3 用）條件成立時，這一層**直接算過**（記層數、不播、不算今天推進），避免 `if` 用 `notMemory` 讓階梯永遠卡住 |
| `linesIf`／`extraIf` 的 `week`、`location`、`time`、`weekday` | （AA 2026-10-16）除了 `if`／`unless`（EVENTS.cond，沒有週次），每一套也可以放和層一樣的 `week` 等篩選；全部符合才用這一套。例：以安 A2-L3 第 7 週以後杜鵑花謝了，改說「三月拍了」 |
| `note` | 實作提醒（**不放要播的台詞**；要播的變化用 `linesIf`／`extraIf`） |

## 給 LAWWW-B：`kaiDorm`（宿舍事件 K-D1～6）

寫成 `events.js` 的事件（trigger:'interact' 對阿凱、或回宿舍時 auto）；欄位是規格，不是引擎格式：`perWeek`（一週最多一次）、`random`（三選一的結果）、`count`／`inc`（計數旗標）、`nextMorningEnergy`（隔天早上精力）、`daysAfter`、`fallback`（沒和好的第 4 天自動和好，**不鎖線**）。

## 測試（使用者 2026-10-15 交付標準第 4 點）

一天只推進一層；同一層不重播；條件不到給短招呼；短招呼情境句；存讀檔後層數不變；舊存檔（沒有 ladder 欄位）從第 1 層開始；直向、橫向的對話框；芷若上班中不推進；可昕只在見面／視訊推進；阿凱吵架後第 4 天一定和好。
