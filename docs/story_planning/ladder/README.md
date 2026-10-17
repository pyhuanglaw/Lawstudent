# 閒聊階梯資料（大一上；使用者 2026-10-15 全案通過，直接實作。大一下起一學期一個檔，2026-10-16）

- **經濟系大一（Y0S1、Y0S2，v0）**：可昕、品妤、唐睿、阿勳、韋綸：`ladder_bb_y0s1.json`（K0／PY0／TR0／XN0／WL0-L1～8）、`ladder_bb_y0s2.json`（K0b／PY0b／TR0b／XN0b／WL0b-L1～8；可昕整學期都在交往，第 1 週起〔2026-10-17 BB-C，AA_218 第 10 節：2024-10-17 交往〕；大一上的可昕 K0-L1～L8 只到第 6 週（交往前，不讀 `dating_kexin`、都 `skipAfterWeek:6`），後面接交往後的 K0-Lx1～Lx8（第 7～16 週，`if` 只放 `dating_kexin`），一共 16 層〔2026-10-17 BB-C（照 AA_235 71d62646）〕）；原稿說明 `../BB_146`；`build_ladder_bb_y0s1.py`、`build_ladder_bb_y0s2.py`；BB-B 2026-10-16（AB-20）。

- `ladder_bb.json`：BB-B 的芷若（heroine_02）、子晴（heroine_04）、溫學姊（heroine_05；S-L3、S-L6 已刪，目前 6 層，AA 補 2 層）、沛珊（classmate_peishan）、可昕（kexin）＋室友阿凱宿舍事件（`kaiDorm`）。原稿 `../BB_130_閒聊階梯_芷若子晴學姊沛珊_室友阿凱.md`；由 `build_ladder_bb.py` 產生（改台詞改 .py，再跑一次）。
- `ladder_aa.json`：AA-B 的以安（heroine_01）、語彤（heroine_03）。原稿 `../AA_135`、`../AA_136`；由 `build_ladder_aa.py` 產生。
- **大一下（Y1S2）**：`ladder_aa_y1s2.json`（以安 A2-L1～8、語彤 Y2-L1～8；原稿說明 `../AA_139`；`build_ladder_aa_y1s2.py`）。芷若、子晴、學姊、沛珊、可昕的大一下：`ladder_bb_y1s2.json`（Z2／Q2／S2／P2／K2-L1～8；原稿說明 `../BB_133`；`build_ladder_bb_y1s2.py`；BB-B 2026-10-16）。
- **大二上（Y2S1）**：`ladder_aa_y2s1.json`（以安 A3、語彤 Y3；`../AA_141`）；芷若、子晴、學姊、沛珊、可昕：`ladder_bb_y2s1.json`（Z3／Q3／S3／P3／K3-L1～8；原稿說明 `../BB_136`；`build_ladder_bb_y2s1.py`；BB-B 2026-10-16）。**大二下（Y2S2）**：`ladder_aa_y2s2.json`（以安 A4、語彤 Y4；`../AA_142`）；芷若、子晴、學姊、可昕：`ladder_bb_y2s2.json`（Z4／Q4／K4-L1～8、學姊 S4 9 層；**沛珊沒有**：她 2026-12-17〔大二上第 15 週〕P4 交接以後重考、聯絡不到，`../BB_194` §19，這學期 `characters` 裡沒有她，`--check` 的層數只檢查有出現的人，不用例外；原稿說明 `../BB_138`；`build_ladder_bb_y2s2.py`；BB-B 2026-10-16；2026-10-17 BB-C 照 `AA_255` 附錄 B 口語審改）。**大三上（Y3S1）**：`ladder_aa_y3s1.json`（以安 A5、語彤 Y5；`../AA_149`；路線差別用 `linesIf` 的 `flagIs:{EXCHANGE_ROUTE}`）；子晴、學姊、沛珊、可昕：`ladder_bb_y3s1.json`（Q5／S5／P5／K5-L1～8，學姊 S5 8 層（S5-Lx1 是 AA_234 補的，取代刪掉的 S5-L4）；芷若在英國沒有；原稿說明 `../BB_140`；`build_ladder_bb_y3s1.py`；BB-B 2026-10-16；2026-10-17 BB-C 照 `AA_259` 附錄 B 口語審改，子晴 Q5-L1 用 `linesIf` 分「看過 Q6 或 Q8b 以後」兩版〔`../BB_166` 1-1b〕，給 LAWWW 的清單 `../BB_206`）。**大三下（Y3S2）**：`ladder_aa_y3s2.json`（只有語彤 Y6，給留在台灣的玩家；以安在日本，日本路線走 2D，`../AA_150`）；芷若、子晴、學姊、沛珊、可昕：`ladder_bb_y3s2.json`（Z5／Q6／S6／P6／K6-L1～8；學姊碩二下在台灣，~~只給台灣、美國路線〔每層 `unless` EXCHANGE_ROUTE＝JP〕~~**三條路線都給**（2026-10-17 BB-C，AA_260 附錄 B 第 5 節第 8 點：日本路線 3/25 以前在臺灣照台灣版，之後 3D 遇不到）；美國交換改到大四上〔BB_183〕，大三下美國路線的玩家在台灣；可昕三條路線都有、沒有 `dateOnly:'meet'`；原稿說明 `../BB_141`；`build_ladder_bb_y3s2.py`；BB-B 2026-10-16；**2026-10-17 BB-C 照 `AA_260` 附錄 B 口語審改**〔子晴 Q6-L3、Q6-L6 是發表會以前的話，用 `skipAfterWeek` 13；學姊層的順序 口試 → 結果 → 簽證；和學姊交往中的美國路線玩家在 S6-L5 多一句 `extraIf`〕，給 LAWWW 的清單 `../BB_208`）。**大四上（Y4S1）**：`ladder_aa_y4s1.json`（以安 A7、語彤 Y7；`../AA_151`）；沛珊、可昕：`ladder_bb_y4s1.json`（P7／K7-L1～8；學姊碩三上在美國交換、美國路線的玩家也在美國，學姊沒有階梯〔2026-10-17 BB-C〕；芷若在英國、子晴已畢業只有手機；原稿說明 `../BB_142`；`build_ladder_bb_y4s1.py`；BB-B 2026-10-16；2026-10-17 BB-C 照 `AA_262` 附錄 B 口語審改：沛珊 P7-L2／L4／L8 拿掉 2-7 句型、招呼「課輔班」「吃早餐」移到 when，可昕 K7-L2 的 `linesIf` 順序改成 `KX_STUDY_PLAN` 在前）。**大四下（Y4S2）**：`ladder_aa_y4s2.json`（以安 A8、語彤 Y8；`../AA_152`）；學姊、沛珊、可昕：`ladder_bb_y4s2.json`（S7／P8／K8-L1～8；芷若在英國、子晴只有手機；這學期只到第 15 週（2029-06-02 畢業，AA_128 11-1；第 16 週以後沒有自由時間），所有週次上限都是 15〔2026-10-17 BB-C（BB_199，16 週制）〕；原稿說明 `../BB_143`；`build_ladder_bb_y4s2.py`；BB-B 2026-10-16）。以安、語彤四年八學期的階梯到這裡寫完。
- **週次範圍（2026-10-17 BB-C（BB_199，16 週制））**：16 週制（AA_197 1-6）：第 1～15 週上課，第 16 週期末，第 17 週起放假，**假期不推進學期階梯**（待 LAWWW 實作確認；假期有自己的閒聊，AA_197 1-2）；所以各檔的 `week` 上限都是 16（原本的 17、18 已改掉）。大四下到第 15 週（畢業），上限 15。
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
| `friendOnly` | 學姊：她沒有男朋友，只是筆試（2026-02-02）前不想交往（BB_122 ★節），階梯只有朋友的話（已經寫成這樣，不用另外處理；只是提醒不要接戀愛選項）（2026-10-17 BB-C） |
| `context:'date'`、`dateOnly` | 可昕：**只在「我們的日子」見面或視訊時推進**（不在路上）；`dateOnly:'meet'` 只在見面、`'video'` 只在視訊。沒有 `dating_kexin` 就停。各學期的 L7 已經拿掉 `dateOnly`（2026-10-17 BB-C（BB_199，16 週制）：第 15 週以後不能限見面／視訊，這裡沒有「只限到某週」的欄位，所以整層拿掉） |
| `greet.base` | 當天推進過、或條件不到時的短招呼：5 句輪替、不連續重複 |
| `greet.when[]` | 情境句：符合 location／time／weekday（芷若另有 `working`）時**優先**用；一天只說一次同一句 |
| `dayMin` | （AA）遊戲第幾天以後（開局那天是第 1 天）；以安 A-L1＝第二天的事件之後 |
| `locTime` | （AA）`{zone:{weekday,time}}`：在這個 zone 只有這些時段才推進（語彤在麵店只有週二、四 20:00～20:30 客人少的時候）；其他 zone 照一般條件 |
| `greet.when[].weather`、`.week` | （AA）情境句也可以看天氣（`'rain'`）、週次範圍 |
| `greet.when[].if`／`.unless`、`weather` 陣列 | （BB-C 2026-10-17）情境句也可以放 `if`／`unless`（`ladCtxOk` 本來就讀；例：子晴 Y2S2「今天公館的騎樓很吵」只給有 `ZQ4_GONGGUAN_NIGHTS` 的玩家）；`weather` 可以寫陣列（例：學姊 Y2S2「總圖人好多。我在湖邊看書。」＝`['clear','cloudy']`，不下雨才說） |
| `greet.when[].weekParity` | （BB 2026-10-16）`'odd'`＝只在單週（第 1、3、5…週）說，`'even'`＝只在雙週。目前沒有用到（學姊「今天法服值班」2026-10-17 已刪：她不參加法服週六服務） |
| `linesIf` | （AA 2026-10-16）`[{if?／unless?, lines}]`：第一個條件成立的那一套**取代**這一層的 `lines`（選項照用）。例：語彤 Y-L1 只在麵店認識的玩家 |
| `extraIf` | （AA 2026-10-16）`[{if?／unless?, lines}]`：條件成立時，在這一層的 `lines` 後面**多說**這幾句。例：語彤 Y-L5 傘給她的玩家 |
| `skipIf` | （AA 2026-10-16 提議，BB 的 Q-L3 用）條件成立時，這一層**直接算過**（記層數、不播、不算今天推進），避免 `if` 用 `notMemory` 讓階梯永遠卡住 |
| `skipAfterWeek` | （BB-C 2026-10-17）數字 N：這學期過了第 N 週、這一層還沒推進，就直接算過（同 `skipIf`：記層數、不播、不算今天推進）。給只在某一週說得通的層（`EVENTS.cond` 沒有週次，`skipIf` 擋不到）。例：學姊 S2-L3（放榜前，第 3～4 週）、S7-L3（口試倒數九十八天，第 1 週）、子晴 Q4-L4（芷若在等信，第 4～11 週；AA_255 附錄 B C12）。`build_ladder_bb_y2s2.py` 的 `--check` 把它當成和 `skipIf` 一樣的防卡關（週次上限不到 16 也可以） |
| `ZZ_DATING` 旗標 | （BB-C 2026-10-17）芷若×子晴 `ZZ.state==='dating'`（`../BB_194` §23）。LAWWW 在狀態變成 dating 時設。用在子晴 Q3-L7、Q4-L4、Q5-L5、Q6-L4 的 `linesIf`（交往中的版本；AA_234） |
| `extraIf[].mem` | （BB-C 2026-10-17）這一組播了就 `SOCIAL.remember(她, tag)`。用在 `AA_232` 4-1 的鋪陳句（`ZR_ZQ_SETUP_DOOR`、`ZR_ZQ_SETUP_FILM`、`ZQ_ZR_SETUP_ROUTE`、`ZQ_ZR_SETUP_STUCK`）：大一上主要的層播過，大一下的後備層就用 `notMemory` 不再播 |
| `linesIf`／`extraIf` 的 `if`＋`unless` | 同一組可以同時有 `if` 和 `unless`，兩個都要符合（例：芷若的「我室友」版本給還不認識子晴的玩家） |
| `workShifts` | （BB-C 2026-10-17）人物層級：她算「在上班」的時段。芷若大三下＝週三、週四 19～22（AA_234 決定 5）；`daily_schedule` 的咖啡師班也要照這兩晚 |
| `linesIf`／`extraIf` 的 `week`、`location`、`time`、`weekday` | （AA 2026-10-16）除了 `if`／`unless`（EVENTS.cond，沒有週次），每一套也可以放和層一樣的 `week` 等篩選；全部符合才用這一套。例：以安 A2-L3 第 7 週以後杜鵑花謝了，改說「三月拍了」 |
| `note` | 實作提醒（**不放要播的台詞**；要播的變化用 `linesIf`／`extraIf`） |

## 給 LAWWW-B：`kaiDorm`（宿舍事件 K-D1～6）

寫成 `events.js` 的事件（trigger:'interact' 對阿凱、或回宿舍時 auto）；欄位是規格，不是引擎格式：`perWeek`（一週最多一次）、`random`（三選一的結果）、`count`／`inc`（計數旗標）、`nextMorningEnergy`（隔天早上精力）、`daysAfter`、`fallback`（沒和好的第 4 天自動和好，**不鎖線**）。

## 測試（使用者 2026-10-15 交付標準第 4 點）

一天只推進一層；同一層不重播；條件不到給短招呼；短招呼情境句；存讀檔後層數不變；舊存檔（沒有 ladder 欄位）從第 1 層開始；直向、橫向的對話框；芷若上班中不推進；可昕只在見面／視訊推進；阿凱吵架後第 4 天一定和好。
