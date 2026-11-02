// CC 11-02：大四下 15 週、CLS.EXAM_WEEKS.final=[16] → 考五題的課（maritime；ba7983b6f 起加 civpro_2_re、insurance_re）沒有期末考日，failedIn 照樣算不及格。用法：LW=<工作樹> node cc_y4s2final_unit.js
// 用法：LW=<工作樹> node cc_gowindow_unit.js
const fs=require("fs"), vm=require("vm"), path=require("path"); const ROOT=process.env.LW;
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/story3d.js','src/classes3d.js']) if(fs.existsSync(path.join(ROOT,f))) load(f);
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
const fresh=(day,hour,zone,flags)=>{ G={v:3,day,hour,zone,weekday:wdOf(day),weather:'clear',energy:70,money:5000,flags:Object.assign({KX_FIRST_MSG:true,fundsV2:1,allowanceMonth:CALENDAR.dateOf(day).m},FL,flags||{}),choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null,stats:{classes:0},courses:{},invites:[],visited:{}};
  SOCIAL.bind(G); EVENTS.bind(GM); INV.rec(G); said=[]; menus=[]; picks=[]; caps=[]; enters=[]; seatCalls=[]; GM.npc={}; E.interactables=[]; E.npcs=[]; E.player.obj.position.x=0; E.player.obj.position.z=0; if(CLS.clearPending) CLS.clearPending(); };
const hm=h=>CLS.hhmm(h);
const flush=async()=>{ for(let i=0;i<20;i++) await new Promise(r=>setImmediate(r)); };
/* S.oneTick 要連續空下來 1.5 秒、至少 3 次 tick 才出待出的選單：把時鐘往前撥 */
const realNow=Date.now; let fake=realNow();
const tickUntilMenu=async(n)=>{ Date.now=()=>(fake+=600); try{ for(let i=0;i<(n||12);i++){ CLS.oneTick(GM); await flush(); if(menus.length) break; } } finally { Date.now=realNow; } await flush(); };
const THU=STORY.termDay('Y1S1',4,4);
for(const f of ['src/data/exam_bank.js']) if(fs.existsSync(path.join(ROOT,f))) load(f);
const L=(typeof COURSES!=='undefined'&&(COURSES.list||COURSES.courses))||[]; const arr=Array.isArray(L)?L:Object.values(L);
const out={};
for(const c of arr){ if(!c||c.term!=='Y4S2') continue;
  let ex=null,pool=null,day=null; try{ ex=CLS.isExamCourse?CLS.isExamCourse(c):'n/a'; const p=CLS.examPool(c.id,'Y4S2','final'); pool=p.cls.length+p.bank.length+p.ai.length; day=CLS.examDay({courses:{}},c,'Y4S2','final'); }catch(e){ ex='ERR '+e.message; }
  out[c.id]={exam:ex,pool,finalDay:day}; }
console.log(Object.keys(COURSES).join(','), arr.length); console.log(JSON.stringify(out));
const D=STORY.termDay('Y4S2',15,5); fresh(D,12,'dorm');
console.log('termCourses', CLS.termCourses(G,'Y4S2').map(c=>c.id).join(','));
console.log('failedIn(空存檔、大四下)', CLS.failedIn(G,'Y4S2').map(c=>c.id).join(',')||'（無）');
