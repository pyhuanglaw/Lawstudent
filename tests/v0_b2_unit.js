// v0 B2 小桌子的午後（BB_105 B2、4-4；AA_154 第 112 行）：坐下就開始的事件（STORY.onSeat、trigger:'seat'）——不需要瀏覽器。用法：node tests/v0_b2_unit.js
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
  const K=k=>STORY.dayOfKey(k); const b2=STORY_EVENTS.find(e=>e.id==='ev_y0_b2');
  check('0. ev_y0_b2（trigger seat、博雅的 study 區）、STORY.onSeat 在',!!b2&&b2.trigger==='seat'&&b2.seatRoom==='study'&&typeof STORY.onSeat==='function');
  if(!b2||typeof STORY.onSeat!=='function'){ console.log('FAILED '+fails); process.exit(1); }
  const seat={x:-4.35,z:-4,yaw:1.57,room:'study',kind:'study',lv:0}, round={x:3.6,z:0.4,room:'round',kind:'study',lv:0};
  const sit=async(key,h,zone,st)=>{ fresh(K(key),h,zone); said=[]; return await STORY.onSeat(GM,st||seat); };
  check('1. 10/7（一）12:30 在博雅自習區坐下：B2',await sit('2024-10-07',12.5,'boya')&&said[0].t==='這裡有人嗎？');
  check('1. 10/14（一）也可以；10/8（二）、10/7 14:00、圓桌區、別的建築、法律系不行',await sit('2024-10-14',12.3,'boya')&&!(await sit('2024-10-08',12.5,'boya'))&&!(await sit('2024-10-07',14,'boya'))&&!(await sit('2024-10-07',12.5,'boya',round))&&!(await sit('2024-10-07',12.5,'gongtong'))&&!(await (async()=>{ fresh(K('2024-10-07'),12.5,'boya',{},'law'); return STORY.onSeat(GM,seat); })()));
  { fresh(K('2024-10-07'),12.5,'boya'); picks=['讀書']; said=[]; await STORY.onSeat(GM,seat); const L=said.map(x=>x.t);
    check('2. 四句（BB_179 段 B #22 改稿）、讀書 → 紙條「我讀不下去了。你呢？」、時間 +10 分鐘',L[1]==='……沒有人的話，我坐了。我一點二十才有課，還有一個小時。'&&L[3]==='上禮拜那題彈性你會嗎？我算出來是負的，不知道是不是錯了。'&&L[4]==='她安靜地讀了十分鐘，然後把一張紙條推過來：「我讀不下去了。你呢？」'&&Math.abs(G.hour-(12.5+1/6))<0.01,JSON.stringify([L,G.hour]));
    G.day=K('2024-10-14'); G.hour=12.5; said=[]; check('2. 一次：10/14 不會再演',!(await STORY.onSeat(GM,seat))); }
  { fresh(K('2024-10-07'),12.5,'boya'); picks=['聊天']; said=[]; await STORY.onSeat(GM,seat); check('2. 聊天 →「四十分鐘過去，誰都沒有翻頁。」、時間 +40 分鐘',said[said.length-1].t==='四十分鐘過去，誰都沒有翻頁。'&&Math.abs(G.hour-(12.5+2/3))<0.01); }
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
