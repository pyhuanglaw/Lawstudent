// v0 E18b 可昕的生日（BB_104 8b-11）：群組約、出發選單、三種禮物、沒去版——不需要瀏覽器。
// 修改前沒有 ev_y0_e18b（全部失敗）。用法：node tests/v0_e18b_unit.js
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
  const D=STORY.dayOfKey('2025-04-24'); const ev=STORY_EVENTS.find(e=>e.id==='ev_y0_e18b'); check('0. E18b 在、4/24 是週四',!!ev&&CALENDAR.dateOf(D).wd===4); if(!ev){ console.log('FAILED '+fails); process.exit(1); }
  fresh(D-1,20.9,'home'); PHONE.join(G,'econ_friends','走啦'); run(); check('1. 4/23 21:00 以前沒有',!PHONE.sent(G,'y0_e18b_ask'));
  at(D-1,21.1); const q=OUT.get(G,'y0_e18b'); check('1. 4/23 21:00 品妤「4/24 可昕生日。公館豆花店，七點。……」＋出發選單 4/24 19:00',TH('g:econ_friends').includes('4/24 可昕生日。公館豆花店，七點。我那天請假了。重考生也要來，一碗豆花的時間而已。')&&!!q&&q.day===D&&q.h===19);
  const snap=JSON.stringify(G);
  for(const [pk,val,line] of [['筆記本','notebook','空白的。（翻了幾頁）……好，這本拿來寫我們互考的題目。'],['豆花','douhua','難怪你剛剛一直不見。'],['合送','group','謝謝大家。我回去再拆。']]){ G=JSON.parse(snap); SOCIAL.bind(G); EVENTS.bind(GM); G.day=D; G.hour=19; said=[]; picks=[pk]; await EVENTS.run(ev); const L=said.map(x=>x.t);
    check('2. 禮物「'+pk+'」→「'+line+'」、E18B_GIFT＝'+val,L[0]==='（豆花店最裡面那張桌子。桌上有一個小蛋糕，是品妤帶來的。）'&&L[1]==='（吹完蠟燭）好，許完了。'&&L.includes('那送禮物。一個一個來。')&&L[L.length-1]===line&&G.flags.E18B_GIFT===val,JSON.stringify(L)); }
  G=JSON.parse(snap); SOCIAL.bind(G); EVENTS.bind(GM); at(D,20.9); check('3. 沒去：21:00 以前沒有',!PHONE.sent(G,'y0_e18b_miss')); at(D,21.1);
  check('3. 沒去：21:00 品妤蛋糕照片、可昕「蛋糕有你的份。我先吃了。」、E18B_GIFT＝none',TH('g:econ_friends').includes('📷（生日蛋糕）')&&TH('p:kexin').includes('蛋糕有你的份。我先吃了。')&&G.flags.E18B_GIFT==='none');
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
