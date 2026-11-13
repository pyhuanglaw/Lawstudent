const fs=require('fs'), vm=require('vm'), path=require('path'); const ROOT=process.argv[2];
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
process.on('unhandledRejection',()=>{}); console.warn=()=>{};
const html=fs.readFileSync(path.join(ROOT,'index.html'),'utf8'); const srcs=[...html.matchAll(/<script src="([^"]+)"/g)].map(m=>m[1].split('?')[0]);
const want=srcs.filter(f=>/^lib\/three|^src\/(people3d|assets3d|world3d|engine3d|townkit3d|campuskit3d|zones3d)\.js$|^src\/data\/[a-z0-9_]*layout\.js$/.test(f));
const order=['lib/three.bundle.js','lib/three.jsm.bundle.js'].concat(want.filter(f=>/^src\/data/.test(f))).concat(['src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js']);
for(const f of order){ try{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }catch(e){ console.log('skip',f,e.message.slice(0,80)); } }
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'}; E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[];
const _t=TK.tree, _p=TK.royalPalm; const ALL=[];
TK.tree=function(h,seed,o){ const g=_t.apply(this,arguments); const oo=o||{}; const DK=oo.dark||1; g.userData._rec={sp:oo.sp||(DK<=0.75?'banyan':'camphor'),h:h||7}; ALL.push(g); return g; };
TK.royalPalm=function(h,seed,o){ const g=_p.apply(this,arguments); g.userData._rec={sp:'palm',h:h||12}; ALL.push(g); return g; };
const z=Z3.ZONES.gongguan.build(E); z.group.updateMatrixWorld(true); const L=[];
const inScene=new Set(); z.group.traverse(o=>inScene.add(o)); let orphan=0; ALL.forEach(o=>{ const r=o.userData._rec; if(!inScene.has(o)){ orphan++; let p=o; const wp=o.position.clone(); while(p.parent){ p=p.parent; wp.applyMatrix4(p.matrix); } L.push({x:+wp.x.toFixed(2),z:+wp.z.toFixed(2),sp:r.sp,h:+(r.h*o.scale.y).toFixed(2),ry:+o.rotation.y.toFixed(3),merged:1}); return; } const p=new THREE.Vector3(); o.getWorldPosition(p); const q=new THREE.Quaternion(); o.getWorldQuaternion(q); const e=new THREE.Euler().setFromQuaternion(q,'YXZ'); const sc=new THREE.Vector3(); o.getWorldScale(sc); L.push({x:+p.x.toFixed(2),z:+p.z.toFixed(2),sp:r.sp,h:+(r.h*sc.y).toFixed(2),ry:+e.y.toFixed(3)}); }); console.log('orphan',orphan,'all',ALL.length);
fs.writeFileSync(process.argv[3],JSON.stringify(L));
const by={}; for(const t of L){ by[t.sp]=(by[t.sp]||0)+1; } console.log('trees',L.length,JSON.stringify(by));
for(const t of L.filter(t=>t.z>-58&&t.z<20).sort((a,b)=>a.z-b.z||a.x-b.x)) console.log(JSON.stringify(t));
