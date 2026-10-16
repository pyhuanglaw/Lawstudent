// v0 ★E24c 決定（BB_104 3-3、5-1；AA_154 第 227 行）：3/13 22:00 起的晚上、三個理由、阿勳兩個版本——不需要瀏覽器。
// 修改前沒有 ev_y0_e24c（全部失敗）。用法：node tests/v0_e24c_unit.js
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
  const D=STORY.dayOfKey('2025-03-13'); const ev=STORY_EVENTS.find(e=>e.id==='ev_y0_e24c'); check('0. E24c 在',!!ev); if(!ev){ console.log('FAILED '+fails); process.exit(1); }
  const ck=(d,h)=>{ fresh(d,h,'dorm'); return EVENTS.check(ev); };
  check('1. 3/13 22:00 起演；21:00、3/12 不演；3/14 晚上 20:00、凌晨 01:00 補演；3/14 中午、3/19 不演',ck(D,22.1)&&!ck(D,21)&&!ck(D-1,22.5)&&ck(D+1,20.5)&&ck(D+1,1)&&!ck(D+1,12)&&!ck(D+6,22));
  fresh(D,22.1,'dorm'); picks=['應該怎麼樣']; await EVENTS.run(ev); let L=said.map(x=>x.t);
  check('2. 選「經濟在問『會怎麼樣』……」→ E24C_REASON＝should；阿勳「你確定？……好。你確定的樣子比較好看。」',G.flags.E24C_REASON==='should'&&L.join('|')==='你確定？……好。你確定的樣子比較好看。',JSON.stringify(L));
  fresh(D,22.1,'dorm',{XUN_KNEW:true}); picks=['說來話長']; await EVENTS.run(ev); L=said.map(x=>x.t);
  check('3. 有 XUN_KNEW：阿勳「你確定了？……我早就看到那本書了。好。你確定的樣子比較好看。」；later',G.flags.E24C_REASON==='later'&&L.join('|')==='你確定了？……我早就看到那本書了。好。你確定的樣子比較好看。');
  check('3. 一次',!EVENTS.check(ev));
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
