// v0 E22 期末通宵：刪除（AA_218 第 11 節、AA_154 0b-2，2026-10-17 祐廷 10/17 休學）——事件標 retired、12/22 群組邀約與出發選單、沒去的照片不再排；E21a 跨年（BB_104 8b-13；AA_154 A36、A38）照舊。不需要瀏覽器。用法：node tests/v0_e22_unit.js
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
  const K=k=>STORY.dayOfKey(k), S22=K('2024-12-22'), T31=K('2024-12-31');
  const e22=STORY_EVENTS.find(e=>e.id==='ev_y0_e22'), e21=STORY_EVENTS.find(e=>e.id==='ev_y0_e21a');
  check('0. E22 定義還在（給舊存檔）、標 retired（AA_218 第 11 節）；E21a 在、沒有 retired（內容 AA_224 3-6 改）',!!e22&&typeof e22.retired==='string'&&e22.retired.includes('AA_218')&&!!e21&&!e21.retired); if(!e22||!e21){ console.log('FAILED '+fails); process.exit(1); }
  let entered=null, L=null; GM.enter=async(z)=>{ entered=z; G.zone=z; };
  fresh(S22,19.5,'dorm'); G.events.done.ev_y0_e02=1; run(); at(S22,20.1); at(S22,21.8);
  check('1. 12/22 20:00 以後：沒有韋綸「今晚 B1 通宵。……」、品妤「……咖啡我帶。」',!PHONE.sent(G,'y0_e22_ask')&&!TH('g:econ_class').includes('今晚 B1 通宵。明天那科，我需要一點奇蹟。')&&!TH('g:econ_class').some(t=>t.includes('咖啡我帶')));
  check('1. 沒有出發選單「總圖 B1 22:00：期末通宵」',!OUT.get(G,'y0_e22')&&(OUT.due(G)||{}).id!=='y0_e22');
  at(S22,25.1); at(S22+1,10); check('2. 沒有 01:00 群組照片（桌上四杯咖啡）',!PHONE.sent(G,'y0_e22_missed')&&!TH('g:econ_class').includes('📷（凌晨一點，總圖 B1。桌上四杯咖啡）'));
  /* E21a 跨年改成「總圖門口 23:00」的出遊（AA_224 3-6）：新的測試在 tests/lifeline_g3_unit.js */
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
