// 社科院 辜振甫先生紀念圖書館的開放時間在遊戲裡真的有作用（D62，使用者 2026-10-14 查證館方網頁）——不需要瀏覽器。
// 檢查：沒開的時候在校園按「進入社科院圖書館」被擋下、寫下次幾點開（學期間週日 17:00 以後、寒假週日整天）；有開的時候不擋；
//       館裡：閉館前 10 分鐘廣播一次（不重複）；過了閉館時間館員請你離館、回到社科院正門前（SL3.CAMPUS），並說明下次開館。
// 修改前（沒有開放時間、門不擋）這個測試會失敗。時間本身的對錯在 tests/calendar_hours_unit.js。
// 用法：node tests/soclib_hours_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}}; global.THREE={Vector3:function(){}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/events.js','src/social3d.js','src/events3d.js','src/story3d.js']) load(f);
global.SL3={DOOR:{x:97.9,z:-70,r:1.6},CAMPUS:{x:95.6,z:-70,yaw:-Math.PI/2}};   /* src/soclib3d.js 的 DOOR、CAMPUS（這個測試不載入 3D）*/
global.ADV={active:false,preload(){},begin(){},end(){},log(){},speaker(){}}; global.CHAR={setExpr(){}};
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const DAY=86400000, dayOf=s=>{ const [y,m,d]=s.split('-').map(Number); return Math.round((Date.UTC(y,m-1,d)-Date.UTC(2025,8,17))/DAY)+1; };
let toasts=[], said=[], entered=[];
let G=null;
const P={busy:false,obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0};
const GM={get G(){ return G; },E:{q:{level:'medium'},player:P,zone:{roomAt:()=>null,seats:[]},npcs:[],extras:[],interactables:[],levels:null},D:{active:false},npc:{},
  sceneBegin(){},sceneEnd(){},face(){},cine(){},caption(){},sleep:()=>Promise.resolve(),memo(){},autosave(){},energy(){},money(){},setGoal(g){ G.goal=g; },toast(t){ toasts.push(t); },updateHUD(){},letterbox(){},
  say:async(who,t)=>{ said.push(t); },choose:async()=>0,enter:async(z,sp)=>{ entered.push({z,sp}); G.zone=z; }};
const at=(zone,dateKey,hour)=>{ const day=dayOf(dateKey); G={day,hour,zone,weekday:CALENDAR.dateOf(day).wd%7,flags:{introDone:true,classDone:true,afternoonDone:true,metAn:true},choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null,goal:''};
  SOCIAL.bind(G); EVENTS.bind(GM); toasts=[]; said=[]; entered=[]; };
const door={exit:{to:'soclib',spawn:{x:-9,z:9.3}},label:'進入社科院圖書館'};
const flush=()=>new Promise(r=>setTimeout(r,20));
(async()=>{
  // ---------- 校園的門 ----------
  { at('campus','2025-10-12',18); const r=await STORY.interact(door,GM);
    check('學期間週日 18:00（週日 09:00–17:00）：按「進入社科院圖書館」被擋下、寫下次是明天 08:20、沒有進去',r===true&&/社科院圖書館 現在沒有開/.test(toasts[0]||'')&&/明天 08:20/.test(toasts[0]||'')&&!entered.length,toasts[0]); }
  { at('campus','2026-01-18',12); const r=await STORY.interact(door,GM);
    check('寒假週日中午（寒暑假週日不開）：被擋下、寫「寒暑假的週日」',r===true&&/寒暑假的週日/.test(toasts[0]||''),toasts[0]); }
  { at('campus','2025-10-07',7.5); const r=await STORY.interact(door,GM);
    check('學期間平日 07:30（08:20 開）：被擋下、寫今天 08:20',r===true&&/今天 08:20/.test(toasts[0]||''),toasts[0]); }
  for(const [k,h,why] of [['2025-10-07',10,'學期間平日 10:00'],['2025-10-11',21.5,'學期間週六 21:30（週六開到 22:00）'],['2026-01-17',10,'寒假週六 10:00']]){ at('campus',k,h); const r=await STORY.interact(door,GM);
    check(why+'：有開，門不擋（交給一般的換區域）',!r&&!toasts.length,String(r)+' '+toasts.join('|')); }
  // ---------- 館裡：閉館前廣播、閉館請離館 ----------
  { at('soclib','2025-10-07',21+52/60); STORY.tick(GM,0.016); STORY.tick(GM,0.016);
    check('平日 21:52 在館裡：廣播「本館將於 22:00 閉館」一次（第二次 tick 不重複）',toasts.filter(t=>/本館將於 22:00 閉館/.test(t)).length===1&&!entered.length,toasts.join('|')); }
  { at('soclib','2025-10-12',16+55/60); STORY.tick(GM,0.016);
    check('學期間週日 16:55：廣播的是 17:00（週日的時間，不是週六的 22:00）',toasts.some(t=>/本館將於 17:00 閉館/.test(t)),toasts.join('|')); }
  { at('soclib','2025-10-07',22+1/60); STORY.tick(GM,0.016); await flush(); await flush();
    const e=entered[0]||{};
    check('平日 22:01 還在館裡：館員請你離館、回到社科院正門前（SL3.CAMPUS）、說明下次開館',said.some(t=>/我們閉館了/.test(t))&&e.z==='campus'&&e.sp&&e.sp.x===95.6&&e.sp.z===-70&&toasts.some(t=>/社科院圖書館 現在沒有開/.test(t)&&/明天 08:20/.test(t)),JSON.stringify({said,entered,toasts})); }
  { at('soclib','2025-10-07',15); STORY.tick(GM,0.016); await flush();
    check('平日 15:00 在館裡：不廣播、不請你離館',!toasts.length&&!said.length&&!entered.length,JSON.stringify({toasts,said,entered})); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });
