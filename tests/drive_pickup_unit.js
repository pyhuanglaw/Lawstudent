// DRIVE-PICKUP-1105 第一步（AA_704 第 2 節 @55a1c5a53；使用者 11-05 08:0x 選「走去新月台停車場取車」）：開車單程多 5 分鐘、路程字、第一次取車旁白。用法：node tests/drive_pickup_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT|LADDER|DATE|DATE_DATA|DATE_LINES|ROM)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/story3d.js','src/classes3d.js','src/romance3d.js','src/data/date_locations.js','src/data/date_lines.js','src/date3d.js']) if(fs.existsSync(path.join(ROOT,f))) load(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
global.ADV={active:false,preload(){},begin(){},end(){},log(){},speaker(){},cg(){}}; global.CHAR={setExpr(){}};
global.LEGAL={ask:async()=>{},apply(){},stateOf:()=>'unseen',STATES:['unseen']};
let said=[], opts=[], picks=[], G=null;
const E={q:{level:'medium'},player:{busy:false,obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0},zone:{roomAt:()=>null,seats:[]},npcs:[],interactables:[],levels:null,setWeather(){},hour:0};
const GM={get G(){ return G; },E,D:{active:false},npc:{},
  sceneBegin(){},sceneEnd(){},face(){},cine(){},caption(){},sleep:()=>Promise.resolve(),memo(){},autosave(){},addNote(){},energy(){},money(){},setGoal(){},toast(){},updateHUD(){},letterbox(){},phoneBadge(){},
  titleCard:async()=>{},enter:async(z)=>{ G.zone=z; },advance(h){ G.hour+=h; },fade:()=>Promise.resolve(),rel(){},walkTo:()=>Promise.resolve(true),sitAt(){},standUp(){},
  say:async(who,t)=>{ said.push({who:who?(who.name||String(who)):null,t}); },choose:async o=>{ opts.push(Object.assign(o.map(q=>q.t||q.text),{all:[].concat(...o.map(q=>q.sub||[q.t||q.text]))})); const want=picks.shift(); if(typeof want==='string'){ let k=o.findIndex(q=>(q.t||q.text).includes(want)); if(k<0){ k=o.findIndex(q=>(q.sub||[]).some(s=>s.includes(want))); if(k>=0&&!o[k].dim) picks.unshift(want); } /* INVITE-MENU-1030 分層：要選的名稱在某一類裡（選項的 sub）＝先選那一類，這個 pick 留給下一層（那一類整個灰掉＝和原本選到灰掉的那一項一樣，用掉這個 pick）*/ return k<0?0:k; } return want||0; }};
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
GM.money=d=>{ G.money+=d; }; GM.toast=()=>{}; GM.caption=()=>{}; GM.updateHUD=()=>{};
const ADV2=global.ADV; ADV2.active=false;
(async()=>{
  const Dd=8*7+2; fresh(Dd,9,'campus'); R('heroine_03',...LV.CLO);
  /* 找一個有開車選項的地點 */
  const carLoc=Object.keys(DATE_DATA.locations||DATE_DATA.locs||{}).find(k=>{ const L=DATE.loc(k); return L&&(L.transport||[]).some(x=>x.mode==='car')&&(L.transport||[]).some(x=>x.mode!=='car')&&(L.kinds||[]).some(q=>q!=='overnight'); });
  check('0. 找得到可以開車也可以搭別的的地點',!!carLoc,String(carLoc));
  const L=DATE.loc(carLoc), car=L.transport.find(x=>x.mode==='car'), other=L.transport.find(x=>x.mode!=='car');
  const Pc=DATE.plan(G,{who:'heroine_03',locs:[carLoc],transport:'car',day:Dd+1,depart:10}), Po=DATE.plan(G,{who:'heroine_03',locs:[carLoc],transport:other.mode,day:Dd+1,depart:10});
  check('1. 開車：單程多 5 分鐘（先走到望月台停車場取車，AA_704 第 2 節）；別的交通照舊',Pc.ok&&Math.abs(Pc.travelH-(car.minutes/60+5/60))<1e-9&&Po.ok&&Math.abs(Po.travelH-other.minutes/60)<1e-9,JSON.stringify([Pc.travelH,car.minutes,Po.travelH,other.minutes]));
  check('2. 開車的路程字：「走到望月台停車場約 5 分鐘，開車約 X 分鐘」（X＝原本的車程）',DATE.travelText(Pc)==='走到望月台停車場約 5 分鐘，開車約 '+car.minutes+' 分鐘'&&/約 \d+ 分鐘$/.test(DATE.travelText(Po))&&!/望月台/.test(DATE.travelText(Po)),DATE.travelText(Pc));
  const SRC=fs.readFileSync(path.join(ROOT,'src/outings3d.js'),'utf8'), doc=require('child_process').spawnSync('git',['-C',ROOT,'show','55a1c5a53:docs/story_planning/AA_704_望月台與停車場取車.md']).stdout.toString();
  check('3. 取車旁白照 AA_704 原句（git show 55a1c5a53），第一次開車出發演一次（DRIVE_PICKUP_SEEN）',!!doc&&doc.includes(OUT.CAR_PICKUP_LINE)&&/q\.car&&G\.flags&&!G\.flags\.DRIVE_PICKUP_SEEN/.test(SRC),OUT.CAR_PICKUP_LINE);
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})();
