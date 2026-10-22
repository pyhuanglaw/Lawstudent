// 家人群組「這週回來吃飯嗎」法律系新局頭兩個週四（BUG-HOME-FAMGROUP-NEGIDX-1021；AA_372 子代理 2026-10-21 順手發現）——不需要瀏覽器。
// 原因：新局從 2025-08-29 開始，9/4（週四）是第 -12 天，home3d.js 用 (G.day/7|0)%句數 挑句子＝-1 → 拿不到句子、丟例外；
//       story3d.js 的 phoneRules 攔下來只印警告，所以 9/4 那一則一直沒發（同一個 try 裡的 HOME.breakPhone 也跟著跳過），整晚每次跑手機規則都印一次警告。
// 檢查：1. 9/4 20:00 媽媽在「家人」群組問一句、沒有 HOME.phoneRules 的警告；2. 9/11、9/18 也照常問；
//       3. 第 1 天以後挑的句子和原本一樣（第 30 天＝10/16 還是「天氣變涼了 外套帶回去」）。
// 修改前：第 1 項 FAIL。用法：node tests/home_famgroup_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/story3d.js','src/classes3d.js']) if(fs.existsSync(path.join(ROOT,f))) load(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info&&!ok?'　'+info:'')); if(!ok) fails++; };
global.ADV={active:false,preload(){},begin(){},end(){},log(){},speaker(){},cg(){}}; global.CHAR={setExpr(){}};
global.LEGAL={ask:async()=>{},apply(){},stateOf:()=>'unseen',STATES:['unseen']};
let G=null;
const E={q:{level:'medium'},player:{busy:false,obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0},zone:{roomAt:()=>null,seats:[]},npcs:[],interactables:[],levels:null,setWeather(){},hour:0};
const GM={get G(){ return G; },E,D:{active:false},npc:{},
  sceneBegin(){},sceneEnd(){},face(){},cine(){},caption(){},sleep:()=>Promise.resolve(),memo(){},autosave(){},addNote(){},energy(){},money(){},setGoal(){},toast(){},updateHUD(){},letterbox(){},phoneBadge(){},
  titleCard:async()=>{},enter:async(z)=>{ G.zone=z; },advance(h){ G.hour+=h; },fade:()=>Promise.resolve(),rel(){},walkTo:()=>Promise.resolve(true),sitAt(){},standUp(){},say:async()=>{},choose:async()=>0};
const wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
const fresh=day=>{ G={v:3,day,hour:19.5,zone:'dorm',stage:'law',weekday:wdOf(day),weather:'clear',energy:70,money:5000,flags:{KX_FIRST_MSG:true,fundsV2:1,allowanceMonth:CALENDAR.dateOf(day).m,LAW_START_DAY:STORY.LAW_D0,MAIN_D1:STORY.MAIN_D1_NEW,introDone:true,afternoonDone:true,classDone:true,metAn:true,MET_ZHE:true},choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null,stats:{classes:0},contacts:{}};
  SOCIAL.bind(G); EVENTS.bind(GM); INV.rec(G); GM.npc={}; E.interactables=[]; E.npcs=[]; if(STORY._fy) STORY._fy.reset(); return G; };
const warns=[]; const cw=console.warn; console.warn=(...a)=>{ warns.push(a.map(String).join(' ')); };
const run=(h0,h1)=>{ for(let h=h0;h<=h1+1e-9;h+=0.25){ G.hour=+h.toFixed(3); STORY.phoneRules(GM); PHONE.tick(G); } };
const ask=day=>(G.msgs||[]).filter(m=>m.th==='g:home'&&m.from==='mom'&&m.ask&&m.ask.id==='home_ask_'+day);
const D=k=>STORY.dayOfKey(k);
{ const d=D('2025-09-04'); fresh(d); warns.length=0; run(19.5,23.75); const a=ask(d), w=warns.filter(t=>/HOME\.phoneRules/.test(t));
  check('1. 9/4（週四，第 '+d+' 天）20:00 媽媽在「家人」群組問一句，沒有 HOME.phoneRules 的警告',a.length===1&&a[0].h===20&&!!a[0].text&&w.length===0,JSON.stringify({msgs:a.map(m=>m.text),warn:w.length,first:w[0]})); }
for(const k of ['2025-09-11','2025-09-18']){ const d=D(k); fresh(d); warns.length=0; run(19.5,21); const a=ask(d), w=warns.filter(t=>/HOME\.phoneRules/.test(t));
  check('2. '+k+'（週四）也照常問、沒有警告',a.length===1&&w.length===0,JSON.stringify({msgs:a.map(m=>m.text),warn:w[0]})); }
{ const d=D('2025-10-16'); fresh(d); run(19.5,21); const a=ask(d);
  check('3. 第 1 天以後挑的句子和原本一樣（第 '+d+' 天＝10/16：「天氣變涼了 外套帶回去」）',d===30&&a.length===1&&a[0].text==='天氣變涼了 外套帶回去',JSON.stringify({d,msgs:a.map(m=>m.text)})); }
console.warn=cw;
console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
