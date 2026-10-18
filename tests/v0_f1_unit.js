// v0 F1 經濟系群組的小年夜（BB_110 F1；AA_154 A17、A18）：1/27 21:00 群組、三種回覆、沒看手機；XL-2 已刪除（AA_218 第 11 節）——不需要瀏覽器。
// 修改前沒有這則群組（全部失敗）。用法：node tests/v0_f1_unit.js
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
  const FD=STORY.dayOfKey('2025-01-27'); check('0. 2025-01-27 是週一（除夕前一天）',CALENDAR.dateOf(FD).wd===1);
  fresh(FD,20.9,'home'); PHONE.join(G,'econ_friends','走啦'); run(); check('1. 21:00 以前沒有',!PHONE.sent(G,'y0_f1'));
  at(FD,21.1); const T=TH('g:econ_friends');
  check('1. 21:00「走啦」品妤的表格…阿勳一句（表叔）…韋綸墾丁…唐睿貼圖…可昕「明天年夜飯你們家幾個人？我家十二個」（BB_179 段 E 3-3）',T[0]==='📷（一張表格）各縣市年菜價格比較。台北最貴。'&&T.includes('我家今年三個阿姨、兩個舅舅，還有一個不知道為什麼會來的表叔。')&&T.includes('（貼圖：拍手）')&&!T.some(t=>/期望值|變異數|代價/.test(t))&&T.includes('枋寮。……好啦，坐火車到枋寮。')&&T[T.length-1]==='明天年夜飯你們家幾個人？我家十二個'&&T.length===9,JSON.stringify(T));
  const q=PHONE.thread(G,'g:econ_friends').find(m=>m.ask); check('1. 三個回覆：十三個／四個／（已讀，不回），開到 1/28 18:00（AA_154 A43）',!!q&&q.ask.opts.length===3&&q.ask.opts[2].t==='（已讀，不回）'&&q.ask.until===(FD+1)*24+18);
  const snap=JSON.stringify(G);
  PHONE.answer(G,'y0_f1',0); check('2. 「加阿勳的表叔，十三個。」：阿勳「……他應該會很困惑。」、Y0_UNCLE（AA_200 7-4）',TH('g:econ_friends').includes('……他應該會很困惑。')&&G.flags.Y0_UNCLE===true);
  G=JSON.parse(snap); SOCIAL.bind(G); EVENTS.bind(GM); PHONE.answer(G,'y0_f1',1); check('2. 「四個。」：品妤「跟我家一樣。」、沒有記號',TH('g:econ_friends').includes('跟我家一樣。')&&!G.flags.Y0_UNCLE&&!G.flags.Y0_F1_SEEN);
  G=JSON.parse(snap); SOCIAL.bind(G); EVENTS.bind(GM); PHONE.answer(G,'y0_f1',2); const T3=TH('g:econ_friends');
  check('2. （已讀，不回）：不替玩家傳話、可昕「祐廷已讀不回喔。」、Y0_F1_SEEN',T3.includes('祐廷已讀不回喔。')&&!T3.includes('（已讀，不回）')&&G.flags.Y0_F1_SEEN===true);
  G=JSON.parse(snap); SOCIAL.bind(G); EVENTS.bind(GM); at(FD+1,18.1); check('3. 沒打開手機：群組留著、沒有人追問、沒有記號；1/28 18:00 以後不能回',!TH('g:econ_friends').includes('祐廷已讀不回喔。')&&!G.flags.Y0_F1_SEEN&&!PHONE.answer(G,'y0_f1',0));
  fresh(FD,21.1,'home'); run(); check('4. 沒有「走啦」：發在全班群組',TH('g:econ_class').includes('明天年夜飯你們家幾個人？我家十二個'));
  fresh(FD,21.1,'home',{},'law'); run(); check('4. 法律系開局的玩家：沒有',!PHONE.sent(G,'y0_f1'));
  { const x2=STORY_EVENTS.find(e=>e.id==='ev_y0_xl2'), W1=STORY.dayOfKey('2025-02-18'); const ck=(f,d,h)=>{ fresh(d||W1,h||20,'dorm',f); return !!x2&&EVENTS.check(x2); };
    check('5. XL-2 刪除（AA_218 第 11 節、AA_154 0b-2：10/17 休學）：事件標 retired，Y0S2 第 1 週晚上在宿舍、有 Y0_UNCLE 也不觸發',!!x2.retired&&!ck({Y0_UNCLE:true})&&!ck({})); }
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
