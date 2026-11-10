// 校園步道的路緣不能橫在別條步道上（CAMPUS-FLOOR-STRIP-1110，LAWWW2-B 2026-11-10；使用者試玩截圖 docs/handoff/user_shots/1110_campus_floor_strip.webp：
//   「路上有奇怪的地磚? 畫面中間 人物左前方」——晚上 18:25 騎腳踏車在 (29.88, −54.4)，石磚步道上斜斜幾條浮起來的長條）——不需要瀏覽器（D131）。
// 原因：zones3d.js 的 curb() 照整條路放路緣（0.25 × 0.14 m 的石條），碰到別條步道也不斷開：x 30 南北向、z −60 東西向兩條 10 m 步道的 T 字路口，
//   東西向的路緣從 x 30（南北向步道的正中間）開始、南北向東側的路緣橫過東西向的路口；大道、z 47 那條路的路緣也橫過幾個步道口。
//   1. 截圖那一帶（x 22～40、z −70～−45）：路緣的頂面沒有落在別條步道裡面
//   2. 整個校園：路緣的頂面落在步道裡面（離步道邊 > 5 cm）的面積＝0
//   3. 路緣還在：大道、南北向、東西向、z 47 那條路兩側，不是路口的地方都還有路緣（不是整條拿掉）
// 修改前 FAIL（1、2）。用法：node tests/campus_curb_gap_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/dorm_room_layout.js','src/data/socsci_layout.js',
  'src/data/linze_layout.js','src/data/classroom_layout.js','src/building3d.js','src/data/wancai_layout.js','src/wancai3d.js','src/data/library_layout.js','src/library3d.js','src/library_hall_v2.js','src/data/lawlib_layout.js','src/lawlib3d.js','src/data/gongtong_layout.js','src/data/boya_layout.js','src/data/putong_layout.js','src/teach3d.js',
  'src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/courses.js','src/data/activities.js','src/classes3d.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(THREE|THREE_JSM|P3|ASSETS|W3|E3|TK|CK|Z3|B3|WC3|LB3|LL3|LINZE_LAYOUT|CLASSROOM_LAYOUT|WANCAI_LAYOUT|LIBRARY_LAYOUT|LAWLIB_LAYOUT|GONGTONG_LAYOUT|BOYA_LAYOUT|PUTONG_LAYOUT|TB3|ACTIVITIES|CALENDAR|PLACES|CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|COURSES|CLS|PROPS|CHAR)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(new Error('no fetch in node')); console.warn=()=>{};
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'}; E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null;
const z=Z3.ZONES.campus.build(E); z.group.updateMatrixWorld(true);
// 步道：y 0.02 的水平平面（strip()）；記中心、方向、寬、長
const strips=[]; z.group.traverse(o=>{ if(!o.isMesh) return; const g=o.geometry, p=g.parameters||{};
  if(g.type==='PlaneGeometry'&&Math.abs(o.position.y-0.02)<1e-6&&Math.abs(o.rotation.x+Math.PI/2)<1e-6){ const ang=o.rotation.z; strips.push({cx:o.position.x,cz:o.position.z,w:p.width,len:p.height,ux:-Math.sin(ang),uz:Math.cos(ang)}); } });
const depth=(x,zz)=>{ let d=-1e9; for(const s of strips){ const dx=x-s.cx, dz=zz-s.cz, al=dx*s.ux+dz*s.uz, ac=-dx*s.uz+dz*s.ux; d=Math.max(d,Math.min(s.len/2-Math.abs(al),s.w/2-Math.abs(ac))); } return d; };
// 路緣：#d9d3c6、整個網格不超過 15 cm 高的東西；取頂面（y ≈ 0.14、朝上）的三角形
const curbs=[], tops=[]; const v=new THREE.Vector3(), a=new THREE.Vector3(), b=new THREE.Vector3(), c=new THREE.Vector3();
z.group.traverse(o=>{ if(!o.isMesh||!o.material||Array.isArray(o.material)||!o.material.color||o.material.color.getHexString()!=='d9d3c6') return;
  const bb=new THREE.Box3().setFromObject(o); if(bb.max.y>0.15||bb.min.y<-0.01) return; curbs.push(o);
  const P=o.geometry.attributes.position, I=o.geometry.index, n=I?I.count:P.count;
  for(let k=0;k<n;k+=3){ const ia=I?I.getX(k):k, ib=I?I.getX(k+1):k+1, ic=I?I.getX(k+2):k+2;
    a.fromBufferAttribute(P,ia).applyMatrix4(o.matrixWorld); b.fromBufferAttribute(P,ib).applyMatrix4(o.matrixWorld); c.fromBufferAttribute(P,ic).applyMatrix4(o.matrixWorld);
    if(Math.abs(a.y-0.14)>0.005||Math.abs(b.y-0.14)>0.005||Math.abs(c.y-0.14)>0.005) continue; tops.push([a.clone(),b.clone(),c.clone()]); } });
// 每個頂面三角形取點（每 0.004 m² 一點，低差異數列），算落在步道裡面（深 > 5 cm）的面積
const inArea=(box)=>{ let area=0, where=[]; for(const [p,q,r] of tops){ const A=Math.abs((q.x-p.x)*(r.z-p.z)-(r.x-p.x)*(q.z-p.z))/2; const n=Math.max(8,Math.ceil(A/0.004)); let hit=0;
    for(let i=0;i<n;i++){ let u=((i+0.5)*0.6180339887)%1, w=((i+0.5)*0.7548776662)%1; if(u+w>1){ u=1-u; w=1-w; } const x=p.x+u*(q.x-p.x)+w*(r.x-p.x), zz=p.z+u*(q.z-p.z)+w*(r.z-p.z);
      if(box&&!(x>=box[0]&&x<=box[1]&&zz>=box[2]&&zz<=box[3])) continue; if(depth(x,zz)>0.05){ hit++; if(where.length<4&&(!where.length||Math.hypot(where[where.length-1][0]-x,where[where.length-1][1]-zz)>3)) where.push([+x.toFixed(1),+zz.toFixed(1)]); } }
    area+=A*hit/n; } return {area, where}; };
check('0. 找得到步道、路緣', strips.length>=10&&tops.length>=10, '步道 '+strips.length+' 條、路緣 '+curbs.length+' 個網格（頂面 '+tops.length+' 個三角形）');
const r1=inArea([22,40,-70,-45]); check('1. 截圖那一帶（x 22～40、z −70～−45）路緣不在步道上', r1.area<0.01, '路緣頂面在步道裡面 '+r1.area.toFixed(2)+' m²'+(r1.where.length?'，例如 '+JSON.stringify(r1.where):''));
const r2=inArea(null); check('2. 整個校園的路緣都不橫在步道上', r2.area<0.01, '路緣頂面在步道裡面 '+r2.area.toFixed(2)+' m²（0.25 m 寬，約 '+(r2.area/0.25).toFixed(1)+' m 長）'+(r2.where.length?'，例如 '+JSON.stringify(r2.where):''));
// 3. 路緣還在（從上往下打，打得到路緣的頂面）：不是路口的地方
const rc=new THREE.Raycaster(), dn=new THREE.Vector3(0,-1,0);
const spots=[['大道北側 x 0',0,-8.12],['大道南側 x 0',0,8.12],['大道北側 x −80',-80,-8.12],['南北向步道西側 z −30',24.88,-30],['南北向步道東側 z −30',35.12,-30],
  ['東西向步道北側 x 60',60,-54.88],['東西向步道南側 x 60',60,-65.12],['z 47 那條路北側 x −50',-50,42.38],['z 47 那條路南側 x −50',-50,51.62]];
const miss=spots.filter(([n,x,zz])=>{ rc.set(new THREE.Vector3(x,1,zz),dn); rc.far=2; return !rc.intersectObjects(curbs,false).length; }).map(s=>s[0]);
check('3. 不是路口的地方路緣還在（'+spots.length+' 個點）', !miss.length, miss.length?'沒有路緣：'+miss.join('、'):'');
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
