// 手機「今天」列出今天排進行程的出遊（UX-GROUP-NOTICE-1018；BB 帳號 A 10-21 22:3x 讀碼：排進行程的提示寫「手機的『今天』也看得到」，可是「今天」只列課和當面約）——不需要瀏覽器。
// 檢查：1. 今天 15:00 排了中秋烤肉（OUT.plan）：CLS.todayHTML 有「今天的行程」、「15:00　中秋烤肉（河濱）」、「時間到會跳出「出發」」；
//       2. 別天的、已經去過／沒去的（state 不是 planned）不列；沒有出遊時沒有這一格；
//       3. 排進行程的提示那句（outings3d.js）講的「手機的『今天』」真的看得到同一件事；
//       4. 校外約會（q.dateTrip）寫出發的時間（DATE.trip 的 depart），不是到達（q.h）。
// 修改前：沒有 CLS.outTodayHTML，第 1、3 項 FAIL。用法：node tests/today_outings_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js','src/data/exam_bank.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/story3d.js','src/classes3d.js']) if(fs.existsSync(path.join(ROOT,f))) load(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info&&!ok?'　'+info:'')); if(!ok) fails++; };
const toasts=[]; global.GAME={titleIdle:false,toast:t=>toasts.push(t)};
const day=STORY.dayOfKey('2025-10-04');
const G={v:3,day,hour:10,zone:'dorm',stage:'law',weekday:CALENDAR.dateOf(day).wd%7,flags:{LAW_START_DAY:STORY.LAW_D0,MAIN_D1:STORY.MAIN_D1_NEW},choices:{},events:{done:{},last:{},count:0},rel:{},stats:{classes:0},contacts:{},outings:[],invites:[]};
SOCIAL.bind(G);
const html=()=>CLS.todayHTML(G);
check('2. 沒有出遊：沒有「今天的行程」那一格',!/今天的行程/.test(html()));
OUT.plan(G,{id:'bbq',ev:'ev_mid_autumn_bbq',day,h:15,place:'河濱',title:'中秋烤肉'});
OUT.plan(G,{id:'later',ev:'ev_x',day:day+2,h:18,place:'公館',title:'別天的聚餐'});
G.outings.push({id:'gone',ev:'ev_y',day,h:9,place:'校門口',title:'早上去過的',state:'went'});
const h1=html();
check('1. 今天 15:00 排了中秋烤肉：「今天的行程」「15:00　中秋烤肉（河濱）」「時間到會跳出「出發」」',/今天的行程/.test(h1)&&h1.includes('15:00　中秋烤肉（河濱）')&&/時間到會跳出「出發」/.test(h1),h1.slice(0,400));
check('2. 別天的、已經去過的不列',!h1.includes('別天的聚餐')&&!h1.includes('早上去過的'));
{ const d2=day+3; global.DATE={trip:(G,id)=>id===7?{trip:7,depart:9,day:d2}:null}; G.outings.push({id:'date_7',dateTrip:7,ev:null,day:d2,h:10+50/60,place:'臺南',title:'和以安去臺南（兩天一夜）',state:'planned'}); const d0=G.day; G.day=d2; const h4=html(); G.day=d0; delete global.DATE;
  check('4. 校外約會寫出發的時間（09:00 出發），不是到達的 10:50（BB 10-21 22:5x）',h4.includes('09:00 出發　和以安去臺南（兩天一夜）')&&!h4.includes('10:50'),h4.slice(0,400)); }
check('3. 排進行程的提示說「手機的『今天』也看得到」，「今天」那一頁真的有同一件',toasts.some(t=>/手機的「今天」也看得到/.test(t))&&h1.includes('中秋烤肉'),JSON.stringify(toasts));
console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
