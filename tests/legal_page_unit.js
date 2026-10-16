// 選單「法律」頁（使用者 2026-10-16 試玩：一開始就列出刑訴三大類、而且只有刑訴）——不需要瀏覽器。
// 檢查：開局什麼都沒有；只列上過的法律課（每週主題，考試週、缺席、國文體育經濟不算）；這學期在前；刑訴題庫要真的遇到過才列。用法：node tests/legal_page_unit.js
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
  const d1=1;
  fresh(d1,8,'dorm');
  check('1. 開局：沒有上過的課',CLS.legalCourses(G).length===0);
  const R=CLS.rec(G), C=id=>COURSES.list.find(c=>c.id===id);
  const law=COURSES.list.filter(c=>c.term==='Y1S1'&&c.kind==='required'&&/憲法|刑法|民法/.test(c.name)).map(c=>c.id);
  check('0. 大一上有憲法、刑總、民總',law.length>=3,J=JSON.stringify(law));
  const dayIn=(w)=>{ for(let d=-120;d<400;d++){ const t=CALENDAR.termOf(d); if(t&&t.id==='Y1S1'&&t.week===w) return d; } return null; }; const k=(w,wd,cid,blk)=>dayIn(w)+':'+cid+':'+(blk||'am');
  R.done[k(1,1,'const_1')]=1; R.done[k(2,1,'const_1')]=1; R.done[k(8,1,'const_1')]=1;   /* 第 8 週＝期中考，不算 */
  R.done[k(3,1,'const_1')]=1; R.abs[k(3,1,'const_1')]=1;   /* 缺席 */
  R.done[k(1,2,'chinese_y1')]=1;   /* 國文 */
  const econ=COURSES.list.find(c=>c.term==='Y1S1'&&/經濟/.test(c.name)); if(econ) R.done[k(1,3,econ.id)]=1;
  console.log('DBG',JSON.stringify(Object.keys(R.done)),JSON.stringify(Object.keys(R.abs)),[1,2,3,8].map(w=>[w,dayIn(w),(CALENDAR.termOf(dayIn(w))||{}).week])); const L=CLS.legalCourses(G);
  check('2. 只有憲法（上）、上過 2 週（第 1、2 週）；國文、經濟、考試週、缺席不算',L.length===1&&L[0].c.id==='const_1'&&JSON.stringify(L[0].topics.map(t=>t.w))==='[1,2]'&&L[0].current===true,JSON.stringify(L.map(e=>[e.c.name,e.topics])));
  check('2. 每週有主題字',L[0].topics.every(t=>typeof t.title==='string'&&t.title.length>3));
  G.day=termDay('Y1S2',2,1); const L2=CLS.legalCourses(G);
  check('3. 到了大一下：大一上的課在「之前的學期」（current false）',L2.length===1&&L2[0].current===false&&L2[0].term==='Y1S1');
  const gs=require('fs').readFileSync(require('path').join(ROOT,'src/game3d.js'),'utf8');
  check('5. 法律頁：用 CLS.legalCourses；刑訴只在遇到過才列；沒有內容時寫「還沒上過課」',/CLS\.legalCourses\(G\)/.test(gs)&&/const met=Object\.values\(sm\.bySec\)\.some\(b=>b\.total-b\.unseen>0\)/.test(gs)&&/還沒上過課。/.test(gs));
  console.log(fails?'FAILED: '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
