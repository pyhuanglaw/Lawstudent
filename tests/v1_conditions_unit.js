// 條件小修正（2026-10-16）：AA_140 G06 語彤雨天總圖不在週二、四 17:30～20:30；交接包 v1 A5 考古題第 7 週起、A6 麵店的糾紛第 15 週起（events3d.js minWeek）——不需要瀏覽器。
// 修改前：雨天總圖在週二 18:00 觸發、考古題第 3 週、麵店糾紛第 10 週都會觸發（2a、3a、4a 失敗）。用法：node tests/v1_conditions_unit.js
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
  SOCIAL.bind(G); EVENTS.bind(GM); INV.rec(G); said=[]; opts=[]; picks=[]; GM.npc={}; E.interactables=[]; E.npcs=[]; if(STORY._fy) STORY._fy.reset(); };
const R=(id,fam,trust,comf)=>{ const r=SOCIAL.rel(id); r.fam=fam; r.trust=trust||0; r.comf=comf||0; };
const LV={ACQ:[10],FAM:[25],FRI:[45,30],CLO:[65,50,45]};
const run=(h0,h1,st)=>{ st=st||0.05; for(let h=h0;h<=h1+1e-9;h+=st){ G.hour=+h.toFixed(3); STORY.phoneRules(GM); PHONE.tick(G); } };
const termDay=(term,w,wd)=>STORY.termDay(term,w,wd);
const ev=id=>STORY_EVENTS.find(e=>e.id===id);
const lines=()=>said.map(s=>(s.who?s.who+'：':'')+s.t);
const TH=(th)=>(G.msgs||[]).filter(m=>m.th===th);
const txt=(th)=>TH(th).map(m=>(m.from||'')+':'+m.text);
(async()=>{
  const at=(term,w,wd,h,zone,flags)=>{ fresh(termDay(term,w,wd),h,zone,flags); };
  const chk=id=>EVENTS.check(ev(id),{});
  // G06
  at('Y1S1',5,2,18.2,'campus',{introDone:true,classDone:true,afternoonDone:true}); G.weather='rain'; GM.E.player.obj.position={x:81,y:0,z:0};
  const tue=chk('ev_rain_library_door'); G.hour=21; const tueLate=chk('ev_rain_library_door');
  at('Y1S1',5,3,18.2,'campus',{introDone:true,classDone:true,afternoonDone:true}); G.weather='rain'; GM.E.player.obj.position={x:81,y:0,z:0}; const wed=chk('ev_rain_library_door');
  check('2a. 雨天總圖：週二 18:10 不觸發（語彤在麵店）',!tue);
  check('2b. 週二 21:00、週三 18:10：照常可以',tueLate&&wed,JSON.stringify({tueLate,wed}));
  // A5
  at('Y1S1',3,2,12,'library',{introDone:true,classDone:true,afternoonDone:true}); const k3=chk('ev_bohan_kaogu');
  at('Y1S1',7,2,12,'library',{introDone:true,classDone:true,afternoonDone:true}); const k7=chk('ev_bohan_kaogu');
  check('3a. 考古題：第 3 週不問',!k3); check('3b. 第 7 週起可以',k7);
  // A6
  at('Y1S1',10,2,19,'noodle',{introDone:true,classDone:true,afternoonDone:true}); SOCIAL.remember('heroine_03','SHARED_MEAL'); const c10=chk('ev_yutong_customer');
  at('Y1S1',15,2,19,'noodle',{introDone:true,classDone:true,afternoonDone:true}); SOCIAL.remember('heroine_03','SHARED_MEAL'); const c15=chk('ev_yutong_customer');
  check('4a. 麵店的糾紛：第 10 週不觸發',!c10); check('4b. 第 15 週起可以',c15);
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})();
