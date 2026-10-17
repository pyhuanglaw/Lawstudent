// v0 T3 情人節的計算機（BB_112 T3）照舊；★E24b 法學緒論第一堂與偷偷旁聽：刪除（AA_218 第 11 節、AA_154 0b-2，2026-10-17 祐廷 10/17 休學）——事件標 retired、不再觸發、E24B_HUANG 不再寫——不需要瀏覽器。
// 修改前 E24b 與旁聽會演（E24b 那幾項失敗）。用法：node tests/v0_e24b_unit.js
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
  const t3=STORY_EVENTS.find(e=>e.id==='ev_y0_t3'), e24=STORY_EVENTS.find(e=>e.id==='ev_y0_e24b'), au=STORY_EVENTS.find(e=>e.id==='ev_y0_e24b2'), RET=e=>!!e&&typeof e.retired==='string'&&e.retired.includes('AA_218');
  check('0. T3、E24b、旁聽的定義都在；三個都標 retired（E24b、旁聽：AA_218 第 11 節；T3 小福的現場版：AA_224 5-4，只剩群組版）',!!t3&&!!t3.retired&&RET(e24)&&RET(au)); if(!t3||!e24||!au){ console.log('FAILED '+fails); process.exit(1); }
  const ck=(e,d,h,z,f)=>{ fresh(d,h,z,f); return EVENTS.check(e); };
  check('1. T3 小福的現場版不再演（retired；群組版＋唐睿私訊在 tests/lifeline_g5_unit.js）',!ck(t3,M1,12.2,'campus')&&!ck(t3,F21,13,'campus'));
  fresh(M1,12.2,'campus'); picks=['拍拍他的肩']; await EVENTS.run(t3); let L=said.map(x=>x.t);
  check('1. T3：開頭旁白 → 唐睿遞盒子 … 品妤「謝謝。精算考試剛好用得到。這台很好。」…「……那是文具。」→（拍拍他的肩）→「你不要同情我。……好啦，可以同情一點。」',L[0]==='（開學第一週。情人節是上週五，那時候還在放寒假。）'&&L.includes('謝謝。精算考試剛好用得到。這台很好。')&&L.includes('……那是文具。')&&L[L.length-1]==='你不要同情我。……好啦，可以同情一點。',JSON.stringify(L));
  fresh(F21,20.9,'dorm'); PHONE.join(G,'econ_friends','走啦'); run(); check('2. T3 沒去：21:00 以前沒有',!PHONE.sent(G,'y0_t3_miss')); at(F21,21.1);
  check('2. T3 沒去：2/21 21:00 品妤「今天收到一台計算機。很實用。」韋綸「……全系都在笑。」',TH('g:econ_friends').includes('今天收到一台計算機。很實用。')&&TH('g:econ_friends').includes('……全系都在笑。'));
  fresh(F21,21.1,'dorm'); G.events.done.ev_y0_t3=1; run(); check('2. T3 演過：沒有群組那兩句',!PHONE.sent(G,'y0_t3_miss'));
  const it=CLS.dayItems({day:T1,hour:8,stage:'econ',flags:{}},T1).find(x=>x.c.id==='law_intro'&&!x.exam); check('3. 法學緒論 2/18（二）第 1 週照舊在課表',!!it&&CALENDAR.dateOf(it.day).key==='2025-02-18'); if(!it){ console.log('FAILED '+fails); process.exit(1); }
  fresh(T1,it.t1+0.05,'gongtong'); picks=['我家有一本民法']; said=[]; const r=await CLS.afterClassEvent(GM,it); L=said.map(x=>x.t);
  check('3. E24b：2/18 法學緒論第 1 週下課（afterClassEvent）不演——沒有黃教授「法律在哪裡？」、E24B_HUANG 沒寫',!r&&!L.some(t=>t.includes('法律在哪裡'))&&!G.events.done.ev_y0_e24b&&G.flags.E24B_HUANG===undefined,JSON.stringify(L.slice(0,2)));
  check('4. 旁聽：舊存檔有 E24B_HUANG，2/26 07:00～10:30 條件也不成立',!ck(au,W26,8,'dorm',{E24B_HUANG:true})&&!ck(au,W26,10,'dorm',{E24B_HUANG:true}));
  fresh(W26,8,'dorm',{E24B_HUANG:true}); EVENTS.tick(0); await new Promise(r=>setTimeout(r,5)); L=said.map(x=>x.t);
  check('4. 旁聽：2/26 08:00 跑自動事件不演——沒有「你翹了微積分，走進霖澤館。……」、done 沒記',!G.events.done.ev_y0_e24b2&&!L.some(t=>t.includes('你翹了微積分')),JSON.stringify(L.slice(0,2)));
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
