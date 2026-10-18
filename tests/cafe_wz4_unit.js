// 兩點半 Café ART-WZ4（LAWWW2-B patches/cafe_wz4.md）：四人長方桌兩端加位子、吧檯座 ×4、角落沙發 ×3；沙發、矮桌、立燈、傘桶擋住——不需要瀏覽器。
// 檢查：座位 8 → 17（只增不減、原本的位置不動）；每個新座位旁邊站得住、從門口走得到；門口到吧檯點餐、離開的路沒被擋；沙發有互動點。用法：node tests/cafe_wz4_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/dorm_room_layout.js',
  'src/data/linze_layout.js','src/data/classroom_layout.js','src/building3d.js','src/data/wancai_layout.js','src/wancai3d.js','src/data/library_layout.js','src/library3d.js','src/data/lawlib_layout.js','src/lawlib3d.js','src/data/socsci_layout.js','src/data/soclib_layout.js','src/soclib3d.js',
  'src/data/wz_park_layout.js','src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/courses.js','src/classes3d.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(THREE|THREE_JSM|P3|ASSETS|W3|E3|TK|CK|Z3|B3|WC3|LB3|LL3|SL3|LINZE_LAYOUT|CLASSROOM_LAYOUT|WANCAI_LAYOUT|LIBRARY_LAYOUT|LAWLIB_LAYOUT|SOCLIB_LAYOUT|SOCSCI_LAYOUT|WZ_PARK_LAYOUT|CALENDAR|PLACES|CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|COURSES|CLS|PROPS|CHAR)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); }
process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(new Error('no fetch'));
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES.cafe.build(E); E.zone=z; E.levels=null; E.nav=z.nav; E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0};
const S=z.seats, has=(x,zz)=>S.some(q=>Math.abs(q.x-x)<1e-6&&Math.abs(q.z-zz)<1e-6);
const OLD=[[4.5,-3.3],[4.5,-1.7],[4.5,0.7],[4.5,2.3],[0,0.7],[0,2.3],[-4,1.7],[-4,3.3]], NEW=[[-0.85,1.5],[0.85,1.5],[-4.5,-3.3],[-2.9,-3.3],[-1.3,-3.3],[0.3,-3.3],[-5.95,2.85],[-5.95,3.4],[-5.95,3.95]];
check('1. 座位 8 → 17：原本的 8 個位置不動，加四人桌兩端、吧檯座 4、沙發 3',S.length===17&&OLD.every(p=>has(p[0],p[1]))&&NEW.every(p=>has(p[0],p[1])),S.length+' 個');
const sp=[z.spawn.x,z.spawn.z]; const walk=(a,b)=>E.simWalk(a[0],a[1],b[0],b[1],{lv0:0,lv1:0,dt:0.1,speed:1.25});
const near=(x,zz,R)=>{ const pts=[]; for(let dx=-R;dx<=R+1e-9;dx+=0.1) for(let dz=-R;dz<=R+1e-9;dz+=0.1){ if(dx*dx+dz*dz>R*R) continue; if(E.canStand(x+dx,zz+dz,0.32,0)) pts.push([x+dx,zz+dz]); } pts.sort((a,b)=>Math.hypot(a[0]-x,a[1]-zz)-Math.hypot(b[0]-x,b[1]-zz)); for(const q of pts.slice(0,40)) if(walk(sp,q).ok) return q; return null; };
const apOf=(x,zz)=>{ const q=S.find(q=>Math.abs(q.x-x)<1e-6&&Math.abs(q.z-zz)<1e-6); return q&&q.ap; };
const bad=NEW.filter(p=>{ const ap=apOf(p[0],p[1]); if(ap) return !(E.canStand(ap[0],ap[1],0.32,0)&&walk(sp,ap).ok&&Math.hypot(ap[0]-p[0],ap[1]-p[1])<1.4); return !near(p[0],p[1],0.9); });
check('2. 每個新座位旁邊站得住、從門口走得到（沙發前面是矮桌：從指定的走近點 ap，1.4 m 內）',!bad.length,bad.map(p=>p.join(',')).join(' '));
check('2. 沙發的三個位子都有走近點；CROWD.seatSide、GAME.seatApproach 會先用它',NEW.slice(6).every(p=>!!apOf(p[0],p[1]))&&/if\(st\.ap&&E\.canStand/.test(fs.readFileSync(path.join(ROOT,'src/crowd3d.js'),'utf8'))&&/seat\.ap\?\[\[seat\.ap\[0\]-seat\.x/.test(fs.readFileSync(path.join(ROOT,'src/game3d.js'),'utf8')));
const it=k=>E.interactables.find(i=>i.label===k); const ord=it('到吧檯點餐'), ex=it('離開咖啡廳'), so=it('坐在角落的沙發');
check('3. 門口 → 吧檯點餐、→ 離開咖啡廳 走得到（傘桶不擋門）',!!ord&&!!near(ord.x,ord.z,1.5)&&!!ex&&!!near(ex.x,ex.z,1.5));
check('4. 沙發有互動點「坐在角落的沙發」、範圍內站得住、走得到',!!so&&!!near(so.x,so.z,1.05));
check('5. 沙發、矮桌、立燈、傘桶擋住',!E.canStand(-6.35,3.4,0.1,0)&&!E.canStand(-5.3,3.4,0.1,0)&&!E.canStand(-6.55,4.85,0.05,0)&&!E.canStand(-1.05,5.15,0.05,0));
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
