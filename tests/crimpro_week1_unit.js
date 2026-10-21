// V4-E2：舊的刑訴課堂事件 ev_class_crimpro（「上週我們談了刑事訴訟的目的。」）大三上第 1 週不演（交接包_v4 E2；BACKLOG-SWEEP 稽核 B1）——不需要瀏覽器。
//   修改前：沒有週次限制，第 1 週週二走進教室照樣演「上週我們談了……」（第 1 週的內容在 syllabus.js crimpro w:1）。
//   1. 大三上第 1 週週二 10:00 在教室：不演（修改前 FAIL）；2. 第 2 週週二：照常演；3. 其他學期不受影響（term 本來就只有 Y3S1）。
// 用法：node tests/crimpro_week1_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}}; global.THREE={Vector3:function(){}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/events.js','src/social3d.js','src/events3d.js','src/story3d.js']) load(f);
global.ADV={active:false,preload(){},begin(){},end(){},log(){},speaker(){}}; global.CHAR={setExpr(){}};
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
let G=null;
const GM={get G(){ return G; },E:{q:{level:'medium'},player:{busy:false,obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0},zone:{roomAt:()=>null,seats:[]},npcs:[],extras:[],interactables:[],levels:null},D:{active:false},npc:{},say:async()=>{},choose:async()=>0};
const ev=STORY_EVENTS.find(e=>e.id==='ev_class_crimpro');
const tueOf=(term,week)=>{ for(let d=0;d<3000;d++){ const t=CALENDAR.termOf(d); if(t&&t.id===term&&t.week===week&&CALENDAR.dateOf(d).wd%7===2) return d; } return null; };
const at=day=>{ G={day,hour:10,zone:'classroom',stage:'law',weekday:CALENDAR.dateOf(day).wd%7,flags:{introDone:true,classDone:true,campusIntro:true,afternoonDone:true,metAn:true},choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null,goal:''}; SOCIAL.bind(G); EVENTS.bind(GM); };
check('0. 事件存在、只在大三上週二',!!ev&&JSON.stringify(ev.term)==='["Y3S1"]'&&JSON.stringify(ev.weekday)==='[2]');
const w1=tueOf('Y3S1',1), w2=tueOf('Y3S1',2);
at(w1); const c1=EVENTS.check(ev);
at(w2); const c2=EVENTS.check(ev);
check('1. 大三上第 1 週週二：不演「上週我們談了刑事訴訟的目的。」（修改前會演）',c1===false,JSON.stringify({w1,c1}));
check('2. 第 2 週週二：照常演',c2===true,JSON.stringify({w2,c2}));
console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
