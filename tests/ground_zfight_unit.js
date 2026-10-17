// 地面上同一個高度、互相重疊的平面（z-fighting：畫面一直閃）——2026-10-14 使用者試玩 v9.6 回報「男一舍前面的地板一直閃爍」：
// 男一舍的步道（zones3d.js strip，0.02 m）和東西向的柏油路（也是 0.02 m）在 (20,47) 交叉；校園共 11 處步道／路面交叉都一樣。
// 不需要瀏覽器：在 Node 裡建出戶外區域，找「看得到、不透明、水平、高度差 < 0.5 mm、互相重疊」的 PlaneGeometry 平面，
// 兩片的 polygonOffset 一樣（都沒有、或同一層）就算會閃。
//   1. 校園：0 處會閃（男一舍前 (20,47) 那一處一定要分出上下：柏油路在上面）；
//   2. 修正前的 zones3d.js（git 的上一版）校園至少 11 處——這個測試在有 bug 的版本失敗；
//   3. 步道、路面的高度不變（0.02 m：導航、點地面、腳步不受影響），沒有重疊的步道不加 polygonOffset。
// 用法：node tests/ground_zfight_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(new Error('no fetch in node')); const _w=console.warn, _e=console.error; console.warn=()=>{}; console.error=()=>{};
const base=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js'];
for(const f of base){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }
const after=['src/data/linze_layout.js','src/data/classroom_layout.js','src/building3d.js'];
function loadZones(src){ vm.runInThisContext(src.replace(/^const (\w+)\s*=/m,'globalThis.$1='),{filename:'zones3d.js'}); for(const f of after){ if(!fs.existsSync(path.join(ROOT,f))) continue; vm.runInThisContext(fs.readFileSync(path.join(ROOT,f),'utf8').replace(/^const (\w+)\s*=/m,'globalThis.$1='),{filename:f}); } return Z3; }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
function flats(Z,zone){ const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'}; E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[];
  const z=Z.ZONES[zone].build(E); E.scene.updateMatrixWorld(true); if(z.group&&!z.group.parent) z.group.updateMatrixWorld(true);
  const out=[]; const B=new THREE.Box3(); const seen=new Set();
  const visit=o=>o.traverse(m=>{ if(!m.isMesh||seen.has(m)) return; seen.add(m); if(!m.geometry||m.geometry.type!=='PlaneGeometry') return; const mt=Array.isArray(m.material)?m.material[0]:m.material; if(!mt||mt.visible===false||mt.transparent||mt.colorWrite===false||!m.visible) return;
    m.geometry.computeBoundingBox(); B.copy(m.geometry.boundingBox).applyMatrix4(m.matrixWorld); if(B.max.y-B.min.y>0.01) return;
    out.push({m,y:(B.min.y+B.max.y)/2,x0:B.min.x,x1:B.max.x,z0:B.min.z,z1:B.max.z,po:mt.polygonOffset?mt.polygonOffsetFactor+'/'+mt.polygonOffsetUnits:'0'}); });
  visit(E.scene); if(z.group) visit(z.group); return out; }
function fighting(F){ const bad=[]; for(let i=0;i<F.length;i++) for(let j=i+1;j<F.length;j++){ const a=F[i], b=F[j]; if(Math.abs(a.y-b.y)>0.0005) continue; const ox=Math.min(a.x1,b.x1)-Math.max(a.x0,b.x0), oz=Math.min(a.z1,b.z1)-Math.max(a.z0,b.z0); if(ox<=0.05||oz<=0.05) continue; if(a.po!==b.po) continue;
    bad.push({x:+((Math.max(a.x0,b.x0)+Math.min(a.x1,b.x1))/2).toFixed(1),z:+((Math.max(a.z0,b.z0)+Math.min(a.z1,b.z1))/2).toFixed(1),y:+a.y.toFixed(3)}); } return bad; }
// 修正後（目前的程式）
const Znow=loadZones(fs.readFileSync(path.join(ROOT,'src/zones3d.js','src/data/dorm_room_layout.js'),'utf8'));
const Fc=flats(Znow,'campus'), badC=fighting(Fc);
check('1. 校園：同一個高度互相重疊的地面 0 處',badC.length===0,badC.length+' 處 '+JSON.stringify(badC.slice(0,8)));
const dorm=Fc.filter(f=>f.x0<=20&&f.x1>=20&&f.z0<=47&&f.z1>=47&&Math.abs(f.y-0.02)<0.001);
const road=dorm.find(f=>f.m.material.map&&f.m.material.map.userData&&f.m.material.map.userData.asphalt), walk=dorm.find(f=>f!==road);
check('1. 男一舍前 (20,47)：步道和柏油路兩片，柏油路在上面（polygonOffset 比較大）',!!road&&!!walk&&(road.m.material.polygonOffsetUnits<walk.m.material.polygonOffsetUnits),road&&walk?('柏油路 '+road.po+'、步道 '+walk.po):'找不到兩片 '+dorm.length);
const strips=Fc.filter(f=>f.m.userData.stripLayer!==undefined);
check('3. 步道、路面高度都還是 0.02 m',strips.length>=15&&strips.every(f=>Math.abs(f.y-0.02)<0.0005),strips.length+' 片');
check('3. 沒有和別的路面重疊的不加 polygonOffset（層 0）',strips.filter(f=>f.m.userData.stripLayer===0).every(f=>!f.m.material.polygonOffset)&&strips.some(f=>f.m.userData.stripLayer===0));
for(const zone of ['gongguan','wenzhou']){ if(!Znow.ZONES[zone]) continue; const b=fighting(flats(Znow,zone)); console.log('（參考）'+zone+'：同高重疊 '+b.length+' 處 '+JSON.stringify(b.slice(0,6))); }
// 修正前
let old=null; try{ const git=a=>cp.execSync('git '+a,{cwd:ROOT,encoding:'utf8',maxBuffer:64<<20,stdio:['ignore','pipe','ignore']});   /* 修正前＝第一次出現 stripLayer 的那個 commit 的上一版 */
  const first=git('log --format=%H -S stripLayer -- src/zones3d.js').trim().split('\n').filter(Boolean).pop(); old=git('show '+(first?first+'^':'HEAD')+':src/zones3d.js'); }catch(e){}
if(old&&!/stripLayer/.test(old)){ const Zold=loadZones(old); const b=fighting(flats(Zold,'campus')); check('2. 修正前的 zones3d.js：校園至少 11 處會閃（有 bug 的版本在第 1 項失敗）',b.length>=11,b.length+' 處，含 (20,47)：'+b.some(q=>Math.abs(q.x-20)<1&&Math.abs(q.z-47)<1)); }
else console.log('（略過第 2 項：git 的上一版已經有修正，或這個 checkout 沒有歷史）');
console.warn=_w; console.error=_e; console.log(fails?'FAILED: '+fails:'ALL PASS'); process.exit(fails?1:0);
