// v0 E16 經濟學原理的分組報告：刪除（AA_218 第 11 節、AA_154 0b-2，2026-10-17 祐廷 10/17 休學）——事件標 retired、第 15／16 週下課不再演、報告前一晚的私訊與翹課的群組訊息不再排、E16_ROLE 不再寫。不需要瀏覽器。用法：node tests/v0_e16_unit.js
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
  const RET=id=>{ const e=STORY_EVENTS.find(x=>x.id===id); return !!e&&typeof e.retired==='string'&&e.retired.includes('AA_218'); };
  check('0. ev_y0_e16a（分組）、ev_y0_e16b（報告）定義還在（給舊存檔）、標 retired（AA_218 第 11 節）',RET('ev_y0_e16a')&&RET('ev_y0_e16b'));
  const items=w=>{ for(let d=-400;d<0;d++){ const t=CALENDAR.termOf(d); if(!t||t.id!=='Y0S1'||t.week!==w) continue; const it=CLS.dayItems({day:d,hour:8,stage:'econ',flags:{}},d).find(x=>x.c.id==='econ_principles_y0'&&!x.exam); if(it) return it; } };
  const w15=items(15), w16=items(14); check('0. 經原第 15 週 12/9；第 16 週 16 週制是期末考週，改用第 14 週 12/2 檢查（E16 已停用，日子不影響）',CALENDAR.dateOf(w15.day).key==='2024-12-09'&&CALENDAR.dateOf(w16.day).key==='2024-12-02');
  const after=async(it,pick)=>{ G.day=it.day; G.hour=it.t1+0.05; G.weekday=wdOf(it.day); said=[]; picks=pick?[pick]:[]; const r=await CLS.afterClassEvent(GM,it); return {r,L:said.map(x=>x.t)}; };
  fresh(w15.day,w15.t1+0.05,'boya'); G.events.done.ev_y0_e02=1; let x=await after(w15,'寫報告');
  check('1. 第 15 週經原下課：不演分組（沒有小桌子、沒有「你要做哪一塊？」）、E16_ROLE 沒寫',!x.r&&!x.L.length&&!G.events.done.ev_y0_e16a&&G.flags.E16_ROLE===undefined,JSON.stringify([x.r,x.L.slice(0,2),G.flags.E16_ROLE]));
  G.flags.E16_ROLE='report'; at(w16.day-1,23.2); check('2. 舊存檔 E16_ROLE＝report：12/15 23:00 也沒有可昕「你在寫嗎」「……我也是。」',!PHONE.sent(G,'y0_e16_night')&&!TH('p:kexin').includes('你在寫嗎')&&!TH('p:kexin').includes('……我也是。'));
  x=await after(w16); check('3. 第 16 週經原下課：不演報告（沒有「韋綸那段由你補。」、魏教授）',!x.r&&!x.L.length&&!G.events.done.ev_y0_e16b,JSON.stringify(x.L));
  fresh(w16.day,w16.t1+0.05,'boya'); G.events.done.ev_y0_e02=1; run(); at(w16.day,12.6); at(w16.day,13); at(w16.day+1,10);
  check('4. 第 16 週沒去上課：12:30 以後沒有品妤群組「報告順利。……」、E16_ROLE 沒寫成 absent',!PHONE.sent(G,'y0_e16_absent')&&!TH('g:econ_class').includes('報告順利。你的那段，可昕替你講了。')&&G.flags.E16_ROLE===undefined,JSON.stringify(G.flags.E16_ROLE));
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
