// SIS-EXPO-PRESENCE-1027（使用者 2026-10-27 20:2x：「社團博覽會…學姊有劇情卻沒在攤位」「社團博覽會甚至顯示學姊在圖書館3樓」）——不需要瀏覽器。
// 社團博覽會的日子、時間一律讀 activities.js 的 club_expo_y1s1（ACTIVITIES.on、t0／t1；LAWWW-C 10-27：AA_485 第 3 節要改成 2025-09-06（六）10:00～16:00 一天，由另一個子代理改）——
// 舊局（沒有 LAW_START_DAY／MAIN_D1：datesOld 9/30、10/1）、新局（startLawWeek1 的兩個旗標：9/6 10:00～16:00）各跑一輪，兩種都要過：
//   1. 博覽會那幾天、開始到收攤：學姊（heroine_05）的作息是「椰林大道法服的帳篷旁」（STORY.schedEnt：campus、linger、帳篷前、面向椰林大道），時間照活動（from／to＝t0／t1）；
//      比她其他的作息都優先（原本平日白天照「總圖」）；開始前、收攤以後、別的日子、經濟系那一年都不是。
//   2. 手機的地點（STORY.whereIs）：台大校園、寫「社團博覽會法服的攤位」、到收攤的時間；不是總圖三樓。
//   3. 進校園（STORY.populate）：她的 3D 人物站在帳篷旁那一點、面向椰林大道；演 ev_sis_club_expo 以前、以後都在；收攤以後（refreshSchedule）走開。
//   4. 還沒演過博覽會那一段：找她說話＝那一段（和點「法服的攤位」一樣）；演過以後照一般說話。
//   5. 她站的那一點在遊戲真正的校園（博覽會那天有帳篷）站得住、不在帳篷裡、離攤位的互動點 2 m 以內。
// 修改前：她照平常作息在總圖（第 1、2、3 項 FAIL）。用法：node tests/sis_expo_presence_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
const warn0=console.warn; console.warn=()=>{}; process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(new Error('no fetch in node'));
const GL=/^(THREE|THREE_JSM|P3|ASSETS|W3|E3|TK|CK|Z3|B3|LINZE_LAYOUT|CLASSROOM_LAYOUT|WANCAI_LAYOUT|LIBRARY_LAYOUT|LAWLIB_LAYOUT|CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|CALENDAR|PLACES|ACTIVITIES|STORY_EVENTS|SMALLTALK|STORY|PROPS|CHAR|CROWD)$/;
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>GL.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
for(const f of ['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/dorm_room_layout.js','src/data/socsci_layout.js',
  'src/data/linze_layout.js','src/data/classroom_layout.js','src/building3d.js','src/data/wancai_layout.js','src/wancai3d.js','src/data/library_layout.js','src/library3d.js','src/data/lawlib_layout.js','src/lawlib3d.js',
  'src/data/characters.js','src/data/calendar.js','src/data/places.js','src/data/activities.js','src/data/events.js']) load(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
global.CHAR={build:spec=>{ const g=new THREE.Group(); g.userData.spec=spec; return g; },release(){},setExpr(){},animate(){}};
global.SOCIAL={displayName:id=>(CHARACTERS[id]&&CHARACTERS[id].name)||id,npcName:id=>(CHARACTERS[id]&&CHARACTERS[id].name)||id,stage:()=>'ACQ',noticed(){},reveal:()=>'ACQUAINTANCE',has:()=>true,talkedTo(){},meet(){}};
let GMref=null; const ALIAS={heroine_01:'an',heroine_05:'sis',prof_zhou:'prof'}; const ran=[];
global.EVENTS={npcOf:id=>GMref&&(GMref.npc[id]||GMref.npc[ALIAS[id]])||null,onEnter(){},tick(){},cond:()=>false,onInteract:()=>false,
  check:ev=>ev.id==='ev_sis_club_expo'&&!!GMref&&GMref.G.zone==='campus'&&!GMref.G.flags.SIS_CLUB_EXPO,   /* 只有博覽會那一段（location campus、還沒演過）*/
  run:async ev=>{ ran.push(ev.id); if(ev.id==='ev_sis_club_expo') GMref.G.flags.SIS_CLUB_EXPO=true; }};
load('src/story3d.js');
const SIS='heroine_05', TENT=[-47.5,13.5], BOOTH=[-47.5,11.5];   /* 法服的帳篷：LAWWW2 36 頂的 lawclub（中心、front；CLUBFAIR-REAL-1027 1cb7bcbb3，原本九頂那一排 (-17.8,15.1)）*/
const A0=ACTIVITIES.list.find(a=>a.id==='club_expo_y1s1'); const orig={dates:A0.dates.slice(),t0:A0.t0,t1:A0.t1};
const wdOf=d=>CALENDAR.dateOf(d).wd%7;
/* NEWG：新局（2025-08-29 搬進宿舍、9/1 開學：STORY.startLawWeek1 記 LAW_START_DAY＝LAW_D0、MAIN_D1＝MAIN_D1_NEW）＝社博 9/6；沒有這兩個旗標＝舊局（9/17 才開始）照 datesOld 9/30、10/1。
   BB-C 10-27 23:3x：原本第二輪標「9/6」，G 沒有這兩個旗標，ACTIVITIES 走 datesOld——新局 9/6 從來沒測到 */
let NEWG=false; const newFlags=()=>NEWG?{LAW_START_DAY:STORY.LAW_D0,MAIN_D1:STORY.MAIN_D1_NEW}:{};
const mkG=(day,h,o)=>Object.assign({day,hour:h,weekday:wdOf(day),flags:Object.assign({afternoonDone:true,classDone:true},newFlags()),social:{},zone:'campus',goal:'',stage:'law'},o||{});
const expoDays=()=>{ const out=[]; for(let d=-400;d<400;d++) if(ACTIVITIES.on(A0,d,{day:d,flags:newFlags(),stage:'law'})) out.push(d); return out; };
const hhmm=x=>String(Math.floor(x)).padStart(2,'0')+':'+String(Math.round((x%1)*60)).padStart(2,'0');
/* 測試用的校園（STORY.populate 需要的最少東西）：長椅的座位、互動點、加人 */
function stubGM(G){ const E={npcs:[],q:{level:'medium'},zone:{seats:[],spawn:{x:-112,z:0}},interactables:[],levels:null,nav:null,camera:null,indoor:false,
    player:{obj:{position:{x:-47.5,y:0,z:10.0},rotation:{y:0}},busy:false,lv:0},addNPC(n){ this.npcs.push(n); return n; },removeNPC(n){ this.npcs=this.npcs.filter(m=>m!==n); }};
  E.moveTo=(n,x,z,cb)=>{ n.path=[[x,z]]; n.onArrive=cb; return true; };
  const GM={G,E,npc:{},D:{active:false},hourRate:1/150};
  GM.spawnNPC=(id,spec,x,z,opts)=>{ opts=opts||{}; const o=CHAR.build(spec||{}); o.position.set(x,0,z); if(opts.yaw!=null) o.rotation.y=opts.yaw; const n=E.addNPC({obj:o,id,charId:opts.charId||id,name:(spec&&spec.name)||id,beh:opts.beh||'idle',seat:opts.seat,pose:opts.pose||'idle',lv:opts.lv|0,talk:opts.talk}); GM.npc[id]=n; return n; };
  GM.spawnCharacter=(id,x,z,opts)=>{ const c=CHARACTERS[id]; if(!c) return null; if(GM.npc[id]) return GM.npc[id]; const n=GM.spawnNPC(id,{name:c.name},x,z,Object.assign({charId:id},opts)); n.charId=id; n.talk=nn=>STORY.talkCharacter(id,nn); return n; };
  GM.removeNPC=id=>{ const n=GM.npc[id]; if(n){ E.removeNPC(n); delete GM.npc[id]; } }; GM.spawnExtra=()=>{}; GM.spawnRider=()=>{};
  GM.sitAt=(n,st)=>{ n.seat=st; n.pose='sit'; }; GM.standUp=n=>{ n.seat=null; n.pose='idle'; }; GM.seatApproach=st=>[st.x,st.z+0.6]; GM.face=()=>{}; GM.knownIds=()=>Object.keys(CHARACTERS);
  GM.sceneBegin=()=>{}; GM.sceneEnd=()=>{}; GM.say=async()=>{}; GM.cine=()=>{}; GMref=GM; STORY._bindGM&&STORY._bindGM(GM); return GM; }
const sisNPC=GM=>{ const n=EVENTS.npcOf(SIS); return n&&GM.E.npcs.includes(n)?n:null; };
async function round(tag){ const days=expoDays(), a=A0; let bad=[];
  check(tag+'0. 前提：社團博覽會有日子（照 activities.js）',days.length>0,days.map(d=>CALENDAR.dateOf(d).key).join('、')+' '+hhmm(a.t0)+'～'+hhmm(a.t1));
  // 1. 作息
  for(const d of days) for(const h of [a.t0+0.02,(a.t0+a.t1)/2,a.t1-0.05]){ const G=mkG(d,h); const e=STORY.schedEnt(CHARACTERS[SIS],G);
    const ok=!!e&&e.zone==='campus'&&e.act==='linger'&&!!e.at&&Math.hypot(e.at[0]-TENT[0],e.at[1]-TENT[1])<3.5&&Math.abs(Math.cos(e.at[2])+1)<0.05&&e.from===a.t0&&e.to===a.t1;
    if(!ok) bad.push(CALENDAR.dateOf(d).key+' '+hhmm(h)+' → '+(e?(e.zone+'/'+e.act+(e.at?'@'+e.at.slice(0,2).join(','):'')):'沒有')); }
  check(tag+'1. 博覽會那幾天、開始到收攤：學姊在椰林大道法服的帳篷旁（面向椰林大道），時間照活動',!bad.length,bad.slice(0,4).join('｜'));
  bad=[]; for(const d of days){ for(const h of [a.t0-0.1,a.t1+0.05]){ const e=STORY.schedEnt(CHARACTERS[SIS],mkG(d,h)); if(e&&e.activity==='club_expo_y1s1') bad.push(CALENDAR.dateOf(d).key+' '+hhmm(h)); }
    for(const dd of [d+7,d-7]){ const e=STORY.schedEnt(CHARACTERS[SIS],mkG(dd,(a.t0+a.t1)/2)); if(e&&e.activity==='club_expo_y1s1') bad.push(CALENDAR.dateOf(dd).key); }
    const econ=d-365; const e=STORY.schedEnt(CHARACTERS[SIS],mkG(econ,(a.t0+a.t1)/2,{stage:'econ'})); if(e&&e.activity==='club_expo_y1s1') bad.push('經濟系 '+CALENDAR.dateOf(econ).key); }
  check(tag+'1. 開始前、收攤以後、前後一週同一天、經濟系那一年同一天：不在攤位',!bad.length,bad.join('、'));
  // 2. 手機的地點
  bad=[]; for(const d of days){ const G=mkG(d,(a.t0+a.t1)/2); const GM=stubGM(G); const w=STORY.whereIs(GM,SIS); if(!w||w.zone!=='campus'||!/法服/.test(w.act||'')||w.until!==hhmm(a.t1)) bad.push(CALENDAR.dateOf(d).key+' '+JSON.stringify(w)); }
  check(tag+'2. 手機的地點：台大校園（社團博覽會法服的攤位，到收攤的時間），不是總圖三樓',!bad.length,bad.slice(0,3).join('｜'));
  // 3. 進校園：3D 人物站在帳篷旁；演以前、以後都在；收攤走開
  const d=days[0]; for(const done of [false,true]){ const G=mkG(d,(a.t0+a.t1)/2); if(done) G.flags.SIS_CLUB_EXPO=true; const GM=stubGM(G); let err=''; try{ STORY.populate('campus',GM); }catch(e){ err=e.message; }
    const n=sisNPC(GM), e=STORY.schedEnt(CHARACTERS[SIS],G); const ok=!err&&!!n&&!!e&&Math.hypot(n.obj.position.x-e.at[0],n.obj.position.z-e.at[1])<0.05&&Math.abs(n.obj.rotation.y-e.at[2])<0.05;
    check(tag+'3. 走進校園（'+CALENDAR.dateOf(d).key+' '+hhmm(G.hour)+'，'+(done?'演過博覽會那一段以後':'還沒演')+'）：學姊的 3D 人物站在帳篷旁、面向椰林大道',ok,err||(n?n.obj.position.x.toFixed(2)+','+n.obj.position.z.toFixed(2):'不在')); }
  { const G=mkG(d,a.t1-0.2); const GM=stubGM(G); STORY.populate('campus',GM); const n0=sisNPC(GM); GM.E.player.obj.position.x=n0?n0.obj.position.x+3:0; GM.E.interactables.push({x:-30,z:10,radius:1,lv:0,label:'（測試用的出口）',exit:{to:'linze'}});   /* 收攤走去最近的出口（遊戲裡是校園各棟的門）*/
    G.hour=a.t1+0.02; STORY.refreshSchedule(GM); const n=sisNPC(GM);
    check(tag+'3. 收攤（'+hhmm(a.t1)+'）：學姊離開攤位（走向出口或離開）',!!n0&&(!n||n.leaving),n?(n.leaving?'走開中':'還站著'):'已離開'); }
  // 4. 找她說話
  { const G=mkG(d,(a.t0+a.t1)/2); const GM=stubGM(G); STORY.populate('campus',GM); const n=sisNPC(GM); ran.length=0; if(n&&n.talk){ try{ await n.talk(n); }catch(e){} }
    check(tag+'4. 還沒演過：找她說話＝演 ev_sis_club_expo（和點攤位一樣）',ran[0]==='ev_sis_club_expo',ran.join(',')||'沒有演');
    ran.length=0; if(n&&n.talk){ try{ await n.talk(n); }catch(e){} } check(tag+'4. 演過以後：找她說話不再演那一段',!ran.includes('ev_sis_club_expo'),ran.join(',')); } }
(async()=>{
  await round('［舊局］');
  NEWG=true; const nd=expoDays().map(d=>CALENDAR.dateOf(d).key);
  check('［新局］0. 前提：新局的社博是 2025-09-06（六）10:00～16:00（AA_485 第 3 節；activities.js dates）',JSON.stringify(nd)==='["2025-09-06"]'&&A0.t0===10&&A0.t1===16,JSON.stringify(nd)+' '+A0.t0+'～'+A0.t1);
  await round('［新局 9/6］'); NEWG=false;
  // 5. 遊戲真正的校園（博覽會那天有帳篷）：站得住、不在帳篷裡、離攤位 2 m 以內
  { const day=expoDays()[0]; global.GAME={G:{day,hour:(A0.t0+A0.t1)/2,flags:{},stage:'law'}}; const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'}; E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null;
    const z=Z3.ZONES.campus.build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(E.levels) for(const n of E.levels) n._cm=null; else z.nav._cm=null;
    const e=STORY.schedEnt(CHARACTERS[SIS],mkG(day,(A0.t0+A0.t1)/2)); const at=e&&e.at; const inTent=at&&Math.abs(at[0]-TENT[0])<1.5&&Math.abs(at[1]-TENT[1])<1.5;
    check('5. 她站的那一點（博覽會那天的校園）：站得住、不在帳篷裡、離「法服的攤位」2 m 以內',!!at&&E.canStand(at[0],at[1],0.3,0)&&!inTent&&Math.hypot(at[0]-BOOTH[0],at[1]-BOOTH[1])<2.0,at?at.slice(0,2).join(','):'沒有'); }
  console.warn=warn0; console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0); })();
