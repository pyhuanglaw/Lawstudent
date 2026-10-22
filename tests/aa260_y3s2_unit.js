// 大三下（AA_260 第 4 節第 3～5 點，2026-10-17；第 1 項照 AA_376 第 1 項更新）：語彤事件 13 以後週四不顧店、公法讀書會大三下第 1～5 週、Y6-L1／L5／L7 和招呼③等事件 13、14。用法：node tests/aa260_y3s2_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT|LADDER)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/story3d.js','src/classes3d.js']) if(fs.existsSync(path.join(ROOT,f))) load(f);
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
const stepOf=(term,who,id)=>{ const L=LADDER.byTerm[term][who]; return [L.steps.find(s=>s.id===id),L.steps.findIndex(s=>s.id===id)]; };
(async()=>{
  const YT='heroine_03', thuB=termDay('Y3S1',14,4), thuA=termDay('Y3S1',15,4)+7, sat=termDay('Y3S2',3,6);
  fresh(thuB,18,'campus',{}); SOCIAL.remember(YT,'FIRST_MET',''); R(YT,...LV.FRI);
  const w1=STORY.whereIs(GM,YT); G.day=thuA; G.weekday=4; const w2=STORY.whereIs(GM,YT); G.day=termDay('Y3S2',1,4); G.weekday=4; const w2b=STORY.whereIs(GM,YT);
  /* AA_376 第 1 項（企劃線 69aa3b0c）：12/16 以後空出來的週四，大三上（含期末週）在總圖三樓讀書；田野（T1）大三下 2/24 起才開始 */
  check('1. 語彤週四 18:00：12/16 以前在麵店顧店；12/16 以後不顧店——大三上在總圖（AA_376 #1）、大三下 2/24 起在做田野訪談',w1&&w1.zone==='noodle'&&w2&&w2.zone==='library'&&w2b&&w2b.zone===null&&/田野/.test(w2b.away||''),JSON.stringify([w1,w2,w2b]));
  G.day=termDay('Y3S2',3,2); G.weekday=2; const w3=STORY.whereIs(GM,YT); G.day=sat; G.weekday=6; G.hour=10; const w4=STORY.whereIs(GM,YT);
  check('1. 週二照舊顧店；週六早上在麵店',w3&&w3.zone==='noodle'&&w4&&w4.zone==='noodle',JSON.stringify([w3,w4]));
  const PG=ACTIVITIES.list?ACTIVITIES.list.find(a=>a.id==='public_law_group'):null;
  check('2. 公法讀書會大三下第 1～5 週（AA_260 第 4 節第 4 點）',!!PG&&PG.term.includes('Y3S2')&&JSON.stringify(PG.termWeeks.Y3S2)==='[1,2,3,4,5]',JSON.stringify(PG&&PG.termWeeks));
  fresh(termDay('Y3S2',10,3),12,'campus',{}); 
  check('3. Y6-L1、Y6-L7 等事件 13（YT_EV13）；Y6-L5 等事件 14（RENT_RENEWED）',!STORY.LADDER_HOLD['Y6-L1'](G)&&!STORY.LADDER_HOLD['Y6-L7'](G)&&!STORY.LADDER_HOLD['Y6-L5'](G)&&(G.flags.YT_EV13=true,STORY.LADDER_HOLD['Y6-L1'](G)&&STORY.LADDER_HOLD['Y6-L7'](G))&&(G.flags.RENT_RENEWED=true,STORY.LADDER_HOLD['Y6-L5'](G)));
  delete G.flags.YT_EV13; delete G.flags.RENT_RENEWED; SOCIAL.remember(YT,'FIRST_MET',''); R(YT,...LV.FRI);
  const greet=()=>{ const out=new Set(); for(let d=0;d<40;d++){ G.day=termDay('Y3S2',2,1)+d; G.weekday=wdOf(G.day); G.hour=13; G.weather='clear'; G.zone='campus'; const t=STORY.ladGreet(G,YT); if(t) out.add(t); } return [...out]; };
  const g0=greet(); G.flags.YT_EV13=true; G.flags.RENT_RENEWED=true; const g1=greet();
  check('3. 招呼③「週四店裡現在是工讀生，我只剩週二。」事件 13、14 以前不說、之後會說',!g0.some(t=>/工讀生/.test(t))&&g1.some(t=>/工讀生/.test(t)),JSON.stringify([g0,g1]));
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
