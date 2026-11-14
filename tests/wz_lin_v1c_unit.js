/* 林家乾麵 v1c（溫州街 A4，區域 wz_lin；WZ-SHOPS1-1104，AA_654：BB〔帳號 A〕11-04 照使用者的參考圖重做，LAWWW2-C 11-05 收件）：不需要瀏覽器，在 Node 裡建出遊戲真正的區域，
   用引擎真正的找路＋移動碰撞（E.simWalk）走：
   ① 新配置生效：lin_layout.js 載入以後 WZ_SHOPS_LAYOUT.lin＝LIN_LAYOUT（v2、模型 bb_support/lin_interior.glb）；門、出口、出生點、enterAt 和舊的一樣
   ② 進來的位置站得住（和舊配置一樣在「離開林家乾麵」的範圍裡：先將就）
   ③ 12 個位子（四張方桌各兩張木椅＋一張紅凳；左欄兩張紅凳在煮麵台旁的窄縫、玩家走不到，npcOnly）：10 個「坐下」都從門口走得到「坐下」的範圍（seat_reach 的標準）；桌號照舊（明軒「門口那桌」＝桌 1，在前排）
   ④ 4 個互動點（點餐、菜單…）走得到
   ⑤ 正式模型的牆：attachRoomGLB 之後每一塊 WALL_ 都朝房間裡（tests/wall_dir_inherit_unit.js 同一套；這裡確認 lin 的 GLB 就是 v1c）
   用法：node tests/wz_lin_v1c_unit.js */
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
process.on('unhandledRejection',()=>{});   // 正式模型在 node 裡載不到（fetch 相對網址），不影響導航
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/data/wz_park_layout.js','src/data/wz_shops_layout.js','src/data/lin_layout.js','src/zones3d.js',
  'src/data/calendar.js','src/data/places.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'  '+info:'')); if(!ok) fails++; };
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
function loadZone(id){ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(E.levels) for(const n of E.levels) n._cm=null; if(E.nav) E.nav._cm=null; E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0}; return z; }
const walk=(a,b)=>{ for(const [dt,speed] of [[1/30,undefined],[0.1,undefined],[1/30,4.1],[0.1,4.1]]){ const r=E.simWalk(a[0],a[1],b[0],b[1],{lv0:0,lv1:0,dt,speed}); if(!r.ok) return Object.assign({dt:+dt.toFixed(3),speed:speed||'walk'},r); } return {ok:true}; };
const stand=(x,z)=>E.canStand(x,z,0.3,0);
// 座位的走近點（GAME.seatApproach 的候選：seat.ap 優先，其他照前後左右）
const seatAps=s=>{ const out=[]; if(s.ap) out.push(s.ap); const fx=Math.sin(s.yaw), fz=Math.cos(s.yaw); for(const [dx,dz] of [[fx*0.5,fz*0.5],[-fx*0.6,-fz*0.6],[fz*0.55,-fx*0.55],[-fz*0.55,fx*0.55],[-fx*0.7,-fz*0.7],[fx*0.8,fz*0.8]]) out.push([s.x+dx,s.z+dz]); return out.filter(a=>stand(a[0],a[1])); };

const L=WZ_SHOPS_LAYOUT.lin;
check('① lin_layout.js 載入以後 WZ_SHOPS_LAYOUT.lin＝LIN_LAYOUT（v2、bb_support/lin_interior.glb、檔案在）',typeof LIN_LAYOUT!=='undefined'&&L===LIN_LAYOUT&&L.version===2&&/bb_support\/lin_interior\.glb$/.test(L.glb)&&fs.existsSync(path.join(ROOT,L.glb)),L&&L.glb);
check('① 門、出口、出生點、enterAt 和舊的一樣（溫州街那邊不用動）',L.front.door.x===1&&L.exit.at.x===1&&L.exit.at.z===3.55&&L.spawn.x===1&&L.spawn.z===3.05&&L.enterAt.x===35&&L.enterAt.z===4.6&&L.exit.spawn.x===35&&L.exit.spawn.z===4.1);
const z=loadZone('wz_lin'), IN=[z.spawn.x,z.spawn.z], ex=E.interactables.find(q=>q.exit&&q.exit.to==='wenzhou');
/* 進來的位置離「離開林家乾麵」0.5 m、在它的範圍（1.3）裡：舊配置就是這樣（BB 照舊沿用；一進門就看得到「離開」的按鈕，往裡走 0.8 m 就消失）——先將就，記在 README，這裡只檢查站得住 */
check('② 進來的位置站得住（出生點、出口和舊配置一樣）',stand(...IN)&&!!ex,`(${IN.join(', ')})，離出口 ${ex?Math.hypot(IN[0]-ex.x,IN[1]-ex.z).toFixed(2):'—'} m（範圍 ${ex?ex.radius:'—'}；舊配置一樣，先將就）`);
/* 座位：和 tests/seat_reach_unit.js 同一個標準——走得到「坐下」按鈕的範圍裡、站得住的地方（椅子本身是導航阻擋；GAME.seatApproach 的固定候選點在這種擠的桌椅之間常常都站不住，
   舊配置用那個標準也是 10 個都 FAIL，所以不用）*/
{ const seats=E.interactables.filter(q=>q.seat), bad=[]; for(const q of seats){ const R=(q.radius||0.8)-0.05; let ok=false; for(let r=0.3;r<=R&&!ok;r+=0.1) for(let a=0;a<6.28&&!ok;a+=0.26){ const x=q.x+Math.cos(a)*r, zz=q.z+Math.sin(a)*r; if(stand(x,zz)&&walk(IN,[x,zz]).ok) ok=true; } if(!ok) bad.push(`${q.label}(${q.seat.x},${q.seat.z})`); }
  check(`③ ${seats.length} 個「坐下」（12 個位子，左欄兩張紅凳 npcOnly）都從門口走得到「坐下」的範圍`,seats.length===10&&L.seats.length===12&&L.seats.filter(q=>q.npcOnly).length===2&&!bad.length,bad.join('｜'));
  const T=L.tables||[], t1=T.find(t=>t.n===1), zmax=Math.max(...T.map(t=>t.z));
  check('③ 桌號照舊：桌 1 在前排（靠街那一排；明軒「他坐在門口那桌」，shop_enc，BB 對照表）',!!t1&&t1.z>=zmax-0.4&&L.seats.filter(q=>q.table===1).length===3&&L.seats.filter(q=>q.table===1&&!q.npcOnly).length===2,t1?`桌 1 (${t1.x}, ${t1.z})、前排 z ≥ ${(zmax-0.4).toFixed(1)}`:''); }
{ const pts=L.interact||[], bad=[]; for(const q of pts){ let ok=false; for(let r=0;r<=0.9&&!ok;r+=0.1) for(let a=0;a<6.28&&!ok;a+=0.39){ const x=q.x+Math.cos(a)*r, zz=q.z+Math.sin(a)*r; if(stand(x,zz)&&walk(IN,[x,zz]).ok) ok=true; } if(!ok) bad.push(q.kind||q.label); }
  check(`④ ${pts.length} 個互動點都走得到`,pts.length===4&&!bad.length,bad.join('、')); }
{ const b=fs.readFileSync(path.join(ROOT,L.glb)), jl=b.readUInt32LE(12), J=JSON.parse(b.slice(20,20+jl).toString()); let tris=0; for(const m of J.meshes) for(const p of m.primitives){ const a=J.accessors[p.indices]; tris+=a?a.count/3:0; }
  check('⑤ 正式模型是 v1c（26,029 三角形、12 材質，BB README）',tris===26029&&J.materials.length===12,`${tris} 三角形、${J.materials.length} 材質`); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
