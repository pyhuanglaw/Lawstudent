// v0 E11 期中考後：刪除（AA_218 第 11 節、AA_154 0b-2，2026-10-17 祐廷 10/17 休學）——事件標 retired、第 9 週會計期中考（10/31）考完不再演。不需要瀏覽器。用法：node tests/v0_e11_unit.js
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
  const e11=STORY_EVENTS.find(e=>e.id==='ev_y0_e11'); check('0. ev_y0_e11 定義還在（會計期中考後，給舊存檔）、標 retired（AA_218 第 11 節）',!!e11&&e11.afterClass==='acct_y0'&&e11.afterExam==='mid'&&typeof e11.retired==='string'&&e11.retired.includes('AA_218')); if(!e11){ console.log('FAILED '+fails); process.exit(1); }
  const items=w=>{ for(let d=-400;d<0;d++){ const t=CALENDAR.termOf(d); if(!t||t.id!=='Y0S1'||t.week!==w) continue; const it=CLS.dayItems({day:d,hour:8,stage:'econ',flags:{}},d).find(x=>x.c.id==='acct_y0'); if(it) return it; } };
  const w9=items(9), w8=items(8), w10=items(10);
  check('0. 會計第 9 週是 10/31（四）的期中考、在普通',w9&&w9.exam==='mid'&&CALENDAR.dateOf(w9.day).key==='2024-10-31'&&(w9.room&&(w9.room.door==='putong'||w9.room.zone==='putong'||JSON.stringify(w9.room).includes('PUTONG')||JSON.stringify(w9.room).includes('putong'))),JSON.stringify(w9&&w9.room));
  const after=async(it,pick)=>{ fresh(it.day,it.t1+0.05,'campus'); said=[]; picks=pick?[pick]:[]; const r=await CLS.afterClassEvent(GM,it); return {r,L:said.map(x=>x.t)}; };
  fresh(w9.day,w9.t1+0.05,'campus'); check('1. 10/31 會計期中考考完那一刻：條件不再成立',!EVENTS.check(e11,{chain:true}));
  let x=await after(w9,'零'); check('1. 考完（afterClassEvent）：不演（沒有韋綸「我第三題寫了一整頁。」、可昕「你寫什麼？」）、done 沒記',!x.r&&!x.L.length&&!G.events.done.ev_y0_e11,JSON.stringify(x.L.slice(0,3)));
  x=await after(w9,'不記得'); check('1. 選「我不記得了。」那一支也一樣：沒有「去吃宵夜。」',!x.r&&!x.L.includes('好。那我們都不記得。去吃宵夜。'));
  x=await after(w8); check('2. 第 8 週的會計考完沒有',!x.r||!x.L.includes('我第三題寫了一整頁。'));
  x=await after(w10); check('2. 第 10 週一般的會計課沒有',!x.L.includes('我第三題寫了一整頁。'));
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
