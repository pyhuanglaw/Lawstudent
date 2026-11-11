// 招呼只在上課日說（BUG-GREET-NOCLASS-1110；使用者 11-10「禮拜天遇到沈以安 他問我今天還有課嗎」；AA_729＝src/data/greet_classday.js）。
// 修改前：週末也會問「你今天還有課嗎？」、沒有週末／放假的招呼（1、3 FAIL）。用法：node tests/greet_classday_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT|LADDER|GREET_CLASSDAY)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/greet_classday.js','src/social3d.js','src/events3d.js','src/data/l118_redo772.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/story3d.js','src/classes3d.js']) if(fs.existsSync(path.join(ROOT,f))) load(f);
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
const fresh=(day,hour,zone,flags)=>{ G={v:3,day,hour,zone,weekday:wdOf(day),weather:'clear',energy:70,money:5000,flags:Object.assign({KX_FIRST_MSG:true,YT_MET_JOB:true,fundsV2:1,allowanceMonth:CALENDAR.dateOf(day).m},flags||{}),choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null,stats:{classes:0}};
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
  const AN='heroine_01';
  const cd=d=>STORY.classDayOf?STORY.classDayOf(d):(CALENDAR.kind(d)==='term'&&[1,2,3,4,5].includes((CALENDAR.dateOf(d).wd|0)%7)&&!(CALENDAR.typhoon&&CALENDAR.typhoon(d)));   /* 舊程式沒有 classDayOf：照同一個定義挑日子 */
  const free=G=>STORY.playerFreeToday?STORY.playerFreeToday(G):null;
  /* 收集一段日子裡以安說過的招呼（每天換天、清掉今天用過的） */
  const greetsOn=(days,h)=>{ const out=new Set(); for(const d of days){ G.day=d; G.weekday=wdOf(d); G.hour=h||13; G.zone='campus'; for(let i=0;i<8;i++){ const t=STORY.ladGreet(G,AN); if(t) out.add(t); } } return [...out]; };
  const Q='你今天還有課嗎？', P='今天的進度我抄完了。你要的話晚上傳給你。';
  // 大一上第 3～6 週：週日、週六 vs 週一～週五
  fresh(termDay('Y1S1',3,1),13,'campus',{}); SOCIAL.remember(AN,'FIRST_MET',''); R(AN,...LV.FRI);
  const sun=[], wk=[]; for(let w=3;w<=6;w++){ sun.push(termDay('Y1S1',w,1)-1); sun.push(termDay('Y1S1',w,6)); for(let k=1;k<=5;k++) wk.push(termDay('Y1S1',w,k)); }
  const sunG=greetsOn(sun.filter(d=>!cd(d))), wkG=greetsOn(wk.filter(d=>cd(d)));
  check('0. 前置：週六、週日不是上課日，週一～週五是（CALENDAR.kind term、不是颱風假）',sun.every(d=>!cd(d))&&wk.filter(d=>cd(d)).length>=15,JSON.stringify({sun:sun.map(d=>cd(d)),wk:wk.map(d=>cd(d))}));
  check('1. 週末以安不問「你今天還有課嗎？」、不說「今天的進度我抄完了」（使用者 11-10）',!sunG.includes(Q)&&!sunG.includes(P),JSON.stringify(sunG));
  check('1. 週末有 AA_729 的週末招呼（例「週末還遇到你。」）',sunG.some(t=>(GREET_CLASSDAY.add[AN]||[]).some(e=>e.kind==='weekend'&&e.t===t)),JSON.stringify(sunG));
  check('2. 上課日照舊會問「你今天還有課嗎？」，而且不出週末招呼',wkG.includes(Q)&&!wkG.some(t=>(GREET_CLASSDAY.add[AN]||[]).some(e=>e.kind==='weekend'&&e.t===t)),JSON.stringify(wkG));
  // 學期中的國定假日（CALENDAR.kind holiday）：offDay 招呼、沒有問課（寒暑假沒有閒聊階梯，招呼本來就不出）
  { let d=termDay('Y1S1',2,1), n=0; const hs=[]; while(n<200&&hs.length<3){ if(CALENDAR.kind(d)==='holiday') hs.push(d); d++; n++; } fresh(hs[0],13,'campus',{}); SOCIAL.remember(AN,'FIRST_MET',''); R(AN,...LV.FRI); const g=greetsOn(hs);
    check('3. 學期中的國定假日：不問課、有放假的招呼（offDay）',hs.length>0&&!g.includes(Q)&&!g.includes(P)&&g.some(t=>(GREET_CLASSDAY.add[AN]||[]).some(e=>e.kind==='offDay'&&e.t===t)),JSON.stringify({hs:hs.map(x=>CALENDAR.dateOf(x).key),g})); }
  // 標記都對得到 ladder.js（匯入工具也查）；playerNoClass／nextClassDay 的判斷
  { const mon=termDay('Y1S1',4,1); fresh(mon,13,'campus',{}); const items=CLS.dayItems(G); const R2=CLS.rec(G);
    const before=free(G); for(const it of items) R2.done[it.key]=1; const after=free(G);
    check('4. playerFreeToday：今天還有課＝false、全上完＝true',items.length>0&&before===false&&after===true,JSON.stringify({n:items.length,before,after}));
    let fri=termDay('Y1S1',3,5); while(!cd(fri+3)) fri+=7; check('4. nextClassDay：週五的隔天（週六）不是上課日、週日的隔天（週一）是',!cd(fri+1)&&!cd(fri+2)&&cd(fri+3),CALENDAR.dateOf(fri).key); }
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack); process.exit(1); });
