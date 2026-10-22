// 宿舍四人房（大一 203、經濟系 412、大二～大四）的正式模型載入以後，seethru_ 材質真的會網點透空；洗手間的牆磚、地磚有補光——不需要瀏覽器。
// 原本：attachDormInterior 只把 seethru_ 材質標成 userData.seeThrough，沒有 patch shader；正式模型是進區域以後才載入的，
//       引擎進區域時那一次整理（engine3d.js enter）已經過了——上舖從來沒有透空過（LAWWW2 2026-10-21 查宿舍 412 時查到）。
// 洗手間：牆磚 dorm_bath_tile、地磚 dorm_bath_floor 不在 DORM_BOUNCE 裡，沒有補光；鏡頭在房間正面、正面牆淡出時看進洗手間是一整片暗灰色（經濟系 412 每天早上的第一個畫面）。
// 做法（src/zones3d.js）：區域實體 z.seeThru＝true（引擎看的是實體，不是定義；第二版以前只寫在定義上，室內透空從來沒開過）；標記的同時呼叫 E3.patchSeeThrough；大三、大四的物件（dorm_y3_items）也一樣。洗手間的兩個材質加進 DORM_BOUNCE（和房間的牆、地板同一級）。
// 檢查（自己讀 dorm_room4.glb，Node 沒有 fetch）：每一個 seethru_ 材質都 patch 過（userData._st）；洗手間的牆磚、地磚有補光（TK.bounce：userData.bounce、emissiveMap＝貼圖），和房間的牆、地板一樣。
// 用法：node tests/dorm_seethru_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(new Error('no fetch in node'));
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/dorm_room_layout.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(THREE|THREE_JSM|P3|ASSETS|W3|E3|TK|CK|Z3|DORM_ROOM)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
/* 自己讀 GLB：照節點的名字、父子、TRS、extras 建場景；網格只放位置、索引；材質名照 GLB（每個材質一個物件，和 GLTFLoader 一樣共用）*/
function glbScene(file){ const b=fs.readFileSync(file), jl=b.readUInt32LE(12), J=JSON.parse(b.slice(20,20+jl).toString('utf8')), bin=b.slice(20+jl+8);
  const acc=i=>{ const a=J.accessors[i], v=J.bufferViews[a.bufferView], n={SCALAR:1,VEC2:2,VEC3:3,VEC4:4}[a.type], off=(v.byteOffset||0)+(a.byteOffset||0);
    const T={5126:Float32Array,5125:Uint32Array,5123:Uint16Array,5121:Uint8Array}[a.componentType]; return new T(bin.buffer.slice(bin.byteOffset+off,bin.byteOffset+off+a.count*n*T.BYTES_PER_ELEMENT)); };
  const mats=(J.materials||[]).map(m=>{ const t=new THREE.MeshStandardMaterial(); t.name=m.name||''; return t; });
  const objs=J.nodes.map(nd=>{ let o;
    if(nd.mesh!=null&&!(nd.extensions&&nd.extensions.EXT_mesh_gpu_instancing)){ const prs=J.meshes[nd.mesh].primitives.map(pr=>{ const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(acc(pr.attributes.POSITION),3)); if(pr.indices!=null) g.setIndex(new THREE.BufferAttribute(acc(pr.indices),1));
        return new THREE.Mesh(g,pr.material!=null?mats[pr.material]:new THREE.MeshStandardMaterial()); });
      if(prs.length===1) o=prs[0]; else { o=new THREE.Group(); for(const q of prs) o.add(q); } }
    else o=new THREE.Object3D();
    o.name=nd.name||''; if(nd.extras) o.userData=JSON.parse(JSON.stringify(nd.extras)); if(nd.translation) o.position.fromArray(nd.translation); if(nd.rotation) o.quaternion.fromArray(nd.rotation); if(nd.scale) o.scale.fromArray(nd.scale); return o; });
  J.nodes.forEach((nd,i)=>{ for(const c of nd.children||[]) objs[i].add(objs[c]); });
  const sc=new THREE.Group(); for(const r of J.scenes[J.scene||0].nodes) sc.add(objs[r]); return sc; }
(async()=>{
  const SC=glbScene(path.join(ROOT,'assets/models/env/second_ai/dorm_room4.glb')); let pend=null;
  ASSETS.loadOne=k=>k==='bldg.dorm_room4'?(pend=Promise.resolve({scene:SC})):new Promise(()=>{});
  const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'}; E.ray=E.ray||new THREE.Raycaster();
  E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null;
  E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0,seat:null,pose:'idle'};
  const z=Z3.ZONES.dorm.build(E); E.zone=z; E.nav=z.nav; await pend; await new Promise(r=>setTimeout(r,0)); z.group.updateMatrixWorld(true);
  check('1. 宿舍區域開網點透空（區域實體的 seeThru：engine3d.js 的 updateSeeThrough 看 E.zone.seeThru）、正式模型接上了',z.seeThru===true&&!!z.dormRoot,'z.seeThru='+z.seeThru+'、定義 '+Z3.ZONES.dorm.seeThru);
  const st=new Map(); z.group.traverse(o=>{ if(o.isMesh&&o.material&&/^seethru_/.test(o.material.name)) st.set(o.material.name,o.material); });
  const notPatched=[...st.values()].filter(m=>!(m.userData.seeThrough&&m.userData._st)).map(m=>m.name);
  check('2. seethru_ 材質（'+st.size+' 個）都標記、也 patch 過 shader（userData._st）——正式模型是進區域以後才載入的',st.size>=8&&!notPatched.length,'沒有 patch：'+notPatched.slice(0,6).join('、'));
  const mats=new Map(); z.group.traverse(o=>{ if(o.isMesh&&o.material) mats.set(o.material.name,o.material); });
  const want=['dorm_bath_tile','dorm_bath_floor','dorm_wall','dorm_floor'], miss=want.filter(n=>!mats.has(n)), dark=want.filter(n=>mats.has(n)&&!mats.get(n).userData.bounce);
  check('3. 洗手間的牆磚、地磚有補光，和房間的牆、地板一樣（TK.bounce）——剖面視角看進洗手間不再是一整片暗灰色',!miss.length&&!dark.length,(miss.length?'找不到：'+miss.join('、')+'；':'')+(dark.length?'沒有補光：'+dark.join('、'):''));
  console.log(fails?`${fails} FAIL`:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });
