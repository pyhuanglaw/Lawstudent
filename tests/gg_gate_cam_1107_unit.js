// 公館校門口往後走鏡頭不轉（CAM-GONGGUAN-GATE-1107，LAWWW-B 11-07 16:13 派工，LAWWW2-B 修）——不需要瀏覽器（D131）。
// CC 以玩家試玩（BB_255 第 8 件後半，截圖 cc-testing docs/story_planning/CC/shots/play1107_8b_gongguan_gate_camera.png，8/30 07:51「去公館買缺的東西」）：
//   鏡頭在羅斯福路那一側、看著校門，人往鏡頭走（往南、去店那邊）——店在鏡頭後面，一路看不到要去的地方。
// 原因：手機「地點」的「公館商圈」（src/data/places.js；回家出門、約完人放回來的地方也是這一點）和公館區域的預設落點都是 (0,−30) yaw π＝面向校門。
//   進區域時鏡頭在人背後（cam.yaw＝spawn.yaw＋π）→ 鏡頭在南邊、看北邊的校門；店（南邊騎樓，店門 z 約 21）在鏡頭後面，要去店裡只能拉搖桿往後走。
//   跟隨鏡頭本來就不會跟著人轉（只有貼著隔間牆時 autoSwing 會轉開），所以一路都是往鏡頭走。
// 做法：落點的方向改成面向南邊的店（yaw 0）：鏡頭在背後、校門那一側，推搖桿往前就是往店走。位置不動（tests/quick_travel_unit.js 驗過站得住）。
// 檢查（在 Node 建出遊戲真正的公館區域）：
//   ① 「公館商圈」落點：推搖桿往前（畫面的前方）的方向，和落點到最近的店門的方向差 45° 以內——修改前差 180° 左右
//   ② 公館區域的預設落點和「公館商圈」同一點、同一個方向
//   ③ 落點的跟隨鏡頭沒有被擋（退滿 4.8 m），在人背後（校門那一側），不在校門的門房、門柱裡
//   ④ 從落點推搖桿往前一直走到騎樓（z 15），每 0.5 m 都站得住（不會一推就撞到東西）
//   ⑤ 公館其他落點（捷運公館站）不變
// 用法：node tests/gg_gate_cam_1107_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(new Error('no fetch in node'));
const _warn=console.warn; console.warn=(...a)=>{ if(/載入失敗|LOD|Missing/.test(String(a[0]))) return; _warn(...a); };
const src0=fs.readFileSync(path.join(ROOT,'tests/nav_buildings_unit.js'),'utf8'); const files=eval(src0.match(/const files=(\[[^\]]*\])/)[1]);
for(const f of files.concat(['src/data/places.js'].filter(f=>!files.includes(f)))){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'}; E.ray=E.ray||new THREE.Raycaster(); E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.extras=[];
global.GAME={G:{zone:'gongguan',day:10,hour:14,flags:{},weather:'clear',visited:{}}};
const z=Z3.ZONES.gongguan.build(E); E.zone=z; E.levels=z.levels; E.nav=z.nav; E.scene.add(z.group); E.scene.updateMatrixWorld(true);
E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0};
const QL=PLACES.quickList().filter(p=>p&&p[0]==='gongguan'), GG=QL.find(p=>p[1]==='公館商圈'), MRT=QL.find(p=>p[1]==='捷運公館站');
if(!GG){ check('手機「地點」有「公館商圈」', false); console.log('FAILED '+fails); process.exit(1); }
const sp=GG[2], camYaw=(sp.yaw||0)+Math.PI;   /* E.enterZone：cam.yaw＝spawn.yaw＋π */
const fwd={x:-Math.sin(camYaw), z:-Math.cos(camYaw)};   /* 推搖桿往前＝畫面的前方（engine3d.js：鏡頭在 (sin yaw, cos yaw) 那一側，前是 (−sin yaw, −cos yaw)）*/
const doors=E.interactables.filter(i=>/^進入/.test(i.label||'')&&i.exit);
const nearest=doors.map(d=>({d, r:Math.hypot(d.x-sp.x,d.z-sp.z)})).sort((a,b)=>a.r-b.r)[0];
{ const d=nearest&&nearest.d, dx=d?d.x-sp.x:0, dz=d?d.z-sp.z:0, ang=d?Math.acos((fwd.x*dx+fwd.z*dz)/Math.hypot(dx,dz))*180/Math.PI:999;
  check('① 「公館商圈」落點：推搖桿往前的方向和最近的店門差 45° 以內（店在畫面前方，不是在鏡頭後面）', !!d&&ang<=45,
    `落點 (${sp.x},${sp.z}) yaw ${(+sp.yaw).toFixed(2)}；往前 (${fwd.x.toFixed(2)},${fwd.z.toFixed(2)})；最近的店門「${d?d.label:'—'}」(${d?d.x.toFixed(1):''},${d?d.z.toFixed(1):''}) 差 ${ang.toFixed(0)}°`); }
{ const zs=z.spawn||Z3.ZONES.gongguan.spawn||{};
  check('② 公館區域的預設落點和「公館商圈」同一點、同一個方向', zs.x===sp.x&&zs.z===sp.z&&Math.abs((zs.yaw||0)-(sp.yaw||0))<1e-6, JSON.stringify(zs)); }
{ const t=new THREE.Vector3(sp.x,1.45,sp.z), out=new THREE.Vector3(); const r=E.followCam(t,camYaw,0.38,4.8,0,out);
  const gateZ=-46, behindGateSide=out.z<sp.z;   /* 校門在 z −46：鏡頭在人和校門之間 */
  check('③ 落點的跟隨鏡頭退滿 4.8 m（沒被擋）、在人背後的校門那一側、離門房還有距離', r.dist>=4.79&&!r.inner&&behindGateSide&&out.z>gateZ+2.5,
    `鏡頭 (${out.toArray().map(v=>v.toFixed(2)).join(', ')})、退 ${r.dist.toFixed(2)} m`); }
{ let ok=true, bad=null, n=0; for(let s=0.5; ; s+=0.5){ const x=sp.x+fwd.x*s, zz=sp.z+fwd.z*s; if(zz>=15||zz<=-60||n>200) break; n++; if(!E.canStand(x,zz,0.32,0)){ ok=false; bad=[x.toFixed(1),zz.toFixed(1)]; break; } }
  check('④ 從落點推搖桿往前一直走到騎樓（z 15），每 0.5 m 都站得住', ok&&n>20, ok?`${n} 步`:`(${bad}) 站不住`); }
check('⑤ 「捷運公館站」落點不變（(−35.6, 13.2) yaw 0）', !!MRT&&MRT[2].x===-35.6&&MRT[2].z===13.2&&MRT[2].yaw===0, MRT?JSON.stringify(MRT[2]):'—');
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
