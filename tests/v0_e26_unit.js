// v0 ★E26 摩天輪（BB_104 8-9；AA_154 A40）：3/20 邀約兩個選項、出發選單、17:45 可昕打電話、摩天輪台詞、Y0_DATING——不需要瀏覽器。
// 修改前沒有 ev_y0_e26（全部失敗）。用法：node tests/v0_e26_unit.js
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
  const D=STORY.dayOfKey('2025-03-22'); const ev=STORY_EVENTS.find(e=>e.id==='ev_y0_e26'); check('0. E26 在、3/22 是週六',!!ev&&CALENDAR.dateOf(D).wd===6); if(!ev){ console.log('FAILED '+fails); process.exit(1); }
  fresh(D-2,21.9,'dorm'); run(); check('1. 3/20 22:00 以前沒有',!PHONE.sent(G,'y0_e26_ask'));
  at(D-2,22.1); const q=OUT.get(G,'y0_e26'); check('1. 3/20 22:00「週六傍晚有空嗎？」＋出發選單 3/22 17:30 捷運站',TH('p:kexin').includes('週六傍晚有空嗎？')&&!!q&&q.day===D&&q.h===17.5&&q.ev==='ev_y0_e26');
  const s0=JSON.stringify(G); PHONE.answer(G,'y0_e26',0); check('2. 「有。」→「好。五點半，捷運站。」「我們去一個很高的地方。」',TH('p:kexin').includes('好。五點半，捷運站。')&&TH('p:kexin').includes('我們去一個很高的地方。'));
  G=JSON.parse(s0); SOCIAL.bind(G); EVENTS.bind(GM); PHONE.answer(G,'y0_e26',1); check('2. 「妳要去哪？」→「假設我先說了，你就會開始猜。」「……五點半，捷運站。很高的地方。」',TH('p:kexin').includes('假設我先說了，你就會開始猜。')&&TH('p:kexin').includes('……五點半，捷運站。很高的地方。'));
  // 17:45 還沒出發：可昕打電話 → 出遊
  G=JSON.parse(s0); SOCIAL.bind(G); EVENTS.bind(GM); said=[]; at(D,17.8); for(let i=0;i<30&&!said.some(x=>x.t==='不是問題。是提議。');i++) await new Promise(r=>setTimeout(r,10));
  check('3. 17:45 還沒出發：可昕（電話）「你在哪？……我在捷運站。我會等，可是我不喜歡等。」→ 直接進出遊',said[0]&&said[0].who==='可昕（電話）'&&said[0].t==='你在哪？……我在捷運站。我會等，可是我不喜歡等。'&&said.some(x=>x.t==='坐到最高的時候，台北看起來好小。'),JSON.stringify(said.slice(0,3)));
  check('3. 摩天輪：「假設，我們從最高點開始交往。」…「不是問題。是提議。」；Y0_DATING、E26_DAY',said.some(x=>x.t==='假設，我們從最高點開始交往。')&&said[said.length-1].t==='不是問題。是提議。'&&G.flags.Y0_DATING===true&&G.flags.E26_DAY===D);
  check('4. 睡著也會被叫醒（CORE_OUT）',(()=>{ fresh(D,16,'dorm'); G.outings=[{id:'y0_e26',state:'planned',day:D,h:17.5,late:0.25}]; const t=STORY.coreCallAt(G); return t!=null; })());
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
