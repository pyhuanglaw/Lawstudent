// v0 C2 自己的社團：社課邀約、出發選單、三個社團的事件、唐睿的劇社私訊刪除（AA_218 第 11 節、AA_154 0b-2，2026-10-17 祐廷 10/17 休學），E07 選的社團群組照舊；E15 宿營邀約（BB_104 8b-7）照舊——不需要瀏覽器。用法：node tests/v0_c2_unit.js
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
  const K=k=>STORY.dayOfKey(k), M4=K('2024-11-04'), T5=K('2024-11-05'), H7=K('2024-11-07');
  const eg=STORY_EVENTS.find(e=>e.id==='ev_y0_c2_guitar'), eh=STORY_EVENTS.find(e=>e.id==='ev_y0_c2_hiking'), eb=STORY_EVENTS.find(e=>e.id==='ev_y0_c2_badminton');
  const RET=e=>!!e&&typeof e.retired==='string'&&e.retired.includes('AA_218');
  check('0. C2 三個社團的事件定義還在（給舊存檔）、標 retired（AA_218 第 11 節）',RET(eg)&&RET(eh)&&RET(eb)); if(!eg||!eh||!eb){ console.log('FAILED '+fails); process.exit(1); }
  const noC2=()=>!PHONE.sent(G,'y0_c2_ask')&&!OUT.get(G,'y0_c2')&&(OUT.due(G)||{}).id!=='y0_c2';
  // 吉他社
  fresh(M4,12,'campus',{Y0_CLUB:'guitar'}); run(); at(M4,12.6); at(M4,18.8);
  check('1. 吉他社：照舊在「吉他社」群組；11/4 12:30 以後沒有社課訊息、沒有出發選單',PHONE.inGroup(G,'y0_guitar')&&!TH('g:y0_guitar').length&&noC2());
  G.zone='wancai'; G.hour=18.9; picks=['練到按出來']; said=[];
  check('1. 18:45～19:15 在萬才館：吉他社的第一堂不再觸發',!EVENTS.check(eg)); EVENTS.tick(0); await new Promise(r=>setTimeout(r,5));
  check('1. 在萬才館跑自動事件：沒有「今天只教一個和弦。C。……」、Y0_GUITAR_C 沒寫',!G.events.done.ev_y0_c2_guitar&&!said.some(x=>x.t.startsWith('今天只教一個和弦'))&&G.flags.Y0_GUITAR_C===undefined,JSON.stringify(said.slice(0,2)));
  // 登山社
  fresh(T5,12.6,'campus',{Y0_CLUB:'hiking'}); run(); at(T5,18.8);
  check('2. 登山社：照舊在「登山社」群組；11/5 12:30 以後沒有「今晚七點行前會。……」、沒有出發選單',PHONE.inGroup(G,'y0_hiking')&&!TH('g:y0_hiking').includes('今晚七點行前會。帶筆記本，不用帶裝備。')&&noC2());
  // 羽球社
  fresh(H7,12.6,'campus',{Y0_CLUB:'badminton'}); run(); at(H7,18.8);
  check('3. 羽球社：照舊在「羽球社」群組；11/7 12:30 以後沒有「今晚七點新體一樓。……」、沒有出發選單',PHONE.inGroup(G,'y0_badminton')&&!TH('g:y0_badminton').includes('今晚七點新體一樓。球拍社團有借，記得穿運動鞋。')&&noC2());
  G.zone='gym'; G.hour=19; check('3. 19:00 在新體：羽球社的第一次不再觸發',!EVENTS.check(eb));
  // 不參加
  fresh(T5,20.5,'dorm',{Y0_CLUB:'none'}); run(); at(T5,21.1); at(T5+1,12);
  check('4. 不參加：11/5 21:00 以後沒有唐睿「劇社缺一個會站著不動的人。……」、沒有 Y0_EXTRA',!PHONE.sent(G,'y0_c2_extra')&&!TH('p:econ_tangrui').includes('劇社缺一個會站著不動的人。你很適合。')&&G.flags.Y0_EXTRA===undefined);
  check('4. 不參加的玩家沒有社團群組',!PHONE.inGroup(G,'y0_guitar')&&!PHONE.inGroup(G,'y0_hiking')&&!PHONE.inGroup(G,'y0_badminton'));
  // E15 邀約
  const F22=K('2024-11-22'); fresh(F22-2,21.1,'dorm'); G.flags.P2_PICK='river'; G.name='小明'; run();
  check('5. E15：11/20 21:00 全班群組家豪學長兩則（第三小隊照玩家的名字）',TH('g:econ_class').includes('宿營這週五！中午十二點社科院門口集合，三天兩夜，遊覽車不等人。')&&TH('g:econ_class').includes('第三小隊：小明、可昕、阿勳、韋綸，小隊輔是我。帶拖鞋，外套帶厚一點，山上晚上很冷。')&&TH('g:econ_class').some(t=>t.startsWith('第三小隊：小明、可昕、阿勳、韋綸')));
  at(F22-1,22.1); check('5. E15：11/21 22:00「走啦」韋綸「明天誰遲到，大地遊戲就當鬼！」品妤「你上次遲到七分鐘。」',TH('g:econ_friends').includes('第三小隊！明天誰遲到，大地遊戲就當鬼！')&&TH('g:econ_friends').includes('你上次遲到七分鐘。'));
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
