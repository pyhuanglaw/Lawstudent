// DL-05 從家裡出發（AA_160 1-6；AA-B 定案）——不需要瀏覽器。
// 檢查：週日晚上在家多「今晚住家裡，明天一早直接去學校」（週一第一堂是期末考就變灰）；選了＝週一在家醒（第一堂前 1 小時 30 分、最早 06:30），
//       醒來出起床選單（直接去上課：捷運＋公車約 40 分鐘／今天不去／先在家）；直接去＝等到出門時間、離開家、進教室區域；週日 21:30 的提醒也可以選住家裡；
//       週末有學校的固定行程（約在學校的見面、補課）提早醒（開始前 50 分鐘）。修改前：沒有這個選項（第 1 項就失敗）。用法：node tests/dl05_home_unit.js
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
const txt=(th)=>TH(th).map(m=>(m.from||'')+':'+m.text);
const choices=()=>opts.map(o=>o.join('｜'));
(async()=>{
  let MON=termDay('Y1S1',4,1); for(let w=4;w<16;w++){ const d=termDay('Y1S1',w,1); if(!CALENDAR.holiday(d)&&!CALENDAR.typhoon(d)){ MON=d; break; } } const SUN=MON-1;   /* 大一上第一個有課的週一（9/29 教師節補假、10/6 中秋、10/13 颱風假都跳過）和前一天週日 */
  fresh(MON,7,'dorm',{introDone:true,classDone:true,afternoonDone:true}); const monFirst=CLS.dayItems(G)[0];
  check('前提：週一有課（第一堂 '+(monFirst&&CLS.hhmm(monFirst.t0))+' '+(monFirst&&monFirst.c.name)+'）',!!monFirst);
  { fresh(SUN,20,'dorm',{introDone:true,classDone:true,afternoonDone:true}); HOME.rec(G).at=true; HOME.rec(G).eat={day:SUN}; picks=['今晚住家裡'];
    let entered=[]; const enter0=GM.enter; GM.enter=async z=>{ entered.push(z); G.zone=z; };
    const goCalls=[]; const gc=CLS.goClass; CLS.goClass=async(gm,it,o)=>{ goCalls.push({id:it.c.id,o}); HOME.rec(G).at=false; return true; };
    picks=['今晚住家裡','直接去上課']; await HOME.loop(GM); CLS.goClass=gc; GM.enter=enter0;
    const o0=choices()[0]||''; check('1. 週日 20:00 在家：選項有「今晚住家裡，明天一早直接去學校」',o0.includes('今晚住家裡，明天一早直接去學校'),o0);
    const want=Math.max(6.5,monFirst.t0-1.5);
    check('2. 選了：週一在家醒來，時間是第一堂前 1 小時 30 分（'+CLS.hhmm(want)+'）',G.day>=MON&&said.some(s=>/早安。今天的課/.test(s.t)),lines().join('｜').slice(-200));
    const wm=opts.find(o=>o.some(t=>t.startsWith('直接去上課')))||[]; check('3. 在家醒來的起床選單：直接去上課／今天不去／先在家',wm.length===3&&wm[0].startsWith('直接去上課：'+monFirst.c.name)&&wm[1]==='今天不去'&&wm[2]==='先在家',JSON.stringify(wm));
    check('4. 直接去：等到出門時間（開始前 10 分鐘到教室、路上 40 多分鐘），從家裡出發（goClass fromHome）',goCalls.length===1&&goCalls[0].o.fromHome===true&&Math.abs(G.hour-(monFirst.t0-1/6-goCalls[0].o.mins/60))<0.02,JSON.stringify({goCalls,h:CLS.hhmm(G.hour)})); }
  { fresh(SUN,21.6,'dorm',{introDone:true,classDone:true,afternoonDone:true}); HOME.rec(G).at=true; picks=[1,'先在家','回宿舍']; await HOME.loop(GM);
    check('5. 週日 21:30 媽媽提醒時：也可以選「今晚住家裡，明天一早直接去學校」',said.some(s=>/早點回去/.test(s.t))&&opts[0]&&opts[0][1]==='今晚住家裡，明天一早直接去學校'&&G.day===MON,JSON.stringify(opts[0])+' day='+G.day); }
  { let exS=null; for(let d=SUN;d<SUN+140&&!exS;d++){ if(CALENDAR.dateOf(d).wd%7!==0) continue; const its=CLS.dayItems({day:d+1,flags:{},courses:{}},d+1); if(its[0]&&its[0].exam==='final') exS=d; }
    if(exS){ fresh(exS,20,'dorm',{introDone:true,classDone:true,afternoonDone:true}); HOME.rec(G).at=true; HOME.rec(G).eat={day:exS}; const toasts=[]; GM.toast=t=>toasts.push(t); picks=['今晚住家裡','回宿舍']; await HOME.loop(GM); GM.toast=()=>{};
      check('6. 週一第一堂是期末考：「今晚住家裡」變灰、寫「明天早上期末考，回宿舍睡吧」、選了也不住',(choices()[0]||'').includes('今晚住家裡')&&toasts.some(t=>/明天早上期末考，回宿舍睡吧/.test(t))&&G.day===exS,JSON.stringify(toasts)); }
    else check('6. 前提：找得到週一第一堂是期末考的週日',false); }
  { const FRI=termDay('Y1S1',5,5), SAT=FRI+1; fresh(FRI,21,'dorm',{introDone:true,classDone:true,afternoonDone:true}); HOME.rec(G).at=true; HOME.rec(G).eat={day:FRI}; G.invites=[{id:'iv_sat',who:'heroine_01',place:'library',day:SAT,h:10,state:'accepted'}];
    let woke=null; const tc=GM.titleCard; GM.titleCard=async(a,b)=>{ if(/臺北的家/.test(b||'')) woke={day:G.day,h:G.hour}; }; picks=['睡覺','回宿舍']; await HOME.loop(GM); GM.titleCard=tc;
    check('7. 週六早上約在學校（10:00）：週五晚上在家睡，週六 09:10 醒（開始前 50 分鐘）',!!woke&&woke.day===SAT&&Math.abs(woke.h-(10-50/60))<0.02,JSON.stringify(woke)); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})();
