// v0 T3 情人節的計算機（BB_112 T3）、★E24b 法學緒論第一堂與偷偷旁聽（BB_104 8b-17；AA_154 第 224～226 行）——不需要瀏覽器。
// 修改前沒有這三個事件（全部失敗）。用法：node tests/v0_e24b_unit.js
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
  const K=k=>STORY.dayOfKey(k), M1=K('2025-02-17'), T1=K('2025-02-18'), F21=K('2025-02-21'), W26=K('2025-02-26');
  const t3=STORY_EVENTS.find(e=>e.id==='ev_y0_t3'), e24=STORY_EVENTS.find(e=>e.id==='ev_y0_e24b'), au=STORY_EVENTS.find(e=>e.id==='ev_y0_e24b2'); check('0. T3、E24b、旁聽都在',!!t3&&!!e24&&!!au); if(!t3||!e24||!au){ console.log('FAILED '+fails); process.exit(1); }
  const ck=(e,d,h,z,f)=>{ fresh(d,h,z,f); return EVENTS.check(e); };
  check('1. T3：Y0S2 第 1 週平日中午在校園；第 2 週、早上不演',ck(t3,M1,12.2,'campus')&&ck(t3,F21,13,'campus')&&!ck(t3,M1+7,12.2,'campus')&&!ck(t3,M1,11,'campus'));
  fresh(M1,12.2,'campus'); picks=['拍拍他的肩']; await EVENTS.run(t3); let L=said.map(x=>x.t);
  check('1. T3：開頭旁白 → 唐睿遞盒子 … 品妤「謝謝。精算考試剛好用得到。這台很好。」…「……那是文具。」→（拍拍他的肩）→「你不要同情我。……好啦，可以同情一點。」',L[0]==='（開學第一週。情人節是上週五，那時候還在放寒假。）'&&L.includes('謝謝。精算考試剛好用得到。這台很好。')&&L.includes('……那是文具。')&&L[L.length-1]==='你不要同情我。……好啦，可以同情一點。',JSON.stringify(L));
  fresh(F21,20.9,'dorm'); PHONE.join(G,'econ_friends','走啦'); run(); check('2. T3 沒去：21:00 以前沒有',!PHONE.sent(G,'y0_t3_miss')); at(F21,21.1);
  check('2. T3 沒去：2/21 21:00 品妤「今天收到一台計算機。很實用。」韋綸「……全系都在笑。」',TH('g:econ_friends').includes('今天收到一台計算機。很實用。')&&TH('g:econ_friends').includes('……全系都在笑。'));
  fresh(F21,21.1,'dorm'); G.events.done.ev_y0_t3=1; run(); check('2. T3 演過：沒有群組那兩句',!PHONE.sent(G,'y0_t3_miss'));
  check('3. E24b：掛在法學緒論第 1 週下課',e24.afterClass==='law_intro'&&e24.weeks.join()==='1');
  fresh(T1,15.1,'gongtong'); picks=['我家有一本民法']; await EVENTS.run(e24); L=said.map(x=>x.t);
  check('3. E24b：黃教授「（在黑板寫「法律在哪裡？」）……」→「你想知道什麼？」→「我家有一本民法。」→「看得懂嗎？」「看不懂。」「那你來對地方了。」、E24B_HUANG',L[0].startsWith('（在黑板寫「法律在哪裡？」）')&&L.includes('你想知道什麼？')&&L.slice(-3).join('/')==='看得懂嗎？/看不懂。/那你來對地方了。'&&G.flags.E24B_HUANG===true,JSON.stringify(L));
  check('4. 旁聽：2/26 07:00～10:30、有 E24B_HUANG 才演；2/25、沒有 E24B_HUANG 不演',ck(au,W26,8,'dorm',{E24B_HUANG:true})&&!ck(au,W26,6.5,'dorm',{E24B_HUANG:true})&&!ck(au,W26-1,8,'dorm',{E24B_HUANG:true})&&!ck(au,W26,8,'dorm'));
  fresh(W26,8,'dorm',{E24B_HUANG:true}); await EVENTS.run(au); await new Promise(r=>setTimeout(r,5)); L=said.map(x=>x.t);
  check('4. 旁聽：四句固定的經過（「你翹了微積分，走進霖澤館……」…「走出穿堂時，你回頭看了一眼。」）→ 12:10、人在霖澤館穿堂（校園）',L.length===4&&L[0]==='（你翹了微積分，走進霖澤館。一間大教室，你坐最後一排。）'&&L[3]==='（走出穿堂時，你回頭看了一眼。）'&&Math.abs(G.hour-(12+10/60))<1e-6&&G.zone==='campus',JSON.stringify(L)+' '+G.hour+' '+G.zone);
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
