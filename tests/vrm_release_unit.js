// BUG-01 zone_memory（2026-10-16）：還 VRM 骨架 clone 時要釋放它自己的骨架貼圖（Skeleton.boneTexture）；原本那一個（tpl）重用、不釋放；共用的幾何、材質不釋放。
// GPU 貼圖追蹤（scratchpad leak/tex_leak3.py）：回到校園一次多 70～80 張活著的 GPU 貼圖，全部是路人 VRM clone 的 boneTexture（DataTexture）。
// 修改前：clone 還回去以後 boneTexture 還在（第 2 項失敗）。用法：node tests/vrm_release_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path'); const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.navigator={userAgent:'node'}; global.document={createElement:()=>({getContext:()=>null,style:{}}),createElementNS:()=>({style:{}})};
for(const f of ['lib/three.bundle.js','src/assets3d.js']) vm.runInThisContext(fs.readFileSync(path.join(ROOT,f),'utf8').replace(/^const (ASSETS)\s*=/m,'globalThis.$1='),{filename:f});
let fails=0; const check=(n,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+n+(info?'　'+info:'')); if(!ok) fails++; };
const geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.Float32BufferAttribute([0,0,0,1,0,0,0,1,0],3)); geo.setAttribute('skinIndex',new THREE.Uint16BufferAttribute([0,0,0,0,0,0,0,0,0,0,0,0],4)); geo.setAttribute('skinWeight',new THREE.Float32BufferAttribute([1,0,0,0,1,0,0,0,1,0,0,0],4));
const mat=new THREE.MeshBasicMaterial({map:new THREE.Texture()});
const mk=()=>{ const scene=new THREE.Group(); const bone=new THREE.Bone(); scene.add(bone); const meshes=[]; for(let i=0;i<3;i++){ const m=new THREE.SkinnedMesh(geo,mat); m.bind(new THREE.Skeleton([bone])); m.skeleton.computeBoneTexture(); scene.add(m); meshes.push(m); } return {vrm:{scene},meshes}; };
const T=mk(), C=mk(); ASSETS.cache['t.vrm']={vrm:true,tpl:{vrm:T.vrm,inUse:true},clones:[{vrm:C.vrm,inUse:true}]};
const disposed=new Set(); for(const m of [...T.meshes,...C.meshes]) m.skeleton.boneTexture.addEventListener('dispose',e=>disposed.add(e.target));
let geoD=false, matD=false, mapD=false; geo.addEventListener('dispose',()=>geoD=true); mat.addEventListener('dispose',()=>matD=true); mat.map.addEventListener('dispose',()=>mapD=true);
const cBT=C.meshes.map(m=>m.skeleton.boneTexture);
ASSETS.releaseVRM('t.vrm',C.vrm);
check('1. clone 從池子拿掉',ASSETS.cache['t.vrm'].clones.length===0);
check('2. clone 的骨架貼圖（每個 SkinnedMesh 一張）都釋放了',cBT.every(t=>disposed.has(t))&&C.meshes.every(m=>m.skeleton.boneTexture===null),disposed.size+' 張');
check('3. 共用的幾何、材質、材質貼圖沒有被釋放',!geoD&&!matD&&!mapD);
const tBT=T.meshes.map(m=>m.skeleton.boneTexture); ASSETS.releaseVRM('t.vrm',T.vrm);
check('4. 原本那一個（tpl）：標成可以重用，骨架貼圖不釋放',ASSETS.cache['t.vrm'].tpl.inUse===false&&tBT.every(t=>t&&!disposed.has(t)));
ASSETS.releaseVRM('t.vrm',C.vrm); check('5. 同一個 clone 還第二次：不會出錯、不重複釋放',disposed.size===3);
console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
