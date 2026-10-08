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

## Consequences

```js
{ flags:{…}, mem:[{npc,tag,note}], rel:{npc:{fam,trust,aff,resp,comf,rom,npcRom}},
  prof:{prof_xu:{kind:'office'|'perf'|'part'|'research'|'rep', delta:2, note:'…'}},
  grad:{bump:'原因', field:'公法'} | grad:{set:'CONSIDERING', field:'…'},
  energy:-6, money:-150, advance:0.5(小時), memo:'日誌文字', note:{id,title,body},
  knowledge:{qid,state} | {study:'章節'}, goal:'目標列文字', cg:'cg_id' }
```

## 存檔

`G.events = {done:{id:count}, last:{id:day}, count}`；`G.social`（關係／記憶）與 `G.legal`（知識）另見各自 schema。

## 設計原則（來自需求）

- 事件不是純隨機：條件（地點、時間、天氣、關係、記憶、課程、冷卻）決定可觸發集合，再以 random_weight 抽。
- 小事件（下雨沒傘、搶插座、半夜室友）與大事件（雨天門口、讀書會）共用同一套 schema。
- 選項代表個性／優先順序／時間分配，不標示「正確答案」，不顯示數值。
- 後續事件引用記憶（`memory` 條件＋`{if}` 行），讓 NPC「記得」。
