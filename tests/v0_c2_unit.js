// v0 C2 自己的社團（BB_110 第 3 節；AA_154 A37）＋E15 宿營邀約（BB_104 8b-7）——不需要瀏覽器。用法：node tests/v0_c2_unit.js
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
  check('0. C2 三個社團的事件在',!!eg&&!!eh&&!!eb); if(!eg){ console.log('FAILED '+fails); process.exit(1); }
  // 吉他社
  fresh(M4,12,'campus',{Y0_CLUB:'guitar'}); run(); check('1. 吉他社：在「吉他社」群組；12:30 以前沒有訊息',PHONE.inGroup(G,'y0_guitar')&&!TH('g:y0_guitar').length);
  at(M4,12.6); check('1. 11/4 12:30 吉他社群組「期中考完了。今晚七點，萬才館一樓，第一堂只教 C 和弦。」、出發選單帶到萬才館',TH('g:y0_guitar').includes('期中考完了。今晚七點，萬才館一樓，第一堂只教 C 和弦。')&&(()=>{ const q=OUT.get(G,'y0_c2'); return q&&q.goto&&q.goto.zone==='wancai'&&q.h===19; })());
  G.zone='wancai'; G.hour=18.9; check('1. 18:45～19:15 在萬才館就演；19:20 不會；在別的地方不會',EVENTS.check(eg)&&(()=>{ G.hour=19.3; const a=!EVENTS.check(eg); G.hour=18.9; G.zone='campus'; const b=!EVENTS.check(eg); G.zone='wancai'; return a&&b; })());
  picks=['練到按出來']; said=[]; await EVENTS.run(eg); let L=said.map(x=>x.t);
  check('1. 原文：只教 C、遠房親戚、韋綸探頭、「……我們系的。」；練到按出來＝Y0_GUITAR_C、「好。你是今天最晚走的人。」',L[0]==='今天只教一個和弦。C。三根手指，按到聲音乾淨為止。'&&L.includes('（從門口探頭）吉他社！走啦，騎腳踏車！')&&L[L.length-1]==='好。你是今天最晚走的人。'&&G.flags.Y0_GUITAR_C===true);
  // 登山社
  fresh(T5,12.6,'campus',{Y0_CLUB:'hiking'}); run(); const qh=OUT.get(G,'y0_c2');
  check('2. 登山社：11/5 12:30 群組「今晚七點行前會。帶筆記本，不用帶裝備。」、出發選單（2D 出遊）',TH('g:y0_hiking').includes('今晚七點行前會。帶筆記本，不用帶裝備。')&&qh&&qh.ev==='ev_y0_c2_hiking'&&!qh.goto);
  said=[]; G.hour=18.8; await OUT.go(GM,qh); L=said.map(x=>x.t); check('2. 行前會：「背包裡最重要的是什麼？」→ 水、外套、手電筒 →「垃圾袋。」',JSON.stringify(L)===JSON.stringify(['背包裡最重要的是什麼？','大家說水、外套、手電筒。','垃圾袋。']));
  // 羽球社
  fresh(H7,12.6,'campus',{Y0_CLUB:'badminton'}); run(); check('3. 羽球社：11/7 12:30 群組「今晚七點新體一樓，球拍社團有借。」、出發選單帶到新體',TH('g:y0_badminton').includes('今晚七點新體一樓，球拍社團有借。')&&OUT.get(G,'y0_c2').goto.zone==='gym');
  G.zone='gym'; G.hour=19; said=[]; check('3. 19:00 在新體就演',EVENTS.check(eb)); await EVENTS.run(eb); check('3. 學姊「羽球最重要的是，不要打到自己的頭。」三分鐘後',said[0].t==='羽球最重要的是，不要打到自己的頭。'&&said[1].t==='三分鐘後，你打到自己的頭。');
  // 不參加
  fresh(T5,20.5,'dorm',{Y0_CLUB:'none'}); run(); check('4. 不參加：21:00 以前沒有',!TH('p:econ_tangrui').length); at(T5,21.1); const m=PHONE.thread(G,'p:econ_tangrui').find(x=>x.text==='劇社缺一個會站著不動的人。你很適合。');
  check('4. 11/5 21:00 唐睿私訊、答應／不要；答應＝Y0_EXTRA',!!m&&m.ask.opts.map(o=>o.t).join('/')==='答應/不要'&&m.ask.opts[0].set.Y0_EXTRA===true);
  check('4. 不參加的玩家沒有社團群組',!PHONE.inGroup(G,'y0_guitar')&&!PHONE.inGroup(G,'y0_hiking')&&!PHONE.inGroup(G,'y0_badminton'));
  // E15 邀約
  const F22=K('2024-11-22'); fresh(F22-2,21.1,'dorm'); G.flags.P2_PICK='river'; G.name='小明'; run();
  check('5. E15：11/20 21:00 全班群組家豪學長兩則（第三小隊照玩家的名字）',TH('g:econ_class').includes('宿營這週五！中午十二點社科院門口集合，遊覽車不等人。')&&TH('g:econ_class').some(t=>t.startsWith('第三小隊：小明、可昕、阿勳、韋綸')));
  at(F22-1,22.1); check('5. E15：11/21 22:00「走啦」韋綸「明天誰遲到，大地遊戲就當鬼！」品妤「你上次遲到七分鐘。」',TH('g:econ_friends').includes('第三小隊！明天誰遲到，大地遊戲就當鬼！')&&TH('g:econ_friends').includes('你上次遲到七分鐘。'));
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
