// v0 T2 唐睿的練習（BB_112 T2；AA_154 第 127 行）：W10～W13 週一經原下課 50%、一次；沒玩過 T1 的說漏嘴；三個回應——不需要瀏覽器。
// 修改前沒有 ev_y0_t2（全部失敗）。用法：node tests/v0_t2_unit.js
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
  const K=k=>STORY.dayOfKey(k), M10=K('2024-11-04'), M9=K('2024-10-28'), M13=K('2024-11-25'), M14=K('2024-12-02');
  const ev=STORY_EVENTS.find(e=>e.id==='ev_y0_t2'); check('0. T2 在、掛在經原下課',!!ev&&ev.afterClass==='econ_principles_y0'); if(!ev){ console.log('FAILED '+fails); process.exit(1); }
  STORY.T2_P=1; const ck=(d,f)=>{ fresh(d,12.1,'boya',f); return EVENTS.check(ev); };
  check('1. W10～W13 週一經原下課：觸發；W9、W14 不觸發',ck(M10)&&ck(M13)&&!ck(M9)&&!ck(M14));
  STORY.T2_P=0; check('1. 沒擲中（50%）：不觸發',!ck(M10)); STORY.T2_P=1;
  fresh(M10,12.1,'boya'); G.events.done.ev_y0_e18=1; check('1. E18 演過：不觸發',!EVENTS.check(ev));
  fresh(M10,12.1,'boya'); picks=['繼續演品妤']; await EVENTS.run(ev); let L=said.map(x=>x.t);
  check('2. 沒玩過 T1：唐睿第一句後說漏嘴「……不對，你忘記我剛剛說的。」',L[0]==='你來得剛好。站那裡。你是品妤。'&&L[1]==='……不對，你忘記我剛剛說的。',JSON.stringify(L));
  check('2. 品妤「你的影子比較高。」→（品妤走了。）→「……她說我比較矮。」',L.includes('你的影子比較高。')&&L.includes('（品妤走了。）')&&L.includes('……她說我比較矮。'));
  check('2. 繼續演品妤：「……我忘詞了。即興的人也會忘詞。」、TANG_REHEARSAL、KNOWS_TANG',L.includes('……我忘詞了。即興的人也會忘詞。')&&G.flags.TANG_REHEARSAL===true&&G.flags.KNOWS_TANG===true);
  check('2. 一次',!EVENTS.check(ev));
  fresh(M10,12.1,'boya',{KNOWS_TANG:true}); picks=['直接跟她說']; await EVENTS.run(ev); L=said.map(x=>x.t);
  check('3. 玩過 T1：沒有說漏嘴那句；「直接？直接不是即興。……」「我再練一下。」、沒有 TANG_REHEARSAL',L[1]==='……我是誰？'&&L.includes('直接？直接不是即興。直接是……直接。')&&L.includes('我再練一下。')&&!G.flags.TANG_REHEARSAL,JSON.stringify(L));
  fresh(M10,12.1,'boya',{KNOWS_TANG:true}); picks=['她知道']; await EVENTS.run(ev); L=said.map(x=>x.t);
  check('3. 「我覺得她知道。」→「真的？」「假的。」「……你好壞。」',L.slice(-3).join('/')==='真的？/假的。/……你好壞。');
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
