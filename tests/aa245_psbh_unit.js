// AA_245（企劃線 2af03a63；任務 AA245-PSBH）沛珊×柏翰沒在一起的版本（玩家和沛珊交往中＝AA_374 第 11 項同一個條件）——不需要瀏覽器。
//   0 讀稿：第 1 節柏翰自己的三句逐字在 AA_245
//   1 大一下期中晚餐（ev_midterm_supper_y1s2）：和沛珊交往中、認識柏翰＝柏翰算麵錢三句（沒有公開那一段）；沒交往＝照舊公開、沒有算麵錢；交往中但不認識柏翰＝都沒有
//   2 大一下第 4 週「走出萬才館」（ev_peishan_bohan_w4）：和沛珊交往中不演（prereq）；沒交往照舊
//   3 大二上第 6 週的分手：ev_peishan_split 交往中不演（AA_374 已做，對照）、ev_peishan_bohan_split 不會演（只留一件）
// 修改前（開發分支 b947f4eb）：第 0 節照樣過，第 1 節「交往中」、第 2 節 FAIL。用法：node tests/aa245_psbh_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:'?noriders'};
const NAMES=/^(ROM|CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT|LADDER|HOME|HOME_LINES|CG_REGISTRY|NEEDED_MSGS|MSG|MSG_POOL|MSG2_POOL|HOMETOWN_LINES|HV|DATE|DATE_DATA|DATE_LINES|CONFESS_LINES|TERMEND|TERMEND_LINES|VAC|VAC_DATA|NOODLE_CLOSED|Y1FILL_LINES|DORM_ROOM|SYLLABUS)$/;
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>NAMES.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
const mkObj=()=>({position:{x:0,y:0,z:0,set(x,y,z){ this.x=x; this.y=y; this.z=z; }},rotation:{y:0},userData:{},add(){}});
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const FILES=['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js','src/data/needed_msgs.js',
  'src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/data/msg_pool.js','src/data/msg2_pool.js','src/msg3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/data/hometown_lines.js','src/hometown3d.js','src/romance3d.js',
  'src/data/date_locations.js','src/data/date_lines.js','src/data/confess_lines.js','src/date3d.js','src/data/termend_lines.js','src/termend3d.js','src/data/vac_activities.js','src/vac3d.js','src/noodle_closed3d.js','src/data/y1fill_events.js',
  'src/data/dorm_room_layout.js','src/data/syllabus.js','src/story3d.js','src/classes3d.js'];
for(const f of FILES) if(fs.existsSync(path.join(ROOT,f))) load(f);
global.ADV={active:false,preload(){},begin(){ this.active=true; },end(){ this.active=false; },log(){},speaker(){},cg(){ return true; },setBg(){},hide(){}}; global.CHAR={setExpr(){},build:()=>mkObj()};
global.LEGAL={ask:async()=>{},apply(){},stateOf:()=>'unseen',STATES:['unseen']};
let said=[], opts=[], picks=[], G=null;
const E={q:{level:'medium'},player:{busy:false,obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0},zone:{roomAt:()=>null,seats:[]},npcs:[],interactables:[],levels:null,setWeather(){},hour:0};
const GM={get G(){ return G; },E,D:{active:false},npc:{},
  sceneBegin(){},sceneEnd(){},face(){},cine(){},caption(){},sleep:()=>Promise.resolve(),memo(){},autosave(){},addNote(){},energy(){},setGoal(){},toast(){},updateHUD(){},letterbox(){},phoneBadge(){},
  titleCard:async()=>{},enter:async(z)=>{ G.zone=z; },advance(h){ G.hour+=h; },fade:()=>Promise.resolve(),rel(){},walkTo:()=>Promise.resolve(true),sitAt(){},standUp(){},money(n){ G.money+=n; },syncWeekday(){},
  spawnCharacter(id,x,z,o){ const n=Object.assign({id,charId:id,name:(CHARACTERS[id]||{}).name||id,obj:mkObj()},o||{}); GM.npc[id]=n; return n; },
  say:async(who,t)=>{ said.push({who:who?(who.name||String(who)):null,t}); },choose:async o=>{ opts.push(o.map(q=>q.t||q.text)); const want=picks.shift(); if(typeof want==='string'){ const k=o.findIndex(q=>(q.t||q.text).includes(want)); return k<0?0:k; } return want||0; }};
const wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
const D=k=>STORY.dayOfKey(k), J=x=>JSON.stringify(x), K=d=>CALENDAR.dateOf(d).key, termDay=(t,w,wd)=>STORY.termDay(t,w,wd);
const fresh=(day,hour,zone,flags)=>{ G={v:3,day,hour,zone,stage:'law',weekday:wdOf(day),weather:'clear',energy:70,money:9000,flags:Object.assign({KX_FIRST_MSG:true,fundsV2:1,allowanceMonth:CALENDAR.dateOf(day).m,introDone:true,afternoonDone:true,classDone:true,metAn:true,MET_ZHE:true},flags||{}),choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null,stats:{classes:0},contacts:{}};
  SOCIAL.bind(G); EVENTS.bind(GM); INV.rec(G); ROM.rec(G); said=[]; opts=[]; picks=[]; GM.npc={}; ADV.active=false; E.npcs=[]; return G; };
const LV={ACQ:[10,0,0],FAM:[25,10,10],FRI:[45,30,10],CLO:[65,50,45]};
const R=(id,lv)=>{ const r=SOCIAL.rel(id); const [f,t,c]=LV[lv||'FAM']; r.fam=f; r.trust=t; r.comf=c; SOCIAL.remember(id,'FIRST_MET',''); };
const run=(h0,h1,st)=>{ st=st||0.05; for(let h=h0;h<=h1+1e-9;h+=st){ G.hour=+h.toFixed(3); STORY.phoneRules(GM); PHONE.tick(G); } };
const TH=th=>(G.msgs||[]).filter(m=>m.th===th), txt=th=>TH(th).map(m=>m.text);
const lines=()=>said.map(s=>(s.who?s.who+'：':'')+s.t);
const ev=id=>STORY_EVENTS.find(e=>e.id===id);
const evText=id=>{ const e=ev(id); return e?(e.dialogue||[]).map(l=>l&&l.text).filter(t=>typeof t==='string'):[]; };
const NM=id=>SOCIAL.displayName?SOCIAL.displayName(id):(CHARACTERS[id]||{}).name;

const {execSync}=require('child_process');
let DOC=''; try{ DOC=execSync('git -c core.quotepath=false show 2af03a63:"docs/story_planning/AA_245_沛珊柏翰_沒交往的版本.md"',{cwd:ROOT,encoding:'utf8'}); }catch(e){}
const s1=(DOC.split('## 1.')[1]||'').split('\n## ')[0], bq=s1.split('\n').filter(l=>l.startsWith('> ')).map(l=>l.slice(2).replace(/^(柏翰|阿哲)：/,''));
const NEW=['（柏翰把每個人的麵錢算好，寫在餐巾紙上。）','一個人一百一十五。阿哲你多一顆蛋，一百二十五。','……你連這個都算。'];
check('0. 讀稿：AA_245 第 1 節柏翰的三句，和遊戲裡要演的一字不差',J(bq)===J(NEW),J(bq));
(async()=>{
  const sup=async(dating,knowBohan)=>{ fresh(termDay('Y1S2',8,3),19,'noodle',Object.assign({DORM_FOUR:true},dating?{dating_classmate_peishan:true}:{})); R('classmate_peishan','FRI'); R('yu','FAM'); if(knowBohan) R('classmate_bohan','FAM'); said=[]; picks=[0,0]; await EVENTS.run(ev('ev_midterm_supper_y1s2')); return said.map(s=>s.t); };
  const a=await sup(true,true), b=await sup(false,true), c=await sup(true,false);
  check('1. 和沛珊交往中、認識柏翰：柏翰算麵錢三句（照稿的順序），沒有公開那一段',J(a.filter(t=>NEW.includes(t)))===J(NEW)&&!a.some(t=>/對，我們在一起了|滷蛋切成兩半|上禮拜的事/.test(t)),J(a.slice(-5)));
  check('1. 沒交往（對照）：照舊公開「對，我們在一起了。你們吃你們的。」，沒有算麵錢',b.some(t=>/對，我們在一起了/.test(t))&&!b.some(t=>NEW.includes(t)),J(b.slice(-5)));
  check('1. 交往中但還不認識柏翰：兩段都沒有',!c.some(t=>NEW.includes(t))&&!c.some(t=>/對，我們在一起了/.test(t)),J(c.slice(-4)));
  const w4=ev('ev_peishan_bohan_w4'), pre=dating=>{ fresh(termDay('Y1S2',4,4),18,'wancai',dating?{dating_classmate_peishan:true}:{}); R('classmate_peishan','FRI'); return EVENTS.cond(w4.prereq); };
  check('2. 「走出萬才館」：和沛珊交往中不演（prereq 不成立）；沒交往照舊',!!w4&&pre(false)===true&&pre(true)===false,J([pre(false),pre(true)]));
  const sp=dating=>{ fresh(termDay('Y2S1',6,1),12.3,'linze',dating?{dating_classmate_peishan:true}:{}); R('classmate_peishan','FRI'); return EVENTS.check(ev('ev_peishan_split')); };
  const bs=()=>{ fresh(termDay('Y2S1',6,1),12.3,'linze',{}); R('classmate_peishan','FRI'); return EVENTS.cond(ev('ev_peishan_bohan_split').prereq); };
  check('3. 大二上第 6 週的分手只演一件：ev_peishan_split 沒交往照演、交往中不演（AA_374，對照）；ev_peishan_bohan_split 不演',sp(false)===true&&sp(true)===false&&bs()===false,J([sp(false),sp(true),bs()]));
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外 '+(e&&e.stack||e)); process.exit(1); });
