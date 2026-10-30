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
  const e12=STORY_EVENTS.find(e=>e.id==='ev_y0_e12'); check('0. ev_y0_e12 在（醉月湖南岸、11/6 17:30～18:00；AA_304 第 3 列）',!!e12&&e12.near&&e12.time[0]===17.5); if(!e12){ console.log('FAILED '+fails); process.exit(1); }
  let spawned=[], opened=[]; GM.spawnCharacter=(id,x,z)=>{ spawned.push([id,x,z]); GM.npc[id]={id,obj:{position:{x,y:0,z},rotation:{y:0}}}; return GM.npc[id]; }; GM.openPhone=(tab,th)=>opened.push([tab,th]);
  fresh(D6,17,'campus'); run(); check('1. 17:00 還沒有邀約',!TH('p:kexin').includes('今天下課以後，去湖邊坐一下？'));
  at(D6,17.6); check('1. 17:30 可昕私訊（AA_303 第 2 節 12：「今天下課以後，去湖邊坐一下？」一則；沒有「一定要在湖邊問」）',TH('p:kexin').includes('今天下課以後，去湖邊坐一下？')&&!TH('p:kexin').includes('今天晚上八點，醉月湖。')&&!TH('p:kexin').some(t=>/一定要在湖邊問/.test(t)),JSON.stringify(TH('p:kexin')));
  const q=OUT.get(G,'y0_e12'); check('1. 出發選單「醉月湖 17:45」（只帶到湖邊；AA_304 第 3 列）',!!q&&q.title==='醉月湖 17:45'&&!!q.goto&&q.goto.zone==='campus');
  const snap=JSON.stringify(G);
  // 搭出發選單過去
  let entered=null; GM.enter=async(z,sp)=>{ entered=[z,sp]; G.zone=z; }; G.hour=17.4; await OUT.go(GM,q);
  check('2. 出發：17:40 到、進校園的南岸步道（醉月湖）',entered&&entered[0]==='campus'&&Math.abs(entered[1].z+97.2)<0.5&&Math.abs(G.hour-(17.75-1/12))<0.01,JSON.stringify([entered,G.hour]));
  run(); check('2. 17:30～18:00 在校園：可昕站在南岸步道',spawned.some(s=>s[0]==='kexin'&&Math.abs(s[2]+98.5)<0.1));
  check('2. 走到她旁邊就演（事件條件成立）',EVENTS.check(e12));
  picks=['書店','第三隻手']; said=[]; await EVENTS.run(e12); const L=said.map(x=>x.t);
  check('2. AA_303 第 2 節 12（整段換：坐在湖邊聊天、剛好聊到長頸鹿）：傍晚湖邊 →「休學的人，今天做了什麼？」→「去書店站了一下午。」→「看什麼？」「……法律的。」「喔。」→ 鷺鷥 → 動物園的長頸鹿、尾巴 →「我要第三隻手，幫妳拿尾巴。」→「（愣了一下，笑出來）……你在講什麼。」→「好冷。走吧。」、E12_ANSWER＝hand；沒有「假設」、沒有保齡球照片',L[0]==='（傍晚。她剛上完體育課，你們坐在醉月湖邊的椅子上。湖對面的燈一盞一盞亮起來。）'&&L[1]==='休學的人，今天做了什麼？'&&JSON.stringify(L.slice(2,5))===JSON.stringify(['看什麼？','……法律的。','喔。'])&&L[5]==='（湖邊有一隻鷺鷥，腳很長，站著不動。）'&&L.includes('……我小時候在動物園，看長頸鹿看了一整個下午。')&&L.includes('我最喜歡牠的尾巴。尾端有一撮毛，可以趕蒼蠅。')&&L[L.length-2]==='（愣了一下，笑出來）……你在講什麼。'&&L[L.length-1]==='好冷。走吧。'&&!L.some(t=>/假設|保齡球/.test(t))&&G.flags.E12_ANSWER==='hand',JSON.stringify(L));
  at(D6,18.4); check('2. 演過了：18:15 沒有手機版',!PHONE.sent(G,'y0_e12_phone'));
  for(const [l5a,ans,line] of [[true,'latte','對。所以它是馬。'],[false,'how','看了一整個下午啊。']]){ G=JSON.parse(snap); SOCIAL.bind(G); EVENTS.bind(GM); if(l5a) G.events.done.ev_y0_l5a=1; picks=['睡到中午','拉花']; said=[]; await EVENTS.run(e12); const L3=said.map(x=>x.t);
    check('2. 「拉花那隻，尾巴也沒畫。」只在 10/12 長頸鹿拉花去過才有（'+(l5a?'去過＝選得到':'沒去＝沒有這個選項，落到第一個')+'）→ E12_ANSWER＝'+ans,G.flags.E12_ANSWER===ans&&L3.includes('……好羨慕。')&&L3.includes(line),JSON.stringify(L3.slice(-3))); }
  // 沒到
  G=JSON.parse(snap); SOCIAL.bind(G); EVENTS.bind(GM); opened=[]; G.zone='dorm'; at(D6,18.4); check('3. 18:30 以前不發手機版（AA_307 第 10 列）',!PHONE.sent(G,'y0_e12_phone'));
  at(D6,18.6); const T=PHONE.thread(G,'p:kexin').map(m=>m.text);
  check('3. 18:30 手機版（AA_307 第 10 列）：「你沒來喔。」「湖邊有一隻鷺鷥，腳好長，站著不動。」「……我想到長頸鹿。」「好冷。我先回去了。」；沒有長頸鹿尾巴、椅子',T.includes('你沒來喔。')&&T.includes('湖邊有一隻鷺鷥，腳好長，站著不動。')&&T.includes('……我想到長頸鹿。')&&!T.some(t=>/假設|椅子|那我用打的/.test(t))&&T[T.length-1]==='好冷。我先回去了。',JSON.stringify(T.slice(-5)));
  const m=PHONE.thread(G,'p:kexin').find(x=>x.text==='好冷。我先回去了。');
  check('3. 三個接法、一定要回（must）；沒回之前 PHONE.mustOpen',m.ask.must===true&&m.ask.opts.length===3&&PHONE.mustOpen(G,'p:kexin'));
  run(); check('3. 自動打開和可昕的對話',opened.some(o=>o[0]==='msg'&&o[1]==='p:kexin'));
  PHONE.answer(G,m.ask.id,2); check('3. 回「明天補妳一次。」：E12_ANSWER＝tomorrow、可以關了；她回「……不用補。睡飽一點。」（AA_525 3-8 K-14 改句，原「好。明天。不准再睡著。」）',G.flags.E12_ANSWER==='tomorrow'&&!PHONE.mustOpen(G,'p:kexin')&&(()=>{ const T2=PHONE.thread(G,'p:kexin').map(x=>x.text); return T2[T2.length-1]==='……不用補。睡飽一點。'; })());
  // 睡著
  G=JSON.parse(snap); SOCIAL.bind(G); EVENTS.bind(GM); opened=[]; GM.D.active=true; at(D6+1,8); check('4. 隔天醒來（別的事件進行中時先不開）：訊息照 18:30 的時間',(()=>{ const x=PHONE.thread(G,'p:kexin').find(y=>y.text==='你沒來喔。'); return x&&x.day===D6&&Math.abs(x.h-18.5)<0.05; })()&&!opened.length);
  GM.D.active=false; run(); check('4. 事件結束後才打開',opened.length===1);
  /* BUG-E12-ARRIVE-LATE（BB-C 11:1x）：休學在家（ECONFF 第二階段）不排出遊（從家出發 30 分鐘、到的時候已經過了 17:30～18:00）；邀約照發，由 econff3d.js STEPS2 h3 17:45 直接帶到湖邊 */
  { const had=global.ECONFF; global.ECONFF={on2:()=>true}; fresh(D6,17,'home',{Y0_MOVED_OUT:true}); at(D6,17.4); global.ECONFF=had;
    check('7. 休學在家那一年：17:20 邀約照發、不排「醉月湖 17:45」出遊（BB-C BUG-E12-ARRIVE-LATE）',TH('p:kexin').includes('今天下課以後，去湖邊坐一下？')&&!OUT.get(G,'y0_e12'),JSON.stringify(OUT.get(G,'y0_e12'))); }
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
