// AA_310（X80，WELCOME-DATE-1020；使用者 2026-10-20：「迎新在9/27不合理阿 應該在開學前」）——不需要瀏覽器。
//   大一的迎新就是 8/22～24 宿營；9/27 那場是沒有宿營的局的備用，改到開學前 8/31（日）09:30～12:00 傅鐘前（下午開學典禮）。
//   1. welcome_y1s1：8/31 09:30–12:00、說明「開學典禮前的上午……」；有宿營（CAMP_Y1）的局不辦；9/27 沒有；
//   2. ev_welcome_y1s1 第一句「星期天上午，傅鐘前面，法律系的迎新。下午就是開學典禮。……」；8/31 在大一上開學前也演得到（不寫 term）；
//   3. 9/2 國文「找教室」（ev_ps_w1_room）：8/31 迎新認識沛珊（welcomeDay）的走「已認識」那一段；宿營認識的照舊；都沒有的照舊是「不好意思，請問這間是大一國文嗎？」；
//   4. 大二小隊輔：9/4（五）21:00 公告「禮拜天迎新，小隊輔兩點在社科院旁的草地集合。」、9/6（日）14:00 出發（tests/v3_welcome_unit.js 細測）。
// 修改前 1～4 都 FAIL。用法：node tests/aa310_welcome_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}}; global.THREE={Vector3:function(){}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|ACTIVITIES)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/activities.js','src/data/events.js','src/social3d.js','src/events3d.js','src/story3d.js']) load(f);
global.ADV={active:false,preload(){},begin(){},end(){},log(){},speaker(){}}; global.CHAR={setExpr(){}};
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
let G=null, said=[];
const P={busy:false,obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0};
const GM={get G(){ return G; },E:{q:{level:'medium'},player:P,zone:{roomAt:()=>null,seats:[]},npcs:[],extras:[],interactables:[],levels:null},D:{active:false},npc:{},
  sceneBegin(){},sceneEnd(){},face(){},cine(){},caption(){},sleep:()=>Promise.resolve(),memo(){},autosave(){},energy(){},money(){},setGoal(){},toast(){},updateHUD(){},letterbox(){},rel(){},advance(){},
  say:async(who,t)=>{ said.push(String(t)); },choose:async()=>0,enter:async()=>{},spawnCharacter:()=>null};
const D=k=>STORY.dayOfKey(k), ev=id=>STORY_EVENTS.find(e=>e.id===id);
const mk=(key,h,flags)=>{ const day=D(key); G={day,hour:h,zone:'campus',stage:'law',weekday:CALENDAR.dateOf(day).wd%7,flags:Object.assign({introDone:true,LAW_START_DAY:-18,MAIN_D1:-13},flags||{}),choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null};
  SOCIAL.bind(G); EVENTS.bind(GM); said=[]; return G; };
(async()=>{
  const a=ACTIVITIES.list.find(x=>x.id==='welcome_y1s1');
  check('1. 迎新（沒有宿營的備用）：8/31 09:30–12:00、說明「開學典禮前的上午……」；9/27 沒有', !!a&&ACTIVITIES.on(a,D('2025-08-31'),{flags:{}})&&!ACTIVITIES.on(a,D('2025-09-27'),{flags:{}})&&a.t0===9.5&&a.t1===12&&/^開學典禮前的上午/.test(a.desc||''), a&&JSON.stringify({dates:a.dates,t0:a.t0,t1:a.t1}));
  check('1. 有宿營（CAMP_Y1）的局不辦', !!a&&!ACTIVITIES.on(a,D('2025-08-31'),{flags:{CAMP_Y1:true}}));
  const w=ev('ev_welcome_y1s1'); mk('2025-08-31',9.5,{});
  check('2. 第一句「星期天上午，晨思鐘前面，法律系的迎新。下午就是開學典禮。學長姊帶隊，大家先輪流自我介紹。」', (w.dialogue[0]||{}).text==='星期天上午，晨思鐘前面，法律系的迎新。下午就是開學典禮。學長姊帶隊，大家先輪流自我介紹。');
  check('2. 8/31（大一上開學前）演得到（沒有 term 擋）', !w.term&&EVENTS.check(w,{chain:true})!==false);
  const e=ev('ev_ps_w1_room');
  mk('2025-09-02',9,{welcomeDay:D('2025-08-31')}); await EVENTS.run(e); const L1=said.slice();
  check('3. 8/31 迎新認識的（welcomeDay）：走「已認識」那一段（「欸，祐廷。你也是這間嗎？」）', L1.some(t=>/你也是這間嗎/.test(t))&&!L1.some(t=>/請問這間是大一國文嗎/.test(t)), JSON.stringify(L1.slice(0,2)));
  mk('2025-09-02',9,{}); await EVENTS.run(e); const L2=said.slice();
  check('3. 宿營、迎新都沒有：照舊「不好意思，請問這間是大一國文嗎？法律系那班。」', L2.some(t=>/請問這間是大一國文嗎/.test(t)), JSON.stringify(L2.slice(0,1)));
  { const s=fs.readFileSync(path.join(ROOT,'src/story3d.js'),'utf8');
    check('4. 大二小隊輔：9/4 21:00 公告「禮拜天迎新，小隊輔兩點……」、9/6 14:00 出發', /S\.dayOfKey\('2026-09-06'\), di=S\.dayOfKey\('2026-09-04'\)/.test(s)&&/禮拜天迎新，小隊輔兩點在社科院旁的草地集合。/.test(s)&&/id:'y2_welcome',ev:'ev_y2_welcome',day:d,h:14,/.test(s)); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });
