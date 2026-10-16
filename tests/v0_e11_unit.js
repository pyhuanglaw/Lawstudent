// v0 E11 期中考後（BB_104 8b-5；AA_154 第 122 行）：第 9 週最後一科（10/31 會計）考完——不需要瀏覽器。用法：node tests/v0_e11_unit.js
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
  const e11=STORY_EVENTS.find(e=>e.id==='ev_y0_e11'); check('0. ev_y0_e11 在（會計期中考後）',!!e11&&e11.afterClass==='acct_y0'&&e11.afterExam==='mid'); if(!e11){ console.log('FAILED '+fails); process.exit(1); }
  const items=w=>{ for(let d=-400;d<0;d++){ const t=CALENDAR.termOf(d); if(!t||t.id!=='Y0S1'||t.week!==w) continue; const it=CLS.dayItems({day:d,hour:8,stage:'econ',flags:{}},d).find(x=>x.c.id==='acct_y0'); if(it) return it; } };
  const w9=items(9), w8=items(8), w10=items(10);
  check('0. 會計第 9 週是 10/31（四）的期中考、在普通',w9&&w9.exam==='mid'&&CALENDAR.dateOf(w9.day).key==='2024-10-31'&&(w9.room&&(w9.room.door==='putong'||w9.room.zone==='putong'||JSON.stringify(w9.room).includes('PUTONG')||JSON.stringify(w9.room).includes('putong'))),JSON.stringify(w9&&w9.room));
  const after=async(it,pick)=>{ fresh(it.day,it.t1+0.05,'campus'); said=[]; picks=pick?[pick]:[]; const r=await CLS.afterClassEvent(GM,it); return {r,L:said.map(x=>x.t)}; };
  let x=await after(w9,'零'); check('1. 考完：韋綸一整頁、阿勳零、全體沉默、品妤一百二十、唐睿故事、可昕「你寫什麼？」',x.r&&x.L[0]==='我第三題寫了一整頁。'&&x.L[2]==='（全體沉默。）'&&x.L[5]==='（看你）你寫什麼？',JSON.stringify(x.L.slice(0,6)));
  check('1. 「零。」→ 阿勳擊掌、可昕「……你們兩個是同一國的。」',JSON.stringify(x.L.slice(-2))===JSON.stringify(['阿勳和你擊掌。','……你們兩個是同一國的。']));
  x=await after(w9,'不記得'); check('1. 「我不記得了。」→「好。那我們都不記得。去吃宵夜。」',x.L[x.L.length-1]==='好。那我們都不記得。去吃宵夜。');
  x=await after(w8); check('2. 第 8 週的會計考完沒有（最後一科才有）',!x.r||!x.L.includes('我第三題寫了一整頁。'));
  x=await after(w10); check('2. 第 10 週一般的會計課沒有',!x.L.includes('我第三題寫了一整頁。'));
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
