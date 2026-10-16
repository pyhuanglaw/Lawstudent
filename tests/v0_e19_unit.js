// v0 E22b 法律入門書、★E19 誤會（BB_104 8b-14、8-6；AA_154 A33、A34）——不需要瀏覽器。用法：node tests/v0_e19_unit.js
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
  const K=k=>STORY.dayOfKey(k), J2=K('2025-01-02');
  const eb=STORY_EVENTS.find(e=>e.id==='ev_y0_e22b'), e19=STORY_EVENTS.find(e=>e.id==='ev_y0_e19'); check('0. E22b、E19 在',!!eb&&!!e19); if(!eb){ console.log('FAILED '+fails); process.exit(1); }
  const ck=(day,h,zone,lv)=>{ fresh(day,h,zone); E.player.lv=lv|0; global.GAME={E}; return EVENTS.check(eb); };
  check('1. E22b：1/2（四）15:30～18:30 在總圖二樓；一樓、15:00、1/3、在閱覽室不行',ck(J2,16,'library_hall',1)&&!ck(J2,16,'library_hall',0)&&!ck(J2,15,'library_hall',1)&&!ck(J2+1,16,'library_hall',1)&&!ck(J2,16,'library',1));
  fresh(J2,16,'library_hall'); picks=['法律的書']; said=[]; await EVENTS.run(eb); let L=said.map(x=>x.t);
  check('1. 「法律的書。」→「……經濟系的讀法律？」「好，我不問。等你想說再說。」、E22B_TOLD＝true',L[0]==='（總圖二樓的書架。你拿了一本法律入門書。）'&&L[L.length-1]==='好，我不問。等你想說再說。'&&G.flags.E22B_TOLD===true);
  fresh(J2,16,'library_hall'); picks=['沒什麼']; said=[]; await EVENTS.run(eb); check('1. 「沒什麼。」→ 拿得很緊、E22B_TOLD＝false',said.some(x=>x.t==='沒什麼的書，你拿得很緊。')&&G.flags.E22B_TOLD===false);
  fresh(J2,15,'campus'); G.events.done.ev_y0_e02=1; run(); check('2. E19：15:10 以前沒有',!PHONE.sent(G,'y0_e19_ask'));
  at(J2,15.3); check('2. 會計考完：群組韋綸「考完了！今晚七點，公館。寒假前最後一次，走啦！」、出發選單 19:00',TH('g:econ_class').includes('考完了！今晚七點，公館。寒假前最後一次，走啦！')&&OUT.get(G,'y0_e19').h===19);
  const snap=JSON.stringify(G);
  picks=['是不是喜歡']; said=[]; G.hour=18.7; await OUT.go(GM,OUT.get(G,'y0_e19')); L=said.map(x=>x.t);
  check('3. 直接問：「……你覺得呢？」…「……不是唐睿。」…「我要趕捷運了。寒假快樂。」→「誤會解開了一半。另一半，你沒有問。」、E19_ASK＝direct',L.includes('……不是唐睿。')&&L.includes('（她自己站起來）我要趕捷運了。寒假快樂。')&&L[L.length-1]==='誤會解開了一半。另一半，你沒有問。'&&G.flags.E19_ASK==='direct');
  G=JSON.parse(snap); SOCIAL.bind(G); EVENTS.bind(GM); picks=['很會講話']; said=[]; await OUT.go(GM,OUT.get(G,'y0_e19')); check('3. 開玩笑問：「對啊。比某些人會。」、joke',said[said.length-1].t==='對啊。比某些人會。'&&G.flags.E19_ASK==='joke');
  G=JSON.parse(snap); SOCIAL.bind(G); EVENTS.bind(GM); picks=['不問']; said=[]; await OUT.go(GM,OUT.get(G,'y0_e19')); check('3. 不問：E19_ASK＝none',G.flags.E19_ASK==='none'); at(J2+2,22.2); check('3. 不問：1/4 22:00 可昕「你最近很有禮貌。我不習慣。」',TH('p:kexin').includes('你最近很有禮貌。我不習慣。'));
  G=JSON.parse(snap); SOCIAL.bind(G); EVENTS.bind(GM); said=[]; picks=['不問']; at(J2,19.3); for(let i=0;i<30&&!said.some(x=>x.t==='散場前，唐睿先走了。');i++) await new Promise(r=>setTimeout(r,10)); check('4. 19:15 沒出發：韋綸打電話直接進出遊',said[0]&&said[0].t==='你在哪？大家都到了。我們等你，快點！'&&said.some(x=>x.t==='散場前，唐睿先走了。'));
  G=JSON.parse(snap); SOCIAL.bind(G); EVENTS.bind(GM); G.day=J2; G.hour=18; check('4. 18:00 睡覺：19:15 被電話吵醒',Math.abs(STORY.coreCallAt(G)-19.25)<0.01);
  await new Promise(r=>setTimeout(r,30));
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
