// 總圖 2F 多媒體中心（AA_399 第 12 節；LAWWW-B 10-24 任務 #82 第六間；LAWWW2-B 2026-10-24）——不需要瀏覽器。
//   1. 區域、正式模型登記了（Z3.ZONES.library_media、bldg.library_media）
//   2. 總圖 2F 的「多媒體中心」門變成出入口（rooms_glb3d.js 照 host_door 設 d.to；沒有時段）：只有「進入 多媒體中心」、落點＝配置的 spawn
//   3. 研究小間、館員辦公室的門照舊
//   4. 回大廳的落點＝門的互動點（lv 1）、站得住；「離開多媒體中心」用的就是它
//   5. 引擎真正的導航（E.simWalk）：13 個座位、服務台、影片架、團體視聽室的門、出口；spots
//   6. 單人座的人面向螢幕
// 「看一部片」在裡面的服務台：tests/aa399_closed2_unit.js 第 3b 項。修改前：沒有 library_media（第 1 項就失敗）。用法：node tests/library_media_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
const GAME_G={v:{day:200,hour:14,flags:{},stage:'law'}}; global.GAME={get G(){ return GAME_G.v; }};
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/socsci_layout.js','src/data/linze_layout.js','src/data/classroom_layout.js','src/building3d.js','src/data/wancai_layout.js','src/wancai3d.js','src/data/library_layout.js','src/library3d.js','src/data/dorm_layout.js','src/data/dorm_room_layout.js','src/dorm3d.js',
  'src/data/library_upper_layouts.js','src/library_upper3d.js','src/data/calendar.js','src/data/room_glb_layouts.js','src/rooms_glb3d.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
function loadZone(id){ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(E.levels) for(const n of E.levels) n._cm=null; E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0}; return z; }

const L=typeof ROOM_GLB_LAYOUTS!=='undefined'?ROOM_GLB_LAYOUTS.library_media:null;
check('1. 區域、正式模型登記了（library_media、bldg.library_media）', !!L&&!!Z3.ZONES.library_media&&!!ASSETS.manifest['bldg.library_media']&&/library_media\.glb$/.test(ASSETS.manifest['bldg.library_media'].url));
if(fails){ console.log('FAILED '+fails); process.exit(1); }
const D=LIBRARY_LAYOUT.doors.find(d=>d.id==='media');
check('2. 配置：多媒體中心的門接到 library_media（d.to、沒有時段：總圖開館的時候都開）', D.to==='library_media'&&!D.gate&&!!D.spawn, JSON.stringify({to:D.to,gate:D.gate}));
{ loadZone('library_hall'); const B=L.back_spawn; const its=E.interactables.filter(i=>Math.abs(i.x-B.x)<0.01&&Math.abs(i.z-B.z)<0.01&&(i.lv|0)===1); const vis=its.filter(i=>!i.hidden);
  check('2. 總圖 2F 的門只有「進入 多媒體中心」（back_spawn＝門的互動點）', vis.length===1&&vis[0].label==='進入 多媒體中心'&&vis[0].exit&&vis[0].exit.to==='library_media', vis.map(i=>i.label).join('、'));
  const en=vis[0]; check('2. 進去的落點＝配置的 spawn', !!en&&Math.abs(en.exit.spawn.x-L.spawn.x)<1e-6&&Math.abs(en.exit.spawn.z-L.spawn.z)<1e-6);
  const C=LIBRARY_LAYOUT.doors.find(d=>d.id==='carrels'), ci=E.interactables.find(i=>i.label===C.label&&i.exit);
  check('3. 研究小間的門照舊（落點＝研究小間的門廳）', !!ci&&ci.exit.to==='library_carrels'&&Math.abs(ci.exit.spawn.x-LIBRARY_UPPER_LAYOUTS.carrels.spawn.x)<1e-6);
  const S=LIBRARY_LAYOUT.doors.find(d=>d.id==='staff'), si=E.interactables.find(i=>i.label===S.label);
  check('3. 館員辦公室的門照舊是門上的字', !!si&&si.look===S.closed&&!si.exit);
  check('4. 回大廳的落點（back_spawn，lv 1）站得住', B.lv===1&&E.canStand(B.x,B.z,0.3,1), JSON.stringify(B)); }
{ const z=loadZone('library_media'); if(E.fitSeatRadius) E.fitSeatRadius(); const sp=[z.spawn.x,z.spawn.z];
  const walk=(a,b)=>E.simWalk(a[0],a[1],b[0],b[1],{lv0:0,lv1:0,dt:0.1,speed:4.1});
  const reachNear=(x,zz,r)=>{ for(let rr=0;rr<=r;rr+=0.2) for(let k=0;k<12;k++){ const px=x+rr*Math.cos(k*Math.PI/6), pz=zz+rr*Math.sin(k*Math.PI/6); if(E.canStand(px,pz,0.3,0)&&walk(sp,[px,pz]).ok) return true; } return false; };
  const bad=[]; L.seats.forEach((s,k)=>{ const tg=s.ap; if(!(tg&&E.canStand(tg[0],tg[1],0.3,0)&&walk(sp,tg).ok)) bad.push('座位 '+k); });
  for(const q of L.interact) if(!reachNear(q.x,q.z,q.r)) bad.push(q.label);
  if(!reachNear(L.exits[0].x,L.exits[0].z,L.exits[0].r)) bad.push('出口');
  check('5. 13 個座位（單人 9、雙人 4）、服務台、影片架、團體視聽室的門、出口都從門口走得到', L.seats.length===13&&!bad.length, bad.join('、'));
  const ex=E.interactables.find(i=>i.exit&&i.exit.to==='library_hall'); check('4. 「離開多媒體中心」的落點＝back_spawn', !!ex&&ex.exit.spawn&&ex.exit.spawn.lv===1&&Math.abs(ex.exit.spawn.x-L.back_spawn.x)<1e-6&&Math.abs(ex.exit.spawn.z-L.back_spawn.z)<1e-6);
  const S=L.spots; check('5. 芷若坐的是西牆中間那個單人座', L.seats.some(s=>Math.abs(s.x-S.zhiruo.x)<1e-6&&Math.abs(s.z-S.zhiruo.z)<1e-6));
  check('5. 玩家站在服務台前面、站得住、走得到；服務台的互動點就在那裡', E.canStand(S.player.x,S.player.z,0.05,0)&&reachNear(S.player.x,S.player.z,0.4)&&L.interact.some(q=>q.label==='多媒體服務台'&&Math.hypot(q.x-S.player.x,q.z-S.player.z)<0.3));
  check('5. 館員在服務台後面（玩家走不到）', !reachNear(S.staff.x,S.staff.z,0.2));
  const seatYawOk=L.seats.filter(s=>s.uses&&s.uses[0]==='看片').every(s=>{ const f=[Math.sin(s.yaw),Math.cos(s.yaw)]; const t=[s.table[0]-s.x,s.table[1]-s.z]; return f[0]*t[0]+f[1]*t[1]>0; });
  check('6. 單人座的人面向桌子（螢幕）', seatYawOk); }
console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
