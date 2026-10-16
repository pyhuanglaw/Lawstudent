// v0 E17 校慶園遊會：經濟系的拍賣攤（BB_104 8b-9；AA_154 第 127 行）——不需要瀏覽器。用法：node tests/v0_e17_unit.js
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
  const K=k=>STORY.dayOfKey(k), D9=K('2024-11-09'); const e17=STORY_EVENTS.find(e=>e.id==='ev_y0_e17');
  check('0. ev_y0_e17 在',!!e17); if(!e17){ console.log('FAILED '+fails); process.exit(1); }
  const ck=(day,h,zone)=>{ fresh(day,h,zone||'campus'); return EVENTS.check(e17); };
  check('1. 11/9（六）10:00～17:00 在校園（攤位那一排）可以；11/8、11/10、09:30、17:30、在宿舍不行',ck(D9,11)&&ck(D9,16.5)&&!ck(D9-1,11)&&!ck(D9+1,11)&&!ck(D9,9.5)&&!ck(D9,17.5)&&!ck(D9,11,'dorm'));
  fresh(D9,11,'campus'); picks=['交給可昕']; said=[]; await EVENTS.run(e17); const L=said.map(x=>x.t);
  check('1. 原文：前一晚系學會、珍奶成本二十八、荷蘭式拍賣、擴音器、「你喊。從一百開始。」',L[0]==='（前一晚，社科院的系學會辦公室。）'&&L[1]==='珍奶一杯成本二十八。要賣多少？'&&L[6]==='你喊。從一百開始。',JSON.stringify(L.slice(0,7)));
  check('1. 交給可昕喊 → 名畫、九十五元、唐睿',L[L.length-1]==='她喊得像在拍賣名畫。第一杯九十五元，買的人是唐睿。'&&L.every(t=>t.length<=40));
  G.events.done.ev_y0_e17=1; at(D9,18.5); check('2. 去了：沒有群組照片',!PHONE.sent(G,'y0_e17_missed'));
  fresh(D9,17.5,'dorm'); G.events.done.ev_y0_e02=1; run(); check('2. 沒去：18:00 以前沒有',!PHONE.sent(G,'y0_e17_missed')); at(D9,18.2);
  check('2. 沒去：18:00 群組照片＋品妤「今天的營收，我會做成報表。」',TH('g:econ_class').includes('📷（攤位前排隊的照片）')&&TH('g:econ_class').includes('今天的營收，我會做成報表。'));
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
