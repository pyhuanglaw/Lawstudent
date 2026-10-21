// AA_313 第 0 節（X70、BUG-MEET-HEROINES-1020；AA-C 2026-10-20 14:11）：錯過第二天的玩家（anMissed，現在也算 afternoonDone）第 4 週民總下課的 ev_an_report_split——
//   「你那天講的，我想放進去。」指第二天 Café 那段（cafeView A／B／C），錯過的玩家沒去過——不需要瀏覽器。
//   1. 有 cafeView：照舊「你那天講的，我想放進去。」；選「好，一起寫。」接 A／B／C 那一句；
//   2. 沒有 cafeView、有 classAnswer：第二句「你上課回答的那題，我想放進去。」；
//   3. 兩個都沒有：第二句「你要不要跟我一組？」；
//   4. 沒有 cafeView 的玩家選「好，一起寫。」：以安接「好。那分工我來排。」（A／B／C 三句都不出）；REPORT_PARTNER 照記；
//   5. 選「我已經有組了。」照舊「好。那我自己寫，寫完給你看。」。
// 修改前 2～4 FAIL。用法：node tests/aa313_report_split_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}}; global.THREE={Vector3:function(){}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/events.js','src/social3d.js','src/events3d.js','src/story3d.js']) load(f);
global.ADV={active:false,preload(){},begin(){},end(){},log(){},speaker(){}}; global.CHAR={setExpr(){}};
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
let G=null, said=[], pick=0;
const P={busy:false,obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0};
const GM={get G(){ return G; },E:{q:{level:'medium'},player:P,zone:{roomAt:()=>null,seats:[]},npcs:[],extras:[],interactables:[],levels:null},D:{active:false},npc:{},
  sceneBegin(){},sceneEnd(){},face(){},cine(){},caption(){},sleep:()=>Promise.resolve(),memo(){},autosave(){},energy(){},money(){},setGoal(){},toast(){},updateHUD(){},letterbox(){},rel(){},advance(){},
  say:async(who,t)=>{ said.push(String(t)); },choose:async opts=>{ said.push('▶'+opts.map(o=>o.t).join('|')); return pick; },enter:async()=>{},spawnCharacter:()=>null};
const ev=STORY_EVENTS.find(e=>e.id==='ev_an_report_split');
const run=async(flags,choices,k)=>{ G={day:30,hour:15.2,zone:'classroom',stage:'law',weekday:4,flags:Object.assign({introDone:true,classDone:true,afternoonDone:true},flags),choices:choices||{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null};
  SOCIAL.bind(G); EVENTS.bind(GM); said=[]; pick=k; await EVENTS.run(ev); return said.slice(); };
(async()=>{
  let L=await run({classAnswer:'bold'},{cafeView:'B'},0);
  check('1. 有 cafeView：「你那天講的，我想放進去。」→「好，一起寫。」→「那反方你寫。」', L.includes('你那天講的，我想放進去。')&&L.includes('那反方你寫。')&&!L.includes('好。那分工我來排。')&&!L.includes('你上課回答的那題，我想放進去。'), JSON.stringify(L));
  L=await run({anMissed:true,anAfter:true,classAnswer:'bold'},{},0);
  check('2. 沒有 cafeView、有 classAnswer：「你上課回答的那題，我想放進去。」', L.includes('你上課回答的那題，我想放進去。')&&!L.includes('你那天講的，我想放進去。')&&!L.includes('你要不要跟我一組？'), JSON.stringify(L));
  check('4. 沒有 cafeView 選「好，一起寫。」→「好。那分工我來排。」（A／B／C 都不出）；記 REPORT_PARTNER', L.includes('好。那分工我來排。')&&!L.some(t=>/那結論你寫|那反方你寫|那判斷標準你寫/.test(t))&&SOCIAL.has('heroine_01','REPORT_PARTNER'), JSON.stringify(L));
  L=await run({anMissed:true,anAfter:true},{},0);
  check('3. 兩個都沒有：「你要不要跟我一組？」', L.includes('你要不要跟我一組？')&&!L.includes('你那天講的，我想放進去。')&&!L.includes('你上課回答的那題，我想放進去。'), JSON.stringify(L));
  L=await run({anMissed:true,anAfter:true,classAnswer:'bold'},{},1);
  check('5. 選「我已經有組了。」照舊「好。那我自己寫，寫完給你看。」', L.includes('好。那我自己寫，寫完給你看。')&&!L.includes('好。那分工我來排。'), JSON.stringify(L));
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });
