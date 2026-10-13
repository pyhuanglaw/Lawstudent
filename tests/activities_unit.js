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
check('遊戲裡的活動清單是空的（內容等 AA、BB）；公告欄寫「目前沒有」',ACTIVITIES.list.length===0&&/目前沒有/.test(ACTIVITIES.posterText({day:5,hour:10})));
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
  G.hour=20.6; check('演講剛結束：activityJustEnded 的事件觸發、一般的不觸發',EVENTS.check(Object.assign({},ev,{activityJustEnded:true}))&&!EVENTS.check(ev)); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
