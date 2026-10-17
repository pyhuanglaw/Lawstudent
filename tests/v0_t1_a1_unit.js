// v0 T1 全系的秘密（KNOWS_TANG）、A1 凌晨兩點的微積分（XUN_WARM）與沒去的紙條（已刪，AA-C Q2）（BB_112；AA_154 第 111、119 行）——不需要瀏覽器。用法：node tests/v0_t1_a1_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|OUT)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/courses.js','src/data/events.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/story3d.js','src/classes3d.js']) load(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
global.ADV={active:false,preload(){},begin(){},end(){},log(){},speaker(){},cg(){}}; global.CHAR={setExpr(){}};
global.LEGAL={ask:async()=>{},apply(){},stateOf:()=>'unseen',STATES:['unseen']};
let said=[], picks=[], rels=[], G=null;
const E={q:{level:'medium'},player:{busy:false,obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0},zone:{roomAt:()=>null,seats:[]},npcs:[],interactables:[],levels:null,setWeather(){},hour:0,endCinematic(){}};
const GM={get G(){ return G; },E,D:{active:false},npc:{},
  sceneBegin(){},sceneEnd(){},face(){},cine(){},caption(){},sleep:()=>Promise.resolve(),memo(){},autosave(){},addNote(){},energy(){},money(){},setGoal(){},toast(){},updateHUD(){},letterbox(){},phoneBadge(){},
  titleCard:async()=>{},enter:async(z)=>{ G.zone=z; },advance(h){ G.hour+=h; },fade:()=>Promise.resolve(),rel(id,d){ rels.push([id,d]); },walkTo:()=>Promise.resolve(true),sitAt(){},standUp(){},
  say:async(who,t)=>{ said.push({who:who?(who.name||String(who)):null,t}); },choose:async o=>{ const want=picks.shift(); if(typeof want==='string'){ const k=o.findIndex(q=>(q.t||q.text).includes(want)); return k<0?0:k; } return want||0; }};
const wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
const fresh=(day,hour,zone,flags,stage)=>{ G={v:3,day,hour,zone,stage:stage||'econ',weekday:wdOf(day),weather:'clear',energy:70,money:5000,flags:Object.assign({KX_FIRST_MSG:true,fundsV2:1,allowanceMonth:CALENDAR.dateOf(day).m},flags||{}),choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null,stats:{classes:0}};
  SOCIAL.bind(G); EVENTS.bind(GM); said=[]; picks=[]; rels=[]; };
const run=()=>{ STORY.phoneRules(GM); PHONE.tick(G); };
const at=(day,hour)=>{ G.day=day; G.hour=hour; G.weekday=wdOf(day); run(); };
const TH=th=>PHONE.thread(G,th).map(m=>m.text);
(async()=>{
  const K=k=>STORY.dayOfKey(k);
  const t1=STORY_EVENTS.find(e=>e.id==='ev_y0_t1'), a1=STORY_EVENTS.find(e=>e.id==='ev_y0_a1'), note=STORY_EVENTS.find(e=>e.id==='ev_y0_a1_note');
  check('0. T1、A1、門上紙條都在',!!t1&&!!a1&&!!note); if(!t1||!a1||!note){ console.log('FAILED '+fails); process.exit(1); }
  const ck=(e,key,h,zone,fl)=>{ fresh(K(key),h,zone,fl); return EVENTS.check(e); };
  check('1. T1：10/1（二）、10/7（一）中午在校園可以；9/30 颱風假、10/10 國慶、第 4 週、第 7 週不行',ck(t1,'2024-10-01',12.3,'campus')&&ck(t1,'2024-10-07',12.3,'campus')&&!ck(t1,'2024-09-30',12.3,'campus')&&!ck(t1,'2024-10-10',12.3,'campus')&&!ck(t1,'2024-09-24',12.3,'campus')&&!ck(t1,'2024-10-15',12.3,'campus'));
  { fresh(K('2024-10-01'),12.3,'campus'); await EVENTS.run(t1); const L=said.map(x=>x.t);
    check('1. T1（BB_179 段 B #14、#15）：韋綸「欸，她來了。」、品妤坐下「經濟學喔。那你們繼續，我吃我的。」、記 KNOWS_TANG',L[0]==='（壓低聲音）你知道唐睿喜歡品妤嗎？'&&L[1]==='……不知道。'&&L.includes('欸，她來了。')&&L[L.length-1]==='（坐下）經濟學喔。那你們繼續，我吃我的。'&&G.flags.KNOWS_TANG===true,JSON.stringify(L)); }
  check('2. A1（AA_218 第 11 節：休學前兩天的深夜）：10/15（二）深夜 00:30～02:00 在宿舍可以；10/14、10/16、10/17 深夜、10/15 的 02:30、晚上 22:00、在校園不行',ck(a1,'2024-10-15',24.5,'dorm')&&ck(a1,'2024-10-15',25.9,'dorm')&&!ck(a1,'2024-10-14',24.5,'dorm')&&!ck(a1,'2024-10-16',24.5,'dorm')&&!ck(a1,'2024-10-17',25,'dorm')&&!ck(a1,'2024-10-15',26.5,'dorm')&&!ck(a1,'2024-10-15',22,'dorm')&&!ck(a1,'2024-10-15',24.5,'campus'));
  { fresh(K('2024-10-15'),24.5,'dorm'); picks=['數字有溫度']; await EVENTS.run(a1); const L=said.map(x=>x.t);
    check('2. A1（BB_179 段 B）：「我覺得不怪。」→「你也是怪人。」、XUN_WARM',L[0]==='你那題，答案是零。'&&L.includes('（四十分鐘後。）')&&L.includes('……很怪吧。')&&L[L.length-1]==='你也是怪人。'&&G.flags.XUN_WARM===true,JSON.stringify(L.slice(-3)));
    G.day=K('2024-11-02'); G.hour=20; G.weekday=wdOf(G.day); check('3. 玩過 A1：期中後沒有門上的紙條',!EVENTS.check(note)); }
  check('3. A1 門上紙條刪除（AA-C 2026-10-17 Q2：10/19 退宿以後不會回 412）：標 retired，沒玩過 A1 的人 11/1 回宿舍也沒有',!!note.retired&&!ck(note,'2024-11-01',13,'dorm')&&!ck(note,'2024-11-04',20,'dorm'));
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
