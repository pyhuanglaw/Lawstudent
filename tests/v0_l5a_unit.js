// v0 L5a 長頸鹿拉花（BB_110 L5a；AA_154 A8、A42）：10/11 群組約＋出發選單、走進 Café 就演、店員（芷若）不記 FIRST_MET、沒去版——不需要瀏覽器。
// 修改前沒有 ev_y0_l5a（全部失敗）。用法：node tests/v0_l5a_unit.js
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
  const K=k=>STORY.dayOfKey(k), LD=K('2024-10-12'); check('0. 10/12 是週六、第 6 週',CALENDAR.dateOf(LD).wd===6&&CALENDAR.termOf(LD).week===6);
  const ev=STORY_EVENTS.find(e=>e.id==='ev_y0_l5a'); check('0. L5a 在',!!ev); if(!ev){ console.log('FAILED '+fails); process.exit(1); }
  fresh(LD-1,20.9,'dorm',{P2_PICK:'river'}); PHONE.join(G,'econ_friends','走啦'); run(); check('1. 10/11 21:00 以前沒有',!PHONE.sent(G,'y0_l5a_ask'));
  at(LD-1,21.1); const q=OUT.get(G,'y0_l5a');
  check('1. 10/11 21:00「走啦」可昕「溫州街有一間 Café，聽說拉花會畫長頸鹿。……我沒看過。我們去驗證。」＋出發選單 10/12 14:00 帶到 Café',TH('g:econ_friends').includes('溫州街有一間 Café，聽說拉花會畫長頸鹿。……我沒看過。我們去驗證。')&&!!q&&q.day===LD&&q.h===14&&q.late===0.25&&q.goto.zone==='cafe');
  const ck=(d,h,z)=>{ fresh(d,h,z); return EVENTS.check(ev); };
  check('2. 13:45～14:48 在 Café 才演（BB_214 第 4 節：14:15 從家出發也趕得上）；13:30、14:50、別的地方、10/19 都不演',ck(LD,13.8,'cafe')&&ck(LD,14.2,'cafe')&&ck(LD,14.7,'cafe')&&!ck(LD,13.5,'cafe')&&!ck(LD,14.85,'cafe')&&!ck(LD,14,'wenzhou')&&!ck(LD+7,14,'cafe'));
  fresh(LD,13.9,'cafe'); picks=['冰美式']; await EVENTS.run(ev); const L=said.map(x=>x.t), W=said.map(x=>x.who);
  check('3. 店員（芷若，名字只顯示「店員」）→ 點冰美式 → 可昕「可以畫長頸鹿嗎？」→ 店員「……我試試看。」… 唐睿「這是馬。」店員「這是很努力的長頸鹿。」→ 可昕笑到把湯匙掉在地上',L[0]==='店員是一個戴眼鏡的女生。她把每個人點的寫在一張小紙上。'&&L.includes('可以畫長頸鹿嗎？')&&L.includes('這是馬。')&&L.includes('這是很努力的長頸鹿。')&&L[L.length-1]==='可昕笑到把湯匙掉在地上。'&&W.filter(w=>w==='店員').length===2&&!W.some(w=>/芷若/.test(w||'')),JSON.stringify(said));
  check('3. Y0_CAFE_ORDER＝冰美式；芷若沒有 FIRST_MET、沒有聯絡方式',G.flags.Y0_CAFE_ORDER==='冰美式'&&!SOCIAL.has('heroine_02','FIRST_MET')&&!(typeof INV!=='undefined'&&INV.hasContact&&INV.hasContact(G,'heroine_02')));
  // 演了以後 16:00 沒有沒去版
  PHONE.join(G,'econ_friends','走啦'); G.hour=13.9; run(); at(LD,16.1); check('4. 去了：16:00 沒有照片',!PHONE.sent(G,'y0_l5a_miss'));
  // 沒去
  fresh(LD-1,21.1,'dorm'); PHONE.join(G,'econ_friends','走啦'); run(); at(LD,15.9); check('5. 沒去：16:00 以前沒有',!PHONE.sent(G,'y0_l5a_miss'));
  at(LD,16.1); const T=TH('g:econ_friends'); check('5. 沒去：16:00 品妤「📷（短脖子的長頸鹿）」「驗證結果：是馬。」可昕「是很努力的長頸鹿。」、沒有 Y0_CAFE_ORDER',T.includes('📷（短脖子的長頸鹿）')&&T.includes('驗證結果：是馬。')&&T.includes('是很努力的長頸鹿。')&&!G.flags.Y0_CAFE_ORDER);
  at(LD+7,10); check('5. 10/19 不再邀',PHONE.thread(G,'g:econ_friends').filter(m=>/長頸鹿。……我沒看過/.test(m.text)).length===1);
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
