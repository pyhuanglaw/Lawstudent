// 考試時段標在課表、邀約避開（D14-T3；classes3d.js 的 CLS.examList／examAt／weekHTML、invites3d.js 的 free、date3d.js 的 DATE.check）。用法：node tests/exam_slots_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT|LADDER|DATE|DATE_DATA|ROM)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/exam_bank.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/story3d.js','src/classes3d.js','src/romance3d.js','src/data/date_locations.js','src/date3d.js']) if(fs.existsSync(path.join(ROOT,f))) load(f);
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
GM.money=d=>{ G.money+=d; }; GM.toast=()=>{}; GM.caption=()=>{}; GM.updateHUD=()=>{};
const ADV2=global.ADV; ADV2.active=false;
(async()=>{
  const d0=termDay('Y1S2',1,1); fresh(d0,9,'dorm',{}); G.contacts.heroine_03=1;
  const ex=CLS.examList(G,'Y1S2'); const wk=e=>CALENDAR.termOf(e.day).week;
  check('1. 大一下的考試清單：有期中、期末，期中在第 8～9 週、期末在第 16 週（16 週制），時間是那一節',ex.some(e=>e.kind==='mid')&&ex.some(e=>e.kind==='final')&&ex.every(e=>(e.kind==='mid'?[8,9]:[16]).includes(wk(e))&&e.t1>e.t0),JSON.stringify(ex.map(e=>[e.c.name,e.kind,wk(e),e.t0])));
  const e=ex.find(x=>x.kind==='mid'); check('1. CLS.examAt：那一節有考試；前一天、同一天別的時間沒有',!!CLS.examAt(G,e.day,e.t0,e.t1)&&!CLS.examAt(G,e.day-1,e.t0,e.t1)&&!CLS.examAt(G,e.day,22,23));
  check('1. 不是考試週：沒有考試',!CLS.examAt(G,d0,0,24));
  // 課表
  const html=CLS.weekHTML(G); check('2. 手機「課表」列出考試（期中／期末、科目、日期、時間）',/<b>考試<\/b>/.test(html)&&html.includes(e.c.name)&&/期中/.test(html)&&/期末/.test(html),html.slice(html.indexOf('考試')-20,html.indexOf('考試')+200));
  // 邀約避開
  G.day=e.day-1; G.weekday=wdOf(G.day); G.hour=20; const P=INV.place('cafe'); const h=Math.max(P.hours?P.hours[0]:8,Math.ceil(e.t0*2)/2);
  check('3. 約人：考試那一節不是空的時間（INV.freeAt）',!INV.freeAt(G,'heroine_03',P,e.day,h)||h>=e.t1,JSON.stringify({h,t0:e.t0,t1:e.t1}));
  const nf=INV.nextFree(G,'heroine_03',P,e.day,e.t0); check('3. 約人「改天」找的下一個時間不在考試裡',!nf||!CLS.examAt(G,nf.day,nf.h,nf.h+P.stay),JSON.stringify(nf));
  // 約會避開
  OUT.BG.d13_base_sunset=OUT.BG.d13_base_sunset||{label:'淡水',image:'x'}; const dep=Math.max(9,Math.floor(e.t0)); const c=DATE.check(G,{who:'heroine_03',locs:['D13'],transport:'mrt',day:e.day,depart:dep});
  check('4. 校外約會：考試那天、考試的時段不能約、寫「要考」',!c.ok&&/要考/.test(c.why),c.why+' dep '+dep);
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
