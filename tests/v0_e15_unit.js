// v0 E15 經濟系宿營（BB_104 8b-7；AA_154 第 130 行）：出發選單、三天兩夜（演完是週日 16:00）、大合照、沒去版——不需要瀏覽器。用法：node tests/v0_e15_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|OUT)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/courses.js','src/data/events.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/story3d.js','src/classes3d.js']) load(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
let cgs=[], cards=[]; global.ADV={active:false,preload(){},begin(){},end(){},log(){},speaker(){},cg(id){ cgs.push(id); }}; global.CHAR={setExpr(){}};
global.LEGAL={ask:async()=>{},apply(){},stateOf:()=>'unseen',STATES:['unseen']};
let said=[], picks=[], rels=[], G=null;
const E={q:{level:'medium'},player:{busy:false,obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0},zone:{roomAt:()=>null,seats:[]},npcs:[],interactables:[],levels:null,setWeather(){},hour:0,endCinematic(){}};
const GM={get G(){ return G; },E,D:{active:false},npc:{},
  sceneBegin(){},sceneEnd(){},face(){},cine(){},caption(){},sleep:()=>Promise.resolve(),memo(){},autosave(){},addNote(){},energy(){},money(){},setGoal(){},toast(){},updateHUD(){},letterbox(){},phoneBadge(){},
  titleCard:async(a,b)=>{ cards.push(a+(b?'　'+b:'')); },enter:async(z)=>{ G.zone=z; },advance(h){ G.hour+=h; },fade:()=>Promise.resolve(),rel(id,d){ rels.push([id,d]); },walkTo:()=>Promise.resolve(true),sitAt(){},standUp(){},
  say:async(who,t)=>{ said.push({who:who?(who.name||String(who)):null,t}); },choose:async o=>{ const want=picks.shift(); if(typeof want==='string'){ const k=o.findIndex(q=>(q.t||q.text).includes(want)); return k<0?0:k; } return want||0; }};
const wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
const fresh=(day,hour,zone,flags,stage)=>{ G={v:3,day,hour,zone,stage:stage||'econ',weekday:wdOf(day),weather:'clear',energy:70,money:5000,flags:Object.assign({KX_FIRST_MSG:true,fundsV2:1,allowanceMonth:CALENDAR.dateOf(day).m},flags||{}),choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null,stats:{classes:0}};
  SOCIAL.bind(G); EVENTS.bind(GM); said=[]; picks=[]; rels=[]; };
const run=()=>{ STORY.phoneRules(GM); PHONE.tick(G); };
const at=(day,hour)=>{ G.day=day; G.hour=hour; G.weekday=wdOf(day); run(); };
const TH=th=>PHONE.thread(G,th).map(m=>m.text);
(async()=>{
  const K=k=>STORY.dayOfKey(k), F22=K('2024-11-22'); const e15=STORY_EVENTS.find(e=>e.id==='ev_y0_e15');
  check('0. ev_y0_e15（出遊）在',!!e15); if(!e15){ console.log('FAILED '+fails); process.exit(1); }
  fresh(F22,9,'dorm'); G.events.done.ev_y0_e02=1; run(); const q=OUT.get(G,'y0_e15');
  check('1. 11/22（五）早上：出發選單「社科院門口 12:00：經濟系宿營（三天兩夜）」、15 分鐘沒出發＝沒去',!!q&&q.h===12&&q.late===0.25&&q.title==='社科院門口 12:00：經濟系宿營（三天兩夜）');
  const snap=JSON.stringify(G);
  picks=['看星星']; said=[]; G.hour=11.7; await OUT.go(GM,q); const L=said.map(x=>x.t);
  check('2. 去了（AA_154 A54：經濟系宿營用 CG 帶過）：字卡「11 月 22 日～24 日　經濟系宿營」→ CG cg_econ_camp → 三句旁白；夜遊三選一、寢室冷笑話拿掉',cards[cards.length-1]==='11 月 22 日～24 日　經濟系宿營'&&JSON.stringify(cgs)===JSON.stringify(['cg_econ_camp'])&&JSON.stringify(L)===JSON.stringify(['（經濟系的宿營，山邊的青年活動中心。第三小隊：你、可昕、阿勳、韋綸，小隊輔是家豪學長。）','（三天裡，夜遊只有一支手電筒，大地遊戲你們拿了倒數第二，晚會上唐睿演了一條需求曲線。）','（週日早上，你們七個在活動中心門口自己拍了一張合照。）']),JSON.stringify([cards,cgs,L]));
  check('2. 沒有選項（夜遊三選一拿掉）、CG 已登錄（adv3d.js CG_REGISTRY）、圖檔在',!e15.dialogue.some(l=>l.choice)&&/cg_econ_camp:\{file:'assets\/cg\/econ\/cg_econ_camp\.webp'/.test(fs.readFileSync(path.join(ROOT,'src/adv3d.js'),'utf8'))&&fs.existsSync(path.join(ROOT,'assets/cg/econ/cg_econ_camp.webp')));
  check('2. 演完：11/24（日）16:00、星期日',G.day===F22+2&&Math.abs(G.hour-16)<0.05&&G.weekday===0,JSON.stringify([G.day-F22,G.hour,G.weekday]));
  run(); check('2. 去了：群組照片（09:00）「（活動中心門口，七個人的合照）」、沒有空位那張',TH('g:econ_class').includes('📷（活動中心門口，七個人的合照）')&&!PHONE.sent(G,'y0_e15_missed'));
  G=JSON.parse(snap); SOCIAL.bind(G); EVENTS.bind(GM); at(F22,12.5); OUT.expire(G); check('3. 12:15 還沒出發＝沒去',OUT.get(G,'y0_e15').state==='missed');
  at(F22+2,18.2); check('3. 沒去：11/24 18:00 群組大合照（第二排空位）＋阿勳私訊「冷笑話我留了一個給你。」',TH('g:econ_class').includes('📷（大合照。第二排有一個空位，韋綸在旁邊比了一個手勢。）')&&TH('p:econ_zhengxun').includes('冷笑話我留了一個給你。'));
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
