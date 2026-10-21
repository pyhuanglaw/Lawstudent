// 收拾的時刻一週後自動補（V6-S4，AA_123 2-3：「一週內都沒做的玩家：一週後補一句旁白，也設 CLEANUP_DONE=true。不卡劇情」）——不需要瀏覽器。
//   修改前：ROM.end 設 CLEANUP_DONE=false、cleanupDue＝＋7 天，可是整個專案沒有人叫 ROM.cleanup、也沒有人讀 cleanupDue，
//   所以分開一次以後 ROM.canStart 永遠 false（termend3d.js 的心意邀約也全部擋掉）＝1A-02 攤牌、2-Y4-54 選一個人以後再也不能和任何人交往（2026-10-21 BACKLOG-SWEEP 稽核 B1 發現）。
//   1. 分開後第 6 天還不能開始新的一段；第 7 天（cleanupDue）可以——修改前 FAIL；
//   2. 舊存檔 CLEANUP_DONE false、沒有 cleanupDue：當作已經過了一週——修改前 FAIL；
//   3. 過了一週、旁白還沒補就開始新的一段：直接算收拾過；
//   4. STORY.tick：第 7 天補一句旁白「（你把那件事放好了。）」、CLEANUP_DONE true——修改前 FAIL；第 3 天不補；補過不再補；沒分開過不補。
// 用法：node tests/cleanup_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}}; global.THREE={Vector3:function(){}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|ROM)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/events.js','src/social3d.js','src/events3d.js','src/romance3d.js','src/story3d.js']) load(f);
global.ADV={active:false,preload(){},begin(){},end(){},log(){},speaker(){}}; global.CHAR={setExpr(){}};
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
let G=null, said=[];
const P={busy:false,obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0};
const GM={get G(){ return G; },E:{q:{level:'medium'},player:P,zone:{roomAt:()=>null,seats:[]},npcs:[],extras:[],interactables:[],levels:null},D:{active:false},npc:{},
  sceneBegin(){},sceneEnd(){},face(){},cine(){},caption(){},sleep:()=>Promise.resolve(),memo(){},autosave(){},energy(){},money(){},setGoal(g,d){ G.goal=g; G.goalDest=d; },toast(){},updateHUD(){},letterbox(){},rel(){},
  say:async(who,t)=>{ said.push(String(t)); },choose:async()=>0,enter:async()=>{}};
const D0=STORY.dayOfKey('2026-10-14');   /* 大二上的一個週三：一般的上課日，沒有別的固定事件 */
const at=(day,flags)=>{ G={day,hour:20.5,zone:'gongguan',stage:'law',weekday:CALENDAR.dateOf(day).wd%7,flags:Object.assign({introDone:true,classDone:true,campusIntro:true,afternoonDone:true,metAn:true},flags||{}),
  choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null,goal:''}; SOCIAL.bind(G); EVENTS.bind(GM); GM.npc={}; said=[]; };
const settle=()=>new Promise(r=>setTimeout(r,0));
(async()=>{
  // 1. ROM：分開以後一週
  at(D0,{dating_heroine_01:true}); ROM.rec(G); ROM.end(G,'heroine_01','apart_talk');
  check('1. 分開當天：CLEANUP_DONE false、cleanupDue＝＋7 天、不能開始新的一段',G.flags.CLEANUP_DONE===false&&G.flags.cleanupDue===D0+7&&!ROM.canStart(G,'heroine_03'));
  G.day=D0+6; check('1. 分開後第 6 天：還不能開始',!ROM.canStart(G,'heroine_03'));
  G.day=D0+7; check('1. 分開後第 7 天（一週後）：可以開始新的一段（修改前永遠 false）',ROM.canStart(G,'heroine_03'));
  G.day=D0+60; check('1. 分開後第 60 天：可以開始（稽核實測修改前 false）',ROM.canStart(G,'heroine_03'));
  // 2. 舊存檔
  at(D0+30,{CLEANUP_DONE:false,EX_heroine_01:true}); ROM.rec(G);
  check('2. 舊存檔 CLEANUP_DONE false、沒有 cleanupDue：當作已經過了一週',ROM.cleanupLate(G)&&ROM.canStart(G,'heroine_03'));
  // 3. 過了一週直接開始
  at(D0,{dating_heroine_01:true}); ROM.rec(G); ROM.end(G,'heroine_01','apart_talk'); G.day=D0+8;
  check('3. 過了一週、旁白還沒補就開始新的一段：開始成功、CLEANUP_DONE true、cleanupDue 清掉',ROM.start(G,'heroine_03')&&G.flags.CLEANUP_DONE===true&&G.flags.cleanupDue==null);
  check('3. 開始以後不再補旁白',!ROM.cleanupLate(G));
  // 4. STORY.tick 補旁白
  at(D0,{dating_heroine_01:true}); ROM.rec(G); ROM.end(G,'heroine_01','apart_talk'); const F=G.flags;
  G.day=D0+3; said=[]; STORY.tick(GM,0.016); await settle();
  check('4. 第 3 天：不補旁白、CLEANUP_DONE 還是 false',!said.includes(STORY.CLEANUP_LINE)&&F.CLEANUP_DONE===false,JSON.stringify(said));
  G.day=D0+7; G.weekday=CALENDAR.dateOf(G.day).wd%7; said=[]; STORY.tick(GM,0.016); await settle();
  check('4. 第 7 天：補一句旁白「（你把那件事放好了。）」、CLEANUP_DONE true、cleanupDue 清掉（修改前沒有 STORY.cleanupTick）',STORY.CLEANUP_LINE==='（你把那件事放好了。）'&&said.includes(STORY.CLEANUP_LINE)&&F.CLEANUP_DONE===true&&F.cleanupDue==null,JSON.stringify(said));
  said=[]; STORY.tick(GM,0.016); await settle();
  check('4. 補過以後再 tick：不再補',!said.includes(STORY.CLEANUP_LINE));
  at(D0+7,{}); ROM.rec(G); said=[]; STORY.tick(GM,0.016); await settle();
  check('4. 沒有分開過的存檔：不補',!said.includes(STORY.CLEANUP_LINE)&&G.flags.CLEANUP_DONE===true);
  at(D0+7,{dating_heroine_01:true}); ROM.rec(G); ROM.end(G,'heroine_01','apart_talk'); P.busy=true; said=[]; STORY.tick(GM,0.016); await settle();
  check('4. 分開當天就算過了 cleanupDue 也要等：人在忙（busy）的時候不補',!said.includes(STORY.CLEANUP_LINE)); P.busy=false;
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); console.log('FAILED'); process.exit(1); });
