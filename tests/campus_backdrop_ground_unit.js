// 校園外圍的柏油不墊在整個校園底下（PERF-PATROL-ECON-1025，LAWWW2-B 2026-10-25；LAWWW-B 同意 ⑤）——不需要瀏覽器。
//   zones3d.js 的校園背景（campusBackdrop）原本先鋪一片 820 m 見方的柏油（y −0.06）當城市的地面，整個校園的草地、路面、外圍草地都疊在它上面：
//   同一個地方畫兩層（和美國社區草地墊在馬路底下同一類，US-COMMUNITY-WEST-PERF-1025）。改成柏油只鋪在沒有被蓋住的地方（形狀挖洞），看起來一樣。
//   1. 找得到外圍打底的柏油、蓋在上面的地面；2. 柏油不和上面的地面重疊；3. 原本柏油那一片沒有破洞（每一點都還有地面）。
// 修改前 FAIL。用法：node tests/campus_backdrop_ground_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/dorm_room_layout.js','src/data/socsci_layout.js',
  'src/data/linze_layout.js','src/data/classroom_layout.js','src/building3d.js','src/data/wancai_layout.js','src/wancai3d.js','src/data/library_layout.js','src/library3d.js','src/data/lawlib_layout.js','src/lawlib3d.js','src/data/gongtong_layout.js','src/data/boya_layout.js','src/data/putong_layout.js','src/teach3d.js',
  'src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/courses.js','src/data/activities.js','src/classes3d.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(THREE|THREE_JSM|P3|ASSETS|W3|E3|TK|CK|Z3|B3|WC3|LB3|LL3|LINZE_LAYOUT|CLASSROOM_LAYOUT|WANCAI_LAYOUT|LIBRARY_LAYOUT|LAWLIB_LAYOUT|GONGTONG_LAYOUT|BOYA_LAYOUT|PUTONG_LAYOUT|TB3|ACTIVITIES|CALENDAR|PLACES|CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|COURSES|CLS|PROPS|CHAR)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(new Error('no fetch in node'));
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'}; E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null;
const z=Z3.ZONES.campus.build(E); z.group.updateMatrixWorld(true);
// 地面：水平（所有頂點同一個高度）、不透明的網格，世界座標的三角形（xz）
const flat=[]; const v=new THREE.Vector3();
z.group.traverse(o=>{ if(!o.isMesh||!o.geometry) return; const m=o.material; if(!m||Array.isArray(m)||m.transparent||m.visible===false) return;
  const g=o.geometry, P=g.attributes.position, I=g.index; const ys=[]; const pts=[]; for(let i=0;i<P.count;i++){ v.fromBufferAttribute(P,i).applyMatrix4(o.matrixWorld); ys.push(v.y); pts.push([v.x,v.z]); }
  if(Math.max(...ys)-Math.min(...ys)>1e-3) return; const tris=[]; const n=I?I.count:P.count; for(let k=0;k<n;k+=3){ const a=I?I.getX(k):k, b=I?I.getX(k+1):k+1, c=I?I.getX(k+2):k+2; tris.push([pts[a],pts[b],pts[c]]); }
  let bd=false; for(let p=o;p;p=p.parent) if(p.name==='campusBackdrop') bd=true;
  flat.push({y:ys[0], asphalt:!!(m.map&&m.map.userData&&m.map.userData.asphalt), bd, tris, box:[Math.min(...pts.map(p=>p[0])),Math.max(...pts.map(p=>p[0])),Math.min(...pts.map(p=>p[1])),Math.max(...pts.map(p=>p[1]))]}); });
const inTri=(x,z,[a,b,c])=>{ const d=(p,q)=>(x-q[0])*(p[1]-q[1])-(p[0]-q[0])*(z-q[1]); const d1=d(a,b), d2=d(b,c), d3=d(c,a); return !((d1<0||d2<0||d3<0)&&(d1>0||d2>0||d3>0)); };
const hit=(L,x,z)=>L.some(f=>x>=f.box[0]-1e-6&&x<=f.box[1]+1e-6&&z>=f.box[2]-1e-6&&z<=f.box[3]+1e-6&&f.tris.some(t=>inTri(x,z,t)));
const base=flat.filter(f=>f.bd&&f.asphalt&&Math.abs(f.y+0.06)<0.005);   // 校園外圍打底的柏油（y −0.06）
const cover=flat.filter(f=>f.y>-0.05&&f.y<0.03&&!(f.bd&&f.asphalt&&Math.abs(f.y+0.06)<0.005));   // 蓋在上面的地面（草地、石材、路面；不透明）
const grass=cover.filter(f=>f.y<=0.001);   // 整片的地面：校園的草地（y 0、−0.002、−0.003）、外圍的草地（−0.035）；人行道、路面（0.012～0.02）是窄條，照舊鋪在城市的柏油上
check('1. 找得到外圍打底的柏油、蓋在上面的地面', base.length>0&&cover.length>20, base.length+' 片、'+cover.length+' 片');
// 2. 柏油不墊在草地、路面底下：每 2 m 取一點（錯開格線，不落在邊上），兩邊都有的點數 × 4 m²
let both=0, total=0; for(let x=-409.37;x<410;x+=2) for(let zz=-429.37;zz<390;zz+=2){ if(!hit(base,x,zz)) continue; total++; if(hit(grass,x,zz)) both++; }
check('2. 外圍柏油不墊在校園、外圍草地底下（重疊 < 50 m²；'+grass.length+' 片整片的地面）', both*4<50, '重疊約 '+(both*4)+' m²；柏油約 '+(total*4)+' m²');
// 3. 原本 820 m 見方那一片，每一點都還有地面（柏油或上面的地面）：沒有破洞
let holes=[]; for(let x=-407.13;x<410;x+=5) for(let zz=-427.13;zz<390;zz+=5){ if(!hit(base,x,zz)&&!hit(cover,x,zz)) holes.push([+x.toFixed(0),+zz.toFixed(0)]); }
check('3. 原本柏油那一片沒有破洞（每 5 m 一點）', !holes.length, holes.length?holes.length+' 點沒有地面，例如 '+JSON.stringify(holes.slice(0,6)):'');
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
