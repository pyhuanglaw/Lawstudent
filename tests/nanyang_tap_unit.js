/* 南洋戲院 1 廳：點斜地板的落點（NANYANG-HALL-WALKMESH-1105，LAWWW2-C 11-05；CC-C 13700be8f 量到、BB-C／LAWWW-C 05:3x 轉來：擋玩）——不需要瀏覽器。
   點地移動是 E.screenToFloor：區域有 zone.walkMeshes 就打那幾片，沒有就退回「玩家那一層的地板高度（y 0）」那個平面。
   1 廳的地板從門口 y 0 往舞台斜到 −0.96：退回 y 0 平面時，點越前面偏越多（點 z −4.6 走到 −1.19，差 3.41 m；手機玩家只能點地，前排坐不到）。
   這裡照 E.screenToFloor 的算法（先打 walkMeshes，打不到才用 y 0 平面），從門口的鏡頭位置往右邊走道上幾個點打：
   ① 有 walkMeshes（門口平的、斜面、舞台前平的三片），都標 walkLv 0
   ② 點 z 2、0、−2、−4.6（右邊走道 x 3.65，地板高度照配置的 floorY）：落點和點的位置水平差 ≤ 0.5 m、高度差 ≤ 0.05 m
   ③ 三片的高度和導航格一樣（門口 0、斜面中間、舞台前 −0.96）
   修改前（nanyang3d.js 沒有 walkMeshes）：① FAIL，② 差 0.67／1.45／2.38／3.41 m FAIL。用法：node tests/nanyang_tap_unit.js */
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
process.on('unhandledRejection',()=>{});
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js',
  'src/data/calendar.js','src/data/places.js','src/data/xinsheng_layout.js','src/xinsheng3d.js','src/data/nanyang_layout.js','src/nanyang3d.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'  '+info:'')); if(!ok) fails++; };
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'}; E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[];
const z=Z3.ZONES.xs_nanyang_hall.build(E); E.zone=z; E.nav=z.nav; const L=NANYANG_LAYOUT.hall, sl=L.slope;
z.group.updateMatrixWorld(true);
const wm=z.walkMeshes||[];
check('① 1 廳有可以點的地面（zone.walkMeshes）三片、都是第 0 層',wm.length===3&&wm.every(m=>(m.userData.walkLv|0)===0),`${wm.length} 片`);
/* E.screenToFloor 的算法（engine3d.js）：先打 walkMeshes（看得到的），打不到就用玩家那一層的地板高度（y0）那個平面 */
function tapAt(cam,tgt){ const ray=new THREE.Raycaster(cam.clone(),tgt.clone().sub(cam).normalize()); ray.near=0; ray.far=Infinity;
  if(wm.length){ const hits=ray.intersectObjects(wm,false); if(hits.length) return hits[0].point; }
  const pl=new THREE.Plane(new THREE.Vector3(0,1,0),-(z.nav.y0||0)), hit=new THREE.Vector3(); return ray.ray.intersectPlane(pl,hit)?hit:null; }
const fy=zz=>z.nav.heightAt?z.nav.heightAt(3.65,zz):L.floorY(zz);
const cam=new THREE.Vector3(3.65,2.9,7.4);   /* 門口那一側、玩家身後 4.4 m 的跟隨鏡頭大約的位置（右邊走道 x 3.65）*/
const rows=[], bad=[]; for(const zz of [2.0,0,-2.0,-4.6]){ const t=new THREE.Vector3(3.65,fy(zz),zz), h=tapAt(cam,t); const d=h?Math.hypot(h.x-t.x,h.z-t.z):99, dy=h?Math.abs(h.y-t.y):99; rows.push(`z ${zz} → ${h?h.z.toFixed(2):'—'}（差 ${d.toFixed(2)} m）`); if(!(d<=0.5&&dy<=0.05)) bad.push(zz); }
check('② 點右邊走道 z 2、0、−2、−4.6：落點水平差 ≤ 0.5 m、高度差 ≤ 0.05 m',!bad.length,rows.join('；'));
{ const at=(x,zz)=>{ const r=new THREE.Raycaster(new THREE.Vector3(x,5,zz),new THREE.Vector3(0,-1,0)); const h=r.intersectObjects(wm,false); return h.length?h[0].point.y:null; };
  const pts=[[0,6],[0,(sl.z0+sl.z1)/2],[0,-5],[2,sl.z0-1],[-2,sl.z1+1]], bad2=pts.filter(([x,zz])=>{ const y=at(x,zz); return y==null||Math.abs(y-0.01-fy(zz))>0.02; });
  check('③ 三片的高度和導航格一樣（門口 0、斜面、舞台前 −0.96）',!bad2.length,pts.map(([x,zz])=>{ const y=at(x,zz); return `z ${zz.toFixed(2)}：${y==null?'—':(y-0.01).toFixed(2)}／${fy(zz).toFixed(2)}`; }).join('；')); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
