// 事件包的掛勾（STORY.TICKS／PHONE_RULES／WAKE_AT／ALARMS；10-20 起 1B、1C、第 2、3 輪各自一個檔案）——不需要瀏覽器。
//   1. TICKS：S.tick 每一輪都問（在 1A-05 之後），回傳 true＝這一輪不再往下（宿舍的拆箱到期也不開）；丟例外不影響後面
//   2. PHONE_RULES：S.phoneRules 每一輪都叫
//   3. WAKE_AT：S.lawWakeAt 沒有別的醒來時間時問；4. ALARMS：S.wakeAlarms 併進去、照時間排
// 修改前：沒有 STORY.TICKS（第 1 項 FAIL）。用法：node tests/story_hooks_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(ROM|CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT|LADDER|HOME|HOME_LINES|CG_REGISTRY)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/romance3d.js','src/story3d.js','src/classes3d.js']) if(fs.existsSync(path.join(ROOT,f))) load(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
global.ADV={active:false,preload(){},begin(){},end(){},log(){},speaker(){},cg(){ return true; },setBg(){}}; global.CHAR={setExpr(){}};
let G=null;
const E={q:{level:'medium'},player:{busy:false,obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0},zone:{roomAt:()=>null,seats:[]},npcs:[],interactables:[],levels:null,setWeather(){},hour:0};
const GM={get G(){ return G; },E,D:{active:false},npc:{},sceneBegin(){},sceneEnd(){},sleep:()=>Promise.resolve(),memo(){},autosave(){},setGoal(){},toast(){},updateHUD(){},phoneBadge(){},titleCard:async()=>{},enter:async()=>{},advance(h){ G.hour+=h; },fade:()=>Promise.resolve(),say:async()=>{},choose:async()=>0};
const D=k=>STORY.dayOfKey(k);
const fresh=(day,hour,zone,flags)=>{ G={v:3,day,hour,zone,stage:'law',weekday:CALENDAR.dateOf(day).wd%7,weather:'clear',energy:70,money:5000,flags:Object.assign({KX_FIRST_MSG:true,fundsV2:1,allowanceMonth:CALENDAR.dateOf(day).m,introDone:true,afternoonDone:true,classDone:true,metAn:true,ROOM_Y2:300,ROOM_Y3:600},flags||{}),choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null,stats:{classes:0}};
  SOCIAL.bind(G); EVENTS.bind(GM); INV.rec(G); ROM.rec(G); return G; };
check('0. 有 STORY.TICKS、PHONE_RULES、WAKE_AT、ALARMS', Array.isArray(STORY.TICKS)&&Array.isArray(STORY.PHONE_RULES)&&Array.isArray(STORY.WAKE_AT)&&Array.isArray(STORY.ALARMS));
if(fails){ console.log('FAILED '+fails); process.exit(1); }
const d=D('2027-11-03');
// 1
fresh(d,21,'dorm',{ROOM_Y3:null}); let n3=0; const o3=STORY.roomY3InDorm; STORY.roomY3InDorm=async()=>{ n3++; return true; };
const seen=[]; const bad=()=>{ seen.push('bad'); throw new Error('boom'); }, mine=(gm,dt)=>{ seen.push('mine'); return true; };
STORY.TICKS.push(bad,mine); STORY.tick(GM,0.6);
check('1. TICKS：每一輪都問、丟例外的不影響後面的；回傳 true＝這一輪不再往下（拆箱到期也沒開）', seen.join()==='bad,mine'&&n3===0, seen.join()+' n3='+n3);
STORY.TICKS.length=0; STORY.tick(GM,0.6); STORY.roomY3InDorm=o3;
check('1. 拿掉以後照舊往下（拆箱開了）', n3===1);
// 2
fresh(d,12,'campus'); let pr=0; STORY.PHONE_RULES.push((g,gm)=>{ if(g===G&&gm===GM) pr++; }); STORY.phoneRules(GM); STORY.PHONE_RULES.length=0;
check('2. PHONE_RULES：S.phoneRules 每一輪都叫', pr===1, String(pr));
// 3
fresh(d,20,'dorm'); STORY.WAKE_AT.push(g=>g.hour<21?21:null); const w=STORY.lawWakeAt(G); STORY.WAKE_AT.length=0;
check('3. WAKE_AT：沒有別的醒來時間時用它（21:00）', w===21, String(w));
// 4
fresh(d,22,'dorm'); STORY.ALARMS.push((g,day)=>day===d+1?[{h:6.75,why:'測試'}]:[]); const A=STORY.wakeAlarms(G,d+1); STORY.ALARMS.length=0;
check('4. ALARMS：併進 S.wakeAlarms、照時間排', A.some(a=>a.why==='測試'&&a.h===6.75)&&A.every((a,i)=>i===0||A[i-1].h<=a.h), JSON.stringify(A));
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
