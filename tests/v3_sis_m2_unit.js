// 學姊 M2 換題目（BB_97 2-5；AA_177 第 8 節②；任務 V3-B06）——不需要瀏覽器。
// 檢查：大二寒假 1/20（三）21:00 家族群組的照片＋三件事；三個回覆（咖哩那句要有 FAMILY_DINNER）、ASKED_TELL_ME；隔天 9:00 沒回＝Kevin＋學姊「……好。」；不在家族群組＝沒有；不以 W9 為前置。用法：node tests/v3_sis_m2_unit.js
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
const meet=id=>SOCIAL.remember(id,'FIRST_MET','');
const D=k=>STORY.dayOfKey(k), Tm=(d,h)=>d*24+h;
let cards=[], entered=[];
GM.titleCard=async(a,b)=>{ cards.push([a,b]); }; GM.enter=async(z)=>{ entered.push(z); G.zone=z; };
GM.money=function(n){ G.money+=n; };

(async()=>{
  check('0. 預設大二不播（BB_205 第 4 節：M2／M3／上榜聚餐是祐廷大一下的事，STORY.SIS_Y2_EXAM=false）；下面打開開關測程式本身，留給搬到大一下的版本',STORY.SIS_Y2_EXAM===false); STORY.SIS_Y2_EXAM=true;
  const d=D('2027-01-20'); const FAM='g:family_law';
  const setup=(flags)=>{ fresh(d,20.5,'dorm',flags); meet('heroine_05'); PHONE.join(G,'family_law','法律系直屬家族'); };
  setup({FAMILY_DINNER:true}); run(20.5,20.95);   /* FAMILY_DINNER 是記憶（SOCIAL），旗標不算 */
  check('0. 1/20 是星期三（寒假）、21:00 以前沒有',wdOf(d)===3&&!PHONE.sent(G,'sis_m2'));
  run(21,21.2); const t=txt(FAM);
  check('1. 21:00 家族群組：照片＋計畫本最後一格（四則，AA_398 第 12 列），最後一則可以回',t.join('｜')==='heroine_05:📷（一張讀書計畫）｜heroine_05:這次的題目是我自己選的。法律扶助制度。｜heroine_05:Kevin 幫我看第一段，學弟看第二段。｜heroine_05:計畫本最後一格還空著。你們想寫什麼，就寫。',JSON.stringify(t));
  let m=TH(FAM).slice(-1)[0];
  check('1. 沒有 FAMILY_DINNER 記憶（旗標 FAMILY_DINNER 不算）：兩個選項（不熬夜、要跟我說），沒有咖哩',!!m&&!!m.ask&&m.ask.opts.length===2&&!m.ask.opts.some(o=>/咖哩/.test(o.t))&&PHONE.askOpen(G,m));
  PHONE.answer(G,'sis_m2',1); const t2=txt(FAM);
  check('2. 回「不管考得怎樣，都要跟我說。」→「好。放榜那天就說。」；SIS_M2=tell、ASKED_TELL_ME',t2.slice(-1)[0]==='heroine_05:好。放榜那天就說。'&&G.flags.SIS_M2==='tell'&&SOCIAL.has('heroine_05','ASKED_TELL_ME'),JSON.stringify(t2.slice(-2)));
  G.day=d+1; G.weekday=wdOf(d+1); run(8.5,9.5);
  check('2. 回過的：隔天 9:00 Kevin 不會再說',!PHONE.sent(G,'sis_m2_kevin'));
  setup(); SOCIAL.remember('heroine_05','FAMILY_DINNER','永康街的咖哩'); run(20.5,21.2); m=TH(FAM).slice(-1)[0];
  check('3. 有 FAMILY_DINNER：三個選項，第一個是咖哩',!!m&&m.ask.opts.length===3&&/咖哩/.test(m.ask.opts[0].t));
  PHONE.answer(G,'sis_m2',0);
  check('3. 咖哩 →「……好。考完那天我請。你們不要跟我搶。」',txt(FAM).slice(-1)[0]==='heroine_05:……好。考完那天我請。你們不要跟我搶。'&&G.flags.SIS_M2==='curry');
  setup(); run(20.5,21.2); PHONE.answer(G,'sis_m2',0);
  check('4. 不熬夜 →「……你在管我。」「……好。收到。」',txt(FAM).slice(-2).join('｜')==='heroine_05:……你在管我。｜heroine_05:……好。收到。'&&G.flags.SIS_M2==='sleep');
  setup(); run(20.5,23.9); G.day=d+1; G.weekday=wdOf(d+1); run(0,8.9);
  check('5. 沒回：隔天 8:59 還沒有 Kevin',!PHONE.sent(G,'sis_m2_kevin'));
  run(9,9.3); m=TH(FAM).find(x=>x.ask&&x.ask.id==='sis_m2');
  check('5. 隔天 9:00 Kevin「那我寫：考完請吃飯！」、學姊「……好。」；之後不能回',txt(FAM).slice(-2).join('｜')==='kevin:那我寫：考完請吃飯！｜heroine_05:……好。'&&G.flags.SIS_M2==='none'&&!PHONE.askOpen(G,m),JSON.stringify(txt(FAM).slice(-3)));
  fresh(d,20.5,'dorm'); meet('heroine_05'); run(20.5,21.5);
  check('6. 不在家族群組：沒有',!PHONE.sent(G,'sis_m2')&&TH(FAM).length===0);
  setup(); G.events.done.ev_sis_skip_interview=0; delete G.events.done.ev_sis_skip_interview; run(20.5,21.2);
  check('6. 沒演過 W9 也會有（不以 W9 為前置）',PHONE.sent(G,'sis_m2'));
  fresh(d+2,10,'dorm'); meet('heroine_05'); PHONE.join(G,'family_law','法律系直屬家族'); run(10,10.2); const late=TH(FAM);
  check('7. 舊存檔已經過了 1/20（1/22 才讀）：補在 1/20 21:00',PHONE.sent(G,'sis_m2')&&late.length>=5);
  console.log(fails?'FAILED: '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
