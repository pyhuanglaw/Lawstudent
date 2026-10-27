// CROWD-CLASS-ARRIVE-1027（使用者 2026-10-27 20:1x：「而且博雅上課門口為什麼一坨人都不會動 開始上課教室突然出現更多人已經坐在位置上?」）——不需要瀏覽器。
// 在 Node 建出遊戲真正的博雅教學館、普通教學館、霖澤館 201，用課表（classes3d.js）、人流（crowd3d.js）、引擎真正的找路檢查：
//   1. 門口等上課的人有小動作：每個人 4～10 秒（真實時間）換一個——轉頭看旁邊的人／聊兩句、手插口袋、轉身、走一兩步（離原本的位置 0.8 m 以內、站得住）；不是每一格都動。
//   2. 上課前 10 分鐘起，門口的人分批走進教室坐下（開始前 10 分鐘以前沒有人進去；開始前 7、4、1 分鐘陸續增加；不是等到開始那一刻一起進去）；各自一個空位；
//      門口還沒進去的人算在這堂課的人數裡（大門不會多排人進來）；剛走進博雅（開始前 5 分鐘）：已經過了走進去時間的人不在門口（人在教室裡）。
//   3. 玩家人在教室裡：上課前 10 分鐘到開始上課，沒有人憑空出現在座位上（同學都從門口走進來、替身不會在玩家眼前出現）；
//      開始前 25 分鐘坐下選「上課」：先轉暗、等到上課時間，黑畫面裡同學坐好（上課的對話裡同學都在、老師在講台）；開始後 2 分鐘才坐下上課：還沒到的同學從門口走進來，不在座位上冒出來。
//   4. 沒有空位的時候，門口的人走出建築（2026-10-18「博雅 101 疊成一團」不要回來）。
//   5. 霖澤館 201 下課：同學起身從門口走出去（原本在座位上當場消失）。
// 修改前：門口的人一動也不動、開始上課那一刻才一起進去、選「上課」時沒到的同學一起出現在座位上（第 1、2、3 項 FAIL）。用法：node tests/class_arrive_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
const warn0=console.warn; console.warn=()=>{}; process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(new Error('no fetch in node'));
let seed=12345; Math.random=()=>{ seed=(seed*16807)%2147483647; return (seed-1)/2147483646; };   /* 小動作用到亂數：固定種子，每次跑結果一樣 */
const GL=/^(THREE|THREE_JSM|P3|ASSETS|W3|E3|TK|CK|Z3|B3|LL3|TB3|LINZE_LAYOUT|CLASSROOM_LAYOUT|LAWLIB_LAYOUT|GONGTONG_LAYOUT|BOYA_LAYOUT|PUTONG_LAYOUT|CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|CALENDAR|PLACES|ACTIVITIES|COURSES|SYLLABUS|CLS|CROWD|PROPS|CHAR)$/;
for(const f of ['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/dorm_room_layout.js',
  'src/data/linze_layout.js','src/data/classroom_layout.js','src/building3d.js','src/data/lawlib_layout.js','src/lawlib3d.js','src/data/gongtong_layout.js','src/data/boya_layout.js','src/data/putong_layout.js','src/teach3d.js',
  'src/data/characters.js','src/data/calendar.js','src/data/places.js','src/data/activities.js','src/data/courses.js','src/data/syllabus.js','src/classes3d.js','src/crowd3d.js']){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>GL.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
global.CHAR={build:spec=>{ const g=new THREE.Group(); g.userData.spec=spec; return g; },release(){}};
global.STORY={extraSpec:i=>({id:'x'+i,sex:i%2===0?'f':'m'}),CROWD_X:2};   /* 遊戲裡路人加倍（story3d.js 的 CROWD_X＝2）*/
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
let faded=false, popped=[];   /* 沒轉暗的時候直接坐在座位上加進來的人＝在玩家眼前憑空出現 */
E.addNPC=n=>{ n.path=null; n.speed=0; n.pose=n.pose||'idle'; n.radius=0.32; n.lv=n.lv|0; if(n.seat&&n.seat.y!=null) n.obj.position.y=n.seat.y; if(!faded&&n.seat&&(n.pose==='sit'||n.pose==='read')) popped.push(n); E.npcs.push(n); return n; }; E.removeNPC=n=>{ E.npcs=E.npcs.filter(m=>m!==n); };
function enter(id,px,pz,lv){ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(E.levels) for(const n of E.levels) n._cm=null; else if(z.nav) z.nav._cm=null;
  E.player={obj:{position:new THREE.Vector3(px!=null?px:z.spawn.x,0,pz!=null?pz:z.spawn.z),rotation:{y:0}},radius:0.32,lv:lv|0,seat:null}; E.camera=null; return z; }
const DAY=86400000, dayOf=s=>{ const [y,m,d]=s.split('-').map(Number); return Math.round((Date.UTC(y,m-1,d)-Date.UTC(2025,8,17))/DAY)+1; };
const TUE=dayOf('2025-09-23');   /* 大一國文（上）：週二 09:10 博雅 101 */
const mkGM=G=>({G,E,say:async()=>{},choose:async()=>0,fade:async on=>{ faded=!!on; },advance:h=>{ G.hour+=h; },energy(){},caption(){},sceneBegin(){},sceneEnd(){},autosave(){},setGoal(){},toast(){},hourRate:1/150,
  sitAt:(n,st)=>{ n.seat=st; n.pose='sit'; n.frozen=true; n.path=null; n.obj.position.set(st.x,st.y||0,st.z); n.obj.rotation.y=st.yaw||0; },seatApproach:st=>CROWD.seatSide(E,st)});
/* 簡化的引擎：有路線的人直接走到終點、叫 onArrive（和引擎走完一樣）；記下終點 */
const arriveAll=()=>{ const ends=[]; for(const n of E.npcs.slice()) if(n.path&&n.path.length){ const p=n.path[n.path.length-1]; ends.push({n,x:p[0],z:p[1]}); E.placeAt(n,p[0],p[1],p[2]!=null?p[2]:n.lv); n.path=null; const f=n.onArrive; n.onArrive=null; if(f) f(n); } return ends; };
const T0=9+10/60, SPOT='boya_101';
// ---------- 1. 門口等的人有小動作 ----------
{ enter('boya',0,6.5); const G={day:TUE,hour:T0-19/60,zone:'boya',flags:{},weekday:2}; const GM=mkGM(G); CLS.syncRooms(GM,{instant:true}); CROWD.enter(GM,'boya');
  const wait=E.npcs.filter(n=>n.crowd===SPOT); const home=new Map(wait.map(n=>[n,{x:n.obj.position.x,z:n.obj.position.z,pose:n.pose,ry:n.obj.rotation.y,pk:!!n.pockets}]));
  const seen=new Map(wait.map(n=>[n,new Set()])); let far=0, bad=[], ticks=0;
  for(let i=0;i<16;i++){ G.hour+=0.01; CROWD.tick(GM,1.5); ticks++;   /* 遊戲時間每真實秒 1/150 小時：1.5 秒＝0.01 小時（16 次＝24 秒、9.6 遊戲分鐘：08:51 → 09:01 以前）*/
    for(const n of wait){ const h=home.get(n), S=seen.get(n); if(n.pose!==h.pose) S.add('pose'); if(!!n.pockets!==h.pk) S.add('pockets'); if(n.faceYaw!=null&&Math.abs(n.faceYaw-h.ry)>0.05) S.add('turn'); if(n.lookAt) S.add('look'); if(n.path&&n.path.length) S.add('step');
      if(n.path&&n.path.length){ const p=n.path[n.path.length-1]; far=Math.max(far,Math.hypot(p[0]-h.x,p[1]-h.z)); if(!E.canStand(p[0],p[1],0.3,n.lv|0)) bad.push(p.map(v=>+v.toFixed(2)).join(',')); } }
    arriveAll(); }
  const moved=wait.filter(n=>(n.fid|0)>=1), kinds=new Set(); for(const S of seen.values()) for(const k of S) kinds.add(k);
  check('1. 博雅 101 門口等上課的 '+wait.length+' 個人：24 秒裡每個人都有小動作（轉頭、聊兩句、手插口袋、轉身、走一兩步），不是一動也不動',wait.length>=4&&moved.length===wait.length,moved.length+'／'+wait.length+' 人');
  check('1. 小動作有好幾種（不是同一個動作）',kinds.size>=3,[...kinds].join('、'));
  check('1. 不是每一格都動：一個人 24 秒最多換 6 次（4～10 秒一次）',wait.every(n=>(n.fid|0)<=6),wait.map(n=>n.fid|0).join(','));
  check('1. 走一兩步：離原本的位置 0.8 m 以內、站得住',far<=0.81&&!bad.length,'最遠 '+far.toFixed(2)+' m'+(bad.length?' 站不住 '+bad.join(' '):'')); }
// ---------- 2. 上課前 10 分鐘起分批走進教室 ----------
{ enter('boya',0,6.5); seed=777; const G={day:TUE,hour:T0-19/60,zone:'boya',flags:{},weekday:2}; const GM=mkGM(G); CLS.syncRooms(GM,{instant:true}); CROWD.enter(GM,'boya');
  const wait=E.npcs.filter(n=>n.crowd===SPOT); const went=()=>wait.filter(n=>n.clsStudent).length; const log=[]; const seats=new Set(); let dup=0, notRoom=0, maxSeated=0;
  for(let m=-19;m<=0;m++){ G.hour=T0+m/60; CROWD.tick(GM,2); CLS.syncRooms(GM);
    for(const n of wait) if(n.clsStudent&&n.seat&&!seats.has(n)){ seats.add(n); }
    if([-11,-7,-4,-1,0].includes(m)) log.push(m+' 分：'+went()); arriveAll(); maxSeated=Math.max(maxSeated,E.npcs.filter(n=>n.clsStudent).length); }
  const st=wait.filter(n=>n.seat).map(n=>n.seat); dup=st.length-new Set(st).size; notRoom=st.filter(q=>q.room!=='101').length;
  const at=k=>+((log.find(s=>s.indexOf(k+' 分')===0)||'').split('：')[1]);
  check('2. 門口的人分批走進教室：開始前 11 分鐘還沒有人進去，開始前 7、4、1 分鐘陸續增加（不是等到開始那一刻一起進去）',at(-11)===0&&at(-7)>0&&at(-4)>at(-7)&&at(-1)>at(-4)&&at(-1)<=wait.length,log.join('、')+'（共 '+wait.length+' 人）');
  check('2. 走進去的人各自一個空位、都在 101',st.length===wait.length&&!dup&&!notRoom,st.length+' 個位子、重複 '+dup+'、不在 101 '+notRoom);
  check('2. 大門進來的同學加上門口進去的人＝這堂課的名額（不會因為門口的人另外多排）',maxSeated<=16,'教室裡最多 '+maxSeated+' 人'); }
{ enter('boya',0,6.5); const G={day:TUE,hour:T0-5/60,zone:'boya',flags:{},weekday:2}; const GM=mkGM(G); CLS.syncRooms(GM,{instant:true}); CROWD.enter(GM,'boya');
  const grp=CROWD.group(G,CROWD.SPOTS.find(s=>s.id===SPOT),CROWD.slotAt(G,CROWD.SPOTS.find(s=>s.id===SPOT))); const at=E.npcs.filter(n=>n.crowd===SPOT).length;
  check('2. 開始前 5 分鐘才走進博雅：已經過了走進去時間的人不在門口（人在教室裡了）',at>0&&at<grp.length,'門口 '+at+' 人／這一群 '+grp.length+' 人'); }
// ---------- 3. 玩家人在教室裡：沒有人憑空出現在座位上 ----------
const inRoom=(z,room)=>{ const sts=z.seats.filter(q=>q.room===room); const s=sts[sts.length-1]; const ap=CROWD.seatSide(E,s); return {s,ap}; };
{ const z=enter('boya',0,6.5); const G={day:TUE,hour:T0-22/60,zone:'boya',flags:{},weekday:2}; const GM=mkGM(G); CLS.syncRooms(GM,{instant:true}); CROWD.enter(GM,'boya');
  const {ap}=inRoom(z,'101'); E.player.obj.position.set(ap[0],0,ap[1]); popped=[]; const fig0=(CLS.figState?CLS.figState():[]).map(f=>f.key).join();   /* 玩家站在 101 裡面最後一排；剛走進來（instant）時放的替身不算 */
  for(let m=-21;m<=3;m++){ G.hour=T0+m/60; CROWD.tick(GM,2); CLS.syncRooms(GM); arriveAll(); }
  const figs=(CLS.figState?CLS.figState():[]).map(f=>f.key).join(); const seated=E.npcs.filter(n=>n.clsStudent&&n.pose==='sit').length;
  check('3. 玩家站在博雅 101 裡：上課前 22 分鐘到開始後 3 分鐘，沒有人憑空出現在座位上（都從門口走進來）、替身也沒有在眼前出現',!popped.length&&figs===fig0&&seated>=8,'憑空出現 '+popped.length+' 人、替身 '+(figs===fig0?'沒有新的':'多了 '+figs)+'、坐好的 '+seated+' 人'); }
async function attendAt(min,zid,cid,room){ const z=enter(zid,0,0); const c=COURSES.list.find(q=>q.id===cid); const d0=TUE-1; let it=null, G=null; for(let d=d0;d<d0+8&&!it;d++){ const g={day:d,hour:8,zone:zid,flags:{},weekday:CALENDAR.dateOf(d).wd%7}; const q=CLS.dayItems(g).find(x=>x.c.id===cid); if(q){ it=q; G=g; } }
  G.hour=it.t0-0.7; const GM=mkGM(G); CLS.syncRooms(GM,{instant:true}); CROWD.enter(GM,zid); const sts=z.seats.filter(q=>q.room===room); const st=sts[sts.length-1], ap=CROWD.seatSide(E,st); E.player.obj.position.set(ap[0],0,ap[1]);
  for(let m=-41;m<=min;m++){ G.hour=it.t0+m/60; CROWD.tick(GM,2); CLS.syncRooms(GM); if(m<min) arriveAll(); }
  E.player.seat=st; popped=[]; let atSay=null; const pop0=[]; let waitSaid=0; GM.say=async(who,t)=>{ if(t==='（你在座位上等。教室慢慢坐滿了。）'){ waitSaid++; return; }   /* AA_489 第 3 節：轉暗時那一句旁白，不算上課的第一句 */ if(atSay==null){ pop0.push(...popped); atSay={seated:E.npcs.filter(n=>n.clsStudent&&n.seat&&!n.path).length,walking:E.npcs.filter(n=>n.clsStudent&&n.path&&n.path.length).length,teacher:E.npcs.some(n=>n.clsTeacher&&!n.leaving&&!(n.path&&n.path.length)),h:G.hour,faded}; } };   /* pop0：到上課的第一句為止，沒轉暗的時候直接坐在座位上加進來的人 */
  await CLS.attend(GM,it,{inScene:true}); E.player.seat=null; return {it,atSay,popped:popped.slice(),pop0,waitSaid}; }
(async()=>{
  { const r=await attendAt(-25,'boya','chinese_y1','101'); const inView=r.pop0.length;   /* 轉暗以前就出現在座位上的人 */
    check('3. AA_489 第 3 節：提早坐下、轉暗時一句「（你在座位上等。教室慢慢坐滿了。）」，一次',r.waitSaid===1,'說了 '+r.waitSaid+' 次');
    check('3. 開始前 25 分鐘坐下選「上課」：先轉暗、等到上課時間（上課的對話在 09:10 以後）',!!r.atSay&&r.atSay.h>=r.it.t0-1e-6&&!r.atSay.faded,r.atSay&&('對話時 '+CLS.hhmm(r.atSay.h)));
    check('3. 開始前 25 分鐘坐下選「上課」：轉暗以前沒有人出現在座位上；上課的時候同學都坐好了、老師在講台',inView===0&&r.atSay&&r.atSay.seated>=8&&r.atSay.teacher,'轉暗前出現 '+inView+' 人；上課時坐好 '+(r.atSay&&r.atSay.seated)+' 人、老師 '+(r.atSay&&r.atSay.teacher)); }
  { const r=await attendAt(2,'boya','chinese_y1','101'); check('5. AA_489 第 3 節：開始以後才坐下＝沒有那一句（沒有轉暗）',r.waitSaid===0,'說了 '+r.waitSaid+' 次'); const sit=r.pop0.length;
    check('3. 開始後 2 分鐘才坐下上課：沒有人出現在座位上（還沒到的同學從門口走進來）',sit===0&&r.atSay&&r.atSay.seated+r.atSay.walking>=8,'座位上冒出來 '+sit+' 人；坐好 '+(r.atSay&&r.atSay.seated)+'、走進來 '+(r.atSay&&r.atSay.walking)); }
  { const r=await attendAt(-25,'putong','ge_film_y1s1','101');
    check('3. 普通 101（平面教室）開始前 25 分鐘坐下上「電影與敘事」：轉暗以前沒有人出現在座位上，上課時有老師、同學',r.pop0.length===0&&r.atSay&&r.atSay.seated>=5&&r.atSay.teacher,'轉暗前出現 '+r.pop0.length+' 人；坐好 '+(r.atSay&&r.atSay.seated)+'、老師 '+(r.atSay&&r.atSay.teacher)); }
  // ---------- 4. 沒有空位：門口的人走出建築，不在教室門口疊成一團 ----------
  { const z=enter('boya',0,6.5); const G={day:TUE,hour:T0-15/60,zone:'boya',flags:{},weekday:2}; const GM=mkGM(G); CLS.syncRooms(GM,{instant:true}); CROWD.enter(GM,'boya');
    for(const st of z.seats.filter(q=>q.room==='101')) st.taken='full';   /* 位子都被佔了（替身）*/
    const wait=E.npcs.filter(n=>n.crowd===SPOT); const ends=[]; for(let m=-14;m<=1;m++){ G.hour=T0+m/60; CROWD.tick(GM,2); for(const n of wait) if(n.leaving&&n.path&&n.path.length&&!ends.some(e=>e.n===n)){ const p=n.path[n.path.length-1]; ends.push({n,x:p[0],z:p[1]}); } arriveAll(); }   /* 走開的路線（等的時候走一兩步的不算）*/
    const ex=BOYA_LAYOUT.entrance.exit; const atExit=ends.filter(e=>Math.hypot(e.x-ex.x,e.z-(ex.z-0.7))<1.0).length;
    check('4. 101 沒有空位：門口的人走向建築出口（不在教室門口疊成一團）',wait.length>0&&ends.length===wait.length&&atExit===ends.length&&wait.every(n=>n.leaving&&!n.clsStudent),atExit+'／'+wait.length+' 人走向出口');
    for(const st of z.seats) if(st.taken==='full') st.taken=null; }
  // ---------- 5. 霖澤館 201 下課：同學走出去 ----------
  { const z=enter('classroom'); const MON=dayOf('2025-09-22'); const G={day:MON,hour:10,zone:'classroom',flags:{afternoonDone:true},weekday:1}; const GM=mkGM(G); CLS.syncRoom(GM,{instant:true}); const n0=E.npcs.filter(n=>n.clsStudent).length;
    for(let h=10.25;h<=12.25;h+=0.25){ G.hour=h; CLS.syncRoom(GM); } const out=E.npcs.filter(n=>n.leaving&&n.crowd==='cls'&&n.path&&n.path.length);
    check('5. 霖澤館 201 憲法下課（時間正常往前）：同學起身從門口走出去，不是在座位上消失',n0>=8&&out.length>=n0-1&&!E.npcs.some(n=>n.clsStudent),'上課 '+n0+' 人、走出去 '+out.length+' 人'); }
  console.warn=warn0; console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0); })();
