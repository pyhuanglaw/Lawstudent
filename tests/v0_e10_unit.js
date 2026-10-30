// v0 ★E10 去總圖其實沒念（BB_104 8b-4；AA_154 第 116、117 行）：10/15 22:30 可昕邀、10/16 總圖三樓、前一晚的第一句、小福那一版——不需要瀏覽器。用法：node tests/v0_e10_unit.js
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
  const K=k=>STORY.dayOfKey(k), D15=K('2024-10-15'), D16=K('2024-10-16');
  const e10=STORY_EVENTS.find(e=>e.id==='ev_y0_e10'), e10b=STORY_EVENTS.find(e=>e.id==='ev_y0_e10b');
  check('0. ev_y0_e10（總圖三樓）、ev_y0_e10b（小松）在',!!e10&&!!e10b&&e10.location==='library'); if(!e10||!e10b){ console.log('FAILED '+fails); process.exit(1); }
  fresh(D15,22,'dorm'); run(); check('1. 10/15 22:00 還沒有邀約',!TH('p:kexin').includes('明天去總圖念書吧。期中考快到了。'));
  at(D15,22.6); const m=PHONE.thread(G,'p:kexin').find(x=>x.text==='明天去總圖念書吧。期中考快到了。');
  check('1. 10/15 22:30 沒去聚會的玩家：兩則「你今天沒來。我們玩了一整晚。」「明天去總圖念書吧。期中考快到了。」、好／明天不行',TH('p:kexin').includes('你今天沒來。我們玩了一整晚。')&&!!m&&m.ask.opts.map(o=>o.t).join('/')==='好。/明天不行。');
  const snap=JSON.stringify(G);
  // 答應
  G.flags.E10_GO='yes'; G.day=D16; G.weekday=wdOf(D16); G.hour=18.9; G.zone='library';
  check('2. 答應：10/16 19:00 走進總圖三樓就開始；在宿舍不會',EVENTS.check(e10)&&(()=>{ G.zone='dorm'; const r=!EVENTS.check(e10); G.zone='library'; return r; })());
  check('2. 18:30 以前、20:30 以後不會；10/15 不會',(()=>{ G.hour=18; const a=!EVENTS.check(e10); G.hour=20.6; const b=!EVENTS.check(e10); G.hour=19; G.day=D15; G.weekday=wdOf(D15); const c=!EVENTS.check(e10); G.day=D16; G.weekday=wdOf(D16); return a&&b&&c; })());
  picks=['先念書']; said=[]; G.hour=19; await EVENTS.run(e10); const L=said.map(x=>x.t);
  check('2. 第一句：前一晚沒去聚會＝「前一天晚上，群組裡一整晚都在聊天。」→ 總圖三樓 →「這題我看了五分鐘，還在第一行。」「你晚餐吃了沒？」（BB_179 段 B #32）',L[0]==='（前一天晚上，群組裡一整晚都在聊天。）'&&L[1]==='（隔天晚上，總圖三樓。她坐你對面，攤開微積分，看了五分鐘。）'&&L[2]==='（小聲）這題我看了五分鐘，還在第一行。'&&L[3]==='（小聲）你晚餐吃了沒？',JSON.stringify(L.slice(0,3)));
  check('2. 先念書：長頸鹿、E10_STUDY＝study；九點、去小松',L.includes('她點頭，低頭寫。一個小時後，你發現筆記的邊角多了一隻長頸鹿。')&&G.flags.E10_STUDY==='study'&&L[L.length-1]==='（已經在收筆袋）小松還開著。走吧。'&&Math.abs(G.hour-21)<0.01,JSON.stringify([G.flags.E10_STUDY,G.hour]));
  G.hour=21; check('2. 演過以後沒有小松那一版',!EVENTS.check(e10b));
  // 前一晚去了聚會
  G=JSON.parse(snap); SOCIAL.bind(G); EVENTS.bind(GM); G.flags.E10_GO='yes'; G.flags.E10_EVE='went'; G.day=D16; G.weekday=wdOf(D16); G.hour=19; G.zone='library'; picks=['吃了']; said=[]; await EVENTS.run(e10);
  check('3. 前一晚去了：第一句是「（前一天晚上，一群人在公館玩到很晚。回宿舍的路上，可昕傳來訊息。）」；「吃了。妳沒吃喔？」→「只吃了一個飯糰。……」、E10_STUDY＝chat',said[0].t==='（前一天晚上，一群人在公館玩到很晚。回宿舍的路上，可昕傳來訊息。）'&&said.some(x=>x.t==='只吃了一個飯糰。（她把微積分闔起來一半）好，再念半小時。')&&G.flags.E10_STUDY==='chat');
  // 不答應
  G=JSON.parse(snap); SOCIAL.bind(G); EVENTS.bind(GM); G.flags.E10_GO='no'; G.day=D16; G.weekday=wdOf(D16); G.hour=19; G.zone='library';
  check('4. 不答應：總圖那段不會；20:30 以後在哪裡都會在小松遇到她',!EVENTS.check(e10)&&(()=>{ G.hour=20.4; const a=!EVENTS.check(e10b); G.hour=21; G.zone='dorm'; return a&&EVENTS.check(e10b); })());
  said=[]; await EVENTS.run(e10b); check('4. 小松（AA_203 #19、BB_179 段 B #37）：門口碰到她抱著講義、「欸，你也來買宵夜。」「我一個人在總圖念到剛剛。……念不太進去。」、E10_STUDY＝chat',said.map(x=>x.t).join('|')==='你去小松買宵夜，在門口碰到她。她抱著一疊講義。|欸，你也來買宵夜。|我一個人在總圖念到剛剛。……念不太進去。'&&G.flags.E10_STUDY==='chat');
  // 答應了沒去
  G=JSON.parse(snap); SOCIAL.bind(G); EVENTS.bind(GM); G.flags.E10_GO='yes'; G.day=D16; G.weekday=wdOf(D16); G.hour=21; G.zone='campus'; check('5. 答應了但 20:30 還沒到總圖：小松那一版',EVENTS.check(e10b));
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
