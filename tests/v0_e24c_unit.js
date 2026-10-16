// v0 ★E24c 決定（AA_169 完整稿；AA_154 第 227 行）：3/13 22:00 在男宿、不在男宿回來才演、先睡睡前先演；七句旁白、三個理由、阿勳兩個版本——不需要瀏覽器。
// 用法：node tests/v0_e24c_unit.js
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
  const ck=(d,h,z)=>{ fresh(d,h,z||'dorm'); return EVENTS.check(ev); };
  check('1. 3/13 22:00 在男宿（房間、走廊）演；21:00、3/12 不演',ck(D,22.1)&&ck(D,22.1,'dorm_hall')&&!ck(D,21)&&!ck(D-1,22.5));
  check('1. 邊界：22:00 在外面不演，回男宿（當晚、過了午夜）才演；3/14 白天不演',!ck(D,22.5,'gongguan')&&ck(D,23.8,'dorm_hall')&&ck(D+1,0.5,'dorm')&&!ck(D+1,12));
  fresh(D,22.1,'dorm'); SOCIAL.meet('econ_zhengxun','x'); const t0=SOCIAL.rel('econ_zhengxun').trust|0; picks=['應該怎麼樣']; await EVENTS.run(ev); let L=said.map(x=>x.t);
  check('2. 七句旁白「星期四晚上十點，你睡不著，走上宿舍頂樓。」…「如果有人問你為什麼，你會怎麼說？」→ 選項',L[0]==='星期四晚上十點，你睡不著，走上宿舍頂樓。'&&L[6]==='如果有人問你為什麼，你會怎麼說？',JSON.stringify(L.slice(0,7)));
  check('2. 選「經濟在問『會怎麼樣』……」→ ought；「你說出口，才發現自己已經決定了。」→ 阿勳上頂樓 →「我要重考。法律。」→「你確定？……好。你確定的樣子比較好看。」→「你不問為什麼？」… 最後「這件事，你還沒有告訴任何人。除了他。」',G.flags.E24C_REASON==='ought'&&L[7]==='你說出口，才發現自己已經決定了。'&&L.includes('我要重考。法律。')&&L.includes('你確定？……好。你確定的樣子比較好看。')&&L.includes('你在這裡站了二十分鐘。答案應該已經很完整了。')&&L[L.length-1]==='這件事，你還沒有告訴任何人。除了他。'&&!L.some(t=>/可昕/.test(t)),JSON.stringify(L));
  check('2. 阿勳信任 +2',(SOCIAL.rel('econ_zhengxun').trust|0)===t0+2);
  fresh(D,22.1,'dorm',{XUN_KNEW:true}); picks=['說不清楚']; await EVENTS.run(ev); L=said.map(x=>x.t);
  check('3. 有 XUN_KNEW：「你確定了？……我早就看到那本書了。好。你確定的樣子比較好看。」；unsaid',G.flags.E24C_REASON==='unsaid'&&L.includes('你確定了？……我早就看到那本書了。好。你確定的樣子比較好看。'));
  fresh(D,22.1,'dorm'); picks=['弄懂小時候']; await EVENTS.run(ev); check('3. 第一個理由＝understand；一次',G.flags.E24C_REASON==='understand'&&!EVENTS.check(ev));
  // 先睡＝睡前先演
  fresh(D,21,'dorm'); picks=['弄懂小時候']; GM.enter=async z=>{ G.zone=z; }; GM.setGoal=()=>{}; GM.titleCard=async()=>{}; try{ await STORY.sleepNow(GM,7.5); }catch(e){}
  check('4. 3/13 21:00 先睡：睡前先演 E24c',G.flags.E24C_REASON==='understand'&&!!(G.events.done.ev_y0_e24c));
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
