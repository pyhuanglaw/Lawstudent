// v0 ★E08 中秋系烤（BB_153；AA_154 第 88 行）＋經濟系那一年的兩個群組（AA_157）——不需要瀏覽器。
//   1. 經濟系開局：開頭沒有「走啦」（8/13 那張照片是一年後的事）；E02 迎新那天加入「經濟系 大一（全班）」；P2 去成的那晚韋綸建立「走啦」（今天先回去不建）；
//   2. 9/16（一）21:00 全班群組揪；9/21（六）16:00 韋綸私訊「烤肉你要去嗎？我在舟山路門口，可以一起走過去。」兩個選項；
//   3. 回「好」→ 出遊 17:00 河濱（ev_y0_e08）：原文、三個生火選項各自的台詞、月亮收租三個回答；可昕 +2、品妤、阿勳 +1；不記旗標；沒有「沒去」的照片；
//   4. 「今天不行」或沒回：21:30 群組照片＋可昕私訊；
//   5. 法律系開局照舊（第一天就有「走啦」和 8/13 的照片）。
// 修改前：經濟系開局第一天就有「走啦」（第 1 項失敗）、沒有 ev_y0_e08。用法：node tests/v0_e08_unit.js
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
  const D2=STORY.dayOfKey('2024-09-02'), D16=STORY.dayOfKey('2024-09-16'), D19=STORY.dayOfKey('2024-09-19'), D21=STORY.dayOfKey('2024-09-21');
  const e8=STORY_EVENTS.find(e=>e.id==='ev_y0_e08');
  check('0. ev_y0_e08 在（出遊、經濟系、一次、4 小時）',!!e8&&e8.trigger==='outing'&&e8.stage==='econ'&&e8.once&&e8.hours===4);
  // 1. 群組
  fresh(D2-1,21,'dorm'); run();
  check('1. 經濟系開局（9/1）：沒有「走啦」、沒有 8/13 的照片、還沒有全班群組',!PHONE.inGroup(G,'econ_friends')&&!PHONE.sent(G,'econ_photo_0813')&&!PHONE.inGroup(G,'econ_class'));
  G.events.done.ev_y0_e02=1; at(D2,15);
  check('1. E02 迎新那天：加入「經濟系 大一（全班）」（沒有訊息）',PHONE.inGroup(G,'econ_class')&&PHONE.rec(G).groups.econ_class.name==='經濟系 大一（全班）'&&!TH('g:econ_class').length);
  at(D16,21.1); check('2. 9/16（一）21:00 全班群組：「中秋系烤：9/21（六）17:00，河濱。自備餐具。」＋韋綸「我要去！有人要一起走過去嗎？」（段A #56）',JSON.stringify(TH('g:econ_class'))===JSON.stringify(['中秋系烤：9/21（六）17:00，河濱。自備餐具。','我要去！有人要一起走過去嗎？']),JSON.stringify(TH('g:econ_class')));
  check('1. 還沒有 P2：沒有「走啦」',!PHONE.inGroup(G,'econ_friends'));
  G.flags.P2_PICK='home'; at(D19,16); check('1. P2 選「今天先回去」：不建「走啦」',!PHONE.inGroup(G,'econ_friends'));
  G.flags.P2_PICK='river'; at(D19,17); check('1. P2 去成（河濱）：韋綸建立了群組「走啦」',PHONE.inGroup(G,'econ_friends')&&TH('g:econ_friends')[0]==='韋綸建立了群組「走啦」，把你加了進來。',JSON.stringify(TH('g:econ_friends')));
  // 2. 9/21 的私訊
  at(D21,15.5); check('2. 9/21 15:30：還沒有韋綸的私訊',!TH('p:econ_weilun').length);
  at(D21,16.1); const dm=PHONE.thread(G,'p:econ_weilun');
  check('2. 9/21 16:00：韋綸私訊「烤肉你要去嗎？我在舟山路門口，可以一起走過去。」、選項「好」「今天不行」',dm.length===1&&dm[0].text==='烤肉你要去嗎？我在舟山路門口，可以一起走過去。'&&dm[0].ask&&dm[0].ask.opts.map(o=>o.t).join('/')==='好/今天不行',JSON.stringify(dm.map(m=>[m.text,m.ask&&m.ask.opts.map(o=>o.t)])));
  // 3. 回「好」→ 出遊
  const snap=JSON.stringify(G);
  G.flags.E08_GO='yes'; at(D21,16.2); const q=OUT.get(G,'y0_e08');
  check('3. 回「好」：排出遊「中秋系烤」9/21 17:00 河濱',!!q&&q.day===D21&&q.h===17&&q.place==='河濱'&&q.ev==='ev_y0_e08');
  picks=['阿勳來','照坪數']; for(const id of ['kexin','econ_pinyu','econ_zhengxun']) SOCIAL.meet(id,'campus');   /* 正式遊玩時 E08 以前都認識了：阿勳 E01、可昕 E02、品妤 E02／P2 */ const famBefore=k=>SOCIAL.rel(k).fam||0; const f0={kexin:famBefore('kexin'),econ_pinyu:famBefore('econ_pinyu'),econ_zhengxun:famBefore('econ_zhengxun')};
  G.hour=16.6; await OUT.go(GM,q); const L=said.map(s=>s.t);
  check('3. 原文：「星期六傍晚。河濱的草地上，經濟系的人圍成好幾圈。」…韋綸「誰要生火？」',L[0]==='星期六傍晚。河濱的草地上，經濟系的人圍成好幾圈。'&&L[2]==='誰要生火？'&&L[3]==='生火的人先吃。',JSON.stringify(L.slice(0,5)));
  check('3. 選「阿勳來。」：三塊炭、「熱力學。」、韋綸的報紙；沒有另外兩個選項的台詞',L.includes('阿勳擺了三塊炭，劃了一根火柴。火一次就起來了。')&&L.includes('我帶了一整包報紙耶。')&&!L.includes('有。你先離火遠一點。')&&!L.includes('報紙捲成一根一根的，應該比較好燒。'));
  check('3. 月亮收租「照坪數算？」→「那我們只坐這一小塊，應該付不了多少。」；最後是回宿舍的路上',L.includes('如果月亮收租，我們要付多少？')&&L.includes('那我們只坐這一小塊，應該付不了多少。')&&!L.includes('那我們來得剛好。')&&L[L.length-1]==='回宿舍的路上，你的衣服都是炭的味道。',JSON.stringify(L.slice(-3)));
  check('3. 每句 40 字以內',L.every(t=>t.length<=40),L.filter(t=>t.length>40).join('|'));
  const fam=k=>famBefore(k)-f0[k];
  check('3. 數值：可昕熟悉 +2、品妤 +1、阿勳 +1',fam('kexin')===2&&fam('econ_pinyu')===1&&fam('econ_zhengxun')===1,JSON.stringify({kexin:fam('kexin'),py:fam('econ_pinyu'),zx:fam('econ_zhengxun')}));
  check('3. 演完是 21:00、出遊記成做過',Math.abs(G.hour-21)<0.01&&q.state==='done',G.hour);
  check('3. 不記旗標（生火、月亮的回答）',!Object.keys(G.flags).some(k=>/E08_(FIRE|MOON)/.test(k)));
  at(D21,21.6); check('3. 去了：沒有「沒去」的照片和可昕的私訊',!PHONE.sent(G,'y0_e08_missed')&&!TH('p:kexin').includes('你沒來。火很小，月亮很晚才出來。'));
  // 另外兩個生火選項
  for(const [pk,must] of [['韋綸來','有。你先離火遠一點。'],['我來','她每出一個主意，火就小一點。']]){ G=JSON.parse(snap); SOCIAL.bind(G); EVENTS.bind(GM); said=[]; picks=[pk,'打折']; G.flags.E08_GO='yes'; at(D21,16.2); G.hour=16.6; await OUT.go(GM,OUT.get(G,'y0_e08')); const L2=said.map(s=>s.t);
    check('3. 選「'+pk+'。」有自己的台詞、月亮「中秋過了，應該打折。」→「那我們來得剛好。」',L2.includes(must)&&L2.includes('那我們來得剛好。')&&L2.every(t=>t.length<=40)); }
  // 4. 沒去
  G=JSON.parse(snap); SOCIAL.bind(G); EVENTS.bind(GM); G.flags.E08_GO='no'; at(D21,17.5); check('4. 今天不行：沒有排出遊；18:00 以前還沒有照片',!OUT.get(G,'y0_e08')&&!PHONE.sent(G,'y0_e08_missed'));
  at(D21,21.6); check('4. 21:30 全班群組一張照片＋可昕私訊「你沒來。火很小，月亮很晚才出來。」',TH('g:econ_class').includes('📷（河濱的烤肉架、一圈人、一盤烤焦的玉米）')&&TH('p:kexin').includes('你沒來。火很小，月亮很晚才出來。'));
  G=JSON.parse(snap); SOCIAL.bind(G); EVENTS.bind(GM); at(D21,22); check('4. 沒回：一樣是沒去的版本',PHONE.sent(G,'y0_e08_missed'));
  // 5. 法律系開局照舊
  fresh(1,21,'dorm',{},'law'); run(); check('5. 法律系開局：第一天就有「走啦」和 8/13 的照片（照舊）',PHONE.inGroup(G,'econ_friends')&&PHONE.sent(G,'econ_photo_0813')&&!PHONE.inGroup(G,'econ_class'));
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
