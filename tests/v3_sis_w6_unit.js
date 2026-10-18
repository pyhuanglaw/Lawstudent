// 學姊 W6 交接（BB_97 2-1）——2026-10-17 刪（BB_191 §7-3）：檢查事件停用、讀書會不排、家族群組沒有「學姊卸任了！」——不需要瀏覽器。
// 修改前沒有 ev_sis_handover（全部失敗）。用法：node tests/v3_sis_w6_unit.js
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
(async()=>{
  /* 2026-10-17：W6 交接刪了（BB_191 §7-3、AA_218 17-4：法服沒有讀書會；她在祐廷大一時已經是前任社長）。這裡改成檢查「停用」：
     事件留著（舊存檔 events.done 照讀）但 retired、讀書會不會再排、家族群組沒有「學姊卸任了！」 */
  const e0=ev('ev_sis_handover'); check('0. ev_sis_handover 留著但停用（retired）',!!e0&&!!e0.retired,e0&&e0.retired);
  const A=ACTIVITIES.list.find(a=>a.id==='lawclub_study'), w1=termDay('Y2S1',6,3), w2=termDay('Y2S1',7,3);
  check('0. 法服讀書會大二上第 6、7 週週三沒有（停用）',!ACTIVITIES.on(A,w1)&&!ACTIVITIES.on(A,w2));
  global.STORY.present=()=>true;
  fresh(w1,19,'wancai',{lawclub:true}); G.stage='law'; meet('heroine_05'); said=[];
  check('1. 社員第 6 週週三：法服沒有讀書會的事件（clubEvent＝null）',!CLS.clubEvent(G,A));
  check('1. 停用的事件不會被引擎挑到（EVENTS.check 為 false）',!EVENTS.check(e0,{}));
  const fam=()=>txt('g:family_law');
  fresh(w1,20,'dorm',{}); G.stage='law'; PHONE.join(G,'family_law','法律系直屬家族'); run(20,23); check('2. 家族群組沒有「學姊卸任了！」',!fam().some(t=>/卸任/.test(t)),JSON.stringify(fam()));
  fresh(w2,20,'dorm',{lawclub:true}); G.stage='law'; PHONE.join(G,'family_law','法律系直屬家族'); G.events.done.ev_sis_handover=1; run(20,23.9);
  check('3. 舊存檔演過 W6 交接：家族群組也沒有「學姊卸任了！」',!fam().some(t=>/卸任/.test(t)),JSON.stringify(fam()));
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
