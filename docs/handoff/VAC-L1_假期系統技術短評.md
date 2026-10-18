# VAC-L1　假期多活動系統：技術短評（LAWWW-C，2026-10-17）

> 給 AA-C 定 `AA_199` 第 3 節的資料欄位用。依據：`AA_197` 1-1～1-6、`AA_198`、`AA_199` 3-1～3-7、7-2～7-5（活動模板＋每年產生、C01～C13、以安的假期計畫、出國旅遊）。
> 程式現況以開發分支 `claude/adoring-meitner-mqzst8` 為準。只是建議，AA 定欄位後照 AA 的版本做。

## 1. 現有的程式能接哪些

| 現有 | 在哪 | 能拿來做什麼 | 要改的 |
|---|---|---|---|
| 學期表 `TERMS`、`termOf`、`kind(day)`（term／break／holiday）、國定假日、颱風假 | `src/data/calendar.js` | 假期的起訖都從 `TERMS` 算，16 週一改，寒暑假的日子自動跟著變 | `weeks:18`→16、期末只有第 16 週（HOLIDAY-SYS 第一步） |
| 法律系寒暑假「在家模式」：`lawBreak`（假期 key／起訖）、`breakMode`、`breakStart`（目前**強制回家**）、`BREAK_SKIP` 旁白、「過幾天」 | `src/home3d.js` | `lawBreak` 直接當「這個假期」的定位；`BREAK_SKIP` 旁白改成「假期日誌」的預設句子 | 拿掉強制回家（`AA_197` 1-3）；快轉選單換成 3-3 的推進選單 |
| 經濟系寒假模式：`H.winter`、`winterRound`、`WINTER_PTS`（一定要停的時間點） | `src/home3d.js` | 「一定會停下的日子」的寫法可以沿用 | `AA_197` 1-3：經濟系寒假也改成同一套 |
| 出遊：`G.outings`（{ev, day, h, place, travel, state}）、出發詢問、轉場、2D 事件、錯過處理 | `src/outings3d.js` | **長期活動的關鍵事件、海外的日子**全部可以用它演（2D 背景＋CG，不做 3D 城市）；錯過照 `outingMissed` | 加「好幾天的行程」：一次排多個事件、中間的日子自動經過 |
| 邀約：`freeAt`、`busyAt`、`nextFree`、`decide`、個人理由（here／plan／acc）、作息 `entAt` | `src/invites3d.js`、`src/data/invites.js` | 衝突判斷（玩家的行事曆＋NPC 的所在地）接在 `decide` 前面；NPC 回「我在＿＿，○/○ 回去」用個人理由的格式 | 加一個「人不在臺北」的檢查（目前只看作息） |
| 校外約會的預約檢查 `DATE.check`（用 `busyAt`） | `src/date3d.js` | 同上，自動跟著 `busyAt` | — |
| 手機：`PHONE.at`（排時間的訊息）、群組、可以回的選項、家人群組 | `src/phone3d.js`、`story3d.js` | 報名通知、錄取公告、截止提醒、家人群組「報名費多少？我轉給你」；海外期間訊息照時差顯示 | 訊息加時區欄位（只影響顯示，時間戳記照臺灣時間） |
| NPC 作息：`daily_schedule`（terms、weeks、noHoliday、if）、`presence`（沛珊已經有 away：在家念書） | `src/data/characters.js`、`story3d.js` 的 `schedEnt`、`reachable`／`present` | 假期作息（`AA_197` 1-4、`BB_171`）寫成 `presence` 的區間：`taipei`／`away`（返鄉）／`abroad` | 把 `presence.away` 推廣成每個人、每個假期的區間表 |

## 2. 資料結構建議：活動模板＋每年產生（AA_199 7-5）

**① 活動模板**（新檔 `src/data/vac_activities.js`，AA 的活動卡直接對到欄位）：

```js
{ id:'C10', title:'加州暑期課', cat:'海外交流', season:'summer',          // summer／winter／both
  type:'weeks',                                                       // day／days／weeks／weekly
  when:{from:{breakDay:8}, len:41},                                    // 放假第幾天開始、幾天；weekly 另加 wd:[1,3]
  slots:['day','night'],                                               // am／pm／eve／day／night
  place:{kind:'abroad', name:'美國加州', tz:-15},                       // taipei／domestic／abroad
  apply:{kind:'apply', open:{term:'S2',week:3}, due:{term:'S2',week:6}, result:{term:'S2',week:9}},  // none／signup／apply／audition／lottery
  prep:['passport'], cost:{amt:200000, payer:'family'},                 // family／self／school／club
  ops:'partial',                                                       // yes／partial／no（期間能不能自由操作）
  npcs:[], keyEvents:[{day:0,ev:'ev_c10_depart'},{day:1,ev:'ev_c10_first'},{day:20,ev:'ev_c10_mid'},{day:40,ev:'ev_c10_last'},{day:41,ev:'ev_c10_back'}],
  firstOnly:true,                                                      // 關鍵事件只演第一次，之後寫進日誌
  credit:{transfer:true},                                              // 回來要辦學分採計
  not:['exchange','graduated'] }
```

**② 每年產生**：不存檔，執行時算出來。
- `VAC.instances(G)`：每個假期（從 `TERMS` 算）× 每張模板，產生 `{key:'C10@Y1S', from, to, applyOpen, applyDue, result, …}`。
- 換學期、改日曆都不用改資料。
- 交換那學期、畢業以後不產生。

**③ 存檔只存狀態**（`G.vac`；這一版不用相容舊存檔）：
```js
G.vac = { reg:{'C10@Y1S':{st:'applied'|'accepted'|'rejected'|'enrolled'|'done'|'cancelled'|'withdrawn', day}},
          seen:{C10:true},                     // 關鍵事件演過（firstOnly）
          plans:[{id, kind:'trip'|'home'|'custom', from, to, place, with:[]}],   // 自己排的（C13 出國旅遊、回家幾天）
          log:[{day, t}] }                     // 假期日誌，一天一行，只留最近兩個假期
```

**④ 行事曆**（手機新 app）：`VAC.dayPlan(G,day)` 把下面幾項合成一天三格，畫在月曆上：
- `G.vac` 的報名活動、自己排的；
- `G.invites`（邀約）；
- `G.outings`（出遊）；
- 校外約會；
- 學期中的課表。

**⑤ 衝突**：`VAC.conflicts(G,from,to,slots,place)`，照 3-2 只看「時段」和「地點」。
- 人不在臺北的日子，臺北所有要到場的都衝突；
- 每週固定的只看那幾格；
- 報名時列出「會缺 7/22、7/24 兩次托福」。

**⑥ NPC 的假期所在地**：`CHARACTERS[id].vac`，或把 `presence` 擴成 `[{break:'S'|'W', from, to, where:'台中', kind:'away'|'abroad'}]`。
- `INV.decide` 先查這個，人不在就回「我在＿＿，○/○ 回去」。
- 以安的假期計畫也從這裡讀，由事件自己判斷玩家報了沒有，報了就遇到。

**⑦ 海外期間**（3-4、7-4）：新的「海外」狀態，做法比照在家模式 `H.at`。
- 不載入 3D；
- 選單只有：日誌、手機、下一個關鍵事件；
- 關鍵事件用 `outings` 的 2D 演；
- 視訊用現有的 `video` 背景；
- 手機訊息照 `tz` 顯示。

**⑧ 推進選單**（3-3，取代「過幾天」）：放在宿舍、家裡的床和書桌。
- `VAC.nextStop(G)` 取下面幾項中最近的一個：
  - 行事曆上的事、報名截止、錄取公告；
  - 要回的訊息、主線和節日的固定日子；
  - 要選擇的事件。
- 跳過的日子一天一天跑：手機規則、NPC 作息、每日小事。不能一次跳到底，不然排好的訊息、事件會漏掉。

## 3. 順序與預估

| 步驟 | 內容 | 預估（LAWWW-C 實際工時） |
|---|---|---|
| 0 | **HOLIDAY-SYS**：16 週、學期運作在最後一科期末考後關掉（課、社課、法服、讀書會停）、假期台詞不出現「明天上課」、拿掉強制回家、推進選單 | 3～4 小時（等 AA_243 的事件週次一起改） |
| 1 | 模板資料＋每年產生＋存檔狀態＋報名／錄取通知＋家人群組付費＋行事曆 app＋衝突 | 約 4 小時 |
| 2 | NPC 假期所在地接進邀約、作息（AA 六位＋BB 九位的表） | 約 2 小時 |
| 3 | 海外狀態＋手機時差 | 約 2 小時 |
| 4 | 每張卡的關鍵事件（台詞 AA_242、AA_244、BB） | 每張約 1 小時 |

## 4. 風險

1. **快轉漏東西**：手機規則、每日小事、作息都是一小時一小時推進的。跳過的日子要一天一天跑；SwiftShader 測試會變慢，要分批。
2. **固定日子的事件**：成績、除夕、主線、重訪日，快轉一定要停下來。要列一張「一定停」的總表，由 AA_183 第 3 節加上各事件的固定日子組成，並寫單元測試。
3. **經濟系寒假改成同一套**：`flow_v0_*` 的回歸測試要跟著改。
4. **交換那學期**：不產生假期活動。**交換前的暑假**照交換學校的開學日縮短（VAC-X1）。
5. **存檔**：這一版不相容舊存檔（使用者 10-16 21:25）。日誌只留兩個假期，避免存檔變大。
6. **美術**：海外的地方不做 3D，只要 2D 背景。背景清單照 VAC-A1，缺的先用深色底加地點字幕。
