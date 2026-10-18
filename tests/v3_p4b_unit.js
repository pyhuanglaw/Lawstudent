// 沛珊 P4b 換你陪我念（BB_97 4-4；AA_177 第 8 節②；任務 V3-B16）——不需要瀏覽器。
// BB_205 第 3 節（64aaaa82）起：大二下是沛珊的重考消失期，P4b 整段不發生；這支測試改成檢查「不發生」。原本的檢查：第 2 週週五 21:00 私訊兩版、小組「陪重考生念書」；總圖見面的便條（你呢／你們呢）；4/17 12:30「總圖滿了」→ Café 13～15 點 ev_peishan_cafe_42（CG）；小組版沒有。用法：node tests/v3_p4b_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT|LADDER|HOME|HOME_LINES|ROM)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/romance3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/story3d.js','src/classes3d.js']) if(fs.existsSync(path.join(ROOT,f))) load(f);
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
  const ps='classmate_peishan', PT='p:classmate_peishan';
  const f=termDay('Y2S2',2,5), c=D('2027-04-17');
  check('0. 第 2 週週五＝3/5；4/17 是第 8 週週六',D('2027-03-05')===f&&termDay('Y2S2',8,6)===c);
  const base=(day,h,o)=>{ o=o||{}; fresh(day,h,'dorm',o.flags); meet(ps); if(o.mirror) SOCIAL.remember(ps,'MIRROR_PEISHAN',''); if(o.friend) R(ps,...LV.FRI); else R(ps,...LV.FAM); if(o.dating) G.flags['dating_'+o.dating]=true; if(o.knows) ROM.learn(G,ps,o.dating,'yt_told'); };   /* 她知道祐廷在和別人交往（BB_191 9-4 #4）*/
  /* BB_205 第 3 節（64aaaa82）：P4 搬到大二上 12/17，12/18～2027-08-06 是沛珊的重考消失期，聯絡不到：P4b、小組、42 頁、Café 都不發生 */
  for(const o of [{mirror:true},{friend:true},{mirror:true,dating:'kexin',knows:'kexin'}]){ base(f,20.5,o); run(20.5,21.5); check('1. 第 2 週週五 21:00：不發 P4b、不開小組（'+JSON.stringify(o)+'）',!PHONE.sent(G,'ps_p4b')&&!PHONE.inGroup(G,'ps_study')); }
  base(c,12,{mirror:true,friend:true}); run(12,13); check('2. 4/17：沒有「總圖滿了」那則',!PHONE.sent(G,'ps_p4b_cafe'));
  G.zone='cafe'; G.hour=13.5; check('2. Café 13～15 點不演 ev_peishan_cafe_42',!EVENTS.check(ev('ev_peishan_cafe_42')));
  check('3. STORY.psGone：12/17 還在、12/18～2027-08-05 消失、8/6 回來',!STORY.psGone(G,D('2026-12-17'))&&STORY.psGone(G,D('2026-12-18'))&&STORY.psGone(G,D('2027-08-05'))&&!STORY.psGone(G,D('2027-08-06')));
  console.log(fails?'FAILED: '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
