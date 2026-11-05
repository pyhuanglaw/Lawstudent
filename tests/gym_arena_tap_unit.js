// 新體育館 3F 主球場：點看台的落點（GYM-ARENA-TAP-1105，LAWWW2-C 11-05）——不需要瀏覽器。
// 點地移動是 E.screenToFloor：區域有 zone.walkMeshes 就打那幾片，沒有就退回 y 0 的平面。看台最上面一排 5.2 m，退回 y 0 時點走道、座位會落到看台後面（和南洋 1 廳斜地板同一個問題，CC-C 13700be8f）。
// ① 每一面看台一片可點面（缺口兩邊分開）② 點八條走道的第 2、6、10 排：落點差 ≤ 0.5 m ③ 點場地照舊 ④ 可點面的高度＝碰撞用的斜面。
// 修改前（gym3d.js 沒有 walkMeshes）：① ② ④ FAIL。用法：node tests/gym_arena_tap_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/dorm_room_layout.js',
  'src/data/linze_layout.js','src/data/classroom_layout.js','src/building3d.js','src/data/wancai_layout.js','src/wancai3d.js','src/data/library_layout.js','src/library3d.js','src/library_hall_v2.js','src/data/lawlib_layout.js','src/lawlib3d.js','src/data/socsci_layout.js','src/data/soclib_layout.js','src/soclib3d.js',
  'src/data/wz_park_layout.js','src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/courses.js','src/classes3d.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(THREE|THREE_JSM|P3|ASSETS|W3|E3|TK|CK|Z3|B3|WC3|LB3|LL3|SL3|LINZE_LAYOUT|CLASSROOM_LAYOUT|WANCAI_LAYOUT|LIBRARY_LAYOUT|LAWLIB_LAYOUT|SOCLIB_LAYOUT|SOCSCI_LAYOUT|WZ_PARK_LAYOUT|CALENDAR|PLACES|CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|COURSES|CLS|PROPS|CHAR)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); }
process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(new Error('no fetch'));
for(const f of ['src/data/gym_layout.js','src/gym3d.js']) vm.runInThisContext(fs.readFileSync(path.join(ROOT,f),'utf8').replace(/^const (GYM_LAYOUT|GY3)\s*=/mg,'global.$1='),{filename:f});
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'}; E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[];
const z=Z3.ZONES.gym_arena.build(E); E.zone=z; E.nav=z.nav; const A=GYM_LAYOUT.arena, G=GY3.arenaGeo(A); z.group.updateMatrixWorld(true);
const wm=z.walkMeshes||[], nSeg=G.sides.reduce((n,s)=>n+(s.gap?2:1),0);
check(`① 看台有可以點的面（每一面看台、缺口兩邊分開：${nSeg} 片），都是第 0 層`,wm.length===nSeg&&wm.every(m=>(m.userData.walkLv|0)===0),`${wm.length} 片`);
/* E.screenToFloor 的算法（engine3d.js）：先打 walkMeshes，打不到就用 y 0 的平面 */
function tapAt(cam,tgt){ const ray=new THREE.Raycaster(cam.clone(),tgt.clone().sub(cam).normalize()); ray.near=0; ray.far=Infinity;
  if(wm.length){ const hits=ray.intersectObjects(wm,false); if(hits.length) return hits[0].point; }
  const pl=new THREE.Plane(new THREE.Vector3(0,1,0),0), hit=new THREE.Vector3(); return ray.ray.intersectPlane(pl,hit)?hit:null; }
/* 每一條走道：鏡頭在場地上、離走道前緣 6 m、高 4 m（跟隨鏡頭大約的高度）往看台看；點走道第 2、6、10 排（碰撞用的高度 cont）。另外點場地中間（打不到看台、落在 y 0） */
const rows=[], bad=[];
for(const s of G.sides) for(const c of s.aisles) for(const r of [1,5,9]){ const d=r*G.T+G.T/2, [tx,tz]=s.at(c,d), [cx,cz]=s.at(c,-6), cam=new THREE.Vector3(cx,4.0,cz), t=new THREE.Vector3(tx,G.cont(d),tz), h=tapAt(cam,t);
  const e=h?Math.hypot(h.x-t.x,h.z-t.z):99; if(!(e<=0.5)) bad.push(`${s.side} ${c} 第 ${r+1} 排 差 ${e.toFixed(2)}`); rows.push(e); }
check(`② 點看台走道（${rows.length} 個點：每條走道第 2、6、10 排）：落點水平差 ≤ 0.5 m`,!bad.length,bad.length?bad.slice(0,6).join('；'):`最大差 ${Math.max(...rows).toFixed(2)} m`);
{ const cam=new THREE.Vector3(0,6,14), bad2=[]; for(const [x,zz] of [[0,-2],[-10,-10],[10,8]]){ const h=tapAt(cam,new THREE.Vector3(x,0,zz)); if(!h||Math.hypot(h.x-x,h.z-zz)>0.05||Math.abs(h.y)>0.02) bad2.push(`(${x},${zz})`); }
  check('③ 點場地（看台前面）：照舊落在 y 0 的地板、位置不變',!bad2.length,bad2.join(' ')); }
{ const s=G.sides[0], c=s.aisles[1], at=d=>{ const [x,zz]=s.at(c,d), r=new THREE.Raycaster(new THREE.Vector3(x,20,zz),new THREE.Vector3(0,-1,0)), h=r.intersectObjects(wm,false); return h.length?h[0].point.y-0.01:null; };
  const pts=[0.5,3,6,G.DEPTH-0.5], bad3=pts.filter(d=>{ const y=at(d); return y==null||Math.abs(y-G.cont(d))>0.02; });
  check('④ 可點面的高度＝碰撞用的連續斜面（最上面 '+G.TOP.toFixed(2)+' m）',!bad3.length,pts.map(d=>`d ${d.toFixed(1)}：${(at(d)??NaN).toFixed(2)}／${G.cont(d).toFixed(2)}`).join('；')); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
