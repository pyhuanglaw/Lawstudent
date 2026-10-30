// 畢業以後（AA_319，src/postgrad3d.js）的測試共用：載入遊戲的資料與系統（不需要瀏覽器）、假的 GM（記錄台詞、選項、字卡）。
// 用在 tests/graduation_unit.js、bar_exam_unit.js、epilogue_unit.js、postgrad_days_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const NAMES=/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT|LADDER|HOME|HOME_LINES|DATE|ROM|CONFESS_LINES|TERMEND|TERMEND_LINES|DATE_LOCATIONS|DATE_LINES|VAC|VAC_DATA|EXAM_BANK|QBANK|POSTGRAD_LINES|PG|SYLLABUS)$/;
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>NAMES.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
const FILES=['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js',
  'src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/romance3d.js','src/data/date_locations.js','src/data/date_lines.js','src/data/confess_lines.js','src/date3d.js',
  'src/data/termend_lines.js','src/termend3d.js','src/data/vac_activities.js','src/vac3d.js','src/story3d.js','src/data/syllabus.js','src/data/exam_bank.js','src/data/legal_qbank.js','src/classes3d.js','src/data/postgrad_lines.js','src/postgrad3d.js'];
for(const f of FILES) if(fs.existsSync(path.join(ROOT,f))) load(f);
const H={ROOT,fails:0,said:[],opts:[],picks:[],cards:[],cgs:[],entered:[],bgs:[],G:null};
H.check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) H.fails++; };
global.ADV={active:false,preload(){},begin(o){ this.active=true; H.bgs.push(o&&o.background); },end(){ this.active=false; },log(){},speaker(){},cg(id){ H.cgs.push(id); return true; },setBg(b){ H.bgs.push(b); },narrate(){}};
global.CHAR={setExpr(){}}; global.LEGAL={ask:async()=>{},apply(){},stateOf:()=>'unseen',STATES:['unseen']};
const E={q:{level:'medium'},player:{busy:false,obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0,speed:0,pose:'idle'},zone:{roomAt:()=>null,seats:[]},npcs:[],interactables:[],levels:null,setWeather(){},hour:0,paused:false};
const GM={get G(){ return H.G; },E,D:{active:false},npc:{},running:true,
  sceneBegin(){},sceneEnd(){},face(){},cine(){},caption(){},sleep:()=>Promise.resolve(),memo(){},autosave(){},addNote(){},energy(){},money(){},setGoal(){},toast(){},updateHUD(){},letterbox(){},phoneBadge(){},syncWeekday(){},standUp(){},
  titleCard:async(a,b)=>{ H.cards.push([a,b]); },enter:async(z)=>{ H.entered.push(z); H.G.zone=z; },advance(h){ H.G.hour+=h; },fade:()=>Promise.resolve(),rel(){},walkTo:()=>Promise.resolve(true),sitAt(){},
  phoneThread:async()=>{}, openPhone(){},
  say:async(who,t)=>{ H.said.push({who:who?(who.name||String(who)):null,t:String(t).replace('{name}',H.G&&H.G.name||'祐廷')}); },
  choose:async o=>{ H.opts.push(o.map(q=>q.t||q.text)); const want=H.picks.shift(); if(typeof want==='string'){ let k=o.findIndex(q=>(q.t||q.text).includes(want)); if(k<0){ k=o.findIndex(q=>(q.sub||[]).some(s=>s.includes(want))); if(k>=0) H.picks.unshift(want); } return k<0?0:k; }   /* INVITE-MENU-1030 分層：要選的名稱在某一類裡（選項的 sub）＝先選那一類，這個 pick 留給下一層 */ return want||0; }};
H.GM=GM; H.E=E;
const wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
H.D=k=>PG.DK(k);
H.fresh=(key,hour,zone,flags)=>{ const day=PG.DK(key); H.G={v:3,day,hour,zone:zone||'dorm',stage:'law',weekday:wdOf(day),weather:'clear',energy:70,money:5000,flags:Object.assign({KX_FIRST_MSG:true,fundsV2:1,allowanceMonth:CALENDAR.dateOf(day).m,examSeed:12345},flags||{}),choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null,stats:{classes:0}};
  SOCIAL.bind(H.G); EVENTS.bind(GM); INV.rec(H.G); H.said=[]; H.opts=[]; H.picks=[]; H.cards=[]; H.cgs=[]; H.entered=[]; H.bgs=[]; GM.npc={}; E.interactables=[]; E.npcs=[]; E.player.busy=false; if(STORY._fy) STORY._fy.reset(); return H.G; };
H.rel=(id,fam,trust,comf)=>{ const r=SOCIAL.rel(id); r.fam=fam; r.trust=trust||0; r.comf=comf||0; SOCIAL.remember(id,'FIRST_MET',''); };
H.FRIEND=id=>H.rel(id,45,30,0); H.FAMILIAR=id=>H.rel(id,25,0,0); H.CLOSE=id=>H.rel(id,65,50,45);
H.date=id=>{ ROM.start(H.G,id); };
H.lines=()=>H.said.map(s=>(s.who?s.who+'：':'')+s.t);
H.has=t=>H.said.some(s=>s.t===t);
H.msgs=th=>(H.G.msgs||[]).filter(m=>!th||m.th===th).map(m=>m.text);
H.at=(key,h)=>{ const d=PG.DK(key); PG.setT(H.G,E,d,h); };
H.tick=()=>{ PG.rules(GM); PHONE.tick(H.G); };
H.run=async(id)=>{ const s=PG.byId(id); return PG.runStep(GM,s); };
H.done=()=>{ console.log(H.fails?('FAILED '+H.fails):'ALL PASS'); process.exit(H.fails?1:0); };
module.exports=H;
