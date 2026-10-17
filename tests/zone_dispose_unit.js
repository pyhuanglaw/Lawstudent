// 換區域時舊區域的材質、貼圖要釋放（2026-10-14 使用者 iPhone 試玩 v9.6：「有時候換地點或按到什麼，會跳出跑到進入遊戲的畫面，顯示請把手機轉為橫向」——
// 疑似 iOS Safari 記憶體到上限、整個網頁重新載入：engine3d.js 的 disposeGroup 原本只釋放幾何，材質和貼圖留在顯示記憶體，每換一次區域就多一批）。
// 不需要瀏覽器：在 Node 裡建出區域，對群組裡每個材質、貼圖聽 dispose 事件，呼叫 E.disposeGroup：
//   1. 校園、便利商店、溫州街：群組裡沒有標 shared 的材質、貼圖全部釋放；標了 userData.shared 的不釋放；
//   2. 修正前的 disposeGroup（git 上一版）貼圖一張都沒釋放——這個測試在有 bug 的版本失敗；
//   3. 釋放以後同一個區域可以再建一次（材質、貼圖的資料還在，three.js 之後會重新上傳）。
// 瀏覽器版（顯示記憶體真的有降下來）：tests/zone_memory.py。用法：node tests/zone_dispose_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(new Error('no fetch in node')); const _w=console.warn; console.warn=()=>{};
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/dorm_room_layout.js','src/data/socsci_layout.js','src/data/linze_layout.js','src/data/classroom_layout.js','src/building3d.js'];
for(const f of files){ if(!fs.existsSync(path.join(ROOT,f))) continue; let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
function build(id){ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; return Z3.ZONES[id].build(E); }
const odd=[]; function census(g){ const mats=new Set(), texs=new Set(); g.traverse(o=>{ const ms=o.material?(Array.isArray(o.material)?o.material:[o.material]):[]; for(const m of ms){ if(!m||!m.isMaterial){ if(m) odd.push(o.name||o.type); continue; } mats.add(m); for(const k in m){ const v=m[k]; if(v&&v.isTexture) texs.add(v); } } }); return {mats,texs}; }
function run(dispose,g){ const {mats,texs}=census(g); const dm=new Set(), dt=new Set(); for(const m of mats) m.addEventListener('dispose',()=>dm.add(m)); for(const t of texs) t.addEventListener('dispose',()=>dt.add(t)); dispose(g);
  const shM=[...mats].filter(m=>m.userData&&m.userData.shared), shT=[...texs].filter(t=>t.userData&&t.userData.shared);
  return {mats:mats.size,texs:texs.size,dm:dm.size,dt:dt.size,shM:shM.length,shT:shT.length,shDisposed:shM.some(m=>dm.has(m))||shT.some(t=>dt.has(t)),missT:[...texs].filter(t=>!(t.userData&&t.userData.shared)&&!dt.has(t)).length,missM:[...mats].filter(m=>!(m.userData&&m.userData.shared)&&!dm.has(m)).length}; }
for(const id of ['campus','cvs','wenzhou']){ if(!Z3.ZONES[id]) continue; const z=build(id); const r=run(E.disposeGroup,z.group);
  check('1. '+id+'：沒標 shared 的材質、貼圖全部釋放',r.missT===0&&r.missM===0&&r.texs>0,JSON.stringify(r)); check('1. '+id+'：標了 shared 的不釋放',!r.shDisposed,'shared 材質 '+r.shM+'、貼圖 '+r.shT); }
check('1. 不是材質的 .material（例如自訂物件）不會讓換區域出錯（略過）',true,odd.length?('略過 '+odd.length+' 個：'+[...new Set(odd)].slice(0,5).join('、')):'沒有');
// 標了 shared 的
{ const g=new THREE.Group(); const t=new THREE.Texture(); t.userData.shared=true; const m=new THREE.MeshBasicMaterial({map:t}); const t2=new THREE.Texture(); const m2=new THREE.MeshBasicMaterial({map:t2}); m2.userData.shared=true; g.add(new THREE.Mesh(new THREE.PlaneGeometry(1,1),m)); g.add(new THREE.Mesh(new THREE.PlaneGeometry(1,1),m2));
  const r=run(E.disposeGroup,g); check('1. 標了 userData.shared 的貼圖／材質（和用它的東西）留著',r.dt===0&&r.dm===1,JSON.stringify(r)); }
// 3. 再建一次
{ let ok=true, err=''; try{ const z=build('campus'); E.disposeGroup(z.group); const z2=build('campus'); ok=!!z2.group; }catch(e){ ok=false; err=e.message; } check('3. 釋放以後同一個區域可以再建一次',ok,err); }
// 2. 修正前
{ let old=null; try{ const git=a=>cp.execSync('git '+a,{cwd:ROOT,encoding:'utf8',maxBuffer:64<<20,stdio:['ignore','pipe','ignore']}); const first=git('log --format=%H -S E.lastDispose -- src/engine3d.js').trim().split('\n').filter(Boolean).pop(); old=git('show '+(first?first+'^':'HEAD')+':src/engine3d.js'); }catch(e){}
  const m=old&&old.match(/  function disposeGroup\(g\)\{[^\n]*\}\n/); if(m&&!/lastDispose/.test(m[0])){ const oldFn=vm.runInThisContext('(function(){'+m[0]+' return disposeGroup; })')(); const z=build('campus'); const r=run(oldFn,z.group);
    check('2. 修正前的 disposeGroup：校園的貼圖一張都沒釋放（有 bug 的版本在第 1 項失敗）',r.dt===0&&r.texs>20,JSON.stringify({貼圖:r.texs,釋放:r.dt,材質:r.mats,材質釋放:r.dm})); }
  else console.log('（略過第 2 項：找不到修正前的版本）'); }
console.warn=_w; console.log(fails?'FAILED: '+fails:'ALL PASS'); process.exit(fails?1:0);
