// AA_509 第 0-2 節（企劃線 3120ac77a／691a26400，AA-C 10-28）開發分支現有內容的九件——不需要瀏覽器。
//   1 學姊論文：sis_y2y3 大三上「第四章，要在那邊寫」、回覆池「在改論文的第四章」、日本路線道別「我四月中寫到第三章」、j2「第三章被教授退回來一半」
//   2 語彤 2028-07-09 生日回覆「第二十二個」  3 以安週四麵店（第 2～13 週）、11/30 以後週四總圖三樓；語彤 11/30 以後週四到 21:30
//   5 語彤大四上兩門法律課（憲法（上）週一上午、民法總則週四下午，第二排）  6 子晴國定假日、春節休（holOff）  7 溫州街學姊 12/23 回來
//   9 以安 D09 貓空大四上改 11/12（週日，termDays）；以安大四上週五上午公法判決研討（萬才館）、研討下課以後總圖、週四財稅法（AA-C 10-28 05:06 回）。（4、8 是動態與順序，不改開發分支）
// 修改前（開發分支 8c93228fb）：第 1～3、5～7、9 項 FAIL。用法：node tests/aa509_s0_unit.js
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

const ent=(k,h,id)=>{ fresh(D(k),h,'campus',{}); const e=STORY.schedEnt(CHARACTERS[id],G); return e?{zone:e.zone,act:e.act,seat:e.seat,away:e.away}:null; };
{ const a=rd('src/data/sis_y2y3_events.js'), b=rd('src/data/sis_jp_events.js'), m=rd('src/data/msg_pool.js');
  check('1. 學姊論文：大三上「八月走，十二月回來。論文的第四章，要在那邊寫。」；回覆池「在改論文的第四章。」；日本路線「……我四月中寫到第三章，拍給你看。這是我自己要做到的。」、j2「第三章被教授退回來一半。」',
    a.includes("SIS('八月走，十二月回來。論文的第四章，要在那邊寫。')")&&!a.includes('論文的第三章，要在那邊寫')&&m.includes('"在改論文的第四章。"')&&!m.includes('在改論文的第二章')&&b.includes("SIS('……我四月中寫到第三章，拍給你看。這是我自己要做到的。')")&&b.includes("SIS('第三章被教授退回來一半。')")&&!b.includes('第四章被教授退回來一半')); }
{ const s=rd('src/r2y3b3d.js'); check('2. 語彤 2028-07-09 生日回覆「……謝謝。今年的田野，訪問到第二十二個了。」',s.includes("text:'……謝謝。今年的田野，訪問到第二十二個了。'")&&!s.includes('訪問到第二十三個了')); }
{ const n1=ent('2028-09-14',19,'heroine_01'), n13=ent('2028-11-30',19,'heroine_01'), n14=ent('2028-12-07',19,'heroine_01'), rg=ent('2028-11-30',20.5,'heroine_01'), lib=ent('2028-12-07',20.5,'heroine_01'), y3=ent('2027-09-16',19,'heroine_01');
  check('3. 以安大四上週四 19:00 在麵店（第 2 週 9/14、第 13 週 11/30）；第 14 週 12/7 不是；大三上不是',n1&&n1.zone==='noodle'&&n13&&n13.zone==='noodle'&&!(n14&&n14.zone==='noodle')&&!(y3&&y3.zone==='noodle'),J({n1,n13,n14,y3}));
  check('3. 以安 11/30 20:30 還在讀書會（萬才館，交棒那天）；12/7 20:30 在總圖三樓',rg&&rg.zone==='wancai'&&lib&&lib.zone==='library',J({rg,lib}));
  const y1=ent('2028-12-07',18,'heroine_03'), y2=ent('2028-12-07',21,'heroine_03'), y0=ent('2028-11-23',21,'heroine_03');
  check('3. 語彤 12/7（週四）18:00、21:00 都在總圖三樓（九點半先走）；11/23 21:00 不在總圖',y1&&y1.zone==='library'&&y2&&y2.zone==='library'&&!(y0&&y0.zone==='library'),J({y1,y2,y0})); }
{ const m=ent('2028-09-11',10,'heroine_03'), t=ent('2028-09-14',14,'heroine_03'), m3=ent('2027-09-13',10,'heroine_03');
  check('5. 語彤大四上週一 10:00 憲法（上）、週四 14:00 民法總則：霖澤館 201 第二排 [1,4]；大三上週一 10:00 不是這一筆',m&&m.zone==='classroom'&&J(m.seat)==='[1,4]'&&t&&t.zone==='classroom'&&J(t.seat)==='[1,4]'&&!(m3&&m3.zone==='classroom'&&J(m3.seat)==='[1,4]'),J({m,t,m3})); }
{ const wk=ent('2028-10-11',11,'heroine_04'), hol=ent('2028-10-10',11,'heroine_04'), cny=ent('2029-02-13',11,'heroine_04'), sum=ent('2028-08-09',11,'heroine_04');
  check('6. 子晴在工作室上班：平日（10/11）在；國慶 10/10、春節 2/13 不在工作室；暑假（8/9）照常上班',!!wk&&wk.away==='在工作室上班'&&!(hol&&hol.away==='在工作室上班')&&!(cny&&cny.away==='在工作室上班')&&!!sum&&sum.away==='在工作室上班',J({wk,hol,cny,sum})); }
{ const s=rd('src/wzlines3d.js'); check("7. 溫州街學姊不在臺灣算到 12/22（12/23 回來）",s.includes("const a=DK('2028-08-02'), b=DK('2028-12-22');")); }
{ const row=ENCOUNTERS.rows.find(r=>r.who==='heroine_01'&&r.spot==='D09'); const at=(k,h)=>{ fresh(D(k),h,'campus',{}); STORY.populate&&0; const why=[]; ENC.eligible(G,row,why); return why.join(' '); };
  const sat=at('2028-11-11',16), sun=at('2028-11-12',16), y2=at('2026-11-14',16);
  check('9. 以安 D09 貓空：大四上第 10 週週六 11/11 不是（星期），週日 11/12 星期對；大二上第 10 週週六照舊',/星期/.test(sat)&&!/星期/.test(sun)&&!/星期/.test(y2),J({sat,sun,y2}));
  const e=ent('2028-11-12',16,'heroine_01'), e2=ent('2028-11-11',16,'heroine_01');
  check('9. 作息同一筆：11/12 16:00「和讀書會在貓空」、11/11 不是',e&&e.away==='和讀書會在貓空'&&!(e2&&e2.away==='和讀書會在貓空'),J({e,e2})); }
{ const sem=ent('2028-09-08',10,'heroine_01'), lib=ent('2028-09-08',13,'heroine_01'), tax=ent('2028-10-19',14,'heroine_01'), y3=ent('2027-09-10',10,'heroine_01');
  check('9. 以安大四上週五 10:00 在萬才館上公法判決研討（act class）、13:00 在總圖；週四 14:00 在霖澤館 202 上財稅法；大三上週五 10:00 照舊不是研討',sem&&sem.zone==='wancai'&&sem.act==='class'&&lib&&lib.zone==='library'&&tax&&tax.zone==='linze_202'&&tax.act==='class'&&!(y3&&y3.zone==='wancai'&&y3.act==='class'),J({sem,lib,tax,y3})); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
