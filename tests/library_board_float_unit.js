// 總圖大廳的「樓層簡介」只有一塊、不浮在半空（LIB-BOARD-FLOAT-1110，使用者 2026-11-10 X296「總圖公告有兩個 一個漂浮」；截圖 docs/handoff/user_shots/1110_library_board_float.webp）——不需要瀏覽器（D131）。
// 原因：第二版大廳（library_hall_v2.js）借用第一版的 LB3.buildFurniture，第一版那一塊樓層簡介（掛在核心書架上，(−3.2, 1.6, −0.48)）也被放進來；
//   第二版沒有那座核心書架＝那一塊浮在半空，旁邊還有第二版自己的立牌（L.directory，有架子），「看樓層簡介」也有兩個。
// 檢查（在 Node 建出遊戲真正的總圖大廳）：
//   1 「看樓層簡介」的互動點只有一個，在第二版立牌前面（L.directory）
//   2 寫著樓層簡介的看板（canvas lbboard／lbboard2 的平面）只有一塊，是第二版的 lbboard2
// 修改前 1、2 FAIL。用法：node tests/library_board_float_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(new Error('no fetch in node'));
const _warn=console.warn; console.warn=(...a)=>{ if(/正式模型載入失敗/.test(String(a[0]))) return; _warn(...a); };
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/socsci_layout.js','src/data/linze_layout.js','src/data/classroom_layout.js','src/building3d.js','src/data/library_layout.js','src/library3d.js','src/library_hall_v2.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'}; E.ray=E.ray||new THREE.Raycaster();
E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null;
{ const lo=ASSETS.loadOne; ASSETS.loadOne=function(k){ if(k==='bldg.library_interior'||k==='bldg.library_hall_v2') return Promise.reject(new Error('node')); return lo.apply(this,arguments); }; }
const L=LIBRARY_LAYOUT;
if(L.version!==2){ check('總圖大廳是第二版（LIB-INTERIOR-1102）', false, 'version '+L.version); console.log('FAILED '+fails); process.exit(1); }
const z=Z3.ZONES.library_hall.build(E); E.zone=z; E.levels=z.levels; E.nav=z.nav; for(const n of E.levels) n._cm=null;
const D=L.directory, its=E.interactables.filter(i=>i.label==='看樓層簡介');
check('1. 「看樓層簡介」只有一個，在第二版立牌前面',!!D&&its.length===1&&Math.abs(its[0].x-D.x)<0.01&&Math.abs(its[0].z-(D.z+0.9))<0.01,JSON.stringify(its.map(i=>[i.x,i.z])));
const boards=[]; z.group.traverse(o=>{ if(!o.isMesh||!o.material||!o.material.map||!o.geometry||o.geometry.type!=='PlaneGeometry') return; const pr=o.geometry.parameters||{}; if(Math.abs(pr.width-1.8)>1e-6||Math.abs(pr.height-0.9)>1e-6) return; const w=new THREE.Vector3(); o.getWorldPosition(w); if(Math.abs(w.y-1.6)>0.05) return; boards.push([+w.x.toFixed(2),+w.y.toFixed(2),+w.z.toFixed(2)]); });   /* 樓層簡介的字是 1.8×0.9 的平面、離地 1.6 m（兩版一樣）*/
check('2. 寫著樓層簡介的看板只有一塊，在第二版立牌的位置（不是第一版掛在核心書架的 (−3.2, −0.48)）',!!D&&boards.length===1&&Math.abs(boards[0][0]-D.x)<0.01&&Math.abs(boards[0][2]-(D.z+0.032))<0.01,JSON.stringify(boards));
console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
