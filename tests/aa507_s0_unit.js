// AA_507 第 0-2 節（企劃線 e4fbd0192，AA-C 10-28）開發分支現有內容的八件小修——不需要瀏覽器。
//   1 needed_msgs zq_name 沒收到那句「名字還沒取。我自己想。」  2 vacfill y3w_0115 美國面試＋選項「加油。」；heardUS 也算階梯 S5-L1（SIS5_EXCHANGE_APP）
//   3 學姊北投偶遇大三上 13:00 起（10/16 上午法扶訪談）  4 y3_0212「法圖下週一恢復晚上開館。」＋旁白  5 芷若 UK_WEEK 第 1 年 1 月第二句、2 月第一句
//   6 語彤大三上週三上午刑法總則（霖澤館 201 第二排）  7 以安週四 20:00 公法讀書會作息（大二以後；萬才館，和大一的兩筆同一種寫法）  8 沛珊台南的過時註解
// 修改前（開發分支 b0dcc95a6）：第 1～8 項 FAIL（第 2 項 heardUS 那一半本來就成立）。用法：node tests/aa507_s0_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const NAMES=/^(ROM|CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT|LADDER|HOME|HOME_LINES|CG_REGISTRY|NEEDED_MSGS|MSG|MSG_POOL|MSG2_POOL|HOMETOWN_LINES|HV|DATE|DATE_DATA|DATE_LINES|CONFESS_LINES|TERMEND|TERMEND_LINES|VAC|VAC_DATA|NOODLE_CLOSED|Y1FILL|Y1FILL_LINES|Y1FILL_EVENTS|HOLFF|SYLLABUS|FREE_TRIPS|TRIP|ENCOUNTERS|ENC)$/;
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>NAMES.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } length(){ return Math.hypot(this.x,this.y,this.z); } normalize(){ const l=this.length()||1; this.x/=l; this.y/=l; this.z/=l; return this; } }};
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const FILES=['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js','src/data/needed_msgs.js',
  'src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/data/msg_pool.js','src/data/msg2_pool.js','src/msg3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/data/hometown_lines.js','src/hometown3d.js','src/romance3d.js',
  'src/data/date_locations.js','src/data/date_lines.js','src/data/confess_lines.js','src/date3d.js','src/data/termend_lines.js','src/termend3d.js','src/data/vac_activities.js','src/vac3d.js','src/noodle_closed3d.js',
  'src/data/free_trips.js','src/freetrip3d.js','src/data/encounters.js','src/encounter3d.js','src/data/syllabus.js',
  'src/story3d.js','src/holff3d.js','src/classes3d.js','src/data/y1fill_events.js','src/y1fill3d.js'];
for(const f of FILES) if(fs.existsSync(path.join(ROOT,f))) load(f);
global.ADV={active:false,preload(){},begin(){ this.active=true; },end(){ this.active=false; },log(){},speaker(){},cg(){ return true; },setBg(){},hide(){}}; global.CHAR={setExpr(){}};
global.LEGAL={ask:async()=>{},apply(){},stateOf:()=>'unseen',STATES:['unseen']};
if(typeof HOME!=='undefined') HOME.phoneRules=()=>{};   /* 家人群組的週訊息和這裡無關 */
let said=[], opts=[], picks=[], G=null;
const E={q:{level:'medium'},player:{busy:false,obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0},zone:{roomAt:()=>null,seats:[]},npcs:[],interactables:[],levels:null,setWeather(){},hour:0,removeNPC(){}};
const GM={get G(){ return G; },E,D:{active:false},npc:{},
  sceneBegin(){},sceneEnd(){},face(){},cine(){},caption(){},sleep:()=>Promise.resolve(),memo(){},autosave(){},addNote(){},energy(){},setGoal(){},toast(){},updateHUD(){},letterbox(){},phoneBadge(){},
  titleCard:async()=>{},enter:async(z)=>{ G.zone=z; },advance(h){ G.hour+=h; },fade:()=>Promise.resolve(),rel(){},walkTo:()=>Promise.resolve(true),sitAt(){},standUp(){},money(n){ G.money+=n; },syncWeekday(){},removeNPC(){},hasNote:()=>true,
  spawnNPC(id,spec,x,z,o){ const n=Object.assign({id,charId:id,name:spec&&spec.name,obj:{position:{x,y:0,z}},beh:'idle'},o||{}); GM.npc[id]=n; return n; },
  say:async(who,t)=>{ said.push({who:who?(who.name||String(who)):null,t}); },choose:async o=>{ opts.push(o.map(q=>q.t||q.text)); const want=picks.shift(); if(typeof want==='string'){ const k=o.findIndex(q=>(q.t||q.text).includes(want)); return k<0?0:k; } return want||0; }};
const wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
const D=k=>STORY.dayOfKey(k), J=x=>JSON.stringify(x), K=d=>d==null?null:CALENDAR.dateOf(d).key, termDay=(t,w,wd)=>STORY.termDay(t,w,wd);
const fresh=(day,hour,zone,flags)=>{ G={v:3,day,hour,zone,stage:'law',weekday:wdOf(day),weather:'clear',energy:70,money:9000,flags:Object.assign({KX_FIRST_MSG:true,fundsV2:1,allowanceMonth:CALENDAR.dateOf(day).m,introDone:true,afternoonDone:true,classDone:true,metAn:true,MET_ZHE:true},flags||{}),choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null,stats:{classes:0},contacts:{},memo:[]};
  SOCIAL.bind(G); EVENTS.bind(GM); INV.rec(G); ROM.rec(G); said=[]; opts=[]; picks=[]; GM.npc={}; ADV.active=false; return G; };
const LV={ACQ:[10,0,0],FAM:[25,10,10],FRI:[45,30,10],CLO:[65,50,45]};
const R=(id,lv)=>{ const r=SOCIAL.rel(id); const [f,t,c]=LV[lv||'FAM']; r.fam=f; r.trust=t; r.comf=c; SOCIAL.remember(id,'FIRST_MET',''); };

const rd=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
{ const s=rd('src/data/needed_msgs.js'); check('1. needed_msgs zq_name 沒收到：「名字還沒取。我自己想。」（不是「遊戲名字我自己取了。先不說。」）',/id:'zq_name'[^\n]*miss:\['名字還沒取。我自己想。'\]/.test(s)); }
{ const s=rd('src/data/vacfill_events.js'); check("2. y3w_0115：「美國那邊的面試，排在下禮拜。」「線上的。八月去的那一梯。」→「加油。」→「嗯。……上了再跟你說。」",s.includes("y3w_0115:{ms:['美國那邊的面試，排在下禮拜。','線上的。八月去的那一梯。'],yes:'加油。',yesSay:'嗯。……上了再跟你說。'}"));
  const st=LADDER.byTerm&&Object.values(LADDER.byTerm).map(t=>t.heroine_05).filter(Boolean).flatMap(c=>c.steps).find(x=>x.id==='S5-L1');
  check('2. heardUS 也算階梯 S5-L1：它記的 mem 是 SIS5_EXCHANGE_APP，heardUS 讀這個記憶',!!st&&st.mem==='SIS5_EXCHANGE_APP'&&/SOCIAL\.has\(ID,'SIS5_EXCHANGE_APP'\)/.test(rd('src/data/sis_y2y3_events.js')),st?st.mem:'找不到 S5-L1'); }
{ const row=ENCOUNTERS.rows.find(r=>r.who==='heroine_05'&&r.spot==='D11'); const at=(k,h)=>{ fresh(D(k),h,'campus',{}); R('heroine_05','FRI'); const why=[]; ENC.eligible(G,row,why); return why.join(' '); };
  const y3a=at('2027-10-16',10.5), y3b=at('2027-10-16',13.5), y2=at('2026-10-17',10.5);
  check('3. 北投偶遇：大三上 10/16 10:30 不在（時段）、13:30 時段可以；大二上第 6 週週六 10:30 照舊可以',/時段/.test(y3a)&&!/時段/.test(y3b)&&!/時段/.test(y2),J({y3a,y3b,y2})); }
{ const s=rd('src/data/vacfill_events.js'); check('4. y3_0212：「法圖下週一恢復晚上開館。」、旁白「（恢復晚上開館的第一天，」',s.includes("y3_0212:{ms:['法圖下週一恢復晚上開館。','你開學以前要借書的話，那天人最少。']")&&s.includes("narr:'（恢復晚上開館的第一天，")&&!s.includes('法圖寒假下週一開。\'')); }
{ const s=rd('src/msg3d.js'); check('5. 芷若 UK_WEEK 第 1 年：1 月第二句「一月要考試。考完我想去北邊看一次雪。」、2 月第一句「剩十天。我開始數了。」',s.includes("'（照片：雪地上一排腳印）／下雪了。沒有積。','一月要考試。考完我想去北邊看一次雪。'],2:['剩十天。我開始數了。'")); }
{ const ent=(k,h,id)=>{ fresh(D(k),h,'campus',{}); const e=STORY.schedEnt(CHARACTERS[id],G); return e?{zone:e.zone,seat:e.seat}:null; };
  const wed=ent('2027-09-08',10,'heroine_03'), y2=ent('2026-09-09',10,'heroine_03');
  check('6. 語彤大三上週三 10:00：霖澤館 201（classroom）第二排 [1,4]；大二上週三 10:00 不是這一筆',!!wed&&wed.zone==='classroom'&&J(wed.seat)==='[1,4]'&&!(y2&&y2.zone==='classroom'&&J(y2.seat)==='[1,4]'),J({wed,y2}));
  const t1=ent('2026-11-12',20.5,'heroine_01'), t2=ent('2028-12-07',20.5,'heroine_01'), t3=ent('2026-11-13',20.5,'heroine_01');
  check('7. 以安週四 20:30 讀書會的週（大二上第 10 週）在萬才館（act club，和大一的兩筆同一種寫法）；大四上第 14 週（交棒以後）、週五不是',!!t1&&t1.zone==='wancai'&&!(t2&&t2.zone==='wancai')&&!(t3&&t3.zone==='wancai'),J({t1,t2,t3})); }
{ const a=rd('src/r3_3d.js'), b=rd('src/y2b3d.js'); check('8. 沛珊台南的過時註解改掉（不再寫「還沒做」「這一批還沒接」）',!a.includes('還沒做＝現在遊戲裡不會出現')&&!b.includes('這一批還沒接（LAWWW）')); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
