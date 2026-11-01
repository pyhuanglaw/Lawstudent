// V1-ECHO 大一的三個回聲（BB_134 第 1 節第 4 點；台詞 BB_96 2-5、BB_108 第 1 節）——不需要瀏覽器。
// 修改前沒有 ev_sis_flask_full、ev_kai_test_echo、跨年的貼圖（第 1、3、5 項失敗）。
// 用法：node tests/v1_echo_unit.js
// 用法：node tests/v2_b10_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/story3d.js','src/classes3d.js']) if(fs.existsSync(path.join(ROOT,f))) load(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
global.ADV={active:false,preload(){},begin(){},end(){},log(){},speaker(){},cg(){}}; global.CHAR={setExpr(){}};
global.LEGAL={ask:async()=>{},apply(){},stateOf:()=>'unseen',STATES:['unseen']};
let said=[], opts=[], picks=[], G=null;
const E={q:{level:'medium'},player:{busy:false,obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0},zone:{roomAt:()=>null,seats:[]},npcs:[],interactables:[],levels:null,setWeather(){},hour:0};
const GM={get G(){ return G; },E,D:{active:false},npc:{},
  sceneBegin(){},sceneEnd(){},face(){},cine(){},caption(){},sleep:()=>Promise.resolve(),memo(){},autosave(){},addNote(){},energy(){},money(){},setGoal(){},toast(){},updateHUD(){},letterbox(){},phoneBadge(){},
  titleCard:async()=>{},enter:async(z)=>{ G.zone=z; },advance(h){ G.hour+=h; },fade:()=>Promise.resolve(),rel(){},walkTo:()=>Promise.resolve(true),sitAt(){},standUp(){},
  say:async(who,t)=>{ said.push({who:who?(who.name||String(who)):null,t}); },choose:async o=>{ opts.push(o.map(q=>q.t||q.text)); const want=picks.shift(); if(typeof want==='string'){ const k=o.findIndex(q=>(q.t||q.text).includes(want)); return k<0?0:k; } return want||0; }};

const wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
const fresh=(day,hour,zone,flags)=>{ G={v:3,day,hour,zone,weekday:wdOf(day),weather:'clear',energy:70,money:5000,flags:Object.assign({KX_FIRST_MSG:true,fundsV2:1,allowanceMonth:CALENDAR.dateOf(day).m},flags||{}),choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null,stats:{classes:0}};
  SOCIAL.bind(G); EVENTS.bind(GM); INV.rec(G); said=[]; opts=[]; picks=[]; GM.npc={}; E.interactables=[]; E.npcs=[]; };
const termDay=(term,w,wd)=>STORY.termDay(term,w,wd);
const ev=id=>STORY_EVENTS.find(e=>e.id===id);
const lines=()=>said.map(s=>(s.who?s.who+'：':'')+s.t);
let caps=[]; GM.caption=(w,t)=>caps.push(t);
const after=async(day)=>{ G.day=day; G.weekday=wdOf(day); G.hour=12.17; G.zone='putong'; const it={c:{id:'econ_principles_2'}}; said=[]; opts=[]; caps=[]; return await CLS.afterClassEvent(GM,it); };
  const e=ev('ev_sk03_lunch'); check('1. ev_sk03_lunch 存在（afterClass econ_principles_2、大一下、週五）',!!e&&e.afterClass==='econ_principles_2'&&JSON.stringify(e.term)==='["Y1S2"]');
  if(!e){ console.log('FAILED '+fails); process.exit(1); }
  const F2=termDay('Y1S2',2,5), F3=termDay('Y1S2',3,5), F4=termDay('Y1S2',4,5), F5=termDay('Y1S2',5,5), F7=termDay('Y1S2',7,5), F9=termDay('Y1S2',9,5);
  fresh(F2,12.17,'putong',{introDone:true,classDone:true,afternoonDone:true});
(async()=>{

  /* 1. 已裝滿 */
  { const e=ev('ev_sis_empty_flask'), f=ev('ev_sis_flask_full'); check('1. ev_sis_flask_full：法學院圖書館（BB_207）、走到學姊旁邊（npcNear）、一次',!!f&&f.location==='lawlib'&&f.npcNear==='heroine_05'&&f.once);
    const D=termDay('Y1S2',8,2); fresh(D,15,'library',{}); SOCIAL.meet('heroine_05','library'); picks=['黑咖啡']; await EVENTS.run(e);
    const P=()=>f.prereq.custom(G), c=G.flags.flaskCoffeeDay; G.day=D; const a=P(); G.day=D+1; G.weekday=wdOf(D+1); const b=P(); G.day=D+8; const c8=P(); G.day=D+1;   /* 走到她旁邊（npcNear）這個條件要有真的人物，單元測試只測日期的條件 */
    said=[]; await EVENTS.run(f); const L=lines();
    fresh(D,15,'library',{}); SOCIAL.meet('heroine_05','library'); picks=['什麼都不說']; await EVENTS.run(e); G.day=D+1; const d=P();
    check('2. 買黑咖啡的玩家：當天不演、之後一週內演「（她的保溫瓶上貼了一張便條：「已裝滿」。）」、第 8 天不演；其他選項沒有',c===D&&!a&&b&&!c8&&L[0]==='（她的保溫瓶上貼了一張便條：「已裝滿」。）'&&!d,JSON.stringify({c,a,b,c8,L,d})); }
  /* 2. 阿凱一起測試 */
  { const k=ev('ev_kai_test_echo'); check('3. ev_kai_test_echo：宿舍、晚上、K2 後第二週',!!k&&k.location==='dorm'&&k.trigger==='enter');
    const D=termDay('Y1S2',6,3), at=(dd,hh,flags)=>{ fresh(D+dd,hh,'dorm',flags); G.events.done.ev_kai_engineer=1; G.events.last.ev_kai_engineer=D; return EVENTS.check(k); };
    const r={d6:at(6,19,{KAI_JOINS_TEST:true}),d7:at(7,19,{KAI_JOINS_TEST:true}),d14:at(14,19,{}),d15:at(15,19,{}),late:at(7,23.5,{})};
    at(7,19,{KAI_JOINS_TEST:true}); said=[]; await EVENTS.run(k); const L1=lines(), h1=G.hour; at(7,19,{}); said=[]; await EVENTS.run(k); const L2=lines();
    check('4. 第 7～14 天的晚上（18～23 點）才演；說好一起測的＝「測試。你說好的。」＋三個小時；其他＝「你錯過了史上最難的一關。」',!r.d6&&r.d7&&r.d14&&!r.d15&&!r.late&&L1[0]==='阿凱：測試。你說好的。'&&L1[1]==='（三個小時，你死了四十次；阿凱記下每一次。）'&&Math.abs(h1-22)<0.01&&JSON.stringify(L2)==='["阿凱：你錯過了史上最難的一關。"]',JSON.stringify({r,L1,h1,L2})); }
  /* 3. 學姊第一次貼圖 */
  { const nye=termDay('Y1S1',18,3), FM=()=>G.msgs.filter(m=>m.th==='g:family_law'&&(m.tag==='sis_first_sticker'||['（貼圖）','？？？','……學弟說過。'].includes(m.text))).map(m=>m.text);
    const run2=(flags)=>{ fresh(nye,23.8,'dorm',flags); PHONE.join(G,'family_law','法律系直屬家族'); STORY.phoneRules(GM); G.hour=24.1; PHONE.tick(G); return FM(); };
    const a=run2({SIS_NO_STICKER:true}), b=run2({});
    check('5. 跨年夜學姊第一次貼貼圖刪了（AA_218 17-12a：她不在群組主動發言）：有沒有 SIS_NO_STICKER 都沒有',!a.length&&!b.length,JSON.stringify([a,b])); }
  /* 4. V1-K2P：K2 霖澤館前品妤還在、椰林大道她先走（AA_147；events3d 的 leave） */
  { const k2=ev('ev_kexin_visits_ntu'); const slots={left:null,right:null}, log=[]; const A0=global.ADV;
    global.ADV=Object.assign({},A0,{slots,begin(o){ slots.right=o&&o.right?{charId:o.right.charId}:null; slots.left=null; },speaker(id){ if(!id||id==='player') return; if(slots.right&&slots.right.charId===id) return; if(slots.left&&slots.left.charId===id) return; if(!slots.left) slots.left={charId:id}; },hide(sl){ slots[sl]=null; },setBg(){},log(){},end(){}});
    const snap=[]; const sayO=GM.say; GM.say=async(who,t)=>{ snap.push([t,slots.left&&slots.left.charId]); said.push({who:who?(who.name||String(who)):null,t}); };
    fresh(termDay('Y1S1',6,6),16,'campus',{dating_kexin:true}); picks=['又是你']; await EVENTS.run(k2); GM.say=sayO; global.ADV=A0;
    const at=t=>(snap.find(x=>x[0]===t)||[])[1];
    check('6. K2：霖澤館前品妤的立繪還在（不說話）；椰林大道「品妤先回去了」那句時已經收起來',at('A館。以前每天從社科院看過來。……第一次走進來。')==='econ_pinyu'&&at('品妤先回去了。你們沿著椰影大道走出校門，在附近吃晚餐。')==null,JSON.stringify(snap.map(x=>[x[0].slice(0,12),x[1]]))); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外 '+(e&&e.stack||e)); process.exit(1); });
