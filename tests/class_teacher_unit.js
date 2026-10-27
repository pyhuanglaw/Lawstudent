// CLASS-TEACHER-1027（使用者 2026-10-27 20:3x：「電影敘事上課沒老師? 如果我晚到也要看到有老師啊」「每一堂課都要檢查」）——不需要瀏覽器。
// 在 Node 建出遊戲真正的教室（霖澤館 201、202、萬才館多功能教室、共同、博雅、普通教學館），照 GAME.enter 進教室（STORY.populate：課表的同學、作息裡的教授、人流），檢查：
//   1. 課表四年（經濟系那一年＋法律系大一～大四、每一學期；選修、日本路線的補修也算）每一門在 3D 教室上的課，開學第 3 週以後第一堂普通課：
//      準時（開始前 2 分鐘）、晚 20 分鐘進教室兩種，講台前都有一位老師——有 3D 教授的課是那位教授（作息），沒有的是一位一般的老師（名字＝課堂上的稱呼）；
//      老師站在每一個學生座位的前面（學生面向的那一邊）、面向學生、站得住（不在桌椅裡）。
//   2. 待在教室裡、上課時間到了：老師（一般的、有名字的教授都一樣）從門口走進來、走得到講台（引擎真正的移動模擬），到了面向學生站好——不在講台上憑空出現。
//   3. 下課（時間正常往前）：一般的老師從講台走出去（不是當場消失）；時間跳了（跳過時間、讀檔）直接拿掉。
//   4. 期中考那一堂、重修那一學期的課：講台前也有老師。
// 修改前：萬才館多功能教室、霖澤館 202（GLB 教室）、共同 102 的教授找不到講台位置、不出現；沒有 3D 教授的課（國文、英文、通識、會計…）講台是空的（第 1 項大量 FAIL）。
// 用法：node tests/class_teacher_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){}, querySelectorAll:()=>[] };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
const warn0=console.warn; console.warn=()=>{}; process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(new Error('no fetch in node'));   /* 正式模型（GLB）在 Node 載不到：用備用模型，警告不印 */
const GL=/^(THREE|THREE_JSM|P3|ASSETS|W3|E3|TK|CK|Z3|B3|LL3|TB3|LINZE_LAYOUT|CLASSROOM_LAYOUT|WANCAI_LAYOUT|LAWLIB_LAYOUT|GONGTONG_LAYOUT|BOYA_LAYOUT|PUTONG_LAYOUT|ROOM_GLB_LAYOUTS|CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|CALENDAR|PLACES|ACTIVITIES|COURSES|SYLLABUS|CLS|CROWD|PROPS|CHAR|STORY)$/;
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>GL.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
for(const f of ['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/dorm_room_layout.js',
  'src/data/linze_layout.js','src/data/classroom_layout.js','src/building3d.js','src/data/wancai_layout.js','src/data/lawlib_layout.js','src/lawlib3d.js','src/data/gongtong_layout.js','src/data/boya_layout.js','src/data/putong_layout.js','src/teach3d.js',
  'src/data/room_glb_layouts.js','src/rooms_glb3d.js','src/data/characters.js','src/data/calendar.js','src/data/places.js','src/data/activities.js','src/data/courses.js','src/data/syllabus.js','src/classes3d.js','src/crowd3d.js']) load(f);
global.CHAR={build:spec=>{ const g=new THREE.Group(); g.userData.spec=spec; return g; },release(){},setExpr(){},animate(){}};
global.SOCIAL={displayName:id=>(CHARACTERS[id]&&CHARACTERS[id].name)||id,npcName:id=>(CHARACTERS[id]&&CHARACTERS[id].name)||id,stage:()=>'ACQ',noticed(){},reveal:()=>'ACQUAINTANCE',has:()=>true,talkedTo(){},meet(){}};
let GMref=null; const ALIAS={heroine_01:'an',heroine_05:'sis',prof_zhou:'prof'};
global.EVENTS={npcOf:id=>GMref&&(GMref.npc[id]||GMref.npc[ALIAS[id]])||null,onEnter(){},tick(){},check:()=>false,cond:()=>false,onInteract:()=>false}; global.STORY_EVENTS=[];
load('src/story3d.js');
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
/* 引擎的 addNPC／removeNPC 要用到渲染場景（Node 裡沒有）：換成只記錄名單的版本（坐著的放在座位的高度）；路線用引擎真正的 moveTo、找路 */
E.addNPC=n=>{ n.path=null; n.speed=0; n.pose=n.pose||'idle'; n.radius=0.32; n.lv=n.lv|0; if(n.seat&&n.seat.y!=null) n.obj.position.y=n.seat.y; E.npcs.push(n); return n; }; E.removeNPC=n=>{ E.npcs=E.npcs.filter(m=>m!==n); };
function enter(id){ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(E.levels) for(const n of E.levels) n._cm=null; else if(z.nav) z.nav._cm=null;
  E.player={obj:{position:new THREE.Vector3(z.spawn.x,0,z.spawn.z),rotation:{y:0}},radius:0.32,lv:(z.spawn.lv|0),seat:null,busy:false}; E.camera=null; return z; }
function mkGM(G){ const GM={G,E,npc:{},D:{active:false},hourRate:1/150};
  GM.spawnNPC=(id,spec,x,z,opts)=>{ opts=opts||{}; const o=CHAR.build(spec||{}); o.position.set(x,0,z); if(opts.yaw!=null) o.rotation.y=opts.yaw; const n=E.addNPC({obj:o,id,charId:opts.charId||id,name:(spec&&spec.name)||id,beh:opts.beh||'idle',seat:opts.seat,pose:opts.pose||'idle',waypoints:opts.waypoints,lv:opts.lv|0});
    if(opts.seat){ o.position.set(opts.seat.x,opts.seat.y||0,opts.seat.z); o.rotation.y=opts.seat.yaw||0; } GM.npc[id]=n; return n; };
  GM.spawnCharacter=(id,x,z,opts)=>{ const c=CHARACTERS[id]; if(!c) return null; if(GM.npc[id]) return GM.npc[id]; const n=GM.spawnNPC(id,{name:c.name},x,z,Object.assign({charId:id},opts)); n.charId=id; return n; };
  GM.removeNPC=id=>{ const n=GM.npc[id]; if(n){ E.removeNPC(n); delete GM.npc[id]; } }; GM.spawnExtra=()=>{}; GM.spawnRider=()=>{};
  GM.sitAt=(n,st)=>{ n.seat=st; n.pose='sit'; n.frozen=true; n.path=null; n.obj.position.set(st.x,st.y||0,st.z); n.obj.rotation.y=st.yaw||0; }; GM.standUp=n=>{ n.seat=null; n.pose='idle'; n.frozen=false; };
  GM.seatApproach=st=>CROWD.seatSide(E,st); GM.face=(n,x,z)=>{ n.obj.rotation.y=Math.atan2(x-n.obj.position.x,z-n.obj.position.z); }; GM.knownIds=()=>Object.keys(CHARACTERS);
  GMref=GM; return GM; }
const roomOf=c=>COURSES.rooms[c.room]||{};
const in3D=c=>{ const r=roomOf(c); return r.zone==='classroom'||!!r.room; };   /* 3D 教室上的課（門口上課的：研討室 A、體育館、服務學習、校外實習不算——它們是 2D 畫面）*/
const gameFor=(c,day,hour,extra)=>{ const G=Object.assign({day,hour,weekday:CALENDAR.dateOf(day).wd%7,stage:/^Y0/.test(c.term)?'econ':'law',flags:{afternoonDone:true,classDone:true},social:{},zone:roomOf(c).zone,goal:''},extra||{});
  if(c.choice) G.courses={electives:{[c.choice.group]:c.id}};   /* 選修：選了這一門 */ if(c.route) G.flags.EXCHANGE_ROUTE=c.route[0];   /* 日本路線大四下的補修 */ return G; };
function firstClass(c,G0){ for(let d=-500;d<1700;d++){ const t=CALENDAR.termOf(d); if(!t||t.id!==c.term||t.week<3) continue; const G=gameFor(c,d,8,G0); for(const it of CLS.dayItems(G)) if(it.c.id===c.id&&!it.exam&&!CLS.storyClass(G,it)&&!(G.flags&&G.flags.classNow)) return {it,G}; } return null; }
const roomSeats=(z,it)=>(z.seats||[]).filter(q=>(!it.room.room||q.room===it.room.room)&&(q.kind==='class'||q.kind==='lecture'||!q.kind));
const expectName=c=>{ const sid=c.redo||c.id, p=SYLLABUS.pools&&SYLLABUS.pools[sid]; return (p&&p.prof_label)||CLS.profName(c); };
/* 講台前的老師：有 3D 教授＝那位教授；沒有＝一般的老師（clsTeacher＝這一堂） */
const teacherOf=(GM,it)=>{ const c=it.c, named=c.prof&&CHARACTERS[c.prof]&&CHARACTERS[c.prof].social_layer==='E'; if(named){ const n=EVENTS.npcOf(c.prof); return n&&E.npcs.includes(n)?n:null; } return E.npcs.find(n=>n.clsTeacher===it.key&&!n.leaving)||null; };
/* 站的位置對不對：在每一個學生座位的前面（學生面向的那一邊）0.3 m 以上、面向學生、站得住 */
function judge(z,it,n){ const P=n.obj.position, seats=roomSeats(z,it); if(!seats.length) return 'no seats';
  let fx=0, fz=0; for(const s of seats){ fx+=Math.sin(s.yaw||0); fz+=Math.cos(s.yaw||0); } const fl=Math.hypot(fx,fz)||1; fx/=fl; fz/=fl;
  const behind=seats.filter(s=>(P.x-s.x)*Math.sin(s.yaw||0)+(P.z-s.z)*Math.cos(s.yaw||0)<0.3);
  const ry=n.obj.rotation.y, face=Math.sin(ry)*fx+Math.cos(ry)*fz;
  const stand=E.canStand(P.x,P.z,0.3,n.lv|0);
  if(behind.length) return '有 '+behind.length+' 個座位在老師前面（'+P.x.toFixed(1)+','+P.z.toFixed(1)+'）';
  if(face>-0.7) return '沒有面向學生（朝向 '+ry.toFixed(2)+'）';
  if(!stand) return '站不住（'+P.x.toFixed(1)+','+P.z.toFixed(1)+'）';
  if(n.pose!=='idle'&&n.pose!=='talk') return '姿勢 '+n.pose;
  return ''; }
// ---------- 1. 課表四年每一門 3D 教室的課：準時、晚 20 分鐘 ----------
{ const list=COURSES.list.filter(in3D); const bad=[], miss=[]; let ran=0; const byZone={};
  for(const c of list){ const fc=firstClass(c); if(!fc){ miss.push(c.id); continue; } ran++; const zid=roomOf(c).zone; byZone[zid]=(byZone[zid]||0)+1;
    for(const [lab,h] of [['準時',fc.it.t0-2/60],['晚 20 分鐘',fc.it.t0+20/60]]){ const G=gameFor(c,fc.it.day,h); const z=enter(zid); const GM=mkGM(G);
      let err=''; try{ STORY.populate(zid,GM); }catch(e){ err='populate 錯誤 '+e.message; }
      const it=CLS.dayItems(G).find(q=>q.key===fc.it.key); const n=it&&teacherOf(GM,it); const why=err||(!n?'講台前沒有老師':judge(z,it,n));
      const nm=!c.prof||!(CHARACTERS[c.prof]&&CHARACTERS[c.prof].social_layer==='E')?expectName(c):null; const nameBad=n&&nm&&n.name!==nm?'名字 '+n.name+'（應該是 '+nm+'）':'';
      if(why||nameBad) bad.push(c.id+'（'+c.term+' '+c.name+'，'+(roomOf(c).name||zid)+'）'+lab+'：'+(why||nameBad)); } }
  check('1. 課表四年每一門在 3D 教室上的課（'+ran+' 門：'+Object.entries(byZone).map(([k,v])=>k+' '+v).join('、')+'），準時、晚 20 分鐘進教室：講台前都有老師（有 3D 教授的是那位教授），站在學生前面、面向學生、站得住',!bad.length&&ran>=40,bad.length?bad.length+' 處：'+bad.slice(0,12).join('｜')+(bad.length>12?'…':''):'');
  check('1. 每一門都找得到第 3 週以後的一堂普通課（沒有漏掉的課）',!miss.length,miss.join('、')); }
// ---------- 2. 待在教室裡、上課時間到了：老師從門口走上講台 ----------
function stayIn(cid){ const c=COURSES.list.find(q=>q.id===cid), fc=firstClass(c), zid=roomOf(c).zone; const G=gameFor(c,fc.it.day,fc.it.t0-0.7); enter(zid); const GM=mkGM(G);
  STORY.populate(zid,GM); CLS.syncRoom(GM); const before=teacherOf(GM,fc.it);
  G.hour=fc.it.t0-0.48; STORY.refreshSchedule(GM); CLS.syncRoom(GM); const n=teacherOf(GM,fc.it); return {c,fc,G,GM,before,n,zid}; }
for(const cid of ['ge_film_y1s1','chinese_y1','english_y1','property','legal_english','securities','const_1','law_intro']){ const {c,fc,G,GM,before,n,zid}=stayIn(cid); const z=E.zone;
  const sp=n&&(n.tSpot||(fc.it.room.room?(z.teacherSpots||{})[fc.it.room.room]:z.teacherSpot)), P=n&&n.obj.position, far=n&&sp?Math.hypot(P.x-sp.x,P.z-sp.z):0;
  let walk=null; if(n&&sp&&n.path&&n.path.length) walk=E.simWalk(P.x,P.z,sp.x,sp.z,{lv0:n.lv|0,lv1:sp.lv|0,dt:1/30,speed:1.25});
  let why=''; if(before) why='開始前 42 分鐘就已經在講台（應該還沒來）'; else if(!n) why='上課時間到了講台前沒有老師'; else if(!sp) why='沒有記講台的位置'; else if(far<1.5) why='在講台上冒出來（離講台 '+far.toFixed(1)+' m）'; else if(!n.path||!n.path.length) why='沒有在走'; else if(!walk||!walk.ok) why='走不到講台 '+JSON.stringify(walk).slice(0,80);
  if(!why){ const p=n.path[n.path.length-1]; E.placeAt(n,p[0],p[1],p[2]!=null?p[2]:n.lv); n.path=null; const f=n.onArrive; n.onArrive=null; if(f) f(n); why=judge(z,fc.it,n)||(Math.hypot(n.obj.position.x-sp.x,n.obj.position.z-sp.z)>0.05?'沒有站到講台':''); }
  check('2. 待在 '+(roomOf(c).name||zid)+'（'+c.name+'）：開始前 29 分鐘老師從門口走進來（離講台 '+far.toFixed(1)+' m、走得到），到了面向學生站在講台前',!why,why); }
// ---------- 3. 下課：一般的老師走出去；時間跳了直接拿掉 ----------
{ const {fc,G,GM}=stayIn('ge_film_y1s1'); CLS.settleRoom&&CLS.settleRoom(GM); for(const n of E.npcs) if(n.path&&n.onArrive){ const p=n.path[n.path.length-1]; E.placeAt(n,p[0],p[1],p[2]!=null?p[2]:n.lv); n.path=null; const f=n.onArrive; n.onArrive=null; f(n); }
  for(let h=fc.it.t0;h<fc.it.t1;h+=0.25){ G.hour=h; CLS.syncRoom(GM); }
  const t=teacherOf(GM,fc.it); G.hour=fc.it.t1+0.05; CLS.syncRoom(GM); const out=E.npcs.find(n=>n.clsTeacher===fc.it.key);
  check('3. 下課（時間正常往前）：一般的老師從講台走出去（還在、正在走、往門口），不是當場消失',!!t&&!!out&&out.leaving&&!!out.path&&out.path.length>0,out?JSON.stringify({leaving:out.leaving,path:out.path&&out.path.length}):'不見了');
  const {fc:fc2,G:G2,GM:GM2}=stayIn('ge_film_y1s1'); G2.hour=fc2.it.t0+0.1; CLS.syncRoom(GM2); const had=E.npcs.some(n=>n.clsTeacher===fc2.it.key); G2.hour=fc2.it.t1+1.2; CLS.syncRoom(GM2);
  check('3. 時間跳了（跳過時間、讀檔）：老師直接拿掉，不從遠處走',had&&!E.npcs.some(n=>n.clsTeacher),E.npcs.filter(n=>n.clsTeacher).length+' 人'); }
// ---------- 4. 期中考、重修 ----------
{ const c=COURSES.list.find(q=>q.id==='chinese_y1'); let it=null, G=null; for(let d=1;d<200&&!it;d++){ const t=CALENDAR.termOf(d); if(!t||t.id!=='Y1S1'||t.exam!=='mid') continue; const g=gameFor(c,d,8); const q=CLS.dayItems(g).find(x=>x.c.id==='chinese_y1'); if(q){ it=q; G=g; } }
  if(!it) check('4. 找不到大一國文期中考週那一堂（跳過）',true);
  else { G.hour=it.t0+0.1; enter('boya'); const GM=mkGM(G); STORY.populate('boya',GM); const n=teacherOf(GM,it); const why=!n?'沒有老師':judge(E.zone,it,n);
    check('4. 大一國文期中考週那一堂（博雅 101）：講台前有老師（監考）',!why,why); } }
{ const c=COURSES.list.find(q=>q.id==='crim_gen1'); const fc=firstClass(COURSES.list.find(q=>q.id==='const_2')); const it0=fc.it;
  const R={retake:[{id:'crim_gen1',from:'Y1S1',base:'Y1S1',term:'Y1S2',slots:[{wd:it0.slot.wd,block:it0.slot.block==='am'?'pm2':'am'}],alt:true}]};
  let it=null, G=null; for(let d=it0.day;d<it0.day+14&&!it;d++){ const g=gameFor(c,d,8,{courses:R}); g.stage='law'; const q=CLS.dayItems(g).find(x=>x.c.id==='crim_gen1'&&!x.exam); if(q){ it=q; G=g; } }
  if(!it) check('4. 排不出刑法總則（一）的重修（跳過）',true);
  else { G.hour=it.t0+0.2; enter('classroom'); const GM=mkGM(G); STORY.populate('classroom',GM); const n=teacherOf(GM,it); const why=!n?'沒有老師':judge(E.zone,it,n);
    check('4. 重修那一學期的刑法總則（一）（霖澤館 201）：講台前有老師',!why,why); } }
console.warn=warn0; console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
