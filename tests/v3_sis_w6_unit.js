// 學姊 W6 交接（BB_97 2-1）：大二上第 1～2 週週三法服讀書會先演交接（逐字）；大一的第一次讀書會不在大二演；沒加入／沒去的家族群組 Kevin 那句——不需要瀏覽器。
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
  if(!ev('ev_sis_handover')){ console.log('FAIL 0'); console.log('FAILED 1'); process.exit(1); }
  const A=ACTIVITIES.list.find(a=>a.id==='lawclub_study'), w1=termDay('Y2S1',1,3), w2=termDay('Y2S1',2,3), w3=termDay('Y2S1',3,3);
  check('0. 法服讀書會大二上第 1 週週三也有',ACTIVITIES.on(A,w1)&&ACTIVITIES.on(A,w2));
  global.STORY.present=()=>true;
  fresh(w1,19,'wancai',{lawclub:true}); G.stage='law'; meet('heroine_05'); said=[];
  const e=CLS.clubEvent(G,A); check('1. 第 1 週週三讀書會：先演交接',!!e&&e.id==='ev_sis_handover',e&&e.id);
  await EVENTS.run(e); const L=lines();
  const want=['交接三件事。','一，週六的值班表在雲端。','二，指導律師的聯絡方式在資料夾。','三……','（三個人在等她。）','……三，我想不起來了。','大家笑了，以為她在開玩笑。她也笑了。','你看見她的手在找保溫瓶。'];
  check('1. 逐字',JSON.stringify(L.map(t=>t.replace(/^[^：（]*：/,'')))===JSON.stringify(want),JSON.stringify(L));
  check('1. 只一次（之後的讀書會不再演）',!(CLS.clubEvent(G,A)&&CLS.clubEvent(G,A).id==='ev_sis_handover'));
  fresh(w2,19,'wancai',{lawclub:true}); G.stage='law'; check('2. 第 1 週沒去：第 2 週演',(CLS.clubEvent(G,A)||{}).id==='ev_sis_handover');
  fresh(w3,19,'wancai',{lawclub:true}); G.stage='law'; check('2. 第 3 週不演',!(CLS.clubEvent(G,A)&&CLS.clubEvent(G,A).id==='ev_sis_handover'));
  check('2. 大一的第一次讀書會（ev_studygroup_wed）不在大二演',!CLS.clubEvent(G,A));
  fresh(w1,19,'wancai',{}); G.stage='law'; check('2. 不是社員不演',!(CLS.clubEvent(G,A)&&CLS.clubEvent(G,A).id==='ev_sis_handover'));
  // 家族群組
  const fam=()=>txt('g:family_law');
  fresh(w1,20,'dorm',{}); G.stage='law'; PHONE.join(G,'family_law','法律系直屬家族'); run(20,21.4); check('3. 沒加入法服：第 1 週週三 21:30 以前沒有',!fam().some(t=>/卸任/.test(t)));
  run(21.5,21.6); check('3. 沒加入法服：第 1 週週三 21:30 Kevin「學姊卸任了！」學姊「收到。」',fam().includes('kevin:學姊卸任了！')&&fam().includes('heroine_05:收到。'),JSON.stringify(fam()));
  fresh(w1,20,'dorm',{lawclub:true}); G.stage='law'; PHONE.join(G,'family_law','法律系直屬家族'); run(20,23); check('4. 社員：第 1 週沒去還不發',!fam().some(t=>/卸任/.test(t)));
  G.day=w2; G.weekday=3; run(21.5,21.6); check('4. 社員到第 2 週都沒去：第 2 週週三 21:30 發',fam().includes('kevin:學姊卸任了！'));
  fresh(w2,22,'dorm',{lawclub:true}); G.stage='law'; PHONE.join(G,'family_law','法律系直屬家族'); G.events.done.ev_sis_handover=1; run(22,22.1); check('4. 去了交接的社員：沒有群組那句',!fam().some(t=>/卸任/.test(t)));
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
