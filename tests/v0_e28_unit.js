// v0 E28 告訴朋友（BB_153 E28；AA_154 A20）：19:30 群組＋私訊、出發選單、E19_ASK 三個版本、沒去版——不需要瀏覽器。
// 修改前沒有 ev_y0_e28（全部失敗）。用法：node tests/v0_e28_unit.js
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
  const D=STORY.dayOfKey('2025-03-26'); const ev=STORY_EVENTS.find(e=>e.id==='ev_y0_e28'); check('0. E28 在',!!ev); if(!ev){ console.log('FAILED '+fails); process.exit(1); }
  fresh(D,19.4,'dorm'); PHONE.join(G,'econ_friends','走啦'); run(); check('1. 19:30 以前沒有',!PHONE.sent(G,'y0_e28_ask'));
  at(D,19.6); const q=OUT.get(G,'y0_e28'); check('1. 19:30 群組韋綸「宵夜！公館！走啦！」、可昕私訊「今天要講嗎？……我覺得今天可以。」、出發選單 21:00 公館（21:30 還沒出發＝沒去）',TH('g:econ_friends').includes('宵夜！公館！走啦！')&&TH('p:kexin').includes('今天要講嗎？……我覺得今天可以。')&&!!q&&q.h===21&&q.late===0.5);
  const snap=JSON.stringify(G);
  const go=async v=>{ G=JSON.parse(snap); SOCIAL.bind(G); EVENTS.bind(GM); G.flags.E19_ASK=v; G.hour=21; said=[]; await EVENTS.run(ev); return said.map(x=>x.t); };
  let L=await go('direct'); check('2. 宣布「我們有兩件事要說。」…阿勳「……那保齡球誰陪我打。」；E19 直接問＝品妤「所以寒假那時候你問她是不是唐睿？」唐睿「我？？」；最後可昕「說出來了。」',L.includes('我們有兩件事要說。')&&L.includes('……那保齡球誰陪我打。')&&L.includes('所以寒假那時候你問她是不是唐睿？')&&L.includes('我？？')&&L[L.length-1]==='說出來了。'&&!L.includes('全桌笑倒。'),JSON.stringify(L));
  L=await go('joke'); check('2. 開玩笑問＝可昕「他寒假以為我喜歡唐睿。」唐睿「等一下，我？？」',L.includes('他寒假以為我喜歡唐睿。')&&L.includes('等一下，我？？')&&!L.includes('我？？'));
  L=await go('none'); check('2. 沒問＝唐睿「你們什麼時候開始的？……」品妤「全系只有你不知道。」「全桌笑倒。」',L.includes('你們什麼時候開始的？我怎麼完全不知道？')&&L.includes('全系只有你不知道。')&&L.includes('全桌笑倒。'));
  G=JSON.parse(snap); SOCIAL.bind(G); EVENTS.bind(GM); G.flags.E19_ASK='none'; at(D,21.9); check('3. 沒去：22:00 以前沒有',!PHONE.sent(G,'y0_e28_miss')); at(D,22.1);
  check('3. 沒去：22:00 品妤「宣布兩件事：祐廷和可昕。還有，他們要重考。」＋（E19 不問）唐睿「等一下，你們什麼時候開始的？？」',TH('g:econ_friends').includes('宣布兩件事：祐廷和可昕。還有，他們要重考。')&&TH('g:econ_friends').includes('等一下，你們什麼時候開始的？？'));
  G=JSON.parse(snap); SOCIAL.bind(G); EVENTS.bind(GM); G.flags.E19_ASK='direct'; at(D,22.1); check('3. 沒去、E19 問過：沒有唐睿那句',TH('g:econ_friends').includes('宣布兩件事：祐廷和可昕。還有，他們要重考。')&&!TH('g:econ_friends').includes('等一下，你們什麼時候開始的？？'));
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
