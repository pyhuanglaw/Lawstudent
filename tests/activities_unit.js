// 活動與演講（src/data/activities.js）＋條件事件的公共場景介面（src/events3d.js 的 room／activity／npcHere；D55）——不需要瀏覽器。
// 遊戲裡的活動清單是空的（內容等 AA、BB）；這裡用測試資料：
//   某一天的演講（dates）、每週三的社團（學期＋週次＋星期）；進行中、剛結束 20 分鐘、海報提前幾天貼；公告欄的文字（沒有活動時寫「目前沒有」）；
//   事件條件：room（玩家在哪一間）、activity（活動進行中／剛結束）、npcHere（某人照作息在同一個區域）。
// 用法：node tests/activities_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..'); global.window=global;
for(const f of ['src/data/calendar.js','src/data/activities.js','src/events3d.js']) vm.runInThisContext(fs.readFileSync(path.join(ROOT,f),'utf8').replace(/^const (CALENDAR|ACTIVITIES|EVENTS)\s*=/m,'global.$1='),{filename:f});
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const DAY=86400000, dayOf=s=>{ const [y,m,d]=s.split('-').map(Number); return Math.round((Date.UTC(y,m-1,d)-Date.UTC(2025,8,17))/DAY)+1; };
/* 2026-10-13 起遊戲裡有 AA_110 第 6-3 節的一般活動（AA 暫定）：全部 story:false（牽涉人物劇情的要使用者批准才放）；沒有活動的日子公告欄寫「目前沒有」 */
/* 牽涉人物劇情的活動（story:true）只能是使用者批准過的：迎新（交接包 v1 A11，使用者 2026-10-14 解除暫緩：審查通過的直接實作）*/
/* 大一的系籃比賽（交接包 v2 C16，AA_71 2-11；使用者同意 v2 審查通過的直接在開發分支實作，2026-10-14）*/
/* 公法讀書會（交接包 v2 C14 以安新 7 後半；同上）*/
const STORY_OK=['welcome_y1s1','dept_ball_game_y1s2','public_law_group','guitar_show_y1s2','guitar_show_y2s2','lawclub_review_y1s2','B4','EXPO_Y2','moot_2','moot_3','moot_4'];   /* guitar_show_y2s2：子晴 Q9 第二次成發（AA_325 2-Y2-19，AA-C 定稿 404ae976）*/   /* moot_2～4：模擬法庭的小組討論（交接包 v3；AA_177 4-7）*/   /* EXPO_Y2：交換說明會（主線 8，交接包 v3；AA_177 4-2）；B4：博雅午後講座（交接包 v2 C13、AA_115；使用者 2026-10-14 審查通過即交 LAWWW）*/
check('遊戲裡的活動都是一般活動（story:false，AA_110 6-3）或使用者批准的劇情活動（迎新）；沒有活動的那幾天公告欄寫「目前沒有」',ACTIVITIES.list.length>0&&ACTIVITIES.list.every(a=>a.story===false||(a.story===true&&STORY_OK.includes(a.id)))&&/目前沒有/.test(ACTIVITIES.posterText({day:120,hour:10})),ACTIVITIES.list.map(a=>a.id).join(','));
ACTIVITIES.list=[{id:'t_lecture',title:'測試演講',kind:'lecture',zone:'gongtong',room:'101',roomName:'共同 101',dates:['2025-10-21'],t0:18.5,t1:20.5,poster:{daysBefore:5}},
                 {id:'t_club',title:'測試社團',kind:'club',zone:'wancai',term:['Y1S1'],weeks:[4,5,6,7],weekday:3,t0:19,t1:21,poster:{daysBefore:2}}];
const L=dayOf('2025-10-21'), W4=dayOf('2025-09-24'), W3=dayOf('2025-09-17'), W8=dayOf('2025-10-22');
check('某一天的演講：只在那一天',ACTIVITIES.on(ACTIVITIES.list[0],L)&&!ACTIVITIES.on(ACTIVITIES.list[0],L+7));
check('每週三的社團：大一上第 4～7 週的週三才有（第 3 週、第 8 週沒有）',ACTIVITIES.on(ACTIVITIES.list[1],W4)&&!ACTIVITIES.on(ACTIVITIES.list[1],W3)&&!ACTIVITIES.on(ACTIVITIES.list[1],W8)&&!ACTIVITIES.on(ACTIVITIES.list[1],W4+1));
check('進行中：19:00 有演講、18:00 還沒、20:40 沒有，但「剛結束 20 分鐘」算',ACTIVITIES.isActive({day:L,hour:19},'t_lecture')&&!ACTIVITIES.isActive({day:L,hour:18},'t_lecture')&&!ACTIVITIES.isActive({day:L,hour:20.67},'t_lecture')&&ACTIVITIES.isActive({day:L,hour:20.67},'t_lecture',{justEnded:true}));
{ const up=ACTIVITIES.upcoming({day:L-5,hour:10},7).map(q=>q.a.id+'@'+q.k), up2=ACTIVITIES.upcoming({day:L-6,hour:10},7).map(q=>q.a.id+'@'+q.k);
  check('海報提前 5 天貼：演講前 5 天看得到、前 6 天還沒貼',up.includes('t_lecture@5')&&!up2.some(q=>q.startsWith('t_lecture')),up.join(',')+' / '+up2.join(','));
  check('當天結束以後公告欄不再列',!ACTIVITIES.upcoming({day:L,hour:21},7).some(q=>q.a.id==='t_lecture'));
  const t=ACTIVITIES.posterText({day:L-1,hour:10}); check('公告欄的文字：明天 18:30–20:30 測試演講（共同 101）',/明天 18:30–20:30　測試演講（共同 101）/.test(t),t); }
// 事件條件
{ const G={day:L,hour:19,zone:'gongtong',weekday:2,flags:{},events:{done:{},last:{}}}; let room='101', where={zone:'gongtong'};
  const GM={G,E:{zone:{roomAt:()=>room},player:{obj:{position:{x:0,z:0}},lv:0}}}; global.STORY={whereIs:(gm,id)=>id==='heroine_02'?where:null};
  EVENTS.bind(GM);
  const ev={id:'t',trigger:'room',location:'gongtong',room:'101',activity:'t_lecture',npcHere:'heroine_02'};
  check('三個條件都成立：觸發',EVENTS.check(ev));
  room='102'; check('人不在那一間（room）：不觸發',!EVENTS.check(ev)); room='101';
  G.hour=18; check('活動還沒開始（activity）：不觸發',!EVENTS.check(ev)); G.hour=19;
  where={zone:'campus'}; check('那個人照作息不在這裡（npcHere）：不觸發',!EVENTS.check(ev)); where={zone:'gongtong'};
  G.hour=20.6; check('演講剛結束：activityJustEnded 的事件觸發、一般的不觸發',EVENTS.check(Object.assign({},ev,{activityJustEnded:true}))&&!EVENTS.check(ev));
  /* 2026-10-13 ChatGPT 審查：「散場後」的事件在演講進行中不能觸發（修改前從開始就成立）；四個時段（AA_110 第 5 節）*/
  G.hour=19.5; const je=Object.assign({},ev,{activityJustEnded:true}); check('演講進行中（19:30）：「散場後」（activityJustEnded）的事件不觸發',!EVENTS.check(je)&&EVENTS.check(ev));
  G.hour=21.2; check('結束 40 分鐘後：「散場後」也不觸發（只有結束後 20 分鐘內）',!EVENTS.check(je));
  const ph=h=>{ G.hour=h; return ACTIVITIES.phaseOf(G,ev.activity); }; check('時段：18:00 before、19:30 during、20:40 justEnded、21:30 after',ph(18)==='before'&&ph(19.5)==='during'&&ph(20+2/3)==='justEnded'&&ph(21.5)==='after',[ph(18),ph(19.5),ph(20+2/3),ph(21.5)].join(','));
  G.hour=21.5; check('activityPhase:\'after\'（演講結束以後的事件）在 21:30 觸發、19:30 不觸發',EVENTS.check(Object.assign({},ev,{activityPhase:'after'}))&&(G.hour=19.5,!EVENTS.check(Object.assign({},ev,{activityPhase:'after'})))); }
/* 照學期、星期排的活動：國定假日不辦（課表那天也停課）；用 dates 指定日期的照辦（2026-10-13 審查第 13 項）*/
{ const DAY=86400000, dOf=q=>{ const [y,m,d]=q.split('-').map(Number); return Math.round((Date.UTC(y,m-1,d)-Date.UTC(2025,8,17))/DAY)+1; };
  const wk={id:'t_weekly',title:'每週五的社課',kind:'club',term:['Y1S1'],weekday:5,t0:19,t1:21}, dt={id:'t_dated',title:'國慶日特別活動',kind:'lecture',dates:['2025-10-10'],t0:19,t1:21};
  check('每週五的活動：一般的週五有、國慶日（10/10 週五）沒有；用 dates 指定國慶日的照辦',ACTIVITIES.on(wk,dOf('2025-10-03'))&&!ACTIVITIES.on(wk,dOf('2025-10-10'))&&ACTIVITIES.on(dt,dOf('2025-10-10'))); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
