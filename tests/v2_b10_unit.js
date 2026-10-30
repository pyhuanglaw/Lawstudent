// V2-B10 經濟系的朋友（大一下）：SK03 週五的小福午餐（BB_135 第 1 節、BB_96 10-2，BB-B 2026-10-16 定稿）——不需要瀏覽器。
// 檢查：P4d 之前沒有、P4d 當天不問、下一個週五起問「活大。走不走？」；「今天不行」不扣分、下週照問；第一次＝1-1（品妤「重修生？你看起來很有覺悟。」…）、之後快轉到 13:00「午休結束。」；
//   平常週五＝旁白＋輪替句（芯慈加入前三句輪流、不連續重複）；去過兩次以上的下一次＝1-3 芯慈走進小福（ECON_PAST_SHARED full 只有第一個選項、其他只有二、三；記 ECON_LAW_BRIDGE）；之後用加入後的輪替句；habit meal:xiaofu:fri。修改前沒有 ev_sk03_lunch（第 1 項失敗）。
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
(async()=>{
  const e=ev('ev_sk03_lunch'); check('1. ev_sk03_lunch 存在（afterClass econ_principles_2、大一下、週五）',!!e&&e.afterClass==='econ_principles_2'&&JSON.stringify(e.term)==='["Y1S2"]');
  if(!e){ console.log('FAILED '+fails); process.exit(1); }
  const F2=termDay('Y1S2',2,5), F3=termDay('Y1S2',3,5), F4=termDay('Y1S2',4,5), F5=termDay('Y1S2',5,5), F7=termDay('Y1S2',7,5), F9=termDay('Y1S2',9,5);
  fresh(F2,12.17,'putong',{introDone:true,classDone:true,afternoonDone:true});
  let r=await after(F2); check('2. P4d 之前（沒有 P4D_ANSWER）：週五下課沒有 SK03',!lines().includes('阿勳：學活。走不走？'),lines().join('｜'));
  G.flags.P4D_ANSWER='retake'; G.flags.ECON_HALLWAY_DAY=F2; G.flags.MET_XUN=true; G.flags.MET_PINYU=true;
  r=await after(F2); check('2. P4d 當天：不問（從下一個週五開始）',!lines().includes('阿勳：學活。走不走？'));
  picks=['今天不行']; r=await after(F3); check('3. 下一個週五：「學活。走不走？」兩個選項（BB_135 原文）',lines()[0]==='阿勳：學活。走不走？'&&JSON.stringify(opts[0])==='["「一起去」","「今天不行」"]',JSON.stringify(opts[0]));
  check('3. 「今天不行」：不去、不快轉、不記習慣',!G.flags.SK03_FIRST&&!caps.includes('午休結束。')&&!(G.habits&&G.habits['meal:xiaofu:fri']));
  picks=['一起去']; r=await after(F4); const L1=lines();
  check('4. 第一次去＝1-1：旁白＋品妤「重修生？你看起來很有覺悟。」＋阿勳＋品妤（BB_135 1-1 原文；最後一句 AA_305 第 9 節改「……你講話還是一樣，不留情。」）',JSON.stringify(L1.slice(1))===JSON.stringify(['週五的學活。阿勳占了靠窗的四人桌，品妤已經在吃了。','品妤：重修生？你看起來很有覺悟。','阿勳：他去年也很有覺悟。只是方向不一樣。','品妤：……你講話還是一樣，不留情。']),JSON.stringify(L1));
  check('4. 之後快轉到 13:00、字幕「午休結束。」、習慣 +1',Math.abs((G.hour%24)-13)<0.01&&caps.includes('午休結束。')&&G.habits['meal:xiaofu:fri'].n===1,JSON.stringify({h:G.hour,caps}));
  picks=['一起去']; r=await after(F5); const L2=lines();
  check('5. 第二次＝1-2：旁白＋芯慈加入前的輪替句（第一句）',L2[1]==='週五的學活。品妤點的永遠是同一個便當，阿勳永遠在講統計。'&&L2[2]==='品妤：你們法律系的期中考，也要背那麼多嗎？',JSON.stringify(L2));
  picks=['一起去']; G.flags.ECON_PAST_SHARED='half'; r=await after(F7); const L3=lines();
  check('6. 去過兩次以後的下一次＝1-3 芯慈走進小松：開場三句＋不是 full 只有第二、三個選項',L3[1]==='芯慈端著餐盤走進來，看見阿勳，停住了。'&&L3.includes('吳芯慈：欸，你是統計課那個……')&&JSON.stringify(opts[1])==='["「我們當過室友。」","（笑一笑帶過）"]'/* AA_373 #4（原本「我們一起住過一年。」）*/,JSON.stringify({L3,o:opts[1]}));
  check('6. 選「我們當過室友。」（AA_373 #4）：祐廷「他保齡球打得比我好太多了。」（AA_305 第 9 節）、芯慈「那一年的事你之後要講給我聽。」（AA_209）、ECON_PAST_SHARED 變 full；收尾兩句；記 ECON_LAW_BRIDGE',L3.includes('祐廷：他保齡球打得比我好太多了。')&&L3.includes('吳芯慈：那一年的事你之後要講給我聽。')&&G.flags.ECON_PAST_SHARED==='full'&&L3.slice(-2).join('｜')==='品妤：好，多一個人。這桌要換大一點的。｜阿勳：每週五，同一桌。'&&G.flags.ECON_LAW_BRIDGE===true,JSON.stringify(L3.slice(-4)));
  picks=['一起去']; r=await after(F9); const L4=lines();
  check('7. 芯慈加入以後：用加入後的輪替句（阿勳那句 AA_305 第 9 節改「今天輪你請飲料」）',['吳芯慈：統計的筆記我帶來了。誰要先吵？','品妤：芯慈，妳的雙主修還活著嗎？','阿勳：法律系的，今天輪你請飲料。'].includes(L4[2]),JSON.stringify(L4));
  // full 的玩家：只有第一個選項
  fresh(F7,12.17,'putong',{introDone:true,P4D_ANSWER:'good',ECON_HALLWAY_DAY:F2,SK03_FIRST:true,ECON_PAST_SHARED:'full'}); G.events.done.ev_econ_hallway=1; EVENTS.habit('meal:xiaofu:fri'); G.day=F4; EVENTS.habit('meal:xiaofu:fri'); G.day=F7;
  picks=['一起去']; r=await after(F7); const L5=lines();
  check('8. ECON_PAST_SHARED full：1-3 只有「他是我以前的室友。」→ 芯慈「原來你們以前住同一間。」「難怪你們講話有點像。」（AA_209）',JSON.stringify(opts[1])==='["「他是我以前的室友。」"]'&&L5.includes('吳芯慈：原來你們以前住同一間。')&&L5.includes('吳芯慈：難怪你們講話有點像。'),JSON.stringify({o:opts[1],L5}));
  // 輪替不連續重複
  fresh(F5,12.17,'putong',{introDone:true,P4D_ANSWER:'good',ECON_HALLWAY_DAY:F2,SK03_FIRST:true}); G.events.done.ev_econ_hallway=1; let prev=null, rep=0; const seen=new Set();
  for(let w=5;w<=15;w++){ const d=termDay('Y1S2',w,5); if(!d) continue; picks=['一起去']; G.flags.ECON_LAW_BRIDGE=undefined; if(G.habits) G.habits['meal:xiaofu:fri']={n:0,first:d,last:null,days:[]}; await after(d); const t=lines()[2]; if(t===prev) rep++; prev=t; seen.add(t); }
  check('9. 芯慈加入前的輪替：三句都會出現、不連續重複',seen.size===3&&rep===0,JSON.stringify([...seen]));
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外 '+(e&&e.stack||e)); process.exit(1); });
