// v0 C1 即興劇社的熱身（BB_110 第 3 節；AA_154 第 113 行）：第 6 週可昕邀、IMPROV_LINE、沒去版——不需要瀏覽器。用法：node tests/v0_c1_unit.js
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
  const K=k=>STORY.dayOfKey(k); const c1=STORY_EVENTS.find(e=>e.id==='ev_y0_c1');
  check('0. ev_y0_c1（出遊）在',!!c1&&c1.trigger==='outing'); if(!c1){ console.log('FAILED '+fails); process.exit(1); }
  fresh(K('2024-10-04'),16,'campus'); run(); check('1. 第 5 週沒有邀請',!PHONE.sent(G,'y0_c1_ask'));
  const snap0=()=>{ fresh(K('2024-10-07'),16,'campus'); run(); };
  snap0(); at(K('2024-10-07'),17.6); const m=PHONE.thread(G,'p:kexin').find(x=>x.text==='劇社今天練習，可以帶一個人。你當那個人。');
  check('1. 10/7（一）17:30 可昕私訊「劇社今天練習，可以帶一個人。你當那個人。」、好／今天不行',!!m&&m.ask.opts.map(o=>o.t).join('/')==='好。/今天不行。');
  const snap=JSON.stringify(G);
  G.flags.C1_GO='yes'; at(K('2024-10-07'),17.7); const q=OUT.get(G,'y0_c1'); check('2. 回好：排出遊 19:00 博雅',!!q&&q.h===19&&q.ev==='ev_y0_c1');
  picks=['欠我錢']; said=[]; G.hour=18.7; await OUT.go(GM,q); const L=said.map(x=>x.t);
  check('2. 原文：社長的規則、唐睿「我是一隻迷路的企鵝。」、祐廷「對，而且……」',L[0]==='熱身。規則只有一個：對方說什麼，你都說「對，而且——」。'&&L[1]==='（對祐廷）我是一隻迷路的企鵝。'&&L[2]==='對，而且……',JSON.stringify(L.slice(0,3)));
  check('2. 「而且……你欠我錢。」→ 唐睿「……這是討債。」全場笑；IMPROV_LINE 記這一句',L.includes('對，而且——（停住）——這不是熱身，這是討債。')&&L.includes('全場笑。')&&G.flags.IMPROV_LINE==='而且……你欠我錢。');
  check('2. 可昕「（小聲）你接得比我想的好。」、社長「新來的，下次還來嗎？」',L.includes('（小聲）你接得比我想的好。')&&L.includes('新來的，下次還來嗎？'));
  at(G.day,22.5); check('2. 去了：沒有「你錯過了一隻企鵝」',!TH('p:kexin').includes('今天唐睿演了一隻企鵝。你錯過了一隻企鵝。'));
  G=JSON.parse(snap); SOCIAL.bind(G); EVENTS.bind(GM); G.flags.C1_GO='no'; at(K('2024-10-07'),22.2); check('3. 今天不行：22:00 可昕「今天唐睿演了一隻企鵝。你錯過了一隻企鵝。」',TH('p:kexin').includes('今天唐睿演了一隻企鵝。你錯過了一隻企鵝。'));
  fresh(K('2024-10-10'),16,'campus'); run(); check('4. 10/10 國慶不邀（10/11 才邀）',!PHONE.sent(G,'y0_c1_ask')&&(()=>{ at(K('2024-10-11'),10); return PHONE.sent(G,'y0_c1_ask'); })());
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
