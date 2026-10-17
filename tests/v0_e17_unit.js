// v0 E17 校慶園遊會的拍賣攤：刪除（AA_218 第 11 節、AA_154 0b-2，2026-10-17 祐廷 10/17 休學）——事件標 retired、11/9 攤位不再觸發、11/8 備料邀約與出發選單、沒去的群組照片不再排。不需要瀏覽器。用法：node tests/v0_e17_unit.js
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
  const K=k=>STORY.dayOfKey(k), D9=K('2024-11-09'); const e17=STORY_EVENTS.find(e=>e.id==='ev_y0_e17'), e17a=STORY_EVENTS.find(e=>e.id==='ev_y0_e17a');
  const RET=e=>!!e&&typeof e.retired==='string'&&e.retired.includes('AA_218');
  check('0. ev_y0_e17（攤位）、ev_y0_e17a（備料）定義還在（給舊存檔）、標 retired（AA_218 第 11 節）',RET(e17)&&RET(e17a)); if(!e17||!e17a){ console.log('FAILED '+fails); process.exit(1); }
  const ck=(day,h,zone)=>{ fresh(day,h,zone||'campus'); return EVENTS.check(e17); };
  check('1. 11/9（六）10:00～16:00 在校園：攤位的條件不再成立',!ck(D9,11)&&!ck(D9,13)&&!ck(D9,15.5));
  fresh(D9,11,'campus'); picks=['交給可昕']; EVENTS.tick(0); await new Promise(r=>setTimeout(r,5));
  check('1. 11/9 11:00 在攤位旁邊跑自動事件：沒有演攤位（沒有白板那句、done 沒記）',!G.events.done.ev_y0_e17&&!said.some(x=>x.t.includes('荷蘭式拍賣')||x.t.includes('攤位前排了人')),JSON.stringify(said.slice(0,2)));
  fresh(D9-1,12,'campus'); G.events.done.ev_y0_e02=1; run(); at(D9-1,12.6); at(D9-1,18.7);
  check('2. 11/8 12:30 以後：沒有品妤「今晚七點，系學會辦公室，備料。……」、沒有出發選單「社科院 19:00：備料」',!PHONE.sent(G,'y0_e17_ask')&&!TH('g:econ_class').includes('今晚七點，系學會辦公室，備料。明天校慶擺攤，賣珍奶。')&&!TH('g:econ_class').includes('成本我算好了。定價還沒。')&&!OUT.get(G,'y0_e17a')&&(OUT.due(G)||{}).id!=='y0_e17a');
  at(D9,18.2); at(D9+1,10);
  check('3. 兩天都沒去：11/9 18:00 以後沒有群組攤位照片、沒有「今天的營收，我會做成報表。」',!PHONE.sent(G,'y0_e17_missed')&&!TH('g:econ_class').includes('📷（攤位前排隊的照片）')&&!TH('g:econ_class').includes('今天的營收，我會做成報表。'));
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
