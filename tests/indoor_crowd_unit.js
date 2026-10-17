// 教學館室內的人流（src/crowd3d.js 的室內等候點＋src/classes3d.js 的下課；D55「上課前等候、下課後聊天」「講座前後人潮」「場景隨時間改變」）——不需要瀏覽器。
// 在 Node 建出遊戲真正的共同教學館、博雅教學館，用引擎真正的找路與移動模擬檢查：
//   上課前 20 分鐘：博雅 101 門口有 2～4 個人在等（大一國文；方案 A 之前是共同 101）（站得住、照日期固定）；週末、國定假日沒有；
//   上課開始：他們走進教室、各自找一個空位（不和已經坐著的同學、玩家搶位子），路線走得到、坐下的高度＝那一排；變成那堂課的同學；
//   下課（時間正常往前，不是跳過）：坐著的同學站起來、從座位旁邊走向建築出口（不是瞬間消失）；下課後 10 分鐘門口有人出來聊天；
//   時間跳了（跳過時間、讀檔）：直接移除，不走；
//   博雅 101 的演講（測試資料）：開始前 15 分鐘門口有 3～6 個人、開始時走進去坐下。
// 用法：node tests/indoor_crowd_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(new Error('no fetch in node'));
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/dorm_room_layout.js',
  'src/data/linze_layout.js','src/data/classroom_layout.js','src/building3d.js','src/data/lawlib_layout.js','src/lawlib3d.js','src/data/gongtong_layout.js','src/data/boya_layout.js','src/data/putong_layout.js','src/teach3d.js',
  'src/data/characters.js','src/data/calendar.js','src/data/places.js','src/data/activities.js','src/data/courses.js','src/classes3d.js','src/crowd3d.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(THREE|THREE_JSM|P3|ASSETS|W3|E3|TK|CK|Z3|B3|LL3|TB3|LINZE_LAYOUT|CLASSROOM_LAYOUT|LAWLIB_LAYOUT|GONGTONG_LAYOUT|BOYA_LAYOUT|PUTONG_LAYOUT|CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|CALENDAR|PLACES|ACTIVITIES|COURSES|CLS|CROWD|PROPS|CHAR)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
global.CHAR={build:spec=>{ const g=new THREE.Group(); g.userData.spec=spec; return g; },release(){}}; global.STORY={extraSpec:i=>({id:'x'+i,sex:i%2===0?'f':'m'})};
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
function load(id){ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); E.zone=z; E.levels=z.levels; E.nav=z.nav; if(E.levels) for(const n of E.levels) n._cm=null;
  E.player={obj:{position:new THREE.Vector3(z.spawn.x,0,z.spawn.z),rotation:{y:0}},radius:0.32,lv:0}; E.camera=null; return z; }
/* 引擎的 addNPC／removeNPC 要用到渲染場景（Node 裡沒有）：換成只記錄名單的版本（坐著的放在座位的高度，和引擎一樣）；路線用引擎真正的 moveTo */
E.addNPC=n=>{ n.path=null; n.speed=0; n.pose=n.pose||'idle'; n.radius=0.32; n.lv=n.lv|0; if(n.seat&&n.seat.y!=null) n.obj.position.y=n.seat.y; E.npcs.push(n); return n; }; E.removeNPC=n=>{ E.npcs=E.npcs.filter(m=>m!==n); };
const DAY=86400000, dayOf=s=>{ const [y,m,d]=s.split('-').map(Number); return Math.round((Date.UTC(y,m-1,d)-Date.UTC(2025,8,17))/DAY)+1; };
const TUE=dayOf('2025-09-23'), SAT=dayOf('2025-09-27'), HOL=dayOf('2025-10-10');
const walkTo=(n,x,z,lv)=>E.simWalk(n.obj.position.x,n.obj.position.z,x,z,{lv0:n.lv|0,lv1:lv|0,dt:1/30,speed:1.25});
// ---------- 博雅教學館 101：大一國文（週二 09:10–12:10；AA_103 第 8 節，方案 A 之後在博雅）----------
{ const z=load('boya'); const G={day:TUE,hour:8.92,zone:'boya',flags:{},weekday:2}; const GM={G,E};
  const spot=CROWD.SPOTS.find(s=>s.id==='boya_101'); check('博雅教學館 101 門口的等候點（照配置的 waitSpots）',!!spot&&spot.zone==='boya'&&spot.seatRoom==='101',spot&&spot.label);
  CLS.syncRooms(GM,{instant:true}); CROWD.enter(GM,'boya'); const wait=E.npcs.filter(n=>n.crowd==='boya_101');
  check('08:55（上課前 15 分鐘）：101 門口有 2～4 個人在等、都站得住',wait.length>=2&&wait.length<=4&&wait.every(n=>E.canStand(n.obj.position.x,n.obj.position.z,0.3,0)),wait.length+' 人 '+wait.map(n=>n.obj.position.x.toFixed(1)+','+n.obj.position.z.toFixed(1)).join(' '));
  const pos1=wait.map(n=>n.obj.position.x.toFixed(2)+','+n.obj.position.z.toFixed(2)).join('|'); for(const n of E.npcs.filter(n=>n.crowd)) E.removeNPC(n); CROWD.enter(GM,'boya');
  check('出去再進來（同一個時段）：同一批人、同一些位置',E.npcs.filter(n=>n.crowd==='boya_101').map(n=>n.obj.position.x.toFixed(2)+','+n.obj.position.z.toFixed(2)).join('|')===pos1);
  const seated0=E.npcs.filter(n=>n.clsStudent).length; G.hour=9.0; CROWD.tick(GM,2); G.hour=9.18; CROWD.tick(GM,2);
  const goers=E.npcs.filter(n=>n.clsStudent&&n.path&&n.path.length); const seats=goers.map(n=>n.seat);
  check('09:11（上課開始）：門口的人走進教室、各自找一個空位（不重複、不和坐著的同學搶）',goers.length===wait.length&&new Set(seats).size===seats.length&&seats.every(st=>st.room==='101'&&E.npcs.filter(m=>m.seat===st).length===1),goers.length+' 人走進去；本來坐著 '+seated0+' 人');
  const bad=[]; for(const n of goers){ const st=n.seat, ap=CROWD.seatSide(E,st); const r=walkTo(n,ap[0],ap[1],st.lv|0); if(!r.ok||Math.abs(r.y-st.y)>0.05) bad.push(JSON.stringify(r).slice(0,80)); }
  check('走得到座位旁邊（真的移動模擬）、高度＝那一排的平台',!bad.length,bad.join(' | '));
  for(const n of goers){ const p=n.path[n.path.length-1]; n.obj.position.set(p[0],0,p[1]); n.path=null; if(n.onArrive){ const f=n.onArrive; n.onArrive=null; f(); } }
  check('坐下：姿勢 sit、在座位上、那堂課的同學（clsKey 一樣）',goers.every(n=>n.pose==='sit'&&n.frozen&&Math.abs(n.obj.position.x-n.seat.x)<0.01&&Math.abs(n.obj.position.y-n.seat.y)<0.01&&n.clsKey===TUE+':chinese_y1:am'),goers.map(n=>n.pose+':'+n.clsKey).join(','));   /* 2026-10-16：08:55 教室裡還沒有人坐（AA_137 第 8 節：上課前 10 分鐘起陸續進來），改成直接比那堂課的 key */
  // 下課：時間正常往前（每 15 分鐘同步一次）
  G.hour=12.0; CLS.syncRooms(GM); const n0=E.npcs.filter(n=>n.clsStudent).length; G.hour=12.25; CLS.syncRooms(GM);
  const out=E.npcs.filter(n=>n.crowd==='cls'); check('12:15（下課，時間正常往前）：坐著的 '+n0+' 個同學站起來、走向建築出口（不是瞬間消失）',out.length===n0&&!E.npcs.some(n=>n.clsStudent)&&out.every(n=>n.leaving&&n.path&&n.path.length&&!n.seat),out.length+' 人');
  const okStand=out.every(n=>E.canStand(n.obj.position.x,n.obj.position.z,0.3,n.lv|0)); check('站起來的位置在椅子旁邊、站得住（不在桌椅裡）',okStand);
  const bad2=[]; for(const n of out.slice(0,6)){ const r=walkTo(n,0,6.8,0); if(!r.ok) bad2.push(JSON.stringify(r).slice(0,80)); } check('從座位走得到大廳出口（移動模擬，取 6 個人）',!bad2.length,bad2.join(' | '));
  G.hour=12.17; for(const n of E.npcs.filter(n=>n.crowd)) E.removeNPC(n); CROWD.enter(GM,'boya'); const post=E.npcs.filter(n=>n.crowd==='boya_101');
  check('12:10–12:20：門口有剛下課的人在聊天（2～4 人）',post.length>=2&&post.length<=4,post.length+' 人');
  // 時間跳了：直接移除
  G.hour=9.25; CLS.syncRooms(GM,{instant:true}); const k=E.npcs.filter(n=>n.clsStudent).length; G.hour=12.6; CLS.syncRooms(GM); check('跳過時間（09:15 → 12:36，下一堂 13:20 的同學還沒來）：同學直接移除，不走',k>0&&!E.npcs.some(n=>n.clsStudent||n.crowd==='cls'),k+' → '+E.npcs.filter(n=>n.clsStudent||n.crowd==='cls').length);
  G.day=SAT; G.hour=8.92; for(const n of E.npcs.slice()) E.removeNPC(n); CROWD.enter(GM,'boya'); const sat=E.npcs.filter(n=>n.crowd).length; G.day=HOL; for(const n of E.npcs.slice()) E.removeNPC(n); CROWD.enter(GM,'boya'); const hol=E.npcs.filter(n=>n.crowd).length;
  check('週六、國慶日：教室門口沒有人等',!sat&&!hol,sat+' / '+hol); }
// ---------- 博雅 101：演講（測試資料）----------
{ const z=load('boya'); const LD=dayOf('2025-10-22'); ACTIVITIES.list=[{id:'t_boya',title:'測試演講',kind:'lecture',zone:'boya',room:'101',roomName:'博雅 101',dates:['2025-10-22'],t0:18.5,t1:20.5,crowd:{n:10}}];
  const G={day:LD,hour:18.35,zone:'boya',flags:{},weekday:3}; const GM={G,E}; CLS.syncRooms(GM,{instant:true}); CROWD.enter(GM,'boya'); const w=E.npcs.filter(n=>n.crowd==='boya_101');
  check('博雅 101 演講前 15 分鐘（18:21）：門口有 3～6 個人、站得住',w.length>=3&&w.length<=6&&w.every(n=>E.canStand(n.obj.position.x,n.obj.position.z,0.3,0)),w.length+' 人');
  G.hour=18.45; CROWD.tick(GM,2); G.hour=18.52; CROWD.tick(GM,2); const g=E.npcs.filter(n=>n.clsStudent&&n.path&&n.path.length);
  check('18:31（演講開始）：他們走進去、各自找空位（101 的階梯教室）',g.length===w.length&&g.every(n=>n.seat&&n.seat.room==='101'&&n.seat.kind==='lecture'),g.length+' 人');
  const bad=[]; for(const n of g){ const st=n.seat, ap=CROWD.seatSide(E,st); const r=walkTo(n,ap[0],ap[1],st.lv|0); if(!r.ok||Math.abs(r.y-st.y)>0.05) bad.push(JSON.stringify(r).slice(0,80)); }
  check('走側邊台階到座位那一排（移動模擬、高度對）',!bad.length,bad.join(' | '));
  ACTIVITIES.list=[]; }
// ---------- 坐著上完課（CLS.attend 快轉到下課）之後，下一次 CROWD.tick 不會把走出去的同學一起拿掉（2026-10-13 審查第 2 項）----------
/* 修改前：classes3d.js 的 keepCrowd 只更新自己的時間，crowd3d.js 的 tick 看到時間跳了 3 小時就把 n.crowd 的人（包括正在走出去的同學）全部移除 */
(async()=>{ const z=load('boya'); const G={day:TUE,hour:9.2,zone:'boya',flags:{},weekday:2};
  const GM={G,E,say:async()=>{},choose:async()=>0,fade:async()=>{},advance:h=>{ G.hour+=h; },energy(){},caption(){},sceneBegin(){},sceneEnd(){},autosave(){},setGoal(){},toast(){}};
  CLS.syncRooms(GM,{instant:true}); CROWD.enter(GM,'boya'); CROWD.tick(GM,2);
  const n0=E.npcs.filter(n=>n.clsStudent).length; const it=CLS.dayItems(G).find(q=>q.c.id==='chinese_y1'); await CLS.attend(GM,it,{inScene:true});
  CLS.syncRooms(GM); const walking=E.npcs.filter(n=>n.crowd==='cls').length; CROWD.tick(GM,2); const after=E.npcs.filter(n=>n.crowd==='cls').length;
  check('坐著上完大一國文（快轉到 12:10）：同學站起來走出去；下一次人流更新（CROWD.tick）他們還在走，不是一起消失',n0>=5&&walking>=n0-1&&after===walking,`上課 ${n0} 人、走出去 ${walking}、下一次更新後 ${after}`);
  // 演講開始前幾分鐘坐下選「聽演講」，人流還沒排（每 15 分鐘一次）：快轉前聽眾先坐好，散場時站起來走出去（2026-10-13 批次 3 flow_boya_interior：0 人往外走）
  { for(const n of E.npcs.slice()) E.removeNPC(n); const z2=load('boya'); const LD=dayOf('2025-10-22'); G.day=LD; G.hour=18.4; G.weekday=3;
    const a={id:'t_late',title:'測試演講',kind:'lecture',zone:'boya',room:'101',roomName:'博雅 101',dates:['2025-10-22'],t0:18.5,t1:20.5,crowd:{n:10}}; ACTIVITIES.list=[a];   /* 加了活動、還沒同步（像 18:15 排過一次之後才開放的位子）*/
    const before=E.npcs.filter(n=>n.clsStudent).length; let seatedAtFF=-1; const adv=GM.advance; GM.advance=h=>{ seatedAtFF=E.npcs.filter(n=>n.clsStudent&&n.pose==='sit').length; adv(h); };
    await CLS.attendActivity(GM,a,{inScene:true}); GM.advance=adv;
    CLS.syncRooms(GM); const out=E.npcs.filter(n=>n.leaving&&n.crowd==='cls').length;
    check('演講開始前坐下選「聽演講」（聽眾還沒排進來）：快轉前聽眾已經坐好；散場時站起來往外走（不是沒有人）',before===0&&seatedAtFF>=5&&out>=5,`坐下時 ${before} 人、快轉前坐好 ${seatedAtFF} 人、散場往外走 ${out} 人`);
    ACTIVITIES.list=[]; }
  // ---------- 陸續進來（2026-10-16 修：原本第一次排進來的 2～3 人之後就不再增加）----------
  { const z=load('boya'); const G={day:TUE,hour:9.0,zone:'boya',flags:{},weekday:2}; const GM={G,E}; const cnt=()=>E.npcs.filter(n=>n.clsStudent).length;
    CLS.syncRooms(GM,{instant:true}); const n1=cnt(); G.hour=9.0+5/60; CLS.syncRooms(GM); const n2=cnt();
    const free=z.seats.find(st=>st.room==='101'&&(st.kind==='class'||st.kind==='lecture')&&!E.npcs.some(n=>n.seat===st||n.seatTarget===st)); E.player.seat=free; E.player.lv=free.lv|0;
    G.hour=9.0+9.9/60; CLS.syncRooms(GM); const n3=cnt(); G.hour=9.2; CLS.syncRooms(GM); const n4=cnt(); const seats=E.npcs.filter(n=>n.clsStudent).map(n=>n.seat||n.seatTarget);
    check('09:00 → 09:05 → 09:10 → 09:12：101 的同學每次同步都補到那個時間該有的人數（15% → 約一半 → 約八成 → 坐滿名額），不會停在第一批',n1>=1&&n2>n1&&n3>n2&&n4>=n3&&n4>=8,[n1,n2,n3,n4].join(' → '));
    check('補進來的人不坐玩家坐著的位子、也不重複坐同一個位子',!seats.some(st=>st===free||Math.hypot(st.x-free.x,st.z-free.z)<0.35)&&new Set(seats).size===seats.length);
    E.player.seat=null; }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0); })();
