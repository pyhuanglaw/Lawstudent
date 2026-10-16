// v0 ★E27 我不是因為你（BB_104 8-10；AA_154 A35）：12:10 邀約、總圖門口窗口、晚到延長、帶到場——不需要瀏覽器。
// 修改前沒有 ev_y0_e27（全部失敗）。用法：node tests/v0_e27_unit.js
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
  const D=STORY.dayOfKey('2025-03-26'); const ev=STORY_EVENTS.find(e=>e.id==='ev_y0_e27'); check('0. E27 在、3/26 是週三',!!ev&&CALENDAR.dateOf(D).wd===3); if(!ev){ console.log('FAILED '+fails); process.exit(1); }
  fresh(D,12,'gongtong'); run(); check('1. 12:10 以前沒有',!PHONE.sent(G,'y0_e27_ask'));
  at(D,12.2); check('1. 12:10「一點半，總圖門口。不用帶書。」「我有一件事，要先跟你說，再跟別人說。」＋出發選單 13:30 總圖門口',TH('p:kexin').includes('一點半，總圖門口。不用帶書。')&&TH('p:kexin').includes('我有一件事，要先跟你說，再跟別人說。')&&OUT.get(G,'y0_e27').h===13.5&&OUT.get(G,'y0_e27').goto.zone==='campus');
  const snap=JSON.stringify(G);
  G.zone='campus'; G.hour=13.3; check('2. 13:15～14:00 在校園：演',EVENTS.check(ev)); G.hour=13.1; check('2. 13:15 以前不演',!EVENTS.check(ev));
  G.hour=14.05; run(); G.hour=14.1; run(); check('3. 14:00 沒到：「我在總圖門口。」、窗口延到 15:00',TH('p:kexin').includes('我在總圖門口。')&&EVENTS.check(ev));
  G.zone='dorm'; G.hour=15.05; run(); check('4. 15:00 還沒到：帶到場',!!G.flags.E27_FORCE&&EVENTS.check(ev));
  said=[]; await EVENTS.run(ev); const L=said.map(x=>x.t);
  check('4. 帶到場：「（你到總圖門口的時候，她坐在台階上，在手機上記東西。）」→「我也要考。法律。台大法律。」…「還有，你不可以偷偷比我早起。」',L[0]==='（你到總圖門口的時候，她坐在台階上，在手機上記東西。）'&&L[1]==='我也要考。法律。台大法律。'&&L[L.length-1]==='還有，你不可以偷偷比我早起。'&&L.length===7,JSON.stringify(L));
  G=JSON.parse(snap); SOCIAL.bind(G); EVENTS.bind(GM); G.zone='campus'; G.hour=13.4; said=[]; await EVENTS.run(ev); check('5. 準時到：沒有帶到場那句、六句、E27_DAY',said[0].t==='我也要考。法律。台大法律。'&&said.length===6&&G.flags.E27_DAY===D&&!EVENTS.check(ev));
  for(const [v,line] of [[true,'你那本法律入門，我那時候就看到了。'],[false,'你說那本是『沒什麼』。我那時候就知道是什麼了。']]){ G=JSON.parse(snap); SOCIAL.bind(G); EVENTS.bind(GM); G.flags.E22B_TOLD=v; G.zone='campus'; G.hour=13.4; said=[]; await EVENTS.run(ev); const L2=said.map(x=>x.t); const i=L2.indexOf('不是。我寒假就在查了。你只是剛好比我早說。');
    check('6. E22B_TOLD＝'+v+'：「我寒假就在查了」之後「'+line+'」',i>=0&&L2[i+1]===line); }
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
