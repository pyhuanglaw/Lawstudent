// v0 ★E14 保齡球館（BB_104 8-5；AA_154 A33）：前一晚群組約、出發選單、19:15 沒出發＝韋綸打電話直接進出遊——不需要瀏覽器。用法：node tests/v0_e14_unit.js
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
  const K=k=>STORY.dayOfKey(k), D14=K('2024-09-12'), D15=K('2024-09-13')   /* AA_293 4-1：搬到 9/12 群組、9/13 第一次班聚 */;
  const e14=STORY_EVENTS.find(e=>e.id==='ev_y0_e14'); check('0. ev_y0_e14（出遊、bowling）在',!!e14&&e14.trigger==='outing'); if(!e14){ console.log('FAILED '+fails); process.exit(1); }
  fresh(D14,20.5,'dorm'); G.events.done.ev_y0_e02=1; run(); check('1. 9/12 21:00 以前沒有',!PHONE.sent(G,'y0_e14_ask'));
  at(D14,21.1); check('1. 9/12 21:00 全班群組：品妤「明天晚上七點，保齡球。第一次班聚。高中制服記得帶，要抽籤交換。」',TH('g:econ_class').includes('明天晚上七點，保齡球。第一次班聚。高中制服記得帶，要抽籤交換。'));
  const q=OUT.get(G,'y0_e14'); check('1. 出發選單 9/13 19:00',!!q&&q.day===D15&&q.h===19&&q.title==='保齡球館 19:00');
  const snap=JSON.stringify(G);
  picks=['拍照']; said=[]; G.day=D15; G.weekday=wdOf(D15); G.hour=18.6; await OUT.go(GM,q); let L=said.map(x=>x.t);
  check('2. 出發：開頭旁白（AA_302 第 1 列：第一次班聚、帶高中制服）→ 品妤抽籤、可昕「我要這件。」、學號、阿勳全倒',L[0]==='（第一次班聚。品妤在群組說，每個人帶一件高中制服，抽籤交換穿。）'&&L[1]==='大家都帶了吧？高中制服。抽籤交換。'&&L.includes('（拿起祐廷的那一件）我要這件。')&&L.includes('這件比較好看。')&&L.includes('（阿勳打出全倒。那時沒有人在看。）'),JSON.stringify(L.slice(0,6)));
  check('2. 拍照 →「拍好看一點。這是證據。」→（AA_303 第 2 節 3）「（打完第三局，她還穿著。）」「洗好再還你。」→ 最後的旁白「……她穿著你的高中制服……」',L.includes('（比了一個勝利手勢）拍好看一點喔。')&&JSON.stringify(L.slice(-3))===JSON.stringify(['（打完第三局，她還穿著。）','洗好再還你。','手機裡多了一張照片。她穿著你的高中制服，袖子太長，正在比一個勝利手勢。']),JSON.stringify(L.slice(-3)));
  at(G.day,G.hour+0.1); await new Promise(r=>setTimeout(r,20)); check('2. 去了：不會再打電話',!said.some(x=>x.t==='你在哪？球道開好了，就差你！')||said.filter(x=>x.t==='你在哪？球道開好了，就差你！').length===0);
  // 沒出發 → 電話
  G=JSON.parse(snap); SOCIAL.bind(G); EVENTS.bind(GM); said=[]; picks=['妳穿太大']; at(D15,19.1); await new Promise(r=>setTimeout(r,20)); check('3. 19:15 以前不打電話',!said.length);
  at(D15,19.3); for(let i=0;i<30&&!said.some(x=>x.t==='手機裡多了一張照片。她穿著你的高中制服，袖子太長，正在比一個勝利手勢。');i++) await new Promise(r=>setTimeout(r,10)); L=said.map(x=>x.t);
  check('3. 19:15 還沒出發：韋綸打電話「你在哪？球道開好了，就差你！」（BB_179 段 B #51）→ 直接進出遊',L[0]==='你在哪？球道開好了，就差你！'&&L.includes('大家都帶了吧？高中制服。抽籤交換。')&&L.includes('（甩了一下太長的袖子）剛好。')&&L[L.indexOf('（甩了一下太長的袖子）剛好。')+1]==='（打完第三局，她還穿著。）'&&L.includes('洗好再還你。'),JSON.stringify(L.slice(0,3)));
  check('3. 出遊記成做過',OUT.get(G,'y0_e14').state==='done');
  G=JSON.parse(snap); SOCIAL.bind(G); EVENTS.bind(GM); said=[]; GM.D.active=true; at(D15,19.4); await new Promise(r=>setTimeout(r,20)); check('4. 在別的事件裡：先不打',!said.length); GM.D.active=false; run(); for(let i=0;i<30&&!said.length;i++) await new Promise(r=>setTimeout(r,10)); check('4. 事件結束後馬上打',said.length&&said[0].t==='你在哪？球道開好了，就差你！');
  // 睡覺：19:15 以前上床＝19:15 被電話吵醒（不跳到隔天）
  G=JSON.parse(snap); SOCIAL.bind(G); EVENTS.bind(GM); G.day=D15; G.hour=18.2; G.weekday=wdOf(D15); check('5. 9/13 18:12 睡覺：STORY.coreCallAt＝19:15',Math.abs(STORY.coreCallAt(G)-19.25)<0.01);
  G.hour=19.3; check('5. 19:15 以後沒有（照平常睡）',STORY.coreCallAt(G)==null); G.day=D15+1; G.hour=10; check('5. 隔天沒有',STORY.coreCallAt(G)==null);
  await new Promise(r=>setTimeout(r,50));
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
