# STORY EVENT SCHEMA（v1）

事件資料在 `src/data/events.js` 的 `STORY_EVENTS` 陣列；引擎在 `src/events3d.js`（`EVENTS`）。
未來的事件包只要符合此 schema，放進 `STORY_EVENTS`（或另一個檔案 concat 進去）即可，不需修改引擎。

## Event

```js
{
  id: 'ev_rain_library_door',        // 唯一 id（存檔以此記錄 done/last）
  title: '雨天的總圖門口',             // 觸發時短暫顯示的標題（noTitle 可關）
  participants: ['heroine_03'],      // character_id 陣列；[0] 顯示在右側立繪、[1] 左側；也用於 interact 觸發（participants[0]）
  location: 'campus' | ['library','classroom'] | 'any',
  near: {x, z, r} | {npc:'heroine_03', r},   // auto 觸發用：玩家在座標附近／在某 NPC 附近
  trigger: 'auto' | 'interact' | 'enter',    // auto：每 0.5 秒檢查；interact：與 participants[0] 對話時；enter：進入區域時
  priority: 5,                       // interact 事件之間的排序（高者先）
  time: [18, 23],                    // 小時範圍（可跨夜：[23, 26] 表示 23:00–02:00）
  weekday: [1,2,3,4,5],              // 0=週日 … 6=週六
  day_min: 3, day_max: 40, semester: 1,
  weather: 'rain' | 'clear' | 'cloudy', not_weather: 'rain',
  prereq: { …見 Condition… },
  random_weight: 0.6,                // enter/interact：觸發機率；auto：每分鐘機率（內部 /60）
  cooldown_days: 2, once: true, max_times: 3,
  spawn: { npc:'heroine_03', at:{x,z} | undefined（玩家前方 dist 公尺）, dist:2.2, pose:'idle' },   // 場景需要但不在場的人物，臨時生成
  despawn: 20,                       // 事件結束幾秒後移除 spawn 的人物
  player_seat: [row, col] | null,    // 教室類事件：先讓玩家入座
  background: 'blur' | 'freeze' | {image:'assets/backgrounds/library_night.webp'},   // ADV 背景模式（圖片不存在 → 自動退回 blur）
  mainSide: 'right',                 // 主要立繪在哪一側（選項會排在另一側）
  cg_id: 'cg_library_rain_heroine03',// Event CG（CG_REGISTRY 有且圖片存在才顯示；否則一般 ADV）
  music: null,                       // 預留
  dialogue: [ …Line… ],
  consequences: { …Consequences… },  // 事件結束時套用
  next_event: 'ev_xxx',              // 結束後立刻接續（仍需符合其條件）
  after: (G, GM, npcs) => {}         // 可選：程式碼 hook（例如讓 NPC 走開）；資料包可省略
}
```

### 公共場景、跨學年用的欄位（D52、D55；2026-10-13 事件介面檢查，`tests/events_interface_unit.js`）

```js
{
  term: ['Y1S1','Y2S1'],             // 學期（CALENDAR.termOf）：同一間教室依學期觸發不同事件；寒暑假（null）都不觸發
  room: '101' | ['study','corridor'],// 玩家在建築裡的哪一間（區域的 roomAt）；「走進某一間時」用 trigger:'auto'＋room
  activity: 'lec_xxx', activityPhase: 'justEnded', // 活動的時段（AA_110 5-1）：before（今天還沒開始）／during（進行中，不寫就是這個）／
                                     // justEnded（結束後 20 分鐘內，例：演講散場的走廊）／after（更晚）。舊的 activityJustEnded:true＝justEnded
  // 人物在場的四個等級（AA_110 5-3；台詞寫「旁邊、對面、同一張桌子」的一定要用 npcNear）：
  npcZone: 'heroine_02',             // 照作息和玩家在同一個區域（舊的 npcHere 是同一件事）——可以寫「我也在博雅」的訊息、「可能」的偶遇
  npcRoom: 'heroine_02',             // 在同一間（教室、自習區、走廊；區域的 roomAt）：人物在場景裡看實際位置，不在就看作息的 room——「她也在自習區」
  npcPresent: 'yu',                  // 人物真的放在場景裡、玩家看得到——「你看到她」（要聊天還要走過去）
  npcNear: 'yu', nearDist: 2.5,      // 在互動距離內（預設 2.5 m、同一層），或和玩家坐同一張桌子（座位的 table）——對話、並肩坐著、遞東西
                                     // 以上都可以寫一個 id 或陣列（陣列＝每一個人都要成立）
  tier: 'short' | 'major',           // 層次（BB_105 第 1 節，AA_107 第 9 節第 5 項）：short＝同一棟一次進入最多一個、同一天全校最多兩個；
                                     // major＝同一棟一學期最多一個（寒暑假算前一個學期的假期）。不寫＝不受限（現有事件都不寫）
  building: 'dorm_f1',               // tier 的「同一棟」：預設是玩家所在的區域；校園上的門口事件可以另外指定
}
```

- **跳過時間、快速前往**：條件一律用「現在」的時間與地點判斷，跳過去的時間窗就是錯過（不補演）；快速前往先走完路程的時間再進區域，到的時候時間窗已經過了就不觸發。手機的「跳過時間」會在第一個符合的 `auto` 事件（沒有 `random_weight`、沒有 `near`）停下來（`CLS.skipStops`）。同時符合好幾個事件時，靠 `tier` 不會一次全部演完。
- **人物在不在學校**（AA_110 第 3 節；`STORY.presence`）：人物資料可以加 `presence:{from:'Y1S1', until:'Y2S1', absent:['Y3S2'], away:{Y3S2:'在日本交換', after:'在別的學校念書', before:'…'}}`。
  不在的學期（寒暑假算前一個學期）：不會照行程生出來、人物線索寫 away 的文字、課堂沒有反應句、`npcZone`（`npcHere`）不成立。**遊戲資料目前只填了 AA_110 5-7 寫「可以」的那一列**：2025 年入學的這一屆（以安、語彤、阿哲、小語、柏翰、芯慈、明軒、宥辰、沛珊、阿凱、筱涵）`{from:'Y1S1'}`——經濟系那一年還不在（遊戲目前從法律系第 1 天開始，現在玩得到的部分沒有差別）。交換、休學、畢業等其他設定每一筆要 AA 確認、使用者批准（人物的重大設定，D50 第③級）。溫書瑀高兩屆，課堂反應句一律不放她（`classes3d.js` 的 reactOK）。
  **填「學期中不在」的資料之前要一起處理（2026-10-13 審查第 15 項）**：`story3d.js` 有些人物是寫死在區域裡生出來的，不經過行程（例如 Café 19–23 點的溫書瑀 `'sis'`、總圖閱覽室、萬才館的 `'sis'`，第一二天的劇情人物、跟著走的小安 `spawnCompanion`）。這些地方還沒有看 presence；第一次填某個人的 presence 時，要把她寫死的生成一起加上 `STORY.present` 的判斷，並加測試。
- **事件層次上限**：短篇（short）每一棟每次進入一個（`ev.building`，沒寫就是區域；校園上不同門口各算）、全校一天兩個；重要（major）每一棟每學期一個。**續篇（next_event）**接著前一段演，不受上限、也不另外算一次（2026-10-13 審查第 14 項）。
- **出席怎麼算**（AA_110 5-2；`src/data/activities.js` 的 `track`，`tests/aa110_systems_unit.js`）：活動進行中、過一半以前坐在那一間＝開始記；結束的時候還在那一間（坐著、站著都算）＝聽完；結束前走出那一間、或快速前往別處＝中途離開；座位上「坐一下」「讀書」跳過的時間＝一直坐在那裡（開始前坐下、一路跳到結束以後＝聽完）；從別處跳過活動時段、只是站在門口＝沒去。選「聽演講」＝坐著快轉到結束＝聽完（已經中途離開過的那一場，回來再聽照樣是中途離開）。
- **習慣記憶的鍵**（AA_110 5-4；`src/game3d.js` 記、`src/events3d.js` 存）：一天最多算一次；人物一律寫 character_id。
  - `place:區域:時段`（morning 5–11、noon 11–14、afternoon 14–17、evening 17–19、night 19–5）、`place:區域:with:人物`（走進去時帶著的同伴）：走進一個區域時記，讀檔不算。
  - `seat:區域:那一間或那一區`（建築裡的教室 `seat:putong:101`、社科院圖書館 `seat:soclib:window`；沒有的寫座標 `seat:campus:@95,-70`）、`table:區域:桌子`（`table:soclib:rt2`、法圖 `table:lawlib:T1`）、`seat:區域:with:人物`（坐下時 2.5 m 內、同一層，或帶著的同伴）：坐下時記。
  - `meal:店`、`meal:店:with:人物`（店＝`noodle` 麵店、`cafe` 兩點半 Café、`cvs` 便利商店）：在店裡坐下時記。
  - 用法（AA_110 5-4）：一句話的回應、少數幾次在學期末被提起；一個習慣最多被提起一次（用 `once` 或 `notEvents`），**不能變成懲罰**（沒有習慣的玩家不會少任何東西）。
- **邀約的一般規則**（D54 ⑥；使用者 2026-10-11 的七點；`src/invites3d.js`，`tests/invites_unit.js`）：當面（和人說話時「約他／她去…」）或手機（「朋友」的「約」，要有聯絡方式）約去四個地方，選時間（現在一起過去／今天幾點／明天）。
  對方答不答應：這學期在不在學校 → 關係（Café、總圖剛認識就可以；吃飯要「熟悉」；散步要「朋友」）→ 下雨（散步改 Café）→ 開沒開 → 你或對方那時候已經約了 → 那時候的作息（上課、打工、社團、幫忙、助教）。
  「改天」一定附一個具體的時間，玩家可以答應。約好的時間人在那個地方（作息被覆寫，人物線索、npcZone 一樣）；走過去和對方說話＝見面（一起待一段時間、一筆小記憶、熟一點點，不推進戀愛）；
  過了 45 分鐘沒去＝沒赴約（不扣分，留一筆「放過鴿子」）。**每個人的個性**（答應、拒絕的方式，見面時說什麼）放在 `INVITE_DATA.people[人物]`：
  `{reply:{busy:'…', rel:'…', booked:'…', accept:'…'}, scene:{cafe:['…','…']}}`——使用者批准後才填；沒填的人用旁白（不替人物編台詞）。
- **出錯**：事件演到一半出錯（例如資料寫錯）不記成演過，這次遊戲不再重試（`EVENTS.failed`，不存檔），不會每半秒重演。

## Condition（prereq / line.if / choice.if）

```js
{
  flags: ['classDone'], notFlags: ['anSkipped'],
  memory: [{npc:'heroine_03', tag:'SHARED_UMBRELLA'}], notMemory: [...],
  stage: {npc:'heroine_02', min:'FAMILIAR', max:'CLOSE_FRIEND'},   // 見 CHARACTER_SCHEMA 的關係階段
  rel: {heroine_02: {trust:{min:20}, fam:{max:60}}},
  events: ['ev_studygroup_wed'], notEvents: [...],                    // 已完成的事件
  knowledge: [{qid:'Q041', min:'learned'}],                            // 法律知識狀態（unseen<seen<confused<learned<understood<mastered）
  grad: {min:'CURIOUS'},                                               // 研究所志向階段
  energy: {min:20}, money: {min:150},
  choice: {cafeView:'C'},                                              // 玩家過去的選擇（G.choices）
  flagIs: {ECON_PAST_SHARED:['full','half']},                          // 旗標的值（flags 只看有沒有設）；值可以是一個或陣列
  attended: ['lec_xxx'], notAttended: [...], missed: ['lec_xxx'],      // 演講、活動出席（AA_110 5-2）：attended＝聽完過（full）；notAttended＝一場都沒聽完；
                                                                       // missed＝最近結束的那一場沒去（中途離開不算沒去）
  attendedAny: ['lec_xxx'],                                            // 聽完或中途離開（partial）都算
  attendedWithin: {lec_xxx: 1},                                        // 最近一次聽完是 N 天內（「隔天的版本」：今天或昨天＝1）；散場後的事件用 attended＋activityPhase:'justEnded'
  habit: {key:'table:boya:rt2', min:4, withinDays:21},                 // 習慣記憶（AA_110 5-4）：最近 withinDays 天裡做過 min 天（一天最多算一次；不寫 withinDays＝全部）；可以寫陣列
  course: {econ_principles_1: {min:1}},                                // 上課出席次數（G.courses.attend）
  custom: (G, GM) => boolean                                           // 程式 hook（資料包可省略）
}
```

## Line

```js
{ speaker:'heroine_03', text:'……我沒帶傘。', expression:'neutral', outfit:'campus', position:'right' }
{ speaker:'player', text:'反正我也要往校門走。' }          // 玩家台詞（不顯示立繪）
{ speaker:null, text:'總圖門口的屋簷下站著一個人。' }       // 旁白
{ label:'share' } / { goto:'end' } / { end:true }
{ if:{…}, speaker:…, text:… }  { unless:{…}, … }             // 條件行
{ set:{flag:value}, mem:[{npc,tag,note}], rel:{npc:{fam:+3}}, note:{id,title,body}, advance:0.5, knowledge:{qid,state}, consequences:{…} }   // 行內立即套用（consequences 同事件層格式）
{ legal:{ context:'class'|'classmate'|'study'|'quiz', by:'prof_lin', pick:{section:'…', type:'tf'|'mc', prefer:'confused'} | qid:'Q041', chorus:'classmate_bohan', quiet:false } }   // 問一題（見 LEGAL）
{ choice:[ { text:'「一起走吧。」', hint:'你有傘', if:{…}, dim:false,
            consequences:{…}, set:{…}, mem:[…], rel:{…}, choiceKey:'rainChoice', value:'share',
            goto:'share' | next:'ev_xxx' | end:true } ] }
```

文字可用 `{name}`（玩家名）與 `{npc:heroine_03}`（依揭露階段顯示的名稱）。

`speaker` 可以寫人物 id，也可以寫稱呼：CHARACTERS 的 alias（例：`'阿勳'`），或只有立繪、不在 CHARACTERS 的人物（`src/data/characters.js` 的 `PORTRAIT_ONLY`，例：可昕的室友 `'予樂'`／`'yule'`）——立繪照 id、對話框的名字照原文（寫 id 的用登錄的名字）。都對不到的稱呼（例：`'邵鈞'`、`'大伯'`）沒有立繪，照舊 compact 對話。

## Consequences

```js
{ flags:{…}, mem:[{npc,tag,note}], rel:{npc:{fam,trust,aff,resp,comf,rom,npcRom}},
  prof:{prof_xu:{kind:'office'|'perf'|'part'|'research'|'rep', delta:2, note:'…'}},
  grad:{bump:'原因', field:'公法'} | grad:{set:'CONSIDERING', field:'…'},
  energy:-6, money:-150, advance:0.5(小時), memo:'日誌文字', note:{id,title,body},
  knowledge:{qid,state} | {study:'章節'}, goal:'目標列文字', cg:'cg_id' }
// 手機與邀約（D54 ⑥，src/invites3d.js；人物的內容由 AA、BB 寫、使用者批准後才放）：
{ contact:'heroine_02' | ['heroine_02','zhe'],                        // 拿到聯絡方式（使用者第 2 點：認識的人才有；開場有阿哲、阿凱）
  invite:{who:'zhe', place:'noodle', day:0, h:19, text:'手機上那則訊息'},   // 對方約你（day＝幾天後，0＝今天）：手機「訊息」有答應／改天／不了
  inviteChange:{who:'zhe', to:{day:1, h:19}|null, text:'…'} }           // 對方臨時改約（to:null＝這次取消）：好／那就下次／沒關係，我自己去
// place：cafe（兩點半 Café）、library（總圖）、noodle（公館吃飯：阿鳳麵店）、wenzhou（溫州街散步）——src/data/invites.js
```

## 存檔

`G.events = {done:{id:count}, last:{id:day}, count, cap:{day, n, major:{'學期|區域':事件id}}}`（cap＝tier 的上限紀錄）；`G.acts.att = {'活動id@第幾天': {h, end:'full'|'left'|'in', lh}}`（演講、活動出席：h＝開始聽的時間、end＝聽完／中途離開／還在聽（查詢時算中途離開）、lh＝離開的時間；舊存檔的 `{h}`＝聽完、沒有紀錄＝沒去）；`G.habits = {鍵: {n, first, last, days}}`（習慣記憶：做過幾天、第一次、最近一次、最近 60 次是哪幾天；舊存檔沒有＝都還沒有）；`G.invites`（邀約：who、place、day、h、state＝offered／accepted／going／done／missed／declined／cancelled／changed）、`G.msgs`（手機訊息，最多 200 則）、`G.contacts`（聯絡方式：人物 → 第幾天拿到）——舊存檔沒有＝空的；`G.social`（關係／記憶）與 `G.legal`（知識）另見各自 schema。

## 設計原則（來自需求）

- 事件不是純隨機：條件（地點、時間、天氣、關係、記憶、課程、冷卻）決定可觸發集合，再以 random_weight 抽。
- 小事件（下雨沒傘、搶插座、半夜室友）與大事件（雨天門口、讀書會）共用同一套 schema。
- 選項代表個性／優先順序／時間分配，不標示「正確答案」，不顯示數值。
- 後續事件引用記憶（`memory` 條件＋`{if}` 行），讓 NPC「記得」。
