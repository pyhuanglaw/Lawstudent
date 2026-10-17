// 第二天阿哲約的麵：目標的字跟著時間換（BUG-GOALSTALE，使用者 2026-10-16 21:5x：9/18 19:42 還顯示「18:30 公館 阿鳳麵店（阿哲）」）——不需要瀏覽器。
// 18:30 以前照舊；18:30～20:30 改成「他還在等，20:30 前到」（阿哲在店裡待到 20:30，story3d.js populate），目的地不變；20:30 以後換成「今晚沒去吃麵」；吃過了不換。
// 修改前：19:42 目標還是「18:30 …」，第 2 項 FAIL。用法：node tests/goal_zhe_noodle_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}}; global.THREE={Vector3:function(){}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/events.js','src/social3d.js','src/events3d.js','src/story3d.js']) load(f);
global.ADV={active:false,preload(){},begin(){},end(){},log(){},speaker(){}}; global.CHAR={setExpr(){}};
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
let G=null;
const P={busy:false,obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0};
const GM={get G(){ return G; },E:{q:{level:'medium'},player:P,zone:{roomAt:()=>null,seats:[]},npcs:[],extras:[],interactables:[],levels:null},D:{active:false},npc:{},
  sceneBegin(){},sceneEnd(){},face(){},cine(){},caption(){},sleep:()=>Promise.resolve(),memo(){},autosave(){},energy(){},money(){},setGoal(g,d){ G.goal=g; G.goalDest=d; },toast(){},updateHUD(){},letterbox(){},
  say:async()=>{},choose:async()=>0,enter:async()=>{}};
const DEST={zone:'noodle',name:'阿鳳麵店'};
const at=(hour,zone,extra)=>{ const day=2; G={day,hour,zone:zone||'gongguan',weekday:CALENDAR.dateOf(day).wd%7,flags:Object.assign({introDone:true,classDone:true,afternoonDone:true,metAn:true,zheInvite:true},extra||{}),choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null,goal:'18:30 公館 阿鳳麵店（阿哲）',goalDest:Object.assign({},DEST)};
  SOCIAL.bind(G); EVENTS.bind(GM); GM.npc={}; };
at(18.2); STORY.tick(GM,0.016);
check('1. 18:12：目標照舊「18:30 公館 阿鳳麵店（阿哲）」',G.goal==='18:30 公館 阿鳳麵店（阿哲）',G.goal);
at(19.7,'wz_bookstore'); STORY.tick(GM,0.016);
check('2. 19:42（在別的地方）：不再寫 18:30，改成還在等、20:30 前到；目的地還是阿鳳麵店',!/18:30/.test(G.goal)&&/20:30 前/.test(G.goal)&&/阿鳳麵店（阿哲）/.test(G.goal)&&G.goalDest&&G.goalDest.zone==='noodle',G.goal);
STORY.tick(GM,0.016); const g2=G.goal;
G.hour=20.6; STORY.tick(GM,0.016);
check('3. 同一晚到了 20:36 還沒去：換成「今晚沒去吃麵」',/今晚沒去吃麵/.test(G.goal),g2+' → '+G.goal);
at(19.0,'noodle',{zheNoodleDone:true}); G.goal='吃完麵了'; STORY.tick(GM,0.016);
check('4. 已經吃過（zheNoodleDone）：不動目標',G.goal==='吃完麵了',G.goal);
console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
