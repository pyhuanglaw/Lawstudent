// v0 E18 即興劇社的小公演（BB_104 8b-10；AA_154 A36）：邀約、出發選單、IMPROV_LINE／E12_ANSWER、Y0_EXTRA、沒去版——不需要瀏覽器。用法：node tests/v0_e18_unit.js
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
  const K=k=>STORY.dayOfKey(k), T28=K('2024-11-28'), F29=K('2024-11-29'); const e18=STORY_EVENTS.find(e=>e.id==='ev_y0_e18');
  check('0. ev_y0_e18 在',!!e18); if(!e18){ console.log('FAILED '+fails); process.exit(1); }
  fresh(T28,20.5,'dorm',{IMPROV_LINE:'而且我是來接你的計程車。',E12_ANSWER:'cat'}); run(); check('1. 11/28 21:00 以前沒有',!PHONE.sent(G,'y0_e18_ask'));
  at(T28,21.1); check('1. 21:00 可昕兩則',TH('p:kexin').includes('明天晚上七點，博雅。我們有小公演。')&&TH('p:kexin').includes('你來的話，我幫你留前面的位子。'));
  const q=OUT.get(G,'y0_e18'); check('1. 出發選單「博雅 19:00：即興劇小公演」、15 分鐘',!!q&&q.day===F29&&q.h===19&&q.late===0.25&&q.title==='博雅 19:00：即興劇小公演');
  const snap=JSON.stringify(G);
  picks=['她很會接']; said=[]; G.day=F29; G.hour=18.7; await OUT.go(GM,q); let L=said.map(x=>x.t);
  check('2. 去了：四十張椅子、唐睿主持、可昕「那個人剛剛說的那一句。」',L.includes('（四十張椅子。燈關掉，只開講台的燈。）')&&L.includes('（主持）接下來，請觀眾給我們一句台詞！')&&L.includes('那個人剛剛說的那一句。'));
  check('2. 她接 IMPROV_LINE（計程車）那一段；不接 E12',L.includes('計程車停在企鵝旁邊。司機說：『南極？跳表要算到明年。』')&&!L.some(t=>t.startsWith('這條尾巴不是貓的')),JSON.stringify(L));
  check('2. 散場後唐睿、「她很會接。」→「她什麼都接得住。……你上次那顆直球也是。」',L.includes('（散場後）你那句很好接。……你們排練過？')&&L[L.length-1]==='她什麼都接得住。……你上次那顆直球也是。');
  at(F29+1,13); check('2. 去了：沒有影片',!PHONE.sent(G,'y0_e18_missed'));
  // 沒有 IMPROV_LINE → E12
  G=JSON.parse(snap); SOCIAL.bind(G); EVENTS.bind(GM); G.flags.IMPROV_LINE=undefined; delete G.flags.IMPROV_LINE; picks=[]; said=[]; G.day=F29; G.hour=18.7; await OUT.go(GM,OUT.get(G,'y0_e18')); L=said.map(x=>x.t);
  check('3. 沒有 IMPROV_LINE：接 E12（為什麼不是貓的）那一段',L.includes('這條尾巴不是貓的。貓的太常見了。今天它負責趕蒼蠅。'));
  // Y0_EXTRA
  fresh(T28,21.1,'dorm',{Y0_EXTRA:true,E12_ANSWER:'hand'}); run(); const qx=OUT.get(G,'y0_e18');
  check('4. Y0_EXTRA：唐睿私訊臨時演員六點半到、出發選單 18:30',TH('p:econ_tangrui').includes('臨時演員六點半到。你的角色是一棵樹，台詞零句，責任重大。')&&qx.h===18.5&&!TH('p:kexin').includes('明天晚上七點，博雅。我們有小公演。'));
  picks=['只是笑']; said=[]; G.day=F29; G.hour=18.2; await OUT.go(GM,qx); L=said.map(x=>x.t);
  check('4. Y0_EXTRA：演一棵樹、可昕「（指著台邊的你）那棵樹剛剛偷偷說的那一句。」、唐睿多一句「你是今天最好的一棵樹。」',L[0]==='你在台上演一棵樹，站在台邊不動。'&&L.includes('（指著台邊的你）那棵樹剛剛偷偷說的那一句。')&&!L.includes('那個人剛剛說的那一句。')&&L.includes('你是今天最好的一棵樹。')&&L.includes('我多了一條尾巴。旁邊的人多了一隻手，專門幫我拿尾巴。'));
  // 沒去
  G=JSON.parse(snap); SOCIAL.bind(G); EVENTS.bind(GM); at(F29,19.5); OUT.expire(G); at(F29+1,12.2); check('5. 沒去：11/30 12:00 唐睿傳影片＋「她接了一句很像你會說的話。」',TH('p:econ_tangrui').includes('🎬（一段影片）')&&TH('p:econ_tangrui').includes('可昕昨天公演，接了一句很像你會說的話。'));
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
