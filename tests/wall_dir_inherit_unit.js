/* 牆的淡出方向沿用上層節點（GLB-WALLDIR-1105，LAWWW2-C 11-05）：BB 的 Blender 套件把 extras.dir（往房間裡的法線）寫在空節點 WALL_back／WALL_left…，
   底下真正的網格（WALL_back_print…）沒有。zones3d.js 的 attachRoomGLB 原本一律當成 [0,0,1]：左、右、前牆在鏡頭從外面看的時候不淡出、擋住人。
   這支照 attachRoomGLB 真正跑一次（自己讀 GLB，照節點的名字、父子、TRS、extras 建場景，和 GLTFLoader 一樣），檢查：
   ① 每一塊 WALL_ 網格的 dir 都朝房間裡（dir 和「牆中心 → 房間中心」同方向）——日和便利店 cvs_interior.glb、林家乾麵 lin_interior.glb（有的話）
   ② 網格自己有 dir 的照舊（阿德影印 ade.glb、日常失速 daily_offbeat.glb）
   南洋戲院兩顆（nanyang3d.js 的 wallDirs 照位置先補了，不走這條）只印出來參考。用法：node tests/wall_dir_inherit_unit.js */
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
process.on('unhandledRejection',()=>{});
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(THREE|THREE_JSM|P3|ASSETS|W3|E3|TK|CK|Z3)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); }
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

function run(rel){ const f=path.join(ROOT,rel); if(!fs.existsSync(f)) return null; const root=glbScene(f), g0=new THREE.Group(), fb=new THREE.Group(); g0.add(fb);
  const z={walls:[],wins:null,winParts:[]}; Z3.attachRoomGLB(z,g0,fb,root); root.updateMatrixWorld(true);
  const W=[]; root.traverse(o=>{ if(o.isMesh&&/WALL_/.test(o.name)) W.push(o); }); if(!W.length) return {n:0,bad:[]};
  const cx=W.reduce((s,o)=>s+o.userData.center.x,0)/W.length, cz=W.reduce((s,o)=>s+o.userData.center.z,0)/W.length;
  const bad=W.filter(o=>{ const c=o.userData.center, d=o.userData.dir, tx=cx-c.x, tz=cz-c.z, L=Math.hypot(tx,tz); if(L<0.3) return false; return d.x*tx/L+d.z*tz/L<0.5; }).map(o=>o.name+' dir('+[o.userData.dir.x,o.userData.dir.z].join(',')+')');
  return {n:W.length,bad}; }
for(const [rel,nm] of [['assets/models/env/second_ai/bb_support/cvs_interior.glb','日和便利店'],['assets/models/env/second_ai/bb_support/lin_interior.glb','林家乾麵 v1c']]){ const r=run(rel); if(!r){ console.log('略過 '+nm+'：'+rel+' 不在'); continue; }
  check(`① ${nm}：${r.n} 塊 WALL_ 網格的淡出方向都朝房間裡（沿用上層節點的 extras.dir）`,r.n>0&&!r.bad.length,r.bad.slice(0,6).join('｜')); }
for(const [rel,nm] of [['assets/models/env/second_ai/bb_support/ade.glb','阿德影印'],['assets/models/env/second_ai/aa_support/daily_offbeat.glb','日常失速']]){ const r=run(rel); if(!r){ console.log('略過 '+nm); continue; }
  check(`② ${nm}：網格自己有 dir 的照舊（${r.n} 塊都朝房間裡）`,r.n>0&&!r.bad.length,r.bad.slice(0,6).join('｜')); }
for(const [rel,nm] of [['assets/models/env/second_ai/bb_support/nanyang_lobby.glb','南洋大廳'],['assets/models/env/second_ai/bb_support/nanyang_hall.glb','南洋 1 廳']]){ const r=run(rel); if(r) console.log(`參考 ${nm}：${r.n} 塊，上層 dir 朝外的 ${r.bad.length} 塊（遊戲裡 nanyang3d.js 的 wallDirs 先照位置補，不走這條）${r.bad.length?'：'+r.bad.slice(0,4).join('｜'):''}`); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
