// 兩點半 Café 的吊燈：電線擋住玩家時網點透空、光暈白天不亮而且變小（ART-ECON-3D-GAP-1021，LAWWW2 2026-10-21）——不需要瀏覽器。
// 原本（經濟系巡場景）：①跟隨鏡頭貼著吊燈電線經過時，整根電線是一條黑色直條擋在畫面中間、從人身上切過去；
//       ②吊燈光暈 1.2 m、白天晚上都 0.45，從上面往下看剛好疊在桌面、地上，像飄著的白點。
// 做法：cafe_interior.glb 的電線改用 seethru_cafe_cord 材質（cafe_layout.py），Café 區域開 seeThru、正式模型載入時 patch；光暈改 0.55 m、白天 0、晚上 0.4（cafe_interior.py）。
// 檢查（自己讀 cafe_interior.glb）：區域開網點透空；電線材質標記並 patch；吊燈光暈白天不亮、大小 ≤ 0.6 m、晚上看得到。
// 用法：node tests/cafe_seethru_unit.js
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
  const SC=glbScene(path.join(ROOT,'assets/models/env/second_ai/cafe_interior.glb')); let pend=null;
  ASSETS.loadOne=k=>k==='bldg.cafe_interior'?(pend=Promise.resolve({scene:SC})):new Promise(()=>{});
  const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'}; E.ray=E.ray||new THREE.Raycaster();
  E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null;
  E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0,seat:null,pose:'idle'};
  const z=Z3.ZONES.cafe.build(E); E.zone=z; E.nav=z.nav; await pend; await new Promise(r=>setTimeout(r,0)); z.group.updateMatrixWorld(true);
  check('1. Café 區域開網點透空（區域實體的 seeThru：engine3d.js 的 updateSeeThrough 看 E.zone.seeThru）、正式模型接上了',z.seeThru===true&&z.formal===true,'z.seeThru='+z.seeThru+'、定義 '+Z3.ZONES.cafe.seeThru);
  const cords=[]; z.group.traverse(o=>{ if(o.isMesh&&o.material&&o.material.name==='seethru_cafe_cord') cords.push(o); });
  check('2. 吊燈電線（seethru_cafe_cord）在、標記也 patch 過（擋住玩家時網點透空）',cords.length>0&&cords.every(o=>o.material.userData.seeThrough&&o.material.userData._st),cords.length+' 個網格');
  const pend_=[]; SC.traverse(o=>{ if(/^GLOW_pendant/.test(o.name)) pend_.push(o.userData); });
  const sprites=[]; z.group.traverse(o=>{ if(o.isSprite&&o.userData&&o.userData.dayO!=null) sprites.push(o); });
  const pendS=sprites.filter(s=>Math.abs(s.scale.x-(pend_[0]&&pend_[0].size||-1))<1e-6);
  check('3. 吊燈光暈（'+pend_.length+' 個）白天不亮、大小 ≤ 0.6 m、晚上看得到',pend_.length>=7&&pend_.every(d=>d.day===0&&d.size<=0.6&&d.night>=0.3)&&pendS.length>=pend_.length&&pendS.every(s=>s.userData.dayO===0),JSON.stringify(pend_[0]||null)+'；遊戲裡的光暈 '+pendS.length+' 個');
  console.log(fails?`${fails} FAIL`:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });
