// v0 ★E25 我想重考法律（BB_104 8-8、第 4 節；AA_154 A35）：17:30 手機自動打開、湖邊窗口、晚到延長、帶到場、三個回答、痕跡一句——不需要瀏覽器。
// 修改前沒有 ev_y0_e25（全部失敗）。用法：node tests/v0_e25_unit.js
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
  const D=STORY.dayOfKey('2025-03-19'); const ev=STORY_EVENTS.find(e=>e.id==='ev_y0_e25'); check('0. E25 在、3/19 是週三',!!ev&&CALENDAR.dateOf(D).wd===3); if(!ev){ console.log('FAILED '+fails); process.exit(1); }
  let opened=null; GM.openPhone=(a,b)=>{ opened=b; };
  fresh(D,17.4,'dorm'); run(); check('1. 17:30 以前沒有',!PHONE.sent(G,'y0_e25_ask'));
  at(D,17.6); const T=TH('p:kexin'); run();
  check('1. 17:30 祐廷傳出「今天晚上有空嗎？我有一件事想跟妳說。」→ 可昕「……八點，醉月湖。」「上次是我在那裡問你問題。這次換你。」；手機自動打開；出發選單 20:00 醉月湖',T.indexOf('今天晚上有空嗎？我有一件事想跟妳說。')>=0&&T.indexOf('今天晚上有空嗎？我有一件事想跟妳說。')<T.indexOf('……八點，醉月湖。')&&PHONE.thread(G,'p:kexin').find(m=>m.text==='今天晚上有空嗎？我有一件事想跟妳說。').from==='player'&&T.includes('……八點，醉月湖。')&&T.includes('上次是我在那裡問你問題。這次換你。')&&opened==='p:kexin'&&OUT.get(G,'y0_e25').goto.zone==='campus',JSON.stringify(T));
  const snap=JSON.stringify(G);
  G.zone='campus'; G.hour=19.9; check('2. 19:45～20:15 在湖邊：演',EVENTS.check(ev)); G.zone='dorm'; check('2. 不在校園：不演',!EVENTS.check(ev));
  G.zone='campus'; G.hour=20.3; run(); G.hour=20.4; run(); check('3. 20:15 沒到：20:20「我在湖邊。」、窗口延到 21:30',TH('p:kexin').includes('我在湖邊。')&&G.flags.E25_LATE&&EVENTS.check(ev));
  G.zone='dorm'; G.hour=21.6; run(); check('4. 21:30 還沒到：帶到場（E25_FORCE）',!!G.flags.E25_FORCE&&EVENTS.check(ev));
  said=[]; picks=['以為只有我']; G.flags.E19_ASK='none'; await EVENTS.run(ev); let L=said.map(x=>x.t);
  check('4. 帶到場：先「（你跑到醉月湖的時候，她還坐在那裡。）」→「我想重考。法律系。」…；E19 不問＝「我一直喜歡的是你。從來都是。」',L[0]==='（你跑到醉月湖的時候，她還坐在那裡。）'&&L[1]==='我想重考。法律系。'&&L.includes('我一直喜歡的是你。從來都是。')&&!L.some(t=>/不是唐睿/.test(t)),JSON.stringify(L));
  check('4. 「……我以為只有我。」→「笨蛋。我們兩個一起想了半年，誰都沒說。」、E25_ANSWER＝only_me；痕跡（E19 不問）「你那陣子什麼都沒問……」',L.includes('笨蛋。我們兩個一起想了半年，誰都沒說。')&&G.flags.E25_ANSWER==='only_me'&&L[L.length-1]==='你那陣子什麼都沒問，很有禮貌。我差點以為你不在乎。');
  const go=async(flags,pick,habitN)=>{ G=JSON.parse(snap); SOCIAL.bind(G); EVENTS.bind(GM); Object.assign(G.flags,flags); G.zone='campus'; G.hour=19.9; for(let i=0;i<(habitN||0);i++){ G.day=D-30+i; EVENTS.habit('invite:kexin'); } G.day=D; said=[]; picks=[pick]; await EVENTS.run(ev); return said.map(x=>x.t); };
  L=await go({E19_ASK:'direct',E21_ANSWER:'yes'},'從迎新那天');
  check('5. E19 直接問：「……不是唐睿。從來都不是。」；①迎新 →「沒有遞減。」、first_day；痕跡只說一句（E19 直接問優先）',L.includes('我一直喜歡的是你。不是唐睿。從來都不是。')&&L.includes('沒有遞減。')&&G.flags.E25_ANSWER==='first_day'&&L[L.length-1].startsWith('你那時候問我是不是唐睿。')&&!L.some(t=>t.startsWith('除夕那天你說好')),JSON.stringify(L));
  L=await go({E19_ASK:'joke',E21_ANSWER:'yes'},'除夕那天'); check('5. E21 說好（E19 開玩笑）：痕跡「除夕那天你說好。……」；③ new_year',L[L.length-1].startsWith('除夕那天你說好。')&&G.flags.E25_ANSWER==='new_year');
  L=await go({E19_ASK:'joke',E21_ANSWER:'serious'},'除夕那天',5); check('5. 約她 5 次以上：痕跡「你約我的次數，我有在算。我是經濟系的。」',L[L.length-1]==='你約我的次數，我有在算。我是經濟系的。');
  L=await go({E19_ASK:'joke',E21_ANSWER:'joke'},'除夕那天'); check('5. 都用玩笑帶過：痕跡「我們兩個是不是很笨？明明都知道。」',L[L.length-1]==='我們兩個是不是很笨？明明都知道。');
  L=await go({E19_ASK:'joke',E21_ANSWER:'serious'},'除夕那天'); check('5. 都不成立：預設「我想了一整個寒假，要怎麼跟你說。結果你先說了你要走。」',L[L.length-1]==='我想了一整個寒假，要怎麼跟你說。結果你先說了你要走。');
  check('6. 一次',!EVENTS.check(ev));
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
