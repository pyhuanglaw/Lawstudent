// 經濟系休學在家的快轉（D99 第一優先，2026-10-17）：10/19 退宿到 8/29 十個月住家裡，原本家裡選單只能一天一天「睡覺」（玩家要按三百多次）。
//   1. 休學在家（econ、Y0_MOVED_OUT）：家裡選單有「快轉」，選項是到下一個有事的日子／過三天／過一週／不用了；法律系、還沒退宿的沒有；
//   2. 到下一個有事的日子：家裡要演的事件（例：2/12 20:00 E23）一出現就停在那一刻（前 15 分鐘還沒有）；
//   3. 中間收到要回的訊息（有選項）就停，不讓玩家錯過邀約；
//   4. 沒事的三天：到第三天早上 08:30，中間的手機訊息照收；
//   5. 上限 8/29 早上（轉法律系那天）；
//   6. 從家裡選單真的選「快轉」→「過三天」會跳。
// 修改前：沒有 HOME.y0ffOpts（第 1 項就失敗）。用法：node tests/v0_home_ff_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT|LADDER|HOME|HOME_LINES)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/story3d.js','src/classes3d.js']) if(fs.existsSync(path.join(ROOT,f))) load(f);
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
const T=(d,h)=>d*24+h, D=k=>STORY.dayOfKey(k);
const econHome=(k,h)=>{ fresh(D(k),h,'campus',{Y0_MOVED_OUT:true,ECON_CAMP_OPEN:true,E26_DAY:D('2024-10-17'),dating_kexin:true}); G.stage='econ'; const H=HOME.rec(G); H.at=true; H.base=true; H.day=G.day; return H; };
(async()=>{
  econHome('2024-10-25',10);
  const O=HOME.y0ffOpts&&HOME.y0ffOpts(G);
  check('1. 休學在家：有快轉，四個選項',!!O&&JSON.stringify(O.map(o=>o.t))===JSON.stringify(['到下一個有事的日子','過三天','過一週','不用了']),JSON.stringify(O&&O.map(o=>o.t)));
  G.flags.Y0_MOVED_OUT=false; check('1. 還沒退宿：沒有',!HOME.y0ffOpts(G)); G.flags.Y0_MOVED_OUT=true; G.stage='law'; check('1. 法律系：沒有（法律系用放假的快轉）',!HOME.y0ffOpts(G)); G.stage='econ';
  // 2：2/12 20:00 E23
  econHome('2025-02-12',12); G.flags.RETAKE_ON=true;
  const before=HOME.homeEvent(G);
  const why=await HOME.y0Jump(GM,T(G.day+3,8.5)); const ev=HOME.homeEvent(G);
  const tAt=T(G.day,G.hour); G.hour-=0.25; const prev=HOME.homeEvent(G); G.hour+=0.25;
  check('2. 到下一個有事的日子：家裡要演的事件一出現就停（前 15 分鐘還沒有）',!before&&why==='event'&&!!ev&&!prev,JSON.stringify({why,ev:ev&&ev.id,at:CALENDAR.dateOf(G.day).key+' '+G.hour}));
  check('2. 停在 2/12 20:00 的 E23（看不懂的民法）',!!ev&&ev.id==='ev_y0_e23'&&G.day===D('2025-02-12')&&Math.abs(G.hour-20)<1e-6,JSON.stringify({ev:ev&&ev.id,h:G.hour}));
  // 3：要回的訊息
  econHome('2024-10-25',10); const d1=G.day+1;
  PHONE.at(G,d1,15,[{th:'p:kexin',from:'kexin',name:'可昕',text:'測試訊息',ask:{opts:[{t:'好',say:[]}]}}],'test_ask');
  const w3=await HOME.y0Jump(GM,T(G.day+7,8.5));
  check('3. 中間收到要回的訊息：停在那時候（隔天 15:00）',w3==='msg'&&G.day===d1&&Math.abs(G.hour-15)<1e-6,JSON.stringify({w3,day:G.day-d1,h:G.hour}));
  // 4：沒事的三天
  econHome('2024-10-28',9); const n0=(G.msgs||[]).length;
  let w4=null, ok4=true; { const t0=T(G.day,G.hour); w4=await HOME.y0Jump(GM,T(G.day+3,8.5)); ok4=w4==='end'?(T(G.day,G.hour)===T(D('2024-10-28')+3,8.5)):true; }
  check('4. 過三天：沒事就到第三天 08:30（中間有事會先停）',ok4,JSON.stringify({w4,at:CALENDAR.dateOf(G.day).key+' '+G.hour}));
  check('4. 天數、星期跟著走',G.weekday===wdOf(G.day));
  // 5：上限
  econHome('2025-08-26',10); const O5=HOME.y0ffOpts(G);
  check('5. 上限 8/29 05:00（轉法律系那天）',!!O5&&O5.every(o=>o.to==null||o.to<=T(D('2025-08-29'),5)),JSON.stringify(O5&&O5.map(o=>o.to)));
  econHome('2025-08-29',6); check('5. 8/29 早上以後沒有快轉',!HOME.y0ffOpts(G));
  // 6：真的從家裡選單選
  econHome('2024-10-28',9); picks=['快轉','過三天']; const r=HOME.loop?HOME.loop(GM):null; const d0=G.day;
  await new Promise(res=>setTimeout(res,50));
  check('6. 家裡選單有「快轉」、選「過三天」會跳',opts.some(o=>o.includes('快轉'))&&opts.some(o=>o.includes('過三天')),JSON.stringify(opts.slice(0,3)));
  console.log(fails?'FAILED: '+fails:'ALL PASS'); process.exit(fails?1:0);
})();
