// v0 T2 唐睿的練習：刪除（AA_218 第 11 節、AA_154 0b-2，2026-10-17 祐廷 10/17 休學）——事件標 retired；W10～W13 週一經原下課（擲中也一樣）不再演、TANG_REHEARSAL 不再寫——不需要瀏覽器。
// 修改前 W10～W13 經原下課會演 T2（全部失敗）。用法：node tests/v0_t2_unit.js
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
  const K=k=>STORY.dayOfKey(k), M10=K('2024-11-04'), M11=K('2024-11-11'), M12=K('2024-11-18'), M13=K('2024-11-25');
  const ev=STORY_EVENTS.find(e=>e.id==='ev_y0_t2'); check('0. T2 定義還在（掛在經原下課，給舊存檔）、標 retired（AA_218 第 11 節）',!!ev&&ev.afterClass==='econ_principles_y0'&&typeof ev.retired==='string'&&ev.retired.includes('AA_218')); if(!ev){ console.log('FAILED '+fails); process.exit(1); }
  const items=w=>{ for(let d=-400;d<0;d++){ const t=CALENDAR.termOf(d); if(!t||t.id!=='Y0S1'||t.week!==w) continue; const it=CLS.dayItems({day:d,hour:8,stage:'econ',flags:{}},d).find(x=>x.c.id==='econ_principles_y0'&&!x.exam); if(it) return it; } };
  const its=[10,11,12,13].map(items), days=its.map(it=>it&&CALENDAR.dateOf(it.day).key);
  check('0. 經原 W10～W13 是 11/4、11/11、11/18、11/25（週一）',days.join()==='2024-11-04,2024-11-11,2024-11-18,2024-11-25',days.join());
  STORY.T2_P=1; const ck=(d,f)=>{ fresh(d,12.1,'boya',f); return EVENTS.check(ev); };
  check('1. W10～W13 週一經原下課、擲中（T2_P＝1）：條件不再成立；玩過 T1 也一樣',!ck(M10)&&!ck(M11)&&!ck(M12)&&!ck(M13)&&!ck(M10,{KNOWS_TANG:true}));
  const after=async(it,f)=>{ fresh(it.day,it.t1+0.05,'boya',f); said=[]; picks=['繼續演品妤']; const r=await CLS.afterClassEvent(GM,it); return {r,L:said.map(x=>x.t),F:G.flags,D:G.events.done}; };
  const bad=[]; for(const it of its){ const x=await after(it); if(x.r||x.L.length||x.F.TANG_REHEARSAL!==undefined||x.D.ev_y0_t2) bad.push([CALENDAR.dateOf(it.day).key,x.L.slice(0,2)]); }
  check('2. W10～W13 經原下課（afterClassEvent）：唐睿不出現（沒有「你來得剛好。站那裡。你是品妤。」）、TANG_REHEARSAL 和 done 沒寫',!bad.length,JSON.stringify(bad));
  const x=await after(its[0],{KNOWS_TANG:true}); check('2. 玩過 T1（KNOWS_TANG）：W10 經原下課也沒有「……我是誰？」',!x.r&&!x.L.includes('……我是誰？')&&!x.D.ev_y0_t2,JSON.stringify(x.L.slice(0,2)));
  STORY.T2_P=0.5;
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
