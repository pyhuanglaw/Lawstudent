// STUDY_SE06 第二輪（BB_255 11-13 15:5x）：考試那天一鍵去考場，出門時間比考前 10 分鐘還晚＝skipTo 停在考前 10 分鐘，之後每按一次都被「考試前 10 分鐘不能跳」擋掉、永遠出不了門。不需要瀏覽器。
// 修改前（a9b63d9eff）：第二次按還在宿舍＝FAIL。用法：node tests/goclass_exam_wait_unit.js（樣板：tests/goclass_window_unit.js）
const fs=require("fs"), vm=require("vm"), path=require("path"); const ROOT=process.env.LW||path.resolve(__dirname,"..");
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/social3d.js','src/events3d.js','src/data/l118_redo772.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/story3d.js','src/classes3d.js']) if(fs.existsSync(path.join(ROOT,f))) load(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
global.ADV={active:false,preload(){},begin(){},end(){},log(){},speaker(){},cg(){}}; global.CHAR={setExpr(){}};
global.LEGAL={ask:async()=>{},apply(){},stateOf:()=>'unseen',STATES:['unseen']};
let said=[], menus=[], picks=[], caps=[], enters=[], seatCalls=[], G=null;
const E={q:{level:'medium'},player:{busy:false,riding:false,obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0},zone:{roomAt:()=>null,seats:[]},npcs:[],interactables:[],levels:null,setWeather(){},hour:0,paused:false};
/* 進區域：記下區域和落點；進 201 時放 3 排 × 4 的座位（同 dl01_oneclick_unit）*/
const seats=()=>{ const its=[]; for(let r=0;r<3;r++) for(let c=0;c<4;c++){ const seat={x:c*0.8,z:r*1.2,yaw:Math.PI,lv:0,row:r+1,col:c+1}; its.push({x:seat.x,z:seat.z,seat}); } return its; };
const GM={get G(){ return G; },E,D:{active:false},npc:{},S:{},
  sceneBegin(){},sceneEnd(){},face(){},cine(){},caption:(w,t)=>caps.push(t),sleep:()=>Promise.resolve(),memo(){},autosave(){},addNote(){},energy(){},money(){},setGoal(){},toast(){},updateHUD(){},letterbox(){},phoneBadge(){},
  titleCard:async()=>{},advance(h){ G.hour+=h; },fade:()=>Promise.resolve(),rel(){},walkTo:()=>Promise.resolve(true),sitAt(){},standUp(){},
  enter:async(z,sp)=>{ enters.push({z,sp:sp||null}); G.zone=z; E.npcs=[]; E.interactables=z==='classroom'?seats():[]; const p=E.player.obj.position; if(sp){ p.x=sp.x; p.z=sp.z; } else { p.x=0; p.z=0; } },
  seatMenu:async(it,so)=>{ seatCalls.push({seat:it.seat,so}); },
  say:async(who,t)=>{ said.push({who:who?(who.name||String(who)):null,t}); },
  choose:async o=>{ menus.push(o.map(q=>(q.t||q.text)+(q.hint?'〔'+q.hint+'〕':''))); const want=picks.shift(); if(typeof want==='string'){ const k=o.findIndex(q=>(q.t||q.text).includes(want)); return k<0?0:k; } return want||0; }};
const wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
const FL={introDone:true,classDone:true,afternoonDone:true,campusIntro:true};
const fresh=(day,hour,zone,flags)=>{ G={v:3,day,hour,zone,weekday:wdOf(day),weather:'clear',energy:70,money:5000,flags:Object.assign({KX_FIRST_MSG:true,YT_MET_JOB:true,fundsV2:1,allowanceMonth:CALENDAR.dateOf(day).m},FL,flags||{}),choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null,stats:{classes:0},courses:{},invites:[],visited:{}};
  SOCIAL.bind(G); EVENTS.bind(GM); INV.rec(G); said=[]; menus=[]; picks=[]; caps=[]; enters=[]; seatCalls=[]; GM.npc={}; E.interactables=[]; E.npcs=[]; E.player.obj.position.x=0; E.player.obj.position.z=0; if(CLS.clearPending) CLS.clearPending(); };
const hm=h=>CLS.hhmm(h);
const flush=async()=>{ for(let i=0;i<20;i++) await new Promise(r=>setImmediate(r)); };
/* S.oneTick 要連續空下來 1.5 秒、至少 3 次 tick 才出待出的選單：把時鐘往前撥 */
const realNow=Date.now; let fake=realNow();
const tickUntilMenu=async(n)=>{ Date.now=()=>(fake+=600); try{ for(let i=0;i<(n||12);i++){ CLS.oneTick(GM); await flush(); if(menus.length) break; } } finally { Date.now=realNow; } await flush(); };
const THU=STORY.termDay('Y1S1',4,4);
let toasts=[]; GM.toast=(t)=>toasts.push(t);
(async()=>{
  /* 測試環境沒有選課＝沒有考試：拿一堂平常的課做成「考試」，放進 CLS.dayItems（skipStops、skipTo 的考試規則都照 dayItems 找）*/
  const civAt=()=>CLS.dayItems(G).find(q=>q.c.id==='civ_general'&&!q.exam);
  fresh(THU,7,'dorm'); const base=civAt(); const pl=CLS.goPlan(GM,base);
  const t0=pl.depart+30/60; const ex=Object.assign({},base,{exam:true,key:base.key+'_examtest',t0,t1:t0+2});   /* 出門時間落在考前 10 分鐘以後（同 SE06：考試 08:00、07:55 出門）*/
  const di=CLS.dayItems; CLS.dayItems=function(G){ const L=di.apply(this,arguments).filter(q=>q.key!==base.key); if(G&&G.day===THU) L.push(ex); return L; };
  const gp=CLS.goPlan; CLS.goPlan=function(GM,it){ const p=gp.apply(this,arguments); return it===ex&&p?Object.assign({},p,{depart:ex.t0-5/60}):p; };   /* 考場就在附近（同一棟、隔壁）：走幾分鐘就到＝出門時間在考前 10 分鐘以後 */
  if(CLS.examName) { const en=CLS.examName; CLS.examName=it=>it===ex?'民法總則期末考':en(it); }
  console.log('INFO 出門 '+hm(t0-5/60)+'、考試 '+hm(t0)+'、考前 10 分鐘 '+hm(t0-1/6));
  fresh(THU,t0-1/6-3/60,'dorm');   /* 考前 13 分鐘＝出門前 8 分鐘 */
  let r=await CLS.goClass(GM,ex,{autoSeat:true}); await flush();
  const first={ret:r,now:hm(G.hour),zone:G.zone,toasts:toasts.slice()};
  if(G.zone==='dorm'){ toasts=[]; r=await CLS.goClass(GM,ex,{autoSeat:true}); await flush(); }
  check('考試那天一鍵去考場：最多按兩次就出門（不卡在宿舍）', G.zone!=='dorm', JSON.stringify({first,second:{ret:r,now:hm(G.hour),zone:G.zone,toasts}}));
  fresh(THU,t0-40/60,'dorm'); toasts=[];   /* 很早按：先跳過時間（停在考前 10 分鐘的停點） */
  r=await CLS.goClass(GM,ex,{autoSeat:true}); await flush();
  check('很早按（考前 40 分鐘）：先跳過時間（停在考前 10 分鐘），接著直接出門，一次就到考場', G.zone==='classroom'&&(G.hour%24)>=t0-1/6-0.01, hm(G.hour)+' '+G.zone+' '+JSON.stringify(toasts));
  CLS.dayItems=di; CLS.goPlan=gp;
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
