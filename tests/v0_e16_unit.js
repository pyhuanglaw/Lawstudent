// v0 E16 經濟學原理的分組報告（BB_104 8b-8）：第 15 週分工、第 16 週報告、前一晚私訊、翹課版——不需要瀏覽器。用法：node tests/v0_e16_unit.js
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
  const items=w=>{ for(let d=-400;d<0;d++){ const t=CALENDAR.termOf(d); if(!t||t.id!=='Y0S1'||t.week!==w) continue; const it=CLS.dayItems({day:d,hour:8,stage:'econ',flags:{}},d).find(x=>x.c.id==='econ_principles_y0'&&!x.exam); if(it) return it; } };
  const w15=items(15), w16=items(16); check('0. 經原第 15 週 12/9、第 16 週 12/16',CALENDAR.dateOf(w15.day).key==='2024-12-09'&&CALENDAR.dateOf(w16.day).key==='2024-12-16');
  const after=async(it,pick)=>{ G.day=it.day; G.hour=it.t1+0.05; G.weekday=wdOf(it.day); said=[]; picks=pick?[pick]:[]; await CLS.afterClassEvent(GM,it); return said.map(x=>x.t); };
  fresh(w15.day,w15.t1+0.05,'boya'); G.events.done.ev_y0_e02=1; let L=await after(w15,'寫報告');
  check('1. 第 15 週下課：小桌子、品妤分工、韋綸消失、可昕的機制、「你要做哪一塊？」→ E16_ROLE',L[0]==='（第 15 週，經原教到囚犯困境。下課後，四個人在博雅的小桌子。）'&&L.includes('（韋綸消失了。）')&&L[L.length-1]==='（看你）你要做哪一塊？'&&G.flags.E16_ROLE==='report',JSON.stringify(G.flags.E16_ROLE));
  at(w16.day-1,23.2); check('2. 寫報告：12/15 23:00 可昕「你在寫嗎」「……我也是。」',TH('p:kexin').includes('你在寫嗎')&&TH('p:kexin').includes('……我也是。'));
  L=await after(w16); check('2. 第 16 週：「韋綸那段由你補。」→ 報告結束 → 魏教授',JSON.stringify(L)===JSON.stringify(['韋綸那段由你補。','（報告結束。韋綸最晚交，請了大家宵夜。）','（看完簡報）這一組四個人，只有一個背叛。比例不錯。']),JSON.stringify(L));
  at(w16.day,13); check('2. 上台報告了：沒有品妤那句、E16_ROLE 不變',!PHONE.sent(G,'y0_e16_absent')&&G.flags.E16_ROLE==='report');
  fresh(w15.day,w15.t1+0.05,'boya'); G.events.done.ev_y0_e02=1; await after(w15,'上台'); L=await after(w16); check('3. 上台：魏教授問了最難的一題',L[0]==='魏教授問了最難的一題。台下的可昕比了一個「慢慢來」。');
  fresh(w15.day,w15.t1+0.05,'boya'); G.events.done.ev_y0_e02=1; await after(w15,'做簡報'); at(w16.day-1,23.5); check('3. 做簡報：沒有前一晚的私訊',!TH('p:kexin').includes('你在寫嗎'));
  at(w16.day,12.6); check('4. 第 16 週翹課：品妤群組「報告順利。你的那段，可昕替你講了。」、E16_ROLE＝absent',TH('g:econ_class').includes('報告順利。你的那段，可昕替你講了。')&&G.flags.E16_ROLE==='absent');
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
