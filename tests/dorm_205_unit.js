// 宿舍 205：方奕廷的房間（AA_399 第 11 節；LAWWW-B 10-24 任務 #82 第五間；LAWWW2-B 2026-10-24）——不需要瀏覽器。
//   1. 區域、正式模型登記了（Z3.ZONES.dorm_205、bldg.dorm_205；模型＝dorm_room4.py --only 205）
//   2. 開放時段（Z3.roomGlbOpen）：大一（2025-09-01～2026-06-30）21～23；他不在（characters.js absentDates：寒假回台中）不開
//   3. 宿舍 2F 走廊的 205 門：時段內只有「敲門（205）」、其他時間照舊「205 寢室」（門關著）；洗衣間的門不受影響
//   4. 回走廊的落點＝門的互動點（lv 1）、站得住
//   5. 引擎真正的導航（E.simWalk）：椅子、看東西的點（書桌、窗台）、出口從門口走得到；spots 站得住
//   6. 和祐廷的房間同一型：camBox（鏡頭只在中間走道）、seeThru、導航阻擋同一組
// 修改前：沒有 dorm_205（第 1 項就失敗）。用法：node tests/dorm_205_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
const GAME_G={v:{day:30,hour:20,flags:{},stage:'law'}}; global.GAME={get G(){ return GAME_G.v; }};
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/socsci_layout.js','src/data/linze_layout.js','src/data/classroom_layout.js','src/building3d.js','src/data/wancai_layout.js','src/wancai3d.js','src/data/library_layout.js','src/library3d.js','src/data/dorm_layout.js','src/data/dorm_room_layout.js','src/dorm3d.js',
  'src/data/calendar.js','src/data/characters.js','src/data/room_glb_layouts.js','src/rooms_glb3d.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CALENDAR|CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|ROOM_GLB_LAYOUTS|DORM_LAYOUT|DORM_ROOM|THREE|THREE_JSM|P3|ASSETS|W3|E3|TK|CK|Z3|B3|WC3|LB3|DM3|SOCSCI_LAYOUT|LINZE_LAYOUT|CLASSROOM_LAYOUT|WANCAI_LAYOUT|LIBRARY_LAYOUT)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
function loadZone(id){ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(E.levels) for(const n of E.levels) n._cm=null; E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0}; return z; }

const L=typeof ROOM_GLB_LAYOUTS!=='undefined'?ROOM_GLB_LAYOUTS.dorm_205:null;
check('1. 區域、正式模型登記了（dorm_205、bldg.dorm_205）', !!L&&!!Z3.ZONES.dorm_205&&!!ASSETS.manifest['bldg.dorm_205']&&/dorm_205\.glb$/.test(ASSETS.manifest['bldg.dorm_205'].url));
if(fails){ console.log('FAILED '+fails); process.exit(1); }
const DAY=key=>{ for(let d=-400;d<3000;d++) if(CALENDAR.dateOf(d).key===key) return d; return null; };
const G=(day,hour)=>({day,hour,flags:{},stage:'law'}); const op=(k,h)=>Z3.roomGlbOpen('dorm_205',G(DAY(k),h));
check('2. 大一的晚上 21～23 開（2025-10-15 21:00、22:30；2026-05-20 22:00）', op('2025-10-15',21)&&op('2025-10-15',22.5)&&op('2026-05-20',22));
check('2. 同一天 20:30、23:00、中午關', !op('2025-10-15',20.5)&&!op('2025-10-15',23)&&!op('2025-10-15',12));
check('2. 他回台中過年（2026-01-24～02-18）關、2026-02-19 回來了開', !op('2026-01-24',22)&&!op('2026-02-10',22)&&!op('2026-02-18',22)&&op('2026-02-19',22));
check('2. 大一以外（2025-08-30、2026-07-02、2026-10-15）關', !op('2025-08-30',22)&&!op('2026-07-02',22)&&!op('2026-10-15',22));
const D=DORM_LAYOUT.doors.find(d=>d.id==='r205');
check('3. 配置：205 的門接到 dorm_205（d.to、有時段 d.gate、門上的字留著）', D.to==='dorm_205'&&D.gate==='dorm_205'&&!!D.closed, JSON.stringify({to:D.to,gate:D.gate}));
{ const day=DAY('2025-10-15'); GAME_G.v=G(day,22); loadZone('dorm_hall'); const B=L.back_spawn;
  const its=E.interactables.filter(i=>Math.abs(i.x-B.x)<0.01&&Math.abs(i.z-B.z)<0.01&&(i.lv|0)===1); const vis=()=>its.filter(i=>!i.hidden).map(i=>i.label);
  const a=vis(); GAME_G.v=G(day,20); const b=vis(); GAME_G.v=G(DAY('2026-10-15'),22); const c=vis();
  check('3. 21～23 只有「敲門（205）」', a.length===1&&a[0]==='敲門（205）', a.join('、'));
  check('3. 其他時間、大二只有原本的「205 寢室」（門關著）', b.length===1&&b[0]===D.label&&c.length===1&&c[0]===D.label&&its.find(i=>i.label===D.label).look===D.closed, b.join('、')+'／'+c.join('、'));
  const en=its.find(i=>i.exit); check('3. 進去的落點＝配置的 spawn', !!en&&en.exit.to==='dorm_205'&&Math.abs(en.exit.spawn.x-L.spawn.x)<1e-6&&Math.abs(en.exit.spawn.z-L.spawn.z)<1e-6);
  check('4. 回走廊的落點（back_spawn，lv 1）＝門的互動點、站得住', its.length===2&&B.lv===1&&E.canStand(B.x,B.z,0.3,1), JSON.stringify(B));
  const lau=E.interactables.find(i=>i.exit&&i.exit.to==='dorm_laundry'); check('3. 洗衣間的門照舊是出入口（一直開）', !!lau&&!lau.hidden); }
{ GAME_G.v=G(DAY('2025-10-15'),22); const z=loadZone('dorm_205'); if(E.fitSeatRadius) E.fitSeatRadius(); const sp=[z.spawn.x,z.spawn.z];
  const walk=(a,b)=>E.simWalk(a[0],a[1],b[0],b[1],{lv0:0,lv1:0,dt:0.1,speed:4.1});
  const reachNear=(x,zz,r)=>{ for(let rr=0;rr<=r;rr+=0.2) for(let k=0;k<12;k++){ const px=x+rr*Math.cos(k*Math.PI/6), pz=zz+rr*Math.sin(k*Math.PI/6); if(E.canStand(px,pz,0.3,0)&&walk(sp,[px,pz]).ok) return true; } return false; };
  const bad=[]; L.seats.forEach((s,k)=>{ const tg=s.ap; if(!(tg&&E.canStand(tg[0],tg[1],0.3,0)&&walk(sp,tg).ok)) bad.push('椅子 '+k); });
  for(const q of L.interact) if(!reachNear(q.x,q.z,q.r)) bad.push(q.label);
  if(!reachNear(L.exits[0].x,L.exits[0].z,L.exits[0].r)) bad.push('出口');
  check('5. 椅子、方奕廷的書桌、窗台、出口都從門口走得到', !bad.length, bad.join('、'));
  const ex=E.interactables.find(i=>i.exit&&i.exit.to==='dorm_hall'); check('4. 「離開 205」的落點＝back_spawn', !!ex&&ex.exit.spawn&&ex.exit.spawn.lv===1&&Math.abs(ex.exit.spawn.x-L.back_spawn.x)<1e-6&&Math.abs(ex.exit.spawn.z-L.back_spawn.z)<1e-6);
  const S=L.spots; check('5. 方奕廷站在窗台前、玩家的位置站得住、走得到', [S.fang_stand,S.player].every(p=>E.canStand(p.x,p.z,0.05,0)&&reachNear(p.x,p.z,0.4)));
  const u=DORM_ROOM.units.find(q=>q.id==='R1'); check('5. 方奕廷坐的是 R1 的書桌椅（和祐廷房間的配置同一個位置）', Math.abs(S.fang.x-u.seat.x)<1e-6&&Math.abs(S.fang.z-u.seat.z)<1e-6);
  check('6. 鏡頭只在中間走道（camBox）、上鋪網點透空（seeThru）', !!z.camBox&&z.camBox.x[0]===-1.6&&z.camBox.x[1]===1.6&&z.seeThru===true);
  const DB=DORM_ROOM.blocks.map(b=>b.id).sort().join(','), LB=L.blocks.map(b=>b.why).sort().join(','); check('6. 導航阻擋和祐廷的房間同一組（四組床桌、鞋櫃、垃圾桶、曬衣架、洗手間）', DB===LB, LB); }
console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
