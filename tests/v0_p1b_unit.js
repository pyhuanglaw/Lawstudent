// v0 P2 補上第一次聚會（「今天先回去」→ 下一次會計下課）、P1b 會計作業（第 2 次已刪除，AA_218 第 11 節）（BB_105 P1b、P2；AA_154 第 96、101、105 行）——不需要瀏覽器。
// 修改前：P2 一次（選了今天先回去就沒有了）、沒有 ev_y0_p1b1（第 1、2 項失敗）。用法：node tests/v0_p1b_unit.js
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
  const itemFor=week=>{ for(let d=-400;d<0;d++){ const t=CALENDAR.termOf(d); if(!t||t.id!=='Y0S1'||t.week!==week) continue; const it=CLS.dayItems({day:d,hour:8,stage:'econ',flags:{}},d).find(x=>x.c.id==='acct_y0'&&!x.exam); if(it) return it; } return null; };
  const w3=itemFor(3), w4=itemFor(4), w5=itemFor(5), w7=itemFor(7);
  check('0. 會計第 3、4、5、7 週都有課（9/19、9/26、10/3、10/17）',!!w3&&!!w4&&!!w5&&!!w7&&CALENDAR.dateOf(w5.day).key==='2024-10-03'&&CALENDAR.dateOf(w7.day).key==='2024-10-17');
  const after=async(it,pick)=>{ G.day=it.day; G.hour=it.t1+0.05; G.weekday=wdOf(it.day); said=[]; picks=pick?[pick]:[]; const r=await CLS.afterClassEvent(GM,it); await new Promise(r=>setTimeout(r,20)); return {ran:r,L:said.map(x=>x.t)}; };
  const after2=async(it,picks2)=>{ G.day=it.day; G.hour=it.t1+0.05; G.weekday=wdOf(it.day); said=[]; picks=picks2.slice(); const r=await CLS.afterClassEvent(GM,it); await new Promise(r=>setTimeout(r,60)); return {ran:r,L:said.map(x=>x.t)}; };
  // AA_272 第 13 節（d9aa4d9f）：P1b1 改第 4、5 週；同一天 P2 也要演＝先 P1b1、再接 P2
  { fresh(w3.day,w3.t1+0.05,'campus'); let r=await after(w3,'今天先回去');
    check('1. 第 3 週 P2 選「今天先回去」：韋綸「那下次！」',r.ran&&r.L.includes('那下次！'));
    r=await after2(w4,['和品妤對','總圖']); const i1=r.L.indexOf('（翻作業）借貸不平衡。差一百元。'), i2=r.L.indexOf('走啦！');
    check('1. 第 4 週會計下課：先 P1b1（教室裡對作業：和品妤對），再接 P2（門口被揪，這次選總圖）——不互相擠掉',r.ran&&i1===0&&r.L.includes('差一百。你從最後一行往回對，比較快。')&&i2>i1&&G.flags.P2_PICK==='library'&&!!G.events.done.ev_y0_p1b1,JSON.stringify(r.L));
    r=await after(w5); check('2. 第 5 週：P1b1、P2 都演過，會計下課沒有事件',!r.ran,JSON.stringify(r.L));
    r=await after(w7); check('2. 第 7 週（10/17 休學那天）P1b 第 2 次刪除（AA_218 第 11 節）：會計下課沒有韋綸「我的平衡了！」',!r.L.includes('我的平衡了！')&&!G.events.done.ev_y0_p1b2,JSON.stringify(r.L)); }
  // 第 3 週就去成
  { fresh(w3.day,w3.t1+0.05,'campus'); let r=await after(w3,'河濱'); r=await after(w4,'自己再算一次');
    check('3. 第 3 週去成：第 4 週只有 P1b1（沒有 P2）；自己再算一次 →（算到第三次，平了。）品妤「恭喜，你花了二十分鐘。」',r.ran&&!r.L.includes('走啦！')&&JSON.stringify(r.L.slice(-2))===JSON.stringify(['（算到第三次，平了。）','恭喜，你花了二十分鐘。']),JSON.stringify(r.L));
    r=await after(w5); check('3. 第 5 週：P1b1 演過了，不再演',!r.ran); }
  // 第 4、5 週都沒去 → 第 7 週不補
  { fresh(w3.day,w3.t1+0.05,'campus'); await after(w3,'河濱'); let r=await after(w5,'和阿勳對');
    check('4. 第 4 週沒去：第 5 週（10/3）補 P1b1',r.L.includes('阿勳只指了第五行。你就懂了。')&&!!G.events.done.ev_y0_p1b1,JSON.stringify(r.L));
    fresh(w3.day,w3.t1+0.05,'campus'); await after(w3,'河濱'); r=await after(w7,'和阿勳對');
    check('4. 第 4、5 週都沒去：第 7 週（10/17）不補 P1b1',!r.L.includes('阿勳只指了第五行。你就懂了。')&&!G.events.done.ev_y0_p1b1,JSON.stringify(r.L));
    check('4. 同一天不會再接第 2 次',!r.L.includes('我的平衡了！')); }
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
