// AA_510 第 0-2 節（企劃線 28f981438，AA-C 10-28）開發分支現有內容的七件——不需要瀏覽器。
//   1 以安、語彤大四下週四 20:00～21:30 總圖三樓（第 1～15 週）  2 語彤 2029 暑假週四 17:30～20:30 麵店
//   3 以安 A8-L1「證券交易法」、回覆「證交法很好玩。真的。」（閒聊階梯 _fix）  4 芷若畢業那天的照片改 6/3 05:07
//   5 學姊招呼「論文寫到第四章了」5/29 16:00 口試以後不出  6 日本路線大四下補修班沒有以安（classmateClass 跳過 redo）。（7 不用改）
// 修改前（開發分支 a3da40c1c）：第 1～6 項 FAIL。用法：node tests/aa510_s0_unit.js
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

const ent=(k,h,id,flags)=>{ fresh(D(k),h,'campus',flags||{}); const e=STORY.schedEnt(CHARACTERS[id],G); return e?{zone:e.zone,act:e.act,room:e.room,cls:e.cls,away:e.away}:null; };
{ const a1=ent('2029-02-22',20.5,'heroine_01'), a15=ent('2029-05-31',20.5,'heroine_01'), y1=ent('2029-02-22',21,'heroine_03'), y15=ent('2029-05-31',21,'heroine_03'), a16=ent('2029-06-07',20.5,'heroine_01');
  check('1. 大四下週四：以安 20:30、語彤 21:00 都在總圖三樓（第 1 週 2/22、第 15 週 5/31）；畢業以後（6/7）以安不在這一筆',a1&&a1.zone==='library'&&a15&&a15.zone==='library'&&y1&&y1.zone==='library'&&y15&&y15.zone==='library'&&!(a16&&a16.zone==='library'&&a16.act==='read'),J({a1,a15,y1,y15,a16})); }
{ const s=ent('2029-06-07',18,'heroine_03'), t=ent('2029-05-31',18,'heroine_03'), aft=ent('2029-09-06',18,'heroine_03');
  check('2. 語彤 2029 暑假週四 18:00 在麵店（6/7）；學期中（5/31）在總圖；9/6 開學以後回總圖',s&&s.zone==='noodle'&&t&&t.zone==='library'&&aft&&aft.zone==='library',J({s,t,aft})); }
{ const st=(LADDER.byTerm.Y4S2.heroine_01.steps||[]).find(x=>x.id==='A8-L1');
  check('3. 以安 A8-L1：「這學期我多選了一門證券交易法。不是必修。」、回覆「證交法很好玩。真的。……你那個表情是什麼意思。」；台詞、選項沒有「保險法」（第二個回覆「公司、保險、證券」照舊）',!!st&&st.lines[0]==='這學期我多選了一門證券交易法。不是必修。'&&st.choices[0].reply==='證交法很好玩。真的。……你那個表情是什麼意思。'&&!J(st.lines).includes('保險法')&&!J(st.choices).includes('保險法'),J(st&&{l:st.lines,c:st.choices})); }
{ const s=rd('src/postgrad3d.js'); check("4. 芷若畢業那天的照片（pg_zr_photo）改 6/3 05:07（英國 6/2 22:07），字不改",s.includes("{tag:'pg_zr_photo',at:['2029-06-03',5+7/60],")&&rd('src/data/postgrad_lines.js').includes("'畢業快樂。今天下午替你看了一部。'")); }
{ const R=STORY.LADDER_GREET_IF||{}, k1=R['學弟。……論文寫到第四章了。'], k2=R['{name}。……論文寫到第四章了。'];
  const at=(k,h)=>({day:D(k),hour:h,flags:{}}); const ok=x=>!!x&&x.test(at('2029-05-29',15))&&!x.test(at('2029-05-29',16))&&!x.test(at('2029-05-30',10))&&x.test(at('2029-03-01',10));
  check('5. 學姊招呼「論文寫到第四章了」（學弟版、名字版）：5/29 15:00 還說、16:00 口試以後、5/30 不說',ok(k1)&&ok(k2)); }
{ const mon=STORY.termDay('Y4S2',3,1); fresh(mon,10,'classroom',{EXCHANGE_ROUTE:'JP'}); const an=STORY.classmateClass(CHARACTERS.heroine_01,G), zh=STORY.classmateClass(CHARACTERS.zhe,G);
  check('6. 日本路線大四下週一 10:00 補修民訴（civpro_2_re）：以安不在補修班（classmateClass 沒有這一堂）',!(an&&/civpro_2_re/.test(an.cls||'')),J({an,zh})); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
