// v0 E20 聖誕交換禮物（BB_153；AA_154 A36）：邀約、出發選單、禮物三選一、−500、GIRAFFE_KEYCHAIN 兩種沒去版——不需要瀏覽器。用法：node tests/v0_e20_unit.js
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
  const K=k=>STORY.dayOfKey(k), D23=K('2024-12-23'), D25=K('2024-12-25'), D26=K('2024-12-26');
  const e20=STORY_EVENTS.find(e=>e.id==='ev_y0_e20'), e20b=STORY_EVENTS.find(e=>e.id==='ev_y0_e20b'); check('0. ev_y0_e20、ev_y0_e20b 在',!!e20&&!!e20b); if(!e20){ console.log('FAILED '+fails); process.exit(1); }
  fresh(D23,21.1,'dorm'); G.events.done.ev_y0_e02=1; run(); check('1. 12/23 21:00 品妤群組',TH('g:econ_class').includes('12/25 晚上七點，公館火鍋。禮物兩百以內。地址等一下傳。'));
  at(D25,17.1); check('1. 12/25 17:00 韋綸「走啦！今天不念書！」品妤「念。吃完回去念。」',TH('g:econ_class').includes('今晚火鍋！我中午沒吃，留肚子。')&&TH('g:econ_class').includes('我六點下班直接過去。遲到的自己付湯底。'));
  const q=OUT.get(G,'y0_e20'); check('1. 出發選單 12/25 19:00、15 分鐘',!!q&&q.day===D25&&q.h===19&&q.late===0.25);
  const snap=JSON.stringify(G);
  GM.money=d=>{ G.money+=d; }; for(const id of ['kexin','econ_pinyu','econ_zhengxun']) SOCIAL.meet(id,'campus'); picks=['沙沙']; said=[]; const m0=G.money, py=SOCIAL.rel('econ_pinyu').fam||0, kc=SOCIAL.rel('kexin').comf||0; G.hour=18.7; await OUT.go(GM,q); const L=said.map(x=>x.t);
  check('2. 原文：十二月二十五日（AA-C 選 A：放寒假第三天）、六個人、看形狀猜',L[0]==='十二月二十五日，晚上七點。放寒假第三天，大家都還沒回家。'&&L.includes('抽籤太慢。一個人拿一個，看形狀猜。不能拿自己的。'));
  check('2. 撲克牌（阿勳）；沒拿記帳本＝唐睿「品妤的？……我會每一筆都記。」',L.includes('撲克牌。寒假教你算牌。')&&L.includes('（記帳本在唐睿手上。他翻了兩頁，收進背包。）'));
  check('2. 長頸鹿鑰匙圈：阿勳掛檯燈、店門口她塞一隻給你、GIRAFFE_KEYCHAIN',L.includes('她把一隻一模一樣的長頸鹿，塞進你手裡。')&&L[L.length-1]==='好，解散。到了在群組講一聲。'&&G.flags.GIRAFFE_KEYCHAIN===true);
  check('2. 錢 −500、品妤 +1、可昕自在 +2',G.money===m0-500&&(SOCIAL.rel('econ_pinyu').fam||0)-py===1&&(SOCIAL.rel('kexin').comf||0)-kc===2,JSON.stringify([m0-G.money]));
  G=JSON.parse(snap); SOCIAL.bind(G); EVENTS.bind(GM); picks=['扁扁']; said=[]; await OUT.go(GM,OUT.get(G,'y0_e20')); check('2. 拿記帳本：沒有唐睿那兩句',said.some(x=>x.t==='記帳本。每一筆都要記，今天的火鍋也算。')&&!said.some(x=>x.t==='（記帳本在唐睿手上。他翻了兩頁，收進背包。）'));
  // 沒去
  G=JSON.parse(snap); SOCIAL.bind(G); EVENTS.bind(GM); at(D25,19.5); OUT.expire(G);
  G.day=D26; G.hour=10; G.weekday=wdOf(D26); G.zone='gongguan'; check('3. 沒去：12/26～12/28 第一次走進公館有「你的份」（AA_224 3-5）',EVENTS.check(e20b));
  said=[]; await EVENTS.run(e20b); check('3. 「你昨天沒來。」→ 鑰匙圈 →「你的份。」、GIRAFFE_KEYCHAIN',said[0].t==='你昨天沒來。'&&said[said.length-1].t==='你的份。'&&G.flags.GIRAFFE_KEYCHAIN===true);
  G=JSON.parse(snap); SOCIAL.bind(G); EVENTS.bind(GM); at(D25,19.5); OUT.expire(G); at(D26+2,20.2); check('4. 12/28 20:00 以前沒去公館：可昕私訊「你的份，我放在你家信箱了。」、隔天早上拿到（AA_224 3-5）',TH('p:kexin').includes('你的份，我放在你家信箱了。')&&!G.flags.GIRAFFE_KEYCHAIN&&(()=>{ at(D26+3,8); return G.flags.GIRAFFE_KEYCHAIN===true; })());
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
