// BBALL-RAIN-1030（AA 劇情總監 2026-10-30 05:40 定案；回使用者 X142「系籃練球時間到 根本球場空的」的後續）——不需要瀏覽器。
// 系籃練球（activities.js 的 dept_basketball：大一上週五 17:30～19:00，籃球場在醉月湖東側）下雨的週五改到新體育館一樓走廊。AA 原話：
//   改到體育館，照 activities 那句旁白；下雨的週五室外球場空的，路人也不打球；集合點的提示換成（系統字）「下雨，系籃今天在新體育館走廊練體能。」；
//   阿哲、明軒 17:30～19:00 移到新體育館一樓走廊（gym 區域），場邊路人不用；玩家走過去，沿用走廊練球的旁白（narr 第 4 句）；雨停不算：照那天 17:30 的天氣一次定整場。
// 在 Node 建出遊戲真正的校園、體育館（zones3d.js、gym3d.js），照 GAME.enter 進區域（CROWD.enter、CLS.addActSpots），用引擎真正的導航檢查：
//   1. 下雨的週五 17:45：球場沒有人流；球場的集合點只剩提示（那句系統字、按了不能參加）；體育館一樓走廊有參加點（站得住、從大廳門口走得到、站在那裡最近的互動點就是它）；
//      體育館沒有練球的路人（場邊路人不用）。颱風（typhoon）也算下雨。
//   2. 晴天的週五：全部照舊（球場有人、集合點照舊參加、體育館的參加點藏著、不是遠遠的名牌）。
//   3. 一次定整場：17:30 判斷是晴、之後下雨＝整場照晴；17:30 判斷是雨、之後放晴＝整場照雨；不用 tick、第一次問（17:30 以後）就記；17:30 以前照現在的天氣、不記。
//   4. 舊存檔：沒有 G.acts、G.acts 沒有 wx、wx 是上一週的紀錄，都不出錯（照當下天氣記）。非練球日、國定假日下雨：體育館沒有參加點、球場的提示照舊。
//   5. 手機「活動」今天那一場寫新體育館一樓走廊（ACTIVITIES.placeOf）；課表的 tick 17:30 一到就定（玩家不在那兩區也照 17:30 的天氣）。
//   6. 阿哲、明軒下雨那一筆：站在體育館一樓走廊（站得住、離大廳走路的人 0.8 m 以上），阿哲面向參加點、明軒面向東邊（沿著走廊）。
//   7. （另一個 node 行程：真的 story3d.js）作息：下雨的練球日阿哲、明軒在 gym（每一個練球日的開頭、中間、結尾）；晴天照舊在球場那一筆；一次定整場；
//      週四、國定假日、第 4 週、大一下、時段外下雨不在體育館。參加：體育館「去練球」→ 旁白固定是走廊那一句、不佔晴天輪的那一格；17:30 以前參加＝參加的那一刻定。
// 修改前（850bd28d8）：FAIL 40 項（沒有下雨的備案：球場照樣有人、提示照舊、體育館沒有參加點、阿哲明軒在球場、旁白照順序）。用法：node tests/bball_rain_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const ROOT=path.resolve(__dirname,'..');
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const tryv=(f,d)=>{ try{ return f(); }catch(e){ return d; } };
const DAY=86400000, dayOf=s=>{ const [y,m,d]=s.split('-').map(Number); return Math.round((Date.UTC(y,m-1,d)-Date.UTC(2025,8,17))/DAY)+1; };
const FRI='2025-10-17', FRI2='2025-11-07', THU='2025-10-16', HOL='2025-10-10', W4='2025-09-26', Y1S2FRI='2026-03-06';
const HINT='下雨，系籃今天在新體育館走廊練體能。';

if(process.argv[2]==='--sched'){
  // ---------- 7. 作息、參加（真的 story3d.js）----------
  global.window=global; global.self=global; global.P3={CAST:{}}; global.THREE={Vector3:function(){}};
  global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''}; console.warn=()=>{};
  const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|COURSES|CLS|ACTIVITIES|CLUB_FAIR|CLUBFAIR)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
  for(const f of ['src/data/characters.js','src/data/calendar.js','src/data/places.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/social3d.js','src/events3d.js','src/story3d.js','src/classes3d.js','src/data/club_fair.js','src/clubfair3d.js']) load(f);
  let G; const log=[], chose=[], caps=[]; let answers=[];
  const GM={get G(){ return G; },E:{zone:null,interactables:[],npcs:[],player:{busy:false,obj:{position:{x:0,z:0}}}},D:{active:false},S:{},npc:{},
    sceneBegin(){},sceneEnd(){},say:async(n,t)=>{ log.push(t); },toast(){},caption:(a,t)=>{ caps.push(t); },autosave(){},setGoal(){},
    choose:async o=>{ chose.push(o.map(q=>q.t)); return answers.length?answers.shift():0; },fade:async()=>{},sleep:async()=>{},advance(h){ G.hour+=h; },energy(){},money(){}};
  const mkG=(key,h,wx)=>{ const d=dayOf(key); G={day:d,hour:h,weekday:CALENDAR.dateOf(d).wd%7,stage:'law',zone:'campus',weather:wx||'clear',flags:{introDone:true,afternoonDone:true,classDone:true,MET_ZHE:true},choices:{},events:{done:{},last:{},count:0},social:null,rel:{},energy:80,goal:'',goalDest:null}; SOCIAL.bind(G); EVENTS.bind(GM); return G; };
  const A=ACTIVITIES.list.find(a=>a.id==='dept_basketball'), ids=['zhe','classmate_mingxuan'];
  const SUN=id=>(CHARACTERS[id].daily_schedule||[]).find(e=>e.activity==='dept_basketball'), RAIN=id=>(CHARACTERS[id].daily_schedule||[]).find(e=>e.rainOf==='dept_basketball');
  const gymRow=e=>!!e&&e.zone==='gym'&&e.act==='linger'&&Array.isArray(e.at);
  check('7. 阿哲、明軒有下雨那一筆（gym、linger、noPair、大一上），放在晴天那一筆前面；晴天那一筆照舊是 activity:dept_basketball 的第一筆（在球場）',ids.every(id=>{ const L=CHARACTERS[id].daily_schedule, r=RAIN(id), s=SUN(id); return gymRow(r)&&r.noPair===true&&JSON.stringify(r.terms)==='["Y1S1"]'&&!!s&&s.zone==='campus'&&L.indexOf(r)>=0&&L.indexOf(r)<L.indexOf(s); }),ids.map(id=>JSON.stringify(RAIN(id)&&RAIN(id).at)).join(' '));
  const at=(id,key,h,wx)=>STORY.schedEnt(CHARACTERS[id],mkG(key,h,wx));
  const bad=[], days=[];
  for(let d=dayOf('2025-09-01');d<=dayOf('2026-01-20');d++){ if(!ACTIVITIES.on(A,d,{flags:{}})) continue; const key=CALENDAR.dateOf(d).key; days.push(key);
    for(const h of [17.55,18.2,18.95]) for(const id of ids){ const er=at(id,key,h,'rain'), es=at(id,key,h,'clear'); if(!RAIN(id)||er!==RAIN(id)) bad.push(id+' '+key+' '+h+' 下雨 → '+(er?er.act+'@'+(er.zone||er.away):'null')); if(es!==SUN(id)) bad.push(id+' '+key+' '+h+' 晴天 → '+(es?es.act+'@'+(es.zone||es.away):'null')); } }
  check('7. 大一上每一個練球日 17:33、18:12、18:57：下雨＝體育館那一筆、晴天＝球場那一筆（照舊）（'+days.length+' 天）',days.length>=7&&!bad.length,bad.slice(0,4).join('｜')||days.join(','));
  { mkG(FRI,17.5,'clear'); STORY.schedEnt(CHARACTERS.zhe,G); G.weather='rain'; G.hour=18.2; const e1=STORY.schedEnt(CHARACTERS.zhe,G), e1m=STORY.schedEnt(CHARACTERS.classmate_mingxuan,G);
    mkG(FRI,17.5,'rain'); STORY.schedEnt(CHARACTERS.zhe,G); G.weather='clear'; G.hour=18.2; const e2=STORY.schedEnt(CHARACTERS.zhe,G), e2m=STORY.schedEnt(CHARACTERS.classmate_mingxuan,G);
    check('7. 一次定整場：17:30 是晴、18:12 下雨＝還在球場；17:30 下雨、18:12 放晴＝還在體育館',e1===SUN('zhe')&&e1m===SUN('classmate_mingxuan')&&!!RAIN('zhe')&&e2===RAIN('zhe')&&e2m===RAIN('classmate_mingxuan'),[e1,e2].map(e=>e&&e.zone).join(' / ')); }
  const off=[[THU,17.75,'週四'],[HOL,17.75,'國慶日（10/10）'],[W4,17.75,'第 4 週'],[Y1S2FRI,17.75,'大一下的週五'],[FRI,17.4,'17:24'],[FRI,19.05,'19:03']].map(([k,h,why])=>{ const b=ids.filter(id=>gymRow(at(id,k,h,'rain'))); return b.length?why+' '+b.join(','):null; }).filter(Boolean);
  check('7. 週四、國定假日、第 4 週、大一下、17:30 以前、19:00 以後下雨：阿哲、明軒不在體育館那一筆',!off.length,off.join('｜'));
  { const e=at('zhe',THU,18,'rain'); check('7. 下雨的週四阿哲照舊在麵店',!!e&&e.zone==='noodle',e&&e.zone); }
  /* 參加 */
  (async()=>{
    const narrK=()=>((G.acts&&G.acts.narr)||{})['dept_basketball@Y1S1']|0;
    mkG(FRI,17.75,'rain'); G.zone='gym'; G.flags.CLUB_dept_basketball=true; answers=[0]; log.length=0; chose.length=0; caps.length=0;
    await tryv(()=>CLS.spotInteract(GM,A),Promise.resolve());
    check('7. 下雨的週五 17:45 在體育館一樓走廊按參加點：「去練球：系籃練球」→ 旁白是走廊那一句（narr 第 4 句）→ 19:00 → 社課結束了',(chose[0]||[])[0]==='去練球：系籃練球'&&log.includes(A.narr[3])&&!log.includes(A.narr[0])&&Math.abs(G.hour-19)<0.01&&caps[caps.length-1]==='社課結束了。',JSON.stringify([chose,log,caps]));
    check('7. 下雨場的旁白不佔晴天照順序輪的那一格（G.acts.narr 還是 0）',narrK()===0,String(narrK()));
    const acts=G.acts; mkG(FRI2,17.75,'clear'); G.acts=acts; G.zone='campus'; G.flags.CLUB_dept_basketball=true; answers=[0]; log.length=0; chose.length=0;
    await CLS.spotInteract(GM,A);
    check('7. 下一個晴天的週五在球場參加：旁白照舊從第 1 句開始（晴天的順序不變）',(chose[0]||[])[0]==='去練球：系籃練球'&&log.includes(A.narr[0])&&narrK()===1,JSON.stringify(log));
    mkG(FRI,17.3,'rain'); G.zone='campus'; G.flags.CLUB_dept_basketball=true; answers=[0]; log.length=0; chose.length=0; caps.length=0;
    await CLS.spotInteract(GM,A);
    check('7. 17:18 下雨、在球場按集合點：寫那句系統字，不能參加（17:30 以前照現在的天氣）',caps[0]===HINT&&chose.length===0&&!(G.acts&&G.acts.att&&Object.keys(G.acts.att).length),JSON.stringify([caps,chose]));
    G.zone='gym'; answers=[0]; log.length=0; chose.length=0;
    await CLS.spotInteract(GM,A); const wx=G.acts&&G.acts.wx&&G.acts.wx.dept_basketball;
    check('7. 17:18 在體育館參加（開始前 15 分鐘起）：參加的那一刻定成下雨場（G.acts.wx 記今天、rain）、旁白是走廊那一句',(chose[0]||[])[0]==='去練球：系籃練球'&&!!wx&&wx.day===G.day&&wx.rain===true&&log.includes(A.narr[3]),JSON.stringify([wx,log]));
    G.weather='clear'; check('7. 參加以後放晴：這一場照舊是下雨場',ACTIVITIES.rainy&&ACTIVITIES.rainy(A,G)===true);
    mkG(FRI,17.75,'clear'); G.zone='campus'; G.flags.CLUB_dept_basketball=true; answers=[0]; log.length=0; chose.length=0;
    await CLS.spotInteract(GM,A);
    check('7. 晴天的週五在球場參加：照舊（「去練球」、旁白第 1 句）',(chose[0]||[])[0]==='去練球：系籃練球'&&log.includes(A.narr[0])&&!log.includes(A.narr[3]),JSON.stringify(log));
    process.exit(fails?1:0); })().catch(e=>{ console.log('FAIL 7. 參加的流程出錯　'+String(e&&e.stack||e).split('\n').slice(0,2).join(' ')); process.exit(1); });
  return;
}

// ---------- 1～6：校園、體育館、人流、集合點 ----------
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
console.warn=()=>{}; process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(new Error('no fetch in node'));
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/dorm_room_layout.js','src/data/socsci_layout.js',
  'src/data/linze_layout.js','src/data/classroom_layout.js','src/building3d.js','src/data/wancai_layout.js','src/wancai3d.js','src/data/library_layout.js','src/library3d.js','src/data/lawlib_layout.js','src/lawlib3d.js','src/data/gongtong_layout.js','src/data/boya_layout.js','src/data/putong_layout.js','src/teach3d.js',
  'src/data/gym_layout.js','src/gym3d.js','src/data/characters.js','src/data/calendar.js','src/data/places.js','src/data/courses.js','src/data/activities.js','src/data/syllabus.js','src/classes3d.js','src/crowd3d.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(THREE|THREE_JSM|P3|ASSETS|W3|E3|TK|CK|Z3|B3|WC3|LB3|LL3|TB3|GY3|[A-Z_]*LAYOUTS?|ACTIVITIES|CALENDAR|PLACES|CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|COURSES|SYLLABUS|CLS|CROWD|PROPS|CHAR)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); }
global.CHAR={build:spec=>{ const g=new THREE.Group(); g.userData.spec=spec; return g; },release(){}};
global.STORY={extraSpec:i=>({id:'x'+i,sex:i%2===0?'f':'m'}),profSpec:c=>({id:c.id,name:c.name,sex:c.gender==='f'?'f':'m'}),CROWD_X:2};
global.GAME={G:null};
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'}; E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null;
E.addNPC=n=>{ n.path=null; n.speed=0; n.pose=n.pose||'idle'; n.radius=0.32; n.lv=n.lv|0; if(n.seat&&n.seat.y!=null) n.obj.position.y=n.seat.y; E.npcs.push(n); return n; }; E.removeNPC=n=>{ E.npcs=E.npcs.filter(m=>m!==n); };
const campusZ=Z3.ZONES.campus.build(E);
const A=ACTIVITIES.list.find(a=>a.id==='dept_basketball'), R=A&&A.rain, RS=R&&R.spot;
const said=[], caps=[], chose=[]; let answers=[];
const mkGM=G=>({G,E,hourRate:1/150,enterN:1,sceneBegin(){},sceneEnd(){},say:async(w,t)=>{ said.push([w&&w.name,t]); },caption:(w,t)=>{ caps.push(t); },choose:async o=>{ chose.push(o.map(q=>q.t)); return answers.length?answers.shift():1; },toast(){},face(){},sitAt:(n,st)=>{ n.seat=st; n.pose='sit'; n.frozen=true; }});
const mkG=(key,h,wx)=>{ const d=dayOf(key); return {day:d,hour:h,flags:{},weekday:CALENDAR.dateOf(d).wd%7,stage:'law',zone:'campus',weather:wx||'clear'}; };
function enter(zoneId,G,px,pz){ E.npcs=[]; E.camera=null; E.spawnHint=null; GAME.G=G; G.zone=zoneId; let z;
  if(zoneId==='campus'){ z=campusZ; E.interactables=[]; } else { E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; z=Z3.ZONES[zoneId].build(E); }
  E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(E.levels) for(const n of E.levels) n._cm=null; else if(z.nav) z.nav._cm=null;
  const sp=zoneId==='campus'?{x:3.3,z:-108}:z.spawn; E.player={obj:{position:new THREE.Vector3(px==null?sp.x:px,0,pz==null?sp.z:pz),rotation:{y:0}},radius:0.32,lv:0,seat:null,busy:false};
  const GM=mkGM(G); CROWD.enter(GM,zoneId); CLS.addActSpots(GM,zoneId); if(CLS.addActHints) CLS.addActHints(GM,zoneId); return GM; }
const court=()=>E.npcs.filter(n=>n.crowd==='bball_practice'||n.crowdSpot==='bball_practice');
const actIt=()=>E.interactables.filter(i=>i.actSpot==='dept_basketball'), hintIt=()=>E.interactables.filter(i=>i.actHint==='dept_basketball');
const courtSpot=()=>actIt().find(i=>!i.rainSpot), gymSpot=()=>actIt().find(i=>i.rainSpot);
const rainy=G=>!!(ACTIVITIES.rainy&&tryv(()=>ACTIVITIES.rainy(A,G),false));
const near=(x,z)=>{ E.player.obj.position.set(x,0,z); return E.nearestInteractable(); };
check('0. activities.js 的系籃練球有下雨的備案（rain：gym、新體育館一樓走廊、集合點、AA 那句提示、旁白第 4 句）',!!R&&R.zone==='gym'&&R.roomName==='新體育館一樓走廊'&&!!RS&&R.hint===HINT&&R.narr===3&&A.narr[3]==='（今天在體育館走廊練運球。球聲在走廊裡很大聲。）',JSON.stringify(R));
// ---------- 1. 下雨的週五 17:45 ----------
(async()=>{
{ const G=mkG(FRI,17.75,'rain'), GM=enter('campus',G); const n=court().length, s=courtSpot();
  check('1. 下雨的週五（10/17 17:45）：球場沒有人流（路人也不打球）',n===0,n+' 人');
  check('1. 球場的集合點只剩提示：名牌照舊「系籃練球」（遠遠看得到）、看的字是 AA 那句系統字',!!s&&s.label==='系籃練球'&&s.mark===true&&!s.hidden&&s.look===HINT&&hintIt().length===0,s&&JSON.stringify({label:s.label,look:s.look}));
  caps.length=0; chose.length=0; if(s) await tryv(()=>s.onInteract(s),Promise.resolve());
  check('1. 按了：字幕是「'+HINT+'」，不能參加（沒有「去練球」的選項、沒有出席紀錄）',caps[0]===HINT&&chose.length===0&&!(G.acts&&G.acts.att&&Object.keys(G.acts.att).length),JSON.stringify([caps,chose]));
  const r=G.acts&&G.acts.wx&&G.acts.wx.dept_basketball; check('1. 第一次問（17:30 以後）就記下這一場是下雨場（G.acts.wx：今天、rain）',!!r&&r.day===G.day&&r.rain===true,JSON.stringify(r)); }
{ const G=mkG(FRI,17.75,'rain'), GM=enter('gym',G); const g=gymSpot();
  check('1. 體育館（gym）一樓走廊有參加點：名牌「系籃練球」、看得到（不藏、mark）、在 rain.spot',!!g&&!g.hidden&&g.mark===true&&g.label==='系籃練球'&&!!RS&&Math.hypot(g.x-RS.x,g.z-RS.z)<0.01&&(g.lv|0)===0,g&&JSON.stringify({x:g.x,z:g.z,hidden:g.hidden,mark:g.mark}));
  const ok=!!RS&&E.canStand(RS.x,RS.z,0.32,0), w=RS?E.simWalk(E.zone.spawn.x,E.zone.spawn.z,RS.x,RS.z,{dt:1/30,speed:1.4}):{ok:false};
  check('1. 參加點站得住、從大廳門口（出生點）走得到（移動模擬）、在大廳（靠球場那一面）',ok&&w.ok&&!!RS&&RS.z>11.2&&RS.z<15&&Math.abs(RS.x)<16,JSON.stringify(w).slice(0,80));
  const it=RS?near(RS.x,RS.z):null; check('1. 站在參加點上，最近的互動點就是它（不被公告欄、長椅蓋掉）',!!it&&it===g,it&&it.label);
  caps.length=0; chose.length=0; answers=[1]; if(g) await tryv(()=>g.onInteract(g),Promise.resolve());
  check('1. 17:45 在體育館按參加點：出「去練球：系籃練球」（照同一套參加流程）',(chose[0]||[])[0]==='去練球：系籃練球',JSON.stringify([chose,caps]));
  const bp=E.npcs.filter(n=>/bball/.test(String(n.crowd||n.crowdSpot||'')));
  check('1. 體育館沒有練球的路人（場邊路人不用）；大廳照舊有人',bp.length===0&&E.npcs.some(n=>n.crowd==='gym_lobby'),bp.length+' 個練球路人、大廳 '+E.npcs.filter(n=>n.crowd==='gym_lobby').length+' 人'); }
{ const G=mkG(FRI,17.75,'typhoon'), GM=enter('campus',G); const n=court().length, s=courtSpot();
  check('1. 颱風（typhoon）也算下雨：球場沒有人、集合點是提示',n===0&&!!s&&s.look===HINT&&rainy(G),n+' 人'); }
// ---------- 2. 晴天照舊 ----------
{ const G=mkG(FRI,17.75,'clear'), GM=enter('campus',G); const n=court().length, s=courtSpot();
  check('2. 晴天的週五 17:45：球場照舊有人（8～11）',n>=8&&n<=11,n+' 人');
  check('2. 晴天：集合點照舊（名牌「系籃練球」、沒有提示的字）',!!s&&s.label==='系籃練球'&&s.mark===true&&!s.hidden&&s.look===undefined,s&&String(s.look));
  caps.length=0; chose.length=0; answers=[1]; if(s) await s.onInteract(s);
  check('2. 晴天：按了照舊出「去練球：系籃練球」',(chose[0]||[])[0]==='去練球：系籃練球'&&!caps.includes(HINT),JSON.stringify([chose,caps]));
  const r=G.acts&&G.acts.wx&&G.acts.wx.dept_basketball; check('2. 晴天也記（今天、rain:false）',!!r&&r.day===G.day&&r.rain===false,JSON.stringify(r)); }
{ const G=mkG(FRI,17.75,'clear'), GM=enter('gym',G); const g=gymSpot();
  check('2. 晴天：體育館的參加點藏著（hidden）、不是遠遠的名牌（mark 關）',!g||(g.hidden===true&&!g.mark),g?'hidden='+g.hidden+' mark='+g.mark:'沒有');
  const it=RS?near(RS.x,RS.z):null; check('2. 晴天：站在那一點，最近的互動點不是系籃練球',!it||it.actSpot!=='dept_basketball',it&&it.label); }
// ---------- 3. 一次定整場 ----------
{ const G=mkG(FRI,17.5,'clear'); if(ACTIVITIES.rainLock) ACTIVITIES.rainLock(G); G.weather='rain'; G.hour=18; enter('campus',G); const n=court().length, s=courtSpot();
  check('3. 17:30 是晴（定了）、18:00 下雨：球場照舊有人、集合點照舊參加',n>=8&&!!s&&s.look===undefined&&!rainy(G),n+' 人、look='+(s&&s.look));
  enter('gym',G); const g=gymSpot(); check('3. 同上：體育館的參加點照舊藏著',!g||g.hidden===true,g&&String(g.hidden)); }
{ const G=mkG(FRI,17.5,'rain'); if(ACTIVITIES.rainLock) ACTIVITIES.rainLock(G); G.weather='clear'; G.hour=18; enter('campus',G); const n=court().length, s=courtSpot();
  check('3. 17:30 下雨（定了）、18:00 放晴：球場照舊沒有人、集合點照舊是提示',n===0&&!!s&&s.look===HINT&&rainy(G),n+' 人、look='+(s&&s.look));
  enter('gym',G); const g=gymSpot(); check('3. 同上：體育館的參加點照舊在',!!g&&!g.hidden,g&&String(g.hidden)); }
{ const G=mkG(FRI,17.75,'rain'); const r0=rainy(G); G.weather='clear'; G.hour=18.3; enter('campus',G); const n=court().length;
  check('3. 不用 tick：17:45 第一次問就定（下雨），18:18 放晴照舊沒有人',r0===true&&rainy(G)===true&&n===0,n+' 人'); }
{ const G=mkG(FRI,17.25,'rain'); const r0=rainy(G), rec0=!!(G.acts&&G.acts.wx&&G.acts.wx.dept_basketball); enter('campus',G); const s=courtSpot(); const look0=s&&s.look;
  G.weather='clear'; G.hour=17.5; if(ACTIVITIES.rainLock) ACTIVITIES.rainLock(G); const r1=rainy(G), rec1=G.acts&&G.acts.wx&&G.acts.wx.dept_basketball;
  check('3. 17:15 下雨：還沒定（不記），先照現在的天氣（集合點寫那句提示）；17:30 放晴＝定成晴天場',r0===true&&!rec0&&look0===HINT&&r1===false&&!!rec1&&rec1.rain===false&&s.look===undefined,JSON.stringify({r0,rec0,look0,r1,rec1})); }
// ---------- 4. 舊存檔、非練球日、國定假日 ----------
{ const G0=mkG(FRI,17.75,'rain'); delete G0.acts; let e1=null, a1=null; try{ a1=rainy(G0); enter('campus',G0); }catch(e){ e1=e; }
  const G1=mkG(FRI,17.75,'rain'); G1.acts={att:{}}; let e2=null, a2=null; try{ a2=rainy(G1); }catch(e){ e2=e; }
  const G2=mkG(FRI,17.75,'clear'); G2.acts={att:{},wx:{dept_basketball:{day:dayOf(FRI)-7,rain:true}}}; let e3=null, a3=null; try{ a3=rainy(G2); }catch(e){ e3=e; }
  check('4. 舊存檔（沒有 G.acts／G.acts 沒有 wx／wx 是上一週的下雨場）：不出錯，照當下的天氣記',!e1&&!e2&&!e3&&a1===true&&a2===true&&a3===false&&!!G1.acts.wx&&G2.acts.wx.dept_basketball.day===dayOf(FRI)&&G2.acts.wx.dept_basketball.rain===false,[e1,e2,e3].map(e=>e&&e.message).join(' ')+' '+JSON.stringify([a1,a2,a3])); }
{ const G=mkG(THU,17.75,'rain'); enter('campus',G); const h=hintIt()[0], n=court().length; enter('gym',G); const g=gymSpot();
  check('4. 下雨的週四（非練球日）：不是下雨場、體育館沒有參加點、球場的提示照舊「系籃練球（星期五 17:30）」',!rainy(G)&&!g&&n===0&&!!h&&h.label==='系籃練球（星期五 17:30）'&&/今天沒有系籃練球/.test(h.look),h&&h.label); }
{ const G=mkG(HOL,17.75,'rain'); enter('campus',G); const s=courtSpot(), h=hintIt()[0]; enter('gym',G); const g=gymSpot();
  check('4. 下雨的國慶日（10/10 週五，停練）：沒有參加點（球場、體育館都沒有）、球場的提示照舊寫停一次',!rainy(G)&&!s&&!g&&!!h&&/停一次/.test(h.look),h&&h.look); }
// ---------- 5. 手機、tick ----------
{ const G=mkG(FRI,17.75,'rain'), p=ACTIVITIES.placeOf?ACTIVITIES.placeOf(A,G):null, G2=mkG(FRI,17.75,'clear'), q=ACTIVITIES.placeOf?ACTIVITIES.placeOf(A,G2):null;
  const src=fs.readFileSync(path.join(ROOT,'src/game3d.js'),'utf8');
  check('5. 手機「活動」今天那一場：下雨＝新體育館一樓走廊（前往 gym）、晴天＝籃球場（醉月湖東側）（ACTIVITIES.placeOf；game3d.js eventsHTML 用它）',!!p&&p.zone==='gym'&&p.roomName==='新體育館一樓走廊'&&!!q&&q.zone==='campus'&&q.roomName==='籃球場（醉月湖東側）'&&/const pa=k===0&&ACTIVITIES\.placeOf\?ACTIVITIES\.placeOf\(a,G\):a;[^\n]*\n[^\n]*const where=pa\.roomName[^\n]*q\[0\]===pa\.zone/.test(src),JSON.stringify([p,q])); }
{ const G=mkG(FRI,17.4,'rain'); if(ACTIVITIES.rainLock) ACTIVITIES.rainLock(G); const r0=!!(G.acts&&G.acts.wx); G.hour=17.52; if(ACTIVITIES.rainLock) ACTIVITIES.rainLock(G); const r1=G.acts&&G.acts.wx&&G.acts.wx.dept_basketball;
  const src=fs.readFileSync(path.join(ROOT,'src/classes3d.js'),'utf8');
  check('5. 課表的 tick（classes3d.js S.tick）每一格叫 ACTIVITIES.rainLock：17:24 不記、17:31 照那時的天氣記',!r0&&!!r1&&r1.rain===true&&/S\.tick=function\(GM\)\{[^\n]*\n\s*if\(typeof ACTIVITIES!=='undefined'&&ACTIVITIES\.rainLock\) ACTIVITIES\.rainLock\(G\);/.test(src),JSON.stringify(r1)); }
// ---------- 6. 阿哲、明軒下雨那一筆的位置 ----------
{ const RZ=(CHARACTERS.zhe.daily_schedule||[]).find(e=>e.rainOf==='dept_basketball'), RM=(CHARACTERS.classmate_mingxuan.daily_schedule||[]).find(e=>e.rainOf==='dept_basketball');
  const G=mkG(FRI,17.75,'rain'); enter('gym',G); const segs=[]; for(const n of E.npcs){ const w=n.waypoints; if(!w||n.crowd!=='gym_lobby') continue; for(let i=0;i<w.length;i++) segs.push([w[i],w[(i+1)%w.length]]); }
  const dSeg=(p,[a,b])=>{ const vx=b[0]-a[0], vz=b[1]-a[1], L2=vx*vx+vz*vz||1e-9; let t=((p[0]-a[0])*vx+(p[1]-a[1])*vz)/L2; t=Math.max(0,Math.min(1,t)); return Math.hypot(p[0]-a[0]-t*vx,p[1]-a[1]-t*vz); };
  const bad=[]; for(const [nm,r] of [['阿哲',RZ],['明軒',RM]]){ if(!r){ bad.push(nm+' 沒有下雨那一筆'); continue; } const p=r.at; if(!E.canStand(p[0],p[1],0.32,0)) bad.push(nm+' 站不住'); if(!(p[1]>11.2&&p[1]<15&&Math.abs(p[0])<16)) bad.push(nm+' 不在大廳'); const ds=segs.length?Math.min(...segs.map(s=>dSeg(p,s))):9; if(ds<0.8) bad.push(nm+' 離走路的人 '+ds.toFixed(2)+' m'); if(RS&&Math.hypot(p[0]-RS.x,p[1]-RS.z)<1.2) bad.push(nm+' 擋住參加點'); }
  check('6. 阿哲、明軒下雨那一筆在體育館一樓走廊：站得住、在大廳靠球場那一面、離大廳走路的人 0.8 m 以上、不擋參加點',!bad.length&&segs.length>0,bad.join('｜')||(segs.length+' 段路線'));
  const fz=RZ&&RS?Math.cos(RZ.at[2]-Math.atan2(RS.x-RZ.at[0],RS.z-RZ.at[1])):0;
  check('6. 阿哲面向參加點（等人）、明軒面向東邊（沿著走廊）',fz>0.95&&!!RM&&Math.abs(RM.at[2]-Math.PI/2)<0.05,RZ&&RM?RZ.at[2]+' / '+RM.at[2]:''); }
const r=cp.spawnSync(process.execPath,[__filename,'--sched'],{encoding:'utf8'}); process.stdout.write(r.stdout||''); if(r.status!==0){ fails++; if(r.stderr) console.log('FAIL 7. 作息的行程出錯　'+String(r.stderr).split('\n').slice(0,3).join(' ')); }
console.log(fails?('\n'+fails+' 項 FAIL'):'\nALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 主流程出錯　'+String(e&&e.stack||e).split('\n').slice(0,3).join(' ')); process.exit(1); });
