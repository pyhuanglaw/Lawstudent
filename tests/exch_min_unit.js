// 交換的最小可玩流程（使用者 2026-10-17 21:3x，D99 第三優先；src/exchange3d.js）：申請交換 → 出發 → 抵達美國 → 進入公寓 → 外出 → 回公寓睡覺 → 推進隔天。
//   1. 申請：大三上第 1～11 週在宿舍有「交換申請（志願表）」，選「美國」記 EXCHANGE_ROUTE＝US；第 12 週以後、大二、已經選過的沒有；
//   2. 出發：2028-08-02 06:00 以後到期（8/1 沒有）；人在宿舍（每幀）或在家（家裡選單）都會出發 → 桃園機場；家裡的快轉停在出發那天早上；
//   3. 登機：09:30 起飛、舊金山轉機飛 19 小時、慢 12 小時 → 同一天當地 16:30 抵達，進公寓社區，US_ARRIVED（AA_370 M4；原本 13:00 出發、飛 16 小時、17:00 抵達）；
//   4. 在美國：台灣的課不排（大四上第 2 週）；手機「地點」只有公寓、社區；臨時場景的公寓有床（睡覺）、「出門」，社區有「回公寓」；
//   5. 凌晨 2:30 還在社區：走回公寓睡（不是台灣的宿舍），睡完日期往後。
// 修改前：沒有 EXCH（第 1 項就失敗）。用法：node tests/exch_min_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT|LADDER|HOME|HOME_LINES|EXCH)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/story3d.js','src/classes3d.js','src/exchange3d.js']) if(fs.existsSync(path.join(ROOT,f))) load(f);
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
  SOCIAL.bind(G); EVENTS.bind(GM); INV.rec(G); said=[]; opts=[]; picks=[]; GM.npc={}; E.interactables=[]; E.npcs=[]; if(STORY._fy) STORY._fy.reset(); };
const R=(id,fam,trust,comf)=>{ const r=SOCIAL.rel(id); r.fam=fam; r.trust=trust||0; r.comf=comf||0; };
const LV={ACQ:[10],FAM:[25],FRI:[45,30],CLO:[65,50,45]};
const run=(h0,h1,st)=>{ st=st||0.05; for(let h=h0;h<=h1+1e-9;h+=st){ G.hour=+h.toFixed(3); STORY.phoneRules(GM); PHONE.tick(G); } };
const termDay=(term,w,wd)=>STORY.termDay(term,w,wd);
const ev=id=>STORY_EVENTS.find(e=>e.id===id);
const lines=()=>said.map(s=>(s.who?s.who+'：':'')+s.t);
const TH=(th)=>(G.msgs||[]).filter(m=>m.th===th);
const D=k=>STORY.dayOfKey(k), T=(d,h)=>d*24+h; let entered=[];
GM.enter=async(z,sp)=>{ entered.push(z); G.zone=z; };
const at=(k,h,zone,flags)=>{ fresh(D(k),h,zone,Object.assign({fundsV2:1,ROOM_Y2:true,ROOM_Y2_ITEMS:true},flags||{}));   /* 大二起的房間（主線 3）早就搬好了 */ G.stage='law'; entered=[]; return G; };
(async()=>{
  check('0. 有 EXCH（departAt、depart、fly、tick、inUS、places）',typeof EXCH!=='undefined'&&['departAt','depart','fly','tick','inUS','places'].every(k=>typeof EXCH[k]==='function'));
  // 1（1A-02，AA_315：宿舍的「交換申請（志願表）」四選一拿掉了；路線在志願表截止 11/18 12:00 照交往狀態定，tests/route_decide_unit.js 細測）
  at(CALENDAR.dateOf(STORY.termDay('Y3S1',3,2)).key,15,'dorm'); E.player.obj.position={x:1,y:0,z:1}; E.interactables=[]; EXCH.tick(GM);
  check('1. 大三上第 3 週在宿舍：沒有「交換申請（志願表）」（不讓玩家選地點）',!EXCH.applyOpen(G)&&!E.interactables.some(i=>i.exchApply||/志願表/.test(i.label||'')));
  // 2
  at('2028-08-01',10,'campus',{EXCHANGE_ROUTE:'US'}); check('2. 8/1：還沒到出發',!EXCH.departDue(G)&&EXCH.departAt(G)===T(D('2028-08-02'),6));
  at('2028-08-02',7,'campus',{EXCHANGE_ROUTE:'US'}); E.interactables=[]; check('2. 8/2 07:00：到出發',EXCH.departDue(G));
  EXCH.tick(GM); await new Promise(res=>setTimeout(res,20));
  check('2. 人在 3D（校園）：每幀就出發 → 桃園機場（出境）；07:00 到機場（AA_370 M4）',entered[0]==='airport_dep'&&G.flags.US_DEPARTED===true&&Math.abs(G.hour-7)<1e-6,JSON.stringify({entered,h:G.hour}));
  at('2028-07-28',10,'campus',{EXCHANGE_ROUTE:'US'}); const nx=HOME.breakNext(G,T(G.day,G.hour));
  check('2. 家裡的快轉：停在出發那天早上（8/2 06:00 以前一定會停）',nx!=null&&nx<=T(D('2028-08-02'),6),JSON.stringify({nx,dep:T(D('2028-08-02'),6)}));
  at('2028-08-02',8,'campus',{EXCHANGE_ROUTE:'US'}); const H=HOME.rec(G); H.at=true; H.day=G.day; await HOME.loop(GM);
  check('2. 人在家（家裡選單）：也會出發',entered.includes('airport_dep')&&!HOME.at(G),JSON.stringify(entered));
  // 2b. AA_370 H2：出發以後一定飛美國（原本出境大廳有「搭車離開（回台北）」，搭了就永遠不會 US_ARRIVED）
  check('2b. 出發進出境大廳：記下進來的時間 US_AIRPORT_AT',G.flags.US_AIRPORT_AT!=null,String(G.flags.US_AIRPORT_AT));
  { at('2028-08-02',13,'airport_dep',{EXCHANGE_ROUTE:'US',US_DEPARTED:true,US_AIRPORT_AT:T(D('2028-08-02'),13)}); G.hour=13.5; EXCH.tick(GM); await new Promise(res=>setTimeout(res,20)); const a=!!G.flags.US_ARRIVED;
    G.hour=14; EXCH.tick(GM); await new Promise(res=>setTimeout(res,20));
    check('2b. 出境大廳待著：13:30 還沒登機，14:00（進來一小時）自動登機、抵達美國',!a&&G.flags.US_ARRIVED===true&&G.zone==='us_outside',JSON.stringify({a,arr:G.flags.US_ARRIVED,z:G.zone})); }
  { at('2028-08-03',10,'gongguan',{EXCHANGE_ROUTE:'US',US_DEPARTED:true}); EXCH.tick(GM); await new Promise(res=>setTimeout(res,20));
    check('2b. 舊存檔：出發以後搭車回了臺北（人在公館、沒抵達）→ 直接登機飛美國',G.flags.US_ARRIVED===true&&G.zone==='us_outside',JSON.stringify({arr:G.flags.US_ARRIVED,z:G.zone,entered})); }
  { const src=fs.readFileSync(path.join(ROOT,'src/us3d.js'),'utf8'); check('2b. us3d.js：交換出發中（US_DEPARTED、沒 US_ARRIVED）出境大廳不放「搭車離開（回台北）」',/if\(!\(typeof EXCH!=='undefined'&&fl\.US_DEPARTED&&!fl\.US_ARRIVED\)\) IT\.push\(\{x:X\.x,z:X\.z,radius:X\.r,lv:0,label:'搭車離開（回台北）'/.test(src)); }
  at('2028-08-02',13,'airport_dep',{EXCHANGE_ROUTE:'US',US_DEPARTED:true});
  // 3
  G.hour=8; await EXCH.fly(GM);
  check('3. 登機：09:30 起飛、飛 19 小時 → 同一天當地 16:30 抵達、進公寓社區、US_ARRIVED（AA_370 M4）',G.flags.US_ARRIVED===true&&G.zone==='us_outside'&&Math.abs(G.hour-16.5)<1e-6&&G.day===D('2028-08-02'),JSON.stringify({z:G.zone,h:G.hour}));
  check('3. 抵達以後不會再出發一次',!EXCH.departDue(G));
  // 4
  { const d=STORY.termDay('Y4S1',2,2); const g2=Object.assign({},G,{day:d,hour:8}); const a=CLS.dayItems(g2,d).length; const g3=Object.assign({},g2,{flags:Object.assign({},G.flags,{EXCHANGE_ROUTE:'TW'})}); const b=CLS.dayItems(g3,d).length;
    check('4. 在美國：台灣的課不排（大四上第 2 週週二）；留在台灣的照排',a===0&&b>0,JSON.stringify({US:a,TW:b})); }
  check('4. 手機「地點」：只有公寓、社區',JSON.stringify(EXCH.places().map(p=>p[0]))===JSON.stringify(['us_apartment','us_outside'])&&EXCH.inUS(G));
  { const src=fs.readFileSync(path.join(ROOT,'src/exchange3d.js'),'utf8'); check('4. 臨時場景：公寓有床「睡覺」、「出門」，社區有「回公寓」，機場有「登機」',/label:'睡覺',sleep:true/.test(src)&&/label:'出門',exit:\{to:'us_outside'/.test(src)&&/label:'回公寓',exit:\{to:'us_apartment'/.test(src)&&/label:'登機：飛往美國',exchFly:true/.test(src)); }
  // 5
  const d0=G.day; G.zone='us_outside'; G.hour=26.6; entered=[]; await STORY.forceHome(GM);
  check('5. 凌晨 2:30 還在社區：走回公寓睡（不是台灣的宿舍）',entered[0]==='us_apartment'&&!entered.includes('dorm'),JSON.stringify(entered));
  check('5. 睡完：隔天早上',G.day===d0+1||(G.day===d0&&G.hour<24&&G.hour>=5),JSON.stringify({day:G.day-d0,h:G.hour}));
  console.log(fails?'FAILED: '+fails:'ALL PASS'); process.exit(fails?1:0);
})();
