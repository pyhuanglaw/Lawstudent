// 告白的共同流程（ROM-1017-L／SYS-02；AA_215 第 1 節、AA_128 3-1～3-3、AA_126 4-2）——不需要瀏覽器。用測試用的假台詞（不是遊戲內容）：沒有台詞不出現、四次以前不出現、「告訴她／今天先不說」、答應＝ROM.start、還沒＝不鎖線＋兩週＋再一次正式約會、學姊筆試前婉拒、快速約會不問。用法：node tests/confess_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT|LADDER|DATE|DATE_DATA|DATE_LINES|ROM|CONFESS_LINES)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/story3d.js','src/classes3d.js','src/romance3d.js','src/data/date_locations.js','src/data/date_lines.js','src/data/confess_lines.js','src/date3d.js']) if(fs.existsSync(path.join(ROOT,f))) load(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
global.ADV={active:false,preload(){},begin(){},end(){},log(){},speaker(){},cg(){}}; global.CHAR={setExpr(){}};
global.LEGAL={ask:async()=>{},apply(){},stateOf:()=>'unseen',STATES:['unseen']};
let said=[], opts=[], picks=[], G=null;
const E={q:{level:'medium'},player:{busy:false,obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0},zone:{roomAt:()=>null,seats:[]},npcs:[],interactables:[],levels:null,setWeather(){},hour:0};
const GM={get G(){ return G; },E,D:{active:false},npc:{},
  sceneBegin(){},sceneEnd(){},face(){},cine(){},caption(){},sleep:()=>Promise.resolve(),memo(){},autosave(){},addNote(){},energy(){},money(){},setGoal(){},toast(){},updateHUD(){},letterbox(){},phoneBadge(){},
  titleCard:async()=>{},enter:async(z)=>{ G.zone=z; },advance(h){ G.hour+=h; },fade:()=>Promise.resolve(),rel(){},walkTo:()=>Promise.resolve(true),sitAt(){},standUp(){},
  say:async(who,t)=>{ said.push({who:who?(who.name||String(who)):null,t}); },choose:async o=>{ opts.push(o.map(q=>q.t||q.text)); const want=picks.shift(); if(typeof want==='string'){ const k=o.findIndex(q=>(q.t||q.text).includes(want)); if(k<0){ picks.unshift(want); return 0; } return k; } return want||0; }};   /* 這個測試：找不到的選項留給下一個選單（中間多出來的回覆選擇點第一個）*/
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
GM.money=d=>{ G.money+=d; }; GM.toast=()=>{}; GM.caption=()=>{}; GM.updateHUD=()=>{};
const ADV2=global.ADV; ADV2.active=false;
(async()=>{
  check('0. 正式資料表 CONFESS_LINES 目前是空的（台詞還沒交付）：任何人都不會出現「（告訴她）」',typeof CONFESS_LINES==='object'&&Object.keys(CONFESS_LINES).length===0);
  const day=termDay('Y1S2',5,6); OUT.BG.d13_base_sunset=OUT.BG.d13_base_sunset||{label:'淡水',image:'x'};
  const ready=(id,o)=>{ o=o||{}; const r=SOCIAL.rel(id); Object.assign(r,{fam:70,trust:55,comf:50,npcRom:60,rom:35}); const L=DATE.log(G,id); L.count=o.count==null?3:o.count; L.wish=true; G.contacts=G.contacts||{}; G.contacts[id]=1; };
  const go=async(who,picks0)=>{ const b=DATE.book(G,{who,locs:['D13'],transport:'mrt',day:G.day,depart:15}); const q=OUT.get(G,'date_'+b.trip); G.hour=15; said=[]; opts=[]; picks=['出發'].concat(picks0); await OUT.prompt(GM,q); return {t:DATE.trip(G,b.trip),L:lines(),O:opts}; };
  // 1 條件到齊、但沒有台詞：不出現選項
  fresh(day,9,'dorm',{}); ready('heroine_03'); let r=await go('heroine_03',['河邊欄杆','差不多了','差不多了']);
  check('1. 第四次約會、條件到齊（canConfess ok）但這一位沒有交付的台詞：不出現「（告訴她）」',DATE.canConfess(G,'heroine_03').ok&&!r.O.some(o=>o.includes('（告訴她）'))&&!G.flags.dating_heroine_03,JSON.stringify(r.O));
  // 測試用的台詞（不是遊戲內容）
  CONFESS_LINES.heroine_03={src:'測試',say:[{who:'player',text:'P'}],yes:['Y1'],notYet:['N1'],notYetFlag:'T_NOT_YET',decide:G=>G.flags.T_SAY_NOT?'notYet':'yes'};
  CONFESS_LINES.heroine_05={src:'測試',say:[{who:'player',text:'P5'}],yes:['Y5'],notYet:['N5'],preexam:['PRE'],preexamFlag:'T_PRE'};
  fresh(day,9,'dorm',{}); ready('heroine_03',{count:2}); r=await go('heroine_03',['河邊欄杆','差不多了','差不多了']);
  check('2. 第三次約會（結算後 3 次）：還不到四次，不出現',!r.O.some(o=>o.includes('（告訴她）')));
  fresh(day,9,'dorm',{}); ready('heroine_03'); r=await go('heroine_03',['河邊欄杆','差不多了','今天先不說']);
  check('3. 第四次約會結尾：出現「（告訴她）／（今天先不說）」；不說＝什麼都不變',r.O.some(o=>o[0]==='（告訴她）'&&o[1]==='（今天先不說）')&&!G.flags.dating_heroine_03&&!DATE.log(G,'heroine_03').notYet,JSON.stringify(r.O.slice(-2)));
  fresh(day,9,'dorm',{}); ready('heroine_03'); r=await go('heroine_03',['河邊欄杆','差不多了','告訴她']);
  const iS=r.L.indexOf('祐廷：P'), iY=r.L.findIndex(x=>/Y1$/.test(x)), iEnd=r.L.findIndex(x=>/^（今天去了/.test(x));
  check('4. 告訴她 → 答應：祐廷那句、她的答應，dating_heroine_03、ROM 交往紀錄；結算在最後',G.flags.dating_heroine_03===true&&ROM.partners(G).includes('heroine_03')&&iS>=0&&iY>iS&&iEnd>iY,JSON.stringify(r.L.slice(-4)));
  // 還沒：不鎖線、冷卻
  fresh(day,9,'dorm',{T_SAY_NOT:true}); ready('heroine_03'); r=await go('heroine_03',['河邊欄杆','差不多了','告訴她']);
  const ny=DATE.log(G,'heroine_03').notYet;
  check('5. 還沒（照她的 decide）：她的那句、記 T_NOT_YET、沒有交往、記下那天和次數',r.L.some(x=>/N1$/.test(x))&&G.flags.T_NOT_YET===G.day&&!G.flags.dating_heroine_03&&ny&&ny.day===G.day&&ny.count===4,JSON.stringify(ny));
  G.day+=3; G.weekday=wdOf(G.day); check('5. 三天後（再約一次也一樣）：兩週內不再出現',DATE.confessReady(G,'heroine_03').why==='notYet');
  G.day+=12; G.weekday=wdOf(G.day); check('5. 兩週後、但中間沒有再約：還不行',DATE.confessReady(G,'heroine_03').why==='notYet');
  delete G.flags.T_SAY_NOT; r=await go('heroine_03',['河邊欄杆','差不多了','告訴她']);
  check('5. 兩週後、這一趟又是一次正式約會（第五次）：再出現，這次答應',r.O.some(o=>o[0]==='（告訴她）')&&G.flags.dating_heroine_03===true);
  // 學姊：筆試以前婉拒
  const pre=STORY.dayOfKey('2026-01-10'); fresh(pre,9,'dorm',{}); ready('heroine_05'); DATE.log(G,'heroine_05').wish=true; r=await go('heroine_05',['河邊欄杆','差不多了','告訴她']);
  check('6. 學姊筆試前：選項照樣出現、她婉拒（preexam 那句）、記 T_PRE、不鎖線（兩週後再試）',r.O.some(o=>o[0]==='（告訴她）')&&r.L.some(x=>/PRE$/.test(x))&&G.flags.T_PRE===G.day&&!G.flags.dating_heroine_05&&DATE.log(G,'heroine_05').notYet.day===G.day,JSON.stringify(r.L.slice(-3)));
  // 快速約會不問
  fresh(day,9,'dorm',{}); ready('heroine_03'); DATE.log(G,'heroine_03').byLoc.D13=2; r=await go('heroine_03',['快速約會']);
  check('7. 快速約會（直接結算）：不出現「（告訴她）」',!r.O.some(o=>o.includes('（告訴她）')),JSON.stringify(r.O));
  delete CONFESS_LINES.heroine_03; delete CONFESS_LINES.heroine_05;
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
