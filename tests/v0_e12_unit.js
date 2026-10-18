// v0 ★E12 長頸鹿的尾巴（BB_104 8-4；AA_154 A32）：17:30 邀約、出發選單帶到湖邊、她站在南岸、3D 版、20:30 手機版（一定要回）——不需要瀏覽器。用法：node tests/v0_e12_unit.js
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
  const K=k=>STORY.dayOfKey(k), D6=K('2024-11-06');
  const e12=STORY_EVENTS.find(e=>e.id==='ev_y0_e12'); check('0. ev_y0_e12 在（醉月湖南岸、11/6 19:45～20:15）',!!e12&&e12.near&&e12.time[0]===19.75); if(!e12){ console.log('FAILED '+fails); process.exit(1); }
  let spawned=[], opened=[]; GM.spawnCharacter=(id,x,z)=>{ spawned.push([id,x,z]); GM.npc[id]={id,obj:{position:{x,y:0,z},rotation:{y:0}}}; return GM.npc[id]; }; GM.openPhone=(tab,th)=>opened.push([tab,th]);
  fresh(D6,17,'campus'); run(); check('1. 17:00 還沒有邀約',!TH('p:kexin').includes('今天晚上八點，醉月湖。'));
  at(D6,17.6); check('1. 17:30 可昕私訊（暫定句）',TH('p:kexin').includes('今天晚上八點，醉月湖。')&&TH('p:kexin').includes('我有一個問題，一定要在湖邊問。'));
  const q=OUT.get(G,'y0_e12'); check('1. 出發選單「醉月湖 20:00」（只帶到湖邊）',!!q&&q.title==='醉月湖 20:00'&&!!q.goto&&q.goto.zone==='campus');
  const snap=JSON.stringify(G);
  // 搭出發選單過去
  let entered=null; GM.enter=async(z,sp)=>{ entered=[z,sp]; G.zone=z; }; G.hour=19.5; await OUT.go(GM,q);
  check('2. 出發：19:55 到、進校園的南岸步道（醉月湖）',entered&&entered[0]==='campus'&&Math.abs(entered[1].z+97.2)<0.5&&Math.abs(G.hour-(20-1/12))<0.01,JSON.stringify([entered,G.hour]));
  run(); check('2. 19:45～20:15 在校園：可昕站在南岸步道',spawned.some(s=>s[0]==='kexin'&&Math.abs(s[2]+98.5)<0.1));
  check('2. 走到她旁邊就演（事件條件成立）',EVENTS.check(e12));
  picks=['第三隻手']; said=[]; await EVENTS.run(e12); const L=said.map(x=>x.t);
  check('2. 原文三句（AA_295：拿掉「假設，你可以多一個身體部位。」）、「我要第三隻手，幫妳拿尾巴。」→「……這是我聽過最好的回答。」、E12_ANSWER＝hand',L[0]==='我想要一條長頸鹿的尾巴。'&&L[2]==='而且我想知道，有尾巴的人怎麼坐椅子。'&&!L.some(t=>/假設/.test(t))&&L[3]==='（愣了一下，笑出來）第三隻手喔。……好，那尾巴給你拿。'&&G.flags.E12_ANSWER==='hand',JSON.stringify(L));
  at(D6,20.6); check('2. 演過了：20:30 沒有手機版',!PHONE.sent(G,'y0_e12_phone'));
  // 沒到
  G=JSON.parse(snap); SOCIAL.bind(G); EVENTS.bind(GM); opened=[]; G.zone='dorm'; at(D6,20.2); check('3. 20:15 以前不發手機版',!PHONE.sent(G,'y0_e12_phone'));
  at(D6,20.6); const T=PHONE.thread(G,'p:kexin').map(m=>m.text);
  check('3. 20:30 手機版：「你沒來。那我用打的。」＋三則（AA_295）',T.includes('你沒來喔。')&&T.includes('沒關係，那我用打的。')&&T.includes('我想要一條長頸鹿的尾巴。')&&!T.some(t=>/假設/.test(t))&&T[T.length-1]==='而且我想知道，有尾巴的人怎麼坐椅子。',JSON.stringify(T.slice(-5)));
  const m=PHONE.thread(G,'p:kexin').find(x=>x.text==='而且我想知道，有尾巴的人怎麼坐椅子。');
  check('3. 三個接法、一定要回（must）；沒回之前 PHONE.mustOpen',m.ask.must===true&&m.ask.opts.length===3&&PHONE.mustOpen(G,'p:kexin'));
  run(); check('3. 自動打開和可昕的對話',opened.some(o=>o[0]==='msg'&&o[1]==='p:kexin'));
  PHONE.answer(G,m.ask.id,2); check('3. 回「為什麼不是貓的？」：E12_ANSWER＝cat、可以關了；她的回應＋收尾「……下次要在湖邊回答。這次先算你的。」',G.flags.E12_ANSWER==='cat'&&!PHONE.mustOpen(G,'p:kexin')&&(()=>{ const T2=PHONE.thread(G,'p:kexin').map(x=>x.text); return T2.includes('貓的太常見了。我想要一個大家都沒想過的東西。')&&T2[T2.length-1]==='……下次要在湖邊回答。這次先算你的。'; })());
  // 睡著
  G=JSON.parse(snap); SOCIAL.bind(G); EVENTS.bind(GM); opened=[]; GM.D.active=true; at(D6+1,8); check('4. 隔天醒來（別的事件進行中時先不開）：訊息照 20:30 的時間',(()=>{ const x=PHONE.thread(G,'p:kexin').find(y=>y.text==='你沒來喔。'); return x&&x.day===D6&&Math.abs(x.h-20.5)<0.05; })()&&!opened.length);
  GM.D.active=false; run(); check('4. 事件結束後才打開',opened.length===1);
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
