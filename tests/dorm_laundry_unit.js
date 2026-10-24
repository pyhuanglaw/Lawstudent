// 宿舍 1F 洗衣間（AA_399 第 11 節；LAWWW-B 10-24 任務 #82 第五間；LAWWW2-B 2026-10-24）——不需要瀏覽器。
//   1. 區域、正式模型登記了（Z3.ZONES.dorm_laundry、bldg.dorm_laundry）
//   2. 宿舍 1F 走廊的「洗衣間」門變成出入口（rooms_glb3d.js 照 host_door 設 d.to；沒有開放時段＝一直開）：只有「進入 洗衣間」、落點＝配置的 spawn
//   3. 其他門（寢室、舍監室、側門、盥洗室）照舊是門上的字
//   4. 「離開洗衣間」回到走廊、洗衣間門前面（back_spawn＝門的互動點，lv 0），站得住
//   5. 引擎真正的導航（E.simWalk）：長椅三個位子（走近點）、洗衣機、烘衣機、使用須知、失物招領、出口都從門口走得到；spots 站得住
// 修改前：沒有 dorm_laundry（第 1 項就失敗）。用法：node tests/dorm_laundry_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
const GAME_G={v:{day:30,hour:20,flags:{},stage:'law'}}; global.GAME={get G(){ return GAME_G.v; }};
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/socsci_layout.js','src/data/linze_layout.js','src/data/classroom_layout.js','src/building3d.js','src/data/wancai_layout.js','src/wancai3d.js','src/data/library_layout.js','src/library3d.js','src/data/dorm_layout.js','src/data/dorm_room_layout.js','src/dorm3d.js',
  'src/data/calendar.js','src/data/room_glb_layouts.js','src/rooms_glb3d.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
function loadZone(id){ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(E.levels) for(const n of E.levels) n._cm=null; E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0}; return z; }

const L=typeof ROOM_GLB_LAYOUTS!=='undefined'?ROOM_GLB_LAYOUTS.dorm_laundry:null;
check('1. 區域、正式模型登記了（dorm_laundry、bldg.dorm_laundry）', !!L&&!!Z3.ZONES.dorm_laundry&&!!ASSETS.manifest['bldg.dorm_laundry']&&/dorm_laundry\.glb$/.test(ASSETS.manifest['bldg.dorm_laundry'].url));
if(fails){ console.log('FAILED '+fails); process.exit(1); }
const D=DORM_LAYOUT.doors.find(d=>d.id==='laundry');
check('2. 配置：洗衣間的門接到 dorm_laundry（d.to、沒有時段）', D.to==='dorm_laundry'&&!D.gate&&!!D.spawn, JSON.stringify({to:D.to,gate:D.gate}));
// 3. 宿舍走廊
{ loadZone('dorm_hall'); const its=E.interactables.filter(i=>Math.abs(i.x-L.back_spawn.x)<0.01&&Math.abs(i.z-L.back_spawn.z)<0.01&&(i.lv|0)===0); const vis=its.filter(i=>!i.hidden);
  check('2. 走廊上洗衣間的門只有「進入 洗衣間」（back_spawn＝門的互動點）', vis.length===1&&vis[0].label==='進入 洗衣間'&&vis[0].exit&&vis[0].exit.to==='dorm_laundry', vis.map(i=>i.label).join('、'));
  const en=vis[0]; check('2. 進去的落點＝配置的 spawn', !!en&&Math.abs(en.exit.spawn.x-L.spawn.x)<1e-6&&Math.abs(en.exit.spawn.z-L.spawn.z)<1e-6);
  const others=DORM_LAYOUT.doors.filter(d=>d.id!=='laundry'&&!d.to).map(d=>E.interactables.find(i=>i.label===d.label&&(i.lv|0)===(d.lv|0)));
  check('3. 其他門照舊是門上的字（look）', others.length>0&&others.every(i=>!!i&&!!i.look&&!i.exit&&!i.hidden), others.filter(i=>!i||!i.look).length+' 個不對');
  check('4. 回走廊的落點（back_spawn，lv 0）站得住', L.back_spawn.lv===0&&E.canStand(L.back_spawn.x,L.back_spawn.z,0.3,0), JSON.stringify(L.back_spawn)); }
// 5. 洗衣間裡面
{ const z=loadZone('dorm_laundry'); if(E.fitSeatRadius) E.fitSeatRadius(); const sp=[z.spawn.x,z.spawn.z];
  const walk=(a,b)=>E.simWalk(a[0],a[1],b[0],b[1],{lv0:0,lv1:0,dt:0.1,speed:4.1});
  const reachNear=(x,zz,r)=>{ for(let rr=0;rr<=r;rr+=0.2) for(let k=0;k<12;k++){ const px=x+rr*Math.cos(k*Math.PI/6), pz=zz+rr*Math.sin(k*Math.PI/6); if(E.canStand(px,pz,0.3,0)&&walk(sp,[px,pz]).ok) return true; } return false; };
  const bad=[]; L.seats.forEach((s,k)=>{ const tg=s.ap; if(!(tg&&E.canStand(tg[0],tg[1],0.3,0)&&walk(sp,tg).ok)) bad.push('長椅 '+k); });
  for(const q of L.interact) if(!reachNear(q.x,q.z,q.r)) bad.push(q.label);
  if(!reachNear(L.exits[0].x,L.exits[0].z,L.exits[0].r)) bad.push('出口');
  check('5. 長椅三個位子、洗衣機、烘衣機、使用須知、失物招領、出口都從門口走得到', L.seats.length===3&&!bad.length, bad.join('、'));
  const ex=E.interactables.find(i=>i.exit&&i.exit.to==='dorm_hall'); check('4. 「離開洗衣間」的落點＝back_spawn', !!ex&&ex.exit.spawn&&ex.exit.spawn.lv===0&&Math.abs(ex.exit.spawn.x-L.back_spawn.x)<1e-6&&Math.abs(ex.exit.spawn.z-L.back_spawn.z)<1e-6, ex&&JSON.stringify(ex.exit.spawn));
  const S=L.spots, st=[S.wash,S.kai_stand,S.player]; check('5. 洗衣服、阿凱、玩家站的位置站得住、走得到', st.every(p=>E.canStand(p.x,p.z,0.05,0)&&reachNear(p.x,p.z,0.4)));
  check('5. 阿凱坐的位置是長椅的一個位子', L.seats.some(s=>Math.abs(s.x-S.kai.x)<1e-6&&Math.abs(s.z-S.kai.z)<1e-6)); }
console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
