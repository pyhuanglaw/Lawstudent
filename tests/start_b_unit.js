// 開局 B 的程式結構（D91；AA_191 第 2 節）——不需要瀏覽器。檢查：S.opening 只有第 1、2 天；S.lawStart（舊存檔＝1、開局 B＝−16）；課表：從第 1 天開始的局，第 1 天以前與 9/17 白天沒有課（和以前一樣）；開局 B 的局，第 1、2 週照常有課、9/17 白天也有課；第 2 天 13:05 以前的課兩種都不排。用法：node tests/start_b_unit.js
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
  const D=k=>STORY.dayOfKey(k);
  check('0. 2025-08-31 是第 −16 天、9/1 是大一上第 1 週、9/17 是第 1 天',D('2025-08-31')===-16&&CALENDAR.termOf(D('2025-09-01')).week===1&&D('2025-09-17')===1);
  fresh(-5,10,'campus',{}); G.stage='law'; const o0=STORY.opening(G); G.day=1; const o1=STORY.opening(G); G.day=2; const o2=STORY.opening(G); G.day=3; const o3=STORY.opening(G);
  check('1. 法律系：第 −5 天不是開場、第 1、2 天是、第 3 天不是',!o0&&o1&&o2&&!o3);
  fresh(1,10,'campus',{}); G.stage='law';
  check('2. 舊存檔／現在的開局：lawStart＝1',STORY.lawStart(G)===1);
  const names=day=>CLS.dayItems(G,day).map(it=>CLS.hhmm(it.t0)+' '+it.c.name).join('、');
  const mon1=D('2025-09-01'), wed1=D('2025-09-03');
  check('3. 從第 1 天開始的局：第 1 週週一沒有課、9/17 白天沒有課（和以前一樣）',names(mon1)===''&&names(1)==='',names(mon1)+'｜'+names(1));
  G.flags.LAW_START_DAY=-16;
  check('4. 開局 B（lawStart −16）：第 1 週週一有憲法、週三有刑總',/憲法/.test(names(mon1))&&/刑法總則/.test(names(wed1)),names(mon1)+'｜'+names(wed1));
  check('4. 開局 B：9/17（第 1 天）白天有刑總',/刑法總則/.test(names(1)),names(1));
  check('5. 兩種局：第 2 天 13:05 以前的課都不排（只有民總）',names(2)==='13:20 民法總則',names(2));
  G.flags.LAW_START_DAY=-16; check('6. 開局 B：8/31（第 −16 天，週日）沒有課、8/30 以前也沒有',names(-16)===''&&names(-17)==='');
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });
