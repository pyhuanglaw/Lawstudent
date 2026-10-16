// v0 E22 期末通宵、E21a 跨年（BB_104 8b-12、8b-13；AA_154 A36、A38）——不需要瀏覽器。用法：node tests/v0_e22_unit.js
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
  const K=k=>STORY.dayOfKey(k), S22=K('2024-12-22'), T31=K('2024-12-31');
  const e22=STORY_EVENTS.find(e=>e.id==='ev_y0_e22'), e21=STORY_EVENTS.find(e=>e.id==='ev_y0_e21a'); check('0. E22、E21a 在',!!e22&&!!e21); if(!e22){ console.log('FAILED '+fails); process.exit(1); }
  let entered=null; GM.enter=async(z)=>{ entered=z; G.zone=z; };
  fresh(S22,19.5,'dorm'); G.events.done.ev_y0_e02=1; run(); check('1. 12/22 20:00 以前沒有',!PHONE.sent(G,'y0_e22_ask'));
  at(S22,20.1); check('1. 20:00 群組：韋綸「今晚 B1 通宵。……奇蹟。」品妤「……咖啡我帶。」',TH('g:econ_class').includes('今晚 B1 通宵。明天那科，我需要一點奇蹟。')&&TH('g:econ_class').includes('奇蹟不是讀書方法。……十點，B1 門口。咖啡我帶。'));
  const q=OUT.get(G,'y0_e22'); check('1. 出發選單「總圖 B1 22:00：期末通宵」',!!q&&q.h===22&&q.late===0.25);
  const snap=JSON.stringify(G);
  picks=['第七章']; said=[]; G.hour=21.8; await OUT.go(GM,q); let L=said.map(x=>x.t);
  check('2. 01:00 演：開頭旁白、品妤兩句、阿勳「第七章會考。第八章不會。」',L[0]==='（凌晨一點，總圖 B1 的自習室。整排的桌子都有人，只聽得到翻頁和鍵盤的聲音。）'&&L.includes('（沒抬頭）第七章會考。第八章不會。'));
  check('2. 相信阿勳 →「考出來了。阿勳只說：『機率。』」；兩點回宿舍、晚歸登記',L.includes('考出來了。阿勳只說：「機率。」')&&L[L.length-1]==='（兩點，大家收東西。你走回宿舍，在舍監室登記晚歸。）'&&entered==='dorm'&&Math.abs(G.hour-26)<0.05,JSON.stringify([entered,G.hour]));
  G=JSON.parse(snap); SOCIAL.bind(G); EVENTS.bind(GM); at(S22,22.5); OUT.expire(G); at(S22,25.1); check('3. 沒去：01:00 群組照片（桌上四杯咖啡）',TH('g:econ_class').includes('📷（凌晨一點，總圖 B1。桌上四杯咖啡）'));
  // E21a
  fresh(T31,19.1,'library'); G.events.done.ev_y0_e02=1; run(); check('4. 12/31 19:00 群組三則',TH('g:econ_class').includes('今晚總圖，期末衝刺！走啦！')&&TH('g:econ_class').includes('讀到幾點？')&&TH('g:econ_class').includes('讀到……我說停為止。'));
  check('4. 19:00～22:00 在總圖（任何一層）就開始；在宿舍、22:30 不會',EVENTS.check(e21)&&(()=>{ G.zone='dorm'; const a=!EVENTS.check(e21); G.zone='library_hall'; const b=EVENTS.check(e21); G.hour=22.5; const c=!EVENTS.check(e21); G.zone='library'; G.hour=19.1; return a&&b&&c; })());
  const s2=JSON.stringify(G); picks=['會計會等']; said=[]; entered=null; G.hour=20; await EVENTS.run(e21); L=said.map(x=>x.t);
  check('4. 旁白帶到 B1、時間跳到 23:00 接「跨年還有一個小時」、信義人潮、零點',L[0].startsWith('（總圖 B1 的二十四小時自習室')&&L[1]==='（看手機）跨年還有一個小時。走啦！'&&L.includes('……我怕走散。')&&L.includes('（倒數。煙火。過了零點，她沒有放開。你也沒有。）'));
  check('4. 「會計會等我們。」→「（笑出聲）你學韋綸。」、E21A_WENT、回宿舍 01:00',L[L.length-1]==='（笑出聲）你學韋綸。'&&G.flags.E21A_WENT===true&&entered==='dorm'&&Math.abs(G.hour-25)<0.05,JSON.stringify([entered,G.hour]));
  G=JSON.parse(s2); SOCIAL.bind(G); EVENTS.bind(GM); const qa=OUT.get(G,'y0_e21a'); check('5. 出發選單「總圖 B1 19:00：期末衝刺」到 22:00 都可以出發',!!qa&&(()=>{ G.hour=21.9; const a=!!OUT.due(G); G.hour=22.1; return a&&!OUT.due(G); })());
  G.zone='dorm'; at(T31,24.2); check('6. 沒去：00:05 群組人潮照片＋可昕「你錯過了一場人潮。……下次。」',TH('g:econ_class').includes('📷（信義區的人潮）')&&TH('p:kexin').includes('你錯過了一場人潮。……下次。'));
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
